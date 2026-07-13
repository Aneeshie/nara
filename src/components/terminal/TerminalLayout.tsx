import type { RefObject } from "react";

import { TerminalEmptyState } from "./TerminalEmptyState";
import { TerminalHost } from "./TerminalHost";
import { TerminalTabBar } from "./TerminalTabBar";
import { TerminalViewport } from "./TerminalViewport";
import type { TerminalInstance, TerminalTab } from "./types";

interface TerminalLayoutProps {
  tabs: TerminalTab[];
  activeTabId: number | null;
  terminalsRef: RefObject<Map<number, TerminalInstance>>;
  onSelectTab: (id: number) => void;
  onCloseTab: (id: number) => void;
  onCreateTab: () => void;
  onRenameTab: (id: number, title: string) => void;
}

/**
 * Pure layout: arranges the tab bar and the viewport (or the empty state,
 * when there are no tabs), and renders one `TerminalHost` per tab by looking
 * up that tab's instance in `terminalsRef`.
 *
 * This component owns no React state, calls no Tauri commands, and never
 * creates or destroys a terminal - App.tsx does all of that. The ref lookup
 * here exists only to hand each `TerminalHost` its own `terminal`/`fitAddon`
 * pair instead of the whole map, per the constraint that hosts must never
 * see the map itself. The empty-state branch below is presentation only -
 * it's driven entirely by `tabs.length`, a prop, not local state.
 */
export function TerminalLayout({
  tabs,
  activeTabId,
  terminalsRef,
  onSelectTab,
  onCloseTab,
  onCreateTab,
  onRenameTab,
}: TerminalLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <TerminalTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onCreateTab={onCreateTab}
        onRenameTab={onRenameTab}
      />

      {tabs.length === 0 ? (
        <TerminalEmptyState onCreateTab={onCreateTab} />
      ) : (
        <TerminalViewport>
          {tabs.map((tab) => {
            const instance = terminalsRef.current.get(tab.id);
            if (!instance) return null;

            return (
              <TerminalHost
                key={tab.id}
                terminal={instance.terminal}
                fitAddon={instance.fitAddon}
                isActive={tab.id === activeTabId}
              />
            );
          })}
        </TerminalViewport>
      )}
    </div>
  );
}
