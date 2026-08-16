/**
 * S242 / GRB-04 — THE CORRECT TAP MUST NOT ALWAYS BE THE SAME PICTURE.
 *
 * `tapDiagram` is the one engine whose display order IS the authored order: hotspots are laid out
 * by array index (`g0` at 25% of the canvas, `g1` at 75%), and nothing shuffles them, because the
 * positions are the picture. Every other choice engine in this codebase seeded-shuffles for exactly
 * this reason — `mcq` at `widgets.tsx:385`, `matchPairs` at `15377`, `dragBucket` at `15277`.
 *
 * So a generator that builds `[bigger, smaller]` puts the correct answer on the left forever.
 * `GENERATOR_ANSWER_ENTROPY.csv` found three K–2 comparison forms doing precisely that —
 * `compare-groups|more`, `compare-groups|pairUp`, `compare-numerals|greater` — 62 distinct prompts
 * between them and the answer `["g0"]` on every single draw. A pre-reader taps the left picture and
 * is graded correct every time.
 *
 * Nothing could see it. The freshness audit counts distinct WIDGETS and the prompts really are all
 * different; the pedagogy lint reads authored prose, and this is generated. The measurement that
 * finds it is the one below: draw repeatedly and ask whether the correct INDEX ever moves.
 *
 * This walks the live registry rather than a fixture, so a new tapDiagram generator is covered the
 * day it is written.
 */
import { describe, expect, it } from "vitest";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";
import type { Band } from "./difficulty";

const DRAWS = 30;
const BANDS: Band[] = ["support", "core", "stretch"];

/** Both audits used to walk `generator.forms` alone, which skipped every generator's DEFAULT
 * branch — the branch 370 authored steps actually run. `compare-groups`'s default (which is
 * fewer?) carried the same bug as its named siblings and only a source read found it. */
const formsOf = (g: { forms?: readonly string[] }) => {
  const declared = g.forms ?? [];
  return declared.includes("default") ? declared : [...declared, "default"];
};

interface Probe { pair: string; hotspots: number; correctIndexes: Set<string>; draws: number }

const probes: Probe[] = [];
for (const generator of VARIANT_GENERATORS) {
  for (const form of formsOf(generator as { forms?: readonly string[] })) {
    const correctIndexes = new Set<string>();
    let hotspots = 0;
    let draws = 0;
    for (let i = 0; i < DRAWS; i++) {
      let v;
      try { v = variantForGenForm(generator.tag, form, `tapside|${generator.tag}|${form}|${i}`, BANDS[i % 3]); } catch { break; }
      const w = v?.widget as { type?: string; hotspots?: Array<{ correct?: boolean }> } | undefined;
      if (!w || w.type !== "tapDiagram" || !Array.isArray(w.hotspots)) break;
      hotspots = w.hotspots.length;
      draws++;
      correctIndexes.add(w.hotspots.map((h, idx) => (h.correct ? idx : -1)).filter((idx) => idx >= 0).join(","));
    }
    if (draws >= DRAWS && hotspots >= 2) probes.push({ pair: `${generator.tag}|${form}`, hotspots, correctIndexes, draws });
  }
}

describe("S242 — tapDiagram never fixes the correct answer to one position", () => {
  it("found tapDiagram generators to check", () => {
    // Without this the assertion below passes vacuously if the registry shape ever changes.
    expect(probes.length).toBeGreaterThan(5);
  });

  it("moves the correct hotspot across draws in every multi-hotspot form", () => {
    const frozen = probes
      .filter((p) => p.correctIndexes.size === 1)
      .map((p) => `${p.pair}: ${p.hotspots} hotspots, correct always at index ${[...p.correctIndexes][0]} over ${p.draws} draws`);
    expect(
      frozen,
      "a learner can tap the same picture every time and be graded correct without reading the prompt"
    ).toEqual([]);
  });
});
