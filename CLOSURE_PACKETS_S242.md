# PILOT-01 · OPS-01..04 · EVID-01 — SPECIFICATION PACKETS

**Date:** 2026-08-15 · **Seal:** the commit that carries this file

These six packets are grouped because they share one property that separates them from everything
else worked in S242: **none of them can be closed by changing this repository alone.** Each needs a
credential this session does not hold, a party outside it, or learner data that does not exist yet.

That is not a reason to leave them undescribed. It is a reason to be exact about what the blocker is,
so nobody re-derives it. Where a packet has a portion that CAN be done here, that portion is named
and its state given honestly.

---

## PILOT-01 — certify 20–30 gold lesson families

**Blocker: none technical. This is the one packet here that is purely work, and it should not be
started yet.**

Certification means: for a lesson family, every step read by a human, every generated variant read at
several seeds, every distractor checked against a real misconception, illustrations verified, and the
whole thing walked on a phone. It is the acceptance test for the entire program.

**Why not now.** Four S242 findings each move the certification bar, and certifying against a bar
that is about to move wastes the most expensive activity in the plan:

| Finding | Where | Effect on a gold family |
|---|---|---|
| 2,230 instances / 591 graded steps leak the answer during work | `ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` | A family cannot be gold while its widget prints the answer |
| 1,078 withheld figures; 484 lessons render none | `VIS01_ILLUSTRATION_MEASUREMENT.md` | Gold implies the figure is there and matches |
| Lesson player consults zero persistent learner state | `ADAPT01_STATE_GAPS.md` | "Adaptive" cannot be certified where nothing adapts |
| No per-distractor misconception identifier | `GEN03_DISTRACTOR_CONTRACT.md` | Distractor validity is unverifiable, only plausible |

**Selection criterion, so the choice is not made by convenience.** Rank candidate families by
`centrality.mts` leverage × instance count, then require: zero R1/R2 rows in the reversible-play
index, zero withheld figures, a declared variant on every eligible step, and a pool measured above
the anti-repeat window in `GENERATOR_ANTI_REPEAT_AUDIT.csv`. Families meeting all four are the
candidate set; the count of families meeting them **today is not asserted here** because three of the
four indexes were built this session and none has been intersected with the others yet. That
intersection is the first task of the packet and it is cheap.

**Sequence:** ENG-01 R1 remediation → VIS-01 `count-on-hops` class (942 rows, 87.4% of the backlog) →
intersect the four indexes → certify.

---

## OPS-01 — transactional email

**Blocker: no provider credential, and no provider chosen.**

What exists: `src/lib/auth.ts` and the sync boundary assume an addressable account. What does not
exist: any send path. Nothing in this repo can be verified against a real inbox from here.

**What must be decided before code:** the provider, and whether email is required for the product's
first release at all. A learner-facing K–12 app has a real argument for deferring email entirely —
account recovery via a caregiver device is a weaker but simpler guarantee, and every address
collected from a child is a compliance surface.

**If it is built,** the shape that fits this codebase: a `MailTransport` interface beside
`ProgressStore`, one implementation per provider, a `MemoryTransport` for tests, and every template
rendered through the same `authoredMathParts` boundary so a lesson name containing `x^2` does not
reach an inbox as source. Deliverability (SPF/DKIM/DMARC) is a DNS task, not a code task, and belongs
in the deployment packet.

## OPS-02 — billing

**Blocker: no payment-provider credential. Also: the current state is a stub that must not be
mistaken for one.**

`Profile.premium` is documented in `progress.ts` as *"demo premium state — set by the stubbed
checkout, never by real billing"*. That comment is doing important work and should not be removed
before the real thing exists.

**The one thing worth stating now, because it is a design decision and not an integration detail:**
entitlement is currently merged "never revoke on a stale merge" in `mergeProfiles`. That rule is
correct for a demo and **wrong for real billing** — it makes a lapsed subscription unrecoverable from
any device that still holds a stale document. Real billing must make the SERVER the authority for
entitlement and the merge rule must stop having an opinion. This is a two-line change that is very
easy to forget and very expensive to find later.

## OPS-03 — durable sync

**Blocker: no server. This is the packet with the most already in place, and the least of it running.**

What exists and is real: `ProgressStore` as a DB-swappable boundary, `isSyncedProfile` as a validating
runtime boundary, `mergeProfiles` with per-field merge semantics (monotonic / evidence-weighted /
stateful / last-write-wins / entitlement), `lwwWinner`, and `autoSync`. S242 added `recentVariants` to
that set with a union merge. The merge rules are commutative and tested.

What does not exist: the durable store behind it. `LocalStore` is localStorage.

**What this session can say that is new:** the merge is now carrying a field whose correctness matters
across devices in a way none of the others do. `recentVariants` is the only field where a merge that
loses information produces a visibly worse learner experience rather than a stale number — a lost
fingerprint is a repeated question. The union rule handles it; the note is that a future server
implementation must not "optimise" it to last-write-wins.

**Acceptance for the packet:** two devices, offline edits on both, reconnect, and every merge rule
demonstrated to hold on real round-trips — not on the unit tests, which exercise the function and not
the transport.

## OPS-04 — LTI, observability, deployment

**Blocker: three different ones, and they should be three packets.**

- **LTI** needs an LMS to certify against. LTI 1.3 conformance is a certification programme, not a
  feature; without a target institution there is nothing to build toward.
- **Observability** needs a destination. There is a Sentry connector available to this session but no
  DSN for this project, and instrumenting against a DSN nobody will read is worse than nothing.
- **Deployment** is the one with no external blocker at all — the build passes and Vercel tooling is
  reachable. It is blocked only on the product decision of whether an app in this state should be
  publicly reachable. **Given the ENG-01 finding — 591 graded steps where the answer is visible while
  the learner works — the honest recommendation is no, not until that class is remediated.**

---

## EVID-01 — external efficacy pilot

**Blocker: it needs learners, an institution, and ethical review. It cannot be simulated, and an
efficacy claim without it is not a weak claim, it is not a claim.**

**What can be built here, and is the actual dependency:** the app currently cannot support a pilot
even if one were arranged, and the reason is `ADAPT01_STATE_GAPS.md` — the lesson player consults no
persistent learner state, so 1,701 lessons are served identically to every learner. A pilot needs a
per-learner record of what was served, what was answered, and what changed. S242's `recentVariants`
is the first field of that record and it exists for a different reason.

**Design, stated so it is not re-derived:**

- **Question.** Does mastery-based re-asking (a fresh variant rather than the remembered item) produce
  better retention at 4 weeks than re-asking the same item? That is the specific claim this
  codebase's whole architecture makes, and it is the one worth testing first.
- **Design.** Within-subject, concept-randomised: each learner gets fresh variants on half their
  concepts and repeated items on the other half, assigned by a seeded hash of (learner, conceptTag)
  so assignment is reproducible and balanced without a server-side randomiser.
- **Outcome.** Delayed post-test at 4 weeks on unseen items from both arms. Not in-app accuracy —
  in-app accuracy on the repeated arm measures memory of the item, which is the confound.
- **Instrumentation needed:** arm assignment, item-level served/answered log with variant
  fingerprint (the GEN-04 fingerprint is exactly this), and a post-test delivery surface.
- **What would falsify it:** no difference at 4 weeks, or the fresh-variant arm doing worse because
  variance in difficulty across draws swamps the retention effect. The second is a real risk and the
  band mechanism is what would have to control it.
- **Ethics and consent** are institutional and are not this repository's to design.

**Until this runs, the correct description of the product's efficacy claim is that it is a
well-motivated hypothesis with an architecture built to test it, and no evidence.** Every other
document in this program should be read as describing build quality, not learning outcomes.
