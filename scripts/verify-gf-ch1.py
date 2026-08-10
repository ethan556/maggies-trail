"""gf ch1 verifier. Route A: authored answers as stored in the lesson JSON.
Route B: independently coded semantic models (coordinate collinearity, ray algebra,
notation type-checker, distance-test circle model, postulate fact table).
Every check below asserts Route A == Route B."""
import json, glob
from fractions import Fraction

L = {}
for p in sorted(glob.glob("content/courses/geometry-foundations/lessons/gf-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def steps(lid): return {s["id"]: s for s in L[lid]["steps"]}
def correct_of(w): return [o["label"] for o in w["options"] if o["correct"]]

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

# ---------- Route B model 1: collinearity by exact slope (gf-01-01 i2) ----------
hs = {h["id"]: h for h in steps("gf-01-01")["i2"]["widget"]["hotspots"]}
A = (Fraction(15), Fraction(62)); B = (Fraction(50), Fraction(50))
def collinear(p):
    return (B[1]-A[1])*(p[0]-A[0]) == (p[1]-A[1])*(B[0]-A[0])
model = {"pC": collinear((Fraction(85), Fraction(38))),
         "pD": collinear((Fraction(40), Fraction(20))),
         "pE": collinear((Fraction(70), Fraction(80)))}
for hid, want in model.items():
    chk(f"01 collinear {hid}", hs[hid]["correct"] == want)
chk("01 anchors not tappable-correct", not hs["pA"]["correct"] and not hs["pB"]["correct"])

# ---------- Route B model 2: line-name symmetry & object types (gf-01-01 k2) ----------
# model: object = (kind, endpointset/order rules). line PQ == line QP; ray/segment differ in kind.
def same_as_line_PQ(name):
    kind, a, b = name
    return kind == "line" and {a, b} == {"P", "Q"}
opts = {"line QP": ("line","Q","P"), "ray PQ": ("ray","P","Q"),
        "segment PQ": ("seg","P","Q"), "ray QP": ("ray","Q","P")}
k2 = steps("gf-01-01")["k2"]["widget"]
for o in k2["options"]:
    chk(f"01 k2 '{o['label']}'", o["correct"] == same_as_line_PQ(opts[o["label"]]))

# ---------- Route B model 3: postulate fact table (gf-01-01 i3, ch) ----------
# distinct lines share n points: n in {0,1}; 2 shared points => same line (uniqueness).
i3 = steps("gf-01-01")["i3"]["widget"]
chk("01 i3 correct is '0 or 1'", correct_of(i3) == ["0 or 1"])
ch1 = steps("gf-01-01")["ch"]["widget"]
chk("01 ch correct is uniqueness postulate",
    correct_of(ch1) == ["Through any two distinct points there is exactly one line"])

# ---------- Route B model 4: ray algebra on a coordinate line (gf-01-02 i3) ----------
# A,B,C at 0,1,2. ray XY = (endpoint pos(X), sign(pos(Y)-pos(X))). Same ray iff tuples equal.
pos = {"A": 0, "B": 1, "C": 2}
def ray(x, y): return (pos[x], 1 if pos[y] > pos[x] else -1)
ref = ray("A", "B")
model_rays = {"rAC": ray("A","C")==ref, "rBA": ray("B","A")==ref,
              "rBC": ray("B","C")==ref, "rCA": ray("C","A")==ref}
items = {i["id"]: i for i in steps("gf-01-02")["i3"]["widget"]["items"]}
for iid, same in model_rays.items():
    chk(f"02 ray {iid}", items[iid]["bucketId"] == ("same" if same else "diff"))

# ---------- Route B model 5: vertex = middle letter (gf-01-02 k2, i2, remedial) ----------
def vertex(name3): return name3[1]
k2b = steps("gf-01-02")["k2"]["widget"]
for o in k2b["options"]:
    nm = o["label"].replace("\u2220", "")
    chk(f"02 k2 vertex {nm}", o["correct"] == (vertex(nm) == "T"))
tap2 = steps("gf-01-02")["i2"]["widget"]
corr = [h["id"] for h in tap2["hotspots"] if h["correct"]]
chk("02 i2 vertex of XYZ is Y", corr == ["hY"])
rem = L["gf-01-02"]["remedials"][0]["check"]["widget"]
for o in rem["options"]:
    chk(f"02 rem vertex {o['label']}", o["correct"] == (vertex("PQR") == o["label"]))

# ---------- Route B model 6: alternate angle name validity (gf-01-02 ch) ----------
# vertex B; ray1 through A; ray2 through D and (beyond) C. Valid name: middle B, outers on different rays.
on_ray = {"A": 1, "D": 2, "C": 2}
def valid(name3):
    if vertex(name3) != "B": return False
    o1, o2 = name3[0], name3[2]
    if o1 not in on_ray or o2 not in on_ray: return False
    return on_ray[o1] != on_ray[o2]
chb = steps("gf-01-02")["ch"]["widget"]
for o in chb["options"]:
    nm = o["label"].replace("\u2220", "")
    chk(f"02 ch name {nm}", o["correct"] == valid(nm))

# ---------- Route B model 7: circle as distance test (gf-01-02 k1) ----------
# encode each option as a predicate over distance d from O with r=5; circle = {d == r} exactly.
preds = {"Every point at distance exactly 5 from O": lambda d: d == 5,
         "Every point at distance 5 or less from O": lambda d: d <= 5,
         "Every point inside the round shape, plus O": lambda d: d < 5,
         "The points where the circle crosses a line through O": None}  # finite set, not all of {d==5}
k1 = steps("gf-01-02")["k1"]["widget"]
samples = [0, 3, 5, 7]
truth = [d == 5 for d in samples]
for o in k1["options"]:
    p = preds[o["label"]]
    matches_circle = p is not None and [p(d) for d in samples] == truth
    chk(f"02 k1 '{o['label'][:28]}'", o["correct"] == matches_circle)

# ---------- Route B model 8: notation type-checker (gf-01-03 all) ----------
NUM, FIG = "num", "fig"
def legal(lhs, sym, rhs):
    return (lhs == rhs == NUM and sym == "=") or (lhs == rhs == FIG and sym == "\u2245")
stmts_k1 = {"AB = CD (comparing the lengths)": (NUM, "=", NUM),
            "AB \u2245 CD (comparing the lengths)": (NUM, "\u2245", NUM),
            "m(segment AB) \u2245 m(segment CD)": (NUM, "\u2245", NUM),
            "AB = segment CD": (NUM, "=", FIG)}
for o in steps("gf-01-03")["k1"]["widget"]["options"]:
    chk(f"03 k1 '{o['label'][:24]}'", o["correct"] == legal(*stmts_k1[o["label"]]))
stmts_i2 = {"m\u2220P = m\u2220Q": (NUM, "=", NUM), "\u2220P = \u2220Q": (FIG, "=", FIG),
            "m\u2220P \u2245 \u2220Q": (NUM, "\u2245", FIG), "Leave it \u2014 it's already correct": None}
for o in steps("gf-01-03")["i2"]["widget"]["options"]:
    s = stmts_i2[o["label"]]
    chk(f"03 i2 '{o['label'][:20]}'", o["correct"] == (s is not None and legal(*s)))
stmts_k2 = {"m\u2220A = 40\u00b0": (NUM, "=", NUM), "\u2220A = 40\u00b0": (FIG, "=", NUM),
            "\u2220A \u2245 40\u00b0": (FIG, "\u2245", NUM), "m\u2220A \u2245 40\u00b0": (NUM, "\u2245", NUM)}
for o in steps("gf-01-03")["k2"]["widget"]["options"]:
    chk(f"03 k2 '{o['label'][:16]}'", o["correct"] == legal(*stmts_k2[o["label"]]))
stmts_ch = {"XY = 7": (NUM, "=", NUM), "\u2220D = \u2220E": (FIG, "=", FIG),
            "m\u2220D \u2245 40\u00b0": (NUM, "\u2245", NUM), "segment XY \u2245 7": (FIG, "\u2245", NUM)}
for o in steps("gf-01-03")["ch"]["widget"]["options"]:
    chk(f"03 ch '{o['label'][:16]}'", o["correct"] == legal(*stmts_ch[o["label"]]))
buck = {i["label"]: i["bucketId"] for i in steps("gf-01-03")["i1"]["widget"]["items"]}
type_of = {"the lengths of two boards are the same": NUM,
           "two segments match exactly, end to end": FIG,
           "two angles have the same degree measure": NUM,
           "two angles are copies of each other": FIG}
for lbl, ty in type_of.items():
    chk(f"03 i1 '{lbl[:24]}'", buck[lbl] == ("num" if ty == NUM else "fig"))

# ---------- Route B model 9: intersection dimension table (gf-01-03 i3) ----------
# dim(plane)=2; generic distinct intersection drops to dim 1 => a line.
i3b = steps("gf-01-03")["i3"]["widget"]
chk("03 i3 planes meet in a line", correct_of(i3b) == ["a line"])

# ---------- structural: every mcq exactly one correct; ch1 tags in expected set ----------
TAGS = {"gf-undefined-terms", "gf-definitions", "gf-notation"}
for lid in L:
    for s in L[lid]["steps"]:
        w = s.get("widget")
        if w and w["type"] == "mcq":
            chk(f"{lid}/{s['id']} one-correct", sum(o["correct"] for o in w["options"]) == 1)
        if s["kind"] in ("check", "challenge"):
            chk(f"{lid}/{s['id']} tag", s["conceptTag"] in TAGS)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("gf ch1 verifier: ALL PASS (routes A and B agree)")
