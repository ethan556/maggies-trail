#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LESSONS = join(ROOT, "content/courses/add-subtract-100/lessons");
const files = readdirSync(LESSONS).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 16) throw new Error(`Expected 16 Add/Subtract within 100 lessons; found ${files.length}`);
const lesson = JSON.parse(readFileSync(join(LESSONS, "as100-03-04.json"), "utf8"));
const c2 = lesson.steps.filter((step) => step.id === "c2");
if (c2.length !== 1 || c2[0].figure !== "as100-break-ten" || !/1 ten.*1 fewer ten/i.test(c2[0].body) || !/1 ten.*1 fewer ten/i.test(c2[0].narration)) {
  throw new Error("as100-03-04/c2 must exactly state the one-ten trade shown by as100-break-ten");
}
const raw = files.map((file) => `${file}\n${readFileSync(join(LESSONS, file), "utf8")}`);
console.log(`ADD_SUBTRACT_100_FIGURE_TRUTH_REPAIR_CURRENT lessons=${files.length} synchronized=1 sourceSeal=${createHash("sha256").update(raw.join("\n")).digest("hex")}`);
