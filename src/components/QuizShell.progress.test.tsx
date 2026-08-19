// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SliderSpec } from "@/lib/schema";
import QuizShell, { type Servable } from "./QuizShell";

afterEach(cleanup);

const item = (key: string, target: number): Servable => ({
  key,
  widget: SliderSpec.parse({
    type: "slider",
    prompt: `Choose ${target}.`,
    min: 0,
    max: 5,
    step: 1,
    start: 0,
    target,
    visual: "groups",
    groupSize: 1,
    unitLabel: "counters",
    lowFeedback: "Too low.",
    highFeedback: "Too high.",
    successFeedback: "That is it."
  })
});

function strip(label: string) {
  return screen.getByRole("img", { name: label });
}

describe("QuizShell progress strip", () => {
  it("keeps retry on the same current item, then advances completed/current/remaining counts together", () => {
    render(<QuizShell items={[item("first", 2), item("second", 3)]} />);

    const initial = strip("Item 1 of 2");
    expect(initial.getAttribute("data-progress-current")).toBe("1");
    expect(initial.getAttribute("data-progress-completed")).toBe("0");
    expect(initial.getAttribute("data-progress-remaining")).toBe("1");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    const retry = strip("Item 1 of 2");
    expect(retry.getAttribute("data-progress-current")).toBe("1");
    expect(retry.getAttribute("data-progress-completed")).toBe("0");
    expect(retry.getAttribute("data-progress-remaining")).toBe("1");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const next = strip("Item 2 of 2");
    expect(next.getAttribute("data-progress-current")).toBe("2");
    expect(next.getAttribute("data-progress-completed")).toBe("1");
    expect(next.getAttribute("data-progress-remaining")).toBe("0");
  });
});