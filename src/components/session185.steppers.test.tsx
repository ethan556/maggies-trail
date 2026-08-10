// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { WidgetSpec, type TWidget } from "../lib/schema";
import { WidgetRenderer } from "./widgets";

const base = {
  type: "barBuilder", prompt: "Tally the votes: Cats 7, Dogs 4.",
  categories: ["Cats", "Dogs"], target: [7, 4], maxVal: 10, step: 1, histogram: false,
  successFeedback: "done", partialFeedback: "compare each row against its count",
};

describe("S185 barBuilder stepper displays (DOM)", () => {
  it("tally/pictograph steppers: keyboard-reachable native buttons mutate counts and clamp at bounds", () => {
    // The keyboard gallery gate covers the FIRST barBuilder sample (bar display, sliders); this
    // gate covers the S185 stepper path the tally/pictograph displays introduce.
    for (const display of ["tally", "pictograph"] as const) {
      let value: number[] = [0, 0];
      const spec = WidgetSpec.parse({ ...base, display }) as TWidget;
      const { unmount, rerender } = render(
        React.createElement(WidgetRenderer, {
          spec, value, disabled: false, tone: "neutral",
          onChange: (v: unknown) => { value = v as number[]; },
        }),
      );
      const add = screen.getAllByRole("button", { name: /add one to Cats/i })[0];
      expect(add.tagName).toBe("BUTTON");
      fireEvent.click(add);
      expect(value).toEqual([1, 0]);
      rerender(React.createElement(WidgetRenderer, {
        spec, value, disabled: false, tone: "neutral",
        onChange: (v: unknown) => { value = v as number[]; },
      }));
      fireEvent.click(screen.getAllByRole("button", { name: /remove one from Cats/i })[0]);
      expect(value).toEqual([0, 0]);
      // clamp: remove at zero stays disabled
      rerender(React.createElement(WidgetRenderer, {
        spec, value: [0, 0], disabled: false, tone: "neutral", onChange: () => {},
      }));
      expect((screen.getAllByRole("button", { name: /remove one from Cats/i })[0] as HTMLButtonElement).disabled).toBe(true);
      unmount();
    }
  });
  it("ghost chip renders only at tone info with a mismatch", () => {
    const spec = WidgetSpec.parse({ ...base, display: "tally" }) as TWidget;
    const a = render(React.createElement(WidgetRenderer, { spec, value: [1, 0], disabled: true, tone: "info", onChange: () => {} }));
    expect(screen.queryByTestId("bb-ghost")).not.toBeNull();
    a.unmount();
    const b = render(React.createElement(WidgetRenderer, { spec, value: [7, 4], disabled: true, tone: "info", onChange: () => {} }));
    expect(screen.queryByTestId("bb-ghost")).toBeNull();
    b.unmount();
    const c = render(React.createElement(WidgetRenderer, { spec, value: [1, 0], disabled: false, tone: "neutral", onChange: () => {} }));
    expect(screen.queryByTestId("bb-ghost")).toBeNull();
    c.unmount();
  });
});
