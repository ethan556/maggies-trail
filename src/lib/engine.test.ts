import { describe, expect, it } from "vitest";
import {
  addDays,
  adaptiveAction,
  computeStreak,
  dueItems,
  isoWeek,
  isLocalDateString,
  localDateStr,
  onMiss,
  onReviewResult,
  xpFor,
  type AttemptEvent,
  type ReviewItem
} from "./engine";

describe("local dates", () => {
  it("respects midnight boundaries in local time", () => {
    expect(localDateStr(new Date(2026, 5, 30, 23, 59))).toBe("2026-06-30");
    expect(localDateStr(new Date(2026, 6, 1, 0, 1))).toBe("2026-07-01");
  });
  it("rejects impossible or malformed calendar dates", () => {
    expect(isLocalDateString("2026-02-28")).toBe(true);
    expect(isLocalDateString("2024-02-29")).toBe(true);
    expect(isLocalDateString("2026-02-29")).toBe(false);
    expect(isLocalDateString("2026-02-31")).toBe(false);
    expect(isLocalDateString("2026-13-01")).toBe(false);
    expect(isLocalDateString("2026-7-01")).toBe(false);
  });
  it("adds days across month edges", () => {
    expect(addDays("2026-06-30", 1)).toBe("2026-07-01");
    expect(addDays("2026-07-01", -1)).toBe("2026-06-30");
  });
  it("computes ISO weeks", () => {
    expect(isoWeek("2026-07-02")).toBe(isoWeek("2026-06-30")); // Tue & Thu, same week
    expect(isoWeek("2026-06-28")).not.toBe(isoWeek("2026-06-29")); // Sun vs Mon
  });
});

describe("SM-2-lite scheduler", () => {
  const seed = { conceptTag: "equal-groups", lessonId: "L1", stepId: "k1" };

  it("creates a box-0 item due tomorrow on miss", () => {
    const items = onMiss([], seed, "2026-07-04");
    expect(items).toHaveLength(1);
    expect(items[0].box).toBe(0);
    expect(items[0].due).toBe("2026-07-05");
  });

  it("re-missing the same step resets rather than duplicating", () => {
    let items = onMiss([], seed, "2026-07-04");
    items = onReviewResult(items, items[0].key, true, "2026-07-05"); // box 1
    items = onMiss(items, seed, "2026-07-06");
    expect(items).toHaveLength(1);
    expect(items[0].box).toBe(0);
  });

  it("promotes through 1d/3d/7d/21d and graduates", () => {
    let items = onMiss([], seed, "2026-07-04");
    const key = items[0].key;
    items = onReviewResult(items, key, true, "2026-07-05");
    expect(items[0]).toMatchObject({ box: 1, due: "2026-07-08" });
    items = onReviewResult(items, key, true, "2026-07-08");
    expect(items[0]).toMatchObject({ box: 2, due: "2026-07-15" });
    items = onReviewResult(items, key, true, "2026-07-15");
    expect(items[0]).toMatchObject({ box: 3, due: "2026-08-05" });
    items = onReviewResult(items, key, true, "2026-08-05");
    expect(items).toHaveLength(0); // graduated
  });

  it("demotes to box 0 on a wrong review", () => {
    let items: ReviewItem[] = onMiss([], seed, "2026-07-04");
    items = onReviewResult(items, items[0].key, true, "2026-07-05");
    items = onReviewResult(items, items[0].key, false, "2026-07-08");
    expect(items[0]).toMatchObject({ box: 0, due: "2026-07-09" });
  });

  it("filters due items inclusively", () => {
    const items = onMiss([], seed, "2026-07-04");
    expect(dueItems(items, "2026-07-04")).toHaveLength(0);
    expect(dueItems(items, "2026-07-05")).toHaveLength(1);
    expect(dueItems(items, "2026-07-09")).toHaveLength(1);
  });
});

describe("streaks with weekly auto-freeze", () => {
  it("counts consecutive active days", () => {
    const r = computeStreak(
      { active: ["2026-07-01", "2026-07-02", "2026-07-03"], frozen: [] },
      "2026-07-03"
    );
    expect(r.streak).toBe(3);
    expect(r.newlyFrozen).toHaveLength(0);
  });

  it("gives grace when today is not yet active", () => {
    const r = computeStreak({ active: ["2026-07-02"], frozen: [] }, "2026-07-03");
    expect(r.streak).toBe(1);
  });

  it("bridges a single missed day with one freeze", () => {
    const r = computeStreak({ active: ["2026-07-01", "2026-07-03"], frozen: [] }, "2026-07-03");
    expect(r.streak).toBe(2);
    expect(r.newlyFrozen).toEqual(["2026-07-02"]);
  });

  it("allows only one freeze per ISO week", () => {
    // gaps at 07-02 (Thu) and 06-30 (Tue) — same ISO week
    const r = computeStreak(
      { active: ["2026-06-29", "2026-07-01", "2026-07-03"], frozen: [] },
      "2026-07-03"
    );
    expect(r.streak).toBe(2); // 07-03 + 07-01, chain breaks at 06-30
    expect(r.newlyFrozen).toEqual(["2026-07-02"]);
  });

  it("bridges gaps that fall in different ISO weeks", () => {
    // gaps at 06-28 (Sun, W26) and 07-02 (Thu, W27)
    const r = computeStreak(
      { active: ["2026-06-27", "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-03"], frozen: [] },
      "2026-07-03"
    );
    expect(r.streak).toBe(5);
    expect(r.newlyFrozen).toEqual(["2026-07-02", "2026-06-28"]);
  });

  it("counts previously frozen days as that week's freeze", () => {
    const r = computeStreak(
      { active: ["2026-06-29", "2026-07-01", "2026-07-03"], frozen: ["2026-07-02"] },
      "2026-07-03"
    );
    // 06-30 gap is in the same week as the already-used 07-02 freeze
    expect(r.streak).toBe(2);
    expect(r.newlyFrozen).toHaveLength(0);
  });
});

describe("XP decay", () => {
  it("pays full XP on first try", () => {
    expect(xpFor("check", 0, 0, false)).toBe(10);
    expect(xpFor("challenge", 0, 0, false)).toBe(20);
  });
  it("halves on retry success", () => {
    expect(xpFor("check", 1, 0, false)).toBe(5);
    expect(xpFor("challenge", 1, 0, false)).toBe(10);
  });
  it("pays a sliver on reveal", () => {
    expect(xpFor("check", 2, 0, true)).toBe(1);
    expect(xpFor("challenge", 2, 0, true)).toBe(2);
  });
  it("charges 2 XP per hint with a floor", () => {
    expect(xpFor("challenge", 0, 3, false)).toBe(14);
    expect(xpFor("check", 1, 3, false)).toBe(1); // floors at 1 for solved
    expect(xpFor("check", 2, 3, true)).toBe(0); // floors at 0 for revealed
  });
});

describe("adaptive engine", () => {
  const miss = (t: string): AttemptEvent => ({ conceptTag: t, correct: false, firstTry: false });
  const ace = (t: string): AttemptEvent => ({ conceptTag: t, correct: true, firstTry: true });
  const slow = (t: string): AttemptEvent => ({ conceptTag: t, correct: true, firstTry: false });

  it("remediates after two misses on the same tag", () => {
    expect(adaptiveAction([miss("A"), miss("A")])).toEqual({ type: "remediate", conceptTag: "A" });
  });

  it("catches interleaved misses per tag", () => {
    expect(adaptiveAction([miss("A"), miss("B"), miss("A")])).toEqual({
      type: "remediate",
      conceptTag: "A"
    });
  });

  it("never remediates the same tag twice", () => {
    expect(adaptiveAction([miss("A"), miss("A")], ["A"])).toEqual({ type: "none" });
  });

  it("offers a skip after two consecutive first-try successes", () => {
    expect(adaptiveAction([ace("A"), ace("B")])).toEqual({ type: "offerSkip" });
  });

  it("does not offer a skip for retry successes", () => {
    expect(adaptiveAction([slow("A"), ace("B")])).toEqual({ type: "none" });
  });

  it("stays quiet with mixed signals", () => {
    expect(adaptiveAction([miss("A"), ace("A")])).toEqual({ type: "none" });
    expect(adaptiveAction([])).toEqual({ type: "none" });
  });
});

describe("daily rotation", () => {
  it("maps the epoch to day 1 and wraps at 30", async () => {
    const { dailyIndexFor } = await import("./engine");
    expect(dailyIndexFor("2026-01-01")).toBe(1);
    expect(dailyIndexFor("2026-01-30")).toBe(30);
    expect(dailyIndexFor("2026-01-31")).toBe(1);
    expect(dailyIndexFor("2026-03-01")).toBe(dailyIndexFor("2026-03-31"));
  });

  it("stays in range for past dates too", async () => {
    const { dailyIndexFor } = await import("./engine");
    const d = dailyIndexFor("2025-12-15");
    expect(d).toBeGreaterThanOrEqual(1);
    expect(d).toBeLessThanOrEqual(30);
  });
});
