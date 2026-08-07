// Sinh bộ icon từ @iconify-json/tabler theo icon-manifest.mjs.
// KHÔNG sửa hình học path — chỉ đổi độ dày nét về chuẩn brand rồi bọc svg.
// Thiếu icon nguồn hoặc thiếu bản -filled thì NÉM LỖI, không im lặng bỏ qua:
// đó là hàng rào ngăn việc quay lại tự vẽ.
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
  if (alias?.parent && set.icons[alias.parent]) return set.icons[alias.parent].body;
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
    throw new Error(`khái niệm "${concept}": icon nguồn "${tablerName}" không có trong bộ Tabler`);
  return wrap(concept, body.replaceAll('stroke-width="2"', `stroke-width="${STROKE}"`));
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
  writePreview();
  console.log(`brand:icons — đã sinh ${n} file từ ${Object.keys(ICONS).length} khái niệm`);
}

// Trang preview mở bằng file:// nên không import/fetch được file cục bộ —
// danh sách phải nằm sẵn trong HTML, vì vậy trang này cũng là file sinh ra.
function writePreview() {
  const tplPath = path.join(DIR, "preview-icons.template.html");
  if (!fs.existsSync(tplPath)) return;
  const groups = {};
  for (const [concept, def] of Object.entries(ICONS)) (groups[def.group] ??= []).push(concept);
  const html = fs
    .readFileSync(tplPath, "utf8")
    .replace("/*__GROUPS__*/", JSON.stringify(groups, null, 2));
  fs.writeFileSync(path.join(DIR, "preview-icons.html"), html);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
