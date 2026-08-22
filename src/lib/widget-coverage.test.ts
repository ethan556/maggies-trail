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
  // The discriminated-union member list lives on `WidgetSpecBase`; the exported `WidgetSpec`
  // is a superRefine wrapper around it (see schema.ts) and no longer contains the member list
  // itself, so we must locate the base union declaration rather than the export.
  const unionStart = src.indexOf("WidgetSpecBase = z.discriminatedUnion(");
  const union = src.slice(unionStart, src.indexOf("]);", unionStart));
  const specNames = Array.from(union.matchAll(/(\w+Spec)/g))
    .map((m) => m[1])
    .filter((s) => s !== "WidgetSpec" && s !== "WidgetSpecBase");
  return specNames.map((name) => {
    // Most spec declarations are `export const NameSpec = z.object({...})` on one line, but a
    // few (e.g. PlotPointSpec) chain `.object(` on a following line — match the declaration
    // start only, not the exact `z.object(` spelling, so both forms resolve.
    const at = src.indexOf("export const " + name + " = z");
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
