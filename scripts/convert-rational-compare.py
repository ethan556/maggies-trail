#!/usr/bin/env python3
"""mcq -> rationalCompare conversion, session 27.

19 steps across fa-02-01/02/03 (benchmark comparisons vs 1/2 and each other)
and ns-04-02 / ns-05-02 / ns-05-03 (signed-value comparisons, fraction/decimal
mixed pairs). Every authored feedback string is carried VERBATIM into the slot
matching the relation its option asserted; options with no relational analogue
("can't tell", "not enough info") are dropped and logged. One authored fb is a
duplicate relation-claim (ns-04-02/k2 option c asserts the same ">" as b) and
is merged-dropped; the eq state it leaves reachable gets ONE NEW eqFeedback,
marked NEW below. Prompts, ids, kinds, tags, hints, and every other field are
byte-preserved (asserted).
"""
import json
from fractions import Fraction

F = lambda n, d: {"num": n, "den": d}
S = lambda v: {"value": v}

NEW_EQ_NS0402_K2 = (
    "-6 and -1 aren't the same point: -1 sits five steps closer to zero, "
    "so -1 is greater. The true statement is -6 < -1."
)

# step -> (left, right, answer, {optionId: slot}, drops, labels, {slot: NEW text})
# slot is one of: success | lt | eq | gt.  Every option id must appear exactly
# once across the map and drops.
CONV = {
    ("fractions-add", "fa-02-01"): {
        "k1": (F(1, 3), F(1, 2), "lt", {"a": "success", "b": "gt", "c": "eq"}, ["d"], None, {}),
        "k2": (F(3, 8), F(1, 2), "lt", {"a": "success", "b": "gt", "c": "eq"}, ["d"], None, {}),
        "k3": (F(11, 20), F(1, 2), "gt", {"a": "success", "b": "lt", "c": "eq"}, ["d"], None, {}),
        "ch1": (F(13, 24), F(1, 2), "gt", {"a": "success", "b": "lt", "c": "eq"}, ["d"], None, {}),
    },
    ("fractions-add", "fa-02-02"): {
        "k1": (F(7, 15), F(9, 16), "lt", {"a": "success", "b": "gt", "c": "eq"}, ["d"], None, {}),
        "k3": (F(5, 11), F(4, 7), "lt", {"a": "success", "b": "gt", "c": "eq"}, ["d"], None, {}),
        "ch1": (F(7, 15), F(9, 16), "lt", {"a": "success", "b": "gt", "c": "eq"}, ["d"], ("Team A", "Team B"), {}),
    },
    ("fractions-add", "fa-02-03"): {
        "k1": (F(1, 12), F(11, 12), "lt", {"a": "success", "b": "gt", "c": "eq"}, ["d"], None, {}),
        "k2": (F(3, 7), F(2, 5), "gt", {"a": "success", "b": "lt", "c": "eq"}, ["d"], None, {}),
    },
    ("number-system", "ns-04-02"): {
        "i1": (S("-2"), S("-5"), "gt", {"a": "success", "b": "lt", "c": "eq"}, [], None, {}),
        "k1": (S("-3"), S("-8"), "gt", {"a": "success", "b": "lt", "c": "eq"}, [], None, {}),
        # c ("-1 < -6") asserts the same relation as b ("-6 > -1"): merged into
        # the gt slot keeping b's fb (it names the ">" claim in slot direction);
        # c's fb dropped+logged. eq becomes reachable with no authored fb -> NEW.
        "k2": (S("-6"), S("-1"), "lt", {"a": "success", "b": "gt"}, ["c"], None, {"eq": NEW_EQ_NS0402_K2}),
        "k3": (S("-100"), S("1"), "lt", {"a": "success", "b": "gt", "c": "eq"}, [], None, {}),
    },
    ("number-system", "ns-05-02"): {
        "i1": (S("-2"), S("-8"), "gt", {"a": "success", "b": "lt", "c": "eq"}, [], None, {}),
        "ch1": (S("-120"), S("-80"), "lt", {"a": "success", "b": "gt", "c": "eq"}, [], ("Submarine", "Fish"), {}),
    },
    ("number-system", "ns-05-03"): {
        "i1": (F(3, 4), S("0.5"), "gt", {"a": "success", "b": "lt", "c": "eq"}, [], None, {}),
        "k1": (F(-1, 2), F(-3, 4), "gt", {"a": "success", "b": "lt", "c": "eq"}, [], None, {}),
        "k2": (S("-2"), F(-1, 2), "lt", {"a": "success", "b": "gt", "c": "eq"}, [], None, {}),
        "k3": (F(2, 5), S("0.6"), "lt", {"a": "success", "b": "gt", "c": "eq"}, [], None, {}),
    },
}


def as_fraction(op):
    if "num" in op:
        return Fraction(op["num"], op["den"])
    return Fraction(op["value"])


def convert():
    converted, dropped = 0, []
    for (course, lid), steps in CONV.items():
        path = f"content/courses/{course}/lessons/{lid}.json"
        orig_text = open(path, encoding="utf-8").read()
        L = json.loads(orig_text)
        before = {s["id"]: json.dumps({k: v for k, v in s.items() if k != "widget"}, sort_keys=True) for s in L["steps"]}
        lesson_shell_before = json.dumps({k: v for k, v in L.items() if k != "steps"}, sort_keys=True)

        for s in L["steps"]:
            if s["id"] not in steps:
                continue
            left, right, ans, omap, drops, labels, new = steps[s["id"]]
            w = s["widget"]
            assert w["type"] == "mcq", f"{lid}/{s['id']}: expected mcq, got {w['type']}"
            opts = {o["id"]: o for o in w["options"]}
            assert set(opts) == set(omap) | set(drops), f"{lid}/{s['id']}: option ids {set(opts)} != mapped {set(omap) | set(drops)}"
            correct_ids = [o["id"] for o in w["options"] if o.get("correct")]
            assert len(correct_ids) == 1 and omap[correct_ids[0]] == "success", f"{lid}/{s['id']}: correct option must map to success"

            # Exact truth re-derivation must match the authored answer.
            lf, rf = as_fraction(left), as_fraction(right)
            truth = "lt" if lf < rf else "gt" if lf > rf else "eq"
            assert truth == ans, f"{lid}/{s['id']}: truth {truth} != mapped answer {ans}"

            nw = {"type": "rationalCompare", "prompt": w["prompt"], "left": left, "right": right}
            if labels:
                nw["leftLabel"], nw["rightLabel"] = labels
            nw["answer"] = ans
            slots = dict(new)  # NEW text first; verbatim mappings overwrite nothing (disjoint slots)
            for oid, slot in omap.items():
                if slot == "success":
                    continue
                assert slot not in slots, f"{lid}/{s['id']}: slot {slot} doubly assigned"
                slots[slot] = opts[oid]["feedback"]
            for sym in ("lt", "eq", "gt"):
                if sym == ans:
                    assert sym not in slots, f"{lid}/{s['id']}: answer slot {sym} must stay absent"
                else:
                    assert sym in slots, f"{lid}/{s['id']}: wrong slot {sym} unfilled"
                    nw[f"{sym}Feedback"] = slots[sym]
            nw["successFeedback"] = opts[correct_ids[0]]["feedback"]
            s["widget"] = nw
            converted += 1
            for d in drops:
                dropped.append(f"{lid}/{s['id']}: option {d} ('{opts[d]['label'][:40]}') fb dropped — no relational analogue")

        # Freeze proof: every non-widget step field and every non-steps lesson field unchanged.
        after = {s["id"]: json.dumps({k: v for k, v in s.items() if k != "widget"}, sort_keys=True) for s in L["steps"]}
        assert before == after, f"{lid}: a non-widget step field changed"
        assert lesson_shell_before == json.dumps({k: v for k, v in L.items() if k != "steps"}, sort_keys=True), f"{lid}: lesson shell changed"

        open(path, "w", encoding="utf-8").write(json.dumps(L, indent=2, ensure_ascii=False))
        print(f"{lid}: {sum(1 for sid in steps)} steps converted")

    print(f"\nTOTAL converted: {converted}")
    print("DROPPED (no relational analogue / merged duplicate claim):")
    for d in dropped:
        print("  -", d)
    print("NEW text: ns-04-02/k2 eqFeedback (reachable-state rule)")


if __name__ == "__main__":
    convert()
