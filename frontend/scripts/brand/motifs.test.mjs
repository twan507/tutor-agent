import { describe, expect, it } from "vitest";
import { flightPathD, flightPathEl, sparkEl } from "./motifs.mjs";

describe("flightPathD", () => {
  it("là đường cong quadratic đi từ from tới to", () => {
    const d = flightPathD({ from: [0, 100], to: [200, 40], curve: 60 });
    expect(d).toBe("M 0 100 Q 100 10, 200 40");
  });
});

describe("flightPathEl", () => {
  it("phát ra path nét đứt bo tròn dùng currentColor", () => {
    const el = flightPathEl({ from: [0, 100], to: [200, 40], curve: 60 });
    expect(el).toContain('stroke-dasharray="1 7"');
    expect(el).toContain('stroke="currentColor"');
    expect(el).toContain('stroke-linecap="round"');
    expect(el).toContain('fill="none"');
    expect(el).toContain('d="M 0 100 Q 100 10, 200 40"');
  });
  it("cho override màu và id", () => {
    const el = flightPathEl({
      from: [0, 0],
      to: [10, 0],
      curve: 5,
      stroke: "#F5A623",
      id: "flight-path",
    });
    expect(el).toContain('id="flight-path"');
    expect(el).toContain('stroke="#F5A623"');
  });
});

describe("sparkEl", () => {
  it("phát ra đốm sáng + quầng với id cố định", () => {
    const el = sparkEl({ cx: 10, cy: 20, r: 4, haloR: 9, haloOp: 0.25 });
    expect(el).toContain('id="flight-spark"');
    expect(el).toContain('cx="10"');
    expect(el).toContain('r="9"'); // quầng
    expect(el).toContain('r="4"'); // đốm
  });
});
