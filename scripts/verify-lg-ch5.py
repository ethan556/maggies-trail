"""Dual-route verifier for logarithms Ch5 (continuous models, half-life, log scales).

Route A: taught formulas — A = Pe^(rt), N = N0 (1/2)^(t/h), factor = 10^gap — evaluated
         directly with math.exp/pow; every claimed solution substituted into its ORIGINAL.
Route B: first-principles recomputation — halvings counted stepwise, doubling/decay times
         recovered by bisection search (formula-free), scale gaps recovered via math.log10,
         and every rounding claim re-derived.
"""
import json, glob, sys, math

PASS = 0
def ok(cond, msg):
    global PASS
    if cond: PASS += 1
    else: sys.exit("FAIL: " + msg)

L = {}
for p in sorted(glob.glob("content/courses/logarithms/lessons/lg-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d
ok(set(L) == {"lg-05-01", "lg-05-02", "lg-05-03"}, "expected 3 ch5 lessons")

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

def close(a, b, tol=1e-9):
    return abs(a - b) <= tol * max(1.0, abs(a), abs(b))

def bisect(f, lo, hi, iters=200):
    """Find root of f (sign change) — formula-free Route B solver."""
    flo = f(lo)
    for _ in range(iters):
        mid = (lo + hi) / 2
        if f(mid) == 0: return mid
        if (f(mid) > 0) == (flo > 0): lo, flo = mid, f(mid)
        else: hi = mid
    return (lo + hi) / 2

# ---- L1: continuous models ----
ok(round(500 * math.exp(0.06 * 10)) == 911, "L1 c1: $911 claim")
ok(round(200 * math.exp(0.05 * 20)) == 544, "L1 i1")
check_numeric("lg-05-01", "i1", 544)
ok(450 * math.exp(0.03 * 0) == 450, "L1 k1 start")
ok(one_correct("lg-05-01", "k1") == "450 and 3%", "L1 k1 label")
# i2: doubling time at 7% — formula and bisection agree
t_formula = math.log(2) / 0.07
t_bisect = bisect(lambda t: math.exp(0.07 * t) - 2, 0, 50)
ok(close(t_formula, t_bisect, 1e-6) and round(t_formula, 1) == 9.9, "L1 i2 dual route")
ok(close(500 * math.exp(0.07 * t_formula), 1000), "L1 i2 substitution into original")
check_numeric("lg-05-01", "i2", 9.9)
# k2: P cancels — doubling time identical across principals
for P in (5, 500, 5 * 10 ** 6):
    tb = bisect(lambda t: P * math.exp(0.07 * t) - 2 * P, 0, 50)
    ok(close(tb, t_formula, 1e-6), "L1 k2 P=%s same doubling time" % P)
ok(one_correct("lg-05-01", "k2") == "it doesn't — P cancels, leaving t = (ln 2)/r", "L1 k2 label")
ok(round(600 * math.exp(-0.25 * 2)) == 364 and round(600 * 0.607) == 364, "L1 k3")
ok(round(math.exp(-0.5), 3) == 0.607, "L1 k3 given value")
check_numeric("lg-05-01", "k3", 364)
# ch1: rate recovery
r_formula = math.log(1.5) / 5
r_bisect = bisect(lambda r: 300 * math.exp(5 * r) - 450, 0, 1)
ok(close(r_formula, r_bisect, 1e-6) and round(r_formula * 100, 1) == 8.1, "L1 ch1 dual route")
ok(round(math.log(1.5), 3) == 0.405, "L1 ch1 given value")
check_numeric("lg-05-01", "ch1", 8.1)
ok(900 * math.exp(0) == 900, "L1 remedial")
check_numeric("lg-05-01", "rem-lg0501-k", 900)

# ---- L2: half-life ----
def halve_steps(N0, steps):
    for _ in range(steps): N0 /= 2
    return N0

ok(halve_steps(160, 3) == 20 and 160 * 0.5 ** (24 / 8) == 20, "L2 c1 dual route")
ok(halve_steps(240, 3) == 30 and 240 * 0.5 ** (15 / 5) == 30, "L2 i1 dual route")
check_numeric("lg-05-02", "i1", 30)
ok(round(160 * 0.5 ** 0.5) == 113 and round(0.5 ** 0.5, 3) == 0.707, "L2 c2 claims")
ok(500 * 0.5 ** (12 / 12) == 250, "L2 k1: one half-life")
ok(one_correct("lg-05-02", "k1") == "500 and 12", "L2 k1 label")
ok(halve_steps(500, 3) == 62.5 and 500 * 0.5 ** (36 / 12) == 62.5, "L2 i2 dual route")
check_numeric("lg-05-02", "i2", 62.5)
ok(abs(0.5 ** 0.5 - 0.707) < 5e-4 and 0.5 ** 0.5 != 0.75, "L2 k2")
ok(one_correct("lg-05-02", "k2") == "(1/2)^(1/2) = 1/√2 ≈ 71%", "L2 k2 label")
ok(0.5 ** 4 == 1 / 16 and 4 * 8 == 32 and 0.5 ** (32 / 8) == 1 / 16, "L2 k3 dual route")
check_numeric("lg-05-02", "k3", 32)
# ch1: (1/2)^(t/10) = 0.3
t_formula = 10 * math.log(0.3) / math.log(0.5)
t_bisect = bisect(lambda t: 0.5 ** (t / 10) - 0.3, 0, 100)
ok(close(t_formula, t_bisect, 1e-6) and round(t_formula, 1) == 17.4, "L2 ch1 dual route")
ok(10 < t_formula < 20, "L2 ch1 sanity: between 1 and 2 half-lives")
ok(round(math.log(0.3), 3) == -1.204 and round(math.log(0.5), 3) == -0.693, "L2 ch1 given values")
check_numeric("lg-05-02", "ch1", 17.4)
ok(halve_steps(80, 2) == 20, "L2 remedial")
check_numeric("lg-05-02", "rem-lg0502-k", 20)

# ---- L3: log scales ----
ok(10 ** (7 - 4) == 1000, "L3 i1")
check_numeric("lg-05-03", "i1", 1000)
ok(10 ** (5 - 2) == 1000, "L3 k1")
check_numeric("lg-05-03", "k1", 1000)
ok(math.log10(100000) == 5, "L3 i2")
check_numeric("lg-05-03", "i2", 5)
ok(round(10 ** 1.5, 1) == 31.6 and 10 < 10 ** 1.5 < 100, "L3 k2")
ok(one_correct("lg-05-03", "k2") == "≈ 32× (10^1.5)", "L3 k2 label")
ok(one_correct("lg-05-03", "k3") == "intensities span billions-to-1; logs compress that into small, comparable numbers", "L3 k3 label")
# ch1: magnitude 4.0 + log 200 = 6.3; dual route: bisection on 10^(m-4) = 200
m_formula = 4.0 + math.log10(200)
m_bisect = bisect(lambda m: 10 ** (m - 4.0) - 200, 4, 10)
ok(close(m_formula, m_bisect, 1e-6) and round(m_formula, 1) == 6.3, "L3 ch1 dual route")
ok(close(math.log10(200), math.log10(2) + 2), "L3 ch1 property route")
check_numeric("lg-05-03", "ch1", 6.3)
ok(10 ** 2 == 100, "L3 remedial")
check_numeric("lg-05-03", "rem-lg0503-k", 100)

for lid, d in L.items():
    for s in d["steps"]:
        if s["kind"] == "challenge":
            ok(len(s["hints"]) == 3, lid + " hints")
        w = s.get("widget")
        if w and w["type"] == "mcq":
            ok(sum(1 for o in w["options"] if o.get("correct")) == 1, lid + "/" + s["id"] + " mcq")

print("verify-lg-ch5: %d/%d checks passed" % (PASS, PASS))
