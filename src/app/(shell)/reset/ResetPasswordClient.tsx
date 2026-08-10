"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordClient({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "This reset link is incomplete.");
  const valid = token.length > 0 && password.length >= 8 && password === confirm;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      if (!res.ok) {
        setError("This reset link is invalid or has expired. Request a new one from the account page.");
        return;
      }
      setDone(true);
      setPassword("");
      setConfirm("");
    } catch {
      setError("The account service is unavailable. No password was changed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">Choose a new password of at least eight characters.</p>
      </div>
      {done ? (
        <div role="status" className="rounded-card border-2 border-leaf/40 bg-leaf/10 p-5">
          <p className="font-extrabold">Password updated.</p>
          <p className="mt-1 text-sm">For safety, all existing sessions were signed out.</p>
          <Link href="/account" className="mt-4 inline-block font-bold text-sky-ink hover:underline">Sign in with the new password →</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-card border border-ink/10 bg-surface p-5 shadow-e1 dark:border-paper/12">
          <label className="grid gap-1 text-sm font-bold">
            New password
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 dark:border-paper/15" />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Confirm password
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 dark:border-paper/15" />
          </label>
          {password && password.length < 8 && <p className="text-sm font-bold text-berry-ink">Use at least eight characters.</p>}
          {confirm && password !== confirm && <p className="text-sm font-bold text-berry-ink">Passwords do not match.</p>}
          {error && <p role="alert" className="text-sm font-bold text-berry-ink">{error}</p>}
          <button type="submit" disabled={!valid || busy} className="min-h-11 rounded-full bg-cta px-5 font-extrabold text-white disabled:opacity-40">
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </main>
  );
}
