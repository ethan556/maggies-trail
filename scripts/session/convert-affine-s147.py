#!/usr/bin/env python3
import json,glob,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
TARGETS=['bv-02-03','fg-03-02','fg-03-03','les-04-02','les-04-03']
def line(id,label,m,b,source,kind='equation',points=None):return {'id':id,'label':label,'m':m,'b':b,'sourceKind':kind,'sourceText':source,'tablePoints':points or []}
def req(task,lines,target=None):
 t=target or lines[0]['id']
 if task in ('readSlope','slopeAssociation'): return 1,[f'line:{t}:slope']
 if task=='readIntercept': return 1,[f'line:{t}:intercept']
 if task=='evaluateAtX': return 2,[f'evaluate:{t}:substitute',f'evaluate:{t}:value']
 if task=='compareStart': return min(len(lines)+1,4),[*[f'line:{x["id"]}:intercept' for x in lines],'compare:starts']
 if task=='compareRate': return min(len(lines)+1,4),[*[f'line:{x["id"]}:slope' for x in lines],'compare:rates']
 if task=='compareRateAndStart': return min(len(lines)*2+2,6),[*[k for x in lines for k in (f'line:{x["id"]}:slope',f'line:{x["id"]}:intercept')],'compare:rates','compare:starts']
 if task=='verifyPoint': return len(lines),[f'verify:{x["id"]}' for x in lines]
 if task.startswith('intersection'): return 3,['intersection:equate','intersection:x','intersection:verify' if task=='intersectionX' else 'intersection:y']
 return min(len(lines)*2,4),[k for x in lines for k in (f'line:{x["id"]}:slope',f'line:{x["id"]}:intercept')]
def cfg(task,lines,target=None,rateGoal='greater',candidate=None,targetInput=None):
 n,keys=req(task,lines,target);return {'task':task,'lines':lines,'targetLineId':target,'rateGoal':rateGoal,'candidatePoint':candidate,'targetInput':targetInput,'requiredExplorations':n,'requiredStageKeys':keys}
def table(id,label,m,b,pts):return line(id,label,m,b,', '.join(f'({x}, {y})' for x,y in pts),'table',pts)
C={}
def put(lid,sid,c):C[(lid,sid)]=c
# bv-02-03
put('bv-02-03','i1',cfg('readIntercept',[line('fit','Line of best fit',2,3,'y = 2x + 3')],'fit'))
put('bv-02-03','k1',cfg('readSlope',[line('fit','Line of best fit',4,5,'y = 4x + 5')],'fit'))
put('bv-02-03','i2',cfg('exploreParameters',[line('fit','Line of best fit',3,1,'y = 3x + 1')]))
put('bv-02-03','k2',cfg('readSlope',[line('fit','Line of best fit',-2,20,'y = −2x + 20')],'fit'))
put('bv-02-03','k3',cfg('slopeAssociation',[line('fit','Line of best fit',-1,0,'negative slope','context')],'fit'))
put('bv-02-03','ch1',cfg('readIntercept',[line('fit','Line of best fit',5,0,'y = 5x')],'fit'))
put('bv-02-03','rem-bv0203-k',cfg('readSlope',[line('fit','Line of best fit',3,7,'y = 3x + 7')],'fit'))
# fg-03-02
put('fg-03-02','i1',cfg('compareRate',[line('a','Function A',2,0,'y = 2x'),table('b','Function B',3,0,[(1,3),(2,6),(3,9)])]))
put('fg-03-02','k1',cfg('compareRate',[line('a','Function A',5,0,'y = 5x'),table('b','Function B',4,0,[(1,4),(2,8),(3,12)])]))
put('fg-03-02','i2',cfg('compareRate',[line('a','Function A',6,0,'gains 6 per step','context'),line('b','Function B',4,10,'y = 4x + 10')]))
put('fg-03-02','k2',cfg('compareRate',[table('a','Function A',2,0,[(0,0),(1,2),(2,4)]),table('b','Function B',3,0,[(0,0),(1,3),(2,6)])]))
put('fg-03-02','k3',cfg('compareRate',[line('a','Function A',1,100,'y = x + 100'),line('b','Function B',5,0,'y = 5x')]))
put('fg-03-02','ch1',cfg('compareRate',[line('a','Function A',3,0,'y = 3x'),table('b','Function B',4,0,[(1,4),(2,8),(3,12)]),line('c','Function C',2,0,'gains 2 each step','context')]))
put('fg-03-02','rem-fg0302-k',cfg('compareRate',[line('a','Function A',2,0,'y = 2x'),table('b','Function B',4,0,[(1,4),(2,8),(3,12)])]))
# fg-03-03
put('fg-03-03','i1',cfg('compareStart',[line('a','Function A',2,10,'y = 2x + 10'),table('b','Function B',2,3,[(0,3),(1,5),(2,7)])]))
put('fg-03-03','k1',cfg('compareRateAndStart',[line('a','Function A',2,10,'y = 2x + 10'),table('b','Function B',4,3,[(0,3),(1,7),(2,11)])]))
put('fg-03-03','i2',cfg('compareRateAndStart',[line('a','Function A',1,8,'starts at 8 and gains 1 each step','context'),line('b','Function B',3,2,'y = 3x + 2')]))
put('fg-03-03','k2',cfg('compareRateAndStart',[line('a','Function A',2,1,'y = 2x + 1'),table('b','Function B',2,5,[(0,5),(1,7),(2,9)])]))
put('fg-03-03','k3',cfg('compareRate',[line('a','Gym A',5,20,'$20 to join + $5/month','context'),line('b','Gym B',2,50,'$50 to join + $2/month','context')],rateGoal='lower'))
put('fg-03-03','ch1',cfg('intersectionX',[line('a','Plan A',5,20,'y = 5x + 20'),line('b','Plan B',2,50,'y = 2x + 50')]))
put('fg-03-03','rem-fg0303-k',cfg('compareRateAndStart',[line('a','Function A',1,9,'y = x + 9'),line('b','Function B',4,1,'y = 4x + 1')]))
# les-04-02
put('les-04-02','i1',cfg('evaluateAtX',[line('first','First equation',3,0,'y = 3x')],'first',targetInput=2))
put('les-04-02','k1',cfg('intersectionPoint',[line('first','First equation',1,-2,'y = x − 2'),line('second','Second equation',-2,10,'2x + y = 10')]))
put('les-04-02','i2',cfg('evaluateAtX',[line('first','First equation',2,0,'y = 2x')],'first',targetInput=3))
put('les-04-02','k2',cfg('intersectionPoint',[line('first','First equation',1,1,'y = x + 1'),line('second','Second equation',-1,7,'x + y = 7')]))
put('les-04-02','k3',cfg('verifyPoint',[line('first','First equation',3,0,'y = 3x'),line('second','Second equation',-2,10,'2x + y = 10')],candidate=[2,6]))
put('les-04-02','ch1',cfg('intersectionPoint',[line('first','First equation',3,-5,'y = 3x − 5'),line('second','Second equation',-1,7,'x + y = 7')]))
put('les-04-02','rem-les0402-k',cfg('evaluateAtX',[line('first','First equation',4,0,'y = 4x')],'first',targetInput=2))
# les-04-03
put('les-04-03','i1',cfg('intersectionX',[line('first','Larger relationship',4,0,'y = 4x'),line('second','Total relationship',-1,10,'x + y = 10')]))
put('les-04-03','k1',cfg('evaluateAtX',[line('first','Larger relationship',4,0,'y = 4x')],'first',targetInput=2))
put('les-04-03','i2',cfg('intersectionX',[line('first','Long-piece relationship',2,0,'y = 2x'),line('second','Total relationship',-1,9,'x + y = 9')]))
put('les-04-03','k2',cfg('evaluateAtX',[line('first','Long-piece relationship',2,0,'y = 2x')],'first',targetInput=3))
put('les-04-03','k3',cfg('intersectionX',[line('first','Adult-ticket relationship',1,1,'y = x + 1'),line('second','Total relationship',-1,7,'x + y = 7')]))
put('les-04-03','ch1',cfg('intersectionX',[line('first','Book-price relationship',3,2,'y = 3x + 2'),line('second','Total relationship',-1,10,'x + y = 10')]))
put('les-04-03','rem-les0403-k',cfg('intersectionX',[line('first','Larger relationship',2,0,'y = 2x'),line('second','Total relationship',-1,9,'x + y = 9')]))

def winner(lines,goal='greater'):
 vals=[x['m'] for x in lines];ext=min(vals) if goal=='lower' else max(vals);ids=[x['id'] for x in lines if abs(x['m']-ext)<1e-9];return ids[0] if len(ids)==1 else 'tie'
def startwinner(lines):
 ext=max(x['b'] for x in lines);ids=[x['id'] for x in lines if abs(x['b']-ext)<1e-9];return ids[0] if len(ids)==1 else 'tie'
def claim(c):
 task=c['task'];lines=c['lines'];target=next((x for x in lines if x['id']==c.get('targetLineId')),lines[0])
 if task=='slopeAssociation':return f'association:{"positive" if target["m"]>0 else "negative" if target["m"]<0 else "none"}'
 if task=='compareStart':return f'start:higher:{startwinner(lines)}'
 if task=='compareRate':return f'rate:{c.get("rateGoal","greater")}:{winner(lines,c.get("rateGoal","greater"))}'
 if task=='compareRateAndStart':return f'compare:rate:{winner(lines)}:start:{startwinner(lines)}'
 if task=='verifyPoint':
  x,y=c['candidatePoint'];return 'point:yes' if all(abs(q['m']*x+q['b']-y)<1e-9 for q in lines) else 'point:no'
 return None

def wrap(old,c):
 w=copy.deepcopy(old); typ=w['type']; base={'type':'affineRelationshipLab','prompt':w['prompt'],**copy.deepcopy(c),'answerUnit':w.get('unit'),'tolerance':w.get('tolerance',0),'choices':[],'numericErrors':[],'pointErrors':[],'authoredStages':[],'explorationFeedback':'Inspect every designated affine state before checking.','fallbackFeedback':w.get('fallbackFeedback','Use the affine relationship states to support your answer.')}
 if typ=='numeric':base.update(answerMode='numeric',numericErrors=copy.deepcopy(w.get('commonErrors',[])),successFeedback=w['fallbackFeedback'])
 elif typ=='mcq':
  correct=[o for o in w['options'] if o.get('correct')];assert len(correct)==1
  truth=claim(c);assert truth
  base.update(answerMode='choice',choices=[{'id':o['id'],'label':o['label'],'claim':truth if o.get('correct') else f'misconception:{o["id"]}','feedback':o['feedback']} for o in w['options']],successFeedback=correct[0]['feedback'])
 elif typ=='pointEntry':base.update(answerMode='point',pointErrors=[{'values':e['values'],'feedback':e['feedback']} for e in w.get('commonEntries',[])],successFeedback=w['successFeedback'])
 elif typ=='steppedReveal':base.update(answerMode='explore',authoredStages=[{'title':x['title'],'body':x['body']} for x in w['panels']],successFeedback=w['successFeedback'],explorationFeedback=w['continueFeedback'],fallbackFeedback=w['continueFeedback'])
 else:raise AssertionError((typ,w['prompt']))
 return {k:v for k,v in base.items() if v is not None}

paths={}
for p in ROOT.glob('content/courses/**/lessons/*.json'):
 try:d=json.loads(p.read_text())
 except:continue
 if d.get('id') in TARGETS:paths[d['id']]=p
count=0
for lid in TARGETS:
 p=paths[lid];d=json.loads(p.read_text())
 for s in d['steps']:
  if 'widget' in s:
   key=(lid,s['id']);assert key in C,key;s['widget']=wrap(s['widget'],C[key]);count+=1
 for r in d.get('remedials',[]):
  s=r['check'];key=(lid,s['id']);assert key in C,key;s['widget']=wrap(s['widget'],C[key]);count+=1
 p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
assert count==35,count
print(f'converted {count}/35 affine experiences across {len(TARGETS)} lessons')
