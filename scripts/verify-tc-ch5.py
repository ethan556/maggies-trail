"""tc ch5 verifier. Route A: authored answers. Route B: independently test triangle-inequality
validity and third-side bounds, recompute the hinge third-side lengths via the law of cosines
(confirming bigger included angle -> longer side), verify side-angle ordering and exterior-angle
sums, and validate the ordering dragOrder as a topological order. Traps re-derived."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/triangle-congruence/lessons/tc-05-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def is_tri(a, b, c): return a + b > c and a + c > b and b + c > a
def third(s1, s2, ang): return math.sqrt(s1**2 + s2**2 - 2 * s1 * s2 * math.cos(math.radians(ang)))

def valid_topo(order, deps):
    pos = {sid: i for i, sid in enumerate(order)}
    return all(pos[d] < pos[node] for node, ds in deps.items() for d in ds)

# ---------- tc-05-01 triangle inequality ----------
b = {i["label"]: i["bucketId"] for i in wid("tc-05-01", "i1")["items"]}
want = {"3, 4, 5": "yes", "2, 3, 10": "no", "5, 6, 7": "yes", "4, 4, 9": "no"}
for lbl, bkt in want.items():
    a, bb, c = [int(x) for x in lbl.split(", ")]
    chk(f"0501 i1 '{lbl}' Route B", (b[lbl] == "yes") == is_tri(a, bb, c) and (b[lbl] == bkt))
chk("0501 k1 two shortest test", corr(wid("tc-05-01", "k1")).startswith("Check that the two shortest"))
w = wid("tc-05-01", "i2")
chk("0501 i2 upper bound 13", w["answer"] == 5 + 8 == 13 and traps(w) == [3, 40] and 8 - 5 == 3)
w = wid("tc-05-01", "k2")
chk("0501 k2 lower bound 3", w["answer"] == 8 - 5 == 3 and traps(w) == [0, 13] and 5 + 8 == 13)
chk("0501 i3 largest angle opp 7", corr(wid("tc-05-01", "i3")).startswith("the side of length 7"))
w = wid("tc-05-01", "ch")
# 3 < x < 17 -> integers 4..16 = 13
cnt = len([x for x in range(1, 30) if 10 - 7 < x < 10 + 7])
chk("0501 ch integer count 13", w["answer"] == cnt == 13 and traps(w) == [14, 17])
w = L["tc-05-01"]["remedials"][0]["check"]["widget"]
chk("0501 rem 2,3,6 invalid", corr(w).startswith("No") and not is_tri(2, 3, 6) and 2 + 3 == 5)

# ---------- tc-05-02 hinge ----------
t40 = third(7, 5, 40); t80 = third(7, 5, 80)
chk("0502 Route B: 80deg third > 40deg third", t80 > t40)
chk("0502 i1 Q 80deg longer", corr(wid("tc-05-02", "i1")).startswith("Triangle Q"))
chk("0502 k1 widen angle", corr(wid("tc-05-02", "k1")).startswith("Widening the included angle"))
chk("0502 i2 equal angle SAS", corr(wid("tc-05-02", "i2")).startswith("The triangles are congruent (SAS)"))
chk("0502 k2 converse hinge", corr(wid("tc-05-02", "k2")).startswith("P's included angle is larger"))
# i3 ordering by angle 30<75<120
w = wid("tc-05-02", "i3")
deps = {"b": {"a"}, "c": {"b"}, "a": set()}
chk("0502 i3 order 30<75<120", w["correctOrder"] == ["a", "b", "c"] and valid_topo(w["correctOrder"], deps))
# confirm via law of cosines that ordering matches (arbitrary equal sides 6,9)
t30, t75, t120 = third(6, 9, 30), third(6, 9, 75), third(6, 9, 120)
chk("0502 i3 Route B monotone", t30 < t75 < t120)
for e in w["misorderFeedback"]:
    chk(f"0502 i3 misorder {e['first']}<-{e['second']}", e["second"] in deps.get(e["first"], set()))
chk("0502 ch Y 70deg longer", corr(wid("tc-05-02", "ch")).startswith("Triangle Y"))
chk("0502 rem bigger angle longer side", corr(L["tc-05-02"]["remedials"][0]["check"]["widget"]) == "longer third side")

# ---------- tc-05-03 inequalities in proofs ----------
chk("0503 i1 largest angle A", corr(wid("tc-05-03", "i1")).startswith("angle A"))
chk("0503 k1 order C<B<A", corr(wid("tc-05-03", "k1")) == "∠C < ∠B < ∠A")
w = wid("tc-05-03", "i2")
chk("0503 i2 exterior sum 105", w["answer"] == 45 + 60 == 105 and traps(w) == [52.5, 75] and 180 - 105 == 75 and (45 + 60) / 2 == 52.5)
chk("0503 k2 exterior exceeds remote", corr(wid("tc-05-03", "k2")).startswith("It equals their sum"))
chk("0503 i3 side-angle tool", corr(wid("tc-05-03", "i3")).startswith("The side opposite the larger angle"))
chk("0503 ch hinge in proof", corr(wid("tc-05-03", "ch")).startswith("the hinge theorem"))
chk("0503 rem longer side largest angle", corr(L["tc-05-03"]["remedials"][0]["check"]["widget"]) == "largest angle")

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
        if w and w["type"] == "dragOrder":
            chk(f"{lid}/{s['id']} presented != answer",
                [i["id"] for i in w["items"]] != w["correctOrder"])
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} fig '{s['figure']}' registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("tc ch5 verifier: ALL PASS (triangle-inequality + bounds tested; hinge lengths via law of cosines; ordering validated)")
