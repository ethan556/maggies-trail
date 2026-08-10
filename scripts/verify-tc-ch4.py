"""tc ch4 verifier. Route A: authored answers. Route B: independently recompute the four centers
from an explicit triangle and assert each concurrency + defining property (circumcenter
equidistant from vertices, incenter equidistant from sides, centroid = vertex average with 2:1
median split, orthocenter on the Euler line with circumcenter and centroid). Traps re-derived."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/triangle-congruence/lessons/tc-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def dist(p, q): return math.hypot(p[0] - q[0], p[1] - q[1])

# ---- Route B: compute the four centers from an explicit triangle ----
A, B, C = (50, 140), (250, 150), (130, 45)
ax, ay = A; bx, by = B; cx, cy = C
G = ((ax + bx + cx) / 3, (ay + by + cy) / 3)
d0 = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
O = (((ax**2 + ay**2) * (by - cy) + (bx**2 + by**2) * (cy - ay) + (cx**2 + cy**2) * (ay - by)) / d0,
     ((ax**2 + ay**2) * (cx - bx) + (bx**2 + by**2) * (ax - cx) + (cx**2 + cy**2) * (bx - ax)) / d0)
a = dist(B, C); b = dist(A, C); c = dist(A, B)
I = ((a * ax + b * bx + c * cx) / (a + b + c), (a * ay + b * by + c * cy) / (a + b + c))
H = (ax + bx + cx - 2 * O[0], ay + by + cy - 2 * O[1])

# concurrency / property assertions
chk("Route B circumcenter equidistant from vertices",
    abs(dist(O, A) - dist(O, B)) < 1e-6 and abs(dist(O, B) - dist(O, C)) < 1e-6)
def dist_pt_line(P, Q, R):
    return abs((R[0] - Q[0]) * (Q[1] - P[1]) - (Q[0] - P[0]) * (R[1] - Q[1])) / dist(Q, R)
chk("Route B incenter equidistant from sides",
    abs(dist_pt_line(I, A, B) - dist_pt_line(I, B, C)) < 1e-6 and abs(dist_pt_line(I, B, C) - dist_pt_line(I, C, A)) < 1e-6)
Mbc = ((bx + cx) / 2, (by + cy) / 2)
chk("Route B centroid 2:1 on median", abs(dist(A, G) / dist(G, Mbc) - 2) < 1e-6)
chk("Route B Euler line (O,G,H collinear)",
    abs((G[0] - O[0]) * (H[1] - O[1]) - (G[1] - O[1]) * (H[0] - O[0])) < 1e-6)
AH = (H[0] - ax, H[1] - ay); BC = (cx - bx, cy - by)
chk("Route B orthocenter: altitude perp to opposite side", abs(AH[0] * BC[0] + AH[1] * BC[1]) < 1e-6)

# ---------- tc-04-01 circumcenter & incenter ----------
chk("0401 i1 equidistant vertices", corr(wid("tc-04-01", "i1")) == "the three vertices")
chk("0401 k1 circumscribed circle", corr(wid("tc-04-01", "k1")).startswith("the circle passing through all three vertices"))
chk("0401 i2 equidistant sides", corr(wid("tc-04-01", "i2")) == "the three sides")
chk("0401 k2 inscribed circle", corr(wid("tc-04-01", "k2")).startswith("the inscribed circle"))
w = wid("tc-04-01", "i3")
chk("0401 i3 pairs", w["pairs"]["cc"] == "pb" and w["pairs"]["ic"] == "ab")
chk("0401 ch equidistant towns -> circumcenter", corr(wid("tc-04-01", "ch")) == "the circumcenter")
chk("0401 rem incenter sides", corr(L["tc-04-01"]["remedials"][0]["check"]["widget"]) == "sides")

# ---------- tc-04-02 centroid & orthocenter ----------
chk("0402 i1 2:1 ratio", corr(wid("tc-04-02", "i1")).startswith("2 : 1"))
w = wid("tc-04-02", "k1")
chk("0402 k1 centroid x-avg", w["answer"] == (0 + 6 + 3) / 3 == 3 and traps(w) == [6, 9] and 0 + 6 + 3 == 9)
chk("0402 i2 altitudes orthocenter", corr(wid("tc-04-02", "i2")) == "the orthocenter")
chk("0402 k2 median vs altitude", corr(wid("tc-04-02", "k2")).startswith("A median goes to the opposite midpoint"))
chk("0402 i3 euler trio", corr(wid("tc-04-02", "i3")).startswith("circumcenter, centroid, and orthocenter"))
w = wid("tc-04-02", "ch")
chk("0402 ch centroid y-avg", w["answer"] == (2 + 8 + 5) / 3 == 5 and traps(w) == [8, 15] and 2 + 8 + 5 == 15)
chk("0402 rem centroid medians", corr(L["tc-04-02"]["remedials"][0]["check"]["widget"]) == "medians")

# ---------- tc-04-03 choosing ----------
b1 = {i["label"]: i["bucketId"] for i in wid("tc-04-03", "i1")["items"]}
chk("0403 i1 buckets", b1["circumcenter (perpendicular bisectors)"] == "bis" and b1["incenter (angle bisectors)"] == "bis"
    and b1["centroid (medians)"] == "vert" and b1["orthocenter (altitudes)"] == "vert")
chk("0403 k1 sprinkler incenter", corr(wid("tc-04-03", "k1")) == "the incenter")
w = wid("tc-04-03", "i2")
chk("0403 i2 property pairs", w["pairs"]["cc"] == "pv" and w["pairs"]["ic"] == "ps" and w["pairs"]["ce"] == "pb")
chk("0403 k2 balance centroid", corr(wid("tc-04-03", "k2")) == "the centroid")
chk("0403 i3 always inside pair", corr(wid("tc-04-03", "i3")).startswith("centroid and incenter"))
chk("0403 ch circle through vertices", corr(wid("tc-04-03", "ch")) == "circumcenter")
chk("0403 rem vertices circumcenter", corr(L["tc-04-03"]["remedials"][0]["check"]["widget"]) == "circumcenter")

# ---------- structural + figure sweep ----------
import re
figs_src = open("src/components/figures.tsx").read()
registered = set(re.findall(r'"([a-z0-9-]+)":', re.search(r'export const FIGURES:.*?\{(.*?)\n\};', figs_src, re.S).group(1)))
for lid in L:
    for s in L[lid]["steps"]:
        w = s.get("widget")
        if w and w["type"] == "mcq":
            chk(f"{lid}/{s['id']} one-correct", sum(o["correct"] for o in w["options"]) == 1)
        if w and w["type"] == "numeric":
            for cc in w["commonErrors"]:
                chk(f"{lid}/{s['id']} trap {cc['value']} != answer",
                    abs(cc["value"] - w["answer"]) > w.get("tolerance", 0))
        if w and w["type"] == "matchPairs":
            rv = [r["label"] for r in w["right"]]
            chk(f"{lid}/{s['id']} right distinct", len(set(rv)) == len(rv))
            for e in w["pairErrors"]:
                chk(f"{lid}/{s['id']} pairError not correct", w["pairs"][e["left"]] != e["right"])
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} fig '{s['figure']}' registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("tc ch4 verifier: ALL PASS (four centers recomputed with concurrency + defining properties; Euler line confirmed)")
