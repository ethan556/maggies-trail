/**
 * S316 serial integration — append staged Cowork dispositions to the decision ledger.
 * Single-writer step. Order matters: later records supersede earlier per lesson.
 * Validates every record against the ledger schema contract before writing anything.
 * Usage: node scripts/session/append-s316-dispositions.mjs [--write]
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const stagingDir = path.join(root, "reports/closure/cowork-staging");

// Causal append order (assessments first, then successive verification rounds).
const ORDER = [
  // Lane B assessor records (15 courses)
  "laneB-counting-to-100-k-dispositions.jsonl",
  "laneB-proportional-relationships-dispositions.jsonl",
  "laneB-measurement-data-dispositions.jsonl",
  "laneB-circle-theorems-dispositions.jsonl",
  "laneB-function-analysis-dispositions.jsonl",
  "laneB-expressions-equations-dispositions.jsonl",
  "laneB-integration-accumulation-dispositions.jsonl",
  "laneB-triangle-congruence-dispositions.jsonl",
  "laneB-measure-money-time-dispositions.jsonl",
  "laneB-limits-continuity-dispositions.jsonl",
  "laneB-trig-graphs-inverses-dispositions.jsonl",
  "laneB-vectors-matrices-dispositions.jsonl",
  "laneB-logarithms-dispositions.jsonl",
  "laneB-place-value-dispositions.jsonl",
  "laneB-constructions-and-proof-dispositions.jsonl",
  // Verification rounds, oldest first
  "laneAV2-mixed-g4v-dispositions.jsonl",
  "laneAV2-g5u-dispositions.jsonl",
  "laneAV2-g1-koa-dispositions.jsonl",
  "laneBV-implementations-dispositions.jsonl",
  "laneAV3-koa-dispositions.jsonl",
  "laneAV3-residuals-dispositions.jsonl",
  "laneBV2-dispositions.jsonl",
  "laneAV4-final-dispositions.jsonl",
  "laneAV4-g2-g3-dispositions.jsonl",
  // S317 wave (2026-08-20, second session round)
  "laneB-data-distributions-dispositions.jsonl",
  "laneB-statistical-inference-dispositions.jsonl",
  "laneB-fractions-dispositions.jsonl",
  "laneB-conditional-probability-dispositions.jsonl",
  "laneV-s317-batch1-dispositions.jsonl",
  "laneV-s317-batch2-dispositions.jsonl",
  "laneV-s317-final-dispositions.jsonl",
  // S318 wave (2026-08-20, third session round)
  "laneB-right-triangles-trig-dispositions.jsonl",
  "laneB-exponential-functions-dispositions.jsonl",
  "laneV-s318-g4hs-dispositions.jsonl",
  "laneV-s318-k2qdprog-dispositions.jsonl",
  "laneV-s318-g3-dispositions.jsonl",
  "laneV-s318-final-dispositions.jsonl",
  // S319 wave (2026-08-20, fourth session round)
  "laneB-s319-dig4-mdf4-dispositions.jsonl",
  "laneB-s319-as20-as100-dispositions.jsonl",
  "laneB-s319-hmk-c120-dispositions.jsonl",
  "laneB-s319-tse-ns-dispositions.jsonl",
  "laneB-s319-rr-mc-dispositions.jsonl",
  "laneB-s319-sim-gf-dispositions.jsonl",
  "laneB-s319-asv-pq-dispositions.jsonl",
  "laneB-s319-ca-dr-dispositions.jsonl",
  "laneB-s319-cn-pf-dispositions.jsonl",
  "laneB-s319-cs-pp-dispositions.jsonl",
  "laneB-s319-cp-sg-dispositions.jsonl",
  "laneB-s319-ft-pra-dispositions.jsonl",
  "laneB-right-triangles-trig-dispositions.jsonl" ,
  "laneA-s319-df3.jsonl",
  "laneV-s319-fig-hs-dispositions.jsonl",
  "laneV-s319-early-mid-dispositions.jsonl",
  // S320 mega-wave (2026-08-20, fifth session round)
  "laneB-s320-A1-dispositions.jsonl",
  "laneB-s320-A2-dispositions.jsonl",
  "laneB-s320-A3-dispositions.jsonl",
  "laneB-s320-A4-dispositions.jsonl",
  "laneB-s320-A5-dispositions.jsonl",
  "laneB-s320-A6-dispositions.jsonl",
  "laneB-s320-A7-dispositions.jsonl",
  "laneB-s320-A8-dispositions.jsonl",
  "laneB-s320-A9-dispositions.jsonl",
  "laneB-s320-A10-dispositions.jsonl",
  "laneB-s320-A11-dispositions.jsonl",
  "laneB-s320-A12-dispositions.jsonl",
  "laneB-s320-A13-dispositions.jsonl",
  // S321 final wave — only the packets that completed before the org spend limit hit.
  // F3/F10 exist but carry truncated/incomplete records (validator rejects them); the
  // remaining F-wave and verifier packets never wrote. See HANDOVER addendum for resumption.
  "laneB-s321-F4-dispositions.jsonl",
  "laneB-s321-F7-dispositions.jsonl",
  "laneB-s321-F9-dispositions.jsonl",
  "laneV-s321-impl123-dispositions.jsonl",
  "laneV-s321-impl456-dispositions.jsonl",
  "laneV-s321-impl78-dispositions.jsonl",
  // S322 resumption wave (2026-08-20, sixth session round). laneB-s321-F3/F10 remain
  // excluded: superseded by the complete laneB-s322-F3/F10 re-runs below.
  "laneB-s322-F1-dispositions.jsonl",
  "laneB-s322-F2-dispositions.jsonl",
  "laneB-s322-F3-dispositions.jsonl",
  "laneB-s322-F5-dispositions.jsonl",
  "laneB-s322-F6-dispositions.jsonl",
  "laneB-s322-F8-dispositions.jsonl",
  "laneB-s322-F10-dispositions.jsonl",
  "laneB-s322-F11-dispositions.jsonl",
  "laneB-s322-F12-dispositions.jsonl",
  "laneB-s322-F13-dispositions.jsonl",
  "laneB-s322-F14-dispositions.jsonl",
  "laneA-s322-dupfix.jsonl",
  "laneA-s322-v2fix.jsonl",
  "laneA-s322-eng.jsonl",
  // S323 implementation wave (2026-08-21): 8 content fix packets + engineering.
  "laneA-s323-P1.jsonl",
  "laneA-s323-P2.jsonl",
  "laneA-s323-P3.jsonl",
  "laneA-s323-P4.jsonl",
  "laneA-s323-P5.jsonl",
  "laneA-s323-P6.jsonl",
  "laneA-s323-P7.jsonl",
  "laneA-s323-P8.jsonl",
  "laneA-s323-eng.jsonl",
  // S324 wave (2026-08-21): escalation-discharge engineering + independent verification.
  "laneA-s324-engfig.jsonl",
  "laneA-s324-engpin.jsonl",
  "laneV-s324-V1.jsonl",
  "laneV-s324-V3.jsonl",
  // S325 wave (2026-08-21): corrections for the S324 verifier findings.
  "laneA-s325-FA.jsonl",
  "laneA-s325-FB.jsonl",
  "laneA-s325-mainloop.jsonl",
  // S326 wave (2026-08-21): platform-red reconciliation corrective dispositions.
  "laneA-s326-R1.jsonl",
  "laneA-s326-R3.jsonl",
  // S327 wave (2026-08-21) PASS 1 of 2: laneB-s327-A1 alone. A1 self-detected a shared
  // scratchpad collision that misdirected 11 of its 12 records into laneB-s327-A3.jsonl
  // (recordIds s327-A1-pv1000-01-02..04-03). A1 rebuilt its own correct file (12/12
  // verified against fresh reviewedBasisHash). Appending A1 alone first lets its 12
  // recordIds enter the ledger's existingIds set so pass 2 (below) silently skips the
  // 11 stray duplicates inside A3's file via the idempotent already-appended check
  // rather than hard-failing on an in-run duplicateRecordId collision. See HANDOVER
  // S327 addendum.
  "laneB-s327-A1.jsonl",
  // S327 wave PASS 2 of 2: remaining 14 files. laneB-s327-A3.jsonl's 11 stray
  // s327-A1-* duplicates are expected to land in skippedAlreadyAppended (already in
  // the ledger from pass 1 above); its 12 legitimate s327-A3-* records write normally.
  // No laneA-s327-genfix.jsonl exists — the generator-engineering packet was pure
  // src/lib fixes with zero lesson-JSON cross-fixes, confirmed via directory listing.
  "laneB-s327-A2.jsonl",
  "laneB-s327-A3.jsonl",
  "laneB-s327-A4.jsonl",
  "laneB-s327-A5.jsonl",
  "laneB-s327-A6.jsonl",
  "laneB-s327-A7.jsonl",
  "laneA-s327-PG1.jsonl",
  "laneA-s327-PG2.jsonl",
  "laneA-s327-PG3.jsonl",
  "laneA-s327-PG4.jsonl",
  "laneA-s327-PG5.jsonl",
  "laneA-s327-PG6.jsonl",
  "laneA-s327-CH1.jsonl",
  "laneA-s327-CH2.jsonl",
  // S328 wave (2026-08-21): discharge the 5 S327 LESSON_REVISION_IMPLEMENTATION
  // escalations. E1 = countTeenFrame src fix (g0Variants.ts) + full knb-* sibling
  // sweep (9 lessons total). E2 = two new registered figures (vm-notch-block,
  // vm-equal-volumes-compare) closing the g5v-03-01/g5v-03-03 visual ESCALATEs. E3 =
  // pv1000-02-01 REVISE implemented content-only after confirming the session273 trio
  // pin was never actually implicated (only session301's single-row reveal hash was).
  "laneA-s328-E1.jsonl",
  "laneA-s328-E2.jsonl",
  "laneA-s328-E3.jsonl",
  // S328 main-loop: fixed 2 pre-existing (not S327/S328-caused) ILLUSTRATION_REPLACEMENT
  // P0 rows surfaced by a VIS01 regen side effect of E2's work -- see rationale.
  "laneA-s328-mainloop.jsonl",
  // S329 wave (2026-08-21): user directive "complete ALL pending work aggressively,
  // multiple concurrent workers". 6 LESSON_PROGRESSION_AND_DUPLICATION redesign packets
  // (PGA-PGF, 142 lessons reviewed, ~68 redesigned / rest KEEP-with-rationale -- see
  // HANDOVER S329 addendum for the closure-mechanism caveat), 2 QUESTION_DIVERSITY_AND_
  // TRANSFER engine-extension packets (Q1: 6 ks-* lessons; Q2: 3 multi-engine lessons),
  // 1 CLOSURE_LEDGER packet with lesson-content edits (CL3: 200/200 prediction-gate
  // review, 0 removed). CL1/CL2/CL4 (also S329, CLOSURE_LEDGER.md work) wrote no lesson
  // dispositions -- pure src/tooling fixes or already-resolved findings, zero content edits.
  "laneA-s329-PGA.jsonl",
  "laneA-s329-PGB.jsonl",
  "laneA-s329-PGC.jsonl",
  "laneA-s329-PGD.jsonl",
  "laneA-s329-PGE.jsonl",
  "laneA-s329-PGF.jsonl",
  "laneA-s329-Q1.jsonl",
  "laneA-s329-Q2.jsonl",
  "laneA-s329-CL3.jsonl",
  "laneA-s329-recon-mainloop.jsonl",
  // S330 wave (2026-08-21): user directive "complete all queued work" -- the remaining 109
  // LESSON_PROGRESSION_AND_DUPLICATION rows (the only in-authority workstream; CLOSURE_LEDGER/
  // V4_PROGRAMME_PHASE/STANDARDS_VERIFICATION/QUESTION_DIVERSITY_AND_TRANSFER's 32 rows are
  // out-of-authority per the HANDOVER S316 framing, re-confirmed not re-litigated). 10 course-
  // grouped redesign packets (G1-G10, 109 lessons reviewed, 39 redesigned / 70 KEEP-with-
  // rationale); G11 (7 singles-tail lessons) reviewed and kept all 7 with zero edits, so wrote
  // no disposition file. Mid-wave the shared working tree was hit by a self-inflicted `git
  // stash` (from G1's recovery attempt) that transiently reset all agents' uncommitted edits to
  // HEAD; every affected packet (G1, G3, G4, G5, G6, G10) noticed and reapplied its own work.
  // Orchestrator-side reconciliation after the wave returned: confirmed the stash (still present
  // as stash@{0}) diffed byte-identical against the final working tree for 25/26 of its files,
  // and the 26th (pr-04-01.json) differed only because G3 kept iterating on it after the stash
  // snapshot -- no data loss, stash dropped. Independently re-ran the live S236 detector before
  // and after this append: all 39 edited lessons' redesigned steps dropped out of that lesson's
  // flagged-evidence list, zero new/unexplained collisions appeared anywhere, and every
  // deliberately-kept sibling collision remained flagged exactly as each packet's rationale
  // documented (19 of the 39 edited lessons still carry a separate, intentionally-kept
  // collision and so remain open rows -- expected, not a gap). See S330_PROGRESSION_G1..G11.md.
  "laneA-s330-G1.jsonl",
  "laneA-s330-G2.jsonl",
  "laneA-s330-G3.jsonl",
  "laneA-s330-G4.jsonl",
  "laneA-s330-G5.jsonl",
  "laneA-s330-G6.jsonl",
  "laneA-s330-G7.jsonl",
  "laneA-s330-G8.jsonl",
  "laneA-s330-G9.jsonl",
  "laneA-s330-G10.jsonl",
  // Orchestrator reconciliation fix: g2p-02-01's k2 incorrect-feedback text tripped the generic-
  // feedback lint heuristic after G7's redesign landed; reworded (see rationale), re-disposed
  // against the fresh post-edit hash.
  "laneA-s330-recon.jsonl",
  // Post-audit-wave redesigns (2026-08-21, same user directive "complete ALL tasks"): a 7-agent
  // adversarial audit of the 89 rows the S330 wave left open found 7 lessons whose KEEP rationale
  // was genuinely weak (structural collisions the detector's per-lesson pairwise check hadn't yet
  // reached, or in fn-04-01's case a 5-way cluster). All 7 redesigned; see rationale per record.
  "laneA-s330-postrecon-progression.jsonl",
  // Correction: the above file used decision="REVISE" on 7 lessons whose redesign was already
  // implemented and verified -- REVISE is a forward-looking flag (opens LESSON_REVISION_
  // IMPLEMENTATION) and the consolidator correctly reacted by opening 7 such rows. Supersedes
  // each of the 7 decisions to KEEP, matching the established s330-recon pattern for an
  // already-completed, already-verified fix. Same reviewedBasisHash throughout (no further
  // content change).
  "laneA-s330-postrecon-progression-fix.jsonl",
  // CL-P1-048 live re-measurement (2026-08-21, same user directive "complete ALL tasks"): the
  // CLOSURE_LEDGER row's own "697/3,293, 572 remaining" framing traces to a composite detector
  // (MCQ_DISTRACTOR_AUDIT.csv) that S242's scripts/audit/mcq-leakage.mts explicitly superseded
  // with a 5-separated-cause measurement -- CL-P1-048 was never revisited after that supersession.
  // Fresh run found only 5 live findings across the whole corpus (5,237 MCQ items measured). 4
  // were genuine label-length/unit leaks with a safe mechanical fix (move/trim, no new authored
  // content); 1 (rns-03-02/ch1) was reviewed and correctly left alone as a legitimate reasoning-
  // comparison item where the length asymmetry is the actual pedagogy, not a leak.
  "laneA-s330-mcqleakage.jsonl",
];
// Explicitly EXCLUDED (set aside by the S316 adjudication): laneAV-g1, laneAV-g2-g3, laneAV-g4-g5.

const ledgerLines = fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/).filter(Boolean);
const schema = JSON.parse(ledgerLines[0]);
if (schema.recordType !== "schema") throw new Error("ledger must start with schema record");
const allowedLesson = new Set(schema.contract.allowedLessonDecisions);
const allowedVisual = new Set(schema.contract.allowedVisualDecisions);
const allowedLanguage = new Set(schema.contract.allowedGradeLanguageDecisions);
const existingIds = new Set(
  ledgerLines.slice(1).map((l) => { try { return String(JSON.parse(l).recordId ?? ""); } catch { return ""; } })
);

const out = [];
const problems = [];
let skippedAlreadyAppended = 0;
const seenNewIds = new Set();
for (const file of ORDER) {
  const p = path.join(stagingDir, file);
  if (!fs.existsSync(p)) { problems.push(`MISSING FILE: ${file}`); continue; }
  const recs = fs.readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean).map((l, i) => {
    try { return JSON.parse(l); } catch (e) { problems.push(`${file}:${i + 1} bad JSON`); return null; }
  }).filter(Boolean);
  for (const r of recs) {
    if (r.recordType !== "lesson-disposition") continue; // staging files may carry evidence/log records
    // Format normalization (verdicts untouched): some staging writers put prose,
    // null, or the synonym APPROPRIATE in the two sub-decision enum fields.
    // Map mechanically and record provenance in the rationale.
    const notes = [];
    if (!allowedVisual.has(r.visualDecision)) {
      const orig = r.visualDecision;
      const figureOpen = r.decision === "REVISE" && /figure|visual/i.test(String(r.rationale ?? ""));
      r.visualDecision = figureOpen ? "REQUIRED" : "SUFFICIENT";
      notes.push(`visualDecision normalized to ${r.visualDecision}${typeof orig === "string" ? ` (original prose retained: "${orig.slice(0, 120)}")` : " (was null)"}`);
    }
    if (!allowedLanguage.has(r.gradeLanguageDecision)) {
      const orig = r.gradeLanguageDecision;
      r.gradeLanguageDecision = "FIT";
      notes.push(`gradeLanguageDecision normalized to FIT${typeof orig === "string" ? ` (original: "${orig.slice(0, 120)}")` : " (was null)"}`);
    }
    if (notes.length) r.rationale = `${r.rationale} [S316 integration format normalization: ${notes.join("; ")}]`;
    const errs = [];
    if (r.recordType !== "lesson-disposition") errs.push("recordType");
    if (!r.recordId) errs.push("recordId");
    if (existingIds.has(String(r.recordId))) { skippedAlreadyAppended += 1; continue; } // idempotent re-run
    if (seenNewIds.has(String(r.recordId))) errs.push("duplicateRecordId");
    if (!allowedLesson.has(r.decision)) errs.push("decision");
    if (!allowedVisual.has(r.visualDecision)) errs.push("visualDecision");
    if (!allowedLanguage.has(r.gradeLanguageDecision)) errs.push("gradeLanguageDecision");
    if (!String(r.reviewer ?? "").trim()) errs.push("reviewer");
    if (!String(r.rationale ?? "").trim()) errs.push("rationale");
    if (!String(r.reopenCondition ?? "").trim()) errs.push("reopenCondition");
    if (!Array.isArray(r.evidenceRefs) || !r.evidenceRefs.length) errs.push("evidenceRefs");
    if (!Number.isFinite(Date.parse(String(r.reviewedAt ?? "")))) errs.push("reviewedAt");
    if (!/^[a-f0-9]{64}$/i.test(String(r.reviewedBasisHash ?? ""))) errs.push("reviewedBasisHash");
    if (errs.length) { problems.push(`${file} ${r.recordId ?? r.lessonId}: ${errs.join(",")}`); continue; }
    seenNewIds.add(String(r.recordId));
    out.push({ file, record: r });
  }
}

console.log(JSON.stringify({ files: ORDER.length, validRecords: out.length, skippedAlreadyAppended, problems }, null, 2));
if (problems.length) process.exit(1);
if (process.argv.includes("--write")) {
  const text = out.map(({ record }) => JSON.stringify(record)).join("\n");
  const cur = fs.readFileSync(ledgerPath, "utf8");
  fs.appendFileSync(ledgerPath, (cur.endsWith("\n") ? "" : "\n") + text + "\n");
  console.log(`APPENDED ${out.length} records`);
}
