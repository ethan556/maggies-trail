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
 *  different route than reading the declared field — that is the point.
 *
 *  Re-pinned (S331): the original three notation-only patterns were built from a subset of the
 *  declared corpus and never covered its word-form prompts — 11 declared steps whose prompts fix
 *  the denominator as a WORD ("half-pieces", "over thirds", "eight eighths", "twelfth-size
 *  sections", "using 18 equal pieces", a mixed number "3 1/4", an equation "= 2/12") are
 *  byte-identical at c5af1f1, the commit that created this test, so this assertion was stale at
 *  birth for them, not broken by drift (3 more were reworded into these shapes by the reviewed
 *  S316 revision wave, commit 8a0a8c7, dispositions S316-V2-*). The word/number routes below are
 *  still an independent positional read of the authored sentence: every route feeds the same
 *  exactly-one-denominator requirement, a prompt naming two different piece sizes still fails,
 *  and all 109 declared steps were re-verified against the extended detector before this re-pin. */
const PIECE_WORD: Record<string, number> = {
  half: 2, halves: 2, third: 3, thirds: 3, fourth: 4, fourths: 4, quarter: 4, quarters: 4,
  fifth: 5, fifths: 5, sixth: 6, sixths: 6, eighth: 8, eighths: 8, tenth: 10, tenths: 10,
  twelfth: 12, twelfths: 12,
};
function denominatorStatedIn(prompt: string): number[] {
  const pats = [/\?\s*\/\s*(\d+)/g, /\bover\s+(\d+)\b/g, /=\s*_+\s*\/\s*(\d+)/g];
  const found = new Set<number>();
  for (const p of pats) for (const m of prompt.matchAll(p)) found.add(Number(m[1]));
  // Piece size named as a word: "half-pieces", "sixth-size parts", "twelfth-size sections".
  for (const m of prompt.matchAll(/\b(half|third|fourth|quarter|fifth|sixth|eighth|tenth|twelfth)(?:-size\s+|-)(?:pieces?|parts?|sections?)\b/gi)) {
    found.add(PIECE_WORD[m[1].toLowerCase()]);
  }
  // Bare plural piece word: "to sixths", "how many eighths", "over thirds".
  for (const m of prompt.matchAll(/\b(halves|thirds|fourths|quarters|fifths|sixths|eighths|tenths|twelfths)\b/gi)) {
    found.add(PIECE_WORD[m[1].toLowerCase()]);
  }
  // An explicit repartition count: "using 18 equal pieces".
  for (const m of prompt.matchAll(/\b(?:using|into)\s+(\d+)\s+equal\s+(?:pieces|parts)\b/gi)) found.add(Number(m[1]));
  // A mixed number fixes its own denominator: "3 1/4" -> 4.
  for (const m of prompt.matchAll(/\b\d+\s+\d+\s*\/\s*(\d+)\b/g)) found.add(Number(m[1]));
  // The fraction on an equation's right side, where the asked-for numerator lives: "= 2/12" -> 12.
  for (const m of prompt.matchAll(/=\s*\d+\s*\/\s*(\d+)/g)) found.add(Number(m[1]));
  return [...found];
}

const declared = allLessons().flatMap((l) =>
  everyStep(l)
    .filter((s) => s.widget?.type === "numeric" && s.widget.previewDenominator !== undefined)
    .map((s) => ({ lesson: l.id, step: s.id, w: s.widget as Record<string, unknown> }))
);

describe("numeric previewDenominator — the corpus contract", () => {
  it("is declared on exactly the 109 steps that were measured", () => {
    // Re-pinned 111 -> 109 (S331), after root-causing the apparent 2-step DROP end to end:
    //
    //   1. mb-04-03/k2 — a deliberate, reviewed removal. Revision contract S246-MB-mb-04-03
    //      (REVISE, 2026-08-18) explicitly flagged that "the fractional case asks only for a
    //      numerator"; commit 8a0a8c7 (S316 verified revision wave) converted the step from
    //      numeric to an MCQ asking for the complete mixed-number share (2 3/4), and disposition
    //      S316-V2-mb-04-03 (KEEP, 2026-08-20) independently re-derived and verified it. The
    //      numeric widget no longer exists, so its preview declaration legitimately went with it.
    //
    //   2. The other "missing" step never existed in any committed state. At c5af1f1 — the very
    //      commit that introduced this feature AND this test — the corpus already contained only
    //      110 declared steps (verified both by replicating this file's own scan against that
    //      commit and by `git grep -c '"previewDenominator"' c5af1f1 -- content/courses` = 110).
    //      The 111 was measured mid-session before that squashed commit landed and was stale at
    //      birth by one; this assertion has never passed at 111 on any commit.
    //
    //   Full content history of the field is exactly two commits (`git log -S previewDenominator
    //   -- content/courses`): c5af1f1 (introduced, 110) and 8a0a8c7 (mb-04-03 removal + reviewed
    //   g5u-01-02/g3f-02-04 value corrections, 109). No accidental loss.
    expect(declared).toHaveLength(109);
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
    // The word route (S331): a prompt fixing the piece size by name fixes the denominator too.
    expect(denominatorStatedIn("Compute 3 × 1/2. How many half-pieces are in the product?")).toEqual([2]);
  });

  it("REJECTS a sentence naming two different piece sizes", () => {
    expect(denominatorStatedIn("Are half-pieces or fourth-pieces bigger?").length).toBeGreaterThan(1);
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
