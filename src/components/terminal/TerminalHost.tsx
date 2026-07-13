import { useEffect, useRef } from "react";
import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";

import { cn } from "#lib/utils";

interface TerminalHostProps {
  terminal: Terminal;
  fitAddon: FitAddon;
  isActive: boolean;
}

/**
 * Mounts exactly one xterm.js `Terminal` into exactly one DOM node, exactly
 * once, for the lifetime of the tab it belongs to.
 *
 * TerminalHost never receives the terminals map, tab list, or any callback -
 * only the two imperative handles for the session it renders, plus a boolean
 * for whether it's the visible tab. Every other tab's TerminalHost stays
 * mounted at the same time; this component is only ever hidden via CSS, never
 * unmounted, because `terminal.open()` may only be called once.
 */
export function TerminalHost({ terminal, fitAddon, isActive }: TerminalHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);

  // Open the terminal into this node exactly once. `terminal` is stable for
  // the lifetime of this component (it is created once in App.tsx and never
  // replaced), so this effect runs once on mount and never again.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasOpenedRef.current) return;

    terminal.open(container);
    hasOpenedRef.current = true;
  }, [terminal]);

  // Keep the terminal's internal grid in sync with the size of its own DOM
  // node. Hidden tabs report a zero-size rect and are skipped, so switching
  // tabs or resizing the window never fits against a collapsed layout.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (container.offsetWidth === 0 || container.offsetHeight === 0) return;
      fitAddon.fit();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [fitAddon]);

  // When this host becomes the active tab, its container just transitioned
  // from `hidden` to laid-out, so re-fit and reclaim focus immediately
  // instead of waiting on the next resize event.
  useEffect(() => {
    if (!isActive) return;

    fitAddon.fit();
    terminal.focus();
  }, [isActive, fitAddon, terminal]);

  return (
    <div ref={containerRef} className={cn("size-full", isActive ? "block" : "hidden")} />
  );
}
