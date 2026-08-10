#!/usr/bin/env python3
import hashlib, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE='4db4b56213b5b25418b04c5b2a889ba755510b25'
SKIP_PREFIXES=('.git/','node_modules/','.next/','.cml-build/','coverage/','test-results/','playwright-report/')
SKIP_NAMES={'SESSION149_ARTIFACTS.json'}
def include(rel):
    return not rel.startswith(SKIP_PREFIXES) and not rel.endswith(('.log','.tsbuildinfo')) and rel not in SKIP_NAMES
tracked=subprocess.check_output(['git','diff','--name-only',BASE,'--'],cwd=ROOT,text=True).splitlines()
untracked=subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines()
changed=sorted(x for x in tracked if include(x))
added=sorted(x for x in untracked if include(x))
removed=[]
for rel in changed[:]:
    try: subprocess.check_output(['git','cat-file','-e',f'{BASE}:{rel}'],cwd=ROOT,stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        changed.remove(rel); added.append(rel)
for rel in subprocess.check_output(['git','diff','--name-only','--diff-filter=D',BASE,'--'],cwd=ROOT,text=True).splitlines():
    if include(rel): removed.append(rel)
changed=sorted(set(changed)-set(removed)); added=sorted(set(added)); removed=sorted(set(removed))
numstat=subprocess.check_output(['git','diff','--numstat',BASE,'--'],cwd=ROOT,text=True).splitlines()
lines_add=lines_del=0
for row in numstat:
    a,d,*_=row.split('\t')
    if a.isdigit(): lines_add+=int(a)
    if d.isdigit(): lines_del+=int(d)
for rel in added:
    p=ROOT/rel
    try: lines_add+=len(p.read_text().splitlines())
    except: pass
ledger=json.loads((ROOT/'SESSION149_CONTENT_CHANGE_LEDGER.json').read_text())
out={
 'session':149,'baselineSession':148,'baselineCommit':BASE,
 'changedExistingFiles':len(changed),'addedFiles':len(added),'removedFiles':len(removed),
 'textLinesAddedApprox':lines_add,'textLinesRemovedApprox':lines_del,
 'changedFiles':changed,'addedFilePaths':added,'removedFilePaths':removed,
 'authoredLessonBoundary':ledger['summary']
}
(ROOT/'SESSION149_DIFF_STATS.json').write_text(json.dumps(out,indent=2)+'\n')
print(f"diff stats: changed {len(changed)}, added {len(added)}, removed {len(removed)}")
