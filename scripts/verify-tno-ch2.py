#!/usr/bin/env python3
"""Independent re-derivation of tens-and-ones Chapter 2 (Expanded Form & Digit Value).

Exact integer arithmetic, SELF-TESTED. Re-derives: the missing ones part of expanded form
(n%10), the value of a named digit by place (tens digit -> *10; ones digit -> itself; with
explicit left/right for repeated digits), reading expanded form back to a number (A+B), and
tens+ones sums. DUAL-ROUTE: tens-value + ones-value == n asserted across the range.
"""
import json, glob, re, sys


def answer(prompt):
    low = prompt.lower()
    m_eqmiss = re.search(r"(\d+)\s*=\s*\d+\s*\+\s*\?", prompt)
    if m_eqmiss:
        return int(m_eqmiss.group(1)) % 10
    m_what = re.search(r"what number is\s*(\d+)\s*\+\s*(\d+)", low)
    if m_what:
        return int(m_what.group(1)) + int(m_what.group(2))
    m_sum = re.search(r"(\d+)\s*\+\s*(\d+)\s*=\s*\?", prompt)
    if m_sum:
        return int(m_sum.group(1)) + int(m_sum.group(2))
    m_val = re.search(r"value of the (left |right )?(\d+)", low)
    if m_val:
        mn = re.search(r"in\s*(\d+)", low)
        if not mn:
            return None
        n = int(mn.group(1)); side = m_val.group(1); d = int(m_val.group(2))
        if side and "left" in side:
            return (n // 10) * 10
        if side and "right" in side:
            return n % 10
        return (n // 10) * 10 if d == n // 10 else d
    return None


def _selftest():
    for n in range(10, 100):
        assert (n // 10) * 10 + (n % 10) == n              # tens-value + ones-value invariant
    cases = {
        "Write 46 in expanded form: 46 = 40 + ?": 6,
        "58 = 50 + ?": 8, "89 = 80 + ?": 9,
        "In 72, what is the value of the 7?": 70,
        "In 35, what is the value of the 3?": 30,
        "In 52, what is the value of the 5?": 50,
        "In 74, what is the value of the 7?": 70,
        "In 33, what is the value of the left 3?": 30,
        "In 60, what is the value of the 6?": 60,
        "In 85, what is the value of the 8?": 80,
        "In 19, what is the value of the 1?": 10,
        "In 90, what is the value of the 9?": 90,
        "What number is 40 + 6?": 46, "What number is 50 + 3?": 53,
        "What number is 80 + 5?": 85, "What number is 60 + 0?": 60,
        "What number is 20 + 9?": 29, "What number is 90 + 1?": 91,
        "What number is 70 + 7?": 77,
        "70 + 2 = ?": 72, "60 + 4 = ?": 64,
    }
    for p, want in cases.items():
        assert answer(p) == want, (p, answer(p), want)
    print("  self-test: expanded-form/digit-value toolkit OK (place value + invariant)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/tens-and-ones/lessons/tno-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                if w and w["type"] == "mcq" and sum(1 for o in w["options"] if o.get("correct")) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1")
                continue
            want = answer(w.get("prompt", ""))
            if want is None:
                continue
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
