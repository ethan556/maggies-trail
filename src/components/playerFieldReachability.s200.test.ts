/**
 * AUTHORED-FIELD REACHABILITY (s200).
 *
 * The S200 defect class: content is authored on a step KIND that the player's render gate
 * excludes, so the field validates, scores, and renders correctly — and no learner can ever
 * reach it. It has now bitten at least three times:
 *
 *   1. `figure` gated on kind === "concept"  -> stranded 2 interactive construction steps
 *      (cp-01-02 i1, cp-01-03 i1); fixed before S200.
 *   2. `hints` gated on kind === challenge|check -> stranded 118 interactive ladders (S200).
 *   3. `explanationVariants` on the same gate  -> stranded 118 interactive pairs (S200).
 *
 * Nothing caught any of them. validate:content proves the content is well-formed; lint:pedagogy
 * proves it is pedagogically shaped; neither asks whether the player renders a path to it. The
 * defect is only visible by crossing *authored fields by step kind* with *render conditions*.
 *
 * This is that cross-check, as a gate. CONSUMERS below is a hand-declared map from an authored
 * (field, kind) pair to the code that consumes it. The corpus is walked, every (field, kind) pair
 * actually present is collected, and any pair without a declared consumer fails.
 *
 * Consequence for a future session: authoring `hints` on a kind that has never carried them, or
 * introducing a new step field, fails HERE — at which point you either wire a consumer or record
 * why the pair is deliberately inert. It cannot be stranded silently.
 *
 * This test reads the filesystem and names the corpus, so it belongs to the `content` group.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type Kind = "concept" | "interactive" | "check" | "challenge" | "recap";

/**
 * Declared consumer for each (field, kind) pair the corpus is allowed to author.
 * `null` means "deliberately inert on this kind" and MUST carry a reason.
 */
const CONSUMERS: Record<string, Partial<Record<Kind, string>>> = {
  id: {
    concept: "player queue keying", interactive: "player queue keying", check: "player queue keying",
    challenge: "player queue keying", recap: "player queue keying"
  },
  kind: {
    concept: "LessonPlayer branch", interactive: "LessonPlayer branch", check: "LessonPlayer branch",
    challenge: "LessonPlayer branch", recap: "LessonPlayer branch"
  },
  body: {
    concept: "LessonPlayer prose block", interactive: "LessonPlayer prose block",
    check: "LessonPlayer prose block", challenge: "LessonPlayer prose block",
    recap: "LessonPlayer prose block"
  },
  widget: {
    interactive: "WidgetView via LessonPlayer stage",
    check: "WidgetView via LessonPlayer stage",
    challenge: "WidgetView via LessonPlayer stage"
  },
  hints: {
    // S200 fix: gate is `actionable && hintsShown < hints.length`, not step kind.
    interactive: "LessonPlayer hint control (availability-gated)",
    check: "LessonPlayer hint control (availability-gated)",
    challenge: "LessonPlayer hint control (availability-gated)"
  },
  explanationVariants: {
    // S200 fix: `finalized && actionable && s.explanationVariants`.
    interactive: "LessonPlayer showExplanation (availability-gated)",
    check: "LessonPlayer showExplanation (availability-gated)",
    challenge: "LessonPlayer showExplanation (availability-gated)"
  },
  figure: {
    // Pre-S200 fix of the same class: availability + FIGURE_IDS membership, not kind.
    concept: "LessonPlayer figure block (FIGURE_IDS-gated)",
    interactive: "LessonPlayer figure block (FIGURE_IDS-gated)"
  },
  predict: { interactive: "LessonPlayer prediction block + seededShuffle" },
  takeaways: { recap: "LessonPlayer recap block" },
  teaser: { recap: "LessonPlayer recap block (Next up)" },
  narration: { concept: "speech.narrationFor(), preferred over body by the Listen control" },
  cml: {
    interactive: "resolveCMLMeta (kind-agnostic) -> CausalMasteryPanel + undo/restore",
    check: "resolveCMLMeta (kind-agnostic) -> CausalMasteryPanel + undo/restore",
    challenge: "resolveCMLMeta (kind-agnostic) -> CausalMasteryPanel + undo/restore"
  },
  variant: {
    interactive: "variants.ts seeded generator (step.variant.gen/form)",
    check: "variants.ts seeded generator (step.variant.gen/form)",
    challenge: "variants.ts seeded generator (step.variant.gen/form)"
  },
  conceptTag: {
    interactive: "process-signal ledger only — interactive steps emit process evidence, never graded mastery (playerStore finalize, by design)",
    check: "mastery applyResult via playerStore finalize",
    challenge: "mastery applyResult via playerStore finalize"
  }
};

interface Pair { field: string; kind: Kind; count: number; example: string }

function collectPairs(): Map<string, Pair> {
  const root = join(process.cwd(), "content", "courses");
  const pairs = new Map<string, Pair>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { walk(path); continue; }
      if (!entry.name.endsWith(".json")) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(readFileSync(path, "utf8")); } catch { continue; }
      const lesson = parsed as { id?: string; steps?: Array<Record<string, unknown>> };
      if (!lesson.id || !Array.isArray(lesson.steps)) continue;
      for (const step of lesson.steps) {
        const kind = step.kind as Kind;
        for (const field of Object.keys(step)) {
          const key = `${field}::${kind}`;
          const existing = pairs.get(key);
          if (existing) existing.count += 1;
          else pairs.set(key, { field, kind, count: 1, example: `${lesson.id}:${String(step.id)}` });
        }
      }
    }
  };
  walk(root);
  return pairs;
}

const pairs = collectPairs();

describe("authored step fields are reachable", () => {
  it("walks the whole corpus", () => {
    // Guards against the walk silently finding nothing and the suite passing vacuously.
    expect(pairs.size).toBeGreaterThan(10);
    expect(pairs.get("body::concept")?.count).toBeGreaterThan(3000);
  });

  it("every authored (field, kind) pair has a declared consumer", () => {
    const undeclared = [...pairs.values()]
      .filter((p) => CONSUMERS[p.field]?.[p.kind] === undefined)
      .map((p) => `${p.field} on kind "${p.kind}" (${p.count} steps, e.g. ${p.example}) — no declared consumer`);
    expect(undeclared).toEqual([]);
  });

  it("pins the three known stranding repairs at corpus level", () => {
    // If any of these pairs disappears from the corpus the pin is stale, not passing by luck.
    expect(pairs.get("hints::interactive")?.count).toBe(118);
    expect(pairs.get("explanationVariants::interactive")?.count).toBe(118);
    expect(pairs.get("figure::interactive")?.count).toBe(2);

    // And each is declared reachable rather than merely tolerated.
    expect(CONSUMERS.hints.interactive).toMatch(/availability-gated/);
    expect(CONSUMERS.explanationVariants.interactive).toMatch(/availability-gated/);
    expect(CONSUMERS.figure.interactive).toMatch(/FIGURE_IDS-gated/);
  });

  it("does not declare consumers for pairs the corpus never authors", () => {
    // Keeps CONSUMERS honest: a stale declaration would otherwise mask a removed field.
    const declared = Object.entries(CONSUMERS).flatMap(([field, byKind]) =>
      Object.keys(byKind).map((kind) => `${field}::${kind}`)
    );
    const stale = declared.filter((key) => !pairs.has(key));
    expect(stale).toEqual([]);
  });
});
