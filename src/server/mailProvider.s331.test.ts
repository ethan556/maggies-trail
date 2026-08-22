/**
 * MAIL PROVIDER (s331, CL-P0-017 prep) — the interface contract and the
 * default provider, proven:
 *  · LocalOutboxMailProvider.send writes exactly the mail_outbox row
 *    enqueueMail always wrote (recipient, purpose, body, undrained), and its
 *    result is honest: queued, not delivered;
 *  · enqueueMail still produces that row (the refactor changed no behavior);
 *  · selection defaults to the outbox provider;
 *  · the smtp branch fails LOUDLY, naming every env var it requires, instead
 *    of silently pretending mail is delivered;
 *  · an unknown provider name is refused with the valid values.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { createMailProvider, LocalOutboxMailProvider, mailProvider } from "@/server/mailProvider";
import { enqueueMail } from "@/server/authService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-mailp-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const rows = () =>
  db.prepare("SELECT to_email, purpose, body, sent_at FROM mail_outbox ORDER BY id").all() as Array<{
    to_email: string;
    purpose: string;
    body: string;
    sent_at: string | null;
  }>;

describe("LocalOutboxMailProvider (the default = the current behavior)", () => {
  it("send() writes one durable mail_outbox row and reports queued-not-delivered", () => {
    const p = new LocalOutboxMailProvider();
    const res = p.send(db, { to: "parent@example.com", purpose: "verify-email", body: "Verify: /verify?token=abc" });
    expect(res.queued).toBe(true);
    expect(res.delivered).toBe(false); // honesty: nothing drains the outbox here
    expect(res.provider).toBe("outbox");
    expect(rows()).toEqual([
      { to_email: "parent@example.com", purpose: "verify-email", body: "Verify: /verify?token=abc", sent_at: null }
    ]);
  });

  it("enqueueMail (the call every auth flow uses) still writes the identical row", () => {
    enqueueMail(db, "reset@example.com", "password-reset", "Reset: /reset?token=xyz");
    expect(rows()).toEqual([
      { to_email: "reset@example.com", purpose: "password-reset", body: "Reset: /reset?token=xyz", sent_at: null }
    ]);
  });
});

describe("provider selection (MAIL_PROVIDER)", () => {
  it("defaults to the outbox provider, and the module-level instance IS that default", () => {
    expect(createMailProvider().name).toBe("outbox");
    expect(createMailProvider("outbox")).toBeInstanceOf(LocalOutboxMailProvider);
    expect(mailProvider.name).toBe("outbox");
  });

  it("smtp is a documented stub: throws naming every required env var", () => {
    expect(() => createMailProvider("smtp")).toThrowError(
      /SMTP_HOST.*SMTP_PORT.*SMTP_USER.*SMTP_PASS.*MAIL_FROM/s
    );
    expect(() => createMailProvider("smtp")).toThrowError(/not configured/);
  });

  it("refuses an unknown provider name, listing the valid values", () => {
    expect(() => createMailProvider("sendgrid")).toThrowError(/outbox.*smtp/s);
  });
});
