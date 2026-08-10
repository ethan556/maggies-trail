#!/usr/bin/env python3
import hashlib,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=Path(os.environ.get('SESSION147_BASELINE_ROOT', ROOT.parent/'session147-baseline'/'root'))
SKIP={'node_modules','.next','.cml-build','coverage','test-results','playwright-report','.git'}
def files(root):
 out={}
 for p in root.rglob('*'):
  if not p.is_file() or any(x in SKIP for x in p.parts) or p.suffix=='.log' or p.name.endswith('.tsbuildinfo') or p.name=='SESSION147_ARTIFACTS.json':continue
  out[p.relative_to(root).as_posix()]=p
 return out
b,a=files(BASE),files(ROOT)
changed=sorted(k for k in b.keys()&a.keys() if hashlib.sha256(b[k].read_bytes()).digest()!=hashlib.sha256(a[k].read_bytes()).digest())
added=sorted(a.keys()-b.keys());removed=sorted(b.keys()-a.keys())
def text_lines(p):
 try:return p.read_text(errors='strict').splitlines()
 except:return []
la=lr=0
for k in changed:
 bl,al=text_lines(b[k]),text_lines(a[k]);la+=max(0,len(al)-len(bl));lr+=max(0,len(bl)-len(al))
for k in added:la+=len(text_lines(a[k]))
for k in removed:lr+=len(text_lines(b[k]))
ledger=json.loads((ROOT/'SESSION147_CONTENT_CHANGE_LEDGER.json').read_text())
out={'session':147,'baselineSession':146,'changedExistingFiles':len(changed),'addedFiles':len(added),'removedFiles':len(removed),'textLinesAddedApprox':la,'textLinesRemovedApprox':lr,'changedFiles':changed,'addedFilePaths':added,'removedFilePaths':removed,'authoredLessonBoundary':ledger['summary']}
(ROOT/'SESSION147_DIFF_STATS.json').write_text(json.dumps(out,indent=2)+'\n')
print(f"diff stats: changed {len(changed)}, added {len(added)}, removed {len(removed)}")
