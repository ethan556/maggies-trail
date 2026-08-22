#!/usr/bin/env node

/** Build exact-glyph, non-shipping premium math-symbol candidates and 80/48/32 review sheets. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "reports", "avatar-candidates", "s244-math-symbols");
const pack = JSON.parse(await readFile(path.join(root, "avatar-math-symbol-prompts.json"), "utf8"));
const ivory = "#F7F3EC";
const navy = "#0D1B2A";
const orange = "#F08A24";

const escapeXml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function symbolFontSize(symbol) {
  if (symbol.length >= 5) return 190;
  if (symbol.length >= 4) return 210;
  if (symbol.length >= 3) return 240;
  return 390;
}

function motifSvg(item) {
  const common = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (item.id) {
    case "avatar-501":
      return `<path d="M346 520 A166 166 0 1 1 678 520" ${common} stroke="${orange}" stroke-width="17" opacity=".72"/>`;
    case "avatar-502":
      return `<path d="M338 656 L434 560 M338 656 L470 656 M380 656 A42 42 0 0 1 410 626" ${common} stroke="${orange}" stroke-width="16" opacity=".72"/>`;
    case "avatar-503":
      return `<path d="M306 690 C394 642 427 706 512 660 S642 614 718 650" ${common} stroke="${orange}" stroke-width="18" opacity=".72"/>`;
    case "avatar-504":
      return `<path d="M342 680 L512 618 L682 680" ${common} stroke="${orange}" stroke-width="13" opacity=".68"/><circle cx="342" cy="680" r="16" fill="${orange}"/><circle cx="512" cy="618" r="16" fill="${orange}"/><circle cx="682" cy="680" r="16" fill="${orange}"/>`;
    case "avatar-505":
      return `<rect x="620" y="604" width="92" height="92" rx="13" fill="none" stroke="${orange}" stroke-width="16" opacity=".74"/>`;
    case "avatar-506":
      return `<circle cx="335" cy="676" r="18" fill="#FFFDF7"/><path d="M365 676 C448 676 493 618 598 618" ${common} stroke="${orange}" stroke-width="17" opacity=".82"/><path d="M572 592 L606 618 L572 644" ${common} stroke="${orange}" stroke-width="17"/><circle cx="650" cy="618" r="25" fill="${orange}"/>`;
    case "avatar-507":
      return `<path d="M326 648 C410 588 482 716 574 644 S676 582 714 602" ${common} stroke="${orange}" stroke-width="14" opacity=".7"/><path d="M692 580 L722 599 L694 622" ${common} stroke="${orange}" stroke-width="14"/>`;
    case "avatar-508":
      return `<path d="M310 668 H448 M576 668 H714" ${common} stroke="${orange}" stroke-width="15" opacity=".68"/>`;
    case "avatar-509":
      return `<path d="M304 666 C370 618 424 714 490 666 M534 666 C600 618 654 714 720 666" ${common} stroke="${orange}" stroke-width="15" opacity=".7"/>`;
    case "avatar-510":
      return `<path d="M314 684 C414 670 474 626 548 548 C608 486 650 470 716 478" ${common} stroke="${orange}" stroke-width="17" opacity=".72"/><path d="M564 610 L612 562" ${common} stroke="#FFFDF7" stroke-width="13" opacity=".78"/>`;
    case "avatar-511":
      return `<path d="M302 688 C382 686 424 658 474 596 C536 518 596 474 716 460" ${common} stroke="${orange}" stroke-width="20" opacity=".88"/><circle cx="302" cy="688" r="13" fill="${orange}"/><circle cx="716" cy="460" r="13" fill="${orange}"/>`;
    case "avatar-512":
      return `<circle cx="680" cy="514" r="25" fill="${orange}"/><path d="M314 628 C410 622 470 590 548 540" ${common} stroke="#FFFDF7" stroke-width="16" stroke-dasharray="4 29" opacity=".8"/><path d="M548 540 C590 520 620 514 642 514" ${common} stroke="${orange}" stroke-width="17" opacity=".9"/><path d="M616 488 L650 514 L616 540" ${common} stroke="${orange}" stroke-width="17"/>`;
    default:
      return "";
  }
}

function candidateSvg(item) {
  const fontSize = symbolFontSize(item.symbol);
  return Buffer.from(`
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="field" cx="36%" cy="26%" r="76%">
          <stop offset="0" stop-color="#28455F"/>
          <stop offset="0.46" stop-color="#102A43"/>
          <stop offset="1" stop-color="#071421"/>
        </radialGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFF8EA"/>
          <stop offset="0.42" stop-color="#F3D4A5"/>
          <stop offset="0.72" stop-color="#F08A24"/>
          <stop offset="1" stop-color="#7A3511"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#071421" flood-opacity="0.32"/>
        </filter>
        <radialGradient id="glaze" cx="34%" cy="22%" r="80%">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"/>
          <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset="1" stop-color="#F08A24" stop-opacity="0.08"/>
        </radialGradient>
      </defs>
      <rect width="1024" height="1024" fill="${ivory}"/>
      <circle cx="512" cy="505" r="350" fill="url(#rim)" filter="url(#shadow)"/>
      <circle cx="512" cy="505" r="326" fill="url(#field)"/>
      <circle cx="512" cy="505" r="326" fill="url(#glaze)"/>
      <path d="M292 360 C390 230 633 214 744 353" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="22" stroke-linecap="round"/>
      <path d="M318 706 C425 790 625 802 714 700" fill="none" stroke="${orange}" stroke-opacity="0.52" stroke-width="14" stroke-linecap="round"/>
      <circle cx="733" cy="314" r="15" fill="${orange}"/>
      ${motifSvg(item)}
      <text x="512" y="545" text-anchor="middle" dominant-baseline="middle"
        font-family="KaTeX_Main, STIX Two Math, Cambria Math, Times New Roman, serif"
        font-size="${fontSize}" font-weight="700" fill="#FFFDF7"
        stroke="${navy}" stroke-width="4" paint-order="stroke fill">${escapeXml(item.symbol)}</text>
    </svg>`);
}

async function sheet(size, records) {
  const columns = 6;
  const rows = 2;
  const gap = Math.max(8, Math.round(size * 0.18));
  const labelHeight = Math.max(18, Math.round(size * 0.32));
  const width = 2 * gap + columns * size + (columns - 1) * gap;
  const height = 2 * gap + rows * (size + labelHeight) + (rows - 1) * gap;
  const composites = [];
  for (const [index, record] of records.entries()) {
    const left = gap + (index % columns) * (size + gap);
    const top = gap + Math.floor(index / columns) * (size + labelHeight + gap);
    composites.push({ input: path.join(outputDir, `${record.id}-${size}.png`), left, top });
    composites.push({
      input: Buffer.from(`<svg width="${size}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${navy}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="${Math.max(8, Math.round(size * 0.16))}" font-weight="700" fill="${ivory}">${record.id.slice(-3)}</text></svg>`),
      left,
      top: top + size
    });
  }
  await sharp({ create: { width, height, channels: 4, background: ivory } })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, `s244-math-symbol-contact-sheet-${size}.png`));
}

await mkdir(outputDir, { recursive: true });
const records = [];
for (const item of pack.avatars) {
  const master = await sharp(candidateSvg(item)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(outputDir, `${item.id}-master.png`), master);
  const hashes = { master: createHash("sha256").update(master).digest("hex") };
  for (const size of [32, 48, 80, 256, 512]) {
    const png = await sharp(master).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();
    await writeFile(path.join(outputDir, `${item.id}-${size}.png`), png);
    hashes[String(size)] = createHash("sha256").update(png).digest("hex");
  }
  records.push({ ...item, hashes, status: "PENDING_INDEPENDENT_REVIEW" });
}
for (const size of [32, 48, 80]) await sheet(size, records);
await writeFile(
  path.join(outputDir, "candidate-manifest.json"),
  `${JSON.stringify({ version: "1.0", releaseEligible: false, records }, null, 2)}\n`,
  "utf8"
);
console.log(`Built ${records.length} quarantined math-symbol candidates in ${outputDir}`);
