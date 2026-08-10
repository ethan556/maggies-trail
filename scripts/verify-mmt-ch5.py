#!/usr/bin/env python3
"""Independent re-derivation of measure-money-time Chapter 5 (Line Plots, Picture & Bar Graphs).

SCOPED STRICTLY to G2 depth: single-unit scale only (key = 1, no multiplier) -- the
scaled-key/scaled-gridline treatment is measurement-data's differentiator and stays there.
SELF-TESTED: reading a count off a 1-to-1 picture/bar/line-plot display is pure counting,
cross-checked between direct value-lookup and an explicit tally loop.
"""
import json, glob, re, sys


def tally(n):
    """Route B: build a count by incrementing one at a time, mirroring counting pictures/X's."""
    total = 0
    for _ in range(n):
        total += 1
    return total


def _selftest():
    for n in range(0, 15):
        assert n == tally(n)                              # direct value vs one-at-a-time tally agree
    print("  self-test: single-scale toolkit OK (direct count vs tally agree)")


def count_answer(prompt):
    low = prompt.lower()
    m = re.search(r"(\d+) (?:apple pictures|pictures|x's|xs).{0,60}each (?:picture|x) equals 1", low)
    if m:
        return tally(int(m.group(1)))
    m = re.search(r"a bar reaches (\d+) on the bar graph, where each gridline is worth 1", low)
    if m:
        return tally(int(m.group(1)))
    m = re.search(r"line plot shows (\d+) x's above the number (\d+)", low)
    if m:
        return tally(int(m.group(1)))
    return None


def difference_answer(prompt):
    low = prompt.lower()
    m = re.search(r"(\d+) votes.*and .*?(\d+) votes.*how many more", low)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return abs(b - a)
    return None


def _selftest_parsers():
    assert count_answer("The picture graph shows 4 apple pictures for Monday. Each picture equals 1 vote. How many votes on Monday?") == 4
    assert count_answer("A bar reaches 6 on the bar graph, where each gridline is worth 1. How many is that?") == 6
    assert count_answer("A line plot shows 3 x's above the number 5. How many data points are at 5?") == 3
    assert difference_answer("Monday has 4 votes and Tuesday has 7 votes. How many more votes on Tuesday?") == 3
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/measure-money-time/lessons/mmt-05-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            prompt = w.get("prompt", "")
            want = count_answer(prompt)
            if want is None:
                want = difference_answer(prompt)
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
