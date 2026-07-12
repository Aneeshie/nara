import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

export default function TerminalView() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function init() {
      if (!terminalRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "JetBrains Mono, Menlo, monospace",
        theme: {
          background: "#0b0b0b",
          foreground: "#e5e5e5",
          cursor: "#ffffff",
          selectionBackground: "#2a2a2a",
        },
      });

      termRef.current = term;

      term.open(terminalRef.current);

      term.focus();

      // Listen for output from Rust
      unlisten = await listen<string>("terminal-output", (event) => {
        term.write(event.payload);
      });

      // Spawn the shell
      await invoke("create_terminal", {
        title: "Terminal 1",
      });
    }

    init();

    return () => {
      unlisten?.();
      termRef.current?.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0b0b0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={terminalRef}
        style={{
          width: "95%",
          height: "95%",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #222",
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
          background: "#0b0b0b",
        }}
      />
    </div>
  );
}
