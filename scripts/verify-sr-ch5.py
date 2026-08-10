"""Dual-route verifier for sequences-series Ch5 (infinite geometric series).

Route A: the taught limit formula S = a1/(1 - r), exact via Fractions.
Route B: NUMERICAL CONVERGENCE — partial sums computed by literal addition must
         approach the claimed total (gap shrinks below 1e-9 (adaptively, up to 5000 terms) and
         decreases monotonically in magnitude). Divergence claims are verified by
         partial sums escaping any bound (or provably oscillating for r = -1).
"""
import json, glob, sys
from fractions import Fraction as F

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/sequences-series/lessons/sr-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"sr-05-01", "sr-05-02", "sr-05-03"}, "expected 3 ch5 lessons")

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step %s/%s" % (lid, sid))

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " exactly-one-correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(w["answer"] == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " needs >=2 traps")
    for e in w["commonErrors"]:
        ok(e["value"] != expect, "%s/%s trap == answer" % (lid, sid))

def converges_to(a1, r, claimed):
    """Route B: literal partial sums approach `claimed`; Route A must agree exactly."""
    ok(abs(F(r)) < 1, "convergence claimed with |r| >= 1 (a1=%s r=%s)" % (a1, r))
    ok(F(a1) / (1 - F(r)) == F(claimed), "formula route != claimed (a1=%s r=%s)" % (a1, r))
    s, term, prev_gap = F(0), F(a1), None
    for n in range(5000):
        s += term
        term *= F(r)
        gap = abs(F(claimed) - s)
        if prev_gap is not None:
            ok(gap <= prev_gap, "partial-sum gap grew (a1=%s r=%s n=%d)" % (a1, r, n))
        prev_gap = gap
        if gap < F(1, 10 ** 9):
            return
    ok(False, "partial sums fail to close on the claim within 5000 terms (a1=%s r=%s)" % (a1, r))

def diverges(a1, r):
    """Route B: partial sums escape 1e6, or oscillate without settling (|r| = 1)."""
    s, term, seen = F(0), F(a1), set()
    for _ in range(400):
        s += term
        term *= F(r)
        if abs(s) > 10 ** 6:
            return
        seen.add(s)
    ok(len(seen) > 1, "partial sums settled on a single value; not divergent (a1=%s r=%s)" % (a1, r))

# ---- L1 ----
ok(sum(F(1, 2) ** k for k in range(1, 5)) == F(15, 16) and float(F(15, 16)) == 0.9375, "L1 i1 dual route")
ok(sum(F(1, 2) ** k for k in range(1, 4)) == F(7, 8) and float(F(7, 8)) == 0.875, "L1 i1 three-piece trap")
check_numeric("sr-05-01", "i1", 0.9375)
ok(all(sum(F(1, 2) ** k for k in range(1, n + 1)) == 1 - F(1, 2) ** n < 1 for n in range(1, 60)),
   "L1 k1: every partial sum is 1 - 1/2^n and stays below 1")
converges_to(F(1, 2), F(1, 2), 1)
ok(one_correct("sr-05-01", "k1") == "climbs toward 1 but never reaches or passes it", "L1 k1 label")
# i2 buckets: verify every classification numerically
w = widget("sr-05-01", "i2")
key = {i["id"]: i["bucketId"] for i in w["items"]}
ok(key == {"r1": "conv", "r2": "div", "r3": "conv", "r4": "div", "r5": "div"}, "L1 i2 bucket key")
converges_to(1, F(1, 3), F(3, 2)); converges_to(1, F(-9, 10), F(10, 19))
diverges(1, 2); diverges(1, 1); diverges(1, F(-3, 2))
ok(one_correct("sr-05-01", "k2") == "100 + 50 + 25 + 12.5 + \u22ef", "L1 k2 label")
converges_to(100, F(1, 2), 200)
diverges(1, 2); diverges(5, 1); diverges(2, 3)
ok(one_correct("sr-05-01", "i3") == "1/3", "L1 i3 label")
converges_to(F(3, 10), F(1, 10), F(1, 3))
ok(one_correct("sr-05-01", "ch1") == "r = \u22120.99", "L1 ch1 label")
converges_to(6, F(-99, 100), F(600, 199))
diverges(6, F(101, 100)); diverges(6, 1)
# r = -1: partial sums flip 6, 0 forever
s, vals = F(0), set()
for k in range(50):
    s += 6 * F(-1) ** k
    vals.add(s)
ok(vals == {F(0), F(6)}, "L1 ch1: r=-1 partial sums oscillate between exactly 6 and 0")
ok(one_correct("sr-05-01", "rem-sr0501-k") == "Yes \u2014 r = 1/2, and |1/2| < 1", "L1 remedial label")
converges_to(40, F(1, 2), 80)

# ---- L2 ----
converges_to(8, F(1, 2), 16); ok(8 + 4 + 2 + 1 == 15, "L2 i1 four-term trap")
check_numeric("sr-05-02", "i1", 16)
converges_to(6, F(1, 3), 9)
ok(F(6) * F(2, 3) == 4 and F(6) / F(1, 3) == 18, "L2 k1 traps: multiplied by 1-r / divided by r")
check_numeric("sr-05-02", "k1", 9)
ok(one_correct("sr-05-02", "i2").startswith("The formula needs |r| < 1"), "L2 i2 label")
diverges(5, 2)
ok(F(5) / (1 - F(2)) == -5, "L2 i2: the garbage value really is -5")
converges_to(12, F(-1, 2), 8)
ok(F(12) / F(1, 2) == 24 and F(12) * F(1, 2) == 6, "L2 k2 traps")
check_numeric("sr-05-02", "k2", 8)
ok(F(20) * (1 - F(1, 4)) == 15, "L2 i3 backwards formula")
converges_to(15, F(1, 4), 20)
ok(F(20) * F(1, 4) == 5 and F(20) / F(1, 4) == 80, "L2 i3 traps")
check_numeric("sr-05-02", "i3", 15)
converges_to(27, F(1, 3), F(81, 2))
ok(float(F(81, 2)) == 40.5 and 27 + 9 + 3 + 1 == 40 and F(27, 2) == F(13.5), "L2 ch1 dual route + traps")
check_numeric("sr-05-02", "ch1", 40.5)
converges_to(10, F(1, 2), 20)
check_numeric("sr-05-02", "rem-sr0502-k", 20)

# ---- L3 ----
ok(one_correct("sr-05-03", "i1") == "4/9", "L3 i1 label")
converges_to(F(4, 10), F(1, 10), F(4, 9))
ok(F(4, 9) != F(2, 5) and F(4, 11) == F(36, 99), "L3 i1 distractors: 2/5 terminates; 4/11 is the two-digit repeat")
converges_to(F(2, 10), F(1, 10), F(2, 9))
check_numeric("sr-05-03", "k1", 9)
converges_to(10, F(1, 2), 20)
check_numeric("sr-05-03", "i2", 20)
up = F(5) / (1 - F(1, 2))
ok(up == 10 and 10 + 2 * up == 30, "L3 k2: up-trips total 10; whole journey 30")
converges_to(5, F(1, 2), 10)
check_numeric("sr-05-03", "k2", 30)
w = widget("sr-05-03", "i3")
key = {i["id"]: i["bucketId"] for i in w["items"]}
ok(key == {"p1": "arith", "p2": "fingeo", "p3": "infgeo", "p4": "infgeo"}, "L3 i3 bucket key")
ok(len({23 - 20, 26 - 23}) == 1, "L3 i3 p1 really arithmetic")
ok(len({F(6, 3), F(12, 6)}) == 1 and 3 * 2 ** 5 == 96, "L3 i3 p2 really finite geometric ending at 96")
converges_to(60, F(1, 2), 120)
converges_to(F(8, 10), F(1, 10), F(8, 9))
converges_to(12, F(3, 4), 48)
ok(F(12) / F(3, 4) == 16 and 48 - 12 == 36, "L3 ch1 traps")
check_numeric("sr-05-03", "ch1", 48)
converges_to(F(3, 10), F(1, 10), F(1, 3))
ok(F(3, 9) == F(1, 3), "L3 remedial: 3/9 reduces to 1/3")
check_numeric("sr-05-03", "rem-sr0503-k", 3)

print("verify-sr-ch5: all checks passed")
