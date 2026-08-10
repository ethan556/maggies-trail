#!/usr/bin/env node
// S125: mmt-05-01 "Reading a Picture Graph" and mmt-05-02 "Reading a Bar Graph" — two Grade 2
// lessons whose entire skill is getting a value off a drawn display, in which the display was
// never drawn. A 7-year-old was reading a sentence about a graph and typing a number.
//
// Same hard rules as every conversion since S121, asserted before any write:
//   1. graphRead's independently derived value must equal the FROZEN authored answer.
//   2. body / hints / explanationVariants / conceptTag / ids / order byte-identical.
//   3. Steps carrying a `variant` key are never touched.
//
// Only the non-variant interactive steps convert (i1/i2/i3 in each). The k*/ch1 steps are
// variant-bearing and belong to the resolver.
import { readFileSync, writeFileSync } from "node:fs";
import { graphReadAnswer } from "../../src/lib/schema.ts";

const DIR = "content/courses/measure-money-time/lessons";

const PLAN = {
  "mmt-05-01": {
    mode: "picture",
    unitNoun: "vote",
    unitNounPlural: "votes",
    icon: "🍎",
    scaleMax: 12,
    steps: {
      i1: { drawn: 4, categoryLabel: "Monday" },
      i2: { drawn: 2, categoryLabel: "Wednesday" },
      i3: { drawn: 9, categoryLabel: "Thursday" }
    },
    prompt: (c) => `The picture graph shows ${c}. Each picture is one vote. Tap how many votes that is.`,
    fallback: (n) => `Count the pictures one at a time — there are ${n}, and each one is a single vote, so that is ${n} votes.`,
    success: (n, c) =>
      `${n} votes for ${c} — one picture, one vote, counted straight across. The pictures ARE the count; nothing has to be worked out.`
  },
  "mmt-05-02": {
    mode: "bar",
    unitNoun: "vote",
    unitNounPlural: "votes",
    scaleMax: 12,
    steps: {
      i1: { drawn: 6, categoryLabel: "This bar" },
      i2: { drawn: 9, categoryLabel: "This bar" },
      i3: { drawn: 1, categoryLabel: "This bar" }
    },
    prompt: () => "Follow the top of the bar across to the scale. Tap the number it reaches.",
    fallback: (n) => `Slide your eye straight across from the top of the bar to the numbers beside it: it lands on ${n}.`,
    success: (n) =>
      `${n} — read straight across from the top of the bar. The bar's height IS the number; the gridlines just say which one.`
  }
};

let converted = 0;
for (const [lid, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lid}.json`;
  const before = JSON.parse(readFileSync(path, "utf8"));
  const after = JSON.parse(readFileSync(path, "utf8"));

  for (const [sid, st] of Object.entries(plan.steps)) {
    const sB = before.steps.find((s) => s.id === sid);
    const sA = after.steps.find((s) => s.id === sid);
    if (!sB) throw new Error(`${lid}/${sid}: step not found`);
    if (sB.variant || sB.widget?.variant) throw new Error(`${lid}/${sid}: carries a variant — must not be touched`);
    if (sB.widget?.type !== "numeric") throw new Error(`${lid}/${sid}: expected numeric, found ${sB.widget?.type}`);

    const spec = {
      type: "graphRead",
      mode: plan.mode,
      prompt: plan.prompt(st.categoryLabel),
      drawn: st.drawn,
      unitValue: 1,
      categoryLabel: st.categoryLabel,
      unitNoun: plan.unitNoun,
      unitNounPlural: plan.unitNounPlural,
      scaleMax: plan.scaleMax,
      ...(plan.icon ? { icon: plan.icon } : {}),
      commonResults: [],
      fallbackFeedback: plan.fallback(graphReadAnswer({ drawn: st.drawn, unitValue: 1 })),
      successFeedback: plan.success(graphReadAnswer({ drawn: st.drawn, unitValue: 1 }), st.categoryLabel)
    };

    const derived = graphReadAnswer(spec);
    if (derived !== sB.widget.answer)
      throw new Error(`${lid}/${sid}: derived ${derived} ≠ frozen authored answer ${sB.widget.answer} — ABORT`);

    sA.widget = spec;
    converted++;
  }

  if (before.steps.length !== after.steps.length) throw new Error(`${lid}: step count changed`);
  for (let i = 0; i < before.steps.length; i++) {
    const b = { ...before.steps[i] }, a = { ...after.steps[i] };
    delete b.widget; delete a.widget;
    if (JSON.stringify(b) !== JSON.stringify(a))
      throw new Error(`${lid}: step ${before.steps[i].id} frozen surface changed — ABORT`);
  }
  writeFileSync(path, JSON.stringify(after, null, 1) + "\n");
  console.log(`${lid}: written`);
}
console.log(`converted ${converted} steps`);
