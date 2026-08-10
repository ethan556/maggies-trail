/**
 * Phase B — theme-intensity modes (§6). The whole design is in the type: MODE_FLAGS may
 * contain ONLY presentation booleans. Lessons, accessibility, progress, grading and reveal
 * derivation never read this object — Phase C surfaces consult it for rendering choices and
 * nothing else, which is what makes the three modes functionally identical by construction
 * rather than by discipline. world.test.ts pins the key allowlist so a functional flag
 * cannot be smuggled in later.
 */
export type ThemeIntensity = "minimal" | "guided" | "immersive";

export interface ThemePresentation {
  regionArt: boolean;
  atlasContext: boolean;
  animatedReveals: boolean;
  richJournal: boolean;
  trailTermsInNav: boolean;
}

/** Keys are the complete legal surface of a theme mode. Adding a key here requires proving
 * in review that it is presentation, not function. */
export const PRESENTATION_KEYS = ["regionArt", "atlasContext", "animatedReveals", "richJournal", "trailTermsInNav"] as const;

export const MODE_FLAGS: Record<ThemeIntensity, ThemePresentation> = {
  minimal: { regionArt: false, atlasContext: false, animatedReveals: false, richJournal: false, trailTermsInNav: false },
  guided: { regionArt: true, atlasContext: false, animatedReveals: false, richJournal: false, trailTermsInNav: true },
  immersive: { regionArt: true, atlasContext: true, animatedReveals: true, richJournal: true, trailTermsInNav: true }
};

export const DEFAULT_MODE: ThemeIntensity = "guided";
