#!/usr/bin/env node
/**
 * Dependency-free repository integrity gate.
 *
 * This intentionally covers contracts that can be checked in a clean archive
 * before npm packages are available: JSON validity, local import resolution,
 * internal route/asset links, bounded API parsing, button semantics, and
 * host-portable source paths. Package-backed type, schema, pedagogy, unit,
 * browser, and build gates remain separate and must still run before release.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..");
const failures = [];
const counts = { json: 0, source: 0, imports: 0, links: 0, assets: 0, buttons: 0, apiRoutes: 0 };

const walk = (dir, accept = () => true) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "coverage", "test-results", "playwright-report", ".cowork-cache", ".chatgpt-work-cache"].includes(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) out.push(...walk(path, accept));
    else if (accept(path)) out.push(path);
  }
  return out;
};

const report = (path, message) => failures.push(`${relative(root, path)}: ${message}`);

// 0. Source releases must not contain dependency trees, compiler caches, or
// generated build/test output. These files are host-specific and can hide stale
// code or make a clean install behave differently from the audited tree.
for (const name of ["node_modules", ".next", ".cml-build", "coverage", "test-results", "playwright-report", ".turbo", ".cowork-cache", ".chatgpt-work-cache"]) {
  const path = join(root, name);
  if (existsSync(path)) report(path, "generated dependency/build artifact must be excluded from source releases");
}
for (const path of walk(root, (p) => p.endsWith(".tsbuildinfo") || p.endsWith(".log") || p.endsWith(".tmp"))) {
  report(path, "generated compiler/log/temp artifact must be excluded from source releases");
}

// 1. Every repository JSON document must parse.
for (const path of walk(root, (p) => extname(p) === ".json" && !p.endsWith("tsconfig.tsbuildinfo"))) {
  counts.json++;
  try {
    JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    report(path, `invalid JSON (${error instanceof Error ? error.message : String(error)})`);
  }
}

const sourceExts = new Set([".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx", ".py"]);
const source = walk(root, (p) => sourceExts.has(extname(p)));
counts.source = source.length;

// Generated JavaScript must never sit beside its TypeScript source. Framework
// resolvers can select either extension, so a stale emitted file may shadow the
// canonical source or create duplicate App Router entries.
const emittedSiblingPairs = [
  [".jsx", ".tsx"],
  [".js", ".ts"],
  [".mjs", ".mts"],
  [".cjs", ".cts"]
];
for (const path of source) {
  for (const [emittedExt, sourceExt] of emittedSiblingPairs) {
    if (!path.endsWith(emittedExt)) continue;
    const canonical = path.slice(0, -emittedExt.length) + sourceExt;
    if (existsSync(canonical)) report(path, `generated ${emittedExt} duplicates canonical ${sourceExt} source`);
  }
}

const isTest = (p) => /(?:\.test\.|\.spec\.|__tests__)/.test(p);
const resolveLocal = (from, spec) => {
  const cleanSpec = spec.split(/[?#]/, 1)[0];
  const base = cleanSpec.startsWith("@/") ? join(root, "src", cleanSpec.slice(2)) : resolve(from, "..", cleanSpec);
  const candidates = [
    base,
    ...[".ts", ".tsx", ".mts", ".mjs", ".js", ".jsx", ".json", ".css"].map((x) => base + x),
    ...["index.ts", "index.tsx", "index.mts", "index.mjs", "index.js", "index.jsx", "index.json"].map((x) => join(base, x))
  ];
  return candidates.some(existsSync);
};

// 2. Source must be portable and every relative/@ import must resolve.
const importPattern = /(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\()\s*["']([^"']+)["']/g;
for (const path of source) {
  const text = readFileSync(path, "utf8");
  if (/\/(?:home\/(?:claude|oai)|mnt\/data)\//.test(text)) report(path, "contains a host-specific absolute workspace path");
  for (const match of text.matchAll(importPattern)) {
    const spec = match[1];
    if (!(spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("@/"))) continue;
    counts.imports++;
    if (!resolveLocal(path, spec)) report(path, `unresolved local import ${JSON.stringify(spec)}`);
  }
}

// 3. Build a static route set and reject broken literal internal links/assets.
const appRoot = join(root, "src", "app");
/* S242 / TOOL-01 — `walk` returns paths built with `join`, so on Windows they are separated by
 * backslashes and this filter's `(?:^|\/)` never matched: `routePages` came back EMPTY, the static
 * route set held only "/", and every internal link in the app was reported as pointing at a missing
 * route. That is the 48 phantom findings. Normalise the separator before any regex that assumes a
 * POSIX path — the regexes are the portable part; the paths are not. */
const posix = (p) => p.split(sep).join("/");
const routePages = walk(appRoot, (p) => /(?:^|\/)page\.tsx$/.test(posix(p)));
const staticRoutes = new Set();
for (const page of routePages) {
  const bits = relative(appRoot, page).split(sep).slice(0, -1).filter((b) => !/^\(.+\)$/.test(b));
  if (bits.some((b) => /^\[.+\]$/.test(b))) continue;
  staticRoutes.add("/" + bits.join("/"));
}
staticRoutes.add("/");

const literalHref = /\bhref\s*=\s*["'](\/[^"'#?]*)["']/g;
const literalSrc = /\bsrc\s*=\s*["'](\/[^"'#?]*)["']/g;
for (const path of source.filter((p) => [".tsx", ".jsx", ".ts", ".js"].includes(extname(p)))) {
  const text = readFileSync(path, "utf8");
  for (const m of text.matchAll(literalHref)) {
    const href = m[1].replace(/\/$/, "") || "/";
    if (href.startsWith("/api/")) continue;
    counts.links++;
    const publicPath = join(root, "public", href.slice(1));
    if (!staticRoutes.has(href) && !existsSync(publicPath)) report(path, `literal internal link has no static route or public target: ${href}`);
  }
  for (const m of text.matchAll(literalSrc)) {
    const src = m[1];
    if (src.startsWith("/api/")) continue;
    counts.assets++;
    if (!existsSync(join(root, "public", src.slice(1)))) report(path, `literal asset does not exist: ${src}`);
  }
}

// 4. API requests must use the bounded readJson helper, never raw req.json().
const apiRoutes = walk(join(appRoot, "api"), (p) => p.endsWith("route.ts"));
counts.apiRoutes = apiRoutes.length;
for (const path of apiRoutes) {
  const text = readFileSync(path, "utf8");
  if (/\b(?:req|request)\.json\s*\(/.test(text)) report(path, "uses an unbounded request.json() parser; use readJson()");
}

// 5. Native buttons need an explicit type so nesting in a form cannot submit it.
for (const path of source.filter((p) => p.endsWith(".tsx") && !isTest(p))) {
  const text = readFileSync(path, "utf8");
  const withoutComments = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
  for (const m of withoutComments.matchAll(/<button\b[\s\S]*?>/g)) {
    counts.buttons++;
    if (!/\btype\s*=/.test(m[0])) report(path, "native <button> is missing an explicit type");
  }
}

// 6. The canonical registration consistency checker is also dependency-free.
try {
  execFileSync(process.execPath, [join(root, "scripts", "check-registration.mjs")], { cwd: root, stdio: "pipe" });
} catch (error) {
  const stderr = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : String(error);
  failures.push(`scripts/check-registration.mjs failed: ${stderr.trim()}`);
}

if (failures.length) {
  console.error(`Native integrity failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Native integrity passed: ${counts.json} JSON files, ${counts.source} source files, ` +
    `${counts.imports} local imports, ${counts.links} internal links, ${counts.assets} assets, ` +
    `${counts.buttons} buttons, ${counts.apiRoutes} API routes.`
);
