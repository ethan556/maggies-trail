import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "..");
const lessonDir = join(root, "content", "courses", "multiply-bigger", "lessons");
const expectedWithheld = new Map([
  ["mb-01-01/c2", "mb-times-compare"], ["mb-01-02/c1", "mb-times-compare"], ["mb-01-02/c2", "mb-times-compare"],
  ["mb-02-01/c1", "mb-factor-pairs"], ["mb-03-01/c1", "pv3-times-tens"], ["mb-03-01/c2", "pv3-times-tens"],
  ["mb-03-02/c1", "mb-break-area"], ["mb-03-02/c2", "mb-break-area"], ["mb-03-03/c1", "dop-two-by-two"],
  ["mb-04-01/c1", "mb-remainder"], ["mb-04-02/c2", "dop-long-division"],
]);
const expectedPrompts = new Map([
  ["mb-03-01/k2", "Compute the place-value product 5 × 70."],
  ["mb-04-01/k3", "45 ÷ 7 has quotient 6. What amount is left over?"],
  ["mb-05-01/k3", "Follow the multiplicative rule: 5, 15, 45, 135, ?"],
]);
const files = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort();
const errors = [], source = [];

for (const file of files) {
  const raw = readFileSync(join(lessonDir, file), "utf8");
  source.push(`${file}\0${raw}`);
  const lesson = JSON.parse(raw);
  for (const step of lesson.steps) {
    const key = `${lesson.id}/${step.id}`;
    if (expectedWithheld.has(key) && step.figure !== undefined) errors.push(`${key}: must withhold ${expectedWithheld.get(key)} until an exact visual is available`);
    if (expectedPrompts.has(key) && step.widget?.prompt !== expectedPrompts.get(key)) errors.push(`${key}: transfer prompt drifted`);
  }
}
if (files.length !== 14) errors.push(`expected 14 lesson files, found ${files.length}`);
if (errors.length) throw new Error(errors.join("\n"));
console.log(`MULTIPLY_BIGGER_REPAIR_${process.argv.includes("--check") ? "CURRENT" : "VALID"} lessons=${files.length} withheld=${expectedWithheld.size} transfers=${expectedPrompts.size} sourceSeal=${createHash("sha256").update(source.join("\n"), "utf8").digest("hex")}`);
