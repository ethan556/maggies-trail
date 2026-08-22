/**
 * THE OLD-PATH-REDUCES-LITERALLY PROOF for the S212 algebraTiles grading window.
 *
 * `evaluate.ts`'s algebraTiles branch gained a block gated entirely behind `spec.area`. The claim
 * is that a spec without a rectangle is graded by exactly the code it was graded by before — not
 * "equivalently", literally: the new block is unreachable, and the three lines under it are
 * untouched.
 *
 * The proof is a sweep. The PRE-S212 grader is transcribed here verbatim from the S211 tree, and
 * every one of the 27 authored specs is graded by both across a swept state space. Zero diffs is
 * the bar.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluate } from "@/lib/evaluate";
import { AlgebraTilesSpec, algebraTilesPartials, type TWidget } from "@/lib/schema";
import { algebraTilesFrame, deriveArea } from "@/lib/mmip/algebraTilesModel";

/** The grader as it stood before this session. Three lines, no rectangle anywhere. */
function preS212(spec: { targetX: number; targetConst: number; successFeedback: string; xFeedback: string; constFeedback: string }, v: { x: number; c: number } | null) {
  if (!v || typeof v.x !== "number") return "Place some tiles, then check.";
  if (v.x === spec.targetX && v.c === spec.targetConst) return spec.successFeedback;
  return v.x !== spec.targetX ? spec.xFeedback : spec.constFeedback;
}

function authored(): Array<{ file: string; where: string; raw: Record<string, unknown> }> {
  const out: Array<{ file: string; where: string; raw: Record<string, unknown> }> = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) {
        let j: unknown;
        try { j = JSON.parse(readFileSync(p, "utf8")); } catch { continue; }
        const scan = (n: unknown, where: string) => {
          if (!n || typeof n !== "object") return;
          if (Array.isArray(n)) return n.forEach((x, i) => scan(x, `${where}[${i}]`));
          const o = n as Record<string, unknown>;
          if (o.type === "algebraTiles") out.push({ file: p, where, raw: o });
          for (const k of Object.keys(o)) scan(o[k], `${where}.${k}`);
        };
        scan(j, "");
      }
    }
  };
  walk("content");
  return out;
}

describe("classic authored specs are graded by the code they were always graded by", () => {
  it("no verdict moves, over every state a learner can reach", () => {
    const specs = authored();
    expect(specs.length).toBe(29);
    const diffs: string[] = [];
    let checked = 0;
    // S215: one authored lesson opts into area mode and is graded by the NEW block by design. The
    // old-path claim is about the 27 that did not, and it is unchanged for every one of them.
    const classic = specs.filter(({ raw }) => !("area" in raw));
    expect(classic.length).toBe(27);
    expect(specs.filter(({ raw }) => "area" in raw).map((a) => `${a.file.replace(/\\/g, "/")}${a.where}`).sort()).toEqual([
      "content/courses/linear-equations-systems/lessons/les-01-03.json.steps[1].widget",
      "content/courses/two-step-equations/lessons/tse-01-01.json.steps[1].widget",
    ]);
    for (const { file, where, raw } of classic) {
      const spec = AlgebraTilesSpec.parse(raw) as TWidget & { maxTiles: number };
      expect("area" in spec).toBe(false); // the gate is closed for every one of them
      const M = spec.maxTiles;
      for (let x = -M; x <= M; x++) {
        for (let c = -M; c <= M; c++) {
          checked++;
          // both the bare value the engine used to persist, and the S210 value with a mat on it
          for (const v of [{ x, c }, { x, c, mat: { xPos: Math.max(x, 0), xNeg: Math.max(-x, 0), uPos: Math.max(c, 0), uNeg: Math.max(-c, 0), sqPos: 0, sqNeg: 0, framed: false } }]) {
            const now = evaluate(spec, v).feedback;
            const then = preS212(raw as never, v);
            if (now !== then) diffs.push(`${file}${where} (${x},${c}) then=${then} now=${now}`);
          }
        }
      }
      // …and the two shapes the grader must refuse identically
      expect(evaluate(spec, null).feedback).toBe(preS212(raw as never, null));
      expect(evaluate(spec, undefined).feedback).toBe(preS212(raw as never, null));
    }
    expect(diffs.slice(0, 5)).toEqual([]);
    expect(checked).toBeGreaterThan(5000);
  });

  it("a mat carrying x² tiles cannot reach a spec that has no rectangle", () => {
    // The new block reads `sqPos`/`framed`; with no `area` it is never entered, so a value that
    // somehow carries them grades exactly as its {x, c} always did.
    const spec = AlgebraTilesSpec.parse(authored()[0].raw) as TWidget & { targetX: number; targetConst: number };
    const withJunk = { x: spec.targetX, c: spec.targetConst, mat: { sqPos: 4, sqNeg: 0, framed: true } };
    expect(evaluate(spec, withJunk).correct).toBe(true);
  });
});

/* ───────────────────────── the new mode, hand-derived ───────────────────────── */

const FB = { successFeedback: "S", xFeedback: "X", constFeedback: "C" };

/** 3(x + 2) = 3x + 6. Partials by hand: square 0·1 = 0; x 0·2 + 3·1 = 3; unit 3·2 = 6. */
const DIST = AlgebraTilesSpec.parse({
  type: "algebraTiles",
  prompt: "Multiply 3(x + 2) with tiles.",
  targetX: 3,
  targetConst: 6,
  maxTiles: 12,
  ...FB,
  area: { width: [0, 3], height: [1, 2], mode: "distribute" },
  partialProductFeedback: "P",
}) as TWidget;

/** (x + 2)(x + 3) = x² + 5x + 6. Partials: square 1; x 1·3 + 2·1 = 5; unit 2·3 = 6. */
const FACT = AlgebraTilesSpec.parse({
  type: "algebraTiles",
  prompt: "Gather x² + 5x + 6 into a rectangle.",
  targetX: 5,
  targetConst: 6,
  targetSquare: 1,
  maxTiles: 12,
  ...FB,
  area: { width: [1, 2], height: [1, 3], mode: "factor" },
  frameMismatchFeedback: "M",
}) as TWidget;

const val = (x: number, c: number, sq = 0, framed = false) => ({
  x, c, mat: { xPos: Math.max(x, 0), xNeg: Math.max(-x, 0), uPos: Math.max(c, 0), uNeg: Math.max(-c, 0), sqPos: Math.max(sq, 0), sqNeg: Math.max(-sq, 0), framed },
});

describe("distribute mode", () => {
  it("the partials are the multiplication table, by hand", () => {
    expect(algebraTilesPartials([0, 3], [1, 2])).toEqual({ square: 0, x: 3, unit: 6 });
  });
  it("the rectangle still whole is not finished", () => {
    expect(evaluate(DIST, val(0, 0, 0, true)).feedback).toBe("C");
  });
  it("opened onto every partial product is correct: 3 x-tiles and 6 units", () => {
    expect(evaluate(DIST, val(3, 6)).correct).toBe(true);
  });
  it("the multiplier stopping at the x is NAMED — 3x + 2, not 3x + 6", () => {
    expect(evaluate(DIST, val(3, 2)).feedback).toBe("P");
  });
  it("anything else falls to the x/const diagnosis, in that order", () => {
    expect(evaluate(DIST, val(2, 6)).feedback).toBe("X");
    expect(evaluate(DIST, val(3, 5)).feedback).toBe("C");
  });
});

describe("factor mode", () => {
  it("the tiles gathered into the rectangle are correct", () => {
    expect(evaluate(FACT, val(0, 0, 0, true)).correct).toBe(true);
  });
  it("the right tiles, still loose, are named as ungathered", () => {
    expect(evaluate(FACT, val(5, 6, 1)).feedback).toBe("M");
  });
  it("the wrong tiles get the x/const diagnosis", () => {
    expect(evaluate(FACT, val(4, 6, 1)).feedback).toBe("X");
    expect(evaluate(FACT, val(5, 7, 1)).feedback).toBe("C");
  });
});

describe("mutation check: the partial-product mapping is load-bearing", () => {
  it("a rectangle whose partials were computed wrongly would grade differently", () => {
    // If `algebraTilesPartials` returned w1·h1 + w0·h0 for `x` (a plausible slip), 3(x + 2) would
    // want 6 x-tiles instead of 3 — and this position, which is correct now, would not be.
    const slip = { square: 0 * 1, x: 0 * 1 + 3 * 2, unit: 3 * 2 };
    expect(slip.x).not.toBe(algebraTilesPartials([0, 3], [1, 2]).x);
    expect(evaluate(DIST, val(algebraTilesPartials([0, 3], [1, 2]).x, 6)).correct).toBe(true);
    expect(evaluate(DIST, val(slip.x, 6)).correct).toBe(false);
  });
});

describe("the authored strings are true of the states that show them (S215b)", () => {
  const raw = (() => {
    const hit = authored().find(({ file, raw }) =>
      file.replace(/\\/g, "/").endsWith("content/courses/two-step-equations/lessons/tse-01-01.json") && "area" in raw
    );
    if (!hit) throw new Error("no authored area spec");
    return hit.raw as Record<string, string>;
  })();
  const spec = AlgebraTilesSpec.parse(raw) as TWidget;
  const frame = algebraTilesFrame(raw as never);
  const st = (x: number, c: number) => ({
    xPos: Math.max(x, 0), xNeg: Math.max(-x, 0),
    uPos: Math.max(c, 0), uNeg: Math.max(-c, 0),
    sqPos: 0, sqNeg: 0, framed: false,
  });

  it("partialProductFeedback asserts no count, and what it does say is true", () => {
    // It used to claim "four of its parts are still empty". For −3(x + 2) the partial state covers
    // the three x-cells and leaves SIX unit cells uncovered, while the progress line said 3 of 9.
    const area = deriveArea(frame, st(-3, 2))!;
    expect(area.filledCount).toBe(3);
    expect(area.cells.filter((c) => c.kind === "unit" && !c.filled)).toHaveLength(6);
    expect(raw.partialProductFeedback).not.toMatch(/\bfour\b/);
    expect(raw.partialProductFeedback).not.toMatch(/\b\d+ of its parts\b/);
    // the claim it does make — every unit part uncovered — holds in the state that shows it
    expect(area.cells.filter((c) => c.kind === "unit" && c.filled)).toHaveLength(0);
    expect(raw.partialProductFeedback).toMatch(/every part that needs a unit tile is still uncovered/);
    expect(evaluate(spec, { x: -3, c: 2, mat: st(-3, 2) }).feedback).toBe(raw.partialProductFeedback);
  });

  it("unopenedFrameFeedback is shown exactly when nothing has been produced", () => {
    expect(evaluate(spec, { x: 0, c: 0, mat: st(0, 0) }).feedback).toBe(raw.unopenedFrameFeedback);
    expect(deriveArea(frame, st(0, 0))!.filledCount).toBe(0);
    expect(evaluate(spec, { x: -3, c: 0, mat: st(-3, 0) }).feedback).not.toBe(raw.unopenedFrameFeedback);
  });

  it("successFeedback is shown only where the rectangle is exactly covered", () => {
    expect(deriveArea(frame, st(-3, -6))!.complete).toBe(true);
    expect(evaluate(spec, { x: -3, c: -6, mat: st(-3, -6) }).correct).toBe(true);
    // over-produced: covered, not complete, and NOT a success
    expect(deriveArea(frame, st(-8, -6))!.overfilled).toBe(true);
    expect(evaluate(spec, { x: -8, c: -6, mat: st(-8, -6) }).correct).toBe(false);
  });
});
