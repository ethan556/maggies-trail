# Session 139 — adversarial mutation matrix

Every mutation below must be detected by the named test, audit, or release gate. The list targets the mathematical and delivery failures most likely to survive superficial UI review.

| # | Deliberate mutation | Required detector |
|---:|---|---|
| 1 | Multiply signs incorrectly for unlike signs | `session139.signed-fraction.test.ts` truth test; `signed-fraction-s139.mjs` |
| 2 | Make two negative factors produce a negative answer | truth test; 4,608-case variant sweep |
| 3 | Divide without replacing the divisor by its reciprocal | kept-divisor integrity check; variant sweep |
| 4 | Flip the dividend instead of the divisor | derived-answer audit; variant sweep |
| 5 | Add denominators during multiplication | magnitude-error route and derived-answer audit |
| 6 | Accept an unreduced answer in `lowestTerms` mode | schema integrity test; variant sweep |
| 7 | Reject an equivalent fraction in `any` mode | exact-choice grading test |
| 8 | Mark an equivalent unreduced value as the unique correct choice | schema integrity test |
| 9 | Author two choices with the same id | schema integrity test |
| 10 | Author two choices with the same visible label | schema integrity test |
| 11 | Make a wrong-sign choice change magnitude too | `wrongSign` structural invariant |
| 12 | Put `keptDivisor` on a multiplication problem | schema integrity test |
| 13 | Remove the reciprocal display from division mode | DOM test; source audit marker |
| 14 | Show “reciprocal” even after learner selects kept-divisor trap | DOM wrong-path visualization test |
| 15 | Replace learner selection during reveal | DOM reveal-preservation test |
| 16 | Remove the separate correct-answer ghost | DOM reveal test; source audit marker |
| 17 | Shrink choice controls below 44px | DOM `min-h-11` test; source audit |
| 18 | Communicate sign or error only through color | DOM label/pattern assertions; source audit |
| 19 | Emit `toward` for a wrong claim | DOM process-signal test |
| 20 | Claim `adapt=3` without toward/away wiring | capability/source audit |
| 21 | Let a seeded form fall back to `fractionEntry` or `mcq` | 4,608-case executable variant sweep; variant test |
| 22 | Return a raw widget instead of a complete deterministic variant | executable variant sweep |
| 23 | Omit a required parsed-output field from a generator | TypeScript gate; executable variant sweep missing-field checks |
| 24 | Change any of the four authored variant declarations | Session-139 content proof |
| 25 | Change an authored answer or misconception feedback | Session-139 content proof |
| 26 | Change another lesson file | Session-139 baseline hash proof |
| 27 | Leave `rno-04-01` in the live excellence queue | `signed-fraction-s139.mjs` |
| 28 | Omit any registration surface | 114/114 engine-registration gate |
| 29 | Freeze an old queue or tier total in a historical audit | historical non-regression audit chain |
| 30 | Package under the wrong root or omit Session-139 evidence | package-identity and package-session gates |
| 31 | Regenerate reports to different bytes | generated-freshness gate |
| 32 | Package transient build/native artifacts | native-clean and tidy clean-copy gates |
