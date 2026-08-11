"use client";
/**
 * ASSIGNMENTS CARD — "From your teacher", on the learner dashboard.
 *
 * Reads the active roster child's published assignments through the guarded
 * /api/assignments route. The card is strictly additive to the local-first
 * dashboard: signed out, no durable DB, not enrolled anywhere, or nothing
 * assigned all render NOTHING — a solo learner never sees an institutional
 * hole in their trail. Completion state comes from the same synced
 * lesson_completions the teacher's view reads, so both sides agree.
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getRoster } from "@/lib/roster";
import { AppIcon, Badge, ProgressBar } from "@/components/ui";

type Status = "not-started" | "in-progress" | "on-time" | "late";
interface LearnerAssignment {
  id: string;
  className: string;
  title: string;
  instructions: string;
  dueDate: string | null;
  lessons: Array<{ id: string; title: string; completed: boolean }>;
  status: Status;
}

const STATUS_TONE: Record<Status, "muted" | "sky" | "leaf" | "berry"> = {
  "not-started": "muted",
  "in-progress": "sky",
  "on-time": "leaf",
  late: "berry"
};
const STATUS_LABEL: Record<Status, string> = {
  "not-started": "not started",
  "in-progress": "in progress",
  "on-time": "done",
  late: "done late"
};

export default function AssignmentsCard() {
  const [assignments, setAssignments] = useState<LearnerAssignment[] | null>(null);

  useEffect(() => {
    const learnerId = getRoster().activeId;
    if (!learnerId) return;
    let cancelled = false;
    fetch(`/api/assignments?learnerId=${encodeURIComponent(learnerId)}`, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { assignments?: LearnerAssignment[] } | null) => {
        if (!cancelled && d && Array.isArray(d.assignments)) setAssignments(d.assignments);
      })
      .catch(() => {
        /* silent: the dashboard stays local-first */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!assignments || assignments.length === 0) return null;

  return (
    <section className="mt-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-ink">
        <AppIcon name="route" size={14} /> From your teacher
      </p>
      <ul className="space-y-2">
        {assignments.map((a) => {
          const doneCount = a.lessons.filter((l) => l.completed).length;
          const nextLesson = a.lessons.find((l) => !l.completed);
          return (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-sky/30 bg-sky/5 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{a.title}</span>
                  <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {a.className}
                  {a.dueDate ? ` · due ${a.dueDate}` : ""}
                </p>
                {a.lessons.length > 1 && (
                  <div className="mt-2 max-w-xs">
                    <ProgressBar
                      value={doneCount}
                      max={a.lessons.length}
                      tone="sky"
                      label={`${doneCount} of ${a.lessons.length} lessons complete`}
                    />
                  </div>
                )}
              </div>
              {nextLesson ? (
                <Link
                  href={`/learn/${nextLesson.id}`}
                  className="pressable shrink-0 rounded-full bg-cta px-5 py-3 font-extrabold text-white shadow-e1 hover:shadow-e2"
                >
                  {doneCount > 0 ? "Continue" : "Start"}
                </Link>
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 font-extrabold text-leaf-ink">
                  <AppIcon name="check" size={18} /> Complete
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
