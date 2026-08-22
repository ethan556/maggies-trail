import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const path = join(process.cwd(), "content", "courses", "add-three-numbers-g1", "lessons", "g1t-01-01.json");
const before = {
  figure: "bar-join",
  body: "Three groups can join into one total. Add two of them first, then join the third — the answer is the same however you start.",
  narration: "Three groups can join into one total. Add two of them first, then join the third — the answer is the same however you start.",
};
const after = {
  figure: "bar-join",
  body: "The bar model shows 7 + 5 = 12. When adding three groups, join two parts first, then add the third group.",
  narration: "The bar model shows 7 + 5 = 12. When adding three groups, join two parts first, then add the third group.",
};

const lesson = JSON.parse(readFileSync(path, "utf8"));
const concept = lesson.steps.find((step) => step.id === "c1" && step.kind === "concept");
if (!concept) throw new Error("S292 add-three-numbers-g1 visual repair: g1t-01-01/c1 is missing");
const matches = (expected) => Object.entries(expected).every(([key, value]) => concept[key] === value);

if (matches(after)) {
  console.log("S292 add-three-numbers-g1 visual repair: already current");
} else {
  if (!matches(before)) throw new Error("S292 add-three-numbers-g1 visual repair: guarded source payload drifted");
  Object.assign(concept, after);
  writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
  console.log("S292 add-three-numbers-g1 visual repair: updated g1t-01-01/c1");
}
