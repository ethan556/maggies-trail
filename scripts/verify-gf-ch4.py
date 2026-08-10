"""gf ch4 verifier. Route A: taught coordinate rules traced step by step.
Route B: (compositions) 2x2 matrix / vector algebra applied as function composition;
(symmetry) brute-force testing of actual vertex sets under all candidate reflections
and all integer rotations 1°-360°. Traps re-derived from named error models."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/geometry-foundations/lessons/gf-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

# Route A rules
T = lambda p, v: (p[0] + v[0], p[1] + v[1])
RX = lambda p: (p[0], -p[1]); RY = lambda p: (-p[0], p[1])
YX = lambda p: (p[1], p[0]); H = lambda p: (-p[0], -p[1])
# Route B: matrix application
def M(p, m): return (m[0][0]*p[0] + m[0][1]*p[1], m[1][0]*p[0] + m[1][1]*p[1])
mRX, mRY, mYX, mH = [[1,0],[0,-1]], [[-1,0],[0,1]], [[0,1],[1,0]], [[-1,0],[0,-1]]
def both(a, b, name):
    chk(name + " routes agree", a == b); return a

# ---------- gf-04-01 compositions ----------
w = wid("gf-04-01", "i1")
ans = both(RY(T((3,4),(2,1))), M(T((3,4),(2,1)), mRY), "0401 i1")
chk("0401 i1 correct", corr(w) == "(−5, 5)" and ans == (-5, 5))
chk("0401 i1 distractor models",
    T(RY((3,4)),(2,1)) == (-1,5) and T((3,4),(2,1)) == (5,5) and RX(T((3,4),(2,1))) == (5,-5))
w = wid("gf-04-01", "k1")
ans = both(H(T((7,2),(-3,0))), M(T((7,2),(-3,0)), mH), "0401 k1")
chk("0401 k1", w["answer"] == ans[0] == -4)
chk("0401 k1 traps", traps(w) == [-10, 4] and T(H((7,2)),(-3,0))[0] == -10 and T((7,2),(-3,0))[0] == 4)
w = wid("gf-04-01", "k2")
a_order = T(RY((1,3)),(4,0)); b_order = RY(T((1,3),(4,0)))
chk("0401 k2 non-commuting model", a_order == (3,3) and b_order == (-5,3) and a_order != b_order)
chk("0401 k2 correct", corr(w).startswith("They differ: R-then-T gives (3, 3)"))
w = wid("gf-04-01", "k3")
glide = RX(T((1,2),(4,0)))
chk("0401 k3", w["answer"] == glide[1] == -2)
chk("0401 k3 glide commutes (parallel mirror)", T(RX((1,2)),(4,0)) == glide)
chk("0401 k3 traps", traps(w) == [2, 5] and glide[0] == 5)
w = wid("gf-04-01", "ch")
ans = both(H(YX((2,6))), M(M((2,6), mYX), mH), "0401 ch")
chk("0401 ch correct", corr(w) == "(−6, −2)" and ans == (-6,-2))
chk("0401 ch distractor models", H((2,6)) == (-2,-6) and YX((2,6)) == (6,2) and RY(YX((2,6))) == (-6,2))
w = L["gf-04-01"]["remedials"][0]["check"]["widget"]
chk("0401 rem", w["answer"] == RY(T((1,2),(3,0)))[0] == -4)
chk("0401 rem traps", traps(w) == [-1, 4] and RY((1,2))[0] == -1 and T((1,2),(3,0))[0] == 4)

# ---------- symmetry brute-force machinery (Route B) ----------
def refl_line(p, deg, ctr=(0,0)):
    a = math.radians(deg); c, s = math.cos(2*a), math.sin(2*a)
    x, y = p[0]-ctr[0], p[1]-ctr[1]
    return (ctr[0] + c*x + s*y, ctr[1] + s*x - c*y)
def rot(p, deg, ctr=(0,0)):
    a = math.radians(deg)
    x, y = p[0]-ctr[0], p[1]-ctr[1]
    return (ctr[0] + x*math.cos(a) - y*math.sin(a), ctr[1] + x*math.sin(a) + y*math.cos(a))
def maps_to_self(verts, f):
    img = [f(v) for v in verts]
    return all(any(abs(a[0]-b[0]) < 1e-6 and abs(a[1]-b[1]) < 1e-6 for b in verts) for a in img)
def line_count(verts, ctr=(0,0), step=1):
    return sum(1 for d10 in range(0, 1800, step) if maps_to_self(verts, lambda p: refl_line(p, d10/10, ctr)))
def min_rot(verts, ctr=(0,0)):
    for d in range(1, 361):
        if maps_to_self(verts, lambda p: rot(p, d, ctr)): return d
    return None
def ngon(n): return [(math.cos(2*math.pi*k/n + math.pi/2), math.sin(2*math.pi*k/n + math.pi/2)) for k in range(n)]

# ---------- gf-04-02 line symmetry ----------
rect = [(2,1),(-2,1),(-2,-1),(2,-1)]
w = wid("gf-04-02", "k1")
chk("0402 k1 rectangle", w["answer"] == line_count(rect, step=25) == 2)  # 2.5° sweep
chk("0402 k1 diagonal fails (trap 4 model)",
    not maps_to_self(rect, lambda p: refl_line(p, math.degrees(math.atan2(1, 2)))))
w = wid("gf-04-02", "k2")
chk("0402 k2 pentagon", w["answer"] == line_count(ngon(5), step=5) == 5)  # 0.5-degree sweep: pentagon lines sit at 18-degree family
w = wid("gf-04-02", "i3")
import random
random.seed(7)
scal = [(0,0), (5,0), (1,3)]
chk("0402 i3 scalene", w["answer"] == 0)
chk("0402 i3 model", line_count(scal, ctr=(2,1), step=5) == 0)
w = wid("gf-04-02", "i2")
chk("0402 i2 circle", corr(w).startswith("Infinitely many"))
# Route B: sample many angles — every line through the center mirrors a circle (point set on radius 1)
circ = [(math.cos(t/7), math.sin(t/7)) for t in range(44)]
chk("0402 i2 model (dense angles all work for the full circle)",
    all(abs(math.hypot(*refl_line(p, d)) - 1) < 1e-9 for p in circ for d in range(0, 180, 7)))
w = wid("gf-04-02", "ch")
square = [(1,1),(-1,1),(-1,-1),(1,-1)]
hexv = ngon(6)
para = [(0,0),(4,0),(5,2),(1,2)]
chk("0402 ch counts", line_count(square, step=25) == 4 and line_count(hexv, step=25) == 6
    and line_count(para, ctr=(2.5,1), step=5) == 0)
chk("0402 ch correct", corr(w) == "a square")
w = L["gf-04-02"]["remedials"][0]["check"]["widget"]
chk("0402 rem equilateral", w["answer"] == line_count(ngon(3), step=5) == 3)

# ---------- gf-04-03 rotational symmetry ----------
w = wid("gf-04-03", "i1")
chk("0403 i1 square 90", w["answer"] == min_rot(square) == 90)
w = wid("gf-04-03", "k1")
chk("0403 k1 hexagon 60", w["answer"] == min_rot(hexv) == 60)
chk("0403 k1 order x angle", 6 * 60 == 360 and traps(w) == [6, 120])
w = wid("gf-04-03", "i2")
chk("0403 i2 pinwheel order", w["answer"] == 360 / 45 == 8)
w = wid("gf-04-03", "k2")
# Route B letter models as point sets: N = two verticals + diagonal (sampled); A as up-triangle-ish; T; E
Nv = [(-1,-1),(-1,1),(1,-1),(1,1),(-0.5,0.5),(0,0),(0.5,-0.5)]
chk("0403 k2 N has 180", maps_to_self(Nv, lambda p: rot(p, 180)))
Tv = [(-1,1),(1,1),(0,1),(0,0),(0,-1)]
chk("0403 k2 T lacks 180", not maps_to_self(Tv, lambda p: rot(p, 180)))
Ev = [(-1,1),(1,1),(-1,0),(0.6,0),(-1,-1),(1,-1),(-1,0.5),(-1,-0.5)]
chk("0403 k2 E lacks 180", not maps_to_self(Ev, lambda p: rot(p, 180)))
chk("0403 k2 correct", corr(w) == "N")
w = wid("gf-04-03", "i3")
chk("0403 i3 para 180", maps_to_self(para, lambda p: rot(p, 180, (2.5,1))) and corr(w).startswith("It lands exactly"))
w = wid("gf-04-03", "ch")
chk("0403 ch parallelogram rotation-only",
    corr(w).startswith("a parallelogram") and min_rot(para, (2.5,1)) == 180
    and line_count(para, ctr=(2.5,1), step=5) == 0)
iso = [(0,2), (-1.5,0), (1.5,0)]
chk("0403 ch isosceles mirror-only",
    line_count(iso, ctr=(0,0.7), step=5) >= 1 and min_rot(iso, (0, 2/3)) in (None, 360))
w = L["gf-04-03"]["remedials"][0]["check"]["widget"]
chk("0403 rem triangle 120", w["answer"] == min_rot(ngon(3)) == 120)

# structural sweep
for lid in L:
    for s in L[lid]["steps"]:
        w = s.get("widget")
        if w and w["type"] == "mcq":
            chk(f"{lid}/{s['id']} one-correct", sum(o["correct"] for o in w["options"]) == 1)
        if w and w["type"] == "numeric":
            for c in w["commonErrors"]:
                chk(f"{lid}/{s['id']} trap {c['value']} != answer",
                    abs(c["value"] - w["answer"]) > w.get("tolerance", 0))

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("gf ch4 verifier: ALL PASS (rule tracing, matrix composition, and brute-force symmetry agree)")
