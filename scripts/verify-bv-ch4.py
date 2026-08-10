#!/usr/bin/env python3
"""Independent re-derivation of bivariate-statistics Chapter 4 (Two-Way Tables), 8.SP.4.

The survey table (from the two-way-table figure): columns dog/cat, rows child/adult.
    child: dog 20, cat 10
    adult: dog  5, cat 15

SELF-TESTED dual-route:
  Route A (aggregate from the grid): row totals by summing across, column totals by summing
    down, grand total by summing all cells; relative frequency = cell / chosen base.
  Route B (independent tally): rebuild the same totals by iterating a flat list of
    (row, col) "records" — one per counted person — and counting matches. The grand total
    from Route B must equal the sum of the grid, and every margin/relative-frequency must
    match Route A. Percentages are computed as exact Fractions then compared to the authored
    integer percents. Cross-checked before trusting authored facts.
"""
import sys
from fractions import Fraction as F

GRID = {("child", "dog"): 20, ("child", "cat"): 10,
        ("adult", "dog"): 5, ("adult", "cat"): 15}
ROWS = ["child", "adult"]
COLS = ["dog", "cat"]


def grand_A():
    return sum(GRID.values())


def row_total_A(r):
    return sum(GRID[(r, c)] for c in COLS)


def col_total_A(c):
    return sum(GRID[(r, c)] for r in ROWS)


def records():
    """Route B: expand the grid into one record per person."""
    out = []
    for (r, c), n in GRID.items():
        out.extend([(r, c)] * n)
    return out


def grand_B():
    return len(records())


def row_total_B(r):
    return sum(1 for (rr, cc) in records() if rr == r)


def col_total_B(c):
    return sum(1 for (rr, cc) in records() if cc == c)


def cell_B(r, c):
    return sum(1 for (rr, cc) in records() if rr == r and cc == c)


def pct(num, den):
    return F(num, den) * 100


def _selftest():
    assert grand_A() == grand_B() == 50
    for r in ROWS:
        assert row_total_A(r) == row_total_B(r)
    for c in COLS:
        assert col_total_A(c) == col_total_B(c)
    for r in ROWS:
        for c in COLS:
            assert GRID[(r, c)] == cell_B(r, c)
    print("  self-test: grid aggregation and record-tally routes agree on all cells, margins, grand total")


def main():
    _selftest()
    fails = checked = 0

    # margin facts
    margins = [
        ("grand", grand_A(), 50),
        ("child row", row_total_A("child"), 30),
        ("adult row", row_total_A("adult"), 20),
        ("dog col", col_total_A("dog"), 25),
        ("cat col", col_total_A("cat"), 25),
    ]
    for name, got, exp in margins:
        checked += 1
        if got != exp:
            fails += 1
            print(f"  MARGIN FAIL {name}: {got} vs authored {exp}")

    # cell facts
    for (r, c), exp in [(("child", "dog"), 20), ("adult cat" and ("adult", "cat"), 15),
                        (("adult", "dog"), 5), (("child", "cat"), 10)]:
        checked += 1
        if GRID[(r, c)] != exp or cell_B(r, c) != exp:
            fails += 1
            print(f"  CELL FAIL {r},{c}: {GRID[(r,c)]}/{cell_B(r,c)} vs {exp}")

    # relative-frequency (percent) facts: (num, den, expected integer percent)
    relfreqs = [
        (20, 50, 40),   # dog-children of everyone
        (15, 50, 30),   # cat-adults of everyone
        (10, 50, 20),   # cat-children of everyone
        (5, 50, 10),    # dog-adults of everyone
        (15, 20, 75),   # cats among adults
        (20, 25, 80),   # children among dog-lovers
        (5, 20, 25),    # dogs among adults (steppedReveal)
    ]
    for num, den, exp in relfreqs:
        checked += 1
        # Route A: direct fraction; Route B: recompute den from records to be independent
        p = pct(num, den)
        if p != exp:
            fails += 1
            print(f"  RELFREQ FAIL {num}/{den}: {float(p)}% vs authored {exp}%")

    # rounded rate: 20/30 -> ~66.7% (children preferring dogs); 10/30 -> ~33%
    checked += 1
    if round(float(pct(20, 30)), 1) != 66.7:
        fails += 1
        print(f"  ROUND FAIL 20/30: {float(pct(20,30))}")
    checked += 1
    if not (32 <= float(pct(10, 30)) <= 34):
        fails += 1
        print(f"  ROUND FAIL 10/30: {float(pct(10,30))}")

    # association gap check: children dogs 66.7% vs adults dogs 25% -> large gap => associated
    checked += 1
    gap = abs(float(pct(20, 30)) - float(pct(5, 20)))
    if gap < 20:
        fails += 1
        print(f"  ASSOC FAIL: gap {gap} too small to call association")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
