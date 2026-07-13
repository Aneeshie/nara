#[derive(Debug)]
pub enum OscEvent {
    CurrentDirectory(String),
}

impl OscEvent {
    pub fn from_osc(buffer: &[u8]) -> anyhow::Result<Self> {
        let osc = std::str::from_utf8(buffer)?;

        let (code, payload) = osc
            .split_once(";")
            .ok_or_else(|| anyhow::anyhow!("Invalid osc sequence"))?;

        match code {
            "7" => Ok(OscEvent::CurrentDirectory(payload.to_string())),
            _ => Err(anyhow::anyhow!("Unknown osc code: {}", code)),
        }
    }
}
