const nums=s=>[...s.matchAll(/\d+/g)].map(m=>+m[0]);
const exact=(opts,label)=>{const x=opts.find(o=>o===label);if(x===undefined)throw new Error(`missing option ${label}: ${opts.join(' | ')}`);return x};
const words1to99=n=>{const one=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];return n<20?one[n]:tens[Math.floor(n/10)]+(n%10?` ${one[n%10]}`:'')};
const words=n=>n<100?words1to99(n):`${words1to99(Math.floor(n/100))} hundred${n%100?` ${words1to99(n%100)}`:''}`;

const wordValue=s=>{const one={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};const xs=s.toLowerCase().replace(/[“”"]/g,'').trim().split(/\s+/);const total=0;let cur=0;for(const x of xs){if(x==='hundred'){cur*=100}else if(x in one)cur+=one[x];else if(x in tens)cur+=tens[x]}return total+cur};
// ONE_WORDS/wv: the fluency-20-g2 course (Fl*Numeric forms) restates most of its check/challenge
// steps as free-form English sentences with numbers spelled out ("Nine is mirrored by another
// nine") rather than digits, for surface variety across k1/k2/k3/ch1 — only k1 keeps the
// generator's own fixed "${a} + ${b} = ?" digit shape. wv() converts ONE spelled-out number word
// (singular or a regular/irregular plural, e.g. "sevens", "sixes") captured out of such a
// sentence; it deliberately does NOT treat "ones"/"tens" as place-value UNIT labels (see
// FlTenPlusNumeric below, which anchors on the quantifier word instead of scanning generically).
const ONE_WORDS={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
const wv=tok=>{if(tok==null)return undefined;const t=tok.toLowerCase();if(t in ONE_WORDS)return ONE_WORDS[t];if(t==='sixes')return 6;if(t.endsWith('s')&&(t.slice(0,-1) in ONE_WORDS))return ONE_WORDS[t.slice(0,-1)];return undefined};
// lastNum: the LAST digit-or-number-word mentioned, in reading order — used only by
// FlDoublesNumeric, whose four templates all name the doubled quantity last regardless of phrasing
// ("6 + 6 = ?" / "...another nine." / "...eight players each." / "...a pair of sevens?").
const lastNum=s=>{let last;for(const tok of s.match(/\d+|[A-Za-z]+/g)||[]){if(/^\d+$/.test(tok))last=+tok;else{const v=wv(tok);if(v!==undefined)last=v;}}return last};
function parse(input){const parts=input.split('||'),prompt=parts[0],raw=parts.slice(1).join('||');let options=[],state=null;if(raw){try{state=JSON.parse(raw)}catch{options=(parts[1]||'').split(';;').filter(Boolean)}}return{prompt,options,state,n:nums(prompt)}}
function arithmetic(prompt){let m=prompt.match(/(\d+)\s*\+\s*(\d+)/);if(m)return +m[1]+ +m[2];m=prompt.match(/(\d+)\s*[−-]\s*(\d+)/);if(m)return +m[1]- +m[2];}
// arithmetic2: static content for the arithmetic()-sharing forms (Add2DigitNumeric,
// Pv1000SubtractByPlaceNumeric, etc.) restates plenty of prompts as word problems with no literal
// "+"/"−" between the two digits, which arithmetic() cannot see. Each branch below is anchored to
// a distinct authored phrase (verified against the full corpus of these forms); the final blind
// fallback (first two digit-or-word numbers, summed) only ever fires once arithmetic() itself has
// already failed to find a bare equation, so no currently-agreeing prompt changes answer.
const mixedNums2=s=>{const out=[];for(const tok of s.match(/\d+|[A-Za-z]+/g)||[]){if(/^\d+$/.test(tok))out.push(+tok);else{const v=wv(tok);if(v!==undefined)out.push(v);}}return out};
function arithmetic2(prompt){let m=prompt.match(/[Cc]ombine (\d+) and (\d+)/);if(m)return +m[1]+ +m[2];
 m=prompt.match(/total (\d+)\.[^.]*final \w+ has (\d+)/i);if(m)return +m[1]+ +m[2];
 m=prompt.match(/two groups of (\d+)/i);if(m)return +m[1]*2;
 m=prompt.match(/doubles to (\d+)/i);if(m)return +m[1]/2;
 m=prompt.match(/(\d+) dots on one side and (\d+) on the other/i);if(m)return +m[1]+ +m[2];
 m=prompt.match(/Recombine (\d+) and the (\d+) left/i);if(m)return +m[1]+ +m[2];
 m=prompt.match(/resulting (\d+) tens/i);if(m)return +m[1]*10;
 m=prompt.match(/make (\d+) tens\W/i);if(m)return +m[1]*10;
 m=prompt.match(/number (\d+) has \d+ ones\. Add (\d+) single ones/i);if(m)return +m[1]+ +m[2];
 m=prompt.match(/Write (\d+) as \d+ tens and \d+ ones?,? then add (\d+) ones/i);if(m)return +m[1]+ +m[2];
 m=prompt.match(/Split (\d+) and (\d+) by place/i);if(m)return +m[1]+ +m[2];
 m=prompt.match(/start(?:s)? at (\d+)[^\d]*land\w*[^\d]*(\d+)/i);if(m)return Math.abs(+m[1]- +m[2]);
 const viaArithmetic=arithmetic(prompt);if(viaArithmetic!==undefined)return viaArithmetic;
 const t=mixedNums2(prompt);if(t.length>=2)return t[0]+t[1];
}
function solvePrompt(form,input){const {prompt,options,state,n}=parse(input);
 if(form==='OddEvenOddEvenPairs')return n[0]%2?'odd':'even';
 if(form==='MmtCoinReverseMoneyBoard'){const total=n[0],cents=/penn/.test(prompt)?1:/nickel/.test(prompt)?5:/dime/.test(prompt)?10:25;return {[cents]:total/cents};}
 if(form==='Ssg2NameAnyTapDiagram'){const sides=n[0],map={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'};return [map[sides]];}
 if(form==='Ssg2PyramidTapDiagram')return ['square pyramid'];
 if(form==='Ssg2NameThirdFractionBar')return {n:1,d:3};
 if(form==='Pv1000WriteWordsBuildExpression')return words(n[0]).split(' ');
 // S329 recon: matchPairs forms carry no numeric/mcq answer field to check against, so (like g0's
 // shapeComposePairs precedent) the route re-parses the -joined left labels straight out of
 // the raw check() input and re-derives the pairing rule stated in the widget's own feedback text
 // ("close, not exact") -- each real length's good estimate is real+1 inches -- independent of the
 // generator's internal `estimates=reals.map(n=>n+1)` line.
 if(form==='MmtEstimateMatchPairs'){const left=(input.split('||')[1]||'').split('').filter(Boolean);const out={};for(const label of left){const m=label.match(/about (\d+) inches/);out[label]=`${+m[1]+1} inches`;}return out;}
 switch(form){
 case'FlDoublesNumeric':return lastNum(prompt)*2;
 case'FlNearDoublesNumeric':{
  let m=prompt.match(/(\w+) plus (\w+)/i);
  if(m){const a=wv(m[1]),b=wv(m[2]);if(a!==undefined&&b!==undefined)return a+b;}
  m=prompt.match(/beyond double (\w+)/i);
  if(m)return wv(m[1])*2+1;
  m=prompt.match(/^(\d+) \+ (\d+) = \?/);
  if(m)return +m[1]+ +m[2];
  throw new Error('FlNearDoublesNumeric: '+prompt);
 }
 case'FlMakeTenNumeric':{
  let m=prompt.match(/^(\d+) \+ (\d+) = \? \(Make ten first\.\)/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/combine (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/(\w+) takes one from (\w+) to complete ten/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/[Ss]plit (\w+) so (\w+) first reaches ten/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('FlMakeTenNumeric: '+prompt);
 }
 case'FlTenPlusNumeric':{
  let m=prompt.match(/^10 \+ (\d+) = \?/);
  if(m)return 10+ +m[1];
  m=prompt.match(/joins (\w+) extra ones/i);
  if(m)return 10+wv(m[1]);
  m=prompt.match(/ten and (\w+) ones/i);
  if(m)return 10+wv(m[1]);
  m=prompt.match(/ten with (\w+) ones/i);
  if(m)return 10+wv(m[1]);
  throw new Error('FlTenPlusNumeric: '+prompt);
 }
 case'FlSums12Numeric': case'FlSums16Numeric': case'FlSums20Numeric':{
  let m=prompt.match(/^(\d+) \+ (\d+) = \?/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/pair of (\w+) forms which sum/i);
  if(m)return wv(m[1])*2;
  m=prompt.match(/combine (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/[Cc]ount on (\w+) from (\w+)/i);
  if(m)return wv(m[2])+wv(m[1]);
  m=prompt.match(/[Bb]ridge through ten to add (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/gives one to make ten\. Combine the (\w+) left over/i);
  if(m){const first=wv(prompt.match(/^(\w+)/)[1]);return first+wv(m[1]);}
  m=prompt.match(/double made by two (\w+)/i);
  if(m)return wv(m[1])*2;
  m=prompt.match(/neighbor just below double (\w+)/i);
  if(m)return wv(m[1])*2-1;
  m=prompt.match(/full ten joins (\w+) more/i);
  if(m)return 10+wv(m[1]);
  m=prompt.match(/[Rr]emove (\w+) from double (\w+) to evaluate/i);
  if(m)return wv(m[2])*2-wv(m[1]);
  throw new Error('FlSums12/16/20Numeric: '+prompt);
 }
 case'FlFromTenNumeric':{
  let m=prompt.match(/^10 [−-] (\d+) = \?/);
  if(m)return 10- +m[1];
  m=prompt.match(/(\w+) is one part of ten/i);
  if(m)return 10-wv(m[1]);
  m=prompt.match(/[Tt]en loses a group of (\w+)/i);
  if(m)return 10-wv(m[1]);
  m=prompt.match(/after (\w+) is removed from ten/i);
  if(m)return 10-wv(m[1]);
  throw new Error('FlFromTenNumeric: '+prompt);
 }
 case'FlAcrossTenNumeric':{
  let m=prompt.match(/^(\d+) [−-] (\d+) = \?/);
  if(m)return +m[1]- +m[2];
  m=prompt.match(/[Tt]ake (\w+) from (\w+) to reach ten, then take (\w+) more/i);
  if(m)return wv(m[2])-wv(m[1])-wv(m[3]);
  m=prompt.match(/[Ff]rom (\w+), remove (\w+) to reach ten and (\w+) more afterward/i);
  if(m)return wv(m[1])-wv(m[2])-wv(m[3]);
  m=prompt.match(/[Hh]alf of (\w+) is removed/i);
  if(m)return Math.floor(wv(m[1])/2);
  throw new Error('FlAcrossTenNumeric: '+prompt);
 }
 case'FlThinkAdditionNumeric':{
  let m=prompt.match(/^(\d+) [−-] (\d+) = \? Think:/);
  if(m)return +m[1]- +m[2];
  m=prompt.match(/(\w+) and which partner make a whole of (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  m=prompt.match(/(\w+) plus a hidden part rebuilds (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  m=prompt.match(/must join (\w+) to make (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  throw new Error('FlThinkAdditionNumeric: '+prompt);
 }
 case'FlFactFamilyNumeric':{
  let m=prompt.match(/what is (\d+) [−-] (\d+)\?/);
  if(m)return +m[1]- +m[2];
  m=prompt.match(/what is (\d+) \+ (\d+)\?/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/parts (\w+) and (\w+)\. [Rr]emove (\w+) from (?:their|the) whole/i);
  if(m)return (wv(m[1])+wv(m[2]))-wv(m[3]);
  m=prompt.match(/family uses (\w+), (\w+), and (\w+)\. [Rr]emove (\w+) from the whole/i);
  if(m){const a=wv(m[1]),b=wv(m[2]),c=wv(m[3]);return Math.max(a,b,c)-wv(m[4]);}
  m=prompt.match(/parts (\w+) and (\w+) with whole (\w+), subtract (\w+)/i);
  if(m)return wv(m[3])-wv(m[4]);
  throw new Error('FlFactFamilyNumeric: '+prompt);
 }
 case'FlMissingNumeric':{
  let m=prompt.match(/^(\d+) \+ \? = (\d+)/);
  if(m)return +m[2]- +m[1];
  m=prompt.match(/whole is (\w+) and one part is (\w+)/i);
  if(m)return wv(m[1])-wv(m[2]);
  m=prompt.match(/whole of (\w+) contains a known part of (\w+)/i);
  if(m)return wv(m[1])-wv(m[2]);
  m=prompt.match(/(\w+) joins an unknown part to make (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  throw new Error('FlMissingNumeric: '+prompt);
 }
 case'FlSpeedAddNumeric':{
  let m=prompt.match(/^Answer fast: (\d+) \+ (\d+) = \?/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/what total belongs to (\w+) plus (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/[Rr]ecall the sum of (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/combine (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('FlSpeedAddNumeric: '+prompt);
 }
 case'FlSpeedSubNumeric':{
  let m=prompt.match(/^Answer fast: (\d+) [−-] (\d+) = \?/);
  if(m)return +m[1]- +m[2];
  m=prompt.match(/whole of (\w+) loses a part of (\w+)/i);
  if(m)return wv(m[1])-wv(m[2]);
  m=prompt.match(/difference remains when (\w+) is removed from (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  m=prompt.match(/(\w+) is taken from (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  throw new Error('FlSpeedSubNumeric: '+prompt);
 }
 case'Add2DigitNumeric':case'AddOnesNumeric':case'AddTensNumeric':case'DoublesNumeric':case'Fluency20Numeric':case'NearDoublesNumeric':case'ParitySumNumeric':case'RegroupAddNumeric':case'Pv1000AddByPlaceNumeric':case'Pv1000AddTradeNumeric':case'Pv1000RealworldNumeric':case'Pv1000SubtractByPlaceNumeric':case'Pv1000SubtractTradeNumeric':return arithmetic2(prompt);
 case'Add2DigitMcq':{const a=n[0],b=n[1],tens=Math.floor(a/10)*10+Math.floor(b/10)*10,ones=a%10+b%10;
  const bare=`${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} and ${a%10} + ${b%10}`;if(options.includes(bare))return bare;
  const paren=`(${Math.floor(a/10)*10} + ${Math.floor(b/10)*10}) and (${a%10} + ${b%10})`;if(options.includes(paren))return paren;
  return exact(options,`Tens make ${tens} and ones make ${ones}`)}
 case'AddOnesMcq':case'AddTensMcq':case'SubOnesMcq':case'SubTensMcq':return exact(options,String(arithmetic(prompt)));
 case'ChooseStepsNumeric':case'TwoStepTradeNumeric':return n[0]-n[1]+n[2];
 case'ChooseStepsMcq':return options.find(x=>x.startsWith(`${n[0]} − ${n[1]} =`));
 case'DoublesMcq':return options.find(x=>{const z=nums(x);return z.length>=2&&z[0]===z[1]&&x.includes('+')});
 case'Fluency20Mcq':{const a=n[0],b=n[1],left=b-(10-a);return exact(options,`Make 10, then add ${left}`)}
 case'NearDoublesMcq':return exact(options,`${n[0]} + ${n[0]}`);
 case'OddEvenMcq':return options.find(x=>Number(x)%2===0);
 case'ParitySumMcq':return exact(options,'even');
 case'Sub2DigitMcq':{const a=n[0],b=n[1];return exact(options,`${Math.floor(a/10)*10} − ${Math.floor(b/10)*10} and ${a%10} − ${b%10}`)}
 case'TwoStepTradeMcq':return exact(options,'Break one ten into 10 ones');
 case'UnbundleSubMcq':return exact(options,'When the top ones are fewer than the bottom ones');
 case'MmtBarGraphNumeric':return n[0];
 case'MmtBarGraphMistakeMcq':return exact(options,`No — the value is ${n[0]}`);
 case'MmtBestUnitMcq':case'MmtUnitFitMcq':{const item=(prompt.match(/length of a ([^?]+)/)||[])[1];const map={pencil:'inches',hallway:'feet',crayon:'centimeters',classroom:'meters',hand:'inches',playground:'yards','paper clip':'centimeters'};return exact(options,map[item]);}
 case'MmtCoinNameMcq':{const map={1:'penny',5:'nickel',10:'dime',25:'quarter'};return exact(options,map[n[0]])}
 case'MmtEstimateMcq':return exact(options,`${n[0]} inches`);
 case'MmtGraphCompareNumeric':return n[1]-n[0];
 case'MmtLengthCompareMcq':{const tuples=[...prompt.matchAll(/The ([a-z ]+) is (\d+) inches/g)].map(m=>[m[1],+m[2]]);const wanted=prompt.includes('longest')?Math.max(...tuples.map(x=>x[1])):Math.min(...tuples.map(x=>x[1]));return exact(options,tuples.find(x=>x[1]===wanted)[0]);}
 case'MmtLengthDifferenceNumeric':return n[0]-n[1];
 case'MmtLinePlotNumeric':return n[0];
 case'MmtPictureGraphRead':return n[0];
 case'MmtRulerReadNumeric':case'MmtRulerSubtractNumeric':return n[1]-n[0];
 case'MmtSkip5sNumeric':return n[0]*5;
 case'Pv1000BuildNumberNumeric':case'Pv1000TradingNumeric':return 100*n[0]+10*n[1]+n[2];
 case'Pv1000CountForwardNumeric':return n[0]+n[1]*n[2];
 case'Pv1000DigitWorthNumeric':{const number=n[0],digit=n[1],place=(prompt.match(/in the (hundreds|tens|ones) place/)||[])[1];return digit*(place==='hundreds'?100:place==='tens'?10:1)}
 case'Pv1000MixedNumeric':if(prompt.startsWith('What number has'))return 100*n[0]+10*n[1]+n[2];else {const place=(prompt.match(/in the (hundreds|tens|ones) place/)||[])[1];return n[1]*(place==='hundreds'?100:place==='tens'?10:1)}
 case'Pv1000OrderMixedMcq':return exact(options,n[0]<n[1]?'<':n[0]>n[1]?'>':'=');
 case'Pv1000OrderMixedNumeric':case'Pv1000ReadWordsNumeric':{const m=prompt.match(/[“"]([^”"]+)[”"]/);return wordValue(m[1]);}
 case'Pv1000SkipFivesNumeric':return n[n.length-1]+5;
 case'Pv1000SkipHundredsNumeric':return n[n.length-1]+100;
 case'Pv1000SkipTensNumeric':return n[n.length-1]+10;
 case'Ssg2CompareSharesMcq':{const q=prompt.includes('smaller'),names=[...prompt.matchAll(/a (half|third|fourth)/g)].map(m=>m[1]),den={half:2,third:3,fourth:4},target=q?Math.max(...names.map(x=>den[x])):Math.min(...names.map(x=>den[x]));return exact(options,`a ${Object.keys(den).find(k=>den[k]===target)}`)}
 case'Ssg2GridApplyNumeric':case'Ssg2GridApplyRead':return n[0]*n[1];
 case'Ssg2NameAnyMcq':case'Ssg2ShapeVocabMcq':{const map={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'};return exact(options,map[n[0]])}
 case'Ssg2NameThirdMcq':return exact(options,n[0]===2?'a half':'a third');
 case'Ssg2PyramidNumeric':{const tri=prompt.includes('triangular');return prompt.includes('edges')?(tri?6:8):(tri?4:5);}
 case'Ssg2ShapeVocabNumeric':{const map={triangle:3,quadrilateral:4,pentagon:5,hexagon:6,heptagon:7,octagon:8},name=(prompt.match(/a (\w+)/)||[])[1];return map[name]}
 case'Ssg2ThirdsCountMcq':return exact(options,prompt.includes('equal pieces')?'Yes':'No');
 case'Ssg2ThirdsCountNumeric':return 3;
 }
 throw new Error(`no Grade 2 route ${form}: ${prompt}`)
}
module.exports={solvePrompt};
