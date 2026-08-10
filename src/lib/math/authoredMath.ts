/**
 * Turns Maggie's long-standing, author-friendly power shorthand into TeX at the
 * rendering boundary. Lesson JSON stays readable (`x^2`, `(a^m)^n`) and never
 * exposes learners to raw LaTeX commands.
 */
export interface AuthoredMathPart {
  text: string;
  tex?: string;
}

const TRAILING_PROSE = /([.,;:!]+)$/;
const POWER = /\^(?:\([^()]*\)|[A-Za-z0-9?]+)/;

export function powerShorthandToTex(source: string): string {
  return source
    .replace(/\^\(([^()]*)\)/g, "^{$1}")
    .replace(/\^([A-Za-z0-9?]+)/g, "^{$1}")
    .replaceAll("·", "\\cdot ")
    .replaceAll("×", "\\times ")
    .replaceAll("−", "-");
}

/** Split prose without guessing that every numeral or operator is mathematics.
 * Only whitespace-delimited tokens containing the corpus's explicit `^`
 * authoring signal enter KaTeX. Punctuation remains ordinary prose. */
export function authoredMathParts(text: string): AuthoredMathPart[] {
  return text.split(/(\s+)/).map((chunk) => {
    if (!chunk || /^\s+$/.test(chunk) || !POWER.test(chunk)) return { text: chunk };
    const punctuation = chunk.match(TRAILING_PROSE)?.[1] ?? "";
    const math = punctuation ? chunk.slice(0, -punctuation.length) : chunk;
    return { text: punctuation, tex: powerShorthandToTex(math) };
  });
}
