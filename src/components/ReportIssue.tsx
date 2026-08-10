"use client";

/**
 * REPORT A PROBLEM — the universal issue-report control.
 *
 * Mounted once in the shell layout, so every user-facing screen has it without
 * each page remembering to add one. Design decisions worth stating:
 *
 *   · IT SENDS THE REPORTER'S WORDS AND THE ROUTE. No screenshot, no DOM
 *     capture, no console scrape. A learner's screen holds their work and
 *     their mistakes; a bug report must not exfiltrate either. The viewport
 *     class is a bucket ("390x844"), which is what makes a layout report
 *     actionable without describing anything the person did.
 *
 *   · IT NEVER CLAIMS SUCCESS IT DIDN'T GET. If the deployment has no durable
 *     database the route answers 503 and this says so plainly, because a
 *     cheerful "thanks!" over a dropped report teaches people the button is a
 *     placebo.
 *
 *   · IT IS A LABELLED BUTTON, NOT A BARE ICON. 44px target, visible focus,
 *     real accessible name, and it does not trap focus or block the page —
 *     a learner mid-lesson can dismiss it with Escape and lose nothing.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Status = "idle" | "sending" | "sent" | "failed" | "unavailable";

export default function ReportIssue() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) fieldRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send() {
    const text = description.trim();
    if (!text || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: pathname ?? "/",
          description: text,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setDescription("");
      } else {
        setStatus(res.status === 503 ? "unavailable" : "failed");
      }
    } catch {
      setStatus("failed");
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen((v) => !v); setStatus("idle"); }}
        aria-expanded={open}
        aria-label="Report a problem"
        className="pressable fixed bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] right-3 z-30 flex min-h-11 min-w-11 items-center gap-1.5 rounded-pill border border-ink/12 bg-surface px-3 text-xs font-bold text-content shadow-e2 hover:border-sky hover:text-sky-ink md:bottom-4 dark:border-paper/15"
      >
        <span aria-hidden="true">⚑</span>
        <span className="hidden sm:inline">Report a problem</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Report a problem"
          className="banner-in fixed bottom-[calc(env(safe-area-inset-bottom)+9.5rem)] right-3 z-40 w-[min(22rem,calc(100vw-1.5rem))] rounded-card border border-ink/10 bg-surface p-3 shadow-e3 md:bottom-16 dark:border-paper/12"
        >
          <label htmlFor="report-issue-text" className="block text-sm font-bold text-content">
            What went wrong?
          </label>
          <p className="mt-1 text-xs text-muted">
            We send only what you type and which page you are on.
          </p>
          <textarea
            ref={fieldRef}
            id="report-issue-text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
            rows={3}
            className="mt-2 w-full rounded-[12px] border border-ink/15 bg-bg p-2 text-sm text-content dark:border-paper/15"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
              className="pressable min-h-11 rounded-pill px-3 text-sm font-bold text-muted hover:text-content"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!description.trim() || status === "sending"}
              className="pressable min-h-11 rounded-pill bg-sky px-4 text-sm font-bold text-white disabled:opacity-45"
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
          </div>
          <p aria-live="polite" className="mt-1 text-xs text-muted">
            {status === "sent" && "Thank you — your report was received."}
            {status === "failed" && "That did not send. Please try again."}
            {status === "unavailable" && "Reports are not available on this deployment yet."}
          </p>
        </div>
      )}
    </>
  );
}
