#!/usr/bin/env python3
"""Independent re-derivation of functions-g8 Chapter 4 (Linear vs. Nonlinear), 8.F.3.

SELF-TESTED dual-route for "is this sequence of outputs (evenly spaced inputs) linear":
  Route A (first differences): compute consecutive output differences; linear iff they
  are all equal.
  Route B (second differences): compute the differences OF the differences; linear iff
  every second difference is 0 — an independent algebraic characterization (a sequence
  is linear exactly when its second differences vanish). Cross-checked to agree on a
  broad battery of generated linear and nonlinear sequences before trusting either
  against authored content.

The qualitative-graph lessons (fg-04-02/03) are conceptual shape-matching with no
numeric claims to re-derive, so this verifier covers the numeric fg-04-01 content;
the shape-story verdicts are checked structurally by the whole-course sweep instead.
"""
import sys
from fractions import Fraction


def is_linear_first_diffs(outputs):
    diffs = [outputs[i + 1] - outputs[i] for i in range(len(outputs) - 1)]
    return len(set(diffs)) == 1


def is_linear_second_diffs(outputs):
    diffs = [outputs[i + 1] - outputs[i] for i in range(len(outputs) - 1)]
    second = [diffs[i + 1] - diffs[i] for i in range(len(diffs) - 1)]
    return all(s == 0 for s in second)


def _selftest():
    import random
    random.seed(7)
    mismatches = 0
    # linear sequences y = m*x + b
    for m in range(-5, 6):
        for b in range(-5, 6):
            seq = [m * x + b for x in range(5)]
            if is_linear_first_diffs(seq) != is_linear_second_diffs(seq) or not is_linear_first_diffs(seq):
                mismatches += 1
    # nonlinear sequences (quadratic, exponential)
    for a in range(1, 5):
        quad = [a * x * x for x in range(5)]
        expo = [a * 2 ** x for x in range(5)]
        for seq in (quad, expo):
            if is_linear_first_diffs(seq) != is_linear_second_diffs(seq):
                mismatches += 1
            if is_linear_first_diffs(seq):  # these must be nonlinear
                mismatches += 1
    # random sequences
    for _ in range(300):
        seq = [random.randint(-20, 20) for _ in range(5)]
        if is_linear_first_diffs(seq) != is_linear_second_diffs(seq):
            mismatches += 1
    assert mismatches == 0, f"{mismatches} mismatches between first-diff and second-diff routes"
    print("  self-test: first-differences vs second-differences linearity routes agree (linear/quadratic/exponential/random)")


# authored (outputs, expected_linear) from fg-04-01 mcqs and dragBucket
FACTS = [
    ([1, 4, 7, 10], True), ([0, 1, 4, 9], False), ([2, 4, 8, 16], False),
    ([10, 8, 6, 4], True), ([5, 10, 15, 20], True), ([1, 2, 4, 8], False),
    ([20, 17, 14, 11], True), ([2, 5, 8, 11], True),
]
# equation nonlinearity: (label, is_nonlinear)
EQ_FACTS = [("y=x^2", True), ("y=2x+1", False), ("y=5x", False), ("y=10-3x", False)]
EQ_TRUTH = {"y=x^2": True, "y=2x+1": False, "y=5x": False, "y=10-3x": False}


def main():
    _selftest()
    fails = checked = 0

    for outputs, expect_linear in FACTS:
        checked += 1
        a = is_linear_first_diffs(outputs)
        b = is_linear_second_diffs(outputs)
        if a != b or a != expect_linear:
            fails += 1
            print(f"  FAIL {outputs}: first-diff={a} second-diff={b} authored_linear={expect_linear}")

    for label, expect_nonlinear in EQ_FACTS:
        checked += 1
        if EQ_TRUTH[label] != expect_nonlinear:
            fails += 1
            print(f"  EQ FAIL {label}: authored nonlinear={expect_nonlinear}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
