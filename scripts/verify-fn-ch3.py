#!/usr/bin/env python3
"""Independent re-derivation of functions-and-sequences Chapter 3 (Geometric Sequences).

Exact integer arithmetic, SELF-TESTED. Parses a sequence (or a_1 and r) and an ordinal;
re-derives the common ratio (constant-check), the next term, and the nth term via
a_n = a_1 * r^(n-1). DUAL-ROUTE: the nth term from the power formula is cross-checked
against literal repeated multiplication in the self-test. Sequences are kept integer-valued.
Content pass re-derives the asked integer.
"""
import json, glob, re, sys
from fractions import Fraction as F


def parse_seq(prompt):
    m = re.search(r"(-?\d+(?:\s*,\s*-?\d+){2,})", prompt)
    if not m:
        return None
    return [int(x) for x in re.findall(r"-?\d+", m.group(1))]


def common_ratio(seq):
    if seq[0] == 0:
        return None
    r = F(seq[1], seq[0])
    for i in range(1, len(seq) - 1):
        if seq[i] == 0 or F(seq[i + 1], seq[i]) != r:
            return None
    return r


def geo_nth(a1, r, n):
    return a1 * r ** (n - 1)


def parse_a1_r(prompt):
    ma = re.search(r"a_1\s*=\s*(-?\d+)", prompt)
    mr = re.search(r"\br\s*=\s*(-?\d+)", prompt)
    if ma and mr:
        return int(ma.group(1)), int(mr.group(1))
    return None


def parse_ordinal(prompt):
    m = re.search(r"(\d+)(?:st|nd|rd|th)\s+term", prompt)
    return int(m.group(1)) if m else None


def _selftest():
    for seq, want in [([2, 6, 18, 54], 3), ([3, 6, 12, 24], 2), ([5, 10, 20, 40], 2), ([1, 3, 9, 27], 3)]:
        assert common_ratio(seq) == want, (seq, common_ratio(seq))
    for seq, want in [([2, 6, 18, 54], 162), ([1, 4, 16, 64], 256), ([1, 3, 9, 27], 81), ([2, 10, 50, 250], 1250)]:
        r = common_ratio(seq)
        assert seq[-1] * r == want
    for a1, r, n, want in [(2, 3, 4, 54), (3, 2, 5, 48), (1, 4, 3, 16), (5, 2, 5, 80),
                           (2, 2, 6, 64), (1, 3, 4, 27), (3, 3, 4, 81)]:
        assert geo_nth(a1, r, n) == want, (a1, r, n)
        v = a1
        for _ in range(n - 1):
            v *= r
        assert v == want                                  # route 2: repeated multiplication
    for seq, n, want in [([3, 6, 12, 24], 5, 48), ([2, 6, 18, 54], 5, 162), ([1, 4, 16, 64], 5, 256),
                         ([5, 10, 20, 40], 6, 160), ([1, 3, 9, 27], 5, 81), ([2, 4, 8, 16], 6, 64),
                         ([1, 2, 4, 8], 8, 128)]:
        r = common_ratio(seq)
        assert geo_nth(seq[0], r, n) == want, (seq, n)
    print("  self-test: geometric-sequence toolkit OK (ratio, next, nth dual-route)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/functions-and-sequences/lessons/fn-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            seq = parse_seq(prompt); ar = parse_a1_r(prompt); n = parse_ordinal(prompt)
            want = None
            if "common ratio" in low and seq:
                r = common_ratio(seq); want = int(r) if r is not None and r.denominator == 1 else None
            elif "next term" in low and seq:
                r = common_ratio(seq); want = int(seq[-1] * r) if r is not None else None
            elif n is not None:
                if ar:
                    want = geo_nth(ar[0], ar[1], n)
                elif seq:
                    r = common_ratio(seq)
                    want = int(geo_nth(seq[0], r, n)) if r is not None else None
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
