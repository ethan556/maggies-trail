import { describe, expect, it } from "vitest";
import { isoWeek } from "./engine";
import { applyXp, bump, emptyProfile, parseStoredProfile, type Profile } from "./progress";

function profile(): Profile {
  return { xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] };
}

describe("applyXp", () => {
  it("bumps total, per-day, and league weekly tally when weeks match", () => {
    const p = profile();
    p.league = { week: isoWeek("2026-07-05"), tier: 0, weeklyXp: 0 };
    applyXp(p, 20, "2026-07-05");
    applyXp(p, 10, "2026-07-05");
    expect(p.xp).toBe(30);
    expect(p.xpByDay?.["2026-07-05"]).toBe(30);
    expect(p.league.weeklyXp).toBe(30);
  });

  it("does not feed a stale league week and ignores non-positive amounts", () => {
    const p = profile();
    p.league = { week: "2026-W01", tier: 0, weeklyXp: 5 };
    applyXp(p, 15, "2026-07-05");
    applyXp(p, 0, "2026-07-05");
    expect(p.league.weeklyXp).toBe(5);
    expect(p.xp).toBe(15);
  });

  it("prunes xpByDay beyond 84 days", () => {
    const p = profile();
    applyXp(p, 5, "2026-01-01");
    applyXp(p, 5, "2026-07-05");
    expect(p.xpByDay?.["2026-01-01"]).toBeUndefined();
    expect(p.xpByDay?.["2026-07-05"]).toBe(5);
  });
});

describe("bump", () => {
  it("counts events", () => {
    const p = profile();
    bump(p, "nightOwl");
    bump(p, "nightOwl");
    expect(p.counters?.nightOwl).toBe(2);
  });
});


describe("parseStoredProfile", () => {
  it("rejects malformed persisted shapes instead of spreading them into the app", () => {
    expect(parseStoredProfile(JSON.stringify({ ...emptyProfile(), lessons: "not-a-map" }))).toBeNull();
  });

  it("repairs mastery written before correctStreak existed", () => {
    const parsed = parseStoredProfile(
      JSON.stringify({
        ...emptyProfile(),
        mastery: {
          fractions: { tag: "fractions", mastery: 0.6, attempts: 3, lastSeen: "2026-07-20" }
        }
      })
    );
    expect(parsed?.mastery?.fractions.correctStreak).toBe(0);
  });
});
