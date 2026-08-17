import { describe, expect, it } from "vitest";
import { avatarAssetValidationErrors } from "../../scripts/brand/validate-avatar-assets";

describe("avatar production assets", () => {
  it("pass the deterministic manifest, export, and file-integrity gate", () => {
    expect(avatarAssetValidationErrors).toEqual([]);
  });
});
