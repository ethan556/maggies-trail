// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

/**
 * S237 — A TOKEN BANK MUST NOT SPELL ITS OWN ANSWER.
 *
 * Reported from the running app: "A pizza is fair-cut into 6 slices; you take 5. Build the
 * fraction of the pizza you took." offered the bank  5  /  6  1  — tapping the first three tokens
 * left to right builds 5/6 without reading the story. Measured: 155 of 237 authored
 * buildExpression specs listed the correct sequence as the leading tokens of the bank.
 *
 * The bank is grouped for display — operators and symbols first, then numbers ascending — rather
 * than shuffled. Grouping is stable across visits, and leading with operators means the row cannot
 * read as the answer even by accident. It also stops distractor tokens trailing at the end, where
 * their position alone marked them as the ones not to use.
 *
 * Display order only: evaluate.ts compares the learner's chosen ids against spec.correct and
 * spec.acceptAlso, never against bank position. The last test below pins that.
 */

type Sample = { lesson: string; spec: Extract<TWidget, { type: "buildExpression" }> };

const samples: Sample[] = [];
(function walk(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".json")) {
      let parsedJson: unknown;
      try { parsedJson = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
      const lesson = entry.name.replace(/\.json$/, "");
      (function rec(node: unknown) {
        if (!node || typeof node !== "object") return;
        const record = node as Record<string, unknown>;
        if (record.type === "buildExpression") {
          const parsed = WidgetSpec.safeParse(record);
          if (parsed.success) samples.push({ lesson, spec: parsed.data as Sample["spec"] });
        }
        for (const value of Object.values(record)) rec(value);
      })(parsedJson);
    }
  }
})("content");

/** Labels of the bank buttons, in the order a learner reads them. */
function bankLabels(sample: Sample): string[] {
  const { container } = render(
    <WidgetRenderer spec={sample.spec} value={null} onChange={() => {}} disabled={false} seed={`${sample.lesson}:x`} />
  );
  const labels = Array.from(container.querySelectorAll("button")).map((b) => (b.textContent ?? "").trim());
  cleanup();
  return labels;
}

const answerLabels = (sample: Sample) => {
  const byId = new Map(sample.spec.tokens.map((t) => [t.id, t.label]));
  return sample.spec.correct.map((id) => byId.get(id) ?? id);
};

describe("S237 build-expression token order", () => {
  it("the corpus is real and large", () => {
    expect(samples.length).toBeGreaterThan(200);
  });

  it("SELF-CHECK: the detector fires on the authored order", () => {
    // Feeding the AUTHORED bank straight through is the pre-fix behaviour. If the detector cannot
    // see that, the corpus assertion below passes by blindness.
    const leaking = samples.filter((s) => {
      const byId = new Map(s.spec.tokens.map((t) => [t.id, t.label]));
      const shown = s.spec.tokens.map((t) => t.label);
      return answerLabels(s).every((a, i) => shown[i] === (byId.get(s.spec.tokens[i]?.id ?? "") ?? shown[i]) && shown[i] === a);
    });
    expect(leaking.length).toBeGreaterThan(100); // was 155 at the time of the fix
  });

  it("no rendered bank spells its answer as its leading tokens", () => {
    const leaks: string[] = [];
    for (const sample of samples) {
      const shown = bankLabels(sample);
      const answer = answerLabels(sample);
      if (answer.length && answer.every((a, i) => shown[i] === a)) {
        leaks.push(`${sample.lesson}: ${JSON.stringify(shown.slice(0, 6))} spells ${JSON.stringify(answer)}`);
      }
    }
    expect(leaks.slice(0, 8)).toEqual([]);
  });

  it("every authored token is still offered — reordering must never drop one", () => {
    for (const sample of samples.slice(0, 80)) {
      const shown = bankLabels(sample);
      // Labels are compared trimmed on both sides: some authored tokens are punctuation with
      // surrounding space (interval notation uses a literal ", "), and the DOM read trims.
      const expected = sample.spec.tokens.map((t) => t.label.trim()).sort();
      const offered = shown.filter((l) => expected.includes(l)).sort();
      expect(offered, sample.lesson).toEqual(expected);
    }
  });

  it("display order is not grading order: spec.correct is untouched", () => {
    for (const sample of samples.slice(0, 80)) {
      const before = [...sample.spec.correct];
      bankLabels(sample);
      expect(sample.spec.correct).toEqual(before);
    }
  });
});
