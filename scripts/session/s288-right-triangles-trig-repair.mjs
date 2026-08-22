/** S288 — course-local figure fail-close and MCQ parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "right-triangles-trig", "lessons");
const CHECK = process.argv.includes("--check");
const figures = [
  ["rt-01-04", "c1", "special-right-triangles"],
  ["rt-03-01", "c1", "solve-right-triangle"],
  ["rt-03-02", "c2", "sohcahtoa-triangle"],
  ["rt-03-03", "c1", "solve-right-triangle"],
  ["rt-04-03", "c2", "solve-right-triangle"],
];
const choices = [
  ["rt-01-04", "i2", { o1: "Divide by √3 for the short leg, then double to reach the hypotenuse", o2: "Divide by √3, then stop at the short leg", o3: "Double the long leg before finding the short leg", o4: "Add the legs before identifying the hypotenuse" }],
  ["rt-04-01", "i1", { o1: "The horizontal at the observer's eye and the line of sight down to the boat", o2: "The vertical cliff face and the line of sight down to the boat", o3: "The sea surface at the base and the vertical cliff face", o4: "The line of sight and the vertical drop below the observer" }],
  ["rt-04-01", "k2", { o1: "15° — alternate interior angles across the parallel horizontals", o2: "75° — the complement measured from the vertical cliff face", o3: "165° — the supplement along one straight line", o4: "It changes with the height and distance of the cliff" }],
  ["rt-04-02", "i1", { o1: "The roof height above your eye — add 1.6 m for the full building", o2: "The full building height from ground to roof, including eye level", o3: "The diagonal line-of-sight length from your eye to the roof", o4: "The vertical height after subtracting the 40 m ground distance" }],
  ["rt-04-03", "i1", { o1: "Draw the triangle and label each side's role from the given angle", o2: "Use the calculator first to choose a trig ratio", o3: "Guess the operation before labeling any triangle sides", o4: "Convert the degree angle to radians before drawing" }],
  ["rt-05-03", "k3", { o1: "Law of Cosines for a known SAS triangle", o2: "Law of Sines for a known SAS triangle", o3: "SOH-CAH-TOA for a known SAS triangle", o4: "Pythagoras for a known SAS triangle" }],
  ["rt-05-04", "i1", { o1: "Law of Sines — 21 and 48° make a matched opposite pair", o2: "Law of Cosines — the two stated angles choose it", o3: "SOH-CAH-TOA — the stated angles make a right triangle", o4: "Pythagorean theorem — the 21-length side is given" }],
];
const byLesson = new Map();
for (const [lesson, stepId, figure] of figures) (byLesson.get(lesson) ?? byLesson.set(lesson, []).get(lesson)).push({ kind: "figure", stepId, figure });
for (const [lesson, stepId, labels] of choices) (byLesson.get(lesson) ?? byLesson.set(lesson, []).get(lesson)).push({ kind: "mcq", stepId, labels });
let repaired = 0;
const packet = [];
for (const [lessonId, repairs] of byLesson) {
  const file = path.join(DIR, `${lessonId}.json`);
  const before = await readFile(file, "utf8");
  const lesson = JSON.parse(before);
  let changed = false;
  for (const repair of repairs) {
    const step = lesson.steps.find((candidate) => candidate.id === repair.stepId);
    if (!step) throw new Error(`${lessonId}/${repair.stepId}: missing step`);
    if (repair.kind === "figure") {
      if (step.figure === repair.figure) { delete step.figure; repaired += 1; changed = true; }
      else if (Object.hasOwn(step, "figure")) throw new Error(`${lessonId}/${repair.stepId}: unexpected figure binding ${step.figure}`);
      continue;
    }
    if (step.widget?.type !== "mcq" || !Array.isArray(step.widget.options)) throw new Error(`${lessonId}/${repair.stepId}: expected MCQ`);
    const actual = step.widget.options.map((option) => option.id).sort().join("|");
    const expected = Object.keys(repair.labels).sort().join("|");
    if (actual !== expected) throw new Error(`${lessonId}/${repair.stepId}: option IDs drifted (${actual})`);
    for (const option of step.widget.options) if (option.label !== repair.labels[option.id]) { option.label = repair.labels[option.id]; repaired += 1; changed = true; }
  }
  if (changed && CHECK) throw new Error(`${lessonId}: repair required in --check mode`);
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const rendered = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  if (changed) await writeFile(file, rendered, "utf8");
  packet.push(`${path.basename(file)}\0${changed ? rendered : before}`);
}
if (repaired > figures.length + choices.length * 4) throw new Error(`repair count exceeded contract: ${repaired}`);
console.log(JSON.stringify({ course: "right-triangles-trig", sourceRows: figures.length + choices.length, figureWithholds: figures.length, choiceRows: choices.length, repaired, current: repaired === 0, packetSeal: createHash("sha256").update(packet.join("\n")).digest("hex") }, null, 2));