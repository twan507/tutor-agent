# Gói logo Rangi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sinh trọn gói logo SVG Rangi bằng code (generator từ font → path), component React animation, xuất PNG — theo spec `docs/specs/2026-08-05-goi-logo-rangi.md`.

**Architecture:** Generator Node (fontkit) là nguồn gốc duy nhất → sinh SVG tĩnh + `logo-paths.ts`; component `<RangiLogo/>` render từ paths với CSS animation; script sharp xuất PNG. Tất cả trong `frontend/`.

**Tech Stack:** fontkit, sharp (devDeps), React 19, Vitest + RTL, CSS modules.

## Global Constraints

- Làm trên nhánh **`feat/brand-logo`** (tạo từ main ngay đầu Task 1); KHÔNG commit thẳng main; KHÔNG push nhánh cho tới Task 4 (push cả nhánh 1 lần trước merge)
- Thông số wordmark KHÓA (em theo font-size FS): letter-spacing 0.033 · thân I cao 0.417, rộng 0.167, rx 0.033 · chấm r 0.125, tâm cách baseline 0.608 · quầng r 0.225 · khe G→I 0.092
- Màu: dark chữ #FBF6EA / chấm #F5A623 / quầng op .20; light chữ #0A2E26 / chấm #EF8D08 / quầng #F5A623 op .28; mono-white #FFFFFF; mono-black #0B0B0B
- Icon 48×48 theo demo đã duyệt: bg rx 11 (#0A2E26 dark / #FBF6EA light / trong suốt mono); dot cx24 cy21 r5; halo r9 op .25 (dark) /.3 (light); stem x20.7 y30 w6.6 h9 rx3.3 (màu chữ theo theme)
- CẤM SVG filter (feGaussianBlur); quầng = lớp circle + opacity
- Máy Windows: chạy lệnh qua Git Bash; pnpm có trên PATH; cwd các lệnh frontend là `frontend/`
- Commit mỗi task, Conventional Commits, message đúng plan

---

### Task 1: Fonts + generator → SVG tĩnh + logo-paths.ts

**Files:**
- Create: `frontend/scripts/brand/generate-logo.mjs`, `frontend/scripts/brand/fonts/` (2 TTF + 2 OFL.txt tải về), sinh ra: `frontend/src/components/brand/logo-paths.ts`, `frontend/public/brand/*.svg` (11 file)
- Modify: `frontend/package.json` (devDeps + script `brand:generate`)

**Interfaces:**
- Produces: `logo-paths.ts` export `WORDMARK` `{ fs:100, width, height, baseline, capHeight, glyphs: {d,tx,ty}[], i: {stemX,stemY,stemW,stemH,rx,dotCx,dotCy,dotR,haloR} }` — Task 2 render từ đây. SVG files theo tên trong spec.

- [ ] **Step 1: Tạo nhánh + cài deps + tải fonts**

```bash
git checkout -b feat/brand-logo
cd frontend && pnpm add -D fontkit@^2 sharp@^0.33
mkdir -p scripts/brand/fonts
curl -L -o scripts/brand/fonts/Phudu-wght.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/phudu/Phudu%5Bwght%5D.ttf"
curl -L -o scripts/brand/fonts/OFL-Phudu.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/phudu/OFL.txt"
curl -L -o scripts/brand/fonts/BeVietnamPro-Medium.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/BeVietnamPro-Medium.ttf"
curl -L -o scripts/brand/fonts/OFL-BeVietnamPro.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/OFL.txt"
```
Expected: 2 file .ttf > 50KB. Nếu URL 404 (repo google/fonts đổi cấu trúc): tìm đường dẫn đúng trong repo đó (`ofl/phudu/`, `ofl/bevietnampro/`), ghi chú deviation.

- [ ] **Step 2: Viết generator**

`frontend/scripts/brand/generate-logo.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fontkit from "fontkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FE = path.resolve(__dirname, "../..");
const OUT_SVG = path.join(FE, "public/brand");
const OUT_TS = path.join(FE, "src/components/brand/logo-paths.ts");
fs.mkdirSync(OUT_SVG, { recursive: true });
fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });

const FS = 100;
const R = {
  ls: 0.033 * FS, stemH: 0.417 * FS, stemW: 0.167 * FS, stemRx: 0.033 * FS,
  dotR: 0.125 * FS, dotCyUp: 0.608 * FS, haloR: 0.225 * FS, gap: 0.092 * FS,
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
const padX = 0.14 * FS, padTop = 0.10 * FS, padBot = 0.10 * FS;
const baseline = padTop + wm.capHeight;
const iStemX = padX + wm.width + R.gap;
const dotCx = iStemX + R.stemW / 2;
const totalW = iStemX + Math.max(R.stemW, R.haloR * 2 - R.stemW / 2) + padX;
const totalH = baseline + padBot;
const I = {
  stemX: iStemX, stemY: baseline - R.stemH, stemW: R.stemW, stemH: R.stemH,
  rx: R.stemRx, dotCx, dotCy: baseline - R.dotCyUp, dotR: R.dotR, haloR: R.haloR,
};

function glyphEls(glyphs, scale, color, baselineY) {
  return glyphs.map(g =>
    `<g transform="translate(${(padX + g.tx).toFixed(2)} ${(baselineY + g.ty).toFixed(2)}) scale(${scale.toFixed(6)} ${-scale.toFixed(6)})"><path d="${g.d}" fill="${color}"/></g>`
  ).join("");
}

function wordmarkSVG(theme) {
  const c = COLORS[theme];
  const halo = c.halo ? `<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.haloR}" fill="${c.halo}" opacity="${c.haloOp}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${totalH.toFixed(2)}" role="img" aria-label="Rangi"><title>Rangi</title>${halo}<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.dotR}" fill="${c.dot}"/><rect x="${I.stemX.toFixed(2)}" y="${I.stemY.toFixed(2)}" width="${I.stemW}" height="${I.stemH}" rx="${I.rx}" fill="${c.text}"/>${glyphEls(wm.glyphs, wm.scale, c.text, baseline)}</svg>`;
}

const ICON = { dark: { bg: "#0A2E26", stem: "#FBF6EA", dot: "#F5A623", haloOp: 0.25 }, light: { bg: "#FBF6EA", stem: "#0A2E26", dot: "#EF8D08", haloOp: 0.3 }, "mono-white": { bg: null, stem: "#FFFFFF", dot: "#FFFFFF", haloOp: 0 }, "mono-black": { bg: null, stem: "#0B0B0B", dot: "#0B0B0B", haloOp: 0 } };
function iconSVG(theme) {
  const c = ICON[theme];
  const bg = c.bg ? `<rect width="48" height="48" rx="11" fill="${c.bg}"/>` : "";
  const halo = c.haloOp ? `<circle cx="24" cy="21" r="9" fill="#F5A623" opacity="${c.haloOp}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Rangi icon"><title>Rangi</title>${bg}${halo}<circle cx="24" cy="21" r="5" fill="${c.dot}"/><rect x="20.7" y="30" width="6.6" height="9" rx="3.3" fill="${c.stem}"/></svg>`;
}

function lockupSVG(theme) {
  const c = COLORS[theme];
  const sloganColor = theme === "dark" ? "#9FE1CB" : "#0E7A5A";
  const sl = layoutText(bvp, "Giỏi hơn chính mình hôm qua", 0.22 * FS);
  const slY = totalH + 0.16 * FS;
  const slPad = padX + (totalW - 2 * padX - sl.width) / 2;
  const slogan = sl.glyphs.map(g =>
    `<g transform="translate(${(slPad + g.tx).toFixed(2)} ${(slY + g.ty).toFixed(2)}) scale(${sl.scale.toFixed(6)} ${-sl.scale.toFixed(6)})"><path d="${g.d}" fill="${sloganColor}"/></g>`
  ).join("");
  const body = wordmarkSVG(theme).replace(/^<svg[^>]*><title>Rangi<\/title>/, "").replace("</svg>", "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${(slY + 0.12 * FS).toFixed(2)}" role="img" aria-label="Rangi — Giỏi hơn chính mình hôm qua"><title>Rangi</title>${body}${slogan}</svg>`;
}

function ogSVG() {
  const lock = lockupSVG("dark").replace(/^<svg[^>]*><title>Rangi<\/title>/, "").replace("</svg>", "");
  const s = 560 / totalW;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0A2E26"/><g transform="translate(${(600 - 280).toFixed(0)} ${(315 - (totalH * s) / 2 - 20).toFixed(0)}) scale(${s.toFixed(4)})">${lock}</g></svg>`;
}

for (const t of Object.keys(COLORS)) fs.writeFileSync(path.join(OUT_SVG, `rangi-wordmark-${t}.svg`), wordmarkSVG(t));
for (const t of Object.keys(ICON)) fs.writeFileSync(path.join(OUT_SVG, `rangi-icon-${t}.svg`), iconSVG(t));
for (const t of ["dark", "light"]) fs.writeFileSync(path.join(OUT_SVG, `rangi-lockup-slogan-${t}.svg`), lockupSVG(t));
fs.writeFileSync(path.join(OUT_SVG, "favicon.svg"), iconSVG("dark"));
fs.writeFileSync(path.join(OUT_SVG, "og-image.svg"), ogSVG());

const ts = `// GENERATED by scripts/brand/generate-logo.mjs — DO NOT EDIT BY HAND
export interface GlyphPath { d: string; tx: number; ty: number }
export const WORDMARK = ${JSON.stringify({ fs: FS, width: +totalW.toFixed(2), height: +totalH.toFixed(2), baseline: +baseline.toFixed(2), capHeight: +wm.capHeight.toFixed(2), padX, glyphScale: +wm.scale.toFixed(6), glyphs: wm.glyphs.map(g => ({ d: g.d, tx: +g.tx.toFixed(2), ty: +g.ty.toFixed(2) })), i: Object.fromEntries(Object.entries(I).map(([k, v]) => [k, +v.toFixed(2)])) }, null, 2)} as const;
`;
fs.writeFileSync(OUT_TS, ts);
console.log("generated:", fs.readdirSync(OUT_SVG).join(", "));
```

Thêm vào `frontend/package.json` scripts: `"brand:generate": "node scripts/brand/generate-logo.mjs"`.

LƯU Ý fontkit: nếu `getVariation`/`layout`/`path.toSVG` khác API thực tế của version cài được → điều chỉnh cách gọi trong phạm vi script (giữ nguyên output contract), ghi deviation vào report. Nếu chữ bị lộn ngược/lệch baseline khi mở SVG: kiểm tra chiều scale âm và ty.

- [ ] **Step 3: Chạy + verify trực quan và deterministic**

```bash
cd frontend && pnpm brand:generate && pnpm brand:generate && git status --short
```
Expected: 11 SVG + logo-paths.ts; chạy lần 2 không đổi diff (deterministic). Mở `rangi-wordmark-dark.svg` bằng browser tool xác nhận: chữ RANG đúng PhuDu đậm, chấm ngang đỉnh chữ, khe G→I hợp lý (đối chiếu ảnh chốt của người dùng — screenshot lưu trong hội thoại; tiêu chí: khối chữ phẳng đầu, I ngắn, chấm+quầng trong cap-height).

- [ ] **Step 4: Lint + commit**

```bash
cd frontend && pnpm lint && pnpm format:check
git add frontend/ && git commit -m "feat: add brand logo generator with static SVG variants"
```
(prettier có thể đòi format logo-paths.ts — chạy `pnpm format` rồi check lại. `.prettierignore` thêm dòng `public/brand/*.svg` nếu prettier đòi format SVG.)

---

### Task 2: Component RangiLogo (TDD)

**Files:**
- Test: `frontend/src/components/brand/RangiLogo.test.tsx`
- Create: `frontend/src/components/brand/RangiLogo.tsx`, `frontend/src/components/brand/rangi-logo.module.css`
- Modify: `frontend/vitest.config.ts` (css modules classNameStrategy)

**Interfaces:**
- Consumes: `WORDMARK` từ `logo-paths.ts` (Task 1)
- Produces: `<RangiLogo variant theme progress? animated? title? className?>` — Task 4 dùng trong page.tsx

- [ ] **Step 1: Sửa vitest.config.ts** — thêm vào `test`: `css: { modules: { classNameStrategy: "non-scoped" } },`

- [ ] **Step 2: Viết failing tests**

`frontend/src/components/brand/RangiLogo.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { RangiLogo } from "./RangiLogo";

function dot(container: HTMLElement) {
  return container.querySelector("circle[data-part=dot]")!;
}
function halo(container: HTMLElement) {
  return container.querySelector("circle[data-part=halo]");
}

test("render wordmark với aria-label", () => {
  render(<RangiLogo variant="wordmark" theme="dark" title="Rangi" />);
  expect(screen.getByRole("img", { name: "Rangi" })).toBeInTheDocument();
});

test("progress cao hơn làm chấm to hơn và quầng đậm hơn", () => {
  const a = render(<RangiLogo variant="wordmark" theme="dark" progress={0.2} />);
  const rLow = Number(dot(a.container).getAttribute("r"));
  const oLow = Number(halo(a.container)!.getAttribute("opacity"));
  a.unmount();
  const b = render(<RangiLogo variant="wordmark" theme="dark" progress={0.9} />);
  expect(Number(dot(b.container).getAttribute("r"))).toBeGreaterThan(rLow);
  expect(Number(halo(b.container)!.getAttribute("opacity"))).toBeGreaterThan(oLow);
});

test("progress 0 là trạng thái nghỉ trung tính: chấm mờ, không quầng", () => {
  const { container } = render(<RangiLogo variant="wordmark" theme="dark" progress={0} />);
  expect(Number(dot(container).getAttribute("opacity"))).toBeCloseTo(0.35);
  expect(halo(container)).toBeNull();
});

test("mono-white: mọi fill là #FFFFFF và không có quầng", () => {
  const { container } = render(<RangiLogo variant="wordmark" theme="mono-white" />);
  expect(halo(container)).toBeNull();
  const fills = [...container.querySelectorAll("[fill]")].map(e => e.getAttribute("fill"));
  expect(fills.every(f => f === "#FFFFFF")).toBe(true);
});

test("animated=false không gắn class breath", () => {
  const { container } = render(<RangiLogo variant="icon" theme="dark" animated={false} />);
  expect(container.querySelector("svg")!.className.baseVal).not.toMatch(/breath/);
});
```

- [ ] **Step 3: Chạy test, xác nhận fail đúng lý do** — `cd frontend && pnpm test` → FAIL: `Failed to resolve import "./RangiLogo"`.

- [ ] **Step 4: Implement**

`frontend/src/components/brand/rangi-logo.module.css`:

```css
.breath [data-part="dot"] {
  transform-box: fill-box;
  transform-origin: center;
  animation: breath 2.4s ease-in-out infinite;
}
@keyframes breath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .breath [data-part="dot"] { animation: none; }
}
```

`frontend/src/components/brand/RangiLogo.tsx`:

```tsx
import { WORDMARK } from "./logo-paths";
import styles from "./rangi-logo.module.css";

const THEMES = {
  dark: { text: "#FBF6EA", dot: "#F5A623", halo: "#F5A623" },
  light: { text: "#0A2E26", dot: "#EF8D08", halo: "#F5A623" },
  "mono-white": { text: "#FFFFFF", dot: "#FFFFFF", halo: null },
  "mono-black": { text: "#0B0B0B", dot: "#0B0B0B", halo: null },
} as const;
const HALO_BASE = { dark: 0.2, light: 0.28 } as const;

export interface RangiLogoProps {
  variant: "wordmark" | "icon";
  theme: keyof typeof THEMES;
  progress?: number;
  animated?: boolean;
  title?: string;
  className?: string;
}

function dotState(theme: keyof typeof THEMES, progress?: number) {
  const isMono = theme.startsWith("mono");
  if (progress === undefined) {
    return { rMul: 1, dotOp: 1, haloOp: isMono ? 0 : HALO_BASE[theme as "dark" | "light"], haloMul: 1 };
  }
  const p = Math.max(0, Math.min(1, progress));
  if (p === 0) return { rMul: 1, dotOp: 0.35, haloOp: 0, haloMul: 1 };
  return { rMul: 1 + 0.6 * p, dotOp: 1, haloOp: isMono ? 0 : 0.06 + 0.3 * p, haloMul: 1 + p };
}

export function RangiLogo({ variant, theme, progress, animated = true, title = "Rangi", className }: RangiLogoProps) {
  const c = THEMES[theme];
  const s = dotState(theme, progress);
  const cls = [animated ? styles.breath : "", className ?? ""].join(" ").trim();

  if (variant === "icon") {
    const bg = theme === "dark" ? "#0A2E26" : theme === "light" ? "#FBF6EA" : null;
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label={title} className={cls}>
        <title>{title}</title>
        {bg && <rect width="48" height="48" rx="11" fill={bg} />}
        {s.haloOp > 0 && <circle data-part="halo" cx="24" cy="21" r={9 * s.haloMul} fill={c.halo!} opacity={+s.haloOp.toFixed(3)} />}
        <circle data-part="dot" cx="24" cy="21" r={+(5 * s.rMul).toFixed(2)} fill={c.dot} opacity={s.dotOp} />
        <rect x="20.7" y="30" width="6.6" height="9" rx="3.3" fill={c.text} />
      </svg>
    );
  }

  const W = WORDMARK;
  return (
    <svg viewBox={`0 0 ${W.width} ${W.height}`} role="img" aria-label={title} className={cls}>
      <title>{title}</title>
      {s.haloOp > 0 && <circle data-part="halo" cx={W.i.dotCx} cy={W.i.dotCy} r={+(W.i.haloR * s.haloMul).toFixed(2)} fill={c.halo!} opacity={+s.haloOp.toFixed(3)} />}
      <circle data-part="dot" cx={W.i.dotCx} cy={W.i.dotCy} r={+(W.i.dotR * s.rMul).toFixed(2)} fill={c.dot} opacity={s.dotOp} />
      <rect x={W.i.stemX} y={W.i.stemY} width={W.i.stemW} height={W.i.stemH} rx={W.i.rx} fill={c.text} />
      {W.glyphs.map((g, idx) => (
        <g key={idx} transform={`translate(${W.padX + g.tx} ${W.baseline + g.ty}) scale(${W.glyphScale} ${-W.glyphScale})`}>
          <path d={g.d} fill={c.text} />
        </g>
      ))}
    </svg>
  );
}
```

- [ ] **Step 5: Chạy test pass + lint** — `pnpm test` → 6 passed (1 cũ + 5 mới); `pnpm lint && pnpm format:check` sạch.

- [ ] **Step 6: Commit** — `git add frontend/ && git commit -m "feat: add RangiLogo component with progress-driven glow"`

---

### Task 3: Xuất PNG

**Files:**
- Create: `frontend/scripts/brand/export-png.mjs`, sinh `frontend/public/brand/png/*.png` (8 file)
- Modify: `frontend/package.json` (script `brand:png`)

- [ ] **Step 1: Viết script**

`frontend/scripts/brand/export-png.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRAND = path.resolve(__dirname, "../../public/brand");
const OUT = path.join(BRAND, "png");
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  ...[16, 32, 48, 180, 192, 512].map(sz => ({ src: "rangi-icon-dark.svg", out: `icon-${sz}.png`, w: sz, h: sz })),
  { src: "og-image.svg", out: "og-image.png", w: 1200, h: 630 },
  { src: "rangi-icon-dark.svg", out: "avatar-400.png", w: 400, h: 400 },
];

for (const j of jobs) {
  const buf = fs.readFileSync(path.join(BRAND, j.src));
  await sharp(buf, { density: 300 }).resize(j.w, j.h).png().toFile(path.join(OUT, j.out));
  const meta = await sharp(path.join(OUT, j.out)).metadata();
  if (meta.width !== j.w || meta.height !== j.h) throw new Error(`${j.out}: ${meta.width}x${meta.height} != ${j.w}x${j.h}`);
  console.log("ok:", j.out, `${j.w}x${j.h}`);
}
```

package.json scripts: `"brand:png": "node scripts/brand/export-png.mjs"`.

- [ ] **Step 2: Chạy + verify** — `cd frontend && pnpm brand:png` → 8 dòng "ok" (script tự verify kích thước bằng metadata, sai là throw).

- [ ] **Step 3: Commit** — `git add frontend/ && git commit -m "feat: add PNG export pipeline for brand assets"`

---

### Task 4: Tích hợp + tài liệu + verify tổng + merge

**Files:**
- Modify: `frontend/src/app/page.tsx`, `README.md` (gốc), `TASKS.md`, `docs/README.md`
- Create: `frontend/public/brand/README.md`

- [ ] **Step 1: page.tsx** — thay `<h1>tutor-agent</h1>` bằng:

```tsx
import { RangiLogo } from "@/components/brand/RangiLogo";
```
và trong JSX: `<div style={{ maxWidth: 260 }}><RangiLogo variant="wordmark" theme="light" /></div>` (giữ nguyên phần còn lại của page).

- [ ] **Step 2: brand README**

`frontend/public/brand/README.md`: bảng liệt kê 11 SVG + 8 PNG với chỗ dùng; quy tắc: vùng an toàn = đường kính quầng sáng quanh logo; wordmark tối thiểu 120px ngang (nhỏ hơn → dùng icon); CẤM kéo méo, đổi màu chấm, đặt lên nền làm chìm quầng, thêm hiệu ứng bóng/glow ngoài hệ; file đều là GENERATED — sửa bằng cách sửa generator rồi chạy lại `pnpm brand:generate && pnpm brand:png`.

- [ ] **Step 3: Verify tổng**

```bash
cd frontend && pnpm test && pnpm lint && pnpm format:check && pnpm build
```
Expected: tất cả sạch, build thành công. Mở trang qua browser tool (dev server hoặc cụm docker) xác nhận wordmark hiển thị trên trang chủ.

- [ ] **Step 4: Cập nhật tài liệu gốc** — README.md thêm dòng vào mục Tài liệu: `- frontend/public/brand/ — bộ logo Rangi (SVG generated + PNG exports)`; TASKS.md mục Đã xong thêm: `- [x] 05/08/2026 — **Gói logo Rangi**: generator fontkit → 11 SVG + component RangiLogo (progress glow, reduced-motion) + 8 PNG exports (spec/plan 2026-08-05)`; docs/README.md đổi trạng thái spec+plan logo thành "đã thực thi 05/08/2026".

- [ ] **Step 5: Commit + push nhánh + merge**

```bash
git add -A && git commit -m "feat: integrate Rangi wordmark into homepage and document brand assets"
git push -u origin feat/brand-logo
```
DỪNG tại đây — controller chạy final review trước khi merge (theo quy trình; merge về main là bước của controller sau review).
