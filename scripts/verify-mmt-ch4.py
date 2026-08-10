#!/usr/bin/env python3
"""Independent re-derivation of measure-money-time Chapter 4 (Time to Five Minutes).

Generalizes verify-smg1-ch4's position-based rule (which only handled 12/6) to any
clock-face position 0..11. SELF-TESTED dual-route: minutes = position * 5 (direct
multiplication) is cross-checked against skip-counting by 5s in a loop (5, 10, 15, ...)
for every position -- two independent derivations of the same value.
"""
import json, glob, re, sys


def minutes_direct(position):
    return position * 5


def minutes_skipcount(position):
    total = 0
    for _ in range(position):
        total += 5
    return total


def _selftest():
    for pos in range(0, 12):
        assert minutes_direct(pos) == minutes_skipcount(pos), pos    # two routes agree
    assert minutes_direct(0) == 0 and minutes_direct(6) == 30 and minutes_direct(11) == 55
    print("  self-test: five-minute toolkit OK (direct multiply vs skip-count agree, 0..11)")


def time_answer(prompt):
    low = prompt.lower()
    m = re.search(r"hour hand points to (\d+) and the minute hand points to 12", low)
    if m:
        return f"{int(m.group(1))}:00"
    m = re.search(r"hour hand is between (\d+) and (\d+) and the minute hand points to (\d+)", low)
    if m:
        hour_lo, hour_hi, pos = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if hour_hi != hour_lo + 1 and not (hour_lo == 12 and hour_hi == 1):
            return None
        minutes = minutes_direct(pos)
        if minutes == 0 or minutes % 5 != 0:
            return None
        return f"{hour_lo}:{minutes:02d}"
    return None


def skipcount_answer(prompt):
    low = prompt.lower()
    m = re.search(r"minute hand points to (\d+).{0,40}how many minutes", low)
    if m:
        return minutes_direct(int(m.group(1)))
    return None


def _selftest_parsers():
    assert time_answer("The hour hand is between 3 and 4 and the minute hand points to 4. What time is it?") == "3:20"
    assert time_answer("The hour hand is between 7 and 8 and the minute hand points to 1. What time is it?") == "7:05"
    assert time_answer("The hour hand points to 9 and the minute hand points to 12. What time is it?") == "9:00"
    assert skipcount_answer("The minute hand points to 7. How many minutes is that?") == 35
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/measure-money-time/lessons/mmt-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = skipcount_answer(prompt)
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
                want = time_answer(prompt)
                if want is None:
                    continue
                checked += 1
                if corr[0]["label"].strip() != want:
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want {want!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
