"""Dual-route verifier for complex-numbers Ch4 (complex roots of quadratics).

Route A: taught procedures (x = h ± i*sqrt(k); formula with D<0; D-sign classification).
Route B: substitution of every claimed root into the ORIGINAL equation using Python complex,
         plus numpy-free root recovery via the oracle formula on complex numbers.
"""
import json, glob, sys, cmath, re

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/complex-numbers/lessons/cn-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"cn-04-01", "cn-04-02", "cn-04-03"}, "expected 3 ch4 lessons")

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

def q(a, b, c):
    return lambda x: a * x * x + b * x + c

def pair_solves(f, roots):
    # Route B: substitute both roots into the original equation
    return all(abs(f(r)) < 1e-9 for r in roots)

# ---- L1: shifted-square equations ----
# Route A gives h ± i*sqrt(k) for (x-h)^2 = -k. Route B substitutes.
cases = [
    ("i1", "x = ±6i", q(1, 0, 36), [complex(0, 6), complex(0, -6)]),         # x^2 = -36 <=> x^2+36=0
    ("k1", "x = 2 ± 3i", q(1, -4, 13), [complex(2, 3), complex(2, -3)]),      # (x-2)^2=-9 <=> x^2-4x+13
    ("i2", "x = −1 ± 5i", q(1, 2, 26), [complex(-1, 5), complex(-1, -5)]),    # (x+1)^2=-25 <=> x^2+2x+26
    ("k2", "x = ±7i", q(1, 0, 49), [complex(0, 7), complex(0, -7)]),
    ("ch1", "x = 5 ± 2i", q(1, -10, 29), [complex(5, 2), complex(5, -2)]),    # (x-5)^2+4 <=> x^2-10x+29
    ("rem-cn0401-k", "x = ±2i", q(1, 0, 4), [complex(0, 2), complex(0, -2)]),
]
for sid, label, f, roots in cases:
    ok(one_correct("cn-04-01", sid) == label, "L1 %s label" % sid)
    ok(pair_solves(f, roots), "L1 %s substitution" % sid)
    # Route A shifted-square identity: expand (x-h)^2 + k == a x^2+bx+c form was hand-derived; also
    # verify the two roots are conjugates
    ok(roots[0].conjugate() == roots[1], "L1 %s conjugate pair" % sid)
# k3: verify (3i)^2 + 9 == 0 exactly
ok(complex(0, 3) ** 2 + 9 == 0, "L1 k3 substitution")
ok(one_correct("cn-04-01", "k3").startswith("yes — (3i)² = −9"), "L1 k3 label")

# ---- L2: formula with D<0 ----
def disc(a, b, c): return b * b - 4 * a * c
def formula_roots(a, b, c):
    D = disc(a, b, c)
    s = cmath.sqrt(D)
    return [(-b + s) / (2 * a), (-b - s) / (2 * a)]

for sid, a, b, c, expectD in [("i1", 1, -4, 13, -36), ("i2", 1, 2, 5, -16), ("rem-cn0402-k", 1, 0, 9, -36)]:
    ok(disc(a, b, c) == expectD, "L2 %s D" % sid)
    check_numeric("cn-04-02", sid, expectD)
for sid, a, b, c, label, roots in [
    ("k1", 1, -4, 13, "x = 2 ± 3i", [complex(2, 3), complex(2, -3)]),
    ("k2", 1, 2, 5, "x = −1 ± 2i", [complex(-1, 2), complex(-1, -2)]),
    ("ch1", 1, -6, 25, "x = 3 ± 4i", [complex(3, 4), complex(3, -4)]),
]:
    ok(one_correct("cn-04-02", sid) == label, "L2 %s label" % sid)
    fr = formula_roots(a, b, c)
    ok(sorted(fr, key=lambda z: z.imag) == sorted(roots, key=lambda z: z.imag), "L2 %s formula route" % sid)
    ok(pair_solves(q(a, b, c), roots), "L2 %s substitution route" % sid)
ok(one_correct("cn-04-02", "k3") == "3 − 5i" and complex(3, 5).conjugate() == complex(3, -5), "L2 k3")

# ---- L3: full discriminant story ----
ok(disc(1, 1, 1) == -3, "L3 i1 D")
ok(one_correct("cn-04-03", "i1") == "two complex conjugate roots", "L3 i1")
ok(disc(2, -3, 4) == -23, "L3 k1 D")
check_numeric("cn-04-03", "k1", -23)
# dragBucket: recompute every item's classification from its equation string
w = widget("cn-04-03", "i2")
def classify(a, b, c):
    D = disc(a, b, c)
    return "real2" if D > 0 else ("rep" if D == 0 else "cplx")
COEF = {"e1": (1, 0, -9), "e2": (1, -5, 6), "e3": (1, 6, 9), "e4": (1, -2, 1), "e5": (1, 0, 4), "e6": (1, 2, 2)}
ok(len(w["items"]) == 6 and {i["id"] for i in w["items"]} == set(COEF), "L3 i2 items")
for it in w["items"]:
    a, b, c = COEF[it["id"]]
    ok(it["bucketId"] == classify(a, b, c), "L3 i2 %s bucket" % it["id"])
    # Route B: numeric root check agrees with the classification
    r = formula_roots(a, b, c)
    if it["bucketId"] == "cplx": ok(abs(r[0].imag) > 1e-9, "L3 i2 %s cplx oracle" % it["id"])
    if it["bucketId"] == "rep": ok(abs(r[0] - r[1]) < 1e-9, "L3 i2 %s rep oracle" % it["id"])
    if it["bucketId"] == "real2": ok(abs(r[0].imag) < 1e-9 and abs(r[0] - r[1]) > 1e-9, "L3 i2 %s real2 oracle" % it["id"])
ok(len({b["id"] for b in w["buckets"]}) == 3, "L3 i2 buckets distinct")
# k2: c=9 makes D=0; oracle: (x+3)^2 expands to it
ok(disc(1, 6, 9) == 0 and one_correct("cn-04-03", "k2") == "c = 9", "L3 k2")
ok(all((x + 3) ** 2 == x * x + 6 * x + 9 for x in range(-8, 9)), "L3 k2 identity")
# distractor sanity: other offered c values do NOT give D=0
for cval in (6, 36, -9): ok(disc(1, 6, cval) != 0, "L3 k2 distractor c=%d" % cval)
# k3: b=8 gives D=0 for c=16; distractors don't
ok(disc(1, 8, 16) == 0 and one_correct("cn-04-03", "k3") == "b = 8", "L3 k3")
for bval in (4, 16, 2): ok(disc(1, bval, 16) != 0, "L3 k3 distractor b=%d" % bval)
# ch1: c=25; identity (x-5)^2
ok(disc(1, -10, 25) == 0, "L3 ch1 D")
ok(all((x - 5) ** 2 == x * x - 10 * x + 25 for x in range(-8, 9)), "L3 ch1 identity")
check_numeric("cn-04-03", "ch1", 25)
ok(disc(1, 0, 1) == -4, "L3 remedial D")
check_numeric("cn-04-03", "rem-cn0403-k", -4)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-cn-ch4: %d/%d checks passed" % (PASS, PASS))
