import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug } from "@/lib/content.server";

/**
 * Canonical-course rule (S201): Basecamp is the single course surface, so this route resolves the
 * slug and redirects rather than maintaining a second course UI.
 *
 * S202 downgrades the redirect from 308 to 307. A 308 is cached by browsers effectively forever,
 * which is a one-way door taken before Basecamp had a single runtime-verified execution. 307 is
 * reversible; it can be promoted the day the browser suite is green on the rolled-out surface.
 */
export async function generateMetadata({
  params
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCourseBySlug(slug);
  return { title: entry ? `${entry.course.title} — Maggie's Trail` : "Course — Maggie's Trail" };
}

export default async function CoursePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getCourseBySlug(slug);
  if (!entry) notFound();
  redirect(`/basecamp/${entry.course.id}`);
}
