#!/usr/bin/env python3
"""Independent re-derivation of sampling-and-probability Chapter 4
(Probability Models & Compound Events).

7.SP.7-8: non-uniform probability models; compound events via organized lists/tables/tree
diagrams; sample space. SELF-TESTED dual-route: sample space SIZE via the counting
principle (multiply choices at each stage) is cross-checked against EXHAUSTIVE
ENUMERATION via nested loops (itertools.product) -- two genuinely different computational
paths. Compound event probability (independent events) is cross-checked the same way:
multiplying individual probabilities vs counting matches in the fully enumerated space.
"""
import json, glob, re, sys
import itertools
from fractions import Fraction as F


def sample_space_size_counting(choices_per_stage):
    size = 1
    for c in choices_per_stage:
        size *= c
    return size


def sample_space_size_enumeration(options_per_stage):
    return len(list(itertools.product(*options_per_stage)))


def _selftest_sample_space():
    cases = [
        ([2, 6], [["H", "T"], list(range(1, 7))]),          # coin + die
        ([3, 4], [["r", "g", "b"], list(range(1, 5))]),      # 3 colors + 4 numbers
        ([2, 2, 2], [["H", "T"]] * 3),                        # 3 coin flips
    ]
    for counts, options in cases:
        a = sample_space_size_counting(counts)
        b = sample_space_size_enumeration(options)
        assert a == b, (counts, a, b)
    print("  self-test: sample-space-size toolkit OK (counting principle vs exhaustive enumeration agree)")


def compound_event_prob_by_multiplication(p_a, p_b):
    return p_a * p_b


def compound_event_prob_by_enumeration(options_a, options_b, event_a, event_b):
    space = list(itertools.product(options_a, options_b))
    matches = [pair for pair in space if event_a(pair[0]) and event_b(pair[1])]
    return F(len(matches), len(space))


def _selftest_compound():
    # coin (heads) AND die (even)
    p_a = F(1, 2)
    p_b = F(1, 2)
    a = compound_event_prob_by_multiplication(p_a, p_b)
    b = compound_event_prob_by_enumeration(["H", "T"], list(range(1, 7)),
                                           lambda x: x == "H", lambda x: x % 2 == 0)
    assert a == b == F(1, 4), (a, b)
    # two dice, both greater than 4
    p_a2 = F(2, 6)
    p_b2 = F(2, 6)
    a2 = compound_event_prob_by_multiplication(p_a2, p_b2)
    b2 = compound_event_prob_by_enumeration(list(range(1, 7)), list(range(1, 7)),
                                            lambda x: x > 4, lambda x: x > 4)
    assert a2 == b2, (a2, b2)
    print("  self-test: compound-event toolkit OK (multiply-probabilities vs enumerate-and-count agree)")


def frac_label(f):
    if f.denominator == 1:
        return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"


def parse_sample_space_size(prompt):
    m = re.search(r"flipping a coin and rolling a (?:standard )?6-sided die.{0,40}how many (?:total )?outcomes", prompt.lower())
    if m:
        return sample_space_size_counting([2, 6])
    m = re.search(r"flipping a coin (\d+) times.{0,40}how many (?:total )?outcomes", prompt.lower())
    if m:
        n = int(m.group(1))
        return sample_space_size_counting([2] * n)
    m = re.search(r"(\d+) shirts and (\d+) pants.{0,40}how many (?:total )?outfits", prompt.lower())
    if m:
        return sample_space_size_counting([int(m.group(1)), int(m.group(2))])
    return None


def parse_compound_event(prompt):
    low = prompt.lower()
    if "heads" in low and "even number" in low:
        return compound_event_prob_by_multiplication(F(1, 2), F(1, 2))
    if "greater than 4" in low and "both dice" in low:
        return compound_event_prob_by_multiplication(F(2, 6), F(2, 6))
    return None


def _selftest_parsers():
    assert parse_sample_space_size("Flipping a coin and rolling a 6-sided die: how many total outcomes are there?") == 12
    assert parse_sample_space_size("Flipping a coin 3 times: how many total outcomes are there?") == 8
    assert parse_sample_space_size("A store has 4 shirts and 3 pants. How many total outfits are possible?") == 12
    assert parse_compound_event("What is the probability of flipping heads and rolling an even number?") == F(1, 4)
    assert parse_compound_event("A carnival game asks players to flip a coin and roll a die, winning if they get heads and an even number. What is the probability of winning?") == F(1, 4)
    print("  self-test: prompt parsers OK")


def main():
    _selftest_sample_space(); _selftest_compound(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/sampling-and-probability/lessons/sp-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            size = parse_sample_space_size(prompt)
            if size is not None and w["type"] == "numeric":
                checked += 1
                ok = (int(w["answer"]) == size and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2)
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric(sample-space) FAIL want {size} got {w['answer']}")
                continue
            prob = parse_compound_event(prompt)
            if prob is not None and w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip() != frac_label(prob):
                    fails += 1
                    print(f"  {lid}/{sid} mcq(compound) FAIL want {frac_label(prob)!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest_sample_space(); _selftest_compound(); _selftest_parsers(); print("OK")
    else:
        main()
