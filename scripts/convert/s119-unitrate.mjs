// S119 — the pr- unit-rate steps onto ratioTable's new fraction mode.
//
// These were declined earlier this session on a fidelity ground that was exactly right: the
// lessons are titled "Dividing by a Fraction", and every engine that fitted the arithmetic
// displayed 0.25 and 0.3125 — sidestepping the thing being taught. `doubleNumberLine.denom` was
// then measured and found to serve only ONE of the three (the others need 16 and 20 steps against
// a max of 8). ratioTable has no step lattice, so all three fit, and it now renders fractions
// through the SAME `hopLabel` proven for numberLineHop.
//
// Every value below is a count of 1/denom units, so the arithmetic stays integer and exact.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const P = [
  { path: "content/courses/proportional-relationships/lessons/pr-01-01.json", lesson: "pr-01-01", step: "i1",
    denom: 4, rows: [[1, 2], [2, 4]], askA: 4, targetB: 8, bMax: 16, bStep: 1,
    predict: {
      prompt: "A runner covers 1/2 mile in 1/4 hour. In a WHOLE hour \u2014 four of those quarter-hours \u2014 how far?",
      options: [
        { id: "two", label: "2 miles \u2014 four quarter-hours, each carrying 1/2 mile" },
        { id: "half", label: "Still 1/2 mile" },
        { id: "eighth", label: "1/8 mile \u2014 the fractions multiply" },
      ],
      outcomeId: "two",
      reveal: "A unit rate asks what happens in ONE whole unit. Four quarter-hours make an hour, and each brings another half mile: 4 \u00d7 1/2 = 2 miles per hour. Dividing by 1/4 and multiplying by 4 are the same move.",
    },
    widget: {
      prompt: "Each row is a quarter-hour further on. Fill in the distance at a full hour, keeping the ratio the rows show.",
      colA: "time (hours)", colB: "distance (miles)",
      successFeedback: "2 miles per hour. Look down the column: 1/4 \u2192 1/2, 1/2 \u2192 1, and a whole hour \u2192 2. Every row holds the same rate, and dividing 1/2 by 1/4 asks exactly this \u2014 how many quarter-hours fit in an hour, each carrying half a mile.",
      lowFeedback: "Too short. A whole hour is FOUR quarter-hours, and each one carries another half mile.",
      highFeedback: "Too far \u2014 that is more than the rate allows. Compare your row against the 1/2 \u2192 1 row above it." } },

  { path: "content/courses/proportional-relationships/lessons/pr-01-03.json", lesson: "pr-01-03", step: "i1",
    denom: 16, rows: [[5, 10], [10, 20]], askA: 16, targetB: 32, bMax: 48, bStep: 1,
    predict: {
      prompt: "A hiker covers 5/8 mile in 5/16 hour. Is the unit rate more or less than 1 mile per hour?",
      options: [
        { id: "more", label: "More \u2014 5/8 mile in well under half an hour is quick" },
        { id: "less", label: "Less \u2014 5/8 is smaller than 1" },
        { id: "equal", label: "Exactly 1" },
      ],
      outcomeId: "more",
      reveal: "5/16 hour is under a third of an hour, and 5/8 mile is covered in it. Scaling up to a full hour multiplies both by more than three \u2014 so the rate lands well above 1 mile per hour.",
    },
    widget: {
      prompt: "The hiker's pace, in sixteenths of an hour. Fill in the distance at a full hour, keeping the ratio.",
      colA: "time (hours)", colB: "distance (miles)",
      successFeedback: "2 miles per hour. Each row keeps the same rate \u2014 5/16 \u2192 5/8, 10/16 \u2192 10/8, 1 \u2192 2 \u2014 and the awkward-looking fractions never had to become decimals. 5/8 \u00f7 5/16 = 2.",
      lowFeedback: "Too short. A whole hour is sixteen sixteenths \u2014 more than three times the 5/16 in the first row.",
      highFeedback: "Too far. Check against the rows above: the distance grows by the same factor the time does." } },

  { path: "content/courses/proportional-relationships/lessons/pr-01-03.json", lesson: "pr-01-03", step: "i2",
    denom: 20, rows: [[3, 6], [6, 12]], askA: 20, targetB: 40, bMax: 60, bStep: 1,
    widget: {
      prompt: "A pitcher fills 3/10 cup in 3/20 minute. Fill in the amount at a full minute, keeping the ratio.",
      colA: "time (minutes)", colB: "filled (cups)",
      successFeedback: "2 cups per minute. Twentieths kept the whole table exact \u2014 3/20 \u2192 3/10, 6/20 \u2192 6/10, 1 \u2192 2 \u2014 and 3/10 \u00f7 3/20 = 2, the same answer the rows walk you to.",
      lowFeedback: "Too little. A full minute is twenty twentieths, and the first row covers only three of them.",
      highFeedback: "Too much \u2014 more than the rate allows. Compare against the 6/20 \u2192 6/10 row." } },
];

const staged = new Map(); let n = 0;
for (const plan of P) {
  const doc = staged.get(plan.path) ?? JSON.parse(readFileSync(plan.path, "utf8"));
  const st = doc.steps.find((s) => s.id === plan.step);
  if (!st) throw new Error(`${plan.lesson}/${plan.step} missing`);
  if (st.widget?.type === "ratioTable") { staged.set(plan.path, doc); continue; }
  if (st.widget?.type !== "numeric") throw new Error(`${plan.lesson}/${plan.step}: expected numeric, found ${st.widget?.type}`);
  if (st.variant) throw new Error(`${plan.lesson}/${plan.step}: has a variant tag`);

  const widget = { type: "ratioTable", denom: plan.denom, rows: plan.rows, askA: plan.askA,
    targetB: plan.targetB, bMax: plan.bMax, bStep: plan.bStep, bStart: 0, ...plan.widget };
  const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
  if (errs.length) throw new Error(`${plan.lesson}/${plan.step}: ${errs.join("; ")}`);

  // Independent arithmetic: the rate must be the lesson's authored answer.
  const rate = plan.targetB / plan.askA;
  if (rate !== st.widget.answer) throw new Error(`${plan.lesson}/${plan.step}: rate ${rate} != authored ${st.widget.answer}`);
  const [a0, b0] = plan.rows[0];
  if (b0 * plan.askA !== a0 * plan.targetB) throw new Error(`${plan.lesson}/${plan.step}: ratio broken`);
  console.log(`  ${plan.lesson}/${plan.step}: ${a0}/${plan.denom} : ${b0}/${plan.denom} -> unit rate ${rate} (matches authored ${st.widget.answer})`);

  const bodyBefore = st.body;
  const rebuilt = {};
  for (const k of Object.keys(st)) {
    if (k === "widget") { if (plan.predict) rebuilt.predict = plan.predict; rebuilt.widget = widget; continue; }
    rebuilt[k] = st[k];
  }
  if (rebuilt.body !== bodyBefore) throw new Error(`${plan.lesson}/${plan.step}: body changed`);
  doc.steps[doc.steps.findIndex((s) => s.id === plan.step)] = rebuilt;
  staged.set(plan.path, doc); n++;
}
for (const [path, doc] of staged) { writeFileSync(path, JSON.stringify(doc, null, 2), "utf8"); console.log(`${path.split("/").pop()}: written`); }
console.log(`${n} steps converted`);
