// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SkipLink from "./SkipLink";

afterEach(cleanup);

describe("SkipLink", () => {
  it("names and targets the main content landmark", () => {
    render(
      <>
        <SkipLink />
        <main id="main-content" tabIndex={-1}>Lesson content</main>
      </>
    );

    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.getAttribute("href")).toBe("#main-content");
    expect(document.querySelectorAll("#main-content")).toHaveLength(1);
  });

  it("supports a scoped target without changing its accessible name", () => {
    render(<SkipLink targetId="lesson-main" />);
    expect(screen.getByRole("link", { name: "Skip to main content" }).getAttribute("href")).toBe("#lesson-main");
  });
});
