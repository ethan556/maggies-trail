/** S290 — source-local proportional-relationships figure truth and MCQ parity repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "content", "courses", "proportional-relationships", "lessons");
const CHECK = process.argv.includes("--check");
const withholds = [
  ["pr-01-02", "c1", "fraction-unit-rate"],
  ["pr-02-02", "c3", "pr-y-equals-kx"],
  ["pr-03b-01", "c1", "pr-y-equals-kx"],
  ["pr-04-01", "c3", "pr-percent-shortcut"],
  ["pr-04-02", "c1", "percent-price"],
];
const retained = ["pr-04-02", "c2", "pr-markdown", "A markdown SUBTRACTS a percent instead. An $80 jacket at 5% off: 5% of $80 is $4, so the sale price is $80 − $4 = $76."];
const labels = {
  a: "It rises from $8 to $11, so the charge is less than double",
  b: "It doubles from $8 to $16 because both parts double with the order",
  c: "It stays at $8 because the fee controls the whole charge",
  d: "It rises from $8 to $13 because the percentage doubles twice",
};
const byLesson = new Map();
for (const [lesson, stepId, figure] of withholds) (byLesson.get(lesson) ?? byLesson.set(lesson, []).get(lesson)).push({ kind: "figure", stepId, figure });
byLesson.set("pr-04b-02", [...(byLesson.get("pr-04b-02") ?? []), { kind: "mcq", stepId: "k3", labels }]);
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
if (!retainedStep || retainedStep.figure !== retained[2] || retainedStep.body !== retained[3]) throw new Error("pr-04-02/c2: exact markdown figure alignment drifted");
if (repaired > withholds.length + 4) throw new Error(`repair count exceeded contract: ${repaired}`);
console.log(JSON.stringify({ course: "proportional-relationships", sourceRows: withholds.length + 2, figureWithholds: withholds.length, figureVerified: 1, choiceRows: 1, repaired, current: repaired === 0, packetSeal: createHash("sha256").update(packet.join("\n")).digest("hex") }, null, 2));
