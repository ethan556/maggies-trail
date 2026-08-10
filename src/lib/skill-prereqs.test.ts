import { describe, expect, it } from "vitest";
import prereqData from "../../content/skill-prereqs.json";
import { isReady, recommendNext, type SkillState } from "./mastery";

const prereqs = prereqData.prereqs as Record<string, string[]>;
const skill = (tag: string, mastery: number): SkillState => ({ tag, mastery, attempts: 3, correctStreak: 1, lastSeen: "2026-07-11" });

describe("generated skill-prereqs map", () => {
  it("covers the curriculum and records prerequisites", () => {
    expect(prereqData.tags).toBeGreaterThan(500);
    expect(prereqData.withPrereqs).toBeGreaterThan(500);
    expect(Object.keys(prereqs).length).toBe(prereqData.withPrereqs);
  });

  it("has no self-loops", () => {
    for (const [t, ps] of Object.entries(prereqs)) expect(ps).not.toContain(t);
  });

  it("is acyclic (DFS over the whole graph)", () => {
    const color: Record<string, number> = {};
    const stack: string[] = [];
    let cycle: string | null = null;
    const visit = (n: string) => {
      if (cycle) return;
      color[n] = 1;
      stack.push(n);
      for (const m of prereqs[n] ?? []) {
        if (color[m] === 1) {
          cycle = `${n} -> ${m}`;
          return;
        }
        if (!color[m]) visit(m);
      }
      stack.pop();
      color[n] = 2;
    };
    for (const n of Object.keys(prereqs)) if (!color[n]) visit(n);
    expect(cycle).toBeNull();
  });
});

describe("real map activates readiness in the engine", () => {
  // deterministic pick: first tag (alphabetical) that has prerequisites
  const tag = Object.keys(prereqs).sort()[0];
  const pre = prereqs[tag];

  it("isReady gates on the real prerequisites", () => {
    const met = Object.fromEntries(pre.map((p) => [p, skill(p, 0.8)]));
    expect(isReady(tag, met, prereqs)).toBe(true);
    const unmet = { ...met, [pre[0]]: skill(pre[0], 0.2) };
    expect(isReady(tag, unmet, prereqs)).toBe(false);
  });

  it("recommendNext excludes a skill whose prerequisites are unmet, recommends it once met", () => {
    const metStates = { ...Object.fromEntries(pre.map((p) => [p, skill(p, 0.8)])), [tag]: skill(tag, 0.3) };
    const rec = recommendNext({ states: metStates, candidateTags: [tag], prereqs, today: "2026-07-11" });
    expect(rec?.tag).toBe(tag);

    const unmetStates = { ...metStates, [pre[0]]: skill(pre[0], 0.2) };
    const gated = recommendNext({ states: unmetStates, candidateTags: [tag], prereqs, today: "2026-07-11" });
    expect(gated).toBeNull();
  });
});
