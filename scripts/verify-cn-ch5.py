"""Dual-route verifier for complex-numbers Ch5 (roots & methods).

Route A: Vieta's formulas (sum=-b, product=c) and the a±bi shortcuts (2a, a²+b²).
Route B: direct complex arithmetic on the roots, and substitution of claimed roots
         into every built/solved quadratic.
"""
import json, glob, sys, cmath

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/complex-numbers/lessons/cn-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"cn-05-01", "cn-05-02", "cn-05-03"}, "expected 3 ch5 lessons")

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

def vieta(b, c):
    # Route A: sum=-b, product=c. Route B: solve with cmath and combine roots directly.
    D = b * b - 4 * c
    s = cmath.sqrt(D)
    r1, r2 = (-b + s) / 2, (-b - s) / 2
    ok(abs((r1 + r2) - (-b)) < 1e-9, "vieta sum mismatch b=%s" % b)
    ok(abs((r1 * r2) - c) < 1e-9, "vieta product mismatch c=%s" % c)
    return -b, c

def pair(a, b):
    # a ± bi: Route A shortcuts vs Route B arithmetic
    z1, z2 = complex(a, b), complex(a, -b)
    sA, pA = 2 * a, a * a + b * b
    ok(z1 + z2 == sA and z1 * z2 == pA, "pair shortcuts mismatch %s±%si" % (a, b))
    return sA, pA

# ---- L1 ----
s, p = vieta(-4, 13)
ok(s == 4 and p == 13, "L1 vieta 4/13")
sp = pair(2, 3)
ok(sp == (4, 13), "L1 pair 2±3i")
check_numeric("cn-05-01", "i1", 4)
check_numeric("cn-05-01", "k1", 13)
ok(pair(5, 2) == (10, 29), "L1 5±2i")
check_numeric("cn-05-01", "i2", 10)
check_numeric("cn-05-01", "k2", 29)
ok(pair(1, 4)[1] == 17, "L1 1±4i product")
check_numeric("cn-05-01", "k3", 17)
# ch1: roots 3±i -> b = -sum = -6; Route B: expand (x-(3+i))(x-(3-i)) and read coefficient
z1, z2 = complex(3, 1), complex(3, -1)
ok(z1 + z2 == 6, "L1 ch1 sum")
# coefficient check: for x^2+bx+c with those roots, b=-(z1+z2)
ok(-(z1 + z2).real == -6, "L1 ch1 b")
check_numeric("cn-05-01", "ch1", -6)
ok(pair(2, 1)[0] == 4, "L1 remedial")
check_numeric("cn-05-01", "rem-cn0501-k", 4)

# ---- L2 ----
def build(a, b):
    # monic quadratic from roots a±bi: x^2 + B x + C with B=-(2a), C=a^2+b^2
    B, C = -2 * a, a * a + b * b
    # Route B: substitute both roots
    for z in (complex(a, b), complex(a, -b)):
        ok(abs(z * z + B * z + C) < 1e-9, "build fails substitution %s±%si" % (a, b))
    return B, C

def label_of(B, C):
    mid = ("− %dx" % -B) if B < 0 else ("+ %dx" % B)
    con = ("+ %d" % C) if C >= 0 else ("− %d" % -C)
    return "x² %s %s" % (mid, con)

ok(build(3, 2) == (-6, 13), "L2 build 3±2i")
ok(one_correct("cn-05-02", "i1") == "x² − 6x + 13", "L2 i1")
ok(build(1, 5) == (-2, 26), "L2 build 1±5i")
ok(one_correct("cn-05-02", "k1") == "x² − 2x + 26", "L2 k1")
ok(pair(4, 1)[1] == 17, "L2 i2 product")
check_numeric("cn-05-02", "i2", 17)
ok(build(4, 1) == (-8, 17), "L2 build 4±i")
ok(one_correct("cn-05-02", "k2") == "x² − 8x + 17", "L2 k2")
# k3: substitution truth — (1+i)^2 - 2(1+i) + 2 == 0 exactly
z = complex(1, 1)
ok(z * z - 2 * z + 2 == 0, "L2 k3 substitution")
ok(one_correct("cn-05-02", "k3").startswith("yes — (1 + i)² = 2i"), "L2 k3 label")
ok(build(-1, 2) == (2, 5), "L2 build -1±2i")
ok(one_correct("cn-05-02", "ch1") == "x² + 2x + 5", "L2 ch1")
ok(build(1, 1) == (-2, 2), "L2 remedial build")
ok(one_correct("cn-05-02", "rem-cn0502-k") == "x² − 2x + 2", "L2 remedial")

# ---- L3 ----
# i1 dragBucket: method match — verify each equation's claimed shape properties
w = widget("cn-05-03", "i1")
ok(len(w["items"]) == 4 and len({b["id"] for b in w["buckets"]}) == 4, "L3 i1 shape")
BID = {i["id"]: i["bucketId"] for i in w["items"]}
ok(BID == {"m1": "sq", "m2": "fac", "m3": "cts", "m4": "form"}, "L3 i1 assignments")
# m1: x^2-16 truly has no x term and integer roots ±4
ok(all(x * x - 16 == 0 for x in (4, -4)), "L3 m1 roots")
# m2: x^2+5x+6 factors over integers: roots -2,-3
ok(all(x * x + 5 * x + 6 == 0 for x in (-2, -3)), "L3 m2 roots")
# m3: x^2+6x-1 has NO integer roots (so factoring is out) but even b
ok(all(x * x + 6 * x - 1 != 0 for x in range(-30, 31)), "L3 m3 no integer roots")
ok(6 % 2 == 0, "L3 m3 even b")
# m4: 3x^2-2x+7: a!=1 and D<0
ok((-2) ** 2 - 4 * 3 * 7 < 0, "L3 m4 D")
# k1: x^2+10x+29 -> -5±2i; dual route: CTS algebra vs formula oracle
D = 100 - 4 * 29
s = cmath.sqrt(D)
r = (-10 + s) / 2
ok(r == complex(-5, 2), "L3 k1 oracle root %s" % r)
ok(abs(complex(-5, 2) ** 2 + 10 * complex(-5, 2) + 29) < 1e-9, "L3 k1 substitution")
check_numeric("cn-05-03", "k1", 2)
# i2: x^2-2x-15 roots 5,-3 (real)
ok(all(x * x - 2 * x - 15 == 0 for x in (5, -3)), "L3 i2 roots")
ok(one_correct("cn-05-03", "i2") == "x = 5 or x = −3", "L3 i2 label")
ok((-2) ** 2 - 4 * (-15) > 0, "L3 i2 D positive (distractor 1±4i is impossible)")
# k2: (x-3)^2=49 -> 10 and -4; brute route
roots = [x for x in range(-60, 61) if (x - 3) ** 2 == 49]
ok(roots == [-4, 10], "L3 k2 brute roots")
check_numeric("cn-05-03", "k2", 10)
one_correct("cn-05-03", "k3")
# ch1: 2x^2-4x+10 -> 1±2i; substitution into the ORIGINAL (undivided) equation
for z in (complex(1, 2), complex(1, -2)):
    ok(abs(2 * z * z - 4 * z + 10) < 1e-9, "L3 ch1 substitution %s" % z)
ok(one_correct("cn-05-03", "ch1") == "x = 1 ± 2i", "L3 ch1 label")
ok(one_correct("cn-05-03", "rem-cn0503-k") == "square roots", "L3 remedial")
ok(all(x * x == 81 for x in (9, -9)), "L3 remedial roots")

for lid, d in L.items():
    for s2 in d["steps"]:
        if s2["kind"] == "challenge":
            ok(len(s2["hints"]) == 3, lid + " hints")
        w2 = s2.get("widget")
        if w2 and w2["type"] == "mcq":
            ok(sum(1 for o in w2["options"] if o.get("correct")) == 1, lid + "/" + s2["id"] + " mcq")
        if w2 and w2["type"] == "dragBucket":
            for it in w2["items"]:
                ok(it["bucketId"] in {b["id"] for b in w2["buckets"]}, lid + " bucket ref")

print("verify-cn-ch5: %d/%d checks passed" % (PASS, PASS))
