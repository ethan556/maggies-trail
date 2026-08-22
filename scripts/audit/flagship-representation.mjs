/**
 * Evidence rules for the flagship audit's contrast and transfer dimensions.
 *
 * A concept tag identifies what is being assessed, not how it is represented.
 * Likewise, `kind: "challenge"` identifies placement in a lesson, not transfer.
 * These helpers therefore require a genuinely different authored/generator form
 * before either dimension receives credit.
 */

function normalizedPrompt(step) {
  const prompt = step?.widget?.prompt ?? step?.prompt ?? step?.body ?? "";
  return typeof prompt === "string"
    ? prompt.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US")
    : "";
}

export function representationSignature(step) {
  const generator = step?.variant?.gen;
  if (typeof generator === "string" && generator.trim()) {
    const form = typeof step?.variant?.form === "string" && step.variant.form.trim()
      ? step.variant.form.trim()
      : "default";
    return `variant:${generator.trim()}:${form}`;
  }
  const surface = step?.widget?.type;
  return typeof surface === "string" && surface.trim() ? `surface:${surface.trim()}` : "surface:none";
}

/**
 * Count representation forms without mistaking changed values for changed
 * pedagogy. Repeated generator/form pairs collapse even when their numbers or
 * nouns change. Identical prompts also collapse across nominally different
 * surfaces. Missing prompts do not erase otherwise explicit form evidence.
 */
export function distinctRepresentationCount(steps) {
  const rows = steps.map((step) => ({
    signature: representationSignature(step),
    prompt: normalizedPrompt(step)
  }));
  const signatures = new Set(rows.map((row) => row.signature)).size;
  const prompted = rows.filter((row) => row.prompt);
  if (prompted.length === 0) return signatures;
  const uniquePrompts = new Set(prompted.map((row) => row.prompt)).size;
  const hasMissingPrompt = prompted.length !== rows.length;
  return Math.min(signatures, uniquePrompts + (hasMissingPrompt ? 1 : 0));
}

export function contrastScore(assessedSteps, intrinsicallyCompares = false) {
  if (intrinsicallyCompares) return 3;
  const byConcept = new Map();
  for (const step of assessedSteps) {
    if (!step?.conceptTag) continue;
    if (!byConcept.has(step.conceptTag)) byConcept.set(step.conceptTag, []);
    byConcept.get(step.conceptTag).push(step);
  }
  const maxDistinct = Math.max(0, ...[...byConcept.values()].map(distinctRepresentationCount));
  return maxDistinct >= 3 ? 3 : maxDistinct >= 2 ? 2 : 0;
}

function transferEvidence(challenge, checks) {
  const challengeSignature = representationSignature(challenge);
  const challengePrompt = normalizedPrompt(challenge);
  const relevantChecks = checks.filter((check) =>
    !challenge?.conceptTag || !check?.conceptTag || challenge.conceptTag === check.conceptTag
  );
  if (relevantChecks.length === 0) return 0;
  if (relevantChecks.some((check) => representationSignature(check) === challengeSignature)) return 0;
  if (challengePrompt && relevantChecks.some((check) => normalizedPrompt(check) === challengePrompt)) return 0;
  return relevantChecks.some((check) => challenge?.widget?.type === check?.widget?.type) ? 2 : 3;
}

export function transferScore(checkSteps, challengeSteps) {
  if (checkSteps.length === 0 || challengeSteps.length === 0) return 0;
  return Math.max(0, ...challengeSteps.map((challenge) => transferEvidence(challenge, checkSteps)));
}
