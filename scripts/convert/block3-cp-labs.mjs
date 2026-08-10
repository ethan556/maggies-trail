// Conversion Playbook Block 3 — the classical-construction labs, authored under explicit mandate.
//
// WHY THIS SCRIPT EXISTS. Session 116 shipped five new `compassConstruct` modes (angleBisector,
// perpAtPoint, perpFromPoint, parallelThroughPoint, copyAngle) and then found that NO lesson could
// take them: the four cp- lessons that teach these exact constructions carry `steppedReveal`
// widgets whose `panels` hold three stages of authored instructional prose each, and replacing a
// widget would delete that text. The modes shipped tested and gate-covered but unused. That gap
// was recorded in KNOWN_ISSUES and left for an explicit content mandate, which has now been given.
//
// WHAT IT DOES — and equally, what it refuses to do. It does NOT rewrite or replace one word of
// authored content. Each lesson gains ONE new `interactive` step, inserted directly AFTER the
// stepped reveal that explains the construction, so the sequence becomes: read the stages → then
// perform it yourself → then the existing checks. Every pre-existing step keeps its id, kind,
// body, widget, order, conceptTag and variant tag untouched; the script asserts that byte-for-byte
// before writing.
//
// STEP IDS follow the established insertion convention (`k1b` appears in nine shipped lessons):
// a lab inserted after `i1` is `i1b`, after `i2` is `i2b`. No existing id is renumbered.
//
// TASK DESIGN. Every lab asks for the SMALLEST WHOLE RADIUS that makes the arcs reach, which is
// the same task cp-01-01's shipped perpBisector lab uses, and it is verifiable rather than
// decorative: each classical mode's `needs` predicate is 2r > span, so the answer is forced by the
// geometry and was confirmed computationally per lesson before authoring (span 6 → 4, span 8 → 5,
// span 10 → 6; every `start` confirmed NOT pre-solved). The `successFeedback` then does the real
// teaching: it names WHICH equidistance the crossings guarantee, which is the fact the mode's
// status line already carries and the fact the authored prose explains in words.
//
// conceptTag reuses each lesson's OWN existing tag — every one already has a matching remedial
// (cp-angle-bisector, cp-perp-at-point, cp-perp-from-point, cp-parallel-through-point,
// cp-tool-rules), so no new remedial mapping is invented.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/constructions-and-proof/lessons";

const PLAN = {
  // ---- angleBisector ---------------------------------------------------------------------------
  "cp-01-03": {
    after: "i1",
    newId: "i1b",
    conceptTag: "cp-angle-bisector",
    body: "Now swing the arcs yourself.",
    predict: {
      prompt:
        "You will swing equal arcs from D and from E, the two points the first arc cut on the arms. If you open the compass WIDER, does the bisecting ray change direction?",
      options: [
        { id: "same", label: "No — a wider opening moves the crossing further out, but along the same ray" },
        { id: "wider", label: "Yes — a wider opening tilts the ray toward the wider arm" },
        { id: "fails", label: "Yes — too wide and the ray stops bisecting at all" },
      ],
      outcomeId: "same",
      reveal:
        "The ray does not move. Every crossing of two EQUAL arcs from D and E is equidistant from both, and all such points lie on the one ray that splits the angle. Widening only slides the crossing further along a ray that was already fixed.",
    },
    widget: {
      type: "compassConstruct",
      mode: "angleBisector",
      span: 6,
      target: 4,
      start: 2,
      prompt:
        "The arms are marked 6 apart. Open the compass until the two arcs actually cross — find the smallest whole radius that does it.",
      successFeedback:
        "Radius 4 — the first whole opening that clears half of 6. Both crossings sit the same distance from EACH ARM, so the ray through them splits the angle exactly in half. Widen it further and watch the crossing slide outward while the ray itself refuses to move.",
      lowFeedback:
        "The arcs cannot reach each other yet. Each reaches only its own radius from its own mark, so together they must span more than the 6 between them — the radius has to clear 3.",
      highFeedback:
        "They do cross, but you were asked for the SMALLEST whole radius that reaches. Come back down until they are just about to come apart.",
    },
  },

  // ---- perpAtPoint -----------------------------------------------------------------------------
  "cp-02-01": {
    after: "i1",
    newId: "i1b",
    conceptTag: "cp-perp-at-point",
    body: "Raise it yourself.",
    predict: {
      prompt:
        "P sits ON the line, with two marks stepped off equally either side of it. Where must the crossings of two equal arcs from those marks lie?",
      options: [
        { id: "above", label: "Directly above and below P — nowhere else is equidistant from both marks" },
        { id: "nearer", label: "Nearer whichever mark the compass was opened from first" },
        { id: "anywhere", label: "Anywhere the arcs happen to meet; the position is not fixed" },
      ],
      outcomeId: "above",
      reveal:
        "Directly above and below P. Equal arcs from two marks meet only on the perpendicular bisector of the segment joining them — and because the marks were stepped off equally from P, that bisector passes through P itself.",
    },
    widget: {
      type: "compassConstruct",
      mode: "perpAtPoint",
      span: 8,
      target: 5,
      start: 2,
      prompt:
        "The two marks either side of P are 8 apart. Open the compass until the arcs from them cross — find the smallest whole radius that does it.",
      successFeedback:
        "Radius 5 — the first whole opening that clears half of 8. The two marks are equal distances from P, so P is the MIDPOINT between them; the crossings are equidistant from both marks, which is the perpendicular bisector of that segment. A perpendicular bisector meets the segment square, at its midpoint — and its midpoint is P.",
      lowFeedback:
        "The arcs from the two marks do not yet cross. Together they must span more than the 8 between them — the radius has to clear 4.",
      highFeedback:
        "They do cross, but you were asked for the SMALLEST whole radius that reaches. Ease back down until they are just about to come apart.",
    },
  },

  // ---- perpFromPoint ---------------------------------------------------------------------------
  "cp-02-02": {
    after: "i1",
    newId: "i1b",
    conceptTag: "cp-perp-from-point",
    body: "Drop it yourself.",
    predict: {
      prompt:
        "The first arc from external point P cuts the line at two places. What is already guaranteed about P, before any further arcs are drawn?",
      options: [
        { id: "equidistant", label: "P is equidistant from both cuts — so P is on their perpendicular bisector" },
        { id: "nearest", label: "One of the two cuts is the nearest point on the line to P" },
        { id: "nothing", label: "Nothing yet — the cuts are only scaffolding for the next step" },
      ],
      outcomeId: "equidistant",
      reveal:
        "P is equidistant from both cuts, because both are one arc-radius from P. That places P on the perpendicular bisector of the segment between them — and that bisector IS the perpendicular you are dropping. The rest of the construction only finds a second point on a line P was already on.",
    },
    widget: {
      type: "compassConstruct",
      mode: "perpFromPoint",
      span: 6,
      target: 4,
      start: 2,
      prompt:
        "The arc from P cut the line 6 apart. Open the compass until arcs from those two cuts meet below the line — the smallest whole radius that does it.",
      successFeedback:
        "Radius 4 — the first whole opening that clears half of 6. The foot is equidistant from the two cuts the first arc made, so the drop meets the line square. Notice you never measured an angle: the right angle is a consequence of equal distances, not something you set.",
      lowFeedback:
        "The arcs from the two cuts do not reach each other yet. Together they must span more than the 6 between them — the radius has to clear 3.",
      highFeedback:
        "They do meet, but you were asked for the SMALLEST whole radius that reaches. Come back down until they are just about to come apart.",
    },
  },

  // ---- parallelThroughPoint --------------------------------------------------------------------
  "cp-02-03": {
    after: "i1",
    newId: "i1b",
    conceptTag: "cp-parallel-through-point",
    body: "Carry the angle yourself.",
    predict: {
      prompt:
        "The construction copies the angle the transversal makes with the given line, up to P. Does the compass ever measure how FAR P is from the line?",
      options: [
        { id: "never", label: "Never — it only carries an angle, and equal corresponding angles are enough" },
        { id: "distance", label: "Yes — it must set the same distance, or the lines would converge" },
        { id: "both", label: "Yes — it needs both the angle and the distance to guarantee parallel" },
      ],
      outcomeId: "never",
      reveal:
        "Never. Distance never enters the construction. Equal corresponding angles at a transversal is exactly the condition for two lines to be parallel — so carrying the angle alone is a proof, and the separation between the lines is simply whatever P made it.",
    },
    widget: {
      type: "compassConstruct",
      mode: "parallelThroughPoint",
      span: 10,
      target: 6,
      start: 3,
      prompt:
        "The arc has to span the 10 between the arms of the angle being copied. Open the compass until it reaches — the smallest whole radius that does it.",
      successFeedback:
        "Radius 6 — the first whole opening that clears half of 10. The copied angle is equal, and equal corresponding angles force the two lines never to meet. The compass carried an ANGLE, not a distance, and that alone settles parallelism.",
      lowFeedback:
        "The copied arc is too small to mark the matching angle. It must span more than the 10 between the arms — the radius has to clear 5.",
      highFeedback:
        "The angle still copies exactly, but you were asked for the SMALLEST whole radius that reaches. Ease back down.",
    },
  },

  // ---- copyAngle -------------------------------------------------------------------------------
  // Placed in cp-01-01, the lesson about what the classical TOOLS guarantee — it already carries a
  // "copy a segment" stepped reveal at i2, and copying an angle is the same promise one dimension
  // up. Uses that lesson's own `cp-tool-rules` tag, which is precisely about what the tools
  // guarantee, rather than its segment-specific `cp-copy-segment`.
  "cp-01-01": {
    after: "i2",
    newId: "i2b",
    conceptTag: "cp-tool-rules",
    body: "A segment, then an angle.",
    predict: {
      prompt:
        "A compass can copy a segment without a ruler. Can it copy an ANGLE without a protractor?",
      options: [
        { id: "yes", label: "Yes — an equal arc cuts an equal chord, and equal chords carry the angle" },
        { id: "no", label: "No — angles need a protractor; the compass only transfers lengths" },
        { id: "approx", label: "Only approximately — the copy is close but never exact" },
      ],
      outcomeId: "yes",
      reveal:
        "Yes, and exactly. Swing the same radius on both angles and it cuts a chord on each; make those chords equal and the angles must be equal, because equal chords on equal circles subtend equal angles. The compass transfers a length, and the length does the angle's work.",
    },
    widget: {
      type: "compassConstruct",
      mode: "copyAngle",
      span: 6,
      target: 4,
      start: 2,
      prompt:
        "The chord to carry across spans 6. Open the compass until it reaches — the smallest whole radius that does it.",
      successFeedback:
        "Radius 4 — the first whole opening that clears half of 6. The same two radii cut the same chord on both angles, and equal chords on equal circles subtend equal angles. The copy is exact, and no protractor was involved at any point.",
      lowFeedback:
        "The chord is not yet wide enough to carry across. The arc must span more than the 6 between the arms — the radius has to clear 3.",
      highFeedback:
        "The chord still transfers, but you were asked for the SMALLEST whole radius that reaches. Come back down.",
    },
  },
};

// ---- validate everything BEFORE writing anything ------------------------------------------------
const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const staged = [];
const skipped = [];
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const doc = JSON.parse(readFileSync(path, "utf8"));

  if (doc.steps.some((s) => s.id === plan.newId)) {
    skipped.push(lesson);
    continue;
  }
  const at = doc.steps.findIndex((s) => s.id === plan.after);
  if (at < 0) throw new Error(`${lesson}: anchor step ${plan.after} not found`);
  if (doc.steps[at].widget?.type !== "steppedReveal")
    throw new Error(`${lesson}/${plan.after}: expected a steppedReveal to insert after, found ${doc.steps[at].widget?.type}`);
  // The tag must already have a remedial in THIS lesson — no invented mappings.
  if (!(doc.remedials ?? []).some((r) => r.conceptTag === plan.conceptTag))
    throw new Error(`${lesson}: conceptTag ${plan.conceptTag} has no remedial in this lesson`);

  const parsed = WidgetSpec.parse(plan.widget);
  const errs = widgetIntegrityErrors(parsed);
  if (errs.length) throw new Error(`${lesson}: integrity — ${errs.join("; ")}`);

  // Snapshot every existing step so the insert can be proven non-destructive.
  const before = JSON.stringify(doc.steps);

  const step = {
    id: plan.newId,
    kind: "interactive",
    body: plan.body,
    conceptTag: plan.conceptTag,
    widget: plan.widget,
    predict: plan.predict,
  };
  doc.steps.splice(at + 1, 0, step);

  const afterWithoutNew = JSON.stringify(doc.steps.filter((s) => s.id !== plan.newId));
  if (afterWithoutNew !== before)
    throw new Error(`${lesson}: an EXISTING step changed — aborting`);

  staged.push([path, doc, lesson, plan]);
}

for (const [path, doc, lesson, plan] of staged) {
  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  console.log(`${lesson}: +${plan.newId} (${plan.widget.mode}) after ${plan.after}`);
}
if (skipped.length) console.log(`already present, skipped: ${skipped.join(", ")}`);
console.log(`\n${staged.length} labs added, ${skipped.length} already there (of ${Object.keys(PLAN).length})`);
if (staged.length + skipped.length !== Object.keys(PLAN).length) throw new Error("unexpected count");
