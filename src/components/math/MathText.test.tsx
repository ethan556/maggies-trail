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

  // S240: widget.prompt (and explanationVariants, which route through the same component)
  // used the same **bold** convention as step `body` text but silently showed literal
  // asterisks — only `Rich` (body-only) understood them. cpr-01-03/i1's "**or**" was the
  // reading-caught instance; the fix is in MathProse itself, not a one-off prompt edit.
  it("renders **bold** as a strong element, not literal asterisks", () => {
    const { container } = render(<p><MathProse text="Shade every sector that is a multiple of 3 **or** a multiple of 4." /></p>);
    expect(container.textContent).not.toContain("*");
    const strong = container.querySelector("strong");
    expect(strong?.textContent).toBe("or");
    expect(container.textContent).toBe("Shade every sector that is a multiple of 3 or a multiple of 4.");
  });

  it("renders math shorthand inside a bold segment", async () => {
    const { container } = render(<p><MathProse text="Which grows faster, **2^4** or 3^2?" /></p>);
    const strong = container.querySelector("strong");
    expect(strong).toBeTruthy();
    await waitFor(() => expect(strong!.querySelectorAll(".katex")).toHaveLength(1));
    expect(container.querySelectorAll(".katex")).toHaveLength(2);
    expect(container.textContent).not.toContain("*");
  });

  it("handles multiple bold spans in one prompt", () => {
    const { container } = render(<p><MathProse text={'That is the number doing **both**. "At least one" includes **sport-only** and instrument-only.'} /></p>);
    const strongs = container.querySelectorAll("strong");
    expect(strongs).toHaveLength(2);
    expect(strongs[0].textContent).toBe("both");
    expect(strongs[1].textContent).toBe("sport-only");
    expect(container.textContent).not.toContain("*");
  });
});
