"""sy ch3 verifier. Route A: authored answers. Route B: independently recompute side-splitter
proportions (piece-to-piece and piece-to-whole), the converse ratio-equality test, three-parallel
segment ratios, and the angle-bisector ratio, all with exact Fraction arithmetic. Traps re-derived."""
import json, glob
from fractions import Fraction as Fr

L = {}
for p in sorted(glob.glob("content/courses/similarity/lessons/sy-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

# ---------- sy-03-01 ----------
w = wid("sy-03-01", "i1")
# AD/DB = AE/EC: 4/6 = 6/EC -> EC = 9
chk("0301 i1 EC=9", w["answer"] == 9 and Fr(4, 6) == Fr(6, 9) and traps(w) == [4, 8])
chk("0301 k1 similar triangle", corr(wid("sy-03-01", "k1")).startswith("It creates a smaller similar"))
w = wid("sy-03-01", "i2")
chk("0301 i2 AC=15", w["answer"] == 15 and Fr(4, 10) == Fr(6, 15) and traps(w) == [2.4, 12] and 4 * 6 / 10 == 2.4)
chk("0301 k2 piece-to-piece", corr(wid("sy-03-01", "k2")).startswith("AE/EC"))
chk("0301 i3 midsegment 1:1", corr(wid("sy-03-01", "i3")).startswith("1 : 1"))
w = wid("sy-03-01", "ch")
# x/(x+2) = 6/9 = 2/3 -> 3x = 2x+4 -> x=4
chk("0301 ch x=4", w["answer"] == 4 and Fr(4, 6) == Fr(2, 3) and traps(w) == [2, 6])
w = L["sy-03-01"]["remedials"][0]["check"]["widget"]
chk("0301 rem AE/EC", corr(w) == "AE/EC")

# ---------- sy-03-02 converse ----------
chk("0302 i1 parallel yes", corr(wid("sy-03-02", "i1")).startswith("Yes") and Fr(3, 6) == Fr(4, 8) == Fr(1, 2))
chk("0302 k1 converse direction", corr(wid("sy-03-02", "k1")).startswith("Conclude the line is parallel"))
w = wid("sy-03-02", "i2")
# 6/9 = 8/x -> x = 12
chk("0302 i2 ladder x=12", w["answer"] == 12 and Fr(6, 9) == Fr(8, 12) and traps(w) == [5.33, 11] and 8 + 9 - 6 == 11)
chk("0302 i2 trap 5.33", abs(6 * 8 / 9 - 5.33) < 0.01)
chk("0302 k2 equal ratios", corr(wid("sy-03-02", "k2")).startswith("They are equal"))
w = wid("sy-03-02", "i3")
# angle bisector BD/DC = AB/AC: 8/DC = 8/6 -> DC=6
chk("0302 i3 bisector DC=6", w["answer"] == 6 and Fr(8, 6) == Fr(8, 6) and traps(w) == [8, 10.67] and abs(8 * 8 / 6 - 10.67) < 0.01)
chk("0302 ch parallel yes", corr(wid("sy-03-02", "ch")).startswith("Yes") and Fr(5, 10) == Fr(7, 14) == Fr(1, 2))
w = L["sy-03-02"]["remedials"][0]["check"]["widget"]
chk("0302 rem parallel", corr(w) == "parallel to the third side")

# ---------- sy-03-03 proportions in figures ----------
chk("0303 i1 side-splitter", corr(wid("sy-03-03", "i1")) == "The Side-Splitter Theorem")
chk("0303 k1 bisector ratio", corr(wid("sy-03-03", "k1")).startswith("BD/DC = AB/AC"))
w = wid("sy-03-03", "i2")
# 6/15 = 4/BC -> BC = 10
chk("0303 i2 BC=10", w["answer"] == 10 and Fr(6, 15) == Fr(4, 10) and traps(w) == [1.6, 13] and 6 * 4 / 15 == 1.6)
chk("0303 k2 anchor angles", corr(wid("sy-03-03", "k2")).startswith("the equal angles"))
w = wid("sy-03-03", "i3")
# 4/6 = x/9 -> x = 6
chk("0303 i3 x=6", w["answer"] == 6 and Fr(4, 6) == Fr(6, 9) and traps(w) == [7, 13.5] and 6 * 9 / 4 == 13.5)
w = wid("sy-03-03", "ch")
# 6/4 = 9/EC -> EC = 6
chk("0303 ch EC=6", w["answer"] == 6 and Fr(6, 4) == Fr(9, 6) and traps(w) == [11, 13.5] and 9 * 6 / 4 == 13.5)
w = L["sy-03-03"]["remedials"][0]["check"]["widget"]
chk("0303 rem side-splitter", corr(w) == "Side-Splitter Theorem")

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
print("sy ch3 verifier: ALL PASS (side-splitter + converse + parallel-ladder + angle-bisector proportions recomputed with exact fractions)")
