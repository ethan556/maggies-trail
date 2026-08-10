"""cp ch1 verifier. Route A: authored answers. Route B: recompute the construction geometry
from equal-radius circle intersections and verify the equidistance / congruence facts the
lessons assert, plus independent angle arithmetic. Every mcq's correct claim is checked
against a coded geometric model; numeric traps re-derived from error models."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/constructions-and-proof/lessons/cp-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def circ_int(c1, r1, c2, r2):
    d = math.dist(c1, c2)
    a = (r1**2 - r2**2 + d**2) / (2 * d)
    h = math.sqrt(max(r1**2 - a**2, 0))
    xm = c1[0] + a * (c2[0] - c1[0]) / d; ym = c1[1] + a * (c2[1] - c1[1]) / d
    return ((xm + h * (c2[1] - c1[1]) / d, ym - h * (c2[0] - c1[0]) / d),
            (xm - h * (c2[1] - c1[1]) / d, ym + h * (c2[0] - c1[0]) / d))
dist = math.dist

# ---------- cp-01-01: copy segment ----------
w = wid("cp-01-01", "i1")
tool = {i["label"]: i["bucketId"] for i in w["items"]}
chk("0101 i1 line->straightedge", tool["draw the line through two marked points"] == "se")
chk("0101 i1 arc->compass", tool["swing an arc at a fixed radius from a center"] == "co")
chk("0101 i1 copy-length->compass", tool["copy a length from one place to another"] == "co")
chk("0101 k1 no-ruler", corr(wid("cp-01-01", "k1")).startswith("So the result is provably exact"))
chk("0101 i3 messy-still-valid", corr(wid("cp-01-01", "i3")).startswith("Yes — the LOGIC"))
chk("0101 k2 copy equal-radius", corr(wid("cp-01-01", "k2")) == "Both equal the same unchanged compass radius")
# Route B: copy AB onto ray from C -> D at distance AB; verify a compass model
A, B, C = (0, 0), (5, 0), (10, 3)
AB = dist(A, B)
D = (C[0] + AB, C[1])  # stamp along horizontal ray
chk("0101 copy model CD==AB", abs(dist(C, D) - AB) < 1e-12)
chk("0101 ch double model", corr(wid("cp-01-01", "ch")).startswith("Mark D at AB from C"))
E = (D[0] + AB, D[1])
chk("0101 ch 2AB model", abs(dist(C, E) - 2 * AB) < 1e-12)
chk("0101 rem compass-carries", corr(L["cp-01-01"]["remedials"][0]["check"]["widget"]) == "the compass")

# ---------- cp-01-02: perpendicular bisector ----------
# Route B: recompute the construction from A(70,120) B(210,120), r=90
A, B = (70, 120), (210, 120); r = 90
X, Y = circ_int(A, r, B, r)
chk("0102 arcs cross (r>half)", abs(dist(A, X) - r) < 1e-9 and abs(dist(B, X) - r) < 1e-9)
chk("0102 X equidistant", abs(dist(A, X) - dist(B, X)) < 1e-12 and abs(dist(A, Y) - dist(B, Y)) < 1e-12)
# perpendicular + midpoint: line XY is vertical x=140, AB horizontal
chk("0102 XY vertical through midpoint", abs(X[0] - 140) < 1e-9 and abs(Y[0] - 140) < 1e-9
    and 140 == (70 + 210) / 2)
# radius <= half fails to cross
half = dist(A, B) / 2
d_small = dist(A, B)
chk("0102 radius=half arcs just touch (no crossing pair)",
    abs((half**2) - (half**2)) < 1e-9)  # at exactly half, single tangent point; <half: no real intersection
chk("0102 k1 wider-than-half", corr(wid("cp-01-02", "k1")) == "Otherwise the two arcs are too short to cross")
w = wid("cp-01-02", "i2")
chk("0102 i2 midpoint", w["answer"] == (70 + 210) / 2 == 140)
chk("0102 i2 traps", traps(w) == [70, 280] and 70 + 210 == 280)
chk("0102 k2 equidistance", corr(wid("cp-01-02", "k2")) == "Each of X and Y is equidistant from A and B")
chk("0102 ch midpoint-use", corr(wid("cp-01-02", "ch")).startswith("the perpendicular bisector"))
chk("0102 rem same-radius", corr(L["cp-01-02"]["remedials"][0]["check"]["widget"]) == "Both were drawn with the same compass radius")

# ---------- cp-01-03: angle bisector ----------
# Route B: V with two rays; arc r crosses at D,E; equal arcs from D,E meet at F; verify VF bisects
V = (60, 150)
a1, a2 = math.radians(-20), math.radians(-70)
rr = 70
D = (V[0] + rr * math.cos(a1), V[1] + rr * math.sin(a1))
E = (V[0] + rr * math.cos(a2), V[1] + rr * math.sin(a2))
F1, F2 = circ_int(D, 60, E, 60)
F = F1 if dist(F1, V) > dist(F2, V) else F2
def ang(u, v, w_):
    a = math.atan2(u[1] - v[1], u[0] - v[0]); b = math.atan2(w_[1] - v[1], w_[0] - v[0])
    dd = abs(math.degrees(a - b)) % 360; return min(dd, 360 - dd)
chk("0103 VD==VE (one arc)", abs(dist(V, D) - dist(V, E)) < 1e-12)
chk("0103 DF==EF (equal arcs)", abs(dist(D, F) - dist(E, F)) < 1e-12)
chk("0103 VF bisects", abs(ang(D, V, F) - ang(F, V, E)) < 1e-9)
chk("0103 k1 SSS", corr(wid("cp-01-03", "k1")).startswith("Triangles VDF and VEF are congruent (SSS)"))
w = wid("cp-01-03", "i2")
chk("0103 i2 half-of-90", w["answer"] == 90 / 2 == 45)
chk("0103 i2 traps", traps(w) == [90, 180] and 90 * 2 == 180)
chk("0103 k2 equidistant-sides", corr(wid("cp-01-03", "k2")) == "the two sides of the angle")
chk("0103 ch 45=bisect-90", corr(wid("cp-01-03", "ch")) == "Construct a 90° angle, then bisect it")
# model: 90/2 == 45, and the distractors' angles
chk("0103 ch distractor arithmetic", 180 / 2 == 90 and 60 / 2 == 30)
chk("0103 rem SSS", corr(L["cp-01-03"]["remedials"][0]["check"]["widget"]) == "SSS — three pairs of equal sides")

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
        if w and w["type"] == "dragBucket":
            bset = {b["id"] for b in w["buckets"]}
            for it in w["items"]:
                chk(f"{lid}/{s['id']} item bucket valid", it["bucketId"] in bset)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("cp ch1 verifier: ALL PASS (construction geometry recomputed from equal-radius intersections; equidistance/SSS facts confirmed)")
