# S246 Common Core standards-decision canary: `add-subtract-10-k` Chapter 1

Date: 2026-08-17  
Scope: `ch1-putting-together` only (`koa-01-01` through `koa-01-05`)  
Framework: Common Core State Standards for Mathematics  
Verdict: **PARTIAL EVIDENCE; NO VALID LEDGER DECISION CAN BE RECORDED**

## Authority and exact benchmark snapshots

The repository source registry identifies the Common Core State Standards Initiative as the
authority and the 2010 standards as the canonical spine. The review used the authority's current
[mathematics standards landing page](https://corestandards.org/mathematics-standards/), its
[accessible standards PDF](https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-Math-Standards.pdf)
(Kindergarten, page 11), and the authority's standard-specific pages below.

- [K.OA.A.1](https://www.thecorestandards.org/Math/Content/K/OA/A/1/):
  “Represent addition and subtraction with objects, fingers, mental images, drawings, sounds (e.g.,
  claps), acting out situations, verbal explanations, expressions, or equations.”
- [K.OA.A.2](https://www.thecorestandards.org/Math/Content/K/OA/A/2/):
  “Solve addition and subtraction word problems, and add and subtract within 10, e.g., by using
  objects or drawings to represent the problem.”

The PDF's drawing footnote was also applied: a drawing may omit surface detail, but it must still
show the mathematics of the problem. The snapshots above are each below 25 words from their
respective standard-specific authority page.

## Repository contract observed before review

- `content/standards/course-crosswalk.json` has no entry for `add-subtract-10-k`.
- `content/standards/lesson-evidence-map.json` has no row for any of the five scoped lessons.
- `content/standards/evidence-dossiers.json` has zero dossiers whose lesson evidence includes a
  scoped lesson.
- The five current lesson-review cards therefore report `NO_CANDIDATE_DOSSIER` and
  `MISSING_CANDIDATE_EVIDENCE`.
- `content/standards/human-review-decisions.json` is keyed by an existing dossier `edgeId` and
  currently contains no decisions.
- `scripts/review-standards-evidence.mjs` accepts only `approve` or `reject`; it has no valid
  `partial` state. The downstream lesson-card validator likewise counts only signed dossier-bound
  approvals and rejections.

## Full-intent evidence review

| Lesson | Learner evidence in the lesson | K.OA.A.1 | K.OA.A.2 |
|---|---|---|---|
| `koa-01-01` Putting Groups Together | Combines two positive groups with a ten-frame, then independently solves result-unknown joining problems. | Partial: addition with objects/diagram and symbols; no subtraction. | Partial: addition problems within 10; no subtraction. |
| `koa-01-02` Adding with Fingers | Represents and evaluates addition with fingers and a ten-frame. | Partial: the named finger representation is directly present for addition; no subtraction. | Partial: adds within 10, but the assessed job is not a varied addition-and-subtraction word-problem set. |
| `koa-01-03` Adding with Drawings | Models addition using circles and a ten-frame, then answers independently. | Partial: drawing-based addition is present; no subtraction. | Partial: addition within 10 is represented visually; no subtraction. |
| `koa-01-04` Acting Out a Sum | Models “more join” stories using hops and independently solves the resulting totals. | Partial: acting-out/add-to evidence is present for addition; no subtraction. | Partial: addition word problems within 10 are present; no subtraction. |
| `koa-01-05` Writing an Addition Sentence | Translates joining stories and visual models into addition expressions/equations. | Partial: expression/equation representation is present for addition; no subtraction. | Partial: addition word problems within 10 are present; no subtraction. |

All authored assessed totals in the chapter are at most 9. The chapter therefore respects the
numeric ceiling in K.OA.A.2. Across the family it deliberately varies objects, fingers, drawings,
acting out, verbal story contexts, and expressions/equations. It also includes construction,
independent checks, and challenge surfaces. Those are strong evidence for the **addition strand** of
K.OA.A.1 and K.OA.A.2.

They are not full-intent evidence for either standard because both official expectations explicitly
include subtraction. Chapter 1 contains no subtraction model, subtraction word problem, or
independent subtraction assessment. Evidence from Chapters 2 or 3 was not imported because this
canary is deliberately bounded to Chapter 1.

K.OA.A.3 and K.OA.A.4 were not claimed: the chapter does not systematically assess multiple
decompositions of the same number or complements to 10. K.OA.A.5 was not claimed: the assessed
totals extend beyond 5 and the chapter does not establish fluent addition **and subtraction** within
5.

## Disposition

| Candidate standard | Evidence classification | Ledger disposition |
|---|---|---|
| K.OA.A.1 | `PARTIAL — addition representations only` | None; no dossier edge exists and `partial` is unsupported. |
| K.OA.A.2 | `PARTIAL — addition problems within 10 only` | None; no dossier edge exists and `partial` is unsupported. |
| K.OA.A.3–5 | `NOT CANDIDATE FOR THIS CHAPTER` | None. |

No edge is approved. No edge is rejected. Treating the absence of a generated edge as a rejection
would conflate “not mapped” with “reviewed and disproven”; treating partial evidence as approval
would overclaim full intent.

## Required process repair before this family can close

1. Add a source-controlled, generator-safe mapping for the new `add-subtract-10-k` course and its
   five Chapter 1 concept tags; do not hand-edit a generated dossier that the next infrastructure
   rebuild will erase.
2. Give the standards decision schema an explicit partial/limited-depth disposition, or define a
   validated narrower edge such as the addition strand whose claim wording cannot be mistaken for
   full K.OA.A.1/K.OA.A.2 alignment.
3. Rebuild the candidate objectives, lesson evidence map, crosswalk and dossiers atomically, then
   sign decisions only against those dossier hashes.
4. Keep full K.OA.A.1/K.OA.A.2 approval open until the evidence boundary includes subtraction and
   the combined evidence is independently reviewed.

## Canary accounting

- Lessons reviewed: **5**.
- Existing candidate dossiers in scope: **0**.
- Existing standards edges closed: **0**.
- Existing standards edges still open in scope: **0**.
- Missing lesson-to-standards mappings still open: **5**.
- New human decisions written: **0**.
- Full-intent approvals: **0**.
- Rejections: **0**.
- Evidence classifications recorded in this report: **2 partial standard-level findings**.

This canary does not change lesson content, the global queue, review cards, cache, standards source
registry, generated dossiers, mastery artifacts, or any other framework.
