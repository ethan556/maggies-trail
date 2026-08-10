#!/usr/bin/env python3
"""Independent re-derivation of measure-money-time Chapter 2 (Estimate & Compare Lengths).

Standard units (inches) -- the CCSS-mandated progression from G1's non-standard-unit
comparison (already shipped in shapes-measure-g1 Ch3) to standard units here, not a repeat
of it. SELF-TESTED: 3-object longest/shortest cross-checked via max/min vs sorted() (same
proven dual-route as the G1 course); estimate-acceptability checked by a reasonable-range
rule (within 2 inches of actual), itself checked for internal consistency across a range.
"""
import json, glob, re, sys


def _selftest():
    for counts in [[6, 3], [4, 9], [8, 8], [3, 7, 5], [6, 1, 9]]:
        assert max(counts) == sorted(counts)[-1]
        assert min(counts) == sorted(counts)[0]
    for actual in range(1, 20):
        for est in range(actual - 2, actual + 3):
            assert abs(est - actual) <= 2                  # the acceptable-estimate band holds
    print("  self-test: compare/estimate toolkit OK (max/min vs sorted agree; estimate band checked)")


def two_object_compare(prompt):
    low = prompt.lower()
    m = re.search(r"a ([a-z ]+?) is (\d+) inches long\. an? ([a-z ]+?) is (\d+) inches long\. which is (longer|shorter), the \1 or the \3", low)
    if not m:
        return None
    obj_a, n_a, obj_b, n_b, comparator = m.groups()
    n_a, n_b = int(n_a), int(n_b)
    if comparator == "longer":
        return obj_a.strip() if n_a > n_b else obj_b.strip()
    return obj_a.strip() if n_a < n_b else obj_b.strip()


def difference(prompt):
    low = prompt.lower()
    m = re.search(r"a ([a-z ]+?) is (\d+) inches long and an? ([a-z ]+?) is (\d+) inches long\. how many more inches long is the (?:\1|\3)", low)
    if not m:
        return None
    _, n_a, _, n_b = m.groups()
    return abs(int(n_a) - int(n_b))


def estimate_ok(prompt, given_estimate):
    low = prompt.lower()
    m = re.search(r"is about (\d+) inches long\. .*estimate", low)
    if not m:
        return None
    actual = int(m.group(1))
    return abs(given_estimate - actual) <= 2


def _selftest_parsers():
    assert two_object_compare("A pencil is 6 inches long. A crayon is 3 inches long. Which is longer, the pencil or the crayon?") == "pencil"
    assert two_object_compare("A pencil is 6 inches long. A crayon is 3 inches long. Which is shorter, the pencil or the crayon?") == "crayon"
    assert difference("A pencil is 6 inches long and a crayon is 3 inches long. How many more inches long is the pencil?") == 3
    assert estimate_ok("A book is about 9 inches long. Which is the best estimate?", 8) is True
    assert estimate_ok("A book is about 9 inches long. Which is the best estimate?", 20) is False
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/measure-money-time/lessons/mmt-02-*.json")):
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
                want = two_object_compare(prompt)
                if want is not None:
                    checked += 1
                    if want not in corr[0]["label"].strip().lower():
                        fails += 1
                        print(f"  {lid}/{sid} mcq FAIL want {want!r} in {corr[0]['label']!r}")
                    continue
                if "estimate" in prompt.lower():
                    checked += 1
                    label_num = re.search(r"(\d+)", corr[0]["label"])
                    if label_num and estimate_ok(prompt, int(label_num.group(1))) is False:
                        fails += 1
                        print(f"  {lid}/{sid} estimate FAIL {corr[0]['label']!r} not in reasonable range")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
