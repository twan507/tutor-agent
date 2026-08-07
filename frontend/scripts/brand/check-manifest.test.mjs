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
