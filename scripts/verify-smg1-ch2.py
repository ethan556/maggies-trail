#!/usr/bin/env python3
"""Independent re-derivation of shapes-measure-g1 Chapter 2 (Halves & Quarters).

Scoped strictly to informal CCSS 1.G.3 vocabulary (halves, fourths, quarters as WORDS) —
no numeral fraction notation (that layer belongs to the shapes-space/fractions courses).
SELF-TESTED against a genuine relational invariant: 2 fourths make 1 half (splitting each
half again in two gives four fourths total), not just a lookup of part-counts.
"""
import json, glob, re, sys

PARTS = {"halves": 2, "fourths": 4, "quarters": 4}   # "quarter" is a synonym of "fourth"
NAME = {"halves": "half", "fourths": "fourth", "quarters": "quarter"}


def _selftest():
    assert PARTS["fourths"] == PARTS["quarters"]                  # synonyms agree
    assert PARTS["fourths"] // 2 == PARTS["halves"]                # 2 fourths = 1 half (relational check)
    assert PARTS["halves"] * 2 == PARTS["fourths"]                 # same invariant, other direction
    print("  self-test: halves/quarters toolkit OK (fourths/quarters agree; 2 fourths = 1 half)")


def numeric_answer(prompt):
    low = prompt.lower()
    m = re.search(r"split (?:a whole )?into (halves|fourths|quarters).{0,40}how many equal parts", low)
    if m:
        return PARTS[m.group(1)]
    if "how many fourths make one half" in low or "how many fourths make 1 half" in low:
        return PARTS["fourths"] // PARTS["halves"]
    if "how many halves make one whole" in low:
        return 2
    return None


def mcq_answer(prompt):
    low = prompt.lower()
    m = re.search(r"split into (\d+) equal parts.*what do you call each part", low)
    if m:
        n = int(m.group(1))
        names = {NAME[w] for w, c in PARTS.items() if c == n}   # both synonyms when count==4
        return names if names else None
    return None


def _selftest_parsers():
    assert numeric_answer("If you split a whole into halves, how many equal parts do you get?") == 2
    assert numeric_answer("If you split a whole into fourths, how many equal parts do you get?") == 4
    assert numeric_answer("If you split a whole into quarters, how many equal parts do you get?") == 4
    assert numeric_answer("How many fourths make one half?") == 2
    assert mcq_answer("If a whole is split into 2 equal parts, what do you call each part?") == {"half"}
    assert mcq_answer("If a whole is split into 4 equal parts, what do you call each part?") == {"fourth", "quarter"}
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-measure-g1/lessons/smg1-02-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = numeric_answer(prompt)
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
                want = mcq_answer(prompt)
                if want is None:
                    continue
                checked += 1
                label = corr[0]["label"].strip().lower()
                if not any(name in label for name in want):
                    fails += 1
                    print(f"  {lid}/{sid} mcq FAIL want one of {want!r} in {corr[0]['label']!r}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
