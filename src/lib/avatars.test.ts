/**
 * Avatar manifest contract.
 *
 * Two kinds of check here. Most are ordinary shape/behavior tests (ids unique, paths follow the
 * naming convention, gradeToAgeBand's boundaries, the service functions' behavior over today's
 * all-disabled manifest). The last group is the honesty gate: it is what stands between this
 * manifest and a future edit that quietly ships a board crop or an unrendered placeholder as if it
 * were finished art. See AVATAR_ART_PRODUCTION_SPEC.md §8.
 *
 * Runs in vitest's default `node` environment (see vitest.config.ts) — nothing here touches
 * localStorage/window, so no jsdom override is needed.
 */
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  AVATAR_PLACEHOLDER_SRC,
  AVATARS,
  gradeToAgeBand,
  getAvatar,
  getAvatarSrc,
  getAvatarsForAgeBand,
  getDefaultAvatarForGrade,
  isValidAvatarId,
  type AgeBand
} from "./avatars";

const SRC_RE = /^\/avatars\/(avatar-\d{3})-(256|512)\.webp$/;
const BLOCK_BAND: Record<string, AgeBand> = {
  "0": "early",
  "1": "explorer",
  "2": "adventurer",
  "3": "summit"
  // "4" is reserved for kind "symbol" avatars, which still carry a real ageBand (see the
  // AvatarKind doc comment in avatars.ts) but aren't covered by this block map — no manifest
  // entries use block "4" yet, so there is nothing to check against here.
};

describe("AVATARS manifest shape", () => {
  it("every id is unique", () => {
    const ids = AVATARS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("src256/src512 follow the deterministic naming convention and embed their own id", () => {
    for (const avatar of AVATARS) {
      const m256 = avatar.src256.match(SRC_RE);
      const m512 = avatar.src512.match(SRC_RE);
      expect(m256, `src256 "${avatar.src256}" for ${avatar.id}`).not.toBeNull();
      expect(m512, `src512 "${avatar.src512}" for ${avatar.id}`).not.toBeNull();
      expect(m256![1]).toBe(avatar.id);
      expect(m512![1]).toBe(avatar.id);
      expect(m256![2]).toBe("256");
      expect(m512![2]).toBe("512");
    }
  });

  it("every src stays inside /avatars/ — never design-reference or anywhere else", () => {
    for (const avatar of AVATARS) {
      expect(avatar.src256.startsWith("/avatars/")).toBe(true);
      expect(avatar.src512.startsWith("/avatars/")).toBe(true);
      expect(avatar.src256).not.toContain("design-reference");
      expect(avatar.src512).not.toContain("design-reference");
    }
  });

  it("id numeric block encodes the age band (0xx early / 1xx explorer / 2xx adventurer / 3xx summit)", () => {
    for (const avatar of AVATARS) {
      const digits = avatar.id.replace("avatar-", "");
      expect(digits, avatar.id).toMatch(/^\d{3}$/);
      const block = digits[0];
      expect(avatar.ageBand, `${avatar.id} block ${block}`).toBe(BLOCK_BAND[block]);
    }
  });

  it("order is a positive integer, unique within its band", () => {
    const byBand = new Map<AgeBand, number[]>();
    for (const avatar of AVATARS) {
      expect(Number.isInteger(avatar.order)).toBe(true);
      expect(avatar.order).toBeGreaterThan(0);
      const list = byBand.get(avatar.ageBand) ?? [];
      list.push(avatar.order);
      byBand.set(avatar.ageBand, list);
    }
    for (const [band, orders] of byBand) {
      expect(new Set(orders).size, `duplicate order within ${band}`).toBe(orders.length);
    }
  });

  it("today's 16 entries are all kind 'human' (no symbol concepts exist yet — see the concept ledger)", () => {
    expect(AVATARS.every((a) => a.kind === "human")).toBe(true);
    expect(AVATARS).toHaveLength(16);
  });
});

describe("gradeToAgeBand", () => {
  it("maps every grade boundary to the right band", () => {
    expect(gradeToAgeBand(0)).toBe("early");
    expect(gradeToAgeBand(2)).toBe("early");
    expect(gradeToAgeBand(3)).toBe("explorer");
    expect(gradeToAgeBand(5)).toBe("explorer");
    expect(gradeToAgeBand(6)).toBe("adventurer");
    expect(gradeToAgeBand(8)).toBe("adventurer");
    expect(gradeToAgeBand(9)).toBe("summit");
    expect(gradeToAgeBand(13)).toBe("summit");
  });

  it("clamps out-of-range and non-finite input instead of throwing", () => {
    expect(gradeToAgeBand(-5)).toBe("early");
    expect(gradeToAgeBand(-Infinity)).toBe("early");
    expect(gradeToAgeBand(20)).toBe("summit");
    expect(gradeToAgeBand(Infinity)).toBe("summit");
    expect(gradeToAgeBand(NaN)).toBe("summit");
  });
});

describe("getAvatar / isValidAvatarId", () => {
  it("getAvatar finds a known id regardless of enabled state, and misses an unknown one", () => {
    expect(getAvatar("avatar-001")?.ageBand).toBe("early");
    expect(getAvatar("avatar-999")).toBeUndefined();
  });

  it("isValidAvatarId is false for every id today, because nothing is enabled yet", () => {
    for (const avatar of AVATARS) {
      expect(isValidAvatarId(avatar.id), avatar.id).toBe(false);
    }
  });

  it("isValidAvatarId is false for an unknown id", () => {
    expect(isValidAvatarId("avatar-does-not-exist")).toBe(false);
  });
});

describe("getAvatarSrc", () => {
  it("never returns a path for a disabled or unknown id", () => {
    expect(getAvatarSrc("avatar-001", 256)).toBeUndefined();
    expect(getAvatarSrc("avatar-001", 512)).toBeUndefined();
    expect(getAvatarSrc("avatar-999", 256)).toBeUndefined();
  });
});

describe("getAvatarsForAgeBand / getDefaultAvatarForGrade", () => {
  it("every band returns empty today — honest reflection of zero enabled entries", () => {
    for (const band of ["early", "explorer", "adventurer", "summit"] as const) {
      expect(getAvatarsForAgeBand(band)).toEqual([]);
    }
  });

  it("getDefaultAvatarForGrade is undefined everywhere today, so callers fall through the legacy chain", () => {
    for (const grade of [0, 2, 3, 5, 6, 8, 9, 13]) {
      expect(getDefaultAvatarForGrade(grade)).toBeUndefined();
    }
  });
});

describe("AVATAR_PLACEHOLDER_SRC", () => {
  it("points inside /avatars/ and is never a manifest id", () => {
    expect(AVATAR_PLACEHOLDER_SRC).toBe("/avatars/placeholder-neutral.svg");
    expect(AVATARS.some((a) => AVATAR_PLACEHOLDER_SRC.includes(a.id))).toBe(false);
  });

  it("the placeholder file itself actually exists on disk (it's the one asset this pass ships)", () => {
    const path = join(process.cwd(), "public", AVATAR_PLACEHOLDER_SRC);
    expect(existsSync(path)).toBe(true);
  });
});

describe("honesty gate — enabled art must be real (see AVATAR_ART_PRODUCTION_SPEC.md §8)", () => {
  it("nothing in the manifest is enabled yet (documents today's honest-placeholder state)", () => {
    expect(AVATARS.every((a) => !a.enabled)).toBe(true);
  });

  it("every enabled avatar has BOTH its 256 and 512 webp files on disk — vacuous today, permanent going forward", () => {
    const enabled = AVATARS.filter((a) => a.enabled);
    for (const avatar of enabled) {
      const p256 = join(process.cwd(), "public", avatar.src256);
      const p512 = join(process.cwd(), "public", avatar.src512);
      expect(existsSync(p256), `enabled avatar ${avatar.id} is missing ${avatar.src256}`).toBe(true);
      expect(existsSync(p512), `enabled avatar ${avatar.id} is missing ${avatar.src512}`).toBe(true);
    }
  });
});
