#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
files={}
for p in sorted((root/'content/courses').glob('*/lessons/*.json')):
    files[p.relative_to(root).as_posix()]=hashlib.sha256(p.read_bytes()).hexdigest()
if len(files)!=1129: raise SystemExit(f'expected 1129 lessons, got {len(files)}')
report={'scope':'all authored lesson JSON files in Session 146','algorithm':'SHA-256','count':len(files),'files':files}
(root/'SESSION146_LESSON_HASHES.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'lesson hashes S146: {len(files)}/{len(files)}')
