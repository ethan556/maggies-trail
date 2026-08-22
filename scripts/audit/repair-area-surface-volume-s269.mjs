#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/area-surface-volume/lessons");
const WITHHELD_FIXED_EXEMPLARS = [
  ["asv-05-02", "c1", "asv-frac-volume"],
  ["asv-05-02", "c2", "asv-frac-volume"],
  ["asv-05-03", "c1", "asv-boxes-fit"],
];
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 15) throw new Error(`Expected 15 Area & Surface Volume lessons; found ${files.length}`);
const raw = [];
for (const file of files) raw.push(`${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
for (const [lessonId, stepId, figureId] of WITHHELD_FIXED_EXEMPLARS) {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8"));
  const steps = lesson.steps.filter((step) => step.id === stepId);
  if (steps.length !== 1 || steps[0].kind !== "concept" || steps[0].figure !== undefined) {
    throw new Error(`${lessonId}/${stepId} must withhold mismatched ${figureId}`);
  }
}
console.log(`AREA_SURFACE_VOLUME_FIGURE_REPAIR_CURRENT lessons=${files.length} withheld=${WITHHELD_FIXED_EXEMPLARS.length} sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
