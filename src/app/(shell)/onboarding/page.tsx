import type { Metadata } from "next";
import OnboardingFlow from "./OnboardingFlow";

export const metadata: Metadata = { title: "Get started — Maggie's Trail" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-xl">
      <OnboardingFlow />
      <p className="mt-6 text-center text-sm text-ink/70 dark:text-paper/70">
        Prefer a quick skill check?{" "}
        <a href="/placement" className="inline-flex min-h-11 items-center px-2 font-bold text-sky-ink hover:underline">
          Take the 5-question placement →
        </a>
      </p>
    </div>
  );
}
