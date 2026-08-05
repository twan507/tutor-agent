import { render, screen } from "@testing-library/react";
import { RangiLogo } from "./RangiLogo";

function dot(container: HTMLElement) {
  return container.querySelector("circle[data-part=dot]")!;
}
function halo(container: HTMLElement) {
  return container.querySelector("circle[data-part=halo]");
}

test("render wordmark với aria-label", () => {
  render(<RangiLogo variant="wordmark" theme="dark" title="Rangi" />);
  expect(screen.getByRole("img", { name: "Rangi" })).toBeInTheDocument();
});

test("progress cao hơn làm chấm to hơn và quầng đậm hơn", () => {
  const a = render(<RangiLogo variant="wordmark" theme="dark" progress={0.2} />);
  const rLow = Number(dot(a.container).getAttribute("r"));
  const oLow = Number(halo(a.container)!.getAttribute("opacity"));
  a.unmount();
  const b = render(<RangiLogo variant="wordmark" theme="dark" progress={0.9} />);
  expect(Number(dot(b.container).getAttribute("r"))).toBeGreaterThan(rLow);
  expect(Number(halo(b.container)!.getAttribute("opacity"))).toBeGreaterThan(oLow);
});

test("progress 0 là trạng thái nghỉ trung tính: chấm mờ, không quầng", () => {
  const { container } = render(<RangiLogo variant="wordmark" theme="dark" progress={0} />);
  expect(Number(dot(container).getAttribute("opacity"))).toBeCloseTo(0.35);
  expect(halo(container)).toBeNull();
});

test("mono-white: mọi fill là #FFFFFF và không có quầng", () => {
  const { container } = render(<RangiLogo variant="wordmark" theme="mono-white" />);
  expect(halo(container)).toBeNull();
  const fills = [...container.querySelectorAll("[fill]")].map((e) => e.getAttribute("fill"));
  expect(fills.every((f) => f === "#FFFFFF")).toBe(true);
});

test("animated=false không gắn class breath", () => {
  const { container } = render(<RangiLogo variant="icon" theme="dark" animated={false} />);
  expect(container.querySelector("svg")!.className.baseVal).not.toMatch(/breath/);
});
