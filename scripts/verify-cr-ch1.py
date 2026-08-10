"""Dual-route verifier: circle-theorems ch1 (central/inscribed angles, arcs, Thales).
Route A: exact Fraction arithmetic on the taught formulas. Route B: coordinate
circles — place points at computed angles on a unit circle and MEASURE every
claimed angle with atan2 (inscribed angles measured at multiple vertex positions
to verify the same-arc corollary; Thales measured at several rim points; the
carpenter converse checked by verifying a 90-degree viewer sits ON the circle
with the segment as diameter). Deps: cp (linear pairs/isosceles/exterior-angle
machinery behind the halving proof), rt-ch1 (Pythagoras for the diameter
computations), g7 (arc-of-circle recall context)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/circle-theorems/lessons/cr-01-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cr-01-01", "cr-01-02", "cr-01-03"}, sorted(L)

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

def P(deg):
    return (math.cos(math.radians(deg)), math.sin(math.radians(deg)))

def ang(V, A, B):
    a1 = math.atan2(A[1] - V[1], A[0] - V[0])
    a2 = math.atan2(B[1] - V[1], B[0] - V[0])
    d = abs(math.degrees(a1 - a2)) % 360
    return min(d, 360 - d)

# ---- Route B foundations: inscribed-angle theorem measured on a unit circle ----
# Arc endpoints at -40 and +40 (central angle 80); vertices scattered on major arc.
A80, B80 = P(-40), P(40)
chk("modelB: central 80 measured", near(ang((0, 0), A80, B80), 80, 1e-9))
chk("modelB: inscribed = half, from 4 different vertices (same-arc corollary)",
    all(near(ang(P(t), A80, B80), 40, 1e-9) for t in [100, 140, 180, 230]))
chk("modelB: inscribed on 120-arc measured 60",
    near(ang(P(150), P(-60), P(60)), 60, 1e-9))
# Thales measured
D1, D2 = P(180), P(0)
chk("modelB: Thales 90 at several rim points",
    all(near(ang(P(t), D1, D2), 90, 1e-9) for t in [35, 90, 118, 160]))
# acute complements measured: place C so angle A = 28 -> C at ? use inscribed: angle at D1 subtends arc from D2 to C
# angle A (at D1) = half arc (D2 to C not containing D1) -> arc = 56 -> C at 56 deg
C28 = P(56)
chk("modelB: Thales acute pair 28/62 measured",
    near(ang(D1, D2, C28), 28, 1e-9) and near(ang(D2, D1, C28), 62, 1e-9))
# carpenter converse: a point seeing segment (0,0)-(2,0) at 90 lies on circle center (1,0) r=1
seg1, seg2 = (0.0, 0.0), (2.0, 0.0)
V90 = (1 + math.cos(2.2), math.sin(2.2))  # a point ON that circle
chk("modelB: converse — on-circle point sees diameter at 90 (measured)",
    near(ang(V90, seg1, seg2), 90, 1e-9))
Voff = (1 + 1.3 * math.cos(2.2), 1.3 * math.sin(2.2))  # off-circle point
chk("modelB: off-circle point does NOT see 90 (falsification)",
    not near(ang(Voff, seg1, seg2), 90, 0.5))

# ============ cr-01-01 ============
chk("01.i1 measure vs length", correct_label(widget("cr-01-01", "i1")).startswith("Same MEASURE"))
w = widget("cr-01-01", "k1")
chk("01.k1", w["answer"] == 220 and F(360 - 140) == 220 and traps(w) == {140, 40, 110}
    and 180 - 140 == 40 and (360 - 140) / 2 == 110)
w = widget("cr-01-01", "k2")
chk("01.k2", w["answer"] == 155 and 360 - 110 - 95 == 155 and traps(w) == {205, 77.5, 25}
    and 110 + 95 == 205)
chk("01.k3 major naming", correct_label(widget("cr-01-01", "k3")).startswith("Major arc"))
w = widget("cr-01-01", "i2")
chk("01.i2 clock", w["answer"] == 210 and 7 * (360 // 12) == 210 and traps(w) == {180, 35})
w = widget("cr-01-01", "ch")
chk("01.ch A", w["answer"] == 160 and F(360, 9) * 4 == 160)
chk("01.ch B (audit sums)", 2 * 40 + 3 * 40 + 4 * 40 == 360)
chk("01.ch traps", traps(w) == {40, 80, 180} and F(360, 9) == 40 and 2 * 40 == 80)
w = widget("cr-01-01", "rem-cr-central-arcs-k")
chk("01.rem", w["answer"] == 260 and traps(w) == {80, 100} and 360 - 100 == 260)

# ============ cr-01-02 ============
w = widget("cr-01-02", "k1")
chk("02.k1 A", w["answer"] == 40 and F(80, 2) == 40 and traps(w) == {80, 160, 100}
    and 180 - 80 == 100)
chk("02.k1 B (measured above)", near(ang(P(140), A80, B80), 40, 1e-9))
w = widget("cr-01-02", "k2")
chk("02.k2", w["answer"] == 70 and 2 * 35 == 70 and traps(w) == {17.5, 35, 145} and 180 - 35 == 145)
w = widget("cr-01-02", "k3")
chk("02.k3 same-arc", w["answer"] == 40 and traps(w) == {20, 80})
w = widget("cr-01-02", "i1")
chk("02.i1", w["answer"] == 60 and F(120, 2) == 60 and traps(w) == {120, 240})
chk("02.i1 B (measured)", near(ang(P(150), P(-60), P(60)), 60, 1e-9))
chk("02.i2 definition", correct_label(widget("cr-01-02", "i2")).startswith("Vertex on the circle"))
w = widget("cr-01-02", "ch")
chk("02.ch A", w["answer"] == 71 and F(142, 2) == 71 and 2 * 24 == 48 and 360 - 48 - 142 == 170)
# Route B: build the inscribed triangle — arcs QR=48, RP=142, PQ=170.
# Place Q at 0; R at 48 (arc QR=48); P at 48+142=190 (arc RP=142); back to Q: 360-190=170 ✓
Q, R, Pp = P(0), P(48), P(190)
chk("02.ch B (triangle measured: P=24, Q=71, R=85)",
    near(ang(Pp, Q, R), 24, 1e-9) and near(ang(Q, R, Pp), 71, 1e-9)
    and near(ang(R, Pp, Q), 85, 1e-9)
    and near(ang(Pp, Q, R) + ang(Q, R, Pp) + ang(R, Pp, Q), 180, 1e-9))
chk("02.ch traps", traps(w) == {24, 142, 85} and F(170, 2) == 85)
w = widget("cr-01-02", "rem-cr-inscribed-k")
chk("02.rem", w["answer"] == 45 and traps(w) == {90, 180})

# ============ cr-01-03 ============
w = widget("cr-01-03", "k1")
chk("03.k1", w["answer"] == 90 and F(180, 2) == 90 and traps(w) == {180, 45, 60})
w = widget("cr-01-03", "k2")
chk("03.k2 A", w["answer"] == 62 and 90 - 28 == 62 and traps(w) == {28, 152, 118}
    and 180 - 28 == 152 and 90 + 28 == 118)
chk("03.k2 B (measured above)", near(ang(D2, D1, C28), 62, 1e-9))
chk("03.i1 converse", correct_label(widget("cr-01-03", "i1")).startswith("AB must be a diameter"))
chk("03.i2 carpenter", correct_label(widget("cr-01-03", "i2")).startswith("A circle through the nails"))
w = widget("cr-01-03", "k3")
chk("03.k3 A", w["answer"] == 26 and F(10)**2 + F(24)**2 == F(26)**2)
chk("03.k3 traps", traps(w) == {34, 13, 21.82} and 10 + 24 == 34
    and near(math.sqrt(576 - 100), 21.82))
# Route B: build the 10-24-26 Thales triangle on a diameter and measure the right angle
r13 = 13.0
cosA = (26**2 + 10**2 - 24**2) / (2 * 26 * 10)  # angle at A between diameter and leg 10
Cpt = (-r13 + 10 * cosA, 10 * math.sqrt(1 - cosA**2))
chk("03.k3 B (constructed: C on circle, right angle measured)",
    near(math.hypot(Cpt[0], Cpt[1]), 13, 1e-9)
    and near(ang(Cpt, (-13, 0), (13, 0)), 90, 1e-9)
    and near(math.hypot(Cpt[0] - 13, Cpt[1]), 24, 1e-9))
w = widget("cr-01-03", "ch")
chk("03.ch A", w["answer"] == 7.5 and F(9)**2 + F(12)**2 == F(15)**2 and F(15, 2) == 7.5)
chk("03.ch traps", traps(w) == {15, 10.5, 6} and (9 + 12) / 2 == 10.5)
w = widget("cr-01-03", "rem-cr-thales-k")
chk("03.rem", w["answer"] == 90 and traps(w) == {180, 60})

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
print("verify-cr-ch1: ALL GREEN")
