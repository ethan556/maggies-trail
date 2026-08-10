// S121 Phase-0: engine-level A–D matrix.
// Inputs: scripts/engine-capabilities.json (7 dims, 0–3, maintained since S9x audits)
//         /tmp/usage.json (steps/lessons per type, measured this session).
// Grade rule (engine analogue of the lesson tier rule in flagship-tier.mjs):
//   A: manip>=2 && conseq>=2 && err>=2 && total>=17
//   B: manip>=2 && conseq>=2 && total>=13
//   C: below B but conseq>=1 (functional; ordinary)
//   D: conseq==0 || a11y==0 || mobile==0 || total<=8 (repair required)
// Answer surfaces (pure entry/choice) are graded but flagged ANSWER — their manip
// score is structurally low and that is not a defect of the widget class.
import { readFileSync } from "node:fs";

const caps = JSON.parse(readFileSync(new URL("../engine-capabilities.json", import.meta.url), "utf8")).types;
const usage = JSON.parse(readFileSync("/tmp/usage.json", "utf8"));
const byType = Object.fromEntries(usage.rows.map((r) => [r.type, r]));
const ANSWER = new Set(["mcq", "numeric", "fractionEntry", "pointEntry", "buildExpression", "dragOrder", "dragBucket", "matchPairs", "steppedReveal", "tapDiagram"]);

const rows = Object.entries(caps).map(([type, c]) => {
  const total = c.manip + c.conseq + c.err + c.adapt + c.a11y + c.mobile + c.polish;
  let grade;
  if (c.conseq === 0 || c.a11y === 0 || c.mobile === 0 || total <= 8) grade = "D";
  else if (c.manip >= 2 && c.conseq >= 2 && c.err >= 2 && total >= 17) grade = "A";
  else if (c.manip >= 2 && c.conseq >= 2 && total >= 13) grade = "B";
  else grade = "C";
  const u = byType[type] ?? { steps: 0, lessons: 0 };
  return { type, grade, total, ...c, steps: u.steps, lessons: u.lessons, answer: ANSWER.has(type) };
});

rows.sort((a, b) => (a.grade === b.grade ? b.steps - a.steps : a.grade.localeCompare(b.grade)));
const dist = {};
const stepsByGrade = {};
for (const r of rows) {
  dist[r.grade] = (dist[r.grade] ?? 0) + 1;
  stepsByGrade[r.grade] = (stepsByGrade[r.grade] ?? 0) + r.steps;
}
console.log("## Engine grade distribution (types / widget steps served)");
for (const g of ["A", "B", "C", "D"]) console.log(`${g}: ${dist[g] ?? 0} types · ${stepsByGrade[g] ?? 0} steps`);
console.log("\n| grade | engine | steps | lessons | manip | conseq | err | adapt | a11y | mobile | polish | Σ | note |");
console.log("|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|---|");
for (const r of rows)
  console.log(
    `| ${r.grade} | ${r.type} | ${r.steps} | ${r.lessons} | ${r.manip} | ${r.conseq} | ${r.err} | ${r.adapt} | ${r.a11y} | ${r.mobile} | ${r.polish} | ${r.total} | ${r.answer ? "answer-surface" : ""} |`
  );
