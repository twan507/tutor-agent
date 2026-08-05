import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FE = path.resolve(__dirname, "../..");
const OUT_SVG = path.join(FE, "public/brand");
const OUT_TS = path.join(FE, "src/components/brand/logo-paths.ts");
fs.mkdirSync(OUT_SVG, { recursive: true });
fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });

const FS = 100;
const R = {
  ls: 0.033 * FS,
  stemH: 0.417 * FS,
  stemW: 0.167 * FS,
  stemRx: 0.033 * FS,
  dotR: 0.125 * FS,
  dotCyUp: 0.608 * FS,
  haloR: 0.225 * FS,
  gap: 0.092 * FS,
};
const COLORS = {
  dark: { text: "#FBF6EA", dot: "#F5A623", halo: "#F5A623", haloOp: 0.2 },
  light: { text: "#0A2E26", dot: "#EF8D08", halo: "#F5A623", haloOp: 0.28 },
  "mono-white": { text: "#FFFFFF", dot: "#FFFFFF", halo: null, haloOp: 0 },
  "mono-black": { text: "#0B0B0B", dot: "#0B0B0B", halo: null, haloOp: 0 },
};

function layoutText(font, text, fontSize) {
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(text);
  const glyphs = [];
  let x = 0;
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const p = run.positions[i];
    glyphs.push({ d: g.path.toSVG(), tx: x + p.xOffset * scale, ty: p.yOffset * scale });
    x += p.xAdvance * scale + (i < run.glyphs.length - 1 ? R.ls : 0);
  }
  return { glyphs, width: x, scale, capHeight: (font.capHeight || 700) * scale };
}

const phuduFile = fontkit.openSync(path.join(__dirname, "fonts/Phudu-wght.ttf"));
const phudu = phuduFile.getVariation ? phuduFile.getVariation({ wght: 700 }) : phuduFile;
const bvp = fontkit.openSync(path.join(__dirname, "fonts/BeVietnamPro-Medium.ttf"));

const wm = layoutText(phudu, "RANG", FS);
// padTop 0.16*FS (not 0.10*FS): with capHeight≈0.70*FS, dotCyUp=0.608*FS and
// haloR=0.225*FS, the halo's top edge sits at padTop - 13.3 units from the
// canvas top — 0.10*FS clipped it (-3.3). 0.16*FS keeps >=1 unit of clearance
// (padTop=16 -> halo top = 2.7) without touching any glyph/dot/halo ratio.
const padX = 0.14 * FS,
  padTop = 0.16 * FS,
  padBot = 0.1 * FS;
const baseline = padTop + wm.capHeight;
const iStemX = padX + wm.width + R.gap;
const dotCx = iStemX + R.stemW / 2;
const totalW = iStemX + Math.max(R.stemW, R.haloR * 2 - R.stemW / 2) + padX;
const totalH = baseline + padBot;
const I = {
  stemX: iStemX,
  stemY: baseline - R.stemH,
  stemW: R.stemW,
  stemH: R.stemH,
  rx: R.stemRx,
  dotCx,
  dotCy: baseline - R.dotCyUp,
  dotR: R.dotR,
  haloR: R.haloR,
};

function glyphEls(glyphs, scale, color, baselineY) {
  return glyphs
    .map(
      (g) =>
        `<g transform="translate(${(padX + g.tx).toFixed(2)} ${(baselineY + g.ty).toFixed(2)}) scale(${scale.toFixed(6)} ${-scale.toFixed(6)})"><path d="${g.d}" fill="${color}"/></g>`,
    )
    .join("");
}

function wordmarkSVG(theme) {
  const c = COLORS[theme];
  const halo = c.halo
    ? `<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.haloR}" fill="${c.halo}" opacity="${c.haloOp}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${totalH.toFixed(2)}" role="img" aria-label="Rangi"><title>Rangi</title>${halo}<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.dotR}" fill="${c.dot}"/><rect x="${I.stemX.toFixed(2)}" y="${I.stemY.toFixed(2)}" width="${I.stemW}" height="${I.stemH}" rx="${I.rx}" fill="${c.text}"/>${glyphEls(wm.glyphs, wm.scale, c.text, baseline)}</svg>`;
}

const ICON = {
  dark: { bg: "#0A2E26", stem: "#FBF6EA", dot: "#F5A623", haloOp: 0.25 },
  light: { bg: "#FBF6EA", stem: "#0A2E26", dot: "#EF8D08", haloOp: 0.3 },
  "mono-white": { bg: null, stem: "#FFFFFF", dot: "#FFFFFF", haloOp: 0 },
  "mono-black": { bg: null, stem: "#0B0B0B", dot: "#0B0B0B", haloOp: 0 },
};
function iconSVG(theme) {
  const c = ICON[theme];
  const bg = c.bg ? `<rect width="48" height="48" rx="11" fill="${c.bg}"/>` : "";
  const halo = c.haloOp
    ? `<circle cx="24" cy="21" r="9" fill="#F5A623" opacity="${c.haloOp}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Rangi icon"><title>Rangi</title>${bg}${halo}<circle cx="24" cy="21" r="5" fill="${c.dot}"/><rect x="20.7" y="30" width="6.6" height="9" rx="3.3" fill="${c.stem}"/></svg>`;
}

function lockupSVG(theme) {
  const sloganColor = theme === "dark" ? "#9FE1CB" : "#0E7A5A";
  const sl = layoutText(bvp, "Giỏi hơn chính mình hôm qua", 0.22 * FS);
  const slY = totalH + 0.16 * FS;
  const slPad = padX + (totalW - 2 * padX - sl.width) / 2;
  const slogan = sl.glyphs
    .map(
      (g) =>
        `<g transform="translate(${(slPad + g.tx).toFixed(2)} ${(slY + g.ty).toFixed(2)}) scale(${sl.scale.toFixed(6)} ${-sl.scale.toFixed(6)})"><path d="${g.d}" fill="${sloganColor}"/></g>`,
    )
    .join("");
  const body = wordmarkSVG(theme)
    .replace(/^<svg[^>]*><title>Rangi<\/title>/, "")
    .replace("</svg>", "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${(slY + 0.12 * FS).toFixed(2)}" role="img" aria-label="Rangi — Giỏi hơn chính mình hôm qua"><title>Rangi</title>${body}${slogan}</svg>`;
}

function ogSVG() {
  const lock = lockupSVG("dark")
    .replace(/^<svg[^>]*><title>Rangi<\/title>/, "")
    .replace("</svg>", "");
  const s = 560 / totalW;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0A2E26"/><g transform="translate(${(600 - 280).toFixed(0)} ${(315 - (totalH * s) / 2 - 20).toFixed(0)}) scale(${s.toFixed(4)})">${lock}</g></svg>`;
}

for (const t of Object.keys(COLORS))
  fs.writeFileSync(path.join(OUT_SVG, `rangi-wordmark-${t}.svg`), wordmarkSVG(t));
for (const t of Object.keys(ICON))
  fs.writeFileSync(path.join(OUT_SVG, `rangi-icon-${t}.svg`), iconSVG(t));
for (const t of ["dark", "light"])
  fs.writeFileSync(path.join(OUT_SVG, `rangi-lockup-slogan-${t}.svg`), lockupSVG(t));
fs.writeFileSync(path.join(OUT_SVG, "favicon.svg"), iconSVG("dark"));
fs.writeFileSync(path.join(OUT_SVG, "og-image.svg"), ogSVG());

const ts = `// GENERATED by scripts/brand/generate-logo.mjs — DO NOT EDIT BY HAND
export interface GlyphPath { d: string; tx: number; ty: number }
export const WORDMARK = ${JSON.stringify({ fs: FS, width: +totalW.toFixed(2), height: +totalH.toFixed(2), baseline: +baseline.toFixed(2), capHeight: +wm.capHeight.toFixed(2), padX, glyphScale: +wm.scale.toFixed(6), glyphs: wm.glyphs.map((g) => ({ d: g.d, tx: +g.tx.toFixed(2), ty: +g.ty.toFixed(2) })), i: Object.fromEntries(Object.entries(I).map(([k, v]) => [k, +v.toFixed(2)])) }, null, 2)} as const;
`;
fs.writeFileSync(OUT_TS, ts);
console.log("generated:", fs.readdirSync(OUT_SVG).join(", "));
