/** S267 — Shapes & Sorting K: distinct transfer challenge jobs. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "shapes-and-sorting-k", "lessons");

const replacements = Object.freeze({
  "ks-01-01": {
    body: "Turn it and name it.",
    widget: {
      type: "mcq", prompt: "A honeycomb shape is turned on its side. It still has 6 straight sides. What is it still called?",
      options: [
        { id: "a", label: "A triangle", feedback: "A triangle has 3 sides. Turning never changes 6 sides into 3." },
        { id: "b", label: "A hexagon", correct: true, feedback: "Yes — 6 sides makes a hexagon, even when it is turned." },
        { id: "c", label: "A circle", feedback: "A circle has no straight sides. This shape still has 6." },
        { id: "d", label: "A square", feedback: "A square has 4 sides. This one still has 6, so it is a hexagon." },
      ],
    },
  },
  "ks-01-02": {
    body: "Match the changed pictures.",
    widget: {
      type: "matchPairs", prompt: "Match each turned or resized picture to its shape name.",
      left: [
        { id: "l1", label: "a square turned like a diamond" },
        { id: "l2", label: "a tiny circle" },
        { id: "l3", label: "a triangle pointing down" },
      ],
      right: [
        { id: "r1", label: "square" }, { id: "r2", label: "circle" }, { id: "r3", label: "triangle" },
      ],
      pairs: { l1: "r1", l2: "r2", l3: "r3" },
      pairErrors: [{ left: "l1", right: "r3", feedback: "Turning a square does not change its 4 equal sides." }],
      missFeedback: "Look at sides and corners. Turning and size do not change a shape's name.",
      successFeedback: "Yes — same sides and corners, same shape name!",
    },
  },
  "ks-01-03": {
    body: "Sort by where each friend is.",
    widget: {
      type: "dragBucket", prompt: "Put each friend where it is compared with the tree.",
      buckets: [{ id: "above", label: "Above the tree" }, { id: "below", label: "Below the tree" }, { id: "beside", label: "Beside the tree" }],
      items: [
        { id: "d1", label: "a bird on top of the tree", bucketId: "above", feedback: "On top means above." },
        { id: "d2", label: "a rabbit under the tree", bucketId: "below", feedback: "Under means below." },
        { id: "d3", label: "a kite next to the tree", bucketId: "beside", feedback: "Next to means beside." },
      ],
      missFeedback: "Read the location word: on top, under, or next to.",
      successFeedback: "Sorted! Above, below, and beside each tell a different place.",
    },
  },
  "ks-02-01": {
    body: "Name a solid in a new position.",
    widget: {
      type: "mcq", prompt: "An ice-cream shape lies on its side. It has a point at one end and a round bottom. Which solid is it?",
      options: [
        { id: "a", label: "A cylinder", feedback: "A cylinder has two flat round ends and no point." },
        { id: "b", label: "A cube", feedback: "A cube is boxy with flat square faces, not a point." },
        { id: "c", label: "A cone", correct: true, feedback: "Yes — a cone keeps its point and round bottom even on its side." },
        { id: "d", label: "A sphere", feedback: "A sphere is round all over and has no point." },
      ],
    },
  },
  "ks-02-03": {
    body: "Sort the builds by what they make.",
    widget: {
      type: "dragBucket", prompt: "Put each set of pieces under the shape it can build.",
      buckets: [{ id: "square", label: "Makes a square" }, { id: "rectangle", label: "Makes a rectangle" }, { id: "cube", label: "Makes a cube" }],
      items: [
        { id: "d1", label: "two same-size triangles joined on their long sides", bucketId: "square", feedback: "Those triangles can make a square." },
        { id: "d2", label: "three same-size squares in one row", bucketId: "rectangle", feedback: "A row gets longer than it is tall, making a rectangle." },
        { id: "d3", label: "six square faces folded into a closed box", bucketId: "cube", feedback: "Six square faces can wrap around to make a cube." },
      ],
      missFeedback: "Think about the outside edge of each finished build.",
      successFeedback: "Yes — small shapes can be joined to build new shapes!",
    },
  },
  "ks-03-02": {
    body: "Sort the weight clues.",
    widget: {
      type: "dragBucket", prompt: "Put each seesaw clue in the right group.",
      buckets: [{ id: "heavier", label: "Heavier" }, { id: "lighter", label: "Lighter" }, { id: "same", label: "Same weight" }],
      items: [
        { id: "d1", label: "the rock's side goes down", bucketId: "heavier", feedback: "The down side is heavier." },
        { id: "d2", label: "the balloon's side goes up", bucketId: "lighter", feedback: "The up side is lighter." },
        { id: "d3", label: "two bags keep the seesaw level", bucketId: "same", feedback: "Level means the weights are the same." },
      ],
      missFeedback: "Down means heavier, up means lighter, and level means the same.",
      successFeedback: "Right — the seesaw gives a clue about every weight.",
    },
  },
  "ks-03-03": {
    body: "Match the sorting rule to the right group.",
    widget: {
      type: "matchPairs", prompt: "Match each item and sorting rule to its group.",
      left: [
        { id: "l1", label: "a red apple, sorted by color" },
        { id: "l2", label: "a red apple, sorted by kind" },
        { id: "l3", label: "a toy car, sorted by kind" },
      ],
      right: [{ id: "r1", label: "red group" }, { id: "r2", label: "food group" }, { id: "r3", label: "things that drive" }],
      pairs: { l1: "r1", l2: "r2", l3: "r3" },
      pairErrors: [{ left: "l2", right: "r1", feedback: "That would work for color. Here the rule is kind, so an apple goes with food." }],
      missFeedback: "Read the sorting rule before choosing the group.",
      successFeedback: "Great sorting — the same item can move when the rule changes!",
    },
  },
});

let repaired = 0;
for (const [lessonId, replacement] of Object.entries(replacements)) {
  const source = path.join(lessonDir, `${lessonId}.json`);
  const lesson = JSON.parse(await readFile(source, "utf8"));
  const step = lesson.steps.find((candidate) => candidate.id === "ch1");
  if (!step) throw new Error(`${lessonId}: missing ch1`);
  if (JSON.stringify(step.widget) !== JSON.stringify(replacement.widget)) {
    if (!step.widget || !["tapDiagram", "mcq"].includes(step.widget.type)) throw new Error(`${lessonId}: unexpected existing challenge`);
    step.body = replacement.body;
    step.widget = replacement.widget;
    repaired += 1;
  }
  await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}

if (repaired > Object.keys(replacements).length) throw new Error(`guard failed: ${repaired}`);
console.log(JSON.stringify({ course: "shapes-and-sorting-k", repaired, expected: Object.keys(replacements).length, idempotent: repaired === 0 }, null, 2));
