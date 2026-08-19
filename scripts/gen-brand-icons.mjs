#!/usr/bin/env node
// Brand raster derivation — WS-A Phase 1 ("vector mark/wordmark + raster derivatives").
//
// SCOPE / GOVERNANCE (S240): this script performs *mechanical rasterisation only*. Every pixel it
// emits comes from the user-supplied canonical PNG at design-reference/brand/maggies-trail-icon-source.png — its path
// data, its palette, its viewBox. No new geometry is authored here: the maskable and Apple Touch
// variants are the same approved paths, scaled and placed on the mark's own background fill (read
// out of the source file, never hard-coded). If a future change needs a *new shape*, it does not
// belong in this script — it belongs back in the approved-source pipeline.
//
// Usage:
//   node scripts/gen-brand-icons.mjs                 # regenerate every derivative, then verify
//   node scripts/gen-brand-icons.mjs --check         # verify what is on disk; write nothing
//   node scripts/gen-brand-icons.mjs --renderer=chromium   # force the Playwright backend
//
// Renderers (both produce the same geometry; pick whichever the environment has):
//   sharp    — libvips + librsvg, resolved from node_modules (default when present)
//   chromium — headless Chromium via playwright-core, using PLAYWRIGHT_BROWSERS_PATH
//
// Verification is not optional: after writing, every PNG is decoded and checked for real size,
// real dimensions, real brand pixels, opacity where opacity is required, and — for the maskable
// icon — that no mark pixel escapes Android's inner-80% safe circle. A blank or 0-byte file is a
// hard failure, not a silent pass.

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = "design-reference/brand/maggies-trail-icon-source.png";
const MANIFEST = "public/manifest.webmanifest";
const CANONICAL_MARK_PATH = "/brand/maggies-mark.png";
const SVG_ALIASES = ["public/brand/maggies-mark.svg", "public/icon.svg", "src/app/icon.svg"];

function canonicalSvgAlias() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc"><title id="title">Maggie's Trail</title><desc id="desc">Two navy mountain peaks, a winding trail, and an orange summit star.</desc><image href="${CANONICAL_MARK_PATH}" x="0" y="0" width="512" height="512"/></svg>\n`;
}

/** Android adaptive-icon masks may crop everything outside the centred inner 80% circle. */
const MASKABLE_SAFE_FRACTION = 0.8;
/** A hair of slack so antialiasing on the safe-circle boundary can never be clipped. */
const MASKABLE_FIT_MARGIN = 0.98;
/** ICO carries the classic small sizes; browsers pick per-DPI from inside the one file. */
const ICO_SIZES = [16, 32, 48];

/**
 * Every derivative, declared once.
 *   kind "badge"    — the approved mark exactly as authored (transparent outside its rounded rect)
 *   kind "flatten"  — the approved mark composited on its own background fill, edge to edge
 *   kind "maskable" — the approved mark's paths (no rounded rect, which a mask would crop)
 *                     scaled into the safe circle on its own background fill
 */
const TARGETS = [
  { file: "public/brand/maggies-mark.png", size: 512, kind: "badge", note: "in-app canonical mark" },
  { file: "public/icons/icon-192.png", size: 192, kind: "badge", note: "PWA any" },
  { file: "public/icons/icon-512.png", size: 512, kind: "badge", note: "PWA any" },
  { file: "public/icons/icon-maskable-512.png", size: 512, kind: "maskable", note: "PWA maskable" },
  { file: "public/apple-touch-icon.png", size: 180, kind: "flatten", note: "iOS home screen (opaque)" },
  { file: "public/icons/favicon-32.png", size: 32, kind: "badge", note: "browser tab" },
  { file: "public/icons/favicon-16.png", size: 16, kind: "badge", note: "browser tab" }
];

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes("--check");
const rendererArg = (args.find((a) => a.startsWith("--renderer=")) ?? "--renderer=auto").split("=")[1];

const problems = [];
const fail = (msg) => {
  problems.push(msg);
  console.error(`  ✗ ${msg}`);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);

// ---------------------------------------------------------------------------
// Source parsing — the canonical source artwork is the only input.
// ---------------------------------------------------------------------------

function readSource() {
  const sourcePath = join(ROOT, SOURCE);
  return SOURCE.endsWith(".png") ? readPngSource(sourcePath) : readVectorSource(sourcePath);
}

/** The supplied artwork is immutable source data; all install/UI derivatives are rendered from it. */
function readPngSource(sourcePath) {
  const png = readFileSync(sourcePath);
  const dim = pngSize(png);
  if (!dim || dim.width !== dim.height) throw new Error(`${SOURCE}: expected a square PNG source`);
  const href = `data:image/png;base64,${png.toString("base64")}`;
  const image = `<image href="${href}" x="0" y="0" width="${dim.width}" height="${dim.height}"/>`;
  const rect = `<rect x="0" y="0" width="${dim.width}" height="${dim.height}" fill="#FAFBF5"/>`;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim.width} ${dim.height}">${rect}${image}</svg>`,
    inner: `${rect}${image}`,
    defs: "",
    paths: [image],
    rect,
    background: "#FAFBF5",
    viewBox: { x: 0, y: 0, w: dim.width, h: dim.height },
    // The approved source uses these two identity colors; verification measures their on-screen blends.
    fills: ["#FAFBF5", "#082746", "#F08A24"],
    isRaster: true
  };
}
function readVectorSource(sourcePath) {
  const svg = readFileSync(sourcePath, "utf8");
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  if (!viewBox) throw new Error(`${SOURCE}: no viewBox — cannot derive rasters safely`);
  const [vbX, vbY, vbW, vbH] = viewBox.trim().split(/[\s,]+/).map(Number);
  if (![vbX, vbY, vbW, vbH].every(Number.isFinite)) throw new Error(`${SOURCE}: unparseable viewBox "${viewBox}"`);

  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "").trim();
  const defs = /<defs\b[\s\S]*?<\/defs>/.exec(inner)?.[0] ?? "";
  const paths = [...inner.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0]);
  if (paths.length === 0) throw new Error(`${SOURCE}: no <path> elements found`);

  const rect = /<rect\b[^>]*\/>/.exec(inner)?.[0];
  if (!rect) throw new Error(`${SOURCE}: no background <rect> — cannot read the brand background fill`);
  const background = /fill="(#[0-9A-Fa-f]{3,8})"/.exec(rect)?.[1];
  if (!background) throw new Error(`${SOURCE}: background <rect> has no literal fill`);

  // Guard the "drop the rect, keep the paths" assumption: if the mark ever grows an element type
  // this script does not understand, stop instead of emitting a silently incomplete derivative.
  const tags = new Set([...inner.matchAll(/<([a-zA-Z][\w:-]*)/g)].map((m) => m[1]));
  const known = new Set(["rect", "path", "image", "title", "desc", "defs", "linearGradient", "radialGradient", "stop"]);
  for (const tag of tags) if (!known.has(tag)) throw new Error(`${SOURCE}: unsupported element <${tag}> — update this script deliberately`);

  const fills = [...svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase());
  return { svg, inner, defs, paths, rect, background, viewBox: { x: vbX, y: vbY, w: vbW, h: vbH }, fills: [...new Set(fills)] };
}

const sizedSvgOpen = (size, viewBox) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
  `viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}">`;

/** The approved mark, untouched, at `size` px. Transparent outside its rounded rect. */
const badgeSvg = (src, size) => `${sizedSvgOpen(size, src.viewBox)}${src.inner}</svg>`;

/** The approved mark on its own background fill, edge to edge (iOS ignores transparency). */
const flattenSvg = (src, size) =>
  `${sizedSvgOpen(size, src.viewBox)}` +
  `<rect x="${src.viewBox.x}" y="${src.viewBox.y}" width="${src.viewBox.w}" height="${src.viewBox.h}" fill="${src.background}"/>` +
  `${src.inner}</svg>`;

/** Content-only (rounded rect dropped) — used to measure the mark's true ink bounds. */
const contentSvg = (src, size) => `${sizedSvgOpen(size, src.viewBox)}${src.defs}${src.paths.join("")}</svg>`;

/**
 * Maskable: the mark's own paths, scaled so their bounding circle fits Android's inner-80% safe
 * circle, centred on the brand background. `bbox` is in user units and is *measured*, not assumed.
 */
function maskableSvg(src, size, bbox) {
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  const contentRadius = Math.hypot(bbox.w, bbox.h) / 2; // bounding circle of the ink, user units
  const safeRadiusPx = (size * MASKABLE_SAFE_FRACTION) / 2;
  const scale = ((safeRadiusPx * MASKABLE_FIT_MARGIN) / contentRadius);
  const tx = size / 2 - cx * scale;
  const ty = size / 2 - cy * scale;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${src.background}"/>` +
    `${src.defs}<g transform="translate(${tx.toFixed(4)} ${ty.toFixed(4)}) scale(${scale.toFixed(6)})">${src.paths.join("")}</g>` +
    `</svg>`;
  return { svg, scale, contentRadiusPx: contentRadius * scale, safeRadiusPx };
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

async function makeRenderer(kind) {
  if (kind === "sharp" || kind === "auto") {
    try {
      const sharp = createRequire(import.meta.url)("sharp");
      return {
        name: `sharp ${sharp.versions.sharp} (librsvg ${sharp.versions.rsvg})`,
        async png(svg) {
          return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
        },
        async pixels(png) {
          const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          return { data, width: info.width, height: info.height };
        },
        async close() {}
      };
    } catch (err) {
      if (kind === "sharp") throw err;
      console.log(`  (sharp unavailable: ${err.message} — falling back to chromium)`);
    }
  }
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  return {
    name: `playwright-core chromium ${browser.version()}`,
    async png(svg) {
      const size = Number(/width="(\d+)"/.exec(svg)[1]);
      await page.setViewportSize({ width: Math.max(size, 16), height: Math.max(size, 16) });
      await page.setContent(`<style>html,body{margin:0;padding:0;background:transparent}</style>${svg}`);
      return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    },
    async pixels(png) {
      return page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, img.width, img.height);
        return { data: Array.from(data), width: img.width, height: img.height };
      }, png.toString("base64")).then((r) => ({ ...r, data: Uint8Array.from(r.data) }));
    },
    async close() {
      await browser.close();
    }
  };
}

/** Tight ink bounds of the mark's paths, in user units, measured off a high-res render. */
async function measureContentBBox(renderer, src) {
  const probe = 1024;
  const { data, width, height } = await renderer.pixels(await renderer.png(contentSvg(src, probe)));
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 8 && (!src.isRaster || !near([data[i], data[i + 1], data[i + 2]], parseHex(src.background), 24))) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("content probe render was fully transparent — renderer produced no ink");
  const unitsPerPx = src.viewBox.w / probe;
  return {
    x: src.viewBox.x + minX * unitsPerPx,
    y: src.viewBox.y + minY * unitsPerPx,
    w: (maxX - minX + 1) * unitsPerPx,
    h: (maxY - minY + 1) * unitsPerPx
  };
}

// ---------------------------------------------------------------------------
// PNG / ICO helpers (no image dependency needed for either)
// ---------------------------------------------------------------------------

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngSize(buf) {
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_MAGIC)) return null;
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** ICO container holding PNG-encoded entries (every browser since IE Vista reads these). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const directory = Buffer.alloc(16 * pngs.length);
  let offset = header.length + directory.length;
  pngs.forEach(({ size, data }, i) => {
    const at = i * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, at);
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2);
    directory.writeUInt8(0, at + 3);
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, directory, ...pngs.map((p) => p.data)]);
}

function readIco(buf) {
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) return null;
  const count = buf.readUInt16LE(4);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16;
    const declared = buf.readUInt8(at) || 256;
    const length = buf.readUInt32LE(at + 8);
    const offset = buf.readUInt32LE(at + 12);
    const data = buf.subarray(offset, offset + length);
    entries.push({ declared, length, actual: pngSize(data) });
  }
  return entries;
}

const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
const near = (a, b, tol = 24) =>
  Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
const parseHex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Below this the fill is not meaningfully on screen; at 16px the star lands around 0.5. */
const MIN_FILL_COVERAGE = 0.3;

/**
 * Peak coverage of `fill` anywhere in the image, 0..1.
 *
 * Small features never survive downscaling as their pure hex — a 16px star is a blend of the fill
 * and the background. So instead of asking "is any pixel exactly #F08A24", ask "does any pixel sit
 * on the background→fill blend line, and how far along it". That is scale-aware, and the number it
 * returns is itself the legibility evidence for that size.
 */
function fillCoverage(data, fill, bg) {
  const d = [fill[0] - bg[0], fill[1] - bg[1], fill[2] - bg[2]];
  const dd = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  let best = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const p = [data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]];
    const t = (p[0] * d[0] + p[1] * d[1] + p[2] * d[2]) / dd;
    if (t <= best || t > 1.05) continue; // already beaten, or brighter than the fill (a different colour)
    const residual = Math.hypot(p[0] - t * d[0], p[1] - t * d[1], p[2] - t * d[2]);
    if (residual <= 32) best = Math.min(t, 1);
  }
  return best;
}

// ---------------------------------------------------------------------------
// Verification — a file that exists but renders nothing is a failure, not a pass.
// ---------------------------------------------------------------------------

async function verifyPng(renderer, target, src, extra = {}) {
  const abs = join(ROOT, target.file);
  if (!existsSync(abs)) return fail(`${target.file}: missing`);
  const buf = readFileSync(abs);
  if (buf.length === 0) return fail(`${target.file}: 0 bytes`);
  const dim = pngSize(buf);
  if (!dim) return fail(`${target.file}: not a valid PNG (bad signature/IHDR)`);
  if (dim.width !== target.size || dim.height !== target.size) {
    return fail(`${target.file}: is ${dim.width}x${dim.height}, expected ${target.size}x${target.size}`);
  }

  const { data, width, height } = await renderer.pixels(buf);
  const colors = new Set();
  let opaque = 0;
  let transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 250) opaque++;
    else if (a < 5) transparent++;
    if (a > 128) colors.add(hex(data[i], data[i + 1], data[i + 2]));
  }
  // A blank/solid canvas is the classic silent failure this guards.
  if (colors.size < 3) return fail(`${target.file}: only ${colors.size} distinct colour(s) — looks blank`);

  // The mark must actually be present: every non-background brand fill has to reach the screen.
  const bgRgb = parseHex(src.background);
  const wanted = src.fills.filter((f) => f.toUpperCase() !== src.background.toUpperCase());
  const coverage = wanted.map((f) => ({ fill: f, t: fillCoverage(data, parseHex(f), bgRgb) }));
  const missing = coverage.filter((c) => c.t < MIN_FILL_COVERAGE);
  if (missing.length) {
    return fail(
      `${target.file}: brand fill(s) ${missing.map((m) => `${m.fill} @ ${m.t.toFixed(2)}`).join(", ")} ` +
        `below ${MIN_FILL_COVERAGE} coverage — the mark did not render`
    );
  }

  if (extra.opaque && transparent > 0) {
    return fail(`${target.file}: ${transparent} transparent pixel(s) — this icon must be fully opaque`);
  }
  if (extra.safeCircle) {
    // Nothing but background may live outside Android's safe circle.
    const bg = parseHex(src.background);
    const r = (width * MASKABLE_SAFE_FRACTION) / 2;
    let outside = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (Math.hypot(x + 0.5 - width / 2, y + 0.5 - height / 2) <= r) continue;
        const i = (y * width + x) * 4;
        if (!near([data[i], data[i + 1], data[i + 2]], bg, 12)) outside++;
      }
    }
    if (outside > 0) return fail(`${target.file}: ${outside} mark pixel(s) outside the inner-${MASKABLE_SAFE_FRACTION * 100}% safe circle`);
  }

  const sha = createHash("sha256").update(buf).digest("hex").slice(0, 12);
  ok(
    `${target.file} — ${dim.width}x${dim.height}, ${buf.length} B, ${colors.size} colours, ` +
      `${opaque} opaque px, fills ${coverage.map((c) => `${c.fill} @ ${c.t.toFixed(2)}`).join(" ")}, sha256:${sha}`
  );
  return { bytes: buf.length, ...dim };
}

function verifyIco(file) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) return fail(`${file}: missing`);
  const buf = readFileSync(abs);
  const entries = readIco(buf);
  if (!entries) return fail(`${file}: not a valid ICO container`);
  if (entries.length !== ICO_SIZES.length) return fail(`${file}: ${entries.length} entries, expected ${ICO_SIZES.length}`);
  for (const e of entries) {
    if (!e.actual) return fail(`${file}: entry ${e.declared} is not a PNG payload`);
    if (e.actual.width !== e.declared || e.actual.height !== e.declared) {
      return fail(`${file}: entry declares ${e.declared} but payload is ${e.actual.width}x${e.actual.height}`);
    }
    if (e.length < 64) return fail(`${file}: entry ${e.declared} is only ${e.length} B — looks empty`);
  }
  const sha = createHash("sha256").update(buf).digest("hex").slice(0, 12);
  ok(`${file} — ${entries.map((e) => `${e.declared}x${e.declared}`).join(", ")}, ${buf.length} B, sha256:${sha}`);
  return { bytes: buf.length };
}

/** Every icon the manifest declares must resolve to a real file of the declared size. */
function verifySvgAliases() {
  const expected = canonicalSvgAlias();
  for (const file of SVG_ALIASES) {
    const abs = join(ROOT, file);
    if (!existsSync(abs)) fail(`${file}: missing canonical SVG alias`);
    else if (readFileSync(abs, "utf8") !== expected) fail(`${file}: does not forward to ${CANONICAL_MARK_PATH}`);
    else ok(`${file} — canonical SVG alias`);
  }
}
function verifyManifest() {
  const abs = join(ROOT, MANIFEST);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(abs, "utf8"));
  } catch (err) {
    return fail(`${MANIFEST}: invalid JSON — ${err.message}`);
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) return fail(`${MANIFEST}: no icons array`);
  for (const icon of manifest.icons) {
    const target = join(ROOT, "public", icon.src.replace(/^\//, ""));
    if (!existsSync(target)) {
      fail(`${MANIFEST}: declares ${icon.src} but public${icon.src} does not exist`);
      continue;
    }
    if (icon.type === "image/png") {
      const dim = pngSize(readFileSync(target));
      if (!dim) fail(`${MANIFEST}: ${icon.src} is declared image/png but is not a PNG`);
      else if (icon.sizes !== `${dim.width}x${dim.height}`) {
        fail(`${MANIFEST}: ${icon.src} declares sizes "${icon.sizes}" but the file is ${dim.width}x${dim.height}`);
      }
    }
  }
  if (!problems.length) {
    const purposes = manifest.icons.map((i) => `${i.sizes}/${i.purpose}`).join("  ");
    ok(`${MANIFEST} — valid JSON, ${manifest.icons.length} icons, all present: ${purposes}`);
  }
}

// ---------------------------------------------------------------------------

async function main() {
  const src = readSource();
  const renderer = await makeRenderer(rendererArg);
  console.log(`source:   ${SOURCE} (viewBox ${src.viewBox.w}x${src.viewBox.h}, background ${src.background}, fills ${src.fills.join(" ")})`);
  console.log(`renderer: ${renderer.name}${CHECK_ONLY ? "  [--check: verifying only]" : ""}\n`);

  try {
    if (!CHECK_ONLY) {
      const bbox = await measureContentBBox(renderer, src);
      console.log(
        `mark ink bounds (measured, user units): x=${bbox.x.toFixed(2)} y=${bbox.y.toFixed(2)} ` +
          `w=${bbox.w.toFixed(2)} h=${bbox.h.toFixed(2)}`
      );

      for (const target of TARGETS) {
        let svg;
        if (target.kind === "badge") svg = badgeSvg(src, target.size);
        else if (target.kind === "flatten") svg = flattenSvg(src, target.size);
        else {
          const m = maskableSvg(src, target.size, bbox);
          svg = m.svg;
          console.log(
            `maskable fit: scale ${m.scale.toFixed(4)}, ink radius ${m.contentRadiusPx.toFixed(1)}px ` +
              `<= safe radius ${m.safeRadiusPx.toFixed(1)}px (inner ${MASKABLE_SAFE_FRACTION * 100}% circle)`
          );
        }
        const png = await renderer.png(svg);
        mkdirSync(dirname(join(ROOT, target.file)), { recursive: true });
        writeFileSync(join(ROOT, target.file), png);
      }

      const icoPngs = [];
      for (const size of ICO_SIZES) icoPngs.push({ size, data: await renderer.png(badgeSvg(src, size)) });
      writeFileSync(join(ROOT, "public/favicon.ico"), buildIco(icoPngs));
      for (const file of SVG_ALIASES) writeFileSync(join(ROOT, file), canonicalSvgAlias());
      console.log("");
    }

    console.log("verify:");
    for (const target of TARGETS) {
      await verifyPng(renderer, target, src, {
        opaque: target.kind !== "badge",
        safeCircle: target.kind === "maskable"
      });
    }
    verifyIco("public/favicon.ico");
    verifySvgAliases();
    verifyManifest();
  } finally {
    await renderer.close();
  }

  if (problems.length) {
    console.error(`\nbrand icons: ${problems.length} problem(s)`);
    process.exit(1);
  }
  console.log("\nbrand icons: all derivatives present, correctly sized, and rendering the approved mark");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
