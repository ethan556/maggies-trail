#!/usr/bin/env python3
"""S219 read-only curriculum classification + premium-interaction priority table.

Classification is an operational closure-audit convention, NOT authored metadata. Any row marked
CHANGE must be re-read and re-adjudicated before content is edited.
"""
from pathlib import Path
import csv, json, math, re, statistics, collections

ROOT=Path(__file__).resolve().parents[2]
COURSES=ROOT/'content'/'courses'
caps=json.loads((ROOT/'scripts'/'engine-capabilities.json').read_text())['types']

def egrade(c):
    total=sum(c.get(k,0) for k in ('manip','conseq','err','adapt','a11y','mobile','polish'))
    if c.get('conseq',0)==0 or c.get('a11y',0)==0 or c.get('mobile',0)==0 or total<=8: return 'D'
    if c.get('manip',0)>=2 and c.get('conseq',0)>=2 and c.get('err',0)>=2 and total>=17: return 'A'
    if c.get('manip',0)>=2 and c.get('conseq',0)>=2 and total>=13: return 'B'
    return 'C'
grades={t:egrade(c) for t,c in caps.items()}
uses=collections.Counter()
lessons=[]
for cdir in sorted(COURSES.iterdir()):
    cf=cdir/'course.json'
    if not cf.exists(): continue
    course=json.loads(cf.read_text())
    byid={}
    for lf in (cdir/'lessons').glob('*.json'):
        l=json.loads(lf.read_text()); byid[l['id']]=(l,lf)
        for s in l.get('steps',[]):
            w=s.get('widget')
            if isinstance(w,dict) and w.get('type'): uses[w['type']]+=1
    for ci,ch in enumerate(course.get('chapters',[]),1):
        for pos,lid in enumerate(ch.get('lessonIds',[])):
            if lid not in byid: continue
            l,lf=byid[lid]
            types=[s.get('widget',{}).get('type') for s in l.get('steps',[]) if isinstance(s.get('widget'),dict)]
            tags=[s.get('conceptTag') for s in l.get('steps',[]) if s.get('conceptTag')]
            lessons.append(dict(course=course,chapter=ch,chapter_index=ci,position=pos,lesson=l,path=lf,types=types,tags=tags))

E=re.compile(r'\b(quiz|test|assessment|checkpoint|benchmark|cumulative|final exam|mastery check|unit check)\b',re.I)
D=re.compile(r'\b(fluency|fact fluency|facts|review|retrieval|mixed practice|speed practice)\b',re.I)
A=re.compile(r'\b(what is|what are|meaning|understand|understanding|introduc|foundation|from scratch|meet |why |definition|define|discover|first look|basics)\b',re.I)
B=re.compile(r'\b(application|applications|word problem|modeling|model |interpret|context|real[- ]world|transfer|challenge|connect|compare|using |read a|read the|graphing|visualiz|explore)\b',re.I)

def classify(r):
    text=f"{r['lesson'].get('title','')} {r['chapter'].get('title','')}".lower()
    if E.search(text): return 'E'
    if D.search(text): return 'D'
    if A.search(text): return 'A'
    if r['position']==0: return 'A'
    if B.search(text): return 'B'
    return 'C'

high=r'(fraction|negative|integer|inequal|equation|variable|ratio|proportion|percent|function|slope|exponent|logarith|radical|quadratic|transform|congruen|similar|proof|probab|distribution|sampling|inference|derivative|integral|limit|trig|matrix|complex|domain|range|system|factor|polynomial)'
medium=r'(decimal|place value|multiply|division|area|volume|angle|circle|coordinate|data|mean|median|unit|measure|time|graph|sequence|rate)'
def burden(text):
    if re.search(high,text,re.I): return 3
    if re.search(medium,text,re.I): return 2
    return 1

MAP=[
(r'\bparametric', 'polarTrace'), (r'\bradical|\bcomplex|\bimaginary', 'exactNumberLab'),
(r'\bvolume', 'volumeBuilder'), (r'\barea', 'areaModel'),
(r'\binequalit', 'numberLineRay'), (r'\bequation|\bsolve|\bvariable', 'solveBalance'),
(r'\bdistribut|\bfactor|\bpolynomial', 'algebraTiles'),
(r'\bfraction', 'fractionBar'), (r'\bdecimal|\bhundredth', 'hundredthsGrid'), (r'\bplace value', 'baseTenCompose'),
(r'\bnegative|\binteger|\bnumber line', 'numberLineHop'),
(r'\b(ratio|ratios|rate|rates|proportion|proportional|percent|percentage)\b', 'proportionalReasoningLab'),
(r'\bquadratic', 'quadraticExplore'), (r'\bfunction|\blinear graph|\bslope', 'lineExplore'),
(r'\bscatter|\bline of best fit', 'scatterFit'),
(r'\bdistribution|\bvariability|\bmean\b|\bmedian\b|\bstatistic', 'distributionCompareLab'),
(r'\bprobab|\bchance', 'trialProbabilityLab'),
(r'\bcircle', 'circleAngleExplore'), (r'\btriangle|\bcongruen|\bconstruct', 'triangleConstraintLab'),
(r'\bdilation|\bsimilar', 'dilationExplore'), (r'\btransform|\breflection|\brotation|\btranslation', 'transformExplore'),
(r'\bcoordinate|\bplot point', 'plotPoint'),
(r'\bderivative', 'derivativeTrace'), (r'\bsecant|\binstantaneous rate', 'secantSlope'),
(r'\bintegral|\barea under', 'riemannSum'), (r'\blimit', 'graphZoom'),
(r'\btrig|\bunit circle', 'unitCircleExplore'), (r'\bvector', 'vectorExplore'), (r'\bmatrix', 'matrixTransform'),
(r'\bexponential|\blogarith', 'expLogExplore'), (r'\btime|\bclock', 'clockSet'), (r'\blength|\bmeasure', 'lengthCompare')
]

def engine_for(text):
    for pat,e in MAP:
        if re.search(pat,text,re.I) and e in caps: return e
    return ''

def band(g): return 'K–2' if g<=2 else '3–5' if g<=5 else '6–8' if g<=8 else 'HS'
weights={'K–2':1.0,'3–5':1.1,'6–8':1.2,'HS':1.4}
classw={'A':3.0,'B':2.5,'C':1.0,'D':0.5,'E':0.5}
rows=[]
for r in lessons:
    l=r['lesson']; g=r['course'].get('gradeLevel',99); b=band(g); cls=classify(r)
    ab=sum(1 for t in r['types'] if grades.get(t) in ('A','B'))
    cd=sum(1 for t in r['types'] if grades.get(t) in ('C','D'))
    text=' '.join([l.get('title',''),r['chapter'].get('title','')] + r['tags'])
    mb=burden(text); eng=engine_for(text)
    eu=uses.get(eng,0) if eng else 0
    fit=1.5 if eng and caps[eng].get('manip',0)>=2 else (1.0 if eng else 0.5)
    score=mb*classw[cls]*weights[b]*fit*math.log2(eu+2)
    if ab>0:
        decision='KEEP'; why='Already has at least one A/B engine instance; not a zero-rich closure candidate.'
    elif cls in ('D','E'):
        decision='REFUSE'; why='Retrieval/assessment purpose: adding a manipulative merely to raise interaction density would weaken independent evidence.'
    elif cls in ('A','B') and eng and caps[eng].get('manip',0)>=2:
        decision='CHANGE'; why=f'Zero A/B interaction in an {"acquisition" if cls=="A" else "transfer"} lesson; existing {eng} offers a causal model, so reuse should be audited before any new engine.'
    elif cls in ('A','B'):
        decision='KEEP'; why='Potential conceptual gap, but no obvious existing-engine fit from the mechanical scan; requires human necessity audit before any implementation.'
    else:
        decision='KEEP'; why='Procedural-fluency purpose; preserve independent production unless a manual lesson read finds a conceptual bottleneck.'
    gain=(f'Learner could manipulate the {eng} model and observe a state-dependent consequence before symbolic/retrieval checks.' if eng else
          'Manual review required to identify whether manipulation adds a distinct causal insight beyond the existing explanation.')
    rows.append({
      'lesson':l['id'],'grade':g,'course':r['course']['title'],'concept':r['tags'][0] if r['tags'] else l.get('title',''),
      'lesson class':cls,'current A/B interactions':ab,'current C/D interactions':cd,'misconception burden':mb,
      'candidate existing engine':eng or 'NONE—manual fit audit','expected learner gain':gain,
      'reuse potential':eu,'priority':round(score,2),'decision':decision,'justification':why,
      '_band':b,'_title':l.get('title','')})

# Required priority artifact: include every zero-A/B lesson, so KEEP/REFUSE decisions are visible too.
prio=[r for r in rows if r['current A/B interactions']==0]
prio.sort(key=lambda r:(r['decision']!='CHANGE',-r['priority'],r['grade'],r['lesson']))
fields=['lesson','grade','course','concept','lesson class','current A/B interactions','current C/D interactions','misconception burden','candidate existing engine','expected learner gain','reuse potential','priority','decision','justification']
with (ROOT/'PREMIUM_INTERACTION_PRIORITY.csv').open('w',newline='',encoding='utf-8') as f:
    w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows([{k:r[k] for k in fields} for r in prio])
# Full classification for audit traceability.
with (ROOT/'CLOSURE_LESSON_CLASSIFICATION.csv').open('w',newline='',encoding='utf-8') as f:
    w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows([{k:r[k] for k in fields} for r in rows])

summary={
 'lessons':len(rows),'zeroAB':len(prio),'classes':collections.Counter(r['lesson class'] for r in rows),
 'zeroByClass':collections.Counter(r['lesson class'] for r in prio),
 'decisions':collections.Counter(r['decision'] for r in prio),
 'band':{}
}
for b in ('K–2','3–5','6–8','HS'):
    rr=[r for r in rows if r['_band']==b]; vals=[r['current A/B interactions'] for r in rr]
    summary['band'][b]={'lessons':len(rr),'abInstances':sum(vals),'mean':round(statistics.mean(vals),3),'median':statistics.median(vals),'zero':sum(v==0 for v in vals)}
print(json.dumps(summary,default=dict,indent=2))
print('top CHANGE')
for r in [x for x in prio if x['decision']=='CHANGE'][:25]: print(r['priority'],r['lesson'],r['grade'],r['_title'],r['candidate existing engine'])
