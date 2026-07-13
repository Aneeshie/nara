# ADR 0004: Frontend Terminal Architecture

- **Status:** Accepted
- **Date:** 2026-07-13

## Context

Nara originally supported only a single terminal session. As the application evolved to support multiple terminal tabs, the frontend architecture needed to satisfy several constraints:

- Each terminal session owns its own PTY and shell process.
- Each xterm.js `Terminal` instance must call `open()` exactly once during its lifetime.
- Terminal instances are imperative, mutable objects and should not be stored in React state.
- UI state should remain serializable and predictable.
- Backend communication should remain centralized.

The architecture should also allow future features such as split panes, workspaces, and SSH sessions without requiring significant refactoring.

---

## Decision

The frontend adopts a layered architecture separating application state, presentation, and terminal lifecycle.

### App.tsx

`App.tsx` owns all application state and backend communication.

Responsibilities include:

- Creating terminal sessions
- Destroying terminal sessions
- Managing active tabs
- Listening for terminal output
- Routing backend events
- Maintaining terminal instance references

---

### React State

React state stores only serializable UI state.

```ts
type TerminalTab = {
    id: number;
    title: string;
}
```

State includes:

- list of tabs
- active tab

Imperative objects are intentionally excluded.

---

### Terminal Instance Storage

xterm.js instances are stored in a `useRef` map.

```ts
Map<number, TerminalInstance>
```

where

```ts
type TerminalInstance = {
    terminal: Terminal
    fitAddon: FitAddon
}
```

Using `useRef` prevents unnecessary React re-renders while allowing direct access to mutable terminal objects.

---

### TerminalHost

Each terminal is mounted by its own `TerminalHost` component.

Responsibilities:

- Own exactly one DOM node
- Call `terminal.open()` exactly once
- Fit the terminal when necessary
- Focus the terminal when activated

A `TerminalHost` never creates a terminal instance and never communicates with the backend.

---

### TerminalLayout

`TerminalLayout` is a presentation component.

Responsibilities:

- Render the terminal layout
- Render the tab bar
- Render terminal hosts
- Forward callback props

It contains no backend logic and owns no application state.

---

### Terminal Output Routing

Terminal output events include the originating session ID.

Example payload:

```ts
{
    id: number,
    data: string
}
```

This allows the frontend to route PTY output directly to the corresponding xterm instance.

---

### Terminal Visibility

Each terminal remains mounted after creation.

Inactive terminals are hidden using CSS rather than unmounted.

This satisfies the xterm.js requirement that `Terminal.open()` is called only once for each instance while preserving terminal state and scrollback.

---

### Resize Handling

Each `TerminalHost` uses a `ResizeObserver` to detect container size changes.

When resized:

1. `fitAddon.fit()` recalculates the terminal dimensions.
2. xterm.js emits its resize event.
3. The frontend forwards the new rows and columns to the backend.

This avoids relying solely on browser window resize events and correctly handles layout changes.

---

## Consequences

### Advantages

- Clear separation between application logic and presentation.
- Terminal lifecycle matches xterm.js constraints.
- React state remains lightweight and serializable.
- Terminal instances persist across tab switches.
- Output routing naturally supports multiple concurrent sessions.
- Easily extensible for split panes, workspaces, and SSH sessions.

### Trade-offs

- Hidden terminals continue to consume memory.
- Additional mapping between session IDs and terminal instances is required.
- Terminal instances must be explicitly disposed when sessions are closed.

---

## Future Considerations

This architecture provides a foundation for:

- Split panes
- Workspace persistence
- SSH sessions
- Session restoration
- Plugin system
- Multiple windows
