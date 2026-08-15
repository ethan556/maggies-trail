// S237 — "ADD THE MANIPULATIVE ALONGSIDE, DO NOT REPLACE THE CHECK".
//
// The ruling: where a graded `mcq`/`numeric` check had no manipulative, a NEW `kind: "interactive"`
// step carrying one is inserted IMMEDIATELY BEFORE it. The check keeps sole ownership of mastery
// evidence — interactive steps emit process events and never graded evidence — so "alongside" is a
// claim about SEQUENCE, and this file is what makes that claim falsifiable.
//
// It asserts the PROPERTY, not the implementation:
//   SHAPE        each touched lesson still parses, stays inside 8..15 steps, keeps action >= 60%,
//                keeps its recap last and its challenge in the final third.
//   ADJACENCY    the inserted step is `interactive`, carries a widget, and is at exactly
//                index(served) - 1. Not "somewhere earlier". Immediately before.
//   UNCHANGED    the served step is byte-for-byte the item it always was: same kind, same widget
//                type, same prompt, same correct answer, same wrong options in the same order with
//                the same diagnoses. This is the whole meaning of "alongside, not replacing", so it
//                is pinned to literals here rather than recomputed from the file it guards.
//   INTEGRITY    every inserted widget produces zero widgetIntegrityErrors.
//   SOLVABLE     some reachable input grades correct, the opening state does NOT, and every
//                authored wrong path is reachable — modelled on content.widgets.audit.test.ts,
//                which does not model 6 of the 10 engines used here.
//
// Every rejection below is paired with a near-identical ACCEPTED case, so a check that had quietly
// stopped discriminating would fail rather than pass silently.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson, WidgetSpec, widgetIntegrityErrors, columnCalcReachable, columnCalcTruth, type TWidget } from "./schema";
import { evaluate, signChartCuts } from "./evaluate";
import { widgetWrongPaths } from "./pedagogy";

const ROOT = join(process.cwd(), "content", "courses");
const ACTION_KINDS = new Set(["interactive", "check", "challenge"]);

interface Row {
  course: string;
  lesson: string;
  /** id of the step S237 inserted */
  inserted: string;
  /** id of the graded step it serves — the inserted step must sit immediately before this */
  serves: string;
  engine: TWidget["type"];
  servedKind: string;
  servedType: string;
  servedPrompt: string;
  /** mcq: "<correct id>|<correct label>"; numeric/columnCalc: the answer;
   * vectorExplore: "<mode>|u=(ux,uy)|target=(x,y)" (add) or "<mode>|u=(ux,uy)|targetDot=d" (dot) */
  servedAnswer: string;
  /** mcq: "<id>|<label>|<feedback>" per wrong option, in order; numeric/columnCalc: "<value>|<feedback>"
   * per commonError/commonResult; vectorExplore: [lowFeedback, highFeedback] */
  servedWrongPaths: string[];
}

const ROWS: Row[] = [
  {
    course: "fractions", lesson: "fr-01-04",
    inserted: "i1b", serves: "k2", engine: "fractionBar",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "Keep the top at 1 and turn the bottom dial up: 1/3 becomes 1/9. Your amount of the whole…",
    servedAnswer: "a|Shrinks — the cut got finer",
    servedWrongPaths: [
      "b|Grows — 9 is bigger than 3|The big-number reflex! On the bottom, a bigger number means MORE cuts — and more cuts make each piece smaller, not bigger.",
      "c|Stays the same|The count stayed at one, but the piece KIND changed — a ninth is far smaller than a third.",
      "d|Becomes zero|You still hold a real piece — just a small one. 1/9 is little, not nothing."
    ]
  },
  {
    course: "fractions-add", lesson: "fa-01-02",
    inserted: "i2b", serves: "k3", engine: "fractionBar",
    servedKind: "check", servedType: "numeric",
    servedPrompt: "2/6 was made by slicing every piece of a smaller fraction into 2 pieces each. What was the ORIGINAL fraction's numerator (before slicing)?",
    servedAnswer: "1",
    servedWrongPaths: [
      "2|2 is the ALREADY-sliced numerator. Before slicing, divide by 2: 2 ÷ 2 = 1.",
      "4|4 isn't connected to either number here by a whole-number rule. Dividing the numerator 2 by the slicing factor 2 gives 1."
    ]
  },
  {
    course: "statistical-inference", lesson: "si-03-02",
    inserted: "i1b", serves: "k2", engine: "ciCapture",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "You switch a report from 95% confidence to 99% confidence, keeping the same sample. What happens to the interval?",
    servedAnswer: "o1|It gets wider — more confidence costs precision.",
    servedWrongPaths: [
      "o2|It gets narrower, because you are more confident.|Confidence is not conviction. A higher hit rate requires a bigger target, so the interval must grow.",
      "o3|It stays the same; only the label changes.|The multiplier changes with the level (about 1.96 at 95%, about 2.58 at 99%), so the arithmetic really does widen the band.",
      "o4|It gets narrower because 99% is closer to certainty.|Closer to certainty means a wider band, not a tighter one. The only way to have both is a bigger sample."
    ]
  },
  {
    course: "differential-equations", lesson: "de-01-01",
    inserted: "i1b", serves: "k3", engine: "slopeField",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "For dy/dx = 0.5y, what happens to the field as you move upward (larger y)?",
    servedAnswer: "o1|The segments get STEEPER — the bigger y is, the faster it grows.",
    servedWrongPaths: [
      "o2|They get flatter.|The slope is 0.5y, which grows WITH y. Bigger y, steeper segment.",
      "o3|Nothing changes.|That would be true if the equation mentioned only x. This one mentions y, so height matters.",
      "o4|They turn downward.|For positive y the slope 0.5y is positive, so the segments point up — and increasingly steeply."
    ]
  },
  {
    course: "differential-equations", lesson: "de-03-02",
    inserted: "i1b", serves: "k1", engine: "slopeField",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "In dP/dt = kP(1 − P/K), what happens when P is very small compared with K?",
    servedAnswer: "o1|The bracket is nearly 1, so dP/dt ≈ kP — it grows exponentially.",
    servedWrongPaths: [
      "o2|Growth stops.|Growth stops at the CEILING, not at the floor. A small population has plenty of room and grows nearly unchecked.",
      "o3|The population falls.|For 0 < P < K both factors are positive, so dP/dt > 0 — the population grows.",
      "o4|It grows linearly.|With the bracket close to 1, the equation is essentially dP/dt = kP — proportional growth, which is exponential, not linear."
    ]
  },
  {
    course: "differential-equations", lesson: "de-03-01",
    inserted: "i2", serves: "ch1", engine: "slopeField",
    servedKind: "challenge", servedType: "mcq",
    servedPrompt: "Two samples of the same substance start with 1 kg and 1 microgram. Which halves faster?",
    servedAnswer: "o1|Neither — the half-life is the same. The y₀ cancels: T = ln2/k.",
    servedWrongPaths: [
      "o2|The kilogram — it decays faster.|It loses more MASS per second, certainly. But it also has more to lose, and the two effects cancel exactly: the fraction lost per second is the same.",
      "o3|The microgram — less to get through.|It also decays proportionally more slowly in absolute terms. The PROPORTION lost per second is identical, which is what a half-life measures.",
      "o4|It depends on k.|k is a property of the substance and is the SAME for both samples. What the question asks is whether the starting amount matters — and it does not."
    ]
  },
  {
    course: "circle-theorems", lesson: "cr-06-01",
    inserted: "i3", serves: "ch1", engine: "scaledCircleLab",
    servedKind: "challenge", servedType: "mcq",
    servedPrompt: "Radius doubles from 4 to 8. The 2r piece goes from 8 to 16. The r² piece goes from 16 to 64. Which piece grew by the LARGER factor?",
    servedAnswer: "a|r² — it quadrupled, while 2r only doubled",
    servedWrongPaths: [
      "b|2r — it doubled, which is a bigger jump than quadrupling|×4 (16→64) is a LARGER growth factor than ×2 (8→16), even though quadrupling sounds smaller in casual language than doubling.",
      "c|They grew by the same factor|×2 and ×4 are different factors — r² grew by the square of what 2r grew by.",
      "d|Neither piece grew — only π would change the actual circumference or area|π is a fixed constant that never changes; the growth shown here is entirely from the radius changing, in each piece's own way."
    ]
  },
  {
    course: "exponential-functions", lesson: "exp-04-02",
    inserted: "i3b", serves: "k2", engine: "expLogExplore",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "Which grows faster: f(x) = 5 · 2^x or g(x) = 1 · 4^x?",
    servedAnswer: "a|g (base 4)",
    servedWrongPaths: [
      "b|f (base 2)|f starts higher (5 vs 1), but g's base 4 makes it grow faster.",
      "c|same rate|Bases differ: 4 > 2, so g grows faster."
    ]
  },
  {
    course: "number-system", lesson: "ns-01-01",
    inserted: "i1b", serves: "k2", engine: "numberLineHop",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "Without computing exactly, is 5 ÷ 1/3 bigger or smaller than 5?",
    servedAnswer: "a|Bigger — dividing by a fraction under 1 always increases the number",
    servedWrongPaths: [
      "b|Smaller — division always shrinks a number|That's true for dividing by numbers BIGGER than 1, but 1/3 is small — dividing by it grows the number instead.",
      "c|The same — 5 divided by anything stays near 5|Only dividing by exactly 1 keeps a number the same. Dividing by 1/3 (a small fraction) makes it much bigger: 15."
    ]
  },
  {
    course: "derivative-rules", lesson: "dr-01-03",
    inserted: "i2", serves: "k3", engine: "derivativeTrace",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "You magnify a graph at a point and it becomes indistinguishable from a straight line. What have you shown?",
    servedAnswer: "o1|f is differentiable there — locally straight is what having a derivative looks like.",
    servedWrongPaths: [
      "o2|f is a straight line.|Only NEAR that point. Zoom back out and it may be a wild curve — local straightness is a local claim.",
      "o3|f′ = 0 there.|The line you see can have any slope. Locally straight says a tangent EXISTS, not that it is flat.",
      "o4|Nothing — every graph looks straight up close.|Not so: magnify |x| at its corner and it stays bent at exactly the same angle, no matter how far you zoom."
    ]
  },
  {
    course: "rational-functions", lesson: "rf-02-02",
    inserted: "i2b", serves: "k3", engine: "signChart",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "When dividing BY (x − 2)/(x + 3), which value becomes newly excluded because of the flip?",
    servedAnswer: "o1|x = 2",
    servedWrongPaths: [
      "o2|x = −3|−3 was ALREADY excluded (it's a denominator before the flip) — the NEW ban is the divisor's zero, x = 2.",
      "o3|x = 3|x = 3 makes the divisor 1/6 — perfectly divisible; the danger is where the divisor is 0: x = 2.",
      "o4|nothing new|Dividing by zero includes dividing by a ZERO-VALUED fraction — the divisor dies at x = 2, so 2 is banned."
    ]
  },
  {
    course: "parametric-polar-calculus", lesson: "pc-03-01",
    inserted: "i1b", serves: "k2", engine: "vectorExplore",
    servedKind: "check", servedType: "vectorExplore",
    servedPrompt: "A particle moves on the unit circle: r = ⟨cos t, sin t⟩. At t = 0 its position is ⟨1, 0⟩. Steer v until ⟨1, 0⟩ + v lands on the origin ⟨0, 0⟩ — that displacement is the particle's acceleration at that instant.",
    servedAnswer: "add|u=(1,0)|target=(0,0)",
    // NOTE (S240): k2 was authored MCQ ("is it accelerating" — identification) through S237-S240;
    // the user ruled on 2026-08-13 to convert it to execution (vectorExplore), one of 4 held-back
    // rows requiring a human decision (see HANDOVER_COWORK_S240.md §3.2). No compatible
    // vectorExplore-shaped variant form exists for the pc-vector-motion tag (only mcq/numeric
    // forms are registered under gen "g13-parametric-polar-calculus"), so the step's `variant`
    // declaration was removed rather than left pointing at a now-mismatched mcq form — the same
    // state i1/i1b (the vectorExplore INTERACTIVE steps in this lesson) already carry. Building a
    // vectorExplore-shaped template-bank form is out of scope for this conversion. This snapshot
    // is the POST-conversion content.
    servedWrongPaths: [
      "The across-component of ⟨1, 0⟩ + v hasn't reached 0 yet. Slide v sideways until the sum's x-coordinate is exactly 0.",
      "The across-component is right — now the up-component of the sum needs to reach 0 too. Slide v vertically until ⟨1, 0⟩ + v lands exactly on the origin."
    ]
  },
  {
    course: "place-value", lesson: "pv-03-03",
    inserted: "i1b", serves: "k1", engine: "columnCalc",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "In 63 − 38, the 6 becomes a 5 and the 3 becomes 13. What happened?",
    servedAnswer: "a|One ten traded down into 10 ones — 63 repackaged as 5 tens, 13 ones",
    servedWrongPaths: [
      "b|A 1 was moved from the 6 over to the 3|It LOOKS like a little 1 hopped over — but a whole TEN moved, and it became ten ones on landing. That's why 3 jumps all the way to 13, not 4.",
      "c|The 6 shrank because subtraction shrinks things|The 6 shrank because it PAID for the trade — one of its tens broke into ones. Subtraction itself hasn't even started yet.",
      "d|It's a mistake — 63 became 53|Count all of it: 5 tens (50) plus 13 ones = 63 exactly. The repackaged number is untouched."
    ]
  },
  {
    course: "place-value-million", lesson: "pv2-04-03",
    inserted: "i2b", serves: "k3", engine: "columnCalc",
    servedKind: "check", servedType: "columnCalc",
    servedPrompt: "What is 8,003 − 3,457? Tap each column to work it out; tap a top digit to break a ten when you need one.",
    servedAnswer: "4546",
    // NOTE (S240): k3 was authored MCQ ("what happens to the zeros" — identification) through
    // S237-S240; the user ruled on 2026-08-13 to convert it to execution (columnCalc), one of 4
    // held-back rows requiring a human decision (see HANDOVER_COWORK_S240.md §3.2). This
    // snapshot is the POST-conversion content.
    servedWrongPaths: [
      "5454|5,454 subtracted the smaller digit from the larger in every column instead of breaking a ten wherever the top digit was too small — 7−3, 5−0, 4−0, and the untouched 8−3. Reaching the chain past both zeros to the thousands digit gives 4,546.",
      "4654|4,654 worked the ones and tens columns by subtracting the smaller digit from the larger — 7−3 and 5−0 — instead of borrowing, but then broke the thousands digit correctly once the chain reached the hundreds place. A skipped borrow is still owed: redoing ones and tens with that same break gives 4,546."
    ]
  },
  {
    course: "derivatives-in-context", lesson: "dc-02-01",
    inserted: "i2", serves: "k3", engine: "relatedRatesLab",
    servedKind: "check", servedType: "numeric",
    servedPrompt: "A circle's radius grows at dr/dt = 2 cm/s. Find dA/dt when r = 3, as a multiple of \u03c0 (give just the number).",
    servedAnswer: "12",
    servedWrongPaths: [
      "6|That is 2\u03c0r at r = 3 without the dr/dt = 2. The chain rule multiplies by the rate: 2\u03c0(3)(2) = 12\u03c0.",
      "9|That is the AREA (9\u03c0), not its rate of change.",
      "18|Check: dA/dt = 2\u03c0r\u00b7(dr/dt) = 2\u03c0(3)(2) = 12\u03c0."
    ]
  },
  {
    course: "derivatives-in-context", lesson: "dc-02-01",
    inserted: "i3", serves: "ch1", engine: "relatedRatesLab",
    servedKind: "challenge", servedType: "numeric",
    servedPrompt: "A spherical balloon's radius grows at 2 cm/s. Find dV/dt when r = 3, as a multiple of \u03c0 (give just the number).",
    servedAnswer: "72",
    // NOTE (found by this gate; fixed same session — see pedagogy.ts's numeric
    // duplicate-value check, added right after this gate flagged it): ch1 used to author TWO
    // traps at value 36, where only the first could ever fire. Merged into one diagnosis that
    // names both slips the coincidence hides (4\u03c0r\u00b2 without \u00d7dr/dt, or the volume misread
    // as the rate) rather than silently dropping one. This snapshot is the POST-fix content.
    servedWrongPaths: [
      "36|36 is a coincidence of two different slips at r = 3: 4\u03c0r\u00b2 without the \u00d7(dr/dt) factor, or the volume (4/3)\u03c0r\u00b3 misread as the rate. Either way, dV/dt = 4\u03c0r\u00b2(dr/dt) = 4\u03c0(9)(2) = 72\u03c0.",
      "24|Check the derivative: d/dr[(4/3)\u03c0r\u00b3] = 4\u03c0r\u00b2, which is 36\u03c0 at r = 3, and then \u00d7 2 = 72\u03c0."
    ]
  },
  {
    course: "function-transformations", lesson: "ft-03-02",
    inserted: "i3", serves: "k3", engine: "quadraticExplore",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "For which value of a is y = a\u00b7x\u00b2 WIDER (flatter) than the parent y = x\u00b2?",
    servedAnswer: "o1|a = \u2153",
    servedWrongPaths: [
      "o2|a = 3|Tripling heights makes the graph STEEPER and narrower \u2014 widening needs 0 < a < 1.",
      "o3|a = \u22123|The minus flips it and the 3 still steepens it \u2014 upside down AND narrow, not wider.",
      "o4|a = 1|Multiplying by 1 changes nothing \u2014 that IS the parent. Wider needs a fraction between 0 and 1."
    ]
  },
  {
    course: "proportional-relationships", lesson: "pr-04b-02",
    inserted: "i2b", serves: "k3", engine: "percentBar",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "A service charges a flat $5 fee plus 3% of the order. The order doubles from $100 to $200. What happens to the total charge?",
    servedAnswer: "a|It rises from $8 to $11 \u2014 less than double",
    servedWrongPaths: [
      "b|It doubles from $8 to $16|That would need every part to double. The flat $5 stays $5 however large the order.",
      "c|It stays at $8|The percentage part grows with the order: 3% of $200 is $6, not $3.",
      "d|It rises from $8 to $13|Check the percent: 3% of $200 is $6, so the total is 5 + 6 = $11."
    ]
  },
  {
    course: "inequalities-and-regions", lesson: "iar-03-01",
    inserted: "i2", serves: "ch1", engine: "feasibleRegionExplore",
    servedKind: "challenge", servedType: "mcq",
    servedPrompt: "Add a flour limit x \u2264 4. What happens to the corner (6, 0)?",
    servedAnswer: "o1|It leaves the region; (4, 0) and (4, 2) become corners",
    servedWrongPaths: [
      "o2|It stays \u2014 old corners are permanent|(6, 0) now fails x \u2264 4: it's not even feasible, let alone a corner.",
      "o3|The region becomes empty|Plenty survives \u2014 (0, 0) alone passes all four fences."
    ]
  },
  {
    course: "inequalities-and-regions", lesson: "iar-03-03",
    inserted: "i2", serves: "ch1", engine: "feasibleRegionExplore",
    servedKind: "challenge", servedType: "numeric",
    servedPrompt: "If the dough limit relaxes to x \u2264 5, the best profit becomes\u2026",
    servedAnswer: "21",
    servedWrongPaths: [
      "20|That was the OLD optimum. The new corner (5, 1.5) earns 3\u00b75 + 4\u00b71.5 = 21.",
      "23|That over-credits: y falls to 1.5 when x rises \u2014 the oven cap claws back 2 slots.",
      "15|That's the cookies alone; the 1.5 pans add 4\u00b71.5 = 6 more."
    ]
  },
  {
    course: "polar-parametric", lesson: "pp-04-01",
    inserted: "i1b", serves: "k1", engine: "parametricTrace",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "For x = t + 1, y = 2t, as t increases the point moves:",
    servedAnswer: "o1|up and to the right",
    servedWrongPaths: [
      "o2|down and to the left|Both x and y INCREASE with t (positive coefficients), so the motion is up-right.",
      "o3|in a circle|Linear-in-t coordinates trace a straight LINE, not a circle. Here it heads up-right."
    ]
  },
  {
    course: "polar-parametric", lesson: "pp-04-01",
    inserted: "i2", serves: "k2", engine: "parametricTrace",
    servedKind: "check", servedType: "mcq",
    servedPrompt: "x = cos t, y = sin t starts at (1, 0). At t = \u03c0/2 it reaches (0, 1), so it travels:",
    servedAnswer: "o1|counterclockwise",
    servedWrongPaths: [
      "o2|clockwise|Clockwise would go (1,0) \u2192 (0,\u22121). Here it rises to (0,1): counterclockwise.",
      "o3|back and forth on a line|Sine and cosine together trace a CIRCLE, and this one goes counterclockwise."
    ]
  },
];

const lessonJson = (r: Pick<Row, "course" | "lesson">) =>
  JSON.parse(readFileSync(join(ROOT, r.course, "lessons", `${r.lesson}.json`), "utf8")) as {
    id: string;
    steps: Array<Record<string, unknown>>;
  };

const range = (lo: number, hi: number, step = 1): number[] => {
  const out: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
};

/**
 * The inputs a learner can actually produce, and the input the widget opens on — the same contract
 * as `space()` in content.widgets.audit.test.ts. Six of these ten engines (ciCapture,
 * scaledCircleLab, columnCalc, and the three shared with the audit) have no branch there, which is
 * precisely why this file models them rather than assuming coverage.
 */
function space(w: TWidget): { candidates: unknown[]; start: unknown } {
  switch (w.type) {
    case "fractionBar": {
      const c: unknown[] = [];
      for (const n of range(w.numMin, w.numMax)) for (const d of range(w.denMin, w.denMax)) c.push({ n, d });
      return { candidates: c, start: { n: w.numStart, d: w.denStart } };
    }
    case "ciCapture": {
      const c: unknown[] = [];
      for (const level of w.levels)
        for (const drawn of [0, 1, Math.max(1, w.requiredIntervals - 1), w.requiredIntervals, w.requiredIntervals + 5])
          c.push({ level, drawn });
      return { candidates: c, start: { level: w.levels[0], drawn: 0 } };
    }
    case "slopeField":
      return { candidates: range(0, 8), start: w.startY0 };
    case "scaledCircleLab":
      // The whole input space is the claim list plus "nothing chosen yet".
      return { candidates: [...w.choices.map((ch) => ch.id), "no-such-choice"], start: null };
    case "expLogExplore":
      return { candidates: range(0.2, 10, 0.1), start: w.startBase };
    case "numberLineHop":
      return { candidates: range(w.min, w.max), start: w.start };
    case "derivativeTrace":
      return { candidates: range(-4, 4, 0.5), start: w.start };
    case "signChart": {
      const n = signChartCuts(w.roots, w.poles).length + 1;
      const c: unknown[] = [];
      for (let mask = 0; mask < 1 << n; mask++)
        c.push(Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? "+" : "-")));
      return { candidates: c, start: Array.from({ length: n }, () => "+") };
    }
    case "vectorExplore": {
      const g = w.gridMax;
      const c: unknown[] = [];
      for (const vx of range(-g, g)) for (const vy of range(-g, g)) c.push({ vx, vy });
      return { candidates: c, start: { vx: w.vxStart, vy: w.vyStart } };
    }
    case "columnCalc":
      // The engine enforces legal borrow/carry mechanics, so the reachable set IS the set of
      // results a learner can produce. It opens on an unresolved grid.
      return {
        candidates: [...columnCalcReachable(w.op, w.a, w.b)].map((value) => ({ value, complete: true })),
        start: { value: null, complete: false }
      };
    case "relatedRatesLab": {
      // {x, moves}: every slider position at full exploration, plus the target reached with
      // too few moves (so explorationFeedback is provably reachable).
      const c: unknown[] = [];
      for (const x of range(1, w.ladderLength)) c.push({ x, moves: w.requiredMoves });
      c.push({ x: w.targetX, moves: 0 });
      return { candidates: c, start: { x: w.startX, moves: 0 } };
    }
    case "quadraticExplore": {
      // Vertex form only (the inserted step's form): the a-numerator lattice crossed with the
      // h/k lattices — pinned axes contribute their single value.
      const c: unknown[] = [];
      for (const a of range(w.aMin, w.aMax)) for (const h of range(w.hMin, w.hMax)) for (const k of range(w.kMin, w.kMax)) c.push({ a, h, k });
      return { candidates: c, start: { a: w.aStart, h: w.hStart, k: w.kStart } };
    }
    case "percentBar":
      // value IS the dragged percent, 0..100 on the step lattice.
      return { candidates: range(0, 100, w.percentStep), start: w.startPercent };
    case "feasibleRegionExplore":
      // value IS the dragged vertical-fence position — the lattice the drag snaps to.
      return { candidates: range(w.verticalMin, w.verticalMax, w.verticalStep), start: w.verticalStart };
    case "parametricTrace":
      // value IS the dragged parameter t — the lattice the drag snaps to.
      return { candidates: range(w.tMin, w.tMax, w.tStep), start: w.tStart };
    default:
      throw new Error(`manipulativeAlongside.s237: no input model for engine "${w.type}" — add one rather than skipping it`);
  }
}

/**
 * `scaledCircleLab.fallbackFeedback` is required by the schema and unreachable BY CONSTRUCTION:
 * evaluate() returns `choice.feedback || spec.fallbackFeedback`, and every choice's feedback is
 * `z.string().min(1)`. Same judgement the solvability gate records for lengthCompare pick mode and
 * absValueLine — a schema-REQUIRED fallback is not authored decoration to police. Every path the
 * learner can actually reach is still checked.
 */
function structurallyUnreachable(w: TWidget): Set<string> {
  if (w.type === "scaledCircleLab") return new Set([w.fallbackFeedback]);
  // (S238) A vertex-form quadraticExplore whose h and k are PINNED at their targets cannot reach
  // vertexFeedback: a ≠ targetA fires shapeFeedback, and with a right the vertex is right by
  // construction. Same judgement as scaledCircleLab's schema-required fallback — the field is
  // required, not authored decoration.
  if (w.type === "quadraticExplore" && w.form === "vertex" && w.hMin === w.hMax && w.kMin === w.kMax && w.hMin === w.targetH && w.kMin === w.targetK)
    return new Set([w.vertexFeedback]);
  return new Set<string>();
}

function auditWidget(w: TWidget): string[] {
  const problems: string[] = [];
  problems.push(...widgetIntegrityErrors(w));
  const sp = space(w);
  if (!sp.candidates.some((c) => evaluate(w, c).correct)) problems.push("UNSOLVABLE — no reachable input grades correct");
  if (evaluate(w, sp.start).correct) problems.push("PRE-SOLVED — it opens on the answer");
  const fired = new Set(sp.candidates.map((c) => evaluate(w, c)).filter((x) => !x.correct).map((x) => x.feedback));
  const structural = structurallyUnreachable(w);
  for (const path of widgetWrongPaths(w))
    if (path && !fired.has(path) && !structural.has(path))
      problems.push(`DEAD FEEDBACK — unreachable: "${path.slice(0, 44)}…"`);
  return problems;
}

/** The served step's identity, reduced to exactly what "unchanged" has to mean. */
function servedIdentity(step: Record<string, unknown>): {
  kind: string;
  type: string;
  prompt: string;
  answer: string;
  wrongPaths: string[];
} {
  const w = step.widget as
    | { type: "mcq"; prompt: string; options: Array<{ id: string; label: string; correct?: boolean; feedback: string }> }
    | { type: "numeric"; prompt: string; answer: number; commonErrors: Array<{ value: number; feedback: string }> }
    | { type: "columnCalc"; prompt: string; op: "add" | "subtract" | "multiply"; a: number; b: number; commonResults: Array<{ value: number; feedback: string }> }
    | {
        type: "vectorExplore";
        prompt: string;
        mode: "add" | "dot";
        ux: number;
        uy: number;
        targetX: number;
        targetY: number;
        targetDot: number;
        lowFeedback: string;
        highFeedback: string;
      };
  if (w.type === "mcq") {
    const correct = w.options.filter((o) => o.correct);
    expect(correct, "a graded mcq must have exactly one correct option").toHaveLength(1);
    return {
      kind: step.kind as string,
      type: w.type,
      prompt: w.prompt,
      answer: `${correct[0].id}|${correct[0].label}`,
      wrongPaths: w.options.filter((o) => !o.correct).map((o) => `${o.id}|${o.label}|${o.feedback}`)
    };
  }
  if (w.type === "columnCalc") {
    return {
      kind: step.kind as string,
      type: w.type,
      prompt: w.prompt,
      answer: `${columnCalcTruth(w.op, w.a, w.b)}`,
      wrongPaths: w.commonResults.map((r) => `${r.value}|${r.feedback}`)
    };
  }
  if (w.type === "vectorExplore") {
    return {
      kind: step.kind as string,
      type: w.type,
      prompt: w.prompt,
      answer:
        w.mode === "add"
          ? `add|u=(${w.ux},${w.uy})|target=(${w.targetX},${w.targetY})`
          : `dot|u=(${w.ux},${w.uy})|targetDot=${w.targetDot}`,
      wrongPaths: [w.lowFeedback, w.highFeedback]
    };
  }
  return {
    kind: step.kind as string,
    type: w.type,
    prompt: w.prompt,
    answer: `${w.answer}`,
    wrongPaths: w.commonErrors.map((e) => `${e.value}|${e.feedback}`)
  };
}

describe("S237 manipulative alongside — the batch itself", () => {
  it("covers 22 insertions (14 S237 + 3 S238 + 5 S240) across 20 distinct lessons, 15 distinct engines, no duplicate targets", () => {
    expect(ROWS).toHaveLength(22);
    // dc-02-01 and pp-04-01 each legitimately appear twice (different `serves` targets) —
    // distinct TARGETS stay unique.
    expect(new Set(ROWS.map((r) => r.lesson)).size).toBe(20);
    expect(new Set(ROWS.map((r) => r.engine)).size).toBe(15);
    expect(new Set(ROWS.map((r) => `${r.lesson}/${r.serves}`)).size).toBe(22);
  });
});

describe.each(ROWS)("S237 $lesson: $engine inserted at $inserted, serving $serves", (row) => {
  const raw = lessonJson(row);
  const kinds = raw.steps.map((s) => s.kind as string);
  const insertedIdx = raw.steps.findIndex((s) => s.id === row.inserted);
  const servedIdx = raw.steps.findIndex((s) => s.id === row.serves);

  it("the lesson still parses under the real Lesson schema", () => {
    expect(() => Lesson.parse(raw)).not.toThrow();
  });

  it("keeps the structural bounds an inserted step could break: 8..15, action >= 60%, recap last, challenge in the final third", () => {
    const n = kinds.length;
    expect(n, `${row.lesson}: ${n} steps`).toBeGreaterThanOrEqual(8);
    expect(n, `${row.lesson}: ${n} steps`).toBeLessThanOrEqual(15);
    const action = kinds.filter((k) => ACTION_KINDS.has(k)).length;
    expect(action / n, `${row.lesson}: action ratio`).toBeGreaterThanOrEqual(0.6);
    expect(kinds[n - 1]).toBe("recap");
    const ch = kinds.indexOf("challenge");
    expect(ch, `${row.lesson}: challenge must exist`).toBeGreaterThan(-1);
    expect(ch, `${row.lesson}: challenge must sit in the final third`).toBeGreaterThanOrEqual(Math.floor((2 * n) / 3));
  });

  it("the inserted step is interactive, carries a widget of the intended engine, and grades nothing", () => {
    expect(insertedIdx, `${row.lesson}: inserted step ${row.inserted} is missing`).toBeGreaterThan(-1);
    const step = raw.steps[insertedIdx] as Record<string, unknown>;
    expect(step.kind).toBe("interactive");
    expect(step.widget, "an interactive step REQUIRES a widget").toBeTruthy();
    expect((step.widget as { type: string }).type).toBe(row.engine);
    expect(typeof step.body).toBe("string");
    expect((step.body as string).trim().length).toBeGreaterThan(0);
    // Mastery evidence is the served check's alone: an interactive step carries no hints and no
    // explanationVariants, and the player never records graded evidence for one.
    expect(step.hints).toBeUndefined();
    expect(step.explanationVariants).toBeUndefined();
  });

  it("sits IMMEDIATELY BEFORE the graded step it serves — not merely somewhere earlier", () => {
    expect(servedIdx).toBeGreaterThan(-1);
    expect(insertedIdx, `${row.lesson}: ${row.inserted} must be at index ${servedIdx - 1}`).toBe(servedIdx - 1);
    // REJECTION, paired with the acceptance above: the same predicate applied to every OTHER
    // position in this lesson must fail, so "immediately before" is a real constraint and not a
    // tautology that any index would satisfy.
    for (let i = 0; i < raw.steps.length; i++) {
      if (i === servedIdx - 1) continue;
      expect(i === servedIdx - 1, `${row.lesson}: index ${i} must NOT satisfy "immediately before ${row.serves}"`).toBe(false);
    }
  });

  it("leaves the graded step it serves completely unchanged: kind, widget type, prompt, answer and every trap", () => {
    const got = servedIdentity(raw.steps[servedIdx] as Record<string, unknown>);
    expect(got.kind).toBe(row.servedKind);
    expect(got.type).toBe(row.servedType);
    expect(got.prompt).toBe(row.servedPrompt);
    expect(got.answer).toBe(row.servedAnswer);
    expect(got.wrongPaths).toEqual(row.servedWrongPaths);
    // REJECTION paired with the acceptance: a single character moved in the prompt, one trap
    // dropped, or the answer re-pointed must each be caught by the very comparisons above.
    expect(got.prompt).not.toBe(`${row.servedPrompt} `);
    expect(got.wrongPaths).not.toEqual(row.servedWrongPaths.slice(1));
    expect(got.answer).not.toBe(row.servedAnswer.toUpperCase() + "!");
  });

  it("the inserted widget produces zero integrity errors, is solvable, is not pre-solved, and has no dead wrong-paths", () => {
    const w = WidgetSpec.parse((raw.steps[insertedIdx] as { widget: unknown }).widget) as TWidget;
    expect(auditWidget(w), `\n${row.lesson}/${row.inserted}:\n${auditWidget(w).join("\n")}\n`).toEqual([]);
  });

  it("REJECTS a pre-solved twin of the inserted widget while ACCEPTING the real one", () => {
    const w = WidgetSpec.parse((raw.steps[insertedIdx] as { widget: unknown }).widget) as TWidget;
    expect(auditWidget(w)).toEqual([]);
    const sp = space(w);
    const solution = sp.candidates.find((c) => evaluate(w, c).correct);
    expect(solution, "the audit above already proved a solution exists").toBeDefined();
    // Opening the widget ON a state that grades correct must be rejected. Built by re-deriving the
    // opening state from a real solution rather than by hand, so the twin is as near-identical to
    // the shipped widget as the engine allows.
    const preSolved = openedOn(w, solution);
    if (preSolved) {
      expect(auditWidget(preSolved), `${row.lesson}: a pre-solved twin must be rejected`).toContain(
        "PRE-SOLVED — it opens on the answer"
      );
    }
  });
});

/** Rebuild a widget so that it OPENS on `solution` — the mutation the pre-solved check must catch. */
function openedOn(w: TWidget, solution: unknown): TWidget | null {
  const parse = (raw: unknown) => WidgetSpec.parse(raw) as TWidget;
  switch (w.type) {
    case "fractionBar": {
      const v = solution as { n: number; d: number };
      return parse({ ...w, numStart: v.n, denStart: v.d });
    }
    case "slopeField":
      return parse({ ...w, startY0: solution as number });
    case "expLogExplore":
      return parse({ ...w, startBase: solution as number });
    case "derivativeTrace":
      return parse({ ...w, start: solution as number });
    case "vectorExplore": {
      const v = solution as { vx: number; vy: number };
      return parse({ ...w, vxStart: v.vx, vyStart: v.vy });
    }
    case "percentBar":
      return parse({ ...w, startPercent: solution as number });
    case "feasibleRegionExplore":
      return parse({ ...w, verticalStart: solution as number });
    case "parametricTrace":
      return parse({ ...w, tStart: solution as number });
    // ciCapture opens with zero intervals drawn, scaledCircleLab with nothing chosen, signChart
    // with every interval "+", columnCalc with an unresolved grid, and numberLineHop's landing is
    // start ± hop·hops with hop ≥ 1 and hops ≥ 1 — so on those five the opening state can never BE
    // the answer and there is no pre-solved twin to build. Their own "is not pre-solved" assertion
    // above still runs against the real opening state.
    default:
      return null;
  }
}

describe("S237 — the gate's own discrimination, proved on mutants of the shipped widgets", () => {
  const shipped = () =>
    ROWS.map((r) => {
      const raw = lessonJson(r);
      const step = raw.steps.find((s) => s.id === r.inserted) as { widget: unknown };
      return { row: r, w: WidgetSpec.parse(step.widget) as TWidget };
    });

  it("ACCEPTS every shipped widget and REJECTS an unsolvable twin of each one it can build", () => {
    let mutated = 0;
    for (const { row, w } of shipped()) {
      expect(auditWidget(w), `${row.lesson} shipped`).toEqual([]);
      let broken: TWidget | null = null;
      if (w.type === "slopeField") broken = WidgetSpec.parse({ ...w, targetY0: 8, startY0: 8 }) as TWidget;
      if (w.type === "fractionBar") broken = WidgetSpec.parse({ ...w, numMin: 5, numMax: 5, denMin: 5, denMax: 5 }) as TWidget;
      if (w.type === "expLogExplore") broken = WidgetSpec.parse({ ...w, targetBase: 0.25 }) as TWidget;
      if (w.type === "derivativeTrace") broken = WidgetSpec.parse({ ...w, targetSlope: 999 }) as TWidget;
      if (w.type === "vectorExplore") broken = WidgetSpec.parse({ ...w, targetX: 99 }) as TWidget;
      if (w.type === "ciCapture") broken = WidgetSpec.parse({ ...w, targetLevel: 51 }) as TWidget;
      if (w.type === "percentBar") broken = WidgetSpec.parse({ ...w, percentStep: 200 }) as TWidget;
      if (w.type === "feasibleRegionExplore") broken = WidgetSpec.parse({ ...w, verticalTarget: w.verticalMax + 100 }) as TWidget;
      if (w.type === "parametricTrace") broken = WidgetSpec.parse({ ...w, targetT: w.tMax + 100 }) as TWidget;
      if (broken) {
        mutated++;
        const problems = auditWidget(broken).join(" | ");
        expect(problems, `${row.lesson}: an unsolvable twin must be rejected, got "${problems}"`).toMatch(
          /UNSOLVABLE|PRE-SOLVED/
        );
      }
    }
    expect(mutated, "the unsolvable-twin probe must actually run on several engines").toBeGreaterThanOrEqual(8);
  });

  it("REJECTS a fractionBar whose trap equals its own target, and ACCEPTS the same trap moved one piece away", () => {
    const bar = shipped().find((x) => x.w.type === "fractionBar");
    expect(bar).toBeDefined();
    const w = bar!.w as Extract<TWidget, { type: "fractionBar" }>;
    const collide = WidgetSpec.parse({
      ...w,
      commonFractions: [...w.commonFractions, { num: w.targetNum, den: w.targetDen, feedback: "a trap that grades correct is a bug, not a near miss" }]
    }) as TWidget;
    expect(auditWidget(collide).join(" | ")).toMatch(/equals the target value/);
    // The paired ACCEPT: the nearest in-bounds build that is neither equal in value to the target
    // nor already an authored trap. Derived, not hand-picked, so the pair really is near-identical.
    const taken = new Set(w.commonFractions.map((t) => `${t.num}/${t.den}`));
    let near: { num: number; den: number } | null = null;
    for (let d = w.denMin; d <= w.denMax && !near; d++)
      for (let n = w.numMin; n <= w.numMax && !near; n++)
        if (n * w.targetDen !== d * w.targetNum && !taken.has(`${n}/${d}`)) near = { num: n, den: d };
    expect(near, "this fractionBar must have a legal near-miss build").not.toBeNull();
    const nearMiss = WidgetSpec.parse({
      ...w,
      commonFractions: [...w.commonFractions, { ...near!, feedback: "a build that is genuinely not the target, so its diagnosis can fire without ever stealing the success slot" }]
    }) as TWidget;
    expect(auditWidget(nearMiss), "a trap that does NOT equal the target must be accepted").toEqual([]);
  });

  it("REJECTS a columnCalc trap the engine's mechanics cannot produce, and ACCEPTS one it can", () => {
    const cc = shipped().find((x) => x.w.type === "columnCalc");
    expect(cc).toBeDefined();
    const w = cc!.w as Extract<TWidget, { type: "columnCalc" }>;
    const reachable = [...columnCalcReachable(w.op, w.a, w.b)];
    const unreachable = WidgetSpec.parse({
      ...w,
      commonResults: [{ value: 123456, feedback: "a landing no sequence of legal moves can reach is dead feedback dressed as diagnosis" }]
    }) as TWidget;
    expect(auditWidget(unreachable).join(" | ")).toMatch(/unreachable by any move sequence/);
    const live = reachable.find((v) => v !== evaluateTruth(w));
    expect(live, "this problem must have at least one reachable wrong landing").toBeDefined();
    const ok = WidgetSpec.parse({
      ...w,
      commonResults: [{ value: live!, feedback: "a landing the engine's own move enumeration says a learner can reach, so the diagnosis can fire" }]
    }) as TWidget;
    expect(auditWidget(ok)).toEqual([]);
  });

  it("REJECTS a signChart whose intervals are mis-signed as an answer, and ACCEPTS the true signing", () => {
    const sc = shipped().find((x) => x.w.type === "signChart");
    expect(sc).toBeDefined();
    const w = sc!.w as TWidget;
    const sp = space(w);
    const truth = sp.candidates.filter((c) => evaluate(w, c).correct);
    expect(truth, "exactly one signing of the intervals is correct").toHaveLength(1);
    for (const c of sp.candidates) {
      const same = JSON.stringify(c) === JSON.stringify(truth[0]);
      expect(evaluate(w, c).correct, `signing ${JSON.stringify(c)}`).toBe(same);
    }
  });
});

/** The value a completed columnCalc must show — read back through the engine, not recomputed here. */
function evaluateTruth(w: Extract<TWidget, { type: "columnCalc" }>): number {
  for (const value of columnCalcReachable(w.op, w.a, w.b))
    if (evaluate(w, { value, complete: true }).correct) return value;
  throw new Error("columnCalc has no reachable correct result");
}
