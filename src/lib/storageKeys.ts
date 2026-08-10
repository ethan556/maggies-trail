// Storage keys shared by the single-profile store and the multi-child roster. Kept in one place so
// progress.ts and roster.ts can both reference them without importing each other (no cycle).

/** Legacy single-profile key (pre-multi-child). Migrated into the default child on first load. */
export const LEGACY_PROFILE_KEY = "numera:profile:v1";
/** Per-child profile keys are `${PROFILE_KEY_PREFIX}${childId}`. */
export const PROFILE_KEY_PREFIX = "numera:profile:v1:";
export const ROSTER_KEY = "numera:roster:v1";
export const DEFAULT_CHILD_ID = "c1";

export function profileKey(childId: string): string {
  return PROFILE_KEY_PREFIX + childId;
}
