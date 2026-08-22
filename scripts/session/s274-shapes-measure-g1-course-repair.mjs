import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/shapes-measure-g1/lessons";

// These are authoritative WITHHELD_BLOCKLIST_FINGERPRINT dispositions. The
// generic figures cannot be presented as evidence for the exact source copy:
// one also mixes halves with a fourths-only claim; the other shows 3:00 while
// the learner is being taught half past. Withhold rather than miscue.
const figureDispositions = [
  { lessonId: "smg1-02-02", stepId: "c1", source: "halves-quarters" },
  { lessonId: "smg1-04-02", stepId: "c1", source: "clock-face" },
];

const progression = {
  lessonId: "smg1-02-02",
  stepId: "ch1",
  oldBody: "Both names.",
  oldPrompt: "If you split a whole into fourths, how many equal parts do you get?",
  body: "Build the whole.",
  prompt: "A whole has 4 equal parts. How many fourths make the whole?",
};

const byLesson = new Map();
for (const disposition of figureDispositions) {
  const entries = byLesson.get(disposition.lessonId) ?? [];
  entries.push(disposition);
  byLesson.set(disposition.lessonId, entries);
}

let figureChanges = 0;
let progressionChanges = 0;
let seen = 0;
for (const [lessonId, entries] of byLesson) {
  const file = path.join(dir, `${lessonId}.json`);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const disposition of entries) {
    const item = (lesson.steps ?? []).find((candidate) => candidate?.id === disposition.stepId);
    if (!item) throw new Error(`${lessonId}:${disposition.stepId} is missing`);
    seen += 1;
    if (item.figure === undefined) continue;
    if (item.figure !== disposition.source) {
      throw new Error(`${lessonId}:${disposition.stepId} has unexpected figure ${JSON.stringify(item.figure)}`);
    }
    delete item.figure;
    changed = true;
    figureChanges += 1;
  }
  if (lessonId === progression.lessonId) {
    const item = (lesson.steps ?? []).find((candidate) => candidate?.id === progression.stepId);
    if (!item?.widget || item.widget.type !== "numeric") throw new Error(`${progression.lessonId}:${progression.stepId} must be numeric`);
    if (item.widget.prompt === progression.prompt && item.body === progression.body) {
      if (item.widget.answer !== 4 || item.widget.tolerance !== 0) throw new Error("challenge evaluator changed");
    } else {
      if (item.body !== progression.oldBody || item.widget.prompt !== progression.oldPrompt) {
        throw new Error(`${progression.lessonId}:${progression.stepId} has unexpected progression copy`);
      }
      if (item.widget.answer !== 4 || item.widget.tolerance !== 0) throw new Error("challenge evaluator changed");
      item.body = progression.body;
      item.widget.prompt = progression.prompt;
      changed = true;
      progressionChanges += 1;
    }
  }
  if (changed) fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (seen !== figureDispositions.length) throw new Error(`expected ${figureDispositions.length} figures, found ${seen}`);
if (![0, figureDispositions.length].includes(figureChanges)) {
  throw new Error(`expected 0 or ${figureDispositions.length} figure changes, got ${figureChanges}`);
}
if (![0, 1].includes(progressionChanges)) throw new Error(`expected 0 or 1 progression changes, got ${progressionChanges}`);
console.log("S274 shapes-measure-g1: 2 incompatible figures fail-closed; 1 duplicate challenge diversified");
