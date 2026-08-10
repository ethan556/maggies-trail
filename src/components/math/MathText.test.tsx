// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MathProse } from "./MathText";

describe("MathProse", () => {
  it("renders power shorthand through KaTeX without changing the surrounding prompt", async () => {
    const { container } = render(<p><MathProse text="Simplify (2^4)^2 to 2^?. What is the exponent?" /></p>);
    expect(screen.getByText(/Simplify/)).toBeTruthy();
    await waitFor(() => expect(container.querySelectorAll(".katex")).toHaveLength(2));
    expect(container.querySelectorAll("math")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll(".katex-html")).map((node) => node.textContent).join(" ")).not.toContain("^");
    expect(container.textContent).toContain("What is the exponent?");
  });

  it("renders fractions, roots, and caret exponents as MathML without exposing TeX", async () => {
    const { container } = render(<p><MathProse text="Compare 1/2, sqrt(9), and (2^4)^2." /></p>);
    expect(container.textContent).toContain("Compare");
    expect(container.textContent).toContain("and");
    await waitFor(() => expect(container.querySelectorAll(".katex")).toHaveLength(3));
    expect(container.querySelectorAll("math")).toHaveLength(3);
    const visibleMath = Array.from(container.querySelectorAll(".katex-html")).map((node) => node.textContent).join(" ");
    expect(visibleMath).not.toContain("\\frac");
    expect(visibleMath).not.toContain("\\sqrt");
  });

  it("leaves ordinary prose as a contiguous text node", () => {
    render(<p><MathProse text="Count the equal groups before you answer." /></p>);
    expect(screen.getByText("Count the equal groups before you answer.")).toBeTruthy();
  });
});
