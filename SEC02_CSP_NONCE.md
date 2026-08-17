# SEC-02 — THE CSP NOW ADMITS WHAT NEXT.JS EMITS, AND THE BROWSER LAYER IS GREEN

**Evidence:** `src/middleware.ts`, `e2e/s242-csp.spec.ts`, `src/lib/securityHeaders.s242.test.ts` ·
**Date:** 2026-08-17 · **Supersedes:** `SEC02_CSP_BLOCKS_HYDRATION.md`

## 1. The decision, and why the config's objection did not survive contact with the route table

Three routes were on the table. The nonce was chosen.

`next.config.mjs` argued against it in writing: *"a nonce must be per-response, which defeats static
prerendering."* That is true, and it was worth checking what it actually costs. The build before
this change was **21 static (○) and 12 dynamic (ƒ)**, and the twelve dynamic ones were every core
learning surface — `/learn/[lessonId]`, `/practice/[chapterId]`, `/courses/[slug]`,
`/mastery/[conceptTag]`, `/basecamp/[courseId]`, `/trailhead`, `/placement`. The 21 static ones were
shells — `/`, `/dashboard`, `/review`, `/notebook`, `/account`, `/admin` — whose content is
client-rendered from localStorage on mount anyway. **The build is now 1 static and 60 dynamic**, and
the one is `/icon.svg`.

`'unsafe-inline'` is worse than it sounds. Browsers **ignore** `'unsafe-inline'` when a hash or a
nonce is present, so taking that route means deleting the hashes too, leaving
`script-src 'self' 'unsafe-inline'` — under which any injected inline script executes. That is the
entire protection the directive exists to give.

Scoping the strict policy to non-streaming routes fails on its own terms: the streaming routes ARE
the learning surfaces.

## 2. What was actually wrong

Hashes cover fixed strings. Next.js emits **fifteen inline scripts per page**, and thirteen of them
— React's streaming runtime (`$RB`, `$RV`, the `requestAnimationFrame` reveal shims) and the RSC
payload pushed as `self.__next_f.push([…])` — **depend on the page**. No static hash can name them.

The load-bearing line of the fix is not the nonce itself but where the policy is set:

```ts
requestHeaders.set("Content-Security-Policy", csp);   // Next reads this and stamps its OWN scripts
```

Next.js extracts the nonce from the **request** header. Set it only on the response and the two
scripts this repo writes run while the thirteen that matter stay blocked — which is the original bug
with extra steps. Measured on the production server: **41 of 41 script tags carry the nonce.**

## 3. Verified in a browser, on the production build, not from the configuration

| | before | after |
|---|---:|---:|
| chromium e2e assertions passing | 13 | **125** |
| …failing | 104 | **0** |
| player-state / player-viewport projects | — | **30 passing** |
| `<body>` on `/dashboard` | 14 elements, all `<script>` | 148 controls, 1,844 chars |
| CSP console violations across 4 routes | 13 per page | **0** |
| nonce reused between responses | n/a | **no** — asserted |

Twelve of the thirteen original "passes" were my own reflow assertions, vacuous against a blank
page. They are no longer vacuous, which is where the rest of this report comes from.

## 4. The dev/production split, stated rather than smuggled

`next dev` needs `'unsafe-eval'` for React Refresh and a websocket for HMR. `buildCsp(nonce, dev)`
takes `dev` as a **parameter** rather than reading `process.env` at module load, because under
vitest `NODE_ENV` is `"test"` — a captured constant would have tested the dev shape and reported it
as production. The unit test asserts both branches by name.

## 5. Two defects the CSP had been hiding

Neither is a CSP bug. Both were invisible for as long as no browser could render the app.

### `svg[aria-label="Number line"]` — a spec broken by an improvement

`e2e/s237-label-collision.spec.ts` was written 2026-08-12 against that exact label. On 2026-08-15
the graph-defect wave replaced it with a descriptive, stateful one — *"Number line from 0 to 60.
Start marked at 0. No hop made yet."* — which is better for a screen-reader user and fatal to an
exact-match selector. **The spec was silently unrunnable for three days, not passing.** Now matched
by prefix.

### `text-content-2` was a colour and a font size at once

`tailwind.config.ts` declared `content` and `content-2` in **both** `colors` and `fontSize`, so
`text-content-2` emitted two rules of equal specificity — a colour and `font-size: 1.125rem`. The
colour was never lost; the size was an ambush. The bottom tab bar asks for `text-[11px]` and painted
at 18px, which pushed **"More" 19 px past the right edge at 320 px with textScale xl** — a real
WCAG 1.4.4 + 1.4.10 failure, found by the reflow spec within a minute of the app first hydrating.

**The first count of the damage was wrong by 20×, and the screenshots are what caught it.** The
first pass counted every className naming the token *and* a size — 81 across 21 files — and called
them all overridden. Pixel-diffing before/after captures showed `/atlas` differing by **zero**
pixels and the 390 px pages differing only across y 784–839, which is the tab bar.

The missing model was CSS order. Equal specificity means the last rule wins, and Tailwind sorts
font-size utilities lexicographically by class suffix. From the built stylesheet:

```
.text-2xl  .text-3xl  .text-4xl  .text-[10px]  .text-[11px]  .text-[8px]  .text-[9px]  .text-base
──────────────────── `content` / `content-2` sorted in here ────────────────────
.text-display  .text-lg  .text-sm  .text-xl  .text-xs
```

`[` is 0x5B and `c` is 0x63, so every arbitrary size sorts before `content` and loses. `sm`, `xs`,
`lg`, `xl`, `display` sort after and were never touched — 77 of the 81 accused. **Five sites lost,
not eighty-one**: the tab bar's `text-[11px]`, two `text-2xl` stat numerals that painted at 16px
instead of 24px, and two `text-base` sites, one of which was already 1rem and never moved.

The fontSize keys are renamed to `body` / `body-lg`, which fixes the *class* of bug rather than its
five instances: there is no longer a second meaning for a `text-*` class to resolve to, whatever
anyone writes next. Six sites that were relying on the token for their size carry `text-body-lg`
explicitly and paint exactly as before.

## 6. And one measurement of mine that was wrong before the content was

`s242-reflow.spec.ts` failed six times on the same two elements:

```
span.trail-atmosphere__ridge--far   right=358 > 320
span.trail-atmosphere__ridge--near  right=346 > 320
```

Those are decorative ridge silhouettes in a `position: fixed; inset: 0; overflow: hidden;
pointer-events: none` container marked `aria-hidden="true"`, placed at `right: -8vw` **on purpose**.
Nothing is painted past 320 and the page does not scroll — the `scrollWidth` assertion, which is
1.4.10's actual mechanism, passed all six times. `getBoundingClientRect` reports the *unclipped*
border box and knows nothing about an ancestor's `overflow: hidden`, so the walk was calling
geometry the learner cannot see a reflow failure.

It now computes the intersection with every clipping ancestor. This is not a relaxation: an element
overflowing an *unclipped* ancestor still reports, and a clipping ancestor that itself overflows
still reports, because its own rect is intersected too. Only `hidden` and `clip` clip;
`auto`/`scroll` do not, because there the content is reachable by exactly the horizontal scroll
1.4.10 forbids.

## Gates

4 vitest shards green (5,642 / 4,354 / 2,469 / 1,463 + 1 skipped) · schema 1840/1840 ·
pedagogy 1711/1711 · registration consistent · `validate:native` 4 (the expected archive-only) ·
`npm run build` EXIT:0 · chromium e2e 125/125 · player projects 30/30.
