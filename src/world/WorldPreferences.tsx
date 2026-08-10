"use client";
/**
 * Phase C — the §6 mode switcher. Deliberately plain: a radiogroup, not a themed control, so
 * it works identically in the mode that turns theming off.
 */
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
      {OPTIONS.map((o) => {
        const on = o.id === mode;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setMode(o.id)}
            className={`min-h-[44px] rounded-card border-2 px-3 py-2 text-left ${
              on ? "border-sky bg-sky/10" : "border-ink/15 dark:border-paper/15"
            }`}
          >
            <span className="block text-sm font-extrabold">{o.label}</span>
            <span className="block text-xs text-content-2">{o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
