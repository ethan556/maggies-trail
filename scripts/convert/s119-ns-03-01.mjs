// S119 -- ns-03-01 "Greatest Common Factor", backlog-adjacent at Tier B (27), gaps `manip adapt`.
//
// The lesson handed the learner two written factor lists (8: 1,2,4,8; 12: 1,2,3,4,6,12) and took a
// number. That is the intersection of two lists performed on paper -- there is nothing to
// manipulate and nothing to watch. The causal fact underneath is a STRIDE: the greatest common
// factor of 8 and 12 is the biggest hop that still lands exactly on both marks. Overshoot it and a
// mark gets skipped; undershoot and you land on both but wasted room.
//
// S116 deferred this lesson for a precise reason -- "the greatest common factor is a property of
// two hop SIZES, not of one landing, and this engine grades a single landing." That was correct
// about the engine as it stood. Hop-size mode grades the stride itself, which is the missing
// channel, so the deferral is now closed on its own terms rather than by force.
//
// Arithmetic verified before authoring, and again independently in the suite:
//   8 - 0 = 8 and 12 - 0 = 12; strides dividing both: 1, 2, 4 -> largest is 4 = GCF(8, 12).
//   Stride 8 divides 8 but NOT 12 (12 % 8 = 4), so the "factor of one of them" error is reachable.
//   Stride 2 divides both but is not the largest, so the "common but not GREATEST" error -- the
//   one the word GREATEST exists to rule out -- is reachable too. Both feedback paths are live,
//   which the integrity gate independently requires.
//
// The authored predict is preserved byte-for-byte. i2 (matchPairs) and every check step are
// untouched: the numeric formalization now FOLLOWS a manipulation, which is the ordering the tier
// formula rewards.

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "content/courses/number-system/lessons/ns-03-01.json";

const widget = {
  type: "numberLineHop",
  prompt:
    "Hop from 0 with a stride you choose. Find the LARGEST stride that still lands exactly on both 8 and 12.",
  min: 0,
  max: 16,
  start: 0,
  hop: 1,
  hops: 4,
  direction: "forward",
  hopSizeTargets: [8, 12],
  hopSizeMin: 1,
  hopSizeMax: 12,
  commonLandings: [],
  successFeedback:
    "A stride of 4 lands on 4, 8, 12, 16 \u2014 both marks hit, and nothing bigger manages it. That is what \u201cgreatest common factor\u201d means: not the largest factor of either number, but the largest stride that reaches both. Try 6: it lands on 12 and skips 8 entirely.",
  notLargestFeedback:
    "This stride does land on both marks \u2014 so it IS a common factor. But the question asks for the GREATEST one. Stretch the stride further and watch whether both marks survive.",
  missesTargetFeedback:
    "Watch the marks: this stride skips one of them. A common factor has to land on BOTH numbers, so a stride that reaches 8 but steps over 12 (or the reverse) does not qualify, however large it is.",
  missFeedback:
    "Not there yet \u2014 adjust the stride and watch which marks it lands on.",
};

const { WidgetSpec, widgetIntegrityErrors, hopSizeAnswer } = await import("../../src/lib/schema.ts");

const doc = JSON.parse(readFileSync(PATH, "utf8"));
const step = doc.steps.find((s) => s.id === "i1");
if (!step) throw new Error("i1 not found");
if (step.widget?.type === "numberLineHop") { console.log("ns-03-01: already converted"); process.exit(0); }
if (step.widget?.type !== "numeric") throw new Error(`expected numeric, found ${step.widget?.type}`);
if (step.variant) throw new Error("i1 carries a variant tag");

const parsed = WidgetSpec.parse(widget);
const errs = widgetIntegrityErrors(parsed);
if (errs.length) throw new Error(`integrity \u2014 ${errs.join("; ")}`);

// Independent arithmetic: recompute the GCF by trial division rather than trusting the helper.
const targets = widget.hopSizeTargets;
let byHand = 1;
for (let h = 1; h <= widget.hopSizeMax; h++) if (targets.every((t) => (t - widget.start) % h === 0)) byHand = h;
const viaHelper = hopSizeAnswer(widget.start, targets, widget.hopSizeMin, widget.hopSizeMax);
if (byHand !== viaHelper) throw new Error(`GCF disagreement: by hand ${byHand}, helper ${viaHelper}`);
if (byHand !== 4) throw new Error(`expected GCF(8,12) = 4, got ${byHand}`);
console.log(`  verified: GCF(${targets.join(", ")}) = ${byHand} (by hand and by helper)`);
if (targets.every((t) => t % 8 === 0)) throw new Error("stride 8 must skip a mark for the contrast case");
console.log("  verified: stride 8 hits 8 and skips 12 - contrast case reachable");

const bodyBefore = step.body;
const predictBefore = JSON.stringify(step.predict ?? null);
step.widget = widget;
if (step.body !== bodyBefore) throw new Error("body changed");
if (JSON.stringify(step.predict ?? null) !== predictBefore) throw new Error("authored predict changed");

writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log("ns-03-01/i1: numeric -> numberLineHop hop-size mode (authored predict preserved)");
