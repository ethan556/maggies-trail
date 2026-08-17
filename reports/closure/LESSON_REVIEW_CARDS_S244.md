# Maggie's Trail S244 lesson review cards

Deterministic assessor view generated from the live lesson source. No semantic judgment is auto-approved.

- Review-basis seal (lessons plus course/grade metadata): `e6ee9627e59ad20a918b9b5e89504c85d0d274089cfb10055ec74e3dc0ca4e01`
- Queue-compatible lesson-only seal: `b2588d68ce358c3b9b023c78e14d89b5f4b9acf8393696da5fe436960838a4b9`
- Queue freshness: **SOURCE_SEAL_MATCH** (declared seal: `b2588d68ce358c3b9b023c78e14d89b5f4b9acf8393696da5fe436960838a4b9`)
- Cards: **1,701**
- Card JSON: `reports/closure/LESSON_REVIEW_CARDS_S244.json`
- Compact CSV: `reports/closure/LESSON_REVIEW_CARDS_S244.csv`

## Genuine assessor work remaining

These counts overlap and must not be summed as independent lesson defects.

| Judgment / evidence packet | Explicitly closed | Pending / flagged |
|---|---:|---:|
| Whole-lesson KEEP / REVISE / ESCALATE | 0 | 1,701 lessons |
| Visual required / preferred / sufficient | 0 | 1,701 lessons |
| Grade-band language fitness | 0 | 1,701 lessons |
| Standards edge approval / rejection | 0 | 6,119 edges |
| Candidate standards evidence-map coverage | 1,129 candidate-mapped | 572 lessons missing |
| Exact MCQ duplicate identities | 0 semantic dispositions recorded here | 136 clusters / 314 placements |
| Broader progression / repetition queue | 0 semantic dispositions recorded here | 745 lessons |

Exact duplicate evidence includes **49** within-lesson groups across **192** affected lessons. It proves repeated item identity, not whether a cross-lesson recurrence is instructionally justified.

Standards evidence remains candidate-only: **6,119** dossiers still need exact benchmark text and independent review; **0** are approved and **0** rejected.
The **6,119** central standards edges appear as **6,301** lesson-card references because **162** edges are shared across lessons; cards reference that central authority rather than copying decisions.

## Authority boundaries

- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` supplies open queue state only. Its curriculum seal must match before its lesson rows are treated as current.
- `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` is append-only human input. A decision is current only while its reviewed lesson, course, duplicate-cluster, and standards-reference basis hash matches the live card.
- `CLOSURE_LESSON_CLASSIFICATION.csv` classifies interaction-engine closure. Its KEEP values are deliberately not imported as whole-lesson V4 decisions.
- `content/standards/human-review-decisions.json` is the only standards approval/rejection authority. Candidate dossiers cannot approve themselves.
- Exact MCQ clusters are recomputed from current lesson JSON. The older duplicate index is retained as a reference seal, not treated as live authority.
- Regenerate with `node scripts/audit/lesson-review-cards-s244.mjs`; verify byte-for-byte freshness with `node scripts/audit/lesson-review-cards-s244.mjs --check`.
