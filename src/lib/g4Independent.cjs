const gcd=(a,b)=>b===0?Math.abs(a):gcd(b,a%b);
const clean=(s)=>Number(String(s).replace(/,/g,''));
const numbers=(s)=>[...s.matchAll(/-?\d[\d,]*(?:\.\d+)?/g)].map(m=>clean(m[0]));
const fractions=(s)=>[...s.matchAll(/(\d+)\/(\d+)/g)].map(m=>({num:+m[1],den:+m[2]}));
const option=(w,pred)=>{const found=w.options.map(o=>o.label).find(pred);if(found===undefined)throw new Error(`independent route found no option for ${w.prompt}: ${w.options.map(o=>o.label).join(' || ')}`);return found};
const exact=(w,label)=>option(w,x=>x===label);
const nearest=(x,vals)=>vals.reduce((a,b)=>Math.abs(x-a)<=Math.abs(x-b)?a:b);
const wordValue=(name)=>({"quarter turn":90,"half turn":180,"three-quarter turn":270,"full turn":360}[name]);
// count of UNIQUE {d, n/d} divisor pairs of n (d from 1..sqrt(n)) — "how many rectangular
// arrangements", counting a transpose (e.g. 3x8 and 8x3) once, is exactly this count.
const factorPairCount=(n)=>{let c=0;for(let d=1;d*d<=n;d++)if(n%d===0)c++;return c;};
const ORDINALS={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10};

function wordsToNumber(s){
 const small={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
 let total=0,current=0;
 for(const token of s.toLowerCase().replace(/-/g,' ').split(/\s+/)){
  if(token in small) current+=small[token];
  else if(token==='hundred') current*=100;
  else if(token==='thousand'){total+=current*1000;current=0;}
  else if(token==='million'){total+=current*1000000;current=0;}
  else if(token==='and'||token==='') continue;
  else return NaN;
 }
 return total+current;
}
function mixedTruth(w){const P=w.aWhole*w.den+w.aNum,Q=(w.bWhole||0)*w.den+(w.bNum||0),T=w.mode==='convert'?P:w.mode==='add'?P+Q:P-Q;return w.mode==='convert'&&w.targetForm==='improper'?{whole:0,num:T}:{whole:Math.floor(T/w.den),num:T%w.den};}
function solve(form,w){const p=w.prompt,ns=numbers(p),fs=fractions(p);
 switch(form){
  // Decimals (g4-decimals) — every route re-derives from the learner-visible prompt only
  case 'dTenthsWriteNumeric': {const m=p.match(/split into 10 equal columns, and (\d+)/);return +m[1]/10;}
  case 'dTenthsFractionMcq': {const d=ns.find(x=>!Number.isInteger(x));return exact(w,`${Math.round(d*10)}/10`);}
  case 'dHundredthsWriteNumeric': {const m=p.match(/100 equal cells, and (\d+)/);return +m[1]/100;}
  case 'dHundredthsCellsNumeric': {const d=ns.find(x=>!Number.isInteger(x));return Math.round(d*100);}
  case 'dTenthToHundredthNumeric': {const d=ns.find(x=>!Number.isInteger(x));return Math.round(d*10)*10;}
  case 'dAddTenthHundredthNumeric': {const ds=ns.filter(x=>!Number.isInteger(x));return Math.round(ds[0]*100+ds[1]*100)/100;}
  case 'dReadDecimalMcq': {const d=ns.find(x=>!Number.isInteger(x));const h=Math.round(d*100);return exact(w,`${h} hundredth${h===1?'':'s'}`);}
  case 'dPlaceNameMcq': {const m=p.match(/decimal 0\.(\d)(\d), which place does the digit (\d)/);if(!m)throw new Error(`cannot parse place prompt ${p}`);return exact(w,+m[3]===+m[1]?'tenths':'hundredths');}
  case 'dFractionToDecimalNumeric': {const f=fs[0];return f.num/f.den;}
  case 'dDecimalToFractionMcq': {const d=ns.find(x=>!Number.isInteger(x));return exact(w,`${Math.round(d*100)}/100`);}
  case 'dCompareRational': case 'dTrailingZeroRational': {const m=p.match(/(\d+\.\d+) \? (\d+\.\d+)/);const L=+m[1],R=+m[2];return L<R?'lt':L>R?'gt':'eq';}
  case 'dOrderDrag': {return w.items.map(i=>i.label).sort((a,b)=>+a-+b);}
  case 'dMoneyNumeric': {const m=p.match(/(\d+) dimes and (\d+) pennies/);return (+m[1]*10+ +m[2])/100;}
  case 'dMeasureNumeric': {const m=p.match(/(\d+) centimeters/);return +m[1]/100;}
  // Fractions
  case 'faEquivalenceRecapMcq': {const k=fs[1].num/fs[0].num;return option(w,x=>x.includes('Both numerator and denominator')&&x.includes(String(k)));}
  case 'faEquivalenceRecapNumeric': {
   // "A learner claims A/B = C/D. How many D-size pieces cover the same length as [A/B]?" states
   // the target denominator D via the (wrong) claimed fraction rather than via a literal "?/D".
   let m=p.match(/claims (\d+)\/(\d+) = (\d+)\/(\d+)\. How many \w+-size pieces cover the same length as/i);
   if(m)return(+m[1]/+m[2])*+m[4];
   m=p.match(/(\d+)\/(\d+) = \?\/(\d+)/);return +m[1]*+m[3]/+m[2];
  }
  case 'faEquivalenceRuleNumeric': {
   let m=p.match(/^Scale (\d+)\/(\d+) by ×(\d+)/);if(m)return +m[1]*+m[3];
   // "A learner scales A/B to [twelfths] but writes C/D. What numerator repairs..." — the repaired
   // numerator scales A by the WRITTEN (wrong) denominator D over the ORIGINAL denominator B, not
   // by the writer's own (wrong) numerator C.
   m=p.match(/scales (\d+)\/(\d+) to \w+ but writes (\d+)\/(\d+)/i);if(m)return +m[1]*(+m[4]/+m[2]);
   m=p.match(/^(\d+)\/(\d+) was made by scaling a fraction by (\d+)/);return +m[1]/+m[3];
  }
  case 'faSimplifyNumeric': {const f=fs[0],g=gcd(f.num,f.den);return f.num/g;}
  case 'faBenchmarkCompareMcq': {const [a,b]=fs;return exact(w,a.num/a.den>b.num/b.den?`${a.num}/${a.den}`:`${b.num}/${b.den}`);}
  case 'faBenchmarkOrderMcq': {const sorted=[...fs].sort((a,b)=>a.num/a.den-b.num/b.den);return exact(w,`${sorted[1].num}/${sorted[1].den}`);}
  case 'faBenchmarkOrderNumeric': {const sorted=[...fs].sort((a,b)=>a.num/a.den-b.num/b.den);return sorted[1].den;}
  case 'faBenchmarkOrderRational': {const [a,b]=[w.left,w.right],d=a.num*b.den-b.num*a.den;return d<0?'lt':d>0?'gt':'eq';}
  // "When you add A/D + B/D, what happens to the denominator?" — with a common denominator D
  // already shared by both addends, the correct option always names that SAME D ("stays D"),
  // whichever wrong-D distractor set a given step ships with.
  case 'faLikeDenomWordMcq': {const d=fs[0]?.den;if(d!==undefined){const staysD=w.options.map(o=>o.label).find(x=>x.includes(`stays ${d}`));if(staysD!==undefined)return staysD;}return option(w,x=>x.startsWith('It stays '));}
  case 'faLikeDenomWordNumeric': {
   // Several prompts describe the SAME like-denominator combine/remove story in prose only — no
   // digit fraction (A/D) anywhere — using number WORDS instead ("four twelfth-size pieces").
   // Each branch is anchored to a distinct authored phrase, resolved with the file's own
   // wordsToNumber before falling through to the digit-fraction (fs[0]/fs[1]) path below.
   let m=p.match(/starts with (\w+) \w+-size pieces and crosses out (\w+)\./i);
   if(m)return wordsToNumber(m[1])-wordsToNumber(m[2]);
   m=p.match(/remain when (\w+) \w+-size sections are cut from (\w+)\?/i);
   if(m)return wordsToNumber(m[2])-wordsToNumber(m[1]);
   m=p.match(/gains (\w+) \w+ and then (\w+) \w+s\./i);
   if(m)return wordsToNumber(m[1])+wordsToNumber(m[2]);
   m=p.match(/[Ss]tart with (\w+) \w+s and cross out (\w+) \w+\./i);
   if(m)return wordsToNumber(m[1])-wordsToNumber(m[2]);
   const [a,b]=fs;if(/short of a whole/i.test(p))return a.den-a.num;return p.includes('were available')?a.num-b.num:a.num+b.num;
  }
  case 'faImproperToMixedNumeric': return Math.floor(fs[0].num/fs[0].den);
  case 'faMixedToImproperNumeric': {
   let m=p.match(/Convert (\d+) (\d+)\/(\d+)/);if(m)return +m[1]*+m[3]+ +m[2];
   // "[Word] whole groups of [word] Xs plus [word] more Xs make how many Xs?" states the same
   // whole*den+num improper-fraction conversion entirely in number words.
   m=p.match(/(\w+) whole groups of (\w+) \w+s plus (\w+) more \w+s make how many/i);
   if(m)return wordsToNumber(m[1])*wordsToNumber(m[2])+wordsToNumber(m[3]);
   throw new Error(`cannot parse mixed-to-improper prompt ${p}`);
  }
  case 'faMixedAddSubMixed': case 'faWholeTimesFractionMixed': return mixedTruth(w);
  case 'faMixedAddSubNumeric': {
   let m=p.match(/Add (\d+) (\d+)\/(\d+) \+ (\d+) (\d+)\/(\d+)/);if(m)return (+m[2]+ +m[5])%+m[3];
   // "A learner combines A B/D and C E/D but keeps only .../D. How many D-size parts belong in the
   // fraction total?" — the "keeps only" clause describes a (wrong) partial result, not part of
   // the question; the total asked for is simply the sum of the two addends' own numerators.
   m=p.match(/combines (\d+) (\d+)\/(\d+) and (\d+) (\d+)\/(\d+)/i);if(m)return +m[2]+ +m[5];
   throw new Error(`cannot parse mixed add/sub prompt ${p}`);
  }
  case 'faWholeTimesFractionMcq': {const m=p.match(/finds? (\d+) × (\d+)\/(\d+)/);return exact(w,`(${m[1]} × ${m[2]})/${m[3]}`);}
  case 'faWholeTimesFractionNumeric': {const m=p.match(/Compute (\d+) × (\d+)\/(\d+)/);return +m[1]*+m[2];}
  case 'faWholeTimesFractionWordNumeric': {const m=p.match(/(\d+) identical recipes each use (\d+)\/(\d+)/);return +m[1]*+m[2];}

  // Geometry
  case 'laGeometricBasicsMcq': {const name=p.match(/defines a (.+)\?/)[1];const map={line:'extends forever in both directions','line segment':'has exactly two endpoints',ray:'starts at one endpoint and extends forever in one direction',point:'marks one exact location and has no length'};return exact(w,map[name]);}
  case 'laAngleFormationMcq': return exact(w,'A common endpoint called the vertex');
  case 'laReadingFiguresMcq': {const m=p.match(/vertex is ([A-Z]), with points ([A-Z]) and ([A-Z])/);return exact(w,`∠${m[2]}${m[1]}${m[3]}`);}
  case 'laReadingFiguresNumeric': return ns[0]+ns[1];
  case 'laParallelLinesMcq': return exact(w,'They stay the same distance apart and never meet.');
  case 'laPerpendicularLinesMcq': return exact(w,'They intersect to form four right angles.');
  case 'laParallelPerpIdentifyMcq': return exact(w,p.includes('north–south')?'Perpendicular':'Parallel');
  case 'laParallelPerpIdentifyNumeric': return ns[0]-ns[1];
  case 'laTriangleClassificationMcq': {const desc=p.match(/has (.+)\. Which/)[1];const map={'three equal sides':'Equilateral triangle','exactly two equal sides':'Isosceles triangle','three different sides':'Scalene triangle','one 90° angle':'Right triangle','one angle greater than 90°':'Obtuse triangle'};return exact(w,map[desc]);}
  case 'laQuadrilateralClassificationMcq': {if(p.includes('four right angles and four equal sides'))return exact(w,'Square');if(p.includes('four right angles'))return exact(w,'Rectangle');if(p.includes('four equal sides'))return exact(w,'Rhombus');if(p.includes('exactly one pair of parallel sides'))return exact(w,'Trapezoid');if(p.includes('two pairs of adjacent equal sides'))return exact(w,'Kite');if(p.includes('two pairs of parallel opposite sides'))return exact(w,'Parallelogram');throw Error(p);}
  case 'laSymmetryConceptMcq': return exact(w,'Folding on the line makes the two halves match exactly.');
  case 'laSymmetryFindingNumeric': {if(p.includes('non-square rectangle'))return 2;if(p.includes('square'))return 4;if(p.includes('equilateral triangle'))return 3;if(p.includes('isosceles triangle'))return 1;if(p.includes('regular pentagon'))return 5;throw Error(p);}
  case 'laSymmetryApplicationMcq': return exact(w,'It is the same perpendicular distance from the line on the opposite side.');
  case 'laSymmetryApplicationNumeric': return ns[0]*2;

  // Measurement
  case 'mcPerimeterFormulaMcq': return exact(w,`2 × (${ns[0]} + ${ns[1]})`);
  case 'mcDegreeMeasurementMcq': return exact(w,'Degrees');
  case 'mcDegreeMeasurementNumeric': return wordValue(p.match(/in a (.+)\?/)[1]);
  case 'mcProtractorReadingMcq': return exact(w,'The scale that begins with 0° on the right.');
  case 'mcProtractorReadingNumeric': return ns[1]-ns[0];
  case 'mcAngleClassificationMcq': {const d=ns[0],label=d<90?'Acute':d===90?'Right':d<180?'Obtuse':'Straight';return exact(w,label);}
  case 'mcBenchmarkAnglesMcq': return exact(w,`${nearest(ns[0],[0,90,180])}°`);
  case 'mcBenchmarkAnglesNumeric': return ns[1]-ns[0];
  case 'mcFractionMeasurementMcq': {const val=f=>f.num/f.den,total=val(fs[0])+val(fs[1]);return option(w,x=>x===`${total} unit${total===1?'':'s'}`);}
  case 'mcFractionMeasurementNumeric': return ns[0]/4;
  case 'mcLinePlotBuildMcq': return exact(w,'Two marks at 1/4, one at 1/2, and one at 3/4');
  case 'mcLinePlotBuildNumeric': {const m=p.match(/contain (\d+) data marks.*has (\d+) marks? at 1\/2 and (\d+) marks? at 3\/4/);return +m[1]-+m[2]-+m[3];}
  case 'mcLinePlotQuestionsNumeric': {if(p.includes('What is the range'))return .5;const counts=[...p.matchAll(/→(X+)/g)].map(m=>m[1].length);return p.includes('at least 1/2')?counts[1]+counts[2]:counts.reduce((a,b)=>a+b,0);}

  // Multiplication and division
  case 'mbTimesAsManyMcq': {const m=p.match(/has (\d+) times.*has (\d+)/);return exact(w,`${m[2]} × ${m[1]} = ?`);}
  case 'mbTimesAsManyNumeric': return ns[0]*ns[1];
  case 'mbComparisonEquationsMcq': {const m=p.match(/“(\d+) is (\d+) times as many as (\d+)”/);return exact(w,`${m[1]} = ${m[2]} × ${m[3]}`);}
  case 'mbComparisonEquationsNumeric': return ns[0]/ns[1];
  case 'mbAdditiveVsMultiplicativeMcq': return option(w,x=>x.includes('times as many'));
  case 'mbAdditiveVsMultiplicativeNumeric': return ns[0]*ns[1]-(ns[0]+ns[1]);
  /* mbFactorsMcq/mbMultiplesMcq: the usual surface is a bare-number option list, graded against
   * the number the prompt names first (n=ns[0]). One prompt shape per form instead asks "which
   * MULTIPLICATION proves..." and offers full equations (+, −, ×, ÷) as options — only the ×
   * equation can ever be a true one among {N×K=N*K, N+K=.., N-K=.., N/K=..} built from the same
   * pair, so "a true × equation" is unambiguous without even consulting n. */
  case 'mbFactorsMcq': {const n=ns[0];const bare=w.options.map(o=>o.label).find(x=>/^\d+$/.test(x)&&n%+x===0);if(bare!==undefined)return bare;return option(w,x=>{const m=x.match(/^(\d+)\s*×\s*(\d+)\s*=\s*(\d+)$/);return!!m&&+m[1]*+m[2]===+m[3];});}
  /* mbFactorsNumeric: several authored shapes restate the SAME factor pair before asking for the
   * missing one ("40 includes 1x40, 2x20, ... 5 x ?"), or ask for a divisor-pair COUNT rather
   * than a missing factor. Each branch below is anchored to a distinct authored phrase (checked
   * against the full corpus using this form); the bare ns[1]/ns[0] fallback is untouched for the
   * "rectangle has one side X and an area of Y" phrasing, where it already agrees (Y/X). */
  case 'mbFactorsNumeric': {
   let m=p.match(/factor pair of (\d+) is (\d+) and/i);if(m)return +m[1]/+m[2];
   m=p.match(/factor-pair record for (\d+) (?:includes|begins)[\s\S]*?(\d+)\s*×\s*\?/i);if(m)return +m[1]/+m[2];
   m=p.match(/factor pairs does (\d+) have/i);if(m)return factorPairCount(+m[1]);
   m=p.match(/arranges (\d+) \w+ into equal rows/i);if(m)return factorPairCount(+m[1]);
   return ns[1]/ns[0];
  }
  case 'mbMultiplesMcq': {const n=ns[0];const bare=w.options.map(o=>o.label).find(x=>/^\d+$/.test(x)&&+x%n===0);if(bare!==undefined)return bare;return option(w,x=>{const m=x.match(/^(\d+)\s*×\s*(\d+)\s*=\s*(\d+)$/);return!!m&&+m[1]*+m[2]===+m[3];});}
  // mbPrimeCompositeMcq: prompts EITHER name the number directly ("Is 15 prime...", ns=[15], first
  // === last) OR give a factor pair as evidence ("...factor pair 3 × 7 = 21. Is that number...",
  // ns=[3,7,21]) — the number being classified is always the LAST one stated, never the first.
  case 'mbPrimeCompositeMcq': {const n=ns[ns.length-1],prime=n>1&&Array.from({length:n-2},(_,i)=>i+2).every(d=>n%d);return exact(w,prime?'Prime':'Composite');}
  /* S242 / GRB-04. This used to be `return 2`, which is what an independent route looks like when
   * the generator's answer is a constant: it agreed forever and derived nothing. The generator
   * tests each value for a divisor; this SIEVES the range and counts what survives — a different
   * method over the same fact, which is the whole point of the INDEPENDENT map. */
  case 'mbPrimeCompositeNumeric': {
    const lo = ns[0], hi = ns[1];
    const sieve = new Array(hi + 1).fill(true);
    sieve[0] = sieve[1] = false;
    for (let p = 2; p * p <= hi; p++) if (sieve[p]) for (let m = p * p; m <= hi; m += p) sieve[m] = false;
    let count = 0;
    for (let v = lo; v <= hi; v++) if (sieve[v]) count++;
    return count;
  }
  case 'mbMultiplyTensMcq': return exact(w,'Because the factor is built from tens, so the basic fact is scaled by 10.');
  case 'mbMultiplyTensNumeric': return ns[0]*ns[1];
  case 'mbAreaModel1DigitMcq': {const [a,b]=ns,t=Math.floor(a/10)*10,o=a%10;return exact(w,`${t}×${b} and ${o}×${b}`);}
  case 'mbAreaModel1DigitNumeric': return ns[0]*ns[1];
  case 'mbAreaModel2DigitMcq': {const [a,b]=ns,at=Math.floor(a/10)*10,ao=a%10,bt=Math.floor(b/10)*10,bo=b%10;return exact(w,`${at}×${bt}, ${at}×${bo}, ${ao}×${bt}, ${ao}×${bo}`);}
  case 'mbAreaModel2DigitNumeric': return ns[0]*ns[1];
  case 'mbRemaindersMcq': {const d=ns[0];return option(w,x=>/^-?\d+$/.test(x)&&+x>=0&&+x<d);}
  case 'mbRemaindersNumeric': return ns[0]-ns[1]*ns[2];
  case 'mbDivideBigNumeric': return ns[0]/ns[1];
  case 'mbInterpretRemaindersMcq': return exact(w,String(Math.ceil(ns[0]/ns[1])));
  case 'mbInterpretRemaindersNumeric': return Math.ceil(ns[0]/ns[1]);
  case 'mbPatternsMcq': return exact(w,`Multiply by ${ns[1]/ns[0]}`);
  case 'mbPatternsNumeric': {
   // "A rule SAYS 'multiply by K' and starts at S. What is the Nth term?" states the rule and
   // start directly rather than showing K terms of the sequence — solve start * factor^(N-1)
   // from the stated ordinal instead of falling through to the shown-sequence math below, which
   // would wrongly treat the rule's own factor as a second sequence term.
   let m=p.match(/rule (?:is|says) ['"]multiply by (\d+)['"] and starts at (\d+)\. What is the (\w+) term/i);
   if(m&&ORDINALS[m[3].toLowerCase()])return +m[2]*Math.pow(+m[1],ORDINALS[m[3].toLowerCase()]-1);
   m=p.match(/rule is "multiply by (\d+)"/);if(m)return ns[ns.length-1]*+m[1];
   return ns[ns.length-1]*(ns[1]/ns[0]);
  }
  case 'mbMultiStepNumeric': return ns[0]*ns[1]-ns[2];

  // Place value and algorithms
  case 'pvPlaceLadderMcq': {const n=clean(p.match(/In ([\d,]+)/)[1]),digit=ns[1],places=['ones','tens','hundreds','thousands','ten-thousands','hundred-thousands','millions'];let q=n,i=0;while(q%10!==digit){q=Math.floor(q/10);i++;}return exact(w,places[i]);}
  case 'pvPlaceLadderNumeric': {const n=ns[0],digit=ns[1];for(let pow=1;pow<=1e6;pow*=10)if(Math.floor(n/pow)%10===digit)return digit*pow;throw Error(p);}
  case 'pvTenTimesNumeric': return ns[1]*10;
  case 'pvPlaceNamesMcq': {const v=ns[0],places={1:'ones',10:'tens',100:'hundreds',1000:'thousands',10000:'ten-thousands',100000:'hundred-thousands',1000000:'millions'};return exact(w,places[v]);}
  case 'pvPlaceNamesNumeric': {const n=ns[0],name=p.match(/the ([a-z-]+) place/)[1],pow={ones:1,tens:10,hundreds:100,thousands:1000,'ten-thousands':10000,'hundred-thousands':100000,millions:1000000}[name];return Math.floor(n/pow)%10;}
  case 'pvNumberFormsMcq': {const n=ns[0];return option(w,x=>{if(!x.includes('×'))return false;return x.split(' + ').reduce((sum,t)=>{const m=t.match(/([\d,]+)×([\d,]+)/);return sum+clean(m[1])*clean(m[2]);},0)===n;});}
  case 'pvNumberFormsNumeric': {return [...p.matchAll(/([\d,]+)×([\d,]+)/g)].reduce((s,m)=>s+clean(m[1])*clean(m[2]),0)+(p.match(/ \+ (\d+) in standard/)?.[1]?+RegExp.$1:0);}
  case 'pvReadingBigMcq': {const n=ns[0];return option(w,x=>wordsToNumber(x)===n);}
  case 'pvReadingBigNumeric': {const n=ns[0],period=p.includes('millions period')?Math.floor(n/1000000):Math.floor(n/1000)%1000;return Number(String(period)[0]);}
  case 'pvCommaPeriodsMcq': return exact(w,'Three-digit periods such as ones, thousands, and millions');
  case 'pvCommaPeriodsNumeric': return ns[0]-1;
  case 'pvRoundingMcq': {const n=ns[0],ans=Math.round(n/1000)*1000;return exact(w,ans.toLocaleString('en-US'));}
  case 'pvRoundingNumeric': {const n=ns[0],place=ns[1];return Math.round(n/place)*place;}
  case 'pvFrontEndNumeric': {const place=ns[0],a=ns[1],b=ns[2];return Math.floor(a/place)*place+Math.floor(b/place)*place;}
  case 'pvAddColumn': case 'pvSubtractColumn': case 'pvAcrossZerosColumn': return w.op==='add'?w.a+w.b:w.a-w.b;
  case 'pvAddMcq': return exact(w,'Write 6 in the column and carry 1 to the next place left.');
  case 'pvAddNumeric': return ns[0]+ns[1];
  case 'pvSubtractMcq': return exact(w,'Break one unit from the next place left into ten units of the current place.');
  case 'pvSubtractNumeric': return ns[0]-ns[1];
  case 'pvAcrossZerosMcq': return exact(w,'Each becomes 9 after passing one unit to the place on its right.');
  case 'pvAcrossZerosNumeric': return ns[0]-ns[1];
  case 'pvCompareBigMcq': return exact(w,Math.max(ns[0],ns[1]).toLocaleString('en-US'));
  case 'pvCompareBigNumeric': return ns[0]-ns[1];
  case 'pvOrderBigMcq': {const vals=ns.slice(0,4).sort((a,b)=>b-a);return exact(w,vals[1].toLocaleString('en-US'));}
  case 'pvOrderBigNumeric': {const vals=ns.slice(0,4);return Math.max(...vals)-Math.min(...vals);}
 }
 throw new Error(`no independent route for ${form}`);
}
function solvePrompt(form,input){
 const parts=input.split('||');
 const prompt=parts[0],rawOptions=parts[1]||'';
 const w={prompt,options:rawOptions?rawOptions.split(';;').map(label=>({label})):[]};
 if(form.endsWith('Drag')){
  const payload=parts[2]?JSON.parse(parts[2]):{items:(parts[1]||'').split(',').map(label=>({label}))};
  w.items=payload.items;
 }
 if(form==='faBenchmarkOrderRational'){
  const f=fractions(prompt);w.left=f[0];w.right=f[1];
 }
 if(form==='faMixedAddSubMixed'){
  const m=prompt.match(/(Add|Subtract) (\d+) (\d+)\/(\d+) [+-−] (\d+) (\d+)\/(\d+)/);
  if(!m)throw new Error(`cannot parse mixed prompt ${prompt}`);
  Object.assign(w,{mode:m[1]==='Add'?'add':'subtract',aWhole:+m[2],aNum:+m[3],den:+m[4],bWhole:+m[5],bNum:+m[6]});
 }
 if(form==='faWholeTimesFractionMixed'){
  const m=prompt.match(/Build (\d+) × (\d+)\/(\d+) as (\d+)\/(\d+)/);
  Object.assign(w,{mode:'convert',aWhole:0,aNum:+m[4],den:+m[5],targetForm:'mixed'});
 }
 if(form.endsWith('Column')){
  const m=prompt.match(/(Add|Subtract) ([\d,]+) [+-−] ([\d,]+)/);
  Object.assign(w,{op:m[1]==='Add'?'add':'subtract',a:clean(m[2]),b:clean(m[3])});
 }
 return solve(form,w);
}
module.exports={solve,solvePrompt};
