import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "decimal-fluency-g5", "lessons");
const check = process.argv.includes("--check");
const repairs = [
  ["VIS-g5d-01-04-c1-dpv-trailing-zero", "g5d-01-04", "c1", "dpv-trailing-zero", "Trailing zeros let you write both decimals to the same place before subtracting. The value stays the same.", "Zeros to the right of a decimal do not change its value. Use them to align place values before subtracting."],
  ["VIS-g5d-01-06-c1-dpv-hundredths-grid", "g5d-01-06", "c1", "dpv-hundredths-grid", "A hundredths grid names 0.35 as 35 hundredths. Four equal groups make 140 hundredths.", "A hundredths grid shows one whole divided into equal hundredths. Equal groups collect the same-sized pieces."],
  ["VIS-g5d-01-06-c2-dop-count-places", "g5d-01-06", "c2", "dop-count-places", "Multiply the digits, then use place value to read the result. For 0.35 × 4, 140 hundredths is 1.40.", "First multiply the digits. Then count decimal places in both factors to place the decimal in the product."],
  ["VIS-g5d-02-01-c1-dpv-round-whole", "g5d-02-01", "c1", "dpv-round-whole", "Round a decimal factor to a nearby whole number for a quick estimate. For example, 4.9 × 6 is close to 5 × 6, or 30.", "Round a decimal factor to a nearby whole before estimating the product. Use the estimate to check the product's decimal point."],
  ["VIS-g5d-02-01-c2-dop-count-places", "g5d-02-01", "c2", "dop-count-places", "After multiplying, compare the product with the estimate. A result far from 30 has the decimal point in the wrong place.", "After multiplying, compare the product with the estimate. Count decimal places again if the product's point looks misplaced."],
  ["VIS-g5d-02-03-c1-dop-count-places", "g5d-02-03", "c1", "dop-count-places", "The picture separates two jobs: multiply the digits, then count the places in both factors to position the decimal point.", "The picture separates two jobs: multiply the digits, then count decimal places to position the product's point."],
  ["VIS-g5d-02-04-c1-dop-estimate-quotient", "g5d-02-04", "c1", "dop-estimate-quotient", "Estimate the quotient before dividing. Sharing 1.44 among 4 groups should give a little more than 0.3 in each group.", "Estimate a decimal quotient with nearby compatible values before dividing. The estimate checks whether the quotient's size makes sense."],
  ["VIS-g5d-02-04-c2-dpv-hundredths-grid", "g5d-02-04", "c2", "dpv-hundredths-grid", "Think of 1.44 as 144 hundredths. Dividing 144 by 4 gives 36 hundredths, or 0.36.", "Think in hundredths: divide the equal-sized pieces among the groups, then write the quotient as a decimal."],
  ["VIS-g5d-02-05-c2-dpv-place-names", "g5d-02-05", "c2", "dpv-place-names", "For 7.2 ÷ 0.9, one shift makes the divisor whole: 72 ÷ 9. Both numbers must shift by the same amount.", "Use place names to decide how far each decimal point must move. Shift both numbers equally so the quotient keeps its value."],
  ["VIS-g5d-03-01-c2-pv4-times10-shift", "g5d-03-01", "c2", "pv4-times10-shift", "Shift the dividend and divisor together. For 3.5 ÷ 0.07, two shifts make 350 ÷ 7, while the quotient stays 50.", "A power-of-ten shift moves every digit by the same number of places. Shift dividend and divisor together before dividing."],
  ["VIS-g5d-03-02-c2-dop-count-places", "g5d-03-02", "c2", "dop-count-places", "Now check the decimal point. The digits 144 can name 1.44, 14.4, or 144, but only 14.4 matches the estimate.", "Use an estimate to check the decimal placement after you count decimal places in both factors."],
  ["VIS-g5d-03-04-c1-vm-metric-ladder", "g5d-03-04", "c1", "vm-metric-ladder", "The metric ladder connects meters and centimeters. One centimeter is one hundredth of a meter, so 74 cm is 0.74 m.", "The metric ladder links units by powers of ten. Moving to a smaller metric unit multiplies; moving back divides."],
];

const loaded = new Map();
for (const [workId, lessonId, stepId, figure, before, after] of repairs) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  if (!loaded.has(file)) loaded.set(file, JSON.parse(await readFile(file, "utf8")));
  const step = loaded.get(file).steps.find((candidate) => candidate.id === stepId);
  if (!step || step.kind !== "concept" || step.figure !== figure || step.widget !== undefined) throw new Error(`${workId}: evaluator or figure contract drift`);
  const current = { body: step.body, narration: step.narration };
  if (current.body === after && current.narration === after) continue;
  if (current.body !== before || current.narration !== before) throw new Error(`${workId}: source text drift`);
}

let changed = 0;
for (const [, lessonId, stepId, , before, after] of repairs) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  const step = loaded.get(file).steps.find((candidate) => candidate.id === stepId);
  if (step.body === after && step.narration === after) continue;
  if (step.body !== before || step.narration !== before) throw new Error(`${lessonId}/${stepId}: post-validation drift`);
  step.body = after;
  step.narration = after;
  changed += 1;
}

if (check && changed) throw new Error(`S294 needs ${changed} repairs`);
if (!check && changed) for (const [file, lesson] of loaded) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
console.log(JSON.stringify({ course: "decimal-fluency-g5", signedRootCauseClosures: repairs.length, changed, current: changed === 0 }));
