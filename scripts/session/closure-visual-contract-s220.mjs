import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const specPath = resolve(here, "closure-visual-matrix-s220.spec.json");
const runnerPath = resolve(here, "closure-visual-matrix-s220.cjs");
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const runner = readFileSync(runnerPath, "utf8");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const errors = [];
const assert = (ok, message) => { if (!ok) errors.push(message); };

assert(spec.schemaVersion === 1, "matrix schemaVersion must be 1");
assert(spec.session === 220, "matrix session must be 220");
assert(JSON.stringify(spec.themes) === JSON.stringify(["light", "dark"]), "themes must be exactly light,dark");
assert(
  JSON.stringify(spec.viewports.map(({ width, height }) => [width, height])) ===
    JSON.stringify([[390, 844], [768, 1024], [1440, 900]]),
  "viewports must be exactly 390x844, 768x1024, 1440x900"
);

const required = new Map([
  ["home", "/"],
  ["onboarding", "/onboarding"],
  ["placement", "/placement"],
  ["dashboard", "/dashboard"],
  ["catalog", "/courses"],
  ["course", "/courses/add-subtract-100"],
  ["trailhead", "/trailhead"],
  ["atlas", "/atlas"],
  ["lesson", "/learn/as100-01-01"],
  ["lesson-completion", "/learn/as100-01-01"],
  ["profile", "/profile"],
  ["family", "/family"],
  ["teach", "/teach"],
  ["premium", "/premium"],
  ["account", "/account"]
]);
const actual = new Map(spec.surfaces.map((s) => [s.id, s.path]));
for (const [id, path] of required) assert(actual.get(id) === path, `missing/wrong required surface ${id} → ${path}`);
assert(actual.size === required.size, `unexpected surface count: ${actual.size}; expected ${required.size}`);
assert(spec.surfaces.find((s) => s.id === "lesson")?.scenario === "lesson-start", "lesson scenario must be lesson-start");
assert(spec.surfaces.find((s) => s.id === "lesson-completion")?.scenario === "lesson-completion", "completion scenario missing");
assert(spec.manualGates.some((s) => s.includes("200% real browser zoom")), "200% real-browser zoom must remain an explicit manual gate");
assert(spec.manualGates.some((s) => s.includes("real-device touch")), "real-device touch must remain an explicit manual gate");

for (const needle of [
  'require("playwright-core")',
  'reducedMotion: "reduce"',
  'page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" })',
  'hOverflow',
  'smallTargetCount24',
  'keyboardProbe',
  'captureSettledMs',
  'realBrowserZoom200Automated: false',
  'manifest.json',
  'process.exitCode = 1'
]) {
  assert(runner.includes(needle), `runner contract missing: ${needle}`);
}
assert(
  pkg.scripts?.["verify:closure-visual"] === "node scripts/session/closure-visual-matrix-s220.cjs",
  "package.json must expose verify:closure-visual"
);

if (errors.length) {
  console.error("CLOSURE_VISUAL_CONTRACT_FAIL");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log(`CLOSURE_VISUAL_CONTRACT_PASS:${spec.surfaces.length} surfaces × ${spec.viewports.length} viewports × ${spec.themes.length} themes = ${spec.surfaces.length * spec.viewports.length * spec.themes.length} captures`);
console.log(`MANUAL_GATES:${spec.manualGates.length} (including real 200% browser zoom and real-device touch)`);
