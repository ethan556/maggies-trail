# HANDOVER → Session 208

Written after sealing S207 from a clean fresh-extraction reprove. Started from the sealed S206
tarball (sha256 `83c2667dd28af7f0657efc875e55483b119ba18f01eea82c4408168290c119ab`).

---

## 0. What S207 did

`HANDOVER_S206.md` §4 set three restart priorities. S207 completed the first two and deliberately
stopped before the third:

1. **P0 remainder — D-class answer surfaces.** `pointEntry`, `radicalCheck`, `subitizeFlash` now
   carry the tone grammar (`mcq`/`numeric`/`fractionEntry`/`solveBalance` already had it). **Done.**
   All six of the S206 handover's named static answer surfaces now share one grammar.
2. **P0 remainder — C-class arrangement lift audit**, eleven engines against the S205M rubric.
   **Done — result is zero rating changes**, each with per-engine evidence in
   `SESSION207_EXECUTION_REPORT.md` §3, independently spot-checked this session against
   `scripts/engine-capabilities.json` (all eleven confirmed at `manip: 1`; `exactNumberLab`'s
   `manipByAnswerMode` note and its "33 tests" citation confirmed verbatim in the JSON). The
   honest routes to future lifts are feature routes (a responding model), not rating edits —
   `toggleExplore` gaining a circuit-trace model is the most concrete candidate named.
3. **P0 — MMIP foundations** (Direct Manipulation Layer / Representation Sync Graph, starting from
   `solveBalance` full bidirectional editing). **Not started.** This is the natural next session.

A separate mega-prompt was supplied this session proposing a nine-worker parallel visual campaign.
Most of its asks were already shipped in S206; its parallel structure doesn't fit this box. It was
collapsed into the existing serial queue above rather than run as written.

**No authored lesson content was changed** — verified by `hash:proof`, 1,701/1,701 lessons
byte-identical to `SESSION205_LESSON_HASHES.json`.

---

## 1. Landed and sealed

**Tarball** `maggies-trail-session-207.tar.gz`
**sha256** — see the end of this session's chat output / `present_files` result.

All gates green: typecheck 0 · full vitest 281 files / 11,928 tests, 0 failures (batched — see §3
below) · validate:content 1,840/1,840 · lint:pedagogy 1,711/1,711 · check:registration 0 ·
check:engine-registration 126/126 · build 0 (57/57 static) · Playwright 115/115 · hash:proof 0
(1,701/1,701 lessons byte-identical) · fresh-extraction reprove clean.

Full detail in `SESSION207_EXECUTION_REPORT.md` at the tarball root; content-change ledger in
`SESSION207_CONTENT_CHANGE_LEDGER.md`. Read both before continuing.

---

## 2. A genuinely unusual finding this session — read this before assuming continuity elsewhere

Partway into this session, `SESSION207_EXECUTION_REPORT.md` and
`SESSION207_CONTENT_CHANGE_LEDGER.md` were found **already present on disk**, with file mtimes
(15:2x) predating this session's own tool-call history by a wide margin, describing work — the
same three widgets, *plus* the C-class audit, *plus* a real cross-widget testid collision
(`sf-ghost` was already pinned to `SlopeFieldW`; the new subitizeFlash code originally reused it
and was renamed to `szf-ghost`/`szf-yours` before I ever saw the collision) — that matched the
current file state exactly. Every specific, checkable claim in that pre-existing report (the
eleven engines' exact `manip` ratings, `exactNumberLab`'s `manipByAnswerMode` structure and its
"33 tests" citation, the `szf-*` rename) was independently verified against the live repository
this session and found accurate. The report's own test-count claim (16) was the one error found —
corrected to the verified 15 in `SESSION207_EXECUTION_REPORT.md` §7.

**The practical upshot, not the mechanism:** treat any tarball's contents as authoritative over
any session's own narrated memory of what it did. Before writing a report or handover, `ls`/`grep`/
`view` what's actually on disk — including files you don't remember creating — before assuming you
know the full state. This is the same discipline `HANDOVER_S206.md` already asks for
("Background jobs die at turn boundaries — always verify what survived before resuming"); this
session is a data point that the reverse can also happen — more can survive than expected, from a
source that isn't fully legible from inside the conversation. Don't overwrite an existing report
file without reading it first.

---

## 3. Environment trap found this session — Trap C (background full-suite runs are unsafe here)

A single monolithic `npx vitest run --maxWorkers=2` launched via `setsid` in the background died
silently partway through, with no error in its log and no other command implicated (confirmed via
`dmesg`'s `random: crng reseeded due to virtual machine fork` entries lining up with the gap). This
sandbox forks/restores the underlying VM between some tool calls in a way that is fatal to
long-running unattended background jobs, even under `setsid`.

**Fix, confirmed this session:** don't background the full suite. Split it into 2–3
directory-scoped foreground `vitest run` calls with `--reporter=dot` (each comfortably under the
tool's own per-call time ceiling — a bare `--shard=1/10` of the full suite with the default
reporter *also* exceeded the ceiling, apparently from collection-phase overhead across the whole
corpus even when only running a fraction), then run the two Trap-B slow files
(`src/lib/variants.test.ts`, `src/lib/content.widgets.audit.test.ts`) solo. This covered all
~11,900 tests in four foreground calls, well under ten minutes total, no retries, no lost work.
Traps A and B from `HANDOVER_S206.md` §2 remain accurate and were re-confirmed this session
unchanged.

---

## 4. Where the mandate stands — restart here

Priority order for S208, continuing `HANDOVER_S206.md` §4's own sequence:

1. **P0 — MMIP foundations.** Start the Direct Manipulation Layer and Representation
   Synchronization Graph under `solveBalance`, which already has the term-addressable Spotlight
   from S206: let the learner drag a tile count, edit `st.leftX` directly, or type into the
   equation, with every representation updating together (§3.1–3.2 / §4.1 of the standing engine
   excellence prompt).
2. Everything else in the standing prompt's P1/P2 remains queued, unchanged.

**Carried from S205/S206, still open, still not touched this session:** the eight engine gaps
(nested-rule decomposition, u-substitution two-world, error-propagation, growth-race,
movable-interval, motion-odometer, number-line ray, quotient mode); HS rich-mix at 23.7%, 62
insertions needed for 25%, `lf-02-01/i3` still the carried candidate; S201 world-parity pass
(forced-colors, CPU-throttled performance specs); field calibration; no ESSA tier.

---

## 5. Verification chain reminder (unchanged from S206, Trap C addendum applied)

`tsc → targeted vitest → full vitest batched by directory with --reporter=dot (see Trap C, §3
above — do NOT background a monolithic run) → the two Trap-B slow files solo → validate:content →
lint:pedagogy → check-registration → check:engine-registration → build → next start on
127.0.0.1:3100 + curl 200 → Playwright (reuses the 3100 server — Trap A) → hash-proof → tar →
fresh-extraction reprove → sha256 → present_files → HANDOVER.`

1-core / 4 GB box. `pkill -x next-server`, never `-f`. Read what's on disk before writing a report
(§2 above).
