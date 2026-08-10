/*
 * Historical S151 integration loader for the CURRENT evaluator.
 *
 * S151 originally hard-coded evaluate.ts's then-two runtime dependencies. That became stale when
 * evaluate.ts gained exact MMIP models (notably numberLineRay in S215), causing the audit to crash
 * before testing anything. This loader transpiles trusted local TS modules recursively, while still
 * using S151's zod-free schema loader at the schema boundary. It therefore runs the real current
 * model code instead of replacing new engines with behavioural stubs.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const cp = require("child_process");

let ts;
for (const candidate of [
  "typescript",
  path.join(cp.execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "typescript")
]) {
  try { ts = require(candidate); break; } catch {}
}
if (!ts) throw new Error("TypeScript compiler unavailable");

const root = path.resolve(__dirname, "../..");
const schemaPath = path.join(root, "src/lib/schema.ts");
const schema = require("./load-schema-runtime-s151.cjs");
const cache = new Map([[schemaPath, { exports: schema }]]);

function resolveLocal(fromFile, id) {
  const base = path.resolve(path.dirname(fromFile), id);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`cannot resolve ${id} from ${path.relative(root, fromFile)}`);
}

function loadTs(absFile) {
  absFile = path.resolve(absFile);
  if (absFile === schemaPath) return schema;
  const cached = cache.get(absFile);
  if (cached) return cached.exports;

  const source = fs.readFileSync(absFile, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    },
    fileName: absFile
  }).outputText;
  const mod = { exports: {} };
  cache.set(absFile, mod); // cycle-safe before evaluation
  const localRequire = (id) => {
    if (id === "zod") throw new Error(`unexpected runtime zod import from ${path.relative(root, absFile)}`);
    if (!id.startsWith(".")) throw new Error(`unsupported external require ${id} from ${path.relative(root, absFile)}`);
    return loadTs(resolveLocal(absFile, id));
  };
  const sandbox = {
    module: mod,
    exports: mod.exports,
    require: localRequire,
    console,
    process,
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    structuredClone: global.structuredClone
  };
  vm.runInNewContext(js, sandbox, { filename: path.relative(root, absFile) + ".cjs" });
  return mod.exports;
}

module.exports = loadTs(path.join(root, "src/lib/evaluate.ts"));
