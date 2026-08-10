/* S120 pre-flight: prove every conversion spec parses, passes its integrity gate, grades its
 * intended answer CORRECT, and can actually reach each of its wrong paths — before a single
 * lesson file is touched. Run: npx tsx scripts/measure/s120-verify.ts */
import { readFileSync } from "node:fs";
import { WidgetSpec, widgetIntegrityErrors, triangleRatio, type TWidget } from "../../src/lib/schema";
import { evaluate, lawOfCosinesAngle, lawOfCosinesSide } from "../../src/lib/evaluate";
import { columnCalcTruth, columnCalcReachable } from "../../src/lib/schema";

type Entry = { lesson: string; step: string; capability: string; widget: unknown };
const SPECS = process.argv.find((a) => a.endsWith(".json")) ?? "scripts/convert/s120-specs.json";
const specs = JSON.parse(readFileSync(SPECS, "utf8")) as {
  conversions: Entry[];
};

/** The dial position that reaches the authored target, or null when nothing integral does — the
 * same search the learner performs, run ahead of them. */
function sasAngleFor(w: { a: number; b: number; target: number }): number | null {
  for (let angle = 15; angle <= 150; angle++)
    if (Math.abs(lawOfCosinesSide(w.a, w.b, angle) - w.target) < 1e-6) return angle;
  return null;
}
function sssSideFor(w: { a: number; b: number; target: number }): number | null {
  for (let c = 2; c <= w.a + w.b - 1; c++)
    if (Math.abs(lawOfCosinesAngle(w.a, w.b, c) - w.target) < 1e-6) return c;
  return null;
}

let bad = 0;
const fail = (id: string, msg: string) => { console.log(`  FAIL ${id}: ${msg}`); bad++; };

for (const c of specs.conversions) {
  const id = `${c.lesson}/${c.step}`;
  let detail = "";
  const parsed = WidgetSpec.safeParse(c.widget);
  if (!parsed.success) { fail(id, "schema: " + parsed.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; ")); continue; }
  const w = parsed.data as TWidget;

  const errs = widgetIntegrityErrors(w);
  if (errs.length) { fail(id, "integrity: " + errs.join("; ")); continue; }

  // The intended-correct value, expressed the way the widget hands it to the grader.
  let right: unknown;
  const wrongs: unknown[] = [];
  if (w.type === "triangleSolve" && w.mode === "ratios") {
    const moves = w.requiredScaleMoves ?? 1;
    right = { angle: w.target, scale: 2, scaleMoves: moves };
    wrongs.push({ angle: w.start, scale: 2, scaleMoves: moves });       // low or high
    wrongs.push({ angle: w.target, scale: 1, scaleMoves: 0 });          // scaleFeedback
  } else if (w.type === "quadDrag") {
    right = { x: w.targetX, y: w.targetY };
    wrongs.push({ x: w.startX, y: w.startY });                          // sideFeedback
    wrongs.push({ x: w.targetX, y: w.targetY === 0 ? 1 : w.targetY - 1 }); // angleFeedback
  } else if (w.type === "coordinateProofLab") {
    right = { x: w.target[0], y: w.target[1], moves: w.requiredMoves, evidence: [...w.requiredEvidence] };
    wrongs.push({ x: w.start[0], y: w.start[1], moves: w.requiredMoves, evidence: [...w.requiredEvidence] }); // position
    wrongs.push({ x: w.target[0], y: w.target[1], moves: 0, evidence: [] });                                  // evidence
  } else if (w.type === "triangleSolve" && w.mode !== "ratios") {
    right = w.mode === "sas" ? sasAngleFor(w) : sssSideFor(w);
    if (right === null) { fail(id, `no integer dial position reaches target ${w.target}`); continue; }
    wrongs.push((right as number) - 1);
    wrongs.push((right as number) + 1);
    // Logged here, where `w` is still narrowed to triangleSolve; the reporting chain below has
    // already exhausted the union by this point and narrows to `never`.
    detail = `triangleSolve ${w.mode} a=${w.a} b=${w.b} -> ${w.target} at dial ${right}`;
  } else if (w.type === "triangleConstraintLab") {
    right = { criterion: w.targetCriterion, angle: w.targetAngle, flipped: false, moves: w.requiredMoves };
    wrongs.push({ criterion: w.startCriterion === w.targetCriterion ? "SSA" : w.startCriterion, angle: w.targetAngle, flipped: false, moves: w.requiredMoves });
    wrongs.push({ criterion: w.targetCriterion, angle: w.angleStart, flipped: false, moves: w.requiredMoves });
    if (w.angleStart === w.targetAngle) fail(id, "angleStart equals targetAngle — no drag required, and angleFeedback is unreachable");
    if ((w.targetAngle - w.angleStart) % w.angleStep !== 0) fail(id, `targetAngle ${w.targetAngle} is not reachable from ${w.angleStart} in steps of ${w.angleStep}`);
  } else if (w.type === "columnCalc") {
    const truth = columnCalcTruth(w.op, w.a, w.b);
    const reach = [...columnCalcReachable(w.op, w.a, w.b)].filter((v) => v !== truth);
    right = { value: truth, complete: true };
    if (reach.length < 1) fail(id, "no wrong final value is reachable — no regrouping decision to get wrong");
    wrongs.push({ value: reach[0], complete: true });
    wrongs.push({ value: truth, complete: false });   // "resolve every column" path
    for (const cr of w.commonResults ?? [])
      if (!columnCalcReachable(w.op, w.a, w.b).has(cr.value)) fail(id, `commonResult ${cr.value} is unreachable — dead feedback`);
    const dec = w.decimals ?? 0;
    const show = (n: number) => (dec ? (n / 10 ** dec).toFixed(dec) : String(n));
    detail = `columnCalc ${show(w.a)} ${w.op} ${show(w.b)} = ${show(truth)}  (${columnCalcReachable(w.op, w.a, w.b).size} reachable finals)`;
  } else if (w.type === "volumeBuilder") {
    // Rebuild the lattice the learner is handed and confirm exactly one setting hits the target.
    const rng = (max: number, lock: boolean, start: number) => (lock ? [start] : Array.from({ length: max }, (_, i) => i + 1));
    const hits: Array<[number, number, number]> = [];
    for (const L of rng(w.lMax, w.lockL, w.lStart))
      for (const W of rng(w.wMax, w.lockW, w.wStart))
        for (const H of rng(w.hMax, w.lockH, w.hStart))
          if (L * W * H === w.targetVolume) hits.push([L, W, H]);
    if (hits.length !== 1) fail(id, `${hits.length} lattice settings reach volume ${w.targetVolume} — the step can be passed without finding the authored answer`);
    const [L, W, H] = hits[0] ?? [0, 0, 0];
    right = { l: L, w: W, h: H };
    // Probe every authored landing at its own lattice setting, plus one setting past the target,
    // so both the named misconceptions and the direction fallback are shown to be reachable.
    for (const cb of w.commonBuilds) {
      let at: [number, number, number] | null = null;
      for (const a of rng(w.lMax, w.lockL, w.lStart)) for (const b of rng(w.wMax, w.lockW, w.wStart)) for (const c of rng(w.hMax, w.lockH, w.hStart))
        if (a * b * c === cb.volume) at ??= [a, b, c];
      if (!at) { fail(id, `commonBuild ${cb.volume} is off the lattice — dead feedback`); continue; }
      wrongs.push({ l: at[0], w: at[1], h: at[2] });
    }
    let over: [number, number, number] | null = null;
    for (const a of rng(w.lMax, w.lockL, w.lStart)) for (const b of rng(w.wMax, w.lockW, w.wStart)) for (const c of rng(w.hMax, w.lockH, w.hStart))
      if (a * b * c > w.targetVolume && !w.commonBuilds.some((x) => x.volume === a * b * c)) over ??= [a, b, c];
    if (!over) fail(id, "no over-shoot is reachable — highFeedback can never fire");
    else wrongs.push({ l: over[0], w: over[1], h: over[2] });
    detail = `volumeBuilder ${L}x${W}x${H} = ${w.targetVolume} (unique on the lattice)`;
  } else if (w.type === "evalOrder") {
    right = { tokens: [String(w.target)] };
    wrongs.push({ tokens: ["1", "+", "1"] });          // not collapsed yet
    for (const cr of w.commonResults ?? []) wrongs.push({ tokens: [String(cr.value)] });
  } else if (w.type === "dilationExplore") {
    right = { k: w.targetK };
    // One probe on each side of the target: a dial whose target sits at an end makes one of the
    // two authored feedbacks unreachable, which is dead copy dressed as diagnosis.
    wrongs.push({ k: w.targetK - w.kStep });
    wrongs.push({ k: w.targetK + w.kStep });
    if (w.targetK - w.kStep < w.kMin) fail(id, `targetK ${w.targetK} sits at the bottom of the dial — lowFeedback can never fire`);
    if (w.targetK + w.kStep > w.kMax) fail(id, `targetK ${w.targetK} sits at the top of the dial — highFeedback can never fire`);
  } else { fail(id, "verifier has no case for " + w.type); continue; }

  const got = evaluate(w, right);
  if (!got.correct) fail(id, "the intended answer grades WRONG: " + got.feedback);

  const seen = new Set<string>();
  for (const v of wrongs) {
    const r = evaluate(w, v);
    if (r.correct) { fail(id, "a wrong-path probe graded correct"); continue; }
    seen.add(r.feedback);
  }
  if (seen.size < 2) fail(id, `wrong paths collapsed — ${seen.size} distinct feedback(s) reachable`);

  // Ratios mode: prove the named ratio genuinely separates start from target, and that the
  // low/high wording matches the direction the ratio actually moves in.
  if (w.type === "triangleSolve" && w.mode === "ratios" && w.ratio) {
    const atStart = triangleRatio(w.start, w.ratio);
    const atTarget = triangleRatio(w.target, w.ratio);
    const dir = atStart < atTarget ? "lowFeedback" : "highFeedback";
    const r = evaluate(w, { angle: w.start, scale: 2, scaleMoves: w.requiredScaleMoves ?? 1 });
    const expected = dir === "lowFeedback" ? w.lowFeedback : w.highFeedback;
    if (r.feedback !== expected) fail(id, `from start the grader should emit ${dir}`);
    // scale invariance is the whole claim: the graded ratio must not depend on scale
    const a = evaluate(w, { angle: w.target, scale: 0.5, scaleMoves: 5 });
    const b = evaluate(w, { angle: w.target, scale: 3, scaleMoves: 5 });
    if (!a.correct || !b.correct) fail(id, "the target angle stops grading correct at some scale");
    console.log(`  ok   ${id.padEnd(14)} ${w.ratio} ${atStart.toFixed(3)} @${w.start}° -> ${atTarget.toFixed(3)} @${w.target}°  (${dir} from start)`);
  } else if (w.type === "columnCalc") {
    const truth = columnCalcTruth(w.op, w.a, w.b);
    const reach = [...columnCalcReachable(w.op, w.a, w.b)].filter((v) => v !== truth);
    right = { value: truth, complete: true };
    if (reach.length < 1) fail(id, "no wrong final value is reachable — no regrouping decision to get wrong");
    wrongs.push({ value: reach[0], complete: true });
    wrongs.push({ value: truth, complete: false });   // "resolve every column" path
    for (const cr of w.commonResults ?? [])
      if (!columnCalcReachable(w.op, w.a, w.b).has(cr.value)) fail(id, `commonResult ${cr.value} is unreachable — dead feedback`);
    const dec = w.decimals ?? 0;
    const show = (n: number) => (dec ? (n / 10 ** dec).toFixed(dec) : String(n));
    detail = `columnCalc ${show(w.a)} ${w.op} ${show(w.b)} = ${show(truth)}  (${columnCalcReachable(w.op, w.a, w.b).size} reachable finals)`;
  } else if (w.type === "volumeBuilder") {
    // Rebuild the lattice the learner is handed and confirm exactly one setting hits the target.
    const rng = (max: number, lock: boolean, start: number) => (lock ? [start] : Array.from({ length: max }, (_, i) => i + 1));
    const hits: Array<[number, number, number]> = [];
    for (const L of rng(w.lMax, w.lockL, w.lStart))
      for (const W of rng(w.wMax, w.lockW, w.wStart))
        for (const H of rng(w.hMax, w.lockH, w.hStart))
          if (L * W * H === w.targetVolume) hits.push([L, W, H]);
    if (hits.length !== 1) fail(id, `${hits.length} lattice settings reach volume ${w.targetVolume} — the step can be passed without finding the authored answer`);
    const [L, W, H] = hits[0] ?? [0, 0, 0];
    right = { l: L, w: W, h: H };
    // Probe every authored landing at its own lattice setting, plus one setting past the target,
    // so both the named misconceptions and the direction fallback are shown to be reachable.
    for (const cb of w.commonBuilds) {
      let at: [number, number, number] | null = null;
      for (const a of rng(w.lMax, w.lockL, w.lStart)) for (const b of rng(w.wMax, w.lockW, w.wStart)) for (const c of rng(w.hMax, w.lockH, w.hStart))
        if (a * b * c === cb.volume) at ??= [a, b, c];
      if (!at) { fail(id, `commonBuild ${cb.volume} is off the lattice — dead feedback`); continue; }
      wrongs.push({ l: at[0], w: at[1], h: at[2] });
    }
    let over: [number, number, number] | null = null;
    for (const a of rng(w.lMax, w.lockL, w.lStart)) for (const b of rng(w.wMax, w.lockW, w.wStart)) for (const c of rng(w.hMax, w.lockH, w.hStart))
      if (a * b * c > w.targetVolume && !w.commonBuilds.some((x) => x.volume === a * b * c)) over ??= [a, b, c];
    if (!over) fail(id, "no over-shoot is reachable — highFeedback can never fire");
    else wrongs.push({ l: over[0], w: over[1], h: over[2] });
    detail = `volumeBuilder ${L}x${W}x${H} = ${w.targetVolume} (unique on the lattice)`;
  } else if (w.type === "evalOrder") {
    right = { tokens: [String(w.target)] };
    wrongs.push({ tokens: ["1", "+", "1"] });          // not collapsed yet
    for (const cr of w.commonResults ?? []) wrongs.push({ tokens: [String(cr.value)] });
  } else if (w.type === "dilationExplore") {
    // k must be REACHABLE on the dial the learner is handed, or the step is unsolvable.
    const steps = (w.targetK - w.kMin) / w.kStep;
    if (Math.abs(steps - Math.round(steps)) > 1e-9)
      fail(id, `targetK ${w.targetK} is not on the dial (kMin ${w.kMin}, kStep ${w.kStep})`);
    if (w.targetK < w.kMin || w.targetK > w.kMax) fail(id, `targetK ${w.targetK} is outside [${w.kMin}, ${w.kMax}]`);
    if (w.kStart === w.targetK) fail(id, "starts on its target — no drag required");
    console.log(`  ok   ${id.padEnd(14)} dilationExplore k ${w.kStart} -> ${w.targetK} (${(w.showRatios ?? []).join("+") || "no readouts"})`);
  } else {
    console.log(`  ok   ${id.padEnd(14)} ${detail || w.type}`);
  }
  if (detail && w.type !== "dilationExplore") console.log(`  ok   ${id.padEnd(14)} ${detail}`);
}

console.log(bad ? `\n${bad} problem(s)` : `\nall ${specs.conversions.length} specs verified`);
process.exit(bad ? 1 : 0);
