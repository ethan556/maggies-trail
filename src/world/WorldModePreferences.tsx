"use client";

import { useWorld } from "./WorldShell";
import type { ThemeIntensity } from "./worldThemes";

const OPTIONS: Array<{ id: ThemeIntensity; label: string; hint: string }> = [
  { id: "minimal", label: "Minimal", hint: "Plain labels, no map art" },
  { id: "guided", label: "Guided", hint: "Trail names and regions" },
  { id: "immersive", label: "Immersive", hint: "Full atlas context" }
];

export function WorldPreferences() {
  const { mode, setMode } = useWorld();
  return (
    <div role="radiogroup" aria-label="Trail presentation" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const selected = option.id === mode;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setMode(option.id)}
            className={`min-h-[44px] rounded-card border-2 px-3 py-2 text-left ${
              selected ? "border-sky bg-sky/10" : "border-ink/15 dark:border-paper/15"
            }`}
          >
            <span className="block text-sm font-extrabold">{option.label}</span>
            <span className="block text-xs text-content-2">{option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
