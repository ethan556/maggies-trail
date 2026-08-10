// Conversion Playbook Block 2 (G12 trigonometry) — unitCircleExplore wave/ghost/branch.
// Replaces the widget block of ONE designated step per lesson and adds a predict. Prose, ids,
// order, hints, conceptTags and every other step are untouched. Every edit asserts the step it
// expects to find before anything is written, and re-checks body byte-equality after.
//
// Angle convention: the engine works in integer DEGREES (its existing lattice); authored prose
// stays radian-flavored and the new widget prompts bridge (\u03c0/2 = 90\u00b0) where useful.

import { readFileSync, writeFileSync } from "node:fs";

const COURSES = {
  tg: "content/courses/trig-graphs-inverses/lessons",
  ti: "content/courses/trig-identities-equations/lessons",
};

/** lesson id -> { step, expect: old widget type, widget, predict } */
const PLAN = {
  /* ================= wave anatomy ================= */

  "tg-01-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "y = sin(x \u2212 90\u00b0) is sin x with its start delayed. Where is its FIRST peak?",
      options: [
        { id: "p90", label: "Still at 90\u00b0 \u2014 shifting doesn't move the peak" },
        { id: "p180", label: "At 180\u00b0 \u2014 everything slides right by the shift" },
        { id: "p0", label: "At 0\u00b0 \u2014 the wave starts at its top now" },
      ],
      outcomeId: "p180",
      reveal:
        "180\u00b0. The circle's pointer starts 90\u00b0 behind, so every feature of the wave \u2014 peak included \u2014 arrives 90\u00b0 late. Drag \u03b8 and watch the trace: the peak lands where the pointer finally reaches the top.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "The circle starts 90\u00b0 behind (phase \u221290\u00b0) and traces y = sin(x \u2212 90\u00b0) as you drag. Land the trace on the wave's first peak.",
      targetAngle: 180,
      angleStart: 0,
      angleStep: 5,
      trace: "sin",
      phaseDeg: -90,
      targetFeature: { kind: "peak", x: 180, tol: 5 },
      successFeedback:
        "Peak at 180\u00b0 \u2014 which is \u03c0 in the prose above, the answer n = 1. The peak moved because the circle STARTED elsewhere: the wave slides exactly as far as the start was delayed.",
      lowFeedback:
        "Not there yet \u2014 90\u00b0 is where PLAIN sin x peaks, but this pointer started 90\u00b0 behind and hasn't reached the top. Keep dragging and watch the point climb.",
      highFeedback:
        "Past the peak \u2014 the trace is already on its way down. Back up until the tip sits on the crest, where the pointer is at the very top of the circle.",
    },
  },

  "tg-01-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "y = 3 sin(2(x \u2212 45\u00b0)) + 1. Which dial decides the MAXIMUM value of y?",
      options: [
        { id: "amp", label: "Amplitude alone \u2014 max is 3" },
        { id: "ampmid", label: "Amplitude AND midline \u2014 max is 3 + 1 = 4" },
        { id: "scale", label: "The 2 inside \u2014 it doubles the height" },
      ],
      outcomeId: "ampmid",
      reveal:
        "Amplitude sets how far the wave swings, the midline sets what it swings AROUND: max = 1 + 3 = 4. The 2 inside changes how fast, never how high. Set the four dials and watch each one move exactly one thing.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Reproduce y = 3 sin(2(x \u2212 45\u00b0)) + 1: set each dial and watch what it \u2014 and only it \u2014 changes, until your wave sits on the dashed target.",
      targetAngle: 0,
      angleStart: 90,
      angleStep: 5,
      trace: "sin",
      dials: [
        {
          param: "amplitude", min: 1, max: 5, step: 1, start: 1, target: 3,
          feedback:
            "The swing is wrong. Amplitude is the distance from the midline to the crest \u2014 this wave rises 3 above its center line, not to 3.",
        },
        {
          param: "angularScale", min: 1, max: 4, step: 1, start: 1, target: 2,
          feedback:
            "The wave repeats at the wrong rate. The 2 multiplies the ANGLE, so the trace advances twice as fast per degree of drag \u2014 watch the tip lap the target.",
        },
        {
          param: "phaseDeg", min: -180, max: 180, step: 45, start: 0, target: -90,
          feedback:
            "The slide is off. 2(x \u2212 45\u00b0) = 2x \u2212 90\u00b0: the shift inside the brackets gets multiplied too, so the phase dial needs \u221290\u00b0, not \u221245\u00b0 \u2014 the factored form hides a doubled delay.",
        },
        {
          param: "midline", min: -2, max: 3, step: 1, start: 0, target: 1,
          feedback:
            "The center line is wrong. The + 1 outside lifts the whole wave \u2014 crest, trough and axis together \u2014 up by one.",
        },
      ],
      successFeedback:
        "All four dials placed \u2014 and the maximum reads 4 off the crest: midline 1 plus amplitude 3. Each dial moved one feature and left the others alone; that separation IS the anatomy of the sinusoid.",
      lowFeedback: "Keep adjusting \u2014 compare your wave against the dashed target one feature at a time.",
      highFeedback: "Keep adjusting \u2014 compare your wave against the dashed target one feature at a time.",
    },
  },

  "tg-01-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "y = 2 sin(2(x \u2212 30\u00b0)) \u2212 1: the 2 inside squeezes the wave. How long is ONE full cycle?",
      options: [
        { id: "d360", label: "360\u00b0 \u2014 a sine wave always takes a full turn" },
        { id: "d180", label: "180\u00b0 \u2014 twice the speed, half the length" },
        { id: "d720", label: "720\u00b0 \u2014 the 2 stretches it out" },
      ],
      outcomeId: "d180",
      reveal:
        "180\u00b0. The pointer's angle is doubled, so the circle completes a lap while x covers only half a turn. Drag through one full cycle and read the period off the axis \u2014 then the quarter-step the prose asks for is 180\u00b0/4.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Drag \u03b8 through exactly ONE full cycle of y = 2 sin(2(x \u2212 30\u00b0)) \u2212 1 and stop where the wave first repeats \u2014 that distance is the period.",
      targetAngle: 180,
      angleStart: 0,
      angleStep: 5,
      trace: "sin",
      amplitude: 2,
      angularScale: 2,
      phaseDeg: -60,
      midline: -1,
      targetFeature: { kind: "period", x: 180, tol: 5 },
      successFeedback:
        "One cycle in 180\u00b0 \u2014 that's \u03c0, so each quarter-period step is 45\u00b0 (\u03c0/4, the n = 4 the prose wants). The 2 inside halves the period; nothing else the equation does can change it.",
      lowFeedback:
        "The wave hasn't come back to where it started \u2014 you're still inside the first cycle. Keep dragging until the trace repeats its opening move.",
      highFeedback:
        "You've dragged past one full cycle \u2014 the wave already repeated behind you. Back up to the first point where the pattern restarts.",
    },
  },

  "tg-02-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "y = 2 cos x + 3: where does a COSINE wave start at x = 0\u00b0?",
      options: [
        { id: "top", label: "At its crest \u2014 cos 0\u00b0 = 1, so y starts at its maximum" },
        { id: "mid", label: "On its midline, like sine does" },
        { id: "bottom", label: "At its trough \u2014 cosine is sine upside-down" },
      ],
      outcomeId: "top",
      reveal:
        "At the crest: cos 0° = 1, so y = 2(1) + 3 = 5 right out of the gate. Cosine's pointer starts at the circle's rightmost point — full x-coordinate — which is why its wave is born at the top. Now trace the whole fall and land where it climbs back onto its center line.",
    },
    widget: {
      "type": "unitCircleExplore",
      "prompt": "Trace y = 2 cos x + 3 from its crest at height 5, down through the trough, and land the tip on the SECOND crossing of the center line — where the wave climbs back onto y = 3.",
      "targetAngle": 270,
      "angleStart": 0,
      "angleStep": 5,
      "trace": "cos",
      "amplitude": 2,
      "midline": 3,
      "targetFeature": {
        "kind": "midlineCross",
        "x": 270,
        "tol": 5
      },
      "successFeedback": "Back on the center line at 270°, climbing. The wave was born at its crest — y(0) = 2 cos 0 + 3 = 5, the entry's answer — because cosine starts at maximum; everything after is the fall to 1, the return you just landed, and the finish back at 5.",
      "lowFeedback": "Not the crossing that was asked for — if you stopped near 90°, that is the FIRST crossing, on the way down. The wave still has its trough ahead; keep dragging until it rises back through the center line.",
      "highFeedback": "Past the second crossing — the trace is above the center line again, heading home to its crest. Ease back to 270°, where it cut through y = 3 on the rise."
    },
  },

  "tg-02-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "sin(x + 90\u00b0) and cos x \u2014 the same wave, or merely similar?",
      options: [
        { id: "same", label: "The same \u2014 the two points will sit on top of each other everywhere" },
        { id: "close", label: "Similar but not equal \u2014 they'll drift apart somewhere" },
        { id: "quad", label: "Equal only in the first quadrant" },
      ],
      outcomeId: "same",
      reveal:
        "The same wave under two names. Drag \u03b8 anywhere \u2014 past 90\u00b0, through the third quadrant, all the way around \u2014 and the point computed from the cofunction formula never leaves the direct point. An identity is a coincidence that survives every drag.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "One point is plotted directly at 90\u00b0 \u2212 \u03b8; the other is computed from a formula in \u03b8. Pick the formula that keeps them glued through the whole drag, then land \u03b8 on 45\u00b0 \u2014 where the two names meet their mirror.",
      targetAngle: 45,
      angleStart: 0,
      angleStep: 5,
      ghost: "cofunction",
      showGhostCoords: true,
      ghostChoices: [
        { id: "exact", label: "(sin \u03b8, cos \u03b8) \u2014 swap the coordinates" },
        {
          id: "signError",
          label: "(sin \u03b8, \u2212cos \u03b8) \u2014 swap and flip",
          feedback:
            "Swapping is right; the flip is the slip. Watch the formula point mirror across the x-axis and detach the moment \u03b8 leaves 0\u00b0 \u2014 cofunctions trade places without changing sign.",
        },
      ],
      successFeedback:
        "Glued at every \u03b8 \u2014 at 45\u00b0 the swap changes nothing at all, because the point IS its own mirror there. sin(\u03c0) = cos(\u03c0/2) = 0 in the entry above is one snapshot of a coincidence you just watched hold everywhere.",
      lowFeedback: "The formula holds \u2014 now finish the drag to 45\u00b0, where the two coordinates meet.",
      highFeedback: "Past 45\u00b0 \u2014 back up to the diagonal, where sine and cosine trade places invisibly.",
    },
  },

  "tg-03-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "Walking the tangent trace toward 90\u00b0: what does the wave do?",
      options: [
        { id: "wall", label: "It climbs without limit \u2014 there's a wall at 90\u00b0, not a value" },
        { id: "peak", label: "It peaks at 1 and comes back down, like sine" },
        { id: "zero", label: "It crosses zero there" },
      ],
      outcomeId: "wall",
      reveal:
        "A wall. tan \u03b8 = sin \u03b8 / cos \u03b8, and at 90\u00b0 the denominator hits zero \u2014 the trace shoots off the top of the stage and reappears from the bottom. The zeros live where SINE is zero: at 0\u00b0, 180\u00b0, 360\u00b0. Drag past the wall and land on the crossing at 180\u00b0.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = tan x: ride the branch up its wall at 90\u00b0, cross the gap, and land the tip exactly on the zero at 180\u00b0.",
      targetAngle: 180,
      angleStart: 0,
      angleStep: 5,
      trace: "tan",
      targetFeature: { kind: "zero", x: 180, tol: 5 },
      successFeedback:
        "Zero at 180\u00b0 \u2014 sin 180\u00b0 = 0 puts the ratio at 0/(\u22121) = 0. Between here and the wall the ratio ran through every value once, which is why tan(60\u00b0) = (\u221a3/2)\u00f7(1/2) = 1.73 exists on this branch: the entry above is one stop on the climb you just made.",
      lowFeedback:
        "Not at the zero \u2014 the tip is off the axis here. The crossing sits where the SINE leg vanishes; keep dragging toward 180\u00b0, through the wall's gap.",
      highFeedback:
        "Past the zero \u2014 the trace has started its next climb. Back up to 180\u00b0, where the wave touches the axis between two walls.",
    },
  },

  "tg-03-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "tan x repeats every 180\u00b0. How often does tan(2x) repeat?",
      options: [
        { id: "d90", label: "Every 90\u00b0 \u2014 double speed, half the spacing" },
        { id: "d180", label: "Still every 180\u00b0 \u2014 the walls don't move" },
        { id: "d360", label: "Every 360\u00b0 \u2014 like sine and cosine" },
      ],
      outcomeId: "d90",
      reveal:
        "Every 90\u00b0. The 2 doubles how fast the pointer sweeps, so walls and zeros arrive in half the distance \u2014 and tangent started with a 180\u00b0 period, not 360\u00b0. Drag one full copy of the pattern and read its length off the axis.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = tan(2x) through exactly ONE copy of its pattern \u2014 wall to matching wall \u2014 and stop where it first repeats.",
      targetAngle: 90,
      angleStart: 0,
      angleStep: 5,
      trace: "tan",
      angularScale: 2,
      targetFeature: { kind: "period", x: 90, tol: 5 },
      successFeedback:
        "One period in 90\u00b0 \u2014 that's \u03c0/2, the n = 2 the entry wants. Tangent's own period is 180\u00b0 (each branch already contains the whole story), and the 2 inside halves it: period = 180\u00b0/|b|, never 360\u00b0/|b|.",
      lowFeedback:
        "Still inside the first copy \u2014 the pattern hasn't restarted. Keep dragging until the branch you're on looks exactly like the one you left.",
      highFeedback:
        "Past one copy \u2014 the pattern already restarted behind the tip. Back up to the first angle where the branch repeats.",
    },
  },

  /* ================= inverse functions: the branch ================= */

  "tg-04-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "sin 150\u00b0 = 1/2 too. Can the drag reach 150\u00b0 to claim it as arcsin(1/2)?",
      options: [
        { id: "no", label: "No \u2014 the branch stops at 90\u00b0; only one angle per sine value is allowed in" },
        { id: "yes", label: "Yes \u2014 any angle with the right sine counts" },
        { id: "wrap", label: "Yes, by dragging the long way around" },
      ],
      outcomeId: "no",
      reveal:
        "No \u2014 you hit a wall at 90\u00b0. That wall is the whole point: inside [\u221290\u00b0, 90\u00b0] every sine value appears exactly once, so \u201cthe angle whose sine is 1/2\u201d picks out one answer. Feel for the wall, then land on 30\u00b0.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Only the arc from \u221290\u00b0 to 90\u00b0 is open \u2014 the rest is walled off. Find the one angle in this branch whose sine is 1/2.",
      targetAngle: 30,
      angleStart: 0,
      angleStep: 5,
      branch: [-90, 90],
      successFeedback:
        "30\u00b0 \u2014 \u03c0/6, the n = 6 above. Inside the branch, sine climbs steadily from \u22121 to 1 and never repeats a value, so arcsin can answer with a single angle. The wall you bumped at 90\u00b0 is what makes the inverse a function.",
      lowFeedback:
        "The sine here is below 1/2 \u2014 climb counterclockwise and watch the sin readout rise toward 0.5.",
      highFeedback:
        "The sine here is above 1/2 \u2014 ease back down. (And if you were hunting 150\u00b0: the wall already told you that door is closed.)",
    },
  },

  "tg-04-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "Arcsine lives on [\u221290\u00b0, 90\u00b0]. Can arccosine use the same branch?",
      options: [
        { id: "no", label: "No \u2014 cosine repeats inside that branch; arccos needs [0\u00b0, 180\u00b0]" },
        { id: "yes", label: "Yes \u2014 one branch fits all the inverses" },
        { id: "any", label: "Any 180\u00b0 window works for any inverse" },
      ],
      outcomeId: "no",
      reveal:
        "No: on [\u221290\u00b0, 90\u00b0], cosine hits every value TWICE (cos(\u221260\u00b0) = cos 60\u00b0), so that window can't serve as arccos. On [0\u00b0, 180\u00b0] cosine descends from 1 to \u22121 without repeating \u2014 a different function needs a different branch. Feel this one's walls, then find the angle whose cosine is 1/2.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "This time the open arc is [0\u00b0, 180\u00b0] \u2014 arccosine's branch, the descent. Find the one angle here whose cosine is 1/2.",
      targetAngle: 60,
      angleStart: 90,
      angleStep: 5,
      branch: [0, 180],
      successFeedback:
        "60\u00b0 \u2014 \u03c0/3. Along this descent, cosine falls steadily from 1 to \u22121, hitting each value once: arccos(1/2) = 60\u00b0 with no rival. Same idea as arcsine's branch, different arc \u2014 chosen for where THIS function refuses to repeat.",
      lowFeedback:
        "cos here is above 1/2 \u2014 you're too close to 0\u00b0, where cosine is largest. Drag up the descent.",
      highFeedback:
        "cos here is below 1/2 \u2014 too far along the descent. Ease back toward 0\u00b0 and watch the cos readout climb to 0.5.",
    },
  },

  "tg-04-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "The branch point (30\u00b0, 1/2) is on restricted sine. What point must arcsin's graph carry?",
      options: [
        { id: "swap", label: "(1/2, 30\u00b0) \u2014 inputs and outputs trade places" },
        { id: "same", label: "(30\u00b0, 1/2) \u2014 the graphs share their points" },
        { id: "neg", label: "(\u22121/2, \u221230\u00b0) only" },
      ],
      outcomeId: "swap",
      reveal:
        "(1/2, 30\u00b0): an inverse answers the reversed question, so every point swaps coordinates \u2014 the y = x mirror. On the circle that reads: sine SENDS 30\u00b0 to 1/2, arcsine sends 1/2 BACK to 30\u00b0, and the branch guarantees the return address is unique. Land on it.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Inside arcsine's branch, drag to the angle that 1/2 maps back to \u2014 the second coordinate of the mirrored point (1/2, 30\u00b0).",
      targetAngle: 30,
      angleStart: -60,
      angleStep: 5,
      branch: [-90, 90],
      successFeedback:
        "30\u00b0: sin 30\u00b0 = 1/2 going out, arcsin(1/2) = 30\u00b0 coming back \u2014 the same fact read in both directions, which is exactly what reflecting a graph across y = x does to a point. The branch is why the return trip has one destination.",
      lowFeedback:
        "sin here is under 1/2 \u2014 this angle maps to the wrong height. Climb toward the angle whose sine reads exactly 0.5.",
      highFeedback:
        "sin here is over 1/2 \u2014 too high on the branch. Ease back down to the angle 1/2 actually came from.",
    },
  },

  "tg-05-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "arcsin(sin 150\u00b0): sine of 150\u00b0 is 1/2. Does the round trip return 150\u00b0?",
      options: [
        { id: "fold", label: "No \u2014 arcsin can only answer from inside its branch: you get 30\u00b0 back" },
        { id: "same", label: "Yes \u2014 inverse means you always get your angle back" },
        { id: "zero", label: "It returns 0\u00b0" },
      ],
      outcomeId: "fold",
      reveal:
        "You get 30\u00b0. sin(arcsin x) is the SAFE direction \u2014 0.3 in, 0.3 out, as above \u2014 but arcsin(sin \u03b8) must answer from inside [\u221290\u00b0, 90\u00b0], and 150\u00b0 lives outside. Try to drag to 150\u00b0: the wall you hit is the fold happening under your hand.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Try to reach 150\u00b0 \u2014 then settle for what arcsin actually returns: the angle INSIDE the branch that shares 150\u00b0's sine.",
      targetAngle: 30,
      angleStart: 0,
      angleStep: 5,
      branch: [-90, 90],
      successFeedback:
        "30\u00b0 \u2014 the branch's representative for sine 1/2. The wall at 90\u00b0 is why arcsin(sin 150\u00b0) = 30\u00b0, not 150\u00b0: the round trip folds everything back into the arc where the inverse is allowed to live. sin(arcsin 0.3) = 0.3 has no such fold \u2014 that direction never leaves home.",
      lowFeedback:
        "Sine is below 1/2 here \u2014 climb. (150\u00b0 stays unreachable however hard you push the wall; that push IS the lesson.)",
      highFeedback:
        "Sine is above 1/2 \u2014 ease back to 30\u00b0, the one angle this branch offers for that sine.",
    },
  },

  /* ================= solve-all-solutions ================= */

  "tg-05-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "sin x = 1/2 on [0\u00b0, 360\u00b0). Arcsine hands you 30\u00b0. How many solutions are there in total?",
      options: [
        { id: "two", label: "Two \u2014 30\u00b0 and its mirror partner across the vertical axis" },
        { id: "one", label: "One \u2014 the inverse's answer is the answer" },
        { id: "four", label: "Four \u2014 one per quadrant" },
      ],
      outcomeId: "two",
      reveal:
        "Two. Height 1/2 is a horizontal line through the circle, and it meets the circle at TWO points: 30\u00b0 and its mirror 180\u00b0 \u2212 30\u00b0 = 150\u00b0. The inverse only ever reports the branch's copy \u2014 you drag to the partner yourself.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "You start on arcsine's answer, 30\u00b0. Drag to the OTHER angle in [0\u00b0, 360\u00b0) with sine 1/2 \u2014 watch the sin readout: it must come back to 0.5.",
      targetAngle: 150,
      angleStart: 30,
      angleStep: 5,
      successFeedback:
        "150\u00b0 = 180\u00b0 \u2212 30\u00b0 \u2014 5\u03c0/6, the supplement. Same height, opposite side of the vertical axis: every sine value under 1 is shared by a supplementary pair, so \u201csolve\u201d means arcsin's answer PLUS its mirror \u2014 then \u00b1360\u00b0k for the ladder.",
      lowFeedback:
        "The sine dropped away from 1/2 \u2014 you're between the pair. Keep dragging: the readout returns to 0.5 exactly at the mirror angle.",
      highFeedback:
        "Past the partner \u2014 sine has moved off 1/2 again. Back up until the readout reads 0.500 on the far side of 90\u00b0.",
    },
  },

  /* ================= general-solution ladders (periods witnessed) ================= */

  "ti-01-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "Sine's solution ladder needs TWO families (+360\u00b0k each). How many does tangent need?",
      options: [
        { id: "one", label: "One \u2014 tangent repeats every 180\u00b0, so a single ladder catches everything" },
        { id: "two", label: "Two, like sine \u2014 all trig functions pair up" },
        { id: "half", label: "None \u2014 tangent equations have single answers" },
      ],
      outcomeId: "one",
      reveal:
        "One ladder with a 180\u00b0 step. Tangent's whole pattern lives in one branch and repeats every half-turn \u2014 drag one full copy and read its length \u2014 so \u03b8 + 180\u00b0k sweeps up every solution. That's why sine's two families MERGE for tangent.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = tan x through exactly one copy of its pattern and stop where it first repeats \u2014 the ladder's rung spacing.",
      targetAngle: 180,
      angleStart: 0,
      angleStep: 5,
      trace: "tan",
      targetFeature: { kind: "period", x: 180, tol: 5 },
      successFeedback:
        "One copy per 180\u00b0 \u2014 the \u03c0 in x = \u03c0/4 + \u03c0k. Climbing the ladder with k = 2 lands at \u03c0/4 + 2\u03c0 \u2248 7.07, the entry above: every rung is one half-turn because that is how often tangent hands back the same value.",
      lowFeedback:
        "Still inside the first branch \u2014 the pattern hasn't restarted. Drag on until the new branch mimics the old one exactly.",
      highFeedback:
        "You've overshot into the second copy \u2014 back up to the first angle where the pattern restarts.",
    },
  },

  "ti-01-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "Solutions of sin(2x) = \u2026 come from a 2x-ladder with 360\u00b0 rungs. After dividing by 2, how far apart are the x-rungs?",
      options: [
        { id: "d180", label: "180\u00b0 \u2014 dividing the ladder divides the spacing" },
        { id: "d360", label: "Still 360\u00b0 \u2014 the +2\u03c0k is untouchable" },
        { id: "d720", label: "720\u00b0 \u2014 dividing spreads them out" },
      ],
      outcomeId: "d180",
      reveal:
        "180\u00b0: dividing EVERYTHING by 2 divides the rung spacing too \u2014 2\u03c0k becomes \u03c0k. On the wave, that's just the period of sin 2x: drag one full cycle and see it close in half a turn.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = sin 2x through exactly ONE full cycle \u2014 that length is the spacing of the divided ladder's rungs.",
      targetAngle: 180,
      angleStart: 0,
      angleStep: 5,
      trace: "sin",
      angularScale: 2,
      targetFeature: { kind: "period", x: 180, tol: 5 },
      successFeedback:
        "One cycle in 180\u00b0 \u2014 so x = \u03c0/12 + (\u03c0/1)\u00b7k... read carefully: the step is \u03c0, meaning n = 1 in the entry's \u03c0/n. Dividing 2x = \u03c0/6 + 2\u03c0k by 2 divided the whole ladder, rungs included \u2014 the wave's period is that division made visible.",
      lowFeedback:
        "The cycle hasn't closed \u2014 sin 2x moves twice as fast, but you still need the full pattern. Keep dragging.",
      highFeedback:
        "Past one cycle \u2014 the wave already repeated. Back up to where the pattern first restarts.",
    },
  },

  /* ================= reciprocal & Pythagorean families ================= */

  "ti-02-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "sec \u03b8 = 1/cos \u03b8. What happens to sec as \u03b8 approaches 90\u00b0?",
      options: [
        { id: "blow", label: "It blows up \u2014 dividing by a cosine that's heading to zero" },
        { id: "one", label: "It heads to 1 \u2014 reciprocals settle down" },
        { id: "zero", label: "It heads to 0, following cosine down" },
      ],
      outcomeId: "blow",
      reveal:
        "It blows up: sec inherits a wall exactly where cos crosses zero. Reciprocal functions add no new information \u2014 sec \u03b8 = 5/4 when cos \u03b8 = 4/5 \u2014 but they invert the geography: small cosines make huge secants. Land the trace on the crossing that makes the wall.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = cos x and land the tip exactly on its first zero \u2014 the crossing where sec \u03b8 = 1/cos \u03b8 has its wall.",
      targetAngle: 90,
      angleStart: 0,
      angleStep: 5,
      trace: "cos",
      targetFeature: { kind: "zero", x: 90, tol: 5 },
      successFeedback:
        "Zero at 90\u00b0 \u2014 and secant's wall stands exactly here. Everywhere else, sec is just cosine flipped over: cos \u03b8 = 4/5 gives sec \u03b8 = 5/4 = 1.25, the entry above. One readout, two names, and a wall wherever the denominator touches the axis.",
      lowFeedback:
        "cos is still positive here \u2014 not yet the crossing. Watch the readout fall toward 0 as you climb.",
      highFeedback:
        "cos has gone negative \u2014 you crossed it. Back up to the exact zero, where the reciprocal's wall lives.",
    },
  },

  "ti-02-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "The Pythagorean family all comes from one picture. If a formula in it carries a sign slip, what will the circle show?",
      options: [
        { id: "mirror", label: "The computed point mirrors off the true one the moment \u03b8 moves" },
        { id: "nothing", label: "Nothing \u2014 signs wash out when you square" },
        { id: "shrink", label: "The point spirals inward" },
      ],
      outcomeId: "mirror",
      reveal:
        "It mirrors off \u2014 a wrong sign is a wrong reflection, visible instantly. tan\u00b2\u03b8 + 1 = sec\u00b2\u03b8 is safe under squaring, but the family's unsquared members are not: pick each formula and watch which survives the drag.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "One point is plotted directly at 90\u00b0 \u2212 \u03b8; the candidates compute it from \u03b8. Pick the family member without the sign slip and land \u03b8 on 60\u00b0.",
      targetAngle: 60,
      angleStart: 15,
      angleStep: 5,
      ghost: "cofunction",
      showGhostCoords: true,
      ghostChoices: [
        { id: "exact", label: "(sin \u03b8, cos \u03b8)" },
        {
          id: "signError",
          label: "(sin \u03b8, \u2212cos \u03b8)",
          feedback:
            "The sign slip: squaring would hide it \u2014 (\u2212cos \u03b8)\u00b2 = cos\u00b2\u03b8 \u2014 which is why tan\u00b2 + 1 = sec\u00b2 can't catch it but the CIRCLE can. Watch the point mirror across the x-axis and detach as soon as \u03b8 leaves 0\u00b0.",
        },
      ],
      successFeedback:
        "Glued at every \u03b8. With tan \u03b8 = 3/4 the squared identity gives sec\u00b2\u03b8 = 9/16 + 1 = 25/16 \u2014 the entry above \u2014 and the picture you just held is why that always works: the family is one right triangle on the circle, and right signs keep it one triangle.",
      lowFeedback: "The formula holds \u2014 finish the drag to 60\u00b0 and read the coincidence there.",
      highFeedback: "Past 60\u00b0 \u2014 ease back; the reading is at 60\u00b0.",
    },
  },

  "ti-02-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "A proof works one side toward the other. What does a VALID step do to the point the expression names?",
      options: [
        { id: "glue", label: "Nothing \u2014 valid steps rename the point without moving it" },
        { id: "closer", label: "Moves it a little closer to the target" },
        { id: "jump", label: "Teleports it to the other side's point" },
      ],
      outcomeId: "glue",
      reveal:
        "Nothing moves. tan \u03b8 \u00b7 cos \u03b8 and sin \u03b8 are two names for one point-height, so every legal rewrite leaves the point exactly where it was \u2014 through the whole drag. An invalid step is the one that lets the two names come apart somewhere.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "The direct point sits at 90\u00b0 \u2212 \u03b8; the candidates claim to equal it. Pick the claim a proof could defend \u2014 the one that never detaches \u2014 and land \u03b8 on 45\u00b0.",
      targetAngle: 45,
      angleStart: 0,
      angleStep: 5,
      ghost: "cofunction",
      ghostChoices: [
        { id: "exact", label: "(sin \u03b8, cos \u03b8) \u2014 equal everywhere" },
        {
          id: "signError",
          label: "(sin \u03b8, \u2212cos \u03b8) \u2014 equal at \u03b8 = 0 only",
          feedback:
            "It agrees at a single angle and detaches everywhere else \u2014 which is why checking one value can't prove an identity. A proof has to hold for EVERY \u03b8, and this candidate visibly doesn't.",
        },
      ],
      successFeedback:
        "Never detached \u2014 provable. That is the standard a first move must protect: writing tan \u03b8 as sin \u03b8/cos \u03b8 is safe because it renames without moving anything, and the product collapses to sin \u03b8 with the point never twitching.",
      lowFeedback: "The claim holds \u2014 now finish the drag to 45\u00b0.",
      highFeedback: "Past 45\u00b0 \u2014 back up to the diagonal.",
    },
  },

  /* ================= sum & difference ================= */

  "ti-03-01": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "Is sin(A + B) the same as sin A + sin B?",
      options: [
        { id: "no", label: "No \u2014 the \u201cadd the sines\u201d point will drift OFF the circle entirely" },
        { id: "yes", label: "Yes \u2014 sine distributes over addition" },
        { id: "small", label: "Only for small angles" },
      ],
      outcomeId: "no",
      reveal:
        "No \u2014 and the failure is visible: coordinates built by simple addition can exceed 1, so that point sails off the circle, where no angle's sine and cosine can live. The true expansion keeps the point exactly on the direct one. Watch both.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "The direct point sits at \u03b8 + 30\u00b0. Pick the formula that computes it from \u03b8 and 30\u00b0 without ever letting go, then land \u03b8 on 45\u00b0 \u2014 sin 75\u00b0's home.",
      targetAngle: 45,
      angleStart: 15,
      angleStep: 5,
      ghost: "sum",
      ghostAngle: 30,
      showGhostCoords: true,
      ghostChoices: [
        { id: "exact", label: "sin \u03b8 cos 30\u00b0 + cos \u03b8 sin 30\u00b0 (with its cosine partner)" },
        {
          id: "linearity",
          label: "sin \u03b8 + sin 30\u00b0 (and cos \u03b8 + cos 30\u00b0)",
          feedback:
            "Watch the readout: this point's coordinates run past 1 and it leaves the circle \u2014 nothing on the circle has a sine of 1.2. Sine does not distribute over +; the cross-terms in the true expansion are what keep the point on the rim.",
        },
      ],
      successFeedback:
        "Glued at every \u03b8 \u2014 at 45\u00b0 that reads sin 75\u00b0 = sin 45\u00b0 cos 30\u00b0 + cos 45\u00b0 sin 30\u00b0, the expansion the entry names. The formula isn't a rule to recall: it's the only recipe that keeps the computed point living on the circle.",
      lowFeedback: "Formula's right \u2014 continue to 45\u00b0, where the expansion becomes sin 75\u00b0.",
      highFeedback: "Past 45\u00b0 \u2014 ease back to the angle whose sum with 30\u00b0 is 75\u00b0.",
    },
  },

  "ti-03-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "Cofunction claims survive any \u03b8 \u2014 even past 90\u00b0, where the \u201cco\u201d angle goes negative?",
      options: [
        { id: "hold", label: "They hold everywhere \u2014 the swap needs no quadrant escort" },
        { id: "acute", label: "Only while both angles stay acute" },
        { id: "flip", label: "Past 90\u00b0 a sign flips in" },
      ],
      outcomeId: "hold",
      reveal:
        "Everywhere. Drag \u03b8 through 90\u00b0 and beyond: the swapped-coordinate point never leaves the direct one, negative co-angle and all. The quadrant-blind version \u2014 tacking on a sign \u2014 detaches immediately. Identities don't check quadrants; wrong formulas do.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Direct point at 90\u00b0 \u2212 \u03b8. Pick the cofunction formula that stays glued even when \u03b8 passes 90\u00b0, then land on 115\u00b0 \u2014 past the crossing.",
      targetAngle: 115,
      angleStart: 45,
      angleStep: 5,
      ghost: "cofunction",
      showGhostCoords: true,
      ghostChoices: [
        { id: "exact", label: "(sin \u03b8, cos \u03b8)" },
        {
          id: "signError",
          label: "(sin \u03b8, \u2212cos \u03b8) \u2014 \u201cadjust for the quadrant\u201d",
          feedback:
            "The adjustment IS the error: past 90\u00b0, cos \u03b8 is already negative, and negating it again mirrors the point away. The plain swap carries its own signs \u2014 watch it hold while this one detaches at the crossing.",
        },
      ],
      successFeedback:
        "Still glued at 115\u00b0 \u2014 the swap survived the crossing because cos \u03b8 turned negative on its own, exactly as the co-angle 90\u00b0 \u2212 115\u00b0 = \u221225\u00b0 demands. Tangent's sum rule inherits this same discipline in its denominator: signs ride inside the functions, never alongside them.",
      lowFeedback: "Formula's right \u2014 keep dragging through 90\u00b0 to 115\u00b0 and watch the crossing change nothing.",
      highFeedback: "Past 115\u00b0 \u2014 back up; the point of interest is just past the crossing.",
    },
  },

  "ti-03-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "sin 40\u00b0 cos 10\u00b0 + cos 40\u00b0 sin 10\u00b0 \u2014 what single value is this?",
      options: [
        { id: "s50", label: "sin 50\u00b0 \u2014 it's the expansion of sin(40\u00b0 + 10\u00b0), read backwards" },
        { id: "s30", label: "sin 30\u00b0 \u2014 the difference" },
        { id: "sum", label: "sin 40\u00b0 + sin 10\u00b0" },
      ],
      outcomeId: "s50",
      reveal:
        "sin 50\u00b0. The four-term string is the sum formula already expanded \u2014 recognizing the pattern lets you fold it back to one clean value. On the circle: the folded point and the expanded point are the SAME point, at every angle you can drag to.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Direct point at \u03b8 + 10\u00b0. Pick the formula that IS that point in expanded clothing, then land \u03b8 on 40\u00b0 \u2014 folding the entry's string into sin 50\u00b0.",
      targetAngle: 40,
      angleStart: 10,
      angleStep: 5,
      ghost: "sum",
      ghostAngle: 10,
      ghostChoices: [
        { id: "exact", label: "sin \u03b8 cos 10\u00b0 + cos \u03b8 sin 10\u00b0 (with its cosine partner)" },
        {
          id: "linearity",
          label: "sin \u03b8 + sin 10\u00b0 (and cos \u03b8 + cos 10\u00b0)",
          feedback:
            "Off the circle it goes \u2014 coordinates past 1. If this were the expansion, the folded and unfolded forms couldn't name the same point, and compression would be illegal. The cross-terms are what make folding safe.",
        },
      ],
      successFeedback:
        "At 40\u00b0 the glued pair reads sin 40\u00b0 cos 10\u00b0 + cos 40\u00b0 sin 10\u00b0 = sin 50\u00b0 \u2014 the compression the entry asks for, witnessed as one point wearing two outfits. Pattern recognition is just knowing which strings are a point in disguise.",
      lowFeedback: "Formula's right \u2014 continue to 40\u00b0, where the string folds to sin 50\u00b0.",
      highFeedback: "Past 40\u00b0 \u2014 ease back to where \u03b8 + 10\u00b0 = 50\u00b0.",
    },
  },

  /* ================= double angle ================= */

  "ti-04-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "As \u03b8 sweeps, a second point rides at 2\u03b8. When does sin 2\u03b8 reach its maximum of 1?",
      options: [
        { id: "t45", label: "At \u03b8 = 45\u00b0 \u2014 the doubled point tops out at 90\u00b0" },
        { id: "t90", label: "At \u03b8 = 90\u00b0 \u2014 where sine itself peaks" },
        { id: "t30", label: "At \u03b8 = 30\u00b0" },
      ],
      outcomeId: "t45",
      reveal:
        "\u03b8 = 45\u00b0: the doubled point moves twice as fast, so it reaches the top of the circle while \u03b8 is only halfway there. Watch the formula point 2 sin \u03b8 cos \u03b8 ride the direct 2\u03b8 point the whole way \u2014 one angle, used twice, is still one point.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "The direct point rides at 2\u03b8; the second point is computed as (cos\u00b2\u03b8 \u2212 sin\u00b2\u03b8, 2 sin \u03b8 cos \u03b8). Drag \u03b8 to where the doubled point tops the circle \u2014 sin 2\u03b8 = 1.",
      targetAngle: 45,
      angleStart: 15,
      angleStep: 5,
      ghost: "double",
      showGhostCoords: true,
      successFeedback:
        "\u03b8 = 45\u00b0 puts 2\u03b8 at the very top: sin 90\u00b0 = 1 = 2 sin 45\u00b0 cos 45\u00b0 = 2 \u00b7 (\u221a2/2)\u00b2. The formula never let go on the way up \u2014 sin 2\u03b8 = 2 sin \u03b8 cos \u03b8 is that grip written down. With sin \u03b8 = 3/5, cos \u03b8 = 4/5 the same grip reads sin 2\u03b8 = 2(3/5)(4/5) = 24/25 = 0.96 \u2014 the entry above.",
      lowFeedback:
        "The doubled point hasn't reached the top \u2014 remember it climbs twice as fast as your drag. Watch its height, not \u03b8's.",
      highFeedback:
        "The doubled point is past the top and descending \u2014 ease \u03b8 back toward 45\u00b0.",
    },
  },

  "ti-04-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "cos 2\u03b8 is written three ways. How many of them are the same function?",
      options: [
        { id: "all3", label: "All three \u2014 the Pythagorean identity converts each into the others" },
        { id: "one", label: "Only cos\u00b2\u03b8 \u2212 sin\u00b2\u03b8 is exact; the others approximate" },
        { id: "depends", label: "It depends on the quadrant" },
      ],
      outcomeId: "all3",
      reveal:
        "All three: substituting sin\u00b2\u03b8 = 1 \u2212 cos\u00b2\u03b8 turns the first face into the second, and cos\u00b2\u03b8 = 1 \u2212 sin\u00b2\u03b8 turns it into the third. Try each \u2014 three formulas, one glued point. The fourth candidate is a face with its signs backwards; the circle will show you which.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "The direct point rides at 2\u03b8. Choose ANY true face of cos 2\u03b8 \u2014 it will stay glued \u2014 and land \u03b8 on 70\u00b0. (You know sin \u03b8: the 1 \u2212 2sin\u00b2\u03b8 face needs nothing else.)",
      targetAngle: 70,
      angleStart: 20,
      angleStep: 5,
      ghost: "double",
      showGhostCoords: true,
      ghostChoices: [
        { id: "exact", label: "cos\u00b2\u03b8 \u2212 sin\u00b2\u03b8" },
        { id: "face2cos2", label: "2cos\u00b2\u03b8 \u2212 1" },
        { id: "face1minus2sin2", label: "1 \u2212 2sin\u00b2\u03b8" },
        {
          id: "signError",
          label: "sin\u00b2\u03b8 \u2212 cos\u00b2\u03b8",
          feedback:
            "Backwards: this is \u2212cos 2\u03b8 \u2014 the point mirrors across the vertical axis and detaches the moment cos 2\u03b8 \u2260 0. Any of the three true faces holds; the efficient one for sin \u03b8 = 0.6 is 1 \u2212 2sin\u00b2\u03b8 = 1 \u2212 0.72 = 0.28.",
        },
      ],
      successFeedback:
        "Glued at 70\u00b0 \u2014 and with any face you chose, because all three ARE cos 2\u03b8. Given only sin \u03b8 = 0.6, the third face answers without a square root: 1 \u2212 2(0.36) = 0.28. \u201cMost efficient\u201d means \u201cbuilt from what you already know\u201d \u2014 the mathematics never disagreed.",
      lowFeedback: "That face holds \u2014 continue the drag to 70\u00b0.",
      highFeedback: "Past 70\u00b0 \u2014 ease back; the reading is at 70\u00b0.",
    },
  },

  "ti-04-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "\u03b8 is acute (under 90\u00b0). Must cos 2\u03b8 be positive too?",
      options: [
        { id: "no", label: "No \u2014 2\u03b8 can cross into the second quadrant while \u03b8 is still acute" },
        { id: "yes", label: "Yes \u2014 acute in, positive out" },
        { id: "zero", label: "cos 2\u03b8 is zero for all acute \u03b8" },
      ],
      outcomeId: "no",
      reveal:
        "No: at \u03b8 = 70\u00b0, the doubled point sits at 140\u00b0 \u2014 second quadrant, cosine negative \u2014 while \u03b8 itself is comfortably acute. Watch the direct point cross the vertical axis at \u03b8 = 45\u00b0. Proofs that expand sin 2\u03b8 = 2 sin \u03b8 cos \u03b8 work in every quadrant precisely because the formula carries its own signs.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Pick the formula that stays glued to the 2\u03b8 point through the axis crossing, then land \u03b8 on 70\u00b0 \u2014 where 2\u03b8 has entered the second quadrant.",
      targetAngle: 70,
      angleStart: 20,
      angleStep: 5,
      ghost: "double",
      showGhostCoords: true,
      ghostChoices: [
        { id: "exact", label: "cos\u00b2\u03b8 \u2212 sin\u00b2\u03b8 (with 2 sin \u03b8 cos \u03b8)" },
        {
          id: "signError",
          label: "sin\u00b2\u03b8 \u2212 cos\u00b2\u03b8 (with 2 sin \u03b8 cos \u03b8)",
          feedback:
            "Mirrored: this candidate stays positive while the real cos 2\u03b8 goes negative past \u03b8 = 45\u00b0 \u2014 the two points split across the vertical axis exactly when 2\u03b8 crosses it. The expansion 2 sin \u03b8 cos \u03b8 over sin \u03b8 collapses to 2 cos \u03b8 because the true faces never need a quadrant patch.",
        },
      ],
      successFeedback:
        "Glued at 70\u00b0, with 2\u03b8 at 140\u00b0 and cos 2\u03b8 negative \u2014 the formula rode through the crossing untouched. That is why \u201cexpand sin 2\u03b8 first\u201d is the right opening for the proof: identities that hold everywhere can be cancelled anywhere.",
      lowFeedback: "Formula's right \u2014 continue to 70\u00b0, past the crossing at 45\u00b0.",
      highFeedback: "Past 70\u00b0 \u2014 back up; the reading is just beyond the crossing.",
    },
  },

  /* ================= trig equations on the wave ================= */

  "ti-05-01": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "2sin\u00b2x \u2212 sin x \u2212 1 = 0 factors to sin x = 1 or sin x = \u22121/2. How many solutions on [0\u00b0, 360\u00b0)?",
      options: [
        { id: "three", label: "Three \u2014 sin x = 1 touches once; sin x = \u22121/2 crosses twice" },
        { id: "four", label: "Four \u2014 two per factor, always" },
        { id: "two", label: "Two \u2014 one per factor" },
      ],
      outcomeId: "three",
      reveal:
        "Three. The line y = 1 only TOUCHES the wave \u2014 at its crest \u2014 while y = \u22121/2 cuts clean through it twice. \u201cSolutions per factor\u201d is geometry, not a rule of two: land the trace on the crest and see why sin x = 1 is a one-answer equation.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = sin x and land the tip exactly on the crest \u2014 the single place the factor sin x = 1 is satisfied.",
      targetAngle: 90,
      angleStart: 0,
      angleStep: 5,
      trace: "sin",
      targetFeature: { kind: "peak", x: 90, tol: 5 },
      successFeedback:
        "The crest at 90\u00b0 \u2014 the wave's only visit to height 1 per cycle, so sin x = 1 contributes exactly one solution while sin x = \u22121/2 (a line through the wave's body) contributes two: 210\u00b0 and 330\u00b0. Three in all \u2014 the factoring in the entry, counted on the graph.",
      lowFeedback:
        "Below the crest \u2014 the wave is still climbing. sin x = 1 only happens at the very top.",
      highFeedback:
        "Past the crest \u2014 descending now. Back up to the single point where the wave touches height 1.",
    },
  },

  "ti-05-02": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "Substituting cos\u00b2x = 1 \u2212 sin\u00b2x rewrites the equation entirely in sin x. Does the rewrite move any solutions?",
      options: [
        { id: "none", label: "No \u2014 the substitution is an identity, true at every x" },
        { id: "some", label: "It can shift solutions slightly" },
        { id: "adds", label: "It adds solutions" },
      ],
      outcomeId: "none",
      reveal:
        "None move: an identity holds at EVERY x, so replacing cos\u00b2x with 1 \u2212 sin\u00b2x changes the equation's clothing, never its solution set. (Squaring both sides is a different animal \u2014 that's the next lesson's trap.) Converting first earns you one function to solve for; the wave shows where.",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "After converting, the equation lives on y = sin x. Land the tip on the wave's zero at 180\u00b0 \u2014 the anchor for reading solutions off one function's graph.",
      targetAngle: 180,
      angleStart: 0,
      angleStep: 5,
      trace: "sin",
      targetFeature: { kind: "zero", x: 180, tol: 5 },
      successFeedback:
        "Zero at 180\u00b0. With everything written in sin x, every solution is a place THIS one wave meets a horizontal line \u2014 one graph to read instead of two tangled ones. The substitution in the entry is what bought that single wave, and it cost nothing: identities never move solutions.",
      lowFeedback:
        "Not at the crossing \u2014 the wave is still above the axis. Keep dragging toward 180\u00b0.",
      highFeedback:
        "Past the crossing \u2014 the wave has gone negative. Back up to where it meets the axis.",
    },
  },

  "ti-05-03": {
    step: "i1",
    expect: "mcq",
    predict: {
      prompt: "Squaring both sides of cos x = 1 \u2212 sin x: does the solution set survive intact?",
      options: [
        { id: "gains", label: "No \u2014 squaring can ADD impostors that solve the squared version only" },
        { id: "same", label: "Yes \u2014 squaring is reversible" },
        { id: "loses", label: "No \u2014 squaring silently DROPS solutions" },
      ],
      outcomeId: "gains",
      reveal:
        "Squaring adds: it makes cos x = \u2212(1 \u2212 sin x) count too, so candidates appear that fail the original \u2014 x = \u03c0 among them, as the entry shows. The danger zone is wherever cos x changes sign: land on that crossing. (Dividing by a trig factor is the opposite crime \u2014 it LOSES roots.)",
    },
    widget: {
      type: "unitCircleExplore",
      prompt:
        "Trace y = cos x and land the tip on its zero at 90\u00b0 \u2014 the sign boundary where squaring starts minting extraneous candidates.",
      targetAngle: 90,
      angleStart: 0,
      angleStep: 5,
      trace: "cos",
      targetFeature: { kind: "zero", x: 90, tol: 5 },
      successFeedback:
        "The crossing at 90\u00b0 \u2014 past it, cos x is negative, and squaring can no longer tell cos x from \u2212cos x. That blindness is what lets x = \u03c0 sneak into the candidate list while failing the original: cos \u03c0 = \u22121 \u2260 1 \u2212 sin \u03c0 = 1. Always test candidates back in the unsquared equation.",
      lowFeedback:
        "cos is still positive here \u2014 squaring is safe on this side. The trouble starts at the crossing: keep dragging.",
      highFeedback:
        "You've crossed into negative territory \u2014 back up to the boundary itself, where the sign flips.",
    },
  },
};

// ---- apply ---------------------------------------------------------------------------------
// Two phases. Every lesson is parsed, asserted and staged in memory FIRST; nothing is written
// until all 27 pass. A failure at entry 20 must not leave 19 lessons converted on disk.

const staged = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const dir = COURSES[lesson.slice(0, 2)];
  if (!dir) throw new Error(`${lesson}: no course mapping`);
  const path = `${dir}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected widget ${plan.expect}, found ${step.widget?.type}`);
  if (plan.predict && step.predict)
    throw new Error(`${lesson}/${plan.step}: already has a predict — refusing to overwrite authored content`);

  const bodyBefore = step.body;
  const idsBefore = doc.steps.map((s) => s.id).join(",");
  step.widget = plan.widget;
  if (plan.predict) {
    // Keep key order stable: predict sits before widget, as it does in every authored step.
    const rebuilt = {};
    for (const k of Object.keys(step)) {
      if (k === "widget") rebuilt.predict = plan.predict;
      rebuilt[k] = step[k];
    }
    if (!("predict" in rebuilt)) rebuilt.predict = plan.predict;
    for (const k of Object.keys(step)) delete step[k];
    Object.assign(step, rebuilt);
  }
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed — aborting`);
  if (doc.steps.map((s) => s.id).join(",") !== idsBefore)
    throw new Error(`${lesson}: step ids or order changed — aborting`);

  staged.push({ path, lesson, plan, text: JSON.stringify(doc, null, 2) });
}
if (staged.length !== 26) throw new Error(`staged ${staged.length}, expected 26`);

for (const { path, lesson, plan, text } of staged) {
  writeFileSync(path, text, "utf8");
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type}${plan.predict ? " (+predict)" : ""}`);
}
console.log(`\n${staged.length} lessons converted`);
