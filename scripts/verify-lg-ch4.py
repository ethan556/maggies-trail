"""Dual-route verifier for logarithms Ch4 (the number e, natural log, solving with e and ln).

Route A: exact/limit arithmetic — compounding rungs computed with Fractions; every
         ln/e claim verified via math.exp/math.log round trips (rel tol 1e-12).
Route B: independent solves — every equation's claimed solution substituted into the
         ORIGINAL; monotone-limit facts checked across a frequency sweep; given-decimal
         approximations re-derived and rounding confirmed.
"""
import json, glob, sys, math
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/logarithms/lessons/lg-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"lg-04-01", "lg-04-02", "lg-04-03"}, "expected 3 ch4 lessons")

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

# ---- L1: the number e ----
# compounding rungs, exact Fractions
ok(F(3, 2) ** 2 == F(9, 4) and float(F(9, 4)) == 2.25, "L1 rung n=2")
ok(round(float(F(5, 4) ** 4), 2) == 2.44, "L1 rung n=4")
ok(round((1 + 1 / 12) ** 12, 3) == 2.613, "L1 rung n=12")
ok(round((1 + 1 / 365) ** 365, 4) == 2.7146, "L1 rung n=365")
check_numeric("lg-04-01", "i1", 2.44)
# monotone increasing toward e, never exceeding
prev = 0.0
for n in (1, 2, 4, 12, 365, 10000, 10 ** 6):
    v = (1 + 1 / n) ** n
    ok(v > prev and v < math.e, "L1 limit sweep n=%d" % n)
    prev = v
ok(math.e - (1 + 1 / 10 ** 6) ** 10 ** 6 < 1e-4, "L1 limit approaches e")
# k1: 2^x < e^x < 3^x for positive x
for x in (0.5, 1, 2, 5):
    ok(2 ** x < math.e ** x < 3 ** x, "L1 k1 sandwich x=%s" % x)
ok(one_correct("lg-04-01", "k1") == "between them: faster than 2ˣ, slower than 3ˣ", "L1 k1 label")
ok(math.e ** 0 == 1, "L1 i2")
check_numeric("lg-04-01", "i2", 1)
# k2: 5e^-x decays; base 1/e < 1
ok(1 / math.e < 1, "L1 k2 base")
ok(5 * math.exp(-1) < 5 * math.exp(0), "L1 k2 decreasing witness")
ok(one_correct("lg-04-01", "k2") == "decay — the base is effectively 1/e < 1", "L1 k2 label")
ok(round(math.e ** 2, 1) == 7.4 and round(2.718 ** 2, 2) == 7.39, "L1 k3")
check_numeric("lg-04-01", "k3", 7.4)
# ch1: A(4) = 100 e^2 ~ 739
ok(round(100 * math.exp(0.5 * 4)) == 739 and round(100 * 7.389) == 739, "L1 ch1")
check_numeric("lg-04-01", "ch1", 739)
ok(round(math.e, 3) == 2.718, "L1 remedial: e^1 to 3 decimals")
check_numeric("lg-04-01", "rem-lg0401-k", 2.718)

# ---- L2: natural log ----
ok(close(math.log(math.e ** 7), 7), "L2 i1")
check_numeric("lg-04-02", "i1", 7)
ok(close(math.exp(math.log(5)), 5), "L2 k1 round trip")
check_numeric("lg-04-02", "k1", 5)
ok(round(math.log(5), 3) == 1.609 and round(math.e ** 5) == 148, "L2 k1 trap values")
# properties as identities
for a in (0.5, 1.3, 2, 7):
    for b in (0.4, 1.0, 3, 9):
        ok(close(math.log(a * b), math.log(a) + math.log(b)), "L2 product identity")
        ok(close(math.log(a / b), math.log(a) - math.log(b)), "L2 quotient identity")
    for n in (2, 3, 0.5):
        ok(close(math.log(a ** n), n * math.log(a)), "L2 power identity")
ok(one_correct("lg-04-02", "i2") == "3 ln x", "L2 i2")
ok(one_correct("lg-04-02", "k2") == "ln 5 + ln x − ln y", "L2 k2")
ok(round(3 * 0.693, 3) == 2.079 and round(math.log(8), 3) == 2.079, "L2 k3")
check_numeric("lg-04-02", "k3", 2.079)
ok(close(math.log(math.e ** 3 * math.e ** 4), 7), "L2 ch1")
check_numeric("lg-04-02", "ch1", 7)
ok(close(math.log(math.e), 1), "L2 remedial")
check_numeric("lg-04-02", "rem-lg0402-k", 1)

# ---- L3: solving with e and ln ----
ok(close(math.e ** math.log(42), 42), "L3 i1: ln 42 solves e^x = 42")
ok(one_correct("lg-04-03", "i1") == "take ln of both sides: x = ln 42", "L3 i1 label")
# k1: 3e^x = 15 -> x = ln 5
x1 = math.log(5)
ok(close(3 * math.e ** x1, 15) and round(x1, 3) == 1.609, "L3 k1")
ok(round(math.log(15), 3) == 2.708, "L3 k1 trap = ln 15 (unisolated)")
check_numeric("lg-04-03", "k1", 1.609)
# i2/k2 exact solves
ok(close(math.log(math.e ** 3), 3), "L3 i2: e^3 solves ln x = 3")
ok(one_correct("lg-04-03", "i2") == "x = e³", "L3 i2 label")
ok(close(2 * math.log(math.e ** 4), 8), "L3 k2: e^4 solves 2 ln x = 8")
ok(one_correct("lg-04-03", "k2") == "x = e⁴", "L3 k2 label")
# k3: ln(x+5) = 0 -> x = -4, inside positive
ok(close(math.log(-4 + 5), 0) and -4 + 5 == 1 > 0, "L3 k3")
ok(one_correct("lg-04-03", "k3") == "x = −4 — and it's valid, since x + 5 = 1 > 0", "L3 k3 label")
# ch1: 5e^(2x) = 20 -> x = (ln 4)/2 = ln 2
xc = math.log(2)
ok(close(5 * math.e ** (2 * xc), 20) and round(xc, 3) == 0.693, "L3 ch1")
ok(round(math.log(4), 3) == 1.386 and round(math.log(20), 3) == 2.996, "L3 ch1 trap values")
check_numeric("lg-04-03", "ch1", 0.693)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-lg-ch4: %d/%d checks passed" % (PASS, PASS))
