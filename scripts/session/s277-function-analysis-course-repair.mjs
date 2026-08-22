import fs from "node:fs";
import path from "node:path";

const lessonFile = path.join("content", "courses", "function-analysis", "lessons", "fna-05-03.json");
const source = fs.readFileSync(lessonFile, "utf8");
const lesson = JSON.parse(source);
const concept = lesson.steps?.find((step) => step.id === "c1");

if (!concept || concept.kind !== "concept") throw new Error("fna-05-03/c1 is missing");
for (const fragment of ["f(g(x)) = x", "g(f(x)) = x", "right domains"]) {
  if (!concept.body?.includes(fragment)) throw new Error(`fna-05-03/c1 lost its inverse-proof contract: ${fragment}`);
}

if (concept.figure !== undefined) {
  if (concept.figure !== "fna-inverse-reflection") {
    throw new Error("fna-05-03/c1 has an unexpected visual; refusing to remove an unreviewed binding");
  }
  delete concept.figure;
  const indent = source.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(lessonFile, `${JSON.stringify(lesson, null, indent)}\n`);
}

console.log("S277 function-analysis: mismatched fixed inverse-reflection visual fail-closed");
