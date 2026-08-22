// @vitest-environment jsdom
/** ProofStrip renders canonical server values on the first frame; it never flashes zero. */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProofStrip } from "./ProofStrip";

afterEach(cleanup);

const strip = () => screen.getByText("courses", { exact: false }).closest("p") as HTMLElement;

describe("ProofStrip", () => {
  it("shows the real catalogue counts on the initial render", () => {
    render(<ProofStrip courseCount={129} lessonCount={1701} gradeSpan="K-Calc" />);
    expect(within(strip()).getByLabelText("129 courses")).toBeTruthy();
    expect(within(strip()).getByLabelText("1701 lessons")).toBeTruthy();
    expect(within(strip()).queryByLabelText("0 courses")).toBeNull();
    expect(within(strip()).queryByLabelText("0 lessons")).toBeNull();
    expect(within(strip()).getByText("K-Calc")).toBeTruthy();
    expect(within(strip()).getByText("state-aware feedback")).toBeTruthy();
  });

  it("formats large counts with a thousands separator", () => {
    render(<ProofStrip courseCount={129} lessonCount={1701} gradeSpan="K-Calc" />);
    expect(within(strip()).getByText("1,701")).toBeTruthy();
  });
});
