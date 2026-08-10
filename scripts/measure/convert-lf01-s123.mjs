#!/usr/bin/env node
// S123: lf-01-02 (FLAGSHIP #21, centrality 273) and lf-01-03 (#22, centrality 272) onto
// slopeTriangle. Both were 100% static with no engine fit on the books until this engine existed.
//
// Same hard rules as the S121/S122 conversions, all asserted before any write:
//   1. The engine's independently derived slope must equal the FROZEN authored answer.
//   2. body / hints / explanationVariants / conceptTag / ids / order byte-identical.
//   3. Steps carrying a `variant` key are never touched.
// Only steps that ASK FOR THE SLOPE OF A LINE THROUGH TWO POINTS convert. The set-up-the-
// computation MCQ (lf-01-02/i2) and the read-the-sign MCQ (lf-01-03/i1) are deliberately left
// alone: the first assesses choosing a subtraction ORDER, the second reads a described line with
// no coordinates — neither is a construction, and staging them as one would change the claim.
import { readFileSync, writeFileSync } from "node:fs";
import { slopeTriangleLabel, slopeTriangleMatches } from "../../src/lib/schema.ts";

const dir = "content/courses/linear-functions/lessons";

const PLAN = {
  "lf-01-02": {
    k1: {
      ax: 2, ay: 1, bx: 6, by: 9, answer: 2,
      prompt: "Build the slope triangle from A so the line also passes through B (2, 1) → (6, 9).",
      commonPairs: [
        { run: 4, rise: 4, feedback: "A run of 4 and a rise of 4 is slope 1 — that counts the run twice. From A to B the rise is 9 − 1 = 8, not 4." },
        { run: 8, rise: 4, feedback: "Run 8 and rise 4 is slope 1/2 — the legs are swapped. Slope is the VERTICAL change over the horizontal one: 8 ÷ 4." }
      ],
      fallbackFeedback: "From A to B the line travels 4 across and 8 up, so rise ÷ run = 8 ÷ 4 = 2.",
      successFeedback: "Slope 2 — and notice that 1 and 2, 2 and 4, or 4 and 8 all land the line on B. Every triangle on one line shares its ratio."
    },
    k2: {
      ax: 1, ay: 5, bx: 4, by: 2, answer: -1,
      prompt: "Build the triangle for the line through A (1, 5) and B (4, 2).",
      commonPairs: [
        { run: 3, rise: 3, feedback: "Rise 3 sends the line UP, away from B. Going from y = 5 down to y = 2 the rise is 2 − 5 = −3." }
      ],
      fallbackFeedback: "Across 3 and down 3: rise ÷ run = −3 ÷ 3 = −1.",
      successFeedback: "Slope −1. The line falls as it goes right, and the negative rise is what records that."
    },
    ch1: {
      ax: -1, ay: 2, bx: 3, by: 14, answer: 3,
      prompt: "A is (−1, 2) and B is (3, 14). Build the triangle that reaches it.",
      commonPairs: [
        { run: 4, rise: 4, feedback: "The run is right — from −1 to 3 is 4 — but the rise is 14 − 2 = 12, not 4." }
      ],
      fallbackFeedback: "Across 4 and up 12: rise ÷ run = 12 ÷ 4 = 3.",
      successFeedback: "Slope 3. A negative starting x changes nothing — the run is still the difference, 3 − (−1) = 4."
    }
  },
  "lf-01-03": {
    k1: {
      ax: 1, ay: 8, bx: 5, by: 0, answer: -2,
      prompt: "Build the triangle for the line through A (1, 8) and B (5, 0).",
      commonPairs: [
        { run: 4, rise: 8, feedback: "Rise 8 climbs; this line descends. From y = 8 to y = 0 the rise is 0 − 8 = −8." }
      ],
      fallbackFeedback: "Across 4 and down 8: rise ÷ run = −8 ÷ 4 = −2.",
      successFeedback: "Slope −2. Twice as steep as −1, and still falling — size and sign say different things."
    },
    k2: {
      ax: 0, ay: 1, bx: 4, by: 9, answer: 2,
      prompt: "Build the triangle for the line through A (0, 1) and B (4, 9).",
      commonPairs: [
        { run: 4, rise: 9, feedback: "9 is B's height, not the rise. The rise is the CHANGE in height: 9 − 1 = 8." }
      ],
      fallbackFeedback: "Across 4 and up 8: rise ÷ run = 8 ÷ 4 = 2.",
      successFeedback: "Slope 2. Starting on the y-axis makes the arithmetic easy but changes nothing about the rule."
    },
    ch1: {
      ax: 1, ay: 9, bx: 4, by: 0, answer: -3,
      prompt: "A is (1, 9) and B is (4, 0). Build the triangle.",
      commonPairs: [
        { run: 3, rise: 9, feedback: "Rise 9 climbs away from B. Falling from 9 to 0 is a rise of 0 − 9 = −9." }
      ],
      fallbackFeedback: "Across 3 and down 9: rise ÷ run = −9 ÷ 3 = −3.",
      successFeedback: "Slope −3 — the steepest fall in this lesson, and the sign is doing the work."
    }
  }
};

let n = 0;
for (const [lid, steps] of Object.entries(PLAN)) {
  const path = `${dir}/${lid}.json`;
  const before = JSON.parse(readFileSync(path, "utf8"));
  const after = JSON.parse(readFileSync(path, "utf8"));
  for (const [sid, p] of Object.entries(steps)) {
    const sB = before.steps.find((s) => s.id === sid);
    const sA = after.steps.find((s) => s.id === sid);
    if (!sB) throw new Error(`${lid}/${sid}: missing`);
    if (sB.variant || sB.widget?.variant) throw new Error(`${lid}/${sid}: carries a variant — do not touch`);
    if (sB.widget?.type !== "numeric") throw new Error(`${lid}/${sid}: expected numeric, got ${sB.widget?.type}`);
    const frozen = sB.widget.answer;
    if (frozen !== p.answer) throw new Error(`${lid}/${sid}: plan answer ${p.answer} ≠ frozen ${frozen}`);
    const spec = {
      type: "slopeTriangle",
      prompt: p.prompt,
      ax: p.ax, ay: p.ay, bx: p.bx, by: p.by,
      runStart: 1, riseStart: 0, gridMax: 16, legMax: 14,
      commonPairs: p.commonPairs,
      fallbackFeedback: p.fallbackFeedback,
      successFeedback: p.successFeedback
    };
    // Derived slope must equal the frozen authored answer.
    const derived = (p.by - p.ay) / (p.bx - p.ax);
    if (derived !== frozen) throw new Error(`${lid}/${sid}: derived ${derived} ≠ frozen ${frozen} — ABORT`);
    const label = slopeTriangleLabel(spec);
    const expected = frozen < 0 ? `\u2212${Math.abs(frozen)}` : String(frozen);
    if (label !== expected) throw new Error(`${lid}/${sid}: label ${label} ≠ ${expected}`);
    // No named pair may secretly be correct.
    for (const c of p.commonPairs)
      if (slopeTriangleMatches(spec, c.run, c.rise))
        throw new Error(`${lid}/${sid}: commonPairs (${c.run},${c.rise}) is correct — ABORT`);
    sA.widget = spec;
    n++;
  }
  for (let i = 0; i < before.steps.length; i++) {
    const b = { ...before.steps[i] }, a = { ...after.steps[i] };
    delete b.widget; delete a.widget;
    if (JSON.stringify(b) !== JSON.stringify(a)) throw new Error(`${lid}: frozen surface changed at ${before.steps[i].id}`);
  }
  writeFileSync(path, JSON.stringify(after, null, 1) + "\n");
  console.log(`${lid}: written`);
}
console.log(`converted ${n} steps`);
