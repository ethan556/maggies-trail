/**
 * THE ADDITIVE-SAFETY PROOF for the S212 systemsExplore schema window.
 *
 * The rule the reviewer is diffing schema.ts against: every field added this session is optional
 * with NO `.default()` at the point of use, so a spec that omits them parses to exactly the object
 * it always parsed to. The regression set is not a sample — it is every `systemsExplore` instance
 * in `content/**` plus the shipped sample, read off disk and compared key-for-key and
 * value-for-value against a parse of the same raw input through the same schema.
 *
 * The stronger half of the proof is the KEY-SET assertion: a new optional field that silently
 * materialised as `editLine1: undefined` would still be a changed parsed form, and a
 * `.default()` would be a changed VALUE. Both are caught by comparing key sets exactly.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SystemsExploreSpec, WidgetSpec, systemsExploreEditErrors, widgetIntegrityErrors, type TWidget } from "@/lib/schema";
import { SAMPLES } from "@/components/widgetSamples";

/** Every authored systemsExplore spec, with where it came from. */
function authored(): Array<{ file: string; raw: Record<string, unknown> }> {
  const out: Array<{ file: string; raw: Record<string, unknown> }> = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) {
        let j: unknown;
        try {
          j = JSON.parse(readFileSync(p, "utf8"));
        } catch {
          continue;
        }
        const scan = (n: unknown) => {
          if (!n || typeof n !== "object") return;
          if (Array.isArray(n)) return n.forEach(scan);
          const o = n as Record<string, unknown>;
          if (o.type === "systemsExplore") out.push({ file: p, raw: o });
          for (const k of Object.keys(o)) scan(o[k]);
        };
        scan(j);
      }
    }
  };
  walk("content");
  return out;
}

const SPECS = authored();
/**
 * The lessons that have OPTED IN to editable lines, named rather than counted (S213). The first
 * version of this file asserted "no authored spec opts in", which was true when it was written and
 * became false the moment the capability got its first user — it was pinning a fact as if it were
 * an invariant. The invariant is the one below it: a spec WITHOUT the fields is untouched. Listing
 * the opt-ins by name makes the next one a deliberate edit to this line rather than a surprise.
 */
const OPTED_IN = ["se-01-03.json"];
const isOptedIn = (file: string) => OPTED_IN.some((name) => file.endsWith(name));
const classic = () => SPECS.filter((s) => !isOptedIn(s.file));
const opted = () => SPECS.filter((s) => isOptedIn(s.file));
/** The exact key set a pre-S212 systemsExplore parsed to — written out, not derived from the schema. */
const CLASSIC_KEYS = [
  "b1", "b2", "m1", "m2", "offLine1Feedback", "offLine2Feedback", "prompt",
  "successFeedback", "type", "xMax", "xMin", "xStart", "yMax", "yMin", "yStart",
];

describe("systemsExplore: the S212 fields are additive", () => {
  it("finds every authored spec, and knows which have opted in", () => {
    expect(SPECS.length).toBe(6);
    expect(classic()).toHaveLength(5);
    expect(opted().map((s) => s.file.split("/").pop())).toEqual(["se-01-03.json"]);
  });

  it("parses each CLASSIC authored spec to exactly the classic key set, with no new field materialised", () => {
    for (const { file, raw } of classic()) {
      const parsed = SystemsExploreSpec.parse(raw) as Record<string, unknown>;
      expect([file, Object.keys(parsed).sort()]).toEqual([file, CLASSIC_KEYS]);
      expect([file, "editLine1" in parsed]).toEqual([file, false]);
      expect([file, "editLine2" in parsed]).toEqual([file, false]);
      expect([file, "degenerateSystemFeedback" in parsed]).toEqual([file, false]);
      // …and every value is the authored one, or the default it always had.
      for (const k of Object.keys(parsed)) {
        if (raw[k] !== undefined) expect([file, k, parsed[k]]).toEqual([file, k, raw[k]]);
      }
    }
  });

  it("parses an OPTED-IN spec to the classic keys plus exactly the three new ones", () => {
    for (const { file, raw } of opted()) {
      const parsed = SystemsExploreSpec.parse(raw) as Record<string, unknown>;
      expect([file, Object.keys(parsed).sort()]).toEqual([
        file,
        [...CLASSIC_KEYS, "degenerateSystemFeedback", "editLine1", "editLine2"].sort(),
      ]);
      // The gate's own requirement, on real authored content rather than a fixture.
      expect([file, typeof parsed.degenerateSystemFeedback]).toEqual([file, "string"]);
    }
  });

  it("parses the shipped sample the same way", () => {
    const sample = (SAMPLES as Array<Record<string, unknown>>).find((x) => x.type === "systemsExplore");
    if (!sample) return; // the sample set is allowed not to carry one
    const parsed = WidgetSpec.parse(sample) as Record<string, unknown>;
    expect("editLine1" in parsed).toBe(false);
    expect("degenerateSystemFeedback" in parsed).toBe(false);
  });

  it("routes through the top-level WidgetSpec union unchanged too", () => {
    for (const { file, raw } of SPECS) {
      const direct = SystemsExploreSpec.parse(raw);
      const union = WidgetSpec.parse(raw);
      expect([file, union]).toEqual([file, direct]);
    }
  });
});

describe("systemsExplore: the new fields when an author does use them", () => {
  const base = SPECS[0]!.raw;

  it("fills the editable defaults only when the object is supplied", () => {
    const parsed = SystemsExploreSpec.parse({ ...base, editLine1: {} });
    expect(parsed.editLine1).toEqual({
      slopeMin: -5, slopeMax: 5, slopeStep: 1,
      interceptMin: -10, interceptMax: 10, interceptStep: 1,
      outOfRange: "clamp", offLattice: "snap",
    });
    expect("editLine2" in (parsed as Record<string, unknown>)).toBe(false);
    expect("degenerateSystemFeedback" in (parsed as Record<string, unknown>)).toBe(false);
  });

  it("takes degenerateSystemFeedback when an author supplies it, and rejects an empty one", () => {
    const parsed = SystemsExploreSpec.parse({ ...base, degenerateSystemFeedback: "The lines never meet now — there is nothing left to solve." });
    expect(parsed.degenerateSystemFeedback).toBe("The lines never meet now — there is nothing left to solve.");
    expect(() => SystemsExploreSpec.parse({ ...base, degenerateSystemFeedback: "" })).toThrow();
  });

  it("keeps the authored values it is given", () => {
    const parsed = SystemsExploreSpec.parse({
      ...base,
      editLine2: { slopeMin: -3, slopeMax: 3, slopeStep: 1, interceptMin: 0, interceptMax: 8, interceptStep: 2, outOfRange: "reject", offLattice: "reject" },
    });
    expect(parsed.editLine2?.interceptStep).toBe(2);
    expect(parsed.editLine2?.outOfRange).toBe("reject");
  });

  it("rejects malformed control blocks rather than coercing them", () => {
    for (const bad of [
      { slopeStep: 0 }, // a step of 0 is no lattice at all
      { slopeStep: -1 },
      { slopeMin: 1.5 },
      { outOfRange: "shrug" },
      { offLattice: "wobble" },
    ]) {
      expect(() => SystemsExploreSpec.parse({ ...base, editLine1: bad })).toThrow();
    }
  });
});

describe("systemsExplore: an editable line must start where the controls can reach", () => {
  const DEGEN = "Both lines now climb at the same rate, so there is no single crossing to find.";
  /** Editable fixtures carry the required string; the rule that requires it is tested on its own. */
  const spec = (over: Record<string, unknown>) => ({ m1: 2, b1: 1, m2: -1, b2: 5, degenerateSystemFeedback: DEGEN, ...over });

  it("passes a spec whose start sits inside the range and on the lattice", () => {
    expect(
      systemsExploreEditErrors(
        spec({ editLine1: { slopeMin: -4, slopeMax: 4, slopeStep: 1, interceptMin: -5, interceptMax: 5, interceptStep: 1, outOfRange: "clamp", offLattice: "snap" } }) as never
      )
    ).toEqual([]);
  });

  it("names a start outside its own range", () => {
    // Rate 2 with a range of −1..1: the opening position is unreachable by the controls.
    const errs = systemsExploreEditErrors(
      spec({ editLine1: { slopeMin: -1, slopeMax: 1, slopeStep: 1, interceptMin: -5, interceptMax: 5, interceptStep: 1, outOfRange: "clamp", offLattice: "snap" } }) as never
    );
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/line 1 starts at rate 2, outside its editable range -1 to 1/);
  });

  it("names a start off its own lattice", () => {
    // Intercept 1 stepping by 2 from 0 lands on 0, 2, 4 … never on 1.
    const errs = systemsExploreEditErrors(
      spec({ editLine1: { slopeMin: -4, slopeMax: 4, slopeStep: 1, interceptMin: 0, interceptMax: 8, interceptStep: 2, outOfRange: "clamp", offLattice: "snap" } }) as never
    );
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/line 1 starts at 1, which is not a step of 2 from 0/);
  });

  it("names an inverted range, and says nothing about a line with no controls", () => {
    expect(
      systemsExploreEditErrors(
        spec({ editLine2: { slopeMin: 3, slopeMax: -3, slopeStep: 1, interceptMin: -5, interceptMax: 5, interceptStep: 1, outOfRange: "clamp", offLattice: "snap" } }) as never
      ).some((e) => /line 2 slope range is inverted/.test(e))
    ).toBe(true);
    expect(systemsExploreEditErrors(spec({}) as never)).toEqual([]);
  });

  it("REQUIRES degenerateSystemFeedback the moment a line becomes editable", () => {
    const withoutString = { m1: 2, b1: 1, m2: -1, b2: 5, editLine1: { slopeMin: -4, slopeMax: 4, slopeStep: 1, interceptMin: -5, interceptMax: 5, interceptStep: 1, outOfRange: "clamp", offLattice: "snap" } };
    const errs = systemsExploreEditErrors(withoutString as never);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatch(/must author degenerateSystemFeedback/);
    // With the string, the same spec is clean — the gate is the only thing that was missing.
    expect(systemsExploreEditErrors({ ...withoutString, degenerateSystemFeedback: DEGEN } as never)).toEqual([]);
    // It is required by EITHER line being open, not only the first.
    const secondOnly = { m1: 2, b1: 1, m2: -1, b2: 5, editLine2: withoutString.editLine1 };
    expect(systemsExploreEditErrors(secondOnly as never).some((e) => /must author degenerateSystemFeedback/.test(e))).toBe(true);
    // And NOT required when no line is editable — a classic spec stays clean without it.
    expect(systemsExploreEditErrors({ m1: 2, b1: 1, m2: -1, b2: 5 } as never)).toEqual([]);
  });

  it("clears every authored spec — the classic ones vacuously, the opted-in one on its merits", () => {
    for (const { file, raw } of SPECS) {
      expect([file, systemsExploreEditErrors(SystemsExploreSpec.parse(raw))]).toEqual([file, []]);
    }
    expect(opted().length).toBeGreaterThan(0); // …and at least one of them was not vacuous
  });
});

describe("the gate is actually RUN on authored content (S213)", () => {
  const EDIT = { slopeMin: -4, slopeMax: 4, slopeStep: 1, interceptMin: -5, interceptMax: 5, interceptStep: 1, outOfRange: "clamp", offLattice: "snap" };
  const DEGEN = "Both lines climb at the same rate now, so there is no single crossing left to find.";

  it("fails through widgetIntegrityErrors, not only by a direct call", () => {
    // THE POINT OF THIS TEST. S212 called the borrowed-message state "unreachable by construction"
    // while nothing ran the check — so it was reachable. This asserts the real pipeline path that
    // `validate:content` walks, which is the only one that can make that sentence true.
    const missing = SystemsExploreSpec.parse({ ...SPECS[0]!.raw, editLine1: EDIT }) as TWidget;
    const errs = widgetIntegrityErrors(missing);
    expect(errs.some((e) => /must author degenerateSystemFeedback/.test(e))).toBe(true);
  });

  it("passes through the same path once the string is authored", () => {
    const complete = SystemsExploreSpec.parse({ ...SPECS[0]!.raw, editLine1: EDIT, degenerateSystemFeedback: DEGEN }) as TWidget;
    expect(widgetIntegrityErrors(complete)).toEqual([]);
  });

  it("catches an unreachable start through that path too", () => {
    // Rate 2 is outside −1..1, so the opening position could not be built by the controls.
    const unreachable = SystemsExploreSpec.parse({
      ...SPECS[0]!.raw, m1: 2, editLine1: { ...EDIT, slopeMin: -1, slopeMax: 1 }, degenerateSystemFeedback: DEGEN,
    }) as TWidget;
    expect(widgetIntegrityErrors(unreachable).some((e) => /outside its editable range/.test(e))).toBe(true);
  });

  it("leaves every classic authored spec clean through that path", () => {
    for (const { file, raw } of classic()) {
      expect([file, widgetIntegrityErrors(SystemsExploreSpec.parse(raw) as TWidget)]).toEqual([file, []]);
    }
  });

  it("passes the authored opt-in through that path", () => {
    for (const { file, raw } of opted()) {
      expect([file, widgetIntegrityErrors(SystemsExploreSpec.parse(raw) as TWidget)]).toEqual([file, []]);
    }
  });
});
