#!/usr/bin/env python3
"""S180: wire exp-function onto exactNumberLab.
All edits are staged on a string copy; every anchor is count-asserted BEFORE any write.
The file is written once, only if every assertion holds."""
from pathlib import Path

P = Path(__file__).resolve().parents[2] / "src/lib/variants.ts"
src = P.read_text(encoding="utf-8")
orig = src

BRANCHES = [
    # (unique prompt-template anchor, unique explanation-template anchor, params TS literal)
    (r"`For f(x) = ${a} * ${b}^x, what is the initial value f(0)?`",
     r"`${b}\u2070 = 1, so f(0) = ${a} \u00b7 1 = ${a}.`",
     "{ kind: \"exp-zero\", a, b }"),
    (r"`${story}: ${L}(x) = ${C} * ${b}^x. What is ${L}(${v})?`",
     r"`${b}^${v} = ${b ** v}, so ${L}(${v}) = ${C} \u00b7 ${b ** v} = ${ans}.`",
     "{ kind: \"exp-eval\", a: C, b, v }"),
    (r"`For A(x) = ${C} * ${b}^x, what is the starting amount A(0)?`",
     r"`Any base to the 0 is 1: A(0) = ${C} \u00b7 1 = ${C}.`",
     "{ kind: \"exp-zero\", a: C, b }"),
    (r"`A material decays to a quarter each step: Q(x) = ${C} * (1/4)^x. What is Q(2)?`",
     r"`Two quarterings divide by 16: Q(2) = ${C}/16 = ${ans}.`",
     "{ kind: \"exp-decay\", a: C, den: 4, steps: 2 }"),
    (r"`${story}: ${L}(x) = ${C} * (1/2)^x. What is ${L}(3)?`",
     r"`Three halvings divide by 8: ${L}(3) = ${C}/8 = ${ans}.`",
     "{ kind: \"exp-decay\", a: C, den: 2, steps: 3 }"),
    (r"`For A(x) = ${C} * (1/2)^x, what is the starting amount A(0)?`",
     r"`(1/2)\u2070 = 1, so A(0) = ${C} \u00b7 1 = ${C}.`",
     "{ kind: \"exp-zero-decay\", a: C, den: 2 }"),
    (r"`In the sequence ${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, what is the constant ratio?`",
     r"`Divide any term by the one before it: ${t[1]} \u00f7 ${t[0]} = ${r}.`",
     "{ kind: \"exp-ratio\", t0: t[0], t1: t[1] }"),
    (r"`The sequence ${t[0]}, ${t[1]}, ${t[2]}, ${t[3]} continues. What is the next term?`",
     r"`Each term is ${r} times the last: ${t[3]} \u00b7 ${r} = ${ans}.`",
     "{ kind: \"exp-next\", t0: t[0], t1: t[1], tLast: t[3] }"),
    (r"`For f(x) = ${a} * ${b}^x, what is f(${v})?`",
     r"`${b}^${v} = ${b ** v}, so f(${v}) = ${a} \u00b7 ${b ** v} = ${ans}.`",
     "{ kind: \"exp-eval\", a, b, v }"),
]

for prompt_a, expl_a, params in BRANCHES:
    assert src.count(prompt_a) == 1, f"prompt anchor not unique: {prompt_a!r} -> {src.count(prompt_a)}"
    assert src.count(expl_a) == 1, f"expl anchor not unique: {expl_a!r} -> {src.count(expl_a)}"

for prompt_a, expl_a, params in BRANCHES:
    # 1) open: nearest `return num(` strictly before the prompt anchor becomes `return { ...num(`
    pi = src.index(prompt_a)
    ri = src.rindex("return num(", 0, pi)
    gap = src[ri + len("return num("):pi]
    assert gap.count("return") == 0 and '"exp-function"' in gap, f"open-anchor sanity failed for {prompt_a!r}: {gap!r}"
    src = src[:ri] + "return { ...num(" + src[ri + len("return num("):]
    # 2) close: first `\n<ws>);` after the explanation anchor becomes `\n<ws>), params: ... };`
    ei = src.index(expl_a) + len(expl_a)
    ci = src.index(");", ei)
    between = src[ei:ci]
    assert between.strip() == "", f"close-anchor sanity failed for {expl_a!r}: {between!r}"
    src = src[:ci] + f"), params: {params} }};" + src[ci + len(");"):]

# 3) exactConfig branches: insert after the rational-exponent params branch, inside if(legacy.params){}
CFG_ANCHOR = 'rootIndex:n("rootIndex")}]});\n }'
assert src.count(CFG_ANCHOR) == 1, f"exactConfig anchor count {src.count(CFG_ANCHOR)}"
CFG_INSERT = (
    'rootIndex:n("rootIndex")}]});\n'
    "  // S180 exp-function: exponentiation is REPRESENTED, not shortcut. a\\u00b7b^v is a followed by v\n"
    "  // factors of b (the ApproxExpr union has no pow op, deliberately); decay is the start times one\n"
    "  // decay factor per step; and b^0 is DERIVED as b\\u00f7b \\u2014 the quotient law b^(1-1) \\u2014 never asserted\n"
    "  // as a bare literal 1, so the base the traps talk about stays in the spec and visibly cancels.\n"
    '  if(q.kind==="exp-eval")return exactReq({task:"approximationEvaluate",values:[],approxConstants:[{id:"a",label:"the start amount a",value:n("a")},{id:"b",label:"the base b (one factor per step)",value:n("b")}],approxFormula:expChain("a","b",n("v")),approxRound:0});\n'
    '  if(q.kind==="exp-zero")return exactReq({task:"approximationEvaluate",values:[],approxConstants:[{id:"a",label:"the coefficient a",value:n("a")},{id:"b",label:"the base b (b^0 = b / b = 1)",value:n("b")}],approxFormula:{op:"multiply",left:{op:"const",id:"a"},right:{op:"divide",left:{op:"const",id:"b"},right:{op:"const",id:"b"}}},approxRound:0});\n'
    '  if(q.kind==="exp-zero-decay")return exactReq({task:"approximationEvaluate",values:[],approxConstants:[{id:"a",label:"the coefficient a",value:n("a")},{id:"h",label:`the decay factor 1/${n("den")} ((1/${n("den")})^0 = 1)`,value:1/n("den")}],approxFormula:{op:"multiply",left:{op:"const",id:"a"},right:{op:"divide",left:{op:"const",id:"h"},right:{op:"const",id:"h"}}},approxRound:0});\n'
    '  if(q.kind==="exp-decay")return exactReq({task:"approximationEvaluate",values:[],approxConstants:[{id:"a",label:"the start amount",value:n("a")},{id:"h",label:`the decay factor 1/${n("den")} (one factor per step)`,value:1/n("den")}],approxFormula:expChain("a","h",n("steps")),approxRound:0});\n'
    '  if(q.kind==="exp-ratio")return exactReq({task:"approximationEvaluate",values:[],approxConstants:[{id:"t0",label:"the first term",value:n("t0")},{id:"t1",label:"the second term",value:n("t1")}],approxFormula:{op:"divide",left:{op:"const",id:"t1"},right:{op:"const",id:"t0"}},approxRound:0});\n'
    '  if(q.kind==="exp-next")return exactReq({task:"approximationEvaluate",values:[],approxConstants:[{id:"t0",label:"the first term",value:n("t0")},{id:"t1",label:"the second term",value:n("t1")},{id:"tLast",label:"the last given term",value:n("tLast")}],approxFormula:{op:"multiply",left:{op:"const",id:"tLast"},right:{op:"divide",left:{op:"const",id:"t1"},right:{op:"const",id:"t0"}}},approxRound:0});\n'
    " }"
)
src = src.replace(CFG_ANCHOR, CFG_INSERT)

# 4) chain-multiply helper, module level, before exactGroupConfig
HELPER_ANCHOR = "function exactGroupConfig(prompt:string"
assert src.count(HELPER_ANCHOR) == 1
HELPER = (
    'const expChain=(startId:string,factorId:string,steps:number):NonNullable<ExactUpgradeConfig["approxFormula"]>=>{'
    'let f:NonNullable<ExactUpgradeConfig["approxFormula"]>={op:"const",id:startId};'
    'for(let i=0;i<steps;i++)f={op:"multiply",left:f,right:{op:"const",id:factorId}};return f};\n'
)
src = src.replace(HELPER_ANCHOR, HELPER + HELPER_ANCHOR)

# 5) registry entry
REG_ANCHOR = ' "polygon-angles":new Set(["sidesFromSum","exteriorSum","exteriorFromInterior","sidesFromExterior","sidesFromInterior","regularInterior","default"]),'
assert src.count(REG_ANCHOR) == 1
REG_INSERT = REG_ANCHOR + '\n "exp-function":new Set(["initialValue","growthModel","startAmount","decayModel","decayStart","ratio","nextTerm","default"]),'
src = src.replace(REG_ANCHOR, REG_INSERT)

# Final invariants before the single write
assert src.count('kind: "exp-') == 9, src.count('kind: "exp-')
assert src.count('q.kind==="exp-') == 6
assert src.count('"exp-function":new Set') == 1
assert src != orig
P.write_text(src, encoding="utf-8")
print("patched: 9 params attachments, 6 exactConfig kinds, helper, registry entry")
