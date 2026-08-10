"""cp ch4 verifier. Route A: authored answers. Route B: independently recompute the angle
arithmetic (linear pairs, vertical-angle algebra) and validate every proof-ordering dragOrder
as a genuine topological order of its stated logical-dependency DAG, with each misorderFeedback
proven to name a real dependency edge. Traps re-derived from named error models."""
import json, glob

L = {}
for p in sorted(glob.glob("content/courses/constructions-and-proof/lessons/cp-04-*.json")):
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

# ---------- cp-04-01 conjecture vs proof ----------
b = {i["label"]: i["bucketId"] for i in wid("cp-04-01", "i1")["items"]}
want = {"\"I tried five triangles and the angles always summed to 180°\"": "conj",
        "\"Since a straight angle is 180° and the three angles rearrange onto it, they must sum to 180°\"": "proof",
        "\"Every prime I've checked so far is odd\"": "conj",
        "\"n² is even whenever n is even, because n = 2k makes n² = 4k²\"": "proof"}
for lbl, bkt in want.items():
    chk(f"0401 i1 '{lbl[:24]}'", b[lbl] == bkt)
w = wid("cp-04-01", "k1")
chk("0401 k1 one counterexample", w["answer"] == 1 and traps(w) == [0, 100])
chk("0401 i2 evidence-not-proof", corr(wid("cp-04-01", "i2")).startswith("Strong evidence"))
chk("0401 i3 evidence-not-proof", corr(wid("cp-04-01", "i3")).startswith("evidence for the claim"))
chk("0401 k2 drawing-is-one-example", corr(wid("cp-04-01", "k2")).startswith("A drawing is just one more example"))
# ch: the conjecture is TRUE (algebra (180-a)-(90-a)=90 for all a); no counterexample
for a in (10, 30, 45, 60, 89):
    chk(f"0401 ch model a={a}", (180 - a) - (90 - a) == 90)
chk("0401 ch verdict true", corr(wid("cp-04-01", "ch")).startswith("It's true"))
w = L["cp-04-01"]["remedials"][0]["check"]["widget"]
chk("0401 rem one counterexample", w["answer"] == 1 and traps(w) == [0, 1000])

# ---------- cp-04-02 two-column proof ----------
# i1 pairs
w = wid("cp-04-02", "i1")
lab = {i["id"]: i["label"] for i in w["left"]}
rlab = {i["id"]: i["label"] for i in w["right"]}
exp = {"g": "Given", "d": "Definition of midpoint", "a": "Segment Addition Postulate", "s": "Reflexive Property"}
for lid_, rid_ in w["pairs"].items():
    chk(f"0402 i1 {lab[lid_][:16]}", rlab[rid_] == exp[lid_])
chk("0402 k1 starts from given", corr(wid("cp-04-02", "k1")) == "the given information")
chk("0402 i2 transitive", corr(wid("cp-04-02", "i2")) == "Transitive Property")
chk("0402 k2 reflexive shared side", corr(wid("cp-04-02", "k2")) == "Reflexive Property")
# i3 ordering: given -> definition -> combine -> conclude
w = wid("cp-04-02", "i3")
deps = {"t2": {"t1"}, "t3": {"t2"}, "t4": {"t3"}, "t1": set()}
chk("0402 i3 topo order", valid_topo(w["correctOrder"], deps) and w["correctOrder"] == ["t1", "t2", "t3", "t4"])
for e in w["misorderFeedback"]:
    chk(f"0402 i3 misorder {e['first']}<-{e['second']} real edge",
        e["second"] in deps.get(e["first"], set()))
chk("0402 ch forward-reference illegal", corr(wid("cp-04-02", "ch")).startswith("Its reason cites a statement that appears later"))
chk("0402 rem reflexive", corr(L["cp-04-02"]["remedials"][0]["check"]["widget"]) == "Reflexive Property")

# ---------- cp-04-03 vertical angles ----------
w = wid("cp-04-03", "i1")
chk("0403 i1 linear pair", w["answer"] == 180 - 50 == 130 and traps(w) == [40, 50] and 90 - 50 == 40)
chk("0403 k1 straight angle", corr(wid("cp-04-03", "k1")).startswith("Together they form a straight angle"))
# i2 proof ordering: two linear pairs (t1,t2) -> equal sums (t3) -> subtract (t4)
w = wid("cp-04-03", "i2")
deps = {"t3": {"t1", "t2"}, "t4": {"t3"}, "t1": set(), "t2": set()}
chk("0403 i2 topo order", valid_topo(w["correctOrder"], deps) and w["correctOrder"] == ["t1", "t2", "t3", "t4"])
for e in w["misorderFeedback"]:
    chk(f"0403 i2 misorder {e['first']}<-{e['second']} real edge",
        e["second"] in deps.get(e["first"], set()))
chk("0403 k2 subtract shared angle", corr(wid("cp-04-03", "k2")).startswith("Subtracting the shared angle"))
w = wid("cp-04-03", "k3")
# Route B: solve vertical-angle equation independently by brute scan
sol = [x / 10 for x in range(-100, 400) if 3 * (x / 10) + 10 == 5 * (x / 10) - 30]
chk("0403 k3 vertical algebra", w["answer"] == 20 and sol == [20.0])
# traps: linear-pair model x=25; the "10" trap is a sign-slip check
lp = [x / 10 for x in range(-100, 400) if (3 * (x / 10) + 10) + (5 * (x / 10) - 30) == 180]
chk("0403 k3 traps", traps(w) == [10, 25] and lp == [25.0])
w = wid("cp-04-03", "ch")
# linear pair 4x + (2x+30) = 180 -> x=25 -> 4x=100 -> vertical = 100
xsol = [x / 10 for x in range(0, 500) if 4 * (x / 10) + (2 * (x / 10) + 30) == 180]
chk("0403 ch", w["answer"] == 100 and xsol == [25.0] and 4 * 25 == 100)
chk("0403 ch traps", traps(w) == [25, 80] and 2 * 25 + 30 == 80)
w = L["cp-04-03"]["remedials"][0]["check"]["widget"]
chk("0403 rem vertical equal", w["answer"] == 68 and traps(w) == [22, 112] and 180 - 68 == 112 and 90 - 68 == 22)

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
        if w and w["type"] == "matchPairs":
            rv = [r["label"] for r in w["right"]]
            chk(f"{lid}/{s['id']} right distinct", len(set(rv)) == len(rv))
            for e in w["pairErrors"]:
                chk(f"{lid}/{s['id']} pairError not correct", w["pairs"][e["left"]] != e["right"])
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} fig registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("cp ch4 verifier: ALL PASS (angle arithmetic recomputed; proof orders topologically validated; misorder edges real)")
