"""Dual-route verifier: circle-theorems ch5 (arc length, sector area, cyclic quads).
Route A: exact Fraction arithmetic on (theta/360)*2*pi*r and (theta/360)*pi*r^2,
with the radian forms r*theta and r^2*theta/2 recomputed independently and forced
to agree symbolically (pi factored out). Route B: numerical integration/summation
— arc lengths MEASURED by summing chord segments along the actual curve; sector
areas MEASURED by the shoelace formula on a fine polygon fan; cyclic-quad
supplements MEASURED on constructed inscribed quadrilaterals (incl. a rectangle
inscribed via Thales diagonals and an isosceles trapezoid built from symmetric
arcs, plus a NON-cyclic falsification via a perturbed vertex). Deps: g7 (C=2*pi*r,
A=pi*r^2 recalls), tf-ch2 (radian reconciliation), cr-ch1 (inscribed halving),
pq (quadrilateral cast)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/circle-theorems/lessons/cr-05-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cr-05-01", "cr-05-02", "cr-05-03"}, sorted(L)

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

def P(deg, r=1.0):
    return (r * math.cos(math.radians(deg)), r * math.sin(math.radians(deg)))

def ang(V, A, B):
    a1 = math.atan2(A[1] - V[1], A[0] - V[0])
    a2 = math.atan2(B[1] - V[1], B[0] - V[0])
    d = abs(math.degrees(a1 - a2)) % 360
    return min(d, 360 - d)

def arc_measured(r, theta_deg, n=20000):
    """Sum chord segments along the real curve."""
    total = 0.0
    prev = P(0, r)
    for k in range(1, n + 1):
        cur = P(theta_deg * k / n, r)
        total += math.hypot(cur[0] - prev[0], cur[1] - prev[1])
        prev = cur
    return total

def sector_measured(r, theta_deg, n=20000):
    """Shoelace on the fan polygon center + arc samples."""
    pts = [(0.0, 0.0)] + [P(theta_deg * k / n, r) for k in range(n + 1)]
    s = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2

# ---- Route A: symbolic (pi factored out) ----
chk("modelA: arc 60/r9 = 3pi both routes (fraction vs radian, exact)",
    F(60, 360) * 2 * 9 == F(3) and F(9) * F(1, 3) == F(3))  # s = r*theta, theta = pi/3 -> coefficient 9*(1/3)
chk("modelA: arc 150/r12 = 10pi both routes",
    F(150, 360) * 2 * 12 == F(10) and F(12) * F(150, 180) == F(10))
chk("modelA: sector 90/r6 = 9pi both routes",
    F(90, 360) * 36 == F(9) and F(36, 2) * F(1, 2) == F(9))  # (1/2) r^2 theta, theta = pi/2 -> coeff 18*(1/2)
chk("modelA: sector 72/r10 = 20pi; 60/r4 = 8pi/3",
    F(72, 360) * 100 == F(20) and F(60, 360) * 16 == F(8, 3) and F(16, 2) * F(1, 3) == F(8, 3))
chk("modelA: reverse theta = (8pi/30pi)*360 = 96 and (15pi/36pi)*360 = 150",
    F(8, 30) * 360 == 96 and F(15, 36) * 360 == 150)

# ---- Route B: measured ----
chk("modelB: arc r=9 60deg measured = 3pi", near(arc_measured(9, 60), 3 * math.pi, 1e-4))
chk("modelB: arc r=12 150deg measured = 10pi", near(arc_measured(12, 150), 10 * math.pi, 1e-4))
chk("modelB: arc r=4 90deg measured = 2pi", near(arc_measured(4, 90), 2 * math.pi, 1e-4))
chk("modelB: semicircle r=30 measured = 30pi", near(arc_measured(30, 180), 30 * math.pi, 1e-3))
chk("modelB: sector r=6 90deg measured = 9pi", near(sector_measured(6, 90), 9 * math.pi, 1e-4))
chk("modelB: sector r=10 72deg measured = 20pi", near(sector_measured(10, 72), 20 * math.pi, 1e-4))
chk("modelB: sector r=8 135deg measured = 24pi", near(sector_measured(8, 135), 24 * math.pi, 1e-4))
chk("modelB: pizza tie measured — (12,30) sector == (6,120) sector == 12pi",
    near(sector_measured(12, 30), 12 * math.pi, 1e-4) and near(sector_measured(6, 120), 12 * math.pi, 1e-4))
# cyclic quads: A at arc position; opposite angles measured
# quad with A=95: choose arcs so inscribed at A halves arc BCD = 190. Vertices A(0), B(70), C(180), D(290):
# arc BCD (B->C->D not through A) = 290-70 = 220 -> angle A = 110... construct instead from arcs directly:
# want angle A = 95 -> arc BCD = 190; place B(30), D(360-140=220)? Simpler: A(0), B(85), C(190), D(275).
# arc B->C->D (not containing A) = 275-85 = 190 -> angle A = 95; arc D->A->B (not containing C) = (360-275)+85 = 170 -> angle C = 85.
QA, QB, QC, QD = P(0), P(85), P(190), P(275)
mA, mC = ang(QA, QB, QD), ang(QC, QB, QD)
mB, mD = ang(QB, QA, QC), ang(QD, QA, QC)
chk("modelB: cyclic quad constructed — A=95 C=85 measured, both pairs supplement",
    near(mA, 95, 1e-9) and near(mC, 85, 1e-9) and near(mB + mD, 180, 1e-9))
# rectangle inscribed: vertices at ±a, symmetric — diagonals are diameters (Thales tie)
RA, RB, RC, RD = P(30), P(150), P(210), P(330)
chk("modelB: inscribed rectangle measured — all four angles 90",
    all(near(ang(V, X, Y), 90, 1e-9) for V, X, Y in
        [(RA, RB, RD), (RB, RA, RC), (RC, RB, RD), (RD, RA, RC)]))
# isosceles trapezoid from symmetric arcs about the y-axis: A(60)/B(120) mirrored, C(200)/D(340) mirrored
# — AB and CD are parallel horizontal chords of DIFFERENT lengths (genuine trapezoid, not a rectangle).
TA, TB, TC, TD = P(60), P(120), P(200), P(340)
tA, tB = ang(TA, TB, TD), ang(TB, TA, TC)
tC, tD = ang(TC, TB, TD), ang(TD, TA, TC)
chk("modelB: inscribed isosceles trapezoid — base-angle pairs equal, opposite pairs supplement, NOT a rectangle",
    near(tA, tB, 1e-9) and near(tC, tD, 1e-9) and near(tA + tC, 180, 1e-9)
    and not near(tA, 90, 0.5))
# falsification: perturb one vertex OFF the circle — supplements break
QX = (1.3 * QC[0], 1.3 * QC[1])
chk("modelB: NON-cyclic falsification — off-circle vertex breaks the supplement",
    not near(mA + ang(QX, QB, QD), 180, 0.5))

# ============ cr-05-01 ============
w = widget("cr-05-01", "k1")
chk("01.k1", near(w["answer"], 3 * math.pi, 0.05) and traps(w) == {60, 56.55, 4.71}
    and near(18 * math.pi, 56.55, 0.01))
w = widget("cr-05-01", "k2")
chk("01.k2", near(w["answer"], 10 * math.pi, 0.05) and traps(w) == {75.4, 150, 15.71}
    and near(24 * math.pi, 75.4, 0.01))
w = widget("cr-05-01", "k3")
chk("01.k3 reconciliation", near(w["answer"], 2 * math.pi, 0.05) and traps(w) == {12.57, 3.14, 90})
chk("01.i1 both linear", correct_label(widget("cr-05-01", "i1")).startswith("Equivalent"))
w = widget("cr-05-01", "i2")
chk("01.i2 track", near(w["answer"], 30 * math.pi, 0.1) and traps(w) == {188.5, 30})
w = widget("cr-05-01", "ch")
chk("01.ch", w["answer"] == 96 and F(8, 30) * 360 == 96 and traps(w) == {25.13, 192, 48}
    and near(8 * math.pi, 25.13, 0.01))
w = widget("cr-05-01", "rem-cr-arc-length-k")
chk("01.rem", near(w["answer"], 4 * math.pi, 0.05) and traps(w) == {50.27, 90})

# ============ cr-05-02 ============
w = widget("cr-05-02", "k1")
chk("02.k1", near(w["answer"], 9 * math.pi, 0.05) and traps(w) == {113.1, 9.42, 14.14}
    and near(36 * math.pi, 113.1, 0.01))
w = widget("cr-05-02", "k2")
chk("02.k2", near(w["answer"], 20 * math.pi, 0.05) and traps(w) == {314.16, 12.57, 125.66}
    and near(4 * math.pi, 12.57, 0.01))
w = widget("cr-05-02", "k3")
chk("02.k3 radian check", near(w["answer"], 8 * math.pi / 3, 0.05) and traps(w) == {4.19, 16.76, 50.27}
    and near(4 * math.pi / 3, 4.19, 0.01))
chk("02.i1 pizza tie", correct_label(widget("cr-05-02", "i1")).startswith("Neither"))
w = widget("cr-05-02", "i2")
chk("02.i2 sprinkler", near(w["answer"], 24 * math.pi, 0.1) and traps(w) == {201.06, 18.85}
    and near(64 * math.pi, 201.06, 0.01))
w = widget("cr-05-02", "ch")
chk("02.ch", w["answer"] == 150 and F(15, 36) * 360 == 150 and traps(w) == {47.12, 75, 300}
    and near(15 * math.pi, 47.12, 0.01))
w = widget("cr-05-02", "rem-cr-sector-area-k")
chk("02.rem", near(w["answer"], 3 * math.pi, 0.05) and traps(w) == {28.27, 6.28})

# ============ cr-05-03 ============
w = widget("cr-05-03", "k1")
chk("03.k1 A", w["answer"] == 85 and 180 - 95 == 85 and traps(w) == {95, 265, 47.5}
    and 360 - 95 == 265)
chk("03.k1 B (measured above)", near(mC, 85, 1e-9))
chk("03.k2 ticket", correct_label(widget("cr-05-03", "k2")).startswith("Yes"))
chk("03.k2 arithmetic", 88 + 92 == 180 and 105 + 75 == 180 and 88 + 105 != 180)
chk("03.k3 rectangle", correct_label(widget("cr-05-03", "k3")).startswith("The rectangle"))
chk("03.i1 iso-trapezoid", correct_label(widget("cr-05-03", "i1")).startswith("Its co-interior angles"))
w = widget("cr-05-03", "i2")
chk("03.i2", w["answer"] == 63 and 180 - 117 == 63 and traps(w) == {117, 243})
w = widget("cr-05-03", "ch")
chk("03.ch", w["answer"] == 108 and 2 * 36 + 3 * 36 == 180 and 3 * 36 == 108
    and traps(w) == {72, 36, 90} and 2 * 36 == 72)
# Route B: construct the 72/108 cyclic quad and measure
# angle A = 72 -> arc BCD = 144; A(0), B(60), C(144+60=204)? Place: A(0), B(100), D(316), arc B..D not through A = 216 -> A=108... 
# simpler: reuse supplement structure — want A = 72: arc BCD = 144. A(0), B(72), C(144), D(216): arc B->C->D = 216-72 = 144 -> A = 72; C's arc D->A->B = (360-216)+72 = 216 -> C = 108.
GA, GB, GC, GD = P(0), P(72), P(144), P(216)
chk("03.ch B (72/108 quad constructed & measured)",
    near(ang(GA, GB, GD), 72, 1e-9) and near(ang(GC, GB, GD), 108, 1e-9))
w = widget("cr-05-03", "rem-cr-cyclic-quad-k")
chk("03.rem", w["answer"] == 110 and traps(w) == {70, 290})

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
print("verify-cr-ch5: ALL GREEN")
