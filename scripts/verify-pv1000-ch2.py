#!/usr/bin/env python3
"""Independent re-derivation of place-value-1000 Chapter 2 (Counting to 1000).

2.NBT.2: count within 1000; skip-count by 5s, 10s, and 100s. SELF-TESTED dual-route:
the Nth number in a skip-counting sequence computed via direct arithmetic (start + n*skip)
is cross-checked against an ITERATIVE loop that steps one skip at a time from the start --
two independent ways to arrive at the same sequence position.
"""
import json, glob, re, sys


def nth_direct(start, skip, n):
    return start + n * skip


def nth_iterative(start, skip, n):
    val = start
    for _ in range(n):
        val += skip
    return val


def _selftest():
    for start in [0, 5, 23, 100, 250, 999 - 5 * 5]:
        for skip in [5, 10, 100]:
            for n in range(0, 10):
                a = nth_direct(start, skip, n)
                b = nth_iterative(start, skip, n)
                assert a == b, (start, skip, n, a, b)      # direct arithmetic vs iterative stepping
    print("  self-test: skip-counting toolkit OK (direct arithmetic vs iterative stepping agree)")


def parse_next_in_sequence(prompt):
    """'Skip-count by K: a, b, c, ___?' -> find the missing next term."""
    m = re.search(r"skip-count by (\d+)s?:\s*([\d,\s]+),\s*___", prompt.lower())
    if not m:
        return None
    skip = int(m.group(1))
    nums = [int(x.strip()) for x in m.group(2).split(",") if x.strip()]
    start = nums[0]
    n = len(nums)                                          # the missing term is n steps after start
    a = nth_direct(start, skip, n)
    b = nth_iterative(start, skip, n)
    assert a == b, (start, skip, n)
    return a


def parse_count_forward(prompt):
    """'Count forward from N by K, M times. What number do you land on?'"""
    m = re.search(r"count forward from (\d+) by (\d+)s?,?\s*(\d+) times", prompt.lower())
    if not m:
        return None
    start, skip, times = int(m.group(1)), int(m.group(2)), int(m.group(3))
    a = nth_direct(start, skip, times)
    b = nth_iterative(start, skip, times)
    assert a == b, (start, skip, times)
    return a


def _selftest_parsers():
    assert parse_next_in_sequence("Skip-count by 10s: 320, 330, 340, ___?") == 350
    assert parse_next_in_sequence("Skip-count by 100s: 200, 300, 400, ___?") == 500
    assert parse_next_in_sequence("Skip-count by 5s: 610, 615, 620, ___?") == 625
    assert parse_count_forward("Count forward from 450 by 10s, 3 times. What number do you land on?") == 480
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/place-value-1000/lessons/pv1000-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            prompt = w.get("prompt", "")
            want = parse_next_in_sequence(prompt)
            if want is None:
                want = parse_count_forward(prompt)
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
