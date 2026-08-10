const fs=require('fs'),assert=require('assert'),ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
function loadRoutes(){
 let src=fs.readFileSync('src/lib/variants.test.ts','utf8');
 src=src.slice(0,src.indexOf('const NEGATION'));
 src=src.replace(/^import .*;\s*$/gm,'');
 src+='\nmodule.exports={INDEPENDENT};\n';
 const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 const mod={exports:{}};new Function('module','exports','require','__filename','__dirname',js)(mod,mod.exports,require,'src/lib/variants.test.ts','src/lib');
 return mod.exports.INDEPENDENT;
}
const R=loadRoutes();
const forms=[
 ['decimal-representation','tenthsFraction'],['decimal-representation','unitCount'],['order-decimals','tenthsOrder'],['decimal-representation','moneyTenths'],
 ['decimal-representation','rungCount'],['decimal-place-value','placeDigitMcq'],['decimal-representation','moneyHundredths'],['decimal-place-value','placeDigitNumeric'],
 ['decimal-place-value','readSimple'],['decimal-representation','expandedBuild'],['decimal-representation','expandedDecimal'],['decimal-representation','missingExpandedDigit'],
 ['decimal-representation','wordBuildSimple'],['decimal-representation','wordToDecimal'],['decimal-representation','wordBuildMixed'],['place-compare','decimalTie'],
 ['place-compare','decimalMixed'],['place-compare','decidingPlace'],['place-compare','decimalClose'],['decimal-representation','trailingEquivalent'],
 ['decimal-representation','leadingZeroCompare'],['decimal-representation','trailingMatchCount'],['round-place','contextWhole'],['round-place','contextTenth'],['round-place','deciderMcq'],
];
assert.equal(forms.length,25);
let checks=0;
for(const [gen,form] of forms){const route=R[`${gen}@${form}`]||R[gen];assert.equal(typeof route,'function',`missing route ${gen}@${form}`);for(const band of ['support','core','stretch'])for(let i=0;i<200;i++){
 const v=V.variantForGenForm(gen,form,`session76-route:${gen}:${form}:${band}:${i}`,band),w=v.widget;
 const input=w.type==='mcq'?w.prompt+'||'+w.options.map(o=>o.label).join(';;'):w.prompt;
 const got=route(input);
 if(w.type==='mcq'){const good=w.options.filter(o=>o.correct);assert.equal(good.length,1);assert.equal(got,good[0].label,`${gen}@${form}/${band}/${i}`);}
 else if(w.type==='buildExpression'){const by=new Map(w.tokens.map(t=>[t.id,t.label]));assert.deepStrictEqual(got,w.correct.map(id=>by.get(id)),`${gen}@${form}/${band}/${i}`);}
 else assert.deepStrictEqual(got,v.answer,`${gen}@${form}/${band}/${i}`);
 checks++;
}}
console.log(JSON.stringify({forms:forms.length,checks,status:'PASS'}));
