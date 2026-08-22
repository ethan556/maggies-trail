// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";

/**
 * S316 measure-problems-g4 main-route figure rebuild (see
 * reports/closure/S316_G4V_FIGURE_REBUILD.md). Eight main-route (c1/c2) figures depicted the
 * wrong scenario for their lesson. This file verifies, for each replacement: (1) the lesson JSON
 * is rebound to the new registered figure id, (2) the rendered SVG's title/accessible description
 * states the lesson's actual numbers, and (3) no foreign hardcoded number/word from the old
 * defect survives in the new markup.
 */

const COURSE = join(process.cwd(), "content", "courses", "measure-problems-g4", "lessons");

type Step = { id: string; kind: string; figure?: string };
type Remedial = { concept: { figure?: string }; check: unknown };
type Lesson = { id: string; steps: Step[]; remedials: Remedial[] };

const lesson = (id: string): Lesson =>
  JSON.parse(readFileSync(join(COURSE, `${id}.json`), "utf8")) as Lesson;

const stepFigure = (lessonId: string, stepId: string): string | undefined =>
  lesson(lessonId).steps.find((step) => step.id === stepId)?.figure;

const remedialFigure = (lessonId: string): string | undefined =>
  lesson(lessonId).remedials[0]?.concept.figure;

const render = (figureId: string): string => {
  expect(FIGURE_IDS.has(figureId), figureId).toBe(true);
  expect(FIGURES[figureId], figureId).toBeDefined();
  return renderToStaticMarkup(FIGURES[figureId]());
};

const title = (markup: string): string => markup.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";

describe("S316 measure-problems-g4 main-route figure rebuild", () => {
  it("g4v-01-02 c1: meter/centimeter conversion table replaces the flour/milk ratio-table", () => {
    expect(stepFigure("g4v-01-02", "c1")).toBe("g4v-meter-cm-table");
    const markup = render("g4v-meter-cm-table");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toContain("meter");
    expect(t).toContain("centimeter");
    expect(t).toMatch(/1 meter is 100 centimeters/);
    expect(t).toMatch(/2 meters is 200 centimeters/);
    expect(t).toMatch(/3 meters is 300 centimeters/);
    expect(markup).not.toMatch(/flour/i);
    expect(markup).not.toMatch(/milk/i);
  });

  it("g4v-02-01 c1: liter jug states the 1,000 mL relationship, replacing the plain unmarked jug", () => {
    expect(stepFigure("g4v-02-01", "c1")).toBe("g4v-liter-ml-jug");
    const markup = render("g4v-liter-ml-jug");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/1,000 milliliters/);
    expect(t).toMatch(/4 liters equals 4,000 milliliters/);
    expect(markup).toMatch(/1 L = 1000 mL/);
    expect(markup).toMatch(/4 L = 4000 mL/);
    expect(markup).not.toMatch(/how much it holds/i);
  });

  it("g4v-02-02 c1: clock states 60 min/hr and 60 sec/min, replacing the clock frozen at 3:00", () => {
    expect(stepFigure("g4v-02-02", "c1")).toBe("g4v-clock-60");
    const markup = render("g4v-clock-60");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/sixty minute-and-second tick marks/);
    expect(t).toMatch(/one hour equals sixty minutes/);
    expect(t).toMatch(/one minute equals sixty seconds/);
    expect(markup).toMatch(/1 hour = 60 minutes/);
    expect(markup).toMatch(/1 minute = 60 seconds/);
    expect(markup).not.toMatch(/3:00/);
    expect(markup).not.toMatch(/three o'?clock/i);
  });

  it("g4v-02-03 c2: equal-groups-then-subtract bar (6×400−150) replaces the unrelated 18+24−15 two-step-bar", () => {
    expect(stepFigure("g4v-02-03", "c2")).toBe("g4v-groups-adjust-distance");
    const markup = render("g4v-groups-adjust-distance");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/six equal 400-meter laps/);
    expect(t).toMatch(/150 meters crossed off once/);
    expect(markup).toMatch(/6 × 400/);
    expect(markup).toMatch(/−150/);
    expect(markup).toMatch(/2,250/);
    expect(markup).not.toMatch(/18\s*\+\s*24/);
    expect(markup).not.toMatch(/−\s*15\b/);
    expect(markup).not.toMatch(/\b27\b/);
  });

  it("g4v-02-04 c1: equal-groups-then-subtract bar (5×30−20) replaces the unrelated fixed 8:40–9:20 elapsed-time figure", () => {
    expect(stepFigure("g4v-02-04", "c1")).toBe("g4v-groups-adjust-time");
    const markup = render("g4v-groups-adjust-time");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/five equal 30-minute shifts/);
    expect(t).toMatch(/20 minutes crossed off once/);
    expect(markup).toMatch(/5 × 30/);
    expect(markup).toMatch(/−20/);
    expect(markup).toMatch(/130/);
    expect(markup).not.toMatch(/8:40/);
    expect(markup).not.toMatch(/9:20/);
  });

  it("g4v-03-01 c1: equal-groups-then-subtract bar (9×25−40) replaces the unrelated 23¢ dimes/pennies coin-total figure", () => {
    expect(stepFigure("g4v-03-01", "c1")).toBe("g4v-groups-adjust-money");
    const markup = render("g4v-groups-adjust-money");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/nine equal 25-dollar passes/);
    expect(t).toMatch(/40-dollar voucher crossed off once/);
    expect(markup).toMatch(/9 × 25/);
    expect(markup).toMatch(/−40/);
    expect(markup).toMatch(/185/);
    expect(markup).not.toMatch(/23¢/);
    expect(markup).not.toMatch(/dimes?/i);
    expect(markup).not.toMatch(/pennies|penny/i);
  });

  it("g4v-03-02 c1: eight quarter-inch marks replace the unrelated five-pencil line plot", () => {
    expect(stepFigure("g4v-03-02", "c1")).toBe("g4v-quarter-inch-plot");
    const markup = render("g4v-quarter-inch-plot");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/eight X marks/);
    expect(t).toMatch(/1\/4-inch tick/);
    expect(t).toMatch(/two whole inches/);
    expect(markup).toMatch(/8 quarter-inch marks/);
    expect(markup).toMatch(/8 ÷ 4 = 2 inches/);
    expect(markup).not.toMatch(/pencil/i);
    expect(markup).not.toMatch(/5\/8/);
  });

  it("g4v-03-04 c1: reuses the lesson's own equal-part-bar-with-crossed-piece-and-unit figure, not the equation-only mb-multistep", () => {
    expect(stepFigure("g4v-03-04", "c1")).toBe("g4v-groups-adjust-distance");
    const markup = render("g4v-groups-adjust-distance");
    // The equal-part bar has a crossed-off piece (dashed X-marked rect) and a unit suffix on
    // every quantity in its title and body text — the three things the S256 rationale named.
    expect(markup).toMatch(/stroke-dasharray="3 2"/);
    expect(markup).toMatch(/ m\b/);
    const t = title(markup);
    expect(t).toMatch(/2,250 meters/);
  });

  it("g4v-03-04 c2: contrasts end-subtraction against per-group adjustment, replacing the reused two-step-bar", () => {
    expect(stepFigure("g4v-03-04", "c2")).toBe("g4v-end-vs-inside-adjust");
    const markup = render("g4v-end-vs-inside-adjust");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    // end case: k1's own worked numbers (6 x 400 - 150 = 2,250)
    expect(t).toMatch(/six equal 400-meter parts/);
    expect(t).toMatch(/150 meters crossed off once at the end/);
    expect(markup).toMatch(/2,250/);
    // inside-every-group case: k3's own worked numbers (4 x (300 - 50) = 1,000)
    expect(t).toMatch(/four equal 300-meter parts/);
    expect(t).toMatch(/50 meters crossed off inside the part/);
    expect(markup).toMatch(/1,000/);
    // the two totals must differ so the contrast is real, not decorative
    expect(markup).toMatch(/2,250 m vs\. 1,000 m/);
    expect(markup).not.toMatch(/18\s*\+\s*24/);
    expect(markup).not.toMatch(/\b42\b/);
  });

  it("does not leave any of the 8 old defective figure ids bound on their former main-route step", () => {
    const removed: Array<[string, string, string]> = [
      ["g4v-01-02", "c1", "ratio-table"],
      ["g4v-02-01", "c1", "md3-liter"],
      ["g4v-02-02", "c1", "clock-face"],
      ["g4v-02-03", "c2", "two-step-bar"],
      ["g4v-02-04", "c1", "md3-elapsed"],
      ["g4v-03-01", "c1", "mmt-coin-total"],
      ["g4v-03-02", "c1", "line-plot"],
      ["g4v-03-04", "c1", "mb-multistep"],
      ["g4v-03-04", "c2", "two-step-bar"],
    ];
    for (const [lessonId, stepId, oldFigure] of removed) {
      expect(stepFigure(lessonId, stepId), `${lessonId} ${stepId}`).not.toBe(oldFigure);
    }
  });

  it("touched only the intended figure keys: every other main-route step's figure is unchanged", () => {
    const untouched: Array<[string, string, string]> = [
      ["g4v-01-01", "c1", "mc-length-ladder"],
      ["g4v-01-02", "c2", "mc-length-ladder"],
      ["g4v-01-03", "c1", "mc-length-ladder"],
      ["g4v-02-01", "c2", "mc-mass-volume"],
      ["g4v-02-02", "c2", "rr-chain"],
      ["g4v-02-03", "c1", "mb-multistep"],
      ["g4v-02-04", "c2", "rr-chain"],
      ["g4v-03-01", "c2", "mb-multistep"],
      ["g4v-03-02", "c2", "vm-total-length"],
    ];
    for (const [lessonId, stepId, expectedFigure] of untouched) {
      expect(stepFigure(lessonId, stepId), `${lessonId} ${stepId}`).toBe(expectedFigure);
    }
  });

  describe("S316 follow-up: 3 defects a second verification pass found in the same course", () => {
    it("g4v-01-01 c2: reuses g4v-meter-cm-table (its 2 m=200 cm and 3 m=300 cm rows match this lesson's own i1/i2 numbers exactly), replacing the imperial rr-conversion figure", () => {
      expect(stepFigure("g4v-01-01", "c2")).toBe("g4v-meter-cm-table");
      const markup = render("g4v-meter-cm-table");
      const t = title(markup);
      expect(t).toMatch(/2 meters is 200 centimeters/);
      expect(t).toMatch(/3 meters is 300 centimeters/);
      expect(markup).not.toMatch(/12 in/);
      expect(markup).not.toMatch(/1 ft/);
    });

    it("g4v-01-03 c2: a new both-directions table with this lesson's own 4 m=400 cm and 6 m=600 cm, replacing the imperial rr-conversion figure", () => {
      expect(stepFigure("g4v-01-03", "c2")).toBe("g4v-length-both-ways-table");
      const markup = render("g4v-length-both-ways-table");
      expect(markup).toContain('role="img"');
      const t = title(markup);
      expect(t).toMatch(/4 meters is 400 centimeters/);
      expect(t).toMatch(/6 meters is 600 centimeters/);
      expect(t).toMatch(/times 100/);
      expect(t).toMatch(/divided by 100/);
      expect(markup).toMatch(/× 100/);
      expect(markup).toMatch(/÷ 100/);
      expect(markup).not.toMatch(/12 in/);
      expect(markup).not.toMatch(/1 ft/);
      // this lesson never states 1 m/2 m/3 m as a set — it is a distinct instantiation from
      // g4v-meter-cm-table, not a reuse, so its one-way caption must not appear here
      expect(markup).not.toMatch(/every row: meters × 100 = centimeters/);
    });

    it("g4v-03-04 remedial: the remedial's own inside-every-group worked example (5×(200−30)=850 m), replacing the reused two-step-bar (18+24−15) that contradicted its answer", () => {
      expect(remedialFigure("g4v-03-04")).toBe("g4v-groups-inside-adjust-diagram");
      const markup = render("g4v-groups-inside-adjust-diagram");
      expect(markup).toContain('role="img"');
      const t = title(markup);
      expect(t).toMatch(/five equal 200-meter parts/);
      expect(t).toMatch(/30 meters crossed off inside the part/);
      expect(markup).toMatch(/200 − 30/);
      expect(markup).toMatch(/850/);
      expect(markup).not.toMatch(/18\s*\+\s*24/);
      expect(markup).not.toMatch(/−\s*15\b/);
      expect(markup).not.toMatch(/\b27\b/);
      expect(markup).not.toMatch(/\b42\b/);
    });

    it("does not leave rr-conversion or two-step-bar bound on any of the 3 newly-fixed steps", () => {
      expect(stepFigure("g4v-01-01", "c2")).not.toBe("rr-conversion");
      expect(stepFigure("g4v-01-03", "c2")).not.toBe("rr-conversion");
      expect(remedialFigure("g4v-03-04")).not.toBe("two-step-bar");
    });

    it("touched only the intended figure keys on these 3 lessons: every other step's figure is unchanged", () => {
      // g4v-01-01 and g4v-01-03 c1 already checked above (mc-length-ladder). g4v-03-04's own
      // check widget/answer/feedback were not touched — only the concept.figure key changed.
      const check = lesson("g4v-03-04").remedials[0].check as {
        widget: { prompt: string; options: Array<{ correct: boolean; label: string }> };
      };
      expect(check.widget.prompt).toMatch(/5 equal parts of 200 m, with 30 m crossed off inside each part/);
      const correctOption = check.widget.options.find((o) => o.correct);
      expect(correctOption?.label).toBe("5 × (200 − 30) = 850 m");
    });
  });
});
