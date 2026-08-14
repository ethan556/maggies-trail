#!/usr/bin/env node
/**
 * WS-J avatar asset build — masters → the two shipped WebP deliverables per avatar.
 *
 * SCOPE / GOVERNANCE: this script performs *mechanical downsampling only*. Every pixel it emits
 * comes from an already-QA-passed 1024x1024 master in `art/avatar-masters/`. It authors no
 * geometry, invents no art, and creates no output for an id the manifest does not declare. Its
 * companion rule from AVATAR_ART_PRODUCTION_SPEC.md §8 still holds in full: nothing may exist at
 * `public/avatars/avatar-*-{256,512}.webp` that is not derived from real production art.
 *
 * The id list is READ FROM `src/lib/avatars.ts`, never hard-coded here, so this script and the
 * manifest can never drift: a new id in the manifest becomes a required master + two required
 * outputs on the very next run, and an output with no manifest entry is reported as an orphan.
 *
 * Usage:
 *   node scripts/build-avatar-assets.mjs            # rebuild every WebP, then verify all of them
 *   node scripts/build-avatar-assets.mjs --check    # verify what is on disk; write nothing
 *   node scripts/build-avatar-assets.mjs --masters=<dir>   # override the master directory
 *
 * Verification is not optional and runs in both modes: every output is decoded back off disk and
 * checked for real byte size, exact dimensions, an opaque alpha channel, and genuine image content
 * (a blank or single-colour frame fails). A 0-byte or blank file is a hard failure, not a silent
 * pass — that is precisely the failure mode this gate exists to catch.
 *
 * Requires `sharp` (present in node_modules; libvips + libwebp). Deterministic: the same masters
 * and the same sharp build produce byte-identical output, so `--check` after a rebuild is a real
 * check and not a tautology.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const ROOT = resolve(import.meta.dirname, "..");
const MANIFEST_TS = "src/lib/avatars.ts";
const DEFAULT_MASTER_DIR = "art/avatar-masters";
const OUT_DIR = "public/avatars";

/** AVATAR_ART_PRODUCTION_SPEC.md §4: exactly two sizes ship, no others. */
const SIZES = [256, 512];
/** AVATAR_ART_PRODUCTION_SPEC.md §4: the master is square and at least this wide. */
const MASTER_SIZE = 1024;

/**
 * WebP encode settings. `quality` is high enough that the gradient-modelled shading in this art
 * (AVATAR_ART_PRODUCTION_SPEC.md §2) stays smooth rather than banding, `effort: 6` spends encode
 * time to buy file size, and `smartSubsample` keeps chroma edges (a rust collar against ivory)
 * from bleeding at 256. Lossless is deliberately NOT used: on smooth gradients it is several times
 * larger for no visible gain at these sizes.
 */
const WEBP = { quality: 88, effort: 6, smartSubsample: true, alphaQuality: 100 };

/** A real 256px avatar of this art is ~5-40 kB; anything under this is a broken encode. */
const MIN_BYTES = { 256: 1500, 512: 3000 };
/** A frame with fewer distinct colours than this is flat/blank, not a shaded portrait. */
const MIN_DISTINCT_COLOURS = 64;

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const masterArg = args.find((a) => a.startsWith("--masters="));
const MASTER_DIR = masterArg ? masterArg.split("=").slice(1).join("=") : DEFAULT_MASTER_DIR;

const problems = [];
const fail = (msg) => {
  problems.push(msg);
  console.error(`  x ${msg}`);
};

// ---------------------------------------------------------------------------
// The manifest is the source of truth for which files must exist.
// ---------------------------------------------------------------------------

/** Every avatar id declared in the manifest, in declaration order. */
function manifestIds() {
  const text = readFileSync(join(ROOT, MANIFEST_TS), "utf8");
  const ids = [...text.matchAll(/defineAvatar\(\s*"(avatar-\d{3})"/g)].map((m) => m[1]);
  if (ids.length === 0) throw new Error(`${MANIFEST_TS}: no defineAvatar("avatar-NNN", …) calls found`);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) throw new Error(`${MANIFEST_TS}: duplicate ids ${[...new Set(dupes)].join(", ")}`);
  return ids;
}

/** The one place an id becomes an output path — mirrors `avatarSrc()` in the manifest module. */
const outName = (id, size) => `${id}-${size}.webp`;

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const sharp = createRequire(import.meta.url)("sharp");

async function readMaster(id) {
  const path = join(ROOT, MASTER_DIR, `${id}.png`);
  if (!existsSync(path)) throw new Error(`missing master ${MASTER_DIR}/${id}.png`);
  const meta = await sharp(path).metadata();
  if (meta.width !== meta.height) throw new Error(`master ${id}.png is ${meta.width}x${meta.height}, not square`);
  if (meta.width < MASTER_SIZE) throw new Error(`master ${id}.png is ${meta.width}px, below the ${MASTER_SIZE}px floor`);
  return path;
}

/**
 * One master → one WebP. `kernel: "lanczos3"` is sharp's best-quality resampler and is what keeps
 * a 1024 → 256 reduction from turning fine hair/braid detail into aliased fringing.
 */
async function encode(masterPath, size) {
  return sharp(masterPath)
    .resize(size, size, { kernel: "lanczos3", fit: "fill" })
    .flatten({ background: "#F7F3EC" }) // §2's warm-ivory background; masters are already opaque
    .webp(WEBP)
    .toBuffer();
}

/** Decode a written file back off disk and prove it is a real, non-blank image at `size`. */
async function verifyOutput(id, size) {
  const rel = `${OUT_DIR}/${outName(id, size)}`;
  const path = join(ROOT, rel);
  if (!existsSync(path)) return fail(`${rel}: missing`);

  const bytes = statSync(path).size;
  if (bytes === 0) return fail(`${rel}: 0 bytes`);
  if (bytes < MIN_BYTES[size]) return fail(`${rel}: ${bytes} bytes, below the ${MIN_BYTES[size]}-byte floor`);

  const image = sharp(path);
  const meta = await image.metadata();
  if (meta.format !== "webp") return fail(`${rel}: decoded as ${meta.format}, expected webp`);
  if (meta.width !== size || meta.height !== size) {
    return fail(`${rel}: decoded ${meta.width}x${meta.height}, expected ${size}x${size}`);
  }

  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const colours = new Set();
  let minAlpha = 255;
  for (let i = 0; i < data.length; i += info.channels) {
    colours.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    if (data[i + 3] < minAlpha) minAlpha = data[i + 3];
  }
  if (minAlpha !== 255) return fail(`${rel}: has transparent pixels (min alpha ${minAlpha}); §2 wants an opaque background`);
  if (colours.size < MIN_DISTINCT_COLOURS) {
    return fail(`${rel}: only ${colours.size} distinct colours across ${px}px — blank or flat, not a shaded portrait`);
  }
  return { bytes, colours: colours.size };
}

async function main() {
  const ids = manifestIds();
  const outAbs = join(ROOT, OUT_DIR);
  console.log(
    `${checkOnly ? "Checking" : "Building"} avatar assets: ${ids.length} ids x ${SIZES.length} sizes ` +
      `= ${ids.length * SIZES.length} files\n  masters: ${MASTER_DIR}\n  output:  ${OUT_DIR}` +
      `\n  sharp ${sharp.versions.sharp} (libwebp ${sharp.versions.webp})`
  );

  if (!checkOnly) {
    mkdirSync(outAbs, { recursive: true });
    let written = 0;
    for (const id of ids) {
      let masterPath;
      try {
        masterPath = await readMaster(id);
      } catch (error) {
        fail(`${id}: ${error.message}`);
        continue;
      }
      for (const size of SIZES) {
        const buffer = await encode(masterPath, size);
        writeFileSync(join(outAbs, outName(id, size)), buffer);
        written++;
      }
    }
    console.log(`  wrote ${written} file${written === 1 ? "" : "s"}`);
  }

  // Verify every expected file, in both modes.
  let totalBytes = 0;
  let verified = 0;
  const perSize = Object.fromEntries(SIZES.map((s) => [s, { count: 0, bytes: 0 }]));
  for (const id of ids) {
    for (const size of SIZES) {
      const result = await verifyOutput(id, size);
      if (!result) continue;
      verified++;
      totalBytes += result.bytes;
      perSize[size].count++;
      perSize[size].bytes += result.bytes;
    }
  }

  // An output nobody declared is as much a defect as a missing one: it would ship unreferenced
  // bytes, or worse, sit at a path a future manifest id would silently adopt.
  const expected = new Set(ids.flatMap((id) => SIZES.map((s) => outName(id, s))));
  if (existsSync(outAbs)) {
    for (const name of readdirSync(outAbs)) {
      if (!/^avatar-.*\.webp$/.test(name)) continue; // placeholder-neutral.svg / README.md are not ours
      if (!expected.has(name)) fail(`${OUT_DIR}/${name}: orphan — no manifest entry declares it`);
    }
  }

  const kb = (b) => `${(b / 1024).toFixed(1)} kB`;
  for (const size of SIZES) {
    const s = perSize[size];
    console.log(`  ${size}px: ${s.count} files, ${kb(s.bytes)} total, ${kb(s.bytes / (s.count || 1))} avg`);
  }
  console.log(`  verified ${verified}/${ids.length * SIZES.length} files, ${kb(totalBytes)} total`);

  if (problems.length) {
    console.error(`\nAvatar asset build FAILED with ${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
    process.exit(1);
  }
  console.log(`\nAvatar assets OK: ${verified} files, all decoding at their declared size with real image content.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
