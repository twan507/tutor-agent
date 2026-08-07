// PROTOTYPE nhận diện v2 (06/08/2026) — TRẠNG THÁI: người dùng duyệt "tạm ổn, CHƯA chốt hẳn".
// Chạy: node assemble.mjs (trong thư mục này) → mockup-rangi-v2.html + mascot-v2/*.svg
//
// Giữ lại TOÀN BỘ hàm sinh SVG theo yêu cầu người dùng (không chỉ thành phẩm):
// - firefly(pose,sfx,size,bg): mascot đom đóm v2 — tỷ lệ bóc từ SVG trace người dùng cung cấp
//   (đầu Ø31.4 ≈ 1.05× bề ngang thân 28.4; thân dài/rộng 2.75; khe đầu–thân 8.3 ≈ 0.26Ø;
//   râu tách đầu, dài ≈ 0.8Ø; cánh giọt nước đầu tròn, 2 cặp gần ngang [góc,dài,rộng] theo pose)
// - petal(L,W): cánh giọt nước — root nhọn, đầu ngoài tròn bầu
// - wordmarkSVG(...): chữ "Rangi" mềm vẽ tay monoline — PHƯƠNG ÁN ĐÃ LOẠI 06/08/2026
//   (người dùng quyết giữ wordmark chính thức RANG in hoa; giữ hàm làm tư liệu tham khảo)
// Sản phẩm cuối trong mockup dùng logo CHÍNH THỨC từ ../../public/brand (không đổi).
// Chưa ổn hẳn — các điểm còn mở ghi tại docs/research/danh-gia-tham-my-mascot-icon-2026-08-05.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(p, "utf8");

// ================= WORDMARK — pure SVG, monoline rounded lettering =================
// Baseline y=100, x-height 60 (top 40), cap ~14, stroke 21, round caps/joins.
function wordmarkSVG({ ink, mint, sfx, width = 560 }) {
  const s = sfx;
  const letters = `
    <g fill="none" stroke="${ink}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round">
      <!-- R -->
      <g>
        <path d="M14 100 V16"/>
        <path d="M14 16 H36 C56 16 66 27 66 40 C66 54 55 63 34 63 H14"/>
        <path d="M40 64 C52 74 58 86 61 100"/>
      </g>
      <!-- a : bowl + distinct stem with exit curl -->
      <g transform="translate(88 0)">
        <circle cx="24" cy="72" r="24"/>
        <path d="M50 44 V85 C50 94 54 100 62 100"/>
      </g>
      <!-- n -->
      <g transform="translate(174 0)">
        <path d="M0 100 V44"/>
        <path d="M0 66 C0 50 11 42 25 42 C41 42 49 52 49 68 V100"/>
      </g>
      <!-- g : bowl + swash tail curling left with open hook -->
      <g transform="translate(240 0)">
        <circle cx="25" cy="70" r="25"/>
        <path d="M50 44 V118 C50 142 36 152 16 152 C0 152 -8 145 -7 135 C-6 127 1 123 8 126"/>
      </g>
      <!-- i stem -->
      <path d="M322 44 V100"/>
    </g>`;
  const dot = `
    <circle cx="322" cy="23" r="13" fill="url(#idot-${s})"/>
    <circle cx="322" cy="23" r="21" fill="url(#ihalo-${s})"/>`;
  const trail = `
    <g fill="${mint}">
      <circle cx="297" cy="150" r="4.4" opacity=".7"/>
      <circle cx="316" cy="136" r="6.4" opacity=".85"/>
      <circle cx="333" cy="119" r="8.4" opacity=".95"/>
    </g>`;
  return `
<svg viewBox="-18 -10 380 176" width="${width}" role="img" aria-label="Rangi" style="max-width:100%;height:auto">
  <defs>
    <radialGradient id="idot-${s}" cx="40%" cy="36%" r="75%">
      <stop offset="0%" stop-color="#FFE3A1"/><stop offset="55%" stop-color="#F5A623"/><stop offset="100%" stop-color="#EF8D08"/>
    </radialGradient>
    <radialGradient id="ihalo-${s}" cx="50%" cy="50%" r="50%">
      <stop offset="35%" stop-color="#F5A623" stop-opacity=".38"/>
      <stop offset="70%" stop-color="#F5A623" stop-opacity=".12"/>
      <stop offset="100%" stop-color="#F5A623" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${letters}
  ${dot}
  ${trail}
</svg>`;
}

// ================= FIREFLY v3 — slender, delicate wings, smooth ambient =================
// Thông số hình học mascot (chốt 07/08/2026 sau 4 vòng render-và-duyệt với người dùng)
const WING_L = 62; // dài giọt nước
const WING_W = 34; // chỗ phình rộng nhất
const WING_BEND = 14; // độ uốn cong của giọt
const WING_OFFSET = 13; // gốc cánh lệch khỏi trục dọc
const WING_ROOT_Y = 102;
const WING_GAP = 4; // khe giữa cánh và thân sau khi gọt
const WING_CUT_SOFT = 3; // làm nhòe con dao → chỗ gọt bo mềm, không cắt gắt
const HEAD_CY = 76.5; // hạ đầu xuống: khe đầu–thân 8.3 → 4.8
const HEAD_R = 15.7;
const BODY_OPACITY = 0.92; // thân + đầu hơi trong để hòa vào glow
const BODY_PATH =
  "M110 97 C102.5 98 97 104 95.8 117 C94.4 142 98 179 110 179 C122 179 125.6 142 124.2 117 C123 104 117.5 98 110 97 Z";

function firefly(pose, sfx, size = 190, bg = "dark") {
  const s = sfx;
  const light = bg === "light";
  const resting = pose === "resting";
  const greeting = pose === "greeting";

  // Cánh: GIỌT NƯỚC khép kín — gốc thon tròn, phình dần, đuôi bầu. `bend` uốn cong
  // cả giọt. Hai cặp cánh dùng CHUNG một hình (cùng L, W, bend), chỉ khác góc rủ
  // và độ đậm. Cánh lấn vào sát thân rồi được GỌT NHẸ bằng mask lấy đường bao thân
  // nở ra WING_GAP — nhờ vậy mép trong cong theo sườn thân. Con dao được làm nhòe
  // WING_CUT_SOFT nên chỗ gọt bo mềm, không để lại góc cắt gắt.
  const drop = (bend) => {
    const f = (v) => v.toFixed(2);
    const h = WING_W / 2;
    const b = (t) => bend * t;
    return (
      `M0 0 ` +
      `C${f(0.34 * h + b(0.2))} ${f(0.16 * WING_L)} ${f(h + b(0.55))} ${f(0.42 * WING_L)} ${f(h + b(0.75))} ${f(0.68 * WING_L)} ` +
      `C${f(h + b(0.9))} ${f(0.88 * WING_L)} ${f(0.55 * h + bend)} ${f(WING_L)} ${f(bend)} ${f(WING_L)} ` +
      `C${f(-0.55 * h + bend)} ${f(WING_L)} ${f(-h + b(0.9))} ${f(0.88 * WING_L)} ${f(-h + b(0.75))} ${f(0.68 * WING_L)} ` +
      `C${f(-h + b(0.55))} ${f(0.42 * WING_L)} ${f(-0.34 * h + b(0.2))} ${f(0.16 * WING_L)} 0 0 Z`
    );
  };
  // góc tính từ phương thẳng đứng: 90° = ngang, càng nhỏ càng rủ xuống
  const spec = resting ? { upper: 40, lower: 16 } : { upper: 50, lower: 24 };
  const dL = drop(WING_BEND);
  const dR = drop(-WING_BEND);
  const wing = (side, ang, op) =>
    `<path d="${side === "L" ? dL : dR}" transform="translate(${
      side === "L" ? 110 - WING_OFFSET : 110 + WING_OFFSET
    } ${WING_ROOT_Y}) rotate(${side === "L" ? ang : -ang})" fill="url(#wing-${s})" opacity="${op}"/>`;
  const wingMask =
    `<mask id="wingcut-${s}" maskUnits="userSpaceOnUse" x="0" y="0" width="220" height="252">` +
    `<rect width="220" height="252" fill="#fff"/>` +
    `<g filter="url(#cutsoft-${s})">` +
    `<path d="${BODY_PATH}" fill="#000" stroke="#000" stroke-width="${2 * WING_GAP}" stroke-linejoin="round"/>` +
    `<circle cx="110" cy="${HEAD_CY}" r="${HEAD_R + WING_GAP}" fill="#000"/>` +
    `</g></mask>`;
  const wings = `<g mask="url(#wingcut-${s})">
    ${wing("L", spec.lower, resting ? 0.5 : 0.62)}${wing("R", spec.lower, resting ? 0.5 : 0.62)}
    ${wing("L", spec.upper, resting ? 0.62 : 0.82)}${wing("R", spec.upper, resting ? 0.62 : 0.82)}
  </g>`;

  const sparkles = greeting
    ? `<g stroke="#F5C86B" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".9">
         <path d="M52 52v9M47.5 56.5h9"/><path d="M168 38v9M163.5 42.5h9"/><path d="M178 84v6M175 87h6"/></g>`
    : pose === "glowing"
      ? `<g fill="#F5C86B"><circle cx="50" cy="78" r="1.8" opacity=".8"/><circle cx="172" cy="62" r="1.5" opacity=".7"/><circle cx="180" cy="128" r="2" opacity=".8"/></g>`
      : "";

  const bodyRot = greeting ? `transform="rotate(4 110 130)"` : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" class="fly" viewBox="0 0 220 252" width="${size}" role="img" aria-label="Rangi firefly ${pose}" style="--rangi-glow:1">
  <defs>
    <radialGradient id="halo-${s}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F5A623" stop-opacity=".34"/>
      <stop offset="14%" stop-color="#F5A623" stop-opacity=".28"/>
      <stop offset="28%" stop-color="#F5A623" stop-opacity=".22"/>
      <stop offset="42%" stop-color="#F5A623" stop-opacity=".16"/>
      <stop offset="56%" stop-color="#F5A623" stop-opacity=".11"/>
      <stop offset="70%" stop-color="#F5A623" stop-opacity=".068"/>
      <stop offset="84%" stop-color="#F5A623" stop-opacity=".03"/>
      <stop offset="100%" stop-color="#F5A623" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="halo2-${s}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F5A623" stop-opacity=".10"/>
      <stop offset="40%" stop-color="#F5A623" stop-opacity=".07"/>
      <stop offset="70%" stop-color="#F5A623" stop-opacity=".03"/>
      <stop offset="100%" stop-color="#F5A623" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowblur-${s}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <radialGradient id="body-${s}" cx="50%" cy="52%" r="62%" fx="50%" fy="55%">
      <stop offset="0%" stop-color="#FFF4D2"/>
      <stop offset="32%" stop-color="#FFE29A"/>
      <stop offset="62%" stop-color="#F9B93F"/>
      <stop offset="88%" stop-color="#EF9714"/>
      <stop offset="100%" stop-color="#E8890B"/>
    </radialGradient>
    <radialGradient id="head-${s}" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#FFDF9E"/><stop offset="68%" stop-color="#F5A623"/><stop offset="100%" stop-color="#EE8F0C"/>
    </radialGradient>
    <linearGradient id="wing-${s}" x1="0" y1="0" x2="0" y2="1">
      ${
        light
          ? `<stop offset="0%" stop-color="#8FC3A9" stop-opacity=".8"/>
      <stop offset="55%" stop-color="#7FB99A" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#74B08F" stop-opacity=".18"/>`
          : `<stop offset="0%" stop-color="#CFE4D5" stop-opacity=".55"/>
      <stop offset="55%" stop-color="#C5DECC" stop-opacity=".28"/>
      <stop offset="100%" stop-color="#BFD9C9" stop-opacity=".05"/>`
      }
    </linearGradient>
    <filter id="soft-${s}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.4"/>
    </filter>
    <filter id="cutsoft-${s}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${WING_CUT_SOFT}"/>
    </filter>
    ${wingMask}
  </defs>
  <g ${bodyRot} style="opacity:${resting ? 0.95 : 1}">
    <g style="opacity:calc(0.2 + 0.8*var(--rangi-glow,1))">
      <g filter="url(#glowblur-${s})">
        <circle cx="110" cy="132" r="105" fill="url(#halo2-${s})"/>
        <circle cx="110" cy="132" r="88" fill="url(#halo-${s})"/>
      </g>
      <ellipse cx="110" cy="198" rx="62" ry="13" fill="#F5A623" opacity=".05"/>
    </g>
    ${wings}
    <g opacity="${BODY_OPACITY}">
      <path d="${BODY_PATH}" fill="url(#body-${s})"/>
      <ellipse cx="110" cy="140" rx="7" ry="26" fill="#FFF7E0" filter="url(#soft-${s})"
               style="opacity:calc(0.25 + 0.65*var(--rangi-glow,1))"/>
      <circle cx="110" cy="${HEAD_CY}" r="${HEAD_R}" fill="url(#head-${s})"/>
    </g>
    <g stroke="var(--fly-line,#D9B36A)" stroke-width="2.2" stroke-linecap="round" fill="none">
      <path d="${greeting ? "M104 56 C97 47 88 43 80 45" : "M104 56 C99 49 92 40 84 34"}"/>
      <path d="M116 56 C121 49 128 40 136 34"/>
    </g>
    <circle cx="${greeting ? 79 : 83}" cy="${greeting ? 44.8 : 33.2}" r="2" fill="#F5C86B"/>
    <circle cx="137" cy="33.2" r="2" fill="#F5C86B"/>
  </g>
  ${sparkles}
</svg>`;
}

// ================= Icon bands =================
function iconBands() {
  const NAMES = fs.existsSync(path.join(DIR, "icons/outline"))
    ? fs
        .readdirSync(path.join(DIR, "icons/outline"))
        .filter((f) => f.endsWith(".svg"))
        .map((f) => f.replace(".svg", ""))
        .sort()
    : [];
  if (!NAMES.length) return `<p class="note">— bộ icon v2 đang được subagent vẽ —</p>`;
  const cell = (set, n, small) => {
    const svg = read(path.join(DIR, "icons", set, `${n}.svg`));
    return `<div class="icell${small ? " small" : ""}">${svg}<span class="nm">${small ? "" : n}</span></div>`;
  };
  const band = (set, bg) =>
    `<div class="iband on-${bg}"><h3>${set} · nền ${bg === "dark" ? "đêm rừng" : "kem"} · 26px + hàng 16px</h3>
      <div class="igrid">${NAMES.map((n) => cell(set, n, false)).join("")}</div>
      <div class="sizerow">${NAMES.map((n) => cell(set, n, true)).join("")}</div>
    </div>`;
  return (
    band("outline", "light") +
    band("outline", "dark") +
    band("filled", "light") +
    band("filled", "dark")
  );
}

// ================= Assemble =================
let html = read(path.join(DIR, "mockup-template.html"));
html = html.replace("/*__FONT_CSS__*/", read(path.join(DIR, "fonts/baloo-embed.css")));

const V1 = path.resolve(DIR, "../../../public/brand/mascot/firefly-glowing.svg");
const v1svg = fs.existsSync(V1)
  ? read(V1).replace("<svg ", '<svg width="150" ')
  : "<p>v1 missing</p>";

const BRAND = path.resolve(DIR, "../../../public/brand");
const official = (f, w) =>
  read(path.join(BRAND, f)).replace(
    "<svg ",
    `<svg width="${w}" style="max-width:100%;height:auto" `,
  );

const slots = {
  "<!--__LOGO_DARK__-->": official("rangi-lockup-slogan-en-dark.svg", 460),
  "<!--__LOGO_LIGHT_EN__-->": official("rangi-lockup-slogan-en-light.svg", 320),
  "<!--__LOGO_LIGHT_VN__-->": official("rangi-lockup-slogan-light.svg", 320),
  "<!--__FLY_GLOWING_DARK__-->": firefly("glowing", "gd"),
  "<!--__FLY_RESTING_DARK__-->": firefly("resting", "rd"),
  "<!--__FLY_GREETING_DARK__-->": firefly("greeting", "grd"),
  "<!--__FLY_GLOWING_LIGHT__-->": firefly("glowing", "gl", 190, "light"),
  "<!--__FLY_RESTING_LIGHT__-->": firefly("resting", "rl", 190, "light"),
  "<!--__FLY_GREETING_LIGHT__-->": firefly("greeting", "grl", 190, "light"),
  "<!--__V1_FIREFLY__-->": v1svg,
  "<!--__V2_FIREFLY_SMALL__-->": firefly("glowing", "cmp", 150),
  "<!--__ICON_BANDS__-->": iconBands(),
};
for (const [k, v] of Object.entries(slots)) html = html.replaceAll(k, v);

html = html.replace(
  "</style>",
  ".on-dark{--fly-line:#D9B36A}.on-light{--fly-line:#3F6B58}.cell{--fly-line:#D9B36A}\n</style>",
);

fs.writeFileSync(path.join(DIR, "mockup-rangi-v2.html"), html);

// standalone mascot v2 pose files (dark-bg gradients; bg "light" đổi gradient cánh)
const MASCOT_DIR = path.join(DIR, "mascot-v2");
fs.mkdirSync(MASCOT_DIR, { recursive: true });
for (const pose of ["glowing", "resting", "greeting"]) {
  fs.writeFileSync(
    path.join(MASCOT_DIR, `firefly-${pose}-v2.svg`),
    firefly(pose, `f-${pose}`).trim() + "\n",
  );
  fs.writeFileSync(
    path.join(MASCOT_DIR, `firefly-${pose}-v2-light.svg`),
    firefly(pose, `fl-${pose}`, 190, "light").trim() + "\n",
  );
}
console.log("assembled:", html.length, "bytes + 6 mascot-v2 svg");
