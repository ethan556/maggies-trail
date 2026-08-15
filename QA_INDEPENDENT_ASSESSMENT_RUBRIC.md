# INDEPENDENT ASSESSMENT RUBRIC — QA-01

**Status:** published at seal `8d779dd`, S242 · **Owner:** independent QA lane · **Applies to:**
every packet from Wave 1 onward.

This rubric exists because the user's requirement is that quality assessment happens *outside*
implementation. Everything below is written to be usable by an assessor who did not write the code
and does not have the implementer available to explain it.

---

## 1. The independence rule, and it is not negotiable

**The assessor must not have implemented the packet it certifies.** Not "should not"; must not. An
implementer certifying their own work is not a weaker check, it is a different activity — it
measures whether the work matches the implementer's own model of the problem, which is exactly the
model that produced any defect.

Three corollaries the assessor is expected to enforce against themselves:

- **A packet is not closed by its author's report.** "Tests pass" is a claim about tests.
- **A packet is not closed by one seed, one screenshot, or one source scan.** Each of these has
  produced a false green in this repository's recorded history.
- **The assessor writes findings, not fixes.** If the assessor patches the code, the next assessor
  has to be found from somewhere.

## 2. What blocks closure

| Severity | Definition | Effect |
|---|---|---|
| **P0** | A learner gets a wrong answer, a false statement, an unusable surface, or a data loss | Blocks closure. No exceptions, no waivers. |
| **P1** | A learner gets a confusing, ugly, inaccessible or misleading experience that is still correct | Blocks closure unless explicitly accepted with owner, rationale, evidence and expiry |
| **P2** | Everything else | Recorded, does not block |

An "explicit acceptance" is a row in a waiver file that a gate reads — see `CML_WAIVERS.json` for
the shape. A waiver that no gate enforces is a note, and notes do not expire.

## 3. Evidence is mandatory, and these forms do not count

Every finding and every closure claim carries a link to reproducible evidence: a file path and line,
a seed, a command with its output, a screenshot with its viewport, or a test name.

**Does not count as evidence:**

- "I checked it" — including from the assessor.
- A gate result whose invocation is not shown. `node scripts/cml-lint.mjs --strict` printed
  "0 error(s), 0 warning(s)" for an unknown length of time while scanning zero files, because the
  flag was being consumed as the root path. The command *and* its file count both matter.
- A count copied from a previous document. Counts in this repository have been wrong by
  truncation (the plan's 228 + 21 warning split was read off a 250-row cap), by mutation (a passing
  test deleted 10,409 ledger rows on every run), and by measuring the wrong path (variant coverage
  was measured on declarations while delivery was broken).
- A green suite that does not contain an assertion about the thing being claimed. Ask which test
  would go red.

## 4. The six paths — a lesson family is open until every one passes

```
AUTHORED_PATH          the authored items, as written
GENERATOR_PATH         generated variants at representative and edge seeds
REMEDIAL_PATH          the repair route after a wrong answer
VISUAL_PATH            every drawn state, at 390 / 768 / 1440 and 200% zoom
MATH_PRESENTATION_PATH every learner-visible expression, authored and generated
MASTERY_PATH           the progression that closes the loop
```

## 5. Thresholds

| Measure | Threshold |
|---|---|
| Authored and generated mathematics | 10/10 — correctness is not a scale |
| Authored and generated question quality | ≥ 9/10 |
| Representative generator quality (GQR) | ≥ 9.2/10 |
| Language, and visual reasoning where applicable | ≥ 9/10 |
| GCR, GMR, GCF, GVS, GIS, GDC | 100% |
| Unintended duplicates inside the configured window | 0 |
| Generated developer-language leaks | 0 |
| Learner-visible implementation-form mathematics | 0, except policy-documented teaching examples |
| Known seed-dependent semantic, grading, visual or accessibility defects | 0 |

**On the duplicate threshold specifically:** it presumes an anti-repeat mechanism. At this seal
there is none — `variantForStep` is seeded from step and date with no queue of served variants — so
the assessor must not certify this line against the current architecture. Certify it after GEN-04
lands, and until then record the freshness ceiling instead (`GENERATOR_DUPLICATION_AUDIT.csv`).

## 6. The assessor's standing questions

Asked of every packet, in this order:

1. **What would make this wrong?** Name the failure, then look for it. A review that starts from
   "does this look right" finds what the implementer already checked.
2. **Which gate would have caught this, and did it run?** If no gate would have, that is a finding
   in its own right and it is usually bigger than the defect that prompted it.
3. **What did the packet measure, and what did it claim?** These differ more often than not. The
   variant-coverage claim was true of declarations and false of delivery.
4. **Is any number here inherited?** Re-derive it or mark it inherited. Never re-state it as
   current.
5. **What is the packet silent about?** Silence about a path is not evidence it passes.
6. **If this is a fix, is the class closed or the instance?** A fixed instance with a live class is
   a P1 at best.

## 7. Reporting shape

```
FINDING  <P0|P1|P2>  <area>  <one-sentence defect>
  REPRO     command / seed / path:line / viewport
  OBSERVED  what happened
  EXPECTED  what should have, and what says so
  CLASS     instance | class of N | unknown extent
```

A finding whose extent is unknown says so. "Unknown extent" is a legitimate and useful state; a
guessed count is not.

## 8. What certification does not mean

A certified packet means: the six paths were exercised, the thresholds were met on the evidence
listed, and an assessor who did not write it looked for reasons it was wrong and did not find them.

It does not mean the work is good pedagogy, that a child will learn from it, or that any claim
about outcomes is supported. Those require evidence this program does not yet have, and no amount
of internal certification substitutes for it.
