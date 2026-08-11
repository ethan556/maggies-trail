import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { authoredMathParts } from "./authoredMath";

/**
 * S237 — THE RENDERER MUST NEVER TYPESET A FALSE STATEMENT.
 *
 * WHAT WAS HAPPENING. The arithmetic scanner's operator class omits the ASCII hyphen, so it could
 * not cross one — it restarted AFTER it and emitted the tail as a self-contained expression:
 *
 *     "x^2 - x - 6 = 0 factors as (x - 3)(x + 2)"   ->  island "6 = 0"
 *     "What is the larger solution of x^2 - 2x - 8 = 0?"  ->  island "8 = 0"
 *     "x²/16 − y²/9 = 1: a = 4, b = 3 …"            ->  islands "16 - y" and "9 = 1"
 *
 * Those islands were then rendered in KaTeX. Not "imperfectly typeset" — mathematically FALSE, set
 * in the app's most authoritative visual register, in a product whose entire claim is that it
 * teaches mathematics correctly. 117 authored rows in body/explanationVariants fields — which
 * render in arithmetic mode today — shipped them.
 *
 * A second shape survived the first guard: the scanner also starts after an English word, so
 * "(9 × 2 = 18, plus 36 = 54)" — prose describing the WRONG method — yielded "36 = 54".
 *
 * WHY THE INVARIANT IS SHAPED THIS WAY. It does not try to recognise the mis-cut. It asserts the
 * property that matters and can be checked without knowing the cause: a closed numeric claim that
 * is false is never typeset. Dropping the island leaves the characters exactly as authored, so the
 * failure direction is "not typeset" rather than "typeset wrongly".
 *
 * This is a gate on OUTPUT, not on the scanner's internals — it stays valid if the scanner is
 * rewritten. Measured over the whole flagged corpus, so a regression anywhere fails it.
 */

const parseCsv = (t: string): string[][] => {
  const rows: string[][] = []; let cur: string[] = []; let field = ""; let quoted = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
};

/** Islands made only of literal arithmetic and one relation — the population this gate judges. */
const CLOSED_NUMERIC = /^[\d\s+\-*/.()%×÷·−–]*[=≤≥≠<>][\d\s+\-*/.()%×÷·−–]*$/;

/** Independent of the implementation: evaluate with the JS engine, not with the module's own parser. */
function claimHolds(source: string): boolean | null {
  const normalised = source.replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-");
  const relation = normalised.match(/[=≤≥≠<>]/)?.[0];
  const sides = normalised.split(/[=≤≥≠<>]/);
  if (!relation || sides.length !== 2) return null;
  try {
    const [a, b] = sides.map((s) => Function(`"use strict";return (${s})`)() as unknown);
    if (typeof a !== "number" || typeof b !== "number" || !Number.isFinite(a) || !Number.isFinite(b)) return null;
    return relation === "=" ? Math.abs(a - b) < 1e-9
      : relation === "≠" ? Math.abs(a - b) >= 1e-9
        : relation === "<" ? a < b : relation === ">" ? a > b
          : relation === "≤" ? a <= b : a >= b;
  } catch { return null; }
}

const flagged = (() => {
  const rows = parseCsv(readFileSync("MATH_TYPESETTING_AUDIT.csv", "utf8"));
  const head = rows[0];
  const risk = head.indexOf("ascii_notation_risk"); const text = head.indexOf("text");
  return rows.slice(1).filter((r) => r[risk] === "yes").map((r) => r[text]);
})();

describe("S237 authored math never typesets a false claim", () => {
  it("the corpus sample is real and large", () => {
    expect(flagged.length).toBeGreaterThan(9000); // guards against a silent CSV read failure
  });

  it("emits no false numeric claim anywhere in the flagged corpus, in either mode", () => {
    const offenders: string[] = [];
    for (const text of flagged) {
      for (const mode of [{}, { includeArithmetic: true }]) {
        for (const part of authoredMathParts(text, mode)) {
          const source = (part.source ?? "").trim();
          if (!part.tex || !CLOSED_NUMERIC.test(source)) continue;
          if (claimHolds(source) === false) offenders.push(`${source}  <=  ${text.slice(0, 90)}`);
        }
      }
    }
    expect(offenders.slice(0, 10)).toEqual([]);
  });

  it("the four reported mis-cuts specifically", () => {
    const cases = [
      "The equation x^2 - x - 6 = 0 factors as (x - 3)(x + 2). What is its larger solution?",
      "What is the larger solution of x^2 - 2x - 8 = 0?",
      "x²/16 − y²/9 = 1: a = 4, b = 3, so asymptote slopes are ±b/a = ±3/4.",
      "13 treats the roof like a rectangle (9 × 2 = 18, plus 36 = 54). The roof is a TRIANGLE.",
    ];
    for (const text of cases) {
      const sources = authoredMathParts(text, { includeArithmetic: true }).filter((p) => p.tex).map((p) => (p.source ?? "").trim());
      for (const s of sources) expect(claimHolds(s), `${s} from "${text}"`).not.toBe(false);
    }
  });

  it("does NOT suppress correct mathematics", () => {
    // The guard must cost nothing true. Each of these is a genuine expression and must survive.
    for (const [text, expected] of [
      ["Solve 2x + 3 = 11.", "2x + 3 = 11"],
      ["so 9 × 2 = 18 square units", "9 × 2 = 18"],
      ["Example: a = 4, b = 3.", "a = 4"],
      ["Use 1/2 cup of flour.", "1/2"],
    ] as const) {
      const sources = authoredMathParts(text, { includeArithmetic: true }).filter((p) => p.tex).map((p) => (p.source ?? "").trim());
      expect(sources, text).toContain(expected);
    }
  });

  it("SELF-CHECK: the detector recognises a false claim when handed one", () => {
    // If claimHolds ever stops working, the corpus assertion above passes vacuously.
    expect(claimHolds("6 = 0")).toBe(false);
    expect(claimHolds("36 = 54")).toBe(false);
    expect(claimHolds("9 × 2 = 18")).toBe(true);
    expect(claimHolds("x + 1 = 2")).toBe(null); // has a variable: not this gate's business
  });
});
