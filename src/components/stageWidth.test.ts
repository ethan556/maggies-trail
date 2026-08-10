// Width-tier contract: every registered widget has a deliberate tier, the
// tiers map to real (statically-enumerated) Tailwind classes, and the
// judgment calls that define the system hold — reading surfaces stay narrow,
// laboratories earn the wide stage.
import { describe, expect, it } from "vitest";
import { REGISTERED_WIDGETS } from "./widgets";
import { STAGE_TIER, stageWidthClass, stepTier } from "./stageWidth";
import type { TWidget } from "@/lib/schema";

describe("stage width tiers", () => {
  it("covers every registered widget (and nothing else)", () => {
    const tiers = Object.keys(STAGE_TIER).sort();
    const registered = [...REGISTERED_WIDGETS].sort();
    expect(tiers).toEqual(registered);
  });

  it("maps each tier to a distinct, monotone width class", () => {
    expect(stageWidthClass("narrow")).toBe("max-w-xl");
    expect(stageWidthClass("medium")).toBe("max-w-2xl");
    expect(stageWidthClass("wide")).toBe("max-w-3xl");
  });

  it("prose-only steps (no widget) get the reading column", () => {
    expect(stepTier(undefined)).toBe("narrow");
  });

  it("text-first answering surfaces stay at reading width", () => {
    for (const t of ["mcq", "numeric", "buildExpression", "dragOrder"] as const) {
      expect(STAGE_TIER[t]).toBe("narrow");
    }
  });

  it("mathematical laboratories earn the wide stage", () => {
    const labs: Array<TWidget["type"]> = [
      "lineExplore",
      "quadraticExplore",
      "systemsExplore",
      "riemannSum",
      "slopeField",
      "matrixTransform",
      "unitCircleExplore",
      "compassConstruct",
      "sampleSim"
    ];
    for (const t of labs) expect(STAGE_TIER[t], t).toBe("wide");
  });

  it("compact visual tools sit between", () => {
    for (const t of ["tenFrame", "fractionBar", "numberLineHop", "clockSet"] as const) {
      expect(STAGE_TIER[t]).toBe("medium");
    }
  });
});
