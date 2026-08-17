/**
 * Mechanical avatar release gate.
 *
 * This deliberately does not attempt to grade illustration quality. It proves the parts a
 * deterministic tool can prove before a human reviews the contact sheet: manifest/prompt parity,
 * exact filenames, enabled/file parity, WebP format and dimensions, opacity, background corners,
 * and byte-identical duplicate exports.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { AVATARS } from "../../src/lib/avatars";

type PromptRecord = {
  id: string;
  files: string[];
};

type PromptPack = {
  version: string;
  count: number;
  avatars: PromptRecord[];
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const avatarDir = join(repoRoot, "public", "avatars");
const promptPackPath = join(repoRoot, "avatar-prompts.json");
const avatarFile = /^(avatar-\d{3})-(256|512)\.webp$/;
const allowedSupportFiles = new Set(["README.md", "placeholder-neutral.svg"]);
const targetBackground = [0xf7, 0xf3, 0xec] as const;
const cornerTolerance = 18;

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

const pack = JSON.parse(await readFile(promptPackPath, "utf8")) as PromptPack;
const promptById = new Map(pack.avatars.map((entry) => [entry.id, entry]));
const manifestById = new Map(AVATARS.map((entry) => [entry.id, entry]));

if (pack.count !== pack.avatars.length) {
  fail(`prompt pack count=${pack.count}, but contains ${pack.avatars.length} records`);
}
if (promptById.size !== pack.avatars.length) fail("prompt pack contains duplicate avatar ids");
if (manifestById.size !== AVATARS.length) fail("avatar manifest contains duplicate ids");

for (const avatar of AVATARS) {
  const prompt = promptById.get(avatar.id);
  if (!prompt) {
    fail(`${avatar.id}: missing from avatar-prompts.json`);
    continue;
  }
  const expected = [avatar.src256, avatar.src512];
  if (prompt.files.length !== 2 || expected.some((file) => !prompt.files.includes(`/public${file}`))) {
    fail(`${avatar.id}: prompt-pack files do not match manifest paths`);
  }
}
for (const id of promptById.keys()) {
  if (!manifestById.has(id)) fail(`${id}: prompt-pack record has no manifest entry`);
}

const directoryFiles = await readdir(avatarDir);
const productionFiles: Array<{ name: string; id: string; size: 256 | 512 }> = [];
for (const name of directoryFiles) {
  const match = name.match(avatarFile);
  if (match) {
    productionFiles.push({ name, id: match[1], size: Number(match[2]) as 256 | 512 });
  } else if (!allowedSupportFiles.has(name)) {
    fail(`unapproved file in public/avatars: ${name}`);
  }
}

const present = new Set(productionFiles.map((file) => file.name));
for (const avatar of AVATARS) {
  const expected256 = avatar.src256.slice("/avatars/".length);
  const expected512 = avatar.src512.slice("/avatars/".length);
  const has256 = present.has(expected256);
  const has512 = present.has(expected512);
  if (has256 !== has512) fail(`${avatar.id}: 256px and 512px exports must land together`);
  if (avatar.enabled !== (has256 && has512)) {
    fail(`${avatar.id}: enabled=${avatar.enabled}, but production file pair present=${has256 && has512}`);
  }
}

const hashesBySize = new Map<number, Map<string, string>>();
for (const file of productionFiles) {
  const avatar = manifestById.get(file.id);
  if (!avatar) {
    fail(`${file.name}: file id has no manifest entry`);
    continue;
  }
  const expectedName = (file.size === 256 ? avatar.src256 : avatar.src512).slice("/avatars/".length);
  if (file.name !== expectedName) fail(`${file.name}: path disagrees with the canonical manifest`);

  const path = join(avatarDir, file.name);
  const bytes = await readFile(path);
  const image = sharp(bytes, { failOn: "warning" });
  const metadata = await image.metadata();
  if (metadata.format !== "webp") fail(`${file.name}: expected WebP, got ${metadata.format ?? "unknown"}`);
  if (metadata.width !== file.size || metadata.height !== file.size) {
    fail(`${file.name}: expected ${file.size}x${file.size}, got ${metadata.width}x${metadata.height}`);
  }
  if ((metadata.pages ?? 1) !== 1) fail(`${file.name}: animated or multi-page assets are not allowed`);

  const stats = await image.stats();
  if (!stats.isOpaque) fail(`${file.name}: avatar exports must be fully opaque`);

  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corners = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1]
  ];
  for (const [x, y] of corners) {
    const offset = (y * info.width + x) * info.channels;
    const rgb = [data[offset], data[offset + 1], data[offset + 2]];
    if (rgb.some((channel, index) => Math.abs(channel - targetBackground[index]) > cornerTolerance)) {
      fail(`${file.name}: corner (${x},${y}) is rgb(${rgb.join(",")}), outside the warm-ivory tolerance`);
    }
  }

  const digest = createHash("sha256").update(bytes).digest("hex");
  const sameSize = hashesBySize.get(file.size) ?? new Map<string, string>();
  const duplicate = sameSize.get(digest);
  if (duplicate) fail(`${file.name}: byte-identical to ${duplicate}`);
  else sameSize.set(digest, file.name);
  hashesBySize.set(file.size, sameSize);
}

export const avatarAssetValidationErrors = errors;

if (errors.length > 0) {
  console.error(`Avatar asset validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const enabled = AVATARS.filter((avatar) => avatar.enabled).length;
  console.log(
    `Avatar asset validation passed: prompt pack v${pack.version}, ${AVATARS.length} manifest entries, ${enabled} enabled, ${productionFiles.length} production files.`
  );
}
