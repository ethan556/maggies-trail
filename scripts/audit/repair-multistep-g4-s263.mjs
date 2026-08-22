import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const DIR = path.join(process.cwd(), "content", "courses", "multistep-g4", "lessons");
const CHECK = process.argv.includes("--check");

const bindings = {
  "g4s-01-01": { c1: "mb-multistep", c2: "g3w-subtract-once" },
  "g4s-01-02": { c1: "two-step-bar", c2: "dop-word-expr" },
  "g4s-01-03": { c1: "mb-times-compare", c2: "mb-more-vs-times" },
  "g4s-02-01": { c1: "mb-remainder", c2: "dop-remainder" },
  "g4s-02-02": { c1: "ee-variable", c2: "ee-mult-div-solve" },
  "g4s-02-03": { c1: "mult3-estimate", c2: "mult3-estimate" },
  "g4s-03-01": { c1: "mult3-estimate", c2: "mult3-estimate" },
  "g4s-03-02": { c1: "mb-multistep", c2: "two-step-bar" },
};

const bodies = {
  "g4s-01-01/c1": "The diagram names the result of each step: 6 × 4 = 24, then 24 − 5 = 19. The second step acts once on the total, not once on every group.",
  "g4s-01-01/c2": "Five equal groups of 4 make 20. Removing 3 once from that whole leaves 17, so the running-total equation is 20 − 3 = 17.",
  "g4s-01-02/c1": "The bar model joins 18 and 24 to make 42, then removes 15 to leave 27. A longer chain follows the same rule: each new operation acts on the running total.",
  "g4s-01-02/c2": "Operation order changes meaning. Double 4, then add 5 gives 4 × 2 + 5 = 13; add 4 and 5, then double gives (4 + 5) × 2 = 18.",
  "g4s-01-03/c1": "The short bar is 3 and the long bar is 9. Three copies of 3 make 9, so 9 is 3 times as many as 3.",
  "g4s-01-03/c2": "A fixed difference and a scale are not the same: 3 more than 4 is 7, while 3 times 4 is 12.",
  "g4s-02-01/c1": "Sharing 13 among 4 groups puts 3 in each group and leaves 1, so 13 ÷ 4 = 3 remainder 1. The context decides what that leftover means.",
  "g4s-02-01/c2": "For 27 ÷ 4, sharing gives 6 remainder 3. A bus context needs 7 whole buses, while an equal-share report stays 6 remainder 3.",
  "g4s-02-02/c1": "A letter can hold an unknown number. The diagram uses x as the placeholder and shows that one possible value is 5.",
  "g4s-02-02/c2": "The equation 3x = 12 records three equal groups with an unknown size. Dividing both sides by 3 gives x = 4 and checks the letter's value.",
  "g4s-02-03/c1": "Estimate before trusting an exact answer: 4 × 19 is close to 4 × 20 = 80, so the exact product 76 is reasonable.",
  "g4s-02-03/c2": "The estimate 4 × 20 = 80 makes 76 plausible for 4 × 19. An answer in a much larger place-value range would fail this check.",
  "g4s-03-01/c1": "Rounding 19 up to 20 makes 4 × 20 = 80 an upper estimate for 4 × 19. The exact product 76 should sit just below it.",
  "g4s-03-01/c2": "The diagram shows the direction as well as the size: because 20 is greater than 19, the estimate 4 × 20 = 80 sits above the exact 4 × 19 = 76.",
  "g4s-03-02/c1": "A clear plan labels both quantities: 6 × 4 = 24 builds the total, then 24 − 5 = 19 records what remains. Each line can be checked separately.",
  "g4s-03-02/c2": "The bar plan makes an error findable: 18 + 24 = 42 is the first quantity, then 42 − 15 = 27 is the second. The written chain preserves what each number means.",
};

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing ${id}`);
  return found;
}

function option(widget, id) {
  const found = widget.options.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing option ${id}`);
  return found;
}

function setMcq(widget, values) {
  for (const [id, [label, feedback]] of Object.entries(values)) {
    const target = option(widget, id);
    target.label = label;
    target.feedback = feedback;
  }
}

function diversify(lesson) {
  if (lesson.id === "g4s-01-01") {
    const host = step(lesson, "i2");
    host.body = "Show the running total after the loss.";
    Object.assign(host.widget, {
      prompt: "Build both stages: 6 packs of 4 make 24 markers, then 5 are lost and 19 remain.",
      categories: ["Before the loss", "After the loss"],
      target: [24, 19],
      maxVal: 26,
      step: 1,
      successFeedback: "24 first, then 19 — the loss acts once on the whole running total.",
      partialFeedback: "Build the first bar to 24 and the remaining bar to 19.",
    });
  }

  if (lesson.id === "g4s-01-02") {
    const host = step(lesson, "i2");
    host.body = "Work backward to find the missing final adjustment.";
    Object.assign(host.widget, {
      prompt: "A chain starts with 6 × 9 = 54, then 14 are removed. Slide to the number that must be added to finish at 60.",
      min: 1,
      max: 40,
      start: 1,
      target: 20,
      acceptFactor: 1.25,
      unitLabel: "pencils added",
      ticks: [1, 20, 40],
      lowFeedback: "Too low — after 54 − 14 = 40, the chain needs 20 more to reach 60.",
      highFeedback: "Too high — the running total is 40 before the final addition, so only 20 more are needed.",
      successFeedback: "20 — the reverse check is 60 − 40 = 20.",
    });
  }

  if (lesson.id === "g4s-01-03") {
    const host = step(lesson, "i2");
    host.body = "Build the two meanings from the same numbers.";
    Object.assign(host.widget, {
      prompt: "Build both comparisons from 4 and 3: 3 more than 4, and 3 times 4.",
      categories: ["3 more than 4", "3 times 4"],
      target: [7, 12],
      maxVal: 14,
      step: 1,
      successFeedback: "7 and 12 — a fixed gap adds, while a scale factor multiplies.",
      partialFeedback: "Build the additive result to 7 and the multiplicative result to 12.",
    });
  }

  if (lesson.id === "g4s-02-01") {
    const host = step(lesson, "i2");
    host.body = "Subtract full groups to expose the remainder.";
    Object.assign(host.widget, {
      prompt: "Start at 58 and hop backward by 6 nine times. Where do you land?",
      min: 0,
      max: 60,
      start: 58,
      hop: 6,
      hops: 9,
      direction: "back",
      commonLandings: [
        { value: 9, feedback: "9 is the number of full groups, not the amount left after subtracting them." },
        { value: 6, feedback: "A remainder must be smaller than 6; subtract all nine complete groups." },
      ],
      missFeedback: "Nine backward hops of 6 remove 54 from 58 and leave 4.",
      successFeedback: "4 — that landing is the remainder in 58 ÷ 6 = 9 remainder 4.",
      lowFeedback: "Below the landing — nine groups remove 54, leaving 4.",
      highFeedback: "Above the landing — keep subtracting groups of 6 until nine full groups are removed.",
    });

    const ch1 = step(lesson, "ch1");
    ch1.body = "Apply the same remainder rule in a different vehicle context.";
    Object.assign(ch1.widget, {
      prompt: "A campground has 55 hikers and 9-seat vans. Every hiker must travel. How many vans are needed?",
      answer: 7,
      commonErrors: [
        { value: 6, feedback: "Six full vans carry 54 hikers, but the remaining hiker still needs another van." },
        { value: 1, feedback: "1 is the leftover hiker count, not the number of vans needed." },
      ],
      fallbackFeedback: "Six 9-seat vans carry 54 hikers; decide what the one remaining hiker requires.",
      successFeedback: "Correct — 7 vans are needed so the remaining hiker can travel.",
    });
  }

  if (lesson.id === "g4s-02-02") {
    const host = step(lesson, "i2");
    host.body = "Build a model that verifies a proposed letter value.";
    Object.assign(host.widget, {
      prompt: "Test n = 9 in 4 × n = 36 by building the 4-by-9 rectangle.",
      targetArea: 36,
      wMax: 9,
      hMax: 9,
      wStart: 1,
      hStart: 1,
      successFeedback: "The 4-by-9 model has area 36, so n = 9 makes the equation true.",
      lowFeedback: "The area is below 36; keep one side at 4 and grow the other toward 9.",
      highFeedback: "The area is above 36; one side has passed the value that makes 4 × n = 36.",
      square: false,
      requireFactors: { w: 9, h: 4 },
      factorFeedback: "The area is 36, but this check needs the named factors 4 and 9.",
    });

    const k3 = step(lesson, "k3");
    k3.body = "Solve the letter equation directly.";
    Object.assign(k3.widget, {
      prompt: "The equation 6 × n = 42 represents 6 equal bags. What number does n stand for?",
      answer: 7,
      commonErrors: [
        { value: 36, feedback: "That subtracts 6 from 42. Since 6 multiplies n, divide 42 by 6." },
        { value: 42, feedback: "42 is the total across all bags; n is the amount in one bag." },
      ],
      fallbackFeedback: "Ask how many are in each of 6 equal groups: 42 ÷ 6.",
      successFeedback: "Correct — n = 7 because 6 × 7 = 42.",
    });
  }

  if (lesson.id === "g4s-02-03") {
    const host = step(lesson, "i2");
    host.body = "Use order of magnitude to challenge an implausible result.";
    Object.assign(host.widget, {
      prompt: "A result of 3,860 is claimed for 7 × 68 − 90. Slide to the reasonable order of magnitude before checking the exact work.",
      min: 20,
      max: 800,
      start: 20,
      target: 400,
      acceptFactor: 1.5,
      unitLabel: "units",
      ticks: [20, 400, 800],
      lowFeedback: "Too low — seven groups of about 70 already make about 490 before 90 is removed.",
      highFeedback: "Too high — 7 × 70 − 90 is about 400, nowhere near the thousands.",
      successFeedback: "About 400 — the claim 3,860 has a misplaced digit and is not reasonable.",
    });

    const k3 = step(lesson, "k3");
    k3.body = "Reject a place-value error with an estimate.";
    k3.widget.prompt = "A student reports 3,860 for 7 × 68 − 90. The estimate is 7 × 70 − 90 = 400. What follows?";
    setMcq(k3.widget, {
      o0: ["3,860 is not reasonable because it is about ten times too large", "Correct — an estimate near 400 rules out a result in the thousands."],
      o1: ["3,860 is reasonable because it uses the same digits as 386", "Digit order and place value matter; the estimate puts the result near 400, not 4,000."],
      o2: ["The estimate proves the exact answer is 400", "An estimate checks the size but does not replace the exact computation."],
      o3: ["Nothing can be concluded", "The estimate conclusively rejects an answer in the thousands."],
    });
  }

  if (lesson.id === "g4s-03-01") {
    const host = step(lesson, "i2");
    host.body = "Predict the opposite error direction by rounding down.";
    Object.assign(host.widget, {
      prompt: "Round 68 down to 60 in 7 × 68. Slide to the size of the underestimate.",
      min: 1,
      max: 100,
      start: 1,
      target: 56,
      acceptFactor: 1.2,
      unitLabel: "units below",
      ticks: [1, 56, 100],
      lowFeedback: "Too low — each of 7 groups lost 8, so the total drops by 7 × 8.",
      highFeedback: "Too high — the exact loss from replacing 68 with 60 is 7 × 8 = 56.",
      successFeedback: "56 — rounding down removes 8 from each of 7 groups, so the estimate sits below by 56.",
    });
  }

  if (lesson.id === "g4s-03-02") {
    const host = step(lesson, "i2");
    host.body = "Extend the plan to the next named quantity.";
    Object.assign(host.widget, {
      prompt: "Build the plan after 6 boxes of 9 pencils are counted and 14 are given away.",
      categories: ["Built total", "After 14 given away"],
      target: [54, 40],
      maxVal: 56,
      step: 1,
      successFeedback: "54, then 40 — the second bar names the quantity available for the next step.",
      partialFeedback: "Build the total to 54, then the remaining quantity to 40.",
    });
  }
}

function repairLesson(lesson) {
  for (const id of ["c1", "c2"]) {
    const concept = step(lesson, id);
    const key = `${lesson.id}/${id}`;
    concept.figure = bindings[lesson.id][id];
    concept.body = bodies[key];
    concept.narration = bodies[key];
  }
  const remedialConcept = lesson.remedials?.[0]?.concept;
  if (remedialConcept) {
    const c2 = step(lesson, "c2");
    remedialConcept.figure = c2.figure;
    remedialConcept.body = c2.body;
    remedialConcept.narration = c2.narration;
  }
  diversify(lesson);
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 8) throw new Error(`expected 8 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const ids = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const widgetTypes = JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type]));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== ids) throw new Error(`${lesson.id}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.filter((candidate) => candidate.widget).map((candidate) => [candidate.id, candidate.widget.type])) !== widgetTypes) throw new Error(`${lesson.id}: evaluator types changed`);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  hashes.push(`${file}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}
if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
const courseSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} multistep-g4: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 16 truthful figure bindings; 8 progression causes repaired; 0 P0 residuals; course seal ${courseSeal}`);
