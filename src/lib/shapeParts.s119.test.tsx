// @vitest-environment jsdom
/**
 * S119 — `shapeParts`: counting a figure's parts by touching them.
 *
 * "How many sides does a hexagon have?" was a numeric box beside no hexagon. A six-year-old answers
 * it by putting a finger on each side and keeping track — a manipulation, and the one that actually
 * practises one-to-one correspondence and cardinality. `tapDiagram` could not serve these lessons
 * because it places icons on a BLANK canvas: it would have asked a child to tap the sides of a
 * triangle that was not drawn.
 *
 * The property worth pinning hardest is that grading is set-based, not count-based. A bare number
 * cannot distinguish "six" from "counted one corner twice and missed another" — a set can, and
 * that distinction is the entire pedagogical point of counting by touch.
 *
 * Part counts are checked against geometry stated in the test, never read back from the helper.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, widgetIntegrityErrors, shapePartCount, type TWidget } from "./schema";
import { evaluate, canCheck, correctAnswerText } from "./evaluate";
import { describeWidgetState } from "./describeState";

afterEach(() => cleanup());

const base = {
  type: "shapeParts" as const,
  prompt: "p",
  shape: "polygon" as const,
  sides: 6,
  part: "sides" as const,
  successFeedback: "ok",
  missedFeedback: "some left",
  doubleCountFeedback: "counted twice"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

function Host({ s }: { s: TWidget }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={s} value={v} disabled={false} onChange={setV} />;
}

describe("shapePartCount matches the geometry, stated here", () => {
  // Euler's formula V - E + F = 2 holds for every convex polyhedron; asserting it independently
  // is a check on the whole table rather than on one entry at a time.
  const solids: Array<[("cube" | "rectangularPrism" | "squarePyramid"), number, number, number]> = [
    ["cube", 8, 12, 6],
    ["rectangularPrism", 8, 12, 6],
    ["squarePyramid", 5, 8, 5]
  ];
  it.each(solids)("%s has V=%i E=%i F=%i and satisfies Euler", (shape, V, E, F) => {
    expect(shapePartCount(shape, undefined, "vertices")).toBe(V);
    expect(shapePartCount(shape, undefined, "faces")).toBe(F);
    expect(V - E + F).toBe(2);
  });

  it("a polygon has as many sides as corners", () => {
    for (let n = 3; n <= 10; n++) {
      expect(shapePartCount("polygon", n, "sides")).toBe(n);
      expect(shapePartCount("polygon", n, "corners")).toBe(n);
    }
  });

  it("a cylinder reports its two FLAT faces and no vertices", () => {
    expect(shapePartCount("cylinder", undefined, "faces")).toBe(2);
    expect(shapePartCount("cylinder", undefined, "vertices")).toBe(0);
  });

  it("covers the lessons' own answers", () => {
    expect(shapePartCount("polygon", 3, "sides")).toBe(3); // smg1-01-01/i1
    expect(shapePartCount("polygon", 6, "sides")).toBe(6); // smg1-01-01/i2
    expect(shapePartCount("polygon", 5, "corners")).toBe(5); // smg1-01-01/i3
    expect(shapePartCount("polygon", 7, "sides")).toBe(7); // ssg2-01-01/i1
    expect(shapePartCount("cube", undefined, "faces")).toBe(6); // smg1-01-02/i2
    expect(shapePartCount("cylinder", undefined, "faces")).toBe(2); // smg1-01-02/i3
    expect(shapePartCount("cube", undefined, "vertices")).toBe(8); // smg1-01-03/i1
    expect(shapePartCount("squarePyramid", undefined, "faces")).toBe(5); // ssg2-01-02/i1
    expect(shapePartCount("squarePyramid", undefined, "vertices")).toBe(5); // ssg2-01-02/i2
  });
});

describe("grading is SET-based — the reason to count by touch", () => {
  const s = spec(); // hexagon, 6 sides

  it("every part marked exactly once is correct", () => {
    expect(evaluate(s, [0, 1, 2, 3, 4, 5]).correct).toBe(true);
  });

  it("order does not matter", () => {
    expect(evaluate(s, [5, 0, 3, 1, 4, 2]).correct).toBe(true);
  });

  it("THE POINT: six taps that double-count one and miss another is NOT correct", () => {
    const sneaky = [0, 0, 1, 2, 3, 4]; // six taps, right total, wrong counting
    expect(sneaky.length).toBe(6);
    const r = evaluate(s, sneaky);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe(base.doubleCountFeedback);
  });

  it("stopping early gets the missed diagnosis", () => {
    expect(evaluate(s, [0, 1, 2])).toEqual({ correct: false, feedback: base.missedFeedback });
  });

  it("tapping past the total gets the double-count diagnosis", () => {
    expect(evaluate(s, [0, 1, 2, 3, 4, 5, 5])).toEqual({ correct: false, feedback: base.doubleCountFeedback });
  });

  it("refuses to grade nothing", () => {
    expect(evaluate(s, []).correct).toBe(false);
    expect(evaluate(s, null).correct).toBe(false);
  });

  it("canCheck wants at least one tap", () => {
    expect(canCheck(s, [0])).toBe(true);
    expect(canCheck(s, [])).toBe(false);
    expect(canCheck(s, 6)).toBe(false);
  });

  it("correctAnswerText names the count and the part", () => {
    expect(correctAnswerText(s)).toBe("6 sides");
  });
});

describe("integrity gate", () => {
  it("accepts well-formed specs", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
    expect(widgetIntegrityErrors(spec({ shape: "cube", sides: undefined, part: "vertices" }))).toEqual([]);
  });

  it("refuses a polygon with no sides count", () => {
    expect(widgetIntegrityErrors(spec({ sides: undefined })).join(" ")).toMatch(/needs a `sides` count/);
  });

  it("refuses a solid carrying a sides count", () => {
    expect(widgetIntegrityErrors(spec({ shape: "cube", part: "faces" })).join(" ")).toMatch(/only applies to the polygon/);
  });

  it("refuses vocabulary that does not fit the dimension", () => {
    expect(widgetIntegrityErrors(spec({ shape: "cube", sides: undefined, part: "sides" })).join(" ")).toMatch(
      /faces and vertices, not sides/
    );
    expect(widgetIntegrityErrors(spec({ part: "faces" })).join(" ")).toMatch(/sides and corners, not faces/);
  });

  it("refuses a shape with nothing countable — a cylinder has no vertices", () => {
    expect(widgetIntegrityErrors(spec({ shape: "cylinder", sides: undefined, part: "vertices" })).join(" ")).toMatch(
      /nothing to count/
    );
  });
});

describe("rendering and accessibility", () => {
  it("draws one tap target per part, as REAL buttons", () => {
    const { container } = render(<Host s={spec()} />);
    const buttons = container.querySelectorAll("button[aria-pressed]");
    expect(buttons.length).toBe(6);
    buttons.forEach((b) => expect(b.tagName).toBe("BUTTON"));
  });

  it("names each part individually and reports its counted state", () => {
    render(<Host s={spec()} />);
    const first = screen.getByLabelText("side 1");
    expect(first.getAttribute("aria-pressed")).toBe("false");
  });

  it("uses each shape's own vocabulary in the labels", () => {
    render(<Host s={spec({ shape: "cube", sides: undefined, part: "vertices" })} />);
    expect(screen.getByLabelText("vertex 1")).toBeTruthy();
    cleanup();
    render(<Host s={spec({ sides: 5, part: "corners" })} />);
    expect(screen.getByLabelText("corner 1")).toBeTruthy();
  });

  it("draws all 8 cube vertices, including the ones round the back", () => {
    const { container } = render(<Host s={spec({ shape: "cube", sides: undefined, part: "vertices" })} />);
    expect(container.querySelectorAll("button[aria-pressed]").length).toBe(8);
    // the hidden edges are drawn dashed so the back corners are findable
    expect(container.querySelector('path[stroke-dasharray]')).toBeTruthy();
  });

  it("offers a start-over control", () => {
    render(<Host s={spec()} />);
    expect(screen.getByRole("button", { name: /start over/i })).toBeTruthy();
  });

  it("describeWidgetState reports taps AND distinct parts, so a double-count is visible", () => {
    const d = describeWidgetState(spec(), [0, 0, 1]);
    expect(d).toContain("6 sides");
    expect(d).toMatch(/3 taps/);
    expect(d).toMatch(/2 distinct/);
  });
});
