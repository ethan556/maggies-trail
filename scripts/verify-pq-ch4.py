"""Dual-route verifier: polygons-quadrilaterals ch4 (trapezoids & kites).
Route A: taught formulas evaluated exactly (Fraction). Route B: coordinate
construction + MEASUREMENT — build a generic isosceles trapezoid and a generic
kite and measure every claimed property (parallelism via slope, angles via atan2,
midsegment via actual leg midpoints, area via shoelace); plus falsification —
a generic (non-isosceles) trapezoid must FAIL base-angle congruence and diagonal
congruence, and the kite's cross diagonal must NOT bisect the symmetry diagonal.
Convention dep: EXACTLY-one-parallel-pair (cg-03-02). Other deps: pq-ch1
(quad sum 360), tc (triangle midsegment as the b2->0 limit), pq-ch2 (co-interior
supplements between parallels — cited via cp's transversal theorems)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/polygons-quadrilaterals/lessons/pq-04-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"pq-04-01", "pq-04-02", "pq-04-03"}, sorted(L)

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

def dist(P, Q):
    return math.hypot(P[0] - Q[0], P[1] - Q[1])

def ang_at(V, P, Q):
    a1 = math.atan2(P[1] - V[1], P[0] - V[0])
    a2 = math.atan2(Q[1] - V[1], Q[0] - V[0])
    d = abs(math.degrees(a1 - a2)) % 360
    return min(d, 360 - d)

def shoelace(pts):
    s = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2

# ---- Route B model: isosceles trapezoid, bottom 10, top 6, height 4 ----
A, B, C, D = (0, 0), (10, 0), (8, 4), (2, 4)
chk("modelB: bases parallel, legs not (exclusive convention)",
    (C[1] - D[1]) == 0 and (B[1] - A[1]) == 0
    and not near((D[1] - A[1]) / (D[0] - A[0]), (C[1] - B[1]) / (C[0] - B[0]), 1e-9))
chk("modelB: iso base angles congruent (measured)", near(ang_at(A, B, D), ang_at(B, A, C), 1e-9))
chk("modelB: iso top angles congruent (measured)", near(ang_at(D, A, C), ang_at(C, B, D), 1e-9))
chk("modelB: leg angles supplementary (measured)", near(ang_at(A, B, D) + ang_at(D, A, C), 180, 1e-9))
chk("modelB: iso diagonals congruent (measured)", near(dist(A, C), dist(B, D), 1e-12))
Mad, Mbc = ((A[0] + D[0]) / 2, (A[1] + D[1]) / 2), ((B[0] + C[0]) / 2, (B[1] + C[1]) / 2)
chk("modelB: midsegment = base average (measured midpoints)", near(dist(Mad, Mbc), (10 + 6) / 2, 1e-12)
    and near(Mad[1], Mbc[1], 1e-12))
chk("modelB: angle sum 360 (measured)",
    near(ang_at(A, B, D) + ang_at(B, A, C) + ang_at(C, B, D) + ang_at(D, A, C), 360, 1e-9))
# falsification: skewed (non-isosceles) trapezoid
D2 = (3.5, 4)
chk("modelB: generic trapezoid base angles NOT congruent",
    not near(ang_at(A, B, D2), ang_at(B, A, (8, 4)), 0.01))
chk("modelB: generic trapezoid diagonals NOT congruent",
    not near(dist(A, (8, 4)), dist(B, D2), 0.01))

# ---- Route B model: kite, axis vertical, spine halves 6 (top) and 2 (bottom), cross half 3 ----
KT, KR, KB, KL = (0, 6), (3, 0), (0, -2), (-3, 0)
chk("modelB: kite consecutive pairs congruent (measured)",
    near(dist(KT, KR), dist(KT, KL), 1e-12) and near(dist(KB, KR), dist(KB, KL), 1e-12)
    and not near(dist(KT, KR), dist(KB, KR), 1e-9))
chk("modelB: kite diagonals perpendicular (axes)", True and KT[0] == KB[0] == 0 and KR[1] == KL[1] == 0)
chk("modelB: axis bisects cross diagonal (measured)", near(abs(KR[0]), abs(KL[0]), 1e-12))
chk("modelB: cross does NOT bisect axis (one-way)", not near(KT[1], -KB[1], 1e-9))
chk("modelB: non-vertex angles congruent (measured)", near(ang_at(KR, KT, KB), ang_at(KL, KT, KB), 1e-12))
chk("modelB: kite area = half diagonal product (shoelace)",
    near(shoelace([KT, KR, KB, KL]), 0.5 * dist(KT, KB) * dist(KR, KL), 1e-12))

# ============ pq-04-01 ============
w = widget("pq-04-01", "k1")
chk("01.k1", w["answer"] == 106 and 180 - 74 == 106 and traps(w) == {74, 16, 286}
    and 90 - 74 == 16 and 360 - 74 == 286)
chk("01.i1 survivor", correct_label(widget("pq-04-01", "i1")).startswith("Each leg's two angles"))

w = widget("pq-04-01", "k2")
chk("01.k2", w["answer"] == 115 and 180 - 65 == 115 and traps(w) == {65, 25, 130} and 2 * 65 == 130)
w = widget("pq-04-01", "k3")
chk("01.k3", w["answer"] == 360 and 65 + 65 + 115 + 115 == 360 and (4 - 2) * 180 == 360
    and traps(w) == {180, 540})
chk("01.i2 congruent-diagonal club", correct_label(widget("pq-04-01", "i2")).startswith("Rectangles and isosceles"))
w = widget("pq-04-01", "ch")
chk("01.ch", w["answer"] == 122 and 180 - 58 == 122 and 58 + 58 + 122 + 122 == 360
    and traps(w) == {58, 302, 116} and 360 - 58 == 302 and 2 * 58 == 116)
w = widget("pq-04-01", "rem-pq-trapezoid-k")
chk("01.rem", w["answer"] == 80 and traps(w) == {100, 260} and 360 - 100 == 260)

# ============ pq-04-02 ============
w = widget("pq-04-02", "k1")
chk("02.k1 A", w["answer"] == 8 and F(10 + 6, 2) == 8)
chk("02.k1 B (measured)", near(dist(Mad, Mbc), 8, 1e-12))
chk("02.k1 traps", traps(w) == {16, 2, 4} and (10 - 6) / 2 == 2 and 10 - 6 == 4)
chk("02.i1 degenerate limit", correct_label(widget("pq-04-02", "i1")).startswith("m = b\u2081/2"))
w = widget("pq-04-02", "k2")
chk("02.k2", w["answer"] == 14 and 2 * 9 - 4 == 14 and traps(w) == {6.5, 5, 26}
    and (9 + 4) / 2 == 6.5 and 2 * (9 + 4) == 26)
w = widget("pq-04-02", "k3")
chk("02.k3", w["answer"] == 18 and F(22 + 14, 2) == 18 and traps(w) == {36, 4, 8})
w = widget("pq-04-02", "i2")
chk("02.i2", w["answer"] == 9 and (30 + 12) / 2 == 21 and 30 - 21 == 9 and traps(w) == {21, 18}
    and (30 - 12) / 2 == 9)  # equivalently half the difference — route B of the same fact
w = widget("pq-04-02", "ch")
chk("02.ch", w["answer"] == 19 and 2 * 15 - 11 == 19 and F(11 + 19, 2) == 15
    and traps(w) == {13, 4, 26} and (15 + 11) / 2 == 13 and 15 - 11 == 4 and 15 + 11 == 26)
chk("02.ch between-check", 11 < 15 < 19)
w = widget("pq-04-02", "rem-pq-midsegment-k")
chk("02.rem", w["answer"] == 10 and traps(w) == {20, 2})

# ============ pq-04-03 ============
chk("03.i1 consecutive-vs-opposite", correct_label(widget("pq-04-03", "i1")).startswith("Kite: the congruent sides are CONSECUTIVE"))
w = widget("pq-04-03", "k1")
chk("03.k1", w["answer"] == 9 and F(18, 2) == 9 and traps(w) == {18, 6, 4.5})
w = widget("pq-04-03", "k2")
chk("03.k2 A", w["answer"] == 100 and F(360 - 100 - 60, 2) == 100)
chk("03.k2 traps", traps(w) == {200, 80, 130} and 360 - 100 - 60 == 200 and 180 - 100 == 80
    and (360 - 100) / 2 == 130)
# Route B: construct a kite whose axis angles are exactly 100 and 60 and MEASURE the sides
half_top, half_bot = math.radians(50), math.radians(30)
y_cross = 1.0  # place cross diagonal at y=0, top vertex above, bottom below
xr = 1.0  # cross half-length; top vertex height from tan: xr/tan(50) etc.
T = (0, xr / math.tan(half_top))
Bv = (0, -xr / math.tan(half_bot))
R, Lft = (xr, 0), (-xr, 0)
chk("03.k2 B (constructed 100/60 kite: all four angles measured)",
    near(ang_at(T, R, Lft), 100, 1e-9) and near(ang_at(Bv, R, Lft), 60, 1e-9)
    and near(ang_at(R, T, Bv), 100, 1e-9) and near(ang_at(Lft, T, Bv), 100, 1e-9)
    and near(ang_at(T, R, Lft) + ang_at(Bv, R, Lft) + ang_at(R, T, Bv) + ang_at(Lft, T, Bv), 360, 1e-9))
w = widget("pq-04-03", "k3")
chk("03.k3 A", w["answer"] == 24 and F(8 * 6, 2) == 24)
chk("03.k3 B (shoelace on 8x6 kite)",
    near(shoelace([(0, 5), (3, 0), (0, -3), (-3, 0)]), 0.5 * 8 * 6, 1e-12))
chk("03.k3 traps", traps(w) == {48, 14, 12})
chk("03.i2 rhombus-is-a-kite", correct_label(widget("pq-04-03", "i2")).startswith("A rhombus IS a kite"))
w = widget("pq-04-03", "ch")
chk("03.ch", w["answer"] == 10 and F(60, 6) == 10 and 0.5 * 12 * 10 == 60
    and traps(w) == {5, 2.5, 360} and 60 / 12 == 5 and 60 / 24 == 2.5 and 0.5 * 60 * 12 == 360)
chk("03.rem perpendicular-only", correct_label(widget("pq-04-03", "rem-pq-kite-k")) == "Meet at right angles")

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
print("verify-pq-ch4: ALL GREEN")
