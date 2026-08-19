import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "mult-div-fluency-g4", "lessons");
const check = process.argv.includes("--check");

const numeric = (prompt, answer, commonErrors, fallbackFeedback, successFeedback) => ({
  type: "numeric",
  prompt,
  answer,
  tolerance: 0,
  unit: "",
  commonErrors,
  fallbackFeedback,
  successFeedback,
});

const repairs = [
  {
    workId: "LESSON-REVISION-g4m-01-01",
    lessonId: "g4m-01-01",
    beforeType: "areaModel",
    afterBody: "Test the claim by calculating with place value.",
    afterWidget: numeric(
      "A classmate claims 300 × 4 = 1,200. What is the product?",
      1200,
      [
        { value: 120, feedback: "That is one place too small. Three hundreds times 4 is twelve hundreds." },
        { value: 12000, feedback: "That is one place too large. The factor is 300, not 3,000." },
      ],
      "Use 3 × 4 = 12, then name the value of the 3 in 300.",
      "Correct — 1,200. Three hundreds times 4 is twelve hundreds.",
    ),
    afterActionGoal: "Use place value to scale a basic multiplication fact and check the product.",
  },
  {
    workId: "LESSON-REVISION-g4m-01-02",
    lessonId: "g4m-01-02",
    beforeType: "areaModel",
    afterBody: "Test the claim by adding two partial products.",
    afterWidget: numeric(
      "A classmate claims 16 × 6 = 96. Split 16 into 10 + 6. What is the product?",
      96,
      [
        { value: 60, feedback: "That is only 10 × 6. Include 6 × 6 too." },
        { value: 36, feedback: "That is only 6 × 6. Include 10 × 6 too." },
      ],
      "Find 10 × 6 and 6 × 6, then add both partial products.",
      "Correct — 96. The partial products are 60 and 36.",
    ),
    afterActionGoal: "Calculate and combine both partial products in a place-value split.",
  },
  {
    workId: "LESSON-REVISION-g4m-02-01",
    lessonId: "g4m-02-01",
    beforeType: "estimateSlider",
    afterBody: "Test the claim with an exact calculation.",
    afterWidget: numeric(
      "A classmate claims 46 × 49 = 2,254. What is the exact product?",
      2254,
      [
        { value: 2300, feedback: "That is 46 × 50. Subtract one group of 46 to return to 49 groups." },
        { value: 225, feedback: "A place value was lost. The product of two two-digit numbers here is in the thousands." },
      ],
      "Use 46 × 50 = 2,300, then subtract one group of 46.",
      "Correct — 2,254. The claim is exact.",
    ),
    afterActionGoal: "Use a nearby friendly factor, then compensate to calculate an exact product.",
  },
  {
    workId: "LESSON-REVISION-g4m-02-02",
    lessonId: "g4m-02-02",
    beforeType: "estimateSlider",
    afterBody: "Test the claim with an exact calculation.",
    afterWidget: numeric(
      "A classmate claims 47 × 6 = 282. What is the exact product?",
      282,
      [
        { value: 2822, feedback: "That is about ten times too large. Keep the tens and ones in their correct places." },
        { value: 245, feedback: "That uses 47 × 5. Multiply all six groups." },
      ],
      "Multiply 40 × 6 and 7 × 6, then add the two products.",
      "Correct — 282. The claim is exact.",
    ),
    afterActionGoal: "Use place-value partial products to check an exact multiplication claim.",
  },
  {
    workId: "LESSON-REVISION-g4m-02-05",
    lessonId: "g4m-02-05",
    beforeType: "columnCalc",
    afterBody: "Test the claim by finding what remains after a large equal-group chunk.",
    afterWidget: numeric(
      "A classmate claims 80 groups of 6 can be taken from 504 first. Since 6 × 80 = 480, how much is left to share?",
      24,
      [
        { value: 480, feedback: "480 is the amount already shared. Subtract it from 504 to find what remains." },
        { value: 84, feedback: "84 is the final quotient, not the amount left after 80 groups." },
      ],
      "Subtract the amount already shared: 504 − 480.",
      "Correct — 24 remains after 80 groups of 6 are taken.",
    ),
    afterActionGoal: "Use a large equal-group chunk and subtract it from the dividend before finishing division.",
  },
  {
    workId: "LESSON-REVISION-g4m-03-04",
    lessonId: "g4m-03-04",
    beforeType: "estimateSlider",
    afterBody: "Test the claim by dividing compatible numbers.",
    afterWidget: numeric(
      "A classmate claims 1,800 ÷ 6 estimates 1,793 ÷ 6. What quotient estimate does this give?",
      300,
      [
        { value: 30, feedback: "That is ten times too small. Six goes into 1,800 about three hundred times." },
        { value: 1800, feedback: "That repeats the dividend. Divide 1,800 into groups of 6." },
      ],
      "Choose the nearby number 1,800 because it divides evenly by 6.",
      "Correct — 300. That is a useful estimate for 1,793 ÷ 6.",
    ),
    afterActionGoal: "Divide compatible numbers to make and explain a quotient estimate.",
  },
  {
    workId: "LESSON-REVISION-g4m-03-05",
    lessonId: "g4m-03-05",
    beforeType: "columnCalc",
    afterBody: "Test the quotient claim with a multiplication check.",
    afterWidget: numeric(
      "A classmate claims 218 is the quotient of 654 ÷ 3. What product should 218 × 3 make?",
      654,
      [
        { value: 648, feedback: "Check the tens and ones products again. The quotient must rebuild the original dividend." },
        { value: 218, feedback: "218 is the proposed quotient. Multiply it by the divisor 3 to check it." },
      ],
      "Multiply the proposed quotient by the divisor to see whether it rebuilds 654.",
      "Correct — 654. The multiplication check supports the quotient claim.",
    ),
    afterActionGoal: "Check a division claim by multiplying the proposed quotient by the divisor.",
  },
];

const stable = (value) => JSON.stringify(value);
const loaded = new Map();

for (const repair of repairs) {
  const file = path.join(lessonDirectory, `${repair.lessonId}.json`);
  if (!loaded.has(file)) loaded.set(file, JSON.parse(await readFile(file, "utf8")));
  const step = loaded.get(file).steps.find((candidate) => candidate.id === "i2");
  if (!step || step.kind !== "interactive" || !step.cml) throw new Error(`${repair.workId}: i2 CML contract missing`);
  if (stable(step.widget) === stable(repair.afterWidget) && step.body === repair.afterBody && step.cml.actionGoal === repair.afterActionGoal) continue;
  if (step.widget?.type !== repair.beforeType || step.body !== "Test the claim with the model.") {
    throw new Error(`${repair.workId}: source contract drift`);
  }
}

let changed = 0;
for (const repair of repairs) {
  const file = path.join(lessonDirectory, `${repair.lessonId}.json`);
  const step = loaded.get(file).steps.find((candidate) => candidate.id === "i2");
  if (stable(step.widget) === stable(repair.afterWidget) && step.body === repair.afterBody && step.cml.actionGoal === repair.afterActionGoal) continue;
  step.body = repair.afterBody;
  step.widget = repair.afterWidget;
  step.cml.actionGoal = repair.afterActionGoal;
  changed += 1;
}

if (check && changed) throw new Error(`S309 needs ${changed} safe progression repairs`);
if (!check && changed) {
  for (const [file, lesson] of loaded) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

console.log(JSON.stringify({
  course: "mult-div-fluency-g4",
  safeProgressionClosures: repairs.length,
  residual: "LESSON-REVISION-g4m-02-04 requires an exact partial-quotients semantic figure and is intentionally untouched.",
  changed,
  current: changed === 0,
}));
