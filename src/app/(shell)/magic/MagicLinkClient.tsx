"use client";

import Link from "next/link";
import { useState } from "react";
import { clearLogoutPending } from "@/lib/auth";

export default function MagicLinkClient({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "This sign-in link is incomplete.");

  async function confirm() {
    if (!token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/magic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!response.ok) {
        setError("This sign-in link is invalid or has expired. Request a new one from the account page.");
        return;
      }
      clearLogoutPending();
      window.location.assign("/account?auth=magic");
    } catch {
      setError("The account service is unavailable. The link was not consumed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Confirm sign-in</h1>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">Continue only when you opened this link yourself.</p>
      </div>
      <div className="space-y-4 rounded-card border border-ink/10 bg-surface p-5 shadow-e1 dark:border-paper/12">
        {error && <p role="alert" className="text-sm font-bold text-berry-ink">{error}</p>}
        <button type="button" disabled={!token || busy} onClick={confirm} className="min-h-11 rounded-full bg-cta px-5 font-extrabold text-white disabled:opacity-40">
          {busy ? "Signing in…" : "Continue sign-in"}
        </button>
        <p><Link href="/account" className="font-bold text-sky-ink hover:underline">Return to account →</Link></p>
      </div>
    </main>
  );
}
