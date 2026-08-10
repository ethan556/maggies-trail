#!/usr/bin/env python3
import json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
PATHS={
'pv2-03-02':'content/courses/place-value-million/lessons/pv2-03-02.json',
'dop-05-03':'content/courses/decimal-operations/lessons/dop-05-03.json',
'dpv-01-03':'content/courses/decimals-place-value/lessons/dpv-01-03.json',
'dpv-03-01':'content/courses/decimals-place-value/lessons/dpv-03-01.json',
'dpv-04-03':'content/courses/decimals-place-value/lessons/dpv-04-03.json',
'esn-01-02':'content/courses/exponents-scientific-notation/lessons/esn-01-02.json',
'esn-01-03':'content/courses/exponents-scientific-notation/lessons/esn-01-03.json',
}
def clean(n):
    n=round(n,12)
    return 0 if n==0 else n
def js_round(x): return math.floor(x+0.5) if x>=0 else math.ceil(x-0.5)
def round_exp(v,e):
    u=10**e
    return clean(js_round(v/u)*u)
def scientific(v):
    e=math.floor(math.log10(abs(v))); return clean(v/(10**e)),e
def integer_scale(v):
    for e in range(13):
        if abs(v*10**e-round(v*10**e))<1e-9:return e
    return 12
def digit(v,e): return int(math.floor(abs(v)/(10**e)+1e-9))%10
def deciding(a,b):
    top=max(0,math.floor(math.log10(max(abs(a),abs(b),1e-12))))
    for e in range(top,-13,-1):
        if digit(a,e)!=digit(b,e):return e
    return -12
def truth(c):
    t=c['task']; vs=c['values']; n=None; claim=None
    if t=='shift': n=vs[0]*10**c['shiftExponent']
    elif t=='identifyShift': claim=f"shift:{round(math.log10(vs[1]/vs[0]))}"
    elif t=='compare': claim=f"relation:{'eq' if abs(vs[0]-vs[1])<1e-12 else 'lt' if vs[0]<vs[1] else 'gt'}"
    elif t=='decidingPlace': claim=f"place:{deciding(vs[0],vs[1])}"
    elif t=='round': n=round_exp(sum(vs),c['targetExponent'])
    elif t=='roundPartsThenSum': n=sum(round_exp(v,c['targetExponent']) for v in vs)
    elif t=='roundMethod': claim='method:exact-then-round'
    elif t=='roundGapCause':
        dirs=[1 if round_exp(v,c['targetExponent'])>v else -1 if round_exp(v,c['targetExponent'])<v else 0 for v in vs]
        claim='bias:'+('both-up' if all(x>0 for x in dirs) else 'both-down' if all(x<0 for x in dirs) else 'mixed')
    elif t=='decimalDivision': n=vs[0]/vs[1]
    elif t=='divisionFirstMove': claim=f"scale:{integer_scale(vs[1])}"
    elif t=='exponentChain':
        n=vs[0]
        for op,v in zip(c['exponentOps'],vs[1:]): n=n+v if op=='add' else n-v
    elif t=='placeExponent': claim=f"place-exponent:{c['targetExponent']}"
    elif t=='scientificForm':
        co,e=scientific(vs[0]); claim=f"scientific:{co:g}:{e}"
    elif t=='evaluatePowerTen': n=vs[0]*10**c['targetExponent']
    if n is not None:
        n=clean(n); claim=claim or f"number:{n:g}"
    return n,claim

def legacy_choices(widget):
    if widget['type']=='mcq': return widget['options']
    if widget['type']=='placeCompare':
        a,b=widget['left'],widget['right']; ans=widget['answer']
        return [
          {'id':'lt','label':f'{a} < {b}','correct':ans=='lt','feedback':widget['successFeedback'] if ans=='lt' else widget['ltFeedback']},
          {'id':'eq','label':f'{a} = {b}','correct':ans=='eq','feedback':widget['successFeedback'] if ans=='eq' else widget['eqFeedback']},
          {'id':'gt','label':f'{a} > {b}','correct':ans=='gt','feedback':widget['successFeedback'] if ans=='gt' else widget['gtFeedback']},
        ]
    raise ValueError(widget['type'])

def convert(widget,cfg):
    n,claim=truth(cfg); numeric=widget['type']=='numeric'
    base={'type':'placeValueTransformLab','task':cfg['task'],'answerMode':'numeric' if numeric else 'choice','prompt':widget['prompt'],'values':cfg['values'],
          'choices':[],'numericErrors':[],'requiredExplorations':cfg['requiredExplorations'],'successFeedback':'','explorationFeedback':cfg.get('explorationFeedback',f"Inspect at least {cfg['requiredExplorations']} base-ten stage{'s' if cfg['requiredExplorations']!=1 else ''} before checking."),
          'fallbackFeedback':widget.get('fallbackFeedback','Use the aligned place-value model and the inspected stages.'),'tolerance':widget.get('tolerance',0)}
    for k in ('targetExponent','shiftExponent','exponentOps','answerUnit'):
        if k in cfg: base[k]=cfg[k]
    if numeric:
        assert abs(widget['answer']-n)<=widget.get('tolerance',0)+1e-9,(widget['prompt'],widget['answer'],n)
        base['answerUnit']=cfg.get('answerUnit',widget.get('unit'))
        if not base.get('answerUnit'): base.pop('answerUnit',None)
        base['numericErrors']=widget.get('commonErrors',[])
        base['successFeedback']=widget['fallbackFeedback']
    else:
        opts=legacy_choices(widget); correct=[o for o in opts if o.get('correct')]; assert len(correct)==1
        base['successFeedback']=correct[0]['feedback']; base['choices']=[]
        for o in opts:
            x={'id':o['id'],'label':o['label'],'feedback':o['feedback']}
            if o.get('correct'):
                if n is not None:x['value']=n
                else:x['claim']=claim
            else:x['claim']=f"misconception:{o['id']}"
            base['choices'].append(x)
    return base

def cfg(task,values,required=2,**kw): return {'task':task,'values':values,'requiredExplorations':required,**kw}
C={
('pv2-03-02','i1'):cfg('roundPartsThenSum',[62300,24800],3,targetExponent=4),
('pv2-03-02','k1'):cfg('round',[62300,24800],3,targetExponent=4),
('pv2-03-02','k2'):cfg('roundMethod',[62300,24800],2,targetExponent=4),
('pv2-03-02','i2'):cfg('round',[38600,45900],3,targetExponent=4),
('pv2-03-02','k3'):cfg('roundGapCause',[38600,45900],3,targetExponent=4),
('pv2-03-02','ch1'):cfg('round',[24600,36800],3,targetExponent=3,answerUnit='people'),
('pv2-03-02','rem-re-k'):cfg('round',[3400,2700],3,targetExponent=3),
('dop-05-03','i1'):cfg('decimalDivision',[4.8,6],2),
('dop-05-03','k1'):cfg('decimalDivision',[7.5,5],2),
('dop-05-03','k2'):cfg('decimalDivision',[1.5,.5],2),
('dop-05-03','i2'):cfg('divisionFirstMove',[2.4,.6],2),
('dop-05-03','k3'):cfg('decimalDivision',[.9,.3],2),
('dop-05-03','ch1'):cfg('decimalDivision',[4.2,.7],2),
('dop-05-03','rem-dd-k'):cfg('decimalDivision',[3.6,.4],2),
('dpv-01-03','i1'):cfg('shift',[.03],1,shiftExponent=1),
('dpv-01-03','k1'):cfg('shift',[5],1,shiftExponent=-1),
('dpv-01-03','k2'):cfg('shift',[.03],2,shiftExponent=2),
('dpv-01-03','i2'):cfg('identifyShift',[6,.6],2),
('dpv-01-03','k3'):cfg('shift',[.5],1,shiftExponent=-1),
('dpv-01-03','ch1'):cfg('shift',[250],3,shiftExponent=-3),
('dpv-01-03','rem-lm-k'):cfg('shift',[.2],1,shiftExponent=1),
('dpv-03-01','i1'):cfg('compare',[.6,.4],1),
('dpv-03-01','k1'):cfg('compare',[.35,.38],2),
('dpv-03-01','k2'):cfg('compare',[.7,.68],1),
('dpv-03-01','i2'):cfg('compare',[.52,.5],2),
('dpv-03-01','k3'):cfg('decidingPlace',[.61,.48],1),
('dpv-03-01','ch1'):cfg('compare',[.409,.41],2),
('dpv-03-01','rem-cap-k'):cfg('compare',[.8,.3],1),
('dpv-04-03','i1'):cfg('round',[4.4],3,targetExponent=0,answerUnit='dollars'),
('dpv-04-03','k1'):cfg('round',[19.99],3,targetExponent=0,answerUnit='dollars'),
('dpv-04-03','k2'):cfg('round',[2.36],3,targetExponent=-1,answerUnit='meters'),
('dpv-04-03','i2'):cfg('round',[3.47],3,targetExponent=-1),
('dpv-04-03','k3'):cfg('placeExponent',[12.86],1,targetExponent=-2),
('dpv-04-03','ch1'):cfg('round',[12.86],3,targetExponent=-1,answerUnit='seconds'),
('dpv-04-03','rem-rdw-k'):cfg('round',[6.7],3,targetExponent=0,answerUnit='dollars'),
('esn-01-02','i1'):cfg('exponentChain',[4,3],2,exponentOps=['add']),
('esn-01-02','k1'):cfg('exponentChain',[6,2],2,exponentOps=['subtract']),
('esn-01-02','i2'):cfg('exponentChain',[3,-5],2,exponentOps=['add']),
('esn-01-02','k2'):cfg('exponentChain',[-2,3],2,exponentOps=['subtract']),
('esn-01-02','i3'):cfg('exponentChain',[3,-2],2,exponentOps=['subtract']),
('esn-01-02','k3'):cfg('exponentChain',[-3,-4],2,exponentOps=['add']),
('esn-01-02','ch1'):cfg('exponentChain',[5,-8,-2],3,exponentOps=['add','subtract']),
('esn-01-02','rem-esn0102-k'):cfg('exponentChain',[2,4],2,exponentOps=['add']),
('esn-01-03','i1'):cfg('placeExponent',[0.01],1,targetExponent=-2),
('esn-01-03','k1'):cfg('scientificForm',[4000],2),
('esn-01-03','i2'):cfg('scientificForm',[.007],2),
('esn-01-03','k2'):cfg('evaluatePowerTen',[6],2,targetExponent=4),
('esn-01-03','k3'):cfg('evaluatePowerTen',[9],2,targetExponent=-2),
('esn-01-03','ch1'):cfg('evaluatePowerTen',[5],2,targetExponent=6),
('esn-01-03','rem-esn0103-k'):cfg('evaluatePowerTen',[3],2,targetExponent=2),
}
assert len(C)==50,len(C)
changed=[]
for lesson_id,path in PATHS.items():
    p=ROOT/path; d=json.load(open(p)); count=0
    for step in d['steps']:
        key=(lesson_id,step['id'])
        if key in C:
            step['widget']=convert(step['widget'],C[key]); count+=1
    for rem in d.get('remedials',[]):
        step=rem['check']; key=(lesson_id,step['id'])
        if key in C:
            step['widget']=convert(step['widget'],C[key]); count+=1
    expected=sum(1 for k in C if k[0]==lesson_id); assert count==expected,(lesson_id,count,expected)
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
    changed.append((lesson_id,count))
print(changed)
