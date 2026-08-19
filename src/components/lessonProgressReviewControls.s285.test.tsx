// @vitest-environment jsdom

import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StepSegments } from "./ui";

afterEach(cleanup);

describe("completed-item review controls", () => {
  it("makes only completed segments selectable and names read-only review", () => {
    const onSelectCompleted = vi.fn();
    render(
      <StepSegments
        total={5}
        current={3}
        reviewingIndex={1}
        onSelectCompleted={onSelectCompleted}
        label="Step 4 of 5; completed items can be opened in read-only review"
      />,
    );

    const strip = screen.getByRole("group", { name: /completed items can be opened in read-only review/i });
    expect(strip.getAttribute("data-progress-reviewing")).toBe("2");
    expect(screen.getAllByRole("button", { name: /Review completed item/i })).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Review completed item 2 of 5" }).getAttribute("aria-current")).toBe("step");
    expect(screen.queryByRole("button", { name: /item 4 of 5/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /item 5 of 5/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Review completed item 3 of 5" }));
    expect(onSelectCompleted).toHaveBeenCalledWith(2);
  });
});
