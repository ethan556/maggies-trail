/**
 * Phase C — where every world surface can send a learner. Centralised because the
 * mode-equivalence test asserts that the set of reachable lesson routes is identical across
 * presentation modes; that assertion is only meaningful if there is one place routes are built.
 */
import type { DerivedCourse, WorldState } from "./worldTypes";

export const waypointHref = (lessonId: string): string => `/learn/${lessonId}`;
export const basecampHref = (courseId: string): string => `/basecamp/${courseId}`;
export const atlasHref = "/atlas";
export const trailheadHref = "/trailhead";

/** The single next waypoint on a trail: the first uncompleted one in landmark order. Null when
 * the trail is finished. */
export function nextWaypoint(
  course: DerivedCourse,
  landmarkWaypoints: Map<string, string[]>,
  completed: (lessonId: string) => boolean
): { lessonId: string; landmarkId: string } | null {
  for (const lm of course.landmarks) {
    for (const w of landmarkWaypoints.get(lm.id) ?? []) {
      if (!completed(w)) return { lessonId: w, landmarkId: lm.id };
    }
  }
  return null;
}

export type DominantAction =
  | { kind: "continue"; courseId: string; lessonId: string; label: string }
  | { kind: "begin"; courseId: string; lessonId: string; label: string }
  | { kind: "repair"; courseId: string; lessonId: string; label: string }
  | { kind: "explore"; label: string };

/**
 * §10: ONE dominant action, chosen by evidence, in priority order —
 *   1. a fading route (overdue retrieval) beats new ground: repair what is slipping away
 *   2. otherwise continue the trail already under way
 *   3. otherwise begin the first open trail
 *   4. otherwise send them to the Atlas
 * Ties break on courseId so the same evidence always produces the same action.
 */
export function dominantAction(
  world: WorldState,
  landmarkWaypoints: Map<string, string[]>,
  completed: (lessonId: string) => boolean
): DominantAction {
  const courses = Object.values(world.courses).sort((a, b) => a.courseId.localeCompare(b.courseId));

  const fading = courses.find((c) => c.approachOpen && c.maintenance === "route-fading");
  if (fading) {
    const w = nextWaypoint(fading, landmarkWaypoints, completed);
    if (w) return { kind: "repair", courseId: fading.courseId, lessonId: w.lessonId, label: "Repair this route" };
  }

  const started = courses.filter((c) => c.approachOpen && c.completedWaypoints > 0 && !c.complete);
  const current = world.currentLocation
    ? started.find((c) => c.courseId === world.currentLocation?.courseId) ?? started[0]
    : started[0];
  if (current) {
    const w = nextWaypoint(current, landmarkWaypoints, completed);
    if (w) return { kind: "continue", courseId: current.courseId, lessonId: w.lessonId, label: "Continue trail" };
  }

  const fresh = courses.find((c) => c.approachOpen && c.completedWaypoints === 0);
  if (fresh) {
    const w = nextWaypoint(fresh, landmarkWaypoints, completed);
    if (w) return { kind: "begin", courseId: fresh.courseId, lessonId: w.lessonId, label: "Begin expedition" };
  }
  return { kind: "explore", label: "Open the Atlas" };
}
