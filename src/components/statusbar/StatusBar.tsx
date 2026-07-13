import { MapPin } from "lucide-react";

import { cn } from "#lib/utils";

// The backend always spawns "bash" today (see manager.rs: `CommandBuilder::new("bash")`),
// and doesn't expose a session's cwd at all. These are shown as real facts about the
// current backend, not fabricated - but they should become dynamic once the backend
// reports them. See "Session Metadata (shell + cwd)" in the Backend Integration Report.
const SHELL_NAME = "bash";
const WORKING_DIRECTORY = "~/github/Aneeshie/nara";

interface StatusBarProps {
  hasActiveSession: boolean;
}

export function StatusBar({ hasActiveSession }: StatusBarProps) {
  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-background px-4 font-mono text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              hasActiveSession ? "bg-tertiary" : "bg-muted-foreground/40"
            )}
          />
          <span>{hasActiveSession ? SHELL_NAME : "no shell"}</span>
        </div>

        {hasActiveSession ? (
          <>
            <span className="text-muted-foreground/30">|</span>
            <div className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              <MapPin className="size-3" />
              <span>{WORKING_DIRECTORY}</span>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <span>UTF-8</span>
        <span className="text-muted-foreground/30">|</span>
        <span>LF</span>
        <span className="text-muted-foreground/30">|</span>
        <span className={hasActiveSession ? "font-semibold text-foreground" : undefined}>
          {hasActiveSession ? "Ready" : "No sessions"}
        </span>
      </div>
    </footer>
  );
}
