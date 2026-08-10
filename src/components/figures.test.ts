import { describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { FIGURES } from "@/components/figures";

/** Every `figure` name authored in content must exist in the FIGURES registry. */
describe("figure registry integrity", () => {
  it("resolves every authored figure name", async () => {
    const root = path.join(process.cwd(), "content", "courses");
    const names: string[] = [];
    for (const course of await fs.readdir(root)) {
      const dir = path.join(root, course, "lessons");
      let files: string[] = [];
      try { files = await fs.readdir(dir); } catch { continue; }
      for (const f of files) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
        for (const s of lesson.steps ?? []) if (s.figure) names.push(s.figure);
        for (const r of lesson.remedials ?? []) {
          if (r.concept?.figure) names.push(r.concept.figure);
          if (r.check?.figure) names.push(r.check.figure);
        }
      }
    }
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) expect(FIGURES[n], `unregistered figure "${n}"`).toBeDefined();
  });
});

/** Every registered figure must actually render: an <svg> with an accessibility <title>,
 *  no text node below the 10-unit readability floor. (Added at the G6 band close.) */
describe("figure render sweep", () => {
  it("renders every registered figure with svg + narrated title + ≥10-unit text", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    for (const name of Object.keys(FIGURES)) {
      const svg = renderToStaticMarkup(FIGURES[name]());
      expect(svg, `${name}: no <svg>`).toContain("<svg");
      expect(svg, `${name}: missing accessibility <title>`).toContain("<title>");
      const sizes = [...svg.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1]));
      for (const s of sizes) expect(s, `${name}: text below 10-unit floor (${s})`).toBeGreaterThanOrEqual(10);
      // Any figure that animates MUST gate the motion on prefers-reduced-motion, so the
      // static/base render stays the complete teaching state (the G1–G2 animation contract).
      const animates = svg.includes("@keyframes") || svg.includes("<animate");
      if (animates) {
        expect(svg, `${name}: animates but has no prefers-reduced-motion guard`).toContain(
          "prefers-reduced-motion"
        );
      }
    }
  });
});
