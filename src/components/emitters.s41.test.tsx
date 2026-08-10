// @vitest-environment jsdom
// Engine emitters (s41): each misconception tag fires from the REAL widget
// interaction it describes — and only on the state that witnesses it.
import { describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import type { ProcessEvent } from "@/lib/processEvents";

afterEach(cleanup);

function mount(raw: unknown) {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const events: ProcessEvent[] = [];
  let value: unknown = null;
  let rerenderFn: ((el: React.ReactElement) => void) | null = null;
  const ui = () => (
    <WidgetRenderer
      spec={spec}
      value={value}
      onChange={(v: unknown) => {
        value = v;
        rerenderFn?.(ui()); // null during the mount effect's init call; synced just below
      }}
      disabled={false}
      tone="neutral"
      seed="test:seed"
      onEvent={(e: ProcessEvent) => events.push(e)}
    />
  );
  const r = render(ui());
  rerenderFn = r.rerender;
  r.rerender(ui()); // reflect any value the widget initialized during its mount effect
  return { events };
}

describe("lineExplore — slope↔intercept confusion", () => {
  const spec = {
    type: "lineExplore",
    prompt: "Match the line.",
    targetSlope: 2,
    targetIntercept: 3,
    slopeStart: 2, // slope already correct — the gap is the intercept
    interceptStart: 0,
    successFeedback: "s",
    slopeFeedback: "sf",
    interceptFeedback: "if"
  };

  it("moving the already-correct slope tags slope-for-intercept", () => {
    const { events } = mount(spec);
    fireEvent.change(screen.getByRole("slider", { name: /slope/i }), { target: { value: "3" } });
    expect(events).toEqual([{ control: "m", dir: "away", tag: "slope-for-intercept" }]);
  });

  it("moving the intercept toward its target carries no tag", () => {
    const { events } = mount(spec);
    fireEvent.change(screen.getByRole("slider", { name: /intercept/i }), { target: { value: "1" } });
    expect(events).toEqual([{ control: "b", dir: "toward" }]);
  });
});

describe("plotPoint — x/y reversal", () => {
  const spec = {
    type: "plotPoint",
    prompt: "Mark the point.",
    cols: 3,
    rows: 3,
    targets: [{ x: 1, y: 2 }],
    missFeedback: "m",
    successFeedback: "s"
  };

  it("tapping the transposed cell tags xy-reversal", () => {
    const { events } = mount(spec);
    fireEvent.click(screen.getByRole("button", { name: /column 2.*row 1/i }));
    expect(events).toEqual([{ control: "cell", dir: "away", tag: "xy-reversal" }]);
  });

  it("tapping the target cell emits nothing", () => {
    const { events } = mount(spec);
    fireEvent.click(screen.getByRole("button", { name: /column 1.*row 2/i }));
    expect(events).toEqual([]);
  });
});

describe("pointEntry — x/y reversal", () => {
  const spec = {
    type: "pointEntry",
    prompt: "Enter the point.",
    answer: [3, -2],
    fallbackFeedback: "f"
  };

  it("completing the swapped pair tags once, on the transition", () => {
    const { events } = mount(spec);
    const [first, second] = screen.getAllByRole("textbox");
    fireEvent.change(first, { target: { value: "-2" } });
    fireEvent.change(second, { target: { value: "3" } });
    expect(events).toEqual([{ control: "pair", dir: "away", tag: "xy-reversal" }]);
  });

  it("the correct pair emits nothing", () => {
    const { events } = mount(spec);
    const [first, second] = screen.getAllByRole("textbox");
    fireEvent.change(first, { target: { value: "3" } });
    fireEvent.change(second, { target: { value: "-2" } });
    expect(events).toEqual([]);
  });
});

describe("matrixTransform — angle-direction", () => {
  const spec = {
    type: "matrixTransform",
    prompt: "Build the 90° counter-clockwise rotation.",
    ta: 0,
    tb: -1,
    tc: 1,
    td: 0,
    targetName: "a 90° counter-clockwise rotation",
    successFeedback: "s",
    swappedFeedback: "sw",
    signFeedback: "sg",
    fallbackFeedback: "f"
  };

  it("landing the whole matrix on the reverse rotation tags angle-direction once", () => {
    const { events } = mount(spec);
    // Identity → transpose of the target ([[0,1],[-1,0]]): a 1→0, b 0→1, c 0→-1, d 1→0.
    fireEvent.click(screen.getByRole("button", { name: /^lower the x-part of the first column$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^raise the x-part of the second column$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^lower the y-part of the first column$/i }));
    expect(events).toEqual([]); // not yet the full wrong-way matrix
    fireEvent.click(screen.getByRole("button", { name: /^lower the y-part of the second column$/i }));
    expect(events).toEqual([{ control: "matrix", dir: "away", tag: "angle-direction" }]);
  });
});
