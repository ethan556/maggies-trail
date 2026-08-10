#!/usr/bin/env python3
"""Independent re-derivation of function-transformations Chapter 3 (Reflections & Stretches).

SELF-TESTED dual routes:
  Full-rule evaluation a·f(x−h)+k — Route A: single-expression arithmetic.
                                    Route B: explicit four-stage pipeline (subtract h,
                                    parent, multiply a, add k) with each stage stored.
  Reflection facts — Route A: rule arithmetic (−f(x), f(−x)).
                     Route B: point-map route — take the PARENT point and apply the
                     coordinate map (x,y)→(x,−y) or (x,y)→(−x,y).
  Extrema with a<0 — Route A: k read-off. Route B: brute-force max over a grid.
"""
import json, math, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content/courses/function-transformations/lessons"

PARENTS = {"sq": lambda t: t * t, "abs": abs, "cube": lambda t: t ** 3,
           "sqrt": lambda t: math.sqrt(t)}


def eval_expr(parent, a, h, k, x):
    return a * PARENTS[parent](x - h) + k


def eval_pipeline(parent, a, h, k, x):
    s1 = x - h
    s2 = PARENTS[parent](s1)
    s3 = a * s2
    return s3 + k


def _selftest():
    for parent in ("sq", "abs", "cube"):
        for a in (-3, -2, -1, 0.5, 1, 2, 3):
            for h in range(-4, 5):
                for k in range(-4, 5):
                    for x in range(-5, 6):
                        assert abs(eval_expr(parent, a, h, k, x) - eval_pipeline(parent, a, h, k, x)) < 1e-12
    # point-map route: parent point (3,9) under y->-y is (3,-9) == eval of -x^2 at 3
    assert -PARENTS["sq"](3) == -9
    print("  self-test: expression vs staged-pipeline eval agree; point-map machinery sane")


def brute_max(f, lo=-30.0, hi=30.0, n=6001):
    return max(f(lo + (hi - lo) * i / (n - 1)) for i in range(n))


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

    # --- reflection evals: (parent, a, x, expected) with h=k=0; both routes + point-map ---
    refl = [("sq", -1, 3, -9), ("cube", -1, 2, -8), ("sq", -1, 2, -4), ("sq", -1, 4, -16)]
    for parent, a, x, want in refl:
        chk(f"-{parent}({x}) expr", eval_expr(parent, a, 0, 0, x), want)
        chk(f"-{parent}({x}) pipeline", eval_pipeline(parent, a, 0, 0, x), want)
        chk(f"-{parent}({x}) point-map", -PARENTS[parent](x), want)  # (x,y)->(x,-y)
    # y-axis flip: sqrt(-x) at x=-9 — input map (x,y)->(-x,y): parent point at +9
    chk("sqrt(-x) at -9 expr", math.sqrt(-(-9)), 3.0, tol=1e-12)
    chk("sqrt(-x) at -9 point-map", PARENTS["sqrt"](9), 3.0, tol=1e-12)

    # --- stretch evals: (parent, a, x, expected), both routes ---
    stretch = [("sq", 3, 2, 12), ("sq", 0.5, 4, 8.0), ("abs", 4, -1, 4),
               ("sqrt", 2, 9, 6.0), ("sq", -2, 3, -18), ("sq", 5, 3, 45)]
    for parent, a, x, want in stretch:
        chk(f"{a}*{parent}({x}) expr", eval_expr(parent, a, 0, 0, x), want, tol=1e-12)
        chk(f"{a}*{parent}({x}) pipeline", eval_pipeline(parent, a, 0, 0, x), want, tol=1e-12)

    # --- full-rule evals ---
    full = [("sq", -2, 1, 8, 3, 0), ("sq", 3, -2, -5, 0, 7)]
    for parent, a, h, k, x, want in full:
        chk(f"{a}(x-{h})^2+{k} at {x} expr", eval_expr(parent, a, h, k, x), want)
        chk(f"{a}(x-{h})^2+{k} at {x} pipeline", eval_pipeline(parent, a, h, k, x), want)

    # max of -2(x-1)^2+8: read-off k=8 vs brute force
    chk("max -2(x-1)^2+8 brute", brute_max(lambda x: -2 * (x - 1) ** 2 + 8), 8.0, tol=1e-4)

    # authored trap sanity: (3*2)^2=36 != 12; (−2·3)²=36 != −18; (5·3)²=225 != 45
    assert (3 * 2) ** 2 == 36 and ((-2) * 3) ** 2 == 36 and (5 * 3) ** 2 == 225

    # --- lesson-file integrity + dragOrder shuffle rule ---
    for p in sorted(ROOT.glob("ft-03-*.json")):
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
            if w["type"] == "dragOrder":
                init = [i["id"] for i in w["items"]]
                chk(f"{d['id']}/{s['id']} shuffled", init != w["correctOrder"], True)

    print(f"verify-ft-ch3: {checked - fails}/{checked} checks pass")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
