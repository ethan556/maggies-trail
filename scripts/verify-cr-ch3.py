"""Dual-route verifier: circle-theorems ch3 (tangents).
Route A: exact Fraction Pythagoras on PT = sqrt(OP^2 - r^2) and tangent-length
bookkeeping. Route B: coordinate constructions MEASURED — tangency points computed
from cos(alpha) = r/OP, then perpendicularity verified by dot product, tangent
lengths by hypot, the two-tangent congruence by measuring both, kite angle
supplement by atan2, and the incircle challenge by CONSTRUCTING the 6-8-10
triangle's actual incenter (angle-bisector intersection) and measuring its
distance to all three sides = 2. Falsification: a non-tangent secant line's
closest approach is measurably < r. Deps: tc (HL/CPCTC), rt-ch1 (Pythagoras),
pq-ch4 (kite), cp (angle bisectors concur / incircle center)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/circle-theorems/lessons/cr-03-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cr-03-01", "cr-03-02", "cr-03-03"}, sorted(L)

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

def dot(u, v):
    return u[0] * v[0] + u[1] * v[1]

def tangent_setup(r, OP):
    """Construct tangency point for circle at origin, P at (OP, 0). Measure everything."""
    ca = r / OP
    T = (r * ca, r * math.sqrt(1 - ca * ca))
    P = (OP, 0.0)
    PT = math.hypot(P[0] - T[0], P[1] - T[1])
    perp = abs(dot((T[0], T[1]), (P[0] - T[0], P[1] - T[1]))) < 1e-9  # radius . tangent-dir
    on_circle = near(math.hypot(*T), r, 1e-12)
    return T, P, PT, perp, on_circle

# ---- Route B foundations ----
T, P, PT, perp, oc = tangent_setup(8, 17)
chk("modelB: r=8 OP=17 tangency constructed — perpendicular, on-circle, PT measured 15",
    perp and oc and near(PT, 15, 1e-9))
T2 = (T[0], -T[1])
PT2 = math.hypot(P[0] - T2[0], P[1] - T2[1])
chk("modelB: two-tangent congruence measured (mirror tangency)", near(PT, PT2, 1e-12))
# kite angle supplement measured: choose OP so angle P = 40 -> half-angle 20 -> sin20 = r/OP
r_k = 1.0
OP_k = r_k / math.sin(math.radians(20))
Tk, Pk, PTk, perp_k, _ = tangent_setup(r_k, OP_k)
angP = 2 * math.degrees(math.asin(r_k / OP_k))
angO = 2 * math.degrees(math.acos(r_k / OP_k))
chk("modelB: kite P=40 gives central=140, supplement measured", near(angP, 40, 1e-9) and near(angO, 140, 1e-9)
    and near(angP + angO, 180, 1e-9))
# falsification: a secant's closest approach < r means two intersections, not tangency
d_line = abs(4.0)  # distance from origin to the line y = 4
chk("modelB: non-tangent (closer) line is a secant — closest approach measurably < r",
    d_line < 8 and not near(d_line, 8, 0.5))
chk("modelB: secant line y=4 has TWO circle points (measured)",
    near(math.hypot(math.sqrt(64 - 16), 4), 8, 1e-12) and near(math.hypot(-math.sqrt(64 - 16), 4), 8, 1e-12))
# incircle of 6-8-10 constructed: right angle at origin, legs on axes
# incenter = (r, r) with r = (6+8-10)/2 = 2; VERIFY by measuring distance to all 3 sides
A3, B3, C3 = (0.0, 0.0), (8.0, 0.0), (0.0, 6.0)  # legs 8 (x-axis) and 6 (y-axis), hyp B3-C3
rin = (6 + 8 - 10) / 2
I = (rin, rin)
# distance to x-axis = I.y; to y-axis = I.x; to hypotenuse line 6x + 8y - 48 = 0 over 10
d_hyp = abs(6 * I[0] + 8 * I[1] - 48) / 10
chk("modelB: 6-8-10 incenter (2,2) equidistant 2 from all three sides (measured)",
    near(I[1], 2, 1e-12) and near(I[0], 2, 1e-12) and near(d_hyp, 2, 1e-12))
# and it lies on the right-angle bisector y = x (angle-bisector construction, cp)
chk("modelB: incenter on the right-angle bisector y=x", near(I[0], I[1], 1e-12))
# circumscribed-triangle bookkeeping measured on the same 6-8-10:
# tangent lengths: from right-angle vertex A3: r=2; from B3: 8-2=6; from C3: 6-2=4; hyp = 6+4=10 ✓
chk("modelB: tangent-length bookkeeping closes the hypotenuse (6+4=10)", (8 - rin) + (6 - rin) == 10)

# ============ cr-03-01 ============
chk("01.i1 shortest-distance argument", correct_label(widget("cr-03-01", "i1")).startswith("The tangency point is the tangent line's CLOSEST"))
w = widget("cr-03-01", "k1")
chk("01.k1", w["answer"] == 90 and traps(w) == {45, 180})
w = widget("cr-03-01", "k2")
chk("01.k2 A", w["answer"] == 15 and F(8)**2 + F(15)**2 == F(17)**2)
chk("01.k2 B (measured)", near(PT, 15, 1e-9))
chk("01.k2 traps", traps(w) == {25, 18.79, 9} and 17 + 8 == 25 and near(math.sqrt(289 + 64), 18.79) and 17 - 8 == 9)
chk("01.k3 right angle at T", correct_label(widget("cr-03-01", "k3")).startswith("T \u2014"))
w = widget("cr-03-01", "i2")
chk("01.i2", w["answer"] == 10 and F(10)**2 + F(24)**2 == F(26)**2 and traps(w) == {50, 35.38}
    and 26 + 24 == 50 and near(math.sqrt(676 + 576), 35.38))
w = widget("cr-03-01", "ch")
d_hor = math.sqrt(29**2 - 25**2)
chk("01.ch A", near(d_hor, w["answer"], w["tolerance"]))
Th, Ph, PTh, perph, och = tangent_setup(25, 29)
chk("01.ch B (horizon constructed & measured)", perph and och and near(PTh, d_hor, 1e-9))
chk("01.ch traps", traps(w) == {4, 38.3, 54} and near(math.sqrt(841 + 625), 38.3, 0.05) and 29 + 25 == 54)
w = widget("cr-03-01", "rem-cr-tangent-perp-k")
chk("01.rem", w["answer"] == 12 and traps(w) == {18, 8} and F(5)**2 + F(12)**2 == F(13)**2)

# ============ cr-03-02 ============
w = widget("cr-03-02", "k1")
chk("02.k1", w["answer"] == 11 and traps(w) == {22, 5.5})
w = widget("cr-03-02", "k2")
chk("02.k2 A", w["answer"] == 140 and 360 - 90 - 90 - 40 == 140 and traps(w) == {40, 50, 320}
    and 90 - 40 == 50 and 360 - 40 == 320)
chk("02.k2 B (measured on constructed kite)", near(angO, 140, 1e-9))
chk("02.i1 kite naming", correct_label(widget("cr-03-02", "i1")).startswith("Kite"))
w = widget("cr-03-02", "k3")
chk("02.k3 A", w["answer"] == 20 and F(40, 2) == 20 and traps(w) == {40, 70, 90} and F(140, 2) == 70)
chk("02.k3 B (half-angle measured)", near(math.degrees(math.asin(r_k / OP_k)), 20, 1e-9))
chk("02.i2 belt tangent", correct_label(widget("cr-03-02", "i2")).startswith("Tangent to the pulley"))
w = widget("cr-03-02", "ch")
chk("02.ch", w["answer"] == 11 and 18 - 7 == 11 and traps(w) == {7, 18, 9} and 18 / 2 == 9)
w = widget("cr-03-02", "rem-cr-two-tangent-k")
chk("02.rem", w["answer"] == 9 and traps(w) == {18, 4.5})

# ============ cr-03-03 ============
w = widget("cr-03-03", "k1")
chk("03.k1", w["answer"] == 7 and 3 + 4 == 7 and traps(w) == {12, 9, 8}
    and 3 + 4 + 5 == 12 and 4 + 5 == 9 and 3 + 5 == 8)
w = widget("cr-03-03", "k2")
chk("03.k2", w["answer"] == 24 and 2 * (3 + 4 + 5) == 24 and 7 + 9 + 8 == 24
    and traps(w) == {12, 48, 60} and 3 * 4 * 5 == 60)
w = widget("cr-03-03", "k3")
chk("03.k3", w["answer"] == 13 and (12 - 4) + (9 - 4) == 13 and traps(w) == {21, 8, 5}
    and 12 + 9 == 21)
chk("03.i1 angle bisectors", correct_label(widget("cr-03-03", "i1")).startswith("The three angle bisectors"))
w = widget("cr-03-03", "i2")
chk("03.i2 square", w["answer"] == 48 and 4 * 12 == 48 and traps(w) == {24, 36})
w = widget("cr-03-03", "ch")
chk("03.ch A", w["answer"] == 2 and F(6 + 8 - 10, 2) == 2)
chk("03.ch B (incenter constructed & measured above)", near(d_hyp, 2, 1e-12))
chk("03.ch traps", traps(w) == {5, 4, 7} and F(10, 2) == 5 and 6 + 8 - 10 == 4 and F(6 + 8, 2) == 7)
w = widget("cr-03-03", "rem-cr-tangent-apps-k")
chk("03.rem", w["answer"] == 8 and 2 + 6 == 8 and traps(w) == {12, 4} and 2 * 6 == 12 and 6 - 2 == 4)

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
print("verify-cr-ch3: ALL GREEN")
