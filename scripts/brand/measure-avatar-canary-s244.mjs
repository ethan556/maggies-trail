#!/usr/bin/env node

/**
 * Deterministic evidence measurements for the quarantined S244 V4 avatar canary.
 *
 * This script never reads or writes public/avatars and never changes the release manifest. It
 * measures only independently generated masters retained outside the shipping tree. Human review
 * still owns age-truth, facial independence, expression, and painterly quality.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const DEFAULT_DIR = path.resolve("reports/avatar-candidates/s244-masters");
const inputArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const inputDir = path.resolve(inputArgument ?? DEFAULT_DIR);
const includeReframes = process.argv.includes("--include-reframes");
const targetBackground = [0xf7, 0xf3, 0xec];
const silhouetteThreshold = 30;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function pct(value, total) {
  return Number(((value / total) * 100).toFixed(1));
}

function range(values) {
  return Number((Math.max(...values) - Math.min(...values)).toFixed(1));
}

function mean(values) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

async function measure(fileName) {
  const filePath = path.join(inputDir, fileName);
  const bytes = await readFile(filePath);
  const metadata = await sharp(bytes).metadata();
  const { data, info } = await sharp(bytes)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cornerSize = Math.max(4, Math.round(Math.min(info.width, info.height) * 0.04));
  const cornerSamples = [[], [], []];
  for (const [x0, y0] of [
    [0, 0],
    [info.width - cornerSize, 0],
    [0, info.height - cornerSize],
    [info.width - cornerSize, info.height - cornerSize]
  ]) {
    for (let y = y0; y < y0 + cornerSize; y += 1) {
      for (let x = x0; x < x0 + cornerSize; x += 1) {
        const offset = (y * info.width + x) * info.channels;
        cornerSamples[0].push(data[offset]);
        cornerSamples[1].push(data[offset + 1]);
        cornerSamples[2].push(data[offset + 2]);
      }
    }
  }
  const background = cornerSamples.map(median);

  const rowCounts = new Uint32Array(info.height);
  const columnCounts = new Uint32Array(info.width);
  let foregroundPixels = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const distance = Math.hypot(
        data[offset] - background[0],
        data[offset + 1] - background[1],
        data[offset + 2] - background[2]
      );
      if (distance <= silhouetteThreshold) continue;
      rowCounts[y] += 1;
      columnCounts[x] += 1;
      foregroundPixels += 1;
    }
  }

  const rowFloor = Math.max(3, Math.ceil(info.width * 0.005));
  const columnFloor = Math.max(3, Math.ceil(info.height * 0.005));
  const top = rowCounts.findIndex((count) => count >= rowFloor);
  const bottomFromEnd = [...rowCounts].reverse().findIndex((count) => count >= rowFloor);
  const left = columnCounts.findIndex((count) => count >= columnFloor);
  const rightFromEnd = [...columnCounts].reverse().findIndex((count) => count >= columnFloor);
  if ([top, bottomFromEnd, left, rightFromEnd].some((value) => value < 0)) {
    throw new Error(`${fileName}: no measurable foreground silhouette`);
  }
  const bottom = info.height - 1 - bottomFromEnd;
  const right = info.width - 1 - rightFromEnd;
  const id = fileName.match(/^(avatar-\d{3})(?:(?:-normalized)?-master|-reframe-v2)\.png$/u)?.[1];
  const kind = id && Number(id.slice(-3)) >= 400 ? "symbol" : "human";

  return {
    id,
    kind,
    file: fileName,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length,
    format: metadata.format,
    width: info.width,
    height: info.height,
    opaque: !(metadata.hasAlpha ?? false),
    backgroundRgb: background,
    backgroundDeltaFromF7F3EC: background.map((channel, index) => channel - targetBackground[index]),
    method: { silhouetteThreshold, rowFloor, columnFloor },
    silhouette: {
      left,
      top,
      right,
      bottom,
      leftMarginPct: pct(left, info.width),
      topMarginPct: pct(top, info.height),
      rightMarginPct: pct(info.width - 1 - right, info.width),
      bottomMarginPct: pct(info.height - 1 - bottom, info.height),
      widthPct: pct(right - left + 1, info.width),
      heightPct: pct(bottom - top + 1, info.height),
      foregroundPixelPct: pct(foregroundPixels, info.width * info.height)
    }
  };
}

const files = (await readdir(inputDir))
  .filter((fileName) =>
    /^avatar-\d{3}(?:-normalized)?-master\.png$/u.test(fileName) ||
    (includeReframes && /^avatar-\d{3}-reframe-v2\.png$/u.test(fileName))
  )
  .sort((a, b) => a.localeCompare(b));
const measurements = await Promise.all(files.map(measure));
const humans = measurements.filter((item) => item.kind === "human");
const symbols = measurements.filter((item) => item.kind === "symbol");

const summarize = (items) => ({
  count: items.length,
  meanTopMarginPct: mean(items.map((item) => item.silhouette.topMarginPct)),
  topMarginRangePct: range(items.map((item) => item.silhouette.topMarginPct)),
  meanWidthPct: mean(items.map((item) => item.silhouette.widthPct)),
  widthRangePct: range(items.map((item) => item.silhouette.widthPct)),
  meanHeightPct: mean(items.map((item) => item.silhouette.heightPct)),
  heightRangePct: range(items.map((item) => item.silhouette.heightPct))
});

const report = {
  status: "V4 CANARY / NON-SHIPPING",
  releaseEligible: false,
  inputDir: path.relative(process.cwd(), inputDir).replaceAll("\\", "/"),
  generatedAtPolicy: "No timestamp: identical inputs produce byte-identical JSON.",
  summary: {
    fileCount: measurements.length,
    uniqueSourceHashes: new Set(measurements.map((item) => item.sha256)).size,
    humans: summarize(humans),
    symbols: summarize(symbols)
  },
  measurements
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
