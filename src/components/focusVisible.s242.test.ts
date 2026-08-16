/**
 * S242 / ACC-01 — SUPPRESSING THE FOCUS OUTLINE IS ONLY ALLOWED WITH A REPLACEMENT.
 *
 * WCAG 2.4.7 (Focus Visible, Level AA) requires a visible indicator on every keyboard-focusable
 * control. This codebase HAS one — `:focus-visible { outline: 3px solid sky }` in `globals.css` —
 * and the failure mode is not its absence but its local suppression.
 *
 * `ACC01_ACCESSIBILITY_MATRIX.md` row d1 found the sharpest case by reading: `ui.tsx`'s `BTN_BASE`
 * carried `focus-visible:outline-none` with nothing in its place, and at specificity (0,2,0) it beat
 * the global rule (0,1,0). **Every `<Button>` and `<ButtonLink>` in the app had no focus ring.**
 * Sweeping for the token then found a second bare suppression (`numberLineRay.tsx`'s constant input)
 * and nine lab number inputs replacing the ring with a border-colour change alone, four lines from
 * a sibling using the app's `focus:ring-2 focus:ring-sky/25` pattern.
 *
 * A one-token regression is exactly what a reviewer's eye slides over, so it is measured here
 * instead. The rule: a class string or stylesheet declaration that removes the outline must, in the
 * same string, name a replacement — a ring, a shadow, or a focus border.
 *
 * DELIBERATELY A SOURCE SWEEP, NOT A RENDER. The defect is a token that never reaches the DOM in
 * any state a test could set up: `focus-visible` styling is not observable in jsdom, so rendering
 * would report a clean pass on a broken app. Reading what the class string says is what catches it.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, globSync } from "node:fs";

/** Anything that constitutes a visible focus indicator standing in for the outline. */
const REPLACEMENT = /(?:focus(?:-visible)?:)?(?:ring-\d|ring-sky|ring-2|shadow-focus|border-sky|outline-sky|outline-\[)/;
const SUPPRESSION = /(?:focus(?:-visible)?:)?outline-none|outline:\s*none/;

const files = globSync("src/**/*.{ts,tsx,css}").filter((f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"));

describe("ACC-01 — no focus outline is suppressed without a replacement", () => {
  it("found source to sweep", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("pairs every outline suppression with a visible indicator in the same declaration", () => {
    const bare: string[] = [];
    for (const file of files) {
      /* Block comments are blanked ACROSS THE WHOLE FILE FIRST, newlines preserved so the reported
       * line numbers stay true. A first cut stripped comments per line and promptly flagged the
       * three comments in this packet that quote `outline-none` while explaining the rule — a
       * detector that fails on its own documentation. */
      const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
      source.split("\n").forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, "");
        if (!SUPPRESSION.test(code)) return;
        /* Scope to the declaration the token lives in — a `className="…"` string or a CSS rule
         * body — so a replacement three elements away cannot excuse a bare suppression. */
        const scopes = code.match(/className="[^"]*"|className=\{`[^`]*`\}|\{[^{}]*outline:\s*none[^{}]*\}/g) ?? [code];
        for (const scope of scopes) {
          if (!SUPPRESSION.test(scope)) continue;
          if (REPLACEMENT.test(scope)) continue;
          bare.push(`${file}:${i + 1} — ${scope.slice(0, 110)}`);
        }
      });
    }
    expect(
      bare,
      "a keyboard user cannot see where they are on these controls (WCAG 2.4.7, Level AA)"
    ).toEqual([]);
  });

  it("keeps the global focus indicator defined and free of a radius override", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const rule = /:focus-visible\s*\{([^}]*)\}/.exec(css);
    expect(rule, "the app's single designed focus indicator").toBeTruthy();
    expect(rule![1]).toMatch(/outline:\s*3px solid/);
    /* `border-radius` in this rule sets the radius of the FOCUSED ELEMENT, not of the outline, so it
     * squared off every rounded control the moment it took focus — the likeliest reason `<Button>`
     * suppressed the ring in the first place. Browsers already follow the element's own radius. */
    expect(rule![1], "a radius here deforms the focused element instead of shaping the outline").not.toMatch(/border-radius/);
  });
});
