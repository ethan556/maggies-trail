import { createHash } from "node:crypto";
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const masterDirectory = path.join(root, "reports/curriculum-icons/s244-masters");
const outputDirectory = path.join(root, "public/illustrations/icons/structure");
const contactSheetPath = path.join(
  root,
  "reports/curriculum-icons/s244-structure-contact-sheet.png",
);

const structureIds = [
  "structure-course-trail",
  "structure-chapter-landmark",
  "structure-lesson-waypoint",
  "structure-practice-clearing",
  "structure-assessment-summit",
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

function labelSvg(text, width, height, fontSize = 20, fill = "#F7F3EC") {
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
  for (const id of structureIds) {
    await sharp(masterPath(id))
      .resize(512, 512, { fit: "cover" })
      .flatten({ background: "#F7F3EC" })
      .webp({ quality: 92, effort: 6, smartSubsample: true })
      .toFile(outputPath(id));
  }
}

async function verifyProductionAssets() {
  const hashes = new Set();
  for (const id of structureIds) {
    const target = outputPath(id);
    await access(target);
    const [metadata, buffer] = await Promise.all([
      sharp(target).metadata(),
      readFile(target),
    ]);

    if (
      metadata.format !== "webp" ||
      metadata.width !== 512 ||
      metadata.height !== 512
    ) {
      throw new Error(
        `${id} must be an exact 512x512 WebP; received ${metadata.format} ${metadata.width}x${metadata.height}.`,
      );
    }
    if (metadata.hasAlpha) {
      throw new Error(`${id} must be opaque.`);
    }

    const hash = digest(buffer);
    if (hashes.has(hash)) {
      throw new Error(`${id} duplicates another structure icon byte-for-byte.`);
    }
    hashes.add(hash);
  }
}

async function buildContactSheet() {
  const width = 1500;
  const height = 840;
  const columnWidth = 280;
  const columnStart = 100;
  const sizes = [80, 48, 32];
  const rowY = [180, 350, 500];
  const composites = [
    {
      input: labelSvg("STRUCTURE ICON COHORT — ACTUAL-SIZE QA", width, 64, 26),
      left: 0,
      top: 24,
    },
    {
      input: labelSvg(
        "Bottom row: each 32 px render enlarged 4× with nearest-neighbour sampling",
        width,
        42,
        16,
        "#DCE9F5",
      ),
      left: 0,
      top: 86,
    },
  ];

  for (let column = 0; column < structureIds.length; column += 1) {
    const id = structureIds[column];
    const shortLabel = id.replace("structure-", "").replaceAll("-", " ");
    const centerX = columnStart + column * columnWidth + columnWidth / 2;
    composites.push({
      input: labelSvg(shortLabel, columnWidth, 44, 17),
      left: columnStart + column * columnWidth,
      top: 126,
    });

    for (let row = 0; row < sizes.length; row += 1) {
      const size = sizes[row];
      const rendered = await sharp(outputPath(id)).resize(size, size).png().toBuffer();
      composites.push({
        input: rendered,
        left: Math.round(centerX - size / 2),
        top: rowY[row],
      });
    }

    const tiny = await sharp(outputPath(id)).resize(32, 32).png().toBuffer();
    const magnified = await sharp(tiny)
      .resize(128, 128, { kernel: "nearest" })
      .png()
      .toBuffer();
    composites.push({
      input: magnified,
      left: Math.round(centerX - 64),
      top: 650,
    });
  }

  for (let row = 0; row < sizes.length; row += 1) {
    composites.push({
      input: labelSvg(`${sizes[row]} px`, 86, sizes[row], 17, "#F08A24"),
      left: 8,
      top: rowY[row],
    });
  }

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#0D1B2A",
    },
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
  `${checkOnly ? "Verified" : "Built and verified"} ${structureIds.length} production structure icons${
    checkOnly ? "" : ` and ${path.relative(root, contactSheetPath)}`
  }.`,
);
