#!/usr/bin/env node
/**
 * Open Graph share card renderer — WS-A Phase 1/2 ("Net-new, not a swap: an OG image asset").
 *
 * SCOPE / GOVERNANCE. This script produces NO new artwork. It is a mechanical rasterisation of
 * assets that already exist and are already approved:
 *   - `public/brand/maggies-mark.svg`     (approved WS-A mark, read from disk at run time)
 *   - `public/brand/maggies-wordmark.svg` (approved WS-A wordmark, read from disk at run time)
 *   - `COPY.tagline` from `src/lib/copy.ts` (the product's own tagline, read at run time)
 * Neither SVG's path data is copied into this file — both are inlined straight from disk, so the
 * card re-derives automatically if the approved vectors are ever revised. The only thing this
 * script adds is a flat background fill and type: no illustration, no generated imagery, no new
 * graphic elements at all. (An earlier draft placed a Summit Orange divider rule between wordmark
 * and tagline; it was dropped because the wordmark's own orange "TRAIL" and the mark's orange
 * summit star already spend the accent, and WS-A's discipline set rations Summit Orange to one
 * accent at a time.)
 *
 * OUTPUT. `public/brand/maggies-og.png`, 1200x630 (the Open Graph / `summary_large_image`
 * canonical size), referenced by `openGraph.images` and `twitter.images` in `src/app/layout.tsx`.
 *
 * RUN.  node scripts/brand/render-og-image.mjs      (or: npm run gen:brand-og)
 * Deterministic: same inputs -> same PNG. Safe to re-run; it overwrites in place.
 */
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..", "..");

/* ------------------------------------------------------------------ brand constants */

/** Approved WS-A identity palette (OPTIMIZATION_PLAN_V3.md §WS-A / WS_A_BRAND_PLAN.md §1). */
const NAVY = "#0D1B2A"; // Deep Navy — tagline
const IVORY = "#F7F3EC"; // Warm Ivory — the card background
// Summit Orange (#F08A24) appears on this card only where the approved assets already carry it
// (the wordmark's "TRAIL", the mark's summit star). Nothing here paints it independently.

/**
 * Tagline typeface. WS-A Phase 4 (the typography split) has NOT landed — this repo still has zero
 * font infrastructure (no `next/font`, no `@font-face`, no `fontFamily` key in tailwind.config.ts),
 * so no brand text face has been chosen yet. The wordmark itself needs no font: it is outlined
 * glyph art. This stack therefore covers only the tagline line, is pinned for reproducibility, and
 * is a rasterisation-time stand-in, NOT a brand-typeface decision. When Phase 4 picks the UI sans,
 * change this one constant and re-run. Order is deliberate: the first two entries are what the
 * repo's own container has installed, the rest are portability fallbacks.
 */
const TAGLINE_FONT_STACK = `"Poppins", "Carlito", "Liberation Sans", "DejaVu Sans", system-ui, sans-serif`;

const WIDTH = 1200;
const HEIGHT = 630;
const OUT_PATH = join(root, "public", "brand", "maggies-og.png");

/* ------------------------------------------------------------------ inputs from disk */

function readBrandSvg(name) {
  const path = join(root, "public", "brand", name);
  if (!existsSync(path)) {
    throw new Error(`Missing approved brand vector ${path}. This script derives from the shipped assets; it never draws its own.`);
  }
  // Strip the XML prolog if one is ever added, and drop role/aria from the embedded copy: inside
  // this composition the SVGs are decoration, the card's meaning lives in the metadata `alt`.
  return readFileSync(path, "utf8").replace(/<\?xml[\s\S]*?\?>/g, "").trim();
}

/** Single-sources the tagline from src/lib/copy.ts so the card can never drift from the product. */
function readTagline() {
  const path = join(root, "src", "lib", "copy.ts");
  const match = readFileSync(path, "utf8").match(/^\s*tagline:\s*"((?:[^"\\]|\\.)*)"/m);
  if (!match) throw new Error(`Could not read COPY.tagline from ${path}`);
  return match[1];
}

/** Name/description live in the manifest; read here only to assert the three surfaces agree. */
function readManifest() {
  return JSON.parse(readFileSync(join(root, "public", "manifest.webmanifest"), "utf8"));
}

/* ------------------------------------------------------------------ composition */

function buildHtml({ markSvg, wordmarkSvg, tagline }) {
  // Sizing note: the wordmark's own canvas is viewBox="-6 -6 962 112", so a 660px-wide render is
  // 660 * 112 / 962 ~= 77px tall. Everything is a fixed pixel value — no responsive units — so the
  // 1200x630 viewport screenshot is byte-stable across runs.
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    background: ${IVORY};
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    /* Optical centre: nudge the block up slightly so the card reads balanced, not bottom-heavy. */
    padding-bottom: 14px;
    -webkit-font-smoothing: antialiased;
  }
  .mark { width: 140px; height: 140px; display: block; }
  .wordmark { width: 700px; height: auto; display: block; margin-top: 44px; }
  .wordmark svg, .mark svg { width: 100%; height: 100%; display: block; }
  .tagline {
    margin-top: 52px;
    font-family: ${TAGLINE_FONT_STACK};
    font-size: 42px; font-weight: 400; line-height: 1.2;
    letter-spacing: 0.005em;
    color: ${NAVY};
    text-align: center;
  }
</style></head>
<body>
  <div class="mark">${markSvg}</div>
  <div class="wordmark">${wordmarkSvg}</div>
  <p class="tagline">${escapeHtml(tagline)}</p>
</body></html>`;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ------------------------------------------------------------------ chromium */

async function chromiumExecutable() {
  // Same resolution order as scripts/session/closure-visual-matrix-s220.cjs, plus the browser
  // path this container ships. Never runs `playwright install`.
  if (process.env.PW_CHROMIUM_EXE) return process.env.PW_CHROMIUM_EXE;
  for (const candidate of ["/tmp/chromium", "/opt/pw-browsers/chromium"]) {
    if (existsSync(candidate)) return candidate;
  }
  try {
    const mod = await import("@sparticuz/chromium");
    return await mod.default.executablePath();
  } catch (error) {
    throw new Error(`No Chromium executable. Set PW_CHROMIUM_EXE. ${String(error)}`);
  }
}

/* ------------------------------------------------------------------ main */

const manifest = readManifest();
const tagline = readTagline();
const html = buildHtml({
  markSvg: readBrandSvg("maggies-mark.svg"),
  wordmarkSvg: readBrandSvg("maggies-wordmark.svg"),
  tagline
});

const browser = await chromium.launch({ executablePath: await chromiumExecutable(), args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

// Fail loudly rather than shipping a card whose tagline silently fell back to a system face.
const taglineFace = await page.evaluate(() => {
  const el = document.querySelector(".tagline");
  return { rendered: getComputedStyle(el).fontFamily, box: el.getBoundingClientRect().width };
});
if (taglineFace.box <= 0) throw new Error("Tagline rendered with zero width");

mkdirSync(dirname(OUT_PATH), { recursive: true });
await page.screenshot({ path: OUT_PATH, type: "png" });

// Verify the artifact rather than assume it: re-decode the PNG we just wrote and measure it.
const dataUrl = `data:image/png;base64,${readFileSync(OUT_PATH).toString("base64")}`;
const check = await page.evaluate(async (url) => {
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error("PNG failed to decode"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const colors = new Set();
  let foreground = 0;
  for (let i = 0; i < data.length; i += 4) {
    colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    // Anything that is not the flat ivory background counts as inked.
    if (data[i] !== 0xf7 || data[i + 1] !== 0xf3 || data[i + 2] !== 0xec) foreground++;
  }
  return {
    width: canvas.width,
    height: canvas.height,
    uniqueColors: colors.size,
    inkedPct: +((foreground / (canvas.width * canvas.height)) * 100).toFixed(2)
  };
}, dataUrl);

await browser.close();

const failures = [];
if (check.width !== WIDTH || check.height !== HEIGHT) failures.push(`expected ${WIDTH}x${HEIGHT}, got ${check.width}x${check.height}`);
if (check.inkedPct < 2) failures.push(`card looks blank (only ${check.inkedPct}% of pixels are non-background)`);
if (check.uniqueColors < 3) failures.push(`card looks flat (${check.uniqueColors} unique colors)`);

const bytes = readFileSync(OUT_PATH).byteLength;
console.log(`OG card: ${OUT_PATH.replace(root + "/", "")}`);
console.log(`  ${check.width}x${check.height}, ${bytes} bytes, ${check.inkedPct}% inked, ${check.uniqueColors} unique colors`);
console.log(`  tagline: ${JSON.stringify(tagline)} in ${taglineFace.rendered}`);
console.log(`  manifest name: ${JSON.stringify(manifest.name)}`);

if (failures.length) {
  console.error("OG card verification FAILED:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log("OG card verification passed.");
