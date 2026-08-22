import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson } from "@/lib/schema";

const lesson = (course: string, id: string) => Lesson.parse(JSON.parse(readFileSync(
  resolve(process.cwd(), "content", "courses", course, "lessons", `${id}.json`),
  "utf8"
)));

describe("S247 interaction-necessity dispositions", () => {
  it("records no remaining AUDIT decision", () => {
    const csv = readFileSync(resolve(process.cwd(), "PREMIUM_INTERACTION_PRIORITY.csv"), "utf8");
    expect(csv).not.toMatch(/,AUDIT-(?:NEXT|OPEN),/);
    expect(csv).toContain("dr-04-02,13,\"Calculus: The Derivative\"");
    expect(csv).toContain(",REFUSE,\"derivativeRuleLab chain mode models two local rates");
  });

  it("retains error propagation in its already-authored exact-number and staged states", () => {
    const current = lesson("derivatives-in-context", "dc-03-02");
    const widgets = current.steps.flatMap((step) => step.widget ? [step.widget] : []);
    expect(widgets.filter((widget) => widget.type === "exactNumberLab")).toHaveLength(3);
    expect(widgets.filter((widget) => widget.type === "steppedReveal")).toHaveLength(1);
  });

  it("retains the causal base slider and visual comparison in exponential versus linear", () => {
    const current = lesson("exponential-functions", "exp-04-03");
    const expLab = current.steps.find((step) => step.widget?.type === "expLogExplore")?.widget;
    expect(expLab?.type).toBe("expLogExplore");
    expect(current.steps.filter((step) => step.figure).map((step) => step.figure)).toEqual(
      expect.arrayContaining(["exp-compare-curves", "exp-linear-vs-exp", "exp-diff-vs-ratio"])
    );
  });

  it("does not force a two-rate lab onto a three-layer chain-inside-product lesson", () => {
    const current = lesson("derivative-rules", "dr-04-02");
    const types = current.steps.flatMap((step) => step.widget ? [step.widget.type] : []);
    expect(types).not.toContain("derivativeRuleLab");
    expect(types).toContain("steppedReveal");
    expect(current.steps.find((step) => step.id === "c1")?.figure).toBe("dr-chain-gears");
  });
});
