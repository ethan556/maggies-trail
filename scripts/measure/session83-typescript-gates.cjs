const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const root=path.resolve(__dirname,'../..');
let jsonFiles=0,tsFiles=0;const syntaxDiagnostics=[];
function walk(dir,fn){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.next'||e.name==='.git')continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p,fn);else fn(p);}}
walk(root,p=>{if(p.endsWith('.json')){JSON.parse(fs.readFileSync(p,'utf8'));jsonFiles++;}});
for(const rel of ['src','scripts'])walk(path.join(root,rel),p=>{if(!/\.(ts|tsx|mts)$/.test(p))return;tsFiles++;const text=fs.readFileSync(p,'utf8');const out=ts.transpileModule(text,{fileName:p,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve,isolatedModules:true}});for(const d of out.diagnostics||[])if(d.category===ts.DiagnosticCategory.Error)syntaxDiagnostics.push({file:path.relative(root,p),message:ts.flattenDiagnosticMessageText(d.messageText,'\n')});});
assert.deepStrictEqual(syntaxDiagnostics,[],`syntax diagnostics: ${JSON.stringify(syntaxDiagnostics.slice(0,20))}`);
// Strict semantic compile of variants.ts. Keep numeric and MCQ exact; enumerate all other widget
// discriminants so they cannot accidentally absorb an invalid numeric/MCQ object.
const schema=fs.readFileSync(path.join(root,'src/lib/schema.ts'),'utf8');
const literals=[...schema.matchAll(/type:\s*z\.literal\("([A-Za-z0-9_]+)"\)/g)].map(m=>m[1]);
const others=[...new Set(literals)].filter(x=>x!=='numeric'&&x!=='mcq').sort();
const lite=`export type Band = "support" | "core" | "stretch";\n`+
`export type NumericWidget={type:"numeric";prompt:string;answer:number;tolerance:number;unit?:string;commonErrors:Array<{value:number;feedback:string}>;fallbackFeedback:string;successFeedback?:string};\n`+
`export type McqWidget={type:"mcq";prompt:string;options:Array<{id:string;label:string;correct:boolean;feedback:string}>};\n`+
`export type OtherWidget=${others.map(t=>`({type:${JSON.stringify(t)}} & Record<string, unknown>)`).join('|')};\n`+
`export type TWidget=NumericWidget|McqWidget|OtherWidget;\n`;
const tempTypes=path.join(root,'src/lib/.session83-types.d.ts');
const tempVariants=path.join(root,'src/lib/.session83-variants-semantic.ts');
let variants=fs.readFileSync(path.join(root,'src/lib/variants.ts'),'utf8');
variants=variants.replace('import type { TWidget } from "./schema";','import type { TWidget, Band } from "./.session83-types";');
variants=variants.replace('import type { Band } from "./difficulty";','');
fs.writeFileSync(tempTypes,lite);fs.writeFileSync(tempVariants,variants);
try{
 const options={target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,strict:true,noEmit:true,skipLibCheck:true,lib:['lib.es2022.d.ts','lib.dom.d.ts'],types:[]};
 const program=ts.createProgram([tempVariants],options);const diagnostics=ts.getPreEmitDiagnostics(program).filter(d=>d.category===ts.DiagnosticCategory.Error);
 if(diagnostics.length){const pretty=diagnostics.slice(0,30).map(d=>{const pos=d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start):null;return `${d.file?path.relative(root,d.file.fileName):''}${pos?`:${pos.line+1}:${pos.character+1}`:''} ${ts.flattenDiagnosticMessageText(d.messageText,'\n')}`;});throw new Error(`semantic diagnostics (${diagnostics.length}):\n${pretty.join('\n')}`);}
} finally {for(const p of [tempTypes,tempVariants])if(fs.existsSync(p))fs.unlinkSync(p);}
console.log(JSON.stringify({jsonFiles,typescriptFamilyFiles:tsFiles,syntaxDiagnostics:0,variantsSemanticDiagnostics:0,widgetDiscriminants:others.length+2,status:'PASS'}));
