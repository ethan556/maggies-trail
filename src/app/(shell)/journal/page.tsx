import type { Metadata } from "next";
import { localDateStr } from "@/lib/engine";
import { PILOT_REGION_ID, regionWorld } from "@/world/worldServer";
import { WorldShell } from "@/world/WorldShell";
import { FieldJournalClient } from "@/world/FieldJournalClient";

export const metadata: Metadata = { title: "Field Journal — Maggie's Trail" };

export default function JournalPage() {
  const manifest = regionWorld(PILOT_REGION_ID);
  return (
    <WorldShell manifest={manifest} today={localDateStr(new Date())}>
      <h1 className="text-3xl font-extrabold tracking-tight">Field Journal</h1>
      <p className="mt-1 text-body-lg text-content-2">
        What you&apos;ve established, trail by trail — with the route state of each idea.
      </p>
      <div className="mt-5">
        <FieldJournalClient />
      </div>
    </WorldShell>
  );
}
