# S205J — content-change ledger

**No authored lesson content was altered.** One `insertion`; 16 applier assertions passed.

## ENGINE CHANGE — `relatedRatesLab` gains `framing: "rates" | "slope"` (default `"rates"`)

The S205I near-miss made actionable. The lab's geometry was always the lesson's geometry
(x² + y² = L² IS dr-04-03's x² + y² = 25), and with horizontalRate 1 its readout was already
numerically dy/dx — the refusal was purely that the renderer narrated in dt language a
dy/dx lesson never introduces. `framing: "slope"` swaps exactly the narration: readout label
dy/dt → dy/dx, the caption differentiates implicitly with respect to x, the slider names the
circle instead of a ladder, and describeState + the SVG aria-label narrate slope language so a
screen-reader user hears what the sighted learner reads. **The mathematics is untouched** — same
state, same grading, same coupling. Default `"rates"` leaves every existing lesson byte-identical
(existing lab tests: 207/207 unchanged).

## INSERTION — `dr-04-03` "Implicit Differentiation in Practice" · new step `i1b` · **C → A**

Anchored after the reveal that computes dy/dx = −x/y = −3/4 at (3, 4). The learner slides a point
along x² + y² = 25 to x = 3 and reads the slope off the relation — never writing y as a function
of x, which is the lesson's whole claim. The predict block asks what happens to dy/dx as the point
slides right; the truth (`steeper`) is derived from the same −x/y the grader computes: x grows AND
y shrinks. Verified twice: implicit relation (dy/dx = −x/y = −3/4) and direct geometry
(y = √(25−9) = 4). Feedback numbers are the reveal's own.

## REFUSALS (3) — the dr/dc steppedReveal cluster is now COMPLETE

All 9 dr/dc steppedReveal lessons are dispositioned: **2 converted** (dc-02-01 S205D, dr-04-03
here), **7 refused with source cites** (dc-01-03, dr-03-02, dr-04-02, dc-02-03, and this batch:
dr-03-03 route-choice/represents · dc-03-02 error-arithmetic/represents · dc-04-02
growth-hierarchy/models). The refusal class held to the end: reveals teaching strategy, order, or
asymptotic comparison have no phenomenon engine to land on. Engine gaps recorded: error-propagation
lab, growth-race engine.

## Census

**A 1178 · B 432 · C 90 · D 1** (dr-04-03 C → A). HS rich mix **15.2%**, 357 steps still needed —
see HANDOVER for the measured path analysis; the number is honest, not padded.
