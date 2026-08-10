"use client";

import Link from "next/link";
import { useState } from "react";

export default function VerifyEmailClient({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "This verification link is incomplete.");

  async function confirm() {
    if (!token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!response.ok) {
        setError("This verification link is invalid, expired, or already used.");
        return;
      }
      setDone(true);
    } catch {
      setError("The account service is unavailable. The link was not consumed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Verify email</h1>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">Confirm that you opened this link intentionally.</p>
      </div>
      <div className="space-y-4 rounded-card border border-ink/10 bg-surface p-5 shadow-e1 dark:border-paper/12">
        {done ? (
          <p role="status" className="font-extrabold text-leaf-ink">Email verified successfully.</p>
        ) : (
          <button type="button" disabled={!token || busy} onClick={confirm} className="min-h-11 rounded-full bg-cta px-5 font-extrabold text-white disabled:opacity-40">
            {busy ? "Verifying…" : "Verify email"}
          </button>
        )}
        {error && <p role="alert" className="text-sm font-bold text-berry-ink">{error}</p>}
        <p><Link href="/account" className="font-bold text-sky-ink hover:underline">Go to account →</Link></p>
      </div>
    </main>
  );
}
