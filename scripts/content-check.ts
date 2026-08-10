/* Runs as: tsx scripts/content-check.ts schema | pedagogy */
import { readdirSync, readFileSync, existsSync } from "fs";
import path from "path";
import { Course, DailyCategoryFile, Lesson, type TLesson } from "../src/lib/schema";
import { lintDailyProblem, lintLesson } from "../src/lib/pedagogy";

const mode = process.argv[2];
if (mode !== "schema" && mode !== "pedagogy") {
  console.error("usage: content-check.ts <schema|pedagogy>");
  process.exit(2);
}

const ROOT = path.join(process.cwd(), "content", "courses");
let files = 0;
let failures = 0;

function fail(file: string, msgs: string[]) {
  failures++;
  console.error(`✗ ${file}`);
  for (const m of msgs) console.error(`    ${m}`);
}

function ok(file: string) {
  console.log(`✓ ${file}`);
}

for (const courseDir of readdirSync(ROOT)) {
  const base = path.join(ROOT, courseDir);

  const coursePath = path.join(base, "course.json");
  const lessonsDir = path.join(base, "lessons");
  const lessonFiles = existsSync(lessonsDir)
    ? readdirSync(lessonsDir).filter((f) => f.endsWith(".json"))
    : [];

  // Parse lessons
  const lessons: TLesson[] = [];
  for (const f of lessonFiles) {
    files++;
    const rel = path.relative(process.cwd(), path.join(lessonsDir, f));
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(path.join(lessonsDir, f), "utf8"));
    } catch (e) {
      fail(rel, [`invalid JSON: ${String(e)}`]);
      continue;
    }
    const parsed = Lesson.safeParse(data);
    if (!parsed.success) {
      if (mode === "schema") {
        fail(rel, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
      }
      continue;
    }
    lessons.push(parsed.data);
    if (mode === "schema") ok(rel);
    if (mode === "pedagogy") {
      const errs = lintLesson(parsed.data);
      if (errs.length) fail(rel, errs);
      else ok(rel);
    }
  }

  // Parse course + cross-check lesson ids (schema mode)
  if (mode === "schema" && existsSync(coursePath)) {
    files++;
    const rel = path.relative(process.cwd(), coursePath);
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(coursePath, "utf8"));
    } catch (e) {
      fail(rel, [`invalid JSON: ${String(e)}`]);
      continue;
    }
    const parsed = Course.safeParse(data);
    if (!parsed.success) {
      fail(rel, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
      continue;
    }
    const known = new Set(lessons.map((l) => l.id));
    const missing = parsed.data.chapters.flatMap((c) => c.lessonIds.filter((id) => !known.has(id)));
    if (missing.length) fail(rel, missing.map((m) => `chapter references missing lesson: ${m}`));
    else ok(rel);
  }
}

/* ---------------- Daily Challenge files ---------------- */
const DAILY = path.join(process.cwd(), "content", "daily");
if (existsSync(DAILY)) {
  for (const f of readdirSync(DAILY).filter((x) => x.endsWith(".json"))) {
    files++;
    const rel = path.relative(process.cwd(), path.join(DAILY, f));
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(path.join(DAILY, f), "utf8"));
    } catch (e) {
      fail(rel, [`invalid JSON: ${String(e)}`]);
      continue;
    }
    const res = DailyCategoryFile.safeParse(data);
    if (mode === "schema") {
      if (!res.success) {
        fail(rel, res.error.issues.slice(0, 6).map((i) => `${i.path.join(".")}: ${i.message}`));
        continue;
      }
      const days = new Set(res.data.problems.map((p) => p.day));
      if (days.size !== 30) {
        fail(rel, ["problems must cover days 1-30 exactly once"]);
        continue;
      }
      ok(rel);
    } else {
      if (!res.success) {
        fail(rel, ["schema-invalid (run validate:content)"]);
        continue;
      }
      const errs = res.data.problems.flatMap((p) => lintDailyProblem(p, rel));
      if (errs.length > 0) fail(rel, errs.slice(0, 10));
      else ok(rel);
    }
  }
}

console.log(`\n${mode}: ${files - failures}/${files} files clean`);
process.exit(failures ? 1 : 0);
