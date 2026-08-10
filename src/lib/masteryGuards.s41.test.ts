// Mastery guards (s41): the two anti-abuse guarantees on the evidence model.
//   HINTS CANNOT INFLATE  assisted success lifts mastery only to the top of
//                         "practicing"; proficiency must be earned unaided —
//                         and assisted evidence never LOWERS what was earned.
//   INTERVALS ⇔ STRENGTH  a skill comes due when retained mastery decays below
//                         the proficiency line, so the implied interval grows
//                         monotonically with evidence strength.
import { describe, expect, it } from "vitest";
import {
  ASSISTED_CEILING,
  classify,
  emptySkill,
  isFading,
  PROFICIENT,
  updateMastery,
  type MasteryEvidence,
  type SkillState
} from "@/lib/mastery";

const hinted: MasteryEvidence = { correct: true, firstTry: false, hintsUsed: 2, revealed: false };
const revealedE: MasteryEvidence = { correct: false, firstTry: false, hintsUsed: 0, revealed: true };
const firstTry: MasteryEvidence = { correct: true, firstTry: true, hintsUsed: 0, revealed: false };

describe("mastery cannot inflate through hints", () => {
  it("fifty hinted successes never cross the proficiency line", () => {
    let s = emptySkill("t");
    for (let i = 0; i < 50; i++) s = updateMastery(s, hinted, "2026-07-17");
    expect(s.mastery).toBeLessThanOrEqual(ASSISTED_CEILING);
    expect(s.mastery).toBeLessThan(PROFICIENT);
    expect(classify(s)).not.toBe("proficient");
    expect(classify(s)).not.toBe("mastered");
  });

  it("reveals obey the same ceiling", () => {
    let s = emptySkill("t");
    for (let i = 0; i < 80; i++) s = updateMastery(s, revealedE, "2026-07-17");
    expect(s.mastery).toBeLessThanOrEqual(ASSISTED_CEILING);
  });

  it("unaided success after hinted plateau crosses normally", () => {
    let s = emptySkill("t");
    for (let i = 0; i < 50; i++) s = updateMastery(s, hinted, "2026-07-17");
    s = updateMastery(s, firstTry, "2026-07-17");
    expect(s.mastery).toBeGreaterThan(ASSISTED_CEILING);
  });

  it("assisted evidence never lowers mastery earned above the ceiling", () => {
    let s: SkillState = { ...emptySkill("t"), mastery: 0.82, attempts: 6 };
    s = updateMastery(s, hinted, "2026-07-17");
    expect(s.mastery).toBeCloseTo(0.82, 10);
  });
});

describe("review intervals reflect evidence strength", () => {
  const dueDay = (mastery: number): number => {
    const s: SkillState = { ...emptySkill("t"), mastery, attempts: 5, lastSeen: "2026-01-01" };
    for (let d = 1; d < 120; d++) {
      const today = new Date(Date.parse("2026-01-01T00:00:00Z") + d * 86400000).toISOString().slice(0, 10);
      if (isFading(s, today)) return d;
    }
    return 120;
  };

  it("stronger mastery comes due strictly later", () => {
    const d75 = dueDay(0.75);
    const d9 = dueDay(0.9);
    const d98 = dueDay(0.98);
    expect(d75).toBeLessThan(d9);
    expect(d9).toBeLessThan(d98);
  });

  it("a skill never proficient is never 'fading'", () => {
    const s: SkillState = { ...emptySkill("t"), mastery: 0.5, attempts: 5, lastSeen: "2026-01-01" };
    expect(isFading(s, "2026-06-01")).toBe(false);
  });
});
