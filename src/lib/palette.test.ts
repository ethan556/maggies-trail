import { describe, expect, it } from "vitest";
import { PALETTE, ROLE, roleColor, contrastRatio, luminance } from "./palette";

describe("palette", () => {
  it("has five distinct tokens", () => {
    const vals = Object.values(PALETTE);
    expect(new Set(vals).size).toBe(vals.length);
    expect(vals.length).toBe(5);
  });

  it("every concept role resolves to a real hex", () => {
    for (const role of Object.keys(ROLE) as (keyof typeof ROLE)[]) {
      expect(roleColor(role)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("ink meets WCAG AA (4.5:1) as body text on white", () => {
    expect(contrastRatio(PALETTE.ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("sky (active accent) meets WCAG AA large-text (3:1) on white", () => {
    // WCAG contrast is luminance-based, so it is only used here for text/accent
    // legibility — hue separation between roles is guaranteed by distinct hexes above,
    // not by contrast ratio (two different hues can share luminance).
    expect(contrastRatio(PALETTE.sky, "#FFFFFF")).toBeGreaterThanOrEqual(3);
  });

  it("luminance is monotonic for black < ink < white", () => {
    expect(luminance("#000000")).toBeLessThan(luminance(PALETTE.ink));
    expect(luminance(PALETTE.ink)).toBeLessThan(luminance("#FFFFFF"));
  });
});
