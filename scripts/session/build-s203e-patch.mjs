#!/usr/bin/env node
/**
 * Builds content/patches/s203e-geometry.json — Batch E, the last of the grades 6-8 Wave 1 expansion.
 *
 * TARGETS.
 *   7.G.A.2  draw geometric shapes with given conditions; construct triangles from three measures
 *            of angles or sides, noticing when the conditions determine a unique triangle, more
 *            than one, or none.  (uncovered -> covered)
 *   8.G.A.3  describe the effect of dilations, translations, rotations and reflections on
 *            two-dimensional figures USING COORDINATES.  (uncovered -> covered)
 *
 * THE POINT OF THIS BATCH. Both widgets already existed. `triangleConstraintLab` and
 * `compassConstruct` are used in 15 Grade 10 lessons and nowhere at Grade 7 — the machinery for the
 * exact standard was built and simply never pointed at the grade that requires it.
 *
 * ENGINES (all manip >= 2, and each checked against the pinned audits first — habit 3):
 *   triangleConstraintLab  manip 3, conseq 3 — its whole purpose is "do these givens lock one
 *       triangle?", which is 7.G.A.2 verbatim. Referenced only by session143-correction-audit,
 *       which greps source text and is NOT in the gen:reports chain.
 *   compassConstruct       manip 3 — the classical straightedge-and-compass constructions.
 *   transformExplore       manip 2, conseq 3 — translate and reflect onto a target image.
 *   dilationExplore        manip 2, conseq 3 — scale from a centre.
 *   None of these four is guarded by a count-pinning audit. `geometricConstraintLab` and
 *   `pointSetReasoningLab` ARE (s149 / s150 run whole-corpus checks), so they are avoided here.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function lesson({ id, slug, title, courseId, chapterId, minutes, standards, tag, c1, i1, k1, k2, c2, i2, k3, ch1, recap, remedial }) {
  return {
    id, slug, title, courseId, chapterId, minutes, standards,
    steps: [
      { id: "c1", kind: "concept", body: c1.body, figure: c1.figure },
      { id: "i1", kind: "interactive", body: i1.body, widget: i1.widget },
      { id: "k1", kind: "check", body: k1.body, conceptTag: tag, explanationVariants: k1.variants, widget: k1.widget },
      { id: "k2", kind: "check", body: k2.body, conceptTag: tag, explanationVariants: k2.variants, widget: k2.widget },
      { id: "c2", kind: "concept", body: c2.body, figure: c2.figure },
      { id: "i2", kind: "interactive", body: i2.body, widget: i2.widget },
      { id: "k3", kind: "check", body: k3.body, conceptTag: tag, explanationVariants: k3.variants, widget: k3.widget },
      { id: "ch1", kind: "challenge", body: ch1.body, conceptTag: tag, explanationVariants: ch1.variants, hints: ch1.hints, widget: ch1.widget },
      { id: "r1", kind: "recap", body: recap.body, takeaways: recap.takeaways, teaser: recap.teaser }
    ],
    remedials: remedial ? [remedial] : []
  };
}

const num = (prompt, answer, errs, fallback, unit = "") => ({
  type: "numeric", prompt, answer, tolerance: 0, unit,
  commonErrors: errs.map(([value, feedback]) => ({ value, feedback })),
  fallbackFeedback: fallback
});
const mcq = (prompt, opts) => ({
  type: "mcq", prompt,
  options: opts.map(([id, label, correct, feedback]) => ({ id, label, correct, feedback }))
});
const triLab = ({ prompt, targetCriterion, startCriterion, sideA, sideB, targetAngle, angleStart, requiredMoves, success, criterion, angle, evidence }) => ({
  type: "triangleConstraintLab", prompt, targetCriterion, startCriterion,
  sideA, sideB, targetAngle, angleStart, angleStep: 5, requiredMoves,
  successFeedback: success, criterionFeedback: criterion, angleFeedback: angle, evidenceFeedback: evidence
});
const compass = (mode, span, target, start, prompt, success, low, high) => ({
  type: "compassConstruct", mode, span, target, start, prompt,
  successFeedback: success, lowFeedback: low, highFeedback: high
});
const transform = ({ shape, target, prompt, allowReflect, success, offset, reflect, gridMin = -6, gridMax = 6 }) => ({
  type: "transformExplore", prompt, shape, target, gridMin, gridMax,
  dxMin: -6, dxMax: 6, dyMin: -6, dyMax: 6, allowReflect,
  successFeedback: success, offsetFeedback: offset, reflectFeedback: reflect
});

/* ==================================================== G7 — drawing triangles from conditions */

const g703b01 = lesson({
  id: "g7-03b-01", slug: "three-sides-one-triangle", title: "Three Sides, One Triangle",
  courseId: "geometry-g7", chapterId: "ch3b-drawing-triangles-from-conditions", minutes: 12,
  standards: ["7.G.A.2"], tag: "triangle-conditions-unique",
  c1: {
    figure: "g7-sss-locks",
    body: "Hand three people the same three side lengths — 4, 5 and 6 — and tell them to build a triangle. They will all build the **same** triangle.\n\nIt may be flipped or turned, but no one can produce a different shape. Three sides leave nothing to choose, which is what mathematicians mean when they say the conditions **determine a unique triangle**."
  },
  i1: {
    body: "Test whether the givens leave any freedom at all.",
    widget: triLab({
      prompt: "Start from SSA and switch to SSS — the criterion where all three sides are given. Then try to reveal a second, different triangle.",
      targetCriterion: "SSS", startCriterion: "SSA", sideA: 4, sideB: 6, targetAngle: 60, angleStart: 35, requiredMoves: 3,
      success: "No second triangle appears. With all three sides fixed there is no unresolved choice left — the shape is locked up to sliding, turning and flipping.",
      criterion: "SSA leaves a choice: the third side can swing to meet the base in two places. Choose the criterion that fixes every side.",
      angle: "The criterion is right. Now settle the angle so the construction matches the target.",
      evidence: "Move the pieces a few more times before checking — the claim is that NO arrangement gives a second triangle."
    })
  },
  k1: {
    body: "Not every trio of lengths works at all.",
    variants: [
      "2 + 3 = 5, which is less than 6, so the two short sides cannot reach across — no triangle exists.",
      "The two shorter sides must together exceed the longest one; 5 is not more than 6."
    ],
    widget: mcq("How many triangles can be built with sides 2, 3 and 6?", [
      ["a", "None", true, "2 + 3 = 5 is less than 6. The short sides fall flat against the long one and never meet."],
      ["b", "Exactly one", false, "Check whether the sides can reach: 2 + 3 = 5, which does not span 6."],
      ["c", "Two", false, "Two triangles arise from ambiguous ANGLE conditions, never from three fixed sides."],
      ["d", "Infinitely many", false, "Fixed lengths never give infinitely many. Here they give none — the sides cannot meet."]
    ])
  },
  k2: {
    body: "Two sides and the angle between them.",
    variants: [
      "SAS fixes both sides and the angle they enclose, so the third vertex has nowhere else to go — exactly one triangle.",
      "The included angle removes the swing that makes SSA ambiguous."
    ],
    widget: mcq("Sides of 5 and 8 with a 60° angle BETWEEN them. How many triangles?", [
      ["a", "Exactly one", true, "Two sides and their included angle pin the third vertex completely — no choice remains."],
      ["b", "None", false, "These conditions are perfectly buildable; the two sides meet at 60° and the third side closes the gap."],
      ["c", "Two", false, "Two arise when the angle is NOT between the given sides. Here it is included, so the triangle is locked."],
      ["d", "Infinitely many", false, "Fixing two side lengths rules out infinitely many — the size is already set."]
    ])
  },
  c2: {
    figure: "g7-triangle-inequality",
    body: "The failure case has a rule of its own. Two sides can only meet if together they are **longer** than the third.\n\n2 and 3 cannot bridge a gap of 6: laid end to end they reach 5 and stop short. That is the triangle inequality, and it is why some lists of three lengths describe no triangle at all."
  },
  i2: {
    body: "Now lock a triangle with an angle between two sides.",
    widget: triLab({
      prompt: "Switch to SAS and set the included angle to 60°, then try to reveal a second valid triangle.",
      targetCriterion: "SAS", startCriterion: "SSA", sideA: 5, sideB: 8, targetAngle: 60, angleStart: 35, requiredMoves: 3,
      success: "SAS at 60° leaves nothing unresolved: two sides and the angle between them determine one triangle, and the second candidate collapses onto the first.",
      criterion: "SSA can branch into two different triangles. Pick the criterion whose givens remove every degree of freedom.",
      angle: "Right criterion — now set the included angle to 60° so it matches the target construction.",
      evidence: "Try a few more arrangements before checking, so the 'only one' claim is actually tested."
    })
  },
  k3: {
    body: "Which trio can be built?",
    variants: [
      "For 5, 7, 11: 5 + 7 = 12 > 11, so the sides reach and one triangle exists.",
      "Check the two shorter sides against the longest: their sum must exceed it."
    ],
    widget: mcq("Which set of side lengths CAN form a triangle?", [
      ["a", "5, 7, 11", true, "5 + 7 = 12, which is more than 11 — the short sides reach across and meet."],
      ["b", "3, 4, 9", false, "3 + 4 = 7, less than 9. The sides fall short."],
      ["c", "2, 2, 5", false, "2 + 2 = 4, less than 5 — no meeting point."],
      ["d", "1, 6, 8", false, "1 + 6 = 7, less than 8. The shortest side is far too small to help."]
    ])
  },
  ch1: {
    body: "The boundary case is the interesting one.",
    variants: [
      "4 + 6 = 10, exactly the third side, so the sides lie flat along it and enclose no area — no triangle.",
      "Equality is the failure boundary: the sides just touch in a straight line rather than meeting above it."
    ],
    hints: [
      "Add the two shorter sides and compare with the longest.",
      "4 + 6 = 10, which is exactly 10 — not more than it.",
      "When the sum EQUALS the third side, the sides lie flat in a straight line, so no triangle is formed."
    ],
    widget: mcq("How many triangles have sides 4, 6 and 10?", [
      ["a", "None", true, "4 + 6 = 10 exactly. The two sides lie flat along the third in a straight line, enclosing no area at all."],
      ["b", "Exactly one", false, "The sides must be strictly longer than the third to meet above it. Here they only just reach, lying flat."],
      ["c", "Two", false, "Fixed side lengths never give two triangles — that comes from ambiguous angle conditions."],
      ["d", "Infinitely many", false, "The lengths are fixed, so the size is fixed. Here they cannot form a triangle at all."]
    ])
  },
  recap: {
    body: "Three lengths, and the question of whether they leave a choice.",
    takeaways: [
      "Three fixed sides (SSS) determine exactly one triangle, up to flips and turns.",
      "Two sides with the angle BETWEEN them (SAS) also determine exactly one.",
      "The two shorter sides must together exceed the longest, or no triangle exists at all."
    ],
    teaser: "Next: the conditions that leave a choice — two triangles, or infinitely many."
  },
  remedial: {
    conceptTag: "triangle-conditions-unique",
    concept: { id: "rem-tcu-c", kind: "concept", body: "Rewind. Three side lengths build a triangle only when the two shorter ones together **exceed** the longest. 3 and 4 total 7, which is more than 5, so 3-4-5 works." },
    check: {
      id: "rem-tcu-k", kind: "check", body: "", conceptTag: "triangle-conditions-unique",
      explanationVariants: ["2 + 4 = 6, which is less than 9, so the sides cannot reach.", "The two shorter sides fall short of the longest, so no triangle forms."],
      widget: mcq("Can sides 2, 4 and 9 form a triangle?", [
        ["a", "No", true, "2 + 4 = 6, which is less than 9 — the short sides never meet."],
        ["b", "Yes, exactly one", false, "Compare 2 + 4 with 9: six cannot span nine."],
        ["c", "Yes, two of them", false, "Three fixed sides never give two triangles, and these cannot even make one."]
      ])
    }
  }
});

const g703b02 = lesson({
  id: "g7-03b-02", slug: "when-the-conditions-leave-a-choice", title: "When the Conditions Leave a Choice",
  courseId: "geometry-g7", chapterId: "ch3b-drawing-triangles-from-conditions", minutes: 12,
  standards: ["7.G.A.2"], tag: "triangle-conditions-ambiguous",
  c1: {
    figure: "g7-ssa-two-triangles",
    body: "Give two sides and an angle that is **not** between them, and the triangle stops being unique.\n\nThe second side swings like a door and can reach the base at two different points. Both landings satisfy every given, so the conditions describe *two* different triangles — this is the ambiguous case, SSA."
  },
  i1: {
    body: "Find the second triangle the givens allow.",
    widget: triLab({
      prompt: "Stay on SSA and hunt for a second valid triangle: set the angle to 35° and look for the alternative landing.",
      targetCriterion: "SSA", startCriterion: "SSA", sideA: 5, sideB: 8, targetAngle: 35, angleStart: 60, requiredMoves: 4,
      success: "Two triangles, both obeying every given. That is what makes SSA ambiguous — the swinging side meets the base twice, and nothing in the conditions says which landing to take.",
      criterion: "Stay with SSA for this one — the whole point is to see the criterion that fails to lock.",
      angle: "Bring the angle to 35°, where the second landing is clearly visible.",
      evidence: "Keep exploring: the claim is that a SECOND triangle exists, so it has to be found, not assumed."
    })
  },
  k1: {
    body: "Name the ambiguous arrangement.",
    variants: [
      "When the angle is not between the two given sides, the third side can swing to two positions.",
      "SSA is ambiguous precisely because the angle sits outside the pair of given sides."
    ],
    widget: mcq("Which set of conditions can describe TWO different triangles?", [
      ["a", "Two sides and an angle NOT between them", true, "The unfixed side swings and can meet the base at two points — the ambiguous case."],
      ["b", "Three sides", false, "Three fixed sides leave no freedom at all: exactly one triangle."],
      ["c", "Two angles and the side between them", false, "That fixes the triangle completely — one triangle."],
      ["d", "Two sides and the angle between them", false, "An included angle pins the third vertex: exactly one triangle."]
    ])
  },
  k2: {
    body: "Angles alone fix shape, not size.",
    variants: [
      "50°, 60° and 70° describes a shape, and that shape can be drawn at any size — infinitely many triangles.",
      "No side length is given, so nothing sets the scale."
    ],
    widget: mcq("How many triangles have angles 50°, 60° and 70°?", [
      ["a", "Infinitely many", true, "The angles fix the SHAPE, but no length is given, so it can be drawn at any size at all."],
      ["b", "Exactly one", false, "Nothing here sets the size — a tiny one and a huge one both fit these angles."],
      ["c", "None", false, "The angles sum to 180°, so such triangles certainly exist."],
      ["d", "Two", false, "Two arises from ambiguous side-angle conditions. Here every size works."]
    ])
  },
  c2: {
    figure: "g7-aaa-same-shape",
    body: "Three angles that sum to 180° always describe a real shape — but never a single triangle.\n\nWith no length anywhere in the conditions there is nothing to set the scale, so the same shape can be drawn at every size. That is **infinitely many**, and it is a different kind of non-uniqueness from SSA's exactly two."
  },
  i2: {
    body: "Now watch a criterion that does lock.",
    widget: triLab({
      prompt: "Switch to ASA — two angles with the side between them — and set the angle to 60°. Then try to find a second triangle.",
      targetCriterion: "ASA", startCriterion: "SSA", sideA: 6, sideB: 6, targetAngle: 60, angleStart: 40, requiredMoves: 3,
      success: "One triangle only. The side between the two angles sets the size, and the angles set the shape — together they leave nothing to choose.",
      criterion: "SSA is the ambiguous one. Choose the criterion where the given side sits BETWEEN the two given angles.",
      angle: "Right criterion — now bring the angle to 60°.",
      evidence: "Test a few arrangements before checking, so the uniqueness claim is earned."
    })
  },
  k3: {
    body: "Sort a condition into its outcome.",
    variants: [
      "Angles 90°, 60° and 40° total 190°, which is impossible — no triangle can have them.",
      "Every triangle's angles sum to exactly 180°, so this set describes nothing."
    ],
    widget: mcq("How many triangles have angles 90°, 60° and 40°?", [
      ["a", "None", true, "They total 190°. A triangle's angles always sum to exactly 180°, so no such triangle exists."],
      ["b", "Infinitely many", false, "That would be right if they summed to 180°. Add them: 90 + 60 + 40 = 190."],
      ["c", "Exactly one", false, "Angles alone never give exactly one — and these do not sum to 180° anyway."],
      ["d", "Two", false, "Check the sum first: 190° is impossible for any triangle."]
    ])
  },
  ch1: {
    body: "Three outcomes, and you have now met all of them.",
    variants: [
      "Two angles plus a non-included side (AAS) still fixes the third angle and therefore the whole triangle — exactly one.",
      "Knowing two angles gives the third for free, and one side then sets the size."
    ],
    hints: [
      "If you know two angles of a triangle, what do you know about the third?",
      "The third angle is forced, since all three must total 180°. So the shape is completely fixed.",
      "With the shape fixed and one side length given, the size is fixed too — exactly one triangle."
    ],
    widget: mcq("Two angles of 50° and 60°, plus a side that is NOT between them. How many triangles?", [
      ["a", "Exactly one", true, "The third angle must be 70°, so the shape is fixed; the given side then fixes the size."],
      ["b", "Two", false, "The two-triangle case comes from two SIDES and a non-included angle. Two angles fix the shape completely."],
      ["c", "Infinitely many", false, "That happens when no length is given at all. Here a side is given, so the size is set."],
      ["d", "None", false, "50 + 60 = 110, leaving 70° for the third angle — a perfectly ordinary triangle."]
    ])
  },
  recap: {
    body: "Unique, two, infinitely many, or none.",
    takeaways: [
      "Two sides with a NON-included angle (SSA) can give two different triangles.",
      "Three angles alone give infinitely many — shape without size.",
      "Angles that do not sum to 180°, or sides that cannot reach, give none."
    ],
    teaser: "Next: drawing these triangles for real, with a compass and a straightedge."
  }
});

const g703b03 = lesson({
  id: "g7-03b-03", slug: "constructing-with-compass-and-straightedge", title: "Constructing with Compass and Straightedge",
  courseId: "geometry-g7", chapterId: "ch3b-drawing-triangles-from-conditions", minutes: 12,
  standards: ["7.G.A.2"], tag: "triangle-construction-tools",
  c1: {
    figure: "g7-perp-bisector-arcs",
    body: "A compass does one thing: it holds a distance. That single ability is enough to build every construction in this lesson.\n\nSwing equal arcs from each end of a segment and they cross above and below it. Every crossing sits the same distance from both ends, so the line through them is the **perpendicular bisector** — proved, not measured."
  },
  i1: {
    body: "Open the compass until the arcs actually meet.",
    widget: compass("perpBisector", 6, 4, 2,
      "A and B are 6 apart. Open the compass until the two arcs meet — find the smallest whole radius that does it.",
      "Radius 4 — the first whole opening that clears half of 6. Widen it further and the crossings slide, but the LINE through them refuses to move: every crossing is equidistant from A and B by construction.",
      "The arcs cannot reach each other yet. Each reaches only its own radius from its own end, so together they must span more than the 6 between A and B — the radius has to clear 3.",
      "They do meet, but the question asks for the SMALLEST whole radius that reaches. Come back down.")
  },
  k1: {
    body: "Why the crossings land where they do.",
    variants: [
      "Both arcs were drawn with the same radius, so any crossing is that distance from A and from B.",
      "Equal radii force equal distances, which is exactly the definition of the perpendicular bisector."
    ],
    widget: mcq("Why does every arc crossing lie on the perpendicular bisector of AB?", [
      ["a", "Both arcs use the same radius, so each crossing is equally far from A and from B", true, "Equidistance from the two ends is the definition of the perpendicular bisector — the compass guarantees it."],
      ["b", "Because the arcs are drawn above and below the segment", false, "Position is not the reason. The reason is that both distances are equal by construction."],
      ["c", "Because the radius is more than half of AB", false, "That is what makes the arcs MEET. Why they meet on the bisector is the equal radii."],
      ["d", "Because a straightedge was used", false, "The straightedge only joins the crossings; the compass did the mathematical work."]
    ])
  },
  k2: {
    body: "The reaching condition, in general.",
    variants: [
      "Each arc reaches its own radius from its own endpoint, so the two radii together must exceed the 8 between them: r must be more than 4.",
      "The radius has to clear half the segment, so more than 4."
    ],
    widget: num("A and B are 8 apart. What is the smallest whole compass radius whose arcs will meet?", 5,
      [[4, "At exactly 4 the arcs only just touch at the midpoint, a single point rather than two crossings. The first whole radius that clears half of 8 is 5."],
       [8, "8 works, but it is not the smallest. Anything above half of 8 will do, so 5 is the first whole number."]],
      "The radius must exceed half of 8, so the smallest whole value is 5.")
  },
  c2: {
    figure: "g7-copy-angle-arcs",
    body: "The same trick copies an **angle** without ever measuring it.\n\nSwing one arc across the original angle and an identical arc on the new ray. Then step off the distance between the two crossing points. Because every distance was carried by the compass, the copied angle is exactly equal — no protractor, no rounding."
  },
  i2: {
    body: "Bisect an angle with the same grammar.",
    widget: compass("angleBisector", 6, 5, 2,
      "Bisect the angle: open the compass wide enough for the two arcs to cross inside it. Find the smallest whole radius that works.",
      "Radius 5. The crossing point is equally far from both arms, so the ray through it splits the angle exactly in half — the same equidistance argument as the perpendicular bisector, applied to two rays instead of two points.",
      "Too small — the arcs do not yet cross inside the angle. Open the compass wider.",
      "That crosses, but a smaller whole radius already does. Come back down to the first one that works.")
  },
  k3: {
    body: "What the tools can and cannot promise.",
    variants: [
      "A compass construction is exact by argument; a protractor reading is only as good as the eye reading it.",
      "The construction proves equality, rather than measuring it approximately."
    ],
    widget: mcq("Why prefer a compass construction to measuring with a protractor?", [
      ["a", "The construction is exact by argument, not by eye", true, "Equal radii force equal distances, so the result is proved. A protractor reading is only as accurate as the person reading it."],
      ["b", "A compass is faster", false, "Speed is not the point — often it is slower. The point is that the result is guaranteed."],
      ["c", "Protractors cannot measure angles over 90°", false, "They can. The difference is proof versus approximation."],
      ["d", "The compass works without a straightedge", false, "Both tools are used together; the straightedge draws the lines the compass locates."]
    ])
  },
  ch1: {
    body: "Put the construction and the conditions together.",
    variants: [
      "SSS is a compass job: draw the base, then swing an arc of each remaining length from each end, and their crossing is the third vertex.",
      "Two arcs locate the third vertex because it must be a fixed distance from each end of the base."
    ],
    hints: [
      "You have three lengths. Start by drawing one of them as the base.",
      "The third vertex must be a known distance from EACH end of that base.",
      "So swing an arc of one length from one end and an arc of the other length from the other end — where they cross is the vertex."
    ],
    widget: mcq("To construct a triangle with sides 4, 5 and 6, you draw the 6 first. What comes next?", [
      ["a", "Swing an arc of radius 4 from one end and radius 5 from the other; they cross at the third vertex", true, "The third vertex is 4 from one end and 5 from the other, and the two arcs locate exactly that point."],
      ["b", "Measure a 60° angle at one end with a protractor", false, "A protractor is not needed here — no angle was given. Three sides alone determine the triangle, and swinging arcs locates the vertex exactly."],
      ["c", "Swing arcs of radius 6 from both ends", false, "6 is the base you already drew. The arcs must use the OTHER two lengths."],
      ["d", "Draw the perpendicular bisector of the 6", false, "That finds the midpoint, which is not where the third vertex sits unless the triangle is isosceles."]
    ])
  },
  recap: {
    body: "One tool, one idea: carrying a distance.",
    takeaways: [
      "Equal compass radii force equal distances — that is why constructions prove rather than measure.",
      "Arcs from both ends of a segment cross on its perpendicular bisector.",
      "An SSS triangle is built by swinging one arc of each remaining length from each end of the base."
    ],
    teaser: "Next chapter: which sets of three lengths make a triangle, and what a solid looks like when it is sliced."
  }
});

/* ==================================================== G8 — transformations in coordinates */

const tm01b01 = lesson({
  id: "tm-01b-01", slug: "translations-as-coordinate-rules", title: "Translations as Coordinate Rules",
  courseId: "transformations-measurement", chapterId: "ch1b-transformations-in-coordinates", minutes: 11,
  standards: ["8.G.A.3"], tag: "coordinate-rule-translation",
  c1: {
    figure: "tm8-translate-rule",
    body: "You have slid shapes around already. Now write down exactly what a slide **does to the numbers**.\n\nMove three right and two up and every point obeys the same instruction: (x, y) → (x + 3, y + 2). Not the vertices you happen to notice — every point, the same shift. That sentence is the whole transformation."
  },
  i1: {
    body: "Slide the triangle onto its target and watch the coordinates.",
    widget: transform({
      shape: [[1, 1], [3, 1], [1, 4]], target: [[4, 3], [6, 3], [4, 6]],
      gridMin: 0, gridMax: 8, allowReflect: false,
      prompt: "Slide the triangle onto its target: right 3 and up 2.",
      success: "Every vertex moved by exactly (+3, +2) — and the shape did not change at all. That is why a translation is rigid: the same vector is added to every point, so no length or angle can move.",
      offset: "Not there yet. Each vertex must move by the SAME amount — compare (1, 1) with (4, 3).",
      reflect: "A flip has crept in. This target is a pure slide, so the triangle keeps its orientation."
    })
  },
  k1: {
    body: "Apply a rule to one point.",
    variants: [
      "(x, y) → (x − 4, y + 1) sends (6, 2) to (2, 3).",
      "Subtract 4 from the x and add 1 to the y."
    ],
    widget: num("Under the rule (x, y) → (x − 4, y + 1), the point (6, 2) lands at (a, 3). What is a?", 2,
      [[10, "10 adds 4 instead of subtracting it. The rule says x − 4, so 6 − 4 = 2."],
       [6, "6 leaves x unchanged. The rule shifts it left by 4."]],
      "6 − 4 = 2.")
  },
  k2: {
    body: "Read the rule off a movement.",
    variants: [
      "From (2, 5) to (7, 1): x rose by 5 and y fell by 4, so the rule is (x, y) → (x + 5, y − 4).",
      "Subtract the start from the end: 7 − 2 = 5 and 1 − 5 = −4."
    ],
    widget: mcq("A translation sends (2, 5) to (7, 1). What is the rule?", [
      ["a", "(x, y) → (x + 5, y − 4)", true, "x went up by 5 (2 → 7) and y went down by 4 (5 → 1)."],
      ["b", "(x, y) → (x + 5, y + 4)", false, "The y-coordinate FELL from 5 to 1, so it is −4, not +4."],
      ["c", "(x, y) → (x − 5, y + 4)", false, "Both signs are backwards. Subtract the start from the end: 7 − 2 = +5."],
      ["d", "(x, y) → (x + 7, y + 1)", false, "That adds the destination rather than the change. The shift is end minus start."]
    ])
  },
  c2: {
    figure: "gf-translations-chain",
    body: "Because a translation is just addition, two of them in a row simply add up.\n\nSlide (+2, −5) and then (−7, +1) and the net effect is (−5, −4) — one slide doing the work of two. No shape has changed at any stage, which is the deeper point: translations preserve every distance and every angle."
  },
  i2: {
    body: "A slide with a negative component.",
    widget: transform({
      shape: [[4, 5], [6, 5], [4, 7]], target: [[1, 2], [3, 2], [1, 4]],
      gridMin: 0, gridMax: 8, allowReflect: false,
      prompt: "Slide the triangle onto its target: left 3 and down 3.",
      success: "Every vertex moved by (−3, −3). Negative components are nothing special — the rule is still 'add the same vector to every point'.",
      offset: "Not there yet. Compare (4, 5) with its target (1, 2): both coordinates must fall by 3.",
      reflect: "A flip has crept in. This is a pure slide, so turn the reflection back off."
    })
  },
  k3: {
    body: "Compose two slides.",
    variants: [
      "(+2, −5) then (−7, +1) gives 2 − 7 = −5 in x, so the combined rule shifts x by −5.",
      "Add the two x-shifts: 2 + (−7) = −5."
    ],
    widget: num("A shape is translated by (+2, −5), then by (−7, +1). In the single combined rule, by how much does x change?", -5,
      [[9, "9 subtracts the shifts instead of adding them. Translations compose by ADDING: 2 + (−7) = −5."],
       [-14, "−14 multiplies the shifts. They add: 2 + (−7) = −5."]],
      "2 + (−7) = −5.")
  },
  ch1: {
    body: "Work backwards from the image.",
    variants: [
      "If (x, y) → (x − 2, y + 6) landed a point at (3, 10), the original had x = 3 + 2 = 5 and y = 10 − 6 = 4.",
      "Undo the rule: add back what was subtracted and subtract what was added."
    ],
    hints: [
      "You know where the point ended up and what the rule did to it.",
      "The rule subtracted 2 from x, so to go backwards, add 2 to the image's x.",
      "3 + 2 = 5 and 10 − 6 = 4, so the original point was (5, 4)."
    ],
    widget: num("Under (x, y) → (x − 2, y + 6), a point lands at (3, 10). What was its original x-coordinate?", 5,
      [[1, "1 applies the rule again instead of undoing it. Going backwards means ADDING the 2 back: 3 + 2 = 5."],
       [3, "3 is the image's x-coordinate. The original was 2 larger, since the rule subtracted 2."]],
      "The rule subtracted 2, so the original x was 3 + 2 = 5.")
  },
  recap: {
    body: "A slide, written as arithmetic.",
    takeaways: [
      "A translation is (x, y) → (x + a, y + b), applied to every point alike.",
      "Read the rule off a movement by subtracting the start from the end.",
      "Translations compose by adding their vectors, and never change lengths or angles."
    ],
    teaser: "Next: the rule for a flip, and which coordinate changes sign."
  }
});

const tm01b02 = lesson({
  id: "tm-01b-02", slug: "reflections-as-coordinate-rules", title: "Reflections as Coordinate Rules",
  courseId: "transformations-measurement", chapterId: "ch1b-transformations-in-coordinates", minutes: 11,
  standards: ["8.G.A.3"], tag: "coordinate-rule-reflection",
  c1: {
    figure: "tm8-reflect-rule",
    body: "A flip changes exactly one coordinate's sign, and which one depends on the mirror.\n\nAcross the **y-axis**, left and right swap: (x, y) → (−x, y). Across the **x-axis**, up and down swap: (x, y) → (x, −y). The coordinate that changes is the one measured *perpendicular* to the mirror line."
  },
  i1: {
    body: "Flip the triangle onto its mirror image.",
    widget: transform({
      shape: [[1, 1], [3, 1], [1, 4]], target: [[-1, 1], [-3, 1], [-1, 4]],
      gridMin: -6, gridMax: 6, allowReflect: true,
      prompt: "Reflect the triangle across the y-axis onto its target.",
      success: "Every x-coordinate changed sign and every y-coordinate stayed put: (x, y) → (−x, y). The shape is the same size — a reflection is rigid — but its orientation has turned over.",
      offset: "Not there yet. A pure reflection across the y-axis needs no sliding at all; compare (1, 1) with (−1, 1).",
      reflect: "The reflection needs to be switched ON for this target — the image is a mirror image, not a slide."
    })
  },
  k1: {
    body: "Apply the y-axis rule.",
    variants: [
      "Across the y-axis only x changes sign, so (5, −2) becomes (−5, −2).",
      "(x, y) → (−x, y) leaves the y-coordinate untouched."
    ],
    widget: mcq("Reflect (5, −2) across the y-axis.", [
      ["a", "(−5, −2)", true, "Only x changes sign across the y-axis; the −2 stays exactly as it was."],
      ["b", "(5, 2)", false, "That is a reflection across the x-axis, which changes the sign of y instead."],
      ["c", "(−5, 2)", false, "Both signs changed — that is a rotation of 180° about the origin, not a single reflection."],
      ["d", "(−2, 5)", false, "Swapping the coordinates is reflection across the line y = x, a different mirror."]
    ])
  },
  k2: {
    body: "Now the other axis.",
    variants: [
      "Across the x-axis, y changes sign: (−3, 7) becomes (−3, −7).",
      "(x, y) → (x, −y) leaves x alone."
    ],
    widget: num("Reflect (−3, 7) across the x-axis. The image is (−3, b). What is b?", -7,
      [[7, "7 leaves y unchanged, but reflecting across the x-axis flips it: 7 becomes −7."],
       [3, "3 confuses the coordinates. The y-coordinate is 7, and it becomes −7."]],
      "Across the x-axis, y changes sign: 7 → −7.")
  },
  c2: {
    figure: "gf-reflections-signs",
    body: "Reflections are rigid, and that has a consequence worth noticing: they preserve every length and every angle, yet they reverse **orientation**.\n\nTrace the vertices of the original in order and then trace the image. What ran clockwise now runs anticlockwise. That is the one thing a translation can never do, and it is what distinguishes a flip from a slide."
  },
  i2: {
    body: "Flip across the x-axis this time.",
    widget: transform({
      shape: [[2, 1], [5, 1], [2, 3]], target: [[2, -1], [5, -1], [2, -3]],
      gridMin: -6, gridMax: 6, allowReflect: true,
      prompt: "Reflect the triangle across the x-axis onto its target.",
      success: "Every y-coordinate changed sign while x stayed put: (x, y) → (x, −y). Same size, same angles, opposite orientation.",
      offset: "A pure reflection needs no sliding at all — the mirror does the work. Compare (2, 1) with (2, −1): only the sign of y changes.",
      reflect: "Switch the reflection on — this target sits below the axis as a mirror image."
    })
  },
  k3: {
    body: "Identify the mirror from the rule.",
    variants: [
      "(x, y) → (−x, y) negates x, so the mirror is the y-axis.",
      "The coordinate that flips is measured perpendicular to the mirror, so flipping x means mirroring in the y-axis."
    ],
    widget: mcq("Which transformation does the rule (x, y) → (−x, y) describe?", [
      ["a", "Reflection across the y-axis", true, "The x-coordinate flips, which is the direction perpendicular to the y-axis."],
      ["b", "Reflection across the x-axis", false, "That rule would be (x, y) → (x, −y), flipping the y-coordinate."],
      ["c", "A translation left", false, "A translation adds a fixed amount; this negates x, which moves different points by different amounts."],
      ["d", "A rotation of 180°", false, "That negates BOTH coordinates: (x, y) → (−x, −y)."]
    ])
  },
  ch1: {
    body: "Two flips in a row.",
    variants: [
      "Reflecting across the y-axis then the x-axis negates both coordinates: (4, 3) → (−4, 3) → (−4, −3).",
      "Apply the rules in order; the result is the same as a 180° rotation about the origin."
    ],
    hints: [
      "Do one reflection at a time and write down the intermediate point.",
      "Across the y-axis first: (4, 3) becomes (−4, 3).",
      "Then across the x-axis, the y-coordinate flips: (−4, 3) becomes (−4, −3)."
    ],
    widget: mcq("Reflect (4, 3) across the y-axis, then reflect the result across the x-axis. Where does it land?", [
      ["a", "(−4, −3)", true, "First (4,3) → (−4,3), then (−4,3) → (−4,−3). Both coordinates ended up negated — the same as a 180° rotation about the origin."],
      ["b", "(4, 3)", false, "The two reflections are in different mirrors, so they do not undo each other."],
      ["c", "(−4, 3)", false, "That is only the first reflection. The second one still has to flip the y-coordinate."],
      ["d", "(3, 4)", false, "Swapping coordinates is reflection across y = x, which is not either of these mirrors."]
    ])
  },
  recap: {
    body: "A flip is a sign change, and the mirror decides which.",
    takeaways: [
      "Across the y-axis: (x, y) → (−x, y). Across the x-axis: (x, y) → (x, −y).",
      "The coordinate that changes is the one measured perpendicular to the mirror.",
      "Reflections keep every length and angle but reverse orientation."
    ],
    teaser: "Next: the one transformation that does change size."
  }
});

const tm01b03 = lesson({
  id: "tm-01b-03", slug: "dilations-as-coordinate-rules", title: "Dilations as Coordinate Rules",
  courseId: "transformations-measurement", chapterId: "ch1b-transformations-in-coordinates", minutes: 12,
  standards: ["8.G.A.3"], tag: "coordinate-rule-dilation",
  c1: {
    figure: "tm8-dilate-rule",
    body: "Translations and reflections are rigid: they move a shape without resizing it. A **dilation** is the one that changes size.\n\nFrom the origin with scale factor k, the rule is (x, y) → (kx, ky). Every distance from the centre is multiplied by k, so the shape is preserved exactly while the size is not."
  },
  i1: {
    body: "Scale the triangle from the origin.",
    widget: {
      type: "dilationExplore",
      prompt: "Dilate the triangle by a scale factor of 2 from the origin.",
      shape: [[1, 1], [3, 1], [2, 3]], center: [0, 0],
      targetK: 2, kMin: 0.5, kMax: 3, kStep: 0.5, kStart: 1, gridMin: 0, gridMax: 7,
      successFeedback: "k = 2 doubles every distance from the centre, so (1,1) → (2,2) and (3,1) → (6,2). The image is twice as large and exactly the same shape — the angles never moved.",
      lowFeedback: "The image is smaller than a doubling. A larger k pushes every point further from the centre.",
      highFeedback: "The image is larger than a doubling. A smaller k pulls every point back toward the centre."
    }
  },
  k1: {
    body: "Apply a scale factor.",
    variants: [
      "(x, y) → (3x, 3y) sends (2, 5) to (6, 15).",
      "Multiply both coordinates by 3."
    ],
    widget: num("Under a dilation of factor 3 centred at the origin, (2, 5) lands at (6, b). What is b?", 15,
      [[8, "8 ADDS 3 to the y-coordinate. A dilation multiplies: 5 × 3 = 15."],
       [5, "5 leaves y unchanged, but a dilation scales BOTH coordinates."]],
      "5 × 3 = 15.")
  },
  k2: {
    body: "A factor below 1.",
    variants: [
      "k = ½ halves every coordinate, so (8, 6) becomes (4, 3).",
      "A scale factor between 0 and 1 shrinks the figure toward the centre."
    ],
    widget: mcq("A dilation of factor ½ centred at the origin maps (8, 6) to which point?", [
      ["a", "(4, 3)", true, "Both coordinates are halved. A factor under 1 pulls every point toward the centre."],
      ["b", "(16, 12)", false, "That doubles instead of halving. A factor of ½ makes the figure smaller."],
      ["c", "(7.5, 5.5)", false, "That subtracts ½. Dilation multiplies each coordinate by the factor."],
      ["d", "(4, 6)", false, "Both coordinates scale, not just the x."]
    ])
  },
  c2: {
    figure: "dilation-scale",
    body: "A dilation is **not** rigid, and that is exactly its job: it produces a **similar** figure — same angles, all lengths multiplied by k.\n\nThat is the difference the whole chapter turns on. Translations, reflections and rotations give congruence; dilations give similarity. And an area does not scale by k, but by k² — doubling the lengths quadruples the space inside."
  },
  i2: {
    body: "Shrink instead of grow.",
    widget: {
      type: "dilationExplore",
      prompt: "Dilate the triangle by a scale factor of 0.5 from the origin.",
      shape: [[2, 2], [6, 2], [4, 6]], center: [0, 0],
      targetK: 0.5, kMin: 0.25, kMax: 3, kStep: 0.25, kStart: 1.5, gridMin: 0, gridMax: 7,
      successFeedback: "k = 0.5 halves every distance from the centre: (2,2) → (1,1) and (6,2) → (3,1). The triangle is smaller but its angles are untouched — similar, not congruent.",
      lowFeedback: "That is smaller than a halving — the image has shrunk too far toward the centre. Bring k back up to 0.5.",
      highFeedback: "The image is still larger than half size. A smaller k pulls the points further toward the centre."
    }
  },
  k3: {
    body: "Which transformations preserve size?",
    variants: [
      "Translations, reflections and rotations are rigid; only the dilation changes lengths.",
      "A dilation with k ≠ 1 produces a similar figure rather than a congruent one."
    ],
    widget: mcq("Which transformation does NOT produce a congruent image?", [
      ["a", "A dilation with scale factor 3", true, "Lengths are tripled, so the image is similar but not congruent — the only one here that resizes."],
      ["b", "A translation of (+4, −2)", false, "A slide is rigid: every length and angle is preserved."],
      ["c", "A reflection across the x-axis", false, "A flip is rigid; it reverses orientation but keeps all lengths."],
      ["d", "A rotation of 90° about the origin", false, "A turn is rigid: sizes and angles are unchanged."]
    ])
  },
  ch1: {
    body: "Work backwards to the scale factor.",
    variants: [
      "(3, 4) landed at (12, 16), and 12 ÷ 3 = 4, so k = 4.",
      "Divide an image coordinate by the matching original coordinate."
    ],
    hints: [
      "Compare one coordinate of the image with the same coordinate of the original.",
      "The x went from 3 to 12. What was it multiplied by?",
      "12 ÷ 3 = 4, and checking the other coordinate agrees: 16 ÷ 4 = 4."
    ],
    widget: num("A dilation centred at the origin maps (3, 4) to (12, 16). What is the scale factor?", 4,
      [[9, "9 is the DIFFERENCE 12 − 3. A dilation multiplies, so divide instead: 12 ÷ 3 = 4."],
       [3, "3 is the original x-coordinate. The factor is the image divided by the original: 12 ÷ 3."]],
      "12 ÷ 3 = 4, and 16 ÷ 4 = 4 agrees.")
  },
  recap: {
    body: "Three rigid motions and one that resizes.",
    takeaways: [
      "A dilation from the origin is (x, y) → (kx, ky) — every distance from the centre times k.",
      "k > 1 enlarges, 0 < k < 1 shrinks, and the angles never change either way.",
      "Rigid motions give congruent images; dilations give similar ones."
    ],
    teaser: "Next chapter: congruence and similarity as sequences of these transformations."
  }
});

/* ==================================================== patch */

const patch = {
  label: "S203E geometry — constructing triangles from conditions (7.G.A.2), transformations in coordinates (8.G.A.3)",
  totalLessons: 6,
  chapterInsertions: [
    {
      courseSlug: "geometry-g7",
      chapter: {
        id: "ch3b-drawing-triangles-from-conditions",
        title: "Drawing Triangles from Conditions",
        lessonIds: ["g7-03b-01", "g7-03b-02", "g7-03b-03"]
      },
      position: { after: "ch3-angle-equations" },
      lessons: [g703b01, g703b02, g703b03],
      seamEdit: {
        lessonId: "g7-03-03",
        field: "recap.teaser",
        expect: null,   // filled in below from the live tree
        newValue: "next chapter: building triangles from given conditions — and finding out when the conditions leave a choice."
      }
    },
    {
      courseSlug: "transformations-measurement",
      chapter: {
        id: "ch1b-transformations-in-coordinates",
        title: "Transformations in Coordinates",
        lessonIds: ["tm-01b-01", "tm-01b-02", "tm-01b-03"]
      },
      position: { after: "ch1-rigid-transformations" },
      lessons: [tm01b01, tm01b02, tm01b03],
      seamEdit: {
        lessonId: "tm-01-03",
        field: "recap.teaser",
        expect: null,
        newValue: "next chapter: writing each of these motions as a rule on the coordinates themselves."
      }
    }
  ]
};

/* The ingest requires the seam edit to declare the exact pre-edit value, so read it from disk
 * rather than guessing — a mismatch is a refusal, which is the point of the check. */
import { readFileSync } from "node:fs";
for (const ci of patch.chapterInsertions) {
  const p = join(root, "content/courses", ci.courseSlug, "lessons", `${ci.seamEdit.lessonId}.json`);
  const recap = JSON.parse(readFileSync(p, "utf8")).steps.find((s) => s.kind === "recap");
  ci.seamEdit.expect = recap.teaser;
}

mkdirSync(join(root, "content/patches"), { recursive: true });
const out = join(root, "content/patches/s203e-geometry.json");
writeFileSync(out, JSON.stringify(patch, null, 2) + "\n");
console.log(`wrote ${out}: ${patch.chapterInsertions.reduce((t, c) => t + c.lessons.length, 0)} lessons`);
for (const ci of patch.chapterInsertions) console.log(`  seam ${ci.seamEdit.lessonId}: expect ${JSON.stringify(ci.seamEdit.expect)}`);
