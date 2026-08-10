#!/usr/bin/env python3
"""Independent verification of counting-to-20-k Chapter 1 (Counting to 10), K.CC.4-5.

The mechanically checkable content: widget-integrity facts read FROM DISK (subitize option
lists must contain the count; commonPicks/commonCounts must differ from the answer; tenFrame
preFilled < target) plus count-on facts.

SELF-TESTED dual-route for count-on:
  Route A (arithmetic): landing = start + hops.
  Route B (successor iteration): apply "next number" hops times. Cross-checked on a grid.
"""
import sys, json, glob


def land_A(start, hops):
    return start + hops


def land_B(start, hops):
    v = start
    for _ in range(hops):
        v = v + 1
    return v


def _selftest():
    mism = sum(1 for s in range(0, 10) for h in range(1, 6) if land_A(s, h) != land_B(s, h))
    assert mism == 0
    print("  self-test: arithmetic vs successor-iteration count-on agree (s,h grid)")


def main():
    _selftest()
    fails = checked = 0

    # count-on facts: (start, hops, landing)
    for s, h, e in [(3, 2, 5), (5, 3, 8), (6, 4, 10), (6, 1, 7), (7, 2, 9), (8, 1, 9), (4, 1, 5)]:
        checked += 1
        if land_A(s, h) != e or land_B(s, h) != e:
            fails += 1
            print(f"  COUNT-ON FAIL {s}+{h}: {land_A(s,h)} vs {e}")

    # widget integrity from disk
    for f in sorted(glob.glob("content/courses/counting-to-20-k/lessons/kc-01-*.json")):
        d = json.load(open(f))
        allsteps = list(d["steps"]) + [r["check"] for r in d.get("remedials", [])]
        for st in allsteps:
            w = st.get("widget")
            if not w:
                continue
            if w["type"] == "subitizeFlash":
                checked += 1
                if w["count"] not in w["options"]:
                    fails += 1
                    print(f"  SUBITIZE FAIL {f} {st['id']}: count {w['count']} not in options")
                checked += 1
                if any(p["value"] == w["count"] for p in w["commonPicks"]):
                    fails += 1
                    print(f"  SUBITIZE FAIL {f} {st['id']}: commonPick equals count")
            if w["type"] == "tenFrame":
                checked += 1
                if not (w["preFilled"] < w["target"] <= 10):
                    fails += 1
                    print(f"  TENFRAME FAIL {f} {st['id']}")
                checked += 1
                if any(c["count"] == w["target"] for c in w["commonCounts"]):
                    fails += 1
                    print(f"  TENFRAME FAIL {f} {st['id']}: commonCount equals target")
            if w["type"] == "numberLineHop":
                checked += 1
                sign = -1 if w["direction"] == "back" else 1
                land = w["start"] + sign * w["hop"] * w["hops"]
                if not (w["min"] <= land <= w["max"]) or any(c["value"] == land for c in w["commonLandings"]):
                    fails += 1
                    print(f"  HOP FAIL {f} {st['id']}")

    print(f"VERIFIED {checked} facts, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
        print("OK")
    else:
        main()
