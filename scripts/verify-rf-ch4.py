"""Dual-route verifier for rational-functions Ch4 (reciprocal parent, holes vs VAs, HAs).

Route A: taught classification rules — 0/0 vs nonzero/0 substitution signatures, hole
         heights from exact-Fraction evaluation of the simplified form, HA by degree
         comparison and lead ratios.
Route B: empirical function probing — blow-up verified by |f| growth toward walls from
         BOTH sides, hole calmness by eps-neighborhood evaluation of the ORIGINAL,
         HAs by evaluation at x = ±10^6 within tolerance, crossing witness checked.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/rational-functions/lessons/rf-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"rf-04-01", "rf-04-02", "rf-04-03"}, "expected 3 ch4 lessons")

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

def peval(c, x):
    acc = F(0)
    for k in c: acc = acc * F(x) + F(k)
    return acc

def rat(num, den):
    return lambda x: peval(num, x) / peval(den, x)

def blows_up(f, wall):
    """|f| grows without bound approaching wall from both sides."""
    for side in (1, -1):
        vals = [abs(f(F(wall) + side * F(1, 10 ** k))) for k in (2, 4, 6)]
        ok(vals[0] < vals[1] < vals[2] and vals[2] > 10 ** 5, "blow-up fails at %s side %s: %s" % (wall, side, vals))

def calm_hole(f, x0, height):
    """Original f is defined and ~height in an eps-neighborhood of x0 (excluding x0)."""
    for side in (1, -1):
        v = f(F(x0) + side * F(1, 10 ** 6))
        ok(abs(v - F(height)) < F(1, 10 ** 4), "hole not calm at %s: %s vs %s" % (x0, v, height))

def ha_value(f, y):
    for X in (10 ** 6, -10 ** 6):
        ok(abs(f(X) - F(y)) < F(1, 10 ** 4), "HA fails at %s: %s vs %s" % (X, float(f(X)), y))

# ---- L1: reciprocal ----
recip = rat([1], [1, 0])
ok(recip(F(1, 100)) == 100, "L1 i1: 1/0.01")
check_numeric("rf-04-01", "i1", 100)
ok(recip(F(1, 1000)) == 1000 and recip(1000) == F(1, 1000), "L1 c2 explosion/flattening")
# k1: 1/x = 0 has no solution over a wide exact sweep
ok(all(recip(F(n, 13)) != 0 for n in range(-500, 501) if n != 0), "L1 k1: 0 never achieved")
ok(recip(-2) == F(-1, 2), "L1 k1 distractor: negatives exist")
ok(one_correct("rf-04-01", "k1") == "a fraction equals 0 only when its numerator does — and this one is always 1", "L1 k1 label")
g = lambda x: F(1) / (F(x) - 2) + 1
ok(peval([1, -2], 2) == 0, "L1 i2 vertical at 2")
ha_value(g, 1)
blows_up(g, 2)
ok(one_correct("rf-04-01", "i2") == "x = 2 and y = 1", "L1 i2 label")
# k2: from the right, huge positive
ok(g(F(2001, 1000)) > 1000, "L1 k2 right side up")
ok(g(F(1999, 1000)) < -998, "L1 k2 left side down (contrast)")
ok(one_correct("rf-04-01", "k2") == "shoots up toward +∞", "L1 k2 label")
# k3 range: every k != 0 achieved at 1/k
for k in (5, -3, F(1, 2), F(-7, 3)):
    ok(recip(F(1, 1) / k) == k, "L1 k3 achieves %s" % k)
ok(one_correct("rf-04-01", "k3") == "all real numbers except 0", "L1 k3 label")
h = lambda x: F(1) / (F(x) + 3) - 2
blows_up(h, -3)
ha_value(h, -2)
ok(one_correct("rf-04-01", "ch1") == "x = −3 and y = −2", "L1 ch1 label")
ok(F(1) / F(1, 10000) == 10000, "L1 remedial")
check_numeric("rf-04-01", "rem-rf0401-k", 10000)

# ---- L2: holes vs VAs ----
NUM, DEN = [1, -1], [1, -4, 3]  # (x-1) / ((x-1)(x-3)) = (x-1)/(x^2-4x+3)
f = rat(NUM, DEN)
ok(peval(NUM, 1) == 0 and peval(DEN, 1) == 0, "L2 signature 0/0 at x=1")
ok(peval(NUM, 3) == 2 and peval(DEN, 3) == 0, "L2 signature 2/0 at x=3")
calm_hole(f, 1, F(-1, 2))
blows_up(f, 3)
ok(F(1) / (F(1) - 3) == F(-1, 2), "L2 hole height via simplified form")
ok(one_correct("rf-04-02", "i1") == "hole at 1, asymptote at 3", "L2 i1 label")
# k1: g = (x-2)/((x-2)(x+4))
NUM2, DEN2 = [1, -2], [1, 2, -8]
g2 = rat(NUM2, DEN2)
ok(peval(NUM2, 2) == 0 and peval(DEN2, 2) == 0, "L2 k1 0/0 at 2")
ok(F(1) / (F(2) + 4) == F(1, 6), "L2 k1 hole height 1/6")
calm_hole(g2, 2, F(1, 6))
blows_up(g2, -4)
ok(one_correct("rf-04-02", "k1") == "(2, 1/6)", "L2 k1 label")
ok(one_correct("rf-04-02", "i2") == "a common factor — likely a hole, so simplify and re-evaluate", "L2 i2 label")
ok(one_correct("rf-04-02", "k2") == "a vertical asymptote at x = 3", "L2 k2 label")
# k3: (x-5)/(x-5)^2 == 1/(x-5): still blows up at 5
q = rat([1, -5], [1, -10, 25])
blows_up(q, 5)
ok(one_correct("rf-04-02", "k3") == "a vertical asymptote — one (x − 5) survives below", "L2 k3 label")
# ch1: (x^2-4)/((x-2)(x+1)): hole (2, 4/3), VA -1
NUM3, DEN3 = [1, 0, -4], [1, -1, -2]
f3 = rat(NUM3, DEN3)
ok(peval(NUM3, 2) == 0 and peval(DEN3, 2) == 0, "L2 ch1 0/0 at 2")
ok((F(2) + 2) / (F(2) + 1) == F(4, 3), "L2 ch1 hole height 4/3")
calm_hole(f3, 2, F(4, 3))
blows_up(f3, -1)
ok(peval(NUM3, -2) == 0 and peval(DEN3, -2) == 4, "L2 ch1 distractor: -2 is only an x-intercept")
ok(one_correct("rf-04-02", "ch1") == "hole at (2, 4/3); asymptote x = −1", "L2 ch1 label")
ok(one_correct("rf-04-02", "rem-rf0402-k") == "vertical asymptote", "L2 remedial label")

# ---- L3: horizontal asymptotes ----
f1 = rat([3, 1], [1, 0, 5])
ha_value(f1, 0)
ok(one_correct("rf-04-03", "i1") == "y = 0", "L3 i1 label")
# c2 witness: (4x^2+x)/(2x^2-7) at 100
w = rat([4, 1, 0], [2, 0, -7])
ok(w(100) == F(40100, 19993), "L3 c2 witness value")
ok(abs(w(100) - 2) < F(1, 100), "L3 c2 already near 2")
f2 = rat([6, -1, 0], [3, 0, 8])
ha_value(f2, 2)
ok(F(6, 3) == 2, "L3 k1 lead ratio")
ok(one_correct("rf-04-03", "k1") == "y = 2", "L3 k1 label")
f3b = rat([1, 0, 0, 1], [1, 2])
ok(abs(f3b(10 ** 6)) > 10 ** 11 and abs(f3b(-10 ** 6)) > 10 ** 11, "L3 i2 escapes both ends")
ok(one_correct("rf-04-03", "i2") == "none — the top's degree is larger", "L3 i2 label")
f4 = rat([10, 3], [2, -1])
ha_value(f4, 5)
ok(f4(1000) == F(10003, 1999), "L3 k2 far-out value")
check_numeric("rf-04-03", "k2", 5)
# k3 crossing witness: x/(x^2+1) is 0 at 0 and HA y=0
cross = rat([1, 0], [1, 0, 1])
ok(cross(0) == 0, "L3 k3 crosses y=0 at origin")
ha_value(cross, 0)
ok(one_correct("rf-04-03", "k3") == "yes — the rule only governs far-end behavior", "L3 k3 label")
# ch1: (2x^2-8)/(x^2-1)
NUM5, DEN5 = [2, 0, -8], [1, 0, -1]
f5 = rat(NUM5, DEN5)
ha_value(f5, 2)
blows_up(f5, 1)
blows_up(f5, -1)
ok(peval(NUM5, 1) == -6 and peval(NUM5, -1) == -6, "L3 ch1 no shared zeros -> no holes")
ok(peval(NUM5, 2) == 0 and peval(NUM5, -2) == 0, "L3 ch1 top zeros are ±2 (intercepts)")
ok(one_correct("rf-04-03", "ch1") == "y = 2; x = 1 and x = −1", "L3 ch1 label")
f6 = rat([5, 1], [1, 3])
ha_value(f6, 5)
check_numeric("rf-04-03", "rem-rf0403-k", 5)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-rf-ch4: %d/%d checks passed" % (PASS, PASS))
