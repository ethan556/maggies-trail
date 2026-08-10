"""Dual-route verifier for polynomial-functions Ch3 (long + synthetic division).

Route A: my own long-division routine on Fraction coefficient lists, plus the taught
         synthetic recurrence (bring down / multiply by c / add).
Route B: multiply-back identity f == d*q + r checked coefficient-wise AND at 25 sample
         points; remainders cross-checked against f(c) by Horner substitution.
"""
import json, glob, sys
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/polynomial-functions/lessons/pf-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"pf-03-01", "pf-03-02", "pf-03-03"}, "expected 3 ch3 lessons")

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

def pmul(a, b):
    out = [F(0)] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        for j, y in enumerate(b):
            out[i + j] += F(x) * F(y)
    return out

def padd(a, b):
    a, b = a[:], b[:]
    while len(a) < len(b): a = [F(0)] + a
    while len(b) < len(a): b = [F(0)] + b
    return [x + y for x, y in zip(a, b)]

def longdiv(f, d):
    f = [F(x) for x in f]; d = [F(x) for x in d]
    q = [F(0)] * (len(f) - len(d) + 1)
    r = f[:]
    for i in range(len(q)):
        q[i] = r[i] / d[0]
        for j, dj in enumerate(d):
            r[i + j] -= q[i] * dj
    rem = r[len(q):]
    while len(rem) > 1 and rem[0] == 0: rem = rem[1:]
    return q, rem

def synthetic(coeffs, c):
    bot = [F(coeffs[0])]
    for k in coeffs[1:]:
        bot.append(F(k) + bot[-1] * c)
    return bot[:-1], bot[-1]

def dual_div(f, c):
    # Route A1: long division by (x - c); Route A2: synthetic recurrence
    qA, rA = longdiv(f, [1, -c])
    qB, rB = synthetic(f, F(c))
    ok(qA == qB and rA == [rB], "long vs synthetic disagree f=%s c=%s" % (f, c))
    # Route B1: multiply-back identity, coefficient-wise
    rebuilt = padd(pmul([1, -c], qA), [rB])
    ok(rebuilt == [F(x) for x in f] or padd(rebuilt, [F(0)]) == padd([F(x) for x in f], [F(0)]),
       "multiply-back mismatch f=%s" % f)
    # Route B2: 25 sample points
    for x in range(-12, 13):
        ok(peval(f, x) == peval([1, -c], x) * peval(qA, x) + rB, "sample mismatch x=%d" % x)
    # Route B3: remainder == f(c)
    ok(peval(f, c) == rB, "remainder != f(c)")
    return qA, rB

# ---- L1 ----
q, r = dual_div([1, 7, 12], -3)   # divide by (x+3): c = -3
ok(q == [1, 4] and r == 0, "L1 division x^2+7x+12 by x+3")
one_correct("pf-03-01", "i1")
ok(one_correct("pf-03-01", "k1") == "x + 4, remainder 0", "L1 k1")
q, r = dual_div([1, 3, 5], -1)
ok(q == [1, 2] and r == 3, "L1 i2 division")
check_numeric("pf-03-01", "i2", 3)
one_correct("pf-03-01", "k2")
ok(peval([1, 3, 5], -1) == 3, "L1 k3 f(-1)")
check_numeric("pf-03-01", "k3", 3)
q, r = dual_div([1, 4, -7], 2)
ok(q == [1, 6] and r == 5, "L1 ch1 division")
ok(one_correct("pf-03-01", "ch1") == "x + 6, remainder 5", "L1 ch1")
q, r = dual_div([1, 5, 4], -1)
ok(q == [1, 4] and r == 0, "L1 remedial division")
ok(one_correct("pf-03-01", "rem-pf0301-k") == "x + 4", "L1 remedial")

# ---- L2 ----
q, r = dual_div([1, -2, -5, 6], 1)
ok(q == [1, -1, -6] and r == 0, "L2 headline division")
ok(one_correct("pf-03-02", "i1") == "1, with coefficients 1, −2, −5, 6", "L2 i1")
ok(one_correct("pf-03-02", "k1") == "x² − x − 6", "L2 k1")
# i2/k2: x^2+6x+11 by (x-2): bottom row 1, 8, remainder 27
bot, rem = synthetic([1, 6, 11], F(2))
ok(bot == [1, 8] and rem == 27, "L2 i2/k2 row")
q, r = dual_div([1, 6, 11], 2)
ok(r == 27, "L2 k2 dual")
check_numeric("pf-03-02", "i2", 8)
check_numeric("pf-03-02", "k2", 27)
ok(peval([1, 3], -3) == 0 and one_correct("pf-03-02", "k3") == "−3", "L2 k3")
q, r = dual_div([1, -3, -4], 2)
ok(q == [1, -1] and r == -6, "L2 ch1 division")
ok(one_correct("pf-03-02", "ch1") == "quotient x − 1, remainder −6", "L2 ch1")
ok(F(1) * 3 + 4 == 7, "L2 remedial loop")
check_numeric("pf-03-02", "rem-pf0302-k", 7)

# ---- L3 ----
f = [1, -4, 1, 6]
ok(peval(f, 2) == 0, "L3 i1 zero")
ok(peval([1, -4, 1, 0], 2) == -6, "L3 i1 trap -6 = dropped constant")
check_numeric("pf-03-03", "i1", 0)
q, r = dual_div(f, 2)
ok(q == [1, -2, -3] and r == 0, "L3 c2 division")
# full factorization zeros 2, 3, -1
for z in (2, 3, -1): ok(peval(f, z) == 0, "L3 zero %d" % z)
ok(one_correct("pf-03-03", "k1") == "2, 3, and −1", "L3 k1")
f2 = [1, 0, -7, 6]
bot, rem = synthetic(f2, F(1))
ok(bot == [1, 1, -6] and rem == 0, "L3 i2 row")
check_numeric("pf-03-03", "i2", -6)
# k2: complete factorization (x-1)(x+3)(x-2) — expand and compare
built = pmul(pmul([1, -1], [1, 3]), [1, -2])
ok(built == [F(x) for x in f2], "L3 k2 expansion")
ok(one_correct("pf-03-03", "k2") == "(x − 1)(x + 3)(x − 2)", "L3 k2")
# distractor expansion really differs
alt = pmul(pmul([1, -1], [1, -3]), [1, 2])
ok(alt != [F(x) for x in f2], "L3 k2 distractor differs")
one_correct("pf-03-03", "k3")
# ch1: x^3+2x^2-3 — unique integer zero is 1; quotient discriminant negative
f3 = [1, 2, 0, -3]
zs = [x for x in range(-20, 21) if peval(f3, x) == 0]
ok(zs == [1], "L3 ch1 unique integer zero")
q, r = dual_div(f3, 1)
ok(q == [1, 3, 3] and r == 0, "L3 ch1 quotient")
ok(3 * 3 - 4 * 1 * 3 < 0, "L3 ch1 quotient D<0")
check_numeric("pf-03-03", "ch1", 1)
ok(peval(f3, -1) == -2 and peval(f3, 3) == 42, "L3 ch1 trap values as stated")
# remedial: x^2-x-2 = (x-2)(x+1)
built = pmul([1, -2], [1, 1])
ok(built == [F(1), F(-1), F(-2)], "L3 remedial expansion")
ok(one_correct("pf-03-03", "rem-pf0303-k") == "(x − 2)(x + 1)", "L3 remedial")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-pf-ch3: %d/%d checks passed" % (PASS, PASS))
