#!/usr/bin/env python3
"""Independent re-derivation of sampling-and-probability Chapter 1
(Random Sampling & Making Inferences).

7.SP.1-2: use a random sample to estimate a characteristic of the whole population.
SELF-TESTED dual-route: the direct proportional-scaling formula (trait_count / sample_size
* population_size) is cross-checked against a unit-scale-factor approach (compute how many
population members correspond to each sample member, THEN multiply) -- two genuinely
different orders of operation, using exact Fraction arithmetic to keep every authored
problem's answer a whole number.
"""
import json, glob, re, sys
from fractions import Fraction as F


def estimate_direct(trait_count, sample_size, population_size):
    return F(trait_count * population_size, sample_size)


def estimate_by_scale_factor(trait_count, sample_size, population_size):
    scale = F(population_size, sample_size)
    return trait_count * scale


def _selftest():
    cases = [(30, 50, 500), (12, 40, 200), (7, 25, 300), (18, 60, 480), (9, 30, 900)]
    for trait, sample, pop in cases:
        a = estimate_direct(trait, sample, pop)
        b = estimate_by_scale_factor(trait, sample, pop)
        assert a == b, (trait, sample, pop, a, b)          # two computation orders agree
        assert a.denominator == 1, (trait, sample, pop, a)  # every authored problem should be exact
    print("  self-test: sampling-estimate toolkit OK (direct scaling vs unit-scale-factor agree, all exact)")


def parse_estimate(prompt):
    m = re.search(r"sample of (\d+) .{0,50}?,\s*(\d+) .{0,60}?\.\s*if .{0,40}?(\d+)", prompt.lower())
    if not m:
        return None
    sample, trait, pop = int(m.group(1)), int(m.group(2)), int(m.group(3))
    want = estimate_direct(trait, sample, pop)
    assert want == estimate_by_scale_factor(trait, sample, pop)
    return int(want) if want.denominator == 1 else None


def _selftest_parsers():
    r = parse_estimate("In a sample of 50 students, 30 prefer pizza. If the school has 500 students, estimate how many prefer pizza.")
    assert r == 300, r
    r2 = parse_estimate("In a sample of 40 people, 12 own a bike. If the town has 200 people, estimate how many own a bike.")
    assert r2 == 60, r2
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/sampling-and-probability/lessons/sp-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            want = parse_estimate(w.get("prompt", ""))
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
