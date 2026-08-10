// S117 — tg-02-03, the S115 residue, closed under explicit content mandate.
//
// S115 built a ghost lab for this lesson and withdrew it for one reason only: i1 was the lesson's
// sole notation-entry step, so converting it dropped formalization below the acceptance bar. The
// mandated fix is a content ADDITION, and it is done the preserving way: the authored numeric
// widget moves BYTE-IDENTICALLY onto a new step `i1b` directly after the lab, so every authored
// word (prompt, answers, both misconception feedbacks, fallback) survives, and notation entry now
// FOLLOWS manipulation -- which is the ordering the tier formula rewards and the pedagogy wants.
// The only new authored content is i1b's one-line body and the predict, both ledgered.
//
// The ghost kind is re-derived rather than inherited from S115. The lesson is the HALF-PERIOD
// slide -- sin(x + \u03c0) = \u2212sin x AND cos(x + \u03c0) = \u2212cos x: both coordinates flip,
// because the point at \u03b8 + 180\u00b0 is the antipode. That is `ghost: "sum"` with
// ghostAngle 180 (direct point at \u03b8 + 180; exact ghost [\u2212cos, \u2212sin]), NOT S115's
// `negate` (direct at \u2212\u03b8; only sine flips) -- a different identity than the lesson teaches.
// Verified against ucGhostPoint's own arithmetic: exact = [c\u00b7cos180 \u2212 s\u00b7sin180,
// s\u00b7cos180 + c\u00b7sin180] = [\u2212c, \u2212s] = the antipode, coinciding for every \u03b8;
// the linearity impostor [c \u2212 1, s] never coincides (\u2212c = c \u2212 1 forces c = 1/2 while
// \u2212s = s forces s = 0 -- inconsistent on the circle).
//
// targetAngle 90 on purpose: the direct point lands at 270\u00b0 = 3\u03c0/2, the very angle the
// moved numeric step then formalizes -- sin(3\u03c0/2) = \u22121 = \u2212sin(\u03c0/2).

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "content/courses/trig-graphs-inverses/lessons/tg-02-03.json";

const predict = {
  prompt:
    "Slide x forward by HALF a period \u2014 add \u03c0. What happens to the point's two coordinates, cos and sin?",
  options: [
    { id: "both", label: "Both flip sign \u2014 the point jumps to the far side of the circle" },
    { id: "sine", label: "Only sine flips \u2014 cosine is even, it never changes" },
    { id: "neither", label: "Neither \u2014 a slide moves the wave, not its values" },
  ],
  outcomeId: "both",
  reveal:
    "Adding \u03c0 sends the point to its antipode, straight through the center \u2014 so BOTH coordinates flip: sin(x + \u03c0) = \u2212sin x and cos(x + \u03c0) = \u2212cos x. (\u201cOnly sine flips\u201d is a different identity: that one belongs to \u2212x, not to x + \u03c0.)",
};

const labWidget = {
  type: "unitCircleExplore",
  prompt:
    "The tracked point sits at x + 180\u00b0. Pick the formula that computes it from cos x and sin x without ever letting go, then land x on 90\u00b0 \u2014 where the flip becomes sin(3\u03c0/2).",
  targetAngle: 90,
  angleStart: 30,
  angleStep: 5,
  ghost: "sum",
  ghostAngle: 180,
  showGhostCoords: true,
  ghostChoices: [
    {
      id: "exact",
      label: "(\u2212cos x, \u2212sin x) \u2014 flip BOTH coordinates",
    },
    {
      id: "linearity",
      label: "(cos x + cos 180\u00b0, sin x + sin 180\u00b0) \u2014 add the half-turn to each coordinate",
      feedback:
        "Watch the readout: this point slides to (cos x \u2212 1, sin x) and leaves the circle \u2014 coordinates do not add under a rotation. The half-turn acts on the ANGLE, and through the angle it flips both coordinates at once.",
    },
  ],
  successFeedback:
    "Glued at every x \u2014 the point at x + 180\u00b0 is the antipode, so both coordinates flip together. At x = 90\u00b0 that reads sin(3\u03c0/2) = \u2212sin(\u03c0/2) = \u22121, the very number the next step asks you to write down. One wave, two names, half a period apart.",
  lowFeedback: "Formula's right \u2014 keep dragging to 90\u00b0, where the flip becomes the value the lesson opened with.",
  highFeedback: "Past 90\u00b0 \u2014 ease back to the angle whose half-period partner is 3\u03c0/2.",
};

const { WidgetSpec, widgetIntegrityErrors } = await import("../../src/lib/schema.ts");

const doc = JSON.parse(readFileSync(PATH, "utf8"));
if (doc.steps.some((s) => s.id === "i1b")) {
  console.log("tg-02-03: i1b already present \u2014 nothing to do");
  process.exit(0);
}
const i1 = doc.steps.find((s) => s.id === "i1");
if (!i1) throw new Error("i1 not found");
if (i1.widget?.type !== "numeric") throw new Error(`expected numeric at i1, found ${i1.widget?.type}`);
if (i1.variant) throw new Error("i1 carries a variant tag");
if (i1.predict) throw new Error("i1 already has a predict");

const errs = widgetIntegrityErrors(WidgetSpec.parse(labWidget));
if (errs.length) throw new Error(`integrity \u2014 ${errs.join("; ")}`);

// The authored numeric widget moves byte-identically onto i1b.
const movedNumeric = i1.widget;
const movedJson = JSON.stringify(movedNumeric);

const bodyBefore = i1.body;
const newI1 = {};
for (const k of Object.keys(i1)) {
  if (k === "widget") { newI1.predict = predict; newI1.widget = labWidget; continue; }
  newI1[k] = i1[k];
}
if (newI1.body !== bodyBefore) throw new Error("i1 body changed");

const i1b = {
  id: "i1b",
  kind: "interactive",
  body: "Now write the flip down.",
  widget: movedNumeric,
};
if (JSON.stringify(i1b.widget) !== movedJson) throw new Error("moved numeric changed");

const idx = doc.steps.findIndex((s) => s.id === "i1");
doc.steps.splice(idx, 1, newI1, i1b);

// Post-write re-assert: the numeric widget in the rebuilt lesson is byte-identical to the original.
const check = doc.steps.find((s) => s.id === "i1b");
if (JSON.stringify(check.widget) !== movedJson) throw new Error("post-splice numeric mismatch");

writeFileSync(PATH, JSON.stringify(doc, null, 2), "utf8");
console.log(
  "tg-02-03: i1 numeric -> unitCircleExplore ghost(sum\u00b7180) (+predict); authored numeric moved verbatim to new i1b"
);
