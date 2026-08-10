import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec } from "./schema";

/**
 * S116: `scripts/engine-capabilities.json` is the NINTH surface of the engine registration
 * contract, and the only one that is not type-checked. A widget type missing from it does not
 * break the build or any existing test — it silently falls back to
 * `{ manip: 0, conseq: 0, err: 1, adapt: 0, a11y: 2, mobile: 2, polish: 1 }`, which scores BELOW a
 * trivial engine.
 *
 * That is not hypothetical: `extraneousRootLab` shipped without an entry, and the symptom was
 * re-04-02 getting WORSE on conversion (B 28 -> B 27) despite gaining a full laboratory. With the
 * entry it is A 34. The tier going DOWN after a genuine upgrade was the only tell.
 *
 * This gate makes the ninth surface as loud as the other eight.
 */
const caps = JSON.parse(
  readFileSync(join(process.cwd(), "scripts", "engine-capabilities.json"), "utf8")
).types as Record<string, Record<string, number>>;

/** Every `type` literal in the WidgetSpec discriminated union. */
const registeredTypes: string[] = (
  (WidgetSpec as unknown as { _def: { options: Array<{ shape: { type: { _def: { value: string } } } }> } })._def
    .options
).map((o) => o.shape.type._def.value);

describe("engine-capabilities.json covers the widget registry", () => {
  it("finds a non-trivial number of registered types (guards against the introspection silently breaking)", () => {
    expect(registeredTypes.length).toBeGreaterThan(50);
    expect(new Set(registeredTypes).size).toBe(registeredTypes.length);
  });

  it("every registered widget type has a capability entry", () => {
    const missing = registeredTypes.filter((t) => !(t in caps));
    expect(missing, `missing from engine-capabilities.json: ${missing.join(", ")}`).toEqual([]);
  });

  it("no capability entry names a type that is not registered", () => {
    const known = new Set(registeredTypes);
    const stale = Object.keys(caps).filter((t) => !known.has(t));
    expect(stale, `stale entries in engine-capabilities.json: ${stale.join(", ")}`).toEqual([]);
  });

  it("every capability vector carries all seven fields in range", () => {
    const fields = ["manip", "conseq", "err", "adapt", "a11y", "mobile", "polish"];
    for (const [type, vec] of Object.entries(caps)) {
      for (const f of fields) {
        expect(typeof vec[f], `${type}.${f}`).toBe("number");
        expect(vec[f], `${type}.${f} out of range`).toBeGreaterThanOrEqual(0);
        expect(vec[f], `${type}.${f} out of range`).toBeLessThanOrEqual(3);
      }
    }
  });
});
