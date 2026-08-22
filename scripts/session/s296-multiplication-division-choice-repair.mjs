import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "multiplication-division", "lessons");
const check = process.argv.includes("--check");
const repairs = [
  ["CHOICE-0175", "mult-02-04", "k3", ["2 distinct equations", "4 distinct equations", "1 distinct equation", "3 distinct equations"], ["2: one multiplication and one division.", "4: the two multiplication forms are different.", "1: all facts collapse into one statement.", "3: only the division fact repeats."]],
  ["CHOICE-0176", "mult-04-04", "k3", ["Multiply 6 vans by 5 riders, then remove 4 absences.", "Multiply 6 vans by 5 riders to find the total.", "Add 6 park friends and 5 joining friends.", "Divide 30 riders equally among 6 vans."], ["Find van riders, then subtract absences.", "Find the total van riders by multiplying.", "Find total friends by adding once.", "Find riders per van by dividing once."]],
  ["CHOICE-0177", "mult-04-05", "k1", ["A share of 32 exceeds the total of 28.", "The exact quotient should be 7.", "A bus can hold about 50 riders.", "Only recomputing can reject 32."], ["32 cannot be one share from a total of 28.", "The quotient is 7 riders per bus.", "A bus holds about 50 riders.", "You must recompute to reject 32."]],
  ["CHOICE-0178", "mult-05-01", "k2", ["Even, because both addends are even.", "Odd, because large sums are usually odd.", "Even, because every sum is even.", "Unknown until the addition is completed."], ["Even: both addends are even.", "Odd: larger sums are usually odd.", "Even: every sum is even.", "Unknown until you add them."]],
  ["CHOICE-0179", "mult-05-02", "k3", ["Each 10 is exactly two groups of 5.", "Both rows always end in the digit 0.", "Small rows happen to share their values.", "A larger row contains every smaller row."], ["Ten is two groups of five.", "Both rows always end in zero.", "Small rows happen to overlap.", "Larger rows always contain smaller rows."]],
  ["CHOICE-0180", "mult-05-03", "k1", ["An even factor pairs the full product.", "A factor ending in 5 makes an even product.", "The computed product, 40, is even.", "Parity is unknown until the product is computed."], ["An even factor makes the product even.", "A factor ending in 5 makes it even.", "The exact product happens to be even.", "You cannot know before multiplying."]],
  ["CHOICE-0181", "mult-05-04", "k1", ["Each jump of 10 moves exactly one full row.", "Every multiple of 10 ends in the digit 0.", "Ten is larger than every one-digit jump.", "The multiples of 10 form a diagonal line."], ["Each jump moves one full row.", "Every multiple ends in zero.", "Ten is the largest one-digit jump.", "The multiples make a diagonal."]],
];

const loaded = new Map();
for (const [workId, lessonId, stepId, before, after] of repairs) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  if (!loaded.has(file)) loaded.set(file, JSON.parse(await readFile(file, "utf8")));
  const step = loaded.get(file).steps.find((candidate) => candidate.id === stepId);
  const options = step?.widget?.options;
  if (!step || step.widget?.type !== "mcq" || JSON.stringify(options?.map((option) => option.id)) !== JSON.stringify(["a", "b", "c", "d"]) || JSON.stringify(options?.filter((option) => option.correct).map((option) => option.id)) !== JSON.stringify(["a"]) || options.some((option) => typeof option.feedback !== "string")) throw new Error(`${workId}: evaluator or feedback contract drift`);
  const labels = options.map((option) => option.label);
  if (JSON.stringify(labels) === JSON.stringify(after)) continue;
  if (JSON.stringify(labels) !== JSON.stringify(before)) throw new Error(`${workId}: source label drift`);
}

let changed = 0;
for (const [, lessonId, stepId, before, after] of repairs) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  const step = loaded.get(file).steps.find((candidate) => candidate.id === stepId);
  const labels = step.widget.options.map((option) => option.label);
  if (JSON.stringify(labels) === JSON.stringify(after)) continue;
  if (JSON.stringify(labels) !== JSON.stringify(before)) throw new Error(`${lessonId}/${stepId}: post-validation drift`);
  step.widget.options.forEach((option, index) => { option.label = after[index]; });
  changed += 1;
}

if (check && changed) throw new Error(`S296 needs ${changed} repairs`);
if (!check && changed) for (const [file, lesson] of loaded) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
console.log(JSON.stringify({ course: "multiplication-division", signedRootCauseClosures: repairs.length, changed, current: changed === 0 }));
