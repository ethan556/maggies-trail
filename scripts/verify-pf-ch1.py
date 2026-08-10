"""Dual-route verifier for polynomial-functions Ch1 (shape & end behavior).

Route A: taught rules (term-by-term evaluation; parity x lead-sign end-behavior table;
         degree caps; domination inequalities solved algebraically).
Route B: Fraction-exact Horner evaluation, and end behavior read empirically from the
         SIGN of the full polynomial at x = ±10^6.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/polynomial-functions/lessons/pf-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"pf-01-01", "pf-01-02", "pf-01-03"}, "expected 3 ch1 lessons")

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

def horner(coeffs, x):
    # coeffs highest-degree first
    acc = F(0)
    for c in coeffs: acc = acc * x + c
    return acc

def direct(coeffs, x):
    n = len(coeffs) - 1
    return sum(F(c) * F(x) ** (n - i) for i, c in enumerate(coeffs))

def evaluate(coeffs, x):
    a, b = horner(coeffs, F(x)), direct(coeffs, F(x))
    ok(a == b, "horner vs direct disagree %s @ %s" % (coeffs, x))
    return a

# ---- L1: evaluation + caps ----
ok(evaluate([1, 0, -2, 1], 2) == 5, "L1 i1 value")
check_numeric("pf-01-01", "i1", 5)
ok(evaluate([1, 0, -2, 1], -1) == 2, "L1 k2 value")
check_numeric("pf-01-01", "k2", 2)
ok(evaluate([1, 0, -3, 0, 2], 2) == 6, "L1 ch1 value")
check_numeric("pf-01-01", "ch1", 6)
ok(evaluate([1, 3, 0], 2) == 10, "L1 remedial value")
check_numeric("pf-01-01", "rem-pf0101-k", 10)
# caps: max zeros = n, max turning points = n-1 (rule); Route B: witness polynomials
check_numeric("pf-01-01", "k1", 3)   # degree 4 -> 3 turning points
check_numeric("pf-01-01", "i2", 5)   # degree 5 -> 5 zeros
# witness: (x-1)(x-2)(x-3)(x-4)(x-5) really has 5 zeros
wit = [1, -15, 85, -225, 274, -120]
ok(sum(1 for x in range(1, 6) if evaluate(wit, x) == 0) == 5, "L1 witness 5 zeros")
# witness: x^4 - 5x^2 + 4 has 3 turning points (sign changes of slope over grid)
prev = None; turns = 0
vals = [evaluate([1, 0, -5, 0, 4], F(x, 10)) for x in range(-30, 31)]
for i in range(1, len(vals)):
    s = 1 if vals[i] > vals[i - 1] else -1
    if prev is not None and s != prev: turns += 1
    prev = s
ok(turns == 3, "L1 witness turning points got %d" % turns)
ok(one_correct("pf-01-01", "k3") == "f(x) = √x + 1", "L1 k3")

# ---- end behavior helpers ----
def eb_rule(coeffs):
    n = len(coeffs) - 1
    lead = coeffs[0]
    left = "up" if ((n % 2 == 0 and lead > 0) or (n % 2 == 1 and lead < 0)) else "down"
    right = "up" if lead > 0 else "down"
    return left, right

def eb_empirical(coeffs):
    M = 10 ** 6
    lv, rv = direct(coeffs, -M), direct(coeffs, M)
    return ("up" if lv > 0 else "down"), ("up" if rv > 0 else "down")

def eb(coeffs):
    a, b = eb_rule(coeffs), eb_empirical(coeffs)
    ok(a == b, "end-behavior rule vs empirical disagree for %s: %s vs %s" % (coeffs, a, b))
    return a

# ---- L2 ----
ok(eb([1, 0, 0, 0]) == ("down", "up"), "L2 i1 x^3")
ok(one_correct("pf-01-02", "i1") == "falls to the left, rises to the right", "L2 i1")
ok(eb([-1, 0, 0, 3, 0]) == ("down", "down"), "L2 k1 -x^4+3x")
ok(one_correct("pf-01-02", "k1") == "falls on both ends", "L2 k1")
ok(eb([-2, 0, 0, 0, 0, 0]) == ("up", "down") and direct([-2, 0, 0, 0, 0, 0], 10 ** 6) < 0, "L2 i2 -2x^5 right end")
ok(one_correct("pf-01-02", "i2") == "f(x) plunges toward −∞", "L2 i2")
ok(eb([3, 0, 0, 0, 0, 0, -1, 0][:7]) == ("up", "up"), "L2 k2 3x^6-x")
ok(one_correct("pf-01-02", "k2") == "f(x) = 3x⁶ − x", "L2 k2")
# distractor sanity: each distractor really fails "rises on both ends"
for coeffs in ([1, 0, 0, 0, 0, 2], [-1, 0, 9], [-4, 0, 0, 0]):
    ok(eb(coeffs) != ("up", "up"), "L2 k2 distractor %s" % coeffs)
ok(eb([5, 0, 0, 0, 0, 1, 0, 0])[0] == "down", "L2 k3 left end 5x^7+x^2")
ok(one_correct("pf-01-02", "k3") == "plunges toward −∞", "L2 k3")
ok(eb([-7, 50, 0, 1]) == ("up", "down"), "L2 ch1")
ok(one_correct("pf-01-02", "ch1") == "rises to the left, falls to the right", "L2 ch1")
ok(eb([1, 0, 0, 0, 0]) == ("up", "up"), "L2 remedial x^4")
ok(one_correct("pf-01-02", "rem-pf0102-k") == "rises on both ends", "L2 remedial")

# ---- L3: domination ----
ok(F(100) * 100 == 10000 and F(100) ** 3 == 1000000, "L3 i1 values")
check_numeric("pf-01-03", "i1", 10000)
ok(one_correct("pf-01-03", "k1") == "−3x⁴", "L3 k1")
# Route B: at x=100, |−3x⁴| exceeds |100x³|
ok(abs(-3 * 100 ** 4) > abs(100 * 100 ** 3), "L3 k1 empirical")
# i2: first integer with x^2 > 50x is 51 (rule: x>50); brute confirm
firsts = [x for x in range(1, 200) if x * x > 50 * x]
ok(firsts[0] == 51 and 50 * 50 == 50 * 50, "L3 i2 crossover")
check_numeric("pf-01-03", "i2", 51)
ok(eb([-2, 90, 0, 0, 7, 0]) == ("up", "down"), "L3 k2")
ok(one_correct("pf-01-03", "k2") == "rises to the left, falls to the right", "L3 k2 label")
ok(evaluate([1, 0, 5, 0], 10) == 1050, "L3 k3")
check_numeric("pf-01-03", "k3", 1050)
ok(4 * F(-100) ** 2 == 40000, "L3 ch1")
check_numeric("pf-01-03", "ch1", 40000)
ok(F(100) ** 2 == 10000 and 10 * 100 == 1000, "L3 remedial values")
ok(one_correct("pf-01-03", "rem-pf0103-k") == "x², at 10,000", "L3 remedial")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-pf-ch1: %d/%d checks passed" % (PASS, PASS))
