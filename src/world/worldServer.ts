import "server-only";
/**
 * Phase C — server-side manifest access. The manifest is 241 KB (38 KB gzipped); shipping it
 * whole to the browser would cost more than every world surface combined. So server components
 * read it here and pass a SCOPED slice to the client.
 *
 * The scope is not just "the region". Pattern Valley's courses have approach trails that start
 * OUTSIDE Pattern Valley (multiplication-division needs add-subtract-20 and place-value-1000,
 * both earlier regions). `approachOpen` fails closed on an unresolvable prerequisite — correct
 * behaviour for a dangling reference, catastrophic for a slice that merely forgot to include
 * it, because every such course would render locked and no test that only looked at the region
 * would notice. `regionWorld` therefore includes the transitive prerequisite closure, and
 * `world.test.ts` pins that the sliced derivation equals the full-manifest derivation.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { WorldManifest } from "./worldTypes";
import { regionRoots, worldSlice } from "./worldSlice";

let cached: WorldManifest | null = null;

export function loadManifest(): WorldManifest {
  cached ??= JSON.parse(
    readFileSync(join(process.cwd(), "content", "world", "world-manifest.json"), "utf8")
  ) as WorldManifest;
  return cached;
}

/** One region plus every course it transitively depends on. */
export function regionWorld(regionId: string): WorldManifest {
  const full = loadManifest();
  return worldSlice(full, regionRoots(full, regionId));
}

/** One course plus every approach trail it transitively depends on. This is the canonical
 * Basecamp slice and must derive the target course identically to the full manifest. */
export function courseWorld(courseId: string): WorldManifest {
  return worldSlice(loadManifest(), [courseId]);
}

/** Region rows for the Atlas: counts only, no learner state, no landmark payload. */
export function atlasRegions(): Array<{
  id: string; name: string; gradeBand: number; description: string;
  environmentalGrammar: string; accessibilityLabel: string; primaryDomains: string[];
  courseCount: number; waypointCount: number;
}> {
  const full = loadManifest();
  const landmarksById = new Map(full.landmarks.map((l) => [l.id, l]));
  return full.regions.map((r) => {
    const courses = full.courses.filter((c) => c.regionId === r.id);
    let waypoints = 0;
    for (const c of courses) {
      for (const lid of c.landmarkIds) waypoints += landmarksById.get(lid)?.waypointIds.length ?? 0;
    }
    return {
      id: r.id, name: r.name, gradeBand: r.gradeBand, description: r.description,
      environmentalGrammar: r.environmentalGrammar, accessibilityLabel: r.accessibilityLabel,
      primaryDomains: r.primaryDomains, courseCount: courses.length, waypointCount: waypoints
    };
  });
}

/** Default region used when no explicit Atlas region is selected. Kept for stable links and tests. */
export const PILOT_REGION_ID = "pattern-valley";
