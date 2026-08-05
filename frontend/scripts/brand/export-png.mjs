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
