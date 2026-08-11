# S236 learner-screen focus audit

## Audit scope

Quadratic lesson `qu-01-01`, interactive step `i1`, from prediction through an incorrect check and retry. The supplied 390 px screenshot is retained as the source-state evidence; the current local production build was checked through the same lesson and state transition.

## User goal and accessibility target

The learner should see the mathematical prompt, the model, direct controls, a concise diagnosis, and the next action. Optional nonvisual model description remains available, but curriculum-authoring metadata and process telemetry must not compete with the maths.

## Step health

1. **Supplied retry screen — Unhealthy.** The mathematical model was followed by lifecycle badges, an action-goal card, representation metadata, internal invariants, revision telemetry, transfer labels, and reflection prompts before the actual retry feedback. The visual hierarchy made an incorrect answer feel like a dashboard rather than a mathematical revision.
2. **Current active model — Healthy.** The learner sees the short task framing, prediction reminder, equation, graph, sliders, and the optional `Describe this model` accessibility disclosure. No mastery, authoring, transfer, invariant, or telemetry labels render.
3. **Current retry feedback — Healthy.** One specific mathematical diagnosis and `Try again` remain visible beside the model. The active/retry flow has no CML panel. Undo/Reset appear only after a real model change; the richer graph/equation comparison is deferred until a saved checkpoint.

## Highest-impact changes

- Removed the expanded mastery/authoring surface from active and retry states.
- Reduced the post-checkpoint disclosure to equivalent mathematical forms only.
- Replaced technical accessibility-panel labels with learner-facing copy: `Describe this model`, `How to change it`, and `Previous model`.
- Preserved 44 px controls, keyboard-operable sliders, clear focus behavior, and state-specific retry feedback.

## Evidence

- `PREMIUM_REBUILD_SCREENSHOTS_S236/01-before-busy-retry.png`
- `PREMIUM_REBUILD_SCREENSHOTS_S236/02-after-mathematics-first-stage.png`
- `PREMIUM_REBUILD_SCREENSHOTS_S236/03-after-focused-retry-feedback.png`

## Evidence limits

The accepted current-build captures use the available in-app desktop viewport; the supplied source capture is a 390 px mobile viewport. DOM inspection confirms the disclosure and metadata boundary, and focused component tests cover the learner-facing copy and hidden metadata. This bounded audit does not claim full WCAG, physical touch-device, screen-reader, or 200% zoom certification; those remain explicit manual queue items.
