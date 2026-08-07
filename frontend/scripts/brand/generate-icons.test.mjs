import { describe, expect, it } from "vitest";
import { buildFilled, buildOutline, resolveBody } from "./generate-icons.mjs";

const SET = {
  icons: {
    demo: { body: '<path fill="none" stroke="currentColor" stroke-width="2" d="M1 1h2"/>' },
    "demo-filled": { body: '<path fill="currentColor" d="M1 1h2z"/>' },
    real: { body: '<path fill="none" stroke="currentColor" stroke-width="2" d="M0 0"/>' },
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
    expect(() => buildOutline("lesson", "khong-co", SET)).toThrow(/lesson/);
    expect(() => buildOutline("lesson", "khong-co", SET)).toThrow(/khong-co/);
  });
});

describe("buildFilled", () => {
  it("dùng bản -filled và giữ fill currentColor", () => {
    const svg = buildFilled("lesson", "demo", SET);
    expect(svg).toContain('fill="currentColor"');
    expect(svg).toContain('d="M1 1h2z"');
    expect(svg).toContain('aria-label="lesson"');
  });
  it("ném lỗi khi manifest đòi filled mà bộ nguồn không có", () => {
    expect(() => buildFilled("lesson", "real", SET)).toThrow(/real-filled/);
  });
});
