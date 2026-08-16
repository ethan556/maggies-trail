/**
 * S242 / ACC-01 §8 item 2 — THE CONTRAST RATIOS THE TOKENS CLAIM, COMPUTED.
 *
 * The matrix is explicit about what it could not do:
 *
 *   > **No browser rendered anything.** So: no computed contrast ratios — I report the values the
 *   > tokens *document* at `globals.css:173-234`, **which I did not verify**.
 *
 * Those values are not incidental. They are load-bearing claims written beside the tokens —
 * `#5B6A86, 5.24:1 on paper (AA; was 4.16)`, `4.85 even on sky/10 tint; 5.48 under white`,
 * `White labels: 5.48 / 7.26 / 5.21`, `6.98 on paper`, `7.14 on night` — and every one of them is
 * the reason a reviewer stops worrying about WCAG 1.4.3.
 *
 * No browser is needed to check them. The tokens are literal sRGB triples, the surfaces are too,
 * and a tint like `sky/10` is deterministic alpha compositing. This computes the real ratio by the
 * WCAG 2.x relative-luminance formula and holds the comments to it.
 *
 * TWO ASSERTIONS, AND THE SECOND IS THE IMPORTANT ONE:
 *   1. every documented figure matches the computed ratio;
 *   2. every text token clears the threshold its role requires — because a comment can be right
 *      about a number and still be describing a pair that fails.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");

/** `--name: r g b;` inside the given block. The light tokens live in `:root`, dark in `.dark`. */
function tokens(blockStart: RegExp): Record<string, [number, number, number]> {
  const from = css.search(blockStart);
  if (from < 0) throw new Error(`block not found: ${blockStart}`);
  const body = css.slice(from, css.indexOf("\n}", from));
  const out: Record<string, [number, number, number]> = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*;/g))
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  return out;
}

const light = tokens(/^:root\s*\{/m);
const dark = tokens(/^\.dark\s*\{/m);

/** WCAG 2.x relative luminance, sRGB. */
const luminance = ([r, g, b]: [number, number, number]) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const ratio = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** `sky/10` means the BRAND hue at 10% over its surface — plain source-over compositing.
 *
 * The brand hue, not the `-ink` channel: `bg-sky/10` resolves to `rgb(var(--sky) / 0.1)`
 * (`tailwind.config`, `--sky: 46 124 214`), while `--sky-ink` is the separate AA text counterpart
 * that sits ON that tint. A first cut composited the ink channel with itself and reported the
 * tangerine tint at 4.49 — a Level AA failure that does not exist. Reading the config before
 * believing the number is the only reason that was not filed as a defect. */
const tint = (fg: [number, number, number], bg: [number, number, number], alpha: number): [number, number, number] =>
  [0, 1, 2].map((i) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))) as [number, number, number];

const round2 = (n: number) => Math.round(n * 100) / 100;

/* The claims, transcribed from the comments beside the tokens they describe. `documented` is what
 * the source says; the test computes the truth and compares. Tolerance is 0.05 — these are quoted
 * to two decimals, so anything larger is a real disagreement rather than rounding. */
const CLAIMS: Array<{ what: string; fg: [number, number, number]; bg: [number, number, number]; documented: number }> = [
  { what: "--text-muted on paper", fg: light["text-muted"], bg: light.bg, documented: 5.24 },
  { what: "--sky-ink under white", fg: light["sky-ink"], bg: light.surface, documented: 5.48 },
  { what: "--sky-ink on a sky/10 tint", fg: light["sky-ink"], bg: tint(light.sky, light.surface, 0.1), documented: 4.85 },
  { what: "--leaf-ink on paper", fg: light["leaf-ink"], bg: light.bg, documented: 6.98 },
  { what: "--tangerine-ink on a tangerine/10 tint", fg: light["tangerine-ink"], bg: tint(light.tangerine, light.surface, 0.1), documented: 4.75 },
  { what: "--berry-ink on a berry/10 tint", fg: light["berry-ink"], bg: tint(light.berry, light.surface, 0.1), documented: 4.56 },
  { what: "white label on --cta", fg: [255, 255, 255], bg: light.cta, documented: 5.48 },
  { what: "white label on --cta-good", fg: [255, 255, 255], bg: light["cta-good"], documented: 7.26 },
  { what: "white label on --cta-danger", fg: [255, 255, 255], bg: light["cta-danger"], documented: 5.21 },
  { what: "dark --tangerine-ink on night", fg: dark["tangerine-ink"], bg: dark.bg, documented: 7.14 },
];

describe("ACC-01 §8(2) — the documented contrast ratios are real", () => {
  it("read the token blocks", () => {
    // A regex that stopped matching would make every comparison below vacuous.
    expect(Object.keys(light).length).toBeGreaterThan(20);
    expect(Object.keys(dark).length).toBeGreaterThan(10);
  });

  it("matches every figure written beside a token", () => {
    const wrong = CLAIMS
      .map((c) => ({ ...c, actual: round2(ratio(c.fg, c.bg)) }))
      .filter((c) => Math.abs(c.actual - c.documented) > 0.05)
      .map((c) => `${c.what}: source says ${c.documented}, computes to ${c.actual}`);
    expect(wrong, "a contrast figure in the stylesheet is not what the tokens actually produce").toEqual([]);
  });

  it("clears AA for normal text on every text role, both modes", () => {
    /* The claim that matters, independent of whether the comments are right. 4.5:1 is 1.4.3 for
     * normal-size text; the `-ink` channels exist precisely to carry text, and `--text-muted` is
     * the one the matrix flags as having been raised once already (from 4.16). */
    const failing: string[] = [];
    for (const [mode, t, surface] of [["light", light, light.bg], ["dark", dark, dark.bg]] as const) {
      for (const role of ["text", "text-2", "text-muted", "sky-ink", "leaf-ink", "berry-ink", "tangerine-ink"]) {
        const fg = t[role];
        if (!fg) continue;
        const r = round2(ratio(fg, surface));
        if (r < 4.5) failing.push(`${mode} --${role} on the page background: ${r}:1`);
      }
    }
    expect(failing, "normal text below WCAG 1.4.3 AA").toEqual([]);
  });

  it("clears the 3:1 graphical-object threshold for the CTA fills", () => {
    // 1.4.11 — a filled button is a graphical object against the page behind it.
    const weak: string[] = [];
    for (const role of ["cta", "cta-good", "cta-danger"]) {
      const r = round2(ratio(light[role], light.bg));
      if (r < 3) weak.push(`--${role} against the page: ${r}:1`);
    }
    expect(weak, "a solid control is below WCAG 1.4.11 against the page").toEqual([]);
  });
});
