// Guard: every widget kind in the schema union must be fully wired — registered, sampled in the
// gallery, and evaluable. Two widgets (clockSet, balanceScale) once sat half-built on disk (schema
// + component only, no evaluate/registry/sample, unused by any lesson) and surfaced only as a
// build-time exhaustiveness error. This test fails loudly and specifically instead.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REGISTERED_WIDGETS } from "@/components/widgets";
import { SAMPLES } from "@/components/widgetSamples";
import { WidgetSpec } from "@/lib/schema";

function schemaWidgetTypes(): string[] {
  const src = readFileSync("src/lib/schema.ts", "utf8");
  const unionStart = src.indexOf("export const WidgetSpec");
  const union = src.slice(unionStart, src.indexOf("]);", unionStart));
  const specNames = Array.from(union.matchAll(/(\w+Spec)/g))
    .map((m) => m[1])
    .filter((s) => s !== "WidgetSpec");
  return specNames.map((name) => {
    const at = src.indexOf("export const " + name + " = z.object(");
    const lit = src.slice(at, at + 300).match(/z\.literal\("(\w+)"\)/);
    return lit ? lit[1] : "UNRESOLVED:" + name;
  });
}

describe("widget coverage (no half-built widgets)", () => {
  const types = schemaWidgetTypes();

  it("every schema widget kind is registered", () => {
    expect(types.slice().sort()).toEqual(REGISTERED_WIDGETS.slice().sort());
  });

  it("every schema widget kind has a gallery sample", () => {
    const sampled = SAMPLES.map((s) => WidgetSpec.parse(s).type);
    expect(types.filter((t) => !sampled.includes(t as (typeof sampled)[number]))).toEqual([]);
  });

  it("every schema widget kind has an evaluate case", () => {
    const ev = readFileSync("src/lib/evaluate.ts", "utf8");
    const body = ev.slice(ev.indexOf("export function evaluate"), ev.indexOf("export function canCheck"));
    expect(types.filter((t) => !body.includes('case "' + t + '"'))).toEqual([]);
  });
});
