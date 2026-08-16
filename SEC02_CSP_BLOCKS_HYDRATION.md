# THE APP DOES NOT HYDRATE UNDER ITS OWN CONTENT SECURITY POLICY

**Evidence:** `e2e/s242-reflow.spec.ts` (§ *the app hydrates*) · **Date:** 2026-08-16
**Status: this e2e gate is RED, deliberately. The batch below did not land clean and I am not
claiming it did.**

## What I set out to do

`ACC01_ACCESSIBILITY_MATRIX.md` §8 items 2 and 4 name what a source-only audit could not settle: no
measured pixel sizes, *"no confirmation that `textScale: xl` does not overlap anything at 320px; no
200% browser-zoom reflow test, which is the actual 1.4.4 AA mechanism"*, and no keyboard walk.

The repo does have e2e — axe across 24 routes in both themes, viewport specs, forced-colors. But
measured against the config, **the narrowest viewport anything runs at is 360px**, and no spec zooms.
1.4.10 Reflow is specified at **320**. So: a reflow spec at 320, at 320 with the largest text scale,
and a keyboard walk verifying the focus ring I fixed at `f24bfc6`.

## What actually happened

**The reflow spec passed on its first run, and it was passing because nothing renders.**

`document.querySelectorAll("body *")` returns **14 elements on `/dashboard`, and every one is a
`<script>`**. A layout with no boxes cannot overflow, so "no horizontal scrolling at 320px" was true
and meaningless. Twelve green assertions, measuring nothing.

**The keyboard walk is what caught it.** Its paired-acceptance guard — `expect(stops).toBeGreaterThan(3)`,
there so a page that focuses nothing cannot pass silently — failed with `Received: 0`. Chasing that
produced the console line:

```
Refused to execute inline script because it violates the following Content Security Policy
directive: "script-src 'self' 'sha256-9r4UfGgq…' 'sha256-7Yd61Ocs…'"
```

## The defect

`next.config.mjs` allows exactly two inline scripts by SHA-256 hash — `themeInit` and `motionInit` —
and that part works exactly as designed. But Next.js serves **15 inline scripts per page and 13 of
them are not in the list**:

```
sha256-7mu4H06fwDCjmnxxr/xNHyuQC6pLTHr4M2E4jXw5WZs=  ← requestAnimationFrame(function(){$RT=performance.now()});
sha256-QAlSewaQLi/NPCznjAZSyvQ72heD0VdxmNDDkZeCxgc=  ← $RB=[];$RV=function(a){…
sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=  ← (self.__next_f=self.__next_f||[]).push([0])
sha256-M+9XGoxHJ9VOgpXKtBu5PXw73+qCNO+WOcoHL3T6Xcc=  ← self.__next_f.push([1,"1:\"$Sreact.fragment\"…
… 9 more, all RSC payload chunks
```

React's streaming runtime and the RSC payload. **They are per-page and content-dependent, so they
cannot appear in a static hash list.** Hydration never runs: the server sends 385 KB of correct HTML
and the browser shows an application that never starts.

`headers()` carries no environment guard, so this applies in `next start` **and** `next dev`.

## Why nothing caught it

`securityHeaders.s242.test.ts` verifies the two hashes are not stale, and it is right that they
aren't. It also says, in its own header:

> **DELIBERATELY NOT ASSERTED HERE:** That the headers actually arrive on an HTTP response. That
> needs a running server and belongs in the e2e layer; this file proves the configuration is
> **correct and internally consistent**.

Correct and internally consistent, and the app is blank. The e2e layer then never asserted that a
page becomes interactive — **and an axe sweep of a page with no content finds zero violations and
passes**. Two green gates, one on each side of the gap.

The earlier `smoke.spec.ts` failures in this container (2 of 3, on `page.goto` timeouts) are the same
symptom read as flakiness.

## What I did not do, and why

**I did not change the CSP.** A Content-Security-Policy is a security control, and the three ways out
are a genuine architectural trade-off the owner should make, not a patch:

| route | cost |
|---|---|
| Per-request nonce via middleware | The config rejects this **on purpose** — a nonce must vary per response, forcing every currently-static route to render dynamically |
| `'unsafe-inline'` on `script-src` | Gives up the exact property the hashes were bought with |
| Strict policy only on non-streaming routes | Keeps the strong policy where it is affordable; needs a per-route header map |

What I did land is the gate that states the requirement: **`/`, `/dashboard` and `/learn/as100-01-01`
must render more than 20 non-`<script>` elements and more than 3 focusable controls, with no CSP
console error.** It fails today on all three. It will pass the moment the policy admits what the
framework emits.

## Consequences for this wave

- **The 320px reflow measurements do not stand.** They are committed, and they will become real the
  moment hydration works — but today they measure an empty page and I am not reporting them as a
  result.
- **The keyboard walk was removed rather than shipped.** It could not measure anything, and a
  keyboard gate that focuses nothing is worse than no gate.
- **ACC-01 §8 items 2 and 4 remain open**, now with a named blocker rather than "needs a browser".

## Gate results, stated plainly

`npm run typecheck` clean · `npx eslint e2e/s242-reflow.spec.ts` clean · the vitest suite is
untouched by this packet (no `src/` change) · **`npx playwright test e2e/s242-reflow.spec.ts` — 12
passed, 3 failed.** The three failures are the finding.
