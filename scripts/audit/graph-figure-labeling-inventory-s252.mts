/**
 * S252 graph / statistical-display corpus inventory.
 *
 * This is intentionally a static audit.  PASS means the relevant contract can
 * be proved from source or authored data. REVIEW means it cannot; REVIEW is
 * never silently converted into a failure.  The output is deterministic and
 * --check makes the committed artifacts a source-current release gate.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

type Display = "coordinate_graph" | "line_graph" | "bar_chart" | "histogram" | "box_plot" | "dot_plot" | "scatter_plot" | "number_line";
type CheckStatus = "PASS" | "VIOLATION" | "REVIEW" | "NOT_APPLICABLE";
type Rule = "labels" | "ticks" | "grid" | "origin" | "units" | "aria" | "no_caret" | "no_clipping";

const ROOT = resolve(import.meta.dirname, "../..");
const OUT_DIR = join(ROOT, "reports", "graph-labeling");
const JSON_OUT = join(OUT_DIR, "GRAPH_FIGURE_LABELING_INVENTORY_S252.json");
const VIOLATIONS_OUT = join(OUT_DIR, "GRAPH_FIGURE_LABELING_VIOLATIONS_S252.csv");
const PORTFOLIOS_OUT = join(OUT_DIR, "GRAPH_FIGURE_LABELING_PORTFOLIOS_S252.csv");
const MD_OUT = join(OUT_DIR, "GRAPH_FIGURE_LABELING_AUDIT_S252.md");

const WIDGETS: Readonly<Record<string, Display>> = Object.freeze({
  lineExplore: "coordinate_graph", quadraticExplore: "coordinate_graph", unitCircleExplore: "coordinate_graph",
  systemsExplore: "coordinate_graph", feasibleRegionExplore: "coordinate_graph", numberLinePlace: "number_line",
  transformExplore: "coordinate_graph", rotationLab: "coordinate_graph", dilationExplore: "coordinate_graph",
  barBuilder: "bar_chart", dotPlot: "dot_plot", boxPlot: "box_plot", distributionCompareLab: "box_plot",
  doubleNumberLine: "number_line", scatterFit: "scatter_plot", distanceGrid: "coordinate_graph",
  graphZoom: "coordinate_graph", expLogExplore: "coordinate_graph", secantSlope: "coordinate_graph",
  argandExplore: "coordinate_graph", vectorExplore: "coordinate_graph", matrixTransform: "coordinate_graph",
  polarTrace: "coordinate_graph", parametricTrace: "coordinate_graph", signChart: "number_line",
  extraneousRootLab: "coordinate_graph", derivativeTrace: "line_graph", riemannSum: "coordinate_graph",
  accumulateArea: "coordinate_graph", sliceSum: "coordinate_graph", taylorApprox: "coordinate_graph",
  slopeField: "coordinate_graph", lineRelationLab: "coordinate_graph", coordinateProofLab: "coordinate_graph",
  verticalLineScanner: "coordinate_graph", covariationScrubber: "coordinate_graph",
  proportionalReasoningLab: "coordinate_graph", pointSetReasoningLab: "scatter_plot",
  geometricConstraintLab: "coordinate_graph", affineRelationshipLab: "coordinate_graph",
  graphStoryLab: "line_graph", conicLocusLab: "coordinate_graph", derivativeRuleLab: "coordinate_graph",
  relatedRatesLab: "coordinate_graph", numberLineRay: "number_line", quadDrag: "coordinate_graph",
  sampleSim: "dot_plot", ciCapture: "number_line", shuffleTest: "dot_plot", plotPoint: "coordinate_graph",
  numberLineHop: "number_line", absValueLine: "number_line", slopeTriangle: "coordinate_graph",
  graphRead: "bar_chart", trialProbabilityLab: "bar_chart", unitRuler: "number_line",
  estimateSlider: "number_line", sequenceBuild: "bar_chart", scaledCircleLab: "coordinate_graph"
});

const NEEDS_GRID = new Set<Display>(["coordinate_graph", "scatter_plot"]);
const NEEDS_ORIGIN = new Set<Display>(["coordinate_graph", "bar_chart", "histogram", "scatter_plot"]);
const GRAPH_TOKEN = /(?:^|[-_])(histogram|box[-_]?plot|dot[-_]?plot|scatter|residual|bar[-_]?(?:chart|graph)|line[-_]?(?:chart|graph|plot)|number[-_]?line|coordinate[-_]?(?:plane|grid|graph)|function[-_]?graph|slope[-_]?field|graph)(?:$|[-_])/i;

function posix(p: string) { return p.replaceAll("\\", "/"); }
function walk(dir: string, predicate: (p: string) => boolean): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name); const st = statSync(path);
    if (st.isDirectory()) out.push(...walk(path, predicate)); else if (predicate(path)) out.push(path);
  }
  return out;
}
function hashInputs(files: string[]): string {
  const h = createHash("sha256");
  for (const file of [...files].sort()) h.update(posix(relative(ROOT, file))).update("\0").update(readFileSync(file)).update("\0");
  return h.digest("hex");
}
function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "\n";
  const keys = Object.keys(rows[0]);
  const q = (v: unknown) => { const s = String(v ?? ""); return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };
  return [keys.join(","), ...rows.map(row => keys.map(k => q(row[k])).join(","))].join("\n") + "\n";
}
function stable(value: unknown): string { return JSON.stringify(value, null, 2) + "\n"; }
function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

const parsedSources = new Map<string, ts.SourceFile>();
function functionSource(source: string, name: string): string {
  let file = parsedSources.get(source);
  if (!file) {
    file = ts.createSourceFile("graph-audit.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    parsedSources.set(source, file);
  }
  let found: ts.Node | undefined;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) found = node;
    else ts.forEachChild(node, visit);
  };
  visit(file);
  return found ? found.getText(file) : "";
}

function composedFunctionSource(source: string, name: string): string {
  const direct = functionSource(source, name);
  if (!direct) return "";
  const helperNames = [...direct.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map((match) => match[1]);
  const helperSources = [...new Set(helperNames)].map((helper) => functionSource(source, helper)).filter(Boolean);
  return [direct, ...helperSources].join("\n");
}

function classify(text: string): Display | null {
  if (/histogram/i.test(text)) return "histogram";
  if (/box[-_ ]?plot|five[-_ ]?number/i.test(text)) return "box_plot";
  if (/\bscatter(?:[-_ ]?plot)?\b|\bresidual\b/i.test(text)) return "scatter_plot";
  if (/dot[-_ ]?plot|line[-_ ]?plot/i.test(text)) return "dot_plot";
  if (/bar[-_ ]?(?:chart|graph)|picture[-_ ]?graph/i.test(text)) return "bar_chart";
  if (/number[-_ ]?line|double[-_ ]?number/i.test(text)) return "number_line";
  if (/line[-_ ]?(?:chart|graph)|time[-_ ]?series/i.test(text)) return "line_graph";
  if (/coordinate|function[-_ ]?graph|graph|slope[-_ ]?field|axis/i.test(text)) return "coordinate_graph";
  return null;
}

function visibleCaret(source: string): boolean {
  return />[^<>{}]*\^[^<>{}]*</.test(source) || /(?:aria-label|title|caption)\s*=\s*["'`][^"'`]*\^/i.test(source);
}
function directClip(source: string): string | null {
  const vm = /viewBox=["']\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/.exec(source);
  if (!vm) return null;
  const [minX, minY, width, height] = vm.slice(1).map(Number); const maxX = minX + width, maxY = minY + height;
  for (const m of source.matchAll(/<text\b[^>]*\bx=["'](-?\d+(?:\.\d+)?)["'][^>]*\by=["'](-?\d+(?:\.\d+)?)["']/g)) {
    const x = Number(m[1]), y = Number(m[2]); if (x < minX || x > maxX || y < minY || y > maxY) return `literal text anchor (${x}, ${y}) is outside viewBox`;
  }
  return "";
}

function checksFor(source: string, display: Display, targetKind: "widget_renderer" | "figure_renderer", targetId: string, renderer: string) {
  const hasSvg = /<svg\b/i.test(source); const hasText = /<text\b|AxisCaption|axisLabel|label/i.test(source);
  const hasTicks = /\bticks?\b|tickStep|tickValues|gridlines?/i.test(source) && /<line\b|<text\b/i.test(source);
  const hasGrid = /\bgrid(?:line)?s?\b|gridValues|gridMarks/i.test(source) && /<line\b|<path\b/i.test(source);
  const hasOrigin = /\borigin\b|(?:>|["'`])0(?:<|["'`])|xMin\s*<=?\s*0|axisMin\s*[:=]\s*0/i.test(source);
  const hasUnits = /axisLabel|xAxisLabel|yAxisLabel|\bunits?\b|minutes|seconds|hours|degrees|frequency|count/i.test(source);
  const hasAria = /role=["']img["']|aria-label|aria-labelledby|SvgLatexSurface/i.test(source);
  const clip = directClip(source);
  const make = (rule: Rule, status: CheckStatus, evidence: string) => ({ targetKind, targetId, renderer, displayType: display, rule, status, severity: rule === "no_caret" ? "CRITICAL" : rule === "aria" || rule === "ticks" || rule === "origin" ? "MAJOR" : "MINOR", evidence });
  return [
    make("labels", hasText ? "PASS" : "VIOLATION", hasText ? "axis/text label token present" : "no axis/text label token in renderer source"),
    make("ticks", hasTicks ? "PASS" : "VIOLATION", hasTicks ? "tick/grid-scale construction present" : "no statically visible tick construction"),
    make("grid", NEEDS_GRID.has(display) ? (hasGrid ? "PASS" : "VIOLATION") : "NOT_APPLICABLE", NEEDS_GRID.has(display) ? (hasGrid ? "grid construction present" : "display convention requires grid; none statically visible") : "grid not required for this display type"),
    make("origin", NEEDS_ORIGIN.has(display) ? (hasOrigin ? "PASS" : "VIOLATION") : "NOT_APPLICABLE", NEEDS_ORIGIN.has(display) ? (hasOrigin ? "origin/zero construction present" : "origin/zero not statically visible") : "origin not mandatory for this display type"),
    make("units", hasUnits ? "PASS" : "REVIEW", hasUnits ? "unit/axis-label contract present" : "contextual units cannot be proved from renderer alone"),
    make("aria", hasAria ? "PASS" : hasSvg ? "VIOLATION" : "REVIEW", hasAria ? "accessible SVG wrapper/name present" : hasSvg ? "direct SVG has no statically visible accessible name" : "SVG is delegated; inspect composed surface"),
    make("no_caret", visibleCaret(source) ? "VIOLATION" : "PASS", visibleCaret(source) ? "learner-visible caret token found" : "no learner-visible caret token found"),
    make("no_clipping", clip === "" ? "PASS" : clip ? "VIOLATION" : "REVIEW", clip === "" ? "literal text anchors fit literal viewBox" : clip ?? "dynamic geometry is not statically provable")
  ];
}

const widgetSourceFiles = [join(ROOT, "src/components/widgets.tsx"), ...walk(join(ROOT, "src/components/widgets"), p => /\.tsx?$/.test(p))];
const widgetSources = widgetSourceFiles.map(file => ({ file, source: readFileSync(file, "utf8") }));
const mainWidgets = widgetSources[0].source;
const dispatch = new Map<string, string>();
for (const m of mainWidgets.matchAll(/case\s+"([^"]+)":\s*return\s+<([A-Za-z0-9_]+)/g)) dispatch.set(m[1], m[2]);
const widgetRenderers = Object.entries(WIDGETS).sort(([a], [b]) => a.localeCompare(b)).map(([type, displayType]) => {
  const renderer = dispatch.get(type) ?? "UNMAPPED";
  let source = "", sourceFile = "";
  for (const file of widgetSources) { const found = composedFunctionSource(file.source, renderer); if (found) { source = found; sourceFile = posix(relative(ROOT, file.file)); break; } }
  return { type, renderer, displayType, sourceFile, source };
});

const figureSourceFiles = [join(ROOT, "src/components/figures.tsx"), ...walk(join(ROOT, "src/components/figures"), p => /\.tsx?$/.test(p))].filter(existsSync);
const figureSources = figureSourceFiles.map(file => ({ file, source: readFileSync(file, "utf8") }));
const figureIdsSource = readFileSync(join(ROOT, "src/components/figureIds.ts"), "utf8");
const figureIds = [...figureIdsSource.matchAll(/"([^"]+)"/g)].map(m => m[1]);
const registry = new Map<string, { renderer: string; sourceFile: string; source: string }>();
for (const file of figureSources) {
  for (const m of file.source.matchAll(/"([^"]+)"\s*:\s*([A-Za-z0-9_]+)/g)) {
    const renderer = m[2]; registry.set(m[1], { renderer, sourceFile: posix(relative(ROOT, file.file)), source: functionSource(file.source, renderer) });
  }
}
const figureRenderers = figureIds.map(id => {
  const entry = registry.get(id);
  const sourceEntry = entry?.source ? entry : figureSources.map(file => ({ renderer: entry?.renderer ?? "", sourceFile: posix(relative(ROOT, file.file)), source: entry ? functionSource(file.source, entry.renderer) : "" })).find(candidate => candidate.source) ?? entry;
  const probe = `${id} ${sourceEntry?.renderer ?? ""} ${sourceEntry?.source.slice(0, 4000) ?? ""}`;
  const displayType = GRAPH_TOKEN.test(id) || classify(probe) ? classify(probe) : null;
  return { id, renderer: sourceEntry?.renderer ?? "SPREAD_REGISTRY_UNRESOLVED", displayType, sourceFile: sourceEntry?.sourceFile ?? "", source: sourceEntry?.source ?? "" };
}).filter((row): row is typeof row & { displayType: Display } => row.displayType !== null);

const lessonFiles = walk(join(ROOT, "content/courses"), p => /[/\\]lessons[/\\].+\.json$/.test(p));
type Consumer = { consumerId: string; state: "A" | "R"; lesson: string; course: string; jsonPath: string; surfaceKind: "widget" | "plotData" | "figure"; surfaceId: string; renderer: string; displayType: Display };
const consumers: Consumer[] = [];
const graphFigureIds = new Map(figureRenderers.map(f => [f.id, f]));
function visit(value: unknown, file: string, path: string, state: "A" | "R") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) { value.forEach((item, i) => visit(item, file, `${path}[${i}]`, state)); return; }
  const obj = value as Record<string, unknown>; const nextState = path.includes(".remedials") || path.startsWith("$.remedials") ? "R" : state;
  if (typeof obj.type === "string" && WIDGETS[obj.type]) {
    const renderer = dispatch.get(obj.type) ?? "UNMAPPED"; const displayType = obj.type === "barBuilder" && obj.histogram === true ? "histogram" : WIDGETS[obj.type];
    consumers.push({ consumerId: `${posix(relative(ROOT, file))}#${path}`, state: nextState, lesson: String((JSON.parse(readFileSync(file, "utf8")) as {id?: string}).id ?? ""), course: posix(relative(join(ROOT, "content/courses"), file)).split("/")[0], jsonPath: path, surfaceKind: "widget", surfaceId: obj.type, renderer, displayType });
  }
  if (obj.plotData && typeof obj.plotData === "object") consumers.push({ consumerId: `${posix(relative(ROOT, file))}#${path}.plotData`, state: nextState, lesson: String((JSON.parse(readFileSync(file, "utf8")) as {id?: string}).id ?? ""), course: posix(relative(join(ROOT, "content/courses"), file)).split("/")[0], jsonPath: `${path}.plotData`, surfaceKind: "plotData", surfaceId: "plotData", renderer: "LinePlotFigure", displayType: "dot_plot" });
  if (typeof obj.figure === "string" && graphFigureIds.has(obj.figure)) { const f = graphFigureIds.get(obj.figure)!; consumers.push({ consumerId: `${posix(relative(ROOT, file))}#${path}.figure`, state: nextState, lesson: String((JSON.parse(readFileSync(file, "utf8")) as {id?: string}).id ?? ""), course: posix(relative(join(ROOT, "content/courses"), file)).split("/")[0], jsonPath: `${path}.figure`, surfaceKind: "figure", surfaceId: obj.figure, renderer: f.renderer, displayType: f.displayType }); }
  for (const [key, child] of Object.entries(obj)) visit(child, file, `${path}.${key}`, nextState);
}
for (const file of lessonFiles) { const lesson = JSON.parse(readFileSync(file, "utf8")); visit(lesson, file, "$", "A"); }

const variantsFiles = [join(ROOT, "src/lib/variants.ts"), join(ROOT, "src/lib/g4Variants.ts")].filter(existsSync);
const generatorConsumers: { generator: string; sourceFile: string; surfaceId: string; displayType: Display }[] = [];
for (const file of variantsFiles) {
  const source = readFileSync(file, "utf8"); const tags = [...source.matchAll(/\btag\s*:\s*"([^"]+)"/g)];
  for (let i = 0; i < tags.length; i++) {
    const segment = source.slice(tags[i].index!, tags[i + 1]?.index ?? source.length); const tag = tags[i][1];
    const seen = new Set<string>();
    for (const m of segment.matchAll(/\btype\s*:\s*"([^"]+)"/g)) if (WIDGETS[m[1]]) seen.add(m[1]);
    if (/\bplotData\s*:/.test(segment)) seen.add("plotData");
    for (const surfaceId of [...seen].sort()) generatorConsumers.push({ generator: tag, sourceFile: posix(relative(ROOT, file)), surfaceId, displayType: surfaceId === "plotData" ? "dot_plot" : WIDGETS[surfaceId] });
  }
}

const checks = [
  ...widgetRenderers.flatMap(w => checksFor(w.source, w.displayType, "widget_renderer", w.type, w.renderer)),
  ...figureRenderers.flatMap(f => checksFor(f.source, f.displayType, "figure_renderer", f.id, f.renderer))
];
const violations = checks.filter(c => c.status === "VIOLATION").map(c => { const cause = c.targetKind === "widget_renderer" ? c.renderer : `figure-family-${c.targetId.split("-")[0]}`; return { ...c, portfolioId: `GF-${c.targetKind === "widget_renderer" ? "W" : "F"}-${c.displayType}-${cause}-${c.rule}`.replace(/[^A-Za-z0-9-]/g, "-").toUpperCase() }; });
const portfolioMap = new Map<string, typeof violations>();
for (const v of violations) portfolioMap.set(v.portfolioId, [...(portfolioMap.get(v.portfolioId) ?? []), v]);
const portfolios = [...portfolioMap.entries()].map(([portfolioId, rows]) => ({ portfolioId, targetKind: rows[0].targetKind, renderer: rows[0].renderer, displayType: rows[0].displayType, rule: rows[0].rule, severity: rows[0].severity, affectedRenderers: new Set(rows.map(r => r.renderer)).size, affectedTargets: new Set(rows.map(r => r.targetId)).size, authoredConsumers: consumers.filter(c => rows.some(r => r.targetKind === "widget_renderer" ? c.surfaceId === r.targetId : c.surfaceId === r.targetId)).length })).sort((a, b) => a.portfolioId.localeCompare(b.portfolioId));

const inputFiles = [join(ROOT, "scripts/audit/graph-figure-labeling-inventory-s252.mts"), ...widgetSourceFiles, ...figureSourceFiles, join(ROOT, "src/components/figureIds.ts"), ...lessonFiles, ...variantsFiles, join(ROOT, "GRAPH_FIGURE_STANDARD.md"), join(ROOT, "GRAPH_RELEASE_GATES_PLAN.md")];
const report = {
  schemaVersion: 1, generatedAt: "deterministic", sourceHash: hashInputs(inputFiles), criteria: "FIGURE_LABELING_PROMPT.md interpreted through repository GRAPH_FIGURE_STANDARD.md; static evidence only",
  scope: { lessonFiles: lessonFiles.length, figureRegistryIds: figureIds.length, graphWidgetTypes: Object.keys(WIDGETS).length, graphFigureIds: figureRenderers.length, widgetRendererDefinitionsResolved: widgetRenderers.filter(w => w.source).length, figureRendererDefinitionsResolved: figureRenderers.filter(f => f.source).length, authoredConsumers: consumers.length, generatorDeclarations: generatorConsumers.length, graphEmittingGenerators: new Set(generatorConsumers.map(g => g.generator)).size },
  consumersBySurfaceKind: countBy(consumers, c => c.surfaceKind), consumersByDisplayType: countBy(consumers, c => c.displayType), consumersByState: countBy(consumers, c => c.state), rendererChecksByStatus: countBy(checks, c => c.status), violationsByRule: countBy(violations, v => v.rule), violationsByDisplayType: countBy(violations, v => v.displayType), violationsBySeverity: countBy(violations, v => v.severity),
  widgetRenderers: widgetRenderers.map(({ source: _source, ...row }) => row), figureRenderers: figureRenderers.map(({ source: _source, ...row }) => row), consumers, generatorConsumers, checks, portfolios
};

if (report.scope.graphWidgetTypes !== 59) throw new Error(`graph widget roster drift: expected normative 59, got ${report.scope.graphWidgetTypes}`);
if (report.scope.figureRegistryIds < 1871) throw new Error(`figure registry drift: expected 1871, got ${report.scope.figureRegistryIds}`);
if (new Set(consumers.map(c => c.consumerId)).size !== consumers.length) throw new Error("consumer IDs are not one-to-one");
if (widgetRenderers.some(w => w.renderer === "UNMAPPED")) throw new Error(`unmapped widget dispatch: ${widgetRenderers.filter(w => w.renderer === "UNMAPPED").map(w => w.type).join(", ")}`);

const violationCsv = csv(violations.map(v => ({ portfolio_id: v.portfolioId, severity: v.severity, display_type: v.displayType, rule: v.rule, target_kind: v.targetKind, target_id: v.targetId, renderer: v.renderer, evidence: v.evidence })));
const portfolioCsv = csv(portfolios.map(p => ({ portfolio_id: p.portfolioId, severity: p.severity, display_type: p.displayType, rule: p.rule, target_kind: p.targetKind, renderer: p.renderer, affected_targets: p.affectedTargets, authored_consumers: p.authoredConsumers })));
const md = `# Graph and figure labeling audit — S252\n\nSource hash: \`${report.sourceHash}\`. Generated deterministically from renderer source, the complete figure registry, authored lessons, and generator declarations. \`REVIEW\` means static proof is impossible; it is not a pass or violation.\n\n## Exact inventory\n\n- ${report.scope.graphWidgetTypes} normative graph/statistical widget types; ${report.scope.widgetRendererDefinitionsResolved} renderer definitions resolved.\n- ${report.scope.figureRegistryIds} total registered figures; ${report.scope.graphFigureIds} graph/statistical figures classified; ${report.scope.figureRendererDefinitionsResolved} renderer definitions resolved.\n- ${report.scope.lessonFiles} lesson files; ${report.scope.authoredConsumers} authored/remedial graph consumers.\n- ${report.scope.graphEmittingGenerators} graph-emitting generator tags; ${report.scope.generatorDeclarations} generator-to-surface declarations.\n- ${checks.length} renderer/rule checks: ${Object.entries(report.rendererChecksByStatus).map(([k,v]) => `${k} ${v}`).join(", ")}.\n- ${violations.length} statically proved violations compressed into ${portfolios.length} root-cause portfolios.\n\n## Violations\n\nBy rule: ${Object.entries(report.violationsByRule).map(([k,v]) => `${k} ${v}`).join(", ") || "none"}.\n\nBy display type: ${Object.entries(report.violationsByDisplayType).map(([k,v]) => `${k} ${v}`).join(", ") || "none"}.\n\nBy severity: ${Object.entries(report.violationsBySeverity).map(([k,v]) => `${k} ${v}`).join(", ") || "none"}.\n\n## Gate\n\nRun \`npx tsx scripts/audit/graph-figure-labeling-inventory-s252.mts --check\`. The gate verifies exact registry/scope floors, one-to-one consumer assignment, renderer dispatch coverage, and byte-for-byte source-current artifacts.\n`;
const outputs = new Map([[JSON_OUT, stable(report)], [VIOLATIONS_OUT, violationCsv], [PORTFOLIOS_OUT, portfolioCsv], [MD_OUT, md]]);
const checking = process.argv.includes("--check");
if (checking) {
  const stale = [...outputs].filter(([file, expected]) => !existsSync(file) || readFileSync(file, "utf8").replaceAll("\r\n", "\n") !== expected.replaceAll("\r\n", "\n")).map(([file]) => posix(relative(ROOT, file)));
  if (stale.length) { console.error(`STALE: ${stale.join(", ")}`); process.exitCode = 1; } else console.log(`PASS graph-labeling S252 source-current (${report.sourceHash.slice(0, 12)}; ${consumers.length} consumers; ${violations.length} violations; ${portfolios.length} portfolios)`);
} else {
  mkdirSync(OUT_DIR, { recursive: true }); for (const [file, content] of outputs) writeFileSync(file, content, "utf8");
  console.log(`WROTE graph-labeling S252 (${consumers.length} consumers; ${figureRenderers.length} graph figures; ${violations.length} violations; ${portfolios.length} portfolios)`);
}
