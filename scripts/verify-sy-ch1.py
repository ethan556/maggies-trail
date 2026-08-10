"""sy ch1 verifier. Route A: authored answers. Route B: independently recompute dilation
distances/coordinates (OP'=k*OP), scale factors (image/original), proportional sides, and the
k vs k^2 area law; confirm AA via the 180-degree angle sum. Traps re-derived from error models."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/similarity/lessons/sy-01-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

# ---------- sy-01-01 dilation ----------
w = wid("sy-01-01", "i1")
chk("0101 i1 OP'=k*OP", w["answer"] == 3 * 5 == 15 and traps(w) == [5, 8] and 5 + 3 == 8)
chk("0101 k1 preserves angles", corr(wid("sy-01-01", "k1")).startswith("angle measures"))
chk("0101 i2 reduction", corr(wid("sy-01-01", "i2")).startswith("smaller than the original"))
w = wid("sy-01-01", "k2")
chk("0101 k2 scale factor", w["answer"] == 12 / 8 == 1.5 and traps(w) == [0.667, 4] and 12 - 8 == 4)
w = wid("sy-01-01", "i3")
chk("0101 i3 dilate coord", w["answer"] == 2 * 6 == 12 and traps(w) == [6, 8] and 2 * 4 == 8)
w = wid("sy-01-01", "ch")
chk("0101 ch reverse dilation", w["answer"] == 18 / 3 == 6 and traps(w) == [15, 54] and 18 * 3 == 54 and 18 - 3 == 15)
w = L["sy-01-01"]["remedials"][0]["check"]["widget"]
chk("0101 rem factor", w["answer"] == 20 / 10 == 2 and traps(w) == [0.5, 10])

# ---------- sy-01-02 similarity ----------
chk("0102 i1 angles+proportional", corr(wid("sy-01-02", "i1")).startswith("Corresponding angles are equal AND"))
chk("0102 k1 congruence is k=1", corr(wid("sy-01-02", "k1")).startswith("Congruence is similarity with scale factor 1"))
w = wid("sy-01-02", "i2")
# ratio 9/6=1.5, EF=8*1.5=12; trap 11 = 8 + (9-6); trap 5.33 = 8*6/9
chk("0102 i2 proportional side", w["answer"] == 8 * (9 / 6) == 12 and traps(w) == [5.33, 11] and 8 + 3 == 11)
chk("0102 i2 trap 5.33 model", abs(8 * 6 / 9 - 5.33) < 0.01)
chk("0102 k2 correspondence BC->EF", corr(wid("sy-01-02", "k2")) == "EF")
w = wid("sy-01-02", "i3")
chk("0102 i3 area k^2", w["answer"] == 5 * 3**2 == 45 and traps(w) == [8, 15] and 5 * 3 == 15)
w = wid("sy-01-02", "ch")
chk("0102 ch side ratio from area", w["answer"] == math.isqrt(16) == 4 and traps(w) == [8, 16])
w = L["sy-01-02"]["remedials"][0]["check"]["widget"]
chk("0102 rem area x4", w["answer"] == 2**2 == 4 and traps(w) == [2, 8] and 2**3 == 8)

# ---------- sy-01-03 AA ----------
w = wid("sy-01-03", "i1")
chk("0103 i1 third angle", w["answer"] == 180 - 40 - 75 == 65 and traps(w) == [75, 115] and 40 + 75 == 115)
chk("0103 k1 angle sum forces third", corr(wid("sy-01-03", "k1")).startswith("The angle sum forces the third"))
chk("0103 i2 AAA similar", corr(wid("sy-01-03", "i2")) == "They are similar")
chk("0103 k2 similar pair", corr(wid("sy-01-03", "k2")).startswith("One with angles 90°, 30° and another with 90°, 30°"))
w = wid("sy-01-03", "i3")
# shadow: 6/4 = h/20 -> h = 30; trap 120 = 6*20; trap 18
chk("0103 i3 shadow", w["answer"] == 6 * 20 / 4 == 30 and traps(w) == [18, 120] and 6 * 20 == 120)
chk("0103 ch AA justification", corr(wid("sy-01-03", "ch")).startswith("AA: both have a right angle"))
w = L["sy-01-03"]["remedials"][0]["check"]["widget"]
chk("0103 rem two angles", w["answer"] == 2 and traps(w) == [1, 3])

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
print("sy ch1 verifier: ALL PASS (dilation distances/coords, scale factors, proportional sides, k^2 area law recomputed; AA via angle sum)")
