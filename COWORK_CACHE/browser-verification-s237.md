# S237 — browser verification finally ran, and found a real defect

**Work Package 1's stated exit condition has never been met in any Cowork session.** Every piece of
evidence to date — three sessions of it — has been source, printed output and jsdom. Project memory
records the Playwright suite as unrunnable in these sandboxes: "no browser binaries and the
download host is outside the allowlist".

**That is no longer true, and it cost one command to find out.** This container ships Chromium at
`/opt/pw-browsers` with `PLAYWRIGHT_BROWSERS_PATH` already set, and `playwright.config.ts` already
honours a `PW_CHROMIUM_EXE` override.

## Result

**85 passed, 2 failed.**

The 2 failures are the same finding in light and dark: a **serious WCAG colour-contrast violation
on `.bg-sky`**, on `/`.

## How to run it

The first attempt failed misleadingly and the reason is worth recording. Against the config's own
`webServer` (`next dev`), two of three smoke tests timed out at 30s on `page.goto` — Next compiles
each route on first request, and on this 2-core box `/dashboard` and `/learn/[lessonId]` exceed the
timeout. The one that passed was an API route, which compiles cheaply. **Those were not product
defects**, and reading them as such would have burned a session — the same shape as Trap B.

Run against a production server instead. It is faster, and it is what a learner actually gets:

```bash
npm run build
npx next start -H 127.0.0.1 -p 3100 &
PW_BASE_URL=http://127.0.0.1:3100 \
PW_CHROMIUM_EXE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  npx playwright test --project=chromium
```

`--project=player-phone-390 | player-tablet-768 | player-state-desktop` cover the 390/768/1440
matrix WP1 asks for; the config already defines them.

## The defect

`#2E7CD6` (`sky`) under white text measures **4.23:1**. AA requires **4.5:1** for normal text. The
node axe names is `.bg-sky`, reached on `/` through `HeroWidget`'s CTA — `bg-sky text-white
text-sm font-extrabold`. 14px bold does not qualify for the 3:1 large-text allowance.

**It is not one button.** `AssignmentsCard`, `ReportIssue` and `HeroWidget` all pair `bg-sky` with
`text-white`. Those pages passed axe only because the control was not rendered in the state the
test visited. The token is the defect; the landing hero is just where it happened to be caught.

### Why I did not fix it

Every obvious fix is worse than the finding:

- **Darkening the `sky` token** is the correct systemic answer — `#1F5FA8` gives 6.44:1 — but
  `#2E7CD6` is also written as a literal in `widgets.tsx` SVG strokes and pinned by two tests
  (`widgets.enrich.tone`, `widgets.fractionEntry`). Changing the Tailwind token alone would split
  the palette from the SVGs and break the "same entity keeps its colour everywhere" rule that
  `verify:instructional-colors` exists to enforce. Doing it properly means changing the brand
  colour everywhere at once.
- **Using `bg-sky-ink`** looks right in light mode (`#2069BF`, 5.48:1) but `--sky-ink` **flips** in
  dark mode to `#70A5E3`, which under white text is far worse. That flip is also why the violation
  reports in both themes while `sky` itself does not change.
- **Enlarging the CTA text** to claim the 3:1 large-text allowance needs ≥18.66px bold. The button
  is 14px; making it 19px to satisfy a contrast rule is tail-wagging.

This is a brand-palette decision with app-wide blast radius, so it is recorded rather than taken.

**Recommendation:** darken `sky` to `#1F5FA8` (6.44:1) in one change that updates the Tailwind
token, the hardcoded SVG literals, and the two pinning tests together — then re-run axe on `/` in
both themes to confirm, and the instructional-colour gate to confirm the palette stayed coherent.

## A side effect worth knowing about — Trap K has a sibling

`e2e/wave04-math-rendering.spec.ts` calls `page.screenshot({ path: "WAVE04_SCREENSHOTS/..." })`.
It is a CAPTURE spec, not a comparison one, so running the browser suite **overwrites two tracked
PNGs in a sealed wave-evidence folder** with output from the current build. Same class as the
Vitest suite rewriting `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`: a test mutating tracked evidence as a
side effect.

They were restored with `git checkout -- WAVE04_SCREENSHOTS/` here. **Run `git status` after every
browser run as well as after every Vitest run**, and if S237 wants its own captures they belong in
an S237 folder, not on top of WAVE04's.

## What this does not close

WP1's exit condition asks for the changed engine families at 390/768/1440 in light and dark, in
their active and retry states. This run proves the harness works and covers the page-level axe
sweep. The per-engine viewport matrix is the next batch, and it is now unblocked.
