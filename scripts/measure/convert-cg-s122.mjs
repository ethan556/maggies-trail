#!/usr/bin/env node
// S122: coordinate-geometry cluster. Same hard rules as convert-vm01/vm02 — the engine's graded
// value must equal the FROZEN authored answer, non-widget surfaces byte-identical, variant-
// carrying steps never touched. Every built spec is parsed by the real zod schema AND run
// through widgetIntegrityErrors BEFORE any file is written; any failure aborts the whole run.
//
// Zero engine work: all three targets are existing A-tier engines.
//   cg-02-01 i1 → numberLineHop  (start 0, four hops of 2 → 8: the rule IS repeated addition)
//   cg-02-01 i2 → ratioTable     (the two rules ARE the two columns; B = 2·A is the table's shape)
//   cg-04-01 i1 → shapeFamilyBuilder (build from the stated attributes; the name is earned)
import { readFileSync, writeFileSync } from "node:fs";
import { WidgetSpec, widgetIntegrityErrors } from "../../src/lib/schema.ts";

const dir = "content/courses/coordinate-geometry/lessons";

const PLAN = {
  "cg-02-01": {
    i1: {
      answer: 8,
      widget: {
        type: "numberLineHop",
        prompt: "Rule A: start at 0, add 2. Take the hops the rule describes — where does the next one land?",
        min: 0, max: 20, start: 0, hop: 2, hops: 4, direction: "forward",
        commonLandings: [
          { value: 6, feedback: "6 is where the pattern already stopped — 0, 2, 4, 6 is three hops. The question asks for the hop AFTER that one." },
          { value: 10, feedback: "10 is one hop too far: that would be a fifth hop past the end of the shown pattern. 0, 2, 4, 6 uses three hops, so the next landing is the fourth." }
        ],
        missFeedback: "Each hop is the rule's \u201cadd 2\u201d made visible. Start at 0 and take four of them.",
        successFeedback: "8. Every hop is the same size, which is what \u201cadd 2 each time\u201d means \u2014 the rule is the hop."
      },
      predict: {
        prompt: "Rule A adds 2 each time and rule B adds 4. Both start at 0. After the same number of steps, rule B's number will be…",
        options: [
          { id: "double", label: "exactly double rule A's" },
          { id: "plus2", label: "2 more than rule A's" },
          { id: "depends", label: "it depends how many steps you take" }
        ],
        outcomeId: "double",
        reveal: "Every one of B's hops is twice the size of A's, so after the same number of hops B has covered twice the distance \u2014 at every single step, not just at the end."
      }
    },
    i2: {
      answer: 12,
      widget: {
        type: "ratioTable",
        prompt: "A's rule and B's rule run side by side. Fill in the B-number that pairs with A's 6.",
        colA: "Rule A", colB: "Rule B",
        rows: [[2, 4], [4, 8]],
        askA: 6, targetB: 12,
        bMax: 20, bStep: 2, bStart: 0,
        successFeedback: "12. Pairing the terms that happen at the same step turns two separate rules into one relationship: B is always double A.",
        lowFeedback: "Too low. Look down the table: 2 pairs with 4 and 4 pairs with 8 \u2014 each B is double its A, so 6 pairs with more than 8.",
        highFeedback: "Too high. The pattern is doubling, not tripling: 2\u21924 and 4\u21928, so 6 pairs with 12, not further along B's list."
      }
    }
  },
  "cg-04-01": {
    i1: {
      answerLabel: "Rectangle",
      widget: {
        type: "shapeFamilyBuilder",
        prompt: "Build the shape the clues describe: 4 sides, two pairs of parallel sides, 4 right angles \u2014 and its sides are NOT all equal. What family does it land in?",
        targetName: "rectangle",
        targetSides: 4, targetRightAngles: 4, targetEqualSides: 0, targetParallelPairs: 2,
        startSides: 3,
        successFeedback: "Rectangle. Every clue had to be satisfied at once \u2014 that is what \u201cmost specific name\u201d means.",
        sidesFeedback: "Start with the side count: the clues say 4 sides, so this family sits among the quadrilaterals.",
        attributesFeedback: "Not there yet. With 4 sides and two pairs of parallel sides but no right angles you have a PARALLELOGRAM \u2014 more general than the clues allow. Add the four right angles. And if you make all four sides equal you have gone too far the other way, to a SQUARE, which the clue \u201cnot all equal\u201d rules out."
      },
      predict: {
        prompt: "You are about to add \u201c4 right angles\u201d to a shape that already has 4 sides and two pairs of parallel sides. That will make the family name…",
        options: [
          { id: "narrower", label: "more specific — fewer shapes qualify" },
          { id: "wider", label: "more general — more shapes qualify" },
          { id: "same", label: "unchanged — right angles don't affect the family" }
        ],
        outcomeId: "narrower",
        reveal: "Each attribute you require rules shapes OUT. A parallelogram becomes a rectangle exactly when the right angles are added \u2014 the family gets smaller as the description gets longer."
      }
    }
  }
};

// ---- build + validate everything BEFORE writing anything -------------------
const pending = [];
for (const [lid, steps] of Object.entries(PLAN)) {
  const path = `${dir}/${lid}.json`;
  const before = JSON.parse(readFileSync(path, "utf8"));
  const after = JSON.parse(readFileSync(path, "utf8"));
  for (const [sid, plan] of Object.entries(steps)) {
    const sB = before.steps.find((s) => s.id === sid);
    const sA = after.steps.find((s) => s.id === sid);
    if (!sB || !sA) throw new Error(`${lid}/${sid}: step not found`);
    if (sB.variant || sB.widget?.variant) throw new Error(`${lid}/${sid}: carries a variant — must not be touched`);

    // frozen-answer assertion, per source widget kind
    if (plan.answer !== undefined) {
      if (sB.widget?.type !== "numeric") throw new Error(`${lid}/${sid}: expected numeric, got ${sB.widget?.type}`);
      if (sB.widget.answer !== plan.answer)
        throw new Error(`${lid}/${sid}: plan answer ${plan.answer} ≠ frozen ${sB.widget.answer} — ABORT`);
      const w = plan.widget;
      const derived =
        w.type === "numberLineHop"
          ? w.start + (w.direction === "back" ? -1 : 1) * w.hop * w.hops
          : w.type === "ratioTable"
            ? w.targetB
            : NaN;
      if (Math.abs(derived - plan.answer) > 1e-9)
        throw new Error(`${lid}/${sid}: engine derives ${derived}, frozen answer is ${plan.answer} — ABORT`);
    } else if (plan.answerLabel !== undefined) {
      if (sB.widget?.type !== "mcq") throw new Error(`${lid}/${sid}: expected mcq, got ${sB.widget?.type}`);
      const correct = sB.widget.options.find((o) => o.correct)?.label;
      if (correct !== plan.answerLabel)
        throw new Error(`${lid}/${sid}: plan label "${plan.answerLabel}" ≠ frozen "${correct}" — ABORT`);
      if (plan.widget.targetName !== plan.answerLabel.toLowerCase())
        throw new Error(`${lid}/${sid}: targetName ${plan.widget.targetName} ≠ frozen answer — ABORT`);
    }

    // the real schema + the real integrity gate, before any write
    const parsed = WidgetSpec.parse(plan.widget);
    const errs = widgetIntegrityErrors(parsed);
    if (errs.length) throw new Error(`${lid}/${sid}: integrity gate — ${errs.join("; ")}`);

    sA.widget = parsed;
    if (plan.predict) {
      if (sB.predict) throw new Error(`${lid}/${sid}: already has a predict block`);
      sA.predict = plan.predict;
    }
  }
  // frozen surfaces: everything except widget/predict identical, step order and count intact
  if (before.steps.length !== after.steps.length) throw new Error(`${lid}: step count changed`);
  for (let i = 0; i < before.steps.length; i++) {
    const b = { ...before.steps[i] }, a = { ...after.steps[i] };
    if (b.id !== a.id) throw new Error(`${lid}: step order changed`);
    delete b.widget; delete a.widget; delete b.predict; delete a.predict;
    if (JSON.stringify(b) !== JSON.stringify(a))
      throw new Error(`${lid}: step ${before.steps[i].id} frozen surface changed — ABORT`);
  }
  pending.push([path, after]);
}
for (const [path, doc] of pending) {
  writeFileSync(path, JSON.stringify(doc, null, 1) + "\n");
  console.log(`${path.split("/").pop()}: written`);
}
console.log("all specs validated before write; 3 steps converted, 2 predictions added");
