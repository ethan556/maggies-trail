#!/usr/bin/env python3
"""Independent re-derivation of exponents-scientific-notation Chapter 2
(Square & Cube Roots), 8.EE.2.

SELF-TESTED dual-route for "does x solve x^2=p" / "does x solve x^3=p":
  Route A (direct exponentiation): x**2 == p, x**3 == p.
  Route B (independent factorization-style route): for squares, walk k from 0 upward
  computing a running sum of consecutive odd numbers (1+3+5+...) -- the classic fact
  that the sum of the first n odd numbers is n^2 -- to independently recover which k
  satisfies k^2=p, then also test -k. For cubes, use math.isqrt-free integer search via
  binary search on the cube function (monotonic, so binary search is a legitimate
  independent algorithm) rather than direct exponentiation.
Both routes are cross-checked to agree for every p a perfect square/cube from 1..400
before trusting either against authored content.
"""
import sys


def square_roots_via_odd_sum(p):
    """Recover k such that k^2=p by summing consecutive odd numbers (independent of **)."""
    total = 0
    k = 0
    while total < p:
        k += 1
        total += 2 * k - 1  # k-th odd number
    if total == p:
        return (k, -k)
    return None


def cube_root_via_binary_search(p):
    """Recover k such that k^3=p via binary search on the monotonic cube function
    (independent of direct exponentiation as a 'guess the rule' route)."""
    sign = 1 if p >= 0 else -1
    ap = abs(p)
    lo, hi = 0, max(1, ap)
    while lo < hi:
        mid = (lo + hi) // 2
        if mid ** 3 < ap:
            lo = mid + 1
        else:
            hi = mid
    k = sign * lo
    return k if k ** 3 == p else None


def _selftest():
    mismatches = 0
    for n in range(1, 21):
        p = n * n
        route_a = (n, -n) if n * n == p else None
        route_b = square_roots_via_odd_sum(p)
        if route_a != route_b:
            mismatches += 1
            print(f"  SQUARE MISMATCH p={p}: direct={route_a} odd-sum={route_b}")
    for n in range(-10, 11):
        p = n ** 3
        route_a = n
        route_b = cube_root_via_binary_search(p)
        if route_a != route_b:
            mismatches += 1
            print(f"  CUBE MISMATCH p={p}: direct={route_a} binary-search={route_b}")
    assert mismatches == 0, f"{mismatches} mismatches"
    print("  self-test: direct exponentiation vs odd-sum (squares) / binary-search (cubes) agree")


# (p, expected solutions) for x^2=p, drawn from authored mcq content
SQUARE_FACTS = {25: (5, -5), 49: (7, -7), 64: (8, -8), 100: (10, -10), 36: (6, -6), 121: (11, -11), 9: (3, -3)}
# (p, expected single solution) for x^3=p, drawn from authored mcq content
CUBE_FACTS = {27: 3, -8: -2, -27: -3, 125: 5, -125: -5, 8: 2, 64: 4}
# context word-problems: (p, dimension) -> expected positive root
CONTEXT_FACTS = {(36, 2): 6, (27, 3): 3, (144, 2): 12, (64, 3): 4, (100, 2): 10, (216, 3): 6, (49, 2): 7}


def main():
    _selftest()
    fails = checked = 0

    for p, expect in SQUARE_FACTS.items():
        checked += 1
        got = square_roots_via_odd_sum(p)
        if got != expect:
            fails += 1
            print(f"  SQUARE FAIL x^2={p}: computed {got}, authored claims {expect}")

    for p, expect in CUBE_FACTS.items():
        checked += 1
        got = cube_root_via_binary_search(p)
        if got != expect:
            fails += 1
            print(f"  CUBE FAIL x^3={p}: computed {got}, authored claims {expect}")

    for (p, dim), expect_root in CONTEXT_FACTS.items():
        checked += 1
        if dim == 2:
            got = square_roots_via_odd_sum(p)
            root = got[0] if got else None
        else:
            root = cube_root_via_binary_search(p)
        if root != expect_root:
            fails += 1
            print(f"  CONTEXT FAIL dim={dim} p={p}: computed root {root}, authored claims {expect_root}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
