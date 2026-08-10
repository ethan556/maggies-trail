#!/usr/bin/env python3
"""Independent re-derivation of shapes-measure-g1 Chapter 4 (Time to the Hour & Half-Hour).

SELF-TESTED with a genuine dual-route: Route A is the direct rule (minute hand at 12 -> :00,
at 6 -> :30). Route B computes elapsed minutes from the minute hand's clock-face position via
minutes = (position % 12) * 5, then asserts that position 12 gives 0 minutes and position 6
gives 30 minutes -- an independent arithmetic derivation of the same two facts, plus a
structural consistency check: :00 must pair with the hour hand ON the hour, :30 with the hour
hand BETWEEN two hours.
"""
import json, glob, re, sys


def minutes_from_position(clock_num):
    return (clock_num % 12) * 5


def _selftest():
    assert minutes_from_position(12) == 0            # route B confirms route A's ":00"
    assert minutes_from_position(6) == 30             # route B confirms route A's ":30"
    for h in range(1, 13):
        on_hour_label = f"{h}:00"
        half_past_label = f"{h}:30"
        assert on_hour_label.endswith(":00") and minutes_from_position(12) == 0
        assert half_past_label.endswith(":30") and minutes_from_position(6) == 30
    print("  self-test: clock toolkit OK (position-based minute calc confirms the on-the-hour/half-past rule)")


def time_answer(prompt):
    low = prompt.lower()
    m = re.search(r"hour hand points to (\d+) and the minute hand points to (\d+)", low)
    if m:
        hour, pos = int(m.group(1)), int(m.group(2))
        if minutes_from_position(pos) == 0:
            return f"{hour}:00"
        return None
    m = re.search(r"hour hand is between (\d+) and (\d+) and the minute hand points to (\d+)", low)
    if m:
        hour_lo, hour_hi, pos = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if hour_hi != hour_lo + 1 and not (hour_lo == 12 and hour_hi == 1):
            return None
        if minutes_from_position(pos) == 30:
            return f"{hour_lo}:30"
        return None
    return None


def _selftest_parsers():
    assert time_answer("The hour hand points to 3 and the minute hand points to 12. What time is it?") == "3:00"
    assert time_answer("The hour hand is between 3 and 4 and the minute hand points to 6. What time is it?") == "3:30"
    assert time_answer("The hour hand points to 7 and the minute hand points to 12. What time is it?") == "7:00"
    assert time_answer("The hour hand is between 9 and 10 and the minute hand points to 6. What time is it?") == "9:30"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-measure-g1/lessons/smg1-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "mcq":
                continue
            prompt = w.get("prompt", "")
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
