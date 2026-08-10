// @vitest-environment jsdom
//
// MMIP v1 THROUGH THE DOM — solveBalance edited from three surfaces, one state.
//
// The proof this file is after is not "the widget renders". It is that the pan tiles, the move
// controls and the equation strip are three views of ONE canonical position:
//
//   · act on a tile and the strip's numbers move;
//   · type into the strip and the tiles reflow, the sentence rewrites, the beam answers;
//   · reach a position by typing and by tapping, and land on the SAME graded state;
//   · undo steps back through symbolic edits exactly as it does through taps;
//   · every new affordance is a native control with a mathematical accessible name, a 44px target
//     and a keyboard route that reaches the same states as the pointer route;
//   · nothing new says what x is.
//
// Expected values are written out by hand (3x + 4 = 19 solves to 5, so 4 taps a side then a split),
// never by asking the model.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { evaluate } from "@/lib/evaluate";
import { stubPrefersReducedMotion } from "@/lib/mmip/mmipHarness";
import { solveBalanceCanonicalModel } from "@/lib/mmip/solveBalanceModel";

afterEach(cleanup);

const FB = {
  successFeedback: "s",
  unbalancedFeedback: "u",
  notIsolatedFeedback: "n",
  missFeedback: "m",
};

const CLASSIC = WidgetSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3x + 4 = 19.",
  a: 3,
  b: 4,
  c: 19,
  ...FB,
}) as TWidget;

const GROUPED = WidgetSpec.parse({
  type: "solveBalance",
  prompt: "Solve 3(x + 2) = 18.",
  a: 3,
  b: 6,
  c: 18,
  groups: { count: 3, x: 1, unit: 2 },
  ...FB,
  unexpandedFeedback: "brackets",
  partialDistributeFeedback: "partial",
}) as TWidget;

const INEQ = WidgetSpec.parse({
  type: "solveBalance",
  prompt: "Solve −2x + 5 > −3.",
  a: -2,
  b: 5,
  c: -3,
  relation: "gt",
  ...FB,
  notFlippedFeedback: "flip",
}) as TWidget;

function mount(spec: TWidget, opts: { disabled?: boolean; tone?: "neutral" | "info" } = {}) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(undefined);
    return (
      <WidgetRenderer
        spec={spec}
        value={value}
        onChange={(v) => {
          holder.v = v;
          setValue(v);
        }}
        disabled={opts.disabled ?? false}
        tone={opts.tone}
      />
    );
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}

const openStrip = () => fireEvent.click(screen.getByTestId("sb-sym-toggle"));
const field = (id: string) => screen.getByTestId(id) as HTMLInputElement;
const type = (id: string, text: string) => fireEvent.change(field(id), { target: { value: text } });
const field2 = (id: string) => screen.getByTestId(id);

/* ─────────────────── the strip is opt-in: closed, the lesson is untouched ─────────────────── */

describe("the equation strip is an affordance, not a change of lesson", () => {
  it("is closed on arrival, and the classic surface is exactly what it always was", () => {
    mount(CLASSIC);
    expect(screen.queryByTestId("sb-sym")).toBeNull();
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 4 = 19");
    // no signed chrome leaks into a positive equation while the strip is closed
    expect(screen.queryByTestId("sb-left-add")).toBeNull();
    expect(screen.queryByTestId("sb-right-add")).toBeNull();
    expect(screen.queryByTestId("sb-negate")).toBeNull();
    expect(screen.queryByTestId("sb-flip")).toBeNull();
    // and the toggle announces its own state
    expect(screen.getByTestId("sb-sym-toggle").getAttribute("aria-expanded")).toBe("false");
  });

  it("opening it reveals the ±1 adders too — a number typed upward must have a visible tile route", () => {
    mount(CLASSIC);
    openStrip();
    expect(screen.getByTestId("sb-sym")).toBeTruthy();
    expect(screen.getByTestId("sb-sym-toggle").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("sb-left-add")).toBeTruthy();
    expect(screen.getByTestId("sb-right-sub")).toBeTruthy();
    // closing puts the classic surface back
    fireEvent.click(screen.getByTestId("sb-sym-toggle"));
    expect(screen.queryByTestId("sb-sym")).toBeNull();
    expect(screen.queryByTestId("sb-left-add")).toBeNull();
  });

  it("reads the current position into its fields without being told", () => {
    mount(CLASSIC);
    openStrip();
    expect(field("sb-sym-lx").value).toBe("3");
    expect(field("sb-sym-lu").value).toBe("4");
    expect(field("sb-sym-ru").value).toBe("19");
    expect(screen.getByTestId("sb-sym-rel").textContent).toBe("=");
  });
});

/* ───────────────────────────── symbol → tiles ───────────────────────────── */

describe("typing on the equation moves the tiles", () => {
  it("a smaller constant empties that pile, rewrites the sentence and tips the beam", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "1");
    expect(holder.v).toMatchObject({ leftX: 3, leftUnits: 1, rightUnits: 19 });
    // three tiles left the left pan: 4 → 1
    expect(screen.getByTestId("sb-left").querySelectorAll("button").length).toBe(3 + 1);
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 1 = 19");
    // one-sided, so the beam says so — in words, not only in angle
    expect(screen.getByTestId("sb-tipped").textContent).toMatch(/right side is heavier/i);
  });

  it("a bigger constant puts tiles ON that pan, which the ±1 adder could also have done", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    type("sb-sym-ru", "21");
    expect(holder.v).toMatchObject({ rightUnits: 21 });
    expect(screen.getByTestId("sb-right").querySelectorAll("button").length).toBe(21);
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 4 = 21");
  });

  it("refuses to conjure an x-tile, and says why in mathematics", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    const before = holder.v;
    type("sb-sym-lx", "5");
    expect(holder.v).toEqual(before); // the pans did not move
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 4 = 19");
    expect(screen.getByTestId("sb-sym-status").textContent).toMatch(/never put on one/);
    // the stepper that would do it is disabled, and its name explains the mathematics
    const up = screen.getByTestId("sb-sym-lx-up") as HTMLButtonElement;
    expect(up.disabled).toBe(true);
    expect(up.getAttribute("aria-label")).toMatch(/never put on one/);
  });

  it("a standing bracket makes the strip inert until it is distributed", () => {
    mount(GROUPED);
    openStrip();
    expect(screen.getByTestId("sb-sym-locked").textContent).toMatch(/unopened brackets/);
    expect(screen.queryByTestId("sb-sym-lu")).toBeNull();
    fireEvent.click(screen.getByTestId("sb-dist-all"));
    expect(screen.queryByTestId("sb-sym-locked")).toBeNull();
    expect(field("sb-sym-lu").value).toBe("6");
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 6 = 18");
  });
});

/* ───────────────────────────── tiles → symbol ───────────────────────────── */

describe("moving the tiles rewrites the equation", () => {
  it("tapping a unit tile shows up in the strip's field immediately", () => {
    mount(CLASSIC);
    openStrip();
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the right pan/ })[0]);
    expect(field("sb-sym-ru").value).toBe("18");
    expect(field("sb-sym-lu").value).toBe("4");
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    expect(field("sb-sym-lu").value).toBe("3");
  });

  it("a control move — the split — retypes the whole sentence", () => {
    mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "0");
    type("sb-sym-ru", "15");
    fireEvent.click(screen.getByTestId("sb-split"));
    expect(field("sb-sym-lx").value).toBe("1");
    expect(field("sb-sym-ru").value).toBe("5");
    expect(screen.getByTestId("sb-equation").textContent).toBe("x = 5");
  });

  it("a half-typed number never survives a tile move", () => {
    mount(CLASSIC);
    openStrip();
    fireEvent.change(field("sb-sym-ru"), { target: { value: "" } }); // mid-keystroke draft
    expect(field("sb-sym-ru").value).toBe("");
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the right pan/ })[0]);
    expect(field("sb-sym-ru").value).toBe("18");
  });
});

/* ─────────────── one state: the two routes to the answer are the same route ─────────────── */

describe("typed and tapped reach the same graded position", () => {
  it("the symbolic solve grades correct, exactly as the tile solve does", () => {
    const typed = mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "0");
    type("sb-sym-ru", "15");
    fireEvent.click(screen.getByTestId("sb-split"));
    expect(evaluate(CLASSIC, typed.holder.v).correct).toBe(true);
    const symbolicState = typed.holder.v;
    cleanup();

    const tapped = mount(CLASSIC);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
      fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the right pan/ })[0]);
    }
    fireEvent.click(screen.getByTestId("sb-split"));
    expect(evaluate(CLASSIC, tapped.holder.v).correct).toBe(true);
    const { hist: _h1, ...symbolPans } = symbolicState as Record<string, unknown>;
    const { hist: _h2, ...tilePans } = tapped.holder.v as Record<string, unknown>;
    expect(symbolPans).toEqual(tilePans);
  });

  it("undo steps back through a symbolic edit exactly as through a tap", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "0"); // one transaction, however many tiles it moved
    expect(holder.v).toMatchObject({ leftUnits: 0 });
    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(holder.v).toMatchObject({ leftX: 3, leftUnits: 4, rightUnits: 19 });
    expect(field("sb-sym-lu").value).toBe("4");
    expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 4 = 19");
    // and undo is spent, not stuck
    expect((screen.getByTestId("sb-undo") as HTMLButtonElement).disabled).toBe(true);
  });

  it("reset from a symbolic position restores the problem as written", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "1");
    type("sb-sym-ru", "16");
    fireEvent.click(screen.getByTestId("sb-reset"));
    expect(holder.v).toMatchObject({ leftX: 3, leftUnits: 4, rightUnits: 19, hist: [] });
    expect(field("sb-sym-lu").value).toBe("4");
  });
});

/* ────────────────────────────── keyboard and screen-reader parity ────────────────────────────── */

describe("every new affordance is operable without a pointer and speaks the mathematics", () => {
  it("the steppers alone solve the problem, and land where typing lands", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByTestId("sb-sym-lu-down"));
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByTestId("sb-sym-ru-down"));
    fireEvent.click(screen.getByTestId("sb-split"));
    expect(evaluate(CLASSIC, holder.v).correct).toBe(true);
    expect(screen.getByTestId("sb-equation").textContent).toBe("x = 5");
  });

  it("the stepper and the field are the same edit by two routes", () => {
    const stepped = mount(CLASSIC);
    openStrip();
    fireEvent.click(screen.getByTestId("sb-sym-lu-down"));
    const afterStep = stepped.holder.v;
    cleanup();
    const typed = mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "3");
    expect(typed.holder.v).toEqual(afterStep);
  });

  it("is built from native controls with 44px targets, never a div pretending", () => {
    const { container } = mount(CLASSIC);
    openStrip();
    const panel = screen.getByTestId("sb-sym");
    for (const el of Array.from(panel.querySelectorAll('[role="button"], [tabindex]')))
      expect(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]).toContain(el.tagName);
    for (const el of Array.from(panel.querySelectorAll("button")))
      expect(el.className, el.getAttribute("data-testid") ?? "").toMatch(/min-h-11/);
    for (const el of Array.from(panel.querySelectorAll("input"))) expect(el.className).toMatch(/min-h-11/);
    expect((screen.getByTestId("sb-sym-toggle") as HTMLElement).className).toMatch(/min-h-11/);
    // no animation a reduced-motion setting could not switch off: every transition is either a
    // colour change, gated behind motion-safe:, or explicitly cancelled by motion-reduce:.
    for (const el of Array.from(container.querySelectorAll('[class*="transition"]')))
      expect(el.getAttribute("class") ?? "").toMatch(
        /motion-reduce:transition-none|motion-safe:transition|transition-colors/
      );
  });

  it("names each field by what the number IS, and reports each move as mathematics", () => {
    mount(CLASSIC);
    openStrip();
    expect(field("sb-sym-lx").getAttribute("aria-label")).toMatch(/how many x-tiles stand on the left pan/);
    expect(field("sb-sym-lu").getAttribute("aria-label")).toMatch(/how many unit tiles stand on the left pan/);
    expect(field("sb-sym-ru").getAttribute("aria-label")).toMatch(/how many unit tiles stand on the right pan/);
    // bounds are advertised, so a screen reader hears the rule before it is broken
    expect(field("sb-sym-lx").getAttribute("max")).toBe("3");
    expect(field("sb-sym-lx").getAttribute("min")).toBe("0");
    const status = screen.getByTestId("sb-sym-status");
    expect(status.getAttribute("role")).toBe("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    type("sb-sym-lu", "2");
    expect(status.textContent).toMatch(/Took 2 unit tiles off the left pan only/);
    expect(status.textContent).not.toMatch(/field|button|slider/i);
  });

  it("the sign is in the glyph, never in the colour alone", () => {
    mount(WidgetSpec.parse({ type: "solveBalance", prompt: "p", a: -2, b: 5, c: -7, ...FB }) as TWidget);
    openStrip();
    expect(field("sb-sym-lx").value).toBe("-2");
    expect(field("sb-sym-ru").value).toBe("-7");
    expect(screen.getByTestId("sb-equation").textContent).toBe("−2x + 5 = −7");
  });
});

/* ─────────────────────────── the S206 spotlight survives the new surface ─────────────────────────── */

describe("the spotlight still binds term to tile, now including the strip", () => {
  it("hovering a strip field lights exactly the tiles that field counts", () => {
    mount(CLASSIC);
    openStrip();
    fireEvent.mouseEnter(screen.getByTestId("sb-sym-lx-slot"));
    const lit = Array.from(screen.getByTestId("sb-left").querySelectorAll("button")).filter((b) =>
      b.className.includes("ring-tangerine")
    );
    expect(lit).toHaveLength(3);
    expect(lit.every((b) => b.textContent === "x")).toBe(true);
    expect(screen.getByTestId("sb-right").querySelector("[class*='ring-tangerine']")).toBeNull();
    fireEvent.mouseLeave(screen.getByTestId("sb-sym-lx-slot"));
    expect(document.querySelector("[class*='ring-tangerine']")).toBeNull();
  });

  it("the sentence's own term buttons are untouched by the strip", () => {
    mount(CLASSIC);
    openStrip();
    fireEvent.click(screen.getByTestId("sb-term-lu"));
    expect(screen.getByTestId("sb-term-lu").getAttribute("aria-pressed")).toBe("true");
    const lit = Array.from(screen.getByTestId("sb-left").querySelectorAll("button")).filter((b) =>
      b.className.includes("ring-tangerine")
    );
    expect(lit).toHaveLength(4);
  });
});

/* ─────────────────────────────── inequalities keep their witness ─────────────────────────────── */

describe("an inequality keeps every one of its moving parts", () => {
  it("shows the comparator, agrees with the beam, and still flips", () => {
    const { holder } = mount(INEQ);
    openStrip();
    expect(screen.getByTestId("sb-sym-rel").textContent).toBe(">");
    expect(screen.getByTestId("sb-agrees")).toBeTruthy();
    fireEvent.click(screen.getByTestId("sb-negate"));
    expect(holder.v).toMatchObject({ leftX: 2, leftUnits: -5, rightUnits: 3, rel: "gt" });
    expect(screen.getByTestId("sb-contradiction")).toBeTruthy();
    expect(field("sb-sym-lu").value).toBe("-5");
    fireEvent.click(screen.getByTestId("sb-flip"));
    expect(screen.getByTestId("sb-sym-rel").textContent).toBe("<");
    expect(screen.getByTestId("sb-agrees")).toBeTruthy();
    expect(evaluate(INEQ, holder.v).correct).toBe(false); // true claim, x not alone yet
  });

  it("a one-sided symbolic edit breaks the claim and the grader names it", () => {
    const { holder } = mount(INEQ);
    openStrip();
    // −2x + 5 > −3 is weighed at x = 3, where the left pan is −1. Moving the right pan to 0 makes
    // the sentence claim −1 > 0, which the beam refutes on the spot.
    type("sb-sym-ru", "0");
    expect(screen.getByTestId("sb-contradiction")).toBeTruthy();
    expect(evaluate(INEQ, holder.v).correct).toBe(false);
  });
});

/* ─────────── S208 review conditions 4–6: the live region, undo's path, and one run ─────────── */

describe("a run of edits to one slot is ONE step back (review condition 6)", () => {
  it("typing 21 over 19 a digit at a time undoes to 19, not to 2", () => {
    // The intermediate "2" is a keystroke, never a position the learner meant to stand on.
    const { holder } = mount(CLASSIC);
    openStrip();
    fireEvent.change(field("sb-sym-ru"), { target: { value: "2" } });
    expect(holder.v).toMatchObject({ rightUnits: 2 });
    fireEvent.change(field("sb-sym-ru"), { target: { value: "21" } });
    expect(holder.v).toMatchObject({ rightUnits: 21 });
    expect((holder.v as { hist: unknown[] }).hist).toHaveLength(1);

    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(holder.v).toMatchObject({ rightUnits: 19 });
    expect(field("sb-sym-ru").value).toBe("19");
    expect((screen.getByTestId("sb-undo") as HTMLButtonElement).disabled).toBe(true);
  });

  it("the undo animates the WHOLE run, not its last keystroke", () => {
    // 19 → 21 is a net arrival of two tiles (join), so stepping back is a departure (leave).
    // Had the stack kept the first keystroke's plan (19 → 2, a leave), the reverse would read
    // "join" — so this assertion is what tells the two implementations apart.
    mount(CLASSIC);
    openStrip();
    fireEvent.change(field("sb-sym-ru"), { target: { value: "2" } });
    fireEvent.change(field("sb-sym-ru"), { target: { value: "21" } });
    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(
      Array.from(document.querySelectorAll("[data-morph-ms]")).map((el) => [
        el.getAttribute("data-testid"),
        el.getAttribute("data-morph-motion"),
      ])
    ).toEqual([["sb-right", "leave"]]);
  });

  it("a run ends at a blur, at another slot, and at any move from another representation", () => {
    const blurred = mount(CLASSIC);
    openStrip();
    fireEvent.change(field("sb-sym-ru"), { target: { value: "18" } });
    fireEvent.blur(field("sb-sym-ru"));
    fireEvent.change(field("sb-sym-ru"), { target: { value: "17" } });
    expect((blurred.holder.v as { hist: unknown[] }).hist).toHaveLength(2);
    cleanup();

    const twoSlots = mount(CLASSIC);
    openStrip();
    fireEvent.change(field("sb-sym-lu"), { target: { value: "3" } });
    fireEvent.change(field("sb-sym-ru"), { target: { value: "18" } });
    expect((twoSlots.holder.v as { hist: unknown[] }).hist).toHaveLength(2);
    cleanup();

    const interrupted = mount(CLASSIC);
    openStrip();
    fireEvent.change(field("sb-sym-ru"), { target: { value: "18" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    fireEvent.change(field("sb-sym-ru"), { target: { value: "17" } });
    expect((interrupted.holder.v as { hist: unknown[] }).hist).toHaveLength(3);
  });

  it("stepping a slot repeatedly is one run too, and undo returns to where the run began", () => {
    const { holder } = mount(CLASSIC);
    openStrip();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByTestId("sb-sym-lu-down"));
    expect(holder.v).toMatchObject({ leftUnits: 0 });
    expect((holder.v as { hist: unknown[] }).hist).toHaveLength(1);
    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(holder.v).toMatchObject({ leftUnits: 4 });
  });
});

describe("every refusal reaches a live region (review condition 4)", () => {
  it("the region is mounted even with the strip closed — and stays silent about accepted moves", () => {
    const { container } = mount(CLASSIC);
    const status = screen.getByTestId("sb-sym-status");
    expect(status.getAttribute("role")).toBe("status");
    expect(status.className).toBe("sr-only"); // present, out of sight
    expect(status.textContent).toBe("");
    // an accepted classic move adds no second announcement: the readout and the beam already speak
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    expect(screen.getByTestId("sb-sym-status").textContent).toBe("");
    expect(container.textContent).not.toMatch(/Took 1 unit tile off the left pan/);
  });

  it("a refusal reachable WITHOUT the strip is still spoken", () => {
    // The ±1 adders ship with any signed lesson, and a pan has a readable limit of 30 tiles.
    // −2x + 5 = −7 starts with 5 on the left, so the 26th press is the one the pans refuse.
    mount(WidgetSpec.parse({ type: "solveBalance", prompt: "p", a: -2, b: 5, c: -7, ...FB }) as TWidget);
    expect(screen.queryByTestId("sb-sym")).toBeNull(); // strip never opened
    for (let i = 0; i < 26; i++) fireEvent.click(screen.getByTestId("sb-left-add"));
    const status = screen.getByTestId("sb-sym-status");
    expect(status.textContent).toMatch(/at most 30 unit tiles/);
    expect(status.getAttribute("aria-live")).toBe("polite");
    // the pan really did stop at the limit: 30 unit tiles, alongside the two negative x-tiles
    const left = Array.from(field2("sb-left").querySelectorAll("button"));
    expect(left.filter((b) => b.textContent === "1")).toHaveLength(30);
    expect(left).toHaveLength(30 + 2);
  });
});

/* ──────────────────────── the morph layer is driven by the transaction ──────────────────────── */

describe("motion is compiled from the move, never from the widget's guesswork", () => {
  // MORPH_BASE_MS is 220. equationMorph's relative weights: leave/join 1, partition 1.5,
  // branch 1.5, reflect 1, pivot 0.75 — so the milliseconds below are hand-multiplied, not read
  // back from the component.
  const marked = () =>
    Array.from(document.querySelectorAll("[data-morph-ms]")).map((el) => [
      el.getAttribute("data-testid"),
      el.getAttribute("data-morph-motion"),
      el.getAttribute("data-morph-ms"),
    ]);

  it("a tile leaving its pan marks that pan alone, with the plan's own duration", () => {
    mount(CLASSIC);
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    expect(marked()).toEqual([["sb-left", "leave", "220"]]);
  });

  it("a split is a partition of BOTH pans and reads slower — 1.5 × 220", () => {
    mount(CLASSIC);
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    // reach 3x = 15 the short way, then split
    openStrip();
    type("sb-sym-lu", "0");
    type("sb-sym-ru", "15");
    fireEvent.click(screen.getByTestId("sb-split"));
    expect(marked()).toEqual([
      ["sb-left", "partition", "330"],
      ["sb-right", "partition", "330"],
    ]);
  });

  it("flipping the comparator pivots the comparator glyph and nothing else", () => {
    mount(INEQ);
    fireEvent.click(screen.getByTestId("sb-flip"));
    expect(marked()).toEqual([["sb-rel", "pivot", "165"]]);
  });

  it("distributing branches onto the left pan; negating reflects both pans", () => {
    mount(GROUPED);
    fireEvent.click(screen.getByTestId("sb-dist-all"));
    expect(marked()).toEqual([["sb-left", "branch", "330"]]);
    cleanup();
    mount(INEQ);
    fireEvent.click(screen.getByTestId("sb-negate"));
    expect(marked()).toEqual([
      ["sb-left", "reflect", "220"],
      ["sb-right", "reflect", "220"],
    ]);
  });

  it("a refused edit animates nothing at all — the refusal is the whole response", () => {
    mount(CLASSIC);
    openStrip();
    type("sb-sym-lx", "9");
    expect(marked()).toEqual([]);
    expect(screen.getByTestId("sb-sym-status").textContent).toMatch(/never put on one/);
  });

  it("undo replays the move backwards: what left, joins", () => {
    mount(CLASSIC);
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the right pan/ })[0]);
    expect(marked()).toEqual([["sb-right", "leave", "220"]]);
    fireEvent.click(screen.getByTestId("sb-undo"));
    expect(marked()).toEqual([["sb-right", "join", "220"]]);
  });

  it("a typed edit that crosses zero is two beats, and the last one is what settles", () => {
    mount(WidgetSpec.parse({ type: "solveBalance", prompt: "p", a: -2, b: 5, c: -7, ...FB }) as TWidget);
    openStrip();
    type("sb-sym-lu", "-3"); // 5 → 0 → −3: tiles leave, then opposite tiles arrive
    // both phases name the same actor, so the later mark is the one left standing
    expect(marked()).toEqual([["sb-left", "join", "220"]]);
  });

  it("under reduced motion nothing travels and the words carry the whole move", () => {
    const restore = stubPrefersReducedMotion(true);
    try {
      mount(CLASSIC);
      openStrip();
      type("sb-sym-lu", "1");
      expect(marked()).toEqual([]);
      const status = screen.getByTestId("sb-sym-status").textContent ?? "";
      expect(status).toMatch(/Leave\./); // the motion is still NAMED
      expect(status).toMatch(/Took 3 unit tiles off the left pan only/);
      expect(status).toMatch(/State delta: leftUnits -3\./);
      // and the pans really did move, so the state change is legible without any animation
      expect(screen.getByTestId("sb-equation").textContent).toBe("3x + 1 = 19");
    } finally {
      restore();
    }
  });
});

/* ───────── S209-A1: the frozen contract has a real consumer, not a matching shape ───────── */

describe("the component runs THROUGH the assembled canonical model", () => {
  it("imports the assembled object and reaches no loose mutation helper", async () => {
    // A source-level pin, in the manner of the cross-engine testid gate: the point of S209-A1 is
    // that the seam exists in the code, and only the code can testify to that. If a later edit
    // re-introduces a direct `solveBalanceApply(...)` call the interface silently stops being
    // load-bearing again, and nothing behavioural would notice.
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const src = readFileSync(join(process.cwd(), "src", "components", "widgets.tsx"), "utf8");
    expect(src).toContain("solveBalanceCanonicalModel");
    for (const loose of [
      "solveBalanceApply(",
      "solveBalanceNormalize(",
      "solveBalanceInitial(",
      "solveBalanceWeights(",
      "sbDeriveSymbol(",
      "sbDeriveControls(",
    ]) {
      expect([loose, src.includes(loose)]).toEqual([loose, false]);
    }
    // and the mutation path really is the object's own method
    expect(src).toContain("model.apply(st, edit, origin, source)");
    expect(src).toContain("model.views(st)");
    expect(src).toContain("model.normalize(raw)");
  });

  it("what the widget draws is exactly what the model's bindings derive", () => {
    // Independently: build the model here, derive the views through it, and check the DOM against
    // those numbers rather than against the component's own internals.
    const model = solveBalanceCanonicalModel({ a: 3, b: 4, c: 19 });
    mount(CLASSIC);
    openStrip();
    const views = model.views(model.initial);
    expect(screen.getByTestId("sb-equation").textContent).toBe(views.symbol.sentence);
    expect(screen.getByTestId("sb-left").querySelectorAll("button")).toHaveLength(
      views.tiles.left.xTiles + views.tiles.left.unitTiles
    );
    expect(screen.getByTestId("sb-right").querySelectorAll("button")).toHaveLength(views.tiles.right.unitTiles);
    expect((screen.getByTestId("sb-split") as HTMLButtonElement).disabled).toBe(!views.controls.canSplit);
    expect(field("sb-sym-lu").value).toBe(String(views.symbol.slots.leftConstant.value));

    // and after a mutation the DOM tracks the model's own `apply`, step for step
    const after = model.apply(model.initial, { kind: "tapLeftUnit" }, "physical", "solveBalance.tiles").after;
    fireEvent.click(screen.getAllByRole("button", { name: /Take one unit tile off the left pan/ })[0]);
    expect(screen.getByTestId("sb-equation").textContent).toBe(model.views(after).symbol.sentence);
    expect(field("sb-sym-lu").value).toBe(String(after.leftUnits));
  });
});

/* ───────── S212 review, C2: a move that moved nothing describes nothing ───────── */

describe("reset on an untouched position is deliberately quiet", () => {
  // The `accept()` fix (S213) stopped unchanged transactions carrying ops, which CHANGED what a
  // learner hears here: reset used to announce "Put every tile back where the problem started"
  // even when nothing had moved. Silence is now the intended behaviour, so it is pinned rather
  // than left to be re-broken by whoever next touches the op list.
  const noMotion = () => Array.from(document.querySelectorAll("[data-morph-ms]"));

  it("animates nothing and says nothing, with the strip closed", () => {
    const { holder } = mount(CLASSIC);
    const before = holder.v;
    fireEvent.click(screen.getByTestId("sb-reset"));
    expect(noMotion()).toEqual([]);
    expect(screen.getByTestId("sb-sym-status").textContent).toBe("");
    expect(holder.v).toMatchObject({ leftX: 3, leftUnits: 4, rightUnits: 19, hist: [] });
    expect(holder.v).toEqual(before);
  });

  it("with the strip open it says NOTHING CHANGED rather than describing a move", () => {
    mount(CLASSIC);
    openStrip();
    fireEvent.click(screen.getByTestId("sb-reset"));
    expect(noMotion()).toEqual([]);
    // the honest sentence for an accepted transaction that moved nothing — not the restore verb
    expect(screen.getByTestId("sb-sym-status").textContent).toBe("Nothing changed.");
    expect(screen.getByTestId("sb-sym-status").textContent).not.toMatch(/Put every tile back/);
  });

  it("…while a reset from a MOVED position still animates and still says what it did", () => {
    mount(CLASSIC);
    openStrip();
    type("sb-sym-lu", "1");
    fireEvent.click(screen.getByTestId("sb-reset"));
    expect(noMotion().length).toBeGreaterThan(0);
    expect(screen.getByTestId("sb-sym-status").textContent).toMatch(/Put every tile back where the problem started/);
  });
});

/* ──────────────────────────────────── no answer leak ──────────────────────────────────── */

describe("the strip never says what x is", () => {
  it("nothing on screen — text or accessible name — carries the solution before the reveal", () => {
    const { container } = mount(CLASSIC); // 3x + 4 = 19 solves to x = 5
    openStrip();
    expect(container.textContent).not.toMatch(/x = 5|x is 5|the answer/i);
    expect(screen.queryByTestId("slb-ghost")).toBeNull();
    const names = Array.from(container.querySelectorAll("[aria-label]"))
      .map((e) => e.getAttribute("aria-label") ?? "")
      .join(" | ");
    expect(names).not.toMatch(/x = 5|x is 5|solution|the answer/i);
  });

  it("the reveal ghost is still the only place the finished state is named", () => {
    mount(CLASSIC, { tone: "info", disabled: true });
    expect(screen.getByTestId("slb-ghost").textContent).toMatch(/x = 5/);
    expect(screen.getByTestId("slb-ghost").getAttribute("aria-hidden")).toBe("true");
  });

  it("a revealed step stays inspectable but not editable", () => {
    mount(CLASSIC, { tone: "info", disabled: true });
    openStrip();
    expect((field("sb-sym-lu") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByTestId("sb-sym-lu-down") as HTMLButtonElement).disabled).toBe(true);
    // the spotlight still works, because inspecting a finished position is the point of a reveal
    fireEvent.mouseEnter(screen.getByTestId("sb-sym-ru-slot"));
    expect(
      Array.from(screen.getByTestId("sb-right").querySelectorAll("button")).filter((b) =>
        b.className.includes("ring-tangerine")
      )
    ).toHaveLength(19);
  });
});
