const answers = require('./precalculusIndependentAnswers.json');
const { makeSolver } = require('./authoredTemplateIndependent.cjs');
const solveAuthoredPrompt = makeSolver(answers);

function solveParabolaDefinition(input) {
  const prompt = String(input).split('||', 1)[0].replaceAll('−', '-').trim();
  const match = prompt.match(/directrix ([xy]) = (-?\d+).*point \((-?\d+), (-?\d+)\)/);
  if (!match) throw new Error(`unrecognized parabola-definition prompt: ${prompt}`);
  const [, axis, directrixText, pointXText, pointYText] = match;
  const directrix = Number(directrixText);
  const pointCoordinate = axis === 'y' ? Number(pointYText) : Number(pointXText);
  return Math.abs(pointCoordinate - directrix);
}

function solveHyperbolaEccentricity(input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const match = prompt.match(/\(a = (\d+), c = (\d+)\)/);
  if (!match) throw new Error(`unrecognized hyperbola-eccentricity prompt: ${prompt}`);
  return Math.round((Number(match[2]) / Number(match[1])) * 100) / 100;
}

function solveFunctionGraphRead(input) {
  const prompt = String(input).split('||', 1)[0].replaceAll('âˆ’', '-').trim();
  const match = /g\(x\)\s*=\s*-\(x\s*([+-])\s*(\d+)\)\^2\s*\+\s*(\d+), find g\((-?\d+)\)/i.exec(prompt);
  const zeroVertex = /g\(x\)\s*=\s*-\(x\)\^2\s*\+\s*(\d+), find g\((-?\d+)\)/i.exec(prompt);
  if (zeroVertex) return Number(zeroVertex[1]) - Number(zeroVertex[2]) ** 2;
  if (!match) throw new Error(`unrecognized graph-read prompt: ${prompt}`);
  const h = match[1] === '-' ? Number(match[2]) : -Number(match[2]);
  const k = Number(match[3]);
  const x = Number(match[4]);
  return k - (x - h) ** 2;
}

function solveComposeOrder(input) {
  const prompt = String(input).split('||', 1)[0].replaceAll('âˆ’', '-').trim();
  const match = /f\(x\)\s*=\s*(\d+)x\s*([+-])\s*(\d+).*Find (g\(f|f\(g)\((-?\d+)\)\)/i.exec(prompt);
  if (!match) throw new Error(`unrecognized composition-order prompt: ${prompt}`);
  const a = Number(match[1]); const b = (match[2] === '+' ? 1 : -1) * Number(match[3]); const x = Number(match[5]);
  return match[4] === 'g(f' ? (a * x + b) ** 2 : a * x ** 2 + b;
}

function solveComposeDomain(input) {
  const prompt = String(input).split('||', 1)[0].replaceAll('âˆ’', '-').trim();
  const maximum = /sqrt\((-?\d+) - x\)/i.exec(prompt);
  if (maximum) return Number(maximum[1]);
  const minimum = /sqrt\(x\s*([+-])\s*(\d+)\)/i.exec(prompt);
  if (!minimum) throw new Error(`unrecognized composition-domain prompt: ${prompt}`);
  return minimum[1] === '-' ? Number(minimum[2]) : -Number(minimum[2]);
}

function solveDecompose(input) {
  const prompt = String(input).split('||', 1)[0].replaceAll('âˆ’', '-').trim();
  const match = /g\(x\)\s*=\s*(\d+)x\s*([+-])\s*(\d+).*f\(x\)\s*=\s*x\^(\d+).*f\(g\((-?\d+)\)\)/i.exec(prompt);
  if (!match) throw new Error(`unrecognized decomposition prompt: ${prompt}`);
  const a = Number(match[1]); const b = (match[2] === '+' ? 1 : -1) * Number(match[3]);
  return (a * Number(match[5]) + b) ** Number(match[4]);
}

function solveOneToOne(input) {
  const prompt = String(input).split('||', 1)[0];
  const value = /distinct inputs (\d+) and -\d+/i.exec(prompt)?.[1];
  if (!value) throw new Error(`unrecognized one-to-one collision prompt: ${prompt}`);
  return Number(value);
}

function solveRestrictedInverse(input) {
  const prompt = String(input).split('||', 1)[0];
  const domain = /domain x\s*(>=|<=)\s*(-?\d+)/i.exec(prompt);
  const target = /f\^\(-1\)\((\d+)\)/i.exec(prompt);
  if (!domain || !target) throw new Error(`unrecognized restricted-inverse prompt: ${prompt}`);
  const vertex = Number(domain[2]); const root = Math.sqrt(Number(target[1]));
  return domain[1] === '>=' ? vertex + root : vertex - root;
}

function solveInversePoint(input) {
  const prompt = String(input).split('||', 1)[0];
  const point = /point \((-?\d+),\s*(-?\d+)\) lies on f/i.exec(prompt);
  if (!point) throw new Error(`unrecognized inverse-point prompt: ${prompt}`);
  return [Number(point[2]), Number(point[1])];
}

function solveInverseVerify(input) {
  const prompt = String(input).split('||', 1)[0];
  const inputValue = /Find g\(f\((-?\d+)\)\)/i.exec(prompt)?.[1];
  if (!inputValue) throw new Error(`unrecognized inverse-verification prompt: ${prompt}`);
  return Number(inputValue);
}

const LIMIT_IDEA_MCQ_FORM = 'limits-continuity__lc-limit-idea__mcq';
const LIMIT_IDEA_NUMERIC_FORM = 'limits-continuity__lc-limit-idea__numeric';
const LIMIT_READ_NUMERIC_FORM = 'limits-continuity__lc-read-limit__numeric';
const LIMIT_DNE_MCQ_FORM = 'limits-continuity__lc-dne__mcq';
const LIMIT_DNE_NUMERIC_FORM = 'limits-continuity__lc-dne__numeric';
const LIMIT_FACTOR_NUMERIC_FORM = 'limits-continuity__lc-factor__numeric';
const LIMIT_RATIONALIZE_MCQ_FORM = 'limits-continuity__lc-rationalize__mcq';
const LIMIT_RATIONALIZE_NUMERIC_FORM = 'limits-continuity__lc-rationalize__numeric';
const LIMIT_ONESIDED_MCQ_FORM = 'limits-continuity__lc-onesided__mcq';
const LIMIT_ONESIDED_NUMERIC_FORM = 'limits-continuity__lc-onesided__numeric';
const LIMIT_INFINITY_NUMERIC_FORM = 'limits-continuity__lc-infinity__numeric';
const LIMIT_ENDBEHAVIOR_MCQ_FORM = 'limits-continuity__lc-endbehavior__mcq';
const LIMIT_CONTINUITY_MCQ_FORM = 'limits-continuity__lc-continuity__mcq';
const LIMIT_CONTINUITY_NUMERIC_FORM = 'limits-continuity__lc-continuity__numeric';
const LIMIT_DISCONTINUITY_MCQ_FORM = 'limits-continuity__lc-discontinuity__mcq';
const LIMIT_DISCONTINUITY_NUMERIC_FORM = 'limits-continuity__lc-discontinuity__numeric';
const LIMIT_IVT_MCQ_FORM = 'limits-continuity__lc-ivt__mcq';
const LIMIT_IVT_NUMERIC_FORM = 'limits-continuity__lc-ivt__numeric';
const LIMIT_AVG_RATE_MCQ_FORM = 'limits-continuity__lc-avg-rate__mcq';
const LIMIT_AVG_RATE_NUMERIC_FORM = 'limits-continuity__lc-avg-rate__numeric';
const LIMIT_DERIVATIVE_MCQ_FORM = 'limits-continuity__lc-derivative__mcq';
const LIMIT_DERIVATIVE_NUMERIC_FORM = 'limits-continuity__lc-derivative__numeric';
const LIMIT_SERIES_MCQ_FORM = 'limits-continuity__lc-series-limit__mcq';
const LIMIT_SERIES_NUMERIC_FORM = 'limits-continuity__lc-series-limit__numeric';

const normalizedLimitPrompt = (input) => String(input).split('||', 1)[0].replaceAll('−', '-').trim();
const displayLimitNumber = (value) => value < 0 ? `−${Math.abs(value)}` : String(value);

function solveLimitIdeaNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /table shows (-?\d+(?:\.\d+)?) from the left and (-?\d+(?:\.\d+)?) from the right/.exec(prompt);
  if (!match) throw new Error(`unrecognized limit-approach prompt: ${prompt}`);
  const left = Number(match[1]);
  const right = Number(match[2]);
  const midpoint = (left + right) / 2;
  if (!(left < midpoint && midpoint < right) || Math.abs(midpoint * 2 - left - right) > 1e-9) {
    throw new Error(`limit table does not symmetrically bracket one value: ${prompt}`);
  }
  return midpoint;
}

function solveLimitIdeaMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /curve approaches (-?\d+), while the plotted point gives f\((-?\d+)\) = (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized point-versus-limit prompt: ${prompt}`);
  const approach = Number(match[1]);
  const point = Number(match[3]);
  if (approach === point) throw new Error(`point-versus-limit prompt does not distinguish the two values: ${prompt}`);
  return `${displayLimitNumber(approach)}; use the nearby approach`;
}

function solveLimitReadNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /f\(x\) = (-?\d*)x ([+-]) (\d+)\. Find the limit as x approaches (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized continuous-line limit prompt: ${prompt}`);
  const slope = match[1] === "" ? 1 : match[1] === "-" ? -1 : Number(match[1]);
  const intercept = (match[2] === '+' ? 1 : -1) * Number(match[3]);
  return slope * Number(match[4]) + intercept;
}

function solveLimitDneMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /left-hand limit is (-?\d+) and the right-hand limit is (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized disagreeing-sides prompt: ${prompt}`);
  const left = Number(match[1]);
  const right = Number(match[2]);
  if (left === right) throw new Error(`disagreeing-sides prompt has equal one-sided limits: ${prompt}`);
  return `DNE; the sides give ${displayLimitNumber(left)} and ${displayLimitNumber(right)}`;
}

function solveLimitDneNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /both the left-hand and right-hand limits equal (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized agreeing-sides prompt: ${prompt}`);
  return Number(match[1]);
}

const rootFromPrintedFactor = (sign, magnitude) => sign === '-' ? Number(magnitude) : -Number(magnitude);

function solveLimitFactorNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /approaches (-?\d+) of \[\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)\]\/\(x ([+-]) (\d+)\)/.exec(prompt);
  if (!match) throw new Error(`unrecognized factor-and-cancel prompt: ${prompt}`);
  const at = Number(match[1]);
  const cancelledRoot = rootFromPrintedFactor(match[2], match[3]);
  const remainingRoot = rootFromPrintedFactor(match[4], match[5]);
  const denominatorRoot = rootFromPrintedFactor(match[6], match[7]);
  if (cancelledRoot !== at || denominatorRoot !== at) {
    throw new Error(`factor-and-cancel prompt has an inconsistent removable factor: ${prompt}`);
  }
  return at - remainingRoot;
}

function rationalizeParts(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /√\(x \+ (\d+)\) - (\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized rationalizing prompt: ${prompt}`);
  const square = Number(match[1]);
  const root = Number(match[2]);
  if (root * root !== square) throw new Error(`rationalizing prompt has an inconsistent square-root constant: ${prompt}`);
  return { square, root };
}

function solveLimitRationalizeNumeric(input) {
  const { root } = rationalizeParts(input);
  return Number((1 / (2 * root)).toFixed(3));
}

function solveLimitRationalizeMcq(input) {
  const { square, root } = rationalizeParts(input);
  return `use the conjugate: (√(x + ${square}) + ${root})/(√(x + ${square}) + ${root})`;
}

function solveLimitOneSidedNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /For the (left|right)-hand branch, f\(x\) = (-?\d+)x ([+-]) (\d+) when x ([<>]) (-?\d+)\. Find the (left|right)-hand limit at x = (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized one-sided branch prompt: ${prompt}`);
  const side = match[1];
  const relationSide = match[5] === '<' ? 'left' : 'right';
  if (side !== relationSide || side !== match[7] || Number(match[6]) !== Number(match[8])) {
    throw new Error(`one-sided branch and requested direction are inconsistent: ${prompt}`);
  }
  const intercept = (match[3] === '+' ? 1 : -1) * Number(match[4]);
  return Number(match[2]) * Number(match[8]) + intercept;
}

function solveLimitOneSidedMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /left-hand limit is (-?\d+) and the right-hand limit is (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized two-sided-from-sides prompt: ${prompt}`);
  const left = Number(match[1]); const right = Number(match[2]);
  return left === right
    ? `${displayLimitNumber(left)}; both one-sided limits agree`
    : `DNE; left ${displayLimitNumber(left)} differs from right ${displayLimitNumber(right)}`;
}

function solveLimitInfinityNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /f\(x\) = \((-?\d*)x³ \+ 1\)\/\((\d+)x³ - 2\)/.exec(prompt);
  if (!match) throw new Error(`unrecognized equal-degree infinite-limit prompt: ${prompt}`);
  const numerator = match[1] === "" ? 1 : match[1] === "-" ? -1 : Number(match[1]);
  return Number((numerator / Number(match[2])).toFixed(3));
}

function solveLimitEndBehaviorMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /leading terms (-?\d+)x[^ ]* in the numerator and (\d+)x[^ ]* in the denominator \(degrees (\d+) and (\d+)\)/.exec(prompt);
  if (!match) throw new Error(`unrecognized rational end-behavior prompt: ${prompt}`);
  const a = Number(match[1]); const b = Number(match[2]); const n = Number(match[3]); const m = Number(match[4]);
  const ratio = Number((a / b).toFixed(3));
  if (n < m) return `limit 0; denominator degree ${m} exceeds numerator degree ${n}`;
  if (n === m) return `limit ${displayLimitNumber(ratio)}; numerator degree ${n} equals denominator degree ${m}`;
  return a / b > 0
    ? `limit +∞; numerator degree ${n} exceeds denominator degree ${m}`
    : `limit −∞; numerator degree ${n} exceeds denominator degree ${m}`;
}

function solveLimitContinuityMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /At x = (-?\d+), the two-sided limit is (-?\d+) and f\((-?\d+)\) = (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized continuity-decision prompt: ${prompt}`);
  const at = Number(match[1]); const repeatedAt = Number(match[3]);
  const limit = Number(match[2]); const point = Number(match[4]);
  if (at !== repeatedAt) throw new Error(`continuity prompt compares different points: ${prompt}`);
  return limit === point
    ? `continuous; the limit and f(${displayLimitNumber(at)}) both equal ${displayLimitNumber(limit)}`
    : `not continuous; the limit is ${displayLimitNumber(limit)} but f(${displayLimitNumber(at)}) is ${displayLimitNumber(point)}`;
}

function solveLimitContinuityNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /For x < (-?\d+), f\(x\) = (-?\d+)x ([+-]) (\d+); define f\((-?\d+)\) = k.*at x = (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized continuity-parameter prompt: ${prompt}`);
  const boundary = Number(match[1]);
  if (boundary !== Number(match[5]) || boundary !== Number(match[6])) {
    throw new Error(`continuity-parameter prompt uses inconsistent boundary values: ${prompt}`);
  }
  const intercept = (match[3] === '+' ? 1 : -1) * Number(match[4]);
  return Number(match[2]) * boundary + intercept;
}

function solveLimitDiscontinuityNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /hole at x = (-?\d+) from \[\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)\]\/\(x ([+-]) (\d+)\)/.exec(prompt);
  if (!match) throw new Error(`unrecognized removable-hole prompt: ${prompt}`);
  const at = Number(match[1]);
  const cancelledRoot = rootFromPrintedFactor(match[2], match[3]);
  const remainingRoot = rootFromPrintedFactor(match[4], match[5]);
  const denominatorRoot = rootFromPrintedFactor(match[6], match[7]);
  if (cancelledRoot !== at || denominatorRoot !== at) throw new Error(`removable-hole factors do not match the stated point: ${prompt}`);
  return at - remainingRoot;
}

function solveLimitDiscontinuityMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const atMatch = /At x = (-?\d+)/.exec(prompt);
  if (!atMatch) throw new Error(`unrecognized discontinuity-classification prompt: ${prompt}`);
  const at = Number(atMatch[1]);
  if (/finite two-sided limit .* exists, but the point is missing/.test(prompt)) return `removable discontinuity at x = ${displayLimitNumber(at)}`;
  const jump = /left-hand limit is (-?\d+) and the right-hand limit is (-?\d+)/.exec(prompt);
  if (jump) {
    if (Number(jump[1]) === Number(jump[2])) throw new Error(`jump prompt has matching one-sided limits: ${prompt}`);
    return `jump discontinuity at x = ${displayLimitNumber(at)}`;
  }
  if (/grow without bound beside a vertical asymptote/.test(prompt)) return `infinite discontinuity at x = ${displayLimitNumber(at)}`;
  throw new Error(`discontinuity prompt has no classifying evidence: ${prompt}`);
}

function solveLimitIvtMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /continuous on \[(-?\d+), (-?\d+)\], with f\((-?\d+)\) = (-?\d+) and f\((-?\d+)\) = (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized IVT guarantee prompt: ${prompt}`);
  const a = Number(match[1]); const b = Number(match[2]);
  if (a !== Number(match[3]) || b !== Number(match[5]) || a >= b) throw new Error(`IVT prompt has inconsistent interval endpoints: ${prompt}`);
  if (Number(match[4]) * Number(match[6]) >= 0) throw new Error(`IVT prompt does not establish an endpoint sign change: ${prompt}`);
  return `at least one root lies in (${a}, ${b})`;
}

function solveLimitIvtNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const match = /f\(x\) = x² ([+-]) (\d+)\. Compute f\((-?\d+)\)/.exec(prompt);
  if (!match) throw new Error(`unrecognized IVT endpoint-evaluation prompt: ${prompt}`);
  const x = Number(match[3]);
  const constant = (match[1] === '-' ? 1 : -1) * Number(match[2]);
  return x * x - constant;
}

function parseLimitQuadratic(prompt) {
  const match = /f\(x\) = (?:(\d+))?x²(?: ([+-]) (?:(\d+))?x)?(?: ([+-]) (\d+))?/.exec(prompt);
  if (!match) throw new Error(`unrecognized quadratic prompt: ${prompt}`);
  const q = match[1] ? Number(match[1]) : 1;
  const m = match[2] ? (match[2] === '+' ? 1 : -1) * (match[3] ? Number(match[3]) : 1) : 0;
  const c = match[4] ? (match[4] === '+' ? 1 : -1) * Number(match[5]) : 0;
  return { q, m, c };
}

const displayLimitLinear = (coefficient, constant, variable = 'a') => {
  const linear = coefficient === 1 ? variable : `${coefficient}${variable}`;
  return constant === 0 ? linear : `${linear} ${constant < 0 ? '−' : '+'} ${Math.abs(constant)}`;
};

function solveLimitAverageRate(input, asChoice) {
  const prompt = normalizedLimitPrompt(input);
  const { q, m } = parseLimitQuadratic(prompt);
  const interval = /on \[(-?\d+), (-?\d+)\]/.exec(prompt);
  if (!interval) throw new Error(`unrecognized average-rate interval: ${prompt}`);
  const a = Number(interval[1]); const b = Number(interval[2]);
  if (a >= b) throw new Error(`average-rate interval is not increasing: ${prompt}`);
  const answer = q * (a + b) + m;
  return asChoice ? `average rate = ${answer}` : answer;
}

function solveLimitDerivativeMcq(input) {
  const prompt = normalizedLimitPrompt(input);
  const { q, m } = parseLimitQuadratic(prompt);
  const quotient = /simplifies to (\d*)a(?: ([+-]) (\d+))? \+ (\d*)h/.exec(prompt);
  if (!quotient) throw new Error(`unrecognized simplified difference quotient: ${prompt}`);
  const aCoefficient = quotient[1] ? Number(quotient[1]) : 1;
  const constant = quotient[2] ? (quotient[2] === '+' ? 1 : -1) * Number(quotient[3]) : 0;
  const hCoefficient = quotient[4] ? Number(quotient[4]) : 1;
  if (aCoefficient !== 2 * q || constant !== m || hCoefficient !== q) {
    throw new Error(`difference quotient is inconsistent with the printed quadratic: ${prompt}`);
  }
  return `f′(a) = ${displayLimitLinear(2 * q, m)}`;
}

function solveLimitDerivativeNumeric(input) {
  const prompt = normalizedLimitPrompt(input);
  const { q, m } = parseLimitQuadratic(prompt);
  const at = /find f′\((-?\d+)\)/.exec(prompt)?.[1];
  if (at === undefined) throw new Error(`unrecognized derivative evaluation point: ${prompt}`);
  return 2 * q * Number(at) + m;
}

function solveLimitSeries(input, asChoice) {
  const prompt = normalizedLimitPrompt(input);
  const match = /first term (\d+)\/(\d+) and common ratio (\d+)\/(\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized geometric-series prompt: ${prompt}`);
  const aDen = Number(match[2]); const rDen = Number(match[4]);
  if (aDen === 0 || rDen === 0) throw new Error(`geometric-series prompt has a zero denominator: ${prompt}`);
  const first = Number(match[1]) / aDen;
  const ratio = Number(match[3]) / rDen;
  if (Math.abs(ratio) >= 1) throw new Error(`geometric-series prompt does not converge: ${prompt}`);
  const answer = Number((first / (1 - ratio)).toFixed(3));
  return asChoice ? `sum = ${displayLimitNumber(answer)}` : answer;
}
/* ------------------------------------------------------------------------------------------------
 * S331 / lane G1: independent routes for the twelve state-varying g12-trig-identities-equations
 * numeric forms. Answers are re-derived from the printed prompt only — the hidden right-triangle
 * leg by integer search, printed sum/difference products by literal numeric evaluation (never the
 * compression identity), and solution counts/sums either by a half-integer scan of the
 * substituted quadratic or by numeric sign-change root finding on the continuous equation.
 * ------------------------------------------------------------------------------------------------ */
const TI_PI = Math.PI;
function tiHalfUp(x, dp) {
  const scale = Math.pow(10, dp);
  const scaled = x * scale;
  const floor = Math.floor(scaled);
  return (scaled - floor >= 0.5 ? floor + 1 : floor) / scale;
}
function tiLegSearch(hyp, leg) {
  for (let n = 1; n <= 200; n += 1) if (n * n === hyp * hyp - leg * leg) return n;
  throw new Error(`no integer leg for hypotenuse ${hyp} and leg ${leg}`);
}
function tiHypSearch(a, b) {
  for (let n = 1; n <= 200; n += 1) if (n * n === a * a + b * b) return n;
  throw new Error(`no integer hypotenuse for legs ${a} and ${b}`);
}
/** Sign-change root finding for a continuous f on [lo, hi): counts an exact zero at lo, then
 * brackets and bisects every crossing. Returns the roots in order. */
function tiScanRoots(f, lo, hi) {
  const roots = [];
  if (Math.abs(f(lo)) < 1e-9) roots.push(lo);
  const N = 8192;
  const start = lo + 1e-6;
  const end = hi - 1e-6;
  let prevX = start;
  let prevY = f(start);
  for (let i = 1; i <= N; i += 1) {
    const x = start + ((end - start) * i) / N;
    const y = f(x);
    if (prevY === 0) roots.push(prevX);
    else if ((prevY < 0 && y > 0) || (prevY > 0 && y < 0)) {
      let a = prevX; let b = x;
      for (let it = 0; it < 80; it += 1) {
        const m = (a + b) / 2;
        if ((f(a) < 0) === (f(m) < 0)) a = m; else b = m;
      }
      roots.push((a + b) / 2);
    }
    prevX = x;
    prevY = y;
  }
  return roots;
}
/** Parses one side of the small trig-equation grammar these forms print. */
function tiSideEvaluator(text) {
  const side = text.trim();
  if (side === 'sin x cos x') return (x) => Math.sin(x) * Math.cos(x);
  if (side === '2 sin x cos x') return (x) => 2 * Math.sin(x) * Math.cos(x);
  if (side === 'sin x') return (x) => Math.sin(x);
  if (side === 'cos x') return (x) => Math.cos(x);
  if (side === '−sin x') return (x) => -Math.sin(x);
  if (side === '−cos x') return (x) => -Math.cos(x);
  if (side === '1 − sin x') return (x) => 1 - Math.sin(x);
  if (side === '1 − cos x') return (x) => 1 - Math.cos(x);
  if (side === 'sin x − 1') return (x) => Math.sin(x) - 1;
  throw new Error(`unsupported trig-equation side: ${side}`);
}
function tiEquationFn(eqText) {
  const parts = eqText.split(' = ');
  if (parts.length !== 2) throw new Error(`unsupported trig equation: ${eqText}`);
  const lhs = tiSideEvaluator(parts[0]);
  const rhs = tiSideEvaluator(parts[1]);
  return (x) => lhs(x) - rhs(x);
}
/** Half-integer root scan of A·v² + B·v + C = 0 over v = k/2, k ∈ [−6, 6] (integer arithmetic). */
function tiHalfIntegerRoots(A, B, C) {
  const roots = [];
  for (let k = -6; k <= 6; k += 1) {
    if (A * k * k + 2 * B * k + 4 * C === 0) roots.push(k / 2);
  }
  return roots;
}
function tiSolveTrigIdentities(form, input) {
  const prompt = String(input).split('||', 1)[0].trim();
  let m;
  if (form === 'trig-identities-equations__ti-double-basic__numeric') {
    m = prompt.match(/^θ is (acute|in Quadrant II) with sin θ = (\d+)\/(\d+)\. (?:What is (cos 2θ|sin 2θ), to four decimals\?|Find tan 2θ, to four decimals\.)$/);
    if (m) {
      const o = Number(m[2]);
      const c = Number(m[3]);
      const adj = tiLegSearch(c, o);
      if (m[4] === 'cos 2θ') return tiHalfUp((adj * adj - o * o) / (c * c), 4);
      if (m[4] === 'sin 2θ') return tiHalfUp((-2 * o * adj) / (c * c), 4);
      return tiHalfUp((2 * o * adj) / (adj * adj - o * o), 4);
    }
  }
  if (form === 'trig-identities-equations__ti-cos2-forms__numeric') {
    m = prompt.match(/^With sin θ = ([\d.]+), use 1 − 2sin²θ/);
    if (m) return tiHalfUp(1 - 2 * Number(m[1]) * Number(m[1]), 4);
    m = prompt.match(/^Use sin²θ = \(1 − cos 2θ\)\/2 to find sin²\((π\/6|π\/3)\)\.$/);
    if (m) {
      const x = m[1] === 'π/6' ? TI_PI / 6 : TI_PI / 3;
      return tiHalfUp((1 - Math.cos(2 * x)) / 2, 4);
    }
    m = prompt.match(/^θ has cos θ = 1\/(\d+)\. Find cos 2θ/);
    if (m) return tiHalfUp(2 / (Number(m[1]) * Number(m[1])) - 1, 4);
  }
  if (form === 'trig-identities-equations__ti-convert-solve__numeric') {
    m = prompt.match(/^(How many solutions does|Sum the solutions of) 2cos²x ([+−]) (\d*)sin x(?: ([+−]) (\d+))? = 0/);
    if (m) {
      const b = (m[2] === '−' ? -1 : 1) * (m[3] === '' ? 1 : Number(m[3]));
      const c = m[4] ? (m[4] === '−' ? -1 : 1) * Number(m[5]) : 0;
      // 2cos²x + b sin x + c = 0  ⇒  −2s² + b s + (2 + c) = 0 in s = sin x.
      const roots = tiHalfIntegerRoots(-2, b, 2 + c);
      if (m[1].startsWith('How many')) {
        let count = 0;
        for (const s of roots) count += Math.abs(s) < 1 ? 2 : Math.abs(s) === 1 ? 1 : 0;
        return count;
      }
      let sum = 0;
      for (const s of roots) {
        if (s > 0 && s < 1) sum += TI_PI;
        else if (s > -1 && s < 0) sum += 3 * TI_PI;
        else if (s === 1) sum += TI_PI / 2;
        else if (s === -1) sum += (3 * TI_PI) / 2;
      }
      return tiHalfUp(sum, 4);
    }
  }
  if (form === 'trig-identities-equations__ti-root-traps__numeric') {
    m = prompt.match(/^After rejecting the extraneous root, how many valid solutions does (.+) have on \[0, 2π\)\?$/)
      || prompt.match(/^Solve (.+) on \[0, 2π\) by FACTORING\. How many distinct solutions\?$/);
    if (m) return tiScanRoots(tiEquationFn(m[1]), 0, 2 * TI_PI).length;
    m = prompt.match(/^Solve (.+) on \[0, 2π\) by factoring\. Sum the solutions, to four decimals\.$/);
    if (m) return tiHalfUp(tiScanRoots(tiEquationFn(m[1]), 0, 2 * TI_PI).reduce((a, b) => a + b, 0), 4);
  }
  if (form === 'trig-identities-equations__ti-general__numeric') {
    m = prompt.match(/^How many solutions does (sin|cos) x = 1\/2 have on \[0, (\d+)π\)\?$/);
    if (m) {
      const fn = m[1] === 'sin' ? Math.sin : Math.cos;
      return tiScanRoots((x) => fn(x) - 0.5, 0, Number(m[2]) * TI_PI).length;
    }
    m = prompt.match(/^Sum the solutions of (sin|cos) x = 1\/2 that lie in \[(\d+)π, (\d+)π\), to hundredths\.$/);
    if (m) {
      const fn = m[1] === 'sin' ? Math.sin : Math.cos;
      const roots = tiScanRoots((x) => fn(x) - 0.5, Number(m[2]) * TI_PI, Number(m[3]) * TI_PI);
      return tiHalfUp(roots.reduce((a, b) => a + b, 0), 2);
    }
  }
  if (form === 'trig-identities-equations__ti-tan-ladder__numeric') {
    m = prompt.match(/^How many solutions does tan x = (−?1) have on \[0, (\d+)π\)\?$/);
    if (m) {
      const c = m[1] === '−1' ? -1 : 1;
      // tan x = c ⇔ sin x − c·cos x = 0, which stays continuous across tangent's asymptotes.
      return tiScanRoots((x) => Math.sin(x) - c * Math.cos(x), 0, Number(m[2]) * TI_PI).length;
    }
    m = prompt.match(/^Sum the solutions of tan x = (−?1) on \[0, (\d+)π\), to hundredths\.$/);
    if (m) {
      const c = m[1] === '−1' ? -1 : 1;
      const roots = tiScanRoots((x) => Math.sin(x) - c * Math.cos(x), 0, Number(m[2]) * TI_PI);
      return tiHalfUp(roots.reduce((a, b) => a + b, 0), 2);
    }
  }
  if (form === 'trig-identities-equations__ti-reciprocals__numeric') {
    m = prompt.match(/^sin θ = (\d+)\/(\d+) and cos θ = (\d+)\/(\d+)\. What is (cot|sec|csc) θ\?/);
    if (m) {
      const sinV = Number(m[1]) / Number(m[2]);
      const cosV = Number(m[3]) / Number(m[4]);
      const value = m[5] === 'cot' ? cosV / sinV : m[5] === 'sec' ? 1 / cosV : 1 / sinV;
      return tiHalfUp(value, 2);
    }
    m = prompt.match(/^Simplify (?:tan θ · cot θ|sin θ · csc θ|cos θ · sec θ) \+ (cos|sin) θ, then evaluate at θ = (0|π\/6|π\/3)\./);
    if (m) {
      const x = m[2] === '0' ? 0 : m[2] === 'π/6' ? TI_PI / 6 : TI_PI / 3;
      const g = m[1] === 'cos' ? Math.cos(x) : Math.sin(x);
      return tiHalfUp(1 + tiHalfUp(g, 2), 2);
    }
  }
  if (form === 'trig-identities-equations__ti-pythagorean__numeric') {
    m = prompt.match(/^θ is acute with tan θ = (\d+)\/(\d+)\. What is (sec|csc) θ, to four decimals\?$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      const c = tiHypSearch(a, b);
      return tiHalfUp(m[3] === 'sec' ? c / b : c / a, 4);
    }
    m = prompt.match(/^Simplify \(1 − (cos|sin)²θ\)·(?:sec|csc)²θ to a single function, then evaluate at θ = (π\/6|π\/3), to four decimals\.$/);
    if (m) {
      const x = m[2] === 'π/6' ? TI_PI / 6 : TI_PI / 3;
      const t = Math.tan(x) * Math.tan(x);
      return tiHalfUp(m[1] === 'cos' ? t : 1 / t, 4);
    }
  }
  if (form === 'trig-identities-equations__ti-prove__numeric') {
    m = prompt.match(/^Check \(sec²θ − 1\)\/tan θ = tan θ at θ = (π\/6|π\/3)/);
    if (m) {
      const x = m[1] === 'π/6' ? TI_PI / 6 : TI_PI / 3;
      const sec2 = 1 / (Math.cos(x) * Math.cos(x));
      return tiHalfUp((sec2 - 1) / Math.tan(x), 2);
    }
    m = prompt.match(/^Prove cot θ · sin θ = cos θ, then evaluate the common value at θ = (π\/6|π\/3)/);
    if (m) {
      const x = m[1] === 'π/6' ? TI_PI / 6 : TI_PI / 3;
      return tiHalfUp((Math.cos(x) / Math.sin(x)) * Math.sin(x), 2);
    }
    m = prompt.match(/^Verify \(1 − cos²θ\)\/sin θ = sin θ at θ = (π\/6|π\/3)/);
    if (m) {
      const x = m[1] === 'π/6' ? TI_PI / 6 : TI_PI / 3;
      return tiHalfUp((1 - Math.cos(x) * Math.cos(x)) / Math.sin(x), 2);
    }
  }
  if (form === 'trig-identities-equations__ti-apply-sum-diff__numeric') {
    m = prompt.match(/^Evaluate (cos|sin) (\d+)° (cos|sin) (\d+)° ([+−]) (cos|sin) (\d+)° (cos|sin) (\d+)°, to four decimals\.$/);
    if (m) {
      const DEG = TI_PI / 180;
      const term = (fn, deg) => (fn === 'cos' ? Math.cos(deg * DEG) : Math.sin(deg * DEG));
      const first = term(m[1], Number(m[2])) * term(m[3], Number(m[4]));
      const second = term(m[6], Number(m[7])) * term(m[8], Number(m[9]));
      return tiHalfUp(first + (m[5] === '−' ? -second : second), 4);
    }
  }
  if (form === 'trig-identities-equations__ti-tan-cofunction__numeric') {
    m = prompt.match(/^Evaluate tan (\d+)° to three decimals\.$/);
    if (m) return tiHalfUp(Math.tan((Number(m[1]) * TI_PI) / 180), 3);
  }
  if (form === 'trig-identities-equations__ti-double-action__numeric') {
    m = prompt.match(/^Solve (cos 2x = cos x|cos 2x = sin x|cos 2x = −cos x|sin 2x = sin x|sin 2x = cos x) on \[0, 2π\)\. (What is the SUM of the solutions, to hundredths\?|How many solutions are there\?)$/);
    if (m) {
      const eq = m[1];
      const wantSum = m[2].startsWith('What');
      if (eq.startsWith('cos 2x')) {
        // Substitute the double angle into the matching single-trig variable and scan halves.
        let roots;
        let variable;
        if (eq === 'cos 2x = cos x') { roots = tiHalfIntegerRoots(2, -1, -1); variable = 'cos'; }
        else if (eq === 'cos 2x = −cos x') { roots = tiHalfIntegerRoots(2, 1, -1); variable = 'cos'; }
        else { roots = tiHalfIntegerRoots(2, 1, -1); variable = 'sin'; }
        let count = 0;
        let sum = 0;
        for (const v of roots) {
          if (Math.abs(v) > 1) continue;
          if (variable === 'cos') {
            if (v === 1) { count += 1; sum += 0; }
            else if (v === -1) { count += 1; sum += TI_PI; }
            else { count += 2; sum += 2 * TI_PI; }
          } else if (v === 1) { count += 1; sum += TI_PI / 2; }
          else if (v === -1) { count += 1; sum += (3 * TI_PI) / 2; }
          else if (v > 0) { count += 2; sum += TI_PI; }
          else { count += 2; sum += 3 * TI_PI; }
        }
        return wantSum ? tiHalfUp(sum, 2) : count;
      }
      const f = eq === 'sin 2x = sin x'
        ? (x) => Math.sin(2 * x) - Math.sin(x)
        : (x) => Math.sin(2 * x) - Math.cos(x);
      const roots = tiScanRoots(f, 0, 2 * TI_PI);
      return wantSum ? tiHalfUp(roots.reduce((a, b) => a + b, 0), 2) : roots.length;
    }
  }
  return undefined;
}

/* S331 / lane G1: independent routes for the thirteen state-varying g12-trig-graphs-inverses
 * numeric forms — literal evaluation of the printed function, integer search for hidden triangle
 * sides, and count-by-walking for tangent's asymptote windows. */
function tgPiFraction(text) {
  const m = String(text).trim().match(/^(−?)(\d*)π(?:\/(\d+))?$/);
  if (!m) {
    if (/^−?[\d.]+$/.test(String(text).trim())) return Number(String(text).trim().replace('−', '-'));
    throw new Error(`unparseable angle: ${text}`);
  }
  const sign = m[1] === '−' ? -1 : 1;
  const num = m[2] === '' ? 1 : Number(m[2]);
  const den = m[3] ? Number(m[3]) : 1;
  return (sign * num * Math.PI) / den;
}
function tgSolve(form, input) {
  const prompt = String(input).split('||', 1)[0].trim();
  let m;
  const signed = (s, v) => (s === '−' ? -v : v);
  if (form === 'trig-graphs-inverses__tg-four-dials__numeric') {
    m = prompt.match(/^y = (\d+) sin x ([+−]) (\d+)\. What is the (MAXIMUM|MINIMUM) value\?$/);
    if (m) {
      const A = Number(m[1]);
      const D = signed(m[2], Number(m[3]));
      return m[4] === 'MAXIMUM' ? D + A : D - A;
    }
    m = prompt.match(/^A sinusoid oscillates between a max of (\d+) and a min of (\d+)\. What is its midline D\?$/);
    if (m) return (Number(m[1]) + Number(m[2])) / 2;
    m = prompt.match(/period (\d+)π, and a rising midline-crossing.*what is B\?/);
    if (m) return tiHalfUp(2 / Number(m[1]), 2);
  }
  if (form === 'trig-graphs-inverses__tg-five-points__numeric') {
    m = prompt.match(/^y = (\d+) sin x ([+−]) (\d+)\. What is y at its first trough/);
    if (m) return signed(m[2], Number(m[3])) - Number(m[1]);
    m = prompt.match(/^y = −(\d+) sin x \+ (\d+)\. What is y one quarter-period after x = 0\?$/);
    if (m) return Number(m[2]) - Number(m[1]);
    m = prompt.match(/^y = (\d+) sin\(\d+\(x − π\/\d+\)\) \+ (\d+)\. What is the y-VALUE at its first peak/);
    if (m) return Number(m[2]) + Number(m[1]);
  }
  if (form === 'trig-graphs-inverses__tg-cos-graph__numeric') {
    m = prompt.match(/^y = (\d+) cos x \+ (\d+)\. What is y at x = π\?$/);
    if (m) return Number(m[1]) * Math.cos(Math.PI) + Number(m[2]);
    m = prompt.match(/^y = (\d+) cos\(\d+x\) ([+−]) (\d+)\. What is the y-value at its FIRST trough/);
    if (m) return signed(m[2], Number(m[3])) - Number(m[1]);
    m = prompt.match(/^A wave peaks at \(0, (\d+)\), has min (\d+), and period (π|2π)\. What is its y-value at x = (π\/2|π)\?$/);
    if (m) {
      const period = tgPiFraction(m[3]);
      const at = tgPiFraction(m[4]);
      if (Math.abs(at - period / 2) > 1e-9) throw new Error(`cosine-wave prompt asks off the half-period: ${prompt}`);
      return Number(m[2]);
    }
  }
  if (form === 'trig-graphs-inverses__tg-mixed-comp__numeric') {
    m = prompt.match(/^What is cos\(arcsin\((\d+)\/(\d+)\)\), to two decimals\?$/);
    if (m) {
      const b = tiLegSearch(Number(m[2]), Number(m[1]));
      return tiHalfUp(b / Number(m[2]), 4);
    }
    m = prompt.match(/^What is tan\(arccos\((\d+)\/(\d+)\)\), to two decimals\?$/);
    if (m) {
      const a = tiLegSearch(Number(m[2]), Number(m[1]));
      return tiHalfUp(a / Number(m[1]), 4);
    }
    m = prompt.match(/^What is sin\(arctan\((\d+)\/(\d+)\)\), to two decimals\?$/);
    if (m) {
      const c = tiHypSearch(Number(m[1]), Number(m[2]));
      return tiHalfUp(Number(m[1]) / c, 4);
    }
  }
  if (form === 'trig-graphs-inverses__tg-phase__numeric') {
    m = prompt.match(/^y = (\d+) sin\((\d+)x − (π\/\d+)\)\. What is y at x = ([^?]+)\?$/);
    if (m) return Number(m[1]) * Math.sin(Number(m[2]) * tgPiFraction(m[4]) - tgPiFraction(m[3]));
    m = prompt.match(/^y = sin\((\d+)x \+ π\/(\d+)\) is shifted LEFT by π\/n\. What is n\?$/);
    if (m) return Number(m[1]) * Number(m[2]);
  }
  if (form === 'trig-graphs-inverses__tg-tan-shape__numeric') {
    m = prompt.match(/^What is tan\(([^)]+)\)\?$/);
    if (m) return Math.round(Math.tan(tgPiFraction(m[1])));
    m = prompt.match(/^How many vertical asymptotes does tan x have strictly between 0 and (\d+)π\?$/);
    if (m) {
      let count = 0;
      for (let wall = Math.PI / 2; wall < Number(m[1]) * Math.PI - 1e-9; wall += Math.PI) count += 1;
      return count;
    }
  }
  if (form === 'trig-graphs-inverses__tg-tan-transform__numeric') {
    m = prompt.match(/^y = (\d+) tan\((\d+)x\)\. What is y at x = (π\/\d+)\?$/);
    if (m) return Number(m[1]) * Math.tan(Number(m[2]) * tgPiFraction(m[3]));
    m = prompt.match(/^The first positive wall of y = tan\(x − π\/(\d+)\) is at x = (\d+)π\/n\. What is n\?$/);
    if (m) {
      const wall = Math.PI / 2 + Math.PI / Number(m[1]);
      const n = Math.round((Number(m[2]) * Math.PI) / wall);
      if (Math.abs((Number(m[2]) * Math.PI) / n - wall) > 1e-9) throw new Error(`tangent wall does not reduce to ${m[2]}π/n: ${prompt}`);
      return n;
    }
  }
  if (form === 'trig-graphs-inverses__tg-cos-sin__numeric') {
    m = prompt.match(/^y = (\d+) sin\(x \+ π\/2\) and y = \d+ cos x claim to be the same wave\. What do BOTH give at x = (0|π)\?$/);
    if (m) return Math.round(Number(m[1]) * Math.cos(m[2] === '0' ? 0 : Math.PI));
  }
  if (form === 'trig-graphs-inverses__tg-tan-values__numeric') {
    m = prompt.match(/^What is tan\(([^)]+)\), to hundredths\?$/);
    if (m) return tiHalfUp(Math.tan(tgPiFraction(m[1])), 2);
  }
  if (form === 'trig-graphs-inverses__tg-arcsin__numeric') {
    m = prompt.match(/^arcsin\((1|1\/2|√2\/2|√3\/2)\) = π\/n\. What is n\?$/);
    if (m) {
      const v = m[1] === '1' ? 1 : m[1] === '1/2' ? 0.5 : m[1] === '√2/2' ? Math.SQRT2 / 2 : Math.sqrt(3) / 2;
      const n = Math.round(Math.PI / Math.asin(v));
      if (Math.abs(Math.sin(Math.PI / n) - v) > 1e-9) throw new Error(`arcsin prompt has no clean π/n answer: ${prompt}`);
      return n;
    }
  }
  if (form === 'trig-graphs-inverses__tg-arccos__numeric') {
    m = prompt.match(/^arctan\((−?)(1|√3|1\/√3)\) = (−?)π\/n\. What is n\?$/);
    if (m) {
      const base = m[2] === '1' ? 1 : m[2] === '√3' ? Math.sqrt(3) : 1 / Math.sqrt(3);
      const v = m[1] === '−' ? -base : base;
      if ((m[1] === '−') !== (m[3] === '−')) throw new Error(`arctan prompt mixes signs: ${prompt}`);
      const n = Math.round(Math.PI / Math.abs(Math.atan(v)));
      if (Math.abs(Math.tan(Math.PI / n) - base) > 1e-9) throw new Error(`arctan prompt has no clean π/n answer: ${prompt}`);
      return n;
    }
  }
  if (form === 'trig-graphs-inverses__tg-inverse-graphs__numeric') {
    m = prompt.match(/^What is arccos\((−?1|0|−?1\/2)\), to hundredths\?$/);
    if (m) {
      const v = m[1] === '1' ? 1 : m[1] === '−1' ? -1 : m[1] === '0' ? 0 : m[1] === '1/2' ? 0.5 : -0.5;
      return tiHalfUp(Math.acos(v), 2);
    }
  }
  if (form === 'trig-graphs-inverses__tg-composition-trap__numeric') {
    m = prompt.match(/^What is arcsin\(sin\((−?[\d.]+)\)\)\? \(−?[\d.]+ radians\.\)$/);
    if (m) return Math.asin(Math.sin(Number(m[1].replace('−', '-'))));
  }
  return undefined;
}

/* S331 / lane G1: independent routes for the ten state-varying g12-vectors-matrices numeric
 * forms. Every answer is re-derived from the printed components — integer search against the
 * squares for exact magnitudes, brute-force integer search for systems, atan2 for directions. */
function vecSolve(form, input) {
  const prompt = String(input).split('||', 1)[0].replace(/−/g, '-').trim();
  let m;
  const N = Number;
  if (form === 'vectors-matrices__vec-direction__numeric') {
    m = prompt.match(/^A vector has magnitude (\d+) and direction (\d+)°\. What is its ([xy])-component, to two decimals\?$/);
    if (m) {
      const rad = (N(m[2]) * Math.PI) / 180;
      return tiHalfUp(N(m[1]) * (m[3] === 'x' ? Math.cos(rad) : Math.sin(rad)), 2);
    }
    m = prompt.match(/^The direction angle of v = ⟨(-?\d+), (-?\d+)⟩, in \[0°, 360°\), is how many degrees\?$/);
    if (m) {
      const deg = (Math.atan2(N(m[2]), N(m[1])) * 180) / Math.PI;
      return Math.round((deg + 360) % 360);
    }
  }
  if (form === 'vectors-matrices__vec-scalar__numeric') {
    m = prompt.match(/^\|⟨(\d+), -(\d+)⟩\| = √\d+\. What is \|(\d+)⟨\d+, -\d+⟩\|\?/);
    if (m) return tiHalfUp(N(m[3]) * Math.sqrt(N(m[1]) ** 2 + N(m[2]) ** 2), 2);
    m = prompt.match(/^What is the x-component of the unit vector along ⟨(\d+), (\d+)⟩, to two decimals\?$/);
    if (m) {
      const c = tiHypSearch(N(m[1]), N(m[2]));
      return tiHalfUp(N(m[1]) / c, 2);
    }
    m = prompt.match(/^Find the magnitude of (\d+)⟨(-?\d+), (-?\d+)⟩ \+ ⟨(-?\d+), (-?\d+)⟩, to two decimals\.$/);
    if (m) return tiHalfUp(Math.hypot(N(m[1]) * N(m[2]) + N(m[4]), N(m[1]) * N(m[3]) + N(m[5])), 2);
  }
  if (form === 'vectors-matrices__vec-dot__numeric') {
    m = prompt.match(/^What is ⟨(-?\d+), (-?\d+)⟩ · ⟨(-?\d+), (-?\d+)⟩\?/);
    if (m) return N(m[1]) * N(m[3]) + N(m[2]) * N(m[4]);
  }
  if (form === 'vectors-matrices__vec-determinant__numeric') {
    m = prompt.match(/^What is the determinant of \[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\]\?$/);
    if (m) return N(m[1]) * N(m[4]) - N(m[2]) * N(m[3]);
    m = prompt.match(/^The inverse of \[\[(\d+), 0\], \[0, (\d+)\]\] has what top-left entry\?/);
    if (m) return tiHalfUp(1 / N(m[1]), 2);
    m = prompt.match(/^The inverse of \[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\] has what top-left entry\?$/);
    if (m) {
      const det = N(m[1]) * N(m[4]) - N(m[2]) * N(m[3]);
      return tiHalfUp(N(m[4]) / det, 2);
    }
  }
  if (form === 'vectors-matrices__vec-solve-systems__numeric') {
    m = prompt.match(/^Solve the system (\d*)x \+ (\d*)y = (\d+), (\d*)x \+ (\d*)y = (\d+) for ([xy])\.$/);
    if (m) {
      const [a1, b1, c1, a2, b2, c2] = [m[1], m[2], m[3], m[4], m[5], m[6]].map((t) => (t === '' ? 1 : N(t)));
      for (let x = -50; x <= 50; x += 1) {
        for (let y = -50; y <= 50; y += 1) {
          if (a1 * x + b1 * y === c1 && a2 * x + b2 * y === c2) return m[7] === 'x' ? x : y;
        }
      }
      throw new Error(`system has no small integer solution: ${prompt}`);
    }
  }
  if (form === 'vectors-matrices__vec-add__numeric') {
    m = prompt.match(/^What is the magnitude of ⟨(-?\d+), (-?\d+)⟩ \+ ⟨(-?\d+), (-?\d+)⟩\?$/);
    if (m) return tiHypSearch(Math.abs(N(m[1]) + N(m[3])) || tiHypZeroGuard(), Math.abs(N(m[2]) + N(m[4])));
    m = prompt.match(/^Two forces ⟨(\d+), 0⟩ N and ⟨0, (\d+)⟩ N act on a point\. What is the magnitude of the resultant, in newtons\?$/);
    if (m) return tiHypSearch(N(m[1]), N(m[2]));
  }
  if (form === 'vectors-matrices__vec-applications__numeric') {
    m = prompt.match(/^A boat's velocity ⟨0, (\d+)⟩ m\/s combines with a current ⟨(\d+), 0⟩ m\/s\. What is the resulting speed, in m\/s\?$/);
    if (m) return tiHypSearch(N(m[1]), N(m[2]));
    m = prompt.match(/^Forces ⟨(-?\d+), (-?\d+)⟩ and ⟨(-?\d+), (-?\d+)⟩ act on a point\. What magnitude of third force balances them\?/);
    if (m) return tiHalfUp(Math.hypot(N(m[1]) + N(m[3]), N(m[2]) + N(m[4])), 2);
  }
  if (form === 'vectors-matrices__vec-matrix-arith__numeric') {
    m = prompt.match(/^What is the bottom-right entry of (\d+)·\[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\]\?$/);
    if (m) return N(m[1]) * N(m[5]);
    m = prompt.match(/^Compute \[\[(-?\d+), (-?\d+)\], \[(-?\d+), (-?\d+)\]\]·⟨(-?\d+), (-?\d+)⟩ and enter the x-component\.$/);
    if (m) return N(m[1]) * N(m[5]) + N(m[2]) * N(m[6]);
  }
  if (form === 'vectors-matrices__vec-rotation__numeric') {
    m = prompt.match(/^⟨(\d+), (\d+)⟩ has magnitude √\d+ ≈ [\d.]+\. After a 90° rotation to ⟨-\d+, \d+⟩, its magnitude is what, to two decimals\?$/);
    if (m) return tiHalfUp(Math.sqrt(N(m[1]) ** 2 + N(m[2]) ** 2), 2);
    m = prompt.match(/^Rotate ⟨(-?\d+), (-?\d+)⟩ by 90° CCW and enter the resulting ([xy])-component\.$/);
    if (m) return m[3] === 'x' ? -N(m[2]) : N(m[1]);
  }
  if (form === 'vectors-matrices__vec-components__numeric') {
    m = prompt.match(/^What is the magnitude of v = ⟨(-?\d+), (-?\d+)⟩\?$/);
    if (m) return tiHypSearch(Math.abs(N(m[1])), Math.abs(N(m[2])));
  }
  return undefined;
}
function tiHypZeroGuard() {
  throw new Error('vector sum collapsed to a zero component where a positive leg was expected');
}

/* S331 / lane G1: independent routes for the fifteen state-varying g12-polar-parametric forms.
 * Conversions are evaluated literally from the printed r and θ; complex powers by repeated
 * multiplication of the printed base (never De Moivre); landings by integer search. */
function ppFraction(text) {
  const t = String(text).trim();
  const m = t.match(/^(\d*)π(?:\/(\d+))?$/);
  if (!m) throw new Error(`unparseable π-fraction: ${text}`);
  return ((m[1] === '' ? 1 : Number(m[1])) * Math.PI) / (m[2] ? Number(m[2]) : 1);
}
function ppSolve(form, input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const ascii = prompt.replace(/−/g, '-');
  let m;
  const N = Number;
  if (form === 'polar-parametric__pp-parabolic-path__numeric') {
    m = ascii.match(/^From the path y = \((\d+)\/(\d+)\)x - x²\/(\d+), the ball lands/);
    if (m) {
      const [p, q, D] = [N(m[1]), N(m[2]), N(m[3])];
      for (let x = 1; x <= 5000; x += 1) if (q * x === p * D) return x;
      throw new Error(`no integer landing point: ${prompt}`);
    }
    m = ascii.match(/landing \(x = (\d+)\)\. At what x\?/);
    if (m) return N(m[1]) / 2;
    m = ascii.match(/^A ball launches with vₓ = \d+, v_y = (\d+), g = 10\. What is its maximum height\?/);
    if (m) return (N(m[1]) * N(m[1])) / 20;
  }
  if (form === 'polar-parametric__pp-to-rect__numeric') {
    m = prompt.match(/^For the polar point \((\d+), ([^)]+)\), what is ([xy])\? \(To four decimals\.\)$/);
    if (m) {
      const th = ppFraction(m[2]);
      return tiHalfUp(N(m[1]) * (m[3] === 'x' ? Math.cos(th) : Math.sin(th)), 4);
    }
    m = prompt.match(/^Convert \((\d+), ([^)]+)\) to rectangular and report x \+ y, to four decimals\.$/);
    if (m) {
      const th = ppFraction(m[2]);
      return tiHalfUp(N(m[1]) * (Math.cos(th) + Math.sin(th)), 4);
    }
  }
  if (form === 'polar-parametric__pp-roses__numeric') {
    m = prompt.match(/^How many petals does r = (\d+) (?:sin|cos)\((\d+)θ\) have\?$/);
    if (m) return N(m[2]) % 2 === 0 ? 2 * N(m[2]) : N(m[2]);
    m = prompt.match(/^How long is each petal of r = (\d+) (?:sin|cos)\((\d+)θ\)\?$/);
    if (m) return N(m[1]);
    m = prompt.match(/^For r = (\d+) (?:sin|cos)\((\d+)θ\), compute \(number of petals\) × \(petal length\)\.$/);
    if (m) {
      const petals = N(m[2]) % 2 === 0 ? 2 * N(m[2]) : N(m[2]);
      return petals * N(m[1]);
    }
  }
  if (form === 'polar-parametric__pp-limacons__numeric') {
    m = prompt.match(/^What is the (maximum|minimum) value of r for r = (\d+) \+ (\d+) (?:sin|cos) θ\?$/);
    if (m) return m[1] === 'maximum' ? N(m[2]) + N(m[3]) : N(m[2]) - N(m[3]);
  }
  if (form === 'polar-parametric__pp-de-moivre__numeric') {
    m = prompt.match(/^Two complex numbers have arguments (\d+)° and (\d+)°\. Their product has what argument, in degrees\?$/);
    if (m) return N(m[1]) + N(m[2]);
    m = ascii.match(/^Use De Moivre to find \((1 (\+|-) i(√3)?)\)([⁴⁸³⁶])\./);
    if (m) {
      const baseIm = (m[2] === '-' ? -1 : 1) * (m[3] ? Math.sqrt(3) : 1);
      const power = m[4] === '³' ? 3 : m[4] === '⁴' ? 4 : m[4] === '⁶' ? 6 : 8;
      // Repeated complex multiplication — deliberately NOT the modulus-argument shortcut.
      let outRe = 1;
      let outIm = 0;
      for (let k = 0; k < power; k += 1) {
        const nextRe = outRe * 1 - outIm * baseIm;
        const nextIm = outRe * baseIm + outIm * 1;
        outRe = nextRe;
        outIm = nextIm;
      }
      if (Math.abs(outIm) > 1e-6) throw new Error(`power did not land on the real axis: ${prompt}`);
      return Math.round(outRe);
    }
  }
  if (form === 'polar-parametric__pp-projectile__numeric') {
    m = ascii.match(/^With v_y = (\d+) m\/s and g = 10, use y = v_y·t - ½g t² to find the height at t = (\d+) s\.$/);
    if (m) return N(m[1]) * N(m[2]) - 5 * N(m[2]) * N(m[2]);
    m = ascii.match(/^A ball has vₓ = \d+, v_y = (\d+) \(g = 10\)\. What is its height y at t = (\d+) s\?$/);
    if (m) return N(m[1]) * N(m[2]) - 5 * N(m[2]) * N(m[2]);
  }
  if (form === 'polar-parametric__pp-polar-system__pointEntry') {
    m = prompt.match(/^Where is the polar point \((\d+), ([^)]+)\) in rectangular coordinates\?$/);
    if (m) {
      const th = ppFraction(m[2]);
      // `|| 0` normalizes the −0 that Math.round produces from a −6e-17 cosine.
      return [Math.round(N(m[1]) * Math.cos(th)) || 0, Math.round(N(m[1]) * Math.sin(th)) || 0];
    }
  }
  if (form === 'polar-parametric__pp-circles__pointEntry') {
    m = prompt.match(/^Where is the center of the circle r = (\d+) (sin|cos) θ\?$/);
    if (m) {
      const a = N(m[1]) / 2;
      return m[2] === 'sin' ? [0, a] : [a, 0];
    }
  }
  if (form === 'polar-parametric__pp-circles__numeric') {
    m = prompt.match(/^What is the radius of the circle r = (\d+) (?:sin|cos) θ\?$/);
    if (m) return N(m[1]) / 2;
  }
  if (form === 'polar-parametric__pp-polar-form__numeric') {
    m = ascii.match(/^The argument of z = (-?)(√3|1)? ?(-|\+) ?i(√3)?/);
    if (m) {
      const x = (m[1] === '-' ? -1 : 1) * (m[2] === '√3' ? Math.sqrt(3) : 1);
      const y = (m[3] === '-' ? -1 : 1) * (m[4] ? Math.sqrt(3) : 1);
      const arg = (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);
      return tiHalfUp(arg, 2);
    }
  }
  if (form === 'polar-parametric__pp-nth-roots__numeric') {
    m = prompt.match(/^The principal \(k = 0\) square root of (\d*)i has what real part\? \(To four decimals\.\)$/);
    if (m) {
      const mod = m[1] === '' ? 1 : N(m[1]);
      // Verify by squaring: (a + ai)² should reproduce mod·i with a = √(mod)/√2.
      const a = Math.sqrt(mod) * Math.SQRT2 / 2;
      const sqIm = 2 * a * a;
      if (Math.abs(sqIm - mod) > 1e-9) throw new Error(`square-root check failed: ${prompt}`);
      return tiHalfUp(a, 4);
    }
  }
  if (form === 'polar-parametric__pp-parametric__numeric' || form === 'polar-parametric__pp-parametrize__numeric') {
    m = prompt.match(/^For (?:the circle )?x = (\d+)cos t, y = (\d+)sin t, what is the ([xy])-coordinate at t = ([^?]+)\?$/);
    if (m) {
      const t = ppFraction(m[4]);
      return Math.round((m[3] === 'x' ? N(m[1]) * Math.cos(t) : N(m[2]) * Math.sin(t)) * 1e9) / 1e9;
    }
  }
  if (form === 'polar-parametric__pp-eliminate__numeric') {
    m = prompt.match(/^Eliminate t from x = t([²³]), y = t to get x = y[²³]\. What is x when y = (\d+)\?$/);
    if (m) return m[1] === '²' ? N(m[2]) ** 2 : N(m[2]) ** 3;
  }
  if (form === 'polar-parametric__pp-parametrize__pointEntry') {
    m = prompt.match(/^For x = (\d*)cos t, y = −(\d*)sin t, where is the point at t = ([^?]+)\?$/);
    if (m) {
      const c = m[1] === '' ? 1 : N(m[1]);
      const t = ppFraction(m[3]);
      return [Math.round(c * Math.cos(t)) || 0, Math.round(-c * Math.sin(t)) || 0];
    }
  }
  return undefined;
}

/* S331 / lane G1: independent routes for the nine state-varying g12-polynomial-rational-analysis
 * numeric forms — brute-force integer search for zeros and inequality counts, own divisor
 * enumeration for candidate lists, literal evaluation for coefficients and substitutions. */
function praParseCubic(text) {
  // "x³ − 6x² + 11x − 6" (ASCII minus after normalization) → [1, -6, 11, -6]
  const t = text.replace(/−/g, '-').replace(/\s+/g, '');
  const m = t.match(/^x³([+-]\d+)x²([+-]\d*)x([+-]\d+)$/);
  if (!m) throw new Error(`unparseable monic cubic: ${text}`);
  const middle = m[2] === '+' || m[2] === '-' ? `${m[2]}1` : m[2];
  return [1, Number(m[1]), Number(middle), Number(m[3])];
}
function praSolve(form, input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const ascii = prompt.replace(/−/g, '-');
  let m;
  const N = Number;
  if (form === 'polynomial-rational-analysis__pra-rrt-list__numeric') {
    m = ascii.match(/\(constant (-?\d+), leading (\d+)\)\. How many DISTINCT rational-root candidates/);
    if (m) {
      const constant = Math.abs(N(m[1]));
      const lead = N(m[2]);
      const values = new Set();
      for (let p = 1; p <= constant; p += 1) {
        if (constant % p !== 0) continue;
        for (let q = 1; q <= lead; q += 1) {
          if (lead % q !== 0) continue;
          values.add(p / q);
          values.add(-p / q);
        }
      }
      return values.size;
    }
  }
  if (form === 'polynomial-rational-analysis__pra-fta-count__numeric') {
    m = ascii.match(/^[fg]\(x\) = (.+)\. (Counting multiplicity, how many zeros|How many DISTINCT zeros)/);
    if (m) {
      const exps = [...m[1].matchAll(/\(x [+-] \d+\)([²³])?/g)].map((g) => (g[1] === '²' ? 2 : g[1] === '³' ? 3 : 1));
      if (exps.length === 0) throw new Error(`no factors parsed: ${prompt}`);
      return m[2].startsWith('Counting') ? exps.reduce((s, e) => s + e, 0) : exps.length;
    }
    m = ascii.match(/^A degree-(\d+) polynomial's graph crosses the x-axis exactly (once|\d+ times) \(simple crossings\)\. How many NON-REAL zeros/);
    if (m) {
      const k = m[2] === 'once' ? 1 : N(m[2].split(' ')[0]);
      return N(m[1]) - k;
    }
  }
  if (form === 'polynomial-rational-analysis__pra-rrt-pipeline__numeric') {
    m = ascii.match(/^Expanding \(x - (\d+)\)\(x² \+ (\d+)x \+ (\d+)\), what is the coefficient of x²\?$/);
    if (m) return N(m[2]) - N(m[1]);
    m = ascii.match(/^h\(x\) = (.+)\. Using the full pipeline, what is its LARGEST zero\?$/);
    if (m) {
      const [a3, a2, a1, a0] = praParseCubic(m[1]);
      let best;
      for (let x = -30; x <= 30; x += 1) {
        if (((a3 * x + a2) * x + a1) * x + a0 === 0) best = x;
      }
      if (best === undefined) throw new Error(`cubic has no small integer zero: ${prompt}`);
      return best;
    }
  }
  if (form === 'polynomial-rational-analysis__pra-slant-find__numeric') {
    m = ascii.match(/^g\(x\) = \((\d+)x² \+ (\d+)x \+ (\d+)\)\/\(x \+ (\d+)\) has slant asymptote y = \d+x \+ b\. What is b\?$/);
    if (m) return N(m[2]) - N(m[1]) * N(m[4]);
    m = ascii.match(/^For f\(x\) = \(x² - (\d+)\)\/\(x - 1\) with slant y = x \+ 1, what is f\((\d+)\) - (\d+)\?/);
    if (m) {
      const at = N(m[2]);
      const value = (at * at - N(m[1])) / (at - 1);
      return tiHalfUp(value - N(m[3]), 4);
    }
  }
  if (form === 'polynomial-rational-analysis__pra-rrt-test__numeric') {
    m = ascii.match(/^f\(x\) = (.+)\. Test the candidate c = (\d+): what is f\(\d+\)\?$/);
    if (m) {
      const [a3, a2, a1, a0] = praParseCubic(m[1]);
      const c = N(m[2]);
      return ((a3 * c + a2) * c + a1) * c + a0;
    }
  }
  if (form === 'polynomial-rational-analysis__pra-conjugate__numeric') {
    m = ascii.match(/^Multiply the conjugate pair: \(x - (\d+)i\)\(x \+ \d+i\) = x² \+ c\. What is c\?$/);
    if (m) return N(m[1]) * N(m[1]);
  }
  if (form === 'polynomial-rational-analysis__pra-ineq-scratch__numeric') {
    m = ascii.match(/^How many INTEGER solutions does x² \+ (\d+) ≤ (\d+)x have\?$/);
    if (m) {
      let count = 0;
      for (let x = -100; x <= 100; x += 1) if (x * x + N(m[1]) <= N(m[2]) * x) count += 1;
      return count;
    }
  }
  if (form === 'polynomial-rational-analysis__pra-boundary-rule__numeric') {
    m = ascii.match(/^For x\(x - (\d+)\)\/\(x - (\d+)\) (≤|<|≥) 0, how many boundary points are INCLUDED/);
    if (m) {
      // The zeros 0 and m[1] make the expression exactly 0; they close exactly when equality is allowed.
      return m[3] === '<' ? 0 : 2;
    }
  }
  if (form === 'polynomial-rational-analysis__pra-rearrange__numeric') {
    m = ascii.match(/^How many INTEGERS x with (-?\d+) ≤ x ≤ (-?\d+) satisfy x\/\(x - (\d+)\) ≤ (\d+)\?$/);
    if (m) {
      let count = 0;
      for (let x = N(m[1]); x <= N(m[2]); x += 1) {
        if (x === N(m[3])) continue;
        if (x / (x - N(m[3])) <= N(m[4]) + 1e-12) count += 1;
      }
      return count;
    }
  }
  return undefined;
}

function solvePrompt(form, input) {
  if (form.startsWith('trig-identities-equations__') && form.endsWith('__numeric')) {
    const derived = tiSolveTrigIdentities(form, input);
    if (derived !== undefined) return derived;
  }
  if (form.startsWith('trig-graphs-inverses__') && form.endsWith('__numeric')) {
    const derived = tgSolve(form, input);
    if (derived !== undefined) return derived;
  }
  if (form.startsWith('vectors-matrices__') && form.endsWith('__numeric')) {
    const derived = vecSolve(form, input);
    if (derived !== undefined) return derived;
  }
  if (form.startsWith('polar-parametric__')) {
    const derived = ppSolve(form, input);
    if (derived !== undefined) return derived;
  }
  if (form.startsWith('polynomial-rational-analysis__') && form.endsWith('__numeric')) {
    const derived = praSolve(form, input);
    if (derived !== undefined) return derived;
  }
  if (form === 'conic-sections__co-parabola-def__numeric') {
    return solveParabolaDefinition(input);
  }
  if (form === 'conic-sections__co-hyp-ecc__numeric') {
    return solveHyperbolaEccentricity(input);
  }
  if (form === 'function-analysis__fna-graph-read__numeric') return solveFunctionGraphRead(input);
  if (form === 'function-analysis__fna-compose-order__numeric') return solveComposeOrder(input);
  if (form === 'function-analysis__fna-compose-domain__numeric') return solveComposeDomain(input);
  if (form === 'function-analysis__fna-decompose__numeric') return solveDecompose(input);
  if (form === 'function-analysis__fna-one-to-one__numeric') return solveOneToOne(input);
  if (form === 'function-analysis__fna-restricted__numeric') return solveRestrictedInverse(input);
  if (form === 'function-analysis__fna-inverse-verify__pointEntry') return solveInversePoint(input);
  if (form === 'function-analysis__fna-inverse-verify__numeric') return solveInverseVerify(input);
  if (form === LIMIT_IDEA_MCQ_FORM) return solveLimitIdeaMcq(input);
  if (form === LIMIT_IDEA_NUMERIC_FORM) return solveLimitIdeaNumeric(input);
  if (form === LIMIT_READ_NUMERIC_FORM) return solveLimitReadNumeric(input);
  if (form === LIMIT_DNE_MCQ_FORM) return solveLimitDneMcq(input);
  if (form === LIMIT_DNE_NUMERIC_FORM) return solveLimitDneNumeric(input);
  if (form === LIMIT_FACTOR_NUMERIC_FORM) return solveLimitFactorNumeric(input);
  if (form === LIMIT_RATIONALIZE_MCQ_FORM) return solveLimitRationalizeMcq(input);
  if (form === LIMIT_RATIONALIZE_NUMERIC_FORM) return solveLimitRationalizeNumeric(input);
  if (form === LIMIT_ONESIDED_MCQ_FORM) return solveLimitOneSidedMcq(input);
  if (form === LIMIT_ONESIDED_NUMERIC_FORM) return solveLimitOneSidedNumeric(input);
  if (form === LIMIT_INFINITY_NUMERIC_FORM) return solveLimitInfinityNumeric(input);
  if (form === LIMIT_ENDBEHAVIOR_MCQ_FORM) return solveLimitEndBehaviorMcq(input);
  if (form === LIMIT_CONTINUITY_MCQ_FORM) return solveLimitContinuityMcq(input);
  if (form === LIMIT_CONTINUITY_NUMERIC_FORM) return solveLimitContinuityNumeric(input);
  if (form === LIMIT_DISCONTINUITY_MCQ_FORM) return solveLimitDiscontinuityMcq(input);
  if (form === LIMIT_DISCONTINUITY_NUMERIC_FORM) return solveLimitDiscontinuityNumeric(input);
  if (form === LIMIT_IVT_MCQ_FORM) return solveLimitIvtMcq(input);
  if (form === LIMIT_IVT_NUMERIC_FORM) return solveLimitIvtNumeric(input);
  if (form === LIMIT_AVG_RATE_MCQ_FORM) return solveLimitAverageRate(input, true);
  if (form === LIMIT_AVG_RATE_NUMERIC_FORM) return solveLimitAverageRate(input, false);
  if (form === LIMIT_DERIVATIVE_MCQ_FORM) return solveLimitDerivativeMcq(input);
  if (form === LIMIT_DERIVATIVE_NUMERIC_FORM) return solveLimitDerivativeNumeric(input);
  if (form === LIMIT_SERIES_MCQ_FORM) return solveLimitSeries(input, true);
  if (form === LIMIT_SERIES_NUMERIC_FORM) return solveLimitSeries(input, false);  return solveAuthoredPrompt(form, input);
}

module.exports = { solvePrompt };
