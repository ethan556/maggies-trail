/**
 * PHASE B — world derivation (s200).
 *
 * Every reveal rule is tested at satisfied / unsatisfied / and the exact boundary, because
 * the boundaries ARE the pedagogy: the day a route becomes enduring, the completion that
 * opens an approach, the mastery value that calibrates an instrument. A rule that is right
 * in the middle and wrong at the edge would reveal the world a day early or a lesson late,
 * and nobody would file a bug — the world would just quietly lie.
 *
 * The REAL manifest is used wherever the rule touches geography, so these tests also prove
 * the generated data supports derivation end to end — not just fixtures shaped like it.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  approachOpen, connectionRevealed, daysBetween, ENDURING_AFTER_DAYS, instrumentState,
  landmarkState, maintenanceState, prerequisiteSatisfied, RECENT_DAYS
} from "./revealRules";
import { deriveWorldState, evidenceFromProfile } from "./deriveWorldState";
import { MAINTENANCE_COPY, WORLD_STATES } from "./worldCopy";
import { MODE_FLAGS, PRESENTATION_KEYS } from "./worldThemes";
import type { WorldEvidence, WorldInstrument, WorldManifest } from "./worldTypes";
import { ASSISTED_CEILING } from "@/lib/mastery";

const manifest: WorldManifest = JSON.parse(
  readFileSync(join(process.cwd(), "content", "world", "world-manifest.json"), "utf8")
);
const coursesById = new Map(manifest.courses.map((c) => [c.courseId, c]));
const landmarksById = new Map(manifest.landmarks.map((l) => [l.id, l]));

const empty = (): WorldEvidence => ({ lessons: {}, review: [], testouts: {}, mastery: {} });
const skill = (tag: string, mastery: number, streak = 3, lastSeen: string | null = "2026-07-01", attempts = 5) =>
  ({ tag, mastery, attempts, correctStreak: streak, lastSeen });

// A real course with a real prerequisite, pulled from the generated data.
const fractions = coursesById.get("fractions")!;
const prereqId = fractions.prerequisiteCourseIds[0];
const prereq = coursesById.get(prereqId)!;

describe("manifest geography", () => {
  it("covers the whole curriculum with no learning state", () => {
    expect(manifest.regions).toHaveLength(14);
    expect(manifest.courses).toHaveLength(129);
    expect(manifest.landmarks.length).toBeGreaterThan(500);
    // every landmark's waypoints are real lesson ids of its own course
    for (const lm of manifest.landmarks.slice(0, 40)) {
      expect(lm.id).toBe(`${lm.courseId}:${lm.chapterId}`);
      expect(lm.waypointIds.length).toBeGreaterThan(0);
    }
    expect(JSON.stringify(manifest)).not.toContain('"completed"');
  });

  it("maps instruments to REAL corpus tags (Phase D) and leaves genuinely unbuilt data empty", () => {
    // Instruments now carry evidence tags. Every tag must exist on a real step — a mapping to
    // a tag nobody authored would make an instrument permanently undiscoverable while looking
    // configured.
    const realTags = new Set<string>();
    for (const dir of readdirSync(join(process.cwd(), "content", "courses"))) {
      const lessonDir = join(process.cwd(), "content", "courses", dir, "lessons");
      if (!existsSync(lessonDir)) continue;
      for (const f of readdirSync(lessonDir)) {
        const lesson = JSON.parse(readFileSync(join(lessonDir, f), "utf8")) as { steps?: Array<{ conceptTag?: string }> };
        for (const st of lesson.steps ?? []) if (st.conceptTag) realTags.add(st.conceptTag);
      }
    }
    let mapped = 0;
    for (const i of manifest.instruments) {
      expect(i.conceptTags.length, `${i.id} must own evidence tags`).toBeGreaterThan(0);
      for (const t of i.conceptTags) expect(realTags.has(t), `${i.id} → unknown tag ${t}`).toBe(true);
      mapped += i.conceptTags.length;
    }
    expect(mapped).toBe(267);
    // one tag never belongs to two instruments — precedence resolves overlaps at generation
    const seen = new Set<string>();
    for (const i of manifest.instruments) for (const t of i.conceptTags) {
      expect(seen.has(t), `${t} claimed twice`).toBe(false);
      seen.add(t);
    }
    expect(manifest.courses.some((c) => c.instrumentIds.length > 0)).toBe(true);
    // connections remain genuinely unbuilt — not faked to look complete
    expect(manifest.connections).toEqual([]);
  });
});

describe("prerequisiteSatisfied — walked or certified every landmark", () => {
  it("unsatisfied on empty evidence", () => {
    expect(prerequisiteSatisfied(prereq, landmarksById, empty())).toBe(false);
  });

  it("boundary: one waypoint per landmark is exactly enough; one landmark short is not", () => {
    const ev = empty();
    const lms = prereq.landmarkIds.map((id) => landmarksById.get(id)!);
    for (const lm of lms.slice(0, -1)) ev.lessons[lm.waypointIds[0]] = { completed: true };
    expect(prerequisiteSatisfied(prereq, landmarksById, ev)).toBe(false); // last landmark unwalked
    ev.lessons[lms[lms.length - 1].waypointIds[0]] = { completed: true };
    expect(prerequisiteSatisfied(prereq, landmarksById, ev)).toBe(true);
  });

  it("a chapter test-out certifies a landmark the learner never walked", () => {
    const ev = empty();
    for (const id of prereq.landmarkIds) ev.testouts[landmarksById.get(id)!.chapterId] = true;
    expect(prerequisiteSatisfied(prereq, landmarksById, ev)).toBe(true);
  });
});

describe("approachOpen", () => {
  it("no prerequisites → always open (a trailhead needs no approach)", () => {
    const noPrereq = manifest.courses.find((c) => c.prerequisiteCourseIds.length === 0)!;
    expect(approachOpen(noPrereq, coursesById, landmarksById, empty())).toBe(true);
  });

  it("closed until every prerequisite is satisfied, open the moment the last one is", () => {
    expect(approachOpen(fractions, coursesById, landmarksById, empty())).toBe(false);
    const ev = empty();
    for (const pid of fractions.prerequisiteCourseIds) {
      for (const lid of coursesById.get(pid)!.landmarkIds) {
        ev.lessons[landmarksById.get(lid)!.waypointIds[0]] = { completed: true };
      }
    }
    expect(approachOpen(fractions, coursesById, landmarksById, ev)).toBe(true);
  });

  it("a dangling prerequisite reference fails closed, never open", () => {
    const phantom = { ...fractions, prerequisiteCourseIds: ["no-such-course"] };
    expect(approachOpen(phantom, coursesById, landmarksById, empty())).toBe(false);
  });
});

describe("landmarkState", () => {
  const lm = landmarksById.get(fractions.landmarkIds[0])!;

  it("unvisited → active on the first completion → complete on the last", () => {
    const ev = empty();
    expect(landmarkState(lm, ev)).toBe("unvisited");
    ev.lessons[lm.waypointIds[0]] = { completed: true };
    expect(landmarkState(lm, ev)).toBe(lm.waypointIds.length === 1 ? "complete" : "active");
    for (const w of lm.waypointIds) ev.lessons[w] = { completed: true };
    expect(landmarkState(lm, ev)).toBe("complete");
  });

  it("test-out completes a landmark regardless of walked waypoints", () => {
    const ev = empty();
    ev.testouts[lm.chapterId] = true;
    expect(landmarkState(lm, ev)).toBe("complete");
  });
});

describe("maintenanceState — §16's five states plus the quiet default", () => {
  const ids = new Set(["w1", "w2"]);
  const today = "2026-08-04";

  it("overdue beats due-today beats pending (fading > reinforcement > restored)", () => {
    const ev = empty();
    ev.review = [{ lessonId: "w1", due: "2026-08-01", conceptTag: "t", box: 0 }, { lessonId: "w2", due: today, conceptTag: "t", box: 0 }];
    expect(maintenanceState(ids, false, ev, today)).toBe("route-fading");
    ev.review = [{ lessonId: "w1", due: today, conceptTag: "t", box: 0 }];
    expect(maintenanceState(ids, false, ev, today)).toBe("needs-reinforcement");
    ev.review = [{ lessonId: "w1", due: "2026-08-20", conceptTag: "t", box: 0 }];
    expect(maintenanceState(ids, false, ev, today)).toBe("route-restored");
  });

  it("boundary: recently-traveled at exactly RECENT_DAYS, holding one day later", () => {
    const ev = empty();
    ev.lessons["w1"] = { completed: true, completedAt: "2026-08-01" }; // 3 days before today
    expect(daysBetween("2026-08-01", today)).toBe(RECENT_DAYS);
    expect(maintenanceState(ids, false, ev, today)).toBe("recently-traveled");
    ev.lessons["w1"] = { completed: true, completedAt: "2026-07-31" };
    expect(maintenanceState(ids, false, ev, today)).toBe("holding");
  });

  it("boundary: enduring requires COMPLETE + review-clear + exactly ENDURING_AFTER_DAYS", () => {
    const ev = empty();
    const at = "2026-07-13"; // 22 days before today
    expect(daysBetween(at, today)).toBe(ENDURING_AFTER_DAYS);
    ev.lessons["w1"] = { completed: true, completedAt: at };
    ev.lessons["w2"] = { completed: true, completedAt: at };
    expect(maintenanceState(ids, true, ev, today)).toBe("enduring");
    expect(maintenanceState(ids, false, ev, today)).toBe("holding"); // incomplete never endures
    ev.review = [{ lessonId: "w1", due: "2026-09-01", conceptTag: "t", box: 0 }];
    expect(maintenanceState(ids, true, ev, today)).toBe("route-restored"); // pending item blocks it
    ev.review = [];
    ev.lessons["w2"] = { completed: true, completedAt: "2026-07-14" }; // newest now 21 days
    expect(maintenanceState(ids, true, ev, today)).toBe("holding");
  });
});

describe("instrumentState — the §9 ladder, anchored to ASSISTED_CEILING", () => {
  const inst = (tags: string[]): WorldInstrument =>
    ({ id: "balance-key", name: "Balance Key", transferableIdea: "equation equivalence", conceptTags: tags });
  const today = "2026-08-04";

  it("no mapped tags (Phase B reality) → undiscovered, never a fake state", () => {
    expect(instrumentState(inst([]), empty(), today)).toBe("undiscovered");
  });

  it("climbs discovered → assembled → calibrated on real thresholds", () => {
    const ev = empty();
    ev.mastery["a"] = skill("a", 0.2);
    // Evidence on ANY tag is discovery — partial contact with the idea is contact (§9).
    expect(instrumentState(inst(["a", "b"]), ev, today)).toBe("discovered");
    ev.mastery["b"] = skill("b", 0.1);
    expect(instrumentState(inst(["a", "b"]), ev, today)).toBe("discovered");
    ev.mastery["a"] = skill("a", 0.5);
    ev.mastery["b"] = skill("b", 0.5);
    expect(instrumentState(inst(["a", "b"]), ev, today)).toBe("assembled");
    ev.mastery["a"] = skill("a", 0.66, 2, "2026-08-01");
    ev.mastery["b"] = skill("b", 0.7, 2, "2026-08-01");
    expect(instrumentState(inst(["a", "b"]), ev, today)).toBe("calibrated");
  });

  it("boundary: mastery EQUAL to the assisted ceiling is not calibration — assisted work alone can reach it", () => {
    const ev = empty();
    ev.mastery["a"] = skill("a", ASSISTED_CEILING, 5, "2026-08-01");
    expect(instrumentState(inst(["a"]), ev, today)).toBe("assembled");
    ev.mastery["a"] = skill("a", ASSISTED_CEILING + 0.001, 5, "2026-08-01");
    expect(instrumentState(inst(["a"]), ev, today)).toBe("calibrated");
  });

  it("enduring only after ENDURING_AFTER_DAYS of held mastery; 'carried' is unreachable until Phase D", () => {
    const ev = empty();
    ev.mastery["a"] = skill("a", 0.8, 4, "2026-07-13"); // exactly 22 days
    expect(instrumentState(inst(["a"]), ev, today)).toBe("enduring");
    ev.mastery["a"] = skill("a", 0.8, 4, "2026-07-14"); // 21 days
    expect(instrumentState(inst(["a"]), ev, today)).toBe("calibrated");
  });
});

describe("connectionRevealed", () => {
  it("empty shared tags never reveal; every tag must clear the independent ceiling", () => {
    const ev = empty();
    expect(connectionRevealed([], ev)).toBe(false);
    ev.mastery["x"] = skill("x", 0.9);
    expect(connectionRevealed(["x", "y"], ev)).toBe(false);
    ev.mastery["y"] = skill("y", ASSISTED_CEILING); // at the ceiling: not independent
    expect(connectionRevealed(["x", "y"], ev)).toBe(false);
    ev.mastery["y"] = skill("y", 0.7);
    expect(connectionRevealed(["x", "y"], ev)).toBe(true);
  });
});

describe("deriveWorldState — the one object Phase C will render", () => {
  it("derives the full world from empty evidence without error, everything sealed shut", () => {
    const state = deriveWorldState(manifest, empty(), "2026-08-04");
    expect(Object.keys(state.courses)).toHaveLength(129);
    expect(state.currentLocation).toBeNull();
    const fr = state.courses["fractions"];
    expect(fr.approachOpen).toBe(false);
    expect(fr.landmarks.every((l) => l.state === "unvisited")).toBe(true);
    expect(fr.maintenance).toBe("holding");
  });

  it("locates the learner at the newest completion, deterministically", () => {
    const lm = landmarksById.get(fractions.landmarkIds[0])!;
    const ev = empty();
    ev.lessons[lm.waypointIds[0]] = { completed: true, completedAt: "2026-08-01" };
    ev.lessons[lm.waypointIds[1] ?? lm.waypointIds[0]] = { completed: true, completedAt: "2026-08-03" };
    const state = deriveWorldState(manifest, ev, "2026-08-04");
    expect(state.currentLocation?.courseId).toBe("fractions");
    expect(state.currentLocation?.landmarkId).toBe(lm.id);
  });

  it("evidenceFromProfile projects only durable fields and tolerates absent optionals", () => {
    const ev = evidenceFromProfile({
      lessons: { "fr-01-01": { completed: true, bestXp: 10, completedAt: "2026-08-01" } },
      review: [{ key: "fr-01-01:c3", conceptTag: "frac", lessonId: "fr-01-01", stepId: "c3", box: 1, due: "2026-08-05" }]
    } as never);
    expect(ev.lessons["fr-01-01"]).toEqual({ completed: true, completedAt: "2026-08-01" });
    expect(ev.review).toEqual([{ lessonId: "fr-01-01", due: "2026-08-05", conceptTag: "frac", box: 1 }]);
    expect(ev.testouts).toEqual({});
    expect(ev.mastery).toEqual({});
  });
});

describe("themes and copy stay inside their contracts", () => {
  it("mode flags contain ONLY the presentation allowlist — functional equivalence by construction", () => {
    for (const flags of Object.values(MODE_FLAGS)) {
      expect(Object.keys(flags).sort()).toEqual([...PRESENTATION_KEYS].sort());
      for (const v of Object.values(flags)) expect(typeof v).toBe("boolean");
    }
    // minimal disables everything; immersive enables everything; guided sits between
    expect(Object.values(MODE_FLAGS.minimal).every((v) => v === false)).toBe(true);
    expect(Object.values(MODE_FLAGS.immersive).every((v) => v === true)).toBe(true);
  });

  it("world copy speaks TRAIL nouns and never shames forgetting", () => {
    expect(MAINTENANCE_COPY["route-fading"]).toContain("return path");
    expect(WORLD_STATES.emptyJournal).toContain("waypoint");
    const all = [...Object.values(MAINTENANCE_COPY), ...Object.values(WORLD_STATES)]
      .map((v) => (typeof v === "function" ? v("X") : v)).join(" ").toLowerCase();
    for (const banned of ["forgot", "failed", "lost your", "quest", "loot", "streak freeze"]) {
      expect(all, `"${banned}" violates §16/§2`).not.toContain(banned);
    }
  });
});
