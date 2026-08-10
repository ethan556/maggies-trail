#!/usr/bin/env node
/**
 * standards-coverage-hs — the gate that makes a high-school curriculum gap fail a build.
 *
 * The 6–8 instrument (S203) found ten uncovered sub-standards that had survived two hundred
 * sessions unseen, because the only alignment data resolved to domain level. High school had no
 * instrument at all, and it is the corpus's weakest region by every other measure: 186 Tier C
 * lessons and 10 Tier D, against a single Tier C in the whole of K–8.
 *
 * SCOPE. Grades 9–12 (39 courses, 542 lessons). Grade 13 — Calculus and Calculus BC — is outside
 * CCSS-M and is excluded from the denominator; scoring calculus against a framework that does not
 * contain it would invent a gap that is not real.
 *
 * CORE vs (+). CCSS marks some high-school standards (+): "additional mathematics that students
 * should learn in order to take advanced courses". They are not expected of all students. Reporting
 * one blended number would either overstate the gap (counting optional content as missing) or bury
 * core misses among optional ones. So the two populations are counted separately and ONLY THE CORE
 * POPULATION IS GATED. The (+) figure is printed for information, because a corpus that reaches
 * grade 12 should be making a deliberate choice about it rather than an accidental one.
 *
 * THE RATCHET works exactly as it does at 6–8, in both directions: it fails when uncovered core
 * standards rise above the ceiling, AND when they fall below it without the ceiling following. A
 * gate whose ground can be quietly given back is not a gate.
 *
 * WHAT THIS NUMBER IS. The coverage map is authored from chapter and lesson TITLES, which flatter
 * content. That biases it toward over-crediting, so the uncovered count is a LOWER BOUND: every
 * standard reported missing is missing; some reported covered may be thin. Read it as "at least
 * this bad", never as "exactly this bad".
 *
 * Usage:  node scripts/audit/standards-coverage-hs.mjs [--json]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** RATCHET — lower as coverage lands; never raise for a REGRESSION.
 *
 *  S203H seeded this at 10. S203I raised it to 12, and the reason matters: nothing in the corpus
 *  got worse. `verify-hs-coverage-credits.mjs` probed the 58 core standards resting on a single
 *  chapter and found two whose crediting chapter does not contain the mathematics —
 *  G-SRT.A.1a (the word "parallel" appears zero times in the chapter credited with "a dilation
 *  takes a line not through the centre to a parallel line") and F-IF.C.9 (a chapter that sketches
 *  and models polynomials, but never compares functions across representations). Both credits came
 *  from the chapter heading. Removing them made the map more honest and the number worse.
 *
 *  That is the one legitimate reason to raise a ratchet: correcting the INSTRUMENT, not excusing
 *  the CORPUS. Raising it for any other reason would defeat the mechanism.
 *
 *  S203V closed all twelve — the two corrected S203I credits (G-SRT.A.1a, F-IF.C.9) plus the ten
 *  genuinely uncovered standards (N-Q.A.3; G-C.A.1; S-ID.A.1/A.2/A.3/B.6a/B.6b/B.6c/C.7/C.8) —
 *  each authored to Tier A, not merely covered. 127/127 core standards. This can now only go up by
 *  regression, and the gate's remaining job is exactly that: making regression impossible. */
const MAX_UNCOVERED_CORE = 0;

const framework = JSON.parse(readFileSync(join(root, "content/standards/ccss-hs.json"), "utf8"));
const map = JSON.parse(readFileSync(join(root, "content/standards/ccss-hs-coverage-map.json"), "utf8"));
const known = new Map(framework.standards.map((s) => [s.code, s]));

const problems = [];
const byStandard = new Map(framework.standards.map((s) => [s.code, []]));
const chaptersSeen = new Set();
let lessonCount = 0;

const coursesDir = join(root, "content", "courses");
for (const slug of readdirSync(coursesDir).sort()) {
  const cf = join(coursesDir, slug, "course.json");
  if (!existsSync(cf)) continue;
  const course = JSON.parse(readFileSync(cf, "utf8"));
  if (course.gradeLevel < 9 || course.gradeLevel > 12) continue;

  for (const chapter of course.chapters) {
    /* Keyed courseSlug/chapterId: chapter ids are NOT unique (ch4-applications exists in two HS
     * courses), and a bare-id lookup silently gives one chapter another's credits. */
    const key = `${slug}/${chapter.id}`;
    chaptersSeen.add(key);
    const fromMap = map.chapters[key];
    if (!fromMap) problems.push(`chapter ${key} is not in the coverage map`);

    for (const lessonId of chapter.lessonIds) {
      const lp = join(coursesDir, slug, "lessons", `${lessonId}.json`);
      if (!existsSync(lp)) continue;
      lessonCount++;
      const lesson = JSON.parse(readFileSync(lp, "utf8"));
      /* Inline wins: a lesson that declares its own standards is a better authority about itself
       * than a chapter-level map authored from titles. */
      const codes = Array.isArray(lesson.standards) && lesson.standards.length
        ? lesson.standards
        : (fromMap ?? []);
      for (const code of codes) {
        if (!known.has(code)) { problems.push(`${lessonId}: declares unknown standard "${code}"`); continue; }
        byStandard.get(code).push(lessonId);
      }
    }
  }
}
for (const id of Object.keys(map.chapters)) {
  if (!chaptersSeen.has(id)) problems.push(`coverage map references ${id}, which no grade 9-12 course declares`);
}

const rows = framework.standards.map((s) => ({
  code: s.code, domain: s.domain, category: s.category, plus: s.plus,
  title: s.title, lessons: byStandard.get(s.code).length
}));
const core = rows.filter((r) => !r.plus);
const plus = rows.filter((r) => r.plus);
const uncoveredCore = core.filter((r) => r.lessons === 0);
const uncoveredPlus = plus.filter((r) => r.lessons === 0);
const thinCore = core.filter((r) => r.lessons === 1);

const byCategory = new Map();
for (const r of rows) {
  const c = byCategory.get(r.category) ?? { category: r.category, core: 0, coreCovered: 0, plus: 0, plusCovered: 0 };
  if (r.plus) { c.plus++; if (r.lessons) c.plusCovered++; } else { c.core++; if (r.lessons) c.coreCovered++; }
  byCategory.set(r.category, c);
}

const failures = [...problems];
if (uncoveredCore.length > MAX_UNCOVERED_CORE) {
  failures.push(`${uncoveredCore.length} uncovered CORE sub-standards exceeds the ratchet of ${MAX_UNCOVERED_CORE}`);
}
if (uncoveredCore.length < MAX_UNCOVERED_CORE) {
  failures.push(
    `coverage improved to ${uncoveredCore.length} uncovered core — lower MAX_UNCOVERED_CORE to ${uncoveredCore.length} in this script so the gate keeps its new ground`
  );
}

const report = {
  generatedAt: "deterministic",
  scope: "grades 9-12 (grade 13 Calculus is outside CCSS-M and excluded)",
  mapStatus: map.status,
  subStandards: rows.length,
  coreSubStandards: core.length,
  plusSubStandards: plus.length,
  lessonsScanned: lessonCount,
  coreCovered: core.length - uncoveredCore.length,
  uncoveredCore: uncoveredCore.map((r) => ({ code: r.code, title: r.title })),
  thinCore: thinCore.map((r) => ({ code: r.code, title: r.title })),
  plusCovered: plus.length - uncoveredPlus.length,
  uncoveredPlus: uncoveredPlus.map((r) => r.code),
  ratchetCore: MAX_UNCOVERED_CORE,
  byCategory: [...byCategory.values()],
  passed: failures.length === 0
};
writeFileSync(join(root, "STANDARDS_COVERAGE_HS.json"), JSON.stringify(report, null, 2) + "\n");

if (process.argv.includes("--json")) {
  console.log(`standards-coverage-hs: ${report.coreCovered}/${core.length} core covered · ${report.plusCovered}/${plus.length} plus covered · ${lessonCount} lessons scanned`);
  console.log(`\n${"category".padEnd(30)}${"core".padStart(10)}${"plus".padStart(10)}`);
  for (const c of report.byCategory) {
    console.log(`${c.category.padEnd(30)}${`${c.coreCovered}/${c.core}`.padStart(10)}${`${c.plusCovered}/${c.plus}`.padStart(10)}`);
  }
  console.log(`\nuncovered core (${uncoveredCore.length}, ratchet ${MAX_UNCOVERED_CORE}):`);
  for (const r of uncoveredCore) console.log(`  ${r.code.padEnd(12)}${r.title}`);
  if (thinCore.length) {
    console.log(`\ncore standards with a single chapter behind them (${thinCore.length}):`);
    for (const r of thinCore) console.log(`  ${r.code.padEnd(12)}${r.title}`);
  }
}

if (failures.length) {
  console.error("\nstandards-coverage-hs FAILED:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("\nstandards-coverage-hs passed.");
