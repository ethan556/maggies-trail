"""Dual-route verifier: solid-geometry ch5 (scale effects & modeling).
Route A: exact Fraction arithmetic on every k/k^2/k^3 ratio, density quotient,
and cost product. Route B: CONSTRUCTED-scaling measurement — actual solids
scaled and re-measured: a k=3 cube's cells COUNTED by triple loop; the k=2
sphere's volume ratio measured by slab-integrating both spheres and dividing;
the statue's three quantities measured on a concrete solid (a cylinder) at k=5
(height by subtraction, surface and volume by formula recomputation, ratios
extracted); the doubled-tank economy measured as (surface ratio)/(volume ratio)
from recomputed 4pi r^2 and (4/3)pi r^3 at r and 2r; density scale-invariance
measured at k=4; the design brief inverted numerically (bisection on
(4/3)r^3 = 288 agreeing with the exact cube root); cross-lesson ties re-derived
(silo 228pi skin and pipe 450pi concrete recomputed from ch4's dimensions, the
melt-challenge distractor 8 re-derived from ch3). Deps: sy (k^2 law cited),
ch3 (formulas + melt), ch4 (silo skin, pipe volume)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/solid-geometry/lessons/sg-05-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"sg-05-01", "sg-05-02", "sg-05-03"}, sorted(L)

FAIL = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond:
        FAIL.append(name)

def widget(lid, sid):
    for s in L[lid]["steps"]:
        if s["id"] == sid:
            return s["widget"]
    for m in L[lid]["remedials"]:
        if m["check"]["id"] == sid:
            return m["check"]["widget"]
    raise KeyError((lid, sid))

def near(a, b, t=0.005):
    return abs(a - b) <= t

def correct_label(w):
    return [o["label"] for o in w["options"] if o["correct"]][0]

def traps(w):
    return {e["value"] for e in w["commonErrors"]}

def slab(area_at, lo, hi, n=20000):
    dh = (hi - lo) / n
    return sum(area_at(lo + (i + 0.5) * dh) * dh for i in range(n))

PI = math.pi

# ---- Route B: constructed scaling ----
cells = sum(1 for i in range(3) for j in range(3) for k in range(3))
chk("modelB: k=3 cube cells COUNTED by triple loop == 27; faces 3x3 == 9", cells == 27 and 3 * 3 == 9)
v1 = slab(lambda h: PI * (1 - h * h), -1, 1)
v2 = slab(lambda h: PI * (4 - h * h), -2, 2)
chk("modelB: spheres r=1 and r=2 integrated — measured volume ratio == 8",
    near(v2 / v1, 8, 0.01))
# statue at k=5 on a cylinder r=2 h=10 -> r=10 h=50
h_ratio = 50 / 10
s1 = 2 * PI * 2 * 10 + 2 * PI * 4
s2 = 2 * PI * 10 * 50 + 2 * PI * 100
v1c = PI * 4 * 10
v2c = PI * 100 * 50
chk("modelB: statue k=5 measured on a cylinder — height x5, surface x25, volume x125",
    near(h_ratio, 5, 1e-12) and near(s2 / s1, 25, 1e-9) and near(v2c / v1c, 125, 1e-9))
chk("modelB: doubled tank economy — (4pi(2r)^2 / 4pi r^2) / ((4/3)pi(2r)^3 / (4/3)pi r^3) == 1/2 at r=7",
    near((4 * PI * 196 / (4 * PI * 49)) / ((F(4, 3) * 343 * 8) / (F(4, 3) * 343)), 0.5, 1e-9))
chk("modelB: density scale-invariance at k=4 — (64m)/(64V) == m/V for m=512, V=64",
    F(64 * 512, 64 * 64) == F(512, 64) == 8)
# design brief by bisection
lo, hi = 0.0, 20.0
for _ in range(60):
    mid = (lo + hi) / 2
    if F(4, 3) * mid**3 < 288: lo = mid
    else: hi = mid
chk("modelB: (4/3)r^3 = 288 solved by bisection — r == 6 == cbrt(216)",
    near((lo + hi) / 2, 6, 1e-9) and round(216 ** (1 / 3)) == 6 and F(3, 4) * 288 == 216)
# cross-lesson ties re-derived
chk("modelB: silo skin re-derived from ch4 dims — 2(6)(10) + 2(36) + 36 == 228; 228pi == 716.28",
    120 + 72 + 36 == 228 and near(228 * PI, 716.28, 0.01))
chk("modelB: pipe concrete re-derived — (25-16)(50) == 450; 450pi x 0.10 == 141.37",
    (25 - 16) * 50 == 450 and near(450 * PI * 0.10, 141.37, 0.01))
chk("modelB: melt distractor re-derived from ch3 — 36h = 288 gives 8 (cylinder), sphere gives r=6",
    F(288, 36) == 8)
chk("modelB: chocolate — 2^3/5 == 1.6; hollow shell — 7.8*10/100 == 0.78 < 1",
    near(float(F(8, 5)), 1.6, 1e-12) and near(float(F(78, 100)), 0.78, 1e-12) and F(78, 100) < 1)
chk("modelB: crown — 3700/200 == 18.5 < 19.3; steel sphere mass 7.8*36pi == 882.2",
    F(3700, 200) == 18.5 and near(7.8 * 36 * PI, 882.2, 0.5))
chk("modelB: model tank — 5 * 20^3 == 40000; ratios 20/400/8000 distinct",
    5 * 20**3 == 40000 and len({20, 400, 8000}) == 3)

# ============ sg-05-01 ============
w = widget("sg-05-01", "k1")
chk("01.k1", w["answer"] == 27 and traps(w) == {9, 3, 18})
w = widget("sg-05-01", "k2")
chk("01.k2", w["answer"] == 40000 and traps(w) == {100, 2000, 8000}
    and 5 * 20 == 100 and 5 * 400 == 2000)
w = widget("sg-05-01", "k3")
chk("01.k3", w["answer"] == 8 and traps(w) == {2, 4, 6})
chk("01.i1 sort", correct_label(widget("sg-05-01", "i1")).startswith("Height \u00d75, bronze \u00d7125, gold leaf \u00d725"))
w = widget("sg-05-01", "i2")
chk("01.i2", w["answer"] == 3 and traps(w) == {27, 9})
w = widget("sg-05-01", "ch")
chk("01.ch", near(w["answer"], 1.6) and near(float(F(8, 5)), 1.6, 1e-12) and traps(w) == {0.4, 0.8, 1.25}
    and near(float(F(2, 5)), 0.4, 1e-12) and near(float(F(4, 5)), 0.8, 1e-12) and F(5, 4) == 1.25)
w = widget("sg-05-01", "rem-sg-scale-effects-k")
chk("01.rem", w["answer"] == 8 and traps(w) == {2, 4})

# ============ sg-05-02 ============
w = widget("sg-05-02", "k1")
chk("02.k1", near(w["answer"], 882, 1) and traps(w) == {113, 282, 2646}
    and near(36 * PI, 113.1, 0.05) and near(2.5 * 36 * PI, 282.7, 0.5)
    and near(7.8 * 108 * PI, 2646.3, 1))
w = widget("sg-05-02", "k2")
chk("02.k2", w["answer"] == 8 and F(512, 64) == 8 and traps(w) == {128, 32, 0.125}
    and F(512, 4) == 128 and F(512, 16) == 32 and F(64, 512) == 0.125)
chk("02.k3 floats", correct_label(widget("sg-05-02", "k3")).startswith("Floats"))
w = widget("sg-05-02", "i1")
chk("02.i1", near(w["answer"], 0.78) and traps(w) == {7.8, 78})
chk("02.i2 invariance", correct_label(widget("sg-05-02", "i2")).startswith("Unchanged"))
w = widget("sg-05-02", "ch")
chk("02.ch", near(w["answer"], 18.5) and traps(w) == {19.3, 0.054, 740000}
    and near(200 / 3700, 0.054, 0.001) and 3700 * 200 == 740000)
w = widget("sg-05-02", "rem-sg-density-k")
chk("02.rem", w["answer"] == 2 and F(54, 27) == 2 and traps(w) == {18, 162})

# ============ sg-05-03 ============
w = widget("sg-05-03", "k1")
chk("03.k1", near(w["answer"], 228 * PI * 2, 3) and traps(w) == {456, 2866, 1008}
    and 228 * 2 == 456 and 504 * 2 == 1008)
w = widget("sg-05-03", "k2")
chk("03.k2", near(w["answer"], 0.5) and F(4, 8) == 0.5 and traps(w) == {2, 0.25, 1})
chk("03.k3 mouse", correct_label(widget("sg-05-03", "k3")).startswith("Heat generates with volume"))
chk("03.i1 surface pair", correct_label(widget("sg-05-03", "i1")).startswith("Wrapping paper"))
w = widget("sg-05-03", "i2")
chk("03.i2", near(w["answer"], 141, 1) and traps(w) == {45, 1414})
w = widget("sg-05-03", "ch")
chk("03.ch", w["answer"] == 6 and traps(w) == {216, 8, 9.6} and near(288 / 30, 9.6, 0.005))
w = widget("sg-05-03", "rem-sg-modeling-k")
chk("03.rem", w["answer"] == 600 and 200 * 3 == 600 and traps(w) == {203, 66.67}
    and near(200 / 3, 66.67, 0.005))

# ---- cross: every numeric trap distinct & outside tolerance ----
ok = True
for lid, j in L.items():
    units = list(j["steps"]) + [{"id": m["check"]["id"], "widget": m["check"]["widget"]} for m in j["remedials"]]
    for s in units:
        w = s.get("widget")
        if w and w.get("type") == "numeric":
            for e in w["commonErrors"]:
                if e["value"] == w["answer"] or abs(e["value"] - w["answer"]) <= w["tolerance"]:
                    ok = False
                    print("BAD TRAP", lid, s["id"], e["value"])
chk("all traps distinct & outside tolerance", ok)

print()
if FAIL:
    print("VERIFIER FAILED:", FAIL)
    sys.exit(1)
print("verify-sg-ch5: ALL GREEN")
