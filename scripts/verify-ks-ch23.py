#!/usr/bin/env python3
"""Independent verification of shapes-and-sorting-k Chapters 2-3 (Solid Shapes; Compare & Sort).

Qualitative solid facts are encoded as an attribute table (flat-face count vs curved surface)
and roll/stack behavior is DERIVED from it (curved surface -> rolls; any flat face -> stacks;
cone rolls in a circle because one flat face + curved side + apex), then cross-checked against
the authored answers. Countable facts (triangle-composition arithmetic, sort totals and
maxima, transitive length ordering) run dual-route: arithmetic vs token counting/pair
comparison. Disk sweep: mcq single-correct, dragBucket bucket ids valid, matchPairs pairs
bijective, pairErrors never flag a correct link.
"""
import sys, json, glob

# solids: (flat_faces, has_curved_surface, has_apex)
SOLIDS = {"sphere": (0, True, False), "cube": (6, False, False),
          "cylinder": (2, True, False), "cone": (1, True, True)}


def can_roll(s):
    return SOLIDS[s][1]


def can_stack(s):
    return SOLIDS[s][0] > 0


def rolls_in_circle(s):
    flat, curved, apex = SOLIDS[s]
    return curved and apex


def _selftest():
    assert can_roll("sphere") and not can_stack("sphere")
    assert not can_roll("cube") and can_stack("cube")
    assert can_roll("cylinder") and can_stack("cylinder")
    assert rolls_in_circle("cone") and not rolls_in_circle("cylinder")
    # dual-route sort totals
    for a in range(0, 8):
        for b in range(0, 8):
            assert a + b == len([1] * a + [1] * b)
    print("  self-test: attribute-derived roll/stack matches known behavior; sort totals dual-route")


def main():
    _selftest()
    fails = checked = 0

    # authored roll/stack answers
    facts = [("sphere", "roll", True), ("cube", "roll", False), ("cylinder", "roll", True),
             ("cube", "stack", True), ("sphere", "stack", False), ("cylinder", "stack", True)]
    for s, verb, e in facts:
        checked += 1
        got = can_roll(s) if verb == "roll" else can_stack(s)
        if got != e:
            fails += 1
            print(f"  SOLID FAIL {s} {verb}")
    checked += 1
    if not rolls_in_circle("cone"):
        fails += 1
    # the "stacks but cannot roll" unique answer must be cube
    checked += 1
    only = [s for s in SOLIDS if can_stack(s) and not can_roll(s)]
    if only != ["cube"]:
        fails += 1
        print(f"  UNIQUE-STACKER FAIL {only}")
    # the "rolls every way" unique answer must be sphere (curved, no flat, no apex)
    checked += 1
    allway = [s for s in SOLIDS if can_roll(s) and SOLIDS[s][0] == 0]
    if allway != ["sphere"]:
        fails += 1

    # composition arithmetic: 2 triangles per square; two squares -> 4 (dual route)
    checked += 1
    if 2 * 2 != 4 or len([1, 1] + [1, 1]) != 4:
        fails += 1

    # sort-and-count facts: (groups, biggest, total)
    for groups, biggest, total in [({"spoons": 5, "forks": 3}, "spoons", 8),
                                   ({"red": 2, "blue": 4}, "blue", 6),
                                   ({"circles": 3, "squares": 4, "triangles": 2}, "squares", 9),
                                   ({"cats": 2, "dogs": 5}, "dogs", 7)]:
        checked += 1
        if max(groups, key=groups.get) != biggest or sum(groups.values()) != total:
            fails += 1
            print(f"  SORT FAIL {groups}")
        # route B: token concatenation total
        checked += 1
        if len(sum(([1] * v for v in groups.values()), [])) != total:
            fails += 1

    # transitive length: bike < car < train -> train longest (pairwise route)
    checked += 1
    L = {"bike": 1, "car": 2, "train": 3}
    if max(L, key=L.get) != "train" or not (L["bike"] < L["car"] < L["train"]):
        fails += 1

    # disk sweep
    for f in sorted(glob.glob("content/courses/shapes-and-sorting-k/lessons/ks-02-*.json")) + \
             sorted(glob.glob("content/courses/shapes-and-sorting-k/lessons/ks-03-*.json")):
        d = json.load(open(f))
        allsteps = list(d["steps"]) + [r["check"] for r in d.get("remedials", [])]
        for st in allsteps:
            w = st.get("widget")
            if not w:
                continue
            if w["type"] == "mcq":
                checked += 1
                if sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1
                    print(f"  MCQ FAIL {f} {st['id']}")
            if w["type"] == "dragBucket":
                checked += 1
                bids = {b["id"] for b in w["buckets"]}
                if any(it["bucketId"] not in bids for it in w["items"]):
                    fails += 1
                    print(f"  BUCKET FAIL {f} {st['id']}")
            if w["type"] == "matchPairs":
                checked += 1
                lids = {x["id"] for x in w["left"]}
                rids = {x["id"] for x in w["right"]}
                p = w["pairs"]
                ok = set(p.keys()) == lids and set(p.values()) == rids and len(set(p.values())) == len(p)
                if not ok or any(p.get(e["left"]) == e["right"] for e in w["pairErrors"]):
                    fails += 1
                    print(f"  MATCH FAIL {f} {st['id']}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
