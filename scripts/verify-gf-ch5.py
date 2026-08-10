"""gf ch5 verifier. Route A: authored answers. Route B: apply every claimed motion to the
actual preimage coordinates and demand exact image match (and demand every distractor motion
FAILS to match); verify rigidity claims by computing distances with hypot; derive all
correspondence answers from an independent zip-based cipher engine."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/geometry-foundations/lessons/gf-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

T = lambda p, v: (p[0] + v[0], p[1] + v[1])
RX = lambda p: (p[0], -p[1]); RY = lambda p: (-p[0], p[1])
YX = lambda p: (p[1], p[0]); H = lambda p: (-p[0], -p[1])
D = lambda p, k: (k * p[0], k * p[1])
dist = math.dist

# ---------- gf-05-01 ----------
chk("0501 i1 dilation not rigid", corr(wid("gf-05-01", "i1")) == "a dilation with scale factor 2"
    and dist(D((1, 2), 2), D((4, 2), 2)) != dist((1, 2), (4, 2)))
chk("0501 i1 members rigid (model)", all(
    abs(dist(f((0, 0)), f((3, 4))) - 5) < 1e-12 for f in
    [lambda p: T(p, (7, -2)), RX, RY, H, YX]))
chk("0501 k1 definition", corr(wid("gf-05-01", "k1")).startswith("some rigid motion maps"))
w = wid("gf-05-01", "i2")
# Route B: an actual rotation-then-translation preserving AB=7
th = math.radians(35)
rig = lambda p: (p[0] * math.cos(th) - p[1] * math.sin(th) + 3,
                 p[0] * math.sin(th) + p[1] * math.cos(th) - 1)
chk("0501 i2", w["answer"] == 7 and abs(dist(rig((0, 0)), rig((7, 0))) - 7) < 1e-9)
chk("0501 i2 traps", traps(w) == [3.5, 14])
w = wid("gf-05-01", "k2")
# Route B: reflect an actual 52-degree angle and measure the image
V, P1 = (0.0, 0.0), (1.0, 0.0)
P2 = (math.cos(math.radians(52)), math.sin(math.radians(52)))
def ang(v, a, b):
    d1 = math.atan2(a[1] - v[1], a[0] - v[0]); d2 = math.atan2(b[1] - v[1], b[0] - v[0])
    r = abs(math.degrees(d2 - d1)) % 360
    return min(r, 360 - r)
chk("0501 k2", w["answer"] == 52 and abs(ang(RY(V), RY(P1), RY(P2)) - 52) < 1e-9)
chk("0501 k2 traps", traps(w) == [26, 128] and 180 - 52 == 128)
chk("0501 i3", corr(wid("gf-05-01", "i3")) == "both distances and angle measures")
w = wid("gf-05-01", "ch")
Pp, Qp = D((1, 2), 2), D((4, 2), 2)
chk("0501 ch", w["answer"] == dist(Pp, Qp) == 6 and Pp == (2, 4) and Qp == (8, 4))
chk("0501 ch traps", traps(w) == [3, 12] and dist((1, 2), (4, 2)) == 3)
w = L["gf-05-01"]["remedials"][0]["check"]["widget"]
chk("0501 rem length-4", corr(w) == "a segment of length 4 anywhere in the plane")

# ---------- gf-05-02 ----------
pre = [(1, 1), (4, 1), (1, 3)]; img = [(3, 5), (6, 5), (3, 7)]
w = wid("gf-05-02", "i1")
chk("0502 i1 correct motion maps all", corr(w) == "the translation (x, y) → (x + 2, y + 4)"
    and [T(p, (2, 4)) for p in pre] == img)
chk("0502 i1 every distractor fails", [T(p, (4, 2)) for p in pre] != img
    and [H(p) for p in pre] != img and [YX(p) for p in pre] != img)
w = wid("gf-05-02", "k1")
# interiority (self-critique fix): (2,2) must lie strictly inside A(1,1) B(4,1) C(1,3)
chk("0502 k1 point interior", 2 > 1 and 2 > 1 and 2 < (11 - 2 * 2) / 3)
chk("0502 k1", w["answer"] == T((2, 2), (2, 4))[0] == 4)
chk("0502 k1 traps", traps(w) == [2, 6] and 2 + 4 == 6)
prAB = [(2, 3), (5, 1)]; imAB = [(-2, 3), (-5, 1)]
w = wid("gf-05-02", "i2")
chk("0502 i2 y-axis maps", corr(w) == "reflection over the y-axis" and [RY(p) for p in prAB] == imAB)
chk("0502 i2 distractors fail", [RX(p) for p in prAB] != imAB and [H(p) for p in prAB] != imAB)
# translation distractor: shifts unequal
s1 = (imAB[0][0] - prAB[0][0], imAB[0][1] - prAB[0][1])
s2 = (imAB[1][0] - prAB[1][0], imAB[1][1] - prAB[1][1])
chk("0502 i2 translation impossible (unequal shifts)", s1 != s2 and s1 == (-4, 0) and s2 == (-10, 0))
pr2 = [(1, 4), (3, 1)]; im2 = [(-1, -4), (-3, -1)]
w = wid("gf-05-02", "k2")
chk("0502 k2 180 maps", corr(w) == "a 180° rotation about the origin" and [H(p) for p in pr2] == im2)
chk("0502 k2 distractors fail", [RY(p) for p in pr2] != im2 and [RX(p) for p in pr2] != im2
    and [YX(p) for p in pr2] != im2)
w = wid("gf-05-02", "i3")
chk("0502 i3", w["answer"] == dist((2, 1), (2, 7)) == 6)
chk("0502 i3 traps", traps(w) == [8, 9])
w = wid("gf-05-02", "ch")
chk("0502 ch impossibility", corr(w).startswith("No — the lengths differ")
    and dist((0, 0), (5, 0)) == 5 and dist((2, 1), (2, 7)) == 6)
w = L["gf-05-02"]["remedials"][0]["check"]["widget"]
prR = [(6, 2), (1, 5)]; imR = [(6, -2), (1, -5)]
chk("0502 rem x-axis maps", corr(w) == "reflection over the x-axis" and [RX(p) for p in prR] == imR)
sh1 = (imR[0][0] - prR[0][0], imR[0][1] - prR[0][1]); sh2 = (imR[1][0] - prR[1][0], imR[1][1] - prR[1][1])
chk("0502 rem translation impossible", sh1 != sh2)

# ---------- gf-05-03: independent cipher engine ----------
def cipher(a, b): return dict(zip(a, b))
def image_of(part, m): return "".join(m[c] for c in part)
m = cipher("ABC", "DEF")
w = wid("gf-05-03", "i1")
pairs_map = w["pairs"]
label = {i["id"]: i["label"] for i in w["left"]}
rlabel = {i["id"]: i["label"] for i in w["right"]}
expect = {"side AB": "side " + image_of("AB", m), "side BC": "side " + image_of("BC", m),
          "∠A": "∠" + m["A"], "∠C": "∠" + m["C"]}
for lid_, rid_ in pairs_map.items():
    chk(f"0503 i1 {label[lid_]}", rlabel[rid_] == expect[label[lid_]])
w = wid("gf-05-03", "k1")
chk("0503 k1", corr(w) == image_of("HJ", cipher("GHJ", "PQR")) == "QR")
w = wid("gf-05-03", "k2")
# DE's preimage under cipher ABC->DEF is AB (value 9); 12 belongs to EF<->BC
inv = cipher("DEF", "ABC")
chk("0503 k2", w["answer"] == 9 and image_of("DE", inv) == "AB" and image_of("EF", inv) == "BC")
chk("0503 k2 traps", traps(w) == [12, 40])
w = wid("gf-05-03", "k3")
chk("0503 k3", w["answer"] == 64 and m["C"] == "F")
chk("0503 k3 traps", traps(w) == [26, 116] and 90 - 64 == 26 and 180 - 64 == 116)
w = wid("gf-05-03", "i2")
chk("0503 i2", corr(w) == image_of("BCA", m) == "EFD")
w = wid("gf-05-03", "ch")
chk("0503 ch", corr(w) == image_of("CAB", m) == "FDE")
w = L["gf-05-03"]["remedials"][0]["check"]["widget"]
chk("0503 rem", corr(w) == "∠" + cipher("JKL", "XYZ")["K"] == "∠Y")

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
        if w and w["type"] == "matchPairs":
            rv = [r["label"] for r in w["right"]]
            chk(f"{lid}/{s['id']} right distinct", len(set(rv)) == len(rv))
            for e in w["pairErrors"]:
                chk(f"{lid}/{s['id']} pairError not correct link", w["pairs"][e["left"]] != e["right"])

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("gf ch5 verifier: ALL PASS (claimed motions applied to coordinates; distractor motions all fail; cipher engine agrees)")
