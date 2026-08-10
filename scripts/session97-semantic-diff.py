#!/usr/bin/env python3
"""Verify Session 97 lesson edits are limited to probability variants, CML wiring, and one approved conditional-table replacement."""
from __future__ import annotations
import argparse, copy, json
from pathlib import Path
TARGET_COURSES={'measurement-data','data-distributions','sampling-and-probability','bivariate-statistics','conditional-probability','statistical-inference'}
REPLACEMENTS={('conditional-probability','cpr-03-02','i1')}

def step_map(node,path=()):
 out={}
 if isinstance(node,dict):
  if isinstance(node.get('id'),str) and isinstance(node.get('kind'),str): out[path+(node['id'],)]=node
  for k,v in node.items(): out.update(step_map(v,path+(str(k),)))
 elif isinstance(node,list):
  for i,v in enumerate(node): out.update(step_map(v,path+(str(i),)))
 return out

def canonical_without_steps(doc):
 def scrub(node):
  if isinstance(node,dict):
   if isinstance(node.get('id'),str) and isinstance(node.get('kind'),str): return {'__step__':node['id'],'kind':node['kind']}
   return {k:scrub(v) for k,v in node.items()}
  if isinstance(node,list): return [scrub(v) for v in node]
  return node
 return scrub(copy.deepcopy(doc))

def main():
 ap=argparse.ArgumentParser();ap.add_argument('baseline');ap.add_argument('current');ap.add_argument('--out',default='SESSION97_SEMANTIC_DIFF.json');args=ap.parse_args()
 base,cur=Path(args.baseline),Path(args.current)
 report={'schemaVersion':1,'scope':'Statistics and Probability Session 97','allowed':{'variantAdditions':0,'cmlAdditions':0,'predictionAdditions':0,'widgetReplacements':0,'bodyReplacements':0},'unintended':[],'lessonFilesCompared':0,'changedLessonFiles':0}
 bfiles={p.relative_to(base).as_posix():p for p in (base/'content/courses').glob('*/lessons/*.json')};cfiles={p.relative_to(cur).as_posix():p for p in (cur/'content/courses').glob('*/lessons/*.json')}
 if bfiles.keys()!=cfiles.keys(): report['unintended'].append({'type':'lesson-file-set','added':sorted(cfiles.keys()-bfiles.keys()),'deleted':sorted(bfiles.keys()-cfiles.keys())})
 for rel in sorted(bfiles.keys()&cfiles.keys()):
  report['lessonFilesCompared']+=1;b=json.loads(bfiles[rel].read_text());c=json.loads(cfiles[rel].read_text())
  if b==c: continue
  report['changedLessonFiles']+=1;course=b.get('courseId') or rel.split('/')[2];lesson=b.get('id')
  if course not in TARGET_COURSES: report['unintended'].append({'type':'out-of-scope-lesson-change','file':rel});continue
  if canonical_without_steps(b)!=canonical_without_steps(c): report['unintended'].append({'type':'lesson-structure-or-metadata','file':rel});continue
  bs,cs=step_map(b),step_map(c)
  if bs.keys()!=cs.keys(): report['unintended'].append({'type':'step-set','file':rel});continue
  for key in bs:
   x,y=copy.deepcopy(bs[key]),copy.deepcopy(cs[key]);sid=x['id'];approved=(course,lesson,sid) in REPLACEMENTS
   for fld,counter in [('variant','variantAdditions'),('cml','cmlAdditions'),('predict','predictionAdditions')]:
    xb,yb=x.pop(fld,None),y.pop(fld,None)
    if xb is None and yb is not None: report['allowed'][counter]+=1
    elif xb!=yb: report['unintended'].append({'type':f'{fld}-mutation','file':rel,'step':sid})
   if approved:
    if x.get('widget')!=y.get('widget'): report['allowed']['widgetReplacements']+=1;x.pop('widget',None);y.pop('widget',None)
    if x.get('body')!=y.get('body'): report['allowed']['bodyReplacements']+=1;x.pop('body',None);y.pop('body',None)
   if x!=y:
    fields=[k for k in sorted(set(x)|set(y)) if x.get(k)!=y.get(k)]
    report['unintended'].append({'type':'authored-step-drift','file':rel,'step':sid,'fields':fields})
 expected={'variantAdditions':27,'cmlAdditions':38,'predictionAdditions':1,'widgetReplacements':1,'bodyReplacements':1};report['expected']=expected;report['countsMatchExpected']=all(report['allowed'][k]==v for k,v in expected.items());report['status']='PASS' if not report['unintended'] and report['countsMatchExpected'] else 'FAIL'
 Path(args.out).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(0 if report['status']=='PASS' else 1)
if __name__=='__main__':main()
