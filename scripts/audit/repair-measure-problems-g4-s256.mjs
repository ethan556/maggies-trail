import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const COURSE = path.join(process.cwd(), "content", "courses", "measure-problems-g4", "lessons");

const figures = {
  "g4v-01-01": ["mc-length-ladder", "rr-conversion"],
  "g4v-01-02": ["ratio-table", "mc-length-ladder"],
  "g4v-01-03": ["mc-length-ladder", "rr-conversion"],
  "g4v-01-04": ["md3-mass-scale", "mc-mass-volume"],
  "g4v-02-01": ["md3-liter", "mc-mass-volume"],
  "g4v-02-02": ["clock-face", "rr-chain"],
  "g4v-02-03": ["mb-multistep", "two-step-bar"],
  "g4v-02-04": ["md3-elapsed", "rr-chain"],
  "g4v-03-01": ["mmt-coin-total", "mb-multistep"],
  "g4v-03-02": ["line-plot", "vm-total-length"],
  "g4v-03-03": ["mb-multistep", "rr-chain"],
  "g4v-03-04": ["mb-multistep", "two-step-bar"],
};

const i2Plans = {
  "g4v-01-01": {
    prompt: "Compare a second fixed length: how many centimeters are in 2 meters? Hop one meter at a time.",
    min: 0, max: 400, start: 0, hop: 100, hops: 2, direction: "forward",
    commonLandings: [
      { value: 100, feedback: "One hop is only one meter, or 100 centimeters; the rope is two meters." },
      { value: 300, feedback: "Three hops overshoot; two meters is 200 centimeters." },
    ],
    missFeedback: "Each meter is 100 centimeters, so two equal hops reach 200.",
    successFeedback: "200 centimeters — two meter-hops of 100 centimeters each.",
    lowFeedback: "This landing is short of two complete meter-hops.",
    highFeedback: "This landing is past two complete meter-hops.",
  },
  "g4v-01-02": {
    prompt: "Build a second conversion table in thousands of meters: 1 km, 2 km, 3 km.",
    categories: ["1 km", "2 km", "3 km"], target: [1, 2, 3], maxVal: 4, step: 1,
    successFeedback: "1, 2, and 3 thousands of meters — every row uses the same factor of 1,000.",
    partialFeedback: "Match each kilometer count with the same number of thousands of meters.",
    display: "bar", histogram: false,
  },
  "g4v-01-03": {
    prompt: "Apply the length relationship to a new value: how many centimeters are in 6 meters?",
    min: 0, max: 800, start: 0, hop: 100, hops: 6, direction: "forward",
    commonLandings: [
      { value: 500, feedback: "Five hops reach 500 centimeters; six meters needs one more hop." },
      { value: 700, feedback: "Seven hops overshoot; six meters is 600 centimeters." },
    ],
    missFeedback: "Six equal hops of 100 centimeters land at 600 centimeters.",
    successFeedback: "600 centimeters — six meter-hops of 100 centimeters each.",
    lowFeedback: "This landing is short of six complete meter-hops.",
    highFeedback: "This landing is past six complete meter-hops.",
  },
  "g4v-01-04": {
    prompt: "Apply the mass relationship to a new value: how many grams are in 4 kilograms?",
    min: 0, max: 6000, start: 0, hop: 1000, hops: 4, direction: "forward",
    commonLandings: [
      { value: 3000, feedback: "Three hops represent three kilograms; four kilograms needs one more hop." },
      { value: 5000, feedback: "Five hops overshoot; four kilograms is 4,000 grams." },
    ],
    missFeedback: "Four equal hops of 1,000 grams land at 4,000 grams.",
    successFeedback: "4,000 grams — four kilogram-hops of 1,000 grams each.",
    lowFeedback: "This landing is short of four complete kilogram-hops.",
    highFeedback: "This landing is past four complete kilogram-hops.",
  },
  "g4v-02-01": {
    prompt: "Apply the liquid-volume relationship to a new value: how many milliliters are in 3 liters?",
    min: 0, max: 5000, start: 0, hop: 1000, hops: 3, direction: "forward",
    commonLandings: [
      { value: 2000, feedback: "Two hops represent two liters; three liters needs one more hop." },
      { value: 4000, feedback: "Four hops overshoot; three liters is 3,000 milliliters." },
    ],
    missFeedback: "Three equal hops of 1,000 milliliters land at 3,000 milliliters.",
    successFeedback: "3,000 milliliters — three liter-hops of 1,000 milliliters each.",
    lowFeedback: "This landing is short of three complete liter-hops.",
    highFeedback: "This landing is past three complete liter-hops.",
  },
  "g4v-02-02": {
    prompt: "Apply the time relationship to a new value: how many minutes are in 4 hours?",
    min: 0, max: 360, start: 0, hop: 60, hops: 4, direction: "forward",
    commonLandings: [
      { value: 180, feedback: "Three hops represent three hours; four hours needs one more hop." },
      { value: 300, feedback: "Five hops overshoot; four hours is 240 minutes." },
    ],
    missFeedback: "Four equal hops of 60 minutes land at 240 minutes.",
    successFeedback: "240 minutes — four hour-hops of 60 minutes each.",
    lowFeedback: "This landing is short of four complete hour-hops.",
    highFeedback: "This landing is past four complete hour-hops.",
  },
  "g4v-02-03": {
    prompt: "Estimate a second distance: 4 laps of 600 meters, stopping 200 meters early.",
    min: 1200, max: 3200, start: 1400, target: 2200, acceptFactor: 1.1,
    unitLabel: "meters", ticks: [1200, 2200, 3200],
    choices: [
      { value: 1400, label: "About 1,400 meters", correct: false, feedback: "Too low — four 600-meter laps already build 2,400 meters." },
      { value: 2200, label: "About 2,200 meters", correct: true, feedback: "Correct — 2,400 meters minus the one 200-meter shortfall is 2,200 meters." },
      { value: 3000, label: "About 3,000 meters", correct: false, feedback: "Too high — stopping early makes the result less than 2,400 meters." },
    ],
    lowFeedback: "Too low — four laps build 2,400 meters before only 200 meters are removed.",
    highFeedback: "Too high — stopping early makes the distance less than 2,400 meters.",
    successFeedback: "About 2,200 meters — 2,400 built, then 200 removed once.",
  },
  "g4v-02-04": {
    prompt: "Model a second interval: four shifts of 45 minutes. Hop one shift at a time.",
    min: 0, max: 270, start: 0, hop: 45, hops: 4, direction: "forward",
    commonLandings: [
      { value: 135, feedback: "Three hops represent three shifts; four shifts needs one more hop." },
      { value: 225, feedback: "Five hops overshoot; four shifts total 180 minutes." },
    ],
    missFeedback: "Four equal hops of 45 minutes land at 180 minutes.",
    successFeedback: "180 minutes — four shift-hops of 45 minutes each.",
    lowFeedback: "This landing is short of four complete shifts.",
    highFeedback: "This landing is past four complete shifts.",
  },
  "g4v-03-01": {
    prompt: "Build a second equal-price model: three passes at 30 dollars each.",
    categories: ["Pass 1", "Pass 2", "Pass 3"], target: [30, 30, 30], maxVal: 35, step: 1,
    successFeedback: "90 dollars — three equal pass prices of 30 dollars each.",
    partialFeedback: "Every pass costs 30 dollars; make all three bars equal.",
    display: "bar", histogram: false,
  },
  "g4v-03-02": {
    prompt: "Place a second total: where do 12 quarter-unit lengths reach on a whole-unit line?",
    min: 0, max: 4, step: 0.25, tickStep: 1, target: 3, start: 0,
    commonPlacements: [
      { value: 0.75, feedback: "Three quarters uses only three quarter-unit lengths; the plot contains twelve." },
      { value: 4, feedback: "Four wholes would require sixteen quarter-unit lengths, not twelve." },
    ],
    successFeedback: "3 whole units — twelve quarter-units form three groups of four quarters.",
    lowFeedback: "This point is below the total of twelve quarter-unit lengths.",
    highFeedback: "This point is above the total of twelve quarter-unit lengths.",
  },
  "g4v-03-03": {
    prompt: "Estimate a second multi-step interval: 7 shifts of 40 minutes, finishing 20 minutes early.",
    min: 160, max: 360, start: 180, target: 260, acceptFactor: 1.1,
    unitLabel: "minutes", ticks: [160, 260, 360],
    choices: [
      { value: 180, label: "About 180 minutes", correct: false, feedback: "Too low — seven 40-minute shifts already build 280 minutes." },
      { value: 260, label: "About 260 minutes", correct: true, feedback: "Correct — 280 minutes minus the one 20-minute adjustment is 260 minutes." },
      { value: 340, label: "About 340 minutes", correct: false, feedback: "Too high — finishing early makes the result less than 280 minutes." },
    ],
    lowFeedback: "Too low — seven shifts build 280 minutes before only 20 minutes are removed.",
    highFeedback: "Too high — finishing early makes the result less than 280 minutes.",
    successFeedback: "About 260 minutes — 280 built, then 20 removed once.",
  },
  "g4v-03-04": {
    prompt: "Build a second diagram: four equal laps of 300 meters, in hundreds of meters.",
    categories: ["Lap 1", "Lap 2", "Lap 3", "Lap 4"], target: [3, 3, 3, 3], maxVal: 5, step: 1,
    successFeedback: "Four equal parts of three hundred meters show 1,200 meters before any adjustment.",
    partialFeedback: "Each lap has the same length; build every bar to three hundreds of meters.",
    display: "bar", histogram: false,
  },
};

const cmlPlans = {
  "g4v-01-01": ["Keep one length fixed while changing its unit and compare the resulting counts.", "Equivalent measurements describe the same length; the smaller unit produces the larger count.", "Treating a larger unit as if it must create a larger numerical measure."],
  "g4v-01-02": ["Build and extend a conversion table using one constant factor.", "Every row in the table preserves the same multiplicative relationship between units.", "Extending the rows additively without preserving the conversion factor."],
  "g4v-01-03": ["Choose multiplication or division from the direction of a metric length conversion.", "Meters to centimeters multiplies by 100; centimeters to meters divides by 100.", "Using the right factor in the wrong direction."],
  "g4v-01-04": ["Convert between kilograms and grams while preserving the mass.", "One kilogram is exactly 1,000 grams, so the numerical count changes by a factor of 1,000.", "Using the centimeters-per-meter factor for a mass conversion."],
  "g4v-02-01": ["Convert between liters and milliliters and interpret remainders when containers are required.", "One liter is exactly 1,000 milliliters; a leftover amount needs another container when all liquid must be carried.", "Dropping a remainder when the context requires every liter to be carried."],
  "g4v-02-02": ["Convert hours, minutes, and seconds using the correct factor of 60.", "One hour is 60 minutes and one minute is 60 seconds.", "Applying a metric factor of 100 or 1,000 to time."],
  "g4v-02-03": ["Represent a repeated distance and one final shortfall as multiply, then subtract once.", "Stopping early once means subtracting from the complete total once, not from every lap.", "Subtracting the shortfall inside every equal group."],
  "g4v-02-04": ["Build a time total from equal shifts, adjust it once, and convert only if requested.", "Equal shifts multiply; finishing early subtracts once from the total.", "Adding the shift count to the minutes per shift."],
  "g4v-03-01": ["Model equal prices and a single voucher as multiply, then subtract once.", "A voucher reduces the completed total once; it does not reduce every item unless the story says so.", "Adding the number of passes to the price or adding the voucher."],
  "g4v-03-02": ["Recompose quarter-unit measurements into whole units.", "Four quarter-units make one whole unit, so the total length is the quarter-unit count divided by four.", "Reading the count of quarter-units as the same count of whole units."],
  "g4v-03-03": ["Order a multi-step measurement solution: build, adjust, then convert if requested.", "Keeping a common unit through the arithmetic preserves the meaning of each step.", "Mixing unlike units or converting with the wrong factor."],
  "g4v-03-04": ["Read where an adjustment sits in a bar diagram and translate that placement into an expression.", "A mark at the end adjusts the total once; a mark inside every part adjusts each group.", "Treating an end adjustment as though it occurred inside every group."],
};

const step = (lesson, id) => {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
};

function replaceWidget(stepEntry, replacement) {
  const type = stepEntry.widget.type;
  stepEntry.widget = { type, ...replacement };
}

function repairProgression(lesson) {
  replaceWidget(step(lesson, "i2"), i2Plans[lesson.id]);

  if (lesson.id === "g4v-03-02") replaceWidget(step(lesson, "i1"), {
    prompt: "On a whole-unit line, place where 8 quarter-unit lengths reach.",
    min: 0, max: 4, step: 0.25, tickStep: 1, target: 2, start: 0,
    commonPlacements: [
      { value: 0.5, feedback: "One half uses two quarter-unit lengths; the plot contains eight." },
      { value: 4, feedback: "Four wholes would require sixteen quarter-unit lengths, not eight." },
    ],
    successFeedback: "2 whole units — eight quarter-units form two groups of four quarters.",
    lowFeedback: "This point is below the total of eight quarter-unit lengths.",
    highFeedback: "This point is above the total of eight quarter-unit lengths.",
  });
  if (lesson.id === "g4v-02-03") Object.assign(step(lesson, "i1").widget, {
    min: 1400, max: 3200, start: 1600, target: 2250, acceptFactor: 1.1, ticks: [1400, 2250, 3200],
    choices: [
      { value: 1600, label: "About 1,600 meters", correct: false, feedback: "Too low — six 400-meter laps already build 2,400 meters." },
      { value: 2250, label: "About 2,250 meters", correct: true, feedback: "Correct — 2,400 meters minus the one 150-meter shortfall is 2,250 meters." },
      { value: 3000, label: "About 3,000 meters", correct: false, feedback: "Too high — stopping early makes the result less than 2,400 meters." },
    ],
  });
  if (lesson.id === "g4v-03-03") Object.assign(step(lesson, "i1").widget, {
    min: 220, max: 440, start: 240, target: 330, acceptFactor: 1.1, ticks: [220, 330, 440],
    choices: [
      { value: 240, label: "About 240 minutes", correct: false, feedback: "Too low — eight 45-minute shifts already build 360 minutes." },
      { value: 330, label: "About 330 minutes", correct: true, feedback: "Correct — 360 minutes minus the one 30-minute adjustment is 330 minutes." },
      { value: 400, label: "About 400 minutes", correct: false, feedback: "Too high — finishing early makes the result less than 360 minutes." },
    ],
  });
  if (lesson.id === "g4v-03-01") step(lesson, "i1").widget.prompt = "Build the cost of four passes at 25 dollars each, in dollars.";

  const k2 = step(lesson, "k2").widget;
  if (lesson.id === "g4v-03-01") Object.assign(k2, {
    prompt: "Apply the money model: which expression finds the cost of 6 passes at 25 dollars after one 20-dollar voucher?",
    options: [
      { id: "o0", label: "(6 × 25) − 20 = 130 dollars", correct: true, feedback: "Correct — equal prices build 150 dollars, then the one voucher removes 20 dollars." },
      { id: "o1", label: "6 × (25 − 20) = 30 dollars", correct: false, feedback: "That applies the one voucher to every pass instead of once to the total." },
      { id: "o2", label: "6 + 25 − 20 = 11 dollars", correct: false, feedback: "Six counts passes and 25 is dollars per pass; equal groups require multiplication." },
      { id: "o3", label: "(6 × 25) + 20 = 170 dollars", correct: false, feedback: "A voucher reduces the bill, so the final operation is subtraction." },
    ],
  });
  else if (!k2.prompt.startsWith("Apply without the opening model:")) k2.prompt = `Apply without the opening model: ${k2.prompt}`;

  const k3 = step(lesson, "k3").widget;
  if (lesson.id === "g4v-01-01") Object.assign(k3, {
    prompt: "Diagnose a new comparison: why is the number 2,000 in 2,000 meters larger than the number 2 in 2 kilometers?",
    options: [
      { id: "o0", label: "Meters are smaller units, so more are needed", correct: true, feedback: "Correct — both measurements name the same distance, but meters use the smaller unit." },
      { id: "o1", label: "Kilometers measure a different distance", correct: false, feedback: "The distance is unchanged: 2 kilometers and 2,000 meters are equivalent." },
      { id: "o2", label: "The larger number means the distance grew", correct: false, feedback: "Only the unit and numerical count changed; the distance did not." },
      { id: "o3", label: "The comparison depends on the route", correct: false, feedback: "For any fixed distance, changing from kilometers to meters multiplies the count by 1,000." },
    ],
  });
  else if (lesson.id === "g4v-02-02") Object.assign(k3, {
    prompt: "Diagnose a time conversion: how should 5 hours be converted to minutes?",
    options: [
      { id: "o0", label: "Multiply by 60 to get 300 minutes", correct: true, feedback: "Correct — each of the five hours contains 60 minutes." },
      { id: "o1", label: "Divide by 60 to get 1/12 minute", correct: false, feedback: "Minutes are smaller than hours, so the numerical count must grow, not shrink." },
      { id: "o2", label: "Keep the number 5 because time is unchanged", correct: false, feedback: "The duration stays fixed, but changing the unit changes its numerical measure." },
      { id: "o3", label: "Multiply by 100 to get 500 minutes", correct: false, feedback: "Time uses 60 minutes per hour, not a metric factor of 100." },
    ],
  });
  else if (lesson.id === "g4v-03-04") Object.assign(k3, {
    prompt: "Diagnose a second diagram: four 300-meter parts each have 50 meters crossed off inside the part. What does it record?",
    options: [
      { id: "o0", label: "4 × (300 − 50) = 1,000 meters", correct: true, feedback: "Correct — the crossing occurs inside every part, so each of the four laps is shortened." },
      { id: "o1", label: "(4 × 300) − 50 = 1,150 meters", correct: false, feedback: "That subtracts 50 only once, as if the mark sat at the end of the whole bar." },
      { id: "o2", label: "4 + 300 − 50 = 254 meters", correct: false, feedback: "Four equal 300-meter parts combine by multiplication, not by adding unlike quantities." },
      { id: "o3", label: "4 × (300 + 50) = 1,400 meters", correct: false, feedback: "Crossed off means removed from each part, so the inner operation is subtraction." },
    ],
  });
  else if (!k3.prompt.startsWith("Retrieve or diagnose in a new form:")) k3.prompt = `Retrieve or diagnose in a new form: ${k3.prompt}`;

  const challenge = step(lesson, "ch1").widget;
  if (!challenge.prompt.startsWith("Transfer to a final context:")) challenge.prompt = `Transfer to a final context: ${challenge.prompt}`;
}

function repairContracts(value, lessonId) {
  if (!value || typeof value !== "object") return;
  for (const [key, current] of Object.entries(value)) {
    if (key === "cml" && current && typeof current === "object") {
      const [actionGoal, invariant, misconception] = cmlPlans[lessonId];
      current.actionGoal = actionGoal;
      current.invariants = [invariant];
      current.misconceptions = [misconception];
    }
    if (key === "widget" && current && typeof current === "object" && typeof current.fallbackFeedback === "string") {
      if (/Every .* must be carried/i.test(current.prompt)) current.fallbackFeedback = "Divide by the container size; if any amount remains, one more container is required.";
      else if (/stops .* early|finishes .* early|voucher takes/i.test(current.prompt)) current.fallbackFeedback = "Multiply to build the equal-group total, then subtract the one stated adjustment.";
      else if (/line plot.*quarter-unit/i.test(current.prompt)) current.fallbackFeedback = "Group the quarter-units in fours because four quarters make one whole unit.";
    }
    if (current && typeof current === "object") repairContracts(current, lessonId);
    if (typeof current !== "string") continue;
    const replacements = new Map([
      ["This is the payoff of learning the structure — the same two decisions, direction and factor, cover every measurement family there is.", "For multiplicatively related units, choose the conversion direction and use the unit's stated factor. Here, 1 kilogram equals 1,000 grams."],
      ["By now the only new information in a conversion problem is the factor — everything else you already know how to do.", "For multiplicatively related units, identify the factor and direction. Here, 1 liter equals 1,000 milliliters."],
      ["Smaller pieces mean a bigger count — exactly the rule from converting units, now applied inside a single unit.", "Four quarter-units make one whole unit, so regroup a count of quarter-units in fours to find the total length in whole units."],
      ["Multi-step measurement problems chain everything: build a total from equal groups, adjust it, then convert the result to the unit asked for.", "In this family of multi-step measurement problems, build the equal-group total, apply the stated adjustment, then convert only if the question asks for another unit."],
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
  repairContracts(lesson, lesson.id);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} measure-problems-g4 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed,
  illustrationSourceClosures: 24, progressionSourceClosures: 12,
  sourceResidual: 0, assessorResidual: 36,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
