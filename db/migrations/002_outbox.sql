-- 002_outbox.sql — the mail outbox: the DELIVERY seam made inspectable.
-- Every verification / magic-link / reset email the flows produce lands here
-- as a row (recipient, purpose, token URL). A real SMTP/SES Mailer drains it;
-- until then the flows are fully implemented and the outbox is the truth of
-- what WOULD have been sent — testable, auditable, never pretended.
CREATE TABLE mail_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  to_email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TEXT                        -- NULL until a real transport drains it
);
