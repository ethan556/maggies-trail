import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CURRICULUM_ICON_ASSETS,
  GRADE_ILLUSTRATION_IDS,
  STRUCTURE_ILLUSTRATION_IDS,
  SUBJECT_ILLUSTRATION_IDS,
  gradeIllustrationId,
  type CurriculumIllustrationId
} from "./curriculumIcons";

describe("premium curriculum icon registry", () => {
  it("has the bounded 12 subject + 14 grade + 5 structure taxonomy", () => {
    expect(SUBJECT_ILLUSTRATION_IDS).toHaveLength(12);
    expect(GRADE_ILLUSTRATION_IDS).toHaveLength(14);
    expect(STRUCTURE_ILLUSTRATION_IDS).toHaveLength(5);
    expect(Object.keys(CURRICULUM_ICON_ASSETS)).toHaveLength(31);
    expect(new Set(Object.keys(CURRICULUM_ICON_ASSETS)).size).toBe(31);
  });

  it("keeps every path canonical and every enabled release backed by a real file", () => {
    for (const [id, asset] of Object.entries(CURRICULUM_ICON_ASSETS)) {
      expect(asset.id).toBe(id);
      expect(asset.src).toBe(`/illustrations/icons/${asset.category}/${id}-512.webp`);
      if (asset.enabled) {
        expect(existsSync(join(process.cwd(), "public", asset.src.slice(1))), asset.src).toBe(true);
      }
    }
  });

  it("maps the 0–13 product ladder to all 14 grade assets exactly once", () => {
    const mapped = Array.from({ length: 14 }, (_, grade) => gradeIllustrationId(grade));
    expect(mapped).toEqual(GRADE_ILLUSTRATION_IDS);
    expect(() => gradeIllustrationId(-1)).toThrow(RangeError);
    expect(() => gradeIllustrationId(14)).toThrow(RangeError);
  });

  it("keeps the generation prompt pack in exact id/path parity with runtime", () => {
    const pack = JSON.parse(
      readFileSync(join(process.cwd(), "curriculum-icon-prompts.json"), "utf8")
    ) as {
      version: number;
      styleLock: string;
      negativePrompt: string;
      assets: Array<{ id: CurriculumIllustrationId; path: string; scene: string }>;
    };

    expect(pack.version).toBe(1);
    expect(pack.styleLock.length).toBeGreaterThan(300);
    expect(pack.negativePrompt.length).toBeGreaterThan(150);
    expect(pack.assets).toHaveLength(31);
    expect(new Set(pack.assets.map((asset) => asset.id))).toEqual(
      new Set(Object.keys(CURRICULUM_ICON_ASSETS))
    );
    for (const promptAsset of pack.assets) {
      const runtime = CURRICULUM_ICON_ASSETS[promptAsset.id];
      expect(promptAsset.path).toBe(`/public${runtime.src}`);
      expect(promptAsset.scene.length).toBeGreaterThan(80);
    }
  });
});

