/**
 * systemsPairAdapter — the seam phase 2 will wire through.
 *
 * INDEPENDENCE: every expected crossing is solved here by elimination and stated by hand in the
 * comment beside it; the classification is decided here by comparing the two rates, never by
 * reading the module's `relation.kind`; and the persisted-shape rule is checked against the exact
 * object a pre-S212 value is, written out literally.
 */
import { describe, expect, it } from "vitest";
import { SystemsExploreSpec } from "@/lib/schema";
import { ratToNumber } from "./lineFamilyModel";
import { deriveRelation } from "./linePairModel";
import {
  systemsLineEditable,
  systemsPairCanonical,
  systemsPairEditable,
  systemsPairModel,
  systemsPairParams,
  systemsPairPersist,
  systemsPointOn,
  systemsSlotRep,
  type SystemsLineEditPolicy,
  type SystemsPairSpecLike,
} from "./systemsPairAdapter";

const OPEN: SystemsLineEditPolicy = {
  slopeMin: -4, slopeMax: 4, slopeStep: 1,
  interceptMin: -5, interceptMax: 5, interceptStep: 1,
  outOfRange: "clamp", offLattice: "snap",
};

const spec = (over: Partial<SystemsExploreSpecLike> = {}): SystemsPairSpecLike =>
  SystemsExploreSpec.parse({
    type: "systemsExplore",
    prompt: "Drag the point to the solution.",
    m1: 1, b1: 1, m2: -1, b2: 5,
    xMin: 0, xMax: 6, yMin: 0, yMax: 7, xStart: 0, yStart: 0,
    successFeedback: "That point satisfies both relationships at once.",
    offLine1Feedback: "Not on the first line yet.",
    offLine2Feedback: "Not on the second line yet.",
    ...over,
  }) as SystemsPairSpecLike;
type SystemsExploreSpecLike = Record<string, unknown>;

describe("a classic spec is untouched", () => {
  it("reports no editable line and reads its parameters from the spec", () => {
    const s = spec();
    expect(systemsPairEditable(s)).toBe(false);
    expect(systemsLineEditable(s, "a")).toBe(false);
    expect(systemsPairParams(s, null)).toEqual({ m1: 1, b1: 1, m2: -1, b2: 5 });
    // 1x + 1 = −1x + 5 ⇒ 2x = 4 ⇒ x = 2, y = 3 — by hand.
    const relation = deriveRelation(systemsPairCanonical(s));
    expect(relation.kind === "unique" && relation.text).toBe("(2, 3)");
  });

  it("refuses every line edit, in the model's own shape", () => {
    const model = systemsPairModel(spec());
    for (const line of ["a", "b"] as const) {
      const tx = model.apply(model.initial, { kind: "line", line, edit: { kind: "setSlope", m: { n: 3, d: 1 } } }, "symbolic", "test");
      expect([line, tx.rejected]).toEqual([line, true]);
      expect(tx.rejection?.code).toBe("slope-out-of-range");
      expect(tx.after).toEqual(tx.before);
    }
  });

  it("persists exactly the shape it always did, with no envelope", () => {
    const s = spec();
    expect(systemsPairPersist(s, systemsPairCanonical(s), 2, 3)).toEqual({ x: 2, y: 3 });
    expect("lines" in systemsPairPersist(s, systemsPairCanonical(s), 2, 3)).toBe(false);
  });

  it("ignores a stale envelope a classic spec could never have written", () => {
    const s = spec();
    expect(systemsPairParams(s, { x: 0, y: 0, lines: { m1: 9, b1: 9, m2: 9, b2: 9 } })).toEqual({
      m1: 1, b1: 1, m2: -1, b2: 5,
    });
  });
});

describe("an editable spec", () => {
  const s = spec({ editLine1: OPEN, editLine2: OPEN });

  it("opens both lines and maps the authored range onto the line-family policy", () => {
    expect(systemsPairEditable(s)).toBe(true);
    const c = systemsPairCanonical(s);
    expect(ratToNumber(c.a.policy.slopeMin!)).toBe(-4);
    expect(ratToNumber(c.a.policy.slopeMax!)).toBe(4);
    expect(ratToNumber(c.a.policy.interceptStep!)).toBe(1);
    expect(c.a.policy.outOfRange).toBe("clamp");
    expect(c.a.policy.offLattice).toBe("snap");
  });

  it("clamps rather than refuses, and says so", () => {
    const model = systemsPairModel(s);
    const g = model.createGraph();
    const result = g.apply(systemsSlotRep("a"), { kind: "setSlope", m: { n: 11, d: 1 } });
    expect(result.status).toBe("applied");
    expect(result.origin.clamp?.code).toBe("slope-clamped");
    expect(ratToNumber(g.getCanonical().a.m)).toBe(4);
  });

  it("goes unique → parallel → coincident by moving one line, each verdict hand-checked", () => {
    const g = systemsPairModel(s).createGraph();
    // Start: rates 1 and −1 differ ⇒ one crossing.
    expect(g.view("relation").kind).toBe("unique");
    // Give line 2 line 1's rate: rates equal, starts 1 and 5 ⇒ parallel, gap 4.
    g.apply("lineB", { kind: "setSlope", m: { n: 1, d: 1 } });
    const parallel = g.view("relation");
    expect(parallel.kind).toBe("parallel");
    expect(parallel.kind === "parallel" && ratToNumber(parallel.gap)).toBe(4);
    // Match the start too ⇒ one line written twice.
    g.apply("lineB", { kind: "setIntercept", b: { n: 1, d: 1 } });
    expect(g.view("relation").kind).toBe("coincident");
    expect(g.view("solutionSet").count).toBe("infinitely many");
    // Graph-owned undo walks it back.
    g.undo();
    expect(g.view("relation").kind).toBe("parallel");
  });

  it("writes the envelope only once a line has actually moved", () => {
    const model = systemsPairModel(s);
    // Untouched: still the classic shape, even though editing is enabled.
    expect(systemsPairPersist(s, model.initial, 0, 0)).toEqual({ x: 0, y: 0 });
    const g = model.createGraph();
    g.apply("lineB", { kind: "setIntercept", b: { n: 3, d: 1 } });
    expect(systemsPairPersist(s, g.getCanonical(), 0, 0)).toEqual({
      x: 0, y: 0, lines: { m1: 1, b1: 1, m2: -1, b2: 3 },
    });
  });

  it("round-trips a written envelope back into the same pair", () => {
    const g = systemsPairModel(s).createGraph();
    g.apply("lineA", { kind: "setSlope", m: { n: 3, d: 1 } });
    const value = systemsPairPersist(s, g.getCanonical(), 1, 4);
    const restored = systemsPairCanonical(s, value);
    expect(ratToNumber(restored.a.m)).toBe(3);
    // 3x + 1 = −1x + 5 ⇒ 4x = 4 ⇒ x = 1, y = 4 — by hand, and the point is on both.
    const relation = deriveRelation(restored);
    expect(relation.kind === "unique" && relation.text).toBe("(1, 4)");
    expect(systemsPointOn(s, value, 1, 4)).toEqual({ onA: true, onB: true });
  });

  it("grades the point against the lines as they now stand", () => {
    const value = { x: 2, y: 3, lines: { m1: 1, b1: 1, m2: -1, b2: 5 } };
    expect(systemsPointOn(s, value, 2, 3)).toEqual({ onA: true, onB: true });
    // Move line 2 down by 2: (2, 3) is no longer on it, and the adapter says so.
    const moved = { ...value, lines: { ...value.lines, b2: 3 } };
    expect(systemsPointOn(s, moved, 2, 3)).toEqual({ onA: true, onB: false });
    // …which is exactly why `evaluate.ts` must read `value.lines` before this ships (phase 2).
  });

  it("keeps a half-open spec half-open", () => {
    const half = spec({ editLine1: OPEN });
    expect(systemsLineEditable(half, "a")).toBe(true);
    expect(systemsLineEditable(half, "b")).toBe(false);
    const model = systemsPairModel(half);
    expect(model.apply(model.initial, { kind: "line", line: "b", edit: { kind: "setSlope", m: { n: 2, d: 1 } } }, "symbolic", "t").rejected).toBe(true);
    expect(model.apply(model.initial, { kind: "line", line: "a", edit: { kind: "setSlope", m: { n: 2, d: 1 } } }, "symbolic", "t").rejected).toBe(false);
    // A stale envelope cannot move the line that was never opened.
    expect(systemsPairParams(half, { x: 0, y: 0, lines: { m1: 3, b1: 3, m2: 3, b2: 3 } })).toEqual({
      m1: 3, b1: 3, m2: -1, b2: 5,
    });
  });
});

/* ── label layout: the whole reachable state space, not a sample ───── */

import { systemsLabelLayout } from "./systemsPairAdapter";
import { deriveEquation, makeLineCanonical, rat } from "./lineFamilyModel";

describe("equation labels stay inside the plot", () => {
  const WIN = { xMin: 0, xMax: 6, yMin: 0, yMax: 8 }; // se-01-03's authored window
  const W = 300, H = 300, PAD = 14;
  const layout = (m1: number, b1: number, m2: number, b2: number) =>
    systemsLabelLayout({
      lines: { m1, b1, m2, b2 },
      equations: {
        a: `line 1: ${deriveEquation(makeLineCanonical({ m: rat(m1), b: rat(b1) })).display}`,
        b: `line 2: ${deriveEquation(makeLineCanonical({ m: rat(m2), b: rat(b2) })).display}`
      },
      window: WIN, W, H, pad: PAD
    });

  it("keeps every label box in frame across all 2,401 reachable states", () => {
    // se-01-03's authored ranges: rate −3..3, start 0..6, for both lines. Swept exhaustively,
    // because the defect this replaces was invisible to a four-state check.
    const escapes: unknown[] = [];
    const collisions: unknown[] = [];
    let coincident = 0;
    let checked = 0;
    for (let m1 = -3; m1 <= 3; m1 += 1) for (let b1 = 0; b1 <= 6; b1 += 1)
      for (let m2 = -3; m2 <= 3; m2 += 1) for (let b2 = 0; b2 <= 6; b2 += 1) {
        checked += 1;
        if (m1 === m2 && b1 === b2) coincident += 1;
        const boxes = layout(m1, b1, m2, b2);
        for (const box of boxes) {
          if (box.left < PAD || box.left + box.width > W - PAD || box.top < PAD || box.y > H - PAD) {
            escapes.push({ m1, b1, m2, b2, slot: box.slot, left: box.left, right: box.left + box.width, top: box.top, bottom: box.y });
          }
        }
        if (Math.abs(boxes[0]!.y - boxes[1]!.y) < 15) collisions.push({ m1, b1, m2, b2 });
      }
    expect(checked).toBe(2401);
    expect(coincident).toBe(49);
    expect(escapes).toEqual([]);
    expect(collisions).toEqual([]);
  });

  it("keeps both labels readable when the lines coincide", () => {
    for (let m = -3; m <= 3; m += 1) for (let b = 0; b <= 6; b += 1) {
      const boxes = layout(m, b, m, b);
      // Same equation in both, which is the mathematics of the coincident case …
      expect(boxes[0]!.text.replace("line 1", "")).toBe(boxes[1]!.text.replace("line 2", ""));
      // … and far enough apart to be read as two.
      expect([m, b, Math.abs(boxes[0]!.y - boxes[1]!.y) >= 15]).toEqual([m, b, true]);
    }
  });

  it("anchors on the visible part of a line that leaves the frame", () => {
    // y = 3x + 6 leaves the top of a 0..8 window at x = 2/3, so the label cannot sit at x = 6.
    const [a] = layout(3, 6, 0, 0);
    expect(a!.x).toBeLessThan(PAD + ((6 - 0) / 6) * (W - 2 * PAD));
    expect(a!.left).toBeGreaterThanOrEqual(PAD);
  });
});
