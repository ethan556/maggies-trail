import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const COURSES_DIR = "content/courses";
const APP_SOURCE_DIRS = ["src/components", "src/lib"];
const VISIBLE_FIELD_NAMES = new Set([
  "alt",
  "ariaLabel",
  "body",
  "description",
  "hint",
  "label",
  "narration",
  "prompt",
  "reveal",
  "successMessage",
  "title",
]);

const DIGIT_WORD = "zero|one|two|three|four|five|six|seven|eight|nine";
const WHOLE_NUMBER_WORD =
  "zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million";
const WHOLE = `(?:negative |minus )?(?:${WHOLE_NUMBER_WORD})(?:[ -](?:${WHOLE_NUMBER_WORD}))*`;
const SPOKEN_DECIMAL = new RegExp(
  `\\b${WHOLE} point (?:${DIGIT_WORD})(?:[ -](?:${DIGIT_WORD}))*\\b`,
  "gi",
);

function visibleField(key) {
  return VISIBLE_FIELD_NAMES.has(key) || /feedback$/i.test(key);
}

// Narration is learner-visible but not automatically exempt. The same string
// must explicitly say that it is teaching a read-aloud form.
export function isExplicitReadAloudInstruction(text) {
  return (
    /\b(?:read|say|pronounce|speak)\b[^.!?]{0,96}\b(?:aloud|as)\b/i.test(text) ||
    /\b(?:spoken|oral|read-aloud)\s+(?:form|reading|name)\b/i.test(text)
  );
}

export function spokenDecimalPhrases(text) {
  return [...text.matchAll(SPOKEN_DECIMAL)].map((match) => match[0]);
}

function collectVisibleStrings(value, segments = [], out = []) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => collectVisibleStrings(child, [...segments, `[${index}]`], out));
    return out;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => collectVisibleStrings(child, [...segments, key], out));
    return out;
  }
  const key = segments.at(-1);
  if (typeof value === "string" && key && visibleField(key)) out.push({ field: segments.join("."), text: value });
  return out;
}

function lessonFiles() {
  return fs
    .readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((course) => {
      const lessonsDir = path.join(COURSES_DIR, course.name, "lessons");
      if (!fs.existsSync(lessonsDir)) return [];
      return fs
        .readdirSync(lessonsDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => path.join(lessonsDir, entry.name));
    })
    .sort();
}

function sourceFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(file);
      if (!entry.isFile() || !/\.(?:[cm]?js|[jt]sx?)$/.test(entry.name) || /\.(?:test|spec)\.[jt]sx?$/.test(entry.name)) return [];
      return [file];
    })
    .sort();
}

function sourceSentence(text, index) {
  const start = Math.max(text.lastIndexOf("\n", index) + 1, text.lastIndexOf(".", index) + 1);
  const nextPeriod = text.indexOf(".", index);
  const nextNewline = text.indexOf("\n", index);
  const candidates = [nextPeriod, nextNewline].filter((candidate) => candidate >= 0);
  const end = candidates.length ? Math.min(...candidates) + 1 : text.length;
  return text.slice(start, end).trim();
}

function sourceLine(text, index) {
  return text.slice(0, index).split("\n").length;
}

function sortRows(left, right) {
  return `${left.file}:${left.field ?? left.line}:${left.phrase}`.localeCompare(
    `${right.file}:${right.field ?? right.line}:${right.phrase}`,
  );
}

function collectAppSourceAudit() {
  const files = APP_SOURCE_DIRS.flatMap((dir) => sourceFiles(dir));
  const findings = [];
  const exemptions = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(SPOKEN_DECIMAL)) {
      const index = match.index ?? 0;
      const sentence = sourceSentence(source, index);
      const row = {
        file: file.split(path.sep).join("/"),
        line: sourceLine(source, index),
        phrase: match[0],
        surface: "component-or-library-string-literal",
      };
      if (isExplicitReadAloudInstruction(sentence)) {
        exemptions.push({ ...row, reason: "explicit-read-aloud-instruction" });
      } else {
        findings.push({ ...row, requiredForm: "digits, for example 0.5" });
      }
    }
  }
  findings.sort(sortRows);
  exemptions.sort(sortRows);
  return { sourceFiles: files.length, findings, exemptions };
}

export function collectAudit() {
  const files = lessonFiles();
  const findings = [];
  const exemptions = [];
  let learnerVisibleStrings = 0;

  for (const file of files) {
    const lesson = JSON.parse(fs.readFileSync(file, "utf8"));
    const strings = collectVisibleStrings(lesson);
    learnerVisibleStrings += strings.length;
    for (const field of strings) {
      for (const phrase of spokenDecimalPhrases(field.text)) {
        const row = {
          course: path.basename(path.dirname(path.dirname(file))),
          lessonId: lesson.id,
          file: file.split(path.sep).join("/"),
          field: field.field,
          phrase,
        };
        if (isExplicitReadAloudInstruction(field.text)) {
          exemptions.push({ ...row, reason: "explicit-read-aloud-instruction" });
        } else {
          findings.push({ ...row, requiredForm: "digits, for example 0.5" });
        }
      }
    }
  }

  findings.sort(sortRows);
  exemptions.sort(sortRows);
  const app = collectAppSourceAudit();
  const totalFindings = findings.length + app.findings.length;
  const totalExemptions = exemptions.length + app.exemptions.length;
  return {
    policy: "S271 spoken concrete decimals require digits unless the same learner-visible field explicitly teaches a read-aloud form",
    lessonFiles: files.length,
    learnerVisibleStrings,
    findings,
    exemptions,
    app,
    totalFindings,
    totalExemptions,
    inventorySha256: crypto
      .createHash("sha256")
      .update(JSON.stringify({ findings, exemptions, app }))
      .digest("hex"),
  };
}

function selfTest() {
  const mustFlag = "Compare zero point five with zero point nine.";
  const mustExempt = "Say negative twelve point zero five aloud, then write it as digits.";
  const narrationIsNotEnough = "Zero point five is halfway between 0 and 1.";
  if (spokenDecimalPhrases(mustFlag)[0] !== "zero point five") throw new Error("detector missed a concrete decimal");
  if (!isExplicitReadAloudInstruction(mustExempt)) throw new Error("explicit read-aloud exemption was missed");
  if (isExplicitReadAloudInstruction(narrationIsNotEnough)) throw new Error("ordinary narration was incorrectly exempted");
  console.log("spoken-decimal-notation audit self-test passed");
}

const args = new Set(process.argv.slice(2));
if (args.has("--self-test")) selfTest();
if (args.has("--json")) {
  console.log(JSON.stringify(collectAudit(), null, 2));
} else if (!args.has("--self-test")) {
  const audit = collectAudit();
  console.log(
    `spoken-decimal notation: ${audit.findings.length} lesson finding(s), ${audit.app.findings.length} app-source finding(s), ${audit.totalExemptions} explicit read-aloud exemption(s), ${audit.lessonFiles} lesson files`,
  );
}
if (args.has("--check")) {
  const audit = collectAudit();
  if (audit.totalFindings) {
    console.error(JSON.stringify({ lessonFindings: audit.findings, appSourceFindings: audit.app.findings }, null, 2));
    process.exitCode = 1;
  }
}