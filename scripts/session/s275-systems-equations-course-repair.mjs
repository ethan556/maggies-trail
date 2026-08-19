import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/systems-equations/lessons";

const substitutionFile = path.join(dir, "se-02-02.json");
const substitutionSource = fs.readFileSync(substitutionFile, "utf8");
const substitutionLesson = JSON.parse(substitutionSource);
const substitution = substitutionLesson.steps?.find((step) => step.id === "c1");
if (!substitution || substitution.kind !== "concept") throw new Error("se-02-02/c1 is missing");
if (substitution.figure !== undefined) {
  if (substitution.figure !== "coordinate-plane") {
    throw new Error("se-02-02/c1 has an unexpected figure; refusing to remove an unreviewed visual");
  }
  delete substitution.figure;
  const indent = substitutionSource.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(substitutionFile, `${JSON.stringify(substitutionLesson, null, indent)}\n`);
}

const eliminationLesson = JSON.parse(fs.readFileSync(path.join(dir, "se-03-03.json"), "utf8"));
const elimination = eliminationLesson.steps?.find((step) => step.id === "c2");
if (!elimination || elimination.figure !== "se-scale-both") throw new Error("se-03-03/c2 must retain se-scale-both");
for (const fragment of ["2x + 3y = 13", "3x + 2y = 12", "6x + 9y = 39", "6x + 4y = 24", "y = 3", "x = 2"]) {
  if (!elimination.body.includes(fragment)) throw new Error(`se-03-03/c2 is missing exact figure contract: ${fragment}`);
}

console.log("S275 systems-equations: one mismatched coordinate-plane fail-closure plus one exact scale-both retention sealed");
