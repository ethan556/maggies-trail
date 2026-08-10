#!/usr/bin/env node
// S199 — Phase 2: mastery optimization of the 9 sub-A gap-patch lessons (12 were already A).
//
// EVERY edit is ADDITIVE and derived from the tier scorer's measured levers:
//   prediction 3  <- the predict step's own widget must be manip>=2 (predicts are MOVED verbatim
//                    onto a new manipulable step, or authored fresh only for iar-01-03 which
//                    shipped without one — the patch's single contract gap)
//   adapt 3       <- an adapt-3-capable engine (+2) AND an authored remedial (+1)
//   formal 3      <- numeric entry AFTER a manip>=2 step (ordering, not new numerics — except
//                    bv-05-02, which had no numeric at all)
//   manip/conseq  <- max over widgets: one new interactive with a subject-true engine
// AUTHORED PROSE, CHECKS, ANSWERS, HINTS: untouched. New steps use each lesson's OWN worked
// numbers (the (4,2) cap point, the (1,1) graze, the (4,3) chord, z=3, y-hat=2x+1 at x=2,
// the 5x-5 best line with residuals +1,-1,-1,+1). Remedials clone c2 + the first check verbatim.
// The full delta list prints at the end and goes to SESSION_NOTES.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error("OPT ASSERT: " + msg); };
const deltas = [];

const load = (course, id) => JSON.parse(readFileSync(join(root, "content/courses", course, "lessons", `${id}.json`), "utf8"));
const save = (course, lesson) =>
  writeFileSync(join(root, "content/courses", course, "lessons", `${lesson.id}.json`), JSON.stringify(lesson, null, 2) + "\n");

function addRemedial(lesson, course) {
  must(!(lesson.remedials ?? []).length, `${lesson.id}: no remedial yet`);
  const c2 = lesson.steps.find((s) => s.kind === "concept" && s.id !== "c1") ?? lesson.steps.find((s) => s.kind === "concept");
  const k = lesson.steps.find((s) => (s.kind === "check" || s.kind === "challenge") && s.widget && s.conceptTag);
  must(c2 && k, `${lesson.id}: remedial sources`);
  lesson.remedials = [{
    conceptTag: k.conceptTag,
    concept: { id: `rem-${k.conceptTag}-c`, kind: "concept", body: c2.body },
    check: { id: `rem-${k.conceptTag}-k`, kind: "check", body: k.body, conceptTag: k.conceptTag,
      explanationVariants: k.explanationVariants, widget: structuredClone(k.widget) },
  }];
  deltas.push(`${lesson.id}: +remedial (clones c2 + ${k.id} verbatim, tag ${k.conceptTag})`);
}

function movePredict(lesson, toStepId) {
  const from = lesson.steps.find((s) => s.predict);
  const to = lesson.steps.find((s) => s.id === toStepId);
  must(from && to && from.id !== to.id, `${lesson.id}: predict move endpoints`);
  to.predict = from.predict;
  delete from.predict;
  deltas.push(`${lesson.id}: predict moved verbatim ${from.id} -> ${to.id} (now hosted on manip>=2 widget)`);
}

function insertAfter(lesson, afterId, step) {
  const i = lesson.steps.findIndex((s) => s.id === afterId);
  must(i >= 0, `${lesson.id}: anchor ${afterId}`);
  must(!lesson.steps.some((s) => s.id === step.id), `${lesson.id}: new step id free`);
  lesson.steps.splice(i + 1, 0, step);
  deltas.push(`${lesson.id}: +${step.kind} ${step.id} (${step.widget.type}) after ${afterId}`);
}

const plot = (prompt, target, errors, miss, success) => ({
  type: "plotPoint", prompt, cols: 6, rows: 6, targets: [target],
  pointErrors: errors.map(([x, y, feedback]) => ({ x, y, feedback })),
  missFeedback: miss, successFeedback: success,
});

/* ---------- 1) iar-01-03 — the one authored gap: no predict ---------- */
{
  const L = load("inequalities-and-regions", "iar-01-03");
  must(!L.steps.some((s) => s.predict), "iar-01-03 has no predict");
  const i1 = L.steps.find((s) => s.id === "i1");
  must(i1.widget.type === "plotPoint", "iar-01-03 i1 is plotPoint");
  i1.predict = {
    prompt: "The point (2, 3) sits exactly ON y = x + 1. Will the STRICT y > x + 1 accept it?",
    options: [
      { id: "reject", label: "Rejected — strict means strictly above" },
      { id: "accept", label: "Accepted — it touches the line" },
      { id: "depends", label: "Depends on the graph's scale" },
    ],
    outcomeId: "reject",
    reveal: "Strict is strict: 3 > 3 is false, so the boundary point fails the test. That is exactly why > draws a DASHED fence — the line itself is off-limits — while \u2265 draws it solid and lets you stand on it.",
  };
  deltas.push("iar-01-03: +predict on i1 (the patch's single missing prediction; boundary-membership, one defensible outcome)");
  addRemedial(L, "inequalities-and-regions");
  save("inequalities-and-regions", L);
}

/* ---------- 2) four dragBucket-led lessons: +plotPoint after i1, move predict, +remedial ---------- */
{
  const L = load("inequalities-and-regions", "iar-02-03");
  insertAfter(L, "i1", { id: "i1b", kind: "interactive",
    body: "Now put the repair on the map — the cap boundary itself.",
    widget: plot("c2 repaired (4, 4) by dropping to the cap. Plot that boundary point: x = 4 on x + y = 6.",
      { x: 4, y: 2 },
      [[4, 4, "That is c2's broken point: 4 + 4 = 8 breaks the cap 6. Drop until the sum reads exactly 6."],
       [2, 4, "Coordinates swapped — keep x = 4 across, then y = 2 up puts the sum at 6."]],
      "Hold x = 4 and make the sum hit the cap exactly: y = 6 \u2212 4 = 2.",
      "(4, 2): 4 + 2 = 6, on the fence itself — the largest y that x = 4 allows, which is what \u2018repair by the smallest change\u2019 meant.") });
  movePredict(L, "i1b");
  addRemedial(L, "inequalities-and-regions");
  save("inequalities-and-regions", L);
}
{
  const L = load("inequalities-and-regions", "iar-03-03");
  insertAfter(L, "i1", { id: "i1b", kind: "interactive",
    body: "Plot the champion before the interview confirms it.",
    widget: plot("Plot the corner where x = 4 meets x + 2y = 8 — the vertex k2 computed.",
      { x: 4, y: 2 },
      [[4, 4, "x + 2y = 4 + 8 = 12 breaks the flour cap x + 2y \u2264 8; corners must satisfy every fence."],
       [2, 3, "The predict's point: it lies ON x + 2y = 8, but only ONE boundary passes through it — corners need two."]],
      "Two fences must cross there: x = 4 and x + 2y = 8 meet at y = (8 \u2212 4)/2 = 2.",
      "(4, 2) — both boundaries pass through it, and the interview will pay it P = 12 + 8 = 20, the champion.") });
  movePredict(L, "i1b");
  addRemedial(L, "inequalities-and-regions");
  save("inequalities-and-regions", L);
}
{
  const L = load("nonlinear-systems", "nls-01-03");
  insertAfter(L, "i1", { id: "i1b", kind: "interactive",
    body: "The discriminant-zero case, seen on the grid.",
    widget: plot("c1's line y = 2x \u2212 1 grazes y = x\u00b2 exactly once. Plot the touching point.",
      { x: 1, y: 1 },
      [[2, 4, "On the parabola, yes — but the line reads 2\u00b72 \u2212 1 = 3 there; they have already separated."],
       [2, 3, "On the LINE, but the parabola stands at 4 there. Touching means BOTH rules agree."]],
      "Set them equal: x\u00b2 = 2x \u2212 1 gives (x \u2212 1)\u00b2 = 0 — the double root x = 1, y = 1.",
      "(1, 1): the double root made visible — one point where line and curve agree, and the discriminant said so first.") });
  movePredict(L, "i1b");
  addRemedial(L, "nonlinear-systems");
  save("nonlinear-systems", L);
}
{
  const L = load("nonlinear-systems", "nls-02-03");
  insertAfter(L, "i1", { id: "i1b", kind: "interactive",
    body: "One chord point, placed by hand.",
    widget: plot("k1's chord: y = 3 meets x\u00b2 + y\u00b2 = 25 where x\u00b2 = 16. Plot the first-quadrant intersection.",
      { x: 4, y: 3 },
      [[3, 4, "Coordinates swapped — that is the y = 4 chord's point. Here y = 3 is fixed and x\u00b2 = 16."],
       [5, 3, "x = 5 only happens at y = 0: check 25 + 9 = 34 \u2260 25. The radius budget is already spent."]],
      "With y = 3 the circle demands x\u00b2 = 25 \u2212 9 = 16, so the first-quadrant point is (4, 3).",
      "(4, 3): 16 + 9 = 25 exactly — on the circle AND on the line, one of the chord's two crossings.") });
  movePredict(L, "i1b");
  addRemedial(L, "nonlinear-systems");
  save("nonlinear-systems", L);
}

/* ---------- 3) si-06-01: +numeric after the sampleSim (formal), +remedial ---------- */
{
  const L = load("statistical-inference", "si-06-01");
  insertAfter(L, "k1b", { id: "k1c", kind: "check",
    body: "Where does the pile point?",
    conceptTag: "si-normal-shape",
    explanationVariants: [
      "The mound of sample proportions centers on the parameter the samples estimate — with a true 50%, the peak stands at 50.",
      "Each sample wobbles around the truth, high and low in equal measure, so the stack's center IS the truth: 50.",
    ],
    widget: { type: "numeric",
      prompt: "The true proportion is 50%. The pile of twenty sample proportions peaks at about what percent?",
      answer: 50, tolerance: 0,
      commonErrors: [
        { value: 20, feedback: "That counts the SAMPLES, not where they center. Twenty results stack into one mound, and the mound sits on the truth." },
        { value: 68, feedback: "68 is next lesson's business — the share within one \u03c3. The CENTER of the bell is the parameter itself: 50." },
      ],
      fallbackFeedback: "Samples overshoot and undershoot the truth in equal measure, so the mound centers on the parameter: 50.",
      successFeedback: "50 — the bell is honest about its center: it stacks up right over the value the samples estimate." } });
  addRemedial(L, "statistical-inference");
  save("statistical-inference", L);
}

/* ---------- 4) si-06-03: +estimateSlider (the z-ruler, manipulable), move predict, +remedial ---------- */
{
  const L = load("statistical-inference", "si-06-03");
  insertAfter(L, "c1", { id: "i0", kind: "interactive",
    body: "Feel the ruler before computing with it.",
    widget: { type: "estimateSlider",
      prompt: "Slide to A's z-score: a 130 where \u03bc = 100 and \u03c3 = 10.",
      min: 1, max: 6, start: 1, target: 3, acceptFactor: 1.1, unitLabel: "z",
      ticks: [1, 2, 3, 4, 5],
      lowFeedback: "Each \u03c3 is worth 10 raw points here — 130 stands further out than that.",
      highFeedback: "Too far — (130 \u2212 100)/10 counts exactly three widths, no more.",
      successFeedback: "z = 3: thirty points at ten per wobble. Now run B — (65 \u2212 50)/5 — and the predict's answer appears: also 3. Same extremeness, different rulers." } });
  movePredict(L, "i0");
  addRemedial(L, "statistical-inference");
  save("statistical-inference", L);
}

/* ---------- 5) bv-05-01: +plotPoint (the +1-residual point), move predict, +remedial ---------- */
{
  const L = load("bivariate-statistics", "bv-05-01");
  insertAfter(L, "i1", { id: "i1b", kind: "interactive",
    body: "Place the point the residual describes.",
    widget: { ...plot("Under \u0177 = 2x + 1, the line predicts 5 at x = 2. Plot the OBSERVED point whose residual is +1.",
      { x: 2, y: 6 },
      [[2, 5, "That is the PREDICTED point — it sits on the line, residual 0. Observed \u2212 predicted must come out +1."],
       [2, 4, "One BELOW the line is residual \u22121. A positive leftover lives above the prediction."]],
      "Residual = observed \u2212 predicted, so observed = 5 + 1 = 6: plot (2, 6).",
      "(2, 6): one above the line's 5 — a +1 leftover, which is all a residual is."), rows: 8 } });
  movePredict(L, "i1b");
  addRemedial(L, "bivariate-statistics");
  save("bivariate-statistics", L);
}

/* ---------- 6) bv-05-02: +scatterFit on curved data + numeric after it, move predict, +remedial ---------- */
{
  const L = load("bivariate-statistics", "bv-05-02");
  insertAfter(L, "i1", { id: "i1b", kind: "interactive",
    body: "Force the best straight line through curved data — then read its leftovers.",
    widget: { type: "scatterFit",
      prompt: "The data is y = x\u00b2 in disguise: (1,1), (2,4), (3,9), (4,16). Fit the best straight line you can.",
      points: [[1, 1], [2, 4], [3, 9], [4, 16]],
      xMin: 0, xMax: 5, yMin: 0, yMax: 17,
      mMin: 0, mMax: 7, mStep: 0.5, bMin: -7, bMax: 3, bStep: 0.5,
      mStart: 2, bStart: 0, tolerance: 0.5,
      successFeedback: "Best straight effort: \u0177 = 5x \u2212 5. Its leftovers read +1, \u22121, \u22121, +1 — ends above, middle below. No slope or shift removes that arc; the pattern is the data announcing it is not straight.",
      slopeFeedback: "Watch the ENDS against the middle: curved data will always leave the outer points on one side of a straight line and the inner points on the other.",
      offsetFeedback: "The tilt is close — now slide b until the misses straddle the line instead of piling on one side." } });
  insertAfter(L, "i1b", { id: "k0b", kind: "check",
    body: "Count the pattern you just built.",
    conceptTag: "bv-residual-pattern",
    explanationVariants: [
      "The straight line overshoots curved data in the middle and undershoots at the ends, so exactly the two middle residuals are negative.",
      "Compute all four against \u0177 = 5x \u2212 5: +1, \u22121, \u22121, +1. Two negatives — the middle pair, the curvature signature.",
    ],
    widget: { type: "numeric",
      prompt: "With the best line \u0177 = 5x \u2212 5 in place, how many of the four residuals are NEGATIVE?",
      answer: 2, tolerance: 0,
      commonErrors: [
        { value: 0, feedback: "A best fit does not erase misses — the middle points (2,4) and (3,9) sit BELOW this line: 4 < 5 and 9 < 10." },
        { value: 4, feedback: "The END points sit ABOVE the line: 1 > 0 and 16 > 15 — their residuals are positive. Only the middle pair goes negative." },
      ],
      fallbackFeedback: "Residuals under \u0177 = 5x \u2212 5: 1\u22120 = +1, 4\u22125 = \u22121, 9\u221210 = \u22121, 16\u221215 = +1. Two are negative.",
      successFeedback: "Two — the middle pair. Plus, minus, minus, plus: the arc a straight line cannot flatten." } });
  movePredict(L, "i1b");
  addRemedial(L, "bivariate-statistics");
  save("bivariate-statistics", L);
}

console.log(`phase 2 complete: ${deltas.length} deltas across 9 lessons; ${asserts} assertions passed`);
for (const d of deltas) console.log("  " + d);
