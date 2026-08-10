// S117 Wave A — three conversions against engines already registered, each verified by
// independent arithmetic before authoring (recorded per lesson below and in CONVERSION_LOG.md).
//
// re-04-01: radicalCheck -> extraneousRootLab (identifyTrue). The step's own equation,
//   sqrt(x + 6) = x, squares to x^2 - x - 6 = 0 = (x - 3)(x + 2): candidates 3 and -2.
//   At -2 the line reads -2 while sqrt(4) = +2 -- the phantom, exactly the authored prose's
//   "pay the bill". identifyTrue asks the authored question verbatim: find the survivor.
//   This retires radicalCheck's last lesson usage (it remains registered + gallery-covered).
//
// cx-03-02: mcq -> quadDrag targeting the REACHABLE claim. S116's attempt targeted "a square"
//   and was correctly rejected by the solvability gate (no fourth point completes one). The
//   measured escape: target "a rhombus" -- reachable at (3, 4), all sides 5 -- and let the live
//   classifier's refusal to say "square" carry the lesson. Diagonals sqrt(80) vs sqrt(20),
//   verified: d((0,0),(8,4))^2 = 80, d((5,0),(3,4))^2 = 4 + 16 = 20.
//
// rf-02-01: mcq -> signChart with root/pole/hole. (x+5)/x * x/(x+1) reduces to (x+5)/(x+1)
//   with a hole at 0 (cancelled factor; reduced value there is 5, NOT zero, so the sign is
//   untouched -- the engine's hole contract). Signs verified against the real function:
//   x=-6: (-1)/(-5) > 0; x=-2: 3/(-1) < 0; x=1: 6/2 > 0 -- ["+","-","+"].
//   (rf-02-03 was measured and REJECTED: its divisor-zero exclusion at x = 3 is a
//   sign-changing zero of the reduced function, which neither the pole nor the hole channel
//   represents -- authoring it as a hole ships a false chart. Ledgered in KNOWN_ISSUES.)

import { readFileSync, writeFileSync } from "node:fs";

const PLAN = {
  "content/courses/radical-functions/lessons/re-04-01.json": {
    lesson: "re-04-01",
    step: "i1",
    expect: "radicalCheck",
    predict: {
      prompt:
        "Squaring \u221a(x + 6) = x will hand you two candidates. How many of them solve the ORIGINAL equation?",
      options: [
        { id: "both", label: "Both \u2014 squaring is reversible" },
        { id: "one", label: "Exactly one \u2014 squaring can invent an extra" },
        { id: "neither", label: "Neither \u2014 squaring wrecks the equation" },
      ],
      outcomeId: "one",
      reveal:
        "Squaring keeps every true solution and can add impostors wherever the line dipped below the axis. Here exactly one candidate survives the return trip \u2014 finding which one is the work ahead.",
    },
    widget: {
      type: "extraneousRootLab",
      prompt:
        "\u221a(x + 6) = x. Square both sides, then find the candidate that survives the original equation.",
      radical: { c: 6, scale: 1 },
      line: { m: 1, b: 0 },
      probeStart: -4,
      targetPhase: "identifyTrue",
      trueRoot: 3,
      phantomRoot: -2,
      requiredMoves: 2,
      successFeedback:
        "x = 3 survives: \u221a9 = 3, and both curves meet above the axis, where a square root can actually live. The other crossing, at \u22122, sits on the reflected stretch \u2014 the line was at \u22122 there, and \u221a4 = +2 never equals \u22122. Squaring created that meeting; the original never had it.",
      phantomPickedFeedback:
        "\u22122 satisfies only the SQUARED pair. Probe it on the original: the radical reads \u221a4 = +2 while the line reads \u22122 \u2014 they never met. That crossing was manufactured when squaring reflected the line's negative stretch upward.",
      notSquaredFeedback:
        "Square both sides first \u2014 the candidates are born from x\u00b2 = x + 6, and until the squaring happens the second crossing is not on screen to judge.",
      signRegionFeedback:
        "The line is negative on this stretch, and \u221a(x + 6) never is \u2014 nothing here can solve the original. Squaring flips this very stretch upward, and that reflection is where the false candidate will come from.",
      domainConfusionFeedback:
        "That x is neither candidate. Squaring gives x\u00b2 = x + 6, whose roots are exactly \u22122 and 3 \u2014 the survivor is one of those two.",
    },
  },
  "content/courses/coordinate-proofs/lessons/cx-03-02.json": {
    lesson: "cx-03-02",
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "All four sides of this shape will measure exactly 5. Is that enough to make it a SQUARE?",
      options: [
        { id: "yes", label: "Yes \u2014 four equal sides settle it" },
        { id: "check", label: "Not yet \u2014 the corners (or diagonals) still have to be checked" },
        { id: "never", label: "It can never be a square on a slanted grid" },
      ],
      outcomeId: "check",
      reveal:
        "Equal sides make a rhombus. Whether it is also a square is decided by one more check \u2014 right angles, or equivalently equal diagonals \u2014 and that check is exactly what the shape's own name will report.",
    },
    widget: {
      type: "quadDrag",
      prompt:
        "Three corners sit at (0, 0), (5, 0), (8, 4). Place S so all four sides are equal \u2014 then read what the shape calls itself.",
      fixed: [
        [0, 0],
        [5, 0],
        [8, 4],
      ],
      targetX: 3,
      targetY: 4,
      startX: 2,
      startY: 7,
      gridMax: 9,
      targetName: "a rhombus",
      successFeedback:
        "Four sides of 5 \u2014 and the name reads rhombus, not square. Run the deciding check: the diagonals measure \u221a80 and \u221a20. Unequal diagonals mean the corners are not right angles, so equal sides alone never promote a rhombus to a square.",
      sideFeedback:
        "Track the side lengths: from (8, 4), the fourth corner must sit a distance of 5 from both (8, 4) and (0, 0). Slide across until the two remaining sides match the first pair.",
      angleFeedback:
        "The across position is right \u2014 now the height. The fourth side closes back to (0, 0), and only one height makes both remaining sides equal 5.",
    },
  },
  "content/courses/rational-functions/lessons/rf-02-01.json": {
    lesson: "rf-02-01",
    step: "i1",
    expect: "mcq",
    predict: {
      prompt:
        "In (x + 5)/x \u00b7 x/(x + 1), the x's cancel. Does the ban on x = 0 cancel with them?",
      options: [
        { id: "gone", label: "Yes \u2014 once the factor is gone, so is its restriction" },
        { id: "stays", label: "The restriction survives \u2014 it was set by the ORIGINAL expression" },
        { id: "moves", label: "It moves to x = \u22121 and merges with that ban" },
      ],
      outcomeId: "stays",
      reveal:
        "Restrictions are set before any simplifying happens: the original expression divides by x, so x = 0 was never allowed. Cancelling rewrites the formula, not its history \u2014 the ban survives as a hole.",
    },
    widget: {
      type: "signChart",
      prompt:
        "Chart the product (x + 5)/x \u00b7 x/(x + 1) \u2014 reduced, (x + 5)/(x + 1). Mark each interval's sign; the cuts and the hole are the operation's full list of special x's.",
      roots: [{ x: -5, mult: 1 }],
      poles: [{ x: -1, mult: 1 }],
      holes: [0],
      leadingPositive: true,
      successFeedback:
        "Positive, negative, positive \u2014 and three special x's on the line: a root at \u22125, a pole at \u22121 the curve never touches, and a hole at 0 where the cancelled x still bans the input. The hole changes no sign \u2014 the reduced value there would be 5 \u2014 but the point stays punched out, because the ORIGINAL product divided by x.",
      crossFeedback:
        "Both cuts here are single factors \u2014 x + 5 above the bar, x + 1 below \u2014 and a single factor flips the sign whether it lives in the numerator or the denominator. Each crossing changes exactly one factor's sign.",
      bounceFeedback:
        "A sign that holds through a cut would need an even power there. Every factor in this product appears once, so the sign genuinely flips at \u22125 and again at \u22121.",
    },
  },
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [path, plan] of Object.entries(PLAN)) {
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${plan.lesson}: step ${plan.step} not found`);
  if (step.widget?.type === plan.widget.type) { skipped.push(plan.lesson); continue; }
  if (step.widget?.type !== plan.expect)
    throw new Error(`${plan.lesson}/${plan.step}: expected ${plan.expect}, found ${step.widget?.type}`);
  if (step.variant) throw new Error(`${plan.lesson}/${plan.step}: carries a variant tag`);
  if (step.predict) throw new Error(`${plan.lesson}/${plan.step}: already has a predict`);

  const errs = widgetIntegrityErrors(WidgetSpec.parse(plan.widget));
  if (errs.length) throw new Error(`${plan.lesson}: integrity \u2014 ${errs.join("; ")}`);

  const bodyBefore = step.body;
  const rebuilt = {};
  for (const k of Object.keys(step)) {
    if (k === "widget") { rebuilt.predict = plan.predict; rebuilt.widget = plan.widget; continue; }
    rebuilt[k] = step[k];
  }
  if (!("predict" in rebuilt)) throw new Error(`${plan.lesson}: predict was not inserted`);
  if (rebuilt.body !== bodyBefore) throw new Error(`${plan.lesson}: body changed`);
  const idx = doc.steps.findIndex((s) => s.id === plan.step);
  doc.steps[idx] = rebuilt;
  staged.push([path, doc, plan]);
}

for (const [path, doc, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${plan.lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type} (+predict)`);
}
if (skipped.length) console.log(`already applied, skipped: ${skipped.join(", ")}`);
console.log(`${staged.length} converted, ${skipped.length} already done (of ${Object.keys(PLAN).length})`);
