// Conversion Playbook Block 6 — the engine's own lesson.
//
// re-04-02/i1 already ran `radicalCheck`, which the playbook describes exactly: it "verifies
// candidates" (drag through them, watch one fail substitution) but "nothing SHOWS why squaring
// invents them". Its authored prose describes the two curves; `extraneousRootLab` puts them on
// screen with the cause attached. That upgrade — from checking an answer to watching the phantom
// be born — is the whole reason the block exists.
//
// The step's own numbers map onto the engine unchanged: sqrt(x + 2) = x squares to x^2 = x + 2,
// whose roots are 2 and -1. Verified before authoring by direct substitution into the ORIGINAL:
// sqrt(4) = 2 holds; at x = -1 the radical gives sqrt(1) = +1, which is not -1, so -1 is the
// phantom. The integrity gate re-derives both independently and refuses a mismatch.
//
// The authored `predict` is preserved byte-for-byte — the script asserts it and aborts otherwise.
// It already asks the right question ("watch squaring invent a root"); what it lacked was
// something that shows the invention happening.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/radical-functions/lessons";

const PLAN = {
  "re-04-02": {
    step: "i1",
    expect: "radicalCheck",
    widget: {
      type: "extraneousRootLab",
      prompt:
        "\u221a(x + 2) = x. Square both sides, then find the candidate that squaring invented \u2014 the one that was never a solution.",
      radical: { c: 2, scale: 1 },
      line: { m: 1, b: 0 },
      probeStart: -1,
      targetPhase: "identifyPhantom",
      trueRoot: 2,
      phantomRoot: -1,
      requiredMoves: 2,
      successFeedback:
        "x = \u22121 is the phantom. Watch what squaring did: the line y = x runs BELOW the axis to the left of zero, where it could never equal a square root \u2014 and squaring reflected that stretch upward, straight onto the curve. The crossing at \u22121 is that reflection, not a solution. At x = \u22121 the radical is \u221a1 = +1, and +1 is not \u22121.",
      phantomPickedFeedback:
        "x = 2 is the genuine one: \u221a4 = 2, both sides agree. The question asks for the candidate that only APPEARS after squaring.",
      notSquaredFeedback:
        "Square both sides first. Before you do, there is only one crossing on screen \u2014 the phantom does not exist yet, and watching it arrive is the point of the step.",
      signRegionFeedback:
        "The line is below the axis here, so it cannot equal \u221a(x + 2), which is never negative. Squaring destroys that objection by flipping this stretch upward.",
      domainConfusionFeedback:
        "That is neither candidate. Squaring produced exactly two crossings \u2014 \u22121 and 2 \u2014 and the judgement is between those.",
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

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${lesson}: integrity — ${errs.join("; ")}`);

  const bodyBefore = step.body;
  const predictBefore = JSON.stringify(step.predict ?? null);
  step.widget = plan.widget;
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(step.predict ?? null) !== predictBefore)
    throw new Error(`${lesson}: authored predict changed — aborting`);
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (authored predict preserved)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
