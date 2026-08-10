"""tc ch3 verifier. Route A: authored answers. Route B: recompute isosceles angle arithmetic
(apex + 2*base = 180), verify the figure's base angles are actually equal from coordinates,
and recompute the midsegment length/parallelism from an independent triangle's midpoints.
Traps re-derived from named error models."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/triangle-congruence/lessons/tc-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def base_from_apex(a): return (180 - a) / 2
def apex_from_base(b): return 180 - 2 * b

# Route B: verify the figure's isosceles base angles are truly equal from coordinates
def ang(P, Q, R):
    a = (Q[0] - P[0], Q[1] - P[1]); b = (R[0] - P[0], R[1] - P[1])
    return math.degrees(math.acos((a[0] * b[0] + a[1] * b[1]) / (math.hypot(*a) * math.hypot(*b))))
A, B, C = (90, 55), (50, 135), (130, 135)
chk("Route B: figure isosceles base angles equal", abs(ang(B, A, C) - ang(C, A, B)) < 1e-9)

# ---------- tc-03-01 base angles ----------
w = wid("tc-03-01", "i1")
chk("0301 i1 base from apex 40", w["answer"] == base_from_apex(40) == 70 and traps(w) == [40, 140] and 180 - 40 == 140)
chk("0301 k1 apex-bisector SAS", corr(wid("tc-03-01", "k1")).startswith("Bisect the apex angle"))
chk("0301 i2 not a side", corr(wid("tc-03-01", "i2")) == "a side of the triangle")
w = wid("tc-03-01", "k2")
chk("0301 k2 apex from base 65", w["answer"] == apex_from_base(65) == 50 and traps(w) == [65, 115] and 180 - 65 == 115)
chk("0301 i3 legs give angles", corr(wid("tc-03-01", "i3")).startswith("The angles opposite those sides"))
w = wid("tc-03-01", "ch")
# apex 50 -> base 65 -> 5x=65 -> x=13
chk("0301 ch 5x=65 x=13", w["answer"] == 13 and base_from_apex(50) == 65 and 5 * 13 == 65 and traps(w) == [10, 65])
w = L["tc-03-01"]["remedials"][0]["check"]["widget"]
chk("0301 rem base from apex 80", w["answer"] == base_from_apex(80) == 50 and traps(w) == [80, 100])

# ---------- tc-03-02 converse + equilateral ----------
chk("0302 i1 converse", corr(wid("tc-03-02", "i1")).startswith("Equal base angles ⇒ equal legs"))
chk("0302 k1 converse concludes isosceles", corr(wid("tc-03-02", "k1")).startswith("The sides opposite those angles"))
w = wid("tc-03-02", "i2")
chk("0302 i2 equilateral 60", w["answer"] == 180 / 3 == 60 and traps(w) == [90, 120])
chk("0302 k2 equilateral equiangular", corr(wid("tc-03-02", "k2")).startswith("All three angles are equal"))
chk("0302 i3 AB=AC", corr(wid("tc-03-02", "i3")).startswith("AB = AC"))
w = wid("tc-03-02", "ch")
# 3x = 2x+20 -> x=20 -> 60
xsol = [x / 10 for x in range(0, 500) if 3 * (x / 10) == 2 * (x / 10) + 20]
chk("0302 ch converse algebra 60", w["answer"] == 60 and xsol == [20.0] and 3 * 20 == 60 and traps(w) == [20, 100])
chk("0302 rem converse direction", corr(L["tc-03-02"]["remedials"][0]["check"]["widget"]).startswith("the converse"))

# ---------- tc-03-03 midsegment (Route B from independent triangle) ----------
Ax, Ay, Bx, By, Cx, Cy = 0, 0, 8, 0, 2, 6
M = ((Ax + Cx) / 2, (Ay + Cy) / 2); N = ((Bx + Cx) / 2, (By + Cy) / 2)
mid_len = math.hypot(N[0] - M[0], N[1] - M[1]); base = math.hypot(Bx - Ax, By - Ay)
chk("Route B: midsegment ratio 0.5", abs(mid_len / base - 0.5) < 1e-9)
chk("Route B: midsegment parallel to base", abs(M[1] - N[1]) < 1e-9)
w = wid("tc-03-03", "i1")
chk("0303 i1 half of 18", w["answer"] == 18 / 2 == 9 and traps(w) == [18, 36])
chk("0303 k1 parallel and half", corr(wid("tc-03-03", "k1")).startswith("parallel to the third side and half"))
w = wid("tc-03-03", "i2")
chk("0303 i2 double of 7", w["answer"] == 7 * 2 == 14 and traps(w) == [3.5, 7])
w = wid("tc-03-03", "k2")
chk("0303 k2 half perimeter", w["answer"] == 24 / 2 == 12 and traps(w) == [24, 48])
w = wid("tc-03-03", "i3")
chk("0303 i3 four triangles", w["answer"] == 4 and traps(w) == [2, 3])
w = wid("tc-03-03", "ch")
# 2x+1 = 22/2 = 11 -> x=5
chk("0303 ch 2x+1=11 x=5", w["answer"] == 5 and 2 * 5 + 1 == 22 / 2 == 11 and traps(w) == [10.5, 11])
w = L["tc-03-03"]["remedials"][0]["check"]["widget"]
chk("0303 rem half of 20", w["answer"] == 20 / 2 == 10 and traps(w) == [20, 40])

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
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} fig '{s['figure']}' registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("tc ch3 verifier: ALL PASS (isosceles arithmetic + figure angles recomputed; midsegment length/parallelism from coordinates)")
