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
  "learner-profile",
  "settings",
  "calendar",
].sort();
export const MASCOT_MANIFEST = [
  "firefly-glowing",
  "firefly-glowing-light",
  "firefly-resting",
  "firefly-resting-light",
  "firefly-greeting",
  "firefly-greeting-light",
].sort();

// Mascot v2 (06/08/2026): soft illustrated — gradient nhiều bậc trong họ amber/mint,
// hex trần được phép (nằm trong gradient stop), khác quy tắc var()-only của icon.
const WHITELIST = {
  outline: ["#F5A623"],
  filled: ["#F5A623"],
  mascot: [
    "#F5A623",
    "#FFF4D2",
    "#FFE29A",
    "#F9B93F",
    "#EF9714",
    "#E8890B",
    "#FFDF9E",
    "#EE8F0C",
    "#FFF7E0",
    "#F5C86B",
    "#D9B36A",
    "#CFE4D5",
    "#C5DECC",
    "#BFD9C9",
    "#8FC3A9",
    "#7FB99A",
    "#74B08F",
  ],
};
const VIEWBOX = {
  outline: "0 0 24 24",
  filled: "0 0 24 24",
  mascot: "0 0 220 252",
};

export function checkSvg(name, content, kind) {
  const errors = [];
  const manifest = kind === "mascot" ? MASCOT_MANIFEST : ICON_MANIFEST;
  if (!manifest.includes(name)) errors.push(`${name}: tên không thuộc manifest ${kind}`);
  if (!content.includes(`viewBox="${VIEWBOX[kind]}"`))
    errors.push(`${name}: viewBox phải là "${VIEWBOX[kind]}"`);
  if (kind === "outline") {
    if (!content.includes('stroke="currentColor"'))
      errors.push(`${name}: outline phải stroke="currentColor"`);
    if (!content.includes('fill="none"')) errors.push(`${name}: outline phải fill="none" ở root`);
    if (!content.includes('stroke-width="1.75"'))
      errors.push(`${name}: outline phải stroke-width="1.75"`);
  }
  if (kind === "filled" && !content.includes('fill="currentColor"'))
    errors.push(`${name}: filled phải fill="currentColor"`);
  // mọi hex phải thuộc whitelist VÀ nằm trong fallback của var(--…)
  const hexes = content.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  for (const hex of hexes) {
    if (!WHITELIST[kind].includes(hex.toUpperCase()) && !WHITELIST[kind].includes(hex))
      errors.push(`${name}: hex ${hex} ngoài whitelist ${kind}`);
  }
  // icon: hex chỉ được nằm trong fallback var(--…); mascot v2 miễn rule này
  // (gradient stop cần hex trần — whitelist ở trên vẫn khóa bảng màu)
  if (kind !== "mascot") {
    const naked = content.replace(/var\(--[a-z-]+,\s*#[0-9a-fA-F]{3,8}\)/g, "");
    if (/#[0-9a-fA-F]{3,8}\b/.test(naked))
      errors.push(`${name}: có hex trần không bọc trong var(--…, fallback)`);
  }
  return errors;
}

export function checkDir(dir, kind, manifest) {
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
    errors.push(...checkSvg(f, fs.readFileSync(path.join(dir, `${f}.svg`), "utf8"), kind));
  }
  return errors;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const FE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const all = [
    ...checkDir(path.join(FE, "public/brand/icons/outline"), "outline", ICON_MANIFEST),
    ...checkDir(path.join(FE, "public/brand/icons/filled"), "filled", ICON_MANIFEST),
    ...checkDir(path.join(FE, "public/brand/mascot"), "mascot", MASCOT_MANIFEST),
  ];
  if (all.length) {
    console.error(`brand:check FAIL (${all.length} lỗi):\n- ` + all.join("\n- "));
    process.exit(1);
  }
  console.log(
    `brand:check PASS: ${ICON_MANIFEST.length * 2} icon + ${MASCOT_MANIFEST.length} mascot đạt chuẩn`,
  );
}
