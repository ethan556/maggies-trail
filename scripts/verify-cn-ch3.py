"""Dual-route verifier for complex-numbers Ch3 (arithmetic).

Route A: the taught part-wise / FOIL / conjugate rules, computed symbolically on (a, b) pairs.
Route B: Python's native complex type as an independent oracle.
"""
import json, glob, sys

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/complex-numbers/lessons/cn-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"cn-03-01", "cn-03-02", "cn-03-03"}, "expected 3 ch3 lessons")

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

# Route A rule implementations on (a,b) pairs
def add(p, q): return (p[0] + q[0], p[1] + q[1])
def sub(p, q): return (p[0] - q[0], p[1] - q[1])
def mul(p, q): return (p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0])
def conj(p): return (p[0], -p[1])
def div(p, q):
    num = mul(p, conj(q)); den = q[0] ** 2 + q[1] ** 2
    ok(num[0] % den == 0 and num[1] % den == 0, "division not exact: %s / %s" % (p, q))
    return (num[0] // den, num[1] // den)
def oracle(p): return complex(p[0], p[1])

def dual(opname, fn, p, q, expect):
    a = fn(p, q)
    o = {"add": lambda x, y: x + y, "sub": lambda x, y: x - y,
         "mul": lambda x, y: x * y, "div": lambda x, y: x / y}[opname](oracle(p), oracle(q))
    ok(oracle(a) == o, "%s rule vs oracle disagree: %s vs %s" % (opname, a, o))
    ok(a == expect, "%s expected %s got %s" % (opname, expect, a))
    return a

# ---- L1 ----
dual("add", add, (3, 2), (1, 4), (4, 6))
ok(one_correct("cn-03-01", "i1") == "4 + 6i", "L1 i1")
dual("add", add, (5, -3), (2, 7), (7, 4))
check_numeric("cn-03-01", "k1", 4)
dual("sub", sub, (6, 2), (4, 5), (2, -3))
ok(one_correct("cn-03-01", "i2") == "2 − 3i", "L1 i2")
dual("sub", sub, (1, 6), (3, -2), (-2, 8))
check_numeric("cn-03-01", "k2", 8)
one_correct("cn-03-01", "k3")
dual("sub", sub, (4, -1), (-2, 3), (6, -4))
check_numeric("cn-03-01", "ch1", -4)
dual("add", add, (2, 1), (3, 2), (5, 3))
check_numeric("cn-03-01", "rem-cn0301-k", 3)

# ---- L2 ----
dual("mul", mul, (2, 1), (3, 2), (4, 7))
check_numeric("cn-03-02", "i1", 4)
check_numeric("cn-03-02", "k1", 7)
dual("mul", mul, (0, 3), (0, 5), (-15, 0))
check_numeric("cn-03-02", "i2", -15)
dual("mul", mul, (3, 1), (2, 1), (5, 5))
check_numeric("cn-03-02", "k2", 5)
dual("mul", mul, (0, 5), (0, 2), (-10, 0))
ok(one_correct("cn-03-02", "k3") == "−10", "L2 k3")
dual("mul", mul, (4, 1), (4, 1), (15, 8))
check_numeric("cn-03-02", "ch1", 15)
dual("mul", mul, (0, 2), (0, 3), (-6, 0))
check_numeric("cn-03-02", "rem-cn0302-k", -6)
# concept formula sanity: (a+bi)(c+di) = (ac-bd)+(ad+bc)i over a sweep
for a in range(-3, 4):
    for b in range(-3, 4):
        p, q = (a, b), (b - 1, a + 2)
        ok(oracle(mul(p, q)) == oracle(p) * oracle(q), "FOIL identity sweep %s %s" % (p, q))

# ---- L3 ----
dual("mul", mul, (3, 2), (3, -2), (13, 0))
check_numeric("cn-03-03", "i1", 13)
ok(one_correct("cn-03-03", "k1") == "−2 − 7i" and conj((-2, 7)) == (-2, -7), "L3 k1")
dual("mul", mul, (1, -1), (1, 1), (2, 0))
check_numeric("cn-03-03", "i2", 2)
q = div((3, 1), (1, -1))
ok(q == (1, 2) and one_correct("cn-03-03", "k2") == "1 + 2i", "L3 k2 division")
ok(oracle(q) == oracle((3, 1)) / oracle((1, -1)), "L3 k2 oracle")
dual("mul", mul, (5, 2), (5, -2), (29, 0))
check_numeric("cn-03-03", "k3", 29)
q = div((4, 2), (1, 1))
ok(q == (3, -1), "L3 ch1 division %s" % (q,))
ok(oracle(q) == oracle((4, 2)) / oracle((1, 1)), "L3 ch1 oracle")
check_numeric("cn-03-03", "ch1", 3)
ok(one_correct("cn-03-03", "rem-cn0303-k") == "4 − 3i", "L3 remedial")
# conjugate product always real & = a^2+b^2 over a sweep
for a in range(-4, 5):
    for b in range(-4, 5):
        pr = mul((a, b), conj((a, b)))
        ok(pr == (a * a + b * b, 0), "conjugate identity %s" % ((a, b),))

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-cn-ch3: %d/%d checks passed" % (PASS, PASS))
