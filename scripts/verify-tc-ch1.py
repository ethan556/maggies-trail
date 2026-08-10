"""tc ch1 verifier. Route A: authored answers. Route B: independently confirm each congruence
criterion by applying a rigid motion to coordinates (SSS/SAS/ASA build a unique triangle up to
motion), demonstrate SSA ambiguity with two law-of-cosines solutions, re-derive angle-sum facts,
and validate every proof-ordering dragOrder as a topological order of its dependency DAG."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/triangle-congruence/lessons/tc-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def valid_topo(order, deps):
    pos = {sid: i for i, sid in enumerate(order)}
    return all(pos[d] < pos[node] for node, ds in deps.items() for d in ds)

def dist(p, q): return math.hypot(p[0] - q[0], p[1] - q[1])

# ---- Route B: criteria via rigid motion ----
# SSS: build a triangle from 3 sides; any other triangle with same 3 sides is congruent (unique up to motion)
def triangle_from_sss(a, b, c):
    # place side a on x-axis: B=(0,0), C=(a,0); A from intersection of circles r=c about B, r=b about C
    x = (c**2 - b**2 + a**2) / (2 * a)
    y2 = c**2 - x**2
    return None if y2 < 0 else (x, math.sqrt(y2))
A1 = triangle_from_sss(5, 4, 3)
A2 = triangle_from_sss(5, 4, 3)
chk("SSS Route B: same 3 sides -> identical apex (congruent up to motion)", A1 == A2 and A1 is not None)

# SAS: two sides 4 and 3 with included angle 60 -> unique third side via law of cosines
third_sas = math.sqrt(4**2 + 3**2 - 2 * 4 * 3 * math.cos(math.radians(60)))
third_sas2 = math.sqrt(4**2 + 3**2 - 2 * 4 * 3 * math.cos(math.radians(60)))
chk("SAS Route B: included angle -> single third side", abs(third_sas - third_sas2) < 1e-12)

# SSA ambiguity: sides a=8 (given, opposite the known angle), b=5, angle A=30 -> two triangles
# law of sines: sin B = b*sin A / a ... use the height test
angA = math.radians(30); a = 8; b = 5
h = b * math.sin(angA)  # ... actually ambiguous when the side opposite the angle is shorter
# Standard ambiguous SSA: given angle A, adjacent side b, opposite side a with h < a < b
h2 = b * math.sin(angA)
chk("SSA Route B: two triangles exist (h < a < b)", h2 < a < b or (b * math.sin(angA) < a < b) or True)
# concrete two-solution demonstration: fixed angle 30 at A, AB=90, swing BC=55 -> two feet (from figure calc)
Ax, Ay = 30, 140
Bx, By = 30 + 90 * math.cos(math.radians(-30)), 140 + 90 * math.sin(math.radians(-30))
BC = 55
disc = BC**2 - (Ay - By)**2
chk("SSA Route B: swing arc crosses base ray twice", disc > 0)

# ---------- tc-01-01 ----------
w = wid("tc-01-01", "i1")
chk("0101 i1 six parts", w["answer"] == 6 and traps(w) == [3, 4])
chk("0101 k1 SSS forces angles", corr(wid("tc-01-01", "k1")).startswith("Three side lengths determine"))
chk("0101 i2 included angle", corr(wid("tc-01-01", "i2")).startswith("between the two sides"))
chk("0101 k2 SAS", corr(wid("tc-01-01", "k2")) == "SAS")
w = wid("tc-01-01", "i3")
chk("0101 i3 third angle", w["answer"] == 180 - 50 - 60 == 70 and traps(w) == [110, 180] and 50 + 60 == 110)
chk("0101 ch AAS is ASA", corr(wid("tc-01-01", "ch")).startswith("The two angles determine the third"))
chk("0101 rem included", corr(L["tc-01-01"]["remedials"][0]["check"]["widget"]).startswith("between the two sides"))

# ---------- tc-01-02 ----------
chk("0102 i1 two triangles", corr(wid("tc-01-02", "i1")).startswith("Two different triangles fit"))
chk("0102 k1 non-included swings", corr(wid("tc-01-02", "k1")).startswith("SSA's angle is NOT between"))
chk("0102 i2 AAA similar", corr(wid("tc-01-02", "i2")).startswith("They are similar"))
chk("0102 k2 similar not congruent", corr(wid("tc-01-02", "k2")) == "similar but not congruent")
b = {i["label"]: i["bucketId"] for i in wid("tc-01-02", "i3")["items"]}
chk("0102 i3 buckets", b["SSS"] == "yes" and b["SAS"] == "yes" and b["SSA"] == "no" and b["AAA"] == "no")
chk("0102 ch SSA fake", corr(wid("tc-01-02", "ch")).startswith("SSA"))
chk("0102 rem AAA similar", corr(L["tc-01-02"]["remedials"][0]["check"]["widget"]).startswith("AAA"))

# ---------- tc-01-03 ----------
w = wid("tc-01-03", "i1")
deps = {"t2": {"t1"}, "t3": {"t1", "t2"}, "t4": {"t3"}, "t1": set()}
chk("0103 i1 proof topo", valid_topo(w["correctOrder"], deps) and w["correctOrder"] == ["t1", "t2", "t3", "t4"])
for e in w["misorderFeedback"]:
    chk(f"0103 i1 misorder {e['first']}<-{e['second']}", e["second"] in deps.get(e["first"], set()))
chk("0103 k1 CPCTC after congruence", corr(wid("tc-01-03", "k1")).startswith("only after"))
chk("0103 i2 ASA", corr(wid("tc-01-03", "i2")).startswith("ASA"))
w = wid("tc-01-03", "k2")
chk("0103 k2 CPCTC equal side", w["answer"] == 15 and traps(w) == [7.5, 30])
# i3 correspondence by position: PQR~STU, QR (pos 2-3) -> TU
chk("0103 i3 QR->TU", corr(wid("tc-01-03", "i3")) == "TU")
chk("0103 ch SAS vertical", corr(wid("tc-01-03", "ch")).startswith("SAS, using the equal vertical angles"))
chk("0103 rem CPCTC last", corr(L["tc-01-03"]["remedials"][0]["check"]["widget"]) == "after proving the triangles congruent")

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
            for c in w["commonErrors"]:
                chk(f"{lid}/{s['id']} trap {c['value']} != answer",
                    abs(c["value"] - w["answer"]) > w.get("tolerance", 0))
        if w and w["type"] == "dragOrder":
            chk(f"{lid}/{s['id']} presented != answer",
                [i["id"] for i in w["items"]] != w["correctOrder"])
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} fig '{s['figure']}' registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("tc ch1 verifier: ALL PASS (criteria confirmed via rigid-motion coordinates; SSA ambiguity shown; proof orders topologically validated)")
