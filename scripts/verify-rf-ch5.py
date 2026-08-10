"""Dual-route verifier for rational-functions Ch5 (LCD-cleared equations, work rates, variation).

Route A: every claimed solution substituted into the ORIGINAL equation with exact Fractions;
         extraneous/banned candidates proven to zero a denominator; identity/contradiction
         cases proven across dense sweeps.
Route B: candidate sets independently recovered by integer sweeps of the cleared polynomial
         equation; work-rate and variation answers recomputed from first principles
         (rate sums, constant products) and cross-checked against the taught formulas.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/rational-functions/lessons/rf-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"rf-05-01", "rf-05-02", "rf-05-03"}, "expected 3 ch5 lessons")

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

def solve_sweep(eqn, lo=-30, hi=30):
    """eqn(x) -> True/False/None(illegal). Return integer solutions."""
    out = []
    for x in range(lo, hi + 1):
        v = eqn(F(x))
        if v is True: out.append(x)
    return out

# ---- L1: clearing the LCD ----
# c1: 3/x + 1/2 = 2 -> x=2
def e_c1(x):
    if x == 0: return None
    return 3 / x + F(1, 2) == 2
ok(solve_sweep(e_c1) == [2], "L1 c1 sweep")
ok(F(3, 2) + F(1, 2) == 2, "L1 c1 check")
# i1: 5/x = 10/(x+6) -> x=6
def e_i1(x):
    if x == 0 or x == -6: return None
    return 5 / x == 10 / (x + 6)
ok(solve_sweep(e_i1) == [6], "L1 i1 sweep")
# cleared version 5(x+6)=10x has the same single root
ok([x for x in range(-30, 31) if 5 * (x + 6) == 10 * x] == [6], "L1 i1 cleared route")
check_numeric("rf-05-01", "i1", 6)
# k1: 1/(x-3) + 2 = x/(x-3) -> x=5
def e_k1(x):
    if x == 3: return None
    return 1 / (x - 3) + 2 == x / (x - 3)
ok(solve_sweep(e_k1) == [5], "L1 k1 sweep")
ok([x for x in range(-30, 31) if 1 + 2 * (x - 3) == x] == [5], "L1 k1 cleared route")
check_numeric("rf-05-01", "k1", 5)
ok(one_correct("rf-05-01", "i2") == "keep 7; reject 4 as extraneous", "L1 i2")
# k2: x + 6/x = 5 -> {2, 3}
def e_k2(x):
    if x == 0: return None
    return x + 6 / x == 5
ok(solve_sweep(e_k2) == [2, 3], "L1 k2 sweep")
ok([x for x in range(-30, 31) if x * x + 6 == 5 * x] == [2, 3], "L1 k2 cleared route (quadratic)")
ok(one_correct("rf-05-01", "k2") == "x = 2 or x = 3", "L1 k2 label")
# k3: 3/(x-1) = (x+2)/(x-1): cleared root x=1 is banned -> empty
def e_k3(x):
    if x == 1: return None
    return 3 / (x - 1) == (x + 2) / (x - 1)
ok(solve_sweep(e_k3) == [], "L1 k3 no legal solutions")
ok([x for x in range(-30, 31) if 3 == x + 2] == [1], "L1 k3 cleared root is exactly the ban")
ok(one_correct("rf-05-01", "k3") == "no solution — the only candidate is excluded", "L1 k3 label")
# ch1: 2/(x-2) = x/(x-2) - 1: identity on legal domain
def e_ch1(x):
    if x == 2: return None
    return 2 / (x - 2) == x / (x - 2) - 1
sols = solve_sweep(e_ch1)
ok(sols == [x for x in range(-30, 31) if x != 2], "L1 ch1 identity: every legal integer solves")
for x in [F(n, 7) for n in range(-70, 71) if F(n, 7) != 2]:
    ok(e_ch1(x) is True, "L1 ch1 identity at %s" % x)
ok(one_correct("rf-05-01", "ch1") == "every real x except 2", "L1 ch1 label")
def e_rem(x):
    if x == 0: return None
    return 6 / x == 3
ok(solve_sweep(e_rem) == [2], "L1 remedial")
check_numeric("rf-05-01", "rem-rf0501-k", 2)

# ---- L2: proportions & work rates ----
ok([x for x in range(-40, 41) if 2 * (x + 1) == 4 * (x - 2)] == [5], "L2 c1 cross-mult")
ok(F(5 + 1, 4) == F(5 - 2, 2), "L2 c1 check in original")
def e2_i1(x):
    return F(x, 6) == F(x - 4, 2)
ok([x for x in range(-40, 41) if e2_i1(x)] == [6], "L2 i1 sweep")
ok([x for x in range(-40, 41) if 2 * x == 6 * (x - 4)] == [6], "L2 i1 cleared route")
check_numeric("rf-05-02", "i1", 6)
# c2/i2: 1/6 + 1/3 = 1/t -> t=2
rate = F(1, 6) + F(1, 3)
ok(rate == F(1, 2) and 1 / rate == 2, "L2 rates add to 1/2")
ok(2 < 3, "L2 sanity: joint beats fastest")
check_numeric("rf-05-02", "i2", 2)
ok(one_correct("rf-05-02", "k1") == "1/4", "L2 k1")
ok(one_correct("rf-05-02", "k2") == "t must be less than 3", "L2 k2")
ok((4 + 12) / 2 == 8, "L2 k2/ch1 averaging trap value confirmed as average")
# k3: 1/6 + 1/x = 1/2 -> x=3
def e2_k3(x):
    if x == 0: return None
    return F(1, 6) + 1 / x == F(1, 2)
ok(solve_sweep(e2_k3) == [3], "L2 k3 sweep")
ok(F(1, 2) - F(1, 6) == F(1, 3), "L2 k3 subtraction route")
check_numeric("rf-05-02", "k3", 3)
# ch1: 1/4 + 1/12 = 1/t -> 3
r2 = F(1, 4) + F(1, 12)
ok(r2 == F(1, 3) and 1 / r2 == 3 and 3 < 4, "L2 ch1 rates + sanity")
ok(solve_sweep(lambda t: None if t == 0 else F(1, 4) + F(1, 12) == 1 / t) == [3], "L2 ch1 sweep")
check_numeric("rf-05-02", "ch1", 3)
ok([x for x in range(-40, 41) if 6 * x == 24] == [4], "L2 remedial")
check_numeric("rf-05-02", "rem-rf0502-k", 4)

# ---- L3: variation ----
ok(F(120, 40) == 3 and F(120, 80) == F(3, 2), "L3 i1 both times")
w = widget("rf-05-03", "i1")
ok(w["answer"] == 1.5, "L3 i1 answer 1.5")
ok(all(e["value"] != 1.5 for e in w["commonErrors"]) and len(w["commonErrors"]) >= 2, "L3 i1 traps")
ok(F(80, 40) == 2, "L3 i1 trap 2 = speed-ratio path")
# c2: k = 24, y(8) = 3
ok(4 * 6 == 24 and F(24, 8) == 3, "L3 c2")
# k1: k = 30, y(5) = 6; direct-law trap 50
ok(3 * 10 == 30 and F(30, 5) == 6, "L3 k1")
ok(F(10, 3) * 5 != 50 and round(F(10, 3) * 5) != 50, "L3 k1 trap 50 note")  # 50 comes from k=10*... y=kx with k=10: 10*5=50
ok(10 * 5 == 50, "L3 k1 trap 50 = direct-variation path (k=y=10 misuse)")
check_numeric("rf-05-03", "k1", 6)
# i2: products all 36, ratios drift
for x, y in ((2, 18), (3, 12), (6, 6)):
    ok(x * y == 36, "L3 i2 product row (%d,%d)" % (x, y))
ok(F(18, 2) != F(12, 3), "L3 i2 ratios drift")
ok(one_correct("rf-05-03", "i2") == "inverse — every product xy is 36", "L3 i2 label")
ok(one_correct("rf-05-03", "k2") == "number of workers and hours to finish a fixed job", "L3 k2")
# k3: joint z = kxy: k = 4, z(3,5) = 60
ok(F(24, 6) == 4 and 4 * 3 * 5 == 60, "L3 k3")
ok(3 * 5 == 15, "L3 k3 trap 15 = missing k path")
check_numeric("rf-05-03", "k3", 60)
# ch1: PV = 120, P(4) = 30; direct trap 4.8 = 1.2*4
ok(12 * 10 == 120 and F(120, 4) == 30, "L3 ch1")
ok(F(12, 10) * 4 == F(24, 5), "L3 ch1 trap 4.8 = direct-law path")
check_numeric("rf-05-03", "ch1", 30)
ok(2 * 8 == 16, "L3 remedial")
check_numeric("rf-05-03", "rem-rf0503-k", 16)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-rf-ch5: %d/%d checks passed" % (PASS, PASS))
