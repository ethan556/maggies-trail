"use client";
/**
 * ADMIN — the institutional console over the durable, server-side org tree.
 *
 * Everything here is gated server-side: every fetch carries the session cookie
 * and the routes re-derive authority from the org rows. A signed-out user, a
 * learner session, or a deployment with no durable DB all resolve to the same
 * calm empty state rather than an error wall — the console simply has nothing
 * to show. No institutional data is trusted from the client; this is a view
 * and a set of forms over the audited services.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Notice,
  SectionHeader,
  StatTile,
  Surface
} from "@/components/ui";
import { ONEROSTER_FILES, type OneRosterFile } from "@/lib/institution/oneroster";

type OrgRow = {
  id: string;
  parentOrgId: string | null;
  type: "district" | "school";
  name: string;
  externalId: string | null;
  status: "active" | "retired";
};
type StaffRow = { userId: string; email: string; role: "teacher" | "administrator" | "aide"; status: string };
type PlatformRow = {
  id: string;
  orgId: string | null;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authLoginUrl: string;
};
type Diagnostic = { severity: "error" | "warning" | "info"; file: string; line: number; code: string; message: string };
type Plan = {
  orgs: Counts;
  classes: Counts;
  learners: Counts;
  staff: Counts;
  enrollments: Counts;
  diagnostics: Diagnostic[];
  applicable: boolean;
};
type Counts = { create: number; update: number; retire: number };
type ImportResult = { importId: string; plan: Plan; applied: boolean; dryRun: boolean };
type Cell = {
  key: string;
  label: string;
  learners: number;
  proficientShare?: number;
  meanLessons?: number;
  meanActiveDays?: number;
  suppressed: boolean;
  suppressionReason?: string;
};
type Report = { dimension: string; minCohort: number; cells: Cell[]; total: Cell; generatedFor: string };

const TABS = ["Overview", "Roster", "Staff", "Reports", "Integrations"] as const;
type Tab = (typeof TABS)[number];

async function api<T>(url: string, init?: RequestInit): Promise<T | { error: string }> {
  try {
    const res = await fetch(url, { credentials: "same-origin", ...init });
    if (res.status === 401) return { error: "unauthenticated" };
    if (res.status === 503) return { error: "unavailable" };
    const data = (await res.json().catch(() => ({ error: "invalid" }))) as T | { error: string };
    return data;
  } catch {
    return { error: "network" };
  }
}
const isErr = <T,>(v: T | { error: string }): v is { error: string } =>
  typeof v === "object" && v !== null && "error" in v;

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [orgs, setOrgs] = useState<OrgRow[] | null>(null);
  const [gate, setGate] = useState<"loading" | "ok" | "signed-out" | "unavailable">("loading");

  const loadOrgs = useCallback(async () => {
    const r = await api<{ orgs: OrgRow[] }>("/api/institution");
    if (isErr(r)) {
      setGate(r.error === "unavailable" ? "unavailable" : "signed-out");
      setOrgs([]);
      return;
    }
    setGate("ok");
    setOrgs(r.orgs);
  }, []);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  if (gate === "loading") {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Institution admin</h1>
        <div className="py-16 text-center text-sm text-muted">Loading…</div>
      </div>
    );
  }
  if (gate === "unavailable") {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Institution admin</h1>
        <EmptyState icon="compass" title="No institutional database here">
        This deployment runs local-first without a durable database, so district features are off. The learning
        experience is unaffected.
        </EmptyState>
      </div>
    );
  }
  if (gate === "signed-out" || (orgs && orgs.length === 0)) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Institution admin</h1>
        <EmptyState icon="account" title="No organizations to administer">
        District and school tools appear here for signed-in administrators. If you expect access, ask your district
        administrator to add you, or sign in with an admin account.
        </EmptyState>
      </div>
    );
  }

  const districts = (orgs ?? []).filter((o) => o.type === "district");
  const schools = (orgs ?? []).filter((o) => o.type === "school");

  return (
    <div>
      <SectionHeader title="Institution admin" icon="chart" waymark as="h1" />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Districts" value={String(districts.length)} tone="sky" />
        <StatTile label="Schools" value={String(schools.length)} tone="leaf" />
        <StatTile label="Active orgs" value={String((orgs ?? []).filter((o) => o.status === "active").length)} tone="tangerine" />
        <StatTile label="Total orgs" value={String((orgs ?? []).length)} tone="neutral" />
      </div>

      <div role="tablist" aria-label="Admin sections" className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button type="button"
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`pressable min-h-11 rounded-pill px-4 text-sm font-bold transition ${
              tab === t
                ? "bg-cta text-white shadow-e1"
                : "bg-ink/6 text-content hover:bg-ink/10 dark:bg-paper/8 dark:hover:bg-paper/12"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab orgs={orgs ?? []} districts={districts} onChange={loadOrgs} />}
      {tab === "Roster" && <RosterTab districts={districts} />}
      {tab === "Staff" && <StaffTab orgs={orgs ?? []} onChange={loadOrgs} />}
      {tab === "Reports" && <ReportsTab orgs={orgs ?? []} />}
      {tab === "Integrations" && <IntegrationsTab orgs={orgs ?? []} />}
    </div>
  );
}

/* ------------------------------------------------------------------ Overview */

function OverviewTab({ orgs, districts, onChange }: { orgs: OrgRow[]; districts: OrgRow[]; onChange: () => void }) {
  const [districtName, setDistrictName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolParent, setSchoolParent] = useState(districts[0]?.id ?? "");
  const [msg, setMsg] = useState<{ tone: "info" | "success" | "warn"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const childrenOf = (id: string) => orgs.filter((o) => o.parentOrgId === id);

  async function createDistrict() {
    if (!districtName.trim()) return;
    setBusy(true);
    const r = await api<{ orgId: string }>("/api/institution", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "create-district", name: districtName.trim() })
    });
    setBusy(false);
    if (isErr(r)) {
      setMsg({ tone: "warn", text: r.error === "forbidden" ? "Only a platform administrator can create a district." : "Could not create district." });
      return;
    }
    setDistrictName("");
    setMsg({ tone: "success", text: "District created." });
    onChange();
  }

  async function createSchool() {
    if (!schoolName.trim() || !schoolParent) return;
    setBusy(true);
    const r = await api<{ orgId: string }>("/api/institution", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "create-school", districtOrgId: schoolParent, name: schoolName.trim() })
    });
    setBusy(false);
    if (isErr(r)) {
      setMsg({ tone: "warn", text: r.error === "forbidden" ? "You do not administer that district." : "Could not create school." });
      return;
    }
    setSchoolName("");
    setMsg({ tone: "success", text: "School created." });
    onChange();
  }

  return (
    <div className="space-y-5">
      {msg && <Notice tone={msg.tone === "warn" ? "warning" : msg.tone === "success" ? "success" : "info"}>{msg.text}</Notice>}

      <Surface tone="surface" border className="p-4">
        <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Organization tree</h3>
        {districts.length === 0 ? (
          <p className="text-sm text-muted">No districts yet.</p>
        ) : (
          <ul className="space-y-2">
            {districts.map((d) => (
              <li key={d.id}>
                <div className="flex items-center gap-2">
                  <Badge tone="sky" icon="chart">District</Badge>
                  <span className="font-bold">{d.name}</span>
                  {d.status === "retired" && <Badge tone="muted">retired</Badge>}
                </div>
                <ul className="ml-6 mt-1 space-y-1 border-l border-ink/10 pl-4 dark:border-paper/12">
                  {childrenOf(d.id).length === 0 ? (
                    <li className="text-xs text-muted">No schools</li>
                  ) : (
                    childrenOf(d.id).map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-sm">
                        <Badge tone="leaf">School</Badge>
                        <span>{s.name}</span>
                        {s.status === "retired" && <Badge tone="muted">retired</Badge>}
                      </li>
                    ))
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Surface>

      <div className="grid gap-4 sm:grid-cols-2">
        <Surface tone="surface" border className="p-4">
          <h3 className="mb-2 text-sm font-extrabold">New district</h3>
          <p className="mb-3 text-xs text-muted">Platform administrators only.</p>
          <input
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            placeholder="District name"
            aria-label="District name"
            className="mb-3 w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          />
          <Button onClick={createDistrict} disabled={busy || !districtName.trim()}>
            Create district
          </Button>
        </Surface>

        <Surface tone="surface" border className="p-4">
          <h3 className="mb-2 text-sm font-extrabold">New school</h3>
          <p className="mb-3 text-xs text-muted">Under a district you administer.</p>
          <select
            value={schoolParent}
            onChange={(e) => setSchoolParent(e.target.value)}
            aria-label="Parent district"
            className="mb-2 w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="School name"
            aria-label="School name"
            className="mb-3 w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          />
          <Button onClick={createSchool} disabled={busy || !schoolName.trim() || !schoolParent}>
            Create school
          </Button>
        </Surface>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- Roster */

function RosterTab({ districts }: { districts: OrgRow[] }) {
  const [districtId, setDistrictId] = useState(districts[0]?.id ?? "");
  const [files, setFiles] = useState<Partial<Record<OneRosterFile, string>>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(dryRun: boolean) {
    if (!districtId) return;
    setBusy(true);
    setErr(null);
    const r = await api<ImportResult>("/api/institution/roster", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ districtOrgId: districtId, files, dryRun })
    });
    setBusy(false);
    if (isErr(r)) {
      setErr(
        r.error === "forbidden"
          ? "You do not administer that district."
          : r.error === "not-a-district"
            ? "Choose a district (schools cannot be import targets)."
            : "Import could not run — check the CSV files."
      );
      setResult(null);
      return;
    }
    setResult(r);
  }

  const errors = result?.plan.diagnostics.filter((d) => d.severity === "error") ?? [];
  const warnings = result?.plan.diagnostics.filter((d) => d.severity === "warning") ?? [];

  return (
    <div className="space-y-5">
      <Notice tone="info">
        Paste OneRoster v1.1 CSV files below. A dry run writes nothing and shows exactly what an apply would change —
        always preview first.
      </Notice>

      {districts.length > 1 && (
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          aria-label="Target district"
          className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
        >
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {ONEROSTER_FILES.map((name) => (
          <label key={name} className="block">
            <span className="mb-1 block text-xs font-bold text-content">{name}.csv</span>
            <textarea
              value={files[name] ?? ""}
              onChange={(e) => setFiles((f) => ({ ...f, [name]: e.target.value }))}
              rows={3}
              spellCheck={false}
              placeholder={`sourcedId,...`}
              className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 font-mono text-xs dark:border-paper/15"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => run(true)} disabled={busy || !districtId} icon="compass">
          Dry run
        </Button>
        <Button
          onClick={() => run(false)}
          disabled={busy || !districtId || !result || !result.plan.applicable}
          icon="check"
        >
          Apply import
        </Button>
      </div>

      {err && <Notice tone="warning">{err}</Notice>}

      {result && (
        <Surface tone="surface" border className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-extrabold">{result.applied ? "Applied" : "Dry run"} — plan</h3>
            {result.plan.applicable ? (
              <Badge tone="leaf" icon="check">ready</Badge>
            ) : (
              <Badge tone="berry" icon="repeat">blocked</Badge>
            )}
          </div>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(["orgs", "classes", "learners", "staff", "enrollments"] as const).map((k) => (
              <div key={k} className="rounded-card bg-ink/4 px-3 py-2 dark:bg-paper/6">
                <div className="text-xs font-bold uppercase text-muted">{k}</div>
                <div className="text-sm font-semibold tabular-nums">
                  +{result.plan[k].create} ~{result.plan[k].update} −{result.plan[k].retire}
                </div>
              </div>
            ))}
          </div>
          {errors.length > 0 && (
            <div className="mb-2">
              <div className="mb-1 text-xs font-bold text-berry-ink">Errors ({errors.length})</div>
              <ul className="space-y-1">
                {errors.slice(0, 20).map((d, i) => (
                  <li key={i} className="text-xs text-content">
                    <span className="font-mono text-muted">{d.file}:{d.line}</span> [{d.code}] {d.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <details>
              <summary className="cursor-pointer text-xs font-bold text-[#B5581F] dark:text-tangerine-ink">
                Warnings ({warnings.length})
              </summary>
              <ul className="mt-1 space-y-1">
                {warnings.slice(0, 30).map((d, i) => (
                  <li key={i} className="text-xs text-muted">
                    <span className="font-mono">{d.file}:{d.line}</span> [{d.code}] {d.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {result.applied && <p className="mt-2 text-xs text-leaf-ink">Import applied. Re-running is safe (idempotent).</p>}
        </Surface>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- Staff */

function StaffTab({ orgs, onChange }: { orgs: OrgRow[]; onChange: () => void }) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [staff, setStaff] = useState<StaffRow[] | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"teacher" | "administrator">("teacher");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const r = await api<{ staff: StaffRow[] }>(`/api/institution?orgId=${encodeURIComponent(orgId)}&staff=1`);
    setStaff(isErr(r) ? [] : r.staff);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function add() {
    if (!email.trim() || !orgId) return;
    setBusy(true);
    const r = await api<{ userId: string }>("/api/institution", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "add-staff", orgId, email: email.trim(), role })
    });
    setBusy(false);
    if (isErr(r)) {
      setMsg(r.error === "forbidden" ? "You do not administer that organization." : "Could not add staff.");
      return;
    }
    setEmail("");
    setMsg("Invitation sent (passwordless magic link).");
    void load();
    onChange();
  }

  return (
    <div className="space-y-5">
      <select
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
        aria-label="Organization"
        className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.type === "district" ? "🏛 " : "🏫 "}
            {o.name}
          </option>
        ))}
      </select>

      <Surface tone="surface" border className="p-4">
        <h3 className="mb-3 text-sm font-extrabold">Staff</h3>
        {staff === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : staff.length === 0 ? (
          <p className="text-sm text-muted">No staff yet.</p>
        ) : (
          <ul className="divide-y divide-ink/8 dark:divide-paper/10">
            {staff.map((s) => (
              <li key={s.userId} className="flex items-center justify-between gap-2 py-2">
                <span className="truncate text-sm">{s.email}</span>
                <Badge tone={s.role === "administrator" ? "tangerine" : "sky"}>{s.role}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Surface>

      <Surface tone="surface" border className="p-4">
        <h3 className="mb-3 text-sm font-extrabold">Add staff</h3>
        {msg && <Notice tone="info" className="mb-3">{msg}</Notice>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="name@school.org"
            aria-label="Staff email"
            className="flex-1 rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "teacher" | "administrator")}
            aria-label="Role"
            className="rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          >
            <option value="teacher">Teacher</option>
            <option value="administrator">Administrator</option>
          </select>
          <Button onClick={add} disabled={busy || !email.trim()}>
            Invite
          </Button>
        </div>
      </Surface>
    </div>
  );
}

/* ------------------------------------------------------------------- Reports */

function ReportsTab({ orgs }: { orgs: OrgRow[] }) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [dimension, setDimension] = useState<"school" | "class" | "grade">("school");
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!orgId) return;
    setBusy(true);
    setErr(null);
    const r = await api<Report>(`/api/institution/report?orgId=${encodeURIComponent(orgId)}&dimension=${dimension}`);
    setBusy(false);
    if (isErr(r)) {
      setErr(r.error === "forbidden" ? "You do not administer that organization." : "Report unavailable.");
      setReport(null);
      return;
    }
    setReport(r);
  }

  const csvHref = useMemo(
    () => `/api/institution/report?orgId=${encodeURIComponent(orgId)}&dimension=${dimension}&format=csv`,
    [orgId, dimension]
  );
  const pct = (v?: number) => (v == null ? "—" : `${Math.round(v * 100)}%`);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-bold">Organization</span>
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold">Group by</span>
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value as "school" | "class" | "grade")}
            className="rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
          >
            <option value="school">School</option>
            <option value="class">Class</option>
            <option value="grade">Grade</option>
          </select>
        </label>
        <Button onClick={run} disabled={busy || !orgId} icon="chart">
          Run report
        </Button>
      </div>

      {err && <Notice tone="warning">{err}</Notice>}

      {report && (
        <Surface tone="surface" border className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-ink/8 px-4 py-3 dark:border-paper/10">
            <h3 className="text-sm font-extrabold">
              By {report.dimension} · cohort floor {report.minCohort}
            </h3>
            <a
              href={csvHref}
              className="pressable inline-flex min-h-9 items-center gap-1 rounded-pill bg-ink/6 px-3 text-xs font-bold text-content hover:bg-ink/10 dark:bg-paper/8"
            >
              Download CSV
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="px-4 py-2">Group</th>
                  <th className="px-4 py-2 text-right">Learners</th>
                  <th className="px-4 py-2 text-right">Proficient</th>
                  <th className="px-4 py-2 text-right">Mean lessons</th>
                  <th className="px-4 py-2 text-right">Active days</th>
                </tr>
              </thead>
              <tbody>
                {report.cells.map((c) => (
                  <tr key={c.key} className="border-t border-ink/6 dark:border-paper/8">
                    <td className="px-4 py-2 font-medium">{c.label}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{c.learners}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {c.suppressed ? <span className="text-muted">suppressed</span> : pct(c.proficientShare)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {c.suppressed ? "—" : c.meanLessons?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {c.suppressed ? "—" : c.meanActiveDays?.toFixed(1) ?? "—"}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-ink/15 font-bold dark:border-paper/20">
                  <td className="px-4 py-2">All</td>
                  <td className="px-4 py-2 text-right tabular-nums">{report.total.learners}</td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {report.total.suppressed ? <span className="text-muted">suppressed</span> : pct(report.total.proficientShare)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {report.total.suppressed ? "—" : report.total.meanLessons?.toFixed(1) ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {report.total.suppressed ? "—" : report.total.meanActiveDays?.toFixed(1) ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2 text-xs text-muted">
            Small cohorts are suppressed to protect individual learners. Generated {report.generatedFor}.
          </p>
        </Surface>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Integrations */

function IntegrationsTab({ orgs }: { orgs: OrgRow[] }) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [platforms, setPlatforms] = useState<PlatformRow[] | null>(null);
  const [form, setForm] = useState({ issuer: "", clientId: "", deploymentId: "", authLoginUrl: "", jwks: "" });
  const [msg, setMsg] = useState<{ tone: "info" | "success" | "warn"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const r = await api<{ platforms: PlatformRow[] }>(`/api/lti/platforms?orgId=${encodeURIComponent(orgId)}`);
    setPlatforms(isErr(r) ? [] : r.platforms);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function register() {
    if (!orgId) return;
    setBusy(true);
    const r = await api<{ platformId: string }>("/api/lti/platforms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orgId, ...form })
    });
    setBusy(false);
    if (isErr(r)) {
      setMsg({
        tone: "warn",
        text:
          r.error === "forbidden"
            ? "You do not administer that organization."
            : r.error === "bad-jwks"
              ? "The JWKS must be JSON with a \"keys\" array."
              : r.error === "duplicate"
                ? "A platform with that issuer, client, and deployment already exists."
                : "Could not register the platform."
      });
      return;
    }
    setForm({ issuer: "", clientId: "", deploymentId: "", authLoginUrl: "", jwks: "" });
    setMsg({ tone: "success", text: "Platform registered." });
    void load();
  }

  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <label className="block">
      <span className="mb-1 block text-xs font-bold">{label}</span>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <Notice tone="info">
        Register your LMS as an LTI 1.3 platform. Maggie&rsquo;s Trail validates every launch (signature, single-use
        nonce, replay guards) and never creates student accounts — students launch straight into the lesson.
      </Notice>

      <select
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
        aria-label="Organization"
        className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 text-sm dark:border-paper/15"
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      <Surface tone="surface" border className="p-4">
        <h3 className="mb-3 text-sm font-extrabold">Registered platforms</h3>
        {platforms === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : platforms.length === 0 ? (
          <p className="text-sm text-muted">No platforms registered for this org.</p>
        ) : (
          <ul className="space-y-2">
            {platforms.map((p) => (
              <li key={p.id} className="rounded-card bg-ink/4 px-3 py-2 text-sm dark:bg-paper/6">
                <div className="font-mono text-xs text-muted">{p.issuer}</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="sky">client {p.clientId}</Badge>
                  <Badge tone="neutral">deploy {p.deploymentId}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Surface>

      <Surface tone="surface" border className="p-4">
        <h3 className="mb-3 text-sm font-extrabold">Register a platform</h3>
        {msg && <Notice tone={msg.tone === "warn" ? "warning" : msg.tone === "success" ? "success" : "info"} className="mb-3">{msg.text}</Notice>}
        <div className="grid gap-3 sm:grid-cols-2">
          {field("issuer", "Issuer", "https://lms.example.edu")}
          {field("clientId", "Client ID", "abc123")}
          {field("deploymentId", "Deployment ID", "1")}
          {field("authLoginUrl", "Auth login URL", "https://lms.example.edu/auth")}
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-bold">Public JWKS (JSON)</span>
          <textarea
            value={form.jwks}
            onChange={(e) => setForm((f) => ({ ...f, jwks: e.target.value }))}
            rows={4}
            spellCheck={false}
            placeholder={`{"keys":[ … ]}`}
            className="w-full rounded-input border border-ink/15 bg-surface px-3 py-2 font-mono text-xs dark:border-paper/15"
          />
        </label>
        <div className="mt-3">
          <Button
            onClick={register}
            disabled={busy || !form.issuer || !form.clientId || !form.deploymentId || !form.authLoginUrl || !form.jwks}
           
          >
            Register platform
          </Button>
        </div>
      </Surface>
    </div>
  );
}
