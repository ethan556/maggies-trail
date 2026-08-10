#!/usr/bin/env python3
"""Independent re-derivation of shapes-shares-g2 Chapter 2 (Partition Rectangles into Squares).

Scoped to the GEOMETRIC partition-and-count skill (2.G.2) -- given a rectangle already
partitioned into a grid, count the unit squares. Deliberately distinct from
multiplication-division's discrete-object array/multiplication-fact skill (2.OA.4).
SELF-TESTED dual-route: total = rows * columns (direct) cross-checked against counting
row by row in a loop (summing 1 for each square) -- the spatial counting a student would
actually do, not just the arithmetic shortcut.
"""
import json, glob, re, sys


def total_direct(rows, cols):
    return rows * cols


def total_by_counting(rows, cols):
    count = 0
    for _ in range(rows):
        for _ in range(cols):
            count += 1
    return count


def _selftest():
    for rows in range(1, 8):
        for cols in range(1, 8):
            assert total_direct(rows, cols) == total_by_counting(rows, cols), (rows, cols)
    print("  self-test: grid toolkit OK (multiply vs count-every-square agree)")


def grid_answer(prompt):
    low = prompt.lower()
    m = re.search(r"partitioned into (\d+) rows and (\d+) columns of unit squares.{0,60}how many unit squares", low)
    if not m:
        return None
    rows, cols = int(m.group(1)), int(m.group(2))
    return total_direct(rows, cols)


def _selftest_parsers():
    assert grid_answer("A rectangle is partitioned into 3 rows and 4 columns of unit squares. How many unit squares in all?") == 12
    assert grid_answer("A rectangle is partitioned into 5 rows and 2 columns of unit squares. How many unit squares in all?") == 10
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-shares-g2/lessons/ssg2-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            want = grid_answer(w.get("prompt", ""))
            if want is None:
                continue
            checked += 1
            ok = (int(w["answer"]) == want and w["tolerance"] == 0
                  and len(w["commonErrors"]) >= 2
                  and all(e["value"] != want for e in w["commonErrors"]))
            if not ok:
                fails += 1
                print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
