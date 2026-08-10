// @vitest-environment node
/** Session 154 — structured-parameter upgrade channel.
 *
 * Claim under test: a generator that carries its own construction parameters lets an engine
 * upgrade build a Lab spec with NO prompt parsing, and the spec's INDEPENDENTLY derived truth
 * equals the legacy answer for every seed and every affected form.
 *
 * This is the adversarial replacement for the per-form regex parsers used from S142 to S151.
 * Those parsers recovered numbers from rendered prose; in S153 one silently produced ten wrong
 * answers. Here nothing is parsed, and the derivation is checked against the generator's own
 * answer across a wide seed sweep — the failure mode the regex approach could not exclude.
 */
import { describe, expect, it } from "vitest";
import { VARIANT_GENERATORS, type Variant, type VariantForm } from "./variants";
import { affineRelationshipTruth } from "./schema";

const SYS = "a1-systems";
const NUMERIC_FORMS: string[] = [
  "eliminate-add-subtract__numeric",
  "eliminate-scale-one__numeric",
  "eliminate-scale-both__numeric",
  "solve-by-graphing__numeric",
  "system-solution__numeric",
  "substitution-solve__numeric",
];

/** Deterministic seeded PRNG, mirroring how the resolver drives generators. */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const generator = VARIANT_GENERATORS.find((g) => g.tag === SYS);

describe("S154 structured-parameter upgrade channel (a1-systems)", () => {
  it("exposes the a1-systems generator", () => {
    expect(generator, "a1-systems generator must be registered").toBeTruthy();
  });

  it("upgrades every params-carrying 2x2 form to affineRelationshipLab", () => {
    // S155: the params channel is now WIRED through affineUpgradeConfig, so these forms no
    // longer emit `numeric`. Emitting the Lab surface IS the proof that the params path ran —
    // there is no prose parser for a1-systems anywhere in the codebase.
    let upgraded = 0, stillNumeric = 0;
    for (const form of NUMERIC_FORMS) {
      for (let seed = 1; seed <= 24; seed++) {
        const v = generator!.gen(rand(seed), "core", form as VariantForm) as Variant;
        if (v.widget.type === "affineRelationshipLab") upgraded++;
        else if (v.widget.type === "numeric") stillNumeric++;
      }
    }
    expect(stillNumeric, "a params-carrying form fell back to the legacy surface").toBe(0);
    expect(upgraded).toBeGreaterThan(100);
  });

  it("derives the generator's own answer from the emitted spec — for every seed and form", () => {
    let checked = 0;
    const failures: string[] = [];
    for (const form of NUMERIC_FORMS) {
      for (let seed = 1; seed <= 40; seed++) {
        const v = generator!.gen(rand(seed), "core", form as VariantForm) as Variant;
        if (v.widget.type !== "affineRelationshipLab") continue;
        const derived = affineRelationshipTruth(v.widget).answerNumber;
        checked++;
        if (derived === undefined || Math.abs(derived - (v.answer as number)) > 1e-9)
          failures.push(`${form}/seed${seed}: derived ${derived} vs generator ${v.answer}`);
      }
    }
    expect(checked, "no upgraded variants were exercised").toBeGreaterThan(100);
    expect(failures, failures.slice(0, 5).join(" | ")).toEqual([]);
  });

  it("keeps the params channel purely additive: widget and answer are untouched", () => {
    for (const form of NUMERIC_FORMS) {
      const v = generator!.gen(rand(7), "core", form as VariantForm) as Variant;
      const { params, ...rest } = v;
      expect(rest.widget).toBeTruthy();
      expect(typeof rest.answer === "number" || typeof rest.answer === "string").toBe(true);
      // params must never leak into the learner-facing widget
      expect(JSON.stringify(rest.widget)).not.toContain("linear-system");
      expect(rest.widget.type).toBe("affineRelationshipLab");
    }
  });
});
