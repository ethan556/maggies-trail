#!/usr/bin/env python3
import json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def truth(cfg):
    series=[]
    for e in cfg['series']:
        rates=[round(y/x,12) for x,y in e['pairs']]
        series.append({**e,'rates':rates,'constant':rates[0],'proportional':all(abs(r-rates[0])<1e-9 for r in rates)})
    target=next((e for e in series if e['id']==cfg.get('targetSeriesId')),series[0])
    ranked=sorted(series,key=lambda e:(e['constant'],e['id']))
    best=ranked[-1] if cfg.get('optimize')=='max' else ranked[0]
    t=cfg['task']; n=None; claim=None
    if t in ('unitRate','constant'): n=target['constant']
    elif t in ('predictOutput','scaleRatio'): n=target['constant']*cfg['targetInput']
    elif t=='predictInput': n=cfg['targetOutput']/target['constant']
    elif t=='cheaperThenPredict': n=best['constant']*cfg['targetInput']; claim=f"series:{best['id']}"
    elif t=='percentOf': n=cfg['targetInput']*cfg['percent']/100
    elif t=='discount':
        subtotal=target['constant']*cfg['targetInput']; n=subtotal-subtotal*cfg['percent']/100
    elif t=='bestRate': claim=f"series:{best['id']}"
    elif t=='steadyAssumption': claim='assumption:holds' if target['proportional'] else 'assumption:failed'
    elif t=='testProportional': claim='proportional:yes' if target['proportional'] else 'proportional:no'
    if n is not None: n=round(n,12); claim=claim or f"number:{n:g}"
    return n,claim

def convert(widget,cfg):
    n,claim=truth(cfg)
    common={
      'type':'proportionalReasoningLab','task':cfg['task'],'answerMode':'numeric' if widget['type']=='numeric' else 'choice',
      'prompt':widget['prompt'],'xLabel':cfg['xLabel'],'yLabel':cfg['yLabel'],'series':cfg['series'],
      'requiredExplorations':cfg['requiredExplorations'],'successFeedback':'','explorationFeedback':f"Inspect at least {cfg['requiredExplorations']} proportional relationship{'s' if cfg['requiredExplorations']!=1 else ''} before checking.",
      'fallbackFeedback':widget.get('fallbackFeedback','Choose the conclusion supported by the normalized ratios.'),
      'tolerance':widget.get('tolerance',0),'choices':[],'numericErrors':[]
    }
    for k in ('targetSeriesId','targetInput','targetOutput','percent','optimize','answerUnit'):
        if k in cfg: common[k]=cfg[k]
    if widget['type']=='numeric':
        common['answerUnit']=cfg.get('answerUnit',widget.get('unit'))
        if common.get('answerUnit') is None: common.pop('answerUnit',None)
        common['numericErrors']=widget.get('commonErrors',[])
        common['successFeedback']=widget['fallbackFeedback']
        assert abs(widget['answer']-n)<=widget.get('tolerance',0)+1e-9,(widget['prompt'],widget['answer'],n)
    else:
        correct=[o for o in widget['options'] if o.get('correct')]
        assert len(correct)==1
        common['successFeedback']=correct[0]['feedback']
        common['choices']=[]
        for o in widget['options']:
            choice={'id':o['id'],'label':o['label'],'feedback':o['feedback']}
            if o.get('correct'):
                if n is not None: choice['value']=n
                else: choice['claim']=claim
            else: choice['claim']=f"misconception:{o['id']}"
            common['choices'].append(choice)
    return common

def one(id,label,pairs): return [{'id':id,'label':label,'pairs':pairs}]
C={
('rr-03-02','i1'):dict(task='unitRate',xLabel='ounces',yLabel='cents',series=one('juice','juice',[[12,300]]),targetSeriesId='juice',answerUnit='cents per ounce',requiredExplorations=1),
('rr-03-02','k1'):dict(task='unitRate',xLabel='ounces',yLabel='cents',series=one('juice','juice',[[20,400]]),targetSeriesId='juice',answerUnit='cents per ounce',requiredExplorations=1),
('rr-03-02','k2'):dict(task='bestRate',xLabel='ounce',yLabel='cents',series=[{'id':'small','label':'small package','pairs':[[1,25]]},{'id':'large','label':'large package','pairs':[[1,20]]}],optimize='min',requiredExplorations=2),
('rr-03-02','i2'):dict(task='unitRate',xLabel='hours',yLabel='miles',series=one('ana','Ana',[[2,18]]),targetSeriesId='ana',answerUnit='miles per hour',requiredExplorations=1),
('rr-03-02','k3'):dict(task='bestRate',xLabel='hours',yLabel='miles',series=[{'id':'ana','label':'Ana','pairs':[[2,18]]},{'id':'ben','label':'Ben','pairs':[[3,24]]}],optimize='max',requiredExplorations=2),
('rr-03-02','ch1'):dict(task='bestRate',xLabel='ounces',yLabel='cents',series=[{'id':'jar-8','label':'8 oz jar','pairs':[[8,240]]},{'id':'jar-12','label':'12 oz jar','pairs':[[12,300]]},{'id':'jar-15','label':'15 oz jar','pairs':[[15,450]]}],optimize='min',requiredExplorations=3),
('rr-03-02','rem-bb-k'):dict(task='bestRate',xLabel='pounds',yLabel='dollars',series=[{'id':'deal-a','label':'Deal A','pairs':[[2,4]]},{'id':'deal-b','label':'Deal B','pairs':[[3,9]]}],optimize='min',requiredExplorations=2),
('rr-03-03','i1'):dict(task='predictOutput',xLabel='hours',yLabel='dollars',series=one('job','job',[[1,12]]),targetSeriesId='job',targetInput=6,answerUnit='dollars',requiredExplorations=2),
('rr-03-03','k1'):dict(task='predictInput',xLabel='hours',yLabel='dollars',series=one('job','job',[[1,12]]),targetSeriesId='job',targetOutput=60,answerUnit='hours',requiredExplorations=2),
('rr-03-03','k2'):dict(task='predictOutput',xLabel='minutes',yLabel='pages',series=one('printer','printer',[[5,40]]),targetSeriesId='printer',targetInput=20,answerUnit='pages',requiredExplorations=2),
('rr-03-03','i2'):dict(task='predictOutput',xLabel='pounds',yLabel='dollars',series=one('apples','apples',[[3,6]]),targetSeriesId='apples',targetInput=10,answerUnit='dollars',requiredExplorations=2),
('rr-03-03','k3'):dict(task='steadyAssumption',xLabel='miles',yLabel='minutes',series=one('run','Jo',[[1,8],[5,48]]),targetSeriesId='run',requiredExplorations=2),
('rr-03-03','ch1'):dict(task='cheaperThenPredict',xLabel='pounds',yLabel='dollars',series=[{'id':'store-a','label':'Store A','pairs':[[5,15]]},{'id':'store-b','label':'Store B','pairs':[[2,8]]}],targetInput=6,optimize='min',answerUnit='dollars',requiredExplorations=3),
('rr-03-03','rem-rp-k'):dict(task='predictOutput',xLabel='pounds',yLabel='dollars',series=one('purchase','purchase',[[2,10]]),targetSeriesId='purchase',targetInput=3,answerUnit='dollars',requiredExplorations=2),
('rr-05-03','i1'):dict(task='scaleRatio',xLabel='blue parts',yLabel='white parts',series=one('paint','paint mix',[[2,5]]),targetSeriesId='paint',targetInput=6,answerUnit='white parts',requiredExplorations=2),
('rr-05-03','k1'):dict(task='unitRate',xLabel='hours',yLabel='miles',series=one('cyclist','cyclist',[[3,15]]),targetSeriesId='cyclist',answerUnit='miles per hour',requiredExplorations=1),
('rr-05-03','k2'):dict(task='predictOutput',xLabel='hours',yLabel='miles',series=one('cyclist','cyclist',[[1,5]]),targetSeriesId='cyclist',targetInput=4,answerUnit='miles',requiredExplorations=2),
('rr-05-03','k3'):dict(task='percentOf',xLabel='games',yLabel='wins',series=one('team','team',[[100,20]]),targetSeriesId='team',targetInput=60,percent=20,answerUnit='games',requiredExplorations=2),
('rr-05-03','i2'):dict(task='bestRate',xLabel='pounds',yLabel='dollars',series=[{'id':'store-a','label':'Store A','pairs':[[2,6]]},{'id':'store-b','label':'Store B','pairs':[[5,16]]}],optimize='min',requiredExplorations=2),
('rr-05-03','k4'):dict(task='discount',xLabel='pounds',yLabel='dollars',series=one('purchase','purchase',[[1,4]]),targetSeriesId='purchase',targetInput=5,percent=10,answerUnit='dollars',requiredExplorations=3),
('rr-05-03','ch1'):dict(task='discount',xLabel='pounds',yLabel='dollars',series=one('purchase','purchase',[[1,3]]),targetSeriesId='purchase',targetInput=4,percent=25,answerUnit='dollars',requiredExplorations=3),
('rr-05-03','rem-cap-k'):dict(task='unitRate',xLabel='pens',yLabel='dollars',series=one('pack','pen pack',[[4,12]]),targetSeriesId='pack',answerUnit='dollars per pen',requiredExplorations=1),
('pr-02-01','i1'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,9],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','k1'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[1,4],[2,8],[10,40]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','i2'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,10],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','i3'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[1,4],[2,9],[3,12]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','k2'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[3,2],[6,4],[9,6]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','k3'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[4,12],[5,16],[8,24]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','ch1'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,9],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-01','rem-ptp-k'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,9],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-03','i1'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,9],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-03','k1'):dict(task='constant',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,9],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-03','i2'):dict(task='testProportional',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,10],[5,15]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-03','i3'):dict(task='predictOutput',xLabel='x',yLabel='y',series=one('table','table',[[3,9],[5,15]]),targetSeriesId='table',targetInput=7,requiredExplorations=2),
('pr-02-03','k2'):dict(task='constant',xLabel='x',yLabel='y',series=one('table','table',[[3,2],[6,4],[9,6]]),targetSeriesId='table',requiredExplorations=3),
('pr-02-03','k3'):dict(task='predictOutput',xLabel='x',yLabel='y',series=one('table','table',[[1,4]]),targetSeriesId='table',targetInput=5,requiredExplorations=2),
('pr-02-03','ch1'):dict(task='predictOutput',xLabel='x',yLabel='y',series=one('table','table',[[1,8],[2,16]]),targetSeriesId='table',targetInput=6,requiredExplorations=2),
('pr-02-03','rem-pap-k'):dict(task='constant',xLabel='x',yLabel='y',series=one('table','table',[[2,6],[3,9],[5,15]]),targetSeriesId='table',requiredExplorations=3),
}
paths={}
for p in ROOT.glob('content/courses/*/lessons/*.json'):
    d=json.loads(p.read_text())
    if any(k[0]==d.get('id') for k in C): paths[d['id']]=p
for lid,p in paths.items():
    d=json.loads(p.read_text())
    seen=[]
    for step in d.get('steps',[]):
        key=(lid,step['id'])
        if key in C:
            step['widget']=convert(step['widget'],C[key]); seen.append(step['id'])
    for rem in d.get('remedials',[]):
        check=rem.get('check',{}); key=(lid,check.get('id'))
        if key in C:
            check['widget']=convert(check['widget'],C[key]); seen.append(check['id'])
    expected=[k[1] for k in C if k[0]==lid]
    assert sorted(seen)==sorted(expected),(lid,seen,expected)
    p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
    print(lid,len(seen))
