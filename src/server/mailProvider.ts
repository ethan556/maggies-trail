/**
 * MAIL PROVIDER — the delivery seam behind authService's `enqueueMail`,
 * lifted into an explicit, env-selected interface (S331, CL-P0-017 prep).
 *
 * The product's contract with mail is small: given a recipient, a purpose,
 * and a body, produce a delivery result. Everything authService needs is
 * `send()`. The DEFAULT provider is the exact behavior this repo has always
 * had — a durable row in `mail_outbox`, the inspectable truth of what a real
 * transport would send. Choosing it is not a mock: the flows are complete and
 * the outbox is drained (in a real deployment) by whatever transport exists.
 *
 * Selection is by env var:
 *   MAIL_PROVIDER=outbox   (default) — LocalOutboxMailProvider, no network.
 *   MAIL_PROVIDER=smtp     — documented stub: throws at selection time with
 *                            the exact env vars a real SMTP transport needs.
 *                            Implementing it means writing an SmtpMailProvider
 *                            here (node:net/tls or an approved SDK) that also
 *                            marks `mail_outbox.sent_at` — see docs/PROVIDERS.md.
 *
 * Synchronous by design: the local provider writes in the caller's
 * transaction, so a signup and its verification mail commit atomically. A
 * future network transport must NOT block auth flows — it should still write
 * the outbox row synchronously and drain it out-of-band (worker/cron), which
 * is why `send()` reports `queued`, not `delivered`.
 */

import type { DB } from "@/server/db";

export interface MailMessage {
  to: string;
  /** e.g. "verify-email" | "magic-link" | "password-reset" — free-form so new flows need no schema change. */
  purpose: string;
  body: string;
}

export interface MailDeliveryResult {
  provider: string;
  /** True when the message is durably recorded (outbox row written). */
  queued: boolean;
  /** True only when a real transport has handed it off. The local provider is honest: always false. */
  delivered: boolean;
  detail: string;
}

export interface MailProvider {
  readonly name: string;
  send(db: DB, msg: MailMessage): MailDeliveryResult;
}

/** The current (and default) behavior, unchanged: one row per message in `mail_outbox`. */
export class LocalOutboxMailProvider implements MailProvider {
  readonly name = "outbox";
  send(db: DB, msg: MailMessage): MailDeliveryResult {
    db.prepare("INSERT INTO mail_outbox (created_at, to_email, purpose, body) VALUES (?,?,?,?)").run(
      new Date().toISOString(),
      msg.to,
      msg.purpose,
      msg.body
    );
    return {
      provider: this.name,
      queued: true,
      delivered: false,
      detail: "written to mail_outbox; no transport is configured in this deployment"
    };
  }
}

const SMTP_ENV_VARS = "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM";

/**
 * Select a mail provider by name (defaults to the MAIL_PROVIDER env var, then "outbox").
 * Non-local providers are documented stubs: selecting one fails loudly at startup with
 * the env vars it requires, rather than silently pretending mail is delivered.
 */
export function createMailProvider(name: string = process.env.MAIL_PROVIDER ?? "outbox"): MailProvider {
  switch (name) {
    case "outbox":
      return new LocalOutboxMailProvider();
    case "smtp":
      throw new Error(
        `MAIL_PROVIDER=smtp is not configured in this build. A real SMTP transport requires ` +
          `${SMTP_ENV_VARS} and an SmtpMailProvider implementation in src/server/mailProvider.ts ` +
          `that drains mail_outbox (sets sent_at). See docs/PROVIDERS.md (CL-P0-017).`
      );
    default:
      throw new Error(`Unknown MAIL_PROVIDER "${name}" — valid values: outbox (default), smtp.`);
  }
}

export const mailProvider: MailProvider = createMailProvider();
