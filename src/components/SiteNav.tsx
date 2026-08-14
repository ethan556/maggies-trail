"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SyncIndicator from "@/components/SyncIndicator";
import { useEffect, useRef, useState } from "react";
import { COPY } from "@/lib/copy";
import { resolveTrailName } from "@/lib/personalize";
import { dueItems, localDateStr } from "@/lib/engine";
import { progressStore } from "@/lib/progress";
import { AppIcon, type IconName } from "@/components/ui";
import { storageSet } from "@/lib/safeStorage";
import { MaggieBrandLockup } from "@/components/brand";
import { AvatarDisplay } from "@/components/AvatarDisplay";

type NavItem = { href: string; label: string; icon: IconName };

/** Primary learner destinations — always visible on desktop and in the mobile bar. */
const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "icon-601" },
  { href: "/courses", label: "Learn", icon: "icon-602" },
  { href: "/review", label: "Review", icon: "icon-603" },
  { href: "/daily", label: "Daily", icon: "icon-604" }
];

/** Secondary destinations — an account menu on desktop, the "More" sheet on mobile.
 *  WS-E Phase 5: the world-layer surfaces (Trailhead / Atlas / Journal) lead the list — they
 *  were real, tested routes with no click path from the visible UI until linked here. */
const SECONDARY: NavItem[] = [
  { href: "/trailhead", label: "Trailhead", icon: "icon-807" },
  { href: "/atlas", label: "Atlas", icon: "icon-808" },
  { href: "/journal", label: "Journal", icon: "icon-902" },
  { href: "/notebook", label: "Notebook", icon: "icon-901" },
  { href: "/profile", label: "Profile", icon: "icon-606" },
  { href: "/family", label: "Family", icon: "icon-605" },
  { href: "/teach", label: "Teach", icon: "icon-805" },
  { href: "/admin", label: "Admin", icon: "icon-607" },
  { href: "/standards", label: "Standards", icon: "icon-805" },
  { href: "/account", label: "Account", icon: "icon-607" },
  { href: "/premium", label: "Premium", icon: "icon-608" }
];

/** Due-review count, refreshed on focus/visibility so post-lesson misses show without reload. */
function useDueCount() {
  const [due, setDue] = useState(0);
  useEffect(() => {
    const read = () => setDue(dueItems(progressStore.load().review, localDateStr(new Date())).length);
    read();
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    return () => {
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);
  return due;
}

/** WS-J: the active learner's chosen avatar (or undefined — AvatarDisplay renders the honest
 *  placeholder either way). This header is mounted once in the shell and persists across
 *  client-side navigation, so — mirroring useDueCount just above — it re-reads on focus/
 *  visibility rather than only on mount, catching an avatar changed on /profile or a switched
 *  active child on /family without requiring a full page reload. */
function useAvatarId() {
  const [avatarId, setAvatarId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const read = () => setAvatarId(progressStore.load().avatarId);
    read();
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    return () => {
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);
  return avatarId;
}

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    storageSet("numera:theme", next ? "dark" : "light");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="pressable flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-ink/12 text-content hover:border-sky hover:text-sky-ink dark:border-paper/15"
    >
      <AppIcon name={dark ? "icon-706" : "icon-707"} size={18} />
    </button>
  );
}

function DueBadge({ due, active }: { due: number; active: boolean }) {
  if (due <= 0) return null;
  return (
    <span
      aria-label={`${due} reviews due`}
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1 text-[11px] font-extrabold tabular-nums ${
        active ? "bg-white text-sky-ink" : "bg-tangerine text-night"
      }`}
    >
      {due}
    </span>
  );
}

/** Desktop account menu: collapses the four secondary links behind one control. */
function AccountMenu() {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const avatarId = useAvatarId();
  const ref = useRef<HTMLDivElement>(null);
  const anySecondaryActive = SECONDARY.some((l) => isActive(l.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account and more"
        onClick={() => setOpen((v) => !v)}
        className={`pressable flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-bold ${
          anySecondaryActive || open ? "bg-sky/12 text-sky-ink" : "text-content-2 hover:bg-sky/10 hover:text-sky-ink"
        }`}
      >
        <AvatarDisplay
          avatarId={avatarId}
          size={256}
          className="h-6 w-6 shrink-0 rounded-full ring-1 ring-ink/15 dark:ring-paper/20"
        />
        <span>Account</span>
        <AppIcon
          name="icon-702"
          size={14}
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="banner-in absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-card border border-ink/10 bg-surface p-1.5 shadow-e3 dark:border-paper/12"
        >
          {SECONDARY.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex min-h-11 items-center gap-2.5 rounded-[12px] px-3 text-sm font-bold ${
                  active ? "bg-sky/12 text-sky-ink" : "text-content hover:bg-sky/8"
                }`}
              >
                <AppIcon name={l.icon} size={18} />
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Mobile "More" sheet — the secondary destinations, thumb-reachable, dismissible. */
function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isActive = useIsActive();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="More destinations">
      <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="banner-in absolute inset-x-0 bottom-0 rounded-t-[20px] border-t border-ink/10 bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-e3 dark:border-paper/12">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-ink/15 dark:bg-paper/20" />
        <div className="grid grid-cols-2 gap-2">
          {SECONDARY.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                className={`pressable flex min-h-14 flex-col items-center justify-center gap-1 rounded-card ${
                  active ? "bg-sky/12 text-sky-ink" : "bg-surface-2 text-content"
                }`}
              >
                <AppIcon name={l.icon} size={22} />
                <span className="text-xs font-bold">{l.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-card bg-surface-2 px-3 py-2">
          <span className="text-sm font-bold text-content-2">Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default function SiteNav() {
  // The brand personalizes to the active learner ("David's Trail") after mount;
  // the server renders the default so hydration stays clean.
  const [brand, setBrand] = useState<string>(COPY.appName);
  useEffect(() => {
    setBrand(resolveTrailName());
  }, []);
  const isActive = useIsActive();
  const due = useDueCount();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Top bar — brand + primary links (desktop) / brand + sync (mobile) */}
      <header className="sticky top-0 z-30 border-b border-ink/8 bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70 dark:border-paper/8">
        <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
          <Link href="/" className="mr-auto flex min-h-11 min-w-11 items-center justify-center gap-2 font-extrabold tracking-tight sm:justify-start md:mr-3">
            <MaggieBrandLockup>{brand}</MaggieBrandLockup>
          </Link>

          {/* Desktop primary links */}
          <div className="hidden items-center gap-1 md:flex">
            {PRIMARY.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`pressable flex min-h-11 items-center gap-2 rounded-pill px-3.5 text-sm font-bold ${
                    active ? "bg-cta text-white shadow-e1" : "text-content-2 hover:bg-sky/10 hover:text-sky-ink"
                  }`}
                >
                  <AppIcon name={l.icon} size={18} />
                  {l.label}
                  {l.href === "/review" && <DueBadge due={due} active={active} />}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <SyncIndicator />
            <AccountMenu />
            <ThemeToggle />
          </div>

          {/* Mobile: sync only in the bar; navigation lives in the bottom bar */}
          <div className="flex items-center gap-2 md:hidden">
            <SyncIndicator />
          </div>
        </nav>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-paper/10 md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {PRIMARY.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 text-[11px] font-bold ${
                  active ? "text-sky-ink" : "text-content-2"
                }`}
              >
                <span className="relative">
                  <AppIcon name={l.icon} size={22} />
                  {l.href === "/review" && due > 0 && (
                    <span
                      aria-label={`${due} reviews due`}
                      className="absolute -right-2.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-tangerine px-1 text-[10px] font-extrabold tabular-nums text-night"
                    >
                      {due}
                    </span>
                  )}
                </span>
                {l.label}
                {active && <span className="absolute inset-x-4 top-0 h-0.5 rounded-pill bg-sky" aria-hidden />}
              </Link>
            );
          })}
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(true)}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 text-[11px] font-bold text-content-2"
          >
            <AppIcon name="icon-609" size={22} />
            More
          </button>
        </div>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
