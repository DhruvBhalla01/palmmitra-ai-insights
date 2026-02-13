import { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

export function renderWithRouter(
  ui: ReactElement,
  { route = "/" }: { route?: string } = {}
) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
