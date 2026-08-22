#!/usr/bin/env node
/**
 * verify:math-format (Phase B, §21/§33).
 *
 *  M1  single renderer — `katex` is imported ONLY under src/lib/math/ and
 *      src/components/math/ (incl. its CSS). A second math path cannot appear silently.
 *  M2  learners never see raw LaTeX — lesson JSON contains no LaTeX commands. The corpus
 *      is clean today (0 files); this pins it: authored math enters through structured
 *      fields + the renderer when Phase C adopts it, never as \frac soup in prose.
 *  M3  the pipeline exists — renderMath.ts and MathText.tsx are present, and MathDisplay
 *      reserves height (the no-layout-shift contract is grep-able, and its removal fails).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const fail = [];

// M1
function sourceFiles(root, extensions) {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path, extensions));
    else if (extensions.some((extension) => entry.name.endsWith(extension))) out.push(path.replaceAll("\\", "/"));
  }
  return out;
}

const importers = sourceFiles("src", [".ts", ".tsx"]).filter((file) =>
  /from ["']katex|import\(["']katex|require\(["']katex|katex\/dist/.test(readFileSync(file, "utf8"))
);
for (const f of importers) {
  if (!f.startsWith("src/lib/math/") && !f.startsWith("src/components/math/")) {
    fail.push(`M1: ${f} imports katex outside the sanctioned math modules`);
  }
}
if (importers.length === 0) fail.push("M1: no katex importer found — the renderer is missing");

// M2
const rawLatex = sourceFiles("content/courses", [".json"]).filter((file) =>
  /\\(frac|sqrt|int|sum|begin|dfrac|cdot)/.test(readFileSync(file, "utf8"))
);
for (const f of rawLatex) fail.push(`M2: raw LaTeX command in lesson content: ${f}`);

// M3
if (!existsSync("src/lib/math/renderMath.ts")) fail.push("M3: renderMath.ts missing");
if (!existsSync("src/components/math/MathText.tsx")) fail.push("M3: MathText.tsx missing");
else {
  const src = readFileSync("src/components/math/MathText.tsx", "utf8");
  if (!src.includes("minHeight")) fail.push("M3: MathDisplay no longer reserves height (layout-shift contract)");
  if (!src.includes("MathInline") || !src.includes("MathDisplay")) fail.push("M3: component pair incomplete");
}

// M4 — the stage/theme contract is enforced by CSS, not just asserted in a doc. Math must
// inherit color (so `.stage` ink-on-light holds in dark chrome) and display math must scroll
// itself rather than the page at 360px.
const css = readFileSync("src/app/globals.css", "utf8");
if (!/\.math-display[\s\S]{0,400}color: inherit|color: inherit[\s\S]{0,400}\.math-display/.test(css)) {
  fail.push("M4: math surfaces no longer inherit color — the .stage dark-theme contract is broken");
}
if (!/\.math-display\s*\{[^}]*overflow-x:\s*auto/.test(css)) {
  fail.push("M4: .math-display lost overflow-x:auto — long math would scroll the page on mobile");
}
const darkStage = css.match(/\.dark \.lesson-stage\s*\{([^}]*)\}/)?.[1] ?? "";
if (!darkStage.includes("#ffffff") || !darkStage.includes("color: theme(colors.ink)")) {
  fail.push("M4: the dark-theme lesson stage is no longer the required ink-on-light mathematical canvas");
}

// M5 — SVG <text> has no mathematical layout engine. A caret expression in
// it is painted literally, bypassing KaTeX. Mathematical SVG labels must use
// SvgMathText, which hosts the sanctioned renderer inside a foreignObject.
for (const file of sourceFiles("src", [".tsx"])) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/<text\b[^>]*>[\s\S]*?<\/text>/g)) {
    if (match[0].includes("^")) fail.push(`M5: raw caret mathematics inside SVG <text>: ${file}`);
  }
}
const svgMath = "src/components/math/SvgMathText.tsx";
if (!existsSync(svgMath)) fail.push("M5: SvgMathText renderer bridge is missing");
else {
  const source = readFileSync(svgMath, "utf8");
  if (!source.includes("foreignObject") || !source.includes("MathInline")) {
    fail.push("M5: SvgMathText no longer routes SVG mathematics through the shared renderer");
  }
}

if (fail.length) {
  console.error(`verify:math-format FAILED:\n${fail.map((f) => `- ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`math-format: ${importers.length} sanctioned katex importer(s) · 0 raw-LaTeX lesson files · pipeline present`);
console.log("verify:math-format passed");
