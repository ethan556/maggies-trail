/** S291 — source-local transformations-measurement figure truth and MCQ parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "transformations-measurement", "lessons");
const CHECK = process.argv.includes("--check");
const withholds = [
  ["tm-03-03", "c1", "angle-types"],
  ["tm-04-02", "c2", "tm-missing-leg"],
  ["tm-05-02", "c2", "tm-cone-volume"],
  ["tm-05-03", "c2", "tm-sphere-volume"],
];
const retained = ["tm-03-02", "c2", "la-triangle-sum", "This works even for right triangles. A right triangle has one 90° angle, so the other two must add to 90°. If one of them is 35°, the last is 90 − 35 = 55°."];
const choices = [
  ["tm-01-01", "k2", { a: "Only its position changes; its size and shape stay fixed", b: "Its size gets bigger while the rest stays the same", c: "It gets flipped across a line instead of simply sliding", d: "It gets turned around a point instead of simply sliding" }],
  ["tm-02-01", "k1", { a: "All matching side lengths and matching angles are equal", b: "Only their matching angles are equal, not their sides", c: "Only their areas are equal, not their side lengths", d: "They must share the same color and orientation" }],
  ["tm-05-03", "i2", { a: "It uses radius cubed, r³, instead of radius squared", b: "It omits π even though the other volume formulas use it", c: "It removes fractions from the volume calculation entirely", d: "It uses diameter rather than radius in the volume formula" }],
];
const byLesson = new Map();
for (const [lesson, stepId, figure] of withholds) (byLesson.get(lesson) ?? byLesson.set(lesson, []).get(lesson)).push({ kind: "figure", stepId, figure });
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
    const ids = step.widget.options.map((option) => option.id).sort().join("|");
    if (ids !== "a|b|c|d") throw new Error(`${lessonId}/${repair.stepId}: option IDs drifted (${ids})`);
    for (const option of step.widget.options) if (option.label !== repair.labels[option.id]) { option.label = repair.labels[option.id]; repaired += 1; changed = true; }
  }
  if (changed && CHECK) throw new Error(`${lessonId}: repair required in --check mode`);
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const rendered = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  if (changed) await writeFile(file, rendered, "utf8");
  packet.push(`${path.basename(file)}\0${changed ? rendered : before}`);
}
const retainedStep = JSON.parse(await readFile(path.join(DIR, `${retained[0]}.json`), "utf8")).steps.find((step) => step.id === retained[1]);
if (!retainedStep || retainedStep.figure !== retained[2] || retainedStep.body !== retained[3]) throw new Error("tm-03-02/c2: exact triangle-sum figure alignment drifted");
if (repaired > withholds.length + choices.length * 4) throw new Error(`repair count exceeded contract: ${repaired}`);
console.log(JSON.stringify({ course: "transformations-measurement", sourceRows: withholds.length + 1 + choices.length, figureWithholds: withholds.length, figureVerified: 1, choiceRows: choices.length, repaired, current: repaired === 0, packetSeal: createHash("sha256").update(packet.join("\n")).digest("hex") }, null, 2));
