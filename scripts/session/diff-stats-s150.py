#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,os
cur=Path(__file__).resolve().parents[2]
base=Path(os.environ.get('SESSION149_ROOT', str(cur.parent / 'maggies-trail-session-149')))
exclude_dirs={'node_modules','.next','.cml-build','coverage','test-results','playwright-report','.git'}
exclude_suffix={'.log','.tsbuildinfo'}
def files(root):
 out={}
 for p in root.rglob('*'):
  if not p.is_file(): continue
  rel=p.relative_to(root).as_posix()
  if any(part in exclude_dirs for part in p.relative_to(root).parts): continue
  if p.suffix in exclude_suffix or p.name=='.DS_Store': continue
  out[rel]=(p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
 return out
A=files(base); B=files(cur)
added=sorted(B.keys()-A.keys()); deleted=sorted(A.keys()-B.keys()); changed=sorted(k for k in A.keys()&B.keys() if A[k][1]!=B[k][1])
lesson_changed=[x for x in changed if x.startswith('content/courses/') and x.endswith('.json')]
source_changed=[x for x in changed if x.startswith('src/') or x.startswith('scripts/')]
result={'session':150,'baselineSession':149,'baselineRoot':str(base),'summary':{'addedFiles':len(added),'deletedFiles':len(deleted),'changedFiles':len(changed),'changedLessonFiles':len(lesson_changed),'changedSourceOrScriptFiles':len(source_changed),'bytesAdded':sum(B[x][0] for x in added),'bytesDeleted':sum(A[x][0] for x in deleted),'bytesChangedBefore':sum(A[x][0] for x in changed),'bytesChangedAfter':sum(B[x][0] for x in changed)},'changedLessonFiles':lesson_changed,'sourceOrScriptFilesChanged':source_changed,'addedFiles':added,'deletedFiles':deleted,'changedFiles':changed,'authoredBoundary':json.load(open(cur/'SESSION150_CONTENT_CHANGE_LEDGER.json'))['summary']}
(cur/'SESSION150_DIFF_STATS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result['summary'],indent=2))
