"""Dual-route verifier for complex-numbers Ch1 (completing the square).

Route A: the (b/2)^2 recipe / algebraic manipulation.
Route B: polynomial-expansion identity checks and brute-force root search with Fractions.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/complex-numbers/lessons/cn-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"cn-01-01", "cn-01-02", "cn-01-03"}, "expected 3 ch1 lessons")

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step " + lid + "/" + sid)

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(F(str(w["answer"])) == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    for e in w["commonErrors"]:
        ok(F(str(e["value"])) != expect, "%s/%s trap equals answer" % (lid, sid))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " needs >=2 traps")

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " exactly-one-correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

def complete_const(b):
    # Route A: recipe
    a = (F(b) / 2) ** 2
    # Route B: unique c making x^2+bx+c a perfect square (discriminant b^2-4c == 0)
    c = F(b) ** 2 / 4
    ok(a == c, "recipe vs discriminant disagree for b=%s" % b)
    # Route B2: expansion identity (x + b/2)^2 == x^2 + bx + a for many x
    p = F(b) / 2
    ok(all((F(x) + p) ** 2 == F(x) ** 2 + b * F(x) + a for x in range(-8, 9)), "expansion identity b=%s" % b)
    return a

def roots(b, c):
    # Route B: brute-force integer roots of x^2+bx+c=0
    return sorted(x for x in range(-50, 51) if F(x) ** 2 + b * F(x) + c == 0)

# ---- L1: completing constants ----
for sid, b, expect in [("i1", 6, 9), ("i2", -12, 36), ("k2", 14, 49), ("ch1", 18, 81), ("rem-cn0101-k", 4, 4)]:
    ok(complete_const(b) == expect, "L1 %s constant" % sid)
    check_numeric("cn-01-01", sid, F(expect))
ok(one_correct("cn-01-01", "k1") == "x² + 8x + 16" and complete_const(8) == 16, "L1 k1")
lab = one_correct("cn-01-01", "k3")
ok(lab == "(x − 5)²", "L1 k3 label")
ok(all((F(x) - 5) ** 2 == F(x) ** 2 - 10 * F(x) + 25 for x in range(-8, 9)), "L1 k3 identity")
# distractor sanity: (x+5)^2 and (x-5)(x+5) are NOT equal to the trinomial
ok(any((F(x) + 5) ** 2 != F(x) ** 2 - 10 * F(x) + 25 for x in range(-3, 4)), "L1 k3 distractor1 must differ")
ok(any((F(x) - 5) * (F(x) + 5) != F(x) ** 2 - 10 * F(x) + 25 for x in range(-3, 4)), "L1 k3 distractor2 must differ")

# ---- L2: solving ----
# i1: x^2+6x=-5 -> (x+3)^2 = -5 + 9 = 4; route B: expand (x+3)^2 - 4 == x^2+6x+5
ok(F(-5) + 9 == 4, "L2 i1 route A")
ok(all((F(x) + 3) ** 2 - 4 == F(x) ** 2 + 6 * F(x) + 5 for x in range(-8, 9)), "L2 i1 route B")
check_numeric("cn-01-02", "i1", F(4))
# k1: larger root of x^2+6x+5: A: -3+2; B: brute
ok(roots(6, 5) == [-5, -1] and F(-3) + 2 == -1, "L2 k1 routes")
check_numeric("cn-01-02", "k1", F(-1))
# i2: k = 12 + 4 = 16; B: identity (x-2)^2-16 == x^2-4x-12
ok(F(12) + 4 == 16 and all((F(x) - 2) ** 2 - 16 == F(x) ** 2 - 4 * F(x) - 12 for x in range(-8, 9)), "L2 i2 routes")
check_numeric("cn-01-02", "i2", F(16))
# k2: larger root of x^2-4x-12: A: 2+4; B: brute
ok(roots(-4, -12) == [-2, 6] and F(2) + 4 == 6, "L2 k2 routes")
check_numeric("cn-01-02", "k2", F(6))
one_correct("cn-01-02", "k3")
# ch1: x^2+8x+7: A: -4+3; B: brute
ok(roots(8, 7) == [-7, -1] and F(-4) + 3 == -1, "L2 ch1 routes")
check_numeric("cn-01-02", "ch1", F(-1))
ok(len(next(s for s in L["cn-01-02"]["steps"] if s["id"] == "ch1")["hints"]) == 3, "L2 ch1 hints")
# remedial: (x+1)^2=4 larger root: A: -1+2=1; B: brute on x^2+2x-3
ok(roots(2, -3) == [-3, 1], "L2 remedial routes")
check_numeric("cn-01-02", "rem-cn0102-k", F(1))

# ---- L3: vertex form ----
def vertex_k(b, c):
    # Route A: c - (b/2)^2
    kA = F(c) - (F(b) / 2) ** 2
    h = -F(b) / 2
    # Route B: evaluate y at x = h (vertex height) — must equal kA
    kB = h ** 2 + b * h + c
    ok(kA == kB, "vertex k routes disagree b=%s c=%s" % (b, c))
    # Route B2: identity (x-h)^2 + k == x^2+bx+c everywhere
    ok(all((F(x) - h) ** 2 + kA == F(x) ** 2 + b * F(x) + c for x in range(-8, 9)), "vertex identity b=%s" % b)
    return kA

for sid, b, c, expect in [("i1", -6, 5, -4), ("i2", 10, 30, 5), ("k2", -8, 3, -13), ("ch1", 12, 40, 4), ("rem-cn0103-k", 2, 5, 4)]:
    ok(vertex_k(b, c) == expect, "L3 %s k" % sid)
    check_numeric("cn-01-03", sid, F(expect))
# ch1 asks for a MINIMUM — confirm upward parabola: brute min over dense grid equals k
b, c = 12, 40
vals = [(F(x, 4)) ** 2 + b * F(x, 4) + c for x in range(-80, 40)]
ok(min(vals) == F(4), "L3 ch1 brute minimum != 4")
ok(one_correct("cn-01-03", "k1") == "y = (x + 2)² − 3" and vertex_k(4, 1) == -3, "L3 k1")
lab = one_correct("cn-01-03", "k3")
ok(lab == "(1, 6)" and vertex_k(-2, 7) == 6, "L3 k3")
# (0,7) distractor really is the y-intercept
ok(F(0) ** 2 - 2 * F(0) + 7 == 7, "L3 k3 intercept sanity")

# challenge hint counts + global mcq sweep
for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " challenge hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-cn-ch1: %d/%d checks passed" % (PASS, PASS))
