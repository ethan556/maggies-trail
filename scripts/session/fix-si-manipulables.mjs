#!/usr/bin/env node
/**
 * fix-si-manipulables — PILOT of the high-school Tier C repair, on `statistical-inference`.
 *
 * THE DIAGNOSIS THIS TESTS. All 196 high-school Tier C/D lessons are blocked by exactly one thing:
 * `d.manip < 2`. None fails on misconception sensitivity, prediction, contrast, transfer,
 * accessibility or polish. `d.manip` is the MAX over the engines a lesson uses, so converting ONE
 * step onto a manipulable engine should move a lesson from C to B without touching prose, answers
 * or diagnostics — the mechanic S203B established on four MAD lessons.
 *
 * WHY THIS COURSE. `statistical-inference` has 8 of its 18 lessons at Tier C, all at manip 1
 * (`steppedReveal`), each with exactly one `interactive` step — an unusually uniform target. It is
 * also the course whose engines (`samplingBiasLab`, `scatterFit`, `distributionCompareLab`) are the
 * same ones a future S-ID course would need, so what is learned here is not single-use.
 *
 * WHAT THE PILOT IS ACTUALLY FOR: the FIT RATE. Engine availability is already proven — 49 manip>=2
 * engines are in production and unused above grade 8. What is NOT proven is that a manipulable
 * engine honestly models each lesson's mathematics. Forcing one on where it does not fit would buy
 * a tier point by making the lesson worse, which is the opposite of the point.
 *
 * SO THIS SCRIPT REPAIRS 6 OF THE 8, AND DELIBERATELY LEAVES TWO ALONE:
 *   si-05-01  "Watch a claim shrink as the design weakens" — a ladder of study designs, not a
 *             quantity anyone can manipulate. No existing engine models it honestly.
 *   si-05-03  "Five questions, in order" — a judgement checklist over a claim. Same problem.
 * Those two stay at Tier C and are reported as such. A 6/8 fit rate is the pilot's real output.
 *
 * ENGINE SAFETY (habit 3, checked before authoring): `scatterFit` and `samplingBiasLab` are guarded
 * by no count-pinning audit at all; `distribution-compare-s131` is scoped to three fixed
 * `sampling-and-probability` lessons, so new uses elsewhere cannot disturb it.
 *
 * Usage:  node scripts/session/fix-si-manipulables.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dry = process.argv.includes("--dry-run");
let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error(`REPAIR: ${msg}`); };
process.on("uncaughtException", (e) => { console.error(`\n✗ ${e?.message ?? e}\n  nothing was written.`); process.exit(1); });

const bias = ({ prompt, populationLabel, targetMethod, targetSize, sizeMin, sizeMax, sizeStep, sizeStart, requiredDraws, success, method, size, draws }) => ({
  type: "samplingBiasLab", prompt, populationLabel, targetMethod, targetSize,
  sizeMin, sizeMax, sizeStep, sizeStart, requiredDraws,
  successFeedback: success, methodFeedback: method, sizeFeedback: size, drawsFeedback: draws
});

const EDITS = [
  {
    lesson: "si-01-01", step: "i1",
    widget: bias({
      prompt: "A trial of 300 patients. Choose the assignment method that removes the systematic differences between groups, use at least 120 patients, and repeat the draw several times.",
      populationLabel: "300 patients", targetMethod: "random", targetSize: 120,
      sizeMin: 20, sizeMax: 300, sizeStep: 20, sizeStart: 20, requiredDraws: 5,
      success: "Random assignment is what buys the causal claim. It does not make the groups identical — watch them wobble apart on each draw — but it makes their differences accidental rather than systematic, which is exactly what a lurking variable is not.",
      method: "Letting patients choose, or assigning by who arrives first, lets something about the patient decide the group. That is the lurking variable arriving through the front door.",
      size: "Random, but small. With few patients the groups can still land far apart by luck alone; the design is sound and the evidence is thin.",
      draws: "Draw several more times. The claim is about what random assignment does ON AVERAGE, which one draw cannot show."
    })
  },
  {
    lesson: "si-01-02", step: "i1",
    widget: bias({
      prompt: "Estimate support across 5,000 residents. Use a representative method, push the sample size up, and repeat — watch which of the two errors the size dial actually fixes.",
      populationLabel: "5,000 residents", targetMethod: "random", targetSize: 200,
      sizeMin: 20, sizeMax: 400, sizeStep: 20, sizeStart: 20, requiredDraws: 6,
      success: "Size shrinks the WOBBLE — the estimates cluster tighter every time you raise it. It never moves the LEAN, because a method that excludes part of the population excludes it just as thoroughly at 400 as at 20. Two different errors, and only one dial.",
      method: "This method tilts systematically. Raising the size now makes a precise estimate of the wrong number — which is exactly how a 2.4-million-ballot poll called the 1936 election wrong.",
      size: "Right method, but too few people to see the wobble shrink. Raise it and watch the spread of repeated estimates close in.",
      draws: "One sample cannot show variability. Repeat the draw and watch the estimates scatter."
    })
  },
  {
    lesson: "si-02-03", step: "i1",
    widget: bias({
      prompt: "Draw repeatedly from 4,000 voters at a sample size of 100 and watch where the estimates land. About how many fall inside two standard errors of the truth?",
      populationLabel: "4,000 voters", targetMethod: "random", targetSize: 100,
      sizeMin: 20, sizeMax: 200, sizeStep: 20, sizeStart: 20, requiredDraws: 8,
      success: "About 19 of every 20 draws land within 2 SE of the truth. That is the whole of '95% confident' — not a claim about this poll, but a count of how often the method lands close. SE = √(p(1−p)/n) is the formula for the width of the pile you just built.",
      method: "The 95% figure assumes every member of the population could have been picked. A method that excludes some of them breaks the arithmetic before it starts.",
      size: "Any size gives a 95% band; the band is just wider when n is small. Bring it to 100 so the SE matches the worked example.",
      draws: "Two draws cannot show a 95% pattern. Keep drawing — the shape only appears in the long run, which is the point."
    })
  },
  {
    lesson: "si-03-03", step: "i1",
    widget: {
      type: "distributionCompareLab",
      prompt: "A leads B, 48% to 45%, with a margin of ±3 points on each. The gap is 3 points and the margin is 3 points — judge what the poll actually supports.",
      mode: "judge", gapUnits: 1,
      groupALabel: "Candidate A", groupBLabel: "Candidate B",
      judgeOptions: [
        { id: "overlap", label: "The bands overlap — the poll cannot separate them", correct: true, feedback: "A runs 45–51 and B runs 42–48. They share 45–48, so a tie, or even B ahead, sits comfortably inside what this poll can see." },
        { id: "aleads", label: "A is ahead — the poll shows a real lead", feedback: "That reads the headline number and ignores the band. A 3-point gap with a ±3 margin on each side is exactly the case where the poll cannot tell." },
        { id: "tied", label: "They are exactly tied", feedback: "The poll cannot establish a tie either. It rules out a large lead for either candidate and says nothing more precise than that." },
        { id: "bleads", label: "B is ahead", feedback: "B ahead is inside the bands, but so is A ahead. 'Cannot separate' is the honest reading, not a reversal." }
      ],
      successFeedback: "The bands overlap, so the poll cannot separate them. A lead smaller than the margin is not a lead — it is a headline.",
      fallbackFeedback: "Compare the bands, not the numbers: A runs 45–51, B runs 42–48, and they share 45–48."
    }
  },
  {
    lesson: "si-04-03", step: "i1",
    widget: bias({
      prompt: "Draw from 50,000 users at increasing sample sizes. Watch what happens to a difference that is real but tiny as the sample grows.",
      populationLabel: "50,000 users", targetMethod: "random", targetSize: 400,
      sizeMin: 20, sizeMax: 500, sizeStep: 20, sizeStart: 20, requiredDraws: 6,
      success: "As n rises the wobble shrinks, so a smaller and smaller true difference stops being explainable by chance. That is all 'significant' means. A 0.3-point gain on a 100-point test is significant at n = 100,000 and still worthless — significance is about chance, never about size.",
      method: "A biased method produces a difference that is not real at all, which significance testing cannot detect. Fix the design before asking about p.",
      size: "Push the size higher. The effect being demonstrated only becomes visible once the wobble is small enough to make a tiny gap stand out.",
      draws: "Repeat the draw — the claim is about how the SPREAD of estimates behaves as n grows, which needs more than one."
    })
  },
  {
    lesson: "si-05-02", step: "i1",
    widget: {
      type: "scatterFit",
      prompt: "Study time (minutes) against test score, for 20–60 minutes. Fit the best straight line — then read what it predicts at 600 minutes.",
      points: [[20, 52], [30, 60], [40, 67], [50, 76], [60, 83]],
      xMin: 0, xMax: 70, yMin: 40, yMax: 90,
      mMin: 0, mMax: 1.5, mStep: 0.1, bMin: 30, bMax: 50, bStep: 1,
      mStart: 0.4, bStart: 40, tolerance: 0.15,
      successFeedback: "About ŷ = 0.77x + 37 — an excellent fit across 20 to 60 minutes. Now extend it to 600 minutes and it predicts a score near 500 on a 100-point test. The model is not wrong; it is being used outside the range the data ever visited. That is extrapolation, and it is the failure this lesson is about.",
      slopeFeedback: "The tilt is off. Each extra 10 minutes buys roughly 8 points, so the slope should sit near 0.77 — not far from 0.8.",
      offsetFeedback: "The tilt looks right but the line sits too high or too low. Slide the intercept until the line passes through the middle of the points, around 37.",
      fallbackFeedback: "Move the slope until the line runs through the middle of the points: roughly 0.77 with an intercept near 37."
    }
  }
];

/** Deliberately NOT repaired — recorded so the fit rate is visible rather than implied. */
const NO_HONEST_FIT = [
  ["si-05-01", "a ladder of study designs; the 'quantity' being varied is the strength of a claim, which no existing engine models"],
  ["si-05-03", "a five-question judgement checklist over a claim; nothing to manipulate"]
];

const changed = [];
for (const e of EDITS) {
  const p = join(root, "content/courses/statistical-inference/lessons", `${e.lesson}.json`);
  const lesson = JSON.parse(readFileSync(p, "utf8"));
  const step = lesson.steps.find((s) => s.id === e.step);
  must(step, `${e.lesson}/${e.step}: step not found`);
  must(step.kind === "interactive", `${e.lesson}/${e.step}: expected an interactive step, found ${step.kind}`);
  must(step.widget?.type === "steppedReveal" || step.widget?.type === e.widget.type,
    `${e.lesson}/${e.step}: expected steppedReveal (or an already-repaired ${e.widget.type}), found ${step.widget?.type}`);
  must(!step.predict, `${e.lesson}/${e.step}: carries a predict block; converting it would change prediction scoring`);
  step.widget = e.widget;
  if (!dry) writeFileSync(p, JSON.stringify(lesson, null, 2) + "\n");
  changed.push(`${e.lesson}/${e.step} -> ${e.widget.type}`);
}

console.log(`${dry ? "[dry-run] " : ""}${changed.length} of 8 Tier C lessons repaired; ${asserts} assertions passed`);
for (const c of changed) console.log(`  ${c}`);
console.log(`\nleft at Tier C — no engine models these honestly:`);
for (const [id, why] of NO_HONEST_FIT) console.log(`  ${id}  ${why}`);
console.log(`\nfit rate for this course: ${changed.length}/8`);
