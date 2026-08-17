#!/usr/bin/env node

/**
 * Deterministic silhouette measurements for the S243 avatar PRE-CANARY.
 *
 * This is evidence tooling, not a release validator. It deliberately reads only
 * the quarantined candidate directory and reports measurements to stdout.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const DEFAULT_DIR = path.resolve("reports/avatar-candidates/s243-precanary");
const inputDir = path.resolve(process.argv[2] ?? DEFAULT_DIR);
const threshold = 30;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function pct(value, total) {
  return Number(((value / total) * 100).toFixed(1));
}

async function measure(fileName) {
  const filePath = path.join(inputDir, fileName);
  const bytes = await readFile(filePath);
  const { data, info } = await sharp(bytes)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cornerSize = Math.max(4, Math.round(Math.min(info.width, info.height) * 0.03));
  const cornerSamples = [[], [], []];
  for (const [x0, y0] of [
    [0, 0],
    [info.width - cornerSize, 0],
    [0, info.height - cornerSize],
    [info.width - cornerSize, info.height - cornerSize],
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
        data[offset + 2] - background[2],
      );
      if (distance <= threshold) continue;
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
  const bottom = info.height - 1 - bottomFromEnd;
  const right = info.width - 1 - rightFromEnd;

  return {
    file: fileName,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length,
    width: info.width,
    height: info.height,
    backgroundRgb: background,
    method: { colorDistanceThreshold: threshold, rowFloor, columnFloor },
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
      foregroundPixelPct: pct(foregroundPixels, info.width * info.height),
    },
  };
}

const candidates = (await readdir(inputDir))
  .filter((fileName) => /(?:-512\.webp|-reframe-candidate\.png)$/u.test(fileName))
  .sort((a, b) => a.localeCompare(b));

const report = {
  status: "PRE-CANARY / NON-SHIPPING",
  inputDir: path.relative(process.cwd(), inputDir).replaceAll("\\", "/"),
  generatedAtPolicy: "No timestamp: identical inputs produce byte-identical JSON.",
  measurements: await Promise.all(candidates.map(measure)),
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
