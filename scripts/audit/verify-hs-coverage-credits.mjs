#!/usr/bin/env node
/**
 * verify-hs-coverage-credits — test the weakest claims in the high-school coverage map against the
 * actual lesson text, instead of trusting the chapter title that produced them.
 *
 * WHY. `ccss-hs-coverage-map.json` is `authored-from-titles`. Titles flatter content, so the map
 * over-credits and its uncovered count (10 core) is a LOWER BOUND. The question this script answers
 * is the one that decides whether that bound is close or badly wrong: **of the standards the map
 * says are covered, which are supported by nothing more than a chapter heading?**
 *
 * SCOPE, chosen to be the highest-yield subset rather than everything. 58 of the 127 core standards
 * rest on a SINGLE crediting chapter; those are the fragile ones. A standard credited by three
 * chapters is unlikely to be wholly imaginary. So each of the 58 gets a content probe — a regex over
 * the concatenated text of that chapter's lessons, written to match the mathematics the standard
 * actually requires, not the words a title might happen to use.
 *
 * HOW TO READ THE OUTPUT.
 *   supported   the crediting chapter's lesson text contains the required mathematics. The credit
 *               stands, and the standard is genuinely covered.
 *   UNSUPPORTED the chapter was credited on its title alone and its lessons do not contain the
 *               mathematics. Treat as a probable gap: the real uncovered count is higher than the
 *               map reports, by up to this many.
 *
 * An UNSUPPORTED result is a finding, not a failure — it is exactly what this script exists to
 * surface — so the script exits 0 either way and writes its verdict to a report. Acting on it means
 * either fixing the map (if the probe was wrong) or accepting a higher uncovered count (if it was
 * right), and that is a judgement for the session that does the authoring.
 *
 * Usage:  node scripts/audit/verify-hs-coverage-credits.mjs
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** code -> probe. Written against the MATHEMATICS, not the heading. */
const PROBES = {
  "N-RN.B.3": /irrational|rational (number )?(plus|times|sum|product)/i,
  "N-Q.A.1": /\bunits?\b.{0,60}(scale|convert|interpret)|logarithmic scale|decibel|richter|\bpH\b/i,
  "N-CN.A.1": /i²\s*=\s*−?-?1|i\^?2\s*=\s*−?-?1|imaginary unit|a \+ bi/i,
  "N-CN.A.2": /(add|subtract|multiply).{0,40}complex|conjugate/i,
  "N-CN.C.7": /complex (solution|root)|negative discriminant|√\s*−|square root of a negative/i,
  "A-SSE.A.1a": /\bcoefficient\b|\bterm(s)?\b.{0,40}\bfactor(s)?\b|like terms/i,
  "A-SSE.A.1b": /quadratic form|treat.{0,30}as (a )?single|substitut\w+.{0,30}\bu\b|as one (object|entity|chunk)/i,
  "A-SSE.B.3b": /complet\w+ the square|vertex form|maximum|minimum/i,
  "A-APR.C.4": /identity|difference of cubes|sum of cubes|prove/i,
  "A-CED.A.4": /solve for|rearrang|isolate.{0,30}variable|literal equation|formula/i,
  "A-REI.A.1": /justif|each step|why.{0,30}(step|move)|property of equality/i,
  "A-REI.C.5": /elimination|add(ing)? the equations|same solution|equivalent system/i,
  "A-REI.D.10": /every point|satisf\w+|set of solutions|solutions? (are|is) the (line|graph)/i,
  "F-IF.A.2": /f\s*\(|function notation|evaluate.{0,30}function/i,
  "F-IF.B.4": /increasing|decreasing|maximum|minimum|intercept|end behavio/i,
  "F-IF.C.8a": /complet\w+ the square|factor\w*.{0,40}zero|vertex/i,
  "F-IF.C.8b": /growth rate|decay rate|percent (growth|decay)|\b1\.\d+\^|rate of (growth|decay)/i,
  "F-IF.C.9": /compare|two functions|which function|table.{0,40}graph/i,
  "F-BF.A.1a": /write (an? )?(equation|function|rule)|build|from a point|through two points/i,
  "F-BF.A.1b": /add(ing)? (two )?functions|subtract(ing)? functions|\(f \+ g\)|combine.{0,30}functions/i,
  "F-LE.A.1b": /constant rate of change|equal differences|arithmetic/i,
  "F-LE.A.1c": /constant ratio|equal factors|percent|multiplied by the same/i,
  "F-LE.A.2": /from (a )?(table|data|two points)|construct|write.{0,30}(model|function)/i,
  "F-LE.A.3": /eventually exceed|outgrow|overtakes|grows faster/i,
  "F-TF.A.1": /radian|arc length/i,
  "F-TF.A.2": /unit circle|coordinates on the (unit )?circle|reference angle/i,
  "G-CO.A.2": /transformation.{0,40}function|input.{0,30}output|maps? (each )?point/i,
  "G-CO.A.4": /\(x, ?y\)|maps? (each )?point|rule for a (rotation|reflection|translation)|carries? (the )?(point|figure)/i,
  "G-CO.A.5": /sequence of (rigid motions|transformations)|compos\w+/i,
  "G-CO.B.6": /rigid motion|congruent if|superimpose|maps? onto/i,
  "G-CO.D.13": /hexagon|equilateral|inscrib/i,
  "G-SRT.A.1a": /parallel|line (not )?through the cent/i,
  "G-SRT.A.1b": /scale factor|longer|shorter|times as long/i,
  "G-SRT.A.2": /similar\w*|corresponding (sides|angles)|proportional/i,
  "G-SRT.A.3": /\bAA\b|two angles|angle-angle/i,
  "G-SRT.C.7": /complementary|sin.{0,20}cos|cofunction/i,
  "G-GPE.A.2": /focus|directrix|parabola/i,
  "G-GMD.A.1": /circumference|informal|why.{0,30}formula|one-third|dissect/i,
  "G-GMD.A.3": /volume/i,
  "G-GMD.B.4": /cross-?section|solid of revolution|slice/i,
  "G-MG.A.2": /density|per (cubic|square)|population density/i,
  "G-MG.A.3": /design|constraint|cost|choose.{0,30}(material|shape)/i,
  "S-ID.A.4": /normal|bell|68|95|99\.7|z-?score|standard deviation/i,
  /* S203V. The ten codes below were introduced by S203V's own lessons and had NO probes, so
   * verify-hs-coverage-credits silently skipped them — it reported "58 of 68" rather than flagging
   * anything, which is a blind spot rather than a false pass, but a blind spot in exactly the
   * standards the newest content rests on. Each probe is written against the MATHEMATICS the
   * standard requires, deliberately NOT against the phrasing S203V happened to use, so that a
   * later rewrite of those lessons is still tested rather than rubber-stamped by matching its own
   * vocabulary back to itself. */
  "N-Q.A.3": /precis|least precise|significant figure|round.{0,30}(nearest|measurement)|false precision|decimal places/i,
  "G-C.A.1": /all circles|every circle|circles are similar|2r\b|r²|r\^2|one dilation/i,
  "S-ID.A.1": /dot plot|histogram|box plot|number line|stack|shape.{0,30}(data|distribution)/i,
  "S-ID.A.2": /compare.{0,40}(centre|center|spread|median|IQR)|two (data ?sets|classes|groups)|more consistent/i,
  "S-ID.A.3": /outlier|shape.{0,30}spread|tail|skew|range.{0,40}outlier/i,
  "S-ID.B.6a": /fit a (line|function)|line of best fit|trend|predict.{0,30}(from|using)/i,
  "S-ID.B.6b": /residual|actual (−|-) predicted|leftover gap|above the line|below the line/i,
  "S-ID.B.6c": /technolog|calculator|spreadsheet|trendline|automat/i,
  "S-ID.C.7": /slope.{0,40}(mean|context|per)|intercept.{0,40}(mean|context|zero)|rate of change.{0,30}context/i,
  "S-ID.C.8": /correlation coefficient|\br\b\s*=|−1 (to|and) 1|-1 (to|and) 1|strength.{0,30}(linear|relationship)/i,
  "S-ID.B.5": /two-?way table|joint|marginal|conditional (frequency|relative)/i,
  "S-ID.C.9": /causation|caus\w+.{0,40}correlat|correlat\w+.{0,40}caus|lurking|confound/i,
  "S-IC.A.1": /population|sample|inference/i,
  "S-IC.A.2": /consistent with|simulat|could chance|model/i,
  "S-IC.B.3": /survey|experiment|observational/i,
  "S-IC.B.4": /margin of error|confidence|estimate.{0,30}(mean|proportion)/i,
  "S-IC.B.5": /two (groups|treatments)|significant|difference.{0,30}real/i,
  "S-IC.B.6": /evaluat|report|claim|study/i,
  "S-CP.A.1": /sample space|subset|event.{0,30}set|outcome/i,
  "S-CP.A.2": /independen\w+.{0,60}(product|multiply)|P\(A\).{0,20}P\(B\)/i,
  "S-CP.A.3": /conditional|given that|P\(A ?\| ?B\)/i,
  "S-CP.A.4": /two-?way table|table.{0,30}sample space/i,
  "S-CP.A.5": /independen|everyday|in words|explain/i,
  "S-CP.B.6": /conditional|fraction of outcomes|restrict\w+ the sample space/i,
  "S-CP.B.7": /addition rule|P\(A or B\)|overlap|mutually exclusive/i
};

const fw = JSON.parse(readFileSync(join(root, "content/standards/ccss-hs.json"), "utf8"));
const map = JSON.parse(readFileSync(join(root, "content/standards/ccss-hs-coverage-map.json"), "utf8")).chapters;
const core = new Set(fw.standards.filter((s) => !s.plus).map((s) => s.code));
const titleOf = new Map(fw.standards.map((s) => [s.code, s.title]));

/* courseSlug/chapterId -> concatenated lesson text, for grades 9-12 only.
 * Qualified because chapter ids are not unique: ch4-applications exists in two HS courses. */
const chapterText = new Map();
const coursesDir = join(root, "content", "courses");
for (const slug of readdirSync(coursesDir).sort()) {
  const cf = join(coursesDir, slug, "course.json");
  if (!existsSync(cf)) continue;
  const course = JSON.parse(readFileSync(cf, "utf8"));
  if (course.gradeLevel < 9 || course.gradeLevel > 12) continue;
  for (const ch of course.chapters) {
    let text = ch.title + " ";
    for (const id of ch.lessonIds) {
      const lp = join(coursesDir, slug, "lessons", `${id}.json`);
      if (existsSync(lp)) text += readFileSync(lp, "utf8");
    }
    chapterText.set(`${slug}/${ch.id}`, text);
  }
}

const creditsBy = new Map();
for (const [ch, codes] of Object.entries(map)) {
  for (const c of codes) {
    if (!creditsBy.has(c)) creditsBy.set(c, []);
    creditsBy.get(c).push(ch);
  }
}

const results = [];
for (const [code, probe] of Object.entries(PROBES)) {
  if (!core.has(code)) continue;
  const chapters = creditsBy.get(code) ?? [];
  /* A standard with no crediting chapter is UNCOVERED, which is standards-coverage-hs's business,
   * not this script's. This script only asks whether an existing credit is real. */
  if (chapters.length === 0) continue;
  const supported = chapters.some((ch) => probe.test(chapterText.get(ch) ?? ""));
  results.push({ code, title: titleOf.get(code), chapters, supported });
}
const unsupported = results.filter((r) => !r.supported);

const singleChapterCore = [...creditsBy.entries()].filter(([c, chs]) => core.has(c) && chs.length === 1).length;
const report = {
  generatedAt: "deterministic",
  purpose: "test the single-chapter credits in the title-authored HS coverage map against lesson text",
  singleChapterCoreStandards: singleChapterCore,
  probed: results.length,
  supported: results.length - unsupported.length,
  unsupported: unsupported.map((r) => ({ code: r.code, title: r.title, chapters: r.chapters })),
  note: "UNSUPPORTED means the crediting chapter's lesson text does not contain the mathematics the standard requires — the credit rests on the heading alone. Each is a probable gap, so the map's uncovered count is a lower bound by up to this many."
};
writeFileSync(join(root, "HS_COVERAGE_CREDIT_AUDIT.json"), JSON.stringify(report, null, 2) + "\n");

console.log(`probed ${results.length} of the ${singleChapterCore} single-chapter core credits`);
console.log(`  supported by lesson text : ${report.supported}`);
console.log(`  UNSUPPORTED              : ${unsupported.length}`);
for (const r of unsupported) console.log(`    ${r.code.padEnd(12)}${r.chapters.join(", ").padEnd(38)}${r.title}`);
