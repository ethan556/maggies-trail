import { describe, expect, it } from "vitest";
import { hasVariants, variantFor } from "./variants";

describe("variants in practice — what a replay is actually FOR", () => {
  it("a second round of the same chapter gives the same concept with different numbers", () => {
    const tag = "dr-chain-rule";
    expect(hasVariants(tag)).toBe(true);
    const r0 = variantFor(tag, "ch-chain:2026-03-01:0:item-a")!;
    const r1 = variantFor(tag, "ch-chain:2026-03-01:1:item-a")!;
    expect(r0.tag).toBe(r1.tag); // the same IDEA is being practised
    expect(r0.widget).not.toEqual(r1.widget); // with fresh numbers — so it is not a memory test
  });

  it("but the SAME round replays identically — a parent can see exactly what the child saw", () => {
    const a = variantFor("eq-two-step", "ch-eq:2026-03-01:2:item-b")!;
    const b = variantFor("eq-two-step", "ch-eq:2026-03-01:2:item-b")!;
    expect(a).toEqual(b);
  });

  it("a concept with no generator is left exactly as the author wrote it", () => {
    expect(hasVariants("ca-mvt")).toBe(false);
    expect(variantFor("ca-mvt", "anything")).toBeNull(); // never a silent substitution
  });
});
