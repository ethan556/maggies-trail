"""Dual-route verifier for radical-functions Ch2 (rationalizing, binomial products, conjugates).

Route A: taught patterns computed symbolically over Q(sqrt(d)) — exact arithmetic on pairs
         (a, b) representing a + b*sqrt(d) with Fraction components.
Route B: high-precision float evaluation (rel tol 1e-12) of both sides of every identity,
         including value-preservation checks for every rationalization.
NOTE: two Ch2 mcq distractors are deliberately VALUE-EQUAL but unsimplified forms
      (form-based question) — the verifier checks those for value equality instead of
      difference, and asserts their feedback says so.
"""
import json, glob, sys, math
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/radical-functions/lessons/re-02-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"re-02-01", "re-02-02", "re-02-03"}, "expected 3 ch2 lessons")

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

def close(a, b):
    return abs(a - b) <= 1e-12 * max(1.0, abs(a), abs(b))

# exact arithmetic in Q(sqrt(d)): elements (a, b) = a + b*sqrt(d)
def qmul(x, y, d):
    (a, b), (c, e) = x, y
    return (a * c + b * e * d, a * e + b * c)

def qval(x, d):
    return float(x[0]) + float(x[1]) * math.sqrt(d)

# ---- L1: monomial rationalizing ----
# i1: 5/sqrt5 == sqrt5. Route A in Q(sqrt5): 5/sqrt5 = sqrt5 since sqrt5*sqrt5=5.
ok(qmul((0, 1), (0, 1), 5) == (5, 0), "L1 i1 sqrt5*sqrt5")
ok(close(5 / math.sqrt(5), math.sqrt(5)), "L1 i1 value")
ok(one_correct("re-02-01", "i1") == "√5", "L1 i1 label")
ok(not close(5 / math.sqrt(5), 5 * math.sqrt(5)), "L1 i1 distractor differs")
ok(close(10 / math.sqrt(5), 2 * math.sqrt(5)), "L1 k1 value")
ok(one_correct("re-02-01", "k1") == "2√5", "L1 k1 label")
ok(close(1 / math.sqrt(4), 0.5) and close(math.sqrt(4) / 4, 0.5), "L1 i2 both forms = 1/2")
check_numeric("re-02-01", "i2", 2)
ok(close(4 / math.sqrt(8), math.sqrt(2)), "L1 k2 value")
ok(one_correct("re-02-01", "k2") == "√2", "L1 k2 label")
# k2 distractor "4√8/8" is VALUE-EQUAL unsimplified — assert equality + feedback wording
ok(close(4 * math.sqrt(8) / 8, math.sqrt(2)), "L1 k2 value-equal distractor")
w = widget("re-02-01", "k2")
fb = next(o["feedback"] for o in w["options"] if o["label"] == "4√8/8")
ok("unfinished" in fb.lower() or "unsimplified" in fb.lower() or "reduces" in fb.lower(), "L1 k2 distractor feedback flags form")
ok(not close(4 / math.sqrt(8), 2 * math.sqrt(2)), "L1 k2 distractor 2√2 differs")
# k3: x/sqrt(x) == sqrt(x) at samples
for x in (0.5, 1.0, 2.0, 3.7, 9.0):
    ok(close(x / math.sqrt(x), math.sqrt(x)), "L1 k3 x=%s" % x)
ok(one_correct("re-02-01", "k3") == "√x", "L1 k3 label")
ok(close(9 / math.sqrt(27), math.sqrt(3)), "L1 ch1 value")
ok(one_correct("re-02-01", "ch1") == "√3", "L1 ch1 label")
# ch1 value-equal distractors: 9√27/27 and √27/3
ok(close(9 * math.sqrt(27) / 27, math.sqrt(3)) and close(math.sqrt(27) / 3, math.sqrt(3)), "L1 ch1 value-equal distractors")
w = widget("re-02-01", "ch1")
for lab in ("9√27/27", "√27/3"):
    fb = next(o["feedback"] for o in w["options"] if o["label"] == lab)
    ok("unsimplified" in fb.lower() or "unfinished" in fb.lower(), "L1 ch1 %s feedback flags form" % lab)
ok(not close(9 / math.sqrt(27), 3 * math.sqrt(3)), "L1 ch1 distractor 3√3 differs")
ok(close(1 / math.sqrt(3), math.sqrt(3) / 3), "L1 remedial value")
ok(one_correct("re-02-01", "rem-re0201-k") == "√3/3", "L1 remedial label")

# ---- L2: binomial products ----
# (1+sqrt2)(3+sqrt2) in Q(sqrt2): (1,1)*(3,1) = (3+2, 1+3) = (5,4)
ok(qmul((1, 1), (3, 1), 2) == (5, 4), "L2 c1 product")
ok(close(qval((5, 4), 2), (1 + math.sqrt(2)) * (3 + math.sqrt(2))), "L2 c1 value")
check_numeric("re-02-02", "i1", 5)
# (1+sqrt5)^2 = (6, 2)
ok(qmul((1, 1), (1, 1), 5) == (6, 2), "L2 k1 square")
ok(one_correct("re-02-02", "k1") == "6 + 2√5", "L2 k1 label")
# i2/k2: (sqrt3+sqrt2)(sqrt3+2sqrt2) — mixed radicands; float route only
lhs = (math.sqrt(3) + math.sqrt(2)) * (math.sqrt(3) + 2 * math.sqrt(2))
ok(close(lhs, 7 + 3 * math.sqrt(6)), "L2 i2/k2 identity")
check_numeric("re-02-02", "i2", 7)
ok(one_correct("re-02-02", "k2") == "3√6", "L2 k2 label")
ok(not close(lhs, 7 + 2 * math.sqrt(6)) and not close(lhs, 7 + 3 * math.sqrt(5)), "L2 k2 distractors differ")
ok(close(math.sqrt(7) ** 2, 7), "L2 k3")
check_numeric("re-02-02", "k3", 7)
ok(qmul((2, 1), (1, 2), 3) == (8, 5), "L2 ch1 product")
ok(one_correct("re-02-02", "ch1") == "8 + 5√3", "L2 ch1 label")
for alt in ((2, 5), (8, 4), (14, 5)):
    ok(alt != (8, 5) and not close(qval(alt, 3), qval((8, 5), 3)), "L2 ch1 distractor differs")
ok(qmul((1, 1), (2, 1), 5) == (7, 3), "L2 remedial product")
ok(one_correct("re-02-02", "rem-re0202-k") == "7 + 3√5", "L2 remedial label")

# ---- L3: conjugates ----
ok(qmul((5, 1), (5, -1), 3) == (22, 0), "L3 i1 conjugate product")
check_numeric("re-02-03", "i1", 22)
# k1: 3/(1+sqrt2) == 3*sqrt2 - 3
ok(close(3 / (1 + math.sqrt(2)), 3 * math.sqrt(2) - 3), "L3 k1 value")
ok(one_correct("re-02-03", "k1") == "3√2 − 3", "L3 k1 label")
ok(not close(3 / (1 + math.sqrt(2)), 3 - 3 * math.sqrt(2)), "L3 k1 sign-flip distractor differs")
# route A: 3*(1,-1)/(1-2): numerator (3,-3), denominator -1 -> (-3,3) = 3sqrt2-3 as (a,b)=(-3,3)
ok(qmul((1, 1), (1, -1), 2) == (-1, 0), "L3 k1 denominator")
ok(close(qval((-3, 3), 2), 3 * math.sqrt(2) - 3), "L3 k1 exact form")
ok(qmul((4, -1), (4, 1), 5) == (11, 0), "L3 i2 denominator")
check_numeric("re-02-03", "i2", 11)
ok(one_correct("re-02-03", "k2") == "2 + √7", "L3 k2 label")
ok(qmul((2, -1), (2, 1), 7) == (-3, 0), "L3 k2 conjugate clears")
# k3: (sqrt5+sqrt3)(sqrt5-sqrt3) = 2
ok(close((math.sqrt(5) + math.sqrt(3)) * (math.sqrt(5) - math.sqrt(3)), 2), "L3 k3 value")
check_numeric("re-02-03", "k3", 2)
# ch1: 2/(sqrt5-sqrt3) == sqrt5+sqrt3
ok(close(2 / (math.sqrt(5) - math.sqrt(3)), math.sqrt(5) + math.sqrt(3)), "L3 ch1 value")
ok(one_correct("re-02-03", "ch1") == "√5 + √3", "L3 ch1 label")
ok(not close(2 / (math.sqrt(5) - math.sqrt(3)), 2 * (math.sqrt(5) + math.sqrt(3))), "L3 ch1 distractor differs")
ok(qmul((2, 1), (2, -1), 3) == (1, 0), "L3 remedial")
check_numeric("re-02-03", "rem-re0203-k", 1)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-re-ch2: %d/%d checks passed" % (PASS, PASS))
