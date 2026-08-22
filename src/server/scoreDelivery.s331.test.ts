/**
 * SCORE DELIVERY PROVIDER (s331, CL-P1-019 prep) — the interface contract and
 * the default provider, proven:
 *  · QueueOnlyScoreProvider.enqueue writes exactly the lms_outbox row
 *    assignmentService always wrote ('ags-score', target, JSON payload, the
 *    caller's timestamp, zero attempts, undelivered);
 *  · deliverPending is honest: it counts what is owed and delivers NOTHING
 *    (this deployment makes no outbound calls), and delivered rows leave the
 *    pending count;
 *  · selection defaults to the queue-only provider;
 *  · the ags-live branch fails LOUDLY, naming every env var it requires;
 *  · an unknown provider name is refused with the valid values.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import {
  createScoreDeliveryProvider,
  QueueOnlyScoreProvider,
  scoreDeliveryProvider,
  type AgsScorePayload
} from "@/server/scoreDelivery";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-scorep-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const PAYLOAD: AgsScorePayload = {
  assignmentId: "a_1",
  learnerId: "k_1",
  resourceLinkId: "rl-42",
  scoreGiven: 8.5,
  scoreMaximum: 10,
  activityProgress: "Completed",
  gradingProgress: "FullyGraded",
  finishedAt: "2026-08-22T00:00:00.000Z"
};

describe("QueueOnlyScoreProvider (the default = the current behavior)", () => {
  it("enqueue() writes the identical lms_outbox row the inline INSERT wrote", () => {
    const p = new QueueOnlyScoreProvider();
    p.enqueue(db, "https://lms.example/li/7", PAYLOAD, "2026-08-22T01:02:03.000Z");
    const rows = db
      .prepare("SELECT kind, target, payload, created_at, attempts, delivered_at, last_error FROM lms_outbox")
      .all();
    expect(rows).toEqual([
      {
        kind: "ags-score",
        target: "https://lms.example/li/7",
        payload: JSON.stringify(PAYLOAD),
        created_at: "2026-08-22T01:02:03.000Z",
        attempts: 0,
        delivered_at: null,
        last_error: null
      }
    ]);
  });

  it("deliverPending() reports what is owed and delivers nothing — honestly", async () => {
    const p = new QueueOnlyScoreProvider();
    p.enqueue(db, "https://lms.example/li/7", PAYLOAD);
    p.enqueue(db, "https://lms.example/li/8", PAYLOAD);
    const report = await p.deliverPending(db);
    expect(report).toMatchObject({ provider: "queue", pending: 2, delivered: 0, failed: 0 });
    // Rows a real transport HAS delivered stop counting as pending.
    db.prepare("UPDATE lms_outbox SET delivered_at = ? WHERE target = ?").run(
      "2026-08-22T02:00:00.000Z",
      "https://lms.example/li/7"
    );
    expect((await p.deliverPending(db)).pending).toBe(1);
  });
});

describe("provider selection (SCORE_DELIVERY_PROVIDER)", () => {
  it("defaults to the queue-only provider, and the module-level instance IS that default", () => {
    expect(createScoreDeliveryProvider().name).toBe("queue");
    expect(createScoreDeliveryProvider("queue")).toBeInstanceOf(QueueOnlyScoreProvider);
    expect(scoreDeliveryProvider.name).toBe("queue");
  });

  it("ags-live is a documented stub: throws naming every required env var", () => {
    expect(() => createScoreDeliveryProvider("ags-live")).toThrowError(
      /LTI_TOOL_PRIVATE_KEY.*LTI_TOOL_KEY_ID.*LTI_TOOL_CLIENT_ID.*LTI_TOKEN_URL/s
    );
    expect(() => createScoreDeliveryProvider("ags-live")).toThrowError(/not configured/);
  });

  it("refuses an unknown provider name, listing the valid values", () => {
    expect(() => createScoreDeliveryProvider("webhook")).toThrowError(/queue.*ags-live/s);
  });
});
