#!/usr/bin/env python3
"""S188: the g2-fluency generator family (2.OA.B.2 — add/subtract within 20 from memory),
emitting ADDITIVE factFamily keys ("7+8") so the S187 leech box and review surface serve
Grade-2 fluency exactly as they serve Grade-3 multiplication. Abort on any anchor miss."""
from pathlib import Path

# ---------------------------------------------------------------- g2Variants.ts
p = Path("src/lib/g2Variants.ts")
s = p.read_text()

BLOCK = r"""
const F='g2-fluency';
// Additive fact-family key: always "min+max", so 7+8, 8+7, 15-7 and 15-8 all name ONE family.
// Mirrors factFluency.ts's sumFamilyKey exactly; kept local so this generator file stays
// dependency-free like every other g*Variants module.
const sfam=(a:number,b:number)=>`${Math.min(a,b)}+${Math.max(a,b)}`;
// Every numeric fluency form carries its family so the lesson player folds the result into the
// learner's per-family leech box (Profile.factItems), not just the conceptTag mastery estimate.
const numF=(prompt:string,answer:number,errs:Array<[number,string]>,family:string,success?:string):Variant=>{
 const v=num(F,prompt,answer,errs,success) as Variant & {factFamily?:string};
 v.factFamily=family; return v;
};
const fluencyHandlers:Record<string,Handler>={
 FlDoublesNumeric:(r,b)=>{const a=pick(r,2,hi(b,7,9,10));return numF(`${a} + ${a} = ?`,2*a,[[a,`That names one addend instead of doubling it — a double adds ${a} to itself.`],[2*a-1,`That is one short of the double. Count on ${a} from ${a}: ${2*a}.`]],sfam(a,a),`Correct — double ${a} is ${2*a}.`)},
 FlNearDoublesNumeric:(r,b)=>{const a=pick(r,2,hi(b,6,8,9));const c=a+1;return numF(`${a} + ${c} = ?`,a+c,[[2*a,`That doubles ${a}, but the second addend is ${c} — one MORE than ${a}, so the total is one more too.`],[2*c,`That doubles ${c}, but the first addend is ${a} — one LESS than ${c}.`]],sfam(a,c),`Correct — double ${a} is ${2*a}, and one more makes ${a+c}.`)},
 FlMakeTenNumeric:(r)=>{const a=pick(r,6,9);const c=pick(r,Math.max(2,11-a),9);const need=10-a;return numF(`${a} + ${c} = ? (Make ten first.)`,a+c,[[10,`That stops at ten. After using ${need} to make ten, ${c-need} still remain to add.`],[a+c-1,`That stops one short. ${a} + ${need} = 10, then ${c-need} more makes ${a+c}.`]],sfam(a,c),`Correct — ${a} + ${need} makes ten, then ${c-need} more gives ${a+c}.`)},
 FlTenPlusNumeric:(r,b)=>{const c=pick(r,1,hi(b,7,9,10));const on=c===1?'one':'ones';return numF(`10 + ${c} = ?`,10+c,[[c,`That leaves out the ten. Ten plus ${c} keeps the ten and adds ${c} ${on}.`],[10,`That leaves out the ${c}. Ten plus ${c} is ${10+c}.`]],sfam(10,c),`Correct — ten and ${c} more is ${10+c}, written as a ten and ${c} ${on}.`)},
 FlSums12Numeric:(r)=>{const t=pick(r,9,12);const a=pick(r,3,t-3);const c=t-a;return numF(`${a} + ${c} = ?`,t,[[t-1,`That stops one short. Count on ${c} from ${a} and land on ${t}.`],[Math.abs(a-c),`That finds the difference between ${a} and ${c} instead of their total.`]],sfam(a,c),`Correct — ${a} + ${c} = ${t}.`)},
 FlSums16Numeric:(r)=>{const t=pick(r,13,16);const a=pick(r,4,Math.min(9,t-4));const c=t-a;return numF(`${a} + ${c} = ?`,t,[[t-1,`That stops one short of ${t}. Make ten first, then add what is left.`],[Math.abs(a-c),`That subtracts instead of adding.`]],sfam(a,c),`Correct — ${a} + ${c} = ${t}.`)},
 FlSums20Numeric:(r)=>{const t=pick(r,17,20);const a=pick(r,8,Math.min(10,t-8));const c=t-a;return numF(`${a} + ${c} = ?`,t,[[t-1,`That stops one short of ${t}. Make ten from ${a}, then add the rest.`],[t-10,`That drops a whole ten from the total.`]],sfam(a,c),`Correct — ${a} + ${c} = ${t}.`)},
 FlFromTenNumeric:(r)=>{const c=pick(r,1,9);return numF(`10 − ${c} = ?`,10-c,[[c,`That repeats the number taken away instead of what is left.`],[10,`That leaves the ten unchanged — ${c} must come off it.`]],sfam(c,10-c),`Correct — 10 − ${c} = ${10-c}, since ${c} + ${10-c} = 10.`)},
 FlAcrossTenNumeric:(r)=>{const total=pick(r,12,18);const c=pick(r,total-10+1,9);return numF(`${total} − ${c} = ?`,total-c,[[total-10,`That takes away ten instead of ${c}.`],[total-c+1,`That is one too many left — check by adding back: ${c} + ${total-c} = ${total}.`]],sfam(c,total-c),`Correct — ${total} − ${c} = ${total-c}. Take ${total-10} to reach ten, then ${c-(total-10)} more.`)},
 FlThinkAdditionNumeric:(r)=>{const a=pick(r,3,9);const c=pick(r,3,Math.min(9,20-a));const t=a+c;return numF(`${t} − ${a} = ? Think: ${a} + ? = ${t}.`,c,[[t,`That repeats the total. The question asks what is LEFT after ${a} comes off.`],[a,`That repeats the part taken away instead of the part remaining.`]],sfam(a,c),`Correct — ${a} + ${c} = ${t}, so ${t} − ${a} = ${c}.`)},
 FlFactFamilyNumeric:(r)=>{const a=pick(r,3,9);const c=pick(r,3,Math.min(9,20-a));const t=a+c;const askSub=r()<0.5;
  if(askSub)return numF(`Fact family ${a}, ${c}, ${t}: knowing ${a} + ${c} = ${t}, what is ${t} − ${c}?`,a,[[t,`That repeats the total instead of removing ${c} from it.`],[c,`That repeats ${c} instead of the other part of the family.`]],sfam(a,c),`Correct — the family's parts are ${a} and ${c}, so ${t} − ${c} = ${a}.`);
  return numF(`Fact family ${a}, ${c}, ${t}: knowing ${a} + ${c} = ${t}, what is ${c} + ${a}?`,t,[[Math.abs(a-c),`That subtracts the parts. Addition commutes, so the total is unchanged.`],[t-1,`The order of the parts does not change the total: it is still ${t}.`]],sfam(a,c),`Correct — addition commutes: ${c} + ${a} = ${a} + ${c} = ${t}.`)},
 FlMissingNumeric:(r)=>{const a=pick(r,3,9);const c=pick(r,3,Math.min(9,20-a));const t=a+c;return numF(`${a} + ? = ${t}`,c,[[t,`That repeats the total instead of the missing part.`],[t+a,`That adds ${a} again instead of finding what fills the gap to ${t}.`]],sfam(a,c),`Correct — ${a} + ${c} = ${t}.`)},
 FlSpeedAddNumeric:(r)=>{const a=pick(r,2,10);const c=pick(r,2,Math.min(10,20-a));return numF(`Answer fast: ${a} + ${c} = ?`,a+c,[[a+c-1,`That stops one count short of the total — count on again from ${a}.`],[Math.abs(a-c),`That finds the difference between ${a} and ${c} instead of their total.`]],sfam(a,c),`Correct — ${a} + ${c} = ${a+c}.`)},
 FlSpeedSubNumeric:(r)=>{const total=pick(r,10,20);const c=pick(r,1,Math.min(10,total-1));return numF(`Answer fast: ${total} − ${c} = ?`,total-c,[[total,`That repeats the total instead of taking ${c} away.`],[total-c+1,`That leaves one too many — check by adding back.`]],sfam(c,total-c),`Correct — ${total} − ${c} = ${total-c}.`)},
};
"""

anchor = "function fam(tag:string,label:string,handlers:Record<string,Handler>):VariantGen{"
assert s.count(anchor) == 1
s = s.replace(anchor, BLOCK.strip("\n") + "\n" + anchor)

g = "export const G2_GENERATORS:readonly VariantGen[]=[fam(A,"
assert s.count(g) == 1
s = s.replace(g, "export const G2_GENERATORS:readonly VariantGen[]=[fam(F,'Grade 2 addition and subtraction fluency within 20',fluencyHandlers),fam(A,")

p.write_text(s)
print("g2Variants: g2-fluency family + registration")

# ---------------------------------------------------------------- g2Independent.cjs
q = Path("src/lib/g2Independent.cjs")
t = q.read_text()
anchor2 = " switch(form){\n"
assert t.count(anchor2) == 1
routes = """ switch(form){
 case'FlDoublesNumeric':{const m=prompt.match(/^(\\d+) \\+ (\\d+) = \\?/);return +m[1]+ +m[2];}
 case'FlNearDoublesNumeric':{const m=prompt.match(/^(\\d+) \\+ (\\d+) = \\?/);return +m[1]+ +m[2];}
 case'FlMakeTenNumeric':{const m=prompt.match(/^(\\d+) \\+ (\\d+) = \\?/);return +m[1]+ +m[2];}
 case'FlTenPlusNumeric':{const m=prompt.match(/^10 \\+ (\\d+) = \\?/);return 10+ +m[1];}
 case'FlSums12Numeric': case'FlSums16Numeric': case'FlSums20Numeric':{const m=prompt.match(/^(\\d+) \\+ (\\d+) = \\?/);return +m[1]+ +m[2];}
 case'FlFromTenNumeric':{const m=prompt.match(/^10 [−-] (\\d+) = \\?/);return 10- +m[1];}
 case'FlAcrossTenNumeric':{const m=prompt.match(/^(\\d+) [−-] (\\d+) = \\?/);return +m[1]- +m[2];}
 case'FlThinkAdditionNumeric':{const m=prompt.match(/^(\\d+) [−-] (\\d+) = \\?/);return +m[1]- +m[2];}
 case'FlFactFamilyNumeric':{let m=prompt.match(/what is (\\d+) [−-] (\\d+)\\?/);if(m)return +m[1]- +m[2];m=prompt.match(/what is (\\d+) \\+ (\\d+)\\?/);if(m)return +m[1]+ +m[2];throw new Error('FlFactFamilyNumeric: '+prompt);}
 case'FlMissingNumeric':{const m=prompt.match(/^(\\d+) \\+ \\? = (\\d+)/);return +m[2]- +m[1];}
 case'FlSpeedAddNumeric':{const m=prompt.match(/(\\d+) \\+ (\\d+) = \\?/);return +m[1]+ +m[2];}
 case'FlSpeedSubNumeric':{const m=prompt.match(/(\\d+) [−-] (\\d+) = \\?/);return +m[1]- +m[2];}
"""
t = t.replace(anchor2, routes)
q.write_text(t)
print("g2Independent: 14 form routes")
