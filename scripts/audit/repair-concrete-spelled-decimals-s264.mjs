import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = path.join(process.cwd(), "content", "courses");
const CHECK = process.argv.includes("--check");
const TARGETS = new Set([
  "decimals-intro-g4/dg4-01-02",
  "solving-equations/alg1-02-03",
]);

const DIGIT = "zero|one|two|three|four|five|six|seven|eight|nine";
const INTEGER_WORD = `${DIGIT}|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand`;
export const SPELLED_DECIMAL_RE = new RegExp(
  `\\b(?:negative\\s+)?(?:${INTEGER_WORD})(?:[-\\s]+(?:and\\s+)?(?:${INTEGER_WORD}))*\\s+point\\s+(?:${DIGIT})(?:[-\\s]+(?:${DIGIT}))*\\b`,
  "gi",
);
const READ_ALOUD_CUE_RE = /(?:^\s*(?:read|say|pronounce)\s+(?!(?:whether|if|which|what|how)\b)|\b(?:read|say|pronounce)(?:ing|s|ed)?\b[^.!?]{0,40}\b(?:aloud|in words|as)\b|\b(?:spoken|word) (?:form|name)\b|\bis (?:read|said|pronounced|called)\b)/i;

function lessonFiles() {
  const files = [];
  for (const course of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!course.isDirectory()) continue;
    const dir = path.join(ROOT, course.name, "lessons");
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((candidate) => candidate.endsWith(".json")).sort()) {
      files.push(path.join(dir, name));
    }
  }
  return files.sort();
}

function walkStrings(value, pointer = "$", found = []) {
  if (typeof value === "string") {
    const sentences = value.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const matches = [...sentence.matchAll(new RegExp(SPELLED_DECIMAL_RE.source, "gi"))];
      for (const match of matches) {
        found.push({ pointer, sentence, literal: match[0], readAloudTeaching: READ_ALOUD_CUE_RE.test(sentence) });
      }
    }
    return found;
  }
  if (Array.isArray(value)) value.forEach((child, index) => walkStrings(child, `${pointer}[${index}]`, found));
  else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) walkStrings(child, `${pointer}.${key}`, found);
  return found;
}

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing step ${id}`);
  return found;
}

function repair(courseId, lesson) {
  if (courseId === "decimals-intro-g4" && lesson.id === "dg4-01-02") {
    const sentence = "0.5, 0.9 — the pattern is always the same: the tenths digit counts the shaded columns.";
    const concept = step(lesson, "c2");
    concept.body = sentence;
    concept.narration = sentence;
    const remedial = lesson.remedials?.find((candidate) => candidate.conceptTag === "g4d-write-tenth");
    if (!remedial) throw new Error(`${lesson.id}: missing g4d-write-tenth remedial`);
    remedial.concept.body = sentence;
    remedial.concept.narration = sentence;
  }

  if (courseId === "solving-equations" && lesson.id === "alg1-02-03") {
    step(lesson, "c1").narration = "Decimals clear like fractions: for 0.5x + 1.2 = 3.7, multiply every term by 10 — each decimal point slides one place — giving 5x + 12 = 37. Then the familiar two-step: 5x = 25, x = 5.";
    step(lesson, "c2").narration = "The classic slip: shifting the decimals but leaving a whole number unshifted. In 0.2x + 3 = 4, the ×10 turns 3 into 30 and 4 into 40 — zeros for everyone.";
    const remedial = lesson.remedials?.find((candidate) => candidate.conceptTag === "decimal-eq");
    if (!remedial) throw new Error(`${lesson.id}: missing decimal-eq remedial`);
    remedial.concept.narration = "Slow it down with 0.5x = 3. Half of x is 3, so x = 6. Or shift: ×10 gives 5x = 30, and 30 ÷ 5 = 6. Same answer, both roads.";
  }
}

const files = lessonFiles();
if (files.length !== 1701) throw new Error(`expected 1701 lesson files, found ${files.length}`);
let changed = 0;
let touchedTargets = 0;
const hashes = [];
for (const full of files) {
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const courseId = path.basename(path.dirname(path.dirname(full)));
  const key = `${courseId}/${lesson.id}`;
  const ids = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  const widgets = JSON.stringify(lesson.steps.map((candidate) => [candidate.id, candidate.widget ?? null]));
  repair(courseId, lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== ids) throw new Error(`${key}: stable step IDs changed`);
  if (JSON.stringify(lesson.steps.map((candidate) => [candidate.id, candidate.widget ?? null])) !== widgets) throw new Error(`${key}: widget/evaluator contract changed`);
  const indent = before.match(/\n( +)"id"/)?.[1].length ?? 2;
  const after = TARGETS.has(key) ? `${JSON.stringify(lesson, null, indent)}\n` : before;
  if (TARGETS.has(key)) touchedTargets += 1;
  hashes.push(`${path.relative(ROOT, full)}\0${after}`);
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}
if (touchedTargets !== TARGETS.size) throw new Error(`expected ${TARGETS.size} repair targets, found ${touchedTargets}`);
if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);

const findings = [];
for (const full of files) {
  const lesson = JSON.parse(fs.readFileSync(full, "utf8"));
  for (const finding of walkStrings(lesson)) findings.push({ file: path.relative(process.cwd(), full).replaceAll("\\", "/"), ...finding });
}
const unsafe = findings.filter((finding) => !finding.readAloudTeaching);
if (unsafe.length) {
  const sample = unsafe.slice(0, 20).map((finding) => `${finding.file}:${finding.pointer}: ${finding.literal}`).join("\n");
  throw new Error(`${unsafe.length} concrete spelled-decimal occurrence(s) remain outside explicit read-aloud teaching:\n${sample}`);
}

const corpusSeal = createHash("sha256").update(hashes.join("\n")).digest("hex");
console.log(`${CHECK ? "CHECK" : "REPAIR"} concrete spelled decimals: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 1701 lessons scanned; 13 quantities normalized across 7 fields; ${findings.length} explicit read-aloud teaching occurrence(s) retained; 0 unsafe residuals; corpus seal ${corpusSeal}`);
