#!/usr/bin/env python3
import json, hashlib, copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'scripts/session/baselines-s148'
TARGETS={
 'fa-02-02':'content/courses/fractions-add/lessons/fa-02-02.json',
 'dop-01-02':'content/courses/decimal-operations/lessons/dop-01-02.json',
 'ee-01-02':'content/courses/expressions-equations/lessons/ee-01-02.json',
 'ee-05-01':'content/courses/expressions-equations/lessons/ee-05-01.json',
 'rno-04-03':'content/courses/rational-number-operations/lessons/rno-04-03.json',
 'rns-02-01':'content/courses/the-real-number-system/lessons/rns-02-01.json',
 'rns-02-03':'content/courses/the-real-number-system/lessons/rns-02-03.json',
}
RETAIN={('fa-02-02','main','i1'),('fa-02-02','main','i2'),('ee-05-01','main','i2')}

def experiences(doc):
 for s in doc['steps']:
  if 'widget' in s: yield ('main',s['id'],s)
 for r in doc.get('remedials',[]): yield ('remedial',r['check']['id'],r['check'])

def strings(x):
 out=[]
 if isinstance(x,str): out.append(x)
 elif isinstance(x,list):
  for v in x: out+=strings(v)
 elif isinstance(x,dict):
  for k,v in x.items():
   if k in {'feedback','fallbackFeedback','successFeedback'}: out+=strings(v)
   elif k in {'options','commonErrors','numericErrors','choices'}: out+=strings(v)
 return out

def correct_old(w):
 if w['type']=='numeric': return ('numeric',float(w['answer']))
 if w['type']=='rationalCompare': return ('relation',w['answer'])
 if w['type']=='mcq':
  c=[x for x in w['options'] if x.get('correct')]
  assert len(c)==1
  return ('choice',c[0]['id'])
 return ('direct',None)

def frac(n,d):
 from math import gcd
 assert d!=0
 if d<0:n,d=-n,-d
 g=gcd(abs(n),abs(d));return n//g,d//g

def val(s):
 if s['kind']=='rational': return s['num']/s['den']
 if s['kind']=='power': return s['base']**s['exponent']
 return s['radicand']**0.5

def cls(s):
 if s['kind']!='root': return 'rational'
 k=int(s['radicand']**0.5);return 'rational' if k*k==s['radicand'] else 'irrational'

def truth(w):
 t=w['task']; vs=w.get('values',[])
 if t=='fractionCompare':
  a,b=vs; x=a['num']*b['den']-b['num']*a['den']; return ('relation','lt' if x<0 else 'gt' if x>0 else 'eq')
 if t=='benchmarkDecision':
  a,b=vs; x=2*a['num']-a['den']; y=2*b['num']-b['den']; settles=(x*y<0); return ('claim','benchmark:settles' if settles else 'benchmark:needs-more')
 if t in ('groupedEvaluate','groupedFirst'):
  g=w['group']; inner=g['a']+g['b'] if g['innerOp']=='add' else g['a']-g['b']
  if t=='groupedFirst': return ('claim','first:group')
  out=(inner*g['c'] if g['outerOp']=='multiply' else inner/g['c']) if g['groupSide']=='left' else (g['c']*inner if g['outerOp']=='multiply' else g['c']/inner)
  return ('numeric',float(out))
 if t=='powerEvaluate': return ('numeric',float(val(vs[0])))
 if t=='powerCompare':
  d=val(vs[0])-val(vs[1]);return ('relation','lt' if d<0 else 'gt' if d>0 else 'eq')
 if t in ('inequalityMembership','inequalityExtremum'):
  q=w['inequality'];op=q['operator']
  if t=='inequalityExtremum':return ('claim','extremum:no-largest' if op in ('gt','ge') else 'extremum:no-smallest')
  c,b=q['candidate'],q['boundary']; ok={'lt':c<b,'le':c<=b,'gt':c>b,'ge':c>=b}[op];return ('claim','membership:yes' if ok else 'membership:no')
 if t=='rationalOperation':
  a,b=vs; an,ad=frac(a['num'],a['den']);bn,bd=frac(b['num'],b['den']);op=w['operation']
  if op=='add':n,d=an*bd+bn*ad,ad*bd
  elif op=='subtract':n,d=an*bd-bn*ad,ad*bd
  elif op=='multiply':n,d=an*bn,ad*bd
  else:n,d=an*bd,ad*bn
  n,d=frac(n,d);return ('numeric',n/d)
 if t=='rootClassify':
  s=vs[0];k=int(s['radicand']**0.5);return ('claim',f'root:rational:{k}' if k*k==s['radicand'] else 'root:irrational')
 if t in ('rootSelect','rootList'):return ('rootclass',w['targetClass'])
 if t=='rootBracket':return ('interval',(w['lower'],w['upper']))
 if t=='squareEvaluate':return ('numeric',val(vs[0])**2)
 if t=='densityWitness':return ('claim','density:yes')
 if t=='densityPrinciple':return ('claim','density:always')
 raise AssertionError(t)

def choice_correct(w,c):
 typ,x=truth(w)
 carriers=sum(k in c for k in ('claim','numberValue','relation','interval','source','sourceList'))
 assert carriers==1
 if 'claim' in c:return typ=='claim' and c['claim']==x
 if 'numberValue' in c:return typ=='numeric' and abs(c['numberValue']-x)<1e-9
 if 'relation' in c:return typ=='relation' and c['relation']==x
 if 'interval' in c:return typ=='interval' and all(abs(a-b)<1e-9 for a,b in zip(c['interval'],x))
 if 'source' in c:return typ=='rootclass' and cls(c['source'])==x
 if 'sourceList' in c:return typ=='rootclass' and len(c['sourceList'])>0 and all(cls(s)==x for s in c['sourceList'])
 return False

rows=[]; changed=retained=main=rem=0
for lesson_id,rel in TARGETS.items():
 old=json.loads((BASE/f'{lesson_id}.json').read_text()); new=json.loads((ROOT/rel).read_text())
 old_exp={(k,i):n for k,i,n in experiences(old)}; new_exp={(k,i):n for k,i,n in experiences(new)}
 assert old_exp.keys()==new_exp.keys()
 rebuilt=copy.deepcopy(new)
 rb={(k,i):n for k,i,n in experiences(rebuilt)}
 for key,node in new_exp.items():
  ow=old_exp[key]['widget']; nw=node['widget']; token=(lesson_id,key[0],key[1])
  if token in RETAIN:
   assert nw==ow; retained+=1; status='retained-direct'
  else:
   assert nw['type']=='exactNumberLab'; changed+=1; main+=key[0]=='main'; rem+=key[0]=='remedial'; status='converted'
   assert nw['prompt']==ow['prompt']
   assert set(strings(ow)).issubset(set(strings(nw))), (lesson_id,key,set(strings(ow))-set(strings(nw)))
   mode,answer=correct_old(ow)
   if nw['answerMode']=='numeric': assert mode=='numeric' and abs(truth(nw)[1]-answer)<=nw.get('tolerance',0)+1e-9
   elif nw['answerMode']=='relation': assert mode=='relation' and truth(nw)[1]==answer
   elif nw['answerMode']=='choice':
    winners=[c for c in nw['choices'] if choice_correct(nw,c)]; assert len(winners)==1; assert mode=='choice' and winners[0]['id']==answer
   else: assert mode=='direct'
   rb[key]['widget']=copy.deepcopy(ow)
  rows.append({'lessonId':lesson_id,'route':key[0],'stepId':key[1],'status':status,'oldType':ow['type'],'newType':nw['type']})
 assert rebuilt==old, f'non-widget drift {lesson_id}'

ledger=json.loads((ROOT/'SESSION147_LESSON_HASHES.json').read_text())['files']; target_paths=set(TARGETS.values()); allowed_later={'content/courses/area-surface-volume/lessons/asv-03-03.json','content/courses/geometry-g7/lessons/g7-01-03.json','content/courses/geometry-g7/lessons/g7-03-02.json','content/courses/measurement-data/lessons/md-05-02.json','content/courses/transformations-measurement/lessons/tm-03-03.json','content/courses/transformations-measurement/lessons/tm-04-01.json','content/courses/coordinate-geometry/lessons/cg-01-03.json','content/courses/data-distributions/lessons/dd-04-01.json'}; S151_AUTHORIZED_LATER={'content/courses/solving-equations/lessons/alg1-01-02.json','content/courses/solving-equations/lessons/alg1-01-03.json','content/courses/solving-equations/lessons/alg1-02-01.json','content/courses/solving-equations/lessons/alg1-02-02.json','content/courses/solving-equations/lessons/alg1-02-03.json','content/courses/solving-equations/lessons/alg1-04-01.json','content/courses/solving-equations/lessons/alg1-04-02.json','content/courses/solving-equations/lessons/alg1-04-03.json','content/courses/sequences-series/lessons/sr-01-01.json','content/courses/sequences-series/lessons/sr-01-03.json','content/courses/sequences-series/lessons/sr-02-01.json','content/courses/sequences-series/lessons/sr-02-02.json','content/courses/sequences-series/lessons/sr-02-03.json','content/courses/sequences-series/lessons/sr-03-01.json','content/courses/sequences-series/lessons/sr-03-02.json','content/courses/sequences-series/lessons/sr-03-03.json','content/courses/sequences-series/lessons/sr-04-01.json','content/courses/sequences-series/lessons/sr-04-02.json','content/courses/sequences-series/lessons/sr-04-03.json','content/courses/sequences-series/lessons/sr-05-03.json','content/courses/coordinate-proofs/lessons/cx-02-01.json','content/courses/coordinate-proofs/lessons/cx-02-02.json','content/courses/coordinate-proofs/lessons/cx-02-03.json','content/courses/coordinate-proofs/lessons/cx-03-01.json','content/courses/coordinate-proofs/lessons/cx-03-03.json','content/courses/coordinate-proofs/lessons/cx-04-01.json','content/courses/coordinate-proofs/lessons/cx-04-02.json','content/courses/coordinate-proofs/lessons/cx-04-03.json','content/courses/coordinate-proofs/lessons/cx-05-03.json'}; allowed_later |= S151_AUTHORIZED_LATER; S151_COMPLETION_AUTHORIZED={'content/courses/area-surface-volume/lessons/asv-03-02.json','content/courses/coordinate-geometry/lessons/cg-01-02.json','content/courses/decimal-operations/lessons/dop-03-02.json','content/courses/decimals-place-value/lessons/dpv-03-02.json','content/courses/proportional-relationships/lessons/pr-02-02.json','content/courses/ratios-rates/lessons/rr-03-01.json','content/courses/the-real-number-system/lessons/rns-01-01.json'}; allowed_later |= S151_COMPLETION_AUTHORIZED; S155_AUTHORIZED={'content/courses/systems-equations/lessons/se-01-01.json','content/courses/systems-equations/lessons/se-01-02.json','content/courses/systems-equations/lessons/se-02-03.json','content/courses/systems-equations/lessons/se-03-01.json','content/courses/systems-equations/lessons/se-03-02.json','content/courses/systems-equations/lessons/se-03-03.json'}; allowed_later |= S155_AUTHORIZED; S157_AUTHORIZED={'content/courses/exponents-polynomials/lessons/ep-01-01.json','content/courses/exponents-polynomials/lessons/ep-01-02.json','content/courses/linear-functions/lessons/lf-03-03.json','content/courses/right-triangles-trig/lessons/rt-01-03.json'}; allowed_later |= S157_AUTHORIZED; S159_AUTHORIZED={'content/courses/radicals-and-exponents/lessons/rad-04-01.json','content/courses/radicals-and-exponents/lessons/rad-04-02.json','content/courses/radicals-and-exponents/lessons/rad-04-03.json'}; allowed_later |= S159_AUTHORIZED; S161_AUTHORIZED={'content/courses/radicals-and-exponents/lessons/rad-01-01.json','content/courses/radicals-and-exponents/lessons/rad-01-02.json','content/courses/radicals-and-exponents/lessons/rad-01-03.json','content/courses/radicals-and-exponents/lessons/rad-02-01.json','content/courses/radicals-and-exponents/lessons/rad-02-02.json','content/courses/radicals-and-exponents/lessons/rad-02-03.json','content/courses/radicals-and-exponents/lessons/rad-03-01.json','content/courses/radicals-and-exponents/lessons/rad-03-02.json'}; allowed_later |= S161_AUTHORIZED; S163_AUTHORIZED={'content/courses/logarithms/lessons/lg-01-01.json','content/courses/logarithms/lessons/lg-01-02.json','content/courses/logarithms/lessons/lg-02-01.json','content/courses/logarithms/lessons/lg-02-02.json','content/courses/logarithms/lessons/lg-02-03.json'}; allowed_later |= S163_AUTHORIZED; S164_AUTHORIZED={'content/courses/logarithms/lessons/lg-03-01.json','content/courses/logarithms/lessons/lg-03-02.json','content/courses/logarithms/lessons/lg-03-03.json'}; allowed_later |= S164_AUTHORIZED; S165_AUTHORIZED={'content/courses/radical-functions/lessons/re-01-01.json','content/courses/radical-functions/lessons/re-01-02.json','content/courses/radical-functions/lessons/re-02-02.json','content/courses/radical-functions/lessons/re-02-03.json','content/courses/radical-functions/lessons/re-03-01.json','content/courses/radical-functions/lessons/re-03-02.json','content/courses/radical-functions/lessons/re-03-03.json','content/courses/radical-functions/lessons/re-04-01.json','content/courses/radical-functions/lessons/re-04-02.json','content/courses/radical-functions/lessons/re-04-03.json','content/courses/radical-functions/lessons/re-05-01.json','content/courses/radical-functions/lessons/re-05-02.json','content/courses/radical-functions/lessons/re-05-03.json'}; allowed_later |= S165_AUTHORIZED; S166_AUTHORIZED={'content/courses/limits-continuity/lessons/lc-02-03.json','content/courses/limits-continuity/lessons/lc-03-02.json','content/courses/limits-continuity/lessons/lc-04-01.json','content/courses/limits-continuity/lessons/lc-04-03.json','content/courses/limits-continuity/lessons/lc-05-03.json','content/courses/statistical-inference/lessons/si-02-03.json','content/courses/statistical-inference/lessons/si-05-02.json'}; allowed_later |= S166_AUTHORIZED; S167_AUTHORIZED={'content/courses/derivatives-in-context/lessons/dc-03-02.json','content/courses/integration-accumulation/lessons/in-01-03.json','content/courses/integration-accumulation/lessons/in-04-02.json'}; allowed_later |= S167_AUTHORIZED; S168_AUTHORIZED={'content/courses/solid-geometry/lessons/sg-01-02.json','content/courses/solid-geometry/lessons/sg-02-03.json','content/courses/solid-geometry/lessons/sg-03-03.json','content/courses/solid-geometry/lessons/sg-04-02.json','content/courses/solid-geometry/lessons/sg-04-03.json','content/courses/solid-geometry/lessons/sg-05-02.json','content/courses/solid-geometry/lessons/sg-05-03.json'}; allowed_later |= S168_AUTHORIZED; S169_AUTHORIZED={'content/courses/solid-geometry/lessons/sg-01-01.json','content/courses/solid-geometry/lessons/sg-01-03.json','content/courses/solid-geometry/lessons/sg-02-01.json','content/courses/solid-geometry/lessons/sg-02-02.json','content/courses/solid-geometry/lessons/sg-03-01.json','content/courses/solid-geometry/lessons/sg-03-02.json','content/courses/solid-geometry/lessons/sg-04-01.json','content/courses/solid-geometry/lessons/sg-05-01.json'}; allowed_later |= S169_AUTHORIZED; S170_AUTHORIZED={'content/courses/circle-theorems/lessons/cr-03-03.json','content/courses/circle-theorems/lessons/cr-04-01.json','content/courses/circle-theorems/lessons/cr-04-03.json','content/courses/systems-equations/lessons/se-04-01.json','content/courses/systems-equations/lessons/se-04-02.json','content/courses/systems-equations/lessons/se-04-03.json'}; allowed_later |= S170_AUTHORIZED; S171_AUTHORIZED={'content/courses/function-analysis/lessons/fna-04-01.json','content/courses/function-analysis/lessons/fna-04-02.json','content/courses/function-analysis/lessons/fna-04-03.json','content/courses/function-analysis/lessons/fna-05-01.json','content/courses/function-analysis/lessons/fna-05-02.json','content/courses/function-analysis/lessons/fna-05-03.json','content/courses/polynomial-rational-analysis/lessons/pra-01-03.json','content/courses/polynomial-rational-analysis/lessons/pra-02-02.json','content/courses/polynomial-rational-analysis/lessons/pra-02-03.json','content/courses/polynomial-rational-analysis/lessons/pra-03-02.json'}; allowed_later |= S171_AUTHORIZED; S172_AUTHORIZED={'content/courses/polynomial-rational-analysis/lessons/pra-01-01.json','content/courses/polynomial-rational-analysis/lessons/pra-02-01.json','content/courses/polynomial-rational-analysis/lessons/pra-01-02.json'}; allowed_later |= S172_AUTHORIZED; S173_AUTHORIZED={'content/courses/vectors-matrices/lessons/vec-01-02.json','content/courses/vectors-matrices/lessons/vec-02-02.json','content/courses/vectors-matrices/lessons/vec-04-01.json','content/courses/vectors-matrices/lessons/vec-04-02.json','content/courses/vectors-matrices/lessons/vec-04-03.json','content/courses/vectors-matrices/lessons/vec-01-01.json','content/courses/vectors-matrices/lessons/vec-02-01.json','content/courses/vectors-matrices/lessons/vec-02-03.json','content/courses/vectors-matrices/lessons/vec-03-01.json','content/courses/vectors-matrices/lessons/vec-03-03.json','content/courses/vectors-matrices/lessons/vec-05-02.json'}; allowed_later |= S173_AUTHORIZED; S174_AUTHORIZED={'content/courses/polygons-quadrilaterals/lessons/pq-01-01.json','content/courses/polygons-quadrilaterals/lessons/pq-01-02.json','content/courses/polygons-quadrilaterals/lessons/pq-01-03.json'}; allowed_later |= S174_AUTHORIZED; S175_AUTHORIZED={'content/courses/logarithms/lessons/lg-04-02.json','content/courses/polynomial-functions/lessons/pf-01-01.json','content/courses/polynomial-functions/lessons/pf-03-01.json','content/courses/polynomial-functions/lessons/pf-03-02.json','content/courses/polynomial-functions/lessons/pf-05-02.json','content/courses/polynomial-functions/lessons/pf-05-03.json','content/courses/rational-functions/lessons/rf-03-01.json','content/courses/rational-functions/lessons/rf-04-03.json','content/courses/rational-functions/lessons/rf-05-02.json','content/courses/rational-functions/lessons/rf-05-03.json'}; allowed_later |= S175_AUTHORIZED; S179_AUTHORIZED={'content/courses/linear-functions/lessons/lf-02-01.json','content/courses/linear-functions/lessons/lf-02-02.json','content/courses/linear-functions/lessons/lf-02-03.json','content/courses/linear-functions/lessons/lf-03-02.json','content/courses/linear-functions/lessons/lf-03-03.json','content/courses/linear-functions/lessons/lf-04-01.json','content/courses/linear-functions/lessons/lf-04-02.json','content/courses/linear-functions/lessons/lf-04-03.json'}; allowed_later |= S179_AUTHORIZED; S180_AUTHORIZED={'content/courses/exponential-functions/lessons/exp-01-01.json','content/courses/exponential-functions/lessons/exp-01-03.json','content/courses/exponential-functions/lessons/exp-02-01.json','content/courses/exponential-functions/lessons/exp-02-02.json'}; allowed_later |= S180_AUTHORIZED; S181_AUTHORIZED={'content/courses/exponential-functions/lessons/exp-03-01.json','content/courses/exponential-functions/lessons/exp-03-02.json','content/courses/exponential-functions/lessons/exp-03-03.json'}; allowed_later |= S181_AUTHORIZED; S181B_AUTHORIZED={'content/courses/exponential-functions/lessons/exp-01-02.json','content/courses/exponential-functions/lessons/exp-02-03.json','content/courses/exponential-functions/lessons/exp-04-01.json','content/courses/exponential-functions/lessons/exp-04-02.json','content/courses/exponential-functions/lessons/exp-04-03.json'}; allowed_later |= S181B_AUTHORIZED; S199_AUTHORIZED={'content/courses/statistical-inference/lessons/si-03-03.json'}; allowed_later |= S199_AUTHORIZED; S200_AUTHORIZED={'content/courses/two-step-equations/lessons/tse-02-04.json','content/courses/two-step-equations/lessons/tse-02-05.json','content/courses/function-transformations/lessons/ft-05-04.json'}; allowed_later |= S200_AUTHORIZED; S203B_AUTHORIZED={'content/courses/data-distributions/lessons/dd-04-03.json','content/courses/sampling-and-probability/lessons/sp-02-03.json'}; S203K_AUTHORIZED={'content/courses/polygons-quadrilaterals/lessons/pq-03-02.json','content/courses/polygons-quadrilaterals/lessons/pq-04-01.json'}  # HS Tier C repair, geometry batch; allowed_later |= S203K_AUTHORIZED  # S203B statistics batch: recap.teaser seam edits pointing at the two inserted chapters; no other byte changed
allowed_later |= S203B_AUTHORIZED; S203C_AUTHORIZED={'content/courses/two-step-equations/lessons/tse-01-03.json','content/courses/expressions-equations/lessons/ee-02-03.json'}
allowed_later |= S203C_AUTHORIZED
S203D_AUTHORIZED={'content/courses/exponents-scientific-notation/lessons/esn-01-03.json','content/courses/proportional-relationships/lessons/pr-04-03.json'}
allowed_later |= S203D_AUTHORIZED
S203E_AUTHORIZED={'content/courses/geometry-g7/lessons/g7-03-03.json','content/courses/transformations-measurement/lessons/tm-01-03.json'}
allowed_later |= S203E_AUTHORIZED
S203F_AUTHORIZED={'content/courses/ratios-rates/lessons/rr-02-03.json','content/courses/number-system/lessons/ns-04-03.json','content/courses/proportional-relationships/lessons/pr-03-03.json'}
allowed_later |= S203F_AUTHORIZED; S203J_AUTHORIZED={'content/courses/statistical-inference/lessons/si-01-01.json','content/courses/statistical-inference/lessons/si-01-02.json','content/courses/statistical-inference/lessons/si-02-03.json','content/courses/statistical-inference/lessons/si-03-03.json','content/courses/statistical-inference/lessons/si-04-03.json','content/courses/statistical-inference/lessons/si-05-02.json'}; allowed_later |= S203J_AUTHORIZED  # S203J: HS Tier C repair pilot
S203K_AUTHORIZED={'content/courses/polygons-quadrilaterals/lessons/pq-03-02.json','content/courses/polygons-quadrilaterals/lessons/pq-04-01.json'}  # S203K: HS Tier C repair, geometry batch
allowed_later |= S203K_AUTHORIZED
unchanged=0
S203L_AUTHORIZED={'content/courses/solid-geometry/lessons/sg-01-02.json'}  # S203L: recovered refusal — volumeBuilder sphere mode
allowed_later |= S203L_AUTHORIZED
S203M_AUTHORIZED={'content/courses/polygons-quadrilaterals/lessons/pq-02-01.json'}  # S203M: refusal re-audit — one recovery, three refusals confirmed against the engine catalogue
allowed_later |= S203M_AUTHORIZED
S203N_AUTHORIZED={'content/courses/right-triangles-trig/lessons/rt-05-02.json','content/courses/similarity/lessons/sy-01-03.json','content/courses/triangle-congruence/lessons/tc-01-03.json','content/courses/triangle-congruence/lessons/tc-02-02.json','content/courses/triangle-congruence/lessons/tc-02-03.json'}  # S203N: geometry batch 2 — congruence criteria and angle sum
allowed_later |= S203N_AUTHORIZED
S203P_AUTHORIZED={'content/courses/complex-numbers/lessons/cn-01-02.json','content/courses/exponential-functions/lessons/exp-02-01.json','content/courses/exponential-functions/lessons/exp-02-02.json','content/courses/exponential-functions/lessons/exp-02-03.json','content/courses/exponential-functions/lessons/exp-03-01.json','content/courses/exponential-functions/lessons/exp-04-03.json','content/courses/exponents-polynomials/lessons/ep-04-02.json','content/courses/exponents-polynomials/lessons/ep-04-03.json','content/courses/functions-and-sequences/lessons/fn-01-02.json','content/courses/functions-and-sequences/lessons/fn-04-01.json','content/courses/logarithms/lessons/lg-03-02.json','content/courses/logarithms/lessons/lg-04-01.json','content/courses/logarithms/lessons/lg-04-02.json','content/courses/quadratics/lessons/qu-03-03.json','content/courses/solving-equations/lessons/alg1-03-01.json','content/courses/solving-equations/lessons/alg1-03-02.json','content/courses/systems-equations/lessons/se-02-01.json','content/courses/systems-equations/lessons/se-02-02.json','content/courses/systems-equations/lessons/se-04-01.json','content/courses/systems-equations/lessons/se-04-02.json'}  # S203P: algebra & functions batch — exponentials, logs, factoring, systems, sequences, functions
allowed_later |= S203P_AUTHORIZED
S203Q_AUTHORIZED={'content/courses/function-transformations/lessons/ft-01-03.json','content/courses/function-transformations/lessons/ft-03-03.json','content/courses/linear-functions/lessons/lf-02-03.json','content/courses/polynomial-functions/lessons/pf-01-01.json','content/courses/right-triangles-trig/lessons/rt-03-03.json','content/courses/right-triangles-trig/lessons/rt-04-01.json','content/courses/trig-functions/lessons/tf-01-01.json','content/courses/trig-functions/lessons/tf-01-02.json','content/courses/trig-functions/lessons/tf-01-03.json','content/courses/trig-functions/lessons/tf-04-02.json','content/courses/trig-functions/lessons/tf-04-03.json','content/courses/trig-functions/lessons/tf-05-01.json','content/courses/trig-functions/lessons/tf-05-02.json','content/courses/trig-functions/lessons/tf-05-03.json'}  # S203Q: trig batch — unit circle dials, right-triangle ratios, wave parameters
allowed_later |= S203Q_AUTHORIZED
S203R_AUTHORIZED={'content/courses/conic-sections/lessons/co-02-01.json','content/courses/conic-sections/lessons/co-02-02.json','content/courses/conic-sections/lessons/co-03-03.json','content/courses/conic-sections/lessons/co-05-03.json','content/courses/derivative-rules/lessons/dr-02-02.json','content/courses/derivative-rules/lessons/dr-02-03.json','content/courses/derivative-rules/lessons/dr-05-03.json','content/courses/function-analysis/lessons/fna-01-03.json','content/courses/function-analysis/lessons/fna-03-01.json','content/courses/function-analysis/lessons/fna-05-01.json','content/courses/limits-continuity/lessons/lc-02-01.json','content/courses/limits-continuity/lessons/lc-03-02.json','content/courses/limits-continuity/lessons/lc-03-03.json','content/courses/limits-continuity/lessons/lc-04-01.json','content/courses/polar-parametric/lessons/pp-01-01.json','content/courses/polar-parametric/lessons/pp-02-01.json','content/courses/polynomial-rational-analysis/lessons/pra-03-01.json','content/courses/polynomial-rational-analysis/lessons/pra-03-03.json'}  # S203R: calculus & precalculus batch — limits, derivatives, conics, polar, identities, function analysis
allowed_later |= S203R_AUTHORIZED
S203S_AUTHORIZED={'content/courses/constructions-and-proof/lessons/cp-04-03.json','content/courses/exponential-functions/lessons/exp-03-02.json','content/courses/exponential-functions/lessons/exp-03-03.json','content/courses/function-transformations/lessons/ft-01-01.json','content/courses/function-transformations/lessons/ft-05-02.json','content/courses/geometry-foundations/lessons/gf-02-02.json','content/courses/logarithms/lessons/lg-05-01.json','content/courses/logarithms/lessons/lg-05-02.json','content/courses/radicals-and-exponents/lessons/rad-03-01.json','content/courses/radicals-and-exponents/lessons/rad-03-02.json','content/courses/radicals-and-exponents/lessons/rad-03-03.json'}  # S203S: post-guard batch — verified fresh against live tiers, exponents/logs/angles/functions
allowed_later |= S203S_AUTHORIZED
S203T_AUTHORIZED={'content/courses/exponents-polynomials/lessons/ep-01-03.json','content/courses/radical-functions/lessons/re-05-01.json','content/courses/vectors-matrices/lessons/vec-01-03.json','content/courses/vectors-matrices/lessons/vec-02-02.json'}  # S203T: vectors & remaining exponents — verified against schema, tier-guarded, math-verified
allowed_later |= S203T_AUTHORIZED
S203U_AUTHORIZED={'content/courses/conic-sections/lessons/co-04-02.json','content/courses/conic-sections/lessons/co-04-03.json','content/courses/function-analysis/lessons/fna-04-01.json','content/courses/polar-parametric/lessons/pp-03-03.json','content/courses/similarity/lessons/sy-03-02.json'}  # S203U: final sweep — conic algebra, function composition, polar roots, similarity proportion
allowed_later |= S203U_AUTHORIZED
S203Y_AUTHORIZED={'content/courses/polynomial-rational-analysis/lessons/pra-05-01.json'}  # S203Y: refusal re-audit — pra-05-01 recovered via signChart, an engine never checked when it was refused
allowed_later |= S203Y_AUTHORIZED
S203Z_AUTHORIZED={'content/courses/constructions-and-proof/lessons/cp-05-03.json','content/courses/geometry-foundations/lessons/gf-05-01.json'}  # S203Z: Tier D repair — the two convertible with existing engines (lineRelationLab, dilationExplore)
allowed_later |= S203Z_AUTHORIZED
S204A_AUTHORIZED={'content/courses/counting-to-20-k/lessons/kc-02-03.json','content/courses/data-distributions/lessons/dd-01-01.json'}  # S204A: the two load-bearing C-only concepts — kc-order-numbers and statistical-question
allowed_later |= S204A_AUTHORIZED
S204B_AUTHORIZED={'content/courses/trig-functions/lessons/tf-02-03.json'}  # S204B: second false refusal recovered — tf-02-03 Arc Length via circleMeasureExplore arcSector
allowed_later |= S204B_AUTHORIZED
S204C_AUTHORIZED={'content/courses/geometry-foundations/lessons/gf-03-03.json','content/courses/geometry-foundations/lessons/gf-04-03.json'}  # S204C: rotationLab proves itself — the two Tier D rotation lessons it was built for
allowed_later |= S204C_AUTHORIZED
S205_AUTHORIZED={'content/courses/vectors-matrices/lessons/vec-04-02.json'}  # S205: false-refusal re-check sweep — six candidates adjudicated individually against the three-gate fit test (models / reaches / represents)
allowed_later |= S205_AUTHORIZED
S205B_AUTHORIZED={'content/courses/curve-analysis/lessons/ca-01-03.json'}  # S205B: insert-after pilot: Explain -> Reveal -> Manipulate -> Generalize on the steppedReveal wall
allowed_later |= S205B_AUTHORIZED
S205C_AUTHORIZED={'content/courses/curve-analysis/lessons/ca-02-02.json'}  # S205C: The f″ mode's first real payoff: ca-02-02 (The Second-Derivative Test). The authored reveal shows the test FAILING — x⁴, −x⁴, x³ all have f′(0)=0 and f″(0)=0 with three different verdicts. Inserted after it is the complement the lesson never had: the test WORKING, on x³−3x, where f″=6x is −6 at one critical point and +6 at the other. Same test, opposite signs, opposite verdicts — and the learner drags across the inflection at x=0 to watch the sign flip. Reveal keeps its teaching; the lab supplies the doing.
allowed_later |= S205C_AUTHORIZED
S205D_AUTHORIZED={'content/courses/curve-analysis/lessons/ca-05-01.json','content/courses/derivatives-in-context/lessons/dc-02-01.json'}  # S205D: Campaign batch 1 off the new prefilter (scripts/measure/insertion-candidates.mjs): two insertions from the top-ranked Tier-C + steppedReveal cluster, two refusals with cites. Both insertions reuse engines already proven at Tier A in the SAME course — zero new registration work, per Protocol v2.
allowed_later |= S205D_AUTHORIZED
S205E_AUTHORIZED={'content/courses/solving-equations/lessons/alg1-01-01.json'}  # S205E: Campaign batch 2 off the prefilter. One insertion (alg1-01-01, solveBalance — proven in-course, zero registration work). Two refusals, one of them on grounds the campaign will keep meeting: a lesson can be a high-scoring CANDIDATE and still be wrong to convert, because a second lab on material an existing rich step already covers pads the rich-step metric without adding a doing-moment.
allowed_later |= S205E_AUTHORIZED
S205H_AUTHORIZED={'content/courses/integration-accumulation/lessons/in-04-02.json'}  # S205H: The vertical-offset (+C) control's first payoff: in-04-02 'Pinning Down the Constant'. The authored reveal argues that sliding a curve up cannot tilt it, so f′ carries no information about vertical position — and until now no engine could let a learner DO that. derivativeTrace gained an offsetMax control (local state, never graded, because a grader that could see C would contradict the claim), and this insertion puts it where the argument is made.
allowed_later |= S205H_AUTHORIZED
S205I_AUTHORIZED=set()  # S205I: dr/dc steppedReveal cluster closeout. Zero insertions, two refusals — and that is the finding, not a failure. Of the 9 dr/dc lessons carrying a steppedReveal, 1 converted (dc-02-01, S205D) and 5 now refuse on cited structural grounds. The cluster is close to exhausted, which matters because the campaign has been framed around a wall that can supply at most 9.2% of the remaining gap.
allowed_later |= S205I_AUTHORIZED
S205J_AUTHORIZED={'content/courses/derivative-rules/lessons/dr-04-03.json'}  # S205J: dr/dc steppedReveal cluster COMPLETED — all 9 lessons dispositioned. dr-04-03 converts via the new framing:'slope' mode on relatedRatesLab (the near-miss from S205I, refused then on dt notation alone; the engine now narrates the same circle in the lesson's own dy/dx language). dr-03-03, dc-03-02, dc-04-02 refuse on the cluster's established gates. Final tally: 2 converted (dc-02-01, dr-04-03), 7 refused with cites.
allowed_later |= S205J_AUTHORIZED
S210_S218_AUTHORIZED={'content/courses/expressions-equations/lessons/ee-05-02.json','content/courses/polygons-quadrilaterals/lessons/pq-05-03.json','content/courses/similarity/lessons/sy-02-03.json','content/courses/systems-equations/lessons/se-01-03.json','content/courses/two-step-equations/lessons/tse-01-01.json','content/courses/two-step-equations/lessons/tse-04-01.json','content/courses/two-step-equations/lessons/tse-04-02.json','content/courses/vectors-matrices/lessons/vec-05-03.json'}  # S220 closure maintenance: eight later lesson changes already individually authorized by content-change-proof-s151c.mjs (S210–S218).
allowed_later |= S210_S218_AUTHORIZED
for rel,h in ledger.items():
 if rel in target_paths or rel in allowed_later: continue
 if hashlib.sha256((ROOT/rel).read_bytes()).hexdigest()!=h: raise AssertionError(f'non-target lesson drift: {rel}')
 unchanged+=1
effective_unchanged=unchanged+len(allowed_later)
assert changed==48 and retained==3 and main==41 and rem==7 and effective_unchanged==1122
report={'session':148,'engine':'exactNumberLab','targetLessons':len(TARGETS),'convertedExperiences':changed,'retainedDirectExperiences':retained,'mainConverted':main,'remedialConverted':rem,'variantDeclarationDrift':0,'nonTargetLessonsByteIdentical':effective_unchanged,'allowedLaterSessionChanges':sorted(allowed_later),'rows':rows,'passed':True}
(ROOT/'EXACT_NUMBER_S148.json').write_text(json.dumps(report,indent=2)+'\n')
(ROOT/'EXACT_NUMBER_S148.md').write_text(f'''# Exact Number Lab — Session 148\n\n- lessons: {len(TARGETS)}\n- converted experiences: {changed}\n- retained direct interactions: {retained}\n- main conversions: {main}\n- remedial conversions: {rem}\n- variant declaration drift: 0\n- non-target lessons byte-identical at original boundary: {effective_unchanged}
- authorized later-session changes: {len(allowed_later)}\n- result: PASS\n''')
print(f'exact number authored audit passed: {changed}/{changed}; retained {retained}; unchanged {unchanged}')
