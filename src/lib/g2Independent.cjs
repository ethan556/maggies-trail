const nums=s=>[...s.matchAll(/\d+/g)].map(m=>+m[0]);
const exact=(opts,label)=>{const x=opts.find(o=>o===label);if(x===undefined)throw new Error(`missing option ${label}: ${opts.join(' | ')}`);return x};
const words1to99=n=>{const one=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];return n<20?one[n]:tens[Math.floor(n/10)]+(n%10?` ${one[n%10]}`:'')};
const words=n=>n<100?words1to99(n):`${words1to99(Math.floor(n/100))} hundred${n%100?` ${words1to99(n%100)}`:''}`;

const wordValue=s=>{const one={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};const xs=s.toLowerCase().replace(/[“”"]/g,'').trim().split(/\s+/);const total=0;let cur=0;for(const x of xs){if(x==='hundred'){cur*=100}else if(x in one)cur+=one[x];else if(x in tens)cur+=tens[x]}return total+cur};
function parse(input){const parts=input.split('||'),prompt=parts[0],raw=parts.slice(1).join('||');let options=[],state=null;if(raw){try{state=JSON.parse(raw)}catch{options=(parts[1]||'').split(';;').filter(Boolean)}}return{prompt,options,state,n:nums(prompt)}}
function arithmetic(prompt){let m=prompt.match(/(\d+)\s*\+\s*(\d+)/);if(m)return +m[1]+ +m[2];m=prompt.match(/(\d+)\s*[−-]\s*(\d+)/);if(m)return +m[1]- +m[2];}
function solvePrompt(form,input){const {prompt,options,state,n}=parse(input);
 if(form==='OddEvenOddEvenPairs')return n[0]%2?'odd':'even';
 if(form==='MmtCoinReverseMoneyBoard'){const total=n[0],cents=/penn/.test(prompt)?1:/nickel/.test(prompt)?5:/dime/.test(prompt)?10:25;return {[cents]:total/cents};}
 if(form==='Ssg2NameAnyTapDiagram'){const sides=n[0],map={3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'};return [map[sides]];}
 if(form==='Ssg2PyramidTapDiagram')return ['square pyramid'];
 if(form==='Ssg2NameThirdFractionBar')return {n:1,d:3};
 if(form==='Pv1000WriteWordsBuildExpression')return words(n[0]).split(' ');
 switch(form){
 case'FlDoublesNumeric':{const m=prompt.match(/^(\d+) \+ (\d+) = \?/);return +m[1]+ +m[2];}
 case'FlNearDoublesNumeric':{const m=prompt.match(/^(\d+) \+ (\d+) = \?/);return +m[1]+ +m[2];}
 case'FlMakeTenNumeric':{const m=prompt.match(/^(\d+) \+ (\d+) = \?/);return +m[1]+ +m[2];}
 case'FlTenPlusNumeric':{const m=prompt.match(/^10 \+ (\d+) = \?/);return 10+ +m[1];}
 case'FlSums12Numeric': case'FlSums16Numeric': case'FlSums20Numeric':{const m=prompt.match(/^(\d+) \+ (\d+) = \?/);return +m[1]+ +m[2];}
 case'FlFromTenNumeric':{const m=prompt.match(/^10 [−-] (\d+) = \?/);return 10- +m[1];}
 case'FlAcrossTenNumeric':{const m=prompt.match(/^(\d+) [−-] (\d+) = \?/);return +m[1]- +m[2];}
 case'FlThinkAdditionNumeric':{const m=prompt.match(/^(\d+) [−-] (\d+) = \?/);return +m[1]- +m[2];}
 case'FlFactFamilyNumeric':{let m=prompt.match(/what is (\d+) [−-] (\d+)\?/);if(m)return +m[1]- +m[2];m=prompt.match(/what is (\d+) \+ (\d+)\?/);if(m)return +m[1]+ +m[2];throw new Error('FlFactFamilyNumeric: '+prompt);}
 case'FlMissingNumeric':{const m=prompt.match(/^(\d+) \+ \? = (\d+)/);return +m[2]- +m[1];}
 case'FlSpeedAddNumeric':{const m=prompt.match(/(\d+) \+ (\d+) = \?/);return +m[1]+ +m[2];}
 case'FlSpeedSubNumeric':{const m=prompt.match(/(\d+) [−-] (\d+) = \?/);return +m[1]- +m[2];}
 case'Add2DigitNumeric':case'AddOnesNumeric':case'AddTensNumeric':case'DoublesNumeric':case'Fluency20Numeric':case'NearDoublesNumeric':case'ParitySumNumeric':case'RegroupAddNumeric':case'Pv1000AddByPlaceNumeric':case'Pv1000AddTradeNumeric':case'Pv1000RealworldNumeric':case'Pv1000SubtractByPlaceNumeric':case'Pv1000SubtractTradeNumeric':return arithmetic(prompt);
 case'Add2DigitMcq':{const a=n[0],b=n[1];return exact(options,`${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} and ${a%10} + ${b%10}`)}
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
 case'MmtBestUnitMcq':case'MmtUnitFitMcq':{const item=(prompt.match(/length of a ([^?]+)/)||[])[1];const map={pencil:'inches',hallway:'feet',crayon:'centimeters',classroom:'meters',hand:'inches',playground:'yards','paper clip':'centimeters'};return exact(options,map[item]);}
 case'MmtCoinNameMcq':{const map={1:'penny',5:'nickel',10:'dime',25:'quarter'};return exact(options,map[n[0]])}
 case'MmtEstimateMcq':return exact(options,`${n[0]} inches`);
 case'MmtGraphCompareNumeric':return n[1]-n[0];
 case'MmtLengthCompareMcq':{const tuples=[...prompt.matchAll(/The ([a-z ]+) is (\d+) inches/g)].map(m=>[m[1],+m[2]]);const wanted=prompt.includes('longest')?Math.max(...tuples.map(x=>x[1])):Math.min(...tuples.map(x=>x[1]));return exact(options,tuples.find(x=>x[1]===wanted)[0]);}
 case'MmtLengthDifferenceNumeric':return n[0]-n[1];
 case'MmtLinePlotNumeric':return n[0];
 case'MmtPictureGraphNumeric':return n[0];
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
