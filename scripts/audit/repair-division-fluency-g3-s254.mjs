import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "division-fluency-g3", "lessons");
const CHECK = process.argv.includes("--check");
const figures = {
  "df3-01-01": ["mult3-fair-shares", "mult3-fact-family"],
  "df3-01-02": ["mult3-how-many-groups", "mult3-fact-family"],
  "df3-01-03": ["mult3-double-double", "mult3-fact-family"],
  "df3-01-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-02-01": ["mult3-missing-factor", "mult3-nines"],
  "df3-02-02": ["mult3-fact-family", "mult3-missing-factor"],
  "df3-02-03": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-02-04": ["mult3-missing-factor", "mult3-fact-family"],
  "df3-03-01": ["mult3-special", "mult3-fair-shares"],
  "df3-03-02": ["mult3-special", "mult3-special"],
  "df3-03-03": ["mult3-fact-family", "mult3-array"],
  "df3-03-04": ["mult3-which-op", "mult3-fair-shares"],
};
const progressionLessons = new Set(["df3-01-01","df3-01-02","df3-01-03","df3-01-04","df3-02-01","df3-02-02","df3-02-03","df3-02-04","df3-03-01","df3-03-02","df3-03-03"]);
const step = (lesson, id) => {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
};

function repairProgression(lesson) {
  if (!progressionLessons.has(lesson.id)) return;
  const i2 = step(lesson, "i2").widget;
  if (!i2.prompt.startsWith("Model a second case, then verify it:")) i2.prompt = `Model a second case, then verify it: ${i2.prompt}`;
  const k2 = step(lesson, "k2").widget;
  if (!k2.prompt.startsWith("Use an inverse multiplication fact to solve:")) k2.prompt = `Use an inverse multiplication fact to solve: ${k2.prompt}`;
  const k3 = step(lesson, "k3").widget;
  k3.prompt = lesson.id === "df3-03-02" ? "Use inverse multiplication to decide whether 12 ÷ 0 has a quotient." : k3.prompt.startsWith("Retrieve without the array:") ? k3.prompt : `Retrieve without the array: ${k3.prompt}`;
  const challenge = step(lesson, "ch1").widget;
  if (!challenge.prompt.startsWith("Transfer to a final case:")) challenge.prompt = `Transfer to a final case: ${challenge.prompt}`;
}

function repairChoices(lesson) {
  if (lesson.id !== "df3-03-02") return;
  const plans = {
    k1: ["7; keep the original total", "1; use one full group", "No quotient; no number works", "0; copy the zero divisor"],
    k3: ["1; use one full group", "No quotient; no number works", "0; copy the zero divisor", "12; keep the original total"],
  };
  for (const [stepId, labels] of Object.entries(plans)) {
    const widget = step(lesson, stepId).widget;
    widget.options.forEach((option, index) => { option.label = labels[index]; });
  }
}

function repairTruth(lesson) {
  const replacements = new Map([
    ["A quotient can always be checked by multiplying it back.", "For a whole-number division fact with a nonzero divisor, multiply the quotient by the divisor to check the total."],
    ["Dividing by 10 shifts every digit one place right: 70 ÷ 10 = 7.", "Dividing 70 by 10 asks how many tens make 70. Seven tens make 70, so 70 ÷ 10 = 7."],
    ["The digits move down a place; the zero in the ones place disappears.", "Seventy is 7 tens. Grouping those 7 tens into groups worth 1 ten gives 7; the written zero records that 70 had no leftover ones."],
    ["÷10 shifts digits right.", "÷10 asks how many tens are in the total."],
    ["Every division fact has a multiplication twin — and the twin is usually the one already fluent.", "Every exact whole-number division fact with a nonzero divisor has a multiplication twin, often one you already know."],
    ["Two special cases: dividing by 1 changes nothing, and dividing a number by itself gives 1.", "Two special cases: dividing by 1 changes nothing, and dividing a nonzero number by itself gives 1."],
    ["Dividing by zero has no answer at all — it is undefined, not zero.", "Division by zero is undefined: no quotient can make a nonzero total when multiplied by 0."],
    ["Division by zero has no answer at all.", "Division by zero is undefined."],
  ]);
  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, current] of Object.entries(value)) {
      if (typeof current === "string" && replacements.has(current)) value[key] = replacements.get(current);
      else walk(current);
    }
  };
  walk(lesson);
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const concept = step(lesson, stepId);
    concept.figure = figures[lesson.id][index];
    concept.narration = concept.body;
  }
  repairProgression(lesson);
  repairChoices(lesson);
  repairTruth(lesson);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} division-fluency-g3 lessons are not normalized`);
console.log(JSON.stringify({ status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed, illustrationSourceClosures: 24, progressionSourceClosures: 11, choiceSourceClosures: 2, courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex") }, null, 2));
