/**
 * S290 — Fractions source-local MCQ parity repair.
 *
 * Applies nine signed CHOICE_SURFACE_INTEGRITY label repairs only. It retains
 * lesson/step IDs, questions, option IDs/order, correct answers, feedback,
 * evaluators, visuals, and all non-target lesson content. Label drift outside
 * these exact before/after contracts fails closed.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lessonDir = path.join(root, "content", "courses", "fractions", "lessons");
const checkOnly = process.argv.includes("--check");

const repairs = Object.freeze([
  {
    closure: "CHOICE-0073", lessonId: "fr-01-01", stepId: "k3",
    before: ["So a piece's name tells its true size — 'a fourth' must always mean the same amount of that whole", "To make the picture look tidy", "They don't — close enough counts", "Because unequal pieces are impossible to cut"],
    after: ["Equal pieces give each piece name one dependable size.", "Equal pieces make every fair cut look evenly tidy.", "Equal pieces let close-enough cuts still count.", "Equal pieces make uneven cuts impossible to create."],
  },
  {
    closure: "CHOICE-0074", lessonId: "fr-02-03", stepId: "k3",
    before: ["Exactly halfway — the same spot as 1/2", "A quarter of the way", "At the number 2", "Almost at 1"],
    after: ["At the halfway point on the line", "At the first quarter mark on the line", "At the number 2 mark on the line", "Near one whole on the line"],
  },
  {
    closure: "CHOICE-0075", lessonId: "fr-03-03", stepId: "k3",
    before: ["Five fifth-pieces are every piece of the whole — together they rebuild it exactly", "The fives cancel out and disappear", "Because 5 + 5 = 10", "It doesn't — 5/5 is five"],
    after: ["Five fifth-pieces rebuild the whole together.", "The two fives subtract away and disappear.", "Adding the two fives makes one whole.", "Five fifths should land at the number five."],
  },
  {
    closure: "CHOICE-0076", lessonId: "fr-04-01", stepId: "k3",
    before: ["Matching bottoms mean matching piece sizes — so more pieces really is more", "The top number always settles every comparison", "Bigger numbers always win in math", "It can't — you always need a picture"],
    after: ["Equal bottoms make equal-sized pieces, so count how many.", "Equal bottoms make top numbers settle every comparison.", "Equal bottoms make bigger numbers settle every comparison.", "Equal bottoms make pictures settle every comparison."],
  },
  {
    closure: "CHOICE-0077", lessonId: "fr-04-02", stepId: "k2",
    before: ["The 10 means a ten-way cut — slivers. Three quarter-slabs beat three slivers.", "Priya is right — 10 beats 4", "She should add the tops and bottoms", "Tenths aren't real fractions"],
    after: ["Ten cuts make smaller pieces, so 3/10 is less than 3/4.", "Ten cuts make larger pieces, so 3/10 is greater than 3/4.", "Add the top and bottom numbers to compare 3/10 and 3/4.", "Tenths are not real fractions, so they cannot be compared."],
  },
  {
    closure: "CHOICE-0078", lessonId: "fr-04-04", stepId: "ch1",
    before: ["Only Kim vs Raj — and Kim ate more (2/3 > 2/5); Nia's jumbo bag breaks her matchups", "All three — just compare the fractions", "None — the fractions all differ", "Nia ate the most for sure — 3/4 is the biggest fraction"],
    after: ["Only Kim and Raj can compare; 2/3 is greater than 2/5.", "All three can compare; 3/4 is the greatest share.", "None can compare; the fractions have different parts.", "Only Nia wins; 3/4 is greater than every other share."],
  },
  {
    closure: "CHOICE-0079", lessonId: "fr-04-04", stepId: "k1",
    before: ["Not necessarily — a fourth's amount depends on the whole it comes from", "Yes — 1/4 always equals 1/4", "Her sticky note's fourth is the bigger one", "Fractions don't have sizes at all"],
    after: ["No — a fourth's amount depends on the whole it names.", "Yes — one fourth is the same amount, whatever whole is named.", "No — her sticky-note fourth must be the bigger amount.", "No — fractions cannot have size after a whole is named."],
  },
  {
    closure: "CHOICE-0080", lessonId: "fr-04-04", stepId: "k2",
    before: ["The pizzas aren't the same size — a family-size fourth could easily be more food than a mini half", "Nothing — Leo wins", "Ana definitely ate more", "Fractions can't describe pizza"],
    after: ["The pizzas differ in size, so fractions alone cannot compare the food.", "Leo ate more; one half always beats one fourth of any pizza.", "Ana ate more; a family fourth always beats a mini half of pizza.", "Pizza fractions cannot describe how much food anyone ate from a pizza."],
  },
  {
    closure: "CHOICE-0081", lessonId: "fr-04-04", stepId: "k3",
    before: ["They describe the same whole, or same-size wholes", "Their top numbers match", "Their bottom numbers match", "Both are smaller than 1"],
    after: ["They name parts of the same-sized whole.", "Their top numbers name the same amount.", "Their bottom numbers name the same amount.", "Both fractions name less than one whole."],
  },
]);

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
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
    if (!step || !["check", "challenge"].includes(step.kind) || step.widget?.type !== "mcq") {
      throw new Error(`${repair.closure}: expected MCQ assessment at ${repair.lessonId}/${repair.stepId}`);
    }
    const options = step.widget.options;
    if (!same(options.map((option) => option.id), ["a", "b", "c", "d"]) || !same(options.filter((option) => option.correct).map((option) => option.id), ["a"]) || !options.every((option) => typeof option.feedback === "string" && option.feedback.trim())) {
      throw new Error(`${repair.closure}: option/evaluator contract drifted`);
    }
    const labels = options.map((option) => option.label);
    if (same(labels, repair.after)) continue;
    if (!same(labels, repair.before)) throw new Error(`${repair.closure}: unexpected labels; refusing overwrite`);
    options.forEach((option, index) => { option.label = repair.after[index]; });
    changed += 1;
    lessonChanged = true;
  }
  if (lessonChanged && !checkOnly) await writeFile(source, `${JSON.stringify(lesson, null, 2)}\n`, "utf8");
}

if (checkOnly && changed !== 0) throw new Error(`S290 is not current: ${changed} signed MCQ repairs still need application`);
console.log(JSON.stringify({ course: "fractions", signedRootCauseClosures: repairs.length, changed, current: changed === 0 }, null, 2));
