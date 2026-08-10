"use client";
/**
 * Phase C — presentation preferences. §7 requires these to live SEPARATELY from learning
 * evidence: the profile records what the learner has done, this records how they like it drawn.
 * Keeping them apart is what lets the mode be changed freely without touching progress, and
 * what makes "modes are presentation only" checkable rather than promised.
 */
import { storageGet, storageSet } from "@/lib/safeStorage";
import { DEFAULT_MODE, type ThemeIntensity } from "./worldThemes";

export const WORLD_PREFS_KEY = "numera:world-prefs:v1";

const isMode = (v: string): v is ThemeIntensity => v === "minimal" || v === "guided" || v === "immersive";

export function loadThemeIntensity(): ThemeIntensity {
  const raw = storageGet(WORLD_PREFS_KEY);
  if (!raw) return DEFAULT_MODE;
  try {
    const parsed: unknown = JSON.parse(raw);
    const mode = (parsed as { themeIntensity?: unknown })?.themeIntensity;
    return typeof mode === "string" && isMode(mode) ? mode : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

export function saveThemeIntensity(mode: ThemeIntensity): void {
  storageSet(WORLD_PREFS_KEY, JSON.stringify({ themeIntensity: mode }));
}
