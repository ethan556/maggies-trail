// S119 — the tm-05 round-solid trio onto volumeBuilder's new circular modes.
// Each derived coefficient is checked against the lesson's own authored answer before writing.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, roundSolidCoef } = await import("../../src/lib/schema.ts");

const DIR = "content/courses/transformations-measurement/lessons";
const P = {
  "tm-05-01": { solid: "cylinder", target: 36, r: 3, h: 4, widget: {
    prompt: "Set the radius and height until the cylinder's volume reads 36\u03c0.",
    successFeedback: "36\u03c0. The base circle is \u03c0r\u00b2 = 9\u03c0, and the height stacks four of them \u2014 that is all \u03c0r\u00b2h means: a base area, repeated up the height.",
    lowFeedback: "Still under 36\u03c0. Widening the radius moves the volume fastest, because r counts twice over.",
    highFeedback: "Over 36\u03c0. Ease the radius back \u2014 squaring makes it the strongest control." } },
  "tm-05-02": { solid: "cone", target: 12, r: 3, h: 4, widget: {
    prompt: "Set the radius and height until the cone's volume reads 12\u03c0. Compare it with the cylinder that shares those measurements.",
    successFeedback: "12\u03c0 \u2014 and a cylinder with the same radius 3 and height 4 holds 36\u03c0. The cone is exactly a third of it. That is what the \u00f7 3 in the formula is: three cones fill their cylinder.",
    lowFeedback: "Still under 12\u03c0. Try widening the radius before raising the height.",
    highFeedback: "Over 12\u03c0. Ease the radius back \u2014 it counts twice over." } },
  "tm-05-03": { solid: "sphere", target: 36, r: 3, h: 1, widget: {
    prompt: "A sphere has only one measurement. Set the radius until the volume reads 36\u03c0.",
    successFeedback: "36\u03c0 at radius 3 \u2014 the same volume as the cylinder of radius 3 and height 4 from the earlier lesson. A sphere needs no height because its radius already fixes it in every direction, which is why r appears three times rather than twice.",
    lowFeedback: "Still under 36\u03c0 \u2014 grow the radius. It counts three times over here, so small moves go a long way.",
    highFeedback: "Over 36\u03c0 \u2014 ease the radius back." } },
};

const staged = []; let n = 0;
for (const [lesson, plan] of Object.entries(P)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const st = doc.steps.find((s) => s.id === "i1");
  if (!st) throw new Error(`${lesson}: i1 missing`);
  if (st.widget?.type === "volumeBuilder") continue;
  if (st.widget?.type !== "numeric") throw new Error(`${lesson}: expected numeric, found ${st.widget?.type}`);
  if (st.variant) throw new Error(`${lesson}: i1 has a variant tag`);
  const authored = st.widget.answer;

  const widget = { type: "volumeBuilder", solid: plan.solid, targetVolume: plan.target,
    rMax: 6, rStart: 1, hMax: 6, hStart: 1, ...plan.widget };
  const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
  if (errs.length) throw new Error(`${lesson}: ${errs.join("; ")}`);

  const c = roundSolidCoef(plan.solid, plan.r, plan.h);
  if (c.den !== 1) throw new Error(`${lesson}: coefficient ${c.num}/${c.den} is not whole`);
  if (c.num !== authored) throw new Error(`${lesson}: derived ${c.num} != authored ${authored}`);
  console.log(`  ${lesson}: ${plan.solid} r=${plan.r}${plan.solid==="sphere"?"":` h=${plan.h}`} -> ${c.num}\u03c0 (matches authored ${authored})`);

  const bodyBefore = st.body, predictBefore = JSON.stringify(st.predict ?? null);
  st.widget = widget;
  if (st.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(st.predict ?? null) !== predictBefore) throw new Error(`${lesson}: predict changed`);
  staged.push([path, doc, lesson]); n++;
}
for (const [path, doc, lesson] of staged) { writeFileSync(path, JSON.stringify(doc, null, 2), "utf8"); console.log(`${lesson}: written`); }
console.log(`${n} lessons converted`);
