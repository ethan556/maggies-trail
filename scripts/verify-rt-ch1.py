"""Dual-route verifier: right-triangles-trig ch1 (rt-01-01..04).
Route A: exact Fraction/integer arithmetic. Route B: independent float recomputation
via math functions with a different formula path. Traps re-derived from named error models.
Proof deps: builds on sy ch4 (altitude similarity proof of Pythagoras) and tc (right-angle facts);
no trig deps (ch1 is pre-trig)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {}
for f in glob.glob("content/courses/right-triangles-trig/lessons/rt-01-*.json"):
    d = json.load(open(f))
    L[d["id"]] = d

assert set(L) == {"rt-01-01", "rt-01-02", "rt-01-03", "rt-01-04"}, sorted(L)

FAIL = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond:
        FAIL.append(name)

def widget(lid, sid):
    d = L[lid]
    for s in d["steps"]:
        if s["id"] == sid:
            return s["widget"]
    for r in d["remedials"]:
        if r["check"]["id"] == sid:
            return r["check"]["widget"]
    raise KeyError(sid)

def traps(w):
    return {e["value"]: e["feedback"] for e in w.get("commonErrors", [])}

def correct_label(w):
    return [o["label"] for o in w["options"] if o["correct"]][0]

# ---------- rt-01-01 ----------
# k1: legs 6,8 -> hyp. A: exact F. B: math.hypot.
a1 = F(6)**2 + F(8)**2
chk("0101 k1 route A", a1 == 100 and math.isqrt(100) == 10 and widget("rt-01-01", "k1")["answer"] == 10)
chk("0101 k1 route B", abs(math.hypot(6, 8) - 10) < 1e-12)
t = traps(widget("rt-01-01", "k1"))
chk("0101 k1 traps", set(t) == {14, 100, 48} and 6 + 8 == 14 and 6 * 8 == 48)  # add-sides, stop-at-c2, multiply
# k2: hyp 13, leg 5 -> 12. A: F subtraction. B: hypot inverse.
chk("0101 k2 route A", F(13)**2 - F(5)**2 == 144 and math.isqrt(144) == 12 and widget("rt-01-01", "k2")["answer"] == 12)
chk("0101 k2 route B", abs(math.sqrt(13**2 - 5**2) - 12) < 1e-12 and abs(math.hypot(5, 12) - 13) < 1e-12)
t = traps(widget("rt-01-01", "k2"))
chk("0101 k2 traps", set(t) == {194, 8, 144} and 169 + 25 == 194 and 13 - 5 == 8)  # add-instead, subtract-sides, no-sqrt
# k3: ladder 25 hyp, base 7 -> 24.
chk("0101 k3 route A", F(25)**2 - F(7)**2 == 576 and math.isqrt(576) == 24 and widget("rt-01-01", "k3")["answer"] == 24)
chk("0101 k3 route B", abs(math.hypot(7, 24) - 25) < 1e-12)
t = traps(widget("rt-01-01", "k3"))
chk("0101 k3 trap 25.96 = ladder-as-leg", abs(math.sqrt(625 + 49) - 25.96) < 0.005 and set(t) == {25.96, 18, 576} and 25 - 7 == 18)
# ch: 9x12 diagonal -> 15. A: F. B: hypot. (also 3-4-5 x3)
chk("0101 ch route A", F(9)**2 + F(12)**2 == 225 and math.isqrt(225) == 15 and widget("rt-01-01", "ch")["answer"] == 15)
chk("0101 ch route B", abs(math.hypot(9, 12) - 15) < 1e-12 and (9, 12, 15) == (3 * 3, 4 * 3, 5 * 3))
t = traps(widget("rt-01-01", "ch"))
chk("0101 ch traps", set(t) == {21, 225, 10.5} and 9 + 12 == 21 and (9 + 12) / 2 == 10.5)
# remedials: 3-4-5 -> 5; hyp10 leg8 -> 6
chk("0101 rem1", widget("rt-01-01", "rem-rt-pythagorean-k")["answer"] == 5 and F(3)**2 + F(4)**2 == 25)
chk("0101 rem2", widget("rt-01-01", "rem-rt-pythagorean-leg-k")["answer"] == 6 and F(10)**2 - F(8)**2 == 36 and abs(math.sqrt(100 + 64) - 12.8) < 0.05)

# ---------- rt-01-02 ----------
# i1 5-12-13, k1 8-15-17, ch 20-21-29 all right by converse (A: exact; B: angle via acos)
for (x, y, z, name) in [(5, 12, 13, "0102 i1"), (8, 15, 17, "0102 k1"), (20, 21, 29, "0102 ch")]:
    chk(name + " route A triple", F(x)**2 + F(y)**2 == F(z)**2)
    ang = math.degrees(math.acos((x * x + y * y - z * z) / (2 * x * y)))  # law of cosines route
    chk(name + " route B angle=90", abs(ang - 90) < 1e-9)
chk("0102 k1 correct option", "289" in correct_label(widget("rt-01-02", "k1")))
chk("0102 ch correct option", "841" in correct_label(widget("rt-01-02", "ch")) and 20**2 + 21**2 == 841 == 29**2)
# i2: 6,7,9 acute. A: compare squares. B: largest angle via law of cosines < 90.
chk("0102 i2 route A", 6**2 + 7**2 == 85 and 9**2 == 81 and 81 < 85)
ang = math.degrees(math.acos((36 + 49 - 81) / (2 * 6 * 7)))
chk("0102 i2 route B acute", ang < 90 and abs(ang - math.degrees(math.acos(4 / 84))) < 1e-9)
chk("0102 i2 correct option", correct_label(widget("rt-01-02", "i2")).startswith("Acute"))
# k2: 4,7,9 obtuse. A: 81 > 65. B: angle > 90.
chk("0102 k2 route A", 4**2 + 7**2 == 65 and 81 > 65)
ang = math.degrees(math.acos((16 + 49 - 81) / (2 * 4 * 7)))
chk("0102 k2 route B obtuse", ang > 90)
chk("0102 k2 correct option", correct_label(widget("rt-01-02", "k2")).startswith("Obtuse"))
# k3: 30-40-50 = 3-4-5 x10. A: scale. B: exact.
chk("0102 k3", widget("rt-01-02", "k3")["answer"] == 50 and F(30)**2 + F(40)**2 == F(50)**2 and abs(math.hypot(30, 40) - 50) < 1e-9)
t = traps(widget("rt-01-02", "k3"))
chk("0102 k3 traps", set(t) == {70, 2500, 35} and 30 + 40 == 70 and 50**2 == 2500 and (30 + 40) / 2 == 35)
# rem: 6,7,10 obtuse (100 > 85); distractor claim 6^2+8^2=10^2 true but wrong sides
chk("0102 rem", 6**2 + 7**2 == 85 and 10**2 == 100 and 100 > 85 and correct_label(widget("rt-01-02", "rem-rt-classify-k")).startswith("Obtuse"))
ang = math.degrees(math.acos((36 + 49 - 100) / (2 * 6 * 7)))
chk("0102 rem route B", ang > 90)

# ---------- rt-01-03 (45-45-90) ----------
S2 = math.sqrt(2)
def near(w, val, tol=None):
    tol = w["tolerance"] if tol is None else tol
    return abs(w["answer"] - val) <= tol
# k1: legs 5 -> 5sqrt2. A: exact symbolic check 5^2+5^2 = (5sqrt2)^2 = 50. B: float.
chk("0103 k1 route A", F(5)**2 + F(5)**2 == 50 and abs((5 * S2)**2 - 50) < 1e-9)
chk("0103 k1 route B", near(widget("rt-01-03", "k1"), 5 * S2) and abs(5 * S2 - 7.0711) < 1e-3)
t = traps(widget("rt-01-03", "k1"))
chk("0103 k1 traps", set(t) == {10, 25, 3.54} and abs(5 / S2 - 3.54) < 0.01)
# traps outside tolerance
w = widget("rt-01-03", "k1")
chk("0103 k1 traps outside tol", all(abs(v - w["answer"]) > w["tolerance"] for v in t))
# k2: hyp 10 -> leg 10/sqrt2 = 5sqrt2 (same 7.07). B: leg^2*2 = 100.
chk("0103 k2 routes", near(widget("rt-01-03", "k2"), 10 / S2) and abs(2 * (10 / S2)**2 - 100) < 1e-9)
t = traps(widget("rt-01-03", "k2"))
chk("0103 k2 traps", set(t) == {14.14, 5, 8} and abs(10 * S2 - 14.14) < 0.01 and 10 / 2 == 5)
# k3: square side 8 diagonal 8sqrt2=11.31. B: hypot(8,8).
chk("0103 k3 routes", near(widget("rt-01-03", "k3"), 8 * S2) and abs(math.hypot(8, 8) - 11.3137) < 1e-3)
t = traps(widget("rt-01-03", "k3"))
chk("0103 k3 traps", set(t) == {16, 5.66, 64} and abs(8 / S2 - 5.66) < 0.01 and 8 * 8 == 64)
# ch: hyp 12 -> leg 6sqrt2 = 8.49. B: 2*leg^2 = 144.
chk("0103 ch routes", near(widget("rt-01-03", "ch"), 12 / S2) and abs(2 * (6 * S2)**2 - 144) < 1e-9)
t = traps(widget("rt-01-03", "ch"))
chk("0103 ch traps", set(t) == {16.97, 6, 10} and abs(12 * S2 - 16.97) < 0.01 and 12 / 2 == 6)
# rem: legs 3 -> 4.24
chk("0103 rem", near(widget("rt-01-03", "rem-rt-454590-k"), 3 * S2) and abs(3 * S2 - 4.2426) < 1e-3)

# ---------- rt-01-04 (30-60-90) ----------
S3 = math.sqrt(3)
# k1: short 4 -> hyp 8. A: ratio. B: pythagoras with long leg 4sqrt3: 16 + 48 = 64.
chk("0104 k1 route A", widget("rt-01-04", "k1")["answer"] == 8 and 2 * 4 == 8)
chk("0104 k1 route B", abs(math.hypot(4, 4 * S3) - 8) < 1e-12)
t = traps(widget("rt-01-04", "k1"))
chk("0104 k1 traps", set(t) == {4.62, 6.93, 5.66} and abs(4 * S3 - 6.93) < 0.01 and abs(4 * S2 - 5.66) < 0.01 and abs(8 / S3 - 4.62) < 0.01)
# k2: hyp 14 -> long 7sqrt3 = 12.12. B: sqrt(14^2 - 7^2) = sqrt(147).
chk("0104 k2 route A", near(widget("rt-01-04", "k2"), 7 * S3))
chk("0104 k2 route B", abs(math.sqrt(14**2 - 7**2) - 7 * S3) < 1e-12 and abs(7 * S3 - 12.124) < 1e-2)
t = traps(widget("rt-01-04", "k2"))
chk("0104 k2 traps", set(t) == {7, 24.25, 9.9} and abs(14 * S3 - 24.25) < 0.01 and abs(14 / S2 - 9.9) < 0.01)
# k3: long 9 -> hyp 6sqrt3 = 10.39. B: short = 9/sqrt3 = 3sqrt3 = 5.196; hypot(short, 9).
short = 9 / S3
chk("0104 k3 route A", near(widget("rt-01-04", "k3"), 2 * short) and abs(2 * short - 6 * S3) < 1e-12)
chk("0104 k3 route B", abs(math.hypot(short, 9) - 6 * S3) < 1e-9 and abs(6 * S3 - 10.392) < 1e-2)
t = traps(widget("rt-01-04", "k3"))
chk("0104 k3 traps", set(t) == {18, 15.59, 5.2} and abs(9 * S3 - 15.59) < 0.01 and abs(short - 5.20) < 0.01)
# ch: equilateral side 10 altitude 5sqrt3 = 8.66. B: sqrt(10^2 - 5^2) = sqrt75.
chk("0104 ch route A", near(widget("rt-01-04", "ch"), 5 * S3))
chk("0104 ch route B", abs(math.sqrt(100 - 25) - 5 * S3) < 1e-12 and abs(5 * S3 - 8.660) < 1e-2)
t = traps(widget("rt-01-04", "ch"))
chk("0104 ch traps", set(t) == {5, 10, 7.07} and abs(5 * S2 - 7.07) < 0.01)
# rem: hyp 6 -> short 3; trap 3.46 = 6/sqrt3
chk("0104 rem", widget("rt-01-04", "rem-rt-306090-k")["answer"] == 3 and abs(6 / S3 - 3.46) < 0.01)

# ---------- cross-lesson: all traps differ from answers and sit outside tolerance ----------
allok = True
for lid, d in L.items():
    steps = list(d["steps"]) + [{"widget": r["check"]["widget"], "id": r["check"]["id"]} for r in d["remedials"]]
    for s in steps:
        w = s.get("widget")
        if w and w.get("type") == "numeric":
            for e in w["commonErrors"]:
                if e["value"] == w["answer"] or abs(e["value"] - w["answer"]) <= w["tolerance"]:
                    allok = False
                    print("BAD TRAP", lid, s["id"], e["value"])
chk("all numeric traps distinct & outside tolerance", allok)

print()
if FAIL:
    print("VERIFIER FAILED:", FAIL)
    sys.exit(1)
print("verify-rt-ch1: ALL GREEN")
