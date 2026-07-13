import { invoke } from "@tauri-apps/api/core";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";

import type { TerminalInstance } from "./types";

/**
 * Builds a single terminal's imperative handles (xterm instance + FitAddon)
 * and wires them to the existing backend commands.
 *
 * This is a plain factory function, not a hook - it has no lifecycle of its
 * own. It is called exactly once per session, by App.tsx, right after
 * `create_terminal` resolves with a session id. The returned instance is
 * stored in `terminalsRef` and handed to a `TerminalHost` for mounting.
 *
 * Wiring `onData`/`onResize` here (instead of inside TerminalHost) keeps all
 * `invoke()` calls in one place and lets TerminalHost stay a dumb DOM-mounting
 * component that only ever sees `terminal` and `fitAddon`.
 */
export function createTerminalInstance(id: number): TerminalInstance {
  const terminal = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: "JetBrains Mono, Menlo, monospace",
    theme: {
      background: "#121212",
      foreground: "#e5e5e5",
      cursor: "#6e7bff",
      cursorAccent: "#121212",
      selectionBackground: "rgba(110, 123, 255, 0.25)",
    },
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  terminal.onData((data) => {
    invoke("write_to_terminal", { id, input: data }).catch(console.error);
  });

  terminal.onResize(({ rows, cols }) => {
    invoke("resize_terminal", { id, rows, cols }).catch(console.error);
  });

  return { terminal, fitAddon };
}
