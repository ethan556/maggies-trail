// Curriculum inventory (master prompt §6, Stage 1) — measured FROM CONTENT,
// never hand-tallied. Walks every course + lesson and emits
// CURRICULUM_INVENTORY.md: per-band and per-course structure (step-kind mix,
// widget mix, predict coverage, reading load) plus flagged outliers that feed
// the Stage 5 per-course optimization backlog:
//   PASSIVE  — ≥3 consecutive concept screens (interaction-density risk, §10)
//   MCQ      — >60% of graded steps answered by multiple choice (§18)
//   READING  — mean words/step above the band's ceiling (§15)
//   NOLAB    — no interactive (manipulate-first) step in the lesson (§4.1)
// Deterministic: same content in, byte-identical report out (no dates, no
// randomness), so the file diffs meaningfully across sessions.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "content", "courses");
const bandOf = (g) => (g <= 2 ? "K-2" : g <= 5 ? "3-5" : g <= 8 ? "6-8" : "HS");
const READING_CEILING = { "K-2": 22, "3-5": 32, "6-8": 42, HS: 55 }; // mean words per step

const words = (s) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);

const courses = [];
for (const slug of readdirSync(ROOT).sort()) {
  const course = JSON.parse(readFileSync(join(ROOT, slug, "course.json"), "utf8"));
  const lessonsDir = join(ROOT, slug, "lessons");
  const lessons = [];
  for (const f of readdirSync(lessonsDir).sort()) {
    const l = JSON.parse(readFileSync(join(lessonsDir, f), "utf8"));
    const kinds = { concept: 0, interactive: 0, check: 0, challenge: 0, recap: 0 };
    const widgets = {};
    let predicts = 0;
    let wordTotal = 0;
    let maxConceptStreak = 0;
    let streak = 0;
    for (const s of l.steps) {
      kinds[s.kind] = (kinds[s.kind] ?? 0) + 1;
      wordTotal += words(s.body) + words(s.widget?.prompt);
      if (s.predict) predicts++;
      if (s.widget) widgets[s.widget.type] = (widgets[s.widget.type] ?? 0) + 1;
      streak = s.kind === "concept" ? streak + 1 : 0;
      if (streak > maxConceptStreak) maxConceptStreak = streak;
    }
    const graded = kinds.check + kinds.challenge;
    const mcqGraded = l.steps.filter(
      (s) => (s.kind === "check" || s.kind === "challenge") && s.widget?.type === "mcq"
    ).length;
    lessons.push({
      id: l.id,
      steps: l.steps.length,
      kinds,
      widgets,
      predicts,
      meanWords: l.steps.length ? wordTotal / l.steps.length : 0,
      maxConceptStreak,
      mcqShare: graded ? mcqGraded / graded : 0,
      hasLab: kinds.interactive > 0
    });
  }
  courses.push({ slug, title: course.title, grade: course.gradeLevel, band: bandOf(course.gradeLevel), lessons });
}

const bands = {};
for (const c of courses) (bands[c.band] ??= []).push(c);

const pct = (n) => `${Math.round(n * 100)}%`;
const lines = [];
lines.push("# Curriculum Inventory (generated — do not hand-edit)");
lines.push("");
lines.push("Regenerate with `npm run gen:inventory`. Flags: PASSIVE = ≥3 consecutive concept");
lines.push("screens · MCQ = >60% of graded steps are multiple choice · READING = mean");
lines.push("words/step above the band ceiling · NOLAB = no interactive step.");
lines.push("");

const totals = { courses: 0, lessons: 0, steps: 0, predicts: 0, flags: { PASSIVE: 0, MCQ: 0, READING: 0, NOLAB: 0 } };
for (const band of ["K-2", "3-5", "6-8", "HS"]) {
  const cs = bands[band] ?? [];
  lines.push(`## Band ${band} — ${cs.length} courses`);
  lines.push("");
  lines.push("| Course (grade) | Lessons | Steps | Interactive | Graded | Predict lessons | Distinct engines | Flags |");
  lines.push("| --- | --: | --: | --: | --: | --: | --: | --- |");
  for (const c of cs) {
    const L = c.lessons;
    const steps = L.reduce((a, l) => a + l.steps, 0);
    const inter = L.reduce((a, l) => a + l.kinds.interactive, 0);
    const graded = L.reduce((a, l) => a + l.kinds.check + l.kinds.challenge, 0);
    const predictLessons = L.filter((l) => l.predicts > 0).length;
    const engines = new Set(L.flatMap((l) => Object.keys(l.widgets)));
    const flags = [];
    const ceil = READING_CEILING[band];
    const passive = L.filter((l) => l.maxConceptStreak >= 3);
    const mcqHeavy = L.filter((l) => l.mcqShare > 0.6);
    const readingHeavy = L.filter((l) => l.meanWords > ceil);
    const noLab = L.filter((l) => !l.hasLab);
    if (passive.length) flags.push(`PASSIVE×${passive.length} (${passive.slice(0, 3).map((l) => l.id).join(", ")}${passive.length > 3 ? ", …" : ""})`);
    if (mcqHeavy.length) flags.push(`MCQ×${mcqHeavy.length} (${mcqHeavy.slice(0, 3).map((l) => l.id).join(", ")}${mcqHeavy.length > 3 ? ", …" : ""})`);
    if (readingHeavy.length) flags.push(`READING×${readingHeavy.length} (${readingHeavy.slice(0, 3).map((l) => l.id).join(", ")}${readingHeavy.length > 3 ? ", …" : ""})`);
    if (noLab.length) flags.push(`NOLAB×${noLab.length} (${noLab.slice(0, 3).map((l) => l.id).join(", ")}${noLab.length > 3 ? ", …" : ""})`);
    totals.courses++;
    totals.lessons += L.length;
    totals.steps += steps;
    totals.predicts += predictLessons;
    totals.flags.PASSIVE += passive.length;
    totals.flags.MCQ += mcqHeavy.length;
    totals.flags.READING += readingHeavy.length;
    totals.flags.NOLAB += noLab.length;
    lines.push(
      `| ${c.title} (${c.grade}) | ${L.length} | ${steps} | ${inter} | ${graded} | ${predictLessons} (${pct(predictLessons / L.length)}) | ${engines.size} | ${flags.join("; ") || "—"} |`
    );
  }
  lines.push("");
}

lines.push("## Totals");
lines.push("");
lines.push(`- ${totals.courses} courses · ${totals.lessons} lessons · ${totals.steps} steps`);
lines.push(`- Lessons with a prediction cycle: ${totals.predicts} (${pct(totals.predicts / totals.lessons)})`);
lines.push(
  `- Flags: PASSIVE ${totals.flags.PASSIVE} · MCQ-heavy ${totals.flags.MCQ} · READING-heavy ${totals.flags.READING} · NOLAB ${totals.flags.NOLAB} (of ${totals.lessons} lessons)`
);
lines.push("");
lines.push("Flagged lessons are the Stage 5 backlog, ordered PASSIVE → NOLAB → MCQ → READING");
lines.push("within the flagship areas ranked in FLAGSHIP.md.");
lines.push("");

writeFileSync("CURRICULUM_INVENTORY.md", lines.join("\n"));
console.log(
  `inventory: ${totals.courses} courses, ${totals.lessons} lessons; flags PASSIVE=${totals.flags.PASSIVE} MCQ=${totals.flags.MCQ} READING=${totals.flags.READING} NOLAB=${totals.flags.NOLAB}`
);
