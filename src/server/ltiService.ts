/**
 * LTI 1.3 SERVICE — platform registration, OIDC login initiation, and launch
 * validation, with zero new dependencies.
 *
 * Scope honesty first (mirrored in INSTITUTIONS.md):
 *   IMPLEMENTED  third-party-initiated login, ResourceLinkRequest validation
 *                (RS256 via node:crypto, full claim checks, single-use nonce,
 *                jti replay refusal), teacher session minting, student
 *                content redirect, AGS score QUEUEING (lms_outbox).
 *   NOT HERE     deep linking, live AGS delivery (this deployment makes no
 *                outbound calls — the outbox worker is the seam), dynamic
 *                registration, jwks_uri refresh (keys are pasted at
 *                registration; rotation = re-paste).
 *
 * Identity stance: a launch asserting role teacher with a verified issuer
 * signature and an email claim maps to provisionAccount — same passwordless
 * path an admin invite uses. A STUDENT launch never creates an account:
 * children are not email accounts (001), so students are redirected to the
 * target lesson and the local-first engine simply works, anonymous to us.
 * Their institutional identity, if the district wants it, comes from
 * rostering — not from silently materializing accounts out of LMS claims.
 *
 * Every rejection returns a REASON CODE, not a boolean: when a district's
 * integration fails at 7:58am, "invalid-signature" vs "unknown-kid" vs
 * "nonce-replayed" is the difference between a five-minute fix and a day.
 */

import { createPublicKey, randomBytes, verify as cryptoVerify } from "node:crypto";
import type { DB } from "@/server/db";
import { audit, type SessionInfo } from "@/server/authService";
import { canAdminOrg, provisionAccount } from "@/server/institutionService";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;

const CLAIM = {
  messageType: "https://purl.imsglobal.org/spec/lti/claim/message_type",
  version: "https://purl.imsglobal.org/spec/lti/claim/version",
  deploymentId: "https://purl.imsglobal.org/spec/lti/claim/deployment_id",
  targetLink: "https://purl.imsglobal.org/spec/lti/claim/target_link_uri",
  resourceLink: "https://purl.imsglobal.org/spec/lti/claim/resource_link",
  roles: "https://purl.imsglobal.org/spec/lti/claim/roles",
  ags: "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
} as const;

// ── Registration ────────────────────────────────────────────────────────────

export function registerPlatform(
  db: DB,
  session: SessionInfo,
  orgId: string,
  input: { issuer: string; clientId: string; deploymentId: string; authLoginUrl: string; jwks: string }
): { platformId: string } | { error: "forbidden" | "bad-jwks" | "duplicate" } {
  if (!canAdminOrg(db, session, orgId)) return { error: "forbidden" };
  try {
    const parsed = JSON.parse(input.jwks) as { keys?: unknown };
    if (!Array.isArray(parsed.keys)) return { error: "bad-jwks" };
  } catch {
    return { error: "bad-jwks" };
  }
  const id = newId("ltip");
  try {
    db.prepare(
      "INSERT INTO lti_platforms (id, org_id, issuer, client_id, deployment_id, auth_login_url, jwks, created_at) VALUES (?,?,?,?,?,?,?,?)"
    ).run(id, orgId, input.issuer, input.clientId, input.deploymentId, input.authLoginUrl, input.jwks, nowIso());
  } catch (e) {
    if (e instanceof Error && /UNIQUE/.test(e.message)) return { error: "duplicate" };
    throw e;
  }
  audit(db, session.user.id, "lti-platform-registered", id);
  return { platformId: id };
}

export interface PlatformRow {
  id: string;
  orgId: string | null;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authLoginUrl: string;
}

export function platformsFor(db: DB, session: SessionInfo, orgId: string): PlatformRow[] | { error: "forbidden" } {
  if (!canAdminOrg(db, session, orgId)) return { error: "forbidden" };
  return db
    .prepare(
      "SELECT id, org_id AS orgId, issuer, client_id AS clientId, deployment_id AS deploymentId, auth_login_url AS authLoginUrl FROM lti_platforms WHERE org_id = ? ORDER BY issuer, client_id"
    )
    .all(orgId) as PlatformRow[];
}

// ── OIDC third-party-initiated login ────────────────────────────────────────

const NONCE_TTL_MS = 10 * 60 * 1000;

/** The platform POSTs {iss, login_hint, target_link_uri, ...} here; we answer
 * with a redirect to the platform's auth endpoint carrying our state+nonce.
 * The nonce is stored (prefixed) in lti_nonces so the launch can prove it was
 * OURS and consume it exactly once. State goes into a short-lived cookie by
 * the route; this function is pure over the db. */
export function buildLoginRedirect(
  db: DB,
  input: { iss: string; clientId?: string; loginHint: string; targetLinkUri: string; ltiMessageHint?: string }
): { redirectUrl: string; state: string } | { error: "unknown-platform" } {
  const platform = (
    input.clientId
      ? db.prepare("SELECT * FROM lti_platforms WHERE issuer = ? AND client_id = ?").get(input.iss, input.clientId)
      : db.prepare("SELECT * FROM lti_platforms WHERE issuer = ? ORDER BY created_at LIMIT 1").get(input.iss)
  ) as { client_id: string; auth_login_url: string } | undefined;
  if (!platform || !platform.auth_login_url) return { error: "unknown-platform" };
  const state = randomBytes(18).toString("base64url");
  const nonce = randomBytes(18).toString("base64url");
  const at = Date.now();
  db.prepare("INSERT INTO lti_nonces (jti, issuer, seen_at, expires_at) VALUES (?,?,?,?)").run(
    `nonce:${nonce}`,
    input.iss,
    new Date(at).toISOString(),
    new Date(at + NONCE_TTL_MS).toISOString()
  );
  const url = new URL(platform.auth_login_url);
  url.searchParams.set("scope", "openid");
  url.searchParams.set("response_type", "id_token");
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("prompt", "none");
  url.searchParams.set("client_id", platform.client_id);
  url.searchParams.set("redirect_uri", input.targetLinkUri);
  url.searchParams.set("login_hint", input.loginHint);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  if (input.ltiMessageHint) url.searchParams.set("lti_message_hint", input.ltiMessageHint);
  return { redirectUrl: url.toString(), state };
}

// ── Launch validation ───────────────────────────────────────────────────────

export type LaunchRejection =
  | "malformed-token"
  | "unknown-platform"
  | "unknown-kid"
  | "bad-algorithm"
  | "invalid-signature"
  | "expired"
  | "not-yet-valid"
  | "bad-audience"
  | "bad-nonce"
  | "nonce-replayed"
  | "jti-replayed"
  | "bad-deployment"
  | "bad-message-type";

export interface ValidatedLaunch {
  platformId: string;
  orgId: string | null;
  role: "teacher" | "student";
  email: string | null;
  name: string | null;
  subject: string;
  targetLink: string | null;
  resourceLinkId: string | null;
  agsEndpoint: string | null;
}

interface Jwk {
  kty: string;
  kid?: string;
  alg?: string;
  n?: string;
  e?: string;
}

const b64urlJson = (part: string): unknown => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

/** Validate an LTI 1.3 ResourceLinkRequest id_token end to end. */
export function validateLaunch(db: DB, idToken: string): ValidatedLaunch | { error: LaunchRejection } {
  const parts = idToken.split(".");
  if (parts.length !== 3) return { error: "malformed-token" };
  let header: { alg?: string; kid?: string };
  let payload: Record<string, unknown>;
  try {
    header = b64urlJson(parts[0]) as { alg?: string; kid?: string };
    payload = b64urlJson(parts[1]) as Record<string, unknown>;
  } catch {
    return { error: "malformed-token" };
  }
  if (header.alg !== "RS256") return { error: "bad-algorithm" };

  const iss = typeof payload.iss === "string" ? payload.iss : "";
  const audRaw = payload.aud;
  const audiences = typeof audRaw === "string" ? [audRaw] : Array.isArray(audRaw) ? audRaw.filter((a): a is string => typeof a === "string") : [];
  const platform = db
    .prepare("SELECT id, org_id, issuer, client_id, deployment_id, jwks FROM lti_platforms WHERE issuer = ?")
    .all(iss)
    .map((r) => r as { id: string; org_id: string | null; issuer: string; client_id: string; deployment_id: string; jwks: string })
    .find((p) => audiences.includes(p.client_id));
  if (!platform) return { error: audiences.length === 0 || !iss ? "malformed-token" : "unknown-platform" };
  // Multiple audiences: azp must name us (RFC 7519 §4.1.3 / LTI security).
  if (audiences.length > 1 && payload.azp !== platform.client_id) return { error: "bad-audience" };

  let keys: Jwk[];
  try {
    keys = ((JSON.parse(platform.jwks) as { keys?: Jwk[] }).keys ?? []).filter((k) => k.kty === "RSA");
  } catch {
    return { error: "unknown-kid" };
  }
  const jwk = header.kid ? keys.find((k) => k.kid === header.kid) : keys.length === 1 ? keys[0] : undefined;
  if (!jwk) return { error: "unknown-kid" };
  let verified = false;
  try {
    const key = createPublicKey({ key: jwk as unknown as Record<string, unknown>, format: "jwk" });
    verified = cryptoVerify(
      "RSA-SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`, "utf8"),
      key,
      Buffer.from(parts[2], "base64url")
    );
  } catch {
    return { error: "invalid-signature" };
  }
  if (!verified) return { error: "invalid-signature" };

  // Temporal claims (300s skew, the LTI conformance allowance).
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  const iat = typeof payload.iat === "number" ? payload.iat : 0;
  if (exp + 300 < now) return { error: "expired" };
  if (iat - 300 > now) return { error: "not-yet-valid" };

  // Nonce: must be one WE issued, consumed exactly once.
  const nonce = typeof payload.nonce === "string" ? payload.nonce : "";
  if (!nonce) return { error: "bad-nonce" };
  const consumed = db
    .prepare("DELETE FROM lti_nonces WHERE jti = ? AND issuer = ? AND expires_at >= ?")
    .run(`nonce:${nonce}`, iss, nowIso());
  if (consumed.changes === 0) return { error: "nonce-replayed" };

  // jti replay: each token id may be presented once, ever (within TTL).
  const jti = typeof payload.jti === "string" ? payload.jti : `${iss}:${nonce}`;
  try {
    db.prepare("INSERT INTO lti_nonces (jti, issuer, seen_at, expires_at) VALUES (?,?,?,?)").run(
      `jti:${jti}`,
      iss,
      nowIso(),
      new Date(Date.now() + 24 * 3600_000).toISOString()
    );
  } catch (e) {
    if (e instanceof Error && /UNIQUE/.test(e.message)) return { error: "jti-replayed" };
    throw e;
  }

  if (payload[CLAIM.deploymentId] !== platform.deployment_id) return { error: "bad-deployment" };
  if (payload[CLAIM.messageType] !== "LtiResourceLinkRequest" || payload[CLAIM.version] !== "1.3.0") {
    return { error: "bad-message-type" };
  }

  const roles = Array.isArray(payload[CLAIM.roles]) ? (payload[CLAIM.roles] as unknown[]).filter((r): r is string => typeof r === "string") : [];
  const isTeacher = roles.some((r) => /membership#Instructor|membership#Administrator|institution\/person#Instructor/i.test(r));
  const resourceLink = payload[CLAIM.resourceLink] as { id?: unknown } | undefined;
  const ags = payload[CLAIM.ags] as { lineitem?: unknown; lineitems?: unknown } | undefined;

  return {
    platformId: platform.id,
    orgId: platform.org_id,
    role: isTeacher ? "teacher" : "student",
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    subject: typeof payload.sub === "string" ? payload.sub : "",
    targetLink: typeof payload[CLAIM.targetLink] === "string" ? (payload[CLAIM.targetLink] as string) : null,
    resourceLinkId: typeof resourceLink?.id === "string" ? resourceLink.id : null,
    agsEndpoint:
      typeof ags?.lineitem === "string" ? ags.lineitem : typeof ags?.lineitems === "string" ? (ags.lineitems as string) : null
  };
}

/** A verified TEACHER launch becomes a session (passwordless provisioning if
 * the email is new). Students never get accounts from a launch — the caller
 * redirects them to the target content and local-first does the rest. */
export function teacherLaunchUser(db: DB, launch: ValidatedLaunch): { userId: string } | { error: "no-email" } {
  if (!launch.email) return { error: "no-email" };
  const { userId } = provisionAccount(db, "lti-launch", launch.email, "teacher");
  audit(db, userId, "lti-launch", launch.platformId);
  return { userId };
}
