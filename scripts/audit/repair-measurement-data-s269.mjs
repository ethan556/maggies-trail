#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/measurement-data/lessons");
const WITHHELD_FIXED_EXEMPLARS = [
  ["md-03-01", "c2", "md3-pictograph"],
  ["md-03-02", "c1", "md3-bargraph"],
  ["md-03-03", "c2", "md3-bargraph"],
  ["md-04-02", "c1", "md3-area-rows"],
  ["md-04-02", "c2", "md3-area-rows"],
];
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 17) throw new Error(`Expected 17 Measurement Data lessons; found ${files.length}`);
const raw = [];
for (const file of files) raw.push(`${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
for (const [lessonId, stepId, figureId] of WITHHELD_FIXED_EXEMPLARS) {
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8"));
  const step = lesson.steps.filter((candidate) => candidate.id === stepId);
  if (step.length !== 1 || step[0].kind !== "concept" || step[0].figure !== undefined) {
    throw new Error(`${lessonId}/${stepId} must withhold mismatched ${figureId}`);
  }
  if (typeof step[0].body !== "string" || step[0].body.length < 30) {
    throw new Error(`${lessonId}/${stepId} must preserve its explanatory claim`);
  }
}
const sourceSeal = createHash("sha256").update(raw.join("\n")).digest("hex");
console.log(`MEASUREMENT_DATA_FIGURE_REPAIR_CURRENT lessons=${files.length} withheld=${WITHHELD_FIXED_EXEMPLARS.length} sourceSeal=${sourceSeal}`);
