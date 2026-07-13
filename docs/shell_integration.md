# OSC Parser

## Motivation

Nara needs to know about terminal events that are not visible as printable text.

Examples include:

- Current working directory (OSC 7)
- Window title (OSC 0)
- Future shell integration (OSC 133)

xterm.js consumes OSC sequences for rendering but does not expose them as backend events. Nara therefore parses OSC sequences in the Rust backend and converts them into typed events.

---

## Architecture

PTY
        │
        ▼
Reader Thread
        │
        ▼
OscParser
        │
        ├── Printable Text ───────► xterm.js
        │
        └── OscEvents ────────────► Nara

The parser observes the PTY byte stream while preserving printable output.

---

## Parser

The parser operates on a stream of bytes.

Every read() appends newly received bytes into an internal buffer.

The parser scans the stream looking for

ESC ]

which marks the beginning of an OSC sequence.

Once found, bytes are collected until BEL.

If BEL is not yet available, parsing stops and the remaining bytes stay inside the parser buffer until the next read().

---

## ParserOutput

The parser returns

- printable bytes
- parsed OSC events

```rust
pub struct ParserOutput {
    pub text: Vec<u8>,
    pub events: Vec<OscEvent>,
}


---


```text
User
 │
 │ cd github
 ▼
Bash
 │
 │ updates $PWD
 ▼
PROMPT_COMMAND
 │
 │ emits OSC 7
 ▼
PTY
 │
 ▼
OscParser
 │
 ├── Text ─────────► xterm
 │
 └── CurrentDirectory("/Users/nara/github")
