// @vitest-environment jsdom
/**
 * REVEAL GHOSTS — Session 102 regression gate.
 *
 * Ten engines were lifted err 2 → 3 by giving each a reveal ghost: a dashed,
 * aria-hidden overlay of the CORRECT state, shown only in the revealed phase
 * (tone="info") and only while the learner's state is not already correct.
 * The ghost predicate must mirror src/lib/evaluate.ts exactly — that identity
 * is what this file pins. Three assertions per engine:
 *
 *   1. revealed + wrong state   → ghost PRESENT
 *   2. revealed + correct state → ghost ABSENT (no redundant overlay)
 *   3. working  + wrong state   → ghost ABSENT (reveal-only)
 */
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { SAMPLES } from "./widgetSamples";
import type { TWidget } from "@/lib/schema";

const specOf = (type: string): TWidget => {
  const hit = (SAMPLES as Array<{ type?: string }>).find((s) => s && s.type === type);
  if (!hit) throw new Error(`no sample for ${type}`);
  return hit as TWidget;
};

/** wrong/right learner values per engine, mirroring evaluate's predicates
 * against the shipped sample specs (widgetSamples.ts). */
const CASES: Array<{ type: string; ghost: string; wrong: unknown; right: unknown }> = [
  {
    type: "lineRelationLab", // target: perpendicular to baseAngle 0, ≥2 moves
    ghost: "lr-ghost",
    wrong: { angle: 35, offset: 2, moves: 3 },
    right: { angle: 90, offset: 2, moves: 3 }
  },
  {
    type: "conditionalTableLab", // target: given row0, cell r0c0, ≥2 switches
    ghost: "ct-ghost",
    wrong: { condition: "col0", cell: null, switches: 2 },
    right: { condition: "row0", cell: "r0c0", switches: 2 }
  },
  {
    type: "conicLocusLab", // target: e = 1.0 (tenths 10), ≥4 samples
    ghost: "cl-ghost",
    wrong: { eTenths: 4, samples: 4 },
    right: { eTenths: 10, samples: 4 }
  },
  {
    type: "derivativeRuleLab", // product mode: reach h ≤ 0.1, ≥4 moves
    ghost: "dr-ghost",
    wrong: { h: 1, innerRate: 1, outerRate: 1, moves: 4 },
    right: { h: 0.1, innerRate: 1, outerRate: 1, moves: 4 }
  },
  {
    type: "relatedRatesLab", // target: foot at x = 6, ≥4 moves
    ghost: "rr-ghost",
    wrong: { x: 2, moves: 4 },
    right: { x: 6, moves: 4 }
  },
  {
    type: "argandExplore", // multiply by i, product must land on −2 → z = 2i
    ghost: "ag-ghost",
    wrong: { re: 1, im: 0 },
    right: { re: 0, im: 2 }
  },
  {
    type: "mixedRegroup", // convert 22/7 → 3 wholes and 1/7
    ghost: "mr-ghost",
    wrong: { whole: 0, num: 22, breaks: 0, parts: null, wholes: null, made: 0, msg: "", history: [] },
    right: { whole: 3, num: 1, breaks: 0, parts: null, wholes: null, made: 0, msg: "", history: [] }
  },
  {
    type: "columnCalc", // 35 × 4 = 140: written ones 0, tens 4, lead 1
    ghost: "cc-ghost",
    wrong: {
      written: [0, 2], carries: [], tops: [5, 3], broken: [false, false],
      lead: 1, leadPending: null, msg: "", history: []
    },
    right: {
      written: [0, 4], carries: [], tops: [5, 3], broken: [false, false],
      lead: 1, leadPending: null, msg: "", history: []
    }
  },
  {
    type: "evalOrder", // 2 + 3 × 4 collapses to 14
    ghost: "eo-ghost",
    wrong: { tokens: ["20"], history: [] },
    right: { tokens: ["14"], history: [] }
  },
  {
    type: "scatterFit", // (m 1.5, b 1) has mse 0.125 ≤ tolerance 0.35
    ghost: "scf-ghost",
    wrong: { m: 0, b: 6 },
    right: { m: 1.5, b: 1 }
  }
];

/** Batch 2. Engines whose ghost was ADDED or COMPLETED this session
 * (balanceScale, functionMachine, accumulateArea's area mode), plus three whose
 * ghost already existed and was verified contract-compliant against evaluate —
 * their err rating in scripts/engine-capabilities.json was simply stale.
 * Session 103 resolved this batch's one collision (solveBalance's chip had
 * reused SequenceBuild's sb- prefix; renamed slb-ghost) and brought the chip
 * under the uniform grammar: every ghost is aria-hidden, because on reveal the
 * correct answer already reaches screen readers through the feedback channel —
 * a reachable chip would double-announce it. */
const CASES2: Array<{ type: string; ghost: string; wrong: unknown; right: unknown; aria: boolean }> = [
  {
    type: "balanceScale", // 2x + 3 = 11 balances at x = 4
    ghost: "bsc-ghost",
    wrong: { x: 0 },
    right: { x: 4 },
    aria: true
  },
  {
    type: "functionMachine", // 2·input + 1 = 13 needs input 6
    ghost: "fm-ghost",
    wrong: { input: 0 },
    right: { input: 6 },
    aria: true
  },
  {
    type: "accumulateArea", // area mode: f = 2x, A(x) = x², target area 4 at x = 2
    ghost: "aca-ghost",
    wrong: 0,
    right: 2,
    aria: true
  },
  {
    type: "signChart", // (x+2)(x−1)²(x−3), leading positive → + − − +
    ghost: "sc-ghost",
    wrong: ["+", "+", "+", "+"],
    right: ["+", "-", "-", "+"],
    aria: true
  },
  {
    type: "slopeField", // logistic equilibrium at y = 4
    ghost: "sf-ghost",
    wrong: 1,
    right: 4,
    aria: true
  },
  {
    type: "solveBalance", // 3x + 4 = 19 → x = 5; done = balanced AND isolated
    ghost: "slb-ghost",
    wrong: { leftX: 3, leftUnits: 4, rightUnits: 19 },
    right: { leftX: 1, leftUnits: 0, rightUnits: 5 },
    aria: true
  }
];

afterEach(cleanup);

describe.each(CASES)("$type reveal ghost", ({ type, ghost, wrong, right }) => {
  const spec = specOf(type);
  const renderWith = (value: unknown, tone: "info" | "neutral") =>
    render(
      <WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled tone={tone} />
    );

  it("appears on reveal when the learner's state is wrong", () => {
    renderWith(wrong, "info");
    expect(screen.getByTestId(ghost)).toBeTruthy();
  });

  it("is absent on reveal when the learner already has the correct state", () => {
    renderWith(right, "info");
    expect(screen.queryByTestId(ghost)).toBeNull();
  });

  it("never renders outside the revealed phase", () => {
    renderWith(wrong, "neutral");
    expect(screen.queryByTestId(ghost)).toBeNull();
  });
});

describe("ghost accessibility contract", () => {
  it.each(CASES)("$type ghost is aria-hidden decoration", ({ type, ghost, wrong }) => {
    const spec = specOf(type);
    render(<WidgetRenderer spec={spec} value={wrong} onChange={() => {}} disabled tone="info" />);
    expect(screen.getByTestId(ghost).getAttribute("aria-hidden")).toBe("true");
    cleanup();
  });
});

describe.each(CASES2)("$type reveal ghost (batch 2)", ({ type, ghost, wrong, right, aria }) => {
  const spec = specOf(type);
  const renderWith = (value: unknown, tone: "info" | "neutral") =>
    render(<WidgetRenderer spec={spec} value={value} onChange={() => {}} disabled tone={tone} />);

  it("appears on reveal when the learner's state is wrong", () => {
    renderWith(wrong, "info");
    expect(screen.getByTestId(ghost)).toBeTruthy();
  });

  it("is absent on reveal when the learner already has the correct state", () => {
    renderWith(right, "info");
    expect(screen.queryByTestId(ghost)).toBeNull();
  });

  it("never renders outside the revealed phase", () => {
    renderWith(wrong, "neutral");
    expect(screen.queryByTestId(ghost)).toBeNull();
  });

  it("matches its declared screen-reader treatment", () => {
    renderWith(wrong, "info");
    expect(screen.getByTestId(ghost).getAttribute("aria-hidden")).toBe(aria ? "true" : null);
  });
});
