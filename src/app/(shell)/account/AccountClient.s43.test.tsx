// @vitest-environment jsdom
/**
 * ACCOUNT SURFACE (s43) — adoption test for the real-credentials rebuild:
 *  · signed out: the form gates Sign in on email+password and Create account
 *    on the 8-char server rule — the client mirrors the server's contract;
 *  · signed in: the view renders the mirror AND asks /api/auth/me who the
 *    cookie really is, showing role + verification from the SERVER's answer.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import AccountClient from "@/app/(shell)/account/AccountClient";
import { MockAuthProvider, _setAuthProviderForTests, authProvider } from "@/lib/auth";

_setAuthProviderForTests(new MockAuthProvider()); // jsdom has no API routes

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => JSON.stringify(body),
}) as Response;

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ user: null }, 200)));
});

describe("AccountClient", () => {
  it("gates the actions on the server's own rules", () => {
    render(<AccountClient />);
    const signIn = screen.getByRole("button", { name: /^Sign in$/ }) as HTMLButtonElement;
    const create = screen.getByRole("button", { name: /^Create account$/ }) as HTMLButtonElement;
    expect(signIn.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("account email"), { target: { value: "p@x.com" } });
    fireEvent.change(screen.getByLabelText("account password"), { target: { value: "short" } });
    expect(signIn.disabled).toBe(false); // any password can be TRIED…
    expect(create.disabled).toBe(true); // …but creation mirrors the 8+ rule
    fireEvent.change(screen.getByLabelText("account password"), { target: { value: "long-enough" } });
    expect(create.disabled).toBe(false);
  });

  it("signed in: renders the mirror and the server's role/verification answer", async () => {
    await authProvider.signIn("p@x.com");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url).includes("/api/auth/me")) {
          return jsonResponse({ user: { email: "p@x.com", role: "parent", verified: true } });
        }
        return jsonResponse({});
      })
    );
    render(<AccountClient />);
    expect(screen.getByText("p@x.com")).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/parent · email verified/)).toBeTruthy());
    expect(screen.getByRole("button", { name: /Sync this learner/ })).toBeTruthy();
  });
});
