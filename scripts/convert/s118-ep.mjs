// S118 — the ep- binomial-product cluster onto `binomialAreaLab`.
//
// The KNOWN_ISSUES entry claimed seven Tier-D ep- lessons needed a 2D tile engine. Measured
// against the lessons themselves, that is too broad: ep-01-01/02/03 are exponent RULES
// (2^3 · 2^4, (2^4)^2, 5^0) and ep-02-01 is degree and like terms. None of those is a product of
// two linear factors, and a rectangle would not represent them. Exactly three lessons are
// binomial-product lessons, and those three are converted here. The entry is corrected.
//
// Every authored `predict` is preserved byte-for-byte -- and each already asks precisely what the
// lab shows ("where does the x-term come from? Both crossings: x*3 and 2*x, giving 5x"), which is
// the playbook's own diagnosis: the prose was written for a manipulation the widget never
// delivered.
//
// Arithmetic verified before authoring, by hand and then again in the engine suite:
//   (3x)(x + 4)   = 3x^2 + 12x        -- pX 3, qX 1, a 0, b 4; asks the x^2 coefficient, 3
//   (x + 2)(x + 3)= x^2 + 5x + 6      -- middle 5 = 2 + 3, product 6: distinguishable
//   (x + 4)(x + 4)= x^2 + 8x + 16     -- middle 8, product 16: distinguishable
// The integrity gate independently refuses any authoring where the sum and the product coincide
// (it would make the add-vs-multiply misconception unreachable), so a bad case cannot ship.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/exponents-polynomials/lessons";

const PLAN = {
  "ep-03-01": {
    step: "i1",
    expect: "numeric",
    widget: {
      type: "binomialAreaLab",
      prompt:
        "Lay out (3x)(x + 4) as a rectangle: 3x across, and drag the down partition until the side reads x + 4.",
      pX: 3,
      qX: 1,
      targetA: 0,
      targetB: 4,
      startA: 2,
      startB: 0,
      asks: "x2",
      requiredMoves: 3,
      successFeedback:
        "3x\u00b2 + 12x. The block is three x-by-x squares wide, so the x\u00b2 coefficient is 3 \u2014 and it never moved while you dragged, because neither partition touches that block. The 12x is the strip: 3x tall by 4 across. Two regions, two terms, exactly as you predicted.",
      productMiddleFeedback:
        "That layout puts the wrong strip beside the block. The monomial has no constant of its own \u2014 push the across partition to 0 and watch the second column vanish.",
      partialFeedback:
        "One side is right and the other is not. The monomial side is bare 3x, so its partition sits at 0; the binomial side carries the 4.",
      signFeedback:
        "Right sizes, wrong direction. A negative partition is drawn outside the block, as area taken away \u2014 but (x + 4) adds its 4.",
    },
  },
  "ep-03-02": {
    step: "i1",
    expect: "numeric",
    widget: {
      type: "binomialAreaLab",
      prompt:
        "Lay out (x + 2)(x + 3) as a rectangle. Drag each partition, then read the middle coefficient off the two strips.",
      pX: 1,
      qX: 1,
      targetA: 2,
      targetB: 3,
      startA: 0,
      startB: 0,
      asks: "middle",
      requiredMoves: 3,
      successFeedback:
        "x\u00b2 + 5x + 6. The 5 is 2 + 3, not 2 \u00d7 3 \u2014 and the rectangle shows why: the two strips each have one side of length x, so they lie alongside each other and their x-counts add. The 6 is the corner, the one place where the two constants genuinely do multiply.",
      productMiddleFeedback:
        "That layout makes the middle coefficient 6 \u2014 which is 2 \u00d7 3, the CORNER's area, not the strips'. The corner is the only region where the constants multiply; the strips add.",
      partialFeedback:
        "One partition is placed correctly and the other is not. Move the remaining one and watch only its own strip resize \u2014 the other holds still, which is why the middle term is a sum of two independent pieces.",
      signFeedback:
        "Right sizes, wrong direction. Both constants here are added, so both strips sit outside the block in the positive direction.",
    },
  },
  "ep-03-03": {
    step: "i1",
    expect: "numeric",
    widget: {
      type: "binomialAreaLab",
      prompt:
        "Lay out (x + 4)(x + 4) as a rectangle. Drag both partitions to 4, then look at what sits between the two squares.",
      pX: 1,
      qX: 1,
      targetA: 4,
      targetB: 4,
      startA: 1,
      startB: 0,
      asks: "middle",
      requiredMoves: 3,
      successFeedback:
        "x\u00b2 + 8x + 16 \u2014 not x\u00b2 + 16. The two squares you expected are there (the x-block and the 16 corner), but they do not touch: two strips of 4x each sit between them, and 4 + 4 = 8. Squaring a binomial cannot skip the middle, because the rectangle has four regions and only two of them are squares.",
      productMiddleFeedback:
        "That layout makes the middle 16, which is 4 \u00d7 4 \u2014 the corner. The corner is one region; the two strips are two others, and they add to 8.",
      partialFeedback:
        "One partition is at 4 and the other is not. Bring them level and watch the two strips become the same size \u2014 which is what makes this a perfect square.",
      signFeedback:
        "Right sizes, wrong direction. (x + 4) adds its 4, so both strips lie outside the block rather than being taken away.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors, binomialExpand } = await import("../../src/lib/schema.ts");

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

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
  if (errs.length) throw new Error(`${lesson}: integrity \u2014 ${errs.join("; ")}`);

  const t = binomialExpand(plan.widget.pX, plan.widget.targetA, plan.widget.qX, plan.widget.targetB);
  console.log(
    `  ${lesson}: (${plan.widget.pX}x + ${plan.widget.targetA})(${plan.widget.qX}x + ${plan.widget.targetB}) = ` +
      `${t.x2}x^2 + ${t.middle}x + ${t.constant}  [asks ${plan.widget.asks}]`
  );

  const bodyBefore = step.body;
  const predictBefore = JSON.stringify(step.predict ?? null);
  step.widget = plan.widget;
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed`);
  if (JSON.stringify(step.predict ?? null) !== predictBefore)
    throw new Error(`${lesson}: authored predict changed \u2014 aborting`);
  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> binomialAreaLab (authored predict preserved)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
