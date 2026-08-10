#!/usr/bin/env python3
"""Independent re-derivation of tens-and-ones Chapter 1 (Bundles of Ten).

Exact integer arithmetic, SELF-TESTED. For a two-digit number n, tens = n//10 and
ones = n%10; DUAL-ROUTE invariant 10*tens + ones == n is asserted in the self-test.
Re-derives: ones equal to T tens (10*T), tens that make a multiple of ten (n//10),
tens/ones in a number, "A tens and B ones" -> 10A+B, and base-ten blocks
"R rods and C cubes" -> 10R+C.
"""
import json, glob, re, sys


def answer(prompt):
    low = prompt.lower()
    m_rod = re.search(r"(\d+)\s*rod", low)
    m_cube = re.search(r"(\d+)\s*cube", low)
    if m_rod and m_cube:
        return 10 * int(m_rod.group(1)) + int(m_cube.group(1))
    if "tens and" in low and "one" in low and "what number" in low:
        mt = re.search(r"(\d+)\s*ten", low); mo = re.search(r"(\d+)\s*one", low)
        return 10 * int(mt.group(1)) + int(mo.group(1))
    if "how many ones" in low and "ten" in low:            # ones equal to T tens
        mt = re.search(r"(\d+)\s*ten", low); return 10 * int(mt.group(1))
    if "how many tens make" in low:
        mn = re.search(r"make\s*(\d+)", low); return int(mn.group(1)) // 10
    if "how many tens" in low and " in " in low:
        mn = re.search(r"in\s*(\d+)", low); return int(mn.group(1)) // 10
    if "how many ones" in low and " in " in low:
        mn = re.search(r"in\s*(\d+)", low); return int(mn.group(1)) % 10
    return None


def _selftest():
    for n in range(10, 100):
        assert 10 * (n // 10) + (n % 10) == n              # base-ten invariant
    cases = {
        "How many ones are the same as 3 tens?": 30,
        "How many ones are the same as 5 tens?": 50,
        "How many ones are the same as 6 tens?": 60,
        "How many ones are the same as 9 tens?": 90,
        "How many tens make 40?": 4, "How many tens make 70?": 7, "How many tens make 20?": 2,
        "How many tens are in 46?": 4, "How many tens are in 72?": 7,
        "How many ones are in 46?": 6, "How many ones are in 30?": 0,
        "4 tens and 6 ones make what number?": 46,
        "5 tens and 3 ones make what number?": 53,
        "8 tens and 1 one make what number?": 81,
        "3 rods (tens) and 5 cubes (ones) show what number?": 35,
        "2 rods and 7 cubes show what number?": 27,
        "5 rods and 0 cubes show what number?": 50,
        "6 rods and 4 cubes show what number?": 64,
        "4 rods and 9 cubes show what number?": 49,
        "7 rods and 2 cubes show what number?": 72,
        "9 rods and 9 cubes show what number?": 99,
    }
    for p, want in cases.items():
        assert answer(p) == want, (p, answer(p), want)
    print("  self-test: bundles-of-ten toolkit OK (base-ten decomposition + invariant)")


def main():
    _selftest()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/tens-and-ones/lessons/tno-01-*.json")):
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
