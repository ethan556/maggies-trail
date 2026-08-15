import fs from "node:fs";
import path from "node:path";

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
  const rows = parseCsv(fs.readFileSync(path.join(root, file), "utf8"));
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

for (const row of readObjects("PREMIUM_PENDING_WORKLOAD_QUEUE.csv")) {
  if (row.workstream === "ILLUSTRATION_REPLACEMENT") add(row);
}

let index = 0;
for (const row of readObjects("MATH_TYPESETTING_AUDIT.csv")) {
  if (row.ascii_notation_risk !== "yes") continue;
  index += 1;
  const visibility = row.classification === "A" ? 5 : row.classification === "B" ? 4 : 3;
  add({
    work_id: `TEX-${String(index).padStart(5, "0")}`,
    priority: "P1",
    priority_score: 3 * visibility * 5,
    workstream: "MATH_TYPESETTING",
    status: "OPEN_CONVERSION_REVIEW",
    source: row.source,
    lesson_id: row.lesson_id,
    step_path: row.json_path,
    learner_harm: 3,
    frequency: 1,
    visibility,
    strategic_importance: 5,
    mismatch_evidence: `ASCII_NOTATION_RISK:${row.action}:${row.text}`,
    next_action: row.action === "DISPLAY_MATH"
      ? "Convert the learner-visible expression through the canonical KaTeX/MathML display path and verify screen-reader parity."
      : "Convert the learner-visible expression through the canonical inline KaTeX/MathML path and verify surrounding prose remains natural."
  });
}

index = 0;
for (const row of readObjects("MCQ_DISTRACTOR_AUDIT.csv")) {
  if (row.decision !== "REMEDIATE") continue;
  index += 1;
  add({
    work_id: `MCQ-${String(index).padStart(4, "0")}`,
    priority: "P1",
    priority_score: 320,
    workstream: "MCQ_DISTRACTOR_REVIEW",
    status: "OPEN_HUMAN_REVIEW",
    source: row.source,
    lesson_id: row.lesson_id,
    step_path: `${row.remedial === "yes" ? "remedial" : "steps"}.${row.step_id}`,
    learner_harm: 4,
    frequency: 1,
    visibility: 4,
    strategic_importance: 5,
    mismatch_evidence: `BLIND_GUESS_${row.blind_guess_test}:longest=${row.longest_option_leak}:punctuation=${row.punctuation_leak}:unmapped=${row.unmapped_distractors}: ${row.prompt}`,
    next_action: "Human-review the option set; remove keyed-label leakage while preserving the mathematical judgment, misconception distractors, correct marker, and feedback."
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

const waves = [
  ["C", "MCQ distractor remediation", "Continue the 572-row human-review queue by learner harm and repeated-family leverage."],
  ["D", "Prediction rationalization", "Disposition the 200 non-causal or duplicated prediction gates."],
  ["E", "Visual rebuild and scaling", "Create concept-accurate replacements for every withheld illustration and repair remaining responsive figure defects."],
  ["F", "Direct manipulation", "Remediate the prioritized lessons and engine families where manipulation remains answer-only or one-way."],
  ["G", "Engine polish", "Finish touch, keyboard, state-description, error-model and reversible-play gaps by engine priority."],
  ["H", "Grade-aware maturity", "Verify that instructions, density and scaffolding match each learner grade band."],
  ["I", "Responsive, accessibility and performance hardening", "Run real-device, assistive-technology, zoom, motion and performance gates."],
  ["J", "Final comparison and closure", "Repeat the premium comparison matrix, resolve remaining reopen conditions and seal the final release artifact."]
];
for (const [wave, title, nextAction] of waves) {
  add({
    work_id: `PLAN-WAVE-${wave}`,
    priority: wave === "C" || wave === "E" || wave === "F" ? "P0" : "P1",
    priority_score: wave === "C" || wave === "E" || wave === "F" ? 500 : 350,
    workstream: "PREMIUM_REBUILD_WAVE",
    status: "OPEN_PROGRAM_WAVE",
    source: "PREMIUM_REBUILD_PLAN.md",
    step_path: `Wave ${wave}: ${title}`,
    learner_harm: wave === "C" || wave === "E" || wave === "F" ? 5 : 4,
    frequency: 1,
    visibility: 5,
    strategic_importance: 5,
    mismatch_evidence: "Program-level completion gate; detailed child rows are included in this queue where a deterministic inventory exists.",
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
  "# Consolidated pending workload — S236",
  "",
  `Generated from current source on ${new Date().toISOString().slice(0, 10)}.`,
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
