/**
 * LTI OIDC ROUTES (s113) — the login→launch round-trip through the handlers.
 *
 * The service is unit-proven; this pins the ROUTE wiring the LMS actually hits:
 * the login leg answers 302 to the platform auth URL and sets the state cookie,
 * and the launch leg refuses a mismatched state, then — with the real state
 * cookie and a token carrying the issued nonce — mints a teacher session and
 * redirects into the app.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateKeyPairSync, sign as cryptoSign } from "node:crypto";
import { migrate, openDb, _setDbForTests, type DB } from "@/server/db";
import { login, sessionFor, signup } from "@/server/authService";
import { createDistrict } from "@/server/institutionService";
import { registerPlatform } from "@/server/ltiService";
import { GET as loginGet, POST as loginPost } from "@/app/api/lti/login/route";
import { POST as launchPost } from "@/app/api/lti/launch/route";

let dir: string;
let db: DB;

const ISS = "https://lms.tallypeak.test";
const CLIENT_ID = "client-abc";
const DEPLOYMENT = "deploy-1";
const KID = "k1";
const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = { ...(pair.publicKey.export({ format: "jwk" }) as Record<string, unknown>), kid: KID, alg: "RS256", use: "sig" };
const JWKS = JSON.stringify({ keys: [publicJwk] });
const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

const CLAIM = {
  messageType: "https://purl.imsglobal.org/spec/lti/claim/message_type",
  version: "https://purl.imsglobal.org/spec/lti/claim/version",
  deploymentId: "https://purl.imsglobal.org/spec/lti/claim/deployment_id",
  targetLink: "https://purl.imsglobal.org/spec/lti/claim/target_link_uri",
  resourceLink: "https://purl.imsglobal.org/spec/lti/claim/resource_link",
  roles: "https://purl.imsglobal.org/spec/lti/claim/roles"
};

function idToken(nonce: string, over: Record<string, unknown> = {}): string {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: ISS,
    aud: CLIENT_ID,
    sub: "u-1",
    exp: now + 300,
    iat: now - 5,
    nonce,
    jti: `t-${nonce}`,
    email: "teacher@tallypeak.org",
    name: "Jordan Rivera",
    [CLAIM.messageType]: "LtiResourceLinkRequest",
    [CLAIM.version]: "1.3.0",
    [CLAIM.deploymentId]: DEPLOYMENT,
    [CLAIM.targetLink]: "http://app.test/learn/fractions",
    [CLAIM.resourceLink]: { id: "rl-1" },
    [CLAIM.roles]: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"],
    ...over
  };
  const header = { alg: "RS256", kid: KID, typ: "JWT" };
  const input = `${b64url(header)}.${b64url(claims)}`;
  const sig = cryptoSign("RSA-SHA256", Buffer.from(input), pair.privateKey).toString("base64url");
  return `${input}.${sig}`;
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-ltiroute-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
  _setDbForTests(db);

  signup(db, "op@example.com", "pw-one-two", "parent");
  const id = (db.prepare("SELECT id FROM users WHERE email = ?").get("op@example.com") as { id: string }).id;
  db.prepare("UPDATE users SET role = 'platform-admin' WHERE id = ?").run(id);
  const r = login(db, "op@example.com", "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  const op = sessionFor(db, r.token)!;
  const d = createDistrict(db, op, "Tally Peak USD");
  if ("error" in d) throw new Error("district failed");
  const reg = registerPlatform(db, op, d.orgId, {
    issuer: ISS,
    clientId: CLIENT_ID,
    deploymentId: DEPLOYMENT,
    authLoginUrl: "https://lms.tallypeak.test/oidc/auth",
    jwks: JWKS
  });
  if ("error" in reg) throw new Error("register failed");
});
afterEach(() => {
  _setDbForTests(null);
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("lti oidc routes (s113)", () => {
  it("initiates login with a state cookie and completes a teacher launch", async () => {
    // ── login leg (GET, query params) ──
    const loginUrl =
      `http://app.test/api/lti/login?iss=${encodeURIComponent(ISS)}` +
      `&login_hint=u-1&target_link_uri=${encodeURIComponent("https://app.test/learn/fractions")}` +
      `&client_id=${CLIENT_ID}`;
    const loginRes = await loginGet(new NextRequest(loginUrl));
    expect(loginRes.status).toBe(302);
    const location = loginRes.headers.get("location")!;
    const redirect = new URL(location);
    expect(redirect.origin + redirect.pathname).toBe("https://lms.tallypeak.test/oidc/auth");
    const nonce = redirect.searchParams.get("nonce")!;
    const state = redirect.searchParams.get("state")!;
    const stateCookie = loginRes.cookies.get("mt_lti_state")?.value;
    expect(stateCookie).toBe(state);

    // ── launch with a MISMATCHED state → bad-state ──
    const badForm = new FormData();
    badForm.set("id_token", idToken(nonce));
    badForm.set("state", state);
    const badReq = new NextRequest("http://app.test/api/lti/launch", {
      method: "POST",
      headers: { cookie: `mt_lti_state=not-the-state` },
      body: badForm
    });
    const badRes = await launchPost(badReq);
    expect(badRes.status).toBe(400);
    expect((await badRes.json()).error).toBe("bad-state");

    // ── launch with the correct state + a valid token → 303 to /teach + session ──
    const form = new FormData();
    form.set("id_token", idToken(nonce));
    form.set("state", state);
    const req = new NextRequest("http://app.test/api/lti/launch", {
      method: "POST",
      headers: { cookie: `mt_lti_state=${state}` },
      body: form
    });
    const res = await launchPost(req);
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://app.test/teach");
    // A session cookie is set, and it resolves to the provisioned teacher.
    const token = res.cookies.get("mt_session")?.value;
    expect(token).toBeTruthy();
    expect(sessionFor(db, token!)?.user.email).toBe("teacher@tallypeak.org");
    // The state cookie is cleared.
    expect(res.cookies.get("mt_lti_state")?.value).toBe("");
  });

  it("sends a student launch to the target lesson with no account", async () => {
    // Mint a nonce via the login leg.
    const form0 = new FormData();
    form0.set("iss", ISS);
    form0.set("login_hint", "u-2");
    form0.set("target_link_uri", "https://app.test/learn/fractions");
    form0.set("client_id", CLIENT_ID);
    const loginRes = await loginPost(
      new NextRequest("http://app.test/api/lti/login", { method: "POST", body: form0 })
    );
    const redirect = new URL(loginRes.headers.get("location")!);
    const nonce = redirect.searchParams.get("nonce")!;
    const state = redirect.searchParams.get("state")!;

    const form = new FormData();
    form.set(
      "id_token",
      idToken(nonce, {
        email: null,
        [CLAIM.roles]: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"]
      })
    );
    form.set("state", state);
    const res = await launchPost(
      new NextRequest("http://app.test/api/lti/launch", {
        method: "POST",
        headers: { cookie: `mt_lti_state=${state}` },
        body: form
      })
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://app.test/learn/fractions");
    // No session minted for a student.
    expect(res.cookies.get("mt_session")?.value ?? "").toBe("");
    // And no account was created.
    const acct = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'teacher'").get() as { n: number };
    expect(acct.n).toBe(0);
  });
});
