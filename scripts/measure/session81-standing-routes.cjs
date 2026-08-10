const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
function loadRoutes(){let src=fs.readFileSync('src/lib/variants.test.ts','utf8');src=src.slice(0,src.indexOf('const NEGATION'));src=src.replace(/^import .*;\s*$/gm,'');src+='\nmodule.exports={INDEPENDENT};\n';const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;const mod={exports:{}};new Function('module','exports','require','__filename','__dirname',js)(mod,mod.exports,require,'src/lib/variants.test.ts','src/lib');return mod.exports.INDEPENDENT;}
const R=loadRoutes();
const forms=[
['unit-frac-divide','sameDenomCount'],['unit-frac-divide','divisionMagnitude'],['unit-frac-divide','properPieces'],['unit-frac-divide','divideFractionWhole'],['unit-frac-divide','divideFractionNumerator'],['unit-frac-divide','flipDivisor'],['unit-frac-divide','mixedDivide'],['unit-frac-divide','mixedScoops'],
['long-div-2digit','fullDivide'],['long-div-2digit','quotRemainder'],['long-div-2digit','invalidRemainder'],['decimal-align-addsub','bareAdd'],['decimal-align-addsub','padSub'],['decimal-align-addsub','threeAdd'],
['lcm-pair','gcfPair'],['lcm-pair','relativelyPrime'],['lcm-pair','gcfContext'],['lcm-pair','gcfThree'],['distributive','factorMissing'],['distributive','factorError'],['distributive','factorGcf'],['distributive','factorEvaluate'],
['negative-intro','compareNegatives'],['negative-intro','colderNegatives'],['negative-intro','compareMixedSign'],['negative-intro','orderSignedFour'],['negative-intro','absoluteNumeric'],['negative-intro','absoluteEqual'],['negative-intro','absoluteDifference'],['negative-intro','fartherAbsolute'],['negative-intro','debtAbsolute'],['negative-intro','coldestSigned'],['negative-intro','deeperSigned'],['negative-intro','compareNegativeFractions'],['negative-intro','compareNegativeMixed'],['negative-intro','compareFractionDecimal'],['negative-intro','orderRationalsFive'],
['coordinate-plot','signedQuadrant'],['coordinate-plot','axisLocation'],['coordinate-plot','reflectXAxis'],
];
let checks=0;
for(const [gen,form] of forms){const route=R[`${gen}@${form}`]||R[gen];assert.equal(typeof route,'function',`missing route ${gen}@${form}`);for(const band of ['support','core','stretch'])for(let i=0;i<300;i++){
 const v=V.variantForGenForm(gen,form,`session81-route:${gen}:${form}:${band}:${i}`,band),w=v.widget;assert(v);
 let input=w.prompt;
 if(w.type==='mcq')input+='||'+w.options.map(o=>o.label).join(';;');
 else if(w.type==='dragOrder')input+='||'+w.items.map(i=>i.label).join(',');
 else if(w.type==='absValueLine')input+='||'+w.items.map(i=>`${i.label}=${i.value}`).join(';;');
 const got=route(input);
 if(w.type==='mcq'){const good=w.options.filter(o=>o.correct);assert.equal(good.length,1);assert.equal(got,good[0].label,`${gen}@${form}/${band}/${i}: ${got} != ${good[0].label}`);}
 else if(w.type==='dragOrder'){const labels=Object.fromEntries(w.items.map(i=>[i.id,i.label]));assert.deepStrictEqual(got,w.correctOrder.map(id=>labels[id]),`${gen}@${form}/${band}/${i}`);}
 else if(w.type==='absValueLine'){const label=w.answerId==='equal'?w.equalLabel:w.items.find(i=>i.id===w.answerId).label;assert.equal(got,label,`${gen}@${form}/${band}/${i}`);}
 else assert.deepStrictEqual(got,v.answer,`${gen}@${form}/${band}/${i}: ${JSON.stringify(got)} != ${JSON.stringify(v.answer)}`);
 checks++;
}}
console.log(JSON.stringify({forms:forms.length,checks,status:'PASS'}));
