// Ranks every lesson as a FLAGSHIP-UPGRADE candidate and writes FLAGSHIP.md.
// Deterministic and data-driven — re-run after any content change: node scripts/flagship-rank.mjs
//
// A flagship experience is a lesson rebuilt around predict → manipulate → observe →
// invariant → transfer on a reusable interaction engine. This script decides WHERE
// that investment pays, scoring each lesson on:
//   centrality    — how many later skills depend (transitively) on this lesson's conceptTags;
//                   prerequisite-central concepts compound, so they go first
//   misconception — how many authored wrong-path diagnoses the lesson carries; a heavy
//                   misconception burden means manipulation-with-consequence earns its keep
//   staticness    — the share of the lesson's widget steps that are plain numeric/mcq;
//                   the lessons taught entirely through answer fields have the most to gain
//   engineFit     — whether a rich engine already serves this concept family (a conversion
//                   is a content edit, not new engineering)
// score = centrality-percentile + misconception-percentile + staticness + engineFit bonus.
//
// The output manifest carries, per the flagship spec: course, lesson, concepts,
// prerequisite importance, misconception burden, selected engine, and status
// (a lesson already using a rich engine or a prediction is marked accordingly).

import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "content", "courses");
const prereqs = JSON.parse(readFileSync(path.join(process.cwd(), "content", "skill-prereqs.json"), "utf8")).prereqs;

// ---- transitive dependents per tag (how much of the curriculum sits on this skill)
const dependents = new Map(); // tag -> Set of tags that (transitively) require it
for (const t of Object.keys(prereqs)) dependents.set(t, new Set());
const memo = new Map();
function ancestors(tag, seen = new Set()) {
  if (memo.has(tag)) return memo.get(tag);
  const out = new Set();
  for (const p of prereqs[tag] ?? []) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.add(p);
    for (const a of ancestors(p, seen)) out.add(a);
  }
  memo.set(tag, out);
  return out;
}
for (const t of Object.keys(prereqs)) {
  for (const a of ancestors(t)) {
    if (!dependents.has(a)) dependents.set(a, new Set());
    dependents.get(a).add(t);
  }
}
const centralityOf = (tag) => dependents.get(tag)?.size ?? 0;

// ---- widget families → engines (the reusable laboratories, by curriculum family)
const ENGINE = {
  fractionBar: "Fraction Models", areaModel: "Fraction Models", fractionOfSet: "Fraction Models",
  percentBar: "Fraction Models", doubleNumberLine: "Fraction Models", ratioTable: "Fraction Models",
  numberLineHop: "Dynamic Number Line", numberLinePlace: "Dynamic Number Line", estimateSlider: "Dynamic Number Line",
  baseTenCompose: "Base-Ten Workspace", placeValue: "Base-Ten Workspace", tenFrame: "Base-Ten Workspace",
  plotPoint: "Coordinate Plane", lineExplore: "Coordinate Plane", distanceGrid: "Coordinate Plane",
  graphZoom: "Coordinate Plane", scatterFit: "Coordinate Plane", systemsExplore: "Coordinate Plane",
  balanceScale: "Algebra Balance", algebraTiles: "Algebra Balance", buildExpression: "Algebra Balance",
  compassConstruct: "Construction Canvas",
  transformExplore: "Transformations", dilationExplore: "Transformations", quadDrag: "Transformations",
  quadraticExplore: "Function Lab", expLogExplore: "Function Lab", functionMachine: "Function Lab",
  sequenceBuild: "Function Lab", signChart: "Function Lab", radicalCheck: "Function Lab",
  spinnerSim: "Probability Sim", sampleSim: "Probability Sim", treeDiagram: "Probability Sim",
  probabilityArea: "Probability Sim", shuffleTest: "Probability Sim", ciCapture: "Probability Sim",
  dotPlot: "Distribution Lab", boxPlot: "Distribution Lab", barBuilder: "Distribution Lab",
  unitCircleExplore: "Unit Circle & Trig", circleAngleExplore: "Unit Circle & Trig",
  triangleSolve: "Unit Circle & Trig", polarTrace: "Unit Circle & Trig", circleMeasureExplore: "Unit Circle & Trig",
  angleMeasure: "Unit Circle & Trig",
  vectorExplore: "Vector & Matrix Plane", matrixTransform: "Vector & Matrix Plane", argandExplore: "Vector & Matrix Plane",
  secantSlope: "Calculus Visualizer", derivativeTrace: "Calculus Visualizer", riemannSum: "Calculus Visualizer",
  accumulateArea: "Calculus Visualizer", sliceSum: "Calculus Visualizer", taylorApprox: "Calculus Visualizer",
  slopeField: "Calculus Visualizer",
  integerChips: "Dynamic Number Line", elapsedTime: "Dynamic Number Line", clockSet: "Dynamic Number Line",
  volumeBuilder: "Transformations", netFold: "Transformations", subitizeFlash: "Base-Ten Workspace"
};
const STATIC_KINDS = new Set(["numeric", "mcq", "dragBucket", "matchPairs", "dragOrder", "steppedReveal", "tapDiagram"]);

// ---- misconception count per widget (authored wrong-path diagnoses)
function wrongPathCount(w) {
  if (!w) return 0;
  if (w.type === "mcq") return (w.options ?? []).filter((o) => !o.correct).length;
  if (w.type === "numeric") return (w.commonErrors ?? []).length + 1;
  // every other widget carries at least its distinct authored wrong-path feedbacks
  return Object.keys(w).filter((k) => /Feedback$/.test(k) && k !== "successFeedback").length;
}

const rows = [];
for (const courseDir of readdirSync(ROOT)) {
  const lessonsDir = path.join(ROOT, courseDir, "lessons");
  if (!existsSync(lessonsDir)) continue;
  const course = JSON.parse(readFileSync(path.join(ROOT, courseDir, "course.json"), "utf8"));
  for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
    const l = JSON.parse(readFileSync(path.join(lessonsDir, f), "utf8"));
    const tags = [...new Set(l.steps.map((s) => s.conceptTag).filter(Boolean))];
    const centrality = Math.max(0, ...tags.map(centralityOf));
    const widgets = l.steps.filter((s) => s.widget);
    const staticN = widgets.filter((s) => STATIC_KINDS.has(s.widget.type)).length;
    const richTypes = [...new Set(widgets.map((s) => s.widget.type).filter((t) => !STATIC_KINDS.has(t)))];
    const engines = [...new Set(richTypes.map((t) => ENGINE[t]).filter(Boolean))];
    const hasPredict = l.steps.some((s) => s.predict);
    const misconceptions = widgets.reduce((n, s) => n + wrongPathCount(s.widget), 0);
    rows.push({
      course: course.title, gradeLevel: course.gradeLevel ?? 3, lesson: l.id, title: l.title,
      tags, centrality, misconceptions,
      staticness: widgets.length === 0 ? 1 : staticN / widgets.length,
      engines, hasPredict,
      status: hasPredict ? "flagship" : engines.length > 0 ? "rich-widget" : "static"
    });
  }
}

// percentile helpers over the observed distribution
const pct = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  return (v) => sorted.filter((x) => x <= v).length / sorted.length;
};
const pC = pct(rows.map((r) => r.centrality));
const pM = pct(rows.map((r) => r.misconceptions));
for (const r of rows) {
  r.score = pC(r.centrality) + pM(r.misconceptions) + r.staticness + (r.engines.length > 0 ? 0.25 : 0);
}
rows.sort((a, b) => b.score - a.score || a.lesson.localeCompare(b.lesson));

const flagship = rows.filter((r) => r.status === "flagship");
const top = rows.filter((r) => r.status !== "flagship").slice(0, 300);
const md = [];
md.push("# Flagship interactive-experience manifest");
md.push("");
md.push("Generated by `node scripts/flagship-rank.mjs` — deterministic, re-run after content changes.");
md.push("");
md.push(`Catalogue: ${rows.length} lessons. Already flagship (predict → manipulate → observe): ${flagship.length}. `);
md.push(`Using a rich engine without a prediction yet: ${rows.filter((r) => r.status === "rich-widget").length}. `);
md.push("");
md.push("Scoring: prerequisite-centrality percentile + misconception-burden percentile + share of");
md.push("static (numeric/mcq) widget steps + a bonus when a reusable engine already fits, so a");
md.push("conversion is a content edit rather than new engineering. The next 300 candidates:");
md.push("");
md.push("| # | lesson | course (grade) | key concepts | centrality | misconceptions | static | engine fit | status |");
md.push("|--:|---|---|---|--:|--:|--:|---|---|");
top.forEach((r, i) => {
  md.push(
    `| ${i + 1} | ${r.lesson} — ${r.title} | ${r.course} (G${r.gradeLevel}) | ${r.tags.slice(0, 3).join(", ")} | ${r.centrality} | ${r.misconceptions} | ${Math.round(r.staticness * 100)}% | ${r.engines.join(", ") || "—"} | ${r.status} |`
  );
});
md.push("");
md.push("## Converted flagships");
md.push("");
md.push("| lesson | course | engine | concepts |");
md.push("|---|---|---|---|");
for (const r of flagship) md.push(`| ${r.lesson} — ${r.title} | ${r.course} | ${r.engines.join(", ") || "—"} | ${r.tags.slice(0, 3).join(", ")} |`);
md.push("");
writeFileSync(path.join(process.cwd(), "FLAGSHIP.md"), md.join("\n"));
console.log(`FLAGSHIP.md written: ${rows.length} lessons ranked, ${flagship.length} flagship, top ${top.length} candidates listed`);
