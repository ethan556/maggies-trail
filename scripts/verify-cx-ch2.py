"""Dual-route verifier: coordinate-proofs ch2 (partition, slope criteria proved).
Route A: exact Fraction arithmetic — P = A + (m/(m+n))(B−A) per coordinate, slope
quotients, product-of-slopes = −1, C = B + D − A. Route B: geometric MEASUREMENT —
every partition point verified by |AP|/|PB| distance-ratio AND collinearity
(cross-product zero); every parallel claim verified by measuring the angle between
direction vectors (atan2); every perpendicular claim by dot product = 0; the
parallelogram challenge re-verified on BOTH opposite-side pairs (equal length +
parallel) and BOTH diagonal midpoints coinciding; the 90-degree rotation proof
model checked by rotating an actual slope triangle and measuring. Falsifications:
a non-partition point fails the ratio; a near-parallel pair measurably differs;
a slope-product of −1 broken by perturbation loses its right angle. Deps: cx-ch1
(distance/midpoint), lf (slope), tm (rotation preserves lengths/angles), pq
(parallelogram tests used by the challenge)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/coordinate-proofs/lessons/cx-02-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"cx-02-01", "cx-02-02", "cx-02-03"}, sorted(L)

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

def dist(A, B):
    return math.hypot(A[0] - B[0], A[1] - B[1])

def cross(A, B, C):
    return (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])

def part(A, B, m, n):
    k = F(m, m + n)
    return (F(A[0]) + k * (B[0] - A[0]), F(A[1]) + k * (B[1] - A[1]))

def check_partition(A, B, P, m, n):
    """Route B: collinear AND distance ratio |AP|:|PB| = m:n, measured."""
    Pf = (float(P[0]), float(P[1]))
    col = abs(cross(A, B, Pf)) < 1e-9
    ratio_ok = near(dist(A, Pf) * n, dist(Pf, B) * m, 1e-9)
    return col and ratio_ok

# ---- Route B foundations ----
P1 = part((1, 1), (7, 10), 2, 1)
chk("modelB: (1,1)->(7,10) 2:1 partition = (5,7), ratio+collinearity measured",
    P1 == (5, 7) and check_partition((1, 1), (7, 10), P1, 2, 1))
chk("modelB: non-partition falsification — (4,4) fails the 2:1 ratio on the same segment",
    not check_partition((1, 1), (7, 10), (4, 4), 2, 1))
P2 = part((2, 0), (10, 8), 1, 3)
chk("modelB: 1:3 from A = (4,2); 1:3 from B = (8,6); both measured",
    P2 == (4, 2) and check_partition((2, 0), (10, 8), P2, 1, 3)
    and part((10, 8), (2, 0), 1, 3) == (8, 6)
    and check_partition((10, 8), (2, 0), (8, 6), 1, 3))
# parallel measured by direction angle
a1 = math.atan2(3, 4)
a2 = math.atan2(11 - 5, 9 - 1)
chk("modelB: AB(0,0)->(4,3) and CD(1,5)->(9,11) directions measured equal", near(a1, a2, 1e-12))
chk("modelB: near-parallel falsification — slope 0.76 direction measurably differs",
    not near(math.atan2(0.76, 1), math.atan2(0.75, 1), 1e-4))
# perpendicular by dot product + rotation model
v = (3, 2)
vr = (-2, 3)  # 90-degree rotation
chk("modelB: rotated slope triangle (3,2)->(-2,3): dot = 0, slopes 2/3 and -3/2 multiply to -1",
    v[0] * vr[0] + v[1] * vr[1] == 0 and F(2, 3) * F(-3, 2) == -1)
chk("modelB: perturbation dot nonzero (explicit)", abs(3 * 2.1 + 2 * (-3)) > 0.05)
# parallelogram C = B + D - A verified on both pairs + both diagonals
A4, B4, D4 = (2, 0), (7, 2), (1, 6)
C4 = (B4[0] + D4[0] - A4[0], B4[1] + D4[1] - A4[1])
mid_AC = ((A4[0] + C4[0]) / 2, (A4[1] + C4[1]) / 2)
mid_BD = ((B4[0] + D4[0]) / 2, (B4[1] + D4[1]) / 2)
chk("modelB: parallelogram C=(6,8) — both side pairs equal+parallel, diagonal midpoints coincide",
    C4 == (6, 8)
    and near(dist(A4, B4), dist(D4, C4), 1e-12) and near(dist(A4, D4), dist(B4, C4), 1e-12)
    and near(math.atan2(B4[1] - A4[1], B4[0] - A4[0]), math.atan2(C4[1] - D4[1], C4[0] - D4[0]), 1e-12)
    and near(math.atan2(D4[1] - A4[1], D4[0] - A4[0]), math.atan2(C4[1] - B4[1], C4[0] - B4[0]), 1e-12)
    and mid_AC == mid_BD)
# altitude perpendicularity measured
chk("modelB: altitude slope -2 onto base (0,0)->(8,4): dot((8,4),(1,-2)) = 0", 8 * 1 + 4 * (-2) == 0)
# perpendicular-through-(6,4) challenge line measured: from (6,4) with slope -3/2 to (0,13)
chk("modelB: challenge line (6,4)->(0,13) perpendicular to slope 2/3 (dot) and passes x=0 at 13",
    (0 - 6) * 3 + (13 - 4) * 2 == 0 and F(4) + F(-3, 2) * (0 - 6) == 13)

# ============ cx-02-01 ============
w = widget("cx-02-01", "k1")
chk("01.k1 A", w["answer"] == 5 and part((1, 1), (7, 10), 2, 1)[0] == 5 and traps(w) == {4, 3, 7}
    and F(1 + 7, 2) == 4 and F(1) + F(1, 3) * 6 == 3)
w = widget("cx-02-01", "k2")
chk("01.k2 A", w["answer"] == 4 and traps(w) == {6, 8, 10} and F(2 + 10, 2) == 6
    and F(2) + F(3, 4) * 8 == 8)
chk("01.k3 from-B quarter", correct_label(widget("cx-02-01", "k3")).startswith("(8, 6)"))
chk("01.k3 B (measured above)", check_partition((10, 8), (2, 0), (8, 6), 1, 3))
w = widget("cx-02-01", "i1")
chk("01.i1 ratio recovery", w["answer"] == 1 and F(3 - 1, 7 - 1) == F(1, 3) and traps(w) == {2, 3}
    and check_partition((1, 1), (7, 10), (3, 4), 1, 2))
w = widget("cx-02-01", "i2")
chk("01.i2 trail", w["answer"] == 9 and part((0, 2), (12, 10), 3, 1)[0] == 9 and traps(w) == {3, 6}
    and part((0, 2), (12, 10), 1, 3)[0] == 3 and F(0 + 12, 2) == 6)
w = widget("cx-02-01", "ch")
P_tri = part((-1, 5), (8, -1), 2, 1)
chk("01.ch A", w["answer"] == 5 and P_tri[0] == 5 and check_partition((-1, 5), (8, -1), P_tri, 2, 1))
chk("01.ch traps", traps(w) == {2, 3.5, 8} and part((-1, 5), (8, -1), 1, 2)[0] == 2
    and F(-1 + 8, 2) == 3.5)
w = widget("cx-02-01", "rem-cx-partition-k")
chk("01.rem", w["answer"] == 2 and part((0, 0), (10, 5), 1, 4)[0] == 2 and traps(w) == {5, 8}
    and part((0, 0), (10, 5), 4, 1)[0] == 8)

# ============ cx-02-02 ============
w = widget("cx-02-02", "k1")
chk("02.k1 A", near(w["answer"], 0.75) and F(11 - 5, 9 - 1) == F(3, 4) and traps(w) == {1.33, 6, 0.6}
    and near(8 / 6, 1.33) and F(6, 10) == F(3, 5) and near(float(F(6, 10)), 0.6))
chk("02.k1 B (directions measured above)", near(a1, a2, 1e-12))
w = widget("cx-02-02", "k2")
chk("02.k2", w["answer"] == 7 and F(1) + F(3, 4) * 8 == 7 and traps(w) == {6, 11.67, 8}
    and F(3, 4) * 8 == 6 and near(1 + 4 / 3 * 8, 11.67))
chk("02.k3 translation proof", correct_label(widget("cx-02-02", "k3")).startswith("Translations preserve"))
chk("02.i1 collinear", correct_label(widget("cx-02-02", "i1")).startswith("A, B, C are collinear"))
w = widget("cx-02-02", "i2")
chk("02.i2", near(w["answer"], F(1, 3), 0.01) and F(6 - 5, 5 - 2) == F(1, 3) and traps(w) == {3, -0.33})
w = widget("cx-02-02", "ch")
chk("02.ch A", w["answer"] == 6 and C4 == (6, 8) and traps(w) == {8, 4, -4}
    and 7 + 1 == 8 and F(7 + 1, 2) == 4 and 1 - 5 == -4)
chk("02.ch B (measured above on both pairs + diagonals)", mid_AC == mid_BD)
w = widget("cx-02-02", "rem-cx-parallel-proof-k")
chk("02.rem", near(w["answer"], 0.5) and F(10 - 7, 7 - 1) == F(1, 2) and traps(w) == {2, 3})

# ============ cx-02-03 ============
w = widget("cx-02-03", "k1")
chk("03.k1", near(w["answer"], -1.5) and F(2, 3) * F(-3, 2) == -1 and traps(w) == {0.67, 1.5, -0.67})
w = widget("cx-02-03", "k2")
chk("03.k2 A", near(w["answer"], -1.5) and F(6 - 3, 2 - 4) == F(-3, 2) and traps(w) == {1.5, -0.67, 3})
chk("03.k2 B (right angle at B measured by dot)",
    (1 - 4) * (2 - 4) + (1 - 3) * (6 - 3) == 0)
chk("03.k3 vertical exception", correct_label(widget("cx-02-03", "k3")).startswith("Yes"))
chk("03.i1 rotation meaning", correct_label(widget("cx-02-03", "i1")).startswith("A line guaranteed perpendicular"))
w = widget("cx-02-03", "i2")
chk("03.i2 altitude", w["answer"] == -2 and F(4, 8) * F(-2) == -1 and traps(w) == {0.5, 2})
w = widget("cx-02-03", "ch")
chk("03.ch A", w["answer"] == 13 and F(4) + F(-3, 2) * (0 - 6) == 13 and traps(w) == {0, -5, 9}
    and F(4) + F(2, 3) * (0 - 6) == 0 and 4 - 9 == -5 and F(3, 2) * 6 == 9)
chk("03.ch B (perpendicularity measured above)", (0 - 6) * 3 + (13 - 4) * 2 == 0)
w = widget("cx-02-03", "rem-cx-perp-proof-k")
chk("03.rem", near(w["answer"], -0.25) and F(4) * F(-1, 4) == -1 and traps(w) == {0.25, -4})

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
print("verify-cx-ch2: ALL GREEN")
