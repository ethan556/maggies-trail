#!/usr/bin/env python3
"""Independent re-derivation of exponents-scientific-notation Chapter 1
(Powers of Ten), 8.EE.1 restricted to base 10.

SELF-TESTED dual-route for 10^a * 10^b = 10^(a+b) and 10^a / 10^b = 10^(a-b):
  Route A (the CCSS-taught RULE, exact integer arithmetic): just add/subtract the
  integer exponents.
  Route B (independent route): compute the actual VALUES as Python Fractions
  (10**a as Fraction(10)**a, which handles negative exponents exactly, no floating
  point at all) and derive the resulting exponent from the value itself, by
  repeatedly dividing/multiplying by 10 -- a totally different mechanical process
  from "just add the exponents." Self-tested to agree for every a,b in -10..10.
"""
import json, glob, re, sys
from fractions import Fraction


def exponent_of_exact_fraction_power_of_ten(f: Fraction) -> int:
    """Given f known to equal exactly 10**k for some integer k, recover k by
    repeated multiplication/division -- independent of any 'add the exponents' logic."""
    if f == 1:
        return 0
    k = 0
    if f > 1:
        while f != 1:
            f /= 10
            k += 1
    else:
        while f != 1:
            f *= 10
            k -= 1
    return k


def rule_multiply(a, b):
    return a + b


def rule_divide(a, b):
    return a - b


def _selftest():
    mismatches = 0
    for a in range(-10, 11):
        for b in range(-10, 11):
            # multiply
            product = Fraction(10) ** a * Fraction(10) ** b
            derived = exponent_of_exact_fraction_power_of_ten(product)
            if derived != rule_multiply(a, b):
                mismatches += 1
                print(f"  MUL MISMATCH a={a} b={b}: rule={rule_multiply(a,b)} derived={derived}")
            # divide
            quotient = Fraction(10) ** a / Fraction(10) ** b
            derived_d = exponent_of_exact_fraction_power_of_ten(quotient)
            if derived_d != rule_divide(a, b):
                mismatches += 1
                print(f"  DIV MISMATCH a={a} b={b}: rule={rule_divide(a,b)} derived={derived_d}")
    assert mismatches == 0, f"{mismatches} mismatches between exponent-rule and exact-Fraction-derived routes"
    print("  self-test: exponent add/subtract rule vs exact-Fraction value derivation agree (a,b = -10..10)")


# (value, expected exponent) drawn from authored content, checked via exact Fraction power
EVAL_FACTS = {
    5: 100000, -4: Fraction(1, 10000), 0: 1, -2: Fraction(1, 100), 7: 10000000, -5: Fraction(1, 100000), 3: 1000,
}

# (a, op, b, expected result exponent) drawn from authored numeric widgets
ARITH_FACTS = [
    (4, "*", 3, 7), (6, "/", 2, 4), (3, "*", -5, -2), (-2, "/", 3, -5), (3, "/", -2, 5),
    (-3, "*", -4, -7), (5, "*", -8, -3),  # intermediate step of the challenge (before /10^-2)
]

# place-value facts: (digit, exponent, expected decimal value)
PLACE_FACTS = [
    (4, 3, 4000), (7, -3, Fraction(7, 1000)), (6, 4, 60000), (9, -2, Fraction(9, 100)),
    (5, 6, 5000000), (3, 2, 300),
]


def main():
    _selftest()
    fails = checked = 0

    for n, expect_val in EVAL_FACTS.items():
        checked += 1
        computed = Fraction(10) ** n
        if computed != Fraction(expect_val):
            fails += 1
            print(f"  EVAL FAIL 10^{n}: computed {computed}, authored claims {expect_val}")

    for a, op, b, expect_exp in ARITH_FACTS:
        checked += 1
        result_exp = rule_multiply(a, b) if op == "*" else rule_divide(a, b)
        if result_exp != expect_exp:
            fails += 1
            print(f"  ARITH FAIL 10^{a} {op} 10^{b}: computed exponent {result_exp}, authored claims {expect_exp}")
        # cross-check with the independent Fraction-derivation route too
        val = Fraction(10) ** a * Fraction(10) ** b if op == "*" else Fraction(10) ** a / Fraction(10) ** b
        derived = exponent_of_exact_fraction_power_of_ten(val)
        if derived != expect_exp:
            fails += 1
            print(f"  ARITH FAIL (Fraction route) 10^{a} {op} 10^{b}: derived {derived}, authored claims {expect_exp}")

    for digit, exp, expect_val in PLACE_FACTS:
        checked += 1
        computed = digit * Fraction(10) ** exp
        if computed != Fraction(expect_val):
            fails += 1
            print(f"  PLACE FAIL {digit}x10^{exp}: computed {computed}, authored claims {expect_val}")

    # the full 3-step challenge in esn-01-02: 10^5 * 10^-8 / 10^-2
    checked += 1
    val = Fraction(10) ** 5 * Fraction(10) ** -8 / Fraction(10) ** -2
    exp = exponent_of_exact_fraction_power_of_ten(val)
    if exp != -1:
        fails += 1
        print(f"  CHALLENGE FAIL 10^5 * 10^-8 / 10^-2: derived exponent {exp}, authored claims -1")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
