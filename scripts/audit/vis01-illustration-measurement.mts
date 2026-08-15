/**
 * VIS-01 — measure the CURRENT state of lesson illustration placements.
 *
 * Detector design note: this script imports the PRODUCTION gate
 * (isFigureTextAligned, FIGURE_IDS, FIGURE_TEXT_MISMATCH_BLOCKLIST) rather than
 * reimplementing it, so "withheld" here means exactly what the renderer means.
 * The render condition mirrored is LessonPlayer.tsx:587 / widgets.tsx:15960:
 *     figure && FIGURE_IDS.has(figure) && isFigureTextAligned(figure, body ?? "")
 *
 * Measurement only. Writes no content.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { FIGURE_IDS } from "../../src/components/figureIds";
import { isFigureTextAligned, figureTextBindingKey, FIXED_EXEMPLAR_FIGURES } from "../../src/lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "../../src/lib/figureTextMismatchBlocklist.generated";

const ROOT = process.cwd();
const FIXED = new Set<string>(FIXED_EXEMPLAR_FIGURES as readonly string[]);

type Row = {
  file: string; lessonId: string; path: string; stepId: string;
  figure: string; body: string;
  registered: boolean; aligned: boolean; blocklisted: boolean;
  cause: string;
};

const rows: Row[] = [];
const coursesDir = join(ROOT, "content/courses");

for (const course of readdirSync(coursesDir).sort()) {
  const lessonsDir = join(coursesDir, course, "lessons");
  let files: string[] = [];
  try { files = readdirSync(lessonsDir).filter((f) => f.endsWith(".json")).sort(); } catch { continue; }
  for (const f of files) {
    const rel = `content/courses/${course}/lessons/${f}`;
    const lesson = JSON.parse(readFileSync(join(lessonsDir, f), "utf8"));
    const lessonId = lesson.id ?? f.replace(/\.json$/, "");

    const add = (path: string, stepId: string, figure: string, body: string) => {
      const registered = FIGURE_IDS.has(figure);
      const aligned = isFigureTextAligned(figure, body);
      const blocklisted = FIGURE_TEXT_MISMATCH_BLOCKLIST.has(figureTextBindingKey(figure, body));
      let cause: string;
      if (!registered) cause = "UNREGISTERED_FIGURE_ID";
      else if (aligned) cause = "RENDERS";
      else if (blocklisted) cause = "WITHHELD_BLOCKLIST_FINGERPRINT";
      else if (FIXED.has(figure)) cause = "WITHHELD_FIXED_EXEMPLAR_TEXT_GUARD";
      else cause = "WITHHELD_OTHER";
      rows.push({ file: rel, lessonId, path, stepId, figure, body, registered, aligned, blocklisted, cause });
    };

    (lesson.steps ?? []).forEach((s: any, i: number) => {
      if (typeof s?.figure === "string") add(`steps.${i}`, s.id ?? "", s.figure, s.body ?? "");
      (s?.widget?.panels ?? []).forEach((p: any, j: number) => {
        if (typeof p?.figure === "string") add(`steps.${i}.widget.panels.${j}`, s.id ?? "", p.figure, p.body ?? "");
      });
    });
    (lesson.remedials ?? []).forEach((r: any, i: number) => {
      for (const slot of ["concept", "check"] as const) {
        const st = r?.[slot];
        if (typeof st?.figure === "string") add(`remedials.${i}.${slot}`, st.id ?? "", st.figure, st.body ?? "");
      }
    });
  }
}

const by = (k: keyof Row) => {
  const m = new Map<string, number>();
  for (const r of rows) m.set(String(r[k]), (m.get(String(r[k])) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const withheld = rows.filter((r) => r.cause.startsWith("WITHHELD") || r.cause === "UNREGISTERED_FIGURE_ID");

console.log("TOTAL PLACEMENTS:", rows.length);
console.log("DISTINCT LESSONS WITH >=1 PLACEMENT:", new Set(rows.map((r) => r.file)).size);
console.log("DISTINCT FIGURE IDS USED:", new Set(rows.map((r) => r.figure)).size);
console.log("REGISTERED FIGURE IDS TOTAL:", FIGURE_IDS.size);
console.log("\n--- BY CAUSE ---");
for (const [k, v] of by("cause")) console.log(`${String(v).padStart(6)}  ${k}`);
console.log("\n--- NOT RENDERING, BY FIGURE ID ---");
const byFig = new Map<string, number>();
for (const r of withheld) byFig.set(r.figure, (byFig.get(r.figure) ?? 0) + 1);
for (const [k, v] of [...byFig.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`${String(v).padStart(6)}  ${k}`);
console.log("\n--- NOT RENDERING, BY PLACEMENT SITE ---");
const bySite = new Map<string, number>();
for (const r of withheld) {
  const site = r.path.startsWith("remedials") ? "remedials.*" : r.path.includes("panels") ? "steps.*.widget.panels.*" : "steps.*";
  bySite.set(site, (bySite.get(site) ?? 0) + 1);
}
for (const [k, v] of bySite) console.log(`${String(v).padStart(6)}  ${k}`);

mkdirSync(join(ROOT, "reports/vis"), { recursive: true });
const esc = (s: string) => `"${String(s).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
writeFileSync(
  join(ROOT, "reports/vis/VIS01_PLACEMENTS.csv"),
  ["file,lesson_id,path,step_id,figure,cause,registered,aligned,blocklisted,body",
    ...rows.map((r) => [r.file, r.lessonId, r.path, r.stepId, r.figure, r.cause, r.registered, r.aligned, r.blocklisted, r.body].map(esc).join(","))].join("\n")
);
console.log("\nwrote reports/vis/VIS01_PLACEMENTS.csv");
