#!/usr/bin/env python3
"""Independent re-derivation of linear-equations-systems Chapter 4 (Solving Systems by
Substitution), 8.EE.8b-c.

Each system here has one equation already isolated as y = m*x + k, and a second linear
equation p*x + q*y = r. SELF-TESTED dual-route for the solution:
  Route A (algebraic substitution): plug y = m*x + k into p*x + q*y = r, giving
  (p + q*m)*x = r - q*k, so x = (r - q*k)/(p + q*m), then y = m*x + k.
  Route B (independent Cramer-style / linear-algebra route): treat the two equations as
  the linear system  (-m)*x + 1*y = k  and  p*x + q*y = r,  and solve by the determinant
  method (Cramer's rule) — a genuinely different mechanical path than sequential
  substitution. Both are then confirmed by substituting the point back into BOTH original
  equations. Cross-checked to agree on a grid of generated systems before trusting either
  against authored content.
"""
import sys
from fractions import Fraction


def solve_substitution(m, k, p, q, r):
    """y = m x + k ; p x + q y = r  ->  substitution route."""
    denom = p + q * m
    assert denom != 0
    x = Fraction(r - q * k, denom)
    y = m * x + k
    return x, y


def solve_cramer(m, k, p, q, r):
    """Independent route: system  (-m)x + 1y = k ;  p x + q y = r  via Cramer's rule."""
    a1, b1, c1 = Fraction(-m), Fraction(1), Fraction(k)
    a2, b2, c2 = Fraction(p), Fraction(q), Fraction(r)
    det = a1 * b2 - a2 * b1
    assert det != 0
    x = (c1 * b2 - c2 * b1) / det
    y = (a1 * c2 - a2 * c1) / det
    return x, y


def verify(m, k, p, q, r, x, y):
    return (m * x + k == y) and (p * x + q * y == r)


def _selftest():
    mismatches = 0
    for m in range(-4, 5):
        for k in range(-4, 5):
            for p in range(-3, 4):
                for q in range(-3, 4):
                    for r in range(-4, 5):
                        if p + q * m == 0:
                            continue
                        xa, ya = solve_substitution(m, k, p, q, r)
                        xb, yb = solve_cramer(m, k, p, q, r)
                        if xa != xb or ya != yb or not verify(m, k, p, q, r, xa, ya):
                            mismatches += 1
                            if mismatches <= 5:
                                print(f"  MISMATCH y={m}x+{k}, {p}x+{q}y={r}: sub=({xa},{ya}) cramer=({xb},{yb})")
    assert mismatches == 0, f"{mismatches} mismatches between substitution and Cramer routes"
    print("  self-test: substitution vs Cramer-rule solving agree + substitution-verify (grid m,k,p,q,r)")


# authored systems: (m, k, p, q, r, expected_x, expected_y)
#   y = m x + k  and  p x + q y = r
FACTS = [
    (2, -1, 3, 1, 9, 2, 3),    # y=2x-1, 3x+y=9
    (1, 1, 1, 1, 7, 3, 4),     # y=x+1, x+y=7
    (3, 0, 2, 1, 10, 2, 6),    # y=3x, 2x+y=10
    (1, -2, 2, 1, 10, 4, 2),   # y=x-2, 2x+y=10
    (4, 0, 1, 1, 10, 2, 8),    # y=4x, x+y=10
    (2, 0, 1, 1, 9, 3, 6),     # y=2x, x+y=9
    (3, -5, 1, 1, 7, 3, 4),    # y=3x-5, x+y=7
    # real-world (Ch4 L3)
    (4, 0, 1, 1, 10, 2, 8),    # two numbers add to 10, larger=4x smaller
    (2, 0, 1, 1, 9, 3, 6),     # rope 9m, long=2x short
    (1, 1, 1, 1, 7, 3, 4),     # 7 tickets, adults = child+1
    (3, 2, 1, 1, 10, 2, 8),    # pen+book=$10, book=3x pen+2
]


def main():
    _selftest()
    fails = checked = 0
    for m, k, p, q, r, ex, ey in FACTS:
        checked += 1
        xa, ya = solve_substitution(m, k, p, q, r)
        xb, yb = solve_cramer(m, k, p, q, r)
        if xa != xb or ya != yb:
            fails += 1
            print(f"  ROUTE FAIL y={m}x+{k}, {p}x+{q}y={r}: sub=({xa},{ya}) cramer=({xb},{yb})")
        if xa != ex or ya != ey:
            fails += 1
            print(f"  VALUE FAIL y={m}x+{k}, {p}x+{q}y={r}: computed ({xa},{ya}), authored ({ex},{ey})")
        if not verify(m, k, p, q, r, xa, ya):
            fails += 1
            print(f"  VERIFY FAIL y={m}x+{k}, {p}x+{q}y={r}: ({xa},{ya}) fails a original equation")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
