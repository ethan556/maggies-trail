#!/usr/bin/env python3
"""Misconception-diagnosis quality audit across all lessons.
Scores every check/challenge distractor on: presence, distinctness (no two wrong
paths share feedback), and diagnostic substance. Surfaces content needing padding
for the §3.2 differentiator #1 (misconception-diagnosing feedback)."""
import json, glob, re, sys, collections
GENERIC = re.compile(r'^["\'‘“]?(incorrect|wrong|try again|no|nope|not right|bad|sorry)\b', re.I)
def wrong_feedbacks(w):
    k=w.get('kind')
    if k=='mcq': return [o.get('feedback','') for o in w.get('options',[]) if not o.get('correct')]
    if k=='numeric': return [e.get('feedback','') for e in w.get('commonErrors',[])]
    if k=='tapDiagram': return [h.get('feedback','') for h in w.get('hotspots',[]) if not h.get('correct') and h.get('feedback')]
    for key in ('misorderFeedback','commonErrors','pairErrors','commonBuilds','pointErrors','commonStates','commonCounts','commonLandings','commonPicks'):
        if key in w: return [x.get('feedback','') for x in w[key]]
    return []
def substance(f):
    # diagnostic substance heuristic: names a cause/method, not just a verdict
    if not f or len(f.strip())<25: return False
    return True
courses=collections.Counter(); flagged=[]
tot_checks=tot_distractors=0
for cf in sorted(glob.glob('content/courses/*/course.json')):
    d=json.load(open(cf)); slug=d['slug']; cdir=cf.rsplit('/',1)[0]
    for lf in glob.glob(f'{cdir}/lessons/*.json'):
        L=json.load(open(lf)); lid=L.get('id',lf)
        for s in L.get('steps',[]):
            if s.get('kind') not in ('check','challenge'): continue
            w=s.get('widget',{}); fbs=wrong_feedbacks(w)
            if not fbs: continue
            tot_checks+=1; tot_distractors+=len(fbs)
            issues=[]
            if len(fbs)!=len(set(f.strip().lower() for f in fbs)):
                issues.append('DUP-FEEDBACK')  # two wrong paths share text
            thin=[f for f in fbs if not substance(f)]
            if thin: issues.append(f'THIN×{len(thin)}')
            gen=[f for f in fbs if GENERIC.match(f or '')]
            if gen: issues.append(f'GENERIC×{len(gen)}')
            if issues:
                courses[slug]+=1
                flagged.append((slug,lid,s.get('id'),';'.join(issues)))
print(f"Scanned {tot_checks} check/challenge steps, {tot_distractors} distractor-feedbacks.")
print(f"Flagged {len(flagged)} steps across {len(courses)} courses.\n")
print("TOP COURSES NEEDING MISCONCEPTION PADDING:")
for slug,n in courses.most_common(15):
    print(f"  {n:4d}  {slug}")
open('scripts/_misconception_flags.tsv','w').write('\n'.join('\t'.join(x) for x in flagged))
