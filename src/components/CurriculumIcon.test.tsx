// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { curriculumIconAsset } from "@/lib/curriculumIcons";
import { CurriculumIcon } from "./CurriculumIcon";

describe("CurriculumIcon", () => {
  it("keeps adjacent-heading uses decorative while exposing honest art status", () => {
    const { container } = render(<CurriculumIcon id="subject-fractions-ratios" size={42} />);
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.getAttribute("aria-hidden")).toBe("true");
    expect(frame.getAttribute("data-illustration-id")).toBe("subject-fractions-ratios");
    expect(frame.getAttribute("data-art-status")).toBe(
      curriculumIconAsset("subject-fractions-ratios").enabled
        ? "production"
        : "code-native-fallback"
    );
  });

  it("announces a standalone icon exactly once through its wrapper", () => {
    render(<CurriculumIcon id="structure-chapter-landmark" title="Chapter landmark" />);
    expect(screen.getByRole("img", { name: "Chapter landmark" })).toBeTruthy();
  });

  it("uses concise live grade text in the dimensional fallback", () => {
    const { container } = render(<CurriculumIcon id="grade-algebra-1" />);
    const asset = curriculumIconAsset("grade-algebra-1");
    if (!asset.enabled) expect(container.textContent).toBe("A1");
  });
});

