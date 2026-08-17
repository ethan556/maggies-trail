const answers = require('./statProbabilityIndependentAnswers.json');
const { makeSolver } = require('./authoredTemplateIndependent.cjs');
const solveAuthoredPrompt = makeSolver(answers);

function solveOverlapCount(input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const values = [...prompt.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (values.length !== 4) {
    throw new Error(`expected four overlap-count quantities: ${prompt}`);
  }
  const [total, first, second, overlapOrNeither] = values;
  if (/at least one/i.test(prompt)) return first + second - overlapOrNeither;
  if (/\*\*both\*\*/i.test(prompt) && /neither/i.test(prompt)) {
    return first + second - (total - overlapOrNeither);
  }
  throw new Error(`unrecognized overlap-count prompt: ${prompt}`);
}

function solveJointProbability(input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const values = [...prompt.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (values.length !== 4) {
    throw new Error(`expected four joint-probability quantities: ${prompt}`);
  }
  const [total, , , joint] = values;
  return Math.round((joint / total) * 1000) / 1000;
}

function numbers(input) {
  return [...String(input).matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
}

function round3(value) {
  return Math.round(value * 1000) / 1000;
}

function solveTableForm(form, input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const values = numbers(prompt);
  if (form === 'conditional-probability__cpr-marginal-prob__numeric') {
    if (values.length !== 3) throw new Error(`expected three marginal quantities: ${prompt}`);
    return round3((values[1] + values[2]) / values[0]);
  }
  if (values.length !== 4) throw new Error(`expected four table quantities: ${prompt}`);
  const [total, first, second, joint] = values;
  if (form === 'conditional-probability__cpr-complement-table__numeric') return round3((total - (first + second - joint)) / total);
  if (form === 'conditional-probability__cpr-conditional-table__numeric') return round3(joint / first);
  if (form === 'conditional-probability__cpr-reversal-error__numeric') return round3(joint / second);
  if (form === 'conditional-probability__cpr-table-union__numeric') return round3((first + second - joint) / total);
  throw new Error(`unsupported table form ${form}`);
}

function solveIndependenceDisjoint(input) {
  const prompt = String(input).split('||', 1)[0].trim();
  const values = numbers(prompt);
  if (values.length !== 2) throw new Error(`expected two probability values: ${prompt}`);
  const [a, b] = values;
  if (/mutually exclusive/i.test(prompt) && /P\(A \| B\)/.test(prompt)) return 0;
  if (/independent/i.test(prompt) && /P\(A and B\)/.test(prompt)) return round3(a * b);
  if (/mutually exclusive/i.test(prompt) && /P\(A or B\)/.test(prompt)) return round3(a + b);
  if (/independent/i.test(prompt) && /P\(A \| B\)/.test(prompt)) return a;
  throw new Error(`unrecognized independence/disjoint prompt: ${prompt}`);
}

function solvePrompt(form, input) {
  if (form === 'conditional-probability__cpr-overlap-count__numeric') {
    return solveOverlapCount(input);
  }
  if (form === 'conditional-probability__cpr-joint-prob__numeric') {
    return solveJointProbability(input);
  }
  if ([
    'conditional-probability__cpr-marginal-prob__numeric',
    'conditional-probability__cpr-complement-table__numeric',
    'conditional-probability__cpr-conditional-table__numeric',
    'conditional-probability__cpr-reversal-error__numeric',
    'conditional-probability__cpr-table-union__numeric',
  ].includes(form)) {
    return solveTableForm(form, input);
  }
  if (form === 'conditional-probability__cpr-indep-vs-disjoint__numeric') {
    return solveIndependenceDisjoint(input);
  }
  return solveAuthoredPrompt(form, input);
}

module.exports = { solvePrompt };
