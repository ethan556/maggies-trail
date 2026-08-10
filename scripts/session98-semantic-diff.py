#!/usr/bin/env python3
import copy, json, pathlib, sys
if len(sys.argv) < 2:
    raise SystemExit('usage: session98-semantic-diff.py BASELINE_ROOT [CURRENT_ROOT]')
baseline=pathlib.Path(sys.argv[1])
current=pathlib.Path(sys.argv[2] if len(sys.argv)>2 else '.')
base_root=baseline/'content/courses'
cur_root=current/'content/courses'
base_files={p.relative_to(base_root):p for p in base_root.rglob('*.json')}
cur_files={p.relative_to(cur_root):p for p in cur_root.rglob('*.json')}
if base_files.keys()!=cur_files.keys():
    print(json.dumps({'status':'FAIL','missing':sorted(map(str,base_files.keys()-cur_files.keys())),'added':sorted(map(str,cur_files.keys()-base_files.keys()))},indent=2));sys.exit(1)
changed=0; tag_add=0;cml_add=0;unintended=[]
def scrub(obj):
    obj=copy.deepcopy(obj)
    for step in obj.get('steps',[]) if isinstance(obj,dict) else []:
        step.pop('conceptTag',None);step.pop('cml',None)
    return obj
for rel in sorted(base_files):
    b=json.loads(base_files[rel].read_text()); c=json.loads(cur_files[rel].read_text())
    if b!=c: changed+=1
    bs={s.get('id'):s for s in b.get('steps',[]) if isinstance(s,dict)}
    cs={s.get('id'):s for s in c.get('steps',[]) if isinstance(s,dict)}
    for sid,s in cs.items():
        old=bs.get(sid,{})
        if 'conceptTag' not in old and 'conceptTag' in s: tag_add+=1
        if 'cml' not in old and 'cml' in s: cml_add+=1
    if scrub(b)!=scrub(c): unintended.append(str(rel))
result={'status':'PASS' if not unintended else 'FAIL','lessonJsonFiles':len(base_files),'changedLessonFiles':changed,'conceptTagAdditions':tag_add,'cmlAdditions':cml_add,'unintendedContentDrift':len(unintended),'unintendedFiles':unintended[:50]}
print(json.dumps(result,indent=2))
sys.exit(1 if unintended else 0)
