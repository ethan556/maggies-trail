// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CatalogClient, { type CatalogCourseProps } from "./CatalogClient";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function course(slug: string, gradeLevel: number, title: string): CatalogCourseProps {
  return {
    slug,
    gradeLevel,
    title,
    tagline: `Learn ${title.toLowerCase()}`,
    lessonCount: 2,
    totalMinutes: 20,
    chapterCount: 1,
    lessons: [
      { id: `${slug}-one`, title: `${title} foundations` },
      { id: `${slug}-two`, title: `${title} practice` }
    ]
  };
}

const COURSES = [
  course("counting", 0, "Counting"),
  course("fractions-4", 4, "Fraction Models"),
  course("fractions-7", 7, "Fraction Operations"),
  course("algebra", 9, "Algebra Foundations"),
  course("functions", 11, "Advanced Functions")
];

describe("CatalogClient level navigation", () => {
  it("filters the long catalogue into an accessible grade range", () => {
    render(<CatalogClient courses={COURSES} upcoming={[]} />);

    const middle = screen.getByRole("button", { name: "Grades 6-8" });
    fireEvent.click(middle);

    expect(middle.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByText("Fraction Operations").length).toBeGreaterThan(0);
    expect(screen.queryByText("Counting")).toBeNull();
    expect(screen.queryByText("Fraction Models")).toBeNull();
    expect(screen.queryByText("Algebra Foundations")).toBeNull();
    expect(screen.getByText("Showing Grades 6-8 courses.")).toBeTruthy();
  });

  it("applies the selected level to search results and offers guided placement", () => {
    render(<CatalogClient courses={COURSES} upcoming={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Grades 6-8" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search courses and lessons" }), {
      target: { value: "fraction" }
    });

    expect(screen.getAllByText("Fraction Operations").length).toBeGreaterThan(0);
    expect(screen.queryByText("Fraction Models")).toBeNull();
    expect(screen.getByRole("link", { name: "Not sure? Find my level" }).getAttribute("href")).toBe("/placement");
  });
});
