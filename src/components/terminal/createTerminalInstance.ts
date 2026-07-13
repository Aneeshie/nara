import { invoke } from "@tauri-apps/api/core";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { toast } from "sonner";

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
      background: "#0b0b0b",
      foreground: "#e5e5e5",
      cursor: "#38bdf8",
      cursorAccent: "#0b0b0b",
      selectionBackground: "rgba(56, 189, 248, 0.25)",
    },
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  terminal.onData((data) => {
    invoke("write_to_terminal", { id, input: data }).catch((error) => {
      console.error(error);
      toast.error("Couldn't send input to the terminal", { description: String(error) });
    });
  });

  terminal.onResize(({ rows, cols }) => {
    invoke("resize_terminal", { id, rows, cols }).catch((error) => {
      console.error(error);
      toast.error("Couldn't resize the terminal", { description: String(error) });
    });
  });

  return { terminal, fitAddon };
}
