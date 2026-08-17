import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeWidgetState } from "./describeState";
import {
  WidgetSpec,
  scaledCircleChoiceCorrect,
  scaledCircleMeasurementSpoken,
  scaledCircleMeasurementText,
  scaledCircleScaleUnitSpoken,
  scaledCircleScaleUnitText,
  widgetIntegrityErrors,
  type TScaledCircleLab,
} from "./schema";

type RawScaledCircle = Record<string, unknown> & { type: "scaledCircleLab"; realUnit?: unknown; drawingUnit?: unknown };

function authoredScaledCircles(): Array<{ key: string; raw: RawScaledCircle; spec: TScaledCircleLab }> {
  const root = join(process.cwd(), "content", "courses");
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((course) => {
    const lessons = join(root, course.name, "lessons");
    if (!existsSync(lessons)) return [];
    return readdirSync(lessons).filter((name) => name.endsWith(".json")).flatMap((name) => {
      const lesson = JSON.parse(readFileSync(join(lessons, name), "utf8")) as {
        id: string;
        steps: Array<{ id: string; widget?: RawScaledCircle }>;
        remedials?: Array<{ check: { id: string; widget?: RawScaledCircle } }>;
      };
      const steps = [...lesson.steps, ...(lesson.remedials ?? []).map((route) => route.check)];
      return steps.flatMap((step) => {
        if (step.widget?.type !== "scaledCircleLab") return [];
        const spec = WidgetSpec.parse(step.widget);
        if (spec.type !== "scaledCircleLab") throw new Error(`${lesson.id}/${step.id}: wrong widget`);
        return [{ key: `${lesson.id}/${step.id}`, raw: step.widget, spec }];
      });
    });
  }).sort((a, b) => a.key.localeCompare(b.key));
}

describe("S245 scaledCircleLab unit agreement", () => {
  it("gives every authored consumer an explicit truthful unit contract", () => {
    const uses = authoredScaledCircles();
    expect(uses.map(({ key }) => key)).toEqual([
      "cr-06-01/i1", "cr-06-01/i2", "cr-06-01/i3",
      "g7-04-03/ch1", "g7-04-03/i1", "g7-04-03/i2", "g7-04-03/k1",
    ]);
    const expected = new Map<string, { drawing: TScaledCircleLab["drawingUnit"]; real: TScaledCircleLab["realUnit"] }>([
      ["cr-06-01/i1", { drawing: "unitless", real: "unitless" }],
      ["cr-06-01/i2", { drawing: "unitless", real: "unitless" }],
      ["cr-06-01/i3", { drawing: "unitless", real: "unitless" }],
      ["g7-04-03/ch1", { drawing: "cm", real: "m" }],
      ["g7-04-03/i1", { drawing: "cm", real: "m" }],
      ["g7-04-03/i2", { drawing: "unitless", real: "m" }],
      ["g7-04-03/k1", { drawing: "unitless", real: "m" }],
    ]);
    for (const { key, raw, spec } of uses) {
      const units = expected.get(key)!;
      expect(raw.realUnit, `${key}: authored realUnit`).toBe(units.real);
      expect(spec.realUnit, `${key}: parsed realUnit`).toBe(units.real);
      expect(spec.drawingUnit, `${key}: parsed drawingUnit`).toBe(units.drawing);
      if (spec.drawingRadius !== undefined) expect(raw.drawingUnit, `${key}: authored drawingUnit`).toBe(units.drawing);
      expect(widgetIntegrityErrors(spec), key).toEqual([]);
      const correct = spec.choices.find((choice) => scaledCircleChoiceCorrect(spec, choice))!;
      const expectedUnit = spec.realUnit === "unitless" ? null : spec.ask === "areaCoef" ? "m²" : "m";
      for (const choice of spec.choices) {
        if (expectedUnit) expect(choice.label, `${key}/${choice.id}: visible choice unit`).toContain(expectedUnit);
        else expect(choice.label, `${key}/${choice.id}: neutral choice`).not.toMatch(/\b(?:mm|cm|m|km|in|ft|yd)²?\b/);
      }
      expect(correct).toBeTruthy();
    }
  });

  it("uses the same unit in visible formatting and spoken state, with neutral fallback", () => {
    expect(scaledCircleMeasurementText(4, "unitless")).toBe("4");
    expect(scaledCircleMeasurementSpoken(4, "unitless")).toBe("4");
    expect(scaledCircleMeasurementText(36, "m", 2)).toBe("36 m²");
    expect(scaledCircleMeasurementSpoken(36, "m", 2)).toBe("36 square meters");
    expect(scaledCircleScaleUnitText("cm", "m")).toBe(" m/cm");
    expect(scaledCircleScaleUnitSpoken("cm", "m", 2)).toBe(" meters per centimeter");

    for (const { key, spec } of authoredScaledCircles()) {
      const wrong = spec.choices.find((choice) => !scaledCircleChoiceCorrect(spec, choice))!;
      const before = describeWidgetState(spec, wrong.id, "neutral")!;
      const reveal = describeWidgetState(spec, wrong.id, "info")!;
      if (spec.realUnit === "unitless") {
        expect(before, key).not.toMatch(/\b(?:meter|centimeter)s?\b/i);
        expect(reveal, key).not.toMatch(/\b(?:meter|centimeter)s?\b/i);
      } else {
        expect(before, key).toMatch(/meters?/i);
        expect(reveal, key).toMatch(spec.ask === "areaCoef" ? /square meters/i : /meters?/i);
      }
      if (spec.drawingRadius !== undefined) {
        expect(before, key).toContain(`${spec.drawingRadius} centimeters`);
        expect(before, key).toContain("2 meters per centimeter");
      }
    }
  });

  it("rejects incomplete or misplaced dimensional contracts", () => {
    const plan = authoredScaledCircles().find(({ key }) => key === "g7-04-03/i1")!.spec;
    expect(widgetIntegrityErrors({ ...plan, drawingUnit: "unitless" })).toContain(
      "scaledCircleLab: a dimensional scale chain requires both drawingUnit and realUnit",
    );
    const direct = authoredScaledCircles().find(({ key }) => key === "g7-04-03/k1")!.spec;
    expect(widgetIntegrityErrors({ ...direct, drawingUnit: "cm" })).toContain(
      "scaledCircleLab: drawingUnit requires drawingRadius and scale givens",
    );
  });
});
