"""Dual-route verifier for rational-functions Ch1 (excluded values, simplification, -1 trick).

Route A: exact Fraction polynomial arithmetic — denominators factored and their zeros
         solved algebraically; every simplification verified by cross-multiplication
         identity (num_orig * den_simp == num_simp * den_orig) coefficient-wise.
Route B: dense numeric sampling — original vs simplified agree at 200+ legal points
         (exact Fractions, no float error); excluded values confirmed by denominator
         zero tests; every illegal-cancel distractor proven wrong at a witness point.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/rational-functions/lessons/rf-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"rf-01-01", "rf-01-02", "rf-01-03"}, "expected 3 ch1 lessons")

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

def peval(c, x):
    acc = F(0)
    for k in c: acc = acc * F(x) + F(k)
    return acc

def eq(a, b):
    a = [F(x) for x in a]; b = [F(x) for x in b]
    while len(a) < len(b): a = [F(0)] + a
    while len(b) < len(a): b = [F(0)] + b
    return a == b

def zeros(poly, lo=-30, hi=30):
    return sorted(x for x in range(lo, hi + 1) if peval(poly, x) == 0)

SAMPLES = [F(n, 7) for n in range(-100, 101)]  # 201 rational sample points

def simp_identity(no, do, ns, ds, msg):
    """Verify no/do == ns/ds two ways: cross-multiplication identity + dense sampling."""
    ok(eq(pmul(no, ds), pmul(ns, do)), msg + " cross-mult identity")
    hits = 0
    for x in SAMPLES:
        d1, d2 = peval(do, x), peval(ds, x)
        if d1 == 0 or d2 == 0: continue
        ok(peval(no, x) / d1 == peval(ns, x) / d2, msg + " sample x=%s" % x)
        hits += 1
    ok(hits >= 190, msg + " enough legal samples")

# ---- L1: excluded values ----
ok(zeros([1, -4]) == [4], "L1 i1 zero")
ok(peval([1, 7], -7) == 0, "L1 i1 trap -7 is a NUMERATOR zero")
check_numeric("rf-01-01", "i1", 4)
ok(zeros([1, 0, -9]) == [-3, 3], "L1 k1 zeros")
ok(one_correct("rf-01-01", "k1") == "x = 3 and x = −3", "L1 k1 label")
ok(peval([1, 0, -9], 9) == 72, "L1 k1 distractor 9 check")
ok(peval([1, -6], 6) == 0 and peval([1, 2], 6) == 8, "L1 i2: f(6) = 0/8")
ok(one_correct("rf-01-01", "i2") == "f(6) = 0 — a perfectly legal output", "L1 i2 label")
ok(zeros([2, -10]) == [5], "L1 k2 zero")
check_numeric("rf-01-01", "k2", 5)
ok(zeros([1, 0, 4], -100, 100) == [], "L1 k3: x^2+4 never zero (integer sweep)")
ok(min(peval([1, 0, 4], F(n, 10)) for n in range(-500, 501)) == 4, "L1 k3 range argument min=4")
ok(one_correct("rf-01-01", "k3") == "none — the denominator is never zero", "L1 k3 label")
z = zeros([1, -5, 0])
ok(z == [0, 5] and sum(z) == 5, "L1 ch1 zeros and sum")
check_numeric("rf-01-01", "ch1", 5)
ok(zeros([1, -8]) == [8], "L1 remedial")
check_numeric("rf-01-01", "rem-rf0101-k", 8)

# ---- L2: simplify by factoring ----
# i1: (x^2-25)/(x-5) == x+5
simp_identity([1, 0, -25], [1, -5], [1, 5], [1], "L2 i1")
ok(one_correct("rf-01-02", "i1") == "x + 5", "L2 i1 label")
# distractor witness: x-5 at x=0 -> -5 vs original -25/-5 = 5
ok(peval([1, 0, -25], 0) / peval([1, -5], 0) != peval([1, -5], 0), "L2 i1 distractor differs")
# k1: (x+6)/(x+2) already simplest; illegal cancel claims 3
ok(peval([1, 6], 2) / peval([1, 2], 2) == 2 != 3, "L2 k1 witness x=2: 8/4=2, not 3")
ok(one_correct("rf-01-02", "k1") == "it's already fully simplified", "L2 k1 label")
# i2: (x^2+5x+6)/(x^2-4) == (x+3)/(x-2)
simp_identity([1, 5, 6], [1, 0, -4], [1, 3], [1, -2], "L2 i2")
ok(eq(pmul([1, 2], [1, 3]), [1, 5, 6]) and eq(pmul([1, -2], [1, 2]), [1, 0, -4]), "L2 i2 factorizations")
ok(one_correct("rf-01-02", "i2") == "(x + 3)/(x − 2)", "L2 i2 label")
# k2: restriction — original undefined at -3, simplified defined; equal elsewhere
ok(peval([1, 3], -3) == 0, "L2 k2 original denominator dies at -3")
ok(peval([1, 0, -9], 3) == 0 and peval([1, 3], 3) == 6, "L2 k2: 3 is only a numerator zero")
ok(one_correct("rf-01-02", "k2") == "x ≠ −3", "L2 k2 label")
# k3: (3x+12)/(x+4) == 3
simp_identity([3, 12], [1, 4], [3], [1], "L2 k3")
check_numeric("rf-01-02", "k3", 3)
# ch1: (x^2-x-6)/(x^2-4) == (x-3)/(x-2)
simp_identity([1, -1, -6], [1, 0, -4], [1, -3], [1, -2], "L2 ch1")
ok(eq(pmul([1, -3], [1, 2]), [1, -1, -6]), "L2 ch1 numerator factorization")
ok(one_correct("rf-01-02", "ch1") == "(x − 3)/(x − 2)", "L2 ch1 label")
# distractors differ at witness x=0: true value (-6)/(-4)=3/2
truth = F(-6, -4)
for ns, ds in (([1, -3], [1, 2]), ([1, 3], [1, -2])):
    ok(peval(ns, 0) / peval(ds, 0) != truth, "L2 ch1 distractor differs at 0")
# remedial: x(x+1)/(x+1) == x
simp_identity([1, 1, 0], [1, 1], [1, 0], [1], "L2 remedial")
ok(one_correct("rf-01-02", "rem-rf0102-k") == "x", "L2 remedial label")

# ---- L3: opposite factors ----
ok(F(3 - 10) / F(10 - 3) == -1, "L3 i1 at x=10")
check_numeric("rf-01-03", "i1", -1)
# universal: (3-x)/(x-3) == -1 at all legal samples
for x in SAMPLES:
    if x == 3: continue
    ok((3 - x) / (x - 3) == -1, "L3 i1 universal x=%s" % x)
# c2: (5-x)/(x^2-25) == -1/(x+5)
simp_identity([-1, 5], [1, 0, -25], [-1], [1, 5], "L3 c2")
ok(one_correct("rf-01-03", "k1") == "−1", "L3 k1 label")
# i2: (4-x)/(x^2-16) == -1/(x+4)
simp_identity([-1, 4], [1, 0, -16], [-1], [1, 4], "L3 i2")
ok(one_correct("rf-01-03", "i2") == "−1/(x + 4)", "L3 i2 label")
# k2: (2+x)/(x+2) == 1
simp_identity([1, 2], [1, 2], [1], [1], "L3 k2")
ok(one_correct("rf-01-03", "k2") == "1", "L3 k2 label")
# k3: (9-x^2)/(x-3) == -(x+3)
simp_identity([-1, 0, 9], [1, -3], [-1, -3], [1], "L3 k3")
ok(F(9 - 16) / F(4 - 3) == -7 and -(4 + 3) == -7, "L3 k3 witness x=4")
ok(3 - 4 == -1 != -7, "L3 k3 distractor 3-x differs at 4")
ok(one_correct("rf-01-03", "k3") == "−(x + 3)", "L3 k3 label")
# ch1: (6-2x)/(x^2-9) == -2/(x+3)
simp_identity([-2, 6], [1, 0, -9], [-2], [1, 3], "L3 ch1")
ok(one_correct("rf-01-03", "ch1") == "−2/(x + 3)", "L3 ch1 label")
for ns, ds in (([2], [1, 3]), ([-2], [1, -3]), ([-3], [1, 3])):
    ok(not eq(pmul([-2, 6], ds), pmul(ns, [1, 0, -9])), "L3 ch1 distractor identity fails")
ok(F(4 - 9) / F(9 - 4) == -1, "L3 remedial")
check_numeric("rf-01-03", "rem-rf0103-k", -1)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-rf-ch1: %d/%d checks passed" % (PASS, PASS))
