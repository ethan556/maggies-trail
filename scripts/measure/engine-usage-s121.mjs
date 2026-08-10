// S121 Phase-0 audit: steps served per widget type, split by band, plus lesson counts.
// Read-only. Walks content/courses/*/lessons/*.json; counts every widget-bearing step.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const coursesDir = join(root, "content/courses");
const manifest = JSON.parse(readFileSync(join(root, "content/curriculum-manifest.json"), "utf8"));

// course -> grade from manifest (shape probed defensively)
const courseGrade = {};
const list = manifest.courses ?? manifest;
for (const c of Array.isArray(list) ? list : Object.values(list)) {
  const id = c.id ?? c.slug ?? c.course;
  const g = c.grade ?? c.gradeLevel ?? c.band ?? "?";
  if (id) courseGrade[id] = g;
}
const bandOf = (g) => {
  const n = typeof g === "number" ? g : parseInt(String(g).replace(/\D/g, ""), 10);
  if (Number.isNaN(n)) return "?";
  if (n <= 2) return "K-2";
  if (n <= 5) return "3-5";
  if (n <= 8) return "6-8";
  return "9-12+";
};

const usage = {}; // type -> {steps, lessons:Set, bands:{}}
let totalSteps = 0, widgetSteps = 0, lessons = 0;

for (const course of readdirSync(coursesDir)) {
  let files;
  try { files = readdirSync(join(coursesDir, course, "lessons")); } catch { continue; }
  const band = bandOf(courseGrade[course]);
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    lessons++;
    const j = JSON.parse(readFileSync(join(coursesDir, course, "lessons", f), "utf8"));
    const steps = j.steps ?? [];
    for (const s of steps) {
      totalSteps++;
      const w = s.widget;
      if (!w || typeof w.type !== "string") continue;
      widgetSteps++;
      const t = w.type;
      usage[t] ??= { steps: 0, lessons: new Set(), bands: {} };
      usage[t].steps++;
      usage[t].lessons.add(`${course}/${f}`);
      usage[t].bands[band] = (usage[t].bands[band] ?? 0) + 1;
    }
  }
}

const rows = Object.entries(usage)
  .map(([t, u]) => ({ type: t, steps: u.steps, lessons: u.lessons.size, ...u.bands }))
  .sort((a, b) => b.steps - a.steps);
console.log(JSON.stringify({ lessons, totalSteps, widgetSteps, types: rows.length, rows }, null, 1));
