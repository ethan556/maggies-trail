"use client";
/**
 * TEACH · CLASS — the durable, cross-device class surface over the server
 * services. Distinct from the device-local TeachClient store: this reads and
 * writes the audited institutional tables (assignments, tier projections,
 * intervention cases) through the guarded routes. Authority is re-derived
 * server-side on every call; the client trusts nothing.
 *
 * Trail language, deliberately: the class reads as a section of trail. The
 * tier distribution is a trail bar walking leaf → tangerine → berry (the same
 * semantic palette the lesson player uses: leaf = confirmed, tangerine =
 * attention, berry = needs correction), section labels carry the waymark rail,
 * and assignments are picked from the real curriculum manifest rather than
 * typed in as raw IDs — a teacher should never have to memorize "kc-01-01".
 *
 * No durable DB or wrong teacher → calm empty state, never an error wall.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, EmptyState, Notice, SectionHeader, StatTile, Surface } from "@/components/ui";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import type { PickerCourse } from "./page";

type ProgressStatus = "not-started" | "in-progress" | "on-time" | "late";
type AssignmentRow = {
  id: string;
  kind: "lesson" | "course";
  refId: string;
  title: string;
  dueDate: string | null;
  published: boolean;
  archived: boolean;
  lessonCount: number;
  counts: Record<ProgressStatus, number>;
};
type Tier = 1 | 2 | 3;
type LearnerTier = {
  learnerId: string;
  name: string;
  avatarId?: string;
  tier: Tier;
  reasons: Array<{ code: string; detail: string }>;
  attempted: number;
  proficient: number;
  fading: number;
  activeDays14: number;
  focusTags: string[];
};
type TierCounts = { tier1: number; tier2: number; tier3: number; total: number };
type Group = { tag: string; members: Array<{ learnerId: string; name: string; avatarId?: string; tier: Tier }>; urgency: Tier };
type Insights = { tiers: LearnerTier[]; groups: Group[]; counts: TierCounts; generatedFor: string };
type Intervention = {
  id: string;
  learnerId: string;
  learnerName: string;
  reason: string;
  conceptTags: string[];
  tier: Tier;
  status: "open" | "monitoring" | "resolved";
  openedAt: string;
  notes: Array<{ at: string; author: string; text: string }>;
};

async function api<T>(url: string, init?: RequestInit): Promise<T | { error: string }> {
  try {
    const res = await fetch(url, { credentials: "same-origin", ...init });
    if (res.status === 401) return { error: "unauthenticated" };
    if (res.status === 503) return { error: "unavailable" };
    return (await res.json().catch(() => ({ error: "invalid" }))) as T | { error: string };
  } catch {
    return { error: "network" };
  }
}
const isErr = <T,>(v: T | { error: string }): v is { error: string } =>
  typeof v === "object" && v !== null && "error" in v;

/** Trail semantics: leaf = on the trail, tangerine = watch, berry = needs help. */
const TIER_TONE = { 1: "leaf", 2: "tangerine", 3: "berry" } as const;
const TIER_LABEL = { 1: "On track", 2: "Watch", 3: "Intensive" } as const;
const TIER_FILL = { 1: "bg-leaf", 2: "bg-tangerine", 3: "bg-berry" } as const;

const INPUT =
  "rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-sky dark:border-paper/15";

export default function ClassClient({ classId, courses }: { classId: string; courses: PickerCourse[] }) {
  const [gate, setGate] = useState<"loading" | "ok" | "denied" | "unavailable">("loading");
  const [className, setClassName] = useState<string>("Class");
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [cases, setCases] = useState<Intervention[]>([]);

  const load = useCallback(async () => {
    const [a, ins, iv, mine] = await Promise.all([
      api<{ assignments: AssignmentRow[] }>(`/api/assignments?classroomId=${encodeURIComponent(classId)}`),
      api<Insights>(`/api/class-insights?classroomId=${encodeURIComponent(classId)}`),
      api<{ interventions: Intervention[] }>(`/api/interventions?classroomId=${encodeURIComponent(classId)}`),
      api<Array<{ id: string; name: string }>>(`/api/class`)
    ]);
    if (isErr(a)) {
      setGate(a.error === "unavailable" ? "unavailable" : "denied");
      return;
    }
    setGate("ok");
    setAssignments(a.assignments);
    if (!isErr(ins)) setInsights(ins);
    if (!isErr(iv)) setCases(iv.interventions);
    if (Array.isArray(mine)) {
      const found = mine.find((c) => c.id === classId);
      if (found) setClassName(found.name);
    }
  }, [classId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (gate === "loading")
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Class</h1>
        <div className="py-16 text-center text-sm text-muted">Loading…</div>
      </div>
    );
  if (gate === "unavailable")
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Class</h1>
        <EmptyState icon="icon-808" title="No class database here">
        This deployment runs local-first, so cross-device class tools are off. The device-local classroom on{" "}
        <Link href="/teach" className="font-bold text-sky-ink underline">
          Teach
        </Link>{" "}
        still works.
        </EmptyState>
      </div>
    );
  if (gate === "denied")
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Class</h1>
        <EmptyState icon="icon-705" title="This class isn't available to you">
        You need to be its teacher or an administrator of its school. Head back to{" "}
        <Link href="/teach" className="font-bold text-sky-ink underline">
          Teach
        </Link>
        .
        </EmptyState>
      </div>
    );

  return (
    <div>
      <div className="mb-1">
        <Link href="/teach" className="text-sm font-bold text-sky-ink hover:underline">
          ← Teach
        </Link>
      </div>
      <SectionHeader title={className} icon="icon-807" waymark as="h1" />

      {insights && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Learners" value={String(insights.counts.total)} icon="icon-605" tone="sky" />
            <StatTile label="On track" value={String(insights.counts.tier1)} icon="icon-704" tone="leaf" />
            <StatTile label="Watch" value={String(insights.counts.tier2)} icon="icon-803" tone="tangerine" />
            <StatTile label="Intensive" value={String(insights.counts.tier3)} icon="icon-802" tone="berry" />
          </div>
          <TierTrailBar counts={insights.counts} />
        </>
      )}

      <AssignmentsSection classId={classId} courses={courses} assignments={assignments} onChange={load} />
      <TierSection insights={insights} />
      <GroupsSection groups={insights?.groups ?? []} />
      <InterventionSection classId={classId} tiers={insights?.tiers ?? []} cases={cases} onChange={load} />
    </div>
  );
}

/* ------------------------------------------------------------ Tier trail bar */

/** The class as a section of trail: one segmented bar walking leaf →
 * tangerine → berry. Never color alone — each segment carries its count, and
 * the whole bar has a spoken summary. Hidden when the class is empty. */
function TierTrailBar({ counts }: { counts: TierCounts }) {
  if (counts.total === 0) return null;
  const seg = (n: number) => `${(n / counts.total) * 100}%`;
  const label = `Tier distribution: ${counts.tier1} on track, ${counts.tier2} watch, ${counts.tier3} intensive of ${counts.total} learners`;
  return (
    <div className="mb-6">
      <div
        role="img"
        aria-label={label}
        className="flex h-3 w-full overflow-hidden rounded-pill bg-ink/6 dark:bg-paper/8"
      >
        {counts.tier1 > 0 && <div className={`${TIER_FILL[1]} h-full`} style={{ width: seg(counts.tier1) }} />}
        {counts.tier2 > 0 && <div className={`${TIER_FILL[2]} h-full`} style={{ width: seg(counts.tier2) }} />}
        {counts.tier3 > 0 && <div className={`${TIER_FILL[3]} h-full`} style={{ width: seg(counts.tier3) }} />}
      </div>
      <div aria-hidden className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold">
        <span className="flex items-center gap-1.5 text-leaf-ink">
          <span className="h-2 w-2 rounded-pill bg-leaf" /> {TIER_LABEL[1]} {counts.tier1}
        </span>
        <span className="flex items-center gap-1.5 text-[#B5581F] dark:text-tangerine-ink">
          <span className="h-2 w-2 rounded-pill bg-tangerine" /> {TIER_LABEL[2]} {counts.tier2}
        </span>
        <span className="flex items-center gap-1.5 text-berry-ink">
          <span className="h-2 w-2 rounded-pill bg-berry" /> {TIER_LABEL[3]} {counts.tier3}
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Assignments */

function AssignmentsSection({
  classId,
  courses,
  assignments,
  onChange
}: {
  classId: string;
  courses: PickerCourse[];
  assignments: AssignmentRow[];
  onChange: () => void;
}) {
  const [kind, setKind] = useState<"lesson" | "course">("lesson");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [lessonId, setLessonId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
  const refId = kind === "course" ? courseId : lessonId;

  async function create(publish: boolean) {
    if (!refId) return;
    setBusy(true);
    setMsg(null);
    const r = await api<{ assignmentId: string }>("/api/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "create", classroomId: classId, kind, refId, dueDate: dueDate || null, publish })
    });
    setBusy(false);
    if (isErr(r)) {
      setMsg(r.error === "unknown-ref" ? "That reference isn't in the curriculum." : "Could not create the assignment.");
      return;
    }
    setLessonId("");
    setDueDate("");
    onChange();
  }

  async function act(op: "publish" | "archive", assignmentId: string) {
    const r = await api<{ ok: true }>("/api/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op, assignmentId })
    });
    if (!isErr(r)) onChange();
  }

  const live = assignments.filter((a) => !a.archived);

  return (
    <section className="mb-8">
      <SectionHeader title="Assignments" icon="icon-602" waymark />
      <Surface tone="surface" border className="mb-4 p-4">
        <h3 className="mb-3 text-sm font-extrabold">Assign from the trail</h3>
        {msg && (
          <Notice tone="warning" className="mb-3">
            {msg}
          </Notice>
        )}
        <div role="radiogroup" aria-label="What to assign" className="mb-3 flex gap-2">
          {(["lesson", "course"] as const).map((k) => (
            <button type="button"
              key={k}
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={`pressable min-h-9 rounded-pill px-4 text-xs font-bold ${
                kind === k ? "bg-cta text-white shadow-e1" : "bg-ink/6 text-content hover:bg-ink/10 dark:bg-paper/8"
              }`}
            >
              {k === "lesson" ? "One lesson" : "Whole course"}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-bold">Course</span>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setLessonId("");
              }}
              className={`w-full ${INPUT}`}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} · {c.gradeLevel === 0 ? "K" : `Grade ${c.gradeLevel}`}
                </option>
              ))}
            </select>
          </label>
          {kind === "lesson" && (
            <label className="flex-1">
              <span className="mb-1 block text-xs font-bold">Lesson</span>
              <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={`w-full ${INPUT}`}>
                <option value="">Choose a lesson…</option>
                {(course?.lessons ?? []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span className="mb-1 block text-xs font-bold">Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT} />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={() => create(false)} disabled={busy || !refId}>
            Save draft
          </Button>
          <Button onClick={() => create(true)} disabled={busy || !refId} icon="icon-704">
            Publish
          </Button>
        </div>
      </Surface>

      {live.length === 0 ? (
        <p className="text-sm text-muted">No assignments yet — pick a lesson or course above.</p>
      ) : (
        <ul className="space-y-2">
          {live.map((a) => (
            <li key={a.id}>
              <Surface tone="surface" border className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold">{a.title}</span>
                      {a.published ? <Badge tone="leaf" icon="icon-704">published</Badge> : <Badge tone="muted">draft</Badge>}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {a.kind === "course" ? "Course" : "Lesson"} · {a.lessonCount} lesson{a.lessonCount === 1 ? "" : "s"}
                      {a.dueDate ? ` · due ${a.dueDate}` : ""}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <Badge tone="neutral">not started {a.counts["not-started"]}</Badge>
                      <Badge tone="sky">in progress {a.counts["in-progress"]}</Badge>
                      <Badge tone="leaf">on time {a.counts["on-time"]}</Badge>
                      <Badge tone="berry">late {a.counts.late}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {!a.published && (
                      <button type="button"
                        onClick={() => act("publish", a.id)}
                        className="pressable min-h-9 rounded-pill bg-cta px-3 text-xs font-bold text-white"
                      >
                        Publish
                      </button>
                    )}
                    <button type="button"
                      onClick={() => act("archive", a.id)}
                      className="pressable min-h-9 rounded-pill bg-ink/6 px-3 text-xs font-bold text-content hover:bg-ink/10 dark:bg-paper/8"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- Tier board */

function TierSection({ insights }: { insights: Insights | null }) {
  if (!insights) return null;
  if (insights.tiers.length === 0)
    return (
      <section className="mb-8">
        <SectionHeader title="Where each learner is" icon="icon-803" waymark />
        <p className="text-sm text-muted">
          No enrolled learners yet — tiers appear once students join with the class code.
        </p>
      </section>
    );
  return (
    <section className="mb-8">
      <SectionHeader title="Where each learner is" icon="icon-803" waymark />
      <p className="mb-3 text-xs text-muted">
        Recomputed from evidence — insufficient evidence stays Tier&nbsp;1 by design. As of {insights.generatedFor}.
      </p>
      <ul className="space-y-2">
        {insights.tiers.map((t) => (
          <li key={t.learnerId}>
            <Surface
              tone="surface"
              border
              className={`border-l-4 p-3 ${t.tier === 1 ? "border-l-leaf" : t.tier === 2 ? "border-l-tangerine" : "border-l-berry"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold">
                  <AvatarDisplay
                    avatarId={t.avatarId}
                    size={256}
                    placement="dense-list"
                    displaySize={36}
                    className="h-9 w-9 shrink-0 rounded-full ring-1 ring-ink/10 dark:ring-paper/15"
                  />
                  {t.name}
                </span>
                <Badge tone={TIER_TONE[t.tier]}>
                  Tier {t.tier} · {TIER_LABEL[t.tier]}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted">
                {t.proficient}/{t.attempted} proficient · {t.fading} fading · {t.activeDays14} active days (14d)
              </div>
              {t.reasons.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {t.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-content-2">
                      {r.detail}
                    </li>
                  ))}
                </ul>
              )}
              {t.focusTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.focusTags.map((tag) => (
                    <Badge key={tag} tone="berry">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Surface>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------------------------------------- Small groups */

/** Learners who share a need, pre-grouped by the pure intervention module —
 * the "who can I pull to the side table together" view a teacher plans from. */
function GroupsSection({ groups }: { groups: Group[] }) {
  if (groups.length === 0) return null;
  return (
    <section className="mb-8">
      <SectionHeader title="Small groups" icon="icon-605" waymark />
      <p className="mb-3 text-xs text-muted">Learners who share a focus skill, most urgent first.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {groups.map((g) => (
          <li key={g.tag}>
            <Surface tone="surface" border className="p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-content">{g.tag}</span>
                <Badge tone={TIER_TONE[g.urgency]}>urgency {g.urgency}</Badge>
              </div>
              <ul className="mt-2 space-y-1">
                {g.members.map((m) => (
                  <li key={m.learnerId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <AvatarDisplay
                        avatarId={m.avatarId}
                        size={256}
                        placement="dense-list"
                        displaySize={28}
                        className="h-7 w-7 shrink-0 rounded-full ring-1 ring-ink/10 dark:ring-paper/15"
                      />
                      {m.name}
                    </span>
                    <span
                      role="img"
                      aria-label={`Tier ${m.tier}`}
                      className={`h-2.5 w-2.5 rounded-pill ${TIER_FILL[m.tier]}`}
                    />
                  </li>
                ))}
              </ul>
            </Surface>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------- Interventions */

function InterventionSection({
  classId,
  tiers,
  cases,
  onChange
}: {
  classId: string;
  tiers: LearnerTier[];
  cases: Intervention[];
  onChange: () => void;
}) {
  const [learnerId, setLearnerId] = useState("");
  const [reason, setReason] = useState("");
  const [tier, setTier] = useState<Tier>(2);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});

  const suggested = tiers.find((t) => t.learnerId === learnerId);

  async function open() {
    if (!learnerId || !reason.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await api<{ interventionId: string }>("/api/interventions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        op: "open",
        learnerId,
        classroomId: classId,
        reason: reason.trim(),
        conceptTags: suggested?.focusTags ?? [],
        tier
      })
    });
    setBusy(false);
    if (isErr(r)) {
      setMsg(r.error === "not-enrolled" ? "That learner isn't actively enrolled here." : "Could not open a case.");
      return;
    }
    setReason("");
    setLearnerId("");
    onChange();
  }

  async function note(id: string) {
    const text = (noteText[id] ?? "").trim();
    if (!text) return;
    const r = await api<{ ok: true }>("/api/interventions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "note", interventionId: id, text })
    });
    if (!isErr(r)) {
      setNoteText((m) => ({ ...m, [id]: "" }));
      onChange();
    }
  }

  async function setStatus(id: string, status: "open" | "monitoring" | "resolved") {
    const r = await api<{ ok: true }>("/api/interventions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "status", interventionId: id, status })
    });
    if (!isErr(r)) onChange();
  }

  return (
    <section className="mb-8">
      <SectionHeader title="Intervention cases" icon="icon-808" waymark />

      <Surface tone="surface" border className="mb-4 p-4">
        <h3 className="mb-2 text-sm font-extrabold">Open a case</h3>
        {msg && (
          <Notice tone="warning" className="mb-3">
            {msg}
          </Notice>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            aria-label="Learner"
            className={`flex-1 ${INPUT}`}
          >
            <option value="">Choose a learner…</option>
            {tiers.map((t) => (
              <option key={t.learnerId} value={t.learnerId}>
                {t.name} (Tier {t.tier})
              </option>
            ))}
          </select>
          <select
            value={tier}
            onChange={(e) => setTier(Number(e.target.value) as Tier)}
            aria-label="Tier"
            className={INPUT}
          >
            <option value={1}>Tier 1 · {TIER_LABEL[1]}</option>
            <option value={2}>Tier 2 · {TIER_LABEL[2]}</option>
            <option value={3}>Tier 3 · {TIER_LABEL[3]}</option>
          </select>
        </div>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g. persistent regrouping error)"
          aria-label="Reason"
          className={`mt-2 w-full ${INPUT}`}
        />
        {suggested && suggested.focusTags.length > 0 && (
          <p className="mt-2 text-xs text-muted">Focus tags will attach: {suggested.focusTags.join(", ")}</p>
        )}
        <div className="mt-3">
          <Button onClick={open} disabled={busy || !learnerId || !reason.trim()} icon="icon-704">
            Open case
          </Button>
        </div>
      </Surface>

      {cases.length === 0 ? (
        <p className="text-sm text-muted">No open cases.</p>
      ) : (
        <ul className="space-y-3">
          {cases.map((c) => (
            <li key={c.id}>
              <Surface tone="surface" border className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{c.learnerName}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={TIER_TONE[c.tier]}>Tier {c.tier}</Badge>
                    <Badge tone={c.status === "resolved" ? "leaf" : c.status === "monitoring" ? "sky" : "tangerine"}>
                      {c.status}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1 text-sm text-content">{c.reason}</p>
                {c.conceptTags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.conceptTags.map((t) => (
                      <Badge key={t} tone="neutral">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {c.notes.length > 0 && (
                  <ul className="mt-2 space-y-1 border-l-2 border-ink/10 pl-3 dark:border-paper/12">
                    {c.notes.map((n, i) => (
                      <li key={i} className="text-xs text-content-2">
                        <span className="text-muted">{n.at.slice(0, 10)}:</span> {n.text}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={noteText[c.id] ?? ""}
                    onChange={(e) => setNoteText((m) => ({ ...m, [c.id]: e.target.value }))}
                    placeholder="Add a note…"
                    aria-label={`Note for ${c.learnerName}`}
                    className={`flex-1 ${INPUT} py-1.5`}
                  />
                  <button type="button"
                    onClick={() => note(c.id)}
                    className="pressable min-h-9 rounded-pill bg-ink/6 px-3 text-xs font-bold text-content hover:bg-ink/10 dark:bg-paper/8"
                  >
                    Add note
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(["open", "monitoring", "resolved"] as const).map((s) => (
                    <button type="button"
                      key={s}
                      onClick={() => setStatus(c.id, s)}
                      disabled={c.status === s}
                      className={`pressable min-h-8 rounded-pill px-3 text-xs font-bold ${
                        c.status === s ? "bg-cta text-white" : "bg-ink/6 text-content hover:bg-ink/10 dark:bg-paper/8"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
