"use client";
/**
 * Phase D — Field Journal (§17). Built ON the existing notebook model (`buildNotebook`), not
 * beside it: same cards, same retained-mastery and fading signals, reorganised by trail and
 * annotated with route state. Duplicating that model would have created a second source of
 * truth about what a learner knows.
 *
 * §17 asks for organisation by trail and a real entry — visual model, takeaway, review status —
 * rather than a scrapbook of generic summaries. Takeaways here are the AUTHORED recap text
 * already in the corpus; nothing is generated.
 */
import Link from "next/link";
import { Surface } from "@/components/ui";
import type { NotebookSection } from "@/lib/notebook";
import { useWorld } from "./WorldShell";
import { WORLD_STATES } from "./worldCopy";
import { waypointHref } from "./worldNav";

export function FieldJournal({ sections }: { sections: NotebookSection[] }) {
  const { world } = useWorld();
  const withCards = sections.filter((s) => s.cards.length > 0);

  if (withCards.length === 0) {
    return (
      <Surface border className="rounded-card p-6 text-center">
        <p className="text-body-lg text-content-2">{WORLD_STATES.emptyJournal}</p>
      </Surface>
    );
  }

  const dueLessons = new Set(
    world.evidence.review.filter((r) => r.due <= world.today).map((r) => r.lessonId)
  );

  return (
    <div className="space-y-8">
      {withCards.map((section) => (
        <section key={section.courseTitle} aria-labelledby={`fj-${slug(section.courseTitle)}`}>
          <h2 id={`fj-${slug(section.courseTitle)}`} className="text-lg font-extrabold">
            {section.courseTitle}
          </h2>
          <ul aria-labelledby={`fj-${slug(section.courseTitle)}`} className="mt-3 grid gap-3 sm:grid-cols-2">
            {section.cards.map((card) => {
              const due = dueLessons.has(card.id);
              return (
                <li key={card.id}>
                  <Surface border className="h-full rounded-card p-4">
                    <h3 className="text-base font-extrabold">{card.title}</h3>
                    {card.takeaways.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-content-2">
                        {card.takeaways.slice(0, 3).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-xs text-content-2">
                      {due
                        ? "A return path is ready — walking it restores the route."
                        : card.fading
                          ? "This route is fading; it will return soon."
                          : card.retained === null
                            ? "Walked — no graded evidence on its ideas yet."
                            : "Holding."}
                    </p>
                    <Link
                      href={waypointHref(card.id)}
                      className="mt-2 inline-flex min-h-[44px] items-center text-sm font-extrabold text-sky-ink underline"
                    >
                      Revisit this waypoint
                    </Link>
                  </Surface>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
