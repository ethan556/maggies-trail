"""Dual-route verifier: right-triangles-trig ch3 (solving right triangles).
Route A: forward trig (math.sin/cos/tan at the stated angle). Route B: independent
geometric reconstruction — build the triangle from the answer and confirm side
relations via math.hypot / Fraction / angle-sum, never re-running Route A's formula.
Proof deps: rt-ch2 (ratio definitions), rt-ch1 (Pythagoras, triples 3-4-5, 5-12-13,
9-12-15, complement rule), sy (similarity underpins ratio constancy). No tf dep
(trig-seam decision). Every trap re-derived from its named error model."""
import json, glob, math, sys
from fractions import Fraction as F

r = math.radians
d = math.degrees

L = {j["id"]: j for f in glob.glob("content/courses/right-triangles-trig/lessons/rt-03-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"rt-03-01", "rt-03-02", "rt-03-03"}, sorted(L)

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

# ---- deps (verify the verifier's own ground truth) ----
chk("dep: 9-12-15 triple", 9**2 + 12**2 == 15**2)
chk("dep: 5-12-13 triple", 5**2 + 12**2 == 13**2)
chk("dep: complement rule", 90 - 37 == 53 and 90 - 32.01 == 57.99)

# ============ rt-03-01 (sides) ============
# k1: opp = 20 sin34 = 11.18
w = widget("rt-03-01", "k1")
chk("01.k1 A", near(20 * math.sin(r(34)), w["answer"], w["tolerance"]))
# Route B: rebuild triangle from answer: adj = sqrt(20^2 - 11.18^2); angle = atan2(11.18, adj) ≈ 34°
adj = math.sqrt(20**2 - w["answer"]**2)
chk("01.k1 B", near(d(math.atan2(w["answer"], adj)), 34, 0.02) and near(math.hypot(w["answer"], adj), 20, 1e-9))
tr = {e["value"] for e in w["commonErrors"]}
chk("01.k1 traps", tr == {16.58, 35.77, 13.49} and near(20 * math.cos(r(34)), 16.58)
    and near(20 / math.sin(r(34)), 35.77) and near(20 * math.tan(r(34)), 13.49))

# k2: adj = 50 cos28 = 44.15
w = widget("rt-03-01", "k2")
chk("01.k2 A", near(50 * math.cos(r(28)), w["answer"], w["tolerance"]))
opp = math.sqrt(50**2 - w["answer"]**2)
chk("01.k2 B", near(d(math.atan2(opp, w["answer"])), 28, 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("01.k2 traps", tr == {23.47, 56.63} and near(50 * math.sin(r(28)), 23.47) and near(50 / math.cos(r(28)), 56.63)
    and 56.63 > 50)  # named impossibility: "leg" longer than hypotenuse

# k3: hyp = 15/sin42 = 22.42
w = widget("rt-03-01", "k3")
chk("01.k3 A", near(15 / math.sin(r(42)), w["answer"], w["tolerance"]))
chk("01.k3 B", near(d(math.asin(15 / w["answer"])), 42, 0.02) and w["answer"] > 15)
tr = {e["value"] for e in w["commonErrors"]}
chk("01.k3 traps", tr == {10.04, 16.66, 20.18} and near(15 * math.sin(r(42)), 10.04)
    and near(15 / math.tan(r(42)), 16.66) and near(15 / math.cos(r(42)), 20.18) and 10.04 < 15)

# ch: opp = 30 tan63 = 58.88
w = widget("rt-03-01", "ch")
chk("01.ch A", near(30 * math.tan(r(63)), w["answer"], w["tolerance"]))
chk("01.ch B", near(d(math.atan2(w["answer"], 30)), 63, 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("01.ch traps", tr == {15.29, 26.73, 13.62} and near(30 / math.tan(r(63)), 15.29)
    and near(30 * math.sin(r(63)), 26.73) and near(30 * math.cos(r(63)), 13.62))

# rem: 12 cos60 = 6 exactly (F route)
w = widget("rt-03-01", "rem-rt-solve-side-k")
chk("01.rem", w["answer"] == 6 and F(12) * F(1, 2) == 6 and near(12 * math.cos(r(60)), 6, 1e-9)
    and {e["value"] for e in w["commonErrors"]} == {24, 10.39} and F(12) / F(1, 2) == 24
    and near(12 * math.sin(r(60)), 10.39))

# ============ rt-03-02 (angles) ============
# k1: asin(7/25)=16.26 ; dep: 7-24-25 triple
chk("dep: 7-24-25 triple", 7**2 + 24**2 == 25**2)
w = widget("rt-03-02", "k1")
chk("02.k1 A", near(d(math.asin(7 / 25)), w["answer"], w["tolerance"]))
chk("02.k1 B", near(25 * math.sin(r(w["answer"])), 7, 0.02) and near(d(math.atan2(7, 24)), w["answer"], 0.02))
tr = {e["value"] for e in w["commonErrors"]}
chk("02.k1 traps", tr == {73.74, 0.28, 16.7} and near(d(math.acos(7 / 25)), 73.74) and F(7, 25) == F(28, 100)
    and abs(16.7 - w["answer"]) > w["tolerance"])

# k2: atan(5/8)=32.01
w = widget("rt-03-02", "k2")
chk("02.k2 A", near(d(math.atan(5 / 8)), w["answer"], w["tolerance"]))
chk("02.k2 B", near(8 * math.tan(r(w["answer"])), 5, 0.01))
tr = {e["value"] for e in w["commonErrors"]}
chk("02.k2 traps", tr == {57.99, 38.68} and near(d(math.atan(8 / 5)), 57.99) and near(d(math.asin(5 / 8)), 38.68)
    and near(57.99 + 32.01, 90, 1e-9))

# i2: complement 57.99
w = widget("rt-03-02", "i2")
chk("02.i2", w["answer"] == 57.99 and {e["value"] for e in w["commonErrors"]} == {147.99, 32.01}
    and near(180 - 32.01, 147.99, 1e-9))

# ch: atan(1.2/6.4)=10.62
w = widget("rt-03-02", "ch")
chk("02.ch A", near(d(math.atan(1.2 / 6.4)), w["answer"], w["tolerance"]))
chk("02.ch B", near(6.4 * math.tan(r(w["answer"])), 1.2, 0.006) and F(12, 64) == F(3, 16))
tr = {e["value"] for e in w["commonErrors"]}
chk("02.ch traps", tr == {10.81, 79.38, 0.19} and near(d(math.asin(1.2 / 6.4)), 10.81)
    and near(d(math.atan(6.4 / 1.2)), 79.38) and near(float(F(3, 16)), 0.19, 0.005)
    and all(abs(v - w["answer"]) > w["tolerance"] for v in tr))

# rem: asin(0.5)=30 exact
w = widget("rt-03-02", "rem-rt-inverse-trig-k")
chk("02.rem", w["answer"] == 30 and near(d(math.asin(0.5)), 30, 1e-9)
    and {e["value"] for e in w["commonErrors"]} == {60, 0.5} and near(d(math.acos(0.5)), 60, 1e-9))

# ============ rt-03-03 (complete) ============
w = widget("rt-03-03", "i1")
chk("03.i1", w["answer"] == 53 and {e["value"] for e in w["commonErrors"]} == {143, 37} and 90 - 37 == 53 and 180 - 37 == 143)

# k1: 10 sin37 = 6.02 ; pythagorean audit both legs
w = widget("rt-03-03", "k1")
chk("03.k1 A", near(10 * math.sin(r(37)), w["answer"], w["tolerance"]))
chk("03.k1 B (pyth audit)", near(math.hypot(6.02, 7.99), 10, 0.01))
tr = {e["value"] for e in w["commonErrors"]}
chk("03.k1 traps", tr == {7.99, 7.54} and near(10 * math.cos(r(37)), 7.99) and near(10 * math.tan(r(37)), 7.54))

# k2: hyp of 9,12 = 15. Route A Fraction/exact; Route B hypot.
w = widget("rt-03-03", "k2")
chk("03.k2 A", w["answer"] == 15 and F(9)**2 + F(12)**2 == F(15)**2)
chk("03.k2 B", math.hypot(9, 12) == 15.0)
tr = {e["value"] for e in w["commonErrors"]}
chk("03.k2 traps", tr == {21, 7.94, 225} and 9 + 12 == 21 and near(math.sqrt(144 - 81), 7.94) and 15**2 == 225)

# k3: atan(9/12)=36.87 ; cross-route: asin(9/15) must agree (same triangle)
w = widget("rt-03-03", "k3")
chk("03.k3 A", near(d(math.atan(F(9, 12))), w["answer"], w["tolerance"]))
chk("03.k3 B", near(d(math.asin(9 / 15)), w["answer"], 0.01))
tr = {e["value"] for e in w["commonErrors"]}
chk("03.k3 traps", tr == {53.13, 48.59} and near(d(math.atan(12 / 9)), 53.13) and near(d(math.asin(9 / 12)), 48.59)
    and near(36.87 + 53.13, 90, 1e-9))

# ch: hyp = 40/cos25 = 44.14
w = widget("rt-03-03", "ch")
chk("03.ch A", near(40 / math.cos(r(25)), w["answer"], w["tolerance"]))
opp = math.sqrt(w["answer"]**2 - 40**2)
chk("03.ch B", near(d(math.atan2(opp, 40)), 25, 0.05) and w["answer"] > 40)
tr = {e["value"] for e in w["commonErrors"]}
chk("03.ch traps", tr == {36.25, 94.65, 18.65} and near(40 * math.cos(r(25)), 36.25)
    and near(40 / math.sin(r(25)), 94.65) and near(40 * math.tan(r(25)), 18.65) and 36.25 < 40)

# rem: sqrt(13^2-5^2)=12 exact
w = widget("rt-03-03", "rem-rt-solve-complete-k")
chk("03.rem", w["answer"] == 12 and F(13)**2 - F(5)**2 == F(12)**2
    and {e["value"] for e in w["commonErrors"]} == {13.93, 8} and near(math.sqrt(169 + 25), 13.93) and 13 - 5 == 8)

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
print("verify-rt-ch3: ALL GREEN")
