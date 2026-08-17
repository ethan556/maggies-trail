import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");

const headers = [
  "work_id",
  "priority",
  "priority_score",
  "workstream",
  "status",
  "source",
  "lesson_id",
  "step_path",
  "current_figure_id",
  "learner_harm",
  "frequency",
  "visibility",
  "strategic_importance",
  "mismatch_evidence",
  "next_action"
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function readObjects(file) {
  const text = fs
    .readFileSync(path.join(root, file), "utf8")
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("#"))
    .join("\n");
  const rows = parseCsv(text);
  const [header = [], ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((name, index) => [name, values[index] ?? ""])));
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function cleanId(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function sourceForLesson(lessonId) {
  const coursesRoot = path.join(root, "content", "courses");
  for (const course of fs.readdirSync(coursesRoot, { withFileTypes: true })) {
    if (!course.isDirectory()) continue;
    const candidate = path.join(coursesRoot, course.name, "lessons", `${lessonId}.json`);
    if (fs.existsSync(candidate)) return path.relative(root, candidate).replaceAll(path.sep, "/");
  }
  return "PREMIUM_INTERACTION_PRIORITY.csv";
}

const queue = new Map();
function add(row) {
  if (!row.work_id || queue.has(row.work_id)) return;
  queue.set(row.work_id, Object.fromEntries(headers.map((header) => [header, String(row[header] ?? "")] )));
}

for (const row of readObjects("reports/vis/VIS01_PLACEMENTS.csv")) {
  if (row.cause === "RENDERS") continue;
  add({
    work_id: `VIS-${cleanId(`${row.lesson_id}-${row.step_id}-${row.figure}`)}`,
    priority: "P0",
    priority_score: 500,
    workstream: "ILLUSTRATION_REPLACEMENT",
    status: "OPEN_VISUAL_DISPOSITION_AND_REPLACEMENT",
    source: row.file,
    lesson_id: row.lesson_id,
    step_path: row.path,
    current_figure_id: row.figure,
    learner_harm: 5,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: `${row.cause}: ${row.body}`,
    next_action: "Classify the visual as required, preferred, fading scaffold, or unnecessary; replace any required withheld exemplar with a synchronized, accessible representation."
  });
}

function currentLessons() {
  const records = [];
  const coursesRoot = path.join(root, "content", "courses");
  for (const course of fs.readdirSync(coursesRoot, { withFileTypes: true })) {
    if (!course.isDirectory()) continue;
    const lessonsDir = path.join(coursesRoot, course.name, "lessons");
    if (!fs.existsSync(lessonsDir)) continue;
    for (const file of fs.readdirSync(lessonsDir).filter((name) => name.endsWith(".json")).sort()) {
      const absolute = path.join(lessonsDir, file);
      const lesson = JSON.parse(fs.readFileSync(absolute, "utf8"));
      records.push({
        courseId: course.name,
        lesson,
        lessonId: lesson.id ?? file.replace(/\.json$/, ""),
        source: path.relative(root, absolute).replaceAll(path.sep, "/")
      });
    }
  }
  return records.sort((a, b) => a.lessonId.localeCompare(b.lessonId));
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

let index = 0;
const mathPresentationIndexes = [
  "MATH_MACHINE_EXPRESSION_LEAK_INDEX.csv",
  "MATH_SYMBOLIC_DISPLAY_INDEX.csv",
  "MATH_FRACTION_DISPLAY_INDEX.csv",
  "MATH_CANONICAL_FORM_INDEX.csv",
  "MATH_CONSTANT_ORDER_INDEX.csv",
  "MATH_DERIVATIVE_NOTATION_INDEX.csv",
  "MATH_INTEGRAL_NOTATION_INDEX.csv",
  "MATH_UNIT_NOTATION_INDEX.csv",
  "MATH_DECIMAL_FRACTION_POLICY_INDEX.csv"
];
for (const file of mathPresentationIndexes) {
  for (const row of readObjects(`reports/math-presentation/${file}`)) {
    index += 1;
    const critical = file === "MATH_MACHINE_EXPRESSION_LEAK_INDEX.csv";
    add({
      work_id: `MATH-${String(index).padStart(5, "0")}`,
      priority: critical ? "P0" : "P1",
      priority_score: critical ? 500 : 360,
      workstream: "MATH_PRESENTATION_RESIDUE",
      status: "OPEN_RENDERED_BOUNDARY_REVIEW",
      source: row.source === "authored" ? sourceForLesson(row.owner) : `generator:${row.owner}`,
      lesson_id: row.source === "authored" ? row.owner : "",
      step_path: `${row.unit}.${row.field}`,
      learner_harm: critical ? 5 : 3,
      frequency: 1,
      visibility: 5,
      strategic_importance: 5,
      mismatch_evidence: `${file}:${row.shape}:${row.residue || row.text}`,
      next_action: "Review the learner-visible residue at the real renderer boundary; repair the shared parser or structured semantic source, then verify visual and screen-reader output."
    });
  }
}

const liveMcqGroups = new Map();
for (const row of readObjects("reports/mcq/MCQ_LEAKAGE_INDEX.csv")) {
  const key = [row.source, row.owner, row.unit, row.path].join("::");
  const group = liveMcqGroups.get(key) ?? { ...row, tells: [] };
  group.tells.push(`${row.tell}:${row.detail}`);
  liveMcqGroups.set(key, group);
}
index = 0;
for (const row of [...liveMcqGroups.values()].sort((a, b) =>
  [a.source, a.owner, a.unit, a.path].join("::").localeCompare([b.source, b.owner, b.unit, b.path].join("::"))
)) {
  index += 1;
  add({
    work_id: `CHOICE-${String(index).padStart(4, "0")}`,
    priority: "P1",
    priority_score: 400,
    workstream: "CHOICE_SURFACE_INTEGRITY",
    status: "OPEN_STEM_OPTION_AND_VISUAL_REVIEW",
    source: row.source === "authored" ? row.path : `generator:${row.owner}`,
    lesson_id: row.source === "authored" ? row.owner : "",
    step_path: row.unit,
    learner_harm: 4,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: `${row.tells.join(" | ")}: ${row.prompt}`,
    next_action: "Review the complete semantic item; keep one defensible answer, misconception-based parallel options, no writing clue, and a synchronized visual whenever the representation carries the mathematics."
  });
}

index = 0;
/* S242 — read the RULED file, and check the gate is still there before queuing work on it.
 *
 * This block used to read `PREDICTION_GATE_AUDIT.csv` and queue every `decision === "REMOVE"` row,
 * which produced a fixed 200. Two things were wrong with that. First, that file is the
 * PRE-adjudication baseline; `PREMIUM_EXPERIENCE_CONTRACT.md` rule 5 says outright that it "is
 * superseded — retained only as a historical artifact", and the ruled verdicts live in
 * `PREDICTION_GATE_ADJUDICATION.csv` (REMOVE 17 / REWRITE 200 / KEEP 1145, not REMOVE 200).
 * Second, and worse, the count was derived from a CSV rather than from the corpus, so it could not
 * fall as the work landed. WS-E Phase 4 shipped: measured on this seal, all 17 REMOVE gates are
 * absent from source, all 200 REWRITE gates are present with changed reveals, 51 KEEP rows were
 * additionally thinned, and 1,362 − 17 − 51 = 1,294 live gates remain. The queue still advertised
 * 200 rows of finished work.
 *
 * Now a row is emitted only for a gate the adjudication ruled REMOVE that is STILL PRESENT in
 * `content/courses`. That makes the number self-correcting in both directions: it reaches 0 when
 * the purge is complete, and it comes back if a removed gate is ever reintroduced. */
const livePredictionGates = new Set();
{
  const coursesDir = path.join(root, "content", "courses");
  const walk = (node, lessonId) => {
    if (Array.isArray(node)) {
      for (const v of node) walk(v, lessonId);
    } else if (node && typeof node === "object") {
      if (node.predict && typeof node.predict === "object" && "outcomeId" in node.predict) {
        livePredictionGates.add(`${lessonId}::${node.id}`);
      }
      for (const v of Object.values(node)) walk(v, lessonId);
    }
  };
  for (const course of fs.readdirSync(coursesDir)) {
    const dir = path.join(coursesDir, course, "lessons");
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      const lesson = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      walk(lesson, lesson.id);
    }
  }
}

for (const row of readObjects("PREDICTION_GATE_ADJUDICATION.csv")) {
  if (row.proposed_verdict !== "REMOVE") continue;
  if (!livePredictionGates.has(`${row.lesson_id}::${row.step_id}`)) continue; // already purged
  index += 1;
  add({
    work_id: `PRED-${String(index).padStart(4, "0")}`,
    priority: "P1",
    priority_score: 240,
    workstream: "PREDICTION_GATE_REVIEW",
    status: "OPEN_REMOVE_OR_REDESIGN",
    source: row.source,
    lesson_id: row.lesson_id,
    step_path: `steps.${row.step_id}`,
    learner_harm: 3,
    frequency: 1,
    visibility: 4,
    strategic_importance: 4,
    // The ruled file names these columns differently from the superseded audit
    // (`predict_prompt` / `adjudicator_notes`, not `prompt` / `reason`).
    mismatch_evidence: `${row.adjudicator_notes || row.old_reason}: ${row.predict_prompt}`,
    next_action: "Remove the duplicated/non-causal prediction gate or redesign it as a genuine ungraded prediction-to-action-to-reveal loop."
  });
}

for (const row of readObjects("PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv")) {
  if (row.exploration_decision === "KEEP_WITH_EXPLORATION_REGRESSION") continue;
  const remediate = row.exploration_decision === "REMEDIATE_ENGINE_PLAY";
  const frequency = Math.max(1, Number(row.authored_uses) || 1);
  add({
    work_id: `ENG-${cleanId(row.widget_type)}`,
    priority: remediate ? "P1" : "P2",
    priority_score: (remediate ? 4 : 2) * frequency * 5 * 5,
    workstream: remediate ? "ENGINE_REVERSIBLE_PLAY" : "ENGINE_DISPOSITION_REVIEW",
    status: remediate ? "OPEN_ENGINE_REMEDIATION" : "OPEN_DISPOSITION_REVIEW",
    source: "src/components/widgets.tsx",
    step_path: row.widget_type,
    learner_harm: remediate ? 4 : 2,
    frequency,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: `${row.reversible_manipulation}:${row.authored_domain}:${row.exploration_decision}`,
    next_action: row.next_action
  });
}

for (const row of readObjects("PREMIUM_INTERACTION_PRIORITY.csv")) {
  if (!row.decision.startsWith("AUDIT")) continue;
  add({
    work_id: `INT-${cleanId(row.lesson)}`,
    priority: "P1",
    priority_score: Number(row.priority) || 200,
    workstream: "INTERACTION_NECESSITY_REVIEW",
    status: `OPEN_${row.decision}`,
    source: sourceForLesson(row.lesson),
    lesson_id: row.lesson,
    step_path: row.concept,
    learner_harm: 3,
    frequency: 1,
    visibility: 4,
    strategic_importance: 4,
    mismatch_evidence: row.justification,
    next_action: `Audit the proposed ${row["candidate existing engine"]} use; implement only when it adds a new causal relationship and preserves learner judgment.`
  });
}

// V4 extends the existing queue with complete lesson-level dispositions rather than creating a
// competing tracker. These rows are intentionally open until a calibrated semantic review closes
// them with evidence from the same candidate build.
const lessons = currentLessons();
const curriculumSeal = createHash("sha256")
  .update(lessons.map(({ source }) => `${source}\0${fs.readFileSync(path.join(root, source), "utf8")}\0`).join(""))
  .digest("hex");
for (const record of lessons) {
  const { lesson, lessonId, source } = record;
  add({
    work_id: `LESSON-${lessonId}`,
    priority: "P1",
    priority_score: 300,
    workstream: "LESSON_COMPLETE_DISPOSITION",
    status: "OPEN_KEEP_REVISE_ESCALATE_DISPOSITION",
    source,
    lesson_id: lessonId,
    step_path: "lesson",
    learner_harm: 3,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: "V4 requires one evidence-backed KEEP, REVISE, or ESCALATE disposition per lesson.",
    next_action: "Review the complete lesson interaction, question-job progression, feedback truth, visual purpose, language fit, challenge demand, and deployment evidence."
  });
  add({
    work_id: `VISUAL-DISPOSITION-${lessonId}`,
    priority: "P1",
    priority_score: 320,
    workstream: "VISUAL_FIRST_REPRESENTATION",
    status: "OPEN_VISUAL_REQUIRED_PREFERRED_SUFFICIENT_DECISION",
    source,
    lesson_id: lessonId,
    step_path: "lesson",
    learner_harm: 3,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: "No calibrated lesson-level V4 visual-opportunity disposition is recorded.",
    next_action: "Classify the lesson and each concept/question medium; prove every required visual is meaningful, synchronized, visible, and accessibly equivalent."
  });
  add({
    work_id: `LANGUAGE-${lessonId}`,
    priority: "P1",
    priority_score: 300,
    workstream: "GRADE_LANGUAGE_REVIEW",
    status: "OPEN_GRADE_BAND_LANGUAGE_REVIEW",
    source,
    lesson_id: lessonId,
    step_path: "lesson",
    learner_harm: 3,
    frequency: 1,
    visibility: 5,
    strategic_importance: 4,
    mismatch_evidence: "V4 language review is not yet attached across prompts, options, hints, feedback, narration, and generated surfaces.",
    next_action: "Review clarity, naturalness, sentence and clause load, referents, vocabulary introduction, and read-aloud fit for the intended grade without diluting mathematics."
  });

  const widgets = (lesson.steps ?? []).filter((step) => step?.widget).map((step) => ({
    id: step.id ?? "",
    signature: stable(step.widget),
    prompt: String(step.widget?.prompt ?? "").trim()
  }));
  const repeatedWidgets = [...new Set(widgets.filter((item, i) =>
    widgets.findIndex((candidate) => candidate.signature === item.signature) !== i
  ).map((item) => item.id))];
  const repeatedPrompts = [...new Set(widgets.filter((item, i) => item.prompt &&
    widgets.findIndex((candidate) => candidate.prompt === item.prompt) !== i
  ).map((item) => item.id))];
  const normalized = widgets.map((item) => ({
    ...item,
    template: item.prompt.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ")
  }));
  const repeatedTemplates = [...new Set(normalized.filter((item, i) => item.template &&
    normalized.findIndex((candidate) => candidate.template === item.template) !== i
  ).map((item) => item.id))];
  if (repeatedWidgets.length || repeatedPrompts.length || repeatedTemplates.length) {
    add({
      work_id: `PROGRESSION-${lessonId}`,
      priority: repeatedWidgets.length || repeatedPrompts.length ? "P0" : "P1",
      priority_score: repeatedWidgets.length || repeatedPrompts.length ? 450 : 330,
      workstream: "LESSON_PROGRESSION_AND_DUPLICATION",
      status: "OPEN_REPEAT_PURPOSE_OR_REDESIGN",
      source,
      lesson_id: lessonId,
      step_path: [...new Set([...repeatedWidgets, ...repeatedPrompts, ...repeatedTemplates])].join(" "),
      learner_harm: repeatedWidgets.length || repeatedPrompts.length ? 4 : 3,
      frequency: 1,
      visibility: 5,
      strategic_importance: 5,
      mismatch_evidence: `duplicate-widgets=[${repeatedWidgets.join(",")}]; exact-prompts=[${repeatedPrompts.join(",")}]; number-normalized-prompts=[${repeatedTemplates.join(",")}]`,
      next_action: "Assign question jobs and approve a fluency/retrieval rationale or replace the repeat with a different action, representation, misconception, constraint, or transfer demand."
    });
  }
}

for (const row of readObjects("EXCELLENCE_BACKLOG_S126.csv")) {
  add({
    work_id: `EXCELLENCE-${row.lessonId}`,
    priority: "P0",
    priority_score: 470,
    workstream: "QUESTION_DIVERSITY_AND_TRANSFER",
    status: "OPEN_REPRESENTATION_NOVELTY",
    source: row.sourcePath,
    lesson_id: row.lessonId,
    step_path: "assessed sequence",
    learner_harm: 4,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: `${row.candidateDisposition}: ${row.classificationScoreGaps}`,
    next_action: row.candidateEngineOrExtension
  });
}

const standards = JSON.parse(
  fs.readFileSync(path.join(root, "content", "standards", "evidence-dossiers.json"), "utf8")
).dossiers;
for (const dossier of standards) {
  if (dossier.review?.status === "approved" || dossier.review?.status === "rejected") continue;
  add({
    work_id: `STANDARD-${dossier.edgeId}`,
    priority: "P1",
    priority_score: 340,
    workstream: "STANDARDS_VERIFICATION",
    status: "OPEN_EXACT_BENCHMARK_AND_EVIDENCE_REVIEW",
    source: `content/standards/evidence-dossiers.json#${dossier.edgeId}`,
    lesson_id: (dossier.evidenceSummary?.lessonIds ?? []).join(" "),
    step_path: dossier.objectiveId,
    learner_harm: 3,
    frequency: 1,
    visibility: 4,
    strategic_importance: 5,
    mismatch_evidence: `${dossier.candidateCode}: ${dossier.sourceTextStatus}; ${dossier.claimLimit}`,
    next_action: "Verify official wording and full intent, then approve, reject, or mark partial with concept teaching and independent learner evidence tied to the exact source."
  });
}

const ledgerLines = fs.readFileSync(path.join(root, "CLOSURE_LEDGER.md"), "utf8").split(/\r?\n/);
const latestLedgerRows = new Map();
for (const line of ledgerLines) {
  if (!/^\|\s*CL-P[01]-\d+\s*\|/.test(line)) continue;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  latestLedgerRows.set(cells[0], cells);
}
for (const [id, cells] of latestLedgerRows) {
  const statusIndex = cells.findIndex((cell) => /OPEN|CLOSED/.test(cell));
  if (statusIndex < 0 || !/OPEN/.test(cells[statusIndex])) continue;
  const priority = cells[1] === "P0" ? "P0" : "P1";
  const longRow = cells.length >= 9;
  const nextAction = longRow ? cells[statusIndex - 1] : cells[statusIndex + 1];
  add({
    work_id: `LEDGER-${id}`,
    priority,
    priority_score: priority === "P0" ? 500 : 400,
    workstream: "CLOSURE_LEDGER",
    status: cells[statusIndex].replaceAll("*", ""),
    source: "CLOSURE_LEDGER.md",
    step_path: cells[2] ?? "",
    learner_harm: priority === "P0" ? 5 : 4,
    frequency: 1,
    visibility: 4,
    strategic_importance: 5,
    mismatch_evidence: cells[3] ?? "",
    next_action: nextAction ?? "Resolve the current ledger reopen condition with current-source evidence."
  });
}

const phases = [
  ["0", "Evidence and deployment parity", "Freeze the candidate, deploy it, and bind browser evidence to the exact commit and content hashes."],
  ["1", "Complete curriculum disposition", "Close every lesson, visual, language, repetition, question-job, and standards disposition with calibrated evidence."],
  ["2", "Semantic correctness", "Prove target, model, evaluator, feedback, reveal, accessible description, title and objective agreement by high-risk family."],
  ["3", "Visual-first and question-diversity canaries", "Pass bounded representative lesson and generator canaries before scaling each family contract."],
  ["4", "Presentation and bounded queue closure", "Close live renderer residues, choice clues, withheld illustrations, interactions, language and standards in root-cause batches."],
  ["5", "Generator and family assurance", "Run risk-based properties, unseen seeds, collision checks, qualitative review and transitive consumer reopening."],
  ["6", "Cross-band journeys and release", "Verify representative deployed journeys, accessibility, responsive states, exact standards evidence and production parity."]
];
for (const [phase, title, nextAction] of phases) {
  add({
    work_id: `V4-PHASE-${phase}`,
    priority: phase === "0" || phase === "2" || phase === "3" ? "P0" : "P1",
    priority_score: phase === "0" || phase === "2" || phase === "3" ? 500 : 350,
    workstream: "V4_PROGRAMME_PHASE",
    status: "OPEN_PROGRAMME_PHASE",
    source: "MAGGIE’S TRAIL — MATHS CONTENT EXCELLENCE PROGRAM V4",
    step_path: `Phase ${phase}: ${title}`,
    learner_harm: phase === "0" || phase === "2" || phase === "3" ? 5 : 4,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: "V4 programme-level closure gate; detailed child rows are in this same queue.",
    next_action: nextAction
  });
}

const priorityOrder = new Map([["P0", 0], ["P1", 1], ["P2", 2]]);
const rows = [...queue.values()].sort((a, b) =>
  (priorityOrder.get(a.priority) ?? 9) - (priorityOrder.get(b.priority) ?? 9) ||
  Number(b.priority_score) - Number(a.priority_score) ||
  a.work_id.localeCompare(b.work_id)
);

fs.writeFileSync(queuePath, `${headers.join(",")}\n${rows.map((row) => headers.map((header) => csv(row[header])).join(",")).join("\n")}\n`);

const counts = new Map();
for (const row of rows) counts.set(row.workstream, (counts.get(row.workstream) ?? 0) + 1);
const summary = [
  "# Maggie's Trail V4 consolidated pending workload — live derived view",
  "",
  `Generated from current source on ${new Date().toISOString().slice(0, 10)}.`,
  `Curriculum source seal: \`${curriculumSeal}\`.`,
  "",
  `- Total open rows: **${rows.length.toLocaleString("en-US")}**`,
  `- P0 rows: **${rows.filter((row) => row.priority === "P0").length.toLocaleString("en-US")}**`,
  `- P1 rows: **${rows.filter((row) => row.priority === "P1").length.toLocaleString("en-US")}**`,
  `- P2 rows: **${rows.filter((row) => row.priority === "P2").length.toLocaleString("en-US")}**`,
  "",
  "## Workstreams",
  "",
  "| Workstream | Open rows |",
  "|---|---:|",
  ...[...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => `| ${name} | ${count.toLocaleString("en-US")} |`),
  "",
  "## Queue contract",
  "",
  "- Detailed deterministic inventories are retained row by row; program and ledger rows are explicit umbrellas, not substitutes for the child work.",
  "- A queued row is not a completed fix. Suppressed illustrations remain open until a concept-accurate visual and accessible description are verified.",
  "- Curriculum mathematics, grading truth and misconception feedback must not change without lesson-level evidence.",
  "- Regenerate with `npm run audit:pending-workload` after any source audit or ledger status changes.",
  ""
].join("\n");
fs.writeFileSync(path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md"), summary);

console.log(JSON.stringify({ total: rows.length, byWorkstream: Object.fromEntries(counts) }, null, 2));
