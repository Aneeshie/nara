import type { ReactNode } from "react";

interface TerminalViewportProps {
  children?: ReactNode;
}

export function TerminalViewport({ children }: TerminalViewportProps) {
  return (
    <div className="flex min-h-0 flex-1 bg-background p-2">
      <div className="size-full overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </div>
    </div>
  );
}
