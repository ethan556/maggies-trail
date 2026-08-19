import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "fractions-deeper-g3", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "g3f-01-02": ["frac-unit-fourth", "thirds-compare"],
  "g3f-01-03": ["frac-three-fourths", "frac-top-bottom"],
  "g3f-01-04": ["fm-fraction-of", "fm-fraction-of"],
  "g3f-01-05": ["frac-numline-fourths", "mc-ruler-eighths"],
  "g3f-02-01": ["frac-numline-fourths", "frac-numline-unit"],
  "g3f-02-02": ["thirds-compare", "thirds-compare"],
  "g3f-02-03": ["frac-equiv-half", "fa-multiplier"],
  "g3f-02-04": ["frac-equiv-numline", "frac-equiv-numline"],
  "g3f-02-05": ["frac-whole-disguise", "frac-whole-disguise"],
  "g3f-03-01": ["frac-whole-disguise", "frac-whole-disguise"],
  "g3f-03-02": ["frac-compare-wholes", "frac-compare-same-denom"],
  "g3f-03-03": ["frac-compare-same-denom", "frac-compare-same-numer"],
  "g3f-03-04": ["frac-top-bottom", "frac-top-bottom"],
};

const conceptText = {
  "g3f-02-01": [
    "A fraction line cuts the distance from 0 to 1 into equal JUMPS. This fourths model has four equal spaces; to mark thirds, use the same method with three equal spaces.",
    "Count spaces, not marks. A fourths line has five marks but four jumps; a thirds line has four marks but three jumps.",
  ],
  "g3f-02-05": [
    "A whole number can wear a fraction name. The model shows 4/4 = 1; two complete groups of four fourths make 8/4 = 2.",
    "Group the pieces by the denominator. One group of four fourths makes 1 whole; two groups make 8/4 = 2.",
  ],
};

const i2Repairs = {
  "g3f-01-01": { prompt: "A learner shaded 2/4 instead of one unit fraction. Repair the bar so exactly 1 of 4 equal pieces is shaded.", numStart: 2, denStart: 4 },
  "g3f-01-02": { prompt: "A learner shaded the whole 6/6 instead of one unit fraction. Repair the bar to show 1/6.", numStart: 6, denStart: 6 },
  "g3f-01-03": { prompt: "Start with 1/4, then collect two more fourth-size pieces to build 3/4.", numStart: 1, denStart: 4 },
  "g3f-01-04": { prompt: "A learner modeled one counter out of eight as 1/8. Repair the bar to show one of the 4 equal groups: 1/4.", numStart: 1, denStart: 8 },
  "g3f-01-05": { prompt: "A learner stopped at 1/8. Move the mark to the point on an eighths ruler that is equivalent to 1/2.", start: 1 },
  "g3f-02-01": { prompt: "A learner counted the first mark as a jump and stopped at 1/3. Correct the landing to 2/3.", start: 1 },
  "g3f-02-02": { prompt: "A learner stopped at 2/6, one jump short of halfway. Correct the landing to 3/6.", start: 2 },
  "g3f-02-03": { prompt: "A learner changed only the denominator and built 1/4. Repair the bar so it shows the same amount as 1/2 using fourths.", numStart: 1, denStart: 4 },
  "g3f-02-04": { prompt: "A learner placed 1/4. Move the point to the fourths mark that shares a location with 1/2.", start: 1 },
  "g3f-02-05": { prompt: "A learner reversed 6/3 and built 3/6. Repair the bar to show 6/3, then notice the two complete wholes.", numStart: 3, denStart: 6 },
  "g3f-03-01": { prompt: "A learner stopped at 5/6. Complete the whole by repairing the bar to 6/6.", numStart: 5, denStart: 6 },
  "g3f-03-02": { prompt: "A learner built the smaller amount, 3/8. Repair the bar to show the greater amount, 5/8, on the same whole.", numStart: 3, denStart: 8 },
  "g3f-03-03": { prompt: "A learner chose the smallest unit fraction, 1/6. Repair the bar to show the largest of 1/3, 1/4, and 1/6.", numStart: 1, denStart: 6 },
  "g3f-03-04": { prompt: "A learner reversed the count and cut and built 6/5. Repair the ribbon model to show 5/6.", numStart: 6, denStart: 5 },
};

const prompts = {
  "g3f-01-01": { k3: "A learner says any three pieces may be called thirds, even when their sizes differ. Which verdict is valid?" },
  "g3f-01-02": { k3: "Three matching slices cover one whole pizza. What unit-fraction name belongs to one slice?" },
  "g3f-01-03": {
    k3: "Compute 2 × 1/3 as ?/3. What is the numerator? Use repeated unit pieces.",
    ch1: "A trail is 3/8 mile, then 4/8 mile more. Express the total as ?/8. What is the numerator? Track the final distance on the same denominator.",
  },
  "g3f-01-04": { k3: "Four counters form a 2-by-2 array. Enter the total number of counters." },
  "g3f-01-05": { k3: "A learner stops at 2/8 for one half. Which ruler mark repairs the error?" },
  "g3f-02-03": {
    k3: "Scale 1/3 by ×3 on top and bottom. What is the new numerator? Use the equal-length strip as a check.",
    ch1: "1/6 = ?/24. What number goes on top? Use the scale factor from sixths to twenty-fourths.",
  },
  "g3f-02-04": { k3: "1/4 = ?/12. What number goes on top? Verify the answer lands at the quarter point." },
  "g3f-02-05": {
    k2: "Convert 8/2 to a mixed number. What is the WHOLE NUMBER part? Group the halves into complete wholes.",
    ch1: "Convert 24/8 to a mixed number. What is the WHOLE NUMBER part? Use complete groups of eighths.",
  },
  "g3f-03-01": {
    k2: "Convert 6/6 to a mixed number. What is the WHOLE NUMBER part? Check whether every sixth is present.",
    k3: "Convert 16/4 to a mixed number. What is the WHOLE NUMBER part? Bundle the fourths into full groups.",
    ch1: "Convert 8/8 to a mixed number. What is the WHOLE NUMBER part? Confirm that all eighths fill the bar.",
  },
  "g3f-03-02": { k3: "A class compares pieces cut from different-sized pizzas. Which option explains why the piece sizes cannot prove 1/4 > 1/2?" },
  "g3f-03-03": { k3: "Order 4/6, 1/6, and 5/6 from least to greatest. Which one is in the MIDDLE? Interpret the middle as the median shaded amount." },
  "g3f-03-04": { k3: "A learner writes 6/5 after five of six equal ribbon pieces are used. Which option repairs the numerator-denominator reversal?" },
};

function refreshFractionFeedback(widget) {
  if (widget.type !== "fractionBar") return;
  const target = `${widget.targetNum}/${widget.targetDen}`;
  const targetLabel = widget.targetNum === 1 && widget.targetDen === 4 ? `the target quarter (${target})` : `the target ${target}`;
  widget.lowFeedback = `Your shaded amount is less than ${targetLabel}. Compare it with the target, then increase the shaded amount.`;
  widget.highFeedback = `Your shaded amount is greater than ${targetLabel}. Compare it with the target, then decrease the shaded amount.`;
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 14) throw new Error(`Expected 14 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);

  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step) throw new Error(`Missing ${lesson.id}/${stepId}`);
    const figure = concepts[lesson.id]?.[index];
    if (figure) step.figure = figure;
    const text = conceptText[lesson.id]?.[index];
    if (text) {
      step.body = text;
      step.narration = text;
    }
  }

  const i2 = lesson.steps.find((entry) => entry.id === "i2");
  const repair = i2Repairs[lesson.id];
  if (!i2?.widget || !repair) throw new Error(`Missing repairable ${lesson.id}/i2`);
  i2.body = "Repair the misconception.";
  Object.assign(i2.widget, repair);

  for (const [stepId, prompt] of Object.entries(prompts[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget) throw new Error(`Missing prompt target ${lesson.id}/${stepId}`);
    step.widget.prompt = prompt;
  }

  for (const step of lesson.steps) if (step.widget) refreshFractionFeedback(step.widget);
  for (const route of lesson.remedials ?? []) {
    if (route.concept?.widget) refreshFractionFeedback(route.concept.widget);
    if (route.check?.widget) refreshFractionFeedback(route.check.widget);
  }

  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} fractions-deeper-g3 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  illustrationSourceClosures: 26,
  progressionSourceClosures: 14,
  falseFeedbackRepairs: 36,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
