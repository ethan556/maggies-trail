type Band = "support" | "core" | "stretch";
type Variant = { tag: string; widget: any; answer: any };
type VariantGen = { tag: string; label: string; forms?: readonly never[]; gen: (rand:()=>number, band?:Band, form?:string)=>Variant };
type Rand = () => number;

const pick=(r:Rand,a:number,b:number)=>a+Math.floor(r()*(b-a+1));
const choose=<T>(r:Rand,xs:readonly T[])=>xs[pick(r,0,xs.length-1)];
const maxByBand=(b:Band,s:number,c:number,t:number)=>b==='support'?s:b==='stretch'?t:c;
const round=(n:number,d=6)=>Number(n.toFixed(d));
const gcd=(a:number,b:number):number=>b===0?Math.abs(a):gcd(b,a%b);
const padFeedback=(s:string)=>s.length>=25?s:`${s} Recheck the visible algebraic structure to confirm the result.`;
const polishText=(s:string)=>s
 .replace(/-0\.3333333333333333\b/g,"-1/3")
 .replace(/0\.3333333333333333\b/g,"1/3")
 .replace(/−\s*1x\b/g,"− x")
 .replace(/-1x\b/g,"-x")
 .replace(/\b1x\b/g,"x")
 .replace(/\+\s*[−-]\s*(\d+(?:\.\d+)?)/g,"− $1");
const polishValue=(v:any):any=>typeof v==='string'?polishText(v):Array.isArray(v)?v.map(polishValue):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,polishValue(x)])):v;
const polishVariant=(v:Variant):Variant=>polishValue(v) as Variant;
function shuffle<T>(r:Rand,xs:readonly T[]):T[]{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=pick(r,0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
function signed(n:number){return n<0?`− ${Math.abs(n)}`:`+ ${n}`}
/** A ratio printed as mathematics — "-4/3", "2", "1/2" — never as a truncated decimal. */
const fracStr=(n:number,d:number)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d)||1,nn=n/g,dd=d/g;return dd===1?String(nn):`${nn}/${dd}`};
/** Root named the way it is read aloud: square, cube, fourth — never "2th". */
const rootWord=(q:number)=>q===2?'square':q===3?'cube':q===4?'fourth':`${q}th`;
const dollars=(n:number)=>`${n} ${n===1?'dollar':'dollars'}`;
function xTerm(a:number,p=1){const v=p===1?'x':`x^${p}`;return a===1?v:a===-1?`-${v}`:`${a}${v}`}
function linear(m:number,b:number){return `y = ${xTerm(m)} ${signed(b)}`}
function uniqueTraps(answer:number,vals:Array<[number,string]>):Array<[number,string]>{const seen=new Set([round(answer,10)]),out:Array<[number,string]>=[];for(const [v,f] of vals){const q=round(v,10);if(Number.isFinite(q)&&!seen.has(q)){seen.add(q);out.push([q,f])}}for(let d=1;out.length<2;d++){for(const v of [answer+d,answer-d]){const q=round(v,10);if(!seen.has(q)){seen.add(q);out.push([q,`That result is ${Math.abs(round(q-answer,6))} away from the requested value. Recheck the algebraic relationship step by step.`]);if(out.length>=2)break}}}return out.slice(0,3)}
const num=(tag:string,prompt:string,answer:number,errors:Array<[number,string]>,success:string,tolerance=0,params?:Readonly<Record<string,number|string>>):Variant=>({tag,answer:round(answer,10),...(params?{params}:{}),widget:{type:'numeric',prompt,answer:round(answer,10),tolerance,unit:'',commonErrors:uniqueTraps(answer,errors).map(([value,feedback])=>({value,feedback:padFeedback(feedback)})),fallbackFeedback:'Reconstruct the relationship from the visible quantities, then verify each inverse operation or substitution.',successFeedback:padFeedback(success)}});
const mcq=(r:Rand,tag:string,prompt:string,correct:[string,string],wrongOrFirst:Array<[string,string]>|[string,string],...moreWrong:Array<[string,string]>):Variant=>{const wrong:Array<[string,string]>=moreWrong.length?[wrongOrFirst as [string,string],...moreWrong]:wrongOrFirst as Array<[string,string]>;const seen=new Set<string>();const all=[correct,...wrong].filter(([l])=>!seen.has(l)&&seen.add(l));while(all.length<4){const label=`Alternative ${all.length}`;all.push([label,'This alternative does not preserve the displayed algebraic relationship.'])}const options=shuffle(r,all.slice(0,4).map(([label,feedback],i)=>({label,feedback:padFeedback(feedback),correct:i===0}))).map((o,i)=>({id:`o${i}`,...o}));return{tag,answer:options.find(o=>o.correct)!.id,widget:{type:'mcq',prompt,options}}};
const build=(tag:string,prompt:string,labels:string[],correct:number[],wrongRaw:any,success:string):Variant=>{const id=(i:number)=>`t${i}`;const raw=(Array.isArray(wrongRaw)&&wrongRaw.length===2&&Array.isArray(wrongRaw[0])&&typeof wrongRaw[1]==='string')?[wrongRaw]:wrongRaw;const wrong:Array<[number[],string]>=(raw||[]).map((item:any)=>{if(Array.isArray(item[0]))return[item[0],item[1]];return[item.slice(0,-1),item[item.length-1]]});return{tag,answer:correct.map(id),widget:{type:'buildExpression',prompt,tokens:labels.map((label,i)=>({id:id(i),label})),correct:correct.map(id),acceptAlso:[],commonBuilds:wrong.map(([seq,feedback])=>({sequence:seq.map(id),feedback:padFeedback(feedback)})),reusable:false,missFeedback:'Use the structure of the expression or solution set to place every required token in a mathematically valid order.',successFeedback:padFeedback(success)}}};
const pairs=(r:Rand,tag:string,prompt:string,left:string[],right:string[],mapping:number[],errors:Array<[number,number,string]>,success:string):Variant=>{const L=left.map((label,i)=>({id:`l${i}`,label}));let R=shuffle(r,right.map((label,i)=>({id:`r${i}`,label})));const p=Object.fromEntries(mapping.map((j,i)=>[`l${i}`,`r${j}`]));const aligned=(rs:typeof R)=>L.every((l,i)=>p[l.id]===rs[i]?.id);for(let t=0;t<R.length&&aligned(R);t+=1)R=[...R.slice(1),R[0]!];return{tag,answer:p,widget:{type:'matchPairs',prompt,left:L,right:R,pairs:p,pairErrors:errors.map(([i,j,feedback])=>({left:`l${i}`,right:`r${j}`,feedback:padFeedback(feedback)})),missFeedback:'Match each representation to the slope property shown by its coefficient or orientation.',successFeedback:padFeedback(success)}}};

const EXP='a1-exponential';
function exponential(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='exp-compare'){
  const x=pick(r,2,maxByBand(b,3,4,5)),a=pick(r,1,5),c=pick(r,1,5),p=pick(r,2,4),q=pick(r,2,5);const fv=a*p**x,gv=c*q**x;
  if(surface==='numeric')return num(EXP,`Evaluate g(x) = ${c} · ${q}^x at x = ${x}.`,gv,[[c*q*x,'That multiplies by the exponent once instead of using repeated multiplication.'],[q**x,'That omits the initial coefficient.']],`Substitution gives g(${x}) = ${c} · ${q}^${x} = ${gv}.`,0,{kind:'exp-eval',a:c,b:q,v:x});
  const answer=fv===gv?'They are equal':fv>gv?'f(x)':'g(x)';return mcq(r,EXP,`At x = ${x}, which is larger: f(x) = ${a} · ${p}^x or g(x) = ${c} · ${q}^x?`,[answer,`Evaluating both at x = ${x} gives ${fv} and ${gv}, so ${answer} is the correct comparison.`],[['The function with the larger initial coefficient always wins','The initial coefficient alone cannot decide the comparison after repeated growth.'],['The function with the larger base always wins','A larger base can be offset at a specific input by the other initial coefficient.'],['There is not enough information','Both formulas and the comparison input are provided, so direct evaluation decides.']]);
 }
 if(concept==='exp-graph-read'){
  const a=pick(r,2,12),base=choose(r,[2,3,4,0.5,0.25] as const);
  if(surface==='numeric')return num(EXP,`For f(x) = ${a} · ${base}^x, what is the y-intercept?`,a,[[base,'The base controls growth or decay, but the intercept occurs at x = 0.'],[a*base,'That evaluates at x = 1 rather than x = 0.']],`At x = 0, ${base}^0 = 1, so the y-intercept is ${a}.`,0,{kind:'exp-zero',a,b:base});
  const kind=base>1?'increasing exponential growth':'decreasing exponential decay';return mcq(r,EXP,`Which description matches f(x) = ${a} · ${base}^x?`,[`${kind} with y-intercept ${a}`,`The factor ${base} determines ${base>1?'growth':'decay'}, and f(0) = ${a}.`],[`${kind} with y-intercept ${base}`,'The base is not the y-intercept; substituting x = 0 leaves the coefficient.'],[base>1?'decreasing exponential decay':'increasing exponential growth','The direction is reversed: compare the base with 1.'],['a line with constant slope','Exponential change uses a constant ratio rather than a constant difference.']);
 }
 if(concept==='exp-growth-decay'){
  const decay=r()<0.5,q=choose(r,[2,3,4] as const),base=decay?1/q:q,x=pick(r,2,4),unit=pick(r,2,8),a=decay?unit*q**x:unit,ans=round(a*base**x);
  if(surface==='numeric')return num(EXP,`Evaluate f(x) = ${a} · ${decay?`(1/${q})`:`${q}`}^x at x = ${x}.`,ans,[[a*base*x,'That treats the exponent as ordinary multiplication rather than repeated multiplication.'],[a,'That leaves out the repeated growth or decay factor.']],`Applying the factor ${x} times gives f(${x}) = ${ans}.`,0,decay?{kind:'exp-decay',a,den:q,steps:x}:{kind:'exp-eval',a,b:q,v:x});
  return mcq(r,EXP,`Is f(x) = ${a} · ${decay?`(1/${q})`:`${q}`}^x exponential growth or decay?`,[decay?'decay':'growth',`The base is ${decay?'between 0 and 1':'greater than 1'}, so each step ${decay?'shrinks':'grows'} the quantity.`],[[decay?'growth':'decay','That reverses the effect of the exponential base.'],['linear','A constant multiplicative factor defines exponential, not linear, change.'],['constant','The output changes whenever x changes because the base is not 1.']]);
 }
 if(concept==='exp-match-base'){
  const base=pick(r,2,5),x=pick(r,2,maxByBand(b,4,5,6)),value=base**x;
  if(surface==='numeric')return num(EXP,`Solve ${base}^x = ${value}. What is x?`,x,[[value/base,'That removes one factor but reports the remaining value, not the number of factors.'],[base*x,'That treats the exponent as a multiplier.']],`${value} is ${base} multiplied by itself ${x} times, so x = ${x}.`,0,{kind:'expsolve',coef:1,bn:base,bd:1,rn:value,rd:1});
  return mcq(r,EXP,`Solve ${base}^x = ${value}.`,[String(x),`${base}^${x} = ${value}, so the exponent is ${x}.`],[[String(value/base),'That is the value after dividing by one base factor, not the exponent.'],[String(base*x),'The exponent counts equal factors; it does not multiply the base once.'],[String(x+1),`That would produce ${base**(x+1)}, one extra factor of ${base}.`]]);
 }
 if(concept==='exp-percent'){
  const growth=r()<0.7,rate=choose(r,growth?[25,50,100] as const:[25,50] as const),factor=growth?1+rate/100:1-rate/100,t=pick(r,2,4),scale=factor===1.25?4**t:factor===1.5?2**t:factor===0.75?4**t:factor===0.5?2**t:1,start=pick(r,2,8)*scale,ans=round(start*factor**t);
  if(surface==='numeric')return num(EXP,`A quantity starts at ${start} and ${growth?'grows':'decreases'} ${rate}% each step. What is the amount after ${t} steps?`,ans,[[round(start*(1+(growth?rate:-rate)/100*t)),'That applies the percent to the original amount repeatedly instead of compounding the new amount.'],[round(start*rate/100),'That computes one percent-change amount rather than the final compounded quantity.']],`The multiplier is ${factor}; applying it ${t} times gives ${ans}.`,0.000001,{kind:'exp-rate',a:start,fn:growth?100+rate:100-rate,fd:100,v:t});
  return mcq(r,EXP,`A quantity ${growth?'grows':'decreases'} ${rate}% each step. What is the exponential factor?`,[String(factor),`Convert ${rate}% to ${rate/100} and ${growth?'add it to':'subtract it from'} 1, giving ${factor}.`],[[String(rate/100),'That is the rate alone, not the full multiplier applied to the previous amount.'],[String(growth?1-rate/100:1+rate/100),'That uses the factor for the opposite direction of change.'],[String(rate),'A percent must be converted to a decimal before it can be used as a factor.']]);
 }
 const a=pick(r,2,6),ratio=choose(r,[2,3] as const),x=pick(r,3,5),ans=a*ratio**x;
 if(surface==='numeric')return num(EXP,`For the exponential f(x) = ${a} · ${ratio}^x, find f(${x}).`,ans,[[a*ratio*x,'That multiplies by the exponent instead of using repeated multiplication.'],[ratio**x,'That drops the starting coefficient.']],`Substitution gives ${a} · ${ratio}^${x} = ${ans}.`,0,{kind:'exp-eval',a,b:ratio,v:x});
 const seqType=r()<0.5?'arithmetic':'geometric',start=pick(r,2,6),change=pick(r,2,4),seq=seqType==='arithmetic'?[start,start+change,start+2*change,start+3*change]:[start,start*change,start*change**2,start*change**3];return mcq(r,EXP,`Classify the sequence ${seq.join(', ')}.`,[seqType,`The sequence has a constant ${seqType==='arithmetic'?'difference':'ratio'}, so it is ${seqType}.`],[[seqType==='arithmetic'?'geometric':'arithmetic','That checks the wrong kind of repeated change.'],['constant','The terms change from one position to the next.'],['neither','A consistent difference or ratio is visible in every step.']]);
}

const POLY='a1-polynomials';
function polynomials(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='exponent-power'){
  const m=pick(r,2,4),n=pick(r,2,4),c=pick(r,2,4);
  if(surface==='numeric')return num(POLY,`Simplify (x^${m})^${n} to x^k. What is k?`,m*n,[[m+n,'That adds the exponents; a power of a power multiplies them.'],[m**n,'That raises the exponent itself instead of multiplying the two exponents.']],`A power of a power multiplies exponents: ${m} · ${n} = ${m*n}.`);
  const correct=`${c**n}x^${m*n}`;return mcq(r,POLY,`Simplify (${c}x^${m})^${n}.`,[correct,`Raise the coefficient and multiply the exponents, giving ${correct}.`],[[`${c*n}x^${m*n}`,'The coefficient must be raised to the outside power, not multiplied by it.'],[`${c**n}x^${m+n}`,'A power of a power multiplies exponents rather than adding them.'],[`${c}x^${m*n}`,'The coefficient is also inside the parentheses and must be raised.']]);
 }
 if(concept==='exponent-zero-negative'){
  const p=pick(r,3,7),q=pick(r,1,p-1),ans=p-q;
  if(surface==='numeric')return num(POLY,`Simplify x^${p} · x^(-${q}) to x^k. What is k?`,ans,[[p+q,'The negative exponent contributes subtraction, not addition of its magnitude.'],[p*q,'Multiplying powers adds signed exponents; it does not multiply them.']],`Add the signed exponents: ${p} + (-${q}) = ${ans}.`);
  const base=pick(r,2,6),e=pick(r,2,4),den=base**e;return mcq(r,POLY,`What is ${base}^(-${e})?`,[`1/${den}`,`A negative exponent takes the reciprocal: ${base}^(-${e}) = 1/${base}^${e} = 1/${den}.`],[[String(-den),'The exponent is negative, but the value is a positive reciprocal.'],[`1/${base*e}`,'The denominator uses a power, not base times exponent.'],[String(den),'That drops the reciprocal required by the negative exponent.']]);
 }
 if(concept==='factor-difference-squares'){
  const a=pick(r,2,maxByBand(b,6,9,12));
  if(surface==='numeric')return num(POLY,`Factor x^2 - ${a*a} as (x + ${a})(x - k). Find k.`,a,[[a*a,'That repeats the constant instead of taking its square root.'],[-a,'The subtraction sign is already shown before k, so k is the positive root.']],`Because ${a*a} = ${a}^2, the factors are (x + ${a})(x - ${a}).`);
  return build(POLY,`Build the factorization of x^2 - ${a*a}.`,[`(x + ${a})`,`(x - ${a})`,`(x + ${a*a})`,`(x - ${a*a})`],[0,1],[[0,3,'This mixes the square root in one factor with the original constant in the other. Both factors use the square root.'],[2,3,'Those factors use the constant itself. Difference of squares uses its square root: a^2 - b^2 = (a + b)(a - b).']],`The conjugate factors multiply to x^2 - ${a*a}.`);
 }
 if(concept==='factor-gcf'){
  const g=pick(r,2,6),p=pick(r,1,3),a=pick(r,2,5);let c=pick(r,2,5);while(gcd(a,c)!==1)c=pick(r,2,5);
  if(surface==='numeric')return num(POLY,`The GCF of ${g*a}x^${p+1} + ${g*c}x^${p} is ${g}x^k. Find k.`,p,[[p+1,'The smaller exponent is common to both terms, not the larger exponent.'],[1,'The common variable power includes every x shared by both terms.']],`The smallest exponent is ${p}, so the GCF contains x^${p}.`);
  return build(POLY,`Build the GCF factorization of ${g*a}x^${p+1} + ${g*c}x^${p}.`,[`${g}x^${p}`,`(${a}x + ${c})`,`(${g*a}x + ${g*c})`,`${g}`],[0,1],[[3,2,'Factoring only the numerical GCF leaves an additional common variable factor inside.'],[0,2,'The inside coefficients must be divided by the full GCF.']],`Distributing ${g}x^${p} back through (${a}x + ${c}) restores both original terms.`);
 }
 if(concept==='factor-trinomial'){
  const m=pick(r,2,7),nAbs=choose(r,[2,3,4,5,6,7].filter(v=>v!==m)),n=r()<0.4?-nAbs:nAbs;const sum=m+n,prod=m*n;
  if(surface==='numeric')return num(POLY,`For x^2 ${signed(sum)}x ${signed(prod)}, find the smaller of the two integers that multiply to ${prod} and add to ${sum}.`,Math.min(m,n),[[Math.max(m,n),'That is the larger factor integer; the prompt asks for the smaller one.'],[prod,'The product is the constant term, not one of the factor integers.']],`The required integers are ${m} and ${n}, so the smaller is ${Math.min(m,n)}.`);
  const pm=m>=0?'+':'-',pn=n>=0?'+':'-',oppM=m>=0?'-':'+',oppN=n>=0?'-':'+';return build(POLY,`Build the factorization of x^2 ${signed(sum)}x ${signed(prod)}.`,[`(x ${pm} ${Math.abs(m)})`,`(x ${pn} ${Math.abs(n)})`,`(x ${oppM} ${Math.abs(m)})`,`(x ${oppN} ${Math.abs(n)})`],[0,1],[[2,1,'Changing the sign of the first factor changes both the middle coefficient and constant product.'],[0,3,'Changing the sign of the second factor changes both the middle coefficient and constant product.']],`The constants ${m} and ${n} multiply to ${prod} and add to ${sum}.`);
 }
 if(concept==='poly-mul-binomial'){
  const a=pick(r,1,3),b1=pick(r,1,6),c=pick(r,1,3),d=pick(r,1,6),A=a*c,B=a*d+b1*c,C=b1*d;
  if(surface==='numeric')return num(POLY,`Multiply (${xTerm(a)} + ${b1})(${xTerm(c)} + ${d}). What is the constant term?`,C,[[b1+d,'That adds the constants rather than multiplying them.'],[B,'That is the middle-term coefficient, not the constant term.']],`The constant term is ${b1} · ${d} = ${C}.`);
  const correct=`${xTerm(A,2)} + ${B}x + ${C}`;return mcq(r,POLY,`Multiply (${xTerm(a)} + ${b1})(${xTerm(c)} + ${d}).`,[correct,`All four partial products combine to ${correct}.`],[[`${xTerm(A,2)} + ${a*d}x + ${C}`,'That omits one of the two middle partial products.'],[`${xTerm(a+c,2)} + ${b1+d}`,'Coefficients and constants cannot be combined before distributing.'],[`${xTerm(A,2)} + ${B}x + ${b1+d}`,'The constant term comes from multiplication, not addition.']]);
 }
 const a=pick(r,2,8),kind=r()<0.5?'square':'difference';
 if(surface==='numeric')return num(POLY,`Expand (x ${kind==='square'?'+':'+'} ${a})(x ${kind==='square'?'+':'-'} ${a}). What is the constant term?`,kind==='square'?a*a:-a*a,[[a+a,'That adds constants instead of multiplying them.'],[a,'The constant term uses both constant factors.']],`The constant product is ${kind==='square'?`${a} * ${a}`:`${a} * (-${a})`}.`);
 const correct=kind==='square'?`x^2 + ${2*a}x + ${a*a}`:`x^2 - ${a*a}`;return mcq(r,POLY,`Expand (x + ${a})(x ${kind==='square'?'+':'-'} ${a}).`,[correct,`The partial products combine to ${correct}.`],[[`x^2 + ${a*a}`,'This omits or mis-signs the middle terms.'],[`x^2 ${kind==='square'?'+':'-'} ${2*a}x - ${a*a}`,'The constant sign does not match the product of the two constants.'],[`x^2 ${kind==='square'?'+':'-'} ${a*a}`,'The constant is not the only contribution when the signs match.']]);
}

const FS='a1-functions-sequences';
function functionsSequences(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='fn-arith-rule'){
  const a=pick(r,1,8),d=pick(r,2,maxByBand(b,5,8,12)),n=pick(r,5,10),ans=a+(n-1)*d;return num(FS,`An arithmetic sequence has a1 = ${a} and common difference ${d}. What is a${n}?`,ans,[[a+n*d,'That uses n jumps; from the first term to the nth term there are n - 1 jumps.'],[n*d,'That omits the starting term.']],`a${n} = ${a} + (${n} - 1) · ${d} = ${ans}.`);
 }
 if(concept==='fn-choose-formula'||concept==='fn-geo-nth'||concept==='fn-geo-rule'){
  const a=pick(r,1,5),q=pick(r,2,4),n=pick(r,4,7),ans=a*q**(n-1);return num(FS,`A geometric sequence has a1 = ${a} and common ratio ${q}. What is a${n}?`,ans,[[a*q*n,'That multiplies by the ratio only once and then by the term number.'],[a*q**n,'That uses one too many ratio factors.']],`a${n} = ${a} · ${q}^(${n}-1) = ${ans}.`);
 }
 if(concept==='fn-classify'){
  const type=choose(r,['arithmetic','geometric','neither'] as const),a=pick(r,2,6),d=pick(r,2,4);const seq=type==='arithmetic'?[a,a+d,a+2*d,a+3*d]:type==='geometric'?[a,a*d,a*d*d,a*d*d*d]:[a,a+d,a+3*d,a+6*d];return mcq(r,FS,`Classify the sequence ${seq.join(', ')}.`,[type,`The term-to-term changes match the definition of a ${type} sequence.`],[[type==='arithmetic'?'geometric':'arithmetic','That checks the wrong invariant: compare differences and ratios across every adjacent pair.'],['constant','The terms do not stay fixed.'],[type==='neither'?'geometric':'neither','A consistent structure is visible when the appropriate change is checked.']]);
 }
 if(concept==='fn-common-ratio'){
  const a=pick(r,1,6),q=pick(r,2,5);return num(FS,`For the geometric sequence ${a}, ${a*q}, ${a*q*q}, ${a*q**3}, what is the common ratio?`,q,[[a*q-a,'That is the first difference, not the multiplicative ratio.'],[a*q,'That is the second term, not the factor between terms.']],`Each term is multiplied by ${q}, so the common ratio is ${q}.`);
 }
 if(concept==='fn-domain-range'){
  const xs=[0,1,2],ys=r()<0.5?[pick(r,2,8),pick(r,2,8),pick(r,2,8)]:[3,3,3];
  if(surface==='buildExpression'){const uniq=[...new Set(ys)].sort((a,b)=>a-b);const labels=[...uniq.map(String),String(Math.max(...uniq)+1),'range ='];const correct=[labels.length-1,...uniq.map((_,i)=>i)];return build(FS,`Build the range for the pairs ${xs.map((x,i)=>`(${x}, ${ys[i]})`).join(', ')} in increasing order.`,labels,correct,[[labels.length-1,labels.length-2],'A value not produced by any input does not belong in the range.'],`The range contains exactly the distinct output values: ${uniq.join(', ')}.`)}
  const repeatedX=r()<0.5;const pairsText=repeatedX?'(1, 2), (1, 5), (3, 7)':'(1, 2), (2, 2), (3, 7)';return mcq(r,FS,`Do the pairs ${pairsText} define a function?`,[repeatedX?'No':'Yes',repeatedX?'Input 1 is paired with two different outputs, so the relation is not a function.':'Each input appears with exactly one output, so the relation is a function.'],[[repeatedX?'Yes':'No','Repeated output values are allowed; only repeated inputs with different outputs violate the definition.'],['Only if every output is different','A function may send several inputs to the same output.'],['There is not enough information','The listed ordered pairs are enough to inspect every input-output assignment.']]);
 }
 if(concept==='fn-growth-apply'){
  const a=pick(r,2,6),q=pick(r,2,4),days=pick(r,2,5),ans=a*q**days;return num(FS,`A population starts at ${a} and multiplies by ${q} each day. What is the population after ${days} days?`,ans,[[a*q*days,'That treats repeated multiplication as one multiplication followed by ordinary scaling.'],[a*q**(days-1),'That applies the growth factor one day too few.']],`After ${days} daily multiplications, the population is ${a} · ${q}^${days} = ${ans}.`);
 }
 throw new Error(`unsupported Algebra I functions form ${form}`);
}

const LF='a1-linear-functions';
function linearFunctions(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='form-conversion'){
  const m=pick(r,-5,5)||2,x1=pick(r,-4,4),y1=pick(r,-8,8),intercept=y1-m*x1;return num(LF,`Convert y - (${y1}) = ${m}(x - (${x1})) to y = mx + b. What is b?`,intercept,[[y1+m*x1,'That adds mx1 instead of subtracting it when solving for b.'],[y1,'That leaves the point value unchanged and ignores the horizontal shift.']],`Using b = y1 - m · x1 gives ${y1} - ${m} · ${x1} = ${intercept}.`,0,{kind:'lf-point-slope-b',y:y1,m,x:x1});
 }
 if(concept==='intercepts'){
  const m=pick(r,-5,5)||3,c=pick(r,-8,8);
  if(surface==='numeric')return num(LF,`For y = ${m}x ${signed(c)}, what is the y-intercept?`,c,[[m,'That is the slope coefficient, not the y-intercept.'],[-c,'The intercept keeps its displayed sign.']],`Setting x = 0 leaves y = ${c}.`,0,{kind:'lf-y-intercept',c});
  return build(LF,`Build the equation of the line with slope ${m} and y-intercept ${c}.`,['y =',`${m}x`,c<0?`- ${Math.abs(c)}`:`+ ${c}`,`x ${c<0?'-':'+'} ${Math.abs(c)}`],[0,1,2],[[0,3],'That token gives x a hidden coefficient of 1 and folds the intercept into the wrong expression. Use the displayed slope coefficient and a separate constant term.'],`The slope-intercept equation is y = ${m}x ${signed(c)}.`);
 }
 if(concept==='line-from-point-slope'){
  const m=pick(r,-4,4)||2,x=pick(r,-4,4),y=pick(r,-6,8),c=y-m*x;
  if(surface==='numeric')return num(LF,`A line through (${x}, ${y}) has slope ${m}. In y = ${m}x + b, find b.`,c,[[y+m*x,'That moves mx in the wrong direction when isolating b.'],[y,'That ignores the x-coordinate contribution.']],`Substitute the point: ${y} = ${m} · ${x} + b, so b = ${c}.`,0,{kind:'lf-point-slope-b',y,m,x});
  const correct=linear(m,c);return mcq(r,LF,`Which equation is the line through (${x}, ${y}) with slope ${m}?`,[correct,`Substituting the point into ${correct} confirms the line and its slope.`],[[linear(-m,c),'That reverses the slope while keeping the same intercept.'],[linear(m,y),'The point’s y-coordinate is not automatically the y-intercept.'],[linear(m,-c),'The intercept sign is reversed.']]);
 }
 if(concept==='line-from-two-points'){
  const m=pick(r,-4,4)||2,x1=pick(r,-4,1),x2=x1+pick(r,1,4),c=pick(r,-6,6),y1=m*x1+c,y2=m*x2+c;return num(LF,`The line through (${x1}, ${y1}) and (${x2}, ${y2}) has equation y = ${m}x + b. Find b.`,c,[[y1+m*x1,'That adds mx instead of subtracting it from y.'],[y1,'That treats the first point’s y-value as the intercept.']],`Using b = y - mx with either point gives b = ${c}.`,0,{kind:'lf-point-slope-b',y:y1,m,x:x1});
 }
 if(concept==='parallel-perpendicular'){
  const m=choose(r,[-4,-3,-2,2,3,4] as const),x=pick(r,-3,3),y=pick(r,-6,8);
  if(surface==='numeric'){const c=y-m*x;return num(LF,`Find b for the line y = ${m}x + b through (${x}, ${y}), parallel to a line of slope ${m}.`,c,[[y+m*x,'That moves mx in the wrong direction.'],[y,'That ignores the point’s x-coordinate.']],`Parallel lines keep slope ${m}; substitution gives b = ${c}.`,0,{kind:'lf-point-slope-b',y,m,x})}
  return mcq(r,LF,`Which slope is perpendicular to a line with slope ${m}?`,[String(-1/m),`Perpendicular slopes are negative reciprocals, so ${m} · ${-1/m} = -1.`],[[String(1/m),'This takes the reciprocal but does not reverse the sign.'],[String(-m),'This changes the sign but does not take the reciprocal.'],[String(m),'Equal slopes describe parallel lines, not perpendicular lines.']]);
 }
 if(concept==='point-slope-read'){
  const m=pick(r,-4,4)||2,x=pick(r,-5,5),y=pick(r,-7,7);
  if(surface==='buildExpression')return build(LF,`Build the point-slope equation for slope ${m} through (${x}, ${y}).`,[`y - (${y})`,'=',String(m),`(x - (${x}))`,`(x + (${x}))`],[0,1,2,3],[[0,1,2,4],'The x-shift must subtract the point coordinate inside the parentheses.'],`The point-slope form is y - (${y}) = ${m}(x - (${x})).`);
  return mcq(r,LF,`In y - (${y}) = ${m}(x - (${x})), which point is built into the equation?`,[`(${x}, ${y})`,'Point-slope form subtracts the coordinates of the known point.'],[[`(${-x}, ${y})`,'The sign inside x - x1 is opposite the coordinate only because the coordinate is being subtracted.'],[`(${x}, ${-y})`,'The y-coordinate is the number subtracted from y, not its opposite.'],[`(${m}, ${y})`,'The slope is not an x-coordinate.']]);
 }
 if(concept==='slope-formula'){
  const dx=pick(r,2,5),m=choose(r,[-3,-2,1,2,3] as const),x1=pick(r,-3,2),y1=pick(r,-5,5),x2=x1+dx,y2=y1+m*dx;return mcq(r,LF,`What is the slope through (${x1}, ${y1}) and (${x2}, ${y2})?`,[String(m),`Rise ${y2-y1} divided by run ${x2-x1} gives slope ${m}.`],[[fracStr(x2-x1,y2-y1),'That reverses rise and run.'],[fracStr(y2+y1,x2+x1||1),'Slope uses differences, not sums, of coordinates.'],[String(y2-y1),'That gives the rise but does not divide by the run.']]);
 }
 if(concept==='slope-intercept-graph'){
  const m=pick(r,-4,4)||2,c=pick(r,-6,6);
  if(surface==='numeric')return num(LF,`For y = ${m}x ${signed(c)}, what is the y-intercept?`,c,[[m,'That is the slope.'],[m+c,'That is the value at x = 1, not x = 0.']],`At x = 0, the line crosses the y-axis at ${c}.`,0,{kind:'lf-y-intercept',c});
  return mcq(r,LF,`Starting at (0, ${c}) on a line of slope ${m}, which point is reached after a run of 1?`,[`(1, ${c+m})`,`A run of 1 changes y by the slope ${m}, giving (1, ${c+m}).`],[`(1, ${c})`,'That moves horizontally without applying the rise.'],[`(${m}, ${c+1})`,'That swaps the roles of rise and run.'],[`(-1, ${c+m})`,'The stated run is positive 1, not negative 1.']);
 }
 if(concept==='slope-intercept-read'){
  const m=pick(r,-5,5)||2,c=pick(r,-8,8),x=pick(r,-3,4),y=m*x+c;
  if(surface==='numeric')return num(LF,`For y = ${m}x ${signed(c)}, find y when x = ${x}.`,y,[[m+c,'That evaluates at x = 1 rather than the given input.'],[x+c,'That adds the input without multiplying by the slope.']],`Substitution gives y = ${m} · ${x} ${signed(c)} = ${y}.`,0,{kind:'lf-evaluate',m,c,x});
  return mcq(r,LF,`In y = ${m}x ${signed(c)}, what is the y-intercept?`,[String(c),'The constant term is the y-value when x = 0.'],[[String(m),'That is the slope coefficient.'],[String(-c),'The intercept keeps its displayed sign.'],[String(m+c),'That is the output at x = 1.']]);
 }
 if(concept==='slope-sign'){
  const mp=pick(r,1,5),mn=pick(r,1,5),bp=pick(r,-5,5),bn=pick(r,-5,5),hy=pick(r,-7,7),vx=pick(r,-7,7);
  const left=[`y = ${mp}x ${signed(bp)}`,`y = -${mn}x ${signed(bn)}`,`y = ${hy}`,`x = ${vx}`],right=['positive','negative','zero','not defined'];return pairs(r,LF,'Match each equation to its slope type.',left,right,[0,1,2,3],[[0,1,'A positive x-coefficient makes the line rise rather than fall.'],[1,0,'A negative x-coefficient makes the line fall as x increases.'],[2,3,'A horizontal line has slope zero; only a vertical line has no defined slope.'],[3,2,'A vertical line has slope that is not defined, rather than slope zero.']],`Each equation is matched to the sign or existence of its slope.`);
 }
 const A=pick(r,2,6),B=choose(r,[1,2,3,4] as const),C=A*B*pick(r,2,10);
 if(surface==='numeric')return num(LF,`For ${A}x + ${B}y = ${C}, find the x-intercept.`,C/A,[[C/B,'That is the y-intercept obtained by setting x = 0.'],[-A/B,'That is the slope, not an intercept.']],`Set y = 0: ${A}x = ${C}, so x = ${C/A}.`,0.000001,{kind:'lf-x-intercept-AC',A,C});
 return mcq(r,LF,`What is the slope of ${A}x + ${B}y = ${C}?`,[fracStr(-A,B),`Solving for y gives slope ${fracStr(-A,B)}.`],[[fracStr(A,B),'The sign changes when Ax is moved to the other side.'],[fracStr(-B,A),'That reverses the coefficient ratio.'],[String(C/B),'That is the y-intercept, not the slope.']]);
}

const Q='a1-quadratics';
function quadratics(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='quad-apply-choose'){
  const h=pick(r,3,9),a=pick(r,1,3),k=pick(r,5,30),max=k;return num(Q,`For P(x) = -${a}(x - ${h})^2 + ${k}, what is the maximum value?`,max,[[h,'That is the x-coordinate of the vertex, not the maximum output.'],[a*h*h+k,'That substitutes x = 0 rather than using the vertex.']],`The parabola opens downward and has vertex (${h}, ${k}), so the maximum value is ${k}.`);
 }
 if(concept==='quad-diff-squares-solve'||concept==='quad-square-root'){
  const a=pick(r,2,maxByBand(b,7,10,15));return num(Q,`Solve x^2 - ${a*a} = 0. What is the larger solution?`,a,[[-a,'That is the smaller solution; the prompt asks for the larger one.'],[a*a,'That is the squared value before taking square roots.']],`x^2 = ${a*a} gives x = ±${a}; the larger solution is ${a}.`);
 }
 if(concept==='quad-discriminant'){
  const roots=choose(r,[0,1,2] as const);const A=1;let B=0,C=0;if(roots===2){const p=pick(r,1,6);let q=pick(r,1,6);while(q===p)q=pick(r,1,6);B=-(p+q);C=p*q}else if(roots===1){const p=pick(r,1,7);B=-2*p;C=p*p}else{B=pick(r,1,5);C=pick(r,5,12)+B*B};return num(Q,`How many real solutions does x^2 ${signed(B)}x ${signed(C)} = 0 have?`,roots,[[roots===2?1:2,'That misclassifies the sign of the discriminant.'],[roots===0?1:0,'The discriminant determines whether real roots exist and whether they repeat.']],`The discriminant B^2 - 4AC has the sign corresponding to ${roots} real solution${roots===1?'':'s'}.`);
 }
 if(concept==='quad-factor-solve'||concept==='quad-zero-product'){
  const p=pick(r,1,7),q=pick(r,1,7),r1=-p,r2=q,B=p-q,C=-p*q,large=Math.max(r1,r2);
  if(surface==='numeric')return num(Q,`Solve x^2 ${signed(B)}x ${signed(C)} = 0. What is the larger solution?`,large,[[Math.min(r1,r2),'That is the smaller root.'],[C,'That is the constant term, not a root.']],`The factors are (x + ${p})(x - ${q}), giving roots ${r1} and ${r2}.`);
  const correct=`(x + ${p})(x - ${q})`;return mcq(r,Q,`Which factorization matches x^2 ${signed(B)}x ${signed(C)}?`,[correct,`The constants multiply to ${C} and add to ${B}.`],[[`(x - ${p})(x + ${q})`,'Those constants add to the opposite middle coefficient.'],[`(x + ${p})(x + ${q})`,'The constant product would be positive.'],[`(x - ${p})(x - ${q})`,'The constant product would be positive and the middle sign would differ.']]);
 }
 if(concept==='quad-formula'){
  const r1=pick(r,-5,1),r2=pick(r,2,7),A=choose(r,[1,2] as const),B=-A*(r1+r2),C=A*r1*r2,large=r2;
  if(surface==='numeric')return num(Q,`Use the quadratic formula on ${A}x^2 ${signed(B)}x ${signed(C)} = 0. What is the larger solution?`,large,[[r1,'That is the smaller solution from the minus branch.'],[-B/(2*A),'That is the axis of symmetry, not necessarily a root.']],`The two formula branches give ${r1} and ${r2}; the larger is ${r2}.`);
  return mcq(r,Q,`What are the solutions of ${A}x^2 ${signed(B)}x ${signed(C)} = 0?`,[`${r1} and ${r2}`,`Substitution in the quadratic formula gives roots ${r1} and ${r2}.`],[`${-r1} and ${-r2}`,'That reverses both root signs.'],[`${r1} only`,'A nonzero discriminant gives two distinct roots.'],[`${-B/(2*A)} and ${large}`,'The axis of symmetry is not an additional root.']);
 }
 if(concept==='quad-projectile'){
  const t=pick(r,4,12),a=pick(r,1,3);return num(Q,`A height model is h(t) = -${a}t^2 + ${a*t}t. At what positive time does the object return to height 0?`,t,[[0,'That is the launch time; the prompt asks for the later positive time.'],[a*t,'That is a coefficient, not the time root.']],`Factoring gives -${a}t(t - ${t}) = 0, so the positive landing time is ${t}.`);
 }
 if(concept==='quad-standard-axis'){
  const h=pick(r,-5,5),k=pick(r,-8,8),B=-2*h,C=h*h+k;return num(Q,`For y = x^2 ${signed(B)}x ${signed(C)}, what is the y-coordinate of the vertex?`,k,[[h,'That is the x-coordinate of the vertex.'],[C,'That is the y-intercept, not the vertex output.']],`Completing the square gives y = (x - (${h}))^2 ${signed(k)}, so the vertex y-coordinate is ${k}.`);
 }
 if(concept==='quad-transform'){
  const h=pick(r,-5,5),k=pick(r,-6,8),a=choose(r,[-3,-2,-1,1,2,3] as const);
  if(surface==='numeric')return num(Q,`For y = ${a}(x - (${h}))^2 ${signed(k)}, what is the x-coordinate of the vertex?`,h,[[-h,'The sign inside the parentheses is opposite the coordinate only because h is being subtracted.'],[k,'That is the y-coordinate of the vertex.']],`Vertex form shows the vertex at (${h}, ${k}).`);
  return mcq(r,Q,`Which statement describes y = ${a}(x - (${h}))^2 ${signed(k)}?`,[a<0?'It opens downward':'It opens upward',`The sign of the leading coefficient ${a} determines the opening direction.`],[[a<0?'It opens upward':'It opens downward','That reverses the effect of the leading coefficient sign.'],[`Its vertex is (${k}, ${h})`,'The h and k coordinates have been swapped.'],['It is a line','The squared input produces a parabola.']]);
 }
 if(concept==='quad-vertex-form'){
  const h=pick(r,-5,5),k=pick(r,-7,7),a=choose(r,[-2,-1,1,2] as const);
  if(surface==='numeric')return num(Q,`For y = ${a}(x - (${h}))^2 ${signed(k)}, what is the y-coordinate of the vertex?`,k,[[h,'That is the x-coordinate.'],[-k,'The vertical coordinate keeps its displayed sign.']],`The vertex in y = a(x - h)^2 + k is (${h}, ${k}).`);
  return mcq(r,Q,`Does y = ${a}(x - (${h}))^2 ${signed(k)} open upward or downward?`,[a>0?'upward':'downward',`The coefficient ${a} has ${a>0?'positive':'negative'} sign, determining the opening.`],[[a>0?'downward':'upward','That reverses the effect of the leading coefficient.'],['neither','Every nondegenerate quadratic opens in one vertical direction.'],['both directions','A single parabola has one opening direction.']]);
 }
 throw new Error(`unsupported Algebra I quadratic form ${form}`);
}

const RAD='a1-radicals';
const triples=[[3,4,5],[5,12,13],[6,8,10],[8,15,17],[7,24,25],[9,12,15],[20,21,29],[12,35,37]] as const;
function radicals(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='rad-distance'||concept==='rad-pythagorean'){
  const [a,c,h]=choose(r,triples);return num(RAD,concept==='rad-distance'?`Find the distance from (0, 0) to (${a}, ${c}).`:`A right triangle has legs ${a} and ${c}. Find the hypotenuse.`,h,[[a+c,'That adds leg lengths rather than using the Pythagorean relationship.'],[a*a+c*c,'That is c^2 before taking the square root.']],`The squared distance is ${a*a}+${c*c}=${h*h}, so the distance is ${h}.`,0,{kind:'pythagorean-triple',a,c,h,mode:concept==='rad-distance'?'distance':'hypotenuse'});
 }
 if(concept==='rad-distribute'){
  const n=pick(r,2,15);return num(RAD,`Evaluate sqrt(${n}) · sqrt(${n}).`,n,[[n*n,'That squares the radicand instead of recognizing that the roots multiply back to the radicand.'],[2*n,'That doubles the radicand.']],`A positive square root multiplied by itself returns the radicand ${n}.`,0,{kind:'radical-product',c1:1,r1:n,c2:1,r2:n,target:1});
 }
 if(concept==='rad-fully-simplified'||concept==='rad-simplify-factor'){
  const k=pick(r,2,9),d=choose(r,[2,3,5,6,7] as const),rad=k*k*d;
  if(surface==='numeric')return num(RAD,`Simplify sqrt(${rad}) = a · sqrt(${d}). Find a.`,k,[[k*k,'That uses the perfect-square factor rather than its square root.'],[d,'That reports the remaining radicand.']],`sqrt(${rad}) = sqrt(${k*k} · ${d}) = ${k} · sqrt(${d}).`,0,{kind:'radical-simplify',coef:1,radicand:rad,target:d});
  return mcq(r,RAD,`Which is the fully simplified form of sqrt(${rad})?`,[`${k}sqrt(${d})`,`Extracting the factor ${k*k} gives coefficient ${k} and remaining radicand ${d}.`],[`${k*k}sqrt(${d})`,'The extracted coefficient is the square root of the perfect-square factor.'],[`${k}sqrt(${k*d})`,'The remaining radicand has not been divided by the full square factor.'],[`sqrt(${k*d})`,'This drops a factor and changes the value.']);
 }
 if(concept==='rad-like-terms'){
  const a=pick(r,4,12),c=pick(r,1,a-1),d=choose(r,[2,3,5,7] as const);return num(RAD,`${a}sqrt(${d}) - ${c}sqrt(${d}) = k · sqrt(${d}). Find k.`,a-c,[[a+c,'The coefficients should be subtracted, not added.'],[a-c+d,'The radicand is not combined with the coefficient.']],`Like radicals combine by subtracting coefficients: ${a}-${c}=${a-c}.`,0,{kind:'radical-combine',c1:a,r1:d,c2:c,r2:d,target:d,operation:'subtract'});
 }
 if(concept==='rad-mn-exp'){
  const q=choose(r,[2,3,4] as const),root=pick(r,2,5),p=pick(r,2,4),base=root**q,ans=root**p;return num(RAD,`Evaluate ${base}^(${p}/${q}).`,ans,[[base**p,'That applies the numerator power without taking the qth root.'],[root*q,'That multiplies the root by the denominator instead of raising it to p.']],`Take the ${rootWord(q)} root first to get ${root}, then raise to ${p}: ${ans}.`,0,{kind:'rational-exponent',base,rootIndex:q,exponent:p});
 }
 if(concept==='rad-multiply'){
  const a=pick(r,2,8),b2=pick(r,2,8),n=a*b2;return num(RAD,`Evaluate sqrt(${a}) · sqrt(${a*b2*b2}).`,a*b2,[[a*a*b2*b2,'That multiplies radicands but does not take the square root.'],[a+b2,'That adds factors instead of multiplying radicals.']],`The product is sqrt(${a*a*b2*b2}) = ${a*b2}.`,0,{kind:'radical-product',c1:1,r1:a,c2:1,r2:a*b2*b2,target:1});
 }
 if(concept==='rad-perfect-square'){
  const k=pick(r,2,maxByBand(b,12,18,25));return num(RAD,`What is sqrt(${k*k})?`,k,[[k*k,'That repeats the radicand instead of taking its square root.'],[2*k,'That doubles the root.']],`${k}^2 = ${k*k}, so the principal square root is ${k}.`,0,{kind:'radical-simplify',coef:1,radicand:k*k,target:1});
 }
 if(concept==='rad-pythagorean-radical'){
  const a=pick(r,2,9),c=a,n=2*a*a;
  if(surface==='numeric')return num(RAD,`A right triangle has legs ${a} and ${c}. What is c^2 before taking the square root?`,n,[[2*a,'That doubles the leg length instead of adding the squares.'],[a*a,'That includes only one leg square.']],`c^2 = ${a}^2 + ${c}^2 = ${n}.`,0,{kind:'pythagorean-triple',a,c,h:Math.sqrt(n),mode:'c-squared'});
  return mcq(r,RAD,`A right triangle has legs ${a} and ${a}. What is the exact hypotenuse?`,[`${a}sqrt(2)`,`sqrt(${2*a*a}) simplifies to ${a}sqrt(2).`],[String(2*a),'Adding the legs does not give the diagonal.'],[String(a*a),'That is one leg squared, not the hypotenuse.'],[`sqrt(${a})`,`The Pythagorean sum is ${2*a*a}, not ${a}.`]);
 }
 const q=choose(r,[2,3,4] as const),root=pick(r,2,6),base=root**q;return num(RAD,`Evaluate ${base}^(1/${q}).`,root,[[base/q,'That divides by the root index rather than taking a root.'],[root*q,'That multiplies the root by the index.']],`A power of 1/${q} is the ${rootWord(q)} root, giving ${root}.`,0,{kind:'rational-exponent',base,rootIndex:q,exponent:1});
}

const SE='a1-solving-equations';
function solveLinearEquation(a:number,b:number,c:number){return (c-b)/a}
function solvingEquations(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='both-sides'){
  const x=pick(r,-8,10),a=pick(r,3,8),c=pick(r,1,a-1),d=pick(r,-10,10),e=(a-c)*x+d;
  if(surface==='numeric')return num(SE,`Solve ${a}x ${signed(d)} = ${c}x ${signed(e)}.`,x,[[e-d,'That moves constants but does not divide by the remaining x-coefficient.'],[-x,'That reverses the final solution sign.']],`Subtract ${c}x and ${d} from both sides to get ${a-c}x = ${(a-c)*x}, so x = ${x}.`);
  return mcq(r,SE,`Why must the same x-term be removed from both sides of ${a}x ${signed(d)} = ${c}x ${signed(e)}?`,['To preserve equality while collecting variable terms','Applying the same operation to both sides preserves the balance and produces an equivalent equation.'],['Because x-terms may never appear on both sides','Variables can appear on both sides; the goal is to transform the equation equivalently.'],['To make both coefficients positive','Coefficient signs are not the reason for using equal operations.'],['Because subtraction always comes before division','The operation order depends on the equation structure, not a universal rule.']);
 }
 if(concept==='both-sides-inequality'){
  const boundary=pick(r,-6,8),a=pick(r,2,6),c=a+pick(r,1,4),d=pick(r,-8,8),e=(a-c)*boundary+d,relation='>';
  if(surface==='buildExpression')return build(SE,`Solve ${a}x ${signed(d)} > ${c}x ${signed(e)}. Build the final inequality.`,['x','<',String(boundary),'>'],[0,1,2],[[0,3,2],'Collecting terms leaves a negative coefficient, so division reverses the inequality.'],`The solution is x < ${boundary} after dividing by a negative coefficient.`);
  return mcq(r,SE,'When solving a both-sides inequality, when must the inequality symbol reverse?',['When multiplying or dividing both sides by a negative number','A negative scale reverses the order of every pair of numbers.'],['Whenever a variable moves across the symbol','Moving a term means applying addition or subtraction, which does not reverse order.'],['Whenever the solution is negative','The sign of the solution does not control the inequality direction.'],['Every time both sides contain x','Variables on both sides do not automatically require a reversal.']);
 }
 if(concept==='decimal-eq'){
  const x=pick(r,2,12),a=choose(r,[0.2,0.4,0.5,0.8] as const),d=choose(r,[0.3,0.7,1.2,1.5] as const),c=round(a*x+d,1);
  if(surface==='numeric')return num(SE,`Solve ${a}x + ${d} = ${c}.`,x,[[round((c-d)*10,1),'That clears decimals but forgets to divide by the scaled coefficient.'],[round(c/a,1),'That divides before removing the constant term.']],`Subtract ${d}, then divide by ${a}; x = ${x}.`,0.000001);
  return mcq(r,SE,`Which equation is equivalent to ${a}x + ${d} = ${c} after multiplying every term by 10?`,[`${round(10*a)}x + ${round(10*d)} = ${round(10*c)}`,'Every term, including both constants, is scaled by 10.'],[`${round(10*a)}x + ${d} = ${c}`,'Only the variable term was scaled.'],[`${round(10*a)}x + ${round(10*d)} = ${c}`,'The right side must also be multiplied by 10.'],[`${a}x + ${round(10*d)} = ${round(10*c)}`,'The coefficient must be scaled along with the constants.']);
 }
 if(concept==='distribute-solve'){
  const x=pick(r,2,12),a=pick(r,2,6),d=pick(r,1,7),c=a*(x+d);
  if(surface==='numeric')return num(SE,`Solve ${a}(x + ${d}) = ${c}.`,x,[[c/a,'That divides but stops before subtracting the number inside the parentheses.'],[c-a*d,'That distributes but does not divide by the x-coefficient.']],`Divide by ${a} to get x + ${d} = ${c/a}, then subtract ${d}: x = ${x}.`);
  return mcq(r,SE,`Which is the correct expansion of ${a}(x + ${d})?`,[`${a}x + ${a*d}`,'The outside factor multiplies both terms inside the parentheses.'],[`${a}x + ${d}`,'The constant inside also must be multiplied by the outside factor.'],[`${a+d}x`,'Addition inside cannot be combined with an outside coefficient this way.'],[`${a}x · ${a*d}`,'Distribution produces a sum of partial products, not their product.']);
 }
 if(concept==='flip-rule'){
  const a=pick(r,2,6),bound=pick(r,-6,8),rhs=-a*bound;
  if(surface==='buildExpression')return build(SE,`Solve -${a}x < ${rhs}. Build the final inequality.`,['x','>',String(bound),'<'],[0,1,2],[[0,3,2],'Dividing by a negative coefficient reverses the inequality symbol.'],`Dividing by -${a} gives x > ${bound}.`);
  return mcq(r,SE,`Which operation forces the inequality symbol to reverse in -${a}x < ${rhs}?`,[`Dividing both sides by -${a}`,'Dividing by a negative number reverses order.'],[`Adding ${a} to both sides`,'Addition preserves order.'],['Subtracting the same term from both sides','Subtraction preserves order.'],['Combining like terms','Combining equivalent expressions does not itself reverse order.']);
 }
 if(concept==='fraction-eq'){
  const den=pick(r,2,8),x=den*pick(r,2,9),d=pick(r,1,6),rhs=x/den+d;
  if(surface==='numeric')return num(SE,`Solve x/${den} + ${d} = ${rhs}.`,x,[[rhs-d,'That isolates x divided by the denominator but does not multiply back by it.'],[rhs*den,'That multiplies before removing the added constant.']],`Subtract ${d}, then multiply by ${den}; x = ${x}.`,0.000001);
  return mcq(r,SE,`In x/${den} = ${x/den}, which operation isolates x?`,[`Multiply both sides by ${den}`,'Multiplication by the denominator undoes division.'],[`Divide both sides by ${den}`,'That would divide x by the denominator a second time.'],[`Add ${den} to both sides`,'Addition does not undo division.'],['Take a square root','A square is absent from this equation, so a square root is unrelated.']);
 }
 if(concept==='lcd-clear'){
  const p=choose(r,[2,3,4] as const),q=choose(r,[3,4,5,6] as const),L=p*q/gcd(p,q),x=L*pick(r,2,8),rhs=x/p+x/q;
  if(surface==='numeric')return num(SE,`Solve x/${p} + x/${q} = ${rhs}.`,x,[[rhs,'That reports the combined quotient value without undoing the fractional coefficient.'],[rhs*L,'That multiplies by the LCD but ignores that the x-terms also combine.']],`Multiplying by LCD ${L} gives ${L/p}x + ${L/q}x = ${rhs*L}, so x = ${x}.`);
  return mcq(r,SE,`When clearing x/${p} + x/${q} = ${rhs} with the LCD ${L}, which terms are multiplied by ${L}?`,['Every term on both sides','Equivalent equations require applying the same multiplication to all terms.'],['Only the fractions on the left','The right side must be scaled too.'],['Only the denominators','The operation multiplies complete terms, allowing denominators to cancel.'],['Only the first fraction','Both fractional terms must be cleared.']);
 }
 if(concept==='literal-eq'){
  const mode=r()<0.5?'rectangle':'rate';
  if(surface==='numeric'){if(mode==='rectangle'){const L=pick(r,3,12),W=pick(r,2,10),P=2*(L+W);return num(SE,`A rectangle has perimeter ${P} and length ${L}. Find its width.`,W,[[P/2,'That finds the sum L + W but does not subtract the known length.'],[P-2*L,'That forgets the width is doubled in the perimeter.']],`P/2 = L + W, so W = ${P/2} - ${L} = ${W}.`)}const rate=pick(r,2,9),time=pick(r,2,8),dist=rate*time;return num(SE,`Using d = rt, find t when d = ${dist} and r = ${rate}.`,time,[[dist-rate,'That subtracts the rate instead of dividing by it.'],[dist*rate,'That multiplies rather than undoing multiplication.']],`t = d/r = ${dist}/${rate} = ${time}.`)}
  return mcq(r,SE,'Using d = rt, which formula solves for t?',['t = d/r','Dividing by r isolates t.'],['t = d - r','Subtraction does not undo the product rt.'],['t = r/d','This reverses the required ratio.'],['t = dr','This multiplies by r again.']);
 }
 if(concept==='literal-frac'){
  const base=pick(r,3,12),height=pick(r,2,10),area=base*height/2;
  if(surface==='numeric')return num(SE,`A triangle has area ${area} and base ${base}. Find its height.`,height,[[area/base,'That divides by the base but forgets to undo the factor 1/2.'],[2*area,'That doubles the area but does not divide by the base.']],`From A = bh/2, h = 2A/b = ${2*area}/${base} = ${height}.`);
  return mcq(r,SE,'From y = mx + b, which formula solves for x?',['x = (y - b)/m','Subtract b, then divide by m.'],['x = y - b/m','The subtraction must happen before the whole result is divided by m.'],['x = (y + b)/m','The constant b must be subtracted.'],['x = m(y - b)','Multiplication by m does not isolate x.']);
 }
 if(concept==='multi-literal'){
  const C=choose(r,[5,10,15,20,25,30,35,40,45,100] as const),F=9*C/5+32;
  if(surface==='numeric')return num(SE,`Using F = 9C/5 + 32, find F when C = ${C}.`,F,[[9*(C/5+32),'That applies the factor 9 to the added 32 as well.'],[(9*C)/(5+32),'That combines the denominator with an added constant.']],`Substitute C = ${C}: F = 9 · ${C}/5 + 32 = ${F}.`);
  return mcq(r,SE,'Solve 2x + a = c for x.',['x = (c - a)/2','Subtract a, then divide the complete difference by 2.'],['x = c - a/2','The subtraction must be completed before division.'],['x = (c + a)/2','The term a moves by subtraction, not addition.'],['x = 2(c - a)','Multiplying by 2 does not isolate x.']);
 }
 if(concept==='solve-inequality'){
  const a=pick(r,2,6),bound=pick(r,-5,10),d=pick(r,-8,8),rhs=a*bound+d,rel=choose(r,['<','<=','>','>='] as const);
  if(surface==='numeric')return num(SE,`Solve ${a}x ${signed(d)} ${rel} ${rhs}. What is the boundary number?`,bound,[[rhs-d,'That isolates ax but does not divide by a.'],[-bound,'That reverses the boundary sign.']],`The boundary equation gives ${a}x = ${a*bound}, so x = ${bound}.`);
  const inclusive=rel.includes('=');return mcq(r,SE,`How is the endpoint drawn for x ${rel} ${bound}?`,[inclusive?'closed circle':'open circle',inclusive?'Equality includes the boundary, so the endpoint is closed.':'Strict inequality excludes the boundary, so the endpoint is open.'],[inclusive?'open circle':'closed circle','That uses the endpoint style for the opposite inclusion rule.'],['no endpoint','A one-variable inequality ray begins at a boundary endpoint.'],['two closed endpoints','This solution is a ray, not a bounded interval.']);
 }
 const a=pick(r,2,6),x=pick(r,2,10),d=pick(r,1,10),rhs=a*x+d;return mcq(r,SE,`To solve ${a}x + ${d} = ${rhs}, which step comes first?`,[`Subtract ${d} from both sides`,'Undo the added constant before undoing multiplication.'],[`Divide both sides by ${a}`,'Dividing first is possible but creates unnecessary fractions and does not directly undo the last operation.'],[`Add ${d} to both sides`,'That moves farther from isolating x.'],['Square both sides','A square or root operation is absent, so this step does not isolate the variable.']);
}

const SYS='a1-systems';
function systemEq(m:number,b:number){return `y = ${m}x ${signed(b)}`}
function systems(r:Rand,b:Band,form:string):Variant{
 const [concept,surface]=form.split('__');
 if(concept==='classify-systems'){
  const kind=choose(r,['one solution','no solution','infinitely many solutions'] as const),m1=pick(r,-4,4)||2,b1=pick(r,-6,6),m2=kind==='one solution'?(m1===4?m1-1:m1+1):m1,b2=kind==='infinitely many solutions'?b1:b1+pick(r,1,5);return mcq(r,SYS,`How many solutions does the system ${systemEq(m1,b1)} and ${systemEq(m2,b2)} have?`,[kind,kind==='one solution'?'Different slopes intersect once.':kind==='no solution'?'Equal slopes with different intercepts are parallel.':'The equations describe the same line.'],[['one solution','Check whether the slopes differ or the equations are actually the same line.'],['no solution','Distinct parallel lines are required for a system with no solution.'],['infinitely many solutions','Infinitely many solutions requires the exact same line.']]);
 }
 const makeSystem=()=>{const x=pick(r,-5,8),y=pick(r,-5,9),a=pick(r,1,5),b1=pick(r,1,5),c=pick(r,1,5);let d=pick(r,1,5);while(a*d===b1*c){d=pick(r,1,5)}return{x,y,a,b:b1,c,d,e:a*x+b1*y,f:c*x+d*y}};
 if(concept==='eliminate-add-subtract'||concept==='eliminate-scale-one'||concept==='eliminate-scale-both'){
  const S=makeSystem(),ask=r()<0.5?'x':'y',ans=ask==='x'?S.x:S.y;
  if(surface==='numeric')return num(SYS,`Solve ${S.a}x + ${S.b}y = ${S.e} and ${S.c}x + ${S.d}y = ${S.f}. What is ${ask}?`,ans,[[ask==='x'?S.y:S.x,'That is the other coordinate of the solution.'],[-ans,'That reverses the sign of the requested coordinate.']],`Eliminating one variable and back-substituting gives (${S.x}, ${S.y}), so ${ask} = ${ans}.`,0,{kind:'linear-system',a1:S.a,b1:S.b,c1:S.e,a2:S.c,b2:S.d,c2:S.f,x:S.x,y:S.y,ask});
  return mcq(r,SYS,'If elimination reduces a system to 0 = 0, how many solutions does the system have?',['infinitely many solutions','The equations are equivalent descriptions of the same line.'],['no solution','A false statement such as 0 = 5 would indicate no solution instead.'],['one solution','A single solution leaves a solvable variable equation.'],['exactly two solutions','Two linear equations cannot intersect at exactly two isolated points.']);
 }
 if(concept==='solve-by-graphing'||concept==='system-solution'){
  const x=pick(r,-4,6),y=pick(r,-5,8),m1=pick(r,-4,4)||2,m2=m1===4?m1-1:m1+1,b1=y-m1*x,b2=y-m2*x;
  if(surface==='numeric'){const ask=r()<0.5?'x':'y';return num(SYS,`The lines ${systemEq(m1,b1)} and ${systemEq(m2,b2)} intersect at (${x}, ${y}). What is the ${ask}-coordinate?`,ask==='x'?x:y,[[ask==='x'?y:x,'That is the other coordinate.'],[-(ask==='x'?x:y),'That reverses the coordinate sign.']],`The intersection is explicitly (${x}, ${y}), so the requested coordinate is ${ask==='x'?x:y}.`,0,{kind:'linear-system',a1:-m1,b1:1,c1:b1,a2:-m2,b2:1,c2:b2,x,y,ask})}
  return mcq(r,SYS,`Which point solves ${systemEq(m1,b1)} and ${systemEq(m2,b2)}?`,[`(${x}, ${y})`,'Substitution makes both equations true at this point.'],[`(${y}, ${x})`,'That swaps the coordinates.'],[`(${-x}, ${y})`,'Changing the x-sign breaks at least one equation.'],[`(${x}, ${-y})`,'Changing the y-sign breaks at least one equation.']);
 }
 if(concept==='substitution-solve'){
  const x=pick(r,-4,7),m=pick(r,-3,4)||2,b1=pick(r,-5,5),y=m*x+b1;let a=pick(r,1,4);while(a+m===0)a=pick(r,1,4);const c=a*x+y;
  if(surface==='numeric')return num(SYS,`Solve y = ${m}x ${signed(b1)} and ${a}x + y = ${c}. What is x?`,x,[[y,'That is the y-coordinate.'],[-x,'That reverses the solution sign.']],`Substitution gives ${a}x + (${m}x ${signed(b1)}) = ${c}, so x = ${x}.`,0,{kind:'linear-system',a1:-m,b1:1,c1:b1,a2:a,b2:1,c2:c,x,y,ask:'x'});
  return mcq(r,SYS,`What is the solution of y = ${m}x ${signed(b1)} and ${a}x + y = ${c}?`,[`(${x}, ${y})`,'The ordered pair satisfies both equations.'],[`(${y}, ${x})`,'The coordinates are reversed.'],[`(${x}, ${y+1})`,'This keeps x but fails the isolated y-equation.'],[`(${x+1}, ${y})`,'This keeps y but changes the required input.']);
 }
 if(concept==='word-choose-interpret'){
  const x=pick(r,2,8),y=pick(r,2,10),p=pick(r,3,9),q=pick(r,1,p-1),total=x+y,revenue=p*x+q*y;
  if(surface==='numeric')return num(SYS,`${total} items sell for ${dollars(revenue)}. Type A costs ${dollars(p)} and type B costs ${dollars(q)}. How many type A items were sold?`,x,[[y,'That is the number of type B items.'],[total,'That is the total item count.']],`Solving x + y = ${total} and ${p}x + ${q}y = ${revenue} gives x = ${x}.`,0,{kind:'linear-system',a1:1,b1:1,c1:total,a2:p,b2:q,c2:revenue,x,y,ask:'x'});
  return mcq(r,SYS,`A system solution is (${x}, ${y}), where x is adults and y is children. How many children attended?`,[String(y),'The second coordinate represents y, the number of children.'],[String(x),'That is the first coordinate, representing adults.'],[String(x+y),'That is the total attendance, not the child count.'],[String(Math.abs(x-y)),'That is the difference between the groups.']);
 }
 if(concept==='word-count-value'){
  const x=pick(r,2,8),y=pick(r,2,10),v1=choose(r,[10,25] as const),v2=choose(r,[5,8] as const),total=x+y,value=v1*x+v2*y,ask=r()<0.5?'first':'second';return num(SYS,`There are ${total} objects worth ${value} cents total. First type is ${v1} cents and second type is ${v2} cents. How many ${ask}-type objects are there?`,ask==='first'?x:y,[[ask==='first'?y:x,'That is the count of the other type.'],[total,'That is the combined count.']],`The count-and-value system solves to (${x}, ${y}), so the ${ask} count is ${ask==='first'?x:y}.`,0,{kind:'linear-system',a1:1,b1:1,c1:total,a2:v1,b2:v2,c2:value,x,y,ask:ask==='first'?'x':'y'});
 }
 const x=pick(r,6,20),y=pick(r,2,x-1),total=x+y,diff=x-y;return num(SYS,`Two numbers have sum ${total} and the larger exceeds the smaller by ${diff}. What is the larger number?`,x,[[y,'That is the smaller number.'],[total,'That is the sum, not either number.']],`Solving x + y = ${total} and x - y = ${diff} gives the larger number ${x}.`,0,{kind:'linear-system',a1:1,b1:1,c1:total,a2:1,b2:-1,c2:diff,x,y,ask:'x'});
}

const FORMS:Record<string,string[]> = {
 [EXP]: ['exp-compare__mcq','exp-compare__numeric','exp-graph-read__mcq','exp-graph-read__numeric','exp-growth-decay__mcq','exp-growth-decay__numeric','exp-match-base__mcq','exp-match-base__numeric','exp-percent__mcq','exp-percent__numeric','exp-vs-linear__mcq','exp-vs-linear__numeric'],
 [POLY]: ['exponent-power__mcq','exponent-power__numeric','exponent-zero-negative__mcq','exponent-zero-negative__numeric','factor-difference-squares__buildExpression','factor-difference-squares__numeric','factor-gcf__buildExpression','factor-gcf__numeric','factor-trinomial__buildExpression','factor-trinomial__numeric','poly-mul-binomial__mcq','poly-mul-binomial__numeric','poly-special-products__mcq','poly-special-products__numeric'],
 [FS]: ['fn-arith-rule__numeric','fn-choose-formula__numeric','fn-classify__mcq','fn-common-ratio__numeric','fn-domain-range__buildExpression','fn-domain-range__mcq','fn-geo-nth__numeric','fn-geo-rule__numeric','fn-growth-apply__numeric'],
 [LF]: ['form-conversion__numeric','intercepts__buildExpression','intercepts__numeric','line-from-point-slope__mcq','line-from-point-slope__numeric','line-from-two-points__numeric','parallel-perpendicular__mcq','parallel-perpendicular__numeric','point-slope-read__buildExpression','point-slope-read__mcq','slope-formula__mcq','slope-intercept-graph__mcq','slope-intercept-graph__numeric','slope-intercept-read__mcq','slope-intercept-read__numeric','slope-sign__matchPairs','standard-form__mcq','standard-form__numeric'],
 [Q]: ['quad-apply-choose__numeric','quad-diff-squares-solve__numeric','quad-discriminant__numeric','quad-factor-solve__mcq','quad-factor-solve__numeric','quad-formula__mcq','quad-formula__numeric','quad-projectile__numeric','quad-square-root__numeric','quad-standard-axis__numeric','quad-transform__mcq','quad-transform__numeric','quad-vertex-form__mcq','quad-vertex-form__numeric','quad-zero-product__numeric'],
 [RAD]: ['rad-distance__numeric','rad-distribute__numeric','rad-fully-simplified__mcq','rad-fully-simplified__numeric','rad-like-terms__numeric','rad-mn-exp__numeric','rad-multiply__numeric','rad-perfect-square__numeric','rad-pythagorean-radical__mcq','rad-pythagorean-radical__numeric','rad-pythagorean__numeric','rad-simplify-factor__mcq','rad-simplify-factor__numeric','rad-unit-fraction-exp__numeric'],
 [SE]: ['both-sides-inequality__buildExpression','both-sides-inequality__mcq','both-sides__mcq','both-sides__numeric','decimal-eq__mcq','decimal-eq__numeric','distribute-solve__mcq','distribute-solve__numeric','flip-rule__buildExpression','flip-rule__mcq','fraction-eq__mcq','fraction-eq__numeric','lcd-clear__mcq','lcd-clear__numeric','literal-eq__mcq','literal-eq__numeric','literal-frac__mcq','literal-frac__numeric','multi-literal__mcq','multi-literal__numeric','solve-inequality__mcq','solve-inequality__numeric','two-step__mcq'],
 [SYS]: ['classify-systems__mcq','eliminate-add-subtract__numeric','eliminate-scale-both__mcq','eliminate-scale-both__numeric','eliminate-scale-one__numeric','solve-by-graphing__mcq','solve-by-graphing__numeric','substitution-solve__mcq','substitution-solve__numeric','system-solution__mcq','system-solution__numeric','word-choose-interpret__mcq','word-choose-interpret__numeric','word-count-value__numeric','word-total-difference__numeric'],
};
const handlers:Record<string,(r:Rand,b:Band,f:string)=>Variant>={[EXP]:exponential,[POLY]:polynomials,[FS]:functionsSequences,[LF]:linearFunctions,[Q]:quadratics,[RAD]:radicals,[SE]:solvingEquations,[SYS]:systems};
export const ALGEBRA1_GENERATORS:VariantGen[]=Object.keys(FORMS).map(tag=>({tag,label:`Algebra I reusable variants: ${tag}`,forms:FORMS[tag] as never[],declarationOnly:true,gen:(r,b='core',f='default')=>polishVariant(handlers[tag](r,b,f))}));
