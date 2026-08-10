// THE PROSE GATE.
//
// The variant gate proves a generated problem is mathematically sound: the answer is right, the
// traps are real, nothing collides. It says nothing about whether the words make sense.
//
// Every defect below shipped past a green variant gate and was caught only by a human printing
// the output and reading it:
//
//   "1 units up", "Group of 1 dots"    count disagreement on a counting noun
//   "3th", "5ths"                      English morphology derived with arithmetic
//   "Every book wants a shelve"        morphology derived with a regex
//   "All both points line up"          two phrasings spliced by a ternary
//   0.30000000000000004                float noise reaching the learner
//
// Human reading is the least reliable link in the chain and the only one protecting the learner
// from nonsense. This file mechanises the part of it that can be mechanised, and sweeps every
// generator, every form, every band, every seed — which no human ever will.
//
// TWO RULES OF THIS FILE, both learned by writing it badly first:
//
//   A rule earns its place by catching a REAL defect. The first draft carried a "sentence ends on
//   a dangling function word" rule that produced five false positives ("3 = a." — a is a
//   variable) and zero true ones, and a "three or more decimal places means invented rounding"
//   rule that flagged 196 legitimate values, nearly all of them scientific notation doing exactly
//   its job. Both were deleted rather than tuned.
//
//   Prefer a POSITIVE list to a negative one. Flagging "1 <word>s" unless the word sits on an
//   allowlist marked "1 comes", "1 satisfies", "1 divides" — English verbs. Flagging it only when
//   the word is a known counting noun cannot false-positive at all. The cost is a missed noun,
//   which is a defect that survives; the cost of the other design is a good generator rejected,
//   and a linter that cries wolf gets switched off, and then it protects nobody.
import { describe, expect, it } from "vitest";
import { VARIANT_GENERATORS, variantFor, variantForGenForm } from "./variants";
import type { Band } from "./difficulty";

const SEEDS = 50;
const BANDS: Array<Band | undefined> = [undefined, "support", "stretch"];

const MACHINE_KEYS = new Set([
  "id", "type", "delimiter", "form", "addColor", "correct", "answer", "sequence", "targets",
  "acceptAlso", "conceptTag", "gen",
]);

/** Every learner-VISIBLE string in a widget. Ids and enum settings are machine-facing; everything
 *  else — prompts, labels, option text, every feedback slot — is read by a child. */
function visibleStrings(node: unknown, key = ""): string[] {
  if (typeof node === "string") return MACHINE_KEYS.has(key) ? [] : [node];
  if (Array.isArray(node)) return node.flatMap((n) => visibleStrings(n, key));
  if (node && typeof node === "object")
    return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => visibleStrings(v, k));
  return [];
}

/** Counting nouns whose plural after "1" is wrong. Positive list on purpose (see header): grow it
 *  when a new noun appears in content; never replace it with a heuristic. */
const COUNT_NOUNS = [
  "ones", "tens", "hundreds", "thousands", "tenths", "hundredths", "thousandths",
  "digits", "places", "numbers", "numerals", "terms", "factors", "multiples",
  "wholes", "parts", "pieces", "slices", "shares", "halves", "thirds", "fourths", "quarters",
  "fifths", "sixths", "sevenths", "eighths", "ninths", "groups", "sets", "portions",
  "dots", "cubes", "tiles", "blocks", "rods", "counters", "beads", "sticks", "squares",
  "circles", "triangles", "rectangles", "shapes", "cards", "coins", "marks", "points",
  "apples", "birds", "books", "pencils", "kids", "children", "students", "people",
  "units", "degrees", "inches", "feet", "meters", "metres", "centimeters", "centimetres",
  "cups", "liters", "litres", "grams", "kilograms", "pounds", "ounces", "cents", "dollars",
  "minutes", "hours", "seconds", "days", "weeks", "months", "years",
  "sides", "angles", "faces", "edges", "vertices", "corners", "rows", "columns", "steps",
  "spins", "rolls", "flips", "trials", "outcomes", "events", "times", "ways",
];
const COUNT_NOUN_RE = new RegExp(`\\b1 (${COUNT_NOUNS.join("|")})\\b`);

/** Ordinal suffix by the real rule, not by arithmetic on the last digit alone. */
const ordinalSuffix = (n: number): string => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
};

interface Rule {
  name: string;
  test: (s: string) => string | null;
}

const RULES: Rule[] = [
  {
    // CAUGHT REAL: "1 units up" (coordinate-plot), "Group of 1 dots" (compare-numerals),
    // "1 wholes" (mixed-convert), "7 tens 1 ones" (base-ten-build), "1 hundredths"
    // (decimal-align-addsub), "1 tens is fewer" (place-compare), "blue 1 times"
    // (probability-fraction), "takes 1 pieces" (fraction-meaning), "1 degrees" (negative-intro).
    name: "plural counting noun after 1",
    test: (s) => s.match(COUNT_NOUN_RE)?.[0] ?? null,
  },
  {
    // CAUGHT REAL: "3th" (whole-times-fraction, pre-fix).
    name: "wrong ordinal suffix",
    test: (s) => {
      for (const m of s.matchAll(/\b(\d+)(st|nd|rd|th)\b/g)) {
        if (ordinalSuffix(Number(m[1])) !== m[2]) return m[0];
      }
      return null;
    },
  },
  {
    // CAUGHT REAL: "5ths" (whole-times-fraction, pre-fix). Fraction names are words from data
    // ("fifths"), never a digit with a suffix glued on.
    name: "digit-plus-ths fraction name",
    test: (s) => s.match(/\b\d+ths\b/)?.[0] ?? null,
  },
  {
    // CAUGHT REAL: "All both points line up" (proportional-plot).
    name: "doubled quantifier or article",
    // The article pairs need a negative lookahead for a hyphen: "The a-value is √25" is
    // legitimate — `a` is a variable name there, not an article. Found by this rule's own
    // first run against hyperbola-cab.
    test: (s) => s.match(/\b(all both|both all|a an|an a|the a|a the|of of|in in|to to)(?![-\w])/i)?.[0] ?? null,
  },
  {
    name: "repeated word",
    test: (s) => {
      const m = s.match(/\b([a-z]{2,})\s+\1\b/i);
      // "had had" is grammatical; nothing else in this corpus legitimately doubles a word.
      return m && m[1].toLowerCase() !== "had" ? m[0] : null;
    },
  },
  {
    // Float noise. The run of zeros or nines must follow a SIGNIFICANT digit — without that
    // anchor this flagged 0.00000053, which is scientific notation working correctly.
    name: "float artifact",
    test: (s) => s.match(/\b\d*\.\d*[1-9]\d*(?:0{6,}|9{6,})\d*\b/)?.[0] ?? null,
  },
  {
    // A repeating decimal printed truncated rather than named. Narrow on purpose: a NONZERO digit
    // repeated four or more times after the point. Zeros are excluded because 0.00023 is exact.
    name: "truncated repeating decimal",
    test: (s) => s.match(/\.\d*([1-9])\1{3,}/)?.[0] ?? null,
  },
  {
    name: "unfilled template slot",
    // SANCTIONED CORRECTION (session 101): the bare \bnull\b arm flagged the statistics corpus's
    // own standard vocabulary — "null hypothesis", "under the null", "null-model simulations" —
    // exactly the cry-wolf failure this file's header warns against. The arm now skips null used
    // as that technical noun (preceded by "the" or followed by hypothesis/model/distribution)
    // while still catching a leaked JSON null, which never appears in those frames. Strictly
    // narrower only on legitimate statistics prose; identical on template leaks.
    test: (s) => {
      // SANCTIONED CORRECTION (S186): "is undefined" is legitimate mathematical vocabulary for
      // division by zero (g3-div-fluency's DivZeroMcq), not a template-interpolation leak.
      // Narrowed exactly like the null-hypothesis correction above: excluded only when it is the
      // sentence's own predicate adjective ("... is undefined."), a shape a genuine leak would
      // not produce — a numeric slot silently receiving JS's undefined surfaces mid-sentence in
      // a NOUN position ("gives undefined", "${undefined}"), never as a well-punctuated final
      // clause. Strictly narrower only on this legitimate phrasing; identical on template leaks.
      const generic = s.match(/undefined|NaN|\[object Object\]|\$\{/)?.[0];
      if (generic === "undefined" && /\bis undefined\.?\s*$/.test(s)) {
        // fall through to the null check below rather than flagging this legitimate use
      } else if (generic) {
        return generic;
      }
      return s.match(/(?<![Tt]he )\bnull\b(?!-?\s?(?:hypothesis|hypotheses|model|models|distribution|distributions))/)?.[0] ?? null;
    },
  },
  {
    // Narrowed after the first run: a doubled space before a formula ("Solve for x:  8x + 14")
    // and a spaced colon in a ratio ("5 : 7") are deliberate house style across five generators.
    // Both were removed rather than excepted — a linter that flags the corpus's own conventions
    // gets switched off, and then it protects nobody.
    name: "punctuation damage",
    test: (s) => {
      const m = s.match(/ [,.;]|,,|\.\.(?!\.)|\(\)|\( \)|\s$|^\s/);
      return m ? JSON.stringify(m[0]) : null;
    },
  },
];

function everyGenForm(): Array<{ tag: string; form: string }> {
  const out: Array<{ tag: string; form: string }> = [];
  for (const g of VARIANT_GENERATORS) {
    // Declaration-only generators reject the bare "default" path by design; every reachable
    // problem lives behind a declared form, and each of those is swept below.
    if (!g.declarationOnly) out.push({ tag: g.tag, form: "default" });
    for (const f of g.forms ?? []) out.push({ tag: g.tag, form: f });
  }
  return out;
}

describe("prose gate — every generated string a learner can read", () => {
  const pairs = everyGenForm();

  it("sweeps every generator and every form", () => {
    expect(pairs.length).toBeGreaterThan(VARIANT_GENERATORS.length);
  });

  for (const { tag, form } of pairs) {
    it(`${tag} @ ${form}: reads as English across ${SEEDS * BANDS.length} draws`, () => {
      const failures: string[] = [];
      for (const band of BANDS) {
        for (let i = 0; i < SEEDS; i++) {
          const seed = `prose:${tag}:${form}:${band ?? "core"}:${i}`;
          const v = form === "default" ? variantFor(tag, seed, band) : variantForGenForm(tag, form, seed, band);
          if (!v) continue;
          for (const s of visibleStrings(v.widget)) {
            for (const rule of RULES) {
              const hit = rule.test(s);
              if (hit !== null) failures.push(`[${rule.name}] ${hit}\n     in: ${s.slice(0, 150)}`);
            }
          }
        }
      }
      // Distinct failures only: one bad template produces the same complaint 150 times.
      const distinct = [...new Set(failures)];
      expect(distinct, `${tag}@${form}\n  ${distinct.slice(0, 6).join("\n  ")}`).toEqual([]);
    });
  }
});
