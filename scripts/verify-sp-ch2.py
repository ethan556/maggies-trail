#!/usr/bin/env python3
"""Independent re-derivation of sampling-and-probability Chapter 2 (Comparing Two Populations).

7.SP.3-4: assess visual overlap of two distributions; use measures of center/variability to
draw comparative inferences. Operationalized as: (difference in means) / (given variability
measure) -- literally how "meaningfully different" gets quantified. SELF-TESTED dual-route:
direct division cross-checked against an ITERATIVE count of how many variability-units fit
into the gap between the two means -- two independent ways to the same ratio.
"""
import json, glob, re, sys
from fractions import Fraction as F


def gap_in_units_direct(mean_a, mean_b, unit):
    return F(abs(mean_a - mean_b), unit)


def gap_in_units_iterative(mean_a, mean_b, unit):
    """Route B: count whole units by repeated subtraction, then express any leftover
    as a fraction of one unit -- handles non-exact gaps honestly instead of assuming
    every real-world comparison divides evenly."""
    gap = abs(mean_a - mean_b)
    whole_units = 0
    remaining = F(gap)
    while remaining >= unit:
        remaining -= unit
        whole_units += 1
    return whole_units + F(remaining, unit)


def _selftest():
    cases = [(20, 8, 4), (15, 27, 3), (50, 65, 5), (12, 12, 2), (90, 66, 6)]
    for a, b, unit in cases:
        d1 = gap_in_units_direct(a, b, unit)
        d2 = gap_in_units_iterative(a, b, unit)
        assert d1 == d2, (a, b, unit, d1, d2)     # direct division vs iterative counting agree
    print("  self-test: population-comparison toolkit OK (direct division vs iterative counting agree)")


def parse_gap(prompt):
    m = re.search(r"mean of (\d+).{0,40}?mean of (\d+).{0,60}?variability .{0,20}?(\d+)", prompt.lower())
    if not m:
        return None
    a, b, unit = int(m.group(1)), int(m.group(2)), int(m.group(3))
    d1 = gap_in_units_direct(a, b, unit)
    d2 = gap_in_units_iterative(a, b, unit)
    assert d1 == d2
    return int(d1) if d1.denominator == 1 else None


def _selftest_parsers():
    r = parse_gap("Group A has a mean of 20. Group B has a mean of 8. The variability measure is 4. How many variability-units apart are the means?")
    assert r == 3, r
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/sampling-and-probability/lessons/sp-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            want = parse_gap(w.get("prompt", ""))
            if want is None:
                continue
            checked += 1
            ok = (int(w["answer"]) == want and w["tolerance"] == 0
                  and len(w["commonErrors"]) >= 2
                  and all(e["value"] != want for e in w["commonErrors"]))
            if not ok:
                fails += 1
                print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
