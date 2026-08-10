/**
 * Phase B — world copy. Builds on src/lib/trail.ts (never parallel to it): TRAIL owns the
 * nouns, this module owns the world-state sentences. §26's rule applies throughout — no
 * playful copy where clarity is required, and forgetting is never shamed.
 */
import { TRAIL } from "@/lib/trail";
import type { MaintenanceState } from "./worldTypes";

export const MAINTENANCE_COPY: Record<MaintenanceState, string> = {
  "recently-traveled": "Recently traveled — this route is fresh.",
  "needs-reinforcement": `A ${TRAIL.returnPath} is ready today.`,
  "route-fading": `This route is fading — walk its ${TRAIL.returnPath} to restore it.`,
  "route-restored": "Route restored — the next check is scheduled.",
  enduring: "An enduring route — it has held past every scheduled return.",
  holding: "Your current routes are holding."
};

export const WORLD_STATES = {
  emptyJournal: `Your first field note will appear after you complete a ${TRAIL.waypoint}.`,
  noReviewDue: "Your current routes are holding.",
  offline: "You're offline — every trail you've opened is still available.",
  syncFailed: "Sync didn't reach the server. Your progress is safe on this device and will sync when the connection returns.",
  approachClosed: (trailName: string) => `The approach ${TRAIL.trail} to ${trailName} isn't walked yet.`
} as const;
