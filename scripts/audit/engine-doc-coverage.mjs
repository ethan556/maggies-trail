#!/usr/bin/env node
/**
 * engine-doc-coverage — every widget spec's ENUM fields must be named in its own doc comment.
 *
 * WHY THIS EXISTS. An enum is the FIT TEST for authoring: "if the mathematics you need is not in
 * the list, the engine cannot model this lesson honestly and the lesson should be refused" is what
 * `widget-contract.ts` prints above every enum it finds. But the enum only tells you the ALLOWED
 * VALUES — it never tells you what the field DOES. That semantic gap has now cost real rework three
 * separate times across this workstream, every time in the same shape: an engine was believed to do
 * one thing, its enum values looked compatible, and the truth was different.
 *
 *   S203L  `volumeBuilder.solid` — a whole lesson was REFUSED on the written claim that "no engine
 *          represents a sphere as manipulable state". The field `solid: prism|cylinder|cone|sphere`
 *          existed the entire time. The refusal was a false claim about the library, corrected only
 *          because a later session re-read the schema instead of trusting the note.
 *   S203V  `scaledCircleLab.ask` — circumferenceCoef/areaCoef were assumed to compare TWO circles
 *          under a scale factor. `scaledCircleTarget()` computes 2r / r² for ONE circle. An entire
 *          lesson was designed against the wrong semantics and had to be rewritten.
 *   S203V  `dilationExplore.showRatios` — "segments" was assumed to be an additive readout. It
 *          RE-STAGES the widget into an unrelated side-splitter exercise and cannot combine with
 *          scale readouts at all.
 *
 * In all three the enum VALUES were visible and the enum's MEANING was not. A doc comment that
 * names the field is not a guarantee of accuracy, but a doc comment that never mentions the field
 * at all guarantees the meaning lives only in the implementation — which is exactly the state that
 * produced those three errors.
 *
 * THE RATCHET. 35 of 90 specs were affected when this audit was written; fixing all of them at once
 * would be a large, low-attention edit across unrelated engines, which is how documentation gets
 * written badly. So this ratchets down instead: the count may never rise, and any session touching
 * an engine's docs can lower it. Same mechanism as the standards-coverage gates, same reasoning —
 * a number that can only improve is worth more than a number fixed in one careless pass.
 *
 * Usage:  node scripts/audit/engine-doc-coverage.mjs [--json]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** RATCHET — engines with at least one enum field their doc comment never names.
 *  Lower as docs land; never raise. Seeded at the S203W measured value. */
const MAX_UNDOCUMENTED = 19;   // S203X: the honest figure after fixing TWO audit bugs — a greedy doc-comment regex that let specs inherit unrelated documentation, and a top-comment-only check that ignored inline field comments. The first over-credited, the second under-credited; 19 is what survives both corrections.

const src = readFileSync(join(root, "src/lib/schema.ts"), "utf8");
/* The doc-comment capture is TEMPERED — `(?:(?!\*\/)[\s\S])*` cannot cross a `*​/` — so it matches
 * only the comment IMMEDIATELY preceding the spec. S203X caught the greedy version doing real
 * damage: a lazy `(.*?)` still lets the overall match START at a `/**` far earlier in the file and
 * swallow every comment in between, so a spec inherited hundreds of lines of unrelated
 * documentation and any field name appearing anywhere in that span counted as "documented".
 * volumeBuilder passed a failure-first probe it should have failed, which is how this surfaced. */
const specs = [...src.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export const (\w+Spec) = z\.object\(\{([\s\S]*?)\n\}\);/g)];

const rows = [];
for (const [, doc, specName, body] of specs) {
  const engine = body.match(/z\.literal\("(\w+)"\)/);
  if (!engine) continue;
  const enums = [...body.matchAll(/(\w+): z\s*\.?\s*enum\(\[([^\]]+)\]/g)]
    .map((m) => m[1])
    .filter((f) => f !== "type");
  if (enums.length === 0) continue;
  /* S203X. An enum can be documented in EITHER the spec's top doc comment or an inline field
   * comment immediately above it, and both are equally good for an author reading the schema.
   * Checking only the top comment produced a false positive on circleMeasureExplore, whose
   * `radiusScale` mode carries a thorough inline comment — the audit called it undocumented while
   * the documentation was three lines away. An audit that cries wolf gets ignored.
   *
   * A field counts as documented if EITHER its name appears anywhere in the spec's comments, OR a
   * doc comment sits immediately above its declaration (that comment is unambiguously about this
   * field, so requiring it to also repeat the field's own name is pedantry — circleMeasureExplore's
   * `askQuantity` comment explains exactly what it does without ever restating the identifier). */
  const inlineComments = [...body.matchAll(/\/\*\*([\s\S]*?)\*\//g)].map((m) => m[1]).join("\n")
    + "\n" + [...body.matchAll(/\/\/(.*)$/gm)].map((m) => m[1]).join("\n");
  const documentedText = `${doc}\n${inlineComments}`;
  const hasCommentDirectlyAbove = (field) =>
    new RegExp(`\\*/\\s*\\n\\s*${field}: z\\s*\\.?\\s*enum\\(`).test(body);
  const undocumented = enums.filter((f) => !documentedText.includes(f) && !hasCommentDirectlyAbove(f));
  if (undocumented.length) rows.push({ engine: engine[1], specName, undocumented, enums });
}
rows.sort((a, b) => b.undocumented.length - a.undocumented.length || a.engine.localeCompare(b.engine));

const report = {
  generatedAt: "deterministic",
  specsWithEnums: specs.filter(([, , , b]) => /(\w+): z\s*\.?\s*enum\(/.test(b ?? "")).length,
  enginesWithUndocumentedEnums: rows.length,
  ratchet: MAX_UNDOCUMENTED,
  rows,
  passed: rows.length <= MAX_UNDOCUMENTED
};
writeFileSync(join(root, "ENGINE_DOC_COVERAGE.json"), JSON.stringify(report, null, 2) + "\n");

if (process.argv.includes("--json")) {
  console.log(`engine-doc-coverage: ${rows.length} engines have an enum their doc never names (ratchet ${MAX_UNDOCUMENTED})`);
  for (const r of rows.slice(0, 20)) {
    console.log(`  ${r.engine.padEnd(28)}${r.undocumented.join(", ")}`);
  }
}

const failures = [];
if (rows.length > MAX_UNDOCUMENTED) {
  failures.push(`${rows.length} engines with undocumented enum fields exceeds the ratchet of ${MAX_UNDOCUMENTED}`);
}
if (rows.length < MAX_UNDOCUMENTED) {
  failures.push(
    `documentation improved to ${rows.length} — lower MAX_UNDOCUMENTED to ${rows.length} in this script so the gate keeps its new ground`
  );
}
if (failures.length) {
  console.error("\nengine-doc-coverage FAILED:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("engine-doc-coverage passed.");
