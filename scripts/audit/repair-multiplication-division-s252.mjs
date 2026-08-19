import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "multiplication-division", "lessons");
const CHECK = process.argv.includes("--check");

const visualPlan = {
  "mult-02-01": { c2: "mult3-fair-shares" },
  "mult-02-03": { c2: "number-line-jumps" },
  "mult-03-01": { c1: "mult3-double" },
  "mult-04-04": { c2: "mult3-which-op" },
  "mult-04-05": { c2: "mult3-estimate" },
};

const progressionPrompts = {
  "mult-02-02": {
    ch1: "After 2 rolls sell, 24 rolls remain. A learner claims 6 full bags of 6 can be packed. Enter the number of full bags that corrects the claim.",
  },
  "mult-03-03": {
    k2: "Start at 5 and double exactly three times. Enter the final number in the doubling chain.",
  },
  "mult-03-04": {
    k2: "Begin with 10 × 6 = 60, then subtract one group of 6. Enter the resulting ×9 product.",
    ch1: "The theater has 72 seats in all. Five seats are empty tonight. Enter the number of occupied seats.",
  },
  "mult-05-03": {
    ch1: "A learner says 5 × 7 + 4 must be even because 4 is even. Enter the score to test and correct the claim.",
  },
};

const choicePlan = {
  "mult-02-04": {
    k3: {
      prompt: "How many distinct equations remain in the fact family for 5, 5, and 25?",
      labels: {
        a: "2 distinct equations",
        b: "4 distinct equations",
        c: "1 distinct equation",
        d: "3 distinct equations",
      },
    },
  },
  "mult-04-04": {
    k3: {
      prompt: "Which plan needs the result of one operation before a second operation can begin?",
      labels: {
        a: "Multiply 6 vans by 5 riders, then remove 4 absences.",
        b: "Multiply 6 vans by 5 riders to find the total.",
        c: "Add 6 park friends and 5 joining friends.",
        d: "Divide 30 riders equally among 6 vans.",
      },
    },
  },
  "mult-04-05": {
    k1: {
      prompt: "Which size check rejects Liam's result without recomputing 28 ÷ 4?",
      labels: {
        a: "A share of 32 exceeds the total of 28.",
        b: "The exact quotient should be 7.",
        c: "A bus can hold about 50 riders.",
        d: "Only recomputing can reject 32.",
      },
    },
  },
  "mult-05-01": {
    k2: {
      labels: {
        a: "Even, because both addends are even.",
        b: "Odd, because large sums are usually odd.",
        c: "Even, because every sum is even.",
        d: "Unknown until the addition is completed.",
      },
    },
  },
  "mult-05-02": {
    k3: {
      labels: {
        a: "Each 10 is exactly two groups of 5.",
        b: "Both rows always end in the digit 0.",
        c: "Small rows happen to share their values.",
        d: "A larger row contains every smaller row.",
      },
    },
  },
  "mult-05-03": {
    k1: {
      labels: {
        a: "An even factor pairs the full product.",
        b: "A factor ending in 5 makes an even product.",
        c: "The computed product, 40, is even.",
        d: "Parity is unknown until the product is computed.",
      },
    },
  },
  "mult-05-04": {
    k1: {
      labels: {
        a: "Each jump of 10 moves exactly one full row.",
        b: "Every multiple of 10 ends in the digit 0.",
        c: "Ten is larger than every one-digit jump.",
        d: "The multiples of 10 form a diagonal line.",
      },
    },
  },
};

function step(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
}

function replaceOptionLabels(widget, labels, lessonId, stepId) {
  if (widget.type !== "mcq") throw new Error(`${lessonId}/${stepId} is not mcq`);
  for (const option of widget.options) {
    const label = labels[option.id];
    if (!label) throw new Error(`Missing label for ${lessonId}/${stepId}/${option.id}`);
    option.label = label;
  }
}

function repairTruth(lesson) {
  if (lesson.id === "mult-02-01") {
    const c2 = step(lesson, "c2");
    c2.body = "Keep the sharing roles in order. In **15 ÷ 5 = 3**, 15 is the total number of grapes, 5 is the number of friends, and 3 is each fair share. The model deals one grape to every friend per round until the total is gone.";
    c2.narration = c2.body;
  }
  if (lesson.id === "mult-02-04") {
    const c2 = step(lesson, "c2");
    c2.body = "Why families matter: **one multiplication fact unlocks its inverse division equations**. When the factors differ, there are two distinct divisions. When the factors match, the two written divisions repeat the same equation. For 4 × 7 = 28, the family gives 28 ÷ 4 = 7 and 28 ÷ 7 = 4.";
    c2.narration = c2.body;
    const recap = step(lesson, "r1");
    recap.body = "One array connects a whole fact family.";
    recap.takeaways = [
      "Three numbers can make two multiplications and two divisions from one array.",
      "Different factors produce two distinct inverse division equations.",
      "Equal-factor families, such as 5, 5, and 25, collapse repeated equations.",
    ];
  }

  if (lesson.id === "mult-03-01") {
    const c1 = step(lesson, "c1");
    c1.body = "Multiplying by 2 makes a **double**: two equal copies of the same amount. The model pairs 6 with another 6, so 6 × 2 = 6 + 6 = 12. Doubling is repeated addition with exactly two equal addends.";
    c1.narration = c1.body;
  }

  if (lesson.id === "mult-03-02") {
    const c1 = step(lesson, "c1");
    c1.body = "Multiplying a whole number by 10 makes each digit worth **ten times as much**. In 7 × 10, the 7 ones become 7 tens, or 70. The zero records an empty ones place; no digit is simply moved or glued on.";
    c1.narration = c1.body;
    const i1 = step(lesson, "i1");
    i1.widget.successFeedback = "About 320 — 32 × 10 makes 32 tens, which is 320. Tens make the estimate easy to check.";
    i1.predict.reveal = "32 × 10 = 320 because every digit becomes worth ten times as much. Thirty-two ones become thirty-two tens, placing the estimate between 100 and 1,000.";
    const k1 = step(lesson, "k1");
    k1.body = "Track how each digit's place value becomes ten times as much.";
    const correct = k1.widget.options.find((option) => option.correct);
    if (correct) correct.feedback = "Exactly: 6 ones become 6 tens, while 0 records the empty ones place.";
    const recap = step(lesson, "r1");
    recap.takeaways[0] = "×10 makes each digit worth ten times as much; an empty ones place is recorded with 0.";
    const remedial = lesson.remedials?.[0]?.check?.widget;
    if (!remedial || remedial.type !== "mcq") throw new Error("Missing mult-03-02 remedial mcq");
    remedial.options.find((option) => option.id === "a").feedback = "Five ones become five tens: 50.";
    remedial.options.find((option) => option.id === "c").feedback = "510 places the digits side by side. Five groups of 10 make five tens, or 50.";
  }

  if (lesson.id === "mult-04-05") {
    const c1 = step(lesson, "c1");
    c1.body = "The last power-up is **sense-checking**. Sharing a positive pile among more than one group makes each share smaller than the pile. More than one positive equal group makes a total larger than one group. An impossible size proves the result is wrong and can expose a wrong operation.";
    c1.narration = c1.body;
    const c2 = step(lesson, "c2");
    c2.body = "Estimate with a nearby friendly fact. For **6 × 9**, compare with 6 × 10 = 60; the exact product must be one group of 6 less, so it lies just below 60. An addition-sized result such as 15 fails this multiplication estimate.";
    c2.narration = c2.body;
    const i2 = step(lesson, "i2");
    i2.widget.successFeedback = "About 180 — 18 × 10 makes 18 tens, or 180. Your size sense is calibrated.";
    const recap = step(lesson, "r1");
    recap.takeaways[0] = "With positive amounts, sharing among 2 or more groups shrinks each share; 2 or more groups exceed one group.";
    const remedialConcept = lesson.remedials?.[0]?.concept;
    if (!remedialConcept) throw new Error("Missing mult-04-05 remedial concept");
    remedialConcept.body = "Quick rewind. With positive amounts, sharing among **two or more** groups makes each share smaller than the pile. Combining **two or more** equal positive groups makes a total larger than one group. A broken size rule proves the result is wrong; then inspect the operation and arithmetic.";
    remedialConcept.narration = remedialConcept.body;
  }

  if (lesson.id === "mult-05-02") {
    const i1 = step(lesson, "i1");
    i1.predict.reveal = "Six is not a square because no whole number multiplied by itself equals 6. Its factor rectangles, 1 × 6 and 2 × 3, both have unequal side lengths. By contrast, 4 = 2 × 2, 9 = 3 × 3, and 16 = 4 × 4 are square numbers.";
    const i2 = step(lesson, "i2");
    i2.body = "Find the two homes for 12 inside this 4-by-4 grid.";
    i2.widget.successFeedback = "Inside this 4-by-4 grid, 12 appears at (3,4) and (4,3). These two off-diagonal cells mirror each other; every off-diagonal cell has one reflected partner.";
  }
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 24) throw new Error(`Expected 24 lessons, found ${files.length}`);

let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);

  for (const [stepId, figure] of Object.entries(visualPlan[lesson.id] ?? {})) {
    step(lesson, stepId).figure = figure;
  }

  for (const [stepId, prompt] of Object.entries(progressionPrompts[lesson.id] ?? {})) {
    const target = step(lesson, stepId);
    if (!target.widget) throw new Error(`Missing widget ${lesson.id}/${stepId}`);
    target.widget.prompt = prompt;
  }

  for (const [stepId, plan] of Object.entries(choicePlan[lesson.id] ?? {})) {
    const target = step(lesson, stepId);
    if (!target.widget) throw new Error(`Missing choice widget ${lesson.id}/${stepId}`);
    if (plan.prompt) target.widget.prompt = plan.prompt;
    replaceOptionLabels(target.widget, plan.labels, lesson.id, stepId);
  }

  if (lesson.id === "mult-04-04") {
    const c2 = step(lesson, "c2");
    c2.body = "Choose each operation from the story's structure. First multiply rows × items to build the whole item total; then subtract items from that total. Subtracting rows or changing every group would act on the wrong quantity.";
    c2.narration = c2.body;
  }

  repairTruth(lesson);

  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} multiplication-division lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  illustrationSourceClosures: 5,
  progressionSourceClosures: 4,
  choiceSurfaceSourceClosures: 7,
  mathematicalTruthRepairs: 5,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
