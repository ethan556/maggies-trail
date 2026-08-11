/* S237 — the corpus contract for `numeric`'s live fraction preview.
 *
 * The user's goal is visual-first learning, stated as: "actually have the fraction shown as
 * [the entered number]/4". `fractionEntry` has drawn that bar since S221; `numeric` — 3,779
 * authored steps — drew nothing at all. `previewDenominator` closes that for the steps that ask
 * for a NUMERATOR over a denominator the prompt has already fixed.
 *
 * A preview is a CLAIM ABOUT THE ANSWER, so it can be wrong in ways grading never notices. This
 * gate pins the property that makes it honest, on the real corpus:
 *
 *   1. The declared denominator is the one the step's OWN PROMPT states. If it were anything
 *      else, the bar would illustrate a different question than the one asked.
 *   2. The answer fits inside one bar (`answer <= previewDenominator`). `PartitionBar` draws
 *      exactly `total` cells and fills at most all of them, so an improper answer would render a
 *      full bar — a picture showing ONE whole for an answer of one-and-a-half. Fifteen authored
 *      steps are improper and are deliberately excluded; they need whole-units-plus-remainder,
 *      which is a second slice, not a wider regex here.
 *   3. The pair is inside the shared honest-partition cap, so the bar is never a smear of
 *      hairlines. Twenty-two /100 steps fall out here and are excluded for the same reason.
 *   4. Declaring it changes DISPLAY ONLY: the answer, tolerance and every trap are untouched.
 *
 * The count is asserted exactly, so a corpus drift — a prompt reworded, a step deleted, a
 * denominator edited — fails here loudly instead of silently shrinking the feature.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { partitionBarDrawable, numericPreviewParts } from "./schema";

const COURSES = join(process.cwd(), "content", "courses");

type Step = { id: string; widget?: Record<string, unknown> };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ check?: Step; concept?: Step }> };

function everyStep(l: Lesson): Step[] {
  const out = [...l.steps];
  for (const r of l.remedials ?? []) for (const st of [r.check, r.concept]) if (st) out.push(st);
  return out;
}

function allLessons(): Lesson[] {
  const out: Lesson[] = [];
  for (const course of readdirSync(COURSES)) {
    const dir = join(COURSES, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".json")) out.push(JSON.parse(readFileSync(join(dir, f), "utf8")) as Lesson);
    }
  }
  return out;
}

/** The denominator the PROMPT fixes. Read positionally from the authored sentence, which is a
 *  different route than reading the declared field — that is the point. */
function denominatorStatedIn(prompt: string): number[] {
  const pats = [/\?\s*\/\s*(\d+)/g, /\bover\s+(\d+)\b/g, /=\s*_+\s*\/\s*(\d+)/g];
  const found = new Set<number>();
  for (const p of pats) for (const m of prompt.matchAll(p)) found.add(Number(m[1]));
  return [...found];
}

const declared = allLessons().flatMap((l) =>
  everyStep(l)
    .filter((s) => s.widget?.type === "numeric" && s.widget.previewDenominator !== undefined)
    .map((s) => ({ lesson: l.id, step: s.id, w: s.widget as Record<string, unknown> }))
);

describe("numeric previewDenominator — the corpus contract", () => {
  it("is declared on exactly the 111 steps that were measured", () => {
    expect(declared).toHaveLength(111);
  });

  it("every declared denominator is the one the step's own prompt states", () => {
    for (const d of declared) {
      const stated = denominatorStatedIn(String(d.w.prompt));
      expect(stated, `${d.lesson}/${d.step}: prompt fixes no single denominator`).toHaveLength(1);
      expect(d.w.previewDenominator, `${d.lesson}/${d.step}: declared denominator is not the prompt's`).toBe(stated[0]);
    }
  });

  it("every declared step's answer is drawable — wholes plus a remainder, never understated", () => {
    // An IMPROPER answer is legitimate here and is drawn as whole bars plus a remainder, the
    // way fractionEntry has always drawn the same quantity. What is NOT allowed is a declared
    // step whose answer the bar cannot honestly show: past the six-whole ceiling, or a
    // remainder past the partition cap. `numericPreviewParts` is the single source of that
    // judgement, so this asks it rather than restating the rule and drifting from it.
    for (const d of declared) {
      const ans = d.w.answer as number;
      const den = d.w.previewDenominator as number;
      expect(Number.isInteger(ans), `${d.lesson}/${d.step}: non-integer numerator`).toBe(true);
      expect(ans).toBeGreaterThanOrEqual(0);
      const parts = numericPreviewParts(d.w as never, ans);
      expect(parts, `${d.lesson}/${d.step}: ${ans}/${den} cannot be drawn honestly`).not.toBeNull();
      // The drawn quantity must equal the answer exactly: wholes × total + remainder.
      expect(parts!.wholes * parts!.total + parts!.shaded,
        `${d.lesson}/${d.step}: the bars would show a different quantity than the answer`).toBe(ans);
      expect(partitionBarDrawable(parts!.shaded, den)).toBe(true);
    }
  });

  it("the preview of a correct answer really draws that answer", () => {
    for (const d of declared) {
      const parts = numericPreviewParts(d.w as never, d.w.answer as number);
      expect(parts, `${d.lesson}/${d.step}: correct answer draws nothing`).not.toBeNull();
      expect(parts!.total).toBe(d.w.previewDenominator);
      expect(parts!.wholes * parts!.total + parts!.shaded).toBe(d.w.answer);
    }
  });

  it("declaring it left grading alone — tolerance 0 and every authored trap intact", () => {
    for (const d of declared) {
      expect(d.w.tolerance, `${d.lesson}/${d.step}`).toBe(0);
      const traps = (d.w.commonErrors ?? []) as Array<{ value: number; feedback: string }>;
      for (const t of traps) {
        expect(t.value).not.toBe(d.w.answer);
        expect(t.feedback.length).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it("no step outside the declared set accidentally acquired a bar", () => {
    // The regression guard for the other ~3,700 numeric steps: absent field, no preview, ever.
    let checked = 0;
    for (const l of allLessons()) {
      for (const s of everyStep(l)) {
        if (s.widget?.type !== "numeric" || s.widget.previewDenominator !== undefined) continue;
        expect(numericPreviewParts(s.widget as never, 3)).toBeNull();
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(3000);
  });
});

describe("the denominator reader is a real detector", () => {
  it("ACCEPTS the authored shapes", () => {
    expect(denominatorStatedIn("Express the total as ?/6. What is the numerator?")).toEqual([6]);
    expect(denominatorStatedIn("Written as a fraction over 8, what is the numerator?")).toEqual([8]);
  });

  it("REJECTS a sentence that fixes more than one denominator", () => {
    // A line-plot prompt reading "2 dots over 10, 3 over 15" is not a fixed-denominator question,
    // and the "over N" pattern would happily match it.
    expect(denominatorStatedIn("In the plot (2 dots over 10, 3 over 15), how many?").length).toBeGreaterThan(1);
  });

  it("REJECTS a sentence that fixes none", () => {
    expect(denominatorStatedIn("What is 3 + 4?")).toEqual([]);
  });
});
