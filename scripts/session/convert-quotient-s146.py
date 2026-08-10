#!/usr/bin/env python3
import json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
TARGETS={
'dop-03-03':ROOT/'content/courses/decimal-operations/lessons/dop-03-03.json',
'ns-01-02':ROOT/'content/courses/number-system/lessons/ns-01-02.json',
'ns-02-01':ROOT/'content/courses/number-system/lessons/ns-02-01.json',
'rns-01-01':ROOT/'content/courses/the-real-number-system/lessons/rns-01-01.json',
'rns-01-03':ROOT/'content/courses/the-real-number-system/lessons/rns-01-03.json',
}
BASE=ROOT/'scripts/audit/baselines/s146'

def rat(n,d=1): return {'num':n,'den':d}

def fractions(text): return [(int(a),int(b)) for a,b in re.findall(r'(-?\d+)\s*/\s*(\d+)',text)]

def fraction_key(n,d):
 import math
 g=math.gcd(n,d); n//=g; d//=g
 if d<0:n,d=-n,-d
 return f'{n}/{d}'

def decimal(n,d):
 # mirror the TS expansion, enough for static claims
 neg=n<0; n=abs(n); ip=n//d; r=n%d; seen={}; digits=[]; start=None
 while r and r not in seen and len(digits)<96:
  seen[r]=len(digits); r*=10; digits.append(r//d); r%=d
 if r: start=seen[r]
 sign='-' if neg else ''
 if not digits:return f'{sign}{ip}'
 if start is None:return f'{sign}{ip}.{"".join(map(str,digits))}'
 return f'{sign}{ip}.{"".join(map(str,digits[:start]))}({"".join(map(str,digits[start:]))})'

def base(old,cfg,mode):
 return {
  'type':'quotientReasoningLab','task':cfg['task'],'answerMode':mode,'prompt':old['prompt'],
  **{k:v for k,v in cfg.items() if k not in ('task','claim')},
  **({'answerUnit':old.get('unit')} if old.get('unit') else {}),'tolerance':old.get('tolerance',0),
  'choices':[],'numericErrors':[],'fractionErrors':[],'authoredStages':[],
  'requiredExplorations':cfg.get('requiredExplorations',1),
  'successFeedback':'','explorationFeedback':f"Inspect at least {cfg.get('requiredExplorations',1)} exact quotient states before checking.",
  'fallbackFeedback':old.get('fallbackFeedback','Use the exact quotient states to decide.')
 }

def convert(old,cfg):
 typ=old['type']
 if typ=='numeric':
  w=base(old,cfg,'numeric'); w['numericErrors']=old.get('commonErrors',[]); w['successFeedback']=old['fallbackFeedback']; return w
 if typ=='mcq':
  w=base(old,cfg,'choice'); correct=[o for o in old['options'] if o.get('correct')]
  assert len(correct)==1
  claim=cfg['claim']
  w['choices']=[{'id':o['id'],'label':o['label'],'claim':claim if o.get('correct') else f"misconception:{o['id']}",'feedback':o['feedback']} for o in old['options']]
  w['successFeedback']=correct[0]['feedback']; return w
 if typ=='fractionEntry':
  w=base(old,cfg,'fraction')
  w['fractionErrors']=[{'whole':e.get('whole',0),'num':e.get('num',0)*(e.get('sign',1)),'den':e.get('den',1),'feedback':e['feedback']} for e in old.get('commonEntries',[])]
  w['successFeedback']=old['successFeedback']; return w
 if typ=='steppedReveal':
  w=base(old,cfg,'explore'); w['authoredStages']=old['panels']; w['successFeedback']=old['successFeedback']; w['fallbackFeedback']=old['continueFeedback']; return w
 raise AssertionError(typ)

CFG={
'dop-03-03':{
'i1':dict(task='remainderContext',dividend=rat(100),divisor=rat(15),contextPolicy='roundUp',candidates=[],requiredExplorations=4),
'k1':dict(task='remainderContext',dividend=rat(100),divisor=rat(15),contextPolicy='fullGroups',candidates=[],requiredExplorations=4),
'k2':dict(task='remainderContext',dividend=rat(30),divisor=rat(7),contextPolicy='remainder',candidates=[],requiredExplorations=4),
'i2':dict(task='remainderPolicy',dividend=rat(48),divisor=rat(5),contextPolicy='roundUp',candidates=[],claim='policy:roundUp',requiredExplorations=4),
'k3':dict(task='remainderContext',dividend=rat(30),divisor=rat(7),contextPolicy='eachGets',candidates=[],requiredExplorations=4),
'ch1':dict(task='remainderContext',dividend=rat(90),divisor=rat(16),contextPolicy='roundUp',candidates=[],requiredExplorations=4),
'rem-rm-k':dict(task='remainderContext',dividend=rat(25),divisor=rat(4),contextPolicy='roundUp',candidates=[],requiredExplorations=4),
},
'ns-01-02':{
'i1':dict(task='reciprocal',dividend=rat(3,8),candidates=[],claim='fraction:8/3',requiredExplorations=2),
'k1':dict(task='fractionDivide',dividend=rat(3,4),divisor=rat(1,8),candidates=[],numericProjection='value',requiredExplorations=4),
'k2':dict(task='divisorChoice',dividend=rat(5,6),divisor=rat(2,3),candidates=[],claim='role:divisor',requiredExplorations=2),
'i2':dict(task='fractionDivide',dividend=rat(2,3),divisor=rat(4,9),candidates=[],numericProjection='numerator',requiredExplorations=4),
'k3':dict(task='fractionDivide',dividend=rat(5,6),divisor=rat(1,3),candidates=[],numericProjection='numerator',requiredExplorations=4),
'ch1':dict(task='fractionDivide',dividend=rat(5,6),divisor=rat(1,6),candidates=[],numericProjection='value',requiredExplorations=4),
'rem-fm-k':dict(task='fractionDivide',dividend=rat(1,2),divisor=rat(1,4),candidates=[],numericProjection='value',requiredExplorations=4),
},
'ns-02-01':{
'i1':dict(task='verifyProduct',dividend=rat(936),divisor=rat(24),candidates=[],requiredExplorations=3),
'k1':dict(task='integerQuotient',dividend=rat(672),divisor=rat(16),candidates=[],requiredExplorations=3),
'k2':dict(task='integerQuotient',dividend=rat(50),divisor=rat(9),candidates=[],requiredExplorations=3),
'i2':dict(task='integerRemainder',dividend=rat(50),divisor=rat(9),candidates=[],requiredExplorations=3),
'k3':dict(task='invalidRemainder',dividend=rat(50),divisor=rat(6),claimedQuotient=7,claimedRemainder=8,candidates=[],claim='remainder:invalid',requiredExplorations=4),
'ch1':dict(task='integerQuotient',dividend=rat(1248),divisor=rat(24),candidates=[],requiredExplorations=3),
'rem-mdd-k':dict(task='integerQuotient',dividend=rat(84),divisor=rat(12),candidates=[],requiredExplorations=3),
},
'rns-01-01':{},'rns-01-03':{}
}
# rational lesson configs
CFG['rns-01-01'].update({
'i1':dict(task='rationalDefinition',dividend=rat(3,4),candidates=[],claim='rational:yes',requiredExplorations=2),
'k1':dict(task='decimalExact',dividend=rat(1,3),candidates=[],claim='decimal:0.(3)',requiredExplorations=2),
'i2':dict(task='remainderCycle',dividend=rat(1,3),candidates=[],requiredExplorations=2),
'i3':dict(task='decimalValue',dividend=rat(7,8),candidates=[],requiredExplorations=4),
'k4':dict(task='decimalExact',dividend=rat(9,20),candidates=[],claim='decimal:0.45',requiredExplorations=3),
'ch1':dict(task='decimalExact',dividend=rat(5,11),candidates=[],claim='decimal:0.(45)',requiredExplorations=3),
'rem-rns0101-k':dict(task='decimalClassify',dividend=rat(1,2),candidates=[],claim='classification:terminates',requiredExplorations=2),
})
CFG['rns-01-03'].update({
'i1':dict(task='repeatToFraction',repeatBlock='3',candidates=[],requiredExplorations=3),
'k1':dict(task='repeatToFraction',repeatBlock='7',candidates=[],requiredExplorations=4),
'i2':dict(task='repeatToFraction',repeatBlock='2',candidates=[],claim='fraction:2/9',requiredExplorations=4),
'k2':dict(task='repeatToFraction',repeatBlock='45',candidates=[],requiredExplorations=4),
'k3':dict(task='repeatToFraction',repeatBlock='18',candidates=[],requiredExplorations=4),
'ch1':dict(task='repeatToFraction',repeatBlock='123',candidates=[],requiredExplorations=4),
'rem-rns0103-k':dict(task='repeatToFraction',repeatBlock='6',candidates=[],claim='fraction:2/3',requiredExplorations=4),
})

def add_decimal_select_configs(data):
 for sid,target in [('k2','terminates'),('k3','repeats')]:
  step=next(x for x in data['steps'] if x.get('id')==sid); old=step['widget']
  candidates=[]
  for o in old['options']:
   fs=fractions(o['label']); assert fs, (sid,o)
   candidates.append({'id':o['id'],'label':o['label'],'value':rat(*fs[0])})
  correct=next(o for o in old['options'] if o.get('correct'))
  CFG['rns-01-01'][sid]=dict(task='decimalSelect',candidates=candidates,classificationTarget=target,claim=f"candidate:{correct['id']}",requiredExplorations=len(candidates))

for lesson_id,path in TARGETS.items():
 original=json.loads((BASE/f'{lesson_id}.json').read_text())
 if lesson_id=='rns-01-01': add_decimal_select_configs(original)
 for step in original['steps']:
  if 'widget' not in step: continue
  sid=step['id']; assert sid in CFG[lesson_id],(lesson_id,sid)
  step['widget']=convert(step['widget'],CFG[lesson_id][sid])
 for remedial in original['remedials']:
  check=remedial['check']; sid=check['id']; assert sid in CFG[lesson_id],(lesson_id,sid)
  check['widget']=convert(check['widget'],CFG[lesson_id][sid])
 path.write_text(json.dumps(original,ensure_ascii=False,indent=2)+'\n')
 print(path.relative_to(ROOT))
