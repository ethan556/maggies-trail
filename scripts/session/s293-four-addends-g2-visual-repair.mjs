import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const path = join(process.cwd(), "content", "courses", "four-addends-g2", "lessons", "g2n-03-02.json");
const before = {
  figure: "add-balance-scale",
  body: "The check works because regrouping cannot change a sum: if two honest paths disagree, one of them miscounted, and you get to find out now.",
  narration: "The check works because regrouping cannot change a sum: if two honest paths disagree, one of them miscounted, and you get to find out now.",
};
const after = {
  figure: "add-balance-scale",
  body: "The balance shows 6 + 4 = 10: both sides name the same amount. When adding four addends, regrouping does not change the total, so two correct paths agree.",
  narration: "The balance shows 6 + 4 = 10: both sides name the same amount. When adding four addends, regrouping does not change the total, so two correct paths agree.",
};

const lesson = JSON.parse(readFileSync(path, "utf8"));
const concept = lesson.steps.find((step) => step.id === "c2" && step.kind === "concept");
if (!concept) throw new Error("S293 four-addends-g2 visual repair: g2n-03-02/c2 is missing");
const matches = (expected) => Object.entries(expected).every(([key, value]) => concept[key] === value);

if (matches(after)) {
  console.log("S293 four-addends-g2 visual repair: already current");
} else {
  if (!matches(before)) throw new Error("S293 four-addends-g2 visual repair: guarded source payload drifted");
  Object.assign(concept, after);
  writeFileSync(path, `${JSON.stringify(lesson, null, 2)}\n`);
  console.log("S293 four-addends-g2 visual repair: updated g2n-03-02/c2");
}
