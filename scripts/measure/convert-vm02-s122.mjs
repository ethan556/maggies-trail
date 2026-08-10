#!/usr/bin/env node
// S122: vm-02 conversions. Same hard rules as convert-vm01-s121.mjs — derived answer must equal
// the FROZEN authored answer, non-widget surfaces byte-identical, variant steps untouched.
// vm-02-01 i1/i2 → dotPlot READ mode (count a stack on the actual fractional plot).
// vm-02-02 i1   → numberLineHop rational hops (three hops of 1/2 land on 3/2) — an existing
//                 Tier-A engine; zero engine work, exactly the S119 denom channel.
import { readFileSync, writeFileSync } from "node:fs";

const dir = "content/courses/volume-measurement/lessons";
// The authored ribbon plot, shared by both vm-02-01 steps: 1/4→2, 1/2→3, 3/4→1, 1→2 (denom 4).
const PLOT = { values: [1, 2, 3, 4], denominator: 4, given: [2, 3, 1, 2] };

const PLAN = {
  "vm-02-01": {
    i1: {
      kind: "dotPlotRead",
      askIndex: 1, // 1/2
      prompt: "How many ribbons measured 1/2 foot? Tap each X you count — the readout keeps score.",
      successFeedback: "3 — you counted every X above 1/2 and nothing outside the stack. The stack IS the count.",
      partialFeedback: "Count only the stack above 1/2: every X in it, and no X from another stack.",
      predict: {
        prompt: "On the ribbon plot, the stack above 1/2 is the tallest. The tallest stack means…",
        options: [
          { id: "most", label: "the most ribbons had that length" },
          { id: "longest", label: "the ribbons at 1/2 are the longest ones" },
          { id: "biggest", label: "1/2 is the biggest measurement taken" }
        ],
        outcomeId: "most",
        reveal: "Height on a line plot counts ribbons; it says nothing about which length is bigger — that lives on the number line underneath. The tallest stack is the most COMMON length, not the longest."
      }
    },
    i2: {
      kind: "dotPlotRead",
      askIndex: 0, // 1/4
      prompt: "Now the shortest length: how many ribbons measured 1/4 foot? Tap the X's you count.",
      successFeedback: "2 — same move, different stack. Any question that starts \u201chow many measured\u2026\u201d is a stack count.",
      partialFeedback: "The question asks about the stack above 1/4 — count all of it and nothing else."
    }
  },
  "vm-02-02": {
    i1: {
      kind: "hop",
      spec: {
        type: "numberLineHop",
        prompt: "Three ribbons, each 1/2 foot, laid end to end. Hop 1/2 at a time and tap where the third ribbon ends.",
        min: 0,
        max: 6,
        start: 0,
        hop: 1,
        hops: 3,
        direction: "forward",
        denom: 2,
        commonLandings: [
          { value: 1, feedback: "1/2 is one ribbon. Three of them: 3 \u00d7 1/2 = 1 1/2 ft." },
          { value: 5, feedback: "That's too many halves. 3 \u00d7 1/2 = 3/2 = 1 1/2 ft." }
        ],
        missFeedback: "Each ribbon adds one hop of 1/2. Three hops from 0 land on 3/2 = 1 1/2 ft.",
        successFeedback: "1 1/2 ft — three hops of 1/2 land on 3/2. Multiplying a fraction by a whole number is repeated hopping."
      },
      frozenValue: 3 / 2,
      landingValue: (s) => (s.start + s.hop * s.hops) / s.denom,
      predict: {
        prompt: "Three halves laid end to end: where does the last one stop?",
        options: [
          { id: "between", label: "between 1 and 2 — past one whole, short of two" },
          { id: "three", label: "at 3 — three ribbons, three marks" },
          { id: "under", label: "before 1 — halves are less than one" }
        ],
        outcomeId: "between",
        reveal: "Two halves already make a whole, so the third half lands past 1 — at 1 1/2. \u201cAt 3\u201d counts ribbons instead of length; \u201cbefore 1\u201d forgets the halves accumulate."
      }
    }
  }
};

let converted = 0;
for (const [lid, steps] of Object.entries(PLAN)) {
  const path = `${dir}/${lid}.json`;
  const before = JSON.parse(readFileSync(path, "utf8"));
  const after = JSON.parse(readFileSync(path, "utf8"));
  for (const [sid, plan] of Object.entries(steps)) {
    const sB = before.steps.find((s) => s.id === sid);
    const sA = after.steps.find((s) => s.id === sid);
    if (!sB || !sA) throw new Error(`${lid}/${sid}: not found`);
    if (sB.variant || sB.widget?.variant) throw new Error(`${lid}/${sid}: carries a variant — ABORT`);
    if (plan.kind === "dotPlotRead") {
      if (sB.widget?.type !== "numeric") throw new Error(`${lid}/${sid}: expected numeric`);
      const frozen = sB.widget.answer;
      const derived = PLOT.given[plan.askIndex];
      if (derived !== frozen) throw new Error(`${lid}/${sid}: derived ${derived} ≠ frozen ${frozen} — ABORT`);
      sA.widget = {
        type: "dotPlot",
        prompt: plan.prompt,
        values: PLOT.values,
        denominator: PLOT.denominator,
        given: PLOT.given,
        target: PLOT.given,
        askIndex: plan.askIndex,
        maxPerValue: 6,
        successFeedback: plan.successFeedback,
        partialFeedback: plan.partialFeedback
      };
    } else {
      if (sB.widget?.type !== "fractionEntry") throw new Error(`${lid}/${sid}: expected fractionEntry`);
      const w = sB.widget;
      const frozen = w.answerWhole + w.answerNum / w.answerDen;
      const derived = plan.landingValue(plan.spec);
      if (Math.abs(derived - frozen) > 1e-9) throw new Error(`${lid}/${sid}: derived ${derived} ≠ frozen ${frozen} — ABORT`);
      if (Math.abs(derived - plan.frozenValue) > 1e-9) throw new Error(`${lid}/${sid}: plan self-check failed — ABORT`);
      sA.widget = plan.spec;
    }
    if (plan.predict) {
      if (sB.predict) throw new Error(`${lid}/${sid}: predict exists — ABORT`);
      sA.predict = plan.predict;
    }
    converted++;
  }
  for (let i = 0; i < before.steps.length; i++) {
    const b = { ...before.steps[i] }, a = { ...after.steps[i] };
    delete b.widget; delete a.widget; delete b.predict; delete a.predict;
    if (JSON.stringify(b) !== JSON.stringify(a)) throw new Error(`${lid}/${before.steps[i].id}: frozen surface changed — ABORT`);
  }
  writeFileSync(path, JSON.stringify(after, null, 1) + "\n");
  console.log(`${lid}: written`);
}
console.log(`converted ${converted} steps`);
