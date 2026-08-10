"""Dual-route verifier for function-transformations Ch5 (inverse functions).

Route A: apply the stated inverse rule directly.
Route B: brute-force search — which input makes the forward function hit the target?
Formulas are additionally verified by the composition identity f(g(t)) == g(f(t)) == t
over a numeric sweep, and every distractor formula must FAIL that identity.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/function-transformations/lessons/ft-05-*.json")):
    d = json.load(open(p))
    L[d["id"]] = d
ok(set(L) == {"ft-05-01", "ft-05-02", "ft-05-03"}, "expected 3 ch5 lessons, got " + str(sorted(L)))

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step " + lid + "/" + sid)

def brute_inverse(fwd, target, lo=-60, hi=200):
    hits = [F(x) for x in range(lo, hi + 1) if fwd(F(x)) == target]
    ok(len(hits) == 1, "brute inverse not unique for target %s: %s" % (target, hits))
    return hits[0]

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(w["type"] == "numeric", lid + "/" + sid + " not numeric")
    ok(F(str(w["answer"])) == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    for e in w["commonErrors"]:
        ok(F(str(e["value"])) != expect, "%s/%s trap equals answer" % (lid, sid))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " needs >=2 commonErrors")

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " must have exactly one correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

# ---------- L1: undoing by search ----------
# i1: f(x)=x+5, f^-1(8).  A: 8-5.  B: brute.
ok(F(8) - 5 == brute_inverse(lambda x: x + 5, F(8)) == F(3), "L1 i1 routes disagree")
check_numeric("ft-05-01", "i1", F(3))
# k1 mcq: f(4)=9 -> f^-1(9)=4
ok(one_correct("ft-05-01", "k1") == "4", "L1 k1 correct label")
# i2: f(x)=2x, f^-1(10).  A: 10/2.  B: brute.
ok(F(10, 2) == brute_inverse(lambda x: 2 * x, F(10)) == F(5), "L1 i2 routes disagree")
check_numeric("ft-05-01", "i2", F(5))
# k2: g(x)=x-7, g^-1(4).  A: 4+7.  B: brute.
ok(F(4) + 7 == brute_inverse(lambda x: x - 7, F(4)) == F(11), "L1 k2 routes disagree")
check_numeric("ft-05-01", "k2", F(11))
one_correct("ft-05-01", "k3")
# ch1: h(x)=3x+1, h^-1(19).  A: (19-1)/3.  B: brute.  Trap sanity: 58==h(19), 54==(19-1)*3.
ok((F(19) - 1) / 3 == brute_inverse(lambda x: 3 * x + 1, F(19)) == F(6), "L1 ch1 routes disagree")
ok(3 * F(19) + 1 == 58 and (F(19) - 1) * 3 == 54, "L1 ch1 trap derivations wrong")
check_numeric("ft-05-01", "ch1", F(6))
ch = next(s for s in L["ft-05-01"]["steps"] if s["id"] == "ch1")
ok(len(ch["hints"]) == 3, "L1 ch1 needs exactly 3 hints")
# remedial: f(x)=x+2, f^-1(9)=7 both routes
ok(F(9) - 2 == brute_inverse(lambda x: x + 2, F(9)) == F(7), "L1 remedial routes disagree")
check_numeric("ft-05-01", "rem-ft0501-k", F(7))

# ---------- L2: rules verified by composition identity ----------
def is_inverse_pair(f, g):
    return all(f(g(F(t))) == F(t) and g(f(F(t))) == F(t) for t in range(-25, 26))

f1 = lambda x: 3 * x - 4
RULES = {  # label -> candidate g for f1's k1 mcq
    "f⁻¹(x) = (x + 4)/3": lambda x: (x + 4) / 3,
    "f⁻¹(x) = (x − 4)/3": lambda x: (x - 4) / 3,
    "f⁻¹(x) = x/3 + 4": lambda x: x / 3 + 4,
    "f⁻¹(x) = 1/(3x − 4)": lambda x: 1 / (3 * x - 4) if 3 * x - 4 != 0 else F(10**9),
}
lab = one_correct("ft-05-02", "k1")
for name, g in RULES.items():
    good = is_inverse_pair(f1, g)
    ok(good == (name == lab), "L2 k1 option '%s' identity=%s but marked correct=%s" % (name, good, name == lab))

g1 = lambda x: x / 2 + 3
RULES2 = {
    "g⁻¹(x) = 2x − 6": lambda x: 2 * x - 6,
    "g⁻¹(x) = 2x + 6": lambda x: 2 * x + 6,
    "g⁻¹(x) = x/2 − 3": lambda x: x / 2 - 3,
    "g⁻¹(x) = (x − 3)/2": lambda x: (x - 3) / 2,
}
lab2 = one_correct("ft-05-02", "k2")
for name, g in RULES2.items():
    good = is_inverse_pair(g1, g)
    ok(good == (name == lab2), "L2 k2 option '%s' identity mismatch" % name)

# i2: f1^-1(11).  A: rule (11+4)/3.  B: brute on f1.
ok((F(11) + 4) / 3 == brute_inverse(f1, F(11)) == F(5), "L2 i2 routes disagree")
check_numeric("ft-05-02", "i2", F(5))
# k3: g1^-1(7).  A: 2*7-6.  B: brute-ish over halves (g1 maps halves to ints too).
ginv = lambda x: 2 * x - 6
ok(ginv(F(7)) == F(8) and g1(F(8)) == F(7), "L2 k3 routes disagree")
ok(g1(F(7)) == F(6.5), "L2 k3 forward-trap value wrong")
check_numeric("ft-05-02", "k3", F(8))
# ch1: f(x)=5x+2, f^-1(17).  A: (17-2)/5.  B: brute.  Traps: 87=f(17), 75=(17-2)*5.
f2 = lambda x: 5 * x + 2
ok((F(17) - 2) / 5 == brute_inverse(f2, F(17)) == F(3), "L2 ch1 routes disagree")
ok(f2(F(17)) == 87 and (F(17) - 2) * 5 == 75, "L2 ch1 traps wrong")
check_numeric("ft-05-02", "ch1", F(3))
ok(len(next(s for s in L["ft-05-02"]["steps"] if s["id"] == "ch1")["hints"]) == 3, "L2 ch1 hints")
# remedial: inverse of 4x is x/4 — identity check
ok(is_inverse_pair(lambda x: 4 * x, lambda x: x / 4), "L2 remedial identity")
ok(one_correct("ft-05-02", "rem-ft0502-k") == "f⁻¹(x) = x/4", "L2 remedial label")
# i1 dragOrder: initial differs from correct, >=3 items
w = widget("ft-05-02", "i1")
ok([i["id"] for i in w["items"]] != w["correctOrder"] and len(w["items"]) >= 3, "L2 i1 dragOrder order/shuffle")

# ---------- L3: graphs ----------
# i1 plotPoint: target = swap of (3,5); errors differ from targets; coords in-grid and >=1
w = widget("ft-05-03", "i1")
ok(w["targets"] == [{"x": 5, "y": 3}], "L3 i1 target must be (5,3)")
for e in w["pointErrors"]:
    ok((e["x"], e["y"]) not in [(t["x"], t["y"]) for t in w["targets"]], "L3 i1 pointError hits target")
    ok(1 <= e["x"] <= w["cols"] and 1 <= e["y"] <= w["rows"], "L3 i1 pointError off-grid")
ok(1 <= 5 <= w["cols"] and 1 <= 3 <= w["rows"], "L3 i1 target off-grid")
# k1: (2,7) -> (7,2)
ok(one_correct("ft-05-03", "k1") == "(7, 2)", "L3 k1 label")
# i2: f(f^-1(8)) — Route A staged: inner (8+4)/3=4 then f1(4)=8.  Route B: identity says x.
inner = (F(8) + 4) / 3
ok(f1(inner) == F(8) == F(8), "L3 i2 staged route")
ok(is_inverse_pair(f1, RULES["f⁻¹(x) = (x + 4)/3"]), "L3 i2 identity route")
check_numeric("ft-05-03", "i2", F(8))
# k2 mirror line
ok(one_correct("ft-05-03", "k2") == "y = x", "L3 k2 label")
# k3 HLT: x² must fail (two preimages of 4); x³, x+2, sqrt pass on sample grid
sq = {}
fails = False
for x in range(-10, 11):
    y = x * x
    if y in sq and sq[y] != x: fails = True
    sq.setdefault(y, x)
ok(fails, "x^2 should fail HLT")
for fn in (lambda x: x**3, lambda x: x + 2):
    vals = [fn(x) for x in range(-10, 11)]
    ok(len(vals) == len(set(vals)), "distractor parent unexpectedly fails HLT")
vals = [F(x) ** F(1) for x in range(0, 21)]  # sqrt monotone on grid of squares
import math
sv = [math.isqrt(x * x) for x in range(0, 21)]
ok(len(sv) == len(set(sv)), "sqrt injectivity")
ok(one_correct("ft-05-03", "k3") == "y = x²", "L3 k3 label")
# ch1: fixed point of f(x)=2x-6.  A: algebra x=6.  B: brute scan f(x)==x.
f3 = lambda x: 2 * x - 6
bruteset = [x for x in range(-60, 61) if f3(F(x)) == F(x)]
ok(bruteset == [6], "L3 ch1 brute fixed point %s" % bruteset)
ok(f3(F(6)) == F(6) and f3(F(3)) == F(0), "L3 ch1 algebra route / trap(3)=x-intercept")
# f^-1 shares the fixed point
f3inv = lambda x: (x + 6) / 2
ok(is_inverse_pair(f3, f3inv) and f3inv(F(6)) == F(6), "L3 ch1 inverse shares fixed point")
check_numeric("ft-05-03", "ch1", F(6))
ok(len(next(s for s in L["ft-05-03"]["steps"] if s["id"] == "ch1")["hints"]) == 3, "L3 ch1 hints")
# remedial
ok(one_correct("ft-05-03", "rem-ft0503-k") == "(4, 1)", "L3 remedial label")

# global sweeps: every mcq exactly one correct; numeric traps != answer (already per-widget above)
for lid, d in L.items():
    for s in d["steps"]:
        wdg = s.get("widget")
        if wdg and wdg["type"] == "mcq":
            ok(sum(1 for o in wdg["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq correct count")

print("verify-ft-ch5: %d/%d checks passed" % (PASS, PASS))
