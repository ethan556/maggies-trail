#!/usr/bin/env node

/**
 * Build durable true-size review evidence for the quarantined 60-avatar library.
 * The script never reads from or writes to public/. Optional reviewed revisions are substituted
 * only in the evidence sheets; cohort assets stay unchanged until an independent PASS.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const reportRoot = path.join(root, "reports", "avatar-candidates");
const outputDir = path.join(reportRoot, "s244-small-review");
const cohorts = JSON.parse(
  await readFile(path.join(root, "avatar-production-cohorts.json"), "utf8")
).bands;
const cohortDir = {
  early: "s244-early-normalized",
  explorer: "s244-explorer-normalized",
  adventurer: "s244-adventurer-normalized",
  summit: "s244-summit-normalized"
};
const reviewedRevisionIds = new Set(["avatar-205", "avatar-303"]);
const tile = 48;
const labelHeight = 18;
const gap = 10;
const margin = 12;

function sourceFor(cohort, id) {
  const directory = reviewedRevisionIds.has(id)
    ? "s244-revision-normalized"
    : cohortDir[cohort];
  return path.join(reportRoot, directory, `${id}-256.webp`);
}

function labelSvg(id) {
  return Buffer.from(
    `<svg width="${tile}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="100%" height="100%" fill="#0D1B2A"/>` +
      `<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" ` +
      `font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#F7F3EC">` +
      `${id.slice(-3)}</text></svg>`
  );
}

async function buildSheet(name, rows, columns) {
  const width = margin * 2 + columns * tile + (columns - 1) * gap;
  const height = margin * 2 + rows.length * (tile + labelHeight) + (rows.length - 1) * gap;
  const composites = [];
  const evidence = [];

  for (const [rowIndex, row] of rows.entries()) {
    for (const [columnIndex, entry] of row.entries()) {
      const source = sourceFor(entry.cohort, entry.id);
      const bytes = await readFile(source);
      const rendered = await sharp(bytes).resize(tile, tile, { kernel: "lanczos3" }).png().toBuffer();
      const left = margin + columnIndex * (tile + gap);
      const top = margin + rowIndex * (tile + labelHeight + gap);
      composites.push({ input: rendered, left, top });
      composites.push({ input: labelSvg(entry.id), left, top: top + tile });
      evidence.push({
        id: entry.id,
        cohort: entry.cohort,
        source: path.relative(root, source).replaceAll("\\", "/"),
        sha256: createHash("sha256").update(bytes).digest("hex"),
        reviewed_revision: reviewedRevisionIds.has(entry.id)
      });
    }
  }

  const output = path.join(outputDir, `${name}-true-48px.png`);
  await sharp({
    create: { width, height, channels: 4, background: { r: 229, g: 224, b: 215, alpha: 1 } }
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(output);
  return { output: path.relative(root, output).replaceAll("\\", "/"), evidence };
}

await mkdir(outputDir, { recursive: true });
const manifest = {
  version: "1.0",
  status: "REVIEW_ONLY_NON_SHIPPING",
  true_rendered_tile_px: tile,
  substitutions: [...reviewedRevisionIds],
  sheets: []
};

for (const cohort of cohorts) {
  const entries = cohort.ids.map((id) => ({ id, cohort: cohort.id }));
  manifest.sheets.push(
    await buildSheet(
      `s244-${cohort.id}`,
      Array.from({ length: 3 }, (_, index) => entries.slice(index * 5, index * 5 + 5)),
      5
    )
  );
}

const allEntries = cohorts.flatMap((cohort) => cohort.ids.map((id) => ({ id, cohort: cohort.id })));
manifest.sheets.push(
  await buildSheet(
    "s244-full-library",
    Array.from({ length: 6 }, (_, index) => allEntries.slice(index * 10, index * 10 + 10)),
    10
  )
);

await writeFile(
  path.join(outputDir, "small-review-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);
console.log(`Built ${manifest.sheets.length} true-48px review sheets in ${outputDir}`);
