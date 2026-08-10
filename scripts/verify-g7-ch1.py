#!/usr/bin/env python3
"""Independent re-derivation of geometry-g7 Chapter 1 (Scale Drawings), 7.G.1.

SELF-TESTED dual-route:
  Route A (rate arithmetic): real = drawing * k; drawing = real / k; real_area computed by
    converting each side then multiplying.
  Route B (repeated-addition / unit-square tiling): real length rebuilt by summing k for
    each drawing cm (integer cases); drawing length rebuilt by counting how many k's fit in
    the real length; real area rebuilt by tiling — count drawing unit squares, each worth
    k*k. Both routes must agree; cross-checked over a grid first.
"""
import sys
from fractions import Fraction as F


def real_A(draw, k):
    return draw * k


def draw_A(real, k):
    return F(real, k)


def area_A(w, h, k):
    return (w * k) * (h * k)


def real_B(draw, k):
    total = 0
    for _ in range(draw):
        total += k
    return total


def draw_B(real, k):
    count = 0
    left = real
    while left >= k:
        left -= k
        count += 1
    return count if left == 0 else None


def area_B(w, h, k):
    per_square = k * k
    squares = 0
    for _ in range(w):
        for _ in range(h):
            squares += 1
    return squares * per_square


def _selftest():
    mism = 0
    for k in range(1, 8):
        for d in range(1, 12):
            if real_A(d, k) != real_B(d, k):
                mism += 1
            r = d * k
            if draw_A(r, k) != draw_B(r, k):
                mism += 1
        for w in range(1, 7):
            for h in range(1, 7):
                if area_A(w, h, k) != area_B(w, h, k):
                    mism += 1
    assert mism == 0, f"{mism} mismatches"
    print("  self-test: rate arithmetic vs repeated-addition/tiling agree (k,d,w,h grids)")


def main():
    _selftest()
    fails = checked = 0

    # drawing -> real: (draw_cm, k, expected_m)
    for d, k, e in [(3, 4, 12), (5, 4, 20), (3, 5, 15), (7, 3, 21), (6, 2, 12), (4, 2, 8), (9, 2, 18), (2, 4, 8)]:
        checked += 1
        if real_A(d, k) != e or real_B(d, k) != e:
            fails += 1
            print(f"  D2R FAIL {d}cm @1:{k}: {real_A(d,k)} vs {e}")

    # real -> drawing: (real_m, k, expected_cm)
    for r, k, e in [(20, 4, 5), (30, 5, 6), (14, 2, 7), (8, 2, 4), (12, 3, 4), (12, 4, 3), (8, 4, 2)]:
        checked += 1
        if draw_A(r, k) != e or draw_B(r, k) != e:
            fails += 1
            print(f"  R2D FAIL {r}m @1:{k}: {draw_A(r,k)} vs {e}")

    # areas: (w_cm, h_cm, k, expected_m2) + per-cm2 facts as 1x1
    for w, h, k, e in [(2, 3, 4, 96), (3, 5, 2, 60), (1, 1, 4, 16), (1, 1, 3, 9), (1, 1, 5, 25)]:
        checked += 1
        if area_A(w, h, k) != e or area_B(w, h, k) != e:
            fails += 1
            print(f"  AREA FAIL {w}x{h} @1:{k}: {area_A(w,h,k)} vs {e}")

    # spot-the-error fact: 5 cm^2 at k=4 -> 5*16=80 (not 20)
    checked += 1
    if 5 * (4 * 4) != 80 or 5 * 4 == 80:
        fails += 1

    # two-step: rooms 6cm vs 4cm at k=2 differ by 4 m; pool 12m + deck 8m at k=4 -> 5 cm
    checked += 1
    if (6 * 2 - 4 * 2) != 4:
        fails += 1
    checked += 1
    if draw_A(12 + 8, 4) != 5 or draw_B(20, 4) != 5:
        fails += 1

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
