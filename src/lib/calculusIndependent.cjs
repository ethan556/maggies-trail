const answers = require('./calculusIndependentAnswers.json');
const { makeSolver } = require('./authoredTemplateIndependent.cjs');
const authoredSolver = makeSolver(answers);

const FIRST_DERIVATIVE_NUMERIC = 'curve-analysis__ca-first-derivative-test__numeric';
const FIRST_DERIVATIVE_SIGN_CHART = 'curve-analysis__ca-first-derivative-test__signChart';
const INFLECTION_NUMERIC = 'curve-analysis__ca-inflection__numeric';
const READ_F_PRIME_NUMERIC = 'curve-analysis__ca-read-f-prime__numeric';
const THREE_CHARTS_NUMERIC = 'curve-analysis__ca-three-charts__numeric';
const OPTIMISATION_NUMERIC = 'curve-analysis__ca-optimisation-applied__numeric';
const DERIVATIVE_FORMS = {
  NESTED: 'derivative-rules__dr-chain-nested__numeric',
  CRITICAL: 'derivative-rules__dr-critical-point__numeric',
  EVALUATE: 'derivative-rules__dr-derivative-function__numeric',
  DIFFERENTIABILITY: 'derivative-rules__dr-differentiability__numeric',
  EXP_LOG: 'derivative-rules__dr-exp-log__numeric',
  IMPLICIT: 'derivative-rules__dr-implicit__numeric',
  SIGN: 'derivative-rules__dr-sign-of-derivative__numeric',
  TANGENT: 'derivative-rules__dr-tangent-line__numeric',
};
const CHOOSING_RELATION_NUMERIC = 'derivatives-in-context__dc-choosing-relation__numeric';
const MOTION_NUMERIC = 'derivatives-in-context__dc-motion__numeric';
const SPEED_NUMERIC = 'derivatives-in-context__dc-speed__numeric';
const DISTANCE_NUMERIC = 'derivatives-in-context__dc-distance__numeric';
const RELATED_RATES_NUMERIC = 'derivatives-in-context__dc-related-rates__numeric';
const LADDER_NUMERIC = 'derivatives-in-context__dc-ladder__numeric';
const LINEARISATION_NUMERIC = 'derivatives-in-context__dc-linearisation__numeric';
const DIFFERENTIALS_NUMERIC = 'derivatives-in-context__dc-differentials__numeric';
const LINEARISATION_LIMITS_NUMERIC = 'derivatives-in-context__dc-linearisation-limits__numeric';
const LHOPITAL_NUMERIC = 'derivatives-in-context__dc-lhopital__numeric';
const OTHER_FORMS_NUMERIC = 'derivatives-in-context__dc-other-forms__numeric';
const DIFFERENTIAL_EQUATION_FORMS = {
  SLOPE: 'differential-equations__de-slope-field__numeric',
  SEPARABLE: 'differential-equations__de-separable__numeric',
  LOGISTIC: 'differential-equations__de-logistic__numeric',
  EQUILIBRIUM: 'differential-equations__de-equilibrium__numeric',
  EXPONENTIAL: 'differential-equations__de-exponential__numeric',
  EULER: 'differential-equations__de-euler__numeric',
};
const INTEGRATION_FOUNDATION_FORMS = {
  RIEMANN_NUMERIC: 'integration-accumulation__in-riemann__numeric',
  RIEMANN_MCQ: 'integration-accumulation__in-riemann__mcq',
  SQUEEZE_NUMERIC: 'integration-accumulation__in-squeeze__numeric',
  SQUEEZE_MCQ: 'integration-accumulation__in-squeeze__mcq',
  DEFINITE_NUMERIC: 'integration-accumulation__in-definite-integral__numeric',
  DEFINITE_MATCH: 'integration-accumulation__in-definite-integral__matchPairs',
  SIGNED_AREA_MCQ: 'integration-accumulation__in-signed-area__mcq',
  ACCUMULATION_NUMERIC: 'integration-accumulation__in-accumulation__numeric',
  ACCUMULATION_MCQ: 'integration-accumulation__in-accumulation__mcq',
  READ_ACCUMULATION_MCQ: 'integration-accumulation__in-read-accumulation__mcq',
  READ_ACCUMULATION_MATCH: 'integration-accumulation__in-read-accumulation__matchPairs',
  SIGNED_AREA_NUMERIC: 'integration-accumulation__in-signed-area__numeric',
  READ_ACCUMULATION_NUMERIC: 'integration-accumulation__in-read-accumulation__numeric',
  NET_CHANGE_MCQ: 'integration-accumulation__in-net-change__mcq',
  NET_CHANGE_NUMERIC: 'integration-accumulation__in-net-change__numeric',
  FTC1_MCQ: 'integration-accumulation__in-ftc1__mcq',
  FTC1_NUMERIC: 'integration-accumulation__in-ftc1__numeric',
  FTC2_NUMERIC: 'integration-accumulation__in-ftc2__numeric',
  FTC2_MCQ: 'integration-accumulation__in-ftc2__mcq',
  FTC_UNIFIED_ORDER: 'integration-accumulation__in-ftc-unified__dragOrder',
  FTC_UNIFIED_BUCKET: 'integration-accumulation__in-ftc-unified__dragBucket',
  FTC_UNIFIED_NUMERIC: 'integration-accumulation__in-ftc-unified__numeric',
};

function solveFirstDerivativeMaximum(input) {
  const prompt = String(input)
    .split('||', 1)[0]
    .replace(/[−–—]/g, '-')
    .replace(/³/g, '^3');
  const match = /f\(x\)\s*=\s*x\^3\s*-\s*(\d+)x(?:\s*([+-])\s*(\d+))?/.exec(prompt);
  if (!match) throw new Error(`unrecognized dynamic first-derivative prompt: ${prompt}`);
  const linearCoefficient = Number(match[1]);
  const a = Math.sqrt(linearCoefficient / 3);
  if (!Number.isInteger(a)) throw new Error(`first-derivative coefficient does not produce integer critical points: ${linearCoefficient}`);
  const constant = match[2] ? (match[2] === '+' ? 1 : -1) * Number(match[3]) : 0;
  return constant + 2 * a ** 3;
}

function solveFirstDerivativeSigns(input) {
  const prompt = String(input).split('||', 1)[0].replace(/[−–—]/g, '-');
  const match = /double root at x\s*=\s*(-?\d+) and a single root at x\s*=\s*(-?\d+)/i.exec(prompt);
  if (!match) throw new Error(`unrecognized dynamic first-derivative sign-chart prompt: ${prompt}`);
  const roots = [
    { x: Number(match[1]), mult: 2 },
    { x: Number(match[2]), mult: 1 },
  ].sort((left, right) => left.x - right.x);
  const signs = Array(roots.length + 1).fill('+');
  let sign = '+';
  signs[roots.length] = sign;
  for (let index = roots.length - 1; index >= 0; index -= 1) {
    if (roots[index].mult % 2 === 1) sign = sign === '+' ? '-' : '+';
    signs[index] = sign;
  }
  return signs;
}

function solveInflectionCount(input) {
  const prompt = String(input).split('||', 1)[0];
  const expression = /f''\(x\)\s*=\s*([^.]*)/.exec(prompt)?.[1]?.trim();
  if (!expression) throw new Error(`unrecognized dynamic inflection prompt: ${prompt}`);
  if (/\^2/.test(expression)) return 0;
  const factorCount = (expression.match(/\(x\s*[+-]\s*\d+\)/g) || []).length;
  if (factorCount === 2) return 2;
  if (/^x\s*[+-]\s*\d+$/.test(expression)) return 1;
  throw new Error(`unrecognized dynamic second derivative: ${expression}`);
}

function solveReadFirstDerivative(input) {
  const prompt = String(input).split('||', 1)[0];
  const crossingClause = /crosses the x-axis at (.*?);/i.exec(prompt)?.[1];
  if (!crossingClause) throw new Error(`unrecognized dynamic f-prime graph prompt: ${prompt}`);
  return (crossingClause.match(/x\s*=\s*-?\d+/g) || []).length;
}

function solveThreeCharts(input) {
  const prompt = String(input).split('||', 1)[0].replace(/[âˆ’â€“â€”]/g, '-');
  const match = /f\(x\)\s*=\s*x\^3\s*([+-])\s*(\d+)x\^2/.exec(prompt);
  if (!match) throw new Error(`unrecognized dynamic three-charts prompt: ${prompt}`);
  const coefficient = (match[1] === '+' ? 1 : -1) * Number(match[2]);
  return -coefficient / 3;
}

function solveOptimisation(input) {
  const prompt = String(input).split('||', 1)[0];
  const pen = /and (\d+) m of fencing for the other three sides/i.exec(prompt);
  if (pen) {
    const total = Number(pen[1]);
    return total ** 2 / 8;
  }
  const squares = /Two real numbers add to (\d+)/i.exec(prompt);
  if (squares) {
    const total = Number(squares[1]);
    return total ** 2 / 2;
  }
  throw new Error(`unrecognized dynamic optimisation prompt: ${prompt}`);
}

function solveDerivativeNumeric(form, input) {
  const prompt = String(input).split('||', 1)[0].replace(/[âˆ’â€“â€”]/g, '-');
  if (form === DERIVATIVE_FORMS.NESTED) {
    const match = /x\((\d+)x \+ (\d+)\)\^(\d+)/.exec(prompt);
    if (!match) throw new Error(`unrecognized nested product prompt: ${prompt}`);
    return Number(match[2]) ** Number(match[3]);
  }
  if (form === DERIVATIVE_FORMS.CRITICAL) {
    const expression = /f'\(x\)\s*=\s*([^.]*)/.exec(prompt)?.[1] || '';
    if (/\(x\s*[+-]\s*\d+\)\^2/.test(expression)) return 1;
    if (/x\^2\s*-\s*\d+/.test(expression)) return 2;
    if (/x\^2\s*\+\s*\d+/.test(expression)) return 0;
  }
  if (form === DERIVATIVE_FORMS.EVALUATE) {
    const match = /f\(x\)\s*=\s*x\^(\d+), find f'\((-?\d+)\)/i.exec(prompt);
    if (!match) throw new Error(`unrecognized derivative evaluation prompt: ${prompt}`);
    const n = Number(match[1]);
    const x = Number(match[2]);
    return n * x ** (n - 1);
  }
  if (form === DERIVATIVE_FORMS.DIFFERENTIABILITY) {
    const list = /marked features:\s*(.*?)\. At how many/i.exec(prompt)?.[1] || '';
    return list.split(/,\s*/).filter((feature) => ['jump', 'corner', 'cusp', 'vertical tangent'].includes(feature)).length;
  }
  if (form === DERIVATIVE_FORMS.EXP_LOG) {
    const coefficient = /e\^\((\d+)x\)/.exec(prompt)?.[1];
    if (!coefficient) throw new Error(`unrecognized exponential derivative prompt: ${prompt}`);
    return Number(coefficient);
  }
  if (form === DERIVATIVE_FORMS.IMPLICIT) {
    const point = /at \((-?\d+),\s*(-?\d+)\)/.exec(prompt);
    if (!point) throw new Error(`unrecognized implicit derivative prompt: ${prompt}`);
    return Number((-Number(point[1]) / Number(point[2])).toFixed(3));
  }
  if (form === DERIVATIVE_FORMS.SIGN) {
    const square = /x\^2\s*-\s*(\d+)/.exec(prompt)?.[1];
    if (!square) throw new Error(`unrecognized derivative-sign prompt: ${prompt}`);
    const radius = Math.sqrt(Number(square));
    return 2 * radius - 1;
  }
  if (form === DERIVATIVE_FORMS.TANGENT) {
    const match = /f\(x\)\s*=\s*x\^2\s*([+-])\s*(\d+).*at x\s*=\s*(-?\d+)/.exec(prompt);
    if (!match) throw new Error(`unrecognized tangent prompt: ${prompt}`);
    const constant = (match[1] === '+' ? 1 : -1) * Number(match[2]);
    const x = Number(match[3]);
    return constant - x ** 2;
  }
  throw new Error(`unrecognized dynamic derivative-rules prompt for ${form}: ${prompt}`);
}

function solveChoosingRelation(input) {
  const prompt = String(input).split('||', 1)[0];
  const match = /north at (\d+) mph and is (\d+) miles.*east at (\d+) mph and is (\d+) miles/i.exec(prompt);
  if (!match) throw new Error(`unrecognized choosing-relation prompt: ${prompt}`);
  const northRate = Number(match[1]);
  const northDistance = Number(match[2]);
  const eastRate = Number(match[3]);
  const eastDistance = Number(match[4]);
  const separation = Math.hypot(northDistance, eastDistance);
  return (northDistance * northRate + eastDistance * eastRate) / separation;
}

function parseCubicPosition(prompt) {
  const match = /s\(t\)\s*=\s*t\^3\s*([+-])\s*(\d+(?:\.\d+)?)t\^2\s*([+-])\s*(\d+(?:\.\d+)?)t\s*([+-])\s*(\d+(?:\.\d+)?)/.exec(prompt);
  if (!match) throw new Error(`unrecognized cubic position: ${prompt}`);
  return {
    a2: (match[1] === '+' ? 1 : -1) * Number(match[2]),
    a1: (match[3] === '+' ? 1 : -1) * Number(match[4]),
    constant: (match[5] === '+' ? 1 : -1) * Number(match[6]),
  };
}

function solveMotion(input) {
  const prompt = String(input).split('||', 1)[0].replace(/[âˆ’â€“â€”]/g, '-');
  if (/Find its acceleration/i.test(prompt)) {
    const coefficients = parseCubicPosition(prompt);
    const time = Number(/at t\s*=\s*(-?\d+(?:\.\d+)?)/.exec(prompt)?.[1]);
    return 6 * time + 2 * coefficients.a2;
  }
  const roots = /v\(t\)\s*=\s*3\(t\s*-\s*(-?\d+)\)\(t\s*-\s*(-?\d+)\)/.exec(prompt);
  if (!roots) throw new Error(`unrecognized motion velocity: ${prompt}`);
  const first = Number(roots[1]);
  const second = Number(roots[2]);
  if (/how many distinct times/i.test(prompt)) return new Set([first, second]).size;
  const coefficients = parseCubicPosition(prompt);
  const time = Math.min(first, second);
  return time ** 3 + coefficients.a2 * time ** 2 + coefficients.a1 * time + coefficients.constant;
}

function solveSpeedIntervals(input) {
  const prompt = String(input).split('||', 1)[0];
  const match = /v\(t\)\s*=\s*\d+\(t\s*-\s*(\d+)\)\(t\s*-\s*(\d+)\).*on \[(-?\d+),\s*(-?\d+)\]/i.exec(prompt);
  if (!match) throw new Error(`unrecognized speed-interval prompt: ${prompt}`);
  const first = Number(match[1]);
  const second = Number(match[2]);
  const start = Number(match[3]);
  const end = Number(match[4]);
  const midpoint = (first + second) / 2;
  const boundaries = [start, first, midpoint, second, end]
    .filter((value) => value >= start && value <= end)
    .sort((left, right) => left - right)
    .filter((value, index, all) => index === 0 || value !== all[index - 1]);
  let count = 0;
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const sample = (boundaries[index] + boundaries[index + 1]) / 2;
    if ((sample - first) * (sample - second) * (2 * sample - first - second) > 0) count += 1;
  }
  return count;
}

function solveDistance(input) {
  const prompt = String(input).split('||', 1)[0];
  if (/displacement over/i.test(prompt)) {
    const polynomial = /s\(t\)\s*=\s*t\^2\s*([+-])\s*(\d+)t\s*([+-])\s*(\d+)/.exec(prompt);
    const interval = /over \[(-?\d+),\s*(-?\d+)\]/.exec(prompt);
    if (!polynomial || !interval) throw new Error(`unrecognized displacement prompt: ${prompt}`);
    const a = (polynomial[1] === '+' ? 1 : -1) * Number(polynomial[2]);
    const constant = (polynomial[3] === '+' ? 1 : -1) * Number(polynomial[4]);
    const evaluate = (time) => time ** 2 + a * time + constant;
    return evaluate(Number(interval[2])) - evaluate(Number(interval[1]));
  }
  if (/motion legs/i.test(prompt)) {
    const interval = /^On \[(-?\d+),\s*(-?\d+)\]/.exec(prompt);
    const roots = /v\(t\)\s*=\s*\(t\s*-\s*(-?\d+)\)\(t\s*-\s*(-?\d+)\)/.exec(prompt);
    if (!interval || !roots) throw new Error(`unrecognized motion-leg prompt: ${prompt}`);
    const start = Number(interval[1]);
    const end = Number(interval[2]);
    const reversals = [Number(roots[1]), Number(roots[2])].filter((root) => root > start && root < end).length;
    return reversals + 1;
  }
  const sequence = /positions in order:\s*(.*?)\. Find the total distance/i.exec(prompt)?.[1];
  if (sequence) {
    const positions = sequence.split(/\s*->\s*/).map(Number);
    return positions.slice(1).reduce((sum, position, index) => sum + Math.abs(position - positions[index]), 0);
  }
  throw new Error(`unrecognized dynamic distance prompt: ${prompt}`);
}

function solveRelatedRates(input) {
  const prompt = String(input).split('||', 1)[0];
  const match = /radius grows at dr\/dt\s*=\s*(\d+) cm\/s.*when r\s*=\s*(\d+)/i.exec(prompt);
  if (!match) throw new Error(`unrecognized related-rates prompt: ${prompt}`);
  const rate = Number(match[1]);
  const radius = Number(match[2]);
  return /volume of a sphere/i.test(prompt) ? 4 * radius ** 2 * rate : 2 * radius * rate;
}

function solveLadder(input) {
  const prompt = String(input).split('||', 1)[0];
  const dimensions = /A (\d+)-ft ladder.*foot (?:distance x = )?(\d+) ft/i.exec(prompt);
  if (!dimensions) throw new Error(`unrecognized ladder prompt: ${prompt}`);
  const length = Number(dimensions[1]);
  const foot = Number(dimensions[2]);
  const height = Math.sqrt(length ** 2 - foot ** 2);
  if (/How high is the top/i.test(prompt)) return height;
  const rate = Number(/dx\/dt\s*=\s*(\d+)/.exec(prompt)?.[1]);
  return Number((-(foot / height) * rate).toFixed(3));
}

function solveLinearisation(input) {
  const prompt = String(input).split('||', 1)[0];
  const slope = /find f'\((\d+)\)/i.exec(prompt);
  if (slope) return Number((1 / (2 * Math.sqrt(Number(slope[1])))).toFixed(3));
  const squareRoot = /at x\s*=\s*(\d+) to estimate sqrt\((\d+(?:\.\d+)?)\)/i.exec(prompt);
  if (squareRoot) {
    const base = Number(squareRoot[1]);
    const target = Number(squareRoot[2]);
    return Number((Math.sqrt(base) + (target - base) / (2 * Math.sqrt(base))).toFixed(4));
  }
  const cubic = /x\^3 at x\s*=\s*(\d+) to estimate (-?\d+(?:\.\d+)?)\^3/i.exec(prompt);
  if (cubic) {
    const base = Number(cubic[1]);
    const target = Number(cubic[2]);
    return Number((base ** 3 + 3 * base ** 2 * (target - base)).toFixed(4));
  }
  throw new Error(`unrecognized linearisation prompt: ${prompt}`);
}

function solveDifferentials(input) {
  const prompt = String(input).split('||', 1)[0];
  const cubeError = /side is measured as (\d+(?:\.\d+)?) cm with an error of up to (\d+(?:\.\d+)?)/i.exec(prompt);
  if (cubeError) return 3 * Number(cubeError[1]) ** 2 * Number(cubeError[2]);
  const percent = /with a (\d+(?:\.\d+)?)% error.*length\^(\d+)/i.exec(prompt);
  if (percent) return Number(percent[1]) * Number(percent[2]);
  const tolerance = /accurate within (\d+(?:\.\d+)?)%.*its (\d+(?:\.\d+)?)-cm side/i.exec(prompt);
  if (tolerance) return Number(tolerance[1]) / 3 / 100 * Number(tolerance[2]);
  throw new Error(`unrecognized differentials prompt: ${prompt}`);
}

function solveLinearisationLimits(input) {
  const prompt = String(input).split('||', 1)[0];
  const factor = /is (\d+) times farther from the base point/i.exec(prompt)?.[1];
  if (!factor) throw new Error(`unrecognized linearisation-error prompt: ${prompt}`);
  return Number(factor) ** 2;
}

function solveLhopital(input) {
  const prompt = String(input).split('||', 1)[0];
  const match = /lim\(x -> (-?\d+)\) \(x\^(\d+) - \d+\)\/(?:\(x - -?\d+\))/i.exec(prompt);
  if (!match) throw new Error(`unrecognized L'Hopital prompt: ${prompt}`);
  const point = Number(match[1]);
  const power = Number(match[2]);
  return power * point ** (power - 1);
}

function solveDifferentialEquation(form, input) {
  const prompt = String(input).split('||', 1)[0];
  if (form === DIFFERENTIAL_EQUATION_FORMS.SLOPE) {
    const point = /at \((-?\d+),\s*(-?\d+)\)/.exec(prompt);
    const expression = /dy\/dx\s*=\s*(.*?), find/i.exec(prompt)?.[1];
    if (!point || !expression) throw new Error(`unrecognized slope-field prompt: ${prompt}`);
    const x = Number(point[1]); const y = Number(point[2]);
    const compact = expression.replace(/\s+/g, '');
    const coefficient = (raw) => raw === '' || raw === '+' ? 1 : raw === '-' ? -1 : Number(raw);
    const xMatch = /^([+-]?\d*)x/.exec(compact);
    const yMatch = /([+-]\d*)y$|^([+-]?\d*)y$/.exec(compact);
    const a = xMatch ? coefficient(xMatch[1]) : 0;
    const rawY = yMatch ? (yMatch[1] ?? yMatch[2]) : '';
    const b = yMatch ? coefficient(rawY) : 0;
    return a * x + b * y;
  }
  if (form === DIFFERENTIAL_EQUATION_FORMS.SEPARABLE) {
    const match = /dy\/dx\s*=\s*(-?\d+)xy.*y\(0\)\s*=\s*(\d+).*Find y\((-?\d+)\)/i.exec(prompt);
    if (!match) throw new Error(`unrecognized separable prompt: ${prompt}`);
    return Number((Number(match[2]) * Math.exp(Number(match[1]) * Number(match[3]) ** 2 / 2)).toFixed(3));
  }
  if (form === DIFFERENTIAL_EQUATION_FORMS.LOGISTIC) {
    return Number(/P\/(\d+)\)/.exec(prompt)?.[1]) / 2;
  }
  if (form === DIFFERENTIAL_EQUATION_FORMS.EQUILIBRIUM) {
    const capacity = Number(/P\/(\d+)\)|y\/(\d+)/.exec(prompt)?.slice(1).find(Boolean));
    if (/how many equilibrium/i.test(prompt)) return 2;
    if (/growth rate greatest/i.test(prompt)) return capacity / 2;
    return capacity;
  }
  if (form === DIFFERENTIAL_EQUATION_FORMS.EXPONENTIAL) {
    const growth = /dP\/dt\s*=\s*(\d+(?:\.\d+)?)P with P\(0\)\s*=\s*(\d+).*P\((\d+)\)/i.exec(prompt);
    if (growth) return Number((Number(growth[2]) * Math.exp(Number(growth[1]) * Number(growth[3]))).toFixed(3));
    const halfLife = /half-life (\d+) days/i.exec(prompt)?.[1];
    if (halfLife) return Number((Math.log(2) / Number(halfLife)).toFixed(4));
  }
  if (form === DIFFERENTIAL_EQUATION_FORMS.EULER) {
    const match = /dy\/dx\s*=\s*(-?\d+(?:\.\d+)?)y.*y\(0\)\s*=\s*(\d+).*h\s*=\s*(\d+(?:\.\d+)?).*after (\d+) step/i.exec(prompt);
    if (!match) throw new Error(`unrecognized Euler prompt: ${prompt}`);
    return Number((Number(match[2]) * (1 + Number(match[1]) * Number(match[3])) ** Number(match[4])).toFixed(4));
  }
  throw new Error(`unrecognized differential-equation prompt for ${form}: ${prompt}`);
}

function solveIntegrationFoundation(form, input) {
  const parts = String(input).split('||');
  const prompt = parts[0].trim();
  if (form === INTEGRATION_FOUNDATION_FORMS.RIEMANN_NUMERIC) {
    const match = /f\(x\) = (\d+)x on \[0, (\d+)\], use (\d+) equal strips and left endpoints/.exec(prompt);
    if (!match) throw new Error(`unrecognized Riemann-sum prompt: ${prompt}`);
    const m = Number(match[1]);
    const upper = Number(match[2]);
    const strips = Number(match[3]);
    const width = upper / strips;
    let sum = 0;
    for (let index = 0; index < strips; index += 1) sum += m * (index * width) * width;
    return sum;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.RIEMANN_MCQ) {
    const match = /is (increasing|decreasing).*rectangles use (left|right) endpoints/.exec(prompt);
    if (!match) throw new Error(`unrecognized Riemann-direction prompt: ${prompt}`);
    const underestimate = (match[1] === 'increasing' && match[2] === 'left') || (match[1] === 'decreasing' && match[2] === 'right');
    return underestimate ? 'The estimate is an underestimate.' : 'The estimate is an overestimate.';
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.SQUEEZE_NUMERIC) {
    const match = /f\(x\) = (\d+)x on \[0, (\d+)\], use (\d+) equal strips/.exec(prompt);
    if (!match) throw new Error(`unrecognized squeeze-gap prompt: ${prompt}`);
    const m = Number(match[1]);
    const upper = Number(match[2]);
    const strips = Number(match[3]);
    return m * upper * (upper / strips);
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.SQUEEZE_MCQ) {
    const match = /left sum (-?\d+(?:\.\d+)?) and right sum (-?\d+(?:\.\d+)?)/.exec(prompt);
    if (!match) throw new Error(`unrecognized squeeze-bound prompt: ${prompt}`);
    return `The integral is in [${Number(match[1])}, ${Number(match[2])}].`;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.DEFINITE_NUMERIC) {
    const match = /Given ∫₁³ f\(x\) dx = (-?\d+) and ∫₃⁵ f\(x\) dx = (-?\d+), find (∫₁⁵|∫₅¹)/.exec(prompt);
    if (!match) throw new Error(`unrecognized definite-integral property prompt: ${prompt}`);
    const joined = Number(match[1]) + Number(match[2]);
    return match[3] === '∫₅¹' ? -joined : joined;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.DEFINITE_MATCH) {
    const match = /Given ∫₁³ f\(x\) dx = (-?\d+) and ∫₃⁵ f\(x\) dx = (-?\d+)/.exec(prompt);
    if (!match) throw new Error(`unrecognized definite-integral matching prompt: ${prompt}`);
    const p = Number(match[1]);
    const q = Number(match[2]);
    const expected = {
      '∫₁⁵ f(x) dx': String(p + q),
      '∫₃¹ f(x) dx': String(-p),
      '∫₅³ f(x) dx': String(-q),
    };
    const shownLeft = new Set((parts[1] || '').split('\u001f'));
    const shownRight = new Set((parts[2] || '').split('\u001f'));
    for (const [left, right] of Object.entries(expected)) {
      if (!shownLeft.has(left) || !shownRight.has(right)) {
        throw new Error(`matching columns omit prompt-derived pair ${left} -> ${right}`);
      }
    }
    return expected;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.SIGNED_AREA_MCQ) {
    const match = /area (\d+) above the x-axis and area (\d+) below it/.exec(prompt);
    if (!match) throw new Error(`unrecognized signed-area prompt: ${prompt}`);
    const above = Number(match[1]);
    const below = Number(match[2]);
    return `signed integral = ${above - below}; total geometric area = ${above + below}`;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.ACCUMULATION_NUMERIC) {
    const value = /integral from 0 to x of \((-?\d+)t \+ (-?\d+)\) dt\. Find A\((-?\d+)\)\./.exec(prompt);
    const difference = /integral from 0 to x of \((-?\d+)t \+ (-?\d+)\) dt\. Find A\((-?\d+)\) - A\((-?\d+)\)\./.exec(prompt);
    if (!value && !difference) throw new Error(`unrecognized accumulation-value prompt: ${prompt}`);
    const match = difference || value;
    const m = Number(match[1]);
    const c = Number(match[2]);
    const antiderivative = (x) => m * x * x / 2 + c * x;
    return difference ? antiderivative(Number(match[3])) - antiderivative(Number(match[4])) : antiderivative(Number(match[3]));
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.ACCUMULATION_MCQ) {
    const match = /integral from 0 to (\w+) of f\((\w+)\) d\2, what role does \2 play\?/.exec(prompt);
    if (!match) throw new Error(`unrecognized dummy-variable prompt: ${prompt}`);
    return `${match[2]} is the dummy variable of integration.`;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.READ_ACCUMULATION_MCQ) {
    const match = /f\(x\) = .*\(x - (\d+)\).*At which x does A have its (minimum|maximum)\?/.exec(prompt);
    if (!match) throw new Error(`unrecognized accumulation-extremum prompt: ${prompt}`);
    return `x = ${match[1]}`;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.READ_ACCUMULATION_MATCH) {
    const match = /takes the values (\d+), 0, and -(\d+) at/.exec(prompt);
    if (!match) throw new Error(`unrecognized accumulation-matching prompt: ${prompt}`);
    const rise = Number(match[1]);
    const fall = Number(match[2]);
    const expected = {
      [`f(x) = ${rise}`]: `A rises at ${rise} units per x-unit`,
      'f(x) = 0': 'A is momentarily flat',
      [`f(x) = -${fall}`]: `A falls at ${fall} units per x-unit`,
    };
    const shownLeft = new Set((parts[1] || '').split('\u001f'));
    const shownRight = new Set((parts[2] || '').split('\u001f'));
    for (const [left, right] of Object.entries(expected)) {
      if (!shownLeft.has(left) || !shownRight.has(right)) {
        throw new Error(`matching columns omit prompt-derived pair ${left} -> ${right}`);
      }
    }
    return expected;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.SIGNED_AREA_NUMERIC) {
    const match = /encloses area (\d+) above the x-axis and area (\d+) below it/.exec(prompt);
    if (!match) throw new Error(`unrecognized signed-area numeric prompt: ${prompt}`);
    return Number(match[1]) - Number(match[2]);
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.READ_ACCUMULATION_NUMERIC) {
    const match = /is zero only at x = ([\d, ]+), and changes sign at every listed zero/.exec(prompt);
    if (!match) throw new Error(`unrecognized accumulation-turning-point prompt: ${prompt}`);
    return match[1].split(',').length;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.NET_CHANGE_MCQ) {
    const units = /measured in ([a-z ]+ per [a-z]+), and t is measured in ([a-z]+)\. What units/.exec(prompt);
    if (units) return units[1].replace(/ per [a-z]+$/, '');
    const motion = /integral of v\(t\) is (-?\d+) ([a-z]+), while the integral of \|v\(t\)\| is (\d+) ([a-z]+)/.exec(prompt);
    if (!motion) throw new Error(`unrecognized net-change MCQ prompt: ${prompt}`);
    return `Net change = ${motion[1]} ${motion[2]}; total travel = ${motion[3]} ${motion[4]}.`;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.NET_CHANGE_NUMERIC) {
    const match = /r\(t\) = (-?\d+)t ([+-]) (\d+) litres per minute.*first (\d+) minutes/.exec(prompt);
    if (!match) throw new Error(`unrecognized net-change numeric prompt: ${prompt}`);
    const m = Number(match[1]);
    const c = (match[2] === '+' ? 1 : -1) * Number(match[3]);
    const n = Number(match[4]);
    return m * n * n / 2 + c * n;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC1_MCQ) {
    const basic = /Find d\/dx of the integral from (-?\d+) to x of (\d+)t\^(\d+) dt/.exec(prompt);
    if (basic) return `${basic[2]}x^${basic[3]}`;
    const compare = /Compare d\/dx of the integral from (-?\d+) to x of (\d+)t\^(\d+) dt with d\/dx/.exec(prompt);
    if (compare) return `Both derivatives are ${compare[2]}x^${compare[3]}.`;
    const chain = /Find d\/dx of the integral from (-?\d+) to x\^(\d+) of (\d+)t\^(\d+) dt/.exec(prompt);
    if (chain) {
      const inner = Number(chain[2]);
      const coeff = Number(chain[3]);
      const power = Number(chain[4]);
      return `${coeff * inner}x^${inner * power + inner - 1}`;
    }
    throw new Error(`unrecognized FTC Part 1 MCQ prompt: ${prompt}`);
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC1_NUMERIC) {
    const match = /integral from (-?\d+(?:\.\d+)?) to x of \((?:t\^2 - (\d+(?:\.\d+)?)|(\d+(?:\.\d+)?) - t\^2)\) dt on \[(-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\]\. At what x does A reach its (minimum|maximum)\?/.exec(prompt);
    if (!match) throw new Error(`unrecognized FTC Part 1 extremum prompt: ${prompt}`);
    const square = Number(match[2] || match[3]);
    const domainLower = Number(match[4]);
    const domainUpper = Number(match[5]);
    const requested = match[6];
    if (square < 0 || domainLower > domainUpper) throw new Error(`invalid FTC Part 1 extremum domain: ${prompt}`);
    const sign = match[2] ? 1 : -1;
    const antiderivative = (x) => sign * (x ** 3 / 3 - square * x);
    const root = Math.sqrt(square);
    const candidates = [domainLower, domainUpper, -root, root]
      .filter((x) => x >= domainLower && x <= domainUpper)
      .filter((x, index, all) => all.findIndex((other) => Math.abs(other - x) < 1e-12) === index);
    const ranked = candidates
      .map((x) => ({ x, value: antiderivative(x) }))
      .sort((a, b) => requested === 'minimum' ? a.value - b.value : b.value - a.value);
    const best = ranked[0];
    if (!best) throw new Error(`FTC Part 1 extremum prompt has no domain candidates: ${prompt}`);
    const ties = ranked.filter((candidate) => Math.abs(candidate.value - best.value) < 1e-9);
    if (ties.length !== 1) throw new Error(`FTC Part 1 extremum is not unique on the stated domain: ${prompt}`);
    return best.x;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC2_NUMERIC) {
    const power = /integral from (-?\d+) to (-?\d+) of x\^(\d+) dx/.exec(prompt);
    if (power) {
      const lower = Number(power[1]);
      const upper = Number(power[2]);
      const divisor = Number(power[3]) + 1;
      return Number(((upper ** divisor - lower ** divisor) / divisor).toFixed(3));
    }
    const rate = /r\(t\) = (\d+)t \+ (\d+) litres per minute.*first (\d+) minutes/.exec(prompt);
    if (!rate) throw new Error(`unrecognized FTC Part 2 numeric prompt: ${prompt}`);
    const m = Number(rate[1]); const c = Number(rate[2]); const n = Number(rate[3]);
    return m * n * n / 2 + c * n;
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC2_MCQ) {
    const constant = /G\(x\) = F\(x\) \+ (\d+)\. Why/.exec(prompt);
    if (constant) return `The +${constant[1]} cancels when endpoint values are subtracted.`;
    const reverse = /integral from (-?\d+) to (-?\d+) of f\(x\) dx is (-?\d+)\. What happens/.exec(prompt);
    if (reverse) return `The reversed integral is ${-Number(reverse[3])}.`;
    const join = /integral from (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?) is (-?\d+(?:\.\d+)?), and the integral from (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?) is (-?\d+(?:\.\d+)?)\. What is the integral from (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?)\?/.exec(prompt);
    if (join) {
      const firstLower = Number(join[1]); const firstUpper = Number(join[2]); const firstValue = Number(join[3]);
      const secondLower = Number(join[4]); const secondUpper = Number(join[5]); const secondValue = Number(join[6]);
      const requestedLower = Number(join[7]); const requestedUpper = Number(join[8]);
      if (firstUpper !== secondLower || requestedLower !== firstLower || requestedUpper !== secondUpper) {
        throw new Error(`FTC Part 2 pieces do not exactly cover the requested interval: ${prompt}`);
      }
      return `The joined integral is ${firstValue + secondValue}.`;
    }
    throw new Error(`unrecognized FTC Part 2 MCQ prompt: ${prompt}`);
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC_UNIFIED_ORDER) {
    const match = /For ([A-Z])\(x\) = the integral from (\w+) to x of ([a-z])\(t\) dt, order the steps that derive the evaluation formula using ([A-Z]) at (\w+)\./.exec(prompt);
    if (!match) throw new Error(`unrecognized unified-FTC proof prompt: ${prompt}`);
    const [, accumulation, lower, integrand, antiderivative, upper] = match;
    return [
      `Part 1 gives ${accumulation}'(x) = ${integrand}(x), so ${accumulation} is an antiderivative.`,
      `Any other antiderivative ${antiderivative} has ${antiderivative}(x) = ${accumulation}(x) + C.`,
      `Subtracting endpoints cancels C: ${antiderivative}(${upper}) - ${antiderivative}(${lower}) = ${accumulation}(${upper}) - ${accumulation}(${lower}).`,
      `Because ${accumulation}(${lower}) = 0, the difference equals the integral from ${lower} to ${upper}.`,
    ];
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC_UNIFIED_BUCKET) {
    const match = /Use p = (\d+), q = (\d+), c = (\d+), and b = (\d+)\./.exec(prompt);
    if (!match) throw new Error(`unrecognized unified-FTC bucket prompt: ${prompt}`);
    const [, p, q, c, b] = match;
    return {
      [`Differentiate the accumulation from ${c} to x of t^${p} dt`]: 'Differentiate an accumulation (Part 1)',
      [`Evaluate the integral from 0 to ${b} of x^${q} dx`]: 'Evaluate a definite integral (Part 2)',
      [`Find where the accumulation of (t - ${c}) from 0 to x is smallest`]: 'Differentiate an accumulation (Part 1)',
      [`Find the total from a rate over [0, ${b}]`]: 'Evaluate a definite integral (Part 2)',
    };
  }
  if (form === INTEGRATION_FOUNDATION_FORMS.FTC_UNIFIED_NUMERIC) {
    const power = /integral from (-?\d+) to (-?\d+) of x\^(\d+) dx/.exec(prompt);
    if (power) {
      const lower = Number(power[1]); const upper = Number(power[2]); const divisor = Number(power[3]) + 1;
      return Number(((upper ** divisor - lower ** divisor) / divisor).toFixed(3));
    }
    const minimum = /\(t\^2 - (\d+)\) dt.*Find the minimum value/.exec(prompt);
    if (!minimum) throw new Error(`unrecognized unified-FTC numeric prompt: ${prompt}`);
    const root = Math.sqrt(Number(minimum[1]));
    return Number((-2 * root ** 3 / 3).toFixed(3));
  }
  throw new Error(`unrecognized integration-foundation form ${form}`);
}

function solvePrompt(form, input) {
  if (form === FIRST_DERIVATIVE_NUMERIC && /f\(x\)\s*=\s*x(?:³|\^3)/.test(String(input))) {
    return solveFirstDerivativeMaximum(input);
  }
  if (form === FIRST_DERIVATIVE_SIGN_CHART && /double root at x/i.test(String(input))) {
    return solveFirstDerivativeSigns(input);
  }
  if (form === INFLECTION_NUMERIC && /f''\(x\)/.test(String(input))) return solveInflectionCount(input);
  if (form === READ_F_PRIME_NUMERIC && /crosses the x-axis at/i.test(String(input))) return solveReadFirstDerivative(input);
  if (form === THREE_CHARTS_NUMERIC && /x-coordinate of its inflection point/i.test(String(input))) return solveThreeCharts(input);
  if (form === OPTIMISATION_NUMERIC && /(fencing for the other three sides|Two real numbers add to)/i.test(String(input))) {
    return solveOptimisation(input);
  }
  if (Object.values(DERIVATIVE_FORMS).includes(form) && /\^|marked features/i.test(String(input))) {
    return solveDerivativeNumeric(form, input);
  }
  if (form === CHOOSING_RELATION_NUMERIC && /travels north at/i.test(String(input))) {
    return solveChoosingRelation(input);
  }
  if (form === MOTION_NUMERIC && /(particle has s\(t\)|particle's velocity)/i.test(String(input))) {
    return solveMotion(input);
  }
  if (form === SPEED_NUMERIC && /On how many sub-intervals is it speeding up/i.test(String(input))) {
    return solveSpeedIntervals(input);
  }
  if (form === DISTANCE_NUMERIC && /(displacement over|motion legs|positions in order)/i.test(String(input))) {
    return solveDistance(input);
  }
  if (form === RELATED_RATES_NUMERIC && /radius grows at dr\/dt/i.test(String(input))) {
    return solveRelatedRates(input);
  }
  if (form === LADDER_NUMERIC && /-ft ladder/i.test(String(input))) return solveLadder(input);
  if (form === LINEARISATION_NUMERIC && /(sqrt\(x\)|tangent to f\(x\) = x\^3)/i.test(String(input))) {
    return solveLinearisation(input);
  }
  if (form === DIFFERENTIALS_NUMERIC && /(volume error|percentage error|accurate within)/i.test(String(input))) {
    return solveDifferentials(input);
  }
  if (form === LINEARISATION_LIMITS_NUMERIC && /times farther from the base point/i.test(String(input))) {
    return solveLinearisationLimits(input);
  }
  if (form === LHOPITAL_NUMERIC && /using L'Hopital's rule/i.test(String(input))) return solveLhopital(input);
  if (form === OTHER_FORMS_NUMERIC && /lim\(x -> (?:infinity|0\+)\)/i.test(String(input))) return 0;
  if (Object.values(DIFFERENTIAL_EQUATION_FORMS).includes(form)) return solveDifferentialEquation(form, input);
  if (Object.values(INTEGRATION_FOUNDATION_FORMS).includes(form)) return solveIntegrationFoundation(form, input);
  return authoredSolver(form, input);
}

module.exports = { solvePrompt };
