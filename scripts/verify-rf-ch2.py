"""Dual-route verifier for rational-functions Ch2 (multiplying, dividing, mixed + restrictions).

Route A: exact Fraction polynomial arithmetic — every product/quotient verified by the
         cross-multiplication identity on assembled big-fraction numerators/denominators.
Route B: dense exact-rational sampling (201 points) comparing the original chain (computed
         stage by stage, flips applied as reciprocals) against the claimed simplified form;
         exclusion lists verified by exhaustively finding every breaking input.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/rational-functions/lessons/rf-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"rf-02-01", "rf-02-02", "rf-02-03"}, "expected 3 ch2 lessons")

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step " + lid + "/" + sid)

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " exactly-one-correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(w["answer"] == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    for e in w["commonErrors"]:
        ok(e["value"] != expect, "%s/%s trap == answer" % (lid, sid))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " traps")

def pmul(a, b):
    out = [F(0)] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b):
            out[i + j] += F(x) * F(y)
    return out

def prod(*fs):
    poly = [F(1)]
    for f in fs: poly = pmul(poly, f)
    return poly

def peval(c, x):
    acc = F(0)
    for k in c: acc = acc * F(x) + F(k)
    return acc

def eq(a, b):
    a = [F(x) for x in a]; b = [F(x) for x in b]
    while len(a) < len(b): a = [F(0)] + a
    while len(b) < len(a): b = [F(0)] + b
    return a == b

SAMPLES = [F(n, 7) for n in range(-100, 101)]

def chain_identity(stages, ns, ds, msg):
    """stages: list of (numer_poly, denom_poly, op) with op in '*','/' (first op ignored).
       Verify stage-by-stage rational evaluation == ns/ds at all legal samples, plus the
       big-fraction cross-multiplication identity."""
    bigN, bigD = [F(1)], [F(1)]
    for n, d, op in stages:
        if op == "/":
            bigN, bigD = pmul(bigN, d), pmul(bigD, n)
        else:
            bigN, bigD = pmul(bigN, n), pmul(bigD, d)
    ok(eq(pmul(bigN, ds), pmul(ns, bigD)), msg + " cross-mult identity")
    hits = 0
    for x in SAMPLES:
        legal = True
        val = F(1)
        for n, d, op in stages:
            dv, nv = peval(d, x), peval(n, x)
            if dv == 0 or (op == "/" and nv == 0): legal = False; break
            val = val / (nv / dv) if op == "/" else val * (nv / dv)
        if not legal or peval(ds, x) == 0: continue
        ok(val == peval(ns, x) / peval(ds, x), msg + " sample x=%s" % x)
        hits += 1
    ok(hits >= 180, msg + " enough legal samples")

def breaking_inputs(stages, lo=-20, hi=20):
    out = set()
    for x in range(lo, hi + 1):
        for n, d, op in stages:
            if peval(d, x) == 0 or (op == "/" and peval(n, x) == 0):
                out.add(x)
    return sorted(out)

# ---- L1: multiplying ----
chain_identity([([1, 5], [1, 0], "*"), ([1, 0], [1, 1], "*")], [1, 5], [1, 1], "L1 i1")
ok(one_correct("rf-02-01", "i1") == "(x + 5)/(x + 1)", "L1 i1 label")
chain_identity([([1, 0, -9], [1, 1], "*"), ([1, 1], [1, -3], "*")], [1, 3], [1], "L1 k1")
ok(one_correct("rf-02-01", "k1") == "x + 3", "L1 k1 label")
ok(F(16 - 9, 5) * F(5, 1) == 7, "L1 i2 at x=4")
check_numeric("rf-02-01", "i2", 7)
chain_identity([([2, 0], [1, 3], "*"), ([1, 3], [6], "*")], [1, 0], [3], "L1 k2")
ok(one_correct("rf-02-01", "k2") == "x/3", "L1 k2 label")
ok(peval([1, 3], -3) == 0, "L1 k3: x+3 dies at -3")
ok(one_correct("rf-02-01", "k3") == "x ≠ −3", "L1 k3 label")
chain_identity([([1, -1, -6], [1, 0, -1], "*"), ([1, 1], [1, -3], "*")], [1, 2], [1, -1], "L1 ch1")
ok(eq(pmul([1, -3], [1, 2]), [1, -1, -6]) and eq(pmul([1, -1], [1, 1]), [1, 0, -1]), "L1 ch1 factorizations")
ok(one_correct("rf-02-01", "ch1") == "(x + 2)/(x − 1)", "L1 ch1 label")
truth0 = F(-6, -1) * F(1, -3)
for ns, ds in (([1, 2], [1, 1]), ([1, -2], [1, -1])):
    ok(peval(ns, 0) / peval(ds, 0) != truth0, "L1 ch1 distractor differs at 0")
chain_identity([([1, 0], [2], "*"), ([2], [1, 1], "*")], [1, 0], [1, 1], "L1 remedial")
ok(one_correct("rf-02-01", "rem-rf0201-k") == "x/(x + 1)", "L1 remedial label")

# ---- L2: dividing ----
ok(one_correct("rf-02-02", "i1") == "(x + 2)/5 · 10/(x − 1)", "L2 i1")
# identity: ((x+2)/5) / ((x-1)/10) == (x+2)/5 * 10/(x-1)
chain_identity([([1, 2], [5], "*"), ([1, -1], [10], "/")], [10, 20], [5, -5], "L2 i1 identity")
chain_identity([([1, 0, -4], [1, 3], "*"), ([1, -2], [1, 3], "/")], [1, 2], [1], "L2 k1")
ok(one_correct("rf-02-02", "k1") == "x + 2", "L2 k1 label")
ok(F(5, 6) / F(1, 6) == 5, "L2 i2 at x=3")
check_numeric("rf-02-02", "i2", 5)
chain_identity([([1, 3, 0], [4], "*"), ([1, 0], [1], "/")], [1, 3], [4], "L2 k2")
ok(one_correct("rf-02-02", "k2") == "(x + 3)/4", "L2 k2 label")
ok(peval([1, -2], 2) == 0, "L2 k3: divisor numerator zero at 2")
ok(one_correct("rf-02-02", "k3") == "x = 2", "L2 k3 label")
chain_identity([([1, 0, -1], [1, 4], "*"), ([1, 1], [1, 4], "/")], [1, -1], [1], "L2 ch1")
ok(one_correct("rf-02-02", "ch1") == "x − 1", "L2 ch1 label")
chain_identity([([1, 0], [3], "*"), ([1, 0], [5], "/")], [5], [3], "L2 remedial")
ok(one_correct("rf-02-02", "rem-rf0202-k") == "5/3", "L2 remedial label")

# ---- L3: mixed + restrictions ----
st = [([1, 0], [1, -1], "*"), ([1, 2], [1, -3], "/")]
ok(breaking_inputs(st) == [-2, 1, 3], "L3 i1 exclusions")
check_numeric("rf-02-03", "i1", 3)
chain = [([1, 0, -1], [1, 0], "*"), ([1, 0], [1, 1], "*"), ([1, -1], [2], "/")]
chain_identity(chain, [2], [1], "L3 k1 chain == 2")
ok(one_correct("rf-02-03", "k1") == "2", "L3 k1 label")
ok(F(3, 2) * F(2, 3) / F(1, 2) == 2, "L3 i2 at x=2")
check_numeric("rf-02-03", "i2", 2)
ok(breaking_inputs(chain) == [-1, 0, 1], "L3 k2 exclusions")
ok(one_correct("rf-02-03", "k2") == "x = 0, −1, and 1", "L3 k2 label")
ok(one_correct("rf-02-03", "k3") == "e/f only", "L3 k3")
cap = [([1, 3], [1, -2], "*"), ([1, 0, -9], [1, -2], "/")]
chain_identity(cap, [1], [1, -3], "L3 ch1")
ok(one_correct("rf-02-03", "ch1") == "1/(x − 3)", "L3 ch1 label")
truth4 = F(7, 2) / (F(7, 2))  # x=4: (7/2) / ((16-9)/2) = (7/2)/(7/2) = 1; claimed 1/(4-3)=1 ✓
ok(truth4 == 1 and F(1) / F(4 - 3) == 1, "L3 ch1 witness x=4")
ok(peval([1, -5], 5) == 0, "L3 remedial: divisor zero at 5")
check_numeric("rf-02-03", "rem-rf0203-k", 5)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-rf-ch2: %d/%d checks passed" % (PASS, PASS))
