/**
 * S202 — the prerequisite-closure walk, extracted from `worldServer` so it is testable.
 *
 * `worldServer` carries `import "server-only"`, which throws the moment a test imports it. That
 * left S201's cross-region fixture re-implementing this walk inside the spec file — and
 * re-implementing it with `connections: []`, the very behaviour production had just stopped
 * doing. A test that pins a copy of the code against itself proves nothing.
 *
 * So the walk lives here, pure and manifest-in/manifest-out. `worldServer` supplies the manifest;
 * the specs supply the same manifest read from disk. Both run the same function.
 */
import type { WorldManifest } from "./worldTypes";

/**
 * A minimal manifest holding the given root courses plus their complete transitive prerequisite
 * closure, and only the landmarks, regions and connections those courses reach.
 *
 * The closure is not optional. `approachOpen` fails closed on an unresolvable prerequisite —
 * correct for a genuinely dangling reference, catastrophic for a slice that merely forgot to
 * include one, because every affected course would render locked and look like correct
 * "not unlocked yet" behaviour. Derivation from a slice must equal derivation from the full
 * manifest, and `worldSlice.test.ts` pins exactly that.
 */
export function worldSlice(full: WorldManifest, rootCourseIds: Iterable<string>): WorldManifest {
  const byId = new Map(full.courses.map((course) => [course.courseId, course]));
  const keep = new Set<string>();
  const visit = (id: string): void => {
    if (keep.has(id)) return;
    const course = byId.get(id);
    if (!course) return; // genuinely dangling: derivation must still fail closed
    keep.add(id);
    for (const prerequisiteId of course.prerequisiteCourseIds) visit(prerequisiteId);
  };
  for (const courseId of rootCourseIds) visit(courseId);

  const courses = full.courses.filter((course) => keep.has(course.courseId));
  const landmarkIds = new Set(courses.flatMap((course) => course.landmarkIds));
  const regionIds = new Set(courses.map((course) => course.regionId));
  return {
    ...full,
    regions: full.regions.filter((region) => regionIds.has(region.id)),
    courses,
    landmarks: full.landmarks.filter((landmark) => landmarkIds.has(landmark.id)),
    connections: full.connections.filter(
      (connection) => keep.has(connection.fromCourseId) && keep.has(connection.toCourseId)
    )
  };
}

/** The root set for a region slice: every course that region owns. */
export function regionRoots(full: WorldManifest, regionId: string): string[] {
  return full.courses.filter((course) => course.regionId === regionId).map((course) => course.courseId);
}
