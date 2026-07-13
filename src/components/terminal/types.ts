import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";

/**
 * Serializable UI state only. This is what may live in React state
 * and get passed down through props/re-renders.
 */
export type TerminalTab = {
  id: number;
  title: string;
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
