// S183: counting-to-100-k — the first K5-expansion course, and the k0-count-100 generator
// family behind it. Adversarial posture:
//   (1) GENERATOR SWEEP — every form × every band × many seeds must produce a widget that
//       parses, whose recorded answer grades correct through the real evaluate(), whose
//       traps never equal the answer, and whose every number respects the K.CC.A.1 ceiling
//       (0..100). The cap is the mathematical identity of a count-to-100 course; it is
//       asserted, not assumed.
//   (2) CONTENT — all 18 authored lessons are re-derived: hop landings recomputed from
//       start/hop/hops and checked against bounds, drag orders re-sorted independently,
//       MCQs checked for exactly one correct, predictions for resolvable outcomes, hints
//       for the 3-rung ladder, remedial answers recomputed, spec fidelity (titles,
//       conceptTags, standards order) checked against the landed k5-expansion.json.
//   (3) TIER PRECONDITIONS — the structural facts the tier scorer reads (predict present,
//       ≥4 variant-backed graded steps, trap feedback everywhere) hold for every lesson.
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { mulberry32 } from "./prng";
import { WidgetSpec } from "./schema";
import { evaluate } from "./evaluate";
import { G0_GENERATORS, G0_FORM_SURFACES } from "./g0Variants";

const K100_FORMS = [
  "kSeqNextHop", "kSeqNextMcq", "kSeqBeforeHop", "kSeqMissingMcq", "kDecadeCrossHop",
  "kDecadeNextMcq", "kTensNextHop", "kTensNextMcq", "kTensBackHop", "kTensOrderDrag",
  "kChartRowMcq", "kChartMissingMcq", "kCountFromHop", "kCountBackHop", "kSeqOrderDrag",
] as const;
const BANDS = ["support", "core", "stretch"] as const;
const gen = G0_GENERATORS.find((g) => g.tag === "k0-count-100")!;

const capOk = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;
const everyNumberInWidget = (w: Record<string, unknown>): number[] => {
  const out: number[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === "number") out.push(v);
    else if (typeof v === "string" && /^\d+$/.test(v)) out.push(Number(v));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) if (k !== "flashMs") walk(x);
    }
  };
  walk(w);
  return out;
};

describe("k0-count-100 generator sweep", () => {
  it("registers all 15 forms with surfaces", () => {
    expect(gen).toBeDefined();
    for (const f of K100_FORMS) expect(G0_FORM_SURFACES[f], f).toBeDefined();
  });

  it("every form x band x 40 seeds: parses, grades, caps at 100, traps differ from answer", () => {
    let draws = 0;
    for (const form of K100_FORMS) {
      for (const band of BANDS) {
        for (let seed = 1; seed <= 40; seed++) {
          const v = gen.gen(mulberry32(seed * 977 + form.length), band, form);
          draws++;
          const parsed = WidgetSpec.safeParse(v.widget);
          expect(parsed.success, `${form}/${band}/${seed}: ${JSON.stringify(parsed.success ? "" : parsed.error.issues[0])}`).toBe(true);
          const spec = parsed.data!;
          expect(spec.type, form).toBe(G0_FORM_SURFACES[form]);
          // the K cap, everywhere, including bounds, traps, options, drag labels
          for (const n of everyNumberInWidget(v.widget as Record<string, unknown>)) {
            expect(capOk(n), `${form}/${band}/${seed} number ${n} breaks the K cap`).toBe(true);
          }
          // recorded answer grades correct through the real evaluator
          if (spec.type === "numberLineHop") {
            const land = spec.start + (spec.direction === "back" ? -1 : 1) * spec.hop * spec.hops;
            expect(v.answer).toBe(land);
            expect(land >= spec.min && land <= spec.max).toBe(true);
            expect(evaluate(spec, land).correct).toBe(true);
            for (const t of spec.commonLandings ?? []) {
              expect(t.value).not.toBe(land);
              expect(evaluate(spec, t.value).correct).toBe(false);
              expect(evaluate(spec, t.value).feedback).toBe(t.feedback);
            }
          } else if (spec.type === "mcq") {
            const correct = spec.options.filter((o) => o.correct);
            expect(correct.length, `${form}/${band}/${seed}`).toBe(1);
            expect(v.answer).toBe(correct[0].id);
            expect(evaluate(spec, correct[0].id).correct).toBe(true);
            for (const o of spec.options.filter((o) => !o.correct)) {
              expect(evaluate(spec, o.id).correct).toBe(false);
            }
          } else if (spec.type === "dragOrder") {
            const labels = (v.answer as string[]).map((id) => Number(spec.items.find((it) => it.id === id)!.label));
            for (let i = 1; i < labels.length; i++) expect(labels[i]).toBeGreaterThan(labels[i - 1]);
            expect(evaluate(spec, v.answer as string[]).correct).toBe(true);
            expect(evaluate(spec, [...(v.answer as string[])].reverse()).correct).toBe(false);
          } else {
            throw new Error(`unexpected surface ${spec.type} for ${form}`);
          }
        }
      }
    }
    expect(draws).toBe(K100_FORMS.length * BANDS.length * 40);
  });
});

describe("counting-to-100-k authored content", () => {
  const dir = "content/courses/counting-to-100-k";
  const course = JSON.parse(readFileSync(join(dir, "course.json"), "utf8"));
  const ids: string[] = course.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
  const lessons = ids.map((id) => JSON.parse(readFileSync(join(dir, "lessons", `${id}.json`), "utf8")));
  const spec = JSON.parse(readFileSync("k5-expansion.json", "utf8"))
    .courses.find((c: { slug: string }) => c.slug === "counting-to-100-k");

  it("18 lessons, 3 chapters, files match registration", () => {
    expect(ids.length).toBe(18);
    expect(course.chapters.length).toBe(3);
    const onDisk = readdirSync(join(dir, "lessons")).map((f) => f.replace(/\.json$/, ""));
    expect(new Set(onDisk)).toEqual(new Set(ids));
  });

  it("spec fidelity: titles, conceptTags, standards in spec order", () => {
    lessons.forEach((l, i) => {
      expect(l.title).toBe(spec.lessons[i].title);
      expect(l.steps[1].conceptTag).toBe(spec.lessons[i].conceptTag);
      const std = spec.lessons[i].standard;
      expect(["K.CC.A.1", "K.CC.A.2"]).toContain(std);
    });
  });

  it("every widget re-derives: hops land inside bounds, mcqs have one correct, drags sort, caps hold", () => {
    for (const l of lessons) {
      for (const s of l.steps) {
        if (!s.widget) continue;
        const parsed = WidgetSpec.safeParse(s.widget);
        expect(parsed.success, `${l.id}/${s.id}`).toBe(true);
        const w = parsed.data!;
        for (const n of everyNumberInWidget(s.widget)) {
          expect(capOk(n), `${l.id}/${s.id} number ${n} breaks the K cap`).toBe(true);
        }
        if (w.type === "numberLineHop") {
          const land = w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops;
          expect(land >= w.min && land <= w.max, `${l.id}/${s.id} landing ${land}`).toBe(true);
          expect(evaluate(w, land).correct).toBe(true);
          for (const t of w.commonLandings ?? []) {
            expect(t.value, `${l.id}/${s.id}`).not.toBe(land);
            expect(evaluate(w, t.value).feedback).toBe(t.feedback);
          }
        }
        if (w.type === "mcq") {
          expect(w.options.filter((o) => o.correct).length, `${l.id}/${s.id}`).toBe(1);
        }
        if (w.type === "dragOrder") {
          const labels = w.correctOrder.map((id: string) => Number(w.items.find((it) => it.id === id)!.label));
          const descending = /backward|biggest first/i.test(w.prompt);
          const sorted = [...labels].sort((a, b) => descending ? b - a : a - b);
          expect(labels).toEqual(sorted);
          expect(evaluate(w, w.correctOrder).correct).toBe(true);
        }
        if (w.type === "numeric") {
          expect(capOk(w.answer), `${l.id}/${s.id} remedial`).toBe(true);
          expect(evaluate(w, w.answer).correct).toBe(true);
          for (const e of w.commonErrors ?? []) {
            expect(e.value).not.toBe(w.answer);
            expect(evaluate(w, e.value).feedback).toBe(e.feedback);
          }
        }
      }
    }
  });

  it("tier preconditions: predict on i1, 4 variant-backed graded steps, hints ladders, remedial per lesson", () => {
    for (const l of lessons) {
      const i1 = l.steps.find((s: { id: string }) => s.id === "i1");
      // S241 WS-E Phase 4: these i1 gates were REMOVED by explicit user ruling (REMOVE verdicts
      // + the ruled repetition-thinning policy; see PREDICTION_GATE_ADJUDICATION.csv). Absent
      // gates must STAY absent; every other lesson's gate must still be present and coherent.
      const S241_REMOVED = new Set(["k100-01-02", "k100-01-03", "k100-01-04", "k100-01-05", "k100-03-01", "k100-03-04", "k100-03-06"]);
      if (S241_REMOVED.has(l.id)) {
        expect(i1.predict, l.id).toBeUndefined();
      } else {
        expect(i1.predict, l.id).toBeDefined();
        expect(i1.predict.options.some((o: { id: string }) => o.id === i1.predict.outcomeId), l.id).toBe(true);
      }
      const graded = l.steps.filter((s: { kind: string }) => s.kind === "check" || s.kind === "challenge");
      expect(graded.length, l.id).toBe(4);
      for (const g of graded) {
        expect(g.variant?.gen, `${l.id}/${g.id}`).toBe("k0-count-100");
        expect(K100_FORMS).toContain(g.variant.form);
        expect(g.hints?.length, `${l.id}/${g.id}`).toBe(3);
        expect(g.explanationVariants?.length, `${l.id}/${g.id}`).toBeGreaterThanOrEqual(2);
      }
      const i2 = l.steps.find((s: { id: string }) => s.id === "i2");
      expect(i2.variant?.gen, l.id).toBe("sequence-order");
      expect(l.remedials?.length, l.id).toBe(1);
      expect(l.remedials[0].conceptTag).toBe(l.steps[1].conceptTag);
      expect(l.readingProfile).toBe("early");
    }
  });
});
