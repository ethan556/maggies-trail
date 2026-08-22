export type NumericClaimShape =
  | "ADD_NEGATIVE"
  | "ADD_POSITIVE"
  | "SUBTRACT_NEGATIVE"
  | "SUBTRACT_POSITIVE"
  | "MOVE_LEFT"
  | "MOVE_RIGHT";

export type FigureNumericParityResult = {
  aligned: boolean;
  explicitFigureClaim: boolean;
  explicitTextClaim: boolean;
  figureAtoms: string[];
  textAtoms: string[];
  figureShapes: NumericClaimShape[];
  textShapes: NumericClaimShape[];
  reasons: string[];
};

export type FixedNumericExemplarContract = {
  figureClaim: string;
  genericText: readonly RegExp[];
};

/** Source-controlled claims for figures that visibly encode fixed values. */
export const FIXED_NUMERIC_EXEMPLAR_CONTRACTS = {
  "integer-jump": { figureClaim: "-4 + 9 = 5; move right.", genericText: [/add(?:ing)? integers? with different signs/, /difference of their absolute values/, /move right for (?:a )?positive/, /different[- ]sign addition/, /different signs?.*jumping.*opposite/, /any two integers?.*signs? first/, /signed addition and subtraction.*same-sign/] },
  "rno-same-sign": { figureClaim: "-3 + (-5) = -8; move left.", genericText: [/add(?:ing)? (?:two )?negative/, /same-sign integers?/, /same signs?.*add/, /both numbers?.*signs?.*add or subtract/] },
  "rno-opposites-cancel": { figureClaim: "5 + (-5) = 0.", genericText: [/opposites? (?:add|sum) to zero/, /zero pairs?/, /additive inverses?/, /cancel out.*(?:0|zero)/, /opposites?.*magnitudes match/] },
  "rno-add-opposite": { figureClaim: "8 - 3 = 8 + (-3) = 5.", genericText: [/subtract(?:ing)? (?:an? )?integer.*add(?:ing)? (?:its |the )?opposite/, /add(?:ing)? the opposite/, /subtraction becomes an addition/, /rewrite the subtraction/] },
  "rno-change-sign": { figureClaim: "4 - 10 = -6; drop.", genericText: [/change (?:is|equals).*final.*initial/, /final value minus (?:the )?initial value/, /a decrease.*negative change/, /new minus old/] },
  "rno-mult-repeated": { figureClaim: "-4 x 3 = -12.", genericText: [/multiplication.*repeated addition/, /same signs?.*positive.*different signs?.*negative/, /product.*sign/] },
  "rno-div-undoes": { figureClaim: "-12 divided by 3 = -4 because -4 x 3 = -12.", genericText: [/division.*undoes multiplication/, /quotient.*sign/, /use multiplication to check/] },
  "rno-count-negatives": { figureClaim: "(-2)(-3)(-1) = -6.", genericText: [/even number of negative factors?.*positive/, /odd number of negative factors?.*negative/, /count (?:the )?negative factors?/, /count the negative signs/] },
  "rno7-add-same-line": { figureClaim: "-3 + (-5) = -8; move left.", genericText: [/add(?:ing)? (?:two )?negative/, /same-sign integers?/, /same signs?.*add/, /both numbers?.*signs?.*add or subtract/] },
  "rno7-add-diff-line": { figureClaim: "5 + (-8) = -3; move left.", genericText: [/add(?:ing)? integers? with different signs/, /difference of their absolute values/] },
  "rno7-zero-pair": { figureClaim: "5 + (-5) = 0. Five positive and five negative counters form zero pairs.", genericText: [/opposites? (?:add|sum) to zero/, /zero pairs?/, /additive inverses?/, /cancel out.*(?:0|zero)/, /opposites?.*magnitudes match/] },
  "rno7-add-opposite": { figureClaim: "7 - 10 = 7 + (-10).", genericText: [/subtract(?:ing)? (?:an? )?integer.*add(?:ing)? (?:its |the )?opposite/, /add(?:ing)? the opposite/, /subtraction becomes an addition/, /rewrite the subtraction/] },
  "rno7-change-line": { figureClaim: "4 - 10 = -6; drop.", genericText: [/change (?:is|equals).*final.*initial/, /final value minus (?:the )?initial value/, /a decrease.*negative change/, /new minus old/] },
  "rno7-mult-repeated": { figureClaim: "-4 x 3 = -12.", genericText: [/multiplication.*repeated addition/, /same signs?.*positive.*different signs?.*negative/, /product.*sign/] },
  "rno7-div-undoes": { figureClaim: "-12 divided by 3 = -4 because -4 x 3 = -12.", genericText: [/division.*undoes multiplication/, /quotient.*sign/, /use multiplication to check/] },
  "rno7-count-negatives": { figureClaim: "(-2)(-3)(-1) = -6.", genericText: [/even number of negative factors?.*positive/, /odd number of negative factors?.*negative/, /count (?:the )?negative factors?/, /count the negative signs/] },
  "rno7-signed-decimal": { figureClaim: "3.25 - (-1.5) = 4.75. Subtracting a negative means adding its opposite.", genericText: [/signed decimals?/, /subtract(?:ing)? (?:a )?negative.*add(?:ing)? (?:the )?opposite/] },
  "rno7-subtract-opposite-five-three": { figureClaim: "5 - 3 = 5 + (-3) = 2.", genericText: [] },
  "rno7-change-rise-line": { figureClaim: "5 - (-3) = 8; move right.", genericText: [] },
  "rno7-signed-decimal-addition": { figureClaim: "-2.5 + 1.75 = -0.75.", genericText: [] },
  "radical-factor": { figureClaim: "sqrt(72) = sqrt(36 x 2) = 6 sqrt(2).", genericText: [/factor.*perfect square/, /simplif(?:y|ying).*radical/] },
  "pv3-borrow-zero": { figureClaim: "305 - 128.", genericText: [/borrow.*zero/, /break .*hundred.*(?:10|ten) tens/, /subtracting across a zero/] },
  "dop-count-places": { figureClaim: "1.2 x 0.5 = 0.60.", genericText: [/count.*decimal places/, /multiply.*whole numbers.*place.*point/] },
  "fa-repeated-add": { figureClaim: "3 x 2/5 = 6/5 = 1 1/5.", genericText: [/multiplication.*repeated addition/, /groups of same-size pieces/, /product.*improper.*mixed number/] },
  "pv3-times-tens": { figureClaim: "4 x 60 = 4 x 6 tens = 240.", genericText: [/multiply.*whole ten/, /zero rides along/, /multiply.*tens/] },
  "pv3-expanded": { figureClaim: "342 = 300 + 40 + 2.", genericText: [/expanded form/, /hundreds.*tens.*ones/] },
  "sp-mad-ruler": { figureClaim: "18 - 12 = 6; 6 / 2 = 3 MADs.", genericText: [/mean absolute deviation/, /difference.*mads?/, /measure.*wobble/] },
  "absolute-value-arcs": { figureClaim: "|-3| = |3| = 3.", genericText: [/absolute value.*distance/, /opposites?.*same absolute value/] },
  "angle-types": { figureClaim: "acute < 90; right = 90; obtuse > 90.", genericText: [/acute.*right.*obtuse/, /angle families/] },
  "composition-chain": { figureClaim: "g(4) = 8; f(8) = 11; f(g(4)) = 11.", genericText: [/composition/, /inner machine.*first/, /substitute.*entire expression/] },
  "dpv-expanded": { figureClaim: "0.347 = 0.3 + 0.04 + 0.007.", genericText: [/expanded form/, /tenths.*hundredths.*thousandths/] },
  "ee-eval-power": { figureClaim: "2^4 = 2 x 2 x 2 x 2 = 16.", genericText: [/evaluate.*power/, /exponent.*repeated multiplication/] },
  "ee-mult-div-solve": { figureClaim: "3x = 12; x = 4.", genericText: [/multiplication equations?.*division/, /divide both sides/] },
  "exponent-repeat": { figureClaim: "a^3 x a^2 = a^5; 3 + 2 = 5.", genericText: [/same base.*add.*exponents/, /repeated multiplication/] },
  "expression-machine": { figureClaim: "n = 4; 2n + 1 = 9.", genericText: [/expression.*machine/, /input.*rule.*output/] },
  "fa-add-like": { figureClaim: "2/5 + 1/5 = 3/5.", genericText: [/like fractions?/, /same denominator/] },
  "gauss-pairing": { figureClaim: "1 + 8 = 9; 2 + 7 = 9; 3 + 6 = 9; 4 + 5 = 9; 4 x 9 = 36.", genericText: [/pair.*ends inward/, /gauss.*pair/] },
  "l-solid-cuts": { figureClaim: "20 + 8 = 16 + 12 = 28.", genericText: [/different cut.*same (?:answer|volume)/, /l-shaped solid/] },
  "mb-break-area": { figureClaim: "4 x 27 = 80 + 28 = 108.", genericText: [/break apart.*multiply/, /area.*partial products/] },
  "mb-remainder": { figureClaim: "13 / 4 = 3 remainder 1.", genericText: [/remainder.*smaller than.*divisor/, /shared.*left over/] },
  "mb-times-compare": { figureClaim: "9 = 3 x 3.", genericText: [/times as many/, /multiplicative comparison/] },
  "mult3-double": { figureClaim: "2 x 5 = 5 + 5 = 10.", genericText: [/times two.*doubl/, /doubling.*repeated addition/] },
  "ns-abs-compare": { figureClaim: "-5 < 3; |-5| > |3|.", genericText: [/order versus size/, /position.*distance/] },
  "ns-factor-distribute": { figureClaim: "12 + 18 = 6(2 + 3).", genericText: [/factor out.*gcf/, /verify.*expanding back/] },
  "perpendicular-rotation": { figureClaim: "m = 2/3; m' = -3/2; (2/3)(-3/2) = -1.", genericText: [/perpendicular.*slopes/, /quarter-turn/, /rotate.*90/] },
  "pr-percent-shortcut": { figureClaim: "50 x 1.08 = 54.", genericText: [/percent.*multiplier/, /one-step.*percent/] },
  "pv3-regroup": { figureClaim: "7 + 5 = 12; 12 ones = 1 ten 2 ones.", genericText: [/regroup/, /trade.*ten/] },
  "rt-30-60-90": { figureClaim: "30-60-90 triangle.", genericText: [/short leg.*hypotenuse/, /long leg.*root three/, /30-60-90/] },
  "similar-triangles-slope": { figureClaim: "1/1 = 3/3.", genericText: [/same straight line.*slope/, /similar triangles?.*slope/] },
  "single-scale-graph": { figureClaim: "dogs = 6; each gridline = 1.", genericText: [/bar graph/, /each gridline.*one/] },
  "unit-circle-reference": { figureClaim: "cos(150) = -sqrt(3)/2; sin(150) = 1/2; reference angle = 30.", genericText: [/unit circle/, /reference angle.*quadrant/] },
} as const satisfies Record<string, FixedNumericExemplarContract>;

export type FixedNumericExemplarId = keyof typeof FIXED_NUMERIC_EXEMPLAR_CONTRACTS;

function plain(value: string): string {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\*\*/g, "")
    .replace(/&minus;|&#8722;/gi, "−")
    .replace(/&times;|&#215;/gi, "×")
    .replace(/&divide;|&#247;/gi, "÷")
    .replace(/[–—]/g, "−")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function compactMath(value: string): string {
  return plain(value)
    .replace(/−/g, "-")
    .replace(/(?<=\d),(?=\d)/g, "")
    .replace(/\s*([+−\-×÷=()])\s*/g, "$1");
}

/**
 * Signed rational atoms as the learner reads them. Binary subtraction is not
 * mistaken for a negative sign because operator whitespace is removed first:
 * `5 - 3` becomes `5-3`, while `= -3` becomes `=-3`.
 */
export function signedRationalAtoms(value: string): string[] {
  const text = plain(value).replace(/−/g, "-").replace(/(?<=\d),(?=\d)/g, "");
  const number = "(?:\\d+(?:\\.\\d+)?(?:/\\d+(?:\\.\\d+)?)?)";
  const pattern = new RegExp(`\\(-\\s*(${number})\\)|-?${number}`, "g");
  const atoms: string[] = [];
  for (const match of text.matchAll(pattern)) {
    if (match[1]) {
      atoms.push(`-${match[1]}`);
      continue;
    }
    const token = match[0];
    if (!token.startsWith("-")) {
      atoms.push(token);
      continue;
    }
    const prior = text.slice(0, match.index ?? 0);
    const previousWord = prior.match(/([a-z]+)\s*$/)?.[1] ?? "";
    const previous = prior.trimEnd().slice(-1);
    const unary =
      /\s$/.test(prior) ||
      !previous ||
      /[=+,(;:.!?]/.test(previous) ||
      ["at", "from", "to", "negative"].includes(previousWord) ||
      /(?:start|starting|land|landing)\s+at\s*$/.test(prior);
    atoms.push(unary ? token : token.slice(1));
  }
  return atoms;
}
export function numericClaimShapes(value: string): NumericClaimShape[] {
  const text = plain(value).replace(/−/g, "-");
  const shapes = new Set<NumericClaimShape>();
  const leftOperand = String.raw`(?:\b\d+(?:\.\d+)?|\b[a-z]\b|\))`;
  if (/\+\s*\(\s*-(?:\d|[a-z])/.test(text) || /add(?:ing)? (?:a |the )?negative/.test(text)) shapes.add("ADD_NEGATIVE");
  if (/\+\s*(?!\(\s*-)(?:\d|[a-z])/.test(text) || /add(?:ing)? (?:a |the )?positive/.test(text)) shapes.add("ADD_POSITIVE");
  if (new RegExp(`${leftOperand}\\s*-\\s*\\(\\s*-(?:\\d|[a-z])`).test(text) || /subtract(?:ing)? (?:a |the )?negative/.test(text)) shapes.add("SUBTRACT_NEGATIVE");
  if (new RegExp(`${leftOperand}\\s*-\\s*(?!\\(\\s*-)(?:\\d|[a-z])`).test(text) || /subtract(?:ing)? (?:a |the )?positive/.test(text)) shapes.add("SUBTRACT_POSITIVE");
  if (/\b(?:jump|move|hop|walk|arrow|change|go(?:ing)?)\b[^.!?]{0,55}\b(?:left|down|fall|drop)\b|\b(?:left|down|fall|drop)\b[^.!?]{0,55}\b(?:jump|move|hop|walk|arrow|change|go(?:ing)?)\b/.test(text)) shapes.add("MOVE_LEFT");
  if (/\b(?:jump|move|hop|walk|arrow|change|go(?:ing)?)\b[^.!?]{0,55}\b(?:right|up|rise)\b|\b(?:right|up|rise)\b[^.!?]{0,55}\b(?:jump|move|hop|walk|arrow|change|go(?:ing)?)\b/.test(text)) shapes.add("MOVE_RIGHT");
  return [...shapes].sort();
}

export function hasExplicitNumericOrSymbolicClaim(value: string): boolean {
  const text = compactMath(value);
  const prose = plain(value);
  const atoms = signedRationalAtoms(text);
  const symbolicExpressions = text.match(/\b[a-z][+−\-×÷](?:\([−\-]?[a-z]\)|[−\-]?[a-z])/g) ?? [];
  const wordOperation = /\b(?:plus|minus|times|multiplied by|divided by|over)\b/.test(prose);
  const wordRate = /\b(?:dollars?|cents?)\s+for\s+\d/.test(prose) && /\bper\s+(?:ounce|ounces|pound|pounds)\b/.test(prose);
  const wordEquality = /\b(?:equals?|is|becomes?)\b/.test(prose);
  return (
    (/=/.test(text) && (atoms.length >= 2 || /[a-z][+−\-×÷]/.test(text))) ||
    (atoms.length >= 2 && /(?:\d|\))\s*[+\-×÷]\s*\(?-?\d/.test(text)) ||
    (symbolicExpressions.length >= 2 && /\b(?:becomes?|rewrite|same as|think|equivalent)\b/.test(text)) ||
    (atoms.length >= 2 && /\b(?:from|start(?:ing)? at|landing? at|jump|move|change|rise|fall|drop)\b/.test(text)) ||
    // Figure titles often express a worked rate in accessible words ("3 dollars
    // divided by 12 ounces equals 25 cents per ounce") rather than operators.
    // Those are fixed learner-visible numerical claims and need the same exact
    // parity protection as a symbolic equation.
    (atoms.length >= 2 && (wordOperation || wordRate) && wordEquality)
  );
}

/**
 * Compares the exact signed/rational claim made by a fixed figure with the
 * claim in adjacent authored prose. Generic prose is allowed: a worked figure
 * may illustrate a rule. Once the prose states its own numerical or symbolic
 * example, however, the figure must carry those same signed values and must
 * not reverse subtraction polarity or movement direction.
 */
export function compareFigureNumericParity(figureText: string, accompanyingText: string): FigureNumericParityResult {
  const explicitFigureClaim = hasExplicitNumericOrSymbolicClaim(figureText);
  const explicitTextClaim = hasExplicitNumericOrSymbolicClaim(accompanyingText);
  const figureAtoms = [...new Set(signedRationalAtoms(figureText))];
  const textAtoms = [...new Set(signedRationalAtoms(accompanyingText))];
  const figureShapes = numericClaimShapes(figureText);
  const textShapes = numericClaimShapes(accompanyingText);
  const reasons: string[] = [];

  if (explicitFigureClaim && explicitTextClaim) {
    const missing = figureAtoms.filter((atom) => !textAtoms.includes(atom));
    const shared = figureAtoms.length - missing.length;
    if (figureAtoms.length >= 2 && shared / figureAtoms.length < 1 / 3) {
      reasons.push(`FIXED_VALUE_MISMATCH[missing=${missing.join("+")}]`);
    }
    for (const opposite of [
      ["ADD_NEGATIVE", "ADD_POSITIVE"],
      ["ADD_POSITIVE", "ADD_NEGATIVE"],
      ["SUBTRACT_NEGATIVE", "SUBTRACT_POSITIVE"],
      ["SUBTRACT_POSITIVE", "SUBTRACT_NEGATIVE"],
      ["MOVE_LEFT", "MOVE_RIGHT"],
      ["MOVE_RIGHT", "MOVE_LEFT"],
    ] as const) {
      if (
        textShapes.includes(opposite[0]) &&
        !textShapes.includes(opposite[1]) &&
        figureShapes.includes(opposite[1]) &&
        !figureShapes.includes(opposite[0])
      ) {
        reasons.push(`CLAIM_SHAPE_MISMATCH[text=${opposite[0]};figure=${opposite[1]}]`);
      }
    }
  }

  return { aligned: reasons.length === 0, explicitFigureClaim, explicitTextClaim, figureAtoms, textAtoms, figureShapes, textShapes, reasons };
}
/**
 * Renderer-derived arithmetic titles are exact exemplars, not generic visual
 * families. When adjacent prose states its own worked claim, every signed
 * value asserted by the title must be present; sharing one incidental factor
 * (for example 4×6=24 beside 3×4=12) is not alignment.
 */
export function compareExactFigureNumericParity(figureText: string, accompanyingText: string): FigureNumericParityResult {
  const result = compareFigureNumericParity(figureText, accompanyingText);
  if (!result.explicitFigureClaim || !result.explicitTextClaim) return result;
  const missing = result.figureAtoms.filter((atom) => !result.textAtoms.includes(atom));
  if (!missing.length) return result;
  const reasons = [...result.reasons];
  const exact = `EXACT_RENDERED_VALUE_MISMATCH[missing=${missing.join("+")}]`;
  if (!reasons.includes(exact)) reasons.push(exact);
  return { ...result, aligned: false, reasons };
}

export function isDeclaredFixedNumericExemplarAligned(id: string, accompanyingText: string): boolean {
  const contract = FIXED_NUMERIC_EXEMPLAR_CONTRACTS[id as FixedNumericExemplarId];
  if (!contract) return true;
  if (hasExplicitNumericOrSymbolicClaim(accompanyingText)) {
    return compareFigureNumericParity(contract.figureClaim, accompanyingText).aligned;
  }
  const value = plain(accompanyingText);
  return contract.genericText.some((pattern) => pattern.test(value));
}
