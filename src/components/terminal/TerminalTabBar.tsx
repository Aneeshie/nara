import { Plus } from "lucide-react";

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
}

export function TerminalTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCreateTab,
}: TerminalTabBarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-background px-2">
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab, index) => (
          <TerminalTab
            key={tab.id}
            tab={tab}
            index={index + 1}
            isActive={tab.id === activeTabId}
            onSelect={onSelectTab}
            onClose={onCloseTab}
          />
        ))}
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onCreateTab}
            >
              <Plus className="size-4" />
            </Button>
          }
        />
        <TooltipContent>New terminal</TooltipContent>
      </Tooltip>
    </div>
  );
}
