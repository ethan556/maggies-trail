#!/usr/bin/env python3
"""Independent re-derivation of functions-and-sequences Chapter 2 (Arithmetic Sequences).

Exact integer arithmetic, SELF-TESTED. Parses an explicit sequence (or a_1 and d) and an
ordinal position; re-derives the common difference, the next term, the nth term via
a_n = a_1 + (n-1)d, and the position n where a term equals a value. DUAL-ROUTE: the nth
term from the closed formula is cross-checked against literal step-by-step accumulation in
the self-test. Content pass re-derives the asked integer.
"""
import json, glob, re, sys


def parse_seq(prompt):
    m = re.search(r"(-?\d+(?:\s*,\s*-?\d+){2,})", prompt)
    if not m:
        return None
    return [int(x) for x in re.findall(r"-?\d+", m.group(1))]


def common_diff(seq):
    d = seq[1] - seq[0]
    for i in range(1, len(seq) - 1):
        if seq[i + 1] - seq[i] != d:
            return None
    return d


def nth_term(a1, d, n):
    return a1 + (n - 1) * d


def parse_a1_d(prompt):
    ma = re.search(r"a_1\s*=\s*(-?\d+)", prompt)
    md = re.search(r"d\s*=\s*(-?\d+)", prompt)
    if ma and md:
        return int(ma.group(1)), int(md.group(1))
    return None


def parse_ordinal(prompt):
    m = re.search(r"(\d+)(?:st|nd|rd|th)\s+term", prompt)
    return int(m.group(1)) if m else None


def _selftest():
    assert common_diff([3, 7, 11, 15]) == 4
    assert common_diff([10, 7, 4, 1]) == -3
    assert common_diff([2, 9, 16, 23]) == 7
    for a1, d, n, want in [(3, 4, 5, 19), (2, 5, 6, 27), (10, 3, 4, 19), (1, 2, 10, 19),
                           (5, 4, 7, 29), (50, -5, 6, 25), (7, 6, 8, 49)]:
        assert nth_term(a1, d, n) == want, (a1, d, n)
        v = a1
        for _ in range(n - 1):
            v += d
        assert v == want                                  # route 2: literal stepping
    # sequence -> nth
    for seq, n, want in [([4, 7, 10, 13], 6, 19), ([2, 6, 10, 14], 7, 26), ([1, 4, 7, 10], 9, 25),
                         ([3, 9, 15, 21], 5, 27), ([6, 11, 16, 21], 10, 51)]:
        d = common_diff(seq)
        assert nth_term(seq[0], d, n) == want, (seq, n)
    # position of a value
    for seq, val, want in [([5, 8, 11], 23, 7), ([4, 10, 16], 34, 6)]:
        d = common_diff(seq)
        assert (val - seq[0]) // d + 1 == want and (val - seq[0]) % d == 0
    print("  self-test: arithmetic-sequence toolkit OK (diff, next, nth dual-route, position)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/functions-and-sequences/lessons/fn-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            prompt = w.get("prompt", ""); low = prompt.lower()
            seq = parse_seq(prompt)
            ad = parse_a1_d(prompt)
            n = parse_ordinal(prompt)
            want = None
            if "common difference" in low and seq:
                want = common_diff(seq)
            elif "next term" in low and seq:
                dd = common_diff(seq)
                want = seq[-1] + dd if dd is not None else None
            elif ("which term" in low or "give n" in low) and seq:
                mval = re.search(r"equals (-?\d+)", prompt)
                dd = common_diff(seq)
                if mval and dd:
                    v = int(mval.group(1))
                    if (v - seq[0]) % dd == 0:
                        want = (v - seq[0]) // dd + 1
            elif n is not None:
                if ad:
                    want = nth_term(ad[0], ad[1], n)
                elif seq:
                    dd = common_diff(seq)
                    want = nth_term(seq[0], dd, n) if dd is not None else None
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
