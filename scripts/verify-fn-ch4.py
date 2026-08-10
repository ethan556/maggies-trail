#!/usr/bin/env python3
"""Independent re-derivation of functions-and-sequences Chapter 4 (Comparing & Applying).

Exact arithmetic, SELF-TESTED. Classifies a sequence as arithmetic (constant difference),
geometric (constant ratio), or neither, and re-derives the nth term with the matching rule
(arithmetic a_1+(n-1)d, geometric a_1*r^(n-1)). Content pass: classification mcqs are
checked against the computed class; nth-term numerics use the class named in the prompt,
reading a_1 & d/r explicitly or from the sequence.
"""
import json, glob, re, sys
from fractions import Fraction as F


def parse_seq(prompt):
    m = re.search(r"(-?\d+(?:\s*,\s*-?\d+){2,})", prompt)
    return [int(x) for x in re.findall(r"-?\d+", m.group(1))] if m else None


def const_diff(seq):
    d = seq[1] - seq[0]
    return d if all(seq[i + 1] - seq[i] == d for i in range(len(seq) - 1)) else None


def const_ratio(seq):
    if any(x == 0 for x in seq[:-1]):
        return None
    r = F(seq[1], seq[0])
    return r if all(F(seq[i + 1], seq[i]) == r for i in range(len(seq) - 1)) else None


def classify(seq):
    if const_diff(seq) is not None:
        return "arithmetic"
    if const_ratio(seq) is not None:
        return "geometric"
    return "neither"


def parse_ordinal(prompt):
    m = re.search(r"(\d+)(?:st|nd|rd|th)\s+term", prompt)
    return int(m.group(1)) if m else None


def _selftest():
    for seq, want in [([3, 7, 11, 15], "arithmetic"), ([2, 6, 18, 54], "geometric"),
                      ([4, 8, 16, 32], "geometric"), ([1, 4, 9, 16], "neither"),
                      ([10, 20, 30, 40], "arithmetic"), ([1, 2, 4, 8], "geometric"),
                      ([5, 10, 15, 20], "arithmetic")]:
        assert classify(seq) == want, (seq, classify(seq), want)
    # arithmetic nth
    assert 2 + (5 - 1) * const_diff([2, 5, 8, 11]) == 14
    assert 3 + (5 - 1) * const_diff([3, 6, 9, 12]) == 15
    assert 4 + (6 - 1) * const_diff([4, 7, 10, 13]) == 19
    assert 10 + (5 - 1) * 5 == 30 and 20 + (5 - 1) * 20 == 100 and 4 + (7 - 1) * 3 == 22
    # geometric nth
    assert 2 * const_ratio([2, 6, 18, 54]) ** 4 == 162
    assert 1 * const_ratio([1, 2, 4, 8]) ** 5 == 32
    assert 1 * const_ratio([1, 5, 25, 125]) ** 4 == 625
    assert 2 * const_ratio([2, 4, 8, 16]) ** 6 == 128
    assert 3 * 3 ** 3 == 81 and 5 * 2 ** 3 == 40 and 2 * 2 ** 5 == 64 and 2 * 3 ** 4 == 162
    print("  self-test: compare/apply toolkit OK (classify + matched nth-term rule)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/functions-and-sequences/lessons/fn-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            seq = parse_seq(prompt); n = parse_ordinal(prompt)
            if w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if seq and any(k in low for k in ("which kind", "arithmetic", "geometric")):
                    want = classify(seq)
                    if want not in corr[0]["label"].lower():
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL class {want} != {corr[0]['label']!r}")
                continue
            if w["type"] != "numeric":
                continue
            ma = re.search(r"a_1\s*=\s*(-?\d+)", prompt)
            md = re.search(r"\bd\s*=\s*(-?\d+)", prompt)
            mr = re.search(r"\br\s*=\s*(-?\d+)", prompt)
            want = None
            if n is not None:
                if "geometric" in low:
                    a1 = int(ma.group(1)) if ma else (seq[0] if seq else None)
                    r = int(mr.group(1)) if mr else (const_ratio(seq) if seq else None)
                    if a1 is not None and r is not None:
                        want = int(a1 * r ** (n - 1))
                elif "arithmetic" in low:
                    a1 = int(ma.group(1)) if ma else (seq[0] if seq else None)
                    dd = int(md.group(1)) if md else (const_diff(seq) if seq else None)
                    if a1 is not None and dd is not None:
                        want = a1 + (n - 1) * dd
            if want is not None:
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']} traps {[e['value'] for e in w['commonErrors']]}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
