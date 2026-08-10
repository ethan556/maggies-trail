import { describe, it, expect } from "vitest";

import {
  createRepSyncGraph,
  absorbEdit,
  deriveViews,
  stableKey,
  RepSyncError,
  type AbsorbOutcome,
  type RepSyncGraph
} from "./repSyncGraph";

/**
 * The engine is tested against a toy model that has NOTHING to do with lines, so anything that
 * passes here is a property of the graph rather than of the line mathematics. The toy is a
 * rectangle: `dims` and `perimeter` are editable origins, `area` is display-only, and `unit` is
 * a canonical field only some views read (which is how `changedViews` gets a real test).
 *
 * Expected values are computed in the test from arithmetic a reader can check by eye, never by
 * calling the module's own derive functions.
 */

type Box = { w: number; h: number; unit: string };

type DimEdit =
  | { kind: "setW"; v: number }
  | { kind: "setH"; v: number }
  | { kind: "setUnit"; v: string };
type PerimeterEdit = { kind: "setPerimeter"; v: number };

const reps = {
  model: { label: "canonical box", derive: (c: Box): Box => c },
  dims: {
    label: "side lengths",
    derive: (c: Box) => ({ w: c.w, h: c.h, label: `${c.w} by ${c.h}` }),
    absorb: (c: Box, edit: DimEdit): AbsorbOutcome<Box> => {
      if (edit.kind === "setUnit") return { ok: true, canonical: { ...c, unit: edit.v } };
      if (edit.v <= 0) {
        return { ok: false, code: "nonpositive-side", reason: `a side length must be positive, and ${edit.v} is not` };
      }
      return { ok: true, canonical: edit.kind === "setW" ? { ...c, w: edit.v } : { ...c, h: edit.v } };
    }
  },
  area: {
    label: "area",
    derive: (c: Box) => ({ value: c.w * c.h, text: `${c.w * c.h} square ${c.unit}` })
  },
  perimeter: {
    label: "perimeter",
    derive: (c: Box) => ({ value: 2 * (c.w + c.h) }),
    absorb: (c: Box, edit: PerimeterEdit): AbsorbOutcome<Box> => {
      const w = edit.v / 2 - c.h;
      if (w <= 0) {
        return {
          ok: false,
          code: "perimeter-too-small",
          reason: `a perimeter of ${edit.v} cannot enclose a height of ${c.h}`,
          detail: { needed: 2 * c.h }
        };
      }
      return { ok: true, canonical: { ...c, w } };
    }
  }
} as const;

const start: Box = { w: 3, h: 4, unit: "cm" };
const makeGraph = (): RepSyncGraph<Box, typeof reps> => createRepSyncGraph({ canonical: start, reps });

/** Independent LCG so the "random" walk is reproducible without importing anything. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

describe("stableKey", () => {
  it("is insensitive to property insertion order and distinguishes real differences", () => {
    expect(stableKey({ a: 1, b: [2, { c: 3 }] })).toBe(stableKey({ b: [2, { c: 3 }], a: 1 }));
    expect(stableKey({ a: 1 })).not.toBe(stableKey({ a: 2 }));
    expect(stableKey({ a: 1 })).not.toBe(stableKey({ a: "1" }));
    expect(stableKey(-0)).toBe(stableKey(0));
    expect(stableKey([1, 2])).not.toBe(stableKey([2, 1]));
  });

  it("refuses states that cannot have a stable identity", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => stableKey(cyclic)).toThrow(RepSyncError);
    expect(() => stableKey({ f: () => 1 })).toThrow(/must not contain functions/);
  });
});

describe("derivation", () => {
  it("recomputes every view from the canonical state alone", () => {
    const views = deriveViews(reps, { w: 5, h: 2, unit: "m" });
    // 5 × 2 = 10; 2(5 + 2) = 14 — arithmetic done here, not by the module.
    expect(views.area.value).toBe(10);
    expect(views.area.text).toBe("10 square m");
    expect(views.perimeter.value).toBe(14);
    expect(views.dims.label).toBe("5 by 2");
  });

  it("hands out frozen views, so a renderer cannot write mathematics back into one", () => {
    const g = makeGraph();
    const view = g.view("dims") as { w: number };
    expect(Object.isFrozen(view)).toBe(true);
    expect(() => {
      view.w = 99;
    }).toThrow();
    expect(g.view("dims").w).toBe(3);
  });
});

describe("propagation", () => {
  it("updates every representation from one canonical change", () => {
    const g = makeGraph();
    const result = g.apply("dims", { kind: "setW", v: 10 });
    expect(result.status).toBe("applied");
    // 10 × 4 = 40, 2(10 + 4) = 28.
    expect(g.view("area").value).toBe(40);
    expect(g.view("perimeter").value).toBe(28);
    expect(g.view("model").w).toBe(10);
  });

  it("lets a non-canonical representation be the origin and drives the rest", () => {
    const g = makeGraph();
    // perimeter 30 with h = 4 means w = 15 − 4 = 11, so the area must become 44.
    g.apply("perimeter", { kind: "setPerimeter", v: 30 });
    expect(g.view("dims").w).toBe(11);
    expect(g.view("area").value).toBe(44);
    expect(g.getCanonical().w).toBe(11);
  });

  it("reports exactly the views whose payload changed", () => {
    const g = makeGraph();
    const before = { model: stableKey(g.view("model")), dims: stableKey(g.view("dims")), area: stableKey(g.view("area")), perimeter: stableKey(g.view("perimeter")) };
    const result = g.apply("dims", { kind: "setUnit", v: "inches" });
    const after = { model: stableKey(g.view("model")), dims: stableKey(g.view("dims")), area: stableKey(g.view("area")), perimeter: stableKey(g.view("perimeter")) };
    const changedIndependently = (Object.keys(before) as (keyof typeof before)[]).filter((k) => before[k] !== after[k]);
    expect([...result.origin.changedViews].sort()).toEqual(changedIndependently.sort());
    // The unit only reaches the area sentence.
    expect(changedIndependently.sort()).toEqual(["area", "model"]);
  });

  it("treats an edit that lands on the same canonical state as a no-op, keeping view identity", () => {
    const g = makeGraph();
    const views = g.getState().views;
    const result = g.apply("dims", { kind: "setW", v: 3 });
    expect(result.status).toBe("unchanged");
    expect(g.getState().views).toBe(views);
    expect(result.origin.changedViews).toEqual([]);
    expect(g.canUndo()).toBe(false);
  });
});

describe("rejection", () => {
  it("returns a reason and leaves the canonical state and every view untouched", () => {
    const g = makeGraph();
    const keyBefore = g.getState().key;
    const views = g.getState().views;
    const result = g.apply("perimeter", { kind: "setPerimeter", v: 6 });
    expect(result.status).toBe("rejected");
    expect(result.code).toBe("perimeter-too-small");
    expect(result.reason).toMatch(/cannot enclose a height of 4/);
    expect(result.detail).toEqual({ needed: 8 });
    expect(g.getState().key).toBe(keyBefore);
    expect(g.getState().views).toBe(views);
    expect(g.canUndo()).toBe(false);
    expect(g.getState().origin?.status).toBe("rejected");
    expect(g.getState().origin?.rejection?.code).toBe("perimeter-too-small");
  });

  it("rejects edits aimed at a display-only representation instead of guessing", () => {
    const g = makeGraph();
    const result = (g as unknown as { apply: (r: string, e: unknown) => { status: string; code?: string; reason?: string } }).apply(
      "area",
      { kind: "setArea", v: 12 }
    );
    expect(result.status).toBe("rejected");
    expect(result.code).toBe("read-only-representation");
    expect(g.editable("area")).toBe(false);
    expect(g.editable("perimeter")).toBe(true);
  });

  it("rejects edits aimed at a representation that does not exist", () => {
    const outcome = absorbEdit(reps, start, "diagonal" as never, { kind: "whatever" });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.code).toBe("unknown-representation");
  });
});

describe("acyclicity", () => {
  it("throws if an absorb tries to re-enter the graph while an edit is propagating", () => {
    const holder: { graph: { apply: (rep: "bad", edit: { kind: "poke" }) => unknown } | null } = { graph: null };
    const cyclicReps = {
      model: { derive: (c: Box): Box => c },
      bad: {
        derive: (c: Box) => ({ w: c.w }),
        absorb: (c: Box, edit: { kind: "poke" }): AbsorbOutcome<Box> => {
          holder.graph?.apply("bad", edit);
          return { ok: true, canonical: { ...c, w: c.w + 1 } };
        }
      }
    } as const;
    const g = createRepSyncGraph({ canonical: start, reps: cyclicReps });
    holder.graph = g;
    expect(() => g.apply("bad", { kind: "poke" })).toThrow(/may not apply an edit while another edit is propagating/);
  });
});

describe("equivalence classes", () => {
  it("gives identical views to two different edit paths that reach the same canonical state", () => {
    const a = makeGraph();
    a.apply("dims", { kind: "setW", v: 8 });

    const b = makeGraph();
    // perimeter 24 with h = 4 gives w = 12 − 4 = 8: a different origin, the same rectangle.
    b.apply("perimeter", { kind: "setPerimeter", v: 24 });

    expect(b.getState().key).toBe(a.getState().key);
    for (const id of a.repIds) expect(stableKey(b.view(id))).toBe(stableKey(a.view(id)));
  });
});

describe("history", () => {
  it("undo and redo restore exact canonical snapshots", () => {
    const g = makeGraph();
    const keys = [g.getState().key];
    for (const v of [5, 6, 7]) {
      g.apply("dims", { kind: "setW", v });
      keys.push(g.getState().key);
    }
    for (let i = keys.length - 1; i > 0; i -= 1) {
      expect(g.getState().key).toBe(keys[i]);
      g.undo();
    }
    expect(g.getState().key).toBe(keys[0]);
    expect(g.undo()).toBeNull();
    for (let i = 1; i < keys.length; i += 1) {
      g.redo();
      expect(g.getState().key).toBe(keys[i]);
    }
    expect(g.redo()).toBeNull();
  });

  it("collapses one gesture into one undo entry", () => {
    const g = makeGraph();
    const before = g.getState().key;
    for (const v of [4, 5, 6, 7, 8]) g.apply("dims", { kind: "setW", v }, { gesture: "drag-a" });
    expect(g.history()).toHaveLength(1);
    expect(g.view("dims").w).toBe(8);
    g.undo();
    expect(g.getState().key).toBe(before);
  });

  it("starts a new entry when the gesture changes", () => {
    const g = makeGraph();
    g.apply("dims", { kind: "setW", v: 4 }, { gesture: "drag-a" });
    g.apply("dims", { kind: "setW", v: 5 }, { gesture: "drag-a" });
    g.apply("dims", { kind: "setW", v: 6 }, { gesture: "drag-b" });
    expect(g.history()).toHaveLength(2);
  });

  it("keeps a rejected edit out of history", () => {
    const g = makeGraph();
    g.apply("dims", { kind: "setW", v: 9 });
    g.apply("dims", { kind: "setW", v: -1 });
    expect(g.history()).toHaveLength(1);
    expect(g.view("dims").w).toBe(9);
  });

  it("bounds the undo stack at the configured limit", () => {
    const g = createRepSyncGraph({ canonical: start, reps, historyLimit: 3 });
    for (let v = 10; v < 20; v += 1) g.apply("dims", { kind: "setW", v });
    expect(g.history()).toHaveLength(3);
  });
});

describe("subscription", () => {
  it("notifies on every transaction and stops after unsubscribe", () => {
    const g = makeGraph();
    const seen: string[] = [];
    const off = g.subscribe((s) => seen.push(s.origin?.status ?? "init"));
    g.apply("dims", { kind: "setW", v: 6 });
    g.apply("dims", { kind: "setW", v: 6 });
    g.apply("dims", { kind: "setW", v: -3 });
    off();
    g.apply("dims", { kind: "setW", v: 7 });
    expect(seen).toEqual(["applied", "unchanged", "rejected"]);
  });
});

describe("no stale state under a long random walk", () => {
  it("keeps every view exactly in step with the canonical state for 100 seeded edits", () => {
    const g = makeGraph();
    const rnd = lcg(20_812);
    let applied = 0;
    let rejected = 0;
    for (let i = 0; i < 100; i += 1) {
      const keyBefore = g.getState().key;
      const roll = rnd();
      const value = Math.round(rnd() * 40) - 8; // deliberately reaches invalid (≤ 0) values
      const result =
        roll < 0.4
          ? g.apply("dims", { kind: "setW", v: value })
          : roll < 0.7
            ? g.apply("dims", { kind: "setH", v: value })
            : g.apply("perimeter", { kind: "setPerimeter", v: value });

      expect(g.verifyFresh()).toEqual([]);

      // Cross-representation invariant, recomputed here: area = w·h, perimeter = 2(w + h).
      const c = g.getCanonical();
      expect(g.view("area").value).toBe(c.w * c.h);
      expect(g.view("perimeter").value).toBe(2 * (c.w + c.h));
      expect(g.view("dims")).toEqual({ w: c.w, h: c.h, label: `${c.w} by ${c.h}` });

      if (result.status === "rejected") {
        rejected += 1;
        expect(g.getState().key).toBe(keyBefore);
        expect(result.reason).toBeTruthy();
      } else if (result.status === "applied") {
        applied += 1;
      }
    }
    expect(applied).toBeGreaterThan(20);
    expect(rejected).toBeGreaterThan(5);
  });

  it("is deterministic: the same seeded walk from the same start lands on the same key", () => {
    const walk = (): string => {
      const g = makeGraph();
      const rnd = lcg(4_242);
      for (let i = 0; i < 60; i += 1) {
        const value = Math.round(rnd() * 30) - 5;
        if (rnd() < 0.5) g.apply("dims", { kind: "setW", v: value });
        else g.apply("perimeter", { kind: "setPerimeter", v: value });
      }
      return g.getState().key;
    };
    expect(walk()).toBe(walk());
  });
});
