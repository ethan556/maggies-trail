# HANDOVER → Session 215

Read `SESSION214_EXECUTION_REPORT.md`, `SESSION214_CONTENT_CHANGE_LEDGER.md`,
`SESSION214_FABLE_QA.md`, and `MASTERY_INTERACTION_CANDIDATES.json`.

## 0. State

Four MMIP engines on assembled seams. **Three lessons now carry causal interactions authored under
the program**: `se-01-03` (breakable systems, lines DRAGGABLE, Fable-QA 8.4), `tse-01-01`
(algebraTiles area — real rectangle, learner produces the partials), `pq-05-03` (rhombus
certification, unique forced solution). Content-change proof **812/812**; hash baseline
`SESSION210_LESSON_HASHES.json`, 1,701/1,701. Gates at seal: 315 files / 12,585 vitest ·
Playwright 115/115 · build 0. HS rich mix 23.8% (864/3,626).

## 1. Restart priorities

1. **Label each line with its equation** (systemsExplore). The one docking Fable-QA kept after the
   drag work: the lines are unlabelled and the surface speaks "rate/start" while the lesson thinks
   in equations — so graph and symbols are not yet visibly the same object. Small, and it lifts a
   shipping lesson again.
2. **Write the mobile axis's 0–3 level definitions.** No per-level rubric text exists anywhere for
   the mobile axis; a lift was proposed on measured evidence (systemsExplore 34.6 → 46.1 CSS px)
   and DECLINED for want of one. Write the definitions for all seven axes if cheap — then
   re-adjudicate systemsExplore with evidence already in hand. Do not lift any rating before the
   text exists.
3. **x²-tile control for algebraTiles.** Until it exists, distribute authoring is limited to the
   `a(x+b)` shape (a learner cannot produce an x² cell) and factor mode remains a display rather
   than a production task — it starts already filled. This is the gate on any `(x+a)(x+b)` lesson.
4. **Then the confirmed engine gaps (program §13).** Three adjudication sweeps now agree the pass
   rate is ~11–13% and both the 0%-rich and partially-rich buckets are saturated with legitimate
   non-novel drill. New engines are the only route that manufactures genuinely new candidates.
   Named targets already exist: `dr-04-02` (nested rule decomposition), `in-05-02` (u-substitution
   two-world), `dc-03-02` (error propagation), `dc-04-02` (growth race).
5. Do NOT force 25%. 43 conversions would reach it; the pool does not hold them, and forcing means
   shipping the decorative interaction the program forbids.

## 2. The one defect class this program keeps catching

Every rejection and every required fix across S213–S214 was **a surface asserting something false
of its own state**: a dashed box claiming to be a rectangle; a readout saying `0x + 0` over a mat
worth −3x−6; "four parts still empty" when six were; "together they are −8x − 8" for a build that
is not the target; "D is not at (5, 9)" printing the answer into the feedback for not having it.

**House rule, adopt it:** every authored or generated string gets a test that RENDERS THE STATE
which triggers it and checks the claim is true of that state — not merely that the string appears.
Two of the five above were reachable in one drag and no test caught them.

## 3. Process that is proven and should be kept

- **The implementor does not certify.** A fresh Fable-QA has now rejected one step outright and
  required fixes on three more, all of which passed every automated gate. Keep it FRESH each
  session (not the standing code reviewer), and give it the previous seal tarball so it can diff.
- **Refusals are deliverables.** S214's single refusal produced an engine-level finding
  (`vectorExplore` dot mode grades a quantity it does not teach, for any nonzero target).
- **An implementor may override the planner.** It happened this session and the implementor was
  right (a clamp would have leaked the answer). Packets should invite that, not foreclose it.
- **Build the engine to the standard BEFORE authoring content on it.** S213 authored first and lost
  the work; S214 rebuilt first and shipped.
- Single-writer locks; sequential widgets.tsx windows; ONE serialized gate chain; content
  authorization serialized in the planner, never in an implementor's window.

## 4. Traps

A: Playwright reuses the 3100 prod server. B: `variants.test.ts` and `content.widgets.audit.test.ts`
solo. C: foreground directory-batched vitest, dot reporter. D: servers resurrect — `fuser 3100/tcp`
to find/kill, require `Ready` + zero `EADDRINUSE` in the NEW server's log; a green curl proves
nothing. E: mtime churn lies — hash against the sealed tarball. F: a test can pin a true-at-the-time
FACT as an invariant — name the opted-in set explicitly so the next change is a deliberate edit.
G (new): a `str.replace` can silently no-op on an indentation mismatch and a `print` afterwards can
"confirm" nothing — assert on every scripted replacement.

## 5. Tripwires

`mmipTypes.ts` FROZEN. Content proof expects **812**. `systemsExploreEditErrors` is wired into
`widgetIntegrityErrors`; editable specs REQUIRE `degenerateSystemFeedback`. `console.error` trap is
opt-in over `src/lib/mmip/`, `src/components/widgets.mmip.`, `src/components/widgets.aria.` with an
EMPTY allowlist — verify a path clean before adding, never allowlist to pass. algebraTiles:
`frame-standing` refusal; mode-gated controls; `complete` means the mat holds EXACTLY the rectangle
(surplus is reported, never announced as the target); no framed readout may assert a mat value that
contradicts the frame. `signedSentence` duplicates `sentence` only because the latter is byte-frozen
by the 27-spec regression set — retire it when the classic readout is legitimately in scope.
Rating lifts: S205M rubric only, and the mobile axis has no rubric text yet.

## 6. Verification chain

Unchanged, with Trap D's fuser protocol. Expect vitest ~12.6k, content proof **812/812**, hash
1,701/1,701.
