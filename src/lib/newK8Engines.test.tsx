// @vitest-environment jsdom
/**
 * The four s36 K–8 engines, tested at their contract seams:
 * evaluate precedence (common traps before direction fallbacks; the
 * counting-coins misconception; unfinished pairing), schema integrity
 * (answer re-derivation, reachability, answer-slot discipline), and one
 * real render each with keyboard/aria basics.
 */
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "@/lib/schema";
import { canCheck, correctAnswerText, evaluate } from "@/lib/evaluate";
import { WidgetRenderer } from "@/components/widgets";

afterEach(cleanup);

const money = (over: object = {}) =>
  WidgetSpec.parse({
    type: "moneyBoard",
    prompt: "Build exactly 47¢.",
    targetCents: 47,
    tray: [
      { cents: 25, label: "quarter", max: 2 },
      { cents: 10, label: "dime", max: 4 },
      { cents: 5, label: "nickel", max: 4 },
      { cents: 1, label: "penny", max: 4 }
    ],
    commonTotals: [{ cents: 50, feedback: "two quarters overshoot" }],
    countFeedback: "counted coins not values",
    lowFeedback: "low",
    highFeedback: "high",
    successFeedback: "yes",
    ...over
  }) as TWidget;

describe("moneyBoard", () => {
  it("evaluates: exact build wins; trap total beats direction; low/high fallback", () => {
    const w = money();
    expect(evaluate(w, { 25: 1, 10: 2, 1: 2 }).correct).toBe(true); // 25+20+2
    expect(evaluate(w, { 25: 2 }).feedback).toBe("two quarters overshoot"); // 50 = trap, not generic high
    expect(evaluate(w, { 10: 1 }).feedback).toBe("low");
    expect(evaluate(w, { 25: 2, 10: 1 }).feedback).toBe("high"); // 60, no trap
  });

  it("the counting-coins misconception fires on piece count == target", () => {
    // 47 pennies is capped by the tray; use a tray that allows it
    const w = money({ tray: [{ cents: 1, label: "penny", max: 60 }], targetCents: 47, commonTotals: [] });
    // 47 pennies IS 47¢ here — correct; the misconception needs value ≠ target:
    const w2 = money({
      targetCents: 25,
      tray: [
        { cents: 5, label: "nickel", max: 30 },
        { cents: 1, label: "penny", max: 30 }
      ],
      commonTotals: []
    });
    const r = evaluate(w2, { 5: 5, 1: 20 }); // 25 pieces, 45¢
    expect(r.feedback).toBe("counted coins not values");
    expect(evaluate(w, { 1: 47 }).correct).toBe(true);
  });

  it("integrity: unreachable targets and target-valued traps are rejected", () => {
    expect(widgetIntegrityErrors(money({ targetCents: 500 }))[0]).toMatch(/unreachable/);
    expect(
      widgetIntegrityErrors(money({ tray: [{ cents: 10, label: "dime", max: 6 }], targetCents: 47 }))[0]
    ).toMatch(/no combination/);
    expect(widgetIntegrityErrors(money({ commonTotals: [{ cents: 47, feedback: "x" }] }))[0]).toMatch(/success slot/);
  });

  it("renders a tray; tapping a coin updates the live total", () => {
    let val: unknown = undefined;
    const { rerender } = render(
      <WidgetRenderer spec={money()} value={val} onChange={(v) => (val = v)} disabled={false} seed="t" />
    );
    fireEvent.click(screen.getByRole("button", { name: /add a quarter/i }));
    rerender(<WidgetRenderer spec={money()} value={val} onChange={(v) => (val = v)} disabled={false} seed="t" />);
    expect(screen.getByRole("status").textContent).toContain("25¢");
    expect(canCheck(money(), val)).toBe(true);
    expect(correctAnswerText(money())).toContain("47");
  });
});

describe("moneyBoard v2: count mode (mixed collections)", () => {
  const count = (over: object = {}) =>
    WidgetSpec.parse({
      type: "moneyBoard",
      mode: "count",
      prompt: "How many cents?",
      show: [
        { cents: 25, label: "quarter", count: 2 },
        { cents: 5, label: "nickel", count: 1 }
      ],
      answerCents: 55,
      commonEntries: [{ cents: 3, feedback: "counted coins not values" }],
      fallbackFeedback: "fallback",
      successFeedback: "yes 55",
      ...over
    }) as TWidget;

  it("grades the ENTRY: success, trap, chain-mismatch, fallback — in that order", () => {
    const w = count();
    expect(evaluate(w, { counted: [], entry: 55 }).correct).toBe(true);
    expect(evaluate(w, { counted: [], entry: 3 }).feedback).toBe("counted coins not values");
    // chain reached the truth but the typed entry disagrees → mismatch, not fallback
    expect(evaluate(w, { counted: [25, 25, 5], entry: 54 }).feedback).toMatch(/disagree/);
    expect(evaluate(w, { counted: [], entry: 54 }).feedback).toBe("fallback");
    expect(evaluate(w, { counted: [25], entry: null }).feedback).toMatch(/type the total/);
  });

  it("integrity: answerCents re-derived from the coins; tray forbidden; trap≠answer", () => {
    expect(widgetIntegrityErrors(count({ answerCents: 60 }))[0]).toMatch(/contradicts the shown coins/);
    expect(
      widgetIntegrityErrors(count({ tray: [{ cents: 5, label: "nickel", max: 2 }] }))[0]
    ).toMatch(/not tray/);
    expect(widgetIntegrityErrors(count({ commonEntries: [{ cents: 55, feedback: "x" }] }))[0]).toMatch(
      /success slot/
    );
  });

  it("renders tokens; tapping builds the skip-count chain; entry enables check", () => {
    let val: unknown = { counted: [], entry: null };
    const spec = count();
    const { rerender } = render(
      <WidgetRenderer spec={spec} value={val} onChange={(v) => (val = v)} disabled={false} seed="t" />
    );
    fireEvent.click(screen.getAllByRole("button", { name: /quarter, 25 cents/i })[0]);
    rerender(<WidgetRenderer spec={spec} value={val} onChange={(v) => (val = v)} disabled={false} seed="t" />);
    expect(screen.getByRole("status").textContent).toContain("25");
    expect(canCheck(spec, val)).toBe(false);
    fireEvent.change(screen.getByLabelText(/total in cents/i), { target: { value: "55" } });
    expect(canCheck(spec, val)).toBe(true);
    expect(correctAnswerText(spec)).toContain("55");
  });
});

describe("moneyBoard v2: change mode (purchase problems)", () => {
  const change = (over: object = {}) =>
    WidgetSpec.parse({
      type: "moneyBoard",
      mode: "change",
      prompt: "Build the change.",
      priceCents: 65,
      paidCents: 100,
      tray: [
        { cents: 25, label: "quarter", max: 3 },
        { cents: 10, label: "dime", max: 5 }
      ],
      commonTotals: [{ cents: 65, feedback: "that is the price, not the change" }],
      lowFeedback: "low",
      highFeedback: "high",
      successFeedback: "35 back",
      ...over
    }) as TWidget;

  it("grades against the DERIVED target (paid − price) with the price-rebuilt trap", () => {
    const w = change();
    expect(evaluate(w, { 25: 1, 10: 1 }).correct).toBe(true); // 35 = 100 − 65
    expect(evaluate(w, { 25: 1, 10: 4 }).feedback).toBe("that is the price, not the change"); // 65
    expect(evaluate(w, { 10: 1 }).feedback).toBe("low"); // 10
    expect(evaluate(w, { 25: 2, 10: 1 }).feedback).toBe("high"); // 60, no trap
  });

  it("integrity: paid must exceed price; authored targetCents must match the derivation", () => {
    expect(widgetIntegrityErrors(change({ paidCents: 60 }))[0]).toMatch(/exceed priceCents/);
    expect(widgetIntegrityErrors(change({ targetCents: 40 }))[0]).toMatch(/contradicts paid/);
  });

  it("renders the receipt strip", () => {
    const { container } = render(
      <WidgetRenderer spec={change()} value={{}} onChange={() => {}} disabled={false} seed="t" />
    );
    expect(container.querySelector('[data-testid="mb-receipt"]')?.textContent).toContain("65");
  });
});

const grid = () =>
  WidgetSpec.parse({
    type: "fractionGrid",
    prompt: "Build 2/3 × 4/5.",
    num1: 2,
    den1: 3,
    num2: 4,
    den2: 5,
    rowFeedback: "rows wrong",
    colFeedback: "cols wrong",
    commonBuilds: [{ rows: 8, cols: 8, shadeR: 6, shadeC: 6, feedback: "added denominators" }],
    successFeedback: "8/15 by construction"
  }) as TWidget;

describe("fractionGrid", () => {
  it("evaluates: exact build; trap; row diagnosis before column diagnosis", () => {
    const w = grid();
    expect(evaluate(w, { rows: 3, shadeR: 2, cols: 5, shadeC: 4 }).correct).toBe(true);
    expect(evaluate(w, { rows: 8, cols: 8, shadeR: 6, shadeC: 6 }).feedback).toBe("added denominators");
    expect(evaluate(w, { rows: 4, shadeR: 2, cols: 5, shadeC: 4 }).feedback).toBe("rows wrong");
    expect(evaluate(w, { rows: 3, shadeR: 2, cols: 4, shadeC: 4 }).feedback).toBe("cols wrong");
  });

  it("integrity rejects a commonBuild equal to the correct build", () => {
    const bad = WidgetSpec.parse({
      ...(grid() as object),
      commonBuilds: [{ rows: 3, cols: 5, shadeR: 2, shadeC: 4, feedback: "x" }]
    }) as TWidget;
    expect(widgetIntegrityErrors(bad)[0]).toMatch(/equals the correct build/);
  });

  it("renders; the overlap turns leaf exactly at the target build", () => {
    const right = { rows: 3, shadeR: 2, cols: 5, shadeC: 4 };
    const { container } = render(
      <WidgetRenderer spec={grid()} value={right} onChange={() => {}} disabled={false} seed="t" />
    );
    const overlap = container.querySelector('[data-testid="fg-overlap"]');
    expect(overlap?.getAttribute("data-at-target")).toBe("true");
    expect(overlap?.getAttribute("fill")).toBe("#2FA36B");
  });
});

describe("placeCompare view upgrade (6.4)", () => {
  const pc = (view?: string) =>
    WidgetSpec.parse({
      type: "placeCompare",
      prompt: "Compare 275 and 312.",
      left: "275",
      right: "312",
      answer: "lt",
      ...(view ? { view } : {}),
      gtFeedback: "g",
      eqFeedback: "e",
      successFeedback: "s"
    }) as TWidget;

  it("blocks view renders base-ten pieces; expanded renders the decomposition; chart renders neither", () => {
    const { container: b } = render(
      <WidgetRenderer spec={pc("blocks")} value={null} onChange={() => {}} disabled={false} seed="t" />
    );
    expect(b.querySelectorAll('[data-testid="pc-blocks"]').length).toBe(2);
    cleanup();
    const { container: x } = render(
      <WidgetRenderer spec={pc("expanded")} value={null} onChange={() => {}} disabled={false} seed="t" />
    );
    const rows = Array.from(x.querySelectorAll('[data-testid="pc-expanded"]')).map((n) => n.textContent);
    expect(rows).toEqual(["200 + 70 + 5", "300 + 10 + 2"]);
    cleanup();
    const { container: c } = render(
      <WidgetRenderer spec={pc()} value={null} onChange={() => {}} disabled={false} seed="t" />
    );
    expect(c.querySelector('[data-testid="pc-blocks"]')).toBeNull();
    expect(c.querySelector('[data-testid="pc-expanded"]')).toBeNull();
  });

  it("integrity rejects blocks view for decimals and 4-digit numbers", () => {
    const bad = WidgetSpec.parse({
      type: "placeCompare",
      prompt: "p",
      left: "0.4",
      right: "0.35",
      answer: "gt",
      view: "blocks",
      ltFeedback: "l",
      eqFeedback: "e",
      successFeedback: "s"
    }) as TWidget;
    expect(widgetIntegrityErrors(bad)[0]).toMatch(/whole numbers/);
  });
});

const cmp = (over: object = {}) =>
  WidgetSpec.parse({
    type: "fractionCompare",
    prompt: "Tap the bigger one.",
    left: { num: 2, den: 3 },
    right: { num: 2, den: 8 },
    answer: "left",
    rightFeedback: "big-number reflex",
    equalFeedback: "counts match, sizes don't",
    successFeedback: "piece size wins",
    ...over
  }) as TWidget;

describe("fractionCompare", () => {
  it("evaluates each wrong tap to its own diagnosis", () => {
    const w = cmp();
    expect(evaluate(w, "left").correct).toBe(true);
    expect(evaluate(w, "right").feedback).toBe("big-number reflex");
    expect(evaluate(w, "equal").feedback).toBe("counts match, sizes don't");
  });

  it("integrity re-derives the truth and enforces answer-slot discipline", () => {
    expect(widgetIntegrityErrors(cmp({ answer: "right", leftFeedback: "x", rightFeedback: undefined }))[0]).toMatch(
      /contradicts/
    );
    expect(widgetIntegrityErrors(cmp({ leftFeedback: "never-fires" }))[0]).toMatch(/can never fire/);
  });

  it("bars are NATIVE buttons: activation and pressed state come from the platform (s44)", () => {
    let val: unknown = null;
    render(<WidgetRenderer spec={cmp()} value={val} onChange={(v) => (val = v)} disabled={false} seed="t" />);
    const first = screen.getByRole("button", { name: /first bar/i });
    expect(first.tagName).toBe("BUTTON"); // the s44 fix: no more <g role=button>
    fireEvent.click(first); // native activation — what Enter/Space produce on a real button
    expect(val).toBe("left");
    cleanup();
    render(<WidgetRenderer spec={cmp()} value={"left"} onChange={() => {}} disabled={false} seed="t" />);
    expect(screen.getByRole("button", { name: /first bar/i }).getAttribute("aria-pressed")).toBe("true");
  });
});

const parity = (over: object = {}) =>
  WidgetSpec.parse({
    type: "oddEvenPairs",
    prompt: "Pair up 7.",
    n: 7,
    mode: "pair",
    answer: "odd",
    evenFeedback: "one left over means odd",
    successFeedback: "odd",
    ...over
  }) as TWidget;

describe("oddEvenPairs", () => {
  it("refuses an answer before pairing finishes; then grades the parity choice", () => {
    const w = parity();
    expect(evaluate(w, { paired: 1, choice: "odd" }).feedback).toMatch(/Pair up every chip/);
    expect(evaluate(w, { paired: 3, choice: "odd" }).correct).toBe(true);
    expect(evaluate(w, { paired: 3, choice: "even" }).feedback).toBe("one left over means odd");
  });

  it("onesDigit mode pairs only the ones (57 → 7 ones, 3 pairs, leftover)", () => {
    const w = parity({ n: 57, mode: "onesDigit" });
    expect(evaluate(w, { paired: 3, choice: "odd" }).correct).toBe(true);
    expect(evaluate(w, { paired: 2, choice: "odd" }).feedback).toMatch(/Pair up every chip/);
  });

  it("integrity: wrong authored parity, mode bounds, answer-slot discipline", () => {
    expect(widgetIntegrityErrors(parity({ answer: "even", oddFeedback: "x", evenFeedback: undefined }))[0]).toMatch(
      /contradicts/
    );
    expect(widgetIntegrityErrors(parity({ n: 57 }))[0]).toMatch(/caps at 20/);
    expect(widgetIntegrityErrors(parity({ oddFeedback: "never" }))[0]).toMatch(/can never fire/);
  });

  it("the odd/even buttons stay disabled until pairing completes", () => {
    let val: unknown = { paired: 0, choice: null };
    const spec = parity();
    const { rerender } = render(
      <WidgetRenderer spec={spec} value={val} onChange={(v) => (val = v)} disabled={false} seed="t" />
    );
    expect((screen.getByRole("button", { name: "odd" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /pair two/i }));
    fireEvent.click(screen.getByRole("button", { name: /pair two/i }));
    rerender(<WidgetRenderer spec={spec} value={{ paired: 3, choice: null }} onChange={(v) => (val = v)} disabled={false} seed="t" />);
    expect((screen.getByRole("button", { name: "odd" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
