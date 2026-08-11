import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("../..", import.meta.url)));
const lessonsRoot = join(root, "content", "courses");

function plain(text) {
  return String(text ?? "")
    .replace(/\*\*/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function isFixedFigureAligned(id, text) {
  const value = plain(text);
  if (id === "count-on-hops") {
    return /4\s*\+\s*3/.test(value) || /start(?:ing)? at 4.*(?:5.*6.*7|land.*7)/.test(value) || /after 4 comes 5,? 6,? 7/.test(value);
  }
  if (id === "bar-compare") {
    return /9\s*-\s*5\s*=\s*4/.test(value) || (/\b9\b/.test(value) && /\b5\b/.test(value) && /compare|subtract|difference|more/.test(value));
  }
  if (id === "number-track") {
    return /count(?:ing)? (?:keeps going|continues) past 20/.test(value) || /20,? 21,? 22,? 23/.test(value) || /17,? 18,? 19,? 20/.test(value) || /numbers have an order/.test(value);
  }
  if (id === "frac-equal-vs-unequal") {
    const namesThirds = /\bthree\b|\bthirds?\b|\b1\s*\/\s*3\b/.test(value);
    const namesFourths = /\bfour\b|\bfourths?\b|\b1\s*\/\s*4\b/.test(value);
    return !namesThirds || namesFourths;
  }
  return true;
}

const fixed = new Set(["count-on-hops", "bar-compare", "number-track", "frac-equal-vs-unequal"]);

async function jsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return jsonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  }));
  return nested.flat();
}

function collectFigures(value, path, rows, lesson, source) {
  if (!value || typeof value !== "object") return;
  if (typeof value.figure === "string") {
    const text = [value.title, value.body, value.prompt].filter(Boolean).join(" ");
    const strict = fixed.has(value.figure);
    const aligned = isFixedFigureAligned(value.figure, text);
    rows.push({
      course_id: lesson.courseId ?? "",
      lesson_id: lesson.id ?? "",
      step_path: path,
      figure_id: value.figure,
      fixed_exemplar: strict ? "yes" : "no",
      text_aligned: aligned ? "yes" : "no",
      render_decision: strict && !aligned ? "SUPPRESS_MISMATCH" : "RENDER",
      source: relative(root, source).replaceAll("\\", "/"),
      text,
    });
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "figure") continue;
    if (Array.isArray(child)) child.forEach((item, index) => collectFigures(item, `${path}.${key}[${index}]`, rows, lesson, source));
    else if (child && typeof child === "object") collectFigures(child, `${path}.${key}`, rows, lesson, source);
  }
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function runFigureTextAlignmentAudit() {
  const rows = [];
  for (const source of await jsonFiles(lessonsRoot)) {
    const lesson = JSON.parse(await readFile(source, "utf8"));
    if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
    collectFigures(lesson.steps, "steps", rows, lesson, source);
    collectFigures(lesson.remedials ?? [], "remedials", rows, lesson, source);
  }
  rows.sort((a, b) => a.source.localeCompare(b.source) || a.step_path.localeCompare(b.step_path));
  const columns = ["course_id", "lesson_id", "step_path", "figure_id", "fixed_exemplar", "text_aligned", "render_decision", "source", "text"];
  const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\n") + "\n";
  await writeFile(join(root, "FIGURE_TEXT_ALIGNMENT_AUDIT.csv"), csv, "utf8");
  const suppressed = rows.filter((row) => row.render_decision === "SUPPRESS_MISMATCH");
  return { uses: rows.length, fixedExemplars: rows.filter((row) => row.fixed_exemplar === "yes").length, renderedFixed: rows.filter((row) => row.fixed_exemplar === "yes" && row.render_decision === "RENDER").length, suppressed: suppressed.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await runFigureTextAlignmentAudit();
  console.log(JSON.stringify(result, null, 2));
}
