# S246 transformations-measurement triple-disposition assessment

Status: **PASS — one learner-visible mathematical release blocker found**

## Scope and authority

This packet independently reviews all 18 live Grade 8 lessons in `transformations-measurement` across the V4 whole-lesson, visual-first, and grade-language dimensions. The assessment read every complete lesson, including all 18 authored step sequences, all 15 available remedial paths, figures, interactions, predictions, checks, challenges, hints, options, explanations, feedback, and recaps. It also reconciled the live course manifest, every current S244 lesson card, current registered visual placements, scoped pending-queue evidence, and the shared implementation of the lesson's claimed Pythagorean proof.

A populated `figure` field, a mechanical `RENDERS` or `aligned` flag, a prior choice repair, and the absence of a heuristic finding were not treated as whole-lesson approval. This is an isolated candidate packet. It does not edit lesson or generator source, the shared decision ledger, pending queue, lesson cards, cache, standards evidence, or any shared audit script.

## Reproducible gate

Run:

```text
node reports/closure/candidates/validate-s246-transformations-measurement-triple-dispositions.mjs
```

Validated result:

| Gate | Result |
|---|---:|
| Course-manifest lesson IDs | 18 / 18 exact |
| Candidate records | 18 / 18 |
| Live S244 cards | 18 / 18 |
| Candidate `reviewedBasisHash` equals live card | 18 / 18 |
| Live lesson source hash equals card | 18 / 18 |
| Live course source hash equals card | 18 / 18 |
| Records with every contract-required field | 18 / 18 |
| Exact record fields and unique IDs | 18 / 18 |
| Evidence files, enums, timestamps, rationales, and reopen conditions | PASS |
| Candidate SHA-256 | `ea107828e47677cf3255dfb7a3a31c8309473a8cc84c2149b2e22f7ea4f25a18` |

## Current-hash manifest and decisions

| Lesson | Review basis | Whole lesson | Visual | Language | Primary finding |
|---|---|---|---|---|---|
| tm-01-01 | `b4ffc6657bd3311a12495a33f57182a54672198ab6b73efacdf0c8b024385f06` | REVISE | SUFFICIENT | FIT | Translation sequence is strong; CHOICE-0285 leaks the answer by length. |
| tm-01-02 | `7b19b2918aef3e5174571ecdadc4ce3cd23e6b752497bb5babca2ca142d8f00e` | KEEP | SUFFICIENT | FIT | Visible, varied reflection rule, identification, composition, and transfer work. |
| tm-01-03 | `1ee58f0a2f79e6b29d32357f5e8fff2c65fc067688ba483099f8dea36c34a776` | REVISE | SUFFICIENT | FIT | i1 and i2 repeat the same 180-degree coordinate job with swapped values. |
| tm-01b-01 | `76f0459f00cd0c8c0117586c079afa179d2f16d33143f5f2c6fae31edb23b69c` | KEEP | SUFFICIENT | FIT | Translation application, reading, composition, and inverse are coherent. |
| tm-01b-02 | `92b19748e6c630fa96f2a149649ac8f623427f6486e07294a2409a07abf9e17c` | KEEP | SUFFICIENT | FIT | Both reflection rules and composed motion are visibly and semantically aligned. |
| tm-01b-03 | `a6908f362ac6366d0cf118ef23228ce0bcb97a9735527e52341a4297db4392e5` | REVISE | SUFFICIENT | FIT | i2 repeats the one-half shrink already tested in k2. |
| tm-02-01 | `f7058ee0d3844a3aaf44dec9444cbe1e5016521c436bca377292c51171ba1f76` | REVISE | SUFFICIENT | FIT | Congruence progression is sound; CHOICE-0286 is cueable by answer length. |
| tm-02-02 | `e260c161a27d78e761a42de13346aefd8cc4a7ac1dacd67a3e78ff36000985a9` | REVISE | SUFFICIENT | FIT | Example, i1, and k2 repeat factor-two point dilation. |
| tm-02-03 | `6fa8c513e646dbb8aa4bce8672b8fbcab86daf65b203200d75539007a554f157` | KEEP | SUFFICIENT | FIT | Angles, sides, factors, and congruence/similarity sorting form a varied sequence. |
| tm-03-01 | `7c40cea5d8fd43496bf10308f030b738f015321c482c7b8ee8880cfedc59857f` | KEEP | SUFFICIENT | FIT | Transversal figures support distinct equal, supplementary, chain, and match jobs. |
| tm-03-02 | `1264c66d4d3a4190864b81be729e0b01dcad2c2dee57eddeec034c305907646f` | REVISE | REQUIRED | FIT | Strong angle lab; the key c2 right-triangle representation is withheld. |
| tm-03-03 | `af5d7e3a67d6bf8ff5a7128b09d9c0cfe2606c7734afa5804d7e1d7aa770f763` | REVISE | SUFFICIENT | FIT | AA classification is repeated across i1, i2, k2, k3, and remedial. |
| tm-04-01 | `d2eeb48d58449bb8d6b847fa9cf24a9e666028b695d23e2bb62c62b111f6d128` | REVISE | REQUIRED | REVISE | A 3-4-5 illustration is falsely called a general proof; rendered side shapes are not squares. |
| tm-04-02 | `5937ff0902f3312ba803ca5b1fccda1fbf05130a4cf6d716864ffea79175ac1a` | REVISE | SUFFICIENT | FIT | Strong distance grid; k1/i2/k2/k3 overrepeat changed-value computations. |
| tm-04-03 | `5f77ca11f5d535a59e9ec7cb0a39196cb8e954d42bbb0a971842b9d436c3c127` | REVISE | REQUIRED | FIT | Repeated converse/distance jobs, no exact coordinate grid, and two notation rows. |
| tm-05-01 | `3a1aee13e3bff47233ebbfaed96c810dfcb28c110af1fc93021aee81a6d0b4ec` | REVISE | SUFFICIENT | FIT | Good builder; repeated coefficient work and 15 math-rendering rows remain. |
| tm-05-02 | `76916e67b2151e82d4751e1d2a014eec5b2abb77639b177fe42f3e93feaedcac` | REVISE | REQUIRED | FIT | c2 is withheld; coefficient repetition and seven math-rendering rows remain. |
| tm-05-03 | `6120e472f544f3c4bcc3d130b794fe38d1012292fcafbb9ea2a85d6fe716b6c9` | REVISE | SUFFICIENT | REVISE | Cueable i2, 23 notation rows, and a distracting “wait” self-correction in k2. |

Totals: **5 KEEP, 13 REVISE, 0 ESCALATE**; **4 REQUIRED, 0 PREFERRED, 14 SUFFICIENT** visual decisions; **16 FIT, 2 REVISE** language decisions.

## Learner-visible mathematical release blocker

`tm-04-01`, “Why the Theorem Works,” must not ship as a proof lesson in its current form.

- The lesson uses the single 3-4-5 equality `9 + 16 = 25` and then says, “That area picture is the proof” for **any** right triangle. A confirming example is not a general proof.
- It says the two leg squares “exactly fill” the hypotenuse square, but it presents no dissection, rearrangement, or area-preserving transformation that establishes that claim.
- In `PythagoreanProof`, the shape on the length-3 vertical leg is a `32 × 48` rectangle and the shape on the length-4 horizontal leg is a `64 × 40` rectangle. The hypotenuse shape is also not constructed as a square on the slanted side.
- The SVG title and lesson feedback repeat the same unsupported general-proof claim. Mechanical visual evidence marks both placements `RENDERS` and `aligned`; those flags establish registration, not mathematical truth.

The bounded root-cause repair is one shared proof packet: replace the SVG with a geometrically valid, labeled dissection/rearrangement proof for arbitrary legs `a` and `b`; revise c1, i1 stages, c2, recap, and accessibility text to distinguish the general proof from the 3-4-5 verification; then verify visual geometry, narration, narrow viewports, reduced motion, and screen-reader order. Any learner-visible false mathematical statement remains release-blocking even though this candidate records the actionable lesson disposition as `REVISE` rather than editing source.

## Exact implementation/root-cause packets

1. **TM-PROOF-P0 — valid Pythagorean proof (`tm-04-01`, shared `PythagoreanProof`).** One general proof model and synchronized prose repair the independent false-proof finding. This packet is not represented by a current specialized queue row and must be added as implementation debt after authority integration.
2. **TM-VIS-P0 — restore two required representations.** Replace or repair `VIS-tm-03-02-c2-la-triangle-sum` and `VIS-tm-05-02-c2-tm-cone-volume`. Each replacement must match the authored values, carry structured alternative text, and remain readable on narrow/touch layouts.
3. **TM-DIST-P1 — exact coordinate evidence (`tm-04-03`).** Render the actual point pairs, horizontal/vertical legs, and resulting hypotenuse for the distance items. Coordinate geometry should not ask learners to imagine the central diagram from prose. Coordinate the repair with the repeated k2/k3 forms rather than adding an ornamental generic figure.
4. **TM-PROGRESSION-P1 — eight bounded lesson-sequence repairs.** Resolve `PROGRESSION-tm-01-03`, `tm-01b-03`, `tm-02-02`, `tm-03-03`, `tm-04-02`, `tm-04-03`, `tm-05-01`, and `tm-05-02`. Preserve only deliberately bounded retrieval; otherwise replace changed-value repeats with new actions, representations, misconceptions, constraints, inverse reasoning, or transfer.
5. **TM-CHOICE-P1 — three family-level option repairs.** Close `CHOICE-0285`, `CHOICE-0286`, and `CHOICE-0287` through shared family fixes and generated-state tests for one defensible answer, construction/length parity, misconception quality, answer-position balance, and semantic feedback.
6. **TM-MATH-P1 — one rendering-boundary batch, 47 authored rows.** Close `MATH-00568..00614` through the structured math-rendering system, then verify visual and spoken output. Counts are 2 in `tm-04-03`, 15 in `tm-05-01`, 7 in `tm-05-02`, and 23 in `tm-05-03`. Do not hand-rewrite each visible string if one parser or semantic-source repair can close the family.
7. **TM-COPY-P1 — two premium-language repairs.** Replace the unsupported “That area picture is the proof” language as part of TM-PROOF-P0. In `tm-05-03` k2, delete the unrelated radius-three detour and “... wait” self-correction; answer the radius-one question directly. Review the recap's “That closes Grade 8 geometry” claim so completion language describes this course/chapter rather than overstating the standards scope.

## Current scoped queue and honest closure boundary

The current pending queue contains 114 rows whose source is this course:

| Current workstream | Rows |
|---|---:|
| LESSON_COMPLETE_DISPOSITION | 18 |
| VISUAL_FIRST_REPRESENTATION | 18 |
| GRADE_LANGUAGE_REVIEW | 18 |
| LESSON_PROGRESSION_AND_DUPLICATION | 8 |
| CHOICE_SURFACE_INTEGRITY | 3 |
| ILLUSTRATION_REPLACEMENT | 2 |
| MATH_PRESENTATION_RESIDUE | 47 |
| **Total** | **114** |

After root-controlled validation and append to the authoritative decision ledger, these 18 current records should close exactly:

- 18 `LESSON_COMPLETE_DISPOSITION` rows;
- 18 `VISUAL_FIRST_REPRESENTATION` rows;
- 18 `GRADE_LANGUAGE_REVIEW` rows;
- **54 completed generic review rows total**.

The 13 `REVISE` records should create or preserve **13 `LESSON_REVISION_IMPLEMENTATION` rows**. Assuming no concurrent source/hash change or bridge-policy change, the immediate net pending-queue reduction is therefore **41 rows**. The remaining implementation debt includes 13 lesson revisions, 4 lessons requiring visual work, 2 language revisions, 8 progression packets, 3 choice-surface rows, 47 math-presentation rows, 2 withheld illustration rows, the independently found proof packet, and the independently found coordinate-visual packet. These overlap by lesson and must not be summed as 80 independent lesson rewrites.

This candidate closes reviews, not repairs. It makes no Common Core approval, rejection, partial-coverage, alignment, or mastery claim. Every revised lesson must be reassessed against a new live review-basis hash after its root-cause packet is implemented and verified at runtime.
