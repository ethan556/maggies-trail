import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center px-5 py-12">
      <section className="w-full rounded-card border border-ink/10 bg-surface p-6 text-center shadow-e2 dark:border-paper/12">
        <p className="text-xs font-extrabold uppercase tracking-widest text-tangerine-ink">404 · Trail marker missing</p>
        <h1 className="mt-2 text-3xl font-extrabold">That page isn’t here.</h1>
        <p className="mt-3 text-ink/70 dark:text-paper/70">
          The link may be old, or the lesson may have moved. Continue from the course catalog instead.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/courses" className="pressable inline-flex min-h-11 items-center rounded-pill bg-cta px-5 py-2.5 font-extrabold text-white hover:bg-sky/90">
            Browse courses
          </Link>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-pill border border-ink/15 px-5 py-2.5 font-extrabold hover:border-sky dark:border-paper/20">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
