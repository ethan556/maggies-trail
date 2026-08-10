"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ParentReport, { type SkillLabel } from "@/components/ParentReport";
import FamilyDashboard from "@/components/FamilyDashboard";
import type { ManifestCourse } from "@/lib/family";
import { computeStreak, dueItems, localDateStr } from "@/lib/engine";
import { summarize } from "@/lib/mastery";
import type { Profile } from "@/lib/progress";
import { addChild, getRoster, readChildProfile, removeChild, renameChild, setActiveChild, type Roster } from "@/lib/roster";

function childStats(p: Profile, today: string) {
  const s = summarize(p.mastery ?? {});
  return {
    xp: p.xp,
    streak: computeStreak(p.activity, today).streak,
    skills: s.total,
    proficient: s.masteredOrProficient,
    avg: Math.round(s.averageMastery * 100),
    due: dueItems(p.review, today).length,
    lessons: Object.values(p.lessons).filter((l) => l.completed).length
  };
}

export default function FamilyClient({
  skills,
  courses,
  tagGrades
}: {
  skills: Record<string, SkillLabel>;
  courses: ManifestCourse[];
  tagGrades: Record<string, number>;
}) {
  const today = localDateStr(new Date());
  const [roster, setRoster] = useState<Roster | null>(null);
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setRoster(getRoster());
  }, []);

  if (!roster) return null;

  const add = () => {
    if (!newName.trim()) return;
    const g = newGrade === "" ? undefined : Number(newGrade);
    setRoster(addChild(newName, Number.isFinite(g as number) ? (g as number) : undefined));
    setNewName("");
    setNewGrade("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Family</h1>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          One place to see every learner. Switch the active learner to pick up their trail — the
          whole app follows the switch.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {roster.children.map((c) => {
          const st = childStats(readChildProfile(c.id), today);
          const active = c.id === roster.activeId;
          return (
            <li
              key={c.id}
              className={`rounded-card border p-4 shadow-e1 ${active ? "border-tangerine/60 bg-tangerine/5" : "border-ink/10 bg-surface dark:border-paper/12"}`}
            >
              <div className="flex items-start justify-between gap-2">
                {editing === c.id ? (
                  <input
                    autoFocus
                    value={editName}
                    aria-label="learner name"
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => {
                      setRoster(renameChild(c.id, editName));
                      setEditing(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setRoster(renameChild(c.id, editName));
                        setEditing(null);
                      }
                    }}
                    className="w-full rounded border-2 border-sky bg-transparent px-2 py-1 font-extrabold"
                  />
                ) : (
                  <div>
                    <p className="text-lg font-extrabold">{c.name}</p>
                    {c.grade != null && <p className="text-xs font-bold text-ink/70 dark:text-paper/70">Grade {c.grade === 0 ? "K" : c.grade}</p>}
                  </div>
                )}
                {active && <span className="shrink-0 rounded-full bg-tangerine px-2 py-0.5 text-xs font-extrabold text-night">active</span>}
              </div>

              <ul className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "XP", v: st.xp },
                  { k: "Streak", v: st.streak },
                  { k: "Lessons", v: st.lessons },
                  { k: "Skills", v: st.skills },
                  { k: "Proficient+", v: st.proficient },
                  { k: "Avg %", v: st.avg }
                ].map((m) => (
                  <li key={m.k} className="rounded border border-ink/10 py-1 dark:border-paper/10">
                    <p className="text-base font-extrabold tabular-nums">{m.v}</p>
                    <p className="text-[10px] font-bold text-ink/70 dark:text-paper/70">{m.k}</p>
                  </li>
                ))}
              </ul>
              {st.due > 0 && <p className="mt-2 text-xs font-bold text-tangerine-ink">{st.due} skill{st.due === 1 ? "" : "s"} due for review</p>}

              {active && (
                <div className="mt-4 space-y-4 border-t-2 border-tangerine/25 pt-4">
                  <FamilyDashboard
                    name={c.name}
                    profile={readChildProfile(c.id)}
                    courses={courses}
                    tagGrades={tagGrades}
                    skills={skills}
                    today={today}
                  />
                  <ParentReport
                    mastery={readChildProfile(c.id).mastery ?? {}}
                    skills={skills}
                    dueCount={st.due}
                    today={today}
                    childName={c.name}
                  />
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {!active && (
                  <button
                    type="button"
                    onClick={() => setRoster(setActiveChild(c.id))}
                    className="pressable min-h-11 rounded-full bg-cta px-4 font-extrabold text-white hover:bg-sky/90"
                  >
                    Make active
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditing(c.id);
                    setEditName(c.name);
                  }}
                  className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-4 font-bold transition-colors hover:border-sky hover:text-sky-ink dark:border-paper/20"
                >
                  Rename
                </button>
                {roster.children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRoster(removeChild(c.id))}
                    className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-4 font-bold text-berry-ink transition-colors hover:border-berry dark:border-paper/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="rounded-card border-2 border-dashed border-ink/20 p-4 dark:border-paper/20">
        <p className="font-extrabold">Add a learner</p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
            Name
            <input value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="new learner name"
              className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
            Grade (optional)
            <input value={newGrade} onChange={(e) => setNewGrade(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" aria-label="new learner grade"
              className="min-h-11 w-24 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15" />
          </label>
          <button type="button" onClick={add} disabled={!newName.trim()}
            className="pressable min-h-11 rounded-full bg-cta-good px-5 font-extrabold text-white hover:bg-leaf/90 disabled:opacity-40">
            Add
          </button>
        </div>
      </div>

      <p className="text-xs text-ink/70 dark:text-paper/70">
        Progress saves on this device first, so nothing is lost offline. Sign in to sync a learner
        across devices and to put the whole roster on one family plan.{" "}
        <Link href="/account" className="font-bold text-sky-ink hover:underline">Account &amp; sync →</Link>
        {" · "}
        <Link href="/premium" className="font-bold text-sky-ink hover:underline">See plans →</Link>
      </p>
    </div>
  );
}
