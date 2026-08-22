/**
 * SCORE DELIVERY PROVIDER — the AGS grade-passback seam behind
 * assignmentService's `lms_outbox` queueing, lifted into an explicit,
 * env-selected interface (S331, CL-P1-019 prep).
 *
 * What the product needs from score delivery is exactly two things:
 *   enqueue()        — durably record that a score is owed to the LMS. Called
 *                      inside assignmentService's recompute transaction so a
 *                      completion and its queued score commit atomically.
 *   deliverPending() — drain the queue: attempt delivery of undelivered rows,
 *                      recording attempts / delivered_at / last_error per row.
 *
 * The DEFAULT provider is the current behavior, unchanged: queue only. This
 * deployment makes no outbound calls (mirrors mail_outbox's honesty — nothing
 * drains this yet), so `deliverPending()` reports what is pending and
 * delivers nothing, rather than pretending.
 *
 * Selection is by env var:
 *   SCORE_DELIVERY_PROVIDER=queue     (default) — QueueOnlyScoreProvider.
 *   SCORE_DELIVERY_PROVIDER=ags-live — documented stub: throws at selection
 *     time with the env vars a live AGS transport needs. Implementing it
 *     means: OAuth2 client-credentials against the platform's token endpoint
 *     (client-assertion JWT signed RS256 with the tool's private key, scope
 *     https://purl.imsglobal.org/spec/lti-ags/scope/score), then POST the
 *     payload to `${target}/scores` with content type
 *     application/vnd.ims.lis.v1.score+json, retrying with backoff and
 *     writing attempts/last_error/delivered_at back onto the row.
 *     See docs/PROVIDERS.md (CL-P1-019).
 */

import type { DB } from "@/server/db";

/** The AGS score payload shape assignmentService enqueues (LTI AGS §3.1 score publish). */
export interface AgsScorePayload {
  assignmentId: string;
  learnerId: string;
  resourceLinkId: string;
  scoreGiven: number | null;
  scoreMaximum: number;
  activityProgress: "Completed";
  gradingProgress: "FullyGraded";
  finishedAt: string | null;
}

export interface ScoreDeliveryReport {
  provider: string;
  /** Undelivered rows in lms_outbox after this run. */
  pending: number;
  delivered: number;
  failed: number;
  detail: string;
}

export interface ScoreDeliveryProvider {
  readonly name: string;
  /** Durably queue one score. `at` lets the caller stamp its transaction time. */
  enqueue(db: DB, target: string, payload: AgsScorePayload, at?: string): void;
  /** Attempt delivery of everything undelivered. Async because a real transport is. */
  deliverPending(db: DB): Promise<ScoreDeliveryReport>;
}

/** The current (and default) behavior, unchanged: queue durably, deliver nothing. */
export class QueueOnlyScoreProvider implements ScoreDeliveryProvider {
  readonly name = "queue";

  enqueue(db: DB, target: string, payload: AgsScorePayload, at: string = new Date().toISOString()): void {
    db.prepare("INSERT INTO lms_outbox (kind, target, payload, created_at) VALUES ('ags-score', ?, ?, ?)").run(
      target,
      JSON.stringify(payload),
      at
    );
  }

  async deliverPending(db: DB): Promise<ScoreDeliveryReport> {
    const row = db
      .prepare("SELECT COUNT(*) AS n FROM lms_outbox WHERE kind = 'ags-score' AND delivered_at IS NULL")
      .get() as { n: number };
    return {
      provider: this.name,
      pending: row.n,
      delivered: 0,
      failed: 0,
      detail: "queue-only provider: this deployment makes no outbound calls; rows remain queued for a real transport"
    };
  }
}

const AGS_ENV_VARS = "LTI_TOOL_PRIVATE_KEY, LTI_TOOL_KEY_ID, LTI_TOOL_CLIENT_ID, LTI_TOKEN_URL";

/**
 * Select a score-delivery provider by name (defaults to the SCORE_DELIVERY_PROVIDER
 * env var, then "queue"). The live branch is a documented stub that fails loudly.
 */
export function createScoreDeliveryProvider(
  name: string = process.env.SCORE_DELIVERY_PROVIDER ?? "queue"
): ScoreDeliveryProvider {
  switch (name) {
    case "queue":
      return new QueueOnlyScoreProvider();
    case "ags-live":
      throw new Error(
        `SCORE_DELIVERY_PROVIDER=ags-live is not configured in this build. Live AGS delivery requires ` +
          `${AGS_ENV_VARS} and an AgsLiveScoreProvider implementation in src/server/scoreDelivery.ts ` +
          `(OAuth2 client-credentials + POST to the line item's /scores endpoint, with per-row ` +
          `attempts/last_error/delivered_at bookkeeping). See docs/PROVIDERS.md (CL-P1-019).`
      );
    default:
      throw new Error(`Unknown SCORE_DELIVERY_PROVIDER "${name}" — valid values: queue (default), ags-live.`);
  }
}

export const scoreDeliveryProvider: ScoreDeliveryProvider = createScoreDeliveryProvider();
