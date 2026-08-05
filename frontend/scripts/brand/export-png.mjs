import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BRAND = path.resolve(__dirname, "../../public/brand");
const OUT = path.join(BRAND, "png");
fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  ...[16, 32, 48, 180, 192, 512].map((sz) => ({
    src: "rangi-icon-dark.svg",
    out: `icon-${sz}.png`,
    w: sz,
    h: sz,
    icon: true,
  })),
  { src: "og-image.svg", out: "og-image.png", w: 1200, h: 630 },
  { src: "rangi-icon-dark.svg", out: "avatar-400.png", w: 400, h: 400, icon: true },
];

for (const j of jobs) {
  const buf = fs.readFileSync(path.join(BRAND, j.src));
  // rangi-icon-*.svg has a 48-unit viewBox — rasterizing icon jobs at a
  // fixed density=300 upscales from a 200px raster for large targets
  // (icon-512, avatar-400), producing soft/blurry output. Scale density to
  // the target size instead. og-image.svg is already authored at 1200
  // units, so the default density=72 is sufficient there.
  const density = j.icon ? Math.ceil(72 * (j.w / 48)) : 72;
  await sharp(buf, { density }).resize(j.w, j.h).png().toFile(path.join(OUT, j.out));
  const meta = await sharp(path.join(OUT, j.out)).metadata();
  if (meta.width !== j.w || meta.height !== j.h)
    throw new Error(`${j.out}: ${meta.width}x${meta.height} != ${j.w}x${j.h}`);
  console.log("ok:", j.out, `${j.w}x${j.h}`);
}
