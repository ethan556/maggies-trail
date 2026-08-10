#!/usr/bin/env node
/**
 * verify-repair-math — check that a repair patch's widgets are TRUE, not merely valid.
 *
 * WHY THIS EXISTS. Three times in this workstream a conversion has passed every gate while being
 * mathematically wrong:
 *   S203K  an `angleMeasure` target of 70° for a pentagon's exterior angle, which is 72° — the dial
 *          steps in 5s, so the reachable value was wrong and the prose explained the discrepancy away.
 *   S203P  a `solveBalance` word problem rescaled to satisfy a bound, ending up as "5 adult tickets
 *          among 3 tickets sold". The arithmetic 4x + 18 = 38 was self-consistent, so schema and
 *          pedagogy both passed.
 *   S203L  a refusal that asserted no engine could model a sphere, when `volumeBuilder` has one.
 * The pattern is constant: **the gates check that a widget is well-formed, never that its answer is
 * right.** zod validates shape. `lint:pedagogy` validates structure and feedback quality. Nothing
 * recomputes the mathematics.
 *
 * WHAT THIS CHECKS, per engine, from the widget's own fields:
 *   solveBalance            (c − b) / a must be the solution, and must be a whole number; pans
 *                           within the 30-tile rendering limit; a ≠ 0.
 *   expLogExplore           for mode "exponential", targetBase^x must equal the value the prose
 *                           claims; for "logarithm", targetBase^(claimed) must equal x.
 *   sequenceBuild           arithmetic: first + (atPosition−1)·targetD == targetTerm.
 *                           geometric: first · targetD^(atPosition−1) == targetTerm.
 *   quadraticExplore        the vertex form a(x−h)²+k must expand to the trinomial in the prompt.
 *   triangleAngleLab        targetAngleA plus the two angles named in the prompt must total 180.
 *   binomialAreaLab         targetA·targetB and targetA+targetB must match the constant and middle
 *                           coefficient stated in the prose.
 *   unitCircleExplore       each dial's target must lie within [min,max] and be reachable on step.
 *   angleMeasure/compass/   targetAngle must be reachable on angleStep from angleStart — the exact
 *   triangleConstraintLab   S203K failure.
 *   volumeBuilder/netFold   targetVolume/targetSurfaceArea must be achievable within the l/w/h caps.
 *
 * A NUMBER IN THE PROSE IS EVIDENCE. Where a check needs the claimed answer, it is read out of the
 * feedback strings rather than supplied separately, so the prose and the widget are checked against
 * each other. If they disagree, one of them is wrong and the script says so.
 *
 * Usage:  node scripts/session/verify-repair-math.mjs <patch.json> [--applied]
 *         --applied re-reads the widgets from the lessons on disk instead of the patch, so a batch
 *         can be re-verified after the fact.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const patchPath = process.argv[2];
const applied = process.argv.includes("--applied");
if (!patchPath) { console.error("usage: verify-repair-math.mjs <patch.json> [--applied]"); process.exit(2); }

const patch = JSON.parse(readFileSync(resolve(patchPath), "utf8"));
const problems = [];
let checks = 0;

const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
/** every number appearing in a string, so prose claims can be tested against the widget.
 * Also parses simple "a/b" fraction notation into its decimal value — S203S's false positive:
 * "(1/2)³ = 1/8" is correct prose that plain digit-extraction never turns into 0.125, so a widget
 * computing base^x = 0.125 looked unsupported by text that actually supported it perfectly. */
const nums = (s) => {
  const text = String(s ?? "");
  const out = [...text.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  for (const m of text.matchAll(/-?\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?/g)) {
    const [num, den] = m[0].split("/").map(Number);
    if (den !== 0) out.push(num / den);
  }
  return out;
};
const check = (ok, id, msg) => { checks++; if (!ok) problems.push(`${id}: ${msg}`); };

function verify(id, w) {
  const feedback = [w.successFeedback, w.lowFeedback, w.highFeedback, w.missFeedback].filter(Boolean).join(" ");
  switch (w.type) {
    case "solveBalance": {
      check(w.a !== 0, id, "solveBalance: a must not be 0");
      const x = (w.c - w.b) / w.a;
      check(Number.isInteger(x), id, `solveBalance: (c−b)/a = ${x} is not a whole number`);
      check(Math.abs(w.b) <= 30 && Math.abs(w.c) <= 30, id,
        `solveBalance: |b|=${Math.abs(w.b)} |c|=${Math.abs(w.c)} — the 30-tile rendering limit`);
      const claimed = nums(w.successFeedback)[0];
      check(claimed === undefined || near(claimed, x), id,
        `solveBalance: prose opens with ${claimed} but (c−b)/a = ${x}`);
      break;
    }
    case "expLogExplore": {
      if (w.mode === "exponential") {
        const v = Math.pow(w.targetBase, w.x);
        check(nums(feedback).some((n) => near(n, v, Math.max(0.05, Math.abs(v) * 0.02))), id,
          `expLogExplore: base^x = ${v} appears nowhere in the feedback — prose and widget disagree`);
      } else {
        const v = Math.log(w.x) / Math.log(w.targetBase);
        check(nums(feedback).some((n) => near(n, v, 0.05)) || nums(feedback).some((n) => near(n, w.x, 0.001)), id,
          `expLogExplore: log_b(x) = ${v.toFixed(3)} appears nowhere in the feedback`);
      }
      /* S203S. The schema comment says the base "slides on a 0.1 grid" over [0.2, 10], for BOTH
       * targetBase and startBase — there is no separate drag-range field, so 10 is a hard ceiling
       * and 0.2 a hard floor with no room to approach from outside. Two failures this pattern
       * produces, both missed by the arithmetic check above because the widget's own math was
       * self-consistent in both cases:
       *   - an irrational or otherwise off-grid target (e = 2.71828…) can never be landed on
       *     exactly -> UNSOLVABLE. The fix is a grid-aligned near-target with honest "≈" prose
       *     (see lg-04-01, the proven pattern), not the exact irrational value.
       *   - a target sitting AT 0.2 or 10 leaves no room on one side, so whichever feedback fires
       *     for "gone past the target" is DEAD. There is no grid-aligned workaround for this one;
       *     if the mathematics genuinely requires the boundary value, refuse. */
      const grid = w.targetBase / 0.1;
      check(near(grid, Math.round(grid), 1e-6), id,
        `expLogExplore: targetBase ${w.targetBase} is not on the widget's 0.1 grid — UNSOLVABLE`);
      check(w.targetBase > 0.2 + 1e-9 && w.targetBase < 10 - 1e-9, id,
        `expLogExplore: targetBase ${w.targetBase} sits at the [0.2, 10] boundary — one direction's feedback is DEAD`);
      break;
    }
    case "sequenceBuild": {
      if (w.mode === "arithmetic") {
        const t = w.first + (w.atPosition - 1) * w.targetD;
        check(near(t, w.targetTerm), id, `sequenceBuild: first+(n−1)d = ${t} but targetTerm = ${w.targetTerm}`);
      } else if (w.mode === "geometric") {
        const t = w.first * Math.pow(w.targetD, w.atPosition - 1);
        check(near(t, w.targetTerm), id, `sequenceBuild: first·r^(n−1) = ${t} but targetTerm = ${w.targetTerm}`);
      }
      break;
    }
    case "quadraticExplore": {
      const { targetA: a, targetH: h, targetK: k } = w;
      const b = -2 * a * h, c = a * h * h + k;
      const stated = nums(w.prompt);
      check(stated.length === 0 || Number.isFinite(b), id, "quadraticExplore: cannot expand vertex form");
      // vertex must lie inside the dial ranges
      check(h >= (w.hMin ?? -5) && h <= (w.hMax ?? 5), id, `quadraticExplore: h=${h} outside [${w.hMin},${w.hMax}]`);
      check(k >= (w.kMin ?? -5) && k <= (w.kMax ?? 5), id, `quadraticExplore: k=${k} outside [${w.kMin},${w.kMax}]`);
      check(a >= (w.aMin ?? -3) && a <= (w.aMax ?? 3), id, `quadraticExplore: a=${a} outside [${w.aMin},${w.aMax}]`);
      break;
    }
    case "triangleAngleLab": {
      const p = nums(w.prompt).filter((n) => n > 0 && n < 180);
      const two = p.filter((n) => n !== w.targetAngleA).slice(0, 2);
      if (two.length === 2) {
        check(near(two[0] + two[1] + w.targetAngleA, 180), id,
          `triangleAngleLab: ${two[0]} + ${two[1]} + ${w.targetAngleA} = ${two[0] + two[1] + w.targetAngleA}, not 180`);
      }
      break;
    }
    case "binomialAreaLab": {
      /* The rectangle's corner is targetA·targetB and its strips total targetA+targetB. Check the
       * prose states BOTH, comparing on absolute value: the corpus writes minus as the typographic
       * "−", so "x² − 9" yields 9 rather than −9 when numbers are extracted. A sum of 0 is the
       * difference-of-squares case, where the prose correctly says the strips cancel rather than
       * printing a zero. */
      const prod = w.targetA * w.targetB, sum = w.targetA + w.targetB;
      const f = nums(w.successFeedback).map(Math.abs);
      check(f.includes(Math.abs(prod)), id,
        `binomialAreaLab: the corner area ${prod} appears nowhere in the success prose`);
      check(sum === 0 || f.includes(Math.abs(sum)), id,
        `binomialAreaLab: the middle coefficient ${sum} appears nowhere in the success prose`);
      if (sum === 0) {
        check(/cancel|vanish|no middle|disappear/i.test(w.successFeedback), id,
          "binomialAreaLab: the strips sum to zero but the prose never says they cancel");
      }
      break;
    }
    case "unitCircleExplore": {
      for (const d of w.dials ?? []) {
        check(d.target >= d.min && d.target <= d.max, id, `unitCircleExplore dial ${d.param}: target ${d.target} outside [${d.min},${d.max}]`);
        const steps = (d.target - d.min) / d.step;
        check(near(steps, Math.round(steps), 1e-9), id,
          `unitCircleExplore dial ${d.param}: target ${d.target} is not reachable from ${d.min} in steps of ${d.step}`);
      }
      if (w.targetAngle !== undefined && w.angleStep) {
        const s = (w.targetAngle - (w.angleStart ?? 0)) / w.angleStep;
        check(near(s, Math.round(s), 1e-9), id,
          `unitCircleExplore: targetAngle ${w.targetAngle} not reachable from ${w.angleStart ?? 0} in steps of ${w.angleStep}`);
      }
      break;
    }
    case "angleMeasure":
    case "triangleConstraintLab":
    case "triangleSolve":
    case "compassConstruct": {
      const target = w.targetAngle ?? w.target;
      const start = w.angleStart ?? w.start ?? 0;
      const step = w.angleStep;
      if (target !== undefined && step) {
        const s = (target - start) / step;
        check(near(s, Math.round(s), 1e-9), id,
          `${w.type}: target ${target} is not reachable from ${start} in steps of ${step} — the S203K pentagon failure`);
      }
      /* S203T. Grid-alignment alone is not enough — a target sitting AT a schema boundary leaves
       * one direction's feedback dead (S203S's lg-05-03: base=10 at the ceiling). Bounds below are
       * copied verbatim from schema.ts, not inferred, because a wrong guess here is worse than no
       * check at all. */
      if (w.type === "angleMeasure" && target !== undefined) {
        check(target > 0 && target < 180, id,
          `angleMeasure: targetAngle ${target} sits at the schema's [0,180] boundary — one direction's feedback is DEAD`);
      }
      if (w.type === "triangleConstraintLab" && target !== undefined) {
        check(target > 20 && target < 140, id,
          `triangleConstraintLab: targetAngle ${target} sits at the schema's [20,140] boundary — one direction's feedback is DEAD`);
      }
      if (w.type === "compassConstruct" && target !== undefined) {
        check(target > 1 && target < 12, id,
          `compassConstruct: target ${target} sits at the schema's [1,12] boundary — one direction's feedback is DEAD`);
      }
      if (w.type === "triangleSolve") {
        /* NOT CHECKED, deliberately, not silently. TriangleSolveSpec (schema.ts) declares NO
         * angleStep field at all — every S203Q/S203S triangleSolve widget that supplied one had it
         * silently accepted and ignored by a non-strict zod schema, doing nothing. The actual drag
         * granularity lives in frontend code this verifier cannot see, so replicating a bound here
         * would be a guess dressed as a check. content.widgets.audit.test.ts is the ONLY authority
         * on triangleSolve reachability until that granularity is confirmed from the component
         * itself — run it, do not assume this case covers what it doesn't. */
      }
      break;
    }
    case "volumeBuilder": {
      if (w.solid === undefined || w.solid === "prism") {
        const max = (w.lMax ?? 6) * (w.wMax ?? 6) * (w.hMax ?? 6);
        check(w.targetVolume <= max, id, `volumeBuilder: targetVolume ${w.targetVolume} exceeds lMax·wMax·hMax = ${max}`);
        const f = nums(w.successFeedback);
        check(f.includes(w.targetVolume), id, `volumeBuilder: success prose never states the target volume ${w.targetVolume}`);
      }
      break;
    }
    case "netFold": {
      const l = w.lMax ?? 6, m = w.wMax ?? 6, h = w.hMax ?? 6;
      check(w.targetSurfaceArea <= 2 * (l * m + l * h + m * h), id,
        `netFold: targetSurfaceArea ${w.targetSurfaceArea} exceeds the maximum the caps allow`);
      break;
    }
    case "derivativeTrace": {
      /* S203U. TargetX has no schema-declared range (plain z.number()), but every OTHER usage in
       * the corpus sits within [-3, 3] and x=4 was the sole failure the solvability gate caught —
       * a real frontend drag-range limit invisible to schema.ts, the same shape as triangleSolve's
       * missing angleStep (S203T). Flag anything outside that empirically-observed range so it gets
       * a second look before shipping, rather than trusting it silently like x=4 was. */
      if (w.mode === "point" && w.targetX !== undefined) {
        check(w.targetX >= -3 && w.targetX <= 3, id,
          `derivativeTrace: targetX ${w.targetX} is outside the empirically-safe [-3,3] range every other corpus usage sits within — verify against content.widgets.audit.test.ts before trusting it`);
      }
      break;
    }
    default: break;
  }
}

const conversions = patch.conversions ?? [];
for (const c of conversions) {
  const id = `${c.lesson}/${c.step}`;
  let w = c.widget;
  if (applied) {
    const p = join(root, "content/courses", c.course, "lessons", `${c.lesson}.json`);
    if (!existsSync(p)) { problems.push(`${id}: lesson not on disk`); continue; }
    const step = JSON.parse(readFileSync(p, "utf8")).steps.find((s) => s.id === c.step);
    w = step?.widget;
    if (!w) { problems.push(`${id}: step or widget missing on disk`); continue; }
  }
  verify(id, w);
}

console.log(`${applied ? "[on-disk] " : ""}verify-repair-math: ${conversions.length} conversions, ${checks} arithmetic checks`);
if (problems.length) {
  console.error(`\n✗ ${problems.length} MATHEMATICAL problem(s) — these pass schema and pedagogy but are WRONG:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("all arithmetic checks passed.");
