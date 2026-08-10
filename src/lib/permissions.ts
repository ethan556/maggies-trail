/**
 * PERMISSIONS — who may see whose learning record.
 *
 * The one rule this module exists to make unbreakable: an adult sees a child's
 * data only through an explicit, recorded relationship — a parent through
 * their own roster, a teacher through a class the child JOINED, a school
 * admin through teachers registered to their school. No relationship, no data.
 *
 * `can()` is a pure function of the actor, the action, the resource, and an
 * ownership context the storage layer supplies. Pure means testable: the
 * denial tests in teacher.s42.test.ts are the enforcement proof the product
 * claims. Every teacher/school read path calls `assertCan` — there is no
 * second door.
 *
 * Scope honesty: identity comes from the auth layer, which today is the
 * honestly-labelled local MockAuthProvider. This module is the authority
 * model that real auth will plug into — the rules are real and enforced
 * against whatever identity the provider asserts.
 */

export type Role = "parent" | "teacher" | "school-admin";

export interface Actor {
  role: Role;
  accountId: string;
}

export type PermAction =
  | "read-learner" // a child's profile: progress, mastery, review, signals
  | "write-assignment" // create/update/delete assignments in a class
  | "manage-class" // create/rename/delete the class itself
  | "read-class" // roster + aggregates of one class
  | "read-school"; // cross-class aggregates for a school

export interface OwnershipContext {
  /** accountId → childIds on that account's roster (the parent relationship). */
  rosterOf: Record<string, string[]>;
  /** classId → owning teacher accountId. */
  classOwner: Record<string, string>;
  /** classId → childIds that JOINED with the class code. */
  classMembers: Record<string, string[]>;
  /** schoolId → teacher accountIds registered to it. */
  schoolTeachers: Record<string, string[]>;
  /** school-admin accountId → schoolId they administer. */
  adminSchool: Record<string, string>;
}

export interface PermResource {
  childId?: string;
  classId?: string;
  schoolId?: string;
}

export function can(actor: Actor, action: PermAction, res: PermResource, ctx: OwnershipContext): boolean {
  switch (action) {
    case "read-learner": {
      if (!res.childId) return false;
      if (actor.role === "parent") return (ctx.rosterOf[actor.accountId] ?? []).includes(res.childId);
      if (actor.role === "teacher") {
        // Only through a class this teacher OWNS that the child JOINED.
        return Object.entries(ctx.classOwner).some(
          ([classId, owner]) => owner === actor.accountId && (ctx.classMembers[classId] ?? []).includes(res.childId!)
        );
      }
      return false; // school admins see aggregates, never an individual record here
    }
    case "manage-class":
    case "write-assignment":
    case "read-class": {
      if (!res.classId) return false;
      if (actor.role === "teacher") return ctx.classOwner[res.classId] === actor.accountId;
      if (actor.role === "school-admin" && action === "read-class") {
        const school = ctx.adminSchool[actor.accountId];
        const owner = ctx.classOwner[res.classId];
        return !!school && !!owner && (ctx.schoolTeachers[school] ?? []).includes(owner);
      }
      return false;
    }
    case "read-school": {
      if (!res.schoolId) return false;
      return actor.role === "school-admin" && ctx.adminSchool[actor.accountId] === res.schoolId;
    }
  }
}

/** Throwing guard used by every teacher/school data path. */
export function assertCan(actor: Actor, action: PermAction, res: PermResource, ctx: OwnershipContext): void {
  if (!can(actor, action, res, ctx)) {
    throw new Error(`permission denied: ${actor.role} ${actor.accountId} may not ${action}`);
  }
}
