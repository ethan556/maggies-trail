// Guards against widget-count drift: every widget kind must be registered, have a schema variant,
// have a gallery sample, and be exercised by the keyboard gate. Added after I mis-reported widget
// counts from a hand-rolled regex — the source of truth is now asserted, not eyeballed.

import { describe, expect, it } from "vitest";
import { REGISTERED_WIDGETS } from "./widgets";
import { SAMPLES } from "./widgetSamples";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "@/lib/schema";

const sampleTypes = new Set((SAMPLES as TWidget[]).map((s) => s.type));
const schemaTypes = new Set(WidgetSpec.options.map((o) => o.shape.type.value as string));

describe("widget registry consistency", () => {
  it("every registered widget has a schema variant", () => {
    const missing = REGISTERED_WIDGETS.filter((w) => !schemaTypes.has(w));
    expect(missing).toEqual([]);
  });

  it("every schema variant is registered", () => {
    const missing = [...schemaTypes].filter((t) => !REGISTERED_WIDGETS.includes(t as (typeof REGISTERED_WIDGETS)[number]));
    expect(missing).toEqual([]);
  });

  it("every registered widget has at least one gallery sample", () => {
    const missing = REGISTERED_WIDGETS.filter((w) => !sampleTypes.has(w));
    expect(missing).toEqual([]);
  });

  it("registry, schema, and samples all cover the same set", () => {
    expect(new Set(REGISTERED_WIDGETS).size).toBe(REGISTERED_WIDGETS.length); // no dupes
    expect(sampleTypes.size).toBe(REGISTERED_WIDGETS.length);
    expect(schemaTypes.size).toBe(REGISTERED_WIDGETS.length);
  });

  // Several other files already run `SAMPLES.map(WidgetSpec.parse)` unconditionally at module
  // load, so a sample that fails SCHEMA parse already crashes a test file. Nothing previously
  // checked semantic/mathematical soundness across every sample — a spec can be well-typed and
  // still be wrong (S116 found exactly this: a solveBalance sample for "3(x + 2) = 18" had a
  // post-distribution constant that didn't match its own worked answer). This runs every sample
  // through the SAME integrity check lesson content is held to, so a future sample addition gets
  // this for free instead of depending on whoever adds it remembering to check by hand.
  it("every gallery sample passes widgetIntegrityErrors, not just schema parse", () => {
    const failures: string[] = [];
    (SAMPLES as TWidget[]).forEach((s, i) => {
      const errs = widgetIntegrityErrors(WidgetSpec.parse(s));
      if (errs.length) failures.push(`sample #${i} (${s.type}): ${errs.join("; ")}`);
    });
    expect(failures, `\n${failures.join("\n")}\n`).toEqual([]);
  });
});
