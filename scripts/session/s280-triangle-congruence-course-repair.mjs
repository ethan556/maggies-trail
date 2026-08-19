import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/triangle-congruence/lessons";
const targets = new Map([
  ["tc-01-02:i2", {
    prompt: "Two triangles have all three pairs of angles equal.",
    labels: [
      "They are similar, not necessarily congruent",
      "They are congruent, not merely similar",
      "They have the same side lengths",
      "No relationship follows from equal angles",
    ],
  }],
  ["tc-01-03:ch", {
    prompt: "Segments AC and BD cross at P",
    labels: [
      "SAS: sides with their included angle",
      "SSS: three equal side pairs",
      "ASA: angles with included side",
      "AAS: angles with nonincluded side",
    ],
  }],
  ["tc-01-03:i2", {
    prompt: "Two triangles share a side.",
    labels: [
      "ASA: angles with their included side",
      "SSS: three equal side pairs",
      "SAS: two equal sides and an angle",
      "SSA: two equal sides and an angle",
    ],
  }],
  ["tc-02-01:i2", {
    prompt: "Once the second leg is recovered",
    labels: [
      "SAS: legs with their included angle",
      "ASA: two angles and one side",
      "SSS: three equal side pairs",
      "AAA: three equal angle pairs",
    ],
  }],
  ["tc-02-02:ch", {
    prompt: "To prove two segments in a figure are equal",
    labels: [
      "Prove triangles congruent, then use CPCTC",
      "Measure the target segments in the figure",
      "Assume the target segments are equal first",
      "Show the target segments are parallel first",
    ],
  }],
  ["tc-02-03:i3", {
    prompt: "Your goal is to prove ∠1 = ∠2",
    labels: [
      "Which triangles contain the target angles?",
      "What are the target angle measures?",
      "Are the target angles acute or obtuse?",
      "How large is the whole diagram?",
    ],
  }],
  ["tc-02-03:k2", {
    prompt: "In a two-congruence proof",
    labels: [
      "A CPCTC result supplies the next proof",
      "The second proof ignores the first proof",
      "Both proofs use the same criterion",
      "The same pair of triangles is reused",
    ],
  }],
  ["tc-03-02:i1", {
    prompt: "The Base Angles Theorem says",
    labels: [
      "Equal base angles imply equal legs",
      "Unequal base angles imply unequal legs",
      "Equal legs imply equal base angles",
      "All three triangle angles are equal",
    ],
  }],
  ["tc-05-02:k1", {
    prompt: "In the hinge theorem",
    labels: [
      "A wider included angle separates the endpoints",
      "The two fixed sides become longer",
      "The triangle keeps the same area",
      "The third side is always longest",
    ],
  }],
  ["tc-05-03:i1", {
    prompt: "In a single triangle, the largest side",
    labels: [
      "Angle A, opposite side a = 10",
      "Angle B, opposite side b = 7",
      "Angle C, opposite side c = 5",
      "All three angles are equal",
    ],
  }],
  ["tc-05-03:i3", {
    prompt: "You want to prove that side XY is longer",
    labels: [
      "The larger angle faces the longer side",
      "Use the hinge theorem between two triangles",
      "Use SAS congruence to compare lengths",
      "Use the midsegment theorem to compare sides",
    ],
  }],
]);

const lessonIds = new Set([...targets.keys()].map((key) => key.split(":")[0]));
let labelChanges = 0;
let seen = 0;
for (const lessonId of lessonIds) {
  const file = path.join(dir, `${lessonId}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const indent = raw.match(/\n( +)"/)?.[1].length ?? 2;
  const lesson = JSON.parse(raw);
  let changed = false;
  for (const step of lesson.steps ?? []) {
    const key = `${lesson.id}:${step.id}`;
    const target = targets.get(key);
    if (!target) continue;
    seen += 1;
    if (step.widget?.type !== "mcq" || !step.widget.prompt.includes(target.prompt)) {
      throw new Error(`${key} no longer has the expected choice contract`);
    }
    if (!Array.isArray(step.widget.options) || step.widget.options.length !== target.labels.length) {
      throw new Error(`${key} no longer has four options`);
    }
    for (const [index, option] of step.widget.options.entries()) {
      if (option.id !== `o${index + 1}` || option.correct !== (index === 0)) {
        throw new Error(`${key} changed stable option identity or evaluator truth`);
      }
      if (option.label !== target.labels[index]) {
        option.label = target.labels[index];
        changed = true;
        labelChanges += 1;
      }
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(lesson, null, indent)}\n`);
}

if (seen !== targets.size) throw new Error(`expected ${targets.size} choice dispositions, found ${seen}`);
if (![0, targets.size * 4].includes(labelChanges)) {
  throw new Error(`expected 0 or ${targets.size * 4} option-label changes, got ${labelChanges}`);
}
console.log(`S280 triangle-congruence: ${targets.size} choice surfaces repaired with ${labelChanges} parallel labels`);
