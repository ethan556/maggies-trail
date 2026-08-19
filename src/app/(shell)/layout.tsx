import SiteNav from "@/components/SiteNav";
import SessionBootstrap from "@/components/SessionBootstrap";
import ReportIssue from "@/components/ReportIssue";
import SkipLink from "@/components/SkipLink";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <SkipLink />
      <SessionBootstrap />
      <SiteNav />
      {/* Bottom padding on mobile clears the fixed bottom navigation bar. */}
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-6">
        {children}
      </main>
      {/* One mount point: every shell screen gets the report control without
          each page remembering to add one. */}
      <ReportIssue />
    </div>
  );
}
