# ADR 0005: Design-System UI Rewrite & Backend Integration Map

- **Status:** Accepted
- **Date:** 2026-07-13

## Context

Three exported design frames (`design/frame1.html`, `frame2.html`, `frame3.html`) defined a
target visual language for Nara: default active state, the ⌘⇧P command palette overlay, and
the zero-tabs empty state. The existing frontend (native `App.tsx`-owns-state architecture from
ADR 0004) was visually a placeholder — a generic dark theme with no titlebar chrome, no command
palette, no empty state, and a tab bar that didn't match the editor-tab metaphor in the design.

This ADR records the resulting UI rewrite, the exact token/architecture changes made, and — most
importantly for future work — a map of every place the frontend currently fabricates or stubs
data because a backend capability doesn't exist yet.

The terminal lifecycle architecture from ADR 0004 (`App.tsx` owns state, `TerminalHost` owns one
DOM node, `TerminalLayout`/`TerminalTabBar`/`TerminalViewport` stay presentation-only) was
preserved unchanged. This ADR only concerns the visual layer built on top of it, plus two real
backend bugs found and fixed along the way.

---

## Decision

### 1. Design tokens (`src/App.css`)

Replaced the placeholder dark palette with values taken 1:1 from the design frames:

```
background #0B0B0B   foreground #E5E5E5
primary    #FFFFFF   primary-foreground #0B0B0B   (used once: the empty-state CTA)
secondary  #1C1C1C   muted #161616   muted-foreground #707070
brand      #38BDF8   (sky blue — active-tab underline/icon, focus rings, palette highlights)
tertiary   #10B981   (green — background-activity dot, running-shell dot; NOT the same as brand)
destructive #EF4444
card       #121212   border #1A1A1A   input #1F1F1F
radius     8px → radius-sm 4px / radius-md 6px / radius-lg 8px
font-sans/heading: Geist Variable (self-hosted via @fontsource-variable/geist)
font-mono: JetBrains Mono Variable (unchanged, self-hosted)
```

`brand` (accent) and `tertiary` (activity) are intentionally two different tokens. Earlier
iterations conflated "this tab is active" with "something is running in the background" under a
single `success` color — the design frames make clear these are different signals and can be
true independently (an inactive tab can have background activity; an active tab is never itself
"activity").

The base font switched from mono-everywhere to Geist (sans) for UI chrome. `font-mono` is now
applied explicitly only where the design uses it: terminal content, tab labels, the status bar,
and keyboard-shortcut badges.

### 2. Titlebar (`src/components/titlebar/Titlebar.tsx`)

Rewritten from Windows-style icon buttons to the macOS-style chrome in the design: three
traffic-light dots (still wired to the same `onMinimize`/`onMaximize`/`onClose` callback props),
wordmark + version badge, a workspace indicator pill, a clickable ⌘⇧P badge, and a settings
trigger.

### 3. Tab bar (`TerminalTabBar.tsx`, `TerminalTab.tsx`)

Rewritten to the editor-tab look: `rounded-t-md`, a 2px accent underline on the active tab
instead of a floating pill, per-tab icons (see §5), an activity dot, inline double-click-to-rename,
a right-click context menu (shadcn `ContextMenu`), and a "No active sessions" label plus a
split-pane stub button when the design calls for them.

### 4. Viewport (`TerminalViewport.tsx`)

Fixed the panel background from `bg-card` to `bg-background` (the design keeps the terminal panel
flush with the app background, differentiated only by a 1px border) and corrected the padding to
match the design's `p-3` outer / `p-5` inner insets.

### 5. New components

- `TerminalEmptyState.tsx` — the zero-tabs screen (frame3), rendered by `TerminalLayout` as a
  pure conditional branch on `tabs.length`, still no state/invoke inside `TerminalLayout` itself.
- `StatusBar.tsx` — didn't exist before at all.
- `CommandPalette.tsx` — the ⌘⇧P overlay (frame2), built on shadcn's `Command`/`CommandDialog`.
- `SettingsSheet.tsx` — placeholder settings surface (shadcn `Sheet`).
- `tabIcon.ts` — a pure, deterministic title→icon heuristic (see §5 in the backend map below).

### 6. shadcn/ui additions

Added via `pnpm dlx shadcn add`: `separator`, `tooltip`, `context-menu`, `dialog`, `sheet`,
`command` (pulls in `cmdk`), `sonner` (toast notifications, pulls in `next-themes`). No custom
primitives were written — `Button`, `Tooltip`, `ContextMenu`, `Dialog`, `Sheet`, `Command`, and
`Toaster` are all the shadcn-generated components for this project's `base-lyra`/base-ui style.
The one exception, per the original brief, remains the terminal tab bar itself.

### 7. Two real backend bugs fixed

These were not part of the visual redesign, but were found and fixed while building it:

1. **`terminal-output` had no session id.** `manager.rs` emitted a bare `String`; with only one
   terminal this worked, but it made multi-tab output routing impossible. Fixed by emitting
   `{ id: u32, data: String }` (see `TerminalOutputPayload` in `manager.rs`). The frontend
   (`App.tsx`) was already written to expect this shape.
2. **Spawned shells had no `TERM`/`COLORTERM`.** `CommandBuilder::new("bash")` never set an
   environment, so the PTY's `TERM` depended entirely on however Nara's own process happened to be
   launched — unreliable, and outright absent for GUI-launched app bundles. Fixed by explicitly
   setting `TERM=xterm-256color` and `COLORTERM=truecolor` on the spawned command. This is what
   allows real programs run inside Nara (Neovim, `git diff`, `ls --color`, etc.) to reliably use
   256-color/truecolor output instead of silently degrading.

---

## Frontend → Backend API Map

What the frontend currently calls, and exactly what it expects back. This is the contract the
backend must keep stable (or version deliberately) for the frontend to keep working.

| Frontend call site | Command / Event | Payload sent | Payload expected back |
|---|---|---|---|
| `App.tsx: createTab()` | `invoke("create_terminal", { title })` | `{ title: string }` | `number` (new session id) |
| `createTerminalInstance.ts: onData` | `invoke("write_to_terminal", { id, input })` | `{ id: number, input: string }` | — |
| `createTerminalInstance.ts: onResize` | `invoke("resize_terminal", { id, rows, cols })` | `{ id: number, rows: number, cols: number }` | — |
| `App.tsx: closeTab()` | `invoke("kill_terminal", { id })` | `{ id: number }` | — |
| `App.tsx` (mount effect) | `listen("terminal-output", ...)` | — | `{ id: number, data: string }` **(assumption — see below)** |

**Flag:** the `terminal-output` payload shape (`{ id, data }`) is the one assumption in this
whole integration that isn't backed by a type shared between Rust and TypeScript — it's
duck-typed on both sides independently. If it ever drifts, output silently stops routing to the
right tab with no compile-time error on either side. Worth eventually sharing a single schema
(e.g. via `specta`/`tauri-specta` or a hand-maintained `.d.ts` generated from the Rust struct).

---

## Backend Integration Report

Every feature the UI renders but the backend doesn't drive yet, what's mocked today, and exactly
what backend work would unblock it.

### 1. Smart Tab Titles / Icons
- **Current status:** `getTabIcon()` (`src/components/terminal/tabIcon.ts`) is real, deterministic
  code — it maps a title string to an icon (`nvim`→file icon, `ssh`→terminal icon, `cargo
  run`→play icon). It's exercised on every render, but every tab is titled `"Terminal N"` by
  `App.tsx`, so in practice it always falls back to the generic icon.
- **Required backend change:** detect the foreground process running inside each PTY (or at
  minimum, the initial spawned command) and report it to the frontend.
- **Suggested API:**
  ```rust
  enum TerminalEvent {
      Output { id: u32, data: String },
      ForegroundProcessChanged { id: u32, process: String },
  }
  ```

### 2. Background Activity Indicator
- **Current status:** `TerminalTab.hasActivity` is a real, fully-rendered prop (pulsing
  `bg-tertiary` dot per the design). `App.tsx` never sets it to `true` on any tab — there is no
  signal to set it from.
- **Required backend change:** track whether a session's child process is still doing work while
  its tab is unfocused (e.g. still running, or has produced output since last focused) and emit a
  signal when that changes.
- **Suggested API:**
  ```rust
  enum TerminalEvent {
      ActivityChanged { id: u32, active: bool },
  }
  ```

### 3. Workspaces
- **Current status:** `Titlebar`'s workspace pill and the command palette's "Switch
  Workspace..." row are both hardcoded to the string `"default"`; selecting the palette row shows
  an honest "not available yet" toast instead of doing anything.
- **Required backend change:** a concept of a named group of sessions, persisted per project or
  per machine.
- **Suggested API:**
  ```rust
  fn create_workspace(name: String) -> u32;
  fn list_workspaces() -> Vec<Workspace>;
  fn switch_workspace(id: u32);
  ```

### 4. Session Metadata (shell + working directory)
- **Current status:** `StatusBar` hardcodes `shell = "bash"` (true today, but only because that's
  what `manager.rs` happens to spawn — the frontend has no way to ask) and a placeholder working
  directory. Not derived from any API.
- **Required backend change:** expose the shell binary and current working directory per session,
  ideally updated live as the user `cd`s (OSC 7 escape sequence parsing, or a periodic
  `/proc`/`lsof`-based poll, depending on platform).
- **Suggested API:**
  ```rust
  struct TerminalInfo { id: u32, shell: String, cwd: String }
  fn create_terminal(title: String) -> TerminalInfo; // or:
  fn get_session_info(id: u32) -> TerminalInfo;
  ```

### 5. Split Panes
- **Current status:** both the tab context menu's "Split Right/Down" items and the tab bar's
  split-icon button show an honest `toast.info(...)` explaining it isn't available.
- **Required backend change:** none, technically — a "pane" can just be another independent
  `create_terminal` session; the missing piece is a resizable multi-pane *layout engine* on the
  frontend, which is out of scope for this pass.
- **Suggested API:** N/A — frontend architecture work, not a backend contract change.

### 6. Notifications / Toasts
- **Current status:** the `Toaster` (sonner) is fully wired at the app root. Today it's used
  *only* for real `invoke()` failures (e.g. a failed `write_to_terminal` call) — nothing fake is
  toasted. The design's "Build completed" toast has no real trigger to hook into.
- **Required backend change:** emit lifecycle events for long-running or background commands.
- **Suggested API:**
  ```rust
  enum TerminalEvent {
      ProcessExited { id: u32, exit_code: i32, duration_ms: u64 },
  }
  ```

### 7. Settings Persistence
- **Current status:** `SettingsSheet` renders a static, dimmed preview of sections (Appearance,
  Keybindings, Shell, Workspaces) with no save/load and no effect on the app.
- **Required backend change:** a config store (e.g. a JSON/TOML file under the OS config
  directory) with read/write commands.
- **Suggested API:**
  ```rust
  fn get_settings() -> Settings;
  fn update_settings(patch: SettingsPatch);
  ```

### 8. Theme Switching
- **Current status:** the command palette's "Change Theme..." row shows a static `"Dark
  Obsidian"` label and stubs out on select.
- **Required backend change:** depends on #7 (settings persistence) plus a theme registry
  (bundled theme definitions + the currently selected one).
- **Suggested API:** part of the `Settings` model in #7 (e.g. `settings.theme: String`).

### 9. SSH Connections
- **Current status:** not implemented in any form — an `ssh prod`-style tab title in the design
  is just a string; there is no SSH transport anywhere in the app.
- **Required backend change:** a session type that tunnels a PTY over SSH instead of spawning a
  local process via `portable-pty`.
- **Suggested API:**
  ```rust
  fn create_ssh_terminal(host: String, user: String, title: String) -> u32;
  ```
  reusing the existing `write_to_terminal` / `resize_terminal` / `kill_terminal` contract so the
  frontend needs zero changes beyond how the session was created.

---

## Frontend Integration Checklist

- [ ] Replace `getTabIcon()`'s title-string heuristic with real per-session process metadata (#1)
- [ ] Populate `TerminalTab.hasActivity` from a real backend event (#2)
- [ ] Replace the hardcoded `"default"` workspace in `Titlebar`/`CommandPalette` with a real
      workspace list + switcher (#3)
- [ ] Replace `StatusBar`'s hardcoded shell/cwd constants with per-session data (#4)
- [ ] Design and build an actual resizable pane-splitting layout behind the existing Split
      Right/Down UI (#5)
- [ ] Wire real toasts for background process lifecycle events (#6)
- [ ] Build a real settings editor (form + persistence) behind `SettingsSheet` (#7)
- [ ] Wire "Change Theme..." to a real theme registry (#7/#8)
- [ ] Add an SSH session creation flow (#9)
- [ ] Share the `terminal-output` payload type between Rust and TypeScript instead of duck-typing
      it independently on both sides (see the API Map flag above)
- [ ] Nice-to-have: wire global `⌘R` to rename the *active* tab (today rename is only reachable
      via double-click or that tab's own context menu, since rename-mode is local state inside
      `TerminalTab`)

---

## Consequences

### Advantages
- The UI now matches the approved design frames pixel-for-pixel on tokens, spacing, and
  component structure, without touching the terminal lifecycle architecture from ADR 0004.
- Every mocked feature is discoverable in one place (this document) instead of scattered
  `// TODO` comments, with a concrete backend API sketched for each.
- Two real bugs (output routing, missing `TERM`) were caught and fixed as a side effect of
  building this UI against the real backend instead of a static mock.

### Trade-offs
- Several visible UI affordances (workspaces, split panes, SSH, settings, smart titles, activity
  dots, theme switching) are currently inert or stubbed with a toast. This is intentional per the
  brief ("keep the UI, don't remove the feature, document what's missing") but means the app
  currently promises more than the backend can deliver until the items in the checklist land.
- The `terminal-output` payload contract is unenforced at compile time on either side.

## Future Considerations

This document should be updated (or superseded by a new ADR) as each backend feature above is
implemented, moving its checklist item from "mocked" to "real" and removing its entry from the
Backend Integration Report.
