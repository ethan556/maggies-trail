import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";
import { factDrillFor, parseFamily, sumFamilyKey } from "./factFluency";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG2Prompt } = require2("./g2Independent.cjs");

const DIR = join(__dirname, "../../content/courses/fluency-20-g2");
const TAG = "g2-fluency";

// This course restates most check/challenge prompts as free-form English sentences with numbers
// spelled out ("Nine is mirrored by another nine") rather than digits, for surface variety beyond
// k1's fixed "${a} + ${b} = ?" shape — so a digit-only /\d+/g scan misses every spelled-out number
// and would wrongly flag a correctly-tagged factFamily as "unrelated to the prompt". Extract word
// numbers the same way the independent solver (g2Independent.cjs) does.
const ONE_WORDS: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
function wordNums(prompt: string): number[] {
  const out: number[] = [];
  for (const tok of prompt.match(/[A-Za-z]+/g) ?? []) {
    const t = tok.toLowerCase();
    if (t in ONE_WORDS) out.push(ONE_WORDS[t]);
    else if (t === "sixes") out.push(6);
    else if (t.endsWith("s") && t.slice(0, -1) in ONE_WORDS) out.push(ONE_WORDS[t.slice(0, -1)]);
  }
  return out;
}

describe("S188 fluency-20-g2 — course shape", () => {
  it("3 chapters (4/4/6), ids sequential, files match course.json, grade 2", () => {
    const course = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(course.gradeLevel).toBe(2);
    expect(course.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([4, 4, 6]);
    const declared = course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
    const files = readdirSync(join(DIR, "lessons")).sort().map((f) => f.replace(/\.json$/, ""));
    expect(files).toEqual(declared);
  });
});

describe("S188 fluency-20-g2 — every lesson re-derived from disk", () => {
  for (const file of readdirSync(join(DIR, "lessons")).sort()) {
    const lesson = JSON.parse(readFileSync(join(DIR, "lessons", file), "utf8"));
    it(`${lesson.id}: A-tier shape, additive tagging, gradable end to end`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );
      expect(lesson.readingProfile).toBe("early");

      const [i1, i2] = lesson.steps.filter((s: { kind: string }) => s.kind === "interactive");
      expect(i1.predict).toBeDefined();
      expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId)).toBe(true);
      expect(i2.predict).toBeUndefined();

      // interactive manipulatives must be ADDITIVE engines, and must grade at their solution
      for (const s of [i1, i2]) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        // i1 is a constructive additive engine (tenFrame/numberLineHop); i2 is always the
        // tapDiagram "select the total" engine — pinned course-wide by
        // session251.fluency20G2CourseIntegrity.test.tsx ("second.type" must be "tapDiagram").
        expect(["tenFrame", "numberLineHop", "tapDiagram"]).toContain(w.type);
        if (w.type === "tenFrame") {
          expect(w.preFilled).toBeLessThan(w.target);
          expect(evaluate(w, w.target).correct).toBe(true);
          expect(evaluate(w, w.target - 1).correct).toBe(false);
        } else if (w.type === "numberLineHop") {
          const landing = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
          expect(landing).toBeGreaterThanOrEqual(w.min);
          expect(landing).toBeLessThanOrEqual(w.max);
          expect(evaluate(w, landing).correct).toBe(true);
          expect(evaluate(w, landing + 1).correct).toBe(false);
          for (const t of w.commonLandings) expect(t.value).not.toBe(landing);
        } else if (w.type === "tapDiagram") {
          const correct = w.hotspots.filter((h) => h.correct);
          expect(correct).toHaveLength(1);
          for (const h of w.hotspots) expect(evaluate(w, [h.id]).correct).toBe(h.correct);
        }
      }

      let tagged = 0;
      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        expect(s.variant?.gen).toBe(TAG);
        expect(s.hints).toHaveLength(3);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);

        if (w.type === "numeric") {
          // independent solver, not the generator
          expect(solveG2Prompt(s.variant.form, w.prompt)).toBe(w.answer);
          expect(evaluate(w, w.answer).correct).toBe(true);
          const vals = w.commonErrors.map((e) => e.value);
          expect(new Set(vals).size).toBe(vals.length);
          for (const e of w.commonErrors) {
            expect(e.value).not.toBe(w.answer);
            expect(e.value).toBeGreaterThanOrEqual(0); // a trap must be typeable
            expect(evaluate(w, e.value).correct).toBe(false);
            expect(e.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }

        // the family must be ADDITIVE, canonical, within 20, and match the prompt's arithmetic
        const key = s.variant.factFamily;
        expect(key, `${lesson.id}/${s.id} missing factFamily`).toBeDefined();
        tagged++;
        const { op, lo, hi, result } = parseFamily(key);
        expect(op).toBe("+");
        expect(lo).toBeLessThanOrEqual(hi);
        expect(result).toBeLessThanOrEqual(20);
        expect(sumFamilyKey(hi, lo)).toBe(key); // commutative round-trip
        const nums = [...String(w.prompt).matchAll(/\d+/g)].map((m) => Number(m[0])).concat(wordNums(String(w.prompt)));
        // Near-doubles strategy prompts ("...one beyond double seven?") state only ONE anchor of
        // the pair by design — hi = lo + 1 is pinned by the near-doubles invariant itself, so
        // naming either partner next to "double" is sufficient evidence the family is this
        // prompt's, not a stand-in for literally stating both addends or the bare sum.
        const nearDoubleAnchor = /\bdouble\b/i.test(String(w.prompt)) && hi === lo + 1 && (nums.includes(lo) || nums.includes(hi));
        expect(nums.includes(result) || (nums.includes(lo) && nums.includes(hi)) || nearDoubleAnchor,
          `${lesson.id}/${s.id}: family ${key} unrelated to prompt "${w.prompt}"`).toBe(true);
      }
      expect(tagged).toBe(4); // every graded step in a fluency lesson is a fact drill

      const rw = WidgetSpec.parse(lesson.remedials[0].check.widget) as TWidget;
      expect(["numeric", "mcq"]).toContain(rw.type);
      expect(widgetIntegrityErrors(rw)).toEqual([]);
    });
  }
});

describe("S188 g2-fluency generator — independent agreement and additive keys", () => {
  const gen = VARIANT_GENERATORS.find((g) => g.tag === TAG)!;

  it("declares 14 forms, one per lesson", () => {
    expect(gen).toBeDefined();
    expect([...(gen.forms ?? [])]).toHaveLength(14);
  });

  it("every form x band x 40 seeds: parses, self-grades, independent solver agrees, traps typeable", () => {
    for (const form of [...(gen.forms ?? [])]) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 40; seed++) {
          const v = variantForGenForm(TAG, form, `s188-${form}-${band}-${seed}`, band)! as
            { widget: unknown; answer: number; factFamily?: string };
          const w = WidgetSpec.parse(v.widget) as TWidget;
          expect(widgetIntegrityErrors(w)).toEqual([]);
          if (w.type === "numeric") {
            expect(solveG2Prompt(form, w.prompt), `${form} seed ${seed}: ${w.prompt}`).toBe(w.answer);
            expect(w.answer).toBeGreaterThanOrEqual(0);
            expect(w.answer).toBeLessThanOrEqual(20);
            for (const e of w.commonErrors) {
              expect(e.value).not.toBe(w.answer);
              expect(e.value).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    }
  });

  it("every emitted family is ADDITIVE, canonical, within 20, and survives the review drill path", () => {
    const fams = new Set<string>();
    for (const form of [...(gen.forms ?? [])]) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = variantForGenForm(TAG, form, `s188-fam-${form}-${seed}`, "core")! as { factFamily?: string };
        if (v.factFamily) fams.add(v.factFamily);
      }
    }
    expect(fams.size).toBeGreaterThan(20);
    for (const key of fams) {
      const { op, lo, hi, result } = parseFamily(key);
      expect(op).toBe("+");
      expect(lo).toBeLessThanOrEqual(hi);
      expect(result).toBeLessThanOrEqual(20);
      // REGRESSION GUARD: this is the exact call ReviewClient makes. Before S188 an additive
      // family threw here, crashing the review page for Grade-2 fluency learners.
      const drill = factDrillFor(key, 0);
      expect(drill.widget.answer).toBeGreaterThanOrEqual(0);
      expect(drill.widget.type).toBe("numeric");
    }
  });

  it("determinism: identical seeds reproduce identical variants", () => {
    for (const form of [...(gen.forms ?? [])]) {
      const a = variantForGenForm(TAG, form, "s188-det", "core");
      const b = variantForGenForm(TAG, form, "s188-det", "core");
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});
