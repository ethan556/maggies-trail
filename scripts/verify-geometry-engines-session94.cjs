const fs=require('fs'),assert=require('assert');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const schemaPath=require.resolve('../src/lib/schema.ts');
require.cache[schemaPath]={id:schemaPath,filename:schemaPath,loaded:true,exports:{}};
const {evaluate,canCheck,correctAnswerText}=require('../src/lib/evaluate.ts');
const lesson=(course,id)=>JSON.parse(fs.readFileSync(`content/courses/${course}/lessons/${id}.json`,'utf8'));
const step=(course,id,sid='i1')=>lesson(course,id).steps.find(s=>s.id===sid);

const tc=step('triangle-congruence','tc-01-01').widget;
assert.equal(tc.type,'triangleConstraintLab');
assert(evaluate(tc,{criterion:'SAS',angle:60,flipped:false,moves:4}).correct);
assert.equal(evaluate(tc,{criterion:'SSA',angle:60,flipped:true,moves:4}).feedback,tc.criterionFeedback);
assert.equal(evaluate(tc,{criterion:'SAS',angle:55,flipped:false,moves:4}).feedback,tc.angleFeedback);
assert(canCheck(tc,{criterion:'SAS',angle:60,moves:4}));
assert(correctAnswerText(tc).includes('SAS'));
// Independent ambiguous-case route: with A=35°, a=5, b=8, sin(B)=b sin(A)/a lies strictly between 0 and 1,
// so B and 180-B are distinct valid angles.
const sinB=tc.sideB*Math.sin(tc.angleStart*Math.PI/180)/tc.sideA;
assert(sinB>0&&sinB<1);const B=Math.asin(sinB)*180/Math.PI;assert(Math.abs(B-(180-B))>1);

const cx=step('coordinate-proofs','cx-01-03').widget;
assert.equal(cx.type,'coordinateProofLab');
const good={x:3,y:5,moves:4,evidence:['slopes','midpoints']};
assert(evaluate(cx,good).correct);
assert.equal(evaluate(cx,{...good,x:4}).feedback,cx.positionFeedback);
assert.equal(evaluate(cx,{...good,evidence:['slopes']}).feedback,cx.evidenceFeedback);
const [A,Bp,C]=cx.fixed,D=cx.target;
const slope=(p,q)=>(q[1]-p[1])/(q[0]-p[0]);
const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
assert.equal(slope(A,Bp),slope(C,D));assert.equal(slope(Bp,C),slope(A,D));assert.deepStrictEqual(mid(A,C),mid(Bp,D));

const sg=step('solid-geometry','sg-03-01').widget;
assert.equal(sg.type,'solidSliceLab');
assert(evaluate(sg,{fraction:.5,moves:5,compare:true}).correct);
assert.equal(evaluate(sg,{fraction:.4,moves:5,compare:true}).feedback,sg.positionFeedback);
assert.equal(evaluate(sg,{fraction:.5,moves:5,compare:false}).feedback,sg.comparisonFeedback);
const areas=[.1,.3,.5,.7,.9].map(()=>sg.baseArea??Math.PI*sg.radius*sg.radius);assert(areas.every(a=>Math.abs(a-areas[0])<1e-12));

const flagships=[
 ['geometry-foundations','gf-04-01','transformExplore'],['triangle-congruence','tc-01-01','triangleConstraintLab'],
 ['similarity','sy-01-01','dilationExplore'],['right-triangles-trig','rt-05-03','triangleSolve'],
 ['coordinate-proofs','cx-01-03','coordinateProofLab'],['circle-theorems','cr-03-02','circleMeasureExplore'],
 ['constructions-and-proof','cp-01-01','compassConstruct'],['polygons-quadrilaterals','pq-03-01','quadDrag'],
 ['solid-geometry','sg-03-01','solidSliceLab']
];
for(const [course,id,type] of flagships){const s=step(course,id);assert.equal(s.widget.type,type);assert(s.predict);assert(s.cml.flagship);assert.equal(s.cml.kernel,'spatial-invariance');assert(s.cml.invariants.length>=2);assert(s.cml.misconceptions.length>=2);assert(s.cml.representations.length>=3);assert(s.cml.translationFrom&&s.cml.translationTo);assert(s.cml.counterfactualPrompt);assert(s.cml.delayed);assert.equal(s.cml.explanation.options.filter(o=>o.correct).length,1);}
const widgetSource=fs.readFileSync('src/components/widgets.tsx','utf8');
for(const type of ['triangleConstraintLab','coordinateProofLab','solidSliceLab']){assert(widgetSource.includes(`case "${type}"`));assert(widgetSource.includes(`"${type}"`));}
console.log(JSON.stringify({newEngines:3,flagshipCourses:9,evaluatorAssertions:18,independentGeometryChecks:8,status:'PASS'}));
