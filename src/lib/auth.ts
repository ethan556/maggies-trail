/**
 * AUTH abstraction.
 *
 * The live provider verifies passwords and sessions through the server. The
 * HttpOnly cookie is the sole authority; localStorage contains only a display
 * mirror so client components can render immediately. MockAuthProvider remains
 * available exclusively as a deterministic test seam.
 */

import { storageGet, storageRemove, storageSet } from "./safeStorage";

export const SESSION_KEY = "numera:session:v1";
export const LOGOUT_PENDING_KEY = "numera:logout-pending:v1";
export const SESSION_CHANGED_EVENT = "maggies:session-changed";

function announceSessionChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export interface Session {
  accountId: string;
  email: string;
  /** Real providers put a verifiable token here. The mock has none, and says so. */
  token: string | null;
  signedInAt: string;
}

export interface AuthProvider {
  readonly name: string;
  /** True when this provider can actually verify identity. The mock returns false. */
  readonly verifies: boolean;
  signIn(email: string, password?: string): Promise<Session>;
  signOut(): void;
  currentSession(): Session | null;
}

/** Stable, non-secret display-mirror id derived from the email. It keeps local
 * account-keyed UI stable before /api/auth/me resolves. It is never accepted
 * by server authorization and is not a security mechanism. */
export function accountIdFor(email: string): string {
  const norm = email.trim().toLowerCase();
  let h = 5381;
  for (let i = 0; i < norm.length; i++) h = ((h << 5) + h + norm.charCodeAt(i)) >>> 0;
  return `acct_${h.toString(36)}`;
}

export function sessionMirrorFor(email: string): Session {
  const normalized = email.trim().toLowerCase();
  return {
    accountId: accountIdFor(normalized),
    email: normalized,
    token: null,
    signedInAt: new Date().toISOString()
  };
}

export function rememberSessionMirror(email: string): Session {
  const session = sessionMirrorFor(email);
  if (typeof window !== "undefined") {
    try {
      storageRemove(LOGOUT_PENDING_KEY);
      storageSet(SESSION_KEY, JSON.stringify(session));
      announceSessionChange();
    } catch {
      /* the HttpOnly cookie remains authoritative */
    }
  }
  return session;
}

export function clearSessionMirror(): void {
  if (typeof window === "undefined") return;
  try {
    storageRemove(SESSION_KEY);
    announceSessionChange();
  } catch {
    /* ignore */
  }
}


export function logoutPending(): boolean {
  return typeof window !== "undefined" && storageGet(LOGOUT_PENDING_KEY) === "1";
}

function markLogoutPending(): void {
  if (typeof window !== "undefined") storageSet(LOGOUT_PENDING_KEY, "1");
}

export function clearLogoutPending(): void {
  if (typeof window !== "undefined") storageRemove(LOGOUT_PENDING_KEY);
}

export class MockAuthProvider implements AuthProvider {
  readonly name = "mock-auth";
  readonly verifies = false;

  async signIn(email: string): Promise<Session> {
    return rememberSessionMirror(email);
  }

  signOut(): void {
    clearSessionMirror();
  }

  currentSession(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = storageGet(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      return s.accountId ? s : null;
    } catch {
      return null;
    }
  }
}

/**
 * SERVER-BACKED PROVIDER — the live one. `signIn(email, password)` posts to
 * /api/auth/login; the server sets the HttpOnly session cookie (the ONLY
 * authority) and this class keeps a DISPLAY MIRROR in localStorage so client
 * components can render "signed in as …" synchronously. The mirror carries no
 * power: every API call re-derives identity from the cookie against session
 * rows. `verifies` is true because the server actually checks a password.
 *
 * The derived mirror id keeps account-keyed local UI stable; server routes
 * never consume or trust it. /api/auth/me restores the mirror from the
 * authoritative HttpOnly-cookie session after refresh or magic-link login.
 */
export class ServerAuthProvider implements AuthProvider {
  readonly name = "server-auth";
  readonly verifies = true;

  async signIn(email: string, password?: string): Promise<Session> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: password ?? "" })
    });
    if (!res.ok) {
      if (res.status === 429) throw new Error("Too many attempts — wait a moment.");
      if (res.status === 503) throw new Error("The account service is unavailable. Learning on this device still works.");
      if (res.status === 400) throw new Error("Enter a valid email and password.");
      throw new Error("Email or password didn't match.");
    }
    return rememberSessionMirror(email);
  }

  signOut(): void {
    // A failed/offline POST cannot clear an HttpOnly cookie. Keep a local
    // tombstone so SessionBootstrap retries revocation instead of silently
    // restoring the session on the next focus.
    markLogoutPending();
    clearSessionMirror();
    void fetch("/api/auth/logout", { method: "POST" })
      .then((response) => {
        if (response.ok) clearLogoutPending();
      })
      .catch(() => {});
  }

  currentSession(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = storageGet(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      return s.accountId ? s : null;
    } catch {
      return null;
    }
  }
}

/** The live provider is server-backed. `MockAuthProvider` above remains
 * exported for TESTS ONLY (jsdom has no API routes); install it with
 * `_setAuthProviderForTests`. */
export let authProvider: AuthProvider = new ServerAuthProvider();

export function _setAuthProviderForTests(p: AuthProvider): void {
  authProvider = p;
}
