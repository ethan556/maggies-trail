#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/add-subtract-20/lessons");
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 17) throw new Error(`Expected 17 Add/Subtract within 20 lessons; found ${files.length}`);
const lesson = JSON.parse(readFileSync(join(LESSONS, "as-04-01.json"), "utf8"));
const c2 = lesson.steps.filter((step) => step.id === "c2");
if (c2.length !== 1 || c2[0].figure !== "as-fact-family" || !/6 \+ 7 = 13.*13 − 6 = 7/i.test(c2[0].body) || !/six plus seven.*thirteen minus seven/i.test(c2[0].narration)) {
  throw new Error("as-04-01/c2 must name the exact 6, 7, 13 fact family rendered by as-fact-family");
}
const raw = files.map((file) => `${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
console.log(`ADD_SUBTRACT_20_FIGURE_TRUTH_REPAIR_CURRENT lessons=${files.length} synchronized=1 sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
