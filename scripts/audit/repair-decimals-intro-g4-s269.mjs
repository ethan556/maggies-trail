#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/decimals-intro-g4/lessons");
const WITHHELD_FIXED_EXEMPLARS = [
  ["dg4-01-01", "c2"], ["dg4-01-02", "c2"], ["dg4-01-06", "c2"],
  ["dg4-02-01", "c2"], ["dg4-02-02", "c2"], ["dg4-02-03", "c2"],
  ["dg4-02-04", "c1"], ["dg4-02-04", "c2"], ["dg4-02-05", "c2"],
  ["dg4-03-01", "c1"], ["dg4-03-01", "c2"], ["dg4-03-02", "c2"],
  ["dg4-03-03", "c1"], ["dg4-03-04", "c2"], ["dg4-03-05", "c2"],
  ["dg4-03-06", "c2"],
];
const withheld = new Set(WITHHELD_FIXED_EXEMPLARS.map(([lesson, step]) => `${lesson}/${step}`));
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 18) throw new Error(`Expected 18 Decimal Intro lessons; found ${files.length}`);
let remainingGridBindings = 0;
const raw = [];
for (const file of files) {
  const text = readFileSync(join(LESSONS, file), "utf8");
  raw.push(`${file}\n${text}`);
  const lesson = JSON.parse(text);
  for (const step of lesson.steps) {
    const key = `${lesson.id}/${step.id}`;
    if (withheld.has(key)) {
      if (step.kind !== "concept" || step.figure !== undefined || step.narration !== step.body) {
        throw new Error(`${key} must retain synchronized text but no fixed dpv-hundredths-grid binding`);
      }
    }
    if (step.figure === "dpv-hundredths-grid") remainingGridBindings += 1;
  }
}
for (const key of withheld) {
  const [lessonId, stepId] = key.split("/");
  const lesson = JSON.parse(readFileSync(join(LESSONS, `${lessonId}.json`), "utf8"));
  if (!lesson.steps.some((step) => step.id === stepId && step.kind === "concept" && step.figure === undefined)) {
    throw new Error(`Missing withheld concept ${key}`);
  }
}
if (remainingGridBindings !== 20) throw new Error(`Expected 20 generic grid bindings after withholding; found ${remainingGridBindings}`);
const sourceSeal = createHash("sha256").update(raw.join("\n")).digest("hex");
console.log(`DECIMALS_INTRO_G4_FIGURE_REPAIR_CURRENT lessons=${files.length} withheld=${withheld.size} retained=${remainingGridBindings} sourceSeal=${sourceSeal}`);
