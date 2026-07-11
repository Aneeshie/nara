# Architecture

## Overview

the terminal is divided into independent components, each with a single responsibility.

```
┌──────────────────────────────┐
│         Frontend             │
│  (React + xterm.js UI)       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Tauri IPC            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Terminal Manager        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Terminal Session        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      PTY (portable-pty)      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Shell (zsh / bash)       │
└──────────────────────────────┘
```

---


## Components

### Frontend

Responsible for:
    - Rendering terminal output
    - Capturing keyboard input
    - Managing tabs and layout

---

### Tauri IPC

Responsible for communication b/w the frontend and the Rust Backend.

---

### Terminal Manager

Responsible for:
    - PTY
    - Shell process
    - Output streaming

---

### PTY

Responsible for communication with the operating system.

Provides:
 - stdin
 - stdout
 - stderr

---

### Shell

Runs commands for example:
- zsh
- bash
- fish

