# HANDOVER → Session 207

Written after sealing S206 from a clean fresh-extraction reprove. Every number below is
**[re-derived]** this session unless marked **[quoted]**.

---

## 0. What S206 actually did — a narrow, fully-verified slice, not the mandate's P0

The governing prompt (`S206_ENGINE_EXCELLENCE_PROMPT.md`, carried from S205) sets a broad P0:
platform foundations, answer-surface repair across all D/C-class engines, player hierarchy, mobile
reliability. **S206 shipped one coherent piece of that P0 — proved genuinely, end to end — rather
than touching many things shallowly:**

1. `mcq`, `numeric`, `fractionEntry` joined the programme's tone grammar (retry/reveal states now
   live on the object, not just the dock — see `widgets.tone.test.tsx`'s pinned rules).
2. `solveBalance`'s equation readout became term-addressable (§4.6 of the prompt — "manipulative
   and symbol are one state"): touch a term, the tiles it names ring; sweep a tile, its term rings
   back. Sentence text stays byte-identical to the S114 pins.

**Not started:** the MMIP platform layers (§3 — direct-manipulation layer, representation-sync
graph, equation morph engine, misconception→visual intervention, scaffold controller), the other
eleven §4 capabilities, and the P0 D/C-class repair sweep across the other five static answer
surfaces (`pointEntry`, `radicalCheck`, `subitizeFlash`) and eleven arrangement engines. Do not
read this session as having completed the mandate's P0 — it completed a verified fragment of it.

---

## 1. Landed and sealed

**Tarball** `maggies-trail-session-206.tar.gz`
**sha256** `a0a2fcb03d6aaa9feec00483ae23e6c6105ee25ac73afd28708773fd8b6a4769`

All gates green: typecheck 0 · validate:content 0 · lint:pedagogy 0 · check:registration 0 ·
check:engine-registration 0 · build 0 (57/57 static) · Playwright 115/115 · hash:proof 0
(1,701/1,701 lessons byte-identical) · fresh-extraction reprove clean (tsc 0, 945/945 targeted
vitest, hash-proof clean, file-manifest byte-identical to the working tree).

**No authored lesson content was changed.**

Full detail, including three documented honest corrections, is in `SESSION206_EXECUTION_REPORT.md`
at the tarball root. Read it before continuing — it contains operational fixes you will need
(below).

---

## 2. Two environment traps this session found and fixed — do not rediscover them

**Trap A — Playwright's `webServer` starts `next dev`, not `next start`.** `playwright.config.ts`
runs `npm run dev -- --hostname 127.0.0.1 --port 3100` with `reuseExistingServer: true` off-CI. If
you have already started a **production** server on a *different* port (e.g. 3000, to hand-verify
curl 200 per the standard gate-chain step) and then invoke `npx playwright test` without also
having a server live on **3100**, Playwright will spawn its own dev server — on a 1-core/4 GB box
this competes with whatever else is running, throws `[WebServer] approaching the used memory
threshold, restarting`, times out axe specs, and **overwrites your production `.next` build**
(dev and prod share the same `.next` directory; the dev compiler replaces prod's manifests).
**Fix:** before running Playwright, start `next start` yourself on **127.0.0.1:3100** (not 3000)
and confirm curl 200 there; then `npx playwright test` reuses it instead of spawning dev. Verified
this session: 115/115 passed once this was done correctly.

**Trap B — two full-suite vitest test files time out under `--maxWorkers=2` load on this box, and
it is not a regression.** `src/lib/variants.test.ts` (several `400`/`150`-seed generator sweeps,
each 5–8 s of real CPU work) and `src/lib/content.widgets.audit.test.ts` (a 95 s corpus-wide
solvability audit) both exceed vitest's default 5000 ms/60000 ms per-test timeout when the box is
under full-suite parallel load. **Both pass 100% when run solo** (`npx vitest run
src/lib/variants.test.ts` → 3,988/3,988; the audit file → 2/2), confirmed three times across three
separate full-suite runs this session with different exact failure-counts each time (7, then 5) —
that variability is itself the signature of contention, not a logic bug. Treat this the same way
the existing `KNOWN_ISSUES.md` treats the 76-test better-sqlite3 gap: **a named, solo-verified,
environment-class exception, not something to chase inside the test files.** Do not weaken these
tests' timeouts or assertions. If it bothers a future session, the honest fix is
`testTimeout` tuning in `vitest.config.ts` for these two files specifically, done deliberately with
a comment, not a silent bump.

**Also confirmed:** the standing "17 files / 76 tests always fail — better-sqlite3 bindings absent"
baseline from earlier HANDOVERs **did not reproduce this session** — `npm ci` produced working
native bindings in this container. Don't assume that baseline is present; check fresh.

---

## 3. Packaging — the session-numbered scripts don't fit anymore

`scripts/session/package-session.mjs` and `package-session-s201.mjs` hard-require dozens of
artifact filenames specific to the S126–S151 content-conversion campaign (variant sweeps,
adversarial mutation matrices, per-session `SOURCE_TRANSPILE_S*` files) and assert the working
directory's basename matches the session number exactly. Neither fits a small interaction-polish
session. S206 packaged by hand: `tar` with the same exclusion set those scripts use
(`node_modules`, `.next`, `.cml-build`, `coverage`, `test-results`, `playwright-report`, `.git`,
`*.tsbuildinfo`), verified by hash-proof + a file-manifest diff against a fresh extraction instead
of the legacy checklist. If a future session wants the old scripts working again, they need
generalizing away from the s126–s151 artifact list; that is itself a small, well-scoped task if
anyone wants it, but it was out of scope here.

**Also:** the working directory was `maggies-trail-session-202` on disk (inherited from a much
earlier extraction) despite containing S205Q content. It has been renamed to
`maggies-trail-session-206` to match the convention `HANDOVER.md` files assume
(`/home/claude/work/maggies-trail-session-[N]`). Confirm the directory name matches your session
number before you package, or the identity checks (where they still apply) will reject you.

---

## 4. Where the mandate stands — restart here

The full S206 prompt is unchanged and still governs. Priority order for S207, following its own
§12:

1. **P0 remainder — D-class answer surfaces.** `pointEntry`, `radicalCheck`, `subitizeFlash` have
   not received the tone-grammar treatment `mcq`/`numeric`/`fractionEntry` got this session. Same
   pattern: retry cue on the learner's own object, reveal ghost suppressed on match, accessible
   names pinned.
2. **P0 remainder — C-class arrangement engines.** `absValueLine`, `dragBucket`, `dragOrder`,
   `matchPairs`, `placeCompare`, `rationalCompare`, `steppedReveal`, `toggleExplore`,
   `fractionCompare`, `buildExpression`, `exactNumberLab`. Per the standing S205M rubric: lift the
   rating only where a **model** genuinely responds to the arrangement; where it doesn't, leave the
   rating alone — that may be the correct final state for some of these engines, not a gap.
3. **P0 — MMIP foundations.** Start the Direct Manipulation Layer and Representation
   Synchronization Graph (§3.1–3.2 of the prompt) under one flagship engine — solveBalance is now
   the furthest along (has the Spotlight) and the natural next target for full bidirectional
   editing (§4.1): let the learner drag a tile count, edit `st.leftX` directly, or type into the
   equation, and have every representation update together.
4. Everything else in the prompt's P1/P2 remains queued, unchanged.

**Carried from S205, still open, still not this session's work:** the eight engine gaps
(nested-rule decomposition, u-substitution two-world, error-propagation, growth-race,
movable-interval, motion-odometer, number-line ray, quotient mode); HS rich-mix at 23.7%, 62
insertions needed for 25%, `lf-02-01/i3` still the carried candidate; field calibration; no ESSA
tier.

---

## 5. Verification chain reminder (unchanged, re-confirmed this session)

`tsc → targeted vitest → full vitest (--maxWorkers=2, solo — meaning no other heavy job
concurrent, not "immune to internal contention", see Trap B) → validate:content → lint:pedagogy →
check-registration → check:engine-registration → build → next start on 127.0.0.1:3100 + curl 200
→ Playwright (reuses the 3100 server — see Trap A) → hash-proof → tar → fresh-extraction reprove
→ sha256 → present_files → HANDOVER.`

1-core / 4 GB box. Max two heavy jobs concurrent. `pkill -x next-server`, never `-f`. `setsid
bash -c '... < /dev/null > log 2>&1 &'`, polled in short separate calls — never compound launcher
and long sleep in one call. Summaries via `grep`, never `tail -3`.
