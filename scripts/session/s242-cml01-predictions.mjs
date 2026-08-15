#!/usr/bin/env node
/**
 * S242 / CML-01 — THE THREE MISSING FLAGSHIP PREDICTION GATES, AND ONE SIGN PATTERN THAT LIED.
 *
 * WHY THIS SCRIPT EXISTS AT ALL. The strict pedagogy gate had five errors. Two were a stale
 * `DIRECT` set and are fixed in `scripts/cml-lint.mjs`. The remaining three are
 * `flagship-missing-prediction` on `dc-02-02#3`, `pra-04-02#1` and `tf-03-02#1`: three steps
 * carrying a COMPLETE CML contract — kernel, action goal, invariants, misconception signatures, a
 * three-way representation mesh, translation, counterfactual, explanation, fade level, transfer
 * family, delayed retrieval — and no `predict` block. The prediction is the first move of the
 * causal loop the other twelve fields exist to close, so its absence is not cosmetic: the learner
 * manipulates without ever having committed, and the step cannot contradict them.
 *
 * WHY THE PROSE IS NOT INVENTED. Every option below is the step's OWN declared material:
 *   · the correct outcome restates what the widget's authored `successFeedback` already asserts;
 *   · each distractor is one of the step's declared `cml.misconceptions`, named in learner words;
 *   · each reveal restates the step's declared `cml.invariants`.
 * Nothing here introduces a learning construct, a rounding convention, or a claim the lesson does
 * not already make. Where a number appears it was computed and checked against the widget spec —
 * see the assertions at the foot of this file, which refuse to write if any of them is false.
 *
 * THE FOURTH CHANGE IS A CORRECTNESS BUG, FOUND WHILE READING pra-04-02 TO WRITE ITS PREDICTION.
 * Its `successFeedback` opened "− + + +". The deterministic grader in `src/lib/evaluate.ts`
 * returns `+ − + +` for those roots, and direct substitution agrees (p(−4) = +2304, p(−1) = −18,
 * p(1) = +4, p(3) = +162). A learner who set the signs CORRECTLY was congratulated with a summary
 * naming a different answer. Worse, "− + + +" is exactly the pattern produced by the misconception
 * the step is about — crossing at −3 and bouncing at BOTH 0 and 2 — so the success message handed
 * back the error it was written to correct. The reasoning sentence after it was already right and
 * is untouched; only the four symbols change. A corpus-wide sweep of every signChart string that
 * states a full sign pattern found 11 such strings and this one mismatch.
 *
 * Run: node scripts/session/s242-cml01-predictions.mjs [--check]
 * `--check` verifies the edits are present and the arithmetic still holds, and writes nothing.
 */
import fs from "node:fs";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const root = process.cwd();

/** Numbers quoted in the reveals, recomputed here. Nothing is written if one of these is wrong. */
function assertArithmetic() {
  const fails = [];
  // dc-02-02 — 10-ft ladder, dx/dt = 2, dy/dt = −(x/y)·dx/dt.
  const y = (x) => Math.sqrt(100 - x * x);
  const ratio = (x) => x / y(x);
  if (Math.abs(ratio(2) - 0.204) > 0.005) fails.push(`ladder x/y at x=2 is ${ratio(2)}, reveal says ~0.2`);
  if (Math.abs(ratio(6) - 0.75) > 1e-9) fails.push(`ladder x/y at x=6 is ${ratio(6)}, reveal says 0.75`);
  if (Math.abs(y(6) - 8) > 1e-9) fails.push(`ladder y at x=6 is ${y(6)}, widget says 8`);
  if (Math.abs(-ratio(6) * 2 + 1.5) > 1e-9) fails.push(`dy/dt at x=6 is ${-ratio(6) * 2}, widget says −1.5`);
  if (!(Math.abs(ratio(6)) > Math.abs(ratio(2)))) fails.push("ladder: the top does not in fact speed up");

  // pra-04-02 — p(x) = (x+3)x³(x−2)², four intervals, one negative.
  const p = (x) => (x + 3) * x ** 3 * (x - 2) ** 2;
  const signs = [-4, -1, 1, 3].map((x) => (p(x) > 0 ? "+" : "-"));
  if (signs.join(" ") !== "+ - + +") fails.push(`pra-04-02 true signs are ${signs.join(" ")}, reveal says + - + +`);
  if (signs.filter((s) => s === "-").length !== 1) fails.push("pra-04-02: reveal says exactly one negative interval");
  // the "every root flips" reading, built from the right-hand end backwards
  const flip = ["+"];
  for (let i = 0; i < 3; i++) flip.unshift(flip[0] === "+" ? "-" : "+");
  if (flip.filter((s) => s === "-").length !== 2) fails.push("pra-04-02: the flip-every-root distractor is not two negatives");

  // tf-03-02 — 150° leans on 30°; magnitudes equal, cosine negative, sine positive.
  const d = (deg) => (deg * Math.PI) / 180;
  if (Math.abs(Math.cos(d(150)) + Math.cos(d(30))) > 1e-12) fails.push("cos150 ≠ −cos30");
  if (Math.abs(Math.sin(d(150)) - Math.sin(d(30))) > 1e-12) fails.push("sin150 ≠ +sin30");
  if (!(Math.cos(d(150)) < 0 && Math.sin(d(150)) > 0)) fails.push("150° is not (−, +)");
  return fails;
}

const EDITS = [
  {
    file: "content/courses/derivatives-in-context/lessons/dc-02-02.json",
    step: 3,
    predict: {
      prompt:
        "The foot of the ladder is dragged away at a steady 2 ft/s. As it slides out from x = 2 to x = 6, what does the TOP of the ladder do?",
      options: [
        { id: "accelerates", label: "Descends faster and faster" },
        { id: "steady", label: "Descends at a steady 2 ft/s, matching the foot" },
        { id: "eases", label: "Descends more slowly as the ladder flattens out" }
      ],
      outcomeId: "accelerates",
      reveal:
        "The top speeds up. The fixed length ties the two rates to the same clock, giving dy/dt = −(x/y)·dx/dt, so the constant foot speed is multiplied by the ratio x/y — about 0.2 at x = 2 and 0.75 at x = 6. A steady cause need not produce a steady effect."
    }
  },
  {
    file: "content/courses/polynomial-rational-analysis/lessons/pra-04-02.json",
    step: 1,
    predict: {
      prompt:
        "p(x) = (x + 3)x³(x − 2)² cuts the line into four intervals. Before you set a single sign — how many of them are negative?",
      options: [
        { id: "one", label: "One — only the stretch between −3 and 0" },
        { id: "two", label: "Two — every root flips the sign as you pass it" },
        { id: "far-left", label: "One — but it is the far-left stretch, because a repeated root bounces" }
      ],
      outcomeId: "one",
      reveal:
        "One: the signs run + − + +. Parity decides. The cube at 0 is an ODD power, so it crosses — it only flattens on the way through — while the square at 2 is even and bounces, leaving the sign alone. A repeated root is not automatically a bouncing root."
    },
    replace: {
      key: "successFeedback",
      from: "− + + +.",
      to: "+ − + +.",
      why: "authored pattern contradicted signChartSigns and direct substitution; it named the misconception's answer"
    }
  },
  {
    file: "content/courses/trig-functions/lessons/tf-03-02.json",
    step: 1,
    predict: {
      prompt:
        "150° leans on a 30° reference angle. Before you turn the dial — how will the coordinates at 150° compare with the coordinates at 30°?",
      options: [
        { id: "x-negative", label: "Same sizes, but the horizontal coordinate turns negative" },
        { id: "identical", label: "Identical to 30°, signs and all" },
        { id: "swapped", label: "The two coordinates trade places" }
      ],
      outcomeId: "x-negative",
      reveal:
        "Same reference triangle, so the same sizes: cos 150° = −cos 30° and sin 150° = +sin 30°. Quadrant II is where the horizontal coordinate is negative and the vertical one is positive, so only the sign of the x-coordinate changes. The reference angle supplies magnitude; the quadrant supplies sign."
    }
  }
];

/** Rebuild the step object with `predict` between `widget` and `cml`, matching re-04-02's order. */
function withPredict(step, predict) {
  const out = {};
  for (const key of Object.keys(step)) {
    if (key === "cml") out.predict = predict;
    out[key] = step[key];
  }
  if (!("predict" in out)) out.predict = predict;
  return out;
}

const fails = assertArithmetic();
if (fails.length) {
  console.error("REFUSING TO WRITE — a quoted number is wrong:");
  for (const f of fails) console.error("  " + f);
  process.exit(1);
}

let changed = 0;
for (const edit of EDITS) {
  const full = path.join(root, edit.file);
  const raw = fs.readFileSync(full, "utf8");
  const json = JSON.parse(raw);
  if (JSON.stringify(json, null, 2) + "\n" !== raw) {
    console.error(`${edit.file}: does not round-trip at 2-space indent — refusing to reformat it.`);
    process.exit(1);
  }
  const steps = json.steps ?? json.lesson?.steps;
  const step = steps[edit.step];
  if (CHECK) {
    const ok = Boolean(step.predict?.outcomeId === edit.predict.outcomeId);
    const okReplace = !edit.replace || step.widget[edit.replace.key].includes(edit.replace.to);
    console.log(`${ok && okReplace ? "ok  " : "MISS"} ${edit.file}#${edit.step}`);
    if (!ok || !okReplace) process.exitCode = 1;
    continue;
  }
  if (edit.replace) {
    const before = step.widget[edit.replace.key];
    if (!before.includes(edit.replace.from) && !before.includes(edit.replace.to)) {
      console.error(`${edit.file}: expected ${JSON.stringify(edit.replace.from)} in ${edit.replace.key}`);
      process.exit(1);
    }
    step.widget[edit.replace.key] = before.replace(edit.replace.from, edit.replace.to);
  }
  steps[edit.step] = withPredict(step, edit.predict);
  fs.writeFileSync(full, JSON.stringify(json, null, 2) + "\n");
  changed++;
}
if (!CHECK) console.log(`s242-cml01-predictions: ${changed} lesson(s) updated`);
