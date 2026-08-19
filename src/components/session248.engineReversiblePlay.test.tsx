// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";
import { SAMPLES } from "./widgetSamples";

const specOf = (type: TWidget["type"]): TWidget => {
  const raw = (SAMPLES as Array<{ type?: TWidget["type"] }>).find((sample) => sample.type === type);
  if (!raw) throw new Error(`No canonical sample for ${type}`);
  return WidgetSpec.parse(raw);
};

function Host({ spec, initial, holder, tone }: {
  spec: TWidget;
  initial: unknown;
  holder: { value: unknown };
  tone?: "info" | undefined;
}) {
  const [value, setValue] = useState(initial);
  holder.value = value;
  return (
    <WidgetRenderer
      spec={spec}
      value={value}
      onChange={(next) => {
        holder.value = next;
        setValue(next);
      }}
      disabled={false}
      tone={tone}
      seed="s248-reversible-play"
    />
  );
}

const mount = (spec: TWidget, initial: unknown, tone: "info" | null = "info") => {
  const holder = { value: initial };
  render(<Host spec={spec} initial={initial} holder={holder} tone={tone ?? undefined} />);
  return holder;
};

const expectCorrect = (spec: TWidget, holder: { value: unknown }, correct: boolean) => {
  expect(evaluate(spec, holder.value).correct).toBe(correct);
};

afterEach(cleanup);

describe("S248 reversible response contracts after verdict", () => {
  it("round-trips mcq through a native radio group", () => {
    const spec = specOf("mcq");
    const holder = mount(spec, "a");
    expectCorrect(spec, holder, true);
    fireEvent.click(screen.getByRole("radio", { name: /2 pencils and 5 pencils/i }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("radio", { name: /2 boxes with 5 pencils/i }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips numeric through its labelled editable input", () => {
    const spec = specOf("numeric");
    const holder = mount(spec, 12);
    const input = screen.getByRole("textbox", { name: /your answer/i });
    expect((input as HTMLInputElement).disabled).toBe(false);
    fireEvent.change(input, { target: { value: "11" } });
    expectCorrect(spec, holder, false);
    fireEvent.change(input, { target: { value: "12" } });
    expectCorrect(spec, holder, true);
  });

  it("round-trips fractionEntry through fraction fields and sign", () => {
    const spec = specOf("fractionEntry");
    const correct = { sign: -1, whole: 1, num: 1, den: 2 };
    const holder = mount(spec, correct);
    fireEvent.change(screen.getByRole("textbox", { name: "whole number" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("textbox", { name: "numerator" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("textbox", { name: "denominator" }), { target: { value: "2" } });
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: "negative sign" }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips pointEntry through independently labelled coordinates", () => {
    const spec = specOf("pointEntry");
    const holder = mount(spec, [-2, 3]);
    const first = screen.getByRole("textbox", { name: "first value" });
    const second = screen.getByRole("textbox", { name: "second value" });
    fireEvent.change(first, { target: { value: "3" } });
    fireEvent.change(second, { target: { value: "-2" } });
    expectCorrect(spec, holder, false);
    fireEvent.change(first, { target: { value: "-2" } });
    fireEvent.change(second, { target: { value: "3" } });
    expectCorrect(spec, holder, true);
  });

  it.each([
    ["placeCompare", "greater than", "less than"],
    ["rationalCompare", "greater than", "less than"],
  ] as const)("round-trips %s through native comparison radios", (type, correctName, wrongName) => {
    const spec = specOf(type);
    const holder = mount(spec, "gt");
    fireEvent.click(screen.getByRole("radio", { name: wrongName }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("radio", { name: correctName }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips absValueLine through its claim radios", () => {
    const spec = specOf("absValueLine");
    const holder = mount(spec, "a");
    fireEvent.click(screen.getByRole("radio", { name: "3" }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("radio", { name: "-4" }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips fractionCompare through native bar buttons", () => {
    const spec = specOf("fractionCompare");
    const holder = mount(spec, "left");
    fireEvent.click(screen.getByRole("button", { name: /second bar/i }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: /first bar/i }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips exactNumberLab while preserving inspected evidence", () => {
    const spec = specOf("exactNumberLab");
    const revealed = ["benchmark:left", "benchmark:right", "compare:exact"];
    const holder = mount(spec, { relation: "lt", revealed });
    expectCorrect(spec, holder, true);
    fireEvent.click(screen.getByRole("button", { name: ">" }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: "<" }));
    expectCorrect(spec, holder, true);
    expect((holder.value as { revealed: string[] }).revealed).toEqual(revealed);
  });

  it("round-trips dragOrder through keyboard-native move buttons", () => {
    const spec = specOf("dragOrder");
    const correct = ["n5", "n10", "n15", "n20"];
    const holder = mount(spec, correct);
    fireEvent.click(screen.getByRole("button", { name: /move 5 down/i }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: /move 5 up/i }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips dragBucket through per-item radio groups", () => {
    const spec = specOf("dragBucket");
    const correct = { s1: "mul", s2: "add", s3: "mul" };
    const holder = mount(spec, correct);
    const firstGroup = screen.getByRole("radiogroup", { name: /where does 4 boxes/i });
    fireEvent.click(within(firstGroup).getByRole("radio", { name: /add/i }));
    expectCorrect(spec, holder, false);
    fireEvent.click(within(firstGroup).getByRole("radio", { name: /multiply/i }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips matchPairs by unlinking and relinking", () => {
    const spec = specOf("matchPairs");
    const correct = { l1: "r3", l2: "r1", l3: "r2" };
    const holder = mount(spec, correct);
    fireEvent.click(screen.getByRole("button", { name: /2 nests, 3 eggs each, linked/i }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: /^2 nests, 3 eggs each$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^2 × 3$/i }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips buildExpression by removing and restoring a token", () => {
    const spec = specOf("buildExpression");
    const holder = mount(spec, ["t5", "tx", "t3"]);
    fireEvent.click(screen.getByRole("button", { name: "Remove 3" }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expectCorrect(spec, holder, true);
  });

  it("round-trips subitizeFlash only after observation is available", () => {
    const spec = specOf("subitizeFlash");
    const holder = mount(spec, 5);
    fireEvent.click(screen.getByRole("button", { name: /flash/i }));
    fireEvent.click(screen.getByRole("radio", { name: "4" }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("radio", { name: "5" }));
    expectCorrect(spec, holder, true);
  });

  it("keeps radicalCheck reversible but records that it has no authored use", () => {
    const spec = specOf("radicalCheck");
    const holder = mount(spec, 2);
    const slider = screen.getByRole("slider", { name: /candidate value/i });
    fireEvent.change(slider, { target: { value: "-1" } });
    expectCorrect(spec, holder, false);
    fireEvent.change(slider, { target: { value: "2" } });
    expectCorrect(spec, holder, true);
  });

  it("keeps toggleExplore reversible but records that it has no authored use", () => {
    const spec = specOf("toggleExplore");
    const holder = mount(spec, { sw1: true, sw2: true });
    fireEvent.click(screen.getByRole("button", { name: /switch 1/i }));
    expectCorrect(spec, holder, false);
    fireEvent.click(screen.getByRole("button", { name: /switch 1/i }));
    expectCorrect(spec, holder, true);
  });
});

describe("S248 ordered-disclosure boundary", () => {
  it("keeps steppedReveal forward-only because it has no learner answer state", () => {
    const spec = specOf("steppedReveal");
    const holder = mount(spec, 0);
    expectCorrect(spec, holder, false);
    for (let step = 1; step <= 3; step += 1) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`reveal step ${step}`, "i") }));
    }
    expectCorrect(spec, holder, true);
    expect(screen.queryByRole("button", { name: /hide|undo|wrong/i })).toBeNull();
  });
});

describe("S248 active-state answer integrity", () => {
  it.each([
    "numeric", "mcq", "fractionEntry", "pointEntry", "placeCompare", "rationalCompare",
    "absValueLine", "fractionCompare", "exactNumberLab", "dragOrder", "dragBucket",
    "matchPairs", "buildExpression", "subitizeFlash",
  ] as const)("does not add a pre-verdict answer ghost to %s", (type) => {
    const spec = specOf(type);
    mount(spec, null, null);
    expect(document.querySelector('[data-testid$="-ghost"]')).toBeNull();
    expect(document.body.textContent).not.toMatch(/correct answer|Correct:/);
  });
});
