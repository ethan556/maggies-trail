"use client";
/**
 * TEACH — the teacher surface, rendered entirely from the persisted teacher
 * store (`numera:teach:v1:{account}`) and real learner profiles, through the
 * permission-guarded functions in teacher.ts. On a shared classroom device
 * the whole loop works today: create a class, a learner joins with the code,
 * assign work, watch real completion dates land. Across devices the same
 * store rides the account-scoped sync layer when its transport arrives.
 *
 * Sign-in gate: the store is keyed by account, so no session → no store.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authProvider, SESSION_CHANGED_EVENT } from "@/lib/auth";
import { getRoster } from "@/lib/roster";
import { readChildProfile } from "@/lib/roster";
import { isLocalDateString, localDateStr } from "@/lib/engine";
import type { ManifestCourse } from "@/lib/family";
import type { Actor } from "@/lib/permissions";
import {
  assignmentCsv,
  assignmentProgress,
  classForCode,
  classSummary,
  commonMisconceptions,
  emptyTeachStore,
  interventionGroups,
  joinCodeFor,
  masteryHeatmap,
  ownershipFrom,
  readTeachStore,
  summaryCsv,
  writeTeachStore,
  type Assignment,
  type AssignmentKind,
  type TeachStore
} from "@/lib/teacher";

const KINDS: Array<{ kind: AssignmentKind; label: string }> = [
  { kind: "lesson", label: "Lesson" },
  { kind: "course", label: "Course" },
  { kind: "domain", label: "Domain" },
  { kind: "review", label: "Review (clear the queue)" },
  { kind: "diagnostic", label: "Diagnostic lesson" },
  { kind: "challenge", label: "Challenge lesson" }
];

const uid = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

/**
 * Best-effort mirror of a new class into /api/class.
 *
 * Local-first, deliberately: the class is already in the local store before this runs, so a
 * teacher on a plane still gets a working classroom. When the server answers, it owns the join
 * code — a locally derived code is unique only within one browser, so two devices could mint the
 * same one. Any failure (offline, unauthenticated, no server-side database) resolves to null and
 * the class simply stays device-local.
 */
async function mirrorClassToServer(name: string): Promise<{ classId: string; joinCode: string } | null> {
  try {
    const res = await fetch("/api/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "create", name })
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { classId?: string; joinCode?: string };
    return j.classId && j.joinCode ? { classId: j.classId, joinCode: j.joinCode } : null;
  } catch {
    return null;
  }
}

function saveBlob(text: string, filename: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TeachClient({
  courses,
  tagGrades
}: {
  courses: ManifestCourse[];
  tagGrades: Record<string, number>;
}) {
  const today = localDateStr(new Date());
  const [accountId, setAccountId] = useState<string | null>(null);
  const [store, setStore] = useState<TeachStore>(emptyTeachStore());
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [newClass, setNewClass] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinChild, setJoinChild] = useState("");
  const [aKind, setAKind] = useState<AssignmentKind>("lesson");
  const [aRef, setARef] = useState("");
  const [aDue, setADue] = useState(today);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const readSession = () => {
      const session = authProvider.currentSession();
      if (!session) {
        setAccountId(null);
        setStore(emptyTeachStore());
        setActiveClass(null);
        return;
      }
      setAccountId(session.accountId);
      const next = readTeachStore(session.accountId);
      setStore(next);
      setActiveClass((current) =>
        current && next.classes.some((item) => item.id === current) ? current : (next.classes[0]?.id ?? null)
      );
    };
    readSession();
    window.addEventListener(SESSION_CHANGED_EVENT, readSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, readSession);
  }, []);

  const roster = typeof window === "undefined" ? null : getRoster();

  if (!accountId) {
    return (
      <div className="rounded-card border-2 border-dashed border-ink/20 p-6 dark:border-paper/20">
        <h1 className="text-2xl font-extrabold">Teach</h1>
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
          Classes, join codes, assignments, and honest progress reporting live under your account, so
          they follow you and stay separate from other adults on this device.
        </p>
        <Link href="/account" className="pressable mt-3 inline-block min-h-11 rounded-full bg-cta px-5 py-2.5 font-extrabold text-white hover:bg-sky/90">
          Sign in to start →
        </Link>
      </div>
    );
  }

  const actor: Actor = { role: "teacher", accountId };
  const ctx = { rosterOf: {}, schoolTeachers: {}, adminSchool: {}, ...ownershipFrom(accountId, store) };
  const commit = (next: TeachStore) => {
    setStore(next);
    writeTeachStore(accountId, next);
  };

  const cls = store.classes.find((c) => c.id === activeClass) ?? null;
  const members = cls
    ? store.links
        .filter((l) => l.classId === cls.id)
        .map((l) => ({
          childId: l.childId,
          name: roster?.children.find((c) => c.id === l.childId)?.name ?? "Learner",
          profile: readChildProfile(l.childId)
        }))
    : [];
  const clsAssignments = cls ? store.assignments.filter((a) => a.classId === cls.id) : [];

  const refOptions = (): Array<{ id: string; label: string }> => {
    if (aKind === "course") return courses.map((c) => ({ id: c.id, label: c.title }));
    if (aKind === "domain") {
      const seen = new Map<string, string>();
      for (const c of courses) seen.set(`${c.gradeLevel}:${c.category}`, `Grade ${c.gradeLevel} ${c.category}`);
      return [...seen.entries()].map(([id, label]) => ({ id, label }));
    }
    if (aKind === "review") return [{ id: "-", label: "Spaced review queue" }];
    return courses.flatMap((c) => c.lessons.map((l) => ({ id: l.id, label: `${l.title} (${c.title})` })));
  };

  const createAssignment = () => {
    if (!cls || !aRef) return;
    if (!isLocalDateString(aDue)) {
      setNotice("Choose a valid due date before assigning the work.");
      return;
    }
    const label = refOptions().find((o) => o.id === aRef)?.label ?? aRef;
    const a: Assignment = {
      id: uid(),
      classId: cls.id,
      kind: aKind,
      refId: aRef,
      title: label,
      dueDate: aDue,
      createdAt: today
    };
    commit({ ...store, assignments: [...store.assignments, a] });
    setNotice(`Assigned “${label}” — due ${aDue}.`);
  };

  const join = () => {
    const target = classForCode(accountId, store, joinCode);
    if (!target || !joinChild) {
      setNotice("That code doesn't match one of your classes.");
      return;
    }
    if (store.links.some((l) => l.classId === target.id && l.childId === joinChild)) {
      setNotice("Already in the class.");
      return;
    }
    commit({ ...store, links: [...store.links, { classId: target.id, childId: joinChild, joinedAt: today }] });
    setNotice(`Joined ${target.name}.`);
    setJoinCode("");
  };

  const summary = cls && members.length ? classSummary(actor, cls.id, members, ctx, today) : [];
  const heat = cls && members.length ? masteryHeatmap(actor, cls.id, members, tagGrades, ctx, today) : null;
  const misc = cls && members.length ? commonMisconceptions(actor, cls.id, members, ctx) : [];
  const groups = cls && members.length ? interventionGroups(actor, cls.id, members, ctx, today) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Teach</h1>
        <p className="mt-1 text-sm text-ink/70 dark:text-paper/70">
          Real records, plainly reported: what each learner met, practiced, mastered, kept, and can
          use anywhere — never a screen-time score.
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded border-2 border-sky/40 bg-sky/10 px-3 py-2 text-sm font-bold">
          {notice}
        </p>
      )}

      {/* Classes */}
      <section aria-label="classes" className="flex flex-wrap items-center gap-2">
        {store.classes.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveClass(c.id)}
            className={`min-h-11 rounded-pill border-2 px-4 font-bold ${c.id === activeClass ? "border-tangerine bg-tangerine/10" : "border-ink/15 dark:border-paper/20"}`}
          >
            {c.name}
          </button>
        ))}
        <input
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          placeholder="New class name"
          aria-label="new class name"
          maxLength={100}
          className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15"
        />
        <button
          type="button"
          disabled={!newClass.trim()}
          onClick={() => {
            const name = newClass.trim();
            const c = { id: uid(), name, createdAt: today };
            commit({ ...store, classes: [...store.classes, c] });
            setActiveClass(c.id);
            setNewClass("");
            // Then upgrade it to a cross-device class if a server is listening.
            void mirrorClassToServer(name).then((server) => {
              if (!server) return;
              setStore((cur) => {
                const next = {
                  ...cur,
                  classes: cur.classes.map((k) =>
                    k.id === c.id ? { ...k, serverId: server.classId, serverCode: server.joinCode } : k
                  )
                };
                writeTeachStore(accountId, next);
                return next;
              });
            });
          }}
          className="pressable min-h-11 rounded-full bg-cta-good px-5 font-extrabold text-white hover:bg-leaf/90 disabled:opacity-40"
        >
          Create
        </button>
      </section>

      {cls && (
        <>
          {/* Join code + learner join (shared-device flow, real links) */}
          <section aria-label="join code" className="rounded-card border border-ink/10 p-4 dark:border-paper/12">
            <p className="text-sm">
              Join code for <span className="font-extrabold">{cls.name}</span>:{" "}
              <code className="rounded bg-ink/5 px-2 py-0.5 text-lg font-extrabold tracking-widest dark:bg-paper/10">
                {cls.serverCode ?? joinCodeFor(accountId, cls.id)}
              </code>
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2 text-sm">
              <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
                Learner on this device
                <select
                  value={joinChild}
                  onChange={(e) => setJoinChild(e.target.value)}
                  aria-label="learner to join"
                  className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15"
                >
                  <option value="">Choose…</option>
                  {roster?.children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
                Code
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  aria-label="class join code"
                  className="min-h-11 w-32 rounded border-2 border-ink/15 bg-transparent px-3 font-extrabold tracking-widest dark:border-paper/15"
                />
              </label>
              <button type="button" onClick={join} disabled={!joinCode.trim() || !joinChild} className="pressable min-h-11 rounded-full bg-cta px-5 font-extrabold text-white hover:bg-sky/90 disabled:opacity-40">
                Join class
              </button>
            </div>
          </section>

          {/* Assignments */}
          <section aria-label="assignments" className="rounded-card border border-ink/10 p-4 dark:border-paper/12">
            <h2 className="font-extrabold">Assignments</h2>
            <div className="mt-2 flex flex-wrap items-end gap-2 text-sm">
              <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
                Kind
                <select value={aKind} onChange={(e) => { setAKind(e.target.value as AssignmentKind); setARef(""); }} aria-label="assignment kind" className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15">
                  {KINDS.map((k) => (
                    <option key={k.kind} value={k.kind}>{k.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-48 flex-1 gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
                What
                <select value={aRef} onChange={(e) => setARef(e.target.value)} aria-label="assignment target" className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15">
                  <option value="">Choose…</option>
                  {refOptions().map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-ink/70 dark:text-paper/70">
                Due
                <input type="date" value={aDue} onChange={(e) => setADue(e.target.value)} aria-label="due date" className="min-h-11 rounded border-2 border-ink/15 bg-transparent px-3 font-bold dark:border-paper/15" />
              </label>
              <button type="button" onClick={createAssignment} disabled={!aRef || !isLocalDateString(aDue)} className="pressable min-h-11 rounded-full bg-cta-good px-5 font-extrabold text-white hover:bg-leaf/90 disabled:opacity-40">
                Assign
              </button>
            </div>

            <ul className="mt-3 space-y-2">
              {clsAssignments.map((a) => {
                const rows = members.length ? assignmentProgress(actor, a, members, courses, ctx, today) : [];
                return (
                  <li key={a.id} className="rounded border border-ink/10 p-3 text-sm dark:border-paper/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p>
                        <span className="font-extrabold">{a.title}</span>{" "}
                        <span className="text-ink/70 dark:text-paper/70">· {a.kind} · due {a.dueDate}</span>
                      </p>
                      <button type="button" onClick={() => saveBlob(assignmentCsv(rows, a), `assignment-${a.id}.csv`)} className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-3 text-xs font-bold dark:border-paper/20">
                        CSV
                      </button>
                    </div>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {rows.map((r) => (
                        <li key={r.childId} className={`rounded-pill px-2 py-0.5 text-xs font-bold ${r.status === "on-time" ? "bg-leaf/15 text-leaf-ink" : r.status === "late" ? "bg-tangerine/15 text-tangerine-ink" : "bg-ink/8 text-ink/70 dark:bg-paper/10 dark:text-paper/70"}`}>
                          {r.name}: {r.status}
                        </li>
                      ))}
                      {rows.length === 0 && <li className="text-xs text-ink/70 dark:text-paper/70">No learners in the class yet.</li>}
                    </ul>
                  </li>
                );
              })}
              {clsAssignments.length === 0 && <li className="text-sm text-ink/70 dark:text-paper/70">Nothing assigned yet.</li>}
            </ul>
          </section>

          {/* Class report */}
          {members.length > 0 && (
            <section aria-label="class report" className="rounded-card border border-ink/10 p-4 dark:border-paper/12">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-extrabold">Class report</h2>
                <button type="button" onClick={() => saveBlob(summaryCsv(summary), `${cls.name.toLowerCase().replace(/\s+/g, "-")}-summary.csv`)} className="pressable min-h-11 rounded-pill border-2 border-ink/15 px-3 text-xs font-bold dark:border-paper/20">
                  Export CSV
                </button>
              </div>

              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">
                      <th className="py-1 pr-2">Learner</th>
                      <th className="py-1 pr-2">Active (14d)</th>
                      <th className="py-1 pr-2">Lessons</th>
                      <th className="py-1 pr-2">Review</th>
                      <th className="py-1 pr-2">Uses anywhere</th>
                      <th className="py-1 pr-2">Still has it</th>
                      <th className="py-1">Got it</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((r) => (
                      <tr key={r.name} className="border-t border-ink/8 dark:border-paper/10">
                        <td className="py-1.5 pr-2 font-bold">{r.name}</td>
                        <td className="py-1.5 pr-2 tabular-nums">{r.activeDays14}</td>
                        <td className="py-1.5 pr-2 tabular-nums">{r.lessonsDone}</td>
                        <td className={`py-1.5 pr-2 font-bold ${r.reviewOnTrack ? "text-leaf-ink" : "text-tangerine-ink"}`}>{r.reviewOnTrack ? "on track" : "overdue"}</td>
                        <td className="py-1.5 pr-2 tabular-nums">{r.ladder.transferable}</td>
                        <td className="py-1.5 pr-2 tabular-nums">{r.ladder.retained}</td>
                        <td className="py-1.5 tabular-nums">{r.ladder.mastered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {heat && heat.domains.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">Mastery heatmap</h3>
                  <div className="mt-1 overflow-x-auto">
                    <table className="text-sm">
                      <thead>
                        <tr>
                          <th className="pr-2 text-left text-xs font-bold text-ink/70 dark:text-paper/70">Learner</th>
                          {heat.domains.map((d) => (
                            <th key={d} className="px-1 text-xs font-bold text-ink/70 dark:text-paper/70">{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heat.rows.map((r) => (
                          <tr key={r.name}>
                            <td className="pr-2 font-bold">{r.name}</td>
                            {r.cells.map((c, i) => (
                              <td key={i} className="px-1 py-0.5">
                                <span
                                  title={["not yet", "practicing", "got it", "still has it"][c.level]}
                                  className={`block h-5 w-9 rounded text-center text-[10px] font-extrabold leading-5 ${["bg-ink/8 text-ink/70 dark:bg-paper/10 dark:text-paper/70", "bg-sky/25 text-sky-ink", "bg-leaf/30 text-leaf-ink", "bg-cta-good text-white"][c.level]}`}
                                >
                                  {["—", "○", "✓", "★"][c.level]}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {misc.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">Common sticking points</h3>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {misc.slice(0, 4).map((m) => (
                      <li key={m.signal}>
                        <span className="font-bold">{m.learners} learner{m.learners === 1 ? "" : "s"}</span>{" "}
                        <span className="text-ink/70 dark:text-paper/70">— {m.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {groups.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink/70 dark:text-paper/70">Small groups worth pulling</h3>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {groups.slice(0, 3).map((g) => (
                      <li key={g.tag}>
                        <span className="font-bold">{g.names.join(", ")}</span>{" "}
                        <span className="text-ink/70 dark:text-paper/70">— same slipping skill ({g.tag}); five shared minutes beats three separate reteaches.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
