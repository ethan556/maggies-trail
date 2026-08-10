/**
 * S202 — the unit test `worldSlice.ts` says pins its contract.
 *
 * The module's own doc comment promised "`worldSlice.test.ts` pins exactly that" and the file did
 * not exist. That is worse than having no comment: the next reader trusts a guarantee nobody
 * wrote. This is that file.
 *
 * Two halves, deliberately. Synthetic manifests pin the closure's PROPERTIES — transitivity,
 * fail-closed on a dangling reference, connection filtering — because those must hold for any
 * geography, not just today's corpus, and a synthetic fixture can construct the adversarial
 * shapes the real manifest happens not to contain. The real manifest then pins the INVARIANT that
 * actually ships: derivation from a slice must equal derivation from the full world. A slice that
 * silently dropped an approach trail would make `approachOpen` fail closed and render courses
 * locked for everyone — a bug that looks exactly like correct "not unlocked yet" behaviour.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { regionRoots, worldSlice } from "./worldSlice";
import { deriveWorldState } from "./deriveWorldState";
import type { WorldConnection, WorldCourse, WorldEvidence, WorldLandmark, WorldManifest } from "./worldTypes";

const full: WorldManifest = JSON.parse(
  readFileSync(join(process.cwd(), "content", "world", "world-manifest.json"), "utf8")
);

const TODAY = "2026-08-04";
const noEvidence = (): WorldEvidence => ({ lessons: {}, review: [], testouts: {}, mastery: {} });

function course(courseId: string, regionId: string, prerequisiteCourseIds: string[] = []): WorldCourse {
  return {
    courseId,
    regionId,
    trailName: `Trail ${courseId}`,
    trailSummary: "",
    prerequisiteCourseIds,
    landmarkIds: [`${courseId}:c1`],
    instrumentIds: [],
    conceptConnections: []
  };
}

function landmark(courseId: string): WorldLandmark {
  return { id: `${courseId}:c1`, courseId, chapterId: "c1", name: `${courseId} landmark`, waypointIds: [`${courseId}-w1`] };
}

function connection(fromCourseId: string, toCourseId: string): WorldConnection {
  return { id: `${fromCourseId}->${toCourseId}`, fromCourseId, toCourseId, sharedConceptTags: [], description: "" };
}

/** a <- b <- c is a three-link chain crossing two regions, plus an unrelated course `z`. */
function synthetic(): WorldManifest {
  const courses = [
    course("a", "r1"),
    course("b", "r1", ["a"]),
    course("c", "r2", ["b"]),
    course("z", "r3")
  ];
  return {
    version: 1,
    generatedBy: "worldSlice.test",
    regions: ["r1", "r2", "r3"].map((id) => ({
      id,
      gradeBand: 3,
      name: id,
      description: "",
      visualMaturity: "elementary" as const,
      environmentalGrammar: "",
      primaryDomains: [],
      accessibilityLabel: id
    })),
    courses,
    landmarks: courses.map((entry) => landmark(entry.courseId)),
    instruments: [],
    connections: [connection("a", "b"), connection("b", "c"), connection("z", "c")]
  };
}

describe("worldSlice — closure properties", () => {
  it("follows prerequisites transitively, not just one level", () => {
    const sliced = worldSlice(synthetic(), ["c"]);
    // `b` is c's direct prerequisite; `a` is only reachable through b. A one-level walk keeps b
    // and loses a, and every course would still render — just permanently locked.
    expect(sliced.courses.map((entry) => entry.courseId).sort()).toEqual(["a", "b", "c"]);
  });

  it("excludes courses outside the closure", () => {
    const sliced = worldSlice(synthetic(), ["c"]);
    expect(sliced.courses.some((entry) => entry.courseId === "z")).toBe(false);
  });

  it("keeps every region the closure crosses", () => {
    const sliced = worldSlice(synthetic(), ["c"]);
    // c lives in r2 and depends on r1. Dropping r1 would orphan a kept course's region.
    expect(sliced.regions.map((region) => region.id).sort()).toEqual(["r1", "r2"]);
    expect(sliced.regions.some((region) => region.id === "r3")).toBe(false);
  });

  it("carries only the landmarks of the kept courses", () => {
    const sliced = worldSlice(synthetic(), ["b"]);
    expect(sliced.landmarks.map((entry) => entry.id).sort()).toEqual(["a:c1", "b:c1"]);
  });

  it("filters connections to the slice instead of emptying them", () => {
    // The exact drift S201's hand-copied fixtures carried: they returned `connections: []` after
    // production had started filtering. An empty rail renders as "no connected routes", which is
    // indistinguishable from a course that genuinely has none.
    const sliced = worldSlice(synthetic(), ["c"]);
    expect(sliced.connections.map((entry) => entry.id).sort()).toEqual(["a->b", "b->c"]);
    expect(sliced.connections.some((entry) => entry.id === "z->c")).toBe(false);
  });

  it("drops a dangling prerequisite rather than inventing one, so derivation still fails closed", () => {
    const manifest = synthetic();
    manifest.courses.push(course("d", "r1", ["does-not-exist"]));
    manifest.landmarks.push(landmark("d"));
    const sliced = worldSlice(manifest, ["d"]);
    expect(sliced.courses.map((entry) => entry.courseId)).toEqual(["d"]);
    expect(sliced.courses.some((entry) => entry.courseId === "does-not-exist")).toBe(false);
    // Fail-closed is the point: an unresolvable approach must not read as an open one.
    expect(deriveWorldState(sliced, noEvidence(), TODAY).courses.d.approachOpen).toBe(false);
  });

  it("is idempotent — slicing a slice changes nothing", () => {
    const once = worldSlice(synthetic(), ["c"]);
    const twice = worldSlice(once, ["c"]);
    expect(twice).toEqual(once);
  });

  it("returns an empty course set for an unknown root rather than throwing", () => {
    expect(worldSlice(synthetic(), ["nope"]).courses).toEqual([]);
  });
});

describe("regionRoots", () => {
  it("returns exactly the courses a region owns", () => {
    expect(regionRoots(synthetic(), "r1").sort()).toEqual(["a", "b"]);
    expect(regionRoots(synthetic(), "r3")).toEqual(["z"]);
    expect(regionRoots(synthetic(), "missing")).toEqual([]);
  });
});

describe("worldSlice — the shipped invariant, against the real manifest", () => {
  /** Evidence that walks the first waypoint of every landmark of every course in a manifest. */
  function walkFirstWaypoints(manifest: WorldManifest): WorldEvidence {
    const evidence = noEvidence();
    for (const entry of manifest.courses) {
      for (const landmarkId of entry.landmarkIds) {
        const found = manifest.landmarks.find((candidate) => candidate.id === landmarkId);
        if (found?.waypointIds[0]) evidence.lessons[found.waypointIds[0]] = { completed: true, completedAt: "2026-08-02" };
      }
    }
    return evidence;
  }

  it("derives a cross-region course identically from its slice and from the full world", () => {
    const byId = new Map(full.courses.map((entry) => [entry.courseId, entry]));
    const target = full.courses.find((entry) =>
      entry.prerequisiteCourseIds.some((id) => byId.get(id)?.regionId !== entry.regionId)
    );
    expect(target, "the corpus should contain at least one cross-region prerequisite").toBeTruthy();
    const sliced = worldSlice(full, [target!.courseId]);
    const evidence = walkFirstWaypoints(sliced);
    expect(deriveWorldState(sliced, evidence, TODAY).courses[target!.courseId])
      .toEqual(deriveWorldState(full, evidence, TODAY).courses[target!.courseId]);
  });

  it("derives every course of a region identically from the region slice and from the full world", () => {
    for (const regionId of ["pattern-valley", "equation-range"]) {
      const sliced = worldSlice(full, regionRoots(full, regionId));
      const evidence = walkFirstWaypoints(sliced);
      const fromSlice = deriveWorldState(sliced, evidence, TODAY);
      const fromFull = deriveWorldState(full, evidence, TODAY);
      for (const courseId of regionRoots(full, regionId)) {
        expect(fromSlice.courses[courseId], `${regionId}/${courseId}`).toEqual(fromFull.courses[courseId]);
      }
    }
  });

  it("every prerequisite of every kept course is itself kept, for every region", () => {
    for (const region of full.regions) {
      const sliced = worldSlice(full, regionRoots(full, region.id));
      const kept = new Set(sliced.courses.map((entry) => entry.courseId));
      const knownIds = new Set(full.courses.map((entry) => entry.courseId));
      for (const entry of sliced.courses) {
        for (const prerequisiteId of entry.prerequisiteCourseIds) {
          // Genuinely dangling ids are excluded by design; anything the full manifest knows about
          // must survive into the slice.
          if (knownIds.has(prerequisiteId)) {
            expect(kept.has(prerequisiteId), `${region.id}: ${entry.courseId} -> ${prerequisiteId}`).toBe(true);
          }
        }
      }
    }
  });
});
