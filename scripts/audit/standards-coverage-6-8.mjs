#!/usr/bin/env node
/**
 * standards-coverage-6-8 — the gate that makes a curriculum gap fail a build instead of surviving
 * two hundred sessions unnoticed.
 *
 * WHAT IT MEASURES. Every lettered CCSS sub-standard in grades 6-8 (112 of them), against the
 * lessons that teach it. Coverage comes from two places, merged:
 *
 *   1. `standards: [...]` declared inline in a lesson's own JSON — how NEW lessons should say it;
 *   2. the chapter sidecar `content/standards/ccss-6-8-coverage-map.json` — how the 218 existing
 *      lessons say it, because tagging them inline would mean 218 lesson-JSON byte changes and
 *      every one of those arms the whole-corpus authorization checks (HANDOVER §8).
 *
 * Inline wins where both exist: a lesson that declares its own standards is the better authority
 * about itself than a chapter-level map.
 *
 * WHY A RATCHET, NOT A HARD ZERO. `verify-visual-explanations` states the principle and it holds
 * here: "a gate that fails from the day it is written teaches people to skip it." Ten
 * sub-standards are uncovered today. Failing immediately would mean this script gets commented out
 * within a session. So MAX_UNCOVERED is seeded at today's count and only ever falls: the gate fails
 * the moment a tenth appears, and fails again the moment coverage improves without the ceiling
 * being lowered to match. Both directions are enforced, so the ratchet cannot quietly stop
 * ratcheting.
 *
 * `partial:` entries do NOT count as coverage. A box plot appearing as a supporting figure inside a
 * quartiles lesson is not a lesson on box plots, and the whole point of this gate is to stop that
 * distinction from being blurred.
 *
 * Usage:  node scripts/audit/standards-coverage-6-8.mjs [--json]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** RATCHET — lower as coverage lands; never raise. Uncovered sub-standards allowed to remain. */
const MAX_UNCOVERED = 0;   // S203F: the band is CLOSED — every lettered CCSS sub-standard in grades
                           // 6-8 has at least one lesson authored to teach it. This can only go up
                           // by regression, and the gate now exists to make that impossible.
/** Sub-standards with only ONE lesson behind them. Thin, not absent — tracked, not yet gated. */
const REPORT_THIN_AT = 1;

const catalogue = JSON.parse(readFileSync(join(root, "content/standards/ccss-6-8.json"), "utf8"));
const map = JSON.parse(readFileSync(join(root, "content/standards/ccss-6-8-coverage-map.json"), "utf8"));
const known = new Map(catalogue.standards.map((s) => [s.code, s]));

/* ------------------------------------------------------------------ walk 6-8 */
const coursesDir = join(root, "content/courses");
const lessonsByCode = new Map();
const problems = [];
let lessonCount = 0;
const chaptersSeen = new Set();

for (const courseDir of readdirSync(coursesDir).sort()) {
  const coursePath = join(coursesDir, courseDir, "course.json");
  if (!existsSync(coursePath)) continue;
  const course = JSON.parse(readFileSync(coursePath, "utf8"));
  if (![6, 7, 8].includes(course.gradeLevel)) continue;

  for (const chapter of course.chapters) {
    /* Keyed courseSlug/chapterId. Chapter ids are not unique corpus-wide (four collide today,
     * all outside this band), so a bare-id lookup is a latent silent mis-credit. */
    const chapterKey = `${courseDir}/${chapter.id}`;
    chaptersSeen.add(chapterKey);
    const mapped = map.chapters[chapterKey];
    if (mapped === undefined) {
      // A new chapter that nobody mapped is exactly how a gap gets in. Fail loudly.
      problems.push(`chapter ${chapterKey} is not in the coverage map`);
      continue;
    }

    for (const lessonId of chapter.lessonIds) {
      const lessonPath = join(coursesDir, courseDir, "lessons", `${lessonId}.json`);
      if (!existsSync(lessonPath)) continue;
      lessonCount++;
      const lesson = JSON.parse(readFileSync(lessonPath, "utf8"));

      let codes;
      if (Array.isArray(lesson.standards) && lesson.standards.length > 0) {
        codes = lesson.standards;
        for (const code of codes) {
          if (!known.has(code)) problems.push(`${lessonId}: declares unknown standard "${code}"`);
        }
      } else {
        codes = mapped.filter((c) => !c.startsWith("partial:"));
      }

      for (const code of codes) {
        if (!known.has(code)) continue;
        if (!lessonsByCode.has(code)) lessonsByCode.set(code, []);
        lessonsByCode.get(code).push(lessonId);
      }
    }
  }
}

for (const chapterId of Object.keys(map.chapters)) {
  if (!chaptersSeen.has(chapterId)) problems.push(`coverage map references ${chapterId}, which no 6-8 course declares`);
}

/* -------------------------------------------------------------------- verdict */
const rows = catalogue.standards.map((s) => ({
  code: s.code,
  grade: s.grade,
  domain: s.domain,
  title: s.title,
  lessons: lessonsByCode.get(s.code)?.length ?? 0
}));
const uncovered = rows.filter((r) => r.lessons === 0);
const thin = rows.filter((r) => r.lessons > 0 && r.lessons <= REPORT_THIN_AT);
const incomplete = Object.entries(map.incompleteCoverage ?? {})
  .filter(([code]) => (lessonsByCode.get(code)?.length ?? 0) > 0)
  .map(([code, missing]) => ({ code, missing }));

const byDomain = new Map();
for (const r of rows) {
  const d = byDomain.get(r.domain) ?? { domain: r.domain, total: 0, covered: 0, lessons: 0 };
  d.total++;
  if (r.lessons > 0) d.covered++;
  d.lessons += r.lessons;
  byDomain.set(r.domain, d);
}

const failures = [];
if (problems.length) failures.push(...problems);
if (uncovered.length > MAX_UNCOVERED) {
  failures.push(`${uncovered.length} uncovered sub-standards exceeds the ratchet of ${MAX_UNCOVERED}`);
}
if (uncovered.length < MAX_UNCOVERED) {
  failures.push(
    `coverage improved to ${uncovered.length} uncovered — lower MAX_UNCOVERED to ${uncovered.length} in this script so the gate keeps its new ground`
  );
}

const report = {
  generatedAt: "deterministic",
  grades: [6, 7, 8],
  subStandards: rows.length,
  lessonsScanned: lessonCount,
  covered: rows.length - uncovered.length,
  uncovered: uncovered.map((r) => ({ code: r.code, title: r.title })),
  thin: thin.map((r) => ({ code: r.code, lessons: r.lessons })),
  incomplete,
  ratchet: MAX_UNCOVERED,
  byDomain: [...byDomain.values()].sort((a, b) => a.domain.localeCompare(b.domain)),
  passed: failures.length === 0
};

if (process.argv.includes("--json")) {
  writeFileSync(join(root, "STANDARDS_COVERAGE_6_8.json"), JSON.stringify(report, null, 2) + "\n");
}

console.log(`standards coverage 6-8: ${report.covered}/${rows.length} sub-standards covered by ${lessonCount} lessons`);
for (const d of report.byDomain) {
  const bar = d.covered === d.total ? "" : `  <- ${d.total - d.covered} uncovered`;
  console.log(`  ${d.domain.padEnd(6)} ${String(d.covered).padStart(2)}/${String(d.total).padEnd(2)} covered · ${String(d.lessons).padStart(3)} lesson slots${bar}`);
}
if (uncovered.length) {
  console.log(`\nuncovered (${uncovered.length}, ratchet ${MAX_UNCOVERED}):`);
  for (const r of uncovered) console.log(`  ${r.code.padEnd(11)} ${r.title}`);
}
if (thin.length) {
  console.log(`\nthin — one lesson only (${thin.length}, reported not gated):`);
  for (const r of thin) console.log(`  ${r.code}`);
}
if (incomplete.length) {
  console.log(`\ncovered but incomplete — a named component of the standard is missing (${incomplete.length}, reported not gated):`);
  for (const r of incomplete) console.log(`  ${r.code.padEnd(11)} ${r.missing}`);
}

if (failures.length) {
  console.error("\nstandards-coverage-6-8 FAILED:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("\nstandards-coverage-6-8 passed.");
