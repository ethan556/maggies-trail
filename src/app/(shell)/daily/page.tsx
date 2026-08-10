import type { Metadata } from "next";
import DailyClient from "./DailyClient";

export const metadata: Metadata = { title: "Daily Challenge — Maggie's Trail" };

export default function DailyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Daily Challenge</h1>
      <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
        Fresh problems every day at your midnight — one per category.
      </p>
      <div className="mt-6">
        <DailyClient />
      </div>
    </div>
  );
}
