import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog, getSkillPrereqs } from "@/lib/content.server";
import { loadPlacementBank } from "@/lib/placementBank.server";
import PlacementFlow from "./PlacementFlow";
import type { Goal } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Placement — Maggie's Trail" };

export default async function PlacementPage({ searchParams }: { searchParams: Promise<{ grade?: string; goal?: string }> }) {
  const [cat, prereqs, sp, placementBank] = await Promise.all([getCatalog(), getSkillPrereqs(), searchParams, loadPlacementBank()]);

  // Trim the prereq map to the transitive closure of the bank tags — a few dozen entries, not the
  // whole 1000+ map — so the client gets exactly what seeding needs and nothing more.
  const need = new Set<string>();
  const stack = placementBank.map((b) => b.tag);
  while (stack.length) {
    const t = stack.pop() as string;
    if (need.has(t)) continue;
    need.add(t);
    for (const p of prereqs[t] ?? []) stack.push(p);
  }
  const trimmed: Record<string, string[]> = {};
  for (const t of need) if (prereqs[t]) trimmed[t] = prereqs[t];

  const titleBySlug: Record<string, string> = {};
  const lessonByTag: Record<string, string> = {};
  for (const b of placementBank) {
    const c = cat.courses.find((x) => x.course.slug === b.courseSlug);
    if (c) titleBySlug[b.courseSlug] = c.course.title;
    const lid = cat.skillFirstLesson[b.tag];
    if (lid) lessonByTag[b.tag] = lid;
  }

  const parsedGrade = sp?.grade != null ? Number(sp.grade) : NaN;
  const initialGrade = Number.isFinite(parsedGrade) && parsedGrade >= 0 && parsedGrade <= 13 ? parsedGrade : null;
  const onboardingGoal: Goal | null = sp?.goal === "school" || sp?.goal === "catchup" || sp?.goal === "ahead" ? sp.goal : null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Find your starting point</h1>
      <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
        A 12-item, domain-balanced diagnostic estimates your starting point and its uncertainty. It uses repeated evidence, confidence calibration, and prerequisite logic so one lucky answer cannot create false mastery.
      </p>
      <Link href="/placement/methodology" className="mt-2 inline-flex min-h-11 items-center px-2 text-xs font-extrabold text-sky-ink underline underline-offset-2">How calibration and privacy work</Link>
      <div className="mt-5">
        <PlacementFlow bank={placementBank} prereqs={trimmed} courseTitles={titleBySlug} lessonByTag={lessonByTag} initialGrade={initialGrade} onboardingGoal={onboardingGoal} />
      </div>
    </div>
  );
}
