#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/linear-equations-systems/lessons");
const WITHHELD_FIXED_EXEMPLARS = [
  ["les-04-02", "c1", "les-back-subst"],
  ["les-04-03", "c2", "les-back-subst"],
];
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 Linear Equations & Systems lessons; found ${files.length}`);
const raw = files.map((file) => `${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
for (const [lessonId, stepId, figureId] of WITHHELD_FIXED_EXEMPLARS) {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8"));
  const steps = lesson.steps.filter((step) => step.id === stepId);
  if (steps.length !== 1 || steps[0].kind !== "concept" || steps[0].figure !== undefined) {
    throw new Error(`${lessonId}/${stepId} must withhold ${figureId}`);
  }
}
console.log(`LINEAR_EQUATIONS_SYSTEMS_FIGURE_TRUTH_REPAIR_CURRENT lessons=${files.length} withheld=${WITHHELD_FIXED_EXEMPLARS.length} sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
