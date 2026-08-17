/**
 * THE ADDITIVE-SAFETY PROOF for the S211 algebraTiles schema window.
 *
 * The rule the reviewer is diffing schema.ts against: every field added this session is optional
 * with NO `.default()`, so a spec that omits them parses to exactly the object it always parsed
 * to. The regression set is not a sample — it is every `algebraTiles` instance in `content/**`,
 * read off disk and compared field-for-field against its own pre-existing parsed form.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { AlgebraTilesSpec, WidgetSpec, algebraTilesPartials, type TWidget } from "@/lib/schema";
import { SAMPLES } from "@/components/widgetSamples";

/** Every authored algebraTiles spec, with where it came from. */
function authored(): Array<{ file: string; where: string; raw: Record<string, unknown> }> {
  const out: Array<{ file: string; where: string; raw: Record<string, unknown> }> = [];
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
        const scan = (n: unknown, where: string) => {
          if (!n || typeof n !== "object") return;
          if (Array.isArray(n)) return n.forEach((x, i) => scan(x, `${where}[${i}]`));
          const o = n as Record<string, unknown>;
          if (o.type === "algebraTiles") out.push({ file: p, where, raw: o });
          for (const k of Object.keys(o)) scan(o[k], `${where}.${k}`);
        };
        scan(j, "");
      }
    }
  };
  walk("content");
  return out;
}

const SPECS = authored();

describe("the authored regression set", () => {
  it("is every algebraTiles instance in content, and it is not empty", () => {
    expect(SPECS.length).toBe(28);
  });

  // S215: `tse-01-01/i1` is the first authored user of area mode. A NAMED allowlist, not a relaxed
  // count — a second lesson opting in fails this until it is added here deliberately.
  const AREA_USERS: ReadonlyArray<{
    file: string;
    where: string;
    keys: readonly string[];
    area: { width: readonly [number, number]; height: readonly [number, number]; mode: "distribute" };
    targets: readonly [number, number];
  }> = [
    {
      file: "content/courses/linear-equations-systems/lessons/les-01-03.json",
      where: ".steps[1].widget",
      keys: ["area", "partialProductFeedback", "unopenedFrameFeedback"],
      area: { width: [0, 3], height: [1, 4], mode: "distribute" },
      targets: [3, 12],
    },
    {
      file: "content/courses/two-step-equations/lessons/tse-01-01.json",
      where: ".steps[1].widget",
      keys: ["area", "partialProductFeedback", "unopenedFrameFeedback"],
      area: { width: [0, -3], height: [1, 2], mode: "distribute" },
      targets: [-3, -6],
    },
  ];
  const pathKey = (file: string) => file.replace(/\\/g, "/");

  it("exactly the named lessons opt in, with exactly the fields they declare", () => {
    const NEW = ["targetSquare", "squareStart", "area", "partialProductFeedback", "frameMismatchFeedback", "unopenedFrameFeedback"];
    const injected: string[] = [];
    for (const { file, where, raw } of SPECS) {
      const parsed = AlgebraTilesSpec.parse(raw) as Record<string, unknown>;
      const declared = AREA_USERS.find((u) => pathKey(file).endsWith(u.file) && u.where === where);
      const gained = NEW.filter((k) => k in parsed);
      if (!declared) {
        for (const k of gained) injected.push(`${file}${where}: gained "${k}" without being declared`);
      } else if (JSON.stringify(gained.slice().sort()) !== JSON.stringify(declared.keys.slice().sort())) {
        injected.push(`${file}${where}: carries [${gained}], declared [${declared.keys}]`);
      }
    }
    expect(injected).toEqual([]);
  });

  it("each named area lesson carries the reviewed rectangle and targets it claims to teach", () => {
    for (const user of AREA_USERS) {
      const hit = SPECS.find(({ file, where }) => pathKey(file).endsWith(user.file) && where === user.where)!;
      expect(hit, user.file).toBeTruthy();
      const spec = AlgebraTilesSpec.parse(hit.raw);
      expect(spec.area).toEqual(user.area);
      expect(algebraTilesPartials(spec.area!.width, spec.area!.height)).toEqual({
        square: 0,
        x: user.targets[0],
        unit: user.targets[1],
      });
      expect([spec.targetX, spec.targetConst]).toEqual(user.targets);
      expect(spec.unopenedFrameFeedback).toBeTruthy();
    }
  });

  it("every one parses to the SAME object it parsed to before — field for field", () => {
    // The pre-existing shape, written out here rather than read from the schema: the nine fields
    // AlgebraTilesSpec had before this session, three of them defaulted.
    const drift: string[] = [];
    for (const { file, where, raw } of SPECS) {
      const parsed = AlgebraTilesSpec.parse(raw) as Record<string, unknown>;
      const areaUser = AREA_USERS.find((u) => pathKey(file).endsWith(u.file) && u.where === where);
      const expected: Record<string, unknown> = {
        type: "algebraTiles",
        prompt: raw.prompt,
        targetX: raw.targetX,
        targetConst: raw.targetConst,
        maxTiles: raw.maxTiles ?? 8,
        xStart: raw.xStart ?? 0,
        constStart: raw.constStart ?? 0,
        successFeedback: raw.successFeedback,
        xFeedback: raw.xFeedback,
        constFeedback: raw.constFeedback,
        ...(areaUser
          ? { area: raw.area, partialProductFeedback: raw.partialProductFeedback, unopenedFrameFeedback: raw.unopenedFrameFeedback }
          : {}),
      };
      const norm = (o: Record<string, unknown>) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));
      if (norm(parsed) !== norm(expected)) {
        drift.push(`${file}${where}\n  got: ${JSON.stringify(parsed)}\n  was: ${JSON.stringify(expected)}`);
      }
    }
    expect(drift).toEqual([]);
  });

  it("the gallery sample is likewise untouched", () => {
    const sample = (SAMPLES as TWidget[]).find((s) => s.type === "algebraTiles")!;
    const parsed = WidgetSpec.parse(sample) as Record<string, unknown>;
    expect("area" in parsed).toBe(false);
    expect("targetSquare" in parsed).toBe(false);
    expect(Object.keys(parsed).sort()).toEqual(
      ["constFeedback", "constStart", "maxTiles", "prompt", "successFeedback", "targetConst", "targetX", "type", "xFeedback", "xStart"].sort()
    );
  });
});

describe("the new fields, when a spec does opt in", () => {
  const base = {
    type: "algebraTiles" as const,
    prompt: "Multiply 3(x + 2) with tiles.",
    targetX: 6,
    targetConst: 6,
    maxTiles: 12,
    successFeedback: "s",
    xFeedback: "x",
    constFeedback: "c",
  };

  it("accepts an a(x + b) rectangle in distribute mode", () => {
    const spec = AlgebraTilesSpec.parse({
      ...base,
      area: { width: [0, 3], height: [1, 2], mode: "distribute" },
      partialProductFeedback: "p",
    });
    expect(spec.area).toEqual({ width: [0, 3], height: [1, 2], mode: "distribute" });
    expect(spec.targetSquare).toBeUndefined();
  });

  it("accepts an (x + a)(x + b) rectangle in factor mode, with x² tiles", () => {
    const spec = AlgebraTilesSpec.parse({
      ...base,
      targetSquare: 1,
      targetX: 5,
      targetConst: 6,
      area: { width: [1, 2], height: [1, 3], mode: "factor" },
      frameMismatchFeedback: "f",
    });
    expect(spec.targetSquare).toBe(1);
    expect(spec.area?.mode).toBe("factor");
  });

  it("rejects a malformed edge", () => {
    expect(() => AlgebraTilesSpec.parse({ ...base, area: { width: [1], height: [1, 2], mode: "factor" } })).toThrow();
    expect(() => AlgebraTilesSpec.parse({ ...base, area: { width: [1, 2], height: [1, 2], mode: "expand" } })).toThrow();
    expect(() => AlgebraTilesSpec.parse({ ...base, targetSquare: 1.5 })).toThrow();
  });
});

describe("algebraTilesPartials — the multiplication table, by hand", () => {
  it("3(x + 2) lays out 3 x-tiles and 6 units, and no square", () => {
    // width (0·x + 3), height (1·x + 2): square 0·1 = 0; x 0·2 + 3·1 = 3; unit 3·2 = 6
    expect(algebraTilesPartials([0, 3], [1, 2])).toEqual({ square: 0, x: 3, unit: 6 });
  });

  it("(x + 2)(x + 3) lays out one square, five x-tiles and six units", () => {
    // square 1·1 = 1; x 1·3 + 2·1 = 5; unit 2·3 = 6  →  x² + 5x + 6
    expect(algebraTilesPartials([1, 2], [1, 3])).toEqual({ square: 1, x: 5, unit: 6 });
  });

  it("carries signs through, so (x − 2)(x + 3) is x² + x − 6", () => {
    // square 1; x 1·3 + (−2)·1 = 1; unit (−2)·3 = −6
    expect(algebraTilesPartials([1, -2], [1, 3])).toEqual({ square: 1, x: 1, unit: -6 });
  });

  it("2x(x + 4) is two squares and eight x-tiles", () => {
    // width (2x + 0), height (x + 4): square 2; x 2·4 + 0 = 8; unit 0
    expect(algebraTilesPartials([2, 0], [1, 4])).toEqual({ square: 2, x: 8, unit: 0 });
  });

  it("agrees with expanding the product independently, over a sweep", () => {
    for (let w1 = -2; w1 <= 2; w1++)
      for (let w0 = -3; w0 <= 3; w0++)
        for (let h1 = -2; h1 <= 2; h1++)
          for (let h0 = -3; h0 <= 3; h0++) {
            // Independent route: evaluate both sides at three x values and compare, which pins the
            // polynomial identity without reusing the coefficient formula.
            const p = algebraTilesPartials([w1, w0], [h1, h0]);
            for (const x of [-2, 1, 5]) {
              // `===` rather than `toBe`, because either side may legitimately be −0 here and −0
              // is the same NUMBER as 0 — which is the claim under test.
              expect((w1 * x + w0) * (h1 * x + h0) === p.square * x * x + p.x * x + p.unit).toBe(true);
            }
          }
  });
});
