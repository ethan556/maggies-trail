#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/derivatives-in-context/lessons");
const WITHHELD_FIXED_EXEMPLARS = [
  ["dc-01-02", "c1", "dc-speeding-up-signs"],
  ["dc-02-01", "c1", "dr-chain-gears"],
  ["dc-02-02", "c1", "dr-implicit-circle"],
  ["dc-02-03", "c2", "dr-chain-gears"],
];
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 11) throw new Error(`Expected 11 Derivatives in Context lessons; found ${files.length}`);
const raw = [];
for (const file of files) raw.push(`${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
for (const [lessonId, stepId, figureId] of WITHHELD_FIXED_EXEMPLARS) {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8"));
  const steps = lesson.steps.filter((step) => step.id === stepId);
  if (steps.length !== 1 || steps[0].kind !== "concept" || steps[0].figure !== undefined) {
    throw new Error(`${lessonId}/${stepId} must withhold mismatched ${figureId}`);
  }
}
const sourceSeal = createHash("sha256").update(raw.join("\n")).digest("hex");
console.log(`DERIVATIVES_IN_CONTEXT_FIGURE_REPAIR_CURRENT lessons=${files.length} withheld=${WITHHELD_FIXED_EXEMPLARS.length} sourceSeal=${sourceSeal}`);
