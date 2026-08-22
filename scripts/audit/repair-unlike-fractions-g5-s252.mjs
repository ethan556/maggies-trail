import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "unlike-fractions-g5", "lessons");
const CHECK = process.argv.includes("--check");
const EXPECTED_EVALUATOR_SEAL = "8b35d2905bffc3f060f3653722e4c20f56be47d60233364d3d8a936ba13e4b45";

const concepts = {
  "g5u-01-01": ["fm-common-denom", "fm-add-unlike"],
  "g5u-01-02": ["fm-common-denom", "fa-multiplier"],
  "g5u-01-03": ["ns-lcm", "ns-lcm"],
  "g5u-01-04": ["fm-common-denom", "fm-common-denom"],
  "g5u-01-05": ["fm-add-unlike", "fa-add-like"],
  "g5u-02-01": ["fm-subtract-unlike", "fm-subtract-unlike"],
  "g5u-02-02": ["fa-add-like", "fa-improper-mixed"],
  "g5u-02-03": ["fa-subtract-like", "fa-mixed-improper"],
  "g5u-02-04": ["fa-mixed-improper", "fa-mixed-improper"],
  "g5u-02-05": ["fa-simplify", "fa-simplify"],
  "g5u-03-01": ["fa-benchmark-half", "fa-compare-benchmark"],
  "g5u-03-02": ["fm-add-unlike", "fm-add-unlike"],
  "g5u-03-03": ["fm-add-unlike", "fm-subtract-unlike"],
  "g5u-03-04": ["ns-lcm", "ns-lcm"],
};

const conceptText = {
  "g5u-01-01": [
    "The model re-cuts 1/2 as 3/6 and 1/3 as 2/6. Fractions add by counting pieces only after the pieces have the same size.",
    "Once both fractions are sixths, 3/6 + 2/6 = 5/6. Adding across to get 2/5 ignores piece size and even produces a result smaller than 1/2.",
  ],
  "g5u-01-02": [
    "A common denominator is a piece size both fractions can use. The model shows halves and thirds re-cut into sixths, a shared multiple of 2 and 3.",
    "Renaming does not change the amount: the model re-cuts 1/2 into 3/6 by scaling top and bottom by 3.",
  ],
  "g5u-01-03": [
    "The model lists multiples of 4 and 6 and finds 12 first. Any shared multiple works as a denominator, but the least one keeps the numbers smallest.",
    "Both 12 and 24 are shared sizes for fourths and sixths. The model identifies 12 as the first shared multiple, so it is the efficient choice.",
  ],
  "g5u-01-04": [
    "Both fractions must be renamed. In the model, 1/2 scales by 3 and 1/3 scales by 2 so both fractions arrive at sixths.",
    "Different scaling factors can lead to the same denominator. The model's 1/2 = 3/6 and 1/3 = 2/6 show the same method used to rename fourths and sixths as twelfths.",
  ],
  "g5u-01-05": [
    "The model renames 1/2 and 1/3 as sixths, then combines 3 sixth-size pieces and 2 sixth-size pieces to make 5/6.",
    "The denominator names the piece size, so it does not add. The like-fractions model keeps fifths while 2 pieces plus 1 piece make 3 pieces.",
  ],
  "g5u-02-01": [
    "Subtraction follows the same course: the model renames 3/4 as 9/12 and 1/3 as 4/12, then removes four twelfths to leave 5/12.",
    "Unlike fractions need matching pieces before subtraction. The model makes both quantities twelfths, then crosses out the amount removed.",
  ],
  "g5u-02-02": [
    "Add mixed numbers by combining their whole parts and their like-sized fraction parts. The model shows the fraction-part rule: add the tops and keep the shared denominator.",
    "If the fraction parts make more than one whole, regroup the improper fraction. The model turns 11/8 into 1 whole and 3/8.",
  ],
  "g5u-02-03": [
    "When the top fraction part is large enough, subtract the like-sized parts directly. The model removes 1/5 from 4/5 and leaves 3/5.",
    "Another route is to convert each mixed number to an improper fraction. The model counts 2 1/4 as nine fourth-size pieces, or 9/4.",
  ],
  "g5u-02-04": [
    "A whole can be traded for denominator-sized pieces without changing the amount. The model writes 2 1/4 as 9/4; similarly, 4 1/8 can be regrouped as 3 9/8.",
    "Regrouping changes the packaging, not the value. The model counts the same 2 1/4 as nine fourths, just as a traded whole supplies eight eighths.",
  ],
  "g5u-02-05": [
    "Simplifying divides top and bottom by the same common factor. The model groups 6/8 by twos to make the equal fraction 3/4.",
    "Simplifying is the inverse of renaming: the model uses fewer, larger pieces while the shaded amount stays unchanged.",
  ],
  "g5u-03-01": [
    "Benchmarks 0, 1/2, and 1 give a fast size check. The model places 3/5 just past 1/2; similarly, 7/8 is near 1 and 1/12 is near 0.",
    "A benchmark comparison can rule out implausible results before exact calculation. The model compares two fractions against the same halfway mark.",
  ],
  "g5u-03-02": [
    "A reasonable sum must be greater than each positive addend. The model confirms 1/2 + 1/3 = 5/6, which lies above both parts and below 1.",
    "The model shows the exact sum is 5/6, so 2/5 cannot be reasonable: it is smaller than the starting 1/2.",
  ],
  "g5u-03-03": [
    "In a word problem, identify the quantities and operation before calculating. The addition model renames unlike fractions and then combines equal-sized pieces.",
    "The operation comes from the story: amounts poured in add, while amounts poured out subtract. The subtraction model crosses out the removed pieces.",
  ],
  "g5u-03-04": [
    "Use one denominator shared by every fraction, then follow the story's operation order. The model finds 12 as the least common multiple of 4 and 6; 3 also divides 12.",
    "Renaming once avoids repeated work. Twelfths serve fourths, thirds, and sixths throughout the whole subtract-then-add chain.",
  ],
};

const i2Repairs = {
  "g5u-01-01": { prompt: "A learner added across and built 2/5. Repair the bar to the correctly renamed half, 3/6, before combining it with thirds.", numStart: 2, denStart: 5 },
  "g5u-01-02": { prompt: "A learner changed only the denominator and built 1/12. Repair the bar so one third is renamed as 4/12.", numStart: 1, denStart: 12 },
  "g5u-01-03": { prompt: "A learner shaded 6/12 for one fourth. Repair the least-common-denominator model to 3/12.", numStart: 6, denStart: 12 },
  "g5u-01-04": { prompt: "A learner changed only the denominator and built 1/12. Repair one sixth by scaling both parts to 2/12.", numStart: 1, denStart: 12 },
  "g5u-01-05": { prompt: "A learner kept only the second addend, 4/12. Repair the bar to show the combined total 7/12.", numStart: 4, denStart: 12 },
  "g5u-02-01": { prompt: "A learner modeled the four twelfths removed instead of the remainder. Repair the bar to show the 5/12 left from 9/12.", numStart: 4, denStart: 12 },
  "g5u-02-02": { prompt: "A learner kept only the first fraction part, 3/8. Repair the bar by joining the additional 2/8 to make 5/8.", numStart: 3, denStart: 8 },
  "g5u-02-03": { prompt: "A learner used the whole-number 2 as the numerator and built 2/8. Repair the fractional part of 2 3/8 to 3/8.", numStart: 2, denStart: 8 },
  "g5u-02-04": { prompt: "A learner kept only 1/8 after regrouping. Repair the bar by trading one whole for 8/8, making the fraction part 9/8.", numStart: 1, denStart: 8 },
  "g5u-02-05": { prompt: "A learner subtracted 2 from the top and bottom and built 6/10. Repair 8/12 by dividing both parts by 4 to make 2/3.", numStart: 6, denStart: 10 },
  "g5u-03-01": { prompt: "A learner says adding two fractions must give about 2 wholes. Repair the estimate using 7/8 near 1 and 1/12 near 0.", start: 2 },
  "g5u-03-02": { prompt: "A learner added across and estimated 2/5. Repair the estimate by locating a sum greater than 1/2 but less than 1.", start: 0.4 },
  "g5u-03-03": { prompt: "A learner kept only the starting 5/12. Repair the story model by adding 4/12 and building the 9/12 total.", numStart: 5, denStart: 12 },
  "g5u-03-04": { prompt: "A learner added every quantity and estimated 1 1/4 litres. Repair the estimate by following the story: subtract 1/3, then add 1/6.", start: 1.25 },
};

const progressionPrompts = {
  "g5u-01-01": { ch1: "A learner claims 1/2 = 1/4. How many fourth-size pieces cover the same length as one half?" },
  "g5u-01-04": { k3: "A learner scales 1/4 to twelfths but writes 2/12. What numerator repairs the equivalent fraction?" },
  "g5u-01-05": { ch1: "How many twelfth-size parts are covered altogether by 2/12 and 6/12?" },
  "g5u-02-01": {
    k2: "A model starts with four twelfth-size pieces and crosses out one. How many pieces remain?",
    ch1: "How many twelfths remain when two twelfth-size sections are cut from seven?",
  },
  "g5u-02-02": { k3: "A learner combines 2 3/8 and 1 2/8 but keeps only 3/8. How many eighth-size parts belong in the fraction total?" },
  "g5u-02-03": { ch1: "Three whole groups of eight eighths plus three more eighths make how many eighths?" },
  "g5u-02-05": {
    k2: "In 3/9, make groups of three ninths. How many groups form the numerator of the equivalent thirds?",
    ch1: "Pair the two shaded sixths in 2/6. How many paired groups form the numerator of the equivalent thirds?",
  },
  "g5u-03-03": {
    k3: "A jug gains one sixth and then three sixths. How many sixth-size parts are there altogether?",
    ch1: "Start with six sixths and cross out one sixth. How many sixth-size parts stay shaded?",
  },
};

const choices = {
  "g5u-01-05": {
    k2: ["It stays at 12", "It doubles to 24", "It changes to 10", "It is removed"],
  },
  "g5u-02-01": {
    k3: ["It stays at 12", "It doubles to 24", "It changes to 11", "It is removed"],
  },
  "g5u-03-02": {
    k1: [
      "Reasonable — it is greater than each addend and below 1",
      "Unreasonable — every fraction sum must exceed 1",
      "Unreasonable — adding across should give 2/5",
      "Undecidable — estimation cannot test a fraction sum",
    ],
    k3: [
      "It supports 5/6 — the sum lies above both addends and below 1",
      "It rejects 5/6 — every fraction sum must exceed 1",
      "It rejects 5/6 — adding across should give 2/5",
      "It cannot test 5/6 — benchmarks do not check sums",
    ],
  },
};

function evaluatorSignature(widget) {
  const signature = { type: widget.type };
  for (const key of ["answer", "tolerance", "targetNum", "targetDen", "target", "acceptFactor", "min", "max"]) {
    if (key in widget) signature[key] = widget[key];
  }
  if (widget.options) signature.options = widget.options.map(({ id, correct }) => ({ id, correct }));
  return signature;
}

function evaluatorRows(lessons) {
  const rows = [];
  for (const lesson of lessons) {
    for (const step of lesson.steps) if (step.widget) rows.push([lesson.id, step.id, evaluatorSignature(step.widget)]);
    for (const route of lesson.remedials ?? []) for (const step of [route.concept, route.check]) {
      if (step?.widget) rows.push([lesson.id, step.id, evaluatorSignature(step.widget)]);
    }
  }
  return rows;
}

function seal(value) {
  return createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 14) throw new Error(`Expected 14 lessons, found ${files.length}`);
const lessons = [];
const beforeByFile = new Map();
for (const file of files) {
  const before = await readFile(path.join(COURSE, file), "utf8");
  const lesson = JSON.parse(before);
  if (file !== `${lesson.id}.json` || lesson.courseId !== "unlike-fractions-g5") throw new Error(`Unexpected lesson identity in ${file}`);
  lessons.push(lesson);
  beforeByFile.set(file, before);
}

const beforeEvaluatorSeal = seal(evaluatorRows(lessons));
if (beforeEvaluatorSeal !== EXPECTED_EVALUATOR_SEAL) throw new Error(`Evaluator seal drift before repair: ${beforeEvaluatorSeal}`);

for (const lesson of lessons) {
  const figurePair = concepts[lesson.id];
  const textPair = conceptText[lesson.id];
  const i2Repair = i2Repairs[lesson.id];
  if (!figurePair || !textPair || !i2Repair) throw new Error(`Missing repair map for ${lesson.id}`);

  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step || step.kind !== "concept") throw new Error(`Missing concept ${lesson.id}/${stepId}`);
    if (step.figure !== "count-on-hops" && step.figure !== figurePair[index]) throw new Error(`Unexpected figure ${lesson.id}/${stepId}/${step.figure}`);
    step.figure = figurePair[index];
    step.body = textPair[index];
    step.narration = textPair[index];
  }

  const i2 = lesson.steps.find((entry) => entry.id === "i2");
  if (!i2?.widget) throw new Error(`Missing ${lesson.id}/i2`);
  i2.body = "Repair the misconception.";
  Object.assign(i2.widget, i2Repair);

  for (const [stepId, prompt] of Object.entries(progressionPrompts[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget) throw new Error(`Missing progression target ${lesson.id}/${stepId}`);
    step.widget.prompt = prompt;
  }

  for (const [stepId, labels] of Object.entries(choices[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (step?.widget?.type !== "mcq" || step.widget.options.length !== labels.length) throw new Error(`Missing choice target ${lesson.id}/${stepId}`);
    step.widget.options.forEach((option, index) => { option.label = labels[index]; });
  }

  if (lesson.id === "g5u-02-03") {
    const i1 = lesson.steps.find((entry) => entry.id === "i1");
    if (i1?.widget?.type !== "fractionBar" || i2.widget.type !== "fractionBar") throw new Error("Mixed-number truth targets missing");
    i1.widget.prompt = "Build the fractional part of 2 3/8: three eighth-size pieces. Then use the check to convert the whole mixed number.";
  }
  if (lesson.id === "g5u-03-02") {
    for (const stepId of ["i1", "i2"]) {
      const step = lesson.steps.find((entry) => entry.id === stepId);
      if (step?.widget?.type !== "estimateSlider") throw new Error(`Reasonableness slider missing at ${stepId}`);
      step.widget.highFeedback = "Too high — after 1/2, adding 1/3 is not enough to reach one whole.";
    }
  }
}

const afterEvaluatorSeal = seal(evaluatorRows(lessons));
if (afterEvaluatorSeal !== EXPECTED_EVALUATOR_SEAL) throw new Error(`Evaluator seal changed during repair: ${afterEvaluatorSeal}`);

let changed = 0;
const lessonHashes = [];
for (const [index, file] of files.entries()) {
  const after = `${JSON.stringify(lessons[index], null, 2)}\n`;
  if (after !== beforeByFile.get(file)) {
    changed += 1;
    if (!CHECK) await writeFile(path.join(COURSE, file), after, "utf8");
  }
  lessonHashes.push(seal(after));
}

if (CHECK && changed) throw new Error(`${changed} unlike-fractions-g5 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  illustrationSourceClosures: 28,
  progressionQueueClosures: 8,
  lessonWideProgressionRepairs: 14,
  choiceSurfaceSourceClosures: 4,
  learnerVisibleTruthRepairs: 4,
  evaluatorSeal: afterEvaluatorSeal,
  courseSeal: seal(lessonHashes.join("\n")),
}, null, 2));
