#!/usr/bin/env node
/**
 * S203B repair — the four MAD lessons shipped STATIC and landed Tier C.
 *
 * WHAT WENT WRONG. `flagship-tier.mjs` scores `d.manip = max(engine.manip)` over the widgets a
 * lesson uses. `numeric` and `mcq` are manip 0, so a lesson built only from them can never clear
 * the Tier B gate (manip>=2 AND conseq>=2 AND total>=24) no matter how good the prose is. The two
 * box-plot lessons in this batch each carry a `boxPlot` step (manip 2) and scored fine; the four
 * MAD lessons carried none and scored 19/19/19/17 -> Tier C. Grades 6-8 went from 1 Tier C lesson
 * to 5 in one batch.
 *
 * The authoring pack named `distributionCompareLab` as the MAD donor. It was simply not used.
 *
 * WHAT THIS DOES. Converts exactly ONE already-interactive step per lesson onto a manipulable
 * engine, preserving the authored question, the answer, and every diagnostic wrong path:
 *
 *   sp-02b-01 / sp-02b-02 / sp-02b-03  i2 -> distributionCompareLab (mode "measure")
 *       These three steps ARE the measure-mode task: two centres, one variability width, "how many
 *       apart". `commonErrors` map one-to-one onto `measureChoices`; sp-02-03 (the lesson directly
 *       before this new chapter) already uses the same engine the same way.
 *
 *   dd-04b-03  i2 -> dotPlot (build)
 *       Its prose says "watch one wild value do its work", which a numeric box cannot show. The
 *       MAD arithmetic it was asking for is already assessed twice in the same lesson (k1 and ch1),
 *       so nothing is lost by making this step the one that makes the outlier VISIBLE.
 *
 * Step kinds, ids, order, bodies, conceptTags and every other step are untouched, so the pedagogy
 * lint's structural rules hold by construction. These four files are already authorized as
 * `s203b-content-patch` in all three authorization sets — editing them again changes no file's
 * membership in the changed set, so the s151c/s146/s147 counts stay correct.
 *
 * Usage:  node scripts/session/fix-s203b-mad-manipulables.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dry = process.argv.includes("--dry-run");

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error(`REPAIR: ${msg}`); };

/** meanA - meanB must equal the gap the authored answer was derived from.
 *  `tolerance` is the widget's own derived-truth tolerance: lint recomputes (meanA-meanB)/variability
 *  and compares it to `answer`, so decimal means need headroom for float division —
 *  (13.2-12.0)/0.4 evaluates to 2.9999999999999982, not 3. */
const measure = ({ prompt, meanA, meanB, variability, answer, choices, fallback, success, labelA, labelB, tolerance = 0.01 }) => {
  must(Math.abs((meanA - meanB) / variability - answer) <= tolerance,
    `${prompt.slice(0, 40)}…: (${meanA}−${meanB})/${variability} !== authored answer ${answer}`);
  must(choices.some((c) => c.value === answer), "measureChoices must contain the correct value");
  return {
    type: "distributionCompareLab",
    prompt, mode: "measure",
    meanA, meanB, variability, answer, tolerance,
    measureChoices: choices,
    fallbackFeedback: fallback,
    successFeedback: success,
    groupALabel: labelA,
    groupBLabel: labelB
  };
};

const EDITS = [
  {
    course: "sampling-and-probability", lesson: "sp-02b-01", step: "i2",
    widget: measure({
      prompt: "Sample A now centres on 18 and Sample B on 12 — still 6 apart — but each sample has a MAD of 4. How many MADs apart are the centres?",
      meanA: 18, meanB: 12, variability: 4, answer: 1.5,
      labelA: "Sample A", labelB: "Sample B",
      choices: [
        { value: 2, label: "2", feedback: "2 subtracts (6 − 4). Measuring the gap in MADs means dividing: 6 ÷ 4 = 1.5." },
        { value: 1.5, label: "1.5", feedback: "6 ÷ 4 = 1.5. Watch the drawn distributions: wider wobble, same gap, fewer rulers between the centres." },
        { value: 24, label: "24", feedback: "24 multiplies (6 × 4). The MAD is the unit you are measuring WITH, so divide: 6 ÷ 4 = 1.5." },
        { value: 3, label: "3", feedback: "3 is the answer from the earlier, quieter groups whose MAD was 2. With a MAD of 4 the same gap covers fewer rulers: 6 ÷ 4 = 1.5." }
      ],
      fallback: "Divide the gap by the new ruler: 6 ÷ 4 = 1.5 MADs.",
      success: "6 ÷ 4 = 1.5 MADs — the same gap, measured with a wider ruler, counts for less."
    })
  },
  {
    course: "sampling-and-probability", lesson: "sp-02b-02", step: "i2",
    widget: measure({
      prompt: "Group C: mean 45, MAD 6. Group D: mean 51, MAD 6. How many MADs apart are the centres?",
      meanA: 51, meanB: 45, variability: 6, answer: 1,
      labelA: "Group D", labelB: "Group C",
      choices: [
        { value: 6, label: "6", feedback: "6 is the raw gap (51 − 45). Divide by the MAD of 6 to measure it: the answer is 1." },
        { value: 1, label: "1", feedback: "(51 − 45) ÷ 6 = 1. One ruler-width apart — the drawn distributions overlap heavily." },
        { value: 36, label: "36", feedback: "36 multiplies the gap by the MAD. Measuring in MADs is division: 6 ÷ 6 = 1." },
        { value: 0, label: "0", feedback: "0 would mean the centres sit on top of each other, but they differ by 6. Dividing that gap by the MAD of 6 gives 1." }
      ],
      fallback: "Gap = 51 − 45 = 6, and 6 ÷ 6 = 1 MAD.",
      success: "(51 − 45) ÷ 6 = 1 MAD apart — barely separated once you account for the wobble."
    })
  },
  {
    course: "sampling-and-probability", lesson: "sp-02b-03", step: "i2",
    widget: measure({
      prompt: "Service X arrives at mean 12.0 min, Service Y at mean 13.2 min, typical MAD 0.4 min. How many MADs apart are the centres?",
      meanA: 13.2, meanB: 12.0, variability: 0.4, answer: 3,
      labelA: "Service Y", labelB: "Service X",
      choices: [
        { value: 1.2, label: "1.2", feedback: "1.2 minutes is the raw gap. Divide by the 0.4-minute ruler: 1.2 ÷ 0.4 = 3." },
        { value: 3, label: "3", feedback: "1.2 ÷ 0.4 = 3 MADs. A small gap in minutes is a large gap in rulers, because the wobble is smaller still." },
        { value: 0.48, label: "0.48", feedback: "0.48 multiplies the gap by the MAD (1.2 × 0.4). Measuring in MADs means dividing: 3." },
        { value: 0.8, label: "0.8", feedback: "0.8 subtracts (1.2 − 0.4). The MAD is the unit of measurement, so divide by it: 1.2 ÷ 0.4 = 3." }
      ],
      fallback: "Gap = 13.2 − 12.0 = 1.2 min, and 1.2 ÷ 0.4 = 3 MADs.",
      success: "1.2 ÷ 0.4 = 3 MADs — barely a minute apart on the clock, but three rulers apart in the data."
    })
  },
  {
    course: "data-distributions", lesson: "dd-04b-03", step: "i2",
    widget: {
      type: "dotPlot",
      prompt: "Build the set 5, 5, 5, 25: three dots above 5, and one lone dot above 25.",
      values: [5, 10, 15, 20, 25],
      target: [3, 0, 0, 0, 1],
      maxPerValue: 4,
      successFeedback: "One value sits far from the rest. It drags the mean from 5 up to 10, and the MAD from 0 up to 7.5 — the typical distance stops describing any actual value.",
      partialFeedback: "Not yet. Three of the four values are the same number, and the fourth is far away — put 3 dots above 5 and 1 above 25."
    }
  }
];

const changed = [];
for (const e of EDITS) {
  const p = join(root, "content/courses", e.course, "lessons", `${e.lesson}.json`);
  const lesson = JSON.parse(readFileSync(p, "utf8"));
  const step = lesson.steps.find((s) => s.id === e.step);
  must(step, `${e.lesson}/${e.step}: step not found`);
  must(step.kind === "interactive", `${e.lesson}/${e.step}: expected an interactive step, found ${step.kind}`);
  must(step.widget?.type === "numeric" || step.widget?.type === e.widget.type,
    `${e.lesson}/${e.step}: expected the static numeric widget (or an already-repaired ${e.widget.type}), found ${step.widget?.type}`);
  must(!step.predict, `${e.lesson}/${e.step}: carries a predict block; converting it would change prediction scoring`);
  step.widget = e.widget;
  if (!dry) writeFileSync(p, JSON.stringify(lesson, null, 2) + "\n");
  changed.push(`${e.course}/${e.lesson}/${e.step} -> ${e.widget.type}`);
}

console.log(`${dry ? "[dry-run] " : ""}${changed.length} steps converted, ${asserts} assertions passed`);
for (const c of changed) console.log(`  ${c}`);
