import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const file = resolve(root, "content/courses/sampling-and-probability/lessons/sp-04-03.json");
const lesson = JSON.parse(readFileSync(file, "utf8"));
if (lesson.id !== "sp-04-03") throw new Error("wrong lesson");

const byId = new Map(lesson.steps.map((step) => [step.id, step]));
const stage = (label, outcomes, favourable = []) => ({ label, outcomes, favourable });
const countChoice = (id, count, feedback) => ({ id, label: String(count), count, feedback });
const fractionChoice = (id, label, num, den, feedback) => ({ id, label, num, den, feedback });
const countLab = (old, stages, successFeedback) => {
  if (old.type !== "numeric") throw new Error(`expected numeric, got ${old.type}`);
  const choices = [
    countChoice("correct", old.answer, successFeedback),
    ...old.commonErrors.map((error, index) => countChoice(`trap-${index + 1}`, error.value, error.feedback))
  ];
  return {
    type: "compoundEventLab",
    prompt: old.prompt,
    mode: "count",
    stages,
    choices,
    fallbackFeedback: old.fallbackFeedback,
    successFeedback
  };
};
const probabilityLab = (old, stages) => {
  if (old.type !== "mcq") throw new Error(`expected mcq, got ${old.type}`);
  const choices = old.options.map((option) => {
    const match = option.label.match(/^(\d+)\/(\d+)$/);
    if (!match) throw new Error(`non-fraction option ${option.label}`);
    return fractionChoice(option.id, option.label, Number(match[1]), Number(match[2]), option.feedback);
  });
  const correct = old.options.find((option) => option.correct);
  if (!correct) throw new Error("missing correct option");
  return {
    type: "compoundEventLab",
    prompt: old.prompt,
    mode: "probability",
    stages,
    choices,
    fallbackFeedback: correct.feedback,
    successFeedback: correct.feedback
  };
};

const shirt6 = stage("Shirts", Array.from({ length: 6 }, (_, i) => `S${i + 1}`));
const pants5 = stage("Pants", Array.from({ length: 5 }, (_, i) => `P${i + 1}`));
const shirt5 = stage("Shirts", Array.from({ length: 5 }, (_, i) => `S${i + 1}`));
const pants4 = stage("Pants", Array.from({ length: 4 }, (_, i) => `P${i + 1}`));
const coinCount = stage("Coin", ["H", "T"]);
const die6Count = stage("Die", ["1", "2", "3", "4", "5", "6"]);
const coinHeads = stage("Coin", ["H", "T"], [0]);
const dieEven = stage("Die", ["1", "2", "3", "4", "5", "6"], [1, 3, 5]);
const dieGreater4 = stage("Die", ["1", "2", "3", "4", "5", "6"], [4, 5]);

const expected = {
  i1: ["numeric", 30],
  k1: ["mcq", "1/4"],
  i2: ["numeric", 16],
  i3: ["mcq", "1/9"],
  k2: ["numeric", 20],
  k3: ["numeric", 12],
  ch1: ["mcq", "1/4"]
};
for (const [id, [type, answer]] of Object.entries(expected)) {
  const widget = byId.get(id)?.widget;
  if (!widget || widget.type !== type) throw new Error(`${id}: expected ${type}`);
  const actual = type === "numeric" ? widget.answer : widget.options.find((option) => option.correct)?.label;
  if (actual !== answer) throw new Error(`${id}: answer ${actual} != ${answer}`);
}

byId.get("i1").widget = countLab(byId.get("i1").widget, [shirt6, pants5], "Yes — 6 × 5 = 30 outfits.");
byId.get("k1").widget = probabilityLab(byId.get("k1").widget, [coinHeads, dieEven]);
byId.get("i2").widget = countLab(byId.get("i2").widget, [0, 1, 2, 3].map((i) => stage(`Flip ${i + 1}`, ["H", "T"])), "Yes — 2 × 2 × 2 × 2 = 16 ordered outcomes.");
byId.get("i3").widget = probabilityLab(byId.get("i3").widget, [
  { ...dieGreater4, label: "Die 1" },
  { ...dieGreater4, label: "Die 2" }
]);
byId.get("k2").widget = countLab(byId.get("k2").widget, [shirt5, pants4], "Yes — 5 × 4 = 20 outfits.");
byId.get("k3").widget = countLab(byId.get("k3").widget, [coinCount, die6Count], "Yes — 2 × 6 = 12 ordered outcomes.");
byId.get("ch1").widget = probabilityLab(byId.get("ch1").widget, [coinHeads, dieEven]);

const remedial = lesson.remedials?.find((entry) => entry.conceptTag === "sp-realworld-prob");
if (!remedial || remedial.check.widget.type !== "numeric" || remedial.check.widget.answer !== 30) throw new Error("remedial baseline mismatch");
remedial.check.widget = countLab(remedial.check.widget, [shirt6, pants5], "Yes — 6 × 5 = 30 outfits.");

writeFileSync(file, JSON.stringify(lesson, null, 2) + "\n");
console.log("sp-04-03: converted 8 fixed experiences to compoundEventLab");
