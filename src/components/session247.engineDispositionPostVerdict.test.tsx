// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";
import { SAMPLES } from "./widgetSamples";

const specOf = (type: TWidget["type"]): TWidget => {
  const raw = (SAMPLES as unknown as Array<{ type?: TWidget["type"] }>).find((sample) => sample.type === type);
  if (!raw) throw new Error(`No widget sample for ${type}`);
  return WidgetSpec.parse(raw);
};

function PostVerdictHost({ spec, initial, holder }: {
  spec: TWidget;
  initial: unknown;
  holder: { value: unknown };
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
      tone="info"
    />
  );
}

const mount = (spec: TWidget, initial: unknown) => {
  const holder = { value: initial };
  render(<PostVerdictHost spec={spec} initial={initial} holder={holder} />);
  return holder;
};

afterEach(cleanup);

describe("S247 retained engine dispositions — post-verdict play stays reversible and ungraded", () => {
  it("compassConstruct can leave and regain the correct radius after reveal", () => {
    const spec = specOf("compassConstruct");
    const holder = mount(spec, 5);
    expect(evaluate(spec, holder.value).correct).toBe(true);

    const slider = screen.getByRole("slider", { name: /how wide the compass is opened/i });
    expect(slider.hasAttribute("disabled")).toBe(false);
    fireEvent.change(slider, { target: { value: "6" } });
    expect(evaluate(spec, holder.value).correct).toBe(false);
    fireEvent.change(slider, { target: { value: "5" } });
    expect(evaluate(spec, holder.value).correct).toBe(true);
  });

  it("systemsExplore can move off and back onto the intersection after reveal", () => {
    const spec = specOf("systemsExplore");
    const holder = mount(spec, { x: 2, y: 3 });
    expect(evaluate(spec, holder.value).correct).toBe(true);

    const x = screen.getByRole("slider", { name: /point x/i });
    expect(x.hasAttribute("disabled")).toBe(false);
    fireEvent.change(x, { target: { value: "1" } });
    expect(evaluate(spec, holder.value).correct).toBe(false);
    fireEvent.change(x, { target: { value: "2" } });
    expect(evaluate(spec, holder.value).correct).toBe(true);
  });

  it("matrixTransform can perturb and restore a correct matrix after reveal", () => {
    const spec = specOf("matrixTransform");
    const correct = { a: 0, b: -1, c: 1, d: 0 };
    const holder = mount(spec, correct);
    expect(evaluate(spec, holder.value).correct).toBe(true);

    const raiseA = screen.getByRole("button", { name: /raise the x-part of the first column/i });
    const lowerA = screen.getByRole("button", { name: /lower the x-part of the first column/i });
    expect(raiseA.hasAttribute("disabled")).toBe(false);
    fireEvent.click(raiseA);
    expect(evaluate(spec, holder.value).correct).toBe(false);
    fireEvent.click(lowerA);
    expect(evaluate(spec, holder.value).correct).toBe(true);
  });
});
