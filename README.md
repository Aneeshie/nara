# Terminal

A modern terminal emulator built with **Rust** and **Tauri**, created as a long-term systems programming project.

The goal is to understand how terminal emulators work under the hood by building one from scratch, while keeping the architecture clean and extensible.

> **Status:** 🚧 Early development

---

## Goals

- Learn PTYs (Pseudo Terminals)
- Learn process management
- Understand terminal rendering
- Build a fast native desktop application
- Explore systems programming with Rust

---

## Planned Features

### Core

- [ ] Spawn a shell
- [ ] Display terminal output
- [ ] Handle keyboard input
- [ ] ANSI escape sequence support
- [ ] Resize handling

### UI

- [ ] Tabs
- [ ] Split panes
- [ ] Scrollback
- [ ] Search
- [ ] Themes

### Quality of Life

- [ ] Configuration file
- [ ] Session restoration
- [ ] Keyboard shortcuts
- [ ] Custom fonts

---

## Tech Stack

- Rust
- Tauri
- TypeScript
- React
- portable-pty
- Tokio

---

## Project Structure

```
.
├── src/            # Frontend
├── src-tauri/      # Rust backend
├── docs/           # Design documents
├── flake.nix
└── README.md
```

---

## Roadmap

### Version 0.1

- [ ] Launch application
- [ ] Spawn shell
- [ ] Display shell output
- [ ] Send keyboard input

### Version 0.2

- [ ] ANSI colors
- [ ] Scrollback
- [ ] Copy & Paste

### Version 0.3

- [ ] Tabs
- [ ] Split panes

### Version 1.0

A fully functional daily-driver terminal emulator.

---

## Why?

Most terminal emulators are built on decades of engineering decisions that are hidden from everyday users.

This project is an opportunity to learn how shells, PTYs, rendering, process management, and terminal protocols work by implementing them incrementally.

The focus is on understanding the underlying concepts rather than recreating every feature from existing terminals.

---

## License

MIT
