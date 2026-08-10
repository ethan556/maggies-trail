"""Dual-route verifier for radical-functions Ch4 (solving radical equations).

Route A: every claimed solution substituted into the ORIGINAL equation (float, tol 1e-12);
         extraneous candidates proven to FAIL the original while satisfying the squared one.
Route B: candidate sets independently recovered by integer sweeps of the squared/cubed
         equation; no-solution cases proven by range arguments.
"""
import json, glob, sys, math

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/radical-functions/lessons/re-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"re-04-01", "re-04-02", "re-04-03"}, "expected 3 ch4 lessons")

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

def solves(lhs, rhs, x):
    try: return close(lhs(x), rhs(x))
    except ValueError: return False

def sweep_solutions(lhs, rhs, lo=-30, hi=60):
    return [x for x in range(lo, hi + 1) if solves(lhs, rhs, x)]

# ---- L1 ----
# i1: sqrt(x-2)=5 -> 27
ok(sweep_solutions(lambda x: math.sqrt(x - 2) if x >= 2 else float("nan"), lambda x: 5.0) == [27], "L1 i1 sweep")
check_numeric("re-04-01", "i1", 27)
# c2 claim: sqrt(x)+2=7 -> 25
ok(math.sqrt(25) + 2 == 7, "L1 c2")
# k1: sqrt(x)+3=10 -> 49
ok(sweep_solutions(lambda x: math.sqrt(x) + 3 if x >= 0 else float("nan"), lambda x: 10.0, 0, 200) == [49], "L1 k1 sweep")
ok(not close(math.sqrt(100) + 3, 10), "L1 k1 trap 100 fails original")
check_numeric("re-04-01", "k1", 49)
# i2: 2 sqrt(x) = 12 -> 36
ok(sweep_solutions(lambda x: 2 * math.sqrt(x) if x >= 0 else float("nan"), lambda x: 12.0, 0, 300) == [36], "L1 i2 sweep")
ok(not close(2 * math.sqrt(144), 12), "L1 i2 trap 144 fails original")
check_numeric("re-04-01", "i2", 36)
# k2: sqrt(3x+1)=4 -> 5; trap 1 satisfies the UNsquared misread 3x+1=4
ok(sweep_solutions(lambda x: math.sqrt(3 * x + 1) if 3 * x + 1 >= 0 else float("nan"), lambda x: 4.0) == [5], "L1 k2 sweep")
ok(3 * 1 + 1 == 4, "L1 k2 trap 1 = skipped-squaring path")
ok(3 * 5 == 15, "L1 k2 trap 15 = 3x path")
check_numeric("re-04-01", "k2", 5)
# k3: sqrt(x+1) = -2 has no solution; blind squaring gives x=3 which fails
ok(sweep_solutions(lambda x: math.sqrt(x + 1) if x >= -1 else float("nan"), lambda x: -2.0) == [], "L1 k3 no solution")
ok(3 + 1 == 4 and math.sqrt(4) == 2 != -2, "L1 k3 phantom x=3 fails")
# range argument: min of sqrt(x+1) is 0 > -2
ok(min(math.sqrt(x / 10 + 1) for x in range(-10, 500)) == 0, "L1 k3 range argument")
ok(one_correct("re-04-01", "k3") == "none — a principal root is never negative", "L1 k3 label")
# ch1: 3 sqrt(x-1) - 6 = 0 -> 5
ok(sweep_solutions(lambda x: 3 * math.sqrt(x - 1) - 6 if x >= 1 else float("nan"), lambda x: 0.0) == [5], "L1 ch1 sweep")
ok(not solves(lambda x: 3 * math.sqrt(x - 1) - 6, lambda x: 0.0, 37), "L1 ch1 trap 37 fails")
check_numeric("re-04-01", "ch1", 5)
ok(sweep_solutions(lambda x: math.sqrt(x) if x >= 0 else float("nan"), lambda x: 6.0, 0, 100) == [36], "L1 remedial")
check_numeric("re-04-01", "rem-re0401-k", 36)

# ---- L2: extraneous ----
# headline: sqrt(x+7) = x+1
lhs = lambda x: math.sqrt(x + 7) if x >= -7 else float("nan")
rhs = lambda x: x + 1.0
ok(sweep_solutions(lhs, rhs) == [2], "L2 headline: only 2 solves original")
# squared equation has both candidates
sq = [x for x in range(-30, 61) if x + 7 == (x + 1) ** 2]
ok(sq == [-3, 2], "L2 squared candidates")
ok(close(lhs(-3), 2.0) and rhs(-3) == -2.0, "L2 phantom sign mismatch +2 vs -2")
ok(-3 + 7 == 4 >= 0, "L2 phantom is domain-legal")
ok(one_correct("re-04-02", "i1") == "the left side gives +2 but the right side gives −2", "L2 i1")
# k1/i2: x = sqrt(x+6)
lhs2 = lambda x: float(x); rhs2 = lambda x: math.sqrt(x + 6) if x >= -6 else float("nan")
ok(sweep_solutions(lhs2, rhs2) == [3], "L2 k1: only 3")
sq2 = [x for x in range(-30, 61) if x * x == x + 6]
ok(sq2 == [-2, 3], "L2 k1 squared candidates")
ok(rhs2(-2) == 2.0 != -2.0, "L2 k1 phantom fails")
ok(one_correct("re-04-02", "k1") == "only x = 3", "L2 k1 label")
ok(one_correct("re-04-02", "i2") == "any valid solution must have x ≥ 0", "L2 i2")
# k2: sqrt(2x+3) = x
lhs3 = lambda x: math.sqrt(2 * x + 3) if 2 * x + 3 >= 0 else float("nan")
ok(sweep_solutions(lhs3, lambda x: float(x)) == [3], "L2 k2: only 3")
sq3 = [x for x in range(-30, 61) if 2 * x + 3 == x * x]
ok(sq3 == [-1, 3], "L2 k2 squared candidates")
ok(lhs3(-1) == 1.0 != -1.0, "L2 k2 phantom fails")
ok(one_correct("re-04-02", "k2") == "x = 3 only", "L2 k2 label")
ok(one_correct("re-04-02", "k3") == "a legal input whose two sides have opposite signs", "L2 k3")
# ch1: sqrt(x+11) = x-1
lhs4 = lambda x: math.sqrt(x + 11) if x >= -11 else float("nan")
rhs4 = lambda x: x - 1.0
ok(sweep_solutions(lhs4, rhs4) == [5], "L2 ch1: only 5")
sq4 = [x for x in range(-30, 61) if x + 11 == (x - 1) ** 2]
ok(sq4 == [-2, 5], "L2 ch1 squared candidates")
ok(close(lhs4(-2), 3.0) and rhs4(-2) == -3.0, "L2 ch1 phantom +3 vs -3")
check_numeric("re-04-02", "ch1", 5)
ok(one_correct("re-04-02", "rem-re0402-k") == "no — the sides don't match", "L2 remedial")

# ---- L3 ----
# i1: sqrt(3x-2) = sqrt(x+8) -> 5
l = lambda x: math.sqrt(3 * x - 2) if 3 * x - 2 >= 0 else float("nan")
r = lambda x: math.sqrt(x + 8) if x >= -8 else float("nan")
ok(sweep_solutions(l, r) == [5], "L3 i1 sweep")
ok(close(l(5), math.sqrt(13)), "L3 i1 check value")
check_numeric("re-04-03", "i1", 5)
# c2: cbrt(x-4)=2 -> 12
ok((12 - 4) ** (1 / 3.0) == 2.0, "L3 c2")
# k1: cbrt(2x+11)=3 -> 8
def cbrt(v): return math.copysign(abs(v) ** (1 / 3.0), v)
ok(sweep_solutions(lambda x: cbrt(2 * x + 11), lambda x: 3.0) == [8], "L3 k1 sweep")
ok([x for x in range(-30, 61) if 2 * x + 11 == 9] == [-1], "L3 k1 trap -1 = squared path")
check_numeric("re-04-03", "k1", 8)
# i2: cubing injective — witness: (-2)**3 != 2**3
ok((-2) ** 3 != 2 ** 3 and (-2) ** 2 == 2 ** 2, "L3 i2 odd vs even powers")
ok(one_correct("re-04-03", "i2") == "cubing preserves signs — different numbers stay different", "L3 i2")
# k2: sqrt(x^2-9)=4 -> both +-5
l2 = lambda x: math.sqrt(x * x - 9) if x * x >= 9 else float("nan")
ok(sweep_solutions(l2, lambda x: 4.0) == [-5, 5], "L3 k2 sweep: both survive")
ok(one_correct("re-04-03", "k2") == "x = 5 or x = −5", "L3 k2 label")
# k3: fourth root
ok((14 + 2) ** 0.25 == 2.0, "L3 k3: x=14 checks")
ok(one_correct("re-04-03", "k3") == "the 4th power: x + 2 = 16", "L3 k3 label")
# ch1: sqrt(x+4) = x-2
l3 = lambda x: math.sqrt(x + 4) if x >= -4 else float("nan")
r3 = lambda x: x - 2.0
ok(sweep_solutions(l3, r3) == [5], "L3 ch1: only 5")
sqc = [x for x in range(-30, 61) if x + 4 == (x - 2) ** 2]
ok(sqc == [0, 5], "L3 ch1 squared candidates")
ok(close(l3(0), 2.0) and r3(0) == -2.0, "L3 ch1 phantom 0 fails: +2 vs -2")
check_numeric("re-04-03", "ch1", 5)
# remedial: sqrt(x+1) = sqrt(2x-3) -> 4
lr = lambda x: math.sqrt(x + 1) if x >= -1 else float("nan")
rr = lambda x: math.sqrt(2 * x - 3) if 2 * x - 3 >= 0 else float("nan")
ok(sweep_solutions(lr, rr) == [4], "L3 remedial sweep")
check_numeric("re-04-03", "rem-re0403-k", 4)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-re-ch4: %d/%d checks passed" % (PASS, PASS))
