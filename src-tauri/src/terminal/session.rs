use portable_pty::{Child, MasterPty, PtySize};
use std::io::Write;

pub struct TerminalSession {
    pub id: u32,
    pub title: String,
    pub child: Box<dyn Child + Send + Sync>,
    pub master: Box<dyn MasterPty + Send>,
    pub writer: Box<dyn Write + Send>,
}

impl TerminalSession {
    pub fn write(&mut self, input: &[u8]) -> anyhow::Result<()> {
        self.writer.write_all(input)?;
        self.writer.flush()?;

        Ok(())
    }

    pub fn resize(&self, rows: u16, cols: u16) -> anyhow::Result<()> {
        self.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
    }

    pub fn kill(&mut self) -> anyhow::Result<()> {
        self.child.kill();
        Ok(())
    }
}
