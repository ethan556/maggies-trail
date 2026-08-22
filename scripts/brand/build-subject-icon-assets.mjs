import { createHash } from "node:crypto";
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const masterDirectory = path.join(root, "reports/icon-candidates/s244-subjects");
const outputDirectory = path.join(root, "public/illustrations/icons/subjects");
const contactSheetPath = path.join(root, "reports/icon-candidates/s244-subjects-contact-sheet.png");

const subjectIds = [
  "subject-number-place-value",
  "subject-operations",
  "subject-fractions-ratios",
  "subject-measurement",
  "subject-time",
  "subject-geometry-shapes",
  "subject-angles-construction",
  "subject-algebra-equations",
  "subject-functions-graphs",
  "subject-statistics-data",
  "subject-probability-chance",
  "subject-calculus-change",
];

const checkOnly = process.argv.includes("--check");

function masterPath(id) {
  return path.join(masterDirectory, `${id}-master.png`);
}

function outputPath(id) {
  return path.join(outputDirectory, `${id}-512.webp`);
}

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function labelSvg(text, width, height, fontSize = 18, fill = "#F7F3EC") {
  const safeText = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${fill}">${safeText}</text>
    </svg>`,
  );
}

async function buildProductionAssets() {
  await mkdir(outputDirectory, { recursive: true });
  for (const id of subjectIds) {
    await sharp(masterPath(id))
      .resize(512, 512, { fit: "cover" })
      .flatten({ background: "#F7F3EC" })
      .webp({ quality: 92, effort: 6, smartSubsample: true })
      .toFile(outputPath(id));
  }
}

async function verifyProductionAssets() {
  const hashes = new Set();
  for (const id of subjectIds) {
    const target = outputPath(id);
    await access(target);
    const [metadata, buffer] = await Promise.all([sharp(target).metadata(), readFile(target)]);
    if (metadata.format !== "webp" || metadata.width !== 512 || metadata.height !== 512) {
      throw new Error(`${id} must be an exact 512x512 WebP.`);
    }
    if (metadata.hasAlpha) throw new Error(`${id} must be opaque.`);
    const hash = digest(buffer);
    if (hashes.has(hash)) throw new Error(`${id} duplicates another subject icon byte-for-byte.`);
    hashes.add(hash);
  }
}

async function buildContactSheet() {
  const columns = 4;
  const rows = 3;
  const cellWidth = 360;
  const cellHeight = 330;
  const width = columns * cellWidth;
  const height = 90 + rows * cellHeight;
  const composites = [
    {
      input: labelSvg("SUBJECT ICON COHORT — 80 / 48 / 32 PX QA", width, 64, 26),
      left: 0,
      top: 18,
    },
  ];

  for (let index = 0; index < subjectIds.length; index += 1) {
    const id = subjectIds[index];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = column * cellWidth;
    const top = 82 + row * cellHeight;
    composites.push({
      input: labelSvg(id.replace("subject-", "").replaceAll("-", " "), cellWidth, 42, 17),
      left,
      top,
    });
    const sizes = [80, 48, 32];
    const centers = [95, 190, 270];
    for (let sizeIndex = 0; sizeIndex < sizes.length; sizeIndex += 1) {
      const size = sizes[sizeIndex];
      const rendered = await sharp(outputPath(id)).resize(size, size).png().toBuffer();
      composites.push({
        input: rendered,
        left: left + centers[sizeIndex] - Math.round(size / 2),
        top: top + 64,
      });
      composites.push({
        input: labelSvg(`${size}px`, 64, 30, 14, "#DCE9F5"),
        left: left + centers[sizeIndex] - 32,
        top: top + 150,
      });
    }
    const tiny = await sharp(outputPath(id)).resize(32, 32).png().toBuffer();
    const magnified = await sharp(tiny)
      .resize(112, 112, { kernel: "nearest" })
      .png()
      .toBuffer();
    composites.push({ input: magnified, left: left + 124, top: top + 190 });
  }

  await sharp({
    create: { width, height, channels: 3, background: "#0D1B2A" },
  })
    .composite(composites)
    .png()
    .toFile(contactSheetPath);
}

if (!checkOnly) {
  await buildProductionAssets();
  await buildContactSheet();
}
await verifyProductionAssets();

console.log(
  `${checkOnly ? "Verified" : "Built and verified"} ${subjectIds.length} production subject icons${
    checkOnly ? "" : ` and ${path.relative(root, contactSheetPath)}`
  }.`,
);
