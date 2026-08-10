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
});
