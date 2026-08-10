# Session 127 adversarial mutation matrix

This matrix defines the defects the new browser harness must reject. It is a test-design artifact,
not a claim that destructive mutations were committed to the working tree.

| mutation | expected detector | invariant protected |
|---|---|---|
| Let Enter bypass an unresolved prediction | `player-state.spec.ts` — prediction commitment test | prediction-before-manipulation |
| Render the manipulative before prediction commitment | prediction commitment test | outcome cannot leak before commitment |
| Clear learner input on the first miss | retry-preservation test | learner work survives retry |
| Omit learner-versus-answer contrast after the second miss | reveal-contrast assertions | revealed state teaches from the actual error |
| Remove or delay-disable the rapid-advance latch | rapid double-Enter assertion | one keypress causes at most one legal transition |
| Restore the wrong step or XP from local storage | durable-resume test | exact mid-lesson resume |
| Leave the durable snapshot after Start over | start-over/reload assertions | explicit reset is durable |
| Make completion a dead end or ignore Enter | completion-route test | completion has a purposeful next route |
| Move the first keyboard focus away from Exit lesson | focus-order test | predictable keyboard navigation |
| Suppress the focus ring or reduce it below 3px | computed-outline assertion | visible keyboard focus |
| Animate from an incorrect hidden/transformed first frame under reduced motion | reduced-motion computed-style test | base render equals correct final state |
| Shrink an actionable control below 44px | six-project target geometry test | touch target contract |
| Introduce document-level horizontal scroll | six-project overflow assertion | 360px-to-desktop responsive contract |
| Convert the feedback footer to an occluding fixed overlay | retry geometry and input-center assertions | feedback cannot cover learner work/action |
| Let long misconception text hide the action in short landscape | XL-text long-feedback test | feedback remains scroll-contained and actionable |
| Multiply the legacy route/theme suite across every viewport project | static harness contract | browser budget stays deliberate and reproducible |
| Focus, skip, or `fixme` a load-bearing browser test | static harness contract | no silent weakening of the release gate |

## Acceptance rule

A Session 127 browser claim is valid only when the test executes against a production build and the
mutation named above would cause a deterministic failure. Static contract checks prove the tests,
projects, hooks, and assertions exist; they do not substitute for the blocked production-browser run.
