import { describe, expect, it } from "vitest";
import {
  factFamilyKey, parseFactFamily, factsForTable, fullFactUniverse,
  emptyFact, applyFactResult, dueFacts, weakestFacts, seededFactPick, factDrillFor, factReviewKey, sumFamilyKey, parseFamily, sumFactUniverse,
  FACT_INTERVALS, type FactItemState,
} from "./factFluency";

describe("S186 factFamilyKey / parseFactFamily — commutative canonical identity", () => {
  it("orders factors low-to-high regardless of call order", () => {
    expect(factFamilyKey(7, 8)).toBe("7x8");
    expect(factFamilyKey(8, 7)).toBe("7x8");
    expect(factFamilyKey(3, 3)).toBe("3x3");
    expect(factFamilyKey(0, 9)).toBe("0x9");
  });
  it("round-trips through parseFactFamily", () => {
    for (const [a, b] of [[7, 8], [8, 7], [0, 0], [10, 10], [2, 9]] as const) {
      const key = factFamilyKey(a, b);
      const { lo, hi, product } = parseFactFamily(key);
      expect(lo).toBe(Math.min(a, b));
      expect(hi).toBe(Math.max(a, b));
      expect(product).toBe(a * b);
    }
  });
  it("rejects a malformed key", () => {
    expect(() => parseFactFamily("garbage")).toThrow();
    expect(() => parseFactFamily("7*8")).toThrow();
  });
});

describe("S186 factsForTable — one table's fact pool", () => {
  it("×7 over 0..10 yields 11 distinct families, all containing 7", () => {
    const pool = factsForTable(7, 0, 10);
    expect(pool).toHaveLength(11);
    expect(new Set(pool).size).toBe(11);
    for (const key of pool) {
      const { lo, hi } = parseFactFamily(key);
      expect(lo === 7 || hi === 7).toBe(true);
    }
    // the self-fact (7x7) must appear exactly once, not doubled
    expect(pool.filter((k) => k === "7x7")).toHaveLength(1);
  });
  it("is stable and deterministic across repeated calls", () => {
    expect(factsForTable(6, 0, 10)).toEqual(factsForTable(6, 0, 10));
  });
  it("respects a narrower range", () => {
    const pool = factsForTable(9, 2, 5);
    expect(pool).toEqual(["2x9", "3x9", "4x9", "5x9"]);
  });
});

describe("S186 fullFactUniverse — the whole-table pool", () => {
  const uni = fullFactUniverse(0, 10);
  it("has exactly C(12,2)+12 = 66 unique families for 0..10", () => {
    // unordered pairs with repetition from 11 values: 11*12/2 = 66
    expect(uni).toHaveLength(66);
    expect(new Set(uni).size).toBe(66);
  });
  it("every table's pool is a subset of the universe", () => {
    for (let t = 0; t <= 10; t++) {
      const table = factsForTable(t, 0, 10);
      for (const key of table) expect(uni).toContain(key);
    }
  });
  it("contains no duplicate-order entries (7x8 present, 8x7 absent)", () => {
    expect(uni).toContain("7x8");
    expect(uni).not.toContain("8x7");
  });
});

describe("S186 applyFactResult / dueFacts — leech-box progression", () => {
  const today = "2026-08-02";
  it("a first correct answer creates state at box 1, due after the first interval", () => {
    const s = applyFactResult({}, "7x8", true, today);
    expect(s["7x8"].box).toBe(1);
    expect(s["7x8"].correctStreak).toBe(1);
    expect(s["7x8"].misses).toBe(0);
    const expectedDue = new Date(today); expectedDue.setDate(expectedDue.getDate() + FACT_INTERVALS[0]);
    expect(s["7x8"].due).not.toBe("");
  });
  it("a miss always resets box to 0 and re-arms the shortest interval, regardless of prior progress", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "6x9", true, today);
    s = applyFactResult(s, "6x9", true, today);
    s = applyFactResult(s, "6x9", true, today);
    expect(s["6x9"].box).toBe(3);
    s = applyFactResult(s, "6x9", false, today);
    expect(s["6x9"].box).toBe(0);
    expect(s["6x9"].misses).toBe(1);
    expect(s["6x9"].correctStreak).toBe(0);
  });
  it("graduates past the last interval: due clears and stays cleared", () => {
    let s: Record<string, FactItemState> = {};
    for (let i = 0; i < FACT_INTERVALS.length; i++) s = applyFactResult(s, "2x2", true, today);
    expect(s["2x2"].box).toBe(FACT_INTERVALS.length);
    expect(s["2x2"].due).toBe("");
    // one more correct answer past graduation must not error or un-graduate
    s = applyFactResult(s, "2x2", true, today);
    expect(s["2x2"].due).toBe("");
  });
  it("dueFacts only returns families with a real due date <= today, never graduated ones", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "3x4", false, today); // due = today+1
    s = applyFactResult(s, "5x5", true, today);
    for (let i = 0; i < FACT_INTERVALS.length; i++) s = applyFactResult(s, "9x9", true, today); // graduated
    expect(dueFacts(s, today)).toEqual([]); // nothing due YET (3x4 due tomorrow, 9x9 graduated)
    const tomorrow = "2026-08-03";
    expect(dueFacts(s, tomorrow)).toContain("3x4");
    expect(dueFacts(s, tomorrow)).not.toContain("9x9");
  });
  it("is a pure function: does not mutate the input map", () => {
    const s0: Record<string, FactItemState> = { "7x7": emptyFact("7x7", today) };
    const frozen = JSON.stringify(s0);
    applyFactResult(s0, "7x7", true, today);
    expect(JSON.stringify(s0)).toBe(frozen);
  });
});

describe("S186 weakestFacts — deterministic priority selection", () => {
  const today = "2026-08-02";
  it("never-seen families outrank every seen family, regardless of the seen families' states", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "2x2", false, today); // due today, box 0 — as weak as a seen fact gets
    const pool = ["2x2", "9x9"]; // 9x9 never seen
    expect(weakestFacts(s, pool, 1, today)).toEqual(["9x9"]);
  });
  it("among seen families, due-and-overdue outranks not-yet-due", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "3x3", false, today); // due today
    s = applyFactResult(s, "4x4", true, today); // due in the future, box 1
    expect(weakestFacts(s, ["3x3", "4x4"], 2, today)).toEqual(["3x3", "4x4"]);
  });
  it("within the same tier, lower box ranks first (shakier progress first)", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "5x5", false, today);
    s = applyFactResult(s, "5x5", true, today); // box 1, due future
    s = applyFactResult(s, "6x6", false, today);
    s = applyFactResult(s, "6x6", true, today);
    s = applyFactResult(s, "6x6", true, today); // box 2, due future
    expect(weakestFacts(s, ["5x5", "6x6"], 2, today)).toEqual(["5x5", "6x6"]);
  });
  it("is a total, argument-order-independent order — ties break on lastSeen then key", () => {
    const a = weakestFacts({}, ["9x9", "2x2", "5x5"], 3, today);
    const b = weakestFacts({}, ["5x5", "9x9", "2x2"], 3, today);
    expect(a).toEqual(b);
    expect(a).toEqual(["2x2", "5x5", "9x9"]); // all box -1 (never seen): pure key-ascending tiebreak
  });
  it("respects the pool restriction: a table lesson never proposes a family outside its pool", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "1x2", false, today);
    const pool = factsForTable(7, 0, 10);
    const picks = weakestFacts(s, pool, 5, today);
    for (const p of picks) expect(pool).toContain(p);
    expect(picks).not.toContain("1x2");
  });
  it("caps at n and never returns more than the pool has", () => {
    expect(weakestFacts({}, ["1x1", "2x2"], 10, today)).toHaveLength(2);
    expect(weakestFacts({}, [], 5, today)).toEqual([]);
  });
});

describe("S186 seededFactPick — coverage-guaranteed static selection for authored generators", () => {
  it("is a pure deterministic function of (pool, seed)", () => {
    const pool = factsForTable(7, 0, 10);
    expect(seededFactPick(pool, 5)).toBe(seededFactPick(pool, 5));
  });
  it("sweeps the whole pool before repeating across consecutive seeds", () => {
    const pool = factsForTable(6, 0, 10);
    const seen = new Set<string>();
    for (let seed = 0; seed < pool.length; seed++) seen.add(seededFactPick(pool, seed));
    expect(seen.size).toBe(pool.length);
  });
  it("handles negative seeds without throwing or returning undefined", () => {
    const pool = factsForTable(4, 0, 10);
    for (const seed of [-1, -7, -100]) {
      const pick = seededFactPick(pool, seed);
      expect(pool).toContain(pick);
    }
  });
  it("throws on an empty pool rather than returning undefined", () => {
    expect(() => seededFactPick([], 0)).toThrow();
  });
});

describe("S187 factDrillFor — targeted, deterministic, always well-defined", () => {
  const UNIVERSE = fullFactUniverse(0, 10);

  it("is deterministic in (family, seed)", () => {
    for (const fam of ["7x8", "0x5", "1x9", "6x6"]) {
      for (const seed of [0, 1, 2, 3, 17]) {
        expect(JSON.stringify(factDrillFor(fam, seed))).toBe(JSON.stringify(factDrillFor(fam, seed)));
      }
    }
  });

  it("every family x 8 seeds: the answer is arithmetically right and no trap equals it", () => {
    for (const fam of UNIVERSE) {
      const { lo, hi, product } = parseFactFamily(fam);
      for (let seed = 0; seed < 8; seed++) {
        const d = factDrillFor(fam, seed);
        const m = d.widget.prompt.match(/^(\d+) ([×÷]) (\d+) = \?$/);
        expect(m, `unparseable prompt: ${d.widget.prompt}`).not.toBeNull();
        const [, aS, op, bS] = m!;
        const a = Number(aS), b = Number(bS);
        // recompute independently from the prompt, never from the generator's own answer
        expect(d.widget.answer).toBe(op === "×" ? a * b : a / b);
        expect(Number.isInteger(d.widget.answer)).toBe(true);
        for (const t of d.widget.commonErrors) {
          expect(t.value, `${fam} seed ${seed}: trap equals answer`).not.toBe(d.widget.answer);
          expect(t.feedback.length).toBeGreaterThanOrEqual(25);
        }
        expect(d.hints).toHaveLength(3);
        expect(d.explanationVariants).toHaveLength(2);
        // the drill must actually be about THIS family
        if (op === "×") expect(a * b).toBe(product);
        else expect(a).toBe(product);
        expect([lo, hi]).toContain(op === "×" ? Math.min(a, b) : b);
      }
    }
  });

  it("never divides by zero: families containing 0 stay multiplicative", () => {
    for (let other = 0; other <= 10; other++) {
      const fam = factFamilyKey(0, other);
      for (let seed = 0; seed < 8; seed++) {
        expect(factDrillFor(fam, seed).widget.prompt).toContain("×");
      }
    }
  });

  it("exercises BOTH faces of a divisible family across seeds", () => {
    const ops = new Set<string>();
    for (let seed = 0; seed < 8; seed++) ops.add(factDrillFor("7x8", seed).widget.prompt.includes("÷") ? "div" : "mul");
    expect(ops).toEqual(new Set(["mul", "div"]));
  });

  it("handles the degenerate divisors: ÷1 and n÷n produce valid, non-colliding traps", () => {
    for (const fam of ["1x7", "7x7", "1x1"]) {
      for (let seed = 0; seed < 8; seed++) {
        const d = factDrillFor(fam, seed);
        for (const t of d.widget.commonErrors) expect(t.value).not.toBe(d.widget.answer);
        const vals = d.widget.commonErrors.map((t) => t.value);
        expect(new Set(vals).size).toBe(vals.length);
      }
    }
  });

  it("factReviewKey is namespaced so it cannot collide with lessonId:stepId keys", () => {
    expect(factReviewKey("7x8")).toBe("fact:7x8");
    expect(factReviewKey("7x8").startsWith("fact:")).toBe(true);
  });
});

describe("S187 additive key space — one map, operator as discriminator", () => {
  it("sumFamilyKey is commutative and canonical", () => {
    expect(sumFamilyKey(7, 8)).toBe("7+8");
    expect(sumFamilyKey(8, 7)).toBe("7+8");
    expect(sumFamilyKey(0, 0)).toBe("0+0");
  });

  it("CANNOT collide with a multiplicative family, even for the same two numbers", () => {
    expect(sumFamilyKey(7, 8)).not.toBe(factFamilyKey(7, 8));
    // and they describe genuinely different facts
    expect(parseFamily(sumFamilyKey(7, 8)).result).toBe(15);
    expect(parseFamily(factFamilyKey(7, 8)).result).toBe(56);
  });

  it("the two spaces coexist in ONE leech box without interfering", () => {
    const today = "2026-08-02";
    let s = applyFactResult({}, factFamilyKey(7, 8), false, today);
    s = applyFactResult(s, sumFamilyKey(7, 8), true, today);
    expect(s["7x8"].misses).toBe(1);
    expect(s["7+8"].misses).toBe(0);
    expect(s["7+8"].correctStreak).toBe(1);
    expect(Object.keys(s).sort()).toEqual(["7+8", "7x8"]);
  });

  it("parseFamily reports the operator and the right result for both spaces", () => {
    expect(parseFamily("3x4")).toEqual({ op: "x", lo: 3, hi: 4, result: 12 });
    expect(parseFamily("3+4")).toEqual({ op: "+", lo: 3, hi: 4, result: 7 });
    expect(() => parseFamily("3-4")).toThrow();
  });

  it("parseFactFamily stays strictly multiplicative, so an additive key cannot slip through it", () => {
    expect(() => parseFactFamily("7+8")).toThrow();
  });

  it("sumFactUniverse covers within-20 addition and every entry is canonical", () => {
    const uni = sumFactUniverse(20, 0);
    expect(new Set(uni).size).toBe(uni.length);
    for (const key of uni) {
      const { op, lo, hi, result } = parseFamily(key);
      expect(op).toBe("+");
      expect(lo).toBeLessThanOrEqual(hi);
      expect(result).toBeLessThanOrEqual(20);
    }
    expect(uni).toContain("7+8");
    expect(uni).not.toContain("8+7");
    expect(uni).not.toContain("10+11"); // sums past 20 are out of range
  });

  it("scheduling functions work unchanged on additive families", () => {
    const today = "2026-08-02";
    const s = applyFactResult({}, "9+9", false, today);
    expect(dueFacts(s, "2026-08-09")).toContain("9+9");
    expect(weakestFacts(s, ["9+9", "2+3"], 2, today)[0]).toBe("2+3"); // never-seen outranks seen
  });
});

describe("S188 factDrillFor on ADDITIVE families — the review path must not throw", () => {
  it("REGRESSION: an additive family produces a drill instead of throwing", () => {
    // Before S188 this threw `parseFactFamily: malformed key "7+8"` — a live crash in the
    // review page for any Grade-2 fluency learner, since S187 routes every factItems family
    // through factDrillFor regardless of key space.
    const d = factDrillFor("7+8", 0);
    expect(d.widget.type).toBe("numeric");
    expect(d.widget.prompt).toMatch(/\d+ \+ \d+ = \?/);
    expect(d.widget.answer).toBe(15);
  });

  it("alternates addition and subtraction surfaces across seeds, both self-consistent", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 8; seed++) {
      const d = factDrillFor("7+8", seed);
      seen.add(d.widget.prompt.includes("+") ? "add" : "sub");
      // the stated answer must satisfy the prompt's own arithmetic, computed independently
      const nums = [...d.widget.prompt.matchAll(/\d+/g)].map((m) => Number(m[0]));
      const truth = d.widget.prompt.includes("+") ? nums[0] + nums[1] : nums[0] - nums[1];
      expect(d.widget.answer, `seed ${seed}: ${d.widget.prompt}`).toBe(truth);
      for (const t of d.widget.commonErrors) {
        expect(t.value).not.toBe(d.widget.answer);
        expect(t.feedback.length).toBeGreaterThanOrEqual(25);
      }
    }
    expect(seen).toEqual(new Set(["add", "sub"]));
  });

  it("subtraction drills stay within the family and never go negative", () => {
    for (const fam of sumFactUniverse(20, 0)) {
      for (let seed = 0; seed < 4; seed++) {
        const d = factDrillFor(fam, seed);
        expect(d.widget.answer).toBeGreaterThanOrEqual(0);
        for (const t of d.widget.commonErrors) expect(t.value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("multiplicative families are unaffected by the additive branch", () => {
    const d = factDrillFor("7x8", 0);
    expect(d.widget.answer).toBe(56);
    expect(d.widget.prompt).toMatch(/×/);
  });

  it("is deterministic: same family and seed give the same drill", () => {
    expect(JSON.stringify(factDrillFor("6+9", 3))).toBe(JSON.stringify(factDrillFor("6+9", 3)));
  });
});
