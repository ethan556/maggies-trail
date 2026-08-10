#!/usr/bin/env python3
"""rf-* mcq → buildExpression (factor/chunk tiles). Verbatim feedback; NEW missFeedback only."""
import json, glob, os, itertools, sys

pris = "/tmp/pristine/tallytrail"
def path(lid): return glob.glob(f"content/courses/*/lessons/{lid}.json")[0]
def load_pris(lid): return json.load(open(os.path.join(pris, path(lid))))

def fb(step, label):
    o = next(o for o in step["widget"]["options"] if o["label"] == label)
    return o["feedback"]

def perms(seq):
    return [list(p) for p in itertools.permutations(seq)]

# Each entry: lid, sid, tokens [(id,label)...], correct, acceptAlso, traps [(sequences, distractor_label)...],
# missFeedback (NEW), reusable
PLANS = [
 ("rf-01-02","ch1",
  [("xm3","(x − 3)"),("xp3","(x + 3)"),("xm2","(x − 2)"),("xp2","(x + 2)"),("neg6","(−x − 6)"),("neg4","(−4)"),("div","/")],
  ["xm3","div","xm2"], [],
  [([["xm3","div","xp2"]],"(x − 3)/(x + 2)"),([["xp3","div","xm2"]],"(x + 3)/(x − 2)"),([["neg6","div","neg4"]],"(−x − 6)/(−4)")],
  "Factor both quadratics first — x² − x − 6 = (x − 3)(x + 2) and x² − 4 = (x − 2)(x + 2) — then cancel the shared factor.", False),
 ("rf-01-03","k3",
  [("neg","−"),("xp3","(x + 3)"),("xm3","(x − 3)"),("rev","(3 − x)")],
  ["neg","xp3"], [],
  [([["xp3"]],"x + 3"),([["neg","xm3"]],"−(x − 3)"),([["rev"]],"3 − x")],
  "Factor 9 − x² as −(x − 3)(x + 3), cancel the (x − 3), and keep the −1 with the survivor.", False),
 ("rf-01-03","ch1",
  [("n2","−2"),("p2","2"),("n3","−3"),("div","/"),("xp3","(x + 3)"),("xm3","(x − 3)")],
  ["n2","div","xp3"], [],
  [([["p2","div","xp3"]],"2/(x + 3)"),([["n2","div","xm3"]],"−2/(x − 3)"),([["n3","div","xp3"]],"−3/(x + 3)")],
  "Factor the top as −2(x − 3) and the bottom as (x − 3)(x + 3), then cancel the (x − 3)s.", False),
 ("rf-02-01","k1",
  [("xp3","(x + 3)"),("xm3","(x − 3)"),("xp1","(x + 1)"),("quad","(x² − 9)"),("div","/")],
  ["xp3"], [],
  [([["xm3"]],"x − 3"),([["xp3","div","xp1"]],"(x + 3)/(x + 1)"),([["quad","div","xm3"]],"(x² − 9)/(x − 3)... unchanged")],
  "Factor x² − 9 = (x − 3)(x + 3) first, then cancel across: (x + 1) with (x + 1), (x − 3) with (x − 3).", False),
 ("rf-02-01","k2",
  [("x","x"),("twox","2x"),("three","3"),("six","6"),("div","/"),("top","2x(x + 3)"),("bot","6(x + 3)")],
  ["x","div","three"], [],
  [([["twox","div","six"]],"2x/6"),([["x","div","six"]],"x/6"),([["top","div","bot"]],"2x(x + 3)/(6(x + 3))")],
  "Cancel the (x + 3) pair across the product, then reduce the numbers: 2x/6 = x/3.", False),
 ("rf-02-01","ch1",
  [("xp2","(x + 2)"),("xm2","(x − 2)"),("xm1","(x − 1)"),("xp1","(x + 1)"),("bigt","(x + 2)(x + 1)"),("bigb","(x − 1)(x − 3)"),("div","/")],
  ["xp2","div","xm1"], [],
  [([["xp2","div","xp1"]],"(x + 2)/(x + 1)"),([["xm2","div","xm1"]],"(x − 2)/(x − 1)"),([["bigt","div","bigb"]],"(x + 2)(x + 1)/((x − 1)(x − 3))")],
  "Factor x² − x − 6 = (x − 3)(x + 2) and x² − 1 = (x − 1)(x + 1), then cancel (x − 3) and (x + 1) across.", False),
 ("rf-02-02","k1",
  [("xp2","(x + 2)"),("xm2","(x − 2)"),("sq","(x + 3)²"),("big","(x² − 4)(x − 2)"),("div","/")],
  ["xp2"], [],
  [([["xm2"]],"x − 2"),([["xp2","div","sq"]],"(x + 2)/(x + 3)²"),([["big","div","sq"]],"(x² − 4)(x − 2)/(x + 3)²")],
  "Flip the divisor to (x + 3)/(x − 2), factor x² − 4 = (x − 2)(x + 2), then cancel both pairs.", False),
 ("rf-02-02","k2",
  [("t1","(x + 3)"),("t2","(x³ + 3x²)"),("t3","(x² + 3x)"),("t4","(x + 3x)"),("four","4"),("fourx","4x"),("div","/")],
  ["t1","div","four"], [],
  [([["t2","div","four"]],"(x³ + 3x²)/4"),([["t3","div","fourx"]],"(x² + 3x)/(4x)... can't simplify"),([["t4","div","four"]],"(x + 3x)/4")],
  "Dividing by x multiplies by 1/x — factor the top as x(x + 3) and cancel the x's.", False),
 ("rf-02-02","ch1",
  [("xm1","(x − 1)"),("xp1","(x + 1)"),("sq","(x + 4)²"),("big","(x² − 1)(x + 1)"),("div","/")],
  ["xm1"], [],
  [([["xp1"]],"x + 1"),([["xm1","div","sq"]],"(x − 1)/(x + 4)²"),([["big","div","sq"]],"(x² − 1)(x + 1)/(x + 4)²")],
  "Flip the divisor to (x + 4)/(x + 1), factor x² − 1 = (x − 1)(x + 1), then cancel the (x + 4) and (x + 1) pairs.", False),
 ("rf-02-03","k1",
  [("two","2"),("sq","(x − 1)²"),("prod","2(x − 1)"),("one","1"),("div","/")],
  ["two"], [],
  [([["sq","div","two"]],"(x − 1)²/2"),([["prod"]],"2(x − 1)"),([["one","div","two"]],"1/2")],
  "Flip only the divisor — · 2/(x − 1) — then every variable factor cancels, leaving 2.", False),
 ("rf-02-03","ch1",
  [("one","1"),("div","/"),("xm3","(x − 3)"),("xp3","(x + 3)"),("sqt","(x + 3)²"),("sqb","(x − 2)²(x − 9)")],
  ["one","div","xm3"], [],
  [([["xm3"]],"x − 3"),([["one","div","xp3"]],"1/(x + 3)"),([["sqt","div","sqb"]],"(x + 3)²/((x − 2)²(x − 9))")],
  "Flip the divisor, factor x² − 9 = (x − 3)(x + 3), and cancel — 1 stays on top, (x − 3) below.", False),
 ("rf-03-01","k1",
  [("t1","(5x + 3)"),("t2","(5x − 3)"),("t3","(9x − 3)"),("div","/"),("b1","(x + 1)"),("b2","(2x + 2)")],
  ["t1","div","b1"], [],
  [([["t2","div","b1"]],"(5x − 3)/(x + 1)"),([["t3","div","b1"]],"(9x − 3)/(x + 1)"),([["t1","div","b2"]],"(5x + 3)/(2x + 2)")],
  "Same denominator: keep (x + 1) once and subtract the WHOLE top: 7x − (2x − 3) = 5x + 3.", False),
 ("rf-03-01","k2",
  [("x","x"),("xsq","x²"),("t","(x² + 3x)"),("div","/"),("b1","(x + 3)"),("b2","(2x + 6)")],
  ["x"], [],
  [([["t","div","b1"]],"(x² + 3x)/(x + 3)"),([["xsq"]],"x²"),([["t","div","b2"]],"(x² + 3x)/(2x + 6)")],
  "Add the tops over the single (x + 3), factor as x(x + 3), and cancel.", False),
 ("rf-03-01","ch1",
  [("t1","(x² − 6)"),("t2","(x² + 2x + 6)"),("t3","(x² + 2x − 6)"),("div","/"),("b1","(x − 3)"),("b2","(3x − 9)")],
  ["t1","div","b1"], [],
  [([["t2","div","b1"]],"(x² + 2x + 6)/(x − 3)"),([["t1","div","b2"]],"(x² − 6)/(3x − 9)"),([["t3","div","b1"]],"(x² + 2x − 6)/(x − 3)")],
  "Combine all three tops over the one (x − 3): x² + x − (x + 6) = x² − 6.", False),
 ("rf-03-02","k1",
  [("a","(x − 3)"),("b","(x + 3)"),("c","(x² − 9)"),("d","(x + 3)²")],
  ["a","b"], [["b","a"]],
  [(perms(["c","b"]),"(x² − 9)(x + 3)"),([["a"]],"(x − 3)"),([["d"]],"(x + 3)²")],
  "Factor x² − 9 = (x − 3)(x + 3) first — the LCD takes each distinct factor once.", False),
 ("rf-03-02","k2",
  [("five","5"),("m","(x − 2)"),("p","(x + 2)")],
  ["five","m"], [["m","five"]],
  [(perms(["five","p"]),"5(x + 2)"),([["five"]],"5"),(perms(["five","m","p"]),"5(x − 2)(x + 2)")],
  "The bottom gained (x − 2), so the top must gain the same (x − 2) — multiply 5 by it.", False),
 ("rf-03-02","k3",
  [("x","x"),("x2","x²"),("x3","x³"),("f","(x + 5)"),("f2","(x + 5)²")],
  ["x2","f"], [["f","x2"]],
  [(perms(["x3","f"]),"x³(x + 5)"),(perms(["x","f"]),"x(x + 5)"),(perms(["x2","f2"]),"x²(x + 5)²... to be safe")],
  "Take each base at its highest power: x² from 1/x², and one (x + 5).", False),
 ("rf-03-02","ch1",
  [("x","x"),("p","(x + 3)"),("m","(x − 3)"),("c1","(x² + 3x)"),("c2","(x² − 9)"),("p2","(x + 3)²")],
  ["x","p","m"], [s for s in perms(["x","p","m"]) if s != ["x","p","m"]],
  [(perms(["c1","c2"]),"(x² + 3x)(x² − 9)"),(perms(["x","m"]),"x(x − 3)"),(perms(["x","p2","m"]),"x(x + 3)²(x − 3)")],
  "Factor both: x(x + 3) and (x − 3)(x + 3) — the LCD is each distinct factor once: x, (x + 3), (x − 3).", False),
 ("rf-03-03","k1",
  [("t1","(2x − 2)"),("t2","(2x + 2)"),("t3","(4x − 2)"),("two","2"),("div","/"),("den","x(x + 1)"),("bad","(x + 1 − x)")],
  ["t1","div","den"], [],
  [([["t2","div","den"]],"(2x + 2)/(x(x + 1))"),([["two","div","bad"]],"2/(x + 1 − x)"),([["t3","div","den"]],"(4x − 2)/(x(x + 1))")],
  "Convert both to the LCD x(x + 1): 4x/(x(x + 1)) − 2(x + 1)/(x(x + 1)), then subtract the tops.", False),
 ("rf-03-03","k2",
  [("t1","(x² + 3x + 6)"),("t2","(x + 6)"),("div","/"),("d1","(x − 3)(x + 3)"),("d2","(x − 3)²(x + 3)"),("d3","(x² − 9 + x − 3)")],
  ["t1","div","d1"], [],
  [([["t2","div","d1"]],"(x + 6)/((x − 3)(x + 3))"),([["t1","div","d2"]],"(x² + 3x + 6)/(x − 3)²(x + 3)"),([["t2","div","d3"]],"(x + 6)/(x² − 9 + x − 3)")],
  "Factor x² − 9 = (x − 3)(x + 3), convert x/(x − 3) by (x + 3), and add the tops over the LCD.", False),
 ("rf-03-03","k3",
  [("t1","2x"),("t2","2"),("t3","(2x + 2)"),("div","/"),("den","(x² − 1)")],
  ["t1","div","den"], [],
  [([["t2","div","den"]],"2/(x² − 1)"),([["t1","div","t1"]],"2x/(2x)... = 1"),([["t3","div","den"]],"(2x + 2)/(x² − 1)")],
  "Convert both to the LCD (x − 1)(x + 1) = x² − 1, then add the tops: (x + 1) + (x − 1) = 2x.", True),
 ("rf-03-03","ch1",
  [("t1","2(x − 1)"),("t2","2(x + 1)"),("t3","(3x − 1)"),("two","2"),("div","/"),("den","x(x + 2)"),("bad","(x + 2 − x)")],
  ["t1","div","den"], [],
  [([["t2","div","den"]],"2(x + 1)/(x(x + 2))"),([["t3","div","den"]],"(3x − 1)/(x(x + 2))"),([["two","div","bad"]],"2/(x + 2 − x)... = 1")],
  "Over the LCD x(x + 2): 3x − (x + 2) = 2x − 2, which factors as 2(x − 1).", False),
 ("rf-05-01","k2",
  [("a","x = 2"),("b","x = 3"),("c","x = 5"),("d","x = −2"),("e","x = −3"),("orr","or")],
  ["a","orr","b"], [["b","orr","a"]],
  [([["a"]],"x = 2 only"),([["c"]],"x = 5"),([["d","orr","e"],["e","orr","d"]],"x = −2 or x = −3")],
  "Multiply through by x: x² + 6 = 5x, so x² − 5x + 6 = (x − 2)(x − 3) = 0 — then check both against x ≠ 0.", False),
]

changed_by_file = {}
for lid, sid, tokens, correct, accept, traps, miss, reusable in PLANS:
    dp = load_pris(lid)
    # start from CURRENT disk (multiple steps per file across plan entries)
    d = json.load(open(path(lid)))
    so = next(s for s in dp["steps"] if s["id"] == sid)
    correct_opt = next(o for o in so["widget"]["options"] if o.get("correct"))
    # self-checks
    ids = [t[0] for t in tokens]
    assert len(ids) == len(set(ids)), f"{lid}/{sid}: dup token ids"
    idset = set(ids)
    seqs = [correct] + accept + [s for ss, _ in traps for s in ss]
    for s in seqs:
        assert set(s) <= idset, f"{lid}/{sid}: unknown token in {s}"
        if not reusable:
            assert len(s) == len(set(s)), f"{lid}/{sid}: repeated token in non-reusable {s}"
    ok = {tuple(correct)} | {tuple(a) for a in accept}
    trapseqs = [tuple(s) for ss, _ in traps for s in ss]
    assert not (set(trapseqs) & ok), f"{lid}/{sid}: trap collides with accepted"
    assert len(trapseqs) == len(set(trapseqs)), f"{lid}/{sid}: duplicate trap sequences"
    w = {
        "type": "buildExpression",
        "prompt": so["widget"]["prompt"],
        "tokens": [{"id": i, "label": l} for i, l in tokens],
        "correct": correct,
        "acceptAlso": accept,
        "commonBuilds": [{"sequence": s, "feedback": fb(so, lab)} for ss, lab in traps for s in ss],
        "reusable": reusable,
        "missFeedback": miss,
        "successFeedback": correct_opt["feedback"],
    }
    sn = next(s for s in d["steps"] if s["id"] == sid)
    sn["widget"] = w
    with open(path(lid), "w") as f:
        json.dump(d, f, indent=2, ensure_ascii=False); f.write("\n")
    changed_by_file.setdefault(lid, set()).add(sid)
    print(f"{lid}/{sid} → buildExpression ({len(w['commonBuilds'])} trap sequences)")

# freeze verification
print("\n--- freeze verification ---")
for lid, changed in changed_by_file.items():
    o = load_pris(lid); n = json.load(open(path(lid)))
    assert {k: v for k, v in o.items() if k != "steps"} == {k: v for k, v in n.items() if k != "steps"}
    diff = set()
    for so, sn in zip(o["steps"], n["steps"]):
        for k in set(so) | set(sn):
            if k == "widget": continue
            assert so.get(k) == sn.get(k), f"{lid}/{so['id']} field {k} changed!"
        if so.get("widget") != sn.get("widget"): diff.add(so["id"])
    assert diff == changed, f"{lid}: {sorted(diff)} != {sorted(changed)}"
    print(f"  {lid}: only {sorted(diff)} changed ✓")
print("DONE")
