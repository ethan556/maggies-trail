#!/usr/bin/env node

/**
 * Export reviewed avatar masters into the two runtime sizes.
 *
 * This command is intentionally explicit and fail-closed. It never generates art, never crops a
 * composite board, never enables a manifest entry, and never discovers ids from a directory.
 * The operator must name reviewed ids and acknowledge the review gate. Source masters stay in the
 * ignored art/avatar-masters directory; only the two WebP runtime exports enter public/avatars.
 */
import { access, mkdir, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const masterDir = path.join(repoRoot, "art", "avatar-masters");
const outputDir = path.join(repoRoot, "public", "avatars");
const promptPack = JSON.parse(await readFile(path.join(repoRoot, "avatar-prompts.json"), "utf8"));
const knownIds = new Set(promptPack.avatars.map((avatar) => avatar.id));

const args = process.argv.slice(2);
const confirmed = args.includes("--confirm-reviewed");
const replace = args.includes("--replace-reviewed");
const ids = args.filter((arg) => !arg.startsWith("--"));

function usage(message) {
  if (message) console.error(message);
  console.error(
    "Usage: node scripts/build-avatar-assets.mjs --confirm-reviewed [--replace-reviewed] avatar-001 [avatar-002 ...]"
  );
  process.exitCode = 2;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveMaster(id) {
  const matches = [];
  for (const extension of ["png", "webp", "tif", "tiff"]) {
    const candidate = path.join(masterDir, `${id}.${extension}`);
    if (await exists(candidate)) matches.push(candidate);
  }
  if (matches.length !== 1) {
    throw new Error(`${id}: expected exactly one master in art/avatar-masters, found ${matches.length}`);
  }
  return matches[0];
}

async function exportOne(id) {
  if (!knownIds.has(id)) throw new Error(`${id}: absent from avatar-prompts.json`);
  const masterPath = await resolveMaster(id);
  const metadata = await sharp(masterPath, { failOn: "warning" }).metadata();
  if (metadata.width !== metadata.height || (metadata.width ?? 0) < 1024) {
    throw new Error(`${id}: master must be square and at least 1024px; got ${metadata.width}x${metadata.height}`);
  }
  if ((metadata.pages ?? 1) !== 1) throw new Error(`${id}: animated or multi-page master is forbidden`);

  const outputs = [256, 512].map((size) => ({
    size,
    finalPath: path.join(outputDir, `${id}-${size}.webp`),
    stagedPath: path.join(outputDir, `.${id}-${size}.staged.webp`)
  }));
  if (!replace) {
    for (const output of outputs) {
      if (await exists(output.finalPath)) {
        throw new Error(`${id}: ${path.basename(output.finalPath)} exists; use --replace-reviewed only after renewed approval`);
      }
    }
  }

  await mkdir(outputDir, { recursive: true });
  try {
    for (const output of outputs) {
      await sharp(masterPath, { failOn: "warning" })
        .flatten({ background: "#F7F3EC" })
        .resize(output.size, output.size, { fit: "fill", kernel: "lanczos3" })
        .webp({ quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 })
        .toFile(output.stagedPath);
    }
    for (const output of outputs) {
      if (replace) await rm(output.finalPath, { force: true });
      await rename(output.stagedPath, output.finalPath);
    }
  } catch (error) {
    await Promise.all(outputs.map((output) => rm(output.stagedPath, { force: true })));
    throw error;
  }
  console.log(`${id}: exported 256px + 512px WebP from ${path.relative(repoRoot, masterPath)}`);
}

if (!confirmed || ids.length === 0) {
  usage(!confirmed ? "Refusing export without --confirm-reviewed." : "Name at least one avatar id.");
} else if (new Set(ids).size !== ids.length) {
  usage("Duplicate ids are not allowed.");
} else {
  for (const id of ids) await exportOne(id);
}
