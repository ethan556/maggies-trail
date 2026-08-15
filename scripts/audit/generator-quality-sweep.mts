#!/usr/bin/env npx tsx
/**
 * S242 / GEN-01 + GEN-02 — THE GENERATED-SIDE AUDIT THE SOURCE SCANS CANNOT DO.
 *
 * WHY THIS EXISTS. Every audit this repository has run so far reads SOURCE: lesson JSON, generator
 * bodies, component files. Not one of them has looked at what a generator actually EMITS. That is
 * a real blind spot and the V3 plan names it — "source-only scans cannot see calculated/generated
 * leaks". A generator can pass every existing gate and still hand a learner "3th", a fraction that
 * is never reduced, an option list with two identical labels, a caret that reaches the screen as a
 * caret, or the same problem eleven times running. None of that is visible until you generate the
 * problems and read them.
 *
 * WHAT IT DOES. It draws deterministic samples from every (generator, form) pair in the registry
 * and runs nine independent audits over the RESULT, one CSV each. It is the machinery behind the
 * V3 artifact contract, and it is the sampling design GEN-02 asks for.
 *
 * THE SAMPLING DESIGN, STATED SO IT CAN BE ARGUED WITH.
 *   · SEEDS. `hashSeed("<tag>|<form>|<band>|<index>")` — a pure function of the coordinates, so any
 *     row in any CSV can be reproduced from the row itself. No clock, no counter, no RNG state
 *     carried between generators.
 *   · VOLUME. GENERATOR_INVENTORY.json assigns each generator a tier: 500 outputs for the 74
 *     high-reach or wide-form generators, 100 for the other 368. A generator's budget is spread
 *     across its forms, with a floor of MIN_PER_FORM so a 25-form generator cannot give a form
 *     four samples and call it certified. Total per generator is therefore >= its tier, usually
 *     well above.
 *   · BANDS. Band rotates with the sample index rather than multiplying the budget by three. Every
 *     form is exercised in support, core and stretch; no form's evidence is band-flat. Stated
 *     plainly because it is a trade: it buys band coverage with sample depth at fixed band.
 *   · WHAT IS NOT SAMPLED. `declarationOnly` generators throw on form "default" BY DESIGN, so they
 *     are sampled on their declared forms only. A throw on a declared form is a finding; a throw
 *     on "default" for one of these is the contract working and is not recorded as a defect.
 *
 * WHAT THIS IS NOT. It is not a replacement for reading the output as a human — CLAUDE.md's step 5
 * exists because a gate is necessary and not sufficient, and every finding here is a machine's
 * suspicion until someone reads the row. The CSVs are ordered worst-first for exactly that reason.
 *
 * Usage:
 *   npx tsx scripts/audit/generator-quality-sweep.mts            # write all nine CSVs
 *   npx tsx scripts/audit/generator-quality-sweep.mts --summary  # counts only, write nothing
 *   npx tsx scripts/audit/generator-quality-sweep.mts --tag foo  # one generator, for iterating
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS, type Variant } from "../../src/lib/variants";
import { hashSeed, mulberry32 } from "../../src/lib/prng";
import { authoredMathParts } from "../../src/lib/math/authoredMath";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "generator-audit");
const SUMMARY_ONLY = process.argv.includes("--summary");
const ONLY_TAG = process.argv.includes("--tag") ? process.argv[process.argv.indexOf("--tag") + 1] : null;
const MIN_PER_FORM = 30;
const BANDS: Band[] = ["support", "core", "stretch"];
/** The anti-repeat window §10 measures against: a repeat inside this many draws is a duplicate. */
const REPEAT_WINDOW = 10;

const seal = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch { return "unsealed"; }
})();

type InventoryRow = { tag: string; samplingTier: number; riskFlags: string[]; declaringSteps: number; parameterSpace: string };
const inventory = new Map<string, InventoryRow>();
for (const candidate of [join(ROOT, "GENERATOR_INVENTORY.json"), join(ROOT, "reports", "GENERATOR_INVENTORY.json")]) {
  if (!existsSync(candidate)) continue;
  for (const row of JSON.parse(readFileSync(candidate, "utf8")).generators) inventory.set(row.tag, row);
  break;
}

/* ------------------------------------------------------------------ */
/* EXTRACTION. What a learner can actually read, and what the widget claims about it.               */
/* ------------------------------------------------------------------ */

/** Keys whose string values are machine identifiers, never prose the learner sees. Everything else
 *  is treated as learner-visible, which is the safe default: a missed key hides a defect, an extra
 *  key at worst produces a finding somebody dismisses in one line. */
const ID_KEYS = new Set(["id", "type", "form", "kind", "gen", "tag", "variant", "delimiter", "mode", "shape", "orientation"]);
const isIdKey = (key: string) => ID_KEYS.has(key) || /(^|[a-z])Id$|Ids$/.test(key);

type Str = { path: string; text: string };
function strings(node: unknown, path = "", out: Str[] = []): Str[] {
  if (typeof node === "string") { if (!isIdKey(path.split(".").pop() ?? "")) out.push({ path, text: node }); return out; }
  if (Array.isArray(node)) { node.forEach((v, i) => strings(v, `${path}[${i}]`, out)); return out; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) strings(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

function numbers(node: unknown, path = "", out: Array<{ path: string; value: number }> = []) {
  if (typeof node === "number") { out.push({ path, value: node }); return out; }
  if (Array.isArray(node)) { node.forEach((v, i) => numbers(v, `${path}[${i}]`, out)); return out; }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) numbers(v, path ? `${path}.${k}` : k, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* THE NINE AUDITS. Each returns findings for ONE sample; aggregation happens in the sweep.         */
/* ------------------------------------------------------------------ */

type Finding = { severity: "high" | "medium" | "low"; code: string; where: string; detail: string };

/* LANGUAGE. The defects CLAUDE.md says only reading catches, expressed as patterns.
 *
 * EVERY PATTERN HERE WAS NARROWED AFTER READING ITS OWN FIRST RESULTS, and the narrowing is the
 * interesting part, because the first cut of this function produced 1,616 findings of which the
 * large majority were the detector's fault:
 *   · `\bnull\b` flagged 25 rows of statistics vocabulary — "the null hypothesis", "under the
 *     null". In a product that teaches significance testing, `null` is a word learners must read.
 *   · The ordinal check flagged "12th", which is correct English. Its `2th` branch had no guard
 *     for the teens, where the -th form is the right one.
 *   · `\bband\b` flagged a marching band, `\bseed\b` would flag a plant, `\btrap\b` flagged the
 *     phrase "the cuts-versus-pieces trap" used as ordinary English.
 *   · `\s{2,}` flagged every paragraph break, because `\n\n` is two whitespace characters.
 *   · `\s[.,;:!?]` flagged the ratio "2 : 3 : 4" and the prompt ending "= ?".
 *   · `\b1 [a-z]+s\b` flagged "n − 1 jumps" and "Input 1 is paired", where the 1 is not a count.
 * A findings file that is mostly false is worse than no findings file: it trains its readers to
 * skim. The rules below are deliberately narrow, and each says what it gives up. */
const UNIT_NOUNS = "units?|inches|feet|yards|miles|metres|meters|centimetres|centimeters|millimetres|millimeters"
  + "|kilometres|kilometers|grams|kilograms|pounds|ounces|litres|liters|millilitres|milliliters"
  + "|pieces|parts|items|groups|rows|columns|sides|angles|degrees|dollars|cents|hours|minutes|seconds"
  + "|days|weeks|months|years|squares|cubes|tiles|counters|beads|marbles|apples|books|pencils|students|children";
/** Correct English ordinals: 1→st 2→nd 3→rd, except the teens, which all take -th. */
const BAD_ORDINAL = new RegExp(
  "\\b\\d*(?:(?<!1)1th|(?<!1)2th|(?<!1)3th|11st|12nd|13rd|[04-9]st|[04-9]nd|[04-9]rd|1[0-9]st|1[0-9]nd|1[0-9]rd)\\b"
);

function auditLanguage(v: Variant): Finding[] {
  const found: Finding[] = [];
  for (const { path, text } of strings(v.widget)) {
    const leaf = path.split(".").pop() ?? "";
    const add = (severity: Finding["severity"], code: string, detail: string) =>
      found.push({ severity, code, where: path, detail });

    // A value that failed to compute reaching prose is the worst thing on this list. `undefined`,
    // `NaN` and `[object Object]` are unambiguous — no English sentence contains them. `null` and
    // `Infinity` ARE English in this corpus, so they only count in a computed position: sitting
    // against an equals sign or a digit, which is where an interpolation lands.
    if (/\bundefined\b|\bNaN\b|\[object Object\]/.test(text)) add("high", "computed-value-leak", text.slice(0, 160));
    if (/[=:]\s*(?:null|Infinity)\b|\b(?:null|Infinity)\s*[+\-*/=]/.test(text)) add("high", "computed-value-leak", text.slice(0, 160));

    // Derived English morphology — the class CLAUDE.md bans outright.
    if (BAD_ORDINAL.test(text)) add("high", "derived-ordinal", text.slice(0, 160));
    // A literal 1 counting a plural noun. Restricted to a unit-noun list and to a 1 that is not
    // itself the tail of an expression, because "n − 1 jumps" is correct and common here. The cost
    // of the list is real: a pluralised noun outside it is missed.
    if (new RegExp(`(?<![-−+*/×÷]\\s?)\\b1 (?:${UNIT_NOUNS})\\b`).test(text)) add("medium", "count-disagreement", text.slice(0, 160));
    if (/\ba (shelve|leafe|knive|wolve|halve|lifes)\b/.test(text)) add("high", "naive-plural-strip", text.slice(0, 160));

    // Spliced or dangling phrases — careless .replace() and ternaries. Two literal SPACES, so a
    // deliberate paragraph break is not a finding.
    if (/ {2,}/.test(text)) add("low", "double-space", JSON.stringify(text.slice(0, 120)));
    // A space before a sentence-ending mark only. Colons, question marks and exclamation marks are
    // excluded because "ratio 2 : 3 : 4" and "= ?" are how this corpus writes mathematics.
    if (/ [.,;](?=\s|$)/.test(text)) add("medium", "space-before-punctuation", JSON.stringify(text.slice(0, 120)));
    if (/[.,;]{2,}/.test(text) && !/\.\.\.|\b(?:e\.g|i\.e|etc|vs)\.,/.test(text))
      add("medium", "doubled-punctuation", JSON.stringify(text.slice(0, 120)));
    if (text !== text.trim()) add("low", "untrimmed", JSON.stringify(text.slice(0, 120)));

    // Authoring and developer vocabulary reaching the learner (Wave 4's contract). Only terms with
    // no ordinary English reading survive here; "band", "trap", "seed" and "parameter" were cut.
    if (/\b(TODO|FIXME|XXX|lorem ipsum|conceptTag|mulberry32|hashSeed|VariantForm|successFeedback)\b/i.test(text))
      add("high", "developer-vocabulary", text.slice(0, 160));

    // Feedback rules apply to feedback FIELDS, not to any path containing the word. The first cut
    // matched `misorderFeedback[0].first`, whose value is an item id, and reported "i1" as terse
    // prose 75 times.
    if (/feedback$/i.test(leaf)) {
      if (/^\s*(No[,.\s]|Nope|Wrong|Incorrect|Not quite\b)/i.test(text)) add("medium", "negation-opener", text.slice(0, 160));
      if (text.trim().length < 25) add("medium", "feedback-too-terse", JSON.stringify(text));
    }
  }
  return found;
}

/* MATH PRESENTATION. Implementation-form mathematics reaching the learner, in GENERATED text.
 *
 * THE MEASURE IS THE RESIDUE, NOT THE SHORTHAND. An earlier cut of this function pattern-matched
 * the strings and reported every `sqrt(` and every `^` as a leak. That is the wrong question:
 * `sqrt(12)` in the source is exactly how an author is SUPPOSED to write a radical, and the
 * tokenizer turns it into a KaTeX surd. Reporting it as a defect confuses shorthand with failure
 * and produces a file that shrinks when the corpus gets worse.
 *
 * So each string is run through `authoredMathParts` — the real boundary, not a model of it — and
 * what is measured is the PROSE THAT SURVIVES: the characters the learner will actually read,
 * with every island removed. A caret in the residue is a caret on the screen.
 *
 * Both surfaces are evaluated, because `includeArithmetic` is a property of the surface a widget
 * happens to render on and a generator does not choose it. A leak on both is `high`; a leak only
 * on the arithmetic-off path is `medium` and names the surface in its detail. */
function auditMathPresentation(v: Variant): Finding[] {
  const found: Finding[] = [];
  const residue = (text: string, includeArithmetic: boolean) =>
    authoredMathParts(text, { includeArithmetic })
      .map((p) => (p.source === undefined ? p.text : ""))
      .join("");
  const PATTERNS: Array<[string, RegExp]> = [
    ["raw-sqrt", /sqrt\s*\(/i],
    ["raw-caret", /\^/],
    ["machine-pi", /\*\s*pi\b|\bpi\s*\*/],
    ["asterisk-multiplication", /(?<!\*)\*(?!\*)/],
    ["javascript-expression", /\bMath\.[a-z]/i],
    ["stacked-slash-fraction", /\d+\/\d+\s*\/\s*\d+/],
    ["exponential-notation-leak", /\d[eE][+-]\d\d\b/],
    ["machine-inequality", /<=|>=/]
  ];
  for (const { path, text } of strings(v.widget)) {
    if (!/[\^*/]|sqrt|pi\b|Math\.|<=|>=/i.test(text)) continue; // cheap gate: most strings are prose
    const on = residue(text, true), off = residue(text, false);
    for (const [code, pattern] of PATTERNS) {
      const leaksOn = pattern.test(on), leaksOff = pattern.test(off);
      if (!leaksOn && !leaksOff) continue;
      found.push({
        severity: leaksOn && leaksOff ? "high" : "medium",
        code,
        where: path,
        detail: `${leaksOn && leaksOff ? "both surfaces" : leaksOn ? "arithmetic-on only" : "arithmetic-off only"}: ${(leaksOn ? on : off).slice(0, 140)}`
      });
    }
  }
  return found;
}

/** CANONICAL FORM. Right value, wrong shape — the class "correctly rendered" does not catch. */
function auditCanonicalForm(v: Variant): Finding[] {
  const found: Finding[] = [];
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
  // `tolerance` is a grading epsilon and `commonErrors[].value` / `numericErrors[].value` are
  // COMPARED against what the learner types, never printed. A six-decimal number in one of those is
  // a deliberate engineering choice, not a rounding convention invented in front of a child, and
  // flagging them buried the real hits: the first cut reported 107 float artifacts of which the
  // overwhelming majority were tolerances. Numbers that reach the screen are still checked, and so
  // is every string, which is where the genuine "x = -2.236068" cases live.
  const COMPARED_ONLY = /(?:^|\.)tolerance$|(?:commonErrors|numericErrors|commonEntries|pointErrors)\[\d+\]\.(?:value|values)/;
  for (const { path, value } of numbers(v.widget)) {
    if (!Number.isFinite(value)) { found.push({ severity: "high", code: "non-finite-number", where: path, detail: String(value) }); continue; }
    if (Object.is(value, -0)) found.push({ severity: "medium", code: "negative-zero", where: path, detail: "-0" });
    if (COMPARED_ONLY.test(path)) continue;
    const printed = String(value);
    if (/\.\d{6,}/.test(printed)) found.push({ severity: "high", code: "float-artifact", where: path, detail: printed });
  }
  // An answer fraction that is not in lowest terms, where the generator did the reducing. Kept at
  // LOW: place-value work deliberately teaches the unreduced form — six thousandths IS 6/1000, and
  // reducing it to 3/500 would destroy the lesson — so this needs a human before it is a defect.
  const a = v.answer as Record<string, number> | undefined;
  if (a && typeof a === "object" && typeof a.num === "number" && typeof a.den === "number" && a.den !== 0) {
    const g = gcd(a.num, a.den);
    if (g > 1) found.push({ severity: "low", code: "unreduced-answer-fraction", where: "answer", detail: `${a.num}/${a.den} reduces by ${g} — check whether the lesson wants place-value form` });
  }
  /* S242 (user ruling): "exact is always preferable UNLESS the numeric answer is required for a
   * specific pedagogic concept mastery." Some items are ABOUT the decimal expansion, and reporting
   * those was the detector's error, not the content's:
   *   · "5/11 as a decimal is exactly: 0.454545…" — the repeat is the whole lesson;
   *   · "Which power of ten equals 0.0000001?" — the decimal IS the question;
   *   · "π ≈ 3.141593 > 333/106 ≈ 3.141509" — you cannot compare them without expanding.
   * So a long decimal counts as invented rounding only where the item is NOT about decimal
   * expansion. The exception is deliberately narrow: it needs the item to say so. */
  const promptText = String((v.widget as Record<string, unknown>).prompt ?? "");
  const decimalIsTheConcept = /\bdecimal\b|\brepeat|\bexpansion|\bterminat|\bapproximat|≈|\bpower of ten\b|\birrational\b|\bround/i.test(promptText);
  for (const { path, text } of strings(v.widget)) {
    if (/\b\d+\.0\b/.test(text)) found.push({ severity: "low", code: "integer-with-trailing-zero", where: path, detail: text.slice(0, 120) });
    if (/\.\d{6,}/.test(text) && !decimalIsTheConcept)
      found.push({ severity: "high", code: "float-artifact-in-prose", where: path, detail: text.slice(0, 160) });
  }
  return found;
}

/** DISTRACTORS. Rule 4: a trap that can grade correct is a bug, not a near miss. */
function auditDistractors(v: Variant): Finding[] {
  const found: Finding[] = [];
  const w = v.widget as Record<string, any>;
  if (w.type === "mcq" && Array.isArray(w.options)) {
    const labels = w.options.map((o: any) => String(o.label).trim());
    const correct = w.options.filter((o: any) => o.correct);
    if (correct.length !== 1)
      found.push({ severity: "high", code: "mcq-correct-count", where: "options", detail: `${correct.length} options marked correct` });
    const dupes = labels.filter((l: string, i: number) => labels.indexOf(l) !== i);
    for (const d of new Set(dupes))
      found.push({ severity: "high", code: "duplicate-option-label", where: "options", detail: d.slice(0, 120) });
    if (labels.length < 2) found.push({ severity: "high", code: "mcq-too-few-options", where: "options", detail: String(labels.length) });
    for (const o of w.options)
      if (!o.correct && (!o.feedback || String(o.feedback).trim().length < 25))
        found.push({ severity: "medium", code: "distractor-without-diagnosis", where: `options.${o.id}`, detail: String(o.feedback ?? "").slice(0, 120) });
    if (typeof v.answer === "string" && !w.options.some((o: any) => o.id === v.answer))
      found.push({ severity: "high", code: "answer-not-an-option", where: "answer", detail: String(v.answer) });
  }
  // A numeric trap that equals the answer grades the misconception CORRECT.
  if (Array.isArray(w.commonErrors) && typeof w.answer === "number") {
    const tol = typeof w.tolerance === "number" ? w.tolerance : 0;
    for (const e of w.commonErrors) {
      if (typeof e.value !== "number") continue;
      if (Math.abs(e.value - w.answer) <= tol)
        found.push({ severity: "high", code: "trap-collides-with-answer", where: "commonErrors", detail: `${e.value} vs answer ${w.answer} (tol ${tol})` });
      if (!e.feedback || String(e.feedback).trim().length < 25)
        found.push({ severity: "medium", code: "trap-without-diagnosis", where: "commonErrors", detail: String(e.value) });
    }
    const values = w.commonErrors.map((e: any) => e.value);
    const collided = values.filter((x: number, i: number) => values.indexOf(x) !== i);
    for (const c of new Set(collided))
      found.push({ severity: "high", code: "trap-collides-with-trap", where: "commonErrors", detail: String(c) });
  }
  return found;
}

/** INTERACTION SYNC. Does the graded answer fit the surface the learner is given? */
function auditInteractionSync(v: Variant): Finding[] {
  const found: Finding[] = [];
  const w = v.widget as Record<string, any>;
  const a = v.answer as any;
  const add = (code: string, detail: string) => found.push({ severity: "high", code, where: w.type, detail });
  if (w.type === "numeric" && typeof a !== "number") add("answer-shape-mismatch", `numeric widget graded against ${typeof a}`);
  if (w.type === "mcq" && typeof a !== "string") add("answer-shape-mismatch", `mcq widget graded against ${typeof a}`);
  if (w.type === "numeric" && typeof w.answer === "number" && typeof a === "number" && w.answer !== a)
    add("answer-disagrees-with-widget", `widget says ${w.answer}, variant says ${a}`);
  if (w.type === "plotPoint" && Array.isArray(a)) {
    for (const p of a) {
      if (typeof p?.x !== "number" || typeof p?.y !== "number") { add("plot-answer-shape", JSON.stringify(p).slice(0, 80)); continue; }
      // A target the learner physically cannot reach on the grid they are shown.
      if (typeof w.cols === "number" && (p.x < 0 || p.x > w.cols)) add("target-outside-grid", `x=${p.x} on ${w.cols} columns`);
      if (typeof w.rows === "number" && (p.y < 0 || p.y > w.rows)) add("target-outside-grid", `y=${p.y} on ${w.rows} rows`);
    }
  }
  if (w.type === "dragBucket" && a && typeof a === "object") {
    const bucketIds = new Set((w.buckets ?? []).map((b: any) => b.id));
    const itemIds = new Set((w.items ?? []).map((i: any) => i.id));
    for (const [item, bucket] of Object.entries(a)) {
      if (!itemIds.has(item)) add("answer-names-missing-item", item);
      if (!bucketIds.has(bucket as string)) add("answer-names-missing-bucket", String(bucket));
    }
    for (const id of itemIds) if (!(id as string in a)) add("item-with-no-graded-home", String(id));
  }
  if (w.type === "fractionEntry" && a && typeof a === "object" && typeof a.den === "number" && a.den === 0)
    add("zero-denominator", JSON.stringify(a));
  return found;
}

/** VISUAL SYNC. The drawable half of the widget, checked for things that cannot render. */
function auditVisualSync(v: Variant): Finding[] {
  const found: Finding[] = [];
  const w = v.widget as Record<string, any>;
  const add = (severity: Finding["severity"], code: string, where: string, detail: string) => found.push({ severity, code, where, detail });
  // An empty collection where the widget's whole job is to draw that collection.
  for (const key of ["options", "items", "buckets", "targets", "points", "plotData", "roots", "segments", "rows", "bars", "cells"]) {
    const value = w[key];
    if (Array.isArray(value) && value.length === 0) add("high", "empty-visual-collection", key, `${w.type}.${key} is empty`);
  }
  for (const { path, value } of numbers(w)) {
    if (!Number.isFinite(value)) add("high", "non-finite-geometry", path, String(value));
    // A coordinate or dimension large enough to blow the viewBox out of the visible area.
    if (Math.abs(value) > 1e6) add("medium", "out-of-scale-value", path, String(value));
  }
  // Labels long enough to collide at mobile width. Restricted to widgets that DRAW their labels
  // into a fixed coordinate space, where length turns into overlap. An mcq option or a dragOrder
  // step is prose in a flowing box and is supposed to be a sentence: the first cut of this check
  // flagged 1,271 of them and said nothing anybody could act on.
  const DRAWN = new Set(["plotPoint", "numberLineHop", "numberLinePlace", "numberLineRay", "signChart", "dotPlot",
    "boxPlot", "scatterFit", "graphRead", "areaModel", "tapDiagram", "fractionBar", "fractionGrid", "percentBar",
    "doubleNumberLine", "ratioTable", "angleMeasure", "clockSet", "lengthCompare", "absValueLine"]);
  if (DRAWN.has(String(w.type))) {
    for (const { path, text } of strings(w)) {
      if (/label/i.test(path) && text.length > 24) add("low", "overlong-drawn-label", path, `${text.length} chars: ${text.slice(0, 60)}`);
    }
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* THE SWEEP.                                                                                       */
/* ------------------------------------------------------------------ */

type PairStat = {
  tag: string; form: string; tier: number; widgetType: string;
  samples: number; throws: number; throwDetail: string;
  distinctWidgets: number; distinctAnswers: number; distinctPrompts: number;
  windowDuplicates: number; globalDuplicates: number;
  findings: Map<string, { severity: string; count: number; example: string; where: string }>;
};

const pairs: PairStat[] = [];
const rows: Record<string, string[][]> = {
  quality: [], duplication: [], language: [], distractor: [],
  visual: [], edge: [], math: [], canonical: [], interaction: []
};

const AUDITS: Array<[keyof typeof rows, (v: Variant) => Finding[]]> = [
  ["language", auditLanguage], ["math", auditMathPresentation], ["canonical", auditCanonicalForm],
  ["distractor", auditDistractors], ["interaction", auditInteractionSync], ["visual", auditVisualSync]
];

for (const generator of VARIANT_GENERATORS) {
  if (ONLY_TAG && generator.tag !== ONLY_TAG) continue;
  const inv = inventory.get(generator.tag);
  const tier = inv?.samplingTier ?? 100;
  const forms = generator.forms?.length ? [...generator.forms] : ["default"];
  const perForm = Math.max(Math.ceil(tier / forms.length), MIN_PER_FORM);

  for (const form of forms) {
    const stat: PairStat = {
      tag: generator.tag, form: String(form), tier, widgetType: "",
      samples: 0, throws: 0, throwDetail: "",
      distinctWidgets: 0, distinctAnswers: 0, distinctPrompts: 0,
      windowDuplicates: 0, globalDuplicates: 0, findings: new Map()
    };
    const widgetKeys: string[] = [];
    const seenWidgets = new Set<string>(), seenAnswers = new Set<string>(), seenPrompts = new Set<string>();

    for (let i = 0; i < perForm; i++) {
      const band = BANDS[i % BANDS.length];
      const seedText = `${generator.tag}|${form}|${band}|${i}`;
      let variant: Variant;
      try {
        variant = generator.gen(mulberry32(hashSeed(seedText)), band, form as never);
      } catch (error) {
        stat.throws++;
        if (!stat.throwDetail) stat.throwDetail = String((error as Error).message).slice(0, 160);
        continue;
      }
      stat.samples++;
      stat.widgetType ||= variant.widget.type;
      const key = JSON.stringify(variant.widget);
      widgetKeys.push(key);
      if (seenWidgets.has(key)) stat.globalDuplicates++;
      seenWidgets.add(key);
      seenAnswers.add(JSON.stringify(variant.answer));
      seenPrompts.add(String((variant.widget as Record<string, unknown>).prompt ?? ""));

      for (const [bucket, audit] of AUDITS) {
        for (const f of audit(variant)) {
          const id = `${bucket}::${f.code}::${f.where}`;
          const prior = stat.findings.get(id);
          if (prior) prior.count++;
          else stat.findings.set(id, { severity: f.severity, count: 1, example: f.detail, where: f.where });
          if (prior) continue;
          rows[bucket].push([generator.tag, String(form), stat.widgetType, f.severity, f.code, f.where, seedText, f.detail.replace(/\s+/g, " ")]);
        }
      }
    }
    // Duplicates INSIDE the anti-repeat window — the number §10 requires to be zero.
    for (let i = 0; i < widgetKeys.length; i++)
      for (let j = Math.max(0, i - REPEAT_WINDOW); j < i; j++)
        if (widgetKeys[i] === widgetKeys[j]) { stat.windowDuplicates++; break; }

    stat.distinctWidgets = seenWidgets.size;
    stat.distinctAnswers = seenAnswers.size;
    stat.distinctPrompts = seenPrompts.size;
    pairs.push(stat);
  }
}

/* ------------------------------------------------------------------ */
/* EDGE CASES. Band extremes and the first/last seed of each form, recorded separately because a    */
/* failure at the edge of a parameter space is a different fact from a failure in the middle of it. */
/* ------------------------------------------------------------------ */
for (const stat of pairs) {
  const generator = VARIANT_GENERATORS.find((g) => g.tag === stat.tag)!;
  for (const band of BANDS) {
    for (const index of [0, 1, 9999, 100000]) {
      const seedText = `${stat.tag}|${stat.form}|${band}|edge-${index}`;
      try {
        const v = generator.gen(mulberry32(hashSeed(seedText)), band, stat.form as never);
        const bad = numbers(v.widget).filter((n) => !Number.isFinite(n.value));
        for (const n of bad) rows.edge.push([stat.tag, stat.form, band, "high", "non-finite-at-edge", n.path, seedText, String(n.value)]);
      } catch (error) {
        rows.edge.push([stat.tag, stat.form, band, "high", "throws-at-edge", "gen", seedText, String((error as Error).message).slice(0, 160)]);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* OUTPUT.                                                                                          */
/* ------------------------------------------------------------------ */

const csv = (cells: string[]) =>
  cells.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",");

const FINDING_HEADER = ["generator", "form", "widgetType", "severity", "code", "where", "seed", "detail"];
const FILES: Array<[keyof typeof rows, string, string[]]> = [
  ["language", "GENERATOR_LANGUAGE_AUDIT.csv", FINDING_HEADER],
  ["math", "GENERATOR_MATH_PRESENTATION_AUDIT.csv", FINDING_HEADER],
  ["canonical", "GENERATOR_CANONICAL_FORM_AUDIT.csv", FINDING_HEADER],
  ["distractor", "GENERATOR_DISTRACTOR_AUDIT.csv", FINDING_HEADER],
  ["interaction", "GENERATOR_INTERACTION_SYNC_AUDIT.csv", FINDING_HEADER],
  ["visual", "GENERATOR_VISUAL_SYNC_AUDIT.csv", FINDING_HEADER],
  ["edge", "GENERATOR_EDGE_CASE_AUDIT.csv", ["generator", "form", "band", "severity", "code", "where", "seed", "detail"]]
];

const rank = { high: 0, medium: 1, low: 2 } as Record<string, number>;
const totals: Record<string, number> = {};

if (!SUMMARY_ONLY) mkdirSync(OUT, { recursive: true });
for (const [bucket, filename, header] of FILES) {
  const body = [...rows[bucket]].sort((a, b) => (rank[a[3]] ?? 3) - (rank[b[3]] ?? 3) || a[0].localeCompare(b[0]));
  totals[filename] = body.length;
  if (SUMMARY_ONLY) continue;
  writeFileSync(join(OUT, filename), [`# sourceSeal=${seal} generatedBy=scripts/audit/generator-quality-sweep.mts`, csv(header), ...body.map(csv)].join("\n") + "\n");
}

// QUALITY — one row per (generator, form), worst first.
const qualityBody = [...pairs].sort((a, b) =>
  (b.throws - a.throws) || (b.windowDuplicates - a.windowDuplicates) || (a.distinctWidgets / Math.max(a.samples, 1)) - (b.distinctWidgets / Math.max(b.samples, 1))
).map((s) => [
  s.tag, s.form, s.widgetType, String(s.tier), String(s.samples), String(s.throws),
  String(s.distinctWidgets), String(s.distinctAnswers), String(s.distinctPrompts),
  (s.distinctWidgets / Math.max(s.samples, 1)).toFixed(3),
  String([...s.findings.values()].filter((f) => f.severity === "high").reduce((n, f) => n + f.count, 0)),
  String([...s.findings.values()].reduce((n, f) => n + f.count, 0)),
  s.throwDetail
]);
totals["GENERATOR_QUALITY_AUDIT.csv"] = qualityBody.length;

/* DUPLICATION — POOL SIZE, honestly named.
 *
 * WHAT §10 ASKS FOR AND WHAT THE CODE HAS. The program threshold is "unintended generator duplicate
 * rate inside anti-repeat window: 0". Reading the runtime: `variantForStep(item, seed)` is called
 * with a seed built from the step and the date (`${key}:${box}:${today}` on review). There is no
 * queue of recently-served variants and nothing anywhere consults one — the repository has no
 * anti-repeat MECHANISM to violate. So a raw repeat count here cannot be a count of defects
 * against that threshold, and presenting it as one would be inventing a violation.
 *
 * WHAT THIS ACTUALLY MEASURES, then, is the FRESHNESS CEILING: how many distinct problems a
 * (generator, form) pair can produce at all. That is the number GEN-04 will need, and it splits
 * cleanly against the ten-draw window:
 *   · POOL-BELOW-WINDOW — ten or fewer distinct problems exist. A learner practising ten times
 *     MUST see a repeat, and no anti-repeat queue can prevent it. Only a wider pool can — or, per
 *     CLAUDE.md rule 7, an honest acceptance that this concept has few distinct problems.
 *   · POOL-ABOVE-WINDOW — the pair has more distinct problems than the window is wide, so the
 *     repeats observed here are a consequence of independent seeding and an anti-repeat queue
 *     would remove them. These are GEN-04's to close, not the generator author's.
 * Sorted smallest pool first, because that is the order in which the work matters. */
const verdictOf = (s: PairStat) => (s.distinctWidgets <= REPEAT_WINDOW ? "pool-below-window" : "pool-above-window");
const dupBody = pairs.filter((s) => s.windowDuplicates || s.globalDuplicates)
  .sort((a, b) => a.distinctWidgets - b.distinctWidgets || b.windowDuplicates - a.windowDuplicates)
  .map((s) => [s.tag, s.form, s.widgetType, verdictOf(s), String(s.samples), String(s.distinctWidgets),
    String(s.windowDuplicates), String(s.globalDuplicates),
    (s.globalDuplicates / Math.max(s.samples, 1)).toFixed(3), String(REPEAT_WINDOW)]);
totals["GENERATOR_DUPLICATION_AUDIT.csv"] = dupBody.length;
const belowWindow = pairs.filter((s) => s.distinctWidgets <= REPEAT_WINDOW).length;
const singleOutput = pairs.filter((s) => s.distinctWidgets <= 1).length;

if (!SUMMARY_ONLY) {
  writeFileSync(join(OUT, "GENERATOR_QUALITY_AUDIT.csv"), [
    `# sourceSeal=${seal} minPerForm=${MIN_PER_FORM} bands=${BANDS.join("/")} seed=hashSeed("<tag>|<form>|<band>|<index>")`,
    csv(["generator", "form", "widgetType", "tier", "samples", "throws", "distinctWidgets", "distinctAnswers", "distinctPrompts", "freshness", "highFindings", "allFindings", "throwDetail"]),
    ...qualityBody.map(csv)
  ].join("\n") + "\n");
  writeFileSync(join(OUT, "GENERATOR_DUPLICATION_AUDIT.csv"), [
    `# sourceSeal=${seal} window=${REPEAT_WINDOW} — a windowDuplicate is the same widget twice inside ${REPEAT_WINDOW} consecutive draws. distinctWidgets IS A LOWER BOUND: it cannot exceed the sample count, so a pair reporting 28 distinct in 30 draws has a pool of AT LEAST 28 and possibly far more. Only pairs that saturated well below their sample count (the pool-below-window rows) measure a true ceiling.`,
    csv(["generator", "form", "widgetType", "verdict", "samples", "distinctWidgets", "windowDuplicates", "globalDuplicates", "globalDuplicateRate", "window"]),
    ...dupBody.map(csv)
  ].join("\n") + "\n");
}

const totalSamples = pairs.reduce((n, s) => n + s.samples, 0);
const totalThrows = pairs.reduce((n, s) => n + s.throws, 0);
console.log(`generator-quality-sweep @ ${seal}`);
console.log(`  ${pairs.length} (generator, form) pairs · ${totalSamples} samples · ${totalThrows} throws`);
console.log(`  window duplicates: ${pairs.reduce((n, s) => n + s.windowDuplicates, 0)} · global duplicates: ${pairs.reduce((n, s) => n + s.globalDuplicates, 0)}`);
console.log(`  pairs whose whole pool is <= the ${REPEAT_WINDOW}-draw window: ${belowWindow} · pairs that emit ONE problem forever: ${singleOutput}`);
for (const [file, count] of Object.entries(totals).sort()) console.log(`  ${String(count).padStart(6)}  ${file}`);
if (!SUMMARY_ONLY) console.log(`  written to ${OUT}`);
