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
  ENABLED_AVATAR_IDS,
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
  // "4" (kind "symbol") is deliberately absent from this fixed map: unlike blocks 0-3, a symbol's
  // `ageBand` isn't determined by its id block — it's assigned per entry by thematic/tonal fit
  // (see the AvatarKind doc comment in avatars.ts and AVATAR_CONCEPT_LEDGER.md's symbol expansion
  // table). The block-agreement test below checks block-4 entries against ALL_AGE_BANDS and
  // `kind === "symbol"` instead of one fixed band.
};
const ALL_AGE_BANDS: AgeBand[] = ["early", "explorer", "adventurer", "summit"];

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

  it("id numeric block encodes the age band for human blocks (0xx early / 1xx explorer / 2xx adventurer / 3xx summit); the symbol block (4xx) carries kind 'symbol' and a valid ageBand instead of one fixed band", () => {
    for (const avatar of AVATARS) {
      const digits = avatar.id.replace("avatar-", "");
      expect(digits, avatar.id).toMatch(/^\d{3}$/);
      const block = digits[0];
      if (block === "4") {
        expect(avatar.kind, avatar.id).toBe("symbol");
        expect(ALL_AGE_BANDS, avatar.id).toContain(avatar.ageBand);
      } else {
        expect(avatar.kind, avatar.id).toBe("human");
        expect(avatar.ageBand, `${avatar.id} block ${block}`).toBe(BLOCK_BAND[block]);
      }
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

  it("the manifest totals 60 entries: 48 human at 12 per band, plus 12 symbol at 3 per band", () => {
    expect(AVATARS).toHaveLength(60);
    const human = AVATARS.filter((a) => a.kind === "human");
    const symbol = AVATARS.filter((a) => a.kind === "symbol");
    expect(human).toHaveLength(48);
    expect(symbol).toHaveLength(12);
    for (const band of ["early", "explorer", "adventurer", "summit"] as const) {
      expect(human.filter((a) => a.ageBand === band), `human count in ${band}`).toHaveLength(12);
      expect(symbol.filter((a) => a.ageBand === band), `symbol count in ${band}`).toHaveLength(3);
    }
  });

  it("the original 16 board-anchored ids are present with their band/order/kind unchanged by the expansion", () => {
    const original: Array<[string, AgeBand, number]> = [
      ["avatar-001", "early", 1],
      ["avatar-002", "early", 2],
      ["avatar-003", "early", 3],
      ["avatar-004", "early", 4],
      ["avatar-005", "early", 5],
      ["avatar-006", "early", 6],
      ["avatar-007", "early", 7],
      ["avatar-008", "early", 8],
      ["avatar-101", "explorer", 1],
      ["avatar-102", "explorer", 2],
      ["avatar-103", "explorer", 3],
      ["avatar-104", "explorer", 4],
      ["avatar-201", "adventurer", 1],
      ["avatar-202", "adventurer", 2],
      ["avatar-203", "adventurer", 3],
      ["avatar-204", "adventurer", 4]
    ];
    expect(original).toHaveLength(16);
    for (const [id, band, order] of original) {
      const avatar = getAvatar(id);
      expect(avatar, id).toBeDefined();
      expect(avatar!.ageBand, id).toBe(band);
      expect(avatar!.order, id).toBe(order);
      expect(avatar!.kind, id).toBe("human");
      expect(avatar!.enabled, id).toBe(ENABLED_AVATAR_IDS.includes(id));
    }
  });

  it("every expansion id resolves and its enabled state follows the release allowlist", () => {
    const expansionIds = [
      "avatar-009", "avatar-010", "avatar-011", "avatar-012",
      "avatar-105", "avatar-106", "avatar-107", "avatar-108", "avatar-109", "avatar-110", "avatar-111", "avatar-112",
      "avatar-205", "avatar-206", "avatar-207", "avatar-208", "avatar-209", "avatar-210", "avatar-211", "avatar-212",
      "avatar-301", "avatar-302", "avatar-303", "avatar-304", "avatar-305", "avatar-306",
      "avatar-307", "avatar-308", "avatar-309", "avatar-310", "avatar-311", "avatar-312",
      "avatar-401", "avatar-402", "avatar-403", "avatar-404", "avatar-405", "avatar-406",
      "avatar-407", "avatar-408", "avatar-409", "avatar-410", "avatar-411", "avatar-412"
    ];
    expect(expansionIds).toHaveLength(44);
    for (const id of expansionIds) {
      const avatar = getAvatar(id);
      expect(avatar, id).toBeDefined();
      expect(avatar!.enabled, id).toBe(ENABLED_AVATAR_IDS.includes(id));
    }
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

  it("getAvatar resolves the expansion bands and kinds too (summit human, symbol)", () => {
    expect(getAvatar("avatar-301")?.ageBand).toBe("summit");
    expect(getAvatar("avatar-301")?.kind).toBe("human");
    expect(getAvatar("avatar-401")?.kind).toBe("symbol");
    // avatar-401 is assigned "adventurer" by thematic fit (AVATAR_CONCEPT_LEDGER.md's symbol
    // expansion table), not gated to it — any band can select it via "See all avatars".
    expect(getAvatar("avatar-401")?.ageBand).toBe("adventurer");
  });

  it("isValidAvatarId follows the reviewed release allowlist", () => {
    for (const avatar of AVATARS) {
      expect(isValidAvatarId(avatar.id), avatar.id).toBe(ENABLED_AVATAR_IDS.includes(avatar.id));
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
    // Same rule for the 44 net-new expansion entries — disabled is disabled, regardless of age.
    expect(getAvatarSrc("avatar-312", 512)).toBeUndefined();
    expect(getAvatarSrc("avatar-412", 256)).toBeUndefined();
  });
});

describe("getAvatarsForAgeBand / getDefaultAvatarForGrade", () => {
  it("every band returns empty today — honest reflection of zero enabled entries", () => {
    for (const band of ["early", "explorer", "adventurer", "summit"] as const) {
      expect(getAvatarsForAgeBand(band)).toEqual([]);
    }
  });

  it("getDefaultAvatarForGrade is undefined everywhere today", () => {
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

  it("the placeholder file itself actually exists on disk", () => {
    const path = join(process.cwd(), "public", AVATAR_PLACEHOLDER_SRC);
    expect(existsSync(path)).toBe(true);
  });
});

describe("honesty gate — enabled art must be real (see AVATAR_ART_PRODUCTION_SPEC.md §8)", () => {
  it("the release allowlist contains only unique, declared ids", () => {
    expect(new Set(ENABLED_AVATAR_IDS).size).toBe(ENABLED_AVATAR_IDS.length);
    for (const id of ENABLED_AVATAR_IDS) expect(getAvatar(id), id).toBeDefined();
  });

  it("the release allowlist stays closed until a coherent canary passes", () => {
    expect(ENABLED_AVATAR_IDS).toEqual([]);
    expect(AVATARS.filter((a) => a.enabled).map((a) => a.id)).toEqual(ENABLED_AVATAR_IDS);
  });

  it("every enabled avatar has BOTH its 256 and 512 webp files on disk", () => {
    const enabled = AVATARS.filter((a) => a.enabled);
    for (const avatar of enabled) {
      const p256 = join(process.cwd(), "public", avatar.src256);
      const p512 = join(process.cwd(), "public", avatar.src512);
      expect(existsSync(p256), `enabled avatar ${avatar.id} is missing ${avatar.src256}`).toBe(true);
      expect(existsSync(p512), `enabled avatar ${avatar.id} is missing ${avatar.src512}`).toBe(true);
    }
  });
});
