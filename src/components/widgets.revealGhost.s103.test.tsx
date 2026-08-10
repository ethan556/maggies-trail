// @vitest-environment jsdom
/**
 * REVEAL GHOSTS — Session 103 additions.
 *
 * Batch-2 engines (accumulateArea, balanceScale, functionMachine, signChart,
 * slopeField, solveBalance) are pinned in widgets.revealGhost.s102.test.tsx's
 * CASES2. This file adds the two pieces that pass left open:
 *
 *  1. polarTrace — its limaçon ghost predated the ratings programme but was
 *     never rating-lifted or behaviorally pinned. The shipped sample is rose
 *     mode (deliberately ghost-free: no unique n per petal count), so the
 *     limaçon path is pinned via a spec override.
 *  2. A file-wide cross-engine testid uniqueness gate — the collision class
 *     Session 103 fixed (solveBalance's chip had reused SequenceBuild's sb-
 *     prefix; renamed slb-ghost, aria-hidden added, and a literal "\u2014" in
 *     its JSX text replaced with a real em dash).
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

const CASES: Array<{ type: string; ghost: string; wrong: unknown; right: unknown; spec?: TWidget }> = [
  {
    type: "polarTrace", // limaçon mode: r = a + 2cosθ, reach a = targetA
    ghost: "pt-ghost",
    // The shipped sample is rose mode, where the ghost is deliberately absent
    // (no unique n per petal count). The limaçon override is assigned below.
    wrong: 1,
    right: 2
  }
];
// polarTrace limaçon override (kept out of the literal above for clarity)
CASES[CASES.length - 1].spec = {
  ...(specOf("polarTrace") as object),
  mode: "limacon",
  targetA: 2,
  start: 1
} as TWidget;

afterEach(cleanup);

describe.each(CASES)("$type reveal ghost (tranche 2)", ({ type, ghost, wrong, right, spec }) => {
  const s = spec ?? specOf(type);
  const renderWith = (value: unknown, tone: "info" | "neutral") =>
    render(<WidgetRenderer spec={s} value={value} onChange={() => {}} disabled tone={tone} />);

  it("appears on reveal when the learner's state is wrong", () => {
    renderWith(wrong, "info");
    expect(screen.getAllByTestId(ghost).length).toBeGreaterThan(0);
  });

  it("is absent on reveal when the learner already has the correct state", () => {
    renderWith(right, "info");
    expect(screen.queryAllByTestId(ghost)).toEqual([]);
  });

  it("never renders outside the revealed phase", () => {
    renderWith(wrong, "neutral");
    expect(screen.queryAllByTestId(ghost)).toEqual([]);
  });

  it("is aria-hidden decoration", () => {
    renderWith(wrong, "info");
    for (const el of screen.getAllByTestId(ghost)) {
      expect(el.getAttribute("aria-hidden")).toBe("true");
    }
  });
});

describe("cross-engine testid uniqueness", () => {
  // FABLE-QA S215, F7: a widget's component can now live outside the monolith
  // (`src/components/widgets/numberLineRay.tsx`) — scanning `widgets.tsx` alone would leave a
  // prefix collision between an isolated module and the monolith, or between two isolated
  // modules, structurally undetectable the moment a second engine moves out.
  it("no ghost prefix is shared by two engines (the collision class fixed in s103) — across every file a widget component can live in", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = join(process.cwd(), "src", "components");
    const files = [join(root, "widgets.tsx")];
    for (const name of readdirSync(join(root, "widgets"))) {
      if (name.endsWith(".tsx")) files.push(join(root, "widgets", name));
    }
    const owners = new Map<string, Set<string>>();
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      // Every top-level function declaration's start, in source order — handles the monolith's
      // bare `function Foo(` and an isolated module's `export function Foo(` alike (an isolated
      // module exports its component individually; the monolith never does).
      const starts = [...src.matchAll(/\n(?:export )?function (\w+)/g)].map((m) => ({
        pos: m.index ?? 0,
        name: m[1]
      }));
      const ownerAt = (pos: number): string => {
        let owner = "?";
        for (const s of starts) {
          if (s.pos > pos) break;
          owner = s.name;
        }
        return owner;
      };
      for (const m of src.matchAll(/(?:data-testid|testid)="([a-z]+)-ghost"/g)) {
        const set = owners.get(m[1]) ?? new Set<string>();
        // Qualify by file too: two different top-level functions that happened to share a bare
        // name across two files would otherwise merge into one "owner" and hide a real collision.
        set.add(`${file}::${ownerAt(m.index ?? 0)}`);
        owners.set(m[1], set);
      }
    }
    const collisions = [...owners.entries()].filter(([, v]) => v.size > 1);
    expect(collisions).toEqual([]);
  });
});

/**
 * TRANCHE 3 (Session 104): nine more engines, same four-way pin. The distinct
 * ghost designs worth noting: vectorExplore's dot mode ghosts the whole
 * SOLUTION LINE u·v = c (many v satisfy it, so no single v is privileged);
 * estimateSlider ghosts the acceptance BAND with the target ticked (estimation
 * stays an interval idea); placeValue and riemannSum ghost the signed/absolute
 * GAP because their targets are already visible on screen.
 */
const CASES3: Array<{ type: string; ghost: string; wrong: unknown; right: unknown }> = [
  { type: "placeValue", ghost: "pv-ghost", wrong: { h: 1, t: 3, o: 4 }, right: { h: 2, t: 3, o: 4 } },
  { type: "fractionOfSet", ghost: "fos-ghost", wrong: 5, right: 9 },
  { type: "elapsedTime", ghost: "et-ghost", wrong: 30, right: 45 },
  { type: "estimateSlider", ghost: "es-ghost", wrong: 10, right: 1000 },
  { type: "expLogExplore", ghost: "ele-ghost", wrong: 3, right: 2 },
  { type: "vectorExplore", ghost: "ve-ghost", wrong: { vx: 1, vy: 1 }, right: { vx: 4, vy: -3 } },
  { type: "riemannSum", ghost: "rs-ghost", wrong: { n: 2, rule: "left" }, right: { n: 4, rule: "mid" } },
  { type: "oddEvenPairs", ghost: "oep-ghost", wrong: { paired: 3, choice: "even" }, right: { paired: 3, choice: "odd" } },
  { type: "slider", ghost: "sl-ghost", wrong: 1, right: 3 }
];

describe.each(CASES3)("$type reveal ghost (tranche 3)", ({ type, ghost, wrong, right }) => {
  const s = specOf(type);
  const renderWith = (value: unknown, tone: "info" | "neutral") =>
    render(<WidgetRenderer spec={s} value={value} onChange={() => {}} disabled tone={tone} />);

  it("appears on reveal when the learner's state is wrong", () => {
    renderWith(wrong, "info");
    expect(screen.getAllByTestId(ghost).length).toBeGreaterThan(0);
  });

  it("is absent on reveal when the learner already has the correct state", () => {
    renderWith(right, "info");
    expect(screen.queryAllByTestId(ghost)).toEqual([]);
  });

  it("never renders outside the revealed phase", () => {
    renderWith(wrong, "neutral");
    expect(screen.queryAllByTestId(ghost)).toEqual([]);
  });

  it("is aria-hidden decoration", () => {
    renderWith(wrong, "info");
    for (const el of screen.getAllByTestId(ghost)) {
      expect(el.getAttribute("aria-hidden")).toBe("true");
    }
  });
});

/**
 * TRANCHE 4 (Session 105): the final 20 — the programme reaches 90/90 err=3.
 * These ghosts are self-contained evaluate-mirror IIFEs reading only the
 * value/spec props, rendered through the shared GhostChip; the three
 * computed right-cases below (tapDiagram, transformExplore, sliceSum) were
 * derived by executing the source's own transformPoint/sliceEstimate.
 */
const CASES4: Array<{ type: string; ghost: string; wrong: unknown; right: unknown }> = [
  { type: "placeCompare", ghost: "pc-ghost", wrong: "lt", right: "gt" },
  { type: "ratioTable", ghost: "rt-ghost", wrong: 5, right: 8 },
  { type: "tapDiagram", ghost: "tap-ghost", wrong: ["h1"], right: ["h1", "h3"] },
  { type: "baseTenCompose", ghost: "btc-ghost", wrong: { tens: 1, ones: 4 }, right: { tens: 2, ones: 4 } },
  { type: "integerChips", ghost: "ic-ghost", wrong: { pos: 5, neg: 2 }, right: { pos: 2, neg: 5 } },
  { type: "algebraTiles", ghost: "at-ghost", wrong: { x: 1, c: 0 }, right: { x: 2, c: 0 } },
  { type: "areaModel", ghost: "arm-ghost", wrong: { w: 3, h: 5 }, right: { w: 4, h: 6 } },
  { type: "barBuilder", ghost: "bb-ghost", wrong: [15, 25, 5], right: [15, 25, 10] },
  { type: "volumeBuilder", ghost: "vb-ghost", wrong: { l: 2, w: 3, h: 3 }, right: { l: 2, w: 3, h: 4 } },
  { type: "netFold", ghost: "nf-ghost", wrong: { l: 2, w: 3, h: 3 }, right: { l: 2, w: 3, h: 4 } },
  { type: "treeDiagram", ghost: "tre-ghost", wrong: { a: 2, b: 4 }, right: { a: 3, b: 4 } },
  { type: "transformExplore", ghost: "te-ghost", wrong: { dx: 0, dy: 0, reflect: "none" }, right: { dx: 0, dy: 2, reflect: "y" } },
  { type: "graphZoom", ghost: "gz-ghost", wrong: { zoom: 3, verdict: "no-limit" }, right: { zoom: 3, verdict: "limit-exists" } },
  { type: "matrixTransform", ghost: "mt-ghost", wrong: { a: 1, b: 0, c: 0, d: 1 }, right: { a: 0, b: -1, c: 1, d: 0 } },
  { type: "compassConstruct", ghost: "cmp-ghost", wrong: 3, right: 5 },
  { type: "sliceSum", ghost: "slc-ghost", wrong: { n: 2, rule: "left" }, right: { n: 6, rule: "left" } },
  { type: "sampleSim", ghost: "sam-ghost", wrong: { size: 50, draws: 20 }, right: { size: 100, draws: 20 } },
  { type: "ciCapture", ghost: "ci-ghost", wrong: { level: 80, drawn: 20 }, right: { level: 95, drawn: 20 } },
  { type: "shuffleTest", ghost: "sh-ghost", wrong: { shuffles: 20, verdict: "chance" }, right: { shuffles: 20, verdict: "real" } },
  { type: "inversePipeline", ghost: "ip-ghost", wrong: ["t-div3", "t-sub4", "t-mul2"], right: ["t-mul2", "t-sub4", "t-div3"] }
];

describe.each(CASES4)("$type reveal ghost (tranche 4)", ({ type, ghost, wrong, right }) => {
  const s = specOf(type);
  const renderWith = (value: unknown, tone: "info" | "neutral") =>
    render(<WidgetRenderer spec={s} value={value} onChange={() => {}} disabled tone={tone} />);

  it("appears on reveal when the learner's state is wrong", () => {
    renderWith(wrong, "info");
    expect(screen.getAllByTestId(ghost).length).toBeGreaterThan(0);
  });

  it("is absent on reveal when the learner already has the correct state", () => {
    renderWith(right, "info");
    expect(screen.queryAllByTestId(ghost)).toEqual([]);
  });

  it("never renders outside the revealed phase", () => {
    renderWith(wrong, "neutral");
    expect(screen.queryAllByTestId(ghost)).toEqual([]);
  });

  it("is aria-hidden decoration", () => {
    renderWith(wrong, "info");
    for (const el of screen.getAllByTestId(ghost)) {
      expect(el.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
