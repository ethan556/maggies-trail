#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
exclude={'SESSION146_ARTIFACTS.json'}
forbidden={'.git','node_modules','.next','.cml-build','coverage','test-results','playwright-report','.turbo'}
files={}
for p in sorted(root.rglob('*')):
    if not p.is_file(): continue
    rel=p.relative_to(root)
    if any(part in forbidden for part in rel.parts): continue
    if rel.as_posix() in exclude: continue
    files[rel.as_posix()]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
report={'session':146,'algorithm':'SHA-256','root':'maggies-trail-session-146','count':len(files),'files':files}
(root/'SESSION146_ARTIFACTS.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'artifact manifest S146: {len(files)} files')
