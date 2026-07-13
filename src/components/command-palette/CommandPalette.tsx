import { useState } from "react";
import { Columns2, Layers, Palette, Plus, Rows2, Settings } from "lucide-react";
import { toast } from "sonner";

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "#components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTab: () => void;
  onOpenSettings: () => void;
}

const SELECTED_ROW = "data-selected:bg-secondary data-selected:text-foreground";

/**
 * The ⌘⇧P Raycast-style command palette (design/frame2.html).
 *
 * Only "New Terminal Tab" and "Open Settings Editor" call real callbacks.
 * Split panes and theme/workspace switching have no backend support at all
 * yet, so they're wired to an honest "not implemented" toast instead of
 * silently doing nothing or pretending to work - see the Backend Integration
 * Report for what each one would need.
 */
export function CommandPalette({ open, onOpenChange, onCreateTab, onOpenSettings }: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  const run = (action: () => void) => {
    action();
    onOpenChange(false);
    setSearch("");
  };

  const notImplemented = (feature: string, requirement: string) => {
    toast.info(`${feature} isn't available yet`, { description: requirement });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search commands, themes, workspaces..."
      className="w-140 max-w-[calc(100%-2rem)] rounded-xl border border-border shadow-2xl sm:max-w-140"
    >
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search commands, themes, workspaces..."
      />
      <CommandList className="max-h-105 p-2">
        <CommandGroup heading="Terminal Actions">
          <CommandItem className={SELECTED_ROW} onSelect={() => run(onCreateTab)}>
            <Plus className="text-brand" />
            New Terminal Tab
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => notImplemented("Split Pane Right", "Needs a multi-pane layout in the backend session model."))
            }
          >
            <Columns2 className="text-muted-foreground" />
            Split Pane Right
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => notImplemented("Split Pane Down", "Needs a multi-pane layout in the backend session model."))
            }
          >
            <Rows2 className="text-muted-foreground" />
            Split Pane Down
            <CommandShortcut>⌘⇧D</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Preferences & Configuration">
          <CommandItem
            onSelect={() =>
              run(() => notImplemented("Theme switching", "Needs a theme registry and persisted user preference."))
            }
          >
            <Palette className="text-muted-foreground" />
            Change Theme...
            <span className="ml-auto text-[11px] text-muted-foreground">Dark Obsidian</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => notImplemented("Workspaces", "Needs a workspace concept: named groups of sessions, persisted per project."))
            }
          >
            <Layers className="text-muted-foreground" />
            Switch Workspace...
            <span className="ml-auto text-[11px] text-muted-foreground">default</span>
          </CommandItem>
          <CommandItem onSelect={() => run(onOpenSettings)}>
            <Settings className="text-muted-foreground" />
            Open Settings Editor
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="flex h-8 items-center justify-between border-t border-border bg-muted px-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Use</span>
          <span className="rounded bg-card px-1 font-mono">↑↓</span>
          <span>to navigate,</span>
          <span className="rounded bg-card px-1 font-mono">↵</span>
          <span>to run</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Close with</span>
          <span className="rounded bg-card px-1 font-mono">⌘⇧P</span>
        </div>
      </div>
    </CommandDialog>
  );
}
