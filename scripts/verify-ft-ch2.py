#!/usr/bin/env python3
"""Independent re-derivation of function-transformations Chapter 2 (Shifts).

SELF-TESTED dual routes:
  Shifted evaluation — Route A: direct arithmetic on the shifted rule f(x-h)+k.
                       Route B: parent-then-translate — evaluate the PARENT at (x-h),
                       then add k. (Same algebra, different expression path; catches
                       inside-vs-outside slips.)
  Vertex / extremum — Route A: read-off (h, k) from the rule's parameters.
                      Route B: brute-force argmin/argmax of the shifted rule on a
                      dense grid, recovering both coordinates numerically.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content/courses/function-transformations/lessons"

PARENTS = {"sq": lambda t: t * t, "abs": abs, "cube": lambda t: t ** 3}


def eval_direct(parent, h, k, x):
    return PARENTS[parent](x - h) + k


def eval_translate(parent, h, k, x):
    u = x - h            # translate the input first
    base = PARENTS[parent](u)   # parent value
    return base + k      # then lift


def brute_vertex(parent, h, k, kind="min"):
    best_x, best_y = None, None
    n = 4001
    for i in range(n):
        x = -20 + 40 * i / (n - 1)
        y = PARENTS[parent](x - h) + k
        if best_y is None or (y < best_y if kind == "min" else y > best_y):
            best_x, best_y = x, y
    return round(best_x, 6), round(best_y, 6)


def _selftest():
    for parent in PARENTS:
        for h in range(-6, 7):
            for k in range(-6, 7):
                for x in range(-8, 9):
                    assert eval_direct(parent, h, k, x) == eval_translate(parent, h, k, x)
    bx, by = brute_vertex("sq", 3, -2)
    assert abs(bx - 3) < 0.02 and abs(by + 2) < 1e-9
    print("  self-test: direct vs parent-translate eval agree on full grid; brute vertex recovers (h,k)")


def main():
    _selftest()
    fails = checked = 0

    def chk(label, got, want, tol=0):
        nonlocal fails, checked
        checked += 1
        bad = abs(got - want) > tol if isinstance(got, float) else got != want
        if bad:
            fails += 1
            print(f"  ✗ {label}: got {got}, want {want}")

    # --- authored evaluation facts: (parent, h, k, x, expected), both routes ---
    evals = [
        ("sq", 0, 5, 0, 5),      # vertex height of x^2+5 via eval at 0
        ("sq", 0, -4, 3, 5),     # x^2-4 at x=3
        ("abs", 0, 2, 0, 2),     # corner of |x|+2
        ("cube", 0, -6, 2, 2),   # x^3-6 at x=2
        ("sq", 0, 3, 4, 19),     # remedial: x^2+3 at x=4
        ("sq", 4, 0, 6, 4),      # (x-4)^2 at x=6
        ("abs", 5, 0, 1, 4),     # |x-5| at x=1
        ("sq", 1, 4, 1, 4),      # min of (x-1)^2+4 read at its vertex
    ]
    for parent, h, k, x, want in evals:
        chk(f"{parent} h={h} k={k} x={x} direct", eval_direct(parent, h, k, x), want)
        chk(f"{parent} h={h} k={k} x={x} translate", eval_translate(parent, h, k, x), want)

    # --- vertex facts: read-off vs brute force ---
    vertices = [
        ("sq", 8, 0), ("sq", -5, 0), ("sq", 2, 7), ("sq", -3, -5),
        ("sq", 1, 4), ("sq", 5, 1), ("sq", 6, 0), ("abs", 4, -3),
    ]
    for parent, h, k in vertices:
        bx, by = brute_vertex(parent, h, k)
        chk(f"{parent} vertex x (h={h})", bx, h, tol=0.02)
        chk(f"{parent} vertex y (k={k})", by, k, tol=1e-6)

    # domain boundary through a combined shift: sqrt(x-6)+2 starts at 6 regardless of k
    import math
    def defined(x):
        try:
            math.sqrt(x - 6); return True
        except ValueError:
            return False
    chk("sqrt(x-6)+2 boundary", min(x for x in range(-20, 21) if defined(x)), 6)

    # --- lesson-file integrity ---
    for p in sorted(ROOT.glob("ft-02-*.json")):
        d = json.loads(p.read_text())
        steps = d["steps"] + [r["check"] for r in d.get("remedials", [])]
        for s in steps:
            w = s.get("widget")
            if not w:
                continue
            if w["type"] == "mcq":
                chk(f"{d['id']}/{s['id']} one-correct", sum(1 for o in w["options"] if o.get("correct")), 1)
            if w["type"] == "numeric":
                for e in w.get("commonErrors", []):
                    checked += 1
                    if e["value"] == w["answer"]:
                        fails += 1
                        print(f"  ✗ {d['id']}/{s['id']}: trap equals answer")

    print(f"verify-ft-ch2: {checked - fails}/{checked} checks pass")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
