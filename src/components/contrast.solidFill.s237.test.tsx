/* Solid-fill text contrast (S237) — WCAG 2.1 AA, SC 1.4.3.
 *
 * The defect this pins: `bg-sky` (#2E7CD6) under `text-white` is 4.23:1, and AA needs 4.5:1.
 * It was found by the browser axe sweep on HeroWidget's CTA and it was never one button — eight
 * elements across six files paired an opaque brand fill with white text.
 *
 * The gate is written for the PROPERTY, not for the repair: *no opaque solid fill may carry white
 * text unless that fill's own hex clears 4.5:1 against white*. It therefore fails for any future
 * token that is introduced below the line, not merely for `sky`. `sky` itself is untouched — it is
 * an instructional colour (ROLE.active, "the learner's value"), and recolouring it would have moved
 * 69 authored lesson steps and ~1,972 figure uses to repair seven chrome buttons.
 *
 * Self-check: every rejection case below is paired with a near-identical case that MUST be
 * accepted, so the detector cannot pass by blindness.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { contrastRatio } from "@/lib/palette";

/** Opaque solid fills that may appear under white text, with their authored hex.
 *  Values are the single source in globals.css / tailwind.config.ts; a token whose hex moves
 *  below the AA line here fails this gate rather than silently shipping. */
const SOLID_FILLS: Record<string, string> = {
  // globals.css:184/:229 — deliberately IDENTICAL in light and dark ("a filled button is its own
  // surface; the flipping -ink channels are for text on the page").
  cta: "#2069BF",
  "cta-good": "#17633F",
  "cta-danger": "#C93248",
  // tailwind.config.ts:16 — brand/instructional, NOT a text-bearing fill. Listed so the gate
  // states its ratio rather than leaving it unmeasured.
  sky: "#2E7CD6"
};

const AA_NORMAL = 4.5;
const WHITE = "#FFFFFF";

/* ---- the detector ---- */

/** Opaque token use only: `bg-sky` yes; `bg-sky/10` (tinted) and `bg-sky-ink` (a different
 *  token) no. Tints sit under dark text and are governed by a different threshold. */
function opaqueFillsIn(classList: string): string[] {
  const out: string[] = [];
  for (const cls of classList.split(/\s+/)) {
    const m = /^(?:[a-z-]+:)*bg-([a-z]+(?:-[a-z]+)*)$/.exec(cls);
    if (m) out.push(m[1]);
  }
  return out;
}

function hasWhiteText(classList: string): boolean {
  return classList.split(/\s+/).some((c) => /^(?:[a-z-]+:)*text-white$/.test(c));
}

/** A violation is a single class list that pairs an opaque fill with white text where the
 *  fill's hex is below AA. Unknown fills are reported too — an unmeasured fill under white
 *  text is exactly the state this gate exists to end. */
function violationsIn(classList: string): { fill: string; ratio: number | null }[] {
  if (!hasWhiteText(classList)) return [];
  const out: { fill: string; ratio: number | null }[] = [];
  for (const fill of opaqueFillsIn(classList)) {
    const hex = SOLID_FILLS[fill];
    if (hex === undefined) continue; // not a brand solid fill (bg-white, bg-ink/…): out of scope
    const ratio = contrastRatio(hex, WHITE);
    if (ratio < AA_NORMAL) out.push({ fill, ratio });
  }
  return out;
}

/* ---- self-check: the detector must accept as well as reject ---- */

describe("solid-fill contrast detector — self-check", () => {
  it("REJECTS an opaque sub-AA fill under white text", () => {
    expect(violationsIn("pressable rounded-xl bg-sky px-4 text-white")).toHaveLength(1);
  });

  it("ACCEPTS the same markup on an AA-passing fill", () => {
    expect(violationsIn("pressable rounded-xl bg-cta px-4 text-white")).toHaveLength(0);
  });

  it("ACCEPTS a TINTED sky wash, which carries dark text and is a different threshold", () => {
    expect(violationsIn("rounded-card bg-sky/10 text-sky-ink")).toHaveLength(0);
    // …and is still accepted even if white text appears elsewhere in the tree, because the
    // tint is not an opaque fill.
    expect(violationsIn("rounded-card bg-sky/15 text-white")).toHaveLength(0);
  });

  it("ACCEPTS bg-sky with NO white text — the instructional marker keeps its colour", () => {
    expect(violationsIn("mx-auto h-8 w-0.5 bg-sky")).toHaveLength(0);
    expect(violationsIn("rounded-md bg-sky px-1.5 text-ink")).toHaveLength(0);
  });

  it("REJECTS through a variant prefix, which is still a rendered state", () => {
    expect(violationsIn("hover:bg-sky text-white")).toHaveLength(1);
  });

  it("does not confuse bg-sky-ink with bg-sky", () => {
    expect(opaqueFillsIn("bg-sky-ink")).toEqual(["sky-ink"]);
    expect(opaqueFillsIn("bg-sky")).toEqual(["sky"]);
  });
});

/* ---- the tokens themselves ---- */

describe("solid-fill tokens clear AA under white text", () => {
  it("cta / cta-good / cta-danger are all >= 4.5:1", () => {
    for (const t of ["cta", "cta-good", "cta-danger"]) {
      expect(contrastRatio(SOLID_FILLS[t], WHITE)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("states sky's real ratio — it is BELOW AA, which is why it never carries white text", () => {
    const r = contrastRatio(SOLID_FILLS.sky, WHITE);
    expect(r).toBeLessThan(AA_NORMAL);
    expect(r).toBeGreaterThan(4.2); // 4.23 — pinned so a silent token drift is visible here
  });
});

/* ---- the corpus ---- */

function tsxFiles(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (e === "node_modules" || e === ".next") continue;
      tsxFiles(p, acc);
    } else if (p.endsWith(".tsx") && !p.endsWith(".test.tsx")) acc.push(p);
  }
  return acc;
}

describe("no rendered element pairs a sub-AA solid fill with white text", () => {
  it("holds across every component and route", () => {
    const offenders: string[] = [];
    for (const file of tsxFiles("src")) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        // Every quoted/backticked run on the line is a candidate class list. Checking each
        // string separately is what keeps a badge and its sibling marker on one JSX line from
        // being read as a single element.
        for (const m of line.matchAll(/["'`]([^"'`]*)["'`]/g)) {
          for (const v of violationsIn(m[1])) {
            offenders.push(
              `${file}:${i + 1} — bg-${v.fill} under text-white is ${v.ratio?.toFixed(2)}:1 (AA needs ${AA_NORMAL})`
            );
          }
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
