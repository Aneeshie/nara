import { Palette, Keyboard, Layers, TerminalSquare } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "#components/ui/sheet";

const SECTIONS = [
  { icon: Palette, label: "Appearance", hint: "Dark Obsidian" },
  { icon: Keyboard, label: "Keybindings", hint: "Default" },
  { icon: TerminalSquare, label: "Shell", hint: "bash" },
  { icon: Layers, label: "Workspaces", hint: "1 configured" },
];

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Placeholder settings surface (⌘, / titlebar gear icon). There is no
 * settings backend yet - no persistence, no real values to edit - so this
 * intentionally stops at "here's where settings will live" rather than
 * pretending to save anything. See "Settings Persistence" in the Backend
 * Integration Report.
 */
export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Settings persistence isn't wired up yet - this is a preview of the layout.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1 px-4 pb-4">
          {SECTIONS.map((section) => (
            <div
              key={section.label}
              className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-xs opacity-60"
            >
              <span className="flex items-center gap-2 text-foreground">
                <section.icon className="size-3.5 text-muted-foreground" />
                {section.label}
              </span>
              <span className="text-muted-foreground">{section.hint}</span>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
