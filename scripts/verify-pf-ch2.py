"""Dual-route verifier for polynomial-functions Ch2 (zeros, multiplicity, factor/remainder theorems).

Route A: taught rules (factor -> sign-flipped zero; parity of multiplicity -> bounce/cross;
         remainder = f(c) by substitution).
Route B: Fraction-exact polynomial expansion + evaluation; bounce/cross confirmed by the
         SIGN of the expanded polynomial just left/right of each zero; remainders confirmed
         by actual polynomial long division (divmod on coefficient lists).
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/polynomial-functions/lessons/pf-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"pf-02-01", "pf-02-02", "pf-02-03"}, "expected 3 ch2 lessons")

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

# polynomial toolkit on coefficient lists (highest degree first), Fractions
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

def from_factors(factors, const=1):
    # factors: list of (root, mult)
    poly = [F(const)]
    for r, m in factors:
        for _ in range(m):
            poly = pmul(poly, [F(1), F(-r)])
    return poly

def zeros_route_b(poly, candidates):
    return sorted(r for r in candidates if peval(poly, r) == 0)

def pdivmod(f, d):
    # long division, both highest-first
    f = [F(x) for x in f]; d = [F(x) for x in d]
    q = [F(0)] * (len(f) - len(d) + 1)
    r = f[:]
    for i in range(len(q)):
        q[i] = r[i] / d[0]
        for j, dj in enumerate(d):
            r[i + j] -= q[i] * dj
    rem = r[len(q):]
    while len(rem) > 1 and rem[0] == 0: rem = rem[1:]
    return q, rem

# ---- L1 ----
cand = list(range(-10, 11))
p = from_factors([(4, 1), (-1, 1), (2, 1)])
ok(zeros_route_b(p, cand) == [-1, 2, 4], "L1 i1 zeros")
ok(one_correct("pf-02-01", "i1") == "4, −1, and 2", "L1 i1")
p = from_factors([(0, 1), (6, 1), (-2, 1)])
ok(zeros_route_b(p, cand) == [-2, 0, 6], "L1 k1 zeros")
ok(one_correct("pf-02-01", "k1") == "0, 6, and −2", "L1 k1")
p = from_factors([(2, 1), (-3, 1), (5, 1)])
ok(peval(p, 2) == 0, "L1 i2 substitution")
ok(peval(p, 0) == 30, "L1 i2 trap-30 really is f(0)")
check_numeric("pf-02-01", "i2", 0)
p = from_factors([(1, 1), (-4, 1), (7, 1)])
ok(len(zeros_route_b(p, cand)) == 3, "L1 k2 count")
check_numeric("pf-02-01", "k2", 3)
ok(peval([1, 5], -5) == 0, "L1 k3 factor test")
ok(one_correct("pf-02-01", "k3") == "(x + 5)", "L1 k3")
p = pmul([2], from_factors([(0, 1), (3, 1), (-1, 1)]))
ok(zeros_route_b(p, cand) == [-1, 0, 3], "L1 ch1 zeros")
ok(one_correct("pf-02-01", "ch1") == "0, 3, and −1", "L1 ch1")
p = from_factors([(7, 1), (-3, 1)])
ok(zeros_route_b(p, cand) == [-3, 7], "L1 remedial zeros")
ok(one_correct("pf-02-01", "rem-pf0201-k") == "7 and −3", "L1 remedial")

# ---- L2 ----
def behavior(poly, zero):
    eps = F(1, 100)
    lft, rgt = peval(poly, F(zero) - eps), peval(poly, F(zero) + eps)
    ok(lft != 0 and rgt != 0, "eps hit another zero at %s" % zero)
    return "cross" if (lft < 0) != (rgt < 0) else "bounce"

p = from_factors([(3, 2), (-1, 1)])
ok(behavior(p, 3) == "bounce", "L2 i1 behavior")
check_numeric("pf-02-02", "i1", 2)
p = from_factors([(-1, 3), (2, 2)])
ok(behavior(p, -1) == "cross" and behavior(p, 2) == "bounce", "L2 k1/i2 behavior")
ok(one_correct("pf-02-02", "k1") == "crosses the axis (flattened)", "L2 k1")
ok(one_correct("pf-02-02", "i2") == "the graph bounces off the axis", "L2 i2")
ok(len(p) - 1 == 5, "L2 k2 degree route B (expanded length)")
check_numeric("pf-02-02", "k2", 5)
p = from_factors([(5, 2), (-5, 2)])
ok(zeros_route_b(p, cand) == [-5, 5] and len(p) - 1 == 4, "L2 k3 distinct zeros")
ok(behavior(p, 5) == "bounce" and behavior(p, -5) == "bounce", "L2 k3 both bounce")
check_numeric("pf-02-02", "k3", 2)
p = from_factors([(0, 2), (4, 1)])
ok(behavior(p, 0) == "bounce" and behavior(p, 4) == "cross", "L2 ch1 behavior")
ok(one_correct("pf-02-02", "ch1") == "bounces at 0, crosses at 4", "L2 ch1")
p = from_factors([(6, 2)])
ok(behavior(p, 6) == "bounce", "L2 remedial behavior")
ok(one_correct("pf-02-02", "rem-pf0202-k") == "bounces off the axis", "L2 remedial")

# ---- L3 ----
# i1: f(1) for x^3-7x+6, both routes: substitution and long-division remainder
f = [1, 0, -7, 6]
ok(peval(f, 1) == 0, "L3 i1 substitution")
qq, rr = pdivmod(f, [1, -1])
ok(rr == [0], "L3 i1 division remainder")
check_numeric("pf-02-03", "i1", 0)
# k1: remainder of x^3+2x-5 by (x-2)
f = [1, 0, 2, -5]
ok(peval(f, 2) == 7, "L3 k1 substitution")
qq, rr = pdivmod(f, [1, -2])
ok(rr == [7], "L3 k1 division")
ok(peval(f, 0) == -5, "L3 k1 trap really is f(0)")
check_numeric("pf-02-03", "k1", 7)
# i2/k2: x^3+8 at -2
f = [1, 0, 0, 8]
ok(peval(f, -2) == 0, "L3 i2 substitution")
qq, rr = pdivmod(f, [1, 2])
ok(rr == [0], "L3 i2 division")
check_numeric("pf-02-03", "i2", 0)
ok(peval(f, 2) == 16, "L3 k2 distractor value")
ok(one_correct("pf-02-03", "k2") == "(x + 2)", "L3 k2")
one_correct("pf-02-03", "k3")
# ch1: k=4 makes (x-2) a factor of x^3-3x^2+k; both routes + uniqueness over a range
solves = [k for k in range(-30, 31) if peval([1, -3, 0, k], 2) == 0]
ok(solves == [4], "L3 ch1 unique k")
qq, rr = pdivmod([1, -3, 0, 4], [1, -2])
ok(rr == [0], "L3 ch1 division")
check_numeric("pf-02-03", "ch1", 4)
f = [1, 0, -9]
ok(peval(f, 3) == 0, "L3 remedial")
qq, rr = pdivmod(f, [1, -3])
ok(rr == [0], "L3 remedial division")
check_numeric("pf-02-03", "rem-pf0203-k", 0)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-pf-ch2: %d/%d checks passed" % (PASS, PASS))
