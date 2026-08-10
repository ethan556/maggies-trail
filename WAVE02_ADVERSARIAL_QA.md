# WAVE 02 ADVERSARIAL QA — PREFLIGHT, GENERATED-EVIDENCE REPAIR, VISUAL CERTIFICATION CONTRACT

**Verdict:** **ACCEPT THE S220 PREFLIGHT ENGINEERING BATCH; DO NOT CLOSE WAVE 02.**  
The verification substrate is stronger and reproducible, but the real current-source browser/build chain
is still unavailable. No premium visual claim is authorized.

## 1. Independence / falsification posture

The review did not treat a green historical report as evidence for current source. It repeatedly asked:

> How could the closure process be wrong even though a local script says PASS?

The answer exposed multiple defects in the audit machinery itself. Each required repair was checked against
an invariant stronger than path-only authorization: exact current bytes, immutable historical checksums,
real current local imports, or mutation-proven contract behavior.

## 2. Runtime restore — RED, correctly left open

Fresh exact-lock attempt:

- Node `v22.16.0`;
- npm `10.9.2`;
- registry `https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public`;
- `npm ci --ignore-scripts --no-audit --no-fund` → exit **1**;
- engine warning: `@sparticuz/chromium@149.0.0` requires `^22.17.0 || >=24.0.0`;
- terminal failure: HTTP **404** for `zustand@5.0.14`.

Therefore no current typecheck, full Vitest, build, Playwright or rendered Wave-02 screenshot result is
claimed.

### Refused dependency workaround

A narrow experiment asked whether the one direct Zustand import could be replaced by a tiny
`useSyncExternalStore` adapter, thereby restoring the tree. Removing Zustand only exposed another missing
registry dependency (`zod`). That means the change would have increased core player risk without solving
the release blocker. **STOP rule applied: REFUSED and reverted.**

### Self-caught revert failure

The first manual revert was incomplete: `playerStore.ts` still referenced the temporary adapter while the
adapter had been deleted and `package.json` still lacked Zustand. Preflight caught this before seal.
`package.json`, `package-lock.json` and `src/components/playerStore.ts` were then restored directly from the
immutable S219 tarball. Final evidence:

- `package-lock.json` SHA-256 `4473925e892e5c1020cd45d2e39e046644f775f3004c70799d7e510a14540cbf`;
- `src/components/playerStore.ts` SHA-256 `3b6d5e3f08af4ebd493bd17317a987e448799d1b9863ca20d3d12470aeb11abf`;
- temporary `src/lib/externalStore.ts` absent;
- `package.json` again contains both `zod` and `zustand`.

This correction is recorded because “I reverted it” is not evidence; sealed-byte equality is.

## 3. Generated-evidence defects found by running the broad gate

### F1 — Python refusal-only authorization type collapse

Four historical Python audits used a set union with an authorization literal generated as `{}` when the
batch had zero paths. In Python `{}` is a dictionary, so the audit crashed before checking content.

Affected audits:

- quotient reasoning S146;
- affine relationship S147;
- exact number S148;
- point-set reasoning S150.

Repair:

- refusal-only authorization is `set()`;
- the generator `apply-manipulable-repair.mjs` now emits `set()` when there are zero paths, fixing the root
  source of recurrence.

No mathematical evaluator/model code changed.

### F2 — historical ledgers stopped before eight documented later changes

Once F1 was removed, the old Python ledgers rejected exactly eight legitimate S210–S218 paths and had
**zero falsely authorized unchanged paths**. The eight were independently cross-checked against the
existing cumulative content-change proof before addition. They include the S218 `ee-05-02` conversion and
the S216/S217 inequality-ray lessons.

Individual repaired audit results:

- S146: **37/37** authored experiences;
- S147: **35/35**;
- S148: **48/48**;
- S150: **13/13**.

### F3 — duplicate stale JavaScript allow-lists

S147–S151 content proofs still tried to define “later authorized content” in their own aging path lists.
That creates two failure modes: legitimate later work becomes red, or a broad path-only allowance can hide
a new mutation.

Repair: `verified-post-s151-changes.mjs` consumes the existing cumulative
`SESSION151C_CONTENT_CHANGE_PROOF.json`, but accepts each later path only after recomputing its **current
SHA-256** and matching the sealed entry. Current result:

**815/815 post-S151 authorized lesson files match their sealed hashes.**

Historical proofs then retain their own original target-node/widget preservation tests while acknowledging
only these exact-hash later changes.

### F4 — S151 evaluator loader did not load the current evaluator dependency graph

The historical VM loader knew only S151-era local dependencies. Current `evaluate.ts` legitimately imports
newer MMIP models such as `numberLineRayModel`; the loader crashed before testing them.

Repair: the loader now recursively transpiles/imports real trusted local TypeScript modules, uses the
specialized schema loader only at the schema boundary, rejects external module requests, and preserves a
module cache for cycles. It does **not** stub current evaluator behavior.

Result: S151 integration audit **95/95**; engine sweep **33,408/33,408**; mutation matrix **155/155 rejected,
29/29 valid controls accepted**.

### F5 — `verify:generated` could corrupt its own frozen baseline

This was the highest-severity QA catch.

`verify:generated` invoked `lesson-hashes-s151.py` against today's 1,701-lesson corpus. That file is not a
current generator: it creates the immutable S151 baseline of 1,129 lesson hashes. Worse, the script wrote
`SESSION151_LESSON_HASHES.json` **before** checking `len(files) == 1129`. The expected red run therefore
overwrote the frozen baseline with current hashes before exiting.

Repair and proof:

1. restore `SESSION151_LESSON_HASHES.json` byte-for-byte from the S219 seal;
2. sealed SHA-256 restored to
   `3ff6e1891c158e5e55c9124b48b6043e44a9d57f376bcd553e86bb3ed0a47a01`;
3. add `verify-frozen-s151-ledger.mjs`, pinning that checksum, scope, algorithm, count **1,129**, path shape
   and hash shape;
4. replace the destructive generator entry in `verify:generated` with the frozen verifier;
5. reorder count validation before writes in historical lesson-hash generators S146, S148, S149, S150,
   S151 and S151C.

The frozen ledger is never compared as if all 1,129 historical bytes must still be current; later edits are
handled by the separate exact-hash cumulative authorization layer.

### F6 — S151 failure-first audit still treated the historical 29 changes as the entire current corpus delta

After F5, failure-first was correctly red because current content includes later authorized work. Repair:

- original S151 boundary remains exactly **29 widget substitutions**;
- current changed-lesson boundary must equal the union of those S151 targets plus the exact-hash post-S151
  authorization set;
- current result: **844 authorized changed lesson files**, **857 non-authorized lessons byte-identical**;
- failure-first result: **44/44**.

This does not rewrite S151 history; it separates “what S151 changed” from “what the current corpus is
allowed to have changed since S150.”

## 4. Generated freshness — complete current run

`verify:generated` contains **81** effective groups. Because several historical reports were legitimately
stale after hardening their source and current-corpus metadata, first regeneration was allowed to go red,
outputs were reviewed, and then every range had to pass byte-stable:

- groups 0–25: PASS;
- 25–48: PASS after first-run refresh of two hardened failure-first reports;
- 48–54: PASS;
- 54–60: PASS;
- 60–66: PASS;
- 66–72: PASS;
- 72–77: PASS;
- 77–81: PASS;
- 81+ contains zero groups.

Representative retained mathematical gates inside those groups include:

- proportional sweep **23,040/23,040**;
- place-value sweep **27,648/27,648**;
- quotient sweep **20,736/20,736**;
- affine sweep **20,736/20,736**;
- exact-number sweep **27,648/27,648**;
- geometric-constraint sweep **27,648/27,648**;
- point-set sweep **18,432/18,432**;
- S151 engine sweep **33,408/33,408**.

These are generator/audit sweeps, **not** a substitute for the unavailable full Vitest/browser chain.

## 5. Visual-certification contract

The new matrix contract statically requires exactly:

- 15 surfaces;
- 3 viewports: 390×844, 768×1024, 1440×900;
- 2 themes;
- **90 deterministic captures**;
- reduced-motion screenshot baseline;
- lesson-start and lesson-completion scenarios;
- horizontal overflow telemetry;
- small target telemetry;
- desktop keyboard probe;
- explicit manual 200% real-browser zoom;
- explicit real-device touch and normal-motion review.

Contract result: **PASS — 15 × 3 × 2 = 90 required captures.**

No screenshot manifest exists for S220 because the browser runtime cannot be reconstructed. The contract
proves the test specification, not the product's visual quality.

## 6. Mutation tests

### M1 — later authorized lesson byte

Target: `content/courses/expressions-equations/lessons/ee-05-02.json`.

Mutation: append one byte.  
Expected/observed: `verified-post-s151-changes.mjs` exits **1**, reports expected SHA
`69dafdb2...` vs mutated SHA.  
Restore: byte-exact; helper returns **815 exact matches**.

### M2 — frozen S151 ledger

Target: `SESSION151_LESSON_HASHES.json`.

Mutation: append one byte.  
Expected/observed: frozen verifier exits **1** on checksum mismatch.  
Restore: byte-exact; verifier returns **1,129 entries / sealed checksum PASS**.

### M3 — visual viewport omission

Target: Wave-02 matrix specification.

Mutation: remove 1440×900 viewport.  
Expected/observed: contract exits **1** with `viewports must be exactly 390x844, 768x1024, 1440x900`.  
Restore: byte-exact; contract returns **90 captures required**.

All three restores were hash-compared to their pre-mutation bytes.

## 7. Fresh-extraction portability catch

The first S220 tarball was **rejected before handoff**. Its clean extraction changed
`EXCELLENCE_BACKLOG_S126.json` on regeneration even though the working-directory gate had been stable.
The only diff was `repositoryRoot: "maggies-trail-session-219"` vs
`"maggies-trail-session-220"`: the generator serialized `basename(ROOT)`, so a release artifact changed
merely because its extraction directory changed.

Repair: the generated report now records repository-relative root `"."`, which is invariant under session
folder renaming. Working-tree group 0–25 went red once on the legitimate refresh, then green byte-stable.
A scan found no remaining non-document generated/source occurrence of the working path or S219 root name.
The rejected tarball was discarded and is not the delivered seal.

This catch strengthens the release rule: **byte-stable in one checkout is insufficient; generated evidence
must also be portable across a clean extraction path.**

## 8. Final dependency-free current-tree gates

- native integrity: **2,492 JSON / 1,190 source / 1,686 local imports / 47 internal links / 2 assets /
  268 buttons / 28 API routes — PASS**;
- exact corpus state: **129 courses / 1,701 lessons / 15,621 steps / corpus SHA
  `b6461fe5...52c5cf19` — PASS**;
- post-S151 exact authorization: **815/815 — PASS**;
- frozen S151 ledger: **1,129 / sealed checksum — PASS**;
- visual matrix static contract: **90 required captures — PASS**;
- `content/courses/**` recursive byte diff vs S219: **zero differences**;
- package lock and `playerStore.ts` match the S219 seal after the refused dependency experiment.

## 9. Mathematical / pedagogical / visual adjudication

### Mathematics

**No authored mathematics changed.** The exact corpus hash is unchanged. No new mathematics score is
manufactured from this infrastructure batch.

### Pedagogy

No lesson demand or mastery behavior changed. The pedagogical benefit is indirect but important: future
visual repairs cannot be certified using a stale or self-corrupting evidence chain.

### Visual quality

**NOT SCORED.** Historical screenshots were reviewed only as reference. Current 390/768/1440 renders were
not available, so changing styling based on source inspection alone was deliberately refused.

## 10. Final adversarial verdict

**ACCEPT S220 as Wave-02 preflight infrastructure. KEEP WAVE 02 OPEN.**

The highest-leverage next action is not another CSS pass. It is to run this exact sealed source under Node
≥22.17/24 with the exact dependency tree, execute the current semantic/test/build/browser chain, then run
the 90-capture visual matrix and fix only defects visible in that current evidence.

## 11. Seal proof

The repaired second candidate seal was extracted under the renamed root `maggies-trail-session-220` and
re-proved from that clean extraction, not the working directory:

- native integrity: PASS;
- corpus-state identity: PASS;
- 815 exact post-S151 lesson authorizations: PASS;
- frozen 1,129-entry S151 ledger checksum/shape: PASS;
- visual certification contract: PASS;
- `src/**` and `content/courses/**` equality vs S219: PASS;
- generated freshness **all groups 0–81**: PASS and byte-stable in the clean extraction.

The first path-dependent candidate archive is rejected history; only the post-portability repair archive is
eligible for handoff.
