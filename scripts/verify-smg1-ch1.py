#!/usr/bin/env python3
"""Independent re-derivation of shapes-measure-g1 Chapter 1 (2D & 3D Shapes and Attributes).

SELF-TESTED against two independent structural checks, not just a lookup table:
- 2D polygons: sides == corners (a genuine invariant for any simple polygon).
- Straight-edged 3D solids (cube, rectangular prism): Euler's formula V - E + F = 2.
Curved solids (cone, cylinder) are restricted to flat-face / curved-surface counts only —
the standard, unambiguous G1-level facts (no edge/vertex claims on curved solids).
"""
import json, glob, re, sys

SHAPE_2D = {
    "triangle": {"sides": 3, "corners": 3},
    "square": {"sides": 4, "corners": 4},
    "rectangle": {"sides": 4, "corners": 4},
    "pentagon": {"sides": 5, "corners": 5},
    "hexagon": {"sides": 6, "corners": 6},
}
SOLIDS_STRAIGHT = {
    "cube": {"faces": 6, "edges": 12, "vertices": 8},
    "rectangular prism": {"faces": 6, "edges": 12, "vertices": 8},
}
SOLIDS_CURVED = {
    "cone": {"flat_faces": 1, "curved_surfaces": 1},
    "cylinder": {"flat_faces": 2, "curved_surfaces": 1},
}
ALL_3D = {**SOLIDS_STRAIGHT, **SOLIDS_CURVED}


def _selftest():
    for name, d in SHAPE_2D.items():
        assert d["sides"] == d["corners"], name          # simple-polygon invariant
    for name, d in SOLIDS_STRAIGHT.items():
        assert d["vertices"] - d["edges"] + d["faces"] == 2, name   # Euler's formula
    assert SHAPE_2D["triangle"]["sides"] == 3 and SHAPE_2D["hexagon"]["sides"] == 6
    assert SOLIDS_CURVED["cylinder"]["flat_faces"] == 2
    assert SOLIDS_CURVED["cone"]["flat_faces"] == 1
    print("  self-test: shape-attributes toolkit OK (side=corner invariant; Euler V-E+F=2)")


def numeric_answer(prompt):
    low = prompt.lower()
    m = re.search(r"how many (sides|corners) does an? ([a-z ]+?) have", low)
    if m:
        attr, shape = m.groups()
        d = SHAPE_2D.get(shape.strip())
        return d[attr] if d else None
    m = re.search(r"how many (faces|edges|vertices) does an? ([a-z ]+?) have", low)
    if m:
        attr, shape = m.groups()
        d = SOLIDS_STRAIGHT.get(shape.strip())
        return d[attr] if d else None
    m = re.search(r"how many (flat faces|curved surfaces) does an? ([a-z ]+?) have", low)
    if m:
        attr, shape = m.groups()
        d = SOLIDS_CURVED.get(shape.strip())
        return d[attr.replace(" ", "_")] if d else None
    return None


def mcq_answer(prompt):
    low = prompt.lower()
    m = re.search(r"which shape has (\d+) sides and (\d+) corners", low)
    if m:
        s, c = int(m.group(1)), int(m.group(2))
        for name, d in SHAPE_2D.items():
            if d["sides"] == s and d["corners"] == c:
                return name
        return None
    m = re.search(r"is an? ([a-z ]+?) (2d|3d|two-dimensional|three-dimensional)", low)
    if m:
        shape = m.group(1).strip()
        if shape in SHAPE_2D:
            return "2D"
        if shape in ALL_3D:
            return "3D"
        return None
    return None


def _selftest_parsers():
    assert numeric_answer("How many sides does a triangle have?") == 3
    assert numeric_answer("How many corners does a hexagon have?") == 6
    assert numeric_answer("How many faces does a cube have?") == 6
    assert numeric_answer("How many edges does a rectangular prism have?") == 12
    assert numeric_answer("How many vertices does a cube have?") == 8
    assert numeric_answer("How many flat faces does a cone have?") == 1
    assert numeric_answer("How many curved surfaces does a cylinder have?") == 1
    assert mcq_answer("Which shape has 3 sides and 3 corners?") == "triangle"
    assert mcq_answer("Which shape has 6 sides and 6 corners?") == "hexagon"
    assert mcq_answer("Is a hexagon 2D or 3D?") == "2D"
    assert mcq_answer("Is a cube 2D or 3D?") == "3D"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-measure-g1/lessons/smg1-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = numeric_answer(prompt)
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
                want = mcq_answer(prompt)
                if want is None:
                    continue
                checked += 1
                if corr[0]["label"].strip().lower() != want.lower():
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
