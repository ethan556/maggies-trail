/**
 * Phase B — world-state derivation. One pure function: (manifest, evidence, today) →
 * WorldState. No storage, no UI, no time reads. The Trailhead/Atlas/Basecamp surfaces of
 * Phase C will RENDER this object; they will not compute anything themselves — that is the
 * §7 contract that keeps three theme-intensity modes functionally identical.
 */
import type { Profile } from "@/lib/progress";
import { approachOpen, landmarkState, maintenanceState } from "./revealRules";
import type { DerivedCourse, WorldEvidence, WorldManifest, WorldState } from "./worldTypes";

/** Project the durable evidence out of the existing Profile. Additive-only fields in the
 * profile stay optional here; absent maps read as empty, never as errors. */
export function evidenceFromProfile(p: Pick<Profile, "lessons" | "review" | "testouts" | "mastery">): WorldEvidence {
  return {
    lessons: Object.fromEntries(
      Object.entries(p.lessons ?? {}).map(([id, l]) => [id, { completed: l.completed, completedAt: l.completedAt }])
    ),
    review: (p.review ?? []).map((r) => ({
      lessonId: r.lessonId, due: r.due, conceptTag: r.conceptTag, box: r.box
    })),
    testouts: p.testouts ?? {},
    mastery: Object.fromEntries(
      Object.entries(p.mastery ?? {}).map(([tag, s]) => [
        tag,
        { tag, mastery: s.mastery, attempts: s.attempts, correctStreak: s.correctStreak, lastSeen: s.lastSeen }
      ])
    )
  };
}

export function deriveWorldState(manifest: WorldManifest, evidence: WorldEvidence, today: string): WorldState {
  const coursesById = new Map(manifest.courses.map((c) => [c.courseId, c]));
  const landmarksById = new Map(manifest.landmarks.map((l) => [l.id, l]));

  const courses: Record<string, DerivedCourse> = {};
  for (const course of manifest.courses) {
    const landmarks = course.landmarkIds
      .map((id) => landmarksById.get(id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
    const waypointIds = new Set(landmarks.flatMap((l) => l.waypointIds));
    const completed = [...waypointIds].filter((w) => evidence.lessons[w]?.completed).length;
    const lmStates = landmarks.map((l) => {
      const state = landmarkState(l, evidence);
      const done = l.waypointIds.filter((w) => evidence.lessons[w]?.completed).length;
      return { id: l.id, name: l.name, state, completed: done, total: l.waypointIds.length };
    });
    const complete = lmStates.length > 0 && lmStates.every((l) => l.state === "complete");
    courses[course.courseId] = {
      courseId: course.courseId,
      regionId: course.regionId,
      approachOpen: approachOpen(course, coursesById, landmarksById, evidence),
      totalWaypoints: waypointIds.size,
      completedWaypoints: completed,
      complete,
      landmarks: lmStates,
      maintenance: maintenanceState(waypointIds, complete, evidence, today)
    };
  }

  // Current location: the newest completedAt anywhere; ties broken by lessonId for determinism.
  let current: WorldState["currentLocation"] = null;
  let newest = "";
  for (const lm of manifest.landmarks) {
    for (const w of lm.waypointIds) {
      const rec = evidence.lessons[w];
      if (!rec?.completed || !rec.completedAt) continue;
      const key = `${rec.completedAt}:${w}`;
      if (key > newest) {
        newest = key;
        current = { courseId: lm.courseId, landmarkId: lm.id, waypointId: w };
      }
    }
  }

  return {
    today,
    evidence,
    regions: manifest.regions.map((r) => ({
      id: r.id,
      name: r.name,
      courseIds: manifest.courses.filter((c) => c.regionId === r.id).map((c) => c.courseId)
    })),
    courses,
    currentLocation: current
  };
}
