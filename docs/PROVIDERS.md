# PROVIDERS — the four infrastructure seams, and exactly what closes each ledger row

S331 scaffolding for the infrastructure-gated CLOSURE_LEDGER rows CL-P0-016 (billing),
CL-P0-017 (email), CL-P1-019 (LTI AGS delivery), CL-P0-020 (observability). None of these
rows can close without live accounts and secrets; what this scaffolding does is make each
one **a config-plus-implementation change behind a single seam** instead of an engineering
project across call sites.

The shape is the same for all four:

- A minimal typed provider interface capturing exactly what the product needs.
- The **default provider is the pre-existing behavior, unchanged** — demo checkout,
  `mail_outbox`, `lms_outbox` queueing, `console.error`. Selecting it is zero-config and
  zero-behavior-change; every existing flow routes through it now.
- Env-var selection. The non-local branch **throws at selection time** with a message
  naming every env var it requires — it never silently pretends.
- **No new npm dependencies were added.** The real-provider branches are documented stubs;
  whether a real implementation uses an SDK or raw HTTP is a decision for whoever holds
  the account.

Constraint inherited from the codebase: this deployment makes no outbound network calls.
Every "remaining to close" list below therefore includes standing up (or accepting) an
environment where outbound calls are allowed.

---

## Billing — CL-P0-016 (P0)

| | |
|---|---|
| Interface | `BillingProvider` in `src/lib/billing.ts` — `plans()`, `checkout()`, `verifyWebhook()`, `activate()`, `cancel()`, `entitlementFor()` |
| Default | `DemoBillingProvider` ("demo"): simulated checkout (delegates to `StripeStubProvider` in `src/lib/payments.ts`), client-side entitlement grant/revoke (`src/lib/entitlement.ts`), no webhooks |
| Selection | `NEXT_PUBLIC_BILLING_PROVIDER=demo\|stripe` (default `demo`) |
| Wired call site | `src/app/(shell)/premium/page.tsx` — checkout, plans, activate, cancel, entitlement read all go through `billingProvider` |
| Tests | `src/lib/billing.s331.test.ts`, `src/lib/entitlement.test.ts` |

**Remaining to close the row** (cannot be done in-repo; needs a real account):

1. A Stripe account (or equivalent processor), with products/prices mirroring the three
   plans (monthly / yearly / family).
2. Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `STRIPE_PRICE_FAMILY`.
3. Implementation: a server-side checkout-session route; a webhook route that verifies the
   signature over the raw body and writes entitlement to the **account row server-side**
   (the demo's client-side grant is the wrong trust boundary on purpose —
   `src/lib/entitlement.ts` documents this); renewal / cancellation / payment-failure
   lifecycle handling; `isPremium()` reading entitlement from the session, not local storage.
4. Then run: `npx vitest run src/lib/billing.s331.test.ts src/lib/entitlement.test.ts`
   plus new webhook-lifecycle tests (renewal, cancel, failure — the ledger row names these),
   and remove/flip the "Demo build — there is no real billing here" notice on the premium page.

## Email — CL-P0-017 (P0)

| | |
|---|---|
| Interface | `MailProvider` in `src/server/mailProvider.ts` — `send(db, {to, purpose, body}) → {queued, delivered, provider, detail}` |
| Default | `LocalOutboxMailProvider` ("outbox"): one durable row per message in `mail_outbox`, written synchronously in the caller's transaction; never claims delivery |
| Selection | `MAIL_PROVIDER=outbox\|smtp` (default `outbox`) |
| Wired call site | `enqueueMail()` in `src/server/authService.ts` (signup verification, magic links, password reset) |
| Tests | `src/server/mailProvider.s331.test.ts`, `src/server/authService.s43.test.ts` |

**Remaining to close the row:**

1. An SMTP/SES/transactional-mail account with a verified sending domain (SPF/DKIM).
2. Secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.
3. Implementation: an `SmtpMailProvider` in `src/server/mailProvider.ts`. Recommended
   shape: keep writing the outbox row synchronously (auth flows must not block on the
   network), drain it out-of-band, and set `mail_outbox.sent_at` on handoff — the schema
   column already exists for exactly this. Add bounce/complaint observability per the
   ledger row.
4. Then run: `npx vitest run src/server/mailProvider.s331.test.ts src/server/authService.s43.test.ts`
   plus a delivery e2e against a mail-capture sandbox (the row asks for delivery/retry/bounce
   evidence, not just unit tests).

## LTI AGS score delivery — CL-P1-019 (P1)

| | |
|---|---|
| Interface | `ScoreDeliveryProvider` in `src/server/scoreDelivery.ts` — `enqueue(db, target, payload, at)`, `deliverPending(db) → {pending, delivered, failed}` |
| Default | `QueueOnlyScoreProvider` ("queue"): identical `lms_outbox` INSERT the assignment recompute always did, inside the same transaction; `deliverPending` counts what is owed and delivers nothing |
| Selection | `SCORE_DELIVERY_PROVIDER=queue\|ags-live` (default `queue`) |
| Wired call site | `recomputeClassAssignments()` in `src/server/assignmentService.ts` (finish-transition on LTI-linked assignments) |
| Tests | `src/server/scoreDelivery.s331.test.ts`, `src/server/assignment.s113.test.ts`, `src/server/lti.s113.test.ts` |

**Remaining to close the row** (only if LTI remains a supported surface — the row's
closure condition is conditional):

1. A test LMS platform registration (e.g. Moodle/Canvas sandbox) with AGS enabled, and a
   tool keypair registered with it.
2. Secrets/config: `LTI_TOOL_PRIVATE_KEY`, `LTI_TOOL_KEY_ID`, `LTI_TOOL_CLIENT_ID`,
   `LTI_TOKEN_URL` (per-platform token endpoints can instead be stored on
   `lti_platforms` rows — decide at implementation time).
3. Implementation: an `AgsLiveScoreProvider` in `src/server/scoreDelivery.ts` —
   OAuth2 client-credentials with an RS256 client-assertion JWT
   (scope `https://purl.imsglobal.org/spec/lti-ags/scope/score`), POST the queued payload
   to `${target}/scores` as `application/vnd.ims.lis.v1.score+json`, with retry/backoff
   writing `attempts` / `last_error` / `delivered_at` back onto the row (columns exist),
   and a worker/cron entry point that calls `deliverPending`.
4. Then run: `npx vitest run src/server/scoreDelivery.s331.test.ts src/server/assignment.s113.test.ts src/server/lti.s113.test.ts`
   plus a signed end-to-end passback against the sandbox LMS.

## Observability — CL-P0-020 (P0)

| | |
|---|---|
| Interface | `TelemetryProvider` in `src/lib/telemetry.ts` — `captureError(error, context)`, `captureEvent(name, props)` |
| Default | `ConsoleTelemetryProvider` ("console"): errors to `console.error(label, error)` — byte-identical to the pre-seam route error boundary — events to `console.debug` |
| Selection | `NEXT_PUBLIC_TELEMETRY_PROVIDER=console\|sentry` (default `console`) |
| Wired call site | `src/app/error.tsx` (route error boundary, with the error digest in context) |
| Tests | `src/lib/telemetry.s331.test.ts` |

**Remaining to close the row:**

1. A Sentry (or equivalent) project/account.
2. Secrets/config: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`
   (plus an auth token in CI if source maps / release creation are wanted — the ledger row
   asks for release correlation and alerting, not just capture).
3. Implementation: a `SentryTelemetryProvider` in `src/lib/telemetry.ts` forwarding both
   calls with release/environment tags; consider also a `global-error.tsx` and server-side
   capture, since the current seam covers the route boundary only.
4. Then run: `npx vitest run src/lib/telemetry.s331.test.ts`, verify an intentionally
   thrown route error arrives in the backend with the release tag, and wire at least one
   alert rule (the row's closure condition names alerting).
