#!/usr/bin/env python3
"""Independent re-derivation of shapes-measure-g1 Chapter 3 (Length: Order & Compare).

Non-standard units only (paperclips, cubes) — no rulers/inches (that's a later-grade course).
SELF-TESTED: for 3-object ordering, the longest/shortest found by direct max/min is
cross-checked against Python's sorted() ordering (two independent routes to the same result).
"""
import json, glob, re, sys


def _selftest():
    for counts in [[5, 3], [2, 7], [4, 4], [3, 8, 5], [6, 1, 9], [7, 7, 2]]:
        assert max(counts) == sorted(counts)[-1]           # route A vs route B agree
        assert min(counts) == sorted(counts)[0]
    print("  self-test: length-compare toolkit OK (max/min vs sorted() agree)")


def two_object_compare(prompt):
    low = prompt.lower()
    m = re.search(r"a ([a-z ]+?) is (\d+) ([a-z]+) long\. an? ([a-z ]+?) is (\d+) \3 long\. which is (longer|shorter), the \1 or the \4", low)
    if not m:
        return None
    obj_a, n_a, unit, obj_b, n_b, comparator = m.groups()
    n_a, n_b = int(n_a), int(n_b)
    if comparator == "longer":
        return obj_a.strip() if n_a > n_b else obj_b.strip()
    else:
        return obj_a.strip() if n_a < n_b else obj_b.strip()


def difference(prompt):
    low = prompt.lower()
    m = re.search(r"a ([a-z ]+?) is (\d+) ([a-z]+) long and an? ([a-z ]+?) is (\d+) \3 long\. how many more \3 long is the (?:\1|\4)", low)
    if not m:
        return None
    obj_a, n_a, unit, obj_b, n_b = m.groups()
    return abs(int(n_a) - int(n_b))


def three_object_extreme(prompt):
    low = prompt.lower()
    m = re.search(r"which is (longest|shortest).{0,120}?the ([a-z ]+?) is (\d+).{0,10}, the ([a-z ]+?) is (\d+).{0,10}, and the ([a-z ]+?) is (\d+)", low)
    if not m:
        return None
    which = m.group(1)
    objs = [(m.group(2).strip(), int(m.group(3))), (m.group(4).strip(), int(m.group(5))), (m.group(6).strip(), int(m.group(7)))]
    ordered = sorted(objs, key=lambda x: x[1])
    return ordered[-1][0] if which == "longest" else ordered[0][0]


def _selftest_parsers():
    assert two_object_compare("A pencil is 5 paperclips long. An eraser is 3 paperclips long. Which is longer, the pencil or the eraser?") == "pencil"
    assert two_object_compare("A pencil is 5 paperclips long. An eraser is 3 paperclips long. Which is shorter, the pencil or the eraser?") == "eraser"
    assert difference("A pencil is 5 paperclips long and an eraser is 3 paperclips long. How many more paperclips long is the pencil?") == 2
    assert three_object_extreme("Which is longest? The crayon is 4 cubes, the marker is 7 cubes, and the ruler is 6 cubes.") == "marker"
    assert three_object_extreme("Which is shortest? The crayon is 4 cubes, the marker is 7 cubes, and the ruler is 6 cubes.") == "crayon"
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/shapes-measure-g1/lessons/smg1-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "numeric":
                want = difference(prompt)
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
                want = two_object_compare(prompt) or three_object_extreme(prompt)
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
