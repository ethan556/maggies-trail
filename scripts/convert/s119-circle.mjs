// S119 — the g7-02 circle trio onto `circleMeasureExplore` radiusScale.
//
// All three lessons ask about radius 5 and differ only in which measure they want: diameter 10,
// circumference 10π, area 25π. Each was a numeric box beside a formula. The lab makes the formula
// a response: drag r and the three measures recompute together, so g7-02-03's own concept
// sentence — "C = 2πr doubles, A = πr² squares" — becomes something watched rather than warned about.
//
// Each keeps its authored predict, byte-for-byte. Every target is re-derived here from r before
// writing, and the integrity gate re-derives it again independently.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, circleScaleReadouts } = await import("../../src/lib/schema.ts");

const DIR = "content/courses/geometry-g7/lessons";
const P = {
  "g7-02-01": { ask: "diameter", widget: {
    prompt: "Drag the radius until the DIAMETER reads 10. Watch what the other two measures do on the way.",
    successFeedback: "Radius 5, diameter 10 — the diameter is always exactly twice the radius, which is why C = πd and C = 2πr are the same formula wearing different clothes.",
    lowFeedback: "The diameter is still under 10 — pull the radius outward.",
    highFeedback: "The diameter has passed 10 — ease the radius back in." } },
  "g7-02-02": { ask: "circumference", widget: {
    prompt: "Drag the radius until the CIRCUMFERENCE reads 10π. Keep an eye on the area as you go.",
    successFeedback: "Radius 5: circumference 10π. Notice the area alongside it — 25π, not 10π. The circumference doubled the radius; the area squared it. That gap is why the two formulas are never interchangeable.",
    lowFeedback: "The circumference is still under 10π — pull the radius outward.",
    highFeedback: "The circumference has passed 10π — ease the radius back in." } },
  "g7-02-03": { ask: "area", widget: {
    prompt: "Drag the radius until the AREA reads 25π. Compare it with the circumference at every step.",
    successFeedback: "Radius 5: area 25π, while the circumference is only 10π. Pull the radius outward and the gap widens — double r and the circumference doubles, but the area quadruples. Squaring outruns doubling, always.",
    lowFeedback: "The area is still under 25π — pull the radius outward.",
    highFeedback: "The area has passed 25π — ease the radius back in." } },
};

const staged = []; let n = 0;
for (const [lesson, plan] of Object.entries(P)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const st = doc.steps.find((s) => s.id === "i1");
  if (!st) throw new Error(`${lesson}: i1 missing`);
  if (st.widget?.type === "circleMeasureExplore") continue;
  if (st.widget?.type !== "numeric") throw new Error(`${lesson}: expected numeric, found ${st.widget?.type}`);
  if (st.variant) throw new Error(`${lesson}: i1 has a variant tag`);
  const authored = st.widget.answer;

  const widget = { type: "circleMeasureExplore", mode: "radiusScale", radius: 5, targetRadius: 5,
    radiusMax: 10, askQuantity: plan.ask, ...plan.widget };
  const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
  if (errs.length) throw new Error(`${lesson}: ${errs.join("; ")}`);

  const t = circleScaleReadouts(widget.targetRadius);
  const derived = plan.ask === "diameter" ? t.diameter : plan.ask === "area" ? t.areaCoef : t.circumferenceCoef;
  if (derived !== authored) throw new Error(`${lesson}: derived ${plan.ask} ${derived} != authored answer ${authored}`);
  console.log(`  ${lesson}: r=${widget.targetRadius} -> ${plan.ask} ${derived} (matches authored ${authored})`);

  const bodyBefore = st.body, predictBefore = JSON.stringify(st.predict ?? null);
  st.widget = widget;
  if (st.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(st.predict ?? null) !== predictBefore) throw new Error(`${lesson}: predict changed`);
  staged.push([path, doc, lesson]); n++;
}
for (const [path, doc, lesson] of staged) { writeFileSync(path, JSON.stringify(doc, null, 2), "utf8"); console.log(`${lesson}: written`); }
console.log(`${n} lessons converted`);
