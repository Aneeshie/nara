use portable_pty::Child;
use std::io::Write;

pub struct TerminalSession {
    pub id: u32,
    pub title: String,
    pub child: Box<dyn Child + Send + Sync>,
    pub writer: Box<dyn Write + Send>,
}

impl TerminalSession {
    pub fn write(&mut self, input: &[u8]) -> anyhow::Result<()> {
        self.writer.write_all(input)?;
        self.writer.flush()?;

        Ok(())
    }


}
