import { describe, expect, it } from "vitest";
import { AVATARS, getAvatar, isValidAvatarId } from "./avatars";
import {
  ENABLED_MATH_SYMBOL_AVATAR_IDS,
  getEnabledMathSymbolAvatars,
  isCompleteMathSymbolCohortEnabled,
  MATH_SYMBOL_AVATARS
} from "./mathSymbolAvatars";

describe("premium mathematics-symbol avatar extension", () => {
  it("keeps the locked 60-item core and the 12-item extension disjoint", () => {
    expect(AVATARS).toHaveLength(60);
    expect(MATH_SYMBOL_AVATARS).toHaveLength(12);
    const core = new Set(AVATARS.map((avatar) => avatar.id));
    expect(MATH_SYMBOL_AVATARS.filter((avatar) => core.has(avatar.id))).toEqual([]);
  });

  it("reserves 501-512 in exact order with non-leading semantic names", () => {
    expect(MATH_SYMBOL_AVATARS.map((avatar) => avatar.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => `avatar-${501 + index}`)
    );
    for (const avatar of MATH_SYMBOL_AVATARS) {
      expect(avatar.semanticName).toMatch(/ symbol avatar$|Derivative symbol avatar|Function symbol avatar|Limit symbol avatar/);
      expect(getAvatar(avatar.id)).toEqual(avatar);
    }
  });

  it("releases the independently approved collection as one complete 12-item cohort", () => {
    expect(ENABLED_MATH_SYMBOL_AVATAR_IDS).toEqual(MATH_SYMBOL_AVATARS.map((avatar) => avatar.id));
    expect(isCompleteMathSymbolCohortEnabled()).toBe(true);
    expect(getEnabledMathSymbolAvatars()).toEqual(MATH_SYMBOL_AVATARS);
    for (const avatar of MATH_SYMBOL_AVATARS) expect(isValidAvatarId(avatar.id)).toBe(true);
  });
});
