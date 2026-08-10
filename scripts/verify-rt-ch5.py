"""Dual-route verifier: right-triangles-trig ch5 (ratio relationships + intro laws).
Route A: exact Fraction identities / stated-formula evaluation. Route B: independent
coordinate-geometry reconstruction — place the triangle with actual coordinates and
measure sides/angles/areas with hypot, atan2, and the shoelace formula, never
re-running Route A's formula. Proof deps: rt-ch1 (Pythagoras -> sin^2+cos^2=1;
special angles sin30=1/2), rt-ch2 (ratio definitions, cofunction seed, 5-12-13 and
7-24-25 triples), rt-ch3 (inverse trig), sy (similarity). No tf dep (trig-seam
decision: laws stay basic/intro here; full trig-function treatment lives in tf)."""
import json, glob, math, sys
from fractions import Fraction as F

r = math.radians
d = math.degrees

L = {j["id"]: j for f in glob.glob("content/courses/right-triangles-trig/lessons/rt-05-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"rt-05-01", "rt-05-02", "rt-05-03", "rt-05-04"}, sorted(L)

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

# ---- deps ----
chk("dep: 3-4-5, 5-12-13, 7-24-25 triples", F(3)**2 + F(4)**2 == F(5)**2
    and F(5)**2 + F(12)**2 == F(13)**2 and F(7)**2 + F(24)**2 == F(25)**2)
chk("dep: sin30 = 1/2 exact", near(math.sin(r(30)), 0.5, 1e-12))

# ============ rt-05-01 ============
w = widget("rt-05-01", "k1")  # quotient identity: 0.6/0.8 = 0.75
chk("01.k1 A", w["answer"] == 0.75 and F(6, 10) / F(8, 10) == F(3, 4))
th = math.atan2(3, 4)  # route B: the 3-4-5 angle itself
chk("01.k1 B", near(math.tan(th), 0.75, 1e-12))
chk("01.k1 traps", traps(w) == {0.48, 1.33, 0.2} and F(6, 10) * F(8, 10) == F(12, 25)
    and near(0.8 / 0.6, 1.33, 0.005) and near(0.8 - 0.6, 0.2, 1e-12))

w = widget("rt-05-01", "k2")  # cos from sin 5/13 -> 12/13
chk("01.k2 A", near(float(F(12, 13)), w["answer"], w["tolerance"]) and F(5, 13)**2 + F(12, 13)**2 == 1)
chk("01.k2 B", near(math.cos(math.asin(5 / 13)), 12 / 13, 1e-12))
chk("01.k2 traps", traps(w) == {0.6154, 0.4167, 0.8521} and near(1 - 5 / 13, 0.6154)
    and near(5 / 12, 0.4167) and near(144 / 169, 0.8521))

chk("01.i1 cofunction", correct_label(widget("rt-05-01", "i1")) == "cos 70\u00b0"
    and near(math.sin(r(20)), math.cos(r(70)), 1e-12))
chk("01.i2 identity test", correct_label(widget("rt-05-01", "i2")).startswith("0.9\u00b2 + 0.5\u00b2")
    and near(0.9**2 + 0.5**2, 1.06, 1e-12))

w = widget("rt-05-01", "k3")  # cos34 = sin56
chk("01.k3", w["answer"] == 56 and near(math.cos(r(34)), math.sin(r(56)), 1e-12)
    and traps(w) == {34, 146} and 180 - 34 == 146)

w = widget("rt-05-01", "ch")  # sin=0.28 -> tan = 7/24 = 0.2917
chk("01.ch A", near(float(F(7, 24)), w["answer"], w["tolerance"]) and F(28, 100) == F(7, 25))
chk("01.ch B", near(math.tan(math.asin(0.28)), 7 / 24, 1e-12))
chk("01.ch traps", traps(w) == {0.72, 0.2688, 3.4286} and near(1 - 0.28, 0.72, 1e-12)
    and near(0.28 * 0.96, 0.2688, 1e-9) and near(0.96 / 0.28, 3.4286, 0.0001))
chk("01.ch cos step", near(math.sqrt(1 - 0.28**2), 0.96, 1e-9))

w = widget("rt-05-01", "rem-rt-ratio-identities-k")
chk("01.rem", w["answer"] == 0.6 and near(math.sqrt(1 - 0.8**2), 0.6, 1e-9)
    and traps(w) == {0.2, 0.36})

# ============ rt-05-02 ============
# Independent route B: build the triangle A=40, B=65, a=12 in coordinates.
A_deg, B_deg, a_side = 40, 65, 12
C_deg = 180 - A_deg - B_deg
common = a_side / math.sin(r(A_deg))
b_true = common * math.sin(r(B_deg))
c_true = common * math.sin(r(C_deg))
# coordinates: place B at origin, C at (a,0); A found by intersecting rays.
# Instead verify with law of cosines (independent formula family):
b_check = math.sqrt(a_side**2 + c_true**2 - 2 * a_side * c_true * math.cos(r(B_deg)))
chk("02 route-B consistency (cosines cross-check)", near(b_check, b_true, 1e-9))

w = widget("rt-05-02", "k1")
chk("02.k1 A", near(b_true, w["answer"], w["tolerance"]))
chk("02.k1 traps", traps(w) == {8.51, 10.88, 18.67} and near(12 * math.sin(r(40)) / math.sin(r(65)), 8.51)
    and near(12 * math.sin(r(65)), 10.88) and near(12 / math.sin(r(40)), 18.67))
chk("02.k1 big-angle big-side", b_true > 12 and B_deg > A_deg)

w = widget("rt-05-02", "i2")
chk("02.i2", w["answer"] == 75 and traps(w) == {105, 55} and 180 - 40 - 65 == 75)

w = widget("rt-05-02", "k2")
chk("02.k2 A", near(c_true, w["answer"], w["tolerance"]))
chk("02.k2 traps", traps(w) == {7.99, 11.59} and near(12 * math.sin(r(40)) / math.sin(r(75)), 7.99)
    and near(12 * math.sin(r(75)), 11.59))
chk("02.k2 largest side faces largest angle", c_true > b_true > a_side and C_deg > B_deg > A_deg)

chk("02.k3 SSS-of-angles insufficient", correct_label(widget("rt-05-02", "k3")).startswith("All three angles"))

w = widget("rt-05-02", "ch")  # surveyor: AT = 60 sin58/sin50
C2 = 180 - 72 - 58
AT = 60 * math.sin(r(58)) / math.sin(r(C2))
BT = 60 * math.sin(r(72)) / math.sin(r(C2))
chk("02.ch A", C2 == 50 and near(AT, w["answer"], w["tolerance"]))
# Route B: coordinates. A=(0,0), B=(60,0); T at intersection of ray from A at 72deg and from B at 180-58.
tA, tB = math.tan(r(72)), math.tan(r(58))
xT = 60 * tB / (tA + tB)
yT = xT * tA
AT_coord = math.hypot(xT, yT)
BT_coord = math.hypot(60 - xT, yT)
chk("02.ch B (coordinate intersection)", near(AT_coord, AT, 1e-9) and near(BT_coord, BT, 1e-9))
chk("02.ch traps", traps(w) == {74.49, 54.2} and near(BT, 74.49, 0.01)
    and near(60 * math.sin(r(50)) / math.sin(r(58)), 54.2, 0.01))

w = widget("rt-05-02", "rem-rt-law-sines-k")
chk("02.rem", w["answer"] == 5 and near(10 * math.sin(r(30)) / math.sin(r(90)), 5, 1e-12)
    and traps(w) == {20, 10})

# ============ rt-05-03 ============
w = widget("rt-05-03", "k1")  # SAS 7,9,52 -> 7.24
c_sq = 7**2 + 9**2 - 2 * 7 * 9 * math.cos(r(52))
chk("03.k1 A", near(math.sqrt(c_sq), w["answer"], w["tolerance"]))
# Route B coordinates: C at origin, a=7 along x, b=9 at 52deg; measure the far side.
P = (7, 0)
Q = (9 * math.cos(r(52)), 9 * math.sin(r(52)))
c_coord = math.hypot(P[0] - Q[0], P[1] - Q[1])
chk("03.k1 B (coordinates)", near(c_coord, math.sqrt(c_sq), 1e-9))
chk("03.k1 traps", traps(w) == {11.4, 14.41, 52.43} and near(math.sqrt(130), 11.4)
    and near(math.sqrt(130 + 126 * math.cos(r(52))), 14.41) and near(c_sq, 52.43, 0.01))

w = widget("rt-05-03", "k2")  # SSS 5,7,10 -> 111.8
cosC = (25 + 49 - 100) / (2 * 5 * 7)
chk("03.k2 A", near(d(math.acos(cosC)), w["answer"], w["tolerance"]) and cosC == -26 / 70)
# Route B coordinates: place sides 5 and 7 from origin; find angle via dot product of located triangle.
# Build triangle with sides 5,7,10: A=(0,0), B=(10,0); C located by circle intersection r_A=5? side opposite 10 is between the 5 and 7 sides' junction.
# Vertex with the sought angle joins sides 5 and 7. Place it at origin, side 5 along x: other endpoints X=(5,0) and Y at angle t with |Y|=7, need |X-Y|=10.
t = math.acos(cosC)
Y = (7 * math.cos(t), 7 * math.sin(t))
chk("03.k2 B (coordinates)", near(math.hypot(5 - Y[0], Y[1]), 10, 1e-9))
chk("03.k2 obtuse flag", cosC < 0 and d(math.acos(cosC)) > 90)
chk("03.k2 traps", traps(w) == {68.2, 27.7} and near(d(math.acos(-cosC)), 68.2, 0.05)
    and near(d(math.acos((49 + 100 - 25) / 140)), 27.7, 0.05))  # swapped-slot model: angle opposite the 5

chk("03.i1 pythagoras special case", correct_label(widget("rt-05-03", "i1")).startswith("cos 90\u00b0 = 0")
    and near(math.cos(r(90)), 0, 1e-12))
chk("03.i2 sign classifier", correct_label(widget("rt-05-03", "i2")).startswith("Positive"))
chk("03.k3 dispatch", correct_label(widget("rt-05-03", "k3")).startswith("Law of Cosines"))

w = widget("rt-05-03", "ch")  # ship 140,90,118 -> 198.82
d_sq = 140**2 + 90**2 - 2 * 140 * 90 * math.cos(r(118))
chk("03.ch A", near(math.sqrt(d_sq), w["answer"], w["tolerance"]))
P = (140, 0)
Q = (140 + 90 * math.cos(r(180 - 118)), 90 * math.sin(r(180 - 118)))
chk("03.ch B (coordinates: turn exterior angle 62)", near(math.hypot(Q[0], Q[1]), math.sqrt(d_sq), 1e-9))
chk("03.ch traps", traps(w) == {166.43, 125.97, 230} and near(math.hypot(140, 90), 166.43, 0.005)
    and near(math.sqrt(140**2 + 90**2 - 25200 * 0.4695), 125.97, 0.05) and 140 + 90 == 230)
chk("03.ch obtuse widens", math.sqrt(d_sq) > math.hypot(140, 90))

w = widget("rt-05-03", "rem-rt-law-cosines-k")
chk("03.rem", w["answer"] == 10 and traps(w) == {14, 100} and F(6)**2 + F(8)**2 == F(10)**2)

# ============ rt-05-04 ============
w = widget("rt-05-04", "k1")  # area 8,11,40 -> 28.28
area = 0.5 * 8 * 11 * math.sin(r(40))
chk("04.k1 A", near(area, w["answer"], w["tolerance"]))
# Route B: shoelace on coordinates
O = (0.0, 0.0); P = (8.0, 0.0); Q = (11 * math.cos(r(40)), 11 * math.sin(r(40)))
sho = 0.5 * abs(O[0] * (P[1] - Q[1]) + P[0] * (Q[1] - O[1]) + Q[0] * (O[1] - P[1]))
chk("04.k1 B (shoelace)", near(sho, area, 1e-9))
chk("04.k1 traps", traps(w) == {56.57, 44, 33.71} and near(2 * area, 56.57, 0.01)
    and 0.5 * 8 * 11 == 44 and near(44 * math.cos(r(40)), 33.71))

chk("04.i1 dispatch sines", correct_label(widget("rt-05-04", "i1")).startswith("Law of Sines"))
chk("04.i2 dispatch cosines", correct_label(widget("rt-05-04", "i2")).startswith("Law of Cosines"))

w = widget("rt-05-04", "k2")  # right triangle 24 tan31
chk("04.k2 A", near(24 * math.tan(r(31)), w["answer"], w["tolerance"]))
chk("04.k2 B", near(d(math.atan2(w["answer"], 24)), 31, 0.02))
chk("04.k2 traps", traps(w) == {39.94, 12.36, 20.57} and near(24 / math.tan(r(31)), 39.94)
    and near(24 * math.sin(r(31)), 12.36) and near(24 * math.cos(r(31)), 20.57))

chk("04.k3 height meaning", correct_label(widget("rt-05-04", "k3")).startswith("The triangle's height"))

w = widget("rt-05-04", "ch")  # 6,10,30 -> 15 exact
chk("04.ch A", w["answer"] == 15 and near(0.5 * 6 * 10 * math.sin(r(30)), 15, 1e-9))
O = (0.0, 0.0); P = (6.0, 0.0); Q = (10 * math.cos(r(30)), 10 * math.sin(r(30)))
sho = 0.5 * abs(P[0] * Q[1] - Q[0] * P[1])
chk("04.ch B (shoelace)", near(sho, 15, 1e-9))
chk("04.ch traps", traps(w) == {30, 25.98, 60} and 0.5 * 6 * 10 == 30
    and near(0.5 * 6 * 10 * math.cos(r(30)), 25.98) and 6 * 10 == 60)

chk("04.rem dispatch SSS", correct_label(widget("rt-05-04", "rem-rt-choose-tool-k")).startswith("Law of Cosines"))

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
print("verify-rt-ch5: ALL GREEN")
