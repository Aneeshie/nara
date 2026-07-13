import { Columns2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "#components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "#components/ui/tooltip";

import { TerminalTab } from "./TerminalTab";
import type { TerminalTab as TerminalTabData } from "./types";

interface TerminalTabBarProps {
  tabs: TerminalTabData[];
  activeTabId: number | null;
  onSelectTab: (id: number) => void;
  onCloseTab: (id: number) => void;
  onCreateTab: () => void;
  onRenameTab: (id: number, title: string) => void;
}

export function TerminalTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCreateTab,
  onRenameTab,
}: TerminalTabBarProps) {
  return (
    <nav className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-background/80 px-2">
      <div className="flex h-full items-center gap-1 overflow-x-auto">
        {tabs.length === 0 ? (
          <span className="px-3 text-xs font-medium text-muted-foreground/60">No active sessions</span>
        ) : null}

        {tabs.map((tab) => (
          <TerminalTab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={onSelectTab}
            onClose={onCloseTab}
            onCreateTab={onCreateTab}
            onRenameTab={onRenameTab}
          />
        ))}

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onCreateTab}
              >
                <Plus className="size-4" />
              </Button>
            }
          />
          <TooltipContent>New Tab (Cmd+T)</TooltipContent>
        </Tooltip>
      </div>

      {tabs.length > 0 ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Split Pane Right"
          onClick={() =>
            toast.info("Split panes aren't available yet", {
              description: "This needs a multi-pane layout in the backend session model.",
            })
          }
        >
          <Columns2 className="size-4" />
        </Button>
      ) : null}
    </nav>
  );
}
