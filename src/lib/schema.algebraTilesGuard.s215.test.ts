/**
 * S215b — the mixed-sign area rectangle cannot be authored.
 *
 * The divergence this guard closes: the area grader compares NET tile counts (as this engine always
 * has, and as the 26 classic specs depend on — a mat carrying zero pairs denotes the same expression
 * there), while the area PICTURE counts signed cells. They part company when one kind's cells carry
 * both signs. `(x − 2)(x + 3)` is the smallest case — three positive x strips and two negative — and
 * a mat holding ONE positive x-tile grades CORRECT while the picture correctly reports "8 of 12
 * parts covered".
 *
 * Fable-QA's finding was not that the divergence existed — it was disclosed — but that it shipped
 * UNGUARDED: the constraint lived in a comment inside a test file, and nothing stopped the next
 * author creating the state. `widgetIntegrityErrors` had no `algebraTiles` case at all.
 *
 * Two things are proved here. That the guard fires on the real authoring path — `lintLesson`, which
 * is what `npm run lint:pedagogy` runs over `content/**`, not a direct call to the predicate. And
 * that it is silent on every algebraTiles spec that actually exists, including the one authored area
 * step, so nothing shipped is retroactively refused.
 *
 * This is the CHEAP closure, deliberately. The proper one is a population check inside the AREA
 * grader (leaving nets alone for the classic mat, which must not move); until that exists this guard
 * is what keeps the divergence away from a learner.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Lesson, WidgetSpec, widgetIntegrityErrors, type TLesson, type TWidget } from "@/lib/schema";
import { lintLesson } from "@/lib/pedagogy";

const areaSpec = (width: [number, number], height: [number, number], mode: "distribute" | "factor" = "distribute") => ({
  type: "algebraTiles" as const,
  prompt: "Fill the rectangle.",
  targetX: 0,
  targetConst: 0,
  maxTiles: 8,
  area: { width, height, mode },
  successFeedback: "Every part of the rectangle is produced, and together they are the expansion.",
  xFeedback: "The long tiles do not match the rectangle's x strips yet — count the strips again.",
  constFeedback: "The unit tiles do not match the rectangle's corner block yet — count the corner."
});

const errorsFor = (raw: ReturnType<typeof areaSpec>) => widgetIntegrityErrors(WidgetSpec.parse(raw) as TWidget);
const mixedSignError = (errs: string[]) => errs.filter((e) => e.startsWith("algebraTiles:") && e.includes("x-tiles"));

describe("the guard, on the shapes the engine can be given", () => {
  it("refuses (x − 2)(x + 3), naming the counts and the reason", () => {
    const errs = mixedSignError(errorsFor(areaSpec([1, -2], [1, 3])));
    expect(errs.length).toBe(1);
    // Three positive strips (the height's 3 units against the width's x) and two negative (the
    // height's x against the width's −2), for the net of 1 that the grader would have accepted.
    expect(errs[0]).toContain("3 positive and 2 negative x-tiles");
    expect(errs[0]).toContain("net of 1");
    expect(errs[0]).toContain("NET tile counts");
  });

  it("refuses it the other way round too — the rule is symmetric in the two edges", () => {
    expect(mixedSignError(errorsFor(areaSpec([1, 3], [1, -2]))).length).toBe(1);
  });

  it("allows every shape whose x strips share a sign", () => {
    const allowed: Array<[[number, number], [number, number], string]> = [
      [[1, 3], [1, 2], "(x + 3)(x + 2) — the shape the x² control unlocked"],
      [[1, -1], [1, -2], "(x − 1)(x − 2) — both parts negative, so both strip groups are negative"],
      [[0, -3], [1, 2], "-3(x + 2) — the one authored area step"],
      [[0, 4], [1, 5], "4(x + 5) — a bare positive multiplier"],
      [[2, 1], [1, 1], "(2x + 1)(x + 1) — a coefficient above 1"],
      [[1, 0], [1, 4], "x(x + 4) — one edge has no unit part, so only one strip group exists"],
      [[1, 2], [1, 0], "(x + 2)x — the same, mirrored"]
    ];
    for (const [w, h, why] of allowed) {
      expect(mixedSignError(errorsFor(areaSpec(w, h))), why).toEqual([]);
    }
  });

  it("says nothing at all about a spec with no rectangle", () => {
    const classic = WidgetSpec.parse({
      type: "algebraTiles",
      prompt: "Build 3x + 4 on the mat.",
      targetX: 3,
      targetConst: 4,
      successFeedback: "That is 3x + 4 on the mat.",
      xFeedback: "The long tiles are not right yet — count them again.",
      constFeedback: "The unit tiles are not right yet — count them again."
    }) as TWidget;
    expect(widgetIntegrityErrors(classic).filter((e) => e.startsWith("algebraTiles:"))).toEqual([]);
  });

  it("holds for factor mode as well as distribute — the divergence is about the cells, not the direction", () => {
    expect(mixedSignError(errorsFor(areaSpec([1, -2], [1, 3], "factor"))).length).toBe(1);
    expect(mixedSignError(errorsFor(areaSpec([1, 3], [1, 2], "factor")))).toEqual([]);
  });
});

describe("the guard on the REAL authoring path", () => {
  // Not a synthetic lesson. The one authored area step, read off disk, and the SAME lesson with its
  // rectangle bent to a mixed-sign one in memory — run through `lintLesson`, which is the function
  // `npm run lint:pedagogy` walks `content/**` with. Nothing is written back; the file is untouched.
  const AREA_LESSON = "content/courses/two-step-equations/lessons/tse-01-01.json";
  const load = () => JSON.parse(readFileSync(AREA_LESSON, "utf8")) as {
    steps: Array<{ widget?: { area?: { width: number[]; height: number[] } } }>;
  };
  const areaStepIndex = () => load().steps.findIndex((st) => st.widget?.area !== undefined);
  const algebraTilesErrors = (l: TLesson) => lintLesson(l).filter((e) => e.includes("algebraTiles:"));

  it("the authored lesson as it stands raises no algebraTiles integrity error", () => {
    expect(areaStepIndex()).toBeGreaterThanOrEqual(0);
    expect(algebraTilesErrors(Lesson.parse(load()))).toEqual([]);
  });

  it("bending its rectangle to (x − 2)(x + 3) makes the linter report it, keyed to the step", () => {
    const raw = load();
    const i = areaStepIndex();
    raw.steps[i].widget!.area!.width = [1, -2];
    raw.steps[i].widget!.area!.height = [1, 3];
    const errs = algebraTilesErrors(Lesson.parse(raw));
    const hit = errs.filter((e) => e.includes("negative x-tiles"));
    expect(hit.length).toBe(1);
    expect(hit[0]).toContain("3 positive and 2 negative x-tiles");
    expect(hit[0]).toContain("/i1:"); // the linter's own step key, so an author is told where
  });

  it("and the file on disk is untouched by any of that", () => {
    const onDisk = load();
    const i = areaStepIndex();
    expect(onDisk.steps[i].widget!.area!.width).toEqual([0, -3]);
    expect(onDisk.steps[i].widget!.area!.height).toEqual([1, 2]);
  });
});

describe("nothing already authored is retroactively refused", () => {
  /** Every algebraTiles spec in content, read off disk — the same enumeration the S211 test uses. */
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

  it("finds the whole authored set, and it is the 27 the S211 regression set pins", () => {
    expect(SPECS.length).toBe(27);
    expect(SPECS.filter((s) => s.raw.area !== undefined).length).toBe(1);
  });

  it("every one of them passes the guard, area step included", () => {
    for (const s of SPECS) {
      const errs = widgetIntegrityErrors(WidgetSpec.parse(s.raw) as TWidget);
      expect(errs.filter((e) => e.startsWith("algebraTiles:")), `${s.file}${s.where}`).toEqual([]);
    }
  });

  it("the one authored area spec is same-sign BY ITS SHAPE, not by luck of the guard's wording", () => {
    const area = SPECS.find((s) => s.raw.area !== undefined)!;
    const a = area.raw.area as { width: [number, number]; height: [number, number] };
    // -3(x + 2): the width has no x part, so only ONE group of x cells exists and it cannot mix.
    expect(a.width).toEqual([0, -3]);
    expect(a.height).toEqual([1, 2]);
    // `=== 0` rather than toBe: the product is -0 here, and toBe/toEqual distinguish the two zeroes.
    expect(a.height[0] * a.width[1] * (a.height[1] * a.width[0]) === 0).toBe(true);
  });
});
