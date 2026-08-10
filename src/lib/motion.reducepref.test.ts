// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { prefersReducedMotion } from "./motion";

afterEach(() => {
  delete document.documentElement.dataset.reduceMotion;
});

describe("prefersReducedMotion honors the in-app reduce-animations toggle", () => {
  it("is false by default (no attribute, no OS preference)", () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it("is true when the root data-reduce-motion attribute is set", () => {
    document.documentElement.dataset.reduceMotion = "true";
    expect(prefersReducedMotion()).toBe(true);
  });
});
