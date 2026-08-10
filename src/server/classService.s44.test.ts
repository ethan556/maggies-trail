/**
 * CLASS SERVICE (s44) — cross-device classrooms on the durable tables, the
 * permission model proven the s42 way (denials are the enforcement):
 *  · only a teacher creates; a parent is refused by role rows;
 *  · joining requires the right to TOUCH the learner: parent for their own
 *    roster, a learner-scoped session for exactly itself — a stranger's
 *    parent and a sibling's scoped session are both refused;
 *  · unknown code and forbidden learner return ONE shape (no enumeration);
 *  · double-join lands one row (idempotent composite key);
 *  · rosters are owner-only: another teacher is refused; the roster shows
 *    exactly the joiners.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { addLearner, login, sessionFor, setLearnerPin, signup, unlockLearner, type SessionInfo } from "@/server/authService";
import { classRoster, createClass, joinClass, myClasses } from "@/server/classService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-class-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function account(email: string, role: "parent" | "teacher" = "parent"): SessionInfo {
  signup(db, email, "pw-one-two", role);
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  return sessionFor(db, r.token)!;
}

const ok = <T>(r: T): Exclude<T, { error: string }> => {
  if (r && typeof r === "object" && "error" in r) throw new Error(`unexpected ${(r as { error: string }).error}`);
  return r as Exclude<T, { error: string }>;
};

describe("classService", () => {
  it("only a teacher creates a class; the code uses the read-aloud alphabet", () => {
    const parent = account("p@x.com", "parent");
    expect(createClass(db, parent, "Nope")).toEqual({ error: "forbidden" });
    const teacher = account("t@x.com", "teacher");
    const { joinCode } = ok(createClass(db, teacher, "Period 1"));
    expect(joinCode).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  });

  it("join rights = touch rights; unknown code and forbidden learner share one shape; double-join is one row", () => {
    const teacher = account("t@x.com", "teacher");
    const { classId, joinCode } = ok(createClass(db, teacher, "Period 1"));

    const parent = account("p@x.com", "parent");
    const { learnerId: ana } = addLearner(db, parent.user.id, "Ana");
    const rival = account("r@x.com", "parent");
    const { learnerId: rivalKid } = addLearner(db, rival.user.id, "Zed");

    // A parent joins their OWN learner — and a second tap changes nothing.
    expect(joinClass(db, parent, joinCode, ana)).toEqual({ ok: true, classId });
    expect(joinClass(db, parent, joinCode.toLowerCase(), ana)).toEqual({ ok: true, classId }); // case-insensitive
    expect(db.prepare("SELECT COUNT(*) c FROM classroom_members").get()).toEqual({ c: 1 });

    // A parent cannot join someone ELSE's learner; a bad code looks identical.
    expect(joinClass(db, parent, joinCode, rivalKid)).toEqual({ error: "invalid" });
    expect(joinClass(db, parent, "ZZZZZZ", ana)).toEqual({ error: "invalid" });

    // A learner-scoped session joins exactly ITSELF — not a sibling.
    const { learnerId: ben } = addLearner(db, parent.user.id, "Ben");
    setLearnerPin(db, parent.user.id, ben, "4321");
    const unlocked = unlockLearner(db, ben, "4321");
    if (!unlocked) throw new Error("unlock failed");
    const benSession = sessionFor(db, unlocked.token)!;
    expect(joinClass(db, benSession, joinCode, ben)).toEqual({ ok: true, classId });
    expect(joinClass(db, benSession, joinCode, ana)).toEqual({ error: "invalid" });
  });

  it("rosters are owner-only and show exactly the joiners", () => {
    const teacher = account("t@x.com", "teacher");
    const other = account("t2@x.com", "teacher");
    const { classId, joinCode } = ok(createClass(db, teacher, "Period 1"));
    const parent = account("p@x.com", "parent");
    const { learnerId: ana } = addLearner(db, parent.user.id, "Ana");
    addLearner(db, parent.user.id, "Ben"); // never joins — must not appear
    joinClass(db, parent, joinCode, ana);

    expect(classRoster(db, other, classId)).toEqual({ error: "forbidden" });
    expect(classRoster(db, parent as SessionInfo, classId)).toEqual({ error: "forbidden" });
    const roster = ok(classRoster(db, teacher, classId));
    expect(roster.name).toBe("Period 1");
    expect(roster.members.map((m) => m.name)).toEqual(["Ana"]);

    const mine = ok(myClasses(db, teacher));
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ id: classId, members: 1 });
    expect(myClasses(db, other)).toEqual([]); // their own empty list, not this class
  });
});
