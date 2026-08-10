"""Dual-route verifier: solid-geometry ch4 (composite solids & surfaces).
Route A: exact Fraction arithmetic on every decomposition (silo/capsule/tower
sums, tube/bore/mold subtractions, all surface sums with the seam counted zero).
Route B: independent slab INTEGRATION of every composite as one piecewise solid
(silo integrated bottom-to-crown with the hemisphere's slice law; capsule with
both caps; water tower cone+cylinder+dome; tube by ring slabs; block-minus-bore
by square-minus-disk slabs; mold by block-minus-hemisphere slabs) — matching the
decomposed sums proves seam bookkeeping is airtight; surfaces cross-checked by
an independent lateral-surface integral (perimeter-of-section x dz for the
cylinder wall) and the sphere surface via the volume derivative check
(4pi r^2 == d/dr[(4/3)pi r^3] evaluated as a finite-difference measurement).
Seam-zero discipline verified by comparing piece-alone surface sums (which count
the seam twice) against the composite total. Deps: ch3 (justified formulas),
asv (prism surface), ch1/ch2 (slice law + Cavalieri for the bent tube)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/solid-geometry/lessons/sg-04-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"sg-04-01", "sg-04-02", "sg-04-03"}, sorted(L)

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

def slab(area_at, lo, hi, n=20000):
    dh = (hi - lo) / n
    return sum(area_at(lo + (i + 0.5) * dh) * dh for i in range(n))

PI = math.pi

# ---- Route B: piecewise integration of every composite ----
def silo_area(z):  # 0..16: cylinder to 10, hemisphere 10..16 (r=6)
    return PI * 36 if z <= 10 else PI * (36 - (z - 10)**2)
chk("modelB: silo integrated bottom-to-crown == 504pi == 360pi + 144pi (exact sum)",
    near(slab(silo_area, 0, 16), 504 * PI, 0.05) and F(360) + F(2, 3) * 216 == 504)
def capsule_area(z):  # -3..11: cap, cylinder 0..8, cap
    if z < 0: return PI * (9 - z * z)
    if z > 8: return PI * (9 - (z - 8)**2)
    return PI * 9
chk("modelB: capsule integrated == 108pi == 72pi + full-sphere 36pi",
    near(slab(capsule_area, -3, 11), 108 * PI, 0.05) and 72 + F(4, 3) * 27 == 108)
def icecream_area(z):  # cone 0..7 (r grows 0->3 from apex at 0? apex at bottom): use apex at z=0
    if z <= 7: return PI * (3 * z / 7)**2
    return PI * (9 - (z - 7)**2)
chk("modelB: ice-cream integrated == 39pi == 21 + 18",
    near(slab(icecream_area, 0, 10), 39 * PI, 0.05) and F(1, 3) * 9 * 7 + F(2, 3) * 27 == 39)
def tower_area(z):  # cone 0..5 (base at bottom r6 shrinking up? cone stand: base r6 at z=5 apex at 0? A stand widens down)
    # stand: full cone with base radius 6 at its TOP (z=5), apex at z=0 is wrong for a stand;
    # volume-wise orientation is irrelevant: use r(z) = 6*z/5 for 0..5
    if z <= 5: return PI * (6 * z / 5)**2
    if z <= 15: return PI * 36
    return PI * (36 - (z - 15)**2)
chk("modelB: water tower integrated == 564pi == 60 + 360 + 144",
    near(slab(tower_area, 0, 21), 564 * PI, 0.1) and F(1, 3) * 36 * 5 + 360 + 144 == 564)
chk("modelB: tube ring slabs == 126pi; bent tube same (constant sections)",
    near(slab(lambda z: PI * (25 - 4), 0, 6), 126 * PI, 1e-6) and (25 - 4) * 6 == 126)
chk("modelB: block-minus-bore slabs == 400 - 16pi",
    near(slab(lambda z: 100 - PI * 4, 0, 4), 400 - 16 * PI, 1e-6)
    and near(400 - 16 * PI, 349.73, 0.005))
def mold_area(z):  # 0..4 block 8x8 minus hemisphere cavity (flat side up at z=4, dome down to z=1)
    # hemisphere r=3 carved from the top: at depth d below top, cavity disk radius sqrt(9-(3-d)^2)? 
    # simpler: cavity occupies z in [1,4], at height z the cavity radius^2 = 9 - (4-z... 
    # bowl flat side up at top face: cavity = set of points within 3 of the top-center, below top:
    # at z (distance 4-z below top): radius^2 = 9 - (4-z)^2 for z >= 1
    if z >= 1:
        return 64 - PI * (9 - (4 - z)**2)
    return 64
chk("modelB: mold slabs == 256 - 18pi (block minus hemisphere cavity)",
    near(slab(mold_area, 0, 4), 256 - 18 * PI, 0.05) and near(256 - 18 * PI, 199.45, 0.005))
# surfaces
chk("modelB: cylinder wall by perimeter-integral == 2pi r h (r=6,h=10 -> 120pi)",
    near(slab(lambda z: 2 * PI * 6, 0, 10), 120 * PI, 1e-6))
chk("modelB: sphere surface as volume derivative — finite difference of (4/3)pi r^3 at r=4 == 64pi",
    near(((F(4, 3) * (4.0005)**3 - F(4, 3) * (3.9995)**3) / 0.001), 64, 0.01))
# seam-zero: pieces alone (silo) count the seam twice; composite total is less by exactly 2 seams... 
# piece surfaces: cylinder full (2 disks + wall) = 36+36+120 = 192; hemisphere full (dome+flat) = 72+36 = 108
# glued: bury one disk of each: 192+108 - 2(36) = 228
chk("modelB: seam-zero — piece-alone totals 192+108 minus TWO buried 36-circles == 228 composite",
    192 + 108 - 2 * 36 == 228 and 36 + 36 + 120 == 192 and 72 + 36 == 108)
chk("modelB: capsule seams — pieces 2(18+9) + (48+9+9) minus 4 buried 9-circles == 84",
    2 * (18 + 9) + (48 + 18) - 4 * 9 == 84)
chk("modelB: tube surface — 60+24+2(21) == 126; volume equality is numeric coincidence (differs at length 7: 147 vs 140)",
    60 + 24 + 42 == 126 and (25 - 4) * 7 == 147 and 2 * 5 * 7 + 2 * 2 * 7 + 2 * 21 == 140)

# ============ sg-04-01 ============
w = widget("sg-04-01", "k1")
chk("01.k1", w["answer"] == 504 and traps(w) == {648, 360, 432} and 360 + 288 == 648
    and 360 + F(1, 3) * 36 * 6 == 432)
w = widget("sg-04-01", "k2")
chk("01.k2", w["answer"] == 108 and traps(w) == {90, 144, 72} and 72 + 18 == 90 and 72 + 72 == 144)
w = widget("sg-04-01", "k3")
chk("01.k3", w["answer"] == 39 and F(1, 3) * 9 * 7 == 21 and traps(w) == {81, 57, 21}
    and 63 + 18 == 81 and 21 + 36 == 57)
chk("01.i1 seam", correct_label(widget("sg-04-01", "i1")).startswith("So the joint is a single full circle"))
w = widget("sg-04-01", "i2")
chk("01.i2", w["answer"] == 7 and (F(775, 3) - F(250, 3)) / 25 == 7 and traps(w) == {10.33, 21}
    and near(775 / 3 / 25, 10.33, 0.005) and F(525, 25) == 21)
w = widget("sg-04-01", "ch")
chk("01.ch", w["answer"] == 564 and traps(w) == {684, 708, 420} and 180 + 360 + 144 == 684
    and 60 + 360 + 288 == 708 and 60 + 360 == 420)
w = widget("sg-04-01", "rem-sg-composite-add-k")
chk("01.rem", near(w["answer"], float(F(88, 3)), 0.05) and traps(w) == {24, 34.67}
    and near(24 + 32 / 3, 34.67, 0.005))

# ============ sg-04-02 ============
w = widget("sg-04-02", "k1")
chk("02.k1", w["answer"] == 126 and traps(w) == {150, 54, 24} and 9 * 6 == 54)
w = widget("sg-04-02", "k2")
chk("02.k2", near(w["answer"], 400 - 16 * PI, 0.5) and traps(w) == {400, 374.87, 299.46}
    and near(400 - 8 * PI, 374.87, 0.01) and near(400 - 32 * PI, 299.46, 0.01))
w = widget("sg-04-02", "k3")
chk("02.k3", near(w["answer"], 256 - 18 * PI, 0.5) and traps(w) == {256, 142.9, 227.72}
    and near(256 - 36 * PI, 142.9, 0.01) and near(256 - 9 * PI, 227.72, 0.01))
chk("02.i1 ring error", correct_label(widget("sg-04-02", "i1")).startswith("The ring's area"))
w = widget("sg-04-02", "i2")
chk("02.i2", w["answer"] == 126 and traps(w) == {63, 132})
w = widget("sg-04-02", "ch")
chk("02.ch", near(w["answer"], 450 * PI, 2) and traps(w) == {1256.64, 157.08, 3926.99}
    and near(400 * PI, 1256.64, 0.01) and near(50 * PI, 157.08, 0.01)
    and near(1250 * PI, 3926.99, 0.01))
w = widget("sg-04-02", "rem-sg-composite-subtract-k")
chk("02.rem", w["answer"] == 45 and (16 - 1) * 3 == 45 and traps(w) == {27, 48} and 9 * 3 == 27)

# ============ sg-04-03 ============
w = widget("sg-04-03", "k1")
chk("03.k1", w["answer"] == 120 and 2 * 6 * 10 == 120 and traps(w) == {360, 60, 72})
w = widget("sg-04-03", "k2")
chk("03.k2", w["answer"] == 228 and 120 + 72 + 36 == 228 and traps(w) == {264, 300, 192}
    and 228 + 36 == 264 and 120 + 144 + 36 == 300 and 228 - 36 == 192)
w = widget("sg-04-03", "k3")
chk("03.k3", w["answer"] == 126 and traps(w) == {84, 105, 134} and 60 + 24 == 84
    and 84 + 21 == 105 and 84 + 50 == 134)
chk("03.i1 zero times", correct_label(widget("sg-04-03", "i1")).startswith("Zero times"))
w = widget("sg-04-03", "i2")
chk("03.i2", w["answer"] == 64 and 4 * 16 == 64 and traps(w) == {16, 85.33}
    and near(float(F(4, 3) * 64), 85.33, 0.005))
w = widget("sg-04-03", "ch")
chk("03.ch", w["answer"] == 84 and 48 + 36 == 84 and traps(w) == {102, 66, 120}
    and 84 + 18 == 102 and 48 + 18 == 66 and 48 + 72 == 120)
w = widget("sg-04-03", "rem-sg-composite-surface-k")
chk("03.rem", w["answer"] == 32 and 20 + 8 + 4 == 32 and traps(w) == {36, 28})

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
print("verify-sg-ch4: ALL GREEN")
