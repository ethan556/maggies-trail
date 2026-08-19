import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "add-three-numbers-g1", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "g1t-01-01": ["bar-join", "make-ten-bridge"],
  "g1t-01-02": ["ten-frame-make-ten", "make-ten-bridge"],
  "g1t-01-03": ["doubles-mirror", "near-double"],
  "g1t-01-04": ["bar-join", "as100-four-tools"],
  "g1t-02-01": ["as100-four-tools", "as100-name-tool"],
  "g1t-02-02": ["bar-join", "make-ten-bridge"],
  "g1t-02-03": ["as100-name-tool", "ten-frame-make-ten"],
  "g1t-03-01": ["make-ten-bridge", "ten-frame-make-ten"],
  "g1t-03-02": ["balance-unknown", "bar-part-whole"],
  "g1t-03-03": ["as100-four-tools", "as100-name-tool"],
};

const i2 = {
  "g1t-01-01": { prompt: "A learner joined 5 and 1 to make 6. Start at 6 and count on 4 to finish the three-addend total.", min: 4, max: 12, start: 6, hops: 4, missFeedback: "Begin at the first pair's total, 6, and count on 4. You land on 10.", successFeedback: "Yes — 5 + 1 makes 6, then 4 more reaches 10." },
  "g1t-01-02": { prompt: "A learner chose 4 and 6. Fill the frame to verify that this different pair makes ten.", preFilled: 4, missFeedback: "Use the empty squares to show the 6 that completes ten.", successFeedback: "Ten filled — 4 and 6 are another ten-partner pair." },
  "g1t-01-03": { prompt: "A learner used double 5 to make 10. Start at 10 and count on 2 for the third addend.", min: 8, max: 14, start: 10, hops: 2, missFeedback: "Start at the double, 10, then count 2 more. You land on 12.", successFeedback: "Right — double 5 makes 10, and 2 more makes 12." },
  "g1t-01-04": { prompt: "A learner grouped 4 + 5 first. Start at 9 and count on the last 3 to check the total.", min: 7, max: 14, start: 9, hops: 3, missFeedback: "Start at 9 and count 3 more. You land on 12.", successFeedback: "Correct — regrouping 4, 5, and 3 still reaches 12." },
  "g1t-02-01": { prompt: "A learner spots 8 and 2 as a ten-partner pair. Fill the frame to confirm that pair before adding the third number.", preFilled: 8, missFeedback: "Fill the two empty squares to make the ten-partner pair.", successFeedback: "Ten filled — 8 and 2 make the helpful pair first." },
  "g1t-02-02": { prompt: "A learner has a story with 8, then 2, then 5. Make the ten from 8 and 2; start at 10 and count on 5.", min: 8, max: 17, start: 10, hops: 5, missFeedback: "After 8 and 2 make 10, five more lands on 15.", successFeedback: "Yes — the story's ten-partner pair leaves 5 more, for 15." },
  "g1t-02-03": { prompt: "A learner tests 6 and 4 instead. Fill the frame to show why that pair is a friendly ten.", preFilled: 6, missFeedback: "Four empty squares complete the ten with 6.", successFeedback: "Ten filled — 6 and 4 make a friendly pair." },
  "g1t-03-01": { prompt: "A learner has already made ten and now adds 4. Start at 10 and count on 4 to name the teen total.", min: 8, max: 16, start: 10, hops: 4, missFeedback: "Start at 10 and count 4 more. You land on 14.", successFeedback: "Correct — ten and four is 14." },
  "g1t-03-02": { prompt: "A learner knows the total is 17 and has built 12 already. Start at 12 and count on 5 to find the missing part.", min: 10, max: 19, start: 12, hops: 5, missFeedback: "Count from 12 to 17: five hops fill the gap.", successFeedback: "Exactly — 5 is the missing part because 12 plus 5 is 17." },
  "g1t-03-03": { prompt: "A learner makes ten with 7 and 3 first. Start at 10 and count on the last 4 to complete the total.", min: 8, max: 16, start: 10, hops: 4, missFeedback: "After the pair makes 10, four more lands on 14.", successFeedback: "Yes — a ten plus 4 makes 14." },
};

const rewrites = {
  "g1t-01-01": {
    k2: { prompt: "A pair has 2 counters and 2 counters. What total does that pair make?", answer: 4, successFeedback: "Correct — the pair makes 4 before any third group joins." },
    ch1: { prompt: "Maggie has 4 red beads and 9 blue beads. How many beads does she have altogether?", answer: 13, successFeedback: "Correct — 4 and 9 join to make 13." },
  },
  "g1t-01-03": {
    k2: { prompt: "Double 8 means 8 + 8. What is the double?", answer: 16, successFeedback: "Correct — double 8 is 16." },
    ch1: { prompt: "A ten-partner pair has 6 and 4. What whole do they make?", answer: 10, successFeedback: "Correct — 6 and 4 make the whole ten." },
  },
  "g1t-01-04": {
    k3: { prompt: "Why do (4 + 3) + 2 and 4 + (3 + 2) both work?", labels: ["They use the same three addends, so the total stays 9", "The second grouping secretly adds one more", "The first grouping leaves out an addend", "Only the left-to-right grouping is allowed"] },
    ch1: { prompt: "After making a ten, add 9 more. What total do you have?", answer: 19, successFeedback: "Correct — a ten and 9 make 19." },
  },
  "g1t-02-01": {
    ch1: { prompt: "Which pair is the helpful double in 4 + 5 + 5?", labels: ["5 and 5", "4 and 5 only", "4 and 4", "No pair can help"] },
  },
  "g1t-02-02": {
    k3: { prompt: "In Maggie's 4 + 6 + 2 story, which pair should she group before the last addend?", labels: ["4 and 6, because they make ten", "4 and 2, because they are first and last", "6 and 2, because they are next to each other", "No pair; start counting all over"] },
  },
  "g1t-02-03": {
    k2: { prompt: "Why is a ten-partner pair a smart first choice?", labels: ["It leaves an easy ten-plus-something step", "It changes one addend into zero", "It means the third addend disappears", "It makes every total exactly ten"] },
  },
  "g1t-03-01": {
    k3: { prompt: "A full ten has 7 more counters joined. What teen total is shown?", answer: 17, successFeedback: "Correct — ten and 7 makes 17." },
    ch1: { prompt: "Ten plus 4 is a teen number. Which teen is it?", answer: 14, successFeedback: "Correct — ten and 4 makes 14." },
  },
  "g1t-03-02": {
    k2: { prompt: "There are 17 stickers. Ten are already sorted. How many still need sorting?", answer: 7, successFeedback: "Correct — 7 more with 10 makes 17." },
    ch1: { prompt: "Maggie has a group of ten and wants a total of 18. How many more does she need?", answer: 8, successFeedback: "Correct — 10 and 8 make 18." },
  },
  "g1t-03-03": {
    k3: { prompt: "Which known fact helps with 5 + 5 + 2?", labels: ["Double 5 makes 10 first", "Subtract 2 from 5 first", "Make a pair of 5 and 2 only", "Start over by counting from zero"] },
  },
};

const seal = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const files = (await readdir(COURSE)).filter((file) => file.endsWith(".json")).sort();
if (files.length !== 10) throw new Error(`Expected 10 lessons, found ${files.length}`);
const lessons = await Promise.all(files.map(async (file) => ({ file, raw: await readFile(path.join(COURSE, file), "utf8") })));

let changed = 0;
for (const entry of lessons) {
  const lesson = JSON.parse(entry.raw);
  if (entry.file !== `${lesson.id}.json` || lesson.courseId !== "add-three-numbers-g1") throw new Error(`Unexpected lesson identity: ${entry.file}`);
  const pair = concepts[lesson.id];
  const retry = i2[lesson.id];
  if (!pair || !retry) throw new Error(`Missing repair contract for ${lesson.id}`);
  const steps = Object.fromEntries(lesson.steps.map((step) => [step.id, step]));
  for (const [index, id] of ["c1", "c2"].entries()) {
    const step = steps[id];
    if (!step || step.kind !== "concept") throw new Error(`Missing ${lesson.id}/${id}`);
    if (step.figure !== "count-on-hops" && step.figure !== pair[index]) throw new Error(`Unexpected figure ${lesson.id}/${id}: ${step.figure}`);
    step.figure = pair[index];
  }
  const retryStep = steps.i2;
  if (!retryStep?.widget) throw new Error(`Missing ${lesson.id}/i2`);
  if (retryStep.widget.type === "numberLineHop") Object.assign(retryStep.widget, retry);
  else if (retryStep.widget.type === "tenFrame") Object.assign(retryStep.widget, retry);
  else throw new Error(`Unexpected retry widget ${lesson.id}/${retryStep.widget.type}`);
  retryStep.body = "Repair the strategy.";
  for (const [stepId, patch] of Object.entries(rewrites[lesson.id] ?? {})) {
    const step = steps[stepId];
    if (!step?.widget) throw new Error(`Missing rewrite ${lesson.id}/${stepId}`);
    if (patch.labels) {
      if (step.widget.type !== "mcq" || step.widget.options.length !== patch.labels.length) throw new Error(`Expected MCQ ${lesson.id}/${stepId}`);
      step.widget.prompt = patch.prompt;
      step.widget.options.forEach((option, index) => { option.label = patch.labels[index]; });
    } else {
      if (step.widget.type !== "numeric") throw new Error(`Expected numeric ${lesson.id}/${stepId}`);
      step.widget.prompt = patch.prompt;
      step.widget.answer = patch.answer;
      step.widget.successFeedback = patch.successFeedback;
    }
  }
  const next = `${JSON.stringify(lesson, null, 2)}\n`;
  if (next !== entry.raw) {
    if (!CHECK) await writeFile(path.join(COURSE, entry.file), next);
    changed += 1;
  }
}

if (CHECK && changed) throw new Error(`REPAIR_NEEDED: ${changed} lesson files differ from the S263 contract`);
console.log(`${CHECK ? "CURRENT" : "REPAIRED"}: ${files.length} lessons; changed=${changed}; seal=${seal(Object.entries(concepts))}`);
