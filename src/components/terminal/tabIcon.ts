import { FileCode, Play, Terminal as TerminalIcon, type LucideIcon } from "lucide-react";

/**
 * "Smart tab icons": a deterministic, presentation-only mapping from a tab's
 * title to an icon. This is real code, not mocked - but its usefulness today
 * is limited, because every tab is currently titled "Terminal N" by App.tsx
 * (the backend does not report the foreground process running in a PTY).
 *
 * It exists so the tab bar already matches the design's per-session iconography
 * (editor, running command, remote shell) and lights up automatically the
 * moment the backend starts reporting real process/session info - see the
 * "Smart Tab Titles" entry in the Backend Integration Report.
 */
export function getTabIcon(title: string): LucideIcon {
  const normalized = title.toLowerCase();

  if (normalized.includes("vim") || normalized.includes("nvim")) return FileCode;
  if (normalized.includes("ssh")) return TerminalIcon;
  if (/\b(run|cargo|npm|pnpm|yarn|make)\b/.test(normalized)) return Play;

  return TerminalIcon;
}
