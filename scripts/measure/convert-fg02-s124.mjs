#!/usr/bin/env node
// S124: fg-02-02 "Why a Line's Slope Is Constant" — the one remaining non-variant
// slope-through-two-points step in the corpus (S123 took lf-01-02/03).
//
// Same hard rules as every conversion since S121, asserted before any write:
//   1. slopeTriangle's independently derived slope must equal the FROZEN authored answer.
//   2. body / hints / explanationVariants / conceptTag / ids / order byte-identical.
//   3. Steps carrying a `variant` key are never touched.
//
// Only i2 converts. k1/k2/k3/ch1 are variant-bearing (resolver contract) and i1 is a
// steppedReveal whose claim is "why is slope constant" — a similar-triangles argument,
// not a two-point computation.
//
// The prediction is added to i2 because the lesson's own commonErrors name the exact
// split a learner faces before computing (rise alone vs rise÷run), and c2 — the concept
// step that precedes i2 — does NOT state the answer, so nothing is leaked. (Contrast the
// S121 vm-01-01/k2 case, dropped because its concept step gave the outcome verbatim.)
import { readFileSync, writeFileSync } from "node:fs";

const path = "content/courses/functions-g8/lessons/fg-02-02.json";
const before = JSON.parse(readFileSync(path, "utf8"));
const after = JSON.parse(readFileSync(path, "utf8"));

const A = { x: 1, y: 1 };
const B = { x: 4, y: 7 };
const derived = (B.y - A.y) / (B.x - A.x); // 6 / 3 = 2

const sB = before.steps.find((s) => s.id === "i2");
const sA = after.steps.find((s) => s.id === "i2");
if (!sB) throw new Error("i2 not found");
if (sB.variant || sB.widget?.variant) throw new Error("i2 carries a variant — must not be touched");
if (sB.widget?.type !== "numeric") throw new Error(`expected numeric, found ${sB.widget?.type}`);
if (Math.abs(derived - sB.widget.answer) > 1e-9)
  throw new Error(`derived slope ${derived} \u2260 frozen authored answer ${sB.widget.answer} — ABORT`);

// The authored commonErrors are typed VALUES (6 = rise alone, 3 = run alone). A construction
// engine has no "6" to type, so carrying them would be dead feedback (the S121 unitChain rule).
// They are re-expressed as the reachable BUILD errors that hold the same misconception:
// rise=run (the ratio never formed) and legs swapped (the ratio formed upside down).
sA.widget = {
  type: "slopeTriangle",
  prompt: "Build the slope triangle from A so the line also passes through B (1, 1) \u2192 (4, 7).",
  ax: A.x, ay: A.y, bx: B.x, by: B.y,
  runStart: 1,
  riseStart: 0,
  gridMax: 10,
  legMax: 9,
  commonPairs: [
    { run: 3, rise: 3, feedback: "A run of 3 and a rise of 3 is slope 1 \u2014 that reads the run twice. From A to B the rise is 7 \u2212 1 = 6, not 3." },
    { run: 6, rise: 3, feedback: "Run 6 and rise 3 is slope 1/2 \u2014 the legs are swapped. Slope is the VERTICAL change over the horizontal one: 6 \u00f7 3." }
  ],
  fallbackFeedback: "From A to B the line travels 3 across and 6 up, so rise \u00f7 run = 6 \u00f7 3 = 2.",
  successFeedback: "Slope 2 \u2014 and 1 and 2, 2 and 4, or 3 and 6 all land the line on B. Every triangle on this one line shares its ratio, which is exactly why a line has a single slope."
};

if (sB.predict) throw new Error("i2 already has a predict block");
sA.predict = {
  prompt:
    "The line through (1, 1) and (4, 7) climbs 6 while running across 3. Before you compute — what is its slope?",
  options: [
    { id: "ratio", label: "2 — the climb per single step across" },
    { id: "rise", label: "6 — the climb is what slope measures" },
    { id: "sum", label: "9 — the climb and the run together" }
  ],
  outcomeId: "ratio",
  reveal:
    "Slope is the climb for ONE step across, not the whole climb: 6 spread over 3 steps is 2 per step. That is why the triangle's two legs are divided, never added."
};

// Frozen-surface assertion: everything except widget/predict byte-identical, order intact.
if (before.steps.length !== after.steps.length) throw new Error("step count changed");
for (let i = 0; i < before.steps.length; i++) {
  const b = { ...before.steps[i] }, a = { ...after.steps[i] };
  delete b.widget; delete a.widget; delete b.predict; delete a.predict;
  if (JSON.stringify(b) !== JSON.stringify(a))
    throw new Error(`step ${before.steps[i].id} frozen surface changed — ABORT`);
}
writeFileSync(path, JSON.stringify(after, null, 1) + "\n");
console.log(`fg-02-02: i2 → slopeTriangle (slope ${derived}, matches frozen answer), prediction added`);
