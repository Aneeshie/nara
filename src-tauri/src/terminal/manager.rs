use std::collections::HashMap;

use crate::terminal::session::TerminalSession;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::io::Read;
use std::thread::spawn;
use tauri::{AppHandle, Emitter};

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

        let cmd = CommandBuilder::new("bash");

        let child = pair.slave.spawn_command(cmd)?;

        //reader
        let mut reader = pair.master.try_clone_reader()?;

        spawn(move || {
            let mut buf = vec![0; 4096];

            loop {
                match reader.read(&mut buf) {
                    Ok(n) => {
                        let output = String::from_utf8_lossy(&buf[..n]).to_string();

                        if let Err(e) = app_handle.emit("terminal-output", output) {
                            eprintln!("Failed to emit terminal output: {}", e);
                        }
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
}
