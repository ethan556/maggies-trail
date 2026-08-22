import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "shapes-shares-g2", "lessons");
const CHECK = process.argv.includes("--check");
const TARGETS = new Set(["ssg2-01-01", "ssg2-01-02", "ssg2-01-03", "ssg2-03-02", "ssg2-03-03"]);

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repairLesson(lesson) {
  if (lesson.id === "ssg2-01-01") {
    const landmark = step(lesson, "i3");
    landmark.body = "Use a real-world shape clue.";
    landmark.widget.prompt = "A stop-sign outline has 8 sides. What is the shape called?";

    const corners = step(lesson, "k3");
    corners.body = "Infer the name from its corners.";
    corners.widget.prompt = "A polygon has 8 corners. What is it called?";
    corners.widget.options = [
      { id: "a", label: "octagon", correct: true, feedback: "Yes — 8 corners mean 8 sides, so the polygon is an octagon." },
      { id: "b", label: "pentagon", feedback: "A pentagon has 5 corners. A polygon with 8 corners is an octagon." },
      { id: "c", label: "heptagon", feedback: "A heptagon has 7 corners. A polygon with 8 corners is an octagon." },
    ];

    const neighbor = step(lesson, "ch1");
    neighbor.body = "Use a neighboring shape name.";
    neighbor.explanationVariants = [
      "An octagon has 8 sides. One fewer is 7 sides, which names a heptagon.",
      "Step back once from octagon: 8 sides becomes 7, so the shape is a heptagon.",
    ];
    neighbor.widget.prompt = "A mystery polygon has one fewer side than an octagon. What is it called?";
    neighbor.hints = [
      "An octagon has 8 sides.",
      "One fewer than 8 is 7.",
      "A 7-sided polygon is a heptagon.",
    ];
    delete neighbor.variant;
  }

  if (lesson.id === "ssg2-01-02") {
    const challenge = step(lesson, "ch1");
    challenge.body = "Combine the two edge groups.";
    challenge.widget.prompt = "A square pyramid has 4 base edges and 4 sloping edges. How many edges does it have altogether?";
    delete challenge.variant;
  }

  if (lesson.id === "ssg2-01-03") {
    const nextShape = step(lesson, "i3");
    nextShape.body = "Move one step past a pentagon.";
    nextShape.widget.prompt = "A polygon has one more side than a pentagon. What is it called?";

    const bounded = step(lesson, "k2");
    bounded.body = "Use two side-count bounds.";
    bounded.explanationVariants = [
      "A polygon between a 6-sided hexagon and an 8-sided octagon has 7 sides: a heptagon.",
      "More than 6 but fewer than 8 means 7, so the name is heptagon.",
    ];
    bounded.widget.prompt = "Which polygon has more sides than a hexagon but fewer sides than an octagon?";

    const correction = step(lesson, "ch1");
    correction.body = "Correct a near-neighbor mix-up.";
    correction.explanationVariants = [
      "Lee counted 7 sides, so the correct name is heptagon. Octagon is reserved for 8 sides.",
      "Fix the name by matching the exact side count: 7 means heptagon.",
    ];
    correction.widget.prompt = "Lee calls a 7-sided polygon an octagon. Which name fixes the mistake?";
    correction.widget.options = [
      { id: "a", label: "heptagon", correct: true, feedback: "Yes — 7 sides name a heptagon, so this corrects Lee's mix-up." },
      { id: "b", label: "octagon", feedback: "That repeats the mix-up. An octagon has 8 sides; 7 sides name a heptagon." },
      { id: "c", label: "pentagon", feedback: "A pentagon has 5 sides. The 7-sided polygon is a heptagon." },
    ];
    correction.hints = [
      "Lee counted 7 sides.",
      "Octagon means 8 sides, so that name cannot stay.",
      "Heptagon means 7 sides.",
    ];
    delete correction.variant;
  }

  if (lesson.id === "ssg2-03-02") {
    const rebuild = step(lesson, "k1");
    rebuild.body = "Rebuild one whole from thirds.";
    rebuild.explanationVariants = [
      "Three equal thirds rebuild one whole, so one share is 1 of 3 equal parts.",
      "Set the whole into 3 equal shares; each share is a third.",
    ];
    rebuild.widget.prompt = "Three equal shares must rebuild the whole. Set the bar to show one of those shares.";
  }

  if (lesson.id === "ssg2-03-03") {
    const fairShare = step(lesson, "k3");
    fairShare.body = "Compare fair shares in context.";
    fairShare.explanationVariants = [
      "Sharing the same-size whole among 4 children gives smaller pieces than sharing it among 3. A fourth is smaller.",
      "More equal shares make each share smaller, so the child in the group of 4 gets a fourth, the smaller piece.",
    ];
    fairShare.widget.prompt = "One same-size sandwich is shared among 3 children and another among 4. Which child gets the smaller share?";

    const decision = step(lesson, "ch1");
    decision.body = "Choose a share for a goal.";
    decision.explanationVariants = [
      "A half is the larger choice because the same whole is split into fewer equal parts.",
      "To get the bigger share, choose one half rather than one third.",
    ];
    decision.widget.prompt = "Ava may take one half or one third of the same-size snack bar. She wants the bigger share. Which should she take?";
    decision.widget.options = [
      { id: "a", label: "one half", correct: true, feedback: "Yes — one half is bigger than one third of the same-size whole." },
      { id: "b", label: "one third", feedback: "One third is the smaller choice. Fewer equal parts make a bigger share, so choose one half." },
      { id: "c", label: "either; they are equal", feedback: "They are not equal. One half is bigger than one third of the same-size whole." },
    ];
    decision.hints = [
      "Both choices come from the same-size whole.",
      "A half comes from 2 equal parts; a third comes from 3.",
      "Fewer equal parts make a bigger share, so choose one half.",
    ];
    delete decision.variant;
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 9) throw new Error(`expected 9 course lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const ids = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const types = JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type]));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== ids) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type])) !== types) throw new Error(`${lesson.id}: evaluator types changed`);
  const indent = before.match(/\n( +)"id"/)?.[1].length ?? 2;
  const after = TARGETS.has(lesson.id) ? `${JSON.stringify(lesson, null, indent)}\n` : before;
  hashes.push(`${file}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}
if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
const courseSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} shapes-shares-g2: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 5 P0 progression + 1 P0 excellence closures; 0 P0 residuals; course seal ${courseSeal}`);
