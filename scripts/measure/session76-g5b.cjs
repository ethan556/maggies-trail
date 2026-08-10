const fs = require('fs');
const assert = require('assert');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText, f);
const V = require('../../src/lib/variants.ts');

const targets = [
  ['dpv-01-01','k1','decimal-representation','tenthsFraction','mcq'],
  ['dpv-01-01','k2','decimal-representation','unitCount','numeric'],
  ['dpv-01-01','k3','order-decimals','tenthsOrder','mcq'],
  ['dpv-01-01','ch1','decimal-representation','moneyTenths','numeric'],
  ['dpv-01-02','k1','decimal-representation','rungCount','numeric'],
  ['dpv-01-02','k2','decimal-place-value','placeDigitMcq','mcq'],
  ['dpv-01-02','k3','decimal-representation','rungCount','numeric'],
  ['dpv-01-02','ch1','decimal-representation','moneyHundredths','numeric'],
  ['dpv-02-01','k1','decimal-place-value','placeDigitNumeric','numeric'],
  ['dpv-02-01','k3','decimal-place-value','readSimple','mcq'],
  ['dpv-02-02','k1','decimal-representation','expandedBuild','buildExpression'],
  ['dpv-02-02','k2','decimal-representation','expandedDecimal','numeric'],
  ['dpv-02-02','k3','decimal-representation','missingExpandedDigit','numeric'],
  ['dpv-02-02','ch1','decimal-representation','expandedDecimal','numeric'],
  ['dpv-02-03','k1','decimal-representation','wordBuildSimple','buildExpression'],
  ['dpv-02-03','k2','decimal-representation','wordToDecimal','numeric'],
  ['dpv-02-03','k3','decimal-representation','wordBuildMixed','buildExpression'],
  ['dpv-02-03','ch1','decimal-representation','wordToDecimal','numeric'],
  ['dpv-03-01','k1','place-compare','decimalTie','placeCompare'],
  ['dpv-03-01','k2','place-compare','decimalMixed','placeCompare'],
  ['dpv-03-01','k3','place-compare','decidingPlace','mcq'],
  ['dpv-03-01','ch1','place-compare','decimalClose','placeCompare'],
  ['dpv-03-02','k1','decimal-representation','trailingEquivalent','mcq'],
  ['dpv-03-02','k2','place-compare','decimalMixed','placeCompare'],
  ['dpv-03-02','k3','decimal-representation','leadingZeroCompare','mcq'],
  ['dpv-03-02','ch1','decimal-representation','trailingMatchCount','numeric'],
  ['dpv-04-03','k1','round-place','contextWhole','numeric'],
  ['dpv-04-03','k2','round-place','contextTenth','numeric'],
  ['dpv-04-03','k3','round-place','deciderMcq','mcq'],
  ['dpv-04-03','ch1','round-place','contextTenth','numeric'],
];
assert.equal(targets.length, 30);

const DIGIT = ['zero','one','two','three','four','five','six','seven','eight','nine'];
const SMALL = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
function wordsValue(s){const n=0;let cur=0;for(const part of s.toLowerCase().replace(/-/g,' ').split(/\s+/)){if(part==='hundred')cur*=100;else cur+=SMALL[part]??0;}return n+cur;}
function labels(w){return w.options.map(o=>o.label)}
function correctLabel(w){const c=w.options.filter(o=>o.correct);assert.equal(c.length,1);return c[0].label}
function truth(gen, form, w){
  const p=w.prompt; let m;
  if(gen==='order-decimals'){
    const vals=[...p.matchAll(/0\.(\d)/g)].map(x=>Number(x[1]));
    return [...new Set(vals)].sort((a,b)=>a-b).map(d=>`0.${d}`).join(', ');
  }
  if(gen==='decimal-place-value'){
    m=p.match(/In 0\.(\d+), (?:what|which) digit is in the (tenths|hundredths|thousandths)/i);
    if(m){const at={tenths:0,hundredths:1,thousandths:2}[m[2].toLowerCase()]; const d=Number(m[1][at]);
      if(form==='placeDigitNumeric')return d;
      return `${d} — the ${['first','second','third'][at]} place after the point`;
    }
    m=p.match(/read 0\.(\d+) aloud/); const at=m[1].search(/[1-9]/), d=Number(m[1][at]); const word=DIGIT[d];
    return `${word[0].toUpperCase()+word.slice(1)} ${['tenths','hundredths','thousandths'][at]}`;
  }
  if(gen==='place-compare'){
    if(form==='decidingPlace'){
      m=p.match(/comparing (0\.\d+) and (0\.\d+)/); const a=m[1].split('.')[1],b=m[2].split('.')[1]; let i=0;while(a[i]===b[i])i++;
      return `The ${['tenths','hundredths','thousandths'][i]} place`;
    }
    m=p.match(/Compare: ([\d.]+) __ ([\d.]+)/); return Number(m[1])>Number(m[2])?'gt':Number(m[1])<Number(m[2])?'lt':'eq';
  }
  if(gen==='round-place'){
    if(form==='contextWhole'){const v=Number(p.match(/costs \$(\d+(?:\.\d+)?)/)[1]);return Math.floor((Math.round(v*100)+50)/100);}
    if(form==='contextTenth'){const v=Number(p.match(/ribbon is ([\d.]+) m/)[1]);return Math.floor((Math.round(v*100)+5)/10)/10;}
    m=p.match(/rounding (\d+)\.(\d)(\d)(\d) to the nearest (whole number|tenth|hundredth)/); const idx=m[5]==='whole number'?2:m[5]==='tenth'?3:4; const place=m[5]==='whole number'?'tenths':m[5]==='tenth'?'hundredths':'thousandths'; return `${m[idx]} — the ${place} digit`;
  }
  if(gen==='decimal-representation'){
    if(form==='tenthsFraction'){m=p.match(/0\.(\d)/);return `${m[1]}/10`;}
    if(form==='unitCount'){m=p.match(/(\d+) whole/);return Number(m[1])*10;}
    if(form==='moneyTenths'){m=p.match(/(\d+) dimes/);return Number(m[1]);}
    if(form==='rungCount'){m=p.match(/make (\d+) /);return Number(m[1])*10;}
    if(form==='moneyHundredths'){m=p.match(/(\d+) pennies/);return Number(m[1]);}
    if(form==='expandedBuild'){m=p.match(/0\.(\d)(\d)(\d)/);return [`0.${m[1]}`,'+',`0.0${m[2]}`,'+',`0.00${m[3]}`];}
    if(form==='expandedDecimal'){let t=0;for(const x of p.matchAll(/(\d+)\/(1000|100|10)/g))t+=Number(x[1])/Number(x[2]);return Math.round(t*1000)/1000;}
    if(form==='missingExpandedDigit'){m=p.match(/0\.(\d)(\d)(\d)/);return Number(m[2]);}
    if(form==='wordBuildSimple'){m=p.match(/0\.(\d+)/);const at=m[1].search(/[1-9]/),d=Number(m[1][at]);return [DIGIT[d],['tenths','hundredths','thousandths'][at]];}
    if(form==='wordBuildMixed'){m=p.match(/of (\d+)\.(\d)/);return [DIGIT[Number(m[1])],'and',DIGIT[Number(m[2])],'tenths'];}
    if(form==='wordToDecimal'){m=p.match(/[“"](.+?) (tenths|hundredths|thousandths)[”"]/);const den=m[2]==='tenths'?10:m[2]==='hundredths'?100:1000;return wordsValue(m[1])/den;}
    if(form==='trailingEquivalent')return 'All three are equal';
    if(form==='leadingZeroCompare'){m=p.match(/0\.(\d) and/);return `No — 0.0${m[1]} is ten times smaller`;}
    if(form==='trailingMatchCount')return 2;
  }
  throw new Error(`no route ${gen}@${form}: ${p}`);
}
function grade(w,input){
  if(w.type==='numeric'){const correct=Math.abs(Number(input)-w.answer)<=w.tolerance;if(correct)return {correct:true,feedback:w.successFeedback};const hit=w.commonErrors.find(e=>Math.abs(Number(input)-e.value)<=w.tolerance);return {correct:false,feedback:hit?hit.feedback:w.fallbackFeedback};}
  if(w.type==='mcq'){const o=w.options.find(x=>x.id===input);return {correct:!!o?.correct,feedback:o?.feedback};}
  if(w.type==='buildExpression'){const key=x=>x.join('|'), accepted=new Set([w.correct,...w.acceptAlso].map(key));if(accepted.has(key(input)))return {correct:true,feedback:w.successFeedback};const hit=w.commonBuilds.find(b=>key(b.sequence)===key(input));return {correct:false,feedback:hit?hit.feedback:w.missFeedback};}
  if(w.type==='placeCompare')return {correct:input===w.answer,feedback:input===w.answer?w.successFeedback:w[`${input}Feedback`]};
  throw new Error(`unsupported grade ${w.type}`);
}
const NEG=/^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function feedbacks(x,key='',out=[]){if(typeof x==='string'&&/feedback/i.test(key))out.push(x);else if(Array.isArray(x))x.forEach((v,i)=>feedbacks(v,`${key}[${i}]`,out));else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x))feedbacks(v,k,out);return out}
function check(v,gen,form,surface,where){const w=v.widget;assert.equal(w.type,surface,`${where} surface`);const want=truth(gen,form,w);for(const f of feedbacks(w)){assert(f.length>=25,`${where} short feedback`);assert(!NEG.test(f),`${where} negating feedback: ${f}`)}
  if(surface==='numeric'){assert.equal(v.answer,want,`${where} answer`);assert.equal(w.answer,want);assert(grade(w,want).correct);const vals=w.commonErrors.map(e=>e.value);assert.equal(new Set(vals.map(x=>x.toPrecision(14))).size,vals.length,`${where} duplicate traps ${vals}`);for(const e of w.commonErrors){assert(Math.abs(e.value-w.answer)>w.tolerance);const r=grade(w,e.value);assert(!r.correct);assert.equal(r.feedback,e.feedback);}}
  else if(surface==='mcq'){assert.equal(correctLabel(w),want,`${where} correct label`);assert.equal(new Set(labels(w)).size,w.options.length);const good=w.options.find(o=>o.correct);assert.equal(v.answer,good.id);assert(grade(w,good.id).correct);for(const o of w.options){const r=grade(w,o.id);assert.equal(r.correct,o.correct);assert.equal(r.feedback,o.feedback);}}
  else if(surface==='buildExpression'){const by=new Map(w.tokens.map(t=>[t.id,t.label]));assert.deepStrictEqual(w.correct.map(id=>by.get(id)),want,`${where} sequence`);assert.equal(new Set(w.tokens.map(t=>t.label)).size,w.tokens.length);assert(w.tokens.some(t=>![w.correct,...w.acceptAlso.flat()].includes(t.id)));assert(grade(w,w.correct).correct);for(const alt of w.acceptAlso)assert(grade(w,alt).correct);for(const b of w.commonBuilds){assert(!grade(w,b.sequence).correct);}}
  else if(surface==='placeCompare'){assert.equal(v.answer,want);assert.equal(w.answer,want);assert(grade(w,want).correct);for(const sym of ['lt','eq','gt'])if(sym!==want){const fb=w[`${sym}Feedback`];assert(fb);const r=grade(w,sym);assert(!r.correct);assert.equal(r.feedback,fb);}else assert.equal(w[`${sym}Feedback`],undefined);}
}

for(const [lesson,id,gen,form,surface] of targets){const f=`content/courses/decimals-place-value/lessons/${lesson}.json`;const d=JSON.parse(fs.readFileSync(f,'utf8'));const step=d.steps.find(s=>s.id===id);assert(step);assert.deepStrictEqual(step.variant,{gen,form});assert.equal(step.widget.type,surface);}
const unique=[...new Map(targets.map(t=>[`${t[2]}@${t[3]}`,{gen:t[2],form:t[3],surface:t[4]}])).values()];
let builds=0;
for(const {gen,form,surface} of unique)for(const band of ['support','core','stretch'])for(let i=0;i<120;i++){
  const seed=`session76:${gen}:${form}:${band}:${i}`;const a=V.variantForGenForm(gen,form,seed,band),b=V.variantForGenForm(gen,form,seed,band);assert.deepStrictEqual(a,b);check(a,gen,form,surface,`${gen}@${form}/${band}/${i}`);builds++;
}
let total=0,served=0;for(const f of fs.readdirSync('content/courses/decimals-place-value/lessons').filter(x=>x.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(`content/courses/decimals-place-value/lessons/${f}`,'utf8'));for(const s of d.steps||[])if(['check','challenge'].includes(s.kind)){total++;if(V.variantForStep(s,`coverage:${f}:${s.id}`,'core'))served++;}}
assert.deepStrictEqual({total,served,gaps:total-served},{total:47,served:47,gaps:0});
console.log(JSON.stringify({targets:targets.length,uniqueForms:unique.length,builds,course:{total,served,gaps:0},status:'PASS'}));
