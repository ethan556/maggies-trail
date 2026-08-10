import { describe, expect, it } from "vitest";
import {
  applyResult,
  classify,
  classifyEvidence,
  daysBetween,
  emptySkill,
  evidenceFromResult,
  isReady,
  nextCurriculumSkill,
  recommendNext,
  retainedMastery,
  summarize,
  updateMastery,
  recordSignal,
  type MasteryEvidence,
  type SkillState
} from "./mastery";

const skill = (tag: string, mastery: number, extra: Partial<SkillState> = {}): SkillState => ({
  tag,
  mastery,
  attempts: 1,
  correctStreak: 0,
  lastSeen: "2026-07-01",
  ...extra
});
const ev = (p: Partial<MasteryEvidence>): MasteryEvidence => ({
  correct: true,
  firstTry: true,
  hintsUsed: 0,
  revealed: false,
  ...p
});

describe("evidence classification", () => {
  it("maps each interaction to its kind; revealed is checked before miss", () => {
    expect(classifyEvidence(ev({}))).toBe("firstTryCorrect");
    expect(classifyEvidence(ev({ firstTry: false }))).toBe("retryCorrect");
    expect(classifyEvidence(ev({ hintsUsed: 2 }))).toBe("hintedCorrect");
    // a revealed answer has correct=false but must NOT collapse to a plain miss
    expect(classifyEvidence(ev({ correct: false, revealed: true }))).toBe("revealed");
    expect(classifyEvidence(ev({ correct: false }))).toBe("miss");
  });

  it("evidenceFromResult derives correct = not revealed", () => {
    expect(evidenceFromResult({ firstTry: true, hintsUsed: 0, revealed: false }).correct).toBe(true);
    expect(evidenceFromResult({ firstTry: false, hintsUsed: 1, revealed: true }).correct).toBe(false);
  });
});

describe("mastery update", () => {
  it("orders gains by evidence strength: first-try > retry > hinted > revealed; a miss drops", () => {
    const from = skill("t", 0.5);
    const m = (e: MasteryEvidence) => updateMastery(from, e, "2026-07-02").mastery;
    const first = m(ev({}));
    const retry = m(ev({ firstTry: false }));
    const hinted = m(ev({ hintsUsed: 1 }));
    const revealed = m(ev({ correct: false, revealed: true }));
    const miss = m(ev({ correct: false }));
    expect(first).toBeGreaterThan(retry);
    expect(retry).toBeGreaterThan(hinted);
    expect(hinted).toBeGreaterThan(revealed);
    expect(revealed).toBeGreaterThan(0.5);
    expect(miss).toBeLessThan(0.5);
    expect(miss).toBeCloseTo(0.3, 10); // 0.5 + (-0.4)*0.5
    expect(first).toBeCloseTo(0.725, 10); // 0.5 + 0.45*0.5
  });

  it("approaches but never exceeds 1 on repeated success, and tracks streak/attempts", () => {
    let s = emptySkill("t");
    for (let i = 0; i < 25; i++) s = updateMastery(s, ev({}), "2026-07-02");
    expect(s.mastery).toBeLessThanOrEqual(1);
    expect(s.mastery).toBeGreaterThan(0.99);
    expect(s.attempts).toBe(25);
    expect(s.correctStreak).toBe(25);
  });

  it("a miss and a revealed answer both reset the correct streak", () => {
    const s = skill("t", 0.6, { correctStreak: 3 });
    expect(updateMastery(s, ev({}), "2026-07-02").correctStreak).toBe(4);
    expect(updateMastery(s, ev({ correct: false }), "2026-07-02").correctStreak).toBe(0);
    expect(updateMastery(s, ev({ correct: false, revealed: true }), "2026-07-02").correctStreak).toBe(0);
  });
});

describe("classification bands", () => {
  it("new only with zero attempts; bands at the right cutoffs", () => {
    expect(classify(emptySkill("t"))).toBe("new");
    expect(classify(skill("t", 0.3))).toBe("developing");
    expect(classify(skill("t", 0.4))).toBe("practicing");
    expect(classify(skill("t", 0.69))).toBe("practicing");
    expect(classify(skill("t", 0.7))).toBe("proficient");
    expect(classify(skill("t", 0.89))).toBe("proficient");
    expect(classify(skill("t", 0.9))).toBe("mastered");
  });
});

describe("retention / forgetting", () => {
  it("holds through a grace week, then decays toward a floor", () => {
    const s = skill("t", 0.8, { lastSeen: "2026-07-01" });
    expect(retainedMastery(s, "2026-07-08")).toBeCloseTo(0.8, 10); // 7 days: no decay
    expect(retainedMastery(s, "2026-07-09")).toBeLessThan(0.8); // 8 days: decaying
    expect(retainedMastery(s, "2026-07-09")).toBeGreaterThan(0.7);
    expect(retainedMastery(s, "2026-08-20")).toBeCloseTo(0.32, 10); // far out: floored at 0.4*0.8
  });
  it("daysBetween counts whole days", () => {
    expect(daysBetween("2026-07-01", "2026-07-08")).toBe(7);
    expect(daysBetween("2026-07-01", "2026-07-01")).toBe(0);
  });
});

describe("prerequisite readiness", () => {
  it("ready only when every prerequisite is at least proficient", () => {
    const states = { a: skill("a", 0.7), b: skill("b", 0.2) };
    const prereqs = { hard: ["a", "b"] };
    expect(isReady("hard", states, prereqs)).toBe(false); // b below 0.7
    expect(isReady("hard", { a: skill("a", 0.7), b: skill("b", 0.75) }, prereqs)).toBe(true);
    expect(isReady("free", states, {})).toBe(true); // no prereqs
  });
});

describe("next-skill recommendation", () => {
  it("a due, slipped review beats a low-mastery continue", () => {
    const states = {
      rev: skill("rev", 0.8, { lastSeen: "2026-06-01" }),
      low: skill("low", 0.2)
    };
    const r = recommendNext({ states, dueTags: ["rev"], today: "2026-07-01" });
    expect(r?.tag).toBe("rev");
    expect(r?.reason).toBe("review");
  });

  it("with no reviews, picks the ready skill with the most room to grow", () => {
    const states = { a: skill("a", 0.6), b: skill("b", 0.3) };
    const r = recommendNext({ states, today: "2026-07-01" });
    expect(r?.tag).toBe("b");
    expect(r?.reason).toBe("continue");
  });

  it("never recommends a skill whose prerequisites are unmet", () => {
    const states = { pre: skill("pre", 0.2), hard: skill("hard", 0.1) };
    const r = recommendNext({ states, candidateTags: ["hard"], prereqs: { hard: ["pre"] }, today: "2026-07-01" });
    expect(r).toBeNull();
  });

  it("skips skills already mastered and fresh; returns null when nothing is actionable", () => {
    const states = { m: skill("m", 0.95, { lastSeen: "2026-07-01" }) };
    expect(recommendNext({ states, today: "2026-07-01" })).toBeNull();
  });

  it("breaks ties deterministically by tag", () => {
    const states = { beta: skill("beta", 0.5), alpha: skill("alpha", 0.5) };
    expect(recommendNext({ states, today: "2026-07-01" })?.tag).toBe("alpha");
  });
});

describe("curriculum frontier (forward advance)", () => {
  const order = ["a", "b", "c", "d"];
  const prereqs = { b: ["a"], c: ["b"], d: ["c"] };

  it("returns the earliest not-proficient skill whose prerequisites are met", () => {
    // proficient in a → next ready-and-unlearned is b (its prereq a is met)
    expect(nextCurriculumSkill(order, prereqs, new Set(["a"]))).toBe("b");
    // proficient in a,b → next is c
    expect(nextCurriculumSkill(order, prereqs, new Set(["a", "b"]))).toBe("c");
  });

  it("fills an earlier gap before advancing, even if a later skill is somehow proficient", () => {
    // proficient in a and c but not b → b's prereq (a) is met and b isn't proficient → return b
    expect(nextCurriculumSkill(order, prereqs, new Set(["a", "c"]))).toBe("b");
  });

  it("returns the first root when nothing is proficient yet", () => {
    expect(nextCurriculumSkill(order, prereqs, new Set())).toBe("a");
  });

  it("returns null when everything is proficient", () => {
    expect(nextCurriculumSkill(order, prereqs, new Set(["a", "b", "c", "d"]))).toBeNull();
  });
});

describe("summary + reducer", () => {
  it("summarize counts bands and averages mastery", () => {
    const states = {
      a: skill("a", 0.95),
      b: skill("b", 0.75),
      c: skill("c", 0.3),
      d: emptySkill("d")
    };
    const s = summarize(states);
    expect(s.total).toBe(4);
    expect(s.byBand.mastered).toBe(1);
    expect(s.byBand.proficient).toBe(1);
    expect(s.byBand.developing).toBe(1);
    expect(s.byBand.new).toBe(1);
    expect(s.masteredOrProficient).toBe(2);
    expect(s.averageMastery).toBeCloseTo((0.95 + 0.75 + 0.3 + 0) / 4, 10);
  });

  it("applyResult folds a graded result into a fresh skill, without mutating the input", () => {
    const before = {};
    const after = applyResult(before, "t", { firstTry: true, hintsUsed: 0, revealed: false }, "2026-07-01");
    expect(after.t.mastery).toBeCloseTo(0.45, 10);
    expect(after.t.attempts).toBe(1);
    expect(after.t.lastSeen).toBe("2026-07-01");
    expect(before).toEqual({}); // purity
  });
});

describe("process-signal ledger (Pillar Two evidence)", () => {
  it("applyResult folds a signal alongside graded evidence and accumulates across events", () => {
    let m = applyResult({}, "t", { firstTry: false, hintsUsed: 0, revealed: false, signal: "oscillating" }, "2026-07-16");
    m = applyResult(m, "t", { firstTry: true, hintsUsed: 0, revealed: false, signal: "oscillating" }, "2026-07-17");
    expect(m["t"].signals).toEqual({ oscillating: 2 });
    expect(m["t"].attempts).toBe(2);
  });

  it("recordSignal creates the ledger without touching score, attempts, streak, or recency", () => {
    const m = recordSignal({}, "t", "wrong-direction");
    expect(m["t"]).toEqual({ tag: "t", mastery: 0, attempts: 0, correctStreak: 0, lastSeen: null, signals: { "wrong-direction": 1 } });
  });

  it("the ledger survives later graded events with no signal", () => {
    let m = recordSignal({}, "t", "wrong-direction");
    m = applyResult(m, "t", { firstTry: true, hintsUsed: 0, revealed: false }, "2026-07-16");
    expect(m["t"].signals).toEqual({ "wrong-direction": 1 });
    expect(m["t"].attempts).toBe(1);
  });

  it("identical evidence produces identical ledgers (deterministic adaptation contract)", () => {
    const run = () => {
      let m = recordSignal({}, "t", "oscillating");
      m = applyResult(m, "t", { firstTry: false, hintsUsed: 1, revealed: false, signal: "wrong-direction" }, "2026-07-16");
      return m;
    };
    expect(run()).toEqual(run());
  });

  it("mastery score is identical with and without signals (evidence, never a penalty)", () => {
    const withSig = applyResult({}, "t", { firstTry: true, hintsUsed: 0, revealed: false, signal: "oscillating" }, "2026-07-16");
    const without = applyResult({}, "t", { firstTry: true, hintsUsed: 0, revealed: false }, "2026-07-16");
    expect(withSig["t"].mastery).toBe(without["t"].mastery);
  });
});
