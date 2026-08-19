import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "four-addends-g2", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "g2n-01-01": ["bar-join", "make-ten-bridge"],
  "g2n-01-02": ["as100-name-tool", "as100-four-tools"],
  "g2n-01-03": ["tens-partners", null],
  "g2n-02-01": ["as100-add-by-place-86", null],
  "g2n-02-02": ["as100-four-tools", "as100-name-tool"],
  "g2n-02-03": ["as100-name-tool", "bar-join"],
  "g2n-03-01": ["bar-join", "as100-four-tools"],
  "g2n-03-02": ["as100-name-tool", "add-balance-scale"],
};

const retries = {
  "g2n-01-01": { prompt: "A learner banked 48 from the first pair. Show two five-hops for the last addend of 10.", min: 35, max: 65, start: 48, hop: 5, hops: 2, commonLandings: [], missFeedback: "From 48, two hops of 5 land on 58.", successFeedback: "Yes — 48 plus 10 reaches 58 in two equal stages." },
  "g2n-01-02": { prompt: "A learner has already joined three addends to 43. Add the last 7 to finish the four-addend total.", min: 35, max: 60, start: 43, hop: 7, hops: 1, commonLandings: [], missFeedback: "One hop of 7 from 43 lands on 50.", successFeedback: "Correct — the running total reaches 50 after the last join." },
  "g2n-01-03": { prompt: "A learner scans 47, 35, and 23. Tap the two addends whose ones make a ten.", hotspots: [{ id: "t38", label: "47", correct: true }, { id: "t25", label: "35", feedback: "35 has 5 ones; 7 and 5 make 12, not a clean ten." }, { id: "t12", label: "23", correct: true }], missFeedback: "Look at the ones digits: 7 and 3 complete ten.", successFeedback: "Correct — 47 and 23 make the friendlier pair first." },
  "g2n-02-01": { prompt: "A learner has a tens pile of 50 and a ones pile of 9. Add the ones pile exactly, not as a preview.", min: 45, max: 65, start: 50, hop: 9, hops: 1, commonLandings: [], missFeedback: "One hop of 9 from 50 lands on 59.", successFeedback: "Correct — 50 and 9 rebuild the exact total, 59." },
  "g2n-02-02": { prompt: "A learner scans 35, 28, and 42. Tap the pair whose ones make a ten.", hotspots: [{ id: "t46", label: "28", correct: true }, { id: "t23", label: "35", feedback: "35 has 5 ones; 8 needs 2, not 5, to complete ten." }, { id: "t14", label: "42", correct: true }], missFeedback: "Look for 8 and 2 in the ones place.", successFeedback: "Yes — 28 and 42 make the friendlier pair." },
  "g2n-02-03": { prompt: "A learner says each running-total hop aloud. Start at 53 and take two ten-hops.", min: 40, max: 85, start: 53, hop: 10, hops: 2, commonLandings: [], missFeedback: "Two ten-hops from 53 land on 73.", successFeedback: "63, 73 — saying each landing keeps the total visible." },
  "g2n-03-01": { prompt: "A learner has banked 54 seeds from three packets. Add the final packet of 7 seeds.", min: 45, max: 70, start: 54, hop: 7, hops: 1, commonLandings: [], missFeedback: "One hop of 7 from 54 lands on 61.", successFeedback: "Correct — the fourth packet brings the story total to 61 seeds." },
  "g2n-03-02": { prompt: "A learner checks from the back: the back pair made 34, then the remaining addend is 8. Hop it.", min: 25, max: 55, start: 34, hop: 8, hops: 1, commonLandings: [], missFeedback: "One hop of 8 from 34 lands on 42.", successFeedback: "Correct — the reverse order reaches the same checked total, 42." },
};

const rewrites = {
  "g2n-01-01": { ch1: { prompt: "A trail total is 50 miles, then 12 more miles are added. What is the new total?", answer: 62, successFeedback: "Correct — 50 and 12 make 62 miles." } },
  "g2n-01-02": { ch1: { prompt: "A banked total of 56 gets 5 more counters. What total is recorded?", answer: 61, successFeedback: "Correct — the last join takes 56 to 61." } },
  "g2n-01-03": { ch1: { prompt: "The ones digits 7 and 3 complete a ten. Combine 37 and 23 to make the friendly pair.", answer: 60, successFeedback: "Correct — 37 and 23 make the clean total 60." } },
  "g2n-02-01": { k3: { prompt: "A learner splits 15 + 11 by place. Which statement is true?", labels: ["Tens make 20 and ones make 6", "Tens make 6 and ones make 20", "Each number keeps only its ones", "Place value is not useful here"] } },
  "g2n-02-02": { ch1: { prompt: "A friendly pair has already made 40. Joining 22 more gives what total?", answer: 62, successFeedback: "Correct — 40 plus 22 is 62." } },
  "g2n-02-03": { ch1: { prompt: "A running total is 47. Seven more join it. What total should the learner say next?", answer: 54, successFeedback: "Correct — the next spoken total is 54." } },
  "g2n-03-01": { k2: { prompt: "A seed tray already holds 54 seeds. Nine more are poured in. What is the new count?", answer: 63, successFeedback: "Correct — 54 and 9 make 63 seeds." }, ch1: { prompt: "Three seed packets total 53. A final packet has 5 seeds. What is the full total?", answer: 58, successFeedback: "Correct — the fourth packet brings the total to 58 seeds." } },
  "g2n-03-02": { k2: { prompt: "For a reverse-order check, combine 21 and 23. What running total do you bank?", answer: 44, successFeedback: "Correct — 21 and 23 bank 44 before the last addend joins." } },
};

const seal = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const files = (await readdir(COURSE)).filter((file) => file.endsWith(".json")).sort();
if (files.length !== 8) throw new Error(`Expected 8 lessons, found ${files.length}`);
const entries = await Promise.all(files.map(async (file) => ({ file, raw: await readFile(path.join(COURSE, file), "utf8") })));
let changed = 0;
for (const entry of entries) {
  const lesson = JSON.parse(entry.raw);
  if (lesson.courseId !== "four-addends-g2" || entry.file !== `${lesson.id}.json`) throw new Error(`Unexpected identity: ${entry.file}`);
  const pair = concepts[lesson.id];
  const retry = retries[lesson.id];
  if (!pair || !retry) throw new Error(`Missing contract: ${lesson.id}`);
  const steps = Object.fromEntries(lesson.steps.map((step) => [step.id, step]));
  for (const [index, id] of ["c1", "c2"].entries()) {
    const step = steps[id];
    if (!step || step.kind !== "concept") throw new Error(`Missing concept ${lesson.id}/${id}`);
    const figure = pair[index];
    if (step.figure !== "count-on-hops" && step.figure !== figure && !(figure === null && step.figure === undefined)) throw new Error(`Unexpected figure ${lesson.id}/${id}: ${step.figure}`);
    if (figure) step.figure = figure; else delete step.figure;
  }
  const i2 = steps.i2;
  if (!i2?.widget) throw new Error(`Missing retry ${lesson.id}/i2`);
  if (i2.widget.type === "numberLineHop") Object.assign(i2.widget, retry);
  else if (i2.widget.type === "tapDiagram") {
    i2.widget.prompt = retry.prompt;
    i2.widget.hotspots.forEach((hotspot, index) => Object.assign(hotspot, retry.hotspots[index]));
    i2.widget.missFeedback = retry.missFeedback;
    i2.widget.successFeedback = retry.successFeedback;
  } else throw new Error(`Unexpected retry widget ${lesson.id}/${i2.widget.type}`);
  i2.body = "Repair the strategy.";
  for (const [stepId, patch] of Object.entries(rewrites[lesson.id] ?? {})) {
    const step = steps[stepId];
    if (!step?.widget) throw new Error(`Missing rewrite ${lesson.id}/${stepId}`);
    if (patch.labels) {
      if (step.widget.type !== "mcq" || step.widget.options.length !== patch.labels.length) throw new Error(`Expected MCQ ${lesson.id}/${stepId}`);
      step.widget.prompt = patch.prompt;
      step.widget.options.forEach((option, index) => { option.label = patch.labels[index]; });
    } else {
      if (step.widget.type !== "numeric") throw new Error(`Expected numeric ${lesson.id}/${stepId}`);
      Object.assign(step.widget, patch);
    }
  }
  const next = `${JSON.stringify(lesson, null, 2)}\n`;
  if (next !== entry.raw) {
    if (!CHECK) await writeFile(path.join(COURSE, entry.file), next);
    changed += 1;
  }
}
if (CHECK && changed) throw new Error(`REPAIR_NEEDED: ${changed} lesson files differ from the S263 contract`);
console.log(`${CHECK ? "CURRENT" : "REPAIRED"}: ${files.length} lessons; changed=${changed}; seal=${seal(concepts)}`);
