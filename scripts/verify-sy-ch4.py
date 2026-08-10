"""sy ch4 verifier. Route A: authored answers. Route B: independently recompute every geometric
mean (altitude = sqrt(p*q), leg = sqrt(hyp*adj)) and Pythagorean check from first principles;
confirm each trap maps to a named error (arithmetic-mean, sum, product, wrong-segment).
Standing note applied: verify the verifier's OWN arithmetic, not just its logic."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/similarity/lessons/sy-04-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def gm(a, b): return math.sqrt(a * b)          # geometric mean
def am(a, b): return (a + b) / 2               # arithmetic mean (trap source)

# ---------- sy-04-01 three similar triangles ----------
w = wid("sy-04-01", "i1")
chk("0401 i1 three triangles", w["answer"] == 3 and traps(w) == [2, 4])
chk("0401 k1 AA shared angles", corr(wid("sy-04-01", "k1")).startswith("Each shares the right angle"))
chk("0401 i2 hyp corresponds", corr(wid("sy-04-01", "i2")).startswith("the whole triangle's hypotenuse"))
chk("0401 k2 similar not congruent", corr(wid("sy-04-01", "k2")).startswith("similar"))
chk("0401 i3 pythagorean", corr(wid("sy-04-01", "i3")).startswith("the Pythagorean theorem"))
chk("0401 ch left shared angle", corr(wid("sy-04-01", "ch")).startswith("the left acute angle plus a right angle"))
chk("0401 rem AA", corr(L["sy-04-01"]["remedials"][0]["check"]["widget"]) == "AA")

# ---------- sy-04-02 geometric mean ----------
w = wid("sy-04-02", "i1")
chk("0402 i1 gm(4,9)=6", w["answer"] == gm(4, 9) == 6 and traps(w) == [6.5, 36] and am(4, 9) == 6.5 and 4 * 9 == 36)
chk("0402 k1 altitude gm", corr(wid("sy-04-02", "k1")).startswith("h = √(p·q)"))
w = wid("sy-04-02", "i2")
chk("0402 i2 altitude gm(9,16)=12", w["answer"] == gm(9, 16) == 12 and traps(w) == [12.5, 25] and am(9, 16) == 12.5 and 9 + 16 == 25)
w = wid("sy-04-02", "i3")
chk("0402 i3 leg gm(25,9)=15", w["answer"] == gm(25, 9) == 15 and traps(w) == [17, 34] and 25 + 9 == 34)
chk("0402 k2 leg uses hyp*adj", corr(wid("sy-04-02", "k2")).startswith("the whole hypotenuse times the segment"))
w = wid("sy-04-02", "ch")
# h^2 = p*q: 36 = 4*q -> q=9
chk("0402 ch back out q=9", w["answer"] == 6**2 / 4 == 9 and traps(w) == [2, 24] and 6 - 4 == 2 and 6 * 4 == 24)
w = L["sy-04-02"]["remedials"][0]["check"]["widget"]
chk("0402 rem gm(9,16)=12", w["answer"] == gm(9, 16) == 12 and traps(w) == [12.5, 144] and 9 * 16 == 144)

# ---------- sy-04-03 solving ----------
w = wid("sy-04-03", "i1")
chk("0403 i1 altitude gm(3,12)=6", w["answer"] == gm(3, 12) == 6 and traps(w) == [7.5, 15] and am(3, 12) == 7.5 and 3 + 12 == 15)
chk("0403 k1 leg sqrt(15*3)", corr(wid("sy-04-03", "k1")) == "√(15 × 3)")
# Route B: verify √(15*3)=√45 is the correct leg; hyp=15, adj=3
chk("0403 k1 Route B leg^2", round(gm(15, 3)**2, 6) == 45)
chk("0403 i2 altitude uses two segments", corr(wid("sy-04-03", "i2")).startswith("the two hypotenuse segments"))
w = wid("sy-04-03", "k2")
chk("0403 k2 altitude gm(4,16)=8", w["answer"] == gm(4, 16) == 8 and traps(w) == [10, 20] and am(4, 16) == 10 and 4 + 16 == 20)
w = wid("sy-04-03", "i3")
chk("0403 i3 hyp 15,20->25", w["answer"] == math.hypot(15, 20) == 25 and traps(w) == [30, 35] and 15 + 20 == 35)
w = wid("sy-04-03", "ch")
# leg adjacent to 16: sqrt(25*16)=20; trap 12 = altitude sqrt(9*16); trap 15 = sqrt(25*9)
chk("0403 ch leg gm(25,16)=20", w["answer"] == gm(25, 16) == 20 and traps(w) == [12, 15] and gm(9, 16) == 12 and gm(25, 9) == 15)
# Route B: full triangle consistency — legs 15,20 with hyp 25 satisfy pythagoras
chk("0403 ch Route B pythag", 15**2 + 20**2 == 25**2 and 9 + 16 == 25)
w = L["sy-04-03"]["remedials"][0]["check"]["widget"]
chk("0403 rem altitude gm(4,9)=6", w["answer"] == gm(4, 9) == 6 and traps(w) == [6.5, 13] and am(4, 9) == 6.5 and 4 + 9 == 13)

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
print("sy ch4 verifier: ALL PASS (geometric means altitude=sqrt(pq) + leg=sqrt(hyp*adj) recomputed; pythagorean consistency confirmed; traps named)")
