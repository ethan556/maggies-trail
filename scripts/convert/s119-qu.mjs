// S119 — the qu- solving cluster onto quadraticExplore roots form.
// Every lesson's own equation is re-derived here from the roots and checked against the authored
// coefficients before writing; the integrity gate re-checks reachability independently.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, rootsFormCoefs } = await import("../../src/lib/schema.ts");

const DIR = "content/courses/quadratics/lessons";
const base = { type: "quadraticExplore", form: "roots", targetA: 1, targetH: 0, targetK: 0,
  rMin: -9, rMax: 9, aMin: -3, aMax: 3, aStart: 1, r1Start: 0, r2Start: 0, gridMax: 9 };

const P = {
  "qu-02-01": { step:"i1", expect:"mcq", r1: 3, r2: -2, eq: "x\u00b2 \u2212 x \u2212 6",
    prompt: "Drag the two crossings until the curve is (x \u2212 3)(x + 2). Where it meets the axis is where the product is zero.",
    success: "Roots 3 and \u22122. A product is zero exactly when one of its factors is \u2014 and on the graph that is exactly where the curve touches the axis. Nothing else makes (x \u2212 3)(x + 2) vanish.",
    shape: "The opening is wrong \u2014 leave a at 1 for this one.",
    vertex: "Not both crossings yet. (x \u2212 3) is zero at x = 3, and (x + 2) is zero at x = \u22122." },
  "qu-02-02": { step:"i3", expect:"numeric", r1: 4, r2: 3, eq: "x\u00b2 \u2212 7x + 12",
    prompt: "Drag the crossings until the expansion reads x\u00b2 \u2212 7x + 12. The larger crossing is the answer.",
    success: "Roots 3 and 4 \u2014 and the expansion confirms it: \u22127 is \u2212(3 + 4) and 12 is 3 \u00d7 4. Factoring is the search for two numbers that add to the middle coefficient and multiply to the last.",
    shape: "Leave a at 1 \u2014 this quadratic has no stretch.",
    vertex: "Not there yet. Watch the expansion: the middle coefficient is minus the SUM of the crossings, and the constant is their PRODUCT." },
  "qu-02-03": { step:"i1", expect:"numeric", r1: 3, r2: -3, eq: "x\u00b2 \u2212 9",
    prompt: "Drag the crossings until the expansion reads x\u00b2 \u2212 9. Note where the middle term goes.",
    success: "Roots 3 and \u22123, and the middle term vanished: \u2212(3 + (\u22123)) = 0. That is what makes it a difference of squares \u2014 opposite roots cancel the x term exactly.",
    shape: "Leave a at 1 for this one.",
    vertex: "Not yet. For the middle term to disappear the two crossings must be equal and opposite." },
  "qu-03-01": { step:"i3", expect:"numeric", r1: 7, r2: -1, eq: "x\u00b2 \u2212 6x \u2212 7",
    prompt: "(x \u2212 3)\u00b2 = 16 means x \u2212 3 is 4 or \u22124. Drag the crossings to those two solutions.",
    success: "Roots 7 and \u22121 \u2014 3 + 4 and 3 \u2212 4. Taking a square root gives TWO answers because both +4 and \u22124 square to 16, and the graph shows both crossings at once.",
    shape: "Leave a at 1.",
    vertex: "Not both yet. x \u2212 3 = 4 gives one crossing; x \u2212 3 = \u22124 gives the other." },
  "qu-03-02": { step:"i1", expect:"numeric", r1: 3, r2: 2, eq: "x\u00b2 \u2212 5x + 6",
    prompt: "Drag the crossings until the expansion reads x\u00b2 \u2212 5x + 6. The larger one is the answer.",
    success: "Roots 2 and 3. The quadratic formula would grind out the same two numbers \u2014 it is a general recipe for the crossings you just found by eye.",
    shape: "Leave a at 1.",
    vertex: "Not yet \u2014 the crossings must add to 5 and multiply to 6." },
  "qu-04-02": { step:"i1", expect:"numeric", r1: 5, r2: -8, eq: "x\u00b2 + 3x \u2212 40",
    prompt: "The rectangle gives x\u00b2 + 3x \u2212 40 = 0. Drag the crossings until the expansion matches.",
    success: "Roots 5 and \u22128. Both solve the equation, but a width cannot be negative \u2014 so the algebra offers two answers and the SITUATION picks one. The width is 5.",
    shape: "Leave a at 1.",
    vertex: "Not yet \u2014 the crossings must multiply to \u221240 and add to \u22123." },
  "qu-04-03": { step:"i2", expect:"numeric", r1: 5, r2: -9, eq: "x\u00b2 + 4x \u2212 45",
    prompt: "The rectangle gives x\u00b2 + 4x \u2212 45 = 0. Drag the crossings until the expansion matches.",
    success: "Roots 5 and \u22129. The negative crossing is a genuine solution of the equation and a meaningless width \u2014 reading the context is part of solving, not an afterthought.",
    shape: "Leave a at 1.",
    vertex: "Not yet \u2014 the crossings must multiply to \u221245 and add to \u22124." },
};

const staged = []; let n = 0;
for (const [lesson, plan] of Object.entries(P)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const st = doc.steps.find((s) => s.id === plan.step);
  if (!st) throw new Error(`${lesson}: ${plan.step} missing`);
  if (st.widget?.type === "quadraticExplore") continue;
  if (st.widget?.type !== plan.expect) throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${st.widget?.type}`);
  if (st.variant) throw new Error(`${lesson}: has a variant tag`);

  const widget = { ...base, targetR1: plan.r1, targetR2: plan.r2, prompt: plan.prompt,
    successFeedback: plan.success, shapeFeedback: plan.shape, vertexFeedback: plan.vertex };
  const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
  if (errs.length) throw new Error(`${lesson}: ${errs.join("; ")}`);

  const co = rootsFormCoefs(1, plan.r1, plan.r2);
  // A coefficient of 1 is written "x", not "1x" — the same convention the authored equations use.
  const bTerm = co.b === 0 ? "" : `${co.b < 0 ? "\u2212" : "+"} ${Math.abs(co.b) === 1 ? "" : Math.abs(co.b)}x `;
  const rendered = `x\u00b2 ${bTerm}${co.c < 0 ? "\u2212 " + Math.abs(co.c) : "+ " + co.c}`.replace(/\s+/g, " ").trim();
  if (rendered !== plan.eq) throw new Error(`${lesson}: expansion "${rendered}" != authored "${plan.eq}"`);
  console.log(`  ${lesson}: roots ${plan.r1}, ${plan.r2} expand to ${rendered} \u2713`);

  const bodyBefore = st.body, predictBefore = JSON.stringify(st.predict ?? null);
  st.widget = widget;
  if (st.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(st.predict ?? null) !== predictBefore) throw new Error(`${lesson}: predict changed`);
  staged.push([path, doc, lesson]); n++;
}
for (const [path, doc, lesson] of staged) { writeFileSync(path, JSON.stringify(doc, null, 2), "utf8"); console.log(`${lesson}: written`); }
console.log(`${n} lessons converted`);
