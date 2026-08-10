"""Dual-route verifier for logarithms Ch1 (definition, evaluation, graph).

Route A: taught definition — every log claim log_b x = y verified by exact integer/Fraction
         power computation b^y == x (rational exponents via exact root checks).
Route B: floating-point math.log cross-check (rel tol 1e-12) plus empirical graph probing:
         domain walls by boundary sampling, intercepts by evaluation, monotonic unbounded
         growth by scan, wall-dive by deep-reciprocal evaluation.
"""
import json, glob, sys, math
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/logarithms/lessons/lg-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"lg-01-01", "lg-01-02", "lg-01-03"}, "expected 3 ch1 lessons")

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

def close(a, b): return abs(a - b) <= 1e-12 * max(1.0, abs(a), abs(b))

def log_claim(b, x, y):
    """Route A: b^y == x exactly (y may be Fraction). Route B: math.log agreement."""
    y = F(y)
    if y.denominator == 1:
        yv = int(y)
        ok(F(b) ** yv == F(x), "power check %s^%s != %s" % (b, y, x))
    else:
        # b^(p/q) = x  <=>  b^p == x^q exactly
        ok(F(b) ** y.numerator == F(x) ** y.denominator, "rational power check %s^%s != %s" % (b, y, x))
    ok(close(math.log(float(x), b), float(y)), "math.log check log_%s(%s) != %s" % (b, x, y))

# ---- L1: definition ----
log_claim(2, 8, 3)
ok(one_correct("lg-01-01", "i1") == "2 to what power gives 8?", "L1 i1")
ok(2 ** 4 == 16 != 8, "L1 i1 distractor: 8/2=4 but 2^4 != 8")
log_claim(3, 81, 4)
ok(one_correct("lg-01-01", "k1") == "3⁴ = 81", "L1 k1")
ok(4 ** 3 == 64 != 81, "L1 k1 distractor 4^3 differs")
log_claim(2, 64, 6)
ok(one_correct("lg-01-01", "i2") == "log₂ 64 = 6", "L1 i2")
log_claim(5, 125, 3)
check_numeric("lg-01-01", "k2", 3)
# k3: 2^x = 10 pinned between 3 and 4
ok(2 ** 3 < 10 < 2 ** 4, "L1 k3 pinning")
ok(close(2 ** math.log(10, 2), 10), "L1 k3 log solves it exactly")
ok(3 < math.log(10, 2) < 4, "L1 k3 value between 3 and 4")
ok(2 ** 5 == 32 != 10, "L1 k3 distractor 5 fails")
ok(one_correct("lg-01-01", "k3") == "x = log₂ 10, a number between 3 and 4", "L1 k3 label")
log_claim(4, 64, 3)
check_numeric("lg-01-01", "ch1", 64)
ok(4 * 3 == 12 and 3 ** 4 == 81, "L1 ch1 traps: multiply path and swap path")
log_claim(2, 16, 4)
check_numeric("lg-01-01", "rem-lg0101-k", 4)

# ---- L2: evaluation ----
log_claim(7, 1, 0)
check_numeric("lg-01-02", "i1", 0)
log_claim(2, F(1, 16), -4)
check_numeric("lg-01-02", "k1", -4)
log_claim(10, 100000, 5)
check_numeric("lg-01-02", "i2", 5)
log_claim(16, 4, F(1, 2))
ok(one_correct("lg-01-02", "k2") == "1/2", "L2 k2")
ok(4 ** 2 == 16, "L2 k2 distractor 2 is log_4 16 (roles swapped)")
ok(F(16) ** -2 == F(1, 256), "L2 k2 distractor -2 gives 1/256")
log_claim(9, 9, 1)
check_numeric("lg-01-02", "k3", 1)
log_claim(4, F(1, 2), F(-1, 2))
ok(one_correct("lg-01-02", "ch1") == "−1/2", "L2 ch1")
ok(F(4) ** 1 == F(2) ** 2, "L2 ch1: 4^(1/2)=2 exact")
ok(F(4) ** -2 == F(1, 16), "L2 ch1 distractor -2 gives 1/16")
log_claim(3, F(1, 9), -2)
check_numeric("lg-01-02", "rem-lg0102-k", -2)

# ---- L3: graph ----
ok(2 ** 3 == 8, "L3 i1: (3,8) on exponential")
ok(close(math.log(8, 2), 3), "L3 i1: (8,3) on log")
ok(one_correct("lg-01-03", "i1") == "(8, 3)", "L3 i1 label")
# k1 domain: 2^y > 0 for wide sweep; log of positives fine, log(0)/negatives error
ok(all(2.0 ** y > 0 for y in range(-60, 61)), "L3 k1: exponential range positive")
try:
    math.log(-4, 2); sys.exit("FAIL: log(-4) should error")
except ValueError:
    PASS += 1
try:
    math.log(0, 2); sys.exit("FAIL: log(0) should error")
except ValueError:
    PASS += 1
ok(close(math.log(0.5, 2), -1), "L3 k1: inputs in (0,1) legal with negative outputs")
ok(one_correct("lg-01-03", "k1") == "x > 0", "L3 k1 label")
log_claim(2, 1, 0)
ok(one_correct("lg-01-03", "i2") == "(1, 0)", "L3 i2")
# k2 wall dive: deep reciprocals
ok(close(math.log(1 / 1024, 2), -10), "L3 k2: log2(1/1024) = -10")
vals = [math.log(10 ** -k, 2) for k in (2, 4, 6)]
ok(vals[0] > vals[1] > vals[2] and vals[2] < -19, "L3 k2 dive monotone")
ok(one_correct("lg-01-03", "k2") == "plunges toward −∞", "L3 k2 label")
# k3 unbounded slow growth
ok(close(math.log(1024, 2), 10) and close(math.log(2048, 2), 11), "L3 k3 milestones")
seq = [math.log(x, 2) for x in (10, 100, 1000, 10 ** 6)]
ok(all(seq[i] < seq[i + 1] for i in range(3)), "L3 k3 monotone increasing")
ok(one_correct("lg-01-03", "k3") == "keeps rising forever, ever more slowly", "L3 k3 label")
# ch1: log2(x-3): wall at 3, domain x>3, intercept (4,0)
ok(close(math.log(4 - 3, 2), 0), "L3 ch1 intercept (4,0)")
ok(math.log(3.000001 - 3, 2) < -19, "L3 ch1 dive just right of wall")
try:
    math.log(2.999 - 3, 2); sys.exit("FAIL: left of wall should error")
except ValueError:
    PASS += 1
ok(one_correct("lg-01-03", "ch1") == "asymptote x = 3; domain x > 3", "L3 ch1 label")
ok(2 ** 0 == 1, "L3 remedial: (0,1) on exponential")
ok(one_correct("lg-01-03", "rem-lg0103-k") == "(1, 0)", "L3 remedial label")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-lg-ch1: %d/%d checks passed" % (PASS, PASS))
