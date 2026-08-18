# S246 Derivatives in Context triple-disposition assessment

Status: **PASS — candidate evidence only**

Scope is the complete 11-lesson `derivatives-in-context` course. Every live lesson and remedial path, course metadata, current S244 review card, runtime figure placement, and scoped queue finding was independently reviewed across the V4 whole-lesson, visual-first, and Grade 13 language dimensions. Prior interaction classifications and recent generator work were not treated as whole-lesson approval.

This packet changes no lesson, generator, shared decision ledger, queue, review card, cache, figure, or shared script.

## Decision summary

- Whole lesson: **0 KEEP**, **11 REVISE**, 0 ESCALATE.
- Visual-first: **7 REQUIRED**, **2 PREFERRED**, **2 SUFFICIENT**, 0 ESCALATE.
- Grade-language: **7 FIT**, **4 REVISE**, 0 ESCALATE.
- Expected generic review rows after root validation and authoritative ledger integration: **33** — 11 each in `LESSON_COMPLETE_DISPOSITION`, `VISUAL_FIRST_REPRESENTATION`, and `GRADE_LANGUAGE_REVIEW`.
- A `REVISE` disposition closes the generic decision row but records implementation debt; it does not claim that any lesson repair is complete.

## Current-hash manifest

| Lesson | Review basis hash | Lesson | Visual | Language |
|---|---|---|---|---|
| dc-01-01 | `969184d44c2083d695f78cf478006a10b2c132eb741085fe57801a334acb9bb4` | REVISE | SUFFICIENT | FIT |
| dc-01-02 | `9509954293fc5fd144e473aedc03e1a5d8e0994b0e96f3205e0f25279d5905a1` | REVISE | REQUIRED | FIT |
| dc-01-03 | `ac211839c574ea22e27e01cb18265946cb64630f10d63d09b97321909b183be3` | REVISE | REQUIRED | FIT |
| dc-02-01 | `a2846ab42dfb89e68dc6d3a873231b5b768b83b0df25aac860cda98e59d9ce54` | REVISE | REQUIRED | FIT |
| dc-02-02 | `ee4d51af8a816309a43fd0337917e8dac0ed0a26f3d7d8a912836c6dbafaf1d3` | REVISE | REQUIRED | FIT |
| dc-02-03 | `6a25786c19e508f131b9c02da104657c11d118621dbff1e4916c9dbac279f46a` | REVISE | REQUIRED | REVISE |
| dc-03-01 | `2dae8fade4f44063b94de4ee54684a46290cfdd9527fc1a5db26090798c7cdb9` | REVISE | REQUIRED | FIT |
| dc-03-02 | `a3c052e1a42fe2d09606ed3cbf79d4007adc040dd7059ee4cb242a2f7ced06ea` | REVISE | PREFERRED | FIT |
| dc-03-03 | `62103ca1bc6911cdf9e92e1edf771277b65dea59f88f34d9b14c0218942de1ef` | REVISE | PREFERRED | REVISE |
| dc-04-01 | `2c1665cf304f097947311be2e5062d067679fac06a0168742ff15bdd6dfc3087` | REVISE | SUFFICIENT | REVISE |
| dc-04-02 | `7a9ce66244fa3e4338132ea012a2db6f498bce9f833f0e657eed1856ab8f9cd9` | REVISE | REQUIRED | REVISE |

## Material findings

### Mathematical and feedback blockers

- `dc-02-03` turns useful heuristics into universal rules. Related-rates problems do not always require eliminating to one variable before differentiation, and numbers may be added to a diagram after the variable relationships remain clear; the current absolutes should become conditional guidance.
- `dc-03-03` treats local Taylor behavior as an unconditional error law. The value of `f″` at one point alone does not determine reliability across a wider interval; the lesson needs an interval bound or explicitly local leading-order language.
- `dc-04-01` states L'Hôpital's rule without adequate hypotheses and says that functions vanishing together make their ratio exactly the pointwise derivative ratio. The tangent intuition shown is valid for its chosen nonzero denominator slope, but the prose incorrectly generalizes it to cases where `f′(a)/g′(a)` is itself undefined or the theorem's conditions fail.
- `dc-04-02` compresses all other indeterminate forms into “manufacture a quotient.” Exponential forms require taking logs, resolving the new limit, and exponentiating back; an `∞−∞` expression does not universally become useful merely through a common denominator.
- Seven dynamic MCQ forms remain in the choice-integrity queue (`CHOICE-0408` through `CHOICE-0414`). Their correct choices are materially longer or more explanatory than distractors, so option construction can disclose the answer.

### Required visual repair

- Four authored concept placements are explicitly withheld: `dc-01-02/c1`, `dc-02-01/c1`, `dc-02-02/c1`, and `dc-02-03/c2`.
- `dc-01-03` uses the generic derivative-as-function figure three times but never shows the backtracking path, signed displacement, or the three positive distance legs.
- `dc-03-01/i1` is a continuity/limit `graphZoom` whose prediction and reveal discuss common heights and jumps, not a tangent approximation or its error. Its concavity concept also uses the flat-cubic/no-turning figure instead of paired tangent-error views.
- `dc-04-02` repeats the tangent-ratio figure while teaching product, difference, and exponential-form rewrites. A visible transformation map, with full domain and exponentiation-back steps, is required.
- `dc-03-02` and `dc-03-03` have rendered figures and usable interactions, but dimensional uncertainty and a paired curvature/distance error view are preferred improvements.

### Mathematical presentation and practice repair

- The course has 32 authored math-presentation findings: six in `dc-02-01`, nine in `dc-02-03`, six in `dc-03-02`, three in `dc-04-01`, and eight in `dc-04-02`. These include π, infinity forms, and inequalities in prompts, options, hints, feedback, and recap text that still need structured accessible rendering.
- `dc-04-02` uses `x·ln x` for the rewrite check, the final challenge, and remediation. The sequence changes the requested action but not the mathematical instance; one or more stages should use a distinct product or exponential form.
- The strongest current authored progressions are in `dc-01-01`, `dc-01-02`, `dc-02-01`, and `dc-02-02`: their checks, interactions, and challenges perform distinct jobs. Their `REVISE` decisions are driven by concrete runtime visual, notation, or option-surface blockers rather than question repetition.

## Reproducible validation

Run:

```text
node reports/closure/candidates/validate-s246-derivatives-in-context-triple-dispositions.mjs
```

The validator seals the exact 11 manifest IDs, 11 current card hashes, live lesson and course source hashes, complete lesson/remedial presence, exact contract fields, record IDs, enums, timestamps, evidence files, substantive rationales and reopen conditions, and the exact decision distribution.

Validated candidate SHA-256: `6fd9c57132629cbd28dabe777f38f4b49e7c31776cba00b61fe01f7575c3ed12`.

Authority boundary: these records remain candidates. Only root review, append to `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, and deterministic card/queue/cache regeneration can make the dispositions authoritative.
