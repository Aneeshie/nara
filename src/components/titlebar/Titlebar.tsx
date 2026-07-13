import { Layers, Settings } from "lucide-react";

import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";

// The app has no workspace concept on the backend yet - see "Workspaces" in
// the Backend Integration Report. "default" is a static placeholder, not a
// value read from anywhere real.
const DEFAULT_WORKSPACE = "default";
const APP_VERSION = "v0.1.0";

interface TitlebarProps {
  title?: string;
  workspace?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenSettings?: () => void;
}

export function Titlebar({
  title = "NARA",
  workspace = DEFAULT_WORKSPACE,
  onMinimize,
  onMaximize,
  onClose,
  onOpenCommandPalette,
  onOpenSettings,
}: TitlebarProps) {
  return (
    <header
      data-tauri-drag-region
      className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4"
    >
      <div data-tauri-drag-region className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TrafficLight color="bg-red-500" title="Close" onClick={onClose} />
          <TrafficLight color="bg-yellow-500" title="Minimize" onClick={onMinimize} />
          <TrafficLight color="bg-green-500" title="Maximize" onClick={onMaximize} />
        </div>

        <div className="ml-4 flex items-center gap-2">
          <span className="font-heading text-xs font-semibold tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {APP_VERSION}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/50 px-3 py-1">
        <Layers className="size-3 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Workspace: <span className="text-foreground">{workspace}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Command Palette"
          className="flex items-center gap-1 rounded border border-border/80 bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>⌘⇧P</span>
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Settings"
          onClick={onOpenSettings}
        >
          <Settings className="size-4" />
        </Button>
      </div>
    </header>
  );
}

interface TrafficLightProps {
  color: string;
  title: string;
  onClick?: () => void;
}

function TrafficLight({ color, title, onClick }: TrafficLightProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn("size-3 rounded-full opacity-80 transition-opacity hover:opacity-100", color)}
    />
  );
}
