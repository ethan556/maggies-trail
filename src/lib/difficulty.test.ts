// The difficulty ladder's policy, pinned. The whole point of a deterministic
// ladder is that these are FACTS about a function, not tendencies of a model.
import { describe, expect, it } from "vitest";
import { recommendBand } from "./difficulty";
import type { SkillState } from "./mastery";

const TODAY = "2026-07-16";
const skill = (over: Partial<SkillState>): SkillState => ({
  tag: "t",
  mastery: 0.5,
  attempts: 4,
  correctStreak: 0,
  lastSeen: TODAY,
  ...over
});

describe("recommendBand", () => {
  it("no evidence → core (the authored difficulty is the calibration probe)", () => {
    expect(recommendBand(undefined, TODAY)).toBe("core");
    expect(recommendBand(skill({ attempts: 0 }), TODAY)).toBe("core");
  });

  it("fragile retained mastery → support; solid mastery with a streak → stretch; between → core", () => {
    expect(recommendBand(skill({ mastery: 0.2 }), TODAY)).toBe("support");
    expect(recommendBand(skill({ mastery: 0.9, correctStreak: 3 }), TODAY)).toBe("stretch");
    expect(recommendBand(skill({ mastery: 0.9, correctStreak: 1 }), TODAY)).toBe("core");
    expect(recommendBand(skill({ mastery: 0.5 }), TODAY)).toBe("core");
  });

  it("stretch is judged on RETAINED mastery: a high old score decays out of stretch", () => {
    const stale = skill({ mastery: 0.9, correctStreak: 5, lastSeen: "2026-01-05" });
    expect(recommendBand(stale, TODAY)).not.toBe("stretch");
  });

  it("ledger pressure (≥2 signals) shifts one band down — and never up", () => {
    expect(recommendBand(skill({ mastery: 0.9, correctStreak: 3, signals: { oscillating: 2 } }), TODAY)).toBe("core");
    expect(recommendBand(skill({ mastery: 0.5, signals: { "wrong-direction": 1, "one-control-fixation": 1 } }), TODAY)).toBe("support");
    expect(recommendBand(skill({ mastery: 0.2, signals: { oscillating: 5 } }), TODAY)).toBe("support"); // floor
    // a single latch is exploration, not pressure
    expect(recommendBand(skill({ mastery: 0.5, signals: { oscillating: 1 } }), TODAY)).toBe("core");
  });

  it("is a pure function: identical inputs, identical band", () => {
    const s = skill({ mastery: 0.72, correctStreak: 4, signals: { oscillating: 1 } });
    expect(recommendBand(s, TODAY)).toBe(recommendBand(s, TODAY));
  });
});
