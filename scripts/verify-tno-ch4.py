#!/usr/bin/env python3
"""Independent re-derivation of tens-and-ones Chapter 4 (Comparing Two-Digit Numbers).

Exact integer comparison, SELF-TESTED. For "Compare: A __ B", the correct symbol is >,<,=.
DUAL-ROUTE: the whole-value comparison (A vs B) is cross-checked in the self-test against
the place-value rule (compare tens first; if tens tie, compare ones) for every pair of
two-digit numbers — the two routes must agree on all 8100 pairs.
"""
import json, glob, re, sys


def relation(a, b):
    return ">" if a > b else ("<" if a < b else "=")


def place_value_relation(a, b):
    ta, oa = a // 10, a % 10
    tb, ob = b // 10, b % 10
    if ta != tb:
        return ">" if ta > tb else "<"
    if oa != ob:
        return ">" if oa > ob else "<"
    return "="


def _selftest():
    for a in range(10, 100):
        for b in range(10, 100):
            assert relation(a, b) == place_value_relation(a, b), (a, b)   # two routes agree
    # spot-check the authored pairs
    for a, b, want in [(45, 52, "<"), (63, 38, ">"), (40, 39, ">"), (28, 71, "<"),
                       (84, 59, ">"), (17, 60, "<"), (90, 89, ">"),
                       (63, 67, "<"), (58, 54, ">"), (71, 76, "<"), (45, 45, "="),
                       (89, 82, ">"), (30, 36, "<"), (77, 77, "="),
                       (52, 48, ">"), (64, 69, "<"), (39, 41, "<"), (70, 70, "="),
                       (85, 58, ">"), (26, 62, "<"), (91, 19, ">")]:
        assert relation(a, b) == want, (a, b, want)
    print("  self-test: compare toolkit OK (whole-value vs place-value routes agree on all pairs)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/tens-and-ones/lessons/tno-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            if w["type"] != "mcq":
                continue
            prompt = w.get("prompt", "")
            corr = [o for o in w["options"] if o.get("correct")]
            if len(corr) != 1:
                fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
            nums = [int(x) for x in re.findall(r"\d+", prompt)]
            if len(nums) < 2:
                continue
            checked += 1
            want = relation(nums[0], nums[1])
            if corr[0]["label"].strip() != want:
                fails += 1
                print(f"  {lid}/{sid} FAIL {nums[0]} {want} {nums[1]} but correct={corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); print("OK")
    else:
        main()
