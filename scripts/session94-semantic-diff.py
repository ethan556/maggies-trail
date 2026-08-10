import json,glob,os,copy,hashlib
from pathlib import Path
base=Path('/tmp/s93check');cur=Path('.')
geometry={'circle-theorems','constructions-and-proof','coordinate-proofs','geometry-foundations','polygons-quadrilaterals','right-triangles-trig','similarity','solid-geometry','triangle-congruence'}
replacements={('triangle-congruence','tc-01-01','i1'):('triangleSolve','triangleConstraintLab'),('coordinate-proofs','cx-01-03','i1'):('distanceGrid','coordinateProofLab'),('solid-geometry','sg-03-01','i1'):('volumeBuilder','solidSliceLab')}
variant_added=[];cml_added=[];pred_added=[];widget_changed=[];drift=[];files_checked=0

def canon(x): return json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':'))
for cp in glob.glob('content/courses/*/lessons/*.json'):
 p=Path(cp);rel=p.relative_to(cur);bp=base/rel
 if not bp.exists(): drift.append({'file':str(rel),'reason':'new lesson file'});continue
 a=json.load(open(bp));b=json.load(open(p));files_checked+=1
 course=p.parts[2]
 if course not in geometry:
  if canon(a)!=canon(b):drift.append({'file':str(rel),'reason':'non-geometry lesson changed'})
  continue
 if [s['id'] for s in a.get('steps',[])]!=[s['id'] for s in b.get('steps',[])]:
  drift.append({'file':str(rel),'reason':'step ids/order changed'});continue
 ac=copy.deepcopy(a);bc=copy.deepcopy(b)
 for sa,sb in zip(ac.get('steps',[]),bc.get('steps',[])):
  key=(course,b.get('id'),sb['id'])
  if 'variant' not in sa and 'variant' in sb:variant_added.append((*key,sb['variant']))
  if 'cml' not in sa and 'cml' in sb:cml_added.append((*key,sb['widget']['type'],bool(sb['cml'].get('flagship'))))
  if 'predict' not in sa and 'predict' in sb:pred_added.append((*key,sb['widget']['type']))
  oldt=sa.get('widget',{}).get('type');newt=sb.get('widget',{}).get('type')
  if oldt!=newt:widget_changed.append((*key,oldt,newt))
  for x in (sa,sb):
   x.pop('variant',None);x.pop('cml',None);x.pop('predict',None)
  if key in replacements:
   sa.pop('widget',None);sb.pop('widget',None)
 if canon(ac)!=canon(bc):drift.append({'file':str(rel),'reason':'content outside allowed variant/CML/prediction/new-widget surfaces changed'})
for key,(old,new) in replacements.items():
 assert key+(old,new) in widget_changed,(key,widget_changed)
assert len(variant_added)==410,len(variant_added)
assert len(cml_added)==29,len(cml_added)
assert len(pred_added)==4,len(pred_added)
assert len(widget_changed)==3,len(widget_changed)
assert not drift,drift[:5]
out={'baseline':'maggies-trail-session-93','session':'94','lessonFilesChecked':files_checked,'geometryCourses':sorted(geometry),'allowedChanges':{'variantDeclarationsAdded':len(variant_added),'cmlContractsAdded':len(cml_added),'flagshipCML':sum(x[-1] for x in cml_added),'supportingCML':sum(not x[-1] for x in cml_added),'predictionsAdded':len(pred_added),'widgetReplacements':len(widget_changed)},'widgetReplacements':[{'course':c,'lesson':l,'step':s,'from':o,'to':n} for c,l,s,o,n in widget_changed],'unintendedContentDrift':drift,'status':'PASS'}
Path('SESSION94_SEMANTIC_DIFF.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))
