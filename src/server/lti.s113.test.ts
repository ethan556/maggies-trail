/**
 * LTI 1.3 (s113) — registration authz, OIDC login initiation, and end-to-end
 * launch validation signed with a real RSA key, plus every rejection path.
 *
 * The token is signed here with node:crypto and verified by the service with
 * the platform's pasted JWKS, so these tests exercise the actual signature
 * path — not a mock. Each failure asserts a REASON CODE, because that is the
 * contract the routes and a 7:58am district integration depend on.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateKeyPairSync, sign as cryptoSign, type KeyObject } from "node:crypto";
import { migrate, openDb, purgeExpired, type DB } from "@/server/db";
import { createLoginSession, login, sessionFor, signup, type SessionInfo } from "@/server/authService";
import { createDistrict } from "@/server/institutionService";
import {
  buildLoginRedirect,
  platformsFor,
  registerPlatform,
  teacherLaunchUser,
  validateLaunch,
  type ValidatedLaunch
} from "@/server/ltiService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-lti-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function account(email: string): SessionInfo {
  signup(db, email, "pw-one-two", "parent");
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  return sessionFor(db, r.token)!;
}
function platformAdmin(email: string): SessionInfo {
  const s = account(email);
  db.prepare("UPDATE users SET role = 'platform-admin' WHERE id = ?").run(s.user.id);
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  return sessionFor(db, r.token)!;
}

// ── A real RSA key, exported as a JWKS the way an LMS admin would paste it ────
const KID = "test-key-1";
const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = { ...(pair.publicKey.export({ format: "jwk" }) as Record<string, unknown>), kid: KID, alg: "RS256", use: "sig" };
const JWKS = JSON.stringify({ keys: [publicJwk] });

const ISS = "https://lms.tallypeak.test";
const CLIENT_ID = "client-abc";
const DEPLOYMENT = "deploy-1";
const b64url = (o: unknown): string => Buffer.from(JSON.stringify(o)).toString("base64url");

const C = {
  messageType: "https://purl.imsglobal.org/spec/lti/claim/message_type",
  version: "https://purl.imsglobal.org/spec/lti/claim/version",
  deploymentId: "https://purl.imsglobal.org/spec/lti/claim/deployment_id",
  targetLink: "https://purl.imsglobal.org/spec/lti/claim/target_link_uri",
  resourceLink: "https://purl.imsglobal.org/spec/lti/claim/resource_link",
  roles: "https://purl.imsglobal.org/spec/lti/claim/roles",
  ags: "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
};
const TEACHER_ROLE = "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor";
const STUDENT_ROLE = "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner";

function baseClaims(nonce: string, over: Record<string, unknown> = {}): Record<string, unknown> {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: ISS,
    aud: CLIENT_ID,
    sub: "lms-user-778",
    exp: now + 300,
    iat: now - 5,
    nonce,
    jti: `tok-${nonce}`,
    email: "teacher@tallypeak.org",
    name: "Jordan Rivera",
    [C.messageType]: "LtiResourceLinkRequest",
    [C.version]: "1.3.0",
    [C.deploymentId]: DEPLOYMENT,
    [C.targetLink]: "https://maggie.test/learn/fractions",
    [C.resourceLink]: { id: "rl-42" },
    [C.roles]: [TEACHER_ROLE],
    [C.ags]: { lineitem: "https://lms.tallypeak.test/ags/li/42" },
    ...over
  };
}

/** Sign with the real key unless a foreign key is supplied (bad-signature). */
function idToken(claims: Record<string, unknown>, opts: { header?: Record<string, unknown>; key?: KeyObject } = {}): string {
  const header = { alg: "RS256", kid: KID, typ: "JWT", ...opts.header };
  const signingInput = `${b64url(header)}.${b64url(claims)}`;
  const sig = cryptoSign("RSA-SHA256", Buffer.from(signingInput), opts.key ?? pair.privateKey).toString("base64url");
  return `${signingInput}.${sig}`;
}

/** Register the standard platform and return its org + a fresh, live nonce
 * (minted the real way, through buildLoginRedirect). */
function setup(): { orgId: string; admin: SessionInfo } {
  const op = platformAdmin("op@example.com");
  const d = createDistrict(db, op, "Tally Peak USD");
  if ("error" in d) throw new Error("district failed");
  const reg = registerPlatform(db, op, d.orgId, {
    issuer: ISS,
    clientId: CLIENT_ID,
    deploymentId: DEPLOYMENT,
    authLoginUrl: "https://lms.tallypeak.test/oidc/auth",
    jwks: JWKS
  });
  if ("error" in reg) throw new Error(`register failed: ${reg.error}`);
  return { orgId: d.orgId, admin: op };
}

/** Mint a nonce the production way and return its value (the launch must
 * present exactly this to prove the login round-trip). */
function liveNonce(): string {
  const r = buildLoginRedirect(db, {
    iss: ISS,
    clientId: CLIENT_ID,
    loginHint: "lms-user-778",
    targetLinkUri: "https://maggie.test/learn/fractions"
  });
  if ("error" in r) throw new Error("login redirect failed");
  return new URL(r.redirectUrl).searchParams.get("nonce")!;
}

describe("lti registration (s113)", () => {
  it("guards registration, validates the JWKS shape, and refuses duplicates", () => {
    const op = platformAdmin("op@example.com");
    const outsider = account("nobody@example.com");
    const d = createDistrict(db, op, "Tally Peak USD");
    if ("error" in d) throw new Error("district failed");

    expect(registerPlatform(db, outsider, d.orgId, {
      issuer: ISS, clientId: CLIENT_ID, deploymentId: DEPLOYMENT, authLoginUrl: "https://x/auth", jwks: JWKS
    })).toEqual({ error: "forbidden" });

    expect(registerPlatform(db, op, d.orgId, {
      issuer: ISS, clientId: CLIENT_ID, deploymentId: DEPLOYMENT, authLoginUrl: "https://x/auth", jwks: "{not json"
    })).toEqual({ error: "bad-jwks" });
    expect(registerPlatform(db, op, d.orgId, {
      issuer: ISS, clientId: CLIENT_ID, deploymentId: DEPLOYMENT, authLoginUrl: "https://x/auth", jwks: '{"keys":"nope"}'
    })).toEqual({ error: "bad-jwks" });

    const ok = registerPlatform(db, op, d.orgId, {
      issuer: ISS, clientId: CLIENT_ID, deploymentId: DEPLOYMENT, authLoginUrl: "https://x/auth", jwks: JWKS
    });
    if ("error" in ok) throw new Error("expected success");
    expect(ok.platformId).toMatch(/^ltip_/);

    // Same (issuer, client, deployment) triple collides.
    expect(registerPlatform(db, op, d.orgId, {
      issuer: ISS, clientId: CLIENT_ID, deploymentId: DEPLOYMENT, authLoginUrl: "https://x/auth", jwks: JWKS
    })).toEqual({ error: "duplicate" });

    const rows = platformsFor(db, op, d.orgId);
    if ("error" in rows) throw new Error("list forbidden");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ issuer: ISS, clientId: CLIENT_ID, deploymentId: DEPLOYMENT });
    expect(platformsFor(db, outsider, d.orgId)).toEqual({ error: "forbidden" });
  });
});

describe("lti login initiation (s113)", () => {
  it("stores a single-use nonce and builds a conformant auth redirect", () => {
    setup();
    const r = buildLoginRedirect(db, {
      iss: ISS,
      clientId: CLIENT_ID,
      loginHint: "lms-user-778",
      targetLinkUri: "https://maggie.test/learn/fractions",
      ltiMessageHint: "hint-9"
    });
    if ("error" in r) throw new Error("expected redirect");
    const url = new URL(r.redirectUrl);
    expect(url.origin + url.pathname).toBe("https://lms.tallypeak.test/oidc/auth");
    expect(url.searchParams.get("scope")).toBe("openid");
    expect(url.searchParams.get("response_type")).toBe("id_token");
    expect(url.searchParams.get("response_mode")).toBe("form_post");
    expect(url.searchParams.get("prompt")).toBe("none");
    expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(url.searchParams.get("login_hint")).toBe("lms-user-778");
    expect(url.searchParams.get("lti_message_hint")).toBe("hint-9");
    expect(url.searchParams.get("state")).toBe(r.state);
    const nonce = url.searchParams.get("nonce")!;
    const stored = db.prepare("SELECT COUNT(*) AS n FROM lti_nonces WHERE jti = ?").get(`nonce:${nonce}`) as { n: number };
    expect(stored.n).toBe(1);

    expect(buildLoginRedirect(db, {
      iss: "https://unknown.test", loginHint: "x", targetLinkUri: "https://maggie.test/"
    })).toEqual({ error: "unknown-platform" });
  });
});

describe("lti launch validation (s113)", () => {
  it("accepts a well-formed, correctly-signed teacher launch exactly once", () => {
    setup();
    const nonce = liveNonce();
    const res = validateLaunch(db, idToken(baseClaims(nonce)));
    if ("error" in res) throw new Error(`expected launch, got ${res.error}`);
    expect(res).toMatchObject<Partial<ValidatedLaunch>>({
      role: "teacher",
      email: "teacher@tallypeak.org",
      name: "Jordan Rivera",
      subject: "lms-user-778",
      targetLink: "https://maggie.test/learn/fractions",
      resourceLinkId: "rl-42",
      agsEndpoint: "https://lms.tallypeak.test/ags/li/42"
    });
    expect(res.orgId).not.toBeNull();

    // The nonce is now spent: the very same token replays as nonce-replayed.
    expect(validateLaunch(db, idToken(baseClaims(nonce)))).toEqual({ error: "nonce-replayed" });
  });

  it("maps a non-instructor launch to student and keeps AGS lineitems", () => {
    setup();
    const nonce = liveNonce();
    const res = validateLaunch(
      db,
      idToken(baseClaims(nonce, { [C.roles]: [STUDENT_ROLE], email: null, [C.ags]: { lineitems: "https://lms/li" } }))
    );
    if ("error" in res) throw new Error(`expected launch, got ${res.error}`);
    expect(res.role).toBe("student");
    expect(res.agsEndpoint).toBe("https://lms/li");
  });

  it("rejects each malformation with its own reason code", () => {
    setup();

    // malformed shell
    expect(validateLaunch(db, "only.two")).toEqual({ error: "malformed-token" });

    // bad algorithm (HS256 header)
    expect(
      validateLaunch(db, idToken(baseClaims(liveNonce()), { header: { alg: "HS256" } }))
    ).toEqual({ error: "bad-algorithm" });

    // unknown issuer / audience
    expect(validateLaunch(db, idToken(baseClaims(liveNonce(), { iss: "https://ghost.test" })))).toEqual({
      error: "unknown-platform"
    });
    expect(validateLaunch(db, idToken(baseClaims(liveNonce(), { aud: "someone-else" })))).toEqual({
      error: "unknown-platform"
    });

    // signature by a foreign key
    const foreign = generateKeyPairSync("rsa", { modulusLength: 2048 });
    expect(
      validateLaunch(db, idToken(baseClaims(liveNonce()), { key: foreign.privateKey }))
    ).toEqual({ error: "invalid-signature" });

    // expired / not-yet-valid
    const nowS = Math.floor(Date.now() / 1000);
    expect(validateLaunch(db, idToken(baseClaims(liveNonce(), { exp: nowS - 3600, iat: nowS - 4000 })))).toEqual({
      error: "expired"
    });
    expect(validateLaunch(db, idToken(baseClaims(liveNonce(), { iat: nowS + 3600, exp: nowS + 7200 })))).toEqual({
      error: "not-yet-valid"
    });

    // a nonce we never issued
    expect(validateLaunch(db, idToken(baseClaims("never-issued-nonce")))).toEqual({ error: "nonce-replayed" });

    // wrong deployment / wrong message type
    expect(validateLaunch(db, idToken(baseClaims(liveNonce(), { [C.deploymentId]: "deploy-999" })))).toEqual({
      error: "bad-deployment"
    });
    expect(validateLaunch(db, idToken(baseClaims(liveNonce(), { [C.messageType]: "LtiDeepLinkingRequest" })))).toEqual({
      error: "bad-message-type"
    });
  });

  it("refuses a replayed jti even under a fresh nonce", () => {
    setup();
    const first = baseClaims(liveNonce(), { jti: "stable-jti" });
    expect("error" in validateLaunch(db, idToken(first))).toBe(false);
    // New nonce, same jti → the token-id replay guard fires.
    const second = baseClaims(liveNonce(), { jti: "stable-jti" });
    expect(validateLaunch(db, idToken(second))).toEqual({ error: "jti-replayed" });
  });

  it("requires azp to name us when the token carries multiple audiences", () => {
    setup();
    const good = baseClaims(liveNonce(), { aud: [CLIENT_ID, "other-tool"], azp: CLIENT_ID });
    expect("error" in validateLaunch(db, idToken(good))).toBe(false);
    const bad = baseClaims(liveNonce(), { aud: [CLIENT_ID, "other-tool"], azp: "other-tool" });
    expect(validateLaunch(db, idToken(bad))).toEqual({ error: "bad-audience" });
  });
});

describe("lti teacher session + purge (s113)", () => {
  it("provisions a passwordless teacher and mints a login session", () => {
    setup();
    const launch = validateLaunch(db, idToken(baseClaims(liveNonce())));
    if ("error" in launch) throw new Error("launch failed");
    const minted = teacherLaunchUser(db, launch);
    if ("error" in minted) throw new Error("mint failed");
    const row = db.prepare("SELECT email, pw_hash, role FROM users WHERE id = ?").get(minted.userId) as {
      email: string;
      pw_hash: string | null;
      role: string;
    };
    expect(row.email).toBe("teacher@tallypeak.org");
    expect(row.pw_hash).toBeNull();
    expect(row.role).toBe("teacher");

    const sess = createLoginSession(db, minted.userId, "lti");
    if ("error" in sess) throw new Error("session failed");
    const who = sessionFor(db, sess.token);
    expect(who?.user.email).toBe("teacher@tallypeak.org");

    // A launch with no email cannot mint (children are not accounts).
    const anon = validateLaunch(db, idToken(baseClaims(liveNonce(), { email: null, [C.roles]: [STUDENT_ROLE] })));
    if ("error" in anon) throw new Error("launch failed");
    expect(teacherLaunchUser(db, anon)).toEqual({ error: "no-email" });
  });

  it("purgeExpired reaps stale nonces and delivered outbox rows", () => {
    setup();
    // An expired nonce and an old delivered outbox row.
    db.prepare("INSERT INTO lti_nonces (jti, issuer, seen_at, expires_at) VALUES (?,?,?,?)").run(
      "nonce:stale",
      ISS,
      "2000-01-01T00:00:00.000Z",
      "2000-01-01T00:10:00.000Z"
    );
    db.prepare(
      "INSERT INTO lms_outbox (kind, target, payload, created_at, attempts, delivered_at) VALUES (?,?,?,?,?,?)"
    ).run("ags-score", "https://lms/li", "{}", "2000-01-01T00:00:00.000Z", 1, "2000-01-02T00:00:00.000Z");
    const counts = purgeExpired(db);
    expect(counts.ltiNonces).toBeGreaterThanOrEqual(1);
    expect(counts.lmsOutbox).toBeGreaterThanOrEqual(1);
  });
});
