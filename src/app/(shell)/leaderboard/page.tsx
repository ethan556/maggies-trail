import type { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = { title: "League — Maggie's Trail" };

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Weekly league</h1>
      <div className="mt-5">
        <LeaderboardClient />
      </div>
    </div>
  );
}
