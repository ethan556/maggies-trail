// S119 -- tg-05-02, closing S115's second residue item, but NOT the way S115's own note proposed.
//
// S115 diagnosed: "theta = arcsin(3/5) is off unitCircleExplore's integer-degree lattice
// (~36.87 degrees), so no reachable drag state names it exactly," and proposed an exact-ratio
// snapping mode for that engine as the natural fix.
//
// Reading the ACTUAL step (not just the diagnosis) shows that proposal solves a problem this
// lesson does not have. i1 never asks for an ANGLE in degrees at all -- it gives opposite=3 and
// hypotenuse=5 and asks for the adjacent leg, an exact Pythagorean-triple computation (answer 4,
// tolerance 0). The lesson's own concept step already says "draw the helper right triangle,"
// and `distanceGrid` -- registered, integer-only, and documented as showing "the distance formula
// as the Pythagorean theorem" -- draws exactly that triangle: two legs (sky, tangerine) and a
// hypotenuse (berry) from a fixed anchor to a dragged point, with a live
// sqrt(dx^2 + dy^2) readout. No engine work of any kind is required.
//
// Design: anchor at the origin (the angle's vertex); the "opposite" leg (3, given) is fixed as
// the starting y so the interaction is scoped to what the lesson actually asks -- hunting the
// unknown adjacent leg by dragging x until the live hypotenuse readout reads exactly 5. Verified:
// sqrt(4^2 + 3^2) = sqrt(25) = 5, the classic 3-4-5 triple the lesson's own commonErrors reference.

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "content/courses/trig-graphs-inverses/lessons/tg-05-02.json";

const predict = {
  prompt:
    "Opposite is 3, hypotenuse is 5. As you slide the adjacent leg longer, what happens to the hypotenuse reading?",
  options: [
    { id: "grows", label: "It grows too, until one exact length makes it read 5" },
    { id: "fixed", label: "It stays 5 no matter what \u2014 hypotenuse is fixed by the angle alone" },
    { id: "shrinks", label: "It shrinks, since a longer adjacent leaves less for the hypotenuse" },
  ],
  outcomeId: "grows",
  reveal:
    "The hypotenuse is the far side of a triangle whose other two legs you are setting \u2014 stretch either leg and it has to grow to reach across. Only ONE adjacent length makes it land on exactly 5 with opposite held at 3.",
};

const widget = {
  type: "distanceGrid",
  prompt:
    "The angle's vertex sits at the origin. Opposite is fixed at 3. Drag the point until the hypotenuse reads exactly 5 \u2014 its x-coordinate is the adjacent leg.",
  anchor: [0, 0],
  targetPoint: [4, 3],
  gridMin: 0,
  gridMax: 6,
  startX: 0,
  startY: 3,
  successFeedback:
    "\u221a(4\u00b2 + 3\u00b2) = \u221a25 = 5 \u2014 the classic 3-4-5 triple. The adjacent leg is 4, and you found it by watching the hypotenuse arrive at 5, not by recalling a formula.",
  wrongPointFeedback:
    "Not yet \u2014 read the number under the square root. If it shows 34, you added 5\u00b2 to 3\u00b2 instead of using 5 as the HYPOTENUSE (the longest side, opposite the right angle) and solving for the shorter leg: adjacent\u00b2 = 5\u00b2 \u2212 3\u00b2, not 5\u00b2 + 3\u00b2. If it shows 2, that subtracted the legs directly (5 \u2212 3) instead of subtracting their SQUARES and rooting the result.",
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const doc = JSON.parse(readFileSync(PATH, "utf8"));
const step = doc.steps.find((s) => s.id === "i1");
if (!step) throw new Error("i1 not found");
if (step.widget?.type === "distanceGrid") {
  console.log("tg-05-02: already converted, nothing to do");
  process.exit(0);
}
if (step.widget?.type !== "numeric") throw new Error(`expected numeric at i1, found ${step.widget?.type}`);
if (step.variant) throw new Error("i1 carries a variant tag");
if (step.predict) throw new Error("i1 already has a predict");

const parsed = WidgetSpec.parse(widget);
const errs = widgetIntegrityErrors(parsed);
if (errs.length) throw new Error(`integrity \u2014 ${errs.join("; ")}`);

// Independent arithmetic check, not trusting the authored numbers.
const [tx, ty] = widget.targetPoint;
const [ax, ay] = widget.anchor;
const dist = Math.hypot(tx - ax, ty - ay);
if (dist !== 5) throw new Error(`targetPoint distance is ${dist}, expected exactly 5`);
console.log(`  verified: sqrt(${tx}^2 + ${ty}^2) = ${dist}`);

const bodyBefore = step.body;
const rebuilt = {};
for (const k of Object.keys(step)) {
  if (k === "widget") { rebuilt.predict = predict; rebuilt.widget = widget; continue; }
  rebuilt[k] = step[k];
}
if (rebuilt.body !== bodyBefore) throw new Error("body changed");
const idx = doc.steps.findIndex((s) => s.id === "i1");
doc.steps[idx] = rebuilt;

writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log("tg-05-02/i1: numeric -> distanceGrid (+predict), zero engine changes");
