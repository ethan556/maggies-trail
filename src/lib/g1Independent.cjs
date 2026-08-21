const nums=s=>[...s.matchAll(/\d+/g)].map(m=>+m[0]);
const exact=(opts,label)=>{const x=opts.find(o=>o===label);if(x===undefined)throw new Error(`missing option ${label}: ${opts.join(' | ')}`);return x};
const opVal=s=>{let m=s.match(/(\d+)\s*\+\s*(\d+)/);if(m)return +m[1]+ +m[2];m=s.match(/(\d+)\s*[−-]\s*(\d+)/);if(m)return +m[1]- +m[2];};
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
 case'BiggerFirstNumeric':case'CountOnSmallNumeric':case'CountingOnNumeric':return n[0]+n[1];
 case'BiggerFirstMcq':return exact(options,String(Math.max(n[0],n[1])));
 case'CompareNumeric':return n[0]-n[1];
 case'CompareMcq':return exact(options,`${n[0]} − ${n[1]} = ?`);
 case'CountBackMcq':return exact(options,String(n[1]-1));
 case'CountingOnMcq':return exact(options,`Start at ${n[0]} and count on ${n[1]}`);
 case'DifferenceMcq':return exact(options,`${n[0]} − ${n[1]}`);
 case'EqualSignMcq':return exact(options,opVal(prompt.split('=')[0])===Number(prompt.split('=')[1])?'True':'False');
 case'EqualSignNumeric':return n[0]+n[1]-n[2];
 case'FactFamilyNumeric':return n[3]-n[4];
 case'MakeTenFirstNumeric':return n[2]-n[1];
 case'MakeTenFirstMcq':{const a=n[0],b=n[1],need=10-a;return exact(options,`${need} and ${b-need}`)}
 case'PartWholeNumeric':return n[0]+n[1];
 case'PartWholeMcq':return exact(options,`${n[0]} − ${n[1]} = ?`);
 case'ResultUnknownNumeric':return /more arrive/.test(prompt)?n[0]+n[1]:n[0]-n[1];
 case'ResultUnknownMcq':return exact(options,`${n[0]} + ${n[1]} = ?`);
 case'SubFactsMcq':{const d=n[0]-n[1];return exact(options,`${n[1]} + ${d} = ${n[0]}`)}
 case'TakeAwayMcq':return exact(options,`Start with ${n[0]} and take away ${n[1]}`);
 case'TensPartnersNumeric':return 10-n[0];
 case'TensPartnersMcq':return options.find(x=>nums(x).slice(0,2).reduce((a,b)=>a+b,0)===10);
 case'UnknownNumeric':return prompt.includes('+')?n[1]-n[0]:n[0]-n[1];
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
 /* S326-R1: shape table extended with hexagon (6 sides/6 corners) and the article
    matcher widened to 'one <shape>' — covers the signed S320-IMPL-A13-g1s-01-03
    hexagon retarget and S320-IMPL-A13-g1s-03-02 decompose reframe; verified against
    every Smg1ShapeSidesNumeric prompt in the corpus. */
 case'Smg1ShapeSidesNumeric':{const sh=prompt.match(/(?:a|one) (triangle|square|rectangle|circle|hexagon)/)[1],tab={triangle:{sides:3,corners:3},square:{sides:4,corners:4},rectangle:{sides:4,corners:4},circle:{sides:0,corners:0},hexagon:{sides:6,corners:6}};return tab[sh][prompt.includes('corners')?'corners':'sides']}
 case'Smg1ShapeSidesMcq':{const sides=n[0],corners=n[1],map={'3,3':'Triangle','0,0':'Circle'};return exact(options,map[`${sides},${corners}`])}
 case'Smg1SolidPartsNumeric':{const sh=prompt.match(/a (cube|cone|cylinder|sphere)/)[1],tab={cube:{faces:6,edges:12},cone:{faces:1,edges:1},cylinder:{faces:2,edges:2},sphere:{faces:0,edges:0}};return tab[sh][prompt.includes('flat faces')?'faces':'edges']}
 case'Smg1SolidPartsMcq':return exact(options,'Cube');
 case'TnoAddTensNumeric':case'TnoTenMoreLessNumeric':return opVal(prompt);
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
