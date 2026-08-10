import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, widgetIntegrityErrors, type TWidget, type TBarBuilder, type TGraphRead } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";
import { createRequire } from "node:module";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt } = require2("./g1Independent.cjs");
const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ------------------------------------------------------------------ engines */

describe("S185 barBuilder display extension", () => {
  const base = {
    type: "barBuilder", prompt: "Tally the votes: Cats 7, Dogs 4.",
    categories: ["Cats", "Dogs"], target: [7, 4], maxVal: 10, step: 1, histogram: false,
    successFeedback: "done", partialFeedback: "compare each row against its count",
  };
  it("parses all three displays and defaults display to bar", () => {
    for (const display of ["bar", "tally", "pictograph"] as const) {
      const parsed = WidgetSpec.parse({ ...base, display }) as TBarBuilder;
      expect(parsed.display).toBe(display);
      expect(widgetIntegrityErrors(parsed)).toEqual([]);
    }
    const noDisplay = WidgetSpec.parse(base) as TBarBuilder;
    expect(noDisplay.display).toBe("bar");
    expect(noDisplay.icon).toBe("●");
  });
  it("grading is display-independent: the same heights grade identically under all three displays", () => {
    for (const display of ["bar", "tally", "pictograph"] as const) {
      const spec = WidgetSpec.parse({ ...base, display }) as TWidget;
      expect(evaluate(spec, [7, 4]).correct).toBe(true);
      expect(evaluate(spec, [7, 3]).correct).toBe(false);
      expect(evaluate(spec, [4, 7]).correct).toBe(false);
    }
  });
});

describe("S185 graphRead tally mode", () => {
  const tally = (drawn: number, extra: Record<string, unknown> = {}) => WidgetSpec.parse({
    type: "graphRead", prompt: "How many votes?", mode: "tally", drawn, unitValue: 1,
    categoryLabel: "Monday", unitNoun: "vote", unitNounPlural: "votes", scaleMax: Math.max(drawn + 3, 5),
    icon: "●", commonResults: [], fallbackFeedback: "count fives then ones", successFeedback: "yes",
    ...extra,
  }) as TGraphRead;
  it("parses, validates, and grades the marker against the drawn count", () => {
    const spec = tally(12);
    expect(widgetIntegrityErrors(spec)).toEqual([]);
    expect(evaluate(spec as TWidget, { picked: 12 }).correct).toBe(true);
    expect(evaluate(spec as TWidget, { picked: 10 }).correct).toBe(false);
    expect(evaluate(spec as TWidget, { picked: 4 }).correct).toBe(false);
  });
  it("validity: rejects tally past 25 marks and any non-unit tally value", () => {
    expect(widgetIntegrityErrors(tally(26, { scaleMax: 30 })).join(" ")).toMatch(/five-group range/);
    expect(widgetIntegrityErrors(tally(12, { unitValue: 2, scaleMax: 30 })).join(" ")).toMatch(/unitValue must be 1/);
    expect(widgetIntegrityErrors(tally(25, { scaleMax: 28 }))).toEqual([]);
  });
});

/* ------------------------------------------------------- g1-data generators */

describe("S185 g1-data generator family — independent arithmetic over every form", () => {
  const gen = VARIANT_GENERATORS.find((g) => g.tag === "g1-data")!;
  const FORMS = ["GdTotalNumeric", "GdCompareNumeric", "GdMostMcq", "GdLeastMcq", "GdTallyReadNumeric",
    "GdTallyMakeNumeric", "GdTallySinglesNumeric", "GdNotCategoryNumeric", "GdQuestionMcq", "GdSortMcq",
    "GdInterpretMcq", "GdBarCompareNumeric"];
  it("declares exactly the 12 forms", () => {
    expect(gen).toBeDefined();
    expect([...(gen.forms ?? [])].sort()).toEqual([...FORMS].sort());
  });
  it("every form x band x 40 seeds: parses, self-grades, independent solver agrees, traps are wrong and distinct", () => {
    for (const form of FORMS) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 40; seed++) {
          const v = variantForGenForm("g1-data", form, `s185-${form}-${band}-${seed}`, band)!;
          const w = WidgetSpec.parse(v.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          if (w.type === "numeric") {
            const solved = solvePrompt(form, w.prompt);
            expect(solved, `${form} seed ${seed}`).toBe(w.answer);
            expect(Number.isInteger(w.answer) && w.answer >= 0 && w.answer <= 25).toBe(true);
            expect(evaluate(w, w.answer).correct).toBe(true);
            const vals = w.commonErrors.map((e) => e.value);
            expect(new Set(vals).size).toBe(vals.length);
            for (const e of w.commonErrors) {
              expect(e.value).not.toBe(w.answer);
              expect(evaluate(w, e.value).correct).toBe(false);
              expect(e.feedback.length).toBeGreaterThanOrEqual(25);
            }
          } else if (w.type === "mcq") {
            const labels = w.options.map((o) => o.label);
            const solvedLabel = solvePrompt(form, `${w.prompt}||${labels.join(";;")}`);
            const correct = w.options.find((o) => o.correct)!;
            expect(solvedLabel, `${form} seed ${seed}`).toBe(correct.label);
            expect(w.options.filter((o) => o.correct)).toHaveLength(1);
            expect(new Set(labels).size).toBe(labels.length);
            const wrongFeedback = w.options.filter((o) => !o.correct).map((o) => o.feedback);
            expect(new Set(wrongFeedback).size, `${form} seed ${seed} distinct diagnoses`).toBe(wrongFeedback.length);
            expect(evaluate(w, correct.id).correct).toBe(true);
            for (const o of w.options.filter((x) => !x.correct)) expect(evaluate(w, o.id).correct).toBe(false);
          } else {
            throw new Error(`unexpected surface ${w.type} for ${form}`);
          }
        }
      }
    }
  });
  it("tally forms honor five-group arithmetic on their own terms", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const make = variantForGenForm("g1-data", "GdTallyMakeNumeric", `s185-tm-${seed}`, "core")!;
      const n = Number((make.widget.prompt as string).match(/(\d+) students/)![1]);
      expect(make.answer).toBe(Math.floor(n / 5));
      const singles = variantForGenForm("g1-data", "GdTallySinglesNumeric", `s185-ts-${seed}`, "core")!;
      const m = Number((singles.widget.prompt as string).match(/(\d+) students/)![1]);
      expect(singles.answer).toBe(m % 5);
      expect(m % 5).not.toBe(0);
      expect(m % 5).not.toBe(Math.floor(m / 5)); // the trap must stay a WRONG answer
    }
  });
  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of FORMS) {
      const a = variantForGenForm("g1-data", form, "s185-det", "core")!;
      const b = variantForGenForm("g1-data", form, "s185-det", "core")!;
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
  it("cats3-backed forms always carry three distinct counts, so most/fewest is single-valued", () => {
    for (const form of ["GdMostMcq", "GdLeastMcq", "GdInterpretMcq", "GdTotalNumeric"]) {
      for (let seed = 1; seed <= 50; seed++) {
        const v = variantForGenForm("g1-data", form, `s185-c3-${seed}`, "core")!;
        const m = (v.widget.prompt as string).match(/\w+ (\d+), \w+ (\d+), \w+ (\d+)/);
        if (!m) continue;
        const counts = [Number(m[1]), Number(m[2]), Number(m[3])];
        expect(new Set(counts).size).toBe(3);
      }
    }
  });
});

/* ----------------------------------------------------- the 12 built lessons */

describe("S185 data-graphs-g1 — the 12 built lessons re-derived from disk", () => {
  const dir = join(__dirname, "../../content/courses/data-graphs-g1");
  const course = JSON.parse(readFileSync(join(dir, "course.json"), "utf8"));
  const files = readdirSync(join(dir, "lessons")).sort();
  it("course shape: 3 chapters x 4 lessons, files match course.json, grade 1", () => {
    expect(course.gradeLevel).toBe(1);
    expect(course.chapters).toHaveLength(3);
    expect(course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds)).toHaveLength(12);
    expect(files).toHaveLength(12);
    expect(files.map((f) => f.replace(/\.json$/, ""))).toEqual(course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds));
  });
  const engineFor: Record<string, string[]> = {
    "dgr1-01-01": ["graphRead:picture", "graphRead:picture"],
    "dgr1-01-02": ["dragBucket", "barBuilder:pictograph"],
    "dgr1-01-03": ["barBuilder:tally", "barBuilder:tally"],
    "dgr1-01-04": ["graphRead:tally", "graphRead:tally"],
    "dgr1-02-01": ["barBuilder:pictograph", "barBuilder:pictograph"],
    "dgr1-02-02": ["graphRead:picture", "graphRead:picture"],
    "dgr1-02-03": ["barBuilder:bar", "barBuilder:bar"],
    "dgr1-02-04": ["graphRead:bar", "graphRead:bar"],
    "dgr1-03-01": ["barBuilder:bar", "barBuilder:bar"],
    "dgr1-03-02": ["graphRead:bar", "barBuilder:bar"],
    "dgr1-03-03": ["barBuilder:pictograph", "barBuilder:pictograph"],
    "dgr1-03-04": ["graphRead:tally", "barBuilder:bar"],
  };
  for (const file of files) {
    const lesson = JSON.parse(readFileSync(join(dir, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, S185 engine displays, every graded step independently re-derived`, () => {
      const kinds = lesson.steps.map((s: { kind: string }) => s.kind);
      expect(kinds).toEqual(["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]);
      expect(lesson.readingProfile).toBe("early");
      const [i1, i2] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      expect(i1.predict).toBeDefined();
      expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      expect(i2.predict).toBeUndefined();
      const sig = (w: { type: string; display?: string; mode?: string }) =>
        w.type === "barBuilder" ? `barBuilder:${w.display}` : w.type === "graphRead" ? `graphRead:${w.mode}` : w.type;
      expect([sig(i1.widget), sig(i2.widget)]).toEqual(engineFor[lesson.id]);
      for (const s of [i1, i2]) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        if (w.type === "barBuilder") {
          expect(evaluate(w, w.target).correct).toBe(true);
          const off = w.target.map((t: number, k: number) => (k === 0 ? t + 1 : t));
          expect(evaluate(w, off).correct).toBe(false);
        } else if (w.type === "graphRead") {
          expect(evaluate(w, { picked: w.drawn * w.unitValue }).correct).toBe(true);
          expect(evaluate(w, { picked: w.drawn * w.unitValue + 1 }).correct).toBe(false);
          for (const t of w.commonResults) expect(t.value).not.toBe(w.drawn * w.unitValue);
        } else if (w.type === "dragBucket") {
          const right = Object.fromEntries(w.items.map((it) => [it.id, it.bucketId]));
          expect(evaluate(w, right).correct).toBe(true);
          const [first, ...rest] = w.items;
          const wrongBucket = w.buckets.find((b) => b.id !== first.bucketId)!;
          expect(evaluate(w, { ...right, [first.id]: wrongBucket.id }).correct).toBe(false);
          expect(rest.length).toBeGreaterThanOrEqual(1);
        }
      }
      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        expect(s.variant?.gen).toBe("g1-data");
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        if (w.type === "numeric") {
          expect(solvePrompt(s.variant.form, w.prompt)).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
            expect(evaluate(w, e.value).correct).toBe(false);
          }
        } else if (w.type === "mcq") {
          const labels = w.options.map((o) => o.label);
          const correct = w.options.find((o) => o.correct)!;
          expect(solvePrompt(s.variant.form, `${w.prompt}||${labels.join(";;")}`)).toBe(correct.label);
          expect(evaluate(w, correct.id).correct).toBe(true);
        }
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);
      }
      const rem = lesson.remedials[0];
      expect(rem.conceptTag).toBe(lesson.steps[1].conceptTag);
      const rw = WidgetSpec.parse(rem.check.widget) as TWidget;
      expect(["numeric", "mcq"]).toContain(rw.type);
      expect(widgetIntegrityErrors(rw)).toEqual([]);
    });
  }
  it("seeded variant resolution is exercised over every authored (gen, form) pair in the course", () => {
    const pairs = new Set<string>();
    for (const file of files) {
      const lesson = JSON.parse(readFileSync(join(dir, "lessons", file), "utf8"));
      for (const s of lesson.steps) if (s.variant) pairs.add(`${s.variant.gen}::${s.variant.form}`);
    }
    expect(pairs.size).toBeGreaterThanOrEqual(10);
    for (const pair of pairs) {
      const [g, f] = pair.split("::");
      const rand = mulberry(99);
      const v = variantForGenForm(g, f, `s185-pair-${Math.floor(rand() * 1e9)}`, "core")!;
      expect(() => WidgetSpec.parse(v.widget)).not.toThrow();
    }
  });
});
