# S329 Closure Investigation — Lane A, Packet CL1

Scope: `CL-P1-044` and `CL-P1-040` only. Read-only investigation of `CLOSURE_LEDGER.md`;
this session did not edit the ledger (a separate integration step applies status edits after
reading this report). Working tree: branch `codex/v4-s244-authored-visual-wave`, HEAD
`7d8e4f40ec296ef41a471a6c60bf4a8c170e4f79`. The tree had a large number of *other* files
already modified by concurrent work when this session started (content lessons, `src/lib`,
`reports/`, etc.) — none of that is this session's work and none of it was touched here. This
session's entire footprint is four files, all under `scripts/audit/`, listed in full in §2.4.

---

## 1. CL-P1-044 — Strict CML baseline / `re-04-02`

### 1.1 Identifying the gate

"Strict CML" is `npm run cml:lint:strict` → `node scripts/cml-lint.mjs . --strict`
(`package.json`). It is the only "strict" + "CML" gate in the repo (checked `scripts/*.mjs`,
`scripts/audit/*.mjs`, and every doc/JSON hit for `Strict CML` / `CML_STRICT_LEDGER`; the only
code hits are inside `cml-lint.mjs` itself).

### 1.2 Current run

```
$ npm run cml:lint:strict
> node scripts/cml-lint.mjs . --strict
CML lint (strict): 0 error(s), 0 warning(s)
```

Full corpus (1,701 lesson files), current tree, zero errors, zero warnings. `CL-P1-044`'s two
named findings do not fire today.

### 1.3 What the two findings were, and why they no longer fire

The ledger row doesn't name the two findings explicitly, so I recovered them from
`WAVE0_TRUTH_BASELINE_S242.md` §8, which records a strict-CML run from Session 242 verbatim:

```
flagship-without-manipulation    radical-functions/re-04-02.json
flagship-missing-direct-surface  radical-functions/re-04-02.json#1
```

These are the two radical-functions findings CL-P1-044 refers to (`re-04-02.json` step index 1 is
step `i1`, the lesson's only flagship step — see §1.4).

`scripts/cml-lint.mjs` already carries a full account of the root cause and fix, dated the same
session, in its own comments (lines 6–72, tagged "S242 / CML-01"):

- The lint's `DIRECT` set (which engines count as direct mathematical manipulation, gating the
  `flagship-without-manipulation` / `flagship-missing-direct-surface` checks) used to be a
  **hand-typed list**. It held 87 of the 112 engines that score `manip ≥ 2` in the authoritative
  registry (`scripts/engine-capabilities.json` — confirmed the same file
  `scripts/audit/engine-registration-contract.mjs` names as its own
  `registryAuthority: "scripts/engine-capabilities.json (cross-checked against source surfaces)"`,
  line 66 of that file) and none of the 11 scoring `manip = 1`. So the *intended* rule was plainly
  "manip ≥ 2," and the hand-typed list had simply drifted out of sync with newer engines.
- `extraneousRootLab` — the widget `re-04-02` step `i1` uses — scores `manip: 3` (verified: `python3
  -c "import json;print(json.load(open('scripts/engine-capabilities.json'))['types']
  ['extraneousRootLab'])"` → `{'manip': 3, 'conseq': 3, 'err': 3, 'adapt': 3, 'a11y': 3, 'mobile': 2,
  'polish': 2}`), the top manipulation tier, but was simply missing from the old hand-typed list —
  an oversight, not a judgment call (per the in-code writeup).
- The fix (already landed, already on this branch, **not made by this session**): `DIRECT` is now
  *derived* — `Object.entries(capabilities).filter(([, c]) => (c?.manip ?? 0) >= 2)` — plus a tiny
  named-exception set (`radicalCheck`, which scores `manip:0` but is intentionally kept). A ratchet
  set (`DIRECT_AT_S242`) hard-fails the gate (`process.exit(2)`) if any previously-covered engine is
  later demoted out of `DIRECT`, so the fix cannot silently regress.
- This is a **general correctness fix, not a `re-04-02` special case**: the derivation is a strict
  superset of the old list, so it makes the gate *stricter* everywhere (25 more engines now owe the
  full flagship/construct-stage contract) while incidentally clearing the two false positives on
  `re-04-02`. It matches exactly the outcome the investigation brief asked me to prefer, and
  someone had already done it — my job here was to verify that it's real, current, and sufficient,
  not to redo it.

### 1.4 Confirming `re-04-02` itself is content-complete (not just gate-lenient)

`content/courses/radical-functions/lessons/re-04-02.json` step `i1` uses widget
`extraneousRootLab`, `cml.flagship: true`, `cml.stage: "construct"`, and carries all 13 fields the
lint's flagship contract requires: `predict` (prediction), direct-surface (now satisfied),
`kernel`, `actionGoal`, 2 `invariants`, 2 `misconceptions`, 4 `representations` (≥3 required),
`translationFrom`/`translationTo`, `counterfactualPrompt`, an `explanation` block with exactly one
`correct: true` option, integer `fadeLevel: 1`, `transferFamily`, and `delayed: true`. Nothing here
needed a content edit — the lesson was already right; the gate's stale list was wrong.

### 1.5 What this session changed

Nothing. `git status --porcelain` / `git diff` on both `scripts/cml-lint.mjs` and
`content/courses/radical-functions/lessons/re-04-02.json` are empty — both are byte-identical to
HEAD. The repair the ledger row asks for ("repair or formally reclassify `re-04-02`... do not
attribute this baseline to S225") had already been made, generally and correctly, prior to this
session, and I re-verified it holds on the current tree rather than trusting the historical claim.

### 1.6 Supporting fresh gates (same tree, this session)

```
npm run validate:content  → schema: 1840/1840 files clean   (exit 0)
npm run lint:pedagogy     → pedagogy: 1711/1711 files clean (exit 0)
npm run check:registration → files ↔ course.json ↔ PLAN.md all consistent (exit 0)
```

### 1.7 Disposition / staging record

No lesson content was edited for this row, so per the task's own conditional ("For any lesson
content you edit as part of fixing CL-P1-044, issue a fresh signed disposition"), no disposition
record applies. `reports/closure/cowork-staging/laneA-s329-CL1.jsonl` was **not created** —
0 records. (I did read the schema record in `LESSON_REVIEW_DECISIONS_S244.jsonl` and
`scripts/session/print-review-basis.mjs` to confirm the mechanism before concluding it doesn't
apply here; it's a content KEEP/REVISE/ESCALATE review ledger, not a gate-verification log.)

### 1.8 Recommended ledger update

```
| CL-P1-044 | P1 | Strict CML baseline | Strict CML remains red on two existing radical-functions findings in `re-04-02`; S225 target lessons are clean. | **CLOSED — VERIFIED S329** | `npm run cml:lint:strict` on current tree: 0 error(s), 0 warning(s) across all 1,701 lessons. The two named findings (`flagship-without-manipulation` and `flagship-missing-direct-surface`, both `radical-functions/re-04-02.json#1`, recorded verbatim in `WAVE0_TRUTH_BASELINE_S242.md` §8) no longer fire because `scripts/cml-lint.mjs`'s `DIRECT` engine set is now derived from `scripts/engine-capabilities.json` (manip≥2 — the same file `engine-registration-contract.mjs` calls its own registry authority) instead of a hand-typed list that omitted `extraneousRootLab` (manip:3, the engine `re-04-02` step `i1` uses) by oversight. The fix is general (25 more engines now owe the full flagship contract; a ratchet hard-fails the gate if any engine is later demoted) — not a `re-04-02` special case — and was already on this branch before this audit (`scripts/cml-lint.mjs` and `re-04-02.json` are both byte-identical to HEAD; no edit was made this session). `re-04-02.json#i1` independently carries a complete 13-field flagship contract. Fresh same-session `validate:content` 1840/1840 and `lint:pedagogy` 1711/1711 also pass. No content edit → no staging disposition record. Reopen if strict CML returns a `re-04-02` finding, or if `DIRECT`'s derivation reverts to a hand-typed/undated list. |
```

---

## 2. CL-P1-040 — Historical generated verifier portability (S147+ Python audits)

### 2.1 Identifying the tools

`scripts/audit/*.py` — five one-off, per-session "authored content survived this engine
migration" audits, each hashing/comparing lesson JSON against a sealed baseline:

| Script | Session | Raw-byte corpus/ledger hash compare? |
|---|---|---|
| `quotient-reasoning-s146.py` | 146 | Yes — **already fixed** (ledger's own claim) |
| `affine-relationship-s147.py` | 147 | Yes — **had the bug** |
| `exact-number-s148.py` | 148 | Yes — **had the bug** |
| `geometric-constraint-s149.py` | 149 | No (pure JSON-structural equality; immune to the CRLF/hash defect, but still had the missing-`encoding='utf-8'` defect) |
| `point-set-reasoning-s150.py` | 150 | Yes — **had the bug** |

No S151+ Python audits exist — later sessions' audits are `.mjs`/`.cjs`.

### 2.2 Confirming the bug (pre-fix)

Comparing `scripts/audit/quotient-reasoning-s146.py` (the ledger's cited "already fixed, narrow
UTF-8/POSIX-path/newline normalization" reference) against `affine-relationship-s147.py` confirmed
exactly the three defect classes CL-P1-040 names, all absent from s146 and all present in s147:

1. **No explicit UTF-8 decode.** `read_text()` calls with no `encoding=` argument fall back to
   `locale.getpreferredencoding()` — UTF-8 on this container, but not guaranteed on Windows.
2. **Raw-byte hashing, no CRLF normalization.** `hashlib.sha256(p.read_bytes()).hexdigest()` — a
   Windows checkout with CRLF line endings hashes differently from a POSIX/LF baseline even when
   the content is identical. s146 already normalizes this (`.replace(b'\r\n', b'\n')` before
   hashing); s147/s148/s150 did not.
3. **Platform-native path separators, only in `affine-relationship-s147.py`.** Line 80 built
   `expected_changed={str(p.relative_to(ROOT)) for p in TARGETS.values()}` — `str(Path)` uses `\`
   on Windows — while the corpus scan two lines above builds `changed` via `.as_posix()` (always
   `/`). `TARGETS.values()` are `Path` objects there (unlike s148, whose `TARGETS` are plain string
   literals — immune to this specific sub-bug). On native Windows this makes `expected_changed`'s 5
   entries permanently unable to set-equal-match `changed`'s corresponding entries, so the
   `changed lesson set mismatch` check (line 191) **always** fires — combined with defect #2, a
   Windows checkout would report the *entire* corpus (not just these 5 files) as changed, which is
   exactly "a current Windows corpus is falsely reported as wholly changed."

### 2.3 Fix applied

Same narrow pattern s146 already uses, applied to the three scripts that share its raw-byte-hash
design, plus the one `read_text()` site in s149 (which doesn't hash raw bytes, but still decoded
without an explicit codec):

- `affine-relationship-s147.py` — 4 `read_text()`/`write_text()` sites given `encoding='utf-8'`
  (plus `newline='\n'` on writes); the corpus-hash and `baselineHashes` sites given
  `.replace(b'\r\n', b'\n')`; `expected_changed` switched from `str(p.relative_to(ROOT))` to
  `p.relative_to(ROOT).as_posix()`, matching how `changed` is already built.
- `exact-number-s148.py` — same pattern, 5 sites (2 reads, 1 hash, 2 writes). No separator bug
  present (its `TARGETS` values are literal forward-slash strings, not `Path` objects).
- `geometric-constraint-s149.py` — `read_text()` encoding on its 2 sites, `encoding='utf-8'` +
  `newline='\n'` on its 3 writes. (No raw-byte corpus hash to fix — its comparison is structural
  JSON equality via `strip_widgets()`, immune to CRLF.)
- `point-set-reasoning-s150.py` — same pattern, 6 sites (2 reads, 1 hash, 3 writes).

Full diffs are in the working tree (`git diff scripts/audit/`); each is a single-purpose,
line-level change — no assertion, count, threshold, or comparison *logic* was touched, only how
bytes are read/hashed/written. All four files pass `python3 -m py_compile`.

### 2.4 Verifying the fix is correct and behavior-preserving

This container is Linux, UTF-8 locale, and the entire corpus is LF-only (`grep -rlc $'\r'
content/courses/*/lessons/*.json` → 0 files), so on *this* tree the fix should be a complete no-op
(CRLF-strip does nothing to LF-only bytes; `str(Path)` and `.as_posix()` already agree on POSIX;
the container's default codec already is UTF-8). I verified this is exactly what happens, for all
four scripts, by running the original (via `git show HEAD:<path>`) and the patched version
back-to-back and diffing stdout/stderr:

```
affine-relationship-s147.py:   orig vs fixed → IDENTICAL (both exit 1, same 35-line output)
exact-number-s148.py:          orig vs fixed → IDENTICAL (both exit 1, same AssertionError at line 116)
geometric-constraint-s149.py:  orig vs fixed → IDENTICAL (both exit 1, same AssertionError at line 53)
point-set-reasoning-s150.py:   orig vs fixed → IDENTICAL (both exit 1, same AssertionError at line 52)
```

Byte-identical before/after output is the correct result for a portability-only fix on a
POSIX/UTF-8/LF tree — it demonstrates the change alters behavior only where the original bug could
actually manifest (a non-UTF-8-locale and/or CRLF and/or native-Windows-separator run), which
cannot be directly exercised in this Linux container. The final files on disk are the patched
versions (confirmed via `git diff --stat`, 4 files, 23 insertions / 22 deletions total); no other
files remain modified — I ran each script from a temporarily-reverted copy for the "orig" side of
the comparison and then restored the patched file before moving on, so the repo never sat in a
half-fixed state between edits.

**This closes CL-P1-040's specific, named defect: TOOLING PORTABILITY FIXED, with the finding text
now confirmed accurate and reproducible.**

### 2.5 A new, separate finding this investigation surfaced — NOT a portability defect

None of the five scripts (s146 included) currently exit clean on this tree, portability fix or not
— every one above still ends in `AssertionError`/`SystemExit(1)`. I checked whether this was
something my edits caused (it is not — see §2.4, identical before/after) and then checked *why* it
happens:

- Each script's corpus-wide check compares against a **frozen, single-session hash ledger**
  (`SESSION146_LESSON_HASHES.json`, `SESSION147_LESSON_HASHES.json`, `SESSION149_LESSON_HASHES.json`
  — s146's own ledger has **1,129** entries) and a **hand-maintained `allowed_later` authorization
  set** that stops at `S210_S218_AUTHORIZED` in both s147 and s148.
- The corpus today has **1,701** lesson files — the exact same 1,129-vs-1,701 gap
  `CL-P0-027` already names and closed for the broader freshness gate ("could invoke a
  1,129-lesson historical hash generator against the 1,701-lesson corpus"). Direct measurement: of
  1,701 current lesson files, **1,518 hash-differ** from the S146-era 1,129-file ledger alone.
  These `allowed_later` sets were extended session-by-session only through roughly S218 — the
  corpus has had ~180 further legitimate content sessions since (S219 through S326, per
  `CLOSURE_LEDGER.md`'s own later sections — notation/MCQ/pedagogy remediation waves etc.) that
  these five scripts have no way to know about.
- Separately, three of `affine-relationship-s147.py`'s five *target* lessons (`bv-02-03`,
  `les-04-02`, `les-04-03`; `fg-03-02` and `fg-03-03` are clean) show real prompt/option drift
  against their sealed S147-era baseline snapshots — again consistent with later, presumably
  legitimate, content revision the script has no mechanism to account for, since its deep
  structural check assumes those five files are frozen forever except for S147's own widget-type
  transformation.
- I confirmed this is **not new and not caused by portability**: I re-ran the ledger's own cited
  clean example, `quotient-reasoning-s146.py` — already carrying the exact fix pattern, untouched
  by this session — and it now **also** fails, on the current tree, for the identical reason
  (`prompt changed` on 3 lessons, then `changed lesson set mismatch` against the stale 1,129-file
  ledger). So the row's supporting claim "S146... passes 37/37" is **no longer current-tree true**;
  it was true when written and has since expired purely from ~180 sessions of ordinary corpus
  growth, independent of anything this row is actually about.

These five scripts were single-session, point-in-time verifications — proving one session's engine
migration didn't silently rewrite lesson prose. Their job was done at the time. They were never
designed or maintained as permanent regression gates, and treating their non-passing state today as
a content problem would be a mistake: `validate:content` (1840/1840), `lint:pedagogy` (1711/1711),
`check:registration` (consistent), and `cml:lint:strict` (0/0) are the *current*, actively
maintained gates, and all four are green on this exact tree, run fresh this session (§1.6). I did
**not** attempt to extend any script's `allowed_later` set or re-litigate the three drifted S147
target lessons — that would mean personally re-authorizing ~180 sessions of other people's content
work sight-unseen, which is well outside "tooling portability" and outside what I could respectably
verify in this pass. I'd recommend the five scripts be retired/archived rather than patched further
along this axis, but I'm flagging it here rather than deciding it — it isn't what CL-P1-040 asked
for, and it doesn't belong bundled into this row's evidence as if it were the same problem.

### 2.6 Files touched this session

Exactly four, all under `scripts/audit/`, all portability-only:
`affine-relationship-s147.py`, `exact-number-s148.py`, `geometric-constraint-s149.py`,
`point-set-reasoning-s150.py`. Running the scripts for verification (§2.4) regenerated two tracked
evidence artifacts as a side effect (`AFFINE_RELATIONSHIP_S147.{json,md}`,
`QUOTIENT_REASONING_S146.{json,md}` — the two scripts whose error-handling continues to a
`write_text()` even on failure); I restored all four to their HEAD content afterward (`git
checkout --`) rather than leave a mutation nobody asked for sitting in the tree, since the
evidence belongs in this report, not in a silently-changed tracked file. `git status --porcelain`
now shows only the four `.py` files as modified by this session.

### 2.7 Recommended ledger update

```
| CL-P1-040 | P1 | Historical generated verifier portability | The historical S147+ Python authored audits hash raw Windows bytes, decode without explicit UTF-8, and emit platform separators, so a current Windows corpus is falsely reported as wholly changed. | **CLOSED — PORTABILITY FIXED (TOOLING)** | `affine-relationship-s147.py`, `exact-number-s148.py`, and `point-set-reasoning-s150.py` patched with the same narrow UTF-8-decode/CRLF-normalize-before-hash pattern `quotient-reasoning-s146.py` already carried; `geometric-constraint-s149.py` given the same explicit-UTF-8 read fix (it doesn't hash raw bytes, so it wasn't exposed to the CRLF half of the defect). S147 additionally had its own bug fixed: `expected_changed` used `str(Path)` (native separator) while `changed` used `.as_posix()` — on native Windows this made the two sets permanently unable to match, independent of CRLF, which combined with the raw-byte-hash defect is exactly the "wholly changed" failure mode. Verified behavior-preserving on this Linux/UTF-8/LF-only tree: original vs. patched produce byte-identical stdout/exit code for all four scripts (diffed directly). Compiles clean (`py_compile`) on all four. SEPARATE, NEW finding surfaced by this audit, NOT a portability defect and not fixed here: none of the five S146–S150 scripts — including S146, already-fixed and untouched by this session — currently exit clean on the current tree; each compares against a frozen single-session hash ledger/`allowed_later` set last extended around S210–S218, while the corpus has had ~180 further legitimate sessions since (1,518/1,701 current lesson files hash-differ from the 1,129-file S146-era ledger alone — the same 1,129-vs-1,701 gap `CL-P0-027` already names). So the row's supporting claim "S146...passes 37/37" is no longer current-tree true; it wasn't falsified by this session, it expired from ordinary corpus growth. Current, actively-maintained gates remain independently green, re-verified fresh this session: `validate:content` 1840/1840, `lint:pedagogy` 1711/1711, `check:registration` consistent, `cml:lint:strict` 0/0. Recommend these five scripts be retired/archived rather than further patched for staleness (a different, larger body of work than portability); not decided here. |
```

---

## 3. Summary

| Row | Gate | Result | Content/tool edit | Staging records |
|---|---|---|---|---|
| CL-P1-044 | `npm run cml:lint:strict` | 0 errors, 0 warnings (current tree) | None — already fixed at S242, pre-dates this session | 0 (no content edit) |
| CL-P1-040 | `python3 scripts/audit/{affine-relationship-s147,exact-number-s148,geometric-constraint-s149,point-set-reasoning-s150}.py` | Portability bug confirmed + fixed in all 4; none exit clean (separate, pre-existing, non-portability staleness — see §2.5) | 4 files, `scripts/audit/*.py` only | 0 (tooling only, no lesson content edited) |

Supporting gates run fresh this session, all green: `npm run validate:content` (1840/1840),
`npm run lint:pedagogy` (1711/1711), `npm run check:registration` (consistent).

`reports/closure/cowork-staging/laneA-s329-CL1.jsonl` was not created (0 records — no lesson
content was edited by either fix).
