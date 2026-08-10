import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, type TWidget, type THundredthsGrid } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";

/* S184 — the hundredthsGrid engine, the g4-decimals family, and the decimals-intro-g4 course.
 * Every expected value here is computed by INDEPENDENT arithmetic from the visible parameters,
 * never read back from the implementation under test. */

const DIR = join(__dirname, "../../content/courses/decimals-intro-g4");
const gen = VARIANT_GENERATORS.find((g) => g.tag === "g4-decimals")!;
const FORMS = (gen.forms ?? []) as readonly string[];
const BANDS = ["support", "core", "stretch"] as const;

describe("S184 hundredthsGrid engine", () => {
  const base: THundredthsGrid = {
    type: "hundredthsGrid", prompt: "Shade the grid to show 0.37.", mode: "hundredths",
    target: 37, prefilled: 0, showDecimal: true,
    commonCounts: [
      { count: 3, feedback: "That shades 3 hundredths — the tenths digit is worth 3 whole columns." },
      { count: 73, feedback: "That count swaps the digits — read the decimal place by place instead." },
    ],
    successFeedback: "Exactly 37 of the 100 cells — 0.37.",
    lowFeedback: "The shaded amount is still below the target amount for this decimal.",
    highFeedback: "The shaded amount has gone past the target amount for this decimal.",
  };
  it("parses and round-trips through the registry schema", () => {
    expect(WidgetSpec.parse(base).type).toBe("hundredthsGrid");
    // defaults materialize
    const parsed = WidgetSpec.parse({ ...base, prefilled: undefined, showDecimal: undefined, commonCounts: undefined }) as THundredthsGrid;
    expect(parsed.prefilled).toBe(0);
    expect(parsed.showDecimal).toBe(true);
    expect(parsed.commonCounts).toEqual([]);
  });
  it("grades every reachable landing class", () => {
    expect(evaluate(base, 37)).toEqual({ correct: true, feedback: base.successFeedback });
    expect(evaluate(base, 3)).toEqual({ correct: false, feedback: base.commonCounts[0].feedback });
    expect(evaluate(base, 73)).toEqual({ correct: false, feedback: base.commonCounts[1].feedback });
    expect(evaluate(base, 12)).toEqual({ correct: false, feedback: base.lowFeedback });
    expect(evaluate(base, 80)).toEqual({ correct: false, feedback: base.highFeedback });
    expect(evaluate(base, null).correct).toBe(false);
    expect(evaluate(base, undefined).correct).toBe(false);
  });
  it("named misconception counts win over the direction fallbacks on both sides of the target", () => {
    // 3 is below the target and 73 is above it — both must land on their DIAGNOSIS, not on low/high.
    expect(evaluate(base, 3).feedback).not.toBe(base.lowFeedback);
    expect(evaluate(base, 73).feedback).not.toBe(base.highFeedback);
  });
  it("tenths mode grades against the 10-cell strip", () => {
    const strip: THundredthsGrid = { ...base, mode: "tenths", prompt: "Shade the strip to show 0.3.", target: 3, commonCounts: [] };
    expect(evaluate(strip, 3).correct).toBe(true);
    expect(evaluate(strip, 2).feedback).toBe(strip.lowFeedback);
    expect(evaluate(strip, 9).feedback).toBe(strip.highFeedback);
  });
});

describe("S184 g4-decimals generator family — independent arithmetic over every form", () => {
  it("declares exactly the 15 forms", () => {
    expect(FORMS.length).toBe(15);
  });
  it("every form x band x 40 seeds: parses, self-grades, traps are wrong and distinct, decimals stay in Grade-4 range", () => {
    let n = 0;
    for (const form of FORMS) for (const band of BANDS) for (let s = 0; s < 40; s++) {
      const v = variantForGenForm(gen.tag, form, `s184-${form}-${band}-${s}`, band)!;
      const w = WidgetSpec.parse(v.widget) as TWidget;
      n++;
      if (w.type === "numeric") {
        const a = v.answer as number;
        expect(evaluate(w, a).correct).toBe(true);
        // Grade-4 decimal range: every numeric answer in this family is either a decimal in (0, 1)
        // or a whole hundredths/cells count in [1, 100].
        if (Number.isInteger(a)) expect(a).toBeGreaterThanOrEqual(1);
        else { expect(a).toBeGreaterThan(0); expect(a).toBeLessThan(1); }
        expect(a).toBeLessThanOrEqual(100);
        const vals = w.commonErrors.map((e) => e.value);
        expect(new Set(vals).size).toBe(vals.length);
        for (const e of w.commonErrors) {
          expect(e.value).not.toBe(a);
          const r = evaluate(w, e.value);
          expect(r.correct).toBe(false);
          expect(r.feedback).toBe(e.feedback);
        }
      } else if (w.type === "mcq") {
        const correct = w.options.filter((o) => o.correct);
        expect(correct.length).toBe(1);
        expect(v.answer).toBe(correct[0].id);
        expect(evaluate(w, correct[0].id).correct).toBe(true);
        for (const o of w.options) if (!o.correct) expect(evaluate(w, o.id).correct).toBe(false);
      } else if (w.type === "rationalCompare") {
        // Recompute the relation from the operand strings themselves.
        const num = (op: typeof w.left) => "value" in op ? Number(op.value) : op.num / op.den;
        const L = num(w.left), R = num(w.right);
        const rel = L < R ? "lt" : L > R ? "gt" : "eq";
        expect(w.answer).toBe(rel);
        expect(evaluate(w, rel).correct).toBe(true);
        const slots: Record<string, string | undefined> = { lt: w.ltFeedback, eq: w.eqFeedback, gt: w.gtFeedback };
        expect(slots[rel]).toBeUndefined();
        for (const r of ["lt", "eq", "gt"] as const) if (r !== rel) {
          expect(slots[r]).toBeTruthy();
          expect(evaluate(w, r).correct).toBe(false);
        }
      } else if (w.type === "dragOrder") {
        const byId = new Map(w.items.map((i) => [i.id, Number(i.label)]));
        const got = w.correctOrder.map((i) => byId.get(i)!);
        expect([...got].sort((a, b) => a - b)).toEqual(got);
        expect(new Set(got).size).toBe(got.length);
        expect(evaluate(w, w.correctOrder).correct).toBe(true);
        expect(evaluate(w, [...w.correctOrder].reverse()).correct).toBe(false);
      } else {
        throw new Error(`unexpected surface ${w.type} from form ${form}`);
      }
    }
    expect(n).toBe(15 * 3 * 40);
  });
  it("dTrailingZeroRational always resolves to eq; dOrderDrag always carries the digit-count trap pair", () => {
    for (let s = 0; s < 60; s++) {
      const tz = variantForGenForm(gen.tag, "dTrailingZeroRational", `tz-${s}`, "core")!;
      expect(tz.answer).toBe("eq");
      const od = variantForGenForm(gen.tag, "dOrderDrag", `od-${s}`, "core")!;
      const w = od.widget as Extract<TWidget, { type: "dragOrder" }>;
      const vals = w.items.map((i) => i.label);
      const oneDigit = vals.filter((x) => /^\d\.\d$/.test(x)), twoDigit = vals.filter((x) => /^\d\.\d\d$/.test(x));
      expect(oneDigit.length).toBeGreaterThanOrEqual(1);
      expect(twoDigit.length).toBeGreaterThanOrEqual(1);
      // The trap: at least one one-digit decimal strictly greater than at least one two-digit one.
      expect(oneDigit.some((a) => twoDigit.some((b) => Number(a) > Number(b)))).toBe(true);
    }
  });
  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of FORMS) {
      const a = variantForGenForm(gen.tag, form, `det-${form}`, "core");
      const b = variantForGenForm(gen.tag, form, `det-${form}`, "core");
      expect(b).toEqual(a);
    }
  });
});

describe("S184 decimals-intro-g4 — the 18 built lessons re-derived from disk", () => {
  const files = readdirSync(join(DIR, "lessons")).filter((f) => f.endsWith(".json")).sort();
  const course = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
  it("course shape: 3 chapters x 6 lessons, ids sequential, files match course.json", () => {
    expect(files.length).toBe(18);
    expect(course.chapters.length).toBe(3);
    const ids = course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(ids).toEqual(files.map((f) => f.replace(".json", "")));
    for (const c of course.chapters) expect(c.lessonIds.length).toBe(6);
  });
  for (const f of files) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8"));
    it(`${lesson.id}: A-tier shape, engine invariants, gradable end to end`, () => {
      const kinds = lesson.steps.map((s: { kind: string }) => s.kind);
      expect(kinds).toEqual(["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]);
      const i1 = lesson.steps[1];
      // i1 is the hundredthsGrid engine with a prediction, every lesson.
      expect(i1.widget.type).toBe("hundredthsGrid");
      expect(i1.predict).toBeTruthy();
      expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        if (w.type === "hundredthsGrid") {
          const total = w.mode === "tenths" ? 10 : 100;
          expect(w.target).toBeGreaterThanOrEqual(0);
          expect(w.target).toBeLessThanOrEqual(total);
          expect(w.prefilled).toBeLessThanOrEqual(w.target);
          expect(evaluate(w, w.target).correct).toBe(true);
          for (const c of w.commonCounts) {
            expect(c.count).not.toBe(w.target);
            expect(evaluate(w, c.count)).toEqual({ correct: false, feedback: c.feedback });
          }
          if (w.target > w.prefilled) expect(evaluate(w, w.prefilled).correct).toBe(false);
        }
        if (w.type === "numeric") {
          expect(evaluate(w, w.answer).correct).toBe(true);
          expect(w.commonErrors.length).toBeGreaterThanOrEqual(2 - (s.id.startsWith("rem-") ? 1 : 0));
          for (const e of w.commonErrors) expect(evaluate(w, e.value)).toEqual({ correct: false, feedback: e.feedback });
        }
        if (w.type === "mcq") {
          const c = w.options.filter((o) => o.correct);
          expect(c.length).toBe(1);
          expect(evaluate(w, c[0].id).correct).toBe(true);
        }
        if (w.type === "rationalCompare") {
          const num = (op: typeof w.left) => "value" in op ? Number(op.value) : op.num / op.den;
          const rel = num(w.left) < num(w.right) ? "lt" : num(w.left) > num(w.right) ? "gt" : "eq";
          expect(w.answer).toBe(rel);
          const slots: Record<string, string | undefined> = { lt: w.ltFeedback, eq: w.eqFeedback, gt: w.gtFeedback };
          expect(slots[rel]).toBeUndefined();
          expect(evaluate(w, rel).correct).toBe(true);
        }
        if (w.type === "dragOrder") {
          const byId = new Map(w.items.map((i) => [i.id, Number(i.label)]));
          const got = w.correctOrder.map((i) => byId.get(i)!);
          expect([...got].sort((a, b) => a - b)).toEqual(got);
          expect(evaluate(w, w.correctOrder).correct).toBe(true);
        }
        // variant declarations must reference the registered family and a real form
        if (s.variant) {
          expect(s.variant.gen).toBe("g4-decimals");
          expect(FORMS).toContain(s.variant.form);
        }
      }
      // graded steps are all variant-backed
      for (const sid of ["k1", "k2", "k3", "ch1"]) {
        const s = lesson.steps.find((x: { id: string }) => x.id === sid);
        expect(s.variant?.gen).toBe("g4-decimals");
        expect(s.hints?.length).toBe(3);
        expect(s.explanationVariants?.length).toBeGreaterThanOrEqual(2);
      }
      // remedial exists and its check grades
      expect(lesson.remedials.length).toBe(1);
      const rw = WidgetSpec.parse(lesson.remedials[0].check.widget) as TWidget;
      if (rw.type === "numeric") expect(evaluate(rw, rw.answer).correct).toBe(true);
    });
  }
});
