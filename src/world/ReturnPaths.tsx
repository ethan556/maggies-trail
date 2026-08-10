"use client";
/**
 * Phase D — Return Paths (§16). A presentation layer over the EXISTING 1/3/7/21 scheduler; no
 * scheduling logic lives here and none is changed. What it adds is the explanation the raw
 * queue never gave: why this concept came back, how far along its retention ladder it is, and
 * what restoring it would mean.
 *
 * §16's constraint is that forgetting is never shamed. So the copy describes the ROUTE, not
 * the learner: a path fades, memory is a thing that needs walking, and restoring one is
 * ordinary maintenance rather than a correction.
 */
import Link from "next/link";
import { Surface } from "@/components/ui";
import { daysBetween } from "./revealRules";
import { useWorld } from "./WorldShell";
import { waypointHref } from "./worldNav";

/** The 1/3/7/21 ladder, named for learners. Box index = the NEXT interval. */
const RUNG = ["first return", "three-day return", "week-long return", "three-week return"];

export function ReturnPaths({ lessonTitles = {} }: { lessonTitles?: Record<string, string> }) {
  const { world } = useWorld();
  const items = [...world.evidence.review]
    .map((r) => ({ ...r, overdueBy: daysBetween(r.due, world.today) }))
    .sort((a, b) => b.overdueBy - a.overdueBy || a.lessonId.localeCompare(b.lessonId));

  const due = items.filter((i) => i.overdueBy >= 0);

  if (due.length === 0) {
    return (
      <p className="text-sm text-content-2">
        Your current routes are holding. {items.length > 0 ? `${items.length} scheduled further ahead.` : ""}
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {due.map((r) => (
        <li key={`${r.lessonId}:${r.conceptTag}`}>
          <Surface border className="rounded-card p-3">
            <Link href={waypointHref(r.lessonId)} className="flex min-h-[44px] flex-wrap items-center justify-between gap-2">
              <span>
                <span className="block font-bold">{lessonTitles[r.lessonId] ?? r.lessonId}</span>
                <span className="block text-xs capitalize text-content-2">{r.conceptTag.replaceAll("-", " ")}</span>
              </span>
              <span className="text-xs text-content-2">
                {r.overdueBy > 0
                  ? `Fading — ${r.overdueBy} day${r.overdueBy === 1 ? "" : "s"} past its ${RUNG[Math.min(r.box, RUNG.length - 1)]}`
                  : `Ready today — ${RUNG[Math.min(r.box, RUNG.length - 1)]}`}
              </span>
            </Link>
          </Surface>
        </li>
      ))}
    </ul>
  );
}
