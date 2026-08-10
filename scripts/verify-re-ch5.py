"""Dual-route verifier for radical-functions Ch5 (reciprocal-power solves, even-numerator ±, models).

Route A: reciprocal-power computation (root-first with exact integers) for every solve.
Route B: brute integer sweeps substituting candidates into the ORIGINAL power equation
         (signed rational powers computed via odd-root sign handling); ± cases verified on
         BOTH branches; model equations solved forward and backward independently.
"""
import json, glob, sys, math

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/radical-functions/lessons/re-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"re-05-01", "re-05-02", "re-05-03"}, "expected 3 ch5 lessons")

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

def close(a, b): return abs(a - b) <= 1e-9 * max(1.0, abs(a), abs(b))

def rpow(x, m, n):
    """x^(m/n) for integer m, n>0, real x — via n-th root first, sign-aware (odd n only for x<0)."""
    if x < 0:
        if n % 2 == 0: raise ValueError("even root of negative")
        root = -((-x) ** (1.0 / n))
    else:
        root = x ** (1.0 / n)
    return root ** m

def sweep(m, n, k, lo=-80, hi=80):
    out = []
    for x in range(lo, hi + 1):
        try:
            if close(rpow(x, m, n), k): out.append(x)
        except ValueError:
            pass
    return out

# ---- L1 ----
ok(sweep(1, 3, 2) == [8], "L1 i1 sweep")
ok(close(rpow(8, 1, 3), 2), "L1 i1 forward check")
check_numeric("re-05-01", "i1", 8)
# c2 claims: 8^(2/3)=4 and 4^(3/2)=8
ok(close(rpow(8, 2, 3), 4) and close(rpow(4, 3, 2), 8), "L1 c2 both directions")
ok(sweep(3, 2, 27, 0, 200) == [9], "L1 k1 sweep")
ok(close(rpow(27, 2, 3), 9), "L1 k1 reciprocal route")
check_numeric("re-05-01", "k1", 9)
ok(one_correct("re-05-01", "i2") == "5/2", "L1 i2")
ok(sweep(2, 5, 4, 0, 200) == [32], "L1 k2 sweep (positive range)")
ok(close(rpow(4, 5, 2), 32), "L1 k2 reciprocal route")
check_numeric("re-05-01", "k2", 32)
# k3: 2 x^(3/2) = 16
cands = [x for x in range(0, 200) if close(2 * rpow(x, 3, 2), 16)]
ok(cands == [4], "L1 k3 sweep")
ok(close(rpow(8, 2, 3), 4), "L1 k3 route A")
check_numeric("re-05-01", "k3", 4)
# ch1: (x+1)^(3/2) = 8
cands = [x for x in range(-1, 200) if close(rpow(x + 1, 3, 2), 8)]
ok(cands == [3], "L1 ch1 sweep")
check_numeric("re-05-01", "ch1", 3)
ok(sweep(1, 2, 5, 0, 100) == [25], "L1 remedial sweep")
check_numeric("re-05-01", "rem-re0501-k", 25)

# ---- L2: even-numerator ± ----
ok(close(rpow(-27, 2, 3), 9) and close(rpow(27, 2, 3), 9), "L2 c1 both branches")
check_numeric("re-05-02", "i1", 9)
ok(sweep(2, 3, 9) == [-27, 27], "L2 c1 sweep finds both")
# k1: x^(2/5) = 4 -> ±32
ok(sweep(2, 5, 4) == [-32, 32], "L2 k1 sweep")
ok(one_correct("re-05-02", "k1") == "two: x = 32 and x = −32", "L2 k1 label")
# i2: x^(3/5) = 8 -> only 32; -32 gives -8
ok(sweep(3, 5, 8) == [32], "L2 i2 sweep")
ok(close(rpow(-32, 3, 5), -8), "L2 i2 negative branch gives -8")
ok(one_correct("re-05-02", "i2") == "one: x = 32", "L2 i2 label")
# k2: x^(2/3) = 16 -> ±64
ok(sweep(2, 3, 16) == [-64, 64], "L2 k2 sweep")
ok(one_correct("re-05-02", "k2") == "x = 64 or x = −64", "L2 k2 label")
ok(close(rpow(16, 3, 2), 64), "L2 k2 route A")
# k3: x^(2/3) = -4 -> none; and (-8)^(2/3) = +4
ok(sweep(2, 3, -4) == [], "L2 k3 no solutions")
ok(close(rpow(-8, 2, 3), 4), "L2 k3 distractor -8 gives +4")
# range argument: even-numerator power >= 0 across sweep
ok(all(rpow(x, 2, 3) >= 0 for x in range(-80, 81)), "L2 k3 range argument")
ok(one_correct("re-05-02", "k3") == "none — an even-numerator power is never negative", "L2 k3 label")
# ch1: x^(4/3) = 16 -> ±8
ok(sweep(4, 3, 16) == [-8, 8], "L2 ch1 sweep")
ok(close(rpow(16, 3, 4), 8), "L2 ch1 route A")
check_numeric("re-05-02", "ch1", 8)
ok(sweep(2, 1, 25) == [-5, 5], "L2 remedial sweep")
ok(one_correct("re-05-02", "rem-re0502-k") == "x = 5 or x = −5", "L2 remedial label")

# ---- L3: models ----
# skid s = sqrt(24 d)
ok(math.sqrt(24 * 6) == 12, "L3 c1 d=6")
ok(math.sqrt(24 * 24) == 24, "L3 i1 d=24")
check_numeric("re-05-03", "i1", 24)
# drop t = sqrt(h)/4; equivalent to sqrt(h/16)
for h in (64, 144, 400):
    ok(close(math.sqrt(h) / 4, math.sqrt(h / 16)), "L3 formula equivalence h=%d" % h)
ok(math.sqrt(64) / 4 == 2, "L3 c2 h=64")
ok(math.sqrt(144) / 4 == 3, "L3 k1 h=144")
check_numeric("re-05-03", "k1", 3)
# i2 backward: 5 = sqrt(h)/4 -> h=400; sweep
ok([h for h in range(0, 2000) if close(math.sqrt(h) / 4, 5)] == [400], "L3 i2 sweep")
check_numeric("re-05-03", "i2", 400)
# k2 backward: 36 = sqrt(24 d) -> d = 54; sweep
ok([d for d in range(0, 2000) if close(math.sqrt(24 * d), 36)] == [54], "L3 k2 sweep")
ok(36 ** 2 == 1296 and 1296 // 24 == 54, "L3 k2 route A")
check_numeric("re-05-03", "k2", 54)
# k3: quadruple d doubles s — verified on witnesses
for d in (6, 24, 54):
    ok(close(math.sqrt(24 * 4 * d), 2 * math.sqrt(24 * d)), "L3 k3 witness d=%d" % d)
ok(one_correct("re-05-03", "k3") == "it doubles", "L3 k3 label")
# ch1: T = 2 sqrt(L); 10 = 2 sqrt(L) -> L=25
ok([Lm for Lm in range(0, 500) if close(2 * math.sqrt(Lm), 10)] == [25], "L3 ch1 sweep")
check_numeric("re-05-03", "ch1", 25)
ok(math.sqrt(24 * 6) == 12, "L3 remedial")
check_numeric("re-05-03", "rem-re0503-k", 12)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-re-ch5: %d/%d checks passed" % (PASS, PASS))
