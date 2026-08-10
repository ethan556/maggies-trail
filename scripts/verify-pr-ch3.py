#!/usr/bin/env python3
"""Independent re-derivation of proportional-relationships Chapter 3
(Graphs of Proportional Relationships).

7.RP.2c-d: graph y=kx, recognizing the point (1,k) as the unit rate. Constrained by the
REAL plotPoint schema (checked directly, not assumed): 1-based integer targets, cols/rows
capped at 8 -- so the origin (0,0) can never be a plotPoint target (min=1), and only small
k/x combinations fit. SELF-TESTED dual-route: y=k*x checked via direct multiplication vs
building y by adding k repeatedly x times (incremental construction) -- two independent
routes to the same value, for every target on every graphed line.
"""
import json, glob, re, sys


def y_direct(k, x):
    return k * x


def y_incremental(k, x):
    total = 0
    for _ in range(x):
        total += k
    return total


def _selftest():
    for k in range(1, 5):
        for x in range(1, 9):
            assert y_direct(k, x) == y_incremental(k, x), (k, x)   # two routes agree
    print("  self-test: proportional-graph toolkit OK (direct multiply vs incremental add agree)")


def parse_k_from_context(prompt_or_body):
    m = re.search(r"unit rate (?:of|is) (\d+)", prompt_or_body.lower())
    if m:
        return int(m.group(1))
    m = re.search(r"k\s*=\s*(\d+)", prompt_or_body.lower())
    if m:
        return int(m.group(1))
    return None


def rate_from_point(prompt):
    """'the point (x, y) represents ...' -> rate = y/x (only used when it divides evenly)."""
    m = re.search(r"point \((\d+),\s*(\d+)\)", prompt.lower())
    if not m:
        return None
    x, y = int(m.group(1)), int(m.group(2))
    if x == 0 or y % x != 0:
        return None
    return y // x


def _selftest_parsers():
    assert parse_k_from_context("This line has a unit rate of 3.") == 3
    assert parse_k_from_context("For k = 2, plot the following points.") == 2
    assert rate_from_point("The graphed point (4, 20) represents a car trip. What is the rate?") == 5
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/proportional-relationships/lessons/pr-03-*.json")):
        d = json.load(open(f)); lid = d["id"]
        # gather concept-step text preceding each widget, for k-context lookup
        all_steps = d["steps"]
        for r in d.get("remedials", []):
            all_steps = all_steps + [r["concept"], r["check"]]
        running_context = ""
        for s in all_steps:
            if s["kind"] == "concept":
                running_context = s["body"]
                continue
            w = s.get("widget")
            if not w:
                continue
            prompt = w.get("prompt", "")
            if w["type"] == "plotPoint":
                k = parse_k_from_context(prompt) or parse_k_from_context(running_context)
                if k is None:
                    continue
                checked += 1
                for t in w["targets"]:
                    want = y_direct(k, t["x"])
                    if t["y"] != want or y_incremental(k, t["x"]) != want:
                        fails += 1
                        print(f"  {lid}/{s['id']} plotPoint FAIL target ({t['x']},{t['y']}) want y={want} for k={k}")
                # the origin can never legitimately be a target (schema min=1) -- assert that too
                for t in w["targets"]:
                    if t["x"] < 1 or t["y"] < 1:
                        fails += 1
                        print(f"  {lid}/{s['id']} plotPoint FAIL target below schema minimum of 1")
            elif w["type"] == "numeric":
                want = rate_from_point(prompt)
                if want is None:
                    continue
                checked += 1
                ok = (int(w["answer"]) == want and w["tolerance"] == 0
                      and len(w["commonErrors"]) >= 2
                      and all(e["value"] != want for e in w["commonErrors"]))
                if not ok:
                    fails += 1
                    print(f"  {lid}/{s['id']} numeric FAIL want {want} got {w['answer']}")
    print(f"VERIFIED {checked} widgets, FAILS {fails}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest(); _selftest_parsers(); print("OK")
    else:
        main()
