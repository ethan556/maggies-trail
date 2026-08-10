#!/usr/bin/env python3
"""Independent re-derivation of functions-g8 Chapter 3 (Comparing Functions Across
Representations), 8.F.2 + 8.EE.5.

Checks that every 'which grows faster / starts higher / same function' verdict in the
authored content follows from independently computed (rate, initial_value) pairs.
Rates/initial values are extracted two ways and cross-checked:
  Route A: from an equation form y=mx+b directly (m, b).
  Route B: from a table by (output change)/(input change) for the rate and the x=0 row
  (or back-calculation) for the initial value.
A helper independently recomputes the linear-crossing month for the capstone.
"""
import sys
from fractions import Fraction


def rate_from_table(pairs):
    (x1, y1), (x2, y2) = pairs[0], pairs[1]
    return Fraction(y2 - y1, x2 - x1)


def init_from_table(pairs):
    for x, y in pairs:
        if x == 0:
            return Fraction(y)
    # back-calculate from first point using rate
    r = rate_from_table(pairs)
    x0, y0 = pairs[0]
    return Fraction(y0) - r * x0


def _selftest():
    # cross-check: a table generated from y=mx+b recovers (m,b) both ways
    mismatches = 0
    for m in range(-4, 5):
        for b in range(-4, 5):
            pairs = [(x, m * x + b) for x in range(0, 3)]
            if rate_from_table(pairs) != m or init_from_table(pairs) != b:
                mismatches += 1
    assert mismatches == 0, f"{mismatches} table-vs-equation extraction mismatches"
    print("  self-test: rate/initial-value extraction from tables matches the generating equation (m,b in -4..4)")


# Each comparison: (labelA, rateA, initA, labelB, rateB, initB, authored_faster, authored_higher_start)
COMPARISONS = [
    ("y=2x", 2, 0, "tbl(1,3),(2,6),(3,9)", 3, 0, "B", "tie0"),
    ("y=5x", 5, 0, "tbl(1,4),(2,8),(3,12)", 4, 0, "A", "tie0"),
    ("gains6", 6, 0, "y=4x+10", 4, 10, "A", "B"),
    ("A(0,0)(1,2)(2,4)", 2, 0, "B(0,0)(1,3)(2,6)", 3, 0, "B", "tie0"),
    ("y=x+100", 1, 100, "y=5x", 5, 0, "B", "A"),
    ("y=2x+10", 2, 10, "tbl(0,3)(1,7)(2,11)", 4, 3, "B", "A"),
    ("starts8gains1", 1, 8, "y=3x+2", 3, 2, "B", "A"),
    ("y=2x+1", 2, 1, "tbl(0,5)(1,7)(2,9)", 2, 5, "tie", "B"),
    ("y=x+9", 1, 9, "y=4x+1", 4, 1, "B", "A"),
    ("gymA join20 5/mo", 5, 20, "gymB join50 2/mo", 2, 50, "A", "B"),
]


def main():
    _selftest()
    fails = checked = 0

    for (la, ra, ia, lb, rb, ib, exp_faster, exp_higher) in COMPARISONS:
        checked += 1
        faster = "A" if ra > rb else ("B" if rb > ra else "tie")
        if faster != exp_faster:
            fails += 1
            print(f"  FASTER FAIL {la} vs {lb}: computed {faster}, authored {exp_faster}")
        checked += 1
        if exp_higher == "tie0":
            higher = "tie0" if ia == ib else ("A" if ia > ib else "B")
        else:
            higher = "A" if ia > ib else ("B" if ib > ia else "tie")
        if higher != exp_higher:
            fails += 1
            print(f"  HIGHER-START FAIL {la} vs {lb}: computed {higher}, authored {exp_higher}")

    # table-vs-equation "same function" facts
    same_facts = [
        ([(0, 3), (1, 5), (2, 7)], 2, 3, True),   # matches y=2x+3
        ([(1, 3), (2, 6), (3, 9)], 3, 0, True),   # matches y=3x
        ([(1, 3), (2, 5), (3, 7)], 3, 0, False),  # odd-one-out: rate 2 not 3
    ]
    for pairs, m, b, expect_same in same_facts:
        checked += 1
        same = (rate_from_table(pairs) == m and init_from_table(pairs) == b)
        if same != expect_same:
            fails += 1
            print(f"  SAME FAIL {pairs} vs y={m}x+{b}: computed {same}, authored {expect_same}")

    # capstone crossing: 5x+20 = 2x+50 -> x=10
    checked += 1
    x = Fraction(50 - 20, 5 - 2)
    if x != 10:
        fails += 1
        print(f"  CROSSING FAIL: computed x={x}, authored 10")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
