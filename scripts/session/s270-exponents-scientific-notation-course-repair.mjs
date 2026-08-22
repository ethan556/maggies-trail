import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/exponents-scientific-notation/lessons";

// Fixed-number figures may not silently stand in for a differently numbered
// worked example. Eight queue-listed slots therefore fail closed. The ninth
// is deliberately retained: exponent-repeat uses the exact generic a³·a²=a⁵
// factor-counting relationship stated in its adjacent copy.
const dispositions = new Map([
  ["esn-01-01:c2", { kind: "withhold", source: "esn-power-meaning" }],
  ["esn-01-02:c2", { kind: "withhold", source: "esn-exponent-rules" }],
  ["esn-01b-01:c1", { kind: "retain", source: "exponent-repeat" }],
  ["esn-02-01:c2", { kind: "withhold", source: "esn-square-root" }],
  ["esn-03-02:c1", { kind: "withhold", source: "esn-sci-small" }],
  ["esn-03-02:c2", { kind: "withhold", source: "esn-sci-small" }],
  ["esn-04-01:c2", { kind: "withhold", source: "esn-multiply-sci" }],
  ["esn-04-02:c2", { kind: "withhold", source: "esn-add-sci" }],
  ["esn-04-03:c2", { kind: "withhold", source: "esn-add-sci" }],
]);

const lessonIds = new Set([...dispositions.keys()].map((key) => key.split(":")[0]));
let figureChanges = 0;
let seen = 0;
for (const lessonId of lessonIds) {
  const file = path.join(dir, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const step of lesson.steps ?? []) {
    const key = `${lesson.id}:${step.id}`;
    const disposition = dispositions.get(key);
    if (!disposition) continue;
    seen += 1;
    if (disposition.kind === "retain") {
      if (step.figure !== disposition.source) {
        throw new Error(`${key} must retain exact generic ${disposition.source}, got ${JSON.stringify(step.figure)}`);
      }
      continue;
    }
    if (step.figure === undefined) continue;
    if (step.figure !== disposition.source) {
      throw new Error(`${key} has unexpected figure ${JSON.stringify(step.figure)}`);
    }
    delete step.figure;
    changed = true;
    figureChanges += 1;
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (seen !== dispositions.size) throw new Error(`expected ${dispositions.size} dispositions, found ${seen}`);
if (![0, 8].includes(figureChanges)) throw new Error(`expected 0 or 8 figure changes, got ${figureChanges}`);
console.log("S270 exponents-scientific-notation: 8 fixed-example fail-closures + 1 exact generic retention sealed");
