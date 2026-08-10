import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WidgetSpec, exactNumberTruth } from "./schema";
import { GEOMETRY_GENERATORS } from "./geometryVariants";

/** S169 completes g10-solid-geometry: every numeric form in the bank is now exactNumberLab, so
 * every regenerated solid-geometry problem re-derives its answer from authored dimensions rather
 * than trusting a stored number. π is authored as a named constant at the value the prompt
 * states, where it states one. */

const bank = JSON.parse(readFileSync("src/lib/geometryVariantTemplates.json", "utf8"))["g10-solid-geometry"];
const numericForms = Object.keys(bank).filter((f) => f.endsWith("__numeric"));

describe("g10-solid-geometry is fully converted (S169)", () => {
  it("has no numeric-surface pool entries left in any numeric form", () => {
    const stragglers: string[] = [];
    for (const form of numericForms) {
      for (const entry of bank[form] as any[]) {
        if (entry.type !== "exactNumberLab") stragglers.push(`${form}: ${entry.prompt}`);
      }
    }
    expect(stragglers).toEqual([]);
    expect(numericForms.length).toBe(15);
  });

  it("every pool entry parses and re-derives a numeric answer", () => {
    let checked = 0;
    for (const form of numericForms) {
      for (const entry of bank[form] as any[]) {
        const spec = WidgetSpec.parse(entry) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
        const truth = exactNumberTruth(spec);
        expect(truth.answerNumber, `${form}: ${entry.prompt}`).toBeTypeOf("number");
        checked += 1;
      }
    }
    expect(checked).toBe(47);
  });

  it("the generator serves every numeric form and agrees with the truth function", () => {
    const g = GEOMETRY_GENERATORS.find((x: any) => x.tag === "g10-solid-geometry")! as any;
    let seed = 7;
    for (const form of numericForms) {
      for (const band of ["core", "stretch"] as const) {
        const v = g.gen(() => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296), band, form);
        expect(v.widget.type, form).toBe("exactNumberLab");
        expect(v.answer, form).toBe(exactNumberTruth(v.widget).answerNumber);
      }
    }
  });

  it("keeps an authored π at the value its prompt states", () => {
    // sg-cavalieri's leaning-cylinder prompt states π ≈ 3.14159; the spec must not silently use a
    // more precise π than the learner was given to work with.
    const entry = (bank["sg-cavalieri__numeric"] as any[]).find((e) => String(e.prompt).includes("3.14159"));
    expect(entry).toBeDefined();
    const pi = entry.approxConstants.find((c: any) => c.id === "pi");
    expect(pi.value).toBe(3.14159);
  });
});
