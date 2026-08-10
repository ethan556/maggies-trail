// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { accountIdFor, authProvider, MockAuthProvider, _setAuthProviderForTests } from "./auth";
_setAuthProviderForTests(new MockAuthProvider()); // jsdom has no API routes
import { entitlementFor, grant, isFamilyPlan, isPremium, revoke } from "./entitlement";
import { emptyProfile } from "./progress";

afterEach(() => localStorage.clear());

describe("auth (mock)", () => {
  it("derives a stable account id from the email, case/space insensitive", () => {
    expect(accountIdFor("Parent@Example.com ")).toBe(accountIdFor("parent@example.com"));
    expect(accountIdFor("a@b.com")).not.toBe(accountIdFor("c@d.com"));
  });

  it("signs in, persists the session, and signs out", async () => {
    expect(authProvider.currentSession()).toBeNull();
    const s = await authProvider.signIn("parent@example.com");
    expect(s.accountId).toBe(accountIdFor("parent@example.com"));
    expect(authProvider.currentSession()?.email).toBe("parent@example.com");
    authProvider.signOut();
    expect(authProvider.currentSession()).toBeNull();
  });

  it("is honest that it verifies nothing", () => {
    expect(authProvider.verifies).toBe(false);
  });
});

describe("entitlement", () => {
  it("a family plan bought once covers EVERY learner on the roster", () => {
    const acct = accountIdFor("parent@example.com");
    grant(acct, "family");

    // Three different children — none of them carries a per-profile premium flag.
    const kidA = emptyProfile();
    const kidB = emptyProfile();
    const kidC = emptyProfile();

    expect(isPremium(kidA, acct)).toBe(true);
    expect(isPremium(kidB, acct)).toBe(true);
    expect(isPremium(kidC, acct)).toBe(true);
    expect(isFamilyPlan(acct)).toBe(true);
  });

  it("does not leak entitlement to a different account", () => {
    grant(accountIdFor("a@example.com"), "family");
    expect(isPremium(emptyProfile(), accountIdFor("b@example.com"))).toBe(false);
  });

  it("honours the legacy per-profile premium flag so nobody loses access", () => {
    const legacy = { ...emptyProfile(), premium: { plan: "yearly", since: "2026-01-01" } };
    expect(isPremium(legacy, null)).toBe(true);
  });

  it("free by default, and revocable", () => {
    const acct = accountIdFor("parent@example.com");
    expect(isPremium(emptyProfile(), acct)).toBe(false);
    grant(acct, "monthly");
    expect(isPremium(emptyProfile(), acct)).toBe(true);
    revoke(acct);
    expect(entitlementFor(acct)).toBeNull();
    expect(isPremium(emptyProfile(), acct)).toBe(false);
  });

  it("marks demo grants as demo — never claims a real payment happened", () => {
    const acct = accountIdFor("parent@example.com");
    expect(grant(acct, "family").demo).toBe(true);
  });
});
