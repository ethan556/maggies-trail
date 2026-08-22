/**
 * S289 — Volume & Measurement source-local progression and MCQ-parity repair.
 *
 * Applies four signed source repairs only. It preserves lesson/step IDs,
 * widget types, numeric answers, MCQ option IDs and correct-option contracts.
 * Any source drift outside the exact before/after contracts fails closed.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "volume-measurement", "lessons");
const checkOnly = process.argv.includes("--check");

const repairs = Object.freeze([
  {
    closure: "PROGRESSION-vm-03-02",
    lessonId: "vm-03-02",
    stepId: "ch1",
    widgetType: "mcq",
    before: {
      body: "A fresh box, no picture.",
      hints: ["Find one layer first: 3 × 3.", "That's 9 cubes per layer, and 2 layers.", "9 × 2 = 18."],
      explanationVariants: ["3 × 3 × 2 = 18 cubic units.", "A 9-cube layer stacked twice: 9 × 2 = 18."],
      prompt: "A box is 3 cubes long, 3 wide, and 2 tall. What is its volume?",
      answer: "a",
    },
    after: {
      body: "Diagnose a missing layer.",
      hints: ["A 3 × 3 base has 9 cubes.", "Ask how many equal bases are stacked.", "Two 9-cube layers make 18."],
      explanationVariants: ["A 3 × 3 base has 9 cubes, but two equal layers give 9 × 2 = 18 cubic units.", "The claim stopped at one layer. Two 9-cube layers make 18 cubic units."],
      prompt: "A builder says a 3 × 3 base stacked 2 layers high has volume 9. What volume should the builder report?",
      answer: "a",
    },
  },
  {
    closure: "PROGRESSION-vm-04-02/i2",
    lessonId: "vm-04-02",
    stepId: "i2",
    widgetType: "numeric",
    before: {
      body: "A long thin box.",
      prompt: "A box is 7 units long, 2 wide, and 2 tall. What is its volume in cubic units?",
      answer: 28,
      commonErrors: [
        { value: 11, feedback: "11 adds 7 + 2 + 2. Multiply: 7 × 2 × 2 = 28." },
        { value: 14, feedback: "14 is 7 × 2 — two of the three edges. One more ×2: 28." },
      ],
      fallbackFeedback: "7 × 2 × 2 = 14 × 2 = 28 cubic units.",
    },
    after: {
      body: "Extend one base through a second layer.",
      prompt: "A 7-by-2 base holds 14 cubes. A second equal layer is stacked on it. How many cubic units fill the whole box?",
      answer: 28,
      commonErrors: [
        { value: 11, feedback: "11 adds dimensions instead of counting the 14-cube base twice." },
        { value: 14, feedback: "14 is one base layer. A second equal layer makes 28." },
      ],
      fallbackFeedback: "The 7-by-2 base holds 14 cubes; two equal layers hold 14 × 2 = 28 cubic units.",
    },
  },
  {
    closure: "PROGRESSION-vm-04-02/k3",
    lessonId: "vm-04-02",
    stepId: "k3",
    widgetType: "numeric",
    before: {
      body: "Pick your own pairing.",
      prompt: "A box is 2 units long, 5 wide, and 3 tall. What is its volume in cubic units?",
      answer: 30,
      commonErrors: [
        { value: 10, feedback: "10 adds 2 + 5 + 3. Multiply the edges: 2 × 5 × 3 = 30." },
        { value: 15, feedback: "15 is 5 × 3 — only two edges. Multiply by the length: 2 × 15 = 30." },
      ],
      fallbackFeedback: "2 × 5 × 3 = 30 cubic units.",
    },
    after: {
      body: "Correct a stopped product.",
      prompt: "A student gets 15 by multiplying 5 × 3 for a 2 × 5 × 3 box, then stops. What total volume should the student report?",
      answer: 30,
      commonErrors: [
        { value: 10, feedback: "10 adds 2 + 5 + 3. Multiply the three edges instead." },
        { value: 15, feedback: "15 is 5 × 3 for two edges. Multiply by the remaining factor, 2." },
      ],
      fallbackFeedback: "Finish the product: 2 × (5 × 3) = 2 × 15 = 30 cubic units.",
    },
  },
  {
    closure: "PROGRESSION-vm-05-01",
    lessonId: "vm-05-01",
    stepId: "k3",
    widgetType: "numeric",
    before: {
      body: "Once more, from scratch.",
      prompt: "A solid is a 2 × 3 × 4 box joined to a 2 × 2 × 2 box. What is its total volume in cubic units?",
      answer: 32,
      commonErrors: [
        { value: 24, feedback: "24 is the 2 × 3 × 4 box alone. Add the cube: 24 + 8 = 32." },
        { value: 8, feedback: "8 is the 2 × 2 × 2 box alone. Add the bigger box: 24 + 8 = 32." },
      ],
      fallbackFeedback: "24 + 8 = 32 cubic units.",
    },
    after: {
      body: "Choose the operation after splitting.",
      prompt: "A student found 24 cubic units and 8 cubic units for two joined boxes, then wrote 24 × 8. What total volume should replace 24 × 8?",
      answer: 32,
      commonErrors: [
        { value: 24, feedback: "24 is the first box only. Add both non-overlapping piece volumes." },
        { value: 8, feedback: "8 is the second box only. Add both non-overlapping piece volumes." },
        { value: 192, feedback: "192 multiplies the two piece volumes. Joined, non-overlapping pieces are added: 24 + 8." },
      ],
      fallbackFeedback: "The pieces do not overlap, so add their volumes: 24 + 8 = 32 cubic units.",
    },
  },
  {
    closure: "CHOICE-0281",
    lessonId: "vm-05-02",
    stepId: "i2",
    widgetType: "mcq",
    before: {
      body: "Diagnose a wrong method.",
      prompt: "Marco computed the L's volume as 5 × 2 × 4 = 40. What went wrong?",
      answer: "a",
      options: [
        { id: "a", label: "He measured the box the L fits inside — the empty notch isn't part of the solid", correct: true, feedback: "Right — that bounding box includes the 12-cube notch above the slab's right end, which is empty air. The L itself is 28." },
        { id: "b", label: "He should have added 5 + 2 + 4 instead", feedback: "Adding edges is a different mistake — it never gives volume. Marco's real error is counting the empty notch as if it were filled." },
        { id: "c", label: "He multiplied the edges in the wrong order", feedback: "Order never changes a product. The problem is that 5 × 2 × 4 measures a full box, and the L has an empty notch inside that box." },
      ],
    },
    after: {
      body: "Diagnose a wrong method.",
      prompt: "Marco computed the L's volume as 5 × 2 × 4 = 40. What went wrong?",
      answer: "a",
      options: [
        { id: "a", label: "He counted the empty 12-cube notch by treating the L as a full 5 × 2 × 4 box.", correct: true, feedback: "Right — that bounding box includes the 12-cube notch above the slab's right end, which is empty air. The L itself is 28." },
        { id: "b", label: "He multiplied the two piece-volumes, 20 and 8, instead of adding their totals.", feedback: "Multiplying two separate volumes would also be wrong, but Marco made a different error: 5 × 2 × 4 counts a full box with an empty notch." },
        { id: "c", label: "He left out the 2 × 2 × 2 block above the slab when finding the total volume.", feedback: "The upper block is included in a full 5 × 2 × 4 bounding box. The error is counting empty space above the rest of the slab." },
      ],
    },
  },
]);

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function snapshot(step, template) {
  const widget = step.widget;
  return {
    body: step.body,
    ...(Object.hasOwn(template, "hints") ? { hints: step.hints } : {}),
    ...(Object.hasOwn(template, "explanationVariants") ? { explanationVariants: step.explanationVariants } : {}),
    prompt: widget?.prompt,
    answer: widget?.type === "mcq" ? widget.options?.find((option) => option.correct)?.id : widget?.answer,
    ...(Object.hasOwn(template, "commonErrors") ? { commonErrors: widget?.commonErrors } : {}),
    ...(Object.hasOwn(template, "fallbackFeedback") ? { fallbackFeedback: widget?.fallbackFeedback } : {}),
    ...(Object.hasOwn(template, "options") ? { options: widget?.options } : {}),
  };
}

const grouped = new Map();
for (const repair of repairs) {
  const entries = grouped.get(repair.lessonId) ?? [];
  entries.push(repair);
  grouped.set(repair.lessonId, entries);
}

let changed = 0;
for (const [lessonId, entries] of grouped) {
  const source = path.join(lessonDir, `${lessonId}.json`);
  const lesson = JSON.parse(await readFile(source, "utf8"));
  let lessonChanged = false;
  for (const repair of entries) {
    const step = lesson.steps.find((candidate) => candidate.id === repair.stepId);
    if (!step || step.widget?.type !== repair.widgetType) {
      throw new Error(`${repair.closure}: expected ${repair.widgetType} at ${repair.lessonId}/${repair.stepId}`);
    }
    const current = snapshot(step, repair.before);
    if (same(current, repair.after)) continue;
    if (!same(current, repair.before)) throw new Error(`${repair.closure}: unexpected source; refusing overwrite`);

    step.body = repair.after.body;
    if (repair.after.hints) step.hints = repair.after.hints;
    if (repair.after.explanationVariants) step.explanationVariants = repair.after.explanationVariants;
    step.widget.prompt = repair.after.prompt;
    if (repair.widgetType === "numeric") {
      if (step.widget.answer !== repair.after.answer) throw new Error(`${repair.closure}: numeric answer drifted`);
      step.widget.commonErrors = repair.after.commonErrors;
      step.widget.fallbackFeedback = repair.after.fallbackFeedback;
    } else {
      const options = step.widget.options;
      const expectedOptions = repair.after.options ?? options;
      if (!same(options.map((option) => option.id), expectedOptions.map((option) => option.id)) || !same(options.filter((option) => option.correct).map((option) => option.id), [repair.after.answer])) {
        throw new Error(`${repair.closure}: MCQ evaluator contract drifted`);
      }
      if (repair.after.options) {
        options.forEach((option, index) => {
          option.label = repair.after.options[index].label;
          option.feedback = repair.after.options[index].feedback;
        });
      }
    }
    changed += 1;
    lessonChanged = true;
  }
  if (lessonChanged && !checkOnly) await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}

if (checkOnly && changed !== 0) throw new Error(`S289 is not current: ${changed} signed repairs still need application`);
const rootCauseClosures = new Set(repairs.map((repair) => repair.closure.split("/")[0])).size;
console.log(JSON.stringify({ course: "volume-measurement", signedRootCauseClosures: rootCauseClosures, targetStepRepairs: repairs.length, changed, current: changed === 0 }, null, 2));
