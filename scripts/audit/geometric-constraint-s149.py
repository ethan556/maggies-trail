#!/usr/bin/env python3
import json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'scripts/session/baselines-s149'
TARGETS={
'md-05-02.json':'content/courses/measurement-data/lessons/md-05-02.json',
'asv-03-03.json':'content/courses/area-surface-volume/lessons/asv-03-03.json',
'g7-01-03.json':'content/courses/geometry-g7/lessons/g7-01-03.json',
'g7-03-02.json':'content/courses/geometry-g7/lessons/g7-03-02.json',
'tm-03-03.json':'content/courses/transformations-measurement/lessons/tm-03-03.json',
'tm-04-01.json':'content/courses/transformations-measurement/lessons/tm-04-01.json'}
def canon(x): return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def digest(x): return hashlib.sha256(canon(x).encode()).hexdigest()
def nodes(d):
 out=[]
 for i,s in enumerate(d.get('steps',[])):
  if isinstance(s,dict) and 'widget' in s: out.append((f"steps[{i}]/{s.get('id')}",s))
 for i,r in enumerate(d.get('remedials',[])):
  c=r.get('check') if isinstance(r,dict) else None
  if isinstance(c,dict) and 'widget' in c: out.append((f"remedials[{i}].check/{c.get('id')}",c))
 return out
def strip_widgets(d):
 d=json.loads(json.dumps(d))
 for _,n in nodes(d): n['widget']='__WIDGET__'
 return d
def validate_widget(old,new,path):
 assert new.get('type')=='geometricConstraintLab',f'{path}: type'
 assert old.get('prompt')==new.get('prompt'),f'{path}: prompt drift'
 typ=old.get('type')
 if typ=='numeric':
  assert new.get('answerMode')=='numeric',f'{path}: numeric mode'
  assert old.get('tolerance',0)==new.get('tolerance',0),f'{path}: tolerance'
  assert old.get('unit')==new.get('answerUnit'),f'{path}: unit'
  assert old.get('commonErrors',[])==new.get('numericErrors',[]),f'{path}: numeric errors'
  assert old.get('fallbackFeedback')==new.get('fallbackFeedback')==new.get('successFeedback'),f'{path}: numeric feedback'
 elif typ=='mcq':
  assert new.get('answerMode')=='choice',f'{path}: choice mode'
  oo=old.get('options',[]); nn=new.get('choices',[])
  assert [(x['id'],x['label'],x['feedback']) for x in oo]==[(x['id'],x['label'],x['feedback']) for x in nn],f'{path}: option drift'
  assert sum(bool(x.get('correct')) for x in oo)==1,f'{path}: old correctness'
  assert sum(1 for x in nn if x.get('claim') and not x['claim'].startswith('misconception:') or x.get('numberValue') is not None)==1,f'{path}: new truth carrier'
 elif typ=='steppedReveal':
  assert new.get('answerMode')=='explore',f'{path}: explore mode'
  assert old.get('panels',[])==new.get('authoredStages',[]),f'{path}: panel drift'
  assert old.get('continueFeedback')==new.get('explorationFeedback')==new.get('fallbackFeedback'),f'{path}: continue feedback'
  assert old.get('successFeedback')==new.get('successFeedback'),f'{path}: reveal success'
 else: raise AssertionError(f'{path}: unsupported {typ}')
 assert new.get('requiredExplorations',0)>=1 and len(new.get('requiredStageKeys',[]))>=new.get('requiredExplorations',0),f'{path}: impossible exploration'
ledger=[]; total=main=rem=0
for base_name,rel in TARGETS.items():
 old=json.loads((BASE/base_name).read_text(encoding='utf-8')); new=json.loads((ROOT/rel).read_text(encoding='utf-8'))
 assert strip_widgets(old)==strip_widgets(new),f'{rel}: non-widget authored drift'
 on=nodes(old); nn=nodes(new); assert [p for p,_ in on]==[p for p,_ in nn],f'{rel}: node identity drift'
 for (p,o),(p2,n) in zip(on,nn):
  validate_widget(o['widget'],n['widget'],f'{rel}:{p}')
  total+=1; rem+=p.startswith('remedials'); main+=not p.startswith('remedials')
  ledger.append({'lesson':rel,'node':p,'oldType':o['widget']['type'],'newType':n['widget']['type'],'oldWidgetHash':digest(o['widget']),'newWidgetHash':digest(n['widget']),'variant':o.get('variant')})
assert total==42 and main==36 and rem==6,(total,main,rem)
report={'session':149,'engine':'geometricConstraintLab','lessons':len(TARGETS),'experiences':total,'main':main,'remedials':rem,'nonWidgetAuthoredFieldsPreserved':True,'variantDeclarationsPreserved':True,'passed':True}
(ROOT/'GEOMETRIC_CONSTRAINT_S149.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
(ROOT/'GEOMETRIC_CONSTRAINT_S149.md').write_text(f"# Geometric constraint audit — Session 149\n\n- Lessons: **{len(TARGETS)}**\n- Authored experiences: **{total}/{total}**\n- Main: **{main}**\n- Remedials: **{rem}**\n- Non-widget authored fields: **byte-semantic identical**\n- Variant declarations: **preserved**\n- Result: **PASS**\n",encoding='utf-8',newline='\n')
(ROOT/'SESSION149_AUTHORED_CONTENT_LEDGER.json').write_text(json.dumps({'session':149,'entries':ledger},indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'geometric constraint authored audit passed: {total}/{total}; main {main}, remedials {rem}')
