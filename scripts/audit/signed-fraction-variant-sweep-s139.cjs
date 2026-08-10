#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const child = require("node:child_process");
const os = require("node:os");
const root = path.resolve(__dirname, "../..");
function loadTs() {
  const candidates = [
    path.join(root, "node_modules/typescript/lib/typescript.js"),
    "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js",
    "/opt/nvm/versions/node/v22.22.2/lib/node_modules/typescript/lib/typescript.js",
    "/usr/local/slides_js/node_modules/typescript/lib/typescript.js"
  ];
  try { candidates.unshift(path.join(child.execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "typescript/lib/typescript.js")); } catch {}
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error("TypeScript runtime unavailable for executable variant sweep");
  return require(found);
}
const ts = loadTs();
const srcRoot = path.join(root, "src/lib");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "s139-variants-"));
try {
  const queue = ["variants.ts"], seen = new Set();
  while (queue.length) {
    const rel = queue.shift();
    if (seen.has(rel)) continue;
    seen.add(rel);
    const sourcePath = path.join(srcRoot, rel);
    const text = fs.readFileSync(sourcePath, "utf8");
    const js = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
    const destination = path.join(out, rel.replace(/\.tsx?$/, ".js"));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, js);
    const re = /require\(["']\.\/(.+?)["']\)/g;
    let match;
    while ((match = re.exec(js))) {
      const dep = match[1];
      if (dep === "schema") {
        fs.writeFileSync(path.join(out, "schema.js"), "const round=v=>Math.round(v*1e12)/1e12;exports.proportionalReasoningTruth=()=>({answerNumber:0,answerClaim:'stub',stages:[]});exports.placeValueTransformTruth=()=>({answerNumber:0,answerClaim:'stub',stages:[]});");
        continue;
      }
      if (dep.endsWith(".json")) {
        const jsonSource = path.join(srcRoot, dep);
        if (!fs.existsSync(jsonSource)) throw new Error(`${rel}: unresolved JSON ${dep}`);
        const jsonDest = path.join(out, dep);
        fs.mkdirSync(path.dirname(jsonDest), { recursive: true });
        fs.copyFileSync(jsonSource, jsonDest);
        continue;
      }
      const options = [`${dep}.ts`, `${dep}.tsx`, path.join(dep, "index.ts")];
      const found = options.find((candidate) => fs.existsSync(path.join(srcRoot, candidate)));
      if (!found) throw new Error(`${rel}: unresolved local dependency ${dep}`);
      queue.push(found);
    }
  }
  const variants = require(path.join(out, "variants.js"));
  const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
  const truth = (w) => { const rawNum = w.operation === "multiply" ? w.left.num * w.right.num : w.left.num * w.right.den; const rawDen = w.operation === "multiply" ? w.left.den * w.right.den : w.left.den * w.right.num; const g = gcd(rawNum, rawDen); return { sign: w.left.sign * w.right.sign, num: rawNum / g, den: rawDen / g }; };
  const equivalent = (c, t) => c.sign === t.sign && c.num * t.den === t.num * c.den;
  const gradesCorrect = (c, t, w) => equivalent(c, t) && (w.form === "any" || (c.num === t.num && c.den === t.den));
  const forms = ["default", "mulDiff", "divSame", "divDiff"];
  const bands = ["support", "core", "stretch"];
  const counts = { total: 0, forms: {}, operations: { multiply: 0, divide: 0 }, signs: { positive: 0, negative: 0 } };
  for (const form of forms) {
    counts.forms[form] = 0;
    for (const band of bands) for (let seed = 0; seed < 384; seed += 1) {
      const result = variants.variantForGenForm("frac-sign-ops", form, `s139-${seed}`, band);
      if (!result || result.widget.type !== "signedFractionLab") throw new Error(`${form}/${band}/${seed}: causal surface lost`);
      const w = result.widget, t = truth(w);
      const correct = w.choices.filter((choice) => gradesCorrect(choice, t, w));
      if (correct.length !== 1 || correct[0].path !== "correct") throw new Error(`${form}/${band}/${seed}: expected one correct claim`);
      if (new Set(w.choices.map((c) => c.id)).size !== w.choices.length || new Set(w.choices.map((c) => c.label)).size !== w.choices.length) throw new Error(`${form}/${band}/${seed}: duplicate choice`);
      for (const choice of w.choices.filter((c) => c.path !== "correct")) if (gradesCorrect(choice, t, w)) throw new Error(`${form}/${band}/${seed}: wrong path grades correct`);
      const sign = w.choices.find((c) => c.path === "wrongSign");
      if (!sign || sign.sign !== -t.sign || sign.num * t.den !== t.num * sign.den) throw new Error(`${form}/${band}/${seed}: wrong-sign trap drifted`);
      if (w.operation === "divide") {
        const kept = w.choices.find((c) => c.path === "keptDivisor");
        const rawNum = w.left.num * w.right.num, rawDen = w.left.den * w.right.den;
        if (!kept || kept.sign !== t.sign || kept.num * rawDen !== rawNum * kept.den) throw new Error(`${form}/${band}/${seed}: kept-divisor trap drifted`);
      }
      if (w.form === "lowestTerms") {
        const unreduced = w.choices.find((c) => c.path === "unreduced");
        if (!unreduced || !equivalent(unreduced, t) || gcd(unreduced.num, unreduced.den) === 1) throw new Error(`${form}/${band}/${seed}: unreduced trap drifted`);
      }
      if (result.answer.sign !== t.sign || result.answer.num * t.den !== t.num * result.answer.den) throw new Error(`${form}/${band}/${seed}: variant answer mismatch`);
      counts.total += 1; counts.forms[form] += 1; counts.operations[w.operation] += 1; counts.signs[t.sign > 0 ? "positive" : "negative"] += 1;
    }
  }
  const variantsSource = fs.readFileSync(path.join(srcRoot, "variants.ts"), "utf8");
  const start = variantsSource.indexOf('tag: "frac-sign-ops"');
  const end = variantsSource.indexOf('tag: "decimal-place-value"', start);
  if (start < 0 || end < 0) throw new Error("cannot isolate frac-sign-ops generator source");
  const sourceHash = crypto.createHash("sha256").update(variantsSource.slice(start, end)).digest("hex");
  const report = { session: 139, generator: "frac-sign-ops", sourceHash, transpiledSourceFiles: seen.size, seedsPerBandForm: 384, bands, ...counts };
  fs.writeFileSync(path.join(root, "SIGNED_FRACTION_VARIANT_SWEEP_S139.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`signed-fraction variant sweep: ${counts.total}/${counts.total}; ${counts.operations.multiply} multiply, ${counts.operations.divide} divide`);
} finally { fs.rmSync(out, { recursive: true, force: true }); }
