import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

const dir = join(process.cwd(), "content/courses/two-step-equations/lessons");
const targetIds = [
  "tse-01-01", "tse-02-01", "tse-02-02", "tse-02-03", "tse-02-04", "tse-03-01",
  "tse-03-02", "tse-03-03", "tse-04-01", "tse-04-02", "tse-04-03",
] as const;
const excludedIds = ["tse-01-02", "tse-01b-02"] as const;
const expectedJobs: Record<string, Record<string, string>> = {
  "tse-01-01": { i3: "Spot the double-negative sign.", k2: "Build an equivalent expression.", ch1: "Repair a sign-error claim." },
  "tse-02-01": { i3: "Verify a claimed solution.", k2: "Isolate x after removing a constant.", k3: "Use a reverse check.", ch1: "Correct a teammate's claim." },
  "tse-02-02": { i3: "Trace the sign after isolation.", k2: "Use the quotient's sign.", k3: "Reject a sign-error claim.", ch1: "Audit a negative-coefficient solution." },
  "tse-02-03": { i2: "Interpret a temperature change.", k2: "Check a cooling-model result.", k3: "Find a rate from a story model." },
  "tse-02-04": { k2: "Plan the balance moves first.", ch1: "Test the balance invariant." },
  "tse-03-01": { i3: "Predict the expanded form.", k2: "Check a subtraction distribution.", k3: "Work backward from a candidate.", ch1: "Diagnose an expanded-equation claim." },
  "tse-03-02": { k1: "Check the sign distribution.", k2: "Compare a sign-safe expansion.", k3: "Audit a negative-factor result.", ch1: "Repair a double-negative solve." },
  "tse-03-03": { i3: "Verify by substitution.", k2: "Choose the expansion path.", k3: "Diagnose the constant sign.", ch1: "Plan a mixed-sign solve." },
  "tse-04-01": { k2: "Check the solution boundary.", k3: "Use a counterexample check." },
  "tse-04-02": { i3: "Test the flipped ray." },
  "tse-04-03": { k3: "Translate the sign flip into context." },
};

const expectedTypes: Record<string, Record<string, string>> = {
  "tse-01-01": { i3: "mcq", k2: "buildExpression", ch1: "buildExpression" },
  "tse-02-01": { i3: "numeric", k2: "numeric", k3: "numeric", ch1: "numeric" },
  "tse-02-02": { i3: "numeric", k2: "numeric", k3: "numeric", ch1: "numeric" },
  "tse-02-03": { i2: "numeric", k2: "numeric", k3: "numeric" },
  "tse-02-04": { k2: "solveBalance", ch1: "solveBalance" },
  "tse-03-01": { i3: "numeric", k2: "numeric", k3: "numeric", ch1: "numeric" },
  "tse-03-02": { k1: "numeric", k2: "numeric", k3: "numeric", ch1: "numeric" },
  "tse-03-03": { i3: "numeric", k2: "numeric", k3: "numeric", ch1: "numeric" },
  "tse-04-01": { k2: "buildExpression", k3: "buildExpression" },
  "tse-04-02": { i3: "mcq" },
  "tse-04-03": { k3: "buildExpression" },
};
type RawLesson = {
  id: string;
  steps: Array<{
    id: string;
    body?: string;
    widget?: {
      prompt?: string;
      type?: string;
      answer?: unknown;
      options?: Array<{ id: string; correct?: boolean }>;
    };
  }>;
};
const load = (id: string) => JSON.parse(readFileSync(join(dir, `${id}.json`), "utf8")) as RawLesson;
const normalize = (prompt: string) => prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ");

describe("S280 Two-Step Equations clean progression subset", () => {
  it("keeps the active files explicitly excluded from this isolated packet", () => {
    for (const id of excludedIds) expect(targetIds).not.toContain(id);
  });

  it("gives each queued target a distinct learner job without changing its evaluator shape", () => {
    let targetCount = 0;
    for (const [lessonId, jobs] of Object.entries(expectedJobs)) {
      const lesson = load(lessonId);
      for (const [stepId, job] of Object.entries(jobs)) {
        const step = lesson.steps.find((candidate) => candidate.id === stepId);
        expect(step, `${lessonId}/${stepId}`).toBeDefined();
        expect(step?.body).toBe(job);
        expect(step?.widget?.prompt).toBeTruthy();
        expect(step?.widget?.type).toBe(expectedTypes[lessonId]![stepId]);
        targetCount += 1;
      }
      const prompts = lesson.steps
        .filter((step) => step.widget?.prompt)
        .map((step) => normalize(step.widget!.prompt!));
      expect(new Set(prompts).size, `${lessonId}: no remaining normalized prompt collision`).toBe(prompts.length);
    }
    expect(targetCount).toBe(32);
  });

  it("keeps the full current course schema- and pedagogy-clean", () => {
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".json")).sort()) {
      const lesson = JSON.parse(readFileSync(join(dir, file), "utf8"));
      expect(lintLesson(Lesson.parse(lesson)), lesson.id).toEqual([]);
    }
  });
});
