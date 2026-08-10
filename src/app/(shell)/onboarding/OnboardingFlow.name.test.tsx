// @vitest-environment jsdom
/**
 * The onboarding name step: typing a first name enables "Make it my trail" and
 * persists displayName; "Keep Maggie's Trail" skips without writing anything.
 * Either path lands on the grade screen.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import OnboardingFlow from "./OnboardingFlow";
import { progressStore } from "@/lib/progress";

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("onboarding name step", () => {
  it("submit is disabled until a real name is typed; submitting saves displayName and advances", () => {
    render(<OnboardingFlow />);
    const submit = screen.getByRole("button", { name: /make it my trail/i });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/your first name/i), { target: { value: "  David " } });
    expect((submit as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText(/David's Trail — has a nice ring/i)).toBeTruthy();
    fireEvent.click(submit);
    expect(progressStore.load().displayName).toBe("David");
    expect(screen.getByText(/which grade are you working on/i)).toBeTruthy();
  });

  it("keeping Maggie's Trail writes nothing and advances", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    expect(progressStore.load().displayName).toBeUndefined();
    expect(screen.getByText(/which grade are you working on/i)).toBeTruthy();
  });
  it("routes Grade 3 through the same 12-item diagnostic as every other grade, with an explicit bypass", () => {
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /keep maggie's trail/i }));
    fireEvent.click(screen.getByRole("button", { name: /grade 3/i }));
    fireEvent.click(screen.getByRole("button", { name: /keep up with school/i }));

    const diagnostic = screen.getByRole("link", { name: /take the 12-item diagnostic/i });
    expect(diagnostic.getAttribute("href")).toBe("/placement?grade=3&goal=school");
    expect(screen.queryByText(/quick question/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /start at my grade level/i }));
    expect(screen.getByText(/which trail first/i)).toBeTruthy();
  });

});
