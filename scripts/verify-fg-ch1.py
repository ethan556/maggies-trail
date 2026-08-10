#!/usr/bin/env python3
"""Independent re-derivation of functions-g8 Chapter 1 (What Is a Function), 8.F.1.

SELF-TESTED dual-route for "is this set of (input,output) pairs a function":
  Route A (input-uniqueness via dict): build a dict input->output; a pair whose input
  is already present with a DIFFERENT output means not-a-function.
  Route B (independent, grouping-based): group all outputs by input using a
  collections-style bucket, then check that every input's output-set has size exactly 1.
These are genuinely different mechanical checks (early-exit dict-build vs. full
group-then-count) and are cross-checked to agree on an exhaustive battery of
generated pair-sets before trusting either against authored content.
"""
import json, glob, re, sys


def is_function_dict(pairs):
    seen = {}
    for x, y in pairs:
        if x in seen and seen[x] != y:
            return False
        seen[x] = y
    return True


def is_function_grouping(pairs):
    groups = {}
    for x, y in pairs:
        groups.setdefault(x, set()).add(y)
    return all(len(ys) == 1 for ys in groups.values())


def _selftest():
    import itertools
    mismatches = 0
    # exhaustive-ish: all pair-sets of size 3 over inputs {1,2} outputs {1,2,3}
    inputs, outputs = [1, 2], [1, 2, 3]
    all_pairs = [(x, y) for x in inputs for y in outputs]
    for combo in itertools.combinations(all_pairs, 3):
        a = is_function_dict(list(combo))
        b = is_function_grouping(list(combo))
        if a != b:
            mismatches += 1
            print(f"  MISMATCH {combo}: dict={a} grouping={b}")
    assert mismatches == 0, f"{mismatches} mismatches between dict and grouping routes"
    print("  self-test: dict-uniqueness vs group-then-count function detection agree (exhaustive size-3)")


# authored pair-sets with expected function/not verdict, drawn from mcq/dragBucket content
AUTHORED = {
    "(1,5),(2,7),(3,9)": (True, [(1, 5), (2, 7), (3, 9)]),
    "(4,1),(5,3),(4,9)": (False, [(4, 1), (5, 3), (4, 9)]),
    "(1,8),(2,8),(3,8)": (True, [(1, 8), (2, 8), (3, 8)]),
    "table 1,2,3,2 -> 4,5,6,8": (False, [(1, 4), (2, 5), (3, 6), (2, 8)]),
    "(2,1),(4,1),(6,1)": (True, [(2, 1), (4, 1), (6, 1)]),
    "(3,1),(5,4),(3,2)": (False, [(3, 1), (5, 4), (3, 2)]),
    # dragBucket t1..t5 from fg-01-02
    "(1,3),(2,3),(3,3)": (True, [(1, 3), (2, 3), (3, 3)]),
    "(5,1),(5,2),(6,3)": (False, [(5, 1), (5, 2), (6, 3)]),
    "(0,0),(1,1),(2,4)": (True, [(0, 0), (1, 1), (2, 4)]),
    "(7,8),(8,7),(7,9)": (False, [(7, 8), (8, 7), (7, 9)]),
    "(2,5),(4,5),(6,5)": (True, [(2, 5), (4, 5), (6, 5)]),
}


def main():
    _selftest()
    fails = checked = 0
    for label, (expect, pairs) in AUTHORED.items():
        checked += 1
        a = is_function_dict(pairs)
        b = is_function_grouping(pairs)
        if a != b or a != expect:
            fails += 1
            print(f"  FAIL {label}: dict={a} grouping={b} authored_expects={expect}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
