/** S285 — source-local Circle Theorems MCQ choice and progression repair. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LESSON_DIR = path.join(ROOT, "content", "courses", "circle-theorems", "lessons");
const CHECK = process.argv.includes("--check");

const MCQS = Object.freeze([
  ["cr-01-03", "i2", { o1: "A circle through the nails, because the corner makes a right angle", o2: "A line through the nails, because its distance stays fixed", o3: "An ellipse through the nails, because the distance sum stays fixed", o4: "A parabola through the nails, because the corner moves evenly" }],
  ["cr-02-02", "k3", { o1: "Draw two rim chords and intersect their perpendicular bisectors", o2: "Draw two rim chords and intersect their two midpoints", o3: "Find the longest rim chord and use only its midpoint", o4: "Extend the rim arc until it looks like a complete circle" }],
  ["cr-04-01", "i1", { o1: "The same intercepted arcs are weighted by the vertex location", o2: "Each formula describes a different kind of circle", o3: "Only central angles depend on the intercepted arc", o4: "An arc has one angle measure from every viewpoint" }],
  ["cr-04-01", "k3", { o1: "Half the difference of the far and near intercepted arcs", o2: "Half the sum of the two intercepted arcs", o3: "The full measure of the farther intercepted arc", o4: "Half the measure of the nearer intercepted arc" }],
  ["cr-04-02", "i2", { o1: "A tangent is a limiting chord, so the half-arc rule remains", o2: "A tangent is longer, so its angle uses a different arc", o3: "The tangent reaches the center, so its angle doubles", o4: "An inscribed angle stops using arcs at the point of tangency" }],
  ["cr-04-02", "k3", { o1: "The arc inside the angle's opening between its two sides", o2: "Always the minor arc, regardless of the angle's opening", o3: "Always the major arc, regardless of the angle's opening", o4: "The whole circle, because the tangent meets the chord once" }],
  ["cr-04-03", "i1", { o1: "Matching inscribed angles and vertical angles give AA similarity", o2: "Matching side lengths and vertical angles give SSS congruence", o3: "The center lies in both triangles, giving shared radii", o4: "Each triangle has a diameter, creating two right angles" }],
  ["cr-05-03", "k2", { o1: "Yes — each pair of opposite angles sums to 180°", o2: "No — the four angle measures are not all the same", o3: "No — each pair of adjacent angles fails to sum to 180°", o4: "Cannot tell — angle measures alone do not test cyclicity" }],
  ["cr-05-03", "k3", { o1: "A rectangle — its opposite angles always sum to 180°", o2: "Every parallelogram — its opposite angles match", o3: "Every kite — its equal sides force equal opposite angles", o4: "Every trapezoid — its parallel sides force cyclicity" }],
  ["cr-06-01", "k2", { a: "18 — 2r triples when the radius triples from 3 to 9", b: "6 — 2r stays fixed when the circle gets larger", c: "54 — 2r scales by the square of the radius change", d: "12 — 2r doubles even when the radius triples" }],
]);

const PROMPTS = Object.freeze({
  "cr-05-02": {
    k2: "A stage light covers a 72° sector of radius 10. Treat it as part of the full area; enter the lit area to 2 decimals.",
  },
});

const byLesson = new Map();
for (const entry of MCQS) {
  const list = byLesson.get(entry[0]) ?? [];
  list.push(entry);
  byLesson.set(entry[0], list);
}
for (const [lessonId, changes] of Object.entries(PROMPTS)) {
  const list = byLesson.get(lessonId) ?? [];
  for (const [stepId, prompt] of Object.entries(changes)) list.push([lessonId, stepId, prompt]);
  byLesson.set(lessonId, list);
}

let repaired = 0;
const packet = [];
for (const [lessonId, changes] of byLesson) {
  const file = path.join(LESSON_DIR, `${lessonId}.json`);
  const before = await readFile(file, "utf8");
  const lesson = JSON.parse(before);
  let changed = false;
  for (const [, stepId, value] of changes) {
    const step = lesson.steps.find((candidate) => candidate.id === stepId);
    if (!step?.widget) throw new Error(`${lessonId}/${stepId}: missing widget`);
    if (typeof value === "string") {
      if (step.widget.type !== "numeric") throw new Error(`${lessonId}/${stepId}: expected numeric widget`);
      if (step.widget.prompt !== value) {
        if (!step.widget.prompt.startsWith("Radius 10, central angle 72°")) throw new Error(`${lessonId}/${stepId}: unexpected prompt drift`);
        step.widget.prompt = value;
        repaired += 1;
        changed = true;
      }
      continue;
    }
    if (step.widget.type !== "mcq" || !Array.isArray(step.widget.options)) throw new Error(`${lessonId}/${stepId}: expected MCQ widget`);
    const optionIds = step.widget.options.map((option) => option.id).sort().join("|");
    const expectedIds = Object.keys(value).sort().join("|");
    if (optionIds !== expectedIds) throw new Error(`${lessonId}/${stepId}: option IDs drifted (${optionIds})`);
    for (const option of step.widget.options) {
      const next = value[option.id];
      if (option.label === next) continue;
      if (!String(option.label).trim()) throw new Error(`${lessonId}/${stepId}/${option.id}: blank source label`);
      option.label = next;
      repaired += 1;
      changed = true;
    }
  }
  const eol = before.includes("\r\n") ? "\r\n" : "\n";
  const rendered = `${JSON.stringify(lesson, null, 2)}\n`.replace(/\n/g, eol);
  if (changed) {
    if (CHECK) throw new Error(`${lessonId}: repair required in --check mode`);
    await writeFile(file, rendered, "utf8");
  }
  packet.push(`${path.basename(file)}\0${changed ? rendered : before}`);
}

if (repaired > MCQS.length * 4 + 1) throw new Error(`repair count exceeded contract: ${repaired}`);
const seal = createHash("sha256").update(packet.join("\n")).digest("hex");
console.log(JSON.stringify({ course: "circle-theorems", sourceRows: MCQS.length + 1, choices: MCQS.length, progression: 1, repaired, current: repaired === 0, packetSeal: seal }, null, 2));
