import { memo, useRef, useState } from "react";
import { Columns2, Copy, Pencil, Plus, Rows2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "#components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "#components/ui/context-menu";
import { cn } from "#lib/utils";

import { getTabIcon } from "./tabIcon";
import type { TerminalTab as TerminalTabData } from "./types";

export function getLastPathSegment(path: string): string {
  // Normalize Windows path separators to forward slashes
  const normalizedPath = path.replace(/\\/g, "/");
  // Remove trailing slashes (except if it is just a single slash representing root)
  const trimmedPath = normalizedPath.length > 1 && normalizedPath.endsWith("/")
    ? normalizedPath.slice(0, -1)
    : normalizedPath;

  // Extract last segment
  const lastSegment = trimmedPath.substring(trimmedPath.lastIndexOf("/") + 1);
  return lastSegment || trimmedPath;
}

interface TerminalTabProps {
  tab: TerminalTabData;
  isActive: boolean;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
  onCreateTab: () => void;
  onRenameTab: (id: number, title: string) => void;
}

export const TerminalTab = memo(function TerminalTab({
  tab,
  isActive,
  onSelect,
  onClose,
  onCreateTab,
  onRenameTab,
}: TerminalTabProps) {
  const displayTitle = tab.cwd ? getLastPathSegment(tab.cwd) : tab.title;

  // Rename is ephemeral, per-tab editing UI state - not application state.
  // The committed value flows out through `onRenameTab`, which is where the
  // real (serializable) title lives, in App.tsx.
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(displayTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = getTabIcon(displayTitle);

  const startRenaming = () => {
    setDraftTitle(displayTitle);
    setIsRenaming(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commitRename = () => {
    const nextTitle = draftTitle.trim();
    if (nextTitle && nextTitle !== displayTitle) onRenameTab(tab.id, nextTitle);
    setIsRenaming(false);
  };

  const notImplemented = (feature: string) => {
    toast.info(`${feature} isn't available yet`, {
      description: "This needs a multi-pane layout in the backend session model.",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          role="tab"
          aria-selected={isActive}
          onClick={() => onSelect(tab.id)}
          onDoubleClick={startRenaming}
          className={cn(
            "group relative flex h-8 shrink-0 cursor-default items-center gap-2 rounded-t-md px-4 text-xs transition-all duration-150 select-none",
            isActive
              ? "border border-border bg-card text-foreground"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          )}
        >
          <Icon className={cn("size-3.5 shrink-0", isActive && "text-brand")} />

          {isRenaming ? (
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitRename();
                if (event.key === "Escape") setIsRenaming(false);
              }}
              onClick={(event) => event.stopPropagation()}
              autoFocus
              className="w-24 bg-transparent font-mono outline-none"
            />
          ) : (
            <span className={cn("font-mono", isActive && "font-medium")}>{displayTitle}</span>
          )}

          {tab.hasActivity ? (
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-tertiary" title="Background activity" />
          ) : null}

          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "ml-1 size-4 shrink-0 rounded-sm text-muted-foreground opacity-0 transition-all duration-150 group-hover:opacity-100",
              isRenaming && "pointer-events-none opacity-0"
            )}
            title="Close Tab"
            onClick={(event) => {
              event.stopPropagation();
              onClose(tab.id);
            }}
          >
            <X className="size-2.5" />
          </Button>

          {isActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-brand" /> : null}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={onCreateTab}>
          <Plus className="text-muted-foreground" /> New Terminal
          <ContextMenuShortcut>⌘T</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={startRenaming}>
          <Pencil className="text-muted-foreground" /> Rename Tab
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onCreateTab}>
          <Copy className="text-muted-foreground" /> Duplicate Tab
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => notImplemented("Split Right")}>
          <Columns2 className="text-muted-foreground" /> Split Right
        </ContextMenuItem>
        <ContextMenuItem onClick={() => notImplemented("Split Down")}>
          <Rows2 className="text-muted-foreground" /> Split Down
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => onClose(tab.id)}>
          <Trash2 /> Close Tab
          <ContextMenuShortcut className="text-destructive/80">⌘W</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});
