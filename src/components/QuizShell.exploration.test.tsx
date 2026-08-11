// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuizShell, { type Servable } from "./QuizShell";
import { SliderSpec } from "@/lib/schema";

const item: Servable = {
  key: "groups-review",
  widget: SliderSpec.parse({
    type: "slider",
    prompt: "Build 5 groups of 4.",
    min: 0,
    max: 8,
    step: 1,
    start: 1,
    target: 5,
    visual: "groups",
    groupSize: 4,
    unitLabel: "berries",
    lowFeedback: "Too few groups.",
    highFeedback: "Too many groups.",
    successFeedback: "Five groups is the checkpoint.",
  }),
};

describe("QuizShell post-verdict exploration", () => {
  it("keeps review/practice widgets live without recording exploration as another result", () => {
    const onResult = vi.fn();
    render(<QuizShell items={[item]} onResult={onResult} />);

    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(slider.disabled).toBe(false);
    expect(screen.getByText(/Checkpoint saved. Keep exploring this model/)).toBeTruthy();

    fireEvent.change(slider, { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: "Check this state" }));
    expect(screen.getByText("This state does not meet the target")).toBeTruthy();
    expect(screen.getByText("Too many groups.")).toBeTruthy();
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Finish" })).toBeTruthy();
  });
});
