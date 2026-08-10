"""Dual-route verifier: solid-geometry ch3 (volume justifications).
Route A: exact Fraction arithmetic — the cube tiling 216/3, every (1/3)Bh, the
hemisphere identity as exact fractions (125 - 125/3 = 250/3), and the slice
identity r^2 - h^2 == r^2 - h^2 verified SYMBOLICALLY at a sweep of exact
rational heights. Route B: numerical slab integration of the ACTUAL solids —
the pyramid's (z/h)^2 sections integrated to exactly 1/3 Bh; the hemisphere
integrated directly (pi(r^2-h^2) slabs) to 250pi/3 AND the drilled cylinder
(ring slabs) integrated to the same number; the sphere as 2x hemisphere checked
against (4/3)pi r^3 for r in {5,6}; the melt challenge solved two ways (exact
288/36 and integral/36pi); the oblique pyramid integrated with drift-free
similarity sections; falsification — a paraboloid's sections pi(r^2 - (h^2/r)*r)
style profile integrates to a measurably DIFFERENT total than the hemisphere.
Deps: vm (prism Bh), tm ch5 (formula recalls being justified), sy (k^2 slice
law), ch1 (slice law), ch2 (Cavalieri)."""
import json, glob, math, sys
from fractions import Fraction as F

L = {j["id"]: j for f in glob.glob("content/courses/solid-geometry/lessons/sg-03-*.json")
     for j in [json.load(open(f))]}
assert set(L) == {"sg-03-01", "sg-03-02", "sg-03-03"}, sorted(L)

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

# ---- Route A: exact identities ----
chk("modelA: cube tiling — 216/3 == 72 == (1/3)(36)(6) exactly",
    F(216, 3) == 72 and F(1, 3) * 36 * 6 == 72)
def disk_coeff(h):
    """From the SPHERE construction: surface point at height h has horizontal reach sqrt(25-h^2)."""
    return F(25) - h * h
def ring_coeff(h):
    """From the DRILLED-CYLINDER construction: outer radius 5; the 45-degree cone (apex at base
    center, rim at (5,5)) meets height h at inner radius h."""
    inner = h  # slant line x = z of the r=5, h=5 cone
    return F(25) - inner * inner
chk("modelA: slice identity — disk (sphere construction) == ring (drilled-cylinder construction) at exact h sweep",
    all(disk_coeff(h) == ring_coeff(h) and 0 <= disk_coeff(h) for h in
        [F(0), F(1, 2), F(3), F(7, 2), F(9, 2), F(5)]))
chk("modelA: hemisphere exact — 125 - 125/3 == 250/3; x2 == 500/3; (4/3)125 == 500/3",
    F(125) - F(125, 3) == F(250, 3) and 2 * F(250, 3) == F(500, 3) and F(4, 3) * 125 == F(500, 3))
chk("modelA: melt — 288/36 == 8 == 4*6/3 (the general 4r/3)",
    F(288, 36) == 8 and F(4 * 6, 3) == 8)
chk("modelA: hemisphere fraction of bounding cylinder — (2/3) exactly; 250/3 over 125 == 2/3",
    F(250, 3) / 125 == F(2, 3))

# ---- Route B: integrated solids ----
chk("modelB: pyramid B=36 h=6 — (z/h)^2 sections integrate to 72 == (1/3)Bh",
    near(slab(lambda z: 36 * (z / 6)**2, 0, 6), 72, 0.05))
chk("modelB: cone r=3 h=10 — integrates to 30pi",
    near(slab(lambda z: math.pi * (3 * z / 10)**2, 0, 10), 30 * math.pi, 0.05))
vhemi = slab(lambda h: math.pi * (25 - h * h), 0, 5)
vring = slab(lambda h: math.pi * 25 - math.pi * h * h, 0, 5)
chk("modelB: hemisphere r=5 integrated == drilled cylinder integrated == 250pi/3",
    near(vhemi, 250 * math.pi / 3, 0.01) and near(vring, vhemi, 1e-9))
chk("modelB: sphere r=5 and r=6 — 2x hemisphere integrals match (4/3)pi r^3",
    near(2 * vhemi, F(4, 3) * 125 * math.pi, 0.02)
    and near(2 * slab(lambda h: math.pi * (36 - h * h), 0, 6), 288 * math.pi, 0.03))
chk("modelB: melt second route — hemisphere-doubled integral / (36pi) == 8",
    near(2 * slab(lambda h: math.pi * (36 - h * h), 0, 6) / (36 * math.pi), 8, 0.001))
chk("modelB: oblique pyramid B=48 h=9 — drift-free sections integrate to 144",
    near(slab(lambda z: 48 * (z / 9)**2, 0, 9), 144, 0.05))
chk("modelB: cylinder r=5 h=8 — constant sections integrate to 200pi; leaning r=6 h=10 to 360pi",
    near(slab(lambda z: 25 * math.pi, 0, 8), 200 * math.pi, 1e-6)
    and near(slab(lambda z: 36 * math.pi, 0, 10), 360 * math.pi, 1e-6))
chk("modelB: half-pipe r=4 l=9 — half-disk sections integrate to 72pi",
    near(slab(lambda z: math.pi * 16 / 2, 0, 9), 72 * math.pi, 1e-6))
chk("modelB: tunnel — constant 18 over 50 integrates to 900",
    near(slab(lambda z: 18, 0, 50), 900, 1e-6))
chk("modelB: halfway-from-apex pyramid slice — (1/2)^2 * 36 == 9 (exact k^2 law)",
    F(1, 2)**2 * 36 == 9)
chk("modelB: paraboloid falsification — pi(25 - 5h) sections integrate to 62.5pi != hemisphere's 250pi/3",
    not near(slab(lambda h: math.pi * (25 - 5 * h), 0, 5), 250 * math.pi / 3, 1))

# ============ sg-03-01 ============
w = widget("sg-03-01", "k1")
chk("01.k1", w["answer"] == 200 and 25 * 8 == 200 and traps(w) == {40, 66.67, 400}
    and near(200 / 3, 66.67, 0.005))
chk("01.k2 argument", correct_label(widget("sg-03-01", "k2")).startswith("The cylinder's sections"))
w = widget("sg-03-01", "k3")
chk("01.k3", near(w["answer"], 360 * math.pi, 1) and traps(w) == {376.99, 188.5, 1357.17}
    and near(120 * math.pi, 376.99, 0.01) and near(60 * math.pi, 188.5, 0.01)
    and near(432 * math.pi, 1357.17, 0.01))
w = widget("sg-03-01", "i1")
chk("01.i1", w["answer"] == 72 and F(16 * 9, 2) == 72 and traps(w) == {144, 36})
chk("01.i2 twin", correct_label(widget("sg-03-01", "i2")).startswith("The same height and the same BASE AREA"))
w = widget("sg-03-01", "ch")
chk("01.ch", w["answer"] == 900 and 18 * 50 == 900 and traps(w) == {68, 300, 450}
    and F(900, 3) == 300)
w = widget("sg-03-01", "rem-sg-cylinder-justified-k")
chk("01.rem", w["answer"] == 84 and 12 * 7 == 84 and traps(w) == {19, 28})

# ============ sg-03-02 ============
w = widget("sg-03-02", "k1")
chk("02.k1", w["answer"] == 72 and traps(w) == {108, 216, 36} and F(216, 2) == 108)
chk("02.k2 spread", correct_label(widget("sg-03-02", "k2")).startswith("Similarity shrinks"))
w = widget("sg-03-02", "k3")
chk("02.k3", w["answer"] == 30 and F(1, 3) * 9 * 10 == 30 and traps(w) == {90, 10, 60})
w = widget("sg-03-02", "i1")
chk("02.i1", w["answer"] == 9 and traps(w) == {18, 12})
chk("02.i2 leftover", correct_label(widget("sg-03-02", "i2")).startswith("\u2154 of the cylinder"))
w = widget("sg-03-02", "ch")
chk("02.ch", w["answer"] == 144 and F(1, 3) * 48 * 9 == 144 and traps(w) == {432, 216, 48}
    and 48 * 9 == 432 and F(432, 2) == 216)
w = widget("sg-03-02", "rem-sg-third-story-k")
chk("02.rem", w["answer"] == 80 and F(1, 3) * 30 * 8 == 80 and traps(w) == {240, 120})

# ============ sg-03-03 ============
w = widget("sg-03-03", "k1")
chk("03.k1", w["answer"] == 16 and 25 - 9 == 16 and traps(w) == {25, 9, 4})
w = widget("sg-03-03", "k2")
chk("03.k2", near(w["answer"], float(F(250, 3)), 0.05) and traps(w) == {125, 41.67, 166.67}
    and near(float(F(125, 3)), 41.67, 0.005) and near(float(F(500, 3)), 166.67, 0.005))
w = widget("sg-03-03", "k3")
chk("03.k3", w["answer"] == 288 and F(4, 3) * 216 == 288 and traps(w) == {216, 144, 864}
    and F(2, 3) * 216 == 144 and 4 * 216 == 864)
chk("03.i1 ingredients", correct_label(widget("sg-03-03", "i1")).startswith("The Pythagorean slice law"))
w = widget("sg-03-03", "i2")
chk("03.i2", near(w["answer"], 2 / 3, 0.01) and traps(w) == {0.5, 0.33})
w = widget("sg-03-03", "ch")
chk("03.ch", w["answer"] == 8 and traps(w) == {6, 12, 4.5} and near(36 / 8, 4.5, 1e-9))
w = widget("sg-03-03", "rem-sg-sphere-justified-k")
chk("03.rem", w["answer"] == 64 and 100 - 36 == 64 and traps(w) == {100, 36})

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
print("verify-sg-ch3: ALL GREEN")
