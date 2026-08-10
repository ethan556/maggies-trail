#!/usr/bin/env python3
"""S185: insert the g1-data generator family (1.MD.C.4 — organize, represent, interpret data)
into g1Variants.ts + independent routes into g1Independent.cjs. Abort on any anchor miss."""
from pathlib import Path

# ---------------------------------------------------------------- g1Variants.ts
p = Path("src/lib/g1Variants.ts")
s = p.read_text()

BLOCK = r"""
const D='g1-data';
// Category counts are drawn distinct so most/fewest is single-valued; totals stay within the
// Grade-1 add-within-20 range wherever the form asks for arithmetic.
const cats3=(r:Rand):[string[],number[]]=>{const names=shuffle(r,['Cats','Dogs','Fish','Birds','Frogs'] as const).slice(0,3);const a=pick(r,5,8),b=pick(r,2,a-1),c=pick(r,0,b-1);const counts=shuffle(r,[a,b,c]);return[[...names],counts]};
const dataHandlers:Record<string,Handler>={
 GdTotalNumeric:(r)=>{const[nm,ct]=cats3(r);const t=ct[0]+ct[1]+ct[2];return num(D,`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. How many votes in all?`,t,[[ct[0]+ct[1],`That adds only the first two categories and leaves out ${nm[2]}. "In all" means every category counts toward the total.`],[Math.max(...ct),`That is the biggest single category, not the total. Add all three counts together.`]])},
 GdCompareNumeric:(r)=>{const[nm,ct]=cats3(r);const i=ct.indexOf(Math.max(...ct)),j=ct.indexOf(Math.min(...ct));return num(D,`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. How many more votes does ${nm[i]} have than ${nm[j]}?`,ct[i]-ct[j],[[ct[i]+ct[j],`That adds the two categories. "How many more" asks for the difference, so subtract the smaller count from the larger.`],[ct[i],`That is ${nm[i]}'s whole count. The question asks how far ahead it is, which is the difference between the two counts.`]])},
 GdMostMcq:(r)=>{const[nm,ct]=cats3(r);const i=ct.indexOf(Math.max(...ct));const rest=[0,1,2].filter(x=>x!==i);return mcq(r,D,`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. Which got the MOST votes?`,[nm[i],`Correct — ${ct[i]} is the biggest count, so ${nm[i]} got the most votes.`],rest.map(x=>[nm[x],`${nm[x]} got ${ct[x]} votes, and ${ct[i]} is bigger. The most votes means the biggest count.`] as [string,string]))},
 GdLeastMcq:(r)=>{const[nm,ct]=cats3(r);const i=ct.indexOf(Math.min(...ct));const rest=[0,1,2].filter(x=>x!==i);return mcq(r,D,`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. Which got the FEWEST votes?`,[nm[i],`Correct — ${ct[i]} is the smallest count, so ${nm[i]} got the fewest votes.`],rest.map(x=>[nm[x],`${nm[x]} got ${ct[x]} votes, and ${ct[i]} is smaller. The fewest votes means the smallest count.`] as [string,string]))},
 GdTallyReadNumeric:(r)=>{const g=pick(r,1,3),sg=pick(r,1,4);return num(D,`A tally row shows ${g} crossed five-${g===1?'group':'groups'} and ${sg} single ${sg===1?'mark':'marks'}. How many does it count?`,5*g+sg,[[g+sg,`That counts each crossed group as one mark, but a crossed group holds FIVE marks. Count the groups by fives, then add the singles.`],[5*g,`That counts only the five-groups and skips the single marks after them. Count on from ${5*g} by ones.`]])},
 GdTallyMakeNumeric:(r)=>{const n=pick(r,6,19);return num(D,`${n} students voted. When you tally the votes in five-groups, how many CROSSED groups will there be?`,Math.floor(n/5),[[n,`That is the whole count of votes. Each crossed group bundles five of them; the question asks how many full bundles fit.`],[n%5===Math.floor(n/5)?n-1:n%5,`That is the number of leftover single marks after the five-groups, not the number of crossed groups.`]])},
 GdTallySinglesNumeric:(r)=>{let n=pick(r,6,19);if(n%5===0)n+=1;if(n%5===Math.floor(n/5))n+=1;return num(D,`${n} students voted. After the crossed five-groups, how many SINGLE marks will the tally show?`,n%5,[[Math.floor(n/5),`That is the number of crossed five-groups, not the leftover single marks.`],[n,`That is the whole count. Only the marks left over after bundling fives stand alone.`]])},
 GdNotCategoryNumeric:(r)=>{const[nm,ct]=cats3(r);const t=ct[0]+ct[1]+ct[2];return num(D,`${t} fruits were sorted: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. How many are NOT ${nm[0]}?`,t-ct[0],[[ct[0],`That is the count that IS ${nm[0]}. "Not ${nm[0]}" means everything in the other categories.`],[t,`That is the whole collection. Take away the ${nm[0]} count to find what is left.`]])},
 GdQuestionMcq:(r)=>{const topic=choose(r,['pets','fruits','colors','sports'] as const);const q={pets:'Which pet do you like best?',fruits:'Which fruit do you like best?',colors:'Which color do you like best?',sports:'Which sport do you like best?'}[topic];return mcq(r,D,`A class wants to collect data about favorite ${topic}. Which is a good survey question?`,[q,`Correct — it asks every person for one answer that can be sorted into categories and counted.`],[['Do you like things?',`That question is too vague to sort — the answers would not fall into countable categories about ${topic}.`],['What is 3 + 4?',`That is an arithmetic problem with one right answer, not a survey question that collects different people's choices.`],[`Why is the sky blue?`,`That asks for an explanation, not a choice that can be tallied into categories.`]])},
 GdSortMcq:(r)=>{const kind=choose(r,[['a red apple','color','Red things','Round things','Big things'],['a toy car','what it does','Things that roll','Things that fly','Things that swim'],['a triangle','shape','Shapes with 3 sides','Shapes with 4 sides','Round shapes']] as const);return mcq(r,D,`You are sorting by ${kind[1]}. Where does ${kind[0]} belong?`,[kind[2],`Correct — sorted by ${kind[1]}, ${kind[0]} matches this group's rule.`],[[kind[3],`${kind[0]} does not fit that group's rule when sorting by ${kind[1]}.`],[kind[4],`${kind[0]} does not fit that group's rule when sorting by ${kind[1]}.`]])},
 GdInterpretMcq:(r)=>{const[nm,ct]=cats3(r);const i=ct.indexOf(Math.max(...ct)),j=ct.indexOf(Math.min(...ct));return mcq(r,D,`Votes: ${nm[0]} ${ct[0]}, ${nm[1]} ${ct[1]}, ${nm[2]} ${ct[2]}. Which sentence tells the data's story truthfully?`,[`${nm[i]} got the most votes`,`Correct — ${ct[i]} is the biggest count, so that sentence matches the data.`],[[`${nm[j]} got the most votes`,`${nm[j]} got ${ct[j]} votes — the SMALLEST count. The data says the opposite.`],[`Every category got the same votes`,`The three counts are all different, so no two categories tied.`],[`${nm[i]} got the fewest votes`,`${nm[i]} has the biggest count, ${ct[i]}. It got the most, not the fewest.`]])},
 GdBarCompareNumeric:(r)=>{const h=pick(r,4,9),d=pick(r,1,3);return num(D,`On a bar graph, the Dogs bar reaches ${h}. The Cats bar is ${d} shorter. How tall is the Cats bar?`,h-d,[[h+d,`That makes the Cats bar TALLER by ${d}. "Shorter" means the bar reaches a smaller number.`],[h,`That is the Dogs bar's height. The Cats bar is ${d} below it.`]])},
};
"""

anchor = "function fam(tag:string,label:string,handlers:Record<string,Handler>):VariantGen{"
assert s.count(anchor) == 1
s = s.replace(anchor, BLOCK.strip("\n") + "\n" + anchor)

g = "export const G1_GENERATORS:readonly VariantGen[]=[fam(A,'Grade 1 addition and subtraction within 20',addHandlers),"
assert s.count(g) == 1
s = s.replace(g, g[:-1].replace("[fam(A", "[fam(D,'Grade 1 data: sorting, tallying, and reading category counts',dataHandlers),fam(A") + ",")

surf = "export const G1_FORM_SURFACES:Readonly<Record<string,string>>=Object.fromEntries([...Object.keys(addHandlers),"
assert s.count(surf) == 1
s = s.replace(surf, surf.replace("[...Object.keys(addHandlers),", "[...Object.keys(dataHandlers),...Object.keys(addHandlers),"))

p.write_text(s)
print("g1Variants: family + registration + surfaces")

# ---------------------------------------------------------------- g1Independent.cjs
q = Path("src/lib/g1Independent.cjs")
t = q.read_text()
anchor2 = " switch(form){\n"
assert t.count(anchor2) == 1
routes = r""" switch(form){
 case'GdTotalNumeric':{const m=prompt.match(/Votes: \w+ (\d+), \w+ (\d+), \w+ (\d+)\. How many votes in all/);return +m[1]+ +m[2]+ +m[3];}
 case'GdCompareNumeric':{const m=prompt.match(/Votes: (\w+) (\d+), (\w+) (\d+), (\w+) (\d+)\. How many more votes does (\w+) have than (\w+)/);const c={[m[1]]:+m[2],[m[3]]:+m[4],[m[5]]:+m[6]};return c[m[7]]-c[m[8]];}
 case'GdMostMcq':{const m=prompt.match(/Votes: (\w+) (\d+), (\w+) (\d+), (\w+) (\d+)/);const pairs=[[m[1],+m[2]],[m[3],+m[4]],[m[5],+m[6]]];pairs.sort((a,b)=>b[1]-a[1]);return exact(options,pairs[0][0]);}
 case'GdLeastMcq':{const m=prompt.match(/Votes: (\w+) (\d+), (\w+) (\d+), (\w+) (\d+)/);const pairs=[[m[1],+m[2]],[m[3],+m[4]],[m[5],+m[6]]];pairs.sort((a,b)=>a[1]-b[1]);return exact(options,pairs[0][0]);}
 case'GdTallyReadNumeric':{const m=prompt.match(/(\d+) crossed five-groups? and (\d+) single marks?/);return 5*+m[1]+ +m[2];}
 case'GdTallyMakeNumeric':{return Math.floor(n[0]/5);}
 case'GdTallySinglesNumeric':{return n[0]%5;}
 case'GdNotCategoryNumeric':{const m=prompt.match(/sorted: (\w+) (\d+), \w+ (\d+), \w+ (\d+)\. How many are NOT (\w+)/);const total=+m[2]+ +m[3]+ +m[4];return total-+m[2];}
 case'GdQuestionMcq':{return exact(options,options.find(o=>/like best\?$/.test(o)));}
 case'GdSortMcq':{if(prompt.includes('red apple'))return exact(options,'Red things');if(prompt.includes('toy car'))return exact(options,'Things that roll');return exact(options,'Shapes with 3 sides');}
 case'GdInterpretMcq':{const m=prompt.match(/Votes: (\w+) (\d+), (\w+) (\d+), (\w+) (\d+)/);const pairs=[[m[1],+m[2]],[m[3],+m[4]],[m[5],+m[6]]];pairs.sort((a,b)=>b[1]-a[1]);return exact(options,`${pairs[0][0]} got the most votes`);}
 case'GdBarCompareNumeric':{const m=prompt.match(/reaches (\d+)\. The Cats bar is (\d+) shorter/);return +m[1]-+m[2];}
"""
t = t.replace(anchor2, routes)
q.write_text(t)
print("g1Independent: 12 routes")
