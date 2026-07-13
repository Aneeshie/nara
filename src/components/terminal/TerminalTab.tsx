import { X } from "lucide-react";

import { Button } from "#components/ui/button";
import { cn } from "#lib/utils";

import type { TerminalTab as TerminalTabData } from "./types";

interface TerminalTabProps {
  tab: TerminalTabData;
  isActive: boolean;
  index: number;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
}

export function TerminalTab({ tab, isActive, index, onSelect, onClose }: TerminalTabProps) {
  return (
    <div
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(tab.id)}
      className={cn(
        "group relative flex h-8 shrink-0 cursor-default items-center gap-2 rounded-lg px-2.5 text-xs transition-colors duration-150 select-none",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground/80"
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full transition-colors duration-150",
          isActive ? "bg-success shadow-[0_0_6px_-1px_var(--success)]" : "bg-muted-foreground/40"
        )}
      />

      <span className="max-w-32 truncate font-medium">{tab.title}</span>

      <div className="relative ml-0.5 flex size-4 shrink-0 items-center justify-center">
        <span
          className={cn(
            "font-mono text-[10px] text-muted-foreground/60 transition-opacity duration-100",
            "group-hover:opacity-0"
          )}
        >
          {index}
        </span>

        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute inset-0 size-4 rounded-md opacity-0 transition-opacity duration-100 group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            onClose(tab.id);
          }}
        >
          <X className="size-3" />
        </Button>
      </div>

      {isActive ? (
        <span className="absolute inset-x-2.5 -bottom-1.25 h-0.5 rounded-full bg-brand" />
      ) : null}
    </div>
  );
}
