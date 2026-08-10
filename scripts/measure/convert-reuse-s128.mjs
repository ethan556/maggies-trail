#!/usr/bin/env node
/**
 * Session 128 proof-carrying reuse wave.
 *
 * Converts only the four variant-free ruler-reading steps whose authored claim is exactly
 * represented by unitRuler. The converter aborts before any write unless:
 *   - the source file matches the sealed Session-127 hash;
 *   - every independently derived length equals the frozen numeric answer;
 *   - each authored numeric misconception remains a reachable placement count;
 *   - all non-widget lesson surfaces, step order, and non-target steps remain byte-equivalent.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const baseline = JSON.parse(readFileSync("SESSION127_LESSON_HASHES.json", "utf8"));
const sha = (value) => createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest("hex");
const canonical = (value) => JSON.stringify(value);
const without = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));

const PLAN = {
  "content/courses/measure-money-time/lessons/mmt-01-02.json": {
    i1: { start: 4, end: 10 },
    i2: { start: 1, end: 6 },
    i3: { start: 3, end: 11 }
  },
  "content/courses/measure-money-time/lessons/mmt-01-03.json": {
    i2: { start: 0, end: 7 }
  }
};

const staged = [];
for (const [path, steps] of Object.entries(PLAN)) {
  const raw = readFileSync(path);
  const beforeFileSha = sha(raw);
  if (baseline.files[path] !== beforeFileSha)
    throw new Error(`${path}: source hash differs from sealed Session 127 — ABORT`);
  const before = JSON.parse(raw);
  const after = structuredClone(before);
  const targetIds = Object.keys(steps);
  const entry = {
    path,
    beforeFileSha256: beforeFileSha,
    topLevelWithoutStepsSha256: sha(without(before, ["steps"])),
    stepOrderSha256: sha(before.steps.map((s) => s.id)),
    nonTargetStepsSha256: sha(before.steps.filter((s) => !targetIds.includes(s.id))),
    changes: []
  };

  for (const [stepId, plan] of Object.entries(steps)) {
    const source = before.steps.find((s) => s.id === stepId);
    const target = after.steps.find((s) => s.id === stepId);
    if (!source || !target) throw new Error(`${path}/${stepId}: step not found`);
    if ("variant" in source || "variants" in source || source.widget?.variant)
      throw new Error(`${path}/${stepId}: variant-bearing step — ABORT`);
    if (source.widget?.type !== "numeric") throw new Error(`${path}/${stepId}: expected numeric source`);
    const derived = plan.end - plan.start;
    if (derived !== source.widget.answer)
      throw new Error(`${path}/${stepId}: end−start ${derived} != frozen answer ${source.widget.answer}`);
    const commonPlacements = source.widget.commonErrors.map((error) => ({
      placements: error.value,
      feedback: error.feedback
    }));
    for (const c of commonPlacements) {
      if (!Number.isInteger(c.placements) || c.placements < 0 || c.placements > 20)
        throw new Error(`${path}/${stepId}: misconception ${c.placements} is outside the 0–20 ruler`);
      if (c.placements === derived)
        throw new Error(`${path}/${stepId}: misconception equals correct placement count`);
    }
    if (new Set(commonPlacements.map((c) => c.placements)).size !== commonPlacements.length)
      throw new Error(`${path}/${stepId}: duplicate misconception placement`);

    const spec = {
      type: "unitRuler",
      prompt: source.widget.prompt,
      objectStart: plan.start,
      objectEnd: plan.end,
      allowedUnitSizes: [0.5, 1, 2],
      targetUnitSize: 1,
      startUnitSize: 2,
      requiredPlacements: derived,
      commonPlacements,
      successFeedback: source.widget.fallbackFeedback,
      alignFeedback: `Align zero with the object's starting mark at ${plan.start} before counting units.`,
      gapOverlapFeedback: `Cover only the distance from ${plan.start} to ${plan.end} with equal units — no gaps, overlaps, or extra units.`,
      unitFeedback: "Use one-inch units so the unit count is the length in inches."
    };
    if (spec.requiredPlacements * spec.targetUnitSize !== spec.objectEnd - spec.objectStart)
      throw new Error(`${path}/${stepId}: unitRuler invariant failed`);

    const frozenSurface = without(source, ["widget"]);
    target.widget = spec;
    entry.changes.push({
      stepId,
      reason: "Broken representation: the authored ruler was described but not drawn; unitRuler now renders the shifted start and preserves end−start.",
      frozenAnswer: source.widget.answer,
      independentlyDerivedAnswer: derived,
      beforeWidgetSha256: sha(source.widget),
      afterWidgetSha256: sha(spec),
      frozenStepSurfaceSha256: sha(frozenSurface),
      preservedMisconceptions: commonPlacements
    });
  }

  if (sha(without(after, ["steps"])) !== entry.topLevelWithoutStepsSha256)
    throw new Error(`${path}: top-level lesson surface changed`);
  if (sha(after.steps.map((s) => s.id)) !== entry.stepOrderSha256)
    throw new Error(`${path}: step order changed`);
  if (sha(after.steps.filter((s) => !targetIds.includes(s.id))) !== entry.nonTargetStepsSha256)
    throw new Error(`${path}: non-target step changed`);
  for (const change of entry.changes) {
    const step = after.steps.find((s) => s.id === change.stepId);
    if (sha(without(step, ["widget"])) !== change.frozenStepSurfaceSha256)
      throw new Error(`${path}/${change.stepId}: frozen step surface changed`);
  }
  const text = JSON.stringify(after, null, 1) + "\n";
  entry.afterFileSha256 = sha(text);
  staged.push({ path, text, entry });
}

// Every assertion above completed before the first write.
for (const item of staged) writeFileSync(item.path, item.text);
const ledger = {
  session: 128,
  baseline: "SESSION127_LESSON_HASHES.json",
  policy: "Only widget specifications on the listed steps changed; every other authored surface is hash-proved.",
  files: staged.map((item) => item.entry)
};
writeFileSync("SESSION128_CONTENT_CHANGE_LEDGER.json", JSON.stringify(ledger, null, 2) + "\n");
console.log(`Session 128 reuse wave: ${ledger.files.length} lessons, ${ledger.files.reduce((n, f) => n + f.changes.length, 0)} steps converted`);
