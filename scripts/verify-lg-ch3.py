"""Dual-route verifier for logarithms Ch3 (change of base, exponential equations, log equations).

Route A: change-of-base identities verified exactly on power cases and by float agreement
         with direct math.log(x, b); every equation solution substituted into the ORIGINAL.
Route B: candidate sets independently recovered by sweeps of the converted (exponential/
         polynomial) equations; extraneous candidates proven to violate the DOMAIN
         (some inside <= 0); bracketing claims verified with integer powers.
"""
import json, glob, sys, math
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/logarithms/lessons/lg-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"lg-03-01", "lg-03-02", "lg-03-03"}, "expected 3 ch3 lessons")

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

def close(a, b, tol=1e-12):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))

# ---- L1: change of base ----
# identity across many (b, x) pairs
for b in (2, 3, 5, 7, 16):
    for x in (2, 3, 8, 10, 30, 50, 625):
        ok(close(math.log(x, b), math.log10(x) / math.log10(b)), "cob identity b=%s x=%s" % (b, x))
ok(close(math.log10(8) / math.log10(2), 3), "L1 i1")
check_numeric("lg-03-01", "i1", 3)
ok(one_correct("lg-03-01", "k1") == "(log 30)/(log 7)", "L1 k1")
# distractor witnesses
ok(not close(math.log10(7) / math.log10(30), math.log(30, 7)), "L1 k1 inverted differs")
ok(not close(math.log10(30 / 7), math.log(30, 7)), "L1 k1 log-of-quotient differs")
ok(3 ** 3 < 50 < 3 ** 4, "L1 i2 bracketing")
ok(one_correct("lg-03-01", "i2") == "3 and 4", "L1 i2 label")
ok(5 ** 4 == 625 and close(math.log10(625) / math.log10(5), 4), "L1 k2")
check_numeric("lg-03-01", "k2", 4)
# k3: log_4 32 = 5/2 via base 2; exact route: 4^(5/2) = 32 <=> 4^5 == 32^2
ok(F(4) ** 5 == F(32) ** 2, "L1 k3 exact")
ok(close(math.log(32, 4), 2.5) and math.log2(32) / math.log2(4) == 2.5, "L1 k3 float")
ok(one_correct("lg-03-01", "k3") == "5/2", "L1 k3 label")
# ch1: log2 10 ~ 3.32
ok(round(1 / math.log10(2), 2) == 3.32 and round(math.log(10, 2), 2) == 3.32, "L1 ch1")
ok(2 ** 3 < 10 < 2 ** 4, "L1 ch1 bracketing")
check_numeric("lg-03-01", "ch1", 3.32)
ok(close(math.log10(9) / math.log10(3), 2), "L1 remedial")
check_numeric("lg-03-01", "rem-lg0301-k", 2)

# ---- L2: exponential equations ----
ok(one_correct("lg-03-02", "i1") == "x · log 3 = log 7", "L2 i1")
ok(close(3 ** (math.log10(7) / math.log10(3)), 7), "L2 i1 solution solves original")
ok(one_correct("lg-03-02", "k1") == "x = (log 20)/(log 7)", "L2 k1")
x = math.log10(20) / math.log10(7)
ok(close(7 ** x, 20) and 1 < x < 2, "L2 k1 value + bracket")
# distractor disproofs
ok(not close(7 ** (math.log10(7) / math.log10(20)), 20), "L2 k1 inverted fails")
ok(not close(7 ** math.log10(20 / 7), 20), "L2 k1 log-quotient fails")
ok(not close(7 ** (20 / 7), 20), "L2 k1 raw division fails")
ok(one_correct("lg-03-02", "i2") == "1 and 2", "L2 i2")
# k2: 4*3^x = 36 -> x=2
ok([x for x in range(0, 10) if 4 * 3 ** x == 36] == [2], "L2 k2 sweep")
check_numeric("lg-03-02", "k2", 2)
# k3: 2^(x+1) = 10 -> x = log2(10) - 1 ~ 2.32
xs = math.log(10, 2) - 1
ok(close(2 ** (xs + 1), 10) and round(xs, 2) == 2.32, "L2 k3")
ok(one_correct("lg-03-02", "k3") == "x ≈ 2.32", "L2 k3 label")
# ch1: 3*2^x = 60 -> x = log2 20 ~ 4.32
xc = math.log(20, 2)
ok(close(3 * 2 ** xc, 60) and round(xc, 2) == 4.32, "L2 ch1")
ok(2 ** 4 < 20 < 2 ** 5, "L2 ch1 bracketing")
check_numeric("lg-03-02", "ch1", 4.32)
ok(one_correct("lg-03-02", "rem-lg0302-k") == "x · log 5", "L2 remedial")

# ---- L3: log equations ----
def legal_log(b, v):
    return v > 0

# i1: log3(x+2) = 3 -> 25
sol = [x for x in range(-30, 60) if x + 2 > 0 and close(math.log(x + 2, 3), 3)]
ok(sol == [25], "L3 i1 sweep")
ok(3 ** 3 == 27 and 27 - 2 == 25, "L3 i1 route A")
check_numeric("lg-03-03", "i1", 25)
# k1: log2(3x-2) = log2(x+6) -> 4, insides positive
sol = [x for x in range(-30, 60) if 3 * x - 2 > 0 and x + 6 > 0 and close(math.log(3 * x - 2, 2), math.log(x + 6, 2))]
ok(sol == [4], "L3 k1 sweep")
ok(3 * 4 - 2 == 10 == 4 + 6, "L3 k1 insides equal and positive")
check_numeric("lg-03-03", "k1", 4)
# i2: log x + log(x-3) = 1: candidates from x(x-3)=10
cands = [x for x in range(-30, 60) if x * (x - 3) == 10]
ok(cands == [-2, 5], "L3 i2 quadratic candidates")
ok(-2 <= 0, "L3 i2: -2 violates x > 0")
ok(close(math.log10(5) + math.log10(2), 1), "L3 i2: 5 checks in original")
ok(one_correct("lg-03-03", "i2") == "keep 5; reject −2 (it makes the insides negative)", "L3 i2 label")
# k2: log2 x + log2(x-2) = 3: x(x-2) = 8 -> {-2, 4}; only 4 legal
cands = [x for x in range(-30, 60) if x * (x - 2) == 8]
ok(cands == [-2, 4], "L3 k2 candidates")
ok(close(math.log(4, 2) + math.log(2, 2), 3), "L3 k2: 4 checks")
ok(not legal_log(2, -2), "L3 k2: -2 fails domain")
ok(one_correct("lg-03-03", "k2") == "x = 4", "L3 k2 label")
# k3: witness — at x=-2, x(x-3)=10>0 while each factor negative
ok((-2) * (-2 - 3) == 10 > 0 and -2 < 0 and -2 - 3 < 0, "L3 k3 widened-domain witness")
ok(one_correct("lg-03-03", "k3") == "the product can be positive while each factor is negative", "L3 k3 label")
# ch1: log3(x+6) + log3 x = 3: x(x+6) = 27 -> {-9, 3}; only 3 legal
cands = [x for x in range(-30, 60) if x * (x + 6) == 27]
ok(cands == [-9, 3], "L3 ch1 candidates")
ok(close(math.log(9, 3) + math.log(3, 3), 3), "L3 ch1: 3 checks (2 + 1 = 3)")
ok(not legal_log(3, -9), "L3 ch1: -9 fails domain")
check_numeric("lg-03-03", "ch1", 3)
ok(2 ** 5 == 32, "L3 remedial")
check_numeric("lg-03-03", "rem-lg0303-k", 32)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-lg-ch3: %d/%d checks passed" % (PASS, PASS))
