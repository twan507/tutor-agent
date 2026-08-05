import { render, screen, waitFor } from "@testing-library/react";
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
  it("sau khi mount, đường bay kết thúc đúng tọa độ chấm chữ i của generator", async () => {
    mockReducedMotion(false);
    const { container } = render(<RangiSplash theme="light" />);
    // SSR/first paint luôn tĩnh — nhánh động chỉ bật sau effect mount.
    await waitFor(() => {
      expect(container.querySelector("animateMotion")).not.toBeNull();
    });
    const mpath = container.querySelector("#splash-flight");
    expect(mpath).not.toBeNull();
    const d = mpath!.getAttribute("d")!;
    expect(d.endsWith(`${WORDMARK.i.dotCx} ${WORDMARK.i.dotCy}`)).toBe(true);
  });
  it("animate={false} → luôn tĩnh kể cả sau mount, không có animateMotion", async () => {
    mockReducedMotion(false);
    const { container } = render(<RangiSplash theme="light" animate={false} />);
    // Chờ qua mốc mount để chắc chắn không có nâng cấp sang nhánh động.
    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Rangi" })).toBeDefined();
    });
    expect(container.querySelector("animateMotion")).toBeNull();
    expect(container.querySelector("#splash-flight")).toBeNull();
  });
  it("prefers-reduced-motion: không có chuyển động, wordmark hiện tĩnh", () => {
    mockReducedMotion(true);
    const { container } = render(<RangiSplash theme="light" />);
    expect(container.querySelector("animateMotion")).toBeNull();
    expect(screen.getByRole("img", { name: "Rangi" })).toBeDefined();
  });
});
