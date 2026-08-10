#!/usr/bin/env python3
"""Verify Session 96 lesson edits are limited to declared variants, CML wiring, predictions, and four approved lab replacements."""
from __future__ import annotations
import argparse, copy, json
from pathlib import Path

FLAGSHIPS = {
    ("conic-sections", "co-05-02", "i1"),
    ("function-analysis", "fna-02-02", "i1"),
    ("limits-continuity", "lc-01-02", "i1"),
    ("polar-parametric", "pp-02-02", "i1"),
    ("polynomial-rational-analysis", "pra-04-02", "i1"),
    ("trig-graphs-inverses", "tg-03-01", "i1"),
    ("trig-identities-equations", "ti-01-01", "i1"),
    ("vectors-matrices", "vec-05-02", "i1"),
    ("curve-analysis", "ca-04-03", "i1"),
    ("derivative-rules", "dr-03-01", "i1"),
    ("derivatives-in-context", "dc-02-02", "i1"),
    ("differential-equations", "de-01-02", "i1"),
    ("integration-accumulation", "in-02-01", "i1"),
    ("integration-applications", "ia-01-03", "i1"),
    ("parametric-polar-calculus", "pc-02-01", "i1"),
    ("series-convergence", "sc-02-02", "i1"),
}

REPLACEMENTS = {
    ("conic-sections", "co-05-02", "i1"),
    ("derivative-rules", "dr-03-01", "i1"),
    ("derivative-rules", "dr-04-01", "i1"),
    ("derivatives-in-context", "dc-02-02", "i1"),
}
TARGET_COURSES = {
    "conic-sections", "function-analysis", "limits-continuity", "polar-parametric",
    "polynomial-rational-analysis", "trig-graphs-inverses", "trig-identities-equations", "vectors-matrices",
    "curve-analysis", "derivative-rules", "derivatives-in-context", "differential-equations",
    "integration-accumulation", "integration-applications", "parametric-polar-calculus", "series-convergence",
}

def step_map(node, path=()):
    out = {}
    if isinstance(node, dict):
        if isinstance(node.get("id"), str) and isinstance(node.get("kind"), str):
            key = path + ((node["id"]),)
            out[key] = node
        for k, v in node.items():
            out.update(step_map(v, path + (str(k),)))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            out.update(step_map(v, path + (str(i),)))
    return out

def canonical_without_steps(doc):
    d = copy.deepcopy(doc)
    def scrub(node):
        if isinstance(node, dict):
            if isinstance(node.get("id"), str) and isinstance(node.get("kind"), str):
                return {"__step__": node["id"], "kind": node["kind"]}
            return {k: scrub(v) for k, v in node.items()}
        if isinstance(node, list): return [scrub(v) for v in node]
        return node
    return scrub(d)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("baseline")
    ap.add_argument("current")
    ap.add_argument("--out", default="SESSION96_SEMANTIC_DIFF.json")
    args=ap.parse_args()
    base=Path(args.baseline); cur=Path(args.current)
    report={
        "schemaVersion":1,
        "scope":"Precalculus Session 95 + Calculus Session 96",
        "allowed":{"variantAdditions":0,"cmlAdditions":0,"predictionAdditions":0,"predictionUpgrades":0,"widgetReplacements":0,"bodyReplacements":0},
        "unintended":[], "lessonFilesCompared":0, "changedLessonFiles":0,
    }
    bfiles={p.relative_to(base).as_posix():p for p in (base/'content/courses').glob('*/lessons/*.json')}
    cfiles={p.relative_to(cur).as_posix():p for p in (cur/'content/courses').glob('*/lessons/*.json')}
    if bfiles.keys()!=cfiles.keys():
        report['unintended'].append({"type":"lesson-file-set","added":sorted(cfiles.keys()-bfiles.keys()),"deleted":sorted(bfiles.keys()-cfiles.keys())})
    for rel in sorted(bfiles.keys() & cfiles.keys()):
        report['lessonFilesCompared'] += 1
        b=json.loads(bfiles[rel].read_text()); c=json.loads(cfiles[rel].read_text())
        if b==c: continue
        report['changedLessonFiles'] += 1
        course=b.get('courseId') or rel.split('/')[2]
        lesson=b.get('id')
        if course not in TARGET_COURSES:
            report['unintended'].append({"type":"out-of-scope-lesson-change","file":rel})
            continue
        if canonical_without_steps(b)!=canonical_without_steps(c):
            report['unintended'].append({"type":"lesson-structure-or-metadata","file":rel})
            continue
        bs=step_map(b); cs=step_map(c)
        if bs.keys()!=cs.keys():
            report['unintended'].append({"type":"step-set","file":rel})
            continue
        for key in bs:
            x=copy.deepcopy(bs[key]); y=copy.deepcopy(cs[key]); sid=x['id']
            approved=(course, lesson, sid) in REPLACEMENTS
            for fld, counter in (("variant","variantAdditions"),("cml","cmlAdditions"),("predict","predictionAdditions")):
                xb=x.pop(fld, None); yb=y.pop(fld, None)
                if xb is None and yb is not None:
                    report['allowed'][counter]+=1
                elif xb != yb:
                    if fld == "predict" and (course, lesson, sid) in FLAGSHIPS:
                        report['allowed']['predictionUpgrades'] += 1
                    else:
                        report['unintended'].append({"type":f"{fld}-mutation","file":rel,"step":sid})
            if approved:
                if x.get('widget') != y.get('widget'):
                    report['allowed']['widgetReplacements'] += 1
                    x.pop('widget',None); y.pop('widget',None)
                if x.get('body') != y.get('body'):
                    report['allowed']['bodyReplacements'] += 1
                    x.pop('body',None); y.pop('body',None)
            if x != y:
                changed=sorted(set(x.keys())|set(y.keys()))
                changed=[k for k in changed if x.get(k)!=y.get(k)]
                report['unintended'].append({"type":"authored-step-drift","file":rel,"step":sid,"fields":changed})
    expected={"variantAdditions":621,"cmlAdditions":82,"predictionAdditions":9,"predictionUpgrades":7,"widgetReplacements":4,"bodyReplacements":4}
    report['expected']=expected
    report['countsMatchExpected']=all(report['allowed'][k]==v for k,v in expected.items())
    report['status']='PASS' if not report['unintended'] and report['countsMatchExpected'] else 'FAIL'
    Path(args.out).write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps(report,indent=2))
    raise SystemExit(0 if report['status']=='PASS' else 1)
if __name__=='__main__': main()
