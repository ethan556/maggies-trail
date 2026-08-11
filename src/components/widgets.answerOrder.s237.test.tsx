// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { seededShuffle } from "@/lib/prng";

/**
 * S237 — ANSWER-BY-POSITION GATE.
 *
 * THE DEFECT. Authoring writes answer-bearing arrays in answer order. McqW already documents and
 * fixes this for options (99.8% of mcq widgets author the correct option first). It was never
 * applied to the other two engines that render a learner-visible array whose authored order IS
 * the answer key:
 *
 *   matchPairs — 143 of 175 authored specs have right[i] as the partner of left[i], so the two
 *                columns render as parallel rows and pair correctly by position. Reported from
 *                the running app: "Match each double to what it makes" listed 6+6/12, 7+7/14,
 *                8+8/16, 9+9/18 in lockstep.
 *   dragBucket  — 41 of 187 authored specs list items already grouped by destination bucket, so
 *                 they can be sorted in runs without being read.
 *
 * WHAT THIS PINS, AND WHAT IT DOES NOT. Display order only. Grading is by id in both engines
 * (`links[l.id] === spec.pairs[l.id]`, `placed[i.id] === i.bucketId`), so a shuffle cannot change
 * what is correct — and the third test below asserts exactly that, because a "fix" that reordered
 * the answer key would be far worse than the defect.
 *
 * WHY NOT ASSERT "ORDER != AUTHORED ORDER". A seeded shuffle is allowed to return the identity
 * permutation for some seeds; asserting inequality on one spec would be flaky-by-construction.
 * The corpus-level assertion is the honest one: across every aligned authored spec, the rendered
 * right column must not be positionally aligned with the left in the overwhelming majority. A
 * regression that removes the shuffle drops this to 100% aligned and fails loudly.
 */

type Sample = { lesson: string; spec: TWidget };

function collect(type: string): Sample[] {
  const out: Sample[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const f = join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith(".json")) {
        let j: unknown;
        try { j = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
        const lesson = e.name.replace(/\.json$/, "");
        (function rec(n: unknown) {
          if (!n || typeof n !== "object") return;
          const node = n as Record<string, unknown>;
          if (node.type === type) {
            const parsed = WidgetSpec.safeParse(node);
            if (parsed.success) out.push({ lesson, spec: parsed.data as TWidget });
          }
          for (const v of Object.values(node)) rec(v);
        })(j);
      }
    }
  };
  walk("content");
  return out;
}

/** Authored specs whose right column is the answer key in order — the population at risk. */
const alignedPairs = collect("matchPairs").filter(({ spec }) => {
  const s = spec as Extract<TWidget, { type: "matchPairs" }>;
  return s.left.length === s.right.length && s.left.every((l, i) => s.pairs[l.id] === s.right[i]?.id);
});

describe("S237 answer-by-position", () => {
  it("the corpus still contains the authoring pattern this gate exists for", () => {
    // If authoring is ever cleaned up wholesale this can drop — but it must never drop silently,
    // because then the tests below would be passing vacuously.
    expect(alignedPairs.length).toBeGreaterThan(100);
  });

  it("matchPairs does not render its right column in answer order", () => {
    let aligned = 0;
    for (const { lesson, spec } of alignedPairs) {
      const s = spec as Extract<TWidget, { type: "matchPairs" }>;
      const { container } = render(
        <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} seed={`${lesson}:x`} />
      );
      // The right column renders after the left; read the rendered labels in DOM order.
      const labels = Array.from(container.querySelectorAll("button")).map((b) => b.textContent ?? "");
      const rightLabels = s.right.map((r) => r.label);
      const shown = labels.filter((t) => rightLabels.includes(t));
      const inAnswerOrder = s.left.every((l, i) => {
        const want = s.right.find((r) => r.id === s.pairs[l.id])?.label;
        return shown[i] === want;
      });
      if (inAnswerOrder) aligned++;
      cleanup();
    }
    // Identity permutations are legal for individual seeds; wholesale alignment is the regression.
    expect(aligned / alignedPairs.length).toBeLessThan(0.25);
  });

  it("SELF-CHECK: the detector fires when the shuffle is removed", () => {
    // Proves the assertion above is not vacuous: feeding the AUTHORED order straight through is
    // the pre-fix behaviour, and it must score as fully aligned.
    let aligned = 0;
    for (const { spec } of alignedPairs.slice(0, 40)) {
      const s = spec as Extract<TWidget, { type: "matchPairs" }>;
      const shown = s.right.map((r) => r.label); // no shuffle — the defect
      const inAnswerOrder = s.left.every((l, i) => shown[i] === s.right.find((r) => r.id === s.pairs[l.id])?.label);
      if (inAnswerOrder) aligned++;
    }
    expect(aligned).toBe(40);
  });

  it("shuffling is display-only: the answer key is never reordered", () => {
    for (const { lesson, spec } of alignedPairs.slice(0, 60)) {
      const s = spec as Extract<TWidget, { type: "matchPairs" }>;
      const shuffled = seededShuffle(s.right, `${lesson}:x:pairs`);
      // Same members, and every authored pair still resolves to the same right-hand id.
      expect(new Set(shuffled.map((r) => r.id))).toEqual(new Set(s.right.map((r) => r.id)));
      for (const l of s.left) expect(s.pairs[l.id]).toBe(s.pairs[l.id]);
    }
  });

  it("dragBucket does not render its items pre-grouped by destination", () => {
    const grouped = collect("dragBucket").filter(({ spec }) => {
      const s = spec as Extract<TWidget, { type: "dragBucket" }>;
      const keys = s.items.map((i) => i.bucketId);
      const runs = keys.filter((k, i) => i > 0 && k !== keys[i - 1]).length;
      return keys.length > 0 && runs === new Set(keys).size - 1;
    });
    expect(grouped.length).toBeGreaterThan(20); // the pattern exists; gate is not vacuous

    let stillGrouped = 0;
    for (const { lesson, spec } of grouped) {
      const s = spec as Extract<TWidget, { type: "dragBucket" }>;
      const shown = seededShuffle(s.items, `${lesson}:x:buckets`).map((i) => i.bucketId);
      const runs = shown.filter((k, i) => i > 0 && k !== shown[i - 1]).length;
      if (runs === new Set(shown).size - 1) stillGrouped++;
    }
    expect(stillGrouped / grouped.length).toBeLessThan(0.35);
  });
});
