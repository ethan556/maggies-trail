import fs from "node:fs";
import path from "node:path";

const lessonFile = path.join("content", "courses", "differential-equations", "lessons", "de-02-01.json");
const source = fs.readFileSync(lessonFile, "utf8");
const lesson = JSON.parse(source);
const concept = lesson.steps?.find((step) => step.id === "c1");

if (!concept || concept.kind !== "concept") throw new Error("de-02-01/c1 is missing");
for (const fragment of ["dy/dx = 2xy", "(1/y) dy = 2x dx", "ln|y| = x² + C"]) {
  if (!concept.body?.includes(fragment)) throw new Error(`de-02-01/c1 lost its separation contract: ${fragment}`);
}

if (concept.figure !== undefined) {
  if (concept.figure !== "dr-chain-gears") {
    throw new Error("de-02-01/c1 has an unexpected visual; refusing to remove an unreviewed binding");
  }
  delete concept.figure;
  const indent = source.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(lessonFile, `${JSON.stringify(lesson, null, indent)}\n`);
}

console.log("S276 differential-equations: mismatched fixed chain-rule gear visual fail-closed");
