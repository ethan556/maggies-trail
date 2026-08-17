import { createHash } from "node:crypto";
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const masterDirectory = path.join(root, "reports/icon-candidates/s244-grades");
const outputDirectory = path.join(root, "public/illustrations/icons/grades");
const contactSheetPath = path.join(
  root,
  "reports/curriculum-icons/s244-grade-contact-sheet.png",
);
const lightContactSheetPath = path.join(
  root,
  "reports/curriculum-icons/s244-grade-contact-sheet-light.png",
);

const gradeIcons = [
  ["grade-k", "Kindergarten"],
  ["grade-01", "Grade 1"],
  ["grade-02", "Grade 2"],
  ["grade-03", "Grade 3"],
  ["grade-04", "Grade 4"],
  ["grade-05", "Grade 5"],
  ["grade-06", "Grade 6"],
  ["grade-07", "Grade 7"],
  ["grade-08", "Grade 8"],
  ["grade-algebra-1", "Algebra 1"],
  ["grade-geometry", "Geometry"],
  ["grade-algebra-2", "Algebra 2"],
  ["grade-precalculus", "Precalculus"],
  ["grade-calculus", "Calculus"],
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
  for (const [id] of gradeIcons) {
    await sharp(masterPath(id))
      .resize(512, 512, { fit: "cover" })
      .flatten({ background: "#F7F3EC" })
      .webp({ quality: 92, effort: 6, smartSubsample: true })
      .toFile(outputPath(id));
  }
}

async function verifyProductionAssets() {
  const hashes = new Set();
  const records = [];
  for (const [id] of gradeIcons) {
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
    if (metadata.hasAlpha) throw new Error(`${id} must be opaque.`);

    const hash = digest(buffer);
    if (hashes.has(hash)) throw new Error(`${id} duplicates another grade icon byte-for-byte.`);
    hashes.add(hash);
    records.push({ id, hash, bytes: buffer.length });
  }
  return records;
}

async function buildContactSheet(targetPath, chrome) {
  const foreground = chrome === "#0D1B2A" ? "#F7F3EC" : "#0D1B2A";
  const secondary = chrome === "#0D1B2A" ? "#DCE9F5" : "#31506C";
  const columns = 7;
  const tileWidth = 260;
  const tileHeight = 340;
  const leftMargin = 72;
  const headerHeight = 104;
  const width = leftMargin + columns * tileWidth + 42;
  const height = headerHeight + 2 * tileHeight + 32;
  const composites = [
    {
      input: labelSvg("GRADE ICON COHORT — ACTUAL-SIZE QA", width, 52, 28, foreground),
      left: 0,
      top: 20,
    },
    {
      input: labelSvg(
        "Each candidate shown at 80 px, 48 px and 32 px; companion sheet covers alternate app chrome",
        width,
        32,
        16,
        secondary,
      ),
      left: 0,
      top: 68,
    },
  ];

  for (let index = 0; index < gradeIcons.length; index += 1) {
    const [id, label] = gradeIcons[index];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const tileLeft = leftMargin + column * tileWidth;
    const tileTop = headerHeight + row * tileHeight;
    const centerX = tileLeft + tileWidth / 2;

    composites.push({
      input: labelSvg(label, tileWidth, 38, 17, foreground),
      left: tileLeft,
      top: tileTop + 4,
    });

    const sizes = [80, 48, 32];
    const tops = [tileTop + 50, tileTop + 156, tileTop + 238];
    for (let sizeIndex = 0; sizeIndex < sizes.length; sizeIndex += 1) {
      const size = sizes[sizeIndex];
      const rendered = await sharp(outputPath(id)).resize(size, size).png().toBuffer();
      composites.push({
        input: rendered,
        left: Math.round(centerX - size / 2),
        top: tops[sizeIndex],
      });
      composites.push({
        input: labelSvg(`${size}px`, 58, size, 14, "#F08A24"),
        left: tileLeft + 8,
        top: tops[sizeIndex],
      });
    }
  }

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: chrome,
    },
  })
    .composite(composites)
    .png()
    .toFile(targetPath);
}

if (!checkOnly) {
  await buildProductionAssets();
  await buildContactSheet(contactSheetPath, "#0D1B2A");
  await buildContactSheet(lightContactSheetPath, "#F3F6F8");
}
const records = await verifyProductionAssets();

console.log(
  `${checkOnly ? "Verified" : "Built and verified"} ${records.length} production grade icons${
    checkOnly
      ? ""
      : ` and ${path.relative(root, contactSheetPath)} / ${path.relative(root, lightContactSheetPath)}`
  }.`,
);
for (const { id, hash, bytes } of records) console.log(`${id}\t${bytes}\t${hash}`);
