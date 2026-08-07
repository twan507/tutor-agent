# Bộ icon Tabler — Implementation Plan

> **Cho agent thực thi:** dùng `superpowers:subagent-driven-development` hoặc `superpowers:executing-plans`. Mỗi bước có checkbox để đánh dấu.

**Goal:** Thay 42 icon tự vẽ bằng 220 file SVG sinh từ Tabler Icons theo `docs/specs/2026-08-07-bo-icon-tabler.md`.

**Architecture:** Một manifest dữ liệu (`icon-manifest.mjs`) là nguồn sự thật duy nhất cho cả generator lẫn checker. Generator đọc `@iconify-json/tabler` (offline), đổi `stroke-width` sang chuẩn brand, ghi file. Checker dẫn xuất hai danh sách từ manifest và kiểm cả file lẫn chính manifest.

**Tech Stack:** Node ESM, `@iconify-json/tabler@1.2.38`, Vitest, pnpm.

## Global Constraints

Áp cho mọi task, không nhắc lại trong từng task:

- `stroke-width` outline = **1.75** (Tabler mặc định 2). `viewBox="0 0 24 24"`.
- Màu **chỉ `currentColor`** — cấm hex trần, cấm nướng accent hổ phách vào file.
- Mọi file sinh ra kết thúc dòng bằng **`\n`**, không CRLF.
- **Không tự vẽ icon nào**, không sửa hình học path lấy từ Tabler.
- Không đụng mascot, logo, wordmark.
- Version Tabler **pin cứng 1.2.38** trong `package.json`.
- Mọi lệnh chạy trong `frontend/`.

---

### Task 1: Thêm dependency và sinh manifest

**Files:**

- Modify: `frontend/package.json` (devDependencies + script `brand:icons`)
- Create: `frontend/scripts/brand/icon-manifest.mjs`

**Interfaces:**

- Produces: `export const ICONS` — object `{ [concept]: { tabler: string, filled: boolean, group: string } }`, 127 khoá. `export const ALIASES` — object `{ [alias]: concept }`, 4 khoá.

- [ ] **Step 1: Cài dependency**

```bash
cd frontend && pnpm add -D -E @iconify-json/tabler@1.2.38
```

Kiểm: `grep tabler package.json` phải thấy `"@iconify-json/tabler": "1.2.38"` (không có `^`).

- [ ] **Step 2: Viết script một lần để sinh manifest từ bảng §9 của spec**

Tạo `frontend/scripts/brand/tmp-gen-manifest.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SPEC = path.resolve(
  DIR,
  "../../../docs/specs/2026-08-07-bo-icon-tabler.md",
);
const md = fs.readFileSync(SPEC, "utf8");

const rows = md
  .split("\n")
  .filter(
    (l) =>
      /^\|\s+\S/.test(l) &&
      l.includes("`") &&
      /(outline \+ filled|chỉ outline)/.test(l),
  );

const entries = rows.map((l) => {
  const c = l.split("|").map((x) => x.trim());
  return [
    c[2].replace(/`/g, ""),
    {
      tabler: c[3].replace(/`/g, ""),
      filled: c[4] === "outline + filled",
      group: c[1],
    },
  ];
});

const aliasRows = md
  .split("\n")
  .filter((l) => /^- `.+` → `.+`$/.test(l.trim()))
  .map((l) =>
    l
      .trim()
      .match(/^- `(.+)` → `(.+)`$/)
      .slice(1, 3),
  );

const body =
  "// Nguồn sự thật duy nhất cho generate-icons.mjs và check-icons.mjs.\n" +
  "// Sinh lần đầu từ docs/specs/2026-08-07-bo-icon-tabler.md §9, sau đó sửa tay.\n" +
  "// Thêm icon mới = thêm một dòng ở đây rồi chạy `pnpm brand:icons`. KHÔNG tự vẽ.\n\n" +
  "export const ICONS = " +
  JSON.stringify(Object.fromEntries(entries), null, 2) +
  ";\n\nexport const ALIASES = " +
  JSON.stringify(Object.fromEntries(aliasRows), null, 2) +
  ";\n";

fs.writeFileSync(path.join(DIR, "icon-manifest.mjs"), body);
console.log("ICONS:", entries.length, "| ALIASES:", aliasRows.length);
```

- [ ] **Step 3: Chạy và kiểm số lượng**

```bash
cd frontend && node scripts/brand/tmp-gen-manifest.mjs
```

Expected: `ICONS: 127 | ALIASES: 4`. Nếu khác 127/4 thì DỪNG — bảng spec bị parse sai, không sửa tay manifest để "cho đủ".

- [ ] **Step 4: Kiểm nội dung manifest**

```bash
cd frontend && node -e "
import('./scripts/brand/icon-manifest.mjs').then(({ICONS,ALIASES})=>{
  const v=Object.values(ICONS);
  console.log('khái niệm',Object.keys(ICONS).length,'| filled',v.filter(i=>i.filled).length,'| chỉ outline',v.filter(i=>!i.filled).length);
  console.log('nhóm:',[...new Set(v.map(i=>i.group))].length);
  console.log('alias:',JSON.stringify(ALIASES));
});"
```

Expected: `khái niệm 127 | filled 93 | chỉ outline 34`, `nhóm: 9`, alias đúng 4 cặp `success/privacy/timer/expand`.

- [ ] **Step 5: Xóa script tạm và thêm script npm**

```bash
cd frontend && rm scripts/brand/tmp-gen-manifest.mjs
```

Thêm vào `"scripts"` trong `frontend/package.json`, ngay sau dòng `brand:png`:

```json
"brand:icons": "node scripts/brand/generate-icons.mjs",
```

- [ ] **Step 6: Format và commit**

```bash
cd frontend && pnpm exec prettier --write scripts/brand/icon-manifest.mjs package.json && pnpm format:check
git add frontend/package.json frontend/pnpm-lock.yaml frontend/scripts/brand/icon-manifest.mjs
git commit -m "feat: add tabler icon set dependency and the icon manifest"
```

---

### Task 2: Rule mức manifest (TDD)

**Files:**

- Create: `frontend/scripts/brand/check-manifest.mjs`
- Create: `frontend/scripts/brand/check-manifest.test.mjs`

**Interfaces:**

- Consumes: `ICONS`, `ALIASES` từ Task 1.
- Produces: `export function checkManifest(icons, aliases)` → trả về `string[]` (mảng thông báo lỗi, rỗng nghĩa là đạt). Nhận tham số để test được với dữ liệu dựng sẵn, KHÔNG đọc file bên trong.

- [ ] **Step 1: Viết test đỏ**

Tạo `frontend/scripts/brand/check-manifest.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { checkManifest } from "./check-manifest.mjs";
import { ICONS, ALIASES } from "./icon-manifest.mjs";

const ok = {
  a: { tabler: "x", filled: true, group: "G" },
  b: { tabler: "y", filled: false, group: "G" },
};

describe("checkManifest", () => {
  it("manifest hợp lệ không có lỗi nào", () => {
    expect(checkManifest(ok, { c: "a" })).toEqual([]);
  });

  it("bắt hai khái niệm trỏ cùng một tên Tabler", () => {
    const bad = {
      a: { tabler: "x", filled: true, group: "G" },
      b: { tabler: "x", filled: true, group: "G" },
    };
    const errs = checkManifest(bad, {});
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain("x");
    expect(errs[0]).toContain("a");
    expect(errs[0]).toContain("b");
  });

  it("bắt alias trỏ vào khái niệm không tồn tại", () => {
    const errs = checkManifest(ok, { z: "khong-co" });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain("khong-co");
  });

  it("bắt alias trùng tên một khái niệm", () => {
    const errs = checkManifest(ok, { a: "b" });
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain("a");
  });

  it("manifest thật của dự án đạt cả ba rule", () => {
    expect(checkManifest(ICONS, ALIASES)).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ ĐÚNG LÝ DO**

```bash
cd frontend && pnpm exec vitest run scripts/brand/check-manifest.test.mjs
```

Expected: FAIL vì `check-manifest.mjs` chưa tồn tại (`Failed to resolve import`). Nếu đỏ vì lý do khác thì dừng lại đọc kỹ.

- [ ] **Step 3: Viết implementation tối thiểu**

Tạo `frontend/scripts/brand/check-manifest.mjs`:

```js
// Ba rule mức manifest (spec §5.5). Nhận tham số để test được độc lập.
export function checkManifest(icons, aliases) {
  const errors = [];
  const seen = new Map();
  for (const [concept, def] of Object.entries(icons)) {
    const prev = seen.get(def.tabler);
    if (prev)
      errors.push(
        `trùng hình: "${prev}" và "${concept}" cùng trỏ tới "${def.tabler}"`,
      );
    else seen.set(def.tabler, concept);
  }
  for (const [alias, target] of Object.entries(aliases)) {
    if (icons[alias])
      errors.push(`alias "${alias}" trùng tên một khái niệm có thật`);
    else if (!icons[target])
      errors.push(
        `alias "${alias}" trỏ tới khái niệm không tồn tại: "${target}"`,
      );
  }
  return errors;
}
```

- [ ] **Step 4: Chạy test, xác nhận xanh**

```bash
cd frontend && pnpm exec vitest run scripts/brand/check-manifest.test.mjs
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts/brand/check-manifest.mjs frontend/scripts/brand/check-manifest.test.mjs
git commit -m "feat: manifest-level rules for the icon set"
```

---

### Task 3: Generator (TDD)

**Files:**

- Create: `frontend/scripts/brand/generate-icons.mjs`
- Create: `frontend/scripts/brand/generate-icons.test.mjs`

**Interfaces:**

- Consumes: `ICONS` (Task 1).
- Produces:
  - `export function resolveBody(set, name)` → `string | null`
  - `export function buildOutline(concept, tablerName, set)` → `string` (nội dung SVG, kết thúc `\n`); **throw** nếu không tìm thấy icon nguồn
  - `export function buildFilled(concept, tablerName, set)` → `string`; **throw** nếu không có bản `-filled`

`set` là object `icons.json` của Tabler, truyền vào để test được bằng dữ liệu giả.

- [ ] **Step 1: Viết test đỏ**

Tạo `frontend/scripts/brand/generate-icons.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { buildFilled, buildOutline, resolveBody } from "./generate-icons.mjs";

const SET = {
  icons: {
    demo: {
      body: '<path fill="none" stroke="currentColor" stroke-width="2" d="M1 1h2"/>',
    },
    "demo-filled": { body: '<path fill="currentColor" d="M1 1h2z"/>' },
    real: {
      body: '<path fill="none" stroke="currentColor" stroke-width="2" d="M0 0"/>',
    },
  },
  aliases: { "demo-alias": { parent: "demo" } },
};

describe("resolveBody", () => {
  it("lấy được icon theo tên trực tiếp", () => {
    expect(resolveBody(SET, "demo")).toContain('d="M1 1h2"');
  });
  it("lấy được icon qua alias của bộ nguồn", () => {
    expect(resolveBody(SET, "demo-alias")).toContain('d="M1 1h2"');
  });
  it("trả null khi không có", () => {
    expect(resolveBody(SET, "khong-co")).toBeNull();
  });
});

describe("buildOutline", () => {
  it("đổi stroke-width 2 thành 1.75 và bọc svg có aria-label", () => {
    const svg = buildOutline("lesson", "demo", SET);
    expect(svg).toContain('stroke-width="1.75"');
    expect(svg).not.toContain('stroke-width="2"');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="lesson"');
    expect(svg.endsWith("\n")).toBe(true);
    expect(svg).not.toContain("\r");
  });
  it("ném lỗi nêu đích danh khái niệm khi icon nguồn không tồn tại", () => {
    expect(() => buildOutline("lesson", "khong-co", SET)).toThrow(
      /lesson.*khong-co|khong-co.*lesson/s,
    );
  });
});

describe("buildFilled", () => {
  it("dùng bản -filled và giữ fill currentColor", () => {
    const svg = buildFilled("lesson", "demo", SET);
    expect(svg).toContain('fill="currentColor"');
    expect(svg).toContain('aria-label="lesson"');
  });
  it("ném lỗi khi manifest đòi filled mà bộ nguồn không có", () => {
    expect(() => buildFilled("lesson", "real", SET)).toThrow(/real-filled/);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ đúng lý do**

```bash
cd frontend && pnpm exec vitest run scripts/brand/generate-icons.test.mjs
```

Expected: FAIL — không resolve được `./generate-icons.mjs`.

- [ ] **Step 3: Viết implementation**

Tạo `frontend/scripts/brand/generate-icons.mjs`:

```js
// Sinh bộ icon từ @iconify-json/tabler theo icon-manifest.mjs.
// KHÔNG sửa hình học path — chỉ đổi độ dày nét về chuẩn brand và bọc svg.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { ICONS } from "./icon-manifest.mjs";

const require = createRequire(import.meta.url);
const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(DIR, "../../public/brand/icons");
const STROKE = "1.75";

export function resolveBody(set, name) {
  if (set.icons[name]) return set.icons[name].body;
  const alias = set.aliases?.[name];
  if (alias?.parent && set.icons[alias.parent])
    return set.icons[alias.parent].body;
  return null;
}

function wrap(concept, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${concept}">` +
    `${body}</svg>\n`
  );
}

export function buildOutline(concept, tablerName, set) {
  const body = resolveBody(set, tablerName);
  if (!body)
    throw new Error(
      `khái niệm "${concept}": icon nguồn "${tablerName}" không có trong bộ Tabler`,
    );
  return wrap(
    concept,
    body.replaceAll('stroke-width="2"', `stroke-width="${STROKE}"`),
  );
}

export function buildFilled(concept, tablerName, set) {
  const name = `${tablerName}-filled`;
  const body = resolveBody(set, name);
  if (!body)
    throw new Error(
      `khái niệm "${concept}" khai filled:true nhưng bộ Tabler không có "${name}" — chọn tên khác có đủ cặp, KHÔNG tự vẽ`,
    );
  return wrap(concept, body);
}

function main() {
  const set = require("@iconify-json/tabler/icons.json");
  fs.mkdirSync(path.join(OUT, "outline"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "filled"), { recursive: true });
  let n = 0;
  for (const [concept, def] of Object.entries(ICONS)) {
    fs.writeFileSync(
      path.join(OUT, "outline", `${concept}.svg`),
      buildOutline(concept, def.tabler, set),
    );
    n++;
    if (def.filled) {
      fs.writeFileSync(
        path.join(OUT, "filled", `${concept}.svg`),
        buildFilled(concept, def.tabler, set),
      );
      n++;
    }
  }
  console.log(
    `brand:icons — đã sinh ${n} file từ ${Object.keys(ICONS).length} khái niệm`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
```

- [ ] **Step 4: Chạy test, xác nhận xanh**

```bash
cd frontend && pnpm exec vitest run scripts/brand/generate-icons.test.mjs
```

Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts/brand/generate-icons.mjs frontend/scripts/brand/generate-icons.test.mjs
git commit -m "feat: icon generator that fails loudly instead of silently skipping"
```

---

### Task 4: Checker đọc manifest (TDD)

**Files:**

- Modify: `frontend/scripts/brand/check-icons.mjs` (thay `ICON_MANIFEST` cứng ở dòng 8-29, sửa `checkSvg`, sửa `main`)
- Modify: `frontend/scripts/brand/check-icons.test.mjs` (bỏ assert `toHaveLength(21)` ở dòng 81 và test rule accent ở dòng 24-32)

**Interfaces:**

- Consumes: `ICONS`, `ALIASES` (Task 1), `checkManifest` (Task 2).
- Produces: `export const ICON_MANIFEST` = mảng 127 tên đã sort; `export const FILLED_MANIFEST` = mảng 93 tên đã sort; `checkSvg(name, content, kind)` giữ nguyên chữ ký cũ.

- [ ] **Step 1: Viết test đỏ cho rule mới**

Thêm vào cuối `frontend/scripts/brand/check-icons.test.mjs`:

```js
import { FILLED_MANIFEST } from "./check-icons.mjs";
import { ICONS } from "./icon-manifest.mjs";

describe("manifest dẫn xuất từ icon-manifest.mjs", () => {
  it("outline phủ toàn bộ khái niệm, filled chỉ phủ khái niệm khai filled", () => {
    expect(ICON_MANIFEST).toHaveLength(127);
    expect(FILLED_MANIFEST).toHaveLength(93);
    expect(FILLED_MANIFEST.every((n) => ICONS[n].filled)).toBe(true);
    expect(ICON_MANIFEST).toEqual([...ICON_MANIFEST].sort());
  });

  it("outline thiếu aria-label thì fail", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img"><path fill="none" stroke="currentColor" stroke-width="1.75" d="M0 0"/></svg>';
    expect(checkSvg("lesson", svg, "outline").join(" ")).toContain(
      "aria-label",
    );
  });

  it("outline sai độ dày nét thì fail", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="lesson"><path fill="none" stroke="currentColor" stroke-width="2" d="M0 0"/></svg>';
    expect(checkSvg("lesson", svg, "outline").join(" ")).toContain("1.75");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận đỏ đúng lý do**

```bash
cd frontend && pnpm exec vitest run scripts/brand/check-icons.test.mjs
```

Expected: FAIL — `FILLED_MANIFEST` chưa export, và assert cũ `toHaveLength(21)` cũng đỏ vì manifest nay 127.

- [ ] **Step 3: Sửa checker**

Trong `frontend/scripts/brand/check-icons.mjs`, thay khối `ICON_MANIFEST` cứng bằng:

```js
import { ICONS, ALIASES } from "./icon-manifest.mjs";
import { checkManifest } from "./check-manifest.mjs";

export const ICON_MANIFEST = Object.keys(ICONS).sort();
export const FILLED_MANIFEST = Object.keys(ICONS)
  .filter((n) => ICONS[n].filled)
  .sort();
```

Trong `checkSvg`, phần `kind !== "mascot"` thêm hai rule:

```js
if (!content.includes(`aria-label="${name}"`))
  errors.push(`${name}: thiếu aria-label đúng tên khái niệm`);
if (kind === "outline" && !content.includes('stroke-width="1.75"'))
  errors.push(`${name}: outline phải có stroke-width="1.75"`);
```

Trong `main`, dùng đúng manifest cho từng thư mục và chạy rule manifest trước:

```js
const manifestErrors = checkManifest(ICONS, ALIASES);
const errors = [
  ...manifestErrors,
  ...checkDir(
    path.join(FE, "public/brand/icons/outline"),
    "outline",
    ICON_MANIFEST,
  ),
  ...checkDir(
    path.join(FE, "public/brand/icons/filled"),
    "filled",
    FILLED_MANIFEST,
  ),
  ...checkDir(path.join(FE, "public/brand/mascot"), "mascot", MASCOT_MANIFEST),
];
```

Sửa dòng in kết quả cuối cho khớp số thật:

```js
`brand:check PASS: ${ICON_MANIFEST.length} outline + ${FILLED_MANIFEST.length} filled + ${MASCOT_MANIFEST.length} mascot đạt chuẩn`;
```

Trong `check-icons.test.mjs` xóa test rule accent (dòng 24-32 cũ, cái dùng `var(--icon-accent`) và sửa assert cũ `expect(ICON_MANIFEST).toHaveLength(21)` thành 127.

- [ ] **Step 4: Chạy test, xác nhận xanh**

```bash
cd frontend && pnpm exec vitest run scripts/brand/
```

Expected: toàn bộ file test trong `scripts/brand/` pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/scripts/brand/check-icons.mjs frontend/scripts/brand/check-icons.test.mjs
git commit -m "feat: brand:check reads the manifest instead of a hardcoded list"
```

---

### Task 5: Xóa bộ cũ, sinh bộ mới

**Files:**

- Delete: `frontend/public/brand/icons/outline/*.svg` (21), `frontend/public/brand/icons/filled/*.svg` (21), `frontend/scripts/brand/proto-v2/icons/` (42)
- Create: 220 file trong `frontend/public/brand/icons/{outline,filled}/`

- [ ] **Step 1: Xóa bộ tự vẽ**

```bash
git rm -q -r frontend/public/brand/icons/outline frontend/public/brand/icons/filled frontend/scripts/brand/proto-v2/icons
```

- [ ] **Step 2: Sinh bộ mới**

```bash
cd frontend && pnpm brand:icons
```

Expected: `brand:icons — đã sinh 220 file từ 127 khái niệm`.

- [ ] **Step 3: Kiểm số file và kết thúc dòng**

```bash
cd frontend && ls public/brand/icons/outline | wc -l && ls public/brand/icons/filled | wc -l
git add frontend/public/brand/icons && git ls-files --eol frontend/public/brand/icons | grep -v "w/lf" | head
```

Expected: `127`, `93`, và lệnh `grep` **không in dòng nào** (mọi file đều `w/lf`).

- [ ] **Step 4: Kiểm tính lặp lại**

```bash
cd frontend && pnpm brand:icons && git diff --stat frontend/public/brand/icons
```

Expected: `git diff` rỗng — chạy hai lần cho kết quả byte-identical.

- [ ] **Step 5: Chạy gate**

```bash
cd frontend && pnpm brand:check && pnpm test && pnpm lint && pnpm format:check
```

Expected: `brand:check PASS: 127 outline + 93 filled + 6 mascot đạt chuẩn`; test xanh; lint 0 error; format xanh.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/public/brand/icons frontend/scripts/brand/proto-v2
git commit -m "feat: replace the hand-drawn icon set with 220 generated Tabler icons"
```

---

### Task 6: Giấy phép, tài liệu, trang preview

**Files:**

- Create: `frontend/public/brand/icons/LICENSE.txt`
- Modify: `frontend/public/brand/README.md`, `docs/brand/so-tay-thuong-hieu-rangi.md` (dòng 155-156 và 167), `frontend/scripts/brand/preview-icons.html`, `TASKS.md`, `docs/README.md`

- [ ] **Step 1: Thêm giấy phép**

Tạo `frontend/public/brand/icons/LICENSE.txt` với nguyên văn giấy phép MIT của Tabler, lấy từ `frontend/node_modules/@iconify-json/tabler/` (trường `license` trong `info.json` và link repo), kèm hai dòng đầu:

```
Bộ icon trong thư mục này sinh từ Tabler Icons 1.2.38 (https://tabler.io/icons)
Giấy phép MIT. Nguyên văn:
```

- [ ] **Step 2: Sửa sổ tay thương hiệu**

Trong `docs/brand/so-tay-thuong-hieu-rangi.md`, hai dòng bảng icon (155-156) đổi thành nguồn Tabler, số lượng 127 outline / 93 filled, bỏ mệnh đề "accent hổ phách tự có trong file" (nay accent do component quyết). Dòng 167 đổi mệnh đề "thêm icon mới = thêm tên vào `ICON_MANIFEST` + vẽ đủ HAI bộ" thành "thêm icon mới = thêm một dòng vào `scripts/brand/icon-manifest.mjs` rồi chạy `pnpm brand:icons`; TUYỆT ĐỐI không tự vẽ".

- [ ] **Step 3: Sửa README asset**

Trong `frontend/public/brand/README.md`, thêm mục icon: nguồn Tabler 1.2.38 (MIT), 127 khái niệm / 220 file, sinh bằng `pnpm brand:icons`, không sửa tay, trỏ tới `icons/LICENSE.txt`.

- [ ] **Step 4: Sửa trang preview**

Trang này mở trực tiếp bằng `file://` nên **không** `import` hay `fetch` được file cục bộ (trình duyệt chặn CORS) — mảng tên phải nằm sẵn trong HTML. Vậy để **generator sinh luôn trang preview** thay vì sửa tay: thêm vào cuối `main()` của `generate-icons.mjs`:

```js
const tpl = fs.readFileSync(
  path.join(DIR, "preview-icons.template.html"),
  "utf8",
);
const groups = {};
for (const [concept, def] of Object.entries(ICONS))
  (groups[def.group] ??= []).push(concept);
fs.writeFileSync(
  path.join(DIR, "preview-icons.html"),
  tpl.replace("/*__GROUPS__*/", JSON.stringify(groups, null, 2)),
);
```

Đổi tên file hiện tại thành `preview-icons.template.html`, trong đó thay mảng `names` hardcode bằng `const GROUPS = /*__GROUPS__*/;` rồi lặp theo từng nhóm, và sửa danh sách mascot đang còn `firefly-flying` đã bị xóa thành `["firefly-glowing", "firefly-resting", "firefly-greeting"]`. Thêm `preview-icons.html` vào `.prettierignore` vì nó là file sinh ra (cùng lý do với `mockup-rangi-v2.html`).

- [ ] **Step 5: Cập nhật backlog và chỉ mục**

`TASKS.md`: đóng mục "Tinh chỉnh icon v2", ghi ngày và kết quả. `docs/README.md`: đổi trạng thái dòng spec thành "đã thực thi 07/08/2026" và thêm dòng cho plan này.

- [ ] **Step 6: Kiểm và commit**

```bash
cd frontend && pnpm format:check && grep -rn "vẽ đủ HAI bộ\|accent hổ phách tự có" ../docs ../CLAUDE.md || echo "sạch"
git add -A && git commit -m "docs: point every document at the generated Tabler icon set"
```

Expected: `grep` in ra `sạch`.

---

### Task 7: Review và verify

- [ ] **Step 1: Chạy toàn bộ gate lần cuối**

```bash
cd frontend && pnpm brand:icons && pnpm brand:check && pnpm test && pnpm lint && pnpm format:check && pnpm build
```

Dán output thật vào báo cáo, không tóm tắt.

- [ ] **Step 2: Đối chiếu tiêu chí hoàn thành §6 của spec**

Chín tiêu chí, mỗi cái một dòng bằng chứng.

- [ ] **Step 3: Gọi subagent code-reviewer** (`.claude/agents/code-reviewer.md`, context sạch) review hai trục: Chuẩn và Spec.

- [ ] **Step 4: Xử lý finding, rồi merge về main**
