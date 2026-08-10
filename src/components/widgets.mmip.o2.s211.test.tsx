// @vitest-environment jsdom
//
// S211 — the crossing becomes a derivation, and the first systems surface reads from a canonical
// pair. INDEPENDENCE: the old float intersection is written out longhand HERE and compared against
// the derived one over every authored spec; the three verdicts are classified HERE by comparing
// slopes, never by reading the module's `relation.kind`.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { AffineRelationshipLabSpec, SystemsExploreSpec, type TWidget } from "@/lib/schema";
import { answerLeakCheck, keyboardParityCheck } from "@/lib/mmip/mmipHarness";
import { rat, ratFromNumber, ratToNumber } from "@/lib/mmip/lineFamilyModel";
import { deriveRelation, linePairCanonicalModel, makeLinePairCanonical } from "@/lib/mmip/linePairModel";

afterEach(cleanup);

const exact = (v: number) => (Number.isInteger(v) ? rat(v) : ratFromNumber(v));
const pairOf = (ma: number, ba: number, mb: number, bb: number) =>
  makeLinePairCanonical({ a: { m: exact(ma), b: exact(ba) }, b: { m: exact(mb), b: exact(bb) } });

/**
 * The arithmetic each widget used to do, written out here as the independent route. THE TWO ARE
 * NOT THE SAME, which is the point: `systemsExplore` divided in raw doubles, while the affine lab
 * went through `affineIntersection`, which rounds every result to 1e-12 (`affineClean`). On
 * `systems-equations/se-03-03` — rates −4/3 and −3/2 — the raw route lands on
 * x = 2.9999999999999987 and the cleaned route on exactly 3. Comparing the derived crossing
 * against the WRONG predecessor manufactures a disagreement that never existed on screen, so each
 * widget is checked against its own.
 */
const rawIntersection = (m1: number, b1: number, m2: number, b2: number) =>
  m1 === m2 ? null : { x: (b2 - b1) / (m1 - m2), y: m1 * ((b2 - b1) / (m1 - m2)) + b1 };
/** `affineClean`, transcribed: |v| < 1e-12 collapses to 0, everything else rounds to 1e-12. */
const affineClean = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Math.round(v * 1e12) / 1e12);
const cleanedIntersection = (m1: number, b1: number, m2: number, b2: number) => {
  const raw = rawIntersection(m1, b1, m2, b2);
  return raw === null ? null : { x: affineClean(raw.x), y: affineClean(m1 * affineClean(raw.x) + b1) };
};

/* ── every authored spec, read off disk ───────────────────────────── */

const authored = (() => {
  const root = join(process.cwd(), "content", "courses");
  const affine: { file: string; lines: { m: number; b: number }[] }[] = [];
  const systems: { file: string; m1: number; b1: number; m2: number; b2: number }[] = [];
  for (const course of readdirSync(root)) {
    const dir = join(root, course, "lessons");
    let files: string[];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of files.filter((n) => n.endsWith(".json"))) {
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as { steps?: { widget?: Record<string, unknown> }[] };
      for (const step of lesson.steps ?? []) {
        const w = step.widget;
        if (w?.type === "affineRelationshipLab") affine.push({ file: `${course}/${f}`, lines: w.lines as { m: number; b: number }[] });
        if (w?.type === "systemsExplore") {
          systems.push({ file: `${course}/${f}`, m1: w.m1 as number, b1: w.b1 as number, m2: w.m2 as number, b2: w.b2 as number });
        }
      }
    }
  }
  return { affine, systems };
})();

describe("the derived crossing agrees with the arithmetic it replaced", () => {
  it("matches the old float intersection EXACTLY on every authored spec", () => {
    expect(authored.affine.length).toBeGreaterThan(0);
    expect(authored.systems.length).toBeGreaterThan(0);
    const disagreements: unknown[] = [];
    let compared = 0;
    const check = (
      file: string,
      predecessor: typeof rawIntersection,
      m1: number, b1: number, m2: number, b2: number
    ) => {
      const before = predecessor(m1, b1, m2, b2);
      const relation = deriveRelation(pairOf(m1, b1, m2, b2));
      const after = relation.kind === "unique"
        ? { x: ratToNumber(relation.at.x), y: ratToNumber(relation.at.y) }
        : null;
      compared += 1;
      const agree = before === null ? after === null : after !== null && before.x === after.x && before.y === after.y;
      if (!agree) disagreements.push({ file, m1, b1, m2, b2, before, after, kind: relation.kind });
    };
    for (const a of authored.affine) {
      // `affineIntersection` used lines[0] and lines[1] and returned null below two lines.
      if (!a.lines || a.lines.length < 2) continue;
      check(a.file, cleanedIntersection, a.lines[0]!.m, a.lines[0]!.b, a.lines[1]!.m, a.lines[1]!.b);
    }
    for (const s of authored.systems) check(s.file, rawIntersection, s.m1, s.b1, s.m2, s.b2);
    expect(disagreements).toEqual([]);
    expect(compared).toBeGreaterThanOrEqual(40);
  });

  it("pins the one place the two predecessors differ", () => {
    // se-03-03's rates are −4/3 and −3/2. Raw doubles miss by 1.3e-15; `affineClean` lands on 3;
    // the derived crossing is exactly 3. The affine lab always showed the cleaned value, so its
    // plot is unchanged — but a future reader comparing against the raw route would see a ghost.
    const raw = rawIntersection(-4 / 3, 6, -1.5, 6.5)!;
    expect(raw.x).not.toBe(3);
    expect(Math.abs(raw.x - 3)).toBeLessThan(1e-14);
    expect(cleanedIntersection(-4 / 3, 6, -1.5, 6.5)).toEqual({ x: 3, y: 2 });
    const relation = deriveRelation(pairOf(-4 / 3, 6, -1.5, 6.5));
    expect(relation.kind === "unique" && relation.text).toBe("(3, 2)");
  });

  it("puts the crossing inside the affine lab's plotted window", () => {
    // The derived intersection feeds the plot's auto-scaled extent, so this is where the wiring is
    // observable in the DOM. Two checks, both computed here from the rendered endpoints alone:
    // the relations are drawn as DIFFERENT segments, and those segments actually cross inside the
    // viewBox — which is only true if the window stretched to contain the crossing.
    render(<WidgetRenderer spec={AFFINE_PAIR} value={{}} onChange={() => {}} disabled={false} />);
    const drawn = Array.from(document.querySelectorAll("svg line"))
      .filter((el) => el.getAttribute("stroke-width") === "3")
      .map((el) => ["x1", "y1", "x2", "y2"].map((a) => Number(el.getAttribute(a))));
    expect(drawn).toHaveLength(2);
    const [A, B] = drawn as [number[], number[]];
    expect(A).not.toEqual(B); // two relations, not one drawn twice
    // Segment crossing, solved here: both share an x-range, so equal y at some t in [0, 1].
    const denom = (A[1]! - A[3]!) - (B[1]! - B[3]!);
    expect(denom).not.toBe(0);
    // A1 + t(A3 − A1) = B1 + t(B3 − B1)  ⇒  t = (A1 − B1) / [(B3 − B1) − (A3 − A1)].
    const t = (A[1]! - B[1]!) / denom;
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(1);
    const crossY = A[1]! + t * (A[3]! - A[1]!);
    expect(crossY).toBeGreaterThanOrEqual(0);
    expect(crossY).toBeLessThanOrEqual(230); // the lab's viewBox height
  });
});

/**
 * Two relations crossing at (10, 10): x = 0.9x + 1 ⇒ 0.1x = 1 ⇒ x = 10, y = 10.
 *
 * The crossing is deliberately the plot's EXTREME point — the sampled inputs only reach x = 3, so
 * the window stretches to x ≈ 10.8 only because the derived intersection is in the extent. That is
 * what makes this fixture sensitive to the wiring: build the pair from the wrong lines and the
 * window collapses to x ≈ 4.3, where these two relations never meet.
 */
const AFFINE_PAIR = AffineRelationshipLabSpec.parse({
  type: "affineRelationshipLab",
  task: "compareRate",
  answerMode: "choice",
  prompt: "Which plan charges more per hour?",
  lines: [
    { id: "a", label: "Plan A", m: 1, b: 0, sourceKind: "equation", sourceText: "y = x" },
    { id: "b", label: "Plan B", m: 0.9, b: 1, sourceKind: "equation", sourceText: "y = 0.9x + 1" },
  ],
  rateGoal: "greater",
  choices: [
    { id: "a", label: "Plan A", claim: "rate:greater:a", feedback: "Plan A climbs 1 per hour against Plan B's 0.9." },
    { id: "b", label: "Plan B", claim: "rate:greater:b", feedback: "Plan B starts higher but climbs more slowly." },
  ],
  requiredExplorations: 1,
  successFeedback: "Plan A's rate of 1 per hour is the greater one.",
  explorationFeedback: "Open a stage to compare the two rates.",
  fallbackFeedback: "Compare how much each plan adds for one more hour.",
}) as TWidget;

/* ── the first systems surface ────────────────────────────────────── */

const sys = (over: Partial<{ m1: number; b1: number; m2: number; b2: number }>) =>
  SystemsExploreSpec.parse({
    type: "systemsExplore",
    prompt: "Drag the point to the solution.",
    m1: 1, b1: 1, m2: -1, b2: 5,
    xMin: 0, xMax: 6, yMin: 0, yMax: 7, xStart: 0, yStart: 0,
    successFeedback: "That point satisfies both relationships at once.",
    offLine1Feedback: "Not on the first line yet — check its rate.",
    offLine2Feedback: "Not on the second line yet — check its rate.",
    ...over,
  }) as TWidget;

function mount(spec: TWidget, opts: { tone?: "info" } = {}) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer spec={spec} value={value} disabled={false} tone={opts.tone}
        onChange={(v) => { holder.v = v; setValue(v); }} />
    );
  }
  return { holder, ...render(<Host />) };
}

describe("systemsExplore names all three verdicts", () => {
  it("says nothing new when the lines cross — every authored spec is this case", () => {
    const { container } = mount(sys({}));
    expect(screen.queryByTestId("se-relation")).toBeNull();
    // Independently: rates 1 and −1 differ, so there is a unique crossing.
    expect(rawIntersection(1, 1, -1, 5)).toEqual({ x: 2, y: 3 });
    const leak = answerLeakCheck(container, ["(2, 3)"]);
    expect(leak.leaked).toEqual([]);
  });

  it("names the parallel case and the constant gap that keeps them apart", () => {
    mount(sys({ m1: 2, b1: 1, m2: 2, b2: 5 }));
    const said = screen.getByTestId("se-relation").textContent ?? "";
    expect(said).toContain("parallel");
    expect(said).toContain("gap of 4"); // 5 − 1, by hand
    expect(said).toContain("No pair of numbers satisfies both");
    // Independently: equal rates, different starts ⇒ the old route produced null and said nothing.
    expect(rawIntersection(2, 1, 2, 5)).toBeNull();
  });

  it("names the coincident case as one line written twice", () => {
    mount(sys({ m1: 2, b1: 3, m2: 2, b2: 3 }));
    const said = screen.getByTestId("se-relation").textContent ?? "";
    expect(said).toContain("same line written twice");
    expect(said).toContain("every point on it satisfies both");
    expect(rawIntersection(2, 3, 2, 3)).toBeNull(); // the old route could not tell these apart
  });

  it("keeps the ghost, the keyboard path and the drag redundancy", () => {
    const { container } = mount(sys({}), { tone: "info" });
    expect(screen.getByTestId("se-ghost")).toBeTruthy();
    cleanup();
    const live = mount(sys({}));
    fireEvent.change(screen.getByRole("slider", { name: "point x" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "3" } });
    expect(live.holder.v).toEqual({ x: 2, y: 3 });
    const parity = keyboardParityCheck(live.container, { pointerSelectors: { sliders: 'input[type="range"]' } });
    expect(parity.failures).toEqual([]);
    expect(screen.getByTestId("se-drag").getAttribute("aria-hidden")).toBe("true");
  });

  it("draws no ghost where there is no crossing to point at", () => {
    mount(sys({ m1: 2, b1: 1, m2: 2, b2: 5 }), { tone: "info" });
    expect(screen.queryByTestId("se-ghost")).toBeNull();
  });
});

/* ── breakability, at the level that exists ───────────────────────── */

describe("the relation is breakable and repairable on the canonical pair", () => {
  // MODEL LEVEL, deliberately: no shipped widget has controls that edit a line, so there is no
  // surface to drive this from yet. The round trip is the behaviour a breakable systems lab will
  // need, proved on the object that will back it.
  it("walks unique → parallel → coincident → unique, each verdict hand-derived", () => {
    const g = linePairCanonicalModel(pairOf(3, 2, 1, 6)).createGraph();
    // 3x + 2 = x + 6 ⇒ 2x = 4 ⇒ x = 2, y = 8.
    expect(g.view("relation").kind).toBe("unique");
    expect(g.view("solutionSet").point && ratToNumber(g.view("solutionSet").point!.x)).toBe(2);

    g.apply("lineB", { kind: "setSlope", m: rat(3) }); // equal rates, starts 2 and 6 ⇒ parallel
    expect(g.view("relation").kind).toBe("parallel");
    expect(g.view("solutionSet").count).toBe("none");

    g.apply("lineB", { kind: "setIntercept", b: rat(2) }); // equal starts too ⇒ coincident
    expect(g.view("relation").kind).toBe("coincident");
    expect(g.view("solutionSet").count).toBe("infinitely many");

    g.apply("lineB", { kind: "setSlope", m: rat(1) }); // rates differ again ⇒ unique, at 2x = 0
    expect(g.view("relation").kind).toBe("unique");
    expect(g.view("solutionSet").text).toBe("(0, 2)");

    // Graph-owned undo walks the whole journey backwards, verdict by verdict.
    for (const expected of ["coincident", "parallel", "unique"]) {
      g.undo();
      expect(g.view("relation").kind).toBe(expected);
    }
    expect(g.canUndo()).toBe(false);
  });

  it("names each break as an operation a motion layer can stage", () => {
    const model = linePairCanonicalModel(pairOf(3, 2, 1, 6));
    const tx = model.apply(model.initial, { kind: "line", line: "b", edit: { kind: "setSlope", m: rat(3) } }, "symbolic", "lineB");
    expect(tx.changed).toBe(true);
    // 1 → 3 is a tripling, which the single-line model already calls a BRANCH.
    expect(tx.ops).toHaveLength(1);
    expect(tx.ops[0]).toMatchObject({ kind: "distribute", target: "b:slope", sides: ["line-b"] });
  });
});
