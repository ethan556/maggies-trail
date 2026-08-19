import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "mult-div-fluency-g4", "lessons");
const check = process.argv.includes("--check");
const repairs = [
  ["VIS-g4m-01-03-c1-dop-standard-algo", "g4m-01-03", "c1", "dop-standard-algo", "The vertical model shows 23 × 4 place by place: 4 × 3 makes 12, so 2 is written and 1 ten is regrouped; then 4 × 2 tens plus that extra ten makes 9 tens.", "A standard algorithm multiplies one place at a time. Regroup a full bundle into the next place before continuing."],
  ["VIS-g4m-01-03-c2-dop-partial-products", "g4m-01-03", "c2", "dop-partial-products", "The area model keeps the hidden place values visible: 23 × 4 is 20 × 4 plus 3 × 4. The column algorithm records those same partial products in a more compact layout.", "An area model splits a factor by place value. The partial products from every region combine to make the product."],
  ["VIS-g4m-01-04-c1-dop-standard-algo", "g4m-01-04", "c1", "dop-standard-algo", "The standard-algorithm diagram makes regrouping visible. When 4 × 3 makes 12 ones, 2 ones stay in the ones place and 1 ten moves left before the tens are multiplied.", "Regrouping trades a full bundle into the next place. Include that trade before multiplying the next place."],
  ["VIS-g4m-01-04-c2-pv4-carry-chain", "g4m-01-04", "c2", "pv4-carry-chain", "The carry-chain diagram shows that regrouping moves a full bundle into the next place. In multiplication, every moved bundle must be included in the next column or the product is too small.", "Regrouping trades a full bundle from one place to the next. Include every trade in the next place before finishing the product."],
  ["VIS-g4m-01-05-c2-mb-break-area", "g4m-01-05", "c2", "mb-break-area", "A split rectangle shows why every place must multiply every place. Even the simpler 4 × 27 model needs both regions; a two-digit by two-digit model needs all four regions before their areas are added.", "An area model breaks apart multiplication by place value. The partial products from every region combine to make the product."],
  ["VIS-g4m-01-06-c2-dop-partial-products", "g4m-01-06", "c2", "dop-partial-products", "The smaller area model shows the same rule with two regions: 23 × 4 becomes 80 + 12. Partial products are the visible regions written as numbers, and every region belongs in the final sum.", "Partial products make each area region visible. Add every region to make the full product."],
  ["VIS-g4m-02-03-c2-pv4-ladder", "g4m-02-03", "c2", "pv4-ladder", "The place-value ladder keeps hundreds, tens, and ones in order. When 9 hundreds are shared among 3 groups, each group gets 3 hundreds, so the quotient must begin in the hundreds place.", "A place-value ladder keeps columns ordered by powers of ten. Dividing a number shares each place-value unit into equal groups."],
  ["VIS-g4m-03-01-c1-dop-estimate-quotient", "g4m-03-01", "c1", "dop-estimate-quotient", "The compatible-number diagram replaces a difficult dividend and divisor with nearby numbers that divide cleanly. For a four-digit dividend divided by one digit, the benchmark shows whether the quotient is in the hundreds or thousands.", "Compatible numbers make a quotient easier to estimate. Compare the estimate with the exact quotient to check its size."],
  ["VIS-g4m-03-02-c1-mb-remainder", "g4m-03-02", "c1", "mb-remainder", "The sharing diagram partitions 13 objects among 4 equal groups. Twelve objects place 3 in each group and 1 remains, so in this model the quotient is the number in each group and the remainder is the unshared object.", "When objects are shared equally, anything left over is the remainder. The quotient tells how many are in each full group."],
  ["VIS-g4m-03-03-c2-mb-remainder", "g4m-03-03", "c2", "mb-remainder", "The equal-groups diagram separates full groups from leftovers. Read the question before deciding whether to keep the remainder, report it, or increase the whole-number answer by one.", "When objects are shared equally, anything left over is the remainder. The context tells whether to report it, keep it, or use another whole group."],
];

const loaded = new Map();
for (const [workId, lessonId, stepId, figure, before, after] of repairs) {
  const file = path.join(lessonDirectory, `${lessonId}.json`);
  if (!loaded.has(file)) loaded.set(file, JSON.parse(await readFile(file, "utf8")));
  const step = loaded.get(file).steps.find((candidate) => candidate.id === stepId);
  if (!step || step.kind !== "concept" || step.figure !== figure || step.widget !== undefined) throw new Error(`${workId}: evaluator or figure contract drift`);
  if (step.body === after && step.narration === after) continue;
  if (step.body !== before || step.narration !== before) throw new Error(`${workId}: source text drift`);
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

if (check && changed) throw new Error(`S295 needs ${changed} repairs`);
if (!check && changed) for (const [file, lesson] of loaded) await writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
console.log(JSON.stringify({ course: "mult-div-fluency-g4", signedRootCauseClosures: repairs.length, changed, current: changed === 0 }));
