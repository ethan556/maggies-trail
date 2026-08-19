#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const WITHHELD = [
  ["circle-theorems", 16, "cr-05-03", "steps.0", "inscribed-angle-halves"],
  ["conic-sections", 15, "co-05-03", "steps.3", "co-comet-eccentric"],
  ["counting-120", 15, "c120-05-01", "steps.0", "number-track"],
  ["curve-analysis", 15, "ca-03-02", "remedials.0.concept", "dr-tangent-line"],
  ["data-distributions", 18, "dd-04-01", "steps.3", "range-stretch"],
  ["derivative-rules", 15, "dr-04-01", "remedials.0.concept", "dr-chain-gears"],
];
const atPath = (value, path) => path.split(".").reduce((node, part) => node?.[Number.isInteger(Number(part)) ? Number(part) : part], value);
const raw = [];
for (const [course, expectedLessonCount, lessonId, path, figureId] of WITHHELD) {
  const lessons = join(ROOT, "content/courses", course, "lessons");
  const files = readdirSync(lessons).filter((name) => name.endsWith(".json")).sort();
  if (files.length !== expectedLessonCount) throw new Error(`${course}: expected ${expectedLessonCount} lessons; found ${files.length}`);
  raw.push(...files.map((file) => `${course}/${file}\n${readFileSync(join(lessons, file), "utf8")}`));
  const node = atPath(JSON.parse(readFileSync(join(lessons, `${lessonId}.json`), "utf8")), path);
  if (node?.kind !== "concept" || node.figure !== undefined) throw new Error(`${course}/${lessonId}/${path} must withhold ${figureId}`);
}
console.log(`SMALL_P0_FIGURE_TRUTH_REPAIR_CURRENT courses=${new Set(WITHHELD.map(([course]) => course)).size} withheld=${WITHHELD.length} sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
