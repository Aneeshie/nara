use super::event::OscEvent;

pub struct ParserOutput {
    pub buffer: Vec<u8>,
    pub events: Vec<OscEvent>,
}

enum ParserState {
    Normal,
    Osc,
}

pub struct OscParser {
    buffer: Vec<u8>,
    state: ParserState,
    osc_buffer: Vec<u8>,
}

impl OscParser {
    pub fn new() -> Self {
        Self {
            buffer: Vec::new(),
            state: ParserState::Normal,
            osc_buffer: Vec::new(),
        }
    }

    pub fn feed(&mut self, bytes: &[u8]) -> anyhow::Result<ParserOutput> {
        //add newly received bytes to any leftover bytes

        self.buffer.extend_from_slice(bytes);
        let mut output = ParserOutput {
            buffer: Vec::new(),
            events: Vec::new(),
        };

        let mut i = 0;
        while i < self.buffer.len() {
            //is this start os OSC???
            if self.buffer[i] == 0x1B && i + 1 < self.buffer.len() && self.buffer[i + 1] == b']' {
                //skip the ESC ] bytes
                i += 2;
                self.osc_buffer.clear();

                //collect all the bytes until BEL
                while i < self.buffer.len() && self.buffer[i] != b'\x07' {
                    self.osc_buffer.push(self.buffer[i]);
                    i += 1;
                }

                //didnt find
                // wait for the next read() then
                if i == self.buffer.len() {
                    break;
                }

                //skip BEL
                i += 1;

                let event = OscEvent::from_osc(&self.osc_buffer)?;
                output.events.push(event);

                self.osc_buffer.clear();
            } else {
                //normal printable byte.
                output.buffer.push(self.buffer[i]);
                i += 1;
            }
        }

        //keep only the bytes we couldn't parse as OSC
        self.buffer.drain(..i);
        Ok(output)
    }
}
