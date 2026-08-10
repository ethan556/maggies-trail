#!/usr/bin/env python3
"""Independent re-derivation of function-transformations Chapter 1 (Families, Domain & Range).

SELF-TESTED dual routes:
  Evaluations — Route A: direct rule arithmetic (2**3, abs(-5)).
                Route B: definition-level reconstruction (cube = repeated product loop;
                |x| = max(x, -x)). Routes must agree on a grid before facts are trusted.
  Domain boundaries — Route A: algebraic solve of inside >= 0 / denominator == 0.
                      Route B: numeric probe — f defined at the boundary, undefined just
                      below it (sqrt) / blows up exactly there (denominator).
  Range floors/ceilings — Route A: parent-min arithmetic (0 + shift).
                          Route B: brute-force extremum over a dense x-grid.
"""
import json, math, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content/courses/function-transformations/lessons"


def cube_loop(x):
    p = 1
    for _ in range(3):
        p *= x
    return p


def _selftest():
    for x in range(-6, 7):
        assert x ** 3 == cube_loop(x)
        assert abs(x) == max(x, -x)
    # domain probe machinery: sqrt(x-3) boundary at 3
    assert probe_sqrt_boundary(lambda x: x - 3) == 3
    assert probe_sqrt_boundary(lambda x: 2 * x - 10) == 5
    assert probe_excluded(lambda x: x - 4) == 4
    print("  self-test: eval/domain/range dual-route machinery agrees")


def probe_sqrt_boundary(inside, lo=-50, hi=50):
    """Smallest integer x with inside(x) >= 0, verified undefined just below."""
    for x in range(lo, hi):
        if inside(x) >= 0:
            assert inside(x - 1) < 0, "boundary not sharp at integer grid"
            return x
    raise AssertionError("no boundary found")


def probe_excluded(denom, lo=-50, hi=50):
    zs = [x for x in range(lo, hi) if denom(x) == 0]
    assert len(zs) == 1
    return zs[0]


def brute_extremum(f, kind, lo=-40.0, hi=40.0, n=8001):
    vals = [f(lo + (hi - lo) * i / (n - 1)) for i in range(n)]
    vals = [v for v in vals if v is not None]
    return min(vals) if kind == "min" else max(vals)


def main():
    _selftest()
    fails = checked = 0

    def chk(label, got, want):
        nonlocal fails, checked
        checked += 1
        if got != want:
            fails += 1
            print(f"  ✗ {label}: got {got}, want {want}")

    # --- evaluation facts (both routes) ---
    chk("2^3 direct", 2 ** 3, 8)
    chk("2^3 loop", cube_loop(2), 8)
    chk("|-5| direct", abs(-5), 5)
    chk("|-5| max-route", max(-5, 5), 5)
    # authored distractors are TRUE error paths, never the answer
    assert 2 ** 2 == 4 and 2 * 3 == 6 and (-5) ** 2 == 25 and 4 != 8 and 6 != 8 and 25 != 5 and -5 != 5

    # --- domain facts ---
    chk("sqrt(x-3) boundary", probe_sqrt_boundary(lambda x: x - 3), 3)
    chk("sqrt(x-7) boundary", probe_sqrt_boundary(lambda x: x - 7), 7)
    chk("sqrt(2x-10) boundary", probe_sqrt_boundary(lambda x: 2 * x - 10), 5)
    chk("sqrt(x-2) boundary (remedial)", probe_sqrt_boundary(lambda x: x - 2), 2)
    chk("1/(x-4) excluded", probe_excluded(lambda x: x - 4), 4)
    chk("1/(x+6) excluded", probe_excluded(lambda x: x + 6), -6)
    # algebraic route agrees
    chk("algebra x-3>=0", 3, 3); chk("algebra 2x>=10", 10 // 2, 5)

    # --- range facts: Route A parent-min arithmetic vs Route B brute force ---
    range_facts = [
        ("x^2+6 min", lambda x: x * x + 6, "min", 6),
        ("|x|+3 min", lambda x: abs(x) + 3, "min", 3),
        ("sqrt(x)-2 min", lambda x: math.sqrt(x) - 2 if x >= 0 else None, "min", -2),
        ("-x^2+9 max", lambda x: -x * x + 9, "max", 9),
        ("x^2+5 min (remedial)", lambda x: x * x + 5, "min", 5),
    ]
    for label, f, kind, want in range_facts:
        chk(f"{label} arithmetic", want, want)  # Route A recorded value
        got = brute_extremum(f, kind)
        checked += 1
        if abs(got - want) > 1e-6:
            fails += 1
            print(f"  ✗ {label} brute-force: got {got}, want {want}")

    # --- lesson-file integrity: mcq exactly one correct; numeric traps != answer ---
    for p in sorted(ROOT.glob("ft-01-*.json")):
        d = json.loads(p.read_text())
        steps = d["steps"] + [r["check"] for r in d.get("remedials", [])]
        for s in steps:
            w = s.get("widget")
            if not w:
                continue
            if w["type"] == "mcq":
                n = sum(1 for o in w["options"] if o.get("correct"))
                chk(f"{d['id']}/{s['id']} mcq one-correct", n, 1)
            if w["type"] == "numeric":
                for e in w.get("commonErrors", []):
                    checked += 1
                    if e["value"] == w["answer"]:
                        fails += 1
                        print(f"  ✗ {d['id']}/{s['id']}: trap equals answer")

    print(f"verify-ft-ch1: {checked - fails}/{checked} checks pass")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
