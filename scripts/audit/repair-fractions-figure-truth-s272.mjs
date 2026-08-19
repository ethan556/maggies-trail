#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/fractions/lessons");
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 15) throw new Error(`Expected 15 Fractions lessons; found ${files.length}`);
const lesson = JSON.parse(readFileSync(join(LESSONS, "fr-03-03.json"), "utf8"));
const c1 = lesson.steps.filter((step) => step.id === "c1");
const c2 = lesson.steps.filter((step) => step.id === "c2");
if (c1.length !== 1 || c1[0].figure !== "frac-whole-disguise" || !/4\/4.*1 whole/i.test(c1[0].body)) {
  throw new Error("fr-03-03/c1 must use the exact 4/4 whole figure contract");
}
if (c2.length !== 1 || c2[0].figure !== undefined || !/6\/3.*6 ÷ 3 = 2/i.test(c2[0].body)) {
  throw new Error("fr-03-03/c2 must withhold frac-whole-disguise while retaining the 6/3 division claim");
}
const raw = files.map((file) => `${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
console.log(`FRACTIONS_FIGURE_TRUTH_REPAIR_CURRENT lessons=${files.length} synchronized=1 withheld=1 sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
