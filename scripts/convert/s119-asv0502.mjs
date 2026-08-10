// S119 — asv-05-02 "Volume with Fractional Edges" onto volumeBuilder's new denomL lattice.
// Every value is recomputed here from prismVolume before writing, and the integrity gate
// independently re-derives reachability and the (now unconditional) wholeUnitFeedback requirement.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, prismVolume } = await import("../../src/lib/schema.ts");

const PATH = "content/courses/area-surface-volume/lessons/asv-05-02.json";
const PLAN = {
  i1: {
    l: 1, w: 2, h: 3, denomL: 2, target: 3,
    prompt: "Set the length in half-units, then the width and height, until the box holds 3 cubes.",
    successFeedback: "3! The length is 1/2 \u2014 half of one unit \u2014 and 1/2 \u00d7 2 \u00d7 3 = 3. A fractional edge shrinks the box, but the volume is still exact.",
    lowFeedback: "Not enough yet \u2014 raise one of the dimensions and watch how the volume responds.",
    highFeedback: "Past 3 now \u2014 ease a dimension back, starting with whichever moves the volume fastest.",
    wholeUnitFeedback: "That reads as if the length tick were a WHOLE unit instead of a half. Check the length label \u2014 it should read a fraction, not a whole number.",
  },
  i2: {
    l: 3, w: 4, h: 2, denomL: 2, target: 12,
    prompt: "Build a box 1\u00bd \u00d7 4 \u00d7 2. Set the length in half-units first.",
    successFeedback: "12! 1\u00bd is three half-units, and 1.5 \u00d7 4 \u00d7 2 = 12. The half-unit steps let you land exactly on 1\u00bd without ever leaving the fraction.",
    lowFeedback: "Under 12 \u2014 the length needs three half-unit ticks (1\u00bd) before the width and height finish the job.",
    highFeedback: "Over 12 \u2014 ease a dimension back.",
    wholeUnitFeedback: "That reads as if each length tick were a WHOLE unit rather than a half. Three whole units would be 3, not 1\u00bd \u2014 check the length label.",
  },
};

const doc = JSON.parse(readFileSync(PATH, "utf8"));
let n = 0;
for (const [sid, plan] of Object.entries(PLAN)) {
  const st = doc.steps.find((s) => s.id === sid);
  if (!st) throw new Error(`${sid} missing`);
  if (st.widget?.type === "volumeBuilder") continue;
  if (st.widget?.type !== "numeric") throw new Error(`${sid}: expected numeric, found ${st.widget?.type}`);
  if (st.variant) throw new Error(`${sid}: has a variant tag`);
  const authored = st.widget.answer;

  const widget = {
    type: "volumeBuilder", denomL: plan.denomL, targetVolume: plan.target,
    lMax: 6, wMax: 6, hMax: 6,
    prompt: plan.prompt, successFeedback: plan.successFeedback,
    lowFeedback: plan.lowFeedback, highFeedback: plan.highFeedback,
    wholeUnitFeedback: plan.wholeUnitFeedback,
  };
  const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
  if (errs.length) throw new Error(`${sid}: ${errs.join("; ")}`);

  const derived = prismVolume(plan.l, plan.w, plan.h, plan.denomL);
  if (derived !== authored) throw new Error(`${sid}: derived ${derived} != authored answer ${authored}`);
  console.log(`  ${sid}: prismVolume(${plan.l},${plan.w},${plan.h},denom=${plan.denomL}) = ${derived} (matches authored ${authored})`);

  const bodyBefore = st.body, predictBefore = JSON.stringify(st.predict ?? null);
  st.widget = widget;
  if (st.body !== bodyBefore) throw new Error(`${sid}: body changed`);
  if (JSON.stringify(st.predict ?? null) !== predictBefore) throw new Error(`${sid}: predict changed`);
  n++;
}
if (n > 0) writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log(`${n} steps converted`);
