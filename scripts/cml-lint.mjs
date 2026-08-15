#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// S242 / CML-01 — THE FLAG WAS BEING EATEN AS THE ROOT PATH.
// `process.argv[2]` was read directly, so the documented invocation `node scripts/cml-lint.mjs
// --strict` resolved its root to `<cwd>/--strict`, found no `content/courses` under it, walked
// zero files and printed "0 error(s), 0 warning(s)". A gate that reports green having inspected
// nothing is worse than no gate, because it is quoted as evidence. Options are now stripped before
// the positional root is taken, and an unreadable content root exits non-zero instead of passing.
const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const root = path.resolve(positional[0] ?? process.cwd());
const contentRoot = path.join(root, 'content', 'courses');
const mode = process.argv.includes('--strict') ? 'strict' : 'advisory';
if (!fs.existsSync(contentRoot)) {
  console.error(`cml-lint: no content/courses under ${root} — refusing to report a clean scan of nothing.`);
  process.exit(2);
}

const RESPONSE_ONLY = new Set(['numeric', 'mcq', 'fractionEntry', 'pointEntry', 'subitizeFlash']);

// S242 / CML-01 — `DIRECT` IS NOW DERIVED, NOT RETYPED.
//
// THE DEFECT. This was a hand-maintained list of engines that count as direct mathematical
// manipulation, and the repo already had an authority for exactly that judgement:
// `scripts/engine-capabilities.json`, whose `manip` score `engine-registration-contract.mjs`
// calls the registry authority, "cross-checked against source surfaces". The two had drifted.
// The list held 87 of the 112 engines scoring manip ≥ 2 and none of the 11 scoring manip = 1 —
// so its INTENDED rule was plainly `manip ≥ 2`, and the 25 absentees were engines added after
// someone last retyped the list. `extraneousRootLab` (manip 3) was one of them, and its absence
// was what made re-04-02 fail two flagship contracts while carrying a complete CML block.
//
// WHAT DERIVING IT CHANGES, STATED HONESTLY. The set becomes a strict SUPERSET of what was typed
// here, so it cuts both ways and the log should say so:
//   · STRICTER on the flagship and construct contracts — 25 more engines now owe the thirteen
//     flagship fields, the declared invariant and the misconception signatures.
//   · Fires LESS on `prediction-not-causal`, because a prediction sitting on one of those 25 was
//     being reported as uncoupled from manipulation when the manipulation was the step itself.
//     That was a false positive in the literal sense: the rule asks "is there direct manipulation
//     here", the registry says yes, and the lint said no because a list was stale.
// A capability edit can no longer silently demote an engine either: DIRECT_AT_S242 below records
// what was listed on the day this changed, and the lint fails if the derivation stops covering it.
const capabilities = JSON.parse(
  fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'engine-capabilities.json'), 'utf8')
).types;
const MANIP_FLOOR = 2;
// `radicalCheck` scores manip 0 and was nonetheless listed. It is retained as a named exception
// rather than quietly dropped: dropping it would strip the flagship contract from every step that
// uses it, which is the one direction this change must never move.
const DIRECT_EXCEPTIONS = new Set(['radicalCheck']);
const DIRECT_AT_S242 = new Set([
  'affineRelationshipLab', 'quotientReasoningLab', 'proportionalReasoningLab', 'placeValueTransformLab', 'graphStoryLab', 'conditionalTableLab', 'ciCapture', 'triangleConstraintLab', 'coordinateProofLab', 'solidSliceLab', 'lineRelationLab', 'triangleAngleLab', 'verticalLineScanner', 'covariationScrubber', 'samplingBiasLab', 'shapeFamilyBuilder', 'unitRuler', 'tenFrame', 'numberLineHop', 'numberLinePlace', 'baseTenCompose', 'moneyBoard', 'inversePipeline',
  'mixedRegroup', 'columnCalc', 'evalOrder', 'oddEvenPairs', 'placeValue', 'fractionBar',
  'doubleNumberLine', 'fractionGrid', 'percentBar', 'barBuilder', 'ratioTable', 'fractionOfSet',
  'integerChips', 'algebraTiles', 'balanceScale', 'solveBalance', 'functionMachine', 'lineExplore',
  'quadraticExplore', 'expLogExplore', 'systemsExplore', 'plotPoint', 'clockSet', 'angleMeasure', 'areaModel', 'volumeBuilder', 'netFold',
  'transformExplore', 'dilationExplore', 'triangleSolve', 'circleMeasureExplore', 'circleAngleExplore', 'compassConstruct', 'distanceGrid', 'spinnerSim', 'treeDiagram', 'dotPlot',
  'boxPlot', 'scatterFit', 'probabilityArea', 'sampleSim', 'shuffleTest', 'lengthCompare', 'tapDiagram', 'quadDrag',
  'argandExplore', 'signChart', 'radicalCheck', 'graphZoom', 'sequenceBuild', 'unitCircleExplore',
  // S242 / CML-01. `extraneousRootLab` was absent from this set while scoring manip:3 in
  // scripts/engine-capabilities.json — the top manipulation tier, identical to `relatedRatesLab`
  // which is listed, and above `signChart` and `unitCircleExplore` (both manip:2) which are also
  // listed. The omission was an oversight in the set, not a judgement about the engine: it makes
  // the learner drag candidate roots through both the transformed and the original equation, which
  // is direct manipulation by any reading. Its absence made re-04-02 fail `flagship-without-
  // manipulation` and `flagship-missing-direct-surface` despite carrying a complete CML contract.
  // This correction makes the gate STRICTER, never looser: every step on this engine now also owes
  // the construct-stage invariant and misconception-signature checks below.
  'extraneousRootLab',
  'conicLocusLab', 'derivativeRuleLab', 'relatedRatesLab', 'secantSlope', 'vectorExplore', 'matrixTransform', 'polarTrace', 'derivativeTrace', 'riemannSum', 'accumulateArea', 'sliceSum', 'slopeField', 'taylorApprox'
]);

const DIRECT = new Set([
  ...Object.entries(capabilities).filter(([, c]) => (c?.manip ?? 0) >= MANIP_FLOOR).map(([type]) => type),
  ...DIRECT_EXCEPTIONS
]);
// The ratchet. If a capability score is lowered, or an engine is deleted from the registry, an
// engine that used to owe the flagship contract would quietly stop owing it. That is the failure
// this line exists to prevent, and it is a hard exit rather than a warning.
const demoted = [...DIRECT_AT_S242].filter((type) => !DIRECT.has(type));
if (demoted.length) {
  console.error(`cml-lint: ${demoted.join(', ')} dropped out of DIRECT since S242. Raise the capability`
    + ' score back, or add a named exception with a reason — do not let the contract lapse silently.');
  process.exit(2);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}
const getSteps = (json) => Array.isArray(json?.steps) ? json.steps : Array.isArray(json?.lesson?.steps) ? json.lesson.steps : [];
const widgetKind = (step) => {
  const widget = step?.widget ?? step?.interaction ?? step?.assessment;
  return typeof widget === 'string' ? widget : widget?.kind ?? widget?.type ?? step?.widgetKind ?? step?.responseType;
};
const cml = (step) => step?.cml ?? step?.masteryCycle ?? {};

const issues = [];
for (const file of walk(contentRoot)) {
  let json;
  try { json = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  const steps = getSteps(json);
  if (!steps.length) continue;
  const relative = path.relative(root, file);
  const kinds = steps.map(widgetKind).filter(Boolean);
  const responseOnly = kinds.filter((kind) => RESPONSE_ONLY.has(kind)).length;
  const direct = kinds.filter((kind) => DIRECT.has(kind)).length;
  const flagshipSteps = steps.filter((step) => cml(step)?.flagship === true);
  const flagship = Boolean(json?.cml?.flagship ?? json?.flagship) || flagshipSteps.length > 0;

  if (flagship && direct === 0) {
    issues.push({ severity: 'error', code: 'flagship-without-manipulation', file: relative,
      message: 'Flagship lesson has no direct mathematical manipulation.' });
  }
  if (flagship && responseOnly / Math.max(kinds.length, 1) > 0.75) {
    issues.push({ severity: 'warning', code: 'flagship-response-heavy', file: relative,
      message: 'Flagship lesson remains heavily answer-entry/recognition outside its causal pilot step.' });
  }

  steps.forEach((step, index) => {
    const kind = widgetKind(step);
    const meta = cml(step);
    const hasPrediction = Boolean(step?.predict || step?.prediction === true || step?.predictionPrompt);
    if (hasPrediction && !DIRECT.has(kind)) {
      const following = steps.slice(index + 1, index + 4).map(widgetKind);
      if (!following.some((candidate) => DIRECT.has(candidate))) {
        issues.push({ severity: 'warning', code: 'prediction-not-causal', file: relative, step: index,
          message: 'Prediction is not attached to or followed within three steps by direct mathematical manipulation.' });
      }
    }
    if (DIRECT.has(kind) && meta?.stage === 'construct') {
      if (!Array.isArray(meta?.invariants) || meta.invariants.length === 0)
        issues.push({ severity: 'warning', code: 'missing-invariant', file: relative, step: index, message: 'Construct step has no declared invariant.' });
      if (!Array.isArray(meta?.misconceptions) || meta.misconceptions.length === 0)
        issues.push({ severity: 'warning', code: 'missing-misconception-signatures', file: relative, step: index, message: 'Construct step has no misconception signatures.' });
    }
    if (meta?.stage === 'revise' && !meta?.revisionOf)
      issues.push({ severity: 'error', code: 'revision-without-prior-trace', file: relative, step: index, message: 'Revision must reference the prediction or construction being revised.' });
    if ((meta?.translationFrom === undefined) !== (meta?.translationTo === undefined))
      issues.push({ severity: 'error', code: 'incomplete-representation-translation', file: relative, step: index, message: 'Representation translation requires both source and destination.' });

    if (meta?.flagship) {
      const required = [
        ['prediction', hasPrediction], ['direct-surface', DIRECT.has(kind)], ['kernel', Boolean(meta.kernel)],
        ['action-goal', Boolean(meta.actionGoal)], ['invariant', Array.isArray(meta.invariants) && meta.invariants.length > 0],
        ['misconceptions', Array.isArray(meta.misconceptions) && meta.misconceptions.length > 0],
        ['representation-mesh', Array.isArray(meta.representations) && meta.representations.length >= 3],
        ['translation', Boolean(meta.translationFrom && meta.translationTo)], ['counterfactual', Boolean(meta.counterfactualPrompt)],
        ['explanation', Boolean(meta.explanation?.prompt && meta.explanation?.options?.length >= 2)],
        ['fading', Number.isInteger(meta.fadeLevel)], ['transfer', Boolean(meta.transferFamily)], ['delayed-retrieval', meta.delayed === true]
      ];
      for (const [name, ok] of required) if (!ok)
        issues.push({ severity: 'error', code: `flagship-missing-${name}`, file: relative, step: index,
          message: `Flagship CML step is missing its ${name} contract.` });
      const correct = meta.explanation?.options?.filter((option) => option.correct).length ?? 0;
      if (meta.explanation && correct !== 1)
        issues.push({ severity: 'error', code: 'flagship-explanation-answer-count', file: relative, step: index,
          message: 'Flagship explanation must have exactly one correct causal claim.' });
    }
  });
}

const errors = issues.filter((issue) => issue.severity === 'error');
const warnings = issues.filter((issue) => issue.severity === 'warning');
console.log(`CML lint (${mode}): ${errors.length} error(s), ${warnings.length} warning(s)`);
// S242 / CML-01 — ERRORS ARE NEVER TRUNCATED AWAY.
// The old print walked `issues` in file order and cut at 250, so with 300+ warnings an ERROR
// sitting late in the alphabet was silently omitted while the headline count still named it. The
// person reading the log then cannot find the thing they are being told to fix. Errors print in
// full, first; only warnings are capped, and the cap says how many it swallowed.
for (const issue of errors)
  console.log(`ERROR ${issue.code} ${issue.file}${issue.step !== undefined ? `#${issue.step}` : ''}: ${issue.message}`);
const WARN_CAP = 250;
for (const issue of warnings.slice(0, WARN_CAP))
  console.log(`WARNING ${issue.code} ${issue.file}${issue.step !== undefined ? `#${issue.step}` : ''}: ${issue.message}`);
if (warnings.length > WARN_CAP) console.log(`… ${warnings.length - WARN_CAP} additional warning(s) omitted.`);
if (process.argv.includes('--json')) {
  const out = path.join(root, 'CML_STRICT_LEDGER.json');
  fs.writeFileSync(out, JSON.stringify({ mode, generatedFrom: contentRoot, errors, warnings }, null, 2) + '\n');
  console.log(`cml-lint: wrote ${out}`);
}

// S242 / CML-01 — WARNINGS ARE RATCHETED, NOT MERELY COUNTED.
//
// Before this, strict mode failed on errors and printed warnings into the void: nothing stopped
// the next commit adding fifty more, and nothing recorded WHY the existing ones were tolerated.
// CML-01's acceptance is "0 strict errors; every warning fixed or explicitly waived with owner,
// rationale, evidence, and expiry", so the waivers live in CML_WAIVERS.json and this block
// enforces them. A code with no waiver is allowed ZERO occurrences. A waived code is allowed at
// most its recorded count — so the number can only ever be lowered — and the waiver stops working
// on its expiry date, which is what makes it a deferral rather than a permanent exemption.
if (mode === 'strict') {
  const waiverPath = path.join(root, 'CML_WAIVERS.json');
  const waivers = fs.existsSync(waiverPath)
    ? new Map(JSON.parse(fs.readFileSync(waiverPath, 'utf8')).waivers.map((w) => [w.code, w]))
    : new Map();
  const counts = new Map();
  for (const w of warnings) counts.set(w.code, (counts.get(w.code) ?? 0) + 1);
  // Date-only comparison against the expiry string; no clock arithmetic, no timezone surprises.
  const today = new Date().toISOString().slice(0, 10);
  const breaches = [];
  for (const [code, count] of counts) {
    const waiver = waivers.get(code);
    if (!waiver) { breaches.push(`${code}: ${count} warning(s) with no waiver in CML_WAIVERS.json`); continue; }
    if (count > waiver.maxCount)
      breaches.push(`${code}: ${count} warning(s) exceeds the waived ceiling of ${waiver.maxCount} (owner ${waiver.owner})`);
    if (waiver.expires < today)
      breaches.push(`${code}: waiver expired ${waiver.expires} (owner ${waiver.owner}) — fix the class or re-argue the deferral`);
  }
  for (const breach of breaches) console.error(`WAIVER ${breach}`);
  if (breaches.length) {
    console.error(`cml-lint: ${breaches.length} waiver breach(es). A warning class may shrink freely; growing one is a decision, so it has to be written down.`);
    process.exitCode = 1;
  } else if (counts.size) {
    const summary = [...counts].map(([c, n]) => `${c} ${n}/${waivers.get(c).maxCount}`).join(', ');
    console.log(`cml-lint: all warning classes within their waived ceilings (${summary}).`);
  }
}
if (mode === 'strict' && errors.length > 0) process.exitCode = 1;
