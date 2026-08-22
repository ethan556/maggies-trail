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

function correspondingSide(left, right, source) {
  const positions = [...source].map((vertex) => left.indexOf(vertex));
  if (positions.length !== 2 || positions.some((position) => position < 0)) {
    throw new Error(`side ${source} is not part of triangle ${left}`);
  }
  return positions.map((position) => right[position]).join('');
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
  if (form === 'gf-congruence-def__numeric') {
    let match = prompt.match(/A dilation with scale factor (\d+) maps a segment of length (\d+)/);
    if (match) return Number(match[1]) * Number(match[2]);
    match = prompt.match(/A (?:translation|reflection|rotation) maps (?:an angle measuring (\d+)°|a segment of length (\d+))/);
    if (match) return Number(match[1] ?? match[2]);
  }
  if (form === 'gf-congruence-def__mcq') {
    if (/^A dilation with scale factor/.test(prompt)) {
      return 'F and F′ are not necessarily congruent because the rule changes lengths.';
    }
    if (/^A (?:translation|reflection|90°|180°|270°)/.test(prompt)) {
      return 'F and F′ are congruent because every distance and angle is preserved.';
    }
  }
  if (form === 'gf-find-motion__numeric') {
    const match = prompt.match(/sends A\((-?\d+), (-?\d+)\) to A′\((-?\d+), (-?\d+)\)\. It sends P\((-?\d+), (-?\d+)\) to P′\. Find P′'s ([xy])-coordinate/);
    if (match) {
      const dx = Number(match[3]) - Number(match[1]);
      const dy = Number(match[4]) - Number(match[2]);
      return match[7] === 'x' ? Number(match[5]) + dx : Number(match[6]) + dy;
    }
  }
  if (form === 'gf-find-motion__mcq') {
    const match = prompt.match(/Point P\((-?\d+), (-?\d+)\) maps to P′\((-?\d+), (-?\d+)\)/);
    if (match) {
      const x = Number(match[1]);
      const y = Number(match[2]);
      const image = [Number(match[3]), Number(match[4])];
      const candidates = [
        ['reflection across the x-axis', [x, -y]],
        ['reflection across the y-axis', [-x, y]],
        ['90° counterclockwise rotation about the origin', [-y, x]],
        ['180° rotation about the origin', [-x, -y]],
      ];
      const matches = candidates.filter(([, point]) => point[0] === image[0] && point[1] === image[1]);
      if (matches.length !== 1) throw new Error(`find-motion prompt has ${matches.length} solutions: ${prompt}`);
      return matches[0][0];
    }
  }
  if (form === 'gf-corresponding-parts__numeric') {
    const match = prompt.match(/Δ([A-Z]{3}) ≅ Δ([A-Z]{3})\. If ([A-Z]{2}) = (\d+), find ([A-Z]{2})\./);
    if (match) {
      const expected = correspondingSide(match[1], match[2], match[3]);
      if (match[5] !== expected) throw new Error(`asked segment does not match congruence order: ${prompt}`);
      return Number(match[4]);
    }
  }
  if (form === 'gf-corresponding-parts__mcq') {
    const match = prompt.match(/Given Δ([A-Z]{3}) ≅ Δ([A-Z]{3}), which segment corresponds to ([A-Z]{2})\?/);
    if (match) return correspondingSide(match[1], match[2], match[3]);
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
      return Number((y0 - (q * (x - x0)) / p).toFixed(3));
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
  /* S331 / lane G1: the sixteen state-varying g10-right-triangles numeric forms. Every branch
   * re-derives the answer from the PRINTED numbers — Pythagorean answers by integer search
   * rather than square roots, trig answers re-rounded by the half-up-on-scaled-integers rule
   * the prompt's stated convention implies. None of these read the generator's state tables. */
  const RT_RAD = Math.PI / 180;
  const rtHalfUp = (x, dp) => {
    const scale = Math.pow(10, dp);
    const scaled = x * scale;
    const floor = Math.floor(scaled);
    return (scaled - floor >= 0.5 ? floor + 1 : floor) / scale;
  };
  const rtSearch = (holds) => {
    for (let n = 1; n <= 4000; n += 1) if (holds(n)) return n;
    throw new Error(`no integer solution in right-triangle search: ${prompt}`);
  };
  if (form === 'rt-pythagorean__numeric') {
    const m = prompt.match(/^A right triangle has legs (\d+) and (\d+)\. Find the hypotenuse\.$/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      return rtSearch((c) => c * c === a * a + b * b);
    }
  }
  if (form === 'rt-pythagorean-leg__numeric') {
    const m = prompt.match(/^The hypotenuse is (\d+) and one leg is (\d+)\. Find the other leg\.$/);
    if (m) {
      const [c, a] = [Number(m[1]), Number(m[2])];
      return rtSearch((b) => b * b === c * c - a * a);
    }
  }
  if (form === 'rt-pythagorean-apply__numeric') {
    let m = prompt.match(/^A (\d+) ft ladder leans against a wall with its base (\d+) ft from the wall/);
    if (m) {
      const [c, a] = [Number(m[1]), Number(m[2])];
      return rtSearch((h) => h * h === c * c - a * a);
    }
    m = prompt.match(/^A rectangular field is (\d+) m by (\d+) m/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      return rtSearch((d) => d * d === a * a + b * b);
    }
  }
  if (form === 'rt-triples__numeric') {
    const m = prompt.match(/^Legs (\d+) and (\d+) — use a scaled triple/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      return rtSearch((c) => c * c === a * a + b * b);
    }
  }
  if (form === 'rt-454590__numeric') {
    let m = prompt.match(/^A 45-45-90 triangle has legs of (\d+)\. Find the hypotenuse/);
    if (m) return rtHalfUp(Number(m[1]) * Math.sqrt(2), 2);
    m = prompt.match(/^A 45-45-90 triangle has hypotenuse (\d+)\. Find each leg/);
    if (m) return rtHalfUp(Number(m[1]) / Math.sqrt(2), 2);
  }
  if (form === 'rt-454590-apply__numeric') {
    const m = prompt.match(/^A square has sides of (\d+) cm\. How long is its diagonal/);
    if (m) return rtHalfUp(Number(m[1]) * Math.sqrt(2), 2);
  }
  if (form === 'rt-306090__numeric') {
    let m = prompt.match(/^A 30-60-90 triangle has short leg (\d+)\. Find the hypotenuse\.$/);
    if (m) return 2 * Number(m[1]);
    m = prompt.match(/^A 30-60-90 triangle has hypotenuse (\d+)\. Find the LONG leg/);
    if (m) return rtHalfUp((Number(m[1]) / 2) * Math.sqrt(3), 2);
    m = prompt.match(/^A 30-60-90 triangle has long leg (\d+)\. Find the hypotenuse/);
    if (m) return rtHalfUp((2 * Number(m[1])) / Math.sqrt(3), 2);
  }
  if (form === 'rt-sohcahtoa__numeric') {
    const m = prompt.match(/^In a (\d+)-(\d+)-(\d+) right triangle, θ is the angle whose opposite side is (\d+)\. What is (sin|cos|tan) θ/);
    if (m) {
      const [a, b, c, opp] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      const adj = opp === a ? b : a;
      const value = m[5] === 'sin' ? opp / c : m[5] === 'cos' ? adj / c : opp / adj;
      return rtHalfUp(value, 2);
    }
  }
  if (form === 'rt-inverse-trig__numeric') {
    let m = prompt.match(/^Right triangle: the side opposite θ is (\d+), the hypotenuse is (\d+)\./);
    if (m) return rtHalfUp(Math.asin(Number(m[1]) / Number(m[2])) / RT_RAD, 2);
    m = prompt.match(/^Legs (\d+) and (\d+); θ is the angle OPPOSITE the leg of length (\d+)\./);
    if (m) {
      const p = Number(m[3]);
      const q = p === Number(m[1]) ? Number(m[2]) : Number(m[1]);
      return rtHalfUp(Math.atan(p / q) / RT_RAD, 2);
    }
    m = prompt.match(/^A ramp rises ([\d.]+) m over a horizontal run of ([\d.]+) m\./);
    if (m) return rtHalfUp(Math.atan(Number(m[1]) / Number(m[2])) / RT_RAD, 2);
  }
  if (form === 'rt-elev-depress__numeric') {
    let m = prompt.match(/^From (\d+) m away \(on flat ground\), the angle of elevation to a (?:treetop|rooftop) is (\d+)°/);
    if (m) return rtHalfUp(Number(m[1]) * Math.tan(Number(m[2]) * RT_RAD), 2);
    m = prompt.match(/^From the top of a (\d+) m cliff, the angle of depression to a boat is (\d+)°/);
    if (m) return rtHalfUp(Number(m[1]) / Math.tan(Number(m[2]) * RT_RAD), 2);
  }
  if (form === 'rt-height-apps__numeric') {
    let m = prompt.match(/^You stand (\d+) m from a building; the angle of elevation to its top is (\d+)°, measured from an eye height of ([\d.]+) m\./);
    if (m) return rtHalfUp(Number(m[1]) * Math.tan(Number(m[2]) * RT_RAD) + Number(m[3]), 2);
    m = prompt.match(/^A kite flies on a taut (\d+) m string at (\d+)° elevation\./);
    if (m) return rtHalfUp(Number(m[1]) * Math.sin(Number(m[2]) * RT_RAD), 2);
    m = prompt.match(/^A plane is at (\d+) m altitude; the angle of depression to the airport is (\d+)°\./);
    if (m) return rtHalfUp(Number(m[1]) / Math.tan(Number(m[2]) * RT_RAD), 2);
  }
  if (form === 'rt-trig-apps__numeric') {
    let m = prompt.match(/^The sun is at (\d+)° elevation\. How long a shadow does a (\d+) m tree cast/);
    if (m) return rtHalfUp(Number(m[2]) / Math.tan(Number(m[1]) * RT_RAD), 2);
    m = prompt.match(/^A guy wire runs from the top of an? (\d+) m pole to the ground, meeting it at (\d+)°\./);
    if (m) return rtHalfUp(Number(m[1]) / Math.sin(Number(m[2]) * RT_RAD), 2);
  }
  if (form === 'rt-law-sines__numeric') {
    let m = prompt.match(/^In triangle ABC: A = (\d+)°, B = (\d+)°, and side a = (\d+) \(opposite A\)\. Find side b/);
    if (m) {
      const [A, B, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return rtHalfUp((a * Math.sin(B * RT_RAD)) / Math.sin(A * RT_RAD), 2);
    }
    m = prompt.match(/^Surveyors at A and B stand (\d+) m apart on a riverbank\. A tree T sits across the river; angle A \(∠TAB\) = (\d+)° and angle B \(∠TBA\) = (\d+)°\./);
    if (m) {
      const [d, A, B] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const T = 180 - A - B;
      return rtHalfUp((d * Math.sin(B * RT_RAD)) / Math.sin(T * RT_RAD), 2);
    }
  }
  if (form === 'rt-law-cosines__numeric') {
    let m = prompt.match(/^a = (\d+), b = (\d+), included angle C = (\d+)°\. Find side c/);
    if (m) {
      const [a, b, C] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return rtHalfUp(Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C * RT_RAD)), 2);
    }
    m = prompt.match(/^Sides (\d+), (\d+), and (\d+)\. Find the angle OPPOSITE the (\d+), in degrees/);
    if (m) {
      const [p, q, r, target] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      if (target !== r) throw new Error(`right-triangle law-of-cosines prompt asks about a side other than the largest: ${prompt}`);
      return rtHalfUp(Math.acos((p * p + q * q - r * r) / (2 * p * q)) / RT_RAD, 1);
    }
    m = prompt.match(/^A ship sails (\d+) km, turns so the two path segments meet at (\d+)°, then sails (\d+) km\./);
    if (m) {
      const [u, t, v] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return rtHalfUp(Math.sqrt(u * u + v * v - 2 * u * v * Math.cos(t * RT_RAD)), 2);
    }
  }
  if (form === 'rt-choose-tool__numeric') {
    let m = prompt.match(/^Two sides measure (\d+) and (\d+), meeting at (\d+)°\. Area/);
    if (m) return rtHalfUp(0.5 * Number(m[1]) * Number(m[2]) * Math.sin(Number(m[3]) * RT_RAD), 2);
    m = prompt.match(/^A RIGHT triangle: the leg adjacent to the (\d+)° angle is (\d+)\. The opposite leg/);
    if (m) return rtHalfUp(Number(m[2]) * Math.tan(Number(m[1]) * RT_RAD), 2);
    m = prompt.match(/^A triangular garden bed has sides (\d+) m and (\d+) m meeting at 30°/);
    if (m) return (Number(m[1]) * Number(m[2])) / 4;
  }
  if (form === 'rt-trig-constant__numeric') {
    const m = prompt.match(/what is (sin|cos|tan) (\d+)°( exactly|, rounded to 2 decimals)\?$/);
    if (m) {
      const [fn, deg, mode] = [m[1], Number(m[2]), m[3]];
      if (mode === ' exactly') {
        const EXACT = { 'tan45': 1, 'sin30': 0.5, 'cos60': 0.5 };
        const key = `${fn}${deg}`;
        if (!(key in EXACT)) throw new Error(`no exact rational value for ${key}: ${prompt}`);
        return EXACT[key];
      }
      const raw = fn === 'sin' ? Math.sin(deg * RT_RAD) : fn === 'cos' ? Math.cos(deg * RT_RAD) : Math.tan(deg * RT_RAD);
      return rtHalfUp(raw, 2);
    }
  }
  /* S331 / lane G1: the twelve state-varying g10-solid-geometry exactNumberLab forms. Answers are
   * re-derived from the printed dimensions — square roots and cube roots by integer search, π at
   * the prompt's stated 3.14159 wherever a decimal answer is requested. */
  const SG_PI = 3.14159;
  if (form === 'sg-revolution__numeric') {
    let m = prompt.match(/^A (\d+)-by-(\d+) rectangle spins about its (\d+)-unit side/);
    if (m) {
      const axis = Number(m[3]);
      const radius = Number(m[1]) === axis ? Number(m[2]) : Number(m[1]);
      return radius * radius * axis;
    }
    m = prompt.match(/^A right triangle with legs (\d+) and (\d+) spins about its (\d+)-unit leg/);
    if (m) {
      const axis = Number(m[3]);
      const radius = Number(m[1]) === axis ? Number(m[2]) : Number(m[1]);
      return (radius * radius * axis) / 3;
    }
    m = prompt.match(/^You need a cone of radius (\d+) and height (\d+) by revolution/);
    if (m) {
      const [r, h] = [Number(m[1]), Number(m[2])];
      return rtSearch((c) => c * c === r * r + h * h);
    }
  }
  if (form === 'sg-cavalieri__numeric') {
    let m = prompt.match(/^An oblique \(leaning\) prism has base area (\d+), vertical height (\d+), and slant edge (\d+)/);
    if (m) return Number(m[1]) * Number(m[2]);
    m = prompt.match(/^A leaning cylinder has base radius (\d+), vertical height (\d+), and slant length (\d+)\./);
    if (m) return SG_PI * Number(m[1]) * Number(m[1]) * Number(m[2]);
    m = prompt.match(/^A leaning cylinder of radius (\d+) has a slant edge of length (\d+), and its top face is shifted (\d+) units/);
    if (m) {
      const [r, l, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const h = rtSearch((x) => x * x === l * l - d * d);
      return r * r * h;
    }
  }
  if (form === 'sg-cavalieri-apply__numeric') {
    let m = prompt.match(/^A square prism \(side (\d+), height (\d+)\) circumscribes a cylinder \(radius (\d+), height (\d+)\)/);
    if (m) return SG_PI * Number(m[3]) * Number(m[3]) * Number(m[4]);
    m = prompt.match(/^A leaning \(oblique\) cone: base radius (\d+), vertical height (\d+)/);
    if (m) return (Number(m[1]) * Number(m[1]) * Number(m[2])) / 3;
    m = prompt.match(/^A curvy vase of height (\d+) has horizontal cross-section area (\d+)π at EVERY height/);
    if (m) return Number(m[2]) * Number(m[1]);
  }
  if (form === 'sg-cylinder-justified__numeric') {
    let m = prompt.match(/^A cylinder has radius (\d+) and height (\d+)\. Its Cavalieri twin/);
    if (m) return Number(m[1]) * Number(m[1]) * Number(m[2]);
    m = prompt.match(/^A leaning cylinder: radius (\d+), vertical height (\d+), slant edge (\d+)/);
    if (m) return SG_PI * Number(m[1]) * Number(m[1]) * Number(m[2]);
    m = prompt.match(/^A tunnel's cross-section is a constant curvy shape of area (\d+) m², and the tunnel runs (\d+) m/);
    if (m) return Number(m[1]) * Number(m[2]);
  }
  if (form === 'sg-third-story__numeric') {
    let m = prompt.match(/^A cube of side (\d+) \(volume (\d+)\) is tiled by three congruent pyramids/);
    if (m) {
      const s = Number(m[1]);
      if (s * s * s !== Number(m[2])) throw new Error(`cube volume disagrees with its side: ${prompt}`);
      return (s * s * s) / 3;
    }
    m = prompt.match(/^A cone \(radius (\d+), height (\d+)\) is matched to a pyramid of base area (\d+)π/);
    if (m) {
      const [r, h, B] = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (r * r !== B) throw new Error(`cone base coefficient disagrees with its radius: ${prompt}`);
      return (B * h) / 3;
    }
    m = prompt.match(/^An oblique pyramid: base area (\d+), apex hovering (\d+) units above/);
    if (m) return (Number(m[1]) * Number(m[2])) / 3;
  }
  if (form === 'sg-density__numeric') {
    let m = prompt.match(/^A solid (?:steel|aluminum|copper|iron) sphere \(radius (\d+) cm, density ([\d.]+) g\/cm³\)/);
    if (m) {
      const r = Number(m[1]);
      return (4 / 3) * SG_PI * r * r * r * Number(m[2]);
    }
    m = prompt.match(/^A solid cube of side (\d+) cm has mass (\d+) g/);
    if (m) return Number(m[2]) / (Number(m[1]) * Number(m[1]) * Number(m[1]));
    m = prompt.match(/^A 'gold' crown has mass (\d+) g and displaces (\d+) cm³/);
    if (m) return Number(m[1]) / Number(m[2]);
  }
  if (form === 'sg-modeling__numeric') {
    let m = prompt.match(/^Painting a silo \(exposed surface (\d+)π ≈ ([\d.]+) units²\) at \$(\d+) per unit²/);
    if (m) return Number(m[2]) * Number(m[3]);
    m = prompt.match(/^A spherical tank's radius is scaled by (\d+)\./);
    if (m) return 1 / Number(m[1]);
    m = prompt.match(/^A client needs a spherical tank holding exactly (\d+)π units³/);
    if (m) {
      const V = Number(m[1]);
      return rtSearch((r) => 4 * r * r * r === 3 * V);
    }
  }
  if (form === 'sg-cross-sections__numeric') {
    let m = prompt.match(/^A sphere of radius (\d+) is sliced by a plane (\d+) units from its center\. The cross-section's AREA/);
    if (m) return SG_PI * (Number(m[1]) * Number(m[1]) - Number(m[2]) * Number(m[2]));
    m = prompt.match(/^A sphere of radius (\d+) is sliced by a plane, producing a cross-section of area (\d+)π/);
    if (m) {
      const [r, a] = [Number(m[1]), Number(m[2])];
      return rtSearch((d) => d * d === r * r - a);
    }
  }
  if (form === 'sg-section-reasoning__numeric') {
    let m = prompt.match(/^A sphere's great circle has circumference (\d+)π/);
    if (m) {
      const c = Number(m[1]);
      if (c % 2 !== 0) throw new Error(`odd circumference coefficient cannot come from an integer radius: ${prompt}`);
      const r = c / 2;
      return (4 * r * r * r) / 3;
    }
    m = prompt.match(/^A sphere-shaped tank's widest horizontal section \(through the center\) has area (\d+)π\. What is the area coefficient \(of π\) of the section (\d+) units above the center/);
    if (m) return Number(m[1]) - Number(m[2]) * Number(m[2]);
  }
  if (form === 'sg-sphere-justified__numeric') {
    let m = prompt.match(/^r = (\d+), slicing height h = (\d+)\./);
    if (m) return Number(m[1]) * Number(m[1]) - Number(m[2]) * Number(m[2]);
    m = prompt.match(/^r = (\d+)\. Hemisphere volume = cylinder/);
    if (m) {
      const r = Number(m[1]);
      return (2 * r * r * r) / 3;
    }
    m = prompt.match(/^Double the hemisphere: the full sphere's V = \(4\/3\)πr³\. For r = (\d+)/);
    if (m) {
      const r = Number(m[1]);
      return (4 * r * r * r) / 3;
    }
    m = prompt.match(/^A solid sphere of radius (\d+) is melted and poured into an empty cylinder of radius (\d+)/);
    if (m) {
      if (m[1] !== m[2]) throw new Error(`melt prompt mixes two different radii: ${prompt}`);
      return (4 * Number(m[1])) / 3;
    }
  }
  if (form === 'sg-cavalieri-limits__numeric') {
    const m = prompt.match(/^A sheared prism \((\d+)×(\d+) base, vertical height (\d+), slant edge (\d+)\)/);
    if (m) return 4 * Number(m[1]) * Number(m[4]);
  }
  if (form === 'sg-composite-subtract__numeric') {
    let m = prompt.match(/^A tube: outer radius (\d+), inner radius (\d+), length (\d+)/);
    if (m) {
      const [R, r, L] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return (R * R - r * r) * L;
    }
    m = prompt.match(/^An? (\d+) × (\d+) × (\d+) block has a cylindrical hole of radius (\d+) drilled/);
    if (m) {
      const [s, , t, r] = [Number(m[1]), 0, Number(m[3]), Number(m[4])];
      return s * s * t - SG_PI * r * r * t;
    }
    m = prompt.match(/^A hemispherical bowl of radius (\d+) is carved \(flat side up\) into an? (\d+) × (\d+) × (\d+) block/);
    if (m) {
      const [r, s, , t] = [Number(m[1]), Number(m[2]), 0, Number(m[4])];
      return s * s * t - (2 / 3) * SG_PI * r * r * r;
    }
    m = prompt.match(/^A concrete pipe: inner \(water\) radius (\d+), wall thickness (\d+), length (\d+)/);
    if (m) {
      const [ri, w, L] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const ro = ri + w;
      return SG_PI * (ro * ro - ri * ri) * L;
    }
  }
  /* S331 / lane G1: the twelve state-varying g10-similarity numeric forms. Proportions are solved
   * by cross-multiplication from the printed values; geometric means by integer search. */
  if (form === 'sy-dilation__numeric') {
    let m = prompt.match(/^An original segment is (\d+) units; after a dilation its image is (\d+) units/);
    if (m) return Number(m[2]) / Number(m[1]);
    m = prompt.match(/^A dilation with center O and scale factor (\d+) sends point P to P′, where OP′ = (\d+)/);
    if (m) return Number(m[2]) / Number(m[1]);
  }
  if (form === 'sy-solving-right__numeric') {
    let m = prompt.match(/^The hypotenuse segments are (\d+) and (\d+)\. Find the altitude\.$/);
    if (m) return rtSearch((h) => h * h === Number(m[1]) * Number(m[2]));
    m = prompt.match(/^Hypotenuse segments are (\d+) and (\d+) \(hypotenuse (\d+)\)\. Find the leg adjacent to the segment of length (\d+)\.$/);
    if (m) {
      const c = Number(m[3]);
      if (c !== Number(m[1]) + Number(m[2])) throw new Error(`hypotenuse disagrees with its segments: ${prompt}`);
      const adj = Number(m[4]);
      return rtSearch((leg) => leg * leg === c * adj);
    }
  }
  if (form === 'sy-scale__numeric') {
    let m = prompt.match(/^At scale 1 : (\d+), a real object is (\d+) cm long\. How long is it in the scale drawing/);
    if (m) return Number(m[2]) / Number(m[1]);
    m = prompt.match(/^A blueprint has scale 1 : (\d+)\. A wall measures (\d+) inches on the blueprint/);
    if (m) return Number(m[2]) * Number(m[1]);
  }
  if (form === 'sy-area-perimeter__numeric' || form === 'sy-similarity__numeric') {
    let m = prompt.match(/^Two similar figures have areas in the ratio (\d+) : 1\. What is the ratio of their corresponding (?:sides|SIDES)\?$/);
    if (m) return rtSearch((k) => k * k === Number(m[1]));
    m = prompt.match(/^Two similar figures have sides in ratio (\d+) : (\d+)\. The smaller has area (\d+)\. What is the larger's area\?$/);
    if (m) {
      const [small, big, A] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return (A * big * big) / (small * small);
    }
  }
  if (form === 'sy-sas-similar__numeric') {
    const m = prompt.match(/^Triangles share angle A\. AD = (\d+), AB = (\d+), and AE = (\d+)\./);
    if (m) return (Number(m[3]) * Number(m[2])) / Number(m[1]);
  }
  if (form === 'sy-sss-similar__numeric') {
    const m = prompt.match(/^Triangle A has sides \d+, (\d+), \d+; similar triangle B has scale factor (\d+)\. What is B's side corresponding to A's (\d+)\?$/);
    if (m) {
      if (m[1] !== m[3]) throw new Error(`SSS prompt asks about a side it did not middle-list: ${prompt}`);
      return Number(m[3]) * Number(m[2]);
    }
  }
  if (form === 'sy-criterion-choice__numeric') {
    const m = prompt.match(/^In △ABC, DE ∥ BC with D on AB and E on AC\. AD = (\d+), DB = (\d+), and AE = (\d+)\. Find AC\.$/);
    if (m) return (Number(m[3]) * (Number(m[1]) + Number(m[2]))) / Number(m[1]);
  }
  if (form === 'sy-side-splitter__numeric') {
    const m = prompt.match(/^A parallel line splits the sides: AD = x, DB = x \+ (\d+), AE = (\d+), EC = (\d+)\. Solve for x\.$/);
    if (m) {
      const [d, e1, e2] = [Number(m[1]), Number(m[2]), Number(m[3])];
      return rtSearch((x) => x * e2 === (x + d) * e1);
    }
  }
  if (form === 'sy-proportions-figures__numeric') {
    const m = prompt.match(/^A parallel line splits the sides: AD = (\d+), DB = (\d+), AE = (\d+)\. Find EC\.$/);
    if (m) return (Number(m[3]) * Number(m[2])) / Number(m[1]);
  }
  if (form === 'sy-geometric-mean__numeric') {
    const m = prompt.match(/^The altitude to a hypotenuse is (\d+), and one segment of the hypotenuse is (\d+)\. What is the OTHER segment\?$/);
    if (m) return rtSearch((q) => Number(m[2]) * q === Number(m[1]) * Number(m[1]));
  }
  if (form === 'sy-indirect__numeric') {
    const m = prompt.match(/^A (\d+)-ft person casts an? (\d+)-ft shadow while a building casts a (\d+)-ft shadow/);
    if (m) return (Number(m[1]) * Number(m[3])) / Number(m[2]);
  }
  /* S331 / lane G1: the eight state-varying g10-polygons-quadrilaterals numeric forms. */
  if (form === 'pq-para-diagonals__numeric') {
    let m = prompt.match(/^Diagonal AC of a parallelogram measures (\d+), meeting BD at O\. Find AO\.$/);
    if (m) return Number(m[1]) / 2;
    m = prompt.match(/^In a parallelogram the diagonals meet at O, and BO = (\d+)\. Find the full diagonal BD\.$/);
    if (m) return 2 * Number(m[1]);
    m = prompt.match(/^With AO = (\d+)x \+ (\d+) and OC = (\d*)x \+ (\d+), find the FULL diagonal AC\.$/);
    if (m) {
      const [a, b, d] = [Number(m[1]), Number(m[2]), Number(m[4])];
      const c = m[3] === '' ? 1 : Number(m[3]);
      const x = rtSearch((v) => a * v + b === c * v + d);
      return 2 * (a * x + b);
    }
  }
  if (form === 'pq-capstone__numeric') {
    let m = prompt.match(/^A quadrilateral's diagonals \((\d+) and (\d+)\) bisect each other at right angles\. Find its side length\.$/);
    if (m) {
      const p = Number(m[1]) / 2;
      const q = Number(m[2]) / 2;
      return rtSearch((s) => s * s === p * p + q * q);
    }
    m = prompt.match(/^A rhombus has diagonals (\d+) and (\d+)\. Its perimeter = \?$/);
    if (m) {
      const p = Number(m[1]) / 2;
      const q = Number(m[2]) / 2;
      return 4 * rtSearch((s) => s * s === p * p + q * q);
    }
    m = prompt.match(/^A quadrilateral's diagonals bisect each other AND are congruent, each measuring (\d+)\. One side is (\d+)\. Find the adjacent side\.$/);
    if (m) {
      const [c, a] = [Number(m[1]), Number(m[2])];
      return rtSearch((b) => b * b === c * c - a * a);
    }
  }
  if (form === 'pq-regular-angles__numeric') {
    let m = prompt.match(/^Each exterior angle of a regular (\d+)-gon\?$/);
    if (m) return 360 / Number(m[1]);
    m = prompt.match(/^Regular (hexagon|square|equilateral triangle)s tile a floor\./);
    if (m) {
      const interior = m[1] === 'hexagon' ? 120 : m[1] === 'square' ? 90 : 60;
      return 360 / interior;
    }
  }
  if (form === 'pq-rectangle__numeric') {
    let m = prompt.match(/^In rectangle ABCD the diagonals meet at O, with AO = (\d+)x \+ (\d+) and BO = x \+ (\d+)\. Find the FULL diagonal AC\.$/);
    if (m) {
      const [a, b, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const x = rtSearch((v) => a * v + b === v + d);
      return 2 * (a * x + b);
    }
    m = prompt.match(/^A rectangle measures (\d+) by (\d+)\. How long is each diagonal\?$/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      return rtSearch((c) => c * c === a * a + b * b);
    }
  }
  if (form === 'pq-square__numeric') {
    let m = prompt.match(/^A square has side (\d+)\. Its diagonal \(2 decimals\)\?$/);
    if (m) return rtHalfUp(Number(m[1]) * Math.sqrt(2), 2);
    m = prompt.match(/^A square's DIAGONAL is (\d+)\. Its side \(2 decimals\)\?$/);
    if (m) return rtHalfUp(Number(m[1]) / Math.sqrt(2), 2);
  }
  if (form === 'pq-interior-sum__numeric') {
    const m = prompt.match(/^\d+ angles of a (pentagon|hexagon|heptagon) are (.+)\. Find the (?:fifth|sixth|seventh)\.$/);
    if (m) {
      const n = m[1] === 'pentagon' ? 5 : m[1] === 'hexagon' ? 6 : 7;
      const given = [...m[2].matchAll(/(\d+)°/g)].reduce((s, g) => s + Number(g[1]), 0);
      return (n - 2) * 180 - given;
    }
  }
  if (form === 'pq-exterior-sum__numeric') {
    const m = prompt.match(/^\d+ exterior angles of a (?:pentagon|hexagon) are (.+)\. The (?:fifth|sixth)\?$/);
    if (m) {
      const given = [...m[1].matchAll(/(\d+)°/g)].reduce((s, g) => s + Number(g[1]), 0);
      return 360 - given;
    }
  }
  if (form === 'pq-para-tests__numeric') {
    const m = prompt.match(/^Quadrilateral ABCD has diagonals meeting at O, with AO = x \+ (\d+) and OC = (\d+)x − (\d+)\./);
    if (m) {
      const [b, c, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const x = rtSearch((v) => v + b === c * v - d);
      return x + b;
    }
  }
  /* S331 / lane G1: the eight state-varying g10-triangle-congruence numeric forms. */
  if (form === 'tc-isosceles__numeric') {
    let m = prompt.match(/^An isosceles triangle has base angles of (\d+)° each\. What is its apex angle/);
    if (m) return 180 - 2 * Number(m[1]);
    m = prompt.match(/^An isosceles triangle has an apex angle of (\d+)°\. One base angle is labeled \((\d+)x\)°\. Find x\.$/);
    if (m) {
      const base = (180 - Number(m[1])) / 2;
      return rtSearch((x) => Number(m[2]) * x === base);
    }
  }
  if (form === 'tc-midsegment__numeric') {
    let m = prompt.match(/^A triangle has perimeter (\d+)\. Connecting all three side-midpoints/);
    if (m) return Number(m[1]) / 2;
    m = prompt.match(/^A midsegment measures \(2x \+ 1\) and the side it's parallel to measures (\d+)\. Find x\.$/);
    if (m) return rtSearch((x) => 2 * x + 1 === Number(m[1]) / 2);
  }
  if (form === 'tc-centroid__numeric') {
    const m = prompt.match(/vertices with [xy]-coordinates (\d+), (\d+), and (\d+)\. (?:What is|Find) the [xy]-coordinate of the centroid/);
    if (m) return (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3;
  }
  if (form === 'tc-triangle-inequality__numeric') {
    let m = prompt.match(/^With two sides (\d+) and (\d+), the third side must be GREATER than what value\?$/);
    if (m) return Math.abs(Number(m[2]) - Number(m[1]));
    m = prompt.match(/^Two sides of a triangle are (\d+) and (\d+)\. How many INTEGER values are possible for the third side\?$/);
    if (m) {
      const [a, b] = [Number(m[1]), Number(m[2])];
      let count = 0;
      for (let t = 1; t <= a + b + 2; t += 1) if (t + a > b && t + b > a && a + b > t) count += 1;
      return count;
    }
  }
  if (form === 'tc-cpctc__numeric' || form === 'tc-cpctc-practice__numeric') {
    const m = prompt.match(/(?:AB|BC) = (\d+)[,.].*what is (?:DE|EF)\?/);
    if (m) return Number(m[1]);
  }
  if (form === 'tc-hl__numeric') {
    const m = prompt.match(/^Two right triangles each have hypotenuse (\d+) and one leg (\d+)\./);
    if (m) return rtSearch((b) => b * b === Number(m[1]) ** 2 - Number(m[2]) ** 2);
  }
  if (form === 'tc-isosceles-converse__numeric') {
    const m = prompt.match(/^A triangle has two base angles measuring \((\d+)x\)° and \((\d*)x \+ (\d+)\)°, and they are equal\./);
    if (m) {
      const k = Number(m[1]);
      const mc = m[2] === '' ? 1 : Number(m[2]);
      const c = Number(m[3]);
      const x = rtSearch((v) => k * v === mc * v + c);
      return k * x;
    }
  }
  if (!Object.prototype.hasOwnProperty.call(entry.promptMap, prompt)) {
    throw new Error(`unrecognized geometry prompt for ${form}: ${prompt}`);
  }
  const answer = entry.promptMap[prompt];
  return typeof answer === 'string' ? cleanGeometryText(answer) : answer;
}
module.exports = { solvePrompt };
