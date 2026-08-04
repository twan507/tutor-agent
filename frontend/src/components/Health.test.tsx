import { render, screen } from "@testing-library/react";
import { Health } from "./Health";

test("hiển thị trạng thái API được truyền vào", () => {
  render(<Health status="ok" />);
  expect(screen.getByTestId("health-status")).toHaveTextContent("API: ok");
});
