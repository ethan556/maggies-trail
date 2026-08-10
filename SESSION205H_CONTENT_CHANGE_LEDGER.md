# S205H — content-change ledger

**No authored lesson content was altered.** One `insertion`; 14 applier assertions passed.

## ENGINE CHANGE — `derivativeTrace` gains `offsetMax` (the +C control)

`offsetMax: z.number().int().min(0).max(6).default(0)`. At the default 0 the control is not
rendered and every existing lesson is byte-identical — verified by the full corpus gates and by a
test asserting the control's absence at `offsetMax: 0`.

It exists for one idea, and it is the central idea of antidifferentiation: **sliding a curve up
does not tilt it anywhere**, so f′ carries no information about vertical position. Every other
representation *asserts* that; this lets the learner drag C and watch the f′ pane refuse to move.

**C is deliberately local component state, never part of `value`.** That is not an implementation
shortcut — a grader that could see C would contradict the exact claim the control demonstrates.
Grading reads the bare x it always has.

Pinned by `src/components/derivativeTraceOffset.s205h.test.tsx` (5 tests) at both levels the
invariant must hold:
1. **Structurally** — `traceSlopeAt` and `traceSecondAt` take `(fn, x)` only, so no offset can
   reach them; the test asserts their arity.
2. **In the rendered picture** — moving C must change the drawn curve and must leave every other
   path identical. **Failure-first proved**: shifting the f′ pane by C makes exactly that test
   fail; restoring returns 5/5. (A first, weaker probe did *not* fail — it moved C by less than one
   sample spacing — and was replaced rather than accepted, since a probe that cannot fail proves
   nothing.)
3. `onChange` is never called by the offset control — the grader cannot see C.

## INSERTION — `in-04-02` "Pinning Down the Constant" · new step `i1b` · **C → A**

The authored reveal argues the family x², x²+1, x²+7, x²−3 all share derivative 2x, and one point
picks a member. Until now no engine could let a learner *do* that. The insertion asks them to slide
C until the curve passes through (1, 5) and bring x to 1, watching f′ throughout.

Verified independently: f′(x) = 2x at every sampled x; **f′(1) = 2 for every C in −4…4**;
1 + C = 5 → **C = 4**, an integer reachable on the step-1 slider at `offsetMax: 6`. The predict
block's outcome (`f-prime-still`) is true by construction, not by authorial assertion — the offset
cannot reach the slope helpers at all.

## REFUSALS (2), cited in `content/patches/s205h-plus-c.json`

- **`dr-04-02` "Chains Within Chains"** — represents. The reveal's subject is rule ORDER (outermost
  first, never two rules in one line); derivativeRuleLab's mode enum is `product|chain` and runs
  one rule, showing the ingredient while the lesson asks about the assembly. Same shape as the
  S205E dr-03-02 refusal. Gap: a nested-rule engine exposing the decomposition tree.
- **`in-05-02` "Changing the Limits"** — represents. The reveal contrasts two u-substitution routes
  and names the mixing error; riemannSum and accumulateArea each draw one integrand over one
  interval and represent no change of variable, so the two worlds cannot both appear and the named
  error has nowhere to happen on screen. Gap: a substitution engine showing x-world and u-world
  side by side.

## Census

**A 1177 · B 432 · C 91 · D 1** (C 92 → 91).
