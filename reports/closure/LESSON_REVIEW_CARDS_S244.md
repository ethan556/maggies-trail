# Maggie's Trail S244 lesson review cards

Deterministic assessor view generated from the live lesson source. No semantic judgment is auto-approved.

- Review-basis seal (lessons plus course/grade metadata): `4a5ef1b61285aa4872ee64697057cbcf29e4e0f1e9fa875a5a8cb691c794ab1b`
- Queue-compatible lesson-only seal: `49ea808639b636361b52a56373ed1f75fb4758265d8c6cc2a395326094d95299`
- Queue freshness: **SOURCE_SEAL_MATCH** (declared seal: `49ea808639b636361b52a56373ed1f75fb4758265d8c6cc2a395326094d95299`)
- Cards: **1,701**
- Card JSON: `reports/closure/LESSON_REVIEW_CARDS_S244.json`
- Compact CSV: `reports/closure/LESSON_REVIEW_CARDS_S244.csv`

## Genuine assessor work remaining

These counts overlap and must not be summed as independent lesson defects.

| Judgment / evidence packet | Explicitly closed | Pending / flagged |
|---|---:|---:|
| Whole-lesson KEEP / REVISE / ESCALATE | 1,609 | 92 lessons |
| Visual required / preferred / sufficient | 1,609 | 92 lessons |
| Grade-band language fitness | 1,609 | 92 lessons |
| Standards edge approval / rejection | 6,119 | 2 edges |
| Candidate standards evidence-map coverage | 1,134 candidate-mapped | 567 lessons missing |
| Exact MCQ duplicate identities | 0 semantic dispositions recorded here | 6 clusters / 13 placements |
| Broader progression / repetition queue | 0 semantic dispositions recorded here | 175 lessons |

Exact duplicate evidence includes **0** within-lesson groups across **13** affected lessons. It proves repeated item identity, not whether a cross-lesson recurrence is instructionally justified.

Standards evidence remains candidate-only: **6,119** dossiers still need exact benchmark text and independent review; **0** are approved and **6,119** rejected.
The **6,121** central standards edges appear as **6,311** lesson-card references because **164** edges are shared across lessons; cards reference that central authority rather than copying decisions.

## Authority boundaries

- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` supplies open queue state only. Its curriculum seal must match before its lesson rows are treated as current.
- `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` is append-only human input. A decision is current only while its reviewed lesson, course, duplicate-cluster, and standards-reference basis hash matches the live card.
- `CLOSURE_LESSON_CLASSIFICATION.csv` classifies interaction-engine closure. Its KEEP values are deliberately not imported as whole-lesson V4 decisions.
- `content/standards/human-review-decisions.json` is the only standards approval/rejection authority. Candidate dossiers cannot approve themselves.
- Exact MCQ clusters are recomputed from current lesson JSON. The older duplicate index is retained as a reference seal, not treated as live authority.
- Regenerate with `node scripts/audit/lesson-review-cards-s244.mjs`; verify byte-for-byte freshness with `node scripts/audit/lesson-review-cards-s244.mjs --check`.
