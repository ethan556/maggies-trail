// linePairModel — two lines as one canonical object.
//
// INDEPENDENCE. Every crossing below is solved HERE by elimination in BigInt, from the printed
// equations, and the parallel/coincident classification is decided HERE by cross-multiplying the
// two slopes — never by reading the module's own `relation.kind`. The arithmetic is written out in
// the comments so a reader can check it by eye.

import { describe, expect, it } from "vitest";
import { stableKey } from "./repSyncGraph";
import { transactionCheck, type EditStep } from "./mmipHarness";
import { rat, ratText, type LineCanonical, type Rat } from "./lineFamilyModel";
import {
  absorbLinePairEdit,
  deriveRelation,
  deriveSolutionSet,
  describeLinePairChange,
  linePairCanonicalModel,
  linePairWindowsAgree,
  makeLinePairCanonical,
  type LinePairCanonical,
  type LinePairEdit,
} from "./linePairModel";

/* ── independent arithmetic ───────────────────────────────────────── */

type BF = { n: bigint; d: bigint };
const bgcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) { const t = x % y; x = y; y = t; }
  return x;
};
const bf = (n: bigint, d: bigint = 1n): BF => {
  if (d === 0n) throw new Error("d0");
  const s = d < 0n ? -1n : 1n;
  const g = bgcd(n, d) || 1n;
  return { n: (s * n) / g, d: (s * d) / g };
};
const bSub = (a: BF, b: BF): BF => bf(a.n * b.d - b.n * a.d, a.d * b.d);
const bMul = (a: BF, b: BF): BF => bf(a.n * b.n, a.d * b.d);
const bDiv = (a: BF, b: BF): BF => bf(a.n * b.d, a.d * b.n);
const bAdd = (a: BF, b: BF): BF => bf(a.n * b.d + b.n * a.d, a.d * b.d);
const bText = (a: BF): string => (a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`);
const parseBF = (t: string): BF => {
  const p = t.split("/");
  return bf(BigInt(p[0]!), p[1] === undefined ? 1n : BigInt(p[1]));
};
const EQ = /^y = (-?\d+(?:\/\d+)?)x \+ (-?\d+(?:\/\d+)?)$/;
/** Read a line's (m, b) back out of its PRINTED canonical equation. */
const readLine = (text: string): { m: BF; b: BF } => {
  const match = EQ.exec(text);
  if (!match) throw new Error(`not canonical: ${text}`);
  return { m: parseBF(match[1]!), b: parseBF(match[2]!) };
};

/** Solve the 2x2 system by elimination, independently of the module. */
const solveByElimination = (A: { m: BF; b: BF }, B: { m: BF; b: BF }): { x: BF; y: BF } | null => {
  const dm = bSub(A.m, B.m);
  if (dm.n === 0n) return null;
  const x = bDiv(bSub(B.b, A.b), dm);
  return { x, y: bAdd(bMul(A.m, x), A.b) };
};
/** Same slope? Decided by cross-multiplication, not by the module's verdict. */
const sameSlope = (A: { m: BF }, B: { m: BF }): boolean => A.m.n * B.m.d === B.m.n * A.m.d;

const pairOf = (ma: number, ba: number, mb: number, bb: number): LinePairCanonical =>
  makeLinePairCanonical({
    a: { m: rat(ma), b: rat(ba), domain: { start: rat(0), step: rat(1), count: 3 } },
    b: { m: rat(mb), b: rat(bb), domain: { start: rat(0), step: rat(1), count: 3 } },
  });

/** Both printed equations, which is all the independent route is allowed to read. */
const printed = (c: LinePairCanonical) => {
  const model = linePairCanonicalModel();
  const v = model.views(c);
  return { A: readLine(v.a.equation.text), B: readLine(v.b.equation.text) };
};

/* ── the crossing ─────────────────────────────────────────────────── */

describe("the crossing is derived, exactly", () => {
  it("finds the unique solution an independent elimination finds", () => {
    for (const [ma, ba, mb, bb] of [
      [3, 2, 1, 6], // 3x + 2 = x + 6 ⇒ 2x = 4 ⇒ x = 2, y = 8
      [2, -1, -1, 5], // 2x − 1 = −x + 5 ⇒ 3x = 6 ⇒ x = 2, y = 3
      [1, 0, -1, 0], // crossing at the origin
      [5, 1, 2, 0], // 5x + 1 = 2x ⇒ 3x = −1 ⇒ x = −1/3, y = −2/3
    ] as const) {
      const c = pairOf(ma, ba, mb, bb);
      const { A, B } = printed(c);
      const expected = solveByElimination(A, B);
      expect(expected).not.toBeNull();
      const relation = deriveRelation(c);
      expect([ma, ba, mb, bb, relation.kind]).toEqual([ma, ba, mb, bb, "unique"]);
      if (relation.kind !== "unique") throw new Error("unreachable");
      expect(bText(ratToBF(relation.at.x))).toBe(bText(expected!.x));
      expect(bText(ratToBF(relation.at.y))).toBe(bText(expected!.y));
      // …and the point really does satisfy BOTH printed equations.
      for (const L of [A, B]) {
        expect(bText(bAdd(bMul(L.m, expected!.x), L.b))).toBe(bText(expected!.y));
      }
    }
  });

  it("hand-checked: 3x + 2 and x + 6 meet at (2, 8)", () => {
    const relation = deriveRelation(pairOf(3, 2, 1, 6));
    expect(relation.kind === "unique" && relation.text).toBe("(2, 8)");
    expect(deriveSolutionSet(pairOf(3, 2, 1, 6)).sentence).toBe(
      "One pair of numbers satisfies both: x = 2 and y = 8."
    );
  });
});

function ratToBF(r: Rat): BF {
  return bf(BigInt(r.n), BigInt(r.d));
}

/* ── the two degenerate verdicts, both REACHABLE ──────────────────── */

describe("parallel and coincident are states, not refusals", () => {
  it("classifies exactly as an independent slope comparison does", () => {
    const cases: [number, number, number, number][] = [
      [2, 1, 2, 5], // parallel
      [2, 1, 2, 1], // coincident
      [2, 1, 3, 1], // unique
      [0, 4, 0, -4], // parallel, both flat
      [0, 4, 0, 4], // coincident, both flat
    ];
    for (const [ma, ba, mb, bb] of cases) {
      const c = pairOf(ma, ba, mb, bb);
      const { A, B } = printed(c);
      const expected = !sameSlope(A, B) ? "unique" : bText(A.b) === bText(B.b) ? "coincident" : "parallel";
      expect([ma, ba, mb, bb, deriveRelation(c).kind]).toEqual([ma, ba, mb, bb, expected]);
      expect(solveByElimination(A, B) === null).toBe(expected !== "unique");
    }
  });

  it("lets a learner BREAK a unique solution and says what was lost", () => {
    const g = linePairCanonicalModel(pairOf(3, 2, 1, 6)).createGraph();
    expect(g.view("relation").kind).toBe("unique");
    expect(g.view("solutionSet").count).toBe("one");
    // Ordinary line edit: give B line A's rate. Nothing is refused.
    const result = g.apply("lineB", { kind: "setSlope", m: rat(3) });
    expect(result.status).toBe("applied");
    expect(g.view("relation").kind).toBe("parallel");
    expect(g.view("solutionSet").count).toBe("none");
    expect(g.view("solutionSet").sentence).toContain("4 apart"); // 6 − 2
    // …and the move is reversible, so the crossing can be recovered.
    g.undo();
    expect(g.view("relation").kind).toBe("unique");
  });

  it("reaches coincident by matching the intercept too", () => {
    const g = linePairCanonicalModel(pairOf(3, 2, 1, 6)).createGraph();
    g.apply("relation", { kind: "matchSlope", from: "a" });
    g.apply("lineB", { kind: "setIntercept", b: rat(2) });
    expect(g.view("relation").kind).toBe("coincident");
    expect(g.view("solutionSet").count).toBe("infinitely many");
  });
});

/* ── the one refusal ──────────────────────────────────────────────── */

describe("the only rejection is a crossing that does not exist", () => {
  it("refuses to drag a crossing between parallel lines, with a reason", () => {
    const c = pairOf(2, 1, 2, 5);
    const outcome = absorbLinePairEdit(c, { kind: "setIntersection", x: rat(0), y: rat(0) });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error("unreachable");
    expect(outcome.code).toBe("no-crossing-parallel");
    expect(outcome.reason).toMatch(/never meet/);
  });

  it("refuses on coincident lines with a different reason", () => {
    const outcome = absorbLinePairEdit(pairOf(2, 1, 2, 1), { kind: "setIntersection", x: rat(1), y: rat(1) });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error("unreachable");
    expect(outcome.code).toBe("no-crossing-coincident");
  });

  it("moves the crossing where there is one, holding both rates", () => {
    const g = linePairCanonicalModel(pairOf(3, 2, 1, 6)).createGraph();
    const result = g.apply("relation", { kind: "setIntersection", x: rat(-1), y: rat(4) });
    expect(result.status).toBe("applied");
    // Independently: with the rates held at 3 and 1, meeting at (−1, 4) forces
    // b_A = 4 − 3·(−1) = 7 and b_B = 4 − 1·(−1) = 5.
    expect(g.view("lineA").equation.text).toBe("y = 3x + 7");
    expect(g.view("lineB").equation.text).toBe("y = 1x + 5");
    const relation = g.view("relation");
    expect(relation.kind === "unique" && relation.text).toBe("(-1, 4)");
  });
});

/* ── delegation, equivalence, invariants ──────────────────────────── */

describe("the pair delegates rather than duplicates", () => {
  it("inherits the single-line policy, rejections included", () => {
    const c = makeLinePairCanonical({
      a: { m: rat(1), b: rat(0), policy: { slopeMin: rat(-4), slopeMax: rat(4) } },
      b: { m: rat(2), b: rat(1) },
    });
    const refused = absorbLinePairEdit(c, { kind: "line", line: "a", edit: { kind: "setSlope", m: rat(9) } });
    expect(refused.ok).toBe(false);
    if (refused.ok) throw new Error("unreachable");
    expect(refused.code).toBe("slope-out-of-range");
    // The other slot has no such policy, so the same number is fine there.
    expect(absorbLinePairEdit(c, { kind: "line", line: "b", edit: { kind: "setSlope", m: rat(9) } }).ok).toBe(true);
  });

  it("retargets the single-line model's own operations, one per slot", () => {
    const before = pairOf(1, 0, 2, 0);
    const after = absorbLinePairEdit(before, { kind: "line", line: "b", edit: { kind: "setSlope", m: rat(6) } });
    if (!after.ok) throw new Error("unreachable");
    const ops = describeLinePairChange(before, after.canonical);
    expect(ops).toHaveLength(1);
    // 2 → 6 is a tripling, which the single-line model already calls a BRANCH.
    expect(ops[0]).toMatchObject({ kind: "distribute", target: "b:slope", amount: 3, sides: ["line-b"] });
    expect(ops[0]!.describe).toContain("Line B:");
  });

  it("keeps one frame for the pair, however either slot is edited", () => {
    const g = linePairCanonicalModel(pairOf(1, 0, 2, 3)).createGraph();
    for (const edit of [
      { rep: "lineA", e: { kind: "setSlope", m: rat(4) } },
      { rep: "lineB", e: { kind: "setIntercept", b: rat(-2) } },
      { rep: "lineA", e: { kind: "setDomain", count: 5 } },
    ] as const) {
      (g as unknown as { apply: (r: string, e: unknown) => unknown }).apply(edit.rep, edit.e);
      expect(linePairWindowsAgree(g.getCanonical())).toBe(true);
      expect(g.verifyFresh()).toEqual([]);
    }
  });

  it("calls two pairs the same system regardless of which line is named first", () => {
    const model = linePairCanonicalModel();
    expect(model.equivalent(pairOf(3, 2, 1, 6), pairOf(1, 6, 3, 2))).toBe(true);
    expect(model.equivalent(pairOf(3, 2, 1, 6), pairOf(3, 2, 1, 7))).toBe(false);
  });

  it("converges: two routes to the same pair give identical state and views", () => {
    const model = linePairCanonicalModel(pairOf(3, 2, 1, 6));
    // Route 1: type B's intercept. Route 2: drag the crossing to where that lands it.
    const one = model.createGraph();
    one.apply("lineB", { kind: "setIntercept", b: rat(5) });

    const two = model.createGraph();
    // 3x + 2 = x + 5 ⇒ 2x = 3 ⇒ x = 3/2, y = 3·(3/2) + 2 = 13/2 — computed here, by hand.
    two.apply("relation", { kind: "setIntersection", x: rat(3, 2), y: rat(13, 2) });

    expect(two.getState().key).toBe(one.getState().key);
    for (const id of one.repIds) expect(stableKey(two.view(id))).toBe(stableKey(one.view(id)));
  });

  it("normalizes anything into a usable pair", () => {
    const model = linePairCanonicalModel(pairOf(1, 1, 2, 2));
    for (const raw of [null, 7, "pair", {}, { a: { m: { n: 1, d: 0 } } }, { b: 9 }]) {
      const state = model.normalize(raw);
      expect(linePairWindowsAgree(state)).toBe(true);
      expect(deriveRelation(state)).toBeTruthy();
    }
  });
});

/* ── the transaction contract ─────────────────────────────────────── */

describe("MMIP transaction contract", () => {
  type S = LinePairCanonical;
  const model = linePairCanonicalModel(pairOf(3, 2, 1, 6));
  const EDITS: Record<string, (v: number) => LinePairEdit> = {
    "lineA:slope": (v) => ({ kind: "line", line: "a", edit: { kind: "setSlope", m: rat(v) } }),
    "lineB:intercept": (v) => ({ kind: "line", line: "b", edit: { kind: "setIntercept", b: rat(v) } }),
    "relation:crossing": (v) => ({ kind: "setIntersection", x: rat(v), y: rat(v) }),
    "relation:matchSlope": () => ({ kind: "matchSlope", from: "a" }),
  };
  const origins = Object.keys(EDITS);

  it("keeps invariant 2 and the rejection contract on every transaction", () => {
    const result = transactionCheck<S>(
      {
        origins,
        init: () => model.initial,
        applyTransaction: (state, origin, edit) => {
          const tx = model.apply(state, EDITS[origin]!(edit as number), "symbolic", origin);
          return {
            before: tx.before,
            after: tx.after,
            origin,
            ops: tx.ops,
            changed: tx.changed,
            rejected: tx.rejected,
            ...(tx.rejection ? { rejection: tx.rejection } : {}),
          };
        },
      },
      [
        { origin: "lineA:slope", edit: 5 },
        { origin: "lineA:slope", edit: 5 }, // no-op: nothing changed, nothing to describe
        { origin: "relation:crossing", edit: 1 },
        { origin: "relation:matchSlope", edit: 0 }, // now parallel — still an accepted change
        { origin: "relation:crossing", edit: 2 }, // …so THIS one is refused, with a reason
        { origin: "lineB:intercept", edit: -3 },
      ] satisfies EditStep[]
    );
    expect(result.failures).toEqual([]);
    expect(result.casesRun).toBe(6);
  });
});

/* ── the independent route really bites ───────────────────────────── */

describe("the independent route bites", () => {
  it("disagrees when the module is wrong", () => {
    // A deliberately wrong crossing: elimination must reject it, or every check above is empty.
    const c = pairOf(3, 2, 1, 6);
    const { A, B } = printed(c);
    const truth = solveByElimination(A, B)!;
    expect(bText(truth.x)).toBe("2");
    const wrong = bAdd(truth.x, bf(1n));
    expect(bText(bAdd(bMul(A.m, wrong), A.b))).not.toBe(bText(bAdd(bMul(B.m, wrong), B.b)));
    // and a same-slope pair really is unsolvable by that route
    const par = printed(pairOf(2, 1, 2, 5));
    expect(solveByElimination(par.A, par.B)).toBeNull();
    expect(sameSlope(par.A, par.B)).toBe(true);
  });
});

/** Unused-import guard: the canonical type is referenced structurally above. */
export type _Line = LineCanonical;
