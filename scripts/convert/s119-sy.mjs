// S119, seventh pass -- the sy- (Similarity) cluster.
//
// I came to this course intending to build a two-triangle comparison mode, because tm-03-03 needs
// one and the playbook assigns the sy- criteria lessons to `triangleConstraintLab`. Reading the
// eleven Tier-C lessons first changed the plan: most of them are not criterion questions at all.
// They are PROPORTIONS -- corresponding sides, shadow heights, map scales -- and the constant
// ratio is the whole of what similarity means. `ratioTable` shows exactly that: known rows fixed,
// one row's value set by the learner, and the ratio holding down the column while both numbers
// grow. Registered, already used twice this session, no engine work.
//
// Every proportion is verified by cross-multiplication in the script before any write, including
// each SHOWN row -- a decorative row that broke the ratio would teach a false pattern -- plus that
// the target lands on the bStep lattice and inside bMax.
//
// Converted (one step each, the first genuine proportion; later numeric steps stay as
// formalization AFTER the manipulation, which is the ordering the tier formula rewards):
//   sy-01-02/i2  AB 6 <-> DE 9, BC 8 -> EF 12      (6 x 12 = 9 x 8 = 72)
//   sy-05-01/i1  6ft person / 4ft shadow, 20ft tree shadow -> 30ft   (4 x 30 = 6 x 20 = 120)
//   sy-05-02/i1  scale 1 : 50, model 8cm -> 400cm  (1 x 400 = 50 x 8 = 400)
//
// Measured and DECLINED:
//   sy-02-02/i2 and sy-02-01/i1 ask for a scale FACTOR or a RATIO as the answer (3; 1.5).
//     `ratioTable` grades a scaled VALUE in column B, not the ratio itself, so converting would
//     silently change what the step asks. A ratio-readout mode would fit; that is engine work.
//   sy-04-01/sy-04-02 are the altitude-to-hypotenuse family (geometric mean, three similar
//     triangles). The relationship is between three nested triangles sharing an altitude -- no
//     registered engine draws that configuration, and a proportion table would assert the
//     correspondence the lesson exists to establish.
//   sy-01-03/i1 is the 180-degree sum (40 + 75 -> 65). `triangleAngleLab` fits the arithmetic but
//     the lesson's subject is that TWO triangles sharing two angles share the third; a one-triangle
//     lab would show the sum without showing the sharing, which is the actual claim.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/similarity/lessons";

const PLAN = {
  "sy-01-02": {
    step: "i2",
    expect: "numeric",
    predict: {
      prompt:
        "AB = 6 corresponds to DE = 9. Going from the small triangle to the large one, what happens to every side?",
      options: [
        { id: "ratio", label: "Each is multiplied by the same ratio, 9/6" },
        { id: "add", label: "Each grows by the same amount, 3" },
        { id: "vary", label: "Each changes by its own amount" },
      ],
      outcomeId: "ratio",
      reveal:
        "Similar figures scale by a RATIO, not by an amount added. 6 becomes 9 by multiplying by 1.5 \u2014 so every other side multiplies by 1.5 too. Adding 3 to each side would distort the shape.",
    },
    widget: {
      type: "ratioTable",
      prompt:
        "\u25b3ABC ~ \u25b3DEF. Fill in the row for BC = 8, keeping the same ratio the other rows show.",
      colA: "\u25b3ABC side",
      colB: "\u25b3DEF side",
      rows: [
        [6, 9],
        [2, 3],
      ],
      askA: 8,
      targetB: 12,
      bMax: 20,
      bStep: 1,
      bStart: 0,
      successFeedback:
        "EF = 12. Read down the column: 6\u21929, 2\u21923, 8\u219212 \u2014 every pair multiplies by the same 1.5. That constant multiplier is what similarity IS. Adding 3 instead would have given 11, and the shape would no longer match.",
      lowFeedback:
        "Too short. Compare your row against 6\u21929 above it: the second number is one and a half times the first, so 8 has further to go.",
      highFeedback:
        "Too long \u2014 that stretches BC by more than the other rows are stretched. Every row here multiplies by the same 1.5.",
    },
  },
  "sy-05-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A 6-ft person casts a 4-ft shadow. The tree's shadow is 20 ft \u2014 five times as long. How tall is the tree?",
      options: [
        { id: "five", label: "Five times the person's height \u2014 30 ft" },
        { id: "add", label: "6 + 16 = 22 ft, since the shadow grew by 16" },
        { id: "product", label: "6 \u00d7 20 = 120 ft" },
      ],
      outcomeId: "five",
      reveal:
        "The sun makes the same angle for both, so person and tree form similar triangles: height and shadow scale together. A shadow five times longer means a height five times taller \u2014 30 ft.",
    },
    widget: {
      type: "ratioTable",
      prompt:
        "Height and shadow scale together. Fill in the height for a 20-ft shadow, keeping the ratio the rows show.",
      colA: "shadow (ft)",
      colB: "height (ft)",
      rows: [
        [4, 6],
        [8, 12],
      ],
      askA: 20,
      targetB: 30,
      bMax: 40,
      bStep: 1,
      bStart: 0,
      successFeedback:
        "30 ft. Every row holds the same height-to-shadow ratio \u2014 6/4, 12/8, 30/20 all reduce to 1.5. The sun's angle is what forces that: person and tree are the upright sides of two similar triangles, so their shadows scale by the same factor they do.",
      lowFeedback:
        "Too short. A 20-ft shadow is five times the person's 4-ft shadow, so the height has to be five times the person's too.",
      highFeedback:
        "Too tall \u2014 check against the rows above. 120 would come from 6 \u00d7 20, which forgets to divide by the person's own shadow.",
    },
  },
  "sy-05-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A model is built at scale 1 : 50. Its 8 cm part stands for how much real length?",
      options: [
        { id: "mult", label: "8 \u00d7 50 \u2014 every model centimetre stands for 50 real ones" },
        { id: "add", label: "8 + 50, adding the scale on" },
        { id: "div", label: "8 \u00f7 50, since the model is smaller" },
      ],
      outcomeId: "mult",
      reveal:
        "A scale is a ratio, so it MULTIPLIES. Each centimetre of model stands for 50 real centimetres, and 8 of them stand for 8 \u00d7 50 = 400. Dividing would go the other way, from real to model.",
    },
    widget: {
      type: "ratioTable",
      prompt:
        "The scale is 1 : 50. Fill in the real length for an 8 cm model part, keeping the ratio the rows show.",
      colA: "model (cm)",
      colB: "real (cm)",
      rows: [
        [1, 50],
        [2, 100],
      ],
      askA: 8,
      targetB: 400,
      bMax: 500,
      bStep: 10,
      bStart: 0,
      successFeedback:
        "400 cm. Down the column the ratio never moves: 1\u219250, 2\u2192100, 8\u2192400. A scale is a multiplier, not something added \u2014 which is why 8 + 50 = 58 is the wrong shape of answer entirely, not just the wrong number.",
      lowFeedback:
        "Too short. Each model centimetre stands for 50 real ones, so 8 of them reach much further \u2014 compare with the 2\u2192100 row.",
      highFeedback:
        "Too long \u2014 that is more than the scale allows. Eight model centimetres stand for 8 \u00d7 50.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);
  if (step.widget?.type === plan.widget.type) { skipped.push(lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.variant) throw new Error(`${lesson}/${plan.step}: carries a variant tag`);
  if (step.predict) throw new Error(`${lesson}/${plan.step}: already has a predict`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${lesson}: integrity \u2014 ${errs.join("; ")}`);

  // Cross-multiplication on the asked row AND on every shown row.
  const w = plan.widget;
  const [a0, b0] = w.rows[0];
  if (b0 * w.askA !== a0 * w.targetB)
    throw new Error(`${lesson}: ${b0}/${a0} != ${w.targetB}/${w.askA}`);
  for (const [a, b] of w.rows)
    if (b * a0 !== a * b0) throw new Error(`${lesson}: shown row ${a}:${b} breaks the ratio`);
  if (w.targetB > w.bMax) throw new Error(`${lesson}: targetB above bMax`);
  if (w.targetB % w.bStep !== 0) throw new Error(`${lesson}: targetB off the bStep lattice`);
  console.log(`  ${lesson}: ${a0}:${b0} = ${w.askA}:${w.targetB} \u2713 (rows consistent, target on lattice)`);

  const bodyBefore = step.body;
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") { rebuilt.predict = plan.predict; rebuilt.widget = plan.widget; continue; }
    rebuilt[k] = step[k];
  }
  if (rebuilt.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  const idx = doc.steps.findIndex((s) => s.id === plan.step);
  doc.steps[idx] = rebuilt;
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ratioTable (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
