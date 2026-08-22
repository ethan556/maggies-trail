import fs from "node:fs";
import path from "node:path";

const dir = "content/courses/number-line-g2/lessons";

/**
 * These are deliberately not new figure bindings.  The only predecessor visual,
 * `count-on-hops`, permanently shows 4 + 3 = 7, which contradicts every G2
 * concept placement in this course.  No registered figure has each concept's
 * exact values, so the safe source repair is to fail-close the visual while
 * retaining explicit replacement debt in the accompanying evidence report.
 */
const conceptIds = new Set(["c1", "c2"]);

const secondInteractionRepairs = new Map([
  ["g2l-01-01", {
    body: "Locate a labeled mark by moving backward; the direction changes but every mark keeps one fixed value.",
    widget: {
      type: "numberLineHop",
      prompt: "Start at the mark labeled 70 and take one ten-hop backward to visit 60.",
      min: 20, max: 80, start: 70, hop: 10, hops: 1, direction: "back",
      commonLandings: [{ value: 69, feedback: "That is one unit left of 70. This line's labeled gaps are tens, so one hop reaches 60." }],
      missFeedback: "Each hop is 10 and this route goes backward. From 70, one hop lands on 60.",
      successFeedback: "Landed on 60 — one ten to the left of 70. The labels anchor both position and direction."
    }
  }],
  ["g2l-01-02", {
    body: "Transfer the equal-spacing rule to a line whose marks are five apart.",
    widget: {
      type: "numberLineHop",
      prompt: "Use equal five-hops: start at 25 and make four hops to 45.",
      min: 15, max: 55, start: 25, hop: 5, hops: 4, direction: "forward",
      commonLandings: [{ value: 29, feedback: "That is four one-steps, not four equal five-hops. Keep each gap the same size." }],
      missFeedback: "Each equal gap is 5. From 25, four equal hops land on 45.",
      successFeedback: "45 — four matching gaps of 5. Equal amounts received equal room on the line."
    }
  }],
  ["g2l-01-03", {
    body: "Locate a number inside a labeled gap, not only the halfway point.",
    widget: {
      type: "numberLineHop",
      prompt: "Between 70 and 80, take three one-hops from 70 to locate 73.",
      min: 65, max: 85, start: 70, hop: 1, hops: 3, direction: "forward",
      commonLandings: [{ value: 75, feedback: "75 is halfway through the tens-gap, but this route asks for only three one-hops." }],
      missFeedback: "Each hop is 1. From 70, three hops land on 73, still inside the 70–80 gap.",
      successFeedback: "73 — labels may skip it, but every number between 70 and 80 has its own position."
    }
  }],
  ["g2l-02-01", {
    body: "Transfer forward tens-jumps to a new non-tens starting mark.",
    widget: {
      type: "numberLineHop",
      prompt: "Show 39 + 20: take two ten-hops forward from 39.",
      min: 30, max: 70, start: 39, hop: 10, hops: 2, direction: "forward",
      commonLandings: [{ value: 41, feedback: "Those are one-jumps. Each jump in this sum is a full ten." }],
      missFeedback: "Add by moving forward. Two ten-hops from 39 land on 59.",
      successFeedback: "59 — 39 plus two tens, read as a forward route on the line."
    }
  }],
  ["g2l-02-02", {
    body: "Transfer backward tens-jumps to a different starting mark and distance.",
    widget: {
      type: "numberLineHop",
      prompt: "Show 81 − 30: take three ten-hops backward from 81.",
      min: 40, max: 90, start: 81, hop: 10, hops: 3, direction: "back",
      commonLandings: [{ value: 71, feedback: "That is only one backward ten. The subtraction asks for all three tens." }],
      missFeedback: "Subtract by moving backward. Three ten-hops from 81 land on 51.",
      successFeedback: "51 — three backward tens make the difference visible."
    }
  }],
  ["g2l-02-03", {
    body: "Finish a mixed-jump route by choosing the small-jump part after the tens are already covered.",
    widget: {
      type: "numberLineHop",
      prompt: "The tens route reached 70. Take two one-hops to finish at 72.",
      min: 65, max: 75, start: 70, hop: 1, hops: 2, direction: "forward",
      commonLandings: [{ value: 71, feedback: "That makes only one one-hop. Two small hops remain after the tens route reaches 70." }],
      missFeedback: "The remaining distance is 2, so use two one-hops from 70 to reach 72.",
      successFeedback: "72 — big jumps covered the tens; the two small jumps finished exactly."
    }
  }],
  ["g2l-03-01", {
    body: "Communicate a new sum with a route that a classmate can read back into an equation.",
    widget: {
      type: "numberLineHop",
      prompt: "Make a readable route for 29 + 30: take three ten-hops forward from 29.",
      min: 20, max: 70, start: 29, hop: 10, hops: 3, direction: "forward",
      commonLandings: [{ value: 32, feedback: "That route uses ones. The equation's second addend is three tens." }],
      missFeedback: "A reader needs three equal ten-hops. From 29, they land on 59.",
      successFeedback: "59 — the start, three ten-hops, and landing tell the complete 29 + 30 story."
    }
  }],
  ["g2l-03-02", {
    body: "Complete the ones part of a subtraction route after the tens have already been drawn.",
    widget: {
      type: "numberLineHop",
      prompt: "After walking from 57 to 37 by tens, take three backward one-hops to land on 34.",
      min: 30, max: 45, start: 37, hop: 1, hops: 3, direction: "back",
      commonLandings: [{ value: 40, feedback: "That moves forward. The remaining three in 57 − 23 are backward one-hops." }],
      missFeedback: "The tens route stops at 37; three backward one-hops finish at 34.",
      successFeedback: "34 — the two ten-hops and three one-hops agree with 57 − 23."
    }
  }],
  ["g2l-03-03", {
    body: "Reconstruct a missing route in the opposite direction from a new landing point.",
    widget: {
      type: "numberLineHop",
      prompt: "A route starts at 72 and ends 20 lower. Rebuild it with two ten-hops backward.",
      min: 45, max: 80, start: 72, hop: 10, hops: 2, direction: "back",
      commonLandings: [{ value: 62, feedback: "That rebuilds only one ten of the hidden route. A 20-unit gap needs two ten-hops." }],
      missFeedback: "The hidden change is 20. Two backward ten-hops from 72 land on 52.",
      successFeedback: "52 — the rebuilt route measures the full 20-unit gap."
    }
  }],
  ["g2l-03-04", {
    body: "Model a backward trail-story move, distinguishing a new location from the distance travelled.",
    widget: {
      type: "numberLineHop",
      prompt: "Maggie is at marker 68 and walks back 20 meters. Take two ten-hops backward.",
      min: 40, max: 75, start: 68, hop: 10, hops: 2, direction: "back",
      commonLandings: [{ value: 58, feedback: "That is only one backward ten. This story asks for two backward ten-hops." }],
      missFeedback: "Two backward ten-hops from marker 68 land at marker 48.",
      successFeedback: "Marker 48 — the backward trail move subtracts two tens from 68."
    }
  }],
]);

// The source starts are retained only as a migration guard. A second run may
// update a previously sealed interaction after a bounded authored-data repair,
// but it will not overwrite an unknown variant.
const originalI2Starts = new Map([
  ["g2l-01-01", 40], ["g2l-01-02", 30], ["g2l-01-03", 40], ["g2l-02-01", 47], ["g2l-02-02", 63],
  ["g2l-02-03", 40], ["g2l-03-01", 38], ["g2l-03-02", 57], ["g2l-03-03", 40], ["g2l-03-04", 35],
]);

const fewestHopPlan = {
  type: "mcq",
  prompt: "From 40 to 72, which exact plan uses the fewest hops?",
  options: [
    { id: "o0", label: "3 ten-jumps, then 2 one-jumps", correct: true, feedback: "Correct — three tens cover 30 and two ones finish 2: five exact hops total." },
    { id: "o1", label: "32 one-jumps, one at a time", correct: false, feedback: "That reaches 72, but it takes 32 hops. Tens first make the route much shorter." },
    { id: "o2", label: "4 ten-jumps, then turn back", correct: false, feedback: "Four ten-jumps reach 80, then eight more one-jumps are needed to return to 72. It is not the fewest-hop route." },
    { id: "o3", label: "1 hundred-jump, then walk back", correct: false, feedback: "A hundred-jump overshoots far beyond 72, so walking back would add many more hops." },
  ],
};

const finishMixedJumpPlan = {
  type: "mcq",
  prompt: "After three ten-jumps from 40, which pair of jumps lands exactly on 72?",
  options: [
    { id: "o0", label: "2 one-jumps to the right", correct: true, feedback: "Correct — the three tens land at 70, then two one-jumps reach 72." },
    { id: "o1", label: "2 ten-jumps to the right", correct: false, feedback: "Two more tens would land at 90. Only two ones remain after the tens route." },
    { id: "o2", label: "2 one-jumps to the left", correct: false, feedback: "Those hops would move from 70 to 68. The landing 72 is to the right of 70." },
    { id: "o3", label: "1 ten-jump and 1 one-jump", correct: false, feedback: "A ten and a one add 11, so this route would land at 81 instead of 72." },
  ],
};

const supplementalK3Repairs = new Map([
  ["g2l-01-01", {
    type: "mcq",
    prompt: "A line is labeled 20, 30, 40, 50. Where would 35 sit?",
    options: [
      { id: "o0", label: "Halfway between the 30 and 40 marks", correct: true, feedback: "Correct — 35 is five after 30 and five before 40, so it sits halfway across that gap." },
      { id: "o1", label: "Directly on the 30 mark", correct: false, feedback: "30 has its own labeled mark. The number 35 is five units farther to the right." },
      { id: "o2", label: "Directly on the 40 mark", correct: false, feedback: "40 has its own labeled mark. The number 35 is five units before it." },
      { id: "o3", label: "To the left of the 20 mark", correct: false, feedback: "35 is larger than 20, so its position must be to the right of 20 on the line." },
    ],
  }],
  ["g2l-01-02", {
    type: "mcq",
    prompt: "A line is marked 0, 10, 20, 30. Where would 5 sit?",
    options: [
      { id: "o0", label: "Halfway between the 0 and 10 marks", correct: true, feedback: "Correct — 5 is equally far from 0 and 10, so it is halfway across the first equal gap." },
      { id: "o1", label: "Directly on the 10 mark", correct: false, feedback: "10 is the next labeled mark. The number 5 is halfway from 0 to that mark." },
      { id: "o2", label: "Halfway between the 10 and 20 marks", correct: false, feedback: "That position is 15. The number 5 belongs in the first gap, between 0 and 10." },
      { id: "o3", label: "To the right of the 30 mark", correct: false, feedback: "5 is smaller than 30, so it belongs near the beginning of this number line." },
    ],
  }],
]);
const distanceTruth = new Map([
  ["k2", {
    prompt: "Maggie is at marker 46. How far behind her is marker 14? Compute 46 − 14.",
    commonErrors: [
      { value: 60, feedback: "That adds the marker numbers. The distance between markers is their difference." },
      { value: 34, feedback: "The gap is 32: count from 14 up to 46 or subtract carefully." },
    ],
    fallbackFeedback: "Find the gap between the two marker numbers by subtracting the lower marker from the higher marker.",
    successFeedback: "Correct — 32 meters separate markers 14 and 46."
  }],
  ["ch1", {
    prompt: "Maggie is at marker 45. How far behind her is marker 13? Compute 45 − 13.",
    commonErrors: [
      { value: 58, feedback: "That adds the marker numbers. The distance between markers is their difference." },
      { value: 34, feedback: "The gap is 32: count from 13 up to 45 or subtract carefully." },
    ],
    fallbackFeedback: "Find the gap between the two marker numbers by subtracting the lower marker from the higher marker.",
    successFeedback: "Correct — 32 meters separate markers 13 and 45."
  }],
]);

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
let figureChanges = 0;
let progressionChanges = 0;
let choiceChanges = 0;
let truthChanges = 0;
let supplementalProgressionChanges = 0;

for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort()) {
  const file = path.join(dir, name);
  const lesson = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const step of lesson.steps ?? []) {
    if (conceptIds.has(step.id)) {
      if (step.figure === "count-on-hops") {
        delete step.figure;
        figureChanges += 1;
      } else if (step.figure !== undefined) {
        throw new Error(`${file}/${step.id}: expected count-on-hops or no figure, found ${step.figure}`);
      }
    }
  }

  const i2Repair = secondInteractionRepairs.get(lesson.id);
  if (!i2Repair) throw new Error(`${file}: no bounded i2 progression repair declared`);
  const i2 = lesson.steps.find((step) => step.id === "i2");
  if (!i2) throw new Error(`${file}: missing i2`);
  if (!sameJson(i2.widget, i2Repair.widget) || i2.body !== i2Repair.body) {
    if (i2.widget?.type !== "numberLineHop" || ![originalI2Starts.get(lesson.id), i2Repair.widget.start].includes(i2.widget?.start)) {
      throw new Error(`${file}/i2: unexpected progression source`);
    }
    i2.body = i2Repair.body;
    i2.widget = i2Repair.widget;
    progressionChanges += 1;
  }

  if (lesson.id === "g2l-02-03") {
    for (const [stepId, wanted] of [["k1", fewestHopPlan], ["ch1", finishMixedJumpPlan]]) {
      const step = lesson.steps.find((item) => item.id === stepId);
      if (!step) throw new Error(`${file}/${stepId}: missing choice surface`);
      if (!sameJson(step.widget, wanted)) {
        if (step.widget?.type !== "mcq" || !Array.isArray(step.widget.options) || step.widget.options.map((option) => option.id).join(",") !== "o0,o1,o2,o3") {
          throw new Error(`${file}/${stepId}: unexpected choice source`);
        }
        step.widget = wanted;
        choiceChanges += 1;
      }
    }
    const remedial = lesson.remedials?.[0]?.check;
    if (!remedial || remedial.widget?.type !== "mcq") throw new Error(`${file}/remedial: expected jump-plan MCQ`);
    if (!sameJson(remedial.widget, fewestHopPlan)) {
      if (remedial.widget.options?.map((option) => option.id).join(",") !== "o0,o1,o2,o3") throw new Error(`${file}/remedial: unexpected option IDs`);
      remedial.widget = fewestHopPlan;
      choiceChanges += 1;
    }
  }

  const k3Repair = supplementalK3Repairs.get(lesson.id);
  if (k3Repair) {
    const k3 = lesson.steps.find((step) => step.id === "k3");
    if (!k3 || k3.widget?.type !== "mcq") throw new Error(`${file}/k3: expected MCQ progression check`);
    if (!sameJson(k3.widget, k3Repair)) {
      if (k3.widget.options?.map((option) => option.id).join(",") !== "o0,o1,o2,o3") throw new Error(`${file}/k3: unexpected option IDs`);
      k3.widget = k3Repair;
      supplementalProgressionChanges += 1;
    }
  }
  if (lesson.id === "g2l-03-04") {
    for (const [stepId, wanted] of distanceTruth) {
      const step = lesson.steps.find((item) => item.id === stepId);
      if (!step || step.widget?.type !== "numeric") throw new Error(`${file}/${stepId}: expected numeric distance check`);
      if (!sameJson({ prompt: step.widget.prompt, commonErrors: step.widget.commonErrors, fallbackFeedback: step.widget.fallbackFeedback, successFeedback: step.widget.successFeedback }, wanted)) {
        if (step.widget.answer !== 32) throw new Error(`${file}/${stepId}: expected distance answer 32`);
        Object.assign(step.widget, wanted);
        truthChanges += 1;
      }
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
}

if (![0, 20].includes(figureChanges)) throw new Error(`expected 0 or 20 figure changes, got ${figureChanges}`);
if (![0, 1, 10].includes(progressionChanges)) throw new Error(`expected 0 or 10 progression changes, got ${progressionChanges}`);
if (![0, 1, 2, 3].includes(choiceChanges)) throw new Error(`expected 0 or 2 choice-surface changes, got ${choiceChanges}`);
if (![0, 2].includes(truthChanges)) throw new Error(`expected 0 or 2 truth-language changes, got ${truthChanges}`);
if (![0, 2].includes(supplementalProgressionChanges)) throw new Error(`expected 0 or 2 supplemental progression changes, got ${supplementalProgressionChanges}`);

console.log(`S261 number-line-g2: ${figureChanges} visual changes, ${progressionChanges} queued progression changes, ${supplementalProgressionChanges} supplemental progression changes, ${choiceChanges} choice changes, ${truthChanges} trail-distance truth changes`);
