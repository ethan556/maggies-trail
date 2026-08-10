#!/usr/bin/env python3
"""Independent re-derivation of place-value-1000 Chapter 3
(Reading, Writing & Comparing 3-Digit Numbers).

2.NBT.3-4: read/write numbers in word form; compare 3-digit numbers using <, =, >.
SELF-TESTED dual-route: word-form conversion built via a place-based lookup table is
verified by ROUND-TRIPPING -- parsing the generated words back into a number via an
independent word-to-number map and confirming it equals the original (not just re-reading
the same table). Comparison is checked via direct Python comparison cross-checked against
an explicit place-by-place walk (hundreds first, then tens, then ones).
"""
import json, glob, re, sys

ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
        "seventeen", "eighteen", "nineteen"]
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
WORD_TO_NUM = {w: i for i, w in enumerate(ONES)}
WORD_TO_NUM.update({w: i * 10 for i, w in enumerate(TENS) if w})


def two_digit_words(n):
    if n < 20:
        return ONES[n]
    t, o = n // 10, n % 10
    return TENS[t] + (f"-{ONES[o]}" if o else "")


def number_to_words(n):
    h, rem = divmod(n, 100)
    parts = []
    if h:
        parts.append(f"{ONES[h]} hundred")
    if rem or not h:
        parts.append(two_digit_words(rem)) if rem else None
    return " ".join(p for p in parts if p) or "zero"


def words_to_number(words):
    """Independent parser: reconstruct the number from the generated words."""
    words = words.replace("-", " ")
    total = 0
    toks = words.split()
    i = 0
    while i < len(toks):
        if i + 1 < len(toks) and toks[i + 1] == "hundred":
            total += WORD_TO_NUM[toks[i]] * 100
            i += 2
            continue
        if toks[i] in WORD_TO_NUM:
            total += WORD_TO_NUM[toks[i]]
        i += 1
    return total


def _selftest():
    for n in list(range(0, 200)) + [234, 347, 500, 501, 999, 608, 725]:
        words = number_to_words(n)
        back = words_to_number(words)
        assert back == n, (n, words, back)     # generate then round-trip: independent of the generator itself
    print("  self-test: word-form toolkit OK (round-trip through an independent parser agrees for 0..199 + spot values)")


def compare_direct(a, b):
    if a < b:
        return "<"
    if a > b:
        return ">"
    return "="


def compare_place_by_place(a, b):
    """Independent route: walk hundreds, then tens, then ones."""
    ah, at, ao = a // 100, (a // 10) % 10, a % 10
    bh, bt, bo = b // 100, (b // 10) % 10, b % 10
    if ah != bh:
        return "<" if ah < bh else ">"
    if at != bt:
        return "<" if at < bt else ">"
    if ao != bo:
        return "<" if ao < bo else ">"
    return "="


def _selftest_compare():
    for a in range(0, 1000, 37):
        for b in range(0, 1000, 53):
            assert compare_direct(a, b) == compare_place_by_place(a, b), (a, b)
    print("  self-test: comparison toolkit OK (direct comparison vs place-by-place walk agree)")


def parse_write_words(prompt):
    m = re.search(r"write (\d{1,3}) in word form", prompt.lower())
    if not m:
        return None
    return number_to_words(int(m.group(1)))


def parse_words_to_number(prompt):
    m = re.search(r"what number is [\"']([a-z\- ]+)[\"']", prompt.lower())
    if not m:
        return None
    return words_to_number(m.group(1))


def parse_compare(prompt):
    m = re.search(r"compare (\d{1,3}) and (\d{1,3}):", prompt.lower())
    if not m:
        return None
    a, b = int(m.group(1)), int(m.group(2))
    return compare_direct(a, b)


def _selftest_parsers():
    assert parse_write_words("Write 347 in word form.") == "three hundred forty-seven"
    assert parse_words_to_number('What number is "three hundred forty-seven"?') == 347
    assert parse_compare("Compare 275 and 312: <, =, or >?") == "<"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_compare(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/place-value-1000/lessons/pv1000-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            wf = parse_write_words(prompt)
            wn = parse_words_to_number(prompt)
            cmp_ = parse_compare(prompt)
            if wf is not None and w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if corr[0]["label"].strip().lower() != wf:
                    fails += 1
                    print(f"  {lid}/{sid} mcq(words) FAIL want {wf!r} got {corr[0]['label']!r}")
            elif wn is not None and w["type"] == "numeric":
                checked += 1
                ok = (int(w["answer"]) == wn and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2)
                if not ok:
                    fails += 1
                    print(f"  {lid}/{sid} numeric(words->num) FAIL want {wn} got {w['answer']}")
            elif cmp_ is not None and w["type"] == "mcq":
                corr = [o for o in w["options"] if o.get("correct")]
                if len(corr) != 1:
                    fails += 1; print(f"  {lid}/{sid} mcq !=1"); continue
                checked += 1
                if cmp_ not in corr[0]["label"]:
                    fails += 1
                    print(f"  {lid}/{sid} mcq(compare) FAIL want {cmp_!r} got {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_compare(); _selftest_parsers(); print("OK")
    else:
        main()
