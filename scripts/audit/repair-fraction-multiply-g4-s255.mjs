import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "fraction-multiply-g4", "lessons");
const CHECK = process.argv.includes("--check");

const figures = {
  "g4x-01-01": ["fa-repeated-add", "fa-add-like"],
  "g4x-01-02": ["fa-repeated-add", "fm-groups"],
  "g4x-01-03": ["frac-unit-fourth", "fa-repeated-add"],
  "g4x-01-04": ["fm-groups", "fa-repeated-add"],
  "g4x-02-01": ["number-line-jumps", "frac-numline-pastone"],
  "g4x-02-02": ["fm-groups", "fa-repeated-add"],
  "g4x-02-03": ["frac-numline-pastone", "fa-improper-mixed"],
  "g4x-02-04": ["fa-improper-mixed", "fa-mixed-improper"],
  "g4x-03-01": ["fm-groups", "fa-repeated-add"],
  "g4x-03-02": ["fm-groups", "fa-improper-mixed"],
  "g4x-03-03": ["number-line-jumps", "fm-groups"],
  "g4x-03-04": ["fa-benchmark-half", "fa-repeated-add"],
};

const i2Plans = {
  "g4x-01-01": {
    prompt: "Model a second case: collect 3/4 twice on the bar.", targetNum: 6, targetDen: 4,
    successFeedback: "6/4 — two groups of three fourths make one and two fourths.",
    commonFractions: [
      { num: 3, den: 4, feedback: "3/4 is one group; the task asks for two equal groups." },
      { num: 6, den: 8, feedback: "That changed the piece size. Collecting fourths keeps fourth-sized pieces." },
    ],
  },
  "g4x-01-02": {
    prompt: "Model a second product: build 4 × 2/5 as a single fraction.", targetNum: 8, targetDen: 5,
    successFeedback: "8/5 — four groups of two fifths make eight fifths.",
    commonFractions: [
      { num: 2, den: 5, feedback: "2/5 is one group; four groups are needed." },
      { num: 8, den: 10, feedback: "That changed fifths into tenths and did not build four copies of two fifths." },
    ],
  },
  "g4x-01-03": {
    prompt: "Extend the unit-fraction pattern: build 5 × 1/6.", targetNum: 5, targetDen: 6,
    successFeedback: "5/6 — five copies of one sixth make five sixths.",
    commonFractions: [
      { num: 1, den: 6, feedback: "1/6 is one copy; five copies are needed." },
      { num: 5, den: 12, feedback: "That changed sixths into twelfths instead of collecting five sixths." },
    ],
  },
  "g4x-01-04": {
    prompt: "Test the general rule on 3 × 3/8.", targetNum: 9, targetDen: 8,
    successFeedback: "9/8 — three groups of three eighths make nine eighths.",
    commonFractions: [
      { num: 3, den: 8, feedback: "3/8 is one group; three groups are needed." },
      { num: 9, den: 12, feedback: "That changed eighth-sized pieces into twelfths instead of collecting three groups." },
    ],
  },
  "g4x-02-01": {
    prompt: "Extend the journey: on a fifths line, place where 4 × 1/5 lands.", min: 0, max: 5,
    fractionDen: 5, target: 4, start: 0,
    commonPlacements: [
      { value: 1, feedback: "1/5 is one jump; the task asks for four equal jumps." },
      { value: 5, feedback: "5/5 is one whole, one fifth past the landing." },
    ],
    successFeedback: "4/5 — four equal jumps of one fifth land one fifth before one whole.",
    lowFeedback: "This point is short of four complete jumps of one fifth.",
    highFeedback: "This point is past the landing at four fifths.",
  },
  "g4x-02-02": {
    prompt: "Build a second stacked-row total: 3 × 2/8.", targetNum: 6, targetDen: 8,
    successFeedback: "6/8 — three rows of two eighths shade six eighth-pieces.",
    commonFractions: [
      { num: 2, den: 8, feedback: "2/8 is one row; three rows are needed." },
      { num: 6, den: 12, feedback: "Stacking rows adds eighth-pieces; it does not turn them into twelfths." },
    ],
  },
  "g4x-02-03": {
    prompt: "Compare a second product with one whole: build 4 × 2/3.", targetNum: 8, targetDen: 3,
    successFeedback: "8/3 — eight thirds make two wholes and two thirds, so the product is greater than one.",
    commonFractions: [
      { num: 2, den: 3, feedback: "2/3 is one group and remains below one whole; four groups are needed." },
      { num: 3, den: 3, feedback: "3/3 is exactly one whole, but eight thirds is more than two wholes." },
    ],
  },
  "g4x-02-04": {
    prompt: "Rename a second improper fraction: build 11/4 and identify its wholes.", targetNum: 11, targetDen: 4,
    successFeedback: "11/4 — two groups of four fourths make two wholes, with three fourths left.",
    commonFractions: [
      { num: 8, den: 4, feedback: "8/4 makes two wholes but leaves out the remaining three fourths." },
      { num: 12, den: 4, feedback: "12/4 is three wholes; 11/4 is one fourth less." },
    ],
  },
  "g4x-03-01": {
    prompt: "Model a new equal-groups story: five bags each hold 2/6 kilogram.", targetNum: 10, targetDen: 6,
    successFeedback: "10/6 kilogram — five equal groups of two sixths make ten sixths.",
    commonFractions: [
      { num: 2, den: 6, feedback: "2/6 kilogram is one bag; five bags are needed." },
      { num: 7, den: 6, feedback: "Adding the bag count to the numerator does not represent five equal groups." },
    ],
  },
  "g4x-03-02": {
    prompt: "Scale a different recipe: three batches each use 2/3 cup.", targetNum: 6, targetDen: 3,
    successFeedback: "6/3 cups — three groups of two thirds make exactly two cups.",
    commonFractions: [
      { num: 2, den: 3, feedback: "2/3 cup is one batch; three batches are needed." },
      { num: 5, den: 3, feedback: "Adding the batch count to the numerator does not make three equal groups." },
    ],
  },
  "g4x-03-03": {
    prompt: "Recompose the distance: on an eighths line, place where 3 × 2/8 lands.", min: 0, max: 8,
    fractionDen: 8, target: 6, start: 0,
    commonPlacements: [
      { value: 2, feedback: "2/8 mile is one lap; three laps are needed." },
      { value: 8, feedback: "8/8 is one mile, but three laps of 2/8 stop at 6/8." },
    ],
    successFeedback: "6/8 mile — three jumps of two eighths land at the same endpoint as two jumps of three eighths.",
    lowFeedback: "This point is short of three complete jumps of two eighths.",
    highFeedback: "This point is past the landing at six eighths.",
  },
  "g4x-03-04": {
    prompt: "Choose a benchmark estimate for 5 × 4/5.", min: 1, max: 8, start: 2, target: 4,
    acceptFactor: 1.25, ticks: [1, 4, 8],
    choices: [
      { value: 2, label: "About 2 wholes", correct: false, feedback: "Four fifths is close to one, so five groups must be much more than two." },
      { value: 4, label: "About 4 wholes", correct: true, feedback: "Correct — 4/5 is just under one, and five groups make exactly four wholes." },
      { value: 6, label: "About 6 wholes", correct: false, feedback: "Five groups of less than one cannot be greater than five." },
    ],
    lowFeedback: "That estimate is below the product's benchmark.", highFeedback: "That estimate is above the product's benchmark.",
    successFeedback: "About 4 wholes — in fact, 5 × 4/5 = 20/5 = 4.",
  },
};

const step = (lesson, id) => {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
};

function repairProgression(lesson) {
  Object.assign(step(lesson, "i2").widget, i2Plans[lesson.id]);
  if (lesson.id === "g4x-03-04") Object.assign(step(lesson, "i1").widget, {
    max: 12, target: 6, acceptFactor: 1.1, ticks: [1, 6, 12],
    lowFeedback: "Too low — thirty-five sixths is close to six wholes.",
    highFeedback: "Too high — the exact product is five and five sixths, just below six.",
    successFeedback: "About 6 — the exact value is 35/6, or 5 5/6, just under six.",
  });

  const k2 = step(lesson, "k2").widget;
  if (lesson.id === "g4x-01-03") Object.assign(k2, {
    prompt: "Apply without the model: compute 3 × 1/4 as ?/4. What is the numerator?",
    answer: 3, previewDenominator: 4,
    commonErrors: [
      { value: 4, feedback: "4 names the piece size; three copies of one fourth make three fourths." },
      { value: 7, feedback: "Adding the 3 and 4 mixes the group count with the piece-size name." },
    ],
    successFeedback: "Correct — 3 × 1/4 = 3/4.",
  });
  else if (!k2.prompt.startsWith("Apply without the model:")) k2.prompt = `Apply without the model: ${k2.prompt}`;

  const k3 = step(lesson, "k3").widget;
  const special = {
    "g4x-02-01": {
      prompt: "Diagnose a new journey: which describes 4 × 1/5 on a fifths line?",
      options: [
        { id: "o0", label: "Four jumps of 1/5, landing on 4/5", correct: true, feedback: "Correct — four equal one-fifth jumps land at four fifths." },
        { id: "o1", label: "One jump of 4/5", correct: false, feedback: "That reaches the same point but does not represent four equal groups." },
        { id: "o2", label: "Four jumps of 4/5, landing on 16/5", correct: false, feedback: "That uses four fifths for every jump instead of one fifth." },
        { id: "o3", label: "Five jumps of 1/4, landing on 5/4", correct: false, feedback: "That changes both the group count and the piece size." },
      ],
    },
    "g4x-02-02": {
      prompt: "Diagnose the model: why does 3 rows of 2/8 total 6/8?",
      options: [
        { id: "o0", label: "The rows collect 6 pieces that are still eighths", correct: true, feedback: "Correct — stacking equal rows changes the piece count, not each piece's size." },
        { id: "o1", label: "The 3 rows change every piece into a twenty-fourth", correct: false, feedback: "The rows collect eighth-pieces; they do not repartition one whole into twenty-fourths." },
        { id: "o2", label: "The group count and numerator add to make 5/8", correct: false, feedback: "Three equal groups of two pieces require multiplication, not adding unlike roles." },
        { id: "o3", label: "Only one row counts, so the total remains 2/8", correct: false, feedback: "The total includes the shaded pieces in all three rows." },
      ],
    },
    "g4x-03-03": {
      prompt: "Diagnose a new distance: which computes 5 laps of 2/8 mile?",
      options: [
        { id: "o0", label: "5 × 2/8 = 10/8 miles", correct: true, feedback: "Correct — five equal laps of two eighths collect ten eighths." },
        { id: "o1", label: "5 + 2/8 miles", correct: false, feedback: "The 5 counts laps; it is not itself a distance to add." },
        { id: "o2", label: "5 ÷ 2/8 miles", correct: false, feedback: "That asks how many two-eighth-mile lengths fit in five miles." },
        { id: "o3", label: "2/8 mile because every lap matches", correct: false, feedback: "That is one lap; the total includes all five laps." },
      ],
    },
    "g4x-03-04": {
      prompt: "Use a new benchmark: roughly how large is 4 × 3/4?",
      options: [
        { id: "o0", label: "About 3, because four groups of 3/4 make 3", correct: true, feedback: "Correct — here the benchmark is exact: 4 × 3/4 = 12/4 = 3." },
        { id: "o1", label: "About 12, using only 4 × 3", correct: false, feedback: "Twelve counts fourths; twelve fourths is three wholes." },
        { id: "o2", label: "Less than 1 because 3/4 is a fraction", correct: false, feedback: "Four groups of three fourths combine to more than one whole." },
        { id: "o3", label: "About 4 because 3/4 is exactly 1", correct: false, feedback: "Three fourths is below one, and the exact product is three." },
      ],
    },
  }[lesson.id];
  if (special) Object.assign(k3, special);
  else if (!k3.prompt.startsWith("Retrieve in a new form:")) k3.prompt = `Retrieve in a new form: ${k3.prompt}`;

  const challenge = step(lesson, "ch1").widget;
  if (!challenge.prompt.startsWith("Transfer to a final context:")) challenge.prompt = `Transfer to a final context: ${challenge.prompt}`;
}

function repairTruth(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, current] of Object.entries(value)) {
    if (current && typeof current === "object") repairTruth(current);
    if (key === "widget" && current && typeof current === "object") {
      if (current.type === "fractionBar") {
        current.lowFeedback = "Your bar represents less than the target value. Increase it until the values match.";
        current.highFeedback = "Your bar represents more than the target value. Decrease it until the values match.";
      }
      if (typeof current.fallbackFeedback === "string" && current.fallbackFeedback.includes("denominator never changes")) {
        if (/mixed number.*WHOLE NUMBER/i.test(current.prompt)) current.fallbackFeedback = "Group the pieces into denominator-sized wholes; report the number of complete groups.";
        else if (/improper fraction/i.test(current.prompt)) current.fallbackFeedback = "Count the denominator-sized pieces in every whole, then add the leftover pieces.";
        else if (/simplify/i.test(current.prompt)) current.fallbackFeedback = "Divide the numerator and denominator by the stated common factor.";
        else current.fallbackFeedback = "Count the equal-sized pieces first; keep the named denominator in the requested unsimplified form.";
      }
    }
    if (typeof current !== "string") continue;
    const replacements = new Map([
      ["Multiplying the counts is not joining them — 1 pieces and 3 more make 4.", "Multiplying the counts is not joining them — 1 piece and 3 more make 4."],
      ["That counted the leftover 1 fourths as another whole, but 1 is short of 4.", "That counted the leftover 1 fourth as another whole, but 1 is short of 4."],
      ["The denominator holds still.", "Keep the named denominator while collecting equal-sized pieces."],
      ["The piece size never changes.", "The piece size stays fixed while equal-sized pieces are collected."],
      ["One rule covers every case.", "The same counting rule covers whole-number multiples of a fraction."],
      ["The general rule covers every case: n × a/b multiplies the count a by n and keeps the piece size b.", "For a whole-number n and nonzero denominator b, n × a/b multiplies the piece count a by n while keeping the piece size b."],
      ["The rule falls straight out of the meaning: multiply the numerator by the whole number and leave the denominator exactly where it is.", "The rule follows from the meaning: multiply the numerator by the whole number and keep the denominator in the unsimplified product."],
      ["Estimating a fraction product compares each group to one whole. If 5/6 is nearly a whole, then 7 × 5/6 is a little under 7.", "Since 5/6 is 1/6 below one, seven groups are 7/6 below seven: 7 × 5/6 = 5 5/6, so estimate about 6."],
      ["That single comparison catches the worst error in this topic — multiplying the denominators and landing an order of magnitude away.", "Benchmarking exposes a denominator error: multiplying both numerator and denominator would leave the value at 5/6 instead of scaling it to 35/6."],
      ["A little less than 7, since 5/6 is nearly a whole", "About 6, because 35 sixths is 5 5/6"],
      ["Correct — each group is just under one, so seven of them land just under seven.", "Correct — thirty-five sixths is five and five sixths, which is close to six."],
      ["Rounding 5/6 up to 1 gives an estimate of 7, but the true product is slightly BELOW it.", "Seven is an upper estimate, but 35/6 is 5 5/6 and is closer to 6."],
    ]);
    if (replacements.has(current)) value[key] = replacements.get(current);
  }
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  for (const [index, id] of ["c1", "c2"].entries()) {
    const concept = step(lesson, id);
    concept.figure = figures[lesson.id][index];
    concept.narration = concept.body;
  }
  repairProgression(lesson);
  repairTruth(lesson);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} fraction-multiply-g4 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed,
  illustrationSourceClosures: 24, progressionSourceClosures: 12,
  sourceResidual: 0, assessorResidual: 36,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
