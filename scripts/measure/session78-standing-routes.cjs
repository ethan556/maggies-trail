const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
function loadRoutes(){let src=fs.readFileSync('src/lib/variants.test.ts','utf8');src=src.slice(0,src.indexOf('const NEGATION'));src=src.replace(/^import .*;\s*$/gm,'');src+='\nmodule.exports={INDEPENDENT};\n';const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;const mod={exports:{}};new Function('module','exports','require','__filename','__dirname',js)(mod,mod.exports,require,'src/lib/variants.test.ts','src/lib');return mod.exports.INDEPENDENT;}
const R=loadRoutes();
const forms=[
['metric-convert','metricMcq'],['metric-convert','customary'],['metric-convert','customaryMcq'],
['line-plot','fractionMode'],['line-plot','fractionTotal'],['line-plot','fractionRange'],['line-plot','atOrAbove'],['line-plot','quarterNumerator'],
['box-volume','unitCubes'],['box-volume','singleLayer'],['box-volume','stackedCubes'],['box-volume','layers'],['box-volume','layersMcq'],['box-volume','dimensionsMcq'],['box-volume','volumeFormula'],['box-volume','composite'],['box-volume','compositeMcq'],['box-volume','default'],
];
assert.equal(forms.length,18);let checks=0;
for(const [gen,form] of forms){const route=R[`${gen}@${form}`]||R[gen];assert.equal(typeof route,'function',`missing route ${gen}@${form}`);for(const band of ['support','core','stretch'])for(let i=0;i<240;i++){const v=V.variantForGenForm(gen,form,`session78-route:${gen}:${form}:${band}:${i}`,band),w=v.widget;const input=w.type==='mcq'?w.prompt+'||'+w.options.map(o=>o.label).join(';;'):w.prompt;const got=route(input);if(w.type==='mcq'){const good=w.options.filter(o=>o.correct);assert.equal(good.length,1);assert.equal(got,good[0].label,`${gen}@${form}/${band}/${i}`);}else assert.deepStrictEqual(got,v.answer,`${gen}@${form}/${band}/${i}`);checks++;}}
console.log(JSON.stringify({forms:forms.length,checks,status:'PASS'}));
