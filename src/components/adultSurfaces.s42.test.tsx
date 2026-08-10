// @vitest-environment jsdom
/**
 * ADULT SURFACES SMOKE (s42) — the UI claims are backed by mounts, not
 * screenshots: the family dashboard renders the ladder headline and the
 * report download from a real Profile; the Teach surface shows the sign-in
 * gate when no session exists (the store is account-keyed, so no account
 * means no store — the gate IS the permission boundary at the UI edge), and
 * the full class workflow once a session is present.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import FamilyDashboard from "@/components/FamilyDashboard";
import TeachClient from "@/app/(shell)/teach/TeachClient";
import { authProvider, MockAuthProvider, _setAuthProviderForTests } from "@/lib/auth";
_setAuthProviderForTests(new MockAuthProvider()); // jsdom has no API routes
import { addChild, getRoster, readChildProfile, writeChildProfile } from "@/lib/roster";
import { joinCodeFor, readTeachStore } from "@/lib/teacher";
import { emptySkill } from "@/lib/mastery";
import type { Profile } from "@/lib/progress";
import type { ManifestCourse } from "@/lib/family";

const TODAY = "2026-07-17";
const courses: ManifestCourse[] = [
  {
    id: "c1",
    title: "Counting",
    gradeLevel: 0,
    category: "Math",
    lessonCount: 1,
    lessons: [{ id: "l1", title: "One", minutes: 6 }]
  }
];

const profile: Profile = {
  xp: 120,
  activity: { active: [TODAY], frozen: [] },
  review: [],
  lessons: { l1: { completed: true, bestXp: 60, completedAt: TODAY } },
  badges: [],
  lessonsByDay: { [TODAY]: 1 },
  mastery: {
    a: { ...emptySkill("a"), attempts: 4, mastery: 0.9, lastSeen: TODAY, contexts: ["l1", "l2"] }
  }
};

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("family dashboard", () => {
  it("leads with the evidence ladder and offers the report download", () => {
    render(
      <FamilyDashboard name="Maya" profile={profile} courses={courses} tagGrades={{}} skills={{}} today={TODAY} />
    );
    expect(screen.getByText("Uses it anywhere")).toBeTruthy();
    expect(screen.getByLabelText("what the evidence shows").textContent).toContain("1");
    expect(screen.getByRole("button", { name: /Download this report/ })).toBeTruthy();
    expect(screen.getByText(/Review is on track/)).toBeTruthy();
  });
});

describe("teach surface", () => {
  it("gates on sign-in: no session, no store — only the account link renders", () => {
    render(<TeachClient courses={courses} tagGrades={{}} />);
    expect(screen.getByText(/Sign in to start/)).toBeTruthy();
    expect(screen.queryByLabelText("new class name")).toBeNull();
  });

  it("with a session: create a class, see its deterministic join code", async () => {
    await authProvider.signIn("ms.rivera@school.org");
    render(<TeachClient courses={courses} tagGrades={{}} />);
    fireEvent.change(screen.getByLabelText("new class name"), { target: { value: "Period 1" } });
    fireEvent.click(screen.getByRole("button", { name: /^Create$/ }));
    expect(screen.getByText(/Join code for/)).toBeTruthy();
    expect(screen.getByText(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/)).toBeTruthy();
  });

  it("full loop on real storage: join by code persists the link; assignment status reads real completedAt", async () => {
    const session = await authProvider.signIn("ms.rivera@school.org");
    // A learner on the device roster with a REAL completed lesson today.
    getRoster();
    const kid = addChild("Ana").children.find((c) => c.name === "Ana")!;
    const p = readChildProfile(kid.id);
    p.lessons.l1 = { completed: true, bestXp: 50, completedAt: TODAY };
    writeChildProfile(kid.id, p);

    render(<TeachClient courses={courses} tagGrades={{}} />);
    fireEvent.change(screen.getByLabelText("new class name"), { target: { value: "Period 1" } });
    fireEvent.click(screen.getByRole("button", { name: /^Create$/ }));
    const classId = readTeachStore(session.accountId).classes[0].id;
    const code = joinCodeFor(session.accountId, classId);

    // The learner joins with the printed code — the LINK lands in storage.
    fireEvent.change(screen.getByLabelText("learner to join"), { target: { value: kid.id } });
    fireEvent.change(screen.getByLabelText("class join code"), { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: /^Join class$/ }));
    expect(readTeachStore(session.accountId).links).toHaveLength(1);

    // Assign the lesson due today: Ana finished today → the chip says on-time.
    fireEvent.change(screen.getByLabelText("assignment target"), { target: { value: "l1" } });
    fireEvent.click(screen.getByRole("button", { name: /^Assign$/ }));
    expect(screen.getByText(/Ana: on-time/)).toBeTruthy();
    // And the class report table uses the ladder's honest columns.
    expect(screen.getByText("Uses anywhere")).toBeTruthy();
  });
});
