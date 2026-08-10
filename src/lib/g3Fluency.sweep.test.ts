import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";
import { factFamilyKey, parseFactFamily } from "./factFluency";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solveG3FluencyPrompt } = require2("./g3FluencyIndependent.cjs");

const MULT_FORMS = [
  "MultTable2Numeric", "MultTable3Numeric", "MultTable4Numeric", "MultTable5Numeric",
  "MultTable6Numeric", "MultTable7Numeric", "MultTable8Numeric", "MultTable9Numeric", "MultTable10Numeric",
  "MultSquaresNumeric", "MultHardFactsNumeric", "MultDeriveNumeric", "MultMixedSmallNumeric",
  "MultMixedLargeNumeric", "MultRecallSpeedNumeric", "MultMissingFactorNumeric",
  "MultFactFamilyNumeric", "MultWholeTableNumeric",
];
const DIV_FORMS = [
  "DivBy2Numeric", "DivBy3Numeric", "DivBy45Numeric", "DivBy67Numeric", "DivBy89Numeric", "DivBy10Numeric",
  "DivThinkMultNumeric", "DivMissingNumeric", "DivSpecialNumeric", "DivZeroMcq", "DivMixedNumeric", "DivChooseMcq",
];

describe("S186 g3-mult-fluency / g3-div-fluency — registered exactly once, with the right forms", () => {
  it("both tags are registered in VARIANT_GENERATORS with no duplicates", () => {
    const mult = VARIANT_GENERATORS.filter((g) => g.tag === "g3-mult-fluency");
    const div = VARIANT_GENERATORS.filter((g) => g.tag === "g3-div-fluency");
    expect(mult).toHaveLength(1);
    expect(div).toHaveLength(1);
    expect([...(mult[0].forms ?? [])].sort()).toEqual([...MULT_FORMS].sort());
    expect([...(div[0].forms ?? [])].sort()).toEqual([...DIV_FORMS].sort());
  });
});

describe("S186 g3-mult-fluency — every form x band x 60 seeds", () => {
  for (const form of MULT_FORMS) {
    it(`${form}: parses, self-grades, solver agrees, traps are wrong and distinct`, () => {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 60; seed++) {
          const v = variantForGenForm("g3-mult-fluency", form, `s186-mf-${form}-${band}-${seed}`, band)!;
          expect(v, `${form} seed ${seed}`).not.toBeNull();
          const w = WidgetSpec.parse(v.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          expect(w.type).toBe("numeric");
          if (w.type !== "numeric") return;
          const solved = solveG3FluencyPrompt(form, w.prompt);
          expect(solved, `${form} seed ${seed}: "${w.prompt}"`).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(20);
          }
          // Every mult form's product must be a real Grade-3 fact: both factors 0..10.
          expect(Number.isInteger(w.answer)).toBe(true);
          expect(w.answer).toBeGreaterThanOrEqual(0);
          expect(w.answer).toBeLessThanOrEqual(100);
        }
      }
    });
  }

  it("every drill form's params.factFamily is present, canonical, and matches the actual product (or, for missing-factor, one of its two factors)", () => {
    for (const form of MULT_FORMS) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = variantForGenForm("g3-mult-fluency", form, `s186-ff-${form}-${seed}`, "core")!;
        const family = v.params?.factFamily as string | undefined;
        expect(family, `${form} seed ${seed} missing factFamily`).toBeDefined();
        expect(() => parseFactFamily(family!)).not.toThrow();
        const { lo, hi, product } = parseFactFamily(family!);
        if (form === "MultMissingFactorNumeric" || form === "MultFactFamilyNumeric") {
          expect([lo, hi, product], `${form} seed ${seed}: family ${family} vs answer ${v.answer}`).toContain(v.answer);
        } else {
          expect(product, `${form} seed ${seed}: family ${family} vs answer ${v.answer}`).toBe(v.answer);
        }
      }
    }
  });

  it("table forms (MultTableNNumeric) only ever draw facts containing their own table factor", () => {
    for (let t = 2; t <= 10; t++) {
      const form = `MultTable${t}Numeric`;
      for (let seed = 1; seed <= 40; seed++) {
        const v = variantForGenForm("g3-mult-fluency", form, `s186-tbl-${t}-${seed}`, "core")!;
        const { lo, hi } = parseFactFamily(v.params!.factFamily as string);
        expect(lo === t || hi === t, `${form} seed ${seed} family ${v.params!.factFamily}`).toBe(true);
      }
    }
  });

  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of MULT_FORMS) {
      const a = variantForGenForm("g3-mult-fluency", form, "s186-det", "core");
      const b = variantForGenForm("g3-mult-fluency", form, "s186-det", "core");
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});

describe("S186 g3-div-fluency — every form x band x 60 seeds", () => {
  for (const form of DIV_FORMS) {
    it(`${form}: parses, self-grades, solver agrees, traps are wrong and distinct`, () => {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 60; seed++) {
          const v = variantForGenForm("g3-div-fluency", form, `s186-df-${form}-${band}-${seed}`, band)!;
          expect(v, `${form} seed ${seed}`).not.toBeNull();
          const w = WidgetSpec.parse(v.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          if (w.type === "numeric") {
            const solved = solveG3FluencyPrompt(form, w.prompt);
            expect(solved, `${form} seed ${seed}: "${w.prompt}"`).toBe(w.answer);
            expect(evaluate(w, w.answer).correct).toBe(true);
            const vals = w.commonErrors.map((e) => e.value);
            expect(new Set(vals).size).toBe(vals.length);
            for (const e of w.commonErrors) {
              expect(e.value).not.toBe(w.answer);
              expect(evaluate(w, e.value).correct).toBe(false);
              expect(e.feedback.length).toBeGreaterThanOrEqual(20);
            }
            expect(Number.isInteger(w.answer) && w.answer >= 0).toBe(true);
          } else if (w.type === "mcq") {
            const labels = w.options.map((o) => o.label);
            const solvedLabel = solveG3FluencyPrompt(form, `${w.prompt}||${labels.join(";;")}`);
            const correct = w.options.find((o) => o.correct)!;
            expect(solvedLabel, `${form} seed ${seed}`).toBe(correct.label);
            expect(w.options.filter((o) => o.correct)).toHaveLength(1);
            expect(new Set(labels).size).toBe(labels.length);
            const wrongFeedback = w.options.filter((o) => !o.correct).map((o) => o.feedback);
            expect(new Set(wrongFeedback).size).toBe(wrongFeedback.length);
            expect(evaluate(w, correct.id).correct).toBe(true);
            for (const o of w.options.filter((x) => !x.correct)) expect(evaluate(w, o.id).correct).toBe(false);
          } else {
            throw new Error(`unexpected surface ${w.type} for ${form}`);
          }
        }
      }
    });
  }

  it("every numeric drill form's params.factFamily (where present) is canonical and self-consistent", () => {
    const factFamilyForms = ["DivBy2Numeric", "DivBy3Numeric", "DivBy45Numeric", "DivBy67Numeric",
      "DivBy89Numeric", "DivBy10Numeric", "DivThinkMultNumeric", "DivMissingNumeric",
      "DivSpecialNumeric", "DivMixedNumeric"];
    for (const form of factFamilyForms) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = variantForGenForm("g3-div-fluency", form, `s186-dff-${form}-${seed}`, "core")!;
        const family = v.params?.factFamily as string | undefined;
        expect(family, `${form} seed ${seed} missing factFamily`).toBeDefined();
        expect(() => parseFactFamily(family!)).not.toThrow();
      }
    }
  });

  it("DivZeroMcq and DivChooseMcq intentionally carry NO factFamily (conceptual/operation-choice, not fact recall)", () => {
    for (const form of ["DivZeroMcq", "DivChooseMcq"]) {
      for (let seed = 1; seed <= 10; seed++) {
        const v = variantForGenForm("g3-div-fluency", form, `s186-nf-${form}-${seed}`, "core")!;
        expect(v.params?.factFamily).toBeUndefined();
      }
    }
  });

  it("division families reuse the SAME canonical key as their multiplication counterpart", () => {
    // 56÷7's family must equal 7×8's family — the whole point of the fact-family unification.
    expect(factFamilyKey(7, 8)).toBe(factFamilyKey(8, 7));
    for (let seed = 1; seed <= 30; seed++) {
      const v = variantForGenForm("g3-div-fluency", "DivMixedNumeric", `s186-recip-${seed}`, "core")!;
      const family = v.params!.factFamily as string;
      const { lo, hi, product } = parseFactFamily(family);
      // The division fact tested (product ÷ one factor = other factor) belongs to the identical
      // family a multiplication lesson would tag for the same {lo, hi, product} triple.
      expect(factFamilyKey(lo, hi)).toBe(family);
      expect(lo * hi).toBe(product);
    }
  });

  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of DIV_FORMS) {
      const a = variantForGenForm("g3-div-fluency", form, "s186-det", "core");
      const b = variantForGenForm("g3-div-fluency", form, "s186-det", "core");
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});
