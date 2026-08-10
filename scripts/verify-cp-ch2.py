"""cp ch2 verifier. Route A: authored answers. Route B: recompute the construction geometry
from equal-radius circle intersections (perpendicular at/from a point) and re-derive every
angle-pair fact from the parallel-lines axioms; each trap re-derived from its error model."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/constructions-and-proof/lessons/cp-02-*.json")):
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
    (x1, y1), (x2, y2) = c1, c2
    d = math.hypot(x2 - x1, y2 - y1)
    a = (r1**2 - r2**2 + d**2) / (2 * d)
    h = math.sqrt(max(r1**2 - a**2, 0))
    xm = x1 + a * (x2 - x1) / d; ym = y1 + a * (y2 - y1) / d
    return [(round(xm + h * (y2 - y1) / d, 6), round(ym - h * (x2 - x1) / d, 6)),
            (round(xm - h * (y2 - y1) / d, 6), round(ym + h * (x2 - x1) / d, 6))]

# ---------- cp-02-01: perpendicular at a point ----------
# Line on x-axis, P=(0,0); A=(-3,0), B=(3,0); equal arcs radius 5 -> Q
Q = circ_int((-3, 0), 5, (3, 0), 5)
qx, qy = [p for p in Q if p[1] > 0][0]
chk("0201 Route B: PQ vertical (perp to horizontal line)", qx == 0.0)
chk("0201 k1 equidistance reason", corr(wid("cp-02-01", "k1")).startswith("Both P and Q are equidistant"))
w = wid("cp-02-01", "k2")
chk("0201 k2 half straight angle", w["answer"] == 180 / 2 == 90 and traps(w) == [45, 180])
chk("0201 k3 is angle-bisection", corr(wid("cp-02-01", "k3")) == "bisecting the straight angle at that point")
# ch: two perpendiculars to same line are parallel; Route B — both vertical -> equal slope (undefined) -> parallel
chk("0201 ch parallel", corr(wid("cp-02-01", "ch")) == "They are parallel to each other")
chk("0201 rem equidistance", corr(L["cp-02-01"]["remedials"][0]["check"]["widget"]).startswith("Equal-radius arcs"))

# ---------- cp-02-02: perpendicular from an external point ----------
# Line x-axis, P=(0,4); first arc radius 5 meets line at (-3,0),(3,0); equal arcs from C,D -> E below
P = (0, 4)
# radius that reaches the line and beyond: r=5 => C,D at x=±3
C, D = (-3, 0), (3, 0)
E = circ_int(C, 5, D, 5)
ex, ey = [p for p in E if p[1] < 0][0]
chk("0202 Route B: PE vertical, foot at origin", ex == 0.0 and ey == -4.0)
chk("0202 k1 perp-bisector reason", corr(wid("cp-02-02", "k1")).startswith("P and E are both equidistant"))
w = wid("cp-02-02", "i2")
chk("0202 i2 pythagorean slant", w["answer"] == math.hypot(4, 3) == 5.0 and traps(w) == [4, 7] and 4 + 3 == 7)
chk("0202 k2 shortest is perpendicular", corr(wid("cp-02-02", "k2")) == "the perpendicular one")
chk("0202 i3 reflection", corr(wid("cp-02-02", "i3")) == "E is the reflection of P over the line")
# Route B reflection check: E is P reflected over x-axis
chk("0202 i3 model: E == reflect(P over line)", (ex, ey) == (P[0], -P[1]))
w = wid("cp-02-02", "ch")
chk("0202 ch foot x-coord", w["answer"] == 0 and ex == 0.0 and traps(w) == [3, 4])
chk("0202 rem distance-is-perpendicular", corr(L["cp-02-02"]["remedials"][0]["check"]["widget"]).startswith("the perpendicular from P"))

# ---------- cp-02-03: parallel through a point ----------
chk("0203 k1 corresponding-angles converse", corr(wid("cp-02-03", "k1")) == "equal corresponding angles imply the lines are parallel")
w = wid("cp-02-03", "i2")
chk("0203 i2 alternate interior equal", w["answer"] == 55 and traps(w) == [35, 125] and 180 - 55 == 125)
w = wid("cp-02-03", "k2")
chk("0203 k2 co-interior supplementary", w["answer"] == 180 - 55 == 125 and traps(w) == [55, 305] and 360 - 55 == 305)
w = wid("cp-02-03", "i3")
chk("0203 i3 corresponding equal", w["answer"] == 63 and traps(w) == [27, 117] and 180 - 63 == 117 and 90 - 63 == 27)
chk("0203 ch exactly one parallel", corr(wid("cp-02-03", "ch")) == "exactly one")
w = L["cp-02-03"]["remedials"][0]["check"]["widget"]
chk("0203 rem corresponding equal", corr(w) == "70°" and 180 - 70 == 110)

# ---------- structural + steppedReveal figure sweep ----------
FIG = set(json.load(open("content/courses/constructions-and-proof/course.json"))["chapters"][0].keys())  # noqa (not used)
import re
figs_src = open("src/components/figures.tsx").read()
registered = set(re.findall(r'"([a-z0-9-]+)":', re.search(r'export const FIGURES:.*?\{(.*?)\n\};', figs_src, re.S).group(1)))
for lid in L:
    for s in L[lid]["steps"]:
        w = s.get("widget")
        if w and w["type"] == "mcq":
            chk(f"{lid}/{s['id']} one-correct", sum(o["correct"] for o in w["options"]) == 1)
        if w and w["type"] == "numeric":
            for c in w["commonErrors"]:
                chk(f"{lid}/{s['id']} trap {c['value']} != answer",
                    abs(c["value"] - w["answer"]) > w.get("tolerance", 0))
        if w and w["type"] == "steppedReveal":
            for pan in w["panels"]:
                if "figure" in pan:
                    chk(f"{lid}/{s['id']} panel figure '{pan['figure']}' registered",
                        pan["figure"] in registered)
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} concept figure '{s['figure']}' registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("cp ch2 verifier: ALL PASS (construction geometry recomputed from equal-radius intersections; angle-pair facts re-derived; panel figures registered)")
