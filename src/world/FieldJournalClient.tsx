"use client";
/**
 * Phase D — the Journal's data loader. Reuses the SAME `/notebook-index.json` the existing
 * notebook fetches (emitted by gen-manifest), so the Journal cannot disagree with the notebook
 * about what a learner has established, and adds no new build artefact.
 */
import { useEffect, useState } from "react";
import { buildNotebook, type NotebookIndex, type NotebookSection } from "@/lib/notebook";
import { progressStore } from "@/lib/progress";
import { localDateStr } from "@/lib/engine";
import { FieldJournal } from "./FieldJournal";

export function FieldJournalClient() {
  const [sections, setSections] = useState<NotebookSection[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/notebook-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((index: NotebookIndex) => {
        if (live) setSections(buildNotebook(index, progressStore.load(), localDateStr(new Date())));
      })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  if (failed) {
    return (
      <p className="text-sm text-content-2">
        The journal couldn&apos;t load just now. Your completed waypoints are still saved on this device.
      </p>
    );
  }
  if (!sections) return <p className="sr-only">Opening your field journal…</p>;
  return <FieldJournal sections={sections} />;
}
