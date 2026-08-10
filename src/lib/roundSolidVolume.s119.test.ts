/**
 * S119 — `volumeBuilder` round solids: cylinder, cone and sphere.
 *
 * The three G8 lessons sit in a relationship that three formulas on a page cannot show. At r = 3,
 * h = 4 a cylinder is 36π and a cone is exactly a third of it, 12π — while a sphere of the SAME
 * radius is 36π again. Those coincidences are the content, and they are only visible if the volumes
 * stay exact: 12π against 36π reads as a third, 37.699 against 113.097 does not.
 *
 * So the coefficient is kept as a reduced FRACTION and every claim here is checked against
 * arithmetic written out in the test, not against `roundSolidCoef`.
 */
import { describe, it, expect } from "vitest";
import { WidgetSpec, widgetIntegrityErrors, roundSolidCoef, type TWidget } from "./schema";
import { evaluate, correctAnswerText } from "./evaluate";

const base = {
  type: "volumeBuilder" as const,
  prompt: "p",
  solid: "cylinder" as const,
  targetVolume: 36,
  rMax: 6,
  rStart: 1,
  hMax: 6,
  hStart: 1,
  successFeedback: "ok",
  lowFeedback: "low",
  highFeedback: "high"
};
const spec = (o: Record<string, unknown> = {}) => WidgetSpec.parse({ ...base, ...o }) as TWidget;

describe("roundSolidCoef is exact, checked against arithmetic here", () => {
  it("cylinder is r squared times h", () => {
    expect(roundSolidCoef("cylinder", 3, 4)).toEqual({ num: 3 * 3 * 4, den: 1 });
    expect(roundSolidCoef("cylinder", 3, 4).num).toBe(36);
  });

  it("cone is exactly a third of the cylinder on the same r and h", () => {
    const cyl = roundSolidCoef("cylinder", 3, 4);
    const cone = roundSolidCoef("cone", 3, 4);
    expect(cone).toEqual({ num: 12, den: 1 });
    // a third, verified as a ratio rather than asserted
    expect((cone.num / cone.den) * 3).toBe(cyl.num / cyl.den);
  });

  it("sphere is four thirds r cubed", () => {
    expect(roundSolidCoef("sphere", 3, 1)).toEqual({ num: 36, den: 1 });
    expect((4 * 27) / 3).toBe(36);
  });

  it("THE COINCIDENCE the lessons turn on: cylinder(3,4) and sphere(3) are both 36", () => {
    expect(roundSolidCoef("cylinder", 3, 4)).toEqual(roundSolidCoef("sphere", 3, 1));
  });

  it("keeps thirds exact rather than rounding when they do not cancel", () => {
    // r = 2, h = 1 cone: 4/3 — must stay a fraction, never 1.33
    const c = roundSolidCoef("cone", 2, 1);
    expect(c).toEqual({ num: 4, den: 3 });
    expect(c.num / c.den).toBeCloseTo(4 / 3, 12);
  });

  it("reduces the fraction", () => {
    // r = 3, h = 1 cone: 9/3 must reduce to 3, not stay 9/3
    expect(roundSolidCoef("cone", 3, 1)).toEqual({ num: 3, den: 1 });
  });

  it("covers each lesson's own authored answer", () => {
    expect(roundSolidCoef("cylinder", 3, 4).num).toBe(36); // tm-05-01
    expect(roundSolidCoef("cone", 3, 4).num).toBe(12); // tm-05-02
    expect(roundSolidCoef("sphere", 3, 1).num).toBe(36); // tm-05-03
  });
});

describe("grading is exact", () => {
  it("accepts any whole r,h reaching the target — a volume is a product, not one shape", () => {
    const s = spec();
    expect(evaluate(s, { r: 3, h: 4 }).correct).toBe(true);
    expect(evaluate(s, { r: 6, h: 1 }).correct).toBe(true); // 36 x 1
    expect(6 * 6 * 1).toBe(36);
  });

  it("rejects a near miss and names the direction", () => {
    const s = spec();
    expect(evaluate(s, { r: 3, h: 3 })).toEqual({ correct: false, feedback: base.lowFeedback });
    expect(evaluate(s, { r: 3, h: 5 })).toEqual({ correct: false, feedback: base.highFeedback });
  });

  it("a fractional coefficient is never accepted as the whole target", () => {
    const cone = spec({ solid: "cone", targetVolume: 12 });
    expect(evaluate(cone, { r: 2, h: 1 }).correct).toBe(false); // 4/3
    expect(evaluate(cone, { r: 3, h: 4 }).correct).toBe(true);
  });

  it("the sphere ignores height — it has none", () => {
    const sph = spec({ solid: "sphere", targetVolume: 36 });
    expect(evaluate(sph, { r: 3, h: 1 }).correct).toBe(true);
    expect(evaluate(sph, { r: 3, h: 6 }).correct).toBe(true);
  });

  it("refuses to grade an unset radius", () => {
    expect(evaluate(spec(), null).correct).toBe(false);
  });

  it("correctAnswerText carries the pi for round solids and not for prisms", () => {
    expect(correctAnswerText(spec())).toContain("36\u03c0");
    const prism = WidgetSpec.parse({ ...base, solid: "prism", rMax: 6, rStart: 1 }) as TWidget;
    expect(correctAnswerText(prism)).not.toContain("\u03c0");
  });
});

describe("backward compatibility — prisms are untouched", () => {
  const prism = {
    type: "volumeBuilder" as const,
    prompt: "p",
    targetVolume: 24,
    lMax: 6,
    wMax: 6,
    hMax: 6,
    successFeedback: "ok",
    lowFeedback: "low",
    highFeedback: "high"
  };
  it("defaults to prism when no solid is given", () => {
    const p = WidgetSpec.parse(prism) as { solid: string };
    expect(p.solid).toBe("prism");
  });
  it("still grades on l x w x h", () => {
    const s = WidgetSpec.parse(prism) as TWidget;
    expect(evaluate(s, { l: 2, w: 3, h: 4 }).correct).toBe(true);
    expect(evaluate(s, { l: 2, w: 3, h: 3 }).correct).toBe(false);
  });
  it("still passes its own integrity gate", () => {
    expect(widgetIntegrityErrors(WidgetSpec.parse(prism) as TWidget)).toEqual([]);
  });
});

describe("integrity gate", () => {
  it("accepts each well-formed round solid", () => {
    expect(widgetIntegrityErrors(spec())).toEqual([]);
    expect(widgetIntegrityErrors(spec({ solid: "cone", targetVolume: 12 }))).toEqual([]);
    expect(widgetIntegrityErrors(spec({ solid: "sphere", targetVolume: 36 }))).toEqual([]);
  });

  it("REFUSES a target no whole radius and height can reach", () => {
    // 37 is not r^2 h for any r,h within 6 — the task would be unsolvable.
    let reachable = false;
    for (let r = 1; r <= 6; r++) for (let h = 1; h <= 6; h++) if (r * r * h === 37) reachable = true;
    expect(reachable).toBe(false);
    expect(widgetIntegrityErrors(spec({ targetVolume: 37 })).join(" ")).toMatch(/no whole radius\/height/);
  });

  it("refuses length/width locks on a shape that has neither", () => {
    expect(widgetIntegrityErrors(spec({ lockL: true })).join(" ")).toMatch(/has a radius, not a length/);
  });

  it("refuses locking a sphere's height", () => {
    expect(widgetIntegrityErrors(spec({ solid: "sphere", targetVolume: 36, lockH: true })).join(" ")).toMatch(
      /no height to lock/
    );
  });
});
