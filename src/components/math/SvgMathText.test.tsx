// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SvgMathText } from "./SvgMathText";

describe("SvgMathText", () => {
  it("uses the shared KaTeX renderer inside SVG without exposing caret notation", async () => {
    const { container } = render(
      <svg aria-label="y equals three to the power x">
        <SvgMathText x={100} y={30} tex="y = 3^x" fallback="y = 3ˣ" />
      </svg>,
    );
    await waitFor(() => expect(container.querySelector(".katex")).not.toBeNull());
    expect(container.querySelector("foreignObject")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".katex-html")?.textContent).not.toContain("^");
  });
});
