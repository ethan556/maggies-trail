import { describe, expect, it } from "vitest";
import {
  avatarAssetValidationErrors,
  avatarAssetValidationPromise
} from "../../scripts/brand/validate-avatar-assets";

describe("avatar production assets", () => {
  it("pass the deterministic manifest, export, and file-integrity gate", async () => {
    await avatarAssetValidationPromise;
    expect(avatarAssetValidationErrors).toEqual([]);
  }, 30_000);
});
