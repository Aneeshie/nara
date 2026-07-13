import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Toaster } from "#components/ui/sonner";
import { toast } from "sonner";
import "@xterm/xterm/css/xterm.css";

import { Titlebar } from "#components/titlebar/Titlebar";
import { TerminalLayout } from "#components/terminal/TerminalLayout";
import { createTerminalInstance } from "./components/terminal/createTerminalInstance";
import type { TerminalInstance, TerminalTab } from "./components/terminal/types";
import { StatusBar } from "#components/statusbar/StatusBar";
import { CommandPalette } from "#components/command-palette/CommandPalette";
import { SettingsSheet } from "#components/settings/SettingsSheet";
import { TooltipProvider } from "#components/ui/tooltip";

/**
 * Shape of the `terminal-output` event payload emitted by the backend.
 * Adjust this if the actual event contract differs - it's the one place
 * that assumption lives.
 */
interface TerminalOutputEvent {
  id: number;
  data: string;
}

interface TerminalCwdEvent {
  id: number;
  path: string;
}

export default function App() {
  // Serializable UI state only - safe to re-render on, safe to persist.
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Imperative, non-serializable handles. Never read during render logic
  // that needs to re-run on change - only looked up by id when mounting a
  // TerminalHost or routing backend output.
  const terminalsRef = useRef(new Map<number, TerminalInstance>());

  // Backend session ids aren't known until `create_terminal` resolves, so
  // tab titles are numbered independently via this counter.
  const tabCounterRef = useRef(0);

  const createTab = useCallback(async () => {
    tabCounterRef.current += 1;
    const title = `Terminal ${tabCounterRef.current}`;

    try {
      const id = await invoke<number>("create_terminal", { title });

      terminalsRef.current.set(id, createTerminalInstance(id));

      setTabs((prev) => [...prev, { id, title }]);
      setActiveTabId(id);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't create a new terminal", { description: String(error) });
    }
  }, []);

  const closeTab = useCallback((id: number) => {
    invoke("kill_terminal", { id }).catch((error) => {
      console.error(error);
      toast.error("Couldn't close the terminal cleanly", { description: String(error) });
    });

    terminalsRef.current.get(id)?.terminal.dispose();
    terminalsRef.current.delete(id);

    setTabs((prev) => {
      const closedIndex = prev.findIndex((tab) => tab.id === id);
      const next = prev.filter((tab) => tab.id !== id);

      setActiveTabId((current) => {
        if (current !== id) return current;
        const fallback = next[closedIndex] ?? next[closedIndex - 1];
        return fallback ? fallback.id : null;
      });

      return next;
    });
  }, []);

  // Renaming is purely cosmetic frontend state - the title is never sent to
  // the backend, so this needs no invoke() call at all.
  const renameTab = useCallback((id: number, title: string) => {
    setTabs((prev) => prev.map((tab) => (tab.id === id ? { ...tab, title } : tab)));
  }, []);

  // Route backend output to the right terminal instance. Registered once,
  // for the lifetime of the app - not per tab - so opening/closing tabs
  // never adds or drops listeners.
  useEffect(() => {
    const unlistenPromise = listen<TerminalOutputEvent>("terminal-output", (event) => {
      const { id, data } = event.payload;
      terminalsRef.current.get(id)?.terminal.write(data);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // Listen for terminal current working directory updates.
  useEffect(() => {
    const unlistenPromise = listen<TerminalCwdEvent>("terminal:cwd", (event) => {
      const { id, path } = event.payload;
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === id) {
            return { ...tab, cwd: path };
          }
          return tab;
        })
      );
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // Global, keyboard-first shortcuts: ⌘T new tab, ⌘W close active tab,
  // ⌘⇧P command palette, ⌘, settings. All dispatch to the same real
  // callbacks used by clicking the equivalent UI elements.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.metaKey && !event.ctrlKey) return;

      if (event.key.toLowerCase() === "t" && !event.shiftKey) {
        event.preventDefault();
        createTab();
        return;
      }

      if (event.key.toLowerCase() === "w") {
        event.preventDefault();
        setActiveTabId((current) => {
          if (current !== null) closeTab(current);
          return current;
        });
        return;
      }

      if (event.key.toLowerCase() === "p" && event.shiftKey) {
        event.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
        return;
      }

      if (event.key === ",") {
        event.preventDefault();
        setIsSettingsOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createTab, closeTab]);

  // Start with a single terminal, and dispose everything on unmount.
  useEffect(() => {
    createTab();

    return () => {
      terminalsRef.current.forEach(({ terminal }) => terminal.dispose());
      terminalsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        <Titlebar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <TerminalLayout
          tabs={tabs}
          activeTabId={activeTabId}
          terminalsRef={terminalsRef}
          onSelectTab={setActiveTabId}
          onCloseTab={closeTab}
          onCreateTab={createTab}
          onRenameTab={renameTab}
        />

        <StatusBar hasActiveSession={tabs.length > 0} activeCwd={activeTab?.cwd} />
      </div>

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        onCreateTab={createTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      <Toaster theme="dark" position="bottom-right" />
    </TooltipProvider>
  );
}
