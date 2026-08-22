/**
 * K–5 exact question-visual support audit.
 *
 * A picture earns its place when it is the learner's data: a keyed pictograph
 * row, an explicit fractional symbol, or another stated model. Decorative art
 * is not a substitute. This first fail-closed family targets keyed pictograph
 * questions, where a learner must otherwise imagine the marks the prompt names.
 *
 * `--check` is read-only and exits non-zero for a qualifying text-only prompt.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const courses = join(root, "content", "courses");
const figuresSource = readFileSync(join(root, "src", "components", "figureIds.ts"), "utf8");
const figureIds = new Set([...figuresSource.matchAll(/"([^"]+)"/g)].map((match) => match[1]));

function eligibleGrade(value) {
  return value === "K" || value === "k" || (typeof value === "number" && value >= 0 && value <= 5);
}

function visualPictographPrompt(prompt, widgetType) {
  if (!/[⭐🍎🍏📕]|\b(?:star|apple|book|symbol|pictograph)s?\b/i.test(prompt)) return false;
  // A literal key plus an "each" relationship identifies a scaled pictograph
  // row. Loose words such as "each" or "symbol" occur in many unrelated K–5
  // questions and must not manufacture a visual requirement.
  if (!/\bkey(?:\s+says)?(?:\s*:)?\s+each\b/i.test(prompt)) return false;
  if (!/\b(?:row|full|half|symbol|star|apple|book)s?\b/i.test(prompt)) return false;
  // Match pairs and direct-manipulation widgets already render the named marks
  // inside the question. A numeric or MCQ prompt does not.
  return widgetType === "numeric" || widgetType === "mcq";
}

function surfaces(lesson) {
  const direct = lesson.steps.map((step) => ({ step, path: `steps.${step.id}` }));
  const remedials = (lesson.remedials ?? []).flatMap((remedial) => [
    { step: remedial.concept, path: `remedials.${remedial.concept.id}` },
    { step: remedial.check, path: `remedials.${remedial.check.id}` }
  ]);
  return [...direct, ...remedials];
}

const findings = [];
for (const courseEntry of readdirSync(courses, { withFileTypes: true })) {
  if (!courseEntry.isDirectory()) continue;
  const courseDir = join(courses, courseEntry.name);
  const course = JSON.parse(readFileSync(join(courseDir, "course.json"), "utf8"));
  if (!eligibleGrade(course.gradeLevel)) continue;
  const lessonDir = join(courseDir, "lessons");
  for (const entry of readdirSync(lessonDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const lesson = JSON.parse(readFileSync(join(lessonDir, entry.name), "utf8"));
    for (const { step, path } of surfaces(lesson)) {
      const widget = step?.widget;
      if (!widget || !visualPictographPrompt(widget.prompt ?? "", widget.type)) continue;
      const figure = step.figure;
      const reason = !figure
        ? "MISSING_EXACT_QUESTION_VISUAL"
        : !figureIds.has(figure)
          ? "UNREGISTERED_QUESTION_VISUAL"
          : "SUPPORTED";
      findings.push({
        course: course.id,
        grade: course.gradeLevel,
        lesson: lesson.id,
        path,
        widget: widget.type,
        figure: figure ?? "",
        reason
      });
    }
  }
}

findings.sort((a, b) => `${a.course}/${a.lesson}/${a.path}`.localeCompare(`${b.course}/${b.lesson}/${b.path}`));
const unresolved = findings.filter((finding) => finding.reason !== "SUPPORTED");
const summary = {
  scope: "K–5 keyed pictograph numeric/MCQ prompts whose named marks are the learner data",
  candidateCount: findings.length,
  supportedCount: findings.length - unresolved.length,
  unresolvedCount: unresolved.length,
  findings
};

if (process.argv.includes("--check")) {
  if (unresolved.length) {
    console.error(JSON.stringify(summary, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`CURRENT K–5 question visuals: ${summary.supportedCount}/${summary.candidateCount} exact keyed-pictograph prompts supported.`);
  }
} else {
  console.log(JSON.stringify(summary, null, 2));
}
