/**
 * S242 — THE VARIANT DECLARATION MUST SURVIVE THE TRIP TO THE LEARNER.
 *
 * WHAT THIS CLOSES. A step can declare its own generator (`step.variant = { gen, form }`), and
 * `variantForStep` documents that declaration as outranking the step's conceptTag alias — "the
 * only way a manipulative item living inside a numeric tag can be refreshed at all". That branch
 * was unreachable from both learner practice surfaces, for two independent reasons that compounded:
 *
 *   1. NEITHER POOL BUILDER FORWARDED IT. `practice/[chapterId]/page.tsx` and
 *      `api/review-steps/route.ts` each build their item by enumerating fields into an object
 *      literal. Both enumerated `conceptTag` and omitted `variant`. A declaration that took an
 *      author a decision to write was dropped one function before the resolver that reads it.
 *
 *   2. A CHEAP PRE-FILTER OUTRANKED THE RESOLVER. `PracticeClient` and `ReviewClient` both guarded
 *      the call with `hasVariants(conceptTag)`, which consults only the 442 generator tags and the
 *      55-key alias table — it never looks at `step.variant`. So even a forwarded declaration was
 *      skipped whenever its conceptTag did not independently resolve, which is the common case:
 *      5,431 declaring steps across 1,504 distinct conceptTags.
 *
 * MEASURED AT THE FIX (seal 2d5f39f, all 129 courses): 419 of 6,762 pool-eligible practice items
 * were refreshable, and 457 of 526 chapters had NO refreshable practice at all. After: 6,027 of
 * 6,762, and 33 chapters. The generators, the seeds and the determinism proof were all already
 * correct — only the wiring was not.
 *
 * WHY A SOURCE ASSERTION AND NOT ONLY A BEHAVIOURAL ONE. The behavioural half (below) proves the
 * resolver honours a declaration; it passed for the entire period the bug was live, because the
 * resolver was never the broken part. The defect lived in two object literals and two guards, and
 * only an assertion shaped like the defect can catch its return. This is the same reasoning the
 * S241 avatar episode recorded: `avatars.test.ts` passed 27/27 while zero avatars shipped, because
 * it asserted the mechanism rather than the delivery.
 *
 * DELIBERATELY NOT ASSERTED HERE:
 *   · WHICH form wins when a step declares one and its alias implies another. Forwarding the
 *     declaration makes the declared form authoritative, which is what the resolver's own comment
 *     says should happen — but whether that is the right pedagogy for the ~227 items that were
 *     already being served through the alias path is an ARCH-03 canonical-state question, not a
 *     wiring one. Six items currently resolve through an alias to a differently-named generator
 *     (sp-03-01 declares `prob-fraction/spinner`, receives `probability-fraction`); that set is
 *     recorded in WAVE0_TRUTH_BASELINE_S242.md §3 and left for a ruling.
 *   · Mastery Studio, which passes the real TStep and was never affected.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { variantForStep } from "./variants";

const ROOT = process.cwd();
const COURSES = join(ROOT, "content", "courses");

type Declaring = { lessonId: string; stepId: string; gen: string; form?: string; surface: string; conceptTag: string };

function declaringPoolSteps(): Declaring[] {
  const out: Declaring[] = [];
  for (const course of readdirSync(COURSES).sort()) {
    let files: string[];
    try {
      files = readdirSync(join(COURSES, course, "lessons"));
    } catch {
      continue;
    }
    for (const file of files.filter((f) => f.endsWith(".json")).sort()) {
      const lesson = JSON.parse(readFileSync(join(COURSES, course, "lessons", file), "utf8"));
      for (const step of lesson.steps ?? []) {
        // The exact pool predicate both surfaces use.
        if (!((step.kind === "check" || step.kind === "challenge") && step.widget && step.conceptTag)) continue;
        if (!step.variant?.gen) continue;
        out.push({
          lessonId: lesson.id,
          stepId: step.id,
          gen: step.variant.gen,
          form: step.variant.form,
          surface: step.widget.type,
          conceptTag: step.conceptTag
        });
      }
    }
  }
  return out;
}

describe("S242 — the practice pool builder forwards the step's generator declaration", () => {
  const source = readFileSync(join(ROOT, "src/app/(shell)/practice/[chapterId]/page.tsx"), "utf8");

  it("copies `variant` into the pool item", () => {
    // Shaped like the defect: the literal enumerates fields, so the test names the field.
    expect(source).toMatch(/variant:\s*s\.variant/);
  });

  it("still copies the fields the item cannot render without", () => {
    for (const field of ["widget", "conceptTag", "lessonId", "stepId"]) {
      expect(source).toContain(`${field}:`);
    }
  });
});

describe("S242 — the review-steps API forwards the step's generator declaration", () => {
  const source = readFileSync(join(ROOT, "src/app/api/review-steps/route.ts"), "utf8");

  it("copies `variant` onto the served item", () => {
    expect(source).toMatch(/variant:\s*step\.variant/);
  });
});

describe("S242 — no learner surface pre-filters on conceptTag before the resolver", () => {
  // hasVariants(conceptTag) is a legitimate function; using it as the GATE in front of
  // variantForStep is the bug, because it cannot see step.variant. variantForStep already
  // returns null when it cannot build, so it is the only gate either surface needs.
  const surfaces = [
    "src/app/(shell)/practice/[chapterId]/PracticeClient.tsx",
    "src/app/(shell)/review/ReviewClient.tsx"
  ];

  for (const rel of surfaces) {
    it(`${rel} does not guard variantForStep with hasVariants`, () => {
      const source = readFileSync(join(ROOT, rel), "utf8");
      const code = source
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .join("\n");
      expect(code).not.toMatch(/hasVariants\s*\(/);
    });
  }
});

describe("S242 — a declared step resolves to the generator its author declared", () => {
  const declaring = declaringPoolSteps();

  it("finds the declaring cohort the surfaces are supposed to serve", () => {
    expect(declaring.length).toBeGreaterThanOrEqual(5000);
  });

  it("serves the declared generator, at every band, for every declaring step whose surface matches", () => {
    const mismatched: string[] = [];
    const declined: string[] = [];
    for (const d of declaring) {
      for (const band of ["support", "core", "stretch"] as const) {
        const v = variantForStep(
          { widget: { type: d.surface }, conceptTag: d.conceptTag, variant: { gen: d.gen, form: d.form } },
          `s242:${d.lessonId}:${d.stepId}`,
          band
        );
        if (v === null) {
          declined.push(`${d.lessonId}#${d.stepId} ${d.gen}/${d.form ?? "default"} @${band}`);
          continue;
        }
        // The surface guard inside variantForStep must hold: a variant may never change the
        // widget type out from under an authored step.
        if (v.widget.type !== d.surface) {
          mismatched.push(`${d.lessonId}#${d.stepId} declared surface ${d.surface}, got ${v.widget.type}`);
        }
      }
    }
    expect(mismatched.slice(0, 10)).toEqual([]);
    expect(declined.slice(0, 10)).toEqual([]);
  });

  it("is deterministic — the same step and seed replay identically", () => {
    for (const d of declaring.slice(0, 400)) {
      const seed = `s242:replay:${d.lessonId}:${d.stepId}`;
      const step = { widget: { type: d.surface }, conceptTag: d.conceptTag, variant: { gen: d.gen, form: d.form } };
      const a = variantForStep(step, seed);
      const b = variantForStep(step, seed);
      expect(JSON.stringify(b)).toBe(JSON.stringify(a));
    }
  });
});

describe("S242 — delivery ratchet", () => {
  /**
   * Counts the WHOLE practice pool the way the surface does — declaration path and tag/alias path
   * together — because that is the number a learner experiences. At the fix: 6,027 of 6,762
   * (89.1%), up from 419 (6.2%). Of those, 5,835 arrive via a declaration and ~192 via the alias
   * path that already worked.
   *
   * A floor, not a target. It exists so a future refactor cannot quietly return practice to the
   * alias-only path: that regression is invisible in every other gate, because the generators
   * still work and every test that exercises them still passes. Raise it when delivery improves;
   * never lower it without recording why.
   */
  const FLOOR = 5900;

  it("at least FLOOR pool-eligible practice items are refreshable", () => {
    let pool = 0;
    let refreshable = 0;
    for (const course of readdirSync(COURSES).sort()) {
      let files: string[];
      try {
        files = readdirSync(join(COURSES, course, "lessons"));
      } catch {
        continue;
      }
      for (const file of files.filter((f) => f.endsWith(".json")).sort()) {
        const lesson = JSON.parse(readFileSync(join(COURSES, course, "lessons", file), "utf8"));
        for (const step of lesson.steps ?? []) {
          if (!((step.kind === "check" || step.kind === "challenge") && step.widget && step.conceptTag)) continue;
          pool++;
          // Exactly what the repaired pool builder hands the resolver.
          const item = { widget: step.widget, conceptTag: step.conceptTag, variant: step.variant };
          if (variantForStep(item, `s242:ratchet:${lesson.id}:${step.id}`) !== null) refreshable++;
        }
      }
    }
    expect(pool).toBeGreaterThanOrEqual(6700);
    expect(refreshable).toBeGreaterThanOrEqual(FLOOR);
  });
});
