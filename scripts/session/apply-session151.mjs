import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const index=JSON.parse(fs.readFileSync(path.join(root,'scripts/session/baselines-s151/index.json'),'utf8'));
const byId=new Map(index.targets.map(rel=>[path.basename(rel,'.json'),rel]));
const clone=x=>JSON.parse(JSON.stringify(x));
function step(doc,id){const found=doc.steps.find(s=>s.id===id);if(!found)throw new Error(`${doc.id}: missing step ${id}`);return found;}
function choiceSurface(old,correctClaim){return old.options.map(option=>({id:option.id,label:option.label,claim:option.correct?correctClaim:`wrong:${option.id}`,feedback:option.feedback}));}
function numericSurface(old){return{numericErrors:(old.commonErrors??[]).map(error=>({value:error.value,feedback:error.feedback})),tolerance:old.tolerance??0,fallbackFeedback:old.fallbackFeedback};}
function writeLesson(id,stepId,build){const rel=byId.get(id);if(!rel)throw new Error(`missing target ${id}`);const file=path.join(root,rel),doc=JSON.parse(fs.readFileSync(file,'utf8')),target=step(doc,stepId),old=clone(target.widget);target.widget=build(old);fs.writeFileSync(file,JSON.stringify(doc,null,2)+'\n');return{rel,stepId,old,newWidget:target.widget};}
const changes=[];
const equationConfigs={
 'alg1-01-02':{step:'i1',display:['5x + 2','3x + 10'],state:[5,2,3,10,'eq'],ops:[['b-collect','addVariable',-3],['b-sub','addConstant',-2],['b-div','scale',.5]]},
 'alg1-01-03':{step:'i1',display:['3(x + 4)','27'],state:[3,12,0,27,'eq'],ops:[['d-dist','normalize',null,{leftCoeff:3,leftConstant:12,rightCoeff:0,rightConstant:27,relation:'eq'}],['d-sub','addConstant',-12],['d-div','scale',1/3]]},
 'alg1-02-01':{step:'i1',display:['x/4 − 3','2'],state:[.25,-3,0,2,'eq'],ops:[['q-add','addConstant',3],['q-mul','scale',4],['q-chk','normalize']]},
 'alg1-02-02':{step:'i2',display:['x/2 + x/5','7'],state:[.7,0,0,7,'eq'],ops:[['n-lcd','normalize',null,{leftCoeff:7,leftConstant:0,rightCoeff:0,rightConstant:70,relation:'eq'}],['n-comb','normalize'],['n-div','scale',1/7]]},
 'alg1-02-03':{step:'i2',display:['0.2x + 3','4'],state:[.2,3,0,4,'eq'],ops:[['p-ten','normalize',null,{leftCoeff:2,leftConstant:30,rightCoeff:0,rightConstant:40,relation:'eq'}],['p-two','addConstant',-30],['p-div','scale',.5]]},
 'alg1-04-01':{step:'i1',display:['2x + 3','11'],state:[2,3,0,11,'lt'],ops:[['s-sub','addConstant',-3],['s-div','scale',.5],['s-read','normalize']]},
 'alg1-04-02':{step:'i2',display:['−3x + 1','10'],state:[-3,1,0,10,'gt'],ops:[['n-sub','addConstant',-1],['n-note','normalize'],['n-flip','scale',-1/3]]},
 'alg1-04-03':{step:'i1',display:['2x + 5','5x − 4'],state:[2,5,5,-4,'gt'],ops:[['b-collect','addVariable',-5],['b-const','addConstant',-5],['b-flip','scale',-1/3]]}
};
for(const [id,cfg] of Object.entries(equationConfigs))changes.push(writeLesson(id,cfg.step,old=>{
 const itemMap=new Map(old.items.map(item=>[item.id,item]));const special=new Map((old.misorderFeedback??[]).map(item=>[item.first,item.feedback]));
 const operations=cfg.ops.map(([id,kind,value,result])=>({id,label:itemMap.get(id).label,kind,...(value===null||value===undefined?{}:{value}),...(result?{result}:{}),feedback:special.get(id)??old.missFeedback}));
 const [leftCoeff,leftConstant,rightCoeff,rightConstant,relation]=cfg.state;
 return{type:'equationOutcomeLab',mode:'transform',answerMode:'sequence',prompt:old.prompt,leftDisplay:cfg.display[0],rightDisplay:cfg.display[1],leftCoeff,leftConstant,rightCoeff,rightConstant,relation,variable:'x',choices:[],operations,correctOrder:[...old.correctOrder],requiredMoves:old.correctOrder.length,numericErrors:[],tolerance:0,explorationFeedback:'Apply the same legal operation to both sides and inspect how the variable and constants move.',fallbackFeedback:old.missFeedback,successFeedback:old.successFeedback};
}));
const seqConfigs={
 'sr-01-01':{step:'i1',task:'ruleType',mode:'arithmetic',answerMode:'choice',first:4,difference:3,count:5,claim:'recursive:add:3'},
 'sr-01-03':{step:'i3',task:'termEvaluate',mode:'geometricTerm',answerMode:'numeric',first:4,ratio:3,position:3,count:5},
 'sr-02-01':{step:'i2',task:'sigmaEvaluate',mode:'arithmetic',answerMode:'numeric',first:3,lowerIndex:1,upperIndex:5,coefficient:2,constant:1,power:1},
 'sr-02-02':{step:'i1',task:'sigmaEvaluate',mode:'arithmetic',answerMode:'numeric',first:2,lowerIndex:1,upperIndex:4,coefficient:3,constant:-1,power:1},
 'sr-02-03':{step:'i1',task:'sigmaRepresent',mode:'arithmetic',answerMode:'choice',first:2,terms:[2,4,6,8,10,12,14,16,18,20],claim:'sigma:10:2:0'},
 'sr-03-01':{step:'i1',task:'arithmeticPair',mode:'arithmetic',answerMode:'numeric',first:1,difference:1,count:100,pairIndices:[0,99]},
 'sr-03-02':{step:'i1',task:'arithmeticSum',mode:'arithmetic',answerMode:'numeric',first:6,difference:5,count:12},
 'sr-03-03':{step:'i1',task:'arithmeticSum',mode:'arithmetic',answerMode:'numeric',first:20,difference:2,count:12},
 'sr-04-01':{step:'i1',task:'geometricPair',mode:'geometricTerm',answerMode:'numeric',first:3,ratio:2,count:4,terms:[3,6,12,24],pairIndices:[1,2]},
 'sr-04-02':{step:'i1',task:'geometricSum',mode:'geometricTerm',answerMode:'numeric',first:2,ratio:3,count:5},
 'sr-04-03':{step:'i1',task:'geometricSum',mode:'geometricTerm',answerMode:'numeric',first:4,ratio:3,count:5},
 'sr-05-03':{step:'i1',task:'repeatingDecimal',mode:'geometric',answerMode:'choice',first:.4,repeatingBlock:4,repeatingDigits:1,claim:'fraction:4/9'}
};
for(const [id,cfg] of Object.entries(seqConfigs))changes.push(writeLesson(id,cfg.step,old=>{
 const common={type:'sequenceBuild',prompt:old.prompt,mode:cfg.mode,task:cfg.task,answerMode:cfg.answerMode,first:cfg.first,targetD:1,atPosition:cfg.position??10,targetTerm:typeof old.answer==='number'?old.answer:0,targetRTenths:5,targetSum:typeof old.answer==='number'?old.answer:0,rMax:9,start:1,difference:cfg.difference,ratio:cfg.ratio,count:cfg.count,position:cfg.position,lowerIndex:cfg.lowerIndex,upperIndex:cfg.upperIndex,coefficient:cfg.coefficient,constant:cfg.constant,power:cfg.power,pairIndices:cfg.pairIndices,repeatingBlock:cfg.repeatingBlock,repeatingDigits:cfg.repeatingDigits,terms:cfg.terms,choices:old.type==='mcq'?choiceSurface(old,cfg.claim):[],numericErrors:old.type==='numeric'?(old.commonErrors??[]).map(error=>({value:error.value,feedback:error.feedback})):[],authoredStages:[],requiredStageKeys:[],requiredExplorations:2,tolerance:old.tolerance??0,fallbackFeedback:old.fallbackFeedback??'Inspect the sequence structure and use the exact terms.',explorationFeedback:'Open at least two exact sequence states before checking.',successFeedback:old.type==='mcq'?old.options.find(option=>option.correct).feedback:old.fallbackFeedback,lowFeedback:old.fallbackFeedback??'The current value is below the exact target.',highFeedback:old.fallbackFeedback??'The current value is above the exact target.'};
 return Object.fromEntries(Object.entries(common).filter(([,value])=>value!==undefined));
}));
const geomConfigs={
 'cx-02-01':{step:'i1',kind:'segmentPartition',points:[['A','A',1,1],['P','P',3,4],['B','B',7,10]],segment:{a:'A',p:'P',b:'B'}},
 'cx-02-02':{step:'i1',kind:'lineRelation',points:[['A','A',0,0],['B','B',3,1],['C','C',6,2]],segments:[['A','B'],['B','C']],claim:'line:collinear'},
 'cx-02-03':{step:'i1',kind:'vectorRotation',points:[['O','O',0,0],['V','V',2,1],['R','R',-1,2]],vector:[2,1],claim:'rotation:perpendicular-readable'},
 'cx-03-01':{step:'i1',kind:'triangleCertificate',points:[['A','A',0,0],['B','B',5,1],['C','C',2,4]],claim:'triangle:right:slope-or-converse'},
 'cx-03-03':{step:'i1',kind:'symmetricPlacement',points:[['A','A',-3,0],['B','B',3,0],['C','C',0,4]],claim:'placement:isosceles-symmetric'},
 'cx-04-01':{step:'i1',kind:'radicalPerimeter',points:[['A','A',0,0],['B','B',3,0],['C','C',3,3],['D','D',0,3]],sideRadicands:[18,18,18,18],claim:'perimeter:12sqrt2'},
 'cx-04-02':{step:'i1',kind:'boxAdvantage',points:[['A','A',0,0],['B','B',8,2],['C','C',10,8],['D','D',2,6]],claim:'area:box-axis-aligned-corners'},
 'cx-04-03':{step:'i1',kind:'shoelaceArea',points:[['A','A',4,1],['B','B',9,5],['C','C',6,7],['D','D',1,3]]},
 'cx-05-03':{step:'i1',kind:'circleLineIntersection',points:[],circle:{h:0,k:0,r:5},line:{m:1,b:1}}
};
for(const [id,cfg] of Object.entries(geomConfigs))changes.push(writeLesson(id,cfg.step,old=>{
 const coordinateProof={kind:cfg.kind,points:cfg.points.map(([pid,label,x,y])=>({id:pid,label,x,y})),...(cfg.segment?{segment:cfg.segment}:{}),...(cfg.segments?{segments:cfg.segments}:{}),...(cfg.vector?{vector:cfg.vector}:{}),...(cfg.sideRadicands?{sideRadicands:cfg.sideRadicands}:{}),...(cfg.circle?{circle:cfg.circle}:{}),...(cfg.line?{line:cfg.line}:{})};
 return{type:'geometricConstraintLab',task:'coordinateProof',answerMode:old.type==='numeric'?'numeric':'choice',prompt:old.prompt,coordinateProof,answerUnit:'',tolerance:old.tolerance??0,choices:old.type==='mcq'?choiceSurface(old,cfg.claim):[],numericErrors:old.type==='numeric'?(old.commonErrors??[]).map(error=>({value:error.value,feedback:error.feedback})):[],authoredStages:[],requiredStageKeys:[],requiredExplorations:2,successFeedback:old.type==='mcq'?old.options.find(option=>option.correct).feedback:old.fallbackFeedback,explorationFeedback:'Open at least two coordinate-proof states before checking.',fallbackFeedback:old.fallbackFeedback??'Inspect the coordinate invariants, then choose the supported conclusion.'};
}));
fs.writeFileSync(path.join(root,'scripts/session/session151-applied.json'),JSON.stringify({session:151,changes:changes.map(({rel,stepId,old,newWidget})=>({rel,stepId,oldType:old.type,newType:newWidget.type}))},null,2)+'\n');
console.log(`Session 151 applied: ${changes.length} lesson anchors converted.`);
