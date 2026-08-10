import { describe, expect, it } from "vitest";
import { ensureLeague, genRivals, standings, TIERS } from "./league";
import type { Profile } from "./progress";

function profile(league?: Profile["league"]): Profile {
  return { xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [], league };
}

describe("league", () => {
  it("generates deterministic rivals per week+tier", () => {
    const a = genRivals("2026-W27", 0);
    const b = genRivals("2026-W27", 0);
    const c = genRivals("2026-W28", 0);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a).toHaveLength(19);
    expect(new Set(a.map((r) => r.name)).size).toBe(19);
  });

  it("user wins ties in standings", () => {
    const rivals = genRivals("2026-W27", 0);
    const tieXp = rivals[0].xp;
    const s = standings("2026-W27", 0, tieXp);
    const user = s.find((x) => x.isUser)!;
    const rival = s.find((x) => !x.isUser && x.xp === tieXp)!;
    expect(user.rank).toBeLessThan(rival.rank);
  });

  it("initializes league state without a rollover", () => {
    const p = profile();
    expect(ensureLeague(p, "2026-07-05")).toBe(false);
    expect(p.league).toMatchObject({ tier: 0, weeklyXp: 0 });
  });

  it("promotes a dominant week and resets the tally", () => {
    const p = profile({ week: "2026-W26", tier: 0, weeklyXp: 999999 });
    expect(ensureLeague(p, "2026-07-05")).toBe(true);
    expect(p.league).toMatchObject({ tier: 1, weeklyXp: 0, lastResult: "promoted" });
  });

  it("demotes a zero week (rank 20) but never below the floor", () => {
    const p = profile({ week: "2026-W26", tier: 1, weeklyXp: 0 });
    ensureLeague(p, "2026-07-05");
    expect(p.league).toMatchObject({ tier: 0, lastResult: "demoted" });
    const q = profile({ week: "2026-W26", tier: 0, weeklyXp: 0 });
    ensureLeague(q, "2026-07-05");
    expect(q.league).toMatchObject({ tier: 0, lastResult: "stayed" });
  });

  it("caps promotion at the top tier", () => {
    const p = profile({ week: "2026-W26", tier: TIERS.length - 1, weeklyXp: 999999 });
    ensureLeague(p, "2026-07-05");
    expect(p.league).toMatchObject({ tier: TIERS.length - 1, lastResult: "stayed" });
  });

  it("same-week calls are no-ops (Mon→Tue), and Sun→Mon crosses the ISO boundary", () => {
    const p = profile();
    ensureLeague(p, "2026-07-06"); // Monday
    p.league!.weeklyXp = 42;
    expect(ensureLeague(p, "2026-07-07")).toBe(false); // Tuesday, same ISO week
    expect(p.league!.weeklyXp).toBe(42);
    // 2026-07-05 is a Sunday — the ISO week ENDS there; Monday must roll over.
    const q = profile();
    ensureLeague(q, "2026-07-05");
    expect(ensureLeague(q, "2026-07-06")).toBe(true);
    expect(q.league!.weeklyXp).toBe(0);
  });
});
