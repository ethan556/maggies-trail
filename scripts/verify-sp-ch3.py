#!/usr/bin/env python3
"""Independent re-derivation of sampling-and-probability Chapter 3 (Understanding Probability).

7.SP.5-6: probability of a chance event as a number 0-1; approximate probability through
relative frequency (experimental trials); develop a uniform probability model.
SELF-TESTED dual-route: theoretical probability (favorable/total, as an exact Fraction) is
cross-checked by EXPLICITLY ENUMERATING the sample space and counting matches -- a
genuinely different computational path than just reducing a fraction. Experimental
probability (relative frequency from trial counts) is cross-checked via direct division
vs a cumulative counting loop over the trial data.
"""
import json, glob, re, sys
from fractions import Fraction as F


def theoretical_direct(favorable, total):
    return F(favorable, total)


def theoretical_by_enumeration(sample_space, event_check):
    """sample_space: list of outcomes. event_check: function outcome -> bool."""
    matches = [o for o in sample_space if event_check(o)]
    return F(len(matches), len(sample_space))


def _selftest():
    # A standard die (1-6): P(even)
    die = list(range(1, 7))
    a = theoretical_direct(3, 6)
    b = theoretical_by_enumeration(die, lambda x: x % 2 == 0)
    assert a == b == F(1, 2), (a, b)
    # A standard die: P(greater than 4)
    a2 = theoretical_direct(2, 6)
    b2 = theoretical_by_enumeration(die, lambda x: x > 4)
    assert a2 == b2 == F(1, 3), (a2, b2)
    # A spinner with 8 equal sections, 3 are red: P(red)
    spinner = ["red"] * 3 + ["blue"] * 5
    a3 = theoretical_direct(3, 8)
    b3 = theoretical_by_enumeration(spinner, lambda x: x == "red")
    assert a3 == b3, (a3, b3)
    print("  self-test: theoretical-probability toolkit OK (direct fraction vs explicit enumeration agree)")


def relative_frequency_direct(occurrences, trials):
    return F(occurrences, trials)


def relative_frequency_cumulative(trial_results, target):
    count = 0
    for r in trial_results:
        if r == target:
            count += 1
    return F(count, len(trial_results))


def _selftest_experimental():
    trials = ["H", "T", "H", "H", "T", "H", "T", "T", "H", "H"]
    a = relative_frequency_direct(6, 10)
    b = relative_frequency_cumulative(trials, "H")
    assert a == b == F(3, 5), (a, b)
    print("  self-test: experimental-probability toolkit OK (direct division vs cumulative counting agree)")


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def parse_die_probability(prompt):
    m = re.search(r"rolling a standard.{0,4}6.sided die.{0,40}probability of rolling (an?|a number)\s*(even|odd|greater than (\d)|less than (\d)|(\d))", prompt.lower())
    if not m:
        return None
    die = list(range(1, 7))
    kind = m.group(2)
    if kind == "even":
        return theoretical_by_enumeration(die, lambda x: x % 2 == 0)
    if kind == "odd":
        return theoretical_by_enumeration(die, lambda x: x % 2 == 1)
    if m.group(3):
        n = int(m.group(3))
        return theoretical_by_enumeration(die, lambda x: x > n)
    if m.group(4):
        n = int(m.group(4))
        return theoretical_by_enumeration(die, lambda x: x < n)
    if m.group(5):
        n = int(m.group(5))
        return theoretical_by_enumeration(die, lambda x: x == n)
    return None


def parse_spinner_probability(prompt):
    m = re.search(r"spinner.{0,10}(\d+) equal sections?,?\s*(\d+) (?:are|is) ([a-z]+)", prompt.lower())
    if not m:
        return None
    total, favorable = int(m.group(1)), int(m.group(2))
    spinner = ["x"] * favorable + ["y"] * (total - favorable)
    return theoretical_by_enumeration(spinner, lambda o: o == "x")


def parse_relative_frequency(prompt):
    """Match either 'X (times )?out of Y' or 'After Y trials, ... came up X times' --
    the computation (occurrences/total) doesn't depend on the surrounding context words."""
    low = prompt.lower()
    m = re.search(r"(?:landed on \w+|came up|made)\s*(\d+)\s*(?:times\s*)?out of (\d+)", low)
    if m:
        return relative_frequency_direct(int(m.group(1)), int(m.group(2)))
    m = re.search(r"after (\d+) (?:rolls|spins|flips|trials|attempts),.{0,40}came up (\d+) times", low)
    if m:
        return relative_frequency_direct(int(m.group(2)), int(m.group(1)))
    return None


def parse_landmark_endpoint(prompt):
    """Only the crisp 0/1 endpoints have an unambiguous, universally-agreed label --
    intermediate values like 1/20 are a matter of instructional judgment, not something
    to auto-verify against a threshold."""
    m = re.search(r"a probability of (\d) describes an event that is", prompt.lower())
    if not m:
        return None
    val = int(m.group(1))
    if val == 0:
        return "impossible"
    if val == 1:
        return "certain"
    return None


def _selftest_parsers():
    assert parse_die_probability("When rolling a standard 6-sided die, what is the probability of rolling an even number?") == F(1, 2)
    assert parse_die_probability("When rolling a standard 6-sided die, what is the probability of rolling a number greater than 4?") == F(1, 3)
    assert parse_spinner_probability("A spinner has 8 equal sections, 3 are red. What is the probability of landing on red?") == F(3, 8)
    assert parse_relative_frequency("A coin landed on heads 6 times out of 10 flips. What is the relative frequency of heads?") == F(3, 5)
    assert parse_relative_frequency("A spinner landed on red 18 times out of 30 spins. What is the relative frequency of red?") == F(3, 5)
    assert parse_relative_frequency("After 60 rolls, a 6 came up 12 times. What is the EXPERIMENTAL probability?") == F(1, 5)
    assert parse_relative_frequency("A basketball player made 45 out of 60 free throws. What is the relative frequency?") == F(3, 4)
    assert parse_relative_frequency("After 40 spins, blue came up 24 times. What is the EXPERIMENTAL probability of blue?") == F(3, 5)
    assert parse_landmark_endpoint("A probability of 1 describes an event that is...") == "certain"
    assert parse_landmark_endpoint("A probability of 0 describes an event that is...") == "impossible"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_experimental(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/sampling-and-probability/lessons/sp-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            want = (parse_die_probability(prompt) or parse_spinner_probability(prompt)
                    or parse_relative_frequency(prompt))
            landmark = parse_landmark_endpoint(prompt)
            if landmark is not None and w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip().lower() != landmark:
                    fails += 1
                    print(f"  {lid}/{sid} mcq(landmark) FAIL want {landmark!r} got {corr[0]['label']!r}")
                continue
            if want is None:
                continue
            if w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip() != frac_label(want):
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {frac_label(want)!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_experimental(); _selftest_parsers(); print("OK")
    else:
        main()
