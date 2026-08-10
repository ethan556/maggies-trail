#!/usr/bin/env python3
"""Independent re-derivation of proportional-relationships Chapter 1 (Unit Rates with Fractions).

Exact Fraction arithmetic (7.RP.1: unit rates involving ratios of fractions, e.g. complex
fractions). SELF-TESTED dual-route: unit rate = (a/b) / (c/d) computed directly via Fraction
division, cross-checked against the cross-multiplication rule (a/b) * (d/c) done as a
completely separate expression -- two independent paths to the same exact rational value.
"""
import json, glob, re, sys
from fractions import Fraction as F


def unit_rate_direct(qty, qty_frac_num, qty_frac_den, time_frac_num, time_frac_den):
    """qty is a whole number of the fractional quantity; e.g. qty=1 means '1/2 mile'."""
    quantity = F(qty * qty_frac_num, qty_frac_den)
    time = F(time_frac_num, time_frac_den)
    return quantity / time


def unit_rate_cross_mult(qty_frac_num, qty_frac_den, time_frac_num, time_frac_den):
    """Cross-multiplication route: (a/b) / (c/d) = (a/b) * (d/c), built as a separate expression."""
    a, b, c, d = qty_frac_num, qty_frac_den, time_frac_num, time_frac_den
    return F(a, b) * F(d, c)


def _selftest():
    cases = [
        (1, 2, 1, 4),    # 1/2 mile in 1/4 hour -> 2 mph
        (3, 4, 1, 2),    # 3/4 mile in 1/2 hour -> 1.5 mph
        (2, 3, 1, 3),    # 2/3 mile in 1/3 hour -> 2 mph
        (5, 6, 5, 12),   # 5/6 mile in 5/12 hour -> 2 mph
        (1, 3, 2, 3),    # 1/3 mile in 2/3 hour -> 0.5 mph
    ]
    for qn, qd, tn, td in cases:
        direct = F(qn, qd) / F(tn, td)
        cross = unit_rate_cross_mult(qn, qd, tn, td)
        assert direct == cross, (qn, qd, tn, td, direct, cross)   # two routes agree exactly
    print("  self-test: unit-rate toolkit OK (direct division vs cross-multiplication agree)")


def parse_and_answer(prompt):
    """Parse 'X/Y unit1 ... A/B unit2' style prompts and return the unit rate as a Fraction.
    Both unit slots share the same noun set -- a unit rate compares ANY two quantities,
    not just distance/time."""
    UNIT = r"mile|miles|lap|laps|cup|cups|hour|hours|minute|minutes"
    m = re.search(
        rf"(\d+)/(\d+) (?:{UNIT})s? (?:in|of \w+ for every) (\d+)/(\d+) (?:{UNIT})",
        prompt.lower(),
    )
    if not m:
        return None
    qn, qd, tn, td = (int(g) for g in m.groups())
    return F(qn, qd) / F(tn, td)


def _selftest_parsers():
    r = parse_and_answer("A runner covers 1/2 mile in 1/4 hour. What is the unit rate in miles per hour?")
    assert r == F(2, 1), r
    r2 = parse_and_answer("A hiker covers 3/4 mile in 1/2 hour. What is the unit rate in miles per hour?")
    assert r2 == F(3, 2), r2
    print("  self-test: prompt parsers OK")


def frac_to_label(f):
    """Format a Fraction as the exact mcq label used in authored content."""
    if f.denominator == 1:
        return str(f.numerator)
    whole = f.numerator // f.denominator
    rem = f - whole
    if whole == 0:
        return f"{f.numerator}/{f.denominator}"
    return f"{whole} {rem.numerator}/{rem.denominator}"


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/proportional-relationships/lessons/pr-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            want = parse_and_answer(prompt)
            if want is None:
                continue
            checked += 1
            if w["type"] == "numeric":
                ok = (F(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(F(e["value"]) != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                want_label = frac_to_label(want)
                if corr[0]["label"].strip() != want_label:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want_label!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
