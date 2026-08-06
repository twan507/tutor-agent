import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import * as fontkit from "fontkit";
import { flightPathEl, sparkEl } from "./motifs.mjs";

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

function layoutText(font, text, fontSize, letterSpacing = 0) {
  const scale = fontSize / font.unitsPerEm;
  const run = font.layout(text);
  const glyphs = [];
  let x = 0;
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const p = run.positions[i];
    glyphs.push({ d: g.path.toSVG(), tx: x + p.xOffset * scale, ty: p.yOffset * scale });
    x += p.xAdvance * scale + (i < run.glyphs.length - 1 ? letterSpacing : 0);
  }
  return { glyphs, width: x, scale, capHeight: (font.capHeight || 700) * scale };
}

const phuduFile = fontkit.openSync(path.join(__dirname, "fonts/Phudu-wght.ttf"));
const phudu = phuduFile.getVariation ? phuduFile.getVariation({ wght: 700 }) : phuduFile;
const bvp = fontkit.openSync(path.join(__dirname, "fonts/BeVietnamPro-Medium.ttf"));

const wm = layoutText(phudu, "RANG", FS, R.ls);
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${totalH.toFixed(2)}" role="img" aria-label="Rangi"><title>Rangi</title>${halo}<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.dotR}" fill="${c.dot}"/><rect x="${I.stemX.toFixed(2)}" y="${I.stemY.toFixed(2)}" width="${I.stemW.toFixed(2)}" height="${I.stemH.toFixed(2)}" rx="${I.rx.toFixed(2)}" fill="${c.text}"/>${glyphEls(wm.glyphs, wm.scale, c.text, baseline)}</svg>`;
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

const SLOGANS = {
  vn: "Hoàn thiện hơn mỗi ngày",
  en: "A little brighter every day",
};

// The slogan is justified to the wordmark's INK width — left edge of R to the
// right edge of the I stem (the halo is a glow that may spill past it). Instead
// of widening the lockup viewBox when a slogan runs long, the type is rescaled
// to land exactly on that width: advances scale linearly with font size, so
// laying out once at a reference size and dividing gives the exact size.
const INK_LEFT = padX;
const INK_W = iStemX + R.stemW - padX;

function fitSlogan(text) {
  const refFS = 0.22 * FS;
  // Letter-spacing scales with font size (0.033em), NOT the fixed wordmark
  // tracking R.ls (=3.3, tuned for FS=100).
  const ref = layoutText(bvp, text, refFS, 0.033 * refFS);
  const fs = (refFS * INK_W) / ref.width;
  return layoutText(bvp, text, fs, 0.033 * fs);
}

function sloganEls(sl, baselineY, color) {
  return sl.glyphs
    .map(
      (g) =>
        `<g transform="translate(${(INK_LEFT + g.tx).toFixed(2)} ${(baselineY + g.ty).toFixed(2)}) scale(${sl.scale.toFixed(6)} ${-sl.scale.toFixed(6)})"><path d="${g.d}" fill="${color}"/></g>`,
    )
    .join("");
}

function wordmarkBody(theme) {
  return wordmarkSVG(theme)
    .replace(/^<svg[^>]*><title>Rangi<\/title>/, "")
    .replace("</svg>", "");
}

// Guard against regressions: a fitted slogan must never leave the viewBox.
function assertFits(name, sl, boxW) {
  const left = INK_LEFT + (sl.glyphs[0]?.tx ?? 0);
  const right = INK_LEFT + sl.width;
  const EPS = 0.01;
  if (left < -EPS || right > boxW + EPS) {
    throw new Error(
      `${name}: slogan outside viewBox [0, ${boxW.toFixed(2)}] — ` +
        `left=${left.toFixed(2)} right=${right.toFixed(2)}`,
    );
  }
}

function lockupSVG(theme, lang) {
  const color = theme === "dark" ? "#84DEBE" : "#0E7A5A";
  const sl = fitSlogan(SLOGANS[lang]);
  const slY = totalH + 0.13 * FS;
  const lockupH = slY + 0.12 * FS;
  assertFits(`lockupSVG(${theme},${lang})`, sl, totalW);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${lockupH.toFixed(2)}" role="img" aria-label="Rangi — ${SLOGANS[lang]}"><title>Rangi</title>${wordmarkBody(theme)}${sloganEls(sl, slY, color)}</svg>`;
}

// One OG image per language — a bilingual site points og:image at the file
// matching the page's locale, so the two never share a frame.
function ogSVG(lang) {
  const sl = fitSlogan(SLOGANS[lang]);
  const slY = totalH + 0.13 * FS;
  const blockH = slY + 0.12 * FS;
  assertFits(`ogSVG(${lang})`, sl, totalW);
  const block = `${wordmarkBody("dark")}${sloganEls(sl, slY, "#84DEBE")}`;
  const s = 640 / totalW;
  const x = (1200 - totalW * s) / 2;
  const y = (630 - blockH * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="Rangi — ${SLOGANS[lang]}"><title>Rangi</title><rect width="1200" height="630" fill="#0A2E26"/><g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(4)})">${block}</g></svg>`;
}

for (const t of Object.keys(COLORS))
  fs.writeFileSync(path.join(OUT_SVG, `rangi-wordmark-${t}.svg`), wordmarkSVG(t));
for (const t of Object.keys(ICON))
  fs.writeFileSync(path.join(OUT_SVG, `rangi-icon-${t}.svg`), iconSVG(t));
for (const t of ["dark", "light"]) {
  fs.writeFileSync(path.join(OUT_SVG, `rangi-lockup-slogan-${t}.svg`), lockupSVG(t, "vn"));
  fs.writeFileSync(path.join(OUT_SVG, `rangi-lockup-slogan-en-${t}.svg`), lockupSVG(t, "en"));
}
fs.writeFileSync(path.join(OUT_SVG, "favicon.svg"), iconSVG("dark"));
fs.writeFileSync(path.join(OUT_SVG, "og-image.svg"), ogSVG("vn"));
fs.writeFileSync(path.join(OUT_SVG, "og-image-en.svg"), ogSVG("en"));

const ts = `// GENERATED by scripts/brand/generate-logo.mjs — DO NOT EDIT BY HAND
export interface GlyphPath { d: string; tx: number; ty: number }
export const WORDMARK = ${JSON.stringify({ fs: FS, width: +totalW.toFixed(2), height: +totalH.toFixed(2), baseline: +baseline.toFixed(2), capHeight: +wm.capHeight.toFixed(2), padX: +padX.toFixed(2), glyphScale: +wm.scale.toFixed(6), glyphs: wm.glyphs.map((g) => ({ d: g.d, tx: +g.tx.toFixed(2), ty: +g.ty.toFixed(2) })), i: Object.fromEntries(Object.entries(I).map(([k, v]) => [k, +v.toFixed(2)])) }, null, 2)} as const;
`;
fs.writeFileSync(OUT_TS, ts);
execSync(`pnpm exec prettier --write "${OUT_TS}"`, { cwd: FE, stdio: "inherit" });
// ---- Flight-path motif assets (sổ tay thương hiệu §3.3) ----
const fpHorizontal =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" role="img" aria-label="Rangi flight path">` +
  flightPathEl({ from: [8, 44], to: [392, 20], curve: 34, id: "flight-path" }) +
  `</svg>`;
const fpToDot =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" role="img" aria-label="Rangi flight path to spark">` +
  flightPathEl({ from: [8, 96], to: [348, 52], curve: 56, id: "flight-path" }) +
  sparkEl({ cx: 360, cy: 52, r: 7, haloR: 16, haloOp: 0.22 }) +
  `</svg>`;
fs.writeFileSync(path.join(OUT_SVG, "flight-path-horizontal.svg"), fpHorizontal);
fs.writeFileSync(path.join(OUT_SVG, "flight-path-to-dot.svg"), fpToDot);

// ---- Background patterns: sparse sparks + one flight path, seamless tile 240 ----
function patternSVG(mode) {
  const spark = mode === "dark" ? "#F5A623" : "#EF8D08";
  const sparkOp = mode === "dark" ? 0.5 : 0.4;
  const strokeOp = mode === "dark" ? 0.28 : 0.22;
  const sparks = [
    [40, 64, 3],
    [150, 186, 2.2],
    [214, 38, 2.6],
  ]
    .map(
      ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${spark}" opacity="${sparkOp}"/>`,
    )
    .join("");
  const fp = flightPathEl({
    from: [-20, 210],
    to: [260, 150],
    curve: 46,
    stroke: spark,
    width: 1.5,
    dash: "1 8",
  });
  const fpBand = `<g opacity="${strokeOp}">${fp}<g transform="translate(-240 0)">${fp}</g><g transform="translate(240 0)">${fp}</g></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Rangi pattern">${fpBand}${sparks}</svg>`;
}
fs.writeFileSync(path.join(OUT_SVG, "pattern-light.svg"), patternSVG("light"));
fs.writeFileSync(path.join(OUT_SVG, "pattern-dark.svg"), patternSVG("dark"));

console.log("generated:", fs.readdirSync(OUT_SVG).join(", "));
