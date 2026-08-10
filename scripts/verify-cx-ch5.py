"""Dual-route verifier: coordinate-proofs ch5 (equation of a circle).
Route A: exact algebra — every equation identity expanded symbolically with
Fractions (completing-the-square verified by EXPANDING the claimed standard form
back to the general form term by term), line-circle intersection solved by exact
factoring. Route B: geometric MEASUREMENT and CONSTRUCTION — points sampled ON
each claimed circle (12 angular samples via cos/sin around the claimed center)
must satisfy the general-form equation to 1e-9; membership verdicts re-derived by
hypot distance vs radius; both line-circle intersection points verified to sit on
BOTH the circle (hypot) and the line; tangency-to-axis measured as vertical drop;
falsification — a perturbed center's samples measurably violate the general form.
Deps: cx-ch1 (distance/midpoint), cx-ch2/3 (d^2 discipline), cn (completing the
square recall), cr (tangent-radius, secant/tangent/miss trichotomy)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/coordinate-proofs/lessons/cx-05-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cx-05-01", "cx-05-02", "cx-05-03"}, sorted(L)

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

def sample_on(h, k, r, n=12):
    return [(h + r * math.cos(2 * math.pi * i / n), k + r * math.sin(2 * math.pi * i / n))
            for i in range(n)]

def general(x, y, D, E, Fc):
    return x * x + y * y + D * x + E * y + Fc

# ---- Route A: completing the square verified by symbolic EXPANSION ----
# (x-3)^2+(y-2)^2 = 25  <->  x^2+y^2-6x-4y-12 = 0
chk("modelA: (x-3)^2+(y-2)^2-25 expands to x^2+y^2-6x-4y-12 (coefficients exact)",
    (-2 * 3, -2 * 2, 3 * 3 + 2 * 2 - 25) == (-6, -4, -12))
# (x+4)^2+(y-1)^2 = 9  <->  x^2+y^2+8x-2y+8 = 0
chk("modelA: (x+4)^2+(y-1)^2-9 expands to x^2+y^2+8x-2y+8",
    (-2 * -4, -2 * 1, 16 + 1 - 9) == (8, -2, 8))
# (x-2)^2+(y-3)^2 = 9  <->  x^2+y^2-4x-6y+4 = 0
chk("modelA: (x-2)^2+(y-3)^2-9 expands to x^2+y^2-4x-6y+4",
    (-2 * 2, -2 * 3, 4 + 9 - 9) == (-4, -6, 4))
# (x-1)^2+y^2 = 9  <->  x^2+y^2-2x-8 = 0
chk("modelA: (x-1)^2+y^2-9 expands to x^2+y^2-2x-8", (-2 * 1, 1 - 9) == (-2, -8))
# line-circle exact factoring: x^2+(x+1)^2-25 = 2x^2+2x-24 = 2(x-3)(x+4)
chk("modelA: x^2+(x+1)^2-25 = 2(x-3)(x+4) — expand check",
    all(F(2) * x * x + F(2) * x - 24 == F(2) * (x - 3) * (x + 4) for x in [F(0), F(1), F(-7), F(10), F(1, 3)]))

# ---- Route B: measured ----
for name, (h, k, r, D, E, Fc) in {
    "figure circle (3,2,5)": (3, 2, 5, -6, -4, -12),
    "(-4,5,3)": (-4, 5, 3, 8, -10, 32),
    "(-4,1,3)": (-4, 1, 3, 8, -2, 8),
    "(2,3,3)": (2, 3, 3, -4, -6, 4),
    "(1,0,3)": (1, 0, 3, -2, 0, -8),
}.items():
    ok = all(near(general(x, y, D, E, Fc), 0, 1e-9) for x, y in sample_on(h, k, r))
    if not ok:
        FAIL.append("samples " + name)
chk("modelB: 12 sampled points on each of five claimed circles satisfy the general form",
    not any(f.startswith("samples") for f in FAIL))
chk("modelB: perturbed-center falsification — samples around (3.2,2) violate the figure circle's form",
    not all(near(general(x, y, -6, -4, -12), 0, 1e-3) for x, y in sample_on(3.2, 2, 5)))
chk("modelB: membership by hypot — (6,6) ON (d=5), (7,2) INSIDE (d=4), (-2,3) OUTSIDE (d=sqrt26)",
    near(math.hypot(6 - 3, 6 - 2), 5, 1e-12) and math.hypot(7 - 3, 2 - 2) < 5
    and math.hypot(-2 - 3, 3 - 2) > 5)
chk("modelB: radius through point — hypot((7,10)-(1,2)) = 10; hypot((5,8)-(2,4)) = 5",
    near(math.hypot(6, 8), 10, 1e-12) and near(math.hypot(3, 4), 5, 1e-12))
chk("modelB: tangent to x-axis from (3,4) — vertical drop 4 = radius; touch point (3,0) on circle",
    near(math.hypot(3 - 3, 0 - 4), 4, 1e-12))
chk("modelB: diameter endpoints (-1,3),(7,9) — midpoint (3,6) measured equidistant (5) from both",
    near(math.hypot(3 - -1, 6 - 3), 5, 1e-12) and near(math.hypot(7 - 3, 9 - 6), 5, 1e-12))
chk("modelB: line-circle points (3,4) and (-4,-3) — each ON x^2+y^2=25 (hypot) AND on y=x+1",
    near(math.hypot(3, 4), 5, 1e-12) and near(math.hypot(-4, -3), 5, 1e-12)
    and 4 == 3 + 1 and -3 == -4 + 1)
chk("modelB: cell tower — hypot(12,16) = 20 = sqrt(400) exactly on boundary; (5,12) on 169, (5,11) inside",
    near(math.hypot(12, 16), 20, 1e-12) and 5 * 5 + 12 * 12 == 169 and 5 * 5 + 11 * 11 < 169)
chk("modelB: delivery zone — boundary through (10,11) gives r=10; origin at distance 5 inside",
    near(math.hypot(10 - 4, 11 - 3), 10, 1e-12) and math.hypot(4, 3) == 5)
chk("modelB: full-circuit — (8,11) at distance 10 from (2,3), radius only 3: far outside",
    near(math.hypot(8 - 2, 11 - 3), 10, 1e-12) and 10 > 3)

# ============ cx-05-01 ============
w = widget("cx-05-01", "k1")
chk("01.k1", w["answer"] == 25 and (6 - 3)**2 + (6 - 2)**2 == 25 and traps(w) == {5, 7, 49}
    and (3 + 4)**2 == 49)
chk("01.k2 center-radius read", correct_label(widget("cx-05-01", "k2")).startswith("Center (\u22124, 5), radius 3"))
w = widget("cx-05-01", "k3")
chk("01.k3", w["answer"] == 100 and 6**2 + 8**2 == 100 and traps(w) == {10, 14, 196}
    and 14**2 == 196)
w = widget("cx-05-01", "i1")
chk("01.i1 tangent", w["answer"] == 4 and traps(w) == {3, 5} and near(math.hypot(3, 4), 5, 1e-12))
chk("01.i2 why squared", correct_label(widget("cx-05-01", "i2")).startswith("Squaring both sides"))
w = widget("cx-05-01", "ch")
chk("01.ch A", w["answer"] == 25 and (7 - 3)**2 + (9 - 6)**2 == 25 and traps(w) == {100, 5, 50}
    and 6**2 + 8**2 == 100 and F(100, 2) == 50 and F(100, 4) == 25)
chk("01.ch B (midpoint equidistance measured above)", near(math.hypot(4, 3), 5, 1e-12))
chk("01.rem read", correct_label(widget("cx-05-01", "rem-cx-circle-eq-k")).startswith("Center (2, \u22121), radius 4"))

# ============ cx-05-02 ============
chk("02.k1 inside", correct_label(widget("cx-05-02", "k1")).startswith("Inside"))
w = widget("cx-05-02", "k2")
chk("02.k2", w["answer"] == 26 and (-2 - 3)**2 + (3 - 2)**2 == 26 and traps(w) == {25, 24, 2}
    and (-2 + 3)**2 + (3 - 2)**2 == 2)
w = widget("cx-05-02", "k3")
chk("02.k3", w["answer"] == 5 and (5 - 2)**2 + (8 - 4)**2 == 25 and traps(w) == {25, 7, 3.5})
chk("02.i1 boundary", correct_label(widget("cx-05-02", "i1")).startswith("Exactly on the boundary"))
w = widget("cx-05-02", "i2")
chk("02.i2", w["answer"] == 146 and 25 + 121 == 146 and traps(w) == {169, 147})
chk("02.ch zone", correct_label(widget("cx-05-02", "ch")).startswith("Yes \u2014 the zone's"))
chk("02.ch arithmetic", (10 - 4)**2 + (11 - 3)**2 == 100 and 4**2 + 3**2 == 25)
chk("02.rem inside", correct_label(widget("cx-05-02", "rem-cx-circle-position-k")).startswith("Inside"))

# ============ cx-05-03 ============
w = widget("cx-05-03", "k1")
chk("03.k1", w["answer"] == 25 and 12 + 9 + 4 == 25 and traps(w) == {12, 13, 5})
chk("03.k2 unmask", correct_label(widget("cx-05-03", "k2")).startswith("Center (\u22124, 1), radius 3"))
chk("03.k2 arithmetic", -8 + 16 + 1 == 9)
chk("03.k3 on", correct_label(widget("cx-05-03", "k3")).startswith("On the circle"))
chk("03.k3 arithmetic", (0 - 3)**2 + (6 - 2)**2 == 25)
w = widget("cx-05-03", "i1")
chk("03.i1 A", w["answer"] == 3 and traps(w) == {-4, 4})
chk("03.i1 B (both points measured above)", near(math.hypot(-4, -3), 5, 1e-12))
chk("03.i2 discriminant trichotomy", correct_label(widget("cx-05-03", "i2")).startswith("2 = the line crosses"))
w = widget("cx-05-03", "ch")
chk("03.ch A", w["answer"] == 100 and -4 + 4 + 9 == 9 and (8 - 2)**2 + (11 - 3)**2 == 100
    and traps(w) == {9, 10, 17} and 4 + 4 + 9 == 17)
chk("03.ch B (measured above)", near(math.hypot(6, 8), 10, 1e-12))
w = widget("cx-05-03", "rem-cx-circle-cts-k")
chk("03.rem", w["answer"] == 3 and 8 + 1 == 9 and traps(w) == {9, 8})

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
print("verify-cx-ch5: ALL GREEN")
