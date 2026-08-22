"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStatus, start, subscribe, type SyncStatus } from "@/lib/autoSync";

/**
 * The one place auto-sync is mounted, and the only place its state is shown. Deliberately quiet:
 * signed-out learners see nothing at all (sync is not a feature they have), and a healthy sync
 * shows a small dot rather than a banner. Failure and offline are the states worth surfacing,
 * because those are the ones where the learner might otherwise assume their work is somewhere it
 * isn't. It never claims "synced" unless a sync actually succeeded.
 */
export default function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>(getStatus());

  useEffect(() => {
    const stop = start(); // wires focus / visibility / online / heartbeat triggers
    const unsub = subscribe(setStatus);
    return () => {
      unsub();
      stop();
    };
  }, []);

  // Signed out (or nothing has happened yet): say nothing.
  if (status.state === "idle" || status.state === "signed-out") return null;

  const view = (() => {
    switch (status.state) {
      case "syncing":
        return { dot: "bg-sky motion-safe:animate-pulse", label: "Syncing…", tone: "text-ink/70 dark:text-paper/70" };
      case "ok":
        return { dot: "bg-leaf", label: "Synced", tone: "text-ink/70 dark:text-paper/70" };
      case "offline":
        return { dot: "bg-tangerine", label: "Offline — saved on this device", tone: "text-tangerine-ink" };
      case "error":
        return { dot: "bg-berry", label: "Sync failed", tone: "text-berry-ink" };
      default:
        return null;
    }
  })();
  if (!view) return null;

  return (
    <Link
      href="/account"
      className={`flex items-center gap-1.5 text-xs font-bold ${view.tone} hover:underline`}
      aria-label={`Sync status: ${view.label}`}
      title={status.detail ?? view.label}
    >
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${view.dot}`} aria-hidden />
      <span className="hidden sm:inline">{view.label}</span>
    </Link>
  );
}
