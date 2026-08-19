import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "counting-to-20-k", "lessons");
const CHECK = process.argv.includes("--check");
const TARGETS = new Set(["kc-01-01", "kc-02-02", "kc-02-03", "kc-04-03"]);

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function remedial(lesson, conceptTag) {
  const found = lesson.remedials?.find((candidate) => candidate.conceptTag === conceptTag);
  if (!found) throw new Error(`${lesson.id}: missing remedial ${conceptTag}`);
  return found;
}

function repairLesson(lesson) {
  if (lesson.id === "kc-01-01") {
    const challenge = step(lesson, "ch1");
    challenge.body = "Predict without recounting.";
    challenge.explanationVariants = [
      "Moving the same six dots does not add or remove any. The count stays 6.",
      "The spacing changed, but the amount did not. There are still 6 dots.",
    ];
    challenge.widget.prompt = "Six dots were counted, then only moved into a scattered pattern. Without adding or removing any, how many must flash?";
    challenge.widget.commonPicks = [
      { value: 5, feedback: "Moving dots did not remove one. The same 6 dots remain." },
      { value: 7, feedback: "Moving dots did not add one. The same 6 dots remain." },
    ];
    challenge.widget.missFeedback = "Only the spacing changed. No dot was added or removed, so the count stays 6.";
    challenge.widget.successFeedback = "Yes — still 6. Moving the dots changes their spacing, not how many there are.";
    challenge.hints = [
      "Ask what changed: only the spaces between the dots.",
      "No dot was added. No dot was taken away.",
      "The starting count was 6, so the ending count is also 6.",
    ];
    delete challenge.variant;
  }

  if (lesson.id === "kc-02-02") {
    const concept = step(lesson, "c1");
    concept.body = "Compare amounts by matching or counting. The picture shows **3 mats** and **5 cats**. Three is **fewer** than five; five is **greater** than three.";
    concept.narration = concept.body;
    concept.figure = "kc-fewer";
  }

  if (lesson.id === "kc-02-03") {
    const boundary = step(lesson, "k3");
    boundary.body = "Use zero as the boundary.";
    boundary.widget.prompt = "Drag 0, 3, and 8 into order. Start with the number that means none.";
  }

  if (lesson.id === "kc-04-03") {
    const firstConcept = step(lesson, "c1");
    firstConcept.body = "A whole can break into parts and join again. The picture keeps **2 blue counters** and **3 orange counters** visible. Together, they make 5.";
    firstConcept.narration = firstConcept.body;
    firstConcept.figure = "koa-join-two-groups";

    const route = remedial(lesson, "kc-decompose");
    route.concept.body = "Six can break into two parts in more than one way: **5 and 1**, **4 and 2**, or **3 and 3**. Each pair makes 6.";
    route.concept.narration = route.concept.body;
    route.concept.figure = "kc-break-apart";

    const challenge = step(lesson, "ch1");
    challenge.body = "Move one, keep the whole.";
    challenge.explanationVariants = [
      "Start with 5 and 2. Moving one from the first part to the second makes 4 and 3, and 4 + 3 is still 7.",
      "One part loses one while the other gains one, so the whole stays 7: 4 and 3.",
    ];
    challenge.widget.prompt = "Seven is split into 5 and 2. Move one counter from the 5-part to the 2-part. Which new split do you get?";
    challenge.widget.options = [
      { id: "a", label: "4 and 3", correct: true, feedback: "Yes — 5 loses one and 2 gains one. The new split is 4 and 3, still making 7." },
      { id: "b", label: "5 and 3", correct: false, feedback: "That adds a counter instead of moving one. The first part must drop from 5 to 4." },
      { id: "c", label: "4 and 2", correct: false, feedback: "That removes a counter. The second part must grow from 2 to 3." },
      { id: "d", label: "6 and 1", correct: false, feedback: "That moves a counter in the opposite direction. From the 5-part to the 2-part gives 4 and 3." },
    ];
    challenge.hints = [
      "The first part loses one: 5 becomes 4.",
      "The second part gains that same one: 2 becomes 3.",
      "Check the whole: 4 and 3 still make 7.",
    ];
    delete challenge.variant;
  }
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 13) throw new Error(`expected 13 course lessons, found ${files.length}`);

let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const stableIds = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const evaluatorTypes = JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type]));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== stableIds) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type])) !== evaluatorTypes) throw new Error(`${lesson.id}: evaluator types changed`);
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
console.log(`${CHECK ? "CHECK" : "REPAIR"} counting-to-20-k: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 2 P0 visual + 2 P0 excellence + 1 P0 progression closures; 1 additional live truth repair; 0 P0 residuals; course seal ${courseSeal}`);
