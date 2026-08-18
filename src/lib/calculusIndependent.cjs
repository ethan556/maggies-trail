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
  return authoredSolver(form, input);
}

module.exports = { solvePrompt };
