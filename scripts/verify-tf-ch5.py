"""Dual-route verifier for trig-functions Ch5 (periodic modeling + Pythagorean identity).

Route A: the taught anatomy reads (midline/amplitude/b = 2pi/period) and the
         identity procedure (subtract squares, root, quadrant sign).
Route B: EMPIRICAL — every model claim (min, max, evaluation, period) recovered
         by densely sampling the actual model function; the identity verified
         across a dense sweep of 10,000 angles in all four quadrants; every
         sign-recovery claim checked against the ACTUAL cosine/sine of angles
         constructed to have the given value in the given quadrant.
"""
import json, glob, sys, math

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/trig-functions/lessons/tf-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"tf-05-01", "tf-05-02", "tf-05-03"}, "expected 3 ch5 lessons")

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid: return s["widget"]
    for r in L[lid].get("remedials", []):
        if r["check"]["id"] == sid: return r["check"]["widget"]
    sys.exit("no step %s/%s" % (lid, sid))

def one_correct(lid, sid):
    w = widget(lid, sid)
    ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + sid + " exactly-one-correct")
    return next(o["label"] for o in w["options"] if o.get("correct"))

def check_numeric(lid, sid, expect):
    w = widget(lid, sid)
    ok(w["answer"] == expect, "%s/%s answer %s != %s" % (lid, sid, w["answer"], expect))
    ok(len(w["commonErrors"]) >= 2, lid + "/" + sid + " needs >=2 traps")
    for e in w["commonErrors"]:
        ok(e["value"] != expect, "%s/%s trap == answer" % (lid, sid))

def near(a, b, tol=5e-3):
    return abs(a - b) <= tol

def probe(f, span):
    xs = [span * k / 10000 for k in range(10001)]
    vals = [f(x) for x in xs]
    return max(vals), min(vals)

# ---- L1 ----
wheel = lambda t: 25 - 20 * math.cos(t)
hi, lo = probe(wheel, 4 * math.pi)
ok(near(lo, 5, 1e-4) and near(hi, 45, 1e-4), "L1 empirical wheel range")
ok(near(wheel(0), 5, 1e-12), "L1: the ride literally OPENS at its minimum")
check_numeric("tf-05-01", "i1", 5)
check_numeric("tf-05-01", "k1", 45)
ok(near(wheel(math.pi), 45, 1e-12) and near(wheel(math.pi / 2), 25, 1e-12), "L1 i2 half-turn + quarter-turn trap")
check_numeric("tf-05-01", "i2", 45)
ok(one_correct("tf-05-01", "k2").startswith("The rider STARTS at the bottom"), "L1 k2 label")
ok(near(20 * math.sin(0) + 25, 25, 1e-15), "L1 k2 distractor: +sin really opens at the midline")
tide = lambda t: 3 * math.sin(t) + 5
hi, lo = probe(tide, 4 * math.pi)
ok(near(hi, 8, 1e-4) and near(lo, 2, 1e-4) and (8 + 2) / 2 == 5 and (8 - 2) / 2 == 3, "L1 i3 empirical tide")
check_numeric("tf-05-01", "i3", 5)
strange = lambda t: 30 - 26 * math.cos(t)
hi, lo = probe(strange, 4 * math.pi)
ok(near(lo, 4, 1e-4) and near(hi, 56, 1e-4) and near(strange(0), 4, 1e-12), "L1 ch1 empirical")
check_numeric("tf-05-01", "ch1", 4)
small = lambda t: 12 - 10 * math.cos(t)
hi, lo = probe(small, 4 * math.pi)
ok(near(lo, 2, 1e-4) and near(hi, 22, 1e-4), "L1 remedial empirical")
check_numeric("tf-05-01", "rem-tf0501-k", 2)

# ---- L2 ----
day = lambda t: 10 * math.sin(t) + 20
hi, lo = probe(day, 4 * math.pi)
ok(near(hi, 30, 1e-4) and near(lo, 10, 1e-4), "L2 i1/k1: 30/10 wave has amp 10, mid 20, empirically")
check_numeric("tf-05-02", "i1", 10)
check_numeric("tf-05-02", "k1", 20)

def empirical_period(f, guess, span):
    xs = [span * k / 4000 for k in range(4001)]
    ok(all(abs(f(x + guess) - f(x)) < 1e-9 for x in xs), "claimed period %s fails" % guess)
    ok(any(abs(f(x + guess / 2) - f(x)) > 1e-6 for x in xs), "half-period also repeats — not minimal")

b12 = 2 * math.pi / 12
ok(near(b12, 0.52, 5e-3), "L2 i2 value")
empirical_period(lambda t: math.sin(b12 * t), 12, 48)
check_numeric("tf-05-02", "i2", 0.52)
b40 = 2 * math.pi / 40
ok(near(b40, 0.16, 5e-3), "L2 k2 value")
empirical_period(lambda t: 25 - 20 * math.cos(b40 * t), 40, 160)
check_numeric("tf-05-02", "k2", 0.16)
model = lambda t: 3 * math.sin(math.pi * t / 6) + 5
ok(near(model(3), 8, 1e-12), "L2 i3 evaluation")
hi, lo = probe(model, 24)
ok(near(hi, 8, 1e-4), "L2 i3: t=3 really is high tide (the empirical max)")
ok(near(3 * math.sin(math.pi / 6) + 5, 6.5, 1e-12), "L2 i3 wrong-inside trap")
check_numeric("tf-05-02", "i3", 8)
ride = lambda t: 25 - 20 * math.cos(math.pi * t / 20)
ok(near(ride(20), 45, 1e-12) and near(ride(0), 5, 1e-12) and near(ride(10), 25, 1e-12), "L2 ch1 + both traps as real timeline points")
empirical_period(ride, 40, 160)
check_numeric("tf-05-02", "ch1", 45)
pond = lambda t: 4 * math.sin(t) + 5
hi, lo = probe(pond, 4 * math.pi)
ok(near(hi, 9, 1e-4) and near(lo, 1, 1e-4), "L2 remedial empirical")
check_numeric("tf-05-02", "rem-tf0502-k", 4)

# ---- L3 ----
# Route B: identity verified across a dense sweep of all four quadrants
for k in range(10000):
    t = 2 * math.pi * k / 10000
    s, c = math.sin(t), math.cos(t)
    ok(abs(s * s + c * c - 1) < 1e-12, "identity fails at t=%s" % t)
ok(near(0.6 ** 2 + 0.8 ** 2, 1, 1e-12) and 0.6 + 0.8 == 1.4 and near(0.6 * 0.8, 0.48, 1e-12), "L3 i1 + traps")
check_numeric("tf-05-03", "i1", 1)

def sign_recovery(sin_val=None, cos_val=None, quadrant=None, expect=None):
    """Route B: build the ACTUAL angle with the given value in the given quadrant
    and read the other function directly off it."""
    if sin_val is not None:
        base = math.asin(abs(sin_val))
        t = {1: base, 2: math.pi - base, 3: math.pi + base, 4: 2 * math.pi - base}[quadrant]
        ok(near(math.sin(t), sin_val, 1e-12), "constructed angle has wrong sine")
        ok(near(math.cos(t), expect, 5e-3), "actual cosine %.4f != claimed %s (Q%d)" % (math.cos(t), expect, quadrant))
    else:
        base = math.acos(abs(cos_val))
        t = {1: base, 2: math.pi - base, 3: math.pi + base, 4: 2 * math.pi - base}[quadrant]
        ok(near(math.cos(t), cos_val, 1e-12), "constructed angle has wrong cosine")
        ok(near(math.sin(t), expect, 5e-3), "actual sine %.4f != claimed %s (Q%d)" % (math.sin(t), expect, quadrant))

sign_recovery(sin_val=0.6, quadrant=1, expect=0.8)
check_numeric("tf-05-03", "k1", 0.8)
sign_recovery(sin_val=0.6, quadrant=2, expect=-0.8)
check_numeric("tf-05-03", "i2", -0.8)
ok(one_correct("tf-05-03", "k2").startswith("Squaring erases sign"), "L3 k2 label")
ok(0.8 ** 2 == (-0.8) ** 2 and near(0.8 ** 2, 0.64, 1e-12), "L3 k2: both candidates really square to 0.64")
ok(near((5 / 13) ** 2 + (12 / 13) ** 2, 1, 1e-12), "L3 c3: 5-12-13 satisfies the identity")
sign_recovery(cos_val=5 / 13, quadrant=4, expect=-12 / 13)
ok(near(12 / 13, 0.92, 5e-3) and near(8 / 13, 0.62, 5e-3), "L3 i3 value + trap")
check_numeric("tf-05-03", "i3", -0.92)
sign_recovery(sin_val=-0.8, quadrant=3, expect=-0.6)
ok(near(1 - 0.8, 0.2, 1e-12), "L3 ch1 unsquared trap")
check_numeric("tf-05-03", "ch1", -0.6)
sign_recovery(sin_val=1, quadrant=1, expect=0)
check_numeric("tf-05-03", "rem-tf0503-k", 0)

print("verify-tf-ch5: all checks passed")
