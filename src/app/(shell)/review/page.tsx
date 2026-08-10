import type { Metadata } from "next";
import ReviewClient from "./ReviewClient";
import MissedPredictionsCard from "@/components/MissedPredictionsCard";

export const metadata: Metadata = { title: "Review — Maggie's Trail" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-extrabold">Review</h1>
      <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
        Real spaced repetition: beat each missed check four times, spaced further apart each win.
      </p>
      <div className="mt-6 grid gap-4">
        <MissedPredictionsCard />
        <ReviewClient />
      </div>
    </div>
  );
}
