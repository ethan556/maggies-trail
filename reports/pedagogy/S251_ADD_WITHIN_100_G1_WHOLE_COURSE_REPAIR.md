# S251 Add Within 100 G1 whole-course repair

## Scope and result

- Course: `add-within-100-g1`.
- Lessons: 14/14.
- Pre-repair queue: 84 rows.
- Source-derived P0 closures after visual and queue regeneration: 42.
  - `ILLUSTRATION_REPLACEMENT`: 28 to 0.
  - `LESSON_PROGRESSION_AND_DUPLICATION`: 14 to 0.
- Authoritative global queue: **6,654 to 6,584** (70 net closures: 42 source rows + 42 generic reviews - 14 preserved revision rows).
- The separately authored, current-hash review records close the 42 generic review rows and retain 14 bounded revision-implementation rows; the implementation itself does not self-close those dimensions.
- Course source seal: `a72efedda04302d80665a7c2d9991d35978ae5ceb06d544fcbf8330870929deb`.

## Root-cause repair

All 28 concept placements previously referenced the fixed-example `count-on-hops` figure even when the lesson promised regrouping, a hundred chart, place value, a story bar, or strategy choice. They now use 20 registered semantic figures. Each lesson's two concepts use different figures, aligned body text and narration, and an accessible SVG title.

All 14 second interactions were byte-identical copies of the first. They are now selection tasks with new quantities and a different learner action. The checks and challenges were also rewritten so every same-sitting exact and number-normalized prompt is unique.

The audit also found malformed generated numeric success strings such as a question immediately followed by its answer. Every main and remedial numeric response now receives a complete truthful success sentence and an operation-appropriate retry scaffold.

## Guardrails

- `scripts/audit/repair-add-within-100-g1-s251.mjs` is deterministic and idempotent.
- `src/lib/session251.addWithin100G1CourseIntegrity.test.tsx` validates schema, pedagogy, widget integrity, figure registration/rendering/accessibility, prompt diversity, evaluator truth, and feedback readability.
- Evaluator answers and correct MCQ markers remain unchanged.
- No new renderer, schema, grading engine, or figure implementation was required.

## Remaining bounded debt

The remedial pair in each lesson remains same-family immediate practice. The lesson-disposition packet therefore uses `REVISE / SUFFICIENT / FIT`: the review streams may close, while one explicit revision-implementation row remains for each lesson.
