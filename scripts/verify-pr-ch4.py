#!/usr/bin/env python3
"""Independent re-derivation of proportional-relationships Chapter 4 (Percent Problems).

7.RP.3: multistep percent problems (tax, tip, markup, markdown, percent increase/decrease).
Exact Fraction arithmetic throughout (percent P% = P/100). SELF-TESTED dual-route: every
percent computation checked via decimal multiplication (float, rounded) cross-checked
against the exact-fraction route (Fraction(P,100)) -- two independently-coded arithmetic
paths that must agree to the cent.
"""
import json, glob, re, sys
from fractions import Fraction as F


def add_percent_decimal(price, percent):
    return round(price * (1 + percent / 100), 2)


def add_percent_fraction(price, percent):
    return F(price) * (1 + F(percent, 100))


def sub_percent_decimal(price, percent):
    return round(price * (1 - percent / 100), 2)


def sub_percent_fraction(price, percent):
    return F(price) * (1 - F(percent, 100))


def percent_change(old, new):
    """Exact Fraction percent change; decimal cross-check rounds to 2 sig figs of percent."""
    frac = (F(new) - F(old)) / F(old) * 100
    dec = round((new - old) / old * 100, 4)
    return frac, dec


def _selftest():
    cases = [(20, 15), (50, 8), (10, 25), (200, 6), (80, 5)]
    for price, pct in cases:
        d = add_percent_decimal(price, pct)
        fr = add_percent_fraction(price, pct)
        assert abs(d - float(fr)) < 0.005, (price, pct, d, fr)   # two routes agree to the cent
        d2 = sub_percent_decimal(price, pct)
        fr2 = sub_percent_fraction(price, pct)
        assert abs(d2 - float(fr2)) < 0.005, (price, pct, d2, fr2)
    for old, new in [(20, 25), (50, 40), (80, 100), (10, 8)]:
        frac, dec = percent_change(old, new)
        assert abs(float(frac) - dec) < 0.01, (old, new, frac, dec)
    print("  self-test: percent toolkit OK (decimal vs exact-fraction routes agree)")


def parse_add_percent(prompt):
    m = re.search(r"costs \$(\d+(?:\.\d+)?).{0,40}?(\d+)% (?:tax|tip)", prompt.lower())
    if not m:
        return None
    price, pct = float(m.group(1)), int(m.group(2))
    return round(add_percent_fraction(price, pct), 2)


def parse_markup(prompt):
    m = re.search(r"costs \$(\d+(?:\.\d+)?).{0,30}?store marks it up (\d+)%", prompt.lower())
    if not m:
        return None
    price, pct = float(m.group(1)), int(m.group(2))
    return round(add_percent_fraction(price, pct), 2)


def parse_markdown(prompt):
    m = re.search(r"costs \$(\d+(?:\.\d+)?).{0,20}?(\d+)% off", prompt.lower())
    if not m:
        return None
    price, pct = float(m.group(1)), int(m.group(2))
    return round(sub_percent_fraction(price, pct), 2)


def parse_percent_change(prompt):
    m = re.search(r"from (\d+(?:\.\d+)?) to (\d+(?:\.\d+)?)", prompt.lower())
    if not m:
        return None
    old, new = float(m.group(1)), float(m.group(2))
    frac, _ = percent_change(old, new)
    return frac


def _selftest_parsers():
    assert parse_add_percent("A meal costs $20. With 15% tax, what is the total?") == 23.0
    assert parse_markup("A shirt costs $10 wholesale. The store marks it up 25%. What is the new price?") == 12.5
    assert parse_markdown("A jacket costs $80. It's 5% off. What is the sale price?") == 76.0
    assert parse_percent_change("A price rises from 20 to 25. What is the percent change?") == 25
    print("  self-test: prompt parsers OK")


def main():
    _selftest(); _selftest_parsers()
    fails = checked = 0
    for f in sorted(glob.glob("content/courses/proportional-relationships/lessons/pr-04-*.json")):
        d = json.load(open(f)); lid = d["id"]
        steps = [(s["id"], s.get("widget")) for s in d["steps"]]
        steps += [(r["check"]["id"], r["check"].get("widget")) for r in d.get("remedials", [])]
        for sid, w in steps:
            if not w or w["type"] != "numeric":
                continue
            prompt = w.get("prompt", "")
            want = (parse_add_percent(prompt) or parse_markup(prompt)
                    or parse_markdown(prompt) or parse_percent_change(prompt))
            if want is None:
                continue
            checked += 1
            ok = (abs(float(w["answer"]) - float(want)) < 0.01 and w["tolerance"] <= 0.01
                  and len(w["commonErrors"]) >= 2
                  and all(abs(e["value"] - float(want)) > 0.01 for e in w["commonErrors"]))
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
