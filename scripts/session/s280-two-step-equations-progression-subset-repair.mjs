import fs from "node:fs";
import path from "node:path";

const root = path.join("content", "courses", "two-step-equations", "lessons");

const repairs = {
  "tse-01-01": {
    i3: ["Two negatives inside distribution.", "Spot the double-negative sign.", "Distribute: -2(x - 6)", "Which expansion keeps the signs correct in −2(x − 6)?"],
    k2: ["Distribute with a subtraction inside.", "Build an equivalent expression.", "Distribute: 4(x - 3)", "Write the equivalent expression for 4(x − 3) after multiplying each term."],
    ch1: ["A trickier double-negative distribution.", "Repair a sign-error claim.", "Distribute: -5(x - 2)", "A student writes −5(x − 2) = −5x − 10. Build the corrected expansion."],
  },
  "tse-02-01": {
    i3: ["Solve and mentally verify.", "Verify a claimed solution.", "Solve: 4x - 1 = 11", "A student says x = 3 solves 4x − 1 = 11. Enter the value the original equation confirms."],
    k2: ["Another subtraction-first equation.", "Isolate x after removing a constant.", "Solve: 6x - 5 = 25", "After adding 5 to both sides of 6x − 5 = 25, enter x."],
    k3: ["A bigger addition-first equation.", "Use a reverse check.", "Solve: 8x + 7 = 39", "Which x-value makes the original equation 8x + 7 = 39 true? Enter it."],
    ch1: ["A trickier two-step equation.", "Correct a teammate's claim.", "Solve: 7x + 9 = 51", "A teammate claims x = 5 solves 7x + 9 = 51. Verify or correct the claim; enter x."],
  },
  "tse-02-02": {
    i3: ["Another negative solution.", "Trace the sign after isolation.", "Solve: -5x + 1 = 21", "After subtracting 1, −5x + 1 = 21 becomes −5x = 20. Enter the x-value that checks in the original equation."],
    k2: ["Another positive result from negatives.", "Use the quotient's sign.", "Solve: -6x - 4 = -28", "After adding 4 to both sides of −6x − 4 = −28, determine x."],
    k3: ["Another negative-coefficient equation.", "Reject a sign-error claim.", "Solve: -2x + 6 = -12", "A student claims −2x + 6 = −12 has x = −9. Enter the corrected value."],
    ch1: ["A trickier negative-coefficient equation.", "Audit a negative-coefficient solution.", "Solve: -7x - 8 = -43", "Test the claim x = −5 for −7x − 8 = −43. If it fails, enter the value that works."],
  },
  "tse-02-03": {
    i2: ["Solve a negative-coefficient story.", "Interpret a temperature change.", "Solve: -3x + 4 = -11", "A temperature model is −3x + 4 = −11. After the starting value is removed, what does x equal?"],
    k2: ["Another mixed practice equation.", "Check a cooling-model result.", "Solve: -4x - 6 = 18", "A model gives −4x − 6 = 18. Test the sign logic and enter x."],
    k3: ["Another positive-coefficient practice equation.", "Find a rate from a story model.", "Solve: 9x + 5 = 50", "For 9x + 5 = 50, remove the starting amount before entering x."],
  },
  "tse-02-04": {
    k2: ["One more on the balance — this time, plan both moves before you touch a tile.", "Plan the balance moves first.", "Solve 5x + 2 = 17 on the balance.", "On the balance, remove the loose 2s first, then split the remaining tiles for 5x + 2 = 17."],
    ch1: ["The biggest balance yet. Every move must keep the beam level.", "Test the balance invariant.", "Solve 6x + 4 = 28 on the balance.", "Solve 6x + 4 = 28 on the balance, checking after each move that both pans remain equal."],
  },
  "tse-03-01": {
    i3: ["Another parenthesized equation.", "Predict the expanded form.", "Solve: 5(x + 1) = 30", "Before solving 5(x + 1) = 30, identify the expanded equation, then enter x."],
    k2: ["A subtraction-inside equation.", "Check a subtraction distribution.", "Solve: 6(x - 2) = 6", "Use 6(x − 2) = 6: distribute, then enter the x-value that makes the original equation true."],
    k3: ["One more distribute-then-solve.", "Work backward from a candidate.", "Solve: 7(x + 3) = 35", "Test x = 2 in 7(x + 3) = 35. If it works, enter it; otherwise repair the value."],
    ch1: ["A trickier distribute-then-solve equation.", "Diagnose an expanded-equation claim.", "Solve: 8(x - 3) = 16", "A student expands 8(x − 3) = 16 as 8x − 3 = 16. Correct the expansion mentally, then enter x."],
  },
  "tse-03-02": {
    k1: ["Another negative-multiplier equation.", "Check the sign distribution.", "Solve: -3(x + 2) = -15", "A learner turns −3(x + 2) = −15 into −3x − 6 = −15. Use that expansion to enter x."],
    k2: ["Another subtraction-inside equation.", "Compare a sign-safe expansion.", "Solve: -6(x - 2) = 6", "After expanding −6(x − 2), decide which x makes the original equation equal 6."],
    k3: ["One more negative-multiplier equation.", "Audit a negative-factor result.", "Solve: -7(x + 2) = -35", "A student claims x = −3 solves −7(x + 2) = −35. Enter the corrected x-value."],
    ch1: ["A trickier negative-multiplier equation.", "Repair a double-negative solve.", "Solve: -8(x - 3) = -8", "For −8(x − 3) = −8, track the positive constant after distribution and enter x."],
  },
  "tse-03-03": {
    i3: ["A negative multiplier, subtraction inside.", "Verify by substitution.", "Solve: -6(x - 1) = 12", "Does x = −1 satisfy −6(x − 1) = 12? Confirm with the original equation, then enter x."],
    k2: ["Another positive-multiplier equation.", "Choose the expansion path.", "Solve: 2(x + 5) = 20", "Open 2(x + 5) = 20 first, then enter the x-value."],
    k3: ["Another negative-multiplier equation.", "Diagnose the constant sign.", "Solve: -3(x - 3) = -3", "A student writes −3(x − 3) = −3 as −3x − 9 = −3. Correct the sign mentally and enter x."],
    ch1: ["The full mixed challenge.", "Plan a mixed-sign solve.", "Solve: -9(x + 2) = -9", "For −9(x + 2) = −9, identify the distributed constant before entering x."],
  },
  "tse-04-01": {
    k2: ["Another check-in.", "Check the solution boundary.", "Solve: 6x + 4 ≥ 16", "For 6x + 4 ≥ 16, enter the inequality for x after testing the endpoint."],
    k3: ["One more check-in.", "Use a counterexample check.", "Solve: 2x - 5 < 5", "A classmate says 2x − 5 < 5 allows x = 5. Solve the inequality and enter its x-statement."],
  },
  "tse-04-02": {
    i3: ["One more flip.", "Test the flipped ray.", "Solve: -5x + 1 < 21", "A classmate divides −5x + 1 < 21 by −5 but keeps '<'. Solve and enter the corrected inequality."],
  },
  "tse-04-03": {
    k3: ["One more negative-coefficient story.", "Translate the sign flip into context.", "Solve: -2x - 5 > 5", "A cooling model −2x − 5 > 5 has a negative rate. Solve it and enter the qualifying x-values."],
  },
};

function updateExact(value, legacy, expected, label) {
  if (value === expected) return false;
  if (value !== legacy) throw new Error(`${label} has unexpected source; refusing an unreviewed overwrite`);
  return true;
}

function replaceExactField(raw, field, legacy, expected, label) {
  const source = `"${field}": ${JSON.stringify(legacy)}`;
  const replacement = `"${field}": ${JSON.stringify(expected)}`;
  const matches = raw.split(source).length - 1;
  if (matches !== 1) throw new Error(`${label} does not have one exact serialized source field`);
  return raw.replace(source, replacement);
}

let writes = 0;
for (const [lessonId, lessonRepairs] of Object.entries(repairs)) {
  const file = path.join(root, `${lessonId}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const lesson = JSON.parse(raw);
  let rewritten = raw;
  let changed = false;
  for (const [stepId, [legacyBody, body, legacyPrompt, prompt]] of Object.entries(lessonRepairs)) {
    const step = lesson.steps?.find((candidate) => candidate.id === stepId);
    if (!step?.widget) throw new Error(`${lessonId}/${stepId} is missing its widget`);
    const bodyChanged = updateExact(step.body, legacyBody, body, `${lessonId}/${stepId}/body`);
    if (bodyChanged) rewritten = replaceExactField(rewritten, "body", legacyBody, body, `${lessonId}/${stepId}/body`);
    const promptChanged = updateExact(step.widget.prompt, legacyPrompt, prompt, `${lessonId}/${stepId}/prompt`);
    if (promptChanged) rewritten = replaceExactField(rewritten, "prompt", legacyPrompt, prompt, `${lessonId}/${stepId}/prompt`);
    changed = bodyChanged || promptChanged || changed;
  }
  if (changed) {
    fs.writeFileSync(file, rewritten);
    writes += 1;
  }
}

console.log(`S280 two-step-equations: ${writes} clean subset lessons repaired; rerun is a no-op`);
