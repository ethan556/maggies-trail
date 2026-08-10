/** Guards the figure code-split (S110): the synchronous FIGURE_IDS set used
 * for existence gating must exactly match the lazily-loaded FIGURES record —
 * a figure added to one without regenerating the other is a build-time drift
 * this test turns into a red bar. */
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_IDS } from "./figureIds";

describe("figure split integrity", () => {
  it("FIGURE_IDS exactly matches Object.keys(FIGURES)", () => {
    const real = Object.keys(FIGURES).sort();
    const synced = [...FIGURE_IDS].sort();
    expect(synced).toEqual(real);
    expect(real.length).toBeGreaterThan(1000);
  });
});
