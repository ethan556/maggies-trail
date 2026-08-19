import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const publicDir = join(root, "public");
const manifestPath = join(publicDir, "manifest.webmanifest");
const layoutPath = join(root, "src", "app", "layout.tsx");
const generatorPath = join(root, "scripts", "gen-brand-icons.mjs");

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
};

const expectedManifestIcons: readonly ManifestIcon[] = [
  { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
  { src: "/icons/favicon-16.png", sizes: "16x16", type: "image/png", purpose: "any" },
  { src: "/icons/favicon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
  { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

const expectedPngSizes = new Map([
  ["/icons/favicon-16.png", 16],
  ["/icons/favicon-32.png", 32],
  ["/apple-touch-icon.png", 180],
  ["/icons/icon-192.png", 192],
  ["/icons/icon-512.png", 512],
  ["/icons/icon-maskable-512.png", 512],
]);

function publicPath(url: string) {
  return join(publicDir, url.replace(/^\//, ""));
}

function pngSize(path: string) {
  const bytes = readFileSync(path);
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!bytes.subarray(0, 8).equals(magic) || bytes.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error(`${path} is not a PNG with an IHDR header`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function icoSizes(path: string) {
  const bytes = readFileSync(path);
  expect(bytes.readUInt16LE(0), "ICO reserved field").toBe(0);
  expect(bytes.readUInt16LE(2), "ICO type").toBe(1);
  const count = bytes.readUInt16LE(4);
  return Array.from({ length: count }, (_, index) => {
    const entry = 6 + index * 16;
    const width = bytes.readUInt8(entry) || 256;
    const height = bytes.readUInt8(entry + 1) || 256;
    const payloadLength = bytes.readUInt32LE(entry + 8);
    const offset = bytes.readUInt32LE(entry + 12);
    const payload = bytes.subarray(offset, offset + payloadLength);
    const actual = pngSizeFromBytes(payload);
    return { width, height, actual };
  });
}

function pngSizeFromBytes(bytes: Buffer) {
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!bytes.subarray(0, 8).equals(magic) || bytes.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("ICO entry is not a PNG payload with an IHDR header");
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe("S283 canonical app icon migration", () => {
  it("keeps the manifest's entire PWA icon graph pinned to canonical source and exact derivatives", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { icons?: ManifestIcon[] };
    expect(manifest.icons).toEqual(expectedManifestIcons);

    const canonicalMark = readFileSync(join(publicDir, "brand", "maggies-mark.svg"), "utf8");
    expect(readFileSync(join(publicDir, "icon.svg"), "utf8"), "root favicon SVG must be the approved mark verbatim").toBe(canonicalMark);

    for (const icon of expectedManifestIcons) {
      const path = publicPath(icon.src);
      expect(existsSync(path), `${icon.src} must resolve under public/`).toBe(true);
      if (icon.type === "image/png") {
        const size = expectedPngSizes.get(icon.src);
        if (!size) throw new Error(`missing expected PNG size for ${icon.src}`);
        expect(pngSize(path), icon.src).toEqual({ width: size, height: size });
      }
    }
  });

  it("keeps browser, Apple, and PWA metadata as the exact declared subset of that graph", () => {
    const layout = readFileSync(layoutPath, "utf8");
    const iconBlock = layout.slice(layout.indexOf("icons: {"), layout.indexOf("openGraph:"));
    expect(iconBlock, "layout must retain a dedicated static icons block").toContain("icon: [");
    expect([...iconBlock.matchAll(/url: "([^"]+)"/g)].map((match) => match[1])).toEqual([
      "/icon.svg",
      "/icons/favicon-32.png",
      "/icons/favicon-16.png",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/apple-touch-icon.png",
      "/favicon.ico",
    ]);
    expect(iconBlock).toContain('{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }');
    expect(iconBlock).toContain('{ url: "/favicon.ico", sizes: "any" }');
    expect(iconBlock).not.toContain("icon-maskable-512");
    expect(layout).toContain('manifest: "/manifest.webmanifest"');

    const ico = icoSizes(join(publicDir, "favicon.ico"));
    expect(ico.map(({ width, height }) => `${width}x${height}`)).toEqual(["16x16", "32x32", "48x48"]);
    for (const entry of ico) expect(entry.actual).toEqual({ width: entry.width, height: entry.height });
  });

  it("keeps Open Graph and Twitter on one 1200×630 card generated from the approved mark", () => {
    const layout = readFileSync(layoutPath, "utf8");
    const generator = readFileSync(generatorPath, "utf8");
    expect(layout).toMatch(/const OG_IMAGE = \{\s*url: "\/brand\/maggies-og\.png",\s*width: 1200,\s*height: 630,/);
    expect((layout.match(/images: \[OG_IMAGE\]/g) ?? [])).toHaveLength(2);
    expect(pngSize(join(publicDir, "brand", "maggies-og.png"))).toEqual({ width: 1200, height: 630 });
    expect(generator).toContain('const OUT_PATH = join(root, "public", "brand", "maggies-og.png");');
    expect(generator).toContain('markSvg: readBrandSvg("maggies-mark.svg")');
  });

  it("passes the read-only approved-mark derivative verifier", () => {
    const output = execFileSync(process.execPath, [generatorPath, "--check"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    expect(output).toContain("brand icons: all derivatives present, correctly sized, and rendering the approved mark");
  });
});
