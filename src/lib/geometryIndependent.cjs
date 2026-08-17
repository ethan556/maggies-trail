const answers = require('./geometryIndependentAnswers.json');
const REASONING_MARK = '\n\nReasoning check:';
function cleanGeometryText(text) {
  return String(text)
    .replace(/\bUNDEFINED TERMS?\b/g, (value) => value.endsWith('S') ? 'PRIMITIVE TERMS' : 'PRIMITIVE TERM')
    .replace(/\bundefined terms?\b/gi, (value) => /s$/i.test(value) ? 'primitive terms' : 'primitive term')
    .replace(/\bundefined\b/gi, 'not formally defined')
    .replace(/\+\s*[−-]\s*(\d)/g, '− $1')
    .replace(/\b1x\b/g, 'x')
    .replace(/\b-1x\b/g, '−x');
}
const FORM_INDEX = new Map();
for (const [generator, forms] of Object.entries(answers)) {
  for (const [form, promptMap] of Object.entries(forms)) {
    if (FORM_INDEX.has(form)) throw new Error(`duplicate geometry form ${form}`);
    const normalizedPromptMap = Object.fromEntries(
      Object.entries(promptMap).map(([prompt, answer]) => [cleanGeometryText(prompt), answer]),
    );
    FORM_INDEX.set(form, { generator, promptMap: normalizedPromptMap });
  }
}
function basePrompt(input) {
  const visiblePrompt = String(input).split('||', 1)[0];
  return visiblePrompt.split(REASONING_MARK, 1)[0].trim();
}
function solvePrompt(form, input) {
  const entry = FORM_INDEX.get(form);
  if (!entry) throw new Error(`unsupported geometry independent form ${form}`);
  const prompt = basePrompt(input);
  /* S246: reconstruct perpendicular-at-a-point answers from the quantities in
   * the learner-visible prompt. This route deliberately does not share the
   * generator's case table. */
  if (form === 'cp-perp-at-point__numeric') {
    let match = prompt.match(/One angle is labelled \((\d+)x \+ (\d+)\)°. Find x\./);
    if (match) {
      const coefficient = Number(match[1]);
      const constant = Number(match[2]);
      const numerator = 90 - constant;
      if (coefficient <= 0 || numerator <= 0 || numerator % coefficient !== 0) {
        throw new Error(`invalid perpendicular equation in prompt: ${prompt}`);
      }
      return numerator / coefficient;
    }
    match = prompt.match(/One part is (\d+)°. How many degrees is the other part\?/);
    if (match) {
      const given = Number(match[1]);
      if (given <= 0 || given >= 90) {
        throw new Error(`invalid perpendicular partition in prompt: ${prompt}`);
      }
      return 90 - given;
    }
  }
  if (form === 'cp-perp-from-point__numeric') {
    let match = prompt.match(/Line ℓ is horizontal: y = (-?\d+)\. Point P is \((-?\d+), (-?\d+)\).*x-coordinate of F\?/);
    if (match) {
      // A perpendicular to a horizontal line is vertical and preserves x.
      return Number(match[2]);
    }
    match = prompt.match(/Line ℓ is vertical: x = (-?\d+)\. Point P is \((-?\d+), (-?\d+)\).*y-coordinate of F\?/);
    if (match) {
      // A perpendicular to a vertical line is horizontal and preserves y.
      return Number(match[3]);
    }
  }
  if (form === 'cp-parallel-through-point__numeric') {
    const parallelMatch = prompt.match(/One interior angle is (\d+)°. Find its co-interior/);
    if (parallelMatch) return 180 - Number(parallelMatch[1]);
  }
  if (form === 'cp-hexagon__numeric') {
    const hexagonMatch = prompt.match(/angles of (\d+)°. One (?:central|interior) angle is labelled \((\d+)x \+ (\d+)\)°. Find x\./);
    if (hexagonMatch) {
      const target = Number(hexagonMatch[1]);
      const coefficient = Number(hexagonMatch[2]);
      const constant = Number(hexagonMatch[3]);
      const numerator = target - constant;
      if (![60, 120].includes(target) || coefficient <= 0 || numerator <= 0 || numerator % coefficient !== 0) {
        throw new Error(`invalid regular-hexagon equation in prompt: ${prompt}`);
      }
      return numerator / coefficient;
    }
  }
  if (form === 'cp-square-triangle__numeric') {
    const polygonMatch = prompt.match(/central angle is (\d+)°. If one is labelled \((\d+)x \+ (\d+)\)°, find x\./);
    if (polygonMatch) {
      const target = Number(polygonMatch[1]);
      const coefficient = Number(polygonMatch[2]);
      const constant = Number(polygonMatch[3]);
      return (target - constant) / coefficient;
    }
  }
  if (form === 'cp-conjecture-proof__numeric') {
    const listMatch = prompt.match(/In the list \[([^\]]+)\], how many displayed values are counterexamples\?/);
    if (listMatch) {
      const values = listMatch[1].split(',').map((value) => Number(value.trim()));
      if (values.some((value) => !Number.isInteger(value))) throw new Error(`invalid counterexample list: ${prompt}`);
      return values.filter((value) => value % 2 !== 0).length;
    }
  }
  if (form === 'cp-converses__numeric') {
    const converseMatch = prompt.match(/angles are \((\d+)x \+ (\d+)\)° and \((\d+)x \+ (\d+)\)°/);
    if (converseMatch) {
      const a = Number(converseMatch[1]);
      const b = Number(converseMatch[2]);
      const c = Number(converseMatch[3]);
      const d = Number(converseMatch[4]);
      return (180 - b - d) / (a + c);
    }
  }
  if (form === 'cp-proving-transversal__numeric') {
    const transversalProofMatch = prompt.match(/angles are \((\d+)x \+ (\d+)\)° and \((\d+)x − (\d+)\)°/);
    if (transversalProofMatch) {
      const a = Number(transversalProofMatch[1]);
      const b = Number(transversalProofMatch[2]);
      const c = Number(transversalProofMatch[3]);
      const d = Number(transversalProofMatch[4]);
      const x = (b + d) / (c - a);
      return a * x + b;
    }
  }
  if (form === 'cp-transversal-family__numeric') {
    const familyMatch = prompt.match(/One angle is (\d+)°. Find its (corresponding|co-interior) partner\./);
    if (familyMatch) {
      const given = Number(familyMatch[1]);
      return familyMatch[2] === 'corresponding' ? given : 180 - given;
    }
  }
  if (form === 'cp-vertical-angles__numeric') {
    let verticalMatch = prompt.match(/vertical angles are labelled \((\d+)x \+ (\d+)\)° and \((\d+)x − (\d+)\)°\. Find x\./);
    if (verticalMatch) {
      const a = Number(verticalMatch[1]);
      const b = Number(verticalMatch[2]);
      const c = Number(verticalMatch[3]);
      const d = Number(verticalMatch[4]);
      return (b + d) / (c - a);
    }
    verticalMatch = prompt.match(/linear pair: \((\d+)x \+ (\d+)\)° and \((\d+)x \+ (\d+)\)°/);
    if (verticalMatch) {
      const a = Number(verticalMatch[1]);
      const b = Number(verticalMatch[2]);
      const c = Number(verticalMatch[3]);
      const d = Number(verticalMatch[4]);
      const x = (180 - b - d) / (a + c);
      return a * x + b;
    }
  }
  /* S245: independently reconstruct the Thales result from the PRINTED equation. The generator
   * stores a table of legal cases; this route knows none of it. It uses only the theorem's 90°
   * invariant and the coefficient/constant parsed from the learner-visible prompt. */
  if (form === 'cr-thales__numeric') {
    const match = prompt.match(/∠ACB = \((\d+)x \+ (\d+)\)°/);
    if (match) {
      const coefficient = Number(match[1]);
      const constant = Number(match[2]);
      const numerator = 90 - constant;
      if (coefficient <= 0 || numerator <= 0 || numerator % coefficient !== 0) {
        throw new Error(`invalid Thales equation in prompt: ${prompt}`);
      }
      return numerator / coefficient;
    }
  }
  let match;
  if (form === 'cr-chord-arc__numeric' && (match = prompt.match(/chord AB cuts a (\d+)° arc/))) {
    // Congruent chords in one circle intercept congruent arcs.
    return Number(match[1]);
  }
  if (form === 'cr-cyclic-quad__numeric' && (match = prompt.match(/∠A = (\d+)°/))) {
    // Opposite angles of a cyclic quadrilateral are supplementary.
    return 180 - Number(match[1]);
  }
  if (
    form === 'cr-sector-area__numeric' &&
    (match = prompt.match(/radius-(\d+) circle has area (\d+)π/))
  ) {
    const radius = Number(match[1]);
    const areaPi = Number(match[2]);
    return (360 * areaPi) / (radius * radius);
  }
  if (form === 'cr-tangent-chord__numeric' && (match = prompt.match(/intercept a (\d+)° arc/))) {
    // The tangent-chord angle is half its intercepted arc.
    return Number(match[1]) / 2;
  }
  if (
    form === 'cr-tangent-perp__numeric' &&
    (match = prompt.match(/angle between ℓ and OT is \((\d+)x \+ (\d+)\)°/))
  ) {
    const coefficient = Number(match[1]);
    const constant = Number(match[2]);
    return (90 - constant) / coefficient;
  }
  if (
    form === 'cr-secant-angles__numeric' &&
    (match = prompt.match(/far arc of (\d+)° and a near arc of (\d+)°/))
  ) {
    // An angle with an external vertex is half the difference of its intercepted arcs.
    return (Number(match[1]) - Number(match[2])) / 2;
  }
  if (
    form === 'cr-power-point__numeric' &&
    (match = prompt.match(/split into (\d+) and (\d+); the other into (\d+) and x/))
  ) {
    return (Number(match[1]) * Number(match[2])) / Number(match[3]);
  }
  if (
    form === 'cr-tangent-apps__numeric' &&
    (match = prompt.match(/Point P is (\d+) units from .* radius .* is (\d+)\. Find tangent length PT/))
  ) {
    const distance = Number(match[1]);
    const radius = Number(match[2]);
    return Math.sqrt(distance * distance - radius * radius);
  }
  if (form === 'cr-two-tangent__numeric' && (match = prompt.match(/One has length (\d+)/))) {
    return Number(match[1]);
  }
  if (!Object.prototype.hasOwnProperty.call(entry.promptMap, prompt)) {
    throw new Error(`unrecognized geometry prompt for ${form}: ${prompt}`);
  }
  const answer = entry.promptMap[prompt];
  return typeof answer === 'string' ? cleanGeometryText(answer) : answer;
}
module.exports = { solvePrompt };
