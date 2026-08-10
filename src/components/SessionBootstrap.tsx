"use client";

import { useEffect } from "react";
import {
  clearLogoutPending,
  clearSessionMirror,
  logoutPending,
  rememberSessionMirror,
  SESSION_KEY,
  LOGOUT_PENDING_KEY
} from "@/lib/auth";

/**
 * Reconciles the non-authoritative display mirror with the HttpOnly cookie for
 * every shell page, not only /account. This lets Teach, Premium, and auto-sync
 * recover after storage is cleared and keeps another tab's logout honest.
 * Temporary server/DB failures deliberately preserve the local mirror.
 */
export default function SessionBootstrap() {
  useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;

    const reconcile = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        // Finish an offline logout before asking who the cookie belongs to.
        // Otherwise /me would restore the display mirror and appear to sign the
        // user back in against their explicit intent.
        if (logoutPending()) {
          const logout = await fetch("/api/auth/logout", { method: "POST", signal: controller.signal });
          if (disposed) return;
          if (logout.ok) {
            clearLogoutPending();
            clearSessionMirror();
          }
          return;
        }

        const response = await fetch("/api/auth/me", { signal: controller.signal, cache: "no-store" });
        if (disposed) return;
        if (response.ok) {
          const body = (await response.json()) as { user?: { email?: unknown } };
          if (typeof body.user?.email === "string") rememberSessionMirror(body.user.email);
        } else if (response.status === 401) {
          clearSessionMirror();
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Offline/503 must not erase a mirror that may still correspond to a
        // valid cookie. The next focus/visibility event retries.
      }
    };

    const onFocus = () => void reconcile();
    const onVisible = () => {
      if (document.visibilityState === "visible") void reconcile();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY || event.key === LOGOUT_PENDING_KEY || event.key === null) void reconcile();
    };

    void reconcile();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      disposed = true;
      controller?.abort();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
