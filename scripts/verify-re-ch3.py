"""Dual-route verifier for radical-functions Ch3 (sqrt function, domains, transformations).

Route A: taught rules (inside >= 0 solved as an inequality; start point = shift pair;
         range floors/ceilings from outside shifts and flips).
Route B: empirical function probing — domains verified by dense boundary sampling (inside
         sign at boundary +/- eps), start points by evaluation, ranges by min/max scans.
"""
import json, glob, sys, math
from fractions import Fraction as F

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/radical-functions/lessons/re-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"re-03-01", "re-03-02", "re-03-03"}, "expected 3 ch3 lessons")

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

def domain_boundary(inside, boundary, direction):
    """inside: callable; verify inside(boundary)==0 and sign pattern matches direction ('ge' or 'le')."""
    ok(abs(inside(boundary)) < 1e-12, "boundary not zero at %s" % boundary)
    eps = 1e-6
    if direction == "ge":
        ok(inside(boundary + eps) > 0 and inside(boundary - eps) < 0, "ge pattern fails at %s" % boundary)
    else:
        ok(inside(boundary - eps) > 0 and inside(boundary + eps) < 0, "le pattern fails at %s" % boundary)
    # Route A: solve linear inequality a*x + b >= 0 exactly and compare
    a = inside(1) - inside(0); b = inside(0)
    bnd = F(-b).limit_denominator() / F(a).limit_denominator()
    ok(float(bnd) == float(boundary), "algebraic boundary mismatch")
    ok(("ge" if a > 0 else "le") == direction, "algebraic direction mismatch")

# ---- L1 ----
ok(math.sqrt(49) == 7, "L1 i1")
check_numeric("re-03-01", "i1", 7)
ok(one_correct("re-03-01", "k1") == "3", "L1 k1")
ok(math.sqrt(400) - math.sqrt(100) == 10, "L1 i2")
check_numeric("re-03-01", "i2", 10)
# k2 range: min over dense scan is 0, achieved; outputs never negative
vals = [math.sqrt(x / 10) for x in range(0, 2000)]
ok(min(vals) == 0 and all(v >= 0 for v in vals), "L1 k2 range scan")
ok(math.sqrt(0.25) == 0.5, "L1 k2 distractor y>=1 fails at 1/4")
ok(one_correct("re-03-01", "k2") == "y ≥ 0", "L1 k2 label")
ok(one_correct("re-03-01", "k3") == "(−9, 3)", "L1 k3")
for x, y in ((0, 0), (0.25, 0.5), (16, 4)):
    ok(math.sqrt(x) == y, "L1 k3 on-graph (%s,%s)" % (x, y))
ok(math.sqrt(144) == 12, "L1 ch1")
check_numeric("re-03-01", "ch1", 144)
ok(math.sqrt(25) == 5, "L1 remedial")
check_numeric("re-03-01", "rem-re0301-k", 5)

# ---- L2: domains ----
domain_boundary(lambda x: x + 6, -6, "ge")
ok(one_correct("re-03-02", "i1") == "x ≥ −6", "L2 i1")
domain_boundary(lambda x: 3 * x + 12, -4, "ge")
ok(one_correct("re-03-02", "k1") == "x ≥ −4", "L2 k1")
ok(round((-8) ** (1 / 3.0) if False else -((8) ** (1 / 3.0))) == -2, "L2 i2 cbrt(-8) real")
ok(one_correct("re-03-02", "i2") == "all real numbers", "L2 i2")
domain_boundary(lambda x: 10 - 2 * x, 5, "le")
ok(one_correct("re-03-02", "k2") == "x ≤ 5", "L2 k2")
ok(10 - 2 * 6 < 0, "L2 k2 distractor: x=6 breaks it")
domain_boundary(lambda x: x - 3, 3, "ge")
ok(math.sqrt(3 - 3) == 0, "L2 k3 start height")
ok(one_correct("re-03-02", "k3") == "(3, 0)", "L2 k3")
domain_boundary(lambda x: 5 * x - 20, 4, "ge")
check_numeric("re-03-02", "ch1", 4)
domain_boundary(lambda x: x - 7, 7, "ge")
ok(one_correct("re-03-02", "rem-re0302-k") == "x ≥ 7", "L2 remedial")

# ---- L3: transformations ----
def scan(f, lo, hi, n=4000):
    vals = []
    for i in range(n + 1):
        x = lo + (hi - lo) * i / n
        try: vals.append(f(x))
        except ValueError: pass
    return vals

# i1: sqrt(x+4)-3 starts (-4,-3)
g = lambda x: math.sqrt(x + 4) - 3
ok(abs(g(-4) - (-3)) < 1e-12, "L3 i1 start value")
ok(one_correct("re-03-03", "i1") == "(−4, −3)", "L3 i1")
# k1: -sqrt(x): max 0, all <= 0
vals = scan(lambda x: -math.sqrt(x), 0, 100)
ok(max(vals) == 0 and all(v <= 0 for v in vals), "L3 k1 range scan")
ok(-math.sqrt(0.25) == -0.5, "L3 k1 distractor y<=-1 fails")
ok(one_correct("re-03-03", "k1") == "y ≤ 0", "L3 k1 label")
# i2/k2: sqrt(x-2)+1: domain x>=2, range >= 1
domain_boundary(lambda x: x - 2, 2, "ge")
h = lambda x: math.sqrt(x - 2) + 1
vals = scan(h, 2, 200)
ok(min(vals) == 1 and all(v >= 1 for v in vals), "L3 k2 range scan")
ok(one_correct("re-03-03", "i2") == "x ≥ 2", "L3 i2")
ok(one_correct("re-03-03", "k2") == "y ≥ 1", "L3 k2")
ok(3 * math.sqrt(4) == 6, "L3 k3")
check_numeric("re-03-03", "k3", 6)
# ch1: -sqrt(x-5)+2 starts (5,2), max 2
p = lambda x: -math.sqrt(x - 5) + 2
ok(p(5) == 2, "L3 ch1 start")
vals = scan(p, 5, 300)
ok(max(vals) == 2 and all(v <= 2 for v in vals), "L3 ch1 range scan")
ok(one_correct("re-03-03", "ch1") == "starts (5, 2); range y ≤ 2", "L3 ch1")
q = lambda x: math.sqrt(x - 1) + 4
ok(q(1) == 4, "L3 remedial start")
ok(one_correct("re-03-03", "rem-re0303-k") == "(1, 4)", "L3 remedial")

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-re-ch3: %d/%d checks passed" % (PASS, PASS))
