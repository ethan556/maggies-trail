import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "..");
const lessonDir = join(root, "content", "courses", "ratios-rates", "lessons");
const withheld = ["rr-01-02/c2", "rr-03-03/c1", "rr-03-03/c2", "rr-04-02/c1", "rr-04-02/c2", "rr-04-03/c2"];
const files = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort();
const source = [], errors = [];
const byKey = new Map();
for (const file of files) {
  const raw = readFileSync(join(lessonDir, file), "utf8");
  source.push(`${file}\0${raw}`);
  const lesson = JSON.parse(raw);
  for (const step of lesson.steps) byKey.set(`${lesson.id}/${step.id}`, step);
}
for (const key of withheld) if (byKey.get(key)?.figure !== undefined) errors.push(`${key}: fixed-exemplar visual must remain withheld`);
const choice = byKey.get("rr-02-02/k2")?.widget;
const labels = choice?.options?.map((option) => option.label.length) ?? [];
if (labels.length !== 3 || Math.max(...labels) / Math.min(...labels) > 1.1) errors.push("rr-02-02/k2: answer labels must remain length-balanced");
if (byKey.get("rr-04-02/k2")?.widget?.prompt !== "A jacket costs $90. A 30% discount is how many dollars?") errors.push("rr-04-02/k2: percentage transfer prompt drifted");
if (files.length !== 16) errors.push(`expected 16 lesson files, found ${files.length}`);
if (errors.length) throw new Error(errors.join("\n"));
console.log(`RATIOS_RATES_REPAIR_${process.argv.includes("--check") ? "CURRENT" : "VALID"} lessons=${files.length} withheld=${withheld.length} sourceSeal=${createHash("sha256").update(source.join("\n"), "utf8").digest("hex")}`);
