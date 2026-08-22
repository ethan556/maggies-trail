// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

describe("S246 exponential/logarithm visual maths", () => {
  it("renders the graph equation and live power through KaTeX with no visible caret", async () => {
    const spec = WidgetSpec.parse({
      type: "expLogExplore",
      prompt: "Slide the base until b^3 lands on the ring at 8.",
      mode: "exponential",
      x: 3,
      targetBase: 2,
      startBase: 3,
      showMirror: true,
      successFeedback: "The curve lands on 8.",
      lowFeedback: "Raise the base.",
      highFeedback: "Lower the base.",
    }) as TWidget;
    const { container } = render(
      <WidgetRenderer spec={spec} value={3} onChange={vi.fn()} disabled={false} tone="neutral" />,
    );
    await waitFor(() => expect(container.querySelectorAll(".katex").length).toBeGreaterThanOrEqual(3));
    expect(container.querySelector('[data-testid="exp-log-equation"] .katex')).not.toBeNull();
    const visibleMath = Array.from(container.querySelectorAll(".katex-html"), (node) => node.textContent).join(" ");
    expect(visibleMath).not.toContain("^");
    expect(Array.from(container.querySelectorAll("svg text"), (node) => node.textContent).join(" ")).not.toContain("^");
    expect(container.querySelector('[data-testid="exp-log-equation"] foreignObject')).toBeNull();
    expect(container.querySelector('[data-testid="exp-log-equation"]')?.tagName.toLowerCase()).toBe("foreignobject");
  });
});
