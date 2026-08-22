// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/palette";
import LandingHero, { LANDING_GRAPH_COLORS } from "./LandingHero";

afterEach(cleanup);

const renderHero = () => render(<LandingHero />);

describe("S251 landing hours–miles graph labeling and accessibility", () => {
  it("renders complete tick-aligned graph paper, scales, origin, units, and all data marks", () => {
    renderHero();
    const graph = screen.getByTestId("landing-trip-graph");

    expect(graph.getAttribute("viewBox")).toBe("0 0 460 320");
    expect(graph.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
    expect(graph.classList.contains("w-full")).toBe(true);
    expect(graph.classList.contains("h-auto")).toBe(true);
    expect(graph.querySelectorAll('[data-grid="minor"]')).toHaveLength(10);
    expect(graph.querySelectorAll('[data-grid="major"]')).toHaveLength(10);
    expect(graph.querySelectorAll('[data-axis-tick="x"]')).toHaveLength(11);
    expect(graph.querySelectorAll('[data-axis-tick="y"]')).toHaveLength(11);
    expect(
      [...graph.querySelectorAll('[data-axis-label="x"]')].map(
        (node) => node.textContent,
      ),
    ).toEqual(["0", "2", "4", "6", "8", "10"]);
    expect(
      [...graph.querySelectorAll('[data-axis-label="y"]')].map(
        (node) => node.textContent,
      ),
    ).toEqual(["8", "16", "24", "32", "40"]);
    expect(
      graph.querySelectorAll('[data-axis-label="x"]')[0]?.textContent,
    ).toBe("0");
    expect(
      [...graph.querySelectorAll('[data-axis-label="y"]')].map(
        (node) => node.textContent,
      ),
    ).not.toContain("0");
    expect(
      graph.querySelectorAll('[data-testid="landing-data-mark"]'),
    ).toHaveLength(11);
    expect(
      within(graph).getAllByText("Distance traveled over time"),
    ).toHaveLength(2);
    expect(within(graph).getByText("Time (hours)")).toBeTruthy();
    expect(within(graph).getByText("Distance (miles)")).toBeTruthy();

    const layers = [...graph.querySelectorAll("[data-layer]")].map((node) =>
      node.getAttribute("data-layer"),
    );
    expect(layers).toEqual(["grid", "axes", "data", "labels"]);
  });

  it("gives the graph a distinct role, name, stateful description, and table semantics in parity", () => {
    renderHero();
    const graph = screen.getByRole("img", {
      name: "Distance traveled over time",
    });
    const descriptionId = graph.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)?.textContent).toContain(
      "time from 0 to 10 hours and distance from 0 to 40 miles",
    );
    expect(document.getElementById(descriptionId!)?.textContent).toContain(
      "current orange point is 1 hour and 4 miles",
    );

    const table = screen.getByRole("table", { name: "Nearby trip values" });
    expect(
      within(table)
        .getByRole("columnheader", { name: "Time (hours)" })
        .getAttribute("scope"),
    ).toBe("col");
    expect(
      within(table)
        .getByRole("columnheader", { name: "Distance (miles)" })
        .getAttribute("scope"),
    ).toBe("col");
    const currentRow = within(table)
      .getAllByRole("row")
      .find((row) => row.getAttribute("aria-current") === "true");
    expect(currentRow).toBeTruthy();
    expect(
      within(currentRow!)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["1", "4"]);
  });

  it("keeps table, visible point label, readout, slider value text, and accessible description synchronized", () => {
    const { container } = renderHero();
    const slider = screen.getByRole("slider", { name: "Trip time (hours)" });
    fireEvent.change(slider, { target: { value: "6" } });

    expect(slider.getAttribute("aria-valuetext")).toBe("6 hours, 24 miles");
    expect(
      screen.getByText("In 6 hours, the rider travels 24 miles."),
    ).toBeTruthy();
    expect(screen.getAllByText("(6 h, 24 mi)").length).toBeGreaterThanOrEqual(
      2,
    );
    const graph = screen.getByTestId("landing-trip-graph");
    const description = document.getElementById(
      graph.getAttribute("aria-describedby")!,
    );
    expect(description?.textContent).toContain(
      "current orange point is 6 hours and 24 miles",
    );
    const point = screen.getByTestId("landing-current-point");
    expect(Number(point.getAttribute("cx"))).toBeCloseTo(279.2, 5);
    expect(Number(point.getAttribute("cy"))).toBeCloseTo(119.6, 5);
    expect(container.textContent).not.toContain("^");
    expect(container.textContent).toContain("d = 4t");
  });

  it("keeps load-bearing graph ink above the WCAG non-text contrast threshold", () => {
    expect(
      contrastRatio(LANDING_GRAPH_COLORS.ink, LANDING_GRAPH_COLORS.paper),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(LANDING_GRAPH_COLORS.data, LANDING_GRAPH_COLORS.paper),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(LANDING_GRAPH_COLORS.current, LANDING_GRAPH_COLORS.paper),
    ).toBeGreaterThanOrEqual(3);
  });
});
