import fs from "node:fs";
import path from "node:path";

const lessonFile = path.join("content", "courses", "lines-angles", "lessons", "la-04-02.json");
const source = fs.readFileSync(lessonFile, "utf8");
const lesson = JSON.parse(source);
const regular = lesson.steps?.find((step) => step.id === "c1");
const rectangle = lesson.steps?.find((step) => step.id === "c2");

if (!regular || regular.kind !== "concept" || regular.figure !== "la-symmetry-regular") {
  throw new Error("la-04-02/c1 must retain the exact regular-shape visual");
}
if (!regular.body?.includes("regular shape") || !regular.body?.includes("symmetry lines")) {
  throw new Error("la-04-02/c1 lost its regular-shape contract");
}
if (!rectangle || rectangle.kind !== "concept") throw new Error("la-04-02/c2 is missing");
for (const fragment of ["rectangle (unequal sides)", "only **2**", "diagonals do NOT"]) {
  if (!rectangle.body?.includes(fragment)) throw new Error(`la-04-02/c2 lost its rectangle-symmetry contract: ${fragment}`);
}

if (rectangle.figure !== undefined) {
  if (rectangle.figure !== "la-symmetry-regular") {
    throw new Error("la-04-02/c2 has an unexpected visual; refusing to remove an unreviewed binding");
  }
  delete rectangle.figure;
  const indent = source.match(/\n( +)"/)?.[1].length || 2;
  fs.writeFileSync(lessonFile, `${JSON.stringify(lesson, null, indent)}\n`);
}

console.log("S278 lines-angles: mismatched regular-shape visual fail-closed from rectangle symmetry explanation");
