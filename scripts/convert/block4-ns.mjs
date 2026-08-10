// Conversion Playbook Block 4 (G6 Number System) — first conversion.
//
// §5 names this course the highest-downstream-centrality block in the whole playbook, and
// `ns-03-02` is its lowest-scoring lesson (Tier D, 24). Its authored content is already the right
// story — "Multiples of 3: 3, 6, 9, 12, 15… Multiples of 5: 5, 10, 15, 20… what is the LCM?" — but
// told as two lists to read. `numberLineHop` turns it into the thing the lists are evidence FOR:
// hop by 3 and stop where a 5-hopper would also land. The LCM stops being a definition to recall
// and becomes the first coincidence you can watch happen.
//
// A CONSTRAINT THE PLAYBOOK DID NOT ACCOUNT FOR. §5 also proposes `numberLineHop` for `ns-01-01`
// with `hop: 1/3`. The schema requires INTEGER `min`, `max`, `start` and `hop` — a fractional hop
// is not representable. `ns-01-01` is 2 ÷ 1/5, and the only way to force it onto this engine is to
// relabel the line so its units are fifths, which would show a 0–10 integer line for a question
// posed on 0–2. That misrepresents the mathematics rather than revealing it, so `ns-01-01` is NOT
// converted here; `fractionBar` is the honest candidate and is left for a measured pass rather
// than assumed to fit. Recorded in the ledger.
//
// `ns-03-01` (GCF) is likewise deferred: the greatest COMMON factor is a property of two hop
// SIZES, not of one landing, and this engine grades a single landing. A dual-track hopper would
// fit; a single-track one would have to grade "12" while the actual answer is the hop size 4.
//
// Only i1 is touched. It carries no `variant` tag (checked, and the script refuses otherwise) and
// already owns an authored `predict` — this is precisely the "prediction stapled to a static step"
// the tier formula demotes, and that predict now finally has an observable outcome. The authored
// predict is preserved exactly as written; no prose is changed.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/number-system/lessons";

const PLAN = {
  "ns-03-02": {
    step: "i1",
    expect: "numeric",
    widget: {
      type: "numberLineHop",
      prompt: "Hop by 3 from 0. Stop at the first place a 5-hopper would also land.",
      min: 0,
      max: 20,
      start: 0,
      hop: 3,
      hops: 5,
      direction: "forward",
      commonLandings: [
        {
          value: 8,
          feedback:
            "8 is 3 + 5. Adding the two numbers is a different question from asking where their hops agree \u2014 the hoppers never both stop at 8.",
        },
        {
          value: 12,
          feedback:
            "12 is a landing for the 3-hopper, but the 5-hopper skips it: 5 goes 5, 10, 15. A shared landing has to appear on BOTH lists.",
        },
        {
          value: 10,
          feedback:
            "10 is a landing for the 5-hopper, but the 3-hopper skips it: 3 goes 3, 6, 9, 12, 15. A shared landing has to appear on BOTH lists.",
        },
      ],
      missFeedback:
        "Not a shared landing yet. Keep hopping by 3 and check each stop against the 5-hopper's stops: 5, 10, 15.",
      successFeedback:
        "15 \u2014 the first place both hoppers stop. That is what \"least common multiple\" means: not the smallest multiple of either, but the earliest landing they share. 30 and 45 are shared too; 15 is simply the first.",
    },
  },
};

// ---- validate everything BEFORE writing anything ------------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);

  if (step.widget?.type === plan.widget.type) {
    skipped.push(lesson);
    continue;
  }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.variant)
    throw new Error(`${lesson}/${plan.step}: carries a variant tag — converting would break its surface contract`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
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
