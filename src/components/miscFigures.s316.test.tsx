// @vitest-environment jsdom
/**
 * S316 Lane A figure rebuilds — evidence tests.
 *
 * Four lessons were rejected by content workers because their signed REVISE rationales demanded
 * figures/wording fixes that require src/ component work outside a lesson-JSON-only worker's
 * scope. This suite covers the three lessons where a new, exactly-matched figure was built:
 *   - mult-fluency-g3 / mf3-02-01: mult3-double-double-double (semantic ×8 visual: 6→12→24→48)
 *   - geometry-g7 / sa7-01-03: sa7-pyramid-parts (k3) + sa7-pyramid-net-total (ch1)
 *   - transformations-measurement / tm-03-02: tm-right-triangle-90-35-55
 * bivariate-statistics / bv-05-03 was left fail-closed (see S316_MISC_FIGURE_REBUILD.md) because
 * its remaining defect lives in the shared scatterFit widget renderer (src/components/widgets.tsx),
 * not in a figures.tsx figure, and is therefore out of this worker's scope.
 */
import { createElement } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";
import { isFigureTextAligned, figureTextBindingKey } from "../lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "../lib/figureTextMismatchBlocklist.generated";

type Step = {
  id: string;
  kind: string;
  figure?: string;
  body?: string;
  narration?: string;
  widget?: { prompt?: string; answer?: number; type?: string };
};
type Remedial = { conceptTag: string; concept: { body?: string }; check: Step };
type Lesson = { id: string; courseId: string; steps: Step[]; remedials?: Remedial[] };

function lesson(courseId: string, lessonId: string): Lesson {
  const p = path.join(process.cwd(), "content", "courses", courseId, "lessons", `${lessonId}.json`);
  return JSON.parse(readFileSync(p, "utf8")) as Lesson;
}
function step(l: Lesson, id: string): Step {
  const found = l.steps.find((s) => s.id === id);
  if (!found) throw new Error(`${l.id}/${id} missing`);
  return found;
}
function render(id: string): string {
  const Component = FIGURES[id];
  expect(Component, `figure "${id}" not registered in FIGURES`).toBeDefined();
  return renderToStaticMarkup(createElement(Component));
}
function expectRegistered(id: string) {
  expect(FIGURE_IDS.has(id), `"${id}" missing from FIGURE_IDS`).toBe(true);
  expect(FIGURES[id], `"${id}" missing from FIGURES map`).toBeDefined();
}

describe("S316 mult3-double-double-double (mult-fluency-g3 ×8 semantic visual)", () => {
  const ID = "mult3-double-double-double";

  it("is registered and renders a role=img figure with a <title> and an accessible description carrying the real ×8 sequence numbers", () => {
    expectRegistered(ID);
    const markup = render(ID);
    expect(markup).toContain('role="img"');
    expect(markup).toMatch(/<title>[^<]*<\/title>/);
    const ariaMatch = markup.match(/aria-label="([^"]*)"/);
    expect(ariaMatch, "figure must carry an aria-label accessible description").toBeTruthy();
    const aria = ariaMatch![1];
    // The real numbers of the drawn ×8 doubling chain: 6 -> 12 -> 24 -> 48.
    expect(aria).toContain("eight");
    expect(aria).toContain("six");
    expect(aria).toContain("twelve");
    expect(aria).toContain("twenty-four");
    expect(aria).toContain("forty-eight");
    // Visible text also states the numerals, not colour alone.
    expect(markup).toContain("12");
    expect(markup).toContain("24");
    expect(markup).toContain("48");
    expect(markup).not.toContain("mult3-double-double\"");
  });

  it("performs a fourth doubling step beyond mult3-double-double (which stops at 24), proving it is not a re-export of the ×4 figure", () => {
    const oldMarkup = render("mult3-double-double");
    const newMarkup = render(ID);
    expect(oldMarkup).not.toContain("48");
    expect(newMarkup).toContain("48");
  });

  it("is bound to both c1 and c2 in mf3-02-01, replacing the ×4-only mult3-double-double figure", () => {
    const l = lesson("mult-fluency-g3", "mf3-02-01");
    expect(l.courseId).toBe("mult-fluency-g3");
    const c1 = step(l, "c1");
    const c2 = step(l, "c2");
    expect(c1.figure).toBe(ID);
    expect(c2.figure).toBe(ID);
    // Frozen: body/prose must be untouched (rule 1 — only the figure key changes).
    expect(c1.body).toBe("The ×8 facts double the ×4 facts — which are themselves doubled ×2 facts.");
    expect(c2.body).toBe("8 × 6 is 4 × 6 doubled: 24 becomes 48.");
    expect(isFigureTextAligned(ID, c1.body ?? "")).toBe(true);
    expect(isFigureTextAligned(ID, c2.body ?? "")).toBe(true);
    // Evaluator truth preserved: i1's target is still 8 rows of 6 = 48, k1 still asks 8 × 6.
    expect(step(l, "i1").widget?.type).toBe("areaModel");
    expect(step(l, "k1").widget?.answer).toBe(48);
  });
});

describe("S316 tm-right-triangle-90-35-55 (transformations-measurement synced right-triangle visual)", () => {
  const ID = "tm-right-triangle-90-35-55";

  it("is registered and renders a role=img figure whose title/description states the actual 90°, 35°, and inferred 55° in an accessible non-colour form (a marked right-angle rect)", () => {
    expectRegistered(ID);
    const markup = render(ID);
    expect(markup).toContain('role="img"');
    const ariaMatch = markup.match(/aria-label="([^"]*)"/);
    expect(ariaMatch).toBeTruthy();
    const aria = ariaMatch![1];
    expect(aria).toContain("90 degrees");
    expect(aria).toContain("35 degrees");
    expect(aria).toContain("55 degrees");
    expect(aria).toContain("inferred");
    expect(markup).toContain("90°");
    expect(markup).toContain("35°");
    expect(markup).toContain("55°");
    // Non-colour cue for the right angle: an explicit square marker element, not fill colour alone.
    expect(markup).toMatch(/<rect[^>]*width="12"[^>]*height="12"[^>]*fill="none"/);
  });

  it("shows a genuine three-vertex right triangle (a <polygon>), unlike la-triangle-sum's generic a/b/c triangle or mc-missing-angle's single-vertex angle split", () => {
    const markup = render(ID);
    expect(markup).toMatch(/<polygon[^>]*points="40,95 40,25 175,95"/);
  });

  it("is bound to tm-03-02's c2, replacing the withheld la-triangle-sum binding, and matches the body's exact worked numbers", () => {
    const l = lesson("transformations-measurement", "tm-03-02");
    const c2 = step(l, "c2");
    expect(c2.figure).toBe(ID);
    expect(c2.figure).not.toBe("la-triangle-sum");
    expect(c2.body).toBe(
      "This works even for right triangles. A right triangle has one 90° angle, so the other two must add to 90°. If one of them is 35°, the last is 90 − 35 = 55°."
    );
    expect(isFigureTextAligned(ID, c2.body ?? "")).toBe(true);
    // The new (id, text) pair must not itself be in the mismatch blocklist -- confirms this is a
    // real fix, not a text edit that dodges the old la-triangle-sum hash.
    expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(figureTextBindingKey(ID, c2.body ?? ""))).toBe(false);
  });
});

describe("S316 sa7-pyramid-parts and sa7-pyramid-net-total (geometry-g7 pyramid visuals)", () => {
  it("sa7-pyramid-parts is registered and accessibly states the pyramid's exact face composition (1 square + 4 triangles = 5 faces)", () => {
    expectRegistered("sa7-pyramid-parts");
    const markup = render("sa7-pyramid-parts");
    expect(markup).toContain('role="img"');
    const ariaMatch = markup.match(/aria-label="([^"]*)"/);
    expect(ariaMatch).toBeTruthy();
    const aria = ariaMatch![1];
    expect(aria).toContain("square");
    expect(aria).toContain("four triangular faces");
    expect(aria).toContain("five faces");
    expect(markup).toContain("1 square + 4 triangles = 5 faces");
  });

  it("sa7-pyramid-net-total is registered and accessibly states the exact ch1 numbers: base edge 6, slant height 5, base area 36, each triangle 15, total 96", () => {
    expectRegistered("sa7-pyramid-net-total");
    const markup = render("sa7-pyramid-net-total");
    expect(markup).toContain('role="img"');
    const ariaMatch = markup.match(/aria-label="([^"]*)"/);
    expect(ariaMatch).toBeTruthy();
    const aria = ariaMatch![1];
    expect(aria).toContain("edge 6");
    expect(aria).toContain("area 36");
    expect(aria).toContain("slant height 5");
    expect(aria).toContain("area 15");
    expect(aria).toContain("96 square units");
    expect(markup).toContain("36 + 4×15 = 96");
  });

  it("sa7-pyramid-parts is bound to k3 and sa7-pyramid-net-total to ch1 in sa7-01-03, and ch1's evaluator truth (base 6, slant 5, answer 96) is unchanged", () => {
    const l = lesson("geometry-g7", "sa7-01-03");
    const k3 = step(l, "k3");
    const ch1 = step(l, "ch1");
    expect(k3.figure).toBe("sa7-pyramid-parts");
    expect(ch1.figure).toBe("sa7-pyramid-net-total");
    expect(ch1.widget?.prompt).toBe("A square pyramid has base edge 6 and slant height 5. What is its total surface area?");
    expect(ch1.widget?.answer).toBe(96);
    expect(isFigureTextAligned("sa7-pyramid-parts", k3.body ?? "")).toBe(true);
    expect(isFigureTextAligned("sa7-pyramid-net-total", ch1.body ?? "")).toBe(true);
  });

  it("scopes the lateral-shortcut overclaim to right prisms in both c2 and the remedial concept, per the rationale's part (b), leaving computations/evaluators untouched", () => {
    const l = lesson("geometry-g7", "sa7-01-03");
    const c2 = step(l, "c2");
    expect(c2.body).toContain("any right prism");
    expect(c2.body).not.toContain("any prism,");
    expect(c2.body).toContain("perimeter is 3 + 4 + 5 = 12");
    const remedialConcept = l.remedials?.[0]?.concept.body ?? "";
    expect(remedialConcept).toContain("any right prism");
    expect(remedialConcept).not.toContain("any prism,");
    // k2's shortcut evaluator truth is untouched by the wording fix.
    expect(step(l, "k2").widget?.answer).toBe(120);
  });

  it("preserves the ≥60% action-step invariant by hand: 5 of 8 main steps (i1,k1,k2,k3,ch1) require action", () => {
    const l = lesson("geometry-g7", "sa7-01-03");
    const ACTION_KINDS = new Set(["interactive", "check", "challenge"]);
    const action = l.steps.filter((s) => ACTION_KINDS.has(s.kind)).length;
    expect(l.steps).toHaveLength(8);
    expect(action).toBe(5);
    expect(action / l.steps.length).toBeGreaterThanOrEqual(0.6);
  });
});

describe("S316 bv-05-03 fail-closed check", () => {
  it("bv-05-03's remaining REVISE defect (scatterFit MSE/SSE labeling + SVG accessibility) lives in the shared widgets.tsx renderer, not a figures.tsx figure -- so no new figure was bound, and the existing c1/c2 figures are unchanged", () => {
    const l = lesson("bivariate-statistics", "bv-05-03");
    expect(step(l, "c1").figure).toBe("bv-residuals-steer-the-line");
    expect(step(l, "c2").figure).toBe("bv-least-squares");
    // Both figures pre-exist and are registered; nothing here needed a figures.tsx addition.
    expectRegistered("bv-residuals-steer-the-line");
    expectRegistered("bv-least-squares");
    // The already-repaired OLS math (S247 supersession) is untouched by this worker.
    expect(step(l, "i1").widget?.prompt).toContain("data (1,3), (2,6), (3,7), (4,9)");
  });
});
