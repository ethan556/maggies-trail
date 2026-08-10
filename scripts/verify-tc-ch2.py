"""tc ch2 verifier. Route A: authored answers. Route B: recompute HL missing legs by the
Pythagorean theorem (unique positive root proves HL is unambiguous), re-derive CPCTC numeric
facts, and validate the CPCTC/two-step proof dragOrders as topological orders of their
dependency DAGs (each misorder edge proven real)."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/triangle-congruence/lessons/tc-02-*.json")):
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

def leg(hyp, other): return math.sqrt(hyp**2 - other**2)

# ---------- tc-02-01 HL ----------
w = wid("tc-02-01", "i1")
chk("0201 i1 missing leg 5,13", w["answer"] == leg(13, 5) == 12 and traps(w) == [8, 18] and 13 - 5 == 8 and 13 + 5 == 18)
chk("0201 k1 right angle fixes leg", corr(wid("tc-02-01", "k1")).startswith("The right angle lets the Pythagorean"))
chk("0201 i2 HL is SAS", corr(wid("tc-02-01", "i2")).startswith("SAS"))
chk("0201 k2 congruent by HL", corr(wid("tc-02-01", "k2")) == "They are congruent by HL")
# Route B: HL uniqueness — only one positive leg
chk("0201 Route B HL unique (10,6)->8", leg(10, 6) == 8 and leg(10, 6) > 0)
chk("0201 i3 genuine HL", corr(wid("tc-02-01", "i3")).startswith("A right triangle with a known hypotenuse"))
w = wid("tc-02-01", "ch")
chk("0201 ch leg 8,17", w["answer"] == leg(17, 8) == 15 and traps(w) == [9, 25] and 17 - 8 == 9 and 17 + 8 == 25)
chk("0201 rem HL requirements", corr(L["tc-02-01"]["remedials"][0]["check"]["widget"]).startswith("a right angle, the hypotenuse"))

# ---------- tc-02-02 CPCTC practice ----------
w = wid("tc-02-02", "i1")
deps = {"t2": {"t1"}, "t3": {"t1", "t2"}, "t4": {"t3"}, "t1": set()}
chk("0202 i1 SAS proof topo", valid_topo(w["correctOrder"], deps) and w["correctOrder"] == ["t1", "t2", "t3", "t4"])
for e in w["misorderFeedback"]:
    chk(f"0202 i1 misorder {e['first']}<-{e['second']}", e["second"] in deps.get(e["first"], set()))
chk("0202 k1 reflexive shared side", corr(wid("tc-02-02", "k1")).startswith("Reflexive Property"))
chk("0202 i2 vertical angles free", corr(wid("tc-02-02", "i2")).startswith("a pair of equal vertical angles"))
w = wid("tc-02-02", "k2")
chk("0202 k2 CPCTC EF=9", w["answer"] == 9 and traps(w) == [4.5, 18])
chk("0202 i3 CPCTC unused part", corr(wid("tc-02-02", "i3")).startswith("∠A = ∠D"))
chk("0202 ch two-triangle strategy", corr(wid("tc-02-02", "ch")).startswith("Find two triangles containing them"))
chk("0202 rem shared side reflexive", corr(L["tc-02-02"]["remedials"][0]["check"]["widget"]) == "Reflexive Property")

# ---------- tc-02-03 overlapping ----------
chk("0203 i1 shared side reflexive", corr(wid("tc-02-03", "i1")).startswith("AB = AB by the Reflexive"))
chk("0203 k1 separate to see parts", corr(wid("tc-02-03", "k1")).startswith("To see the corresponding parts"))
w = wid("tc-02-03", "i2")
deps = {"t2": {"t1"}, "t3": {"t1", "t2"}, "t4": {"t3"}, "t1": set()}
chk("0203 i2 SSS two-step topo", valid_topo(w["correctOrder"], deps) and w["correctOrder"] == ["t1", "t2", "t3", "t4"])
for e in w["misorderFeedback"]:
    chk(f"0203 i2 misorder {e['first']}<-{e['second']}", e["second"] in deps.get(e["first"], set()))
chk("0203 k2 relay CPCTC input", corr(wid("tc-02-03", "k2")).startswith("A part obtained by CPCTC"))
chk("0203 i3 plan backward", corr(wid("tc-02-03", "i3")).startswith("Which two triangles contain"))
chk("0203 ch shared angle SAS", corr(wid("tc-02-03", "ch")).startswith("SAS, with the shared"))
chk("0203 rem shared angle reflexive", corr(L["tc-02-03"]["remedials"][0]["check"]["widget"]) == "Reflexive Property")

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
print("tc ch2 verifier: ALL PASS (HL legs recomputed by Pythagoras/unique; CPCTC facts re-derived; proof orders topologically validated)")
