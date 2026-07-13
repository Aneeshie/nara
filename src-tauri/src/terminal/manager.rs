use std::{collections::HashMap, f32::consts::E, path::PathBuf};

use crate::terminal::{
    osc::{event::OscEvent, parser::OscParser},
    session::TerminalSession,
};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::Serialize;
use std::io::Read;
use std::thread::spawn;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Serialize)]
struct TerminalCwdPayload {
    id: u32,
    path: String,
}

#[derive(Clone, Serialize)]
struct TerminalOutputPayload {
    id: u32,
    data: String,
}

pub struct TerminalManager {
    sessions: HashMap<u32, TerminalSession>,
    next_session_id: u32,
}

impl TerminalManager {
    //constructor
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            next_session_id: 1,
        }
    }

    //create session
    pub fn create_session(&mut self, title: String, app_handle: AppHandle) -> anyhow::Result<u32> {
        let id = self.next_session_id;

        let pty_system = native_pty_system();

        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        let bashrc = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("scripts")
            .join("bashrc");

        let mut cmd = CommandBuilder::new("bash");
        cmd.arg("--rcfile");
        cmd.arg(bashrc.to_string_lossy().to_string());
        cmd.arg("-i");
        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");

        let child = pair.slave.spawn_command(cmd)?;

        //reader
        let mut reader = pair.master.try_clone_reader()?;

        spawn(move || {
            let mut buf = vec![0; 4096];
            let mut parser = OscParser::new();

            loop {
                match reader.read(&mut buf) {
                    Ok(n) => match parser.feed(&buf[..n]) {
                        Ok(output) => {
                            println!("TEXT: {:?}", output.buffer);
                            println!("EVENTS: {:?}", output.events);

                            let data = String::from_utf8_lossy(&output.buffer).to_string();

                            for event in output.events {
                                match event {
                                    OscEvent::CurrentDirectory(path) => {
                                        println!("Current directory: {}", path);

                                        if let Err(e) = app_handle.emit(
                                            "terminal:cwd",
                                            TerminalCwdPayload { id, path },
                                        ) {
                                            eprintln!("Failed to emit cwd: {}", e);
                                        }
                                    }
                                }
                            }

                            let payload = TerminalOutputPayload { id, data };

                            if let Err(e) = app_handle.emit("terminal-output", payload) {
                                eprintln!("Failed to emit terminal output: {}", e);
                            }
                        }

                        Err(e) => {
                            eprintln!("Parser error: {}", e);
                        }
                    },

                    Ok(0) => {
                        // PTY closed
                        break;
                    }

                    Err(e) => {
                        eprintln!("Reader error: {}", e);
                        break;
                    }
                }
            }
        });

        //writer
        let writer = pair.master.take_writer()?;

        let session = TerminalSession {
            id,
            title,
            child,
            master: pair.master,
            writer,
        };

        self.sessions.insert(id, session);

        self.next_session_id += 1;

        Ok(id)
    }

    pub fn write_to_session(&mut self, id: u32, command: String) -> anyhow::Result<()> {
        let session = self
            .sessions
            .get_mut(&id)
            .ok_or_else(|| anyhow::anyhow!("Session {} not found", id))?;

        session.write(command.as_bytes())
    }

    pub fn resize_session(&mut self, id: u32, rows: u16, cols: u16) -> anyhow::Result<()> {
        let session = self
            .sessions
            .get_mut(&id)
            .ok_or_else(|| anyhow::anyhow!("Session {} not found", id))?;

        session.resize(rows, cols)
    }

    pub fn kill_session(&mut self, id: u32) -> anyhow::Result<()> {
        let session = self
            .sessions
            .get_mut(&id)
            .ok_or_else(|| anyhow::anyhow!("Session {} not found", id))?;

        session.kill()?;

        self.sessions.remove(&id);

        Ok(())
    }
}
