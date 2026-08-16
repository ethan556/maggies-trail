/**
 * S242 / VIS-05 — EVERY FIGURE MUST RENDER.
 *
 * `figures.tsx` is 29,656 lines and 1,871 hand-written inline-SVG components, and until this file
 * **nothing in the repository exercised any of them at runtime.** Typecheck proves they compile;
 * the content gates prove the ids are registered and placed. Neither calls one.
 *
 * A figure that throws renders as NOTHING — `FigureView` wraps it in a dynamic import with a
 * loading placeholder, so the failure is a silent blank where an illustration should be, on
 * whatever lessons place it. That is exactly the class of defect that stays invisible until a
 * learner meets it.
 *
 * The check is cheap because these components are pure: no props, no state, no data. Rendering all
 * 1,871 to static markup takes seconds and is the only thing standing between a broken figure and
 * production.
 *
 * WHY IT ALSO ASSERTS A TITLE. `<title>` is the figure's accessible name — the entire content a
 * non-visual learner receives — and it is what VIS-03 and VIS-04 read to judge whether a figure
 * belongs beside its lesson. A figure without one is invisible to a screen reader and to both
 * audits at once.
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FIGURES } from "./figures";

/** Measured at seal 3609926, 2026-08-16. Lower it when figures gain titles; never raise it. */
const UNTITLED_BASELINE = 0;

describe("VIS-05 — figure render health", () => {
  const ids = Object.keys(FIGURES);

  it("has figures to check", () => {
    // A registry that failed to import would make every assertion below vacuously true.
    expect(ids.length).toBeGreaterThan(1800);
  });

  it("renders every figure without throwing", () => {
    const broken: string[] = [];
    for (const id of ids) {
      try { renderToStaticMarkup(FIGURES[id]()); } catch (error) {
        broken.push(`${id}: ${(error as Error).message.slice(0, 80)}`);
      }
    }
    expect(broken, `figures that throw render as a silent blank: ${broken.slice(0, 5).join(" · ")}`).toEqual([]);
  });

  it("gives every figure an accessible name", () => {
    const untitled: string[] = [];
    for (const id of ids) {
      let markup = "";
      try { markup = renderToStaticMarkup(FIGURES[id]()); } catch { continue; }
      const title = /<title>([\s\S]*?)<\/title>/.exec(markup)?.[1]?.trim();
      if (!title) untitled.push(id);
    }
    /* Pinned as an exact count rather than zero: this is a measured baseline, not a standard the
     * corpus already meets, and an exact match forces a genuine improvement to be recorded here
     * rather than absorbed silently. */
    expect(untitled.length, `figures with no <title>: ${untitled.slice(0, 8).join(", ")}`).toBe(UNTITLED_BASELINE);
  });
});
