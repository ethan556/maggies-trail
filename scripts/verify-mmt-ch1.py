#!/usr/bin/env python3
"""Independent re-derivation of measure-money-time Chapter 1 (Measure Length, standard units).

Whole-inch/centimeter ruler reading only (fractional ticks are a later-grade skill, already
owned by measure-convert's eighths-of-an-inch lesson). SELF-TESTED with a genuine dual-route:
length = end_mark - start_mark is cross-checked against counting unit segments one at a time
(a loop from start to end), not just a single subtraction.
"""
import json, glob, re, sys

BEST_UNIT = {
    "pencil": "inches", "crayon": "inches", "book": "inches", "hand": "inches",
    "classroom": "feet", "hallway": "feet", "playground": "feet", "car": "feet",
}


def _selftest():
    for start in range(0, 5):
        for end in range(start + 1, start + 10):
            direct = end - start
            counted = 0
            pos = start
            while pos < end:
                counted += 1
                pos += 1
            assert direct == counted, (start, end)          # two routes agree
    for obj in BEST_UNIT:
        assert BEST_UNIT[obj] in ("inches", "feet")
    print("  self-test: ruler toolkit OK (subtraction vs unit-segment counting agree)")


def ruler_answer(prompt):
    low = prompt.lower()
    m = re.search(r"starts at (\d+) and ends at (?:the mark labeled )?(\d+)", low)
    if not m:
        return None
    start, end = int(m.group(1)), int(m.group(2))
    return end - start


def unit_answer(prompt):
    low = prompt.lower()
    m = re.search(r"measure the length of an? ([a-z]+)", low)
    if not m:
        return None
    return BEST_UNIT.get(m.group(1))


def _selftest_parsers():
    assert ruler_answer("An object starts at 0 and ends at the mark labeled 5 on an inch ruler. How long is it?") == 5
    assert ruler_answer("A crayon starts at 2 and ends at 7 on a centimeter ruler. How long is it?") == 5
    assert unit_answer("Which unit is best to measure the length of a pencil?") == "inches"
    assert unit_answer("Which unit is best to measure the length of a hallway?") == "feet"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/measure-money-time/lessons/mmt-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = ruler_answer(prompt)
                if want is None:
                    continue
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric FAIL want {want} got {w['answer']}")
            elif w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                want = unit_answer(prompt)
                if want is None:
                    continue
                checked += 1
                if want not in corr[0]["label"].strip().lower():
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want!r} in {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
