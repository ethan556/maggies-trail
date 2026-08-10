import { describe, it, expect } from "vitest";

import { stableKey, toSyncTransaction } from "./repSyncGraph";
import { isNoOp, transactionSentence } from "./mmipTypes";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SlopeTriangleSpec, slopeTriangleMatches, type TSlopeTriangle } from "@/lib/schema";
import {
  absorbTriangleLegEdit,
  createLineFamilyGraph,
  deriveTriangleLegs,
  deriveTriangleLine,
  deriveTriangleSlope,
  deriveTriangleVerdict,
  describeTriangleChange,
  makeTriangleCanonical,
  slopeTriangleCanonicalModel,
  makeLineCanonical,
  absorbLineEdit,
  describeLineChange,
  lineEditableSlots,
  lineFamilyCanonicalModel,
  lineRepresentationBindings,
  rat,
  ratText,
  ratFromNumber,
  lineSlopeKey,
  lineIdentityKey,
  type LineFamilyGraph,
  type Rat,
  type TableRowInput
} from "./lineFamilyModel";

/* ================================================================== *
 * Independent mathematics.
 *
 * Everything the module claims is re-derived here in BigInt arithmetic from the PRINTED text of
 * the views. Nothing below calls deriveEquation/deriveTable/deriveTriangle/deriveGraph to work
 * out what the answer should be: slopes come from differencing two printed table rows, the
 * equation is re-parsed with a local regex, and round-trips are confirmed by brute-force search
 * over candidate rationals. If the module and this file agree, they agree for a reason.
 * ================================================================== */

type BF = { n: bigint; d: bigint };

const bgcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
};
const bf = (n: bigint, d: bigint = 1n): BF => {
  if (d === 0n) throw new Error("denominator 0");
  const s = d < 0n ? -1n : 1n;
  const g = bgcd(n, d) || 1n;
  return { n: (s * n) / g, d: (s * d) / g };
};
const bAdd = (a: BF, b: BF): BF => bf(a.n * b.d + b.n * a.d, a.d * b.d);
const bSub = (a: BF, b: BF): BF => bf(a.n * b.d - b.n * a.d, a.d * b.d);
const bMul = (a: BF, b: BF): BF => bf(a.n * b.n, a.d * b.d);
const bDiv = (a: BF, b: BF): BF => bf(a.n * b.d, a.d * b.n);
const bEq = (a: BF, b: BF): boolean => a.n === b.n && a.d === b.d;
const bText = (a: BF): string => (a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`);
/** Parse the module's ASCII rational text — the only channel the test trusts. */
const parseBF = (text: string): BF => {
  const parts = text.split("/");
  return bf(BigInt(parts[0]!), parts[1] === undefined ? 1n : BigInt(parts[1]));
};
const ratToBF = (r: Rat): BF => bf(BigInt(r.n), BigInt(r.d));

const EQUATION = /^y = (-?\d+(?:\/\d+)?)x \+ (-?\d+(?:\/\d+)?)$/;
function parseEquation(text: string): { m: BF; b: BF } {
  const match = EQUATION.exec(text);
  if (!match) throw new Error(`equation text is not in canonical form: ${text}`);
  return { m: parseBF(match[1]!), b: parseBF(match[2]!) };
}

/**
 * The mathematical invariant of the whole architecture, stated once: every representation must
 * describe the same line y = mx + b. Each clause is computed here from printed view text.
 */
function expectRepresentationsAgree(g: LineFamilyGraph): { m: BF; b: BF } {
  const eq = g.view("equation");
  const table = g.view("table");
  const triangle = g.view("triangle");
  const graph = g.view("graph");
  const context = g.view("context");
  const { m, b } = parseEquation(eq.text);

  // 1. Every printed table row satisfies y = mx + b.
  for (const row of table.rows) {
    const x = parseBF(row.xText);
    expect(bText(bAdd(bMul(m, x), b))).toBe(row.yText);
  }

  // 2. The slope read off two printed rows equals the equation's slope.
  if (table.rows.length >= 2) {
    const x0 = parseBF(table.rows[0]!.xText);
    const y0 = parseBF(table.rows[0]!.yText);
    const x1 = parseBF(table.rows[1]!.xText);
    const y1 = parseBF(table.rows[1]!.yText);
    expect(bText(bDiv(bSub(y1, y0), bSub(x1, x0)))).toBe(eq.slopeText);
    // 3. First differences are constant — the table is linear, not merely labelled linear.
    const delta = bSub(y1, y0);
    for (let i = 1; i < table.rows.length; i += 1) {
      const prev = parseBF(table.rows[i - 1]!.yText);
      const here = parseBF(table.rows[i]!.yText);
      expect(bText(bSub(here, prev))).toBe(bText(delta));
    }
    expect(bText(delta)).toBe(ratText(table.firstDifference));
  }

  // 4. The slope triangle's rise ÷ run is that same slope, and its anchor sits on the line.
  expect(bText(bDiv(parseBF(triangle.riseText), parseBF(triangle.runText)))).toBe(eq.slopeText);
  const ax = ratToBF(triangle.anchor.x);
  expect(bText(bAdd(bMul(m, ax), b))).toBe(ratText(triangle.anchor.y));
  expect(bText(bSub(ratToBF(triangle.corner.x), ax))).toBe(triangle.runText);
  expect(bText(bSub(ratToBF(triangle.tip.y), ratToBF(triangle.anchor.y)))).toBe(triangle.riseText);

  // 5. The plotted segment has the same slope and passes through the intercept.
  const gm = bDiv(bSub(ratToBF(graph.to.y), ratToBF(graph.from.y)), bSub(ratToBF(graph.to.x), ratToBF(graph.from.x)));
  expect(bText(gm)).toBe(eq.slopeText);
  expect(bText(bAdd(bMul(m, ratToBF(graph.intercept.x)), b))).toBe(ratText(graph.intercept.y));
  expect(bText(ratToBF(graph.intercept.y))).toBe(eq.interceptText);
  expect(bText(bAdd(m, b))).toBe(ratText(graph.unitPoint.y));

  // 6. Every lattice point the graph claims really is on the line, with integer coordinates.
  for (const point of graph.latticePoints) {
    expect(point.y.d).toBe(1);
    expect(bText(bAdd(bMul(m, ratToBF(point.x)), b))).toBe(ratText(point.y));
  }

  // 7. The context sentence is bound to the same two numbers.
  expect(context.bindings.rateText).toBe(eq.slopeText);
  expect(context.bindings.startText).toBe(eq.interceptText);
  return { m, b };
}

/** Brute-force recovery of the line from the printed table: search, never derive. */
function searchLineFromTable(g: LineFamilyGraph, bound = 12, maxDen = 6): { m: string; b: string }[] {
  const rows = g.view("table").rows.map((row) => ({ x: parseBF(row.xText), y: parseBF(row.yText) }));
  const found: { m: string; b: string }[] = [];
  for (let d = 1; d <= maxDen; d += 1) {
    for (let n = -bound * d; n <= bound * d; n += 1) {
      const m = bf(BigInt(n), BigInt(d));
      const b = bSub(rows[0]!.y, bMul(m, rows[0]!.x));
      if (rows.every((row) => bEq(bAdd(bMul(m, row.x), b), row.y))) {
        const key = { m: bText(m), b: bText(b) };
        if (!found.some((f) => f.m === key.m && f.b === key.b)) found.push(key);
      }
    }
  }
  return found;
}

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

const baseGraph = (): LineFamilyGraph =>
  createLineFamilyGraph({
    m: rat(1),
    b: rat(0),
    anchorX: rat(0),
    run: rat(1),
    domain: { start: rat(-1), step: rat(1), count: 5 }
  });

/* ================================================================== *
 * exact rationals — the numeric policy                                *
 * ================================================================== */

describe("exact rational policy", () => {
  it("normalizes to lowest terms so equal slopes are the same state", () => {
    expect(rat(2, 4)).toEqual(rat(1, 2));
    expect(rat(-3, -6)).toEqual(rat(1, 2));
    expect(rat(3, -6)).toEqual(rat(-1, 2));
    expect(stableKey(rat(6, 8))).toBe(stableKey(rat(3, 4)));
  });

  it("converts a float once, at the boundary, to the simplest rational nearby", () => {
    expect(ratText(ratFromNumber(0.1 + 0.2))).toBe("3/10");
    expect(ratText(ratFromNumber(1 / 3))).toBe("1/3");
    expect(ratText(ratFromNumber(-2.5))).toBe("-5/2");
    expect(ratText(ratFromNumber(7))).toBe("7");
    // 2/3 printed through a float and read back is still exactly 2/3.
    expect(ratText(ratFromNumber(2 / 3))).toBe("2/3");
  });

  it("refuses to leave the exact-integer range instead of going approximate", () => {
    const g = createLineFamilyGraph({ domain: { start: rat(0), step: rat(1), count: 5 } });
    const result = g.apply("equation", { kind: "setSlope", m: rat(4_503_599_627_370_496) });
    expect(result.status).toBe("rejected");
    expect(result.code).toBe("rational-overflow");
    expect(result.reason).toMatch(/exact/);
  });
});

/* ================================================================== *
 * every editable origin round-trips                                   *
 * ================================================================== */

describe("each representation can be the interaction origin", () => {
  it("equation: setting the slope moves every other representation", () => {
    const g = baseGraph();
    const result = g.apply("equation", { kind: "setSlope", m: rat(3, 2) });
    expect(result.status).toBe("applied");
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("3/2");
    expect(bText(b)).toBe("0");
    // Recovered by search over the printed table, not by asking the module.
    expect(searchLineFromTable(g)).toEqual([{ m: "3/2", b: "0" }]);
  });

  it("graph: dragging the intercept handle slides the line and keeps the slope", () => {
    const g = baseGraph();
    g.apply("equation", { kind: "setSlope", m: rat(2) });
    g.apply("graph", { kind: "dragPoint", handle: "intercept", x: rat(0), y: rat(-3) });
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("2");
    expect(bText(b)).toBe("-3");
    // Dragging the intercept handle away from x = 0 still means "hold m, meet this point".
    g.apply("graph", { kind: "dragPoint", handle: "intercept", x: rat(2), y: rat(1) });
    const after = expectRepresentationsAgree(g);
    expect(bText(after.m)).toBe("2"); // 1 = 2·2 + b  ⇒  b = −3
    expect(bText(after.b)).toBe("-3");
  });

  it("graph: dragging the unit handle tilts the line and keeps the intercept", () => {
    const g = baseGraph();
    g.apply("equation", { kind: "setIntercept", b: rat(2) });
    g.apply("graph", { kind: "dragPoint", handle: "unit", x: rat(3), y: rat(-1) });
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(b)).toBe("2"); // held
    expect(bText(m)).toBe("-1"); // (−1 − 2)/3
  });

  it("graph: the free handle pivots about the slope-triangle anchor", () => {
    const g = createLineFamilyGraph({ m: rat(1), b: rat(0), anchorX: rat(2), run: rat(1) });
    // The anchor is (2, 2). Dragging (4, y) to y = 8 makes the slope (8 − 2)/(4 − 2) = 3.
    g.apply("graph", { kind: "dragPoint", handle: "free", x: rat(4), y: rat(8) });
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("3");
    expect(bText(b)).toBe("-4"); // 2 = 3·2 + b
    expect(ratText(g.view("triangle").anchor.y)).toBe("2"); // the pivot really did not move
  });

  it("table: editing an output cell translates the line by default", () => {
    const g = baseGraph();
    g.apply("equation", { kind: "setSlope", m: rat(2) });
    // Row 2 has input 1 (domain starts at −1, step 1). Ask for output 10 ⇒ b = 10 − 2·1 = 8.
    expect(g.view("table").rows[2]!.xText).toBe("1");
    g.apply("table", { kind: "setOutputCell", row: 2, y: rat(10) });
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("2");
    expect(bText(b)).toBe("8");
    expect(g.view("table").rows[2]!.yText).toBe("10");
  });

  it("table: pivot mode tilts instead, holding the intercept", () => {
    const g = createLineFamilyGraph({
      m: rat(1),
      b: rat(1),
      domain: { start: rat(1), step: rat(1), count: 4 },
      policy: { tableEdit: "pivot" }
    });
    // Row 1 has input 2; asking for output 9 with b held gives m = (9 − 1)/2 = 4.
    g.apply("table", { kind: "setOutputCell", row: 1, y: rat(9) });
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("4");
    expect(bText(b)).toBe("1");
  });

  it("table: editing an input cell re-spaces the domain without touching the line", () => {
    const g = baseGraph();
    g.apply("equation", { kind: "setSlope", m: rat(3) });
    const identityBefore = lineIdentityKey(g.getCanonical());
    g.apply("table", { kind: "setInputCell", row: 2, x: rat(5) }); // start −1, so step = 3
    expect(lineIdentityKey(g.getCanonical())).toBe(identityBefore);
    expect(g.view("table").rows.map((r) => r.xText)).toEqual(["-1", "2", "5", "8", "11"]);
    expectRepresentationsAgree(g);
  });

  it("table: pasting collinear rows adopts both the line and the domain", () => {
    const g = baseGraph();
    const rows: TableRowInput[] = [
      { x: rat(0), y: rat(1) },
      { x: rat(2), y: rat(4) },
      { x: rat(4), y: rat(7) }
    ];
    const result = g.apply("table", { kind: "setRows", rows });
    expect(result.status).toBe("applied");
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("3/2"); // (4 − 1)/(2 − 0)
    expect(bText(b)).toBe("1");
    expect(g.view("table").rows.map((r) => `${r.xText},${r.yText}`)).toEqual(["0,1", "2,4", "4,7"]);
  });

  it("slope triangle: run/rise sets the slope and keeps the triangle the learner built", () => {
    const g = baseGraph();
    g.apply("triangle", { kind: "setRunRise", run: rat(4), rise: rat(2) });
    const { m } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("1/2");
    expect(g.view("triangle").runText).toBe("4");
    expect(g.view("triangle").riseText).toBe("2");
    // Re-drawing the same slope with a smaller triangle changes the picture, not the line.
    g.apply("triangle", { kind: "setRun", run: rat(2) });
    expect(g.view("triangle").riseText).toBe("1");
    expect(bText(expectRepresentationsAgree(g).m)).toBe("1/2");
  });

  it("context: editing the rate sentence is the same edit as editing the equation", () => {
    const g = baseGraph();
    g.apply("context", { kind: "setRate", value: rat(-5, 2) });
    g.apply("context", { kind: "setStart", value: rat(7) });
    const { m, b } = expectRepresentationsAgree(g);
    expect(bText(m)).toBe("-5/2");
    expect(bText(b)).toBe("7");
    expect(g.view("context").sentence).toContain("starts at 7");
    expect(g.view("context").sentence).toContain("−5/2");
  });

  it("the canonical model node is display-only, so nothing bypasses an absorb", () => {
    const g = baseGraph();
    expect(g.editable("model")).toBe(false);
    for (const id of ["equation", "graph", "table", "triangle", "context"]) expect(g.editable(id)).toBe(true);
  });
});

/* ================================================================== *
 * equivalence classes                                                 *
 * ================================================================== */

describe("equivalent edits converge", () => {
  it("four different origins that mean 'b = 3' produce one identical state", () => {
    const build = (edit: (g: LineFamilyGraph) => void): { key: string; views: string } => {
      const g = baseGraph();
      g.apply("equation", { kind: "setSlope", m: rat(2) });
      edit(g);
      return { key: g.getState().key, views: g.repIds.map((id) => stableKey(g.view(id))).join("|") };
    };

    const viaEquation = build((g) => g.apply("equation", { kind: "setIntercept", b: rat(3) }));
    const viaContext = build((g) => g.apply("context", { kind: "setStart", value: rat(3) }));
    const viaGraph = build((g) => g.apply("graph", { kind: "dragPoint", handle: "intercept", x: rat(0), y: rat(3) }));
    // Row 3 of the domain (start −1, step 1) is x = 2, and 2·2 + 3 = 7.
    const viaTable = build((g) => g.apply("table", { kind: "setOutputCell", row: 3, y: rat(7) }));

    for (const other of [viaContext, viaGraph, viaTable]) {
      expect(other.key).toBe(viaEquation.key);
      expect(other.views).toBe(viaEquation.views);
    }
  });

  it("distinguishes 'same slope' from 'same state' — 1/2 drawn two ways", () => {
    const a = baseGraph();
    a.apply("triangle", { kind: "setRunRise", run: rat(2), rise: rat(1) });
    const b = baseGraph();
    b.apply("triangle", { kind: "setRunRise", run: rat(4), rise: rat(2) });

    expect(lineSlopeKey(b.getCanonical())).toBe(lineSlopeKey(a.getCanonical()));
    expect(lineIdentityKey(b.getCanonical())).toBe(lineIdentityKey(a.getCanonical()));
    expect(stableKey(b.view("equation"))).toBe(stableKey(a.view("equation")));
    expect(stableKey(b.view("table"))).toBe(stableKey(a.view("table")));
    // …but the triangles are genuinely different pictures, which is the lesson.
    expect(b.getState().key).not.toBe(a.getState().key);
    expect(stableKey(b.view("triangle"))).not.toBe(stableKey(a.view("triangle")));
  });

  it("a reduced and an unreduced slope are the same canonical state", () => {
    const a = baseGraph();
    a.apply("equation", { kind: "setSlope", m: rat(3, 6) });
    const b = baseGraph();
    b.apply("equation", { kind: "setSlope", m: rat(1, 2) });
    expect(b.getState().key).toBe(a.getState().key);
  });
});

/* ================================================================== *
 * rejection paths carry mathematical reasons                          *
 * ================================================================== */

describe("rejections explain themselves", () => {
  const cases: { name: string; run: (g: LineFamilyGraph) => { status: string; code?: string; reason?: string }; code: string; reason: RegExp }[] = [
    {
      name: "a vertical run has no slope",
      run: (g) => g.apply("triangle", { kind: "setRunRise", run: rat(0), rise: rat(3) }),
      code: "run-zero",
      reason: /vertical line is not the graph of y = mx \+ b/
    },
    {
      name: "a triangle with no run has no ratio",
      run: (g) => g.apply("triangle", { kind: "setRun", run: rat(0) }),
      code: "run-zero",
      reason: /non-zero run/
    },
    {
      name: "the unit handle cannot tilt the point at x = 0",
      run: (g) => g.apply("graph", { kind: "dragPoint", handle: "unit", x: rat(0), y: rat(5) }),
      code: "pivot-at-intercept",
      reason: /IS the y-intercept/
    },
    {
      name: "the free handle cannot move its own pivot",
      run: (g) => g.apply("graph", { kind: "dragPoint", handle: "free", x: rat(0), y: rat(5) }),
      code: "pivot-at-anchor",
      reason: /can never move that point/
    },
    {
      name: "three rows that are not collinear name the offending row",
      run: (g) =>
        g.apply("table", {
          kind: "setRows",
          rows: [
            { x: rat(0), y: rat(0) },
            { x: rat(1), y: rat(2) },
            { x: rat(2), y: rat(5) }
          ]
        }),
      code: "table-not-collinear",
      reason: /row 2 says 5/
    },
    {
      name: "rows sharing an input are not a function",
      run: (g) =>
        g.apply("table", {
          kind: "setRows",
          rows: [
            { x: rat(1), y: rat(2) },
            { x: rat(1), y: rat(5) }
          ]
        }),
      code: "table-duplicate-input",
      reason: /one output per input/
    },
    {
      name: "rows all sharing one input describe a vertical line",
      run: (g) =>
        g.apply("table", {
          kind: "setRows",
          rows: [
            { x: rat(3), y: rat(1) },
            { x: rat(3), y: rat(1) }
          ]
        }),
      code: "table-vertical",
      reason: /vertical line/
    },
    {
      name: "one row does not determine a line",
      run: (g) => g.apply("table", { kind: "setRows", rows: [{ x: rat(1), y: rat(2) }] }),
      code: "table-underdetermined",
      reason: /at least two rows/
    },
    {
      name: "a table with step 0 repeats an input",
      run: (g) => g.apply("table", { kind: "setDomain", step: rat(0) }),
      code: "domain-step-zero",
      reason: /distinct inputs/
    },
    {
      name: "a table cannot have zero rows",
      run: (g) => g.apply("table", { kind: "setDomain", count: 0 }),
      code: "domain-count-out-of-range",
      reason: /between 1 and 24 rows/
    },
    {
      name: "an input cell that would collide with row 0",
      run: (g) => g.apply("table", { kind: "setInputCell", row: 2, x: rat(-1) }),
      code: "table-duplicate-input",
      reason: /cannot list one input twice/
    },
    {
      name: "a row that does not exist",
      run: (g) => g.apply("table", { kind: "setOutputCell", row: 9, y: rat(1) }),
      code: "table-row-missing",
      reason: /there is no row 9/
    }
  ];

  for (const testCase of cases) {
    it(testCase.name, () => {
      const g = baseGraph();
      const keyBefore = g.getState().key;
      const viewsBefore = g.getState().views;
      const result = testCase.run(g);
      expect(result.status).toBe("rejected");
      expect(result.code).toBe(testCase.code);
      expect(result.reason).toMatch(testCase.reason);
      expect(g.getState().key).toBe(keyBefore);
      expect(g.getState().views).toBe(viewsBefore);
      expect(g.canUndo()).toBe(false);
    });
  }

  it("pivot mode rejects an output edit on the row whose input is 0", () => {
    const g = createLineFamilyGraph({
      m: rat(1),
      b: rat(1),
      domain: { start: rat(0), step: rat(1), count: 3 },
      policy: { tableEdit: "pivot" }
    });
    const result = g.apply("table", { kind: "setOutputCell", row: 0, y: rat(9) });
    expect(result.status).toBe("rejected");
    expect(result.code).toBe("table-pivot-at-zero");
    expect(result.reason).toMatch(/y-intercept itself/);
  });

  it("rejects out-of-range parameters when no clamp policy is declared", () => {
    const g = createLineFamilyGraph({ policy: { slopeMin: rat(-4), slopeMax: rat(4) } });
    const result = g.apply("equation", { kind: "setSlope", m: rat(9) });
    expect(result.status).toBe("rejected");
    expect(result.code).toBe("slope-out-of-range");
    expect(result.reason).toMatch(/above the largest slope/);
  });

  it("rejects off-lattice parameters when the surface declares integer steps", () => {
    const g = createLineFamilyGraph({ policy: { slopeStep: rat(1), offLattice: "reject" } });
    const result = g.apply("equation", { kind: "setSlope", m: rat(1, 2) });
    expect(result.status).toBe("rejected");
    expect(result.code).toBe("slope-off-lattice");
  });
});

/* ================================================================== *
 * declared clamp policy — the lineExplore surface                     *
 * ================================================================== */

describe("declared clamp policy is applied out loud", () => {
  const lineExploreLike = () =>
    createLineFamilyGraph({
      m: rat(0),
      b: rat(0),
      policy: {
        slopeMin: rat(-4),
        slopeMax: rat(4),
        interceptMin: rat(-5),
        interceptMax: rat(5),
        slopeStep: rat(1),
        interceptStep: rat(1),
        outOfRange: "clamp",
        offLattice: "snap"
      }
    });

  it("snaps a pointer-derived slope to the integer lattice and says so", () => {
    const g = lineExploreLike();
    const result = g.apply("graph", { kind: "dragPoint", handle: "unit", x: rat(1), y: ratFromNumber(2.3) });
    expect(result.status).toBe("applied");
    expect(result.origin.clamp?.code).toBe("slope-snapped");
    expect(result.origin.clamp?.reason).toMatch(/snapped to 2/);
    expect(g.view("equation").slopeText).toBe("2");
  });

  it("clamps past the end of the slider and reports the clamp", () => {
    const g = lineExploreLike();
    const result = g.apply("equation", { kind: "setSlope", m: rat(11) });
    expect(result.status).toBe("applied");
    expect(result.origin.clamp?.code).toBe("slope-clamped");
    expect(g.view("equation").slopeText).toBe("4");
  });

  it("reports both adjustments when a single edit snaps and clamps", () => {
    const g = lineExploreLike();
    const result = g.apply("equation", { kind: "setIntercept", b: rat(31, 4) }); // 7.75 → 8 → 5
    expect(result.origin.clamp?.code).toBe("intercept-snapped+intercept-clamped");
    expect(g.view("equation").interceptText).toBe("5");
  });
});

/* ================================================================== *
 * derived prose and reading forms                                     *
 * ================================================================== */

describe("derived reading forms", () => {
  it("simplifies the display equation without changing the parseable one", () => {
    const check = (m: Rat, b: Rat, display: string): void => {
      const g = createLineFamilyGraph({ m, b });
      expect(g.view("equation").display).toBe(display);
      expect(g.view("equation").text).toBe(`y = ${ratText(m)}x + ${ratText(b)}`);
    };
    check(rat(1), rat(0), "y = x");
    check(rat(-1), rat(0), "y = −x");
    check(rat(0), rat(4), "y = 4");
    check(rat(0), rat(-4), "y = −4");
    check(rat(3), rat(-2), "y = 3x − 2");
    check(rat(-3, 2), rat(5), "y = −3/2x + 5");
  });

  it("writes point-slope through the anchor, and it names the same line", () => {
    const g = createLineFamilyGraph({ m: rat(2), b: rat(1), anchorX: rat(3) });
    // The anchor is (3, 7): 2·3 + 1.
    expect(g.view("equation").pointSlopeText).toBe("y - 7 = 2(x - 3)");
  });

  it("binds the context sentence to the same rate and start", () => {
    const g = createLineFamilyGraph({
      m: rat(60),
      b: rat(10),
      context: { subject: "the hike", xUnitSingular: "hour", yUnit: "metres of climb", xLabel: "time" }
    });
    const view = g.view("context");
    expect(view.startSentence).toBe("the hike starts at 10 metres of climb.");
    expect(view.rateSentence).toBe("Every hour, the hike changes by 60 metres of climb.");
    expect(ratText(view.bindings.rate)).toBe("60");
    expect(ratText(view.bindings.start)).toBe("10");
  });

  it("says a flat line does not change rather than printing a rate of 0", () => {
    const g = createLineFamilyGraph({ m: rat(0), b: rat(2) });
    expect(g.view("context").rateSentence).toMatch(/does not change/);
  });
});

/* ================================================================== *
 * undo as canonical snapshots                                         *
 * ================================================================== */

describe("undo restores whole canonical states", () => {
  it("walks back through every representation's edits exactly", () => {
    const g = baseGraph();
    const keys: string[] = [g.getState().key];
    const viewKeys: string[] = [g.repIds.map((id) => stableKey(g.view(id))).join("|")];
    const edits: (() => void)[] = [
      () => g.apply("equation", { kind: "setSlope", m: rat(3) }),
      () => g.apply("graph", { kind: "dragPoint", handle: "intercept", x: rat(1), y: rat(0) }),
      () => g.apply("table", { kind: "setOutputCell", row: 1, y: rat(2) }),
      () => g.apply("triangle", { kind: "setRunRise", run: rat(3), rise: rat(-6) }),
      () => g.apply("context", { kind: "setStart", value: rat(4) })
    ];
    for (const edit of edits) {
      edit();
      keys.push(g.getState().key);
      viewKeys.push(g.repIds.map((id) => stableKey(g.view(id))).join("|"));
    }
    for (let i = keys.length - 1; i > 0; i -= 1) {
      expect(g.getState().key).toBe(keys[i]);
      expect(g.repIds.map((id) => stableKey(g.view(id))).join("|")).toBe(viewKeys[i]);
      g.undo();
      expectRepresentationsAgree(g);
    }
    expect(g.getState().key).toBe(keys[0]);
  });

  it("treats a drag as one undo step", () => {
    const g = baseGraph();
    const before = g.getState().key;
    for (let i = 1; i <= 8; i += 1) {
      g.apply("graph", { kind: "dragPoint", handle: "intercept", x: rat(0), y: rat(i) }, { gesture: "drag-b" });
    }
    expect(g.view("equation").interceptText).toBe("8");
    g.undo();
    expect(g.getState().key).toBe(before);
  });
});

/* ================================================================== *
 * random walk: no stale views, no drift                               *
 * ================================================================== */

type WalkEdit = { rep: "equation" | "graph" | "table" | "triangle" | "context"; edit: unknown };

function randomEdit(rnd: () => number, rowCount: number): WalkEdit {
  const int = (lo: number, hi: number): number => lo + Math.floor(rnd() * (hi - lo + 1));
  const smallRat = (): Rat => rat(int(-6, 6), int(1, 4));
  const roll = rnd();
  if (roll < 0.14) return { rep: "equation", edit: { kind: "setSlope", m: smallRat() } };
  if (roll < 0.26) return { rep: "equation", edit: { kind: "setIntercept", b: smallRat() } };
  if (roll < 0.42) {
    const handles = ["intercept", "unit", "free"] as const;
    return { rep: "graph", edit: { kind: "dragPoint", handle: handles[int(0, 2)]!, x: rat(int(-4, 4)), y: rat(int(-8, 8)) } };
  }
  if (roll < 0.54) return { rep: "table", edit: { kind: "setOutputCell", row: int(0, rowCount + 1), y: smallRat() } };
  if (roll < 0.62) return { rep: "table", edit: { kind: "setInputCell", row: int(0, rowCount - 1), x: rat(int(-6, 6)) } };
  if (roll < 0.70) return { rep: "table", edit: { kind: "setDomain", step: rat(int(-3, 3)), count: int(0, 7) } };
  if (roll < 0.78) {
    // Half the time the rows are honestly collinear; half the time one is nudged off the line.
    const m = smallRat();
    const b = smallRat();
    const rows = [0, 1, 2].map((i) => {
      const x = rat(i);
      const y = rat(m.n * i * b.d + b.n * m.d, m.d * b.d);
      return { x, y };
    });
    if (rnd() < 0.5) rows[2] = { x: rows[2]!.x, y: rat(rows[2]!.y.n + rows[2]!.y.d, rows[2]!.y.d) };
    return { rep: "table", edit: { kind: "setRows", rows } };
  }
  if (roll < 0.88) return { rep: "triangle", edit: { kind: "setRunRise", run: rat(int(-4, 4)), rise: rat(int(-6, 6)) } };
  if (roll < 0.92) return { rep: "triangle", edit: { kind: "setRun", run: rat(int(-3, 3)) } };
  if (roll < 0.96) return { rep: "triangle", edit: { kind: "setAnchorX", x: rat(int(-4, 4)) } };
  return { rep: "context", edit: rnd() < 0.5 ? { kind: "setRate", value: smallRat() } : { kind: "setStart", value: smallRat() } };
}

describe("100-edit seeded random walk", () => {
  it("never leaves a stale view and never contradicts itself", () => {
    const g = baseGraph();
    const rnd = lcg(208_208);
    let applied = 0;
    let rejected = 0;
    const codes = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const keyBefore = g.getState().key;
      const step = randomEdit(rnd, g.view("table").rows.length);
      const result = (g as unknown as { apply: (rep: string, edit: unknown) => { status: string; code?: string; reason?: string; origin: { changedViews: readonly string[] } } }).apply(step.rep, step.edit);

      expect(g.verifyFresh()).toEqual([]);
      expectRepresentationsAgree(g);

      if (result.status === "rejected") {
        rejected += 1;
        codes.add(result.code!);
        expect(result.reason!.length).toBeGreaterThan(20);
        expect(g.getState().key).toBe(keyBefore);
      } else if (result.status === "applied") {
        applied += 1;
        expect(g.getState().key).not.toBe(keyBefore);
        expect(result.origin.changedViews).toContain("model");
      }
    }
    expect(applied).toBeGreaterThan(50);
    expect(rejected).toBeGreaterThan(3);
    expect(codes.size).toBeGreaterThan(1);
  });

  it("is reproducible: the same seed lands on the same canonical state", () => {
    const walk = (): string => {
      const g = baseGraph();
      const rnd = lcg(1_208);
      for (let i = 0; i < 120; i += 1) {
        const step = randomEdit(rnd, g.view("table").rows.length);
        (g as unknown as { apply: (rep: string, edit: unknown) => unknown }).apply(step.rep, step.edit);
      }
      return g.getState().key;
    };
    expect(walk()).toBe(walk());
  });
});

describe("float drift", () => {
  it("accumulates exactly zero drift over a long drag walk", () => {
    const g = createLineFamilyGraph({ m: rat(1), b: rat(0) });
    const rnd = lcg(777);
    for (let i = 0; i < 400; i += 1) {
      // A pointer supplies pixels; the adapter converts once, and the model stores rationals.
      const target = (Math.floor(rnd() * 13) - 6) / 7;
      const result = g.apply("equation", { kind: "setSlope", m: ratFromNumber(target) });
      if (result.status === "rejected") continue;
      const expected = ratFromNumber(target);
      expect(g.view("equation").slopeText).toBe(ratText(expected));
      // Read the slope out of the printed table and back: still bit-identical.
      const rows = g.view("table").rows;
      const recovered = bDiv(bSub(parseBF(rows[1]!.yText), parseBF(rows[0]!.yText)), bSub(parseBF(rows[1]!.xText), parseBF(rows[0]!.xText)));
      expect(bText(recovered)).toBe(ratText(expected));
    }
  });

  it("survives 500 alternating drag/table round trips with no denominator creep", () => {
    const g = createLineFamilyGraph({ m: rat(1, 3), b: rat(0), domain: { start: rat(0), step: rat(3), count: 4 } });
    for (let i = 0; i < 500; i += 1) {
      // Drag the unit handle to the point the table already prints, then push a table value back.
      const unit = g.view("graph").unitPoint;
      g.apply("graph", { kind: "dragPoint", handle: "unit", x: unit.x, y: unit.y });
      const row = g.view("table").rows[2]!;
      g.apply("table", { kind: "setOutputCell", row: 2, y: row.y });
    }
    expect(g.view("equation").text).toBe("y = 1/3x + 0");
    expect(g.getCanonical().m).toEqual(rat(1, 3));
    expect(g.getCanonical().b).toEqual(rat(0));
  });

  it("keeps a float round trip exact through every representation", () => {
    const g = createLineFamilyGraph({ domain: { start: rat(0), step: rat(1), count: 4 } });
    g.apply("equation", { kind: "setSlope", m: ratFromNumber(0.1 + 0.2) });
    expect(g.view("equation").slopeText).toBe("3/10");
    expect(g.view("table").rows.map((r) => r.yText)).toEqual(["0", "3/10", "3/5", "9/10"]);
    expectRepresentationsAgree(g);
  });
});

/* ================================================================== *
 * purity of the absorb layer                                          *
 * ================================================================== */

describe("absorb is pure", () => {
  it("returns the same outcome for the same (state, edit) regardless of call order", () => {
    const c = makeLineCanonical({ m: rat(2), b: rat(1) });
    const first = absorbLineEdit(c, { kind: "setSlope", m: rat(5, 3) });
    const noise = absorbLineEdit(c, { kind: "setIntercept", b: rat(-9) });
    const second = absorbLineEdit(c, { kind: "setSlope", m: rat(5, 3) });
    expect(stableKey(second)).toBe(stableKey(first));
    expect(stableKey(noise)).not.toBe(stableKey(first));
    // and the input state is untouched
    expect(stableKey(c)).toBe(stableKey(makeLineCanonical({ m: rat(2), b: rat(1) })));
  });
});

/* ================================================================== *
 * MMIP v1 adoption                                                    *
 * ================================================================== */

describe("MMIP v1 adoption", () => {
  it("names the operation, not the pixel diff", () => {
    const at = (m: Rat, b: Rat = rat(0), run: Rat = rat(1)) => makeLineCanonical({ m, b, run });

    // Reversing a rate is a reflection, not "the slope number changed".
    expect(describeLineChange(at(rat(2)), at(rat(-2)))).toEqual([
      expect.objectContaining({ kind: "negate", target: "slope", amount: -1 })
    ]);
    // Tripling it is a branch; halving it is a partition.
    expect(describeLineChange(at(rat(1)), at(rat(3)))[0]).toMatchObject({ kind: "distribute", amount: 3 });
    expect(describeLineChange(at(rat(2)), at(rat(1)))[0]).toMatchObject({ kind: "divide", amount: 2 });
    // A rate change that is neither is an honest add.
    expect(describeLineChange(at(rat(1)), at(rat(3, 2)))[0]).toMatchObject({ kind: "add", target: "slope" });
    // Sliding the line names the direction and the exact amount.
    const slide = describeLineChange(at(rat(1), rat(1)), at(rat(1), rat(-4)))[0]!;
    expect(slide.kind).toBe("subtract");
    expect(slide.target).toBe("intercept");
    expect(slide.describe).toBe("Slide the line down by 5: the starting value moves from 1 to -4.");
    // Redrawing the same slope on a wider triangle is a branch on the triangle, not on the line.
    const redraw = describeLineChange(at(rat(1, 2), rat(0), rat(2)), at(rat(1, 2), rat(0), rat(6)));
    expect(redraw).toEqual([expect.objectContaining({ kind: "distribute", target: "triangle", amount: 3 })]);
  });

  it("returns an MMIP transaction whose before/after are whole canonical states", () => {
    const before = makeLineCanonical({ m: rat(1), b: rat(0) });
    const tx = lineFamilyCanonicalModel().apply(before, { kind: "setIntercept", b: rat(3) }, "symbolic", "equation");
    expect(tx.rejected).toBe(false);
    expect(tx.changed).toBe(true);
    expect(tx.before).toBe(before);
    expect(ratText(tx.after.b)).toBe("3");
    expect(tx.source).toBe("equation");
    expect(tx.origin).toBe("symbolic");
    expect(transactionSentence(tx)).toMatch(/Slide the line up by 3/);
  });

  it("speaks the mathematical reason when it refuses", () => {
    const before = makeLineCanonical();
    const tx = lineFamilyCanonicalModel().apply(before, { kind: "setRunRise", run: rat(0), rise: rat(1) }, "physical", "triangle");
    expect(tx.rejected).toBe(true);
    expect(tx.after).toBe(before);
    expect(tx.rejection?.code).toBe("run-zero");
    expect(transactionSentence(tx)).toMatch(/vertical line is not the graph/);
  });

  it("reports re-entering the same value as a no-op rather than a change", () => {
    const before = makeLineCanonical({ m: rat(2), b: rat(1) });
    const tx = lineFamilyCanonicalModel().apply(before, { kind: "setSlope", m: rat(2) }, "symbolic", "equation");
    expect(isNoOp(tx)).toBe(true);
  });

  it("normalizes anything into a usable line without throwing", () => {
    const rubbish: unknown[] = [
      null,
      undefined,
      42,
      "line",
      [],
      { m: { n: 1, d: 0 } },
      { m: { n: 0.5, d: 2 } },
      { m: "3" },
      { run: rat(0) },
      { domain: { step: rat(0), count: 900 } },
      { domain: { count: -3 } },
      { window: { xMin: 4, xMax: 4 } },
      { policy: { outOfRange: "explode", tableEdit: 7 } },
      { context: { subject: 12 } }
    ];
    for (const raw of rubbish) {
      const state = lineFamilyCanonicalModel().normalize(raw);
      // Every rational really is a rational, in lowest terms with a positive denominator.
      for (const value of [state.m, state.b, state.anchorX, state.run, state.domain.start, state.domain.step]) {
        expect(Number.isInteger(value.n)).toBe(true);
        expect(value.d).toBeGreaterThan(0);
        expect(value).toEqual(rat(value.n, value.d));
      }
      expect(state.run.n).not.toBe(0);
      expect(state.domain.step.n).not.toBe(0);
      expect(state.domain.count).toBeGreaterThanOrEqual(1);
      expect(state.domain.count).toBeLessThanOrEqual(24);
      expect(state.window.xMax).toBeGreaterThan(state.window.xMin);
      expect(["reject", "clamp"]).toContain(state.policy.outOfRange);
      expect(["translate", "pivot"]).toContain(state.policy.tableEdit);
      expect(typeof state.context.subject).toBe("string");
      // And the normalized state is immediately usable as a graph.
      expectRepresentationsAgree(createLineFamilyGraph(state));
    }
    // Good input survives intact.
    expect(ratText(lineFamilyCanonicalModel().normalize({ m: rat(3), b: rat(-2, 5) }).b)).toBe("-2/5");
  });

  it("calls two states equivalent when they claim the same line", () => {
    const a = makeLineCanonical({ m: rat(1, 2), b: rat(2), run: rat(2), domain: { start: rat(0), step: rat(1), count: 3 } });
    const b = makeLineCanonical({ m: rat(2, 4), b: rat(2), run: rat(7), domain: { start: rat(-5), step: rat(4), count: 6 } });
    const c = makeLineCanonical({ m: rat(1, 2), b: rat(3) });
    expect(lineFamilyCanonicalModel().equivalent(a, b)).toBe(true);
    expect(lineFamilyCanonicalModel().equivalent(a, c)).toBe(false);
  });

  it("bridges a graph transaction into the MMIP shape", () => {
    const g = baseGraph();
    const before = g.getCanonical();
    const result = g.apply("graph", { kind: "dragPoint", handle: "intercept", x: rat(0), y: rat(5) });
    const tx = toSyncTransaction(before, result, "physical", describeLineChange(before, g.getCanonical()));
    expect(tx.source).toBe("graph");
    expect(tx.changed).toBe(true);
    expect(tx.ops[0]?.target).toBe("intercept");

    const rejected = g.apply("graph", { kind: "dragPoint", handle: "unit", x: rat(0), y: rat(1) });
    const rtx = toSyncTransaction(g.getCanonical(), rejected, "physical");
    expect(rtx.rejected).toBe(true);
    expect(rtx.rejection?.code).toBe("pivot-at-intercept");
    expect(rtx.ops).toEqual([]);
  });

  it("describes the editable numbers in words a screen reader can use", () => {
    const c = makeLineCanonical({
      context: { subject: "the hike", xLabel: "time", xUnitSingular: "hour", yLabel: "climb", yUnit: "metres" },
      policy: { slopeMin: rat(-4), slopeMax: rat(4), slopeStep: rat(1) }
    });
    const slots = lineEditableSlots(c);
    expect(slots.map((s) => s.target)).toEqual(["slope", "intercept"]);
    expect(slots[0]).toMatchObject({ min: -4, max: 4, step: 1, editable: true });
    expect(slots[0]!.meaning).toBe("the rate of change: how much climb changes for each hour");
    expect(slots[1]!.meaning).toBe("the starting value: the climb when time is 0");
    // With no declared bounds, the graph window supplies a reachable range.
    expect(lineEditableSlots(makeLineCanonical())[0]).toMatchObject({ min: -6, max: 6, step: 1 });
  });

  it("exposes the same five nodes through the MMIP binding interface", () => {
    const bindings = lineRepresentationBindings();
    const state = makeLineCanonical({ m: rat(2), b: rat(1) });
    expect(bindings.map((b) => b.id)).toEqual(["model", "equation", "graph", "table", "triangle", "context"]);
    expect(bindings.map((b) => b.editable(state))).toEqual([false, true, true, true, true, true]);
    const equation = bindings.find((b) => b.id === "equation")!;
    expect(stableKey(equation.derive(state))).toBe(stableKey(createLineFamilyGraph({ m: rat(2), b: rat(1) }).view("equation")));
  });
});

/* ================================================================== *
 * THE SLOPE TRIANGLE — and the vertical-line decision                 *
 * ================================================================== */

describe("the slope triangle is a pair of legs, not a line", () => {
  const tri = (over: Partial<{ ax: number; ay: number; bx: number; by: number; run: number; rise: number }> = {}) => {
    const p = { ax: 2, ay: 1, bx: 6, by: 9, run: 1, rise: 0, ...over };
    return makeTriangleCanonical({
      anchor: { x: rat(p.ax), y: rat(p.ay) },
      through: { x: rat(p.bx), y: rat(p.by) },
      run: rat(p.run),
      rise: rat(p.rise),
      window: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
      policy: { legMax: rat(SWEEP_BOUND) }
    });
  };

  /** Derived from the authored specs below, never hand-picked — see the note on `authored`. */
  const SWEEP_BOUND = 14;

  /**
   * Every slopeTriangle spec the product actually ships, read off disk. The sweep bound below is
   * DERIVED from these rather than chosen, because a hand-picked bound is exactly how the first
   * version of this test came to claim "every buildable triangle" while covering ±8 when nine of
   * the ten authored specs allow ±14 (S209 review). If content later authors a longer leg, the
   * bound moves with it and the coverage assertion keeps it honest.
   */
  const authored = (() => {
    const root = join(process.cwd(), "content", "courses");
    const out: { file: string; spec: TSlopeTriangle }[] = [];
    for (const course of readdirSync(root)) {
      const dir = join(root, course, "lessons");
      let files: string[];
      try {
        files = readdirSync(dir);
      } catch {
        continue;
      }
      for (const f of files.filter((f) => f.endsWith(".json"))) {
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
          steps?: { widget?: { type?: string } }[];
        };
        for (const step of lesson.steps ?? []) {
          if (step.widget?.type === "slopeTriangle") {
            out.push({ file: `${course}/${f}`, spec: SlopeTriangleSpec.parse(step.widget) as TSlopeTriangle });
          }
        }
      }
    }
    return out;
  })();

  it("covers every leg the authored content can actually build", () => {
    // The coverage claim itself, asserted rather than assumed.
    expect(authored.length).toBeGreaterThan(0);
    const maxAuthored = Math.max(...authored.map((a) => a.spec.legMax));
    expect(SWEEP_BOUND).toBeGreaterThanOrEqual(maxAuthored);
    for (const a of authored) expect([a.file, a.spec.legMax <= SWEEP_BOUND]).toEqual([a.file, true]);
  });

  it("agrees with the shipped grader on EVERY buildable triangle, including both boundaries", () => {
    // The strongest independence available: `slopeTriangleMatches` lives in another module, was
    // written years earlier, and decides by its own case analysis. Exhaustive over the whole leg
    // lattice — for every authored problem, plus four synthetic ones that pin the boundaries a
    // horizontal, a vertical and a float-trap line create.
    const synthetic = [
      { file: "synthetic: slope 2", ax: 2, ay: 1, bx: 6, by: 9 },
      { file: "synthetic: horizontal", ax: 2, ay: 5, bx: 7, by: 5 },
      { file: "synthetic: vertical", ax: 4, ay: 1, bx: 4, by: 7 },
      // The smallest problem on which the old float verdict and the grader part company.
      { file: "synthetic: float trap", ax: -14, ay: -14, bx: 7, by: 13 }
    ];
    const problems = [
      ...authored.map((a) => ({ file: a.file, ax: a.spec.ax, ay: a.spec.ay, bx: a.spec.bx, by: a.spec.by })),
      ...synthetic
    ];
    const disagreements: unknown[] = [];
    let checked = 0;
    let agreedTrue = 0;
    for (const p of problems) {
      for (let run = -SWEEP_BOUND; run <= SWEEP_BOUND; run += 1) {
        for (let rise = -SWEEP_BOUND; rise <= SWEEP_BOUND; rise += 1) {
          const mine = deriveTriangleVerdict(tri({ ...p, run, rise })).passes;
          const theirs = slopeTriangleMatches(p, run, rise);
          checked += 1;
          if (mine) agreedTrue += 1;
          if (mine !== theirs) disagreements.push({ ...p, run, rise, mine, theirs });
        }
      }
    }
    expect(disagreements).toEqual([]);
    expect(checked).toBe(problems.length * (2 * SWEEP_BOUND + 1) ** 2);
    expect(problems.length).toBeGreaterThanOrEqual(authored.length + 4);
    expect(agreedTrue).toBeGreaterThan(20); // the check is not vacuously "everything is false"
  });

  it("names the undefined-slope moment instead of refusing it", () => {
    const vertical = tri({ run: 0, rise: 3 });
    const slope = deriveTriangleSlope(vertical);
    expect(slope.kind).toBe("undefined");
    expect(slope.text).toBe("undefined");
    if (slope.kind === "slope") throw new Error("unreachable");
    expect(slope.reason).toMatch(/never takes a step across/);
    const line = deriveTriangleLine(vertical);
    expect(line.kind).toBe("vertical");
    if (line.kind === "vertical") {
      expect(ratText(line.x)).toBe("2"); // the anchor's own input
      expect([ratText(line.from.y), ratText(line.to.y)]).toEqual(["-10", "10"]);
    }
  });

  it("names the empty triangle too, and draws no line for it", () => {
    const empty = tri({ run: 0, rise: 0 });
    expect(deriveTriangleSlope(empty)).toMatchObject({ kind: "none", text: "no triangle" });
    expect(deriveTriangleLine(empty)).toMatchObject({ kind: "absent" });
    expect(deriveTriangleLegs(empty).degenerate).toBe(true);
    expect(deriveTriangleVerdict(empty).passes).toBe(false);
  });

  it("hands out a real LineCanonical exactly when the legs make a function of x", () => {
    const built = tri({ run: 4, rise: 8 });
    const line = deriveTriangleLine(built);
    expect(line.kind).toBe("function");
    if (line.kind !== "function") throw new Error("unreachable");
    // Independently: the slope from the two plotted endpoints, and the anchor really on the line.
    const m = bDiv(bSub(ratToBF(line.to.y), ratToBF(line.from.y)), bSub(ratToBF(line.to.x), ratToBF(line.from.x)));
    expect(bText(m)).toBe("2"); // 8 ÷ 4
    // y at the anchor x = 2 must be the anchor y = 1: 2·2 + b = 1 ⇒ b = −3.
    expect(bText(bAdd(bMul(m, bf(2n)), ratToBF(line.line.b)))).toBe("1");
    expect(ratText(line.line.b)).toBe("-3");
    // …and that LineCanonical is a fully derivable line like any other.
    expectRepresentationsAgree(createLineFamilyGraph(line.line));
  });

  it("keeps LineCanonical total: the line model still refuses the vertical state", () => {
    // The boundary the decision draws. The triangle model accepts run 0; the line model does not,
    // and that is what stops every other consumer inheriting a case it cannot render.
    const g = createLineFamilyGraph({ m: rat(1), b: rat(0) });
    const rejected = g.apply("triangle", { kind: "setRunRise", run: rat(0), rise: rat(3) });
    expect(rejected.status).toBe("rejected");
    expect(rejected.code).toBe("run-zero");
    // And the triangle model accepts the very same numbers.
    const accepted = absorbTriangleLegEdit(tri(), { kind: "setLegs", run: rat(0), rise: rat(3) });
    expect(accepted.ok).toBe(true);
  });

  it("reads the ratio exactly, reduced, with signs kept", () => {
    for (const [run, rise, text] of [
      [4, 8, "2"],
      [2, 1, "1/2"],
      [-3, 6, "-2"],
      [3, -6, "-2"],
      [-2, -6, "3"],
      [5, 0, "0"]
    ] as const) {
      const slope = deriveTriangleSlope(tri({ run, rise }));
      expect([run, rise, slope.kind === "slope" ? slope.text : slope.text]).toEqual([run, rise, text]);
      // Independently, in BigInt, from the printed legs.
      const legs = deriveTriangleLegs(tri({ run, rise }));
      expect(bText(bDiv(parseBF(legs.riseText), parseBF(legs.runText)))).toBe(text);
    }
  });

  it("calls two triangles equivalent when they claim the same slope — the lesson itself", () => {
    const model = slopeTriangleCanonicalModel();
    const half = (run: number, rise: number) =>
      makeTriangleCanonical({ run: rat(run), rise: rat(rise) });
    expect(model.equivalent(half(2, 1), half(4, 2))).toBe(true);
    expect(model.equivalent(half(2, 1), half(2, 2))).toBe(false);
    // Two vertical triangles are the same claim; vertical and empty are not.
    expect(model.equivalent(half(0, 3), half(0, -5))).toBe(true);
    expect(model.equivalent(half(0, 3), half(0, 0))).toBe(false);
  });

  it("clamps a leg past the authored maximum and says so", () => {
    const g = slopeTriangleCanonicalModel({ policy: { legMax: rat(8) } }).createGraph();
    const result = g.apply("legs", { kind: "setRunLeg", run: rat(30) });
    expect(result.status).toBe("applied");
    expect(result.origin.clamp?.code).toBe("run-clamped");
    expect(g.view("legs").runText).toBe("8");
    const low = g.apply("legs", { kind: "setRiseLeg", rise: rat(-99) });
    expect(low.origin.clamp?.code).toBe("rise-clamped");
    expect(g.view("legs").riseText).toBe("-8");
  });

  it("propagates one leg edit to every triangle representation at once", () => {
    const model = slopeTriangleCanonicalModel({
      anchor: { x: rat(2), y: rat(1) },
      through: { x: rat(6), y: rat(9) },
      run: rat(1),
      rise: rat(0),
      window: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
    });
    const g = model.createGraph();
    expect(g.view("verdict").passes).toBe(false);
    g.apply("legs", { kind: "setLegs", run: rat(2), rise: rat(4) });
    expect(g.verifyFresh()).toEqual([]);
    expect(g.view("slope")).toMatchObject({ kind: "slope", text: "2" });
    expect(g.view("verdict").passes).toBe(true);
    expect(g.view("line").kind).toBe("function");
    // Undo is the graph's, and it restores the whole state exactly.
    g.undo();
    expect(g.view("legs").riseText).toBe("0");
    expect(g.view("verdict").passes).toBe(false);
  });

  it("names the operation the legs performed", () => {
    const at = (run: number, rise: number) => makeTriangleCanonical({ run: rat(run), rise: rat(rise) });
    expect(describeTriangleChange(at(1, 2), at(1, 5))[0]).toMatchObject({ kind: "add", target: "rise", amount: 3 });
    expect(describeTriangleChange(at(3, 0), at(-3, 0))[0]).toMatchObject({ kind: "negate", target: "run" });
    expect(describeTriangleChange(at(1, 2), at(1, 2))).toEqual([]);
  });

  it("normalizes a persisted pair without throwing", () => {
    const model = slopeTriangleCanonicalModel({ run: rat(1), rise: rat(0) });
    for (const raw of [null, 7, "legs", {}, { run: "2" }, { run: Number.NaN, rise: 3 }, { run: 2.5, rise: 1 }]) {
      const state = model.normalize(raw);
      expect(state.run).toEqual(rat(state.run.n, state.run.d));
      expect(state.rise).toEqual(rat(state.rise.n, state.rise.d));
      expect(deriveTriangleLegs(state)).toBeTruthy();
    }
    expect(ratText(model.normalize({ run: 3, rise: -6 }).rise)).toBe("-6");
  });
});
