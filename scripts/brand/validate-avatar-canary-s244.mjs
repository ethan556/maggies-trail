#!/usr/bin/env node

/** Mechanical gate for the quarantined S244 normalized canary. Never enables or publishes art. */

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const sourceDir = path.resolve("reports/avatar-candidates/s244-masters");
const outputDir = path.resolve("reports/avatar-candidates/s244-normalized");
const cohorts = JSON.parse(await readFile(path.resolve("avatar-production-cohorts.json"), "utf8"));
const ids = cohorts.canary.ids;
const errors = [];
const fail = (message) => errors.push(message);
const target = [0xf7, 0xf3, 0xec];
const maxMeanAbsoluteError = 12;

if (cohorts.canary.release_eligible !== false) fail("canary must remain non-release-eligible");
if (cohorts.canary.status !== "pending") fail("canary status must stay pending until independent review");
if (ids.length !== 10 || new Set(ids).size !== 10) fail("canary must contain 10 unique ids");

const sourceFiles = await readdir(sourceDir);
const sourceHashes = new Map();
for (const id of ids) {
  const name = `${id}-master.png`;
  if (!sourceFiles.includes(name)) {
    fail(`${id}: missing independent source master`);
    continue;
  }
  const bytes = await readFile(path.join(sourceDir, name));
  const digest = createHash("sha256").update(bytes).digest("hex");
  const duplicate = sourceHashes.get(digest);
  if (duplicate) fail(`${id}: source master duplicates ${duplicate}`);
  else sourceHashes.set(digest, id);
}

const outputFiles = new Set(await readdir(outputDir));
for (const support of [
  "normalization-manifest.json",
  "s244-canary-contact-sheet-256.png",
  "s244-canary-contact-sheet-512.png"
]) {
  if (!outputFiles.has(support)) fail(`missing evidence artifact ${support}`);
}

const decodedHashesBySize = new Map();
for (const id of ids) {
  const masterName = `${id}-normalized-master.png`;
  if (!outputFiles.has(masterName)) {
    fail(`${id}: missing normalized master`);
    continue;
  }
  const masterPath = path.join(outputDir, masterName);
  const masterMetadata = await sharp(masterPath).metadata();
  if (masterMetadata.format !== "png" || masterMetadata.width !== 1024 || masterMetadata.height !== 1024) {
    fail(`${id}: normalized master must be opaque 1024x1024 PNG`);
  }
  if (!(await sharp(masterPath).stats()).isOpaque) fail(`${id}: normalized master is not opaque`);

  for (const size of [256, 512]) {
    const name = `${id}-${size}.webp`;
    if (!outputFiles.has(name)) {
      fail(`${id}: missing ${size}px canary export`);
      continue;
    }
    const filePath = path.join(outputDir, name);
    const image = sharp(filePath, { failOn: "warning" });
    const metadata = await image.metadata();
    if (metadata.format !== "webp" || metadata.width !== size || metadata.height !== size) {
      fail(`${name}: must be ${size}x${size} WebP`);
    }
    if (!(await image.stats()).isOpaque) fail(`${name}: must be opaque`);
    const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (const [x, y] of [
      [0, 0],
      [info.width - 1, 0],
      [0, info.height - 1],
      [info.width - 1, info.height - 1]
    ]) {
      const offset = (y * info.width + x) * info.channels;
      const rgb = [data[offset], data[offset + 1], data[offset + 2]];
      if (rgb.some((channel, index) => Math.abs(channel - target[index]) > 4)) {
        fail(`${name}: corner is not normalized warm ivory`);
      }
    }
    const digest = createHash("sha256").update(data).digest("hex");
    const sameSize = decodedHashesBySize.get(size) ?? new Map();
    const duplicate = sameSize.get(digest);
    if (duplicate) fail(`${name}: decoded pixels duplicate ${duplicate}`);
    else sameSize.set(digest, name);
    decodedHashesBySize.set(size, sameSize);

    const reference = await sharp(masterPath)
      .resize(size, size, { kernel: "lanczos3" })
      .removeAlpha()
      .raw()
      .toBuffer();
    if (reference.length !== data.length) {
      fail(`${name}: channels disagree with normalized master`);
    } else {
      let error = 0;
      for (let index = 0; index < data.length; index += 1) error += Math.abs(data[index] - reference[index]);
      const meanAbsoluteError = error / data.length;
      if (meanAbsoluteError > maxMeanAbsoluteError) {
        fail(`${name}: export does not derive from normalized master (${meanAbsoluteError.toFixed(2)} MAE)`);
      }
    }
  }
}

if (errors.length) {
  console.error(`S244 avatar canary validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `S244 avatar canary validation passed: ${ids.length} unique sources, ${ids.length} normalized masters, ${ids.length * 2} quarantined WebPs, 2 labeled contact sheets, release eligible=false.`
  );
}
