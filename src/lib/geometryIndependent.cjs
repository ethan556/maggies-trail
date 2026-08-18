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

function printedShift(expression, variable) {
  const match = expression.match(new RegExp(`${variable}\\s*([+−-])\\s*(\\d+)`));
  if (!match) throw new Error(`cannot parse ${variable}-shift from ${expression}`);
  return (match[1] === '+' ? 1 : -1) * Number(match[2]);
}

function printedTranslationRule(dx, dy) {
  const term = (variable, delta) => `${variable} ${delta < 0 ? '−' : '+'} ${Math.abs(delta)}`;
  return `(x, y) → (${term('x', dx)}, ${term('y', dy)})`;
}

function reflectedPoint(mirror, x, y) {
  if (mirror === 'the x-axis') return [x, -y];
  if (mirror === 'the y-axis') return [-x, y];
  if (mirror === 'the line y = x') return [y, x];
  if (mirror === 'the line y = −x') return [-y, -x];
  throw new Error(`unsupported mirror ${mirror}`);
}

function rotatedPoint(degrees, x, y) {
  if (degrees === 90) return [-y, x];
  if (degrees === 180) return [-x, -y];
  if (degrees === 270) return [y, -x];
  throw new Error(`unsupported rotation ${degrees}`);
}

function printedPoint(x, y) {
  return `(${x}, ${y})`;
}

function solvePrompt(form, input) {
  const entry = FORM_INDEX.get(form);
  if (!entry) throw new Error(`unsupported geometry independent form ${form}`);
  const prompt = basePrompt(input);
  /* S246: transformation-rule variants are solved from the learner-visible
   * coordinates and motion, independent of the generator's case tables. */
  if (form === 'gf-translation-rule__numeric') {
    const match = prompt.match(/Translation \(x, y\) → \(([^,]+), ([^)]+)\) sends P\((-?\d+), (-?\d+)\) to P′\. Find P′'s ([xy])-coordinate\./);
    if (match) {
      const x = Number(match[3]);
      const y = Number(match[4]);
      const dx = printedShift(match[1], 'x');
      const dy = printedShift(match[2], 'y');
      return match[5] === 'x' ? x + dx : y + dy;
    }
  }
  if (form === 'gf-translation-rule__mcq') {
    const match = prompt.match(/sends A\((-?\d+), (-?\d+)\) to A′\((-?\d+), (-?\d+)\)/);
    if (match) {
      const dx = Number(match[3]) - Number(match[1]);
      const dy = Number(match[4]) - Number(match[2]);
      return printedTranslationRule(dx, dy);
    }
  }
  if (form === 'gf-reflection-rule__numeric') {
    const match = prompt.match(/Reflect P\((-?\d+), (-?\d+)\) across (the x-axis|the y-axis|the line y = x|the line y = −x)\. Find P′'s ([xy])-coordinate\./);
    if (match) {
      const [imageX, imageY] = reflectedPoint(match[3], Number(match[1]), Number(match[2]));
      return match[4] === 'x' ? imageX : imageY;
    }
  }
  if (form === 'gf-reflection-rule__mcq') {
    const match = prompt.match(/Point P\((-?\d+), (-?\d+)\) maps to P′\((-?\d+), (-?\d+)\) under a reflection/);
    if (match) {
      const x = Number(match[1]);
      const y = Number(match[2]);
      const image = [Number(match[3]), Number(match[4])];
      const mirrors = ['the x-axis', 'the y-axis', 'the line y = x', 'the line y = −x'];
      const matches = mirrors.filter((mirror) => {
        const candidate = reflectedPoint(mirror, x, y);
        return candidate[0] === image[0] && candidate[1] === image[1];
      });
      if (matches.length !== 1) throw new Error(`reflection prompt has ${matches.length} solutions: ${prompt}`);
      return matches[0];
    }
  }
  if (form === 'gf-rotation-rule__numeric') {
    const match = prompt.match(/Rotate P\((-?\d+), (-?\d+)\) (90|180|270)° counterclockwise about the origin\. Find P′'s ([xy])-coordinate\./);
    if (match) {
      const [imageX, imageY] = rotatedPoint(Number(match[3]), Number(match[1]), Number(match[2]));
      return match[4] === 'x' ? imageX : imageY;
    }
  }
  if (form === 'gf-rotation-rule__mcq') {
    const match = prompt.match(/sends P\((-?\d+), (-?\d+)\) to P′\((-?\d+), (-?\d+)\)/);
    if (match) {
      const x = Number(match[1]);
      const y = Number(match[2]);
      const image = [Number(match[3]), Number(match[4])];
      const matches = [90, 180, 270].filter((degrees) => {
        const candidate = rotatedPoint(degrees, x, y);
        return candidate[0] === image[0] && candidate[1] === image[1];
      });
      if (matches.length !== 1) throw new Error(`rotation prompt has ${matches.length} solutions: ${prompt}`);
      return `${matches[0]}° counterclockwise about the origin`;
    }
  }
  if (form === 'gf-composition__numeric' || form === 'gf-composition__mcq') {
    const match = prompt.match(/Start at P\((-?\d+), (-?\d+)\)\. Apply translation \(x, y\) → \(([^,]+), ([^)]+)\), then rotate (90|180|270)° counterclockwise about the origin\./);
    if (match) {
      const x = Number(match[1]);
      const y = Number(match[2]);
      const dx = printedShift(match[3], 'x');
      const dy = printedShift(match[4], 'y');
      const [finalX, finalY] = rotatedPoint(Number(match[5]), x + dx, y + dy);
      if (form === 'gf-composition__mcq') return printedPoint(finalX, finalY);
      const axisMatch = prompt.match(/Find the final ([xy])-coordinate\./);
      if (!axisMatch) throw new Error(`composition prompt omits requested coordinate: ${prompt}`);
      return axisMatch[1] === 'x' ? finalX : finalY;
    }
  }
  if (form === 'gf-line-symmetry__numeric') {
    const match = prompt.match(/regular (\d+)-gon have\?/);
    if (match) return Number(match[1]);
  }
  if (form === 'gf-line-symmetry__mcq') {
    const match = prompt.match(/exactly (\d+) lines of symmetry/);
    if (match) return `a regular ${Number(match[1])}-gon`;
  }
  if (form === 'gf-rotational-symmetry__numeric') {
    const match = prompt.match(/regular (\d+)-gon has rotational symmetry of order (\d+)/);
    if (match) {
      const sides = Number(match[1]);
      const order = Number(match[2]);
      if (sides !== order) throw new Error(`regular polygon order disagrees with side count: ${prompt}`);
      return 360 / order;
    }
  }
  if (form === 'gf-rotational-symmetry__mcq') {
    const match = prompt.match(/regular (\d+)-gon/);
    if (match) {
      const sides = Number(match[1]);
      return `order ${sides}; smallest turn ${360 / sides}°`;
    }
  }
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
  /* S246: coordinate-proof generators are checked from the quantities printed
   * in each prompt. These solvers intentionally do not share the generator's
   * case tables, so a stale key or mathematically inconsistent prompt fails. */
  if (form === 'cx-circle-cts__numeric') {
    const match = prompt.match(/D = (-?\d+), E = (-?\d+), and F = (-?\d+)/);
    if (match) {
      const d = Number(match[1]);
      const e = Number(match[2]);
      const f = Number(match[3]);
      return (d / 2) ** 2 + (e / 2) ** 2 - f;
    }
  }
  if (form === 'cx-circle-eq__numeric') {
    const match = prompt.match(/centered at \((-?\d+), (-?\d+)\) and passes through \((-?\d+), (-?\d+)\)/);
    if (match) {
      const dx = Number(match[3]) - Number(match[1]);
      const dy = Number(match[4]) - Number(match[2]);
      return dx * dx + dy * dy;
    }
  }
  if (form === 'cx-circle-position__numeric') {
    const match = prompt.match(/centered at \((-?\d+), (-?\d+)\).*point \((-?\d+), (-?\d+)\)/);
    if (match) {
      const dx = Number(match[3]) - Number(match[1]);
      const dy = Number(match[4]) - Number(match[2]);
      return dx * dx + dy * dy;
    }
  }
  if (form === 'cx-classify-quad__numeric') {
    const match = prompt.match(/B\((-?\d+), (-?\d+)\), and D\((-?\d+), (-?\d+)\)/);
    if (match) {
      const bx = Number(match[1]);
      const by = Number(match[2]);
      const dx = Number(match[3]);
      const dy = Number(match[4]);
      const first = bx * bx + by * by;
      const second = dx * dx + dy * dy;
      if (first !== second || bx * dx + by * dy !== 0) throw new Error(`prompt does not define equal perpendicular square sides: ${prompt}`);
      return first;
    }
  }
  if (form === 'cx-classify-tri__numeric') {
    const match = prompt.match(/B\((-?\d+), (-?\d+)\), and C\((-?\d+), (-?\d+)\)/);
    if (match) {
      const bx = Number(match[1]);
      const by = Number(match[2]);
      const cx = Number(match[3]);
      const cy = Number(match[4]);
      if (bx * cx + by * cy !== 0 || bx * bx + by * by !== cx * cx + cy * cy) {
        throw new Error(`prompt does not define a right-isosceles triangle: ${prompt}`);
      }
      const dx = cx - bx;
      const dy = cy - by;
      return dx * dx + dy * dy;
    }
  }
  if (form === 'cx-dist-apps__numeric') {
    const match = prompt.match(/vertices \(0, 0\), \((-?\d+), 0\), and \((-?\d+), (-?\d+)\)/);
    if (match) {
      const base = Math.abs(Number(match[1]));
      const apexX = Number(match[2]);
      const apexY = Number(match[3]);
      const left = Math.hypot(apexX, apexY);
      const right = Math.hypot(base - apexX, apexY);
      return base + left + right;
    }
  }
  if (form === 'cx-general-proof__numeric') {
    const match = prompt.match(/B\((-?\d+), 0\), C\((-?\d+), (-?\d+)\), D\(0, (-?\d+)\)/);
    if (match) {
      const width = Number(match[1]);
      const height = Number(match[3]);
      if (Number(match[2]) !== width || Number(match[4]) !== height) throw new Error(`malformed rectangle prompt: ${prompt}`);
      return Math.hypot(width, height);
    }
  }
  if (form === 'cx-parallel-proof__numeric') {
    const match = prompt.match(/through \((-?\d+), (-?\d+)\).*slope (-?\d+)\/(\d+)\. Find its y-coordinate when x = (-?\d+)/);
    if (match) {
      const x0 = Number(match[1]);
      const y0 = Number(match[2]);
      const p = Number(match[3]);
      const q = Number(match[4]);
      const x = Number(match[5]);
      return y0 + (p * (x - x0)) / q;
    }
  }
  if (form === 'cx-partition__numeric') {
    const match = prompt.match(/A\((-?\d+), (-?\d+)\) to B\((-?\d+), (-?\d+)\).*AP:PB = (\d+):(\d+)/);
    if (match) {
      const ax = Number(match[1]);
      const bx = Number(match[3]);
      const m = Number(match[5]);
      const n = Number(match[6]);
      return (n * ax + m * bx) / (m + n);
    }
  }
  if (form === 'cx-perp-proof__numeric') {
    const match = prompt.match(/through \((-?\d+), (-?\d+)\).*slope (-?\d+)\/(\d+)\. Find its y-coordinate when x = (-?\d+)/);
    if (match) {
      const x0 = Number(match[1]);
      const y0 = Number(match[2]);
      const p = Number(match[3]);
      const q = Number(match[4]);
      const x = Number(match[5]);
      if (p === 0) throw new Error(`perpendicular source slope cannot be zero in numeric prompt: ${prompt}`);
      return y0 - (q * (x - x0)) / p;
    }
  }
  if (form === 'cx-shoelace__numeric') {
    const match = prompt.match(/\(0, 0\), \((-?\d+), 0\), \((-?\d+), (-?\d+)\), \((-?\d+), (-?\d+)\)/);
    if (match) {
      const points = [
        [0, 0],
        [Number(match[1]), 0],
        [Number(match[2]), Number(match[3])],
        [Number(match[4]), Number(match[5])],
      ];
      let cross = 0;
      for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        cross += current[0] * next[1] - current[1] * next[0];
      }
      return Math.abs(cross) / 2;
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
