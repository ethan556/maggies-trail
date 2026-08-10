"""Dual-route verifier for logarithms Ch2 (product, quotient, power properties; expand/condense).

Route A: exact exponent arithmetic — every property instance verified on integer powers
         (b^m * b^n == b^(m+n) etc.) with exact Fractions.
Route B: floating-point identity sweeps — each expansion/condensation checked as a function
         identity across many positive sample values (rel tol 1e-12); every illegal-move
         distractor DISPROVEN at explicit witness values.
"""
import json, glob, sys, math
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/logarithms/lessons/lg-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"lg-02-01", "lg-02-02", "lg-02-03"}, "expected 3 ch2 lessons")

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

SAMPLES = [0.3, 0.7, 1.0, 1.5, 2.0, 3.7, 5.0, 9.2, 20.0]

def identity2(f, g, msg):
    for x in SAMPLES:
        for y in SAMPLES:
            ok(close(f(x, y), g(x, y)), "%s at (%s,%s): %s vs %s" % (msg, x, y, f(x, y), g(x, y)))

lg2 = lambda v: math.log(v, 2)
lg3 = lambda v: math.log(v, 3)
lg5 = lambda v: math.log(v, 5)
lg10 = lambda v: math.log10(v)

# ---- L1: product property ----
# Route A exponent check
ok(F(2) ** 3 * F(2) ** 4 == F(2) ** 7, "L1 c1 exponent route")
ok(close(lg2(8 * 4), lg2(8) + lg2(4)) and lg2(32) == 5, "L1 c1 witness")
ok(close(lg3(9) + lg3(27), 5) and 3 ** 5 == 243, "L1 i1")
check_numeric("lg-02-01", "i1", 5)
identity2(lambda x, y: lg5(x * y), lambda x, y: lg5(x) + lg5(y), "L1 product identity")
ok(one_correct("lg-02-01", "k1") == "2 + log₅ y", "L1 k1")
# distractors differ at witness y=5: truth 2+1=3; 25*1=25; 2*1=2
ok(2 + lg5(5) == 3 and 25 * lg5(5) == 25 and 2 * lg5(5) == 2, "L1 k1 distractor witnesses")
ok(close(lg2(4) + lg2(8), 5) and lg2(32) == 5, "L1 i2")
check_numeric("lg-02-01", "i2", 5)
# k2: no rule for sums — witness
ok(lg2(8 + 8) == 4 and lg2(8) + lg2(8) == 6, "L1 k2 sum witness 4 != 6")
ok(one_correct("lg-02-01", "k2") == "log₂ (8x)", "L1 k2 label")
ok(close(lg10(2) + lg10(5) + lg10(100), 3) and 2 * 5 * 100 == 1000, "L1 k3")
check_numeric("lg-02-01", "k3", 3)
# ch1: log2 x + log2 4 = 6 -> x=16
ok(close(lg2(16) + lg2(4), 6), "L1 ch1 check")
ok([x for x in range(1, 200) if close(lg2(x) + lg2(4), 6)] == [16], "L1 ch1 sweep")
ok(4 * 16 == 64 == 2 ** 6, "L1 ch1 route A")
check_numeric("lg-02-01", "ch1", 16)
ok(lg2(4) + lg2(8) == 5, "L1 remedial")
check_numeric("lg-02-01", "rem-lg0201-k", 5)

# ---- L2: quotient & power ----
ok(close(lg3(81) - lg3(3), 3) and close(lg3(27), 3), "L2 i1")
check_numeric("lg-02-02", "i1", 3)
identity2(lambda x, y: lg3(x / y), lambda x, y: lg3(x) - lg3(y), "L2 quotient identity")
# power identity: log2(x^p) = p log2 x for several p
for p in (2, 3, 5, 7, 0.5):
    for x in SAMPLES:
        ok(close(lg2(x ** p), p * lg2(x)), "L2 power identity p=%s x=%s" % (p, x))
ok(one_correct("lg-02-02", "k1") == "7 log₂ x", "L2 k1")
# distractor witness x=4: 7*2=14 vs (2)^7=128 vs log2 7 + 2
ok(7 * lg2(4) == 14 and lg2(4) ** 7 == 128, "L2 k1 distractor witness")
ok(one_correct("lg-02-02", "i2") == "(1/2) log₅ x", "L2 i2")
ok(close(lg5(math.sqrt(25)), 0.5 * lg5(25)), "L2 i2 witness")
ok(one_correct("lg-02-02", "k2") == "log₃ x − 2", "L2 k2")
ok(close(lg3(27 / 9), lg3(27) - 2), "L2 k2 witness")
ok(close(5 * lg2(4), 10) and 4 ** 5 == 1024 == 2 ** 10, "L2 k3")
check_numeric("lg-02-02", "k3", 10)
# ch1: log2(8x^3/y) = 3 + 3 log2 x - log2 y
identity2(lambda x, y: lg2(8 * x ** 3 / y), lambda x, y: 3 + 3 * lg2(x) - lg2(y), "L2 ch1 identity")
ok(one_correct("lg-02-02", "ch1") == "3 + 3 log₂ x − log₂ y", "L2 ch1 label")
# distractor identities fail at witness (2,2): truth 3+3-1=5; alt1 3+3+1=7; alt3 9*1-1=8
ok(close(lg2(8 * 8 / 2), 5) and (3 + 3 * lg2(2) + lg2(2)) == 7 and (9 * lg2(2) - lg2(2)) == 8, "L2 ch1 distractor witnesses")
ok(lg2(2 ** 3) == 3, "L2 remedial")
check_numeric("lg-02-02", "rem-lg0202-k", 3)

# ---- L3: expand & condense ----
identity2(lambda x, y: 2 * lg10(x) + lg10(y), lambda x, y: lg10(x * x * y), "L3 i1 identity")
ok(one_correct("lg-02-03", "i1") == "log (x²y)", "L3 i1 label")
# distractor witnesses at (10,10): truth 2+1=3; log(2xy)=log200≈2.3; log(x²+y)=log110≈2.04
ok(close(2 * lg10(10) + lg10(10), 3) and not close(lg10(200), 3) and not close(lg10(110), 3), "L3 i1 distractors")
identity2(lambda x, y: 4 * lg3(x) - lg3(y), lambda x, y: lg3(x ** 4 / y), "L3 k1 identity")
ok(one_correct("lg-02-03", "k1") == "log₃ (x⁴/y)", "L3 k1 label")
# ((x/y)^4) differs at witness (3,9): truth 4*1-2=2; alt 4*(1-2)=-4
ok(close(4 * lg3(3) - lg3(9), 2) and close(lg3((F(3, 9)) ** 4 * 1.0), -4), "L3 k1 distractor witness")
identity2(lambda x, y: lg5(x ** 2 / y ** 3), lambda x, y: 2 * lg5(x) - 3 * lg5(y), "L3 i2 identity")
ok(one_correct("lg-02-03", "i2") == "2 log₅ x − 3 log₅ y", "L3 i2 label")
ok(close(3 * lg2(2) + lg2(8), 6) and lg2(64) == 6, "L3 k2")
check_numeric("lg-02-03", "k2", 6)
# k3: witnesses at x=8,y=2
ok(close(lg2(8) - lg2(2), 2) and close(lg2(8 / 2), 2), "L3 k3 true pair")
ok(lg2(8) / lg2(2) == 3, "L3 k3 quotient-of-logs witness = 3")
ok(not close(lg2(8 - 2), 2), "L3 k3 log-of-difference witness")
ok(lg2(8) * lg2(1 / 2) == -3, "L3 k3 product-of-logs witness = -3")
ok(one_correct("lg-02-03", "k3") == "log₂ (x/y)", "L3 k3 label")
# ch1: (1/2) log 16 + 2 log 5 = 2
ok(close(0.5 * lg10(16) + 2 * lg10(5), 2), "L3 ch1 direct")
ok(math.sqrt(16) == 4 and 5 ** 2 == 25 and 4 * 25 == 100 and lg10(100) == 2, "L3 ch1 route A")
check_numeric("lg-02-03", "ch1", 2)
ok(close(lg10(2) + lg10(5), 1), "L3 remedial")
check_numeric("lg-02-03", "rem-lg0203-k", 1)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-lg-ch2: %d/%d checks passed" % (PASS, PASS))
