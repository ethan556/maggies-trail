#!/usr/bin/env node
/**
 * apply-manipulable-repair — apply a batch of Tier C conversions from a patch file, and disarm the
 * authorisation trap automatically.
 *
 * REPLACES the bespoke `fix-<course>-manipulables.mjs` written for each of the first two batches.
 * Those scripts were 90% identical boilerplate around a per-lesson widget table, and the 10% that
 * differed was where the mistakes lived. This takes the table as DATA and keeps one implementation
 * of the mechanics — the same move that turned `ingest-g6-12-gap-patch.mjs` into
 * `ingest-content-patch.mjs`.
 *
 * WHAT IT DOES THAT THE HAND-ROLLED VERSIONS DID NOT:
 *
 *   1. VALIDATES EVERY WIDGET AGAINST THE REAL SCHEMA BEFORE WRITING ANYTHING. The first two
 *      batches lost five gate cycles to required fields hidden below the cut of a printed donor
 *      config (`plotPoint.missFeedback`, `volumeBuilder.low/highFeedback`). Parsing the patch
 *      through `WidgetSpec` up front turns a ten-minute round trip into an instant error naming the
 *      field. Run `npx tsx scripts/session/widget-contract.ts <engine>` before authoring and this
 *      should never fire — it is the backstop, not the plan.
 *
 *   2. AUTHORISES IN ALL FIVE PLACES ITSELF. Every edited lesson must be authorised in
 *      `content-change-proof-s151c.mjs` (entries AND its hardcoded changed count) and in four
 *      whole-corpus python audits. Those four DO NOT AGREE ON THE VARIABLE NAME: s150 merges into
 *      `authorized_later`, s146/s147/s148 into `allowed_later`. S203K used the wrong one and spent
 *      a cycle reading a six-thousand-character diff that named every changed lesson in the corpus
 *      except the useful detail. A script does not misremember which is which.
 *      s149 is untouched: it hash-pins only its own targets.
 *
 *   3. REFUSES AS A FIRST-CLASS OUTCOME. `refusals` are recorded in the patch and echoed into the
 *      report, because the fit rate is the point of this whole exercise. A repair that converts
 *      everything it is pointed at produces a better number and a worse product.
 *
 * PATCH SHAPE:
 *   {
 *     "tag": "S203L",
 *     "label": "geometry batch 2",
 *     "conversions": [ { "course": "...", "lesson": "...", "step": "i1", "widget": { … } } ],
 *     "refusals":    [ { "lesson": "...", "title": "...", "why": "…" } ]
 *   }
 *
 * Usage:  node scripts/session/apply-manipulable-repair.mjs <patch.json> [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const argv = process.argv.slice(2);
const patchPath = argv.find((a) => !a.startsWith("--"));
const dry = argv.includes("--dry-run");
if (!patchPath) {
  console.error("usage: apply-manipulable-repair.mjs <patch.json> [--dry-run]");
  process.exit(2);
}

let asserts = 0;
const must = (ok, msg) => { asserts++; if (!ok) throw new Error(`REPAIR: ${msg}`); };
process.on("uncaughtException", (e) => {
  console.error(`\n✗ ${e?.message ?? e}\n  nothing was written.`);
  process.exit(1);
});

const patch = JSON.parse(readFileSync(patchPath, "utf8"));
const TAG = patch.tag;
must(/^S\d+[A-Z]?$/.test(TAG ?? ""), `patch.tag must look like S203L (got ${JSON.stringify(TAG)})`);
const conversions = patch.conversions ?? [];
/* INSERT-AFTER (S205): a new interactive step ADDED after an anchor step, leaving every authored
 * step byte-identical. This exists for the steppedReveal wall: 24 C/D lessons whose only
 * interactive step is substantial authored teaching, where the old REPLACE operation would delete
 * good pedagogy to buy a tier. The architecture it enables is
 *   Explain -> Reveal -> MANIPULATE IT YOURSELF -> Generalize
 * instead of forcing Reveal OR Manipulate. Insertions are NOT tier-gated (the step-mix campaign
 * will insert into A/B lessons too); the current tier is printed for the record instead. */
const insertions = patch.insertions ?? [];
const refusals = patch.refusals ?? [];
/* S205I: a REFUSAL-ONLY patch is legitimate output, not an empty one. Adjudicating a cluster and
 * finding nothing convertible is a real result — the dr/dc closeout was 5 refusals and 0 writes —
 * and the standing rule is that every refusal lives in a patch file with source cites or it is
 * unfalsifiable a session later. Rejecting these batches pushed the recording of refusals OUT of
 * the tool that validates them, which is precisely backwards. A patch must still say something:
 * zero conversions, zero insertions AND zero refusals is the genuinely empty case. */
must(conversions.length + insertions.length + refusals.length > 0,
  "patch has no conversions, no insertions and no refusals — it says nothing");

/* ---------------------------------------------------------------- 0. tier pre-check
 *
 * S203S. Three lessons targeted for conversion in S203R turned out to already be Tier A, sealed
 * since S147/S151 — content that predates this entire repair workstream. The proposed widgets were
 * mathematically self-consistent (verify-repair-math found nothing wrong) but taught a DIFFERENT,
 * WRONG identity than the one already there: a cofunction swap offered in place of an already-
 * correct sum formula on a lesson literally titled "Sum & Difference". Only the predict-block
 * refusal accidentally stopped it from being written.
 *
 * That is a category of error verify-repair-math cannot catch, because it checks whether a widget's
 * OWN math is self-consistent, never whether the LESSON needed converting at all. So every
 * conversion target is checked against a fresh tier run before anything else: a lesson already at
 * Tier A or B is refused outright, by name, before the schema check even starts. Recomputing tiers
 * costs about a second (measured), so there is no reason to ever skip it. */
{
  const tj = join(root, ".tier-precheck.json");
  const r = spawnSync(process.execPath, [join(root, "scripts/flagship-tier.mjs")],
    { cwd: root, encoding: "utf8", env: { ...process.env, TIER_JSON: tj } });
  must(r.status === 0, `tier pre-check: flagship-tier.mjs failed: ${r.stderr ?? ""}`);
  const rows = new Map(JSON.parse(readFileSync(tj, "utf8")).map((row) => [row.id, row]));
  for (const c of conversions) {
    const row = rows.get(c.lesson);
    must(row, `${c.lesson}: not found in the tier scan — check the lesson id`);
    must(row.tier === "C" || row.tier === "D",
      `${c.lesson}: is ALREADY Tier ${row.tier} (total ${row.total}) — this conversion is not needed and risks REPLACING existing content. Verify the target with a fresh tier check before authoring a patch for it.`);
  }
}

/* ---------------------------------------------------------------- 1. preflight */

const planned = [];
for (const c of conversions) {
  const rel = `content/courses/${c.course}/lessons/${c.lesson}.json`;
  const p = join(root, rel);
  must(existsSync(p), `${c.lesson}: file not found at ${rel}`);
  const lesson = JSON.parse(readFileSync(p, "utf8"));
  const step = lesson.steps.find((s) => s.id === c.step);
  must(step, `${c.lesson}/${c.step}: step not found`);
  must(step.kind === "interactive", `${c.lesson}/${c.step}: expected an interactive step, found ${step.kind}`);
  must(step.widget, `${c.lesson}/${c.step}: has no widget to replace`);
  must(!step.predict, `${c.lesson}/${c.step}: carries a predict block; converting would change prediction scoring`);
  must(c.widget?.type, `${c.lesson}/${c.step}: patch supplies no widget.type`);
  must(step.widget.type !== c.widget.type, `${c.lesson}/${c.step}: already a ${c.widget.type}`);
  planned.push({ ...c, rel, path: p, lesson, step, was: step.widget.type });
}

const plannedIns = [];
for (const ins of insertions) {
  const rel = `content/courses/${ins.course}/lessons/${ins.lesson}.json`;
  const p = join(root, rel);
  must(existsSync(p), `${ins.lesson}: file not found at ${rel}`);
  const lesson = JSON.parse(readFileSync(p, "utf8"));
  const anchorIdx = lesson.steps.findIndex((s) => s.id === ins.after);
  must(anchorIdx >= 0, `${ins.lesson}: anchor step ${ins.after} not found`);
  must(ins.step && typeof ins.step === "object", `${ins.lesson}: insertion supplies no step`);
  must(typeof ins.step.id === "string" && ins.step.id.length > 0, `${ins.lesson}: inserted step needs an id`);
  must(!lesson.steps.some((s) => s.id === ins.step.id),
    `${ins.lesson}: step id ${ins.step.id} already exists — inserted ids must be fresh`);
  must(ins.step.kind === "interactive" && ins.step.widget,
    `${ins.lesson}: insert-after exists to add MANIPULATION; the inserted step must be interactive with a widget`);
  /* The authored-content freeze, enforced structurally: we keep the ORIGINAL step array objects
   * and splice the new one between them, then prove that removing it again reproduces the original
   * serialisation byte for byte. No authored step can drift through this operation. */
  const before = JSON.stringify(lesson.steps);
  const steps = [...lesson.steps.slice(0, anchorIdx + 1), ins.step, ...lesson.steps.slice(anchorIdx + 1)];
  must(JSON.stringify(steps.filter((s) => s !== ins.step)) === before,
    `${ins.lesson}: authored steps changed under insertion — refusing`);
  plannedIns.push({ ...ins, rel, path: p, lesson, steps });
}

/* Schema-validate the whole batch in ONE tsx process — the widget specs are TypeScript, and paying
 * the startup cost once for the batch is the difference between this being cheap and being skipped. */
{
  const probe = planned.map((p) => ({ id: `${p.lesson.id}/${p.step.id}`, widget: p.widget }));
  /* Insertions are validated as WHOLE MODIFIED LESSONS through LessonSpec, not widget-only: an
   * inserted step carries step-level structure (predict block, id, kind) WidgetSpec cannot see,
   * and the failure that matters most is "this lesson no longer parses". */
  const probeLessons = plannedIns.map((p) => ({ id: p.lesson.id, lesson: { ...p.lesson, steps: p.steps } }));
  // Keep the generated probe's root-relative import out of this utility's own static import
  // surface: native-integrity correctly resolves imports relative to THIS file, while the probe
  // is written at repository root. Interpolation preserves the probe path without creating a
  // false unresolved-import contract here.
  const schemaImport = "./src/lib/schema";
  const script = `
    import { WidgetSpec, Lesson } from "${schemaImport}";
    const rows = ${JSON.stringify(probe)};
    const lessons = ${JSON.stringify(probeLessons)};
    const bad = [];
    for (const r of rows) {
      const res = WidgetSpec.safeParse(r.widget);
      if (!res.success) bad.push(r.id + ": " + res.error.issues.map(i => i.path.join(".") + " " + i.message).join("; "));
    }
    for (const l of lessons) {
      const res = Lesson.safeParse(l.lesson);
      if (!res.success) bad.push(l.id + " (inserted): " + res.error.issues.map(i => i.path.join(".") + " " + i.message).join("; "));
    }
    if (bad.length) { for (const b of bad) console.error(b); process.exit(1); }
  `;
  const tmp = join(root, ".widget-probe.mts");
  writeFileSync(tmp, script);
  const r = spawnSync("npx", ["tsx", tmp], { cwd: root, encoding: "utf8" });
  try { writeFileSync(tmp, ""); } catch { /* best effort */ }
  spawnSync("rm", ["-f", tmp], { cwd: root });
  if (r.status !== 0) {
    console.error("\n✗ widget schema violations — run `npx tsx scripts/session/widget-contract.ts <engine>` and fix the patch:\n");
    console.error((r.stdout ?? "") + (r.stderr ?? ""));
    process.exit(1);
  }
  asserts += probe.length;
}

if (dry) {
  console.log(`preflight OK — ${asserts} assertions, ${planned.length} conversions, ${plannedIns.length} insertions, ${refusals.length} refusals`);
  for (const p of planned) console.log(`  ${p.course}/${p.lesson.id}/${p.step.id}: ${p.was} -> ${p.widget.type}`);
  for (const p of plannedIns) console.log(`  ${p.course}/${p.lesson.id}: + ${p.step.id} (${p.step.widget.type}) after ${p.after}`);
  console.log("--dry-run: nothing written.");
  process.exit(0);
}

/* ---------------------------------------------------------------- 2. write */

for (const p of planned) {
  p.step.widget = p.widget;
  writeFileSync(p.path, JSON.stringify(p.lesson, null, 2) + "\n");
}
for (const p of plannedIns) {
  writeFileSync(p.path, JSON.stringify({ ...p.lesson, steps: p.steps }, null, 2) + "\n");
}

/* ---------------------------------------------------------------- 3. authorise, all five places */

const rels = [...new Set([...planned.map((p) => p.rel), ...plannedIns.map((p) => p.rel)])].sort();

/* Which of these are NEW to the changed set? Only those move the s151c count. */
const s151cPath = join(root, "scripts/session/content-change-proof-s151c.mjs");
let s151c = readFileSync(s151cPath, "utf8");
const fresh = rels.filter((r) => !s151c.includes(`'${r}'`));
if (fresh.length) {
  const entries = fresh.map((r) => ` '${r}':'${TAG.toLowerCase()}-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',`).join("\n");
  const close = s151c.indexOf("\n};\nconst lessonPaths=[]");
  must(close !== -1, "s151c: cannot locate the end of the AUTHORIZED object");
  s151c = s151c.slice(0, close) + `\n // ${TAG}: ${patch.label ?? "manipulable repair"}\n${entries}` + s151c.slice(close);
  const re = /const passed=changed\.length===(\d+)&&/;
  const m = s151c.match(re);
  must(Boolean(m), "s151c: cannot locate the pass condition");
  s151c = s151c.replace(re, `const passed=changed.length===${Number(m[1]) + fresh.length}&&`);
  writeFileSync(s151cPath, s151c);
  console.log(`s151c: +${fresh.length} authorized, changed ${m[1]} -> ${Number(m[1]) + fresh.length}`);
} else {
  console.log("s151c: all lessons already authorized (no count change)");
}

/* The four whole-corpus python audits. NOTE the variable-name split — this is the trap. */
const PY = [
  ["scripts/audit/quotient-reasoning-s146.py", "allowed_later"],
  ["scripts/audit/affine-relationship-s147.py", "allowed_later"],
  ["scripts/audit/exact-number-s148.py", "allowed_later"],
  ["scripts/audit/point-set-reasoning-s150.py", "authorized_later"]
];
const setExpr = rels.length ? `{${rels.map((r) => `'${r}'`).join(",")}}` : "set()";
for (const [rel, varName] of PY) {
  const p = join(root, rel);
  let src = readFileSync(p, "utf8");
  if (src.includes(`${TAG}_AUTHORIZED=`)) { console.log(`${rel}: already carries ${TAG}`); continue; }
  /* Insert immediately before the symmetric check / drift loop, where the variable is in scope. */
  const anchors = [
    /^.*if set\(changed\)!=expected_changed\|allowed_later:.*$/m,
    /^.*for rel,h in ledger\.items\(\):.*$/m,
    /^.*mismatches.*=.*\[\].*$/m
  ];
  let placed = false;
  for (const a of anchors) {
    const m = src.match(a);
    if (!m) continue;
    const line = m[0];
    src = src.replace(line, `${TAG}_AUTHORIZED=${setExpr}  # ${TAG}: ${patch.label ?? "manipulable repair"}\n${varName} |= ${TAG}_AUTHORIZED\n${line}`);
    placed = true;
    break;
  }
  must(placed, `${rel}: no known anchor to insert the authorization before`);
  writeFileSync(p, src);
  console.log(`${rel}: +${rels.length} authorized into ${varName}`);
}

console.log(`\n${planned.length} steps converted, ${asserts} assertions passed`);
for (const p of planned) console.log(`  ${p.course}/${p.lesson.id}/${p.step.id}: ${p.was} -> ${p.widget.type}`);
if (refusals.length) {
  console.log(`\nrefused (${refusals.length}) — left at Tier C deliberately:`);
  for (const r of refusals) console.log(`  ${r.lesson} "${r.title ?? ""}"\n    ${r.why}`);
}
console.log(`\nfit rate this batch: ${planned.length}/${planned.length + refusals.length}`);
console.log(`\nNEXT: npm run validate:content && npm run lint:pedagogy && node scripts/flagship-tier.mjs`);
