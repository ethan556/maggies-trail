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
  const match = /f\(x\) = (-?\d+)x ([+-]) (\d+)\. Find the limit as x approaches (-?\d+)/.exec(prompt);
  if (!match) throw new Error(`unrecognized continuous-line limit prompt: ${prompt}`);
  const slope = Number(match[1]);
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

function solvePrompt(form, input) {
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
  return solveAuthoredPrompt(form, input);
}

module.exports = { solvePrompt };
