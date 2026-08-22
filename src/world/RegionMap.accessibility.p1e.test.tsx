// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RegionMap, type AtlasRegion } from "./RegionMap";

afterEach(cleanup);

const regions: AtlasRegion[] = Array.from({ length: 14 }, (_, gradeBand) => ({
  id: `region-${gradeBand}`,
  name: `Region ${gradeBand}`,
  gradeBand,
  description: `Grade-band ${gradeBand} region`,
  environmentalGrammar: "A mathematical landscape",
  accessibilityLabel: `Region ${gradeBand}`,
  primaryDomains: [],
  courseCount: 1,
  waypointCount: 1,
}));

const luminance = (hex: string) => {
  const channels = hex.match(/[\da-f]{2}/gi)?.map((part) => Number.parseInt(part, 16) / 255) ?? [];
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
};

const contrast = (foreground: string, background: string) => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
};

describe("Phase 1E — Atlas map label legibility", () => {
  it("keeps all 14 grade labels above the mobile visual-size floor without low-opacity text", () => {
    const { container } = render(
      <RegionMap
        regions={regions}
        activeRegionId="region-0"
        matchedRegionIds={new Set(["region-0"])}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBe("presentation");
    expect(svg?.classList.contains("min-w-[520px]")).toBe(true);

    const labels = Array.from(svg?.querySelectorAll("text") ?? []);
    expect(labels).toHaveLength(14);
    expect(labels.map((label) => label.textContent)).toEqual([
      "K", "1", "2", "3", "4", "5", "6", "7", "8", "A1", "Geo", "A2", "Pre", "Calc",
    ]);

    const viewBoxWidth = Number(svg?.getAttribute("viewBox")?.split(/\s+/)[2]);
    const mobileCanvasWidth = 520;
    for (const label of labels) {
      const authoredSize = Number(label.getAttribute("font-size"));
      expect(authoredSize * mobileCanvasWidth / viewBoxWidth).toBeGreaterThanOrEqual(10);
      expect(Number(label.getAttribute("font-weight"))).toBeGreaterThanOrEqual(700);
      expect(label.hasAttribute("fill-opacity")).toBe(false);
    }
  });

  it("uses AA contrast against both light stage endpoints while cartographic marks may dim", () => {
    const { container } = render(
      <RegionMap
        regions={regions}
        activeRegionId="region-0"
        matchedRegionIds={new Set(["region-0"])}
      />,
    );
    const labels = Array.from(container.querySelectorAll("svg text"));
    // Tailwind ink is #22314f; `.stage` ranges from #fff to #f8fafd.
    expect(Math.min(contrast("#22314f", "#ffffff"), contrast("#22314f", "#f8fafd"))).toBeGreaterThanOrEqual(4.5);
    expect(labels.every((label) => label.getAttribute("fill") === "currentColor")).toBe(true);
    expect(labels.every((label) => !label.hasAttribute("fill-opacity"))).toBe(true);
    expect(container.querySelector('[data-region-point="region-1"] circle')?.getAttribute("fill-opacity")).toBe("0.1125");
  });
});
