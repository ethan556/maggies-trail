#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/statistical-inference/lessons");
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 18) throw new Error(`Expected 18 Statistical Inference lessons; found ${files.length}`);
const lesson = JSON.parse(readFileSync(join(LESSONS, "si-02-02.json"), "utf8"));
const c2 = lesson.steps.filter((step) => step.id === "c2");
if (c2.length !== 1 || c2[0].figure !== "si-sampling-dist-sizes" || !/n=10.*±31.*n=40.*±16.*n=100.*±10/i.test(c2[0].body)) {
  throw new Error("si-02-02/c2 must name the exact n=10, 40, 100 sampling-distribution figure values");
}
const raw = files.map((file) => `${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
console.log(`STATISTICAL_INFERENCE_FIGURE_TRUTH_REPAIR_CURRENT lessons=${files.length} synchronized=1 sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
