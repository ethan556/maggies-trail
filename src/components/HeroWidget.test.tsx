// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HeroWidget from "./HeroWidget";

describe("HeroWidget equal-groups model", () => {
  it("shows the groups and total changing together", () => {
    render(<HeroWidget />);

    const model = screen.getByRole("list", { name: "1 group built; target 5; 4 berries in all" });
    expect(within(model).getByText("Group 1: 4 berries")).toBeTruthy();
    expect(within(model).getByText("Group 2: empty")).toBeTruthy();
    expect(screen.getByText("4 total")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Add a group of 4" }));

    expect(screen.getByRole("list", { name: "2 groups built; target 5; 8 berries in all" })).toBeTruthy();
    expect(screen.getByText("8 total")).toBeTruthy();
  });

  it("saves the correct checkpoint but stays open for overshoot and wrong-state feedback", () => {
    render(<HeroWidget />);

    const add = screen.getByRole("button", { name: "Add a group of 4" });
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(add);
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    expect(screen.getByRole("status").textContent).toContain("Correct checkpoint: 5 equal groups of 4 make 20");
    expect((add as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(add);
    expect(screen.getByRole("list", { name: "6 groups built; target 5; 24 berries in all" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status").textContent).toContain("more than 5 groups");
  });

  it("can explore below the target all the way to zero groups", () => {
    render(<HeroWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Remove row" }));
    expect(screen.getByRole("list", { name: "0 groups built; target 5; 0 berries in all" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status").textContent).toContain("Not there yet");
  });

  it("keeps every direct-manipulation target keyboard native and at least 44px high", () => {
    const { container } = render(<HeroWidget />);
    const controls = [...container.querySelectorAll("button")];
    expect(controls.length).toBeGreaterThanOrEqual(3);
    expect(controls.every((control) => control.className.includes("min-h-11"))).toBe(true);
  });
});
