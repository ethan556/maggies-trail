import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDirectory = path.join(root, "content", "courses", "fractions-add", "lessons");

const repairs = [
  {
    workId: "CHOICE-0060",
    lessonId: "fa-03-01",
    stepId: "k2",
    optionId: "a",
    before: "Sam added the denominators too — the pieces stayed the same size, so the answer is 5/7",
    after: "Sam changed the denominator; the sum is 5/7.",
  },
  {
    workId: "CHOICE-0060",
    lessonId: "fa-03-01",
    stepId: "k2",
    optionId: "b",
    before: "Nothing — 5/14 is correct",
    after: "Sam should multiply the numerators, not add them.",
  },
  {
    workId: "CHOICE-0060",
    lessonId: "fa-03-01",
    stepId: "k2",
    optionId: "c",
    before: "Sam should have multiplied the numerators",
    after: "Sam should rewrite both fractions as tenths first.",
  },
  {
    workId: "CHOICE-0060",
    lessonId: "fa-03-01",
    stepId: "k2",
    optionId: "d",
    before: "The numerators should have been 2+7 and 3+7",
    after: "Sam should add each numerator to its denominator.",
  },
  {
    workId: "CHOICE-0061",
    lessonId: "fa-03-02",
    stepId: "k2",
    optionId: "a",
    before: "Priya subtracted the denominators too — the pieces stayed tenths, so the answer is 5/10",
    after: "Priya changed the denominator; the difference is 5/10.",
  },
  {
    workId: "CHOICE-0061",
    lessonId: "fa-03-02",
    stepId: "k2",
    optionId: "b",
    before: "Nothing — 5/0 is correct",
    after: "Priya should make both denominators zero first.",
  },
  {
    workId: "CHOICE-0061",
    lessonId: "fa-03-02",
    stepId: "k2",
    optionId: "c",
    before: "Priya should have divided the numerators",
    after: "Priya should divide the numerators before subtracting.",
  },
  {
    workId: "CHOICE-0061",
    lessonId: "fa-03-02",
    stepId: "k2",
    optionId: "d",
    before: "The numerator should have been 9−10",
    after: "Priya should subtract 9 minus 10 before using tenths.",
  },
  {
    workId: "CHOICE-0062",
    lessonId: "fa-03-03",
    stepId: "k2",
    optionId: "a",
    before: "More than one whole — the numerator (11) passes the denominator (8)",
    after: "More than one whole; 11 is greater than 8.",
  },
  {
    workId: "CHOICE-0062",
    lessonId: "fa-03-03",
    stepId: "k2",
    optionId: "b",
    before: "Less than one whole",
    after: "Less than one whole; 5 plus 6 makes 8.",
  },
  {
    workId: "CHOICE-0062",
    lessonId: "fa-03-03",
    stepId: "k2",
    optionId: "c",
    before: "Exactly one whole",
    after: "Exactly one whole; matching eighths make a whole.",
  },
  {
    workId: "CHOICE-0062",
    lessonId: "fa-03-03",
    stepId: "k2",
    optionId: "d",
    before: "Fractions can't be more than one whole",
    after: "Fractions cannot name more than one whole amount.",
  },
  {
    workId: "PROGRESSION-fa-01-01",
    lessonId: "fa-01-01",
    stepId: "ch1",
    before: {
      body: "The hidden multiplier.",
      prompt: "5/6 = ?/18. What number goes on top?",
    },
    after: {
      body: "Redraw the same amount.",
      prompt: "A shape has 5/6 shaded. Redraw that same amount using 18 equal pieces. How many pieces should be shaded?",
    },
  },
  {
    workId: "PROGRESSION-fa-02-01",
    lessonId: "fa-02-01",
    stepId: "k3",
    before: {
      body: "A bigger denominator.",
      prompt: "Is 11/20 more than, less than, or exactly 1/2?",
    },
    after: {
      body: "Use the count model.",
      prompt: "On a 20-square grid, 11 squares are shaded. Is the shaded part more than, less than, or exactly 1/2?",
    },
  },
  {
    workId: "PROGRESSION-fa-02-02",
    lessonId: "fa-02-02",
    stepId: "k3",
    before: {
      body: "Apply the full method.",
      prompt: "Which is bigger: 5/11 or 4/7?",
    },
    after: {
      body: "Predict, then prove.",
      prompt: "First place each fraction relative to 1/2. Then decide which is bigger: 5/11 or 4/7.",
    },
  },
  {
    workId: "PROGRESSION-fa-03-01",
    lessonId: "fa-03-01",
    stepId: "k3",
    before: {
      body: "One more sum.",
      prompt: "6/13 + 5/13 = 11/?. What is the denominator?",
    },
    after: {
      body: "Correct the unit-size error.",
      prompt: "A student writes 6/13 + 5/13 = 11/26. What denominator corrects the sum?",
    },
  },
  {
    workId: "PROGRESSION-fa-04-02",
    lessonId: "fa-04-02",
    stepId: "k3",
    before: {
      body: "A bigger whole number.",
      prompt: "Convert 3 1/4 to an improper fraction. What is the new numerator (over 4)?",
    },
    after: {
      body: "Verify a conversion.",
      prompt: "A student writes (3 × 4) + 1 for 3 1/4. What improper-fraction numerator does this make?",
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function currentOrBefore(value, before, after, location) {
  assert(value === before || value === after, `${location}: source is not at a sealed before/after state`);
  return value === before;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const files = new Map();
  for (const repair of repairs) {
    if (files.has(repair.lessonId)) continue;
    const file = path.join(lessonDirectory, `${repair.lessonId}.json`);
    const source = await readFile(file, "utf8");
    files.set(repair.lessonId, { file, source, lesson: JSON.parse(source), changed: false });
  }

  const changedWorkIds = new Set();
  for (const repair of repairs) {
    const document = files.get(repair.lessonId);
    const step = document.lesson.steps?.find((candidate) => candidate.id === repair.stepId);
    assert(step, `${repair.workId}: missing ${repair.lessonId}/${repair.stepId}`);

    if ("optionId" in repair) {
      assert(step.widget?.type === "mcq", `${repair.workId}: expected MCQ widget`);
      const option = step.widget.options.find((candidate) => candidate.id === repair.optionId);
      assert(option, `${repair.workId}: missing option ${repair.optionId}`);
      if (currentOrBefore(option.label, repair.before, repair.after, repair.workId)) {
        option.label = repair.after;
        document.changed = true;
        changedWorkIds.add(repair.workId);
      }
      continue;
    }

    assert(step.widget, `${repair.workId}: expected widget`);
    const bodyNeedsRepair = currentOrBefore(step.body, repair.before.body, repair.after.body, `${repair.workId}/body`);
    const promptNeedsRepair = currentOrBefore(step.widget.prompt, repair.before.prompt, repair.after.prompt, `${repair.workId}/prompt`);
    assert(bodyNeedsRepair === promptNeedsRepair, `${repair.workId}: body and prompt must move together`);
    if (bodyNeedsRepair) {
      step.body = repair.after.body;
      step.widget.prompt = repair.after.prompt;
      document.changed = true;
      changedWorkIds.add(repair.workId);
    }
  }

  if (checkOnly && changedWorkIds.size > 0) throw new Error(`fractions-add: ${changedWorkIds.size} P1 repair(s) are not current`);
  if (!checkOnly) {
    for (const { file, source, lesson, changed } of files.values()) {
      if (!changed) continue;
      const indent = source.match(/^\{\r?\n( +)"id":/m)?.[1]?.length ?? 2;
      await writeFile(file, `${JSON.stringify(lesson, null, indent)}\n`, "utf8");
    }
  }
  console.log(JSON.stringify({ course: "fractions-add", signedRootCauseClosures: 8, changedRoots: changedWorkIds.size, changedPlacements: repairs.length, current: changedWorkIds.size === 0 }));
}

await main();
