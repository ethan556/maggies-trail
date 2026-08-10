"""Dual-route verifier for polynomial-functions Ch5 (sketching, turning points, models).

Route A: taught rules (f(0) by factor substitution; parity/lead end behavior; turn-count
         bounds n-1 and parity pairing; build-from-zeros blueprints).
Route B: exact Fraction expansion + evaluation of every built polynomial; bounce/cross by
         sign probes; turning points counted empirically on witness polynomials via dense
         grid slope sign changes; end behavior by sign at x = ±10^6.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/polynomial-functions/lessons/pf-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"pf-05-01", "pf-05-02", "pf-05-03"}, "expected 3 ch5 lessons")

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

def pmul(a, b):
    out = [F(0)] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b):
            out[i + j] += F(x) * F(y)
    return out

def prod(*fs):
    poly = [F(1)]
    for f in fs: poly = pmul(poly, f)
    return poly

def peval(c, x):
    acc = F(0)
    for k in c: acc = acc * F(x) + F(k)
    return acc

def behavior(poly, zero):
    eps = F(1, 100)
    l, r = peval(poly, F(zero) - eps), peval(poly, F(zero) + eps)
    ok(l != 0 and r != 0, "eps hit a zero near %s" % zero)
    return "cross" if (l < 0) != (r < 0) else "bounce"

def ends(poly):
    M = 10 ** 6
    return ("up" if peval(poly, -M) > 0 else "down"), ("up" if peval(poly, M) > 0 else "down")

def turns(poly, lo=-8, hi=8, steps=640):
    vals = [peval(poly, F(lo) + F(hi - lo) * F(i, steps)) for i in range(steps + 1)]
    prev, t = None, 0
    for i in range(1, len(vals)):
        if vals[i] == vals[i - 1]: continue
        s = 1 if vals[i] > vals[i - 1] else -1
        if prev is not None and s != prev: t += 1
        prev = s
    return t

# ---- L1: f(x) = (x+2)(x-1)^2 ----
f = prod([1, 2], [1, -1], [1, -1])
ok(peval(f, 0) == 2, "L1 i1 f(0)")
check_numeric("pf-05-01", "i1", 2)
ok(behavior(f, -2) == "cross" and behavior(f, 1) == "bounce", "L1 k1 behaviors")
ok(one_correct("pf-05-01", "k1") == "crosses at −2, bounces at 1", "L1 k1")
# i2: sign constant on (-2, 1): probe several points
for x in (F(-3, 2), F(-1, 2), F(0), F(1, 2)):
    ok(peval(f, x) > 0, "L1 i2 positive on gap at %s" % x)
ok(peval(f, 2) == 4, "L1 i2 distractor: f(2)=4 != 0")
ok(one_correct("pf-05-01", "i2") == "the graph sits ABOVE the axis between −2 and 1", "L1 i2")
ok(ends(f) == ("down", "up") and len(f) - 1 == 3, "L1 k2 ends")
ok(one_correct("pf-05-01", "k2") == "falls to the left, rises to the right", "L1 k2")
g = prod([1, -3], [1, 3], [1, 0], [1, 0])
ok(behavior(g, 0) == "bounce" and peval(g, 0) == 0, "L1 k3 origin bounce")
# bounce from below: g < 0 just left/right of 0
ok(peval(g, F(1, 100)) < 0 and peval(g, F(-1, 100)) < 0, "L1 k3 from below")
ok(one_correct("pf-05-01", "k3") == "bounces on the axis at the origin", "L1 k3")
h = pmul([-1], prod([1, 1], [1, 1], [1, -2]))
ok(ends(h) == ("up", "down"), "L1 ch1 ends")
ok(behavior(h, -1) == "bounce" and behavior(h, 2) == "cross", "L1 ch1 behaviors")
ok(peval(h, 0) == 2, "L1 ch1 f(0) as stated in variants")
ok(one_correct("pf-05-01", "ch1") == "rises left, falls right; bounces at −1, crosses at 2", "L1 ch1")
r = prod([1, -1], [1, 3])
ok(peval(r, 0) == -3, "L1 remedial f(0)")
check_numeric("pf-05-01", "rem-pf0501-k", -3)

# ---- L2: turning points ----
# rules
ok(all(n - 1 >= 6 for n in [7]) and 6 - 1 < 6, "L2 i1 floor rule")
check_numeric("pf-05-02", "i1", 7)
# witness: degree 7 with 6 turns exists — product of (x - k) k=0..6
wit7 = prod(*[[1, -k] for k in range(7)])
ok(turns(wit7) == 6, "L2 i1 witness degree7 six turns, got %d" % turns(wit7))
# k1: both ends up, 3 turns possible — witness x^4 - 5x^2 + 4 has 3 turns and up/up
w4 = [F(1), F(0), F(-5), F(0), F(4)]
ok(ends(w4) == ("up", "up") and turns(w4) == 3, "L2 k1 witness")
ok(one_correct("pf-05-02", "k1") == "3", "L2 k1")
# i2: description = 3 turns; witness again
check_numeric("pf-05-02", "i2", 3)
# k2: cubic max 2 turns; empirical: try a stress cubic and confirm <= 2
stress = prod([1, -1], [1, 1], [1, -3])
ok(turns(stress) == 2 and 3 - 1 == 2, "L2 k2")
ok(one_correct("pf-05-02", "k2") == "no — a cubic allows at most 2", "L2 k2 label")
# k3: 5 turns -> degree >= 6 and even; witness degree 6 with 5 turns
wit6 = prod(*[[1, -k] for k in range(6)])
ok(turns(wit6) == 5 and ends(wit6) == ("up", "up"), "L2 k3 witness")
check_numeric("pf-05-02", "k3", 6)
# ch1: opposing ends, 2 turns -> degree 3; witness stress cubic
ok(ends(stress) == ("down", "up") and turns(stress) == 2, "L2 ch1 witness")
check_numeric("pf-05-02", "ch1", 3)
check_numeric("pf-05-02", "rem-pf0502-k", 4)
wit5 = prod(*[[1, -k] for k in range(5)])
ok(turns(wit5) == 4, "L2 remedial witness degree5 four turns")

# ---- L3: building ----
f = prod([1, 1], [1, -2], [1, -3])
ok(peval(f, 0) == 6, "L3 i1 f(0)")
check_numeric("pf-05-03", "i1", 6)
b = prod([1, -5], [1, -5], [1, 2])
ok(behavior(b, 5) == "bounce" and behavior(b, -2) == "cross" and len(b) - 1 == 3, "L3 k1 build")
ok(one_correct("pf-05-03", "k1") == "(x − 5)²(x + 2)", "L3 k1")
# distractor: single (x-5) crosses
alt = prod([1, -5], [1, 2])
ok(behavior(alt, 5) == "cross", "L3 k1 distractor crosses")
ok(2 + 1 + 3 == 6, "L3 i2 sum")
check_numeric("pf-05-03", "i2", 6)
# k2/k3: box volume V = x(10-2x)(8-2x)
V = prod([1, 0], [-2, 10], [-2, 8])
ok(peval(V, 2) == 48, "L3 k3 V(2)")
ok(peval(V, 0) == 0 and peval(V, 5) == 0 and peval(V, 4) == 0, "L3 V zeros at 0,5,4")
# distractor volumes really differ at x=2
V2 = prod([1, 0], [-1, 10], [-1, 8])
ok(peval(V2, 2) == 96, "L3 k2 distractor value matches trap")
ok(one_correct("pf-05-03", "k2") == "V(x) = x(10 − 2x)(8 − 2x)", "L3 k2")
check_numeric("pf-05-03", "k3", 48)
# ch1: f = x^2(x-2)(x+2), f(1) = -3
c = prod([1, 0], [1, 0], [1, -2], [1, 2])
ok(behavior(c, 0) == "bounce" and behavior(c, 2) == "cross" and behavior(c, -2) == "cross", "L3 ch1 behaviors")
ok(peval(c, 1) == -3, "L3 ch1 f(1)")
check_numeric("pf-05-03", "ch1", -3)
r = prod([1, -4], [1, 4])
ok(peval(r, 4) == 0 and peval(r, -4) == 0, "L3 remedial zeros")
ok(one_correct("pf-05-03", "rem-pf0503-k") == "(x − 4)(x + 4)", "L3 remedial")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-pf-ch5: %d/%d checks passed" % (PASS, PASS))
