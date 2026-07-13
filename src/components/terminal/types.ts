import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";

/**
 * Serializable UI state only. This is what may live in React state
 * and get passed down through props/re-renders.
 */
export type TerminalTab = {
  id: number;
  title: string;
  /**
   * Whether this session has background activity (e.g. a long-running
   * command still executing while the tab isn't focused).
   *
   * Always `undefined` today - the backend doesn't emit a signal for this,
   * so App.tsx never sets it. The rendering path is fully wired though: see
   * the "Background Activity Indicator" entry in the Backend Integration
   * Report for what backend support would be required.
   */
  hasActivity?: boolean;
};

/**
 * Imperative, non-serializable handles for a single terminal session.
 * These must never enter React state - they live only in a ref map
 * owned by App.tsx.
 */
export type TerminalInstance = {
  terminal: Terminal;
  fitAddon: FitAddon;
};
