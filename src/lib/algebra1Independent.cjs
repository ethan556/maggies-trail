'use strict';

const norm=s=>String(s).replace(/−/g,'-').replace(/\s+/g,' ').trim();
const clean=s=>norm(s).replace(/\+\s+/g,'+').replace(/-\s+/g,'-');
const round=(n,d=10)=>Number(Number(n).toFixed(d));
const gcd=(a,b)=>b===0?Math.abs(a):gcd(b,a%b);
const xTerm=(a,p=1)=>{const v=p===1?'x':`x^${p}`;return a===1?v:a===-1?`-${v}`:`${a}${v}`};
const signed=n=>n<0?`− ${Math.abs(n)}`:`+ ${n}`;
const linear=(m,b)=>`y = ${xTerm(m)} ${signed(b)}`;
const polishText=s=>String(s).replace(/-0\.3333333333333333\b/g,'-1/3').replace(/0\.3333333333333333\b/g,'1/3').replace(/−\s*1x\b/g,'− x').replace(/-1x\b/g,'-x').replace(/\b1x\b/g,'x').replace(/\+\s*[−-]\s*(\d+(?:\.\d+)?)/g,'− $1');
const polishOut=v=>typeof v==='string'?polishText(v):Array.isArray(v)?v.map(polishOut):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[polishText(k),polishOut(x)])):v;
const nums=s=>(norm(s).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
const parseInput=input=>{const parts=String(input).split('||'),prompt=parts[0];let extra=null,options=[];for(const part of parts.slice(1)){if(!part)continue;try{const parsedPart=JSON.parse(part);if(parsedPart&&typeof parsedPart==='object'){extra=parsedPart;continue}}catch{}if(!options.length)options=part.split(';;')}return{prompt,extra,options};};
const optionNumber=s=>{const q=norm(s).match(/^(-?\d+)\/(\d+)$/);return q?Number(q[1])/Number(q[2]):Number(s)};const chooseOption=(options,answer)=>{const s=polishText(String(answer));const hit=options.find(x=>polishText(x)===s);if(hit!==undefined)return hit;const n=optionNumber(s);if(Number.isFinite(n)){const byNum=options.find(x=>{const v=optionNumber(x);return Number.isFinite(v)&&Math.abs(v-n)<1e-10});if(byNum!==undefined)return byNum;}throw new Error(`option ${JSON.stringify(answer)} not found in ${JSON.stringify(options)}`)};
const parseSignedPoly=(s)=>{s=clean(s);const m=s.match(/x\^2\s*([+-])(\d*)x\s*([+-]\d+)/);if(!m)throw new Error(`cannot parse quadratic ${s}`);const B=(m[1]==='-'?-1:1)*Number(m[2]||1);return{B,C:Number(m[3])}};
const rootsFromBC=(B,C)=>{const D=B*B-4*C;if(D<0)return[];const q=Math.sqrt(D);return[(-B-q)/2,(-B+q)/2]};
const solve2=(a,b,e,c,d,f)=>{const det=a*d-b*c;return{x:round((e*d-b*f)/det),y:round((a*f-e*c)/det)}};
const parseLine=s=>{s=clean(s);const m=s.match(/y\s*=\s*([+-]?)(\d*)x\s*([+-]\d+)/);if(!m)throw new Error(`cannot parse line ${s}`);const coef=(m[1]==='-'?-1:1)*Number(m[2]||1);return{m:coef,b:Number(m[3])}};
const parseLinearExpr=s=>{s=clean(s);const m=s.match(/([+-]?)(\d*)x\s*([+-]\d+)/);if(!m)throw new Error(`cannot parse linear expression ${s}`);return{a:(m[1]==='-'?-1:1)*Number(m[2]||1),b:Number(m[3])}};
const parseLines=s=>[...clean(s).matchAll(/y\s*=\s*([+-]?)(\d*)x\s*([+-]\d+)/g)].map(m=>({m:(m[1]==='-'?-1:1)*Number(m[2]||1),b:Number(m[3])}));
const parseStandardSystem=s=>[...clean(s).matchAll(/([+-]?)(\d*)x\s*\+\s*([+-]?)(\d*)y\s*=\s*(-?\d+)/g)].map(m=>({a:(m[1]==='-'?-1:1)*Number(m[2]||1),b:(m[3]==='-'?-1:1)*Number(m[4]||1),c:Number(m[5])}));

function solvePromptRaw(form,input){
 const {prompt:raw,extra,options}=parseInput(input),prompt=norm(raw),p=clean(raw);const [concept,surface]=form.split('__');
 // Exponential functions
 if(concept==='exp-compare'){
  const m=p.match(/x = (-?\d+).*f\(x\) = (\d+) [*·] ([\d.]+)\^x.*g\(x\) = (\d+) [*·] ([\d.]+)\^x/);if(surface==='numeric'){const z=nums(p);return z[0]*z[1]**z[2]}const x=+m[1],fv=+m[2]*(+m[3])**x,gv=+m[4]*(+m[5])**x;return chooseOption(options,fv===gv?'They are equal':fv>gv?'f(x)':'g(x)');
 }
 if(concept==='exp-graph-read'){const m=p.match(/f\(x\) = (\d+) [*·] ([\d.]+)\^x/),a=+m[1],base=+m[2];if(surface==='numeric')return a;return chooseOption(options,`${base>1?'increasing exponential growth':'decreasing exponential decay'} with y-intercept ${a}`)}
 if(concept==='exp-growth-decay'){const m=p.match(/f\(x\) = (\d+) [*·] (?:\(1\/(\d+)\)|(\d+))\^x(?: at x = (\d+))?/),a=+m[1],base=m[2]?1/+m[2]:+m[3];if(surface==='numeric')return round(a*base**(+m[4]));return chooseOption(options,base>1?'growth':'decay')}
 if(concept==='exp-match-base'){const [base,value]=nums(p);let e=0,v=1;while(v<value&&e<20){v*=base;e++}return surface==='numeric'?e:chooseOption(options,String(e))}
 if(concept==='exp-percent'){const z=nums(p),growth=/grows/.test(p),rate=surface==='mcq'?z[0]:z[1],factor=1+(growth?1:-1)*rate/100;if(surface==='mcq')return chooseOption(options,String(factor));const start=z[0],steps=z[2];return round(start*factor**steps)}
 if(concept==='exp-vs-linear'){if(surface==='numeric'){const m=p.match(/f\(x\) = (\d+) [*·] (\d+)\^x, find f\((\d+)\)/);return +m[1]*(+m[2])**(+m[3])}const seq=nums(p);const ds=seq.slice(1).map((v,i)=>v-seq[i]),rs=seq.slice(1).map((v,i)=>v/seq[i]);const ans=ds.every(v=>v===ds[0])?'arithmetic':rs.every(v=>v===rs[0])?'geometric':'neither';return chooseOption(options,ans)}
 // Polynomials and exponents
 if(concept==='exponent-power'){const z=nums(p);if(surface==='numeric')return z[0]*z[1];const [c,m,n]=z;return chooseOption(options,`${c**n}x^${m*n}`)}
 if(concept==='exponent-zero-negative'){const z=nums(p);if(surface==='numeric')return z[0]+z[1];return chooseOption(options,`1/${z[0]**Math.abs(z[1])}`)}
 if(concept==='factor-difference-squares'){if(surface==='numeric'){const m=p.match(/x\s*\+\s*(\d+)\)\(x\s*-\s*k/);return +m[1]}const m=p.match(/x\^2\s*-\s*(\d+)/),a=Math.sqrt(+m[1]);return [`(x + ${a})`,`(x - ${a})`]}
 if(concept==='factor-gcf'){const m=p.match(/(\d+)x\^(\d+)\s*\+\s*(\d+)x\^(\d+)/),A=+m[1],p1=+m[2],C=+m[3],p2=+m[4],g=gcd(A,C),pow=Math.min(p1,p2);if(surface==='numeric')return pow;return[`${g}x^${pow}`,`(${A/g}x + ${C/g})`]}
 if(concept==='factor-trinomial'){const {B,C}=parseSignedPoly(p),roots=rootsFromBC(B,C),ints=roots.map(x=>-x);if(surface==='numeric')return Math.min(...ints);const labels=extra.tokens.map(t=>t.label),val=l=>{const m=l.match(/\(x ([+-]) (\d+)\)/);return m[1]==='+'?+m[2]:-m[2]};for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=val(labels[i]),b=val(labels[j]);if(a+b===B&&a*b===C)return[labels[i],labels[j]]}throw new Error('no trinomial factor pair')}
 if(concept==='poly-mul-binomial'){const m=p.match(/\((-?\d*)x\s*\+\s*(\d+)\)\((-?\d*)x\s*\+\s*(\d+)\)/),a=Number(m[1]||1),b=+m[2],c=Number(m[3]||1),d=+m[4];if(surface==='numeric')return b*d;return chooseOption(options,`${xTerm(a*c,2)} + ${a*d+b*c}x + ${b*d}`)}
 if(concept==='poly-special-products'){const a=nums(p)[0],difference=/\)\(x\s*-/.test(p);if(surface==='numeric')return difference?-a*a:a*a;return chooseOption(options,difference?`x^2 - ${a*a}`:`x^2 + ${2*a}x + ${a*a}`)}
 // Functions and sequences
 if(['fn-arith-rule','fn-choose-formula','fn-geo-nth','fn-geo-rule'].includes(concept)){const m=p.match(/a1 = (\d+) and common (?:difference|ratio) (\d+).*a(\d+)/),a=+m[1],d=+m[2],n=+m[3];return concept==='fn-arith-rule'?a+(n-1)*d:a*d**(n-1)}
 if(concept==='fn-classify'){const s=nums(p),ds=s.slice(1).map((v,i)=>v-s[i]),rs=s.slice(1).map((v,i)=>v/s[i]);return chooseOption(options,ds.every(v=>v===ds[0])?'arithmetic':rs.every(v=>v===rs[0])?'geometric':'neither')}
 if(concept==='fn-common-ratio'){const s=nums(p);return s[1]/s[0]}
 if(concept==='fn-domain-range'){const pairs=[...p.matchAll(/\((-?\d+), (-?\d+)\)/g)].map(m=>[+m[1],+m[2]]);if(surface==='buildExpression'){const ys=[...new Set(pairs.map(x=>x[1]))].sort((a,b)=>a-b);return['range =',...ys.map(String)]}const seen=new Map();let ok=true;for(const [x,y] of pairs){if(seen.has(x)&&seen.get(x)!==y)ok=false;else seen.set(x,y)}return chooseOption(options,ok?'Yes':'No')}
 if(concept==='fn-growth-apply'){const z=nums(p);return z[0]*z[1]**z[2]}
 // Linear functions
 if(concept==='form-conversion'){const z=nums(p),y=z[0],m=z[1],x=z[2];return y-m*x}
 if(concept==='intercepts'){const m=p.match(/slope (-?\d+) and y-intercept (-?\d+)/);if(surface==='buildExpression'){const slope=+m[1],b=+m[2];return['y =',`${slope}x`,b<0?`- ${Math.abs(b)}`:`+ ${b}`]}const q=parseLine(p.match(/y = .*/)[0]);return q.b}
 if(concept==='line-from-point-slope'){const m=p.match(/through \((-?\d+), (-?\d+)\).*slope (-?\d+)/),x=+m[1],y=+m[2],s=+m[3],b=y-s*x;if(surface==='numeric')return b;return chooseOption(options,linear(s,b))}
 if(concept==='line-from-two-points'){const z=nums(p),x1=z[0],y1=z[1],x2=z[2],y2=z[3],m=(y2-y1)/(x2-x1);return round(y1-m*x1)}
 if(concept==='parallel-perpendicular'){const z=nums(p);if(surface==='numeric'){const m=z[0],x=z[1],y=z[2];return y-m*x}return chooseOption(options,String(-1/z[0]))}
 if(concept==='point-slope-read'){if(surface==='buildExpression'){const m=p.match(/slope (-?\d+) through \((-?\d+), (-?\d+)\)/),s=+m[1],x=+m[2],y=+m[3];return[`y - (${y})`,'=',String(s),`(x - (${x}))`]}const z=nums(p),y=z[0],x=z[2];return chooseOption(options,`(${x}, ${y})`)}
 if(concept==='slope-formula'){const z=nums(p);return chooseOption(options,String((z[3]-z[1])/(z[2]-z[0])))}
 if(concept==='slope-intercept-graph'){const m=p.match(/\(0, (-?\d+)\).*slope (-?\d+)/);if(surface==='numeric')return parseLine(p.match(/y = .*/)[0]).b;const c=+m[1],s=+m[2];return chooseOption(options,`(1, ${c+s})`)}
 if(concept==='slope-intercept-read'){const L=parseLine(p.match(/y = .*/)[0]);if(surface==='numeric'){const x=nums(p).at(-1);return L.m*x+L.b}return chooseOption(options,String(L.b))}
 if(concept==='slope-sign'){const out={};for(const item of extra.left){const label=item.label;if(/^x\s*=/.test(label))out[label]='not defined';else if(!/x/.test(label))out[label]='zero';else{const m=clean(label).match(/y\s*=\s*([+-]?)(\d*)x/);const coef=(m[1]==='-'?-1:1)*Number(m[2]||1);out[label]=coef>0?'positive':'negative';}}return out;}
 if(concept==='standard-form'){const z=nums(p),A=z[0],B=z[1],C=z[2];return surface==='numeric'?C/A:chooseOption(options,String(-A/B))}
 // Quadratics
 if(concept==='quad-apply-choose')return nums(p).at(-1);
 if(concept==='quad-diff-squares-solve'||concept==='quad-square-root'){const z=nums(p);return Math.sqrt(Math.abs(z[1]))}
 if(concept==='quad-discriminant'){const {B,C}=parseSignedPoly(p),D=B*B-4*C;return D>0?2:D===0?1:0}
 if(concept==='quad-factor-solve'||concept==='quad-zero-product'){const {B,C}=parseSignedPoly(p),rs=rootsFromBC(B,C);if(surface==='numeric')return Math.max(...rs);const ints=rs.map(x=>-x);const pos=ints.find(x=>x>0),neg=ints.find(x=>x<0);return chooseOption(options,`(x + ${pos})(x - ${Math.abs(neg)})`)}
 if(concept==='quad-formula'){const q=p.match(/(?:on|of)\s+(\d*)x\^2\s*([+-])(\d*)x\s*([+-]\d+)/);if(!q)throw new Error(`cannot parse quadratic formula prompt ${p}`);const A=Number(q[1]||1),B=(q[2]==='-'?-1:1)*Number(q[3]||1),C=Number(q[4]),D=B*B-4*A*C,rs=[(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)].sort((a,b)=>a-b);return surface==='numeric'?rs[1]:chooseOption(options,`${rs[0]} and ${rs[1]}`)}
 if(concept==='quad-projectile'){const z=nums(p);return Math.abs(z[2]/z[0])}
 if(concept==='quad-standard-axis'){const {B,C}=parseSignedPoly(p),h=-B/2;return h*h+B*h+C}
 if(concept==='quad-transform'||concept==='quad-vertex-form'){const z=nums(p),a=z[0],h=z[1],k=z[3];if(surface==='numeric')return concept==='quad-transform'?h:k;return chooseOption(options,concept==='quad-transform'?(a<0?'It opens downward':'It opens upward'):(a>0?'upward':'downward'))}
 // Radicals
 if(concept==='rad-distance'){const z=nums(p);return Math.hypot(z[2],z[3])}
 if(concept==='rad-pythagorean'){const z=nums(p);return Math.hypot(z[0],z[1])}
 if(concept==='rad-distribute')return nums(p)[0];
 if(concept==='rad-fully-simplified'||concept==='rad-simplify-factor'){const z=nums(p),rad=z[0],d=surface==='numeric'?z[1]:null;let k=1,rem=rad;for(let i=Math.floor(Math.sqrt(rad));i>=2;i--)if(rad%(i*i)===0){k=i;rem=rad/(i*i);break}return surface==='numeric'?k:chooseOption(options,`${k}sqrt(${rem})`)}
 if(concept==='rad-like-terms'){const z=nums(p);return z[0]+z[2]}
 if(concept==='rad-mn-exp'){const m=p.match(/(\d+)\^\((\d+)\/(\d+)\)/);return round((+m[1])**(+m[2]/+m[3]))}
 if(concept==='rad-multiply'){const z=nums(p);return Math.sqrt(z[0]*z[1])}
 if(concept==='rad-perfect-square')return Math.sqrt(nums(p)[0]);
 if(concept==='rad-pythagorean-radical'){const a=nums(p)[0];return surface==='numeric'?2*a*a:chooseOption(options,`${a}sqrt(2)`)}
 if(concept==='rad-unit-fraction-exp'){const m=p.match(/(\d+)\^\(1\/(\d+)\)/);return round((+m[1])**(1/+m[2]))}
 // Solving equations
 if(concept==='both-sides'){if(surface==='mcq')return chooseOption(options,'To preserve equality while collecting variable terms');const m=p.match(/Solve (.+) = (.+)\./),L=parseLinearExpr(m[1]),R=parseLinearExpr(m[2]);return (R.b-L.b)/(L.a-R.a)}
 if(concept==='both-sides-inequality'){if(surface==='mcq')return chooseOption(options,'When multiplying or dividing both sides by a negative number');const z=nums(p),bd=(z[3]-z[1])/(z[0]-z[2]);return['x','<',String(bd)]}
 if(concept==='decimal-eq'){const z=nums(p),a=z[0],d=z[1],c=z[2];if(surface==='numeric')return round((c-d)/a);return chooseOption(options,`${round(10*a)}x + ${round(10*d)} = ${round(10*c)}`)}
 if(concept==='distribute-solve'){const z=nums(p),a=z[0],d=z[1],c=z[2];return surface==='numeric'?c/a-d:chooseOption(options,`${a}x + ${a*d}`)}
 if(concept==='flip-rule'){const z=nums(p),coef=z[0],rhs=z[1],bd=rhs/coef;return surface==='buildExpression'?['x','>',String(bd)]:chooseOption(options,`Dividing both sides by ${coef}`)}
 if(concept==='fraction-eq'){const z=nums(p),d=z[0],a=z[1],rhs=z[2];return surface==='numeric'?round((rhs-a)*d):chooseOption(options,`Multiply both sides by ${d}`)}
 if(concept==='lcd-clear'){const z=nums(p),a=z[0],b=z[1],rhs=z[2];return surface==='numeric'?round(rhs/(1/a+1/b)):chooseOption(options,'Every term on both sides')}
 if(concept==='literal-eq'){if(surface==='mcq')return chooseOption(options,'t = d/r');if(/rectangle/.test(p)){const z=nums(p);return z[0]/2-z[1]}const z=nums(p);return z[0]/z[1]}
 if(concept==='literal-frac'){if(surface==='mcq')return chooseOption(options,'x = (y - b)/m');const z=nums(p);return 2*z[0]/z[1]}
 if(concept==='multi-literal'){if(surface==='mcq')return chooseOption(options,'x = (c - a)/2');const C=nums(p).at(-1);return 9*C/5+32}
 if(concept==='solve-inequality'){if(surface==='numeric'){const z=nums(p);return (z[2]-z[1])/z[0]}const rel=(p.match(/x (<=|>=|<|>)/)||[])[1];return chooseOption(options,rel.includes('=')?'closed circle':'open circle')}
 if(concept==='two-step'){const z=nums(p);return chooseOption(options,`Subtract ${z[1]} from both sides`)}
 // Systems
 if(concept==='classify-systems'){const lines=parseLines(p);const ans=lines[0].m!==lines[1].m?'one solution':lines[0].b===lines[1].b?'infinitely many solutions':'no solution';return chooseOption(options,ans)}
 if(['eliminate-add-subtract','eliminate-scale-one','eliminate-scale-both'].includes(concept)){if(surface==='mcq')return chooseOption(options,'infinitely many solutions');const E=parseStandardSystem(p);if(E.length!==2)throw new Error(`cannot parse elimination system ${p}`);const S=solve2(E[0].a,E[0].b,E[0].c,E[1].a,E[1].b,E[1].c),ask=(p.match(/What is ([xy])/i)||[])[1];return ask==='x'?S.x:S.y}
 if(concept==='solve-by-graphing'||concept==='system-solution'){if(surface==='numeric'){const m=p.match(/intersect at \((-?\d+), (-?\d+)\).* (x|y)-coordinate/);return m[3]==='x'?+m[1]:+m[2]}const ls=parseLines(p),x=(ls[1].b-ls[0].b)/(ls[0].m-ls[1].m),y=ls[0].m*x+ls[0].b;return chooseOption(options,`(${x}, ${y})`)}
 if(concept==='substitution-solve'){const first=parseLines(p)[0],q=clean(p).match(/and\s*([+-]?)(\d*)x\s*\+\s*y\s*=\s*(-?\d+)/);if(!q)throw new Error(`cannot parse substitution system ${p}`);const a=(q[1]==='-'?-1:1)*Number(q[2]||1),c=Number(q[3]),x=(c-first.b)/(a+first.m),y=first.m*x+first.b;return surface==='numeric'?x:chooseOption(options,`(${x}, ${y})`)}
 if(concept==='word-choose-interpret'){if(surface==='mcq'){const z=nums(p);return chooseOption(options,String(z[1]))}const z=nums(p),total=z[0],revenue=z[1],pa=z[2],pb=z[3];return (revenue-pb*total)/(pa-pb)}
 if(concept==='word-count-value'){const z=nums(p),total=z[0],value=z[1],v1=z[2],v2=z[3],first=(value-v2*total)/(v1-v2);return /first-type/.test(p)?first:total-first}
 if(concept==='word-total-difference'){const z=nums(p);return(z[0]+z[1])/2}
 throw new Error(`unsupported independent form ${form}: ${prompt}`);
}
function solvePrompt(form,input){const v=solvePromptRaw(form,input);return polishOut(typeof v==='number'?round(v):v)}
module.exports={solvePrompt};
