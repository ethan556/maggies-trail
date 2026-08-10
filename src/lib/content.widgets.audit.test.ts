// SOLVABILITY GATE.
//
// The schema linter checks that a widget is well-FORMED. The pedagogy linter checks that its prose
// obeys the rules. Neither can tell you whether a learner can actually SOLVE it — and this session's
// QA pass found a lesson (fna-01-02) whose target sat outside its own slider, plus four widgets whose
// wrong-path feedback could never fire and two that opened already correct.
//
// So: for every widget instance in the content, walk its real input space through the REAL grader and
// assert three things.
//   SOLVABLE      some input grades correct
//   NOT PRE-SOLVED  the starting input does not
//   NO DEAD PATHS   every distinct wrong-path feedback string is actually reachable
//
// A wrong path that cannot occur is worse than no wrong path: it looks like diagnosis and is
// decoration.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate, signChartCuts } from "./evaluate";
import { widgetWrongPaths } from "./pedagogy";
import { WidgetSpec, sequenceReasoningTruth, type TWidget } from "./schema";

const ROOT = join(process.cwd(), "content", "courses");

function allWidgets(): Array<{ lesson: string; w: TWidget }> {
  const out: Array<{ lesson: string; w: TWidget }> = [];
  for (const course of readdirSync(ROOT)) {
    const dir = join(ROOT, course, "lessons");
    let files: string[] = [];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of files) {
      const L = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps: Array<{ widget?: unknown }>;
      };
      // Fixture rule: widgets go through WidgetSpec.parse so zod defaults (e.g.
      // commonPlacements: []) materialize — evaluate()'s type contract is PARSED
      // specs, and raw JSON casts were exactly how defaulted-array derefs slipped
      // past this gate.
      for (const s of L.steps) if (s.widget) out.push({ lesson: L.id, w: WidgetSpec.parse(s.widget) as TWidget });
    }
  }
  return out;
}

const range = (lo: number, hi: number, step = 1): number[] => {
  const out: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
};

/** The candidate inputs a learner can actually produce, and the input the widget opens on.
 * Returns null for widget types this gate does not model (they keep their own tests). */
function space(w: TWidget): { candidates: unknown[]; start: unknown } | null {
  switch (w.type) {
    case "circleAngleExplore":
      return { candidates: range(20, 340, 2), start: w.startArc };
    case "expLogExplore":
      return { candidates: range(0.2, 10, 0.1), start: w.startBase };
    case "secantSlope": {
      const G = Math.max(2, Math.abs(w.targetH) + 1);
      return { candidates: range(-G, G, 0.05), start: w.startH };
    }
    case "circleMeasureExplore": {
      // radiusScale's input is the RADIUS itself over [1, radiusMax] — a different domain from the
      // three modes that hold the circle fixed and move something inside it.
      if (w.mode === "radiusScale") return { candidates: range(1, w.radiusMax ?? 10), start: 1 };
      const c =
        w.mode === "chordDistance"
          ? range(0, w.radius - 1)
          : w.mode === "tangentLength"
            ? range(w.radius + 1, 3 * w.radius)
            : range(15, 345, 15);
      return { candidates: c, start: w.start };
    }
    case "polarTrace":
      return { candidates: range(1, w.mode === "rose" ? 6 : 5), start: w.start };
    case "sequenceBuild": {
      // S151 extended this engine past its legacy "dial a number" shape: non-dial tasks now
      // take a STATE OBJECT {explored, numeric|choiceId} and gate on requiredExplorations /
      // requiredStageKeys before grading. Probing them with bare numbers can never satisfy
      // that gate, so 24 perfectly solvable lessons read as UNSOLVABLE. Dial tasks keep the
      // numeric domain; the rest are probed with the state the runtime actually receives.
      if (w.task === "dial") {
        return { candidates: w.mode === "arithmetic" ? range(-5, 9) : range(1, 9), start: w.start };
      }
      const truth = sequenceReasoningTruth(w);
      const explored = truth.stages.map((stage) => stage.key);
      const candidates: unknown[] = [];
      if (w.answerMode === "numeric") {
        if (truth.answerNumber !== undefined) candidates.push({ explored, numeric: truth.answerNumber });
        for (const err of w.numericErrors) candidates.push({ explored, numeric: err.value });
        // fallbackFeedback only fires on a wrong number that ISN'T a named trap — the two
        // probes above alone can never reach it, which is exactly why it read as dead. Any
        // untrapped value proves it (skip if it accidentally lands on the answer or a trap).
        const taken = new Set([truth.answerNumber, ...w.numericErrors.map((e) => e.value)]);
        for (const probe of [-9999, 9999, 0.5]) if (!taken.has(probe)) { candidates.push({ explored, numeric: probe }); break; }
      } else {
        for (const choice of w.choices) candidates.push({ explored, choiceId: choice.id });
      }
      // An under-explored state proves the exploration gate itself is reachable, not dead.
      candidates.push({ explored: [], choiceId: w.choices[0]?.id });
      return { candidates, start: undefined };
    }
    case "triangleSolve":
      // ratios mode carries an OBJECT value {angle, scale, scaleMoves}, not the bare number sas/sss
      // use. Enumerate angles across the acute range (the only range triangleRatio is posed on),
      // each paired with enough scale moves to clear the requiredScaleMoves gate — otherwise every
      // candidate stalls on scaleFeedback and the widget reads as unsolvable. `start` is modelled
      // as the authored bare number, which the ratios evaluator correctly refuses (so a ratios
      // widget can never read as pre-solved on its start), matching the runtime's first-render state.
      if (w.mode === "ratios") {
        const need = (w.requiredScaleMoves ?? 1);
        const c: unknown[] = range(5, 85).map((angle) => ({ angle, scale: 1.5, scaleMoves: need }));
        // One deliberately under-scaled candidate, so scaleFeedback (the "resize first" path) is
        // proven reachable rather than flagged dead. angle=target guarantees only the scale gate,
        // not the angle comparison, decides this candidate.
        c.push({ angle: w.target, scale: 1, scaleMoves: Math.max(0, need - 1) });
        return { candidates: c, start: w.start };
      }
      return {
        candidates: w.mode === "sas" ? range(15, 150) : range(2, w.a + w.b - 1),
        start: w.start,
      };
    case "compassConstruct":
      return { candidates: range(1, 12), start: w.start };
    case "radicalCheck":
      return { candidates: range(-4, 8), start: w.start };
    case "derivativeTrace":
      return { candidates: range(-4, 4, 0.5), start: w.start };
    case "accumulateArea":
      return { candidates: range(0, 4, 0.25), start: w.start };
    case "riemannSum": {
      const c: unknown[] = [];
      for (const n of range(1, 24))
        for (const rule of ["left", "right", "mid", "trap"] as const) c.push({ n, rule });
      return { candidates: c, start: { n: w.nStart, rule: w.ruleStart } };
    }
    case "sliceSum": {
      const c: unknown[] = [];
      for (const n of range(1, 24)) for (const rule of ["left", "right", "mid"] as const) c.push({ n, rule });
      return { candidates: c, start: { n: w.nStart, rule: w.ruleStart } };
    }
    case "slopeField":
      return { candidates: range(0, 8), start: w.startY0 };
    case "taylorApprox":
      return {
        candidates: w.mode === "terms" ? range(0, 10) : range(1, 15),
        start: w.mode === "terms" ? w.nStart : w.xStart,
      };
    case "balanceScale":
      return { candidates: range(w.xMin, w.xMax).map((x) => ({ x })), start: { x: w.xStart } };
    case "solveBalance": {
      // Every state on the removal lattice, now SIGNED (a negative pan is reachable), plus the
      // comparator's two orientations and the bracket states. Still small enough to enumerate
      // outright, so every wrong path is proven reachable and the finished state is proven to exist.
      const FLIP = { eq: "eq", lt: "gt", gt: "lt", le: "ge", ge: "le" } as const;
      const rel0 = w.relation ?? "eq";
      const rels: Array<"eq" | "lt" | "gt" | "le" | "ge"> = rel0 === "eq" ? ["eq"] : [rel0, FLIP[rel0]];
      const xt = (w.c - w.b) / w.a;
      const span = (n: number, cap: number) => {
        const m = Math.min(Math.max(Math.abs(n), 1), cap);
        return range(-m, m);
      };
      const lxs = span(w.a, 6);
      const lus = span(w.b, 16);
      const rus = span(Math.max(Math.abs(w.c), Math.abs(xt)), 24);
      const cands: Array<Record<string, unknown>> = [];
      for (const rel of rels)
        for (const lx of lxs)
          for (const lu of lus)
            for (const ru of rus)
              cands.push({ leftX: lx, leftUnits: lu, rightUnits: ru, groups: 0, partial: 0, rel });
      if (w.groups) {
        const gs = Math.sign(w.groups.count);
        // Brackets still standing: legal, balanced, unfinished.
        for (let gi = 1; gi <= Math.abs(w.groups.count); gi++)
          cands.push({ leftX: 0, leftUnits: 0, rightUnits: w.c, groups: gi, partial: 0, rel: rel0 });
        // The multiplier reached the x and stopped — one copy of the constant survives.
        cands.push({ leftX: w.a, leftUnits: gs * w.groups.unit, rightUnits: w.c, groups: 0, partial: 1, rel: rel0 });
      }
      const start = w.groups
        ? { leftX: 0, leftUnits: 0, rightUnits: w.c, groups: Math.abs(w.groups.count), partial: 0, rel: rel0 }
        : { leftX: w.a, leftUnits: w.b, rightUnits: w.c, groups: 0, partial: 0, rel: rel0 };
      return { candidates: cands, start };
    }
    case "inversePipeline": {
      // All ordered arrangements of tray cards at the track length — a few hundred at most.
      const ids = w.tray.map((t) => t.id);
      let seqs: string[][] = [[]];
      for (let len = 0; len < w.forward.length; len++) {
        const next: string[][] = [];
        for (const s of seqs) for (const id of ids) if (!s.includes(id)) next.push([...s, id]);
        seqs = next;
      }
      return { candidates: seqs, start: [] };
    }
    case "functionMachine":
      return {
        candidates: range(w.inputMin, w.inputMax, w.inputStep).map((input) => ({ input })),
        start: { input: w.inputStart },
      };
    case "numberLinePlace":
      return { candidates: range(w.min, w.max, w.step), start: w.start };
    case "unitCircleExplore": {
      // Reachable angles honour the branch walls (drag, slider and keyboard all clamp there);
      // wave lessons extend to 360 because a feature can live at the end of the cycle.
      const lo = w.branch ? w.branch[0] : 0;
      const hi = w.branch ? w.branch[1] : w.trace ? 360 : 345;
      const angles = range(lo, hi, w.angleStep);
      if (w.dials) {
        // Dial mode: the input space is the cartesian product of the dial lattices.
        let states: Array<Record<string, number>> = [{}];
        for (const d of w.dials)
          states = states.flatMap((s) => range(d.min, d.max, d.step).map((v) => ({ ...s, [d.param]: v })));
        return {
          candidates: states.map((dials) => ({ angle: w.angleStart, dials })),
          start: { angle: w.angleStart },
        };
      }
      if (w.ghostChoices) {
        const c: unknown[] = [];
        for (const angle of angles) for (const ch of w.ghostChoices) c.push({ angle, choice: ch.id });
        return { candidates: c, start: { angle: w.angleStart } };
      }
      return {
        candidates: angles.map((angle) => ({ angle })),
        start: { angle: w.angleStart },
      };
    }
    case "angleMeasure":
      return {
        candidates: range(0, 180, w.angleStep).map((angle) => ({ angle })),
        start: { angle: w.angleStart },
      };
    case "dilationExplore":
      return { candidates: range(w.kMin, w.kMax, w.kStep).map((k) => ({ k })), start: { k: w.kStart } };
    case "argandExplore": {
      const g = w.gridMax;
      const c: unknown[] = [];
      for (const re of range(-g, g)) for (const im of range(-g, g)) c.push({ re, im });
      return { candidates: c, start: { re: w.reStart, im: w.imStart } };
    }
    case "vectorExplore": {
      const g = w.gridMax;
      const c: unknown[] = [];
      for (const vx of range(-g, g)) for (const vy of range(-g, g)) c.push({ vx, vy });
      return { candidates: c, start: { vx: w.vxStart, vy: w.vyStart } };
    }
    case "quadDrag": {
      const c: unknown[] = [];
      for (const x of range(0, w.gridMax)) for (const y of range(0, w.gridMax)) c.push({ x, y });
      return { candidates: c, start: { x: w.startX, y: w.startY } };
    }
    case "fractionBar": {
      const c: unknown[] = [];
      for (const n of range(w.numMin, w.numMax)) for (const d of range(w.denMin, w.denMax)) c.push({ n, d });
      return { candidates: c, start: { n: w.numStart, d: w.denStart } };
    }
    case "signChart": {
      // S116 (k): intervals are cut by roots AND poles, so the candidate arrays must be sized from
      // the merged cuts. Sizing from `roots` alone generated arrays of the wrong LENGTH for any
      // spec with a pole, which the evaluator rejects outright — so every candidate failed and the
      // widget read as UNSOLVABLE. Uses the same `signChartCuts` the evaluator and renderer use,
      // so the three cannot drift apart again.
      const n = signChartCuts(w.roots, w.poles).length + 1;
      const c: unknown[] = [];
      for (let mask = 0; mask < 1 << n; mask++)
        c.push(Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? "+" : "-")));
      return { candidates: c, start: Array.from({ length: n }, () => "+") };
    }
    case "graphZoom": {
      const c: unknown[] = [];
      for (const zoom of range(0, 6))
        for (const verdict of ["limit-exists", "no-limit"] as const) c.push({ zoom, verdict });
      return { candidates: c, start: { zoom: 0, verdict: null } };
    }
    case "moneyBoard": {
      if (w.mode === "count") {
        const answer = w.answerCents ?? 0;
        const full = (w.show ?? []).flatMap((c) => Array.from({ length: c.count }, () => c.cents));
        // wrong non-trap entries to reach mismatch (counted full) and fallback (counted empty)
        const trapSet = new Set(w.commonEntries.map((e) => e.cents));
        const wrongs: number[] = [];
        for (let d = 1; wrongs.length < 2 && d < 6; d++) {
          if (!trapSet.has(answer + d)) wrongs.push(answer + d);
          if (wrongs.length < 2 && answer - d >= 0 && !trapSet.has(answer - d)) wrongs.push(answer - d);
        }
        const entries: Array<number | null> = [null, answer, ...w.commonEntries.map((e) => e.cents), ...wrongs];
        const c: unknown[] = [];
        for (const entry of entries) for (const counted of [[], full]) c.push({ counted, entry });
        return { candidates: c, start: { counted: [], entry: null } };
      }
      const target =
        w.mode === "change" ? (w.paidCents ?? 0) - (w.priceCents ?? 0) : w.targetCents ?? 0;
      const tray = w.tray ?? [];
      // walk counts per denomination up to caps (bounded product space; trays are small)
      let states: Array<Record<number, number>> = [{}];
      for (const d of tray) {
        const next: Array<Record<number, number>> = [];
        for (const st of states)
          for (let k = 0; k <= Math.min(d.max, 30); k++) next.push({ ...st, [d.cents]: k });
        states = next;
        if (states.length > 4000) break; // stay bounded; enough to hit every feedback path
      }
      void target;
      return { candidates: states, start: {} };
    }
    case "fractionGrid": {
      const c: unknown[] = [];
      for (const rows of range(1, 12))
        for (const shadeR of range(0, rows))
          for (const cols of range(1, 12))
            for (const shadeC of range(0, cols)) c.push({ rows, cols, shadeR, shadeC });
      return { candidates: c, start: { rows: 1, cols: 1, shadeR: 0, shadeC: 0 } };
    }
    case "fractionCompare":
      // Same rule as lengthCompare pick mode / absValueLine: the input space is
      // exactly {left, right, equal}, each wrong pick carrying its own required
      // diagnosis (answer-slot discipline in integrity), so there is nothing to model.
      return null;
    case "oddEvenPairs": {
      const ones = w.mode === "onesDigit" ? w.n % 10 : w.n;
      const c: unknown[] = [];
      for (const paired of range(0, Math.floor(ones / 2)))
        for (const choice of ["odd", "even", null] as const) c.push({ paired, choice });
      return { candidates: c, start: { paired: 0, choice: null } };
    }
    case "absValueLine":
      // Unmodeled by the same rule as lengthCompare pick mode: the whole input space
      // is exactly {each operand, the equal chip}, each carrying its own diagnosis, so
      // the schema-REQUIRED missFeedback fallback reads as "dead" and is not authored
      // decoration to police. The magnitude truth is already re-derived in schema
      // integrity (widgetIntegrityErrors), which surfaces through lint:pedagogy.
      return null;
    case "lengthCompare": {
      // ALIGN MODE ONLY. Pick mode stays unmodeled on purpose: its whole input space
      // is exactly its item list, so the schema-REQUIRED missFeedback fallback reads
      // as "dead" whenever an author covers every wrong item with its own feedback —
      // a required fallback is not authored decoration. Align mode has no such
      // degeneracy: missFeedback is the aligned-wrong-pick path, always reachable.
      if (w.mode !== "align") return null;
      const staggered = w.items.filter((i) => i.startOffset > 0);
      let assigns: Array<Record<string, number>> = [
        Object.fromEntries(w.items.filter((i) => i.startOffset === 0).map((i) => [i.id, 0]))
      ];
      for (const it of staggered) {
        const next: Array<Record<string, number>> = [];
        for (const a of assigns) for (let o = 0; o <= it.startOffset; o++) next.push({ ...a, [it.id]: o });
        assigns = next;
      }
      const candidates: unknown[] = [];
      for (const a of assigns) {
        candidates.push({ offsets: a, picked: null });
        for (const it of w.items) candidates.push({ offsets: a, picked: it.id });
      }
      return {
        candidates,
        start: { offsets: Object.fromEntries(w.items.map((i) => [i.id, i.startOffset])), picked: null }
      };
    }
    case "fractionEntry": {
      // A learner types non-negative integers into whole/num/den boxes, so the space is the
      // integer triples — explicit probes for every wrong path, plus a bounded grid.
      const c: unknown[] = [];
      const push = (whole: number, num: number, den: number, sign = 1) =>
        c.push(w.allowNegative ? { sign, whole, num, den } : { whole, num, den });
      push(w.answerWhole, w.answerNum, w.answerDen, w.answerSign); // the answer, authored form + sign
      for (const t of w.commonEntries) push(t.whole, t.num, t.den, t.sign); // each trap, verbatim digits + sign
      if (w.allowNegative) {
        // Sign-flipped answer and traps: wrong-sign entries must route to a trap or the fallback.
        push(w.answerWhole, w.answerNum, w.answerDen, -w.answerSign);
        for (const t of w.commonEntries) push(t.whole, t.num, t.den, -t.sign);
      }
      // Right-value wrong-form probes: doubled improper always violates lowestTerms (gcd ≥ 2)
      // and mixed (num ≥ den); with form "any" they simply join the correct set. On signed
      // tasks the right VALUE includes the answer's sign, so the probes carry it.
      const total = w.answerWhole * w.answerDen + w.answerNum;
      push(0, total * 2, w.answerDen * 2, w.answerSign);
      if (w.answerWhole > 0) push(0, total, w.answerDen, w.answerSign);
      // Grid: spans the answer and every trap, so plain wrong entries fire the fallback.
      const D = Math.max(w.answerDen, ...w.commonEntries.map((t) => t.den), 8);
      const N = Math.max(w.answerNum, ...w.commonEntries.map((t) => t.num), D);
      const W = Math.max(w.answerWhole, ...w.commonEntries.map((t) => t.whole), 1);
      for (const whole of range(0, W))
        for (const num of range(0, N))
          for (const den of range(1, D)) {
            push(whole, num, den);
            if (w.allowNegative) push(whole, num, den, -1);
          }
      return { candidates: c, start: null }; // opens on empty boxes
    }
    case "placeCompare": {
      // Three reachable states; probe all of them, and re-derive the true relation
      // so an authored answer that contradicts the digits fails the gate too.
      const truth = Number(w.left) < Number(w.right) ? "lt" : Number(w.left) > Number(w.right) ? "gt" : "eq";
      if (truth !== w.answer) throw new Error(`placeCompare truth ${truth} ≠ authored ${w.answer}`);
      return { candidates: ["lt", "eq", "gt"], start: null };
    }
    case "rationalCompare": {
      // Same three reachable states; truth re-derived EXACTLY (cross-multiplied,
      // decimals as digits/10^k) so a float-approximate authored answer fails.
      const rat = (o: { num: number; den: number } | { value: string }): [number, number] => {
        if ("num" in o) return [o.num, o.den];
        const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(o.value);
        if (!m) throw new Error(`rationalCompare scalar "${o.value}" failed to parse`);
        const d = 10 ** (m[3]?.length ?? 0);
        return [(m[1] === "-" ? -1 : 1) * (Number(m[2]) * d + Number(m[3] ?? "0")), d];
      };
      const [ln, ld] = rat(w.left);
      const [rn, rd] = rat(w.right);
      const truth = ln * rd < rn * ld ? "lt" : ln * rd > rn * ld ? "gt" : "eq";
      if (truth !== w.answer) throw new Error(`rationalCompare truth ${truth} ≠ authored ${w.answer}`);
      return { candidates: ["lt", "eq", "gt"], start: null };
    }
    case "pointEntry": {
      // A learner types signed integers into N ordered slots. Probe the answer, every trap
      // verbatim, and a bounded grid over the first two slots (spanning answer+traps, deeper
      // slots pinned to the answer) so plain wrong tuples fire the fallback.
      const c: unknown[] = [w.answer.slice()];
      for (const t of w.commonEntries) c.push(t.values.slice());
      const flat = [w.answer, ...w.commonEntries.map((t) => t.values)].flat();
      const lo = Math.min(...flat) - 1;
      const hi = Math.max(...flat) + 1;
      for (const a of range(lo, hi))
        for (const b of range(lo, hi)) {
          const tup = w.answer.slice();
          tup[0] = a;
          if (tup.length > 1) tup[1] = b;
          c.push(tup);
        }
      return { candidates: c, start: w.answer.map(() => null) }; // opens on empty slots
    }
    case "buildExpression": {
      // A build is an ordered token sequence. Enumerate the whole space when it is small;
      // for large banks fall back to targeted probes (every authored sequence plus
      // miss-firing mutations). Either way, candidates honour renderer reachability:
      // with reusable=false a sequence that repeats a token cannot be built, so an
      // authored trap that repeats one is correctly reported DEAD.
      const ids = w.tokens.map((t) => t.id);
      const reachable = (s: string[]): boolean => w.reusable || new Set(s).size === s.length;
      const authored = [w.correct, ...w.acceptAlso, ...w.commonBuilds.map((c) => c.sequence)];
      const maxLen = Math.max(...authored.map((a) => a.length), 1);
      let size = 0;
      for (let len = 1, layer = 1; len <= Math.min(maxLen, w.reusable ? maxLen : ids.length); len++) {
        layer *= w.reusable ? ids.length : ids.length - (len - 1);
        size += layer;
        if (size > 150_000) break;
      }
      if (size <= 150_000) {
        const all: string[][] = [];
        let seqs: string[][] = [[]];
        for (let len = 1; len <= maxLen; len++) {
          const next: string[][] = [];
          for (const s of seqs)
            for (const id of ids) {
              if (!w.reusable && s.includes(id)) continue;
              next.push([...s, id]);
            }
          for (const s of next) all.push(s);
          seqs = next;
        }
        return { candidates: all, start: [] };
      }
      // Targeted probes: authored sequences (reachable ones), every single token, and the
      // reversed correct build — enough to prove each wrong path fires and none collides.
      const probes: string[][] = [
        ...authored.filter(reachable),
        ...ids.map((id) => [id]),
        [...w.correct].reverse(),
      ];
      return { candidates: probes, start: [] };
    }
    default:
      return null;
  }
}

describe("solvability gate — every widget in the content", () => {
  const items = allWidgets();

  it("finds widgets to audit", () => {
    expect(items.length).toBeGreaterThan(1000);
  });

  it("every modelled widget is SOLVABLE, is not PRE-SOLVED, and has NO DEAD wrong-paths", () => {
    const failures: string[] = [];
    let audited = 0;

    for (const { lesson, w } of items) {
      const sp = space(w);
      if (!sp) continue;
      audited++;

      const correct = sp.candidates.filter((c) => evaluate(w, c).correct);
      if (correct.length === 0) {
        failures.push(`${lesson} [${w.type}]: UNSOLVABLE — no reachable input grades correct`);
        continue;
      }
      if (evaluate(w, sp.start).correct) {
        failures.push(`${lesson} [${w.type}]: PRE-SOLVED — it opens on the answer`);
      }

      const fired = new Set(
        sp.candidates.map((c) => evaluate(w, c)).filter((r) => !r.correct).map((r) => r.feedback)
      );
      for (const path of widgetWrongPaths(w)) {
        if (path && !fired.has(path)) {
          failures.push(
            `${lesson} [${w.type}]: DEAD FEEDBACK — no reachable input produces "${path.slice(0, 48)}…"`
          );
        }
      }
    }

    // The gate models the widget types whose input space is enumerable. Guard against that coverage
    // silently collapsing to nothing (it currently audits ~265 instances across 30 types).
    expect(audited).toBeGreaterThan(100);
    expect(failures, `\n${failures.join("\n")}\n`).toEqual([]);
  }, 60_000); // a content-wide sweep: ~18s of real auditing across 1,220 files
});
