#!/usr/bin/env python3
"""Independent re-derivation of place-value-1000 Chapter 1 (Hundreds, Tens & Ones).

2.NBT.1: understand hundreds/tens/ones place value for 3-digit numbers. SELF-TESTED
dual-route: decompose a number into (hundreds, tens, ones) via integer division/modulo,
cross-checked by reconstructing the number from those parts via a completely separate
digit-string-indexing method -- two independent ways to agree on place value.
"""
import json, glob, re, sys


def decompose_div_mod(n):
    h = n // 100
    t = (n // 10) % 10
    o = n % 10
    return h, t, o


def decompose_string(n):
    s = str(n).zfill(3)
    return int(s[0]), int(s[1]), int(s[2])


def build_from_parts(h, t, o):
    return h * 100 + t * 10 + o


def _selftest():
    for n in range(0, 1000):
        a = decompose_div_mod(n)
        b = decompose_string(n)
        assert a == b, (n, a, b)                          # div/mod vs string-indexing agree
        assert build_from_parts(*a) == n, (n, a)           # round trip
    print("  self-test: place-value toolkit OK (div/mod vs string-indexing agree for 0..999)")


def parse_digit_worth(prompt):
    m = re.search(r"in the number (\d{3}), what is the (\d) worth", prompt.lower())
    if not m:
        return None
    num, digit = m.group(1), m.group(2)
    h, t, o = decompose_string(int(num))
    if str(h) == digit:
        return h * 100
    if str(t) == digit:
        return t * 10
    if str(o) == digit:
        return o
    return None


def parse_build_from_parts(prompt):
    m = re.search(r"(\d+) hundreds?,\s*(\d+) tens?,\s*(?:and\s*)?(\d+) ones?", prompt.lower())
    if not m:
        return None
    h, t, o = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return build_from_parts(h, t, o)


def _selftest_parsers():
    assert parse_digit_worth("In the number 582, what is the 8 worth?") == 80
    assert parse_build_from_parts("What number has 4 hundreds, 0 tens, and 9 ones?") == 409
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/place-value-1000/lessons/pv1000-01-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            prompt = w.get("prompt", "")
            want = parse_digit_worth(prompt)
            if want is None:
                want = parse_build_from_parts(prompt)
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
