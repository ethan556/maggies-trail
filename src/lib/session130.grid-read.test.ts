import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import { WidgetSpec, widgetIntegrityErrors, type TAreaModel } from "./schema";
import { variantForGenForm } from "./variants";

const files = [
  join(process.cwd(), "content/courses/shapes-shares-g2/lessons/ssg2-02-02.json"),
  join(process.cwd(), "content/courses/shapes-shares-g2/lessons/ssg2-02-03.json")
];

function convertedSpecs(): TAreaModel[] {
  const out: TAreaModel[] = [];
  for (const file of files) {
    const lesson = JSON.parse(readFileSync(file, "utf8")) as {
      steps: Array<{ id: string; widget?: unknown }>;
      remedials: Array<{ check: { widget: unknown } }>;
    };
    for (const step of lesson.steps) {
      if (!["i1", "i2", "i3", "k1", "k2", "k3", "ch1"].includes(step.id)) continue;
      const spec = WidgetSpec.parse(step.widget);
      if (spec.type !== "areaModel") throw new Error(`${file}/${step.id}: expected areaModel`);
      out.push(spec);
    }
    const rem = WidgetSpec.parse(lesson.remedials[0].check.widget);
    if (rem.type !== "areaModel") throw new Error(`${file}/remedial: expected areaModel`);
    out.push(rem);
  }
  return out;
}

describe("Session 130 fixed-grid counting", () => {
  it("draws every authored grid with exact rows × columns = answer", () => {
    const specs = convertedSpecs();
    expect(specs).toHaveLength(16);
    for (const spec of specs) {
      expect(spec.countGrid).toBe(true);
      expect(spec.hStart * spec.wStart).toBe(spec.targetArea);
      expect(spec.hStart).toBe(spec.hMax);
      expect(spec.wStart).toBe(spec.wMax);
      expect(widgetIntegrityErrors(spec)).toEqual([]);
    }
  });

  it("requires a marked count and preserves every authored misconception landing", () => {
    for (const spec of convertedSpecs()) {
      expect(canCheck(spec, undefined)).toBe(false);
      expect(canCheck(spec, 0)).toBe(false);
      expect(canCheck(spec, 1)).toBe(true);
      expect(evaluate(spec, spec.targetArea)).toEqual({ correct: true, feedback: spec.successFeedback });
      for (const trap of spec.commonCounts) {
        expect(evaluate(spec, trap.count)).toEqual({ correct: false, feedback: trap.feedback });
      }
    }
  });

  it("reports counted learner work without changing the correct-answer contract", () => {
    const spec = convertedSpecs()[0];
    expect(correctAnswerText(spec)).toBe("25 unit squares");
    expect(learnerAnswerText(spec, 10)).toBe("10 unit squares");
  });

  it("rejects resizing, impossible totals, duplicate traps, and correct-answer traps", () => {
    const base = convertedSpecs()[0];
    const bad = [
      WidgetSpec.parse({ ...base, wMax: base.wMax + 1 }),
      WidgetSpec.parse({ ...base, targetArea: base.targetArea + 1 }),
      WidgetSpec.parse({ ...base, commonCounts: [...base.commonCounts, base.commonCounts[0]] }),
      WidgetSpec.parse({ ...base, commonCounts: [{ count: base.targetArea, feedback: "wrong slot" }] })
    ];
    const errors = bad.map(widgetIntegrityErrors).flat().join("\n");
    expect(errors).toContain("must match");
    expect(errors).toContain("not target");
    expect(errors).toContain("duplicate common count");
    expect(errors).toContain("equals the correct total");
  });

  it("keeps deterministic practice on the same areaModel counting surface", () => {
    for (const form of ["read", "colTrapRead", "squareRead"] as const) {
      for (let seed = 0; seed < 12; seed++) {
        const v = variantForGenForm("grid-count", form, `s130:${form}:${seed}`, "core");
        expect(v?.widget.type).toBe("areaModel");
        if (v?.widget.type !== "areaModel") throw new Error("wrong surface");
        expect(v.widget.countGrid).toBe(true);
        expect(v.widget.wStart * v.widget.hStart).toBe(v.answer);
      }
    }
    for (const band of ["support", "core", "stretch"] as const) {
      for (let seed = 0; seed < 128; seed++) {
        const v = variantForGenForm("g2-shapes-shares", "Ssg2GridApplyRead", `s130:g2:${band}:${seed}`, band);
        expect(v?.widget.type).toBe("areaModel");
        if (v?.widget.type !== "areaModel") throw new Error("wrong surface");
        expect(v.widget.countGrid).toBe(true);
        expect(v.widget.wStart * v.widget.hStart).toBe(v.answer);
        expect(widgetIntegrityErrors(v.widget)).toEqual([]);
        if (typeof v.answer !== "number") throw new Error("grid-read answers must be numeric");
        expect(v.widget.commonCounts.every((entry) => entry.count > 0 && typeof v.answer === "number" && entry.count < v.answer)).toBe(true);
      }
    }
  });
});
