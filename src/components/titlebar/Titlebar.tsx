import { Minus, Square, SquareTerminal, X } from "lucide-react";

import { Button } from "#components/ui/button";

interface TitlebarProps {
  title?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function Titlebar({
  title = "Nara",
  onMinimize,
  onMaximize,
  onClose,
}: TitlebarProps) {
  return (
    <div
      data-tauri-drag-region
      className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-background pl-3"
    >
      <div data-tauri-drag-region className="flex items-center gap-2 select-none">
        <SquareTerminal className="size-3.5 text-brand" strokeWidth={2.25} />
        <span className="text-[13px] font-medium tracking-tight text-foreground/90">
          {title}
        </span>
      </div>

      <div className="flex h-full items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-10 w-11 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onMinimize}
        >
          <Minus className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="h-10 w-11 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onMaximize}
        >
          <Square className="size-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="h-10 w-11 rounded-none text-muted-foreground hover:bg-destructive/90 hover:text-white"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
