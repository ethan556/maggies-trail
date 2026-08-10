"use client";
/**
 * Phase C — WorldShell (§30). One context supplying (a) the derived world state and (b) the
 * presentation mode. Surfaces RENDER this; they never derive anything themselves. That is the
 * structural reason the three modes cannot diverge functionally: there is only one state object
 * and the mode flags cannot reach it.
 *
 * Evidence is local-first, so derivation happens on the client after mount. Before mount we
 * render the same tree with empty evidence rather than a spinner: the geography is identical
 * either way, only the learner's marks change, so there is no layout shift when they arrive.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { progressStore } from "@/lib/progress";
import { deriveWorldState, evidenceFromProfile } from "./deriveWorldState";
import { MODE_FLAGS, type ThemeIntensity, type ThemePresentation } from "./worldThemes";
import { loadThemeIntensity, saveThemeIntensity } from "./worldPreferences";
import type { WorldEvidence, WorldManifest, WorldState } from "./worldTypes";

const EMPTY: WorldEvidence = { lessons: {}, review: [], testouts: {}, mastery: {} };

interface WorldContextValue {
  world: WorldState;
  mode: ThemeIntensity;
  flags: ThemePresentation;
  setMode: (m: ThemeIntensity) => void;
  /** false until local evidence has loaded — surfaces use it to defer "resume" claims only. */
  hydrated: boolean;
}

const Ctx = createContext<WorldContextValue | null>(null);

export function useWorld(): WorldContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWorld must be used inside <WorldShell>");
  return v;
}

export function WorldShell({
  manifest,
  today,
  children
}: {
  manifest: WorldManifest;
  /** Server-supplied local date. Passed in, never read from the clock here, so the surfaces
   * stay as deterministic as the rules they render. */
  today: string;
  children: React.ReactNode;
}) {
  const [evidence, setEvidence] = useState<WorldEvidence>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setModeState] = useState<ThemeIntensity>("guided");

  useEffect(() => {
    setEvidence(evidenceFromProfile(progressStore.load()));
    setModeState(loadThemeIntensity());
    setHydrated(true);
  }, []);

  const world = useMemo(() => deriveWorldState(manifest, evidence, today), [manifest, evidence, today]);
  const value = useMemo<WorldContextValue>(
    () => ({
      world,
      mode,
      flags: MODE_FLAGS[mode],
      hydrated,
      setMode: (m) => { setModeState(m); saveThemeIntensity(m); }
    }),
    [world, mode, hydrated]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
