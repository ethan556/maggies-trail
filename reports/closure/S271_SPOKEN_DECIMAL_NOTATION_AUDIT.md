# S271 — Spoken Decimal Numeric-Notation Audit

## Scope and policy

This is a read-only scan of every lesson JSON under `content/courses` plus every non-test source file under `src/components` and `src/lib`. The lesson scan examines learner-visible `body`, `narration`, `prompt`, feedback, `reveal`, label, title, description, hint, and accessibility fields. The app scan covers candidate runtime string literals, including SVG `<title>` and ARIA labels.

A concrete decimal written as spoken number words, such as `zero point five` or `negative twelve point zero five`, is a finding: ordinary learner-facing text must use digits (`0.5`, `−12.05`). Narration remains learner-visible; it is not exempt merely because it is narration.

The sole exemption is local and explicit. The same field/string must state that it is teaching an oral rendering, such as “Say `zero point five` aloud” or “the spoken form.” The audit records any exemption and its source path.

## Deterministic ratchet

`node scripts/audit/spoken-decimal-notation-audit.mjs --check` exits non-zero for any non-exempt phrase in lesson JSON or runtime source. `src/lib/session271.spokenDecimalNotationAudit.test.ts` executes detector-boundary cases and the complete live scan. The audit writes no lessons, components, queues, cards, caches, or ledgers.

## Live baseline

At seal, both surfaces are clean: **0 lesson findings**, **0 app-source findings**, and **0 explicit read-aloud exemptions**. The test derives corpus counts from live files instead of freezing incidental totals. Run `node scripts/audit/spoken-decimal-notation-audit.mjs --json` for the ordered inventory and SHA-256 evidence hash.