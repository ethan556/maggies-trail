"""Dual-route verifier for radical-functions Ch1 (rational exponents with variables).

Route A: taught rules (m/n conversion; add/subtract/multiply fraction exponents; roots
         divide exponents), computed with exact Fractions.
Route B: numeric substitution — every simplification identity checked at many positive
         sample values via Fraction-exact powers where possible, high-precision floats
         (relative tolerance 1e-12) where fractional exponents force it.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/radical-functions/lessons/re-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"re-01-01", "re-01-02", "re-01-03"}, "expected 3 ch1 lessons")

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

SAMPLES = [0.5, 1.0, 1.7, 2.0, 3.25, 5.0, 9.0]

def identity(fL, fR, msg):
    for x in SAMPLES:
        ok(close(fL(x), fR(x)), "%s at x=%s: %s vs %s" % (msg, x, fL(x), fR(x)))

# ---- L1: conversions ----
# i1: cbrt(x^5) == x^(5/3)
identity(lambda x: (x ** 5) ** (1.0 / 3), lambda x: x ** (5.0 / 3), "L1 i1")
ok(one_correct("re-01-01", "i1") == "x^(5/3)", "L1 i1 label")
# distractor 3/5 differs (witness x=2)
ok(not close(2 ** (5.0 / 3), 2 ** (3.0 / 5)), "L1 i1 distractor differs")
identity(lambda x: x ** (2.0 / 7), lambda x: (x ** 2) ** (1.0 / 7), "L1 k1")
ok(one_correct("re-01-01", "k1") == "⁷√(x²)", "L1 k1 label")
# i2: 16^(3/2) two routes: root-then-power and power-then-root
ok((16 ** 0.5) ** 3 == 64 and close((16 ** 3) ** 0.5, 64), "L1 i2 dual")
ok((16 ** 0.25) ** 3 == 8, "L1 i2 trap 8 = fourth-root path")
check_numeric("re-01-01", "i2", 64)
identity(lambda x: (x ** 5) ** 0.5, lambda x: x ** 2.5, "L1 k2")
ok(one_correct("re-01-01", "k2") == "x^(5/2)", "L1 k2 label")
identity(lambda x: x ** 0.25, lambda x: (x ** 0.25), "L1 k3 trivial")
ok(one_correct("re-01-01", "k3") == "⁴√x", "L1 k3 label")
# distractor sqrt(x^4)=x^2 differs from x^(1/4) at x=2
ok(not close((2 ** 4) ** 0.5, 2 ** 0.25), "L1 k3 distractor differs")
ok((27 ** (1 / 3)) ** 4 - 81 < 1e-9 and round((27 ** (1 / 3))) ** 4 == 81, "L1 ch1")
ok(27 * F(4, 3) == 36, "L1 ch1 trap 36 = base-times-exponent path")
check_numeric("re-01-01", "ch1", 81)
identity(lambda x: x ** 0.75, lambda x: (x ** 3) ** 0.25, "L1 remedial")
ok(one_correct("re-01-01", "rem-re0101-k") == "⁴√(x³)", "L1 remedial label")

# ---- L2: rules ----
# every rule checked with Fraction arithmetic AND numeric identity
ok(F(1, 2) + F(3, 2) == 2, "L2 i1 fraction")
identity(lambda x: x ** 0.5 * x ** 1.5, lambda x: x ** 2, "L2 i1")
ok(F(3, 2) - F(1, 2) == 1, "L2 i1 trap 1 = subtract path")
check_numeric("re-01-02", "i1", 2)
ok(8 * F(3, 4) == 6, "L2 k1 fraction")
identity(lambda x: (x ** 8) ** 0.75, lambda x: x ** 6, "L2 k1")
check_numeric("re-01-02", "k1", 6)
ok(F(5, 2) - F(1, 2) == 2, "L2 i2 fraction")
identity(lambda x: x ** 2.5 / x ** 0.5, lambda x: x ** 2, "L2 i2")
check_numeric("re-01-02", "i2", 2)
ok(F(3, 5) * F(5, 3) == 1, "L2 k2 fraction")
identity(lambda x: (x ** 0.6) ** (5.0 / 3), lambda x: x, "L2 k2")
ok(one_correct("re-01-02", "k2") == "x", "L2 k2 label")
ok(F(3, 5) ** 2 == F(9, 25), "L2 k2 distractor = squared-exponent path")
ok(F(1, 3) + F(1, 6) == F(1, 2), "L2 k3 fraction")
identity(lambda x: x ** (1.0 / 3) * x ** (1.0 / 6), lambda x: x ** 0.5, "L2 k3")
ok(one_correct("re-01-02", "k3") == "x^(1/2)", "L2 k3 label")
ok((F(1, 2) + F(5, 2)) * 2 == 6, "L2 ch1 fraction")
identity(lambda x: (x ** 0.5 * x ** 2.5) ** 2, lambda x: x ** 6, "L2 ch1")
ok((F(1, 2) + F(5, 2)) ** 2 == 9, "L2 ch1 trap 9 = squared path")
check_numeric("re-01-02", "ch1", 6)
ok(F(1, 4) + F(1, 4) == F(1, 2), "L2 remedial fraction")
check_numeric("re-01-02", "rem-re0102-k", 2)

# ---- L3: variable radicals ----
ok(F(10, 2) == 5, "L3 i1 fraction")
identity(lambda x: (x ** 10) ** 0.5, lambda x: x ** 5, "L3 i1")
check_numeric("re-01-03", "i1", 5)
# k1: sqrt(18 x^6) == 3 x^3 sqrt(2)
identity(lambda x: (18 * x ** 6) ** 0.5, lambda x: 3 * x ** 3 * 2 ** 0.5, "L3 k1")
ok(one_correct("re-01-03", "k1") == "3x³√2", "L3 k1 label")
# distractors differ at x=2
for alt in (lambda x: 9 * x ** 3 * 2 ** 0.5, lambda x: 3 * x ** 4 * 2 ** 0.5, lambda x: 3 * x ** 3 * (2 * x) ** 0.5):
    ok(not close((18 * 2 ** 6) ** 0.5, alt(2)), "L3 k1 distractor differs")
identity(lambda x: (8 * x ** 9) ** (1.0 / 3), lambda x: 2 * x ** 3, "L3 i2")
ok(one_correct("re-01-03", "i2") == "2x³", "L3 i2 label")
identity(lambda x: (x ** 7) ** 0.5, lambda x: x ** 3 * x ** 0.5, "L3 k2")
ok(one_correct("re-01-03", "k2") == "x³√x", "L3 k2 label")
# two-variable: sqrt(x^4 y^2) == x^2 y at grid of positives
for x in SAMPLES:
    for y in SAMPLES:
        ok(close((x ** 4 * y ** 2) ** 0.5, x ** 2 * y), "L3 k3 x=%s y=%s" % (x, y))
ok(one_correct("re-01-03", "k3") == "x²y", "L3 k3 label")
identity(lambda x: (72 * x ** 5) ** 0.5, lambda x: 6 * x ** 2 * (2 * x) ** 0.5, "L3 ch1")
ok(one_correct("re-01-03", "ch1") == "6x²√(2x)", "L3 ch1 label")
for alt in (lambda x: 36 * x ** 2 * (2 * x) ** 0.5, lambda x: 6 * x ** 4 * (2 * x) ** 0.5):
    ok(not close((72 * 2 ** 5) ** 0.5, alt(2)), "L3 ch1 distractor differs")
identity(lambda x: (x ** 4) ** 0.5, lambda x: x ** 2, "L3 remedial")
ok(one_correct("re-01-03", "rem-re0103-k") == "x²", "L3 remedial label")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-re-ch1: %d/%d checks passed" % (PASS, PASS))
