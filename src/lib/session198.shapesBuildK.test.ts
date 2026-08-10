import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { WidgetSpec, widgetIntegrityErrors, type TWidget } from "./schema";
import { evaluate } from "./evaluate";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";

const require2 = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { solvePrompt: solveG0 } = require2("./g0Independent.cjs");

/** S198 — shapes-build-k (K.G.A.1-3, K.G.B.4-6), Batch G course 6/6. Zero new generator code.
 *
 *  BRANCHED-SOLVER CONTRACTS PINNED (each g0Independent case below has 2+ prompt shapes, and an
 *  authored prompt that drifts off-shape silently grades every learner answer wrong):
 *  - shapePositionMcq: 'opposite position of \u201cWORD\u201d' (curly quotes) -> opposite from the 8-entry
 *    map; the CURLY quotes are load-bearing (the solver's regex matches them, not ASCII quotes).
 *  - shapePositionTap: correctness must equal label-contains-relation, because the solver finds
 *    the hotspot by substring.
 *  - shapeComposeMcq: 'How many triangles build N squares?' -> 2N.
 *  - shapeComposeTap: exactly one hotspot labelled EXACTLY 'triangle', and it is the correct one.
 *  - shapeComposePairs: every pair verbatim from the 5-entry pieces->whole map; pairs is an
 *    OBJECT map {leftId: rightId}, not an array (schema).
 *  - shapeAnyWayMcq: 'A {shape}...' -> 'Still a {shape}'; otherwise -> 'Its sides and corners'.
 *  - shapeAnyWayTap: selectAll; correctness == label-contains-target for every hotspot.
 *  - shapeRollStackMcq: 'Why can cans...' -> flat-ends answer; otherwise -> 'A sphere'.
 *  - shapeRollStackTap: correct hotspot labelled 'cubes'.
 *
 *  ADAPT-3 ROUTE: authored position-framed hops + unitRuler i1s (per the course-5 correction);
 *  each lesson must carry one of {unitRuler, balanceScale, numberLineHop}. */

const DIR = join(__dirname, "../../content/courses/shapes-build-k");
const FAMILIES = ["g0-counting", "k0-count-100", "g0-shapes-sorting"] as const;
const registered: Record<string, Set<string>> = {};
for (const tag of FAMILIES) {
  registered[tag] = new Set(
    (VARIANT_GENERATORS.find((g) => g.tag === tag)?.forms ?? []) as string[]
  );
}
const CAPS = JSON.parse(
  readFileSync(join(__dirname, "../../scripts/engine-capabilities.json"), "utf8")
).types as Record<string, { manip: number; adapt: number }>;

const lessons = readdirSync(join(DIR, "lessons")).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, "lessons", f), "utf8")));
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const ADAPT3 = ["unitRuler", "balanceScale", "numberLineHop"];
const OPP: Record<string, string> = { "above": "below", "below": "above", "in front of": "behind",
  "behind": "in front of", "inside": "outside", "outside": "inside", "left of": "right of", "right of": "left of" };
const PAIR_MAP: Array<[string, string]> = [
  ["two triangles", "a square"],
  ["two squares side by side", "a rectangle"],
  ["six squares folded up", "a cube"],
  ["two half-circles", "a circle"],
  ["four equal triangles", "a larger square"],
];

describe("S198 shapes-build-k — course shape and recipe", () => {
  it("grade K, 3 chapters sized 5/5/4, files match course.json", () => {
    const cj = JSON.parse(readFileSync(join(DIR, "course.json"), "utf8"));
    expect(cj.gradeLevel).toBe(0);
    expect(cj.chapters.map((c: { lessonIds: string[] }) => c.lessonIds.length)).toEqual([5, 5, 4]);
    const declared = cj.chapters.flatMap((c: { lessonIds: string[] }) => c.lessonIds);
    expect(declared).toHaveLength(14);
    expect(lessons.map((l) => l.id)).toEqual(declared);
  });

  it("every lesson: predict + adapt-3 engine + interactive manip>=2 + early caps", () => {
    for (const lesson of lessons) {
      expect(lesson.steps[1].predict, `${lesson.id}: i1 predict step missing`).toBeDefined();
      const types = (lesson.steps as Array<{ widget?: { type: string } }>)
        .filter((s) => s.widget).map((s) => s.widget!.type);
      expect(types.some((t) => ADAPT3.includes(t)),
        `${lesson.id}: no adapt-3 engine among [${[...new Set(types)].join(", ")}]`).toBe(true);
      for (const s of lesson.steps as Array<{ id: string; kind: string; widget?: { type: string } }>) {
        if (s.kind === "interactive" && s.widget) {
          expect(CAPS[s.widget.type]?.manip ?? 0,
            `${lesson.id}/${s.id}: interactive ${s.widget.type}`).toBeGreaterThanOrEqual(2);
        }
      }
      expect(lesson.readingProfile).toBe("early");
      for (const s of lesson.steps as Array<{ id: string; kind: string; body?: string }>) {
        if (s.kind === "concept" && s.body) {
          expect(words(s.body), `${lesson.id}/${s.id} over the 25-word cap`).toBeLessThanOrEqual(25);
        }
      }
    }
  });

  it("every declared form registered and generating its authored surface; the composition family is used", () => {
    const seen = new Map<string, { gen: string; type: string }>();
    for (const lesson of lessons) {
      for (const s of lesson.steps as Array<{ id: string; variant?: { gen: string; form: string }; widget?: { type: string } }>) {
        if (!s.variant) continue;
        expect(FAMILIES).toContain(s.variant.gen);
        expect(registered[s.variant.gen].has(s.variant.form),
          `${lesson.id}/${s.id}: ${s.variant.gen}/${s.variant.form} NOT registered`).toBe(true);
        if (s.widget) seen.set(s.variant.form, { gen: s.variant.gen, type: s.widget.type });
      }
    }
    for (const needed of ["shapePositionMcq", "shapeComposeMcq", "shapeComposePairs", "shapeAnyWayTap", "shapeRollStackMcq"]) {
      expect(seen.has(needed), `${needed} must actually be exercised by the course`).toBe(true);
    }
    for (const [form, { gen, type }] of seen) {
      const v = variantForGenForm(gen, form, `s198-surface6-${form}`, "core");
      expect(v, `${gen}/${form} generated nothing`).toBeTruthy();
      expect(v!.widget.type, `${form} authored as ${type} but GENERATES ${v!.widget.type}`).toBe(type);
    }
  });
});

describe("S198 shapes-build-k — branched-solver contracts", () => {
  for (const lesson of lessons) {
    it(`${lesson.id}: prompt branches, tap rules, pair map, solver agreement`, () => {
      expect(lesson.steps.map((s: { kind: string }) => s.kind)).toEqual(
        ["concept", "interactive", "check", "concept", "interactive", "check", "check", "challenge", "recap"]
      );

      for (const s of lesson.steps) {
        if (!s.widget) continue;
        const w = WidgetSpec.parse(s.widget) as TWidget;
        expect(widgetIntegrityErrors(w)).toEqual([]);

        if (w.type === "mcq") {
          const correct = w.options.filter((o) => o.correct);
          expect(correct).toHaveLength(1);
          expect(w.options[0].correct).toBe(true);
          expect(w.options.length).toBeGreaterThanOrEqual(4);
          for (const o of w.options) expect(o.feedback.length).toBeGreaterThanOrEqual(25);
          expect(new Set(w.options.map((o) => o.feedback)).size).toBe(w.options.length);
          expect(evaluate(w, correct[0].id).correct).toBe(true);

          if (s.variant?.form === "shapePositionMcq") {
            const m = w.prompt.match(/\u201c(.+?)\u201d/);
            expect(m, `${lesson.id}/${s.id}: positionMcq must quote the word in CURLY quotes — the solver regex needs them`).toBeTruthy();
            expect(correct[0].label).toBe(OPP[m![1]]);
          }
          if (s.variant?.form === "shapeComposeMcq" && /build (\d+) squares/.test(w.prompt)) {
            const n = Number(w.prompt.match(/build (\d+) squares/)![1]);
            expect(correct[0].label, `${lesson.id}/${s.id}: composeMcq answer must be 2N`).toBe(String(2 * n));
          }
          if (s.variant?.form === "shapeAnyWayMcq") {
            if (w.prompt.startsWith("A ")) {
              const shape = w.prompt.match(/^A (\w+)/)![1];
              expect(correct[0].label).toBe(`Still a ${shape}`);
            } else {
              expect(correct[0].label).toBe("Its sides and corners");
            }
          }
          if (s.variant?.form === "shapeRollStackMcq") {
            expect(correct[0].label).toBe(
              w.prompt.startsWith("Why can cans") ? "Their flat circle ends rest on one another" : "A sphere");
          }
          if (s.variant) {
            const input = `${w.prompt}||${w.options.map((o) => o.label).join(";;")}`;
            expect(String(solveG0(s.variant.form, input)),
              `${lesson.id}/${s.id} ${s.variant.form}: solver disagrees`).toBe(correct[0].label);
          }
        }

        if (w.type === "tapDiagram") {
          const correctHs = w.hotspots.filter((h) => h.correct);
          if (w.mode === "selectAll") {
            expect(correctHs.length).toBeGreaterThanOrEqual(1);
            expect(correctHs.length).toBeLessThan(w.hotspots.length);
          } else {
            expect(correctHs).toHaveLength(1);
          }
          for (const h of w.hotspots) {
            expect(h.label.includes(",")).toBe(false);
            if (!h.correct) expect((h.feedback ?? "").length).toBeGreaterThanOrEqual(25);
          }
          if (s.variant?.form === "shapePositionTap") {
            const rel = w.prompt.match(/is (above|below|beside) the table/)![1];
            for (const h of w.hotspots) {
              expect(h.correct, `${lesson.id}/${s.id}: "${h.label}" — the solver matches by label-contains-"${rel}"`)
                .toBe(h.label.includes(rel));
            }
          }
          if (s.variant?.form === "shapeComposeTap") {
            const tri = w.hotspots.filter((h) => h.label === "triangle");
            expect(tri, `${lesson.id}/${s.id}: exactly one hotspot labelled exactly 'triangle'`).toHaveLength(1);
            expect(tri[0].correct).toBe(true);
          }
          if (s.variant?.form === "shapeAnyWayTap") {
            const target = w.prompt.includes("circle") ? "circle" : "triangle";
            for (const h of w.hotspots) expect(h.correct).toBe(h.label.includes(target));
            const input = `${w.prompt}||${w.hotspots.map((h) => h.label).join(",")}`;
            const derived = solveG0("shapeAnyWayTap", input) as string[];
            expect(derived).toEqual(w.hotspots.filter((h) => h.correct).map((h) => h.label).sort());
          }
          if (s.variant?.form === "shapeRollStackTap") {
            expect(correctHs[0].label).toBe("cubes");
            const input = `${w.prompt}||${w.hotspots.map((h) => h.label).join(",")}`;
            expect(solveG0("shapeRollStackTap", input)).toEqual(["cubes"]);
          }
        }

        if (w.type === "matchPairs") {
          expect(Array.isArray(w.pairs), `${lesson.id}/${s.id}: pairs must be an OBJECT map (schema), not an array`).toBe(false);
          const leftById = new Map(w.left.map((x: { id: string; label: string }) => [x.id, x.label]));
          const rightById = new Map(w.right.map((x: { id: string; label: string }) => [x.id, x.label]));
          expect(Object.keys(w.pairs)).toHaveLength(w.left.length);
          for (const [pl, pr] of Object.entries(w.pairs as Record<string, string>)) {
            const l = leftById.get(pl), rv = rightById.get(pr);
            expect(PAIR_MAP.some(([a, b]) => a === l && b === rv),
              `${lesson.id}/${s.id}: pair (${l} -> ${rv}) is not in the solver's 5-entry map`).toBe(true);
          }
        }

        if (w.type === "numberLineHop") {
          const land = w.direction === "back" ? w.start - w.hop * w.hops : w.start + w.hop * w.hops;
          expect(land).toBeGreaterThan(w.min);
          expect(land).toBeLessThan(w.max);
          expect(w.commonLandings.length).toBeGreaterThanOrEqual(2);
          for (const t of w.commonLandings) {
            expect(t.value).not.toBe(land);
            expect(t.feedback.length).toBeGreaterThanOrEqual(25);
          }
        }

        if (w.type === "unitRuler") {
          expect(w.requiredPlacements).toBe((w.objectEnd - w.objectStart) / w.targetUnitSize);
        }
      }

      for (const s of lesson.steps.filter((x: { kind: string }) => x.kind === "check" || x.kind === "challenge")) {
        expect(s.hints.length).toBeGreaterThanOrEqual(2);
        expect(s.explanationVariants.length).toBeGreaterThanOrEqual(2);
      }
    });
  }
});
