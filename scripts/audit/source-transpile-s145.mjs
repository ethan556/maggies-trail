#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
const root=resolve(import.meta.dirname,"../..");
const require=createRequire(import.meta.url);
let ts;
try { ts=require("typescript"); } catch {}
if (!ts) {
  try {
    const npmCommand=process.platform==="win32"?"npm.cmd":"npm";
    ts=require(join(execFileSync(npmCommand,["root","-g"],{encoding:"utf8"}).trim(),"typescript"));
  } catch {}
}
if(!ts) throw new Error("TypeScript compiler unavailable for dependency-free source transpilation");
const files=[
  "src/lib/schema.ts","src/lib/evaluate.ts","src/lib/describeState.ts","src/lib/pedagogy.ts",
  "src/components/widgets.tsx","src/components/stageWidth.ts","src/components/widgetSamples.ts",
  "src/lib/variants.ts","src/lib/cml/catalog.ts","src/lib/cml/kernels.ts","src/lib/cml/mesh.ts",
  "src/lib/masteryMission.server.ts","src/lib/variants.test.ts","src/lib/session143.graph-story.test.ts",
  "src/components/widgets.graphStory.s143.test.tsx",
  "src/lib/session144.proportional-reasoning.test.ts",
  "src/components/widgets.proportionalReasoning.s144.test.tsx",
  "src/lib/session145.place-value-transform.test.ts",
  "src/components/widgets.placeValueTransform.s145.test.tsx"
];
const diagnostics=[]; const records=[];
for(const path of files){
  if(!existsSync(join(root,path))) { diagnostics.push(`${path}: missing`); continue; }
  const source=readFileSync(join(root,path),"utf8");
  const result=ts.transpileModule(source,{fileName:path,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,isolatedModules:true}});
  const ds=(result.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  for(const d of ds) diagnostics.push(`${path}:${d.start??0}: ${ts.flattenDiagnosticMessageText(d.messageText," ")}`);
  records.push({path,sourceSha256:createHash("sha256").update(source).digest("hex"),emittedBytes:Buffer.byteLength(result.outputText),errors:ds.length});
}
const report={session:145,scope:"dependency-free syntax/transpilation only; not a substitute for tsc --noEmit",typescriptVersion:ts.version,files:records.length,errors:diagnostics.length,records,diagnostics,passed:diagnostics.length===0};
writeFileSync(join(root,"SOURCE_TRANSPILE_S145.json"),JSON.stringify(report,null,2)+"\n");
writeFileSync(join(root,"SOURCE_TRANSPILE_S145.md"),`# Session 145 source transpilation\n\n- Compiler: TypeScript ${ts.version}\n- Files: ${records.length}\n- Syntax/transpile errors: ${diagnostics.length}\n- Result: **${report.passed?"PASS":"FAIL"}**\n\nThis is a dependency-free syntax/transpilation gate, not a dependency-backed typecheck.\n`);
if(!report.passed){diagnostics.forEach(x=>console.error(x));process.exit(1)}
console.log(`source transpilation S145 passed: ${records.length}/${files.length} files; TypeScript ${ts.version}`);
