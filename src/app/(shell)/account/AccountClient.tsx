"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authProvider, clearSessionMirror, logoutPending, rememberSessionMirror, type Session } from "@/lib/auth";
import { entitlementFor, type Entitlement } from "@/lib/entitlement";
import { getRoster } from "@/lib/roster";
import { lastSyncedAt, type SyncOutcome } from "@/lib/syncClient";
import { getStatus, requestSyncOutcome } from "@/lib/autoSync";

/** Who the SERVER says we are (the HttpOnly cookie is the authority; the
 * localStorage session is only a display mirror). */
interface Me {
  email: string;
  role: string;
  verified: boolean;
}

export default function AccountClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [outcome, setOutcome] = useState<SyncOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [ent, setEnt] = useState<Entitlement | null>(null);
  const [childCount, setChildCount] = useState(1);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("verified") === "1") setNotice({ tone: "info", text: "Email verified. You can sign in now." });
    else if (query.get("verified") === "0") setNotice({ tone: "error", text: "That verification link is invalid or expired." });
    else if (query.get("auth") === "magic") setNotice({ tone: "info", text: "Signed in securely from your email link." });
    else if (query.get("auth") === "invalid") setNotice({ tone: "error", text: "That sign-in link is invalid or expired." });

    const local = authProvider.currentSession();
    setSession(local);
    setEnt(entitlementFor(local?.accountId));
    setLastSync(lastSyncedAt());
    setChildCount(getRoster().children.length);

    // Always ask the cookie authority, even when the display mirror is absent.
    // This is what makes magic-link sign-in and a cleared localStorage recover.
    fetch("/api/auth/me")
      .then(async (r) => {
        if (r.ok && !logoutPending()) {
          const body = (await r.json()) as { user: Me };
          const restored = rememberSessionMirror(body.user.email);
          setSession(restored);
          setEnt(entitlementFor(restored.accountId));
          setMe(body.user);
        } else if (r.status === 401) {
          clearSessionMirror();
          setSession(null);
          setEnt(null);
          setMe(null);
        }
      })
      .catch(() => {
        // A temporary account-service outage must not erase a valid local mirror.
      });
  }, []);

  const validEmail = email.includes("@");

  async function signIn() {
    setNotice(null);
    try {
      const s = await authProvider.signIn(email, password);
      setSession(s);
      setEnt(entitlementFor(s.accountId));
      setPassword("");
      const r = await fetch("/api/auth/me");
      if (r.ok) setMe(((await r.json()) as { user: Me }).user);
    } catch (err) {
      setNotice({ tone: "error", text: err instanceof Error ? err.message : "Sign-in failed." });
    }
  }

  async function createAccount() {
    setNotice(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.status === 429) return setNotice({ tone: "error", text: "Too many attempts — wait a moment." });
      if (res.status === 503) return setNotice({ tone: "error", text: "The account service is unavailable. Learning on this device still works." });
      if (!res.ok) return setNotice({ tone: "error", text: "Use a valid email and a password of 8+ characters." });
      setNotice({ tone: "info", text: "Check your email to verify the account, then sign in above." });
    } catch {
      setNotice({ tone: "error", text: "Account service is unavailable. Your on-device learning still works." });
    }
  }

  async function requestLink(kind: "magic" | "reset") {
    setNotice(null);
    try {
      const res = await fetch(`/api/auth/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.status === 429) return setNotice({ tone: "error", text: "Too many attempts — wait a moment." });
      if (!res.ok) return setNotice({ tone: "error", text: "Account service is unavailable right now." });
      setNotice({
        tone: "info",
        text: kind === "magic" ? "If that address has an account, a sign-in link is on its way." : "If that address has an account, a reset link is on its way."
      });
    } catch {
      setNotice({ tone: "error", text: "Account service is unavailable right now." });
    }
  }

  function signOut() {
    authProvider.signOut();
    setSession(null);
    setMe(null);
    setEnt(null);
    setOutcome(null);
  }

  async function deleteAccount() {
    if (!window.confirm("Delete this account and every learner's server record? This cannot be undone.")) return;
    setNotice(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        setNotice({ tone: "error", text: "Account deletion failed. Nothing was deleted." });
        return;
      }
      signOut();
      setNotice({ tone: "info", text: "Account deleted. Progress on this device is untouched." });
    } catch {
      setNotice({ tone: "error", text: "Account deletion failed. Nothing was deleted." });
    }
  }

  async function doSync() {
    setBusy(true);
    try {
      const result = await requestSyncOutcome("manual");
      const current = getStatus();
      setOutcome(
        result ?? {
          state: current.state === "idle" ? "error" : current.state,
          at: current.at,
          detail: current.detail ?? current.lastReason ?? "sync did not run"
        }
      );
      const at = lastSyncedAt();
      setLastSync(at);
    } finally {
      setBusy(false);
    }
  }

  const statusLine = (o: SyncOutcome) => {
    switch (o.state) {
      case "ok":
        return {
          tone: "text-leaf-ink",
          text: `Synced ${o.synced ?? 1} learner${(o.synced ?? 1) === 1 ? "" : "s"}. Every learner on your roster is up to date on the server.`
        };
      case "offline":
        return { tone: "text-tangerine-ink", text: `Offline — ${o.detail}` };
      case "signed-out":
        return { tone: "text-ink/70", text: "Sign in first to sync." };
      case "error":
        return { tone: "text-berry-ink", text: `Sync failed — ${o.detail ?? "unknown error"}` };
      default:
        return { tone: "text-ink/70", text: "Idle." };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          Your account holds the roster and the subscription. Learners sync per-device from here.
        </p>
      </div>

      {/* Honest disclosure, updated for what's now real — and what still isn't. */}
      <p role="note" className="rounded-card border-2 border-leaf/40 bg-leaf/10 px-4 py-3 text-sm font-bold">
        Real accounts: passwords are hashed on the server, sessions live in an HttpOnly cookie, and
        progress syncs to a durable database. One seam remains: email isn&apos;t delivered — verification
        and sign-in links land in the server&apos;s outbox until a mail transport is configured.
      </p>

      {notice && (
        <p role="status" className={`text-sm font-bold ${notice.tone === "error" ? "text-berry-ink" : "text-leaf-ink"}`}>
          {notice.text}
        </p>
      )}

      {!session ? (
        <div className="rounded-card border border-ink/10 bg-surface p-4 shadow-e1 dark:border-paper/12">
          <p className="font-extrabold">Sign in or create an account</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="account email"
                placeholder="you@example.com"
                className="min-h-11 w-64 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15"
              />
            </label>
            <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="account password"
                placeholder="8+ characters"
                className="min-h-11 w-48 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15"
              />
            </label>
            <button
              type="button"
              onClick={signIn}
              disabled={!validEmail || password.length === 0}
              className="pressable min-h-11 rounded-full bg-cta px-5 font-extrabold text-white hover:bg-sky/90 disabled:opacity-40"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={createAccount}
              disabled={!validEmail || password.length < 8}
              className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-5 font-bold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
            >
              Create account
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold">
            <button type="button" onClick={() => requestLink("magic")} disabled={!validEmail} className="min-h-11 px-2 text-sky-ink hover:underline disabled:opacity-40">
              Email me a sign-in link instead
            </button>
            <button type="button" onClick={() => requestLink("reset")} disabled={!validEmail} className="min-h-11 px-2 text-sky-ink hover:underline disabled:opacity-40">
              Forgot password?
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-card border-2 border-leaf/40 bg-leaf/5 p-4">
            <p className="font-extrabold">{session.email}</p>
            <p className="mt-1 text-xs font-bold text-ink/70 dark:text-paper/70">
              {me ? `${me.role} · ${me.verified ? "email verified" : "email not yet verified"} · ` : ""}
              {childCount} learner{childCount === 1 ? "" : "s"} · {ent ? `${ent.plan} plan (demo)` : "free plan"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={doSync}
                disabled={busy}
                className="pressable min-h-11 rounded-full bg-cta px-5 font-extrabold text-white hover:bg-sky/90 disabled:opacity-50"
              >
                {busy ? "Syncing…" : `Sync ${childCount === 1 ? "this learner" : `all ${childCount} learners`}`}
              </button>
              <button
                type="button"
                onClick={signOut}
                className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-5 font-bold transition-colors hover:border-berry hover:text-berry-ink dark:border-paper/20"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                className="min-h-11 rounded-pill px-4 text-sm font-bold text-berry-ink/80 hover:text-berry-ink hover:underline"
              >
                Delete account…
              </button>
            </div>
          </div>

          <div className="rounded-card border border-ink/10 bg-surface p-4 text-sm shadow-e1 dark:border-paper/12">
            <p className="font-extrabold">Sync status</p>
            {outcome && <p className={`mt-1 font-bold ${statusLine(outcome).tone}`}>{statusLine(outcome).text}</p>}
            <p className="mt-1 text-ink/70 dark:text-paper/70">
              {lastSync ? `Last synced ${new Date(lastSync).toLocaleString()}.` : "Not synced on this device yet."}
            </p>
            <p className="mt-2 text-xs text-ink/70 dark:text-paper/70">
              Progress always saves on this device first, so nothing is lost offline. Syncing covers
              every learner on your roster, not just the active one, and merges each with the
              server — XP, completions and badges accumulate rather than overwrite, so work done on
              two devices at once survives both ways.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-card border border-ink/10 bg-surface p-4 text-sm shadow-e1 dark:border-paper/12">
        <p className="font-extrabold">Subscription</p>
        <p className="mt-1 text-ink/70 dark:text-paper/70">
          {ent
            ? ent.plan === "family"
              ? "Family plan (demo) — every learner on your roster is covered."
              : `${ent.plan} plan (demo) — covers your account.`
            : "Free plan — chapter 1 of every course is open."}
        </p>
        <div className="mt-3 flex gap-3">
          <Link href="/premium" className="inline-flex min-h-11 items-center px-2 font-bold text-sky-ink hover:underline">
            See plans →
          </Link>
          <Link href="/family" className="inline-flex min-h-11 items-center px-2 font-bold text-sky-ink hover:underline">
            Manage learners →
          </Link>
        </div>
      </div>
    </div>
  );
}
