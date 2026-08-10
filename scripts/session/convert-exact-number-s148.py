#!/usr/bin/env python3
import json,re,copy,math,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
TARGETS={
'fa-02-02':'content/courses/fractions-add/lessons/fa-02-02.json',
'dop-01-02':'content/courses/decimal-operations/lessons/dop-01-02.json',
'ee-01-02':'content/courses/expressions-equations/lessons/ee-01-02.json',
'ee-05-01':'content/courses/expressions-equations/lessons/ee-05-01.json',
'rno-04-03':'content/courses/rational-number-operations/lessons/rno-04-03.json',
'rns-02-01':'content/courses/the-real-number-system/lessons/rns-02-01.json',
'rns-02-03':'content/courses/the-real-number-system/lessons/rns-02-03.json'}
BASE=ROOT/'scripts/session/baselines-s148';BASE.mkdir(exist_ok=True)
for lid,rel in TARGETS.items():
 p=ROOT/rel;b=BASE/f'{lid}.json'
 if not b.exists():shutil.copy2(p,b)
def rat(id,label,num,den=1):return {'id':id,'label':label,'kind':'rational','num':int(num),'den':int(den)}
def power(id,label,base,exp):return {'id':id,'label':label,'kind':'power','base':int(base),'exponent':int(exp)}
def root(id,label,n):return {'id':id,'label':label,'kind':'root','radicand':int(n)}
def parse_rat(tok,id):
 tok=tok.strip().replace('−','-')
 if '/' in tok:
  a,b=tok.split('/');return rat(id,tok,int(a),int(b))
 if '.' in tok:
  sign=-1 if tok.startswith('-') else 1;z=tok.lstrip('+-');w,f=(z.split('.')+[''])[:2];den=10**len(f);return rat(id,tok,sign*(int(w)*den+int(f or 0)),den)
 return rat(id,tok,int(tok),1)
def req(c):
 task=c['task'];
 count={'fractionCompare':3,'benchmarkDecision':2,'groupedEvaluate':2,'groupedFirst':1,'powerEvaluate':2,'powerCompare':4,'inequalityMembership':3,'inequalityExtremum':2,'rationalOperation':2,'rootClassify':2,'rootSelect':2,'rootList':3,'rootBracket':2,'squareEvaluate':1,'densityWitness':1,'densityPrinciple':1}[task]
 keys={'fractionCompare':['benchmark:left','benchmark:right','compare:exact'],'benchmarkDecision':['benchmark:left','benchmark:right'],'groupedEvaluate':['group:inner','group:outer'],'groupedFirst':['group:inner'],'powerEvaluate':['power:left:expand','power:left:value'],'powerCompare':['power:left:expand','power:left:value','power:right:expand','power:right:value'],'inequalityMembership':['inequality:boundary','inequality:direction','inequality:test'],'inequalityExtremum':['inequality:boundary','inequality:direction'],'rationalOperation':['rational:normalize','rational:operate'],'rootClassify':['root:lower-square','root:upper-square'],'rootBracket':['root:lower-square','root:upper-square'],'squareEvaluate':['square:multiply'],'densityWitness':['density:midpoint'],'densityPrinciple':['density:rule']}.get(task,[])
 if task in ('rootSelect','rootList'):keys=[f'root:{v["id"]}' for v in c['values'][:min(len(c['values']),4)]];count=max(1,len(keys))
 return {**c,'requiredExplorations':count,'requiredStageKeys':keys}
def group_cfg(prompt,first=False):
 t=prompt.replace('−','-').replace('×','*').replace('÷','/')
 m=re.search(r'\((-?\d+)\s*([+-])\s*(-?\d+)\)\s*([*/])\s*(-?\d+)',t)
 if m:return req({'task':'groupedFirst' if first else 'groupedEvaluate','values':[],'group':{'a':int(m[1]),'b':int(m[3]),'c':int(m[5]),'innerOp':'add' if m[2]=='+' else 'subtract','outerOp':'multiply' if m[4]=='*' else 'divide','groupSide':'left'}})
 m=re.search(r'(-?\d+)\s*([*/])\s*\((-?\d+)\s*([+-])\s*(-?\d+)\)',t)
 if m:return req({'task':'groupedFirst' if first else 'groupedEvaluate','values':[],'group':{'a':int(m[3]),'b':int(m[5]),'c':int(m[1]),'innerOp':'add' if m[4]=='+' else 'subtract','outerOp':'multiply' if m[2]=='*' else 'divide','groupSide':'right'}})

 if first:
  m=re.search(r'\((-?\d+)\s*([+-])\s*(-?\d+)\)',t)
  if m:return req({'task':'groupedFirst','values':[],'group':{'a':int(m[1]),'b':int(m[3]),'c':1,'innerOp':'add' if m[2]=='+' else 'subtract','outerOp':'multiply','groupSide':'left'}})
 raise ValueError(prompt)
def frac_pair(prompt):
 fs=re.findall(r'(-?\d+)\/(\d+)',prompt);assert len(fs)>=2,prompt
 return [rat('left',f'{fs[0][0]}/{fs[0][1]}',*map(int,fs[0])),rat('right',f'{fs[1][0]}/{fs[1][1]}',*map(int,fs[1]))]
def power_cfg(prompt,compare=False):
 ps=re.findall(r'(-?\d+)\^(\d+)',prompt);assert ps,prompt
 vals=[power('left' if i==0 else 'right',f'{a}^{b}',a,b) for i,(a,b) in enumerate(ps[:2 if compare else 1])]
 return req({'task':'powerCompare' if compare else 'powerEvaluate','values':vals})
def inequality_cfg(prompt,ext=False):
 t=prompt.replace('≤','<=').replace('≥','>=');m=re.search(r'[a-z]\s*(<=|>=|<|>)\s*(-?\d+(?:\.\d+)?)',t);assert m,prompt
 op={'<':'lt','<=':'le','>':'gt','>=':'ge'}[m[1]];c=re.search(r'[a-z]\s*=\s*(-?\d+(?:\.\d+)?)',t)
 return req({'task':'inequalityExtremum' if ext else 'inequalityMembership','values':[],'inequality':{'operator':op,'boundary':float(m[2]),**({'candidate':float(c[1])} if c else {})}})
def operation_cfg(prompt):
 t=prompt.replace('−','-').replace('×','*').replace('÷','/')
 m=re.search(r'(-?\d+(?:\.\d+)?(?:/\d+)?)\s*([+\-*/])\s*\(?(-?\d+(?:\.\d+)?(?:/\d+)?)\)?\s*=\s*\?',t)
 if not m:
  # use last explicit compute expression
  ms=list(re.finditer(r'(-?\d+(?:\.\d+)?(?:/\d+)?)\s*([+\-*/])\s*\(?(-?\d+(?:\.\d+)?(?:/\d+)?)\)?',t));assert ms,prompt;m=ms[-1]
 return req({'task':'rationalOperation','values':[parse_rat(m[1],'a'),parse_rat(m[3],'b')],'operation':{'+':'add','-':'subtract','*':'multiply','/':'divide'}[m[2]]})
def root_n(prompt):
 m=re.search(r'√(\d+)',prompt) or re.search(r'[a-z]²\s*=\s*(\d+)',prompt)
 assert m,prompt
 return int(m[1])
def root_bracket_cfg(prompt):
 n=root_n(prompt);bases=[float(x) for x in re.findall(r'(-?\d+(?:\.\d+)?)²',prompt)];assert len(bases)>=2,prompt
 return req({'task':'rootBracket','values':[],'targetRadicand':n,'lower':bases[0],'upper':bases[1]})
def generic_base(old,cfg):
 return {'type':'exactNumberLab','prompt':old['prompt'],**cfg,'answerUnit':old.get('unit'),'tolerance':old.get('tolerance',0),'choices':[],'numericErrors':[],'authoredStages':[],'explorationFeedback':'Inspect every required exact-number state before checking.','fallbackFeedback':old.get('fallbackFeedback','Use the exact-number states to support your answer.')}
def relation_of(vals):
 a,b=vals;d=a['num']*b['den']-b['num']*a['den'];return 'lt' if d<0 else 'gt' if d>0 else 'eq'
def carrier_for(cfg,opt,correct):
 task=cfg['task'];label=opt['label']
 if task=='rootSelect':
  m=re.search(r'√(\d+)',label);return {'source':root('choice-'+opt['id'],f'√{m[1]}',m[1])} if m else {'claim':'misconception:'+opt['id']}
 if task=='rootList':
  ns=re.findall(r'√(\d+)',label);return {'sourceList':[root(f'{opt["id"]}-{i}',f'√{n}',n) for i,n in enumerate(ns)]} if ns else {'claim':'misconception:'+opt['id']}
 if task=='rootBracket':
  nums=[float(x) for x in re.findall(r'-?\d+(?:\.\d+)?',label)];return {'interval':nums[:2]} if len(nums)>=2 else {'claim':'misconception:'+opt['id']}
 if task in ('fractionCompare','powerCompare'):
  return {'relation':relation_of(cfg['values']) if task=='fractionCompare' else ('lt' if cfg['values'][0]['base']**cfg['values'][0]['exponent']<cfg['values'][1]['base']**cfg['values'][1]['exponent'] else 'gt' if cfg['values'][0]['base']**cfg['values'][0]['exponent']>cfg['values'][1]['base']**cfg['values'][1]['exponent'] else 'eq')} if correct else {'claim':'misconception:'+opt['id']}
 if task=='rationalOperation':
  # parse numeric/fraction option where possible; only correct needs exact carrier
  if correct:
   txt=label.strip().replace('−','-');m=re.search(r'-?\d+(?:\.\d+)?(?:/\d+)?',txt);return {'numberValue':float(eval(m[0])) if '/' in m[0] else float(m[0])}
 return {'claim':answer_claim(cfg) if correct else 'misconception:'+opt['id']}
def answer_claim(c):
 t=c['task']
 if t=='benchmarkDecision':
  signs=[]
  for v in c['values']: signs.append((2*v['num']>v['den'])-(2*v['num']<v['den']))
  return 'benchmark:settles' if signs[0]!=signs[1] and all(signs) else 'benchmark:needs-more'
 if t=='groupedFirst':return 'first:group'
 if t=='inequalityMembership':
  q=c['inequality'];x=q['candidate'];b=q['boundary'];ok={'lt':x<b,'le':x<=b,'gt':x>b,'ge':x>=b}[q['operator']];return 'membership:yes' if ok else 'membership:no'
 if t=='inequalityExtremum':return 'extremum:no-largest' if c['inequality']['operator'] in ('gt','ge') else 'extremum:no-smallest'
 if t=='rootClassify':
  n=c['values'][0]['radicand'];k=math.isqrt(n);return f'root:rational:{k}' if k*k==n else 'root:irrational'
 if t=='densityWitness':return 'density:yes'
 if t=='densityPrinciple':return 'density:always'
 return 'correct'
def wrap(old,cfg):
 b=generic_base(old,cfg);typ=old['type']
 if typ=='numeric':b.update(answerMode='numeric',numericErrors=copy.deepcopy(old.get('commonErrors',[])),successFeedback=old['fallbackFeedback']);return {k:v for k,v in b.items() if v is not None}
 if typ=='rationalCompare':b.update(answerMode='relation',successFeedback=old['successFeedback']);return {k:v for k,v in b.items() if v is not None}
 if typ=='mcq':
  good=[o for o in old['options'] if o.get('correct')];assert len(good)==1
  b.update(answerMode='choice',choices=[{'id':o['id'],'label':o['label'],'feedback':o['feedback'],**carrier_for(cfg,o,bool(o.get('correct')))} for o in old['options']],successFeedback=good[0]['feedback']);return {k:v for k,v in b.items() if v is not None}
 raise ValueError((typ,old['prompt']))
def config(lid,sid,w):
 p=w['prompt']
 if lid=='fa-02-02':
  vals=[rat('left',w.get('leftLabel','left'),w['left']['num'],w['left']['den']),rat('right',w.get('rightLabel','right'),w['right']['num'],w['right']['den'])] if w.get('type')=='rationalCompare' else frac_pair(p)
  return req({'task':'benchmarkDecision' if sid=='k2' else 'fractionCompare','values':vals})
 if lid=='dop-01-02':return group_cfg(p,sid=='i2')
 if lid=='ee-01-02':return power_cfg(p,sid=='ch1')
 if lid=='ee-05-01':return inequality_cfg(p,sid=='k3')
 if lid=='rno-04-03':return operation_cfg(p)
 if lid=='rns-02-01':
  if sid in ('k1','i2'):return req({'task':'rootSelect','values':[],'targetClass':'rational' if sid=='k1' else 'irrational'})
  if sid=='ch1':return req({'task':'rootList','values':[],'targetClass':'irrational'})
  return req({'task':'rootClassify','values':[root('root',f'√{root_n(p)}',root_n(p))]})
 if lid=='rns-02-03':
  if sid=='i1':return req({'task':'densityWitness','values':[],'lower':1.41,'upper':1.42})
  if sid=='i2':return req({'task':'squareEvaluate','values':[rat('value','1.41',141,100)]})
  if sid=='k3':return req({'task':'densityPrinciple','values':[]})
  return root_bracket_cfg(p)
 raise ValueError((lid,sid))
converted=0;unchanged=0
for lid,rel in TARGETS.items():
 p=ROOT/rel;d=json.loads(p.read_text())
 for step in d['steps']:
  if 'widget' not in step:continue
  if step['widget']['type'] in ('matchPairs','dragBucket'):unchanged+=1;continue
  step['widget']=wrap(step['widget'],config(lid,step['id'],step['widget']));converted+=1
 for rem in d.get('remedials',[]):
  step=rem['check'];step['widget']=wrap(step['widget'],config(lid,step['id'],step['widget']));converted+=1
 p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
print(f'converted {converted} exact-number experiences; retained {unchanged} existing direct interactions')
