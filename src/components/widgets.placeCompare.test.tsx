// @vitest-environment jsdom
/** placeCompare renderer — place headers, symbol choice, deciding-place color roles. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { WidgetRenderer, type StageTone } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

beforeEach(() => cleanup());

const spec = (over: Record<string, unknown> = {}): TWidget =>
  WidgetSpec.parse({
    type: "placeCompare",
    prompt: "Compare: 63 __ 38",
    left: "63",
    right: "38",
    answer: "gt",
    ltFeedback: "Check the tens.",
    eqFeedback: "They aren't equal.",
    successFeedback: "Yes — 6 tens beats 3 tens.",
    ...over
  });

function show(s: TWidget, value: unknown, tone?: StageTone) {
  return render(<WidgetRenderer spec={s} value={value} onChange={() => {}} disabled={false} tone={tone} />);
}

describe("placeCompare renderer", () => {
  it("renders place headers above the digit cells when placeLabels is on", () => {
    const { container } = show(spec(), null);
    const heads = Array.from(container.querySelectorAll("span")).map((s) => s.textContent);
    expect(heads).toContain("tens");
    expect(heads).toContain("ones");
  });
  it("suppresses headers when placeLabels is off", () => {
    const { container } = show(spec({ placeLabels: false }), null);
    const heads = Array.from(container.querySelectorAll("span")).map((s) => s.textContent);
    expect(heads).not.toContain("tens");
  });
  it("symbol buttons form a radiogroup and report the selection", () => {
    const changes: unknown[] = [];
    render(
      <WidgetRenderer spec={spec()} value={null} onChange={(v) => changes.push(v)} disabled={false} />
    );
    fireEvent.click(screen.getByRole("radio", { name: "greater than" }));
    expect(changes).toEqual(["gt"]);
  });
  it("on a wrong check the deciding place lights berry with a place cue", () => {
    const { container } = show(spec(), "lt", "error");
    expect(container.querySelector(".border-berry")).toBeTruthy();
    expect(container.textContent).toContain("look at the tens place");
  });
  it("on success the deciding place lights leaf with a confirming cue", () => {
    const { container } = show(spec(), "gt", "success");
    expect(container.querySelector(".border-leaf")).toBeTruthy();
    expect(container.querySelector(".border-berry")).toBeFalsy();
    expect(container.textContent).toContain("the tens place decided it");
  });
  it("an equal pair on success leafs every cell and says every place matches", () => {
    const eq = spec({ left: "77", right: "77", answer: "eq", eqFeedback: undefined, ltFeedback: "l", gtFeedback: "g" });
    const { container } = show(eq, "eq", "success");
    const leafCells = container.querySelectorAll(".border-leaf").length;
    expect(leafCells).toBeGreaterThanOrEqual(4); // 2 digits × 2 numbers
    expect(container.textContent).toContain("every place matches");
  });
  it("decimal pairs render empty dashed cells for missing trailing places (never zeros)", () => {
    const d = spec({ left: "0.7", right: "0.68", answer: "gt", gtFeedback: undefined, ltFeedback: "pad", eqFeedback: "not equal" });
    const { container } = show(d, null);
    expect(container.querySelectorAll(".border-dashed").length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toContain("0.70");
  });
});
