# Gói mở rộng nhận diện SVG — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung pose sheet đom đóm geometric, motif đường bay chấm gạch, lockup dọc, 40 icon (20 outline + 20 filled), pattern nền 2 mode và animation `RangiSplash` — theo spec `docs/specs/2026-08-05-goi-mo-rong-nhan-dien-svg.md` (ĐÃ DUYỆT).

**Architecture:** Asset sinh-từ-code (flight path, lockup dọc, pattern) mở rộng pipeline `frontend/scripts/brand/generate-logo.mjs` sẵn có qua module mới `motifs.mjs`; asset vẽ tay (icon, mascot) là SVG tĩnh được gác bằng script kiểm chuẩn `check-icons.mjs` chạy trong CI. Animation dùng SMIL `animateMotion` (đơn vị SVG thuần, không lệch unit như CSS `offset-path`), reduced-motion xử lý ở React bằng `matchMedia`.

**Tech Stack:** Node 22 (ESM .mjs), fontkit (đã có), Vitest + React Testing Library (đã có), Next.js 15/React 19. KHÔNG thêm dependency mới (SVGO không cần — SVG viết tay đã tối giản).

## Global Constraints

- Làm trên nhánh `feat/brand-svg-extension` (tạo từ `origin/main`), commit theo mốc + push, Conventional Commits.
- Màu trong SVG: chỉ `currentColor` hoặc `var(--…, <hex whitelist>)`. Whitelist icon: `#F5A623`. Whitelist mascot/pattern: `#F5A623 #0E7A5A #84DEBE #FBF6EA`. KHÔNG hex trần ngoài fallback của `var()`.
- Amber không bao giờ làm chữ. `correct`/`incorrect` khác nhau về HÌNH (✓ vs ✗), không chỉ màu.
- Mascot: geometric, KHÔNG baby-face, mắt = chấm nhỏ (r ≤ 1.5 trên lưới 96), pose nghỉ mắt là NÉT NGANG THẲNG (không cong xuống — cong xuống = buồn = cấm). Không đụng wordmark ngang/app icon/favicon/og-image hiện có.
- File sinh từ code KHÔNG sửa tay; sửa tham số rồi chạy `pnpm brand:generate`.
- Mọi lệnh chạy trong `frontend/` trừ khi ghi khác. Test chạy bằng `pnpm exec vitest run <path>`.

---

### Task 1: Hồi sinh baseline pipeline

**Files:** không tạo file mới; có thể thay đổi `pnpm-lock.yaml` (chỉ khi lockfile lệch — nếu lệch, DỪNG và báo, không tự quyết).

**Interfaces:**

- Produces: môi trường `frontend/` chạy được `pnpm brand:generate` + `pnpm test`; nhánh `feat/brand-svg-extension` sẵn sàng.

- [ ] **Step 1: Tạo nhánh làm việc**

```bash
git fetch origin && git checkout -b feat/brand-svg-extension origin/main
```

- [ ] **Step 2: Cài dependency và xác nhận fontkit có mặt**

```bash
cd frontend && pnpm install && pnpm ls fontkit
```

Expected: `pnpm ls fontkit` in ra một dòng version (fontkit nằm trong devDependencies). Nếu KHÔNG có → dừng, báo người dùng (không tự thêm dependency).

- [ ] **Step 3: Chạy generator 2 lần, xác nhận deterministic và khớp repo**

```bash
pnpm brand:generate && pnpm brand:generate && git status --short
```

Expected: log `generated: …` liệt kê 15 file; `git status --short` KHÔNG có dòng nào trong `frontend/public/brand/` hay `logo-paths.ts` (output tái sinh y hệt bản đã commit — baseline deterministic).

- [ ] **Step 4: Chạy test baseline**

Run: `pnpm test`
Expected: PASS toàn bộ (RangiLogo.test.tsx, Health.test.tsx). Ghi lại số test pass để so cuối dự án.

---

### Task 2: Module `motifs.mjs` — flight path + spark (TDD)

**Files:**

- Create: `frontend/scripts/brand/motifs.mjs`
- Test: `frontend/scripts/brand/motifs.test.mjs`

**Interfaces:**

- Produces: `flightPathEl(opts) -> string` (một `<path>` nét đứt), `flightPathD(opts) -> string` (riêng attribute `d`, cho animateMotion), `sparkEl({cx,cy,r,haloR,haloOp}) -> string`. Task 3, 8, 9, 10 dùng đúng các tên này.

- [ ] **Step 1: Viết test đỏ**

```js
// frontend/scripts/brand/motifs.test.mjs
import { describe, expect, it } from "vitest";
import { flightPathD, flightPathEl, sparkEl } from "./motifs.mjs";

describe("flightPathD", () => {
  it("là đường cong quadratic đi từ from tới to", () => {
    const d = flightPathD({ from: [0, 100], to: [200, 40], curve: 60 });
    expect(d).toBe("M 0 100 Q 100 10, 200 40");
  });
});

describe("flightPathEl", () => {
  it("phát ra path nét đứt bo tròn dùng currentColor", () => {
    const el = flightPathEl({ from: [0, 100], to: [200, 40], curve: 60 });
    expect(el).toContain('stroke-dasharray="1 7"');
    expect(el).toContain('stroke="currentColor"');
    expect(el).toContain('stroke-linecap="round"');
    expect(el).toContain('fill="none"');
    expect(el).toContain('d="M 0 100 Q 100 10, 200 40"');
  });
  it("cho override màu và id", () => {
    const el = flightPathEl({
      from: [0, 0],
      to: [10, 0],
      curve: 5,
      stroke: "#F5A623",
      id: "flight-path",
    });
    expect(el).toContain('id="flight-path"');
    expect(el).toContain('stroke="#F5A623"');
  });
});

describe("sparkEl", () => {
  it("phát ra đốm sáng + quầng với id cố định", () => {
    const el = sparkEl({ cx: 10, cy: 20, r: 4, haloR: 9, haloOp: 0.25 });
    expect(el).toContain('id="flight-spark"');
    expect(el).toContain('cx="10"');
    expect(el).toContain('r="9"'); // quầng
    expect(el).toContain('r="4"'); // đốm
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ đúng lý do**

Run: `pnpm exec vitest run scripts/brand/motifs.test.mjs`
Expected: FAIL — `Cannot find module './motifs.mjs'` (module chưa tồn tại; KHÔNG phải fail vì assertion sai).

- [ ] **Step 3: Viết implementation**

```js
// frontend/scripts/brand/motifs.mjs
// Shared brand motifs: dashed firefly flight path + amber spark.
// Pure string generators — deterministic, no I/O.

const AMBER = "#F5A623";

export function flightPathD({ from, to, curve }) {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2 - curve;
  return `M ${from[0]} ${from[1]} Q ${mx} ${my}, ${to[0]} ${to[1]}`;
}

export function flightPathEl({
  from,
  to,
  curve,
  stroke = "currentColor",
  width = 2,
  dash = "1 7",
  id = null,
}) {
  const idAttr = id ? ` id="${id}"` : "";
  return (
    `<path${idAttr} d="${flightPathD({ from, to, curve })}" fill="none" stroke="${stroke}" ` +
    `stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${dash}"/>`
  );
}

export function sparkEl({
  cx,
  cy,
  r,
  haloR,
  haloOp,
  color = AMBER,
  id = "flight-spark",
}) {
  return (
    `<g id="${id}">` +
    `<circle cx="${cx}" cy="${cy}" r="${haloR}" fill="${color}" opacity="${haloOp}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>` +
    `</g>`
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận xanh**

Run: `pnpm exec vitest run scripts/brand/motifs.test.mjs`
Expected: PASS 4/4.

- [ ] **Step 5: Commit**

```bash
git add scripts/brand/motifs.mjs scripts/brand/motifs.test.mjs
git commit -m "feat: shared flight-path and spark motif generators"
```

---

### Task 3: Asset đường bay trong generator

**Files:**

- Modify: `frontend/scripts/brand/generate-logo.mjs` (cuối file, trước dòng `console.log`)
- Test: `frontend/scripts/brand/generated-files.test.mjs` (tạo mới)

**Interfaces:**

- Consumes: `flightPathEl`, `sparkEl` từ Task 2.
- Produces: `frontend/public/brand/flight-path-horizontal.svg`, `frontend/public/brand/flight-path-to-dot.svg` (có `id="flight-path"` và `id="flight-spark"` để animate).

- [ ] **Step 1: Viết test đỏ (danh sách file kỳ vọng)**

```js
// frontend/scripts/brand/generated-files.test.mjs
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const BRAND = path.resolve(__dirname, "../../public/brand");
const read = (f) => fs.readFileSync(path.join(BRAND, f), "utf8");

describe("flight path assets", () => {
  it("flight-path-horizontal.svg tồn tại, nét đứt, currentColor", () => {
    const s = read("flight-path-horizontal.svg");
    expect(s).toContain('id="flight-path"');
    expect(s).toContain("stroke-dasharray");
    expect(s).toContain('stroke="currentColor"');
  });
  it("flight-path-to-dot.svg kết thúc tại đốm sáng", () => {
    const s = read("flight-path-to-dot.svg");
    expect(s).toContain('id="flight-path"');
    expect(s).toContain('id="flight-spark"');
    expect(s).toContain("#F5A623");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ đúng lý do**

Run: `pnpm exec vitest run scripts/brand/generated-files.test.mjs`
Expected: FAIL — `ENOENT … flight-path-horizontal.svg` (file chưa được generate).

- [ ] **Step 3: Mở rộng generator**

Thêm import đầu file `generate-logo.mjs`:

```js
import { flightPathEl, sparkEl } from "./motifs.mjs";
```

Thêm trước `console.log("generated:", …)`:

```js
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
fs.writeFileSync(
  path.join(OUT_SVG, "flight-path-horizontal.svg"),
  fpHorizontal,
);
fs.writeFileSync(path.join(OUT_SVG, "flight-path-to-dot.svg"), fpToDot);
```

- [ ] **Step 4: Generate và chạy test, xác nhận xanh**

```bash
pnpm brand:generate && pnpm exec vitest run scripts/brand/generated-files.test.mjs
```

Expected: log `generated:` chứa 2 file mới; test PASS 2/2. Chạy `pnpm brand:generate` lần nữa + `git status --short`: chỉ 2 file mới (deterministic).

- [ ] **Step 5: Commit**

```bash
git add scripts/brand/generate-logo.mjs scripts/brand/generated-files.test.mjs public/brand/flight-path-horizontal.svg public/brand/flight-path-to-dot.svg
git commit -m "feat: generated flight-path motif assets"
```

---

### Task 4: Lockup dọc trong generator

**Files:**

- Modify: `frontend/scripts/brand/generate-logo.mjs`
- Modify: `frontend/scripts/brand/generated-files.test.mjs` (thêm describe block)

**Interfaces:**

- Consumes: `wordmarkBody(theme)`, `I`, `R`, `COLORS`, `totalW`, `totalH`, `fitSlogan`, `sloganEls`, `assertFits`, `SLOGANS` (đều đã tồn tại trong generator).
- Produces: 8 file `frontend/public/brand/rangi-lockup-vertical-{dark,light,mono-black,mono-white}.svg` và `rangi-lockup-vertical-slogan{,-en}-{dark,light}.svg`.

- [ ] **Step 1: Thêm test đỏ**

Thêm vào `generated-files.test.mjs`:

```js
describe("vertical lockup", () => {
  const files = [
    "rangi-lockup-vertical-dark.svg",
    "rangi-lockup-vertical-light.svg",
    "rangi-lockup-vertical-mono-black.svg",
    "rangi-lockup-vertical-mono-white.svg",
    "rangi-lockup-vertical-slogan-dark.svg",
    "rangi-lockup-vertical-slogan-light.svg",
    "rangi-lockup-vertical-slogan-en-dark.svg",
    "rangi-lockup-vertical-slogan-en-light.svg",
  ];
  it.each(files)("%s tồn tại và là SVG hợp lệ", (f) => {
    const s = read(f);
    expect(s.startsWith("<svg")).toBe(true);
    expect(s).toContain("aria-label");
  });
  it("bản slogan VN chứa slogan đã chốt", () => {
    // slogan render bằng glyph path, không phải text — kiểm qua aria-label
    expect(read("rangi-lockup-vertical-slogan-dark.svg")).toContain(
      "Hoàn thiện hơn mỗi ngày",
    );
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ**

Run: `pnpm exec vitest run scripts/brand/generated-files.test.mjs`
Expected: FAIL — `ENOENT … rangi-lockup-vertical-dark.svg`.

- [ ] **Step 3: Thêm hàm vào generator** (sau `lockupSVG`, trước phần OG)

```js
// ---- Vertical lockup: icon (i + spark + halo) centered above the wordmark ----
function lockupVerticalSVG(theme, lang = null) {
  const c = COLORS[theme];
  const k = 1.35; // icon i lớn hơn i trong wordmark 35% cho cân khối
  const gapV = 0.14 * FS;
  const top = c.halo ? I.dotCy - I.haloR : I.dotCy - I.dotR;
  const bottom = I.stemY + I.stemH;
  const iconH = (bottom - top) * k;
  // dịch primitives của chữ i (scale k quanh gốc) sao cho dot nằm giữa trục totalW/2
  const tx = totalW / 2 - I.dotCx * k;
  const ty = -top * k;
  const halo = c.halo
    ? `<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.haloR}" fill="${c.halo}" opacity="${c.haloOp}"/>`
    : "";
  const iconBlock =
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k})">` +
    halo +
    `<circle cx="${I.dotCx.toFixed(2)}" cy="${I.dotCy.toFixed(2)}" r="${I.dotR}" fill="${c.dot}"/>` +
    `<rect x="${I.stemX.toFixed(2)}" y="${I.stemY.toFixed(2)}" width="${I.stemW.toFixed(2)}" height="${I.stemH.toFixed(2)}" rx="${I.rx.toFixed(2)}" fill="${c.text}"/>` +
    `</g>`;
  const wordY = iconH + gapV;
  let h = wordY + totalH;
  let sloganBlock = "";
  if (lang) {
    const sl = fitSlogan(SLOGANS[lang]);
    const slY = h + 0.13 * FS;
    assertFits(`lockupVerticalSVG(${theme},${lang})`, sl, totalW);
    const color = theme === "dark" ? "#84DEBE" : "#0E7A5A";
    sloganBlock = `<g transform="translate(0 0)">${sloganEls(sl, slY, color)}</g>`;
    h = slY + 0.12 * FS;
  }
  const label = lang ? `Rangi — ${SLOGANS[lang]}` : "Rangi";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW.toFixed(2)} ${h.toFixed(2)}" role="img" aria-label="${label}"><title>Rangi</title>` +
    iconBlock +
    `<g transform="translate(0 ${wordY.toFixed(2)})">${wordmarkBody(theme)}</g>` +
    sloganBlock +
    `</svg>`
  );
}
```

Và phần ghi file (cạnh vòng `for` của lockup ngang):

```js
for (const t of Object.keys(COLORS))
  fs.writeFileSync(
    path.join(OUT_SVG, `rangi-lockup-vertical-${t}.svg`),
    lockupVerticalSVG(t),
  );
for (const t of ["dark", "light"]) {
  fs.writeFileSync(
    path.join(OUT_SVG, `rangi-lockup-vertical-slogan-${t}.svg`),
    lockupVerticalSVG(t, "vn"),
  );
  fs.writeFileSync(
    path.join(OUT_SVG, `rangi-lockup-vertical-slogan-en-${t}.svg`),
    lockupVerticalSVG(t, "en"),
  );
}
```

- [ ] **Step 4: Generate + test xanh + soi mắt**

```bash
pnpm brand:generate && pnpm exec vitest run scripts/brand/generated-files.test.mjs
```

Expected: PASS toàn bộ. Sau đó mở `public/brand/rangi-lockup-vertical-dark.svg` và `-light.svg` bằng browser tool trên cả nền `#0A2E26` và `#FBF6EA`: icon thẳng trục giữa, khoảng thở cân, slogan không tràn.

- [ ] **Step 5: Commit**

```bash
git add scripts/brand/generate-logo.mjs scripts/brand/generated-files.test.mjs public/brand/rangi-lockup-vertical-*.svg
git commit -m "feat: vertical lockup variants generated from code"
```

---

### Task 5: Script kiểm chuẩn `check-icons.mjs` (gate TRƯỚC khi vẽ icon)

**Files:**

- Create: `frontend/scripts/brand/check-icons.mjs`
- Test: `frontend/scripts/brand/check-icons.test.mjs`
- Modify: `frontend/package.json` (thêm script `"brand:check": "node scripts/brand/check-icons.mjs"`)

**Interfaces:**

- Produces: `checkSvg(name, content, kind) -> string[]` (mảng lỗi, rỗng = đạt; `kind` ∈ `"outline" | "filled" | "mascot"`), `ICON_MANIFEST` (20 tên), `MASCOT_MANIFEST` (4 tên). CLI exit 1 khi có lỗi hoặc thiếu/thừa file. Task 6, 7, 8 bị gác bởi script này.

- [ ] **Step 1: Viết test đỏ (chứng minh HAI CHIỀU: pass hợp lệ, fail sai chuẩn)**

```js
// frontend/scripts/brand/check-icons.test.mjs
import { describe, expect, it } from "vitest";
import { ICON_MANIFEST, MASCOT_MANIFEST, checkSvg } from "./check-icons.mjs";

const VALID_OUTLINE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="correct"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/></svg>';
const VALID_FILLED =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="correct"><path fill-rule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm4.62 5.88a.9.9 0 0 0-1.27 0L10.6 13.6l-2-2a.9.9 0 1 0-1.27 1.27l2.63 2.64a.9.9 0 0 0 1.28 0l5.38-5.36a.9.9 0 0 0 0-1.27Z"/></svg>';

describe("checkSvg outline", () => {
  it("icon hợp lệ → không lỗi", () => {
    expect(checkSvg("correct", VALID_OUTLINE, "outline")).toEqual([]);
  });
  it("viewBox sai → lỗi", () => {
    const bad = VALID_OUTLINE.replace("0 0 24 24", "0 0 32 32");
    expect(checkSvg("correct", bad, "outline")).not.toEqual([]);
  });
  it("hex trần ngoài whitelist → lỗi", () => {
    const bad = VALID_OUTLINE.replace(
      'stroke="currentColor"',
      'stroke="#FF0000"',
    );
    expect(checkSvg("correct", bad, "outline")).not.toEqual([]);
  });
  it("amber KHÔNG bọc trong var() → lỗi; bọc trong var() → hợp lệ", () => {
    const naked = VALID_OUTLINE.replace(
      "<circle",
      '<circle fill="#F5A623"',
    ).replace('fill="none"', 'fill="none"');
    expect(checkSvg("spark", naked, "outline")).not.toEqual([]);
    const wrapped = VALID_OUTLINE.replace(
      "<circle",
      '<circle fill="var(--icon-accent, #F5A623)"',
    );
    expect(checkSvg("spark", wrapped, "outline")).toEqual([]);
  });
  it("tên ngoài manifest → lỗi", () => {
    expect(checkSvg("random-icon", VALID_OUTLINE, "outline")).not.toEqual([]);
  });
});

describe("checkSvg filled", () => {
  it("icon filled hợp lệ → không lỗi", () => {
    expect(checkSvg("correct", VALID_FILLED, "filled")).toEqual([]);
  });
  it("filled thiếu fill=currentColor → lỗi", () => {
    const bad = VALID_FILLED.replace('fill="currentColor"', "");
    expect(checkSvg("correct", bad, "filled")).not.toEqual([]);
  });
});

describe("manifest", () => {
  it("đúng 20 icon, 4 mascot", () => {
    expect(ICON_MANIFEST).toHaveLength(20);
    expect(MASCOT_MANIFEST).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ đúng lý do**

Run: `pnpm exec vitest run scripts/brand/check-icons.test.mjs`
Expected: FAIL — `Cannot find module './check-icons.mjs'`.

- [ ] **Step 3: Viết implementation**

```js
// frontend/scripts/brand/check-icons.mjs
// Conformance gate for hand-authored brand SVGs (icons + mascot).
// Rules: docs/specs/2026-08-05-goi-mo-rong-nhan-dien-svg.md §D.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ICON_MANIFEST = [
  "lesson",
  "learning-path",
  "goal",
  "learning-session",
  "learning-sprint",
  "assessment-item",
  "correct",
  "incorrect",
  "hint",
  "timer",
  "mock-exam",
  "mastery-map",
  "progress-chart",
  "spark",
  "badge",
  "learning-evidence",
  "parent-report",
  "daily-digest",
  "student-profile",
  "settings",
  "calendar",
].sort();
export const MASCOT_MANIFEST = [
  "firefly-flying",
  "firefly-glowing",
  "firefly-resting",
  "firefly-greeting",
].sort();

const WHITELIST = {
  outline: ["#F5A623"],
  filled: ["#F5A623"],
  mascot: ["#F5A623", "#0E7A5A", "#84DEBE", "#FBF6EA"],
};
const VIEWBOX = {
  outline: "0 0 24 24",
  filled: "0 0 24 24",
  mascot: "0 0 96 96",
};

export function checkSvg(name, content, kind) {
  const errors = [];
  const manifest = kind === "mascot" ? MASCOT_MANIFEST : ICON_MANIFEST;
  if (!manifest.includes(name))
    errors.push(`${name}: tên không thuộc manifest ${kind}`);
  if (!content.includes(`viewBox="${VIEWBOX[kind]}"`))
    errors.push(`${name}: viewBox phải là "${VIEWBOX[kind]}"`);
  if (kind === "outline") {
    if (!content.includes('stroke="currentColor"'))
      errors.push(`${name}: outline phải stroke="currentColor"`);
    if (!content.includes('fill="none"'))
      errors.push(`${name}: outline phải fill="none" ở root`);
    if (!content.includes('stroke-width="1.75"'))
      errors.push(`${name}: outline phải stroke-width="1.75"`);
  }
  if (kind === "filled" && !content.includes('fill="currentColor"'))
    errors.push(`${name}: filled phải fill="currentColor"`);
  // mọi hex phải thuộc whitelist VÀ nằm trong fallback của var(--…)
  const hexes = content.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  for (const hex of hexes) {
    if (
      !WHITELIST[kind].includes(hex.toUpperCase()) &&
      !WHITELIST[kind].includes(hex)
    )
      errors.push(`${name}: hex ${hex} ngoài whitelist ${kind}`);
  }
  const naked = content.replace(/var\(--[a-z-]+,\s*#[0-9a-fA-F]{3,8}\)/g, "");
  if (/#[0-9a-fA-F]{3,8}\b/.test(naked))
    errors.push(`${name}: có hex trần không bọc trong var(--…, fallback)`);
  return errors;
}

function checkDir(dir, kind, manifest) {
  const errors = [];
  if (!fs.existsSync(dir)) return [`thiếu thư mục ${dir}`];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.replace(/\.svg$/, ""))
    .sort();
  for (const missing of manifest.filter((m) => !files.includes(m)))
    errors.push(`${kind}: thiếu ${missing}.svg`);
  for (const extra of files.filter((f) => !manifest.includes(f)))
    errors.push(`${kind}: thừa ${extra}.svg`);
  for (const f of files) {
    if (!manifest.includes(f)) continue;
    errors.push(
      ...checkSvg(f, fs.readFileSync(path.join(dir, `${f}.svg`), "utf8"), kind),
    );
  }
  return errors;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const FE = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const all = [
    ...checkDir(
      path.join(FE, "public/brand/icons/outline"),
      "outline",
      ICON_MANIFEST,
    ),
    ...checkDir(
      path.join(FE, "public/brand/icons/filled"),
      "filled",
      ICON_MANIFEST,
    ),
    ...checkDir(
      path.join(FE, "public/brand/mascot"),
      "mascot",
      MASCOT_MANIFEST,
    ),
  ];
  if (all.length) {
    console.error(
      `brand:check FAIL (${all.length} lỗi):\n- ` + all.join("\n- "),
    );
    process.exit(1);
  }
  console.log("brand:check PASS: 40 icon + 4 mascot đạt chuẩn");
}
```

- [ ] **Step 4: Thêm npm script + chạy test xanh**

Trong `frontend/package.json`, cạnh `"brand:png"`: thêm `"brand:check": "node scripts/brand/check-icons.mjs"`.

Run: `pnpm exec vitest run scripts/brand/check-icons.test.mjs`
Expected: PASS toàn bộ. Chạy `pnpm brand:check` lúc này: exit 1 với "thiếu thư mục" — ĐÚNG kỳ vọng (icon chưa vẽ).

- [ ] **Step 5: Commit**

```bash
git add scripts/brand/check-icons.mjs scripts/brand/check-icons.test.mjs package.json
git commit -m "feat: brand svg conformance checker (brand:check)"
```

---

### Task 6: Vẽ 20 icon outline

**Files:**

- Create: `frontend/public/brand/icons/outline/<20 tên theo ICON_MANIFEST>.svg`
- Create: `frontend/scripts/brand/preview-icons.html` (trang soi mắt, không ship)

**Interfaces:**

- Consumes: chuẩn từ Task 5 (`brand:check` phải PASS phần outline).
- Produces: 20 file outline — Task 7 phải giữ đúng silhouette các icon này.

**Hợp đồng phong cách (áp cho MỌI icon outline):** root `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="<tên>">`; vùng vẽ 20×20 (chừa 2px mỗi biên); bo góc hình chữ nhật `rx="2"`; accent hổ phách CHỈ qua `fill="var(--icon-accent, #F5A623)" stroke="none"` ở phần tử được chỉ định.

**3 icon mẫu (nội dung chuẩn, dùng nguyên văn):**

```xml
<!-- correct.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="correct"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/></svg>
```

```xml
<!-- incorrect.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="incorrect"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>
```

```xml
<!-- spark.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="spark"><circle cx="12" cy="12" r="3.5" fill="var(--icon-accent, #F5A623)" stroke="none"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18"/></svg>
```

**Ẩn dụ 17 icon còn lại (vẽ theo hợp đồng phong cách):**

| Icon                | Hình                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `lesson`            | sách mở: hai trang cong gặp nhau ở gáy giữa                                              |
| `learning-path`     | đường cong nét đứt (dasharray riêng `1 4`) nối 3 chấm tròn nhỏ — họ hàng với flight path |
| `goal`              | cờ cắm trên cột, đế nhỏ                                                                  |
| `learning-session`  | bong bóng thoại bo tròn, bên trong 1 chấm accent hổ phách                                |
| `learning-sprint`   | mũi tên cong vòng 3/4 (vòng lặp ngày) + chấm accent ở đầu mũi tên                        |
| `assessment-item`   | tờ giấy góc gập, 2 dòng kẻ + 1 ô vuông nhỏ có nét ✓                                      |
| `hint`              | bóng đèn, dây tóc = chấm accent hổ phách                                                 |
| `timer`             | đồng hồ bấm giờ: thân tròn, nút trên, kim chỉ 2 giờ                                      |
| `mock-exam`         | clipboard (kẹp trên) + 3 dòng kẻ                                                         |
| `mastery-map`       | 3 node tròn nối cạnh chữ V ngược (graph nhỏ), node đỉnh có accent                        |
| `progress-chart`    | 3 cột cao dần (trục đáy, cột 5-9-13 đơn vị)                                              |
| `badge`             | huy hiệu tròn răng cưa nhẹ (8 cung) + chấm giữa                                          |
| `learning-evidence` | tờ giấy + con dấu tròn nhỏ góc dưới phải                                                 |
| `parent-report`     | tờ giấy chứa mini progress-chart (2 cột)                                                 |
| `daily-digest`      | phong bì, nắp mở, 1 chấm accent bay ra                                                   |
| `student-profile`   | bán thân người trong vòng tròn                                                           |
| `settings`          | bánh răng 6 răng, lỗ giữa                                                                |
| `calendar`          | lưới lịch 2 hàng, 1 ô có chấm accent                                                     |

- [ ] **Step 1: Vẽ 20 file theo hợp đồng + 3 mẫu nguyên văn ở trên**
- [ ] **Step 2: Chạy gate**

Run: `pnpm brand:check`
Expected: phần outline hết lỗi (filled/mascot vẫn báo thiếu thư mục — chấp nhận ở task này; xác nhận KHÔNG có lỗi nào bắt đầu bằng `outline:` hay tên icon outline).

- [ ] **Step 3: Trang soi mắt**

```html
<!-- frontend/scripts/brand/preview-icons.html — mở trực tiếp bằng browser, không ship -->
<!doctype html><meta charset="utf-8" /><title>Icon preview</title>
<style>
  body {
    font-family: sans-serif;
    margin: 24px;
    display: grid;
    gap: 24px;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(10, 64px);
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
  }
  .light {
    background: #fbf6ea;
    color: #0a2e26;
  }
  .dark {
    background: #0a2e26;
    color: #fbf6ea;
  }
  figure {
    margin: 0;
    text-align: center;
  }
  img {
    width: 32px;
    height: 32px;
  }
  figcaption {
    font-size: 9px;
  }
</style>
<div id="root"></div>
<script>
  const names = [
    "lesson",
    "learning-path",
    "goal",
    "learning-session",
    "learning-sprint",
    "assessment-item",
    "correct",
    "incorrect",
    "hint",
    "timer",
    "mock-exam",
    "mastery-map",
    "progress-chart",
    "spark",
    "badge",
    "learning-evidence",
    "parent-report",
    "daily-digest",
    "student-profile",
    "settings",
    "calendar",
  ];
  for (const mode of ["light", "dark"])
    for (const set of ["outline", "filled"]) {
      const d = document.createElement("div");
      d.className = `row ${mode}`;
      d.innerHTML = names
        .map(
          (n) =>
            `<figure><img src="../../public/brand/icons/${set}/${n}.svg" onerror="this.style.opacity=.15"><figcaption>${n}</figcaption></figure>`,
        )
        .join("");
      document.getElementById("root").appendChild(d);
    }
</script>
```

Lưu ý: `<img>` không nhận `currentColor` từ trang — icon hiện màu đen mặc định; trang này soi HÌNH (silhouette, cân đối, độ dày nét), còn màu token verify ở Task 10 khi icon inline trong React.

- [ ] **Step 4: Mở preview bằng browser tool, soi từng icon trên cả 2 hàng nền; icon nào lệch (nét không đều, tràn lưới, ẩn dụ không đọc được ở 16px) thì sửa rồi soi lại**
- [ ] **Step 5: Commit**

```bash
git add public/brand/icons/outline/ scripts/brand/preview-icons.html
git commit -m "feat: 20 outline brand icons"
```

---

### Task 7: Vẽ 20 icon filled

**Files:**

- Create: `frontend/public/brand/icons/filled/<20 tên>.svg`

**Interfaces:**

- Consumes: silhouette từ Task 6 (đặt file outline cạnh bên khi vẽ), chuẩn Task 5.
- Produces: 20 file filled.

**Hợp đồng phong cách filled:** root `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="<tên>">`; hình đặc, chi tiết bên trong khoét bằng `fill-rule="evenodd"` (KHÔNG dùng stroke màu nền); accent hổ phách như outline. Silhouette phải khớp bản outline cùng tên (đặt hai bản chồng nhau lệch nhau ≤1px ở biên ngoài).

**Mẫu filled (nguyên văn):**

```xml
<!-- correct.svg (filled) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="correct"><path fill-rule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm4.62 5.88a.9.9 0 0 0-1.27 0L10.6 13.6l-2-2a.9.9 0 1 0-1.27 1.27l2.63 2.64a.9.9 0 0 0 1.28 0l5.38-5.36a.9.9 0 0 0 0-1.27Z"/></svg>
```

- [ ] **Step 1: Vẽ 20 file filled theo hợp đồng**
- [ ] **Step 2: Chạy gate**

Run: `pnpm brand:check`
Expected: outline + filled hết lỗi (chỉ còn mascot báo thiếu).

- [ ] **Step 3: Mở lại `preview-icons.html`, so hàng filled với hàng outline cùng nền — silhouette khớp, không icon nào "béo" hơn hẳn bạn outline của nó**
- [ ] **Step 4: Commit**

```bash
git add public/brand/icons/filled/
git commit -m "feat: 20 filled brand icons"
```

---

### Task 8: Pose sheet đom đóm (4 SVG)

**Files:**

- Create: `frontend/public/brand/mascot/firefly-{glowing,flying,resting,greeting}.svg`
- Modify: `frontend/scripts/brand/preview-icons.html` (thêm hàng mascot với slider `--rangi-glow`)

**Interfaces:**

- Consumes: chuẩn mascot Task 5 (viewBox 96, whitelist 4 hex trong var()).
- Produces: 4 pose; Task 10 dùng bản rút gọn hình học của `firefly-flying`.

**Bản chuẩn `firefly-glowing` (nguyên văn — các pose khác biến đổi từ đây):**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="Rangi firefly glowing">
  <g id="halo" style="opacity:calc(0.3*var(--rangi-glow, 1))">
    <circle cx="48" cy="62" r="18" fill="var(--rangi-spark, #F5A623)"/>
  </g>
  <g id="wings" fill="var(--rangi-wing, #84DEBE)" opacity="0.7">
    <ellipse cx="36" cy="40" rx="7" ry="16" transform="rotate(-28 36 40)"/>
    <ellipse cx="60" cy="40" rx="7" ry="16" transform="rotate(28 60 40)"/>
  </g>
  <g id="body" fill="var(--rangi-body, #0E7A5A)">
    <ellipse cx="48" cy="44" rx="11" ry="14"/>
    <circle cx="48" cy="27" r="8"/>
    <path d="M44 20 Q42 14 37 12M52 20 Q54 14 59 12" fill="none" stroke="var(--rangi-body, #0E7A5A)" stroke-width="1.75" stroke-linecap="round"/>
  </g>
  <g id="eyes" fill="var(--rangi-cream, #FBF6EA)">
    <circle cx="44.5" cy="26.5" r="1.3"/>
    <circle cx="51.5" cy="26.5" r="1.3"/>
  </g>
  <ellipse id="spark" cx="48" cy="62" rx="9" ry="11" fill="var(--rangi-spark, #F5A623)" style="opacity:calc(0.45 + 0.55*var(--rangi-glow, 1))"/>
</svg>
```

**Biến đổi cho 3 pose còn lại (giữ nguyên cấu trúc group/id, đổi đúng những gì ghi):**

- `firefly-flying`: toàn thân bọc `<g transform="rotate(-16 48 48)">`; cánh xòe `rotate(-52 …)` / `rotate(52 …)`; thêm sau thân một đoạn đường bay ngắn: `<path d="M10 84 Q26 74, 38 66" fill="none" stroke="var(--rangi-spark, #F5A623)" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 6" opacity="0.6"/>` (đặt TRƯỚC group halo để nằm dưới).
- `firefly-resting`: cánh cụp `rx="4"`, `rotate(-8 …)` / `rotate(8 …)`; mắt nhắm trung tính — thay 2 circle bằng `<path d="M43.2 26.5h2.6M50.2 26.5h2.6" stroke="var(--rangi-cream, #FBF6EA)" stroke-width="1.3" stroke-linecap="round" fill="none"/>` (nét NGANG THẲNG, không cong); toàn bộ svg thêm group bọc `opacity="0.88"`. KHÔNG đổi công thức halo/spark (độ mờ do consumer set `--rangi-glow` thấp).
- `firefly-greeting`: thân nghiêng nhẹ `rotate(6 48 48)`; một râu vẫy ra ngoài: râu trái đổi thành `M44 20 Q40 13 34 13`; thêm 2 lấp lánh cạnh đầu: `<path d="M28 18v4M26 20h4M66 12v4M64 14h4" stroke="var(--rangi-spark, #F5A623)" stroke-width="1.5" stroke-linecap="round" fill="none"/>`.

- [ ] **Step 1: Viết 4 file theo bản chuẩn + biến đổi**
- [ ] **Step 2: Chạy gate**

Run: `pnpm brand:check`
Expected: `brand:check PASS: 40 icon + 4 mascot đạt chuẩn` (lần đầu toàn bộ xanh), exit 0.

- [ ] **Step 3: Thêm vào `preview-icons.html` hàng mascot (2 nền) kèm slider:**

```html
<div class="row light" id="mascot-light"></div>
<div class="row dark" id="mascot-dark"></div>
<label
  >--rangi-glow
  <input
    type="range"
    min="0"
    max="1"
    step="0.05"
    value="1"
    oninput="document.querySelectorAll('.mascot-obj').forEach(o=>o.contentDocument?.documentElement.style.setProperty('--rangi-glow',this.value))"
/></label>
<script>
  for (const mode of ["light", "dark"]) {
    document.getElementById(`mascot-${mode}`).innerHTML = [
      "firefly-glowing",
      "firefly-flying",
      "firefly-resting",
      "firefly-greeting",
    ]
      .map(
        (n) =>
          `<figure><object class="mascot-obj" data="../../public/brand/mascot/${n}.svg" type="image/svg+xml" style="width:96px;height:96px"></object><figcaption>${n}</figcaption></figure>`,
      )
      .join("");
  }
</script>
```

(dùng `<object>` thay `<img>` để CSS var `--rangi-glow` chỉnh được từ ngoài)

- [ ] **Step 4: Soi bằng browser cả 2 nền: kéo slider 0→1 thấy đốm mờ/sáng mượt; đối chiếu checklist cấm — mắt r=1.3 (không to), pose nghỉ mắt ngang thẳng (không cong xuống), không biểu cảm buồn**
- [ ] **Step 5: Commit**

```bash
git add public/brand/mascot/ scripts/brand/preview-icons.html
git commit -m "feat: geometric firefly mascot pose sheet"
```

---

### Task 9: Pattern nền 2 mode (sinh từ code)

**Files:**

- Modify: `frontend/scripts/brand/generate-logo.mjs`
- Modify: `frontend/scripts/brand/generated-files.test.mjs`

**Interfaces:**

- Consumes: `flightPathEl`, `sparkEl` (Task 2).
- Produces: `frontend/public/brand/pattern-light.svg`, `pattern-dark.svg` — tile 240×240 seamless.

- [ ] **Step 1: Thêm test đỏ vào `generated-files.test.mjs`**

```js
describe("patterns", () => {
  it.each(["pattern-light.svg", "pattern-dark.svg"])(
    "%s là tile 240 seamless",
    (f) => {
      const s = read(f);
      expect(s).toContain('viewBox="0 0 240 240"');
      expect(s).toContain("stroke-dasharray");
      // seamless: path vẽ 3 bản lệch -240/0/+240 theo trục x
      expect(s).toContain('transform="translate(-240 0)"');
      expect(s).toContain('transform="translate(240 0)"');
    },
  );
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ (ENOENT)**
- [ ] **Step 3: Thêm vào generator (sau phần flight-path)**

```js
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
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${spark}" opacity="${sparkOp}"/>`,
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
```

- [ ] **Step 4: Generate + test xanh; soi bằng browser: trang tạm đặt `background: url(pattern-light.svg) repeat` trên nền kem và bản dark trên nền đêm rừng — mối nối tile không lộ, pattern không tranh chữ đặt đè lên**
- [ ] **Step 5: Commit**

```bash
git add scripts/brand/generate-logo.mjs scripts/brand/generated-files.test.mjs public/brand/pattern-*.svg
git commit -m "feat: seamless background patterns in two modes"
```

---

### Task 10: `RangiSplash` — bay rồi đậu thành chấm chữ i

**Files:**

- Create: `frontend/src/components/brand/RangiSplash.tsx`
- Create: `frontend/src/components/brand/rangi-splash.module.css`
- Test: `frontend/src/components/brand/RangiSplash.test.tsx`
- Modify: `frontend/src/app/page.tsx` (thay demo `RangiLogo` wordmark bằng `RangiSplash`)

**Interfaces:**

- Consumes: `WORDMARK` từ `./logo-paths` (đặc biệt `WORDMARK.i.dotCx/dotCy/dotR/haloR`), pattern THEMES giống `RangiLogo.tsx`.
- Produces: `RangiSplash({ theme: "dark" | "light", title?, className? })`.

**Cơ chế (đảm bảo DoD ≤1px bằng cấu trúc, không bằng đo tay):** đường bay là path SVG kết thúc CHÍNH XÁC tại `(dotCx, dotCy)`; đom đóm rút gọn (đốm + 2 cánh nhỏ) đi theo `animateMotion` trên path đó với `fill="freeze"` — kết thúc đứng im tại đúng tọa độ chấm. Chấm thật + quầng của wordmark bật opacity ở cuối bằng CSS animation cùng duration; chữ RANG fade-in. Reduced-motion: render tĩnh (đúng `RangiLogo` wordmark markup, không animateMotion).

- [ ] **Step 1: Viết test đỏ**

```tsx
// frontend/src/components/brand/RangiSplash.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WORDMARK } from "./logo-paths";
import { RangiSplash } from "./RangiSplash";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("prefers-reduced-motion") ? matches : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

describe("RangiSplash", () => {
  it("đường bay kết thúc đúng tọa độ chấm chữ i của generator", () => {
    mockReducedMotion(false);
    const { container } = render(<RangiSplash theme="light" />);
    const mpath = container.querySelector("#splash-flight");
    expect(mpath).not.toBeNull();
    const d = mpath!.getAttribute("d")!;
    expect(d.endsWith(`${WORDMARK.i.dotCx} ${WORDMARK.i.dotCy}`)).toBe(true);
    expect(container.querySelector("animateMotion")).not.toBeNull();
  });
  it("prefers-reduced-motion: không có chuyển động, wordmark hiện tĩnh", () => {
    mockReducedMotion(true);
    const { container } = render(<RangiSplash theme="light" />);
    expect(container.querySelector("animateMotion")).toBeNull();
    expect(screen.getByRole("img", { name: "Rangi" })).toBeDefined();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ đúng lý do**

Run: `pnpm exec vitest run src/components/brand/RangiSplash.test.tsx`
Expected: FAIL — `Cannot find module './RangiSplash'`.

- [ ] **Step 3: Viết component + CSS**

```tsx
// frontend/src/components/brand/RangiSplash.tsx
"use client";
import { useEffect, useState } from "react";
import { WORDMARK } from "./logo-paths";
import styles from "./rangi-splash.module.css";

const THEMES = {
  dark: { text: "#FBF6EA", dot: "#F5A623", halo: "#F5A623", wing: "#84DEBE" },
  light: { text: "#0A2E26", dot: "#EF8D08", halo: "#F5A623", wing: "#0E7A5A" },
} as const;
const DURATION_S = 2.2;

export interface RangiSplashProps {
  theme: keyof typeof THEMES;
  title?: string;
  className?: string;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function RangiSplash({
  theme,
  title = "Rangi",
  className,
}: RangiSplashProps) {
  const c = THEMES[theme];
  const W = WORDMARK;
  const reduced = useReducedMotion();
  // Đường bay: vào từ ngoài khung trái-dưới, cong lên, KẾT THÚC đúng (dotCx, dotCy).
  const flightD = `M ${-0.3 * W.width} ${W.height * 1.15} Q ${W.width * 0.35} ${-W.height * 0.35}, ${W.i.dotCx} ${W.i.dotCy}`;
  const dur = `${DURATION_S}s`;

  if (reduced) {
    // Tĩnh hoàn toàn — cùng markup wordmark, không animation.
    return (
      <svg
        viewBox={`0 0 ${W.width} ${W.height}`}
        role="img"
        aria-label={title}
        className={className}
      >
        <title>{title}</title>
        <circle
          cx={W.i.dotCx}
          cy={W.i.dotCy}
          r={W.i.haloR}
          fill={c.halo}
          opacity={0.28}
        />
        <circle cx={W.i.dotCx} cy={W.i.dotCy} r={W.i.dotR} fill={c.dot} />
        <rect
          x={W.i.stemX}
          y={W.i.stemY}
          width={W.i.stemW}
          height={W.i.stemH}
          rx={W.i.rx}
          fill={c.text}
        />
        {W.glyphs.map((g, idx) => (
          <g
            key={idx}
            transform={`translate(${W.padX + g.tx} ${W.baseline + g.ty}) scale(${W.glyphScale} ${-W.glyphScale})`}
          >
            <path d={g.d} fill={c.text} />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W.width} ${W.height}`}
      role="img"
      aria-label={title}
      className={[styles.splash, className ?? ""].join(" ").trim()}
      style={{ ["--splash-dur" as string]: dur }}
    >
      <title>{title}</title>
      <path
        id="splash-flight"
        d={flightD}
        fill="none"
        stroke={c.halo}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 7"
        className={styles.trail}
      />
      {/* wordmark hiện dần */}
      <g className={styles.reveal}>
        <rect
          x={W.i.stemX}
          y={W.i.stemY}
          width={W.i.stemW}
          height={W.i.stemH}
          rx={W.i.rx}
          fill={c.text}
        />
        {W.glyphs.map((g, idx) => (
          <g
            key={idx}
            transform={`translate(${W.padX + g.tx} ${W.baseline + g.ty}) scale(${W.glyphScale} ${-W.glyphScale})`}
          >
            <path d={g.d} fill={c.text} />
          </g>
        ))}
      </g>
      {/* chấm + quầng thật: bật ở cuối */}
      <g className={styles.land}>
        <circle
          cx={W.i.dotCx}
          cy={W.i.dotCy}
          r={W.i.haloR}
          fill={c.halo}
          opacity={0.28}
        />
        <circle cx={W.i.dotCx} cy={W.i.dotCy} r={W.i.dotR} fill={c.dot} />
      </g>
      {/* đom đóm rút gọn bay theo path rồi đứng im (freeze) đúng tại chấm */}
      <g className={styles.flier}>
        <g>
          <ellipse
            cx="0"
            cy="0"
            rx={W.i.dotR * 0.7}
            ry={W.i.dotR * 0.9}
            fill={c.dot}
          />
          <ellipse
            cx={-W.i.dotR * 0.9}
            cy={-W.i.dotR * 0.5}
            rx={W.i.dotR * 0.45}
            ry={W.i.dotR * 0.95}
            fill={c.wing}
            opacity="0.7"
            transform={`rotate(-30 ${-W.i.dotR * 0.9} ${-W.i.dotR * 0.5})`}
          />
          <ellipse
            cx={W.i.dotR * 0.9}
            cy={-W.i.dotR * 0.5}
            rx={W.i.dotR * 0.45}
            ry={W.i.dotR * 0.95}
            fill={c.wing}
            opacity="0.7"
            transform={`rotate(30 ${W.i.dotR * 0.9} ${-W.i.dotR * 0.5})`}
          />
          <animateMotion
            dur={dur}
            fill="freeze"
            calcMode="spline"
            keySplines="0.3 0 0.2 1"
            keyTimes="0;1"
            keyPoints="0;1"
            path={flightD}
          />
        </g>
      </g>
    </svg>
  );
}
```

```css
/* frontend/src/components/brand/rangi-splash.module.css */
.reveal {
  opacity: 0;
  animation: splash-reveal calc(var(--splash-dur, 2.2s) * 0.5) ease-out forwards;
  animation-delay: calc(var(--splash-dur, 2.2s) * 0.35);
}
.land {
  opacity: 0;
  animation: splash-land 0.3s ease-out forwards;
  animation-delay: calc(var(--splash-dur, 2.2s) * 0.92);
}
.flier {
  animation: splash-flier-out 0.3s ease-out forwards;
  animation-delay: calc(var(--splash-dur, 2.2s) * 0.95);
}
.trail {
  opacity: 0.5;
  animation: splash-trail-out 0.6s ease-out forwards;
  animation-delay: calc(var(--splash-dur, 2.2s) * 0.9);
}
@keyframes splash-reveal {
  to {
    opacity: 1;
  }
}
@keyframes splash-land {
  to {
    opacity: 1;
  }
}
@keyframes splash-flier-out {
  to {
    opacity: 0;
  }
}
@keyframes splash-trail-out {
  to {
    opacity: 0;
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận xanh**

Run: `pnpm exec vitest run src/components/brand/RangiSplash.test.tsx`
Expected: PASS 2/2.

- [ ] **Step 5: Tích hợp trang chủ** — trong `frontend/src/app/page.tsx`, thay `<RangiLogo variant="wordmark" theme="light" />` bằng `<RangiSplash theme="light" />` (import từ `@/components/brand/RangiSplash`; giữ import RangiLogo nếu còn dùng chỗ khác, xóa nếu không).

- [ ] **Step 6: Verify bằng browser tool** — chạy dev server (lệnh `dev-start` ở gốc repo hoặc `pnpm dev` trong frontend), mở trang chủ: đom đóm bay vào theo đường cong, chữ RANG hiện dần, đậu xuống — sau khi đứng im, đốm sáng nằm đúng chấm chữ i (zoom kiểm tra); bật emulate `prefers-reduced-motion: reduce` (browser tool resize/emulation hoặc DevTools) + reload: logo hiện tĩnh ngay, không chuyển động. Chụp screenshot làm bằng chứng.

- [ ] **Step 7: Chạy toàn bộ test + commit**

```bash
pnpm test
git add src/components/brand/RangiSplash.tsx src/components/brand/rangi-splash.module.css src/components/brand/RangiSplash.test.tsx src/app/page.tsx
git commit -m "feat: RangiSplash land-on-the-i splash animation"
```

Expected `pnpm test`: PASS toàn bộ (bao gồm các test cũ — không hỏng RangiLogo/Health).

---

### Task 11: Tài liệu, review hai trục, verify DoD, merge

**Files:**

- Modify: `docs/brand/so-tay-thuong-hieu-rangi.md` (thêm mục 3.4 dưới đây)
- Modify: `docs/README.md` (dòng index plan; cập nhật trạng thái spec)
- Modify: `docs/specs/2026-08-05-goi-mo-rong-nhan-dien-svg.md` (trạng thái → đã thực thi)

- [ ] **Step 1: Thêm mục 3.4 vào sổ tay thương hiệu** (sau mục 3.3, nguyên văn):

```markdown
### 3.4 Kho asset và cách dùng (bổ sung sau khi thực thi gói SVG 05/08/2026)

Tất cả nằm trong `frontend/public/brand/`:

| Nhóm       | File                            | Dùng cho                                | Quy tắc                                                                |
| ---------- | ------------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Icon UI    | `icons/outline/*.svg` (20)      | mặc định trong UI                       | màu qua `currentColor`; accent hổ phách tự có trong file               |
| Icon UI    | `icons/filled/*.svg` (20)       | trạng thái active/nhấn mạnh             | cùng silhouette với bản outline cùng tên                               |
| Mascot     | `mascot/firefly-*.svg` (4 pose) | minh họa, empty state, onboarding       | KHÔNG dùng trong logo; độ sáng chỉnh bằng CSS var `--rangi-glow` (0→1) |
| Đường bay  | `flight-path-*.svg`             | trang trí section, kể chuyện bay-và-đậu | sinh từ code, sửa tham số trong `generate-logo.mjs`                    |
| Pattern    | `pattern-{light,dark}.svg`      | nền section, tương phản thấp            | tile 240px, `background-repeat` cả hai chiều                           |
| Lockup dọc | `rangi-lockup-vertical-*.svg`   | không gian đứng (poster, story, bìa)    | không tự chế biến thể mới ngoài generator                              |

Gate chất lượng: `pnpm brand:check` (chạy trong `frontend/`) — icon/mascot sai chuẩn (viewBox, hex trần, tên ngoài danh mục) sẽ fail CI. Thêm icon mới = thêm tên vào `ICON_MANIFEST` trong `scripts/brand/check-icons.mjs` + vẽ đủ HAI bộ outline/filled.
```

- [ ] **Step 2: Cập nhật index + trạng thái spec** — `docs/README.md`: thêm dòng plan vào mục plans/ (`— plan 11 task: motifs module, flight path, lockup dọc, checker, 40 icon, mascot, pattern, RangiSplash`), sửa dòng spec thành `(TRẠNG THÁI: đã thực thi …)`; file spec sửa dòng Trạng thái tương ứng.

- [ ] **Step 3: Verify DoD toàn cục — chạy và DÁN OUTPUT từng lệnh:**

```bash
cd frontend && pnpm brand:generate && pnpm brand:generate && git status --short   # DoD 1: deterministic, không diff
pnpm brand:check                                                                   # DoD 2: PASS 40 icon + 4 mascot
pnpm test                                                                          # DoD 5: toàn bộ xanh
```

DoD 3 + 4: đối chiếu screenshot browser đã chụp ở Task 6/8/9/10 (2 nền × icon/mascot/pattern; splash đậu đúng chấm; reduced-motion tĩnh).

- [ ] **Step 4: Dispatch subagent code-reviewer** (`.claude/agents/code-reviewer.md`, context sạch) trên diff `main...feat/brand-svg-extension` — review hai trục; sửa finding nghiêm trọng, ghi nhận finding bỏ qua kèm lý do.

- [ ] **Step 5: Commit docs + merge**

```bash
git add docs/ && git commit -m "docs: brand asset usage guide + plan index"
git checkout main && git merge feat/brand-svg-extension && git push
```

(Nếu người dùng muốn xem trước khi merge — dừng ở push nhánh và báo.)

---

## Self-Review (đã chạy khi viết plan)

- **Spec coverage**: A→Task 8, B→Task 2+3, C→Task 4, D→Task 5+6+7, E→Task 9, F→Task 10; DoD 1-6→Task 11 Step 3 + các gate từng task. Ràng buộc §4 spec nằm trong Global Constraints + hợp đồng phong cách.
- **Placeholder scan**: mọi bước code đều có nội dung thật; 17 icon không viết nguyên văn SVG là chủ đích của spec (asset sáng tạo vẽ theo hợp đồng + ẩn dụ cụ thể từng icon + gate `brand:check` + soi mắt bằng preview) — không phải placeholder quy trình.
- **Type consistency**: `flightPathEl/flightPathD/sparkEl` (Task 2) khớp cách gọi Task 3/9; `checkSvg/ICON_MANIFEST/MASCOT_MANIFEST` (Task 5) khớp Task 6-8; `WORDMARK.i.*` khớp `logo-paths.ts` hiện có; `RangiSplashProps.theme` chỉ dark/light (mono không có splash — chủ đích).
