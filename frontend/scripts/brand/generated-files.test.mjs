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
