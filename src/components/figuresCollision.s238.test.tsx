// @vitest-environment jsdom
// OPT-IN FIGURE MEASUREMENT (S238 wave 10) — the figures.tsx ledger, opened the way the
// widgets.tsx one was (collisionSweep.s238.test.tsx): measure everything first, commit the
// measurement, then close by size. figures.tsx holds ~1,800 NAMED, zero-prop, fully static
// concept figures — one render each IS the whole reachable space (no specs, no tones, no
// learner state), which makes this sweep far cheaper than the widget one.
//
// Weighting: a figure colliding in 40 lessons matters more than one used once, so every row
// carries its authored usage count, read from the corpus (steps' `figure` key — the ONLY way
// a figure reaches a learner).
//
// Not a gate — it counts, it does not fail on collisions — and it is SKIPPED unless
// FIGURE_SWEEP=1:
//   FIGURE_SWEEP=1 npx vitest run src/components/figuresCollision.s238.test.tsx
// Rewrites COWORK_CACHE/figure-collision-remainder-s238.csv. The box model's limits apply
// (textBoxes.testkit.ts): tspans and rotated labels are SKIPPED AND COUNTED per figure, so a
// figure cannot go quiet by becoming unmeasurable — the skip column keeps it visible.
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FIGURES } from "./figures";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

function usageCounts(): Map<string, number> {
  const uses = new Map<string, number>();
  const courses = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        steps: Array<{ figure?: string }>;
        remedials?: Array<{ check?: { figure?: string }; concept?: { figure?: string } }>;
      };
      const all = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))];
      for (const s of all) if (s.figure) uses.set(s.figure, (uses.get(s.figure) ?? 0) + 1);
    }
  }
  return uses;
}

/* S242 / VIS-00 — BLOCKING. This sweep covers every figures.tsx placement (7s) and was behind FIGURE_SWEEP=1, so it ran only
 * when somebody remembered to ask. VIS-00 requires every graph gate to block; it passes clean
 * at this seal, so there is nothing to ratchet down from — zero is the entry state. */
describe("S238 figures.tsx collision sweep", () => {
  it("measures every registered figure once", () => {
    const uses = usageCounts();
    const rows: string[] = ["figure_id,uses,pairs,skipped_texts,detail"];
    let figures = 0, rendersFailed = 0, totalPairs = 0, totalSkipped = 0, dirtyFigures = 0;
    const perFigure: Array<{ id: string; pairs: number }> = [];
    for (const [id, F] of Object.entries(FIGURES)) {
      figures++;
      try {
        const { container } = render(<F />);
        let pairs = 0, skippedN = 0;
        const details: string[] = [];
        for (const svg of Array.from(container.querySelectorAll("svg"))) {
          const { boxes, skipped } = scanTextBoxes(svg);
          skippedN += skipped.length;
          const hits = collisions(boxes);
          pairs += hits.length;
          details.push(...hits.slice(0, 3).map(describeCollision));
        }
        if (pairs > 0 || skippedN > 0) {
          rows.push([id, uses.get(id) ?? 0, pairs, skippedN, JSON.stringify(details.join(" | "))].join(","));
        }
        if (pairs > 0) {
          dirtyFigures++;
          perFigure.push({ id, pairs });
        }
        totalPairs += pairs;
        totalSkipped += skippedN;
      } catch (err) {
        rendersFailed++;
        rows.push([id, uses.get(id) ?? 0, "RENDER_FAILED", 0, JSON.stringify(String((err as Error).message).slice(0, 80))].join(","));
      }
      cleanup();
    }
    rows.push("");
    rows.push("# worst figures (colliding pairs, weight by the uses column when fixing)");
    for (const f of perFigure.sort((a, b) => b.pairs - a.pairs).slice(0, 30)) rows.push(`# ${f.id},${f.pairs}`);
    rows.push(`# figures: ${figures}; with collisions: ${dirtyFigures}; total pairs: ${totalPairs}; skipped texts: ${totalSkipped}; renders failed: ${rendersFailed}`);
    // S242. Tracked artifact — regenerate deliberately, not as a side effect of every test run.
    if (process.env.UPDATE_COLLISION_REMAINDER === "1") {
      writeFileSync(join(process.cwd(), "COWORK_CACHE", "figure-collision-remainder-s238.csv"), rows.join("\n") + "\n");
    }
    expect(figures).toBeGreaterThan(1000);
  }, 600_000);
});
