#!/usr/bin/env python3
"""Independent verification of counting-to-20-k Chapters 2-3 (Comparing; Teen Numbers & Tens).

SELF-TESTED dual-route:
  Comparison — Route A: integer < / > / ==. Route B: pairing simulation (remove one from
    each group until one empties; leftovers decide). Cross-checked on a grid.
  Teens — Route A: t = 10 + extra. Route B: count-all over ten tokens plus extras.
  Decades — Route A: arithmetic n*10. Route B: repeated ten-hops.
Plus dragOrder integrity read from disk: correctOrder must be a sorted-ascending relabeling,
items must be a permutation of correctOrder, and the presented order must differ from it.
"""
import sys, json, glob


def cmp_A(a, b):
    return "more" if a > b else "fewer" if a < b else "equal"


def cmp_B(a, b):
    x, y = a, b
    while x > 0 and y > 0:
        x -= 1
        y -= 1
    return "more" if x > 0 else "fewer" if y > 0 else "equal"


def teen_A(extra):
    return 10 + extra


def teen_B(extra):
    return len([1] * 10 + [1] * extra)


def dec_A(n):
    return n * 10


def dec_B(n):
    v = 0
    for _ in range(n):
        v += 10
    return v


def _selftest():
    mism = 0
    for a in range(0, 12):
        for b in range(0, 12):
            if cmp_A(a, b) != cmp_B(a, b):
                mism += 1
    for e in range(0, 10):
        if teen_A(e) != teen_B(e):
            mism += 1
    for n in range(0, 11):
        if dec_A(n) != dec_B(n):
            mism += 1
    assert mism == 0, f"{mism} mismatches"
    print("  self-test: integer-compare vs pairing, ten-plus vs count-all, arithmetic vs hop decades all agree")


def main():
    _selftest()
    fails = checked = 0

    # comparison facts: (a, b, expected relation of a)
    for a, b, e in [(5, 3, "more"), (4, 6, "fewer"), (7, 7, "equal"), (8, 5, "more"), (3, 5, "fewer"),
                    (9, 3, "more"), (2, 6, "fewer"), (10, 9, "more"), (6, 4, "more")]:
        checked += 1
        if cmp_A(a, b) != e or cmp_B(a, b) != e:
            fails += 1
            print(f"  CMP FAIL {a} vs {b}")

    # greatest-of-three facts
    checked += 1
    if max(4, 6, 5) != 6 or max(6, 2, 8) != 8:
        fails += 1

    # ordering facts
    for nums, expect in [([5, 2, 7], [2, 5, 7]), ([9, 1, 4], [1, 4, 9]), ([8, 0, 3], [0, 3, 8]),
                         ([6, 10, 2, 5], [2, 5, 6, 10])]:
        checked += 1
        if sorted(nums) != expect:
            fails += 1
            print(f"  ORDER FAIL {nums}")

    # between/successor facts
    for a, b, mid in [(4, 7, 6), (7, 9, 8), (5, 7, 6), (15, 17, 16)]:
        checked += 1
        # the authored "missing" numbers: verify the run a..b contains mid contiguous
        if not (a < mid < b) or (b - a == 2 and mid != a + 1):
            fails += 1
            print(f"  BETWEEN FAIL {a},{mid},{b}")

    # teens: (extra, teen)
    for e, t in [(2, 12), (5, 15), (6, 16), (8, 18), (9, 19), (3, 13), (1, 11), (4, 14), (7, 17)]:
        checked += 1
        if teen_A(e) != t or teen_B(e) != t:
            fails += 1
            print(f"  TEEN FAIL 10+{e}")

    # count-to-20 hops: (start, hops, landing)
    for s, h, e in [(9, 3, 12), (14, 4, 18), (18, 2, 20), (13, 7, 20), (16, 1, 17)]:
        checked += 1
        if s + h != e:
            fails += 1
            print(f"  HOP FAIL {s}+{h}")

    # decades: sequences and hop counts
    checked += 1
    if [dec_A(n) for n in range(1, 11)] != [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]:
        fails += 1
    checked += 1
    if dec_A(10) != 100 or dec_B(10) != 100:   # ten ten-hops reach 100
        fails += 1
    for prev, nxt in [(40, 50), (20, 30), (60, 70)]:
        checked += 1
        if prev + 10 != nxt:
            fails += 1
    checked += 1
    if 60 + 4 * 10 != 100:  # race-to-100 interactive
        fails += 1

    # dragOrder integrity from disk (kc-02-03)
    for f in sorted(glob.glob("content/courses/counting-to-20-k/lessons/kc-02-*.json")) + \
             sorted(glob.glob("content/courses/counting-to-20-k/lessons/kc-03-*.json")):
        d = json.load(open(f))
        for st in d["steps"]:
            w = st.get("widget")
            if not w or w["type"] != "dragOrder":
                continue
            labels = {it["id"]: int(it["label"]) for it in w["items"]}
            checked += 1
            ordered = [labels[i] for i in w["correctOrder"]]
            if ordered != sorted(labels.values()):
                fails += 1
                print(f"  DRAGORDER FAIL {f} {st['id']}: correctOrder not ascending")
            checked += 1
            if [it["id"] for it in w["items"]] == w["correctOrder"]:
                fails += 1
                print(f"  DRAGORDER FAIL {f} {st['id']}: presented pre-sorted")
            checked += 1
            if sorted(labels.keys()) != sorted(w["correctOrder"]):
                fails += 1
                print(f"  DRAGORDER FAIL {f} {st['id']}: not a permutation")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
