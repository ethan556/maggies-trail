# Session 222 — Closure Wave 02 execution report

**Date:** 2026-08-10
**GitHub baseline:** `main` at `68b5814f7dcd25562e879ecff64ea073647b2880` (`Maggie's Trail S221 closure baseline`)
**Live target:** `https://maggies-trail.vercel.app/`

## Outcome

Wave 02 automated premium-shell certification is complete. The live baseline returned 200 for all 90 required captures (15 surfaces × 3 viewports × 2 themes), with zero horizontal-overflow failures and visible desktop keyboard focus after three Tabs. Review of the captures found repeated undersized text-link targets. The repaired current-source production build then passed the same 90-capture matrix with a new release-failing 44×44 CSS-pixel touch-target gate: **90 captures, 0 failures**.

No file under `content/courses/**` changed. No curriculum mathematics, grading logic, lesson copy, or widget semantics changed.

## Deployment/build identity evidence

- GitHub `main` resolved to `68b5814f7dcd25562e879ecff64ea073647b2880` before work began.
- Live Vercel returned HTTP 200 and `x-vercel-id: cle1::2kh45-1786381261917-dc5cc6d4d121` during the audit.
- Live and the exact checkout used the same Next 15.5.23 shared asset identities, including `4bd1b696-f785427dddbba9fb.js`, `1255-a20f6c5e797a687b.js`, `2619-3c9e02e22d10480a.js`, `8682-f8e450931d68be11.js`, and `8099-e7871359edae8920.js`.
- Vercel does not expose the Git commit SHA in the public response, so this is strong build-family/current-source evidence, not a cryptographic deployment-attestation claim.

## Evidence-ranked defects

Score order is learner harm × frequency × visibility × strategic importance.

1. **P1 — undersized primary/secondary touch targets.** Repeated on account, family, placement, dashboard, onboarding, premium, profile, home, and Basecamp. Some controls were only 16–30px high; Basecamp exposed 22 sub-44px targets per touch capture. Fixed with 44px minimum interactive boxes without changing copy or information hierarchy.
2. **P1 — Windows case-collision blocked semantic typecheck.** `WorldPreferences.ts` and `WorldPreferences.tsx` made component imports resolve to the storage module on a case-insensitive filesystem. The presentation component now has the unambiguous name `WorldModePreferences.tsx`; the old ambiguous component file was removed.
3. **P2 — visual harness under-enforced target size.** It recorded only sub-24px controls and never failed the release. It now records sub-44px controls and fails touch captures when any are present.
4. **P2 — baseline test portability/release-integrity debt.** Full Vitest on Windows reports 17 failures: path-separator assumptions, temp-directory cleanup permissions, one world component import collision (fixed here), and several authored-set/evaluation expectations. These are recorded as open; they were not papered over as shell fixes.
5. **P1 security advisory — mitigated attack surface, dependency still flagged.** `npm audit --audit-level=high` reports Next → Sharp/libvips (2 high advisories). `images.unoptimized: true` and the only two `next/image` calls being explicitly unoptimized remove the optimizer input path, but the advisory remains open until the separately scoped Next 16 migration.

## Verification record

- Node `v24.15.0`; exact `npm ci`: PASS (514 packages).
- TypeScript semantic typecheck after fixes: PASS.
- Next 15.5.23 production build after fixes: PASS (warnings only).
- Current-source Playwright: **115/115 PASS**, including axe in both themes, forced-colors, keyboard focus, reduced motion, touch viewports, long-feedback containment, and overflow contracts.
- Repaired world-surface regression: **30/30 PASS**.
- Content schema: PASS.
- Pedagogy lint: PASS.
- Registration consistency: PASS.
- Live reduced-motion matrix: 90/90 HTTP 200, 0 overflow failures.
- Fixed-source sealed matrix: 90/90 PASS, including 44px touch targets and desktop keyboard probe.
- Full Vitest: **12,770 passed / 17 failed / 12,787 total**; not green, with failures retained in the closure ledger.
- Generated-state umbrella verifier: RED on current-main freshness/frozen-ledger behavior; verifier-written files were restored immediately.
- Installed-tree security audit: 0 critical, 2 high (Next/Sharp chain); runtime image optimizer disabled.

## Manual-gate boundary

Emulated touch, keyboard, color schemes, reduced motion, overflow, target size, and automated accessibility coverage are current. Real-device touch feel, NVDA/VoiceOver mathematical-state parity, physical 200% browser zoom, and normal-motion meaning review require human hardware/assistive-technology sessions and remain explicitly open.
