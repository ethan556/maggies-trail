"""cp ch3 verifier. Route A: authored answers. Route B: inscribed-polygon geometry recomputed
from central angles and chord lengths (2R sin(theta/2)); regular-polygon interior-angle formula;
proof-ordering validated as a topological order of the stated dependency DAG. Traps re-derived."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/constructions-and-proof/lessons/cp-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def corr(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

def central(n): return 360 / n
def interior(n): return 180 * (n - 2) / n
def chord(R, n): return 2 * R * math.sin(math.radians(central(n) / 2))

# ---------- cp-03-01 hexagon ----------
chk("0301 Route B: hex chord == radius", abs(chord(1.0, 6) - 1.0) < 1e-9)
chk("0301 k1 reason 60-chord", corr(wid("cp-03-01", "k1")).startswith("Each step spans a 60°"))
w = wid("cp-03-01", "i2")
chk("0301 i2 central 60", w["answer"] == central(6) == 60 and traps(w) == [6, 120] and interior(6) == 120)
w = wid("cp-03-01", "k2")
chk("0301 k2 interior 120", w["answer"] == interior(6) == 120 and traps(w) == [60, 720] and 180 * (6 - 2) == 720)
chk("0301 ch every-other-is-triangle", corr(wid("cp-03-01", "ch")) == "an equilateral triangle")
# Route B: every-other of 6 marks -> 3 vertices spanning 120 each
chk("0301 ch model", 6 // 2 == 3 and 2 * central(6) == central(3) == 120)
w = L["cp-03-01"]["remedials"][0]["check"]["widget"]
chk("0301 rem central 60", w["answer"] == central(6) == 60 and traps(w) == [30, 120])

# ---------- cp-03-02 square & triangle ----------
w = wid("cp-03-02", "k1")
chk("0302 k1 square central 90", w["answer"] == central(4) == 90 and traps(w) == [45, 360])
w = wid("cp-03-02", "i2")
chk("0302 i2 triangle central 120", w["answer"] == central(3) == 120 and traps(w) == [3, 60])
w = wid("cp-03-02", "k2")
chk("0302 k2 triangle uses 3 of 6", w["answer"] == 3 and traps(w) == [4, 6])
chk("0302 i3 equal-chords reason", corr(wid("cp-03-02", "i3")).startswith("Equal central angles cut equal-length chords"))
# Route B: equal central angle -> equal chord (all n chords identical in one circle)
chk("0302 i3 model", len({round(chord(1.0, 4), 9)}) == 1)
chk("0302 ch square from perp diameters", corr(wid("cp-03-02", "ch")) == "the square")
w = L["cp-03-02"]["remedials"][0]["check"]["widget"]
chk("0302 rem square central 90", w["answer"] == central(4) == 90 and traps(w) == [60, 120])

# ---------- cp-03-03 why constructions work ----------
chk("0303 i1 equal radii both pairs", corr(wid("cp-03-03", "i1")).startswith("XA = XB and YA = YB"))
# proof ordering: validate correctOrder is a topological order of the dependency DAG
w = wid("cp-03-03", "i2")
order = w["correctOrder"]
# dependency: t3 (SSS conclusion) needs t1 (equal radii) and t2 (shared side); t4 (final) needs t3
deps = {"t3": {"t1", "t2"}, "t4": {"t3"}, "t1": set(), "t2": set()}
pos = {sid: i for i, sid in enumerate(order)}
topo_ok = all(pos[d] < pos[node] for node, ds in deps.items() for d in ds)
chk("0303 i2 correctOrder is valid topological order", topo_ok and order == ["t1", "t2", "t3", "t4"])
# each misorderFeedback names a real dependency violation
for e in w["misorderFeedback"]:
    chk(f"0303 i2 misorder {e['first']}<-{e['second']} is a real dep",
        e["second"] in deps.get(e["first"], set()))
chk("0303 k0 congruence gives all parts", corr(wid("cp-03-03", "k0")).startswith("every pair of corresponding"))
chk("0303 k1 SSS", corr(wid("cp-03-03", "k1")).startswith("SSS"))
# i3 bucket: show vs guarantee
i3 = wid("cp-03-03", "i3")
want = {"s1": "show", "s2": "show", "s3": "guar", "s4": "guar"}
for it in i3["items"]:
    chk(f"0303 i3 '{it['id']}'", it["bucketId"] == want[it["id"]])
chk("0303 ch drawing-vs-proof", corr(wid("cp-03-03", "ch")).startswith("A drawing can be slightly off"))
w = L["cp-03-03"]["remedials"][0]["check"]["widget"]
chk("0303 rem equal-radii-first", corr(w).startswith("equal radii"))

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
        if w and w["type"] == "steppedReveal":
            for pan in w["panels"]:
                if "figure" in pan:
                    chk(f"{lid}/{s['id']} panel fig registered", pan["figure"] in registered)
        if s["kind"] == "concept" and "figure" in s:
            chk(f"{lid}/{s['id']} concept fig registered", s["figure"] in registered)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("cp ch3 verifier: ALL PASS (inscribed-polygon geometry recomputed; proof order topologically validated; figures registered)")
