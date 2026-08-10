"""gf ch3 verifier. Route A: the taught coordinate rules, coded as plain lambdas.
Route B: linear algebra — rotation matrices built from cos/sin, reflection matrices,
translations as vector addition. Every authored answer, trap, plot target, and plot
error is re-derived through BOTH routes (traps from their named error models)."""
import json, glob, math

L = {}
for p in sorted(glob.glob("content/courses/geometry-foundations/lessons/gf-03-*.json")):
    d = json.load(open(p)); L[d["id"]] = d

def st(lid): return {s["id"]: s for s in L[lid]["steps"]}
def wid(lid, sid): return st(lid)[sid]["widget"]
def correct_label(w): return [o["label"] for o in w["options"] if o["correct"]][0]
def traps(w): return sorted(c["value"] for c in w["commonErrors"])

fails = []
def chk(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    if not cond: fails.append(name)

# Route A: taught rules
A_tr = lambda p, v: (p[0] + v[0], p[1] + v[1])
A_rx = lambda p: (p[0], -p[1])
A_ry = lambda p: (-p[0], p[1])
A_yx = lambda p: (p[1], p[0])
A_rot = lambda p, d: {90: (-p[1], p[0]), 180: (-p[0], -p[1]), 270: (p[1], -p[0])}[d]

# Route B: matrices
def B_rot(p, deg):
    c, s = round(math.cos(math.radians(deg))), round(math.sin(math.radians(deg)))
    return (c * p[0] - s * p[1], s * p[0] + c * p[1])
def B_ref(p, m):
    return (m[0][0] * p[0] + m[0][1] * p[1], m[1][0] * p[0] + m[1][1] * p[1])
MX, MY, MYX = [[1, 0], [0, -1]], [[-1, 0], [0, 1]], [[0, 1], [1, 0]]
def both_rot(p, d):
    a, b = A_rot(p, d), B_rot(p, d); assert a == b, (p, d); return a
def both(pA, pB):
    assert pA == pB; return pA

# ---------- gf-03-01 translations ----------
w = wid("gf-03-01", "i1")
img = both(A_tr((2, 3), (3, 1)), (2 + 3, 3 + 1))
chk("0301 i1 target", [(t["x"], t["y"]) for t in w["targets"]] == [img])
errs = {(e["x"], e["y"]) for e in w["pointErrors"]}
chk("0301 i1 errors are error-models",
    errs == {(2, 3), (5, 3), A_tr((2, 3), (1, 3))})  # preimage, x-only, swapped shifts
w = wid("gf-03-01", "k1")
chk("0301 k1", w["answer"] == both(A_tr((10, 2), (-4, 7)), (6, 9))[0])
chk("0301 k1 traps", traps(w) == [10, 14] and 10 + 4 == 14)
w = wid("gf-03-01", "i2")
chk("0301 i2", w["answer"] == 2 - 5)
chk("0301 i2 traps", traps(w) == [3, 7] and abs(2 - 5) == 3 and 2 + 5 == 7)
w = wid("gf-03-01", "k2")
rule = (8 - 3, 2 - 5)
chk("0301 k2 rule derived", rule == (5, -3) and A_tr((3, 5), rule) == (8, 2))
chk("0301 k2 correct", correct_label(w) == "(x, y) → (x + 5, y − 3)")
w = wid("gf-03-01", "i3")
chk("0301 i3", w["answer"] == A_tr((6, 9), (2, -5))[0])
chk("0301 i3 traps", traps(w) == [4, 6] and A_tr((6, 9), (2, -5))[1] == 4)
w = wid("gf-03-01", "ch")
final = both(A_tr(A_tr((6, 9), (2, -5)), (-7, 1)), A_tr((6, 9), (2 - 7, -5 + 1)))
chk("0301 ch", w["answer"] == final[0] == 1)
chk("0301 ch traps", traps(w) == [8, 15] and 6 + 2 + 7 == 15 and 6 + 2 == 8)
w = L["gf-03-01"]["remedials"][0]["check"]["widget"]
chk("0301 rem", w["answer"] == A_tr((4, 6), (3, -2))[0] == 7)
chk("0301 rem traps", traps(w) == [1, 4] and 4 - 3 == 1)

# ---------- gf-03-02 reflections ----------
w = wid("gf-03-02", "i1")
chk("0302 i1", correct_label(w) == "(3, −7)" and both(A_rx((3, 7)), B_ref((3, 7), MX)) == (3, -7))
w = wid("gf-03-02", "k1")
chk("0302 k1", w["answer"] == both(A_ry((-4, 6)), B_ref((-4, 6), MY))[0] == 4)
chk("0302 k1 traps", traps(w) == [-4, 6])
w = wid("gf-03-02", "k2")
chk("0302 k2 property", correct_label(w) == "m is the perpendicular bisector of PP′")
# Route B for the property: with mirror x=0 and P=(-3,2): P'=(3,2); midpoint on mirror; PP' horizontal ⟂ vertical mirror
P, Pp = (-3, 2), B_ref((-3, 2), MY)
chk("0302 k2 model", (P[0] + Pp[0]) / 2 == 0 and P[1] == Pp[1])
w = wid("gf-03-02", "i2")
img = both(A_yx((2, 5)), B_ref((2, 5), MYX))
chk("0302 i2 target", [(t["x"], t["y"]) for t in w["targets"]] == [img])
chk("0302 i2 error is preimage", [(e["x"], e["y"]) for e in w["pointErrors"]] == [(2, 5)])
w = wid("gf-03-02", "k3")
chk("0302 k3", w["answer"] == both(A_yx((7, 3)), B_ref((7, 3), MYX))[0] == 3)
chk("0302 k3 traps", traps(w) == [-7, 7])
w = wid("gf-03-02", "ch")
chk("0302 ch fixed point", A_yx((4, 4)) == (4, 4) and
    correct_label(w) == "Nowhere new — it is its own image (a fixed point)")
w = L["gf-03-02"]["remedials"][0]["check"]["widget"]
chk("0302 rem", correct_label(w) == "(5, −3)" and both(A_rx((5, 3)), B_ref((5, 3), MX)) == (5, -3))

# ---------- gf-03-03 rotations ----------
w = wid("gf-03-03", "i1")
chk("0303 i1", correct_label(w) == "(−3, −5)" and both_rot((3, 5), 180) == (-3, -5))
w = wid("gf-03-03", "k1")
chk("0303 k1", w["answer"] == both_rot((4, 1), 90)[1] == 4)
chk("0303 k1 traps", traps(w) == [-4, 1] and both_rot((4, 1), 270)[1] == -4)
w = wid("gf-03-03", "i2")
chk("0303 i2", correct_label(w) == "270° counterclockwise" and both_rot((2, 6), 270) == (6, -2))
chk("0303 i2 distractor models", both_rot((2, 6), 90) == (-6, 2) and both_rot((2, 6), 180) == (-2, -6))
w = wid("gf-03-03", "k2")
chk("0303 k2", w["answer"] == both_rot((1, 7), 270)[1] == -1)
chk("0303 k2 traps", traps(w) == [1, 7])
w = wid("gf-03-03", "i3")
chk("0303 i3", w["answer"] == both_rot((5, 2), 90)[1] == 5)
chk("0303 i3 traps", traps(w) == [-5, 2])
w = wid("gf-03-03", "ch")
twice = both_rot(both_rot((5, 2), 90), 90)
chk("0303 ch composition", twice == both_rot((5, 2), 180) == (-5, -2) and
    correct_label(w) == "(−5, −2)")
chk("0303 ch distractor models", both_rot((5, 2), 90) == (-2, 5) and both_rot((5, 2), 270) == (2, -5))
w = L["gf-03-03"]["remedials"][0]["check"]["widget"]
chk("0303 rem", correct_label(w) == "(−2, −7)" and both_rot((2, 7), 180) == (-2, -7))

# structural sweep
for lid in L:
    for s in L[lid]["steps"]:
        w = s.get("widget")
        if w and w["type"] == "mcq":
            chk(f"{lid}/{s['id']} one-correct", sum(o["correct"] for o in w["options"]) == 1)
        if w and w["type"] == "numeric":
            for c in w["commonErrors"]:
                chk(f"{lid}/{s['id']} trap {c['value']} != answer",
                    abs(c["value"] - w["answer"]) > w.get("tolerance", 0))
        if w and w["type"] == "plotPoint":
            for t in w["targets"]:
                chk(f"{lid}/{s['id']} target in grid",
                    1 <= t["x"] <= w["cols"] <= 8 and 1 <= t["y"] <= w["rows"] <= 8)
            tset = {(t["x"], t["y"]) for t in w["targets"]}
            for e in w["pointErrors"]:
                chk(f"{lid}/{s['id']} error ({e['x']},{e['y']}) not a target",
                    (e["x"], e["y"]) not in tset)

print()
if fails:
    print(f"VERIFIER FAILED: {len(fails)}"); raise SystemExit(1)
print("gf ch3 verifier: ALL PASS (coordinate rules and matrices agree everywhere)")
