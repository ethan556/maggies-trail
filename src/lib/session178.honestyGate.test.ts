import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { exactNumberTruth } from "./schema";

/** S178 — a gate for the blind spot S177 exposed.
 *
 * Every other gate answers "does this produce the frozen number?". None answers "does this
 * REPRESENT the mathematical action?" — which is how pf-turning shipped a formula (turns+1) that
 * matched its frozen answer while misdescribing the concept it tested.
 *
 * This test cannot judge meaning. What it CAN do is pin the shape of every formula that looks
 * like it might not be deriving anything, so that a new one has to be justified in this file
 * rather than slipping through green gates:
 *
 *   A. RESTATES-ANSWER — the formula is a bare `const` whose authored value already equals the
 *      answer. Sometimes exactly right (e^(ln 5) = 5 IS the identity being taught); sometimes
 *      answer-copying. Every instance is enumerated below with the reason it is legitimate.
 *   B. DEAD-CONSTANT — an authored constant the formula never references. Either decoration, or
 *      a quantity the prompt says matters that the derivation ignores.
 *
 * Adding a converted step that trips either check WILL fail this test. That is the point: the
 * fix is to make the formula derive the answer, or to record here why restating IS the honest
 * representation for that specific piece of mathematics. */

type Flag = { key: string; kind: string; detail: string };

function collectFlags(): Flag[] {
  const flags: Flag[] = [];
  const refs = (node: any, out: Set<string>): void => {
    if (!node || typeof node !== "object") return;
    if (node.op === "const" && typeof node.id === "string") out.add(node.id);
    for (const k of ["arg", "left", "right"]) if (node[k]) refs(node[k], out);
  };
  const coursesDir = join(process.cwd(), "content/courses");
  for (const course of readdirSync(coursesDir).sort()) {
    const dir = join(coursesDir, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      const d = JSON.parse(readFileSync(join(dir, file), "utf8"));
      for (const step of d.steps ?? []) {
        const w = step.widget;
        if (!w || w.type !== "exactNumberLab" || w.task !== "approximationEvaluate") continue;
        let answer: number | undefined;
        try { answer = exactNumberTruth(w).answerNumber; } catch { continue; }
        if (answer === undefined) continue;
        const key = `${file.replace(".json", "")}/${step.id}`;
        const consts: any[] = w.approxConstants ?? [];
        const used = new Set<string>();
        refs(w.approxFormula, used);
        if (w.approxFormula?.op === "const") {
          const c = consts.find((x) => x.id === w.approxFormula.id);
          if (c && Math.abs(c.value - answer) < 1e-9) flags.push({ key, kind: "RESTATES-ANSWER", detail: `bare const '${c.id}' = ${c.value}` });
        }
        for (const c of consts) if (!used.has(c.id)) flags.push({ key, kind: "DEAD-CONSTANT", detail: `'${c.id}' never referenced` });
      }
    }
  }
  return flags;
}

/** Each entry is a claim that restating (or carrying an unused constant) is the mathematically
 * honest representation for THAT step — not merely that it produces the right number. */
const JUSTIFIED: Record<string, string> = {
  "lg-04-02/k1|RESTATES-ANSWER":
    "e^(ln 5) = 5. The identity IS the concept: exponential and natural log undo each other, so " +
    "the answer is the argument. Deriving it any further would be inventing steps that do not exist.",
  "lc-03-02/k1|RESTATES-ANSWER":
    "Given lim(x→∞) f(x) = 3, the horizontal asymptote's y-value IS that limit, by definition. " +
    "The step tests that the learner knows these are the same object, not an arithmetic route.",
  "fna-04-02/k2|RESTATES-ANSWER":
    "h(x) = √(5 − x) admits x while 5 − x ≥ 0, so the largest admissible x is exactly the " +
    "radicand's constant. The answer genuinely equals k; the constant's LABEL carries the " +
    "boundary reasoning (corrected in S178 — it previously described the quantity backwards).",
  "pq-01-02/k1|DEAD-CONSTANT":
    "Exterior angles sum to 360° for EVERY polygon. The unused 'n' is deliberate and labelled " +
    "'does not change the total': the step's whole point is that the side count is irrelevant. " +
    "Referencing it would misrepresent the mathematics.",
  "vec-05-02/ch1|RESTATES-ANSWER":
    "A 90° CCW rotation sends (x, y) → (−y, x), so the rotated vector's y-component IS the " +
    "original x-component — an exact algebraic identity requiring no trigonometry. The constant's " +
    "label states that rule (corrected in S178; it previously read only 'v_x', which carried none " +
    "of the reasoning).",
  "lf-02-02/k1|RESTATES-ANSWER":
    "For y = mx + c, the y-intercept IS c by definition (the value where x = 0 leaves only the " +
    "constant term). The step tests whether the learner recognizes this identity in slope-" +
    "intercept form, not an arithmetic route to it.",
  "lf-02-02/k3|RESTATES-ANSWER":
    "Same identity as lf-02-02/k1 (y-intercept = c), a second frozen instance of the same form.",
  "lf-02-03/k1|RESTATES-ANSWER":
    "Same identity again (y-intercept = c) — a third frozen instance; the intercepts form pairs " +
    "this trivial y-intercept question with genuine x-intercept derivations (k2, ch1) that DO " +
    "compute -c/m and are correctly unflagged.",
};

describe("S178 honesty gate: formulas must derive, not restate", () => {
  it("every restating or dead-constant formula is individually justified", () => {
    const flags = collectFlags();
    const unjustified = flags.filter((f) => !(`${f.key}|${f.kind}` in JUSTIFIED));
    expect(unjustified.map((f) => `${f.key} ${f.kind}: ${f.detail}`)).toEqual([]);
  });

  it("every justification still applies to a flag that actually exists (no stale entries)", () => {
    const live = new Set(collectFlags().map((f) => `${f.key}|${f.kind}`));
    const stale = Object.keys(JUSTIFIED).filter((k) => !live.has(k));
    expect(stale).toEqual([]);
  });

  it("the vec-03-03 work steps are NOT flagged: the dot product is written in full", () => {
    // F·d with a zero component is inert in that component — a property of the DATA, not a gap in
    // the formula. The audit's perturbation check surfaced these; reading the specs confirmed the
    // full dot product is present, so they are correctly absent from the flag set above.
    const flags = collectFlags().map((f) => f.key);
    expect(flags.filter((k) => k.startsWith("vec-03-03/"))).toEqual([]);
  });
});
