#!/usr/bin/env node

/**
 * Non-shipping avatar review-batch normalization (the no-argument default is the S244 canary).
 *
 * Keeps each independently generated identity intact, removes only its sampled near-ivory
 * background, then applies one uniform scale and translation onto a fresh #F7F3EC canvas. Human
 * silhouettes are contained inside approximately x=12.5–87.5%, y=14–95%; symbols retain their
 * already-consistent 61.4% x 66% medallion footprint. Outputs stay outside public/ and cannot be
 * selected by the app. Arbitrary batches require an explicit comma-separated --ids list.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const defaultIds = [
  "avatar-001",
  "avatar-002",
  "avatar-101",
  "avatar-102",
  "avatar-201",
  "avatar-202",
  "avatar-301",
  "avatar-302",
  "avatar-401",
  "avatar-403"
];

function parseArgs(argv) {
  const parsed = { positional: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      parsed.positional.push(token);
      continue;
    }
    const [flag, inlineValue] = token.split("=", 2);
    if (!["--input", "--output", "--ids", "--sheet-prefix"].includes(flag)) {
      throw new Error(`Unknown option: ${flag}`);
    }
    const value = inlineValue ?? argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    parsed[flag.slice(2).replace("-", "_")] = value;
  }
  if (parsed.positional.length > 2) {
    throw new Error("Use at most two positional values: input directory, then output directory");
  }
  return parsed;
}

const cli = parseArgs(process.argv.slice(2));
const inputDir = path.resolve(
  cli.input ?? cli.positional[0] ?? "reports/avatar-candidates/s244-masters"
);
const outputDir = path.resolve(
  cli.output ?? cli.positional[1] ?? "reports/avatar-candidates/s244-normalized"
);
const expectedIds = cli.ids ? cli.ids.split(",").map((id) => id.trim()).filter(Boolean) : defaultIds;
const sheetPrefix = cli.sheet_prefix ?? (cli.ids ? "avatar-review-batch" : "s244-canary");
if (expectedIds.length === 0) throw new Error("--ids must name at least one avatar id");
if (new Set(expectedIds).size !== expectedIds.length) throw new Error("--ids contains duplicates");
if (!/^[a-z0-9][a-z0-9-]*$/u.test(sheetPrefix)) {
  throw new Error("--sheet-prefix must contain only lowercase letters, numbers, and hyphens");
}

const promptPack = JSON.parse(await readFile(path.resolve("avatar-prompts.json"), "utf8"));
const promptById = new Map(promptPack.avatars.map((avatar) => [avatar.id, avatar]));
for (const id of expectedIds) {
  if (!/^avatar-\d{3}$/u.test(id)) throw new Error(`Invalid avatar id: ${id}`);
  if (!promptById.has(id)) throw new Error(`${id}: absent from avatar-prompts.json`);
}
const labels = Object.fromEntries(
  expectedIds.map((id) => {
    const prompt = promptById.get(id);
    const group = prompt.kind === "symbol" ? "neutral symbol" : prompt.band;
    return [id, `${id.slice(-3)} · ${group}`];
  })
);
const canvasSize = 1024;
const background = { r: 0xf7, g: 0xf3, b: 0xec, alpha: 1 };
const humanBox = {
  // The 75% width is the smallest symmetric box that keeps the widest summit silhouette above
  // the validator's 68% minimum height without cropping or non-uniform distortion.
  left: Math.round(canvasSize * 0.125),
  top: Math.round(canvasSize * 0.14),
  right: Math.round(canvasSize * 0.875),
  bottom: Math.round(canvasSize * 0.95)
};
const symbolBox = {
  left: Math.round(canvasSize * 0.193),
  top: Math.round(canvasSize * 0.17),
  right: Math.round(canvasSize * 0.807),
  bottom: Math.round(canvasSize * 0.83)
};
const transparentDistance = 12;
const opaqueDistance = 34;
const boundDistance = 30;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sampleBackground(data, info) {
  const patch = Math.max(4, Math.round(Math.min(info.width, info.height) * 0.04));
  const channels = [[], [], []];
  for (const [x0, y0] of [
    [0, 0],
    [info.width - patch, 0],
    [0, info.height - patch],
    [info.width - patch, info.height - patch]
  ]) {
    for (let y = y0; y < y0 + patch; y += 1) {
      for (let x = x0; x < x0 + patch; x += 1) {
        const offset = (y * info.width + x) * info.channels;
        channels[0].push(data[offset]);
        channels[1].push(data[offset + 1]);
        channels[2].push(data[offset + 2]);
      }
    }
  }
  return channels.map(median);
}

function foregroundBounds(data, info, sampledBackground) {
  const rows = new Uint32Array(info.height);
  const columns = new Uint32Array(info.width);
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const distance = Math.hypot(
        data[offset] - sampledBackground[0],
        data[offset + 1] - sampledBackground[1],
        data[offset + 2] - sampledBackground[2]
      );
      if (distance <= boundDistance) continue;
      rows[y] += 1;
      columns[x] += 1;
    }
  }
  const rowFloor = Math.max(3, Math.ceil(info.width * 0.005));
  const columnFloor = Math.max(3, Math.ceil(info.height * 0.005));
  const top = rows.findIndex((count) => count >= rowFloor);
  const bottomFromEnd = [...rows].reverse().findIndex((count) => count >= rowFloor);
  const left = columns.findIndex((count) => count >= columnFloor);
  const rightFromEnd = [...columns].reverse().findIndex((count) => count >= columnFloor);
  if ([top, bottomFromEnd, left, rightFromEnd].some((value) => value < 0)) {
    throw new Error("No measurable foreground silhouette");
  }
  return {
    left,
    top,
    right: info.width - 1 - rightFromEnd,
    bottom: info.height - 1 - bottomFromEnd
  };
}

function rgbaCrop(data, info, sampledBackground, bounds) {
  const pad = 4;
  const left = clamp(bounds.left - pad, 0, info.width - 1);
  const top = clamp(bounds.top - pad, 0, info.height - 1);
  const right = clamp(bounds.right + pad, 0, info.width - 1);
  const bottom = clamp(bounds.bottom + pad, 0, info.height - 1);
  const width = right - left + 1;
  const height = bottom - top + 1;
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = ((top + y) * info.width + left + x) * info.channels;
      const targetOffset = (y * width + x) * 4;
      const r = data[sourceOffset];
      const g = data[sourceOffset + 1];
      const b = data[sourceOffset + 2];
      const distance = Math.hypot(
        r - sampledBackground[0],
        g - sampledBackground[1],
        b - sampledBackground[2]
      );
      const alpha = Math.round(
        255 * clamp((distance - transparentDistance) / (opaqueDistance - transparentDistance), 0, 1)
      );
      rgba[targetOffset] = r;
      rgba[targetOffset + 1] = g;
      rgba[targetOffset + 2] = b;
      rgba[targetOffset + 3] = alpha;
    }
  }
  return { rgba, width, height };
}

async function normalize(id, filePath) {
  const { data, info } = await sharp(await readFile(filePath))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sampledBackground = sampleBackground(data, info);
  const bounds = foregroundBounds(data, info, sampledBackground);
  const crop = rgbaCrop(data, info, sampledBackground, bounds);
  const box = Number(id.slice(-3)) >= 400 ? symbolBox : humanBox;
  const boxWidth = box.right - box.left + 1;
  const boxHeight = box.bottom - box.top + 1;
  const scale = Math.min(boxWidth / crop.width, boxHeight / crop.height);
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const left = Math.round((canvasSize - width) / 2);
  const top = box.bottom - height + 1;
  const subject = await sharp(crop.rgba, {
    raw: { width: crop.width, height: crop.height, channels: 4 }
  })
    .resize(width, height, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  const master = await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background }
  })
    .composite([{ input: subject, left, top, premultiplied: true }])
    .removeAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  await writeFile(path.join(outputDir, `${id}-normalized-master.png`), master);
  for (const size of [256, 512]) {
    const output = await sharp(master)
      .resize(size, size, { kernel: "lanczos3" })
      .webp({ quality: 92, effort: 6 })
      .toBuffer();
    await writeFile(path.join(outputDir, `${id}-${size}.webp`), output);
  }
  return {
    id,
    sourceBounds: bounds,
    sampledBackground,
    targetBox: box,
    placed: { left, top, width, height },
    scale: Number(scale.toFixed(6))
  };
}

function xmlEscape(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function contactSheet(size) {
  const columns = Math.min(5, expectedIds.length);
  const rows = Math.ceil(expectedIds.length / columns);
  const gap = Math.max(12, Math.round(size * 0.06));
  const margin = gap;
  const labelHeight = Math.max(32, Math.round(size * 0.14));
  const tileHeight = size + labelHeight;
  const width = margin * 2 + columns * size + (columns - 1) * gap;
  const height = margin * 2 + rows * tileHeight + (rows - 1) * gap;
  const composites = [];

  for (const [index, id] of expectedIds.entries()) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = margin + column * (size + gap);
    const top = margin + row * (tileHeight + gap);
    composites.push({ input: path.join(outputDir, `${id}-${size}.webp`), left, top });
    const label = Buffer.from(
      `<svg width="${size}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">` +
        `<rect width="100%" height="100%" fill="#0D1B2A"/>` +
        `<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" ` +
        `font-family="Arial, sans-serif" font-size="${Math.max(14, Math.round(size * 0.055))}" ` +
        `font-weight="700" fill="#F7F3EC">${xmlEscape(labels[id])}</text></svg>`
    );
    composites.push({ input: label, left, top: top + size });
  }

  await sharp({
    create: { width, height, channels: 4, background: { r: 229, g: 224, b: 215, alpha: 1 } }
  })
    .composite(composites)
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, `${sheetPrefix}-contact-sheet-${size}.png`));
}

await mkdir(outputDir, { recursive: true });
const files = await readdir(inputDir);
const requested = new Set(expectedIds);
const sourceCandidates = new Map(expectedIds.map((id) => [id, []]));
for (const name of files) {
  const match = name.match(/^(avatar-\d{3})(?:-master)?\.(?:png|webp|tif|tiff)$/u);
  if (match && requested.has(match[1])) sourceCandidates.get(match[1]).push(name);
}
const sourceById = new Map();
for (const id of expectedIds) {
  const candidates = sourceCandidates.get(id);
  if (candidates.length !== 1) {
    throw new Error(`${id}: expected exactly one source master, found ${candidates.length}`);
  }
  sourceById.set(id, candidates[0]);
}

const placements = [];
for (const id of expectedIds) {
  placements.push(await normalize(id, path.join(inputDir, sourceById.get(id))));
}
await contactSheet(256);
await contactSheet(512);
await writeFile(
  path.join(outputDir, "normalization-manifest.json"),
  `${JSON.stringify(
    {
      status: cli.ids ? "V4 REVIEW BATCH / NON-SHIPPING" : "V4 CANARY / NON-SHIPPING",
      releaseEligible: false,
      ids: expectedIds,
      sheetPrefix,
      background: "#F7F3EC",
      matte: { transparentDistance, opaqueDistance, boundDistance },
      humanBox,
      symbolBox,
      placements
    },
    null,
    2
  )}\n`
);

console.log(`Normalized ${placements.length} non-shipping review assets to ${path.relative(process.cwd(), outputDir)}.`);
console.log("Created independent 256/512 pairs and labeled contact sheets; public/avatars was not modified.");
