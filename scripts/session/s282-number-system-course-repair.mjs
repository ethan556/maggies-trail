import fs from "node:fs";
import path from "node:path";

const lessonsDir = path.join("content", "courses", "number-system", "lessons");

const visualResyncs = {
  "ns-01-01": {
    c2: {
      figure: "fm-divide-unit",
      legacy: "Notice the pattern: dividing by a fraction SMALLER than 1 always makes the answer **bigger** than the number you started with (3 ÷ 1/4 = 12, way more than 3). That's because you're asking how many small pieces fit — and small pieces, there are many. This is the opposite of what dividing by a whole number usually feels like.",
      body: "Use the same \"how many fit?\" idea with thirds: **2 ÷ 1/3 = 6.** Each of the 2 wholes contains 3 thirds, so there are 6 small pieces. When the divisor is a fraction smaller than 1, the count can be bigger than the number you started with."
    }
  },
  "ns-01-02": {
    c1: {
      figure: "ns-flip-multiply",
      legacy: "Counting pieces works, but there's a shortcut for ANY fraction ÷ fraction: **keep the first fraction, flip the second (find its reciprocal), and multiply.** 3/4 ÷ 1/8 becomes 3/4 × 8/1 = 24/4 = **6**. The reciprocal of a fraction swaps its top and bottom — the reciprocal of 1/8 is 8/1, or just 8.",
      body: "Counting pieces works, and the shortcut for dividing by a nonzero fraction is: **keep the first fraction, flip the second, then multiply.** For example, 3/4 ÷ 1/2 becomes 3/4 × 2/1 = 6/4 = **3/2**. The reciprocal swaps a fraction's top and bottom."
    }
  },
  "ns-02-02": {
    c2: {
      figure: "dop-pad-borrow",
      legacy: "Subtraction lines up the same way — and sometimes needs **borrowing across the decimal point**. 20 − 4.35: write 20 as 20.00, then subtract: borrow from the ones and tens as needed. The decimal point itself never moves; only the digits around it do.",
      body: "Subtraction lines up the same way — and sometimes needs **borrowing across the decimal point**. For 5 − 1.75, write 5 as 5.00, then borrow as needed: **5.00 − 1.75 = 3.25.** The decimal point itself never moves; only the digits around it do."
    }
  },
  "ns-02-03": {
    c1: {
      figure: "dop-count-places",
      legacy: "Multiplying decimals: ignore the points, multiply the whole numbers, then **count total decimal places** and place the point. 2.5 × 1.4: 25 × 14 = 350; both factors together have 2 decimal places, so the answer gets 2: **3.50**, which is 3.5.",
      body: "Multiplying decimals: ignore the points, multiply the whole numbers, then **count total decimal places** and place the point. For 1.2 × 0.5: 12 × 5 = 60; both factors together have 2 decimal places, so the product is **0.60**."
    }
  },
  "ns-04-01": {
    c2: {
      figure: "ns-opposites",
      legacy: "Every positive number has an **opposite** — the same distance from zero, but on the other side. The opposite of 5 is −5; the opposite of −3 is 3. Zero is its own opposite. On the line, opposites are mirror images across 0, always the same number of steps from the center.",
      body: "Every positive number has an **opposite** — the same distance from zero, but on the other side. The opposite of 4 is −4, and the opposite of −4 is 4. Zero is its own opposite. On the line, opposites are mirror images across 0, always the same number of steps from the center."
    }
  },
  "ns-05-02": {
    c2: {
      figure: "ns-abs-compare",
      legacy: "This is exactly how **debt** works. Owing $50 is a bigger debt than owing $20 — the MAGNITUDE (|−50| = 50) is larger. But as an amount of money you have, −50 is WORSE — a smaller value than −20. Bigger absolute value, smaller actual value. Real situations need you to know which question you're answering.",
      body: "Order and absolute value answer different questions. On the line, **−5 < 3**, so −5 is the smaller number. But **|−5| = 5** is greater than **|3| = 3**, because −5 is farther from zero. A larger absolute value means a greater distance, not a greater position on the number line."
    }
  }
};

const withheldVisuals = {
  "ns-01-02": { c2: "ns-flip-multiply" },
  "ns-01-03": { c1: "fm-divide-unit", c2: "fm-divide-unit" },
  "ns-02-03": { c2: "decimal-shift" },
  "ns-05-03": { c2: "negative-number-line" }
};

const progressionRepairs = {
  "ns-01-01": {
    k3: ["Read a division from a picture.", "Model a cut before counting.", "How many 2/8s fit in 6/8? (6/8 ÷ 2/8)", "A 6/8-meter strip is cut into pieces that are 2/8 meter long. How many equal pieces fit?", "numeric"]
  },
  "ns-01-02": {
    k3: ["Simplify after multiplying.", "Audit the simplification.", "Compute 5/6 ÷ 1/3. Give the answer as a fraction with denominator 2 — enter just the numerator.", "A learner gets 15/6 after keeping 5/6 and flipping 1/3. Reduce it to a fraction with denominator 2 — enter the numerator.", "quotientReasoningLab"]
  },
  "ns-02-01": {
    ch1: ["A four-digit dividend.", "Verify a proposed quotient.", "Compute 1248 ÷ 24.", "A learner says 1248 ÷ 24 = 52. Check with multiplication, then enter the quotient.", "quotientReasoningLab"]
  },
  "ns-02-02": {
    k3: ["Another subtract.", "Estimate, then subtract.", "Compute 15 − 6.25.", "First estimate, then compute 15 − 6.25. Enter the exact difference.", "numeric"]
  },
  "ns-02-03": {
    k3: ["Another divide.", "Make the divisor whole first.", "Compute 4.8 ÷ 0.4.", "Shift both decimals to make the divisor whole, then compute 4.8 ÷ 0.4.", "numeric"],
    ch1: ["Multiply, then divide, with the same numbers.", "Decide whether the quotient is whole.", "Compute 15.6 ÷ 2.6.", "Will 15.6 ÷ 2.6 be a whole number? Make the divisor whole, then enter the quotient.", "numeric"]
  },
  "ns-03-02": {
    k2: ["One divides the other.", "Use the containment shortcut.", "Find the LCM of 5 and 10.", "Without listing multiples, find the LCM of 5 and 10 when one number divides the other.", "numeric"]
  },
  "ns-05-01": {
    k3: ["Absolute value of zero.", "Audit the zero boundary.", "What is |0|?", "A classmate says |0| = 1. Enter the correct value of |0|.", "numeric"]
  },
  "ns-05-03": {
    k3: ["Fraction vs decimal, both positive.", "Benchmark before comparing.", "Which is greater: 2/5 or 0.6?", "Use 0.5 as a benchmark. Which is greater: 2/5 or 0.6?", "rationalCompare"]
  }
};

const choiceRepairs = {
  "ns-03-03": {
    k2: [
      ["a", true, "6 × (2 + 4) = 36, but 12 + 18 = 30 — the second leftover should be 3, not 4", "Expansion gives 36, not 30"],
      ["b", false, "Nothing — it's correct", "Expansion gives the same total"],
      ["c", false, "The GCF 6 is too big", "The common factor is too large"]
    ]
  },
  "ns-04-03": {
    k3: [
      ["a", true, "None — it's on the y-axis", "No quadrant: y-axis"],
      ["b", false, "Quadrant I", "Quadrant I: upper right"],
      ["c", false, "Quadrant II", "Quadrant II: upper left"]
    ]
  }
};

const conceptTagRepairs = {
  "ns-04b-01": { i1: "ordered-pair-signs", i2: "ordered-pair-signs" }
};

function updateExact(value, legacy, expected, label) {
  if (value === expected) return false;
  if (value !== legacy) throw new Error(`${label} has unexpected source; refusing an unreviewed overwrite`);
  return true;
}

function getStep(lesson, stepId) {
  const step = lesson.steps?.find((candidate) => candidate.id === stepId);
  if (!step) throw new Error(`${lesson.id}/${stepId} is missing`);
  return step;
}

const targetedLessonIds = new Set([
  ...Object.keys(visualResyncs),
  ...Object.keys(withheldVisuals),
  ...Object.keys(progressionRepairs),
  ...Object.keys(choiceRepairs),
  ...Object.keys(conceptTagRepairs)
]);

let changedFields = 0;
let writtenLessons = 0;
for (const lessonId of targetedLessonIds) {
  const file = path.join(lessonsDir, `${lessonId}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const indent = raw.match(/\n( +)"/)?.[1].length ?? 2;
  const lesson = JSON.parse(raw);
  let changed = false;

  for (const [stepId, target] of Object.entries(visualResyncs[lessonId] ?? {})) {
    const step = getStep(lesson, stepId);
    if (step.figure !== target.figure) throw new Error(`${lessonId}/${stepId} figure changed from ${target.figure}`);
    if (updateExact(step.body, target.legacy, target.body, `${lessonId}/${stepId}/body`)) {
      step.body = target.body;
      changed = true;
      changedFields += 1;
    }
  }

  for (const [stepId, legacyFigure] of Object.entries(withheldVisuals[lessonId] ?? {})) {
    const step = getStep(lesson, stepId);
    if (step.figure === undefined) continue;
    if (step.figure !== legacyFigure) throw new Error(`${lessonId}/${stepId} figure changed from ${legacyFigure}`);
    delete step.figure;
    changed = true;
    changedFields += 1;
  }

  for (const [stepId, [legacyBody, body, legacyPrompt, prompt, widgetType]] of Object.entries(progressionRepairs[lessonId] ?? {})) {
    const step = getStep(lesson, stepId);
    if (step.widget?.type !== widgetType) throw new Error(`${lessonId}/${stepId} widget changed from ${widgetType}`);
    if (updateExact(step.body, legacyBody, body, `${lessonId}/${stepId}/body`)) {
      step.body = body;
      changed = true;
      changedFields += 1;
    }
    if (updateExact(step.widget.prompt, legacyPrompt, prompt, `${lessonId}/${stepId}/prompt`)) {
      step.widget.prompt = prompt;
      changed = true;
      changedFields += 1;
    }
  }

  for (const [stepId, options] of Object.entries(choiceRepairs[lessonId] ?? {})) {
    const step = getStep(lesson, stepId);
    if (step.widget?.type !== "mcq") throw new Error(`${lessonId}/${stepId} no longer has its MCQ evaluator`);
    if (step.widget.options?.length !== options.length) throw new Error(`${lessonId}/${stepId} option count changed`);
    for (const [id, correct, legacy, label] of options) {
      const option = step.widget.options.find((candidate) => candidate.id === id);
      if (!option || Boolean(option.correct) !== correct) throw new Error(`${lessonId}/${stepId}/${id} evaluator truth changed`);
      if (updateExact(option.label, legacy, label, `${lessonId}/${stepId}/${id}/label`)) {
        option.label = label;
        changed = true;
        changedFields += 1;
      }
    }
  }

  for (const [stepId, conceptTag] of Object.entries(conceptTagRepairs[lessonId] ?? {})) {
    const step = getStep(lesson, stepId);
    if (step.widget?.type !== "plotPoint") throw new Error(`${lessonId}/${stepId} no longer has its plot-point evaluator`);
    if (step.conceptTag === conceptTag) continue;
    if (step.conceptTag !== undefined) throw new Error(`${lessonId}/${stepId} already has a different concept tag`);
    step.conceptTag = conceptTag;
    changed = true;
    changedFields += 1;
  }

  if (changed) {
    fs.writeFileSync(file, `${JSON.stringify(lesson, null, indent)}\n`);
    writtenLessons += 1;
  }
}

console.log(`S282 number-system: ${writtenLessons} lesson files updated; ${changedFields} guarded source fields changed; rerun is a no-op`);
