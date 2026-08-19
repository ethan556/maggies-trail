// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import lesson from "../../content/courses/decimal-fluency-g5/lessons/g5d-03-04.json";
import { FIGURES } from "./figures";

describe("S248 metric length ladder truth", () => {
  afterEach(cleanup);

  it("shows true equal-length relationships in visible and accessible text", () => {
    const Figure = FIGURES["mc-length-ladder"];
    const { container, getByText } = render(<Figure />);
    const svg = container.querySelector("svg");

    expect(getByText("equal lengths")).toBeTruthy();
    expect(getByText(/10 mm/).textContent).toBe("10 mm = 1 cm");
    expect(getByText(/100 cm/).textContent).toBe("100 cm = 1 m");
    expect(getByText(/1000 m/).textContent).toBe("1000 m = 1 km");
    expect(svg?.textContent).not.toContain("×10 →");
    expect(svg?.getAttribute("aria-label")).toContain("100 centimeters make a meter");
  });

  it("agrees with the larger-unit lesson direction", () => {
    const concept = lesson.steps.find((step) => step.id === "c2");
    expect(concept?.figure).toBe("mc-length-ladder");
    expect(concept?.body).toContain("Divide centimeters by 100");
    expect(concept?.narration).toBe(concept?.body);
  });
});
