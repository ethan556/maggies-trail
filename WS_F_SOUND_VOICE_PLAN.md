# WS-F — Sound, Voice & Accessibility: Scoping Plan

Drafted 2026-08-14, Cowork session following S240. **Status: SCOPING ONLY — no code or content
changes in this pass. Every decision point below is OPEN; nothing here is pre-decided.**
`OPTIMIZATION_PLAN_V3.md` §WS-F (lines ~112-114) remains canonical. Companion scoping docs:
`WS_A_BRAND_PLAN.md`, `WS_H_LANDING_PLAN.md`, `WS_G_QA_FACTORIES_PLAN.md`,
`WS_E_PREDICTION_PURGE_PLAN.md`, and `WS_B_CMM_MOTION_PLAN.md` (written alongside this one).
Queue context: `HANDOVER_COWORK_S240.md` §3 names this workstream explicitly — "WS-F sound/voice
(untouched, no plan doc yet)" — carried verbatim from S238 §169 and S239 §95. This document is
that plan doc.

**The headline finding of this pass: WS-F is really two workstreams with opposite states of
existence, and the plan's one-paragraph framing hides that.** The *audio* half is genuinely
zero-state — there is not one sound asset, `Audio`/`AudioContext` call, or `.mp3/.wav/.ogg` file
anywhere in `src/` or `public/` (confirmed by direct grep and directory listing), no SFX system,
no recorded or neural voice, no captions. The *accessibility* half is substantially built and
gated already: a 148-case keyboard test suite, an axe-core e2e gate asserting zero
serious/critical violations across every learner-facing route, a forced-colors e2e suite, ~129
`aria-live` regions in `widgets.tsx` backed by a dedicated state-narration module
(`describeState.ts`), and reduced-motion support that honors both the OS setting and an in-app
profile toggle. And the one voice system that does exist — `src/lib/speech.ts`, the Web Speech
"robot voice" that Plan v3 Part 1.2 names as a *defect* — is a well-engineered opt-in system
whose plumbing (math-to-speech translation, cancel-on-change, narration-first composition)
survives any future voice-engine swap intact. Scoping WS-F as "build sound and voice from
nothing, plus do accessibility" would waste the second half and misjudge the third.

---

## 1. The bar — restated from `OPTIMIZATION_PLAN_V3.md`

SFX palette (12–18 sounds: place, snap, escalating corrects, gentle incorrect, XP tick, summit)
mixed low, toggleable; neural TTS or recorded VO for K–2 instruction strings; the DreamBox rule:
**muting sound never mutes instructions**; captions synced. Accessibility: full keyboard
operation of every converted widget (the interaction grammar's precision-fallback rule doubles
as the a11y path), state narration ("6 of 10 filled"), reduced-motion equivalents, AAA text
contrast via tokens. **Bar:** WCAG 2.2 AA minimum; keyboard-only completion of any lesson.
Context from Part 1.2: "Sound & voice: None. Browser TTS robot voice is the only audio.
(DreamBox: 4 human narrator voices, three audio channels, instructions never mutable.)"

---

## 2. Current state per sub-deliverable

### 2.1 SFX — zero-state, confirmed

No audio element, `new Audio`, `AudioContext`, `playSound`, or sfx identifier anywhere in `src/`
(grep: 0 hits). No audio file of any format in `public/` (contents: `assets/manipulatives/` PNG
art, `avatars/`, `brand/`, `icon.svg`, `manifest.webmanifest`, `notebook-index.json`). No audio
settings model, no channel concept, no mute state. Everything in the SFX deliverable is
greenfield — the only WS-F sub-item that genuinely is.

### 2.2 Voice — the "defect" is also the foundation

`src/lib/speech.ts` (+ `speech.test.ts`, and the narration block in `playerChrome.tsx:14-71`)
is the Web Speech implementation the plan calls the "robot `speechSynthesis` voice." Its design
constraints are documented in its own header and are exactly the ones any replacement needs:

- **Opt-in, never surprise** — narration is off until the learner enables it; the preference
  persists (`numera:narration:v1`); explicitly motivated by shared classroom devices.
- **Cancel-on-change** — advancing steps never stacks voices.
- **Grading-inert, SSR-safe, no-op when unsupported.**
- **`speakableMath()`** — a notation-to-speech translator (fractions "3 over 4", `= ?` as a
  blank, comparison operators, deliberate refusal to guess ambiguous symbols) that a neural/
  recorded voice pipeline would need identically.
- **`narrationFor()`** — authored `narration` string wins over `body`, widget prompt appended
  when it adds information a pre-reader would otherwise never hear.

**Authored narration coverage: 550 of the 1,701 lesson files carry `narration` strings (1,650
strings total)** — a real authored-content corpus, schema'd as an optional per-step field
(`schema.ts:9014`), aimed at the K–2 early profile per `speech.ts`'s header. What the plan asks
for — "neural TTS or recorded VO for K–2 instruction strings" — is therefore a **voice-source
swap plus a coverage audit**, not a narration-system build. Nothing resembling a neural-TTS
integration, an audio-file voice bank, or a recording pipeline exists. Note the plan §1.1's
"TTS on every step" strength-claim is about the read-aloud button (which falls back to
body/prompt), not authored narration coverage — the two shouldn't be conflated when auditing.

### 2.3 The channel rule — no architecture exists to even express it

"Muting sound never mutes instructions" presupposes ≥2 audio channels with independent controls
(DreamBox has three). Today there is exactly one audio-adjacent toggle (narration on/off) and no
sound to mute. The rule is thus a *design constraint on the future settings model* (§4 Phase 1),
not a fix to an existing violation. Getting this wrong early is expensive: if SFX ships first
with a single global "sound" toggle, that toggle's semantics become load-bearing before the
instruction channel exists.

### 2.4 Captions — zero-state

No caption/transcript rendering anywhere. Closest existing surface: narration text *is* the
on-screen step text in most cases (the K–2 player is text+speech of the same strings), which is
a genuine open question about what "captions synced" adds beyond highlighting-in-sync (§7 Q4).

### 2.5 Accessibility — substantially built; the gaps are specific, not general

- **Keyboard:** `widgets.keyboard.test.tsx` — 148 cases; the engine-registration contract
  includes a keyboard gate surface (S240 §2 lists it among the surfaces every new engine wires).
  **Gap:** these are per-widget unit tests; the plan's bar is *keyboard-only completion of any
  lesson* — no end-to-end keyboard-only lesson run exists in `e2e/`.
- **Automated audit:** `e2e/a11y.spec.ts` runs axe-core against the production build on every
  learner-facing route, asserting zero serious/critical violations (moderate/minor triaged via
  `KNOWN_ISSUES.md`). `e2e/forced-colors.spec.ts` covers forced-colors mode.
  `widgets.a11yAudit.s44.test.tsx` audits at the component level.
  **Gap:** axe covers WCAG 2.0/2.1-era automatable checks; the plan's bar is **WCAG 2.2** AA —
  the 2.2-new criteria (2.5.7 Dragging Movements, 2.5.8 Target Size Minimum, 2.4.11 Focus Not
  Obscured, 3.3.7 Redundant Entry…) are not explicitly gated anywhere, and 2.5.7 lands directly
  on WS-C's slider→drag conversions (every drag needs a non-drag equivalent — the grammar's
  precision-fallback rule, which must become a *checked* rule, not a stated one).
- **State narration:** `describeState.ts` + `describeWidgetState`/`actionsFor` consumed in
  `widgets.tsx`, with ~129 `aria-live` regions; widgetMorph's reduced-motion path hands each
  motion phase's *words* to the live region. The plan's '"6 of 10 filled"' ask exists as an
  architecture; per-engine completeness is unmeasured. **Gap:** no coverage metric says which of
  the 129 registered engines narrate fully.
- **Reduced motion:** end-to-end in the built parts — OS media query plus in-app toggle
  (`ProfileClient.tsx:429` → `data-reduce-motion`), `motion.ts` helpers, ~15 CSS gates,
  `mmipHarness.reducedMotionCheck`. Owned day-to-day by WS-B; WS-F verifies, doesn't rebuild.
- **AAA text contrast via tokens:** unverified — no contrast-ratio audit artifact exists in the
  repo; WS-A owns the token system this would be checked through.

---

## 3. The decisions this plan can't make for you

1. **Does the S240 asset-production ruling extend to audio?** (OPEN — the single biggest gate on
   this workstream.) `HANDOVER_COWORK_S240.md` §2.8 item 2 is a durable user ruling: no brand/
   avatar *art* beyond hand-authored vector geometry gets produced now — "wait and revisit,"
   with structure + spec + honest placeholder as the shipped fallback. SFX files and recorded/
   neural voice are the same class of externally-producible asset. If the ruling extends to
   audio, WS-F's audio half becomes architecture + spec + silent-but-wired placeholders
   (mirroring WS-J's `enabled: false` avatar pattern exactly); if not, an acquisition path must
   be chosen (§7 Q2). This plan must not assume either way.
2. **Voice technology choice.** (OPEN.) Neural TTS is a runtime network dependency (colliding
   with WS-H's offline/precache flank and the product's local-first architecture) or a
   pre-rendered-audio-files pipeline (1,650 strings × voices — an asset-production question,
   see item 1). Recorded human VO is squarely item 1. Staying with Web Speech but improving
   voice selection is the only zero-asset option and doesn't meet the plan's stated bar.
3. **Default sound state on shared/classroom devices.** (OPEN.) `speech.ts`'s own header treats
   un-gestured audio on classroom devices as hostile; whether SFX defaults on or off (and
   whether per-band defaults differ) is a product call with classroom consequences.

---

## 4. Phased implementation plan (proposal — Phases 2-4 gated on §3's rulings)

**Phase 1 — Audio architecture & settings model (spec + code, zero assets).** Design and build
the channel model before any sound exists: channels (`instruction` = narration/VO; `sfx` =
feedback/celebration; room for a third), independent per-channel toggles, the
instruction-never-muted-by-sfx-mute rule enforced structurally (the mute control simply cannot
reach the instruction channel — the same make-it-unrepresentable pattern as WS-J's
`defineAvatar()` hardcoding `enabled: false`), persistence alongside the existing narration
preference, migration of `numera:narration:v1` into it. Silent by construction; nothing
audible ships in this phase. Testable today without a single asset.

**Phase 2 — SFX palette spec + event map (asset production per §3 item 1).** The 12–18 sound
inventory as a spec document (sound ID, trigger event, mix level, max repetition rate, which
channel), the trigger map into existing events (evaluate results, morph completion, XP award,
summit — the event sites already exist and are enumerable), and the acquisition path per §3's
ruling. If assets are deferred: wire every trigger to the sound service with the registry
empty — the WS-J placeholder pattern, "correct, not a shortcoming."

**Phase 3 — Voice upgrade for K–2 (per §3 item 2).** Whatever the technology ruling, the work
decomposes the same way: (a) a narration-coverage audit — which early-band lessons lack
`narration` strings entirely (550/1,701 files have them; the K–2 band's exact denominator needs
measuring, and **authoring missing narration strings is a content change** — §5); (b) the voice
source behind the existing `speak()` seam, preserving opt-in/cancel-on-change/`speakableMath`;
(c) the instruction channel from Phase 1 as its home.

**Phase 4 — Captions.** Scope depends on §7 Q4's answer (sync-highlighting of on-screen text
vs. a separate caption surface for audio that has no visible text). Deliberately last of the
audio phases — it consumes Phase 3's output.

**Phase 5 — Accessibility gap-closure (independent of §3 — can start immediately).**
(a) A WCAG 2.2-delta audit against the 2.2-new criteria, with 2.5.7 Dragging Movements wired
into WS-C's conversion contract as a machine-checked rule (every drag engine demonstrates its
non-drag path — the keyboard gate surface already exists to hang this on); (b) an end-to-end
keyboard-only lesson-completion e2e (the plan's literal bar; currently only per-widget unit
coverage); (c) a state-narration coverage measure across the 129 engines (which narrate
mathematical state fully vs. partially vs. not); (d) the AAA-contrast token audit, coordinated
with WS-A's token reconciliation so it's checked once, in tokens, not per-screen.

**Phase 6 — Contract wiring.** Add the checkable outcomes to the manual gate sequence and
`PREMIUM_EXPERIENCE_CONTRACT.md` (keyboard e2e, 2.2-delta checks, channel-rule test, narration
coverage floor) — with WS-E's warning inherited: point each contract row at a metric that
measures the actual bar, not a convenient proxy.

---

## 5. Governance notes — what needs a human ruling

- **§3's three decisions** (audio-asset production path, voice technology, classroom defaults)
  are user rulings. Item 1 may already be answered by S240 §2.8 item 2's existing ruling — but
  *whether it extends to audio* is itself the question to ask, not to assume; that ruling's text
  says "art," and this plan does not stretch it.
- **Narration authoring is authored-content change.** Phase 3(a)'s gap-fill would add `narration`
  strings to lesson JSON — exactly the class of corpus-scale authored-content work WS-E §5's
  governance note covers: batch-level human checkpoints, not an unattended sweep. `CLAUDE.md`'s
  frozen-prose rules are scoped to the variant workstream, but the caution they encode applies;
  the per-batch-rulings pattern the user greenlit for WS-E Phase 2 (S240 §2.8 item 3) is the
  natural template.
- **Runtime network dependency** (if neural TTS is chosen): conflicts with the offline flank
  WS-H claims as a competitive moat; shipping one requires an explicit ruling that the tradeoff
  is intended, or a pre-render-to-files design that avoids it.
- **CI stays manual** (S240 §2.8 item 1, durable — do not re-ask): every new gate in Phase 6
  joins the manual sequence.
- **Never weaken the axe gate to admit new surfaces** — the same never-loosen rule `CLAUDE.md`
  states for content gates applies to `e2e/a11y.spec.ts`'s zero-serious/critical assertion.

---

## 6. Non-goals for WS-F

- **Motion and reduced-motion mechanics** — WS-B owns the motion system including its
  reduced-motion invariants; WS-F audits outcomes, doesn't rebuild the mechanism.
- **The keyboard operability of new drag substrates** — WS-C builds the precision-fallback path
  as part of each conversion (the grammar rule); WS-F specifies the check and verifies, it does
  not implement per-engine keyboard paths.
- **Music / ambient soundtrack** — nothing in the plan asks for it; the palette is feedback SFX
  only. Adding ambience would need its own ruling (attention cost in a reasoning product).
- **Landing-page audio** — none; WS-H's hero manipulative stays silent.
- **Editing any authored lesson prose** — Phase 3(a) *adds* narration strings under governance;
  nothing in WS-F edits existing authored text.
- **Avatar/mascot voice acting** — out of scope entirely; no workstream currently asks for it.

---

## 7. Open questions for whoever starts implementation

1. **§3 item 1** — does the S240 §2.8 art-production ruling extend to audio assets? Ask
   explicitly; the answer flips Phases 2-3 between "produce" and "spec + wired placeholders."
2. **If production is greenlit, by what path?** In-environment synthesis (WebAudio-generated
   SFX is technically feasible for UI sounds; voices are not), external commissioning, or
   licensed libraries — each has a different quality ceiling and licensing question the repo
   currently has no precedent for.
3. **Voice technology** (§3 item 2) — neural-runtime, pre-rendered files, recorded VO, or
   improved Web Speech — and which choice the offline flank can tolerate.
4. **What do "captions synced" add** over the existing text-on-screen-plus-speech design —
   word/phrase sync-highlighting for pre-readers, or a separate caption surface? Scope of
   Phase 4 swings widely on this.
5. **Classroom defaults** (§3 item 3) — SFX default state per band/device context.
6. **Is WCAG 2.2 AA the confirmed bar** (plan says 2.2; the current axe gate predates that
   target), and is AAA text contrast a hard requirement or aspiration? The plan's own wording
   splits them ("WCAG 2.2 AA minimum" vs. "AAA text contrast via tokens") — worth one explicit
   ruling so Phase 5(d) knows what failing means.
7. **Who owns the narration-coverage denominator** — is the authored-narration corpus meant to
   cover exactly the K–2/early-profile band (in which case measure that band's gap), or expand
   upward (a much bigger authoring program nothing in Plan v3 costs out)?
