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
  return solveAuthoredPrompt(form, input);
}

module.exports = { solvePrompt };
