#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const lessonPaths = [
  "content/courses/area-surface-volume/lessons/asv-01-02.json",
  "content/courses/area-surface-volume/lessons/asv-02-03.json"
];
const errors = [];
const pieceArea = (piece) => piece.shape === "rectangle" ? piece.width * piece.height
  : piece.shape === "triangle" ? piece.base * piece.height / 2
    : piece.shape === "parallelogram" ? piece.base * piece.height
      : piece.area;
const target = (widget) => widget.target.kind === "piece"
  ? pieceArea(widget.pieces.find((piece) => piece.id === widget.target.pieceId))
  : widget.pieces.reduce((sum, piece) => sum + (piece.operation === "subtract" ? -1 : 1) * pieceArea(piece), 0);
const correct = (widget, choice) => Math.abs(choice.value - target(widget)) <= 1e-9;
const expected = new Map(Object.entries({
  "asv-01-02/i1": 45, "asv-01-02/k1": 24, "asv-01-02/k2": 18,
  "asv-01-02/i2": 12, "asv-01-02/k3": 32, "asv-01-02/ch1": 50,
  "asv-01-02/rem-qa-k": 16,
  "asv-02-03/i1": 46, "asv-02-03/k1": 36, "asv-02-03/k2": 41,
  "asv-02-03/i2": 153, "asv-02-03/ch1": 79, "asv-02-03/rem-cm-k": 21
}));
const rows = [];
const declarations = [];
for (const lessonPath of lessonPaths) {
  const lesson = JSON.parse(readFileSync(join(root, lessonPath), "utf8"));
  for (const step of lesson.steps) {
    if (step.variant?.gen === "composite-area-lab") declarations.push(`${lesson.id}/${step.id}:${step.variant.form ?? "default"}`);
    if (step.widget?.type === "compositeAreaLab") rows.push({ lessonId: lesson.id, id: step.id, remedial: false, widget: step.widget });
  }
  for (const route of lesson.remedials ?? []) {
    if (route.check.widget?.type === "compositeAreaLab") rows.push({ lessonId: lesson.id, id: route.check.id, remedial: true, widget: route.check.widget });
  }
}
if (rows.length !== 13) errors.push(`expected 13 fixed compositeAreaLab experiences, found ${rows.length}`);
const sceneCounts = Object.groupBy(rows, (row) => row.widget.scene);
if ((sceneCounts["parallelogram-rearrange"]?.length ?? 0) !== 2) errors.push("expected 2 parallelogram-rearrange experiences");
if ((sceneCounts["trapezoid-diagonal"]?.length ?? 0) !== 4) errors.push("expected 4 trapezoid-diagonal experiences");
if ((sceneCounts["piece-ledger"]?.length ?? 0) !== 7) errors.push("expected 7 piece-ledger experiences");
for (const row of rows) {
  const key = `${row.lessonId}/${row.id}`;
  const derived = target(row.widget);
  if (derived !== expected.get(key)) errors.push(`${key}: derived ${derived} != frozen ${expected.get(key)}`);
  const right = row.widget.choices.filter((choice) => correct(row.widget, choice));
  if (right.length !== 1) errors.push(`${key}: expected exactly one correct claim, found ${right.length}`);
  const wrong = row.widget.choices.filter((choice) => !correct(row.widget, choice));
  if (wrong.length < 2) errors.push(`${key}: fewer than two reachable misconception claims`);
  if (new Set(row.widget.choices.map((choice) => choice.value)).size !== row.widget.choices.length) errors.push(`${key}: duplicate claim values`);
  if (wrong.some((choice) => typeof choice.feedback !== "string" || choice.feedback.length < 20)) errors.push(`${key}: missing/weak misconception feedback`);
  if (row.widget.target.kind === "piece" && !row.widget.pieces.some((piece) => piece.id === row.widget.target.pieceId)) errors.push(`${key}: target piece missing`);
}
const expectedDeclarations = [
  "asv-01-02/k1:parallelogramMcq", "asv-01-02/k2:trapezoid", "asv-01-02/k3:fromTriangles", "asv-01-02/ch1:trapezoid",
  "asv-02-03/k1:default", "asv-02-03/k2:threeRects", "asv-02-03/ch1:fourPieces"
];
for (const declaration of expectedDeclarations) if (!declarations.includes(declaration)) errors.push(`missing variant declaration ${declaration}`);
if (declarations.length !== expectedDeclarations.length) errors.push(`expected ${expectedDeclarations.length} declarations, found ${declarations.length}`);
const variants = readFileSync(join(root, "src/lib/variants.ts"), "utf8");
for (const needle of ['tag: "composite-area-lab"', 'form === "parallelogramMcq"', 'form === "trapezoid"', 'form === "fromTriangles"', 'form === "threeRects"', 'form === "fourPieces"']) {
  if (!variants.includes(needle)) errors.push(`variant source missing ${needle}`);
}
const productState = JSON.parse(readFileSync(join(root, "PRODUCT_STATE.json"), "utf8"));
const excellence = JSON.parse(readFileSync(join(root, "EXCELLENCE_BACKLOG_S126.json"), "utf8"));
const liveIds = new Set((excellence.records ?? []).map((row) => row.lessonId));
for (const completed of ["asv-01-02", "asv-02-03"]) if (liveIds.has(completed)) errors.push(`${completed}: still present in live C/D excellence queue`);
const tierCounts = productState.flagshipTiers ?? {};
if ((tierCounts.B ?? 0) < 214 || (tierCounts.D ?? Infinity) > 26) errors.push(`tier non-regression failed: ${JSON.stringify(tierCounts)}`);
if ((excellence.summary?.liveK8Backlog ?? 9999) > 51) errors.push("live excellence queue regressed above 51");
const capabilities = JSON.parse(readFileSync(join(root, "scripts/engine-capabilities.json"), "utf8"));
const registration = {
  schema: readFileSync(join(root, "src/lib/schema.ts"), "utf8").includes('type: z.literal("compositeAreaLab")'),
  evaluator: readFileSync(join(root, "src/lib/evaluate.ts"), "utf8").includes('case "compositeAreaLab"'),
  pedagogy: readFileSync(join(root, "src/lib/pedagogy.ts"), "utf8").includes('case "compositeAreaLab"'),
  renderer: readFileSync(join(root, "src/components/widgets.tsx"), "utf8").includes('case "compositeAreaLab"'),
  narration: readFileSync(join(root, "src/lib/describeState.ts"), "utf8").includes('case "compositeAreaLab"'),
  stageWidth: readFileSync(join(root, "src/components/stageWidth.ts"), "utf8").includes('compositeAreaLab: "wide"'),
  sample: readFileSync(join(root, "src/components/widgetSamples.ts"), "utf8").includes('type: "compositeAreaLab"'),
  capabilities: Boolean(capabilities.types?.compositeAreaLab)
};
for (const [surface, present] of Object.entries(registration)) if (!present) errors.push(`registration surface missing: ${surface}`);
if (capabilities.types?.compositeAreaLab?.adapt !== 3) errors.push("capability adapt must remain 3 only with process-signal tests");
if (errors.length) {
  console.error(`Session 136 composite-area audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const report = {
  session: 136,
  baselineSession: 135,
  lessons: lessonPaths,
  fixedExperiences: rows.length,
  remedialExperiences: rows.filter((row) => row.remedial).length,
  scenes: Object.fromEntries(Object.entries(sceneCounts).map(([scene, group]) => [scene, group.length])),
  variantDeclarations: expectedDeclarations,
  registry: registration,
  experiences: rows.map(({ lessonId, id, remedial, widget }) => ({
    lessonId, id, remedial, scene: widget.scene, pieces: widget.pieces.length,
    targetKind: widget.target.kind, derivedArea: target(widget),
    correct: widget.choices.find((choice) => correct(widget, choice)).label,
    wrongPaths: widget.choices.filter((choice) => !correct(widget, choice)).length
  })),
  lessonSha256: Object.fromEntries(lessonPaths.map((path) => [path, createHash("sha256").update(readFileSync(join(root, path))).digest("hex")]))
};
writeFileSync(join(root, "COMPOSITE_AREA_S136.json"), JSON.stringify(report, null, 2) + "\n");
const table = report.experiences.map((row) => `| ${row.lessonId} | ${row.id} | ${row.remedial ? "yes" : "no"} | ${row.scene} | ${row.pieces} | ${row.targetKind} | ${row.derivedArea} | ${row.wrongPaths} |`).join("\n");
writeFileSync(join(root, "COMPOSITE_AREA_S136.md"), `# Session 136 — Composite area laboratory\n\nA single deterministic signed-piece model now connects rearrangement, decomposition, piece-area calculation, and add/subtract composition. The geometry, grading, narration, reveal, and misconception paths share the same derived target.\n\n| lesson | experience | remedial | scene | pieces | target | derived area | wrong paths |\n|---|---|---|---|---:|---|---:|---:|\n${table}\n\n- Fixed experiences: **${report.fixedExperiences}**\n- Remedial experiences on the same causal surface: **${report.remedialExperiences}**\n- Seeded variant declarations preserved: **${expectedDeclarations.length}**\n- Registration surfaces checked: **${Object.keys(registration).length}/${Object.keys(registration).length}**\n`, "utf8");
console.log(`composite-area-s136: ${rows.length}/13 experiences; ${expectedDeclarations.length}/7 variants; registration ${Object.keys(registration).length}/${Object.keys(registration).length}`);
