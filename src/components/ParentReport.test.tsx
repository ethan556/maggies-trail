import { describe, expect, it } from "vitest";
import { shakiest, slipping, strongest, tonight, type ParentReportProps, strategyNote } from "./ParentReport";
import type { SkillState } from "@/lib/mastery";

const skill = (tag: string, mastery: number, lastSeen: string, attempts = 3): SkillState => ({
  tag,
  mastery,
  attempts,
  correctStreak: 0,
  lastSeen,
});

const props = (over: Partial<ParentReportProps> = {}): ParentReportProps => ({
  today: "2026-03-01",
  childName: "Ada",
  dueCount: 0,
  skills: {
    fresh: { label: "The Product Rule", lessonId: "dr-03-01", courseTitle: "Calculus: The Derivative" },
    stale: { label: "Reading a Sign Chart", lessonId: "pra-04-01", courseTitle: "Polynomial Analysis" },
    weak: { label: "Adding Unlike Fractions", lessonId: "fm-01-02", courseTitle: "Fractions" },
  },
  mastery: {
    fresh: skill("fresh", 0.92, "2026-02-27"), // seen 2 days ago — no decay yet
    stale: skill("stale", 0.85, "2025-11-01"), // proficient once, and 120 days cold
    weak: skill("weak", 0.35, "2026-02-27"),
  },
  ...over,
});

describe("ParentReport — the three things the aggregate numbers could not say", () => {
  it("names skills in English, from real lesson titles", () => {
    expect(shakiest(props())[0].label).toBe("Adding Unlike Fractions");
    expect(shakiest(props())[0].lessonId).toBe("fm-01-02"); // and links to the lesson that teaches it
  });

  it("surfaces FORGETTING — a skill she had, and is measurably losing", () => {
    const s = slipping(props());
    expect(s.map((r) => r.tag)).toEqual(["stale"]); // the 120-day-old one, not the 2-day-old one
    expect(s[0].scored).toBeGreaterThan(s[0].retained); // she scored higher than she now retains
    expect(s[0].days).toBeGreaterThan(100);
  });

  it("judges 'shaky' on RETAINED mastery, not on a score she once got", () => {
    // `stale` scored 0.85 — above proficient — but has decayed. It must not be called solid on the
    // strength of an old score, and it must not be called shaky either: it belongs in 'slipping'.
    const strongTags = strongest(props()).map((r) => r.tag);
    const shakyTags = shakiest(props()).map((r) => r.tag);
    expect(strongTags).toContain("fresh");
    expect(shakyTags).toContain("weak");
    expect(shakyTags).not.toContain("fresh");
  });

  it("never puts one skill in two lists with two different prescriptions", () => {
    // `stale` scored 0.85 and is 120 days cold, so it decays BELOW the skill she never grasped.
    // Without care it would appear as both "slipping" (review it) and "shaky" (re-teach it).
    const slipTags = slipping(props()).map((r) => r.tag);
    const shakyTags = shakiest(props()).map((r) => r.tag);
    expect(slipTags).toContain("stale");
    expect(shakyTags).not.toContain("stale"); // it needs a REVIEW, not a re-teach
    expect(shakyTags).toContain("weak");
  });

  it("gives ONE concrete action, in the right order of preference", () => {
    expect(tonight(props({ dueCount: 3 })).kind).toBe("review"); // spacing beats everything
    const t = tonight(props({ dueCount: 0 }));
    expect(t.kind).toBe("refresh"); // recovering what she HAD beats building what she never had
    expect(t.row?.label).toBe("Reading a Sign Chart");
    const noSlip = tonight(props({ dueCount: 0, mastery: { weak: skill("weak", 0.35, "2026-02-27") } }));
    expect(noSlip.kind).toBe("reteach");
    expect(noSlip.row?.label).toBe("Adding Unlike Fractions"); // a LESSON, by name — never a percentage
  });

  it("says something honest when there is no evidence yet", () => {
    const empty = props({ mastery: {} });
    expect(shakiest(empty)).toEqual([]);
    expect(tonight(empty).kind).toBe("onward");
  });
});

describe("strategy notes from the process ledger", () => {
  it("picks the dominant signal, phrased tentatively; empty ledgers yield no note", () => {
    expect(strategyNote(undefined)).toBeNull();
    expect(strategyNote({})).toBeNull();
    expect(strategyNote({ oscillating: 3, "wrong-direction": 1 })).toContain("overshoot");
    expect(strategyNote({ "one-control-fixation": 2, oscillating: 1 })).toContain("one control");
  });

  it("ties break on actionability (fixation over direction)", () => {
    expect(strategyNote({ "one-control-fixation": 2, "wrong-direction": 2 })).toContain("one control");
  });
});
