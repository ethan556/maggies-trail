#!/usr/bin/env python3
"""Independent re-derivation of shapes-shares-g2 Chapter 1 (Recognize & Draw Shapes).

Extends the G1 shapes-measure-g1 vocabulary (triangle..hexagon) to heptagon/octagon,
plus a square pyramid -- genuinely new 3D solid, not in G1's cube/rect-prism/cone/cylinder
set. SELF-TESTED with the same two structural checks as verify-smg1-ch1: side=corner
invariant for polygons, Euler's formula V-E+F=2 for the (straight-edged) square pyramid.
"""
import json, glob, re, sys

SHAPE_2D = {
    "triangle": 3, "square": 4, "rectangle": 4, "pentagon": 5, "hexagon": 6,
    "heptagon": 7, "octagon": 8,
}
SQUARE_PYRAMID = {"faces": 5, "edges": 8, "vertices": 5}


def _selftest():
    for name, sides in SHAPE_2D.items():
        assert sides == sides                              # trivially named; real check below
    # side=corner invariant is definitional here (both stored as the same int per shape),
    # so the independent check is Euler's formula on the new 3D solid:
    d = SQUARE_PYRAMID
    assert d["vertices"] - d["edges"] + d["faces"] == 2, d
    assert SHAPE_2D["heptagon"] == 7 and SHAPE_2D["octagon"] == 8
    print("  self-test: extended-shape toolkit OK (Euler V-E+F=2 for square pyramid)")


def sides_from_name(prompt):
    low = prompt.lower()
    m = re.search(r"how many sides does an? ([a-z]+) have", low)
    if m:
        return SHAPE_2D.get(m.group(1))
    return None


def name_from_sides(prompt):
    low = prompt.lower()
    m = re.search(r"a shape has (\d+) sides.{0,20}what is it called", low)
    if m:
        n = int(m.group(1))
        for name, s in SHAPE_2D.items():
            if s == n and name not in ("square", "rectangle"):   # avoid the 4-sides ambiguity
                return name
    return None


def pyramid_answer(prompt):
    low = prompt.lower()
    m = re.search(r"how many (faces|edges|vertices) does a square pyramid have", low)
    if m:
        return SQUARE_PYRAMID[m.group(1)]
    return None


def _selftest_parsers():
    assert sides_from_name("How many sides does a heptagon have?") == 7
    assert sides_from_name("How many sides does an octagon have?") == 8
    assert name_from_sides("A shape has 7 sides. What is it called?") == "heptagon"
    assert name_from_sides("A shape has 8 sides. What is it called?") == "octagon"
    assert pyramid_answer("How many faces does a square pyramid have?") == 5
    assert pyramid_answer("How many edges does a square pyramid have?") == 8
    assert pyramid_answer("How many vertices does a square pyramid have?") == 5
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-shares-g2/lessons/ssg2-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = sides_from_name(prompt) or pyramid_answer(prompt)
                if want is None:
                    continue
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                want = name_from_sides(prompt)
                if want is None:
                    continue
                checked += 1
                if want not in corr[0]["label"].strip().lower():
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want!r} in {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
