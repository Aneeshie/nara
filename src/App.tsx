import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "@xterm/xterm/css/xterm.css";

import { Titlebar } from "#components/titlebar/Titlebar";
import { TerminalLayout } from "#components/terminal/TerminalLayout";
import { createTerminalInstance } from "./components/terminal/createTerminalInstance";
import type { TerminalInstance, TerminalTab } from "./components/terminal/types";
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

export default function App() {
  // Serializable UI state only - safe to re-render on, safe to persist.
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

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

    const id = await invoke<number>("create_terminal", { title });

    terminalsRef.current.set(id, createTerminalInstance(id));

    setTabs((prev) => [...prev, { id, title }]);
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback((id: number) => {
    invoke("kill_terminal", { id }).catch(console.error);

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

  // Start with a single terminal, and dispose everything on unmount.
  useEffect(() => {
    createTab();

    return () => {
      terminalsRef.current.forEach(({ terminal }) => terminal.dispose());
      terminalsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        <Titlebar />
        <TerminalLayout
          tabs={tabs}
          activeTabId={activeTabId}
          terminalsRef={terminalsRef}
          onSelectTab={setActiveTabId}
          onCloseTab={closeTab}
          onCreateTab={createTab}
        />
      </div>
    </TooltipProvider>
  );
}
