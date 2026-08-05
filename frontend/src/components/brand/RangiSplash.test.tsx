import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WORDMARK } from "./logo-paths";
import { RangiSplash } from "./RangiSplash";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("prefers-reduced-motion") ? matches : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

describe("RangiSplash", () => {
  it("đường bay kết thúc đúng tọa độ chấm chữ i của generator", () => {
    mockReducedMotion(false);
    const { container } = render(<RangiSplash theme="light" />);
    const mpath = container.querySelector("#splash-flight");
    expect(mpath).not.toBeNull();
    const d = mpath!.getAttribute("d")!;
    expect(d.endsWith(`${WORDMARK.i.dotCx} ${WORDMARK.i.dotCy}`)).toBe(true);
    expect(container.querySelector("animateMotion")).not.toBeNull();
  });
  it("prefers-reduced-motion: không có chuyển động, wordmark hiện tĩnh", () => {
    mockReducedMotion(true);
    const { container } = render(<RangiSplash theme="light" />);
    expect(container.querySelector("animateMotion")).toBeNull();
    expect(screen.getByRole("img", { name: "Rangi" })).toBeDefined();
  });
});
