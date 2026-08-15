#!/usr/bin/env node
/**
 * S242 / CACHE-01 — THE CONTENT-ADDRESSED WORKER PRECACHE.
 *
 * WHY. Every worker in this program currently rescans a very large corpus to answer questions the
 * last worker already answered: 1,840 lesson files parsed to find which steps carry a variant,
 * parsed again to find which carry a prediction, again to build a concept map. The plan asks for
 * `/.cowork-cache/pedagogy-v3/` so that parsing happens once per source seal and workers query
 * indexes instead.
 *
 * WHAT IT IS NOT, and this is the load-bearing constraint. The cache is an EVIDENCE ACCELERATOR.
 * It is never source-of-truth curriculum, it is never read by the application, and it must never
 * reach a release archive. Three mechanisms enforce that rather than one comment asking nicely:
 *   · `.cowork-cache/` is in `.gitignore`, so it cannot be committed;
 *   · `scripts/native-integrity.mjs` lists it among the generated artifacts that must be absent
 *     from a source release, so a release containing one fails the gate;
 *   · every layer records the hashes of the files it was derived from, so a stale layer is
 *     detectable rather than merely old.
 *
 * INVALIDATION IS BY CONTENT HASH, NEVER BY TIMESTAMP. A timestamp says a file was written; a hash
 * says what is in it. `git checkout` of an older branch rewrites mtimes without changing content,
 * and a rebuild triggered by that is wasted work; worse, a file restored to earlier content keeps
 * a NEWER mtime, and a timestamp cache would then serve the wrong answer forever.
 *
 * GRANULARITY, as §8 specifies it:
 *   · a lesson edit invalidates the curriculum graph and the quality records for that lesson only;
 *   · a generator edit invalidates the generator graph, every sampled output and the audits below;
 *   · a renderer, canonicalizer or schema edit invalidates EVERY math fixture and presentation
 *     record, because the boundary those records were measured against has moved.
 * The last rule is why `authoredMath.ts`, `renderMath.ts`, `MathText.tsx` and `schema.ts` are named
 * explicitly as boundary inputs rather than being treated as ordinary source files.
 *
 * Usage:
 *   node scripts/cache/pedagogy-v3-cache.mjs           # build stale layers only
 *   node scripts/cache/pedagogy-v3-cache.mjs --force   # rebuild everything
 *   node scripts/cache/pedagogy-v3-cache.mjs --status  # what is stale and why; writes nothing
 *   node scripts/cache/pedagogy-v3-cache.mjs --verify  # build twice, prove byte-identical output
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const CACHE = join(ROOT, ".cowork-cache", "pedagogy-v3");
const MODE = process.argv.includes("--status") ? "status"
  : process.argv.includes("--verify") ? "verify"
    : process.argv.includes("--force") ? "force" : "build";

/** Bump when a builder's OUTPUT SHAPE changes; a stale shape is as wrong as stale content. */
const EXTRACTOR_VERSION = 1;

const sha = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const posix = (p) => p.split(sep).join("/");

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", ".cowork-cache", "coverage", "test-results",
  "playwright-report", ".turbo", "art"
]);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* INPUT HASHING. One pass over the tree; every layer selects from it.                              */
/* ------------------------------------------------------------------ */

const files = walk(ROOT).filter((f) => !/\.(png|jpg|jpeg|gif|webp|ico|woff2?|mp[34]|zip|bundle)$/i.test(f));
const hashes = new Map();
for (const file of files) {
  try { hashes.set(posix(relative(ROOT, file)), sha(readFileSync(file))); } catch { /* unreadable: not an input */ }
}

const select = (predicate) => {
  const picked = {};
  for (const [path, hash] of hashes) if (predicate(path)) picked[path] = hash;
  return picked;
};
/** A layer's input fingerprint: one hash over its selected files, sorted so it is order-independent. */
const fingerprint = (selected) =>
  sha(Object.keys(selected).sort().map((k) => `${k}:${selected[k]}`).join("\n") + `|v${EXTRACTOR_VERSION}`);

/* THE RENDERING BOUNDARY. An edit to any of these invalidates every presentation record, because
 * those records measure what these files do. Named explicitly so the rule cannot be forgotten. */
const BOUNDARY = [
  "src/lib/math/authoredMath.ts", "src/lib/math/renderMath.ts",
  "src/components/math/MathText.tsx", "src/lib/schema.ts"
];
const isContent = (p) => p.startsWith("content/") && p.endsWith(".json");
const isGenerator = (p) => /^src\/lib\/(variants|.*Variants)\.ts$/.test(p) || p === "src/lib/prng.ts";
const isBoundary = (p) => BOUNDARY.includes(p);
const isSource = (p) => p.startsWith("src/") && /\.(ts|tsx)$/.test(p) && !/\.test\.tsx?$/.test(p);
const isTest = (p) => /\.test\.tsx?$/.test(p) || p.startsWith("e2e/") || p.startsWith("tests/");

/* ------------------------------------------------------------------ */
/* THE LAYERS.                                                                                      */
/* ------------------------------------------------------------------ */

const lessonCache = new Map();
function lessons() {
  if (lessonCache.size) return lessonCache;
  for (const path of Object.keys(select(isContent))) {
    let json;
    try { json = JSON.parse(readFileSync(join(ROOT, path), "utf8")); } catch { continue; }
    const lesson = json.lesson ?? json;
    if (!Array.isArray(lesson.steps) || !lesson.steps.length) continue;
    lessonCache.set(path, lesson);
  }
  return lessonCache;
}

const LAYERS = [
  {
    name: "snapshot-manifest",
    file: "manifest.json",
    inputs: () => select(() => true),
    build: (inputs) => ({
      corpusHash: fingerprint(select(isContent)),
      sourceHash: fingerprint(select(isSource)),
      boundaryHash: fingerprint(select(isBoundary)),
      lockHash: hashes.get("package-lock.json") ?? null,
      seal: (() => { try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch { return "unsealed"; } })(),
      node: process.version,
      extractorVersion: EXTRACTOR_VERSION,
      fileCount: Object.keys(inputs).length,
      exclusions: [...SKIP_DIRS].sort(),
      // Deliberately NOT a timestamp. A generation time makes two identical builds differ, which
      // destroys the byte-stability property TRUTH-03 needs. The seal and the hashes say when.
      note: "Evidence accelerator. Never source-of-truth curriculum; never shipped in a release archive."
    })
  },
  {
    name: "curriculum-graph",
    file: "curriculum-graph.json",
    inputs: () => select(isContent),
    build: () => {
      const courses = new Map();
      const concepts = new Map();
      const steps = [];
      for (const [path, lesson] of lessons()) {
        const courseId = lesson.courseId ?? "(none)";
        if (!courses.has(courseId)) courses.set(courseId, { lessons: [], stepCount: 0 });
        const course = courses.get(courseId);
        course.lessons.push(lesson.id);
        for (const [index, step] of lesson.steps.entries()) {
          course.stepCount++;
          const tag = step.conceptTag ?? null;
          if (tag) {
            if (!concepts.has(tag)) concepts.set(tag, { steps: 0, lessons: new Set(), courses: new Set() });
            const concept = concepts.get(tag);
            concept.steps++;
            concept.lessons.add(lesson.id);
            concept.courses.add(courseId);
          }
          steps.push({
            lesson: lesson.id, step: step.id ?? String(index), index, path, kind: step.kind ?? null,
            widget: step.widget?.type ?? null, conceptTag: tag,
            variant: step.variant ? `${step.variant.gen}${step.variant.form ? "@" + step.variant.form : ""}` : null,
            predict: Boolean(step.predict), flagship: step.cml?.flagship === true, stage: step.cml?.stage ?? null
          });
        }
      }
      return {
        courses: Object.fromEntries([...courses].map(([id, c]) => [id, { ...c, lessonCount: c.lessons.length }])),
        concepts: Object.fromEntries([...concepts].map(([tag, c]) =>
          [tag, { steps: c.steps, lessons: [...c.lessons].sort(), courses: [...c.courses].sort() }])),
        steps,
        totals: {
          courses: courses.size, lessons: lessons().size, steps: steps.length,
          conceptTags: concepts.size,
          withVariant: steps.filter((s) => s.variant).length,
          withPredict: steps.filter((s) => s.predict).length,
          flagship: steps.filter((s) => s.flagship).length,
          // The number that made 1,161 of 1,165 tags a LOCAL label rather than a shared vocabulary,
          // which is why the resolver needs an alias table at all.
          singleCourseTags: [...concepts.values()].filter((c) => c.courses.size === 1).length
        }
      };
    }
  },
  {
    name: "generator-graph",
    file: "generator-graph.json",
    inputs: () => ({ ...select(isGenerator), ...select(isContent) }),
    build: () => {
      // The USER MAP, built from declarations rather than from the registry: which content actually
      // reaches each generator. Derived here so no worker has to re-walk the corpus for it.
      const users = new Map();
      for (const [, lesson] of lessons()) {
        for (const step of lesson.steps) {
          if (!step.variant?.gen) continue;
          const gen = step.variant.gen;
          if (!users.has(gen)) users.set(gen, { declarations: 0, forms: new Set(), lessons: new Set(), conceptTags: new Set() });
          const user = users.get(gen);
          user.declarations++;
          user.forms.add(step.variant.form ?? "default");
          user.lessons.add(lesson.id);
          if (step.conceptTag) user.conceptTags.add(step.conceptTag);
        }
      }
      const inventoryPath = join(ROOT, "GENERATOR_INVENTORY.json");
      const inventory = existsSync(inventoryPath) ? JSON.parse(readFileSync(inventoryPath, "utf8")) : null;
      return {
        inventorySummary: inventory?.summary ?? null,
        userMap: Object.fromEntries([...users].sort().map(([gen, u]) =>
          [gen, { declarations: u.declarations, forms: [...u.forms].sort(), lessons: u.lessons.size, conceptTags: u.conceptTags.size }])),
        // The seed manifest: the exact recipe the sweep uses, recorded so a worker reproduces a row
        // without reading the sweep's source.
        seedManifest: {
          recipe: 'hashSeed("<tag>|<form>|<band>|<index>")',
          bands: ["support", "core", "stretch"],
          bandRotation: "band = BANDS[index % 3]",
          tiers: { high: 500, ordinary: 100 },
          minPerForm: 30
        },
        totals: { generatorsWithDeclarations: users.size, declarations: [...users.values()].reduce((n, u) => n + u.declarations, 0) }
      };
    }
  },
  {
    name: "repository-graph",
    file: "repository-graph.json",
    inputs: () => ({ ...select(isSource), ...select(isTest) }),
    build: () => {
      const imports = {};
      const sizes = {};
      for (const path of Object.keys(select((p) => isSource(p) || isTest(p)))) {
        const text = readFileSync(join(ROOT, path), "utf8");
        sizes[path] = text.length;
        imports[path] = [...text.matchAll(/from\s+["']([^"']+)["']/g)]
          .map((m) => m[1]).filter((s) => s.startsWith(".") || s.startsWith("@/")).sort();
      }
      const importedBy = {};
      for (const [from, list] of Object.entries(imports))
        for (const to of list) (importedBy[to] ??= []).push(from);
      // The hot files: biggest first. variants.ts and widgets.tsx are the two the plan names as
      // performance and review hazards, and a worker should not have to discover that again.
      const hot = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 20)
        .map(([path, bytes]) => ({ path, bytes }));
      const testMap = {};
      for (const path of Object.keys(select(isTest))) {
        const subject = path.replace(/\.[a-z0-9]+\.test\.tsx?$/, "").replace(/\.test\.tsx?$/, "");
        (testMap[subject] ??= []).push(path);
      }
      return { hot, importedBy, testMap, totals: { sourceFiles: Object.keys(sizes).length } };
    }
  },
  {
    name: "quality-index",
    file: "quality-index.json",
    // Presentation records are derived against the BOUNDARY, so a boundary edit invalidates them
    // even when no content and no generator changed. This is §8's third invalidation rule.
    inputs: () => ({ ...select(isBoundary), ...select(isContent), ...select(isGenerator) }),
    build: () => {
      const reports = {};
      for (const dir of ["reports/generator-audit", "reports/math-presentation"]) {
        const full = join(ROOT, dir);
        if (!existsSync(full)) continue;
        for (const name of readdirSync(full).filter((n) => n.endsWith(".csv"))) {
          const text = readFileSync(join(full, name), "utf8");
          const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
          reports[`${dir}/${name}`] = { rows: Math.max(lines.length - 1, 0), hash: sha(text) };
        }
      }
      return {
        reports,
        boundaryHash: fingerprint(select(isBoundary)),
        note: "Row counts and hashes only. The CSVs themselves stay in reports/ where they are reviewable; this layer exists so a worker can tell whether the ones on disk were measured against the CURRENT boundary."
      };
    }
  },
  {
    name: "task-packets",
    file: "task-packets.json",
    inputs: () => select((p) => /^(GENERATOR_REBUILD_LEDGER|MATH_PRESENTATION_BASELINE|ARCH_03_04_SPECIFICATION|CML_WAIVERS)\./.test(p)),
    build: () => {
      // Packets are IMMUTABLE inputs to a worker: what to change, what not to, what proves it.
      // Extracted from the ledgers so the two cannot drift apart.
      const packets = [];
      const ledger = join(ROOT, "GENERATOR_REBUILD_LEDGER.md");
      const baseline = join(ROOT, "MATH_PRESENTATION_BASELINE.md");
      for (const [file, prefix] of [[ledger, "GRB"], [baseline, "MPB"]]) {
        if (!existsSync(file)) continue;
        const text = readFileSync(file, "utf8");
        for (const m of text.matchAll(new RegExp(`^#{2,3} (${prefix}-\\d+) — ([^\\n]+)`, "gm")))
          packets.push({ id: m[1], title: m[2].trim(), source: posix(relative(ROOT, file)) });
      }
      return {
        packets,
        stopRules: [
          "An unresolved design decision stops implementation; the specification is refined, not guessed at.",
          "A prompt-text change re-runs src/lib/variants.test.ts in the same commit — INDEPENDENT routes parse the printed prompt.",
          "No packet patches sampled generated output; the generator, formatter or primitive is repaired.",
          "A gate may be corrected only to be stricter or equally strict, and the correction is stated in the log."
        ],
        totals: { packets: packets.length }
      };
    }
  }
];

/* ------------------------------------------------------------------ */
/* BUILD / STATUS / VERIFY.                                                                         */
/* ------------------------------------------------------------------ */

function layerState(layer) {
  const path = join(CACHE, layer.file);
  const inputs = layer.inputs();
  const want = fingerprint(inputs);
  if (!existsSync(path)) return { layer, want, stale: true, why: "absent" };
  let have;
  try { have = JSON.parse(readFileSync(path, "utf8")); } catch { return { layer, want, stale: true, why: "unreadable" }; }
  if (have._inputFingerprint !== want) {
    const previous = have._inputs ?? {};
    const changed = Object.keys({ ...previous, ...inputs }).filter((k) => previous[k] !== inputs[k]);
    return { layer, want, inputs, stale: true, why: `${changed.length} input(s) changed, first: ${changed.slice(0, 3).join(", ") || "(count only)"}` };
  }
  return { layer, want, inputs, stale: false, why: "current" };
}

const states = LAYERS.map(layerState);

if (MODE === "status") {
  console.log(`pedagogy-v3 cache @ ${CACHE}`);
  for (const s of states) console.log(`  ${s.stale ? "STALE  " : "current"}  ${s.layer.name.padEnd(18)} ${s.why}`);
  process.exit(states.some((s) => s.stale) ? 1 : 0);
}

function build(force) {
  mkdirSync(CACHE, { recursive: true });
  const built = [];
  for (const state of states) {
    if (!force && !state.stale) continue;
    const inputs = state.inputs ?? state.layer.inputs();
    const body = state.layer.build(inputs);
    // Inputs are recorded INSIDE the layer, so a layer file is self-describing: it carries the
    // evidence for its own freshness and does not depend on a sidecar that can be lost.
    const out = { _layer: state.layer.name, _extractorVersion: EXTRACTOR_VERSION, _inputFingerprint: state.want, _inputs: inputs, ...body };
    writeFileSync(join(CACHE, state.layer.file), JSON.stringify(out, null, 2) + "\n");
    built.push(state.layer.name);
  }
  return built;
}

if (MODE === "verify") {
  // TRUTH-03's property, applied to the cache itself: two consecutive builds from unchanged inputs
  // must be byte-identical. If they are not, something in here is reading a clock or a set order.
  rmSync(CACHE, { recursive: true, force: true });
  build(true);
  const first = Object.fromEntries(readdirSync(CACHE).map((n) => [n, sha(readFileSync(join(CACHE, n)))]));
  rmSync(CACHE, { recursive: true, force: true });
  build(true);
  const second = Object.fromEntries(readdirSync(CACHE).map((n) => [n, sha(readFileSync(join(CACHE, n)))]));
  const differing = Object.keys(first).filter((n) => first[n] !== second[n]);
  for (const n of differing) console.error(`UNSTABLE ${n}: ${first[n]} then ${second[n]}`);
  console.log(differing.length
    ? `pedagogy-v3 cache: ${differing.length} layer(s) are NOT byte-stable across rebuilds.`
    : `pedagogy-v3 cache: all ${Object.keys(first).length} layers byte-identical across two clean rebuilds.`);
  process.exit(differing.length ? 1 : 0);
}

const built = build(MODE === "force");
const totals = {};
for (const layer of LAYERS) {
  const path = join(CACHE, layer.file);
  if (!existsSync(path)) continue;
  totals[layer.name] = `${(statSync(path).size / 1024).toFixed(0)} kB`;
}
console.log(`pedagogy-v3 cache @ ${posix(relative(ROOT, CACHE))}`);
console.log(built.length ? `  rebuilt: ${built.join(", ")}` : "  all layers current, nothing rebuilt");
for (const [name, size] of Object.entries(totals)) console.log(`  ${name.padEnd(18)} ${size.padStart(8)}`);
const graph = join(CACHE, "curriculum-graph.json");
if (existsSync(graph)) {
  const t = JSON.parse(readFileSync(graph, "utf8")).totals;
  console.log(`  ${t.courses} courses · ${t.lessons} lessons · ${t.steps} steps · ${t.conceptTags} concept tags`
    + ` (${t.singleCourseTags} single-course) · ${t.withVariant} with a variant · ${t.withPredict} with a prediction`);
}
