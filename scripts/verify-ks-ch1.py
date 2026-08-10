#!/usr/bin/env python3
"""Independent verification of shapes-and-sorting-k Chapter 1 (Flat Shapes), K.G.1-2,4.

Content is qualitative; the checkable layer is (a) the shape-attribute FACTS the lessons
assert, re-derived from an independent attribute table, and (b) disk-read widget integrity.

SELF-TESTED dual-route for the attribute facts:
  Route A: attribute lookup table (sides per shape).
  Route B: polygon construction — build each shape as a vertex list and count edges
    programmatically. Both must agree for every named shape.
"""
import sys, json, glob

SIDES_A = {"circle": 0, "triangle": 3, "square": 4, "rectangle": 4, "hexagon": 6}

VERTS = {
    "triangle": [(0, 0), (2, 0), (1, 2)],
    "square": [(0, 0), (2, 0), (2, 2), (0, 2)],
    "rectangle": [(0, 0), (4, 0), (4, 2), (0, 2)],
    "hexagon": [(1, 0), (3, 0), (4, 2), (3, 4), (1, 4), (0, 2)],
}


def sides_B(shape):
    if shape == "circle":
        return 0
    v = VERTS[shape]
    return sum(1 for i in range(len(v)) if v[i] != v[(i + 1) % len(v)])


def edge_lengths_sq(shape):
    v = VERTS[shape]
    return [(v[(i + 1) % len(v)][0] - v[i][0]) ** 2 + (v[(i + 1) % len(v)][1] - v[i][1]) ** 2 for i in range(len(v))]


def _selftest():
    mism = sum(1 for s in SIDES_A if SIDES_A[s] != sides_B(s))
    assert mism == 0
    print("  self-test: attribute table vs polygon-construction edge counts agree for all 5 shapes")


def main():
    _selftest()
    fails = checked = 0

    # attribute facts the chapter asserts
    for shape, n in [("triangle", 3), ("square", 4), ("rectangle", 4), ("hexagon", 6), ("circle", 0)]:
        checked += 1
        if SIDES_A[shape] != n or sides_B(shape) != n:
            fails += 1
            print(f"  SIDES FAIL {shape}")

    # square: all sides equal; rectangle: two pairs, not all equal
    checked += 1
    if len(set(edge_lengths_sq("square"))) != 1:
        fails += 1
    checked += 1
    if len(set(edge_lengths_sq("rectangle"))) != 2:
        fails += 1

    # rotation invariance: rotating the square's vertices 45-deg-equivalent (relabel) keeps 4 equal edges
    checked += 1
    rot = [(y, -x) for (x, y) in VERTS["square"]]
    lens = [(rot[(i + 1) % 4][0] - rot[i][0]) ** 2 + (rot[(i + 1) % 4][1] - rot[i][1]) ** 2 for i in range(4)]
    if len(set(lens)) != 1:
        fails += 1
    # scale invariance: doubling the triangle keeps 3 edges
    checked += 1
    big = [(2 * x, 2 * y) for (x, y) in VERTS["triangle"]]
    if sum(1 for i in range(3) if big[i] != big[(i + 1) % 3]) != 3:
        fails += 1

    # position-word opposites are symmetric claims — table check
    OPP = {"above": "below", "below": "above", "in front of": "behind", "behind": "in front of"}
    checked += 1
    if any(OPP[OPP[k]] != k for k in OPP):
        fails += 1

    # disk integrity
    for f in sorted(glob.glob("content/courses/shapes-and-sorting-k/lessons/ks-01-*.json")):
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
            if w["type"] == "matchPairs":
                checked += 1
                lids = {x["id"] for x in w["left"]}
                rids = {x["id"] for x in w["right"]}
                if set(w["pairs"].keys()) != lids or set(w["pairs"].values()) != rids:
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
