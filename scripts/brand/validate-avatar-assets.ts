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
import {
  ENABLED_MATH_SYMBOL_AVATAR_IDS,
  isCompleteMathSymbolCohortEnabled,
  MATH_SYMBOL_AVATARS
} from "../../src/lib/mathSymbolAvatars";

type PromptRecord = {
  id: string;
  kind: "human" | "symbol";
  band: "early" | "explorer" | "adventurer" | "summit";
  files: string[];
};

type PromptPack = {
  version: string;
  count: number;
  avatars: PromptRecord[];
};

type CohortBand = {
  id: "early" | "explorer" | "adventurer" | "summit";
  status: "pending" | "approved";
  human_count: number;
  symbol_count: number;
  ids: string[];
};

type CohortPack = {
  version: string;
  prompt_pack_version: string;
  library_count: number;
  release_unit: "complete-library";
  canary: {
    status: "pending" | "approved";
    release_eligible: false;
    ids: string[];
  };
  bands: CohortBand[];
};

type MathSymbolCohortPack = {
  version: string;
  status: "pending" | "approved";
  release_eligible: boolean;
  release_unit: "complete-math-symbol-cohort";
  ids: string[];
  gates: string[];
};

type MathSymbolPromptPack = {
  version: string;
  avatars: Array<{
    id: string;
    symbol: string;
    name: string;
    motif: string;
  }>;
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const avatarDir = join(repoRoot, "public", "avatars");
const promptPackPath = join(repoRoot, "avatar-prompts.json");
const cohortPackPath = join(repoRoot, "avatar-production-cohorts.json");
const mathSymbolCohortPackPath = join(repoRoot, "avatar-math-symbol-cohort.json");
const mathSymbolPromptPackPath = join(repoRoot, "avatar-math-symbol-prompts.json");
const avatarFile = /^(avatar-\d{3})-(256|512)\.webp$/;
const mathAvatarFile = /^(avatar-\d{3})-(256|512)\.webp$/;
const allowedSupportFiles = new Set(["README.md", "placeholder-neutral.svg"]);
const targetBackground = [0xf7, 0xf3, 0xec] as const;
const cornerTolerance = 18;
const backgroundPatchFraction = 0.04;
const silhouetteThreshold = 40;
const maxPairMeanAbsoluteError = 12;
const ageBands = ["early", "explorer", "adventurer", "summit"] as const;

const errors: string[] = [];
const fail = (message: string) => errors.push(message);
export const avatarAssetValidationErrors = errors;

async function validateAvatarAssets(): Promise<void> {
const promptPackRaw = await readFile(promptPackPath, "utf8");
// Windows' locale-default text encoding can silently turn en/em dashes in the generated prompt
// pack into U+FFFD. The JSON still parses and the visual instructions look almost right, so this
// must fail explicitly before a production worker caches or submits corrupted prompts.
if (promptPackRaw.includes("\uFFFD")) fail("avatar prompt pack contains Unicode replacement characters");
const pack = JSON.parse(promptPackRaw) as PromptPack;
const cohorts = JSON.parse(await readFile(cohortPackPath, "utf8")) as CohortPack;
const mathCohort = JSON.parse(
  await readFile(mathSymbolCohortPackPath, "utf8")
) as MathSymbolCohortPack;
const mathPromptPack = JSON.parse(
  await readFile(mathSymbolPromptPackPath, "utf8")
) as MathSymbolPromptPack;
const promptById = new Map(pack.avatars.map((entry) => [entry.id, entry]));
const manifestById = new Map(AVATARS.map((entry) => [entry.id, entry]));

if (pack.count !== pack.avatars.length) {
  fail(`prompt pack count=${pack.count}, but contains ${pack.avatars.length} records`);
}
if (promptById.size !== pack.avatars.length) fail("prompt pack contains duplicate avatar ids");
if (manifestById.size !== AVATARS.length) fail("avatar manifest contains duplicate ids");
if (cohorts.release_unit !== "complete-library") fail("avatar release unit must stay complete-library");
if (cohorts.library_count !== AVATARS.length) {
  fail(`cohort library_count=${cohorts.library_count}, manifest contains ${AVATARS.length}`);
}
if (cohorts.prompt_pack_version !== pack.version) {
  fail(`cohort prompt-pack version ${cohorts.prompt_pack_version} disagrees with ${pack.version}`);
}

for (const avatar of AVATARS) {
  const prompt = promptById.get(avatar.id);
  if (!prompt) {
    fail(`${avatar.id}: missing from avatar-prompts.json`);
    continue;
  }
  if (prompt.kind !== avatar.kind) fail(`${avatar.id}: prompt kind=${prompt.kind}, manifest kind=${avatar.kind}`);
  if (prompt.band !== avatar.ageBand) {
    fail(`${avatar.id}: prompt band=${prompt.band}, manifest band=${avatar.ageBand}`);
  }
  const expected = [avatar.src256, avatar.src512];
  if (prompt.files.length !== 2 || expected.some((file) => !prompt.files.includes(`/public${file}`))) {
    fail(`${avatar.id}: prompt-pack files do not match manifest paths`);
  }
}
for (const id of promptById.keys()) {
  if (!manifestById.has(id)) fail(`${id}: prompt-pack record has no manifest entry`);
}

// V4 canary: exactly two independently-rendered humans per band plus two neutral symbols. It is
// evidence only and can never become a release unit by itself.
if (cohorts.canary.release_eligible !== false) fail("the V4 art-direction canary must not be release eligible");
if (new Set(cohorts.canary.ids).size !== cohorts.canary.ids.length) fail("canary contains duplicate ids");
if (cohorts.canary.ids.length !== 10) fail(`canary must contain 10 ids, got ${cohorts.canary.ids.length}`);
const canaryEntries = cohorts.canary.ids.map((id) => manifestById.get(id));
for (const id of cohorts.canary.ids) if (!manifestById.has(id)) fail(`canary id ${id} is absent from manifest`);
for (const band of ageBands) {
  const humans = canaryEntries.filter((entry) => entry?.kind === "human" && entry.ageBand === band).length;
  if (humans !== 2) fail(`canary must contain 2 ${band} humans, got ${humans}`);
}
const canarySymbols = canaryEntries.filter((entry) => entry?.kind === "symbol").length;
if (canarySymbols !== 2) fail(`canary must contain 2 symbols, got ${canarySymbols}`);

// Every band must still be structurally complete, but release is atomic across all 60 assets.
// This keeps the public identity library coherent across ages and prevents account/grade changes
// from moving a learner into a partially released collection.
if (cohorts.bands.length !== ageBands.length) {
  fail(`cohort pack must define ${ageBands.length} bands, got ${cohorts.bands.length}`);
}
const cohortIds = new Set<string>();
for (const band of ageBands) {
  const cohort = cohorts.bands.find((entry) => entry.id === band);
  if (!cohort) {
    fail(`cohort pack is missing ${band}`);
    continue;
  }
  if (new Set(cohort.ids).size !== cohort.ids.length) fail(`${band} cohort contains duplicate ids`);
  for (const id of cohort.ids) {
    if (cohortIds.has(id)) fail(`${id}: appears in more than one release cohort`);
    cohortIds.add(id);
  }
  const expected = AVATARS.filter((avatar) => avatar.ageBand === band);
  const actual = cohort.ids.map((id) => manifestById.get(id)).filter((entry) => entry !== undefined);
  const expectedIds = expected.map((entry) => entry.id).sort();
  const actualIds = actual.map((entry) => entry.id).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    fail(`${band}: cohort ids must exactly match the manifest's band collection`);
  }
  const humanCount = actual.filter((entry) => entry.kind === "human").length;
  const symbolCount = actual.filter((entry) => entry.kind === "symbol").length;
  if (cohort.human_count !== 12 || humanCount !== 12) {
    fail(`${band}: complete band must contain 12 humans (declared ${cohort.human_count}, found ${humanCount})`);
  }
  if (cohort.symbol_count !== 3 || symbolCount !== 3) {
    fail(`${band}: complete band must contain 3 symbols (declared ${cohort.symbol_count}, found ${symbolCount})`);
  }
}
if (cohortIds.size !== AVATARS.length) {
  fail(`release cohorts cover ${cohortIds.size}/${AVATARS.length} manifest ids`);
}
const enabledCount = AVATARS.filter((avatar) => avatar.enabled).length;
if (enabledCount !== 0 && enabledCount !== AVATARS.length) {
  fail(`partial library release (${enabledCount}/${AVATARS.length}) is forbidden; enable all 60 atomically`);
}
const approvedBands = cohorts.bands.filter((cohort) => cohort.status === "approved").length;
if (approvedBands !== 0 && approvedBands !== cohorts.bands.length) {
  fail(`cohort approval is atomic: ${approvedBands}/${cohorts.bands.length} bands are approved`);
}
if (approvedBands === cohorts.bands.length && enabledCount !== AVATARS.length) {
  fail("all cohorts say approved but the complete 60-avatar library is not enabled");
}
if (approvedBands === 0 && enabledCount !== 0) {
  fail("enabled avatars require all four cohorts to be approved");
}

// The optional mathematics collection is a separate all-or-none release unit. Enforce this at
// the stored-id/render gate as well as in the picker so a partial allowlist can never leak into a
// learner account through sync or a deep link.
const expectedMathIds = MATH_SYMBOL_AVATARS.map((avatar) => avatar.id).sort();
const declaredMathIds = [...mathCohort.ids].sort();
if (mathCohort.release_unit !== "complete-math-symbol-cohort") {
  fail("math-symbol release unit must stay complete-math-symbol-cohort");
}
if (new Set(mathCohort.ids).size !== mathCohort.ids.length) {
  fail("math-symbol cohort contains duplicate ids");
}
if (JSON.stringify(declaredMathIds) !== JSON.stringify(expectedMathIds)) {
  fail("math-symbol cohort ids must exactly match the 12-item manifest extension");
}
const mathEnabledCount = ENABLED_MATH_SYMBOL_AVATAR_IDS.length;
if (mathEnabledCount !== 0 && mathEnabledCount !== MATH_SYMBOL_AVATARS.length) {
  fail(`partial math-symbol release (${mathEnabledCount}/${MATH_SYMBOL_AVATARS.length}) is forbidden`);
}
if (mathCohort.status === "approved") {
  if (!mathCohort.release_eligible) fail("approved math-symbol cohort must be release eligible");
  if (!isCompleteMathSymbolCohortEnabled()) fail("approved math-symbol cohort must enable all 12 ids");
} else {
  if (mathCohort.release_eligible) fail("pending math-symbol cohort cannot be release eligible");
  if (mathEnabledCount !== 0) fail("pending math-symbol cohort cannot enable any ids");
}

const directoryEntries = await readdir(avatarDir, { withFileTypes: true });
const productionFiles: Array<{ name: string; id: string; size: 256 | 512 }> = [];
for (const entry of directoryEntries) {
  const name = entry.name;
  if (name === "math-symbols") {
    if (!entry.isDirectory()) fail("public/avatars/math-symbols must be a directory");
    continue;
  }
  const match = name.match(avatarFile);
  if (match && entry.isFile()) {
    productionFiles.push({ name, id: match[1], size: Number(match[2]) as 256 | 512 });
  } else if (!allowedSupportFiles.has(name) || !entry.isFile()) {
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
const decodedHashesBySize = new Map<number, Map<string, string>>();
const productionById = new Map<string, Map<256 | 512, string>>();
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

  // A one-pixel corner check can miss vignettes and dirty generated backgrounds. Sample four
  // square corner patches and compare their mean RGB to the locked warm-ivory canvas.
  const patchSize = Math.max(4, Math.round(Math.min(info.width, info.height) * backgroundPatchFraction));
  for (const [x0, y0] of [
    [0, 0],
    [info.width - patchSize, 0],
    [0, info.height - patchSize],
    [info.width - patchSize, info.height - patchSize]
  ]) {
    const sums = [0, 0, 0];
    let samples = 0;
    for (let y = y0; y < y0 + patchSize; y += 1) {
      for (let x = x0; x < x0 + patchSize; x += 1) {
        const offset = (y * info.width + x) * info.channels;
        sums[0] += data[offset];
        sums[1] += data[offset + 1];
        sums[2] += data[offset + 2];
        samples += 1;
      }
    }
    const mean = sums.map((sum) => Math.round(sum / samples));
    if (mean.some((channel, index) => Math.abs(channel - targetBackground[index]) > cornerTolerance)) {
      fail(`${file.name}: corner patch is rgb(${mean.join(",")}), outside warm-ivory tolerance`);
    }
  }

  // Broad silhouette guardrails catch edge-bleed and symbol scale failures deterministically.
  const rowCounts = new Uint32Array(info.height);
  const columnCounts = new Uint32Array(info.width);
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const distance = Math.hypot(
        data[offset] - targetBackground[0],
        data[offset + 1] - targetBackground[1],
        data[offset + 2] - targetBackground[2]
      );
      if (distance <= silhouetteThreshold) continue;
      rowCounts[y] += 1;
      columnCounts[x] += 1;
    }
  }
  const rowFloor = Math.max(3, Math.ceil(info.width * 0.005));
  const columnFloor = Math.max(3, Math.ceil(info.height * 0.005));
  const top = rowCounts.findIndex((count) => count >= rowFloor);
  const bottomFromEnd = [...rowCounts].reverse().findIndex((count) => count >= rowFloor);
  const left = columnCounts.findIndex((count) => count >= columnFloor);
  const rightFromEnd = [...columnCounts].reverse().findIndex((count) => count >= columnFloor);
  if ([top, bottomFromEnd, left, rightFromEnd].some((value) => value < 0)) {
    fail(`${file.name}: no measurable foreground silhouette`);
  } else {
    const bottom = info.height - 1 - bottomFromEnd;
    const right = info.width - 1 - rightFromEnd;
    const margin = Math.min(top, bottomFromEnd, left, rightFromEnd) / info.width;
    const width = (right - left + 1) / info.width;
    const height = (bottom - top + 1) / info.height;
    if (margin < 0.01) fail(`${file.name}: foreground touches the canvas safe area`);
    if (avatar.kind === "human" && (width < 0.4 || width > 0.94 || height < 0.68 || height > 0.98)) {
      fail(`${file.name}: portrait silhouette is outside broad framing limits (${(width * 100).toFixed(1)}% x ${(height * 100).toFixed(1)}%)`);
    }
    if (avatar.kind === "symbol") {
      // Symbols may be intentionally wide (trail/bridge), tall (compass), or
      // compact. Gate the dominant dimension and a usable minimum thickness;
      // requiring both dimensions near 60% incorrectly rejects premium,
      // legible elongated marks that passed the true-48px visual review.
      const longSide = Math.max(width, height);
      const shortSide = Math.min(width, height);
      if (longSide < 0.5 || longSide > 0.82 || shortSide < 0.22) {
        fail(`${file.name}: symbol silhouette is outside broad framing limits (${(width * 100).toFixed(1)}% x ${(height * 100).toFixed(1)}%)`);
      }
    }
  }

  const digest = createHash("sha256").update(bytes).digest("hex");
  const sameSize = hashesBySize.get(file.size) ?? new Map<string, string>();
  const duplicate = sameSize.get(digest);
  if (duplicate) fail(`${file.name}: byte-identical to ${duplicate}`);
  else sameSize.set(digest, file.name);
  hashesBySize.set(file.size, sameSize);

  const decodedDigest = createHash("sha256").update(data).digest("hex");
  const decodedSameSize = decodedHashesBySize.get(file.size) ?? new Map<string, string>();
  const decodedDuplicate = decodedSameSize.get(decodedDigest);
  if (decodedDuplicate) fail(`${file.name}: decoded pixels are identical to ${decodedDuplicate}`);
  else decodedSameSize.set(decodedDigest, file.name);
  decodedHashesBySize.set(file.size, decodedSameSize);

  const sizes = productionById.get(file.id) ?? new Map<256 | 512, string>();
  sizes.set(file.size, path);
  productionById.set(file.id, sizes);
}

// The 256 export is a deterministic downsample of the same approved master as the 512 export,
// never a second render. A generous lossy-WebP tolerance accommodates encoding differences while
// still rejecting mismatched source images.
for (const [id, sizes] of productionById) {
  const p256 = sizes.get(256);
  const p512 = sizes.get(512);
  if (!p256 || !p512) continue; // pair parity already reports the missing side above
  const small = await sharp(p256).removeAlpha().raw().toBuffer();
  const downsampled = await sharp(p512).resize(256, 256, { kernel: "lanczos3" }).removeAlpha().raw().toBuffer();
  if (small.length !== downsampled.length) {
    fail(`${id}: decoded 256/512 pair has incompatible channels`);
    continue;
  }
  let absoluteError = 0;
  for (let i = 0; i < small.length; i += 1) absoluteError += Math.abs(small[i] - downsampled[i]);
  const meanAbsoluteError = absoluteError / small.length;
  if (meanAbsoluteError > maxPairMeanAbsoluteError) {
    fail(`${id}: 256 export does not match the 512 source (mean absolute error ${meanAbsoluteError.toFixed(2)})`);
  }
}

// Exact nested file gate for the optional mathematics-symbol extension. This is intentionally
// separate from the 60-avatar root directory: the cohort may remain absent, but once approved it
// must land as one exact, complete, mechanically valid 24-file set.
const mathPromptById = new Map(mathPromptPack.avatars.map((entry) => [entry.id, entry]));
if (mathPromptById.size !== mathPromptPack.avatars.length) {
  fail("math-symbol prompt pack contains duplicate ids");
}
if (mathPromptPack.avatars.length !== MATH_SYMBOL_AVATARS.length) {
  fail(
    `math-symbol prompt pack contains ${mathPromptPack.avatars.length}/${MATH_SYMBOL_AVATARS.length} records`
  );
}
for (const avatar of MATH_SYMBOL_AVATARS) {
  const prompt = mathPromptById.get(avatar.id);
  if (!prompt) {
    fail(`${avatar.id}: missing from avatar-math-symbol-prompts.json`);
    continue;
  }
  if (prompt.symbol !== avatar.symbol) fail(`${avatar.id}: prompt/runtime symbol mismatch`);
  if (prompt.name !== avatar.semanticName) fail(`${avatar.id}: prompt/runtime semantic-name mismatch`);
  if (!prompt.motif.trim()) fail(`${avatar.id}: semantic motif must not be empty`);
  if (avatar.src256 !== `/avatars/math-symbols/${avatar.id}-256.webp`) {
    fail(`${avatar.id}: unexpected 256px runtime path`);
  }
  if (avatar.src512 !== `/avatars/math-symbols/${avatar.id}-512.webp`) {
    fail(`${avatar.id}: unexpected 512px runtime path`);
  }
}
for (const id of mathPromptById.keys()) {
  if (!MATH_SYMBOL_AVATARS.some((avatar) => avatar.id === id)) {
    fail(`${id}: math-symbol prompt record has no runtime definition`);
  }
}

const mathAvatarDir = join(avatarDir, "math-symbols");
const mathDirectoryEntries = await readdir(mathAvatarDir, { withFileTypes: true }).catch(
  (error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    fail(`cannot inspect public/avatars/math-symbols: ${error.code ?? error.message}`);
    return [];
  }
);
const mathProductionFiles: Array<{ name: string; id: string; size: 256 | 512 }> = [];
for (const entry of mathDirectoryEntries) {
  const match = entry.name.match(mathAvatarFile);
  if (!entry.isFile() || !match) {
    fail(`unapproved entry in public/avatars/math-symbols: ${entry.name}`);
    continue;
  }
  mathProductionFiles.push({
    name: entry.name,
    id: match[1],
    size: Number(match[2]) as 256 | 512
  });
}

const expectedMathProductionNames = new Set(
  isCompleteMathSymbolCohortEnabled()
    ? MATH_SYMBOL_AVATARS.flatMap((avatar) => [
        `${avatar.id}-256.webp`,
        `${avatar.id}-512.webp`
      ])
    : []
);
const presentMathProductionNames = new Set(mathProductionFiles.map((file) => file.name));
for (const name of expectedMathProductionNames) {
  if (!presentMathProductionNames.has(name)) fail(`missing public/avatars/math-symbols/${name}`);
}
for (const name of presentMathProductionNames) {
  if (!expectedMathProductionNames.has(name)) fail(`unexpected public/avatars/math-symbols/${name}`);
}
if (mathProductionFiles.length !== expectedMathProductionNames.size) {
  fail(
    `math-symbol production set has ${mathProductionFiles.length}/${expectedMathProductionNames.size} expected files`
  );
}

const mathManifestById = new Map(MATH_SYMBOL_AVATARS.map((avatar) => [avatar.id, avatar]));
const mathHashesBySize = new Map<number, Map<string, string>>();
const mathDecodedHashesBySize = new Map<number, Map<string, string>>();
const mathProductionById = new Map<string, Map<256 | 512, string>>();
for (const file of mathProductionFiles) {
  const avatar = mathManifestById.get(file.id as (typeof MATH_SYMBOL_AVATARS)[number]["id"]);
  if (!avatar) {
    fail(`${file.name}: math-symbol file id has no runtime definition`);
    continue;
  }
  const expectedName = `${avatar.id}-${file.size}.webp`;
  if (file.name !== expectedName) fail(`${file.name}: math-symbol filename/runtime path mismatch`);

  const filePath = join(mathAvatarDir, file.name);
  const bytes = await readFile(filePath);
  const image = sharp(bytes, { failOn: "warning" });
  const metadata = await image.metadata();
  if (metadata.format !== "webp") fail(`${file.name}: expected WebP, got ${metadata.format ?? "unknown"}`);
  if (metadata.width !== file.size || metadata.height !== file.size) {
    fail(`${file.name}: expected ${file.size}x${file.size}, got ${metadata.width}x${metadata.height}`);
  }
  if ((metadata.pages ?? 1) !== 1) fail(`${file.name}: multi-page assets are not allowed`);
  const stats = await image.stats();
  if (!stats.isOpaque) fail(`${file.name}: math-symbol exports must be opaque`);

  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (const [x, y] of [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1]
  ]) {
    const offset = (y * info.width + x) * info.channels;
    const rgb = [data[offset], data[offset + 1], data[offset + 2]];
    if (rgb.some((channel, index) => Math.abs(channel - targetBackground[index]) > cornerTolerance)) {
      fail(`${file.name}: math-symbol corner (${x},${y}) is outside warm-ivory tolerance`);
    }
  }

  const byteDigest = createHash("sha256").update(bytes).digest("hex");
  const byteHashes = mathHashesBySize.get(file.size) ?? new Map<string, string>();
  const byteDuplicate = byteHashes.get(byteDigest);
  if (byteDuplicate) fail(`${file.name}: byte-identical to ${byteDuplicate}`);
  else byteHashes.set(byteDigest, file.name);
  mathHashesBySize.set(file.size, byteHashes);

  const decodedDigest = createHash("sha256").update(data).digest("hex");
  const decodedHashes = mathDecodedHashesBySize.get(file.size) ?? new Map<string, string>();
  const decodedDuplicate = decodedHashes.get(decodedDigest);
  if (decodedDuplicate) fail(`${file.name}: decoded pixels are identical to ${decodedDuplicate}`);
  else decodedHashes.set(decodedDigest, file.name);
  mathDecodedHashesBySize.set(file.size, decodedHashes);

  const sizes = mathProductionById.get(file.id) ?? new Map<256 | 512, string>();
  sizes.set(file.size, filePath);
  mathProductionById.set(file.id, sizes);
}

for (const avatar of MATH_SYMBOL_AVATARS) {
  const sizes = mathProductionById.get(avatar.id);
  const has256 = sizes?.has(256) ?? false;
  const has512 = sizes?.has(512) ?? false;
  if (has256 !== has512) fail(`${avatar.id}: math-symbol 256/512 files must land together`);
  if (avatar.enabled !== (has256 && has512)) {
    fail(`${avatar.id}: enabled=${avatar.enabled}, but nested production pair present=${has256 && has512}`);
  }
  if (!has256 || !has512 || !sizes) continue;
  const small = await sharp(sizes.get(256)!).removeAlpha().raw().toBuffer();
  const downsampled = await sharp(sizes.get(512)!)
    .resize(256, 256, { kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer();
  let absoluteError = 0;
  for (let i = 0; i < small.length; i += 1) absoluteError += Math.abs(small[i] - downsampled[i]);
  const meanAbsoluteError = absoluteError / small.length;
  if (meanAbsoluteError > maxPairMeanAbsoluteError) {
    fail(
      `${avatar.id}: math-symbol 256 export does not match 512 source (mean absolute error ${meanAbsoluteError.toFixed(2)})`
    );
  }
}

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
}

/** Awaitable for Vitest imports; the CLI also stays alive for the underlying filesystem work. */
export const avatarAssetValidationPromise = validateAvatarAssets();
