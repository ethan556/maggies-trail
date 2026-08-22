const nums=s=>[...s.matchAll(/\d+/g)].map(m=>+m[0]);
const exact=(opts,label)=>{const x=opts.find(o=>o===label);if(x===undefined)throw new Error(`missing option ${label}: ${opts.join(' | ')}`);return x};
const opVal=s=>{let m=s.match(/(\d+)\s*\+\s*(\d+)/);if(m)return +m[1]+ +m[2];m=s.match(/(\d+)\s*[−-]\s*(\d+)/);if(m)return +m[1]- +m[2];};
// Static lesson content restates many g1-add-subtract / g1-tens-ones prompts as free-form
// English with numbers spelled out ("Twelve shells join one more shell") rather than the
// generator's fixed "${a} + ${b} = ?" digit template. tok()/mixedNums() extract numeric
// value from either a digit token or a recognized number word, so the case handlers below
// can re-derive the authored answer regardless of which surface form was used.
const ONE_WORDS={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
const tok=t=>{if(t==null)return undefined;const s=String(t).toLowerCase();if(/^\d+$/.test(s))return +s;if(s==='once')return 1;if(s==='pair')return 2;if(s in ONE_WORDS)return ONE_WORDS[s];if(s.endsWith('s')&&(s.slice(0,-1) in ONE_WORDS))return ONE_WORDS[s.slice(0,-1)];return undefined};
const mixedNums=s=>{const out=[];for(const m of s.matchAll(/\d+|[A-Za-z]+/g)){const v=tok(m[0]);if(v!==undefined)out.push(v)}return out};
function solvePrompt(form,input){const p=input.split('||'),prompt=p[0],raw=p.slice(1).join('||');let options=[],state=null;if(raw){try{state=JSON.parse(raw)}catch{options=(p[1]||'').split(';;').filter(Boolean)}}const n=nums(prompt);
 if(form.endsWith('NumberLineHop'))return prompt.includes('right before')?n[0]-1:n[0]+1;
 if(form.endsWith('BaseTenCompose'))return n[0];
 if(form==='defaultAddSubtract')return opVal(prompt);
 if(form==='defaultCounting120')return n[1]+1;
 if(form.endsWith('FractionBar'))return {n:1,d:prompt.includes('fourth')?4:2};
 switch(form){
 case'GdTotalNumeric':{const m=prompt.match(/Votes: [A-Za-z][A-Za-z ]*? (\d+), [A-Za-z][A-Za-z ]*? (\d+), [A-Za-z][A-Za-z ]*? (\d+)\. How many votes in all/);return +m[1]+ +m[2]+ +m[3];}
 case'GdCompareNumeric':{const m=prompt.match(/Votes: ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+)\. How many more votes does ([A-Za-z][A-Za-z ]*?) have than ([A-Za-z][A-Za-z ]*?)\?/);const c={[m[1]]:+m[2],[m[3]]:+m[4],[m[5]]:+m[6]};return c[m[7]]-c[m[8]];}
 case'GdMostMcq':{const m=prompt.match(/Votes: ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+)/);const pairs=[[m[1],+m[2]],[m[3],+m[4]],[m[5],+m[6]]];pairs.sort((a,b)=>b[1]-a[1]);return exact(options,pairs[0][0]);}
 case'GdLeastMcq':{const m=prompt.match(/Votes: ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+)/);const pairs=[[m[1],+m[2]],[m[3],+m[4]],[m[5],+m[6]]];pairs.sort((a,b)=>a[1]-b[1]);return exact(options,pairs[0][0]);}
 case'GdTallyReadNumeric':{const m=prompt.match(/(\d+) crossed five-groups? and (\d+) single marks?/);return 5*+m[1]+ +m[2];}
 case'GdTallyMakeNumeric':{return Math.floor(n[0]/5);}
 case'GdTallySinglesNumeric':{return n[0]%5;}
 case'GdNotCategoryNumeric':{const m=prompt.match(/sorted: ([A-Za-z][A-Za-z ]*?) (\d+), [A-Za-z][A-Za-z ]*? (\d+), [A-Za-z][A-Za-z ]*? (\d+)\. How many are NOT ([A-Za-z][A-Za-z ]*?)\?/);const total=+m[2]+ +m[3]+ +m[4];return total-+m[2];}
 case'GdQuestionMcq':{return exact(options,options.find(o=>/like best\?$/.test(o)));}
 case'GdSortMcq':{if(prompt.includes('red apple'))return exact(options,'Red things');if(prompt.includes('toy car'))return exact(options,'Things that roll');return exact(options,'Shapes with 3 sides');}
 case'GdInterpretMcq':{const m=prompt.match(/Votes: ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+), ([A-Za-z][A-Za-z ]*?) (\d+)/);const pairs=[[m[1],+m[2]],[m[3],+m[4]],[m[5],+m[6]]];pairs.sort((a,b)=>b[1]-a[1]);return exact(options,`${pairs[0][0]} got the most votes`);}
 case'GdBarCompareNumeric':{const m=prompt.match(/reaches (\d+)\. The Cats bar is (\d+) shorter/);return +m[1]-+m[2];}
 case'BiggerFirstNumeric':{const eq=prompt.match(/(\d+)\s*\+\s*(\d+)/);if(eq)return +eq[1]+ +eq[2];const t=mixedNums(prompt);return t[0]+t[1];}
 case'CountOnSmallNumeric':case'CountingOnNumeric':{const t=mixedNums(prompt);return t[0]+t[1];}
 case'BiggerFirstMcq':return exact(options,String(Math.max(n[0],n[1])));
 case'CompareNumeric':return n[0]-n[1];
 case'CompareMcq':return exact(options,`${n[0]} − ${n[1]} = ?`);
 case'CountBackMcq':return exact(options,String(n[1]-1));
 case'CountingOnMcq':return exact(options,`Start at ${n[0]} and count on ${n[1]}`);
 case'DifferenceMcq':return exact(options,`${n[0]} − ${n[1]}`);
 case'EqualSignMcq':return exact(options,opVal(prompt.split('=')[0])===Number(prompt.split('=')[1])?'True':'False');
 case'EqualSignNumeric':{let m=prompt.match(/^(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)\s*\+\s*\?/);if(m)return +m[1]+ +m[2]- +m[3];m=prompt.match(/left side (\d+)\s*\+\s*(\d+) has value (\d+)\. What number makes (\d+)\s*\+\s*\?/i);if(m)return +m[3]- +m[4];m=prompt.match(/(\w+) plus (\w+) balances (\w+) plus a missing (?:number|part)/i);if(m)return tok(m[1])+tok(m[2])-tok(m[3]);m=prompt.match(/(\w+) plus (\w+) equals (\w+) plus which number/i);if(m)return tok(m[1])+tok(m[2])-tok(m[3]);return n[0]+n[1]-n[2];}
 case'FactFamilyNumeric':{let m=prompt.match(/[Ff]amily (\w+),\s*(\w+),\s*(\w+):.*?(\w+)\s*[−-]\s*(\w+)\s*=/i);if(m)return tok(m[4])-tok(m[5]);m=prompt.match(/family (\w+),\s*(\w+),\s*(\w+),?\s*what is (\w+) minus (\w+)/i);if(m)return tok(m[4])-tok(m[5]);return n[3]-n[4];}
 case'MakeTenFirstNumeric':{let m=prompt.match(/group of (\w+) gives (\w+)/i);if(m)return tok(m[1])-tok(m[2]);m=prompt.match(/^(\d+)\s*\+\s*(\d+)\s*=/);if(m)return +m[1]+ +m[2];m=prompt.match(/(?:takes?|took|uses?|needs?)\s+(\w+)(?:\s+counters?)?\s+from\s+(?:a\s+|the\s+)?(?:group of\s+)?(\w+)/i);if(m)return tok(m[2])-tok(m[1]);m=prompt.match(/use\s+(\w+)\s+of\s+(\w+)\s+counters/i);if(m)return tok(m[2])-tok(m[1]);return n[2]-n[1];}
 case'MakeTenFirstMcq':{const a=n[0],b=n[1],need=10-a;return exact(options,`${need} and ${b-need}`)}
 case'PartWholeNumeric':{let m=prompt.match(/^(\d+)\s*\+\s*(\d+)\s*=/);if(m)return +m[1]+ +m[2];m=prompt.match(/(\d+)\s+\w+ in all\.\s*(\d+)\s+are/i);if(m)return +m[1]- +m[2];m=prompt.match(/[Dd]ouble\s+(\w+)\s+means\s+\w+\s*\+\s*\w+/i);if(m)return tok(m[1])*2;m=prompt.match(/^[Dd]ouble\s+(\w+)\s+is\s+\w+\.\s*(?:Take one away to solve|Add one to solve)\s+(\w+)\s+plus\s+(\w+)/i);if(m)return tok(m[2])+tok(m[3]);m=prompt.match(/[Dd]ouble\s+(\w+),\s*then\s+add\s+(\w+)/i);if(m)return tok(m[1])*2+tok(m[2]);m=prompt.match(/A ten-partner pair has (\w+) and (\w+)/i);if(m)return tok(m[1])+tok(m[2]);m=prompt.match(/Ten plus (\w+) is a teen/i);if(m)return 10+tok(m[1]);m=prompt.match(/A full ten has (\w+) more counters joined/i);if(m)return 10+tok(m[1]);m=prompt.match(/After making a ten, add (\w+) more/i);if(m)return 10+tok(m[1]);m=prompt.match(/A pair has (\w+) counters and (\w+) counters/i);if(m)return tok(m[1])+tok(m[2]);m=prompt.match(/Maggie has (\w+) red beads and (\w+) blue beads/i);if(m)return tok(m[1])+tok(m[2]);m=prompt.match(/(\w+) red(?: and| counters (?:and|join))? (\w+) blue counters/i);if(m)return tok(m[1])+tok(m[2]);m=prompt.match(/Two (?:matching rows hold|rows of) (\w+) counters each/i);if(m)return tok(m[1])*2;m=prompt.match(/Two rows of (\w+) counters gain (\w+) extra/i);if(m)return tok(m[1])*2+tok(m[2]);m=prompt.match(/A (\w+)-dot pattern is mirrored/i);if(m)return tok(m[1])*2;m=prompt.match(/Two hands each show (\w+) fingers/i);if(m)return tok(m[1])*2;m=prompt.match(/Two equal groups of (\w+) counters combine/i);if(m)return tok(m[1])*2;const t=mixedNums(prompt);if(t.length>=2)return t[0]+t[1];return n[0]+n[1];}
 case'PartWholeMcq':return exact(options,`${n[0]} − ${n[1]} = ?`);
 case'ResultUnknownNumeric':{const add=/more arrive/.test(prompt);let m=prompt.match(/^(\d+)[^.]*?\.\s*(\d+)\s*(?:hop away|blow away)/i);if(m)return +m[1]- +m[2];m=prompt.match(/^(\w+) frogs (?:sit|start)[^.]*?;?\s*(?:only\s+)?(\w+)\s+(?:hop away|leave)/i);if(m)return tok(m[1])-tok(m[2]);m=prompt.match(/(\w+) frogs split into (\w+) that leave/i);if(m)return tok(m[1])-tok(m[2]);m=prompt.match(/^(\d+)\s*[−-]\s*(\d+)\s*=/);if(m)return +m[1]- +m[2];m=prompt.match(/(\w+) birds lose (\w+) birds/i);if(m)return tok(m[1])-tok(m[2]);m=prompt.match(/moves back (\w+) spaces? from (\w+)/i);if(m)return tok(m[2])-tok(m[1]);m=prompt.match(/(\w+) loses (\w+) counters/i);if(m)return tok(m[1])-tok(m[2]);m=prompt.match(/(\w+) counters split into (\w+) removed/i);if(m)return tok(m[1])-tok(m[2]);return add?n[0]+n[1]:n[0]-n[1];}
 case'ResultUnknownMcq':return exact(options,`${n[0]} + ${n[1]} = ?`);
 case'SubFactsMcq':{const d=n[0]-n[1];return exact(options,`${n[1]} + ${d} = ${n[0]}`)}
 case'TakeAwayMcq':return exact(options,`Start with ${n[0]} and take away ${n[1]}`);
 case'TensPartnersNumeric':{let m=prompt.match(/A ten-frame has (\w+) filled cells/i);if(m)return 10-tok(m[1]);m=prompt.match(/One is (\w+)\. What is the other/i);if(m)return 10-tok(m[1]);m=prompt.match(/(\w+) needs a missing part to complete ten/i);if(m)return 10-tok(m[1]);return 10-n[0];}
 case'TensPartnersMcq':return options.find(x=>nums(x).slice(0,2).reduce((a,b)=>a+b,0)===10);
 case'UnknownNumeric':{let m=prompt.match(/^(\d+)\s*\+\s*\?\s*=\s*(\d+)/);if(m)return +m[2]- +m[1];m=prompt.match(/^\?\s*\+\s*(\d+)\s*=\s*(\d+)/);if(m)return +m[2]- +m[1];m=prompt.match(/^(\d+)\s*[−-]\s*\?\s*=\s*(\d+)/);if(m)return +m[1]- +m[2];m=prompt.match(/^\?\s*[−-]\s*(\d+)\s*=\s*(\d+)/);if(m)return +m[2]+ +m[1];m=prompt.match(/There are (\w+) birds on a branch\. Some arrive, making (\w+)/i);if(m)return tok(m[2])-tok(m[1]);m=prompt.match(/There are (\w+) stickers\. (\w+) are already sorted/i);if(m)return tok(m[1])-tok(m[2]);m=prompt.match(/a group of ten and wants a total of (\w+)/i);if(m)return tok(m[1])-10;return prompt.includes('+')?n[1]-n[0]:n[0]-n[1];}
 case'ChartFindNumeric':return n[1]+1;
 case'ChartFindMcq':return exact(options,`Row ${Math.ceil(n[n.length-1]/10)}`);
 case'ChartPatternNumeric':return n[0]+10;
 case'ChartPatternMcq':return exact(options,'The same ones digit');
 case'ChartRowsNumeric':return Math.ceil(n[0]/10)*10;
 case'ChartRowsMcq':return exact(options,String(n[0]*10));
 case'CountPileNumeric':return prompt.includes('TENS')?Math.floor(n[0]/10):n[0]%10;
 case'CountPileMcq':return exact(options,String(Math.max(n[0],n[1])));
 case'CountSequenceNumeric':return n[0]+(prompt.includes('after')?1:-1);
 case'CountSequenceMcq':return options.find(x=>{const a=nums(x);return a.length>=4&&a.every((v,i)=>i===0||v===a[i-1]+1)});
 case'MixJumpsNumeric':return n[0]+10+n[1];
 case'MixJumpsMcq':return exact(options,'The tens digit');
 case'SkipTenMcq':case'TenMoreLessMcq':return exact(options,'The ones digit');
 case'OneMoreLessNumeric':return n[0]+(prompt.includes('less')?-1:1);
 case'OneMoreLessMcq':return exact(options,String(n[0]-1));
 case'PastHundredNumeric':return n[0]+1;
 case'PastHundredMcq':return exact(options,String(n[0]/10));
 case'SkipTenNumeric':return n[0]+10;
 case'TeensNumeric':return 10+n[n.length-1];
 case'TeensMcq':return exact(options,String(10+n[n.length-1]));
 case'TenMoreLessNumeric':return n[0]+(prompt.includes('less')?-10:10);
 case'TensOnesNumeric':return 10*n[0]+n[1];
 case'TensOnesMcq':{const x=n[0],o=x%10;return exact(options,`${Math.floor(x/10)} tens and ${o} ${o===1?'one':'ones'}`)}
 case'To120Numeric':return n[0]+10;
 case'To120Mcq':return exact(options,'101');
 case'Smg12D3DMcq':{const solid=/cube|cone|cylinder|sphere/.test(prompt);return exact(options,solid?'3D':'2D')}
 case'Smg12D3DNumeric':{const shape=prompt.match(/a (cube|cone|cylinder|sphere)/)[1],faces={cube:6,cone:1,cylinder:2,sphere:0},curved={cube:0,cone:1,cylinder:1,sphere:1};return prompt.includes('flat faces')?faces[shape]:curved[shape]}
 case'Smg1HalvesNumeric':return 2;case'Smg1FourthsNumeric':return 4;case'Smg1HalvesFourthsNumeric':return 2;
 case'Smg1HalvesMcq':return exact(options,'A half');case'Smg1FourthsMcq':return exact(options,'A fourth');case'Smg1HalvesFourthsMcq':return exact(options,'A fourth');
 case'Smg1LengthDifferenceNumeric':return n[0]-n[1];
 case'Smg1UnitSizeCompareMcq':{const names=[...prompt.matchAll(/A ([\w-]+) is \d+ ([\w-]+)s long/g)].map(m=>({name:m[1],unit:m[2]}));const big=prompt.match(/a ([\w-]+) is bigger than a ([\w-]+)/);const winner=names.find(x=>x.unit===big[1]).name;return exact(options,`No — the ${winner} is longer`);}
 /* S326-R1: shape table extended with hexagon (6 sides/6 corners) and the article
    matcher widened to 'one <shape>' — covers the signed S320-IMPL-A13-g1s-01-03
    hexagon retarget and S320-IMPL-A13-g1s-03-02 decompose reframe; verified against
    every Smg1ShapeSidesNumeric prompt in the corpus. */
 case'Smg1ShapeSidesNumeric':{const sh=prompt.match(/(?:a|one) (triangle|square|rectangle|circle|hexagon)/)[1],tab={triangle:{sides:3,corners:3},square:{sides:4,corners:4},rectangle:{sides:4,corners:4},circle:{sides:0,corners:0},hexagon:{sides:6,corners:6}};return tab[sh][prompt.includes('corners')?'corners':'sides']}
 case'Smg1ShapeSidesMcq':{const sides=n[0],corners=n[1],map={'3,3':'Triangle','0,0':'Circle'};return exact(options,map[`${sides},${corners}`])}
 case'Smg1SolidPartsNumeric':{const sh=prompt.match(/a (cube|cone|cylinder|sphere)/)[1],tab={cube:{faces:6,edges:12},cone:{faces:1,edges:1},cylinder:{faces:2,edges:2},sphere:{faces:0,edges:0}};return tab[sh][prompt.includes('flat faces')?'faces':'edges']}
 case'Smg1SolidPartsMcq':return exact(options,'Cube');
 case'TnoAddTensNumeric':{let m=prompt.match(/^(\d+)\s*\+\s*(\d+)\s*=/);if(m)return +m[1]+ +m[2];m=prompt.match(/A (\d+)-bead train gains (\w+) tens?/i);if(m)return +m[1]+tok(m[2])*10;m=prompt.match(/(\w+) tens and (\w+) ones gain (\w+) (?:more )?tens?/i);if(m)return tok(m[1])*10+tok(m[2])+tok(m[3])*10;m=prompt.match(/(\w+) tens? joins? (\w+) tens?/i);if(m)return tok(m[1])*10+tok(m[2])*10;m=prompt.match(/[Ww]hat is ten more than (\d+)/i);if(m)return +m[1]+10;m=prompt.match(/A box has (\d+) tiles and receives (\d+) more/i);if(m)return +m[1]+ +m[2];m=prompt.match(/[Ww]hat number lies (\w+) chart rows? below (\d+)/i);if(m)return +m[2]+tok(m[1])*10;m=prompt.match(/Keep (\w+) ones and increase (\w+) tens by (\w+) tens/i);if(m)return tok(m[2])*10+tok(m[1])+tok(m[3])*10;m=prompt.match(/chart marker moves (\w+) rows? down from (\d+)/i);if(m)return +m[2]+tok(m[1])*10;return opVal(prompt);}
 case'TnoTenMoreLessNumeric':{let m=prompt.match(/^(\d+)\s*[−-]\s*(\d+)\s*=/);if(m)return +m[1]- +m[2];m=prompt.match(/^(\d+)\s*\+\s*(\d+)\s*=/);if(m)return +m[1]+ +m[2];m=prompt.match(/[Ww]hat number has (\w+) fewer tens? than (\d+)/i);if(m)return +m[2]-tok(m[1])*10;m=prompt.match(/Move the tens digit of (\d+) up by (\w+)/i);if(m)return +m[1]+tok(m[2])*10;m=prompt.match(/A counter at (\d+) moves back (\w+) tens?/i);if(m)return +m[1]-tok(m[2])*10;m=prompt.match(/A counter at (\d+) moves forward (\w+) tens spaces?/i);if(m)return +m[1]+tok(m[2])*10;m=prompt.match(/A counter at (\d+) moves forward (\w+) spaces?/i);if(m)return +m[1]+tok(m[2]);m=prompt.match(/[Ww]hat number is (\w+) tens? less than (\d+)/i);if(m)return +m[2]-tok(m[1])*10;m=prompt.match(/[Ww]hich number is (\w+) tens? more than (\d+)/i);if(m)return +m[2]+tok(m[1])*10;m=prompt.match(/[Ww]hat number sits (\w+) chart rows? above (\d+)/i);if(m)return +m[2]-tok(m[1])*10;m=prompt.match(/[Ww]hich number is (\w+) chart rows? below (\d+)/i);if(m)return +m[2]+tok(m[1])*10;m=prompt.match(/Move (\w+) rows? up from (\d+)/i);if(m)return +m[2]-tok(m[1])*10;return opVal(prompt);}
 case'TnoBlocksNumeric':return 10*n[0]+n[1];
 case'TnoDigitValueNumeric':{const number=n[0],digit=n[1];return Math.floor(number/10)===digit?digit*10:digit}
 case'TnoExpandNumeric':return n[0]-n[1];
 case'TnoReadExpandedNumeric':return n[0]+n[1];
 case'TnoTenBundleNumeric':return n[0]*10;
 case'TnoTensOnesNumeric':return prompt.includes('tens')?Math.floor(n[0]/10):n[0]%10;
 }
 throw new Error(`no Grade 1 route ${form}: ${prompt}`)
}
module.exports={solvePrompt};
