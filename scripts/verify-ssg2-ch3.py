#!/usr/bin/env python3
"""Independent re-derivation of shapes-shares-g2 Chapter 3 (Introducing Thirds).

Scoped narrowly: thirds themselves (informal vocabulary, no numeral notation -- matching
CCSS 2.G.3's word-based target and the shapes-measure-g1 precedent), never re-teaching
halves/fourths or the shape-invariance nuance (both already owned elsewhere -- see
DECISIONS.md). SELF-TESTED relational invariant: more equal parts means a smaller share,
verified by comparing part-counts directly (3 for thirds sits between 2 for halves and
4 for fourths) rather than assumed.
"""
import json, glob, re, sys

PARTS = {"halves": 2, "thirds": 3, "fourths": 4}
NAME = {"halves": "half", "thirds": "third", "fourths": "fourth"}


def _selftest():
    # more parts -> smaller share, verified structurally across all three
    ordered = sorted(PARTS.items(), key=lambda kv: kv[1])
    assert [k for k, _ in ordered] == ["halves", "thirds", "fourths"]
    assert PARTS["halves"] < PARTS["thirds"] < PARTS["fourths"]
    print("  self-test: thirds toolkit OK (halves < thirds < fourths part-count ordering)")


def parts_answer(prompt):
    low = prompt.lower()
    m = re.search(r"split (?:a whole )?into (thirds|halves|fourths).{0,40}how many equal parts", low)
    if m:
        return PARTS[m.group(1)]
    return None


def name_answer(prompt):
    low = prompt.lower()
    m = re.search(r"split into (\d+) equal parts.*what do you call each part", low)
    if m:
        n = int(m.group(1))
        for word, count in PARTS.items():
            if count == n:
                return NAME[word]
    return None


def bigger_smaller_answer(prompt):
    low = prompt.lower()
    m = re.search(r"which is (bigger|smaller): a (half|third|fourth) or a (half|third|fourth)", low)
    if not m:
        return None
    direction, a, b = m.groups()
    inv = {"half": "halves", "third": "thirds", "fourth": "fourths"}
    va, vb = PARTS[inv[a]], PARTS[inv[b]]
    if direction == "bigger":
        return a if va < vb else b            # fewer parts = bigger share
    return a if va > vb else b                 # more parts = smaller share


def _selftest_parsers():
    assert parts_answer("If you split a whole into thirds, how many equal parts do you get?") == 3
    assert name_answer("If a whole is split into 3 equal parts, what do you call each part?") == "third"
    assert bigger_smaller_answer("Which is bigger: a half or a third?") == "half"
    assert bigger_smaller_answer("Which is smaller: a third or a fourth?") == "fourth"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-shares-g2/lessons/ssg2-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = parts_answer(prompt)
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
                want = name_answer(prompt) or bigger_smaller_answer(prompt)
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
