import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, "reports", "cache", "CHATGPT_WORK_V4_PRECACHE_MANIFEST.json");
const PREFIX_PATH = join(ROOT, "reports", "cache", "CHATGPT_WORK_V4_EXACT_PREFIX.md");
const BUILDER_PATH = join(ROOT, "scripts", "cache", "chatgpt-work-v4-cache.mjs");
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

interface Manifest {
  generatedAt: string;
  cacheSeal: string;
  cacheRelativePath: string;
  sealBasis: Record<string, unknown>;
  repository: { queueFreshness: string };
  policy: { canonicalExternalSha256: string; exactWorkerPrefixSha256: string };
  inventory: { courses: number; lessons: number; topLevelLessonSteps: number; dependencyFiles: number; dependencyGroups: number; artifactRefs: number };
  dependencyGroups: Array<{ id: string; sha256: string; fileCount: number; bytes: number; representativeRefs: string[] }>;
  curriculumPartitions: Array<{ courseId: string; gradeLevel: number; lessonCount: number; stepCount: number; sha256: string; sourcePrefix: string }>;
  artifactRefs: Array<{ id: string; path: string; sha256: string; recordCount: number; countLabel: string }>;
  packetFamilies: Array<{ id: string; inputGroups: string[]; dependencySha256: string }>;
  workerPacket: {
    exactPrefixId: string;
    exactPrefixSha256: string;
    appendMarker: string;
    exactPrefixRequired: boolean;
    returnFieldsInOrder: string[];
    semanticExecutionKeyRecipe: string;
  };
}

const rawManifest = readFileSync(MANIFEST_PATH, "utf8");
const manifest = JSON.parse(rawManifest) as Manifest;

describe("S244 ChatGPT Work V4 content-addressed precache", () => {
  it("is a deterministic, byte-current tracked manifest", () => {
    expect(() => execFileSync(process.execPath, [BUILDER_PATH, "--check"], { cwd: ROOT, stdio: "pipe" })).not.toThrow();
    expect(manifest.generatedAt).toBe("deterministic");
    expect(manifest.cacheSeal).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.cacheSeal).toBe(hash(stable(manifest.sealBasis)));
    expect(manifest.cacheRelativePath).toBe(`.chatgpt-work-cache/maggies-v4/${manifest.cacheSeal}/`);
    expect(rawManifest.length).toBeLessThan(75_000);
  });

  it("covers the live curriculum with course-granular invalidation", () => {
    expect(manifest.inventory).toMatchObject({
      courses: 129,
      lessons: 1701,
      topLevelLessonSteps: 15663,
      dependencyGroups: 12,
      artifactRefs: 12
    });
    expect(manifest.inventory.dependencyFiles).toBeGreaterThan(2000);
    expect(manifest.curriculumPartitions).toHaveLength(129);
    expect(new Set(manifest.curriculumPartitions.map((partition) => partition.courseId)).size).toBe(129);
    expect(manifest.curriculumPartitions.reduce((sum, partition) => sum + partition.lessonCount, 0)).toBe(1701);
    expect(manifest.curriculumPartitions.reduce((sum, partition) => sum + partition.stepCount, 0)).toBe(15663);
    for (const partition of manifest.curriculumPartitions) {
      expect(partition.sha256, partition.courseId).toMatch(/^[a-f0-9]{64}$/);
      expect(partition.sourcePrefix, partition.courseId).toBe(`content/courses/${partition.courseId}/`);
      expect(partition.lessonCount, partition.courseId).toBeGreaterThan(0);
    }
  });

  it("seals every required dependency family and transitive packet basis", () => {
    const expectedGroups = [
      "contract-code", "curriculum", "evaluators", "evidence-artifacts", "generators", "mastery",
      "review-detectors", "rubric-contract", "standards", "standards-toolchain", "visuals-assets", "widgets"
    ];
    expect(manifest.dependencyGroups.map((group) => group.id).sort()).toEqual(expectedGroups);
    const groupById = new Map(manifest.dependencyGroups.map((group) => [group.id, group]));
    for (const group of manifest.dependencyGroups) {
      expect(group.sha256, group.id).toMatch(/^[a-f0-9]{64}$/);
      expect(group.fileCount, group.id).toBeGreaterThan(0);
      expect(group.bytes, group.id).toBeGreaterThan(0);
    }
    for (const family of manifest.packetFamilies) {
      expect(family.dependencySha256, family.id).toBe(hash(stable(
        family.inputGroups.map((groupId) => [groupId, groupById.get(groupId)?.sha256])
      )));
      expect(family.inputGroups.every((groupId) => groupById.has(groupId)), family.id).toBe(true);
    }
  });

  it("stores compact evidence references and exact counts, not raw duplicate logs", () => {
    const counts = Object.fromEntries(manifest.artifactRefs.map((artifact) => [artifact.id, artifact.recordCount]));
    expect(counts).toMatchObject({
      // Recounted after the S327-S329 waves landed (see HANDOVER S327-S329 addenda).
      // S327: 17-agent assessor/progression/choice/generator closure (queue 749->193).
      // S328: discharged all 5 LESSON_REVISION_IMPLEMENTATION escalations plus a
      // main-loop illustration fix (193->188). S329 (user directive "complete ALL
      // pending work aggressively, multiple concurrent workers"): 12-agent wave --
      // 6 LESSON_PROGRESSION_AND_DUPLICATION redesign packets (142->109 rows; most of
      // the ~68 lessons touched are KEEP-with-rationale, which doesn't suppress this
      // workstream's structural-only check by design -- see architecture-gap note in
      // the HANDOVER S327 addendum), 2 QUESTION_DIVERSITY_AND_TRANSFER engine-extension
      // packets (9 lessons resolved; re-running the sanctioned excellence-backlog-s126
      // generator dropped the CSV from 10 rows to the 1 already-intentional-assessment
      // row, queue 10->1), 4 CLOSURE_LEDGER packets (5 rows formally CLOSED with fresh
      // gate-verified evidence -- CL-P1-044/040/051/012/049; CL-P1-033 stays OPEN with
      // real source portability fixes applied, honestly not claimed closed since this
      // sandbox can't execute on Windows; 188->141 total, CLOSURE_LEDGER 27->22).
      // Decisions 3334 -> 3590 (256 new S329 records). Duplicates and visual placements
      // unchanged. topLevelLessonSteps 15654 -> 15663 (9 new ch2 challenge steps: 6 from
      // the ks-* extend packet, 3 from the multi-engine packet).
      // Post-S329 final-reconciliation pass (full vitest vs the S326 baseline): 5 more
      // records for lessons whose variant.form was mechanically corrected to match an
      // already-reviewed, unchanged widget surface (g1m-03-02/g2l-03-04/k100-02-05/
      // mmt-02-01/mmt-05-02 -- see reports/closure/cowork-staging/laneA-s329-recon-mainloop.jsonl).
      // Decisions 3590 -> 3595. Queue total, dup/visual/choice counts all unchanged.
      // S330 (user directive "complete all queued work"): 10-agent wave (G1-G10) over the
      // full remaining 109 LESSON_PROGRESSION_AND_DUPLICATION rows -- the only in-authority
      // workstream this round; the other 32 rows (CLOSURE_LEDGER 22, V4_PROGRAMME_PHASE 7,
      // STANDARDS_VERIFICATION 2, QUESTION_DIVERSITY_AND_TRANSFER 1) are out-of-authority
      // per the HANDOVER S316 framing and were correctly left untouched. 39 of 109 lessons
      // redesigned (one or more flagged steps rewritten to a distinct, hand-authored angle);
      // 70 reviewed and kept unedited with documented fluency/spacing rationale (G11's 7
      // singles-tail lessons among them, all 7 confirmed false positives, so it wrote no
      // disposition file). Orchestrator-side reconciliation independently re-ran the live
      // S236 detector before and after: all 39 edits mechanically clear exactly the step(s)
      // each packet's rationale claims, zero new/unexplained collisions anywhere, and 19 of
      // the 39 edited lessons still carry one *other*, deliberately-kept sibling collision
      // and so correctly remain open rows (not a gap -- the detector is disposition-blind by
      // design). Queue 141 -> 121 (LESSON_PROGRESSION_AND_DUPLICATION 109 -> 89; the 32
      // out-of-authority rows unchanged). A mid-wave self-inflicted `git stash` transiently
      // reset the shared working tree to pre-edit HEAD; every affected packet noticed and
      // reapplied its work, independently confirmed byte-identical (bar one file that kept
      // iterating after the stash snapshot, strictly superseding it) before the stash was
      // dropped. Decisions 3595 -> 3634 (39 new S330 records). Duplicates and visual
      // placements unchanged; topLevelLessonSteps unchanged (redesigns rewrote existing
      // steps in place, no new steps added). One follow-up record, 3634 -> 3635: g2p-02-01's
      // k2 incorrect-feedback text tripped the generic-feedback lint heuristic (led with a
      // bare "No" before its real diagnosis); reworded and re-disposed against the fresh
      // hash -- prose only, doesn't touch widget.prompt, so the queue total is unaffected.
      // Second follow-up, 3635 -> 3636: pr-04-03's KEPT (not redesigned) step k3 had a body-text
      // aside G3 flagged but correctly left unactioned ("A bigger percent increase" on a smaller
      // rate, 50->60/+20%, than sibling k1's 80->100/+25%); reworded to "Another percent
      // increase." (matching k1's own neutral body text), re-disposed against the fresh hash.
      // Post-S330 adversarial audit wave (same "complete ALL tasks" directive): 7 parallel
      // read-only agents re-reviewed all 89 remaining LESSON_PROGRESSION_AND_DUPLICATION rows'
      // KEEP rationale plus the 32 out-of-authority rows; found 7 lessons (exp-03-01, exp-03-02,
      // exp-04-01, exp-04-02, fn-04-01, lf-04-01, pr-04b-01) whose detector-flagged collision(s)
      // the S330 wave had not yet reached. All 7 redesigned (fn-04-01 was a 5-way template
      // cluster on 4 flagged steps; the rest 1-2 flagged steps each), each verified via live
      // Lesson.parse + lintLesson + evaluate()/exactNumberTruth against the app's own runtime
      // code (not hand-computation alone), then re-disposed against fresh post-edit hashes.
      // Queue 121 -> 114 (LESSON_PROGRESSION_AND_DUPLICATION 89 -> 82; the 32 out-of-authority
      // rows unchanged). Decisions 3636 -> 3650 (7 new records citing the redesigns, decision=
      // REVISE -- then a same-session correction, 7 more records superseding those to decision=
      // KEEP, since REVISE is the consolidator's forward-looking "not yet implemented" flag and
      // the redesigns were already done and verified before the first 7 records were written;
      // using REVISE had correctly but unintentionally opened 7 LESSON_REVISION_IMPLEMENTATION
      // rows, which the KEEP correction closed). Duplicates and visual placements unchanged;
      // topLevelLessonSteps unchanged (redesigns rewrote existing steps in place).
      "pending-workload": 114,
      "lesson-review-cards": 1701,
      "lesson-review-decisions": 3650,
      "exact-mcq-duplicates": 100,
      "visual-placement-index": 3573,
      "choice-surface-index": 0,
      "standards-dossiers": 6121,
      "standards-lesson-map": 1134,
      "standards-decisions": 6121,
      "strict-cml-ledger": 0
    });
    for (const artifact of manifest.artifactRefs) {
      expect(artifact.sha256, artifact.id).toMatch(/^[a-f0-9]{64}$/);
      expect(artifact.path, artifact.id).not.toContain(".chatgpt-work-cache");
    }
    for (const partition of manifest.curriculumPartitions) {
      expect(partition).not.toHaveProperty("lessonIds");
      expect(partition).not.toHaveProperty("lessons");
      expect(partition).not.toHaveProperty("prompts");
    }
    const forbiddenKeys = new Set(["prompt", "body", "options", "rawLog", "rawLogs", "screenshots"]);
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(visit);
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        expect(forbiddenKeys.has(key), `raw cache field ${key}`).toBe(false);
        visit(child);
      }
    };
    visit(manifest);
  });

  it("pins one reusable exact prefix and an ordered compact return contract", () => {
    const prefix = readFileSync(PREFIX_PATH, "utf8");
    expect(manifest.policy.canonicalExternalSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.policy.exactWorkerPrefixSha256).toBe(hash(prefix));
    expect(manifest.workerPacket.exactPrefixSha256).toBe(hash(prefix));
    expect(manifest.workerPacket.exactPrefixRequired).toBe(true);
    expect(manifest.workerPacket.appendMarker).toBe("--- PACKET EVIDENCE ---");
    expect(manifest.workerPacket.returnFieldsInOrder).toEqual([
      "packet_id", "base_commit", "contract_hash", "role", "model", "effort", "speed", "scope_ids",
      "status", "changed_file_hashes", "evidence_refs", "gates_passed", "gates_failed",
      "cache_invalidations", "new_decision_required", "risks", "next_owner"
    ]);
    expect(manifest.workerPacket.semanticExecutionKeyRecipe).toContain("model\\0effort");
    expect(prefix).toContain("Use this block byte-for-byte");
  });

  it("keeps the cache untracked, unshipped, timestamp-free, and atomically published", () => {
    expect(readFileSync(join(ROOT, ".gitignore"), "utf8")).toMatch(/^\.chatgpt-work-cache\/$/m);
    const native = readFileSync(join(ROOT, "scripts", "native-integrity.mjs"), "utf8");
    expect(native).toContain('".chatgpt-work-cache"');
    const builder = readFileSync(BUILDER_PATH, "utf8");
    expect(builder).not.toMatch(/new Date\(|Date\.now\(|toISOString/);
    expect(builder).toContain("renameSync(temporary, file)");
    expect(builder).toContain("manifest is the readiness marker");
    expect(builder).not.toContain("rmSync(");
    expect(manifest.repository.queueFreshness).toMatch(/^(?:SOURCE_SEAL_MATCH|STALE_SOURCE_SEAL)$/);
  });
});
