#!/usr/bin/env python3
"""Independent re-derivation of exponents-scientific-notation Chapter 3
(Scientific Notation), 8.EE.3.

SELF-TESTED dual-route for "convert x to scientific notation a * 10^n":
  Route A (string-based, on the decimal representation): find the position of the
  first nonzero digit relative to the decimal point by manipulating the number's
  string form.
  Route B (independent, purely numeric): repeatedly divide/multiply by 10 (float
  arithmetic) until the value lands in [1, 10) -- a completely different mechanical
  process from string inspection. Cross-checked to agree for a wide sweep of values
  before trusting either against authored content.
"""
import sys


def sci_notation_via_string(x: float):
    """Route A: derive (coefficient, exponent) by inspecting the plain-decimal string."""
    s = f"{x:.15f}".rstrip("0")
    if "." not in s:
        s += "."
    int_part, frac_part = s.split(".")
    if int_part != "0" and int_part != "":
        # large number: exponent = len(int_part) - 1
        n = len(int_part) - 1
        digits = (int_part + frac_part).lstrip("0") or "0"
        coeff = float(digits[0] + "." + digits[1:].rstrip("0")) if len(digits) > 1 else float(digits[0])
        return (round(coeff, 10), n)
    else:
        # small number: count leading zeros in frac_part
        stripped = frac_part.lstrip("0")
        leading_zeros = len(frac_part) - len(stripped)
        n = -(leading_zeros + 1)
        digits = stripped or "0"
        coeff = float(digits[0] + "." + digits[1:].rstrip("0")) if len(digits) > 1 else float(digits[0])
        return (round(coeff, 10), n)


def sci_notation_via_repeated_division(x: float):
    """Route B: repeatedly /10 or *10 until landing in [1, 10) -- independent of string parsing."""
    if x == 0:
        return (0.0, 0)
    n = 0
    v = x
    while v >= 10:
        v /= 10
        n += 1
    while v < 1:
        v *= 10
        n -= 1
    return (round(v, 10), n)


def _selftest():
    mismatches = 0
    test_values = [45000, 320000000, 7000, 8200000, 9300000, 4500000, 1000000000,
                   0.00032, 0.0056, 0.000000091, 0.00061, 0.0000002, 0.00000003,
                   0.05, 0.008, 4.7e-05, 610000]
    for x in test_values:
        a = sci_notation_via_string(x)
        b = sci_notation_via_repeated_division(x)
        if abs(a[0] - b[0]) > 1e-6 or a[1] != b[1]:
            mismatches += 1
            print(f"  MISMATCH x={x}: string-route={a} division-route={b}")
    assert mismatches == 0, f"{mismatches} mismatches between string-parsing and repeated-division routes"
    print("  self-test: string-parsing vs repeated-division scientific-notation routes agree")


# (x, expected coefficient, expected exponent) drawn from authored mcq/numeric content
CONVERSIONS = [
    (320000000, 3.2, 8), (7000, 7, 3), (610000 / 610000 * 610000, 6.1, 5),  # 6.1e5 -> 610000
    (8200000, 8.2, 6), (9300000, 9.3, 6), (4500000, 4.5, 6), (1000000000, 1, 9),
    (0.0056, 5.6, -3), (0.000000091, 9.1, -8), (0.00061, 6.1, -4),
    (0.0000002, 2, -7), (0.00000003, 3, -8), (0.05, 5, -2), (0.008, 8, -3),
    (0.000047, 4.7, -5), (50000, 5, 4),
]

# "how many times as much" facts: (a_coeff, a_exp, b_coeff, b_exp, expected ratio)
RATIO_FACTS = [
    (6, 8, 3, 5, 2000), (4, 7, 8, 4, 500), (5, 6, 2, 6, 2.5),
]

# exponent-comparison facts: (a_coeff,a_exp,b_coeff,b_exp,expected_bigger) where expected_bigger in {"a","b"}
COMPARE_FACTS = [
    (9, 4, 2, 5, "b"), (3.1, 6, 7.5, 6, "b"), (4, 3, 2, 4, "b"),
]


def main():
    _selftest()
    fails = checked = 0

    for x, exp_coeff, exp_exp in CONVERSIONS:
        checked += 1
        coeff, exp = sci_notation_via_repeated_division(x)
        if abs(coeff - exp_coeff) > 1e-6 or exp != exp_exp:
            fails += 1
            print(f"  CONVERT FAIL x={x}: computed {coeff}x10^{exp}, authored claims {exp_coeff}x10^{exp_exp}")

    for ac, ae, bc, be, expect_ratio in RATIO_FACTS:
        checked += 1
        ratio = (ac * 10 ** ae) / (bc * 10 ** be)
        if abs(ratio - expect_ratio) > 1e-6:
            fails += 1
            print(f"  RATIO FAIL ({ac}e{ae})/({bc}e{be}): computed {ratio}, authored claims {expect_ratio}")

    for ac, ae, bc, be, expect in COMPARE_FACTS:
        checked += 1
        a_val, b_val = ac * 10 ** ae, bc * 10 ** be
        bigger = "a" if a_val > b_val else "b"
        if bigger != expect:
            fails += 1
            print(f"  COMPARE FAIL {ac}e{ae} vs {bc}e{be}: computed bigger={bigger}, authored claims {expect}")

    # dragOrder check: b(3e5) < a(2.5e6) < d(9e6) < c(1.8e7)
    checked += 1
    vals = {"b": 3e5, "a": 2.5e6, "d": 9e6, "c": 1.8e7}
    order = ["b", "a", "d", "c"]
    decimals = [vals[k] for k in order]
    if decimals != sorted(decimals):
        fails += 1
        print(f"  ORDER FAIL: {order} -> {decimals} not ascending")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
