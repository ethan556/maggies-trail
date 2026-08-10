#!/usr/bin/env python3
"""Independent re-derivation of exponents-scientific-notation Chapter 4
(Computing in Scientific Notation), 8.EE.4.

SELF-TESTED dual-route for multiply/divide/add/subtract in scientific notation:
  Route A (the CCSS-taught RULE): manipulate (coefficient, exponent) pairs directly
  per the taught rules (multiply/add exponents, divide/subtract exponents, match
  exponents before add/subtract), with explicit renormalization.
  Route B (independent route): convert both operands to plain floats, do the
  arithmetic with ordinary float operations, then re-derive the scientific-notation
  form of the RESULT from scratch (repeated /10 or *10 until in [1,10)) -- a totally
  different mechanical path that never manipulates exponents symbolically at all.
Self-tested to agree across a wide, varied sweep before trusting either route
against authored content.
"""
import sys, random


def sci_to_float(c, e):
    return c * (10.0 ** e)


def float_to_sci(x):
    if x == 0:
        return (0.0, 0)
    sign = 1 if x > 0 else -1
    x = abs(x)
    n = 0
    while x >= 10:
        x /= 10
        n += 1
    while x < 1:
        x *= 10
        n -= 1
    return (round(sign * x, 6), n)


def rule_multiply(ac, ae, bc, be):
    c, e = ac * bc, ae + be
    while c >= 10:
        c /= 10
        e += 1
    while c < 1:
        c *= 10
        e -= 1
    return (round(c, 6), e)


def rule_divide(ac, ae, bc, be):
    c, e = ac / bc, ae - be
    while c >= 10:
        c /= 10
        e += 1
    while c < 1:
        c *= 10
        e -= 1
    return (round(c, 6), e)


def rule_add(ac, ae, bc, be):
    b_conv = bc * 10 ** (be - ae)
    c, e = ac + b_conv, ae
    while c >= 10:
        c /= 10
        e += 1
    return (round(c, 6), e)


def rule_subtract(ac, ae, bc, be):
    b_conv = bc * 10 ** (be - ae)
    c, e = ac - b_conv, ae
    if c == 0:
        return (0.0, 0)
    sign = 1 if c > 0 else -1
    c = abs(c)
    while c >= 10:
        c /= 10
        e += 1
    while c < 1:
        c *= 10
        e -= 1
    return (round(sign * c, 6), e)


def _selftest():
    random.seed(42)
    mismatches = 0
    for _ in range(500):
        ac, bc = round(random.uniform(1, 9.99), 2), round(random.uniform(1, 9.99), 2)
        ae, be = random.randint(-8, 8), random.randint(-8, 8)
        for op, rule_fn in [("*", rule_multiply), ("/", rule_divide), ("+", rule_add), ("-", rule_subtract)]:
            rule_c, rule_e = rule_fn(ac, ae, bc, be)
            a_val, b_val = sci_to_float(ac, ae), sci_to_float(bc, be)
            if op == "*":
                raw = a_val * b_val
            elif op == "/":
                raw = a_val / b_val
            elif op == "+":
                raw = a_val + b_val
            else:
                raw = a_val - b_val
                if abs(raw) < 1e-300:
                    continue  # skip near-zero subtraction edge cases
            float_c, float_e = float_to_sci(raw)
            if abs(rule_c - float_c) > 1e-3 or rule_e != float_e:
                mismatches += 1
                if mismatches <= 5:
                    print(f"  MISMATCH {op}: ({ac}e{ae}) {op} ({bc}e{be}) rule=({rule_c}e{rule_e}) float=({float_c}e{float_e})")
    assert mismatches == 0, f"{mismatches} mismatches between symbolic-rule and float-recompute routes"
    print("  self-test: symbolic scientific-notation rules vs. float-recompute-from-scratch agree (500 random cases)")


# (op, ac, ae, bc, be, expected_c, expected_e) drawn from authored mcq content
FACTS = [
    ("*", 3, 4, 2, 3, 6, 7), ("*", 4, 5, 3, 6, 1.2, 12), ("/", 6, 5, 2, 2, 3, 3),
    ("*", 8, 7, 5, 3, 4, 11), ("/", 3, 5, 6, 8, 5, -4), ("*", 7, 6, 6, 4, 4.2, 11),
    ("*", 2, 3, 4, 2, 8, 5),
    ("+", 2.5, 4, 3, 3, 2.8, 4), ("-", 5, 6, 2, 5, 4.8, 6), ("-", 6, 5, 4, 4, 5.6, 5),
    ("+", 1, 6, 5, 4, 1.05, 6), ("+", 3, 5, 4, 5, 7, 5), ("-", 9, 7, 4, 7, 5, 7),
    ("-", 2, 7, 6, 6, 1.4, 7), ("+", 3, 4, 5, 3, 3.5, 4),
    # context problems
    ("*", 3, 4, 2, 2, 6, 6), ("/", 3, 8, 6, 4, 5, 3), ("+", 2, 6, 5, 5, 2.5, 6),
    ("*", 4, 3, 5, 2, 2, 6), ("-", 8, 6, 3, 5, 7.7, 6), ("*", 2, 3, 4, 2, 8, 5),
]

RULE_FNS = {"*": rule_multiply, "/": rule_divide, "+": rule_add, "-": rule_subtract}


def main():
    _selftest()
    fails = checked = 0

    for op, ac, ae, bc, be, exp_c, exp_e in FACTS:
        checked += 1
        rule_c, rule_e = RULE_FNS[op](ac, ae, bc, be)
        if abs(rule_c - exp_c) > 1e-6 or rule_e != exp_e:
            fails += 1
            print(f"  RULE FAIL {ac}e{ae} {op} {bc}e{be}: computed {rule_c}e{rule_e}, authored claims {exp_c}e{exp_e}")

        # independent float route
        a_val, b_val = sci_to_float(ac, ae), sci_to_float(bc, be)
        if op == "*":
            raw = a_val * b_val
        elif op == "/":
            raw = a_val / b_val
        elif op == "+":
            raw = a_val + b_val
        else:
            raw = a_val - b_val
        float_c, float_e = float_to_sci(raw)
        if abs(float_c - exp_c) > 1e-3 or float_e != exp_e:
            fails += 1
            print(f"  FLOAT-ROUTE FAIL {ac}e{ae} {op} {bc}e{be}: computed {float_c}e{float_e}, authored claims {exp_c}e{exp_e}")

    # multi-step challenge: (2e4 * 3e3) - 4e6
    checked += 1
    prod_c, prod_e = rule_multiply(2, 4, 3, 3)
    final_c, final_e = rule_subtract(prod_c, prod_e, 4, 6)
    if abs(final_c - 5.6) > 1e-6 or final_e != 7:
        fails += 1
        print(f"  MULTISTEP FAIL: computed {final_c}e{final_e}, expected 5.6e7")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
