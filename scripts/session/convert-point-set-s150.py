#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def coord_set(points,label='story observations'):
    return {'id':'story','label':label,'points':[{'id':f'p{i+1}','label':f'point {i+1}','x':x,'y':y} for i,(x,y) in enumerate(points)]}
def data_set(id,label,values):
    return {'id':id,'label':label,'points':[{'id':f'{id}-{i}','label':f'value {i+1}','x':v} for i,v in enumerate(values)]}
def choice_widget(old, cfg, claim, keys):
    correct=next(o for o in old['options'] if o.get('correct'))
    choices=[]
    for o in old['options']:
        choices.append({'id':o['id'],'label':o['label'],'feedback':o['feedback'],'claim':claim if o.get('correct') else f"misconception:{o['id']}"})
    return {'type':'pointSetReasoningLab','answerMode':'choice','prompt':old['prompt'],**cfg,'choices':choices,'numericErrors':[],'authoredStages':[],'requiredStageKeys':keys,'requiredExplorations':len(keys),'successFeedback':correct['feedback'],'explorationFeedback':'Inspect every required observation and derived point-set state before checking.','fallbackFeedback':'Choose the conclusion supported by the point-set state.','tolerance':0}
def numeric_widget(old,cfg,keys):
    return {'type':'pointSetReasoningLab','answerMode':'numeric','prompt':old['prompt'],**cfg,'answerUnit':old.get('unit') or None,'choices':[],'numericErrors':old.get('commonErrors',[]),'authoredStages':[],'requiredStageKeys':keys,'requiredExplorations':len(keys),'successFeedback':old['fallbackFeedback'],'explorationFeedback':'Inspect every required observation and derived point-set state before checking.','fallbackFeedback':old['fallbackFeedback'],'tolerance':old.get('tolerance',0)}

def convert_cg():
    path=ROOT/'content/courses/coordinate-geometry/lessons/cg-01-03.json';d=json.loads(path.read_text())
    steps={s['id']:s for s in d['steps']}
    s=steps['i1'];cfg={'task':'axisMeaning','xLabel':'blocks east','yLabel':'blocks north','sets':[coord_set([(5,1)])],'targetSetId':'story','targetPointId':'p1','targetAxis':'x'};s['widget']=choice_widget(s['widget'],cfg,'axis:x:blocks east',['axis:x','point:p1'])
    s=steps['k1'];cfg={'task':'axisDistance','xLabel':'blocks east','yLabel':'blocks north','sets':[coord_set([(1,4),(6,4)])],'targetSetId':'story','pathPointIds':['p1','p2']};s['widget']=numeric_widget(s['widget'],cfg,['point:p1','point:p2','distance:changes','distance:total'])
    s=steps['k2'];cfg={'task':'pointRead','xLabel':'week','yLabel':'dollars saved','sets':[coord_set([(1,3),(2,6),(3,9)])],'targetSetId':'story','targetPointId':'p3','targetAxis':'y'};s['widget']=choice_widget(s['widget'],cfg,'point-read:9',['point:p3','axis:y']);s['widget']['choices'][0]['claim']='point-read:9'
    # pointRead truth is numeric; use numberValue for correct choice
    for c in s['widget']['choices']:
        if c['id']=='a': c.pop('claim',None);c['numberValue']=9
    s=steps['i2'];cfg={'task':'sequenceExtend','xLabel':'week','yLabel':'dollars saved','sets':[coord_set([(1,3),(2,6),(3,9)])],'targetSetId':'story','targetX':4};s['widget']=numeric_widget(s['widget'],cfg,['point:p1','point:p2','point:p3','sequence:rate','sequence:extend'])
    s=steps['k3'];cfg={'task':'pathLength','xLabel':'blocks east','yLabel':'blocks north','sets':[coord_set([(2,1),(2,5),(7,5)])],'targetSetId':'story','pathPointIds':['p1','p2','p3']};s['widget']=numeric_widget(s['widget'],cfg,['point:p1','point:p2','path:leg:1','point:p3','path:leg:2','path:total'])
    s=steps['ch1'];cfg={'task':'pointMeaning','xLabel':'day','yLabel':'tomatoes picked','sets':[coord_set([(4,8)])],'targetSetId':'story','targetPointId':'p1'};s['widget']=choice_widget(s['widget'],cfg,'point:4:8:day:tomatoes picked',['axis:x','axis:y','point:p1'])
    r=d['remedials'][0]['check'];cfg={'task':'pointMeaning','xLabel':'blocks east','yLabel':'blocks north','sets':[coord_set([(3,2)])],'targetSetId':'story','targetPointId':'p1'};r['widget']=choice_widget(r['widget'],cfg,'point:3:2:blocks east:blocks north',['axis:x','axis:y','point:p1'])
    path.write_text(json.dumps(d,indent=2)+'\n')

def convert_dd():
    path=ROOT/'content/courses/data-distributions/lessons/dd-04-01.json';d=json.loads(path.read_text());steps={s['id']:s for s in d['steps']}
    s=steps['i1'];cfg={'task':'rangeEndpoints','xLabel':'laps','sets':[data_set('data','laps data',[3,5,7,9,12])],'targetSetId':'data'};s['widget']=choice_widget(s['widget'],cfg,'range:endpoints:3:12',['range:min','range:max','range:span'])
    s=steps['k1'];cfg={'task':'rangeValue','xLabel':'temperature','sets':[data_set('data','temperatures',[58,64,71,62])],'targetSetId':'data'};s['widget']=numeric_widget(s['widget'],cfg,['range:min','range:max','range:span'])
    s=steps['i2'];cfg={'task':'rangeValue','xLabel':'value','sets':[data_set('data','data',[2,3,5,8,10])],'targetSetId':'data'};s['widget']=numeric_widget(s['widget'],cfg,['range:min','range:max','range:span'])
    s=steps['k2'];cfg={'task':'rangeBlindness','xLabel':'value','sets':[data_set('a','bunched set',[2,6,6,6,10]),data_set('b','spread interior set',[2,3,5,8,10])],'targetSetId':'a'};s['widget']=choice_widget(s['widget'],cfg,'range:interior-blind',['range:a:endpoints','range:b:endpoints','range:interior'])
    s=steps['ch1'];cfg={'task':'rangeUpdate','xLabel':'laps','sets':[data_set('data','original laps',[3,5,7,9,12])],'targetSetId':'data','addedValue':20};s['widget']=numeric_widget(s['widget'],cfg,['range:old','range:added','range:new-endpoints','range:new-span'])
    r=d['remedials'][0]['check'];cfg={'task':'rangeValue','xLabel':'value','sets':[data_set('data','data',[4,9,6])],'targetSetId':'data'};r['widget']=numeric_widget(r['widget'],cfg,['range:min','range:max','range:span'])
    path.write_text(json.dumps(d,indent=2)+'\n')

if __name__=='__main__': convert_cg();convert_dd();print('converted 2 lessons / 13 widgets')
