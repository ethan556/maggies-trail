"""sy ch2 verifier. Route A: authored answers. Route B: independently recompute similarity ratios
(SAS~/SSS~), solve the proportions, test the all-three-ratios-equal condition for SSS~, and
validate the similarity-proof dragOrder as a topological order of its dependency DAG (with
multi-predecessor edges encoded per standing note). Traps re-derived from error models."""
import json, glob
from fractions import Fraction as Fr

L = {}
for p in sorted(glob.glob("content/courses/similarity/lessons/sy-02-*.json")):
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

# ---------- sy-02-01 SAS~ ----------
w = wid("sy-02-01", "i1")
chk("0201 i1 ratio 1.5", w["answer"] == 6 / 4 == 9 / 6 == 1.5 and traps(w) == [2, 10] and 4 + 6 == 10)
chk("0201 k1 included angle", corr(wid("sy-02-01", "k1")).startswith("between the two proportional"))
w = wid("sy-02-01", "i2")
chk("0201 i2 solve side", w["answer"] == 9 * (12 / 8) == 13.5 and traps(w) == [6, 13] and 9 + 4 == 13)
chk("0201 i2 trap6 model", 9 * 8 / 12 == 6)
chk("0201 k2 SAS~", corr(wid("sy-02-01", "k2")).startswith("SAS~"))
chk("0201 i3 nested SAS~", corr(wid("sy-02-01", "i3")).startswith("SAS~"))
w = wid("sy-02-01", "ch")
chk("0201 ch AC=15", w["answer"] == 6 * 10 / 4 == 15 and traps(w) == [2.4, 12] and 4 * 6 / 10 == 2.4)
w = L["sy-02-01"]["remedials"][0]["check"]["widget"]
chk("0201 rem SAS~ req", corr(w).startswith("two proportional sides and the included"))

# ---------- sy-02-02 SSS~ ----------
chk("0202 i1 similar 3", corr(wid("sy-02-02", "i1")).startswith("Yes"))
# Route B: 9/3=12/4=15/5=3 all equal
chk("0202 i1 Route B ratios", 9 / 3 == 12 / 4 == 15 / 5 == 3)
chk("0202 k1 mismatch fails", corr(wid("sy-02-02", "k1")).startswith("No"))
# Route B: 6/3=2, 8/4=2, 9/5=1.8 -> not all equal
chk("0202 k1 Route B not similar", 6 / 3 == 8 / 4 == 2 and 9 / 5 == 1.8 and not (6 / 3 == 8 / 4 == 9 / 5))
w = wid("sy-02-02", "i2")
chk("0202 i2 scale 3", w["answer"] == 15 / 5 == 3 and traps(w) == [0.333, 10] and 15 - 5 == 10)
w = wid("sy-02-02", "k2")
chk("0202 k2 side 21", w["answer"] == 7 * 3 == 21 and traps(w) == [2.33, 10] and 7 + 3 == 10)
chk("0202 i3 congruent k=1", corr(wid("sy-02-02", "i3")).startswith("congruent"))
w = wid("sy-02-02", "ch")
# 8/6=12/9=16/12=4/3 all equal
chk("0202 ch 4/3", corr(w).startswith("Yes, similar with scale factor 4/3") and Fr(8, 6) == Fr(12, 9) == Fr(16, 12) == Fr(4, 3))
w = L["sy-02-02"]["remedials"][0]["check"]["widget"]
chk("0202 rem three ratios", w["answer"] == 3 and traps(w) == [1, 2])

# ---------- sy-02-03 choosing ----------
b = {i["label"]: i["bucketId"] for i in wid("sy-02-03", "i1")["items"]}
chk("0203 i1 buckets", b["Two pairs of equal angles"] == "aa" and
    b["Two proportional sides and the included angle equal"] == "sas" and
    b["Three pairs of proportional sides"] == "sss" and
    b["A shared angle and the two sides around it proportional"] == "sas")
chk("0203 k1 parallel->AA", corr(wid("sy-02-03", "k1")).startswith("AA"))
w = wid("sy-02-03", "i2")
chk("0203 i2 proportion EF", w["answer"] == 10 * (12 / 8) == 15 and traps(w) == [6.67, 14] and 10 + 4 == 14)
chk("0203 i2 trap 6.67", abs(10 * 8 / 12 - 6.67) < 0.01)
chk("0203 k2 AA easiest", corr(wid("sy-02-03", "k2")) == "AA")
# i3 proof ordering: two angle facts (t1,t2) -> AA (t3) -> proportion (t4)
w = wid("sy-02-03", "i3")
deps = {"t3": {"t1", "t2"}, "t4": {"t3"}, "t1": set(), "t2": set()}
chk("0203 i3 topo", valid_topo(w["correctOrder"], deps) and w["correctOrder"] == ["t1", "t2", "t3", "t4"])
for e in w["misorderFeedback"]:
    chk(f"0203 i3 misorder {e['first']}<-{e['second']}", e["second"] in deps.get(e["first"], set()))
w = wid("sy-02-03", "ch")
chk("0203 ch AC=15", w["answer"] == 9 * 10 / 6 == 15 and traps(w) == [5.4, 13] and 9 + 4 == 13)
chk("0203 ch trap 5.4", abs(9 * 6 / 10 - 5.4) < 0.01)
w = L["sy-02-03"]["remedials"][0]["check"]["widget"]
chk("0203 rem AA", corr(w) == "AA")

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
print("sy ch2 verifier: ALL PASS (SAS~/SSS~ ratios + proportions recomputed; all-ratios-equal tested; proof order topologically validated)")
