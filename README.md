# Nara

> **A terminal that understands your shell.**

Nara is a modern terminal emulator built with **Rust**, **Tauri**, and **React**. Instead of simply rendering terminal output, Nara understands shell events through shell integration and exposes them as structured application events, enabling smarter features without coupling the frontend to terminal escape sequences.

![Rust](https://img.shields.io/badge/Rust-1.89+-orange?logo=rust)
![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8DB?logo=tauri)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Nix](https://img.shields.io/badge/Nix-Flakes-5277C3?logo=nixos&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### Terminal Core

- Native PTY backend powered by `portable-pty`
- Multiple terminal sessions
- Dynamic terminal resizing
- Terminal lifecycle management
- Thread-safe session manager

### Shell Integration

- Custom shell integration
- OSC 7 (Current Working Directory) support
- Streaming OSC parser
- Typed terminal events
- Event-driven frontend updates

### Frontend

- Multi-tab terminal interface
- Dynamic tab titles
- xterm.js powered rendering
- Session-aware terminal management
- Optimized rendering with persistent terminal instances

---

## 🏗️ Architecture

Unlike traditional terminal emulators that only render bytes, Nara separates rendering from terminal intelligence.

```text
                        Shell
                          │
                OSC Escape Sequences
                          │
                          ▼
                       PTY Master
                          │
                          ▼
                  Reader Thread (Rust)
                          │
                          ▼
                     OSC Parser
               ┌──────────┴──────────┐
               │                     │
               ▼                     ▼
      Terminal Output          Typed Events
               │                     │
               ▼                     ▼
          xterm.js Renderer      Tauri Events
                                       │
                                       ▼
                               React Frontend
```

The frontend never needs to understand terminal escape sequences.

Instead, the backend translates terminal protocols into structured events that can power higher-level application features.

---

## 🚀 Getting Started

### Prerequisites

- Rust (latest stable)
- Node.js
- pnpm
- Tauri prerequisites for your operating system

---

### Option 1: Nix (Recommended)

If you're using Nix with flakes enabled:

```bash
nix develop
```

This will create a reproducible development environment with all required dependencies installed.

Then simply run:

```bash
pnpm install
pnpm tauri dev
```

---

### Option 2: Manual Setup

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/nara.git
cd nara
```

Install dependencies:

```bash
pnpm install
```

Run the application:

```bash
pnpm tauri dev
```

---

## 📂 Project Structure

```text
.
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── ...
│
├── src-tauri/
│   ├── terminal/
│   │   ├── manager.rs
│   │   ├── session.rs
│   │   ├── shell.rs
│   │   └── osc/
│   │       ├── parser.rs
│   │       ├── event.rs
│   │       └── mod.rs
│   └── ...
│
├── flake.nix
├── flake.lock
└── README.md
```

---

## 📡 Event Pipeline

Current shell events supported:

| Event | Description |
|--------|-------------|
| OSC 7 | Current working directory updates |

Example flow:

```text
Shell
   │
   └── OSC 7
          │
          ▼
Rust Parser
          │
          ▼
CurrentDirectory("/home/user/projects/nara")
          │
          ▼
Tauri Event
          │
          ▼
React updates the terminal tab title
```

Future events (such as command lifecycle and exit status) can be added without changing the frontend architecture.

---

## 🛠️ Tech Stack

### Backend

- Rust
- Tauri
- portable-pty
- anyhow
- serde

### Frontend

- React
- TypeScript
- xterm.js
- Tailwind CSS
- shadcn/ui

### Development

- pnpm
- Nix Flakes

---

## 🗺️ Roadmap

### Terminal Core

- [x] PTY support
- [x] Multi-session management
- [x] Dynamic resizing
- [x] Shell integration
- [x] OSC parser
- [x] Current working directory tracking
- [x] Dynamic terminal titles

### In Progress

- [ ] Split panes
- [ ] Pane tree architecture
- [ ] Keyboard shortcuts
- [ ] Session persistence

### Planned

- [ ] Workspace management
- [ ] Layout restoration
- [ ] Command lifecycle events (OSC 133)
- [ ] AI-assisted terminal workflows
- [ ] Plugin system

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are always welcome.

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 💡 Why Nara?

Modern terminal emulators have become incredibly fast at rendering text.

Nara explores a different problem:

> **What if the terminal understood what the shell was doing instead of simply displaying its output?**

By leveraging shell integration and a typed event pipeline, Nara provides a foundation for richer terminal experiences while keeping rendering and application logic cleanly separated.

---

## 📄 License

This project is licensed under the MIT License.
