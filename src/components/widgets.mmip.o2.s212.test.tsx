// @vitest-environment jsdom
//
// S212 phase 2 — systemsExplore becomes breakable.
//
// INDEPENDENCE: every crossing, gap and verdict below is solved by hand in the comment beside it
// and the classification is decided here by comparing the two rates. Nothing is read back out of
// `linePairModel`. The tests assert the WIDGET's behaviour — what is displayed, what is persisted,
// what a keyboard reaches; grading for edited lines is `evaluate.ts`'s and lands in parallel (see
// the seam note at the foot of this file).

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { SystemsExploreSpec, type TWidget } from "@/lib/schema";
import { answerLeakCheck, keyboardParityCheck, reducedMotionCheck } from "@/lib/mmip/mmipHarness";
import { describeWidgetState } from "@/lib/describeState";
import { evaluate } from "@/lib/evaluate";

afterEach(cleanup);

const OPEN = {
  slopeMin: -4, slopeMax: 4, slopeStep: 1,
  interceptMin: -5, interceptMax: 5, interceptStep: 1,
  outOfRange: "clamp", offLattice: "snap",
} as const;

/** y = x + 1 and y = −x + 5 cross where x + 1 = −x + 5 ⇒ 2x = 4 ⇒ x = 2, y = 3. */
const base = {
  type: "systemsExplore",
  prompt: "Drag the point to the solution.",
  m1: 1, b1: 1, m2: -1, b2: 5,
  xMin: 0, xMax: 6, yMin: 0, yMax: 7, xStart: 0, yStart: 0,
  successFeedback: "That point satisfies both relationships at once.",
  offLine1Feedback: "Not on the first line yet.",
  offLine2Feedback: "Not on the second line yet.",
};
const CLASSIC = SystemsExploreSpec.parse(base) as TWidget;
const DEGEN = "Both lines now climb at the same rate, so there is no single crossing left to find.";
const EDITABLE = SystemsExploreSpec.parse({ ...base, editLine1: OPEN, editLine2: OPEN, degenerateSystemFeedback: DEGEN }) as TWidget;
const HALF_OPEN = SystemsExploreSpec.parse({ ...base, editLine2: OPEN, degenerateSystemFeedback: DEGEN }) as TWidget;

function mount(spec: TWidget, opts: { tone?: "info"; disabled?: boolean } = {}) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer spec={spec} value={value} disabled={opts.disabled ?? false} tone={opts.tone}
        onChange={(v) => { holder.v = v; setValue(v); }} />
    );
  }
  return { holder, ...render(<Host />) };
}

const verdict = () => screen.queryByTestId("se-relation")?.textContent ?? "";
const readParam = (id: string) => screen.getByTestId(id).textContent;
const press = (name: RegExp, times = 1) => {
  for (let i = 0; i < times; i += 1) fireEvent.click(screen.getByRole("button", { name }));
};
const setParam = (name: RegExp, v: number) =>
  fireEvent.change(screen.getByRole("slider", { name }), { target: { value: String(v) } });

/* ══════════════════════════════════════════════════════════════════ */

describe("a classic spec is untouched", () => {
  it("shows no line controls, no verdict, no status region and no undo", () => {
    const { container } = mount(CLASSIC);
    for (const id of ["se-a-slope", "se-a-intercept", "se-b-slope", "se-b-intercept", "se-status", "se-undo", "se-relation", "se-grip-a-slope", "se-grip-a-intercept", "se-grip-b-slope", "se-grip-b-intercept", "se-eq-a", "se-eq-b"]) {
      expect([id, screen.queryByTestId(id)]).toEqual([id, null]);
    }
    // Exactly the two point sliders it always had.
    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(2);
    expect(screen.getByRole("slider", { name: "point x" })).toBeTruthy();
  });

  it("persists exactly { x, y } — a classic spec can never write the envelope", () => {
    const { holder } = mount(CLASSIC);
    expect(holder.v).toEqual({ x: 0, y: 0 });
    setParam(/point x/, 2);
    setParam(/point y/, 3);
    expect(holder.v).toEqual({ x: 2, y: 3 });
    expect("lines" in (holder.v as object)).toBe(false);
  });

  it("still marks the crossing and the two on-line checks", () => {
    mount(CLASSIC);
    setParam(/point x/, 2);
    setParam(/point y/, 3); // (2, 3) is on both, by hand
    const readout = screen.getByText(/^\(2, 3\)/).textContent ?? "";
    expect(readout).toContain("✓ line 1");
    expect(readout).toContain("✓ line 2");
  });

  it("leaves every CLASSIC authored spec rendering exactly as it always did", () => {
    /**
     * S213. This assertion used to read "none opts in" — true when written, false the moment the
     * capability got its first authored user, and so a pin on a fact rather than on an invariant.
     * The invariant is what it checks now: a spec WITHOUT the edit fields renders with no line
     * controls, no verdict, no status region and no Undo. The opt-ins are listed by name, so the
     * next one is a deliberate edit to this list and not a mystery failure.
     */
    const OPTED_IN = ["se-01-03.json"];
    const root = join(process.cwd(), "content", "courses");
    const found: string[] = [];
    const optedIn: string[] = [];
    for (const course of readdirSync(root)) {
      const dir = join(root, course, "lessons");
      let files: string[];
      try { files = readdirSync(dir); } catch { continue; }
      for (const f of files.filter((n) => n.endsWith(".json"))) {
        const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as { steps?: { widget?: Record<string, unknown> }[] };
        for (const step of lesson.steps ?? []) {
          if (step.widget?.type !== "systemsExplore") continue;
          found.push(f);
          const opts = "editLine1" in step.widget || "editLine2" in step.widget;
          if (opts) {
            optedIn.push(f);
            // An opted-in spec must carry the string the gate requires — checked on real content.
            expect([f, typeof step.widget.degenerateSystemFeedback]).toEqual([f, "string"]);
            continue;
          }
          // A classic spec renders with none of the editable surface, and only its two point sliders.
          cleanup();
          const { container } = mount(SystemsExploreSpec.parse(step.widget) as TWidget);
          for (const id of ["se-a-slope", "se-a-intercept", "se-b-slope", "se-b-intercept", "se-status", "se-undo", "se-relation", "se-grip-a-slope", "se-grip-a-intercept", "se-grip-b-slope", "se-grip-b-intercept", "se-eq-a", "se-eq-b"]) {
            expect([f, id, screen.queryByTestId(id)]).toEqual([f, id, null]);
          }
          expect([f, container.querySelectorAll('input[type="range"]').length]).toEqual([f, 2]);
          /* S217 pin-scope widening (O2's own S216 seal disclosure): the "classic byte-identical"
           * guarantee had checked testids and control counts but NOT the SVG accessible name — the
           * S215 label change altered classic specs' names and no pin caught it. The name is now
           * part of the guarantee: it must state both authored equations (the S215 improvement,
           * QA-accepted) and nothing else may change it without a deliberate edit here. Derived
           * INDEPENDENTLY from the authored spec's own numbers, not from any model helper. */
          const img = container.querySelector('svg[role="img"], [role="img"]');
          expect([f, img === null]).toEqual([f, false]);
          const svgName = img?.getAttribute("aria-label") ?? "";
          // Transcription of the S215 reading rule: unicode minus; bare x at rate ±1; the x-term
          // dropped entirely at rate 0 (a flat line reads "y = b"); the constant dropped at 0.
          const eq = (m: number, b: number) =>
            m === 0
              ? `y = ${b < 0 ? `\u2212${Math.abs(b)}` : b}`
              : `y = ${m === 1 ? "" : m === -1 ? "\u2212" : m < 0 ? `\u2212${Math.abs(m)}` : m}x${b === 0 ? "" : b < 0 ? ` \u2212 ${Math.abs(b)}` : ` + ${b}`}`;
          const w = SystemsExploreSpec.parse(step.widget);
          for (const [m, b] of [[w.m1, w.b1], [w.m2, w.b2]] as [number, number][]) {
            /* Delimiter-anchored, not inclusion (S217 QA REQUIRED_FIX 1): "y = x + 0".includes("y = x")
             * would pass, silently missing exactly the dropped-term regression class this pin was
             * built after. The equation must be followed by a non-term character or the string end. */
            const esc = eq(m, b).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const anchored = new RegExp(`${esc}(?=[.,;)]|$|\\s[\u2014\u2013]|\\. )`);
            expect([f, anchored.test(svgName), eq(m, b), svgName]).toEqual([f, true, eq(m, b), svgName]);
          }
        }
      }
    }
    expect(found.length).toBe(6);
    expect([...new Set(optedIn)]).toEqual(OPTED_IN);
    expect(found.length - optedIn.length).toBe(5);
  });
});

describe("breaking and repairing the solution", () => {
  it("walks unique → parallel → coincident → unique by learner action", () => {
    const { holder } = mount(EDITABLE);
    expect(verdict()).toBe(""); // rates 1 and −1 differ ⇒ one crossing

    // Give line 2 line 1's rate. Rates equal, starts 1 and 5 ⇒ parallel, constant gap 5 − 1 = 4.
    setParam(/Set line 2 slope/, 1);
    expect(readParam("se-b-slope")).toBe("1");
    expect(verdict()).toContain("parallel");
    expect(verdict()).toContain("gap of 4");
    expect(verdict()).toContain("No pair of numbers satisfies both");

    // Match the start too ⇒ one line written twice.
    setParam(/Set line 2 y-intercept/, 1);
    expect(verdict()).toContain("same line written twice");
    expect(verdict()).toContain("every point on it satisfies both");

    // Change the rate back ⇒ a single solution returns. x + 1 = −1x + 1 ⇒ 2x = 0 ⇒ (0, 1).
    setParam(/Set line 2 slope/, -1);
    expect(verdict()).toBe("");
    expect(holder.v).toEqual({ x: 0, y: 0, lines: { m1: 1, b1: 1, m2: -1, b2: 1 } });
  });

  it("writes the envelope only once a line has actually moved", () => {
    const { holder } = mount(EDITABLE);
    expect(holder.v).toEqual({ x: 0, y: 0 });
    setParam(/point x/, 1); // a POINT move is not a line move
    expect(holder.v).toEqual({ x: 1, y: 0 });
    press(/Increase line 1 y-intercept/); // now a line has moved
    expect(holder.v).toEqual({ x: 1, y: 0, lines: { m1: 1, b1: 2, m2: -1, b2: 5 } });
  });

  it("keeps the moved lines when the point moves afterwards", () => {
    // Order matters: a point move must carry the line envelope forward, or dragging the answer
    // would silently snap the problem back to its authored state.
    const { holder } = mount(EDITABLE);
    press(/Increase line 1 y-intercept/, 2); // line 1 y-intercept 1 → 3
    expect(holder.v).toEqual({ x: 0, y: 0, lines: { m1: 1, b1: 3, m2: -1, b2: 5 } });
    setParam(/point x/, 4);
    expect(holder.v).toEqual({ x: 4, y: 0, lines: { m1: 1, b1: 3, m2: -1, b2: 5 } });
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "2" } });
    expect(holder.v).toEqual({ x: 4, y: 2, lines: { m1: 1, b1: 3, m2: -1, b2: 5 } });
    // …and the on-line marks read against the MOVED line: 4 + 3 = 7, not 2.
    expect(screen.getByText(/^\(4, 2\)/).textContent ?? "").toContain("○ line 1");
  });

  it("hides the ghost when there is no crossing to point at", () => {
    mount(EDITABLE, { tone: "info" });
    expect(screen.getByTestId("se-ghost")).toBeTruthy();
    setParam(/Set line 2 slope/, 1);
    expect(screen.queryByTestId("se-ghost")).toBeNull();
  });

  it("moves the crossing the ghost points at when a line moves", () => {
    mount(EDITABLE, { tone: "info" });
    // Line 2 start 5 → 3: x + 1 = −x + 3 ⇒ 2x = 2 ⇒ (1, 2), by hand.
    setParam(/Set line 2 y-intercept/, 3);
    const ghost = screen.getByTestId("se-ghost").querySelector("circle") as SVGCircleElement;
    // Grid 0..6 across 300px with pad 14: x = 1 maps to 14 + (1/6)(272).
    expect(Number(ghost.getAttribute("cx"))).toBeCloseTo(14 + (1 / 6) * 272, 6);
  });

  it("keeps a half-open spec half-open", () => {
    mount(HALF_OPEN);
    expect(screen.queryByTestId("se-a-slope")).toBeNull();
    expect(screen.getByTestId("se-b-slope")).toBeTruthy();
    expect(screen.queryByRole("slider", { name: /Set line 1 slope/ })).toBeNull();
  });
});

describe("policy, undo and motion", () => {
  it("stops at the end of the authored range", () => {
    const { holder } = mount(EDITABLE);
    setParam(/Set line 1 slope/, 4); // slopeMax
    expect((screen.getByRole("button", { name: /Increase line 1 slope/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((holder.v as { lines: { m1: number } }).lines.m1).toBe(4);
  });

  it("treats one stepper run as one step back, and keys runs by line AND parameter", () => {
    const { holder } = mount(EDITABLE);
    press(/Increase line 1 y-intercept/, 3); // one run on line 1's start
    expect(readParam("se-a-intercept")).toBe("4");
    // A DIFFERENT run — must not merge with the first. Line 2's start opens at its authored
    // maximum of 5, so the reachable direction is down: 5 → 4 → 3.
    press(/Decrease line 2 y-intercept/, 2);
    expect(readParam("se-b-intercept")).toBe("3");
    fireEvent.click(screen.getByTestId("se-undo"));
    expect((holder.v as { lines: { b1: number; b2: number } }).lines).toMatchObject({ b1: 4, b2: 5 });
    // …the whole second run folded into ONE step, landing where it began rather than mid-run.
    fireEvent.click(screen.getByTestId("se-undo"));
    expect(holder.v).toEqual({ x: 0, y: 0 }); // back to the authored lines: envelope gone
    expect(screen.queryByTestId("se-undo")).toBeNull();
  });

  it("keeps point moves out of the pair's undo stack", () => {
    mount(EDITABLE);
    setParam(/point x/, 3);
    expect(screen.queryByTestId("se-undo")).toBeNull(); // the point is the answer, not the problem
    press(/Increase line 1 y-intercept/);
    expect(screen.getByTestId("se-undo")).toBeTruthy();
  });

  it("animates the line that moved, by the operation's own verb", () => {
    const { container } = mount(EDITABLE);
    setParam(/Set line 1 y-intercept/, 3); // 1 → 3 is an increase, which mmipTypes §3 calls a JOIN
    const moved = container.querySelector('[data-morph-actor="a:slope:line-a a:intercept:line-a"]') as Element;
    expect(moved.getAttribute("data-morph-motion")).toBe("join");
    const still = container.querySelector('[data-morph-actor="b:slope:line-b b:intercept:line-b"]') as Element;
    expect(still.getAttribute("data-morph-motion")).toBeNull();
  });

  it("keeps the change legible with motion suppressed", () => {
    reducedMotionCheck({
      render: () => {
        const { container } = mount(EDITABLE);
        setParam(/Set line 1 y-intercept/, 4);
        return container;
      },
      assertMeaningful: (container) => {
        expect(container.querySelectorAll("[data-morph-motion]")).toHaveLength(0);
        const said = (container.querySelector('[data-testid="se-status"]') as Element).textContent ?? "";
        expect(said).toContain("line 1");
        expect(said).toContain("1 to 4"); // the start moved from 1 to 4
      },
    });
  });
});

describe("keyboard, screen reader and leaks", () => {
  it("gives every control a keyboard path", () => {
    const { container } = mount(EDITABLE);
    press(/Increase line 1 y-intercept/);
    const parity = keyboardParityCheck(container, {
      pointerSelectors: { ranges: 'input[type="range"]', buttons: "button" },
    });
    expect(parity.failures).toEqual([]);
    expect(screen.getByTestId("se-drag").getAttribute("aria-hidden")).toBe("true");
  });

  it("reaches the same state by keyboard as by stepper", () => {
    const bySlider = mount(EDITABLE);
    setParam(/Set line 2 y-intercept/, 2);
    const viaSlider = bySlider.holder.v;
    cleanup();
    const byStepper = mount(EDITABLE);
    press(/Decrease line 2 y-intercept/, 3); // 5 → 2
    expect(byStepper.holder.v).toEqual(viaSlider);
  });

  it("labels every line control for a screen reader", () => {
    mount(EDITABLE);
    const group = screen.getByRole("group", { name: "Move the lines" });
    for (const name of ["line 1 slope (the rate)", "line 1 y-intercept (the start)", "line 2 slope (the rate)", "line 2 y-intercept (the start)"]) {
      expect(within(group).getByRole("slider", { name: `Set ${name}` })).toBeTruthy();
      expect(within(group).getByRole("button", { name: `Increase ${name}` })).toBeTruthy();
    }
  });

  it("never prints the crossing before it is revealed", () => {
    const { container } = mount(EDITABLE);
    // The solution of the authored system is (2, 3); it must not appear anywhere pre-reveal.
    expect(answerLeakCheck(container, ["(2, 3)"]).leaked).toEqual([]);
  });

  it("removes every affordance when the step is finalized", () => {
    mount(EDITABLE, { disabled: true });
    expect(screen.queryByTestId("se-drag")).toBeNull();
    expect(screen.queryByTestId("se-undo")).toBeNull();
    expect((screen.getByRole("slider", { name: /Set line 1 slope/ }) as HTMLInputElement).disabled).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════ */

describe("the grader reads the lines as they now stand (S213 seam, closed)", () => {
  it("marks the OLD crossing wrong once the line has moved off it", () => {
    // The authored system crosses at (2, 3): x + 1 = −x + 5 ⇒ 2x = 4. Move line 2's start from 5
    // to 3 and it crosses at (1, 2) instead — 2 is no longer −1·2 + 3 = 1, so the old answer is
    // simply not a solution of the system the learner is now looking at.
    const { holder } = mount(EDITABLE);
    setParam(/Set line 2 y-intercept/, 3);
    setParam(/point x/, 2);
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "3" } });
    expect(holder.v).toEqual({ x: 2, y: 3, lines: { m1: 1, b1: 1, m2: -1, b2: 3 } });
    // The widget already says so on screen …
    expect(screen.getByText(/^\(2, 3\)/).textContent ?? "").toContain("○ line 2");
    // … and the grader now agrees, rather than marking the authored crossing right.
    expect(evaluate(EDITABLE, holder.v).correct).toBe(false);
    // The new crossing IS right: −1·1 + 3 = 2 and 1 + 1 = 2, by hand.
    setParam(/point x/, 1);
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "2" } });
    expect(evaluate(EDITABLE, holder.v).correct).toBe(true);
  });

  it("marks a destroyed system wrong from every point on it", () => {
    // Make the rates equal: parallel, no solution anywhere. A learner must not be able to be
    // marked right by destroying the question.
    const { holder } = mount(EDITABLE);
    setParam(/Set line 2 slope/, 1);
    expect(verdict()).toContain("parallel");
    for (const [px, py] of [[0, 0], [2, 3], [4, 5]] as const) {
      setParam(/point x/, px);
      fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: String(py) } });
      expect([px, py, evaluate(EDITABLE, holder.v).correct]).toEqual([px, py, false]);
    }
    // And coincident — where a naive `on1 && on2` WOULD hand out success, because every point on
    // the line really is on both. (0, 1) is on y = x + 1 twice over; still not a solution.
    setParam(/Set line 2 y-intercept/, 1);
    expect(verdict()).toContain("same line written twice");
    setParam(/point x/, 0);
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "1" } });
    expect(screen.getByText(/^\(0, 1\)/).textContent ?? "").toContain("✓ line 1");
    expect(screen.getByText(/^\(0, 1\)/).textContent ?? "").toContain("✓ line 2");
    expect(evaluate(EDITABLE, holder.v).correct).toBe(false);
  });

  it("leaves a classic spec graded exactly as before", () => {
    const { holder } = mount(CLASSIC);
    setParam(/point x/, 2);
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "3" } });
    expect(holder.v).toEqual({ x: 2, y: 3 });
    expect(evaluate(CLASSIC, holder.v).correct).toBe(true);
  });
});

/**
 * THE SEAM, now closed above: with editable lines the graded claim "the point
 * satisfies both relationships" must be read against the lines AS THEY NOW STAND, which is
 * `evaluate.ts`'s job and O1's file this session. The widget's own display already does this —
 * `systemsPointOn` reads `value.lines` — and the test above ("walks unique → parallel …") pins
 * that the envelope carrying them is written. When O1's change lands, the integration assertion to
 * add here is: move a line so the old crossing is no longer on it, put the point on the OLD
 * crossing, and assert `evaluate(spec, value).correct === false`.
 */

/* ══════════════════════════════════════════════════════════════════ */

/**
 * S214 — the line itself is the control.
 *
 * The fixture window is x 0..6, y 0..7 on a 300-unit viewBox with pad 14, so the mappings below
 * are written out longhand and every target pointer position is computed from the grip's own x
 * read back out of the DOM, using the two absorb rules by hand:
 *     slide (handle "intercept"): b = y − m·x        tilt (handle "unit"): m = (y − b)/x
 */
const VB = 300, VPAD = 14, X0 = 0, X1 = 6, Y0 = 0, Y1 = 7;
const pxOfX = (x: number) => VPAD + ((x - X0) / (X1 - X0)) * (VB - 2 * VPAD);
const pyOfY = (y: number) => VB - VPAD - ((y - Y0) / (Y1 - Y0)) * (VB - 2 * VPAD);

function pinSvg() {
  const svg = document.querySelector("svg") as SVGSVGElement;
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, x: 0, y: 0, width: VB, height: VB, right: VB, bottom: VB, toJSON: () => ({}) }) as DOMRect;
  return svg;
}
/** The grip's mathematical x, recovered from where it is actually drawn. */
const gripX = (id: string) => {
  const cx = Number(screen.getByTestId(id).getAttribute("cx"));
  return X0 + ((cx - VPAD) / (VB - 2 * VPAD)) * (X1 - X0);
};
/** Drag a grip so the pointer sits at mathematical height `mathY`. */
const dragGrip = (id: string, mathY: number) => {
  const hit = screen.getByTestId(id);
  fireEvent.pointerDown(hit, { clientX: Number(hit.getAttribute("cx")), clientY: pyOfY(mathY) });
  return hit;
};
/** Where the pointer must be to give line `slot` the slope `m`, by the tilt rule. */
const tiltTo = (slot: "a" | "b", b: number, m: number) => b + m * gripX(`se-grip-${slot}-slope`);
/** Where the pointer must be to give line `slot` the intercept `b`, by the slide rule. */
const slideTo = (slot: "a" | "b", m: number, b: number) => b + m * gripX(`se-grip-${slot}-intercept`);

describe("the learner grabs the line", () => {
  it("shows a grip on each editable line, and none on a line that is not editable", () => {
    mount(EDITABLE);
    for (const id of ["se-grip-a-slope", "se-grip-a-intercept", "se-grip-b-slope", "se-grip-b-intercept"]) {
      expect([id, screen.getByTestId(id).getAttribute("aria-hidden")]).toEqual([id, "true"]);
    }
    cleanup();
    mount(HALF_OPEN); // only line 2 is open
    expect(screen.queryByTestId("se-grip-a-slope")).toBeNull();
    expect(screen.getByTestId("se-grip-b-slope")).toBeTruthy();
  });

  it("gives every grip a hit target over the 44px bar at the narrowest render", () => {
    mount(EDITABLE);
    pinSvg();
    // r = 24 viewBox units → 48 across. The viewBox is 300 units; at a 292–320 CSS px stage that
    // is 46.7–51.2 px. Computed here rather than asserted from memory.
    for (const id of ["se-grip-a-slope", "se-grip-a-intercept", "se-grip-b-slope", "se-grip-b-intercept", "se-drag"]) {
      const r = Number(screen.getByTestId(id).getAttribute("r"));
      expect([id, r]).toEqual([id, 24]);
      expect([id, (2 * r * 292) / VB]).toEqual([id, 46.72]);
    }
  });

  it("drags line A to parallel and back to a single crossing", () => {
    const { holder } = mount(EDITABLE);
    pinSvg();
    // Line A is y = x + 1; tilting it to rate −1 matches line B's rate. By the tilt rule the
    // pointer must reach y = b + m·x with b = 1, m = −1.
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1));
    expect((holder.v as { lines: { m1: number } }).lines.m1).toBe(-1);
    expect(verdict()).toContain("parallel");
    expect(verdict()).toContain("gap of 4"); // starts 5 and 1, unchanged by a tilt
    // …and back. The grip has moved with the line, so its x is read again.
    dragGrip("se-grip-a-slope", tiltTo("a", 1, 1));
    expect(verdict()).toBe("");
    expect(holder.v).toEqual({ x: 0, y: 0 });
  });

  it("drags line B to coincident", () => {
    const { holder } = mount(EDITABLE);
    pinSvg();
    dragGrip("se-grip-b-slope", tiltTo("b", 5, 1)); // rate −1 → 1, now parallel with A
    expect(verdict()).toContain("parallel");
    dragGrip("se-grip-b-intercept", slideTo("b", 1, 1)); // start 5 → 1, now the same line as A
    expect(verdict()).toContain("same line written twice");
    expect((holder.v as { lines: { m2: number; b2: number } }).lines).toMatchObject({ m2: 1, b2: 1 });
  });

  it("reaching parallel works by dragging EITHER line", () => {
    const viaA = mount(EDITABLE);
    pinSvg();
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1));
    expect(verdict()).toContain("parallel");
    const a = viaA.holder.v;
    cleanup();
    const viaB = mount(EDITABLE);
    pinSvg();
    dragGrip("se-grip-b-slope", tiltTo("b", 5, 1));
    expect(verdict()).toContain("parallel");
    // Different systems (rates −1 and 1), but both genuinely parallel — and neither is the other.
    expect(viaB.holder.v).not.toEqual(a);
    expect(verdict()).toContain("gap of 4");
  });

  it("a drag and a stepper reach the SAME canonical state and the same views", () => {
    const byDrag = mount(EDITABLE);
    pinSvg();
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1));
    const dragValue = byDrag.holder.v;
    const dragVerdict = verdict();
    const dragEquations = screen.getByRole("img").getAttribute("aria-label");
    cleanup();
    const byStepper = mount(EDITABLE);
    setParam(/Set line 1 slope/, -1);
    expect(byStepper.holder.v).toEqual(dragValue);
    expect(verdict()).toBe(dragVerdict);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(dragEquations);
  });

  it("treats one grab as one step back, however many samples it took", () => {
    const { holder } = mount(EDITABLE);
    pinSvg();
    const hit = dragGrip("se-grip-a-slope", tiltTo("a", 1, 0));
    // The grip rides the line, so its x is re-read on every sample — a steep line leaves the
    // frame and the grip walks back toward the intercept to stay grabbable, which changes how far
    // the pointer must travel per unit of slope.
    for (const m of [-1, -2, -3]) {
      const el = screen.getByTestId("se-grip-a-slope");
      fireEvent.pointerMove(el, { clientX: Number(el.getAttribute("cx")), clientY: pyOfY(tiltTo("a", 1, m)) });
    }
    expect((holder.v as { lines: { m1: number } }).lines.m1).toBe(-3);
    fireEvent.pointerUp(hit, { clientX: 0, clientY: 0 });
    fireEvent.click(screen.getByTestId("se-undo"));
    expect(holder.v).toEqual({ x: 0, y: 0 }); // one step, all the way back to the authored lines
    expect(screen.queryByTestId("se-undo")).toBeNull();
  });

  it("keeps a drag out of the stepper's undo run", () => {
    const { holder } = mount(EDITABLE);
    pinSvg();
    press(/Increase line 1 y-intercept/, 2); // a stepper run on a:intercept
    dragGrip("se-grip-a-slope", tiltTo("a", 3, -1)); // a drag on a:slope — a separate step
    fireEvent.click(screen.getByTestId("se-undo"));
    expect((holder.v as { lines: { m1: number; b1: number } }).lines).toMatchObject({ m1: 1, b1: 3 });
    fireEvent.click(screen.getByTestId("se-undo"));
    expect(holder.v).toEqual({ x: 0, y: 0 });
  });

  it("writes the envelope only when a drag actually moved a line", () => {
    const { holder } = mount(EDITABLE);
    pinSvg();
    // A drag that lands back on the value already held changes nothing, so nothing is persisted.
    dragGrip("se-grip-a-slope", tiltTo("a", 1, 1));
    expect(holder.v).toEqual({ x: 0, y: 0 });
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1));
    expect(holder.v).toEqual({ x: 0, y: 0, lines: { m1: -1, b1: 1, m2: -1, b2: 5 } });
  });

  it("narrates the mathematics of the drag, not its pixels", () => {
    mount(EDITABLE);
    pinSvg();
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1));
    const said = screen.getByTestId("se-status").textContent ?? "";
    expect(said).toContain("1 becomes -1"); // what the rate did
    expect(said).toContain("constant gap of 4"); // where it left the system
    expect(said).not.toMatch(/pixel|y = 2\d\d/); // never positional
  });

  it("keeps the keyboard able to reach every state a drag can", () => {
    // The drag route and the keyboard route are interchangeable, which is the release condition:
    // parallel, coincident and back to unique, all without a pointer.
    const { holder } = mount(EDITABLE);
    setParam(/Set line 2 slope/, 1);
    expect(verdict()).toContain("parallel");
    setParam(/Set line 2 y-intercept/, 1);
    expect(verdict()).toContain("same line written twice");
    setParam(/Set line 2 slope/, -1);
    expect(verdict()).toBe("");
    expect(holder.v).toEqual({ x: 0, y: 0, lines: { m1: 1, b1: 1, m2: -1, b2: 1 } });
    // …and the precision controls are still there, demoted but present.
    expect(screen.getByText(/Or set the lines exactly/)).toBeTruthy();
    expect(screen.getAllByRole("slider")).toHaveLength(6); // 2 point + 4 line parameters
  });

  it("still bounds a drag by the authored range", () => {
    const { holder } = mount(EDITABLE);
    pinSvg();
    // The authored slope range is −4..4 here; ask a drag for −9 and it clamps, and says so.
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -9));
    expect((holder.v as { lines: { m1: number } }).lines.m1).toBe(-4);
    expect(screen.getByTestId("se-status").textContent ?? "").toContain("clamped");
  });
});

/* ══════════════════════════════════════════════════════════════════ */

/**
 * S215 — the equation rides the line.
 *
 * INDEPENDENCE: `readingForm` below is a second transcription of the reading rule (unicode minus,
 * bare `x` at rate ±1, the constant dropped at 0), written from the rule rather than by calling
 * the module. Every label assertion compares the rendered text against it, so a label that quietly
 * stopped tracking the line — or a derivation that changed — fails here.
 */
const readingForm = (m: number, b: number) => {
  const minus = "−";
  const num = (v: number) => (v < 0 ? `${minus}${Math.abs(v)}` : `${v}`);
  if (m === 0) return `y = ${num(b)}`;
  const term = m === 1 ? "x" : m === -1 ? `${minus}x` : `${num(m)}x`;
  if (b === 0) return `y = ${term}`;
  return `y = ${term} ${b < 0 ? minus : "+"} ${Math.abs(b)}`;
};
const labelText = (slot: "a" | "b") => screen.getByTestId(`se-eq-${slot}`).textContent ?? "";
const labelY = (slot: "a" | "b") => Number(screen.getByTestId(`se-eq-${slot}`).getAttribute("y"));
/** The four line parameters the widget currently holds, from the persisted value or the spec. */
const currentLines = (v: unknown) => {
  const stored = (v as { lines?: { m1: number; b1: number; m2: number; b2: number } })?.lines;
  return stored ?? { m1: 1, b1: 1, m2: -1, b2: 5 };
};

describe("each line carries its own live equation", () => {
  it("labels both lines, and names them in words rather than by colour alone", () => {
    mount(EDITABLE);
    expect(labelText("a")).toBe(`line 1: ${readingForm(1, 1)}`);
    expect(labelText("b")).toBe(`line 2: ${readingForm(-1, 5)}`);
  });

  it("keeps every label true of its line across the reachable states", () => {
    const { holder } = mount(EDITABLE);
    // Driven through the real controls; each state's expectation is transcribed here, not read
    // back from the model.
    for (const [m1, b1] of [[1, 1], [0, 1], [-1, 1], [4, 1], [1, 0], [1, -5], [-4, 5], [0, 0]] as const) {
      setParam(/Set line 1 slope/, m1);
      setParam(/Set line 1 y-intercept/, b1);
      const lines = currentLines(holder.v);
      expect([m1, b1, lines.m1, lines.b1]).toEqual([m1, b1, m1, b1]);
      expect([m1, b1, labelText("a")]).toEqual([m1, b1, `line 1: ${readingForm(m1, b1)}`]);
      // …and line 2, untouched throughout, never drifts.
      expect([m1, b1, labelText("b")]).toEqual([m1, b1, `line 2: ${readingForm(-1, 5)}`]);
    }
  });

  it("updates the label as the learner drags the line", () => {
    mount(EDITABLE);
    pinSvg();
    expect(labelText("a")).toBe(`line 1: ${readingForm(1, 1)}`);
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1)); // tilt: the rate changes, the start does not
    expect(labelText("a")).toBe(`line 1: ${readingForm(-1, 1)}`);
    dragGrip("se-grip-a-intercept", slideTo("a", -1, 4)); // slide: the start changes, the rate does not
    expect(labelText("a")).toBe(`line 1: ${readingForm(-1, 4)}`);
  });

  it("shows BOTH equations when the lines coincide, because they really are the same equation", () => {
    const { holder } = mount(EDITABLE);
    setParam(/Set line 2 slope/, 1);
    setParam(/Set line 2 y-intercept/, 1); // now identical to line 1
    expect(verdict()).toContain("same line written twice");
    const lines = currentLines(holder.v);
    expect([lines.m1, lines.b1, lines.m2, lines.b2]).toEqual([1, 1, 1, 1]);
    // Two labels, the same equation in both — which is the mathematics, not a rendering accident.
    expect(labelText("a")).toBe(`line 1: ${readingForm(1, 1)}`);
    expect(labelText("b")).toBe(`line 2: ${readingForm(1, 1)}`);
    expect(labelText("a").replace("line 1", "")).toBe(labelText("b").replace("line 2", ""));
    // …and they are pushed apart far enough to both be read.
    expect(Math.abs(labelY("a") - labelY("b"))).toBeGreaterThanOrEqual(15);
  });

  it("separates the labels when parallel lines run close together", () => {
    mount(EDITABLE);
    setParam(/Set line 2 slope/, 1);
    setParam(/Set line 2 y-intercept/, 2); // parallel, one unit apart
    expect(verdict()).toContain("parallel");
    expect(labelText("a")).toBe(`line 1: ${readingForm(1, 1)}`);
    expect(labelText("b")).toBe(`line 2: ${readingForm(1, 2)}`);
    expect(Math.abs(labelY("a") - labelY("b"))).toBeGreaterThanOrEqual(15);
  });

  it("keeps a steep line's label on the part of it that is visible", () => {
    mount(EDITABLE);
    setParam(/Set line 1 slope/, 4); // y = 4x + 1 leaves the top of a 0..7 window at x = 1.5
    const yPx = labelY("a");
    expect(yPx).toBeGreaterThanOrEqual(0);
    expect(yPx).toBeLessThanOrEqual(300);
    expect(labelText("a")).toBe(`line 1: ${readingForm(4, 1)}`);
  });

  it("never swallows a grip: labels are inert and the grips still drag", () => {
    mount(EDITABLE);
    pinSvg();
    for (const slot of ["a", "b"] as const) {
      expect(screen.getByTestId(`se-eq-${slot}`).getAttribute("style")).toContain("pointer-events: none");
    }
    // …and a drag started on a grip still works with the labels rendered over the same region.
    dragGrip("se-grip-b-slope", tiltTo("b", 5, 1));
    expect(labelText("b")).toBe(`line 2: ${readingForm(1, 5)}`);
  });

  it("gives a screen reader the equations, and narrates the symbolic consequence of a drag", () => {
    mount(EDITABLE);
    pinSvg();
    const name = () => screen.getByRole("img").getAttribute("aria-label") ?? "";
    expect(name()).toContain(`Line 1 is ${readingForm(1, 1)}`);
    expect(name()).toContain(`line 2 is ${readingForm(-1, 5)}`);
    dragGrip("se-grip-a-slope", tiltTo("a", 1, -1));
    expect(name()).toContain(`Line 1 is ${readingForm(-1, 1)}`);
    const said = screen.getByTestId("se-status").textContent ?? "";
    expect(said).toContain(`Line 1 is now ${readingForm(-1, 1)}`);
    expect(said).toContain("constant gap of 4");
  });
});

/* ══════════════════════════════════════════════════════════════════ */

describe("the screen-reader panel describes the lines as they now stand", () => {
  /**
   * S215 QA, the session's most serious finding: this panel narrated the AUTHORED lines, so a
   * learner who had dragged one heard different — and false — mathematics from what the labels
   * showed. The reported case is reproduced exactly below.
   */
  it("narrates a classic spec exactly as it always did", () => {
    // No envelope can exist here, so this is the unchanged path, asserted against the literal
    // sentence rather than against the code that builds it.
    expect(describeWidgetState(CLASSIC, { x: 2, y: 3 })).toBe(
      "Two lines are drawn: y = 1x + 1 and y = -1x + 5. Your point is at (2, 3), which is on BOTH lines — it solves the system."
    );
    expect(describeWidgetState(CLASSIC, null)).toBe(
      "Two lines are drawn: y = 1x + 1 and y = -1x + 5. No point is placed yet."
    );
    // An editable spec nobody has touched writes no envelope, so it narrates the same way.
    expect(describeWidgetState(EDITABLE, { x: 2, y: 3 })).toBe(describeWidgetState(CLASSIC, { x: 2, y: 3 }));
  });

  it("follows a dragged line, including the membership claim that was false", () => {
    const { holder } = mount(EDITABLE);
    // The QA's own scenario: make line 1 into y = 3x, then stand on it at (1, 3).
    setParam(/Set line 1 slope/, 3);
    setParam(/Set line 1 y-intercept/, 0);
    setParam(/point x/, 1);
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "3" } });
    expect(holder.v).toEqual({ x: 1, y: 3, lines: { m1: 3, b1: 0, m2: -1, b2: 5 } });

    const said = describeWidgetState(EDITABLE, holder.v) ?? "";
    // The equations the learner can SEE …
    expect(said).toContain("y = 3x + 0");
    expect(said).not.toContain("y = 1x + 1");
    // … the y-values of the lines as they now stand: 3·1 = 3 and −1 + 5 = 4, by hand …
    expect(said).toContain("(1, 3)");
    // … and the membership claim, which used to say "neither" while the point was on line 1.
    expect(said).toContain("on the first line only");
    expect(said).not.toContain("on neither line");
    // The panel and the picture agree, because both read the same four numbers.
    expect(screen.getByText(/^\(1, 3\)/).textContent ?? "").toContain("✓ line 1");
    expect(labelText("a")).toBe(`line 1: ${readingForm(3, 0)}`);
  });

  it("agrees with the widget's own marks in every degenerate state too", () => {
    const { holder } = mount(EDITABLE);
    setParam(/Set line 2 slope/, 1); // parallel
    setParam(/point x/, 0);
    fireEvent.change(screen.getByRole("slider", { name: "point y" }), { target: { value: "1" } });
    const parallelSaid = describeWidgetState(EDITABLE, holder.v) ?? "";
    expect(parallelSaid).toContain("y = 1x + 5"); // line 2 as it now stands
    expect(parallelSaid).toContain("on the first line only"); // (0,1) is on y = x + 1, not y = x + 5

    setParam(/Set line 2 y-intercept/, 1); // coincident
    const coincidentSaid = describeWidgetState(EDITABLE, holder.v) ?? "";
    // Both equations are now the same, and the point is genuinely on both.
    expect(coincidentSaid).toContain("y = 1x + 1 and y = 1x + 1");
    expect(coincidentSaid).toContain("on BOTH lines");
  });
});
