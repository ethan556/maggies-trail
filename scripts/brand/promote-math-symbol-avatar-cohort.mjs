#!/usr/bin/env node

/** Promote the independently-approved mathematics-symbol cohort as one exact production set. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const cohort = JSON.parse(
  await readFile(path.join(root, "avatar-math-symbol-cohort.json"), "utf8")
);
if (
  cohort.status !== "approved" ||
  cohort.release_eligible !== true ||
  cohort.release_unit !== "complete-math-symbol-cohort" ||
  !Array.isArray(cohort.ids) ||
  cohort.ids.length !== 12 ||
  new Set(cohort.ids).size !== 12
) {
  throw new Error("Refusing promotion: the exact 12-item cohort is not approved for atomic release.");
}

const sourceDir = path.join(root, "reports", "avatar-candidates", "s244-math-symbols");
const publicDir = path.join(root, "public", "avatars", "math-symbols");
await mkdir(publicDir, { recursive: true });

for (const id of cohort.ids) {
  const source = path.join(sourceDir, `${id}-master.png`);
  const master = sharp(source).flatten({ background: "#F7F3EC" });
  const webp512 = await master
    .clone()
    .resize(512, 512, { fit: "fill", kernel: "lanczos3" })
    .webp({ quality: 94, alphaQuality: 100, smartSubsample: true })
    .toBuffer();
  const webp256 = await sharp(webp512)
    .resize(256, 256, { fit: "fill", kernel: "lanczos3" })
    .webp({ quality: 94, alphaQuality: 100, smartSubsample: true })
    .toBuffer();
  await writeFile(path.join(publicDir, `${id}-512.webp`), webp512);
  await writeFile(path.join(publicDir, `${id}-256.webp`), webp256);
}

console.log(`Promoted ${cohort.ids.length} approved mathematics-symbol avatars atomically.`);
