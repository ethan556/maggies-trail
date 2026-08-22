// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WidgetSpec } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";

describe("mathematical accessible names", () => {
  it("speaks MCQ prompts and options without exposing caret authoring syntax", () => {
    const spec = WidgetSpec.parse({
      type: "mcq",
      prompt: "Which grows faster: 2^x or x²?",
      options: [
        { id: "exponential", label: "2^x", correct: true, feedback: "The exponent varies." },
        { id: "quadratic", label: "x²", correct: false, feedback: "This is polynomial growth." },
      ],
    });

    render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} seed="a11y-math" />);

    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-label")).toBe("Which grows faster: 2 raised to x or x squared?");
    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("aria-label"));
    expect(names).toContain("2 raised to x");
    expect(names).toContain("x squared");
    expect(names.join(" ")).not.toContain("^");
  });
});
