import { Plus } from "lucide-react";

import { Button } from "#components/ui/button";

const SHORTCUTS = [
  { label: "New Terminal Tab", keys: "⌘T" },
  { label: "Close Terminal Tab", keys: "⌘W" },
  { label: "Command Palette", keys: "⌘⇧P" },
  { label: "Open Settings", keys: "⌘," },
];

interface TerminalEmptyStateProps {
  onCreateTab: () => void;
}

/**
 * Secondary screen shown when there are zero terminal sessions
 * (design/frame3.html). Purely presentational - `onCreateTab` is the same
 * real callback used everywhere else.
 */
export function TerminalEmptyState({ onCreateTab }: TerminalEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-3">
      <div className="max-w-sm px-6 text-center">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-xl border border-border bg-card shadow-md">
          <span className="font-heading text-lg font-bold tracking-wider text-brand">N</span>
        </div>

        <h2 className="mb-1 font-heading text-lg font-bold text-foreground">Nara Terminal</h2>
        <p className="mb-8 text-xs text-muted-foreground">
          A premium, keyboard-first development workspace.
        </p>

        <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-left font-mono text-xs">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{shortcut.label}</span>
              <span className="rounded border border-border bg-muted px-2 py-0.5 text-[11px] text-foreground">
                {shortcut.keys}
              </span>
            </div>
          ))}
        </div>

        <Button
          className="mx-auto mt-6 h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          onClick={onCreateTab}
        >
          <Plus className="size-3.5" />
          Create Terminal
        </Button>
      </div>
    </div>
  );
}
