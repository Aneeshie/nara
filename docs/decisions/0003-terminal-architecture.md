# ADR 0003: PTY-Based Terminal Architecture

- **Status:** Accepted
- **Date:** 2026-07-12

## Context

Nara requires an interactive terminal capable of running a real shell (e.g. `bash` or `zsh`) while providing low-latency communication between the backend and the frontend.

The architecture must support:

- Multiple independent terminal sessions
- Continuous terminal output
- Asynchronous user input
- Future features such as tabs, SSH, session restoration, and resizing

## Decision

Each terminal session owns its own PTY (Pseudo Terminal).

When a session is created:

1. A PTY pair is created.
2. A shell process is spawned on the slave side.
3. The writer is stored inside the `TerminalSession`.
4. The reader is moved into a dedicated background thread.
5. The reader thread continuously reads output from the PTY and emits events to the frontend through Tauri.

Terminal output is streamed to the frontend instead of being synchronously requested.

The frontend renders all received bytes using xterm.js.

## Architecture

```text
                   React
                      ▲
                      │
               xterm.js
                      ▲
                      │
          terminal-output events
                      ▲
                      │
               Tauri Event Bus
                      ▲
                      │
             Reader Thread (loop)
                      ▲
                      │
                 PTY Reader


Keyboard
    │
    ▼
React
    │
invoke()
    │
Tauri Command
    │
TerminalManager
    │
TerminalSession
    │
PTY Writer
    │
Shell (bash/zsh)
```

## Responsibilities

### TerminalManager

Responsible for:

- Creating terminal sessions
- Storing sessions
- Looking up sessions by ID
- Routing input to the appropriate session

The manager does **not** read terminal output.

### TerminalSession

Responsible for:

- Owning the PTY writer
- Owning the child process
- Writing user input into the PTY

The session does **not** continuously read terminal output.

### Reader Thread

Responsible for:

- Owning the PTY reader
- Continuously reading bytes from the PTY
- Emitting terminal output events through Tauri

The reader thread is the sole owner of the PTY reader.

### Frontend

Responsible for:

- Listening for `terminal-output` events
- Rendering received bytes using xterm.js
- Forwarding keyboard input to the backend

## Rationale

Terminal communication is fundamentally stream-based rather than request-response.

A shell continuously produces output independently of user input.

Separating reading and writing allows:

- Non-blocking terminal output
- Independent input/output pipelines
- Simpler ownership model
- Better scalability for multiple sessions

Moving the PTY reader into a dedicated thread ensures there is a single owner responsible for consuming terminal output.

## Consequences

### Advantages

- Clean separation of responsibilities
- Continuous terminal output
- Simple ownership model
- Easy integration with xterm.js
- Naturally supports multiple terminal sessions

### Trade-offs

- One reader thread per terminal session
- Event-based communication introduces additional serialization
- Future synchronization will be required for terminal resizing and session lifecycle management

## Future Work

- Stream keyboard input from xterm.js to the PTY writer
- Support terminal resizing
- Add multiple terminal tabs
- Add session lifecycle management
- Support SSH-backed sessions
- Persist terminal metadata
