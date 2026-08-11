#!/usr/bin/env node
/**
 * S237 — deterministic re-check of the 19 non-CLEAN rows in
 * PREMIUM_ENGINE_LEARNER_FOCUS_AUDIT_S237.csv.
 *
 * WHY THIS IS A SCRIPT AND NOT A SECOND OPINION.
 * The handover's standing warning is that a session must not grade its own work, and its
 * second lesson is that the original audit is a list of CANDIDATES, not findings. Re-running a
 * judgement pass over 127 engines would violate both: the same reasoning that produced a fix
 * would decide whether the fix worked, and every borderline call would be silently re-litigated.
 *
 * So this file does not judge anything. Each probe restates ONE falsifiable claim the original
 * audit made — a specific string, at a specific site, reaching a specific channel — and asks
 * whether that exact construct still exists in current source. A probe can only answer PRESENT or
 * GONE. Whether PRESENT is acceptable is a human call. areaModel was carried as "OPEN" —
 * probed but never scored — for exactly as long as it was unruled; the S237 house ruling
 * ("invariant" is banned as a word on an active screen, not merely as a panel) settled it, so
 * its probe now scores like the rest. "OPEN" stays in the vocabulary for the next open question.
 *
 * A probe that greps a bare phrase would also match the explanatory comments the fixes left
 * behind — which is precisely how a fix can look undone, or an unfixed leak can look repaired.
 * `stripComments` removes // and block comments before matching, so every hit below is code.
 *
 *   node scripts/audit/learner-focus-recheck-s237.mjs          # table
 *   node scripts/audit/learner-focus-recheck-s237.mjs --csv    # PREMIUM_ENGINE_LEARNER_FOCUS_RECHECK_S237.csv
 *
 * Exit code is 0 unless a probe is malformed. This is an audit, not a gate: it reports the
 * state of the world and lets the ledger decide.
 */
import { readFileSync, writeFileSync } from "node:fs";

const WIDGETS = "src/components/widgets.tsx";
const DESCRIBE = "src/lib/describeState.ts";

/** Comments are not learner surfaces. Strip them so a fix's own explanation cannot register as
 *  the defect it describes — c7df15d's comment quotes the exact clause it deleted. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

const SRC = {
  [WIDGETS]: stripComments(readFileSync(WIDGETS, "utf8")),
  [DESCRIBE]: stripComments(readFileSync(DESCRIBE, "utf8")),
};

/**
 * probes: { engine, claim, file, re, expect }
 *   expect: "GONE"    the original audit's defect; the fix should have removed it
 *           "MAPPED"  the raw token should now reach the screen only through a human-label map
 *           "OPEN"    recorded but never claimed fixed — probe documents that it is still there
 */
const PROBES = [
  // ---- affineRelationshipLab (AUTHORING_LABEL) ----
  { engine: "affineRelationshipLab", claim: '"required before grading" counter', file: WIDGETS, re: /required before grading/, expect: "GONE" },
  { engine: "affineRelationshipLab", claim: "raw sourceKind enum rendered as a visible label", file: WIDGETS, re: /\{line\.label\}\s*·\s*\{line\.sourceKind\}/, expect: "GONE" },
  { engine: "affineRelationshipLab", claim: 'description opens with the engine name "Affine relationship lab."', file: DESCRIBE, re: /`Affine relationship lab\./, expect: "GONE" },

  // ---- areaModel (UNCERTAIN — the original audit declined to rule; so does this) ----
  { engine: "areaModel", claim: '"stays invariant" caption on the active screen', file: WIDGETS, re: /stays invariant/, expect: "GONE" },

  // ---- conditionalTableLab (RAW_STATE_TOKEN) ----
  { engine: "conditionalTableLab", claim: "condition/cell raw enums spoken in the description", file: DESCRIBE, re: /The selected condition is \$\{condition\};/, expect: "GONE" },
  { engine: "conditionalTableLab", claim: "requiredSwitches quota on the active screen", file: WIDGETS, re: /Condition changes recorded: \{[^}]*\}\/\{spec\.requiredSwitches\}/, expect: "GONE" },

  // ---- equationOutcomeLab (PROCESS_TELEMETRY) ----
  { engine: "equationOutcomeLab", claim: '"required before grading" in transform mode', file: WIDGETS, re: /required before grading/, expect: "GONE" },
  { engine: "equationOutcomeLab", claim: "raw outcome token spoken ungated in classify mode", file: DESCRIBE, re: /Normalized outcome \$\{equationOutcomeTruth\(spec\)\}/, expect: "MAPPED" },

  // ---- exactNumberLab (AUTHORING_LABEL) ----
  { engine: "exactNumberLab", claim: '"Task: {enum}" on the active screen', file: WIDGETS, re: /Task: \{spec\.task/, expect: "GONE" },
  { engine: "exactNumberLab", claim: "raw task enum leading the description", file: DESCRIBE, re: /\$\{spec\.task\.replaceAll/, expect: "GONE" },

  // ---- geometricConstraintLab (PROCESS_TELEMETRY) ----
  { engine: "geometricConstraintLab", claim: '"required before grading" counter', file: WIDGETS, re: /required before grading/, expect: "GONE" },

  // ---- graphStoryLab (AUTHORING_LABEL) ----
  { engine: "graphStoryLab", claim: '"learner work" / render-phase vocabulary in the actions copy', file: DESCRIBE, re: /without overwriting learner work/, expect: "GONE" },

  // ---- lineRelationLab (PROCESS_TELEMETRY) ----
  { engine: "lineRelationLab", claim: 'LabReadout label="moves" showing moves/requiredMoves', file: WIDGETS, re: /LabReadout label="moves" value=\{`\$\{moves\}\/\$\{spec\.requiredMoves\}`\}/, expect: "GONE" },
  { engine: "lineRelationLab", claim: '"meaningful moves recorded" in the description', file: DESCRIBE, re: /meaningful moves recorded/, expect: "GONE" },
  { engine: "lineRelationLab", claim: '"move count" advertised in the actions copy', file: DESCRIBE, re: /move count/, expect: "GONE" },

  // ---- placeValueTransformLab (AUTHORING_LABEL) ----
  { engine: "placeValueTransformLab", claim: '"Base-ten task {enum}" leading the description', file: DESCRIBE, re: /Base-ten task/, expect: "GONE" },
  { engine: "placeValueTransformLab", claim: '"never overwrites your work" in the actions copy', file: DESCRIBE, re: /overwrites your work/, expect: "GONE" },

  // ---- pointSetReasoningLab (AUTHORING_LABEL) ----
  { engine: "pointSetReasoningLab", claim: '"Point-set task {enum}" leading the description', file: DESCRIBE, re: /Point-set task/, expect: "GONE" },

  // ---- proportionalReasoningLab (PROCESS_TELEMETRY) ----
  { engine: "proportionalReasoningLab", claim: '"required before grading" counter', file: WIDGETS, re: /required before grading/, expect: "GONE" },
  { engine: "proportionalReasoningLab", claim: "authoring-design narration in the actions copy", file: DESCRIBE, re: /without replacing learner work/, expect: "GONE" },

  // ---- quotientReasoningLab (AUTHORING_LABEL) ----
  { engine: "quotientReasoningLab", claim: '"Task mode: {enum}" on the active screen', file: WIDGETS, re: /Task mode:/, expect: "GONE" },
  { engine: "quotientReasoningLab", claim: '"Exact quotient task {raw enum}" in the description', file: DESCRIBE, re: /Exact quotient task/, expect: "GONE" },

  // ---- sequenceBuild (AUTHORING_LABEL) ----
  { engine: "sequenceBuild", claim: "raw task id in the workbench accessible name", file: WIDGETS, re: /Sequence workbench for \$\{spec\.task\}/, expect: "GONE" },
  { engine: "sequenceBuild", claim: '"Sequence reasoning task {enum}" in the description', file: DESCRIBE, re: /Sequence reasoning task/, expect: "GONE" },

  // ---- shapeHierarchyLab (AUTHORING_LABEL) ----
  { engine: "shapeHierarchyLab", claim: "raw evidenceKind taxonomy on the claim chips", file: WIDGETS, re: /EVIDENCE_KIND\[choice\.evidenceKind\]/, expect: "MAPPED" },
  { engine: "shapeHierarchyLab", claim: '"The engine independently derives:" names the software', file: WIDGETS, re: /The engine independently derives/, expect: "GONE" },

  // ---- signChart (STALE_NARRATION) ----
  { engine: "signChart", claim: "description ignores poles (wrong intervals; TypeError on rf-01-03)", file: DESCRIBE, re: /signChartSigns\(spec\.roots, spec\.leadingPositive, spec\.poles\)/, expect: "MAPPED" },

  // ---- signedFractionLab (AUTHORING_LABEL) ----
  { engine: "signedFractionLab", claim: "misconception path enum in the aria-live region", file: WIDGETS, re: /\$\{selected\.path\}/, expect: "GONE" },
  { engine: "signedFractionLab", claim: '"pathway {enum}" in the description', file: DESCRIBE, re: /pathway \$\{selected\.path\}/, expect: "GONE" },

  // ---- triangleAngleLab (INVARIANT_TEXT) ----
  { engine: "triangleAngleLab", claim: 'LabReadout label="invariant sum"', file: WIDGETS, re: /label="invariant sum"/, expect: "GONE" },
  { engine: "triangleAngleLab", claim: 'LabReadout label="deformations" showing moves/requiredMoves', file: WIDGETS, re: /label="deformations"/, expect: "GONE" },

  // ---- unitCircleExplore (RAW_STATE_TOKEN) ----
  { engine: "unitCircleExplore", claim: "raw targetFeature.kind painted on the wave graph", file: WIDGETS, re: /UNIT_CIRCLE_FEATURE\[spec\.targetFeature\.kind\]/, expect: "MAPPED" },

  // ---- verticalLineScanner (RAW_STATE_TOKEN) ----
  { engine: "verticalLineScanner", claim: 'raw "not-function" verdict token in the description', file: DESCRIBE, re: /Verdict: \$\{v\.verdict \?\? "not chosen"\}/, expect: "GONE" },
];

const results = PROBES.map((p) => {
  const present = p.re.test(SRC[p.file]);
  // GONE  -> the defect construct must be absent.
  // MAPPED-> the REPLACEMENT construct must be present.
  // OPEN  -> reported either way, never scored.
  const status = p.expect === "OPEN" ? (present ? "STILL THERE" : "GONE")
    : p.expect === "MAPPED" ? (present ? "FIXED" : "NOT FIXED")
      : (present ? "NOT FIXED" : "FIXED");
  return { ...p, present, status };
});

const byEngine = new Map();
for (const r of results) {
  if (!byEngine.has(r.engine)) byEngine.set(r.engine, []);
  byEngine.get(r.engine).push(r);
}

const verdictFor = (rows) => {
  const scored = rows.filter((r) => r.expect !== "OPEN");
  if (!scored.length) return "UNRESOLVED";
  const fixed = scored.filter((r) => r.status === "FIXED").length;
  if (fixed === scored.length) return "CLEARED";
  if (fixed === 0) return "LEAK_REMAINS";
  return "PARTIAL";
};

const pad = (s, n) => String(s).padEnd(n);
let cleared = 0, partial = 0, remains = 0, unresolved = 0;
console.log("");
for (const [engine, rows] of [...byEngine].sort()) {
  const v = verdictFor(rows);
  if (v === "CLEARED") cleared++; else if (v === "PARTIAL") partial++; else if (v === "LEAK_REMAINS") remains++; else unresolved++;
  console.log(`${pad(engine, 26)} ${v}`);
  for (const r of rows) console.log(`    [${pad(r.status, 11)}] ${r.claim}`);
}
console.log("");
console.log(`engines re-checked: ${byEngine.size}   probes: ${results.length}`);
console.log(`CLEARED ${cleared} · PARTIAL ${partial} · LEAK_REMAINS ${remains} · UNRESOLVED ${unresolved}`);
console.log(`original audit recorded 18 LEAK + 1 UNCERTAIN; open engines now: ${partial + remains + unresolved}`);

if (process.argv.includes("--csv")) {
  const esc = (s) => `"${String(s).replaceAll('"', '""')}"`;
  const out = ["engine,recheck_verdict,probe,file,expected,status"];
  for (const [engine, rows] of [...byEngine].sort())
    for (const r of rows) out.push([esc(engine), esc(verdictFor(rows)), esc(r.claim), esc(r.file), esc(r.expect), esc(r.status)].join(","));
  writeFileSync("PREMIUM_ENGINE_LEARNER_FOCUS_RECHECK_S237.csv", out.join("\n") + "\n");
  console.log("\nwrote PREMIUM_ENGINE_LEARNER_FOCUS_RECHECK_S237.csv");
}
