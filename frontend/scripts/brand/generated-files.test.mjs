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
