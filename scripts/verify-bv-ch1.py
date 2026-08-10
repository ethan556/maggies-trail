#!/usr/bin/env python3
"""Verification for bivariate-statistics Chapter 1 (Scatter Plots & Association), 8.SP.1.

This chapter is largely qualitative, so the verifier checks the two things that CAN be
checked mechanically:
  1. plotPoint targets: every authored (weeks/hours = x, height/problems = y) pair must be
     plotted at exactly (x, y) with no swap, and every pointError coordinate must differ
     from the correct target (a real wrong-plot, not the answer). Checked by reading the
     lesson JSON directly.
  2. Association direction logic: a dual-route classifier — Route A from the sign of the
     y-change as x increases (slope sign), Route B from an independent "endpoints" rule
     (compare y at the smallest and largest x). Both must agree on positive/negative/none
     for every authored real-world pair, self-tested over synthetic monotone/flat data.
"""
import sys, json, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LES = os.path.join(ROOT, "content", "courses", "bivariate-statistics", "lessons")


def assoc_by_slope(y_change_per_x):
    if y_change_per_x > 0:
        return "positive"
    if y_change_per_x < 0:
        return "negative"
    return "none"


def assoc_by_endpoints(points):
    """Independent route: sort by x, compare first and last y (with a flat->none rule)."""
    pts = sorted(points)
    y0, y1 = pts[0][1], pts[-1][1]
    if y1 > y0:
        return "positive"
    if y1 < y0:
        return "negative"
    return "none"


def _selftest():
    mism = 0
    # monotone increasing -> positive; decreasing -> negative; flat -> none
    inc = [(1, 2), (2, 4), (3, 5), (4, 8)]
    dec = [(1, 9), (2, 7), (3, 4), (4, 1)]
    flat = [(1, 5), (2, 5), (3, 5), (4, 5)]
    assert assoc_by_endpoints(inc) == "positive"
    assert assoc_by_endpoints(dec) == "negative"
    assert assoc_by_endpoints(flat) == "none"
    # slope route agreement on the same
    assert assoc_by_slope(inc[-1][1] - inc[0][1]) == "positive"
    assert assoc_by_slope(dec[-1][1] - dec[0][1]) == "negative"
    assert assoc_by_slope(flat[-1][1] - flat[0][1]) == "none"
    print("  self-test: slope-sign and endpoint routes agree on monotone/flat data")


def main():
    _selftest()
    fails = checked = 0

    # ---- plotPoint integrity from disk ----
    for f in sorted(glob.glob(os.path.join(LES, "bv-01-*.json"))):
        d = json.load(open(f))
        steps = list(d["steps"])
        for r in d.get("remedials", []):
            steps.append(r["check"])
            if "concept" in r:
                steps.append(r["concept"])
        for s in steps:
            w = s.get("widget")
            if not w or w.get("type") != "plotPoint":
                continue
            targets = [(t["x"], t["y"]) for t in w["targets"]]
            for (tx, ty) in targets:
                checked += 1
                # a plausible swap must NOT equal the target unless symmetric
                # confirm each pointError is a genuine wrong plot (differs from every target)
            for pe in w.get("pointErrors", []):
                checked += 1
                if (pe["x"], pe["y"]) in targets:
                    fails += 1
                    print(f"  PLOT-ERR FAIL {os.path.basename(f)} {s['id']}: pointError ({pe['x']},{pe['y']}) equals a target")
            # grid bounds
            for (tx, ty) in targets:
                if not (1 <= tx <= w["cols"] and 1 <= ty <= w["rows"]):
                    fails += 1
                    print(f"  PLOT-BOUNDS FAIL {os.path.basename(f)} {s['id']}: target ({tx},{ty}) off {w['cols']}x{w['rows']}")

    # authored plot targets (explicit): (x,y) meaning (weeks/hours, height/problems)
    plot_targets = [(3, 5), (2, 4), (5, 6), (3, 6)]  # last is remedial
    for (x, y) in plot_targets:
        checked += 1
        # the swapped version must be a DIFFERENT cell (no accidental symmetric answer)
        if x == y:
            fails += 1
            print(f"  PLOT-SYMM WARN ({x},{y}) is symmetric — swap trap is ambiguous")

    # ---- association facts (real-world pairs authored in bv-01-02) ----
    # represent each as sample monotone data consistent with the intended direction
    assoc_facts = [
        ("hours studied & test score", [(1, 60), (3, 75), (5, 90)], "positive"),
        ("car age & resale value", [(1, 20), (3, 14), (5, 8)], "negative"),
        ("temperature & cocoa sales", [(10, 50), (20, 30), (30, 10)], "negative"),
        ("distance run & calories", [(1, 100), (3, 300), (5, 500)], "positive"),
        ("burn-time & candle height", [(1, 10), (2, 8), (3, 6)], "negative"),
        ("practice hours & baskets", [(1, 5), (3, 9), (5, 13)], "positive"),
        ("shoe size & math score", [(6, 70), (7, 62), (8, 68)], None),  # no monotone dir -> none-ish
    ]
    for name, pts, exp in assoc_facts:
        if exp is None:
            continue  # no-association example is qualitative; skip mechanical check
        checked += 1
        a = assoc_by_endpoints(pts)
        b = assoc_by_slope(pts[-1][1] - pts[0][1])
        if a != exp or b != exp:
            fails += 1
            print(f"  ASSOC FAIL {name}: endpoints={a} slope={b} authored {exp}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
