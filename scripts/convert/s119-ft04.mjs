// S119 — the ft-04 trio (all Tier D 24) onto functionMachine's second stage.
// Every target is recomputed here from the two stages before writing, and the integrity gate
// independently re-derives reachability.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, fmOutput } = await import("../../src/lib/schema.ts");

const DIR = "content/courses/function-transformations/lessons";
const P = {
  "ft-04-01": { step: "i1", w: {
    // f(x) = x², g(x) = 2x + 1, (f + g)(3) = 9 + 7 = 16
    a: 1, b: 0, square: true, stage2: { a: 2, b: 1, square: false }, join: "add",
    inputMin: 0, inputMax: 8, inputStep: 1, inputStart: 0, targetOutput: 16,
    prompt: "Both machines take the SAME input: f squares it, g doubles and adds 1. Find the input where their outputs add to 16.",
    successFeedback: "At x = 3: f gives 9, g gives 7, and 9 + 7 = 16. Adding functions means running both on the same input and adding what comes out \u2014 not combining the machines into one.",
    lowFeedback: "The two outputs still add to less than 16 \u2014 raise the input.",
    highFeedback: "Past 16 now \u2014 the squaring machine climbs fast, so ease the input back." } },
  "ft-04-02": { step: "i1", w: {
    // g(x) = 2x then f(x) = x + 3: f(g(4)) = 11
    a: 2, b: 0, square: false, stage2: { a: 1, b: 3, square: false }, join: "compose",
    inputMin: 0, inputMax: 10, inputStep: 1, inputStart: 0, targetOutput: 11,
    prompt: "The input goes through g (double it), and g's output goes into f (add 3). Find the input that comes out as 11.",
    successFeedback: "4 \u2192 8 \u2192 11. That middle number is the whole idea: g runs first and hands its output to f. Run them the other way round and 4 would give 14 instead \u2014 order changes the answer.",
    lowFeedback: "The final output is still under 11 \u2014 raise the input and watch both boxes move.",
    highFeedback: "Past 11 \u2014 ease the input back." } },
  "ft-04-03": { step: "i1", expect: "mcq", w: {
    // f(x) = x², g(x) = x + 1: f(g(x)) = (x+1)². At x = 3: 16.
    a: 1, b: 1, square: false, stage2: { a: 1, b: 0, square: true }, join: "compose",
    inputMin: 0, inputMax: 8, inputStep: 1, inputStart: 0, targetOutput: 16,
    prompt: "g adds 1, then f squares the result. Find the input that comes out as 16 \u2014 and watch which number gets squared.",
    successFeedback: "3 \u2192 4 \u2192 16. The squaring happens to (x + 1), not to x, which is why f(g(x)) is (x + 1)\u00b2 and not x\u00b2 + 1. The middle box is where you can see it.",
    lowFeedback: "Under 16 \u2014 raise the input.",
    highFeedback: "Over 16 \u2014 ease the input back." } },
};

const staged = []; let n = 0;
for (const [lesson, plan] of Object.entries(P)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const st = doc.steps.find((s) => s.id === plan.step);
  if (!st) throw new Error(`${lesson}: ${plan.step} missing`);
  if (st.widget?.type === "functionMachine") continue;
  const expect = plan.expect ?? "numeric";
  if (st.widget?.type !== expect) throw new Error(`${lesson}: expected ${expect}, found ${st.widget?.type}`);
  if (st.variant) throw new Error(`${lesson}: has a variant tag`);

  const widget = { type: "functionMachine", ...plan.w };
  const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
  if (errs.length) throw new Error(`${lesson}: ${errs.join("; ")}`);

  // Independent check: find the input reaching the target, and confirm it is unique.
  const hits = [];
  for (let x = widget.inputMin; x <= widget.inputMax; x += widget.inputStep)
    if (fmOutput(x, widget.a, widget.b, widget.square, widget.stage2, widget.join) === widget.targetOutput) hits.push(x);
  if (hits.length !== 1) throw new Error(`${lesson}: target reachable ${hits.length} ways (${hits.join(",")})`);
  console.log(`  ${lesson}: join=${widget.join} target ${widget.targetOutput} at input ${hits[0]} (unique)`);

  const bodyBefore = st.body, predictBefore = JSON.stringify(st.predict ?? null);
  st.widget = widget;
  if (st.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(st.predict ?? null) !== predictBefore) throw new Error(`${lesson}: predict changed`);
  staged.push([path, doc, lesson]); n++;
}
for (const [path, doc, lesson] of staged) { writeFileSync(path, JSON.stringify(doc, null, 2), "utf8"); console.log(`${lesson}: written`); }
console.log(`${n} lessons converted`);
