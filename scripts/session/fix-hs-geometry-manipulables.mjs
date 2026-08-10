#!/usr/bin/env node
/**
 * fix-hs-geometry-manipulables — batch 1 of the high-school Tier C repair, on geometry.
 *
 * THE MECHANIC (S203J). All 196 HS Tier C/D lessons are blocked by `d.manip < 2` and nothing else.
 * `d.manip` is the MAX over a lesson's engines, so converting ONE already-interactive step onto a
 * manipulable engine lifts the lesson to Tier B without touching prose, answers, hints or
 * diagnostics. The statistical-inference pilot moved 6/6 attempted lessons C -> B exactly as
 * modelled.
 *
 * THE PILOT'S REAL LESSON WAS THE REFUSALS. It attempted 6 of 8 and left two alone because no
 * existing engine modelled a judgement ladder over study designs honestly — a 75% fit rate, and a
 * planning number worth more than the six conversions. A repair script that converts everything it
 * is pointed at produces a better number and a worse product. So this batch also refuses, and says
 * why, in the REFUSED table below.
 *
 * WHY GEOMETRY FIRST. Highest fit confidence: the engines are concrete, spatial and already proven —
 * `volumeBuilder`, `netFold`, `shapeFamilyBuilder`, `shapeHierarchyLab`, `angleMeasure` — and all
 * five were built for K-8 and have never been used above grade 8.
 *
 * HABIT 3, checked before authoring. `volumeBuilder`, `netFold` and `shapeFamilyBuilder` are
 * referenced by no audit at all. The three that are referenced are all SCOPED to fixed lesson sets,
 * so new uses elsewhere cannot disturb their counts:
 *   composite-area-s136   → an explicit lessonPaths list
 *   geometry-roundup-s137 → geometry-g7/g7-04-03 alone
 *   shape-hierarchy-s140  → three coordinate-geometry lessons
 *
 * Usage:  node scripts/session/fix-hs-geometry-manipulables.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dry = process.argv.includes("--dry-run");
let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error(`REPAIR: ${msg}`); };
process.on("uncaughtException", (e) => {
  console.error(`\n✗ ${e?.message ?? e}\n  nothing was written.`);
  process.exit(1);
});

const vol = ({ prompt, targetVolume, l, w, h, lStart, wStart, hStart, builds, success, low, high }) => ({
  type: "volumeBuilder", prompt, targetVolume,
  lMax: l, wMax: w, hMax: h, lStart, wStart, hStart,
  lockW: false, lockH: false,
  commonBuilds: builds.map(([volume, feedback]) => ({ volume, feedback })),
  successFeedback: success,
  lowFeedback: low, highFeedback: high
});
const net = ({ prompt, targetSurfaceArea, l, w, h, success, low, high }) => ({
  type: "netFold", prompt, targetSurfaceArea,
  lMax: l, wMax: w, hMax: h, lStart: 2, wStart: 2, hStart: 2,
  successFeedback: success, lowFeedback: low, highFeedback: high
});
const family = ({ prompt, targetName, sides, right, equal, parallel, success, sidesFb, attrFb }) => ({
  type: "shapeFamilyBuilder", prompt, targetName,
  targetSides: sides, targetRightAngles: right, targetEqualSides: equal, targetParallelPairs: parallel,
  startSides: 3, successFeedback: success, sidesFeedback: sidesFb, attributesFeedback: attrFb
});
const angle = ({ prompt, target, start, success, low, high }) => ({
  type: "angleMeasure", prompt, targetAngle: target, angleStart: start, angleStep: 5,
  successFeedback: success, lowFeedback: low, highFeedback: high
});

/* ---------------------------------------------------------------- the conversions */

const EDITS = [
  /* --- solid-geometry: volume and surface are literally what these engines model --- */
  {
    course: "solid-geometry", lesson: "sg-04-02", step: "i1",
    widget: vol({
      prompt: "Build the solid block first: 5 long, 4 wide, 3 tall. The hole drilled out of it will be subtracted next.",
      targetVolume: 60, l: 6, w: 6, h: 6, lStart: 2, wStart: 2, hStart: 2,
      builds: [
        [12, "12 is one face's area, not the volume. Volume needs all three dimensions multiplied: 5 × 4 × 3."],
        [20, "20 is 5 × 4 — the base only. Multiply by the height of 3 as well."]
      ],
      low: "Fewer cubes than the block needs — grow a dimension toward 5 by 4 by 3.",
      high: "More cubes than the block needs — shrink a dimension toward 5 by 4 by 3.",
      success: "60 cubic units. Now the subtraction is easy to see: whatever the hole removes comes straight off this 60, which is why composite volume is always build-then-subtract rather than a new formula."
    })
  },
  {
    course: "solid-geometry", lesson: "sg-04-03", step: "i1",
    widget: net({
      prompt: "Unfold a 4 by 3 by 2 box and set its wrapping to exactly 52 square units.",
      targetSurfaceArea: 52, l: 6, w: 6, h: 6,
      success: "4 by 3 by 2: faces of 12, 8 and 6, each appearing twice, give 52. Watch what this means for composites — glue two boxes together and the touching faces stop needing paper, which is why surface area is never simply added.",
      low: "Not enough surface yet — grow a dimension.",
      high: "More surface than needed — shrink a dimension."
    })
  },
  {
    course: "solid-geometry", lesson: "sg-05-02", step: "i1",
    widget: vol({
      prompt: "A designer needs a 3 by 3 by 4 block. Build it, then read its volume — density will turn that volume into a mass.",
      targetVolume: 36, l: 6, w: 6, h: 6, lStart: 2, wStart: 2, hStart: 2,
      builds: [
        [9, "9 is the 3 × 3 base. The block is 4 tall, so multiply by 4."],
        [12, "12 is 3 × 4, one face. All three dimensions multiply: 3 × 3 × 4."]
      ],
      low: "Fewer cubes than the designer asked for — grow toward 3 by 3 by 4.",
      high: "More cubes than the designer asked for — shrink toward 3 by 3 by 4.",
      success: "36 cubic units. Density is mass per unit volume, so this single number is what a density figure gets multiplied by — change the shape and the mass follows."
    })
  },
  {
    course: "solid-geometry", lesson: "sg-05-03", step: "i1",
    widget: vol({
      prompt: "Model a shipping crate as a rectangular prism 6 by 4 by 2 and read its capacity.",
      targetVolume: 48, l: 6, w: 6, h: 6, lStart: 2, wStart: 2, hStart: 2,
      builds: [
        [24, "24 is 6 × 4, the floor of the crate. Capacity needs the height of 2 as well."],
        [12, "12 is 6 × 2, one side. Multiply all three: 6 × 4 × 2."]
      ],
      low: "Smaller than the crate — grow a dimension toward 6 by 4 by 2.",
      high: "Larger than the crate — shrink a dimension toward 6 by 4 by 2.",
      success: "48 cubic units. Modelling means choosing a solid whose formula you trust and accepting the error that choice introduces — a real crate has walls, and this model ignores them."
    })
  },

  /* --- polygons-quadrilaterals: the quadrilateral family, built rather than described --- */
  {
    course: "polygons-quadrilaterals", lesson: "pq-03-02", step: "i1",
    widget: family({
      prompt: "Build a rhombus: four sides, two parallel pairs, and all four sides equal.",
      targetName: "rhombus", sides: 4, right: 0, equal: 4, parallel: 2,
      success: "A rhombus is a parallelogram with all four sides equal — no right angles required. Add four right angles as well and it becomes a square, which is why the square sits inside both families.",
      sidesFb: "Start inside the quadrilateral family with four sides.",
      attrFb: "A rhombus needs all four sides equal, and it keeps the parallelogram's two parallel pairs."
    })
  },
  {
    course: "polygons-quadrilaterals", lesson: "pq-04-01", step: "i1",
    widget: family({
      prompt: "Build a trapezoid: four sides, and exactly one pair of parallel sides.",
      targetName: "trapezoid", sides: 4, right: 0, equal: 0, parallel: 1,
      success: "One parallel pair, not two — that single difference is what separates a trapezoid from a parallelogram, and it is why a parallelogram counts as a trapezoid under the inclusive definition but not the exclusive one.",
      sidesFb: "Start inside the quadrilateral family with four sides.",
      attrFb: "A trapezoid needs exactly one pair of parallel sides."
    })
  },
  {
    course: "polygons-quadrilaterals", lesson: "pq-01-02", step: "i1",
    widget: angle({
      prompt: "A regular hexagon turns through the same exterior angle at each corner, six times, to complete one full lap. Set that angle.",
      target: 60, start: 0,
      success: "60°, because 6 × 60 = 360. The exterior angles of ANY polygon total one full lap, however many sides it has — which is why a hexagon's is 360 ÷ 6 and a pentagon's is the untidy 360 ÷ 5 = 72°.",
      low: "Too narrow — six turns of this size would not complete the full 360° lap.",
      high: "Too wide — six turns of this size would overshoot a full lap."
    })
  }
];

/* ---------------------------------------------------------------- the refusals */

const REFUSED = [
  ["solid-geometry/sg-01-02", "Solids of Revolution",
    "The mathematics is a 2D region swept about an axis. `volumeBuilder` builds prisms from unit cubes and cannot represent a revolution; using it would model a different solid than the lesson teaches."],
  ["solid-geometry/sg-03-03", "The Sphere Surrenders",
    "A derivation of the sphere's volume by comparison with a cylinder and cone. No registered engine represents a sphere as a manipulable state."],
  ["polygons-quadrilaterals/pq-02-01", "Opposite Sides",
    "The lesson is about the general parallelogram, and `shapeFamilyBuilder`'s targetName enum has no 'parallelogram' — it offers triangle, quadrilateral, rectangle, square, rhombus, trapezoid, pentagon, hexagon. Building a rectangle instead would teach a special case as if it were the general one. Found by the schema gate, not by reading."],
  ["polygons-quadrilaterals/pq-02-02", "Opposite & Consecutive Angles",
    "About the angle RELATIONSHIPS inside a parallelogram, not about building one. `angleMeasure` sets a single angle in isolation and would not show the supplementary pairing that is the lesson's point."],
  ["polygons-quadrilaterals/pq-05-03", "The Quadrilateral Capstone",
    "A synthesis exercise across the whole family. `shapeHierarchyLab` was considered and rejected: it argues about property inheritance between two named nodes, while this lesson ranges over all the families at once."]
];

/* ---------------------------------------------------------------- apply */

const changed = [];
for (const e of EDITS) {
  const p = join(root, "content/courses", e.course, "lessons", `${e.lesson}.json`);
  must(existsSync(p), `${e.lesson}: file not found`);
  const lesson = JSON.parse(readFileSync(p, "utf8"));
  const step = lesson.steps.find((s) => s.id === e.step);
  must(step, `${e.lesson}/${e.step}: step not found`);
  must(step.kind === "interactive", `${e.lesson}/${e.step}: expected interactive, found ${step.kind}`);
  must(step.widget, `${e.lesson}/${e.step}: has no widget to replace`);
  must(!step.predict, `${e.lesson}/${e.step}: carries a predict block; converting would change prediction scoring`);
  const was = step.widget.type;
  must(was !== e.widget.type, `${e.lesson}/${e.step}: already a ${was}`);
  step.widget = e.widget;
  if (!dry) writeFileSync(p, JSON.stringify(lesson, null, 2) + "\n");
  changed.push(`${e.course}/${e.lesson}/${e.step}: ${was} -> ${e.widget.type}`);
}

console.log(`${dry ? "[dry-run] " : ""}${changed.length} steps converted, ${asserts} assertions passed`);
for (const c of changed) console.log(`  ${c}`);
console.log(`\nrefused (${REFUSED.length}) — left at Tier C deliberately:`);
for (const [id, title, why] of REFUSED) console.log(`  ${id} "${title}"\n    ${why}`);
console.log(`\nfit rate this batch: ${EDITS.length}/${EDITS.length + REFUSED.length}`);
