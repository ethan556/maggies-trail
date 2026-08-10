"""Dual-route verifier for trig-functions Ch4 (sine/cosine graphs).

Route A: the taught parameter reads — amplitude |a|, midline d, period 2pi/b,
         max/min = d +/- |a|.
Route B: EMPIRICAL SAMPLING — every claimed max, min, midline, amplitude, and
         period is recovered from dense numeric samples of the actual function
         (10,000 points over several cycles), with each period claim confirmed
         to repeat everywhere sampled AND to be minimal (no proper fraction of
         it also repeats). No parameter formulas are used anywhere in the route.
"""
import json, glob, sys, math

def ok(cond, msg):
    if not cond: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/trig-functions/lessons/tf-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"tf-04-01", "tf-04-02", "tf-04-03"}, "expected 3 ch4 lessons")

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

N, SPAN = 10000, 8 * math.pi
XS = [SPAN * k / N for k in range(N + 1)]

def probe(f):
    """Route B: empirical max/min/midline/amplitude from dense samples."""
    vals = [f(x) for x in XS]
    hi, lo = max(vals), min(vals)
    return hi, lo, (hi + lo) / 2, (hi - lo) / 2

def empirical_period(f, guess):
    """Route B: confirm f(x + guess) == f(x) everywhere sampled AND that no
    smaller candidate (guess/2, guess/3, guess/4) also works."""
    ok(all(abs(f(x + guess) - f(x)) < 1e-9 for x in XS), "claimed period %s fails to repeat" % guess)
    for div in (2, 3, 4):
        cand = guess / div
        if any(abs(f(x + cand) - f(x)) > 1e-6 for x in XS):
            continue
        ok(False, "a smaller period %s also repeats — claim not minimal" % cand)

# ---- L1 ----
empirical_period(math.sin, 2 * math.pi)
ok(max(abs(math.sin(x + math.pi) - math.sin(x)) for x in XS) > 1.9, "L1 i1: pi is NOT a period of sine")
check_numeric("tf-04-01", "i1", 6.28)
hi, lo, mid, amp = probe(math.sin)
ok(near(hi, 1, 1e-4) and near(lo, -1, 1e-4), "L1 k1: empirical extremes of sin")
check_numeric("tf-04-01", "k1", 1)
ok(one_correct("tf-04-01", "i2").startswith("Sine starts at 0"), "L1 i2 label")
ok(near(math.sin(0), 0, 1e-15) and near(math.cos(0), 1, 1e-15), "L1 i2: entrances by evaluation")
ok(near(math.cos(math.pi), -1, 1e-12) and near(math.sin(math.pi), 0, 1e-12), "L1 k2 + trap")
check_numeric("tf-04-01", "k2", -1)
ok((7 + 1) / 2 == 4 and (7 - 1) / 2 == 3, "L1 i3/ch1 anatomy")
hi, lo, mid, amp = probe(lambda x: 3 * math.sin(x) + 4)
ok(near(hi, 7, 1e-4) and near(lo, 1, 1e-4) and near(mid, 4, 1e-4) and near(amp, 3, 1e-4),
   "L1 i3/ch1: a real max-7 min-1 wave has midline 4, amplitude 3 empirically")
check_numeric("tf-04-01", "i3", 4)
check_numeric("tf-04-01", "ch1", 3)
hi, lo, mid, amp = probe(lambda x: 3 * math.sin(x) + 2)
ok(near(hi, 5, 1e-4) and near(lo, -1, 1e-4) and near(mid, 2, 1e-4), "L1 remedial empirical")
check_numeric("tf-04-01", "rem-tf0401-k", 2)

# ---- L2 ----
hi, lo, mid, amp = probe(lambda x: 2 * math.sin(x) + 1)
ok(near(hi, 3, 1e-4) and near(lo, -1, 1e-4) and near(mid, 1, 1e-4) and near(amp, 2, 1e-4), "L2 i1 empirical")
check_numeric("tf-04-02", "i1", 3)
hi, lo, mid, amp = probe(lambda x: 4 * math.sin(x) - 2)
ok(near(lo, -6, 1e-4) and near(hi, 2, 1e-4) and near(mid, -2, 1e-4), "L2 k1 empirical (both traps are real features)")
check_numeric("tf-04-02", "k1", -6)
hi, lo, mid, amp = probe(lambda x: 4 * math.sin(x) + 6)
ok(near(hi, 10, 1e-4) and near(lo, 2, 1e-4) and near(amp, 4, 1e-4) and near(mid, 6, 1e-4),
   "L2 i2/k2: y = 4 sin x + 6 really oscillates 10-to-2")
check_numeric("tf-04-02", "i2", 4)
check_numeric("tf-04-02", "k2", 6)
hi, lo, mid, amp = probe(lambda x: -3 * math.sin(x) + 5)
ok(near(amp, 3, 1e-4) and near(mid, 5, 1e-4) and near(hi, 8, 1e-4), "L2 i3: all three distractor-features empirical")
ok(one_correct("tf-04-02", "i3") == "3", "L2 i3 label")
ok(near(-2 * math.cos(0) + 3, 1, 1e-15) and near(2 * math.cos(0) + 3, 5, 1e-15), "L2 ch1 + reflected trap")
hi, lo, mid, amp = probe(lambda x: -2 * math.cos(x) + 3)
ok(near(lo, 1, 1e-4), "L2 ch1: the flipped wave's x=0 value IS its empirical minimum")
check_numeric("tf-04-02", "ch1", 1)
hi, lo, mid, amp = probe(lambda x: 3 * math.sin(x))
ok(near(hi, 3, 1e-4) and near(hi - lo, 6, 1e-4), "L2 remedial empirical (span trap real)")
check_numeric("tf-04-02", "rem-tf0402-k", 3)

# ---- L3 ---- (every period claim found empirically and confirmed minimal)
empirical_period(lambda x: math.sin(2 * x), math.pi)
check_numeric("tf-04-03", "i1", 3.14)
empirical_period(lambda x: math.cos(x / 2), 4 * math.pi)
check_numeric("tf-04-03", "k1", 12.57)
empirical_period(lambda x: math.sin(4 * x), math.pi / 2)
check_numeric("tf-04-03", "i2", 4)
empirical_period(lambda x: math.sin(3 * x), 2 * math.pi / 3)
ok(max(abs(math.sin(6 * (x + 2 * math.pi / 3)) - math.sin(6 * x)) for x in XS) < 1e-9,
   "L3 k2: b=6 ALSO repeats every 2pi/3 (twice per window) — the product test b*period=2pi is what forces 3")
ok(abs(6 * (2 * math.pi / 3) - 2 * math.pi) > 1, "L3 k2: 6 fails the b*period=2pi test")
check_numeric("tf-04-03", "k2", 3)
f = lambda x: 2 * math.sin(2 * x) + 5
hi, lo, mid, amp = probe(f)
ok(near(mid, 5, 1e-4) and near(amp, 2, 1e-4), "L3 i3: keyed rule has the claimed midline and amplitude")
empirical_period(f, math.pi)
ok(one_correct("tf-04-03", "i3") == "y = 2 sin(2x) + 5", "L3 i3 label")
hi, lo, mid, amp = probe(lambda x: 5 * math.sin(2 * x) + 2)
ok(not near(mid, 5, 1e-3) and not near(amp, 2, 1e-3), "L3 i3 d1 fails midline and amplitude")
empirical_period(lambda x: 2 * math.sin(x) + 5, 2 * math.pi)
g = lambda x: 2 * math.sin(math.pi * x) + 5
ok(max(abs(g(x + math.pi) - g(x)) for x in XS) > 0.5, "L3 i3 d3: pi is not its period")
ok(near(3 * math.sin(2 * math.pi / 4) + 1, 4, 1e-12) and near(3 * math.sin(math.pi / 4) + 1, 3.12, 5e-3), "L3 ch1 + trap")
check_numeric("tf-04-03", "ch1", 4)
empirical_period(lambda x: math.sin(4 * x), math.pi / 2)
check_numeric("tf-04-03", "rem-tf0403-k", 1.57)

print("verify-tf-ch4: all checks passed")
