// S119 — the fn-03 geometric-sequence trio onto sequenceBuild's new geometricTerm mode.
// All nine steps share one reframing: "find the ratio" and "find the nth term" are the SAME task
// here, since atPosition=2 collapses the formula to first*r. Every target is independently
// recomputed via geometricTerm before writing, and the integrity gate re-derives reachability and
// uniqueness on its own.
import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, geometricTerm } = await import("../../src/lib/schema.ts");

const DIR = "content/courses/functions-and-sequences/lessons";
const P = {
  "fn-03-01": { first: 2, rMax: 9, steps: {
    i1: { atPosition: 2, target: 6, asksRatio: true, predict: {
      prompt: "2, 6, 18, 54: each term is the last one times something FIXED. What is that multiplier?",
      options: [{ id: "3", label: "3" }, { id: "4", label: "4" }, { id: "add4", label: "It isn't a multiplier \u2014 each term adds 4" }],
      outcomeId: "3", reveal: "6/2=3, 18/6=3, 54/18=3 \u2014 the SAME ratio every time. That constant multiplier is what makes it geometric rather than arithmetic." },
      w: { prompt: "Drag the ratio until term 2 matches the sequence's own second term, 6.",
        successFeedback: "r = 3. Dragging to make 2\u00d7r land on 6 finds the ratio directly \u2014 the whole sequence is just first\u00d7r, first\u00d7r\u00b2, first\u00d7r\u00b3, ... from there.",
        lowFeedback: "Term 2 is still under 6 \u2014 raise the ratio.", highFeedback: "Term 2 has passed 6 \u2014 ease the ratio back." } },
    i2: { atPosition: 5, target: 162,
      w: { prompt: "Drag the ratio to 3, then read off term 5 \u2014 the next term after 54.",
        successFeedback: "162. Term 5 is 2\u00d73\u2074, and the bars show WHY it grows so fast: each step multiplies rather than adds.",
        lowFeedback: "Term 5 is still under 162.", highFeedback: "Term 5 has passed 162." } },
    i3: { first: 1, atPosition: 5, target: 256,
      w: { prompt: "For 1, 4, 16, 64, ..., drag the ratio and read term 5 \u2014 the next term.",
        successFeedback: "256. r = 4 here, so term 5 is 1\u00d74\u2074.",
        lowFeedback: "Term 5 is still under 256.", highFeedback: "Term 5 has passed 256." } } } },
  "fn-03-02": { first: 2, rMax: 9, steps: {
    i1: { atPosition: 4, target: 54, predict: {
      prompt: "a\u2081 = 2, r = 3. Before dragging \u2014 will term 4 be closer to 2\u00d73 or 2\u00d73\u00b3?",
      options: [{ id: "cube", label: "2\u00d73\u00b3, since term 4 has THREE multiplications behind it" }, { id: "single", label: "2\u00d73, one multiplication" }, { id: "quad", label: "2\u00d73\u2074" }],
      outcomeId: "cube", reveal: "Term 1 has zero multiplications; term 4 has three (1\u21922, 2\u21923, 3\u21924). a\u2099=a\u2081\u00b7r^(n\u22121) counts the GAPS between terms, not the term number itself." },
      w: { prompt: "a\u2081 = 2, r = 3. Drag the ratio to 3 and confirm term 4.",
        successFeedback: "54 = 2\u00d73\u00b3. Three multiplications from term 1 to term 4 \u2014 the exponent is n\u22121, not n.",
        lowFeedback: "Term 4 is still under 54.", highFeedback: "Term 4 has passed 54." } },
    i2: { first: 1, atPosition: 3, target: 16,
      w: { prompt: "a\u2081 = 1, r = 4. Drag the ratio to 4 and confirm term 3.",
        successFeedback: "16 = 1\u00d74\u00b2.", lowFeedback: "Term 3 is still under 16.", highFeedback: "Term 3 has passed 16." } },
    i3: { first: 5, atPosition: 5, target: 80,
      w: { prompt: "a\u2081 = 5, r = 2. Drag the ratio to 2 and confirm term 5.",
        successFeedback: "80 = 5\u00d72\u2074.", lowFeedback: "Term 5 is still under 80.", highFeedback: "Term 5 has passed 80." } } } },
  "fn-03-03": { first: 3, rMax: 9, steps: {
    i1: { atPosition: 5, target: 48, predict: {
      prompt: "3, 6, 12, 24, ... Before dragging \u2014 what ratio connects consecutive terms?",
      options: [{ id: "2", label: "2" }, { id: "3", label: "3" }, { id: "diff", label: "It isn't constant" }],
      outcomeId: "2", reveal: "6/3=2, 12/6=2, 24/12=2 \u2014 constant. Reading a rule from a sequence starts with confirming the ratio holds EVERYWHERE, not just once." },
      w: { prompt: "Drag the ratio to match 3, 6, 12, 24, then read term 5.",
        successFeedback: "48 = 3\u00d72\u2074.", lowFeedback: "Term 5 is still under 48.", highFeedback: "Term 5 has passed 48." } },
    i2: { first: 1, atPosition: 5, target: 256,
      w: { prompt: "For 1, 4, 16, 64, ..., drag the ratio and read term 5.",
        successFeedback: "256 = 1\u00d74\u2074.", lowFeedback: "Term 5 is still under 256.", highFeedback: "Term 5 has passed 256." } },
    i3: { first: 5, atPosition: 6, target: 160,
      w: { prompt: "For 5, 10, 20, 40, ..., drag the ratio and read term 6.",
        successFeedback: "160 = 5\u00d72\u2075.", lowFeedback: "Term 6 is still under 160.", highFeedback: "Term 6 has passed 160." } } } },
};

let n = 0;
for (const [lesson, plan] of Object.entries(P)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  let touched = false;
  for (const [sid, step] of Object.entries(plan.steps)) {
    const st = doc.steps.find((s) => s.id === sid);
    if (!st) throw new Error(`${lesson}: ${sid} missing`);
    if (st.widget?.type === "sequenceBuild") continue;
    if (st.widget?.type !== "numeric") throw new Error(`${lesson}/${sid}: expected numeric, found ${st.widget?.type}`);
    if (st.variant) throw new Error(`${lesson}/${sid}: has a variant tag`);
    const authored = st.widget.answer;

    const first = step.first ?? plan.first;
    const widget = { type: "sequenceBuild", mode: "geometricTerm", first, atPosition: step.atPosition,
      targetTerm: step.target, rMax: plan.rMax, start: 2, ...step.w };
    const errs = widgetIntegrityErrors(WidgetSpec.parse(widget));
    if (errs.length) throw new Error(`${lesson}/${sid}: ${errs.join("; ")}`);

    const r = [...Array(plan.rMax - 1)].map((_, i) => i + 2).find((rr) => geometricTerm(first, rr, step.atPosition) === step.target);
    if (r === undefined) throw new Error(`${lesson}/${sid}: no ratio in range reaches target ${step.target}`);
    const derived = geometricTerm(first, r, step.atPosition);
    // Two DIFFERENT quantities can be the "authored answer" depending on what the original
    // question asked: most steps ask for a TERM value (compare against `derived`); exactly one
    // (fn-03-01/i1) asks for the RATIO itself (compare against `r`) -- conflating the two would
    // silently pass a wrong conversion, since 6 (the term) and 3 (the ratio) are both plausible-
    // looking small integers.
    const compareTo = step.asksRatio ? r : derived;
    if (compareTo !== authored) throw new Error(`${lesson}/${sid}: ${step.asksRatio ? "ratio" : "term"} ${compareTo} != authored ${authored}`);
    console.log(`  ${lesson}/${sid}: first=${first} r=${r} atPosition=${step.atPosition} -> term=${derived}${step.asksRatio ? " (question asks for r itself)" : ""} (matches authored ${authored})`);

    const bodyBefore = st.body, predictBefore = JSON.stringify(st.predict ?? null);
    const rebuilt = {};
    for (const k of Object.keys(st)) {
      if (k === "widget") { if (step.predict) rebuilt.predict = step.predict; rebuilt.widget = widget; continue; }
      rebuilt[k] = st[k];
    }
    if (rebuilt.body !== bodyBefore) throw new Error(`${lesson}/${sid}: body changed`);
    if (!step.predict && JSON.stringify(rebuilt.predict ?? null) !== predictBefore) throw new Error(`${lesson}/${sid}: predict changed unexpectedly`);
    doc.steps[doc.steps.findIndex((s) => s.id === sid)] = rebuilt;
    touched = true; n++;
  }
  if (touched) writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
}
console.log(`${n} steps converted`);
