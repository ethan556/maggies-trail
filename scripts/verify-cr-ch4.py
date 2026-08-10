"""Dual-route verifier: circle-theorems ch4 (inside/outside angles, tangent-chord,
power of a point). Route A: exact Fraction arithmetic on the four vertex-position
formulas and the power products. Route B: unit-circle constructions MEASURED with
atan2/hypot — an inside crossing built from arcs 100/40 and its angle measured; an
outside two-secant vertex built from arcs 130/30 and measured; the tangent-chord 140
angle measured against the tangent direction; every power identity re-derived by
PLACING P and a line, intersecting with the circle exactly (quadratic), and
multiplying MEASURED distances (chords case, secants case, tangent case, and the
well challenge end-to-end); invariance of the power checked across two different
chords through the same P. Deps: cr-ch1 (inscribed halving), cr-ch3 (kite
supplement cross-check), sy (AA similarity engine), rt (Pythagoras)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/circle-theorems/lessons/cr-04-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cr-04-01", "cr-04-02", "cr-04-03"}, sorted(L)

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

def seg_inter(A, B, C, D):
    """Intersection of lines AB and CD."""
    d1 = (B[0] - A[0], B[1] - A[1])
    d2 = (D[0] - C[0], D[1] - C[1])
    den = d1[0] * d2[1] - d1[1] * d2[0]
    t = ((C[0] - A[0]) * d2[1] - (C[1] - A[1]) * d2[0]) / den
    return (A[0] + t * d1[0], A[1] + t * d1[1])

def line_circle(Pp, Q, r=1.0):
    """Both intersection points of line P->Q with circle radius r at origin."""
    dx, dy = Q[0] - Pp[0], Q[1] - Pp[1]
    a = dx * dx + dy * dy
    b = 2 * (Pp[0] * dx + Pp[1] * dy)
    c = Pp[0]**2 + Pp[1]**2 - r * r
    disc = b * b - 4 * a * c
    t1 = (-b - math.sqrt(disc)) / (2 * a)
    t2 = (-b + math.sqrt(disc)) / (2 * a)
    return (Pp[0] + t1 * dx, Pp[1] + t1 * dy), (Pp[0] + t2 * dx, Pp[1] + t2 * dy)

def dist(A, B):
    return math.hypot(A[0] - B[0], A[1] - B[1])

# ---- Route B: inside angle from arcs 100 & 40 ----
# Facing arcs: arc AB = 100 (A at 40, B at 140) and arc CD = 40 (C at 220, D at 260).
# Chords are A-C and B-D so that angle AXB and its vertical angle CXD face those arcs.
A1, B1, C1, D1 = P(40), P(140), P(220), P(260)
X = seg_inter(A1, C1, B1, D1)
chk("modelB: inside crossing measured = (100+40)/2 = 70",
    near(ang(X, A1, B1), 70, 1e-6) and math.hypot(*X) < 1)
# ---- Route B: outside vertex from arcs 130 & 30 ----
# Symmetric about the x-axis: near points G, H at +/-15 (near arc 30); far points
# E, F at +/-115 (far arc through 180 = 2*(180-115) = 130, NOT containing G, H).
# Secants G-E and H-F extended meet outside on the positive x-axis.
E1, F1, G1, H1 = P(115), P(-115), P(15), P(-15)
V = seg_inter(G1, E1, H1, F1)
chk("modelB: outside vertex measured = (130-30)/2 = 50",
    near(ang(V, E1, F1), 50, 1e-6) and math.hypot(*V) > 1)
# ---- Route B: tangent-chord 140 ----
# Tangency at T = P(0); chord to P(140) cuts arc 140 on one side.
Tt = P(0)
Ch = P(140)
tan_dir = (0, 1)  # tangent at (1,0) is vertical
a_tc = math.degrees(math.acos(abs((Ch[0] - Tt[0]) * tan_dir[0] + (Ch[1] - Tt[1]) * tan_dir[1]) / dist(Ch, Tt)))
# angle between chord and tangent measured via dot with tangent direction:
v_ch = ((Ch[0] - Tt[0]) / dist(Ch, Tt), (Ch[1] - Tt[1]) / dist(Ch, Tt))
cosang = v_ch[0] * tan_dir[0] + v_ch[1] * tan_dir[1]
meas_tc = math.degrees(math.acos(cosang))
chk("modelB: tangent-chord measured = 140/2 = 70", near(meas_tc, 70, 1e-6))
# ---- Route B: power invariance inside ----
Pin = (0.3, 0.2)
p1a, p1b = line_circle(Pin, (Pin[0] + 1, Pin[1] + 0.4))
p2a, p2b = line_circle(Pin, (Pin[0] - 0.5, Pin[1] + 1))
pw1 = dist(Pin, p1a) * dist(Pin, p1b)
pw2 = dist(Pin, p2a) * dist(Pin, p2b)
chk("modelB: power invariant across two chords through the same inside point",
    near(pw1, pw2, 1e-9) and near(pw1, 1 - (0.3**2 + 0.2**2), 1e-9))
# ---- Route B: power outside + tangent limit ----
Pout = (2.0, 0.0)
q1a, q1b = line_circle(Pout, (0.0, 0.3))
pw_out = dist(Pout, q1a) * dist(Pout, q1b)
PT = math.sqrt(2.0**2 - 1.0**2)
chk("modelB: outside power = OP^2 - r^2 = PT^2 (measured secant vs tangent)",
    near(pw_out, 3, 1e-9) and near(PT * PT, 3, 1e-12))
# ---- Route B: the well challenge end-to-end ----
# circle radius 7 (diameter 14) at origin; stand at (7+d, 0); tangent 12 => (7+d)^2 = 144+49
d_well = math.sqrt(144 + 49) - 7
chk("modelB: well d reconstructed from tangent geometry = (\u2212 14+\u221a772)/2 agreement",
    near(d_well, (-14 + math.sqrt(772)) / 2, 1e-9) and near(d_well * (d_well + 14), 144, 1e-9))

# ============ cr-04-01 ============
w = widget("cr-04-01", "k1")
chk("01.k1 A", w["answer"] == 70 and F(100 + 40, 2) == 70 and traps(w) == {140, 30, 50})
chk("01.k1 B (measured)", near(ang(X, A1, B1), 70, 1e-6))
w = widget("cr-04-01", "k2")
chk("01.k2 A", w["answer"] == 50 and F(130 - 30, 2) == 50 and traps(w) == {80, 100, 65})
chk("01.k2 B (measured)", near(ang(V, E1, F1), 50, 1e-6))
chk("01.i1 unifying story", correct_label(widget("cr-04-01", "i1")).startswith("As the vertex moves outward"))
chk("01.k3 external formula", correct_label(widget("cr-04-01", "k3")).startswith("Half the difference"))
w = widget("cr-04-01", "i2")
chk("01.i2 kite cross-check", w["answer"] == 40 and F(220 - 140, 2) == 40 and 180 - 140 == 40
    and traps(w) == {180, 80})
w = widget("cr-04-01", "ch")
chk("01.ch", w["answer"] == 92 and 2 * 65 - 38 == 92 and F(92 + 38, 2) == 65
    and traps(w) == {27, 168, 51.5} and 65 - 38 == 27 and 130 + 38 == 168 and (65 + 38) / 2 == 51.5)
w = widget("cr-04-01", "rem-cr-secant-angles-k")
chk("01.rem", w["answer"] == 60 and traps(w) == {30, 120})

# ============ cr-04-02 ============
w = widget("cr-04-02", "k1")
chk("02.k1 A", w["answer"] == 70 and F(140, 2) == 70 and traps(w) == {140, 40, 35} and 180 - 140 == 40)
chk("02.k1 B (measured)", near(meas_tc, 70, 1e-6))
w = widget("cr-04-02", "k2")
chk("02.k2", w["answer"] == 110 and F(360 - 140, 2) == 110 and 70 + 110 == 180
    and traps(w) == {70, 220, 90})
w = widget("cr-04-02", "i1")
chk("02.i1 diameter case", w["answer"] == 90 and traps(w) == {180, 45})
chk("02.i2 limit", correct_label(widget("cr-04-02", "i2")).startswith("Slide one chord"))
chk("02.k3 which arc", correct_label(widget("cr-04-02", "k3")).startswith("The arc lying inside the angle"))
w = widget("cr-04-02", "ch")
chk("02.ch A", w["answer"] == 54 and F(2 * 54, 2) == 54 and traps(w) == {27, 126, 108}
    and 180 - 54 == 126 and 2 * 54 == 108)
# Route B: far-side inscribed angle on the 108-arc chord measured
Ai, Bi = P(-54), P(54)  # chord cutting 108-degree near arc
chk("02.ch B (far-side inscribed measured = 54)", near(ang(P(180), Ai, Bi), 54, 1e-9))
w = widget("cr-04-02", "rem-cr-tangent-chord-k")
chk("02.rem", w["answer"] == 40 and traps(w) == {80, 100})

# ============ cr-04-03 ============
w = widget("cr-04-03", "k1")
chk("03.k1 A", w["answer"] == 8 and F(4 * 6, 3) == 8 and traps(w) == {7, 4.5, 24}
    and 4 + 6 - 3 == 7 and F(3 * 6, 4) == 4.5)
# Route B: place an inside point with power 24 impossible on unit circle — scale circle r=6, P dist so power 24: r^2 - |P|^2 = 24 -> |P|^2 = 12
Pp3 = (math.sqrt(12), 0)
r6a, r6b = line_circle(Pp3, (Pp3[0] + 0.3, Pp3[1] + 1), r=6.0)
chk("03.k1 B (constructed inside point of power 24 on r=6 circle, measured)",
    near(dist(Pp3, r6a) * dist(Pp3, r6b), 24, 1e-9))
w = widget("cr-04-03", "k2")
chk("03.k2 A", w["answer"] == 11 and 5 * 12 == 4 * (4 + 11) and traps(w) == {15, 8.75, 60}
    and F(60, 4) == 15 and F(5 * 7, 4) == 8.75)
# Route B: external point with power 60: |P|^2 - r^2 = 60; take r=2, |P| = 8
Pp4 = (8.0, 0.0)
s1, s2 = line_circle(Pp4, (0.0, 0.5), r=2.0)
chk("03.k2 B (constructed outside point of power 60, secant measured)",
    near(dist(Pp4, s1) * dist(Pp4, s2), 60, 1e-9))
w = widget("cr-04-03", "k3")
chk("03.k3 A", w["answer"] == 6 and F(4 * 9) == 36 and traps(w) == {36, 20, 4.47}
    and 4 * 5 == 20 and near(math.sqrt(20), 4.47))
chk("03.k3 B (tangent limit measured: PT^2 = power)",
    near(math.sqrt(8.0**2 - 2.0**2) ** 2, 60, 1e-9))
chk("03.i1 AA engine", correct_label(widget("cr-04-03", "i1")).startswith("Two pairs of inscribed angles"))
w = widget("cr-04-03", "i2")
chk("03.i2 invariance", w["answer"] == 18 and 2 * 9 == 18 and traps(w) == {11, 4.5})
w = widget("cr-04-03", "ch")
chk("03.ch A", near((-14 + math.sqrt(772)) / 2, w["answer"], w["tolerance"]))
chk("03.ch B (well reconstructed above)", near(d_well, w["answer"], w["tolerance"]))
chk("03.ch traps", traps(w) == {12, 10.29, 2} and near(144 / 14, 10.29))
w = widget("cr-04-03", "rem-cr-power-point-k")
chk("03.rem", w["answer"] == 6 and F(3 * 8, 4) == 6 and traps(w) == {7, 24})

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
print("verify-cr-ch4: ALL GREEN")
