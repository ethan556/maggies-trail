"""Dual-route verifier for polynomial-functions Ch4 (GCF/quadratic form, grouping, cubes).

Route A: every claimed factorization expanded via exact Fraction polynomial multiplication
         and compared coefficient-wise to the original.
Route B: 25-point sample sweeps; real-zero counts via integer sweeps plus discriminant sign
         on quadratic partners; distractor factorizations proven to expand DIFFERENTLY.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/polynomial-functions/lessons/pf-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"pf-04-01", "pf-04-02", "pf-04-03"}, "expected 3 ch4 lessons")

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

def eq(a, b):
    a = [F(x) for x in a]; b = [F(x) for x in b]
    while len(a) < len(b): a = [F(0)] + a
    while len(b) < len(a): b = [F(0)] + b
    return a == b

def dual_factor(original, factors, msg):
    # Route A: coefficient-wise expansion
    built = prod(*factors)
    ok(eq(built, original), msg + " expansion")
    # Route B: 25-point sweep
    for x in range(-12, 13):
        want = peval(original, x)
        got = F(1)
        for f in factors: got *= peval(f, x)
        ok(want == got, msg + " sample x=%d" % x)

def real_zero_count(poly, lo=-30, hi=30):
    return sorted(x for x in range(lo, hi + 1) if peval(poly, x) == 0)

def disc(a, b, c): return b * b - 4 * a * c

# ---- L1: GCF & quadratic form ----
f = [1, 0, -5, 0, 4]  # x^4 - 5x^2 + 4
dual_factor(f, ([1, 0, -4], [1, 0, -1]), "L1 first split")
dual_factor(f, ([1, -2], [1, 2], [1, -1], [1, 1]), "L1 full split")
ok((-4) * (-1) == 4 and (-4) + (-1) == -5, "L1 i1 pair")
one_correct("pf-04-01", "i1")
ok(real_zero_count(f) == [-2, -1, 1, 2], "L1 k1 zeros")
ok(one_correct("pf-04-01", "k1") == "±1 and ±2", "L1 k1")
g = [2, 0, -8, 0]  # 2x^3 - 8x
dual_factor(g, ([2, 0], [1, -2], [1, 2]), "L1 i2")
ok(one_correct("pf-04-01", "i2") == "2x(x − 2)(x + 2)", "L1 i2 label")
ok(real_zero_count(g) == [-2, 0, 2], "L1 k2 zeros")
ok(peval(g, 8) != 0, "L1 k2 distractor 8 not a zero")
ok(one_correct("pf-04-01", "k2") == "0, 2, and −2", "L1 k2 label")
h = [1, 0, -10, 0, 9]
dual_factor(h, ([1, -1], [1, 1], [1, -3], [1, 3]), "L1 k3")
ok((-1) * (-9) == 9 and (-1) + (-9) == -10, "L1 k3 pair")
ok(one_correct("pf-04-01", "k3") == "(x − 1)(x + 1)(x − 3)(x + 3)", "L1 k3 label")
q5 = [3, 0, -15, 0, 12, 0]  # 3x^5 - 15x^3 + 12x
dual_factor(q5, ([3, 0], [1, -1], [1, 1], [1, -2], [1, 2]), "L1 ch1")
ok(len(real_zero_count(q5)) == 5, "L1 ch1 five zeros")
check_numeric("pf-04-01", "ch1", 5)
r = [1, 0, -3, 0, 2]
dual_factor(r, ([1, 0, -1], [1, 0, -2]), "L1 remedial")
ok((-1) * (-2) == 2 and (-1) + (-2) == -3, "L1 remedial pair")
ok(one_correct("pf-04-01", "rem-pf0401-k") == "(x² − 1)(x² − 2)", "L1 remedial label")

# ---- L2: grouping ----
f = [1, 3, 2, 6]  # x^3+3x^2+2x+6
dual_factor(f, ([1, 3], [1, 0, 2]), "L2 headline")
ok(real_zero_count(f) == [-3], "L2 k1 one real zero")
ok(disc(1, 0, 2) < 0, "L2 k1 partner D<0")
ok(one_correct("pf-04-02", "k1") == "one: x = −3", "L2 k1 label")
g = [1, 5, 4, 20]
dual_factor(g, ([1, 5], [1, 0, 4]), "L2 i1")
one_correct("pf-04-02", "i1")
h = [1, -2, 5, -10]
dual_factor(h, ([1, -2], [1, 0, 5]), "L2 i2")
ok(one_correct("pf-04-02", "i2") == "(x − 2)(x² + 5)", "L2 i2 label")
# i2 distractors expand differently
for alt in (prod([1, 2], [1, 0, -5]), prod([1, -2], [1, 0, -5])):
    ok(not eq(alt, h), "L2 i2 distractor differs")
one_correct("pf-04-02", "k2")
ok(eq(prod([1, 3], [1, 0, 2]), [1, 3, 2, 6]), "L2 k3 expansion")
ok(one_correct("pf-04-02", "k3") == "x³ + 3x² + 2x + 6 ✓", "L2 k3 label")
c1 = [1, -1, -4, 4]
dual_factor(c1, ([1, -1], [1, -2], [1, 2]), "L2 ch1")
ok(real_zero_count(c1) == [-2, 1, 2], "L2 ch1 zeros")
ok(one_correct("pf-04-02", "ch1") == "(x − 1)(x − 2)(x + 2)", "L2 ch1 label")
ok(not eq(prod([1, 1], [1, -2], [1, 2]), c1), "L2 ch1 distractor differs")
rm = [1, 4, 3, 12]
dual_factor(rm, ([1, 4], [1, 0, 3]), "L2 remedial")
ok(one_correct("pf-04-02", "rem-pf0402-k") == "x²(x + 4) + 3(x + 4)", "L2 remedial label")

# ---- L3: cubes ----
f = [1, 0, 0, -8]
dual_factor(f, ([1, -2], [1, 2, 4]), "L3 i1")
ok(one_correct("pf-04-03", "i1") == "(x − 2)(x² + 2x + 4)", "L3 i1 label")
for alt in (prod([1, -2], [1, -2, 4]), prod([1, -2], [1, -2], [1, -2]), prod([1, -2], [1, 0, 4])):
    ok(not eq(alt, f), "L3 i1 distractor differs")
ok(disc(1, 2, 4) == -12, "L3 c2 partner D")
g = [1, 0, 0, 27]
dual_factor(g, ([1, 3], [1, -3, 9]), "L3 k1")
ok(one_correct("pf-04-03", "k1") == "(x + 3)(x² − 3x + 9)", "L3 k1 label")
ok(disc(1, -3, 9) == -27, "L3 i2 discriminant")
check_numeric("pf-04-03", "i2", -27)
ok(real_zero_count(g) == [-3] and peval(g, 3) == 54, "L3 k2 zeros + distractor value")
ok(one_correct("pf-04-03", "k2") == "one: x = −3", "L3 k2 label")
h = [8, 0, 0, -27]
dual_factor(h, ([2, -3], [4, 6, 9]), "L3 k3")
ok(one_correct("pf-04-03", "k3") == "(2x − 3)(4x² + 6x + 9)", "L3 k3 label")
for alt in (prod([2, -3], [4, -6, 9]), prod([8, -27], [1, 1, 1]), prod([2, -3], [2, 6, 9])):
    ok(not eq(alt, h), "L3 k3 distractor differs")
c3 = [2, 0, 0, -54]
dual_factor(c3, ([2], [1, -3], [1, 3, 9]), "L3 ch1")
ok(real_zero_count(c3) == [3] and disc(1, 3, 9) < 0, "L3 ch1 unique real zero")
check_numeric("pf-04-03", "ch1", 3)
rm = [1, 0, 0, -64]
dual_factor(rm, ([1, -4], [1, 4, 16]), "L3 remedial")
ok(one_correct("pf-04-03", "rem-pf0403-k") == "(x − 4)", "L3 remedial label")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-pf-ch4: %d/%d checks passed" % (PASS, PASS))
