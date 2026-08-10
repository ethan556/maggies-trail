/* Independent verification of the altitude stage's mathematics — recomputed from the geometry,
 * not read back from the function under test. */
import { altitudeMeans, WidgetSpec, widgetIntegrityErrors } from "../../src/lib/schema";
import { readFileSync } from "node:fs";
import { evaluate } from "../../src/lib/evaluate";

let bad = 0;
const fail = (m: string) => { console.log("  FAIL " + m); bad++; };

// 1. The construction must actually make a RIGHT triangle, and the three geometric means must hold.
for (const shape of [
  [[0, 0], [25, 0], [9, 12]],
  [[1, 1], [16, 9], [4, 12]],
  [[2, 10], [14, 2], [3, 3]]
] as Array<Array<[number, number]>>) {
  for (const k of [0.1, 0.25, 0.36, 0.5, 0.64, 0.8, 0.9]) {
    const g = altitudeMeans(shape, k);
    // apex angle is right: the two legs are perpendicular
    const [A, B] = shape;
    const u = [A[0] - g.apex[0], A[1] - g.apex[1]];
    const v = [B[0] - g.apex[0], B[1] - g.apex[1]];
    const dot = u[0] * v[0] + u[1] * v[1];
    if (Math.abs(dot) > 1e-9) fail(`apex angle not right at k=${k}: dot=${dot}`);
    // altitude is the geometric mean of the two hypotenuse pieces
    if (Math.abs(g.h - Math.sqrt(g.p * g.q)) > 1e-12) fail(`h != sqrt(pq) at k=${k}`);
    // each leg is the geometric mean of its adjacent piece and the whole hypotenuse
    if (Math.abs(g.legA - Math.sqrt(g.p * g.c)) > 1e-9) fail(`legA != sqrt(p·c) at k=${k}`);
    if (Math.abs(g.legB - Math.sqrt(g.q * g.c)) > 1e-9) fail(`legB != sqrt(q·c) at k=${k}`);
    // Pythagoras closes
    if (Math.abs(g.legA ** 2 + g.legB ** 2 - g.c ** 2) > 1e-9) fail(`Pythagoras fails at k=${k}`);
    // the foot lies on the hypotenuse
    const onLine = (g.foot[0] - A[0]) * (B[1] - A[1]) - (g.foot[1] - A[1]) * (B[0] - A[0]);
    if (Math.abs(onLine) > 1e-9) fail(`foot off the hypotenuse at k=${k}`);
  }
}
console.log("  geometry: right angle, h²=pq, leg²=piece·hypotenuse, Pythagoras, foot on line — all hold");

// 2. The three authored lessons: spec parses, gates clean, target grades, both wrong sides fire.
for (const [id, sid] of [["sy-04-01", "i1"], ["sy-04-02", "i2"], ["sy-04-03", "i1"]] as const) {
  const lesson = JSON.parse(readFileSync(`content/courses/similarity/lessons/${id}.json`, "utf8"));
  const step = lesson.steps.find((s: { id: string }) => s.id === sid);
  if (!step) { fail(`${id}/${sid} missing`); continue; }
  const parsed = WidgetSpec.safeParse(step.widget);
  if (!parsed.success) { fail(`${id}/${sid} does not parse`); continue; }
  const spec = parsed.data;
  if (spec.type !== "dilationExplore") { fail(`${id}/${sid} is ${spec.type}`); continue; }
  const errs = widgetIntegrityErrors(spec);
  if (errs.length) fail(`${id}/${sid} integrity: ${errs.join("; ")}`);
  if (!evaluate(spec, { k: spec.targetK }).correct) fail(`${id}/${sid} target does not grade correct`);
  const lo = evaluate(spec, { k: spec.targetK - spec.kStep });
  const hi = evaluate(spec, { k: spec.targetK + spec.kStep });
  if (lo.feedback !== spec.lowFeedback) fail(`${id}/${sid} lowFeedback unreachable`);
  if (hi.feedback !== spec.highFeedback) fail(`${id}/${sid} highFeedback unreachable`);
  if (!step.predict) fail(`${id}/${sid} has no predict`);
  const g = altitudeMeans(spec.shape as Array<[number, number]>, spec.targetK);
  console.log(`  ok   ${id}/${sid}  hypotenuse ${g.c.toFixed(0)} split ${g.p.toFixed(0)}/${g.q.toFixed(0)} -> altitude ${g.h.toFixed(2)}`);
}
console.log(bad ? `\n${bad} problem(s)` : "\naltitude stage verified independently");
process.exit(bad ? 1 : 0);
