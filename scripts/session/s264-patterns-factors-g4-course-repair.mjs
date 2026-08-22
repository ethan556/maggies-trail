import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/patterns-factors-g4/lessons";
const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

// `count-on-hops` always renders 4 + 3 = 7.  It cannot truthfully illustrate
// any of this course's factor, sieve, or pattern claims.  The sole allowed
// replacement is the registered, self-contained prime/composite example.
const exactFigurePlacements = new Map([["g4p-02-01/c1", "mb-prime-composite"]]);

const i2Repairs = new Map([
  ["g4p-01-01", {
    body: "Transfer the rectangle test to a new area, using a non-square factor pair.",
    widget: {
      type: "areaModel", prompt: "Build a rectangle with area 36 whose sides are 9 and 4.",
      targetArea: 36, wMax: 9, hMax: 9, wStart: 1, hStart: 1, square: false,
      requireFactors: { w: 9, h: 4 },
      successFeedback: "36 — 9 by 4 is a new factor pair, so the rectangle still has the requested area.",
      lowFeedback: "Smaller than 36 — keep building until the full area is covered.",
      highFeedback: "Larger than 36 — one side has grown past the pair requested.",
      factorFeedback: "That area is right, but this transfer asks for the 9 by 4 factor pair."
    }
  }],
  ["g4p-01-02", {
    body: "Use exact division on a new total, and select every divisor that leaves no remainder.",
    widget: {
      type: "tapDiagram", mode: "selectAll", canvas: { w: 4, h: 1 },
      prompt: "Test 30 by division. Tap every number that divides 30 exactly.",
      hotspots: [
        { id: "f3", x: 13, y: 50, label: "3 — divides 30 exactly", icon: "3️⃣", count: 1, correct: true },
        { id: "f5", x: 38, y: 50, label: "5 — divides 30 exactly", icon: "5️⃣", count: 1, correct: true },
        { id: "f8", x: 63, y: 50, label: "8", icon: "8️⃣", count: 1, feedback: "30 ÷ 8 leaves 6 over, so 8 is not a factor of 30." },
        { id: "f7", x: 88, y: 50, label: "7", icon: "7️⃣", count: 1, feedback: "30 ÷ 7 leaves 2 over, so 7 is not a factor of 30." }
      ],
      missFeedback: "Select every number whose division leaves no remainder: 3 and 5 both divide 30 exactly.",
      successFeedback: "Correct — 3 × 10 and 5 × 6 both make 30, so 3 and 5 are factors."
    }
  }],
  ["g4p-01-03", {
    body: "Transfer skip-counting to a different step size and use each equal hop as evidence for a multiple.",
    widget: {
      type: "numberLineHop", prompt: "Count by 7s from 0. Take five equal hops and see where you land.",
      min: 0, max: 42, start: 0, hop: 7, hops: 5, direction: "forward",
      commonLandings: [{ value: 28, feedback: "That is only four sevens. Five equal hops of 7 land one step farther." }],
      missFeedback: "Each hop is 7. Five hops from 0 land on 35.",
      successFeedback: "35 — five equal hops of 7, so 35 is a multiple of 7."
    }
  }],
  ["g4p-01-04", {
    body: "Test a new candidate by constructing the exact equal-hop route that reaches it.",
    widget: {
      type: "numberLineHop", prompt: "Is 54 a multiple of 9? Count by 9s and check with six equal hops.",
      min: 0, max: 63, start: 0, hop: 9, hops: 6, direction: "forward",
      commonLandings: [{ value: 45, feedback: "That is five nines. The target 54 needs six equal hops of 9." }],
      missFeedback: "Six hops of 9 from 0 land on 54, so the count reaches the candidate exactly.",
      successFeedback: "54 — six equal hops of 9 land exactly there, so 54 is a multiple of 9."
    }
  }],
  ["g4p-02-01", {
    body: "Show a different composite number with a whole-number rectangle whose sides are both above 1.",
    widget: {
      type: "areaModel", prompt: "21 is composite. Build it as a rectangle with sides 7 and 3.",
      targetArea: 21, wMax: 7, hMax: 7, wStart: 1, hStart: 1, square: false,
      requireFactors: { w: 7, h: 3 },
      successFeedback: "21 — 7 by 3 has two sides above 1, which proves 21 is composite.",
      lowFeedback: "Smaller than 21 — keep building until the rectangle covers all 21 squares.",
      highFeedback: "Larger than 21 — reduce a side until the area is exactly 21.",
      factorFeedback: "That area is right, but this proof uses the 7 by 3 rectangle."
    }
  }],
  ["g4p-02-02", {
    body: "Run a different sieve pass and explain the equally spaced composite landings it removes.",
    widget: {
      type: "numberLineHop", prompt: "Run the multiples-of-5 pass: count by 5s from 0 through 25.",
      min: 0, max: 30, start: 0, hop: 5, hops: 5, direction: "forward",
      commonLandings: [{ value: 20, feedback: "20 is four hops of 5. Continue one more equal hop to reach 25." }],
      missFeedback: "The fifth equal hop of 5 lands on 25; those non-prime multiples are removed by this sieve pass.",
      successFeedback: "25 — the fifth multiple of 5. It is crossed out because it has factors besides 1 and itself."
    }
  }],
  ["g4p-03-01", {
    body: "Transfer a multiplicative rule to a new starting value, then check that every gap grows with the terms.",
    widget: {
      type: "barBuilder", prompt: "Build the pattern 5, 10, 20, 40 — each term doubles the one before.",
      categories: ["Term 1", "Term 2", "Term 3", "Term 4"], target: [5, 10, 20, 40], maxVal: 42, step: 1,
      successFeedback: "5, 10, 20, 40 — each bar is twice the height of the one before, so the multiplicative rule fits every step.",
      partialFeedback: "Double each term: 5, then 10, then 20, then 40.", display: "bar", histogram: false
    }
  }],
  ["g4p-03-02", {
    body: "Build a new shape-count pattern, then use its constant increase to predict a later step.",
    widget: {
      type: "barBuilder", prompt: "Build the shape pattern: 4 squares, then 8, then 12, then 16.",
      categories: ["Step 1", "Step 2", "Step 3", "Step 4"], target: [4, 8, 12, 16], maxVal: 18, step: 1,
      successFeedback: "4, 8, 12, 16 — a constant step of 4 makes the later terms predictable.",
      partialFeedback: "Each step adds exactly 4 more squares than the step before.", display: "bar", histogram: false
    }
  }],
  ["g4p-03-03", {
    body: "Inspect a new rule and distinguish its visible features from the information the rule directly gives.",
    widget: {
      type: "tapDiagram", mode: "selectAll", canvas: { w: 4, h: 1 },
      prompt: "The rule is 'add 5' from 5: 5, 10, 15, 20, 25. Tap the features the RULE never states.",
      hotspots: [
        { id: "parity", x: 13, y: 50, label: "Terms alternate odd and even", icon: "🔀", count: 1, correct: true },
        { id: "step", x: 38, y: 50, label: "Each term is 5 more than the last", icon: "➕", count: 1, feedback: "That is exactly what the rule says, so it is stated rather than discovered." },
        { id: "mult3", x: 63, y: 50, label: "Every term is a multiple of 5", icon: "✳️", count: 1, correct: true },
        { id: "start", x: 88, y: 50, label: "The pattern starts at 5", icon: "🚩", count: 1, feedback: "The starting value is given outright, so it is stated rather than hidden." }
      ],
      missFeedback: "The rule tells the start and the +5 step. Alternating parity and being multiples of 5 are features visible in the terms.",
      successFeedback: "Correct — the terms alternate parity and are all multiples of 5, although neither feature is named in the rule."
    }
  }],
  ["g4p-03-04", {
    body: "Build a related doubling pattern from a new start, then use the rule rather than only the next term.",
    widget: {
      type: "barBuilder", prompt: "Build the first four terms of 'multiply by 2 from 3': 3, 6, 12, 24.",
      categories: ["Term 1", "Term 2", "Term 3", "Term 4"], target: [3, 6, 12, 24], maxVal: 26, step: 1,
      successFeedback: "3, 6, 12, 24 — doubling works at every step, so the rule can predict terms far beyond the displayed bars.",
      partialFeedback: "Each term must be double the one before: 3, 6, 12, 24.", display: "bar", histogram: false
    }
  }],
]);

const progressionCheckRepairs = new Map([
  ["g4p-01-01/ch1", {
    type: "numeric", prompt: "How many factor pairs does 24 have when turned rectangles count only once?", answer: 4, tolerance: 0, unit: "",
    commonErrors: [
      { value: 8, feedback: "That counts both orientations. A 4 by 6 rectangle and a 6 by 4 rectangle are the same factor pair turned." },
      { value: 3, feedback: "24 also has the 4 by 6 pair, in addition to 1 by 24, 2 by 12, and 3 by 8." }
    ],
    fallbackFeedback: "List each pair once: 1×24, 2×12, 3×8, and 4×6.",
    successFeedback: "Correct — 24 has 4 factor pairs when rotations count once."
  }],
  ["g4p-01-02/ch1", {
    type: "mcq", prompt: "Which multiplication proves that 6 is a factor of 36?", options: [
      { id: "o0", label: "6 × 6 = 36", correct: true, feedback: "Correct — a whole-number partner, 6, makes 36, so 6 divides it exactly." },
      { id: "o1", label: "6 + 6 = 12", correct: false, feedback: "Adding two sixes gives 12, not 36. A factor test needs a product that equals the whole." },
      { id: "o2", label: "36 − 6 = 30", correct: false, feedback: "That subtraction is true but does not show 6 times a whole number equals 36." },
      { id: "o3", label: "36 ÷ 6 = 5", correct: false, feedback: "36 ÷ 6 is 6, not 5. The exact quotient is the factor partner." }
    ]
  }],
  ["g4p-01-03/ch1", {
    type: "mcq", prompt: "Which multiplication proves that 42 is a multiple of 6?", options: [
      { id: "o0", label: "6 × 7 = 42", correct: true, feedback: "Correct — 42 is 6 taken seven whole times, so it is a multiple of 6." },
      { id: "o1", label: "6 + 7 = 13", correct: false, feedback: "That adds the two numbers rather than making seven equal groups of 6." },
      { id: "o2", label: "42 − 6 = 36", correct: false, feedback: "That difference is true, but one subtraction does not prove repeated equal groups reach 42." },
      { id: "o3", label: "42 ÷ 6 = 8", correct: false, feedback: "42 ÷ 6 equals 7. The whole-number quotient is what proves the multiple relationship." }
    ]
  }],
  ["g4p-02-02/k3", {
    type: "mcq", prompt: "After the 2-, 3-, and 5-passes of a sieve, why can 7 remain uncrossed?", options: [
      { id: "o0", label: "No earlier sieve number divides 7 exactly", correct: true, feedback: "Correct — 7 is not a multiple of 2, 3, or 5, so those composite-removing passes do not cross it out." },
      { id: "o1", label: "Every odd number remains", correct: false, feedback: "Odd composite numbers such as 9 and 15 are crossed out by the 3- and 5-passes." },
      { id: "o2", label: "7 is a multiple of 5", correct: false, feedback: "7 ÷ 5 leaves a remainder, so 7 is not a multiple of 5." },
      { id: "o3", label: "The sieve skips all numbers below 10", correct: false, feedback: "The sieve starts with small numbers; it crosses out 4, 6, 8, and 9 before reaching 10." }
    ]
  }],
  ["g4p-03-01/ch1", {
    type: "numeric", prompt: "A rule says 'multiply by 3' and starts at 4. What is the fourth term?", answer: 108, tolerance: 0, unit: "",
    commonErrors: [
      { value: 36, feedback: "36 is the third term: 4, 12, 36, 108. Apply the rule one more time." },
      { value: 16, feedback: "That added 12 rather than multiplying each term by 3." }
    ],
    fallbackFeedback: "Write the terms in order: 4, then 12, then 36, then multiply by 3 once more.",
    successFeedback: "Correct — the fourth term is 108."
  }],
  ["g4p-03-02/ch1", {
    type: "mcq", prompt: "A shape pattern starts with 4 squares and adds 4 each step. How many squares are in step 6?", options: [
      { id: "o0", label: "24 squares", correct: true, feedback: "Correct — six equal groups of 4 make 24, so step 6 has 24 squares." },
      { id: "o1", label: "20 squares", correct: false, feedback: "20 is step 5. Add one more group of 4 to reach step 6." },
      { id: "o2", label: "36 squares", correct: false, feedback: "That multiplies a previous result. The rule adds one fixed group of 4 at each step." },
      { id: "o3", label: "10 squares", correct: false, feedback: "10 would not continue the fixed +4 pattern: 4, 8, 12, 16, 20, 24." }
    ]
  }],
  ["g4p-03-03/ch1", {
    type: "mcq", prompt: "The rule is 'add 5' from 5: 5, 10, 15, 20, 25. Which feature is visible but not stated?", options: [
      { id: "o0", label: "The terms alternate odd and even", correct: true, feedback: "Correct — the +5 rule never names parity, but adding an odd amount flips parity each step." },
      { id: "o1", label: "Each term is 5 more than the one before", correct: false, feedback: "That is the rule itself, so it is stated rather than a hidden feature." },
      { id: "o2", label: "The pattern starts at 5", correct: false, feedback: "The starting value is given directly, so it is not a feature inferred from the terms." },
      { id: "o3", label: "The rule adds 5", correct: false, feedback: "This repeats the stated operation instead of identifying a feature the terms reveal." }
    ]
  }],
  ["g4p-03-04/ch1", {
    type: "mcq", prompt: "A pattern starts at 5 and doubles each step. Which statement correctly predicts step 6?", options: [
      { id: "o0", label: "Step 6 is 160 after five doublings", correct: true, feedback: "Correct — 5, 10, 20, 40, 80, 160; the rule predicts the sixth term without drawing a special picture." },
      { id: "o1", label: "Step 6 is 30 because 5 is added six times", correct: false, feedback: "That uses repeated addition, but the stated rule doubles each term." },
      { id: "o2", label: "Step 6 is 80 because 80 is the next term", correct: false, feedback: "80 is step 5. One more doubling gives step 6." },
      { id: "o3", label: "Step 6 cannot be predicted from a rule", correct: false, feedback: "A rule is precisely what makes any later term predictable, including step 6." }
    ]
  }],
]);

const truthfulTapFeedback = new Map([
  ["g4p-01-02/i1", {
    missFeedback: "Select every number whose division leaves no remainder: 3 and 8 both divide 24 exactly.",
    successFeedback: "Correct — 3 × 8 and 8 × 3 make 24, so both selected numbers are factors."
  }],
  ["g4p-03-03/i1", {
    missFeedback: "The rule gives the start and the +3 step. Alternating parity and being multiples of 3 are features visible in the terms.",
    successFeedback: "Correct — alternating parity and being multiples of 3 are shown by the terms, although neither is stated in the rule."
  }]
]);

let figureRemoved = 0;
let figureRebound = 0;
let progressionChanged = 0;
let progressionCheckChanged = 0;
let truthFeedbackChanged = 0;

for (const fileName of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, fileName);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
  const byId = new Map(lesson.steps.map((step) => [step.id, step]));

  for (const stepId of ["c1", "c2"]) {
    const step = byId.get(stepId);
    if (!step) throw new Error(`${file}/${stepId}: missing concept`);
    const key = `${lesson.id}/${stepId}`;
    const exactFigure = exactFigurePlacements.get(key);
    if (exactFigure) {
      if (step.figure === "count-on-hops") { step.figure = exactFigure; figureRebound += 1; }
      else if (step.figure !== exactFigure) throw new Error(`${file}/${stepId}: expected count-on-hops or ${exactFigure}`);
    } else if (step.figure === "count-on-hops") {
      delete step.figure;
      figureRemoved += 1;
    } else if (step.figure !== undefined) {
      throw new Error(`${file}/${stepId}: expected count-on-hops or no figure`);
    }
  }

  const i2 = byId.get("i2");
  const i2Repair = i2Repairs.get(lesson.id);
  if (!i2 || !i2Repair) throw new Error(`${file}: missing bounded i2 repair`);
  if (!sameJson({ body: i2.body, widget: i2.widget }, i2Repair)) {
    if (i2.widget?.type !== i2Repair.widget.type) throw new Error(`${file}/i2: evaluator type changed unexpectedly`);
    i2.body = i2Repair.body;
    i2.widget = i2Repair.widget;
    progressionChanged += 1;
  }

  for (const [key, repair] of truthfulTapFeedback) {
    const [lessonId, stepId] = key.split("/");
    if (lessonId !== lesson.id) continue;
    const step = byId.get(stepId);
    if (!step || step.widget?.type !== "tapDiagram") throw new Error(`${file}/${stepId}: expected tapDiagram`);
    const observed = { missFeedback: step.widget.missFeedback, successFeedback: step.widget.successFeedback };
    if (!sameJson(observed, repair)) {
      if (!/Fourths|Bars A and D/.test(`${step.widget.missFeedback} ${step.widget.successFeedback}`)) throw new Error(`${file}/${stepId}: unexpected feedback source`);
      Object.assign(step.widget, repair);
      truthFeedbackChanged += 1;
    }
  }

  for (const [key, repair] of progressionCheckRepairs) {
    const [lessonId, stepId] = key.split("/");
    if (lessonId !== lesson.id) continue;
    const step = byId.get(stepId);
    if (!step) throw new Error(`${file}/${stepId}: missing progression check`);
    if (!sameJson(step.widget, repair)) {
      if (step.widget?.type !== repair.type) throw new Error(`${file}/${stepId}: evaluator type changed unexpectedly`);
      if (repair.type === "mcq" && step.widget.options?.map((option) => option.id).join(",") !== "o0,o1,o2,o3") throw new Error(`${file}/${stepId}: stable option IDs changed unexpectedly`);
      step.widget = repair;
      progressionCheckChanged += 1;
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, 19].includes(figureRemoved)) throw new Error(`expected 0 or 19 figure removals, got ${figureRemoved}`);
if (![0, 1].includes(figureRebound)) throw new Error(`expected 0 or 1 exact figure rebound, got ${figureRebound}`);
if (![0, 10].includes(progressionChanged)) throw new Error(`expected 0 or 10 i2 repairs, got ${progressionChanged}`);
if (![0, 8].includes(progressionCheckChanged)) throw new Error(`expected 0 or 8 progression-check repairs, got ${progressionCheckChanged}`);
if (![0, 2].includes(truthFeedbackChanged)) throw new Error(`expected 0 or 2 truth-feedback repairs, got ${truthFeedbackChanged}`);

console.log(`S264 patterns-factors-g4: ${figureRemoved} safe figure removals, ${figureRebound} exact figure rebound, ${progressionChanged} i2 repairs, ${progressionCheckChanged} progression-check repairs, ${truthFeedbackChanged} truth-feedback repairs`);
