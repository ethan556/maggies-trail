"""sy ch5 verifier. Route A: authored answers. Route B: independently recompute indirect-measurement
proportions, scale conversions (multiply/divide), and the k vs k^2 area law; confirm each trap maps
to a named error. Standing note applied: verify the verifier's own arithmetic."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/similarity/lessons/sy-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

# ---------- sy-05-01 indirect measurement ----------
w = wid("sy-05-01", "i1")
chk("0501 i1 shadow 30", w["answer"] == 6 * 20 / 4 == 30 and traps(w) == [18, 120] and 6 * 20 == 120)
chk("0501 k1 AA right+sun", corr(wid("sy-05-01", "k1")).startswith("Both have a right angle"))
w = wid("sy-05-01", "i2")
chk("0501 i2 mirror 25", w["answer"] == 5 * 10 / 2 == 25 and traps(w) == [4, 17] and 5 + 10 + 2 == 17)
chk("0501 k2 reflection angles", corr(wid("sy-05-01", "k2")).startswith("Light reflects at equal angles"))
chk("0501 i3 shadow<->shadow", corr(wid("sy-05-01", "i3")).startswith("the tree's shadow"))
w = wid("sy-05-01", "ch")
chk("0501 ch building 20", w["answer"] == 5 * 32 / 8 == 20 and traps(w) == [29, 51.2] and 5 + 32 - 8 == 29)
chk("0501 ch trap 51.2", abs(8 * 32 / 5 - 51.2) < 0.01)
chk("0501 rem shadow<->shadow", corr(L["sy-05-01"]["remedials"][0]["check"]["widget"]) == "the object's shadow")

# ---------- sy-05-02 scale drawings ----------
w = wid("sy-05-02", "i1")
chk("0502 i1 model 400", w["answer"] == 8 * 50 == 400 and traps(w) == [0.16, 58] and 8 + 50 == 58 and 8 / 50 == 0.16)
chk("0502 k1 multiply", corr(wid("sy-05-02", "k1")).startswith("multiply the model length by 50"))
w = wid("sy-05-02", "i2")
chk("0502 i2 map 14", w["answer"] == 7 * 2 == 14 and traps(w) == [3.5, 9] and 7 + 2 == 9 and 7 / 2 == 3.5)
w = wid("sy-05-02", "k2")
chk("0502 k2 real->drawing 8", w["answer"] == 400 / 50 == 8 and traps(w) == [350, 20000] and 400 * 50 == 20000 and 400 - 50 == 350)
w = wid("sy-05-02", "i3")
chk("0502 i3 area k^2 400", w["answer"] == 25 * 4**2 == 400 and traps(w) == [29, 100] and 25 * 4 == 100 and 25 + 4 == 29)
w = wid("sy-05-02", "ch")
chk("0502 ch blueprint 360", w["answer"] == 15 * 24 == 360 and traps(w) == [0.625, 39] and 15 + 24 == 39 and 15 / 24 == 0.625)
w = L["sy-05-02"]["remedials"][0]["check"]["widget"]
chk("0502 rem model 300", w["answer"] == 6 * 50 == 300 and traps(w) == [0.12, 56] and 6 + 50 == 56 and 6 / 50 == 0.12)

# ---------- sy-05-03 area & perimeter ratios ----------
w = wid("sy-05-03", "i1")
chk("0503 i1 perimeter k 36", w["answer"] == 12 * 3 == 36 and traps(w) == [15, 108] and 12 + 3 == 15 and 12 * 9 == 108)
chk("0503 k1 P by k A by k^2", corr(wid("sy-05-03", "k1")).startswith("Perimeter by k, area by k²"))
w = wid("sy-05-03", "i2")
chk("0503 i2 area k^2 45", w["answer"] == 5 * 3**2 == 45 and traps(w) == [8, 15] and 5 * 3 == 15 and 5 + 3 == 8)
w = wid("sy-05-03", "k2")
chk("0503 k2 side from area 5", w["answer"] == math.isqrt(25) == 5 and traps(w) == [12.5, 25])
w = wid("sy-05-03", "i3")
chk("0503 i3 pizza 4x", w["answer"] == 2**2 == 4 and traps(w) == [2, 8] and 2**3 == 8)
w = wid("sy-05-03", "ch")
# sides 2:5 -> area 8 * (5/2)^2 = 8 * 25/4 = 50
chk("0503 ch total area 50", w["answer"] == 8 * (5 / 2)**2 == 50 and traps(w) == [11, 20] and 8 * 5 / 2 == 20)
w = L["sy-05-03"]["remedials"][0]["check"]["widget"]
chk("0503 rem area k^2 9", w["answer"] == 3**2 == 9 and traps(w) == [3, 27] and 3**3 == 27)

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
print("sy ch5 verifier: ALL PASS (indirect-measurement proportions, scale conversions, k vs k^2 area law recomputed; traps named)")
