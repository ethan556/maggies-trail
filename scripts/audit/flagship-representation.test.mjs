import test from "node:test";
import assert from "node:assert/strict";
import {
  contrastScore,
  distinctRepresentationCount,
  representationSignature,
  transferScore
} from "./flagship-representation.mjs";

function step({
  kind = "check",
  tag = "compose",
  type = "numeric",
  prompt = "How many are there?",
  gen,
  form
} = {}) {
  return {
    kind,
    conceptTag: tag,
    widget: { type, prompt },
    ...(gen ? { variant: { gen, ...(form ? { form } : {}) } } : {})
  };
}

test("representation signatures prefer generator/form over incidental widget details", () => {
  const first = step({ type: "numeric", gen: "k0-add-subtract", form: "Join" });
  const second = step({ type: "tenFrame", gen: "k0-add-subtract", form: "Join" });
  assert.equal(representationSignature(first), representationSignature(second));
});

test("repeated generator/form attempts do not earn contrast from a repeated conceptTag", () => {
  const attempts = [
    step({ prompt: "3 and 2 make how many?", gen: "k0-add-subtract", form: "Join" }),
    step({ prompt: "4 and 3 make how many?", gen: "k0-add-subtract", form: "Join" }),
    step({ prompt: "5 and 4 make how many?", gen: "k0-add-subtract", form: "Join" })
  ];
  assert.equal(distinctRepresentationCount(attempts), 1);
  assert.equal(contrastScore(attempts), 0);
});

test("identical prompts do not manufacture contrast across nominally different surfaces", () => {
  const attempts = [
    step({ type: "numeric", prompt: "How many are there?" }),
    step({ type: "tenFrame", prompt: "  HOW MANY   are there?  " })
  ];
  assert.equal(distinctRepresentationCount(attempts), 1);
  assert.equal(contrastScore(attempts), 0);
});

test("genuinely different forms can earn contrast", () => {
  const attempts = [
    step({ type: "tenFrame", prompt: "Build both groups.", gen: "k0-add-subtract", form: "JoinFrame" }),
    step({ type: "numberLine", prompt: "Show the join as hops.", gen: "k0-add-subtract", form: "JoinLine" }),
    step({ type: "buildExpression", prompt: "Write an equation for the join.", gen: "k0-add-subtract", form: "JoinEquation" })
  ];
  assert.equal(distinctRepresentationCount(attempts), 3);
  assert.equal(contrastScore(attempts), 3);
});

test("a challenge repeating the check generator/form earns no transfer", () => {
  const check = step({ gen: "k0-add-subtract", form: "Join" });
  const challenge = step({ kind: "challenge", prompt: "Now solve 8 + 7.", gen: "k0-add-subtract", form: "Join" });
  assert.equal(transferScore([check], [challenge]), 0);
});

test("a challenge must be novel relative to every earlier check of the concept", () => {
  const checks = [
    step({ type: "tenFrame", prompt: "Build the groups.", gen: "k0-add-subtract", form: "JoinFrame" }),
    step({ type: "numeric", prompt: "Find the total.", gen: "k0-add-subtract", form: "JoinEquation" })
  ];
  const challenge = step({
    kind: "challenge",
    type: "numeric",
    prompt: "Find a new total.",
    gen: "k0-add-subtract",
    form: "JoinEquation"
  });
  assert.equal(transferScore(checks, [challenge]), 0);
});

test("an identical challenge prompt earns no transfer even when the surface label changes", () => {
  const check = step({ type: "numeric", prompt: "How many are there?" });
  const challenge = step({ kind: "challenge", type: "tenFrame", prompt: "How many are there?" });
  assert.equal(transferScore([check], [challenge]), 0);
});

test("a distinct form on the same surface earns bounded transfer credit", () => {
  const check = step({ type: "numeric", prompt: "Find the total.", gen: "k0-add-subtract", form: "JoinEquation" });
  const challenge = step({
    kind: "challenge",
    type: "numeric",
    prompt: "Find the missing group.",
    gen: "k0-add-subtract",
    form: "MissingAddendEquation"
  });
  assert.equal(transferScore([check], [challenge]), 2);
});

test("a challenge using a distinct representation and prompt can earn transfer", () => {
  const check = step({ type: "tenFrame", prompt: "Build both groups.", gen: "k0-add-subtract", form: "JoinFrame" });
  const challenge = step({
    kind: "challenge",
    type: "numberLine",
    prompt: "Show the same relationship as hops.",
    gen: "k0-add-subtract",
    form: "JoinLine"
  });
  assert.equal(transferScore([check], [challenge]), 3);
});

test("a challenge without an earlier check cannot demonstrate transfer", () => {
  assert.equal(transferScore([], [step({ kind: "challenge", type: "numberLine" })]), 0);
});
