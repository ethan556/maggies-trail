#!/usr/bin/env npx tsx
/**
 * S242 / MATH-01 — THE NINE NAMED PRESENTATION INDEXES.
 *
 * WHAT THE PLAN ASKS FOR. §8: "The presentation baseline must also include separate canonical-form,
 * symbolic-display, fraction-display, constant-order, derivative-notation, integral-notation,
 * unit-notation, decimal/fraction-policy, and machine-expression-leak indexes." MATH-01's scope is
 * "authored, generated, feedback, hints, engines, and calculated output".
 *
 * THE MEASURE IS THE RESIDUE. Every string is run through `authoredMathParts` — the real rendering
 * boundary, not a model of it — and what is indexed is the PROSE THAT SURVIVES with every island
 * removed. This distinction is the whole design. A previous scan pattern-matched the source and
 * reported 7,815 rows, the overwhelming majority of which were `sqrt(9)` and `x^2` written exactly
 * as an author is supposed to write them. Shorthand in source is not a defect; shorthand on screen
 * is. Only the second is here.
 *
 * THE SURFACE MODEL, DERIVED FROM THE CALL SITES RATHER THAN ASSUMED.
 * `includeArithmetic` is not a property of a string, it is a property of the component that renders
 * it, so the same text can be fine in one place and broken in another. Counting call sites:
 *   · `widgets.tsx` renders 155 of its 156 `MathProse`/`MathText` uses with arithmetic OFF. Every
 *     widget spec string — prompts, option labels, per-option feedback, success and miss messages —
 *     is therefore indexed on the ARITHMETIC-OFF surface.
 *   · `QuizShell.tsx` and `LessonPlayer.tsx` render lesson body, hints and step feedback with
 *     arithmetic ON. Those fields are indexed on the ARITHMETIC-ON surface.
 * A string is only a finding on the surface it actually renders on. Indexing everything on both
 * would double the file and halve its credibility.
 *
 * SOURCES. Authored lesson JSON under `content/`, and GENERATED output drawn from every
 * (generator, form) pair — because a generator builds its strings at runtime from drawn values, and
 * no scan of source files can see those. The generated rows carry their seed, so any row is
 * reproducible from the row itself.
 *
 * Usage:
 *   npx tsx scripts/audit/math-presentation-indexes.mts             # write all nine indexes
 *   npx tsx scripts/audit/math-presentation-indexes.mts --summary   # counts only, write nothing
 *   npx tsx scripts/audit/math-presentation-indexes.mts --authored  # skip the generated pass
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { authoredMathParts } from "../../src/lib/math/authoredMath";
import { VARIANT_GENERATORS } from "../../src/lib/variants";
import { hashSeed, mulberry32 } from "../../src/lib/prng";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "math-presentation");
const SUMMARY_ONLY = process.argv.includes("--summary");
const AUTHORED_ONLY = process.argv.includes("--authored");
/** Enough per form to exercise the drawn values without re-running the full quality sweep. */
const GENERATED_SAMPLES_PER_FORM = 12;
const BANDS: Band[] = ["support", "core", "stretch"];

const seal = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch { return "unsealed"; }
})();

/* ------------------------------------------------------------------ */
/* THE NINE INDEXES. Each is a predicate over the RESIDUE, plus a note saying what it excludes.     */
/* ------------------------------------------------------------------ */

type Index = {
  file: string;
  what: string;
  /** Returns a short description of the offending shape, or null. Receives the surviving prose. */
  test: (residue: string, raw: string) => string | null;
};

/* Units, for the spacing rule. MULTI-CHARACTER ONLY, and that restriction is load-bearing. The
 * first cut included the single-letter units (s, m, g, h, L, in) and reported 453 findings, almost
 * all of them "100s" — the plural of a hundred — read as a hundred seconds. "10m" as ten metres and
 * "10m" as a typo for ten million are indistinguishable without a lexicon, so the single-letter
 * units are given up deliberately rather than guessed at. */
const UNITS = "cm|mm|km|kg|mg|ml|ft|yd|mi|lb|oz|min|hr";

const INDEXES: Index[] = [
  {
    file: "MATH_MACHINE_EXPRESSION_LEAK_INDEX.csv",
    what: "Implementation-form mathematics that survives tokenization and reaches the screen as written.",
    test: (r, raw) => {
      if (/\bMath\.[a-z]/i.test(r)) return "javascript expression";
      if (/\d[eE][+-]\d\d\b/.test(r)) return "exponential notation";
      // An asterisk BETWEEN OPERANDS. Two passes of getting this wrong are recorded here because
      // both are easy to repeat. First cut: matched any single `*` and called 197 rows of markdown
      // italics — `*then*`, `*after*` — multiplication. Second cut: tested the RESIDUE for operands,
      // which mislabelled 61 rows the other way, because in "For f(x) = 5 * 3^x" the tokenizer has
      // already claimed `3^x`, leaving the residue "5 * ," with nothing to the right of the
      // asterisk. Whether the `*` SURVIVES is a question about the residue; what KIND of asterisk it
      // is, is a question about the raw text. They are asked separately.
      if (/(?<!\*)\*(?!\*)/.test(r)) {
        return /[\dA-Za-z)]\s*\*\s*[-−+]?\s*[\dA-Za-z(]/.test(raw)
          ? "asterisk multiplication"
          : "markdown italic not rendered";
      }
      if (/<=|>=/.test(r)) return "ASCII inequality";
      if (/\bsqrt\s*\(/i.test(r)) return "raw sqrt(";
      if (/\^/.test(r)) return "raw caret";
      return null;
    }
  },
  {
    file: "MATH_SYMBOLIC_DISPLAY_INDEX.csv",
    what: "A symbol that is part of an EXPRESSION which failed to tokenize — not a symbol used as a word.",
    /* TWO ROUNDS OF NARROWING, both recorded because the second is easy to miss.
     *
     * Round one: the check flagged any bare Greek or relational symbol and produced 3,740 rows,
     * almost all correct prose. "The number pi (about 3.14)" NAMES the constant, and a lone symbol
     * in a sentence renders perfectly well as Unicode. What is actually wrong is a symbol with an
     * OPERAND beside it — "2π(7)", "6 ≠ 4" — because that is an expression the tokenizer declined.
     *
     * Round two: requiring "an operand beside it" with optional whitespace still caught prose,
     * because English puts words beside symbols all the time — "multiplying by π, what does",
     * "A θ-degree sector", "with θ in radians". A LETTER adjacent to a Greek symbol only means
     * juxtaposition when there is NO SPACE between them: `rθ` and `πr²` are products, `by π` is a
     * sentence. Digits and brackets are different — "2 π" and "π (7)" are expressions whether or not
     * the author typed a space — so those keep their optional whitespace. Relational symbols keep it
     * too, since a relation is always mathematics.
     */
    test: (r) => {
      const GREEK = "πθαβγλμσΔΩ";
      const RELATION = "≤≥≠±∞∑∫√";
      const m = r.match(new RegExp(
        // a relation with an operand on either side — spacing is irrelevant
        `(?:[\\dA-Za-z)]\\s*[${RELATION}]|[${RELATION}]\\s*[\\dA-Za-z(])`
        // a Greek letter against a digit or bracket — spacing is irrelevant
        + `|(?:[\\d)]\\s*[${GREEK}]|[${GREEK}]\\s*[\\d(])`
        // a Greek letter against a LETTER — only with no space, or it is just prose
        + `|(?:[A-Za-z][${GREEK}]|[${GREEK}][A-Za-z])`
      ));
      return m ? `expression with ${m[0].replace(/[\dA-Za-z()\s]/g, "")} left untokenized` : null;
    }
  },
  {
    file: "MATH_FRACTION_DISPLAY_INDEX.csv",
    what: "A slash fraction the learner reads as a slash rather than as a stacked fraction.",
    // A date, a ratio written with a colon and a page range are not fractions; only digit/digit is.
    test: (r) => (/(?<![\w/])\d+\s*\/\s*\d+(?![\w/])/.test(r) ? "slash fraction in prose" : null)
  },
  {
    file: "MATH_CANONICAL_FORM_INDEX.csv",
    what: "Right value, wrong shape: machine ordering and redundant coefficients.",
    /* DROPPED from the first cut: "integer printed with a trailing zero", which reported 159 rows
     * of "3.0" in decimal-place lessons where writing 3.0 IS the teaching point, and money written
     * as 3.00. The check cannot tell those from a formatting slip, so it is not made. */
    test: (r) => {
      if (/\b\d+\s*\*\s*[A-Za-z]\b/.test(r)) return "coefficient written with an explicit *";
      if (/\b[A-Za-z]\s*\*\s*\d+\b/.test(r)) return "variable before coefficient (machine order)";
      // Restricted to the letters this corpus uses as variables: `\b1[A-Za-z]\b` matched "1D".
      if (/\b1[xyznab](?![A-Za-z])/.test(r)) return "redundant unit coefficient (1x)";
      return null;
    }
  },
  {
    file: "MATH_CONSTANT_ORDER_INDEX.csv",
    what: "pi and e written in machine order or spelled out where the symbol belongs.",
    test: (r) => {
      if (/\bpi\b/.test(r)) return "pi spelled out in prose";
      if (/π\s*\*|\*\s*π/.test(r)) return "pi multiplied with an explicit *";
      if (/π\s*\d/.test(r)) return "coefficient written after pi";
      return null;
    }
  },
  {
    file: "MATH_DERIVATIVE_NOTATION_INDEX.csv",
    what: "Derivative notation left as ASCII where it should be typeset.",
    test: (r) => {
      if (/\bd[a-z]\s*\/\s*d[a-z]\b/.test(r)) return "dy/dx as a slash";
      if (/\bd\s*\/\s*d[a-z]\b/.test(r)) return "d/dx as a slash";
      if (/\bf\s*'\s*\(/.test(r)) return "prime notation unrendered";
      return null;
    }
  },
  {
    file: "MATH_INTEGRAL_NOTATION_INDEX.csv",
    what: "Integral notation left as ASCII, or an integral sign stranded outside an island.",
    /* DROPPED: a bare `dx`/`dt` check, which reported 369 rows. A differential in prose is how the
     * calculus lessons TALK about the notation — "dy/dx — Leibniz" is a lesson explaining the three
     * notations — and it was also double-counting every row in the derivative index. */
    test: (r) => {
      if (/\bint\s*\(|\bintegral\s+of\b/i.test(r)) return "integral written as ASCII";
      if (/∫/.test(r)) return "integral sign outside an island";
      return null;
    }
  },
  {
    file: "MATH_UNIT_NOTATION_INDEX.csv",
    what: "A quantity and its unit run together, or a unit symbol pluralised.",
    test: (r) => {
      if (new RegExp(`\\b\\d+(?:${UNITS})\\b`).test(r)) return "number welded to its unit";
      if (new RegExp(`\\b\\d+\\s(?:${UNITS})s\\b`).test(r)) return "unit symbol pluralised";
      return null;
    }
  },
  {
    file: "MATH_DECIMAL_FRACTION_POLICY_INDEX.csv",
    what: "A decimal expansion that looks like an invented rounding — CLAUDE.md rule 6.",
    /* THE HARD ONE, and the threshold is an admission rather than a measurement. 0.3125 is EXACT
     * (it is 5/16) and 0.000001 is exact too; a truncated irrational is not; and nothing in the
     * string says which it is. The first cut flagged four decimal places and reported 248 exact
     * terminating decimals as invented rounding. Six places is where truncated irrationals start to
     * dominate in practice — it is what caught `x = -2.236068` — and the cost is that a genuine
     * four- or five-place invention is missed. Powers of ten are excluded outright, and so is any
     * string that states a convention, in any of the wordings this corpus uses. */
    test: (r, raw) => {
      const m = r.match(/\d+\.\d{6,}/);
      if (!m) return null;
      if (/^0\.0*1$/.test(m[0]) || /^\d+\.0+$/.test(m[0])) return null;
      if (/round|decimal|nearest|significant|approx|≈|about|estimate/i.test(raw)) return null;
      return `${m[0].split(".")[1].length} decimal places, no stated convention`;
    }
  }
];

/* ------------------------------------------------------------------ */
/* COLLECTION.                                                                                      */
/* ------------------------------------------------------------------ */

type Row = { source: string; owner: string; unit: string; field: string; surface: string; shape: string; seed: string; residue: string; text: string };
const rows: Record<string, Row[]> = Object.fromEntries(INDEXES.map((i) => [i.file, [] as Row[]]));
let stringsScanned = 0;

function examine(text: string, arithmetic: boolean, meta: Omit<Row, "surface" | "shape" | "seed" | "residue" | "text"> & { seed?: string }) {
  if (typeof text !== "string" || text.length === 0) return;
  stringsScanned++;
  /* `Rich` and `MathProse` both split on `**` and consume it, so bold markers never reach the
   * screen and must not reach the residue either — leaving them in reported 197 rows of markdown
   * emphasis as multiplication and 16 as pi-times-something. A SINGLE asterisk is NOT consumed by
   * either renderer, so `*then*` really does render as literal asterisks; that survives here on
   * purpose and is reported under its own shape. */
  // Bold markers, then italic RUNS, exactly as MathProse resolves them — including the rule that
  // keeps "5 * 3^x" out of it. An asterisk surviving both is one the learner really sees.
  const rendered = text.split("**").join("")
    .replace(/(?<![A-Za-z0-9])\*(?![\s*])([^*\n]*?)(?<![\s*])\*(?![A-Za-z0-9])/g, "$1");
  const residue = authoredMathParts(rendered, { includeArithmetic: arithmetic })
    .map((p) => (p.source === undefined ? p.text : ""))
    .join("");
  for (const index of INDEXES) {
    const shape = index.test(residue, text);
    if (!shape) continue;
    rows[index.file].push({
      ...meta,
      surface: arithmetic ? "arithmetic-on" : "arithmetic-off",
      shape,
      seed: meta.seed ?? "",
      residue: residue.replace(/\s+/g, " ").slice(0, 160),
      text: text.replace(/\s+/g, " ").slice(0, 220)
    });
  }
}

/** Widget spec strings, which `widgets.tsx` renders with arithmetic OFF. */
const ID_KEYS = new Set(["id", "type", "form", "kind", "gen", "tag", "variant", "delimiter", "mode", "shape", "orientation"]);
function widgetStrings(node: unknown, path: string, out: Array<{ path: string; text: string }> = []) {
  if (typeof node === "string") {
    const leaf = path.split(".").pop() ?? "";
    if (!ID_KEYS.has(leaf) && !/(^|[a-z])Id$|Ids$/.test(leaf)) out.push({ path, text: node });
    return out;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => widgetStrings(v, `${path}[${i}]`, out)); return out; }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) widgetStrings(v, path ? `${path}.${k}` : k, out);
  return out;
}

/* ---- AUTHORED ---- */
function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.isFile() && e.name.endsWith(".json") ? [full] : [];
  });
}

for (const file of walk(join(ROOT, "content"))) {
  let json: Record<string, any>;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  if (!steps.length) continue;
  const lessonId = String(lesson.id ?? file);
  for (const [i, step] of steps.entries()) {
    const unit = `${step.id ?? i}`;
    // Lesson prose, hints and step feedback render with arithmetic ON (QuizShell, LessonPlayer).
    for (const field of ["body", "feedback", "successFeedback", "explanation"])
      examine(step[field], true, { source: "authored", owner: lessonId, unit, field });
    for (const [h, hint] of (step.hints ?? []).entries())
      examine(hint, true, { source: "authored", owner: lessonId, unit, field: `hints[${h}]` });
    if (step.predict) {
      examine(step.predict.prompt, true, { source: "authored", owner: lessonId, unit, field: "predict.prompt" });
      examine(step.predict.reveal, true, { source: "authored", owner: lessonId, unit, field: "predict.reveal" });
      for (const [o, option] of (step.predict.options ?? []).entries())
        examine(option.label, true, { source: "authored", owner: lessonId, unit, field: `predict.options[${o}].label` });
    }
    // Widget spec strings render with arithmetic OFF.
    for (const { path, text } of widgetStrings(step.widget, "widget"))
      examine(text, false, { source: "authored", owner: lessonId, unit, field: path });
  }
}

/* ---- GENERATED ---- */
if (!AUTHORED_ONLY) {
  for (const generator of VARIANT_GENERATORS) {
    const forms = generator.forms?.length ? [...generator.forms] : ["default"];
    for (const form of forms) {
      for (let i = 0; i < GENERATED_SAMPLES_PER_FORM; i++) {
        const band = BANDS[i % BANDS.length];
        const seed = `${generator.tag}|${form}|${band}|${i}`;
        let widget;
        try { widget = generator.gen(mulberry32(hashSeed(seed)), band, form as never).widget; } catch { continue; }
        for (const { path, text } of widgetStrings(widget, "widget"))
          examine(text, false, { source: "generated", owner: generator.tag, unit: String(form), field: path, seed });
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* OUTPUT.                                                                                          */
/* ------------------------------------------------------------------ */

const csv = (cells: string[]) => cells.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",");
const HEADER = ["source", "owner", "unit", "field", "surface", "shape", "seed", "residue", "text"];

if (!SUMMARY_ONLY) mkdirSync(OUT, { recursive: true });
console.log(`math-presentation-indexes @ ${seal}`);
console.log(`  ${stringsScanned} learner-visible strings measured (authored${AUTHORED_ONLY ? "" : " + generated"})`);
for (const index of INDEXES) {
  const body = rows[index.file];
  // Deduplicate: one generator emits the same shape at every seed, and 12 identical rows is noise.
  const seen = new Set<string>();
  const unique = body.filter((r) => {
    const key = `${r.source}|${r.owner}|${r.unit}|${r.field}|${r.shape}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const authored = unique.filter((r) => r.source === "authored").length;
  console.log(`  ${String(unique.length).padStart(5)}  ${index.file}  (${authored} authored, ${unique.length - authored} generated, ${body.length} before dedup)`);
  if (SUMMARY_ONLY) continue;
  writeFileSync(join(OUT, index.file), [
    `# sourceSeal=${seal} generatedBy=scripts/audit/math-presentation-indexes.mts`,
    `# ${index.what}`,
    "# Measured as the PROSE RESIDUE after authoredMathParts removes every island — what the learner reads, not what the author wrote.",
    "# Surface is derived from the call sites: widget spec strings render with arithmetic OFF, lesson body/hints/feedback with arithmetic ON.",
    "# One row per (source, owner, unit, field, shape); a generator emitting the same shape at every seed appears once, with one representative seed.",
    csv(HEADER),
    ...unique.map((r) => csv([r.source, r.owner, r.unit, r.field, r.surface, r.shape, r.seed, r.residue, r.text]))
  ].join("\n") + "\n");
}
if (!SUMMARY_ONLY) console.log(`  written to ${OUT}`);
