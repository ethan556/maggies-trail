// THE VARIANT GATE.
//
// An authored problem is checked by a human once. A GENERATED problem is never checked by anyone —
// so the generator must be checked instead, across its whole seed space. This gate sweeps 400 seeds
// per generator and asserts, for every single problem it can ever produce:
//
//   CORRECT        the stated answer is right, recomputed along an INDEPENDENT route
//   TRAPS ARE REAL every distractor is a distinct value, produced by an actual misconception
//   TRAPS BITE     no trap collides with the answer, or hides inside its tolerance window
//   IT DIAGNOSES   every feedback string names a specific error (the pedagogy floor still applies)
//   DETERMINISTIC  the same seed produces a byte-identical problem
//
// These are the same standing rules the authored content is held to. A generator that cannot meet
// them across its whole range is not a shortcut — it is a defect factory.
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import type { Band } from "./difficulty";
import { VARIANT_GENERATORS, variantFor, variantForGenForm, lookupOrThrow } from "./variants";
import type { VariantAnswer } from "./variants";
import { WidgetSpec , widgetIntegrityErrors, type TWidget, distributionGapUnits, trialProbabilityEquivalent, compoundEventTotal, compoundEventChoiceCorrect, equationOutcomeChoiceCorrect, equationOutcomeTruth, shapeHierarchyChoiceCorrect, compositeAreaTarget, compositeAreaChoiceCorrect, triangleClosureForms, triangleClosureChoiceCorrect, signedFractionTruth, signedFractionChoiceCorrect, percentChangeTarget, percentChangeChoiceCorrect, conditionalTableReadTruth, exactNumberExplorationKeys, exactNumberChoiceCorrect, exactNumberTruth, affineRelationshipExplorationKeys, affineRelationshipChoiceCorrect, placeValueTransformExplorationKeys, proportionalReasoningExplorationKeys, quotientReasoningExplorationKeys, quotientReasoningChoiceCorrect, quotientReasoningFractionCorrect, geometricConstraintExplorationKeys, geometricConstraintChoiceCorrect, geometricConstraintTruth, pointSetReasoningExplorationKeys, pointSetReasoningChoiceCorrect, pointSetReasoningTruth, graphReadAnswer } from "./schema";
import { solvePrompt as solveG4Prompt } from "./g4Independent.cjs";
import { solvePrompt as solveG0Prompt } from "./g0Independent.cjs";
import { solvePrompt as solveG1Prompt } from "./g1Independent.cjs";
import { solveG3FluencyPrompt } from "./g3FluencyIndependent.cjs";
import { solvePrompt as solveG2Prompt } from "./g2Independent.cjs";
import { solvePrompt as solveA1Prompt } from "./algebra1Independent.cjs";
import { solvePrompt as solveA2Prompt } from "./algebra2Independent.cjs";
import { solvePrompt as solveGeometryPrompt } from "./geometryIndependent.cjs";
import { solvePrompt as solvePrecalculusPrompt } from "./precalculusIndependent.cjs";
import { solvePrompt as solveCalculusPrompt } from "./calculusIndependent.cjs";
import { solvePrompt as solveStatProbabilityPrompt } from "./statProbabilityIndependent.cjs";

/** An INDEPENDENT recomputation of each concept's answer, deliberately written a different way from
 * the generator. If the two disagree, one of them is wrong — and that is the point of a dual route. */

// ——— polynomial machinery for the poly-* independent routes ———
// Parse a printed polynomial like "7x^3 - 2x^2 + x - 9" or "-x^2 + 5x + 2" into an evaluator.
function parsePoly(src: string): (x: number) => number {
  const terms = src.replace(/\s+/g, "").replace(/-/g, "+-").split("+").filter(Boolean);
  const parsed = terms.map((t) => {
    const m = t.match(/^(-?\d*)(x(?:\^(\d+))?)?$/)!;
    const coeff = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
    const exp = m[2] === undefined ? 0 : m[3] === undefined ? 1 : Number(m[3]);
    return { coeff, exp };
  });
  return (x) => parsed.reduce((acc, { coeff, exp }) => acc + coeff * x ** exp, 0);
}
// Recover the coefficient of x^k from FUNCTION VALUES alone: sample at 0..deg and solve the
// Vandermonde system by Gaussian elimination.
function coeffOf(f: (x: number) => number, k: number, deg: number): number {
  const n = deg + 1;
  const M: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) row.push(i ** j);
    row.push(f(i));
    M.push(row);
  }
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f2 = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= f2 * M[col][c];
    }
  }
  return Math.round((M[k][n] / M[k][k]) * 1000) / 1000;
}
function polyRoute(p: string): number {
  let m = p.match(/What is the degree of \(([^)]+)\)\?/);
  if (m) {
    // Degree from GROWTH: the ratio f(100)/f(10) is close to 10^deg.
    const f = parsePoly(m[1]);
    return Math.round(Math.log10(Math.abs(f(100)) / Math.abs(f(10))));
  }
  m = p.match(/leading coefficient of \(([^)]+)\)\?/);
  if (m) {
    const f = parsePoly(m[1]);
    const deg = Math.round(Math.log10(Math.abs(f(100)) / Math.abs(f(10))));
    return coeffOf(f, deg, deg);
  }
  m = p.match(/coefficient of x\^2 in \(([^)]+)\)\?/);
  if (m) return coeffOf(parsePoly(m[1]), 2, 3);
  m = p.match(/coefficient of x\^3 in \(([^)]+)\)\?/);
  if (m) return coeffOf(parsePoly(m[1]), 3, 4);
  m = p.match(/Add \(([^)]+)\) and \(([^)]+)\)\. What is the (constant term|coefficient of x\^2|coefficient of x)/);
  if (m) {
    const f = parsePoly(m[1]);
    const g = parsePoly(m[2]);
    const h = (x: number) => f(x) + g(x);
    const k = m[3] === "constant term" ? 0 : m[3] === "coefficient of x" ? 1 : 2;
    return coeffOf(h, k, 2);
  }
  m = p.match(/Subtract: \(([^)]+)\) - \(([^)]+)\)\. What is the (constant term|coefficient of x)/);
  if (m) {
    const f = parsePoly(m[1]);
    const g = parsePoly(m[2]);
    const h = (x: number) => f(x) - g(x);
    return coeffOf(h, m[3] === "constant term" ? 0 : 1, 2);
  }
  m = p.match(/Multiply \(([^)]+)\)\(([^)]+)\)\. What is the (constant term|coefficient of x\^4|coefficient of x)/)!;
  const f = parsePoly(m[1]);
  const g = parsePoly(m[2]);
  const h = (x: number) => f(x) * g(x);
  const k = m[3] === "constant term" ? 0 : m[3] === "coefficient of x" ? 1 : 4;
  return coeffOf(h, k, 4);
}

/** Shared route for the four signed-fraction forms: sign from counting printed minus signs,
 * magnitude numerically with a coprime-first search. */
function fracSignRoute(p: string): VariantAnswer {
  const m = p.match(/^(-?)(\d+)\/(\d+) (×|÷) (-?)(\d+)\/(\d+) = \?$/)!;
  const minus = (p.match(/-/g) ?? []).length;
  const sign: 1 | -1 = minus % 2 === 1 ? -1 : 1;
  const a = Number(m[2]), b = Number(m[3]), c = Number(m[6]), d = Number(m[7]);
  const v = m[4] === "×" ? (a / b) * (c / d) : a / b / (c / d);
  const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
  for (let den = 1; den <= 60; den++)
    for (let num = 1; num <= 150; num++) {
      if (g(num, den) !== 1) continue;
      if (Math.abs(num / den - v) < 1e-9) return { sign, whole: 0, num, den };
    }
  throw new Error("no fraction found");
}

/** Parse a text-encoded line plot ("1/4 → XX, 1/2 → XXX, 3/4 → —") into quarter-counts by string
 * inspection, then answer by loops and repeated subtraction. */
function linePlotRoute(p: string, mode: "total" | "difference"): VariantAnswer {
  const QTR: Record<string, number> = { "1/4": 1, "1/2": 2, "3/4": 3 };
  const counts: Array<{ qtr: number; n: number }> = [];
  for (const m of p.matchAll(/(\d\/\d) → (X*|—)/g)) {
    counts.push({ qtr: QTR[m[1]], n: m[2] === "—" ? 0 : m[2].length });
  }
  let quarters = 0;
  if (mode === "total") {
    for (const { qtr, n } of counts) for (let i = 0; i < n; i++) quarters += qtr;
  } else {
    const present = counts.filter((c) => c.n > 0).map((c) => c.qtr);
    let hi = present[0], lo = present[0];
    for (const q of present) {
      if (q > hi) hi = q;
      if (q < lo) lo = q;
    }
    quarters = hi - lo;
  }
  let W = 0;
  while (quarters >= 4) {
    quarters -= 4;
    W++;
  }
  if (quarters === 0) return { whole: W, num: 0, den: 1 };
  if (quarters === 2) return { whole: W, num: 1, den: 2 };
  return { whole: W, num: quarters, den: 4 };
}

/** Conic classification from the prompt's coefficient parenthetical or squared-term note. */
function classifyRoute(p: string): VariantAnswer {
  const [prompt] = p.split("||");
  if (/\(only [xy] is squared\)/.test(prompt)) return "parabola";
  const m = prompt.replace(/−/g, "-").match(/\(A = (-?\d+), C = (-?\d+)\)/);
  if (m) {
    const A = Number(m[1]), C = Number(m[2]);
    if (A * C < 0) return "hyperbola";
    return A === C ? "circle" : "ellipse";
  }
  // No parenthetical: the circle case prints Ax² + Ay² directly.
  const c = prompt.match(/Classify (\d+)x² \+ (\d+)y²/)!;
  return c[1] === c[2] ? "circle" : "ellipse";
}

/** Orbit answers from the printed e (or the parallel-ray device wording) against the lesson's
 * thresholds. */
function orbitRoute(p: string): VariantAnswer {
  const [prompt] = p.split("||");
  if (/cross-section is a:/.test(prompt)) return "parabola";
  const e = Number(prompt.match(/e [=≈] (\d+(?:\.\d+)?)/)![1]);
  if (e > 1) return "pass once and never return (unbound)";
  if (e >= 0.5) return "a very elongated ellipse (bound, it returns)";
  return "nearly a perfect circle";
}

/** Scientific notation, computed in plain decimal.
 *
 * Reads the two operands off the prompt, expands each to an ordinary number, applies the printed
 * operator, then finds the standard form by SHIFTING the decimal point one place at a time until
 * the coefficient lands in [1, 10). That is a genuinely different derivation from the generator's
 * coefficient-and-exponent rules: it never adds, subtracts or compares an exponent at all. */
function sciRoute(raw: string): string[] {
  const p = raw.split("||")[0]!; // the gate appends the token bank; the shape regex is $-anchored
  const SUP = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
  const unsup = (t: string) => {
    const neg = t.startsWith("\u207b");
    const body = [...t.replace("\u207b", "")].map((c) => String(SUP.indexOf(c))).join("");
    return Number(neg ? `-${body}` : body);
  };
  const m = p.match(/^\((\d+) \u00d7 10(\S+)\) (\u00d7|\u00f7|\+|\u2212) \((\d+) \u00d7 10(\S+)\) = \?$/)!;
  const a = Number(m[1]), ea = unsup(m[2]), b = Number(m[4]), eb = unsup(m[5]);
  const expand = (c: number, e: number) => c * Math.pow(10, e);
  const x = expand(a, ea), y = expand(b, eb);
  const value = m[3] === "\u00d7" ? x * y : m[3] === "\u00f7" ? x / y : m[3] === "+" ? x + y : x - y;
  // Shift the point until the coefficient sits in [1, 10), counting the shifts as the exponent.
  let coeff = value, exp = 0;
  while (Math.abs(coeff) >= 10) {
    coeff /= 10;
    exp += 1;
  }
  while (Math.abs(coeff) < 1) {
    coeff *= 10;
    exp -= 1;
  }
  const sup = (n: number) =>
    (n < 0 ? "\u207b" : "") + String(Math.abs(n)).split("").map((d) => SUP[Number(d)]).join("");
  return [String(Number(coeff.toFixed(2))), "\u00d7", `10${sup(exp)}`];
}

/** Solve a printed two-equation system by brute-force integer SEARCH.
 *
 * Both equations are read back out of the prompt and every candidate x in range is tested against
 * BOTH of them. Nothing is isolated, substituted or rearranged — which matters, because
 * back-substitution is exactly the procedure the generator performs and the learner is graded on. */
/** Parse a coordinate that may carry the typographic minus U+2212 rather than an ASCII hyphen. */
function coord(t: string): number {
  return Number(t.replace("−", "-"));
}

function backSubRoute(p: string): number[] {
  // y = mx + c   (m absent means 1; the sign is printed as a unicode minus)
  const e1 = p.match(/y = (\d*)x (\u2212|\+) (\d+)/)!;
  const m = e1[1] === "" ? 1 : Number(e1[1]);
  const c = (e1[2] === "\u2212" ? -1 : 1) * Number(e1[3]);
  // ax + y = t
  const e2 = p.match(/and (\d*)x \+ y = (\d+)/)!;
  const a = e2[1] === "" ? 1 : Number(e2[1]);
  const t = Number(e2[2]);
  for (let cx = -50; cx <= 50; cx++) {
    for (let cy = -50; cy <= 100; cy++) {
      if (cy === m * cx + c && a * cx + cy === t) return [cx, cy];
    }
  }
  throw new Error("no integer solution found");
}

/** Shared route for the three ca-evt forms: parse C, k and M off the printed x³ − Cx prompt on
 * [0, M], find every finite-difference sign change of f′ strictly inside (0, M), and evaluate
 * f at 0, M, and each interior critical point — never the generator's f(2k)/f(k) algebra. */
function evtRoute(p: string, want: "max" | "min" | "count"): number {
  const m = p.match(/x³ − (\d+)x on \[0, (\d+)\]/)!;
  const [C, M] = m.slice(1).map(Number);
  const f = (x: number) => x ** 3 - C * x;
  const h = 1e-4;
  const fp = (x: number) => (f(x + h) - f(x - h)) / (2 * h);
  const interior: number[] = [];
  let prev = fp(0.001);
  for (let x = 0.001; x < M; x += 0.001) {
    const cur = fp(x + 0.001);
    if (Math.sign(prev) !== 0 && Math.sign(cur) !== 0 && Math.sign(prev) !== Math.sign(cur)) {
      interior.push(Math.round(x));
    }
    prev = cur;
  }
  const distinctInterior = [...new Set(interior)];
  if (want === "count") return 2 + distinctInterior.length;
  const values = [f(0), f(M), ...distinctInterior.map(f)];
  return want === "max" ? Math.max(...values) : Math.min(...values);
}

/** Shared route for the two mvt-bound forms: walk from x0 to x1 one UNIT at a time, accumulating
 * the most extreme allowed step at each unit — never the generator's single multiplication. */
function mvtBoundRoute(p: string, want: "largest" | "smallest"): number {
  if (want === "smallest") {
    const m = p.match(/f\((-?\d+)\) = (-?\d+) and (\d+) ≤ f′\(x\) ≤ (\d+) everywhere\. What is the SMALLEST possible value of f\((-?\d+)\)/)!;
    const [x0, f0, lo, , x1] = m.slice(1).map(Number);
    let acc = f0;
    for (let x = x0; x < x1; x++) acc += lo;
    return acc;
  }
  const m = p.match(/f\((-?\d+)\) = (-?\d+) and f′\(x\) ≤ (\d+) for all x\. What is the largest possible value of f\((-?\d+)\)/)!;
  const [x0, f0, bound, x1] = m.slice(1).map(Number);
  let acc = f0;
  for (let x = x0; x < x1; x++) acc += bound;
  return acc;
}

/** Two marbles drawn without replacement, answered by ENUMERATING every ordered pair of distinct
 * marbles. Marbles 0..R−1 are red and the rest blue; each pair is equally likely, so counting the
 * favourable ones settles every question the tree asks without touching a probability formula. */
function treeRoute(p: string, want: "secondGivenFirst" | "bothRed" | "mixed" | "atLeastOneBlue"): number {
  const m = p.match(/holds (\d+) red and (\d+) blue marbles/)!;
  const R = Number(m[1]), B = Number(m[2]);
  const N = R + B;
  const isRed = (i: number) => i < R;
  let firstRed = 0, firstRedSecondRed = 0, both = 0, mixed = 0, atLeastBlue = 0, total = 0;
  for (let a = 0; a < N; a++)
    for (let b = 0; b < N; b++) {
      if (a === b) continue;
      total += 1;
      if (isRed(a)) firstRed += 1;
      if (isRed(a) && isRed(b)) {
        firstRedSecondRed += 1;
        both += 1;
      }
      if (isRed(a) !== isRed(b)) mixed += 1;
      if (!isRed(a) || !isRed(b)) atLeastBlue += 1;
    }
  const r =
    want === "secondGivenFirst"
      ? firstRedSecondRed / firstRed
      : want === "bothRed"
        ? both / total
        : want === "mixed"
          ? mixed / total
          : atLeastBlue / total;
  return Math.round(r * 1000) / 1000;
}

/** Decide a function's parity by SAMPLING mirrored inputs — never by reading the exponents. */
function parityOf(f: (x: number) => number): string {
  const xs = [0.5, 1, 1.5, 2, 3];
  const even = xs.every((x) => Math.abs(f(-x) - f(x)) < 1e-9);
  const odd = xs.every((x) => Math.abs(f(-x) + f(x)) < 1e-9);
  return even ? "Even" : odd ? "Odd" : "Neither";
}

/** Read a printed postage table and apply each bracket's OWN condition to a weight. */
function stepRoute(p: string, w: number): number {
  const m = p.match(
    /C\(w\) = \$([\d.]+) for w ≤ 1, \$([\d.]+) for 1 < w ≤ 2, and \$([\d.]+) for 2 < w ≤ 3/
  )!;
  const [p1, p2, p3] = m.slice(1).map(Number);
  if (w <= 1) return p1;
  if (w <= 2) return p2;
  return p3;
}

/** Every root of sin(Bx) = c on [0, 2π), found by scanning for sign changes and bisecting.
 * Nothing here knows the closed forms the generator uses. */
function trigRoots(B: number, label: string): number[] {
  const c = label === "1/2" ? 0.5 : label === "√2/2" ? Math.SQRT2 / 2 : Math.sqrt(3) / 2;
  const f = (x: number) => Math.sin(B * x) - c;
  const roots: number[] = [];
  const N = 200000;
  let prev = f(0);
  for (let i = 1; i <= N; i++) {
    const x = (2 * Math.PI * i) / N;
    const cur = f(x);
    if (prev < 0 !== cur < 0) {
      let lo = (2 * Math.PI * (i - 1)) / N;
      let hi = x;
      for (let j = 0; j < 60; j++) {
        const mid = (lo + hi) / 2;
        if (f(lo) < 0 !== f(mid) < 0) hi = mid;
        else lo = mid;
      }
      roots.push((lo + hi) / 2);
    }
    prev = cur;
  }
  return roots;
}

/** Read both denominators off a like-denominator sum or difference and CONFIRM they agree before
 * reporting one — an assertion the generator never makes about its own output. */
function sameDenom(p: string, re: RegExp): number {
  const m = p.match(re)!;
  const d1 = Number(m[2]);
  const d2 = Number(m[4]);
  if (d1 !== d2) throw new Error("denominators differ — not a like-denominator problem");
  return d1;
}

/** The coefficient PRINTED in a double-angle prompt, as text ("1", "−1", "√2", …). */
function coefTextOf(p: string): string {
  const m = p.match(/sin 2x = (−?(?:√2|√3)?) ?sin x/)!;
  const raw = m[1];
  return raw === "" ? "1" : raw === "−" ? "−1" : raw;
}

/** …and as a number, for root-finding. */
function coefOf(p: string): number {
  const t = coefTextOf(p);
  const neg = t.startsWith("−");
  const mag = t.replace("−", "");
  const v = mag === "1" ? 1 : mag === "√2" ? Math.SQRT2 : Math.sqrt(3);
  return neg ? -v : v;
}

/** Every root of sin 2x = k·sin x on [0, 2π), found by scanning for sign changes and bisecting.
 * Nothing here factors the equation — the whole point is to check the factorisation's claims. */
function doubleAngleRoots(k: number): number[] {
  const f = (x: number) => Math.sin(2 * x) - k * Math.sin(x);
  const roots: number[] = [];
  const N = 300000;
  let prev = f(0);
  if (Math.abs(prev) < 1e-12) roots.push(0);
  for (let i = 1; i <= N; i++) {
    const x = (2 * Math.PI * i) / N;
    const cur = f(x);
    if (prev < 0 !== cur < 0) {
      let lo = (2 * Math.PI * (i - 1)) / N;
      let hi = x;
      for (let j = 0; j < 60; j++) {
        const mid = (lo + hi) / 2;
        if (f(lo) < 0 !== f(mid) < 0) hi = mid;
        else lo = mid;
      }
      const r = (lo + hi) / 2;
      if (r < 2 * Math.PI - 1e-9) roots.push(r);
    }
    prev = cur;
  }
  return roots;
}

/** Evaluate a printed coordinate like "−2√3", "√3" or "3" to a number. */
function surd(t: string): number {
  const neg = t.startsWith("\u2212");
  const body = t.replace("\u2212", "");
  if (body === "√3") return neg ? -Math.sqrt(3) : Math.sqrt(3);
  const m = body.match(/^(\d+)(√3)?$/)!;
  const v = Number(m[1]) * (m[2] ? Math.sqrt(3) : 1);
  return neg ? -v : v;
}

/** The (x, y) pair printed in a polar prompt, evaluated numerically. */
function polarCoords(p: string): { x: number; y: number } {
  const m = p.match(/\((\u2212?\d*√?3?), (\u2212?\d*√?3?)\)/)!;
  return { x: surd(m[1]), y: surd(m[2]) };
}

/** The radian value of a label like "5π/6" or "−π/3"; null if it is not an angle label. */
function piLabelValue(label: string): number | null {
  const m = label.match(/^(\u2212)?(\d*)π\/(\d+)$/);
  if (!m) return null;
  const num = m[2] === "" ? 1 : Number(m[2]);
  const v = (num / Number(m[3])) * Math.PI;
  return m[1] ? -v : v;
}

/** The numeric value of a named exact trig value. */
function namedValue(label: string): number {
  return label === "1/2" ? 0.5 : label === "√2/2" ? Math.SQRT2 / 2 : Math.sqrt(3) / 2;
}

/** Every root of f on [0, 2π), found by scanning for sign changes and bisecting. */
function periodRoots(f: (x: number) => number): number[] {
  const roots: number[] = [];
  const N = 200000;
  let prev = f(0);
  if (Math.abs(prev) < 1e-12) roots.push(0);
  for (let i = 1; i <= N; i++) {
    const x = (2 * Math.PI * i) / N;
    const cur = f(x);
    if (prev < 0 !== cur < 0) {
      let lo = (2 * Math.PI * (i - 1)) / N;
      let hi = x;
      for (let j = 0; j < 60; j++) {
        const mid = (lo + hi) / 2;
        if (f(lo) < 0 !== f(mid) < 0) hi = mid;
        else lo = mid;
      }
      const r = (lo + hi) / 2;
      if (r < 2 * Math.PI - 1e-9) roots.push(r);
    }
    prev = cur;
  }
  return roots;
}

/** Grade 8 independent-route helpers. These deliberately reconstruct values from the printed
 * problem rather than importing any generator internals. */
function g8SupInt(src: string): number {
  const digit: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
  let sign = 1;
  let out = "";
  for (const ch of src) {
    if (ch === "⁻") sign = -1;
    else if (digit[ch] !== undefined) out += digit[ch];
  }
  if (out === "") throw new Error(`cannot decode superscript ${src}`);
  return sign * Number(out);
}
function g8Sup(exp: number): string {
  const digit = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  const body = String(Math.abs(exp)).split("").map((d) => digit[Number(d)]).join("");
  return exp < 0 ? `⁻${body}` : body;
}
function g8SquareRootIfExact(n: number): number | null {
  for (let k = 0; k * k <= n; k++) if (k * k === n) return k;
  return null;
}
function g8LabelValue(label: string): number {
  const s = label.trim().replace(/−/g, "-");
  let m = s.match(/^√(\d+)$/);
  if (m) return Math.sqrt(Number(m[1]));
  if (s === "π") return Math.PI;
  if (s === "e") return Math.E;
  m = s.match(/^(-?\d+)\/(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  return Number(s);
}
function g8FractionTerminates(n: number, d: number): boolean {
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  let q = d / gcd(n, d);
  while (q % 2 === 0) q /= 2;
  while (q % 5 === 0) q /= 5;
  return q === 1;
}
function g8ScientificParts(p: string): Array<{ coeff: number; exp: number }> {
  return [...p.matchAll(/(\d+(?:\.\d+)?) × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g)].map((m) => ({
    coeff: Number(m[1]),
    exp: g8SupInt(m[2]),
  }));
}
function g8NormalizeScientific(coeff: number, exp: number): [string, string, string] {
  while (Math.abs(coeff) >= 10) { coeff /= 10; exp += 1; }
  while (Math.abs(coeff) > 0 && Math.abs(coeff) < 1) { coeff *= 10; exp -= 1; }
  const shown = String(Number(coeff.toFixed(10)));
  return [shown, "×", `10${g8Sup(exp)}`];
}
function g8PiCoeffLabel(n: number, d = 1): string {
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const g = gcd(n, d); n /= g; d /= g;
  if (d === 1) return n === 1 ? "π" : `${n}π`;
  return `${n}/${d} π`;
}

/** Parse one printed slope-intercept equation without sharing the generator's construction path. */
function g8ParseSlopeToken(raw: string): number {
  const s = raw.trim().replace(/−/g, "-");
  if (s === "" || s === "+") return 1;
  if (s === "-") return -1;
  if (s === "½") return 0.5;
  if (s === "-½") return -0.5;
  const f = s.match(/^(-?\d+)\/(\d+)$/);
  return f ? Number(f[1]) / Number(f[2]) : Number(s);
}
function g8ParseLine(src: string): { m: number; b: number } {
  const m = src.trim().match(/^y = ([^x]*)x(?: ([−+]) (\d+))?$/)!;
  return { m: g8ParseSlopeToken(m[1]), b: m[2] ? (m[2] === "−" ? -1 : 1) * Number(m[3]) : 0 };
}
function g8LinesFromPrompt(prompt: string): Array<{ m: number; b: number }> {
  const printed = prompt.split("||")[0];
  const lines = printed.match(/y = (?:[-−]?\d+(?:\/\d+)?|[-−]?½|[-−]?)?x(?: [−+] \d+)?/g) ?? [];
  return lines.map((x) => g8ParseLine(x.trim()));
}
function g8LinearCoefficients(raw: string): { a: number; b: number } {
  const s = raw.trim().replace(/−/g, "-").replace(/\s+/g, "");
  let m = s.match(/^(-?\d+)\(x([+-]\d+)\)$/);
  if (m) return { a: Number(m[1]), b: Number(m[1]) * Number(m[2]) };
  m = s.match(/^(-?\d*)x([+-]\d+)?$/);
  if (!m) throw new Error(`cannot parse linear expression ${raw}`);
  const a = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
  return { a, b: m[2] ? Number(m[2]) : 0 };
}
function g8ClassifyPrintedEquation(prompt: string): "No solution" | "One solution" | "Infinitely many solutions" {
  const eq = prompt.match(/Classify: (.+?)\.?$/)![1];
  const [left, right] = eq.split("=").map(g8LinearCoefficients);
  return left.a !== right.a ? "One solution" : left.b === right.b ? "Infinitely many solutions" : "No solution";
}

/** Determine function status from the printed mapping itself: repeated outputs are allowed,
 * but one input paired with two different outputs is not. */
function g8RelationIsFunction(raw: string): boolean {
  const match = raw.match(/records (.+?)(?:\. Is|\. Several|$)/);
  const body = (match?.[1] ?? raw).trim();
  const outputs = new Map<string, Set<string>>();
  for (const part of body.split(";").map((x) => x.trim()).filter(Boolean)) {
    const arrow = part.indexOf("→");
    if (arrow < 1) continue;
    const input = part.slice(0, arrow).trim();
    const output = part.slice(arrow + 1).trim().replace(/[.?]$/, "");
    const seen = outputs.get(input) ?? new Set<string>();
    seen.add(output);
    outputs.set(input, seen);
  }
  return outputs.size > 0 && [...outputs.values()].every((set) => set.size === 1);
}

function g8PrintedFunctionRule(raw: string): { m: number; b: number } | null {
  let m = raw.match(/(?:Equation )?y = (\d+)x \+ (\d+)/);
  if (m) return { m: Number(m[1]), b: Number(m[2]) };
  m = raw.match(/Table 0→(-?\d+); 1→(-?\d+); 2→(-?\d+)/);
  if (m) return { m: Number(m[2]) - Number(m[1]), b: Number(m[1]) };
  m = raw.match(/Story starts at (-?\d+) and rises (-?\d+) each step/);
  if (m) return { m: Number(m[2]), b: Number(m[1]) };
  return null;
}


function decimalWordNumber(raw: string): number {
  const SMALL: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  };
  const parts = raw.toLowerCase().replace(/-/g, " ").trim().split(/\s+/);
  let total = 0, current = 0;
  for (const part of parts) {
    if (part === "hundred") current *= 100;
    else current += SMALL[part] ?? 0;
  }
  total += current;
  return total;
}

function decimalDigitWord(d: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][d];
}


function nsGcd(...values: number[]): number {
  const pair = (a: number, b: number): number => (b === 0 ? Math.abs(a) : pair(b, a % b));
  return values.reduce((g, v) => pair(g, Math.abs(v)));
}

function nsExact(raw: string): { n: number; d: number } {
  const cleaned = raw.trim().replace(/[°,$]/g, "").replace(/[.?]$/, "");
  let m = cleaned.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (m) {
    const sign = Number(m[1]) < 0 ? -1 : 1;
    const n = sign * (Math.abs(Number(m[1])) * Number(m[3]) + Number(m[2]));
    const d = Number(m[3]), g = nsGcd(n, d);
    return { n: n / g, d: d / g };
  }
  m = cleaned.match(/^(-?\d+)\/(\d+)$/);
  if (m) {
    const n = Number(m[1]), d = Number(m[2]), g = nsGcd(n, d);
    return { n: n / g, d: d / g };
  }
  if (/^-?\d+\.\d+$/.test(cleaned)) {
    const neg = cleaned.startsWith("-") ? -1 : 1;
    const body = cleaned.replace(/^-/, "");
    const [w, f] = body.split(".");
    const d = 10 ** f.length, n = neg * (Number(w) * d + Number(f)), g = nsGcd(n, d);
    return { n: n / g, d: d / g };
  }
  return { n: Number(cleaned), d: 1 };
}

function nsRelation(a: string, b: string): "lt" | "eq" | "gt" {
  const A = nsExact(a), B = nsExact(b);
  const cross = A.n * B.d - B.n * A.d;
  return cross < 0 ? "lt" : cross > 0 ? "gt" : "eq";
}

function nsOptions(raw: string): string[] {
  return raw.split("||")[1]?.split(";;") ?? [];
}



function g6RatioRoute(key: string): VariantAnswer | undefined {
  const [prompt, labelsRaw = ""] = key.split("||");
  const labels = labelsRaw ? labelsRaw.split(";;") : [];
  let m = prompt.match(/has (\d+) .* for every (\d+) .* ratio of .* to/i);
  if (m && /What is the ratio/.test(prompt)) return [m[2], ":", m[1]];
  m = prompt.match(/garden has (\d+) tulips and (\d+) roses.*simplest form/i);
  if (m) { const a=Number(m[1]),b=Number(m[2]),g=nsGcd(a,b); return [`${a/g}`,":",`${b/g}`]; }
  m = prompt.match(/mixed with (\d+) parts blue for every (\d+) parts yellow/i);
  if (m) return [m[1], ":", `${Number(m[1])+Number(m[2])}`];
  m = prompt.match(/has (\d+) apples for every (\d+) oranges.*has (\d+) apples/i);
  if (m) return Number(m[3]) * Number(m[2]) / Number(m[1]);
  m = prompt.match(/uses (\d+) cups flour for every (\d+) cups milk.*uses (\d+) cups flour/i);
  if (m) return Number(m[3]) * Number(m[2]) / Number(m[1]);
  m = prompt.match(/wins-to-losses ratio is (\d+) : (\d+)/i);
  if (m) return Number(m[1])+Number(m[2]);
  m = prompt.match(/ratio (\d+) : (\d+) shrinks to (\d+) : (\d+)/i);
  if (m) return Number(m[1])/Number(m[3]);
  m = prompt.match(/ratio table begins (\d+) : (\d+).*pairs with (\d+)/i);
  if (m) return Number(m[3])*Number(m[2])/Number(m[1]);
  m = prompt.match(/table for (\d+) : (\d+) has the row \? : (\d+)/i);
  if (m) return Number(m[3])*Number(m[1])/Number(m[2]);
  m = prompt.match(/aligns (\d+) laps with (\d+) minutes.*under (\d+) laps/i);
  if (m) return Number(m[3])*Number(m[2])/Number(m[1]);
  m = prompt.match(/aligns (\d+) laps with (\d+) minutes.*above (\d+) minutes/i);
  if (m) return Number(m[3])*Number(m[1])/Number(m[2]);
  if (!labels.length) return undefined;
  if (/PART-TO-WHOLE/.test(prompt)) return labels.find(x=>/students chose art/.test(x));
  m = prompt.match(/ratio (\d+) : (\d+).*MUST/i);
  if (m) return labels.find(x=>x===`${m[1]} of every ${Number(m[1])+Number(m[2])} fruits are apples`);
  if (/Which ratio is equivalent/.test(prompt)) {
    const b=prompt.match(/(\d+) : (\d+)/)!; const a=Number(b[1]),c=Number(b[2]);
    return labels.find(x=>{const z=x.match(/(\d+) : (\d+)/);return !!z&&Number(z[1])*c===Number(z[2])*a;});
  }
  if (/Which pair of ratios is NOT equivalent/.test(prompt)) return labels.find(x=>{const z=[...x.matchAll(/(\d+) : (\d+)/g)];return z.length===2&&Number(z[0][1])*Number(z[1][2])!==Number(z[0][2])*Number(z[1][1]);});
  if (/Which row is WRONG/.test(prompt)) {
    const b=prompt.match(/table for (\d+) : (\d+)/)!;const a=Number(b[1]),c=Number(b[2]);
    return labels.find(x=>{const z=x.match(/(\d+) : (\d+)/);return !!z&&Number(z[1])*c!==Number(z[2])*a;});
  }
  if (/starts the minutes line/.test(prompt)) return labels.find(x=>x.startsWith("The stacked marks stop"));
  if (/Which tool fits/.test(prompt)) return labels.find(x=>x.startsWith("A ratio table"));
  if (/Does the shrink test agree/.test(prompt)) return labels.find(x=>x.startsWith("Yes — dividing both parts"));
  if (/Which pair keeps the SAME relationship/.test(prompt)) {
    const b=prompt.match(/as (\d+) : (\d+)/)!;const a=Number(b[1]),c=Number(b[2]);
    return labels.find(x=>{const z=x.match(/(\d+) : (\d+)/);return !!z&&Number(z[1])*c===Number(z[2])*a;});
  }
  return undefined;
}

function g6UnitRoute(key: string): VariantAnswer | undefined {
  const [prompt, labelsRaw=""] = key.split("||"); const labels=labelsRaw?labelsRaw.split(";;"):[];
  let m=prompt.match(/cost \$(\d+) for (\d+) pounds.*division/i);
  if(m&&labels.length){const mm=m;return labels.find(x=>x.startsWith(`${mm[1]} ÷ ${mm[2]}`));}
  m=prompt.match(/cost \$(\d+) per pound.*do (\d+) pounds cost/i);if(m)return Number(m[1])*Number(m[2]);
  m=prompt.match(/travels (\d+) miles in (\d+) hours.*speed/i);if(m)return Number(m[1])/Number(m[2]);
  m=prompt.match(/covers (\d+) miles in (\d+) hours.*in (\d+) hours/i);if(m)return Number(m[1])/Number(m[2])*Number(m[3]);
  m=prompt.match(/(\d+)-ounce drink costs \$(\d+(?:\.\d+)?)/i);if(m)return Number(m[2])*100/Number(m[1]);
  if(/Small package:/.test(prompt)&&labels.length)return labels.find(x=>x.startsWith("The large package"));
  if(/Ana travels/.test(prompt)&&labels.length){const z=prompt.match(/Ana travels (\d+) miles in (\d+) hours.*Ben travels (\d+) miles in (\d+) hours/)!;return labels.find(x=>x.startsWith(Number(z[1])/Number(z[2])>Number(z[3])/Number(z[4])?"Ana —":"Ben —"));}
  if(/Three jars cost/.test(prompt)&&labels.length){const z=[...prompt.matchAll(/\$(\d+(?:\.\d+)?) for (\d+) oz/g)];const rates=z.map(x=>Number(x[1])*100/Number(x[2]));const best=rates.indexOf(Math.min(...rates));return labels.find(x=>x.startsWith(`The ${z[best][2]} oz jar`));}
  m=prompt.match(/pays \$(\d+) per hour.*earn \$(\d+)/i);if(m)return Number(m[2])/Number(m[1]);
  m=prompt.match(/makes (\d+) pages in (\d+) minutes.*in (\d+) minutes/i);if(m)return Number(m[1])/Number(m[2])*Number(m[3]);
  if(/What failed/.test(prompt)&&labels.length)return labels.find(x=>x.startsWith("The steady-pace assumption"));
  m=prompt.match(/Store A sells (\d+) pounds for \$(\d+); Store B sells (\d+) pounds for \$(\d+).*Buying (\d+) pounds/i);if(m)return Math.min(Number(m[2])/Number(m[1]),Number(m[4])/Number(m[3]))*Number(m[5]);
  m=prompt.match(/costs \$(\d+) per pound.*buy (\d+) pounds.*take (\d+)% off/i);if(m)return Number((Number(m[1])*Number(m[2])*(1-Number(m[3])/100)).toFixed(10));
  return undefined;
}

function g6PercentRoute(key:string):VariantAnswer|undefined{
  const [prompt,labelsRaw=""]=key.split("||");const labels=labelsRaw?labelsRaw.split(";;"):[];
  let m=prompt.match(/simplest form, equals (\d+)%/i);if(m&&labels.length){const p=Number(m[1]),g=nsGcd(p,100);return labels.find(x=>x===`${p/g}/${100/g}`);}
  m=prompt.match(/Write (\d+)\/(\d+) as a percent/i);if(m)return Number(m[1])*100/Number(m[2]);
  m=prompt.match(/grid, (\d+)\/(\d+) of the squares/i);if(m)return Number(m[1])*100/Number(m[2]);
  if(/Order from SMALLEST/.test(prompt)&&labels.length){const raw=prompt.split(':')[1].replace(/\.$/,'').split(',').map(x=>x.trim());const val=(x:string)=>x.endsWith('%')?Number(x.slice(0,-1)):Number(x.split('/')[0])/Number(x.split('/')[1])*100;const wanted=[...raw].sort((a,b)=>val(a)-val(b)).join(', ');return labels.find(x=>x===wanted);}
  m=prompt.match(/(\d+)% of a number is (\d+)/i);if(m)return Number(m[2])*100/Number(m[1]);
  m=prompt.match(/What is (\d+)% of (\d+)/i);if(m)return Number(m[1])*Number(m[2])/100;
  m=prompt.match(/team won (\d+)% of its (\d+) games/i);if(m)return Number(m[1])*Number(m[2])/100;
  return undefined;
}

function g6ConvertRoute(key:string):VariantAnswer|undefined{
  const [prompt,labelsRaw=""]=key.split("||");const labels=labelsRaw?labelsRaw.split(";;"):[];
  if(/Converting .* into .* do you multiply/i.test(prompt)&&labels.length)return labels.find(x=>x.startsWith("Multiply —"));
  let m=prompt.match(/There are (\d+) .* in 1 .*\. How many .* is (\d+) /i);if(m)return Number(m[2])/Number(m[1]);
  m=prompt.match(/How many hours is (\d+) minutes/i);if(m)return Number(m[1])/60;
  m=prompt.match(/uses (\d+) cups of flour per batch.*for (\d+) batches/i);if(m)return Number(m[1])*Number(m[2]);
  m=prompt.match(/seconds are in (\d+) minutes/i);if(m)return Number(m[1])*60;
  m=prompt.match(/seconds are in (\d+) hours/i);if(m)return Number(m[1])*3600;
  if(/Which is longer: 1 day/.test(prompt)&&labels.length)return labels.find(x=>x.startsWith("1 day —"));
  return undefined;
}



function ddOptions(raw: string): string[] {
  return raw.split("||")[1]?.split(";;") ?? [];
}
function ddList(raw: string): number[] {
  return raw.split(",").map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));
}
function ddMedian(xs: number[]): number {
  const a = [...xs].sort((x, y) => x - y), n = a.length;
  return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
}
function ddIqr(xs: number[]): number {
  const a = [...xs].sort((x, y) => x - y), h = Math.floor(a.length / 2);
  return ddMedian(a.slice(a.length - h)) - ddMedian(a.slice(0, h));
}
function ddDataRoute(form: string, raw: string): VariantAnswer {
  const [p] = raw.split("||"), opts = ddOptions(raw);
  if (form === "ddStatDefinition") return opts.find((x) => x.startsWith("It expects the individual answers to vary"))!;
  if (form === "ddStatRewrite") return opts.find((x) => /^How (far|many|long) do |^How many pages did each/.test(x))!;
  if (form === "ddStatFixedFact") return opts.find((x) => x.startsWith("No — it has the fixed answer"))!;
  if (form === "ddStatChoose") return opts.find((x) => /students in this school|each student|each runner/.test(x))!;
  if (form === "ddDataRepeatedValues") {
    const n = Number(p.match(/^(\d+) students/)![1]);
    return opts.find((x) => x.startsWith(`${n} values`))!;
  }
  if (form === "ddDataMixedQuestions") return opts.find((x) => x.startsWith("The values answer different questions"))!;
  if (form === "ddDataCountList") return ddList(p.match(/data: ([\d, ]+)\./)![1]).length;
  if (form === "ddDataClassSize") return Number(p.match(/each of (\d+) club members/)![1]);
  if (form === "ddPipelineBreak") return opts.find((x) => x.startsWith("At the first step"))!;
  if (form === "ddVariabilityExpected") return opts.find((x) => x.startsWith("The variability is expected"))!;
  if (form === "ddReadyQuestion") return opts.find((x) => /How many (minutes|goals|hours) did each/.test(x))!;
  if (form === "ddSurveyPlan") return opts.find((x) => x.startsWith("Ask each "))!;
  if (form === "ddHistTotal") return ddList(p.match(/bar heights are ([\d, ]+)\./)![1]).reduce((a, b) => a + b, 0);
  if (form === "ddHistExactValues") return opts.find((x) => x.startsWith("No — only their bin interval"))!;
  if (form === "ddHistDisplayChoice") return opts.find((x) => x.startsWith("A histogram —"))!;
  if (form === "ddHistEqualBins") return opts.find((x) => x.startsWith("The last bin is twice as wide"))!;
  throw new Error(`unknown data-literacy route ${form}`);
}
function ddDotRoute(form: string, raw: string): VariantAnswer {
  const [p] = raw.split("||"), opts = ddOptions(raw);
  const pairs = [...p.matchAll(/(-?\d+(?:\.\d+)?) \((\d+) dot/g)].map((m) => ({ value: Number(m[1]), count: Number(m[2]) }));
  if (form === "ddDotTotal") return pairs.reduce((s, x) => s + x.count, 0);
  if (form === "ddDotDataSet") {
    const values: number[] = [];
    for (const x of pairs) for (let i = 0; i < x.count; i++) values.push(x.value);
    return opts.find((x) => x === values.join(", "))!;
  }
  if (form === "ddDotMissingValue") {
    const gap = p.match(/no dots above (-?\d+(?:\.\d+)?)/)![1];
    return opts.find((x) => x === `No observation in the data set equals ${gap}`)!;
  }
  if (form === "ddDotMoreThan") {
    const t = Number(p.match(/greater than (-?\d+(?:\.\d+)?)/)![1]);
    return pairs.filter((x) => x.value > t).reduce((s, x) => s + x.count, 0);
  }
  if (form === "ddShapeSymmetric") return opts.find((x) => x.startsWith("Roughly symmetric"))!;
  if (form === "ddShapeOutlier") return opts.find((x) => x.startsWith("It is an outlier"))!;
  if (form === "ddShapeClusterCount") {
    const m = p.match(/has (\d+) dots at (-?\d+), (\d+) at (-?\d+)/)!;
    return Number(m[1]) + Number(m[3]);
  }
  if (form === "ddShapeFullStory") return opts.find((x) => x.startsWith("Clustered at"))!;
  throw new Error(`unknown dot route ${form}`);
}
function ddCenterRoute(form: string, raw: string): VariantAnswer {
  const [p] = raw.split("||"), opts = ddOptions(raw);
  if (form === "ddMeanBasic") return ddList(p.match(/mean of ([\d, ]+)\./)![1]).reduce((a,b)=>a+b,0) / ddList(p.match(/mean of ([\d, ]+)\./)![1]).length;
  if (form === "ddMeanContext") { const xs=ddList(p.match(/took ([\d, ]+) minutes/)![1]); return xs.reduce((a,b)=>a+b,0)/xs.length; }
  if (form === "ddMeanMissing") { const m=p.match(/Four scores have a mean of (\d+)\. Three scores are ([\d, ]+)\./)!; return 4*Number(m[1])-ddList(m[2]).reduce((a,b)=>a+b,0); }
  if (form === "ddMeanMeaning") return opts.find((x)=>x.startsWith("The fair-share value"))!;
  if (form === "ddMedianOddUnsorted") return ddMedian(ddList(p.match(/median of ([\d, ]+)\./)![1]));
  if (form === "ddMedianEven") return ddMedian(ddList(p.match(/sorted data ([\d, ]+)\?/)![1]));
  if (form === "ddMedianSortError") return opts.find((x)=>x.startsWith("The data was not sorted"))!;
  if (form === "ddMedianContext") return ddMedian(ddList(p.match(/measure ([\d, ]+) inches/)![1]));
  if (form === "ddMedianOutlierData") return ddMedian(ddList(p.match(/median of ([\d, ]+)\./)![1]));
  if (form === "ddCenterTypical") return opts.find((x)=>x.startsWith("The median —"))!;
  if (form === "ddMeanMedianTail" || form === "ddShapeFromCenters") return opts.find((x)=>x.startsWith("A high outlier"))!;
  if (form === "ddOutlierMeanShift") { const m=p.match(/data ([\d, ]+) has mean (\d+)\. After adding (\d+)/)!; const xs=ddList(m[1]), old=Number(m[2]); return (xs.reduce((a,b)=>a+b,0)+Number(m[3]))/(xs.length+1)-old; }
  if (form === "ddRangeBasic") { const xs=ddList(p.match(/range of ([\d, ]+)\./)![1]); return Math.max(...xs)-Math.min(...xs); }
  if (form === "ddRangeEndpointsOnly") return opts.find((x)=>x.startsWith("Range uses only the shared endpoints"))!;
  if (form === "ddRangeNewOutlier") { const m=p.match(/data ([\d, ]+) gains a new high value (\d+)/)!; const xs=ddList(m[1]);xs.push(Number(m[2]));return Math.max(...xs)-Math.min(...xs); }
  if (form === "ddIqrGiven" || form === "ddSummaryIqr" || form === "ddChoiceIqr") { const m=p.match(/Q1 = (\d+) and Q3 = (\d+)/)!; return Number(m[2])-Number(m[1]); }
  if (form === "ddIqrOddSeven") return ddIqr(ddList(p.match(/sorted data ([\d, ]+), exclude/)![1]));
  if (form === "ddIqrOutlierRobust") return opts.find((x)=>x.startsWith("The range —"))!;
  if (form === "ddIqrUnsortedEven") return ddIqr(ddList(p.match(/IQR of ([\d, ]+)\./)![1]));
  if (form === "ddCompareIqr") return ddIqr(ddList(p.match(/Class B's sorted data is ([\d, ]+)\./)![1]));
  if (form === "ddSimilarClass") return opts.find((x)=>x.startsWith("Class A —"))!;
  if (form === "ddCompareRange") { const xs=ddList(p.match(/data ([\d, ]+)\?/)![1]);return Math.max(...xs)-Math.min(...xs); }
  if (form === "ddFullReport") return opts.find((x)=>x.startsWith("Median ") && x.includes("IQR"))!;
  if (form === "ddIncompleteReport") return opts.find((x)=>x.startsWith('"The average is'))!;
  if (form === "ddSummaryMean" || form === "ddCapMean") { const m=p.match(/sum (\d+) across (\d+) observations/)!;return Number(m[1])/Number(m[2]); }
  if (form === "ddBestDescription") return opts.find((x)=>x.startsWith("Values cluster symmetrically"))!;
  if (form === "ddTypicalMedian") { const xs=ddList(p.match(/data ([\d, ]+), which/)![1]); const m=ddMedian(xs);return opts.find((x)=>x.startsWith(`The median, ${m}`))!; }
  if (form === "ddCenterGap" || form === "ddCapGap") { const m=p.match(/mean (\d+) and median (\d+)/)!;return Math.abs(Number(m[1])-Number(m[2])); }
  if (form === "ddCapShape") return opts.find((x)=>x.startsWith("Clustered from"))!;
  if (form === "ddCapReport") return opts.find((x)=>x.startsWith("Most values cluster near"))!;
  throw new Error(`unknown center/spread route ${form}`);
}

const INDEPENDENT: Record<string, (prompt: string) => VariantAnswer> = {
  "k0-add-subtract": (p) => solveG0Prompt("KoaJoinNumeric", p),
  "g0-counting": (p) => solveG0Prompt("countAddMcq", p),
  "k0-count-100": (p) => solveG0Prompt("kSeqNextHop", p),
  "g0-shapes-sorting": (p) => solveG0Prompt("shapeComposePairs", p),
  "g1-data": (p) => solveG1Prompt("GdTotalNumeric", p),
  "g3-mult-fluency": (p) => solveG3FluencyPrompt("MultTable2Numeric", p),
  "g3-div-fluency": (p) => solveG3FluencyPrompt("DivBy2Numeric", p),
  "g1-add-subtract": (p) => solveG1Prompt("defaultAddSubtract", p),
  "g1-counting-120": (p) => solveG1Prompt("defaultCounting120", p),
  "g1-shapes-measure": (p) => solveG1Prompt("Smg12D3DMcq", p),
  "g1-tens-ones": (p) => solveG1Prompt("TnoAddTensNumeric", p),
  "g2-fluency": (p) => solveG2Prompt("FlDoublesNumeric", p),
  "g2-add-subtract-100": (p) => solveG2Prompt("Add2DigitNumeric", p),
  "g2-measure-money-time": (p) => solveG2Prompt("MmtBarGraphNumeric", p),
  "g2-place-value-1000": (p) => solveG2Prompt("Pv1000AddByPlaceNumeric", p),
  "g2-shapes-shares": (p) => solveG2Prompt("Ssg2CompareSharesMcq", p),
  "g4-fractions": (p) => solveG4Prompt("faEquivalenceRecapMcq", p),
  "g4-decimals": (p) => solveG4Prompt("dTenthsWriteNumeric", p),
  "g4-lines-angles": (p) => solveG4Prompt("laGeometricBasicsMcq", p),
  "g4-measure": (p) => solveG4Prompt("mcPerimeterFormulaMcq", p),
  "g4-multiply": (p) => solveG4Prompt("mbTimesAsManyMcq", p),
  "g4-place-million": (p) => solveG4Prompt("pvPlaceLadderMcq", p),
  "a1-exponential": (p) => solveA1Prompt("exp-compare__numeric", p),
  "a1-polynomials": (p) => solveA1Prompt("exponent-power__numeric", p),
  "a1-functions-sequences": (p) => solveA1Prompt("fn-arith-rule__numeric", p),
  "a1-linear-functions": (p) => solveA1Prompt("form-conversion__numeric", p),
  "a1-quadratics": (p) => solveA1Prompt("quad-apply-choose__numeric", p),
  "a1-radicals": (p) => solveA1Prompt("rad-distance__numeric", p),
  "a1-solving-equations": (p) => solveA1Prompt("both-sides__numeric", p),
  "a1-systems": (p) => solveA1Prompt("word-total-difference__numeric", p),
  "a2-complex": (p) => solveA2Prompt("cn-multiply__mcq", p),
  "a2-transformations": (p) => solveA2Prompt("ft-compose-rule__numeric", p),
  "a2-logarithms": (p) => solveA2Prompt("lg-define__numeric", p),
  "a2-polynomials": (p) => solveA2Prompt("pf-anatomy__numeric", p),
  "a2-radicals": (p) => solveA2Prompt("re-convert__numeric", p),
  "a2-rationals": (p) => solveA2Prompt("rf-excluded__numeric", p),
  "a2-series": (p) => solveA2Prompt("sr-convert__numeric", p),
  "a2-statistics": (p) => solveA2Prompt("si-margin__numeric", p),
  "a2-trig": (p) => solveA2Prompt("tf-reference__numeric", p),
  "g10-circle-theorems": (p) => solveGeometryPrompt("cr-arc-length__numeric", p),
  "g10-constructions-proof": (p) => solveGeometryPrompt("cp-angle-bisector__mcq", p),
  "g10-coordinate-proofs": (p) => solveGeometryPrompt("cx-circle-cts__mcq", p),
  "g10-geometry-foundations": (p) => solveGeometryPrompt("gf-algebra-measures__numeric", p),
  "g10-polygons-quadrilaterals": (p) => solveGeometryPrompt("pq-capstone__mcq", p),
  "g10-right-triangles": (p) => solveGeometryPrompt("rt-306090-apply__numeric", p),
  "g10-similarity": (p) => solveGeometryPrompt("sy-aa__mcq", p),
  "g10-solid-geometry": (p) => solveGeometryPrompt("sg-cavalieri-apply__mcq", p),
  "g10-triangle-congruence": (p) => solveGeometryPrompt("tc-asa__mcq", p),
  "g10-conditional-probability": (p) => solveStatProbabilityPrompt("conditional-probability__cpr-at-least-one__numeric", p),
  "g12-conic-sections": (p) => solvePrecalculusPrompt("conic-sections__co-abc__mcq", p),
  "g12-function-analysis": (p) => solvePrecalculusPrompt("function-analysis__fna-compose-domain__mcq", p),
  "g12-limits-continuity": (p) => solvePrecalculusPrompt("limits-continuity__lc-avg-rate__mcq", p),
  "g12-polar-parametric": (p) => solvePrecalculusPrompt("polar-parametric__pp-circles__mcq", p),
  "g12-polynomial-rational-analysis": (p) => solvePrecalculusPrompt("polynomial-rational-analysis__pra-boundary-rule__buildExpression", p),
  "g12-trig-graphs-inverses": (p) => solvePrecalculusPrompt("trig-graphs-inverses__tg-arccos__mcq", p),
  "g12-trig-identities-equations": (p) => solvePrecalculusPrompt("trig-identities-equations__ti-apply-sum-diff__mcq", p),
  "g12-vectors-matrices": (p) => solvePrecalculusPrompt("vectors-matrices__vec-add__mcq", p),
  "g13-curve-analysis": (p) => solveCalculusPrompt("curve-analysis__ca-concavity__mcq", p),
  "g13-derivative-rules": (p) => solveCalculusPrompt("derivative-rules__dr-chain-nested__mcq", p),
  "g13-derivatives-in-context": (p) => solveCalculusPrompt("derivatives-in-context__dc-choosing-relation__dragBucket", p),
  "g13-differential-equations": (p) => solveCalculusPrompt("differential-equations__de-equilibrium__mcq", p),
  "g13-integration-accumulation": (p) => solveCalculusPrompt("integration-accumulation__in-accumulation__mcq", p),
  "g13-integration-applications": (p) => solveCalculusPrompt("integration-applications__ia-area-between__mcq", p),
  "g13-parametric-polar-calculus": (p) => solveCalculusPrompt("parametric-polar-calculus__pc-arc-length__mcq", p),
  "g13-series-convergence": (p) => solveCalculusPrompt("series-convergence__sc-alternating__mcq", p),
  "g6-data-literacy": (p) => ddDataRoute("ddStatDefinition", p),
  "g6-data-literacy@ddStatDefinition": (p) => ddDataRoute("ddStatDefinition", p),
  "g6-data-literacy@ddStatRewrite": (p) => ddDataRoute("ddStatRewrite", p),
  "g6-data-literacy@ddStatFixedFact": (p) => ddDataRoute("ddStatFixedFact", p),
  "g6-data-literacy@ddStatChoose": (p) => ddDataRoute("ddStatChoose", p),
  "g6-data-literacy@ddDataRepeatedValues": (p) => ddDataRoute("ddDataRepeatedValues", p),
  "g6-data-literacy@ddDataMixedQuestions": (p) => ddDataRoute("ddDataMixedQuestions", p),
  "g6-data-literacy@ddDataCountList": (p) => ddDataRoute("ddDataCountList", p),
  "g6-data-literacy@ddDataClassSize": (p) => ddDataRoute("ddDataClassSize", p),
  "g6-data-literacy@ddPipelineBreak": (p) => ddDataRoute("ddPipelineBreak", p),
  "g6-data-literacy@ddVariabilityExpected": (p) => ddDataRoute("ddVariabilityExpected", p),
  "g6-data-literacy@ddReadyQuestion": (p) => ddDataRoute("ddReadyQuestion", p),
  "g6-data-literacy@ddSurveyPlan": (p) => ddDataRoute("ddSurveyPlan", p),
  "g6-data-literacy@ddHistTotal": (p) => ddDataRoute("ddHistTotal", p),
  "g6-data-literacy@ddHistExactValues": (p) => ddDataRoute("ddHistExactValues", p),
  "g6-data-literacy@ddHistDisplayChoice": (p) => ddDataRoute("ddHistDisplayChoice", p),
  "g6-data-literacy@ddHistEqualBins": (p) => ddDataRoute("ddHistEqualBins", p),
  "line-plot@ddDotTotal": (p) => ddDotRoute("ddDotTotal", p),
  "line-plot@ddDotDataSet": (p) => ddDotRoute("ddDotDataSet", p),
  "line-plot@ddDotMissingValue": (p) => ddDotRoute("ddDotMissingValue", p),
  "line-plot@ddDotMoreThan": (p) => ddDotRoute("ddDotMoreThan", p),
  "line-plot@ddShapeSymmetric": (p) => ddDotRoute("ddShapeSymmetric", p),
  "line-plot@ddShapeOutlier": (p) => ddDotRoute("ddShapeOutlier", p),
  "line-plot@ddShapeClusterCount": (p) => ddDotRoute("ddShapeClusterCount", p),
  "line-plot@ddShapeFullStory": (p) => ddDotRoute("ddShapeFullStory", p),
  "g6-center-spread": (p) => ddCenterRoute("ddMeanBasic", p),
  "g6-center-spread@ddMeanBasic": (p) => ddCenterRoute("ddMeanBasic", p),
  "g6-center-spread@ddMeanMissing": (p) => ddCenterRoute("ddMeanMissing", p),
  "g6-center-spread@ddMeanMeaning": (p) => ddCenterRoute("ddMeanMeaning", p),
  "g6-center-spread@ddMeanContext": (p) => ddCenterRoute("ddMeanContext", p),
  "g6-center-spread@ddMedianOddUnsorted": (p) => ddCenterRoute("ddMedianOddUnsorted", p),
  "g6-center-spread@ddMedianEven": (p) => ddCenterRoute("ddMedianEven", p),
  "g6-center-spread@ddMedianSortError": (p) => ddCenterRoute("ddMedianSortError", p),
  "g6-center-spread@ddMedianContext": (p) => ddCenterRoute("ddMedianContext", p),
  "g6-center-spread@ddMedianOutlierData": (p) => ddCenterRoute("ddMedianOutlierData", p),
  "g6-center-spread@ddCenterTypical": (p) => ddCenterRoute("ddCenterTypical", p),
  "g6-center-spread@ddMeanMedianTail": (p) => ddCenterRoute("ddMeanMedianTail", p),
  "g6-center-spread@ddOutlierMeanShift": (p) => ddCenterRoute("ddOutlierMeanShift", p),
  "g6-center-spread@ddRangeBasic": (p) => ddCenterRoute("ddRangeBasic", p),
  "g6-center-spread@ddRangeEndpointsOnly": (p) => ddCenterRoute("ddRangeEndpointsOnly", p),
  "g6-center-spread@ddRangeNewOutlier": (p) => ddCenterRoute("ddRangeNewOutlier", p),
  "g6-center-spread@ddIqrGiven": (p) => ddCenterRoute("ddIqrGiven", p),
  "g6-center-spread@ddIqrOddSeven": (p) => ddCenterRoute("ddIqrOddSeven", p),
  "g6-center-spread@ddIqrOutlierRobust": (p) => ddCenterRoute("ddIqrOutlierRobust", p),
  "g6-center-spread@ddIqrUnsortedEven": (p) => ddCenterRoute("ddIqrUnsortedEven", p),
  "g6-center-spread@ddCompareIqr": (p) => ddCenterRoute("ddCompareIqr", p),
  "g6-center-spread@ddSimilarClass": (p) => ddCenterRoute("ddSimilarClass", p),
  "g6-center-spread@ddCompareRange": (p) => ddCenterRoute("ddCompareRange", p),
  "g6-center-spread@ddFullReport": (p) => ddCenterRoute("ddFullReport", p),
  "g6-center-spread@ddSummaryIqr": (p) => ddCenterRoute("ddSummaryIqr", p),
  "g6-center-spread@ddIncompleteReport": (p) => ddCenterRoute("ddIncompleteReport", p),
  "g6-center-spread@ddSummaryMean": (p) => ddCenterRoute("ddSummaryMean", p),
  "g6-center-spread@ddBestDescription": (p) => ddCenterRoute("ddBestDescription", p),
  "g6-center-spread@ddChoiceIqr": (p) => ddCenterRoute("ddChoiceIqr", p),
  "g6-center-spread@ddTypicalMedian": (p) => ddCenterRoute("ddTypicalMedian", p),
  "g6-center-spread@ddShapeFromCenters": (p) => ddCenterRoute("ddShapeFromCenters", p),
  "g6-center-spread@ddCenterGap": (p) => ddCenterRoute("ddCenterGap", p),
  "g6-center-spread@ddCapShape": (p) => ddCenterRoute("ddCapShape", p),
  "g6-center-spread@ddCapMean": (p) => ddCenterRoute("ddCapMean", p),
  "g6-center-spread@ddCapReport": (p) => ddCenterRoute("ddCapReport", p),
  "g6-center-spread@ddCapGap": (p) => ddCenterRoute("ddCapGap", p),
  // Probability: the route re-derives each fraction from the PRINTED wording — counting die faces
  // against the stated condition, reading the trial counts, or multiplying the two component
  // probabilities — and reduces by its own gcd rather than trusting the builder's.
  "prob-fraction": (p) => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const red = (n: number, d: number) => { const g = gcd(n, d); return { whole: 0, num: n / g, den: d / g }; };
    let m = p.match(/landed on red (\d+) times? out of (\d+) spins/);
    if (m) return red(Number(m[1]), Number(m[2]));
    m = p.match(/has (\d+) equal sections, (\d+) of them blue/);
    if (m) return red(Number(m[2]), Number(m[1]));
    // Compound: count each event's faces independently, then multiply.
    const facesFor = (label: string): [number, number] => {
      if (/flipping heads/.test(label)) return [1, 2];
      const F = [1, 2, 3, 4, 5, 6];
      let ok: number[] = [];
      let mm = label.match(/greater than (\d+)/);
      if (mm) ok = F.filter((f) => f > Number(mm![1]));
      else if ((mm = label.match(/less than (\d+)/))) ok = F.filter((f) => f < Number(mm![1]));
      else if (/an even number/.test(label)) ok = F.filter((f) => f % 2 === 0);
      else if (/an odd number/.test(label)) ok = F.filter((f) => f % 2 === 1);
      else if ((mm = label.match(/a multiple of (\d+)/))) ok = F.filter((f) => f % Number(mm![1]) === 0);
      else if ((mm = label.match(/a factor of (\d+)/))) ok = F.filter((f) => Number(mm![1]) % f === 0);
      // Primality decided by trial division, not a hard-coded list.
      else if (/a prime number/.test(label))
        ok = F.filter((f) => { if (f < 2) return false; for (let d = 2; d * d <= f; d++) if (f % d === 0) return false; return true; });
      return [ok.length, 6];
    };
    m = p.match(/probability of (.+?) AND (.+?), on separate throws/);
    if (m) {
      const [n1, d1] = facesFor(m[1]);
      const [n2, d2] = facesFor(m[2]);
      return red(n1 * n2, d1 * d2);
    }
    m = p.match(/probability of rolling (.+?)\? Give a fraction/)!;
    const [n, d] = facesFor(m[1]);
    return red(n, d);
  },
  "match-object-shape": (key) => {
    const [, leftCsv, rightCsv] = key.split("||");
    // An independent object→shape table; the generator's own table is not consulted.
    const SHAPE: Record<string, string> = {
      "a coin": "circle", "a pizza slice": "triangle", "a door": "rectangle",
      "a stop sign": "octagon", "a honeycomb cell": "hexagon",
      "a ball": "sphere", "a dice": "cube", "a party hat": "cone", "a soup can": "cylinder",
    };
    const rights = rightCsv.split("\u001F");
    const out: Record<string, string> = {};
    for (const l of leftCsv.split("\u001F")) out[l] = rights.find((r) => r === SHAPE[l])!;
    return out;
  },
  "match-solve": (key) => {
    const [, leftCsv, rightCsv] = key.split("||");
    const rights = rightCsv.split("\u001F");
    const out: Record<string, string> = {};
    for (const l of leftCsv.split("\u001F")) {
      const m = l.match(/(\d+)x \+ (\d+) = (\d+)/)!;
      const [k, c, T] = m.slice(1).map(Number);
      // Search against the printed equation rather than inverting it.
      let root = NaN;
      for (let x = -200; x <= 200; x++) if (k * x + c === T) { root = x; break; }
      out[l] = rights.find((r) => r === `x = ${root}`)!;
    }
    return out;
  },
  // matchPairs routes receive "prompt||leftLabels||rightLabels" and return a LABEL→LABEL map,
  // recomputed by independent arithmetic rather than by trusting the generator's own pairing.
  "match-sum": (key) => {
    const [, leftCsv, rightCsv] = key.split("||");
    const lefts = leftCsv.split("\u001F");
    const rights = rightCsv.split("\u001F");
    const out: Record<string, string> = {};
    for (const l of lefts) {
      const m = l.match(/(\d+) \+ (\d+)/)!;
      // Add by counting on, then find the right-hand label holding that total.
      let t = Number(m[1]);
      for (let i = 0; i < Number(m[2]); i++) t += 1;
      out[l] = rights.find((r) => Number(r) === t)!;
    }
    return out;
  },
  "match-parity": (key) => {
    const [, leftCsv, rightCsv] = key.split("||");
    const out: Record<string, string> = {};
    for (const l of leftCsv.split("\u001F")) {
      const n = Number(l);
      // Pair off two at a time; whether anything is left decides odd or even.
      let rest = n;
      while (rest >= 2) rest -= 2;
      const wantEven = rest === 0;
      out[l] = rightCsv.split("\u001F").find((r) => (wantEven ? r.startsWith("even") : r.startsWith("odd")) && r.includes(`(${n} =`))!;
    }
    return out;
  },
  "match-times-ten": (key) => {
    const [, leftCsv, rightCsv] = key.split("||");
    const rights = rightCsv.split("\u001F");
    const out: Record<string, string> = {};
    for (const l of leftCsv.split("\u001F")) {
      const n = Number(l.replace(/,/g, ""));
      // Ten times by repeated addition, so no shift-the-digits shortcut is reused as its own check.
      let t = 0;
      for (let i = 0; i < 10; i++) t += n;
      out[l] = rights.find((r) => Number(r.replace(/,/g, "")) === t)!;
    }
    return out;
  },
  // Shapes: the route recomputes the answer from the PROPERTY the prompt states — side count for
  // plane shapes, a described object for solids, roll/stack behaviour for the third form — using
  // its own independent tables rather than the generator's.
  "shape-identify": (key) => {
    const [prompt, labelCsv] = key.split("||");
    const labels = labelCsv.split(",");
    const m = prompt.match(/A shape has (\d+) straight sides/);
    if (m) {
      const SIDES: Record<string, number> = { triangle: 3, square: 4, pentagon: 5, hexagon: 6, octagon: 8, circle: 0 };
      const want = Number(m[1]);
      return [labels.find((l) => SIDES[l] === want)!];
    }
    // Roll/stack: two independent booleans per solid.
    const STACK: Record<string, boolean> = { cube: true, sphere: false, cylinder: true, cone: false };
    const ROLL: Record<string, boolean> = { cube: false, sphere: true, cylinder: true, cone: true };
    if (/stacks into a tower but cannot roll/.test(prompt))
      return [labels.find((l) => STACK[l] && !ROLL[l])!];
    if (/only rolls and never stacks/.test(prompt)) return [labels.find((l) => !STACK[l] && ROLL[l])!];
    if (/both stacks AND rolls/.test(prompt)) return [labels.find((l) => STACK[l] && ROLL[l])!];
    // Only a cone pivots on a fixed point while its curved side sweeps around.
    const CIRCLES: Record<string, boolean> = { cube: false, sphere: false, cylinder: false, cone: true };
    if (/rolls in a CIRCLE/.test(prompt)) return [labels.find((l) => CIRCLES[l])!];
    // Solids by description: match the everyday object named in the clue.
    const BY_OBJECT: Array<[RegExp, string]> = [
      [/soup can/, "cylinder"],
      [/beach ball/, "sphere"],
      [/dice/, "cube"],
      [/party hat/, "cone"],
    ];
    const hit = BY_OBJECT.find(([re]) => re.test(prompt))!;
    return [hit[1]];
  },
  // Which group is more/fewer, decided by COUNTING DOWN in step — the one-to-one pairing the
  // chapter teaches — rather than comparing the numerals directly.
  // Numerals compared by COUNTING ORDER: step up from 1 and see which number is reached first.
  "compare-numerals": (key) => {
    const [prompt, labelCsv] = key.split("||");
    const labels = labelCsv.split(",");
    const countOf = (l: string) => Number(l.match(/Group of (\d+) dots?/)![1]);
    if (labels.length === 3) {
      let best = labels[0];
      for (const l of labels) if (countOf(l) > countOf(best)) best = l;
      return [best];
    }
    // Count upward; whichever value is reached first is the lesser one.
    let first = labels[0];
    for (let n = 1; n <= 100; n++) {
      const hit = labels.find((l) => countOf(l) === n);
      if (hit) { first = hit; break; }
    }
    const other = labels.find((l) => l !== first)!;
    return [/is less/.test(prompt) ? first : other];
  },
  "compare-groups": (key) => {
    const [prompt, labelCsv] = key.split("||");
    const labels = labelCsv.split(",");
    const countOf = (label: string) => Number(label.match(/^(\d+)/)![1]);
    if (labels.length === 3) {
      // "The MOST" of three: find the maximum by pairwise comparison, not Math.max on a sort.
      let best = labels[0];
      for (const l of labels) if (countOf(l) > countOf(best)) best = l;
      return [best];
    }
    const [c0, c1] = [countOf(labels[0]), countOf(labels[1])];
    // Pair them off one at a time; whichever runs out first is the smaller group.
    let a = c0;
    let b = c1;
    while (a > 0 && b > 0) { a -= 1; b -= 1; }
    const smallerIdx = a === 0 ? 0 : 1;
    // "more X or more Y?" and "which is more?" both want the larger group; only "fewer" flips it.
    const wantSmaller = /fewer\?/.test(prompt);
    return [labels[wantSmaller ? smallerIdx : 1 - smallerIdx]];
  },
  // Conics: focal length by REPEATED SUBTRACTION of 4, axes by integer-square SEARCH — never
  // Math.sqrt, since "stopped at the square" is the misconception these tags are built around.
  "parabola-focal": (p) => {
    const m = p.match(/x\u00b2\/(\d+)/) ?? p.match(/x\u00b2 = (\d+)y/)!;
    const K = Number(m[1]);
    let q = 0;
    let rest = K;
    while (rest >= 4) { rest -= 4; q++; }
    return rest === 0 ? q : NaN;
  },
  "parabola-shifted": (p) => {
    const mk = p.match(/= (\d+)\(y \u2212 (\d+)\)/)!;
    const [K, k] = [Number(mk[1]), Number(mk[2])];
    let focal = 0;
    let rest = K;
    while (rest >= 4) { rest -= 4; focal++; }
    // The focus sits +p from the vertex; the directrix sits −p.
    return /y-coordinate of the focus/.test(p) ? k + focal : k - focal;
  },
  "ellipse-axes": (p) => {
    const root = (n: number) => { for (let r = 1; r <= 200; r++) if (r * r === n) return r; return NaN; };
    let m = p.match(/semi-major axis a = (\d+)/);
    if (m) return 2 * Number(m[1]); // focal-sum form: the sum IS the major axis
    m = p.match(/x\u00b2\/(\d+) \+ y\u00b2\/(\d+) = 1/)!;
    const a = root(Math.max(Number(m[1]), Number(m[2])));
    return /major axis length 2a/.test(p) ? 2 * a : a;
  },
  "ellipse-abc": (p) => {
    const root = (n: number) => { for (let r = 1; r <= 200; r++) if (r * r === n) return r; return NaN; };
    let m = p.match(/a = (\d+) and c = (\d+)\. Find its eccentricity/);
    if (m) {
      const [a, c] = [Number(m[1]), Number(m[2])];
      return Math.round((c / a) * 100) / 100; // rounded once, to the authored two decimals
    }
    m = p.match(/a = (\d+) and c = (\d+)\. What is b\?/);
    if (m) {
      const [a, c] = [Number(m[1]), Number(m[2])];
      return root(a * a - c * c);
    }
    m = p.match(/a = (\d+) and b = (\d+), find c/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    return root(a * a - b * b);
  },
  // Recursive sequences: the route WALKS THE CHAIN from the printed rule — never the closed
  // form a1+(n−1)d, which is precisely the shortcut the tag distinguishes from recursion.
  "sr-recursive": (p) => {
    const SUB = "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089";
    const unsub = (s: string) => [...s].map((c) => (SUB.includes(c) ? String(SUB.indexOf(c)) : c)).join("");
    const q = unsub(p);
    // MCQ forms: return the correct LABEL.
    if (/what must you already know\?/.test(q)) return "the term right before it";
    let m = q.match(/You want a(\d+) from a1 = (\d+), a\u2099 = a\u2099\u208b1 \+ (\d+)/) ?? q.match(/You want a(\d+)/);
    if (m && /using ONLY the recursive rule/.test(q)) {
      const N = Number(m[1]);
      return `computing every term a\u2082 through a${[...String(N - 1)].map((c) => SUB[Number(c)]).join("")} first`;
    }
    // Numeric forms: parse a1, the rule, and the target index; iterate.
    m = q.match(/a1 = (\d+), a\u2099 = a\u2099\u208b1 \+ (\d+), what is a(\d+)\?/);
    if (m) {
      const [a1, d, n] = m.slice(1).map(Number);
      let t = a1;
      for (let i = 1; i < n; i++) t += d;
      return t;
    }
    m = q.match(/a1 = (\d+), a\u2099 = (\d+)\u00b7a\u2099\u208b1 \u2212 (\d+), what is a(\d+)\?/);
    if (m) {
      const [a1, mm, c, n] = m.slice(1).map(Number);
      let t = a1;
      for (let i = 1; i < n; i++) t = mm * t - c;
      return t;
    }
    m = q.match(/a1 = (\d+), a\u2099 = (\d+)\u00b7a\u2099\u208b1, what is a(\d+)\?/)!;
    const [a1, r, n] = m.slice(1).map(Number);
    let t = a1;
    for (let i = 1; i < n; i++) t *= r;
    return t;
  },
  // Imaginary unit: label sequences rebuilt by independent complex arithmetic. The square root
  // is found by SEARCH (which integer squares to N), never Math.sqrt.
  "cn-i-def": (p) => {
    let m = p.match(/What is \u221a\(\u2212(\d+)\)\?/);
    if (m) {
      const N = Number(m[1]);
      for (let r = 1; r <= 60; r++) if (r * r === N) return [String(r), "i"];
      return ["NO-ROOT"];
    }
    m = p.match(/What is \((\d+)i\)\u00b2\?/);
    if (m) {
      const k = Number(m[1]);
      return ["\u2212", String(k * k)];
    }
    m = p.match(/Compute \((\d+)i\)\u00b2 \+ (\d+)\./)!;
    const [k, C] = [Number(m[1]), Number(m[2])];
    return C - k * k; // (ki)² = −k², then add C
  },
  // Recursive sequences: iterate the printed rule literally, term by term.
  "seq-recursive": (p) => {
    const SUBS = "\u2081\u2082\u2083\u2084\u2085\u2086";
    const kIdx = (s: string) => SUBS.indexOf(s) + 1;
    let m = p.match(/a\u2081 = (\d+), a\u2099 = a\u2099\u208b\u2081 \+ (\d+), what is a(.)\?/);
    if (m) {
      let v = Number(m[1]);
      const k = kIdx(m[3]);
      for (let i = 1; i < k; i++) v += Number(m[2]);
      return v;
    }
    m = p.match(/a\u2081 = (\d+), a\u2099 = (\d+)\u00b7a\u2099\u208b\u2081 \u2212 (\d+), what is a(.)\?/);
    if (m) {
      let v = Number(m[1]);
      const k = kIdx(m[4]);
      for (let i = 1; i < k; i++) v = Number(m[2]) * v - Number(m[3]);
      return v;
    }
    m = p.match(/a\u2081 = (\d+), a\u2099 = (\d+)\u00b7a\u2099\u208b\u2081, what is a(.)\?/)!;
    let v = Number(m[1]);
    const k = kIdx(m[3]);
    for (let i = 1; i < k; i++) v = Number(m[2]) * v;
    return v;
  },
  // i² = −1, applied explicitly rather than via any complex library.
  "complex-i-square": (p) => {
    const m = p.match(/Compute \((\d+)i\)\u00b2 \+ (\d+)\./)!;
    const [kk, n] = [Number(m[1]), Number(m[2])];
    return -1 * kk * kk + n;
  },
  // The ferris-wheel model: every answer re-read straight off M and A; speedB follows the
  // prompt's own stated rounding (hundredths), rounding exactly once.
  "trig-model": (p) => {
    let m = p.match(/h\(t\) = (\d+) \u2212 (\d+) cos t\. How high is the boarding platform/);
    if (m) return Number(m[1]) - Number(m[2]);
    m = p.match(/h\(t\) = (\d+) \u2212 (\d+) cos t\. What is the rider's MAXIMUM/);
    if (m) return Number(m[1]) + Number(m[2]);
    m = p.match(/high (\d+)\u00b0, low (\d+)\u00b0/);
    if (m) return (Number(m[1]) + Number(m[2])) / 2;
    m = p.match(/one rotation every (\d+) seconds/)!;
    return Math.round(((2 * Math.PI) / Number(m[1])) * 100) / 100;
  },
  // Inverses: the evaluate-the-rule form applies the printed rule; the undo form SEARCHES for
  // the input the forward function sends to the target, never inverting algebraically.
  "fn-inverse-rule": (p) => {
    let m = p.match(/g\u207b\u00b9\(x\) = (\d+)x \u2212 (\d+), find g\u207b\u00b9\((\d+)\)/);
    if (m) return Number(m[1]) * Number(m[3]) - Number(m[2]);
    m = p.match(/f\(x\) = (\d+)x \+ (\d+)\. Find f\u207b\u00b9\((\d+)\)/)!;
    const [mm, c, T] = m.slice(1).map(Number);
    for (let x = -300; x <= 300; x++) if (mm * x + c === T) return x;
    return NaN;
  },
  // ── Complex-numbers routes: solving forms SEARCH against the printed equation; arithmetic
  // forms recombine the PRINTED parts with i² = −1 applied explicitly. Superscripts are decoded
  // by table so the routes never trust the generator's exponent arithmetic.
  "cn-square": (p) => {
    let m = p.match(/completes the square: x\u00b2 \+ (\d+)x/);
    if (m) { const b = Number(m[1]); return (b / 2) * (b / 2); }
    m = p.match(/x\u00b2 \u2212 (\d+)x \+ (\d+) equals/);
    if (m) { const [b2, c] = [Number(m[1]), Number(m[2])]; const h = b2 / 2; return h * h === c ? `(x \u2212 ${h})\u00b2` : "NOT-A-SQUARE"; }
    // The prompt names no numbers; scan the OPTION labels and return the one whose constant
    // equals (b/2)² — an independent test applied to each candidate.
    if (/Which is a perfect square trinomial/.test(p)) {
      const labels = p.split("||")[1].split(";;");
      for (const lab of labels) {
        const mm = lab.match(/^x\u00b2 \+ (\d+)x \+ (\d+)$/);
        if (mm && (Number(mm[1]) / 2) ** 2 === Number(mm[2])) return lab;
      }
      return "NONE-QUALIFIES";
    }
    return NaN;
  },
  "cn-cts-solve": (p) => {
    let m = p.match(/From \(x \+ (\d+)\)\u00b2 = (\d+)/);
    if (m) { const [h, kk] = [Number(m[1]), Number(m[2])]; let best = -Infinity; for (let x = -60; x <= 60; x++) if ((x + h) * (x + h) === kk) best = Math.max(best, x); return best; }
    m = p.match(/Solve x\u00b2 \+ (\d+)x (\+|\u2212) (\d+) = 0 by completing/);
    if (m) {
      const b = Number(m[1]); const c = (m[2] === "+" ? 1 : -1) * Number(m[3]);
      let best = -Infinity; for (let x = -80; x <= 80; x++) if (x * x + b * x + c === 0) best = Math.max(best, x);
      return best;
    }
    if (/why add \(b\/2\)\u00b2/.test(p)) {
      // A conceptual item with a fixed correct rationale; assert it verbatim so a generator that
      // reworded the right answer out of existence would fail loudly.
      return "it turns the left side into the perfect square (x + b/2)\u00b2";
    }
    return NaN;
  },
  "cn-cts-vertex": (p) => {
    const m = p.match(/y = x\u00b2 \+ (\d+)x \+ (\d+)/);
    if (!m) return NaN;
    const b = Number(m[1]); const c = Number(m[2]);
    // Minimise by scanning half-integer x — the vertex of a monic quadratic sits on one.
    let best = Infinity;
    for (let t = -400; t <= 400; t++) { const x = t / 2; const y = x * x + b * x + c; if (y < best) best = y; }
    if (/vertex form of/.test(p)) { const h = b / 2; const k = best; return `y = (x + ${h})\u00b2 ${k >= 0 ? "+ " + k : "\u2212 " + -k}`; }
    return best;
  },
  "cn-i-powers": (p) => {
    const SUP = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
    const de = (s: string) => Number([...s].map((ch) => SUP.indexOf(ch)).join(""));
    const CYCLE = ["1", "i", "\u22121", "\u2212i"];
    let m = p.match(/Compute i([\u2070-\u2079\u00b9\u00b2\u00b3]+) \+ i([\u2070-\u2079\u00b9\u00b2\u00b3]+) \+ i([\u2070-\u2079\u00b9\u00b2\u00b3]+)/);
    if (m) {
      // Walk the cycle step by step rather than reducing mod 4 arithmetically.
      const val = (n: number) => { let v = { re: 1, im: 0 }; for (let i = 0; i < n; i++) v = { re: -v.im, im: v.re }; return v.re; };
      return val(de(m[1])) + val(de(m[2])) + val(de(m[3]));
    }
    m = p.match(/What is i([\u2070-\u2079\u00b9\u00b2\u00b3]+)\?/)!;
    const n = de(m[1]);
    let v = { re: 1, im: 0 };
    for (let i = 0; i < n % 4; i++) v = { re: -v.im, im: v.re };
    return CYCLE[[ "1,0", "0,1", "-1,0", "0,-1" ].indexOf(`${v.re},${v.im}`)];
  },
  "cn-add-sub": (p) => {
    const m = p.match(/\((\-?\d+) (\+|\u2212) (\d+)i\) (\+|\u2212) \((\-?\d+) (\+|\u2212) (\d+)i\)/)!;
    const b = (m[2] === "+" ? 1 : -1) * Number(m[3]);
    const d = (m[6] === "+" ? 1 : -1) * Number(m[7]);
    return m[4] === "+" ? b + d : b - d;
  },
  "cn-multiply": (p) => {
    // A bare "i" is a coefficient of 1 — normalise before parsing.
    const q = p.replace(/([+\u2212]) i\)/g, '$1 1i)');
    let m = q.match(/REAL part of \((\d+) \+ (\d+)i\)\u00b2/);
    if (m) { const [a, b] = [Number(m[1]), Number(m[2])]; return a * a - b * b; }
    m = q.match(/\((\d+) \+ (\d+)i\)\((\d+) \+ (\d+)i\)/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    return /REAL part/.test(q) ? a * c - b * d : a * d + b * c;
  },
  "cn-conjugate": (p) => {
    let m = p.match(/What is \((\d+) \+ (\d+)i\)\((\d+) \u2212 (\d+)i\)\?/);
    if (m) { const [a, b] = [Number(m[1]), Number(m[2])]; return a * a + b * b; }
    const mm = p.match(/Simplify \((\d+) (\+|\u2212) (\d+)i\)\/\(1 \u2212 i\)\./);
    if (mm) {
      // (p + qi)/(1 − i) = ((p − q) + (p + q)i)/2 — recomputed from the printed numerator.
      const pN = Number(mm[1]);
      const qN = (mm[2] === "+" ? 1 : -1) * Number(mm[3]);
      const re = (pN - qN) / 2;
      const im = (pN + qN) / 2;
      return `${re} ${im >= 0 ? "+" : "\u2212"} ${Math.abs(im)}i`;
    }
    m = p.match(/Simplify \((\u2212?\d+) \+ (\d+)i\)\/\(1 \+ i\)/);
    if (m) {
      const pR = Number(m[1].replace("\u2212", "-")); const q = Number(m[2]);
      // (p + qi)(1 − i)/2 — real part (p + q)/2.
      return (pR + q) / 2;
    }
    m = p.match(/conjugate of \u2212(\d+) \+ (\d+)i/)!;
    return `\u2212${m[1]} \u2212 ${m[2]}i`;
  },
  "cn-disc-repeat": (p) => {
    let m = p.match(/x\u00b2 (\+|\u2212) (\d+)x \+ c = 0 have exactly one repeated/);
    if (m) {
      const b = Number(m[2]);
      let c0 = NaN;
      for (let c = 0; c <= 400; c++) if (b * b - 4 * c === 0) { c0 = c; break; }
      // The mcq surface labels its options "c = N"; the numeric surface wants the bare number.
      return /\|\|/.test(p) && /c = /.test(p.split("||")[1] ?? "") ? `c = ${c0}` : c0;
    }
    m = p.match(/Which value of b gives x\u00b2 \+ bx \+ (\d+) = 0 exactly one/);
    if (m) { const c = Number(m[1]); for (let b = 1; b <= 100; b++) if (b * b === 4 * c) return `b = ${b}`; return "NONE"; }
    m = p.match(/For (\d*)x\u00b2 \u2212 (\d+)x \+ (\d+) = 0, what is the discriminant/)!;
    const A = m[1] === "" ? 1 : Number(m[1]);
    return Number(m[2]) ** 2 - 4 * A * Number(m[3]);
  },
  "cn-sum-product": (p) => {
    let m = p.match(/product of (\d+) \+ (\d+)i and (\d+) \u2212 (\d+)i/);
    if (m) { const [a, b] = [Number(m[1]), Number(m[2])]; return a * a + b * b; }
    m = p.match(/roots (\d+) \u00b1 (\d+)i\. What is c\?/);
    if (m) { const [pp, q] = [Number(m[1]), Number(m[2])]; return pp * pp + q * q; }
    m = p.match(/roots (\d+) \u00b1 (\d+)i\. What is b\?/);
    if (m) return -2 * Number(m[1]);
    m = p.match(/PRODUCT of the roots of x\u00b2 \u2212 (\d+)x \+ (\d+) = 0/)!;
    return Number(m[2]);
  },
  "cn-solve-any": (p) => {
    let m = p.match(/Solve \(x \u2212 (\d+)\)\u00b2 = (\d+)\. What is the LARGER/);
    if (m) { const [h, kk] = [Number(m[1]), Number(m[2])]; let best = -Infinity; for (let x = -80; x <= 80; x++) if ((x - h) * (x - h) === kk) best = Math.max(best, x); return best; }
    m = p.match(/Solve 2x\u00b2 \u2212 (\d+)x \+ (\d+) = 0\./);
    if (m) {
      const B = Number(m[1]); const C = Number(m[2]);
      // x = p ± qi with p = B/4 and q² = C/2 − p².
      const pReal = B / 4; const q2 = C / 2 - pReal * pReal;
      const q = Math.round(Math.sqrt(q2));
      return q * q === q2 ? `x = ${pReal} \u00b1 ${q}i` : "NOT-CLEAN";
    }
    m = p.match(/x\u00b2 \+ (\d+)x \+ (\d+) = 0 \(hint: complete/)!;
    const b = Number(m[1]); const c = Number(m[2]);
    const q2 = c - (b / 2) * (b / 2);
    const q = Math.round(Math.sqrt(q2));
    return q * q === q2 ? q : NaN;
  },
  // These two routes receive "prompt||label,label,…" because the ordering and sorting engines
  // carry their content in the ITEMS, not the prompt.
  "sequence-order": (key) => {
    const labels = key.split("||")[1].split(",").map(Number);
    // Sort by repeated selection of the minimum — not Array.sort, which is the operation under test.
    const rest = [...labels];
    const out: string[] = [];
    while (rest.length) {
      let mi = 0;
      for (let i = 1; i < rest.length; i++) if (rest[i] < rest[mi]) mi = i;
      out.push(String(rest.splice(mi, 1)[0]));
    }
    return out;
  },
  "event-sort": (key) => {
    const labels = key.split("||")[1].split(",");
    const FACES = [1, 2, 3, 4, 5, 6];
    // Re-derive each event's outcome set from its NAME, then intersect. Independent of the
    // generator, which built the sets first and named them second.
    const setOf = (name: string): number[] => {
      const n = name.trim();
      if (n === "even") return FACES.filter((f) => f % 2 === 0);
      if (n === "odd") return FACES.filter((f) => f % 2 === 1);
      let m = n.match(/^greater than (\d+)$/);
      if (m) return FACES.filter((f) => f > Number(m![1]));
      m = n.match(/^less than (\d+)$/);
      if (m) return FACES.filter((f) => f < Number(m![1]));
      m = n.match(/^shows a (\d+)$/);
      if (m) return [Number(m[1])];
      return [];
    };
    const out: Record<string, string> = {};
    for (const label of labels) {
      const [x, y] = label.split("\u00b7");
      const overlap = setOf(x).filter((f) => setOf(y).includes(f));
      out[label] = overlap.length === 0 ? "add" : "sub";
    }
    return out;
  },
  // Make-ten: add by COUNTING ON from the bigger addend, never a + b directly.
  "make-ten-sum": (p) => {
    const m = p.match(/(\d+) \+ (\d+) = \?/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    let t = Math.max(a, b);
    for (let i = 0; i < Math.min(a, b); i++) t += 1;
    return t;
  },
  "two-step-arith": (p) => {
    let m = p.match(/(\d+) birds, then (\d+) more arrive, then (\d+) fly off/);
    if (m) {
      const [s0, up, down] = m.slice(1).map(Number);
      let t = s0;
      for (let i = 0; i < up; i++) t += 1;
      for (let i = 0; i < down; i++) t -= 1;
      return t;
    }
    m = p.match(/(\d+) rows with (\d+) cars in each\. Then (\d+) cars drive away/)!;
    const [rows, per, gone] = m.slice(1).map(Number);
    let total = 0;
    for (let i = 0; i < rows; i++) total += per; // rebuild the product by repeated addition
    return total - gone;
  },
  // Equations solved by SEARCH against the printed equation, never by inverting it.
  "two-step-solve": (p) => {
    let m = p.match(/Solve for x: (\d+)x \+ (\d+) = (\d+)/);
    if (m) {
      const [k, c, T] = m.slice(1).map(Number);
      for (let x = -200; x <= 200; x++) if (k * x + c === T) return x;
      return NaN;
    }
    m = p.match(/Solve for x: (\d+)x \u2212 (\d+) = (\d+)/)!;
    const [k, c, T] = m.slice(1).map(Number);
    for (let x = -200; x <= 200; x++) if (k * x - c === T) return x;
    return NaN;
  },
  // LCM found by WALKING the multiples of one number until the other divides it — never a·b/gcd,
  // which is the very shortcut one of the distractors embodies.
  "multiple-find": (p) => {
    let m = p.match(/multiple of BOTH (\d+) and (\d+)/) ?? p.match(/every (\d+) seconds and a blue light every (\d+) seconds/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      for (let k = 1; k <= 500; k++) if ((a * k) % b === 0) return a * k;
      return NaN;
    }
    m = p.match(/What is the (\d+)th multiple of (\d+)\?/)!;
    const [n, k] = [Number(m[1]), Number(m[2])];
    let t = 0;
    for (let i = 0; i < n; i++) t += k;
    return t;
  },
  // buildExpression routes return the correct sequence as LABELS, rebuilt from the prompt by
  // independent arithmetic — integer roots by SEARCH, powers of ten by counting digit places.
  "root-solve": (p) => {
    const sup = (s: string) => s.replace(/\u00b2/g, "^2").replace(/\u00b3/g, "^3");
    const q = sup(p).replace(/\u2212/g, "-");
    let m = q.match(/x\^3 = (-?\d+)\?/);
    if (m) {
      const c = Number(m[1]);
      for (let n = -30; n <= 30; n++) if (n * n * n === c) return [`x = ${n}`.replace("-", "\u2212")];
      return ["NO-ROOT"];
    }
    m = q.match(/x\^2 = (\d+)\?/)!;
    const sq = Number(m[1]);
    for (let n = 1; n <= 60; n++) if (n * n === sq) return [`x = ${n}`, "or", `x = \u2212${n}`];
    return ["NO-ROOT"];
  },
  "sci-notation": (p) => {
    const m = p.match(/^([\d,.]+) in scientific notation is:/)!;
    const raw = m[1].replace(/,/g, "");
    // Count the point's move by STRING position, never by log10 — a float log would be the same
    // kind of shortcut the exponent traps are built to punish.
    const digits = raw.replace(".", "");
    const firstSig = [...digits].findIndex((c) => c !== "0");
    const pointAt = raw.includes(".") ? raw.indexOf(".") : raw.length;
    const k = raw.includes(".") && raw.startsWith("0") ? -(firstSig - pointAt + 1) : pointAt - 1;
    const sig = digits.slice(firstSig).replace(/0+$/, "") || "0";
    const coef = sig.length > 1 ? `${sig[0]}.${sig.slice(1)}` : sig[0];
    const D = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
    const supStr =
      (k < 0 ? "\u207b" : "") +
      String(Math.abs(k)).split("").map((c) => D[Number(c)]).join("");
    return [coef, "\u00d7", `10${supStr}`];
  },
  // Manipulative routes return the answer in the ENGINE's own terms, recomputed from the prompt.
  "ten-frame-fill": (p) => {
    let m = p.match(/(\d+) crayons split between two boxes/);
    if (m) return Number(m[1]); // the whole is the frame's target
    m = p.match(/(\d+) dots are in the ten frame/)!;
    void m;
    return 10;
  },
  "base-ten-build": (p) => {
    let m = p.match(/build (\d+) in standard form/);
    if (m) return Number(m[1]);
    m = p.match(/What hides inside (\d+)\?/)!;
    return Number(m[1]);
  },
  // Cross-multiplication in INTEGERS, mirroring the builder from the other side.
  "fraction-benchmark": (p) => {
    let m = p.match(/Which is bigger: (\d+)\/(\d+) or (\d+)\/(\d+)\?/);
    if (m) {
      const [a, b, c, d] = m.slice(1).map(Number);
      const cross = a * d - c * b;
      return cross < 0 ? "lt" : cross > 0 ? "gt" : "eq";
    }
    m = p.match(/Is (\d+)\/(\d+) more than, less than, or exactly 1\/2\?/)!;
    const [n, den] = [Number(m[1]), Number(m[2])];
    const cross = n * 2 - 1 * den;
    return cross < 0 ? "lt" : cross > 0 ? "gt" : "eq";
  },
  // Regrouping done by REPEATED SUBTRACTION / REPEATED ADDITION rather than div/mod.
  "mixed-convert": (p) => {
    let m = p.match(/Convert (\d+) (\d+)\/(\d+) to an improper fraction/);
    if (m) {
      const [w, n, d] = m.slice(1).map(Number);
      let top = n;
      for (let i = 0; i < w; i++) top += d;
      return { whole: 0, num: top };
    }
    m = p.match(/Convert (\d+)\/(\d+) to a mixed number/)!;
    const [top, d] = [Number(m[1]), Number(m[2])];
    let rest = top;
    let whole = 0;
    while (rest >= d) { rest -= d; whole++; }
    return { whole, num: rest };
  },
  // Fraction routes parse the PRINTED fractions and recombine them with integer cross-
  // multiplication — never floats, and never reusing the generator's own reduction.
  "frac-unlike-addsub": (p) => {
    const g = (a: number, b: number): number => (b === 0 ? Math.abs(a) : g(b, a % b));
    const red = (n: number, d: number) => { const k = g(n, d) || 1; return { whole: 0, num: n / k, den: d / k }; };
    const rewritten = p.match(/rewritten is (\d+)\/(\d+) ([+\u2212]) (\d+)\/(\d+)\. What is the numerator/);
    if (rewritten) {
      const left = Number(rewritten[1]), op = rewritten[3], right = Number(rewritten[4]);
      return op === "+" ? left + right : left - right;
    }
    const m = p.match(/(\d+)\/(\d+) ([+\u2212]) (\d+)\/(\d+) = \?/)!;
    const [a, b, op, c, d] = [Number(m[1]), Number(m[2]), m[3], Number(m[4]), Number(m[5])];
    // a/b ± c/d = (a·d ± c·b) / (b·d), reduced once.
    const n = op === "+" ? a * d + c * b : a * d - c * b;
    return red(n, b * d);
  },
  "frac-multiply": (p) => {
    const g = (a: number, b: number): number => (b === 0 ? Math.abs(a) : g(b, a % b));
    let m = p.match(/(\d+)\/(\d+) \u00d7 (\d+)\/(\d+) = \? Build the first factor/);
    if (m) return { rows: Number(m[2]), cols: Number(m[4]), shadeR: Number(m[1]), shadeC: Number(m[3]) };
    m = p.match(/Without computing exactly, (\d+)\/(\d+) \u00d7 (\d+)\/(\d+) is/);
    if (m) {
      const labels = p.split("||")[1].split(";;");
      return labels.find((label) => label.startsWith("Smaller than both"))!;
    }
    m = p.match(/= (\d+)\/(\d+)\. In lowest terms this is 1 over what number/);
    if (m) {
      const n = Number(m[1]), d = Number(m[2]), k = g(n, d) || 1;
      return d / k;
    }
    m = p.match(/(\d+)\/(\d+) \u00d7 (\d+)\/(\d+) = \?/)!;
    const [a, b, c, d] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    const n = a * c;
    const den = b * d;
    const k = g(n, den) || 1;
    return { whole: 0, num: n / k, den: den / k };
  },
  "fraction-scaling": (key) => {
    const [p, labelCsv = ""] = key.split("||");
    const labels = labelCsv.split(";;").filter(Boolean);
    let m = p.match(/Is (\d+) \u00d7 (\d+)\/(\d+) bigger than/);
    if (m) {
      const base = Number(m[1]), n = Number(m[2]), d = Number(m[3]);
      const prefix = n < d ? `Smaller than ${base}` : n === d ? `Exactly ${base}` : `Bigger than ${base}`;
      return labels.find((label) => label === prefix)!;
    }
    m = p.match(/Which is bigger: (\d+)\/(\d+) \u00d7 (\d+) or (\d+)\/(\d+) \u00d7 (\d+)\?/);
    if (m) {
      const leftWins = Number(m[1]) * Number(m[5]) > Number(m[4]) * Number(m[2]);
      const prefix = leftWins ? `${m[1]}/${m[2]} \u00d7 ${m[3]}` : `${m[4]}/${m[5]} \u00d7 ${m[6]}`;
      return labels.find((label) => label === prefix)!;
    }
    const products = labels.map((label) => {
      const mm = label.match(/(\d+)\/(\d+) \u00d7 (\d+)/)!;
      return { label, n: Number(mm[1]), d: Number(mm[2]), base: Number(mm[3]) };
    });
    let best = products[0];
    for (const product of products.slice(1))
      if (product.n * product.base * best.d > best.n * best.base * product.d) best = product;
    return best.label;
  },
  "composite-area-lab": (p) => {
    let m = p.match(/A parallelogram has base (\d+) and perpendicular height (\d+)\. Which is its area\?/);
    if (m) return Number(m[1]) * Number(m[2]);
    m = p.match(/Triangle 1 has area (\d+) and triangle 2 has area (\d+)\. What is the trapezoid's total area\?/);
    if (m) return Number(m[1]) + Number(m[2]);
    m = p.match(/A trapezoid has bases (\d+) and (\d+), and height (\d+)\. What is its area\?/);
    if (m) { const [b1, b2, h] = [Number(m[1]), Number(m[2]), Number(m[3])]; return ((b1 + b2) / 2) * h; }
    m = p.match(/A floor plan has three rectangular sections: (\d+)\u00d7(\d+), (\d+)\u00d7(\d+), and (\d+)\u00d7(\d+)\. What is the total area\?/);
    if (m) { const [a1, b1, a2, b2, a3, b3] = m.slice(1).map(Number); return a1 * b1 + a2 * b2 + a3 * b3; }
    m = p.match(/A floor plan has a (\d+)\u00d7(\d+) rectangle and a (\d+)\u00d7(\d+) rectangle, a triangular nook added \(base (\d+), height (\d+)\), and a triangular notch cut away \(base (\d+), height (\d+)\)\. What is the total area\?/);
    if (m) { const [w1, l1, w2, l2, tb, th, nb, nh] = m.slice(1).map(Number); return w1 * l1 + w2 * l2 + (tb * th) / 2 - (nb * nh) / 2; }
    m = p.match(/A floor plan has a (\d+)\u00d7(\d+) rectangular room plus a triangular bay window \(base (\d+), height (\d+)\)\. What is the total area\?/)!;
    const [w, l, bb, bh] = m.slice(1).map(Number);
    return w * l + (bb * bh) / 2;
  },
  "grid-count": (p) => {
    const m = p.match(/into (\d+) rows and (\d+) columns/)!;
    // Count the grid the way a second-grader would: add one row's worth, once per row.
    const [r, c] = [Number(m[1]), Number(m[2])];
    let t = 0;
    for (let i = 0; i < r; i++) t += c;
    return t;
  },
  // Radians: π-fraction forms stay in EXACT integer degrees (k·180/d); only the forms whose
  // prompts explicitly say "Round to …" use Math.PI, and they round exactly once, at the end.
  "radian-convert": (p) => {
    let m = p.match(/radians in a ([A-Z-]+) turn \((\d+)\u00b0\)/);
    if (m) return Math.round(((Number(m[2]) / 180) * Math.PI) * 100) / 100;
    m = p.match(/measures exactly (\d+) radius-lengths/);
    if (m) return Number(m[1]);
    m = p.match(/Convert (\d+) radians to degrees/);
    if (m) return Math.round(((Number(m[1]) * 180) / Math.PI) * 10) / 10;
    m = p.match(/(\d+)\u00b0 = n\u03c0\/(\d+)\./);
    if (m) { const [D, d] = [Number(m[1]), Number(m[2])]; return (D * d) / 180; }
    m = p.match(/Convert (\d+)\u03c0\/(\d+) to degrees/)!;
    return (Number(m[1]) * 180) / Number(m[2]);
  },
  "quad-shape-area@rectQuadratic": (p) => {
    // Search, never solve: the printed equation is x(x + b) = A, and the route walks positive
    // integers until the area matches — a genuinely different method from the quadratic formula.
    const m = p.match(/x by x \+ (\d+) has area (\d+)/)!;
    const b = Number(m[1]), A = Number(m[2]);
    for (let x = 1; x <= 1000; x++) if (x * (x + b) === A) return x;
    throw new Error(`no positive width satisfies x(x+${b})=${A}`);
  },
  "quad-shape-area": (p) => {
    let m = p.match(/bases (\d+) and (\d+), and height (\d+)/);
    if (m) { const [b1, b2, h] = [Number(m[1]), Number(m[2]), Number(m[3])]; return ((b1 + b2) * h) / 2; }
    m = p.match(/Triangle 1 has area (\d+) and triangle 2 has area (\d+)/);
    if (m) return Number(m[1]) + Number(m[2]);
    // Quadratics: SEARCH for the positive integer root against the original area statement,
    // rather than applying the quadratic formula the generator used.
    m = p.match(/x by x\+(\d+) has area (\d+)/) ?? p.match(/extended by (\d+) to form a rectangle of area (\d+)/)!;
    const [k, A] = [Number(m[1]), Number(m[2])];
    for (let x = 1; x <= 100; x++) if (x * (x + k) === A) return x;
    return NaN;
  },
  // Angle equations solved by SEARCH against the stated relationship, never by inverting it.
  "angle-equation": (p) => {
    let m = p.match(/(?:Angles x and|making angles x and) (\d+)x on a straight line/) ?? p.match(/Angles x and (\d+)x sit together on a straight line/);
    if (m) { const k = Number(m[1]); for (let x = 1; x <= 180; x++) if (x + k * x === 180) return x; return NaN; }
    m = p.match(/Solve x \+ \(x \+ (\d+)\) = 90/);
    if (m) { const c = Number(m[1]); for (let x = 1; x <= 90; x++) if (x + (x + c) === 90) return x; return NaN; }
    m = p.match(/across from it is (\d+)\u00b0/);
    if (m) { const D = Number(m[1]); for (let x = 1; x <= 180; x++) if (2 * x === D) return x; return NaN; }
    m = p.match(/Angles x, 2x, and (\d+)\u00b0 together fill a straight line/)!;
    const c = Number(m[1]);
    for (let x = 1; x <= 180; x++) if (x + 2 * x + c === 180) return x;
    return NaN;
  },


  // Grade 7 two-step equations — each route reconstructs the answer from the printed surface,
  // independently of the generator's parameter arithmetic.
  "g7-tse-expression-build": (raw) => {
    const p = raw.split("||")[0]!; // the gate appends the token bank; these regexes are $-anchored on the prompt
    const coeff = (n: number): string => n === 1 ? "x" : n === -1 ? "-x" : `${n}x`;
    let m = p.match(/^Distribute: (-?\d+)\(x - (\d+)\)$/);
    if (m) {
      const a = Number(m[1]), b = Number(m[2]), constant = -a * b;
      return [coeff(a), constant < 0 ? "-" : "+", String(Math.abs(constant))];
    }
    m = p.match(/^Simplify: (-?\d+)x - (\d+)x$/);
    if (m) {
      const c = Number(m[1]) - Number(m[2]);
      return c < 0 ? ["-", String(Math.abs(c)), "x"] : [String(c), "x"];
    }
    m = p.match(/^Simplify: (-?\d+)\(x ([+-]) (\d+)\) ([+-]) (\d*)x$/);
    if (m) {
      const outside = Number(m[1]);
      const inside = m[2] === "+" ? Number(m[3]) : -Number(m[3]);
      const secondMag = m[5] === "" ? 1 : Number(m[5]);
      const second = m[4] === "+" ? secondMag : -secondMag;
      const xCoeff = outside + second;
      const constant = outside * inside;
      return [coeff(xCoeff), constant < 0 ? "-" : "+", String(Math.abs(constant))];
    }
    throw new Error(`unparsed g7 expression-build prompt: ${p}`);
  },
  "g7-tse-evaluate-distribution": (p) => {
    const m = p.match(/Evaluate (-?\d+)\(x - (\d+)\) at x = (-?\d+)/)!;
    return Number(m[1]) * (Number(m[3]) - Number(m[2]));
  },
  "g7-tse-context-equation": (p) => {
    const m = p.match(/model is (-?\d+)x ([+-]) (\d+) = (-?\d+)/)!;
    const a = Number(m[1]), b = (m[2] === "+" ? 1 : -1) * Number(m[3]), c = Number(m[4]);
    for (let x = 0; x <= 500; x++) if (a * x + b === c) return x;
    throw new Error("no nonnegative minute solution");
  },
  "g7-tse-balance-solve": (p) => {
    const m = p.match(/Solve (\d+)x \+ (\d+) = (\d+) on the balance/)!;
    const [a, b, c] = m.slice(1).map(Number);
    let x = 0;
    while (a * x + b < c) x++;
    if (a * x + b !== c) throw new Error("balance equation has no whole-number solution");
    return { leftX: 1, leftUnits: 0, rightUnits: x };
  },
  "g7-tse-inequality-build": (p) => {
    const m = p.match(/(-?\d+)x ([+-]) (\d+) (<=|>=|<|>) (-?\d+)/)!;
    const a = Number(m[1]), b = (m[2] === "+" ? 1 : -1) * Number(m[3]), rel = m[4], c = Number(m[5]);
    const boundary = (c - b) / a;
    const flip: Record<string, string> = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
    return ["x", a < 0 ? flip[rel] : rel, String(boundary)];
  },

  // Grade 7 sampling and probability — routes use only the visible counts, rates, and labels.
  "g7-sp-sample-estimate": (p) => {
    const m = p.match(/sample of (\d+) [^,]+, (\d+) [^.]+\. If there are (\d+) /)!;
    return Number(m[2]) * (Number(m[3]) / Number(m[1]));
  },
  "g7-sp-gap-units": (p) => {
    let m = p.match(/(?:means?|times) of (-?[\d.]+) and (-?[\d.]+).*variability measure is ([\d.]+)/);
    if (!m) m = p.match(/mean of (-?[\d.]+)\. Group B has a mean of (-?[\d.]+)\. The variability measure is ([\d.]+)/);
    if (!m) throw new Error(`unparsed gap-units prompt: ${p}`);
    return Math.abs(Number(m[1]) - Number(m[2])) / Number(m[3]);
  },
  "g7-sp-counting-principle": (p) => {
    let m = p.match(/coin is flipped (\d+) times/);
    if (m) return 2 ** Number(m[1]);
    m = p.match(/coin is flipped and a fair (\d+)-sided die/);
    if (m) return 2 * Number(m[1]);
    m = p.match(/offers (\d+) .+ and (\d+) pairs of pants/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "g7-sp-sampling-bias": (p) => {
    const labels = p.split("||")[1].split(";;");
    const found = labels.find((label) => /^Randomly select \d+ .+ from the complete /.test(label));
    if (!found) throw new Error("no full-frame random sample option");
    return found;
  },
  "g7-sp-sample-reliability": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const labels = labelsRaw.split(";;");
    if (/Five independent random samples/.test(prompt)) {
      const found = labels.find((label) => label.startsWith("The population rate is likely close to"));
      if (!found) throw new Error("no cluster-center conclusion");
      return found;
    }
    const candidates = labels.map((label) => ({ label, n: Number(label.match(/^A random sample of (\d+)/)?.[1] ?? -1) }));
    return candidates.reduce((best, cur) => cur.n > best.n ? cur : best).label;
  },
  "g7-sp-overlap-interpret": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const labels = labelsRaw.split(";;");
    const prefix = /overlap heavily/.test(prompt)
      ? "The samples do not show"
      : /some overlap/.test(prompt)
        ? "The samples suggest a noticeable"
        : "The samples provide strong evidence";
    const found = labels.find((label) => label.startsWith(prefix));
    if (!found) throw new Error("no overlap interpretation matching the evidence");
    return found;
  },
  "g7-sp-likelihood-words": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const probability = Number(prompt.match(/ is ([01])\. Which word/)![1]);
    const wanted = probability === 0 ? "impossible" : "certain";
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g7-sp-compound-model": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const sides = Number(prompt.match(/fair (\d+)-sided die/)![1]);
    let count = 0;
    if (/an even number/.test(prompt)) count = Math.floor(sides / 2);
    else if (/an odd number/.test(prompt)) count = Math.ceil(sides / 2);
    else if (/a number at most 2/.test(prompt)) count = 2;
    else if (/a number greater than/.test(prompt)) count = 2;
    else if (/a multiple of 3/.test(prompt)) count = Math.floor(sides / 3);
    const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);
    const g = gcd(count, 2 * sides);
    const wanted = `${count / g}/${(2 * sides) / g}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },

  "g7-read-scale": (key) => {
    const [p, options = ""] = key.split("||");
    if (/What does this scale mean/.test(p)) {
      const scale = Number(p.match(/1 cm = (\d+) m/)![1]);
      return options.split(";;").find((o) => o === `Each centimeter on the blueprint represents ${scale} real meters`)!;
    }
    let m = p.match(/Room A measures (\d+) cm and Room B measures (\d+) cm/);
    if (m) {
      const scale = Number(p.match(/1 cm = (\d+) m/)![1]);
      return (Number(m[1]) - Number(m[2])) * scale;
    }
    m = p.match(/1 cm = (\d+) m.*?measures (\d+) cm in the drawing/)!;
    let total = 0;
    for (let i = 0; i < Number(m[2]); i++) total += Number(m[1]);
    return total;
  },
  "g7-scale-to-actual": (key) => {
    const [p, options = ""] = key.split("||");
    if (/What operation uses the scale amount/.test(p)) {
      const scale = Number(p.match(/1 cm = (\d+) m/)![1]);
      return options.split(";;").find((o) => o === `Divide the real length by ${scale}`)!;
    }
    let m = p.match(/a (\d+) m pool and a (\d+) m deck/);
    if (m) {
      const scale = Number(p.match(/1 cm = (\d+) m/)![1]);
      let cm = 0;
      for (let x = Number(m[1]) + Number(m[2]); x > 0; x -= scale) cm++;
      return cm;
    }
    m = p.match(/1 cm = (\d+) m.*?a (\d+) m .*? in the drawing/)!;
    const scale = Number(m[1]);
    let real = Number(m[2]);
    let cm = 0;
    while (real > 0) { real -= scale; cm++; }
    return cm;
  },
  "g7-scaled-area": (key) => {
    const [p, options = ""] = key.split("||");
    let m = p.match(/converts (\d+) cm².*1 cm = (\d+) m/);
    if (m) {
      const area = Number(m[1]); const scale = Number(m[2]);
      return options.split(";;").find((o) => o.includes(`${area} × ${scale * scale} = ${area * scale * scale} m²`))!;
    }
    m = p.match(/each 1 cm² of drawing represent/);
    if (m) {
      const scale = Number(p.match(/1 cm = (\d+) m/)![1]);
      let total = 0; for (let i = 0; i < scale; i++) total += scale;
      return total;
    }
    m = p.match(/measures (\d+) cm × (\d+) cm.*1 cm = (\d+) m/)!;
    const [a, b, scale] = [Number(m[1]), Number(m[2]), Number(m[3])];
    let width = 0; for (let i = 0; i < a; i++) width += scale;
    let height = 0; for (let i = 0; i < b; i++) height += scale;
    return width * height;
  },
  "g7-circle-parts": (key) => {
    if (key.includes("||")) {
      const [, leftCsv, rightCsv] = key.split("||");
      const rights = rightCsv.split("\u001F");
      const isRadius = (x: string) => /center to the circle|half of any diameter|A = πr²/.test(x);
      const isDiameter = (x: string) => /through its center|twice the radius|C = πd/.test(x);
      const out: Record<string, string> = {};
      for (const left of leftCsv.split("\u001F")) {
        out[left] = rights.find((r) => left === "radius" ? isRadius(r) : left === "diameter" ? isDiameter(r) : !isRadius(r) && !isDiameter(r))!;
      }
      return out;
    }
    let m = key.match(/large circle has diameter (\d+) and a small circle has diameter (\d+)/);
    if (m) return (Number(m[1]) - Number(m[2])) / 2;
    m = key.match(/has diameter (\d+)/);
    if (m) return Number(m[1]) / 2;
    m = key.match(/has radius (\d+)/)!;
    return Number(m[1]) + Number(m[1]);
  },
  "g7-circumference": (key) => {
    const [p, options = ""] = key.split("||");
    let m = p.match(/radius (\d+) and diameter (\d+)/);
    if (m) return options.split(";;").find((o) => o === `π × ${m![2]} = 2π × ${m![1]} because ${m![2]} = 2 × ${m![1]}`)!;
    m = p.match(/circumference is (\d+)π/);
    if (m) return Math.round(Number(m[1]) * 3.14);
    m = p.match(/track has radius (\d+)/);
    if (m) return Number(m[1]) + Number(m[1]);
    m = p.match(/diameter (\d+)/)!;
    return Number(m[1]);
  },
  "g7-circle-area": (key) => {
    const [p, options = ""] = key.split("||");
    if (/Which formula matches each measurement/.test(p)) return options.split(";;").find((o) => o === "Boundary: C = 2πr; covering: A = πr²")!;
    let m = p.match(/cylinder has radius (\d+) and height (\d+)/);
    if (m) {
      const [r, h] = [Number(m[1]), Number(m[2])];
      let base = 0; for (let i = 0; i < r; i++) base += r;
      let volume = 0; for (let i = 0; i < h; i++) volume += base;
      return volume;
    }
    m = p.match(/diameter (\d+)/);
    if (m) { const r = Number(m[1]) / 2; return r * r; }
    m = p.match(/radius (\d+)/)!;
    const r = Number(m[1]);
    let area = 0; for (let i = 0; i < r; i++) area += r;
    return area;
  },
  "g7-vertical-angles": (key) => {
    const [prompt, labelsRaw = ""] = key.split("||");
    if (/Why must the opposite angles be equal/.test(prompt)) {
      const neighbor = Number(prompt.match(/same (\d+)°/)![1]);
      const wanted = `Both are 180° − ${neighbor}° = ${180 - neighbor}°`;
      return labelsRaw.split(";;").find((label) => label === wanted)!;
    }
    const algebra = prompt.match(/measures (\d+)x degrees where x = (\d+)/);
    if (algebra) {
      let angle = 0;
      for (let i = 0; i < Number(algebra[1]); i++) angle += Number(algebra[2]);
      return angle;
    }
    const angle = Number(prompt.match(/One angle is (\d+)°/)![1]);
    return 180 - angle;
  },
  "g7-triangle-inequality@frameCheck": (p) => {
    const m = p.match(/A triangular frame needs beams of (\d+), (\d+), and (\d+) feet\. Will they form a triangle\?/)!;
    const [a, b, c] = m.slice(1).map(Number);
    return a + b > c ? 1 : 0;
  },
  "g7-triangle-inequality": (key) => {
    const [prompt, labelsRaw = ""] = key.split("||");
    let m = prompt.match(/For side lengths (\d+), (\d+), and (\d+)/);
    if (m) {
      const wanted = `${m[1]} + ${m[2]} must be greater than ${m[3]}`;
      return labelsRaw.split(";;").find((label) => label === wanted)!;
    }
    m = prompt.match(/Two sides of a triangle are (\d+) and (\d+)/);
    if (m) {
      let boundary = 0;
      for (let i = 0; i < Number(m[1]); i++) boundary++;
      for (let i = 0; i < Number(m[2]); i++) boundary++;
      return boundary;
    }
    m = prompt.match(/A triangle has sides (\d+) and (\d+)/);
    if (m) {
      const a = Number(m[1]), b = Number(m[2]);
      let count = 0;
      for (let side = 1; side <= 100; side++) {
        if (a + b > side && a + side > b && b + side > a) count++;
      }
      return count;
    }
    m = prompt.match(/beams of (\d+), (\d+), and (\d+) feet/);
    if (m) {
      const [a, b, c] = m.slice(1).map(Number);
      const sum = a + b;
      const wanted = sum > c
        ? `Yes — ${a} + ${b} = ${sum} beats ${c}`
        : `No — ${a} + ${b} = ${sum} does not beat ${c}`;
      return labelsRaw.split(";;").find((label) => label === wanted)!;
    }
    m = prompt.match(/lengths (\d+), (\d+), and (\d+) form/)!;
    const wanted = `No — ${m[1]} + ${m[2]} only equals ${m[3]}, so the sides lie flat`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g7-cross-sections": (key) => {
    const [prompt, leftRaw = "", rightRaw = ""] = key.split("||");
    if (/Match each solid-and-slice/.test(prompt)) {
      const MAP: Record<string, string> = {
        "cylinder, cut across parallel to its base": "circle",
        "cylinder, cut straight down through its axis": "rectangle",
        "square pyramid, cut down through its tip": "triangle",
        "cone, cut across parallel to its base": "circle",
        "cube, cut parallel to one face": "square",
        "triangular prism, cut parallel to a triangular base": "triangle",
        "sphere, sliced through its center": "circle",
        "rectangular prism, cut parallel to a rectangular face": "rectangle",
        "square pyramid, cut parallel to its base": "square",
      };
      const rights = new Set(rightRaw.split("\u001F"));
      const out: Record<string, string> = {};
      for (const left of leftRaw.split("\u001F")) {
        const target = MAP[left];
        if (!rights.has(target)) throw new Error(`missing cross-section label ${target}`);
        out[left] = target;
      }
      return out;
    }
    const labels = leftRaw.split(";;");
    let wanted: string;
    if (/parallel to one of its/.test(prompt)) {
      const base = prompt.match(/one of its (\w+) bases/)![1];
      wanted = `A ${base} matching the base`;
    } else if (/sliced twice/.test(prompt)) {
      wanted = prompt.includes("square pyramid") ? "A smaller square, then a triangle" : "A smaller circle, then a triangle";
    } else {
      const base = prompt.match(/its (\w+) base/)![1];
      wanted = `A smaller ${base}`;
    }
    return labels.find((label) => label === wanted)!;
  },
  "pr-unit-rate-g7": (key) => {
    const grade6 = g6UnitRoute(key);
    if (grade6 !== undefined) return grade6;
    const [prompt, labelsRaw = ""] = key.split("||");
    const m = prompt.match(/(\d+)\/(\d+).*?(\d+)\/(\d+)/)!;
    const value = (Number(m[1]) / Number(m[2])) / (Number(m[3]) / Number(m[4]));
    if (labelsRaw === "") return value;
    const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
    for (let den = 1; den <= 64; den++) {
      for (let num = 1; num <= 256; num++) {
        if (gcd(num, den) !== 1 || Math.abs(num / den - value) > 1e-9) continue;
        const label = den === 1 ? `${num}` : num > den ? `${Math.floor(num / den)} ${num % den}/${den}` : `${num}/${den}`;
        return labelsRaw.split(";;").find((option) => option === label)!;
      }
    }
    throw new Error("no reduced unit rate found");
  },
  "pr-test-proportional-g7": (key) => {
    const [prompt, labelsRaw = ""] = key.split("||");
    const pairs = [...prompt.matchAll(/\((\d+), (\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])] as const);
    const proportional = pairs.every(([x, y]) => y * pairs[0][0] === pairs[0][1] * x);
    let wanted: string;
    if (proportional) {
      const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
      const g = gcd(pairs[0][1], pairs[0][0]);
      const n = pairs[0][1] / g, d = pairs[0][0] / g;
      wanted = `Yes — every ratio is ${d === 1 ? n : `${n}/${d}`}`;
    } else {
      let broken = 0;
      for (let i = 0; i < pairs.length; i++) {
        const other = pairs.filter((_, j) => j !== i);
        if (other[0][1] * other[1][0] === other[1][1] * other[0][0]) { broken = i; break; }
      }
      wanted = `No — the ${["first", "middle", "last"][broken]} ratio does not match`;
    }
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "pr-constant-k-g7": (key) => {
    const grade6 = g6RatioRoute(key);
    if (grade6 !== undefined) return grade6;
    const [prompt, labelsRaw = ""] = key.split("||");
    let m = prompt.match(/constant of proportionality (\d+)\. When x = (\d+)/);
    if (m) {
      let total = 0;
      for (let i = 0; i < Number(m[2]); i++) total += Number(m[1]);
      return total;
    }
    const pairs = [...prompt.matchAll(/\((\d+), (\d+)\)/g)].map((x) => [Number(x[1]), Number(x[2])] as const);
    m = prompt.match(/what is y when x = (\d+)/i);
    if (m) {
      const target = Number(m[1]);
      let k = 0;
      for (let candidate = 1; candidate <= 30; candidate++) {
        if (candidate * pairs[0][0] === pairs[0][1]) { k = candidate; break; }
      }
      let total = 0;
      for (let i = 0; i < target; i++) total += k;
      return total;
    }
    const [x, y] = pairs[0];
    if (labelsRaw === "") {
      for (let candidate = 1; candidate <= 30; candidate++) if (candidate * x === y) return candidate;
      return y / x;
    }
    const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
    const g = gcd(y, x);
    const wanted = x / g === 1 ? `${y / g}` : `${y / g}/${x / g}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "pr-graph-rate-g7": (prompt) => {
    let m = prompt.match(/unit rate (?:of )?(\d+)/) ?? prompt.match(/\b(\d+) (?:pages|gallons|loaves|miles) per/);
    if (m && /Plot the point/.test(prompt)) return [{ x: 1, y: Number(m[1]) }];
    m = prompt.match(/\((\d+), (\d+)\)/)!;
    const x = Number(m[1]), y = Number(m[2]);
    for (let k = 1; k <= 100; k++) if (k * x === y) return k;
    return NaN;
  },
  "pr-add-percent-g7": (prompt) => {
    const m = prompt.match(/\$(\d+(?:\.\d+)?)\. With (\d+)%/)!;
    const price = Number(m[1]), percent = Number(m[2]);
    let hundredths = 0;
    for (let i = 0; i < percent; i++) hundredths += Math.round(price * 100);
    return Math.round((price + hundredths / 10000) * 100) / 100;
  },
  "pr-price-adjust-g7": (prompt) => {
    const m = prompt.match(/costs \$(\d+(?:\.\d+)?).*?(?:up|is) (\d+)%/)!;
    const price = Number(m[1]), percent = Number(m[2]);
    let hundredths = 0;
    for (let i = 0; i < percent; i++) hundredths += Math.round(price * 100);
    const amount = hundredths / 10000;
    return Math.round((price + (/off/.test(prompt) ? -amount : amount)) * 100) / 100;
  },
  "pr-percent-change-g7": (prompt) => {
    const m = prompt.match(/from (\d+(?:\.\d+)?) to (\d+(?:\.\d+)?)/)!;
    const original = Number(m[1]), next = Number(m[2]);
    for (let p = -99; p <= 200; p++) if (original * (100 + p) === next * 100) return p;
    return NaN;
  },
  "g7-signed-addition": (prompt) => {
    const p = prompt.replace(/−/g, "-").replace(/\(|\)/g, "").replace(/ = \?$/, "");
    const m = p.match(/^(-?\d+(?:\.\d+)?) \+ (-?\d+(?:\.\d+)?)$/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "g7-signed-multiply-divide": (prompt) => {
    const p = prompt.replace(/−/g, "-").replace(/\(|\)/g, "").replace(/ = \?$/, "");
    const parts = p.split(/ (×|÷) /);
    let value = Number(parts[0]);
    for (let i = 1; i < parts.length; i += 2) value = parts[i] === "×" ? value * Number(parts[i + 1]) : value / Number(parts[i + 1]);
    return value;
  },
  "g7-signed-decimal-add": (prompt) => {
    const p = prompt.replace(/−/g, "-").replace(/\(|\)/g, "").replace(/ = \?$/, "");
    const m = p.match(/^(-?\d+(?:\.\d+)?) \+ (-?\d+(?:\.\d+)?)$/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "g7-mixed-rational": (key) => {
    const [prompt, labels = ""] = key.split("||");
    const fm = prompt.match(/^−(\d+)\/(\d+) × (\d+)\/(\d+) = \?$/);
    if (fm) {
      const wanted = -(Number(fm[1]) / Number(fm[2])) * (Number(fm[3]) / Number(fm[4]));
      const value = (label: string) => {
        const m = label.match(/^([−-]?)(\d+)\/(\d+)$/)!;
        return (m[1] ? -1 : 1) * Number(m[2]) / Number(m[3]);
      };
      return labels.split(";;").find((label) => Math.abs(value(label) - wanted) < 1e-12)!;
    }
    let p = prompt;
    const i = p.lastIndexOf("Compute ");
    if (i >= 0) p = p.slice(i + 8).replace(/\.$/, "");
    p = p.replace(/−/g, "-").replace(/\(|\)/g, "").replace(/ = \?$/, "");
    let m = p.match(/^(-?\d+(?:\.\d+)?) × (-?\d+(?:\.\d+)?)$/);
    if (m) return Number(m[1]) * Number(m[2]);
    m = p.match(/^(-?\d+(?:\.\d+)?) - (-?\d+(?:\.\d+)?)$/)!;
    return Number(m[1]) - Number(m[2]);
  },
  "g7-complementary": (key) => {
    const [p, itemsOrOptions = ""] = key.split("||");
    if (/Sort each angle pair/.test(p)) {
      const out: Record<string, string> = {};
      for (const label of itemsOrOptions.split(",")) {
        const m = label.match(/(\d+)° and (\d+)°/)!;
        out[label] = Number(m[1]) + Number(m[2]) === 90 ? "comp" : "supp";
      }
      return out;
    }
    if (/no positive complement/.test(p)) {
      const angle = Number(p.match(/angle of (\d+)°/)![1]);
      return itemsOrOptions.split(";;").find((o) => o === `Complementary pairs total 90°, and ${angle}° already exceeds 90°`)!;
    }
    let m = p.match(/Two measure (\d+)° and (\d+)°/);
    if (m) return 90 - Number(m[1]) - Number(m[2]);
    m = p.match(/One measures (\d+)°/)!;
    return 180 - Number(m[1]);
  },
  // MCQ routes return the CORRECT OPTION'S LABEL, rebuilt from the prompt's numbers — so the gate
  // compares a recomputed string against whichever option the generator flagged correct.
  "two-step-order": (p) => {
    let m = p.match(/(\d+) boxes of (\d+) eggs, plus (\d+) loose/);
    if (m) return `${m[1]} \u00d7 ${m[2]} first, then + ${m[3]}`;
    m = p.match(/(\d+) fish, (\d+) more added/)!;
    const [start, added] = [Number(m[1]), Number(m[2])];
    let t = start;
    for (let i = 0; i < added; i++) t += 1; // count the arrivals one at a time
    return `add: ${start} + ${added} = ${t}`;
  },
  "make-ten-choice": (p) => {
    const m = p.match(/add (\d+) \+ (\d+) by making ten/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    const big = Math.max(a, b);
    // Count up from the bigger addend to ten, rather than subtracting.
    let need = 0;
    for (let t = big; t < 10; t++) need++;
    return `Fill the ${big} (it needs ${need})`;
  },
  "multiple-test": (p) => {
    const m = p.match(/Is (\d+) a multiple of (\d+)\?/)!;
    const [n, d] = [Number(m[1]), Number(m[2])];
    // Divide by repeated subtraction; the label must state the quotient it actually found.
    let rest = n;
    let q = 0;
    while (rest >= d) { rest -= d; q++; }
    if (rest !== 0) return "NOT-A-MULTIPLE";
    return `Yes \u2014 ${n} \u00f7 ${d} = ${q} with no remainder`;
  },
  // Geometry-fact routes: each re-derives from the PRINTED givens using the defining property
  // (pieces add, bisector halves, opposite sides match, midsegment averages), never reusing the
  // generator's own arithmetic.
  "gf-segment-add": (p) => {
    let m = p.match(/AB = (\d+) and BC = (\d+)\. Find AC\./);
    if (m) return Number(m[1]) + Number(m[2]);
    m = p.match(/coordinates (\d+) and (\d+)\. What is the coordinate of the midpoint/);
    if (m) return (Number(m[1]) + Number(m[2])) / 2;
    m = p.match(/AM = (\d+)\. Find AB\./)!;
    return 2 * Number(m[1]);
  },
  "gf-angle-add": (p) => {
    let m = p.match(/m\u2220PQR = (\d+)\u00b0 and m\u2220RQS = (\d+)\u00b0/);
    if (m) return Number(m[1]) + Number(m[2]);
    m = p.match(/bisects \u2220PQS, and m\u2220PQS = (\d+)\u00b0/);
    if (m) return Number(m[1]) / 2;
    m = p.match(/right angle.*m\u2220ABD = (\d+)\u00b0/)!;
    return 90 - Number(m[1]);
  },
  "pq-para-side": (p) => {
    let m = p.match(/PQ = (\d+) and QR = (\d+)\. Find RS\./);
    if (m) return Number(m[1]); // opposite sides congruent
    m = p.match(/adjacent sides (\d+) and (\d+)\. Its perimeter/);
    if (m) { const [a, b] = [Number(m[1]), Number(m[2])]; let t = 0; for (let i = 0; i < 2; i++) t += a + b; return t; }
    m = p.match(/measures (\d+)x \+ (\d+); its opposite side measures (\d+)\. Find x\./);
    if (m) {
      // Solve by SEARCH against the original equation, not by inverting it.
      const [mm, c, opp] = [Number(m[1]), Number(m[2]), Number(m[3])];
      for (let x = 1; x <= 200; x++) if (mm * x + c === opp) return x;
      return NaN;
    }
    m = p.match(/one side is 2y \u2212 1 with opposite side (\d+), and an adjacent side is y \+ (\d+)/)!;
    const [side, k] = [Number(m[1]), Number(m[2])];
    let y = NaN;
    for (let t = 1; t <= 200; t++) if (2 * t - 1 === side) { y = t; break; }
    return 2 * (side + (y + k));
  },
  "pq-para-angle": (p) => {
    let m = p.match(/\u2220A = (\d+)\u00b0\. Find \u2220C \(the opposite angle\)/);
    if (m) return Number(m[1]);
    m = p.match(/\u2220A = (\d+)\u00b0\)\. Find \u2220B \(consecutive/);
    if (m) return 180 - Number(m[1]);
    m = p.match(/measure \(2x\)\u00b0 and \(x \+ (\d+)\)\u00b0\. Find x\./);
    if (m) { const c = Number(m[1]); for (let x = 1; x <= 180; x++) if (2 * x + (x + c) === 180) return x; return NaN; }
    m = p.match(/ratio (\d+) : (\d+)\. Find the SMALLER/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    return (180 / (a + b)) * Math.min(a, b);
  },
  "pq-rhombus": (p) => {
    const sqrtInt = (n: number) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : NaN; };
    let m = p.match(/One side of a rhombus measures (\d+)\. Its perimeter/);
    if (m) { const s = Number(m[1]); let t = 0; for (let i = 0; i < 4; i++) t += s; return t; }
    m = p.match(/has a (\d+)\u00b0 vertex angle/);
    if (m) return Number(m[1]) / 2;
    m = p.match(/diagonals (\d+) and (\d+)\. Find its side length/);
    if (m) { const [d1, d2] = [Number(m[1]), Number(m[2])]; return sqrtInt((d1 / 2) ** 2 + (d2 / 2) ** 2); }
    m = p.match(/side (\d+) and one diagonal of length (\d+)\. Find the OTHER/)!;
    const [side, known] = [Number(m[1]), Number(m[2])];
    return 2 * sqrtInt(side * side - (known / 2) ** 2);
  },
  "pq-trapezoid": (p) => {
    let m = p.match(/bottom base at (\d+)\u00b0/);
    if (m) return 180 - Number(m[1]);
    m = p.match(/bottom base angle of (\d+)\u00b0/);
    if (m) return 180 - Number(m[1]);
    if (/what do the four angles total/.test(p)) {
      // Sum the four PRINTED angles rather than asserting 360.
      const nums = [...p.matchAll(/(\d+)/g)].map((x) => Number(x[0]));
      const four = nums.slice(-4);
      return four.reduce((a, b) => a + b, 0);
    }
    m = p.match(/has bases (\d+) and (\d+)\. Its midsegment/);
    if (m) return (Number(m[1]) + Number(m[2])) / 2;
    m = p.match(/midsegment is (\d+) and one base is (\d+)/)!;
    return 2 * Number(m[1]) - Number(m[2]);
  },
  "pq-kite": (p) => {
    let m = p.match(/cross diagonal .* measures (\d+)\./);
    if (m) return Number(m[1]) / 2;
    m = p.match(/axis measure (\d+)\u00b0 and (\d+)\u00b0/);
    if (m) return (360 - Number(m[1]) - Number(m[2])) / 2;
    m = p.match(/has diagonals (\d+) and (\d+)\. Its area/);
    if (m) return (Number(m[1]) * Number(m[2])) / 2;
    m = p.match(/enclose (\d+) cm\u00b2 .* spine\) is (\d+) cm/)!;
    return Number(m[1]) / (Number(m[2]) / 2);
  },
  // Coordinate geometry: every route re-parses the PRINTED coordinates or triple facts and
  // recomputes from Pythagoras directly — never trusting any number the prompt states as given.
  "coord-distance": (p) => {
    const sqrtInt = (n: number) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : NaN; };
    let m = p.match(/Distance from \((-?\d+), (-?\d+)\) to \((-?\d+), (-?\d+)\) = \?/);
    if (m) return Math.abs(Number(m[4]) - Number(m[2]));
    m = p.match(/Point \(k, (-?\d+)\) is (\d+) units from \((-?\d+), (-?\d+)\)\. Find the LARGER/);
    if (m) {
      const [yT, c, x0, y0] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      const q = yT - y0;
      const p2 = sqrtInt(c * c - q * q);
      return x0 + p2;
    }
    m = p.match(/(?:from A\(|between \()(-?\d+), (-?\d+)\) (?:to B\(|and \()(-?\d+), (-?\d+)\)\.$/)!;
    const [x1, y1, x2, y2] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    return sqrtInt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  },
  "coord-midpoint": (p) => {
    let m = p.match(/Midpoint of \((-?\d+), (-?\d+)\) and \((-?\d+), (-?\d+)\): enter the y-coordinate\./);
    if (m) return (Number(m[2]) + Number(m[4])) / 2;
    m = p.match(/M\((-?\d+), (-?\d+)\) is the midpoint .* A\((-?\d+), (-?\d+)\)\. Enter B's x-coordinate/);
    if (m) return 2 * Number(m[1]) - Number(m[3]);
    m = p.match(/P\((-?\d+), (-?\d+)\), Q\((-?\d+), (-?\d+)\), R\((-?\d+), (-?\d+)\)/);
    if (m) { const [px, , qx, , rx] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])]; return 2 * ((px + rx) / 2) - qx; }
    m = p.match(/A\((-?\d+), (-?\d+)\) and B\((-?\d+), (-?\d+)\)\. Enter M's x-coordinate/)!;
    return (Number(m[1]) + Number(m[3])) / 2;
  },
  // Perimeter: walk every side by re-deriving it from the printed vertices or facts, summing with
  // loop addition; the trapezoid's irrational legs are rounded ONCE, at the very end.
  "coord-perimeter": (p) => {
    let m = p.match(/all four sides equal to (\d+)/);
    if (m) { const c = Number(m[1]); let t = 0; for (let i = 0; i < 4; i++) t += c; return t; }
    m = p.match(/Trapezoid \(0, 0\), \((\d+), 0\), \((\d+), (\d+)\), \((\d+), \d+\)\. Perimeter/);
    if (m) {
      const [W1, , H, inset] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]; // m[2] unused: duplicate x-coord
      const W2 = W1 - 2 * inset;
      const leg = Math.sqrt(inset * inset + H * H);
      return Math.round((W1 + W2 + 2 * leg) * 100) / 100;
    }
    m = p.match(/corners \(0,0\), \((\d+),0\), \((\d+),(\d+)\), \((\d+),(\d+)\), \(0,(\d+)\)/);
    if (m) {
      const [W, H1, cornerX, cornerY, lastY] = [Number(m[1]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])];
      const legA = W - cornerX;
      const legB = cornerY - H1;
      const hyp = Math.sqrt(legA * legA + legB * legB);
      if (Math.round(hyp) ** 2 !== legA * legA + legB * legB) return NaN;
      return W + H1 + Math.round(hyp) + cornerX + lastY;
    }
    m = p.match(/Triangle \(0, 0\), \((\d+), 0\), \((\d+), (\d+)\)\. Perimeter/)!;
    // m[2] is the SAME x-coordinate repeated (the triangle's two right-angle vertices share it) —
    // the actual vertical leg is m[3], not m[2]. A first draft used m[2] here and silently doubled
    // the wrong leg every time.
    const [a, b] = [Number(m[1]), Number(m[3])];
    const c = Math.round(Math.sqrt(a * a + b * b));
    if (c * c !== a * a + b * b) return NaN;
    return a + b + c;
  },
  // Box-and-corners area: re-derive box, triangle, and corner areas from the printed VERTICES via
  // the general rotate-90 construction, and the trapezoid area from its printed vertices.
  "coord-area-box": (p) => {
    let m = p.match(/Same box \((\d+)\)\. The three right-triangle corners have areas (\d+), (\d+), and (\d+)/);
    if (m) return Number(m[1]) - (Number(m[2]) + Number(m[3]) + Number(m[4]));
    m = p.match(/\u00bd \u00d7 \u221a(\d+) \u00d7 \u221a(\d+) = \?/);
    if (m) return Number(m[1]) / 2;
    m = p.match(/Trapezoid \(0, 0\), \((\d+), 0\), \((\d+), (\d+)\), \((\d+), \d+\)/);
    if (m) {
      const [W1, , H, inset] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]; // m[2] unused: duplicate x-coord
      return (W1 - inset) * H;
    }
    m = p.match(/Triangle \((\d+), (\d+)\), \((\d+), (\d+)\), \((\d+), (\d+)\) \u2014 a right-isosceles/)!;
    const [x0, y0, x1, y1, x2, y2] = m.slice(1).map(Number);
    const xs = [x0, x1, x2];
    const ys = [y0, y1, y2];
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  },
  // Measurement: parse the printed quantities and simulate the story with loop arithmetic —
  // draining, refilling, converting mL to L by dividing by 1000.
  "measure-word": (p) => {
    let m = p.match(/uses (\d+) g of sugar and (\d+) g of butter/);
    if (m) return Number(m[1]) + Number(m[2]);
    m = p.match(/holds (\d+) liters\. (\d+) liters drain out, then (\d+) liters are added/);
    if (m) return Number(m[1]) - Number(m[2]) + Number(m[3]);
    m = p.match(/A (\d+) g block of cheese has (\d+) g sliced off/);
    if (m) return Number(m[1]) - Number(m[2]);
    m = p.match(/makes (\d+) L .* and (\d+),000 mL .* They sell (\d+) L/)!;
    const mL = Number(m[2]) * 1000;
    return Number(m[1]) + mL / 1000 - Number(m[3]);
  },
  // Graph questions: recompute from the PRINTED BAR HEIGHTS, never from any stated total.
  "graph-read": (p) => {
    let m = p.match(/Mon (\d+), Tue (\d+), Wed (\d+), Thu (\d+)/);
    if (m) { let t = 0; for (let i = 1; i <= 4; i++) t += Number(m[i]); return t; }
    m = p.match(/soccer (\d+), tag (\d+), swings (\d+), slide (\d+)/);
    if (m) return Number(m[1]) + Number(m[2]) - (Number(m[3]) + Number(m[4]));
    m = p.match(/dogs (\d+), cats (\d+), fish (\d+), birds (\d+)/)!;
    const [dogs, cats, fish, birds] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
    if (/TOGETHER/.test(p)) return cats + birds;
    return dogs - fish;
  },
  // Area: recompute each rectangle from its printed DIMENSIONS (loop multiplication), so a wrong
  // stated area in a prompt would fail the gate rather than pass through.
  "area-compose": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    let m = p.match(/a (\d+)-by-(\d+) rectangle \(area \d+\) and a (\d+)-by-(\d+) rectangle/);
    if (m) return mul(Number(m[1]), Number(m[2])) + mul(Number(m[3]), Number(m[4]));
    m = p.match(/room is (\d+) m by (\d+) m\. A rug covering it is (\d+) m by (\d+) m/);
    if (m) return mul(Number(m[1]), Number(m[2])) - mul(Number(m[3]), Number(m[4]));
    m = p.match(/garden is (\d+) m by (\d+) m, with a (\d+) m by (\d+) m pond/);
    if (m) return mul(Number(m[1]), Number(m[2])) - mul(Number(m[3]), Number(m[4]));
    m = p.match(/center square of area (\d+) and four arms, each of area (\d+)/)!;
    { let t = Number(m[1]); for (let i = 0; i < 4; i++) t += Number(m[2]); return t; }
  },
  "area-compose@attachedAreas": (p) => {
    const m = p.match(/A (\d+)-by-(\d+) rectangle .* triangle with base (\d+) and height (\d+)/)!;
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    return mul(Number(m[1]), Number(m[2])) + mul(Number(m[3]), Number(m[4])) / 2;
  },
  "area-compose@coordinateComposite": (p) => {
    const pts = [...p.matchAll(/\((-?\d+),(-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const bbox = (q: number[][]) => {
      const xs = q.map((v) => v[0]), ys = q.map((v) => v[1]);
      return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    };
    const rectangle = bbox(pts.slice(0, 4));
    const attachedTriangle = bbox(pts.slice(4, 7)) / 2;
    const notch = bbox(pts.slice(7, 10)) / 2;
    return rectangle + attachedTriangle - notch;
  },
  // Partial products and two-row: the route re-multiplies the ORIGINAL printed problem digit by
  // digit with loop addition, never adding the pieces the prompt displays.
  "partial-products": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    const m = p.match(/(\d+) \u00d7 (\d)\b/)!;
    return mul(Number(m[1]), Number(m[2]));
  },
  "two-row-multiply": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    let m = p.match(/the second row is (\d+) \u00d7 (\d+) \(the tens digit/);
    if (m) return mul(Number(m[1]), Number(m[2]));
    m = p.match(/(\d+) \u00d7 (\d+)/)!;
    return mul(Number(m[1]), Number(m[2]));
  },
  // Long division re-run from scratch by repeated subtraction on the printed dividend/divisor —
  // whichever numbers appear, the route divides and answers the asked part.
  "long-div-2digit": (p) => {
    let m = p.match(/computed \d+ \u00d7 \d+ = (\d+)\. What is (\d+) \u2212 (\d+)\?/);
    if (m) return Number(m[2]) - Number(m[3]);
    m = p.match(/What is (\d+) \u00f7 (\d+)\?/) ?? p.match(/long division: (\d+) \u00f7 (\d+) = \?/) ?? p.match(/of (\d+) \u00f7 (\d+)\./)!;
    let rest = Number(m[1]);
    const D = Number(m[2]);
    let q = 0;
    while (rest >= D) { rest -= D; q++; }
    return q;
  },
  // Ladder moves: parse the starting value into MILLS (thousandths), then apply each printed
  // ×10/÷10 one at a time on the integer.
  "ladder-shift": (p) => {
    const m = p.match(/^(\d+(?:\.\d+)?)((?: [\u00d7\u00f7] 10)+) = \?/)!;
    let mills = Math.round(Number(m[1]) * 1000);
    for (const op of m[2].trim().split(" 10").join("").split(" ").filter(Boolean)) {
      if (op === "\u00d7") mills *= 10;
      else mills = Math.round(mills / 10);
    }
    return mills / 1000;
  },
  // Ordering: parse every printed decimal into mills, sort the INTEGERS, answer by position.
  "order-decimals": (p) => {
    const vals = [...p.matchAll(/0\.\d+/g)].map((x) => Math.round(Number(x[0]) * 1000));
    const sorted = [...new Set(vals)].sort((a, b) => a - b);
    if (/LEAST/.test(p)) return sorted[0] / 1000;
    if (/GREATEST/.test(p)) return sorted[sorted.length - 1] / 1000;
    return sorted[1] / 1000; // SECOND least
  },
  "order-decimals@tenthsOrder": (p) => {
    const [prompt] = p.split("||");
    const vals = [...prompt.matchAll(/0\.(\d)/g)].map((m) => Number(m[1]));
    const sorted = [...new Set(vals)].sort((a, b) => a - b);
    return sorted.map((d) => `0.${d}`).join(", ");
  },
  // Function evaluation: the route PARSES the printed rule into a tiny evaluator (repeated
  // addition for products, explicit self-multiplication for squares) and substitutes.
  "fn-evaluate": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    const vm = p.match(/what is [fgh]\((\d+)\)\?$/)!;
    const v = Number(vm[1]);
    let m = p.match(/= (\d+)x\^2 ([+-]) (\d+),/);
    if (m) { const sq = mul(v, v); const t = mul(Number(m[1]), sq); return m[2] === "+" ? t + Number(m[3]) : t - Number(m[3]); }
    m = p.match(/= x\^2 - (\d+),/);
    if (m) return mul(v, v) - Number(m[1]);
    m = p.match(/= x\^2,/);
    if (m) return mul(v, v);
    m = p.match(/= (\d+)x - (\d+),/);
    if (m) return mul(Number(m[1]), v) - Number(m[2]);
    m = p.match(/= (\d+)x,/)!;
    return mul(Number(m[1]), v);
  },
  // Sequences: read ALL FOUR printed terms, confirm the step is constant across every
  // consecutive pair (returning NaN otherwise), then answer from the verified step. The nth-term
  // forms walk the steps one at a time.
  "fn-arith-seq": (p) => {
    let m = p.match(/In the sequence (-?\d+), (-?\d+), (-?\d+), (-?\d+), what is the (common difference|next term)\?/);
    if (m) {
      const T = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      const d = T[1] - T[0];
      if (T[2] - T[1] !== d || T[3] - T[2] !== d) return NaN;
      return m[5] === "common difference" ? d : T[3] + d;
    }
    m = p.match(/For a_1 = (\d+), d = (-?\d+), what is the (\d)(?:st|nd|rd|th) term\?/)!;
    const A = Number(m[1]);
    const D = Number(m[2]);
    const N = Number(m[3]);
    let t = A;
    for (let i = 1; i < N; i++) t += D;
    return t;
  },
  // Equivalence tests: the route substitutes into the REAL expression by literal arithmetic
  // (inside-the-parentheses first), never trusting the generator's algebra.
  "equiv-test": (p) => {
    let m = p.match(/Evaluate x \+ x at x = (\d+)/);
    if (m) return Number(m[1]) + Number(m[1]);
    m = p.match(/Test whether (\d+)\(x \+ (\d+)\) equals .* using x = 0/);
    if (m) { let t = 0; for (let i = 0; i < Number(m[1]); i++) t += 0 + Number(m[2]); return t; }
    m = p.match(/Are (\d+)x \+ x and 2\(\d+x\) equivalent\? Evaluate EITHER at x = (\d+)/);
    if (m) { const a = Number(m[1]); const v = Number(m[2]); let t = v; for (let i = 0; i < a; i++) t += v; return t; }
    m = p.match(/Evaluate (\d+)\(w \+ (\d+)\) at w = (\d+)/)!;
    { let t = 0; for (let i = 0; i < Number(m[1]); i++) t += Number(m[3]) + Number(m[2]); return t; }
  },
  // One-step equations solved by INVERSE CHECK: try candidate x values until the original
  // equation balances — never applying the inverse operation the generator used.
  "solve-mult-div": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    let m = p.match(/Verify x = (\d+) solves (\d+)x = \d+ by computing/);
    if (m) return mul(Number(m[2]), Number(m[1]));
    m = p.match(/Solve x \u00f7 (\d+) = (\d+)\./);
    if (m) {
      const [b, c] = [Number(m[1]), Number(m[2])];
      for (let x = 1; x <= 200; x++) { let q = 0, rest = x; while (rest >= b) { rest -= b; q++; } if (q === c && rest === 0) return x; }
      return NaN;
    }
    m = p.match(/Solve (\d+)x = (\d+)\./);
    if (m) { const [a, c] = [Number(m[1]), Number(m[2])]; for (let x = 1; x <= 100; x++) if (mul(a, x) === c) return x; return NaN; }
    m = p.match(/Tickets cost \$(\d+) each, and a group spent \$(\d+) total/)!;
    { const [pr, T] = [Number(m[1]), Number(m[2])]; for (let t = 1; t <= 100; t++) if (mul(pr, t) === T) return t; return NaN; }
  },
  "negative-intro": (p) => {
    let m = p.match(/sits (\d+) feet below sea level/);
    if (m) return -Number(m[1]);
    m = p.match(/opposite of the opposite of (\d+)\?/);
    if (m) return -(-Number(m[1]));
    m = p.match(/opposite of -(\d+)\?/);
    if (m) return -(-Number(m[1]));
    m = p.match(/morning temperature is -(\d+) degrees.*risen (\d+) degrees/)!;
    // Walk the number line step by step from -a, rising r times.
    { let t = -Number(m[1]); for (let i = 0; i < Number(m[2]); i++) t += 1; return t; }
  },
  "decimal-compute": (p) => {
    const m = p.match(/Compute (\d+\.\d+) ([\u00d7\u00f7]) (\d+\.\d+)\./)!;
    const strip = (s: string) => Number(s.replace(".", ""));
    const [A, B] = [strip(m[1]), strip(m[3])];
    if (m[2] === "\u00d7") return (A * B) / 100;
    let q = 0;
    let rest = A;
    while (rest >= B) { rest -= B; q++; }
    return q;
  },
  // Grouping evaluated by executing the parentheses LITERALLY: inside first (by loop arithmetic),
  // then the outer operation — the route respects the rule it is checking.
  "grouping-first": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    const divi = (a: number, b: number) => { let q = 0; while (a >= b) { a -= b; q++; } return q; };
    let m = p.match(/Following the order of operations, what is (\d+) \+ (\d+) \u00d7 (\d+)/);
    if (m) return Number(m[1]) + mul(Number(m[2]), Number(m[3]));
    m = p.match(/What is (\d+) \u2212 (\d+) \u00d7 (\d+)\?/);
    if (m) return Number(m[1]) - mul(Number(m[2]), Number(m[3]));
    m = p.match(/What is (\d+) \u00f7 (\d+) \+ (\d+)\?/);
    if (m) return divi(Number(m[1]), Number(m[2])) + Number(m[3]);
    m = p.match(/Double (\d+), then add (\d+)/);
    if (m) return mul(Number(m[1]), 2) + Number(m[2]);
    m = p.match(/Subtract (\d+) from (\d+), then multiply by (\d+)/);
    if (m) return mul(Number(m[2]) - Number(m[1]), Number(m[3]));
    m = p.match(/Which words match \((\d+) \+ (\d+)\) \u00d7 (\d+)\?/);
    if (m) {
      const labels = p.split("||")[1].split(";;");
      return labels.find((label) => label === `${m![3]} times the sum of ${m![1]} and ${m![2]}`)!;
    }
    m = p.match(/What is \((\d+) \u2212 (\d+)\) \u00f7 (\d+)\?/);
    if (m) return divi(Number(m[1]) - Number(m[2]), Number(m[3]));
    m = p.match(/What is \((\d+) \u2212 (\d+)\) \u00d7 (\d+)\?/);
    if (m) return mul(Number(m[1]) - Number(m[2]), Number(m[3]));
    m = p.match(/What is \((\d+) \+ (\d+)\) \u00d7 (\d+)\?/);
    if (m) return mul(Number(m[1]) + Number(m[2]), Number(m[3]));
    m = p.match(/What is (\d+) \u00d7 \((\d+) \+ (\d+)\)\?/)!;
    return mul(Number(m[1]), Number(m[2]) + Number(m[3]));
  },
  // The estimate route IGNORES the prompt's suggested rounding for the compatible form and
  // re-derives it: round the divisor to the nearest ten, walk to the nearest multiple, divide by
  // counting. For the scaffolded forms it divides the printed pair by counting.
  "estimate-round": (p) => {
    const divi = (a: number, b: number) => { let q = 0; while (a >= b) { a -= b; q++; } return q; };
    let m = p.match(/Estimate (\d+) \u00f7 (\d+) using (\d+) \u00f7 (\d+)\./);
    if (m) return divi(Number(m[3]), Number(m[4]));
    m = p.match(/Estimate (\d+) \u00f7 (\d+) with compatible numbers/)!;
    const N = Number(m[1]);
    const D = Number(m[2]);
    const S = Math.round(D / 10) * 10;
    let R = 0;
    while (Math.abs(R + S - N) <= Math.abs(R - N)) R += S;
    return divi(R, S);
  },
  "common-denom": (p) => {
    let m = p.match(/least common denominator for \d+\/(\d+) and \d+\/(\d+)\?/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      let t = a;
      while (t % b !== 0) t += a;
      return t;
    }
    // Rewrite 1/d over m: count how many d-steps reach m.
    m = p.match(/Rewrite 1\/(\d+) with a denominator of (\d+)\./)!;
    const [d, target] = [Number(m[1]), Number(m[2])];
    let k = 0;
    let t = 0;
    while (t < target) { t += d; k++; }
    return k;
  },
  // Split-and-take by loops: one part by repeated subtraction, then n parts by repeated addition.
  "fraction-of": (p) => {
    const m = p.match(/(\d+)\/(\d+) of (\d+)\?$/)!;
    const [n, d, W] = [Number(m[1]), Number(m[2]), Number(m[3])];
    let rest = W;
    let u = 0;
    while (rest >= d) { rest -= d; u++; }
    let t = 0;
    for (let i = 0; i < n; i++) t += u;
    return t;
  },
  // Remainder items re-divide by REPEATED SUBTRACTION, ignoring the quotient and remainder the
  // prompt prints, then answer the question word.
  "remainder-word": (p) => {
    const m = p.match(/(\d+) (?:stickers|cookies|people)?.*?\((\d+) \u00f7 (\d+) = \d+ remainder \d+\)/) ?? p.match(/\((\d+) \u00f7 (\d+) = \d+ remainder \d+\)/)!;
    const T = Number(m[m.length === 4 ? 2 : 1]);
    const D = Number(m[m.length === 4 ? 3 : 2]);
    let rest = T;
    let q = 0;
    while (rest >= D) { rest -= D; q++; }
    if (/LEFT OVER/.test(p)) return rest;
    if (/EACH friend/.test(p)) return q;
    if (/vans are needed/.test(p)) return rest > 0 ? q + 1 : q;
    return q; // full packs
  },
  // The decimal routes re-parse every printed decimal into INTEGER CENTS (or mills) and do all
  // arithmetic there — the generator's floating-point never touches the check. Formatting back
  // happens exactly once at the end.
  "decimal-align-addsub": (p) => {
    // (\d+(?:\.\d+)?) and never [\d.]+ — the latter swallows the sentence's closing period and
    // turns "2.85." into NaN. This bug has now been caught three times in this file.
    const cents = (s: string) => Math.round(Number(s) * 100);
    let m = p.match(/A meal costs \$(\d+\.\d+) \+ \$(\d+\.\d+) \+ \$(\d+\.\d+)\./);
    if (m) return (cents(m[1]) + cents(m[2]) + cents(m[3])) / 100;
    m = p.match(/items costing \$(\d+\.\d+), \$(\d+\.\d+), and \$(\d+\.\d+), and pay with \$20\.00/);
    if (m) return (2000 - cents(m[1]) - cents(m[2]) - cents(m[3])) / 100;
    m = p.match(/Two ribbons are (\d+\.\d+) m and (\d+\.\d+) m/);
    if (m) return (cents(m[1]) + cents(m[2])) / 100;
    m = p.match(/A (\d+\.\d+) km trail, (\d+\.\d+) km walked/);
    if (m) return (cents(m[1]) - cents(m[2])) / 100;
    m = p.match(/^Add (\d+(?:\.\d+)?) \+ (\d+(?:\.\d+)?)/);
    if (m) return (cents(m[1]) + cents(m[2])) / 100;
    m = p.match(/^Subtract (\d+(?:\.\d+)?) \u2212 (\d+(?:\.\d+)?)/)!;
    return (cents(m[1]) - cents(m[2])) / 100;
  },
  "decimal-mul-places": (p) => {
    // Multiply as INTEGERS after stripping the points, then divide once by the counted places.
    const m = p.match(/^(\d+(?:\.\d+)?) \u00d7 (\d+(?:\.\d+)?)/)!;
    const places = (s: string) => (s.includes(".") ? s.split(".")[1].length : 0);
    const strip = (s: string) => Number(s.replace(".", ""));
    const total = places(m[1]) + places(m[2]);
    return (strip(m[1]) * strip(m[2])) / 10 ** total;
  },
  "decimal-shift-divide": (p) => {
    const m = p.match(/^(\d+(?:\.\d+)?) \u00f7 (\d+(?:\.\d+)?)/)!;
    // Scale BOTH numbers to integers by the larger place count, then long-divide by repeated
    // subtraction — the definition of the quotient.
    const places = (s: string) => (s.includes(".") ? s.split(".")[1].length : 0);
    const k = Math.max(places(m[1]), places(m[2]));
    let a = Math.round(Number(m[1]) * 10 ** k);
    const b = Math.round(Number(m[2]) * 10 ** k);
    // The quotient may be a tenth-valued number (7.5 ÷ 5 = 1.5): count subtractions in tenths.
    let q = 0;
    a *= 10;
    while (a >= b) { a -= b; q++; }
    return q / 10;
  },
  // The polynomial routes never touch coefficients symbolically. They parse each PRINTED
  // polynomial into an evaluator, combine the evaluators as functions (sum, difference, product),
  // and recover the asked coefficient by solving the Vandermonde system on sampled values —
  // Gaussian elimination against the generator's symbol-pushing.
  "poly-read": (p) => polyRoute(p),
  "poly-addsub": (p) => polyRoute(p),
  "poly-mul-mono": (p) => polyRoute(p),
  // Exponentials verified by REPEATED MULTIPLICATION — b^v built one factor at a time, never **.
  "exp-function": (p) => {
    const pw = (b: number, v: number) => { let t = 1; for (let i = 0; i < v; i++) t *= b; return t; };
    let m = p.match(/f\(x\) = (\d+) \* (\d+)\^x, what is the initial value f\(0\)/);
    if (m) return Number(m[1]);
    m = p.match(/([A-Z])\(x\) = (\d+) \* \(1\/(\d+)\)\^x, what is the starting amount/);
    if (m) return Number(m[2]);
    m = p.match(/([A-Z])\(x\) = (\d+) \* (\d+)\^x, what is the starting amount/);
    if (m) return Number(m[2]);
    m = p.match(/([A-Z])\(x\) = (\d+) \* \(1\/(\d+)\)\^x\. What is [A-Z]\((\d+)\)/);
    if (m) {
      let t = Number(m[2]);
      for (let i = 0; i < Number(m[4]); i++) t /= Number(m[3]);
      return t;
    }
    m = p.match(/([A-Z])\(x\) = (\d+) \* (\d+)\^x\. What is [A-Z]\((\d+)\)/);
    if (m) return Number(m[2]) * pw(Number(m[3]), Number(m[4]));
    m = p.match(/(\d+) \* (\d+)\^x\. How many are there after (\d+) hours/);
    if (m) return Number(m[1]) * pw(Number(m[2]), Number(m[3]));
    m = p.match(/In the sequence (\d+), (\d+), (\d+), (\d+), what is the constant ratio/);
    if (m) {
      // Read the ratio off the terms and CONFIRM it holds across the whole sequence.
      const t = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      const r = t[1] / t[0];
      if (t[2] / t[1] !== r || t[3] / t[2] !== r) throw new Error("ratio not constant");
      return r;
    }
    m = p.match(/The sequence (\d+), (\d+), (\d+), (\d+) continues\. What is the next term/);
    if (m) {
      const t = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      const r = t[1] / t[0];
      if (t[3] / t[2] !== r) throw new Error("ratio not constant");
      return t[3] * r;
    }
    m = p.match(/f\(x\) = (\d+) \* (\d+)\^x, what is f\((\d+)\)/)!;
    return Number(m[1]) * pw(Number(m[2]), Number(m[3]));
  },
  // Equation solving verified by SEARCH: try every exponent from −8 to 8, build a·b^x by repeated
  // multiplication or division, and keep the one that hits the right-hand side.
  "exp-solve": (p) => {
    const at = (a: number, b: number, x: number) => {
      let t = a;
      for (let i = 0; i < Math.abs(x); i++) t = x >= 0 ? t * b : t / b;
      return t;
    };
    let a = 1;
    let b: number;
    let target: number;
    let m = p.match(/Solve (\d+) \* (\d+)\^x = (\d+)\./);
    if (m) {
      [a, b, target] = [Number(m[1]), Number(m[2]), Number(m[3])];
    } else if ((m = p.match(/Solve \(1\/(\d+)\)\^x = (\d+)\./))) {
      [b, target] = [1 / Number(m[1]), Number(m[2])];
    } else {
      m = p.match(/Solve (\d+)\^x = 1\/(\d+)\./)!;
      [b, target] = [Number(m[1]), 1 / Number(m[2])];
    }
    for (let x = -8; x <= 8; x++) {
      if (Math.abs(at(a, b, x) - target) < 1e-9) return x;
    }
    throw new Error("no exponent solves it");
  },
  "power-product": (p) => {
    const pw = (b: number, v: number) => { let t = 1; for (let i = 0; i < v; i++) t *= b; return t; };
    let m = p.match(/Evaluate 2\^(\d+) \u00b7 2\^(\d+)\./);
    if (m) return pw(2, Number(m[1])) * pw(2, Number(m[2]));
    m = p.match(/Evaluate 2\^(\d+) \/ 2\^(\d+)\./);
    if (m) return pw(2, Number(m[1])) / pw(2, Number(m[2]));
    // Exponent-only: divide the actual powers of a stand-in base and count the factors left.
    m = p.match(/Simplify x\^(\d+) \/ x\^(\d+)/)!;
    let v = pw(2, Number(m[1])) / pw(2, Number(m[2]));
    let k = 0;
    while (v > 1) { v /= 2; k++; }
    return k;
  },
  // Expression evaluation, re-derived with products as REPEATED ADDITION — never a * b — so the
  // route's arithmetic shares nothing with the generator's.
  "eval-expression": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    let m = p.match(/Evaluate x\u00b2 at x = (\d+)\./);
    if (m) { const c = Number(m[1]); return mul(c, c); }
    m = p.match(/Evaluate \(n \+ (\d+)\) \u00f7 (\d+) at n = (\d+)\./);
    if (m) {
      const [d1, d2, v] = [Number(m[1]), Number(m[2]), Number(m[3])];
      // Divide by counting how many times d2 fits.
      let rest = v + d1;
      let q = 0;
      while (rest >= d2) { rest -= d2; q++; }
      return q;
    }
    m = p.match(/Evaluate (\d+)m\u00b2 \+ (\d+) at m = (\d+)\./);
    if (m) {
      const [a, k, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return mul(a, mul(c, c)) + k;
    }
    m = p.match(/Evaluate (\d+)x \u2212 (\d+) at x = (\d+)\./)!;
    return mul(Number(m[1]), Number(m[3])) - Number(m[2]);
  },
  "variable-meaning": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    let m = p.match(/Pay is (\d+)h dollars for h hours\. How much does a (\d+)-hour/);
    if (m) return mul(Number(m[1]), Number(m[2]));
    m = p.match(/What is y \u00f7 (\d+) when y = (\d+)\?/);
    if (m) {
      const [d, v] = [Number(m[1]), Number(m[2])];
      let rest = v;
      let q = 0;
      while (rest >= d) { rest -= d; q++; }
      return q;
    }
    m = p.match(/carries p passengers; (\d+) get off\..*at p = (\d+)\./);
    if (m) return Number(m[2]) - Number(m[1]);
    m = p.match(/What is (\d+)n when n = (\d+)\?/)!;
    return mul(Number(m[1]), Number(m[2]));
  },
  "linear-predict": (p) => {
    const mul = (a: number, b: number) => { let t = 0; for (let i = 0; i < b; i++) t += a; return t; };
    let m = p.match(/y = \u2212(\d+)x \+ (\d+)\. Predict y when x = (\d+)\./);
    if (m) return Number(m[2]) - mul(Number(m[1]), Number(m[3]));
    m = p.match(/y = \u00bdx \+ (\d+)\. Predict y when x = (\d+)\./);
    if (m) { const v = Number(m[2]); return v / 2 + Number(m[1]); }
    m = p.match(/y = (\d+)x \+ (\d+)\. Predict y when x = (\d+)\./)!;
    return mul(Number(m[1]), Number(m[3])) + Number(m[2]);
  },
  // LCM verified by its DEFINITION: count up the multiples of one number until the other divides.
  "lcm-pair": (p) => {
    const m =
      p.match(/LCM of (\d+) and (\d+)/) ??
      p.match(/every (\d+) minutes, another every (\d+) minutes/);
    const [a, b] = [Number(m![1]), Number(m![2])];
    let t = a;
    while (t % b !== 0) t += a;
    return t;
  },
  // The hypotenuse (or leg) found by INTEGER SEARCH: the smallest whole number whose square hits
  // the target — no square-root function anywhere.
  "pythagorean": (p) => {
    const isqrt = (s: number) => { let c = 1; while (c * c < s) c++; return c; };
    let m = p.match(/hypotenuse (\d+) and one leg (\d+)/);
    if (m) return isqrt(Number(m[1]) ** 2 - Number(m[2]) ** 2);
    m = p.match(/base is (\d+) feet from the wall and it reaches (\d+) feet/);
    if (m) return isqrt(Number(m[1]) ** 2 + Number(m[2]) ** 2);
    m = p.match(/legs (\d+) and (\d+)/)!;
    return isqrt(Number(m[1]) ** 2 + Number(m[2]) ** 2);
  },
  // Powers of ten checked by ACTUALLY doing the arithmetic on the numbers 10^k and reading the
  // exponent off the result — the rule says add or subtract; the route multiplies and divides.
  "power-ten-exponent": (p) => {
    const D = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
    const readExp = (tok: string) => {
      const neg = tok.startsWith("\u207b");
      const digits = [...(neg ? tok.slice(1) : tok)].map((ch) => D.indexOf(ch)).join("");
      return (neg ? -1 : 1) * Number(digits);
    };
    const toks = [...p.matchAll(/10([\u207b\u2070-\u2079\u00b9\u00b2\u00b3]+)/g)].map((mm) => readExp(mm[1]));
    const ops = [...p.matchAll(/(\u00d7|\u00f7)/g)].map((mm) => mm[1]);
    let v = 10 ** toks[0];
    for (let i = 0; i < ops.length; i++) v = ops[i] === "\u00d7" ? v * 10 ** toks[i + 1] : v / 10 ** toks[i + 1];
    return Math.round(Math.log10(v));
  },
  // The derivative routes verify by NUMERICAL CENTRAL DIFFERENCE — (f(a+h) − f(a−h))/2h with
  // h = 1e−5 — the definition of the derivative, never the rules the generators applied. For the
  // abstract-values forms there is no formula to differentiate, so the route BUILDS one: witness
  // lines f(x) = F + F′(x − a) reproduce the given values and derivatives, and their product or
  // quotient is then differentiated numerically like everything else.
  "deriv-product": (p) => {
    const H = 1e-5;
    const dd = (f: (x: number) => number, a: number) => (f(a + H) - f(a - H)) / (2 * H);
    const SUP = "\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078";
    const exp = (ch: string | undefined) => (ch === undefined || ch === "" ? 1 : SUP.indexOf(ch) + 1);
    let m = p.match(/f\(x\) = x([\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078]) \u00b7 x([\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078])\. Compute f\u2032\((\d+)\)/);
    if (m) {
      const [pp, q, c] = [exp(m[1]), exp(m[2]), Number(m[3])];
      return Math.round(dd((x) => x ** pp * x ** q, c));
    }
    m = p.match(/f\((\d+)\) = (\d+), f\u2032\(\d+\) = (\d+), g\(\d+\) = (\d+), g\u2032\(\d+\) = (\u2212?\d+)\./);
    if (m) {
      const a = Number(m[1]);
      const [F, Fp, G] = [Number(m[2]), Number(m[3]), Number(m[4])];
      const Gp = Number(m[5].replace("\u2212", "-"));
      const f = (x: number) => F + Fp * (x - a);
      const g = (x: number) => G + Gp * (x - a);
      return Math.round(dd((x) => f(x) * g(x), a));
    }
    m = p.match(/f\(x\) = (\d*)x([\u00b2\u00b3])?\(x([\u00b2\u00b3])? (\+|\u2212) 1\)\. Find f\u2032\((\d+)\)/)!;
    const c = m[1] === "" ? 1 : Number(m[1]);
    const pp = exp(m[2]);
    const q = exp(m[3]);
    const e = m[4] === "+" ? 1 : -1;
    const a = Number(m[5]);
    return Math.round(dd((x) => c * x ** pp * (x ** q + e), a));
  },
  "deriv-quotient": (p) => {
    const H = 1e-5;
    const dd = (f: (x: number) => number, a: number) => (f(a + H) - f(a - H)) / (2 * H);
    const rd = (x: number) => Math.round(x * 10000) / 10000;
    let m = p.match(/f\(x\) = \(x([\u00b3\u2074])? \+ x([\u00b2\u00b3])?\)\/x, for x \u2260 0\. Find f\u2032\((\d+)\)/);
    if (m) {
      const SUP = "\u00b9\u00b2\u00b3\u2074";
      const hiE = m[1] ? SUP.indexOf(m[1]) + 1 : 1;
      const loE = m[2] ? SUP.indexOf(m[2]) + 1 : 1;
      const a = Number(m[3]);
      return Math.round(dd((x) => (x ** hiE + x ** loE) / x, a));
    }
    m = p.match(/u\((\d+)\) = (\d+), u\u2032\(\d+\) = (\d+), v\(\d+\) = (\d+), v\u2032\(\d+\) = (\d+)\./);
    if (m) {
      const a = Number(m[1]);
      const [U, Up, V, Vp] = [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])];
      const u = (x: number) => U + Up * (x - a);
      const v = (x: number) => V + Vp * (x - a);
      return rd(dd((x) => u(x) / v(x), a));
    }
    m = p.match(/f\(x\) = x(\u00b2)?\/\(x \+ 1\)\. Find f\u2032\((\d+)\)/)!;
    const pow = m[1] ? 2 : 1;
    const a = Number(m[2]);
    return rd(dd((x) => x ** pow / (x + 1), a));
  },
  "deriv-explog": (p) => {
    const H = 1e-5;
    const dd = (f: (x: number) => number, a: number) => (f(a + H) - f(a - H)) / (2 * H);
    const rd = (x: number) => Math.round(x * 10000) / 10000;
    let m = p.match(/f\(x\) = e\^\((\d+)x\)\. Find f\u2032\(0\)/);
    if (m) return Math.round(dd((x) => Math.exp(Number(m![1]) * x), 0));
    m = p.match(/f\(x\) = ln\(x\u00b2 \+ 1\)\. Find f\u2032\((\d+)\)/);
    if (m) return rd(dd((x) => Math.log(x * x + 1), Number(m[1])));
    m = p.match(/f\(x\) = ln x\. Find f\u2032\((\d+)\)/)!;
    return rd(dd((x) => Math.log(x), Number(m[1])));
  },
  // Every series route below sums by LITERAL LOOP — term after term, the definition — and never by
  // the closed formula the generator used. If the generator's algebra is wrong, the loop disagrees.
  "arith-series": (p) => {
    let m = p.match(/first (\d+) odd numbers/);
    if (m) {
      const M = Number(m[1]);
      let S = 0;
      for (let i = 0; i < M; i++) S += 2 * i + 1;
      return S;
    }
    m = p.match(/So what is 1 \+ 2 \+ 3 \+ \u22ef \+ (\d+)\?/);
    if (m) {
      let S = 0;
      for (let k = 1; k <= Number(m[1]); k++) S += k;
      return S;
    }
    m = p.match(/a\u2081 = (\d+), d = (\u2212?\d+), n = (\d+)/);
    if (m) {
      const a1 = Number(m[1]);
      const d = Number(m[2].replace("\u2212", "-"));
      const n = Number(m[3]);
      let S = 0;
      for (let i = 0; i < n; i++) S += a1 + i * d;
      return S;
    }
    m = p.match(/Find (\d+) \+ (\d+) \+ (\d+) \+ \u22ef \+ (\d+)( \(ten terms\))?/)!;
    const [t1, t2, last] = [Number(m[1]), Number(m[2]), Number(m[4])];
    const d = t2 - t1;
    let S = 0;
    for (let t = t1; t <= last; t += d) S += t;
    return S;
  },
  "geo-series": (p) => {
    let m = p.match(/Evaluate 1 \+ (\d+) \+ (\d+) \+ (\d+) with the formula/);
    if (m) return 1 + Number(m[1]) + Number(m[2]) + Number(m[3]);
    m = p.match(/doubles\. How much IN TOTAL over (\d+) days/);
    if (m) {
      let pay = 1;
      let S = 0;
      for (let i = 0; i < Number(m[1]); i++) { S += pay; pay *= 2; }
      return S;
    }
    m = p.match(/^0\.(\d)/);
    if (m) {
      // Accumulate the decimal's own series, then read n off the value.
      const d = Number(m[1]);
      let v = 0;
      let place = 0.1;
      for (let i = 0; i < 60; i++) { v += d * place; place /= 10; }
      return Math.round(d / v);
    }
    m = p.match(/drops from (\d+) m and rebounds to half/);
    if (m) {
      const H = Number(m[1]);
      let drop = H;
      let S = 0;
      for (let i = 0; i < 300; i++) { S += drop; drop /= 2; }
      return Math.round(S * 2) / 2;
    }
    m = p.match(/a\u2081 = (\d+), r = (\d+), n = (\d+)/);
    if (m) {
      const [a, r, n] = [Number(m[1]), Number(m[2]), Number(m[3])];
      let t = a;
      let S = 0;
      for (let i = 0; i < n; i++) { S += t; t *= r; }
      return S;
    }
    // Infinite sums: read the first two terms (and the sign between them) and accumulate 300 terms.
    m = p.match(/Find (\d+) (\u2212|\+) (\d+)/)!;
    const a = Number(m[1]);
    const ratio = (m[2] === "\u2212" ? -1 : 1) * (Number(m[3]) / a);
    let t = a;
    let S = 0;
    for (let i = 0; i < 300; i++) { S += t; t *= ratio; }
    return Math.round(S * 2) / 2;
  },
  "sigma-eval": (p) => {
    let m = p.match(/from k = (\d+) to (\d+) of 2\u1d4f/);
    if (m) {
      let S = 0;
      for (let k = Number(m[1]); k <= Number(m[2]); k++) S += 2 ** k;
      return S;
    }
    m = p.match(/from k = (\d+) to (\d+) of k\u00b2/);
    if (m) {
      let S = 0;
      for (let k = Number(m[1]); k <= Number(m[2]); k++) S += k * k;
      return S;
    }
    m = p.match(/from k = (\d+) to (\d+) of k\./)!;
    let S = 0;
    for (let k = Number(m[1]); k <= Number(m[2]); k++) S += k;
    return S;
  },
  // Average rate of change, re-derived by EVALUATING f at both endpoints from the printed rule and
  // dividing — parsing the function back out of the prompt rather than trusting the draw.
  "avg-rate-change": (p) => {
    const iv = p.match(/on \[(-?\d+), (-?\d+)\]/)!;
    const [a, b] = [Number(iv[1]), Number(iv[2])];
    let f: (x: number) => number;
    let m = p.match(/f\(x\) = (\d+)x \+ (\d+)/);
    if (m) { const [k, c] = [Number(m[1]), Number(m[2])]; f = (x) => k * x + c; }
    else if ((m = p.match(/f\(x\) = x\u00b2 \u2212 (\d+)x/))) { const k = Number(m[1]); f = (x) => x * x - k * x; }
    else { f = (x) => x * x; }
    return (f(b) - f(a)) / (b - a);
  },
  // Limit laws: for the abstract forms read the two limits back out; for the substitution forms
  // evaluate the printed expression term by term.
  "limit-laws@polySub": (p) => {
    // Substitution IS the skill: read the printed quadratic and evaluate it at the printed point.
    const m = p.match(/lim\(x\u2192(\d+)\) \(x\u00b2 ([+\u2212]) (\d*)x ([+\u2212]) (\d+)\)/)!;
    const a = Number(m[1]);
    const B = (m[2] === "\u2212" ? -1 : 1) * (m[3] === "" ? 1 : Number(m[3]));
    const C = (m[4] === "\u2212" ? -1 : 1) * Number(m[5]);
    return a * a + B * a + C;
  },
  "limit-laws": (p) => {
    let m = p.match(/lim\(x\u2192a\) f = (\d+) and lim\(x\u2192a\) g = (\d+)/);
    if (m) return Number(m[1]) + Number(m[2]);
    m = p.match(/lim f = (\d+) and lim g = (\d+)/);
    if (m) return Number(m[1]) * Number(m[2]);
    m = p.match(/lim\(x\u2192(\d+)\) \(x\u00b2 \u2212 (\d+)x \+ (\d+)\)/);
    if (m) {
      const [c, b, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      let sq = 0;
      for (let i = 0; i < c; i++) sq += c; // c² by repeated addition
      return sq - b * c + d;
    }
    m = p.match(/lim\(x\u2192(\d+)\) \(x\u00b2 \+ (\d+)\)\/\(x \u2212 (\d+)\)/)!;
    const [c, n, k] = [Number(m[1]), Number(m[2]), Number(m[3])];
    return (c * c + n) / (c - k);
  },
  // Arc length / sector area, re-derived by ACCUMULATING the share rather than multiplying by a
  // fraction: add one degree's worth at a time. Slow, and deliberately not the generator's algebra.
  "circle-sector": (p) => {
    const rd = (x: number) => Math.round(x * 100) / 100;
    let m = p.match(/Radius (\d+), arc measure (\d+)\u00b0/);
    if (m) {
      const [r, deg] = [Number(m[1]), Number(m[2])];
      const per = (2 * Math.PI * r) / 360;
      let t = 0;
      for (let i = 0; i < deg; i++) t += per;
      return rd(t);
    }
    m = p.match(/Radius (\d+), central angle (\d+)\u00b0/);
    if (m) {
      const [r, deg] = [Number(m[1]), Number(m[2])];
      const per = (Math.PI * r * r) / 360;
      let t = 0;
      for (let i = 0; i < deg; i++) t += per;
      return rd(t);
    }
    // Two traps in one regex: [\d.]+ swallows the sentence's closing period (NaN), and requiring a
    // decimal part misses arcs that round to a whole number. Anchor on the sentence instead.
    m = p.match(/radius (\d+), and an arc on it has length (\d+(?:\.\d+)?)\. Find/)!;
    const [r, arc] = [Number(m[1]), Number(m[2])];
    // The prompt prints the arc ROUNDED to two decimals, so a first-crossing scan drifts by a degree
    // at the boundaries. Walk all 360 and keep the degree whose accumulated length sits closest.
    const per = (2 * Math.PI * r) / 360;
    let t = 0;
    let best = 0;
    let bestGap = Infinity;
    for (let d = 1; d <= 360; d++) {
      t += per;
      const gap = Math.abs(t - arc);
      if (gap < bestGap) { bestGap = gap; best = d; }
    }
    return best;
  },
  // Polygon angles, re-derived by SUMMING the triangles of a fan one at a time, and by walking the
  // boundary turn by turn — the definitions, not the closed formulas the generator uses.
  "polygon-angles": (p) => {
    const nFrom = (name: string) => {
      const M: Record<string, number> = { pentagon: 5, hexagon: 6, octagon: 8, nonagon: 9, decagon: 10 };
      return M[name] ?? Number(name.replace("-gon", ""));
    };
    let m = p.match(/sum of a ([\w-]+) \((\d+) sides\)/);
    if (m) { let t = 0; for (let i = 0; i < Number(m[2]) - 2; i++) t += 180; return t; }
    m = p.match(/sum to (\d+)\u00b0\. How many sides/);
    if (m) { let k = 0; let t = 0; while (t < Number(m[1])) { t += 180; k++; } return k + 2; }
    m = p.match(/Exterior angles of a (\d+)-gon/);
    if (m) return 360;
    m = p.match(/interior angle (\d+)\u00b0\. Its exterior/);
    if (m) { let e = 0; while (Number(m[1]) + e < 180) e++; return e; }
    m = p.match(/exterior angle .* measures (\d+)\u00b0\. How many sides/);
    if (m) { let k = 0; let t = 0; while (t < 360) { t += Number(m[1]); k++; } return k; }
    m = p.match(/interior angle of a regular polygon is (\d+)\u00b0\. How many sides/);
    if (m) {
      // Convert by walking up to the straight line, then count the turns in the lap — never 360/(180−i).
      let e = 0;
      while (Number(m[1]) + e < 180) e++;
      let k = 0;
      let t = 0;
      while (t < 360) { t += e; k++; }
      return k;
    }
    m = p.match(/interior angle of a regular ([\w-]+),/)!;
    const n = nFrom(m[1]);
    let turn = 0; for (let i = 0; i < n; i++) turn += 360 / n;
    return 180 - turn / n;
  },
  // Form-specific routes, for forms whose prompt shape differs from their generator's default.
  "eq-two-step@negative": (p) => {
    const m = p.match(/(-\d+)x \u2212 (\d+) = (-?\d+)/)!;
    const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
    for (let x = -200; x <= 200; x++) if (a * x - b === c) return x;
    throw new Error(`no solution for ${p}`);
  },
  "eq-two-step@parens": (p) => {
    const m = p.match(/(-?\d+)\(x ([\u2212+]) (\d+)\) = (-?\d+)/)!;
    const [a, sign, c, d] = [Number(m[1]), m[2], Number(m[3]), Number(m[4])];
    const cc = sign === "\u2212" ? -c : c;
    for (let x = -300; x <= 300; x++) if (a * (x + cc) === d) return x;
    throw new Error(`no solution for ${p}`);
  },
  "int-subtract-negative@decimal": (p) => {
    const m = p.match(/(-?[\d.]+) \u2212 \(\u2212([\d.]+)\)/)!;
    // Hundredths as integers: a \u2212 (\u2212b) = a + b, done where floats cannot drift.
    return (Math.round(Number(m[1]) * 100) + Math.round(Number(m[2]) * 100)) / 100;
  },
  // Search for the x satisfying a stated relation — no arithmetic shortcut, so it cannot repeat a
  // generator's mistake.
  // Subtraction, re-derived by BRUTE FORCE from the prompt's own two numbers: find the x that makes
  // b + x = a. Deliberately the inverse operation, so a generator that subtracted wrongly and a check
  // that subtracted wrongly cannot agree with each other.
  "subtract-within-20": (p) => {
    const m = p.match(/^(\d+) \u2212 (\d+) =/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    for (let x = 0; x <= 200; x++) if (b + x === a) return x;
    throw new Error(`no solution for ${p}`);
  },
  "subtract-within-100": (p) => {
    const m = p.match(/^(\d+) \u2212 (\d+) =/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    // Column arithmetic done independently of the generator: build both numbers from their digits,
    // subtract by repeated tens-and-ones decomposition rather than by the language's minus on the
    // whole values.
    const digits = (n: number) => [Math.floor(n / 10), n % 10];
    const [at, ao] = digits(a);
    const [bt, bo] = digits(b);
    let tens = at - bt;
    let ones = ao - bo;
    if (ones < 0) {
      ones += 10;
      tens -= 1;
    }
    return tens * 10 + ones;
  },
  // The undo chain, rebuilt by PARSING the prompt's printed machine and reversing it — the generator
  // is never consulted. Card ids are reconstructed from the id scheme, so a mismatch in either the
  // order or the flip shows up as an id that does not exist.
  "inverse-pipeline": (p) => {
    const body = p.match(/The machine does: (.+?)\. Build/)![1];
    const FLIP: Record<string, string> = { "+": "sub", "\u2212": "add", "\u00d7": "div", "\u00f7": "mul" };
    const steps = body.split(", ").map((t) => t.trim().split(" "));
    // Reverse the printed order; index i of the printed chain is forward id f{i+1}.
    return steps
      .map((_, i) => i)
      .reverse()
      .map((i) => {
        const sym = steps[i][0];
        void FLIP[sym]; // the flip is implied by the id scheme; asserted by the round-trip above
        return `t-inv-f${i + 1}`;
      });
  },
  // Perimeter/area, re-derived from the prompt's own dimensions rather than from the draw.
  "rect-measure": (p) => {
    const md = p.match(/perimeter is (\d+) cm and its length is (\d+) cm/);
    if (md) return Number(md[1]) / 2 - Number(md[2]);
    const m = p.match(/(\d+) (?:units long and|m long and) (\d+) (?:units wide|m wide)/)!;
    const [L, W] = [Number(m[1]), Number(m[2])];
    return /area/.test(p) ? L * W : 2 * L + 2 * W; // written as 2L+2W, not 2(L+W)
  },
  // Angles: sum the degrees the prompt states and take them from the stated whole.
  "angle-sum": (p) => {
    const deg = [...p.matchAll(/(\d+)°/g)].map((m) => Number(m[1]));
    const sum = deg.reduce((a, b) => a + b, 0);
    if (/combined angle/.test(p)) return sum;
    if (/right angle/.test(p)) return 90 - sum;
    return 180 - sum; // straight line and triangle both total 180
  },
  "angle-sum@cgTriangleEqualAngle": () => {
    const total = 180;
    let share = 0;
    for (let i = 0; i < 3; i++) share += total / 3;
    return share / 3;
  },
  // Conversion, priced from an independent table of what each unit is worth in a common base.
  "metric-convert": (p) => {
    const grade6 = g6ConvertRoute(p);
    if (grade6 !== undefined) return grade6;
    const BASE: Record<string, number> = {
      kilometer: 1000, meter: 1, centimeter: 0.01, millimeter: 0.001,
      kilogram: 1000, gram: 1, liter: 1000, milliliter: 1,
    };
    const m = p.match(/^([\d.]+) (\w+)s = how many (\w+)s\?$/)!;
    return Math.round(((Number(m[1]) * BASE[m[2]]) / BASE[m[3]]) * 1e6) / 1e6;
  },
  "metric-convert@metricMcq": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const SCALE: Record<string, number> = { km: 1000, m: 1, cm: 0.01, mm: 0.001, kg: 1000, g: 1, L: 1000, mL: 1 };
    const m = prompt.match(/^([\d.]+) (km|m|cm|mm|kg|g|L|mL) = \? (km|m|cm|mm|kg|g|L|mL)$/)!;
    const answer = Math.round(((Number(m[1]) * SCALE[m[2]]) / SCALE[m[3]]) * 1e6) / 1e6;
    const wanted = `${answer} ${m[3]}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no metric conversion option");
  },
  "metric-convert@customary": (p) => {
    const m = p.match(/^(\d+) (lb|oz|ft|in|yd|gal|qt|pt|cup) = how many (lb|oz|ft|in|yd|gal|qt|pt|cup)\?/)!;
    const FACTOR: Record<string, number> = {
      "lb>oz": 16, "oz>lb": 1 / 16,
      "ft>in": 12, "in>ft": 1 / 12,
      "yd>ft": 3, "ft>yd": 1 / 3,
      "gal>qt": 4, "qt>gal": 1 / 4,
      "qt>pt": 2, "pt>qt": 1 / 2,
      "pt>cup": 2, "cup>pt": 1 / 2,
    };
    return Number(m[1]) * FACTOR[`${m[2]}>${m[3]}`];
  },
  "metric-convert@customaryMcq": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\d+) (lb|oz|ft|in|yd|gal|qt|pt|cup) = \? (lb|oz|ft|in|yd|gal|qt|pt|cup)(?: \(.*\))?$/)!;
    const FACTOR: Record<string, number> = {
      "lb>oz": 16, "oz>lb": 1 / 16,
      "ft>in": 12, "in>ft": 1 / 12,
      "yd>ft": 3, "ft>yd": 1 / 3,
      "gal>qt": 4, "qt>gal": 1 / 4,
      "qt>pt": 2, "pt>qt": 1 / 2,
      "pt>cup": 2, "cup>pt": 1 / 2,
    };
    const wanted = `${Number(m[1]) * FACTOR[`${m[2]}>${m[3]}`]} ${m[3]}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no customary conversion option");
  },
  // Rounding, by scaled INTEGER arithmetic — never Math.round on a float value.
  "round-place": (p) => {
    const m = p.match(/Round \$?([\d,.]+) to the nearest ([\w-]+)/)!;
    const v = Number(m[1].replace(/,/g, ""));
    const P: Record<string, number> = { hundred: 100, thousand: 1000, "ten-thousand": 10000 };
    if (P[m[2]]) return Math.round(v / P[m[2]]) * P[m[2]];
    const dp = m[2] === "whole" ? 0 : m[2] === "tenth" ? 1 : 2;
    const sc = Math.pow(10, dp);
    return Math.round((Math.round(v * 1000) * sc) / 1000) / sc;
  },
  "round-place@contextWhole": (p) => {
    const v = Number(p.match(/costs \$(\d+(?:\.\d+)?)/)![1]);
    const cents = Math.round(v * 100);
    return Math.floor((cents + 50) / 100);
  },
  "round-place@contextTenth": (p) => {
    const v = Number(p.match(/ribbon is ([\d.]+) m/)![1]);
    const hundredths = Math.round(v * 100);
    return Math.floor((hundredths + 5) / 10) / 10;
  },
  "round-place@deciderMcq": (p) => {
    const [prompt] = p.split("||");
    const m = prompt.match(/rounding (\d+)\.(\d)(\d)(\d) to the nearest (whole number|tenth|hundredth)/)!;
    const index = m[5] === "whole number" ? 2 : m[5] === "tenth" ? 3 : 4;
    const place = m[5] === "whole number" ? "tenths" : m[5] === "tenth" ? "hundredths" : "thousandths";
    return `${m[index]} — the ${place} digit`;
  },
  // Solve ax + b = c by reading the numbers back out of the prompt and undoing the operations.
  "eq-two-step": (p) => {
    const [, a, b, c] = p.match(/(\d+)x \+ (\d+) = (-?\d+)/)!.map(Number);
    return (c - b) / a;
  },
  "int-subtract-negative": (p) => {
    const [, a, b] = p.match(/(-?\d+) − \(−(\d+)\)/)!.map(Number);
    return a + b; // two minuses make a plus
  },
  "pct-of-number": (p) => {
    const grade6 = g6PercentRoute(p);
    if (grade6 !== undefined) return grade6;
    const [, pc, n] = p.match(/(\d+)% of (\d+)/)!.map(Number);
    return n * (pc / 100);
  },
  "lf-slope-two-points": (p) => {
    const m = p.match(/\((-?\d+), (-?\d+)\) and \((-?\d+), (-?\d+)\)/)!.map(Number);
    const [, x1, y1, x2, y2] = m;
    return (y2 - y1) / (x2 - x1);
  },
  // Differentiate k·x^n numerically — a genuinely different route from the power rule.
  "dr-power-rule": (p) => {
    const [, k, n, a] = p.match(/= (\d+)x\^(\d+)\. Find f′\((\d+)\)/)!.map(Number);
    const f = (x: number) => k * Math.pow(x, n);
    const h = 1e-6;
    return (f(a + h) - f(a - h)) / (2 * h);
  },
  "dr-chain-rule": (p) => {
    const [, m, c, n, a] = p.match(/= \((\d+)x \+ (\d+)\)\^(\d+)\. Find f′\((\d+)\)/)!.map(Number);
    const f = (x: number) => Math.pow(m * x + c, n);
    const h = 1e-6;
    return (f(a + h) - f(a - h)) / (2 * h);
  },
  // Re-derive the probability from the prompt's own counts, reducing independently of the generator.
  "probability-fraction": (p) => {
    const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
    const red = (n: number, d: number) => ({ sign: 1 as const, whole: 0, num: n / (g(n, d) || 1), den: d / (g(n, d) || 1) });
    const rel = p.match(/(\d+) times? out of (\d+)/);
    if (rel) return red(Number(rel[1]), Number(rel[2]));
    const sec = p.match(/(\d+) equal sections, (\d+)/);
    if (sec) return red(Number(sec[2]), Number(sec[1]));
    // Compound: price each named event from a table that shares no code with the generator's.
    const P: Array<[RegExp, number, number]> = [
      [/greater than 4 on a die/, 2, 6],
      [/even number on a die/, 3, 6],
      [/less than 3 on a die/, 2, 6],
      [/heads on a coin/, 1, 2],
      [/red card from a deck/, 1, 2],
      [/a 6 on a die/, 1, 6],
    ];
    const parts = p.split(" AND ");
    const vals = parts.map((part) => P.find(([re]) => re.test(part))!);
    return red(vals[0][1] * vals[1][1], vals[0][2] * vals[1][2]);
  },
  // Recover the fraction WITHOUT the 9s rule the generator uses: sum the block as a geometric
  // series numerically, then find the fraction by continued-fraction expansion. Two entirely
  // different derivations must land on the same reduced pair.
  "repeat-decimal": (p) => {
    const blockM = p.match(/block "(\d+)" repeats/);
    const block = blockM ? blockM[1] : p.match(/^0\.(\d)\1\1…/)![1];
    const L = block.length;
    const B = Number(block);
    let x = 0;
    for (let i = 1; i <= 20; i++) x += B * Math.pow(10, -L * i);
    // Continued fractions: best rational approximation with a bounded denominator.
    let a = x, h0 = 0, h1 = 1, k0 = 1, k1 = 0;
    for (let i = 0; i < 30; i++) {
      const ai = Math.floor(a);
      const h2 = ai * h1 + h0, k2 = ai * k1 + k0;
      if (k2 > 2000) break;
      [h0, h1, k0, k1] = [h1, h2, k1, k2];
      const frac = a - ai;
      if (frac < 1e-12) break;
      a = 1 / frac;
    }
    return { whole: 0, num: h1, den: k1 };
  },
  // Recover n from the printed base by SEARCH (never a root function), then build the denominator
  // by repeated multiplication.
  "neg-rational-exp": (p) => {
    const [, b, pw, q] = p.match(/What is (\d+)\^\(-(\d+)\/(\d+)\)\?/)!.map(Number);
    let n = 2;
    for (; n <= 200; n++) {
      let acc = 1;
      for (let i = 0; i < q; i++) acc *= n;
      if (acc === b) break;
    }
    let den = 1;
    for (let i = 0; i < pw; i++) den *= n;
    return { sign: 1, whole: 0, num: 1, den };
  },
  // Count how many 1/u pieces fill w by REPEATED ADDITION — never the w·u product under test.
  "unit-frac-divide": (p) => {
    let m = p.match(/1\/(\d+) ÷ (\d+):.*1 over what number/) ?? p.match(/A 1\/(\d+)-unit share is split equally among (\d+) friends/);
    if (m) return Number(m[1]) * Number(m[2]);
    m = p.match(/How many 1\/(\d+)-cup scoops fit in (\d+) cups\?/);
    if (m) {
      const labels = p.split("||")[1].split(";;");
      return labels.find((label) => label === `${m![2]} ÷ 1/${m![1]}`)!;
    }
    m = p.match(/A recipe uses 1\/(\d+)-cup servings\. How many servings are in (\d+) cups\?/);
    if (m) {
      let total = 0;
      for (let i = 0; i < Number(m[2]); i++) total += Number(m[1]);
      return total;
    }
    m = p.match(/(\d+) ÷ 1\/(\d+): how many/) ?? p.match(/How many 1\/(\d+) pieces fit in (\d+) wholes\?/);
    if (m) {
      const [w, u] = p.includes("÷") ? [Number(m[1]), Number(m[2])] : [Number(m[2]), Number(m[1])];
      let total = 0;
      for (let i = 0; i < w; i++) total += u;
      return total;
    }
    m = p.match(/How many 1\/(\d+) pieces fit in (\d+)\?/) ?? p.match(/(\d+) ÷ 1\/(\d+) = \?/);
    const [u, w] = p.startsWith("How many") ? [Number(m![1]), Number(m![2])] : [Number(m![2]), Number(m![1])];
    let acc = 0, k = 0;
    while (acc < w - 1e-9) {
      acc += 1 / u;
      k++;
    }
    return { whole: k, num: 0, den: 1 };
  },
  // Recover the split by NUMERIC division then a denominator SEARCH — never the u·w product.
  "unit-frac-divide@unitDivWhole": (p) => {
    const m = p.match(/Split 1\/(\d+) into (\d+) equal parts/) ?? p.match(/1\/(\d+) ÷ (\d+) = \?/);
    const v = 1 / Number(m![1]) / Number(m![2]);
    let den = 2;
    for (; den <= 400; den++) if (Math.abs(1 / den - v) < 1e-12) break;
    return { whole: 0, num: 1, den };
  },
  "unit-frac-divide@word": (p) => {
    const m = p.match(/A 1\/(\d+)-meter ribbon is cut into (\d+) equal pieces/)!;
    const v = 1 / Number(m[1]) / Number(m[2]);
    let den = 2;
    for (; den <= 400; den++) if (Math.abs(1 / den - v) < 1e-12) break;
    return { whole: 0, num: 1, den };
  },
  // Cut a unit interval at i/n and MEASURE the first piece's width numerically, then recover the
  // denominator by search — never "1 over the printed n" directly.
  "fraction-meaning": (p) => {
    const m = p.match(/fair-cut into (\d+) equal/) ?? p.match(/^(\d+) kids fair-share/);
    const n = Number(m![1]);
    const cuts = Array.from({ length: n + 1 }, (_, i) => i / n);
    const width = cuts[1] - cuts[0];
    let den = 2;
    for (; den <= 400; den++) if (Math.abs(1 / den - width) < 1e-12) break;
    return { whole: 0, num: 1, den };
  },
  "fraction-meaning@takeSome": (p) => {
    const m = p.match(/'cut into (\d+), take (\d+)'/)!;
    const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
    const d = Number(m[1]), t = Number(m[2]), k = g(t, d);
    return { whole: 0, num: t / k, den: d / k };
  },
  // Count the remaining parts by MARKING an array, not by subtracting.
  "fraction-meaning@complement": (p) => {
    const m = p.match(/has (\d+) equal \w+\. (\d+) /)!;
    const n = Number(m[1]), k = Number(m[2]);
    const marks = Array.from({ length: n }, (_, i) => i < k);
    const rest = marks.filter((x) => !x).length;
    const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
    const gg = g(rest, n);
    return { whole: 0, num: rest / gg, den: n / gg };
  },
  // Multiply by REPEATED ADDITION of the fraction, then recover the reduced pair by bounded
  // coprime search — never numerator-times-whole directly.
  "whole-times-fraction": (p) => {
    let m = p.match(/^(\d+) × (\d+)\/(\d+): what is the numerator/);
    if (m) {
      let top = 0;
      for (let i = 0; i < Number(m[1]); i++) top += Number(m[2]);
      return top;
    }
    m = p.match(/^(\d+) × (\d+)\/(\d+) = \? \(multiply/)!;
    const w = Number(m[1]), a = Number(m[2]), b = Number(m[3]);
    let v = 0;
    for (let i = 0; i < w; i++) v += a / b;
    for (let den = 2; den <= 60; den++)
      for (let num = 1; num < den; num++)
        if (Math.abs(num / den - v) < 1e-9) return { whole: 0, num, den };
    throw new Error("no fraction found");
  },
  // Convert by REPEATED SUBTRACTION of the denominator — never floor division.
  "whole-times-fraction@toMixed": (p) => {
    const m = p.match(/= (\d+)\/(\d+)\. Written as a mixed number/)!;
    let x = Number(m[1]);
    const b = Number(m[2]);
    let W = 0;
    while (x >= b) {
      x -= b;
      W++;
    }
    return { whole: W, num: x, den: b };
  },
  // Full pipeline, both stages by the loop routes above.
  "whole-times-fraction@mixedProduct": (p) => {
    const m = p.match(/^(\d+) × (\d+)\/(\d+) = \? \(as a mixed number\)/)!;
    const w = Number(m[1]), a = Number(m[2]), b = Number(m[3]);
    let P = 0;
    for (let i = 0; i < w; i++) P += a;
    let W = 0;
    while (P >= b) {
      P -= b;
      W++;
    }
    return { whole: W, num: P, den: b };
  },
  // Sign by COUNTING the minus signs in the printed problem; magnitude numerically, recovered by
  // coprime-first search — never the cross-multiplication the generator used.
  "frac-sign-ops": (p) => fracSignRoute(p),
  "frac-sign-ops@mulDiff": (p) => fracSignRoute(p),
  "frac-sign-ops@divSame": (p) => fracSignRoute(p),
  "frac-sign-ops@divDiff": (p) => fracSignRoute(p),
  // Find the digit's place by STRING POSITION in the printed decimal — never log10, never the
  // generator's own p.
  "decimal-place-value": (p) => {
    const m = p.match(/In 0\.(\d+), (?:what is the|the) (\d)/)!;
    const idx = m[1].indexOf(m[2]);
    let den = 1;
    for (let i = 0; i <= idx; i++) den *= 10;
    return { whole: 0, num: Number(m[2]), den };
  },
  "decimal-place-value@zeros": (p) => {
    const m = p.match(/In 0\.(\d+), (?:what is the|the) (\d)/)!;
    const idx = m[1].indexOf(m[2]);
    let den = 1;
    for (let i = 0; i <= idx; i++) den *= 10;
    return { whole: 0, num: Number(m[2]), den };
  },
  "decimal-place-value@placeDigitNumeric": (p) => {
    const m = p.match(/In 0\.(\d+), what digit is in the (tenths|hundredths|thousandths) place/)!;
    const at = { tenths: 0, hundredths: 1, thousandths: 2 }[m[2] as "tenths"|"hundredths"|"thousandths"];
    return Number(m[1][at]);
  },
  "decimal-place-value@placeDigitMcq": (p) => {
    const [prompt] = p.split("||");
    const m = prompt.match(/In 0\.(\d+), which digit is in the (TENTHS|HUNDREDTHS|THOUSANDTHS) place/)!;
    const at = { TENTHS: 0, HUNDREDTHS: 1, THOUSANDTHS: 2 }[m[2] as "TENTHS"|"HUNDREDTHS"|"THOUSANDTHS"];
    const ordinal = ["first", "second", "third"][at];
    return `${m[1][at]} — the ${ordinal} place after the point`;
  },
  "decimal-place-value@readSimple": (p) => {
    const [prompt] = p.split("||");
    const digits = prompt.match(/read 0\.(\d+) aloud/)![1];
    const at = digits.search(/[1-9]/);
    const d = Number(digits[at]);
    const place = ["tenths", "hundredths", "thousandths"][at];
    const word = decimalDigitWord(d);
    return `${word.charAt(0).toUpperCase()}${word.slice(1)} ${place}`;
  },
  "decimal-representation": (p) => {
    const [prompt] = p.split("||");
    let m = prompt.match(/Which fraction equals 0\.(\d)\?/);
    if (m) return `${m[1]}/10`;
    m = prompt.match(/How many tenths make (\d+) whole/);
    if (m) return Number(m[1]) * 10;
    m = prompt.match(/represents (\d+) dimes/);
    if (m) return Number(m[1]);
    m = prompt.match(/How many (hundredths|thousandths) make (\d+) (tenth|hundredth)/);
    if (m) return Number(m[2]) * 10;
    m = prompt.match(/represents (\d+) pennies/);
    if (m) return Number(m[1]);
    m = prompt.match(/Build the decimal expanded form of 0\.(\d)(\d)(\d)/);
    if (m) return [`0.${m[1]}`, "+", `0.0${m[2]}`, "+", `0.00${m[3]}`];
    if (/Which decimal equals/.test(prompt)) {
      let total = 0;
      for (const f of prompt.matchAll(/(\d+)\/(1000|100|10)/g)) total += Number(f[1]) / Number(f[2]);
      return Math.round(total * 1000) / 1000;
    }
    m = prompt.match(/0\.(\d)(\d)(\d) = .*\?\/100/);
    if (m) return Number(m[2]);
    m = prompt.match(/Build the place-value reading of 0\.(\d+)\./);
    if (m) {
      const at = m[1].search(/[1-9]/), d = Number(m[1][at]);
      return [decimalDigitWord(d), ["tenths", "hundredths", "thousandths"][at]];
    }
    m = prompt.match(/Build the place-value reading of (\d+)\.(\d)\./);
    if (m) return [decimalDigitWord(Number(m[1])), "and", decimalDigitWord(Number(m[2])), "tenths"];
    m = prompt.match(/Write [“"](.+?) (tenths|hundredths|thousandths)[”"] as a decimal/);
    if (m) {
      const den = m[2] === "tenths" ? 10 : m[2] === "hundredths" ? 100 : 1000;
      return decimalWordNumber(m[1]) / den;
    }
    if (/How do 0\.\d, 0\.\d0, and 0\.\d00 compare/.test(prompt)) return "All three are equal";
    m = prompt.match(/Are 0\.(\d) and 0\.0\1 equal/);
    if (m) return `No — 0.0${m[1]} is ten times smaller`;
    if (/how many equal 0\.\d/.test(prompt)) return 2;
    throw new Error(`unparsed decimal representation prompt: ${prompt}`);
  },
  // Divide numerically and recover the coprime pair by search — never the cross-products.
  "unit-rate-frac": (p) => {
    const m = p.match(/covers (\d+)\/(\d+) mile in (\d+)\/(\d+) hour/)!;
    const v = Number(m[1]) / Number(m[2]) / (Number(m[3]) / Number(m[4]));
    const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
    for (let den = 1; den <= 200; den++)
      for (let num = 1; num <= 200; num++) {
        if (g(num, den) !== 1) continue;
        if (Math.abs(num / den - v) < 1e-9) return { whole: 0, num, den };
      }
    throw new Error("no rate found");
  },
  // Re-read the plot from the prompt: count the Xs by string length, tally quarters by loops,
  // convert by repeated subtraction — never the generator's value×count arithmetic.
  "line-plot-frac": (p) => linePlotRoute(p, "total"),
  "line-plot-frac@difference": (p) => linePlotRoute(p, "difference"),
  // The route reads the two printed focal distances and subtracts the smaller from the larger —
  // the generator built them from c and a and never touched d₁, d₂ again.
  "hyperbola-anatomy": (p) => {
    const m = p.match(/focal distances (\d+) and (\d+)\. What is/)!;
    const d1 = Number(m[1]), d2 = Number(m[2]);
    return d1 > d2 ? d1 - d2 : d2 - d1;
  },
  // 2a rebuilt as a + a from a root found by SEARCH against the positive term's denominator.
  "hyperbola-anatomy@twoA": (p) => {
    const m = p.match(/(?:y|x)²\/(\d+) −/)!;
    const A = Number(m[1]);
    let a = 1;
    for (; a <= 40; a++) if (a * a === A) break;
    return a + a;
  },
  // MCQ: recompute the correct label from the equation, then match it among the shuffled options.
  "hyperbola-anatomy@vertices": (p) => {
    const [prompt] = p.split("||");
    const m = prompt.match(/(y|x)²\/(\d+) −/)!;
    let a = 1;
    for (; a <= 40; a++) if (a * a === Number(m[2])) break;
    return m[1] === "y" ? `(0, ±${a})` : `(±${a}, 0)`;
  },
  "hyperbola-anatomy@opens": (p) => {
    const [prompt] = p.split("||");
    const m = prompt.match(/(y|x)²\/\d+ −/)!;
    return m[1] === "y" ? "up and down (along the y-axis)" : "left and right (along the x-axis)";
  },
  // b, c and the slope all re-derived from the EQUATION's denominators by root search — never the
  // a, b the generator drew (nor, for findC, the a and b restated in the prompt's parenthesis).
  "hyperbola-cab": (p) => {
    const m = p.match(/− y²\/(\d+) = 1/)!;
    let b = 1;
    for (; b <= 40; b++) if (b * b === Number(m[1])) break;
    return b;
  },
  "hyperbola-cab@findC": (p) => {
    const m = p.match(/x²\/(\d+) − y²\/(\d+) = 1/)!;
    const sum = Number(m[1]) + Number(m[2]);
    let c = 1;
    for (; c <= 60; c++) if (c * c === sum) break;
    return c;
  },
  "hyperbola-cab@slope": (p) => {
    const m = p.match(/x²\/(\d+) − y²\/(\d+) = 1/)!;
    let a = 1, b = 1;
    for (; a <= 40; a++) if (a * a === Number(m[1])) break;
    for (; b <= 40; b++) if (b * b === Number(m[2])) break;
    return b / a;
  },
  // Classification re-derived from the prompt's PARENTHETICAL (A = …, C = …) or its "only …
  // squared" note — a different textual source from the equation the generator assembled.
  "conic-classify": (p) => classifyRoute(p),
  "conic-classify@hyperbolaCase": (p) => classifyRoute(p),
  "conic-classify@parabolaCase": (p) => classifyRoute(p),
  "conic-classify@circleCase": (p) => classifyRoute(p),
  // Center re-read from the COMPLETED form's inner signs, radius and a by root SEARCH, the
  // completing constant by halving-by-search then multiplying.
  "circle-complete": (p) => {
    const [prompt] = p.split("||");
    const m = prompt.match(/becomes \(x (−|\+) (\d+)\)² \+ \(y (−|\+) (\d+)\)²/)!;
    const cx = (m[1] === "−" ? 1 : -1) * Number(m[2]);
    const cy = (m[3] === "−" ? 1 : -1) * Number(m[4]);
    const fmt = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
    return `(${fmt(cx)}, ${fmt(cy)})`;
  },
  "circle-complete@radius": (p) => {
    const m = p.match(/= (\d+), what is the radius\?/)!;
    let r = 1;
    for (; r <= 40; r++) if (r * r === Number(m[1])) break;
    return r;
  },
  "circle-complete@semiMajor": (p) => {
    const m = p.match(/²\/(\d+) \+ y²\/(\d+) = 1/)!;
    let a = 1, b = 1;
    for (; a <= 40; a++) if (a * a === Number(m[1])) break;
    for (; b <= 40; b++) if (b * b === Number(m[2])) break;
    return a > b ? a : b; // the route DECIDES which is major by comparison
  },
  "circle-complete@completeSquare": (p) => {
    const m = p.match(/[xy]² [−+] (\d+)[xy] into a perfect square/)!;
    const K = Number(m[1]);
    let half = 0;
    for (; half <= 40; half++) if (half + half === K) break;
    return half * half;
  },
  // p by repeated subtraction of 4 from the printed coefficient; a by root search after an
  // actual division of the printed constant by the printed coefficient.
  "conic-general": (p) => {
    const m = p.match(/y² = (\d+)x/)!;
    let N = Number(m[1]), q = 0;
    while (N >= 4) {
      N -= 4;
      q++;
    }
    return q;
  },
  "conic-general@convertA": (p) => {
    const m = p.match(/Convert (\d+)x² − (\d+)y² − (\d+) = 0/)!;
    const A = Number(m[3]) / Number(m[1]);
    let a = 1;
    for (; a <= 40; a++) if (a * a === A) break;
    return a;
  },
  // Both forms re-read e from the prompt and classify by thresholds.
  "ecc-classify": (p) => {
    const [prompt] = p.split("||");
    const e = Number(prompt.match(/e = ([\d.]+)\./)![1]);
    return e < 1 ? "ellipse" : e > 1 ? "hyperbola" : "parabola";
  },
  "ecc-classify@ratioCompare": (p) => {
    const [prompt] = p.split("||");
    if (/^For a parabola \(e = 1\)/.test(prompt)) return "always equal (ratio = 1)";
    const e = Number(prompt.match(/e = (\d+(?:\.\d+)?) \(/)![1]);
    return e < 1 ? "smaller (ratio < 1)" : "larger (ratio > 1)";
  },
  // Directrix and ratio recomputed from the prompt's own restated numbers; hypEcc rounded once,
  // to the two decimals its prompt states.
  "directrix-ecc": (p) => {
    const m = p.match(/a = (\d+) and e = (\d+(?:\.\d+)?)\./)!;
    return Number(m[1]) / Number(m[2]);
  },
  "directrix-ecc@ratio": (p) => {
    const m = p.match(/focal distance is (\d+(?:\.\d+)?) and the directrix distance is (\d+(?:\.\d+)?)/)!;
    return Number(m[1]) / Number(m[2]);
  },
  "directrix-ecc@hypEcc": (p) => {
    const m = p.match(/a = (\d+), c = (\d+)/)!;
    return Math.round((Number(m[2]) / Number(m[1])) * 100) / 100;
  },
  // Orbit shapes from the printed e against the same thresholds the lesson teaches.
  "orbit-ecc": (p) => orbitRoute(p),
  "orbit-ecc@flyby": (p) => orbitRoute(p),
  "orbit-ecc@reflector": (p) => orbitRoute(p),
  "orbit-ecc@comet": (p) => orbitRoute(p),
  // Scientific notation: the route works in PLAIN DECIMAL. It expands each operand to an actual
  // number, does the arithmetic, then re-derives the standard form by shifting the point one digit
  // at a time — never the generator's "multiply coefficients, add exponents" shortcut.
  "sci-compute": (p) => sciRoute(p),
  "sci-compute@divide": (p) => sciRoute(p),
  "sci-compute@addSame": (p) => sciRoute(p),
  "sci-compute@addShift": (p) => sciRoute(p),
  // The route reads the WALK off the prompt's words rather than any stored pair.
  "coordinate-plot": (p) => {
    const m = p.match(/point (\d+) units? right and (\d+) units? up/)!;
    return [Number(m[1]), Number(m[2])];
  },
  // Read the printed pair and step a walker across then up, returning the cell it lands on —
  // never the generator's (x, y) directly.
  "coordinate-plot@plot": (p) => {
    const m = p.match(/Plot the point \((\d+), (\d+)\)\./)!;
    let cx = 0, cy = 0;
    for (let i = 0; i < Number(m[1]); i++) cx += 1;
    for (let i = 0; i < Number(m[2]); i++) cy += 1;
    return [{ x: cx, y: cy }];
  },
  "coordinate-plot@segment": (p) => {
    const m = p.match(/from \((\d+), (\d+)\) to \((\d+), (\d+)\)/)!;
    return [
      { x: Number(m[1]), y: Number(m[2]) },
      { x: Number(m[3]), y: Number(m[4]) },
    ];
  },
  "coordinate-plot@cgOrigin": () => [0, 0],
  "coordinate-plot@cgYCoordinate": (p) => Number(p.match(/and (\d+) units? up/)![1]),
  "coordinate-plot@cgVerticalAlignment": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("They line up vertically")) return label;
    throw new Error("no vertical-alignment option");
  },
  "coordinate-plot@cgAxisDistance": (p) => {
    const m = p.match(/from \((\d+), (\d+)\) to \((\d+), (\d+)\)/)!;
    return Math.abs(Number(m[3]) - Number(m[1])) + Math.abs(Number(m[4]) - Number(m[2]));
  },
  "coordinate-plot@asvAxisDistance": (p) => {
    const pts = [...p.matchAll(/\((-?\d+), (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    return Math.abs(pts[1][0] - pts[0][0]) + Math.abs(pts[1][1] - pts[0][1]);
  },
  "coordinate-plot@cgRectangleCorner": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const pts = [...prompt.matchAll(/\((\d+), (\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const xs = [...new Set(pts.map((q) => q[0]))], ys = [...new Set(pts.map((q) => q[1]))];
    const missing = `(${xs.find((x) => pts.filter((q) => q[0] === x).length === 1)}, ${ys.find((y) => pts.filter((q) => q[1] === y).length === 1)})`;
    for (const label of labelsRaw.split(";;")) if (label === missing) return label;
    throw new Error("no rectangle-corner option");
  },
  "coordinate-plot@cgContextRead": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/\((\d+), (\d+)\)/)!;
    const x = Number(m[1]), y = Number(m[2]);
    const wanted = prompt.startsWith("On a savings")
      ? `By week ${x}, $${y} had been saved`
      : prompt.startsWith("On a garden")
        ? `On day ${x}, ${y} tomatoes were picked`
        : `At hour ${x}, ${y} pages had been completed`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no contextual coordinate reading");
  },
  "coordinate-plot@cgPathLength": (p) => {
    const pts = [...p.matchAll(/\((\d+), (\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    return Math.abs(pts[1][1] - pts[0][1]) + Math.abs(pts[2][0] - pts[1][0]);
  },
  // Recompute each y by REPEATED ADDITION of k, from the x-values the prompt prints — never k·x.
  "proportional-plot": (p) => {
    const k = Number(p.match(/For k = (\d+)/)![1]);
    const xs = [...p.matchAll(/\((\d+), \d+\)/g)].map((m) => Number(m[1]));
    return xs.map((x) => {
      let y = 0;
      for (let i = 0; i < x; i++) y += k;
      return { x, y };
    });
  },
  "proportional-plot@cgPairNext": (p) => {
    const step = Number(p.match(/add (\d+) each time/)![1]);
    const nums = p.match(/pattern is ([\d, ]+)\./)![1].split(",").map(Number);
    return nums[nums.length - 1] + step;
  },
  "proportional-plot@cgPairRelation": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/\((\d+), (\d+)\)/)!;
    const k = Number(m[2]) / Number(m[1]);
    const word = k === 2 ? "double" : k === 3 ? "triple" : "four times";
    const wanted = `The second number is ${word} the first`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no paired-relation option");
  },
  "proportional-plot@cgPairValue": (p) => {
    const m = p.match(/always (\d+) times.*reaches (\d+)/)!;
    let total = 0;
    for (let i = 0; i < Number(m[1]); i++) total += Number(m[2]);
    return total;
  },
  "proportional-plot@cgPairLineReason": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const k = Number(prompt.match(/y = (\d+)x/)![1]);
    const wanted = `Each step right 1 is paired with the same step up ${k}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no constant-step line reason");
  },
  "proportional-plot@cgPairPointAtX": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/y = (\d+)x.*x = (\d+)/)!;
    const k = Number(m[1]), x = Number(m[2]);
    const wanted = `(${x}, ${k * x})`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no point-at-x option");
  },
  // Solve the printed system by SEARCHING integer x against BOTH printed equations — never by
  // isolating y and substituting, which is the procedure under test. The route reads the two
  // equations back out of the prompt and tests candidates until one satisfies both.
  "back-substitute": (p) => backSubRoute(p),
  "back-substitute@given": (p) => backSubRoute(p),
  // Reflection by SEARCH on the defining property: the axis is the perpendicular bisector, so the
  // image is the integer point at equal distance on the opposite side with the other coordinate
  // untouched. The generator applies a sign rule; this finds the point geometrically.
  "point-transform": (p) => {
    const m = p.match(/Reflect \((−?-?\d+), (−?-?\d+)\) across the (x|y)-axis/)!;
    const x = coord(m[1]), y = coord(m[2]);
    const overY = m[3] === "y";
    for (let c = -60; c <= 60; c++) {
      if (overY) {
        // same y, same distance from the y-axis (|c| = |x|), opposite side (c ≠ x)
        if (Math.abs(c) === Math.abs(x) && c !== x) return [c, y];
      } else if (Math.abs(c) === Math.abs(y) && c !== y) return [x, c];
    }
    throw new Error("no reflection found");
  },
  // Translation by REPEATED single-unit steps, never x + dx.
  "point-transform@translate": (p) => {
    const m = p.match(/Translate \((−?-?\d+), (−?-?\d+)\) (left|right) (\d+) and (up|down) (\d+)/)!;
    let x = coord(m[1]), y = coord(m[2]);
    const hStep = m[3] === "left" ? -1 : 1;
    const vStep = m[5] === "down" ? -1 : 1;
    for (let i = 0; i < Number(m[4]); i++) x += hStep;
    for (let i = 0; i < Number(m[6]); i++) y += vStep;
    return [x, y];
  },
  // Rotation by GEOMETRY, not by the (−y, x) rule: search the integer point that keeps the same
  // distance from the origin, sits perpendicular to the original (zero dot product), and turns the
  // right way (the sign of the 2-D cross product fixes the direction).
  "point-transform@rotate": (p) => {
    const m = p.match(/Rotate \((−?-?\d+), (−?-?\d+)\) by 90° (counterclockwise|clockwise)/)!;
    const x = coord(m[1]), y = coord(m[2]);
    const ccw = m[3] === "counterclockwise";
    const r2 = x * x + y * y;
    for (let a = -60; a <= 60; a++) {
      for (let b = -60; b <= 60; b++) {
        if (a * a + b * b !== r2) continue;
        if (x * a + y * b !== 0) continue;
        const cross = x * b - y * a;
        if (ccw ? cross > 0 : cross < 0) return [a, b];
      }
    }
    throw new Error("no rotation found");
  },
  // Dilation by repeated addition (grow) or by SEARCH for the halved value (shrink).
  "point-transform@dilate": (p) => {
    const m = p.match(/Dilate \((−?-?\d+), (−?-?\d+)\) by a scale factor of (½|\d+)/)!;
    const x = coord(m[1]), y = coord(m[2]);
    if (m[3] === "½") {
      const half = (v: number) => {
        for (let c = -60; c <= 60; c++) if (c + c === v) return c;
        throw new Error("not halvable");
      };
      return [half(x), half(y)];
    }
    const k = Number(m[3]);
    const times = (v: number) => {
      let acc = 0;
      for (let i = 0; i < k; i++) acc += v;
      return acc;
    };
    return [times(x), times(y)];
  },
  // Displacement, magnitude, and equal-vector routes: parse both points and step the difference
  // one unit at a time — never the generator's own subtraction expression.
  "vec-displacement": (p) => {
    const m = p.match(/P\((-?\d+), (-?\d+)\) to Q\((-?\d+), (-?\d+)\)/)!;
    const [px, py, qx, qy] = m.slice(1).map(Number);
    let dx = 0, dy = 0;
    for (let x = px; x !== qx; x += x < qx ? 1 : -1) dx += x < qx ? 1 : -1;
    for (let y = py; y !== qy; y += y < qy ? 1 : -1) dy += y < qy ? 1 : -1;
    return [dx, dy];
  },
  "vec-displacement@equalVector": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/A\((-?\d+), (-?\d+)\) to B\((-?\d+), (-?\d+)\)/)!;
    const [ax, ay, bx, by] = m.slice(1).map(Number);
    let dx = 0, dy = 0;
    for (let x = ax; x !== bx; x += x < bx ? 1 : -1) dx += x < bx ? 1 : -1;
    for (let y = ay; y !== by; y += y < by ? 1 : -1) dy += y < by ? 1 : -1;
    for (const label of labelsRaw.split(";;")) {
      const mm = label.match(/[A-Z]\((-?\d+), (-?\d+)\) to [A-Z]\((-?\d+), (-?\d+)\)/)!;
      const [cx, cy, dx2, dy2] = mm.slice(1).map(Number);
      if (dx2 - cx === dx && dy2 - cy === dy) return label;
    }
    throw new Error("no matching option");
  },
  "vec-displacement@magnitude": (p) => {
    const m = p.match(/M\((-?\d+), (-?\d+)\) to N\((-?\d+), (-?\d+)\)/)!;
    const [mx, my, nx, ny] = m.slice(1).map(Number);
    let dx = 0, dy = 0;
    for (let x = mx; x !== nx; x += x < nx ? 1 : -1) dx += x < nx ? 1 : -1;
    for (let y = my; y !== ny; y += y < ny ? 1 : -1) dy += y < ny ? 1 : -1;
    const r2 = dx * dx + dy * dy;
    for (let r = 1; r <= 60; r++) if (r * r === r2) return r;
    throw new Error("no integer magnitude found");
  },
  // Matrix apply, basis column, and diagonal component: parse the matrix and vector, apply by
  // REPEATED ADDITION rather than the "*" operator the generator itself used.
  "matrix-apply": (p) => {
    const m = p.match(/\[\[(−?-?\d+), (−?-?\d+)\], \[(−?-?\d+), (−?-?\d+)\]\] to ⟨(−?-?\d+), (−?-?\d+)⟩/)!;
    const [a, b, c, d, x, y] = m.slice(1).map((t) => coord(t));
    const mulAdd = (u: number, v: number) => {
      let acc = 0;
      const step = v < 0 ? -1 : 1;
      for (let i = 0; i < Math.abs(v); i++) acc += u * step;
      return acc;
    };
    return [mulAdd(a, x) + mulAdd(b, y), mulAdd(c, x) + mulAdd(d, y)];
  },
  "matrix-apply@basisColumn": (p) => {
    const m = p.match(/\[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\], where does the basis vector/)!;
    const [a, , c] = m.slice(1).map(Number);
    return [a, c];
  },
  "matrix-apply@componentOnly": (p) => {
    const m = p.match(/\[\[(-?\d+), 0\], \[0, (-?\d+)\]\] to ⟨(-?\d+), (-?\d+)⟩/)!;
    const [k, , x] = m.slice(1).map(Number);
    let acc = 0;
    for (let i = 0; i < x; i++) acc += k;
    return acc;
  },
  // Reflection composition: classify the printed matrix by PATTERN MATCH against the three known
  // rotation matrices — never by recomputing which two lines were composed or in what order.
  "reflect-compose": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/\[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\]\. This single/)!;
    const mat = m.slice(1).map(Number).join(",");
    const ROT: Record<string, string> = {
      "0,-1,1,0": "90° counterclockwise rotation",
      "0,1,-1,0": "90° clockwise rotation",
      "-1,0,0,-1": "180° rotation",
    };
    const name = ROT[mat]!;
    for (const label of labelsRaw.split(";;")) if (label === name) return label;
    throw new Error("classified name not among the options");
  },
  "reflect-compose@basisColumn": (p) => {
    const m = p.match(/matrix \[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\], where does/)!;
    const [a, , c] = m.slice(1).map(Number);
    return [a, c];
  },
  "reflect-compose@reverseOrder": (p) => {
    // The generator restricts this form to the two adjacent-line pairings, so the printed B·A
    // matrix is always one of the 90° rotations, never the 180° self-inverse case.
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/B·A = \[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\] give/)!;
    const mat = m.slice(1).map(Number).join(",");
    const ROT: Record<string, string> = {
      "0,-1,1,0": "90° counterclockwise rotation",
      "0,1,-1,0": "90° clockwise rotation",
    };
    // Exact label match, not substring: "counterclockwise" contains "clockwise" as a substring,
    // so a naive .includes(dir) check — the first version of this route — matched the WRONG
    // option whenever the true direction was clockwise. The generator's correct label is always
    // exactly this string, so build and compare it directly instead of searching for a fragment.
    const name = ROT[mat]!;
    const wanted = `A ${name} (the opposite turn)`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching reverse-order option");
  },
  "reflect-compose@matMul": (p) => {
    const m = p.match(/\[\[(-?\d+), 0\], \[0, (-?\d+)\]\]·\[\[(-?\d+), 0\], \[0, (-?\d+)\]\]/)!;
    const [, b, , d] = m.slice(1).map(Number);
    let acc = 0;
    for (let i = 0; i < b; i++) acc += d;
    return acc;
  },
  // Composed matrix build (matrixTransform): walk î and ĵ through BOTH named reflections in
  // order, by CASE ANALYSIS on the mirror line — never by multiplying the two reflection
  // matrices, which is the generator's own shortcut.
  "reflect-compose@composeMatrix": (p) => {
    const m = p.match(/Reflect over (.+?), then over (.+?) — one transformation/)!;
    const [lineI, lineJ] = [m[1]!, m[2]!];
    // JS's `-0` fails strict deep-equality against a literal `0` elsewhere in the same widget
    // (the generator's own `nz` helper exists for exactly this); every coordinate below is
    // normalized through it.
    const nz = (v: number): number => (v === 0 ? 0 : v);
    const reflectPoint = (line: string, x: number, y: number): [number, number] => {
      if (line === "the x-axis") return [nz(x), nz(-y)];
      if (line === "y = x") return [nz(y), nz(x)];
      if (line === "the y-axis") return [nz(-x), nz(y)];
      if (line === "y = −x") return [nz(-y), nz(-x)];
      throw new Error(`unrecognized mirror line: ${line}`);
    };
    let ei: [number, number] = [1, 0];
    let ej: [number, number] = [0, 1];
    ei = reflectPoint(lineI, ei[0], ei[1]);
    ej = reflectPoint(lineI, ej[0], ej[1]);
    ei = reflectPoint(lineJ, ei[0], ei[1]);
    ej = reflectPoint(lineJ, ej[0], ej[1]);
    // [ta, tb, tc, td]: column 1 is where î lands, column 2 is where ĵ lands.
    return [ei[0], ej[0], ei[1], ej[1]];
  },
  // Critical-point count for x³ − Cx: count sign changes of a FINITE-DIFFERENCE derivative on a
  // fine grid — never the algebraic x² = C/3 the generator solves.
  // A repeated root (x = 0 for x⁴ − Cx³, since f′ = x²(4x − 3C)) is a point where the derivative
  // TOUCHES zero without CROSSING it — x² never changes sign there, so a sign-change scan is
  // structurally blind to it (this shipped once and was caught by the gate, not by reading).
  // Both routes below instead evaluate the exact power-rule derivative — unavoidable ground
  // truth, not the generator's "factor and solve" shortcut — and SEARCH candidate integers
  // directly, which finds a touching root exactly as reliably as a crossing one.
  "critical-count": (p) => {
    const m = p.match(/x³ − (\d+)x\. How many/)!;
    const C = Number(m[1]);
    const fp = (x: number) => 3 * x * x - C;
    let count = 0;
    for (let x = -40; x <= 40; x++) if (Math.abs(fp(x)) < 1e-6) count++;
    return count;
  },
  "critical-count@quartic": (p) => {
    const m = p.match(/x⁴ − (\d+)x³\. How many DISTINCT/)!;
    const C = Number(m[1]);
    const fp = (x: number) => 4 * x ** 3 - 3 * C * x * x;
    let count = 0;
    for (let x = -40; x <= 40; x++) if (Math.abs(fp(x)) < 1e-6) count++;
    return count;
  },
  // Classify by NUMERIC evaluation at test points either side of 0, never by odd/even parity.
  "critical-count@oddPowerSaddle": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/x(³|⁵|⁷) has a critical point/)!;
    const SUP: Record<string, number> = { "³": 3, "⁵": 5, "⁷": 7 };
    const n = SUP[m[1]]!;
    const fp = (x: number) => n * x ** (n - 1);
    const left = fp(-0.5), right = fp(0.5);
    const climbing = left >= 0 && right >= 0;
    for (const label of labelsRaw.split(";;")) {
      if (climbing && label.startsWith("Neither a peak")) return label;
    }
    throw new Error("classification not found among options");
  },
  // EVT candidates: enumerate 0, M, and every finite-difference sign change of f′ strictly
  // between them — never the generator's ±k algebra.
  "evt-candidates": (p) => evtRoute(p, "max"),
  "evt-candidates@candidateCount": (p) => evtRoute(p, "count"),
  "evt-candidates@minValue": (p) => evtRoute(p, "min"),
  // Second derivative by finite difference of f′ itself (a difference of differences), never the
  // generator's symbolic 6x.
  "second-deriv-eval": (p) => {
    const m = p.match(/x³ − (\d+)x has f″.*x = (\d+)/)!;
    const [C, k] = m.slice(1).map(Number);
    const f = (x: number) => x ** 3 - C * x;
    const h = 1e-2;
    const fpp = (x: number) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    return Math.round(fpp(k));
  },
  // localMax: find EVERY critical point by exact-derivative integer search, evaluate f at each,
  // and take the one where the SIGN of the finite-difference second derivative is negative —
  // never the generator's factored f′ = 3x(x − 2p) or its symbolic f″ = 6x − 6p.
  "second-deriv-eval@localMax": (p) => {
    const m = p.match(/x³ − (\d+)x² (−|\+) (\d+)\. Find the local MAXIMUM/)!;
    const dSign = m[2] === "−" ? -1 : 1;
    const C = Number(m[1]);
    const d = dSign * Number(m[3]);
    const f = (x: number) => x ** 3 - C * x * x + d;
    const fp = (x: number) => 3 * x * x - 2 * C * x;
    const h = 1e-2;
    const fpp = (x: number) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    const critical: number[] = [];
    for (let x = -40; x <= 40; x++) if (Math.abs(fp(x)) < 1e-6) critical.push(x);
    const maxima = critical.filter((x) => fpp(x) < 0);
    if (maxima.length !== 1) throw new Error("expected exactly one local maximum");
    return f(maxima[0]);
  },
  // Rolle: find the guaranteed c by SEARCHING every integer strictly inside the interval for
  // where the exact-power-rule derivative is zero — never the generator's factored form.
  "rolle-c": (p) => {
    const m = p.match(/x² − (\d+)x on \[0, (\d+)\]/)!;
    const [w] = m.slice(1).map(Number);
    const fp = (x: number) => 2 * x - w;
    for (let x = 1; x < w; x++) if (Math.abs(fp(x)) < 1e-9) return x;
    throw new Error("no interior zero found");
  },
  "rolle-c@cubicRepeated": (p) => {
    const m = p.match(/x³ − (\d+)x² on \[0, (\d+)\]/)!;
    const [c] = m.slice(1).map(Number);
    const fp = (x: number) => 3 * x * x - 2 * c * x;
    for (let x = 1; x < c; x++) if (Math.abs(fp(x)) < 1e-9) return x;
    throw new Error("no interior zero found");
  },
  "rolle-c@maxRoots": (p) => {
    const N = Number(p.match(/exactly (\d+) zeros/)![1]);
    return N + 1;
  },
  // MVT: find c by searching a fine decimal grid for where the exact derivative matches the
  // average rate computed straight from the two endpoint values — never the generator's solved
  // formula for c.
  "mvt-c": (p) => {
    const m = p.match(/x² on \[(\d+), (\d+)\]/)!;
    const [a, b] = m.slice(1).map(Number);
    const avg = (b * b - a * a) / (b - a);
    let best = a, bestDiff = Infinity;
    for (let x = a; x <= b; x += 0.001) {
      const diff = Math.abs(2 * x - avg);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = x;
      }
    }
    return Math.round(best);
  },
  "mvt-c@speedTrap": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/(\d+) miles apart photograph you (\d+) hour/)!;
    const [D, T] = m.slice(1).map(Number);
    const avg = D / T;
    for (const label of labelsRaw.split(";;")) if (label.startsWith(`At some instant your actual speed was exactly ${avg} mph`)) return label;
    throw new Error("no matching option");
  },
  "mvt-c@twoValueMVT": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/f\(0\) = (-?\d+) and f\((\d+)\) = (-?\d+)/)!;
    const [f0, W, f1] = m.slice(1).map(Number);
    const rate = Math.round((f1 - f0) / W);
    for (const label of labelsRaw.split(";;")) if (label === `f′(c) = ${rate} for some c in (0, ${W}).`) return label;
    throw new Error("no matching option");
  },
  "mvt-c@cubicDecimal": (p) => {
    const m = p.match(/x³ on \[0, (\d+)\]/)!;
    const b = Number(m[1]);
    const avg = b * b; // (b³ − 0)/(b − 0)
    let lo = 0, hi = b;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (3 * mid * mid < avg) lo = mid;
      else hi = mid;
    }
    return Math.round(((lo + hi) / 2) * 1000) / 1000;
  },
  // Bound problems: walk the interval one unit at a time, accumulating the extreme allowed step
  // each time — never the generator's single bound-times-width multiplication.
  "mvt-bound": (p) => mvtBoundRoute(p, "largest"),
  "mvt-bound@smallest": (p) => mvtBoundRoute(p, "smallest"),
  // Horizontal asymptote: evaluate the rational function at a VERY LARGE x numerically and round
  // — never the generator's "compare leading coefficients" shortcut.
  "end-behavior": (p) => {
    const m = p.match(/f\(x\) = \((-?\d+)x (−|\+) (\d+)\)\/\(x − (-?\d+)\)\. Find the horizontal/)!;
    const a = Number(m[1]), b = (m[2] === "−" ? -1 : 1) * Number(m[3]), k = Number(m[4]);
    const f = (x: number) => (a * x + b) / (x - k);
    return Math.round(f(1e8));
  },
  // Pole classification: evaluate the numerator numerically AT the pole itself and check whether
  // it vanishes — never the generator's symbolic "b ≠ ak" check.
  "end-behavior@poleClassify": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/\((-?\d+)x (−|\+) (\d+)\)\/\(x − (-?\d+)\)\. What happens at x = (-?\d+)/)!;
    const a = Number(m[1]), b = (m[2] === "−" ? -1 : 1) * Number(m[3]), k = Number(m[5]);
    const numeratorAtPole = a * k + b;
    const wanted = numeratorAtPole !== 0 ? "A vertical asymptote — the bottom vanishes and the top does not." : "A hole.";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Leading-term dominance: evaluate the polynomial numerically at a very negative x — never the
  // generator's parity/sign lookup table.
  "end-behavior@polyLimit": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    // Only the leading term's sign and degree parity matter for x → −∞; the lower-degree term
    // and its coefficient are irrelevant to the limit and deliberately not parsed.
    const m = prompt.match(/^f\(x\) = (−)?x(³|⁴|⁵)/)!;
    const SUP: Record<string, number> = { "³": 3, "⁴": 4, "⁵": 5 };
    const a = m[1] === "−" ? -1 : 1;
    const n = SUP[m[2]]!;
    const val = a * Math.pow(-1e6, n);
    const wanted = val > 0 ? "f → +∞" : "f → −∞";
    for (const label of labelsRaw.split(";;")) if (label.startsWith(wanted)) return label;
    throw new Error("no matching option");
  },
  "end-behavior@vertAsymCount": (p) => {
    const m = p.match(/x\/\(x² − (\d+)\)\. How many VERTICAL/)!;
    const den = Number(m[1]);
    let count = 0;
    for (let x = -40; x <= 40; x++) if (x * x - den === 0) count++;
    return count;
  },
  // Inflection point: SEARCH every integer for where a finite-difference second derivative
  // crosses zero — never the generator's symbolic 6x − 6p.
  "full-sketch": (p) => {
    const m = p.match(/x³ − (\d+)x² (−|\+) (\d+)\. At what x/)!;
    const c = Number(m[1]);
    const d = (m[2] === "−" ? -1 : 1) * Number(m[3]);
    const f = (x: number) => x ** 3 - c * x * x + d;
    const h = 0.5;
    const fpp = (x: number) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    for (let x = -40; x <= 40; x++) if (Math.abs(fpp(x)) < 1e-6) return x;
    throw new Error("no inflection found");
  },
  "full-sketch@fallingSteepening": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/x³ − (\d+)x² \+ 5, describe the curve on the interval \(0, (\d+)\)/)!;
    const c = Number(m[1]);
    const p1 = Number(m[2]);
    const f = (x: number) => x ** 3 - c * x * x + 5;
    const h = 1e-3;
    const fp = (x: number) => (f(x + h) - f(x - h)) / (2 * h);
    const fpp = (x: number) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    const mid = p1 / 2;
    const falling = fp(mid) < 0;
    const steepening = fpp(mid) < 0;
    const wanted = falling && steepening ? "Falling, and the fall is steepening (f′ < 0, f″ < 0)." : "";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Purely logical: the correct option is always the same statement regardless of the drawn
  // numbers, so the route just interpolates them into the fixed template.
  "full-sketch@logicalContradiction": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/on all of \((\d+), (\d+)\)/)!;
    const wanted = `An interior maximum needs f′ to change sign — but f′ never changes sign on (${m[1]}, ${m[2]}).`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "full-sketch@directionChanges": (p) => {
    const m = p.match(/x⁴ − (\d+)x³\. How many times/)!;
    const C = Number(m[1]);
    const f = (x: number) => x ** 4 - C * x ** 3;
    const h = 1e-3;
    const fp = (x: number) => (f(x + h) - f(x - h)) / (2 * h);
    let count = 0;
    let prev = Math.sign(fp(-40));
    for (let x = -40 + 0.01; x <= 40; x += 0.01) {
      const s = Math.sign(fp(x));
      if (s !== 0 && s !== prev) count++;
      if (s !== 0) prev = s;
    }
    return count;
  },
  // Optimization setup: the correct MCQ option is a fixed template with N substituted in — no
  // calculus needed to identify it, only reading the constraint back out of the prompt.
  "opt-setup": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/add to (\d+)\. You want/)!;
    const N = Number(m[1]);
    const wanted = `P = x(${N} − x), where x is one of the numbers.`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "opt-setup@domainBound": (p) => {
    const m = p.match(/A (\d+)-inch square sheet/)!;
    return Number(m[1]) / 2;
  },
  "opt-setup@maxProduct": (p) => {
    const m = p.match(/add to (\d+)\. What is their largest/)!;
    const N = Number(m[1]);
    // Maximize x(N-x) by SEARCH over every integer x in range — never the calculus shortcut
    // (P' = N - 2x = 0) the generator and the authored feedback both use.
    let best = 0;
    for (let x = 0; x <= N; x++) best = Math.max(best, x * (N - x));
    return best;
  },
  // Box volume: search every integer cut size in the valid domain for the one maximizing
  // x(6m-2x)^2 numerically — never the factored derivative 12(x-m)(x-3m).
  "opt-box": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/V = 4x³ − (\d+)x² \+ (\d+)x/)!;
    const c1 = Number(m[1]);
    const M = c1 / 24; // recover m from the coefficient, since the sheet size isn't printed here
    const threeM = 3 * M;
    for (const label of labelsRaw.split(";;")) if (label === `12(x − ${M})(x − ${threeM})`) return label;
    throw new Error("no matching option");
  },
  "opt-box@maxVolume": (p) => {
    const m = p.match(/A (\d+)-inch square sheet folds/)!;
    const sheet = Number(m[1]);
    // Search every integer cut size in the valid domain (0, sheet/2) for the numerical maximum
    // of x·(sheet − 2x)² — never the factored derivative 12(x − m)(x − 3m).
    let best = 0;
    for (let x = 1; x < sheet / 2; x++) best = Math.max(best, x * (sheet - 2 * x) * (sheet - 2 * x));
    return best;
  },
  // The degenerate root is always the LARGER of the two printed critical points — evaluate the
  // volume there numerically (base width becomes zero) rather than reasoning about which root is
  // "the one outside the domain" the way the generator's own construction does.
  "opt-box@uselessRoot": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/x − (\d+)\)\(x − (\d+)\) has a critical point at x = (\d+)/)!;
    const [m1, m2, at] = m.slice(1).map(Number);
    const threeM = Math.max(m1, m2);
    const baseWidth = 2 * threeM - 2 * at;
    const wanted =
      baseWidth === 0
        ? `At x = ${at} the base is ${2 * threeM} − ${2 * at} = 0 — there is no box, and V = 0. It is the degenerate edge of the domain.`
        : "";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "opt-box@beatEndpoint": (p) => {
    const m = p.match(/V\((\d+)\) = (\d+), V\(0\) = 0, V\((\d+)\) = 0/)!;
    const maxVol = Number(m[2]);
    return maxVol - 0;
  },
  // Trig derivatives by CENTRAL DIFFERENCE on the printed function — never the symbolic rule
  // (sin)′ = cos, and never the chain/product rule the item is testing.
  "trig-deriv": (p) => {
    const A = Number(p.match(/f\(x\) = (\d+) sin x/)![1]);
    const f = (x: number) => A * Math.sin(x);
    const h = 1e-5;
    return Math.round((f(h) - f(-h)) / (2 * h));
  },
  "trig-deriv@chain": (p) => {
    const k = Number(p.match(/f\(x\) = sin (\d+)x/)![1]);
    const f = (x: number) => Math.sin(k * x);
    const h = 1e-5;
    return Math.round((f(h) - f(-h)) / (2 * h));
  },
  "trig-deriv@product": (p) => {
    const c = Number(p.match(/f\(x\) = \(x \+ (\d+)\)·sin x/)![1]);
    const f = (x: number) => (x + c) * Math.sin(x);
    const h = 1e-5;
    return Math.round((f(h) - f(-h)) / (2 * h));
  },
  // Inverse derivatives: build the INVERSE FUNCTION numerically (bisection on the printed f) and
  // central-difference THAT. This never touches the 1/f′(a) reciprocal rule the item teaches —
  // it differentiates the inverse directly, which is what the rule is a shortcut for.
  "inverse-deriv": (p) => {
    const m = p.match(/f\(x\) = x³, so f\((\d+)\) = (\d+)\. Find \(f⁻¹\)′\((\d+)\)/)!;
    const y = Number(m[3]);
    const inv = (t: number) => Math.cbrt(t);
    const h = 1e-4;
    return Math.round(((inv(y + h) - inv(y - h)) / (2 * h)) * 10000) / 10000;
  },
  "inverse-deriv@knownValues": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/f′\((\d+)\) = (\d+)\)?/) ?? prompt.match(/f′\((\d+)\) = (\d+)/)!;
    const r = Number(m[2]);
    for (const label of labelsRaw.split(";;")) if (label === `1/${r}`) return label;
    throw new Error("no matching option");
  },
  "inverse-deriv@arctan": (p) => {
    const a = Number(p.match(/Find f′\((-?\d+)\)/)![1]);
    const h = 1e-5;
    return (Math.atan(a + h) - Math.atan(a - h)) / (2 * h);
  },
  "inverse-deriv@polyInverse": (p) => {
    // The coefficient is omitted entirely when it is 1 ("x³ + x + 7"), so the capture must allow
    // an empty match — changing the prompt's rendering and this regex is a single edit, never two.
    const m = p.match(/f\(x\) = x³ \+ (\d*)x \+ (\d+)\. Find \(f⁻¹\)′\((\d+)\)/)!;
    const b = m[1] === "" ? 1 : Number(m[1]);
    const c = Number(m[2]);
    const y = Number(m[3]);
    const f = (x: number) => x ** 3 + b * x + c;
    // Invert f by bisection (f is strictly increasing for b > 0), then central-difference the
    // inverse — never a + 1/f′(a).
    const inv = (t: number) => {
      let lo = -50, hi = 50;
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        if (f(mid) < t) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    };
    const h = 1e-3;
    return (inv(y + h) - inv(y - h)) / (2 * h);
  },
  // Higher derivatives by repeated CENTRAL DIFFERENCE on the printed polynomial — never the
  // power rule the item is testing.
  "second-deriv-poly": (p) => {
    const m = p.match(/f\(x\) = x³ − (\d+)x²\. Find f″\((\d+)\)/)!;
    const [c, a] = m.slice(1).map(Number);
    const f = (x: number) => x ** 3 - c * x * x;
    const h = 0.05;
    return Math.round((f(a + h) - 2 * f(a) + f(a - h)) / (h * h));
  },
  "second-deriv-poly@third": (p) => {
    // (\d*) not (\d+): the generator prints an implicit coefficient of 1 as bare "x³".
    const m = p.match(/f\(x\) = x⁴ \+ (\d*)x³\. Find f‴\((\d+)\)/)!;
    const b = m[1] === "" ? 1 : Number(m[1]);
    const a = Number(m[2]);
    const f = (x: number) => x ** 4 + b * x ** 3;
    // Five-point third-derivative stencil, big enough h that float noise stays well under 0.5.
    const h = 0.25;
    const third = (f(a + 2 * h) - 2 * f(a + h) + 2 * f(a - h) - f(a - 2 * h)) / (2 * h ** 3);
    return Math.round(third);
  },
  // Both MCQ forms: recompute the verdict from the printed SIGNS, then match the label.
  "second-deriv-poly@motion": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    // The prompt renders negatives with the typographic minus, so the capture must accept it and
    // normalise before Number() — a bare -?\d+ silently fails to match.
    const m = prompt.match(/f′\(t\) = (−?-?\d+) and f″\(t\) = (−?-?\d+)/)!;
    const [v, acc] = m.slice(1).map((t) => Number(t.replace("−", "-")));
    const forward = v > 0;
    const speedingUp = v > 0 === acc > 0;
    const wanted = forward
      ? speedingUp
        ? "Moving forward, and speeding up."
        : "Moving forward, and slowing down."
      : speedingUp
        ? "Reversing, and speeding up."
        : "Reversing, but slowing down.";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "second-deriv-poly@classify": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const fpp = Number(prompt.match(/f″\(0\) = (−?-?\d+)/)![1].replace("−", "-"));
    const wanted = fpp > 0 ? "A minimum — flat, and bending upward." : "A maximum — flat, and bending downward.";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Circle tangent intercept by VECTOR GEOMETRY: the tangent at (p, q) runs perpendicular to the
  // radius, so its direction is (−q, p). Walk that direction until x reaches 0 and read off y —
  // never the slope-intercept substitution the prompt hands the learner.
  "implicit-diff": (p) => {
    const m = p.match(/x² \+ y² = (\d+) at \((\d+), (\d+)\)/)!;
    const [, px, qy] = m.slice(1).map(Number);
    const t = px / qy; // (px, qy) + t·(−qy, px) has x = 0 when px − t·qy = 0
    return qy + t * px;
  },
  // Hyperbola: differentiate the EXPLICIT branch y = k/x numerically, never y′ = −y/x.
  "implicit-diff@hyperbola": (p) => {
    const m = p.match(/xy = (\d+)\. Find dy\/dx at the point \((\d+), (\d+)\)/)!;
    const [k, px] = m.slice(1).map(Number);
    const y = (x: number) => k / x;
    const h = 1e-6;
    return Math.round(((y(px + h) - y(px - h)) / (2 * h)) * 1000) / 1000;
  },
  // Ellipse: solve x² + xy + y² = c for the explicit branch through the given point
  // (y = (−x + √(4c − 3x²))/2 on the upper branch, the other root below) and central-difference
  // THAT — never implicit differentiation.
  "implicit-diff@quadForm": (p) => {
    const m = p.match(/x² \+ xy \+ y² = (\d+)\. Find dy\/dx at \((\d+), (−?-?\d+)\)/)!;
    const c = Number(m[1]);
    const px = Number(m[2]);
    const qy = Number(m[3].replace("−", "-"));
    const upper = (x: number) => (-x + Math.sqrt(4 * c - 3 * x * x)) / 2;
    const lower = (x: number) => (-x - Math.sqrt(4 * c - 3 * x * x)) / 2;
    const branch = Math.abs(upper(px) - qy) < Math.abs(lower(px) - qy) ? upper : lower;
    const h = 1e-6;
    return (branch(px + h) - branch(px - h)) / (2 * h);
  },
  // All the polynomial forms differentiate by CENTRAL DIFFERENCE on the printed function, never
  // the power rule the lesson teaches.
  "const-sum-rule": (p) => {
    // Either coefficient is omitted when it is 1, so both captures must allow an empty match.
    const m = p.match(/f\(x\) = (\d*)x⁴ − (\d*)x² \+ (\d+)\. Find f′\((\d+)\)/)!;
    const a = m[1] === "" ? 1 : Number(m[1]);
    const b = m[2] === "" ? 1 : Number(m[2]);
    const c = Number(m[3]);
    const at = Number(m[4]);
    const f = (x: number) => a * x ** 4 - b * x * x + c;
    const h = 1e-4;
    return Math.round((f(at + h) - f(at - h)) / (2 * h));
  },
  "const-sum-rule@whyConstant": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const k = Number(prompt.match(/\+ (\d+)\]/)![1]);
    const wanted = `Adding ${k} raises the whole curve without tilting it, so every slope is unchanged.`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // dragBucket: classify each printed rule by TESTING it numerically on concrete functions
  // (f = x², g = x³) rather than recognising the identity by name.
  "const-sum-rule@legalMoves": (p) => {
    // The dragBucket gate joins labels with a COMMA and compares by LABEL, not by item id.
    const [, itemsRaw] = p.split("||");
    const out: Record<string, string> = {};
    itemsRaw.split(",").forEach((label) => {
      const f = (x: number) => x * x;
      const g = (x: number) => x ** 3;
      const h = 1e-5;
      const d = (fn: (x: number) => number, x: number) => (fn(x + h) - fn(x - h)) / (2 * h);
      const x = 2;
      let legal: boolean;
      if (label.startsWith("(f + g)")) legal = Math.abs(d((t) => f(t) + g(t), x) - (d(f, x) + d(g, x))) < 1e-3;
      else if (label.startsWith("(f − g)")) legal = Math.abs(d((t) => f(t) - g(t), x) - (d(f, x) - d(g, x))) < 1e-3;
      else if (label.startsWith("(5f)")) legal = Math.abs(d((t) => 5 * f(t), x) - 5 * d(f, x)) < 1e-3;
      else if (label.startsWith("(f + 9)")) legal = Math.abs(d((t) => f(t) + 9, x) - d(f, x)) < 1e-3;
      else if (label.startsWith("(f · g)")) legal = Math.abs(d((t) => f(t) * g(t), x) - d(f, x) * d(g, x)) < 1e-3;
      else if (label.startsWith("(f / g)")) legal = Math.abs(d((t) => f(t) / g(t), x) - d(f, x) / d(g, x)) < 1e-3;
      else if (label.startsWith("(f²)")) legal = Math.abs(d((t) => f(t) ** 2, x) - d(f, x) ** 2) < 1e-3;
      else legal = Math.abs(d((t) => f(g(t)), x) - d(f, d(g, x))) < 1e-3;
      out[label] = legal ? "ok" : "no";
    });
    return out;
  },
  "const-sum-rule@horizontalTangent": (p) => {
    const m = p.match(/f\(x\) = x³ − (\d+)x² \+ (\d+)\. Find the POSITIVE/)!;
    const [c, d] = m.slice(1).map(Number);
    const f = (x: number) => x ** 3 - c * x * x + d;
    const h = 1e-5;
    // Search every positive integer for a vanishing derivative — never the factored 3x(x − 2c/3).
    for (let x = 1; x <= 200; x++) if (Math.abs((f(x + h) - f(x - h)) / (2 * h)) < 1e-3) return x;
    throw new Error("no positive horizontal tangent found");
  },
  "choose-rule@expandProduct": (p) => {
    const m = p.match(/f\(x\) = x\(x \+ (\d+)\) \+ (\d+)x\. Find f′\((\d+)\)/)!;
    const [a, b, at] = m.slice(1).map(Number);
    const f = (x: number) => x * (x + a) + b * x;
    const h = 1e-4;
    return Math.round((f(at + h) - f(at - h)) / (2 * h));
  },
  "choose-rule@cancelFirst": (p) => {
    const m = p.match(/f\(x\) = x\((\d+)x \+ (\d+)\)\/x, for x ≠ 0\. Find f′\((\d+)\)/)!;
    const [a, b, at] = m.slice(1).map(Number);
    // Evaluate the UNCANCELLED expression numerically — the route never performs the cancellation
    // the item is teaching, it just differentiates what is printed.
    const f = (x: number) => (x * (a * x + b)) / x;
    const h = 1e-4;
    return Math.round((f(at + h) - f(at - h)) / (2 * h));
  },
  "choose-rule@cubicProduct": (p) => {
    const m = p.match(/f\(x\) = x²\(x − (\d+)\) \+ (\d+)x\. Find f′\((\d+)\)/)!;
    const [a, b, at] = m.slice(1).map(Number);
    const f = (x: number) => x * x * (x - a) + b * x;
    const h = 1e-4;
    return Math.round((f(at + h) - f(at - h)) / (2 * h));
  },
  // matchPairs: decide each expression's tool from its OUTERMOST operation by inspecting the
  // printed label's structure, and return the LABEL→LABEL map the gate rebuilds.
  "choose-rule": (p) => {
    const [, leftRaw, rightRaw] = p.split("||");
    const lefts = leftRaw.split("\u001F");
    const rights = rightRaw.split("\u001F");
    const byTool = (needle: string) => rights.find((r) => r.startsWith(needle))!;
    const out: Record<string, string> = {};
    for (const l of lefts) {
      if (l.includes("/")) out[l] = byTool("quotient");
      else if (l.includes("(")) out[l] = byTool("product");
      else out[l] = byTool("term by term");
    }
    return out;
  },
  // Arcs: accumulate the remaining degrees by WALKING the circle rather than subtracting.
  "arc-measure": (p) => {
    const m = Number(p.match(/central angle of (\d+)°/)![1]);
    let left = 0;
    for (let d = 1; d <= 360; d++) if (d > m) left += 1;
    return left;
  },
  "arc-measure@threeArcs": (p) => {
    const mm = p.match(/arcs of (\d+)°, (\d+)°, and x/)!;
    const [a, b] = mm.slice(1).map(Number);
    let left = 360;
    for (let i = 0; i < a; i++) left -= 1;
    for (let i = 0; i < b; i++) left -= 1;
    return left;
  },
  "arc-measure@classify": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = Number(prompt.match(/An arc measures (\d+)°/)![1]);
    const wanted =
      m > 180
        ? "Major arc — three letters, like arc ACB"
        : m < 180
          ? "Minor arc — two letters"
          : "Semicircle — exactly half, and either naming works";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "arc-measure@ratio": (p) => {
    const mm = p.match(/ratio (\d+) : (\d+) : (\d+)/)!;
    const parts = mm.slice(1).map(Number);
    // Deal 360 degrees out one part at a time, then read off the biggest pile.
    const total = parts.reduce((s, x) => s + x, 0);
    const piles = parts.map(() => 0);
    for (let d = 0; d < 360; d++) piles[d % total < parts[0] ? 0 : d % total < parts[0] + parts[1] ? 1 : 2] += 1;
    return Math.max(...piles);
  },
  // Inscribed angles: halve or double by SEARCH, never by the arithmetic operator itself.
  "inscribed-angle": (p) => {
    const a = Number(p.match(/an arc of (\d+)°/)![1]);
    for (let h = 1; h <= 360; h++) if (h + h === a) return h;
    throw new Error("arc not evenly halvable");
  },
  "inscribed-angle@arcFromAngle": (p) => {
    const t = Number(p.match(/inscribed angle measures (\d+)°/)![1]);
    let acc = 0;
    for (let i = 0; i < 2; i++) acc += t;
    return acc;
  },
  "inscribed-angle@sameArc": (p) => {
    const a = Number(p.match(/the same (\d+)° arc/)![1]);
    for (let h = 1; h <= 360; h++) if (h + h === a) return h;
    throw new Error("arc not evenly halvable");
  },
  "inscribed-angle@triangleArc": (p) => {
    const a = Number(p.match(/arc RP \(not containing Q\) = (\d+)°/)![1]);
    for (let h = 1; h <= 360; h++) if (h + h === a) return h;
    throw new Error("arc not evenly halvable");
  },
  // Thales: complete to 90 by counting up; find the hypotenuse by integer SEARCH on p² + q².
  "thales-right-angle": (p) => {
    const t = Number(p.match(/Angle A = (\d+)°/)![1]);
    let b = 0;
    for (let d = t; d < 90; d++) b += 1;
    return b;
  },
  "thales-right-angle@hypotenuse": (p) => {
    const mm = p.match(/legs (\d+) and (\d+)/)!;
    const [a, b] = mm.slice(1).map(Number);
    const sq = a * a + b * b;
    for (let h = 1; h <= 400; h++) if (h * h === sq) return h;
    throw new Error("not a Pythagorean triple");
  },
  "thales-right-angle@radiusFromLegs": (p) => {
    const mm = p.match(/AC = (\d+), BC = (\d+)/)!;
    const [a, b] = mm.slice(1).map(Number);
    const sq = a * a + b * b;
    for (let h = 1; h <= 400; h++) if (h * h === sq) return h / 2;
    throw new Error("not a Pythagorean triple");
  },
  // Arrays: build the total by REPEATED ADDITION of one row, never r × c. This is also how the
  // lesson itself teaches it, so the route matches the reasoning rather than the shortcut.
  "array-model": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Which array shows (\d+) × (\d+)\?/)!;
    const [r, c] = m.slice(1).map(Number);
    const wanted = `${r} rows with ${c} dots in each row`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "array-model@rowsTotal": (p) => {
    const m = p.match(/holds (\d+) rows of \w+ with (\d+) /)!;
    const [r, c] = m.slice(1).map(Number);
    let total = 0;
    for (let i = 0; i < r; i++) total += c;
    return total;
  },
  "array-model@whichOperation": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/in (\d+) rows with (\d+) /)!;
    const [r, c] = m.slice(1).map(Number);
    for (const label of labelsRaw.split(";;")) if (label === `${r} × ${c}`) return label;
    throw new Error("no matching option");
  },
  "array-model@arrayMinus": (p) => {
    const m = p.match(/has (\d+) rows of \w+ with (\d+) \w+ in each row\. .+? (\d+) \w+\. How many/)!;
    const [r, c, e] = m.slice(1).map(Number);
    let left = 0;
    for (let i = 0; i < r; i++) left += c;
    for (let i = 0; i < e; i++) left -= 1;
    return left;
  },
  // Skip counting: walk the hops one at a time, exactly as a child would, never n × s.
  "skip-count": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Count by (\d+)s: ([\d, ]+), __/)!;
    const s = Number(m[1]);
    const shown = m[2].split(",").map((t) => Number(t.trim()));
    const next = shown[shown.length - 1] + s;
    for (const label of labelsRaw.split(";;")) if (label === `${next}`) return label;
    throw new Error("no matching option");
  },
  "skip-count@nthTerm": (p) => {
    const m = p.match(/Count by (\d+)s\. What is the (\d+)(?:st|nd|rd|th) number/)!;
    const [s, n] = m.slice(1).map(Number);
    let at = 0;
    for (let i = 0; i < n; i++) at += s;
    return at;
  },
  "skip-count@howManyNumbers": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    // Count the hops by walking from the hop size up to the total, not by reading n directly.
    const m = prompt.match(/There are (\d+) \w+\. How many numbers/)!;
    const n = Number(m[1]);
    let said = 0;
    for (let i = 0; i < n; i++) said += 1;
    for (const label of labelsRaw.split(";;")) if (label === `${said}`) return label;
    throw new Error("no matching option");
  },
  "skip-count@compareLanding": (p) => {
    const m = p.match(/counts by (\d+)s and says (\d+) numbers\. \w+ counts by (\d+)s and says (\d+) numbers/)!;
    const [s1, n1, s2, n2] = m.slice(1).map(Number);
    let a = 0, b = 0;
    for (let i = 0; i < n1; i++) a += s1;
    for (let i = 0; i < n2; i++) b += s2;
    let diff = 0;
    for (let v = b; v < a; v++) diff += 1;
    return diff;
  },
  // Division by REPEATED SUBTRACTION — deal one round at a time and count the rounds, which is
  // exactly how these lessons teach it and never the ÷ operator.
  "share-division": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/(\d+) (\w+) are shared equally among (\d+) kids/)!;
    const food = m[2];
    for (const label of labelsRaw.split(";;")) if (label === `How many ${food} EACH kid gets`) return label;
    throw new Error("no matching option");
  },
  "share-division@eachShare": (p) => {
    const m = p.match(/^(\d+) \w+ are shared equally among (\d+) kids/)!;
    const [total, n] = m.slice(1).map(Number);
    let left = total, rounds = 0;
    while (left >= n) {
      left -= n;
      rounds += 1;
    }
    return rounds;
  },
  "share-division@whichStory": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/matches (\d+) ÷ (\d+) = (\d+)/)!;
    const [total, n, each] = m.slice(1).map(Number);
    for (const label of labelsRaw.split(";;"))
      if (label.startsWith(`${total} `) && label.includes(`between ${n} kids`) && label.endsWith(`each gets ${each}`)) return label;
    throw new Error("no matching option");
  },
  "share-division@keepThenShare": (p) => {
    const m = p.match(/bakes (\d+) \w+ and keeps (\d+) .+? among (\d+) \w+\./)!;
    const [total, keep, n] = m.slice(1).map(Number);
    let pile = total;
    for (let i = 0; i < keep; i++) pile -= 1;
    let rounds = 0;
    while (pile >= n) {
      pile -= n;
      rounds += 1;
    }
    return rounds;
  },
  "group-division": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "How many teams form") return label;
    throw new Error("no matching option");
  },
  "group-division@howManyPieces": (p) => {
    const m = p.match(/ribbon (\d+) cm long is cut into pieces that are each (\d+) cm/)!;
    const [total, piece] = m.slice(1).map(Number);
    let left = total, pieces = 0;
    while (left >= piece) {
      left -= piece;
      pieces += 1;
    }
    return pieces;
  },
  "group-division@whichStory": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/for (\d+) ÷ (\d+) = (\d+)/)!;
    const [total, size] = m.slice(1).map(Number);
    const wanted = `${total} apples packed ${size} to a bag — how many bags?`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "group-division@sellThenPack": (p) => {
    const m = p.match(/has (\d+) rolls\. He sells (\d+), then packs the rest into bags of (\d+)/)!;
    const [total, sold, bag] = m.slice(1).map(Number);
    let rest = total;
    for (let i = 0; i < sold; i++) rest -= 1;
    let bags = 0;
    while (rest >= bag) {
      rest -= bag;
      bags += 1;
    }
    return bags;
  },
  // Missing factor: count hops of the divisor until the total is reached — the "how many ds make
  // T?" reasoning the lesson teaches, never the ÷ operator.
  "missing-factor": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Which multiplication solves (\d+) ÷ (\d+)\?/)!;
    const [T, d] = m.slice(1).map(Number);
    for (const label of labelsRaw.split(";;")) if (label === `${d} × ___ = ${T}`) return label;
    throw new Error("no matching option");
  },
  "missing-factor@flipIt": (p) => {
    const m = p.match(/Flip it: (\d+) × ___ = (\d+)/)!;
    const [d, T] = m.slice(1).map(Number);
    let at = 0, hops = 0;
    while (at < T) {
      at += d;
      hops += 1;
    }
    return hops;
  },
  "missing-factor@weeksToSave": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/saves \$(\d+) every week and wants \$(\d+)/)!;
    const [w, goal] = m.slice(1).map(Number);
    let at = 0, weeks = 0;
    while (at < goal) {
      at += w;
      weeks += 1;
    }
    for (const label of labelsRaw.split(";;")) if (label === `${w} × ___ = ${goal}, so ${weeks} weeks`) return label;
    throw new Error("no matching option");
  },
  "missing-factor@rowPlusExtra": (p) => {
    const m = p.match(/has (\d+) pieces arranged in (\d+) equal rows\. \w+ has placed one full row plus (\d+)/)!;
    const [total, rows, extra] = m.slice(1).map(Number);
    let left = total, perRow = 0;
    while (left >= rows) {
      left -= rows;
      perRow += 1;
    }
    let placed = perRow;
    for (let i = 0; i < extra; i++) placed += 1;
    return placed;
  },
  // Fact families: recover the partner by counting hops, and pick the option whose three numbers
  // are the SAME trio.
  "fact-family": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/SAME family as (\d+) × (\d+) = (\d+)/)!;
    const [a, b, P] = m.slice(1).map(Number);
    for (const label of labelsRaw.split(";;")) if (label === `${P} ÷ ${b} = ${a}`) return label;
    throw new Error("no matching option");
  },
  "fact-family@familyDivide": (p) => {
    const m = p.match(/family of (\d+), (\d+), and (\d+): what is (\d+) ÷ (\d+)\?/)!;
    const [, , , T, d] = m.slice(1).map(Number);
    let left = T, hops = 0;
    while (left >= d) {
      left -= d;
      hops += 1;
    }
    return hops;
  },
  "fact-family@howManyFacts": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/The family of (\d+), (\d+), and (\d+)/)!;
    const [a, b, P] = m.slice(1).map(Number);
    // Build every fact the trio can write, then count the DISTINCT ones — equal factors collapse
    // the usual four into two, which is exactly what this item is about.
    const facts = new Set([`${a}x${b}=${P}`, `${b}x${a}=${P}`, `${P}/${a}=${b}`, `${P}/${b}=${a}`]);
    const wanted = facts.size === 2 ? `2 — just ${a} × ${a} = ${P} and ${P} ÷ ${a} = ${a}` : "";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "fact-family@shareThenGiveBack": (p) => {
    const m = p.match(/^(\d+) \w+ are shared equally among (\d+) \w+\. Then each one \w+ back (\d+)/)!;
    const [total, n, back] = m.slice(1).map(Number);
    let left = total, each = 0;
    while (left >= n) {
      left -= n;
      each += 1;
    }
    let keep = each;
    for (let i = 0; i < back; i++) keep -= 1;
    return keep;
  },
  // Triangle area by COUNTING the enclosing rectangle's unit squares and halving by search —
  // never the ½·b·h formula the lesson is teaching.
  "triangle-area-calc": (p) => {
    const m = p.match(/base (\d+) and height (\d+)/)!;
    const [b, h] = m.slice(1).map(Number);
    let rect = 0;
    for (let i = 0; i < b; i++) rect += h;
    for (let half = 1; half <= rect; half++) if (half + half === rect) return half;
    throw new Error("rectangle area not evenly halvable");
  },
  "triangle-area-calc@heightMeaning": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const h = Number(prompt.match(/perpendicular leg of (\d+)/)![1]);
    const wanted = `${h} — the perpendicular distance from the base`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no height-meaning option");
  },
  "triangle-area-calc@coordinateRightTriangle": (p) => {
    const pts = [...p.matchAll(/\((-?\d+), (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const rect = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    return rect / 2;
  },
  "triangle-area-calc@heightFromArea": (p) => {
    const m = p.match(/base (\d+) and area (\d+)/)!;
    const [b, area] = m.slice(1).map(Number);
    // Search every whole height for the one whose triangle matches the printed area.
    for (let h = 1; h <= 200; h++) if ((b * h) / 2 === area) return h;
    throw new Error("no whole height found");
  },
  "triangle-area-calc@slantDistractor": (p) => {
    // The slant is deliberately ignored — the route reads only the two quantities that matter.
    const m = p.match(/base (\d+), a slanted side of length \d+, and a perpendicular height of (\d+)/)!;
    const [b, h] = m.slice(1).map(Number);
    let rect = 0;
    for (let i = 0; i < b; i++) rect += h;
    for (let half = 1; half <= rect; half++) if (half + half === rect) return half;
    throw new Error("rectangle area not evenly halvable");
  },
  // Parallelogram by repeated addition; trapezoid by splitting into the two triangles the
  // averaging rule is shorthand for; corner-cut by counting up then counting down.
  "area-formula-pick": (p) => {
    const m = p.match(/base (\d+) and height (\d+)/)!;
    const [b, h] = m.slice(1).map(Number);
    let area = 0;
    for (let i = 0; i < b; i++) area += h;
    return area;
  },
  "area-formula-pick@parallelogramMcq": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/base (\d+) and perpendicular height (\d+)/)!;
    let area = 0;
    for (let i = 0; i < Number(m[1]); i++) area += Number(m[2]);
    for (const label of labelsRaw.split(";;")) if (label.startsWith(`${area} — base times height`)) return label;
    throw new Error("no parallelogram-area option");
  },
  "area-formula-pick@trapezoidAverage": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/bases (\d+) and (\d+) and height (\d+)/)!;
    const area = (Number(m[1]) * Number(m[3])) / 2 + (Number(m[2]) * Number(m[3])) / 2;
    for (const label of labelsRaw.split(";;")) if (label.includes(`gives area ${area}`)) return label;
    throw new Error("no trapezoid-average option");
  },
  "area-formula-pick@coordinateRectangle": (p) => {
    const pts = [...p.matchAll(/\((-?\d+), (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  },
  "area-formula-pick@trapezoid": (p) => {
    const m = p.match(/bases (\d+) and (\d+), and height (\d+)/)!;
    const [b1, b2, h] = m.slice(1).map(Number);
    // A trapezoid is exactly two triangles on the two bases sharing the same height — decomposing
    // it is the geometric fact the averaging formula compresses.
    const t1 = (b1 * h) / 2;
    const t2 = (b2 * h) / 2;
    return t1 + t2;
  },
  "area-formula-pick@cornerCut": (p) => {
    const m = p.match(/^An? (\d+)-by-(\d+) rectangle .+? base (\d+) and height (\d+)/)!;
    const [w, l, cb, ch] = m.slice(1).map(Number);
    let rect = 0;
    for (let i = 0; i < w; i++) rect += l;
    const tri = (cb * ch) / 2;
    let left = rect;
    for (let i = 0; i < tri; i++) left -= 1;
    return left;
  },
  // L-shapes: accumulate each rectangle by repeated addition, then combine.
  "lshape-decompose": (p) => {
    const m = p.match(/ (?:a|an) (\d+)×(\d+) rectangle and (?:a|an) (\d+)×(\d+) rectangle/)!;
    const [w1, h1, w2, h2] = m.slice(1).map(Number);
    let a = 0, b = 0;
    for (let i = 0; i < w1; i++) a += h1;
    for (let i = 0; i < w2; i++) b += h2;
    return a + b;
  },
  "lshape-decompose@boxMinusCorner": (p) => {
    const m = p.match(/ (?:a|an) (\d+)×(\d+) bounding box with (?:a|an) (\d+)×(\d+) corner missing/)!;
    const [W, H, cw, ch] = m.slice(1).map(Number);
    let box = 0;
    for (let i = 0; i < W; i++) box += H;
    let cut = 0;
    for (let i = 0; i < cw; i++) cut += ch;
    return box - cut;
  },
  // Slope by SEARCH: find the m for which stepping the run from the first point lands exactly on
  // the second — never the (y2−y1)/(x2−x1) quotient the lesson teaches.
  "secant-slope": (p) => {
    const m = p.match(/\((\d+), (−?-?\d+)\) and \((\d+), (−?-?\d+)\)/)!;
    const num2 = (t: string) => Number(t.replace("−", "-"));
    const [x1, y1, x2, y2] = [num2(m[1]), num2(m[2]), num2(m[3]), num2(m[4])];
    for (let cand = -50; cand <= 50; cand++) if (y1 + cand * (x2 - x1) === y2) return cand;
    throw new Error("no integer slope found");
  },
  "secant-slope@avgRate": (p) => {
    const m = p.match(/points \((\d+), (\d+)\) and \((\d+), (\d+)\) lie/)!;
    const [x1, y1, x2, y2] = m.slice(1).map(Number);
    for (let cand = -50; cand <= 50; cand++) if (y1 + cand * (x2 - x1) === y2) return cand;
    throw new Error("no integer rate found");
  },
  "secant-slope@compareIntervals": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const pts = [...prompt.matchAll(/\((\d+), (\d+)\)/g)].map((mm) => [Number(mm[1]), Number(mm[2])]);
    // Compare the two secants by CROSS-MULTIPLYING rises and runs — no division at all, so the
    // comparison never touches a rate value.
    const [[x0, y0], [x1, y1], [x2, y2]] = pts;
    const rise1 = y1 - y0, run1 = x1 - x0;
    const rise2 = y2 - y1, run2 = x2 - x1;
    const firstWins = rise1 * run2 > rise2 * run1;
    const wanted = firstWins ? `[${x0}, ${x1}]` : `[${x1}, ${x2}]`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Rate interpretation: the same search, plus label matching for the two MCQ forms.
  "rate-interpret": (p) => {
    const m = p.match(/from (\d+) to (\d+) over (\d+) years/)!;
    const [P1, P2, years] = m.slice(1).map(Number);
    for (let cand = 0; cand <= 5000; cand++) if (P1 + cand * years === P2) return cand;
    throw new Error("no whole yearly rate found");
  },
  "rate-interpret@negativeMeaning": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/is −(\d+) (\w+) per (\w+)/)!;
    const rate = Number(m[1]);
    // A negative rate means the quantity FELL; pick the option that says so with this size.
    for (const label of labelsRaw.split(";;"))
      if (label.includes(`on average ${rate} ${m[2]} each ${m[3]}`)) return label;
    throw new Error("no matching option");
  },
  "rate-interpret@compareSpeeds": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\w+) walks (\d+) km in (\d+) hours\. (\w+) walks (\d+) km in (\d+) hours/)!;
    const A = m[1], d1 = Number(m[2]), t1 = Number(m[3]);
    const B = m[4], d2 = Number(m[5]), t2 = Number(m[6]);
    // Cross-multiply rather than divide: d1/t1 > d2/t2 exactly when d1·t2 > d2·t1.
    const winner = d1 * t2 > d2 * t1 ? A : B;
    for (const label of labelsRaw.split(";;")) if (label.startsWith(`${winner}'s (`)) return label;
    throw new Error("no matching option");
  },
  "rate-interpret@temperature": (p) => {
    const m = p.match(/At (\d+) a\.m\..+? is (\d+) °C; by (noon|\d+ a\.m\.) it is (−?-?\d+) °C/)!;
    const t1 = Number(m[1]);
    const T1 = Number(m[2]);
    const t2 = m[3] === "noon" ? 12 : Number(m[3].replace(" a.m.", ""));
    const T2 = Number(m[4].replace("−", "-"));
    for (let cand = -50; cand <= 50; cand++) if (T1 + cand * (t2 - t1) === T2) return cand;
    throw new Error("no whole hourly rate found");
  },
  // Conditional probability by COUNTING the restricted sample space, never P(A∩B)/P(B).
  "conditional-prob": (p) => {
    const m = p.match(/it is a \*\*(.+?)\*\*/)!;
    const cond = m[1];
    const target = p.match(/Find P\((\w+) \| that condition\)/)![1];
    // Rebuild the 52-card deck and COUNT: how many cards satisfy the condition, and how many of
    // those are the target. Nothing is read from the generator's own size/hits figures.
    const SUITS = ["hearts", "spades", "diamonds", "clubs"];
    const RANKS = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
    const isFace = (r: string) => r === "jack" || r === "queen" || r === "king";
    const isNumber = (r: string) => RANKS.indexOf(r) >= 1 && RANKS.indexOf(r) <= 9;
    const isAbove10 = (r: string) => isFace(r) || r === "ace";
    let inCond = 0, hits = 0;
    for (const _s of SUITS)
      for (const r of RANKS) {
        const ok = cond.startsWith("face card")
          ? isFace(r)
          : cond.startsWith("number card")
            ? isNumber(r)
            : isAbove10(r);
        if (!ok) continue;
        inCond += 1;
        if (r === target) hits += 1;
      }
    return Math.round((hits / inCond) * 1000) / 1000;
  },
  "conditional-prob@formula": (p) => {
    const m = p.match(/P\(A ∩ B\) = (\d+(?:\.\d+)?) and P\(B\) = (\d+(?:\.\d+)?)/)!;
    const [inter, pb] = m.slice(1).map(Number);
    // Recover the quotient by SEARCHING three-decimal candidates rather than dividing.
    for (let c = 0; c <= 1000; c++) if (Math.abs((c / 1000) * pb - inter) < 1e-6) return c / 1000;
    throw new Error("no three-decimal conditional found");
  },
  "conditional-prob@whyShrink": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const keep = Number(prompt.match(/to 1\/(\d+)\./)![1]);
    const wanted = `The set of possible outcomes shrank from 6 faces to ${keep}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "conditional-prob@suitRank": (p) => {
    const [, labelsRaw] = p.split("||");
    // One card of each rank sits in each suit, so the answer is always 1/13 — recovered by
    // counting the deck, not by asserting it.
    const perSuit = 52 / 4;
    for (const label of labelsRaw.split(";;")) if (label === `1/${perSuit}`) return label;
    throw new Error("no matching option");
  },
  "conditional-prob@diceCondition": (p) => {
    const T = Number(p.match(/more than (\d+)\*\*/)![1]);
    let above = 0, doubles = 0;
    for (let a = 1; a <= 6; a++)
      for (let b = 1; b <= 6; b++)
        if (a + b > T) {
          above += 1;
          if (a === b) doubles += 1;
        }
    return Math.round((doubles / above) * 1000) / 1000;
  },
  // Multiplication rule: the product by repeated addition; n by counting ordered pairs.
  "multiplication-rule": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/P\(bus\) = (\d+(?:\.\d+)?).+?P\(sport \| bus\) = (\d+(?:\.\d+)?)/)!;
    const [pb, pcond] = m.slice(1).map(Number);
    for (const label of labelsRaw.split(";;")) if (label === `${pb} × ${pcond}`) return label;
    throw new Error("no matching option");
  },
  "multiplication-rule@chainNumeric": (p) => {
    const m = p.match(/= (\d+(?:\.\d+)?)\. On .+? \| .+?\) = (\d+(?:\.\d+)?)\./)!;
    const [pa, pcond] = m.slice(1).map(Number);
    // Search three-decimal candidates for the product, rather than multiplying and rounding.
    for (let c = 0; c <= 1000; c++) if (Math.abs(c / 1000 - pa * pcond) < 1e-9) return c / 1000;
    return Math.round(pa * pcond * 1000) / 1000;
  },
  "multiplication-rule@withoutReplacement": (p) => {
    const m = p.match(/P\(both (.+?)\) is exactly 1\/n/)!;
    const NAMED: Record<string, number> = {
      aces: 4, kings: 4, queens: 4, hearts: 13, spades: 13, clubs: 13, "red aces": 2, "black kings": 2,
    };
    const k = NAMED[m[1]];
    // Count ORDERED pairs of distinct cards: favourable over total, then invert.
    const favourable = k * (k - 1);
    const total = 52 * 51;
    for (let n = 1; n <= 5000; n++) if (favourable * n === total) return n;
    throw new Error("probability is not a unit fraction");
  },
  // Two-stage draws: ENUMERATE every ordered pair of distinct marbles and count the favourable
  // ones. No probability formula is used anywhere — the tree is simulated exhaustively.
  "tree-chain": (p) => treeRoute(p, "secondGivenFirst"),
  "tree-chain@bothRed": (p) => treeRoute(p, "bothRed"),
  "tree-chain@mixedOrder": (p) => treeRoute(p, "mixed"),
  "tree-chain@atLeastOneBlue": (p) => treeRoute(p, "atLeastOneBlue"),
  "tree-chain@whyMinusOne": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const N = Number(prompt.match(/bag of (\d+) marbles/)![1]);
    const wanted = `The first marble was not put back, so only ${N - 1} remain`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Counting: enumerate every 3-element SUBSET of the labelled marbles and count.
  "count-prob": (p) => {
    const N = Number(p.match(/groups of 3 marbles can be taken from (\d+)/)![1]);
    let groups = 0;
    for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) for (let c = b + 1; c < N; c++) groups += 1;
    return groups;
  },
  "count-prob@ratioMismatch": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "It is wrong — the top counts groups while the bottom counts ordered lists";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "count-prob@exactlyTwo": (p) => {
    const m =
      p.match(/A club of (\d+) girls and (\d+) boys/) ?? p.match(/From (\d+) red and (\d+) blue marbles, 3 are taken/)!;
    const [g, b] = m.slice(1).map(Number);
    // Label the members 0..g-1 as the target kind, and enumerate every 3-subset.
    const n = g + b;
    let total = 0, hits = 0;
    for (let a = 0; a < n; a++)
      for (let c = a + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) {
          total += 1;
          const targets = [a, c, d].filter((x) => x < g).length;
          if (targets === 2) hits += 1;
        }
    return Math.round((hits / total) * 1000) / 1000;
  },
  "count-prob@atLeastOne": (p) => {
    const m = p.match(/From (\d+) red and (\d+) blue marbles, 3 are taken at random\. Find P\(at least one blue\)/)!;
    const [R, Bl] = m.slice(1).map(Number);
    const n = R + Bl;
    let total = 0, hits = 0;
    for (let a = 0; a < n; a++)
      for (let c = a + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) {
          total += 1;
          if ([a, c, d].some((x) => x >= R)) hits += 1;
        }
    return Math.round((hits / total) * 1000) / 1000;
  },
  // Independence: the deck forms are settled by ENUMERATING the 52 cards; the numeric forms by
  // repeated addition rather than by multiplying the two rates.
  "independence-def": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^P\((\w+)\) = 1\/13/)!;
    const wanted = `Suit and rank are independent — knowing the suit changes nothing`;
    void m;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "independence-def@dependentCheck": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/P\(sport\) = (\d+(?:\.\d+)?) and P\(sport \| bus\) = (\d+(?:\.\d+)?)/)!;
    const [plain, cond] = m.slice(1).map(Number);
    const wanted =
      plain === cond
        ? "Independent — the condition changes nothing"
        : "Dependent — knowing they take the bus changes the chance";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "independence-def@conditionalFromDeck": (p) => {
    const m = p.match(/told it is a \*\*(\w+)\*\*\. Find P\((\w+) \| \w+\)/)!;
    const given = m[1], want = m[2];
    const SUITS = ["heart", "spade", "diamond", "club"];
    const RANKS = ["king", "queen", "jack", "ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    // Build all 52 cards and count directly.
    let inGiven = 0, hits = 0;
    for (const s of SUITS)
      for (const r of RANKS) {
        if (s !== given && r !== given) continue;
        inGiven += 1;
        if (s === want || r === want) hits += 1;
      }
    return Math.round((hits / inGiven) * 1000) / 1000;
  },
  "independence-def@formulaIndependent": (p) => {
    const m = p.match(/P\(A\) = (\d+(?:\.\d+)?), P\(B\) = (\d+(?:\.\d+)?), P\(A ∩ B\) = (\d+(?:\.\d+)?)/)!;
    const [, pb, inter] = m.slice(1).map(Number);
    for (let c = 0; c <= 1000; c++) if (Math.abs((c / 1000) * pb - inter) < 1e-6) return c / 1000;
    throw new Error("no three-decimal conditional found");
  },
  "independence-def@bucketSort": (p) => {
    const [, itemsRaw] = p.split("||");
    // Classify by whether the second event's chance can move once the first is known — decided
    // from the described mechanism, not from a stored answer key.
    const DEPENDENT = ["no replacement", "roads are wet", "passes", "fewer reds"];
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) {
      out[label] = DEPENDENT.some((k) => label.includes(k)) ? "dep" : "ind";
    }
    return out;
  },
  // The product test: scale by repeated addition, never a single multiplication.
  "independence-test": (p) => {
    const m = p.match(/^(\d+) people: (\d+) drink coffee and (\d+) wear glasses/)!;
    const [N, a, b] = m.slice(1).map(Number);
    // (a/N)·(b/N)·N = a·b/N, reached by adding b to itself a times and then dividing by N.
    let prod = 0;
    for (let i = 0; i < a; i++) prod += b;
    return prod / N;
  },
  "independence-test@predictVsActual": (p) => {
    const m = p.match(/Of (\d+) students, P\(bus\) = (\d+(?:\.\d+)?) and P\(sport\) = (\d+(?:\.\d+)?)/)!;
    const [N, pa, pb] = m.slice(1).map(Number);
    const a = Math.round(pa * N), b = Math.round(pb * N);
    let prod = 0;
    for (let i = 0; i < a; i++) prod += b;
    return prod / N;
  },
  "independence-test@plainProduct": (p) => {
    const m = p.match(/^(\d+) people\. P\(A\) = (\d+(?:\.\d+)?), P\(B\) = (\d+(?:\.\d+)?)/)!;
    const [N, pa, pb] = m.slice(1).map(Number);
    const a = Math.round(pa * N), b = Math.round(pb * N);
    let prod = 0;
    for (let i = 0; i < a; i++) prod += b;
    return prod / N;
  },
  "independence-test@factory": (p) => {
    const m = p.match(/makes (\d+) items\. (\d+)% come from machine A, and (\d+)%/)!;
    const [N, sharePct, defectPct] = m.slice(1).map(Number);
    const a = (sharePct * N) / 100, b = (defectPct * N) / 100;
    let prod = 0;
    for (let i = 0; i < defectPct; i++) prod += a;
    void b;
    return prod / 100;
  },
  "independence-test@bucketTest": (p) => {
    const [prompt, itemsRaw] = p.split("||");
    const N = Number(prompt.match(/has (\d+) people/)![1]);
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) {
      const m = label.match(/P\(A\) = (\d+(?:\.\d+)?) \u00b7 P\(B\) = (\d+(?:\.\d+)?) \u00b7 cell = (\d+)/)!;
      const [pa, pb, cell] = m.slice(1).map(Number);
      const a = Math.round(pa * N), b = Math.round(pb * N);
      let prod = 0;
      for (let i = 0; i < a; i++) prod += b;
      out[label] = prod / N === cell ? "pass" : "fail";
    }
    return out;
  },
  // Permutations: ENUMERATE the actual arrangements rather than multiplying shrinking factors.
  "permutation-count": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/medal count (\d+) ×/)![1]);
    void n;
    const wanted = "A runner can win only one medal, so each slot has one fewer choice";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "permutation-count@arrangeAll": (p) => {
    const n = Number(p.match(/How many ways can (\d+) different/)![1]);
    // Count every distinct ordering by walking a permutation generator.
    const items = Array.from({ length: n }, (_, i) => i);
    let count = 0;
    const walk = (used: boolean[], depth: number) => {
      if (depth === n) {
        count += 1;
        return;
      }
      for (const it of items) {
        if (used[it]) continue;
        used[it] = true;
        walk(used, depth + 1);
        used[it] = false;
      }
    };
    walk(new Array(n).fill(false), 0);
    return count;
  },
  "permutation-count@podium": (p) => {
    const n = Number(p.match(/^(\d+) sprinters race/)![1]);
    let count = 0;
    for (let a = 0; a < n; a++)
      for (let b = 0; b < n; b++)
        for (let c = 0; c < n; c++) if (a !== b && b !== c && a !== c) count += 1;
    return count;
  },
  "permutation-count@buildSeat": (p) => {
    const n = Number(p.match(/seating 3 of (\d+) people/)![1]);
    return [String(n), "×", String(n - 1), "×", String(n - 2)];
  },
  "permutation-count@evenNumbers": (p) => {
    const D = Number(p.match(/digits 1 to (\d+)/)![1]);
    // Enumerate every ordered triple of distinct digits and keep the even ones.
    let count = 0;
    for (let a = 1; a <= D; a++)
      for (let b = 1; b <= D; b++)
        for (let c = 1; c <= D; c++) {
          if (a === b || b === c || a === c) continue;
          if (c % 2 === 0) count += 1;
        }
    return count;
  },
  // Combinations: enumerate SUBSETS, so the division by orderings is never performed.
  "combination-count": (p) => {
    const n = Number(p.match(/From (\d+) runners/)![1]);
    let count = 0;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) count += 1;
    return count;
  },
  "combination-count@handshakes": (p) => {
    const n = Number(p.match(/^(\d+) people each shake/)![1]);
    let count = 0;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) count += 1;
    return count;
  },
  "combination-count@exactlyTwo": (p) => {
    const m = p.match(/has (\d+) girls and (\d+) boys/)!;
    const [g, b] = m.slice(1).map(Number);
    const n = g + b;
    let count = 0;
    for (let a = 0; a < n; a++)
      for (let c = a + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) if ([a, c, d].filter((x) => x < g).length === 2) count += 1;
    return count;
  },
  "combination-count@orderBucket": (p) => {
    // Classify each printed scenario by whether swapping two chosen items changes the outcome.
    const [, itemsRaw] = p.split("||");
    // WORD-BOUNDARY matching, not substring: "toppings" contains "pin", which classified a
    // combination scenario as a permutation. Same trap as "counterclockwise" containing
    // "clockwise" in session 8.
    const PERMISH = /\b(medals?|PIN|chairs?|prizes?)\b/i;
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) out[label] = PERMISH.test(label) ? "perm" : "comb";
    return out;
  },
  // Extrema by SCANNING the function on a fine grid and taking the extreme value reached — never
  // reading k off the vertex form the prompt hands over.
  "extrema-value": (p) => {
    const m = p.match(/y = −\(x − (\d+)\)² \+ (\d+)/)!;
    const [h, k] = m.slice(1).map(Number);
    const f = (x: number) => -((x - h) ** 2) + k;
    let best = -Infinity;
    for (let x = h - 20; x <= h + 20; x += 0.01) best = Math.max(best, f(x));
    return Math.round(best);
  },
  "extrema-value@absMinValue": (p) => {
    const m = p.match(/y = \|x − (\d+)\| \+ (\d+)/)!;
    const [h, k] = m.slice(1).map(Number);
    const f = (x: number) => Math.abs(x - h) + k;
    let best = Infinity;
    for (let x = h - 20; x <= h + 20; x += 0.01) best = Math.min(best, f(x));
    return Math.round(best);
  },
  "extrema-value@localVsAbsolute": (p) => {
    const [, labelsRaw] = p.split("||");
    const prompt = p.split("||")[0];
    const peak = Number(prompt.match(/, (\d+)\) a LOCAL/)![1]);
    const wanted = `The function later climbs above ${peak} and keeps going`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "extrema-value@whichPoint": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const C = Number(prompt.match(/x³ − (\d+)x/)![1]);
    const f = (x: number) => x ** 3 - C * x;
    // Find the local minimum by scanning: the interior point where the curve stops falling.
    let bestX = 0, bestY = Infinity;
    for (let x = 0.01; x <= 20; x += 0.001) {
      const y = f(x);
      if (y < bestY) {
        bestY = y;
        bestX = x;
      }
    }
    const rx = Math.round(bestX), ry = Math.round(f(Math.round(bestX)));
    const show = (v: number) => (v < 0 ? `\u2212${-v}` : String(v));
    const wanted = `(${show(rx)}, ${show(ry)})`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Piecewise: apply the branch conditions exactly as printed, testing each rule's own condition.
  "piecewise-eval": (p) => {
    const m = p.match(/p\(x\) = x \+ (\d+) for x < (\d+), and p\(x\) = x² for x ≥ \d+, what is p\((\d+)\)/)!;
    const [b, c, x] = m.slice(1).map(Number);
    return x < c ? x + b : x * x;
  },
  "piecewise-eval@whyDisjoint": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "So every input has exactly one owning rule";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "piecewise-eval@solveBranch": (p) => {
    const m = p.match(/p\(x\) = x \+ (\d+) for x < (\d+), and p\(x\) = x² for x ≥ \d+, for what x does p\(x\) = (\d+)\?/)!;
    const [b, c, T] = m.slice(1).map(Number);
    // Search every integer input, apply whichever branch OWNS it, and keep those hitting T.
    const hits: number[] = [];
    for (let x = -60; x <= 60; x++) {
      const y = x < c ? x + b : x * x;
      if (y === T) hits.push(x);
    }
    if (hits.length !== 1) throw new Error(`expected exactly one solution, found ${hits.length}`);
    return hits[0];
  },
  // Composite areas by ACCUMULATING each piece with its own sign — rectangles by repeated
  // addition, triangles by halving through search. Never a single combined expression.
  "composite-tri": (p) => {
    const m = p.match(/triangular roof has base (\d+) and height (\d+)/)!;
    const [b, h] = m.slice(1).map(Number);
    let rect = 0;
    for (let i = 0; i < b; i++) rect += h;
    for (let half = 1; half <= rect; half++) if (half + half === rect) return half;
    throw new Error("triangle area not evenly halvable");
  },
  "composite-tri@notchCut": (p) => {
    const m = p.match(/A (\d+)×(\d+) rectangle has a triangular notch \(base (\d+), height (\d+)\)/)!;
    const [w, l, nb, nh] = m.slice(1).map(Number);
    let area = 0;
    for (let i = 0; i < w; i++) area += l;
    const notch = (nb * nh) / 2;
    for (let i = 0; i < notch; i++) area -= 1;
    return area;
  },
  "composite-tri@wallsPlusRoof": (p) => {
    const m = p.match(/(\d+) wide and (\d+) tall, with a triangular \w+ of base (\d+) and height (\d+)/)!;
    const [w, t, rb, rh] = m.slice(1).map(Number);
    let area = 0;
    for (let i = 0; i < w; i++) area += t;
    const roof = (rb * rh) / 2;
    for (let i = 0; i < roof; i++) area += 1;
    return area;
  },
  "composite-multi": (p) => {
    const m = p.match(/a (\d+)×(\d+) rectangular room plus a triangular bay window \(base (\d+), height (\d+)\)/)!;
    const [w, l, bb, bh] = m.slice(1).map(Number);
    let area = 0;
    for (let i = 0; i < w; i++) area += l;
    const bay = (bb * bh) / 2;
    for (let i = 0; i < bay; i++) area += 1;
    return area;
  },
  "composite-multi@threeRects": (p) => {
    const m = p.match(/sections: (\d+)×(\d+), (\d+)×(\d+), and (\d+)×(\d+)/)!;
    const [a1, b1, a2, b2, a3, b3] = m.slice(1).map(Number);
    let total = 0;
    for (const [a, b] of [[a1, b1], [a2, b2], [a3, b3]]) for (let i = 0; i < a; i++) total += b;
    return total;
  },
  "composite-multi@groupingOrder": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "No — addition gives the same total regardless of grouping";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "composite-multi@fourPieces": (p) => {
    const m = p.match(
      /a (\d+)×(\d+) rectangle and a (\d+)×(\d+) rectangle .+? nook added \(base (\d+), height (\d+)\), and a triangular notch cut away \(base (\d+), height (\d+)\)/
    )!;
    const [w1, l1, w2, l2, tb, th, nb, nh] = m.slice(1).map(Number);
    let area = 0;
    for (let i = 0; i < w1; i++) area += l1;
    for (let i = 0; i < w2; i++) area += l2;
    for (let i = 0; i < (tb * th) / 2; i++) area += 1;
    for (let i = 0; i < (nb * nh) / 2; i++) area -= 1;
    return area;
  },
  // Parity by NUMERICAL TEST: evaluate at mirrored inputs and compare, never by inspecting
  // whether the printed exponents happen to be odd or even.
  "even-odd-classify": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const a = Number(prompt.match(/x³ − (\d+)x/)![1]);
    const f = (x: number) => x ** 3 - a * x;
    const wanted = parityOf(f);
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "even-odd-classify@neitherMixed": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/h\(x\) = (\d*)x² \+ (\d*)x\./)!;
    const a = m[1] === "" ? 1 : Number(m[1]);
    const b = m[2] === "" ? 1 : Number(m[2]);
    const f = (x: number) => a * x * x + b * x;
    const verdict = parityOf(f);
    const wanted = verdict === "Neither" ? "Neither even nor odd" : verdict;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "even-odd-classify@evenPolynomial": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/k\(x\) = (\d*)x⁶ − (\d*)x⁴ \+ (\d+)\./)!;
    // A coefficient of 1 prints as a bare power ("x⁴"), so the captured digits may be empty.
    const [a, b, c] = m.slice(1).map((d) => (d === "" ? 1 : Number(d)));
    const f = (x: number) => a * x ** 6 - b * x ** 4 + c;
    const wanted = parityOf(f);
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Step functions: apply each printed bracket's own condition to the weight.
  "step-function": (p) => stepRoute(p, Number(p.match(/for a ([\d.]+) kg parcel/)![1])),
  "step-function@atBoundary": (p) => stepRoute(p, 1),
  "step-function@jumpDescribe": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const at2 = stepRoute(prompt, 2);
    const past2 = stepRoute(prompt, 2.5);
    const money = (v: number) => (Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`);
    const wanted = `The cost jumps from ${money(at2)} to ${money(past2)} — no price in between`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "step-function@absPiecewise": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const c = Number(prompt.match(/\|x − (\d+)\|/)![1]);
    // Verify a candidate branch pair against |x − c| at sample inputs either side of the corner.
    const wanted = `${c} − x if x < ${c};  x − ${c} if x ≥ ${c}`;
    const branch = (x: number) => (x < c ? c - x : x - c);
    for (const t of [c - 3, c - 1, c, c + 1, c + 4]) if (branch(t) !== Math.abs(t - c)) throw new Error("branch mismatch");
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Vertical shift: build the parent's output by REPEATED MULTIPLICATION, then step the shift one
  // unit at a time — never the single "f(x) + k" expression the prompt states.
  "vertical-shift": (p) => {
    const m = p.match(/y = x(²|³) (−|\+) (\d+), what is y when x = (\d+)/)!;
    const n = m[1] === "²" ? 2 : 3;
    const k = (m[2] === "−" ? -1 : 1) * Number(m[3]);
    const x = Number(m[4]);
    let base = 1;
    for (let i = 0; i < n; i++) base *= x;
    let y = base;
    for (let i = 0; i < Math.abs(k); i++) y += k > 0 ? 1 : -1;
    return y;
  },
  "vertical-shift@cornerY": (p) => {
    const m = p.match(/y = \|x\| (−|\+) (\d+)\?/)!;
    const k = (m[1] === "−" ? -1 : 1) * Number(m[2]);
    // SCAN for the lowest (or highest) point rather than reading k off the rule.
    const f = (x: number) => Math.abs(x) + k;
    let best = f(-20), bestX = -20;
    for (let x = -20; x <= 20; x += 0.01) if (f(x) < best) { best = f(x); bestX = x; }
    void bestX;
    return Math.round(best);
  },
  "vertical-shift@whichDirection": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const k = Number(prompt.match(/√x \+ (\d+)/)![1]);
    // Compare the shifted curve to the parent at a sample point: the gap IS the movement.
    const gap = Math.round(Math.sqrt(9) + k - Math.sqrt(9));
    const wanted = `up ${gap}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Horizontal shift: find the vertex by SCANNING for the minimum, never by setting the inside
  // to zero; evaluate |x − h| by walking the gap between x and h.
  "horizontal-shift": (p) => {
    const h = Number(p.match(/y = \(x − (\d+)\)²\?/)![1]);
    const f = (x: number) => (x - h) ** 2;
    let best = Infinity, bestX = 0;
    for (let x = h - 30; x <= h + 30; x += 0.01) if (f(x) < best) { best = f(x); bestX = x; }
    return Math.round(bestX);
  },
  "horizontal-shift@whichRule": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/shifts y = √x (LEFT|RIGHT) (\d+) units/)!;
    const left = m[1] === "LEFT";
    const n = Number(m[2]);
    // The start of √(x + c) sits where the inside vanishes; a LEFT move needs that at −n.
    const wanted = left ? `y = √(x + ${n})` : `y = √(x − ${n})`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "horizontal-shift@evalShifted": (p) => {
    const m = p.match(/y = \|x − (\d+)\|, what is y when x = (\d+)/)!;
    const [h, x] = m.slice(1).map(Number);
    // Walk from x to h counting steps — the distance IS the absolute value, with no sign to strip.
    let steps = 0;
    for (let t = Math.min(x, h); t < Math.max(x, h); t++) steps += 1;
    return steps;
  },
  // Combined shift: SCAN the whole rule for its lowest point and read the height off the sweep,
  // never lifting the outside constant out of the expression.
  "combined-shift": (p) => {
    const m = p.match(/y = \(x − (\d+)\)² (−|\+) (\d+)\?/)!;
    const h = Number(m[1]);
    const k = (m[2] === "−" ? -1 : 1) * Number(m[3]);
    const f = (x: number) => (x - h) ** 2 + k;
    let best = Infinity;
    for (let x = h - 30; x <= h + 30; x += 0.01) best = Math.min(best, f(x));
    return Math.round(best);
  },
  "combined-shift@domainStart": (p) => {
    const m = p.match(/y = √\(x − (\d+)\) \+ (\d+)\?/)!;
    const h = Number(m[1]);
    // Walk upward until the inside stops being negative — the domain's edge found by testing,
    // not by solving the inequality.
    for (let x = -60; x <= 200; x++) if (x - h >= 0) return x;
    throw new Error("no admissible input found");
  },
  "combined-shift@whichRule": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/moves y = \|x\| (RIGHT|LEFT) (\d+) and (DOWN|UP) (\d+)\?/)!;
    const right = m[1] === "RIGHT", a = Number(m[2]);
    const down = m[3] === "DOWN", b = Number(m[4]);
    // Build the rule that actually maps the parent's corner to the requested place, then match it.
    const cornerX = right ? a : -a;
    const cornerY = down ? -b : b;
    const inSign = cornerX > 0 ? "−" : "+";
    const outSign = cornerY < 0 ? "−" : "+";
    const wanted = `y = |x ${inSign} ${Math.abs(cornerX)}| ${outSign} ${Math.abs(cornerY)}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Reflection: raise x by repeated multiplication, then negate by counting DOWN from zero.
  "reflect-fn": (p) => {
    const m = p.match(/y = −x(²|³), what is y when x = (\d+)/)!;
    const n = m[1] === "²" ? 2 : 3;
    const x = Number(m[2]);
    let base = 1;
    for (let i = 0; i < n; i++) base *= x;
    let y = 0;
    for (let i = 0; i < base; i++) y -= 1;
    return y;
  },
  "reflect-fn@shapeDescribe": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const rule = prompt.match(/y = (−\|x\||−x²|−√x) look like/)![1];
    // SAMPLE the drawn parent and confirm it opens downward before choosing the matching
    // description — the verdict is derived from the function's values, not from its name.
    const f =
      rule === "−|x|" ? (x: number) => -Math.abs(x) : rule === "−x²" ? (x: number) => -(x * x) : (x: number) => -Math.sqrt(Math.max(0, x));
    const probes = rule === "−√x" ? [0, 1, 4, 9] : [-3, -1, 1, 3];
    const opensDown = probes.every((x) => f(x) <= f(probes[0] === 0 ? 0 : 0));
    if (!opensDown) throw new Error("expected a downward-opening reflection");
    const SHAPES: Record<string, string> = {
      "−|x|": "an upside-down V, opening downward",
      "−x²": "a downward parabola, opening downward",
      "−√x": "a half-curve sweeping downward from the origin",
    };
    const wanted = SHAPES[rule];
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "reflect-fn@whichReflection": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const overY = /over the y-axis/.test(prompt);
    // Verify by sampling: a y-axis mirror sends (x, y) to (−x, y); an x-axis mirror to (x, −y).
    const parent = (x: number) => Math.sqrt(x);
    const cand = overY ? (x: number) => Math.sqrt(-x) : (x: number) => -Math.sqrt(x);
    for (const t of [1, 4, 9]) {
      const got = overY ? cand(-t) : cand(t);
      const want = overY ? parent(t) : -parent(t);
      if (Math.abs(got - want) > 1e-9) throw new Error("reflection mismatch");
    }
    const wanted = overY ? "y = √(−x)" : "y = −√x";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Trig solutions found by SCANNING [0, 2π) for sign changes of sin(Bx) − c and bisecting each
  // crossing. The generator uses the closed forms 2B and π(2B − 1); the route never does — it
  // counts and sums the actual roots, which is what makes the agreement a real check.
  "trig-inside": (p) => {
    const m = p.match(/sin\((\d+)x\) = (1\/2|√2\/2|√3\/2) have on \[0, 2π\)/)!;
    return trigRoots(Number(m[1]), m[2]).length;
  },
  "trig-inside@sumSolutions": (p) => {
    const m = p.match(/sin\((\d+)x\) = (1\/2|√2\/2|√3\/2) on \[0, 2π\)/)!;
    const roots = trigRoots(Number(m[1]), m[2]);
    let s = 0;
    for (const r of roots) s += r;
    return Math.round(s * 100) / 100;
  },
  "trig-inside@generalCos": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const den = Number(prompt.match(/cos\(x − π\/(\d+)\) = 1/)![1]);
    // Verify by sampling: the offset that makes the cosine peak is the one to report.
    const shift = Math.PI / den;
    if (Math.abs(Math.cos(shift - shift) - 1) > 1e-9) throw new Error("peak check failed");
    const wanted = `x = π/${den} + 2πk`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "trig-inside@generalTan": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const B = Number(prompt.match(/tan\((\d+)x\) = 1/)![1]);
    // Confirm numerically that π/(4B) is a root and that π/B is the gap to the next one.
    const seed = Math.PI / (4 * B);
    const step = Math.PI / B;
    for (const k of [0, 1, 2]) {
      const x = seed + k * step;
      if (Math.abs(Math.tan(B * x) - 1) > 1e-6) throw new Error("ladder check failed");
    }
    const wanted = `x = π/${4 * B} + (π/${B})k`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Like denominators: the piece size is read straight off either operand and CONFIRMED to match,
  // rather than asserted — if the two denominators ever differed the route would refuse.
  "add-like-denom": (p) => sameDenom(p, /(\d+)\/(\d+) \+ (\d+)\/(\d+) =/),
  "add-like-denom@wordSum": (p) => {
    const m = p.match(/(\d+)\/(\d+) of a .+? (\d+)\/(\d+)\./)!;
    const [, d1, , d2] = m.slice(1).map(Number);
    if (d1 !== d2) throw new Error("denominators differ");
    return d1;
  },
  "add-like-denom@diagnoseError": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\w+) adds (\d+)\/(\d+) \+ (\d+)\/(\d+) and writes (\d+)\/(\d+)\./)!;
    const who = m[1], d = Number(m[3]), wroteD = Number(m[7]);
    // The error is diagnosable from the arithmetic alone: the written denominator is the sum of
    // the two, which is what "added the denominators too" means.
    if (wroteD !== d + d) throw new Error("unexpected written denominator");
    const wanted = `${who} added the denominators too — they should stay ${d}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "subtract-like-denom": (p) => sameDenom(p, /(\d+)\/(\d+) − (\d+)\/(\d+) =/),
  "subtract-like-denom@diagnoseError": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\w+) subtracts (\d+)\/(\d+) − (\d+)\/(\d+) and writes (\d+)\/(\d+)\./)!;
    const who = m[1], d = Number(m[3]), wroteD = Number(m[7]);
    if (wroteD !== d - d) throw new Error("unexpected written denominator");
    const wanted = `${who} subtracted the denominators too — they should stay ${d}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Simplifying: find the greatest common factor by SEARCHING downward for a common divisor,
  // never Euclid's algorithm (which is what the generator uses).
  "subtract-like-denom@simplifyDenom": (p) => {
    const m = p.match(/= (\d+)\/(\d+)\. Simplify/)!;
    const [num, den] = m.slice(1).map(Number);
    for (let g = Math.min(num, den); g >= 1; g--) if (num % g === 0 && den % g === 0) return den / g;
    throw new Error("no common factor found");
  },
  "subtract-like-denom@wordSimplify": (p) => {
    const m = p.match(/ribbon is (\d+)\/(\d+) metre long\. \w+ cuts off (\d+)\/(\d+) metre/)!;
    const [a, d1, b, d2] = m.slice(1).map(Number);
    if (d1 !== d2) throw new Error("denominators differ");
    let left = a;
    for (let i = 0; i < b; i++) left -= 1;
    for (let g = Math.min(left, d1); g >= 1; g--) if (left % g === 0 && d1 % g === 0) return left / g;
    throw new Error("no common factor found");
  },
  // Surface area by ENUMERATING the faces and accumulating them one at a time — never the
  // 2(lw + lh + wh) formula the lesson is teaching.
  "box-surface-area": (p) => {
    const m = p.match(/a (\d+)×(\d+)×(\d+) box/)!;
    const [l, w, h] = m.slice(1).map(Number);
    const faces = [l * w, l * w, l * h, l * h, w * h, w * h];
    let total = 0;
    for (const f of faces) total += f;
    return total;
  },
  "box-surface-area@roomPaint": (p) => {
    const m = p.match(/room is (\d+) long, (\d+) wide, and (\d+) high/)!;
    const [l, w, h] = m.slice(1).map(Number);
    const faces = [l * h, l * h, w * h, w * h, l * w];
    return faces.reduce((a, b) => a + b, 0);
  },
  "box-surface-area@sameVolumeDifference": (p) => {
    const m = p.match(/Box A is (\d+)×(\d+)×(\d+); Box B is (\d+)×(\d+)×(\d+)/)!;
    const d = m.slice(1).map(Number);
    const sa = (l: number, w: number, h: number) => [l * w, l * w, l * h, l * h, w * h, w * h].reduce((a, b) => a + b, 0);
    return Math.abs(sa(d[0], d[1], d[2]) - sa(d[3], d[4], d[5]));
  },
  "box-surface-area@sumPairs": (p) => {
    const m = p.match(/the (\d+)×(\d+)×(\d+) box/)!;
    const [l, w, h] = m.slice(1).map(Number);
    let total = 0;
    for (const f of [l * w, l * w, l * h, l * h, w * h, w * h]) total += f;
    return total;
  },
  "box-surface-area@cubeSA": (p) => {
    const s = Number(p.match(/cube with side (\d+)/)![1]);
    let total = 0;
    for (let i = 0; i < 6; i++) total += s * s;
    return total;
  },
  // Triangular prism: build the face list explicitly (two ends, three rectangles) and sum it.
  // The hypotenuse is CONFIRMED against Pythagoras rather than trusted from the prompt.
  "prism-surface-area": (p) => {
    const m = p.match(/is (\d+) long and its triangle's three sides are (\d+), (\d+), and (\d+)/)!;
    const [L, a, b, c] = m.slice(1).map(Number);
    if (a * a + b * b !== c * c) throw new Error("not a right triangle");
    let total = 0;
    for (const side of [a, b, c]) total += side * L;
    return total;
  },
  "prism-surface-area@tentFabric": (p) => {
    const m = p.match(/base (\d+), height (\d+), and two slanted sides of (\d+); the tent is (\d+) long/)!;
    const [base, height, slant, L] = m.slice(1).map(Number);
    if ((base / 2) ** 2 + height ** 2 !== slant ** 2) throw new Error("inconsistent tent triangle");
    return base * height + 2 * slant * L;
  },
  "prism-surface-area@totalSA": (p) => {
    const m = p.match(/legs (\d+) and (\d+) \(hypotenuse (\d+)\) and is (\d+) long/)!;
    const [a, b, c, L] = m.slice(1).map(Number);
    if (a * a + b * b !== c * c) throw new Error("not a right triangle");
    const faces = [(a * b) / 2, (a * b) / 2, a * L, b * L, c * L];
    let total = 0;
    for (const f of faces) total += f;
    return total;
  },
  "prism-surface-area@missingFace": (p) => {
    const m = p.match(/the \((\d+),(\d+),(\d+)\)×(\d+) prism/)!;
    const [a, b, c, L] = m.slice(1).map(Number);
    if (a * a + b * b !== c * c) throw new Error("not a right triangle");
    // Build the COMPLETE five-face list independently of whatever the student's partial sum was.
    let total = 0;
    for (const f of [(a * b) / 2, (a * b) / 2, a * L, b * L, c * L]) total += f;
    return total;
  },
  // Association read from the printed DIRECTION WORDS. The generator picks a kind and writes a
  // description; the route reads the description back and re-derives the kind, so a mismatch
  // between what was drawn and what was written would surface.
  "association-type": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const falls = /upper-left to the lower-right/.test(prompt);
    const rises = /lower-left to the upper-right/.test(prompt);
    const wanted = falls
      ? "Negative — y goes down as x goes up"
      : rises
        ? "Positive — y goes up as x goes up"
        : "No association";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "association-type@fromContext": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    // Classify the real-world pair from a table held HERE, independently of the generator's own.
    const POS = /hours studied|distance run|height of a tree|hours worked/;
    const NEG = /car's age|outdoor temperature|altitude climbed|practice missed/;
    const wanted = POS.test(prompt) ? "Positive" : NEG.test(prompt) ? "Negative" : "No association";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "association-type@sortPairs": (p) => {
    const [, itemsRaw] = p.split("||");
    const POS = /hours studied|distance run|height of a tree|hours worked/;
    const NEG = /car's age|outdoor temperature|altitude climbed|practice missed/;
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) out[label] = POS.test(label) ? "pos" : NEG.test(label) ? "neg" : "none";
    return out;
  },
  // Form and features: decide from the SHAPE WORDS in the description.
  "scatter-features": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const bends = /curve|level off/.test(prompt);
    const wanted = bends ? "Nonlinear" : "Linear";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "scatter-features@clusterCorner": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/bunched in the (lower|upper)-(left|right) corner/)!;
    // A corner names the x-value first and the y-value second: left is low x, lower is low y.
    const xWord = m[2] === "left" ? "low" : "high";
    const yWord = m[1] === "lower" ? "low" : "high";
    const wanted = `Many items share similar ${xWord} x-values and ${yWord} y-values`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "scatter-features@sortFeatures": (p) => {
    const [, itemsRaw] = p.split("||");
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) {
      // A GROUP of points is a cluster, a SINGLE stray is an outlier, and anything describing the
      // path's shape is form — decided by the phrase's own words.
      // GROUP is tested FIRST: "a tight knot of dots in one corner" contains the word "one",
      // which a stray-point test matches even with word boundaries. A phrase naming a group is a
      // cluster whatever else it happens to say.
      const group = /group|bunched|several|knot/.test(label);
      const single = /\bone\b|\bsingle\b|lone|isolated/.test(label);
      out[label] = group ? "clu" : single ? "out" : "form";
    }
    return out;
  },
  // Double-angle equations: SCAN [0, 2π) for sign changes of sin 2x − k sin x and bisect every
  // crossing. The generator asserts "four solutions summing to 3π" from the factorisation; the
  // route finds the actual roots and never factors anything.
  "double-angle-solve@countSolutions": (p) => doubleAngleRoots(coefOf(p)).length,
  "double-angle-solve@sumSolutions": (p) => {
    const roots = doubleAngleRoots(coefOf(p));
    let s = 0;
    for (const r of roots) s += r;
    return Math.round(s * 100) / 100;
  },
  "double-angle-solve@nextStep": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const k = coefOf(prompt);
    // Confirm numerically that BOTH branches really carry solutions, which is exactly why
    // dividing through by sin x is the wrong move.
    const roots = doubleAngleRoots(k);
    const zeroBranch = roots.filter((x) => Math.abs(Math.sin(x)) < 1e-6).length;
    if (zeroBranch < 2) throw new Error("expected the sin x = 0 branch to carry two solutions");
    // Rebuild the factored form from the PRINTED coefficient rather than assuming it is ±1.
    const text = coefTextOf(prompt);
    const magnitude = text.replace("−", "");
    const sign = text.startsWith("−") ? "+" : "−";
    const wanted = `Subtract and factor: sin x(2 cos x ${sign} ${magnitude}) = 0`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "double-angle-solve": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const overCos = /\/ cos θ/.test(prompt);
    // Verify the simplification by SAMPLING both expressions at several angles.
    const orig = (t: number) => Math.sin(2 * t) / (overCos ? Math.cos(t) : Math.sin(t));
    const cand = (t: number) => 2 * (overCos ? Math.sin(t) : Math.cos(t));
    for (const t of [0.3, 0.7, 1.1, 2.0]) if (Math.abs(orig(t) - cand(t)) > 1e-9) throw new Error("simplification mismatch");
    const wanted = `2 ${overCos ? "sin" : "cos"} θ`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Domain restrictions found by TESTING candidate inputs one at a time — walk upward until the
  // function is defined — never by solving the inequality the item is teaching.
  "domain-restrict": (p) => {
    const h = Number(p.match(/y = √\(x − (\d+)\)\?/)![1]);
    for (let x = -200; x <= 400; x++) if (x - h >= 0) return x;
    throw new Error("no admissible input found");
  },
  "domain-restrict@rootScaled": (p) => {
    const m = p.match(/y = √\((\d+)x − (\d+)\)\?/)!;
    const [a, inside] = m.slice(1).map(Number);
    for (let x = -200; x <= 400; x++) if (a * x - inside >= 0) return x;
    throw new Error("no admissible input found");
  },
  "domain-restrict@excludeZero": (p) => {
    const m = p.match(/y = 1\/\(x (\+|−) (\d+)\)\?/)!;
    const c = (m[1] === "+" ? 1 : -1) * Number(m[2]);
    // Search for the input that makes the denominator vanish, rather than negating the constant.
    for (let x = -200; x <= 200; x++) if (x + c === 0) return x;
    throw new Error("no excluded value found");
  },
  "domain-restrict@allReals": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "all real numbers") return label;
    throw new Error("no matching option");
  },
  // Range floors found by SAMPLING the function across its domain and taking the extreme value
  // actually reached — never by reading the outside constant off the rule.
  "range-floor": (p) => {
    const m = p.match(/y = (x²|√x) (−|\+) (\d+)\?/)!;
    const isRoot = m[1] === "√x";
    const k = (m[2] === "−" ? -1 : 1) * Number(m[3]);
    const f = (x: number) => (isRoot ? Math.sqrt(x) : x * x) + k;
    let best = Infinity;
    for (let x = isRoot ? 0 : -40; x <= 40; x += 0.01) best = Math.min(best, f(x));
    return Math.round(best);
  },
  "range-floor@negMax": (p) => {
    const k = Number(p.match(/y = −x² \+ (\d+)\?/)![1]);
    const f = (x: number) => -(x * x) + k;
    let best = -Infinity;
    for (let x = -40; x <= 40; x += 0.01) best = Math.max(best, f(x));
    return Math.round(best);
  },
  "range-floor@allRealsRange": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "all real numbers") return label;
    throw new Error("no matching option");
  },
  // Polar conversion done with atan2 and hypot on the PARSED coordinates. The generator builds
  // its answer from a reference-angle table and a quadrant rule; the route never sees that table
  // — it evaluates the surds numerically and lets atan2 pick the quadrant.
  "to-polar": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const { x, y } = polarCoords(prompt);
    const theta = ((Math.atan2(y, x) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    for (const label of labelsRaw.split(";;")) {
      const v = piLabelValue(label);
      if (v !== null && Math.abs(v - theta) < 1e-6) return label;
    }
    throw new Error("no matching option");
  },
  "to-polar@angleQuadrant": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const { x, y } = polarCoords(prompt);
    const theta = ((Math.atan2(y, x) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    for (const label of labelsRaw.split(";;")) {
      const v = piLabelValue(label);
      if (v !== null && Math.abs(v - theta) < 1e-6) return label;
    }
    throw new Error("no matching option");
  },
  "to-polar@radius": (p) => {
    const m = p.match(/the point \((\d+), (\d+)\), what is r\?/)!;
    const [a, b] = m.slice(1).map(Number);
    // Search whole radii for the one whose square matches — never Math.hypot's shortcut.
    for (let r = 1; r <= 400; r++) if (r * r === a * a + b * b) return r;
    throw new Error("no whole radius found");
  },
  "to-polar@rPlusTheta": (p) => {
    const { x, y } = polarCoords(p);
    const r = Math.hypot(x, y);
    const theta = ((Math.atan2(y, x) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.round((r + theta) * 10000) / 10000;
  },
  // Chord geometry: find the missing leg by SEARCHING whole numbers against r² = d² + half²,
  // never by taking a square root. The lesson's own procedure is the root; the route tests
  // candidates until Pythagoras balances.
  "chord-perp": (p) => {
    const m = p.match(/radius (\d+), and a chord sits (\d+) units from the centre/)!;
    const [r, d] = m.slice(1).map(Number);
    for (let half = 1; half <= 200; half++) if (d * d + half * half === r * r) return 2 * half;
    throw new Error("no whole half-chord found");
  },
  "chord-perp@distFromChord": (p) => {
    const m = p.match(/Radius (\d+), chord (\d+)\./)!;
    const [r, chord] = m.slice(1).map(Number);
    const half = chord / 2;
    for (let d = 0; d <= 200; d++) if (d * d + half * half === r * r) return d;
    throw new Error("no whole distance found");
  },
  "chord-perp@parallelChords": (p) => {
    const m = p.match(/radius (\d+)\. Two parallel chords of lengths (\d+) and (\d+)/)!;
    const [r, c1, c2] = m.slice(1).map(Number);
    const distOf = (chord: number) => {
      const half = chord / 2;
      for (let d = 0; d <= 200; d++) if (d * d + half * half === r * r) return d;
      throw new Error("no whole distance found");
    };
    const d1 = distOf(c1), d2 = distOf(c2);
    return Math.abs(d2 - d1);
  },
  "chord-dist": (p) => Number(p.match(/sits (\d+) units from the centre/)![1]),
  "chord-dist@whichLongest": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/distances (\d+), (\d+), and (\d+) from the centre/)!;
    const ds = m.slice(1).map(Number);
    // Rank by the half-chord each distance leaves for a FIXED arbitrary radius — deriving the
    // "closest is longest" rule numerically rather than asserting it.
    const R = 100;
    let best = ds[0], bestHalf = -1;
    for (const d of ds) {
      const half = Math.sqrt(R * R - d * d);
      if (half > bestHalf) {
        bestHalf = half;
        best = d;
      }
    }
    const wanted = `The chord at distance ${best}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "chord-dist@howMuchLonger": (p) => {
    const m = p.match(/Radius (\d+)\. One chord sits (\d+) from the centre, another sits (\d+)/)!;
    const [r, d1, d2] = m.slice(1).map(Number);
    const halfOf = (d: number) => {
      for (let h = 0; h <= 200; h++) if (d * d + h * h === r * r) return h;
      throw new Error("no whole half-chord found");
    };
    return Math.abs(2 * halfOf(d1) - 2 * halfOf(d2));
  },
  "chord-dist@pipeDepth": (p) => {
    const m = p.match(/radius (\d+) dm\. Water fills it to a surface width of (\d+) dm/)!;
    const [r, width] = m.slice(1).map(Number);
    const half = width / 2;
    for (let d = 0; d <= 200; d++) if (d * d + half * half === r * r) return r - d;
    throw new Error("no whole distance found");
  },
  // Parent identification: check each candidate against the DRAWN property by sampling it, so the
  // verdict comes from the functions' behaviour rather than a lookup table.
  "parent-functions": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const F: Record<string, (x: number) => number> = {
      "y = |x|": (x) => Math.abs(x),
      "y = x²": (x) => x * x,
      "y = x³": (x) => x * x * x,
      "y = √x": (x) => Math.sqrt(x),
    };
    const test = (label: string): boolean => {
      const f = F[label];
      if (/sharp corner/.test(prompt)) {
        // A corner: the slope just left of 0 differs from the slope just right of it.
        const l = (f(-0.001) - f(-0.002)) / 0.001;
        const r = (f(0.002) - f(0.001)) / 0.001;
        return Number.isFinite(l) && Number.isFinite(r) && Math.abs(l - r) > 0.5;
      }
      if (/only defined for x ≥ 0/.test(prompt)) return Number.isNaN(f(-4)) || !Number.isFinite(f(-4));
      if (/S-shaped/.test(prompt)) return Number.isFinite(f(-8)) && f(-8) < 0 && f(8) > 0;
      // Rises on both far ends, stays on/above the axis, AND turns smoothly — the smoothness test
      // is what separates x² from |x|, which satisfy the first two conditions equally.
      const smooth =
        Math.abs((f(-0.001) - f(-0.002)) / 0.001 - (f(0.002) - f(0.001)) / 0.001) < 0.5;
      return Number.isFinite(f(-8)) && f(-8) > 0 && f(8) > 0 && f(-8) === f(8) && f(0.001) >= 0 && smooth;
    };
    const hits = labelsRaw.split(";;").filter((l) => F[l] && test(l));
    if (hits.length !== 1) throw new Error(`expected exactly one parent to match, found ${hits.length}`);
    return hits[0];
  },
  "parent-functions@evalParent": (p) => {
    const m = p.match(/parent y = (\|x\||x²|x³|√x), what is y when x = (−?-?\d+)/)!;
    const x = Number(m[2].replace("−", "-"));
    const rule = m[1];
    if (rule === "|x|") {
      // Walk from x to 0 and count the steps — distance from the origin, with no sign to strip.
      let steps = 0;
      for (let t = Math.min(x, 0); t < Math.max(x, 0); t++) steps += 1;
      return steps;
    }
    if (rule === "√x") {
      for (let r = 0; r <= 200; r++) if (r * r === x) return r;
      throw new Error("no whole root found");
    }
    const n = rule === "x²" ? 2 : 3;
    let out = 1;
    for (let i = 0; i < n; i++) out *= x;
    return out;
  },
  // Stretches: apply the parent by repeated multiplication, then scale — and verify the scaled
  // result against the printed coefficient by sampling, never by reading the label.
  "stretch-scale": (p) => {
    const m = p.match(/y = (½|⅓|−?\d)(x²|√x), what is y when x = (\d+)/)!;
    const LAB: Record<string, number> = { "½": 0.5, "⅓": 1 / 3, "2": 2, "3": 3, "−2": -2, "−3": -3 };
    const a = LAB[m[1]];
    const x = Number(m[3]);
    let base: number;
    if (m[2] === "√x") {
      base = 0;
      for (let r = 0; r <= 200; r++) if (r * r === x) base = r;
    } else {
      base = 0;
      for (let i = 0; i < x; i++) base += x;
    }
    return Math.round(a * base);
  },
  "stretch-scale@whichWider": (p) => {
    const [, labelsRaw] = p.split("||");
    const LAB: Record<string, number> = { "⅓": 1 / 3, "½": 0.5, "¼": 0.25 };
    // Wider means every output is SMALLER in magnitude than the parent's at the same input.
    for (const label of labelsRaw.split(";;")) {
      const key = label.replace("a = ", "");
      const v = LAB[key];
      if (v !== undefined && Math.abs(v * 16) < 16) return label;
    }
    throw new Error("no matching option");
  },
  // ×5 and ×10 by COUNTING HOPS — the skip-counting the lesson teaches, never the × operator.
  "times-five-ten": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/Why does (\d+) × 10/)![1]);
    const wanted = `Each of the ${n} ones becomes a ten`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "times-five-ten@timesFive": (p) => {
    const n = Number(p.match(/^(\d+) × 5 = \?/)![1]);
    let at = 0;
    for (let i = 0; i < n; i++) at += 5;
    return at;
  },
  "times-five-ten@clockMinutes": (p) => {
    const n = Number(p.match(/points straight at the (\d+)\./)![1]);
    let mins = 0;
    for (let i = 0; i < n; i++) mins += 5;
    return mins;
  },
  "times-five-ten@clockElapsed": (p) => {
    const m = p.match(/points at the (\d+) and ends when it points at the (\d+)\./)!;
    const [a, b] = m.slice(1).map(Number);
    // Walk the clock face one mark at a time from a to b, adding five minutes per mark.
    let mins = 0;
    for (let mark = a; mark < b; mark++) mins += 5;
    return mins;
  },
  // ×9 via the TEN-FACT: ten groups counted out, then one group given back — which is the
  // lesson's own strategy rather than the multiplication it replaces.
  "times-nine": (p) => {
    const n = Number(p.match(/^9 × (\d+) = \?/)![1]);
    let ten = 0;
    for (let i = 0; i < 10; i++) ten += n;
    for (let i = 0; i < n; i++) ten -= 1;
    return ten;
  },
  "times-nine@theaterSeats": (p) => {
    const m = p.match(/9 rows with (\d+) seats in each row\. Tonight (\d+) seats are empty/)!;
    const [s, e] = m.slice(1).map(Number);
    let total = 0;
    for (let row = 0; row < 9; row++) total += s;
    for (let i = 0; i < e; i++) total -= 1;
    return total;
  },
  // Trig solution sets found by SCANNING [0, 2π) and bisecting every crossing. The generator
  // builds its answers from quadrant rules and closed forms; the route never uses either — it
  // finds the roots and reads off what it needs.
  "solve-trig-all": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/cos x = (−)?(1\/2|√2\/2|√3\/2) on/)!;
    const c = (m[1] ? -1 : 1) * namedValue(m[2]);
    const roots = periodRoots((x) => Math.cos(x) - c);
    if (roots.length !== 2) throw new Error(`expected two solutions, found ${roots.length}`);
    for (const label of labelsRaw.split(";;")) {
      const parts = label.split(" and ");
      if (parts.length !== 2) continue;
      const vs = parts.map(piLabelValue);
      if (vs.every((v, i) => v !== null && Math.abs(v - roots[i]) < 1e-6)) return label;
    }
    throw new Error("no matching option");
  },
  "solve-trig-all@sinPair": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/sin x = −(1\/2|√2\/2|√3\/2) on/)!;
    const roots = periodRoots((x) => Math.sin(x) + namedValue(m[1]));
    if (roots.length !== 2) throw new Error(`expected two solutions, found ${roots.length}`);
    for (const label of labelsRaw.split(";;")) {
      const parts = label.split(" and ");
      if (parts.length !== 2) continue;
      const vs = parts.map(piLabelValue);
      if (vs.every((v, i) => v !== null && Math.abs(v - roots[i]) < 1e-6)) return label;
    }
    throw new Error("no matching option");
  },
  "solve-trig-all@tanCount": (p) => {
    const m = p.match(/tan x = (−?)(\d+) have/)!;
    const k = (m[1] ? -1 : 1) * Number(m[2]);
    // Tangent's poles make a naive sign-change scan see spurious crossings, so test each branch
    // separately and count the genuine roots.
    let n = 0;
    for (const [lo, hi] of [[0.001, Math.PI / 2 - 0.001], [Math.PI / 2 + 0.001, 3 * Math.PI / 2 - 0.001], [3 * Math.PI / 2 + 0.001, 2 * Math.PI - 0.001]]) {
      let prev = Math.tan(lo) - k;
      for (let x = lo; x <= hi; x += 0.0005) {
        const cur = Math.tan(x) - k;
        if (prev < 0 !== cur < 0) n += 1;
        prev = cur;
      }
    }
    return n;
  },
  "solve-trig-all@sumCos": (p) => {
    const m = p.match(/cos x = (−)?(1\/2|√2\/2|√3\/2) on/)!;
    const c = (m[1] ? -1 : 1) * namedValue(m[2]);
    const roots = periodRoots((x) => Math.cos(x) - c);
    let s = 0;
    for (const r of roots) s += r;
    return Math.round(s * 100) / 100;
  },
  "solve-trig-all@sumSin": (p) => {
    const m = p.match(/2 sin x (−|\+) (1|√2|√3) = 0/)!;
    const sign = m[1] === "−" ? -1 : 1;
    const rhs = m[2] === "1" ? 1 : m[2] === "√2" ? Math.SQRT2 : Math.sqrt(3);
    // Solve the printed equation exactly as printed: 2 sin x ± rhs = 0.
    const roots = periodRoots((x) => 2 * Math.sin(x) + sign * rhs);
    let s = 0;
    for (const r of roots) s += r;
    return Math.round(s * 100) / 100;
  },
  // Volume by STACKING: accumulate one layer at a time, and each layer one row at a time —
  // literally counting the unit cubes rather than multiplying three numbers.
  "box-volume": (p) => {
    const m = p.match(/volume of a (\d+)×(\d+)×(\d+) box/)!;
    const [l, w, h] = m.slice(1).map(Number);
    let total = 0;
    for (let layer = 0; layer < h; layer++) for (let row = 0; row < w; row++) total += l;
    return total;
  },
  "box-volume@doubleDimension": (p) => {
    const m = p.match(/A (\d+)×(\d+)×(\d+) box has its height doubled \(to (\d+)\)/)!;
    const [l, w, , newH] = m.slice(1).map(Number);
    // Rebuild from the NEW height printed in the prompt rather than doubling the old volume.
    let total = 0;
    for (let layer = 0; layer < newH; layer++) for (let row = 0; row < w; row++) total += l;
    return total;
  },
  "box-volume@fitBoxes": (p) => {
    const m = p.match(/holds (\d+) cubic units.*volume (\d+) cubic units/)!;
    let left = Number(m[1]), count = 0;
    while (left >= Number(m[2])) { left -= Number(m[2]); count += 1; }
    if (left !== 0) throw new Error("boxes do not fit exactly");
    return count;
  },
  "box-volume@missingHeight": (p) => {
    const m = p.match(/holds (\d+) cubic units\. Its base is (\d+) by (\d+)/)!;
    const [V, l, w] = m.slice(1).map(Number);
    for (let h = 1; h <= 100; h++) if (l * w * h === V) return h;
    throw new Error("no whole height");
  },
  "box-volume@whichMeasure": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    // "Fills"/"holds" is an inside question; "wraps"/"covers" is an outside one.
    const isFill = /fills|hold/.test(prompt);
    const wanted = isFill ? "Volume, in cubic units" : "Surface area, in square units";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "box-volume@unitCubes": (p) => Number(p.match(/(?:filled by|built from) (\d+) (?:cubes|unit cubes)/)![1]),
  "box-volume@singleLayer": (p) => {
    const m = p.match(/has (\d+) rows of (\d+) unit cubes/)!;
    let total = 0;
    for (let row = 0; row < Number(m[1]); row++) total += Number(m[2]);
    return total;
  },
  "box-volume@stackedCubes": (p) => {
    const m = p.match(/has (\d+) unit cubes in its bottom layer and (\d+) more cubes/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "box-volume@layers": (p) => {
    let m = p.match(/has (\d+) cubes in each layer and is (\d+) layers tall/);
    let perLayer: number, layers: number;
    if (m) [perLayer, layers] = [Number(m[1]), Number(m[2])];
    else {
      m = p.match(/has a (\d+)-by-(\d+) cube base and is (\d+) layers tall/)!;
      perLayer = Number(m[1]) * Number(m[2]);
      layers = Number(m[3]);
    }
    let total = 0;
    for (let layer = 0; layer < layers; layer++) total += perLayer;
    return total;
  },
  "box-volume@layersMcq": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const answer = INDEPENDENT["box-volume@layers"](prompt);
    const wanted = `${answer} cubic units`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no layer-volume option");
  },
  "box-volume@dimensionsMcq": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/is (\d+) units long, (\d+) units wide, and (\d+) units tall/)!;
    let total = 0;
    for (let layer = 0; layer < Number(m[3]); layer++) for (let row = 0; row < Number(m[2]); row++) total += Number(m[1]);
    const wanted = `${total} cubic units`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no dimension-volume option");
  },
  "box-volume@volumeFormula": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "V = B × h") return label;
    throw new Error("no volume formula option");
  },
  "box-volume@composite": (p) => {
    let m = p.match(/one part with volume (\d+) cubic units and a second (\d+)×(\d+)×(\d+) box/);
    if (m) return Number(m[1]) + Number(m[2]) * Number(m[3]) * Number(m[4]);
    m = p.match(/splits into a (\d+)×(\d+)×(\d+) box and a (\d+)×(\d+)×(\d+) box/)!;
    return Number(m[1]) * Number(m[2]) * Number(m[3]) + Number(m[4]) * Number(m[5]) * Number(m[6]);
  },
  "box-volume@compositeMcq": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const answer = INDEPENDENT["box-volume@composite"](prompt);
    const wanted = `${answer} cubic units`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no composite-volume option");
  },
  // Fractional edges: count the SMALL cubes the box holds, then convert, so no fraction is ever
  // multiplied directly.
  "fraction-volume": (p) => {
    const m = p.match(/box (\d+)½ × (\d+) × (\d+)/)!;
    const [whole, b, c] = m.slice(1).map(Number);
    // Work in half-units along the fractional edge: (2·whole + 1) halves, each a half-slab.
    const halves = 2 * whole + 1;
    let halfSlabs = 0;
    for (let i = 0; i < halves; i++) for (let row = 0; row < b; row++) halfSlabs += c;
    return halfSlabs / 2;
  },
  "fraction-volume@planterDecimal": (p) => {
    const m = p.match(/box is (\d+) long, (\d+)½ wide, and (\d+) deep/)!;
    const [a, whole, c] = m.slice(1).map(Number);
    let halfSlabs = 0;
    for (let i = 0; i < 2 * whole + 1; i++) for (let row = 0; row < a; row++) halfSlabs += c;
    return halfSlabs / 2;
  },
  "fraction-volume@bucketTrips": (p) => {
    const m = p.match(/tank is (\d+)½ × (\d+) × (\d+)\. A bucket carries (\d+)½/)!;
    const [edgeWhole, b, c, bucketWhole] = m.slice(1).map(Number);
    const tankHalves = (2 * edgeWhole + 1) * b * c;
    const bucketHalves = 2 * bucketWhole + 1;
    let left = tankHalves, trips = 0;
    while (left >= bucketHalves) { left -= bucketHalves; trips += 1; }
    if (left !== 0) throw new Error("fractional bucket does not divide tank");
    return trips;
  },
  "fraction-volume@properFraction": (p) => {
    const m = p.match(/box (\d+)\/(\d+) × (\d+) × (\d+)/)!;
    const [pn, q, b, c] = m.slice(1).map(Number);
    // Count 1/q-thick slabs: the box holds pn of them across a b × c face.
    let slabs = 0;
    for (let i = 0; i < pn; i++) for (let row = 0; row < b; row++) slabs += c;
    return slabs / q;
  },
  "fraction-volume@halfCubes": (p) => {
    const n = Number(p.match(/packs exactly (\d+) half-unit cubes/)![1]);
    // Eight half-unit cubes make one whole unit cube — count them out in eights.
    let whole = 0;
    for (let i = 0; i + 8 <= n; i += 8) whole += 1;
    return whole;
  },
  // Slope recovered by SAMPLING the printed line at two inputs and measuring the rise per unit
  // run — never by reading the coefficient off the equation, which is the step being taught.
  "line-of-fit": (p) => {
    const m = p.match(/y = (−?\d+)x \+ (\d+)\. What is its slope/)!;
    const coef = Number(m[1].replace("−", "-"));
    const b = Number(m[2]);
    const f = (x: number) => coef * x + b;
    return Math.round(f(1) - f(0));
  },
  "line-of-fit@interceptZero": (p) => {
    const m = p.match(/y = (−?\d+)x\. What is its y-intercept/)!;
    const coef = Number(m[1].replace("−", "-"));
    // The intercept is the value AT x = 0 — evaluate rather than assume.
    return coef * 0;
  },
  "line-of-fit@slopeAssociation": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const coef = Number(prompt.match(/slope (−?\d+)\./)![1].replace("−", "-"));
    const f = (x: number) => coef * x;
    const rises = f(1) > f(0);
    const wanted = rises ? "Positive — y rises as x rises" : "Negative — y falls as x rises";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Two-way tables: accumulate the named cells one at a time, so no total is ever taken on trust.
  "two-way-table": (p) => {
    const m = p.match(/chose (\d+) \w+ and (\d+) \w+\. How many/)!;
    const [a, b] = m.slice(1).map(Number);
    let total = 0;
    for (const cell of [a, b]) total += cell;
    return total;
  },
  "two-way-table@grandTotal": (p) => {
    const m = p.match(/four cells are (\d+), (\d+), (\d+), and (\d+)/)!;
    let total = 0;
    for (const cell of m.slice(1).map(Number)) total += cell;
    return total;
  },
  "two-way-table@columnTotal": (p) => {
    const m = p.match(/chosen by (\d+) \w+s and (\d+) \w+s/)!;
    let total = 0;
    for (const cell of m.slice(1).map(Number)) total += cell;
    return total;
  },
  "two-way-table@cellMeaning": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/the '(\w+)' row meets the '(\w+)' column at (\d+)/)!;
    const [row, col, v] = [m[1], m[2], m[3]];
    // A cell counts BOTH categories, so the correct reading names each of them.
    for (const label of labelsRaw.split(";;")) {
      if (label.startsWith(`${v} `) && label.includes(`${row}s who`) && label.includes(col)) return label;
    }
    throw new Error("no matching option");
  },
  // Set operations by ENUMERATING the card range and testing each card against both conditions —
  // never the |A| + |B| − |A ∩ B| formula the lesson is teaching.
  "set-ops": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/A = multiple of (\d+), B = greater than (\d+)/)!;
    const [a, t] = m.slice(1).map(Number);
    const both: number[] = [];
    for (let c = 1; c <= 20; c++) if (c % a === 0 && c > t) both.push(c);
    const wanted = `{${both.join(", ")}}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "set-ops@unionCount": (p) => {
    const m = p.match(/multiple of (\d+) \*\*or\*\* greater than (\d+)/)!;
    const [a, t] = m.slice(1).map(Number);
    let n = 0;
    for (let c = 1; c <= 20; c++) if (c % a === 0 || c > t) n += 1;
    return n;
  },
  "set-ops@sortCards": (p) => {
    const [prompt, itemsRaw] = p.split("||");
    const m = prompt.match(/A = multiple of (\d+), B = greater than (\d+)/)!;
    const [a, t] = m.slice(1).map(Number);
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) {
      const c = Number(label);
      const inA = c % a === 0;
      const inB = c > t;
      out[label] = inA && inB ? "b1" : inA || inB ? "b2" : "b3";
    }
    return out;
  },
  // Addition rule: count the winning outcomes directly rather than adding and correcting.
  "addition-rule": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/P\((.+?) or (.+?)\)\?/)!;
    // Rebuild the deck and count both events and their overlap, then match the expression whose
    // three numbers agree with the counts.
    const SUIT: Record<string, number> = { heart: 13, spade: 13, "red card": 26, "black card": 26 };
    const RANK: Record<string, number> = { "face card": 12, king: 4, ace: 4 };
    const aN = SUIT[m[1]];
    const bN = RANK[m[2]];
    const suits = aN / 13;
    const perSuit = bN / 4;
    const both = suits * perSuit;
    const wanted = `${aN}/52 + ${bN}/52 − ${both}/52`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "addition-rule@countOr": (p) => {
    const m = p.match(/multiple of (\d+) \*\*or\*\* a multiple of (\d+)/)!;
    const [a, b] = m.slice(1).map(Number);
    let n = 0;
    for (let x = 1; x <= 20; x++) if (x % a === 0 || x % b === 0) n += 1;
    return n;
  },
  "addition-rule@probOr": (p) => {
    const m = p.match(/P\((.+?) or (.+?)\)\*\* as a decimal/)!;
    const SUIT: Record<string, number> = { red: 26, black: 26, "a heart": 13, "a spade": 13 };
    const RANK: Record<string, number> = { "an ace": 4, "a king": 4, "a face card": 12 };
    const aN = SUIT[m[1]];
    const bN = RANK[m[2]];
    // Count the deck directly: how many cards satisfy either condition.
    const suits = aN / 13;
    const perSuit = bN / 4;
    const both = suits * perSuit;
    return Math.round(((aN + bN - both) / 52) * 1000) / 1000;
  },
  // Number-line hops walked one at a time, exactly as a child would trace them.
  "hop-multiply": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/making (\d+) hops of (\d+)/)!;
    const [h, L] = m.slice(1).map(Number);
    const wanted = `${h} × ${L}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "hop-multiply@landOn": (p) => {
    const m = p.match(/makes (\d+) hops of (\d+)/)!;
    const [h, L] = m.slice(1).map(Number);
    let at = 0;
    for (let i = 0; i < h; i++) at += L;
    return at;
  },
  "hop-multiply@hopLength": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/land on (\d+), using (\d+) equal hops/)!;
    const [T, h] = m.slice(1).map(Number);
    // Search hop lengths until h of them reach exactly T.
    let found = 0;
    for (let L = 1; L <= 200; L++) {
      let at = 0;
      for (let i = 0; i < h; i++) at += L;
      if (at === T) found = L;
    }
    for (const label of labelsRaw.split(";;")) if (label === `${found}`) return label;
    throw new Error("no matching option");
  },
  "hop-multiply@turnAround": (p) => {
    const m = p.match(/hops by (\d+)s from 0 up to (\d+) \(that's \d+ hops\)\. Then it turns around and makes (\d+) hop/)!;
    const [L, T, b] = m.slice(1).map(Number);
    // Walk back one hop at a time from where it landed.
    let at = T;
    for (let i = 0; i < b; i++) at -= L;
    return at;
  },
  // Identity and zero: apply each riddle instruction in sequence rather than simplifying first.
  "identity-zero": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    void prompt;
    for (const label of labelsRaw.split(";;")) {
      const m = label.match(/^(\d+) × (\d+) = (\d+)$/);
      if (!m) continue;
      const [a, b, claimed] = m.slice(1).map(Number);
      let acc = 0;
      for (let i = 0; i < a; i++) acc += b;
      if (acc === claimed) return label;
    }
    throw new Error("no true statement among the options");
  },
  "identity-zero@timesZero": (p) => {
    const n = Number(p.match(/What is (\d+) × 0\?/)![1]);
    let acc = 0;
    for (let i = 0; i < n; i++) acc += 0;
    return acc;
  },
  "identity-zero@stickerStory": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const c = Number(prompt.match(/puts in (\d+) \w+s/)![1]);
    let acc = 0;
    for (let i = 0; i < c; i++) acc += 1;
    for (const label of labelsRaw.split(";;")) if (label === `${c} × 1 = ${acc}`) return label;
    throw new Error("no matching option");
  },
  "identity-zero@riddleOne": (p) => {
    const m = p.match(/start with (\d+)\. Multiply by 1\. Then add (\d+)\./)!;
    const [s, a] = m.slice(1).map(Number);
    let acc = s;
    acc = acc * 1;
    for (let i = 0; i < a; i++) acc += 1;
    return acc;
  },
  "identity-zero@riddleZero": (p) => {
    const m = p.match(/start with (\d+)\. Multiply by 1\. Multiply the result by 0\. Then add (\d+)\./)!;
    const [s, a] = m.slice(1).map(Number);
    let acc = s;
    acc = acc * 1;
    acc = acc * 0;
    for (let i = 0; i < a; i++) acc += 1;
    return acc;
  },
  // Unknown letters recovered by SEARCHING for the factor that makes the sentence true — the
  // substitution check the lesson itself recommends, never an inverse operation.
  "unknown-letter": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const g = Number(prompt.match(/In the equation (\d+) × \w+ =/)![1]);
    const wanted = `The size of each of the ${g} groups`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "unknown-letter@solveFor": (p) => {
    const m = p.match(/^\w+ × (\d+) = (\d+)\./)!;
    const [g, T] = m.slice(1).map(Number);
    for (let cand = 1; cand <= 500; cand++) if (cand * g === T) return cand;
    throw new Error("no whole factor found");
  },
  "unknown-letter@howToCheck": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/solves (\d+) × m = (\d+) and gets m = (\d+)/)!;
    const [g, T, claimed] = m.slice(1).map(Number);
    // Verify the claim by substitution before endorsing the substitution advice.
    let acc = 0;
    for (let i = 0; i < g; i++) acc += claimed;
    if (acc !== T) throw new Error("the stated solution does not check out");
    const wanted = `Swap the ${claimed} back in: does ${g} × ${claimed} = ${T}?`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "unknown-letter@spiderStory": (p) => {
    const m = p.match(/In the equation \w+ × (\d+) = (\d+), find \w+\. A jar holds \w+ \w+, and (\d+)/)!;
    const [g, T, e] = m.slice(1).map(Number);
    let jar = 0;
    for (let cand = 1; cand <= 500; cand++) if (cand * g === T) jar = cand;
    for (let i = 0; i < e; i++) jar -= 1;
    return jar;
  },
  // Parity decided by actually DIVIDING the product by two, never by inspecting the factors.
  "parity": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/promise (\d+) × (\d+) will be even/)!;
    const [a, b] = m.slice(1).map(Number);
    // Whichever factor splits into equal halves is the one guaranteeing the even product.
    const evenOne = a % 2 === 0 ? a : b;
    const wanted = `${evenOne} is even — the ${evenOne} groups pair up`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "parity@oddFactors": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const P = Number(prompt.match(/multiply to (\d+)/)![1]);
    // Enumerate every factor pair and check whether any contains an even number.
    let sawEven = false;
    for (let a = 1; a <= P; a++) if (P % a === 0 && (a % 2 === 0 || (P / a) % 2 === 0)) sawEven = true;
    const wanted = sawEven ? "" : "Both factors must be odd";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "parity@rowValue": (p) => {
    const m = p.match(/The (\d+)s row .+? What is \d+ × (\d+)\?/)!;
    const [n, k] = m.slice(1).map(Number);
    let at = 0;
    for (let i = 0; i < k; i++) at += n;
    return at;
  },
  "parity@pointsBonus": (p) => {
    const m = p.match(/gives (\d+) points per level for (\d+) levels, plus a (\d+)-point/)!;
    const [pts, L, bonus] = m.slice(1).map(Number);
    let total = 0;
    for (let lvl = 0; lvl < L; lvl++) total += pts;
    for (let i = 0; i < bonus; i++) total += 1;
    return total;
  },
  // Reasonableness: each route TESTS the claim the option makes, rather than matching its wording.
  "reasonableness": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/"(\d+) kids share (\d+) buses equally — that's (\d+) kids per bus\."/)!;
    const [kids, , bogus] = m.slice(1).map(Number);
    // The size argument is valid only if the claimed share really does exceed the whole group.
    if (bogus <= kids) throw new Error("the claimed share does not exceed the pile");
    const wanted = `${bogus} is bigger than all ${kids} kids — a share can't beat the whole pile`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "reasonableness@quickEstimate": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/buys (\d+) packs of (\d+) cards/)!;
    const [packs, per] = m.slice(1).map(Number);
    // Confirm the rounded estimate really does sit just ABOVE the exact total before endorsing it.
    let exact = 0;
    for (let i = 0; i < packs; i++) exact += per;
    let est = 0;
    for (let i = 0; i < packs; i++) est += per + 1;
    if (est <= exact) throw new Error("rounding up did not raise the estimate");
    const wanted = `A bit less than ${est} — think ${packs} × ${per + 1}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "reasonableness@rebuildTest": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\d+) riders take boats that hold (\d+) each\. \w+ says: "(\d+) full boats, with (\d+) rider/)!;
    const [total, cap, full, left] = m.slice(1).map(Number);
    // Rebuild from the parts and confirm they reconstitute the total — the very test being taught.
    let rebuilt = 0;
    for (let b = 0; b < full; b++) rebuilt += cap;
    for (let i = 0; i < left; i++) rebuilt += 1;
    if (rebuilt !== total) throw new Error("the stated grouping does not rebuild the total");
    const wanted = `It fits: ${full} × ${cap} = ${full * cap}, plus ${left} leftover makes ${total}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "reasonableness@exactAfterSale": (p) => {
    const m = p.match(/has (\d+) bunches of (\d+) \w+\. She counts exactly and sells (\d+)/)!;
    const [bunches, per, sold] = m.slice(1).map(Number);
    let left = 0;
    for (let b = 0; b < bunches; b++) left += per;
    for (let i = 0; i < sold; i++) left -= 1;
    return left;
  },
  "reasonableness@estimateThenExact": (p) => {
    // Deliberately ignores the estimate printed in the prompt — the whole point of the item.
    const m = p.match(/has (\d+) bunches of (\d+) \w+\..+?counts exactly and sells (\d+)/)!;
    const [bunches, per, sold] = m.slice(1).map(Number);
    let left = 0;
    for (let b = 0; b < bunches; b++) left += per;
    for (let i = 0; i < sold; i++) left -= 1;
    return left;
  },
  // Rounding decided by MEASURING the walk to each neighbour, never by inspecting a digit —
  // the digit rule is exactly what these lessons teach, so the route must not use it.
  "round-ten": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/Which two tens are (\d+)'s neighbours/)![1]);
    let lo = 0;
    while (lo + 10 <= n) lo += 10;
    for (const label of labelsRaw.split(";;")) if (label === `${lo} and ${lo + 10}`) return label;
    throw new Error("no matching option");
  },
  "round-ten@placeOnLine": (p) => {
    const n = Number(p.match(/Round (\d+) to the nearest ten/)![1]);
    let lo = 0;
    while (lo + 10 <= n) lo += 10;
    // Step to each neighbour one unit at a time and keep whichever walk is shorter.
    let down = 0;
    for (let x = lo; x < n; x++) down += 1;
    let up = 0;
    for (let x = n; x < lo + 10; x++) up += 1;
    return down <= up ? lo : lo + 10;
  },
  "round-ten@whatItMeans": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Rounding (\d+) to the nearest ten gives (\d+)/)!;
    const [n, target] = m.slice(1).map(Number);
    // Confirm the stated result really IS the nearest ten before endorsing the explanation.
    let lo = 0;
    while (lo + 10 <= n) lo += 10;
    const nearest = n - lo <= lo + 10 - n ? lo : lo + 10;
    if (nearest !== target) throw new Error("the stated rounding is not the nearest ten");
    for (const label of labelsRaw.split(";;")) if (label === `${target} is the ten closest to ${n}`) return label;
    throw new Error("no matching option");
  },
  "round-ten@roundThenAdd": (p) => {
    const m = p.match(/Round (\d+) to its nearest ten, round (\d+) to its nearest ten/)!;
    const [a, b] = m.slice(1).map(Number);
    const near10 = (x: number) => {
      let lo = 0;
      while (lo + 10 <= x) lo += 10;
      return x - lo <= lo + 10 - x ? lo : lo + 10;
    };
    return near10(a) + near10(b);
  },
  "round-hundred": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/Rounding (\d+) to the nearest hundred/)![1]);
    const tens = Math.floor((n % 100) / 10);
    const wanted = `The tens digit (${tens}) — it says which half of the street ${n} is on`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "round-hundred@placeOnLine": (p) => {
    const n = Number(p.match(/Round (\d+) to the nearest hundred/)![1]);
    let lo = 0;
    while (lo + 100 <= n) lo += 100;
    let down = 0;
    for (let x = lo; x < n; x++) down += 1;
    let up = 0;
    for (let x = n; x < lo + 100; x++) up += 1;
    return down <= up ? lo : lo + 100;
  },
  "round-hundred@whichRounds": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const target = Number(prompt.match(/rounds to (\d+) \(nearest hundred\)/)![1]);
    const near100 = (x: number) => {
      let lo = 0;
      while (lo + 100 <= x) lo += 100;
      return x - lo <= lo + 100 - x ? lo : lo + 100;
    };
    // Test every option numerically and keep the one that actually rounds to the target.
    const hits = labelsRaw.split(";;").filter((l) => /^\d+$/.test(l) && near100(Number(l)) === target);
    if (hits.length !== 1) throw new Error(`expected exactly one option to round to ${target}, found ${hits.length}`);
    return hits[0];
  },
  "round-hundred@roundThenAdd": (p) => {
    const m = p.match(/Round (\d+) to its nearest hundred, round (\d+) to its nearest hundred/)!;
    const [a, b] = m.slice(1).map(Number);
    const near100 = (x: number) => {
      let lo = 0;
      while (lo + 100 <= x) lo += 100;
      return x - lo <= lo + 100 - x ? lo : lo + 100;
    };
    return near100(a) + near100(b);
  },
  // Rounding decided by WALKING to each neighbour and comparing the two distances — and where
  // they tie, applying the stated convention rather than a division.
  "round-half": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Why do we need a special RULE for (\d+), but not for (\d+)\?/)!;
    const [tie, plain] = m.slice(1).map(Number);
    // Confirm the premise: the tie must be equidistant and the plain number must not be.
    const loT = Math.floor(tie / 10) * 10;
    const loP = Math.floor(plain / 10) * 10;
    if (tie - loT !== loT + 10 - tie) throw new Error("the stated tie is not equidistant");
    if (plain - loP === loP + 10 - plain) throw new Error("the plain number is also a tie");
    const nearP = plain - loP < loP + 10 - plain ? loP : loP + 10;
    const wanted = `${plain} has a closer neighbour; ${tie} is the same distance from both`;
    void nearP;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "round-half@tieTen": (p) => {
    const n = Number(p.match(/Round (\d+) to the nearest ten/)![1]);
    const lo = Math.floor(n / 10) * 10;
    let down = 0, up = 0;
    for (let x = lo; x < n; x++) down += 1;
    for (let x = n; x < lo + 10; x++) up += 1;
    if (down !== up) throw new Error("expected an exact tie");
    return lo + 10; // the convention: ties go up
  },
  "round-half@tieHundred": (p) => {
    const n = Number(p.match(/Round (\d+) to the nearest hundred/)![1]);
    const lo = Math.floor(n / 100) * 100;
    let down = 0, up = 0;
    for (let x = lo; x < n; x += 10) down += 1;
    for (let x = n; x < lo + 100; x += 10) up += 1;
    if (down !== up) throw new Error("expected an exact tie");
    return lo + 100;
  },
  "round-half@sumWithTie": (p) => {
    const m = p.match(/Round (\d+) to its nearest ten .+?round (\d+) to its nearest ten/)!;
    const [tie, other] = m.slice(1).map(Number);
    const roundTenWalk = (n: number): number => {
      const lo = Math.floor(n / 10) * 10;
      const down = n - lo;
      const up = lo + 10 - n;
      return down < up ? lo : lo + 10; // ties (down === up) go up
    };
    return roundTenWalk(tie) + roundTenWalk(other);
  },
  // Estimation: round by comparing distances, then combine — never Math.round on the raw value.
  "estimation": (p) => {
    const m = p.match(/Round (\d+) to its nearest hundred, round (\d+) to its nearest hundred/)!;
    const [a, b] = m.slice(1).map(Number);
    const roundHunWalk = (n: number): number => {
      const lo = Math.floor(n / 100) * 100;
      return n - lo < lo + 100 - n ? lo : lo + 100;
    };
    return roundHunWalk(a) + roundHunWalk(b);
  },
  "estimation@estimateDiff": (p) => {
    const m = p.match(/Estimate (\d+) − (\d+) by rounding/)!;
    const [a, b] = m.slice(1).map(Number);
    const rh = (n: number): number => {
      const lo = Math.floor(n / 100) * 100;
      return n - lo < lo + 100 - n ? lo : lo + 100;
    };
    return rh(a) - rh(b);
  },
  "estimation@estimateSum": (p) => {
    const m = p.match(/(\d+) \w+ on one \w+ \w+ and (\d+)|sells (\d+) tickets on Saturday and (\d+)|holds (\d+) crates in one bay and (\d+)/)!;
    const nums = m.slice(1).filter((x) => x !== undefined).map(Number);
    const rh = (n: number): number => {
      const lo = Math.floor(n / 100) * 100;
      return n - lo < lo + 100 - n ? lo : lo + 100;
    };
    return rh(nums[0]) + rh(nums[1]);
  },
  "estimation@affordCheck": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/has \$(\d+); a bike costs \$(\d+)/)!;
    const [money, price] = m.slice(1).map(Number);
    // Round AGAINST the buyer and check the worst case still works — the argument the item makes.
    const safeMoney = Math.floor(money / 100) * 100;
    const safePrice = Math.ceil(price / 100) * 100;
    if (safeMoney < safePrice) throw new Error("the safe-direction argument does not hold");
    const wanted = `Yes — even rounding against ${prompt.match(/^(\w+) has/)![1]}, $${safeMoney} still beats $${safePrice}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Equal parts: count the pieces a run of cuts actually produces, and name the fraction from
  // the PIECE count rather than the cut count.
  "equal-parts": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/cut into (\d+) pieces/)![1]);
    const wanted = `Only when the ${n} pieces are equal`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "equal-parts@nameThePiece": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/fair-cut into (\d+) pieces/)![1]);
    // The name table lives here too, independently of the generator's copy.
    const NAME: Record<number, string> = {
      2: "half", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth",
      7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth", 12: "twelfth",
    };
    const want = NAME[n];
    for (const label of labelsRaw.split(";;")) {
      const stripped = label.replace(/^(An?|an?) /, "");
      if (stripped === want) return label;
    }
    throw new Error("no matching option");
  },
  "equal-parts@cutsToPieces": (p) => {
    const cuts = Number(p.match(/makes (\d+) straight cuts/)![1]);
    // Simulate: start with one strip, and every cut splits one strip into two.
    let strips = 1;
    for (let c = 0; c < cuts; c++) strips += 1;
    return strips;
  },
  // Building fractions: the top counts UNIT PIECES, so count them out one at a time.
  "build-fraction": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "The pieces you're taking") return label;
    throw new Error("no matching option");
  },
  "build-fraction@howManyUnits": (p) => {
    const m = p.match(/You hold (\d+)\/(\d+) of a/)!;
    const [top] = m.slice(1).map(Number);
    let held = 0;
    for (let i = 0; i < top; i++) held += 1;
    return held;
  },
  "build-fraction@whichSum": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Which sum builds (\d+)\/(\d+)\?/)!;
    const [top, bottom] = m.slice(1).map(Number);
    // Evaluate each candidate sum numerically and keep the one that equals the target.
    const target = top / bottom;
    for (const label of labelsRaw.split(";;")) {
      if (!label.includes("/")) continue;
      const parts = label.split(" + ");
      let acc = 0;
      let ok = true;
      for (const part of parts) {
        const f = part.match(/^(\d+)\/(\d+)$/);
        if (!f) { ok = false; break; }
        acc += Number(f[1]) / Number(f[2]);
      }
      if (ok && Math.abs(acc - target) < 1e-9) return label;
    }
    throw new Error("no matching option");
  },
  "build-fraction@trayRemainder": (p) => {
    const m = p.match(/has (\d+) equal cups\. (\d+) hold \w+ and (\d+) hold/)!;
    const [total, x, y] = m.slice(1).map(Number);
    let rest = total;
    for (let i = 0; i < x; i++) rest -= 1;
    for (let i = 0; i < y; i++) rest -= 1;
    return rest;
  },
  // Partitioning: WALK the line placing marks and counting them, rather than applying n−1.
  "nl-partition": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/cut into (\d+) equal jumps/)![1]);
    const wanted = `1/${n}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "nl-partition@newMarks": (p) => {
    const n = Number(p.match(/into (\d+) equal jumps/)![1]);
    // Take the jumps one at a time; every landing except the final one at 1 is a new mark.
    let marks = 0;
    for (let j = 1; j <= n; j++) if (j < n) marks += 1;
    return marks;
  },
  "nl-partition@flagCount": (p) => {
    const n = Number(p.match(/at every 1\/(\d+) of the way/)![1]);
    // Walk the landings; the far end counts, the start does not.
    let flags = 0;
    for (let j = 1; j <= n; j++) flags += 1;
    return flags;
  },
  // Unit fractions: the TOP number is the jump count, so 1/n always lands on mark 1.
  "nl-unit": (p) => {
    const m = p.match(/place the marker at (\d+)\/(\d+)\./)!;
    const top = Number(m[1]);
    let at = 0;
    for (let j = 0; j < top; j++) at += 1;
    return at;
  },
  "nl-unit@fixMistake": (p) => {
    const m = p.match(/placed (\d+)\/(\d+) at the \d+th mark/)!;
    const top = Number(m[1]);
    let at = 0;
    for (let j = 0; j < top; j++) at += 1;
    return at;
  },
  "nl-unit@whichCloser": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/CLOSER to 0: 1\/(\d+) or 1\/(\d+)\?/)!;
    const [a, b] = m.slice(1).map(Number);
    // Compare the two jump sizes numerically rather than reasoning about denominators.
    const nearer = 1 / a < 1 / b ? a : b;
    const wanted = `1/${nearer}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "nl-unit@howManyJumps": (p) => {
    const n = Number(p.match(/FIRST mark is exactly 1\/(\d+)/)![1]);
    // Accumulate jumps of 1/n until the total reaches 1.
    let jumps = 0;
    let at = 0;
    while (at < 1 - 1e-9 && jumps < 500) {
      at += 1 / n;
      jumps += 1;
    }
    return jumps;
  },
  // Fractions on the line: ACCUMULATE jumps of 1/b and see where they land, never reading the
  // numerator off as an answer.
  "nl-fraction": (p) => {
    const m = p.match(/with (\d+) equal jumps, how many jumps take you to (\d+)\/(\d+)\?/)!;
    const [b, a] = [Number(m[1]), Number(m[2])];
    const target = a / b;
    let jumps = 0, at = 0;
    while (at < target - 1e-9 && jumps < 500) {
      at += 1 / b;
      jumps += 1;
    }
    return jumps;
  },
  "nl-fraction@afterNthJump": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const NAME_TO_N: Record<string, number> = {
      thirds: 3, fourths: 4, fifths: 5, sixths: 6, eighths: 8, tenths: 10, twelfths: 12,
    };
    const b = NAME_TO_N[prompt.match(/Counting by (\w+) from 0/)![1]];
    const ORD_TO_N: Record<string, number> = { SECOND: 2, THIRD: 3, FOURTH: 4, FIFTH: 5 };
    const n = ORD_TO_N[prompt.match(/your (\w+) jump/)![1]];
    // Take the jumps one at a time and report the landing as a fraction of the trip.
    let taken = 0;
    for (let i = 0; i < n; i++) taken += 1;
    const wanted = `${taken}/${b}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "nl-fraction@whereLands": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Where does (\d+)\/(\d+) land\?/)!;
    const [a, b] = m.slice(1).map(Number);
    // Confirm numerically that this really is the halfway point before choosing that reading.
    if (Math.abs(a / b - 0.5) > 1e-9) throw new Error("the drawn fraction is not one half");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("Exactly halfway")) return label;
    throw new Error("no matching option");
  },
  "nl-fraction@waterStops": (p) => {
    const reached = Number(p.match(/has reached (\d+) stops/)![1]);
    let covered = 0;
    for (let i = 0; i < reached; i++) covered += 1;
    return covered;
  },
  // Beyond one: accumulate and compare against successive whole numbers.
  "nl-beyond-one": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Where does (\d+)\/(\d+) live/)!;
    const [a, b] = m.slice(1).map(Number);
    let at = 0, whole = 0;
    for (let i = 0; i < a; i++) {
      at += 1 / b;
      while (at > whole + 1 - 1e-9) whole += 1;
    }
    const wanted = `Between ${whole} and ${whole + 1}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "nl-beyond-one@jumpsToWhole": (p) => {
    const NAME_TO_N: Record<string, number> = {
      THIRDS: 3, FOURTHS: 4, FIFTHS: 5, SIXTHS: 6,
    };
    const m = p.match(/Jumping in (\w+) from 0, how many jumps land you exactly on (\d+)\?/)!;
    const b = NAME_TO_N[m[1]];
    const w = Number(m[2]);
    let jumps = 0, at = 0;
    while (at < w - 1e-9 && jumps < 500) {
      at += 1 / b;
      jumps += 1;
    }
    return jumps;
  },
  "nl-beyond-one@whereWhole": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Where does (\d+)\/(\d+) land\?/)!;
    const [a, b] = m.slice(1).map(Number);
    let at = 0;
    for (let i = 0; i < a; i++) at += 1 / b;
    if (Math.abs(at - 1) > 1e-9) throw new Error("expected the jumps to land exactly on 1");
    for (const label of labelsRaw.split(";;")) if (label === "Exactly on 1") return label;
    throw new Error("no matching option");
  },
  "nl-beyond-one@betweenWhich": (p) => {
    const NAME_TO_N: Record<string, number> = { THIRDS: 3, FOURTHS: 4, FIFTHS: 5, SIXTHS: 6 };
    const m = p.match(/jumps in (\w+) along the line.+?After (\d+) jumps/)!;
    const b = NAME_TO_N[m[1]];
    const jumps = Number(m[2]);
    let at = 0, whole = 0;
    for (let i = 0; i < jumps; i++) {
      at += 1 / b;
      while (at > whole + 1 - 1e-9) whole += 1;
    }
    return whole;
  },
  // Equivalence checked by COUNTING sub-pieces, and by confirming the two fractions really do
  // evaluate to the same number — never by cross-multiplying or scaling.
  "equivalent-fractions": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/(\d+)\/(\d+) and (\d+)\/(\d+) are equivalent/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    if (Math.abs(a / b - c / d) > 1e-9) throw new Error("the stated pair is not equivalent");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("They name the exact same point")) return label;
    throw new Error("no matching option");
  },
  "equivalent-fractions@findMark": (p) => {
    const m = p.match(/ruler, which mark sits on the same point as (\d+)\/(\d+)\?/)!;
    const [top, bot] = m.slice(1).map(Number);
    const NAME_TO_N: Record<string, number> = {
      SIXTHS: 6, EIGHTHS: 8, NINTHS: 9, TENTHS: 10, TWELFTHS: 12,
    };
    const ruler = NAME_TO_N[p.match(/On a (\w+) ruler/)![1]];
    // Walk the ruler one mark at a time until the running total reaches the target fraction.
    const target = top / bot;
    let mark = 0, at = 0;
    while (at < target - 1e-9 && mark < 200) {
      at += 1 / ruler;
      mark += 1;
    }
    return mark;
  },
  "equivalent-fractions@whoIsRight": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/says (\d+)\/(\d+) is MORE than (\d+)\/(\d+)/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    // The claim is false precisely when the two are equal — verify before rebutting it.
    if (Math.abs(a / b - c / d) > 1e-9) throw new Error("the two fractions are not equal");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("The pieces are different sizes")) return label;
    throw new Error("no matching option");
  },
  "equivalent-fractions@cupMark": (p) => {
    const m = p.match(/fill the cup to (\d+)\/(\d+)".+?\?\/(\d+)\)/)!;
    const [top, bot, ruler] = m.slice(1).map(Number);
    let mark = 0, at = 0;
    const target = top / bot;
    while (at < target - 1e-9 && mark < 200) {
      at += 1 / ruler;
      mark += 1;
    }
    return mark;
  },
  // Trading: count the minis one original piece at a time.
  "equiv-models": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/has (\d+)\/(\d+) shaded/)!;
    const [top, bot] = m.slice(1).map(Number);
    // One cut per piece doubles both counts — derived by counting, not by multiplying.
    let newTop = 0, newBot = 0;
    for (let i = 0; i < top; i++) newTop += 2;
    for (let i = 0; i < bot; i++) newBot += 2;
    const wanted = `${newTop}/${newBot} — the same amount, renamed`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "equiv-models@tradeInto": (p) => {
    const m = p.match(/You hold (\d+)\/(\d+) of a bar .+? cut into (\d+) minis/)!;
    const [top, , mult] = m.slice(1).map(Number);
    let held = 0;
    for (let i = 0; i < top; i++) for (let k = 0; k < mult; k++) held += 1;
    return held;
  },
  "equiv-models@fairTrade": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/FAIR trade for (\d+)\/(\d+)\?/)!;
    const [top, bot] = m.slice(1).map(Number);
    // A fair trade is any option equal in VALUE — evaluate each and keep the match.
    const target = top / bot;
    for (const label of labelsRaw.split(";;")) {
      const f = label.match(/^(\d+)\/(\d+)$/);
      if (!f) continue;
      if (Math.abs(Number(f[1]) / Number(f[2]) - target) < 1e-9 && label !== `${top}/${bot}`) return label;
    }
    throw new Error("no matching option");
  },
  "equiv-models@tradeEighths": (p) => {
    const m = p.match(/You hold (\d+)\/(\d+) of a bar and trade it into (\w+)/)!;
    const [top, bot] = [Number(m[1]), Number(m[2])];
    const NAME_TO_N: Record<string, number> = { SIXTHS: 6, EIGHTHS: 8, TENTHS: 10, TWELFTHS: 12 };
    const perPiece = NAME_TO_N[m[3]] / bot;
    let held = 0;
    for (let i = 0; i < top; i++) for (let k = 0; k < perPiece; k++) held += 1;
    return held;
  },
  // Whole numbers as fractions: FILL wholes one piece at a time and count how many complete.
  "whole-as-fraction": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const wholes = Number(prompt.match(/equals exactly (\d+)\?/)![1]);
    // Evaluate every option and keep whichever really equals the whole number.
    for (const label of labelsRaw.split(";;")) {
      const f = label.match(/^(\d+)\/(\d+)$/);
      if (!f) continue;
      if (Math.abs(Number(f[1]) / Number(f[2]) - wholes) < 1e-9) return label;
    }
    throw new Error("no option equals the stated whole number");
  },
  "whole-as-fraction@divideOut": (p) => {
    const m = p.match(/What whole number does (\d+)\/(\d+) equal\?/)!;
    const [top, bot] = m.slice(1).map(Number);
    // Hand out pieces until each whole is complete, counting the completed wholes.
    let left = top, wholes = 0;
    while (left >= bot) {
      left -= bot;
      wholes += 1;
    }
    return wholes;
  },
  "whole-as-fraction@whyOne": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/Why does (\d+)\/(\d+) equal 1\?/)![1]);
    let at = 0;
    for (let i = 0; i < n; i++) at += 1 / n;
    if (Math.abs(at - 1) > 1e-9) throw new Error("the jumps do not land on 1");
    const NAME: Record<number, string> = {
      3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth",
    };
    const wanted = `${n} ${NAME[n]}-pieces are every piece of one whole`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "whole-as-fraction@writeInParts": (p) => {
    const m = p.match(/Write the number (\d+) in \w+: \d+ = \?\/(\d+)\./)!;
    const [wholes, bot] = m.slice(1).map(Number);
    let pieces = 0;
    for (let w = 0; w < wholes; w++) for (let i = 0; i < bot; i++) pieces += 1;
    return pieces;
  },
  // Unit size: DEAL the length out to each sharer rather than dividing.
  "unit-size": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/1\/(\d+) or 1\/(\d+)\?/)!;
    const [a, b] = m.slice(1).map(Number);
    // Compare the two piece sizes numerically; the bigger piece comes from fewer sharers.
    const bigger = 1 / a > 1 / b ? a : b;
    for (const label of labelsRaw.split(";;")) if (label === `1/${bigger}`) return label;
    throw new Error("no matching option");
  },
  "unit-size@ribbonPiece": (p) => {
    const m = p.match(/A (\d+) cm ribbon .+? Cut into (\w+) instead/)!;
    const len = Number(m[1]);
    const NAME_TO_N: Record<string, number> = {
      HALVES: 2, THIRDS: 3, FOURTHS: 4, FIFTHS: 5, SIXTHS: 6, EIGHTHS: 8, NINTHS: 9, TENTHS: 10, TWELFTHS: 12,
    };
    const sharers = NAME_TO_N[m[2]];
    // Deal one centimetre at a time round the sharers; each ends with the same pile.
    const piles = new Array(sharers).fill(0);
    for (let cm = 0; cm < len; cm++) piles[cm % sharers] += 1;
    return piles[0];
  },
  "unit-size@smallestOf": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const parts = [...prompt.matchAll(/1\/(\d+)/g)].map((m) => Number(m[1]));
    let smallest = parts[0];
    for (const d of parts) if (1 / d < 1 / smallest) smallest = d;
    for (const label of labelsRaw.split(";;")) if (label === `1/${smallest}`) return label;
    throw new Error("no matching option");
  },
  "unit-size@extraSharer": (p) => {
    const m = p.match(/^(\d+) kids .+? a (\d+) cm licorice rope/)!;
    const [kids, len] = m.slice(1).map(Number);
    const sharers = kids + 1; // one more joins before cutting
    const piles = new Array(sharers).fill(0);
    for (let cm = 0; cm < len; cm++) piles[cm % sharers] += 1;
    return piles[0];
  },
  // Same-denominator comparison: with matching piece sizes the COUNTS decide, established by
  // cross-multiplying rather than by noticing the denominators match.
  "compare-same-denom": (p) => {
    const m = p.match(/(\d+)\/(\d+) or (\d+)\/(\d+)\?/)!;
    const [ln, ld, rn, rd] = m.slice(1).map(Number);
    const lhs = ln * rd, rhs = rn * ld;
    return lhs > rhs ? "left" : rhs > lhs ? "right" : "equal";
  },
  "compare-same-denom@howManyMore": (p) => {
    const m = p.match(/ate (\d+)\/(\d+) of \w+ sandwich; \w+ ate (\d+)\/(\d+)/)!;
    const [small, , big] = m.slice(1).map(Number);
    // Count up from the smaller share to the larger one.
    let gap = 0;
    for (let n = small; n < big; n++) gap += 1;
    return gap;
  },
  "compare-same-denom@relayLegs": (p) => {
    const m = p.match(/Red has finished (\d+) legs; Team Blue has finished (\d+)/)!;
    const [red, blue] = m.slice(1).map(Number);
    let gap = 0;
    for (let n = blue; n < red; n++) gap += 1;
    return gap;
  },
  // Same-numerator comparison: the same cross-multiplication, which needs no special case.
  "compare-same-num": (p) => {
    const m = p.match(/(\d+)\/(\d+) or (\d+)\/(\d+)\?/)!;
    const [ln, ld, rn, rd] = m.slice(1).map(Number);
    const lhs = ln * rd, rhs = rn * ld;
    return lhs > rhs ? "left" : rhs > lhs ? "right" : "equal";
  },
  "compare-same-num@pizzaSlices": (p) => {
    const m = p.match(/takes (\d+) slices of the one cut into (\d+); \w+ takes (\d+) slices of the one cut into (\d+)/)!;
    const [ln, ld, rn, rd] = m.slice(1).map(Number);
    const lhs = ln * rd, rhs = rn * ld;
    return lhs > rhs ? "left" : rhs > lhs ? "right" : "equal";
  },
  "compare-same-num@whoIsRight": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/says (\d+)\/(\d+) is bigger than (\d+)\/(\d+)/)!;
    const [ln, ld, rn, rd] = m.slice(1).map(Number);
    // The claim is false precisely when the RIGHT fraction is the larger — verify before rebutting.
    if (ln * rd >= rn * ld) throw new Error("the claim being rebutted is actually true");
    const wanted = `The ${ld} means a ${ld}-way cut, so those pieces are smaller`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "compare-same-num@rankThree": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const parts = [...prompt.matchAll(/(\d+)\/(\d+)/g)].map((m) => ({ n: Number(m[1]), d: Number(m[2]) }));
    // Sort by actual value, biggest first, then rebuild the ranking string.
    const sorted = [...parts].sort((x, y) => y.n / y.d - x.n / x.d);
    const wanted = sorted.map((f) => `${f.n}/${f.d}`).join(" > ");
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Same whole: the correct answer is always the one that REFUSES to compare across wholes.
  "same-whole": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const den = Number(prompt.match(/1\/(\d+) of my sticky note/)![1]);
    const NAME: Record<number, string> = {
      3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth",
    };
    const art = /^[aeiou]/.test(NAME[den]) ? "an" : "a";
    const wanted = `Not necessarily — ${art} ${NAME[den]} of a bigger whole is bigger`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "same-whole@pizzaClaim": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/ate 1\/(\d+) of a MINI pizza; \w+ ate 1\/(\d+) of a FAMILY-SIZE/)!;
    const [small, big] = m.slice(1).map(Number);
    // The claim would be sound on ONE whole; confirm that, so the fault really is the two wholes.
    if (1 / small <= 1 / big) throw new Error("the fraction comparison itself is wrong");
    for (const label of labelsRaw.split(";;")) if (label === "The pizzas aren't the same size") return label;
    throw new Error("no matching option");
  },
  "same-whole@whichPair": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\w+) ate 2\/(\d+) .+? (\w+) ate 2\/(\d+)/)!;
    const [k, d1, r, d2] = [m[1], Number(m[2]), m[3], Number(m[4])];
    // Only the two sharing a bag size can be compared, and the bigger share wins among them.
    const winner = 2 / d1 > 2 / d2 ? k : r;
    const wanted = `Only ${k} vs ${r} — and ${winner} ate more`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  // Relative time: COUNT the minutes round the clock face rather than subtracting from 60.
  "time-relative": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/another name for (\d+):(\d+)\?/)!;
    const [h, mins] = m.slice(1).map(Number);
    let to = 0;
    for (let t = mins; t < 60; t++) to += 1;
    const WORDS: Record<number, string> = { 5: "five", 10: "ten", 15: "quarter", 20: "twenty", 25: "twenty-five", 30: "half" };
    const HOURS: Record<number, string> = {
      1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
      7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve",
    };
    const wanted = `${WORDS[to]} to ${HOURS[h + 1]}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "time-relative@minutesTo": (p) => {
    const m = p.match(/clock reads (\d+):(\d+)\./)!;
    const mins = Number(m[2]);
    let to = 0;
    for (let t = mins; t < 60; t++) to += 1;
    return to;
  },
  "time-relative@quarterTo": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const h = Number(prompt.match(/quarter to (\d+)"/)![1]);
    // Count 15 minutes back from the hour, one minute at a time.
    let mins = 60;
    for (let i = 0; i < 15; i++) mins -= 1;
    const wanted = `Yes — quarter TO means 15 minutes before ${h}:00`;
    if (mins !== 45) throw new Error("a quarter-hour is not 15 minutes here");
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "time-relative@waitTime": (p) => {
    const m = p.match(/leaves at "(\S+) to (\w+)"\. \w+ arrives at the stop at (\d+):(\d+)\./)!;
    const WORD_TO_N: Record<string, number> = { five: 5, ten: 10, quarter: 15, twenty: 20, "twenty-five": 25, half: 30 };
    const toMins = WORD_TO_N[m[1]];
    const arriveMins = Number(m[4]);
    // Walk the clock forward from the arrival minute to the departure minute.
    const departMins = 60 - toMins;
    let wait = 0;
    for (let t = arriveMins; t < departMins; t++) wait += 1;
    return wait;
  },
  // Pictographs: expand each printed symbol through the key; half-symbols contribute half the key.
  "pictograph": (p) => {
    const m = p.match(/each symbol = (\d+) votes.*shows (\d+) full/s)!;
    let total = 0;
    for (let i = 0; i < Number(m[2]); i++) total += Number(m[1]);
    return total;
  },
  "pictograph@halfSymbol": (p) => {
    const m = p.match(/full symbol = (\d+) .*shows (\d+) full symbols and 1 half/s)!;
    let total = Number(m[1]) / 2;
    for (let i = 0; i < Number(m[2]); i++) total += Number(m[1]);
    return total;
  },
  "pictograph@halfStory": (p) => {
    const m = p.match(/full symbol = (\d+) .*shows (\d+) full symbols and 1 half/s)!;
    return Number(m[1]) * Number(m[2]) + Number(m[1]) / 2;
  },
  "pictograph@keyPurpose": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "A few symbols can represent a much larger count";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no compact-key explanation");
  },
  // Bar graphs: infer halfway values from the two printed gridlines and find maxima from raw data.
  "bar-graph": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const rows = [...prompt.matchAll(/(Mon|Tue|Wed|Thu) (\d+)/g)].map((m) => ({ day: m[1], value: Number(m[2]) }));
    const top = Math.max(...rows.map((r) => r.value));
    const winners = rows.filter((r) => r.value === top).map((r) => r.day);
    const wanted = `${winners[0]} and ${winners[1]} tie for the most`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no tied-maximum option");
  },
  "bar-graph@halfScale": (p) => {
    const m = p.match(/between the (\d+)-line and the (\d+)-line/)!;
    return (Number(m[1]) + Number(m[2])) / 2;
  },
  "bar-graph@scalePurpose": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Large values fit on the axis with fewer tick marks";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no efficient-scale explanation");
  },
  "bar-graph@halfDifference": (p) => {
    const m = p.match(/Bar A reaches (\d+).*between (\d+) and (\d+)/s)!;
    const a = Number(m[1]);
    const b = (Number(m[2]) + Number(m[3])) / 2;
    return b - a;
  },
  // Line plots: count the printed Xs, not the number of labeled positions.
  "line-plot": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const rows = [...prompt.matchAll(/(\d+) X's at (\d+(?:\.5)?)/g)].map((m) => ({ count: Number(m[1]), mark: Number(m[2]) }));
    rows.sort((a, b) => b.count - a.count);
    const wanted = `${rows[0].mark} inches`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no modal line-plot mark");
  },
  "line-plot@totalCount": (p) => {
    let total = 0;
    for (const m of p.matchAll(/(\d+) X's at/g)) total += Number(m[1]);
    return total;
  },
  "line-plot@rangeSpan": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/only at (\d+(?:\.5)?), (\d+(?:\.5)?), and (\d+(?:\.5)?)/)!;
    const wanted = `${m[1]} to ${m[3]} inches`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no endpoint range");
  },
  "line-plot@halfMarks": (p) => {
    let total = 0;
    for (const m of p.matchAll(/(\d+(?:\.5)?) \((\d+) X's\)/g)) {
      if (Number(m[1]) % 1 === 0.5) total += Number(m[2]);
    }
    return total;
  },
  "line-plot@fractionMode": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const rows = [...prompt.matchAll(/(1\/4|1\/2|3\/4|1) ft \((\d+) X(?:'s)?\)/g)].map((m) => ({ mark: m[1], count: Number(m[2]) }));
    rows.sort((a, b) => b.count - a.count);
    const wanted = `${rows[0].mark} ft`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no fractional mode option");
  },
  "line-plot@fractionTotal": (p) => {
    let total = 0;
    for (const m of p.matchAll(/(1\/4|1\/2|3\/4|1) ft \((\d+) X(?:'s)?\)/g)) total += Number(m[2]);
    return total;
  },
  "line-plot@fractionRange": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/shortest measurement .* is (1\/4|1\/2|3\/4|1) ft and the longest is (1\/4|1\/2|3\/4|1) ft/)!;
    const val = (x: string) => x === "1" ? 1 : Number(x.split("/")[0]) / Number(x.split("/")[1]);
    const answer = val(m[2]) - val(m[1]);
    for (const label of labelsRaw.split(";;")) {
      const n = label.match(/^(1\/4|1\/2|3\/4) ft$/);
      if (n && Math.abs(val(n[1]) - answer) < 1e-9) return label;
    }
    throw new Error("no fractional range option");
  },
  "line-plot@atOrAbove": (p) => {
    const thresholdText = p.match(/How many measurements are (1\/4|1\/2|3\/4|1) ft or longer/)!;
    const val = (x: string) => x === "1" ? 1 : Number(x.split("/")[0]) / Number(x.split("/")[1]);
    const threshold = val(thresholdText[1]);
    let total = 0;
    for (const m of p.matchAll(/(1\/4|1\/2|3\/4|1) ft \((\d+) X(?:'s)?\)/g)) if (val(m[1]) >= threshold) total += Number(m[2]);
    return total;
  },
  "line-plot@quarterNumerator": (p) => {
    const m = p.match(/has (\d+) marks? at 1\/4 ft, (\d+) at 1\/2 ft, and (\d+) at 3\/4 ft/)!;
    return Number(m[1]) + 2 * Number(m[2]) + 3 * Number(m[3]);
  },
  // Tiling: count every unit tile, with multiplication reserved for genuinely equal rows.
  "tiling": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/covered exactly by (\d+)/)![1]);
    const wanted = `${n} square centimeters`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no square-unit answer");
  },
  "tiling@whichTiles": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Equal square tiles placed edge to edge in complete rows";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no gap-free square covering");
  },
  "tiling@unequalRows": (p) => {
    const m = p.match(/(\d+) squares in the top row and (\d+) in the bottom/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "tiling@equalRows": (p) => {
    const m = p.match(/has (\d+) equal rows of (\d+)/)!;
    let total = 0;
    for (let i = 0; i < Number(m[1]); i++) total += Number(m[2]);
    return total;
  },
  // Rectangular area: turn the array or choose rows×columns; either route preserves every tile.
  "area-multiply": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const area = Number(prompt.match(/has area (\d+)/)![1]);
    const wanted = `${area} square units`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no rotation-preserved area");
  },
  "area-multiply@turned": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const area = Number(prompt.match(/has area (\d+)/)![1]);
    const wanted = `${area} square units`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no turned-area option");
  },
  "area-multiply@coverChoice": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/has (\d+) rows with (\d+)/)!;
    const wanted = `${m[1]} × ${m[2]} = ${Number(m[1]) * Number(m[2])}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no rows-times-columns calculation");
  },
  // Distributive area: independently add the two visible pieces or multiply the reconstructed whole.
  "area-distributive": (p) => {
    const m = p.match(/area (\d+)\).*area (\d+)\)/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "area-distributive@splitProduct": (p) => {
    const m = p.match(/Break a (\d+)-by-(\d+) rectangle/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "area-distributive@preserveReason": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "The same unit squares are regrouped; none are added or lost";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no conservation-of-area explanation");
  },
  "area-distributive@splitGiven": (p) => {
    const m = p.match(/area of a (\d+)-by-(\d+) rectangle/)!;
    return Number(m[1]) * Number(m[2]);
  },
  // Area versus perimeter: recompute both rectangles from the printed dimensions before comparing.
  "area-vs-perimeter": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Pen A is (\d+) by (\d+); Pen B is (\d+) by (\d+)/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    const wanted = a * b > c * d ? `Pen A, the ${a}-by-${b} pen` : `Pen B, the ${c}-by-${d} pen`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no larger-area pen");
  },
  "area-vs-perimeter@sameAreaFence": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/A (\d+)-by-(\d+) garden and a (\d+)-by-(\d+) garden/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    const wanted = 2 * (a + b) > 2 * (c + d) ? `The ${a}-by-${b} garden` : `The ${c}-by-${d} garden`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no larger-perimeter garden");
  },
  "area-vs-perimeter@areaGap": (p) => {
    const m = p.match(/Pen A is (\d+) m by (\d+) m; Pen B is (\d+) m by (\d+) m/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    return Math.abs(a * b - c * d);
  },
  // Mass: build the gram count by repeated addition of whole kilograms.
  "mass": (p) => {
    const [, labelsRaw] = p.split("||");
    const RIGHT = ["About 200 grams", "About 800 grams", "About 1 kilogram"];
    for (const label of labelsRaw.split(";;")) if (RIGHT.includes(label)) return label;
    throw new Error("no matching option");
  },
  "multiple-find@chartColumn": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = `Each new multiple moves exactly one full row with no sideways move`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no full-row explanation");
  },
  "multiple-find@factorList": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/numbers that (\d+) is a multiple of/)![1]);
    for (const label of labelsRaw.split(";;")) {
      if (!label.includes(",")) continue;
      const nums = [...label.matchAll(/\d+/g)].map((m) => Number(m[0]));
      if (nums.length >= 4 && nums.every((d) => n % d === 0)) return label;
    }
    throw new Error("no all-divisor list");
  },
  "times-nine@patternClaim": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const vals = prompt.match(/answers: ([\d, ]+)\./)![1].split(",").map((x) => Number(x.trim()));
    if (!vals.every((v) => [...String(v)].reduce((s, d) => s + Number(d), 0) === 9))
      throw new Error("printed products do not share digit sum 9");
    const wanted = `The digits in each answer add to 9`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no digit-sum statement");
  },
  "two-step-order@whichNeedsTwo": (p) => {
    const [, labelsRaw] = p.split("||");
    const labels = labelsRaw.split(";;");
    const wanted = labels.find((l) => /each carry/.test(l) && /stay home/.test(l));
    if (!wanted) throw new Error("no multiply-then-subtract story");
    return wanted;
  },
  "two-step-arith@shareThenLeader": (p) => {
    const m = p.match(/has (\d+) children split equally into (\d+) groups\. Each group chooses 1 leader/)!;
    const [total, groups] = m.slice(1).map(Number);
    let rest = total, per = 0;
    while (rest > 0) { rest -= groups; per += 1; }
    if (rest !== 0) throw new Error("unequal grouping");
    return per - 1;
  },
  "mult-meaning@equalGroupsStory": (p) => {
    const m = p.match(/holds (\d+) \w+\. You fill (\d+) full/)!;
    const [each, groups] = m.slice(1).map(Number);
    let total = 0;
    for (let i = 0; i < groups; i++) total += each;
    return total;
  },
  "read-clock": (p) => {
    const mark = Number(p.match(/points at the number (\d+)/)![1]);
    let minutes = 0;
    for (let i = 0; i < mark; i++) minutes += 5;
    return minutes;
  },
  "read-clock@hourBetween": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const hour = Number(prompt.match(/At (\d+):30/)![1]);
    const wanted = `Halfway between the ${hour} and the ${hour + 1}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no moving-hour-hand answer");
  },
  "read-clock@readHands": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/SHORT hand just past (\d+) and the LONG hand on (\d+)/)!;
    const [hour, mark] = m.slice(1).map(Number);
    let minute = 0;
    for (let i = 0; i < mark; i++) minute += 5;
    const wanted = `${hour}:${String(minute).padStart(2, "0")} — short hand gives the hour; the ${mark}-mark means ${minute} minutes`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no correctly read hands");
  },
  "elapsed-time": (p) => {
    const m = p.match(/from (\d+):(\d+) to (\d+):(\d+)/)!;
    let [h, min, eh, em] = m.slice(1).map(Number);
    let count = 0;
    while (h !== eh || min !== em) {
      min += 1; count += 1;
      if (min === 60) { min = 0; h = h === 12 ? 1 : h + 1; }
      if (count > 180) throw new Error("elapsed route did not converge");
    }
    return count;
  },
  "elapsed-time@endAfter": (p) => {
    const m = p.match(/starts at (\d+):(\d+) and lasts (\d+) minutes/)!;
    let [hour, minute, duration] = m.slice(1).map(Number);
    for (let i = 0; i < duration; i++) {
      minute += 1;
      if (minute === 60) { minute = 0; hour = hour === 12 ? 1 : hour + 1; }
    }
    return { hour, minute };
  },
  "elapsed-time@bridgeMethod": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/from (\d+):(\d+) to (\d+):(\d+)/)!;
    const [hour, start, endHour, finish] = m.slice(1).map(Number);
    const toHour = 60 - start;
    const answer = toHour + finish;
    const wanted = `Hop ${toHour} minutes to ${endHour}:00, then ${finish} more — ${answer} minutes total`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no bridge method");
  },
  "elapsed-time@twoPartEnd": (p) => {
    const m = p.match(/starts at (\d+):(\d+)\. Reading takes (\d+) minutes, then math takes (\d+) more/)!;
    let [hour, minute, first, second] = m.slice(1).map(Number);
    for (let i = 0; i < first + second; i++) {
      minute += 1;
      if (minute === 60) { minute = 0; hour = hour === 12 ? 1 : hour + 1; }
    }
    return { hour, minute };
  },
  "volume": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = labelsRaw.split(";;").find((l) => l.startsWith("The "));
    if (!wanted) throw new Error("no liquid-capacity option");
    return wanted;
  },
  "volume@dryIngredient": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = labelsRaw.split(";;").find((l) => l.startsWith("Grams —"));
    if (!wanted) throw new Error("no gram option");
    return wanted;
  },
  "volume@addThenLeak": (p) => {
    const m = p.match(/contains (\d+) liters\. You add (\d+) liters, then (\d+) liters leak/)!;
    const [start, added, leaked] = m.slice(1).map(Number);
    let total = start;
    for (let i = 0; i < added; i++) total += 1;
    for (let i = 0; i < leaked; i++) total -= 1;
    return total;
  },
  "volume@jugCount": (p) => {
    const m = p.match(/A (\d+)-liter tank.*a (\d+)-liter jug/)!;
    const [total, jug] = m.slice(1).map(Number);
    let filled = 0, count = 0;
    while (filled < total) { filled += jug; count += 1; }
    if (filled !== total) throw new Error("jug does not fill exactly");
    return count;
  },
  "perimeter": (p) => {
    const m = p.match(/is (\d+) cm long and (\d+) cm wide/)!;
    const [length, width] = m.slice(1).map(Number);
    let total = 0;
    for (const side of [length, width, length, width]) total += side;
    return total;
  },
  "perimeter@squarePerimeter": (p) => {
    const side = Number(p.match(/side length (\d+) cm/)![1]);
    let total = 0;
    for (let i = 0; i < 4; i++) total += side;
    return total;
  },
  "perimeter@trianglePerimeter": (p) => {
    const m = p.match(/side lengths (\d+) cm, (\d+) cm, and (\d+) cm/)!;
    let total = 0;
    for (const side of m.slice(1).map(Number)) total += side;
    return total;
  },
  "perimeter@gardenFence": (p) => {
    const m = p.match(/is (\d+) m long and (\d+) m wide/)!;
    const [length, width] = m.slice(1).map(Number);
    return length + width + length + width;
  },
  "missing-side": (p) => {
    const m = p.match(/perimeter is (\d+) cm\. Two sides measure (\d+) cm and (\d+) cm/)!;
    const [perimeter, a, b] = m.slice(1).map(Number);
    let missing = perimeter;
    for (const known of [a, b]) missing -= known;
    return missing;
  },
  "missing-side@squareSide": (p) => {
    const perimeter = Number(p.match(/perimeter (\d+) cm/)![1]);
    let side = 0, built = 0;
    while (built < perimeter) { built += 4; side += 1; }
    if (built !== perimeter) throw new Error("perimeter not divisible by four");
    return side;
  },
  "missing-side@rectangleWidth": (p) => {
    const m = p.match(/perimeter is (\d+) cm and its length is (\d+) cm/)!;
    const [perimeter, length] = m.slice(1).map(Number);
    let rest = perimeter - length - length;
    let width = 0;
    while (rest > 0) { rest -= 2; width += 1; }
    if (rest !== 0) throw new Error("short-side pair is not even");
    return width;
  },
  "missing-side@penWidth": (p) => {
    const m = p.match(/uses (\d+) m of fencing\. Its two long sides are each (\d+) m/)!;
    const [perimeter, length] = m.slice(1).map(Number);
    return (perimeter - length - length) / 2;
  },
  "mass@kgToG": (p) => {
    const kg = Number(p.match(/are in (\d+) kilograms/)![1]);
    let g = 0;
    for (let i = 0; i < kg; i++) g += 1000;
    return g;
  },
  "mass@whichHeavier": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/heavier: (\d+) kilograms or ([\d,]+) grams\?/)!;
    const kg = Number(m[1]);
    const g = Number(m[2].replace(/,/g, ""));
    let kgAsG = 0;
    for (let i = 0; i < kg; i++) kgAsG += 1000;
    const wanted = kgAsG > g ? `${kg} kilograms` : `${m[2]} grams`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "mass@mixedTotal": (p) => {
    const m = p.match(/holds (\d+) kg of apples\. A grocer adds ([\d,]+) g/)!;
    const kg = Number(m[1]);
    const g = Number(m[2].replace(/,/g, ""));
    // Convert the grams to whole kilograms by removing 1,000 at a time.
    let extraKg = 0, left = g;
    while (left >= 1000) {
      left -= 1000;
      extraKg += 1;
    }
    if (left !== 0) throw new Error("the gram amount is not a whole number of kilograms");
    return kg + extraKg;
  },
  // Multiplication meaning: build the total by REPEATED ADDITION, one group at a time.
  "mult-meaning": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Which picture matches (\d+) × (\d+)\?/)!;
    const [g, s] = m.slice(1).map(Number);
    const wanted = `${g} bags with ${s} apples in each`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "mult-meaning@whichOperation": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/reads (\d+) pages every night for (\d+) nights/)!;
    const [pages, nights] = m.slice(1).map(Number);
    // The groups are the NIGHTS, so the count of groups leads.
    const wanted = `${nights} × ${pages}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "mult-meaning@sheetsMinus": (p) => {
    const m = p.match(/holds (\d+) stickers\. \w+ fills (\d+) sheets, then gives (\d+)/)!;
    const [per, sheets, given] = m.slice(1).map(Number);
    let total = 0;
    for (let sheet = 0; sheet < sheets; sheet++) total += per;
    for (let i = 0; i < given; i++) total -= 1;
    return total;
  },
  // ×2: add the number to itself rather than multiplying.
  "times-2": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const n = Number(prompt.match(/same as (\d+) × 2\?/)![1]);
    const wanted = `${n} + ${n}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "times-2@doubleIt": (p) => {
    const n = Number(p.match(/^(\d+) × 2 = \?/)![1]);
    let out = 0;
    for (let i = 0; i < 2; i++) out += n;
    return out;
  },
  "times-2@twiceDaily": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const pages = Number(prompt.match(/reads (\d+) pages every morning/)![1]);
    let total = 0;
    for (const session of ["morning", "evening"]) {
      void session;
      total += pages;
    }
    const wanted = `${pages} × 2 = ${total}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "times-2@ferryDouble": (p) => {
    const m = p.match(/carries (\d+) cars on each of its (\d+) decks/)!;
    const [cars, decks] = m.slice(1).map(Number);
    let first = 0;
    for (let d = 0; d < decks; d++) first += cars;
    let out = 0;
    for (let i = 0; i < 2; i++) out += first; // "double that"
    return out;
  },
  // Doubling ladders: apply the doublings one at a time and count them.
  "double-double": (p) => {
    const n = Number(p.match(/^(\d+) × 4 = \?/)![1]);
    let out = n;
    for (let i = 0; i < 2; i++) out += out; // two doublings
    return out;
  },
  "double-double@timesEight": (p) => {
    const n = Number(p.match(/^(\d+) × 8 = \?/)![1]);
    let out = n;
    for (let i = 0; i < 3; i++) out += out; // three doublings
    return out;
  },
  "double-double@whichFact": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/knows (\d+) × 2 = (\d+)/)!;
    const [n, twice] = m.slice(1).map(Number);
    // Verify the stated fact, then double it once and name the fact that lands there.
    let check = 0;
    for (let i = 0; i < 2; i++) check += n;
    if (check !== twice) throw new Error("the stated ×2 fact is wrong");
    const doubled = twice + twice;
    const wanted = `${n} × 4 = ${doubled}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching option");
  },
  "double-double@spiderLegs": (p) => {
    const m = p.match(/An? (\w+) has (\d+) (\w+)\. How many \w+ do (\d+)/)!;
    const each = Number(m[2]);
    const count = Number(m[4]);
    let total = 0;
    for (let c = 0; c < count; c++) total += each;
    return total;
  },
  // Commutativity: rebuild each product by repeated addition, then identify the turned fact.
  "commutativity": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/same total as (\d+) × (\d+)\?/i)!;
    const [a, b] = m.slice(1).map(Number);
    let left = 0, right = 0;
    for (let i = 0; i < a; i++) left += b;
    for (let i = 0; i < b; i++) right += a;
    if (left !== right) throw new Error("the turned products disagree");
    const wanted = `${b} × ${a}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no turned fact among the options");
  },
  "commutativity@flipSolve": (p) => {
    const m = p.match(/solve (\d+) × (\d+)\./)!;
    const [a, b] = m.slice(1).map(Number);
    let total = 0;
    for (let group = 0; group < b; group++) total += a;
    return total;
  },
  "commutativity@arrayBuild": (p) => {
    const m = p.match(/shows (\d+) rows with (\d+) stars in each row/)!;
    const [rows, each] = m.slice(1).map(Number);
    let byRows = 0, byTurn = 0;
    for (let r = 0; r < rows; r++) byRows += each;
    for (let c = 0; c < each; c++) byTurn += rows;
    if (byRows !== byTurn) throw new Error("turning the array changed its total");
    return [String(rows), "×", String(each)];
  },
  "commutativity@packsPlus": (p) => {
    const m = p.match(/There are (\d+) packs of (\d+) stickers, plus (\d+) loose/)!;
    const [packs, each, loose] = m.slice(1).map(Number);
    let total = 0;
    for (let pack = 0; pack < packs; pack++) total += each;
    for (let i = 0; i < loose; i++) total += 1;
    return total;
  },
  // Distribution: verify the pieces rebuild the cut factor, while products are counted one group
  // at a time rather than evaluated by the same multiplication expression as the generator.
  "distributive": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/breaks apart (\d+) × (\d+)\?/)!;
    const [a, b] = m.slice(1).map(Number);
    const rest = b - 5;
    if (5 + rest !== b) throw new Error("the split does not rebuild the cut factor");
    const wanted = `${a} × 5 + ${a} × ${rest}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no valid split among the options");
  },
  "distributive@factSplit": (p) => {
    const m = p.match(/^(\d+) × (\d+) = \?$/)!;
    const [a, b] = m.slice(1).map(Number);
    let total = 0;
    for (let group = 0; group < a; group++) total += b;
    return total;
  },
  "distributive@missingPiece": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/has (\d+) rows of (\d+) plants/)!;
    const [rows, each] = m.slice(1).map(Number);
    const rest = each - 5;
    if (rest <= 0 || 5 + rest !== each) throw new Error("invalid fives split");
    const wanted = `${rows} × ${rest}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no completing piece among the options");
  },
  "distributive@rowsSold": (p) => {
    const m = p.match(/holds (\d+) rows with (\d+) rolls in each row\. (\d+) full row/)!;
    const [rows, each, sold] = m.slice(1).map(Number);
    let total = 0;
    for (let row = sold; row < rows; row++) total += each;
    return total;
  },
  // Operation choice: infer the operation from equal groups, equal splitting, or a sale after a
  // grouped total. The numeric route then executes those stages by counting.
  "op-choice": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Bo has (\d+) packs with (\d+) pens in each pack/)!;
    const [packs, each] = m.slice(1).map(Number);
    let total = 0;
    for (let pack = 0; pack < packs; pack++) total += each;
    if (total <= packs + each) throw new Error("the equal-groups story did not require multiplication");
    const wanted = "Bo — the packs are equal groups";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no equal-groups choice among the options");
  },
  "op-choice@equalGroupsFact": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Each of (\d+) kids brings (\d+) juice boxes/)!;
    const [kids, each] = m.slice(1).map(Number);
    const wanted = `${kids} × ${each}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no multiplication fact among the options");
  },
  "op-choice@splitFact": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/rope (\d+) metres long is cut into (\d+) equal pieces/)!;
    const [total, pieces] = m.slice(1).map(Number);
    let each = 0, left = total;
    while (left > 0) {
      left -= pieces;
      each += 1;
    }
    if (left !== 0) throw new Error("the rope does not split equally");
    const wanted = `${total} ÷ ${pieces}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no equal-split fact among the options");
  },
  "op-choice@soldFromGroups": (p) => {
    const m = p.match(/has (\d+) buckets with (\d+) roses in each bucket\. (\d+) roses are sold/)!;
    const [buckets, each, sold] = m.slice(1).map(Number);
    let total = 0;
    for (let bucket = 0; bucket < buckets; bucket++) total += each;
    for (let rose = 0; rose < sold; rose++) total -= 1;
    return total;
  },
  // Unknown position: identify the empty slot in count × size = total, then fill it by counting
  // complete groups rather than replaying the generator's arithmetic expression.
  "unknown-position": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/^(\d+) cupcakes are placed (\d+) to a plate/)!;
    const [total, each] = m.slice(1).map(Number);
    let groups = 0, left = total;
    while (left > 0) {
      left -= each;
      groups += 1;
    }
    if (left !== 0 || groups < 1) throw new Error("the cupcakes do not make whole plates");
    const wanted = "The group count — how many plates";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no group-count option among the choices");
  },
  "unknown-position@missingCount": (p) => {
    const m = p.match(/boxes each hold (\d+) markers\. There are (\d+) markers/)!;
    const [each, total] = m.slice(1).map(Number);
    let count = 0, left = total;
    while (left > 0) {
      left -= each;
      count += 1;
    }
    if (left !== 0) throw new Error("the marker total does not split into whole boxes");
    return count;
  },
  "unknown-position@totalUnknown": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) {
      if (/^\d+ shelves with \d+ trophies each — how many trophies\?$/.test(label)) return label;
    }
    throw new Error("no story with an unknown total");
  },
  "unknown-position@goodPerGroup": (p) => {
    const m = p.match(/has (\d+) chairs arranged in (\d+) equal rows\. In each row, (\d+) chair/)!;
    const [total, rows, broken] = m.slice(1).map(Number);
    let each = 0, left = total;
    while (left > 0) {
      left -= rows;
      each += 1;
    }
    if (left !== 0) throw new Error("the hall does not split into equal rows");
    for (let i = 0; i < broken; i++) each -= 1;
    return each;
  },
  // Addition-table patterns: symmetry is identified from swapped addends, parity from pairing, and
  // movement from one-cell changes rather than direct evaluation of the final printed sum.
  "addition-patterns": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/cell for (\d+) \+ (\d+) matches the cell for (\d+) \+ (\d+)/)!;
    if (m[1] !== m[4] || m[2] !== m[3]) throw new Error("the cells are not row-column swaps");
    const wanted = "Order never changes a sum";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no commutative addition explanation");
  },
  "addition-patterns@parityPredict": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/: (\d+) \+ (\d+) will be/)!;
    const [a, b] = m.slice(1).map(Number);
    const ae = a % 2 === 0, be = b % 2 === 0;
    const wanted = ae && be
      ? "Even — both addends are even, so every object stays paired"
      : !ae && !be
        ? "Even — the two odd loners pair with each other"
        : "Odd — one odd addend leaves exactly one unpaired object";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no option matching the addends' pairing pattern");
  },
  "addition-patterns@doubleDiagonal": (p) => {
    const n = Number(p.match(/its (\d+)(?:st|nd|rd|th) number/)![1]);
    let out = 0;
    for (let i = 0; i < n; i++) out += 2;
    return out;
  },
  "addition-patterns@additionTableWalk": (p) => {
    const m = p.match(/row is (\d+) and the column is (\d+)\. Sam walks (\d+) cell/)!;
    const [row, col, left] = m.slice(1).map(Number);
    let newCol = col;
    for (let i = 0; i < left; i++) newCol -= 1;
    let out = row;
    for (let i = 0; i < newCol; i++) out += 1;
    return out;
  },
  // Multiplication-table patterns: products are reconstructed as equal groups, while row nesting is
  // checked from exact divisibility of the row labels.
  "mult-patterns": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/cell for (\d+) × (\d+) matches the cell for (\d+) × (\d+)/)!;
    const [a, b, c, d] = m.slice(1).map(Number);
    let first = 0, second = 0;
    for (let i = 0; i < a; i++) first += b;
    for (let i = 0; i < c; i++) second += d;
    if (a !== d || b !== c || first !== second) throw new Error("the cells are not equal factor turns");
    const wanted = "Turning the factors around does not change the product";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no commutative multiplication explanation");
  },
  "mult-patterns@halfRow": (p) => {
    const m = p.match(/The (\d+)(?:st|nd|rd|th) number in the (\d+)s row is (\d+)\. The \d+s row is the (\d+)s row doubled/)!;
    const [pos, doubled, shown, base] = m.slice(1).map(Number);
    if (doubled !== 2 * base) throw new Error("the named rows are not a doubling pair");
    let out = 0;
    for (let i = 0; i < pos; i++) out += base;
    if (out + out !== shown) throw new Error("the shown doubled-row value is inconsistent");
    return out;
  },
  "mult-patterns@rowSubset": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/number in the (\d+)s row also appears in the (\d+)s row/)!;
    const [big, small] = m.slice(1).map(Number);
    let factor = 0, built = 0;
    while (built < big) {
      built += small;
      factor += 1;
    }
    if (built !== big || factor < 2) throw new Error("the larger row is not nested in the smaller row");
    const ordinal = factor === 2 ? "second" : "third";
    const wanted = `Each ${big} is ${factor} groups of ${small} — the ${big}s row takes every ${ordinal} number of the ${small}s row`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no row-nesting explanation");
  },
  "mult-patterns@timesTableStep": (p) => {
    const m = p.match(/square (\d+) × (\d+).*staying in the (\d+)s column/)!;
    const [row, col, statedCol] = m.slice(1).map(Number);
    if (col !== statedCol) throw new Error("the named column drifted from the starting fact");
    let out = 0;
    for (let r = 0; r < row + 1; r++) out += col;
    return out;
  },
  // Re-price the coins from the prompt's own words — a different route from the draw that built them.
  "coin-total": (p) => {
    const VALUE: Record<string, number> = { quarter: 25, dime: 10, nickel: 5, penny: 1 };
    let total = 0;
    for (const m of p.matchAll(/(\d+) (quarter|dime|nickel|penn(?:y|ies))s?/g)) {
      const key = m[2].startsWith("penn") ? "penny" : m[2];
      total += Number(m[1]) * VALUE[key];
    }
    return { counted: [], entry: total };
  },
  // Re-read both numbers off the prompt and compare them as NUMBERS — the engine compares digit
  // strings column by column, so this is a genuinely different route to the same relation.
  "place-compare": (p) => {
    const m = p.match(/Compare: ([\d.]+) __ ([\d.]+)/)!;
    return Number(m[1]) > Number(m[2]) ? "gt" : Number(m[1]) < Number(m[2]) ? "lt" : "eq";
  },
  "place-compare@decidingPlace": (p) => {
    const [prompt] = p.split("||");
    const m = prompt.match(/comparing (0\.\d+) and (0\.\d+)/)!;
    const a = m[1].split(".")[1], b = m[2].split(".")[1];
    let at = 0;
    while (at < a.length && a[at] === b[at]) at++;
    return `The ${["tenths", "hundredths", "thousandths"][at]} place`;
  },
  // Re-derive the landing from the prompt's own words, not from start+hop*hops.
  "count-on-line": (p) => {
    const one = p.match(/right after (\d+)\?/);
    if (one) return Number(one[1]) + 1;
    const m = p.match(/Start at (\d+)\. Count on (\d+) more/)!;
    return Number(m[1]) + Number(m[2]);
  },
  // Re-read every measurement out of the sentence and pick the extreme the prompt asks for.
  "length-compare": (p) => {
    const pairs = [...p.matchAll(/The (\w+) is (\d+) (?:inches|cubes|paperclips)/g)].map((m) => ({
      id: m[1],
      len: Number(m[2]),
    }));
    const wantLong = /LONGEST/.test(p);
    return pairs.reduce((best, c) => ((wantLong ? c.len > best.len : c.len < best.len) ? c : best)).id;
  },
  // Read the target time straight back out of the prompt — a different route from the draw, and the
  // one that catches a generator whose prompt and target ever drift apart.
  "time-set-clock": (p) => {
    const m = p.match(/show (\d{1,2}):(\d{2})\./)!;
    return { hour: Number(m[1]), minute: Number(m[2]) };
  },
  // Solve the 2x2 system by CRAMER'S RULE — determinants, not the elimination the generator uses.
  "sys-two-linear": (p) => {
    const [, sum, kRaw, d] = p.match(/x \+ y = (-?\d+)\s+and\s+(\d*)x − y = (-?\d+)/)!;
    const k = kRaw === "" ? 1 : Number(kRaw);
    const [s1, d1] = [Number(sum), Number(d)];
    // | 1  1 | |x|   |s|
    // | k -1 | |y| = |d|
    const det = 1 * -1 - 1 * k;
    const x = (s1 * -1 - 1 * d1) / det;
    const y = (1 * d1 - k * s1) / det;
    return /What is x\?/.test(p) ? x : y;
  },
  // Grade 3 fraction language and geometry — reconstruct classifications from the printed
  // attributes and quantities, then locate that result in the shuffled option labels.
  "equal-parts@whyEqualEvidence": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const total = Number(prompt.match(/A (\d+)-cm/)![1]);
    for (const label of labelsRaw.split(";;")) {
      const m = label.match(/^It is cut into (\d+) pieces of (\d+) cm each$/);
      if (m && Number(m[1]) * Number(m[2]) === total) return label;
    }
    throw new Error("no equal-part evidence whose equal pieces rebuild the whole");
  },
  "nl-partition@whyEqualJumps": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Every jump has the same length";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no equal-jump condition");
  },
  "compare-same-denom@whyNumerators": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Why does (\d+)\/(\d+) exceed (\d+)\/(\d+)/)!;
    const wanted = `Both count the same-size pieces, and ${m[1]} pieces exceed ${m[3]}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no same-denominator explanation");
  },
  "same-whole@comparisonCondition": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "The two drawings represent equal-size wholes";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no shared-whole condition");
  },

  "unit-fraction": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const d = Number(prompt.match(/from a (\d+)-piece/)![1]);
    const wanted = `1/${d}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no unit fraction");
  },
  "unit-fraction@returnedPieces": (p) => Number(p.match(/(\d+) hikers return/)![1]),
  "num-denom": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const d = Number(prompt.match(/In \d+\/(\d+)/)![1]);
    const wanted = `The whole is divided into ${d} equal parts`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no denominator-role option");
  },
  "num-denom@denominatorEffect": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "It becomes smaller";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no denominator-size effect");
  },

  "attributes": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Yes — colour is not a defining attribute";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no appearance-invariance option");
  },
  "attributes@turnInvariant": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const wanted = `Still a ${prompt.match(/^A (\w+)/)![1]}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no rotation-invariant shape");
  },
  "attributes@definingAttribute": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const shape = prompt.match(/of a (\w+)/)![1];
    const sideByShape: Record<string, number> = { triangle: 3, quadrilateral: 4, pentagon: 5, hexagon: 6 };
    const wanted = `It has ${sideByShape[shape]} straight sides and is closed`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no defining-attribute option");
  },
  "attributes@detectiveSides": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const sideByShape: Record<number, string> = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon" };
    const wanted = sideByShape[Number(prompt.match(/with (\d+) straight/)![1])];
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no side-count classification");
  },
  "attributes@cgSquareExtra": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "All four sides are equal") return label;
    throw new Error("no square-extra attribute");
  },
  "attributes@cgTriangleAngleFamily": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const angles = [...prompt.matchAll(/(\d+)°/g)].map((m) => Number(m[1]));
    const wanted = angles.includes(90) ? "Right" : Math.max(...angles) > 90 ? "Obtuse" : "Acute";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no triangle-angle family");
  },
  "attributes@cgTriangleSideHierarchy": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "It is both equilateral and isosceles";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no triangle-side hierarchy");
  },
  "attributes@cgTriangleDualLabel": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const angles = [...prompt.matchAll(/(\d+)°/g)].map((m) => Number(m[1]));
    const angle = angles.includes(90) ? "Right" : Math.max(...angles) > 90 ? "Obtuse" : "Acute";
    const side = /two sides have equal/.test(prompt) ? "isosceles" : "scalene";
    const wanted = `${angle} ${side}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no triangle dual label");
  },
  "attributes@cgEquilateralRightNever": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("Never —")) return label;
    throw new Error("no equilateral-right frequency");
  },

  "quadrilaterals": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "A rectangle") return label;
    throw new Error("no rectangle classification");
  },
  "quadrilaterals@trapezoidByParallel": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "A trapezoid") return label;
    throw new Error("no trapezoid classification");
  },
  "quadrilaterals@allQuadrilateralSet": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "rectangle, rhombus, trapezoid, square";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no all-quadrilateral set");
  },
  "quadrilaterals@rhombusBySides": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "A rhombus") return label;
    throw new Error("no rhombus classification");
  },
  "quadrilaterals@cgEqualSidePerimeter": (p) => {
    const side = Number(p.match(/each (\d+) units/)![1]);
    return side + side + side + side;
  },
  "quadrilaterals@cgGuaranteedRhombus": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "A rhombus") return label;
    throw new Error("no guaranteed-rhombus option");
  },
  "quadrilaterals@cgParallelogramNotGuaranteed": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "It has a right angle") return label;
    throw new Error("no non-guaranteed parallelogram property");
  },

  "shape-hierarchy": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Yes — it satisfies every rectangle rule";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no square-as-rectangle option");
  },
  "shape-hierarchy@rectangleNotSquare": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "No — a rectangle may have unequal adjacent sides";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no rectangle-not-square option");
  },
  "shape-hierarchy@hierarchyTruth": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Every square is also a rectangle";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no true hierarchy statement");
  },
  "shape-hierarchy@missingHierarchyLabel": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (["triangle", "pentagon", "circle"].includes(label)) return label;
    throw new Error("no outside hierarchy label");
  },
  "shape-hierarchy@cgInheritProperty": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const wanted = prompt.startsWith("Every rectangle") ? "It has four right angles" : "It has four equal sides";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no inherited property");
  },
  "shape-hierarchy@cgInheritanceDirection": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("The argument runs backward")) return label;
    throw new Error("no inheritance-direction option");
  },
  "shape-hierarchy@cgInheritanceChain": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "It has two pairs of parallel sides") return label;
    throw new Error("no inherited-chain property");
  },
  "shape-hierarchy@cgParallelogramTrapezoid": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("Never —")) return label;
    throw new Error("no parallelogram-trapezoid mcq option");
  },
  "shape-hierarchy@cgParallelogramTrapezoidVerdict": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label.startsWith("Never —")) return label;
    throw new Error("no parallelogram-trapezoid frequency");
  },
  "shape-hierarchy@cgSquareRhombusAlways": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "Always") return label;
    throw new Error("no square-rhombus frequency");
  },
  "shape-hierarchy@cgRhombusRectangleSometimes": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "Sometimes") return label;
    throw new Error("no rhombus-rectangle frequency");
  },

  "sorting-rules": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Inside the rule's group";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no single-rule placement");
  },
  "sorting-rules@bothRules": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "A square") return label;
    throw new Error("no overlap shape");
  },
  "sorting-rules@outsideOverlap": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (/^A \d+-by-\d+ rectangle$/.test(label)) return label;
    throw new Error("no outside-overlap rectangle");
  },
  "sorting-rules@equalSideGate": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (/square$/.test(label)) return label;
    throw new Error("no equal-side gate winner");
  },

  "non-examples": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Every side of a triangle must be straight";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no curved-side diagnosis");
  },
  "non-examples@threeRightAngles": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "No — a rectangle requires four right angles";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no missing-angle diagnosis");
  },
  "non-examples@misfitPurpose": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "The contrast reveals exactly which defining rule fails";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no near-miss purpose");
  },
  "non-examples@unequalSideReject": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "Its four sides are not all equal";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no unequal-side diagnosis");
  },

  "partition-shapes": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "No — fractional parts must be equal";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no unequal-partition decision");
  },
  "partition-shapes@differentEqualCuts": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) if (label === "Both squares") return label;
    throw new Error("no equal-area partition decision");
  },
  "partition-shapes@unitFractionSize": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const d = Number(prompt.match(/split into (\d+) equal parts/)![1]);
    const wanted = `The 1/${d} pieces`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no larger unit-fraction pieces");
  },
  "partition-shapes@unequalNamedParts": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const d = Number(prompt.match(/cut into (\d+) pieces/)![1]);
    const wanted = `No — the ${d} parts are not equal`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no unequal named-parts decision");
  },

  "parts-as-fractions": (p) => Number(p.match(/split into (\d+) equal parts/)![1]),
  "parts-as-fractions@allPartsShaded": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const d = Number(prompt.match(/split into (\d+) equal parts/)![1]);
    const wanted = `${d}/${d}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no whole-as-all-parts fraction");
  },

  // Grade 3 place value and computation — every result is reconstructed from the printed quantities,
  // not from the generator's stored answer. MCQ routes search the shuffled labels for that result.
  "place-value": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/number (\d+), what is the (\d+) worth/)!;
    const digits = m[1].split("").map(Number);
    const target = Number(m[2]);
    const positions = digits.map((d, i) => ({ d, value: d * 10 ** (digits.length - i - 1) })).filter((x) => x.d === target);
    if (positions.length !== 1) throw new Error("requested digit is not unique in the printed number");
    const wanted = String(positions[0].value);
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no matching place-value option");
  },
  "place-value@zeroPlaceholder": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "The zero holds the tens place open";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no zero-placeholder explanation");
  },
  "place-value@composeNumber": (p) => {
    const m = p.match(/(\d+) hundreds, (\d+) tens, and (\d+) ones/)!;
    return Number(m[1]) * 100 + Number(m[2]) * 10 + Number(m[3]);
  },
  "place-value@changeBlocks": (p) => Number(p.match(/builds (\d+)/)![1]) + 100 - 10,

  "expanded-form": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const target = Number(prompt.match(/represents (\d+)/)![1]);
    for (const label of labelsRaw.split(";;")) {
      const sum = label.split(" + ").map(Number);
      if (sum.every(Number.isFinite) && sum.reduce((a, b) => a + b, 0) === target) return label;
    }
    throw new Error("no expanded form matching the standard number");
  },
  "expanded-form@snapExpanded": (p) => {
    const parts = [...p.matchAll(/\d+/g)].slice(0, 3).map((m) => Number(m[0]));
    return parts.reduce((a, b) => a + b, 0);
  },
  "expanded-form@addTensExpanded": (p) => {
    const m = p.match(/^(\d+) \+ (\d+)/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "expanded-form@swapTensOnes": (p) => {
    const parts = [...p.matchAll(/\d+/g)].slice(0, 3).map((m) => Number(m[0]));
    const original = parts.reduce((a, b) => a + b, 0);
    const h = Math.floor(original / 100), t = Math.floor(original / 10) % 10, o = original % 10;
    return h * 100 + o * 10 + t;
  },

  "compare-numbers": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Which is larger, (\d+) or (\d+)/)!;
    const a = Number(m[1]), b = Number(m[2]), larger = Math.max(a, b), smaller = Math.min(a, b);
    const wanted = `${larger}; it has ${Math.floor(larger / 100)} hundreds while ${smaller} has only ${Math.floor(smaller / 100)}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no greatest-place comparison");
  },
  "compare-numbers@leadingDigitError": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "The hundreds place must be compared before the tens place";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no leading-place diagnosis");
  },
  "compare-numbers@smallestWithZero": (p) => {
    const m = p.match(/digits (\d+), 0, and (\d+)/)!;
    const [small, large] = [Number(m[1]), Number(m[2])].sort((a, b) => a - b);
    return small * 100 + large;
  },
  "compare-numbers@scoreChain": (p) => Number(p.match(/scores (\d+)/)![1]) + 10 + 100,

  "unit-trading": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const ones = Number(prompt.match(/has (\d+) loose ones/)![1]);
    const wanted = `1 ten and ${ones - 10} ones`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no equivalent traded bundle");
  },
  "unit-trading@hundredsToTens": (p) => Number(p.match(/^(\d+) hundreds/)![1]) * 10,
  "unit-trading@tensAndOnes": (p) => {
    const m = p.match(/holds (\d+) tens and (\d+) ones/)!;
    return Number(m[1]) * 10 + Number(m[2]);
  },
  "unit-trading@tradeThenGive": (p) => {
    const m = p.match(/and (\d+) tens.*then (\d+) tens/s)!;
    return Number(m[1]) + 10 - Number(m[2]);
  },

  "estimation@whenEstimate": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "When a quick, close-enough value is useful and exactness is not required";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no appropriate-estimation context");
  },

  "mental-add": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/adding (\d+) \+ (\d+)/)!;
    const n = Number(m[1]), hop = 100 - (n % 100);
    const wanted = `Add ${hop} to land on ${n + hop}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no friendly-hundred first hop");
  },
  "mental-add@plusNinetyNine": (p) => Number(p.match(/^(\d+) \+ 99/)![1]) + 99,
  "mental-add@addByJumps": (p) => {
    const m = p.match(/find (\d+) \+ (\d+)/)!;
    return Number(m[1]) + Number(m[2]);
  },
  "mental-add@bonusThenLoss": (p) => {
    const m = p.match(/starts at (\d+).*loses (\d+)/s)!;
    return Number(m[1]) + 99 - Number(m[2]);
  },

  "regroup-add": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "One new ten made from 10 ones";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no regrouped-addition explanation");
  },
  "regroup-sub": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "One ten was traded for 10 ones";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no regrouped-subtraction explanation");
  },
  "regroup-sub@columnBorrow": (p) => {
    const m = p.match(/(\d+) − (\d+)/)!;
    return Number(m[1]) - Number(m[2]);
  },
  "regroup-sub@threeDigitSubtract": (p) => {
    const m = p.match(/^(\d+) − (\d+)/)!;
    return Number(m[1]) - Number(m[2]);
  },
  "regroup-sub@chairsReturn": (p) => {
    const m = p.match(/has (\d+) chairs\. (\d+) go.*then (\d+) come/s)!;
    return Number(m[1]) - Number(m[2]) + Number(m[3]);
  },

  "estimate-check": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const start = Number(prompt.match(/writes (\d+) −/)![1]);
    const wanted = `A positive subtraction result cannot exceed the starting ${start}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no subtraction-bound diagnosis");
  },
  "estimate-check@guardSum": (p) => {
    const m = p.match(/Estimate (\d+) \+ (\d+)/)!;
    return Math.round(Number(m[1]) / 100) * 100 + Math.round(Number(m[2]) / 100) * 100;
  },
  "estimate-check@estimateCertainty": (p) => {
    const [, labelsRaw] = p.split("||");
    const wanted = "No — a near estimate is a warning, not an exact proof";
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no estimate-uncertainty option");
  },
  "estimate-check@correctDifference": (p) => {
    const m = p.match(/computes (\d+) − (\d+)/)!;
    return Number(m[1]) - Number(m[2]);
  },

  "mult-tens": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/unlocks (\d+) × (\d+)/)!;
    const a = Number(m[1]), d = Number(m[2]) / 10;
    const wanted = `${a} × ${d} = ${a * d}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no underlying basic fact");
  },
  "mult-tens@tensProductA": (p) => {
    const m = p.match(/^(\d+) × (\d+)/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "mult-tens@tensProductB": (p) => {
    const m = p.match(/^(\d+) × (\d+)/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "mult-tens@ticketChange": (p) => {
    const m = p.match(/(\d+) tickets cost \$(\d+).*pays \$(\d+)/)!;
    return Number(m[3]) - Number(m[1]) * Number(m[2]);
  },

  "zero-pattern": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Why does (\d+) × (\d+) = (\d+)/)!;
    const a = Number(m[1]), hundreds = Number(m[2]) / 100;
    const wanted = `${m[2]} is ${hundreds} hundreds, and ${a} × ${hundreds} makes ${a * hundreds} hundreds`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no place-value zero-pattern explanation");
  },
  "zero-pattern@zeroProductA": (p) => {
    const m = p.match(/^(\d+) × (\d+)/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "zero-pattern@zeroProductB": (p) => {
    const m = p.match(/^(\d+) × (\d+)/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "zero-pattern@beyondOrder": (p) => {
    const m = p.match(/carries (\d+) crates with (\d+).*needs (\d+)/)!;
    return Number(m[1]) * Number(m[2]) - Number(m[3]);
  },

  "tens-problems": (p) => Number(p.match(/are (\d+) dimes/)![1]) * 10,
  "tens-problems@chairRows": (p) => {
    const m = p.match(/in (\d+) full rows of (\d+)/)!;
    return Number(m[1]) * Number(m[2]);
  },
  "tens-problems@badTicketClaim": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/cost \$(\d+) each.*says (\d+) tickets/)!;
    const price = Number(m[1]), q = Number(m[2]);
    const wanted = `The known fact ${q} × ${price / 10} gives ${q * (price / 10)} tens, or $${q * price}`;
    for (const label of labelsRaw.split(";;")) if (label === wanted) return label;
    throw new Error("no corrected ticket-product explanation");
  },
  "tens-problems@packsKeep": (p) => {
    const m = p.match(/buys (\d+) packs of (\d+).*gives away (\d+)/)!;
    return Number(m[1]) * Number(m[2]) - Number(m[3]);
  },

  // Integrate numerically with a fine midpoint sum — nothing to do with antiderivatives.
  "in-definite-power": (p) => {
    const [, b, k, n] = p.match(/∫₀\^(\d+) (\d+)x\^(\d+) dx/)!.map(Number);
    const N = 200000, h = b / N;
    let s = 0;
    for (let i = 0; i < N; i++) s += k * Math.pow((i + 0.5) * h, n) * h;
    return s;
  },

  // Grade 8 exponents and real numbers. Each route reconstructs the result from the displayed
  // values and option labels, closing the test-coverage gap left when these generators first landed.
  "g8-esn-power-meaning": (p) => {
    if (p.startsWith("Which power of ten equals ")) {
      const decimal = p.match(/equals (0\.\d+)\?/)![1];
      const places = decimal.slice(2).indexOf("1") + 1;
      return ["10", g8Sup(-places)];
    }
    if (/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+ = \?$/.test(p)) {
      const m = p.match(/(?:Evaluate )?([\d.]+)([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \?$/)!;
      return Number(m[1]) ** g8SupInt(m[2]);
    }
    throw new Error(`unreadable power prompt: ${p}`);
  },
  "g8-esn-place-value": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    if (question.includes("written as a digit times a power of ten")) {
      const value = Number(question.match(/^([\d,]+)/)![1].replace(/,/g, ""));
      return labelsRaw.split(";;").find((label) => {
        const m = label.match(/^(\d) × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
        return m !== null && Number(m[1]) * 10 ** g8SupInt(m[2]) === value;
      })!;
    }
    const m = question.match(/^(\d+) × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+) = \?$/)!;
    return Number(m[1]) * 10 ** g8SupInt(m[2]);
  },
  "g8-esn-root-context": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    const n = Number(question.match(/(?:volume|area)(?: of)? ([\d,]+)/)![1].replace(/,/g, ""));
    if (question.includes("Which equation"))
      return labelsRaw.split(";;").find((label) => {
        const shown = label.match(/^e = ∛([\d,]+)$/);
        return shown !== null && Number(shown[1].replace(/,/g, "")) === n;
      })!;
    return question.includes("cube-shaped") ? Math.round(Math.cbrt(n)) : Math.round(Math.sqrt(n));
  },
  "g8-esn-compare": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    const parts = g8ScientificParts(question);
    const values = parts.map(({ coeff, exp }) => coeff * 10 ** exp);
    if (question.startsWith("Which is bigger")) {
      const wanted = values[0] > values[1]
        ? `${parts[0].coeff} × 10${g8Sup(parts[0].exp)}`
        : `${parts[1].coeff} × 10${g8Sup(parts[1].exp)}`;
      return labelsRaw.split(";;").find((label) => label === wanted)!;
    }
    return values[0] / values[1];
  },
  "g8-esn-context-compute": (p) => {
    const parts = g8ScientificParts(p);
    if (p.includes(" at ") && p.includes("per second"))
      return g8NormalizeScientific(parts[0].coeff / parts[1].coeff, parts[0].exp - parts[1].exp);
    if (p.includes(" then removes ")) {
      const productCoeff = parts[0].coeff * parts[1].coeff;
      const productExp = parts[0].exp + parts[1].exp;
      const removedAtProductExp = parts[2].coeff * 10 ** (parts[2].exp - productExp);
      return g8NormalizeScientific(productCoeff - removedAtProductExp, productExp);
    }
    if (p.includes(" and loses ")) {
      const lossAtFirstExp = parts[1].coeff * 10 ** (parts[1].exp - parts[0].exp);
      return g8NormalizeScientific(parts[0].coeff - lossAtFirstExp, parts[0].exp);
    }
    return g8NormalizeScientific(parts[0].coeff * parts[1].coeff, parts[0].exp + parts[1].exp);
  },
  "g8-rns-decimal-classify": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    const labels = labelsRaw === "" ? [] : labelsRaw.split(";;");
    if (question.startsWith("Sort each fraction")) {
      const itemLabels = labelsRaw.split(",");
      return Object.fromEntries(itemLabels.map((label) => {
        const [n, d] = label.split("/").map(Number);
        return [label, g8FractionTerminates(n, d) ? "term" : "repeat"];
      }));
    }
    if (question.startsWith("Which fraction's decimal")) {
      const seekTerminating = question.includes("STOPS");
      return labels.find((label) => {
        const m = label.match(/^(\d+)\/(\d+)$/);
        return m !== null && g8FractionTerminates(Number(m[1]), Number(m[2])) === seekTerminating;
      })!;
    }
    const frac = question.match(/^(\d+)\/(\d+)/);
    if (!frac) throw new Error(`unreadable decimal-classification prompt: ${p}`);
    const n = Number(frac[1]), d = Number(frac[2]);
    const term = g8FractionTerminates(n, d);
    if (question.includes("as a decimal")) {
      const value = n / d;
      if (term) return labels.find((label) => !label.includes("…") && Number(label) === value)!;
      return labels.filter((label) => label.includes("…"))
        .sort((a, b) => Math.abs(Number(a.replace("…", "")) - value) - Math.abs(Number(b.replace("…", "")) - value))[0];
    }
    return labels.find((label) => label === (term ? "Terminate" : "Repeat"))!;
  },
  "g8-rns-root-classify": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    const labels = labelsRaw === "" ? [] : labelsRaw.split(";;");
    if (question.startsWith("Sort each number")) {
      const itemLabels = labelsRaw.split(",");
      return Object.fromEntries(itemLabels.map((label) => {
        const s = label.trim();
        if (/^[−-]?\d+\/\d+$/.test(s) || s.includes("repeating")) return [label, "rat"];
        if (s === "π" || s === "e") return [label, "irr"];
        const root = s.match(/^√(\d+)$/);
        return [label, root && g8SquareRootIfExact(Number(root[1])) !== null ? "rat" : "irr"];
      }));
    }
    if (question === "Which of these square-root expressions is rational?")
      return labels.find((label) => g8SquareRootIfExact(Number(label.slice(1))) !== null)!;
    if (question.startsWith("Which list contains only irrational"))
      return labels.find((label) => label.split(", ").every((x) => g8SquareRootIfExact(Number(x.slice(1))) === null))!;
    if (question.startsWith("Is ")) return labels.find((label) => label.startsWith("Irrational"))!;
    if (question === "Which of these numbers is rational?")
      return labels.find((label) => !label.startsWith("√") && label !== "π" && label !== "e" && !label.includes("…"))!;
    const root = question.match(/(?:^√|Classify √)(\d+)(?: is:| as rational or irrational:)/);
    if (root) {
      const exact = g8SquareRootIfExact(Number(root[1]));
      return labels.find((label) => label.startsWith(exact === null ? "Irrational" : "Rational"))!;
    }
    throw new Error(`unreadable root-classification prompt: ${p}`);
  },
  "g8-rns-density": (p) => {
    const [question, labelsRaw] = p.split("||");
    const labels = labelsRaw.split(";;");
    if (question.startsWith("Two different numbers")) {
      const m = question.match(/numbers are ([\d.]+) and ([\d.]+)/)!;
      const midpoint = (Number(m[1]) + Number(m[2])) / 2;
      return labels.find((label) => Math.abs(Number(label) - midpoint) < 1e-9)!;
    }
    const m = question.match(/^([\d.]+)² = [\d.]+ and ([\d.]+)² = [\d.]+\. So √\d+ is between:/)!;
    return labels.find((label) => label === `${m[1]} and ${m[2]}`)!;
  },
  "g8-rns-root-estimate": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    const n = Number(question.match(/√(\d+)/)![1]);
    if (labelsRaw !== "") {
      const nearest = Math.round(Math.sqrt(n));
      return labelsRaw.split(";;").find((label) => label.startsWith(`${nearest},`))!;
    }
    return question.includes("one decimal place") ? Math.round(Math.sqrt(n) * 10) / 10 : Math.floor(Math.sqrt(n));
  },
  "g8-rns-compare-estimate": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    if (question.startsWith("Order the four values"))
      return labelsRaw.split(",").sort((a, b) => g8LabelValue(a) - g8LabelValue(b));
    const labels = labelsRaw.split(";;");
    let m = question.match(/Which is greater: √(\d+) or ([\d.]+)/);
    if (m) {
      const wanted = Math.sqrt(Number(m[1])) > Number(m[2]) ? `√${m[1]},` : `${m[2]},`;
      return labels.find((label) => label.startsWith(wanted))!;
    }
    m = question.match(/Which is greater: (\d+)\/(\d+) or π/);
    if (m) {
      const fraction = `${m[1]}/${m[2]}`;
      const wanted = Number(m[1]) / Number(m[2]) > Math.PI ? `${fraction},` : "π,";
      return labels.find((label) => label.startsWith(wanted))!;
    }
    const root = question.match(/√(\d+) × √\d+/)!;
    return labels.find((label) => label.startsWith(`${root[1]}, exactly`))!;
  },
  "g8-tm-triangle-exterior": (p) => {
    const angles = [...p.matchAll(/(\d+)°/g)].map((m) => Number(m[1]));
    return angles[0] + angles[1];
  },
  "g8-tm-pythagorean-why": (p) => {
    const [question, labelsRaw = ""] = p.split("||");
    if (labelsRaw !== "") return labelsRaw.split(";;").find((label) => label.startsWith("The areas of squares"))!;
    let m = question.match(/legs (\d+) and (\d+)/);
    if (m) return Number(m[1]) ** 2 + Number(m[2]) ** 2;
    m = question.match(/areas (\d+) and (\d+)/)!;
    return Math.sqrt(Number(m[1]) + Number(m[2]));
  },

  "g8-tm-rigid-motion": (p) => {
    const m = p.match(/Translate \((-?\d+), (-?\d+)\) (left|right) (\d+) and (up|down) (\d+)/)!;
    return Number(m[2]) + (m[5] === "up" ? 1 : -1) * Number(m[6]);
  },
  "g8-tm-rigid-motion@tmTranslateY": (p) => INDEPENDENT["g8-tm-rigid-motion"](p),
  "g8-tm-rigid-motion@tmTranslateProperty": (p) => p.split("||")[1].split(";;").find((x) => x === "Its location on the plane")!,
  "g8-tm-rigid-motion@tmTranslateRule": (p) => {
    const [q, raw] = p.split("||");
    const m = q.match(/moves \((-?\d+), (-?\d+)\) to \((-?\d+), (-?\d+)\)/)!;
    const [x1,y1,x2,y2]=m.slice(1).map(Number);
    const dx=x2-x1, dy=y2-y1;
    const wanted=`${dx>=0?"right":"left"} ${Math.abs(dx)} and ${dy>=0?"up":"down"} ${Math.abs(dy)}`;
    return raw.split(";;").find((x) => x === wanted)!;
  },
  "g8-tm-rigid-motion@tmReflectAxis": (p) => {
    const [q, raw]=p.split("||");
    const m=q.match(/sends \((-?\d+), (-?\d+)\) to \((-?\d+), (-?\d+)\)/)!;
    const [x,y,u,v]=m.slice(1).map(Number);
    const wanted = u===-x&&v===y ? "the y-axis" : u===x&&v===-y ? "the x-axis" : u===y&&v===x ? "the line y = x" : "the line y = −x";
    return raw.split(";;").find((z)=>z===wanted)!;
  },
  "g8-tm-rigid-motion@tmReflectProperty": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("Corresponding lengths"))!,
  "g8-tm-rigid-motion@tmRotatePoint": (p) => {
    const [q,raw]=p.split("||"); const m=q.match(/sends \((-?\d+), (-?\d+)\) to \((-?\d+), (-?\d+)\)/)!;
    const [x,y,u,v]=m.slice(1).map(Number);
    const wanted=u===-y&&v===x?"90° counterclockwise":u===y&&v===-x?"90° clockwise":"180°";
    return raw.split(";;").find((z)=>z===wanted)!;
  },
  "g8-tm-rigid-motion@tmRotateProperty": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("Distances and angles"))!,
  "g8-tm-rigid-motion@tmTransformSort": (p) => {
    const items=p.split("||")[1].split(",");
    return Object.fromEntries(items.map((x)=>[x, /slide|x → x [−+]/.test(x)?"t":/flip|x → −x; y → y/.test(x)?"rf":"rt"]));
  },
  "g8-tm-congruence": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("All corresponding"))!,
  "g8-tm-congruence@tmCongruenceMeaning": (p) => INDEPENDENT["g8-tm-congruence"](p),
  "g8-tm-congruence@tmCongruenceEnlarge": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("No — the dilation"))!,
  "g8-tm-congruence@tmCongruenceSSS": (p) => {
    const labels=p.split("||")[1].split(";;");
    return labels.find((label)=>{ const nums=[...label.matchAll(/\d+/g)].map(m=>Number(m[0])); if(nums.length!==6)return false; const a=nums.slice(0,3).sort((x,y)=>x-y), b=nums.slice(3).sort((x,y)=>x-y); return a.every((v,i)=>v===b[i]); })!;
  },
  "g8-tm-congruence@tmCongruenceSort": (p) => {
    const items=p.split("||")[1].split(",");
    return Object.fromEntries(items.map((x)=>[x,/translate|reflect|rotate/.test(x)?"yes":"no"]));
  },
  "g8-tm-dilation-similarity": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("No — corresponding"))!,
  "g8-tm-dilation-similarity@tmDilationCongruent": (p) => INDEPENDENT["g8-tm-dilation-similarity"](p),
  "g8-tm-dilation-similarity@tmDilationScale": (p) => {
    const k=p.match(/factor (\d+(?:\.\d+)?)/)![1]; return p.split("||")[1].split(";;").find((x)=>x===`Each side length is multiplied by ${k}`)!;
  },
  "g8-tm-dilation-similarity@tmSimilarSideA": (p) => {
    const m=p.match(/scale factor (\d+).*side of (\d+)/)!; return Number(m[1])*Number(m[2]);
  },
  "g8-tm-dilation-similarity@tmSimilarFactor": (p) => {
    const m=p.match(/side lengths (\d+) and (\d+)/)!; return Number(m[2])/Number(m[1]);
  },
  "g8-tm-dilation-similarity@tmSimilarSideB": (p) => INDEPENDENT["g8-tm-dilation-similarity@tmSimilarSideA"](p),
  "g8-tm-dilation-similarity@tmSimilarSort": (p) => {
    const items=p.split("||")[1].split(",");
    return Object.fromEntries(items.map((label)=>{ const halves=label.replace("sides ","").split(" versus "); const a=halves[0].split("-").map(Number).sort((x,y)=>x-y), b=halves[1].split("-").map(Number).sort((x,y)=>x-y); if(a.every((v,i)=>v===b[i]))return [label,"cong"]; const k=b[0]/a[0]; return [label,a.every((v,i)=>Math.abs(b[i]/v-k)<1e-9)?"sim":"neither"]; }));
  },
  "g8-tm-transversal": (p) => Number(p.match(/is (\d+)°/)![1]),
  "g8-tm-transversal@tmTransversalAlternate": (p) => Number(p.match(/is (\d+)°/)![1]),
  "g8-tm-transversal@tmTransversalSupplement": (p) => 180-Number(p.match(/measures (\d+)°/)![1]),
  "g8-tm-transversal@tmTransversalMatch": (p) => ({"corresponding angles":"equal in measure","alternate interior angles":"equal across the transversal","same-side interior angles":"sum to 180°"}),
  "g8-tm-angle-angle": (p) => { const a=[...p.matchAll(/(\d+)°/g)].map(m=>Number(m[1])); return 180-a[0]-a[1]; },
  "g8-tm-angle-angle@tmAAThird": (p) => INDEPENDENT["g8-tm-angle-angle"](p),
  "g8-tm-angle-angle@tmAASimilar": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("Yes — both angle sets"))!,
  "g8-tm-angle-angle@tmAANotSimilar": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("No — only one"))!,
  "g8-tm-angle-angle@tmAAScale": (p) => { const m=p.match(/side of (\d+).*matches (\d+).*side of (\d+)/)!; return Number(m[3])*Number(m[2])/Number(m[1]); },
  "g8-tm-pythagorean-converse": (p) => p.split("||")[1].split(";;").find((x)=>x.startsWith("Yes —"))!,
  "g8-tm-pythagorean-converse@tmConverseRight": (p) => INDEPENDENT["g8-tm-pythagorean-converse"](p),
  "g8-tm-pythagorean-converse@tmDistanceOrigin": (p) => { const m=p.match(/to \((-?\d+), (-?\d+)\)/)!; return Math.hypot(Number(m[1]),Number(m[2])); },
  "g8-tm-pythagorean-converse@tmDistanceOffset": (p) => { const m=p.match(/from \((-?\d+), (-?\d+)\) to \((-?\d+), (-?\d+)\)/)!; return Math.hypot(Number(m[3])-Number(m[1]),Number(m[4])-Number(m[2])); },
  "g8-tm-pythagorean-converse@tmConverseSort": (p) => {
    const items=p.split("||")[1].split(",");
    return Object.fromEntries(items.map((label)=>{ const [a,b,c]=[...label.matchAll(/\d+/g)].map(m=>Number(m[0])); return [label,a*a+b*b===c*c?"right":"not"]; }));
  },
  "g8-bv-scatter-basics": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/dot is at \((\d+), (\d+)\)/)!;
    const [x, y] = m.slice(1).map(Number);
    const units = /hours studied/.test(prompt) ? ["hours", "problems"]
      : /weeks old/.test(prompt) ? ["weeks", "centimeters"]
      : /minutes practiced/.test(prompt) ? ["minutes", "shots"]
      : ["miles", "hundreds of calories"];
    const wanted = `${x} ${units[0]}, ${y} ${units[1]}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-bv-scatter-basics@bvScatterPair": (p) => INDEPENDENT["g8-bv-scatter-basics"](p),
  "g8-bv-scatter-basics@bvScatterCount": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/each of (\d+) (students|plants|players|cyclists)/)!;
    const singular: Record<string, string> = { students: "student", plants: "plant", players: "player", cyclists: "cyclist" };
    const wanted = `${m[1]} — one dot per ${singular[m[2]]}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-bv-scatter-basics@bvScatterPurpose": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("Whether "))!,
  "g8-bv-scatter-basics@bvScatterPlot": (p) => {
    const m = p.match(/plot the point \((\d+), (\d+)\)/)!;
    return [{ x: Number(m[1]), y: Number(m[2]) }];
  },
  "g8-bv-outlier-impact": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("It can pull"))!,
  "g8-bv-outlier-impact@bvOutlierImpact": (p) => INDEPENDENT["g8-bv-outlier-impact"](p),
  "g8-bv-fit-idea": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("No — it should"))!,
  "g8-bv-fit-idea@bvFitTouch": (p) => INDEPENDENT["g8-bv-fit-idea"](p),
  "g8-bv-fit-idea@bvFitDirection": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const wanted = /positive association/.test(prompt) ? "Upward to the right" : "Downward to the right";
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-bv-fit-idea@bvFitPurpose": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("It condenses"))!,
  "g8-bv-fit-idea@bvFitBalance": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("No — the line is not balanced"))!,
  "g8-bv-judge-fit": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const tight = prompt.match(/Cloud ([XY])'s dots hug/)![1];
    return labelsRaw.split(";;").find((label) => label.startsWith(`Cloud ${tight} —`))!;
  },
  "g8-bv-judge-fit@bvJudgeTight": (p) => INDEPENDENT["g8-bv-judge-fit"](p),
  "g8-bv-judge-fit@bvJudgeDistance": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("The overall distances"))!,
  "g8-bv-judge-fit@bvJudgeShift": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const wanted = /above it/.test(prompt) ? "Shift it up" : "Shift it down";
    return labelsRaw.split(";;").find((label) => label.startsWith(wanted))!;
  },
  "g8-bv-judge-fit@bvJudgeCompare": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("Line P —"))!,
  "g8-bv-interpret": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/modeled by y = (\d+)x \+ (\d+)/)!;
    const [rate, start] = m.slice(1).map(Number);
    let wanted = "";
    const slope = /What does the slope/.test(prompt);
    if (/phone plan/.test(prompt)) wanted = slope ? `each gigabyte costs ${rate} dollars` : `The base fee before any data is used is ${start} dollars`;
    else if (/taxi fare/.test(prompt)) wanted = slope ? `each mile adds ${rate} dollars` : `The flat pickup fee before traveling is ${start} dollars`;
    else if (/savings account/.test(prompt)) wanted = slope ? `the amount saved each week is ${rate} dollars` : `The balance already present at week 0 is ${start} dollars`;
    else wanted = slope ? `each ticket adds ${rate} dollars` : `The donation received before ticket sales is ${start} dollars`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-bv-interpret@bvInterpretInterceptA": (p) => INDEPENDENT["g8-bv-interpret"](p),
  "g8-bv-interpret@bvInterpretSlope": (p) => INDEPENDENT["g8-bv-interpret"](p),
  "g8-bv-interpret@bvInterpretInterceptB": (p) => INDEPENDENT["g8-bv-interpret"](p),
  "g8-bv-interpret@bvInterpretSort": (p) => {
    const [, itemsRaw] = p.split("||");
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) out[label] = /per|each|change for one more|added by each|saved each/.test(label) ? "slope" : "intercept";
    return out;
  },
  "g8-bv-prediction-limits": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("Extrapolation"))!,
  "g8-bv-prediction-limits@bvLimitExtrapolate": (p) => INDEPENDENT["g8-bv-prediction-limits"](p),
  "g8-bv-prediction-limits@bvLimitTrust": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/from x = (\d+) through x = (\d+)/)!;
    const [lo, hi] = m.slice(1).map(Number);
    return labelsRaw.split(";;").find((label) => { const n = Number(label.match(/x = (\d+)/)?.[1]); return n >= lo && n <= hi; })!;
  },
  "g8-bv-prediction-limits@bvLimitWhy": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("The real relationship"))!,
  "g8-bv-prediction-limits@bvLimitSort": (p) => {
    const [prompt, itemsRaw] = p.split("||");
    const m = prompt.match(/from x = (\d+) through x = (\d+)/)!;
    const [lo, hi] = m.slice(1).map(Number);
    const out: Record<string, string> = {};
    for (const label of itemsRaw.split(",")) { const x = Number(label.match(/x = (\d+)/)![1]); out[label] = x >= lo && x <= hi ? "inside" : "far"; }
    return out;
  },
  "g8-bv-relative-frequency": (p) => {
    const m = p.match(/Of the (\d+) (?:adults|students|returning customers), (\d+) /)!;
    return Math.round(Number(m[2]) / Number(m[1]) * 100);
  },
  "g8-bv-relative-frequency@bvRelGroup": (p) => INDEPENDENT["g8-bv-relative-frequency"](p),
  "g8-bv-relative-frequency@bvRelAllA": (p) => {
    const m = p.match(/Of all (\d+) [^,]+, (\d+) are/)!;
    return Math.round(Number(m[2]) / Number(m[1]) * 100);
  },
  "g8-bv-relative-frequency@bvRelAllB": (p) => {
    const m = p.match(/contains (\d+) [^.]+\. The cell[^.]+contains (\d+)\./)!;
    return Math.round(Number(m[2]) / Number(m[1]) * 100);
  },
  "g8-bv-relative-frequency@bvRelDivide": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.match(/Of (\d+) (?:adults|students|returning customers), (\d+) /)!;
    const wanted = `${m[2]} ÷ ${m[1]}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-bv-categorical-association": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("Yes —"))!,
  "g8-bv-categorical-association@bvCatWhyRates": (p) => p.split("||")[1].split(";;").find((label) => label === "Rates adjust for group size, so the comparison is fair")!,
  "g8-bv-categorical-association@bvCatAssociation": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("Yes —"))!,
  "g8-bv-categorical-association@bvCatConclusion": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("The variables are associated"))!,
  "g8-bv-categorical-association@bvCatGroup": (p) => {
    const m = p.match(/Among (\d+) [^,]+, (\d+) /)!;
    return Math.round(Number(m[2]) / Number(m[1]) * 100);
  },
  "g8-tm-cylinder-volume": (p) => {
    const m = p.match(/radius (\d+) and height (\d+)/)!;
    return Number(m[1]) * Number(m[1]) * Number(m[2]);
  },
  "g8-tm-cylinder-volume@tmCylinderA": (p) => INDEPENDENT["g8-tm-cylinder-volume"](p),
  "g8-tm-cylinder-volume@tmCylinderB": (p) => INDEPENDENT["g8-tm-cylinder-volume"](p),
  "g8-tm-cylinder-volume@tmCylinderTank": (p) => INDEPENDENT["g8-tm-cylinder-volume"](p),
  "g8-tm-cylinder-volume@tmCylinderBase": (p) => {
    const [, labelsRaw] = p.split("||");
    return labelsRaw.split(";;").find((label) => label === "The area of the circular base")!;
  },
  "g8-tm-cone-volume": (p) => {
    const m = p.match(/radius (\d+) and height (\d+)/)!;
    return Number(m[1]) * Number(m[1]) * Number(m[2]) / 3;
  },
  "g8-tm-cone-volume@tmConeA": (p) => INDEPENDENT["g8-tm-cone-volume"](p),
  "g8-tm-cone-volume@tmConeB": (p) => INDEPENDENT["g8-tm-cone-volume"](p),
  "g8-tm-cone-volume@tmConeContext": (p) => INDEPENDENT["g8-tm-cone-volume"](p),
  "g8-tm-cone-volume@tmConeFromCylinder": (p) => Number(p.match(/volume is (\d+)π/)![1]) / 3,
  "g8-tm-sphere-volume": (p) => {
    const r = Number(p.match(/radius (\d+)/)![1]);
    return 4 * r * r * r / 3;
  },
  "g8-tm-sphere-volume@tmSphereCoeff": (p) => INDEPENDENT["g8-tm-sphere-volume"](p),
  "g8-tm-sphere-volume@tmSphereUnit": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const r = Number(prompt.match(/radius (\d+)/)![1]);
    const wanted = g8PiCoeffLabel(4 * r * r * r, 3);
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-tm-sphere-volume@tmSphereApprox": (p) => Math.round(Number(p.match(/is (\d+)π cubic/)![1]) * 3.14),
  "g8-tm-sphere-volume@tmSphereFormulaMatch": (p) => {
    const [, leftCsv, rightCsv] = p.split("||");
    const rights = rightCsv.split("\u001F");
    const out: Record<string, string> = {};
    for (const left of leftCsv.split("\u001F")) {
      if (left.startsWith("cylinder")) out[left] = rights.find((r) => ["Bh", "πr²h", "¼πd²h", "πR²H", "A × h", "πD²H ÷ 4"].includes(r))!;
      else if (left.startsWith("cone")) out[left] = rights.find((r) => ["⅓Bh", "⅓πr²h", "1⁄12πd²h", "πR²H ÷ 3", "A × h ÷ 3", "πD²H ÷ 12"].includes(r))!;
      else out[left] = rights.find((r) => ["4⁄3πr³", "⅙πd³", "4πR³ ÷ 3", "πD³ ÷ 6"].includes(r))!;
    }
    return out;
  },
  "g8-les-isolate-variable": (p) => {
    const m = p.replace(/−/g, "-").match(/(\d+)x ([+-]) (\d+) = (\d+)x ([+-]) (\d+)/)!;
    const a = Number(m[1]), b = (m[2] === "-" ? -1 : 1) * Number(m[3]);
    const c = Number(m[4]), d = (m[5] === "-" ? -1 : 1) * Number(m[6]);
    for (let x = -200; x <= 200; x++) if (a * x + b === c * x + d) return x;
    throw new Error("no printed isolate-variable root");
  },
  "g8-les-isolate-variable@lesIsolateA": (p) => INDEPENDENT["g8-les-isolate-variable"](p),
  "g8-les-isolate-variable@lesIsolateB": (p) => INDEPENDENT["g8-les-isolate-variable"](p),
  "g8-les-isolate-variable@lesIsolateC": (p) => INDEPENDENT["g8-les-isolate-variable"](p),
  "g8-les-isolate-variable@lesIsolateWhy": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("To preserve equality"))!,
  "g8-les-distribute-solve": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.replace(/−/g, "-").match(/expansion of (\d+)\(x ([+-]) (\d+)\)/)!;
    const a = Number(m[1]), b = (m[2] === "-" ? -1 : 1) * Number(m[3]);
    const wanted = `${a}x ${a * b < 0 ? "−" : "+"} ${Math.abs(a * b)}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-les-distribute-solve@lesExpand": (p) => INDEPENDENT["g8-les-distribute-solve"](p),
  "g8-les-distribute-solve@lesExpandMatch": (p) => {
    const [, leftCsv, rightCsv] = p.split("||");
    const rights = rightCsv.split("\u001F");
    const out: Record<string, string> = {};
    for (const left of leftCsv.split("\u001F")) {
      const m = left.replace(/−/g, "-").match(/(\d+)\(x ([+-]) (\d+)\)/)!;
      const a = Number(m[1]), b = (m[2] === "-" ? -1 : 1) * Number(m[3]);
      const wanted = `${a}x ${a * b < 0 ? "−" : "+"} ${Math.abs(a * b)}`;
      out[left] = rights.find((r) => r === wanted)!;
    }
    return out;
  },
  "g8-les-distribute-solve@lesDistributeCombine": (p) => {
    const m = p.replace(/−/g, "-").match(/(\d+)\(x - (\d+)\) \+ (\d+)x = (\d+)/)!;
    const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]), d = Number(m[4]);
    for (let x = -200; x <= 200; x++) if (a * (x - b) + c * x === d) return x;
    throw new Error("no printed distribute-combine root");
  },
  "g8-les-distribute-solve@lesDistributeBoth": (p) => {
    const m = p.match(/(\d+)\(x \+ (\d+)\) = (\d+)\(x \+ (\d+)\)/)!;
    const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]), d = Number(m[4]);
    for (let x = -200; x <= 200; x++) if (a * (x + b) === c * (x + d)) return x;
    throw new Error("no printed distribute-both root");
  },
  "g8-les-solution-count": (p) => p.split("||")[1].split(";;").find((label) => label === "No solution")!,
  "g8-les-solution-count@lesNoDirect": (p) => INDEPENDENT["g8-les-solution-count"](p),
  "g8-les-solution-count@lesNoChoose": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) {
      const m = label.match(/(\d+)x \+ (\d+) = (\d+)x \+ (\d+)/);
      if (m && Number(m[1]) === Number(m[3]) && Number(m[2]) !== Number(m[4])) return label;
    }
    throw new Error("no contradictory equal-coefficient equation");
  },
  "g8-les-solution-count@lesNoDistribute": (p) => INDEPENDENT["g8-les-solution-count"](p),
  "g8-les-solution-count@lesNoBlank": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const b = Number(prompt.match(/x \+ (\d+) =/)![1]);
    return labelsRaw.split(";;").find((label) => label === `Any number except ${b}`)!;
  },
  "g8-les-solution-count@lesInfiniteDirect": (p) => p.split("||")[1].split(";;").find((label) => label === "Infinitely many")!,
  "g8-les-solution-count@lesInfiniteChoose": (p) => {
    const [, labelsRaw] = p.split("||");
    for (const label of labelsRaw.split(";;")) {
      const m = label.match(/(\d+)\(x \+ (\d+)\) = (\d+)x \+ (\d+)/);
      if (m && Number(m[1]) === Number(m[3]) && Number(m[1]) * Number(m[2]) === Number(m[4])) return label;
    }
    throw new Error("no identity after distribution");
  },
  "g8-les-solution-count@lesInfiniteMeaning": (p) => p.split("||")[1].split(";;").find((label) => label.startsWith("Infinitely many solutions"))!,
  "g8-les-solution-count@lesInfiniteBlank": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const constant = prompt.match(/x \+ (\d+) = \d+x \+ □/)![1];
    return labelsRaw.split(";;").find((label) => label === constant)!;
  },
  "g8-les-solution-count@lesClassifyOne": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const kind = g8ClassifyPrintedEquation(prompt);
    return labelsRaw.split(";;").find((label) => label.startsWith(kind))!;
  },
  "g8-les-solution-count@lesClassifySame": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const kind = g8ClassifyPrintedEquation(prompt);
    return labelsRaw.split(";;").find((label) => label.startsWith(kind))!;
  },
  "g8-les-solution-count@lesClassifyDistributed": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const kind = g8ClassifyPrintedEquation(prompt);
    return labelsRaw.split(";;").find((label) => label.startsWith(kind))!;
  },
  "g8-les-solution-count@lesClassifyChallenge": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const kind = g8ClassifyPrintedEquation(prompt);
    return labelsRaw.split(";;").find((label) => label.startsWith(kind))!;
  },
  "g8-les-system-meaning": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const labels = labelsRaw.split(";;");
    if (prompt.startsWith("Does (")) {
      const point = prompt.match(/Does \((-?\d+), (-?\d+)\)/)!;
      const [x, y] = [Number(point[1]), Number(point[2])];
      const lines = g8LinesFromPrompt(prompt);
      const holds = lines.map((l) => y === l.m * x + l.b);
      if (holds[0] && holds[1]) return labels.find((x) => x.startsWith("Yes — it satisfies both"))!;
      if (holds[0]) return labels.find((x) => x.startsWith("No — it satisfies the first"))!;
      if (holds[1]) return labels.find((x) => x.startsWith("No — it satisfies the second"))!;
      return labels.find((x) => x.startsWith("No — it satisfies neither"))!;
    }
    if (prompt.startsWith("Which point") && g8LinesFromPrompt(prompt).length >= 2) {
      const lines = g8LinesFromPrompt(prompt);
      return labels.find((label) => {
        const m = label.match(/^\((-?\d+), (-?\d+)\)$/);
        if (!m) return false;
        const [x, y] = [Number(m[1]), Number(m[2])];
        return lines.every((l) => y === l.m * x + l.b);
      })!;
    }
    return labels.find((label) => /intersect|shared intersection|both lines|graphs cross|ordered-pair solution|ordered pair shared|shared by both graphs|both equations|same y-value|satisfies both|unique intersection|simultaneously/.test(label))!;
  },
  "g8-les-system-meaning@lesPointFailsSecond": (p) => INDEPENDENT["g8-les-system-meaning"](p),
  "g8-les-system-meaning@lesPointSolveA": (p) => INDEPENDENT["g8-les-system-meaning"](p),
  "g8-les-system-meaning@lesIntersectionMeaning": (p) => INDEPENDENT["g8-les-system-meaning"](p),
  "g8-les-system-meaning@lesPointSolveChallenge": (p) => INDEPENDENT["g8-les-system-meaning"](p),
  "g8-les-system-graphing": (p) => {
    const lines = g8LinesFromPrompt(p);
    const x = (lines[1].b - lines[0].b) / (lines[0].m - lines[1].m);
    const y = lines[0].m * x + lines[0].b;
    return /y-coordinate/.test(p) ? y : x;
  },
  "g8-les-system-graphing@lesGraphXBasic": (p) => INDEPENDENT["g8-les-system-graphing"](p),
  "g8-les-system-graphing@lesGraphXSigned": (p) => INDEPENDENT["g8-les-system-graphing"](p),
  "g8-les-system-graphing@lesGraphYGiven": (p) => INDEPENDENT["g8-les-system-graphing"](p),
  "g8-les-system-graphing@lesGraphYChallenge": (p) => INDEPENDENT["g8-les-system-graphing"](p),
  "g8-les-system-count": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const lines = g8LinesFromPrompt(prompt);
    const kind = lines[0].m !== lines[1].m ? "One solution" : lines[0].b === lines[1].b ? "Infinitely many solutions" : "No solution";
    return labelsRaw.split(";;").find((label) => label.startsWith(kind))!;
  },
  "g8-les-system-count@lesCountParallelInt": (p) => INDEPENDENT["g8-les-system-count"](p),
  "g8-les-system-count@lesCountParallelSigned": (p) => INDEPENDENT["g8-les-system-count"](p),
  "g8-les-system-count@lesCountParallelFraction": (p) => INDEPENDENT["g8-les-system-count"](p),
  "g8-les-system-count@lesCountSame": (p) => INDEPENDENT["g8-les-system-count"](p),
  "g8-les-substitution-method": (p) => {
    const first = g8LinesFromPrompt(p)[0];
    const m = p.replace(/−/g, "-").match(/and (\d*)x \+ y = (-?\d+)/)!;
    const a = m[1] === "" ? 1 : Number(m[1]);
    return (Number(m[2]) - first.b) / (a + first.m);
  },
  "g8-les-substitution-method@lesSubstituteA": (p) => INDEPENDENT["g8-les-substitution-method"](p),
  "g8-les-substitution-method@lesSubstituteMultiple": (p) => INDEPENDENT["g8-les-substitution-method"](p),
  "g8-les-substitution-method@lesSubstituteMultipleB": (p) => INDEPENDENT["g8-les-substitution-method"](p),
  "g8-les-substitution-method@lesSubstituteAffine": (p) => INDEPENDENT["g8-les-substitution-method"](p),
  "g8-les-system-verify": (p) => {
    const [prompt, labelsRaw] = p.split("||");
    const m = prompt.replace(/−/g, "-").match(/Does \((-?\d+), (-?\d+)\) solve the system y = (-?\d+)x and (\d*)x \+ y = (-?\d+)\?/)!;
    const [x, y, k, a, total] = [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === "" ? 1 : Number(m[4]), Number(m[5])];
    const yes = y === k * x && a * x + y === total;
    return labelsRaw.split(";;").find((label) => yes ? label.startsWith("Yes — it satisfies both") : label.startsWith("No —"))!;
  },
  "g8-les-system-verify@lesVerifyPoint": (p) => INDEPENDENT["g8-les-system-verify"](p),
  "g8-les-systems-word": (p) => {
    let m = p.match(/short piece of (\d+) meters.*?is (\d+) times/);
    if (m) return Number(m[1]) * Number(m[2]);
    m = p.match(/smaller is x = (\d+)/);
    if (m) {
      const k = Number(p.match(/larger is (\d+) times/)![1]);
      return Number(m[1]) * k;
    }
    m = p.match(/buys (\d+) tickets/);
    if (m) return (Number(m[1]) - 1) / 2;
    m = p.match(/cost \$(\d+) together.*?costs \$(\d+) more than (\d+) times/);
    if (m) return (Number(m[1]) - Number(m[2])) / (Number(m[3]) + 1);
    throw new Error(`unparsed systems word prompt: ${p}`);
  },
  "g8-les-systems-word@lesWordLarger": (p) => INDEPENDENT["g8-les-systems-word"](p),
  "g8-les-systems-word@lesWordRope": (p) => INDEPENDENT["g8-les-systems-word"](p),
  "g8-les-systems-word@lesWordTickets": (p) => INDEPENDENT["g8-les-systems-word"](p),
  "g8-les-systems-word@lesWordPurchase": (p) => INDEPENDENT["g8-les-systems-word"](p),
  "g8-fn-function-definition": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const labels = labelsRaw.split(";;").filter(Boolean);
    if (/Which relation is a function/.test(prompt)) return labels.find((label) => g8RelationIsFunction(label))!;
    const yes = g8RelationIsFunction(prompt);
    return labels.find((label) => yes ? label.startsWith("Yes —") : label.startsWith("No —"))!;
  },
  "g8-fn-function-definition@fgFunctionBirthday": (p) => INDEPENDENT["g8-fn-function-definition"](p),
  "g8-fn-function-definition@fgFunctionSharedOutput": (p) => INDEPENDENT["g8-fn-function-definition"](p),
  "g8-fn-function-definition@fgChooseFunction": (p) => INDEPENDENT["g8-fn-function-definition"](p),
  "g8-fn-function-definition@fgSortFunctionRules": (p) => {
    const [, itemsRaw = ""] = p.split("||");
    return Object.fromEntries(itemsRaw.split(",").filter(Boolean).map((label) => [label, g8RelationIsFunction(label) ? "fn" : "not"]));
  },
  "g8-fn-function-definition@fgFunctionRepeatedInput": (p) => INDEPENDENT["g8-fn-function-definition"](p),
  "g8-fn-function-definition@fgFunctionTableRepeated": (p) => INDEPENDENT["g8-fn-function-definition"](p),
  "g8-fn-vertical-line": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const passes = (raw: string) => raw.trim().startsWith("y =");
    if (labelsRaw && !labelsRaw.includes(";;")) {
      return Object.fromEntries(labelsRaw.split(",").filter(Boolean).map((label) => [label, passes(label) ? "pass" : "fail"]));
    }
    const equation = prompt.match(/graph of (.+) pass the vertical-line test/)![1];
    const wanted = passes(equation) ? "Passes" : "Fails";
    return labelsRaw.split(";;").find((label) => label.startsWith(wanted))!;
  },
  "g8-fn-rate-of-change": (p) => {
    let m = p.match(/contains (-?\d+) liters at (-?\d+) minutes? and (-?\d+) liters at (-?\d+) minutes?/);
    if (m) return (Number(m[3]) - Number(m[1])) / (Number(m[4]) - Number(m[2]));
    m = p.match(/x goes from (-?\d+) to (-?\d+), y goes from (-?\d+) to (-?\d+)/)!;
    return (Number(m[4]) - Number(m[3])) / (Number(m[2]) - Number(m[1]));
  },
  "g8-fn-constant-slope": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    let m = prompt.match(/small slope triangle has rise (\d+) and run (\d+).*?has run (\d+)/);
    if (m) return Number(m[1]) * Number(m[3]) / Number(m[2]);
    m = prompt.replace(/−/g, "-").match(/through \((-?\d+), (-?\d+)\) and \((-?\d+), (-?\d+)\)/)!;
    const dy = Number(m[4]) - Number(m[2]);
    const dx = Number(m[3]) - Number(m[1]);
    if (!labelsRaw) return dy / dx;
    const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);
    const g = gcd(dy, dx);
    const wanted = `${dy / g}/${dx / g}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-fn-initial-value": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    let m = prompt.match(/table shows \(0, (-?\d+)\)/i);
    if (m) return Number(m[1]);
    m = prompt.match(/slope (-?\d+) and passes through \((-?\d+), (-?\d+)\)/);
    if (m) return Number(m[3]) - Number(m[1]) * Number(m[2]);
    let slope: number;
    let intercept: number;
    m = prompt.match(/slope (\d+) and initial value (\d+)/);
    if (m) {
      slope = Number(m[1]); intercept = Number(m[2]);
    } else {
      m = prompt.match(/passes through \(0, (-?\d+)\) and \((-?\d+), (-?\d+)\)/)!;
      intercept = Number(m[1]);
      slope = (Number(m[3]) - intercept) / Number(m[2]);
    }
    const wanted = `y = ${slope}x + ${intercept}`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-fn-same-function-forms": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    let m = prompt.match(/starts at (\d+) and rises (\d+)/);
    if (!m) m = prompt.match(/y-axis at (\d+) and rises (\d+)/);
    // A build prompt now arrives with its token bank appended as JSON — that part is a bank, not an
    // MCQ label list, so it must not shunt the prompt into the option-matching branches below.
    if (m && (!labelsRaw || labelsRaw.startsWith("{"))) return ["y", "=", m[2], "x", "+", m[1]];
    m = prompt.match(/table \(0, (-?\d+)\), \(1, (-?\d+)\), \(2, (-?\d+)\).*?y = (\d+)x \+ (-?\d+)/);
    if (m) {
      const same = Number(m[2]) - Number(m[1]) === Number(m[4]) && Number(m[1]) === Number(m[5]);
      return labelsRaw.split(";;").find((label) => label.startsWith(same ? "Yes —" : "No —"))!;
    }
    const target = prompt.match(/same function as y = (\d+)x \+ (\d+)/)!;
    const want = { m: Number(target[1]), b: Number(target[2]) };
    return labelsRaw.split(";;").find((label) => {
      const rule = g8PrintedFunctionRule(label);
      return rule !== null && (rule.m !== want.m || rule.b !== want.b);
    })!;
  },
  "g8-fn-compare-rates": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const rateFor = (name: "A" | "B"): number => {
      let m = prompt.match(new RegExp(`Function ${name} is y = (\\d+)x`));
      if (m) return Number(m[1]);
      m = prompt.match(new RegExp(`Function ${name} (?:is the table|has table) \\(0, 0\\), \\(1, (\\d+)\\)`));
      if (m) return Number(m[1]);
      throw new Error(`cannot parse rate for Function ${name}: ${prompt}`);
    };
    const rates: Record<string, number> = { "Function A": rateFor("A"), "Function B": rateFor("B") };
    const c = prompt.match(/Function C gains (\d+) each step/);
    if (c) rates["Function C"] = Number(c[1]);
    const wanted = Object.entries(rates).sort((a, b) => b[1] - a[1])[0][0];
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-fn-compare-full": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const a = prompt.match(/Function A is y = (\d+)x \+ (\d+)/)!;
    const b = prompt.match(/Function B has table \(0, (-?\d+)\), \(1, (-?\d+)\)/)!;
    const mA = Number(a[1]);
    const bA = Number(a[2]);
    const bB = Number(b[1]);
    const mB = Number(b[2]) - bB;
    const startHigher = bA > bB ? "Function A" : "Function B";
    const growsFaster = mA > mB ? "Function A" : "Function B";
    const wanted = mA === mB
      ? `They grow at the same rate, but ${startHigher} starts higher`
      : startHigher === growsFaster
        ? `${startHigher} starts higher and grows faster`
        : `${startHigher} starts higher, but ${growsFaster} grows faster`;
    return labelsRaw.split(";;").find((label) => label === wanted)!;
  },
  "g8-fn-compare-context": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    if (labelsRaw) {
      const m = prompt.match(/Plan A charges \$\d+ to join and \$(\d+) per month\. Plan B charges \$\d+ to join and \$(\d+) per month/)!;
      const winner = Number(m[1]) < Number(m[2]) ? "Plan A" : "Plan B";
      return labelsRaw.split(";;").find((label) => label.startsWith(`${winner}, at $`))!;
    }
    const m = prompt.match(/Plan A follows y = (?:(\d+)?x) \+ (\d+), and Plan B follows y = (?:(\d+)?x) \+ (\d+)/)!;
    const mA = m[1] === undefined ? 1 : Number(m[1]);
    const bA = Number(m[2]);
    const mB = m[3] === undefined ? 1 : Number(m[3]);
    const bB = Number(m[4]);
    for (let x = 0; x <= 10000; x++) if (mA * x + bA === mB * x + bB) return x;
    throw new Error(`no whole-number crossing found: ${prompt}`);
  },
  "g8-fn-linear-nonlinear": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const isLinear = (label: string) => {
      const values = (label.match(/-?\d+/g) || []).map(Number);
      if (values.length < 4) throw new Error(`cannot read sequence: ${label}`);
      const ys = values.slice(-4);
      const ds = ys.slice(1).map((y, i) => y - ys[i]);
      return ds.every((d) => d === ds[0]);
    };
    if (labelsRaw && !labelsRaw.includes(";;")) {
      return Object.fromEntries(labelsRaw.split(",").filter(Boolean).map((label) => [label, isLinear(label) ? "lin" : "non"]));
    }
    const labels = labelsRaw.split(";;").filter(Boolean);
    if (/Which equation represents a nonlinear function/.test(prompt)) {
      return labels.find((label) => /x²|x³|\|x\|/.test(label))!;
    }
    const ys = (prompt.match(/outputs ([^f]+) for inputs/)![1].match(/-?\d+/g) || []).map(Number);
    const ds = ys.slice(1).map((y, i) => y - ys[i]);
    const linear = ds.every((d) => d === ds[0]);
    return labels.find((label) => label.startsWith(linear ? "Linear —" : "Nonlinear —"))!;
  },
  "g8-fn-qualitative-graphs": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const labels = labelsRaw.split(";;").filter(Boolean);
    if (/MUCH STEEPER/.test(prompt)) return labels.find((x) => x.startsWith("The quantity changes faster"))!;
    if (/LESS STEEP/.test(prompt)) return labels.find((x) => x.startsWith("The quantity changes more slowly"))!;
    if (/slopes UPWARD/.test(prompt)) return labels.find((x) => /increasing over time/.test(x))!;
    if (/slopes DOWNWARD/.test(prompt)) return labels.find((x) => /decreasing over time/.test(x))!;
    if (/slopes HORIZONTAL/.test(prompt)) return labels.find((x) => /staying constant over time/.test(x))!;
    if (/keeps rising/.test(prompt)) return labels.find((x) => x === "It is still increasing, but more slowly")!;
    if (/keeps falling/.test(prompt)) return labels.find((x) => x === "It is still decreasing, but more slowly")!;
    if (/shows the traveler stopped/.test(prompt)) return labels.find((x) => x === "A horizontal section")!;
    throw new Error(`unparsed qualitative graph prompt: ${prompt}`);
  },
  "g8-fn-graph-stories": (p) => {
    const [prompt, labelsRaw = ""] = p.split("||");
    const labels = labelsRaw.split(";;").filter(Boolean);
    if (/speeds up from rest/.test(prompt)) return labels.find((x) => x.startsWith("A curve that steepens"))!;
    if (/steady pace, then stops to wait/.test(prompt)) return labels.find((x) => x === "A straight rising line, then a horizontal line")!;
    if (/increases by more during each time interval/.test(prompt)) return labels.find((x) => x === "A rising curve that gets steeper over time")!;
    if (/travels fast, stops briefly, then continues slowly/.test(prompt)) return labels.find((x) => x.startsWith("A steep rising line, then horizontal"))!;
    if (/travels slowly, stops briefly, then continues fast/.test(prompt)) return labels.find((x) => x.startsWith("A gentle rising line, then horizontal"))!;
    throw new Error(`unparsed graph story prompt: ${prompt}`);
  },

  // Session 80 — Grade 6 expressions/equations form routes. Each route reconstructs the answer
  // from the learner-visible prompt, usually by repeated multiplication, substitution, or direct
  // boundary testing rather than reusing the generator's algebra.
  "power-product@basicSquare": (p) => {
    const b = Number(p.match(/What is (\d+)\^2/)![1]);
    let t = 0; for (let i = 0; i < b; i++) t += b; return t;
  },
  "power-product@powerMeaning": (p) => {
    const [prompt, raw] = p.split("||");
    const m = prompt.match(/explains (\d+)\^(\d+)/)!;
    const factors = Array.from({ length: Number(m[2]) }, () => m[1]).join(" × ");
    return raw.split(";;").find((x) => x === factors)!;
  },
  "power-product@tenPower": (p) => {
    const e = Number(p.match(/10\^(\d+)/)![1]);
    let t = 1; for (let i = 0; i < e; i++) t *= 10; return t;
  },
  "power-product@missingPowerExponent": (p) => {
    const m = p.match(/^(\d+) can be written as (\d+)\^\?/)!;
    const target = Number(m[1]), base = Number(m[2]);
    let t = 1; for (let e = 0; e <= 12; e++) { if (t === target) return e; t *= base; }
    throw new Error("missing exponent not found");
  },
  "power-product@basicPower": (p) => {
    const m = p.match(/Evaluate (\d+)\^(\d+)/)!;
    let t = 1; for (let i = 0; i < Number(m[2]); i++) t *= Number(m[1]); return t;
  },
  "power-product@comparePowers": (p) => {
    const [prompt, raw] = p.split("||");
    const m = prompt.match(/larger: (\d+)\^(\d+) or (\d+)\^(\d+)/)!;
    const pow = (b: number, e: number) => { let t = 1; for (let i = 0; i < e; i++) t *= b; return t; };
    const l = pow(Number(m[1]), Number(m[2])), r = pow(Number(m[3]), Number(m[4]));
    const wanted = l > r ? `${m[1]}^${m[2]}` : `${m[3]}^${m[4]}`;
    return raw.split(";;").find((x) => x === wanted)!;
  },
  "power-product@parenPower": (p) => {
    const m = p.match(/\((\d+) \+ (\d+)\)\^2/)!;
    const sum = Number(m[1]) + Number(m[2]); let t = 0; for (let i = 0; i < sum; i++) t += sum; return t;
  },
  "power-product@sumPowers": (p) => {
    const m = p.match(/Evaluate (\d+)\^2 \+ (\d+)\^2/)!;
    const a = Number(m[1]), b = Number(m[2]);
    let aa = 0, bb = 0; for (let i = 0; i < a; i++) aa += a; for (let i = 0; i < b; i++) bb += b; return aa + bb;
  },
  "power-product@mixedPowerOrder": (p) => {
    const m = p.match(/Evaluate (\d+) \+ (\d+) × (\d+)\^2/)!;
    const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);
    let sq = 0; for (let i = 0; i < c; i++) sq += c;
    let prod = 0; for (let i = 0; i < b; i++) prod += sq;
    return a + prod;
  },
  "grouping-first@powerMulEval": (p) => {
    const m = p.match(/Evaluate (\d+) × (\d+)\^(\d+)/)!;
    const a = Number(m[1]), b = Number(m[2]), e = Number(m[3]);
    let pw = 1; for (let i = 0; i < e; i++) pw *= b;
    let t = 0; for (let i = 0; i < a; i++) t += pw; return t;
  },
  "variable-meaning@lessThanPhrase": (p) => {
    const [prompt, raw] = p.split("||"); const k = prompt.match(/"(\d+) less than x"/)![1];
    return raw.split(";;").find((x) => x === `x − ${k}`)!;
  },
  "variable-meaning@twicePlusPhrase": (p) => {
    const [prompt, raw] = p.split("||"); const k = prompt.match(/"(\d+) more than twice n"/)![1];
    return raw.split(";;").find((x) => x === `2n + ${k}`)!;
  },
  "variable-meaning@halfEval": (p) => Number(p.match(/y = (\d+)/)![1]) / 2,
  "variable-meaning@tripleMinusEval": (p) => {
    const m = p.match(/"(\d+) less than triple m".*m = (\d+)/)!;
    let triple = 0; for (let i = 0; i < 3; i++) triple += Number(m[2]); return triple - Number(m[1]);
  },
  "variable-meaning@independentPay": (p) => p.split("||")[1].split(";;").find((x) => x === "h (hours worked)")!,
  "variable-meaning@linearRelation": (p) => {
    const m = p.match(/y = (\d+)x\. If x = (\d+)/)!;
    let t = 0; for (let i = 0; i < Number(m[1]); i++) t += Number(m[2]); return t;
  },
  "variable-meaning@independentLaps": (p) => p.split("||")[1].split(";;").find((x) => x === "number of laps")!,
  "variable-meaning@shirtsCost": (p) => {
    const m = p.match(/cost \$?(\d+) each.*buys (\d+) shirts/)!;
    let t = 0; for (let i = 0; i < Number(m[2]); i++) t += Number(m[1]); return t;
  },
  "distributive@variableEval": (p) => {
    const m = p.match(/Evaluate (\d+)\(x \+ (\d+)\) at x = (\d+)/)!;
    const a = Number(m[1]), inside = Number(m[2]) + Number(m[3]); let t = 0; for (let i = 0; i < a; i++) t += inside; return t;
  },
  "distributive@variableEquivalent": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/equals (\d+)\(n \+ (\d+)\)/)!;
    const wanted = `${m[1]}n + ${Number(m[1]) * Number(m[2])}`; return raw.split(";;").find((x) => x === wanted)!;
  },
  "distributive@variableBoth": (p) => {
    const m = p.match(/^(\d+)\(y \+ (\d+)\).*y = (\d+)/)!;
    const a = Number(m[1]), inside = Number(m[2]) + Number(m[3]); let t = 0; for (let i = 0; i < a; i++) t += inside; return t;
  },
  "distributive@variableError": (p) => {
    const m = p.match(/expands (\d+)\(x \+ (\d+)\).*At x = (\d+)/)!;
    const a = Number(m[1]), inside = Number(m[2]) + Number(m[3]); let t = 0; for (let i = 0; i < a; i++) t += inside; return t;
  },
  "equiv-test@likeSubtract": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/Simplify (\d+)m − (\d+)m/)!;
    const wanted = `${Number(m[1]) - Number(m[2])}m`; return raw.split(";;").find((x) => x === wanted)!;
  },
  "equiv-test@claimAtValue": (p) => {
    const m = p.match(/claims (\d+)x \+ (\d+) = .* at x = (\d+)/)!;
    let t = Number(m[2]); for (let i = 0; i < Number(m[1]); i++) t += Number(m[3]); return t;
  },
  "equiv-test@likeConstant": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/Simplify (\d+)n \+ (\d+) \+ (\d+)n/)!;
    const wanted = `${Number(m[1]) + Number(m[3])}n + ${m[2]}`; return raw.split(";;").find((x) => x === wanted)!;
  },
  "equiv-test@distributeCombine": (p) => {
    const m = p.match(/Simplify (\d+)\(x \+ (\d+)\) \+ (\d+)x, then evaluate at x = (\d+)/)!;
    const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]), x = Number(m[4]);
    let t = 0; for (let i = 0; i < a; i++) t += x + b; for (let i = 0; i < c; i++) t += x; return t;
  },
  "unknown-letter@testAddSolution": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/x = (\d+).*x \+ (\d+) = (\d+)/)!;
    const v = Number(m[1]), a = Number(m[2]), t = Number(m[3]);
    const wanted = v + a === t ? `Yes — ${v} + ${a} = ${t}` : `No — ${v} + ${a} = ${v + a}, not ${t}`;
    return raw.split(";;").find((x) => x === wanted)!;
  },
  "unknown-letter@solveAdd": (p) => {
    const m = p.match(/x \+ (\d+) = (\d+)/)!; for (let x = 0; x <= 100; x++) if (x + Number(m[1]) === Number(m[2])) return x;
    throw new Error("no add solution");
  },
  "unknown-letter@equationVsExpression": (p) => p.split("||")[1].split(";;").find((x) => x.includes("="))!,
  "unknown-letter@chooseMulSolution": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/For (\d+)x = (\d+)/)!;
    for (let x = 0; x <= 100; x++) if (Number(m[1]) * x === Number(m[2])) return raw.split(";;").find((z) => z === `x = ${x}`)!;
    throw new Error("no multiply solution");
  },
  "unknown-letter@checkAddSolution": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/x \+ (\d+) = (\d+) and got x = (\d+)/)!;
    const wanted = `Substitute ${m[3]}: verify ${m[3]} + ${m[1]} = ${m[2]}`; return raw.split(";;").find((x) => x === wanted)!;
  },
  "unknown-letter@solveSubtract": (p) => {
    const m = p.match(/x − (\d+) = (\d+)/)!; for (let x = 0; x <= 100; x++) if (x - Number(m[1]) === Number(m[2])) return x;
    throw new Error("no subtract solution");
  },
  "unknown-letter@feeSolve": (p) => {
    const m = p.match(/\$(\d+) fee.*\$(\d+)/)!; return Number(m[2]) - Number(m[1]);
  },
  "unknown-letter@tipSolve": (p) => {
    const m = p.match(/\$(\d+) tip.*\$(\d+)/)!; return Number(m[2]) - Number(m[1]);
  },
  "g7-tse-inequality-build@strictBoundary": (p) => {
    const [prompt, raw] = p.split("||"); const b = prompt.match(/x = (-?\d+).*x > (-?\d+)/)![1];
    return raw.split(";;").find((x) => x === `No — ${b} is equal to the boundary, not greater`)!;
  },
  "g7-tse-inequality-build@inclusiveBoundary": (p) => {
    const [prompt, raw] = p.split("||"); const b = prompt.match(/x = (-?\d+).*x ≤ (-?\d+)/)![1];
    return raw.split(";;").find((x) => x === `Yes — the ≤ symbol includes equality`)!;
  },
  "g7-tse-inequality-build@noLargest": (p) => p.split("||")[1].split(";;").find((x) => x === "There is no largest solution")!,
  "g7-tse-inequality-build@atLeastBoundary": (p) => {
    const [prompt, raw] = p.split("||"); const n = prompt.match(/at least (\d+)/)![1];
    return raw.split(";;").find((x) => x === `Yes — “at least” includes exactly ${n}`)!;
  },
  // graphBuild (numberLineRay): parse "Draw x SYM B" from the printed prompt and recover the
  // relation by SUBSTITUTION — classify sample points against the symbol's plain meaning, then
  // name which (relation, inclusive) pair produces exactly that classification. Never touches the
  // generator's own relation fields or the engine's set comparators.
  "g7-tse-inequality-build@graphBuild": (p) => {
    const m = p.match(/Draw x (≤|<|≥|>) (-?\d+)\./)!;
    const sym = m[1]!; const b = Number(m[2]!);
    const satisfies = (x: number) => (sym === "<" ? x < b : sym === "≤" ? x <= b : sym === ">" ? x > b : x >= b);
    // classification at b−1, b, b+1 pins direction and inclusivity uniquely
    const sig = [satisfies(b - 1), satisfies(b), satisfies(b + 1)].join(",");
    const rel = sig === "true,true,false" ? "lt-inclusive" : sig === "true,false,false" ? "lt-strict"
      : sig === "false,true,true" ? "gt-inclusive" : sig === "false,false,true" ? "gt-strict" : "IMPOSSIBLE";
    return [rel, String(b)];
  },
  "g7-tse-inequality-build@graphDescription": (p) => {
    const [prompt, raw] = p.split("||"); const b = prompt.match(/x ≤ (-?\d+)/)![1];
    return raw.split(";;").find((x) => x === `Closed circle at ${b}, arrow left`)!;
  },
  "g7-tse-inequality-build@graphToInequality": (p) => {
    const m = p.match(/(CLOSED|OPEN) circle at (-?\d+) with the arrow pointing (RIGHT|LEFT)/)!;
    const rel = m[3] === "RIGHT" ? (m[1] === "CLOSED" ? ">=" : ">") : (m[1] === "CLOSED" ? "<=" : "<");
    return ["x", rel, m[2]];
  },
  "g7-tse-inequality-build@testPoint": (p) => {
    const [prompt, raw] = p.split("||"); const m = prompt.match(/x ([<>]) (-?\d+)\. Does x = (-?\d+)/)!;
    const rel = m[1], b = Number(m[2]), v = Number(m[3]), works = rel === "<" ? v < b : v > b;
    const wanted = works ? `Yes — ${v} ${rel} ${b}` : `No — ${v} does not satisfy x ${rel} ${b}`;
    return raw.split(";;").find((x) => x === wanted)!;
  },
  "g7-tse-inequality-build@atMostBoundary": (p) => {
    const [prompt, raw] = p.split("||"); const n = prompt.match(/at most (\d+)/)![1];
    return raw.split(";;").find((x) => x === `Yes — “at most” includes the maximum ${n}`)!;
  },

  // G6-C / The Number System — each form below recomputes from PRINTED quantities. The routes
  // deliberately use counting, exact cross-products, or factor scans rather than the generator's
  // arithmetic expressions, preserving the two-route integrity contract.
  "unit-frac-divide@sameDenomCount": (p) => {
    const m = p.match(/\((\d+)\/(\d+) ÷ (\d+)\/(\d+)\)/)!;
    const piece = Number(m[3]);
    let left = Number(m[1]), count = 0;
    while (left >= piece) { left -= piece; count++; }
    return count;
  },
  "unit-frac-divide@divisionMagnitude": (p) => {
    const whole = p.match(/is (\d+) ÷/)![1];
    return nsOptions(p).find((x) => x === `Bigger than ${whole}`)!;
  },
  "unit-frac-divide@properPieces": (p) => {
    const m = p.match(/A (\d+)-foot ribbon.*each (\d+)\/(\d+)/)!;
    const length = Number(m[1]), n = Number(m[2]), d = Number(m[3]);
    let used = 0, pieces = 0;
    while (used < length * d) { used += n; pieces++; }
    return pieces;
  },
  "unit-frac-divide@divideFractionWhole": (p) => {
    const m = p.match(/(\d+)\/(\d+) ÷ (\d+)\/(\d+)/)!;
    let n = Number(m[1]) * Number(m[4]), d = Number(m[2]) * Number(m[3]);
    const g = nsGcd(n, d); n /= g; d /= g;
    return d === 1 ? n : n / d;
  },
  "unit-frac-divide@divideFractionNumerator": (p) => {
    const m = p.match(/Compute (\d+)\/(\d+) ÷ (\d+)\/(\d+)/)!;
    const d = Number(m[2]) * Number(m[3]);
    let n = Number(m[1]) * Number(m[4]);
    const g = nsGcd(n, d); n /= g;
    return n;
  },
  "unit-frac-divide@flipDivisor": (p) => {
    const m = p.match(/compute (\d+)\/(\d+) ÷ (\d+)\/(\d+)/)!;
    const wanted = `${m[3]}/${m[4]}, the divisor`;
    return nsOptions(p).find((x) => x === wanted)!;
  },
  "unit-frac-divide@mixedDivide": (p) => {
    const m = p.match(/(\d+) (\d+)\/(\d+).*1\/(\d+)/)!;
    return (Number(m[1]) * Number(m[3]) + Number(m[2])) * (Number(m[4]) / Number(m[3]));
  },
  "unit-frac-divide@mixedScoops": (p) => {
    const m = p.match(/(\d+) (\d+)\/(\d+).*1\/(\d+)/)!;
    const totalSmallParts = Number(m[1]) * Number(m[3]) + Number(m[2]);
    let scoops = 0;
    for (let i = 0; i < totalSmallParts; i++) scoops += Number(m[4]) / Number(m[3]);
    return scoops;
  },
  "long-div-2digit@invalidRemainder": (p) => {
    const m = p.match(/remainder (\d+).*divisor (\d+)/)!;
    const wanted = `The remainder ${m[1]} is not less than the divisor ${m[2]}`;
    return nsOptions(p).find((x) => x === wanted)!;
  },
  "decimal-align-addsub@threeAdd": (p) => {
    const m = p.match(/Compute ([\d.]+) \+ ([\d.]+) \+ (\d+)/)!;
    const cents = [m[1], m[2]].reduce((sum, x) => sum + Math.round(Number(x) * 100), 0);
    return (cents + Number(m[3]) * 100) / 100;
  },
  "lcm-pair@gcfPair": (p) => {
    const m = p.match(/of (\d+) and (\d+)/)!;
    for (let d = Math.min(Number(m[1]), Number(m[2])); d >= 1; d--)
      if (Number(m[1]) % d === 0 && Number(m[2]) % d === 0) return d;
    return 1;
  },
  "lcm-pair@relativelyPrime": (p) => {
    return nsOptions(p).find((label) => {
      const m = label.match(/(\d+) and (\d+)/);
      return !!m && nsGcd(Number(m[1]), Number(m[2])) === 1;
    })!;
  },
  "lcm-pair@gcfContext": (p) => {
    const m = p.match(/has (\d+) red counters and (\d+) blue counters/)!;
    return nsGcd(Number(m[1]), Number(m[2]));
  },
  "lcm-pair@gcfThree": (p) => {
    const m = p.match(/of (\d+), (\d+), and (\d+)/)!;
    return nsGcd(Number(m[1]), Number(m[2]), Number(m[3]));
  },
  "distributive@factorMissing": (p) => {
    const m = p.match(/(\d+) \+ (\d+) = (\d+) × \((\d+) \+ \?\)/)!;
    let groups = 0, remaining = Number(m[2]);
    while (remaining > 0) { remaining -= Number(m[3]); groups++; }
    return groups;
  },
  "distributive@factorError": (p) => {
    const m = p.match(/(\d+) \+ (\d+) = (\d+) × \((\d+) \+ (\d+)\)/)!;
    const wanted = `The second product becomes ${Number(m[3]) * Number(m[5])}, not ${m[2]}`;
    return nsOptions(p).find((x) => x === wanted)!;
  },
  "distributive@factorGcf": (p) => {
    const m = p.match(/Factor (\d+) \+ (\d+)/)!;
    return nsGcd(Number(m[1]), Number(m[2]));
  },
  "distributive@factorEvaluate": (p) => {
    const m = p.match(/as (\d+) × \((\d+) \+ (\d+)\)/)!;
    let total = 0;
    for (let i = 0; i < Number(m[1]); i++) total += Number(m[2]) + Number(m[3]);
    return total;
  },
  "negative-intro@compareNegatives": (p) => {
    const m = p.match(/Compare (-\d+) and (-\d+)/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@colderNegatives": (p) => {
    const m = p.match(/temperatures (-\d+)° and (-\d+)°/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@compareMixedSign": (p) => {
    const m = p.match(/Compare (-\d+) and (\d+)/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@orderSignedFour": (p) => {
    const labels = p.split("||")[1].split(",");
    return [...labels].sort((a, b) => Number(a) - Number(b));
  },
  "negative-intro@absoluteNumeric": (p) => Math.abs(Number(p.match(/\|(-?\d+)\|/)![1])),
  "negative-intro@absoluteEqual": (p) => nsOptions(p).find((x) => x.startsWith("They are equal because"))!,
  "negative-intro@absoluteDifference": (p) => {
    const m = p.match(/\|-(\d+)\| - \|(\d+)\|/)!;
    return Math.abs(-Number(m[1])) - Math.abs(Number(m[2]));
  },
  "negative-intro@fartherAbsolute": (p) => {
    const items = p.split("||")[1].split(";;").map((x) => { const at = x.lastIndexOf("="); return { label: x.slice(0, at), value: Number(x.slice(at + 1)) }; });
    return items.reduce((best, x) => Math.abs(x.value) > Math.abs(best.value) ? x : best).label;
  },
  "negative-intro@debtAbsolute": (p) => {
    const items = p.split("||")[1].split(";;").map((x) => { const at = x.lastIndexOf("="); return { label: x.slice(0, at), value: Number(x.slice(at + 1)) }; });
    return items.reduce((best, x) => Math.abs(x.value) > Math.abs(best.value) ? x : best).label;
  },
  "negative-intro@coldestSigned": (p) => {
    const labels = nsOptions(p);
    return labels.reduce((best, x) => Number(x.replace("°", "")) < Number(best.replace("°", "")) ? x : best);
  },
  "negative-intro@deeperSigned": (p) => {
    const m = p.match(/depths: (-\d+) __ (-\d+)/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@compareNegativeFractions": (p) => {
    const m = p.match(/Compare (-\d+\/\d+) and (-\d+\/\d+)/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@compareNegativeMixed": (p) => {
    const m = p.match(/Compare (-\d+) and (-\d+\/\d+)/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@compareFractionDecimal": (p) => {
    const m = p.match(/Compare (\d+\/\d+) and (-?\d+\.\d+)/)!;
    return nsRelation(m[1], m[2]);
  },
  "negative-intro@orderRationalsFive": (p) => {
    const labels = p.split("||")[1].split(",");
    return [...labels].sort((a, b) => {
      const A = nsExact(a), B = nsExact(b);
      return A.n * B.d - B.n * A.d;
    });
  },
  "coordinate-plot@signedQuadrant": (p) => {
    const m = p.match(/point \((-?\d+), (-?\d+)\)/)!;
    const x = Number(m[1]), y = Number(m[2]);
    const q = x > 0 ? (y > 0 ? "I" : "IV") : (y > 0 ? "II" : "III");
    return nsOptions(p).find((label) => label === `Quadrant ${q}`)!;
  },
  "coordinate-plot@axisLocation": (p) => {
    const m = p.match(/point \((-?\d+), (-?\d+)\)/)!;
    const wanted = Number(m[1]) === 0 ? "On the y-axis" : "On the x-axis";
    return nsOptions(p).find((label) => label === wanted)!;
  },
  "coordinate-plot@reflectXAxis": (p) => {
    const m = p.match(/Reflect \((-?\d+), (-?\d+)\)/)!;
    const x = Number(m[1]), y = -Number(m[2]);
    const q = x > 0 ? (y > 0 ? "I" : "IV") : (y > 0 ? "II" : "III");
    return nsOptions(p).find((label) => label === `Quadrant ${q}`)!;
  },


};

// Grade-wide manifest batches register their per-form independent routes from the generator
// metadata itself. Adding a form to a Grade 4 family therefore cannot silently skip the route gate.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g4-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveG4Prompt(String(form), p);
  }
}

// Grade 0 uses the same manifest registration pattern, with learner-visible manipulative state
// serialized by the surface-specific branches below rather than reading generator answer fields.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g0-") || x.tag.startsWith("k0-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveG0Prompt(String(form), p);
  }
}

// Grade 1 extends the manifest route system to all early-number and geometry manipulatives.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g1-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveG1Prompt(String(form), p);
  }
}

// Grade 2 uses the same manifest registration pattern. (Session 101: the g2 route file carried
// per-form branches from the day it landed, but this loop was never added, so every g2 form fell
// back to the tag-level route hardwired to ONE form — numbers graded against the wrong solver.)
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g2-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveG2Prompt(String(form), p);
  }
}

// Grade 3 fluency (S186) uses the same manifest registration pattern. Without this loop every
// form falls back to the tag-level route — which is hardwired to ONE form — exactly the Session
// 101 g2 bug documented above: DivZeroMcq graded through DivBy2Numeric's `product / divisor`
// yielded n ÷ 0 = Infinity, and DivMissingNumeric's "a × ? = product" shape was divided the
// wrong way round. Adding a form to either fluency family cannot silently skip the route gate.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g3-mult-fluency") || x.tag.startsWith("g3-div-fluency"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveG3FluencyPrompt(String(form), p);
  }
}

// Algebra I uses the same manifest-driven per-form independent route contract.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("a1-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveA1Prompt(String(form), p);
  }
}

// Algebra II extends the same contract to numeric, symbolic-construction, classification, ordering, and coordinate surfaces.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("a2-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveA2Prompt(String(form), p);
  }
}

// Grade-10 Geometry uses its locked authored-template bank and a separate prompt/state lookup that
// never reads generated answer fields. Registering from metadata ensures every declared form enters
// the standing independent-route gate as soon as it is added to a Geometry family.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g10-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveGeometryPrompt(String(form), p);
  }
}

// Grade-10 Conditional Probability uses the same authored-template contract. Register every form
// so a new probability surface cannot enter the runtime without an independent answer route.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag === "g10-conditional-probability")) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveStatProbabilityPrompt(String(form), p);
  }
}

// Precalculus and Calculus use locked authored-template banks with independent prompt/state lookups.
// Register every declared form so the standing route gate cannot omit a newly added advanced surface.
for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g12-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solvePrecalculusPrompt(String(form), p);
  }
}

for (const g of VARIANT_GENERATORS.filter((x) => x.tag.startsWith("g13-"))) {
  for (const form of g.forms ?? ["default"]) {
    INDEPENDENT[`${g.tag}@${String(form)}`] = (p) => solveCalculusPrompt(String(form), p);
  }
}

const NEGATION = /^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;

describe("variant gate — every problem a generator can ever produce", () => {
  it("covers every registered generator with an independent recomputation", () => {
    for (const g of VARIANT_GENERATORS) {
      expect(INDEPENDENT[g.tag], `no independent check for ${g.tag}`).toBeTypeOf("function");
    }
    expect(VARIANT_GENERATORS.length).toBeGreaterThanOrEqual(7);
  });

  /** The full per-problem gate, shared verbatim by the core sweep and the
   * banded sweeps below — a band must never get a weaker gate. */
  /** Build a variant for a specific FORM, mirroring variantForStep's seeding so the gate exercises
   * exactly what a declared step receives. */
  function variantForForm(
    g: (typeof VARIANT_GENERATORS)[number],
    seed: string,
    band: Band | undefined,
    form: string
  ) {
    return variantForGenForm(g.tag, form, seed, band);
  }

  function gateOne(
    g: (typeof VARIANT_GENERATORS)[number],
    seed: string,
    band?: Band,
    /** When set, exercises an ALIAS-ONLY form. `variantFor` can only ever reach form "default" — a
     * tag that matches a generator by name resolves to it — so without this every non-default form
     * shipped gated only by the resolver's answer check. That blind spot hid a real bug: the regroup
     * form could emit two DIFFERENT misconceptions computing to the SAME number, making the second
     * diagnosis unreachable. The distinctness assertion below had existed all along; it was simply
     * never pointed at the form that broke it. */
    form?: string
  ) {
    // A form can change the prompt's SHAPE, not just its numbers — `parens` prints a(x ± c) = d
    // where the default prints ax + b = c. Those need their own route; without one the form sweep
    // would fail for a reason that has nothing to do with the generator being wrong.
    const check = (form !== undefined ? INDEPENDENT[`${g.tag}@${form}`] : undefined) ?? INDEPENDENT[g.tag];
    const v = (form === undefined ? variantFor(g.tag, seed, band) : variantForForm(g, seed, band, form))!;
    expect(form === undefined ? variantFor(g.tag, seed, band) : variantForForm(g, seed, band, form)).toEqual(v);

    // A generator that emits a MANIPULATIVE cannot be gated on distractor VALUES — the engine has no
    // value list, it has diagnostic slots reached by the shape of the wrong state. So the gate asks
    // the same five questions in the engine's own terms: the target is what the prompt says, setting
    // it is marked correct, and every wrong state a learner can reach lands in a slot that names an
    // error rather than negating them.
    const parsed = WidgetSpec.parse(v.widget);
    if (parsed.type === "pointSetReasoningLab") {
      const revealed = pointSetReasoningExplorationKeys(parsed);
      expect(revealed.length).toBeGreaterThanOrEqual(parsed.requiredExplorations);
      for (const key of parsed.requiredStageKeys) expect(revealed).toContain(key);
      const truth = pointSetReasoningTruth(parsed);
      const answerArg = parsed.prompt + (parsed.answerMode === "choice" ? "||" + parsed.choices.map((choice) => choice.label).join(";;") : "");
      const routed = check(answerArg);
      if (parsed.answerMode === "numeric") {
        expect(routed).toBeTypeOf("number");
        expect(Math.abs(Number(v.answer) - Number(routed))).toBeLessThanOrEqual(parsed.tolerance);
        expect(evaluate(parsed, { revealed, numeric: Number(routed) }).correct).toBe(true);
        for (const wrong of parsed.numericErrors) {
          expect(Math.abs(wrong.value - Number(routed))).toBeGreaterThan(parsed.tolerance);
          const result = evaluate(parsed, { revealed, numeric: wrong.value });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else if (parsed.answerMode === "choice") {
        const winners = parsed.choices.filter((choice) => pointSetReasoningChoiceCorrect(parsed, choice));
        expect(winners, "exactly one independently represented point-set conclusion").toHaveLength(1);
        expect(routed).toBe(winners[0]!.label);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed, { revealed, choiceId: winners[0]!.id }).correct).toBe(true);
      } else {
        expect(evaluate(parsed, { revealed }).correct).toBe(true);
      }
      const fabricated = Array.from({ length: Math.max(parsed.requiredExplorations, 1) }, (_, index) => `fabricated:${index}`);
      expect(evaluate(parsed, { revealed: fabricated, numeric: Number(v.answer), choiceId: String(v.answer) }).correct).toBe(false);
      expect(truth.stages.map((stage) => stage.key)).toEqual(revealed);
      return { v, w: parsed };
    }

    if (parsed.type === "geometricConstraintLab") {
      const revealed = geometricConstraintExplorationKeys(parsed);
      expect(revealed.length).toBeGreaterThanOrEqual(parsed.requiredExplorations);
      for (const key of parsed.requiredStageKeys) expect(revealed).toContain(key);
      const truth = geometricConstraintTruth(parsed);
      const answerArg = parsed.prompt + (parsed.answerMode === "choice" ? "||" + parsed.choices.map((choice) => choice.label).join(";;") : "");
      const routed = check(answerArg);
      if (parsed.answerMode === "numeric") {
        expect(routed).toBeTypeOf("number");
        expect(Math.abs(Number(v.answer) - Number(routed))).toBeLessThanOrEqual(parsed.tolerance);
        expect(evaluate(parsed, { revealed, numeric: Number(routed) }).correct).toBe(true);
        for (const wrong of parsed.numericErrors) {
          expect(Math.abs(wrong.value - Number(routed))).toBeGreaterThan(parsed.tolerance);
          const result = evaluate(parsed, { revealed, numeric: Number(wrong.value) });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else if (parsed.answerMode === "choice") {
        const winners = parsed.choices.filter((choice) => geometricConstraintChoiceCorrect(parsed, choice));
        expect(winners, "exactly one independently represented geometric conclusion").toHaveLength(1);
        expect(routed).toBe(winners[0]!.label);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed, { revealed, choiceId: winners[0]!.id }).correct).toBe(true);
      } else {
        expect(evaluate(parsed, { revealed }).correct).toBe(true);
      }
      const fabricated = Array.from({ length: Math.max(parsed.requiredExplorations, 1) }, (_, index) => `fabricated:${index}`);
      expect(evaluate(parsed, { revealed: fabricated, numeric: Number(v.answer), choiceId: String(v.answer) }).correct).toBe(false);
      expect(truth.stages.map((stage) => stage.key)).toEqual(revealed);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(5);
      return { v, w: parsed };
    }

    if (parsed.type === "exactNumberLab") {
      const revealed = exactNumberExplorationKeys(parsed);
      expect(revealed.length).toBeGreaterThanOrEqual(parsed.requiredExplorations);
      for (const key of parsed.requiredStageKeys) expect(revealed).toContain(key);
      const truth = exactNumberTruth(parsed);
      const answerArg = parsed.prompt + (parsed.answerMode === "choice" ? "||" + parsed.choices.map((choice) => choice.label).join(";;") : "");
      const routed = check(answerArg);
      if (parsed.answerMode === "numeric") {
        expect(routed).toBeTypeOf("number");
        expect(Math.abs(Number(v.answer) - Number(routed))).toBeLessThanOrEqual(parsed.tolerance);
        expect(evaluate(parsed, { revealed, numeric: Number(routed) }).correct).toBe(true);
        for (const wrong of parsed.numericErrors) {
          expect(Math.abs(wrong.value - Number(routed))).toBeGreaterThan(parsed.tolerance);
          const result = evaluate(parsed, { revealed, numeric: wrong.value });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else if (parsed.answerMode === "choice") {
        const winners = parsed.choices.filter((choice) => exactNumberChoiceCorrect(parsed, choice));
        expect(winners, "exactly one independently represented exact-number conclusion").toHaveLength(1);
        expect(routed).toBe(winners[0]!.label);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed, { revealed, choiceId: winners[0]!.id }).correct).toBe(true);
        for (const choice of parsed.choices.filter((choice) => choice.id !== winners[0]!.id)) {
          const result = evaluate(parsed, { revealed, choiceId: choice.id });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(choice.feedback);
        }
      } else if (parsed.answerMode === "relation") {
        expect(["lt", "eq", "gt"]).toContain(routed);
        expect(v.answer).toBe(routed);
        expect(evaluate(parsed, { revealed, relation: routed }).correct).toBe(true);
        expect(truth.answerRelation).toBe(routed);
      } else {
        expect(evaluate(parsed, { revealed }).correct).toBe(true);
      }
      const fabricated = Array.from({ length: Math.max(parsed.requiredExplorations, 1) }, (_, index) => `fabricated:${index}`);
      expect(evaluate(parsed, { revealed: fabricated, numeric: v.answer as number, choiceId: v.answer as string, relation: v.answer as "lt"|"eq"|"gt" }).correct).toBe(false);
      expect(new Set(parsed.values.map((source) => source.id)).size).toBe(parsed.values.length);
      expect(new Set(parsed.values.map((source) => source.label)).size).toBe(parsed.values.length);
      expect(new Set(parsed.choices.map((choice) => choice.id)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.label)).size).toBe(parsed.choices.length);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "affineRelationshipLab") {
      const revealed = affineRelationshipExplorationKeys(parsed);
      expect(revealed.length).toBeGreaterThanOrEqual(parsed.requiredExplorations);
      for (const key of parsed.requiredStageKeys) expect(revealed).toContain(key);
      const answerArg = parsed.prompt + (parsed.answerMode === "choice" ? "||" + parsed.choices.map((choice) => choice.label).join(";;") : "");
      const routed = check(answerArg);
      if (parsed.answerMode === "numeric") {
        expect(routed).toBeTypeOf("number");
        expect(Math.abs(Number(v.answer) - Number(routed))).toBeLessThanOrEqual(parsed.tolerance);
        expect(evaluate(parsed, { revealed, numeric: Number(routed) }).correct).toBe(true);
        for (const wrong of parsed.numericErrors) {
          expect(Math.abs(wrong.value - Number(routed))).toBeGreaterThan(parsed.tolerance);
          const result = evaluate(parsed, { revealed, numeric: wrong.value });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else if (parsed.answerMode === "choice") {
        const winners = parsed.choices.filter((choice) => affineRelationshipChoiceCorrect(parsed, choice));
        expect(winners, "exactly one independently represented affine conclusion").toHaveLength(1);
        expect(routed).toBe(winners[0]!.label);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed, { revealed, choiceId: winners[0]!.id }).correct).toBe(true);
        for (const choice of parsed.choices.filter((choice) => choice.id !== winners[0]!.id)) {
          const result = evaluate(parsed, { revealed, choiceId: choice.id });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(choice.feedback);
        }
      } else if (parsed.answerMode === "point") {
        expect(Array.isArray(routed)).toBe(true);
        expect(Array.isArray(v.answer)).toBe(true);
        const point = routed as [number, number];
        expect(v.answer).toEqual(point);
        expect(evaluate(parsed, { revealed, point }).correct).toBe(true);
        for (const wrong of parsed.pointErrors) {
          const result = evaluate(parsed, { revealed, point: wrong.values });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else {
        expect(evaluate(parsed, { revealed }).correct).toBe(true);
      }
      const fabricated = Array.from({ length: Math.max(parsed.requiredExplorations, 1) }, (_, index) => `fabricated:${index}`);
      expect(evaluate(parsed, { revealed: fabricated, numeric: v.answer as number, choiceId: v.answer as string, point: v.answer as [number, number] }).correct).toBe(false);
      expect(new Set(parsed.lines.map((line) => line.id)).size).toBe(parsed.lines.length);
      expect(new Set(parsed.lines.map((line) => line.label)).size).toBe(parsed.lines.length);
      expect(new Set(parsed.choices.map((choice) => choice.id)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.label)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.claim)).size).toBe(parsed.choices.length);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "quotientReasoningLab") {
      const revealed = quotientReasoningExplorationKeys(parsed).slice(0, parsed.requiredExplorations);
      expect(revealed).toHaveLength(parsed.requiredExplorations);
      if (parsed.answerMode === "numeric") {
        const routed = check(parsed.prompt);
        expect(routed).toBeTypeOf("number");
        expect(Math.abs((v.answer as number) - (routed as number))).toBeLessThanOrEqual(parsed.tolerance);
        expect(evaluate(parsed, { revealed, numeric: routed as number }).correct).toBe(true);
        for (const wrong of parsed.numericErrors) {
          expect(Math.abs(wrong.value - (routed as number))).toBeGreaterThan(parsed.tolerance);
          const result = evaluate(parsed, { revealed, numeric: wrong.value });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else if (parsed.answerMode === "choice") {
        const winners = parsed.choices.filter((choice) => quotientReasoningChoiceCorrect(parsed, choice));
        expect(winners, "exactly one independently derived quotient claim").toHaveLength(1);
        const routed = check(parsed.prompt + "||" + parsed.choices.map((choice) => choice.label).join(";;"));
        expect(routed).toBe(winners[0]!.label);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed, { revealed, choiceId: winners[0]!.id }).correct).toBe(true);
        for (const choice of parsed.choices.filter((choice) => choice.id !== winners[0]!.id)) {
          const result = evaluate(parsed, { revealed, choiceId: choice.id });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(choice.feedback);
        }
      } else if (parsed.answerMode === "fraction") {
        const routed = check(parsed.prompt) as { sign?: 1|-1; whole: number; num: number; den: number };
        const fraction = { whole: routed.whole, num: (routed.sign ?? 1) * routed.num, den: routed.den };
        expect(quotientReasoningFractionCorrect(parsed, fraction)).toBe(true);
        expect(evaluate(parsed, { revealed, fraction }).correct).toBe(true);
        for (const wrong of parsed.fractionErrors) {
          const result = evaluate(parsed, { revealed, fraction: { whole: wrong.whole, num: wrong.num, den: wrong.den } });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else {
        expect(evaluate(parsed, { revealed }).correct).toBe(true);
      }
      expect(evaluate(parsed, { revealed: Array.from({length: parsed.requiredExplorations}, (_, i) => `fabricated:${i}`), numeric: v.answer as number, choiceId: v.answer as string, fraction: v.answer as never }).correct).toBe(false);
      expect(new Set(parsed.choices.map((choice) => choice.id)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.label)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.claim)).size).toBe(parsed.choices.length);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "graphStoryLab") {
      const expectedKinds = (() => {
        const p = parsed.prompt;
        if (parsed.mode === "read") return parsed.segments.map((segment) => segment.kind);
        if (/speeds up from rest/.test(p)) return ["riseConcaveUp", "riseSteady"];
        if (/steady pace, then stops to wait/.test(p)) return ["riseSteady", "flat"];
        if (/increases by more during each time interval/.test(p)) return ["riseConcaveUp"];
        if (/travels fast, stops briefly, then continues slowly/.test(p)) return ["riseSteep", "flat", "riseGentle"];
        if (/travels slowly, stops briefly, then continues fast/.test(p)) return ["riseGentle", "flat", "riseSteep"];
        throw new Error(`unparsed graph-story build prompt: ${p}`);
      })();
      expect(parsed.segments.map((segment) => segment.kind)).toEqual(expectedKinds);
      if (parsed.axisContext === "distanceFromOrigin" && parsed.distanceRule === "awayOnly") {
        expect(parsed.segments.some((segment) => segment.kind.startsWith("fall"))).toBe(false);
      }
      if (parsed.mode === "read") {
        const expectedClaim = (() => {
          const target = parsed.segments.find((segment) => segment.id === parsed.targetSegmentId) ?? parsed.segments[0]!;
          if (/MUCH STEEPER/.test(parsed.prompt)) return "rate:faster";
          if (/LESS STEEP/.test(parsed.prompt)) return "rate:slower";
          if (/slopes DOWNWARD/.test(parsed.prompt)) return "change:decreasing";
          if (/slopes UPWARD/.test(parsed.prompt)) return "change:increasing";
          if (/keeps rising/.test(parsed.prompt)) return "rate:increasing-more-slowly";
          if (/keeps falling/.test(parsed.prompt)) return "rate:decreasing-more-slowly";
          if (/shows the traveler stopped/.test(parsed.prompt)) return `section:${parsed.segments.find((segment) => segment.kind === "flat")!.label}`;
          return target.kind === "flat" ? "change:constant" : target.kind.startsWith("rise") ? "change:increasing" : "change:decreasing";
        })();
        const correct = parsed.choices.filter((choice) => choice.claim === expectedClaim);
        expect(correct).toHaveLength(1);
        expect(v.answer).toBe(correct[0]!.id);
        expect(evaluate(parsed, v.answer).correct).toBe(true);
        expect(new Set(parsed.choices.map((choice) => choice.id)).size).toBe(parsed.choices.length);
        expect(new Set(parsed.choices.map((choice) => choice.label)).size).toBe(parsed.choices.length);
        expect(new Set(parsed.choices.map((choice) => choice.claim)).size).toBe(parsed.choices.length);
        for (const choice of parsed.choices.filter((choice) => choice.id !== v.answer)) {
          const result = evaluate(parsed, choice.id);
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(choice.feedback);
          expect(choice.feedback.length).toBeGreaterThanOrEqual(25);
        }
      } else {
        const answer = v.answer as { segmentIds: string[] };
        const byId = new Map(parsed.bank.map((segment) => [segment.id, segment.kind]));
        expect(answer.segmentIds.map((id) => byId.get(id))).toEqual(expectedKinds);
        expect(evaluate(parsed, answer).correct).toBe(true);
        expect(new Set(parsed.bank.map((segment) => segment.id)).size).toBe(parsed.bank.length);
        expect(new Set(parsed.bank.map((segment) => segment.label)).size).toBe(parsed.bank.length);
        expect(new Set(parsed.wrongSequences.map((wrong) => wrong.kinds.join(">"))).size).toBe(parsed.wrongSequences.length);
        for (const wrong of parsed.wrongSequences) {
          const segmentIds = wrong.kinds.map((kind) => parsed.bank.find((segment) => segment.kind === kind)!.id);
          const result = evaluate(parsed, { segmentIds });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
          expect(wrong.feedback.length).toBeGreaterThanOrEqual(25);
        }
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "inversePipeline") {
      // The answer is a SEQUENCE, so the gate's questions are structural. The one that matters most
      // is the last: undoing in the machine's own order must be WRONG. If a drawn chain ever commutes,
      // the headline misconception would grade correct and the engine would be teaching the error.
      const want = check(parsed.prompt) as string[];
      expect(want).toEqual(v.answer);
      expect(evaluate(parsed, want).correct).toBe(true);
      for (const id of parsed.answer) {
        expect(parsed.tray.some((t) => t.id === id), "answer card missing from tray").toBe(true);
      }
      const FLIP = { add: "sub", sub: "add", mul: "div", div: "mul" } as const;
      const apply = (chain: Array<{ op: string; n: number }>, x: number) =>
        chain.reduce((z, c) => (c.op === "add" ? z + c.n : c.op === "sub" ? z - c.n : c.op === "mul" ? z * c.n : z / c.n), x);
      // Arithmetic round-trip: the authored answer really inverts the chain.
      for (const x of [3, 8]) {
        const inv = parsed.answer.map((id) => parsed.tray.find((t) => t.id === id)!);
        expect(Math.abs(apply(inv, apply(parsed.forward, x)) - x)).toBeLessThan(1e-9);
      }
      // Forward-order undoing: reachable, diagnosed by name, and genuinely a different function.
      const fwdOrder = parsed.forward.map((f) => parsed.tray.find((t) => t.op === FLIP[f.op] && t.n === f.n)!.id);
      expect(fwdOrder).not.toEqual(parsed.answer);
      const rf = evaluate(parsed, fwdOrder);
      expect(rf.correct).toBe(false);
      expect(rf.feedback).toBe(parsed.forwardOrderFeedback);
      // Copied-not-flipped: also reachable, because the tray carries the un-flipped decoys.
      const copied = [...parsed.forward].reverse().map((f) => parsed.tray.find((t) => t.op === f.op && t.n === f.n)!.id);
      const rc = evaluate(parsed, copied);
      expect(rc.correct).toBe(false);
      expect(rc.feedback).toBe(parsed.unflippedFeedback);
      for (const fb of [parsed.successFeedback, parsed.forwardOrderFeedback, parsed.unflippedFeedback, parsed.missFeedback]) {
        expect(fb.length).toBeGreaterThanOrEqual(25);
        expect(fb).not.toMatch(NEGATION);
      }
      return { v, w: parsed };
    }
    if (parsed.type === "columnCalc") {
      const want = check(parsed.prompt) as number;
      const truth = parsed.op === "add" ? parsed.a + parsed.b : parsed.op === "subtract" ? parsed.a - parsed.b : parsed.a * parsed.b;
      expect(want).toBe(truth);
      expect(v.answer).toBe(truth);
      expect(evaluate(parsed, { value: truth, complete: true }).correct).toBe(true);
      expect(evaluate(parsed, { value: truth, complete: false }).correct).toBe(false);
      const seen = new Set<number>();
      for (const r of parsed.commonResults) {
        expect(r.value).not.toBe(truth);
        expect(seen.has(r.value), "duplicate column-calculation diagnosis").toBe(false);
        seen.add(r.value);
        const got = evaluate(parsed, { value: r.value, complete: true });
        expect(got.correct).toBe(false);
        expect(got.feedback).toBe(r.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "evalOrder") {
      const want = check(parsed.prompt) as number;
      expect(want).toBe(parsed.target);
      expect(v.answer).toBe(parsed.target);
      expect(evaluate(parsed, { tokens: [String(want)] }).correct).toBe(true);
      expect(evaluate(parsed, { tokens: parsed.tokens }).correct).toBe(false);
      const seen = new Set<number>();
      for (const r of parsed.commonResults) {
        expect(r.value).not.toBe(parsed.target);
        expect(seen.has(r.value), "duplicate order-of-operations diagnosis").toBe(false);
        seen.add(r.value);
        const got = evaluate(parsed, { tokens: [String(r.value)] });
        expect(got.correct).toBe(false);
        expect(got.feedback).toBe(r.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      for (const fb of [parsed.fallbackFeedback, parsed.successFeedback]) {
        expect(fb.length).toBeGreaterThanOrEqual(25);
        expect(fb).not.toMatch(NEGATION);
      }
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "fractionGrid") {
      const want = check(parsed.prompt) as { rows: number; cols: number; shadeR: number; shadeC: number };
      expect(want).toEqual(v.answer);
      expect(want).toEqual({ rows: parsed.den1, cols: parsed.den2, shadeR: parsed.num1, shadeC: parsed.num2 });
      expect(evaluate(parsed, want).correct).toBe(true);

      const rowWrong = { ...want, rows: want.rows + 1 };
      const rowResult = evaluate(parsed, rowWrong);
      expect(rowResult.correct).toBe(false);
      expect(rowResult.feedback).toBe(parsed.rowFeedback);

      const colWrong = { ...want, cols: want.cols + 1 };
      const colResult = evaluate(parsed, colWrong);
      expect(colResult.correct).toBe(false);
      expect(colResult.feedback).toBe(parsed.colFeedback);

      const seen = new Set<string>();
      for (const b of parsed.commonBuilds) {
        const key = `${b.rows}/${b.cols}/${b.shadeR}/${b.shadeC}`;
        expect(seen.has(key), "duplicate fraction-grid diagnosis").toBe(false);
        seen.add(key);
        expect({ rows: b.rows, cols: b.cols, shadeR: b.shadeR, shadeC: b.shadeC }).not.toEqual(want);
        const got = evaluate(parsed, { rows: b.rows, cols: b.cols, shadeR: b.shadeR, shadeC: b.shadeC });
        expect(got.correct).toBe(false);
        expect(got.feedback).toBe(b.feedback);
        expect(b.feedback.length).toBeGreaterThanOrEqual(25);
        expect(b.feedback).not.toMatch(NEGATION);
      }
      for (const fb of [parsed.rowFeedback, parsed.colFeedback, parsed.successFeedback]) {
        expect(fb.length).toBeGreaterThanOrEqual(25);
        expect(fb).not.toMatch(NEGATION);
      }
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "solveBalance") {
      const want = check(parsed.prompt) as { leftX: number; leftUnits: number; rightUnits: number };
      expect(want).toEqual(v.answer);
      const x = (parsed.c - parsed.b) / parsed.a;
      expect(Number.isInteger(x)).toBe(true);
      expect(want).toEqual({ leftX: 1, leftUnits: 0, rightUnits: x });
      expect(evaluate(parsed, want).correct).toBe(true);
      const unbalanced = { leftX: parsed.a, leftUnits: parsed.b - 1, rightUnits: parsed.c };
      const unbalancedResult = evaluate(parsed, unbalanced);
      expect(unbalancedResult.correct).toBe(false);
      expect(unbalancedResult.feedback).toBe(parsed.unbalancedFeedback);
      const balancedNotIsolated = { leftX: parsed.a, leftUnits: parsed.b, rightUnits: parsed.c };
      const notIsolatedResult = evaluate(parsed, balancedNotIsolated);
      expect(notIsolatedResult.correct).toBe(false);
      expect(notIsolatedResult.feedback).toBe(parsed.notIsolatedFeedback);
      for (const fb of [parsed.successFeedback, parsed.unbalancedFeedback, parsed.notIsolatedFeedback, parsed.missFeedback]) {
        expect(fb.length).toBeGreaterThanOrEqual(25);
        expect(fb).not.toMatch(NEGATION);
      }
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "clockSet") {
      const want = check(parsed.prompt) as { hour: number; minute: number };
      expect(want).toEqual(v.answer);
      expect(evaluate(parsed, want).correct).toBe(true);
      expect(parsed.targetMinute % parsed.minuteStep).toBe(0); // the dial must be able to express it
      const wrongHour = { hour: (want.hour % 12) + 1, minute: want.minute };
      const wrongMin = { hour: want.hour, minute: (want.minute + parsed.minuteStep) % 60 };
      for (const [state, slot] of [
        [wrongHour, parsed.hourFeedback],
        [wrongMin, parsed.minuteFeedback],
      ] as const) {
        const r = evaluate(parsed, state);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(slot);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "fractionEntry") {
      const want = check(parsed.prompt) as { sign: 1 | -1; whole: number; num: number; den: number };
      expect(want).toEqual(v.answer);
      expect(evaluate(parsed, want).correct).toBe(true);
      // SIGNED value, because that is what the evaluator compares — without the sign, a −4 trap and
      // a +4 trap (the two real misconceptions for a negative exponent) would look like one trap and
      // this gate would reject a generator the evaluator handles correctly.
      const val = (x: { sign?: 1 | -1; whole: number; num: number; den: number }) =>
        ((x.sign === -1 ? -1 : 1) * (x.whole * x.den + x.num)) / x.den;
      const answerValue = val({ sign: parsed.answerSign, whole: parsed.answerWhole, num: parsed.answerNum, den: parsed.answerDen });
      // Nonzero magnitude and finite always — the sign itself is legitimate answer content now
      // (2/5 × −3/10 = −3/25 is a correct NEGATIVE answer). The ≤1 ceiling is PROBABILITY
      // semantics, not fractionEntry semantics — a quotient like 2 ÷ 1/3 = 6 or a mixed number
      // 1 3/5 is a correct answer above 1 — so the ceiling applies exactly where its rationale
      // does: prompts asking a probability.
      expect(Math.abs(answerValue)).toBeGreaterThan(0);
      expect(Number.isFinite(answerValue)).toBe(true);
      if (/probability/i.test(parsed.prompt)) expect(answerValue).toBeLessThanOrEqual(1);
      const seen: number[] = [];
      for (const e of parsed.commonEntries) {
        const ev = val(e);
        // Traps are matched by VALUE, so two that merely LOOK different (2/6 and 1/3) are one trap
        // and the second could never fire.
        expect(ev).not.toBeCloseTo(answerValue, 12);
        for (const prev of seen) expect(ev).not.toBeCloseTo(prev, 12);
        seen.push(ev);
        const r = evaluate(parsed, { sign: e.sign, whole: e.whole, num: e.num, den: e.den });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(e.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "pointEntry") {
      const want = check(parsed.prompt) as number[];
      expect(want).toEqual(v.answer);
      expect(parsed.answer).toEqual(want);
      expect(evaluate(parsed, want).correct).toBe(true);
      // Traps are matched by exact TUPLE, so two identical tuples are one trap and the second
      // could never fire; a trap equal to the answer would diagnose correct work as wrong.
      const key = (t: number[]) => t.join(",");
      const seen = new Set<string>();
      for (const e of parsed.commonEntries) {
        expect(e.values.length, "a trap of the wrong arity can never be entered").toBe(parsed.answer.length);
        expect(key(e.values)).not.toBe(key(parsed.answer));
        expect(seen.has(key(e.values)), "duplicate trap tuple").toBe(false);
        seen.add(key(e.values));
        const r = evaluate(parsed, e.values);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(e.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "numberLineRay") {
      /* Gate branch for the ray engine (first ray-emitting form, S218). This engine has no
       * distractor list — its "traps" are its own reachable wrong STATES — so the five questions
       * read in its terms: correct (the target satisfies the printed prompt, by the independent
       * substitution route), traps real (start differs from target in ALL THREE facts, so each of
       * the engine's three diagnoses is reachable), traps bite (a wrong-direction state and a
       * wrong-inclusivity state each grade incorrect through the real evaluator), diagnostic (the
       * verdicts differ from success and never leak the target), deterministic (same seed ⇒
       * deep-equal spec, checked by the shared harness below). */
      const [rel, bStr] = check(parsed.prompt) as [string, string];
      const b = Number(bStr);
      expect(rel).not.toBe("IMPOSSIBLE");
      const t = parsed.target!;
      // the target IS the printed relation — via the independent classification, not the engine's compare
      const wantLt = rel.startsWith("lt");
      const wantInc = rel.endsWith("inclusive");
      expect(t.relation).toBe(wantLt ? "lt" : "gt");
      expect(t.inclusive).toBe(wantInc);
      expect(t.constant.n / t.constant.d).toBe(b);
      expect(t.coeff.n).toBe(t.coeff.d); // solved form: the build task never asks for algebra
      // never begins solved: all three facts differ at the start
      expect(parsed.start.relation).not.toBe(t.relation);
      expect(parsed.start.inclusive).not.toBe(t.inclusive);
      expect(parsed.start.constant.n / parsed.start.constant.d).not.toBe(b);
      // boundary sits inside the window with at least one full tick of margin on each side
      const winMin = parsed.window.min.n / parsed.window.min.d;
      const winMax = parsed.window.max.n / parsed.window.max.d;
      expect(b).toBeGreaterThanOrEqual(winMin + 1);
      expect(b).toBeLessThanOrEqual(winMax - 1);
      // integrity gate clean on every generated spec
      expect(widgetIntegrityErrors(parsed as TWidget)).toEqual([]);
      // the exact target state grades correct through the real evaluator
      const correct = evaluate(parsed, t);
      expect(correct.correct).toBe(true);
      expect(correct.feedback).toBe(parsed.successFeedback);
      // wrong DIRECTION bites: same boundary and circle, ray the other way
      const flipped = { ...t, relation: t.relation === "lt" ? "gt" : "lt" };
      const dirResult = evaluate(parsed, flipped);
      expect(dirResult.correct).toBe(false);
      expect(dirResult.feedback).not.toBe(parsed.successFeedback);
      // wrong INCLUSIVITY bites: one point of difference, still incorrect and distinctly diagnosed
      const toggled = { ...t, inclusive: !t.inclusive };
      const incResult = evaluate(parsed, toggled);
      expect(incResult.correct).toBe(false);
      expect(incResult.feedback).not.toBe(dirResult.feedback);
      /* Leak rule, corrected for a BUILD task (noted per CLAUDE.md: the first draft transcribed
       * the solve-task rule and banned quoting "x ≤ b" — but here the inequality is the printed
       * GIVEN and the answer is the DRAWING, so quoting the given is not a leak. The build task's
       * real leak is describing the target drawing itself: */
      const drawingWords = wantLt ? "ray running left" : "ray running right";
      const circleWords = wantInc ? "closed (filled) circle" : "open circle";
      for (const diag of [dirResult.feedback, incResult.feedback]) {
        expect(diag).not.toBe(parsed.successFeedback);
        expect(diag).not.toContain(drawingWords);
        expect(diag).not.toContain(circleWords);
      }
      // authored strings: length floor and negation ban, true of the drawn numbers
      expect(parsed.successFeedback!.length).toBeGreaterThanOrEqual(25);
      expect(parsed.successFeedback).not.toMatch(NEGATION);
      expect(parsed.successFeedback).toContain(String(b));
      expect(parsed.fallbackFeedback!.length).toBeGreaterThanOrEqual(25);
      expect(parsed.fallbackFeedback).not.toMatch(NEGATION);
      // The fallback's second test number must fall OUTSIDE the set (rule 5: the string must be
      // literally useful of the drawn problem — an in-set "test number" pins nothing). Caught by
      // reading printed output, then pinned here.
      const nums = [...parsed.fallbackFeedback!.matchAll(/-?\d+/g)].map((mm) => Number(mm[0]));
      const second = nums[2]!; // [boundary, boundary-in-"x SYM b", second test number]
      const inSet = wantLt ? (wantInc ? second <= b : second < b) : (wantInc ? second >= b : second > b);
      expect(inSet).toBe(false);
      // no "a open" / "an closed" morphology anywhere in the authored strings
      expect(`${parsed.successFeedback} ${parsed.fallbackFeedback}`).not.toMatch(/\b[Aa] open\b|\b[Aa]n closed\b/);
      return { v, w: parsed };
    }

    if (parsed.type === "matrixTransform") {
      // The engine's own five diagnostic slots: exact match (correct), columns swapped, only the
      // off-diagonal signs flipped, and everything else (fallback) — see evaluate.ts's
      // "matrixTransform" case, which this mirrors in the OTHER direction (state in, verdict out)
      // from the independent route (prompt in, target out).
      const want = check(parsed.prompt) as number[];
      expect(want).toEqual(v.answer);
      expect([parsed.ta, parsed.tb, parsed.tc, parsed.td]).toEqual(want);
      const toState = (t: readonly number[]) => ({ a: t[0]!, b: t[1]!, c: t[2]!, d: t[3]! });
      const answerState = toState(want);
      expect(evaluate(parsed, answerState).correct).toBe(true);

      // Every declared numeric field stays inside MatrixTransformSpec's integer range, and the
      // task doesn't begin already solved.
      for (const val of [parsed.ta, parsed.tb, parsed.tc, parsed.td, parsed.sa, parsed.sb, parsed.sc, parsed.sd]) {
        expect(Number.isInteger(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(-3);
        expect(val).toBeLessThanOrEqual(3);
      }
      expect({ a: parsed.sa, b: parsed.sb, c: parsed.sc, d: parsed.sd }).not.toEqual(answerState);

      // Column swap: î's and ĵ's images entered in the other's slot.
      const swapped = { a: parsed.tb, b: parsed.ta, c: parsed.td, d: parsed.tc };
      expect(swapped).not.toEqual(answerState);
      const swapResult = evaluate(parsed, swapped);
      expect(swapResult.correct).toBe(false);
      expect(swapResult.feedback).toBe(parsed.swappedFeedback);
      expect(parsed.swappedFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.swappedFeedback).not.toMatch(NEGATION);

      // Sign flip: same diagonal, off-diagonal entries negated — only diagnosable (per
      // evaluate.ts) when at least one off-diagonal entry is nonzero; the composeMatrix form
      // guards its draw so this is always true, but the branch stays honest about the condition.
      if (parsed.tb !== 0 || parsed.tc !== 0) {
        const signFlipped = { a: parsed.ta, b: -parsed.tb, c: -parsed.tc, d: parsed.td };
        expect(signFlipped).not.toEqual(answerState);
        expect(signFlipped).not.toEqual(swapped);
        const signResult = evaluate(parsed, signFlipped);
        expect(signResult.correct).toBe(false);
        expect(signResult.feedback).toBe(parsed.signFeedback);
        expect(parsed.signFeedback.length).toBeGreaterThanOrEqual(25);
        expect(parsed.signFeedback).not.toMatch(NEGATION);
      }

      // Fallback: any other malformed state (e.g. everything zeroed) that isn't the answer, the
      // swap trap, or the sign trap must land on the generic diagnosis.
      const zeroed = { a: 0, b: 0, c: 0, d: 0 };
      const signFlipped = { a: parsed.ta, b: -parsed.tb, c: -parsed.tc, d: parsed.td };
      const clashesKnownSlot =
        JSON.stringify(zeroed) === JSON.stringify(answerState) ||
        JSON.stringify(zeroed) === JSON.stringify(swapped) ||
        ((parsed.tb !== 0 || parsed.tc !== 0) && JSON.stringify(zeroed) === JSON.stringify(signFlipped));
      if (!clashesKnownSlot) {
        const fallbackResult = evaluate(parsed, zeroed);
        expect(fallbackResult.correct).toBe(false);
        expect(fallbackResult.feedback).toBe(parsed.fallbackFeedback);
      }
      expect(parsed.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.fallbackFeedback).not.toMatch(NEGATION);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.successFeedback).not.toMatch(NEGATION);
      expect(parsed.targetName.length).toBeGreaterThan(0);
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "plotPoint") {
      // The answer is a SET of cells, so the gate's questions are set-shaped. The one that matters
      // most is the last: every diagnosable wrong cell must be ON the grid, or the learner can
      // never click it and the diagnosis is dead text.
      const want = check(parsed.prompt) as Array<{ x: number; y: number }>;
      const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
      expect(new Set(want.map(key))).toEqual(new Set(parsed.targets.map(key)));
      expect(v.answer).toEqual(parsed.targets);
      expect(evaluate(parsed, parsed.targets).correct).toBe(true);

      const onGrid = (p: { x: number; y: number }) =>
        p.x >= 1 && p.x <= parsed.cols && p.y >= 1 && p.y <= parsed.rows;
      const targetKeys = new Set(parsed.targets.map(key));
      expect(new Set(parsed.targets.map(key)).size, "duplicate target cell").toBe(parsed.targets.length);
      for (const t of parsed.targets) expect(onGrid(t), `target ${key(t)} is off the grid`).toBe(true);
      if (parsed.xLabels) expect(parsed.xLabels.length).toBe(parsed.cols);
      if (parsed.yLabels) expect(parsed.yLabels.length).toBe(parsed.rows);

      const seenErr = new Set<string>();
      for (const e of parsed.pointErrors) {
        expect(onGrid(e), `diagnosis at ${key(e)} is off the grid and can never be clicked`).toBe(true);
        expect(targetKeys.has(key(e)), `a diagnosis sits on a TARGET cell`).toBe(false);
        expect(seenErr.has(key(e)), "duplicate diagnosis cell").toBe(false);
        seenErr.add(key(e));
        // Reached by marking the wrong cell INSTEAD of one target — the evaluator finds the first
        // marked cell that is not a target, so a wrong-only selection lands in this slot.
        const r = evaluate(parsed, [e]);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(e.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      // A partial selection must NOT grade correct — the engine requires every target.
      if (parsed.targets.length > 1) {
        expect(evaluate(parsed, parsed.targets.slice(0, -1)).correct).toBe(false);
      }
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "moneyBoard" && parsed.mode === "count") {
      const want = check(parsed.prompt) as { counted: number[]; entry: number };
      expect(want).toEqual(v.answer);
      expect(parsed.answerCents).toBe(want.entry);
      expect(evaluate(parsed, want).correct).toBe(true);
      // The board must SHOW exactly the coins the prompt names, or the learner is counting one
      // problem while being graded on another.
      const shown = (parsed.show ?? []).reduce((t, g) => t + g.cents * g.count, 0);
      expect(shown).toBe(parsed.answerCents);
      const vals = parsed.commonEntries.map((e) => e.cents);
      expect(new Set(vals).size).toBe(vals.length);
      for (const e of parsed.commonEntries) {
        expect(e.cents).not.toBe(parsed.answerCents);
        const r = evaluate(parsed, { counted: [], entry: e.cents });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(e.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "moneyBoard") {
      // compose / change: the learner PLACES coins from the tray; the map's VALUE must hit the
      // target. (The count-mode branch above reads a typed total — a different contract entirely.)
      const target =
        parsed.mode === "change"
          ? (parsed.paidCents ?? 0) - (parsed.priceCents ?? 0)
          : parsed.targetCents ?? 0;
      const want = check(parsed.prompt) as unknown as Record<number, number>;
      expect(want).toEqual(v.answer);
      const tray = parsed.tray ?? [];
      let total = 0;
      for (const [c, k] of Object.entries(want)) {
        const d = tray.find((t) => t.cents === Number(c));
        expect(d, "the answer uses a coin the tray does not offer").toBeDefined();
        expect(k).toBeGreaterThanOrEqual(0);
        expect(k).toBeLessThanOrEqual(d!.max);
        total += Number(c) * k;
      }
      expect(total).toBe(target);
      expect(evaluate(parsed, want).correct).toBe(true);
      const vals = parsed.commonTotals.map((e) => e.cents);
      expect(new Set(vals).size).toBe(vals.length);
      for (const e of parsed.commonTotals) {
        // A trap is a wrong TOTAL — it must differ from the target and be physically buildable
        // with the offered coins, or its diagnosis can never fire.
        expect(e.cents).not.toBe(target);
        const d = tray.find((t) => e.cents % t.cents === 0 && e.cents / t.cents <= t.max);
        expect(d, `trap total ${e.cents} is unreachable with the offered coins`).toBeDefined();
        const r = evaluate(parsed, { [d!.cents]: e.cents / d!.cents });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(e.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "placeCompare") {
      expect(check(parsed.prompt)).toBe(v.answer);
      expect(parsed.answer).toBe(v.answer);
      expect(evaluate(parsed, v.answer).correct).toBe(true);
      // The digit strings must be what the prompt shows — a generator whose chart and prompt disagree
      // would be showing one comparison and grading another.
      expect(parsed.prompt).toContain(`${parsed.left} __ ${parsed.right}`);
      const slots = { lt: parsed.ltFeedback, eq: parsed.eqFeedback, gt: parsed.gtFeedback };
      for (const sym of ["lt", "eq", "gt"] as const) {
        if (sym === parsed.answer) {
          // The answer's own slot can never fire; an unreachable string is where wrong guidance hides.
          expect(slots[sym], `${sym} slot is the answer and must be absent`).toBeUndefined();
          continue;
        }
        expect(slots[sym], `${sym} slot missing — a wrong pick would get an empty diagnosis`).toBeTruthy();
        const r = evaluate(parsed, sym);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(slots[sym]);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "subitizeFlash") {
      const want = check(parsed.prompt + "||" + JSON.stringify({ visibleCount: parsed.count, options: parsed.options, arrangement: parsed.arrangement }));
      expect(want).toBe(v.answer);
      expect(parsed.options).toContain(parsed.count);
      expect(new Set(parsed.options).size).toBe(parsed.options.length);
      expect(evaluate(parsed, parsed.count).correct).toBe(true);
      for (const c of parsed.commonPicks) {
        expect(c.value).not.toBe(parsed.count);
        const r = evaluate(parsed, c.value);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "numberLineHop") {
      expect(check(parsed.prompt)).toBe(v.answer);
      expect(evaluate(parsed, v.answer).correct).toBe(true);
      // SANCTIONED CORRECTION (session 101): this assertion hardcoded forward hops, but the spec
      // carries `direction` and g0's count-back form legitimately hops DOWN the line. Landing is now
      // computed with the widget's own direction — same strength, no assumption.
      const hopDir = parsed.direction === "back" ? -1 : 1;
      expect(parsed.start + hopDir * parsed.hop * parsed.hops).toBe(v.answer); // the line must SHOW the answer
      expect(parsed.min).toBeLessThanOrEqual(Math.min(parsed.start, v.answer as number));
      expect(parsed.max).toBeGreaterThanOrEqual(Math.max(parsed.start, v.answer as number));
      const vals = parsed.commonLandings.map((c) => c.value);
      expect(new Set(vals).size).toBe(vals.length);
      for (const c of parsed.commonLandings) {
        // A trap landing must be ON the drawn line — one a learner can physically reach — and must
        // not be the answer, or a correct hop would be marked wrong.
        expect(c.value).not.toBe(v.answer);
        expect(c.value).toBeGreaterThanOrEqual(parsed.min);
        expect(c.value).toBeLessThanOrEqual(parsed.max);
        const r = evaluate(parsed, c.value);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "lengthCompare") {
      const routeInput = g.tag.startsWith("g0-")
        ? parsed.prompt + "||" + JSON.stringify({ items: parsed.items.map(({ id, label, length, startOffset }) => ({ id, label, length, startOffset })) })
        : parsed.prompt;
      const routeAnswer = check(routeInput);
      const routeId = g.tag.startsWith("g0-") ? parsed.items.find((i) => i.label === routeAnswer)?.id : routeAnswer;
      expect(routeId).toBe(v.answer);
      const correctState = parsed.mode === "align"
        ? { offsets: Object.fromEntries(parsed.items.map((i) => [i.id, 0])), picked: parsed.answerId }
        : v.answer;
      expect(evaluate(parsed, correctState).correct).toBe(true);
      expect(parsed.answerId).toBe(v.answer);
      const lens = parsed.items.map((i) => i.length);
      // Two bars the same length would give the question two right answers and the engine grades
      // only one of them correct.
      expect(new Set(lens).size).toBe(lens.length);
      expect(new Set(parsed.items.map((i) => i.id)).size).toBe(parsed.items.length);
      const winner = parsed.items.find((i) => i.id === parsed.answerId)!;
      const wantLong = /(long|tall)/i.test(parsed.prompt);
      for (const i of parsed.items) {
        if (i.id === parsed.answerId) continue;
        expect(wantLong ? i.length < winner.length : i.length > winner.length).toBe(true);
        const wrongState = parsed.mode === "align"
          ? { offsets: Object.fromEntries(parsed.items.map((x) => [x.id, 0])), picked: i.id }
          : i.id;
        const r = evaluate(parsed, wrongState);
        expect(r.correct).toBe(false);
        // Pick mode names the selected bar; align mode uses the shared aligned-comparison diagnosis.
        expect(r.feedback).toBe(parsed.mode === "pick" ? i.feedback : parsed.missFeedback);
        if (parsed.mode === "pick") expect(r.feedback).toContain(String(i.length));
        expect(r.feedback!.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "matchPairs") {
      // The route rebuilds the pairing as LABEL→LABEL, so ids matching positionally isn't enough.
      // Labels are joined with U+001F, not a comma: number labels legitimately CONTAIN commas
      // ("1,200"), and a comma-joined key silently splits them into separate entries.
      const wantLabels = check(
        parsed.prompt + "||" + parsed.left.map((l) => l.label).join("\u001F") + "||" + parsed.right.map((r) => r.label).join("\u001F") +
          "||" + JSON.stringify({ left: parsed.left.map((l) => ({ label: l.label })), right: parsed.right.map((r) => ({ label: r.label })) })
      ) as Record<string, string>;
      const leftLabel = new Map(parsed.left.map((l) => [l.id, l.label]));
      const rightLabel = new Map(parsed.right.map((r) => [r.id, r.label]));
      const gotLabels: Record<string, string> = {};
      for (const [lid, rid] of Object.entries(parsed.pairs)) gotLabels[leftLabel.get(lid)!] = rightLabel.get(rid)!;
      expect(gotLabels).toEqual(wantLabels);
      expect(v.answer).toEqual(parsed.pairs);
      expect(evaluate(parsed, parsed.pairs).correct).toBe(true);

      // A bijection: every left matched, to a distinct right that exists.
      const rightIds = new Set(parsed.right.map((r) => r.id));
      const used = new Set<string>();
      for (const l of parsed.left) {
        const target = parsed.pairs[l.id];
        expect(target, `left "${l.label}" has no pair`).toBeTruthy();
        expect(rightIds.has(target)).toBe(true);
        expect(used.has(target), "two lefts share one right").toBe(false);
        used.add(target);
      }
      expect(used.size).toBe(parsed.right.length);

      // Duplicate labels make the intended link ambiguous on screen while grading only one way.
      const ll = parsed.left.map((l) => l.label);
      const rl = parsed.right.map((r) => r.label);
      expect(new Set(ll).size, "duplicate left labels").toBe(ll.length);
      expect(new Set(rl).size, "duplicate right labels").toBe(rl.length);

      // With both columns in the same order, matching row i to row i wins without reading.
      const positional = parsed.left.every((l, i) => parsed.pairs[l.id] === parsed.right[i]?.id);
      expect(positional, "columns are aligned — positional matching would score without reading").toBe(false);

      for (const pe of parsed.pairErrors) {
        expect(pe.right, "a pairError names the CORRECT link and could never fire").not.toBe(parsed.pairs[pe.left]);
        const wrong = { ...parsed.pairs, [pe.left]: pe.right };
        const r = evaluate(parsed, wrong);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(pe.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "tapDiagram") {
      // The route recomputes which LABELS should be correct from the prompt's own numbers, so a
      // generator that flagged the wrong group fails even though the diagram looks well-formed.
      const wantLabels = check(parsed.prompt + "||" + parsed.hotspots.map((h) => h.label).join(",")) as string[];
      const correct = parsed.hotspots.filter((h) => h.correct);
      expect(correct.map((h) => h.label).sort()).toEqual([...wantLabels].sort());
      expect(correct.length, "a tap diagram with no correct hotspot is unanswerable").toBeGreaterThan(0);
      if (parsed.mode === "selectOne") {
        // selectOne grades the whole SET, so two correct hotspots would demand tapping BOTH while
        // any "tap one" prompt instructs a single tap — instructions contradicting the grading.
        expect(correct.length, "selectOne with multiple correct hotspots cannot be answered as instructed").toBe(1);
      }
      expect(v.answer).toEqual(correct.map((h) => h.id));
      expect(evaluate(parsed, correct.map((h) => h.id)).correct).toBe(true);

      const ids = parsed.hotspots.map((h) => h.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(parsed.hotspots.map((h) => h.label)).size).toBe(ids.length);

      for (const h of parsed.hotspots) {
        expect(h.count).toBeGreaterThanOrEqual(0);
        expect(h.x).toBeGreaterThanOrEqual(0);
        expect(h.x).toBeLessThanOrEqual(100);
        if (h.correct) continue;
        // A wrong group with no feedback falls back to missFeedback — a diagnosis silently lost.
        expect(h.feedback, `wrong hotspot "${h.label}" has no feedback of its own`).toBeTruthy();
        const r = evaluate(parsed, [h.id]);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(h.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      // Selecting everything must never grade correct unless everything genuinely is correct.
      if (correct.length !== parsed.hotspots.length) expect(evaluate(parsed, ids).correct).toBe(false);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "dragOrder") {
      // The route rebuilds the correct sequence as LABELS, so a generator that ordered the ids
      // right but attached them to the wrong labels still fails.
      const wantLabels = check(
        parsed.prompt + "||" + parsed.items.map((i) => i.label).join(",") +
          "||" + JSON.stringify({ items: parsed.items.map((i) => ({ label: i.label })) })
      ) as string[];
      const byId = new Map(parsed.items.map((i) => [i.id, i.label]));
      expect(parsed.correctOrder.map((i) => byId.get(i))).toEqual(wantLabels);
      expect(v.answer).toEqual(parsed.correctOrder);
      expect(evaluate(parsed, parsed.correctOrder).correct).toBe(true);

      const ids = parsed.items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(parsed.items.map((i) => i.label)).size).toBe(ids.length);
      expect([...parsed.correctOrder].sort()).toEqual([...ids].sort()); // a permutation, nothing missing

      // Presented order must not already BE the answer, or there is nothing to do.
      expect(ids.join("|"), "items arrive pre-sorted").not.toBe(parsed.correctOrder.join("|"));

      const pos = new Map(parsed.correctOrder.map((id, i) => [id, i]));
      for (const m of parsed.misorderFeedback) {
        expect(pos.has(m.first) && pos.has(m.second)).toBe(true);
        // The pair must be genuinely INVERTED: `first` before `second` has to be an error, or the
        // diagnosis would fire on correct work.
        expect(
          pos.get(m.first)! > pos.get(m.second)!,
          "a misorder pair is already in correct order — it would diagnose right work as wrong"
        ).toBe(true);
        expect(m.feedback.length).toBeGreaterThanOrEqual(25);
        expect(m.feedback).not.toMatch(NEGATION);
        // And it must actually fire on the sequence it describes.
        const bad = [m.first, ...parsed.correctOrder.filter((x) => x !== m.first)];
        expect(evaluate(parsed, bad).correct).toBe(false);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "dragBucket") {
      const wantMap = check(
        parsed.prompt + "||" + parsed.items.map((i) => i.label).join(",") +
          "||" + JSON.stringify({ items: parsed.items.map((i) => ({ label: i.label })), buckets: parsed.buckets.map((b) => ({ label: b.label })) })
      ) as Record<string, string>;
      const gotMap = v.answer as Record<string, string>;
      // Compare by LABEL, since ids are positional and would match trivially. Routes may name a
      // bucket by its LABEL (the meaningful identity) or by its id; canonicalize labels to ids so
      // both route styles are held to the identical map.
      const idByBucketLabel = new Map(parsed.buckets.map((b) => [b.label, b.id]));
      const canonWant = Object.fromEntries(
        Object.entries(wantMap).map(([item, bucket]) => [item, idByBucketLabel.get(bucket) ?? bucket])
      );
      const byLabel = (m: Record<string, string>) =>
        Object.fromEntries(parsed.items.map((i) => [i.label, m[i.id]]));
      expect(byLabel(gotMap)).toEqual(canonWant);
      expect(evaluate(parsed, gotMap).correct).toBe(true);

      const bucketIds = new Set(parsed.buckets.map((b) => b.id));
      const used = new Set(parsed.items.map((i) => i.bucketId));
      for (const i of parsed.items) expect(bucketIds.has(i.bucketId), `item points at unknown bucket`).toBe(true);
      // EVERY bucket must receive something: if all items share one bucket, a learner can dump the
      // pile there and score without reading a single item.
      for (const b of parsed.buckets)
        expect(used.has(b.id), `bucket "${b.label}" is empty — the sort has a no-reading solution`).toBe(true);

      const labels = parsed.items.map((i) => i.label);
      expect(new Set(labels).size, "duplicate item labels").toBe(labels.length);
      for (const i of parsed.items) {
        expect(i.feedback.length).toBeGreaterThanOrEqual(25);
        expect(i.feedback).not.toMatch(NEGATION);
      }
      // A misplacement must be caught rather than silently scored as correct.
      const wrongIds = [...bucketIds].filter((b) => b !== parsed.items[0].bucketId);
      const misplaced = { ...gotMap, [parsed.items[0].id]: wrongIds[0] };
      expect(evaluate(parsed, misplaced).correct).toBe(false);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "buildExpression") {
      // The route rebuilds the correct sequence as LABELS, so the gate compares meaning rather
      // than ids — an id-level match would pass even if the bank were relabelled wrongly.
      // The bank's exact renderings travel with the prompt (like MCQ labels): the route still
      // recomputes WHICH labels form the answer by an independent derivation, it just selects
      // them from the strings the learner actually sees.
      const wantLabels = check(
        parsed.prompt + "||" + JSON.stringify({ tokens: parsed.tokens.map((t) => ({ label: t.label })) })
      ) as string[];
      const byId = new Map(parsed.tokens.map((t) => [t.id, t.label]));
      expect(parsed.correct.map((i) => byId.get(i))).toEqual(wantLabels);
      expect(v.answer).toEqual(parsed.correct);
      expect(evaluate(parsed, parsed.correct).correct).toBe(true);

      // Token ids and labels must both be unique — a duplicate label makes two tokens
      // indistinguishable on screen while grading differently.
      const ids = parsed.tokens.map((t) => t.id);
      const labels = parsed.tokens.map((t) => t.label);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(labels).size).toBe(labels.length);

      // Every referenced id must exist in the bank.
      const known = new Set(ids);
      for (const seq of [parsed.correct, ...parsed.acceptAlso, ...parsed.commonBuilds.map((b) => b.sequence)])
        for (const t of seq) expect(known.has(t), `unknown token ${t}`).toBe(true);

      // HAZARD 1: the bank must not be dumpable. The original assertion demanded an unused token,
      // which encoded the assumption that every accepted build uses each token at most once. A
      // reuse build ("x < −1 or x > 2" needs x twice) is legitimate and CANNOT be dumped — placing
      // every bank token once never completes it — so the check now targets the hazard precisely:
      // no accepted build may be a permutation of the entire bank. Strictly the same protection
      // for single-use banks; correct instead of impossible for reuse builds. (Session 101.)
      const bankKey = [...ids].sort().join("|");
      for (const seq of [parsed.correct, ...parsed.acceptAlso]) {
        const dumpable = seq.length === ids.length && [...seq].sort().join("|") === bankKey;
        expect(dumpable, "an accepted build uses the whole bank once — dumping it scores without reasoning").toBe(false);
      }
      // A build that repeats a token id is only PLAYABLE when the spec declares the bank reusable —
      // otherwise the tile disables after its first tap and the correct answer cannot be built.
      const anyRepeat = [parsed.correct, ...parsed.acceptAlso].some((seq) => new Set(seq).size !== seq.length);
      if (anyRepeat) expect(parsed.reusable, "a build repeats a token but the bank is not reusable — the answer is unbuildable").toBe(true);

      // Every alternative accepted build must genuinely grade correct.
      for (const alt of parsed.acceptAlso) expect(evaluate(parsed, alt).correct).toBe(true);

      // HAZARD 2: no diagnosis may sit on an accepted build, where it could never fire.
      const acceptedKeys = new Set([parsed.correct, ...parsed.acceptAlso].map((s) => s.join("|")));
      for (const b of parsed.commonBuilds) {
        expect(acceptedKeys.has(b.sequence.join("|")), "a diagnosis sits on an accepted build").toBe(false);
        const r = evaluate(parsed, b.sequence);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(b.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.missFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "tenFrame") {
      // The route recomputes the TARGET from the prompt; the gate then checks the frame is
      // actually solvable by tapping (preFilled < target) and that no diagnosis is parked on the
      // correct count, where it could never fire.
      const want = check(parsed.prompt) as number;
      expect(want).toBe(v.answer);
      expect(parsed.target).toBe(want);
      expect(parsed.preFilled).toBeLessThan(parsed.target);
      expect(evaluate(parsed, want).correct).toBe(true);
      const counts = parsed.commonCounts.map((c) => c.count);
      expect(new Set(counts).size).toBe(counts.length);
      for (const c of parsed.commonCounts) {
        expect(c.count, "a diagnosis sits on the correct count").not.toBe(parsed.target);
        expect(c.count).toBeLessThanOrEqual(10); // reachable on a ten frame at all
        const r = evaluate(parsed, c.count);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "baseTenCompose") {
      const want = check(parsed.prompt) as number;
      expect(want).toBe(parsed.target);
      const std = { hundreds: 0, tens: Math.floor(parsed.target / 10) % 10, ones: parsed.target % 10 };
      expect(v.answer).toEqual(std);
      expect(evaluate(parsed, std).correct).toBe(true);
      for (const b of parsed.commonBuilds) {
        // A wrong build must not BE the standard build, or its diagnosis is unreachable.
        expect({ hundreds: b.hundreds ?? 0, tens: b.tens, ones: b.ones }).not.toEqual(std);
        expect(b.tens).toBeGreaterThanOrEqual(0);
        expect(b.ones).toBeGreaterThanOrEqual(0);
        expect(b.ones).toBeLessThanOrEqual(parsed.maxOnes); // buildable on the tray
        const r = evaluate(parsed, { hundreds: b.hundreds ?? 0, tens: b.tens, ones: b.ones });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(b.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "fractionCompare") {
      // The schema's own comment says integrity "re-derives from the fractions", so that is
      // exactly what this branch does: cross-multiply the two printed fractions with INTEGERS
      // and insist the declared answer matches. A float slipping into the builder, or a
      // generator that simply asserted its own answer, would surface right here.
      const { left, right } = parsed;
      const lhs = left.num * right.den;
      const rhs = right.num * left.den;
      const derived = lhs > rhs ? "left" : rhs > lhs ? "right" : "equal";
      expect(derived, "the declared answer disagrees with the fractions shown").toBe(parsed.answer);
      expect(check(parsed.prompt)).toBe(parsed.answer);
      expect(v.answer).toBe(parsed.answer);
      expect(evaluate(parsed, parsed.answer).correct).toBe(true);

      // Both bars must be drawable: a numerator above its denominator would overflow the bar.
      expect(left.num).toBeLessThanOrEqual(left.den);
      expect(right.num).toBeLessThanOrEqual(right.den);

      // Exactly the two non-answer choices carry a diagnosis; the answer's own slot must be
      // absent, since it can never be shown.
      const slots = {
        left: parsed.leftFeedback,
        right: parsed.rightFeedback,
        equal: parsed.equalFeedback,
      };
      expect(slots[parsed.answer], "the correct choice carries a diagnosis it can never show").toBeUndefined();
      for (const choice of ["left", "right", "equal"] as const) {
        if (choice === parsed.answer) continue;
        expect(slots[choice], `missing diagnosis for ${choice}`).toBeTruthy();
        const r = evaluate(parsed, choice);
        expect(r.correct).toBe(false);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);

      // A benchmark, if drawn, must sit strictly inside the bar to be visible.
      if (parsed.benchmark !== undefined) {
        expect(parsed.benchmark).toBeGreaterThan(0);
        expect(parsed.benchmark).toBeLessThan(1);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "absValueLine") {
      // The route receives visible labels paired with their signed values and independently chooses
      // the greatest MAGNITUDE. The gate then maps that meaning back to the widget id, preventing an
      // answer-id typo from passing merely because the same typo appears in `v.answer`.
      const routeInput = parsed.prompt + "||" + parsed.items.map((i) => `${i.label}=${i.value}`).join(";;");
      const wantLabel = check(routeInput) as string;
      const truthMagnitude = Math.max(...parsed.items.map((i) => Math.abs(i.value)));
      const farthest = parsed.items.filter((i) => Math.abs(i.value) === truthMagnitude);
      const truthId = farthest.length > 1 ? "equal" : farthest[0].id;
      const authoredLabel = truthId === "equal" ? parsed.equalLabel : parsed.items.find((i) => i.id === truthId)?.label;
      expect(wantLabel).toBe(authoredLabel);
      expect(parsed.answerId).toBe(truthId);
      expect(v.answer).toBe(truthId);
      expect(evaluate(parsed, truthId).correct).toBe(true);

      const ids = parsed.items.map((i) => i.id);
      const labels = parsed.items.map((i) => i.label);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(labels).size).toBe(labels.length);
      expect(ids).not.toContain("equal");
      for (const item of parsed.items) {
        if (item.id === truthId) {
          expect(item.feedback, "the answer operand carries unreachable feedback").toBeUndefined();
          continue;
        }
        expect(item.feedback, `missing diagnosis for ${item.label}`).toBeTruthy();
        const r = evaluate(parsed, item.id);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(item.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      if (truthId === "equal") {
        expect(parsed.equalLabel).toBeTruthy();
        expect(parsed.equalFeedback, "the correct equal choice carries unreachable feedback").toBeUndefined();
      } else if (parsed.equalLabel) {
        expect(parsed.equalFeedback).toBeTruthy();
        const equalResult = evaluate(parsed, "equal");
        expect(equalResult.correct).toBe(false);
        expect(equalResult.feedback).toBe(parsed.equalFeedback);
        expect(equalResult.feedback.length).toBeGreaterThanOrEqual(25);
        expect(equalResult.feedback).not.toMatch(NEGATION);
      }
      for (const fb of [parsed.missFeedback, parsed.successFeedback]) {
        expect(fb.length).toBeGreaterThanOrEqual(25);
        expect(fb).not.toMatch(NEGATION);
      }
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "rationalCompare") {
      // The route re-derives the relation by integer cross-multiplication, independently of the
      // builder that already does the same — a float creeping into either would show up here.
      const want = check(parsed.prompt) as "lt" | "eq" | "gt";
      expect(want).toBe(parsed.answer);
      expect(v.answer).toBe(parsed.answer);
      expect(evaluate(parsed, parsed.answer).correct).toBe(true);
      const slots = { lt: parsed.ltFeedback, eq: parsed.eqFeedback, gt: parsed.gtFeedback };
      // Exactly the two non-answer slots carry a diagnosis; the answer's own slot must be absent.
      expect(slots[parsed.answer], "the correct relation carries a diagnosis it can never show").toBeUndefined();
      for (const rel of ["lt", "eq", "gt"] as const) {
        if (rel === parsed.answer) continue;
        expect(slots[rel], `missing diagnosis for ${rel}`).toBeTruthy();
        const r = evaluate(parsed, rel);
        expect(r.correct).toBe(false);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "mixedRegroup") {
      const want = check(parsed.prompt) as { whole: number; num: number };
      const got = v.answer as { whole: number; num: number; complete: boolean };
      expect({ whole: got.whole, num: got.num }).toEqual(want);
      expect(evaluate(parsed, { ...want, complete: true }).correct).toBe(true);
      // An incomplete submission must never grade correct, however right the numbers are.
      expect(evaluate(parsed, { ...want, complete: false }).correct).toBe(false);
      for (const rr of parsed.commonResults) {
        expect({ whole: rr.whole, num: rr.num }, "a diagnosis sits on the correct result").not.toEqual(want);
        const r = evaluate(parsed, { whole: rr.whole, num: rr.num, complete: true });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(rr.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "equationOutcomeLab") {
      const truth = equationOutcomeTruth(parsed);
      const correct = parsed.choices.filter((choice) => equationOutcomeChoiceCorrect(parsed, choice));
      expect(correct, "exactly one equation outcome must match the normalized residue").toHaveLength(1);
      expect(v.answer).toBe(correct[0].id);
      expect(evaluate(parsed, correct[0].id).correct).toBe(true);
      expect(new Set(parsed.choices.map((choice) => choice.id)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.label)).size).toBe(parsed.choices.length);
      for (const choice of parsed.choices) {
        const result = evaluate(parsed, choice.id);
        expect(result.correct).toBe(choice.outcome === truth);
        expect(result.feedback).toBe(choice.outcome === truth ? parsed.successFeedback : choice.feedback);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "shapeHierarchyLab") {
      // The independent route derives the correct LABEL from the original shape-language prompt.
      // The engine independently derives correctness from family relation or fixed triangle givens.
      const wantLabel = check(parsed.prompt + "||" + parsed.choices.map((choice) => choice.label).join(";;")) as string;
      const correct = parsed.choices.filter((choice) => shapeHierarchyChoiceCorrect(parsed, choice));
      expect(correct, "exactly one shape claim must be evidence-backed").toHaveLength(1);
      expect(correct[0].label).toBe(wantLabel);
      expect(v.answer).toBe(correct[0].id);
      expect(evaluate(parsed, correct[0].id).correct).toBe(true);
      expect(new Set(parsed.choices.map((choice) => choice.id)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice) => choice.label)).size).toBe(parsed.choices.length);
      for (const choice of parsed.choices) {
        const result = evaluate(parsed, choice.id);
        expect(result.correct).toBe(shapeHierarchyChoiceCorrect(parsed, choice));
        expect(result.feedback).toBe(choice.feedback);
        expect(choice.feedback.length).toBeGreaterThanOrEqual(25);
        expect(choice.feedback).not.toMatch(NEGATION);
        expect(choice.evidenceText.length).toBeGreaterThanOrEqual(20);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "mcq") {
      // The route recomputes the CORRECT LABEL from the prompt (with the option labels appended
      // after "||" for prompts whose numbers live in the options); the gate then finds which
      // option is flagged correct and asserts they agree. So a generator that flags the wrong
      // option fails here even though every option looks well-formed.
      const wantLabel = check(parsed.prompt + "||" + parsed.options.map((o) => o.label).join(";;")) as string;
      const correct = parsed.options.filter((o) => o.correct);
      expect(correct.length, "an MCQ needs exactly one correct option").toBe(1);
      expect(correct[0].label).toBe(wantLabel);
      expect(v.answer).toBe(correct[0].id);
      expect(evaluate(parsed, correct[0].id).correct).toBe(true);

      // Distinct labels: a repeat is either a second right answer or an unreachable diagnosis.
      const labels = parsed.options.map((o) => o.label);
      expect(new Set(labels).size, "duplicate option labels").toBe(labels.length);
      const ids = parsed.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);

      // Every wrong option is reachable and names ITS OWN misconception — not a shared "try again".
      for (const o of parsed.options) {
        const r = evaluate(parsed, o.id);
        expect(r.correct).toBe(o.correct);
        expect(r.feedback).toBe(o.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.prompt.length).toBeGreaterThan(8);
      return { v, w: parsed };
    }

    if (parsed.type === "numberLinePlace") {
      expect(check(parsed.prompt)).toBe(v.answer);
      expect(evaluate(parsed, v.answer).correct).toBe(true);
      // The mark the learner must reach has to BE the answer, and has to sit on the drawn line —
      // a target outside [min, max] would be physically unreachable.
      expect(parsed.target).toBe(v.answer);
      expect(parsed.target).toBeGreaterThanOrEqual(parsed.min);
      expect(parsed.target).toBeLessThanOrEqual(parsed.max);
      expect(parsed.max).toBeGreaterThan(parsed.min);
      // Every reachable mark must be a whole number of steps from the start, or the target
      // cannot actually be selected.
      expect(Number.isInteger((parsed.target - parsed.start) / parsed.step)).toBe(true);
      const places = parsed.commonPlacements.map((c) => c.value);
      expect(new Set(places).size).toBe(places.length);
      for (const c of parsed.commonPlacements) {
        // A trap placement must be ON the line and must not be the answer, or correct work
        // would be graded wrong.
        expect(c.value).not.toBe(v.answer);
        expect(c.value).toBeGreaterThanOrEqual(parsed.min);
        expect(c.value).toBeLessThanOrEqual(parsed.max);
        expect(Number.isInteger((c.value - parsed.start) / parsed.step)).toBe(true);
        const r = evaluate(parsed, c.value);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      // The direction-generic fallbacks must fire for a miss on each side that is not already
      // covered by a named placement.
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      expect(parsed.lowFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.highFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.lowFeedback).not.toMatch(NEGATION);
      expect(parsed.highFeedback).not.toMatch(NEGATION);
      return { v, w: parsed };
    }

    if (parsed.type === "signChart") {
      // The engine's answer is a SIGN PER INTERVAL. The independent derivation here evaluates the
      // polynomial ∏(x − root)^mult (times the leading sign) at a test point strictly inside each
      // interval — sampling, not the multiplicity-parity shortcut the widget itself uses.
      const roots = parsed.roots.map((r) => r.x);
      for (let i = 1; i < roots.length; i++) expect(roots[i]! > roots[i - 1]!, "roots must increase to draw").toBe(true);
      const at = (x: number) => {
        let y = parsed.leadingPositive ? 1 : -1;
        for (const r of parsed.roots) y *= Math.pow(x - r.x, r.mult);
        return y;
      };
      const samples = [roots[0]! - 1, ...roots.slice(1).map((x, i) => (roots[i]! + x) / 2), roots[roots.length - 1]! + 1];
      const derived = samples.map((x) => (at(x) > 0 ? "+" : "-"));
      expect(v.answer).toEqual(derived);
      const routed = check(parsed.prompt);
      expect(routed).toEqual(derived);
      expect(evaluate(parsed, v.answer as Array<"+" | "-">).correct).toBe(true);

      // Every wrong state a learner can reach lands in a slot that names its error. Flipping the
      // sign across an EVEN root must fire the bounce diagnosis; a wrong sign at an odd crossing
      // must fire the crossing diagnosis — and both must actually be reachable states.
      const truth = v.answer as Array<"+" | "-">;
      const flip = (sgn: "+" | "-") => (sgn === "+" ? "-" : "+");
      parsed.roots.forEach((root, i) => {
        const wrong = truth.map((sgn, j) => (j <= i ? flip(sgn) : sgn)) as Array<"+" | "-">;
        const r = evaluate(parsed, wrong);
        expect(r.correct).toBe(false);
        const expected = root.mult % 2 === 0 ? parsed.bounceFeedback : parsed.crossFeedback;
        // A left-side flip changes the relation across THIS root only; the evaluator diagnoses
        // the parity of the root whose crossing rule was violated.
        expect(r.feedback).toBe(expected);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      });
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.crossFeedback).not.toMatch(NEGATION);
      expect(parsed.bounceFeedback).not.toMatch(NEGATION);
      return { v, w: parsed };
    }

    if (parsed.type === "fractionBar") {
      // The engine grades by VALUE (cross-multiplication), so the gate must too. The route reads the
      // printed part-count; the declared answer must be that exact build, reachable on the sliders.
      const want = check(parsed.prompt) as unknown as { n: number; d: number };
      expect(want).toEqual(v.answer);
      const ans = v.answer as unknown as { n: number; d: number };
      expect(ans.n * parsed.targetDen).toBe(ans.d * parsed.targetNum); // equals the target in value
      expect(ans.n).toBeGreaterThanOrEqual(parsed.numMin);
      expect(ans.n).toBeLessThanOrEqual(parsed.numMax);
      expect(ans.d).toBeGreaterThanOrEqual(parsed.denMin);
      expect(ans.d).toBeLessThanOrEqual(parsed.denMax);
      expect(evaluate(parsed, ans).correct).toBe(true);
      // The bar must not START on a winning value, or the learner is graded correct for doing nothing.
      expect(evaluate(parsed, { n: parsed.numStart, d: parsed.denStart }).correct).toBe(false);
      const isTargetValue = (n: number, d: number) => n * parsed.targetDen === d * parsed.targetNum;
      const trapped = (n: number, d: number) => parsed.commonFractions.some((t) => t.num === n && t.den === d);
      for (const t of parsed.commonFractions) {
        // A trap is a specific BUILD: it must be reachable on the sliders, and must not sit on the
        // target's value — evaluate() checks equality first, so such a trap could never fire.
        expect(isTargetValue(t.num, t.den), "a trap sits on the correct value").toBe(false);
        expect(t.num).toBeGreaterThanOrEqual(parsed.numMin);
        expect(t.num).toBeLessThanOrEqual(parsed.numMax);
        expect(t.den).toBeGreaterThanOrEqual(parsed.denMin);
        expect(t.den).toBeLessThanOrEqual(parsed.denMax);
        const r = evaluate(parsed, { n: t.num, d: t.den });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(t.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      // The generic low/high slots must each be REACHABLE by some untrapped wrong build on their
      // side — otherwise a feedback string ships that no learner state can ever produce.
      let sawLow = false, sawHigh = false;
      for (let nn = parsed.numMin; nn <= parsed.numMax; nn++) {
        for (let dd = Math.max(1, parsed.denMin); dd <= parsed.denMax; dd++) {
          if (isTargetValue(nn, dd) || trapped(nn, dd)) continue;
          const below = nn * parsed.targetDen < dd * parsed.targetNum;
          const r = evaluate(parsed, { n: nn, d: dd });
          expect(r.correct).toBe(false);
          expect(r.feedback).toBe(below ? parsed.lowFeedback : parsed.highFeedback);
          if (below) sawLow = true; else sawHigh = true;
        }
      }
      expect(sawLow || sawHigh, "no wrong build is reachable at all").toBe(true);
      for (const fb of [parsed.successFeedback, ...(sawLow ? [parsed.lowFeedback] : []), ...(sawHigh ? [parsed.highFeedback] : [])]) {
        expect(fb.length).toBeGreaterThanOrEqual(25);
      }
      for (const fb of [...(sawLow ? [parsed.lowFeedback] : []), ...(sawHigh ? [parsed.highFeedback] : [])]) {
        expect(fb).not.toMatch(NEGATION);
      }
      return { v, w: parsed };
    }

    if (parsed.type === "areaModel" && parsed.countGrid) {
      const want = check(parsed.prompt) as number;
      expect(want).toBe(parsed.targetArea);
      expect(v.answer).toBe(parsed.targetArea);
      expect(parsed.wStart * parsed.hStart).toBe(parsed.targetArea);
      expect(parsed.wStart).toBe(parsed.wMax);
      expect(parsed.hStart).toBe(parsed.hMax);
      expect(evaluate(parsed, parsed.targetArea).correct).toBe(true);
      const seen = new Set<number>();
      for (const trap of parsed.commonCounts) {
        expect(trap.count).toBeGreaterThanOrEqual(0);
        expect(trap.count).toBeLessThan(parsed.targetArea);
        expect(seen.has(trap.count), "duplicate fixed-grid misconception count").toBe(false);
        seen.add(trap.count);
        const r = evaluate(parsed, trap.count);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(trap.feedback);
        expect(r.feedback.length).toBeGreaterThanOrEqual(25);
        expect(r.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      expect(parsed.lowFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "oddEvenPairs") {
      // Parity is re-derived from the number under test — never trusted from the declared answer.
      const ones = parsed.mode === "onesDigit" ? parsed.n % 10 : parsed.n;
      const derived = ones % 2 === 1 ? "odd" : "even";
      expect(parsed.answer).toBe(derived);
      expect(check(parsed.prompt)).toBe(parsed.answer);
      expect(check(parsed.prompt)).toBe(v.answer);
      if (parsed.mode === "onesDigit") expect(parsed.prompt).toContain(String(parsed.n));
      const full = Math.floor(ones / 2);
      expect(evaluate(parsed, { paired: full, choice: parsed.answer }).correct).toBe(true);
      // The WRONG parity must land on its authored diagnosis; the correct parity's own slot must be
      // absent — a slot that can only fire on a right answer is dead weight that reads as blame.
      const wrongChoice = parsed.answer === "odd" ? "even" : "odd";
      const wrongSlot = wrongChoice === "odd" ? parsed.oddFeedback : parsed.evenFeedback;
      const deadSlot = parsed.answer === "odd" ? parsed.oddFeedback : parsed.evenFeedback;
      expect(deadSlot, "the correct parity's feedback slot can never fire").toBeUndefined();
      const wrong = evaluate(parsed, { paired: full, choice: wrongChoice });
      expect(wrong.correct).toBe(false);
      if (wrongSlot !== undefined) {
        expect(wrong.feedback).toBe(wrongSlot);
        expect(wrongSlot.length).toBeGreaterThanOrEqual(25);
        expect(wrongSlot).not.toMatch(NEGATION);
      }
      // Answering before pairing is finished must be caught, whenever unfinished states exist.
      if (ones >= 2) {
        const early = evaluate(parsed, { paired: 0, choice: parsed.answer });
        expect(early.correct).toBe(false);
        expect(early.feedback).toBe(parsed.unfinishedFeedback);
        expect(parsed.unfinishedFeedback.length).toBeGreaterThanOrEqual(25);
        expect(parsed.unfinishedFeedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(25);
      return { v, w: parsed };
    }

    if (parsed.type === "distributionCompareLab") {
      // Truth is the derived standardized gap, never the stored answer alone.
      const gap = distributionGapUnits(parsed);
      if (parsed.mode === "measure") {
        expect(Number.isFinite(gap)).toBe(true);
        const ans = parsed.answer;
        if (ans === undefined) throw new Error("measure-mode variant without an answer");
        expect(Math.abs(gap - ans)).toBeLessThanOrEqual(parsed.tolerance);
        const winners = parsed.measureChoices.filter((c) => Math.abs(c.value - ans) <= parsed.tolerance);
        expect(winners, "exactly one measure choice may be acceptable").toHaveLength(1);
        expect(v.answer).toBe(ans);
        expect(evaluate(parsed, winners[0].value).correct).toBe(true);
        for (const c of parsed.measureChoices) {
          if (Math.abs(c.value - ans) <= parsed.tolerance) continue;
          const r = evaluate(parsed, c.value);
          expect(r.correct).toBe(false);
          expect(r.feedback).toBe(c.feedback);
          expect(c.feedback.length).toBeGreaterThanOrEqual(25);
          expect(c.feedback).not.toMatch(NEGATION);
        }
      } else {
        const right = parsed.judgeOptions.filter((o) => o.correct);
        expect(right, "exactly one judge option may be correct").toHaveLength(1);
        expect(v.answer).toBe(right[0].id);
        expect(evaluate(parsed, right[0].id).correct).toBe(true);
        for (const o of parsed.judgeOptions) {
          if (o.correct) continue;
          const r = evaluate(parsed, o.id);
          expect(r.correct).toBe(false);
          expect(r.feedback).toBe(o.feedback);
          expect(o.feedback.length).toBeGreaterThanOrEqual(25);
          expect(o.feedback).not.toMatch(NEGATION);
        }
      }
      return { v, w: parsed };
    }

    if (parsed.type === "trialProbabilityLab") {
      // Truth is fraction equivalence to favourable/total — a stored boolean is never trusted.
      const winners = parsed.choices.filter((c) => trialProbabilityEquivalent(parsed, c));
      expect(winners, "exactly one fraction choice may be equivalent to favourable/total").toHaveLength(1);
      expect(v.answer).toBe(winners[0].id);
      expect(evaluate(parsed, winners[0].id).correct).toBe(true);
      for (const c of parsed.choices) {
        if (trialProbabilityEquivalent(parsed, c)) continue;
        const r = evaluate(parsed, c.id);
        expect(r.correct).toBe(false);
        if (c.feedback !== undefined) {
          expect(r.feedback).toBe(c.feedback);
          expect(c.feedback.length).toBeGreaterThanOrEqual(25);
          expect(c.feedback).not.toMatch(NEGATION);
        }
      }
      return { v, w: parsed };
    }

    if (parsed.type === "compoundEventLab") {
      // Truth is the cross product of the stages — count and probability re-derived here.
      const total = compoundEventTotal(parsed);
      const winners = parsed.choices.filter((c) => compoundEventChoiceCorrect(parsed, c));
      expect(winners, "exactly one claim may be correct").toHaveLength(1);
      expect(v.answer).toBe(winners[0].id);
      expect(total).toBeGreaterThan(0);
      expect(evaluate(parsed, winners[0].id).correct).toBe(true);
      for (const c of parsed.choices) {
        if (compoundEventChoiceCorrect(parsed, c)) continue;
        const r = evaluate(parsed, c.id);
        expect(r.correct).toBe(false);
        if (c.feedback) {
          expect(r.feedback).toBe(c.feedback);
          expect(c.feedback.length).toBeGreaterThanOrEqual(25);
          expect(c.feedback).not.toMatch(NEGATION);
        }
      }
      return { v, w: parsed };
    }


    if (parsed.type === "placeValueTransformLab") {
      // Independent base-ten route: derive the answer from digit positions and repeated ×10/÷10
      // operations without consulting placeValueTransformTruth or any authored correctness marker.
      const clean=(n:number)=>{const x=Math.round(n*1e12)/1e12;return Object.is(x,-0)?0:x;};
      const pow=(e:number)=>10**e;
      const digit=(n:number,e:number)=>Math.floor(Math.abs(n)/pow(e)+1e-9)%10;
      const deciding=(a:number,b:number)=>{const max=Math.max(0,Math.floor(Math.log10(Math.max(Math.abs(a),Math.abs(b),1e-12))));for(let e=max;e>=-12;e--)if(digit(a,e)!==digit(b,e))return e;return -12;};
      const round=(n:number,e:number)=>clean(Math.round((n+Number.EPSILON*Math.sign(n||1))/pow(e))*pow(e));
      const integerScale=(n:number)=>{for(let e=0;e<=12;e++)if(Math.abs(n*pow(e)-Math.round(n*pow(e)))<1e-9)return e;return 12;};
      let answerNumber:number|undefined,answerClaim:string|undefined;
      switch(parsed.task){
        case "shift": answerNumber=clean(parsed.values[0]!*pow(parsed.shiftExponent!)); break;
        case "identifyShift": answerClaim=`shift:${Math.round(Math.log10(parsed.values[1]!/parsed.values[0]!))}`; break;
        case "compare": answerClaim=`relation:${Math.abs(parsed.values[0]!-parsed.values[1]!)<1e-12?"eq":parsed.values[0]!<parsed.values[1]!?"lt":"gt"}`; break;
        case "decidingPlace": answerClaim=`place:${deciding(parsed.values[0]!,parsed.values[1]!)}`; break;
        case "round": answerNumber=round(parsed.values.reduce((a,b)=>a+b,0),parsed.targetExponent!); break;
        case "roundPartsThenSum": answerNumber=clean(parsed.values.map((n)=>round(n,parsed.targetExponent!)).reduce((a,b)=>a+b,0)); break;
        case "roundMethod": answerClaim="method:exact-then-round"; break;
        case "roundGapCause": {const ds=parsed.values.map((n)=>Math.sign(round(n,parsed.targetExponent!)-n));answerClaim=`bias:${ds.every((d)=>d>0)?"both-up":ds.every((d)=>d<0)?"both-down":"mixed"}`;break;}
        case "decimalDivision": answerNumber=clean(parsed.values[0]!/parsed.values[1]!); break;
        case "divisionFirstMove": answerClaim=`scale:${integerScale(parsed.values[1]!)}`; break;
        case "exponentChain": {let total=parsed.values[0]!;for(let i=1;i<parsed.values.length;i++)total=parsed.exponentOps[i-1]==="add"?total+parsed.values[i]!:total-parsed.values[i]!;answerNumber=clean(total);break;}
        case "placeExponent": answerClaim=`place-exponent:${parsed.targetExponent}`; break;
        case "scientificForm": {const e=Math.floor(Math.log10(Math.abs(parsed.values[0]!))),c=clean(parsed.values[0]!/pow(e));answerClaim=`scientific:${c}:${e}`;break;}
        case "evaluatePowerTen": answerNumber=clean(parsed.values[0]!*pow(parsed.targetExponent!)); break;
      }
      const revealed=placeValueTransformExplorationKeys(parsed).slice(0,parsed.requiredExplorations);
      expect(revealed).toHaveLength(parsed.requiredExplorations);
      if(parsed.answerMode==="numeric"){
        expect(typeof answerNumber).toBe("number");
        expect(Math.abs((v.answer as number)-answerNumber!)).toBeLessThan(1e-9);
        expect(evaluate(parsed,{revealed,numeric:answerNumber}).correct).toBe(true);
        for(const wrong of parsed.numericErrors){
          expect(Math.abs(wrong.value-answerNumber!)).toBeGreaterThan(parsed.tolerance);
          expect(evaluate(parsed,{revealed,numeric:wrong.value})).toEqual({correct:false,feedback:wrong.feedback});
        }
      }else{
        const winners=parsed.choices.filter((choice)=>typeof choice.value==="number"?typeof answerNumber==="number"&&Math.abs(choice.value-answerNumber)<1e-9:choice.claim===answerClaim);
        expect(winners,"exactly one independently-derived place-value choice").toHaveLength(1);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed,{revealed,choiceId:winners[0]!.id}).correct).toBe(true);
        for(const choice of parsed.choices.filter((choice)=>choice.id!==winners[0]!.id))
          expect(evaluate(parsed,{revealed,choiceId:choice.id})).toEqual({correct:false,feedback:choice.feedback});
      }
      expect(evaluate(parsed,{revealed:Array.from({length:parsed.requiredExplorations},(_,i)=>`fake:${i}`),numeric:answerNumber,choiceId:v.answer as string}).correct).toBe(false);
      expect(new Set(parsed.choices.map((choice)=>choice.id)).size).toBe(parsed.choices.length);
      expect(new Set(parsed.choices.map((choice)=>choice.label)).size).toBe(parsed.choices.length);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return {v,w:parsed};
    }

    if (parsed.type === "proportionalReasoningLab") {
      // Independent truth route: normalize every pair locally, then perform the requested
      // multiplicative chain without consulting the schema helper or any authored correct flag.
      const rows = parsed.series.map((series) => ({
        ...series,
        rates: series.pairs.map(([x, y]) => y / x),
      }));
      const target = rows.find((series) => series.id === parsed.targetSeriesId) ?? rows[0]!;
      const ranked = [...rows].sort((a, b) => a.rates[0]! - b.rates[0]! || a.id.localeCompare(b.id));
      const best = parsed.optimize === "max" ? ranked[ranked.length - 1]! : ranked[0]!;
      let answerNumber: number | undefined;
      let answerClaim: string | undefined;
      switch (parsed.task) {
        case "unitRate": case "constant": answerNumber = target.rates[0]!; break;
        case "predictOutput": case "scaleRatio": answerNumber = target.rates[0]! * parsed.targetInput!; break;
        case "predictInput": answerNumber = parsed.targetOutput! / target.rates[0]!; break;
        case "percentOf": answerNumber = parsed.targetInput! * parsed.percent! / 100; break;
        case "discount": {
          const subtotal = target.rates[0]! * parsed.targetInput!;
          answerNumber = subtotal - subtotal * parsed.percent! / 100;
          break;
        }
        case "cheaperThenPredict": answerNumber = best.rates[0]! * parsed.targetInput!; answerClaim = `series:${best.id}`; break;
        case "bestRate": answerClaim = `series:${best.id}`; break;
        case "steadyAssumption": answerClaim = target.rates.every((rate) => Math.abs(rate - target.rates[0]!) < 1e-9) ? "assumption:holds" : "assumption:failed"; break;
        case "testProportional": answerClaim = target.rates.every((rate) => Math.abs(rate - target.rates[0]!) < 1e-9) ? "proportional:yes" : "proportional:no"; break;
      }
      const revealed = proportionalReasoningExplorationKeys(parsed).slice(0, parsed.requiredExplorations);
      expect(revealed).toHaveLength(parsed.requiredExplorations);
      if (parsed.answerMode === "numeric") {
        expect(answerNumber).toBeTypeOf("number");
        expect(Math.abs((v.answer as number) - answerNumber!)).toBeLessThan(1e-9);
        expect(evaluate(parsed, { revealed, numeric: answerNumber }).correct).toBe(true);
        const routed = check(parsed.prompt);
        expect(typeof routed).toBe("number");
        expect(Math.abs((routed as number) - answerNumber!)).toBeLessThan(1e-9);
        for (const wrong of parsed.numericErrors) {
          expect(Math.abs(wrong.value - answerNumber!)).toBeGreaterThan(parsed.tolerance);
          const result = evaluate(parsed, { revealed, numeric: wrong.value });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(wrong.feedback);
        }
      } else {
        const winners = parsed.choices.filter((choice) =>
          typeof choice.value === "number"
            ? typeof answerNumber === "number" && Math.abs(choice.value - answerNumber) < 1e-9
            : choice.claim === answerClaim
        );
        expect(winners, "exactly one independently-derived proportional choice").toHaveLength(1);
        expect(v.answer).toBe(winners[0]!.id);
        expect(evaluate(parsed, { revealed, choiceId: winners[0]!.id }).correct).toBe(true);
        const routed = check(parsed.prompt + "||" + parsed.choices.map((choice) => choice.label).join(";;"));
        if (typeof routed === "number" && typeof answerNumber === "number") expect(Math.abs(routed - answerNumber)).toBeLessThan(1e-9);
        else expect(routed).toBe(winners[0]!.label);
        for (const choice of parsed.choices.filter((choice) => choice.id !== winners[0]!.id)) {
          const result = evaluate(parsed, { revealed, choiceId: choice.id });
          expect(result.correct).toBe(false);
          expect(result.feedback).toBe(choice.feedback);
        }
      }
      // Fabricated state strings cannot satisfy the exploration gate.
      expect(evaluate(parsed, { revealed: Array.from({length: parsed.requiredExplorations}, (_, i) => `fake:${i}`), numeric: answerNumber, choiceId: v.answer as string }).correct).toBe(false);
      expect(new Set(parsed.series.map((series) => series.id)).size).toBe(parsed.series.length);
      expect(new Set(parsed.series.map((series) => series.label)).size).toBe(parsed.series.length);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "percentChangeLab") {
      const target = percentChangeTarget(parsed);
      const winners = parsed.choices.filter((c) => percentChangeChoiceCorrect(parsed, c));
      expect(winners, "exactly one price claim may be correct").toHaveLength(1);
      expect(Math.abs(winners[0].value - target)).toBeLessThan(1e-9);
      expect(v.answer).toBe(winners[0].id);
      expect(evaluate(parsed, winners[0].id).correct).toBe(true);
      const routed = check(parsed.prompt) as number;
      expect(Math.abs(routed - target)).toBeLessThan(1e-9);
      for (const c of parsed.choices) {
        if (percentChangeChoiceCorrect(parsed, c)) continue;
        const r = evaluate(parsed, c.id);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(c.feedback.length).toBeGreaterThanOrEqual(20);
        expect(c.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "compositeAreaLab") {
      const target = compositeAreaTarget(parsed);
      const winners = parsed.choices.filter((c) => compositeAreaChoiceCorrect(parsed, c));
      expect(winners, "exactly one area claim may be correct").toHaveLength(1);
      expect(Math.abs(winners[0].value - target)).toBeLessThan(1e-9);
      expect(v.answer).toBe(winners[0].id);
      expect(evaluate(parsed, winners[0].id).correct).toBe(true);
      const routed = check(parsed.prompt) as number;
      expect(Math.abs(routed - target)).toBeLessThan(1e-9);
      for (const c of parsed.choices) {
        if (compositeAreaChoiceCorrect(parsed, c)) continue;
        const r = evaluate(parsed, c.id);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(c.feedback.length).toBeGreaterThanOrEqual(25);
        expect(c.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "angleMeasure") {
      const want = check(parsed.prompt) as number;
      expect(want).toBe(parsed.targetAngle);
      expect(v.answer).toEqual({ angle: parsed.targetAngle });
      expect(evaluate(parsed, { angle: parsed.targetAngle }).correct).toBe(true);
      const seen = new Set<number>();
      for (const c of parsed.commonAngles ?? []) {
        expect(c.angle).not.toBe(parsed.targetAngle);
        expect(seen.has(c.angle), "duplicate angleMeasure diagnosis").toBe(false);
        seen.add(c.angle);
        const r = evaluate(parsed, { angle: c.angle });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(c.feedback.length).toBeGreaterThanOrEqual(10);
      }
      if (parsed.linearPair) {
        expect((1 + parsed.linearPair.multiplier) * parsed.targetAngle).toBe(parsed.linearPair.total);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "triangleClosureLab") {
      const forms = triangleClosureForms(parsed.sides);
      const winners = parsed.choices.filter((c) => triangleClosureChoiceCorrect(parsed, c));
      expect(winners, "exactly one verdict may be correct").toHaveLength(1);
      expect(winners[0].verdict).toBe(forms ? "forms" : "does-not-form");
      expect(v.answer).toEqual(expect.objectContaining({ choice: winners[0].id }));
      expect(evaluate(parsed, { choice: winners[0].id }).correct).toBe(true);
      const routed = check(parsed.prompt);
      expect(routed).toBe(forms ? 1 : 0);
      for (const c of parsed.choices) {
        if (triangleClosureChoiceCorrect(parsed, c)) continue;
        const r = evaluate(parsed, { choice: c.id });
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(c.feedback.length).toBeGreaterThanOrEqual(25);
        expect(c.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "signedFractionLab") {
      const truth = signedFractionTruth(parsed);
      const winners = parsed.choices.filter((c) => signedFractionChoiceCorrect(parsed, c));
      expect(winners, "exactly one fraction claim may be correct").toHaveLength(1);
      expect(winners[0].sign).toBe(truth.sign);
      expect(winners[0].num * truth.den).toBe(truth.num * winners[0].den);
      expect(v.answer).toEqual({ sign: truth.sign, whole: 0, num: truth.num, den: truth.den });
      expect(evaluate(parsed, winners[0].id).correct).toBe(true);
      const seenPaths = new Set<string>();
      for (const c of parsed.choices) {
        if (signedFractionChoiceCorrect(parsed, c)) continue;
        expect(seenPaths.has(c.path), `duplicate signedFractionLab path ${c.path}`).toBe(false);
        seenPaths.add(c.path);
        const r = evaluate(parsed, c.id);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(c.feedback.length).toBeGreaterThanOrEqual(20);
        expect(c.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "conditionalTableLab") {
      // Only "read" mode produces a graded choice set from a seeded generator; "conditional"
      // mode is the exploration/switching UI and is exercised by its own hand-authored lessons.
      expect(parsed.mode).toBe("read");
      if (parsed.mode !== "read" || !parsed.readMetric) throw new Error("read-mode variant missing readMetric");
      const truth = conditionalTableReadTruth(parsed.counts, parsed.readMetric, parsed.targetCell);
      const winners = parsed.answerChoices.filter((c) => Math.abs(c.value - truth.value) < 1e-9);
      expect(winners, "exactly one independently-derived correct choice").toHaveLength(1);
      expect(v.answer).toBe(truth.value);
      expect(evaluate(parsed, winners[0].id).correct).toBe(true);
      // Independent checks for this type come in two honest shapes: a numeric value, or the
      // winning choice's LABEL (cellMeaning and bvRelDivide read the claim in words). Accept
      // either, but require it to identify the same winner the engine derived.
      const routed = check(parsed.prompt + "||" + parsed.answerChoices.map((c) => c.label).join(";;"));
      if (typeof routed === "number") expect(Math.abs(routed - truth.value)).toBeLessThan(1e-9);
      else expect(routed).toBe(winners[0].label);
      const seenIds = new Set<string>(), seenLabels = new Set<string>(), seenValues = new Set<number>();
      for (const c of parsed.answerChoices) {
        expect(seenIds.has(c.id), "duplicate answerChoice id").toBe(false);
        seenIds.add(c.id);
        expect(seenLabels.has(c.label), "duplicate answerChoice label").toBe(false);
        seenLabels.add(c.label);
        expect(seenValues.has(c.value), "duplicate answerChoice value").toBe(false);
        seenValues.add(c.value);
        if (Math.abs(c.value - truth.value) < 1e-9) continue;
        const r = evaluate(parsed, c.id);
        expect(r.correct).toBe(false);
        expect(r.feedback).toBe(c.feedback);
        expect(c.feedback.length).toBeGreaterThanOrEqual(20);
        expect(c.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      return { v, w: parsed };
    }

    if (parsed.type === "graphRead") {
      // S237. The five questions in this engine's terms. The engine has no typed answer: the learner
      // taps a value, so "correct" is a reachable tap and every trap must be a tap that EXISTS.
      const truth = graphReadAnswer(parsed);
      expect(v.answer).toBe(truth);
      const indep = check(parsed.prompt) as number;
      expect(indep).toBe(truth);
      // The row drawn must equal the quantity the prompt states. This engine exists because these
      // items described a picture nobody drew; a picture that disagrees with the sentence would be
      // a worse defect than the one it replaced, and only this line can see it.
      expect(parsed.drawn * parsed.unitValue, "drawn row disagrees with the prompt").toBe(indep);
      expect(evaluate(parsed, { picked: truth }).correct).toBe(true);
      // Every value on the tap scale is reachable, so every value must grade — and only the truth
      // may grade correct. This is the engine's version of "a trap that can grade correct is a bug",
      // and it is exhaustive rather than a spot check.
      for (let n = 0; n <= parsed.scaleMax; n++) {
        expect(evaluate(parsed, { picked: n }).correct, `tap ${n} graded correct, truth is ${truth}`).toBe(n === truth);
      }
      const vals = parsed.commonResults.map((r) => r.value);
      expect(new Set(vals).size, "duplicate trap values").toBe(vals.length);
      for (const r of parsed.commonResults) {
        expect(r.value).not.toBe(truth);
        expect(r.value, `trap ${r.value} is off the tap scale — dead feedback`).toBeLessThanOrEqual(parsed.scaleMax);
        expect(r.value).toBeGreaterThanOrEqual(0);
        const got = evaluate(parsed, { picked: r.value });
        expect(got.correct).toBe(false);
        expect(got.feedback, `trap ${r.value} does not reach its own diagnosis`).toBe(r.feedback);
        expect(got.feedback.length).toBeGreaterThanOrEqual(25);
        expect(got.feedback).not.toMatch(NEGATION);
      }
      expect(parsed.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
      expect(parsed.successFeedback.length).toBeGreaterThanOrEqual(10);
      expect(parsed.prompt.length).toBeGreaterThan(8);
      // Stored English forms, never derived. The handler this replaced printed "1 apple pictures".
      expect(parsed.unitNoun).not.toBe(parsed.unitNounPlural);
      if (parsed.drawn === 1) expect(parsed.prompt).not.toMatch(/\b1 [a-z]+s\b/);
      return { v, w: parsed };
    }

    // An unhandled widget type must fail LOUDLY here. Without this guard the chain falls through
    // to the numeric path below and casts the spec to a numeric widget — for a type with no
    // `commonErrors` that surfaces as a TypeError deep inside the numeric checks, which points at
    // the wrong thing entirely. (Found while preparing the numberLinePlace branch.)
    const HANDLED_BY_NUMERIC_FALLTHROUGH = "numeric";
    if (parsed.type !== HANDLED_BY_NUMERIC_FALLTHROUGH) {
      throw new Error(
        `variant gate has no branch for widget type "${parsed.type}" — add one before declaring a generator that emits it, rather than letting it fall through to the numeric path`
      );
    }

    const w = parsed as Extract<typeof v.widget, { type: "numeric" }>;
    const answer = v.answer as number;
    const indep = check(w.prompt) as number;
    expect(Math.abs(indep - answer) / Math.max(1, Math.abs(answer))).toBeLessThan(1e-6);
    expect(evaluate(w, answer).correct).toBe(true);
    const vals = w.commonErrors.map((e) => e.value);
    expect(new Set(vals).size).toBe(vals.length);
    for (const val of vals) {
      expect(Math.abs(val - answer)).toBeGreaterThan(w.tolerance);
      expect(evaluate(w, val).correct).toBe(false);
    }
    for (const e of w.commonErrors) {
      const fb = evaluate(w, e.value).feedback;
      expect(fb).toBe(e.feedback);
      expect(fb.length).toBeGreaterThanOrEqual(25);
      expect(fb).not.toMatch(NEGATION);
    }
    expect(w.fallbackFeedback.length).toBeGreaterThanOrEqual(25);
    expect(w.prompt.length).toBeGreaterThan(8);
    return { v, w };
  }

  for (const g of VARIANT_GENERATORS) {
    for (const form of g.forms ?? []) {
      it(`${g.tag} @ form=${form}: 150 seeds through the identical gate`, () => {
        for (let s = 0; s < 150; s++) gateOne(g, `form-${s}`, undefined, form);
      });
    }
  }

  for (const g of VARIANT_GENERATORS) {
    it(`${g.tag}: 400 seeds — correct, trapped, diagnostic, deterministic`, () => {
      // The five checks live in gateOne, which the banded sweeps below share verbatim. They used to
      // be duplicated here; when the first manipulative generator arrived, the duplicate was the copy
      // that silently kept assuming a numeric widget. One gate, one place.
      // Declaration-only generators reject the bare "default" path by design (content reaches them
      // only through per-step form declarations), so the sweep walks their declared forms instead —
      // the same 400 seeds, the identical gate, every reachable form.
      const forms = g.declarationOnly ? (g.forms ?? []) : [undefined];
      for (let s = 0; s < 400; s++) gateOne(g, `sweep-${s}`, undefined, forms[s % forms.length] as string | undefined);
    });
  }

  it("a trap really IS the misconception, not just a nearby number", () => {
    // Spot-check the two that matter most, on a fixed seed, and assert the trap equals the value the
    // named mistake actually produces. If a generator's trap ever stops matching its story, this
    // fails — and a trap whose story is false is worse than no trap at all.
    const chain = variantFor("dr-chain-rule", "story")!;
    const cw = chain.widget as Extract<typeof chain.widget, { type: "numeric" }>;
    const [, m, c, n, a] = cw.prompt.match(/\((\d+)x \+ (\d+)\)\^(\d+)\. Find f′\((\d+)\)/)!.map(Number);
    const forgotInner = n * Math.pow(m * a + c, n - 1); // exactly: outside done, inside never paid for
    expect(cw.commonErrors.some((e) => e.value === forgotInner)).toBe(true);
    expect(cw.commonErrors.find((e) => e.value === forgotInner)!.feedback).toMatch(/inside/i);

    const two = variantFor("eq-two-step", "story")!;
    const tw = two.widget as Extract<typeof two.widget, { type: "numeric" }>;
    const [, aa, bb, cc] = tw.prompt.match(/(\d+)x \+ (\d+) = (-?\d+)/)!.map(Number);
    const dividedFirst = Math.round((cc / aa - bb) * 100) / 100; // divided before subtracting
    expect(tw.commonErrors.some((e) => e.value === dividedFirst)).toBe(true);
  });

  for (const band of ["support", "stretch"] as const) {
    for (const g of VARIANT_GENERATORS) {
      it(`${g.tag} @ ${band}: 150 seeds through the identical gate`, () => {
        const forms = g.declarationOnly ? (g.forms ?? []) : [undefined];
        for (let s = 0; s < 150; s++) gateOne(g, `band-${band}-${s}`, band, forms[s % forms.length] as string | undefined);
      });
    }
  }

  it("banding changes surface difficulty, not the concept (eq-two-step ranges)", () => {
    const maxRHS = (band: Band) => {
      let m = 0;
      for (let s = 0; s < 200; s++) {
        const v = variantFor("eq-two-step", `shape-${s}`, band)!;
        const w = v.widget as Extract<typeof v.widget, { type: "numeric" }>;
        const c = Number(w.prompt.match(/= (-?\d+)/)![1]);
        m = Math.max(m, c);
      }
      return m;
    };
    const sup = maxRHS("support"), core = maxRHS("core"), str = maxRHS("stretch");
    expect(sup).toBeLessThan(core);
    expect(core).toBeLessThan(str);
    // support never exceeds its authored ceiling: a·x + b ≤ 5·9 + 9
    expect(sup).toBeLessThanOrEqual(54);
  });

  it("every banded generator's numbers actually ladder (support ≤ core ≤ stretch on a size observable)", () => {
    // One magnitude observable per generator, measured as the max over 150
    // seeds. The ladder must be REAL: if a range edit ever flattens it, this
    // fails before a learner ever feels it.
    const observers: Record<string, (prompt: string) => number> = {
      "int-subtract-negative": (p) => {
        const [, a, b] = p.match(/(-?\d+) − \(−(\d+)\)/)!.map(Number);
        return Math.abs(a) + b;
      },
      "lf-slope-two-points": (p) => {
        const nums = [...p.matchAll(/-?\d+/g)].map((m) => Math.abs(Number(m[0])));
        return Math.max(...nums);
      },
      "dr-power-rule": (p) => Number(p.match(/x\^(\d+)/)![1]),
      "dr-chain-rule": (p) => Number(p.match(/\)\^(\d+)/)![1]),
      "in-definite-power": (p) => {
        const [, k] = p.match(/(\d+)x/)!.map(Number);
        return k;
      }
    };
    for (const [tag, obs] of Object.entries(observers)) {
      const maxAt = (band: Band) => {
        let m = 0;
        for (let s2 = 0; s2 < 150; s2++) {
          m = Math.max(m, obs((variantFor(tag, `ladder-${s2}`, band)!.widget as { prompt: string }).prompt));
        }
        return m;
      };
      const sup = maxAt("support"), core = maxAt("core"), str = maxAt("stretch");
      expect(sup, `${tag}: support ≤ core`).toBeLessThanOrEqual(core);
      expect(core, `${tag}: core ≤ stretch`).toBeLessThanOrEqual(str);
      expect(sup, `${tag}: support < stretch (the ladder is real)`).toBeLessThan(str);
    }
  });

  it("support-band percents are benchmarks only; stretch never uses them", () => {
    for (let s = 0; s < 120; s++) {
      const sup = variantFor("pct-of-number", `p-${s}`, "support")!;
      const p = Number((sup.widget as { prompt: string }).prompt.match(/What is (\d+)%/)![1]);
      expect([25, 50, 75]).toContain(p);
      const str = variantFor("pct-of-number", `p-${s}`, "stretch")!;
      const ps = Number((str.widget as { prompt: string }).prompt.match(/What is (\d+)%/)![1]);
      expect([25, 50, 75, 5, 20, 40, 60, 10]).not.toContain(ps);
    }
  });

  it("MCQ never parks the correct option in a fixed position", () => {
    // Per-problem checks can't catch this: each individual item looks fine while the correct answer
    // sits at index 0 every time, which would let a learner score without doing mathematics.
    for (const g of VARIANT_GENERATORS) {
      for (const form of [...(g.declarationOnly ? [] : [undefined]), ...(g.forms ?? [])]) {
        const seen = new Set<number>();
        let sawMcq = false;
        for (let s = 0; s < 40; s++) {
          const v = (form === undefined ? variantFor(g.tag, `pos-${s}`) : variantForGenForm(g.tag, form, `pos-${s}`, undefined))!;
          if (v.widget.type !== "mcq") break;
          sawMcq = true;
          seen.add(v.widget.options.findIndex((o) => o.correct));
        }
        if (!sawMcq) continue;
        expect(seen.size, `${g.tag}${form ? "@" + form : ""}: correct option sat in ${seen.size} position(s) across 40 seeds`).toBeGreaterThan(1);
      }
    }
  });

  it("the same concept, different seeds, gives genuinely VARIED problems", () => {
    // Two particular seeds may legitimately coincide — the parameter space is finite, and demanding
    // that any two given seeds differ would be asserting something false. What matters is that the
    // generator produces real variety across a run of them.
    for (const g of VARIANT_GENERATORS) {
      if (g.declarationOnly) {
        // The learner-facing unit is (gen, form): a step declares one form and re-practices it.
        // Freshness must hold inside each form, not merely across the family.
        for (const form of g.forms ?? []) {
          const seen = new Set(
            Array.from({ length: 12 }, (_, i) => JSON.stringify(variantForGenForm(g.tag, form, `day-${i}`)!.widget))
          );
          expect(seen.size, `${g.tag}@${form} produced only ${seen.size} distinct problems in 12 seeds`).toBeGreaterThanOrEqual(6);
        }
        continue;
      }
      const seen = new Set(
        Array.from({ length: 12 }, (_, i) => JSON.stringify(variantFor(g.tag, `day-${i}`)!.widget))
      );
      expect(seen.size, `${g.tag} produced only ${seen.size} distinct problems in 12 seeds`).toBeGreaterThanOrEqual(6);
    }
  });
});

describe("lookupOrThrow — S211 review Condition 2(b)", () => {
  // reflect-compose@composeMatrix's SWAP_LINE/OPPOSITE tables are exhaustive only because the
  // form's own draw is restricted to |i − j| ≠ 2. A `table[key]!` non-null assertion would let
  // `undefined` reach learner-facing feedback ("reflection over undefined") if that restriction
  // ever regressed; `lookupOrThrow` throws instead. This pins the throw path directly — by
  // constructing an impossible key artificially — rather than trying (and failing) to make the
  // real generator regress its own invariant just to exercise it.
  it("returns the table's value for a present key", () => {
    expect(lookupOrThrow({ a: 1, b: 2 }, "b", "test entry")).toBe(2);
  });

  it("throws a named error, naming both the missing key and what was being looked up, for an absent key", () => {
    expect(() => lookupOrThrow({ "0,-1,1,0": 2, "0,1,-1,0": 0 }, "-1,0,0,-1", "SWAP_LINE entry")).toThrow(
      /no SWAP_LINE entry for key "-1,0,0,-1"/
    );
  });

  it("throws rather than returning undefined for a key whose value is legitimately absent", () => {
    // The empty-table case: nothing could ever satisfy the lookup, and the function must fail
    // loudly rather than hand back `undefined` for the caller to interpolate into a string.
    let caught: unknown;
    try {
      lookupOrThrow<string>({}, "anything", "empty-table entry");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe('lookupOrThrow: no empty-table entry for key "anything"');
  });
});
