/**
 * Avatar manifest contract.
 *
 * Two kinds of check here. Most are ordinary shape/behavior tests (ids unique, paths follow the
 * naming convention, gradeToAgeBand's boundaries, the service functions' behavior over the
 * manifest). The last group is the honesty gate: it is what stands between this manifest and an
 * edit that quietly ships a board crop, an unrendered placeholder, or a 0-byte file as if it were
 * finished art. See AVATAR_ART_PRODUCTION_SPEC.md §8.
 *
 * Production art landed 2026-08-14, so that gate is no longer vacuous: all 60 entries are
 * `enabled: true` and it now decodes 120 real WebP files off disk on every run.
 *
 * Runs in vitest's default `node` environment (see vitest.config.ts) — nothing here touches
 * localStorage/window, so no jsdom override is needed.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
  // "4" (kind "symbol") is deliberately absent from this fixed map: unlike blocks 0-3, a symbol's
  // `ageBand` isn't determined by its id block — it's assigned per entry by thematic/tonal fit
  // (see the AvatarKind doc comment in avatars.ts and AVATAR_CONCEPT_LEDGER.md's symbol expansion
  // table). The block-agreement test below checks block-4 entries against ALL_AGE_BANDS and
  // `kind === "symbol"` instead of one fixed band.
};
const ALL_AGE_BANDS: AgeBand[] = ["early", "explorer", "adventurer", "summit"];

/**
 * Dependency-free WebP header reader — returns the encoded canvas size, or null if the bytes are
 * not a WebP at all. Deliberately parses the file rather than trusting its name: a renamed PNG, a
 * truncated write, or a 0-byte placeholder all fail here, which is the entire point of the gate
 * below. Handles all three chunk layouts (lossy VP8, lossless VP8L, extended VP8X) so a future
 * re-encode at different settings does not silently turn this check off.
 */
function webpSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 30) return null;
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") return null;
  const fourcc = bytes.toString("ascii", 12, 16);
  if (fourcc === "VP8 ") {
    // Key-frame header: 3-byte frame tag, then the 3-byte start code, then 14-bit w/h.
    if (bytes.toString("hex", 23, 26) !== "9d012a") return null;
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === "VP8L") {
    if (bytes[20] !== 0x2f) return null;
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === "VP8X") {
    return {
      width: (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) + 1,
      height: (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) + 1
    };
  }
  return null;
}

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
      expect(avatar!.enabled, id).toBe(true);
    }
  });

  it("every one of the 44 net-new expansion ids (early 009-012, explorer 105-112, adventurer 205-212, summit 301-312, symbol 401-412) resolves and is enabled", () => {
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
      expect(avatar!.enabled, id).toBe(true);
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

  it("isValidAvatarId is true for every id, now that every entry is enabled and backed by files", () => {
    for (const avatar of AVATARS) {
      expect(isValidAvatarId(avatar.id), avatar.id).toBe(true);
    }
  });

  it("isValidAvatarId is false for an unknown id", () => {
    expect(isValidAvatarId("avatar-does-not-exist")).toBe(false);
  });

  // The disabled branch is the whole safety mechanism of AVATAR_ART_PRODUCTION_SPEC.md §8, so it
  // keeps a real test even though no entry ships disabled today. `AVATARS` holds live objects that
  // the service functions read on every call, so flipping one flag exercises the true code path
  // (rather than a mock of it) and proves a pulled portrait becomes unusable everywhere at once.
  // Restored in `finally` so no other test in this file can observe the mutation.
  it("a disabled entry is unusable — isValidAvatarId false, getAvatarSrc undefined, dropped from its band", () => {
    const victim = AVATARS.find((a) => a.id === "avatar-005")!;
    try {
      victim.enabled = false;
      expect(isValidAvatarId("avatar-005")).toBe(false);
      expect(getAvatarSrc("avatar-005", 256)).toBeUndefined();
      expect(getAvatarSrc("avatar-005", 512)).toBeUndefined();
      expect(getAvatarsForAgeBand("early").map((a) => a.id)).not.toContain("avatar-005");
      // getAvatar still finds it — inspection is deliberately not gated on `enabled`.
      expect(getAvatar("avatar-005")).toBeDefined();
    } finally {
      victim.enabled = true;
    }
    expect(isValidAvatarId("avatar-005")).toBe(true);
  });
});

describe("getAvatarSrc", () => {
  it("returns each enabled id's own declared path, at both sizes", () => {
    expect(getAvatarSrc("avatar-001", 256)).toBe("/avatars/avatar-001-256.webp");
    expect(getAvatarSrc("avatar-001", 512)).toBe("/avatars/avatar-001-512.webp");
    // The 44 net-new expansion entries resolve identically — summit human and symbol included.
    expect(getAvatarSrc("avatar-312", 512)).toBe("/avatars/avatar-312-512.webp");
    expect(getAvatarSrc("avatar-412", 256)).toBe("/avatars/avatar-412-256.webp");
  });

  it("never returns a path for an unknown id", () => {
    expect(getAvatarSrc("avatar-999", 256)).toBeUndefined();
    expect(getAvatarSrc("avatar-does-not-exist", 512)).toBeUndefined();
  });

  it("every path it hands back matches that entry's own manifest fields — no drift", () => {
    for (const avatar of AVATARS) {
      expect(getAvatarSrc(avatar.id, 256), avatar.id).toBe(avatar.src256);
      expect(getAvatarSrc(avatar.id, 512), avatar.id).toBe(avatar.src512);
    }
  });
});

describe("getAvatarsForAgeBand / getDefaultAvatarForGrade", () => {
  it("every band returns its full 15 (12 human + 3 symbol), sorted by order", () => {
    for (const band of ["early", "explorer", "adventurer", "summit"] as const) {
      const list = getAvatarsForAgeBand(band);
      expect(list, band).toHaveLength(15);
      expect(list.every((a) => a.ageBand === band && a.enabled), band).toBe(true);
      expect(list.map((a) => a.order), band).toEqual([...list.map((a) => a.order)].sort((x, y) => x - y));
    }
  });

  it("getDefaultAvatarForGrade resolves for every grade, to the order-1 entry of that grade's band", () => {
    const expected: Array<[number, string]> = [
      [0, "avatar-001"],
      [2, "avatar-001"],
      [3, "avatar-101"],
      [5, "avatar-101"],
      [6, "avatar-201"],
      [8, "avatar-201"],
      [9, "avatar-301"],
      [13, "avatar-301"]
    ];
    for (const [grade, id] of expected) {
      const avatar = getDefaultAvatarForGrade(grade);
      expect(avatar, `grade ${grade}`).toBeDefined();
      expect(avatar!.id, `grade ${grade}`).toBe(id);
      expect(avatar!.order, `grade ${grade}`).toBe(1);
    }
  });
});

describe("AVATAR_PLACEHOLDER_SRC", () => {
  it("points inside /avatars/ and is never a manifest id", () => {
    expect(AVATAR_PLACEHOLDER_SRC).toBe("/avatars/placeholder-neutral.svg");
    expect(AVATARS.some((a) => AVATAR_PLACEHOLDER_SRC.includes(a.id))).toBe(false);
  });

  it("the placeholder file itself actually exists on disk (still the pre-choice fallback)", () => {
    const path = join(process.cwd(), "public", AVATAR_PLACEHOLDER_SRC);
    expect(existsSync(path)).toBe(true);
  });
});

describe("honesty gate — enabled art must be real (see AVATAR_ART_PRODUCTION_SPEC.md §8)", () => {
  const enabled = AVATARS.filter((a) => a.enabled);

  it("the gate has real work to do — every one of the 60 entries is enabled and therefore checked", () => {
    // This is the guard that keeps the file check below from ever quietly going vacuous again the
    // way it was while the manifest ran ahead of the art. If entries are legitimately disabled in
    // future, lower this number deliberately — never delete the assertion.
    expect(enabled).toHaveLength(60);
    expect(AVATARS.every((a) => a.enabled)).toBe(true);
  });

  it("every enabled avatar has BOTH its 256 and 512 webp files on disk, non-empty", () => {
    expect(enabled.length).toBeGreaterThan(0);
    for (const avatar of enabled) {
      for (const src of [avatar.src256, avatar.src512]) {
        const path = join(process.cwd(), "public", src);
        expect(existsSync(path), `enabled avatar ${avatar.id} is missing ${src}`).toBe(true);
        expect(statSync(path).size, `${src} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("every one of those files really decodes as a WebP at its declared size — not a 0-byte or renamed stand-in", () => {
    // Filename presence alone cannot tell finished art from a truncated write or a renamed board
    // crop. Reading the actual container header is what makes this gate mean something: 120 files,
    // each proven to be a WebP whose encoded canvas is exactly the size its filename claims.
    let checked = 0;
    for (const avatar of enabled) {
      for (const [size, src] of [[256, avatar.src256], [512, avatar.src512]] as const) {
        const path = join(process.cwd(), "public", src);
        const bytes = readFileSync(path);
        expect(bytes.length, `${src} is suspiciously small (${bytes.length} bytes)`).toBeGreaterThan(1000);
        const decoded = webpSize(bytes);
        expect(decoded, `${src} is not a decodable WebP`).not.toBeNull();
        expect(decoded, `${src} decodes at the wrong size`).toEqual({ width: size, height: size });
        checked++;
      }
    }
    expect(checked, "the two-files-per-avatar contract").toBe(enabled.length * 2);
    expect(checked).toBe(120);
  });

  it("the webp reader is not blind — it rejects the placeholder SVG and empty bytes", () => {
    // A checker that returns a size for anything would make the test above pass on garbage.
    expect(webpSize(readFileSync(join(process.cwd(), "public", AVATAR_PLACEHOLDER_SRC)))).toBeNull();
    expect(webpSize(Buffer.alloc(0))).toBeNull();
    expect(webpSize(Buffer.alloc(64))).toBeNull();
  });

  it("ships no avatar-shaped file that the manifest does not declare", () => {
    // The mirror of the check above: an orphan at /avatars/avatar-777-256.webp would be art with
    // no entry behind it — exactly the "dropped in under the expected filename" case §6 warns about.
    const dir = join(process.cwd(), "public", "avatars");
    const declared = new Set(AVATARS.flatMap((a) => [a.src256, a.src512].map((s) => s.split("/").pop()!)));
    const onDisk = readdirSync(dir).filter((n) => /^avatar-.*\.webp$/.test(n));
    expect(onDisk).toHaveLength(120);
    expect(onDisk.filter((n) => !declared.has(n))).toEqual([]);
  });
});
